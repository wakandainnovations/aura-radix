const DATES = ['Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'];

function series(start, end, points = 24) {
  const out = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = Math.sin(i * 1.5) * (end - start) * 0.04;
    const dateIdx = Math.round(t * (DATES.length - 1));
    out.push({ date: DATES[dateIdx], value: Math.max(0, Math.round(start + (end - start) * t + noise)) });
  }
  return out;
}

export const AXIS_TICKS = DATES;

export const overviewData = {
  stats: [
    { label: 'Total Audience', value: '6.2M', delta: '18%', spark: series(4, 20, 8).map((d) => d.value), color: '#a78bfa' },
    { label: 'Positive Sentiment', value: '81%', delta: '5 pts', spark: series(70, 81, 8).map((d) => d.value), color: '#34d399' },
    { label: 'Negative Sentiment', value: '14%', delta: '3 pts', deltaTone: 'good', spark: series(20, 14, 8).map((d) => d.value), color: '#f87171' },
    { label: 'Awareness', value: '46%', delta: '8%', spark: series(35, 46, 8).map((d) => d.value), color: '#3987e5' },
    { label: 'Engagement Rate', value: '4.7%', delta: '0.9%', spark: series(3, 5, 8).map((d) => d.value), color: '#fbbf24' },
  ],
  mood: [
    { label: 'Positive', value: 81, color: '#34d399' },
    { label: 'Neutral', value: 5, color: '#94a3b8' },
    { label: 'Negative', value: 14, color: '#f87171' },
  ],
  growth: (() => {
    const total = series(3600000, 6200000);
    const social = series(2000000, 3900000);
    const news = series(700000, 1500000);
    const forums = series(400000, 800000);
    return total.map((d, i) => ({ date: d.date, total: d.value, social: social[i].value, news: news[i].value, forums: forums[i].value }));
  })(),
  segments: [
    { label: 'Males 18–24', audience: '1.6M', pct: 26, sentiment: 86 },
    { label: 'Males 25–34', audience: '1.4M', pct: 23, sentiment: 82 },
    { label: 'Females 18–24', audience: '1.1M', pct: 18, sentiment: 79 },
    { label: 'Males 35–44', audience: '820K', pct: 13, sentiment: 78 },
    { label: 'Females 25–34', audience: '640K', pct: 10, sentiment: 80 },
    { label: 'Others', audience: '620K', pct: 10, sentiment: 74 },
  ],
  platforms: [
    { label: 'Instagram', audience: '2.1M', pct: 33 },
    { label: 'YouTube', audience: '1.7M', pct: 27 },
    { label: 'X (Twitter)', audience: '1.2M', pct: 19 },
    { label: 'Facebook', audience: '780K', pct: 12 },
    { label: 'WhatsApp', audience: '320K', pct: 5 },
    { label: 'Reddit', audience: '120K', pct: 4 },
  ],
  interests: [
    { label: 'Action Movies', pct: 72 },
    { label: 'Comedy', pct: 61 },
    { label: 'Tamil Cinema', pct: 54 },
    { label: 'Music', pct: 48 },
    { label: 'Hero Worship', pct: 42 },
  ],
  conversationVolume: [
    { label: 'Movie & Story', value: 37, pctLabel: '1.4M (37%)', color: '#a78bfa' },
    { label: 'Cast & Crew', value: 26, pctLabel: '980K (26%)', color: '#3987e5' },
    { label: 'Songs & Music', value: 16, pctLabel: '620K (16%)', color: '#34d399' },
    { label: 'Trailer & Promo', value: 13, pctLabel: '480K (13%)', color: '#fbbf24' },
    { label: 'Others', value: 8, pctLabel: '320K (8%)', color: '#64748b' },
  ],
  sentimentOverTime: (() => {
    const pos = series(70, 85, 24);
    const neu = series(20, 10, 24);
    const neg = series(10, 5, 24);
    return pos.map((d, i) => ({ date: d.date, positive: d.value, neutral: neu[i].value, negative: neg[i].value }));
  })(),
  voice: [
    { quote: 'Shoonya\'s character is massy! 🔥 This gonna be huge in theatres.', platform: 'Instagram', time: '2h ago' },
    { quote: 'The trailer gave goosebumps! BGM is next level.', platform: 'YouTube', time: '3h ago' },
    { quote: 'Hope the story lives up to the hype. Promising so far.', platform: 'X (Twitter)', time: '4h ago' },
  ],
  aiInsight: 'Your core audience (Males 18–34) is highly engaged with mass action and music content. Consider more behind-the-scenes and character-driven content to reduce negative sentiment from critical audiences.',
  actions: [
    { text: 'Release a making video focused on story depth', impact: 'High' },
    { text: 'Drop a character introduction for Shoonya', impact: 'High' },
    { text: 'Push music reels & fan interactions on Instagram', impact: 'Medium' },
  ],
};

