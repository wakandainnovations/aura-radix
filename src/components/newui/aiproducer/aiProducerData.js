export const initialMessages = [
  {
    role: 'ai',
    time: '9:10 AM',
    lines: [
      'Good morning, Muki! 👋',
      "Here's what's happening with your movie launch.",
    ],
    bullets: [
      { iconKey: 'youtube', text: 'YouTube trailer momentum is 31% higher than yesterday.' },
      { iconKey: 'x', text: 'Runtime discussion is trending on X with slightly negative sentiment.' },
      { iconKey: 'instagram', text: 'Fan engagement on Instagram is strong, especially Reels.' },
    ],
    footer: 'I recommend the following actions to maintain momentum and address risks.',
  },
  { role: 'user', time: '9:11 AM', text: 'What are the top risks right now?' },
  {
    role: 'ai',
    time: '9:12 AM',
    lines: ['Here are the top risks we\'re tracking right now:'],
    numbered: [
      'Runtime concerns trending on X could impact audience perception.',
      "Negative reviews may increase if runtime isn't addressed.",
      'South market bookings are pacing 8% below projection.',
    ],
    footer: 'Would you like me to suggest actions to mitigate these risks?',
  },
  { role: 'user', time: '9:13 AM', text: 'Yes, suggest actions.' },
  {
    role: 'ai',
    time: '9:13 AM',
    lines: ['Here are the recommended actions:'],
    checklist: [
      'Address runtime discussion with an official clarification on X.',
      'Release a behind-the-scenes clip highlighting the story depth.',
      'Boost YouTube budget by 20% for the next 3 hours.',
    ],
    footer: 'These actions are expected to improve momentum and reduce risks.',
  },
];

export const liveInsights = [
  { text: 'YouTube CTR is up 31% in the last 60 mins', caption: 'High engagement from Karnataka', time: '9:08 AM', iconKey: 'trend' },
  { text: '#TooLongRuntime trending on X', caption: '~18K mentions in last 3 hours', time: '9:07 AM', iconKey: 'hashtag' },
  { text: 'Instagram Reels reach up 42%', caption: 'Top reels driving strong engagement', time: '9:06 AM', iconKey: 'instagram' },
];

export const recommendedActions = [
  { text: 'Increase YouTube Budget (+20%)', impact: 'High', iconKey: 'youtube' },
  { text: 'Release BTS Clip', impact: 'High', iconKey: 'clip' },
  { text: 'Lead Cast Instagram Live', impact: 'Medium', iconKey: 'instagram' },
  { text: 'Address Runtime Concerns on X', impact: 'Medium', iconKey: 'x' },
];

export const quickPrompts = [
  'Analyze audience sentiment',
  'Show me top performing content',
  "What's trending on social media?",
  'Give me action plan for today',
  'How are bookings trending?',
];

export const tryPrompts = ['How can we improve ticket bookings?', "What's trending on social media?", 'Show me sentiment breakdown', 'Suggest content to release next'];
