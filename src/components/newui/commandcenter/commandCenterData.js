// Placeholder data for the Command Center overview, built from the design
// mock at wire_frames/CommandCenter.png. Every number here is synthetic —
// swap for real dashboard-service data once the design is finalized (see
// dummyMovieData.js for the equivalent note on the My Movie tab).

function spark(...values) {
  return values;
}

export const dummyCommandCenter = {
  campaignStatus: 'ON TRACK',

  aiSummary: {
    text: "Momentum is increasing after yesterday's song launch. Tamil Nadu has become the fastest-growing market. Competitor X announced their trailer, which may reduce share of voice over the next 48 hours.",
    updatedLabel: 'Updated 15 mins ago',
  },

  highlights: [
    { tone: 'good', kind: 'arrow', value: '18%', text: 'Buzz increased', caption: 'vs yesterday' },
    { tone: 'good', kind: 'arrow', value: '34%', text: 'Tamil Nadu conversations', caption: 'vs yesterday' },
    { tone: 'warning', kind: 'music', text: 'Song launch driving positive sentiment' },
    { tone: 'warning', kind: 'plus', text: 'Competitor X announced trailer launch' },
    { tone: 'bad', kind: 'arrowDown', value: '%', text: 'Runtime concerns are increasing' },
  ],

  recommendedActions: [
    {
      impact: 'High',
      icon: 'external',
      title: 'Release Character Poster tomorrow',
      metrics: [
        { label: 'Expected Reach', value: '+15%' },
        { label: 'Confidence', value: '91%' },
      ],
    },
    {
      impact: 'Medium',
      icon: 'trending',
      title: 'Increase paid spend in Tamil Nadu',
      metrics: [
        { label: 'Reason', value: 'Highest engagement growth' },
        { label: 'Confidence', value: '78%' },
      ],
    },
    {
      impact: 'Low',
      icon: 'eye',
      title: 'Monitor runtime discussions',
      note: "No action required yet. We'll keep monitoring.",
    },
  ],

  stats: [
    { key: 'health', label: 'Movie Health', value: 92, suffix: '/100', caption: 'Excellent', hue: 'green', spark: spark(70, 74, 78, 81, 85, 88, 90, 92), sparklineColor: '#34d399' },
    { key: 'buzz', label: 'Buzz', value: '+18%', caption: 'vs yesterday', hue: 'violet', spark: spark(60, 64, 61, 68, 72, 75, 79, 82), sparklineColor: '#a78bfa' },
    { key: 'sentiment', label: 'Sentiment', value: '81%', caption: 'Positive', hue: 'green', barPct: 81, sparklineColor: '#34d399' },
    { key: 'reach', label: 'Reach', value: '3.2M', caption: 'Unique People', hue: 'blue', spark: spark(1.2, 1.6, 1.9, 2.1, 2.5, 2.8, 3.0, 3.2), sparklineColor: '#3987e5' },
    { key: 'awareness', label: 'Awareness', value: 'High', caption: 'Top of Funnel', hue: 'cyan', spark: spark(40, 48, 55, 60, 66, 72, 78, 84), sparklineColor: '#22d3ee' },
  ],

  competitorWatch: [
    { name: 'Sapta Sagaradaache Ello', event: 'Trailer launched', deltaPct: 24 },
    { name: 'KD - The Devil', event: 'Song crossed 10M views', deltaPct: 12 },
    { name: 'UI', event: 'Reviews leaked', deltaPct: 6 },
  ],

  audiencePulse: {
    topRegions: [
      { rank: 1, name: 'Tamil Nadu', deltaPct: 34 },
      { rank: 2, name: 'Karnataka', deltaPct: 18 },
      { rank: 3, name: 'Maharashtra', deltaPct: 9 },
    ],
    mapMarkers: [
      { xPct: 42, yPct: 78, size: 10, color: '#3987e5', label: 'Tamil Nadu' },
      { xPct: 38, yPct: 62, size: 8, color: '#818cf8', label: 'Karnataka' },
      { xPct: 48, yPct: 48, size: 6, color: '#818cf8', label: 'Maharashtra' },
    ],
    peopleLove: ['Comedy', 'Music', 'Lead Pair'],
    peopleConcerned: ['Runtime', 'Second Half Pace', 'VFX'],
  },

  campaignTimeline: [
    { key: 'poster', label: 'Poster', date: 'May 10', status: 'done' },
    { key: 'song1', label: 'Song #1', date: 'May 15', status: 'done' },
    { key: 'trailer', label: 'Trailer', date: 'May 22', status: 'current' },
    { key: 'launch', label: 'Launch', date: 'May 29', status: 'upcoming' },
    { key: 'premiere', label: 'Premiere', date: 'Jun 01', status: 'upcoming' },
    { key: 'release', label: 'Release', date: 'Jun 07', status: 'upcoming' },
  ],

  askSuggestions: [
    'How is {title} performing in Karnataka?',
    'Compare us with Sapta Sagaradaache Ello',
    'Should we release another song?',
    'What are runtime concerns?',
  ],

  snapshot: {
    genre: 'Drama',
    language: 'English',
    runtime: '2h 15m',
    distributor: 'TBD',
    lastUpdatedLabel: '15 mins ago',
  },
};
