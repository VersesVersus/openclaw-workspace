const fs = require('fs');
const path = require('path');

function resolvePath(filePath) {
  return path.resolve(process.cwd(), filePath);
}

function ensureParentDir(filePath) {
  const resolved = resolvePath(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

function readJson(filePath, fallbackValue) {
  const resolved = resolvePath(filePath);
  if (!fs.existsSync(resolved)) {
    return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
  }

  const raw = fs.readFileSync(resolved, 'utf8').trim();
  if (!raw) return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;

  try {
    return JSON.parse(raw);
  } catch {
    return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
  }
}

function writeJson(filePath, value) {
  const resolved = ensureParentDir(filePath);
  const tmpPath = `${resolved}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2));
  fs.renameSync(tmpPath, resolved);
}

module.exports = { readJson, writeJson };
