const referenceProfiles = {
  'Proverbs 3:5-6': {
    crossRefs: ['Psalm 37:5', 'James 1:5', 'Romans 8:28'],
    words: [
      { term: 'בָּטַח (batach)', language: 'Hebrew', meaning: 'to trust with confident security' },
      { term: 'יָשַׁר (yashar)', language: 'Hebrew', meaning: 'to make straight, to level a path' }
    ]
  },
  'Jeremiah 29:11': {
    crossRefs: ['Romans 8:28', 'Isaiah 55:8-9', 'Ephesians 2:10'],
    words: [
      { term: 'מַחֲשָׁבוֹת (machashavot)', language: 'Hebrew', meaning: 'thoughts/plans with intention' },
      { term: 'שָׁלוֹם (shalom)', language: 'Hebrew', meaning: 'wholeness, peace, flourishing' }
    ]
  },
  'Isaiah 41:10': {
    crossRefs: ['Joshua 1:9', 'Psalm 46:1', '2 Timothy 1:7'],
    words: [
      { term: 'אַל-תִּירָא (al-tira)', language: 'Hebrew', meaning: 'do not fear / do not be driven by terror' },
      { term: 'אָמַץ (amats)', language: 'Hebrew', meaning: 'to strengthen, make firm' }
    ]
  },
  'Philippians 4:6-7': {
    crossRefs: ['1 Peter 5:7', 'Isaiah 26:3', 'John 14:27'],
    words: [
      { term: 'εἰρήνη (eirene)', language: 'Greek', meaning: 'peace, restored order, harmony with God' },
      { term: 'φρουρήσει (phrouresei)', language: 'Greek', meaning: 'will guard, like a military garrison' }
    ]
  }
};

function fallbackProfile(verseText = '') {
  const lower = verseText.toLowerCase();
  const words = [];
  if (lower.includes('peace')) words.push({ term: 'שָׁלוֹם / εἰρήνη', language: 'Hebrew/Greek', meaning: 'peace as wholeness, not just calm feelings' });
  if (lower.includes('trust')) words.push({ term: 'בָּטַח / πίστις', language: 'Hebrew/Greek', meaning: 'active trust and faithful dependence' });
  if (lower.includes('love')) words.push({ term: 'אַהֲבָה / ἀγάπη', language: 'Hebrew/Greek', meaning: 'covenant love expressed in action' });

  return {
    crossRefs: ['Psalm 119:105', 'Romans 15:4', 'Hebrews 4:12'],
    words: words.length ? words : [{ term: 'דָּבָר / λόγος', language: 'Hebrew/Greek', meaning: 'God\'s living word and active message' }]
  };
}

function generateWisdomResponse(verse) {
  const profile = referenceProfiles[verse.reference] || fallbackProfile(verse.text);
  const crossRefs = profile.crossRefs.map((x) => `- ${x}`).join('\n');
  const words = profile.words.map((x) => `- ${x.term} (${x.language}): ${x.meaning}`).join('\n');

  return [
    `🧠 Wisdom Insight — ${verse.reference}`,
    '',
    `"${verse.text}"`,
    '',
    'Thematic / prophetic connections across Scripture:',
    crossRefs,
    '',
    'Original-language depth:',
    words,
    '',
    'Taken together, this verse is not isolated — it echoes a larger biblical pattern of God guiding, forming, and sustaining His people across generations.'
  ].join('\n');
}

function generateDevotionalMessage(verse) {
  return [
    `🙏 Devotional + Prayer — ${verse.reference}`,
    '',
    `"${verse.text}"`,
    '',
    'Reflection:',
    'Ask: What is God revealing about His character in this verse, and what response of obedience is He inviting today?',
    '',
    'Bible study guide:',
    '- Observation: identify repeated words, commands, and promises.',
    '- Interpretation: place the verse in chapter/book context and covenant storyline.',
    '- Application: choose one concrete action for today and one for this week.',
    '',
    'Prayer:',
    'Father, let Your Word take root deeply in my heart. Shape my mind, correct my steps, and help me trust You in both clarity and uncertainty. Give me wisdom to obey what You are saying today, and let this truth bear fruit in love, endurance, and holiness. In Jesus\' name, amen.'
  ].join('\n');
}

module.exports = { generateWisdomResponse, generateDevotionalMessage };
