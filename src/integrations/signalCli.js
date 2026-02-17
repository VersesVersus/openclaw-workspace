const { execFile } = require('child_process');

function runSignalCli(signalCliPath, args) {
  return new Promise((resolve, reject) => {
    execFile(signalCliPath, args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`signal-cli failed: ${stderr || error.message}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function sendSignalMessage({ signalCliPath, account, to, message, dryRun = false }) {
  if (!to) throw new Error('Recipient is required');

  if (dryRun) {
    return { dryRun: true, to };
  }

  if (!account) throw new Error('SIGNAL_ACCOUNT is required');

  const args = ['-a', account, 'send', '-m', message, to];
  return runSignalCli(signalCliPath, args);
}

function extractIncomingMessage(line) {
  const payload = JSON.parse(line);
  const envelope = payload.envelope || payload;
  const dataMessage = envelope.dataMessage || {};

  const from = envelope.sourceNumber || envelope.source || payload.sourceNumber || null;
  const text = dataMessage.message || payload.message || '';
  const groupId = dataMessage.groupInfo && dataMessage.groupInfo.groupId ? dataMessage.groupInfo.groupId : null;

  if (!from || !text) return null;

  return {
    id: envelope.timestamp || payload.timestamp || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    from,
    text: String(text).trim(),
    groupId,
    raw: payload
  };
}

async function receiveSignalMessages({ signalCliPath, account, timeoutSeconds = 5 }) {
  if (!account) return [];

  const args = ['-a', account, 'receive', '--json', '--timeout', String(timeoutSeconds)];
  const { stdout } = await runSignalCli(signalCliPath, args);

  const lines = String(stdout || '')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const messages = [];
  for (const line of lines) {
    try {
      const parsed = extractIncomingMessage(line);
      if (parsed) messages.push(parsed);
    } catch {
      // ignore non-json or unrecognized lines from signal-cli output
    }
  }

  return messages;
}

module.exports = { sendSignalMessage, receiveSignalMessages };