export const demographicsData = {
  age: [
    { label: '13–17', value: 8, color: '#a78bfa' },
    { label: '18–24', value: 26, color: '#3987e5' },
    { label: '25–34', value: 32, color: '#34d399' },
    { label: '35–44', value: 18, color: '#fbbf24' },
    { label: '45+', value: 16, color: '#f97316' },
  ],
  gender: [
    { label: 'Male', value: 72, color: '#3987e5' },
    { label: 'Female', value: 26, color: '#f472b6' },
    { label: 'Non-binary', value: 2, color: '#a78bfa' },
  ],
  language: [
    { label: 'Kannada', pct: 42 },
    { label: 'Tamil', pct: 28 },
    { label: 'Telugu', pct: 14 },
    { label: 'Hindi', pct: 8 },
    { label: 'English', pct: 5 },
    { label: 'Malayalam', pct: 2 },
    { label: 'Others', pct: 1 },
  ],
  insights: [
    { text: 'Strong growth in 18–24 age group', caption: 'Grew 24% compared to last 30 days.' },
    { text: 'Male audience dominates', caption: '72% of total conversations.' },
    { text: 'Tamil audience is highly engaged', caption: '28% share with 14% more engagement than average.' },
  ],
  income: [
    { label: 'Below ₹2.5 LPA', value: 18, color: '#a78bfa' },
    { label: '₹2.5 – ₹5 LPA', value: 28, color: '#3987e5' },
    { label: '₹5 – ₹10 LPA', value: 26, color: '#34d399' },
    { label: '₹10 – ₹20 LPA', value: 16, color: '#f87171' },
    { label: 'Above ₹20 LPA', value: 12, color: '#fbbf24' },
  ],
  education: [
    { label: 'School', value: 15, color: '#3987e5' },
    { label: 'Undergraduate', value: 45, color: '#34d399' },
    { label: 'Postgraduate', value: 30, color: '#a78bfa' },
    { label: 'Professional', value: 10, color: '#fbbf24' },
  ],
  interestsLeft: [
    { label: 'Movies & TV', pct: 72 },
    { label: 'Comedy', pct: 61 },
    { label: 'Music', pct: 58 },
    { label: 'Action & Adventure', pct: 47 },
    { label: 'Gaming', pct: 41 },
  ],
  interestsRight: [
    { label: 'Dance', pct: 34 },
    { label: 'Sports', pct: 33 },
    { label: 'Technology', pct: 29 },
    { label: 'Fashion & Style', pct: 27 },
    { label: 'Travel', pct: 25 },
  ],
  countries: [
    { label: 'India', audience: '6.0M', pct: '96%' },
    { label: 'UAE', audience: '85K', pct: '1.4%' },
    { label: 'USA', audience: '46K', pct: '0.7%' },
    { label: 'Singapore', audience: '21K', pct: '0.3%' },
    { label: 'Others', audience: '15K', pct: '0.2%' },
  ],
  cities: [
    { label: 'Bengaluru', audience: '620K', pct: '10.0%', delta: '18%' },
    { label: 'Chennai', audience: '480K', pct: '7.7%', delta: '16%' },
    { label: 'Hyderabad', audience: '420K', pct: '6.8%', delta: '14%' },
    { label: 'Mumbai', audience: '410K', pct: '6.6%', delta: '12%' },
    { label: 'Coimbatore', audience: '250K', pct: '4.0%', delta: '20%' },
  ],
  worldMarkers: [{ xPct: 68, yPct: 48, size: 20, color: '#3987e5', label: 'India' }],
  cityMarkers: [
    { xPct: 40, yPct: 60, size: 14, color: '#a78bfa', label: 'Bengaluru' },
    { xPct: 48, yPct: 70, size: 11, color: '#a78bfa', label: 'Chennai' },
    { xPct: 55, yPct: 52, size: 10, color: '#a78bfa', label: 'Hyderabad' },
    { xPct: 30, yPct: 45, size: 10, color: '#a78bfa', label: 'Mumbai' },
    { xPct: 38, yPct: 80, size: 7, color: '#a78bfa', label: 'Coimbatore' },
  ],
};

