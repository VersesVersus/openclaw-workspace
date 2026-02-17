const { getConfig } = require('./config/env');
const seedReferences = require('./data/seedReferences');
const { fetchVerseByReference } = require('./providers/verseProvider');
const { formatVerseMessage } = require('./format/messageFormatter');
const { getActiveSubscriberPhones } = require('./subscribers/store');
const { sendSignalMessage, receiveSignalMessages } = require('./integrations/signalCli');
const { scheduleDaily } = require('./scheduler/dailyScheduler');
const { loadRotationState, pickWeightedReference } = require('./verses/rotationStore');
const { logDelivery } = require('./delivery/historyStore');
const { processInboundReply, processDueDevotionals } = require('./replies/replyProcessor');

function dedupe(list) {
  return [...new Set(list.map((x) => x.trim()).filter(Boolean))];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeNumber(value) {
  return String(value || '').replace(/[^\d+]/g, '');
}

async function sendWithRetry(sendFn, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await sendFn();
    } catch (err) {
      lastErr = err;
      if (i < attempts) await wait(1000 * i);
    }
  }
  throw lastErr;
}

async function sendMessage(config, to, message, dryRun = false) {
  return sendWithRetry(
    () =>
      sendSignalMessage({
        signalCliPath: config.signalCliPath,
        account: config.signalAccount,
        to,
        message,
        dryRun
      }),
    3
  );
}

function resolveRecipients(config) {
  return dedupe([...config.recipientsFromEnv, ...getActiveSubscriberPhones(config.subscribersFile)]);
}

async function runDelivery(config, { dryRun = false } = {}) {
  const recipients = resolveRecipients(config);

  if (recipients.length === 0) {
    throw new Error('No recipients configured. Set SIGNAL_RECIPIENTS or activate entries in data/subscribers.json');
  }

  const rotationState = loadRotationState(config.verseFeedbackFile);
  const reference = pickWeightedReference(seedReferences, rotationState);
  const verse = await fetchVerseByReference(reference, config.bibleApiBaseUrl);
  const message = formatVerseMessage(verse);

  console.log(`Preparing delivery for ${recipients.length} recipient(s): ${verse.reference}`);

  const results = [];
  for (const to of recipients) {
    try {
      await sendMessage(config, to, message, dryRun);
      if (!dryRun) {
        logDelivery(config.deliveryLogFile, {
          to,
          verse,
          sentAt: new Date().toISOString()
        });
      }

      results.push({ to, ok: true });
      console.log(`✅ Delivered to ${to}${dryRun ? ' (dry-run)' : ''}`);
    } catch (error) {
      results.push({ to, ok: false, error: error.message });
      console.error(`❌ Failed for ${to}: ${error.message}`);
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;
  console.log(`Delivery complete. Success: ${okCount}, Failed: ${failCount}`);

  if (failCount > 0) process.exitCode = 1;
  return { verse, results };
}

async function pollIncomingRepliesOnce(config) {
  const messages = await receiveSignalMessages({
    signalCliPath: config.signalCliPath,
    account: config.signalAccount,
    timeoutSeconds: config.replyPollReceiveTimeoutSeconds
  });

  if (messages.length === 0) return { polled: 0, processed: 0 };

  let processed = 0;
  const ownNumber = normalizeNumber(config.signalAccount);

  for (const msg of messages) {
    if (msg.groupId) continue;
    if (normalizeNumber(msg.from) === ownNumber) continue;

    const result = await processInboundReply(msg, config, async (to, text) => {
      await sendMessage(config, to, text, false);
    });

    if (!result.ignored) processed += 1;
  }

  return { polled: messages.length, processed };
}

async function processDevotionalQueueOnce(config) {
  return processDueDevotionals(config, async (to, text) => {
    await sendMessage(config, to, text, false);
  });
}

function startReplyPolling(config) {
  const intervalMs = Math.max(15, config.replyPollIntervalSeconds) * 1000;
  let busy = false;

  setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const stats = await pollIncomingRepliesOnce(config);
      if (stats.processed > 0) {
        console.log(`Processed ${stats.processed} actionable reply/replies from ${stats.polled} inbound message(s).`);
      }
    } catch (error) {
      console.error(`Reply polling failed: ${error.message}`);
    } finally {
      busy = false;
    }
  }, intervalMs);

  console.log(`Reply polling enabled every ${Math.round(intervalMs / 1000)}s.`);
}

function startDevotionalQueueWorker(config) {
  const intervalMs = 60 * 1000;
  let busy = false;

  setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const result = await processDevotionalQueueOnce(config);
      if (result.sent > 0) {
        console.log(`Sent ${result.sent} queued devotional message(s).`);
      }
    } catch (error) {
      console.error(`Devotional queue worker failed: ${error.message}`);
    } finally {
      busy = false;
    }
  }, intervalMs);

  console.log('Devotional queue worker enabled (checks every 60s).');
}

async function main() {
  const config = getConfig();
  const args = new Set(process.argv.slice(2));
  const once = args.has('--once');
  const dryRun = args.has('--dry-run');
  const pollOnce = args.has('--poll-once');
  const queueOnce = args.has('--queue-once');

  if (once) {
    await runDelivery(config, { dryRun });
    return;
  }

  if (pollOnce) {
    const stats = await pollIncomingRepliesOnce(config);
    console.log(`Inbound poll complete. Polled: ${stats.polled}, Processed: ${stats.processed}`);
    return;
  }

  if (queueOnce) {
    const stats = await processDevotionalQueueOnce(config);
    console.log(`Queue check complete. Sent: ${stats.sent || 0}`);
    return;
  }

  scheduleDaily({
    hour: config.deliveryHour,
    minute: config.deliveryMinute,
    task: () => runDelivery(config, { dryRun: false }),
    onScheduled: (firstRunAt) => {
      console.log(`DailyVerse scheduler running. First delivery at ${firstRunAt.toString()}`);
    }
  });

  startReplyPolling(config);
  startDevotionalQueueWorker(config);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
