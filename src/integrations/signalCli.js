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

module.exports = { sendSignalMessage };