export const geographyData = {
  countries: [
    { label: 'India', value: '6.0M', delta: '18%' },
    { label: 'UAE', value: '850K', delta: '26%' },
    { label: 'USA', value: '460K', delta: '12%' },
    { label: 'Singapore', value: '210K', delta: '15%' },
    { label: 'UK', value: '180K', delta: '10%' },
    { label: 'Canada', value: '150K', delta: '-3%' },
    { label: 'Australia', value: '120K', delta: '8%' },
    { label: 'Others', value: '280K', delta: '9%' },
  ],
  states: [
    { label: 'Tamil Nadu', value: '1.35M', delta: '24%' },
    { label: 'Karnataka', value: '980K', delta: '19%' },
    { label: 'Maharashtra', value: '760K', delta: '16%' },
    { label: 'Telangana', value: '620K', delta: '18%' },
    { label: 'Kerala', value: '340K', delta: '14%' },
    { label: 'Andhra Pradesh', value: '300K', delta: '-3%' },
    { label: 'Delhi', value: '220K', delta: '9%' },
    { label: 'Others', value: '420K', delta: '9%' },
  ],
  cities: [
    { label: 'Bengaluru', value: '620K', delta: '20%' },
    { label: 'Chennai', value: '480K', delta: '18%' },
    { label: 'Hyderabad', value: '420K', delta: '16%' },
    { label: 'Mumbai', value: '410K', delta: '14%' },
    { label: 'Coimbatore', value: '250K', delta: '22%' },
  ],
  regionShare: [
    { label: 'South', value: 45, color: '#a78bfa' },
    { label: 'West', value: 20, color: '#3987e5' },
    { label: 'North', value: 16, color: '#34d399' },
    { label: 'East', value: 10, color: '#fbbf24' },
    { label: 'Central', value: 9, color: '#f97316' },
  ],
  hotspots: [
    { label: 'Coimbatore', value: '45K', delta: '48%' },
    { label: 'Kochi', value: '38K', delta: '42%' },
    { label: 'Visakhapatnam', value: '32K', delta: '36%' },
    { label: 'Indore', value: '28K', delta: '34%' },
    { label: 'Vadodara', value: '26K', delta: '31%' },
  ],
  insights: [
    { text: 'South India Leads the Buzz', caption: 'South holds 45% of total buzz, driven by mass appeal and strong music engagement.' },
    { text: 'Coimbatore Surging', caption: "Coimbatore's buzz jumped 48% with high engagement around action sequences." },
    { text: 'NRI Markets Active', caption: 'UAE and Singapore show strong traction, driven by teaser and trailer.' },
  ],
  regionTrend: (() => {
    const south = series(600000, 1000000);
    const west = series(300000, 550000);
    const north = series(200000, 400000);
    const east = series(100000, 220000);
    const central = series(80000, 180000);
    return south.map((d, i) => ({ date: d.date, south: d.value, west: west[i].value, north: north[i].value, east: east[i].value, central: central[i].value }));
  })(),
  compareLocations: [
    { label: 'Tamil Nadu', value: '1.35M', delta: '24%', color: '#a78bfa' },
    { label: 'Karnataka', value: '980K', delta: '19%', color: '#3987e5' },
    { label: 'Maharashtra', value: '760K', delta: '16%', color: '#34d399' },
    { label: 'Telangana', value: '620K', delta: '18%', color: '#f97316' },
  ],
  worldMarkers: [
    { xPct: 68, yPct: 48, size: 18, color: '#3987e5', label: 'India' },
    { xPct: 62, yPct: 52, size: 8, color: '#3987e5', label: 'UAE' },
    { xPct: 22, yPct: 40, size: 7, color: '#3987e5', label: 'USA' },
    { xPct: 76, yPct: 62, size: 6, color: '#3987e5', label: 'Singapore' },
  ],
  indiaMarkers: [
    { xPct: 40, yPct: 78, size: 16, color: '#a78bfa', label: 'Tamil Nadu' },
    { xPct: 38, yPct: 60, size: 13, color: '#a78bfa', label: 'Karnataka' },
    { xPct: 30, yPct: 50, size: 11, color: '#a78bfa', label: 'Maharashtra' },
    { xPct: 46, yPct: 55, size: 9, color: '#a78bfa', label: 'Telangana' },
    { xPct: 36, yPct: 88, size: 6, color: '#a78bfa', label: 'Kerala' },
  ],
};

