const AMEN = new Set(['1', 'amen', '🙏']);
const WISDOM = new Set(['2', 'wisdom']);
const DEVOTIONAL = new Set(['3', 'devotional']);
const RETIRE = new Set(['4', 'retire']);

function normalize(text) {
  return String(text || '').trim().toLowerCase();
}

function classifyReply(text) {
  const key = normalize(text);
  if (!key) return null;
  if (AMEN.has(key)) return { type: 'amen' };
  if (WISDOM.has(key)) return { type: 'wisdom' };
  if (DEVOTIONAL.has(key)) return { type: 'devotional' };
  if (RETIRE.has(key)) return { type: 'retire' };
  return null;
}

module.exports = { classifyReply };
