const { readJson, writeJson } = require('../storage/jsonStore');

function emptyState() {
  return { verses: {} };
}

function normalize(reference) {
  return String(reference || '').trim();
}

function loadRotationState(filePath) {
  const state = readJson(filePath, emptyState);
  if (!state || typeof state !== 'object') return emptyState();
  if (!state.verses || typeof state.verses !== 'object') state.verses = {};
  return state;
}

function saveRotationState(filePath, state) {
  writeJson(filePath, state);
}

function ensureVerseMeta(state, reference) {
  const key = normalize(reference);
  if (!state.verses[key]) {
    state.verses[key] = {
      amenCount: 0,
      key: false,
      retired: false,
      lastAmenDate: null,
      retiredAt: null
    };
  }
  return state.verses[key];
}

function getWeight(meta) {
  if (!meta || meta.retired) return 0;
  return 1 + (meta.amenCount || 0) * 3 + (meta.key ? 2 : 0);
}

function pickWeightedReference(referenceList, state) {
  const eligible = referenceList
    .map((ref) => {
      const meta = state.verses[normalize(ref)] || null;
      return { ref, weight: getWeight(meta) || 1, retired: Boolean(meta && meta.retired) };
    })
    .filter((row) => !row.retired);

  if (eligible.length === 0) {
    throw new Error('All verses in rotation are retired. Add more references or un-retire a verse.');
  }

  const total = eligible.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.random() * total;

  for (const row of eligible) {
    roll -= row.weight;
    if (roll <= 0) return row.ref;
  }

  return eligible[eligible.length - 1].ref;
}

function markAmen(filePath, reference, dateKey) {
  const state = loadRotationState(filePath);
  const meta = ensureVerseMeta(state, reference);
  meta.amenCount = (meta.amenCount || 0) + 1;
  meta.key = true;
  meta.retired = false;
  meta.lastAmenDate = dateKey;
  saveRotationState(filePath, state);
  return meta;
}

function retireVerse(filePath, reference, retiredAt) {
  const state = loadRotationState(filePath);
  const meta = ensureVerseMeta(state, reference);
  meta.retired = true;
  meta.retiredAt = retiredAt;
  saveRotationState(filePath, state);
  return meta;
}

module.exports = {
  loadRotationState,
  pickWeightedReference,
  markAmen,
  retireVerse
};