export const themesData = {
  themes: [
    { rank: 1, label: 'Mass Action & Heroism', caption: 'High-octane action, larger-than-life hero, crowd-pleasing moments.', score: 92, buzz: '680K', buzzDelta: '24%', sentiment: 85, color: '#a78bfa', spark: series(60, 92, 8).map((d) => d.value) },
    { rank: 2, label: 'Comedy & Entertaining Dialogues', caption: 'Humor, witty one-liners, and entertaining characters.', score: 87, buzz: '520K', buzzDelta: '18%', sentiment: 82, color: '#3987e5', spark: series(60, 87, 8).map((d) => d.value) },
    { rank: 3, label: 'Emotional Connection', caption: 'Family, friendship, redemption, and emotional storytelling.', score: 78, buzz: '410K', buzzDelta: '12%', sentiment: 79, color: '#34d399', spark: series(55, 78, 8).map((d) => d.value) },
    { rank: 4, label: 'Music & Soundtrack', caption: 'Songs, background score and music moments.', score: 74, buzz: '360K', buzzDelta: '16%', sentiment: 76, color: '#fbbf24', spark: series(50, 74, 8).map((d) => d.value) },
    { rank: 5, label: 'Visuals & Style', caption: 'Cinematography, visuals, aesthetics and vibe.', score: 69, buzz: '290K', buzzDelta: '9%', sentiment: 73, color: '#22d3ee', spark: series(48, 69, 8).map((d) => d.value) },
  ],
  intent: [
    { label: 'Watch in Theatres', pct: 68, color: '#a78bfa' },
    { label: 'Watch Trailer', pct: 57, color: '#3987e5' },
    { label: 'Recommend', pct: 46, color: '#34d399' },
    { label: 'Engage on Social', pct: 43, color: '#f97316' },
    { label: 'Listen to Music', pct: 38, color: '#22d3ee' },
  ],
  buzzOverTime: (() => {
    const a = series(200000, 700000);
    const b = series(150000, 520000);
    const c = series(120000, 400000);
    const d = series(100000, 350000);
    return a.map((row, i) => ({ date: row.date, action: row.value, comedy: b[i].value, emotional: c[i].value, music: d[i].value }));
  })(),
  drivers: {
    'Mass Action & Heroism': [
      { label: 'Climax Fight Scene', type: 'Clip', value: '320K', delta: '28%' },
      { label: 'Hero Intro Scene', type: 'Clip', value: '210K', delta: '16%' },
      { label: 'High Energy BGM', type: 'Song', value: '150K', delta: '14%' },
    ],
    'Comedy & Dialogues': [
      { label: 'Sidekick Banter', type: 'Clip', value: '180K', delta: '20%' },
      { label: 'One-liner Compilation', type: 'Clip', value: '140K', delta: '15%' },
      { label: 'Interview Bloopers', type: 'Clip', value: '90K', delta: '11%' },
    ],
    'Emotional Connection': [
      { label: 'Mother-Son Scene', type: 'Clip', value: '160K', delta: '18%' },
      { label: 'Friendship Montage', type: 'Clip', value: '120K', delta: '13%' },
      { label: 'Redemption Arc Teaser', type: 'Clip', value: '95K', delta: '10%' },
    ],
  },
  opportunities: [
    { label: 'Inspirational Underdog Story', caption: 'Low content volume, high audience interest.', score: 78, color: 'amber' },
    { label: 'Dance & Celebration', caption: 'Strong engagement potential across key regions.', score: 72, color: 'green' },
    { label: 'Family & Relationships', caption: 'Audience expresses high interest in emotional arcs.', score: 69, color: 'purple' },
  ],
  aiInsight: 'Mass action and comedy themes are performing exceptionally well. Consider creating more behind-the-scenes content around action choreography and comedic moments.',
};

