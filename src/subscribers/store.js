const fs = require('fs');
const path = require('path');

function readSubscribers(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) return [];
  const raw = fs.readFileSync(resolved, 'utf8').trim();
  if (!raw) return [];
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function getActiveSubscriberPhones(filePath) {
  return readSubscribers(filePath)
    .filter((s) => s && s.active && typeof s.phone === 'string')
    .map((s) => s.phone.trim())
    .filter(Boolean);
}

module.exports = { readSubscribers, getActiveSubscriberPhones };
