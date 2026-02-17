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

module.exports = { fetchVerseByReference };