export const influencersData = {
  allInfluencers: [
    { rank: 1, name: 'Cinema Vikatan', handle: '@cinemavikatan', platform: 'Instagram', views: '4.2M', viewsValue: 4200000, engRate: '8.7%', engRateValue: 8.7, impact: 92 },
    { rank: 2, name: 'Behindwoods TV', handle: '@behindwoodstv', platform: 'YouTube', views: '3.6M', viewsValue: 3600000, engRate: '6.2%', engRateValue: 6.2, impact: 89 },
    { rank: 3, name: 'Filmy Reacts', handle: '@filmyreacts', platform: 'X (Twitter)', views: '2.9M', viewsValue: 2900000, engRate: '7.1%', engRateValue: 7.1, impact: 84 },
    { rank: 4, name: 'Galatta Media', handle: '@galattadotcom', platform: 'Instagram', views: '2.1M', viewsValue: 2100000, engRate: '5.3%', engRateValue: 5.3, impact: 78 },
    { rank: 5, name: 'Tamil Talkies', handle: '@tamiltalkies', platform: 'YouTube', views: '1.8M', viewsValue: 1800000, engRate: '6.8%', engRateValue: 6.8, impact: 75 },
  ],
  allContent: [
    { id: 1, title: 'Lord Gaaga – Official Reaction!', influencer: 'Filmy Reacts', platform: 'YouTube', date: 'May 12, 2025', reach: '1.2M', reachValue: 1200000, engagement: '98K', engRate: '8.2%', engRateValue: 8.2, sentiment: 'Positive' },
    { id: 2, title: 'Mass Dialogues from Lord Gaaga', influencer: 'Cinema Vikatan', platform: 'Instagram', date: 'May 10, 2025', reach: '850K', reachValue: 850000, engagement: '72K', engRate: '8.5%', engRateValue: 8.5, sentiment: 'Positive' },
    { id: 3, title: 'Why Lord Gaaga will be a Game Changer', influencer: 'Behindwoods TV', platform: 'YouTube', date: 'May 9, 2025', reach: '1.8M', reachValue: 1800000, engagement: '110K', engRate: '6.1%', engRateValue: 6.1, sentiment: 'Positive' },
    { id: 4, title: 'Lord Gaaga BGM is Pure Goosebumps!', influencer: 'Tamil Talkies', platform: 'YouTube', date: 'May 8, 2025', reach: '620K', reachValue: 620000, engagement: '41K', engRate: '6.6%', engRateValue: 6.6, sentiment: 'Positive' },
    { id: 5, title: 'First Look Breakdown', influencer: 'Galatta Media', platform: 'Instagram', date: 'May 7, 2025', reach: '540K', reachValue: 540000, engagement: '28K', engRate: '5.2%', engRateValue: 5.2, sentiment: 'Neutral' },
  ],
  topicsOfDiscussion: [
    { label: 'Box office / commercial', value: 28, pctLabel: '28%', color: '#3987e5' },
    { label: 'Cast performance', value: 22, pctLabel: '22%', color: '#a78bfa' },
    { label: 'Music / songs', value: 18, pctLabel: '18%', color: '#34d399' },
    { label: 'Story / screenplay', value: 14, pctLabel: '14%', color: '#fbbf24' },
    { label: 'Direction / technical craft', value: 9, pctLabel: '9%', color: '#f87171' },
    { label: 'Politics / personal-life crossover', value: 6, pctLabel: '6%', color: '#22d3ee' },
    { label: 'General / unspecified', value: 3, pctLabel: '3%', color: '#94a3b8' },
  ],
  aiInsight: 'Cinema Vikatan and Behindwoods TV are delivering the highest impact with strong positive sentiment. Consider collaborations with Filmy Reacts for high engagement and Tamil Talkies for music-driven content.',
  actions: [
    { text: 'Collaborate with Cinema Vikatan for exclusive interviews', impact: 'High' },
    { text: 'Release a BGM breakdown with Tamil Talkies', impact: 'High' },
    { text: 'Plan a live Q&A with Behindwoods TV', impact: 'Medium' },
  ],
};

