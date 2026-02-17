const { readJson, writeJson } = require('../storage/jsonStore');

function emptyQueue() {
  return { items: [] };
}

function loadQueue(filePath) {
  const data = readJson(filePath, emptyQueue);
  if (!Array.isArray(data.items)) data.items = [];
  return data;
}

function saveQueue(filePath, queue) {
  writeJson(filePath, queue);
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function enqueueDevotional(filePath, item) {
  const queue = loadQueue(filePath);
  const queued = { id: createId(), status: 'pending', createdAt: new Date().toISOString(), ...item };
  queue.items.push(queued);
  saveQueue(filePath, queue);
  return queued;
}

function isDue(item, nowParts, nowDateKey) {
  if (item.status !== 'pending') return false;
  if (!item.dueDate) return false;
  if (item.dueDate < nowDateKey) return true;
  if (item.dueDate > nowDateKey) return false;

  const dueHour = Number(item.dueHour || 18);
  const dueMinute = Number(item.dueMinute || 0);

  if (nowParts.hour > dueHour) return true;
  if (nowParts.hour < dueHour) return false;
  return nowParts.minute >= dueMinute;
}

function listDueItems(filePath, nowParts, nowDateKey) {
  const queue = loadQueue(filePath);
  return queue.items.filter((item) => isDue(item, nowParts, nowDateKey));
}

function markSent(filePath, itemId) {
  const queue = loadQueue(filePath);
  const item = queue.items.find((x) => x.id === itemId);
  if (!item) return null;
  item.status = 'sent';
  item.sentAt = new Date().toISOString();
  saveQueue(filePath, queue);
  return item;
}

module.exports = { enqueueDevotional, listDueItems, markSent };
