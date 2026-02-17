const { execFile } = require('child_process');

const DISPATCHER = '/home/james/.openclaw/workspace/shared/signal_dispatcher.py';

function publishSignalInbound({ from, text, target = '', source = 'dailyverse' }) {
  return new Promise((resolve, reject) => {
    const args = [DISPATCHER, 'publish', '--channel', 'signal', '--from', String(from || ''), '--text', String(text || ''), '--target', String(target), '--source', source];
    execFile('python3', args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`dispatcher publish failed: ${stderr || error.message}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

module.exports = { publishSignalInbound };