export const conversationsData = {
  volumeOverTime: series(700000, 3200000).map((d) => ({ date: d.date, value: d.value })),
  volumeTotal: '3.2M',
  volumeDeltaPct: 18,
  positiveOverTime: series(560000, 2600000).map((d) => ({ date: d.date, value: d.value })),
  positiveTotal: '2.6M',
  positiveDeltaPct: 22,
  negativeOverTime: series(90000, 450000).map((d) => ({ date: d.date, value: d.value })),
  negativeTotal: '450K',
  negativeDeltaPct: -6,
  sentimentBreakdown: [
    { label: 'Positive', value: 81, pctLabel: '81% ↑5pts', color: '#34d399' },
    { label: 'Neutral', value: 5, pctLabel: '5% ↓1pt', color: '#94a3b8' },
    { label: 'Negative', value: 14, pctLabel: '14% ↓3pts', color: '#f87171' },
  ],
  topics: [
    { label: '#LordGaaga', value: '1.2M', delta: '28%' },
    { label: 'Trailer', value: '620K', delta: '22%' },
    { label: "Shoonya's Character", value: '480K', delta: '18%' },
    { label: 'Action & BGM', value: '410K', delta: '16%' },
    { label: 'Release Date', value: '330K', delta: '11%' },
  ],
  latest: [
    { handle: '@CineFan_99', time: 'May 15, 2025 · 2:30 PM', text: 'That climax fight scene in #LordGaaga looks absolutely insane! 🔥 Goosebumps just from the trailer!', platform: 'X (Twitter)', sentiment: 'Positive', engagement: '1.2K' },
    { handle: '@moviemad_tamil', time: 'May 15, 2025 · 11:15 AM', text: "Shoonya's transformation is next level. This is why Lord Gaaga is going to be HUGE! 💪", platform: 'Instagram', sentiment: 'Positive', engagement: '980' },
    { handle: '@TeluguMovieTalks', time: 'May 15, 2025 · 9:45 AM', text: 'Trailer was decent, but expecting a stronger story. Hope the movie delivers more than just mass scenes.', platform: 'YouTube', sentiment: 'Neutral', engagement: '620' },
    { handle: '@MassCinemaKing', time: 'May 14, 2025 · 8:20 PM', text: 'BGM is already a banger! Repeat value is guaranteed. 🔥🔥', platform: 'X (Twitter)', sentiment: 'Positive', engagement: '1.8K' },
    { handle: 'u/ActionLover88', time: 'May 14, 2025 · 6:05 PM', text: "Villain looks weak compared to the hype. Let's see if the story makes up for it.", platform: 'Reddit', sentiment: 'Negative', engagement: '312' },
  ],
  sentimentByPlatform: [
    { platform: 'YouTube', positive: 82, neutral: 6, negative: 12, net: '+70' },
    { platform: 'Instagram', positive: 84, neutral: 7, negative: 9, net: '+75' },
    { platform: 'X (Twitter)', positive: 78, neutral: 5, negative: 17, net: '+61' },
    { platform: 'Reddit', positive: 62, neutral: 10, negative: 28, net: '+34' },
    { platform: 'News & Blogs', positive: 76, neutral: 8, negative: 16, net: '+60' },
  ],
  drivers: [
    { label: 'Climax Fight Scene', pct: 32 },
    { label: "Shoonya's Character", pct: 24 },
    { label: 'BGM & Music', pct: 18 },
    { label: 'Trailer & Visuals', pct: 14 },
    { label: 'Release Date Speculation', pct: 12 },
  ],
  aiInsight: 'Positive sentiment is strong across YouTube and Instagram, driven by action and character appeal. Address concerns around story depth on Reddit and X with behind-the-scenes content and interviews.',
  actions: [
    { text: 'Release a making video focused on story & world-building', impact: 'High' },
    { text: 'Drop a character introduction video for Shoonya', impact: 'High' },
    { text: 'Strengthen narrative messaging in key interviews & AMAs', impact: 'Medium' },
  ],
};
