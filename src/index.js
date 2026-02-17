const { getConfig } = require('./config/env');
const { getRandomVerse } = require('./providers/verseProvider');
const { formatVerseMessage } = require('./format/messageFormatter');
const { getActiveSubscriberPhones } = require('./subscribers/store');
const { sendSignalMessage } = require('./integrations/signalCli');
const { scheduleDaily } = require('./scheduler/dailyScheduler');

function dedupe(list) {
  return [...new Set(list.map((x) => x.trim()).filter(Boolean))];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

async function runDelivery(config, { dryRun = false } = {}) {
  const recipients = dedupe([
    ...config.recipientsFromEnv,
    ...getActiveSubscriberPhones(config.subscribersFile)
  ]);

  if (recipients.length === 0) {
    throw new Error('No recipients configured. Set SIGNAL_RECIPIENTS or activate entries in data/subscribers.json');
  }

  const verse = await getRandomVerse(config.bibleApiBaseUrl);
  const message = formatVerseMessage(verse);

  console.log(`Preparing delivery for ${recipients.length} recipient(s): ${verse.reference}`);

  const results = [];
  for (const to of recipients) {
    try {
      await sendWithRetry(
        () => sendSignalMessage({
          signalCliPath: config.signalCliPath,
          account: config.signalAccount,
          to,
          message,
          dryRun
        }),
        3
      );
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

async function main() {
  const config = getConfig();
  const args = new Set(process.argv.slice(2));
  const once = args.has('--once');
  const dryRun = args.has('--dry-run');

  if (once) {
    await runDelivery(config, { dryRun });
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
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
