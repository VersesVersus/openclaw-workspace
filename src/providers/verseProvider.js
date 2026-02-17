const seedReferences = require('../data/seedReferences');

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function fetchVerseByReference(reference, bibleApiBaseUrl) {
  const url = `${bibleApiBaseUrl}/${encodeURIComponent(reference)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Bible API request failed (${res.status})`);
  }
  const payload = await res.json();
  const text = (payload.text || '').trim().replace(/\s+/g, ' ');
  const ref = payload.reference || reference;
  if (!text) throw new Error('Bible API returned empty verse text');
  return { text, reference: ref, sourceUrl: url };
}

async function getRandomVerse(bibleApiBaseUrl) {
  const reference = randomFrom(seedReferences);
  return fetchVerseByReference(reference, bibleApiBaseUrl);
}

module.exports = { getRandomVerse };
