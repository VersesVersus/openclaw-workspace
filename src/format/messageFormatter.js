function formatVerseMessage(verse) {
  return [
    '📖 Daily Verse',
    '',
    `"${verse.text}"`,
    `— ${verse.reference}`,
    '',
    'Reply STOP anytime to opt out.'
  ].join('\n');
}

module.exports = { formatVerseMessage };
