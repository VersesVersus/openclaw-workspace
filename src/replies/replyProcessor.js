const { classifyReply } = require('./replyClassifier');
const { getLatestDeliveryForRecipient } = require('../delivery/historyStore');
const { markAmen, retireVerse } = require('../verses/rotationStore');
const { generateWisdomResponse, generateDevotionalMessage } = require('./contentGenerators');
const { enqueueDevotional, listDueItems, markSent } = require('./devotionalQueue');
const { getZonedParts, toDateKey, formatNowForHumans } = require('../time/localTime');

async function processInboundReply(message, config, sendMessage) {
  const action = classifyReply(message.text);
  if (!action) return { ignored: true, reason: 'unrecognized' };

  const latest = getLatestDeliveryForRecipient(config.deliveryLogFile, message.from);
  if (!latest) {
    await sendMessage(message.from, 'I received your reply, but I do not have a recent verse on record for this number yet.');
    return { ignored: false, reason: 'missing-latest-verse' };
  }

  const nowParts = getZonedParts(new Date(), config.timezone);
  const dateKey = toDateKey(nowParts);

  if (action.type === 'amen') {
    const meta = markAmen(config.verseFeedbackFile, latest.reference, dateKey);
    await sendMessage(
      message.from,
      `✅ Amen received for ${latest.reference}. Marked as a key verse on ${dateKey} and boosted in future rotation (Amen count: ${meta.amenCount}).`
    );
    return { action: 'amen', reference: latest.reference };
  }

  if (action.type === 'wisdom') {
    const wisdom = generateWisdomResponse(latest);
    await sendMessage(message.from, wisdom);
    return { action: 'wisdom', reference: latest.reference };
  }

  if (action.type === 'devotional') {
    const devotional = generateDevotionalMessage(latest);
    const nowHour = nowParts.hour;

    if (nowHour >= config.devotionalImmediateAfterHour) {
      await sendMessage(message.from, devotional);
      return { action: 'devotional-immediate', reference: latest.reference };
    }

    const queued = enqueueDevotional(config.devotionalQueueFile, {
      to: message.from,
      reference: latest.reference,
      text: devotional,
      dueDate: dateKey,
      dueHour: config.earlyEveningHour,
      dueMinute: 0
    });

    await sendMessage(
      message.from,
      `🗓️ Devotional queued for early evening today around ${String(config.earlyEveningHour).padStart(2, '0')}:00 (${config.timezone}). Queue id: ${queued.id}`
    );
    return { action: 'devotional-queued', reference: latest.reference, queueId: queued.id };
  }

  if (action.type === 'retire') {
    retireVerse(config.verseFeedbackFile, latest.reference, new Date().toISOString());
    await sendMessage(
      message.from,
      `🛑 Retired ${latest.reference} from rotation. It will no longer be selected for future random deliveries.`
    );
    return { action: 'retire', reference: latest.reference };
  }

  return { ignored: true, reason: 'no-handler' };
}

async function processDueDevotionals(config, sendMessage) {
  const now = new Date();
  const nowParts = getZonedParts(now, config.timezone);
  const nowDateKey = toDateKey(nowParts);
  const dueItems = listDueItems(config.devotionalQueueFile, nowParts, nowDateKey);

  if (dueItems.length === 0) return { sent: 0 };

  let sent = 0;
  for (const item of dueItems) {
    await sendMessage(item.to, item.text);
    markSent(config.devotionalQueueFile, item.id);
    sent += 1;
  }

  return { sent, checkedAt: formatNowForHumans(config.timezone) };
}

module.exports = { processInboundReply, processDueDevotionals };
