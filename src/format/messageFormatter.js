function formatVerseMessage(verse) {
  return [
    '📖 Daily Verse',
    '',
    `"${verse.text}"`,
    `— ${verse.reference}`,
    '',
    'Reply with one number:',
    '1) Amen',
    '2) Wisdom',
    '3) Devotional',
    '4) Retire',
    '',
    'Reply STOP anytime to opt out.'
  ].join('\n');
}

module.exports = { formatVerseMessage };
