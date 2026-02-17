const { readJson, writeJson } = require('../storage/jsonStore');

function emptyHistory() {
  return { deliveries: [], latestByRecipient: {} };
}

function loadHistory(filePath) {
  const data = readJson(filePath, emptyHistory);
  if (!data.deliveries || !Array.isArray(data.deliveries)) data.deliveries = [];
  if (!data.latestByRecipient || typeof data.latestByRecipient !== 'object') data.latestByRecipient = {};
  return data;
}

function saveHistory(filePath, history) {
  writeJson(filePath, history);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function logDelivery(filePath, { to, verse, sentAt }) {
  const history = loadHistory(filePath);

  const entry = {
    id: makeId(),
    to,
    sentAt,
    reference: verse.reference,
    text: verse.text
  };

  history.deliveries.push(entry);
  history.latestByRecipient[to] = {
    id: entry.id,
    sentAt: entry.sentAt,
    reference: entry.reference,
    text: entry.text
  };

  if (history.deliveries.length > 5000) {
    history.deliveries = history.deliveries.slice(-5000);
  }

  saveHistory(filePath, history);
  return entry;
}

function getLatestDeliveryForRecipient(filePath, recipient) {
  const history = loadHistory(filePath);
  return history.latestByRecipient[recipient] || null;
}

module.exports = { logDelivery, getLatestDeliveryForRecipient };
