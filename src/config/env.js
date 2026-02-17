const fs = require('fs');
const path = require('path');

function loadDotEnv(filePath = path.resolve(process.cwd(), '.env')) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseList(value) {
  return (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function intFromEnv(name, fallback) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) ? v : fallback;
}

function getConfig() {
  loadDotEnv();

  return {
    signalCliPath: process.env.SIGNAL_CLI_PATH || 'signal-cli',
    signalAccount: process.env.SIGNAL_ACCOUNT || null,
    recipientsFromEnv: parseList(process.env.SIGNAL_RECIPIENTS),
    deliveryHour: intFromEnv('DELIVERY_HOUR', 9),
    deliveryMinute: intFromEnv('DELIVERY_MINUTE', 0),
    bibleApiBaseUrl: process.env.BIBLE_API_BASE_URL || 'https://bible-api.com',
    subscribersFile: process.env.SUBSCRIBERS_FILE || 'data/subscribers.json'
  };
}

module.exports = { getConfig };
