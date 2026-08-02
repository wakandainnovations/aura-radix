const DATES = ['Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'];

function series(start, end, points = 24, seed = 1) {
  const out = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = Math.sin(i * 1.5 * seed) * (end - start) * 0.04;
    const dateIdx = Math.round(t * (DATES.length - 1));
    out.push({ date: DATES[dateIdx], value: Math.max(0, Math.round(start + (end - start) * t + noise)) });
  }
  return out;
}

export const AXIS_TICKS = DATES;

const COMPETITORS = ['Lord Gaaga (You)', 'Veera 2', 'Rudra: The Rise', 'Shadows of War', 'Untitled Love Story', 'Action King Returns'];
const COMPETITOR_COLORS = { 'Lord Gaaga (You)': '#3987e5', 'Veera 2': '#a78bfa', 'Rudra: The Rise': '#34d399', 'Shadows of War': '#f97316', 'Untitled Love Story': '#f87171', 'Action King Returns': '#22d3ee' };

export const overviewData = {
  stats: [
    { label: 'Active Competitors', value: '8', delta: '14%' },
    { label: 'Total Share of Voice', value: '38%', delta: '6 pts' },
    { label: 'Avg. Engagement Rate', value: '4.2%', delta: '-0.3 pts', deltaTone: 'bad' },
    { label: 'Audience Overlap (Avg.)', value: '26%', delta: '4 pts' },
    { label: 'Estimated Ad Spend', value: '₹4.8 Cr', delta: '22%' },
  ],
  threat: 'Medium',
  shareOfVoice: [
    { label: 'Lord Gaaga (You)', value: 38, color: '#3987e5' },
    { label: 'Veera 2', value: 22, color: '#a78bfa' },
    { label: 'Rudra: The Rise', value: 15, color: '#34d399' },
    { label: 'Shadows of War', value: 10, color: '#f97316' },
    { label: 'Untitled Love Story', value: 6, color: '#f87171' },
    { label: 'Other Competitors', value: 9, color: '#64748b' },
  ],
  buzzOverTime: (() => {
    const you = series(700000, 1240000, 24, 1);
    const veera = series(600000, 950000, 24, 2);
    const rudra = series(350000, 620000, 24, 3);
    const shadows = series(250000, 420000, 24, 4);
    const others = series(150000, 300000, 24, 5);
    return you.map((d, i) => ({ date: d.date, you: d.value, veera2: veera[i].value, rudra: rudra[i].value, shadows: shadows[i].value, others: others[i].value }));
  })(),
  campaignCalendar: [
    { name: 'Veera 2', date: 'May 16', events: [{ label: 'Trailer Release', range: 'May 8 – May 18', startPct: 22, widthPct: 32 }, { label: 'Music Launch', range: 'May 24 – Jun', startPct: 74, widthPct: 22 }] },
    { name: 'Rudra: The Rise', date: 'May 23', events: [{ label: 'Teaser Campaign', range: 'May 1 – May 10', startPct: 0, widthPct: 32 }, { label: 'Trailer Release', range: 'May 14 – May 22', startPct: 43, widthPct: 26 }] },
    { name: 'Shadows of War', date: 'May 30', events: [{ label: 'Character Reveal', range: 'May 5 – May 12', startPct: 13, widthPct: 22 }, { label: 'Trailer Release', range: 'May 20 – May 28', startPct: 61, widthPct: 26 }] },
    { name: 'Untitled Love Story', date: 'Jun 6', events: [{ label: 'First Look', range: 'May 12 – May 18', startPct: 35, widthPct: 20 }, { label: 'Music Launch', range: 'May 26 – Jun 2', startPct: 81, widthPct: 19 }] },
    { name: 'Action King Returns', date: 'May 9', events: [{ label: 'Trailer Release', range: 'May 3 – May 7', startPct: 6, widthPct: 16 }] },
  ],
  benchmark: [
    { name: 'Lord Gaaga (You)', date: 'May 22, 2025', buzz: '1.24M', engRate: '4.8%', sentiment: '81%', spend: '₹1.2 Cr' },
    { name: 'Veera 2', date: 'May 16, 2025', buzz: '950K', engRate: '4.5%', sentiment: '78%', spend: '₹1.6 Cr' },
    { name: 'Rudra: The Rise', date: 'May 23, 2025', buzz: '620K', engRate: '3.6%', sentiment: '74%', spend: '₹1.1 Cr' },
    { name: 'Shadows of War', date: 'May 30, 2025', buzz: '420K', engRate: '3.1%', sentiment: '72%', spend: '₹0.7 Cr' },
    { name: 'Untitled Love Story', date: 'Jun 6, 2025', buzz: '310K', engRate: '2.8%', sentiment: '70%', spend: '₹0.4 Cr' },
  ],
  audienceOverlap: [
    { label: 'Veera 2', pct: 36 },
    { label: 'Rudra: The Rise', pct: 28 },
    { label: 'Shadows of War', pct: 22 },
    { label: 'Untitled Love Story', pct: 18 },
    { label: 'Action King Returns', pct: 12 },
  ],
  insights: [
    { text: 'Veera 2 is leading in awareness with aggressive trailer promotion.', caption: 'Consider increasing your trailer views through retargeting.' },
    { text: 'Rudra: The Rise is gaining engagement with character content.', caption: 'Opportunity to counter with deeper story content.' },
    { text: 'Audience overlap with Veera 2 is highest at 36%.', caption: 'Differentiate with unique content & segmented messaging.' },
  ],
  aiInsight: "Competitors are front-loading trailer releases. Your trailer scheduled for May 8 is well-timed. Focus on music & emotional storytelling to cut through the noise.",
  actions: [
    { text: 'Boost trailer visibility with paid amplification', impact: 'High' },
    { text: 'Release a unique behind-the-scenes video', impact: 'Medium' },
    { text: 'Target non-overlapping audience segments', impact: 'Medium' },
  ],
};

export const campaignsData = {
  stats: [
    { label: 'Total Active Campaigns', value: '32', delta: '14%' },
    { label: 'Total Ad Spend', value: '₹4.8 Cr', delta: '22%' },
    { label: 'Avg. CTR', value: '1.42%', delta: '0.28 pts' },
    { label: 'Conversion Rate (Est.)', value: '2.31%', delta: '-0.21 pts', deltaTone: 'bad' },
    { label: 'Cost Per View (CPV)', value: '₹0.38', delta: '-8%', deltaTone: 'good' },
  ],
  topCampaigns: [
    { name: 'Trailer Release', movie: 'Veera 2', competitor: 'Studio Green', spend: '₹85L', ctr: '2.1%', engagement: '1.8M' },
    { name: 'Teaser Campaign', movie: 'Rudra: The Rise', competitor: 'Pen Studios', spend: '₹62L', ctr: '1.7%', engagement: '1.2M' },
    { name: 'Music Launch', movie: 'Shadows of War', competitor: 'UV Creations', spend: '₹55L', ctr: '1.3%', engagement: '980K' },
    { name: 'Character Reveal', movie: 'Untitled Love Story', competitor: 'Mythri Movie Makers', spend: '₹38L', ctr: '1.6%', engagement: '620K' },
    { name: 'First Look', movie: 'Action King Returns', competitor: 'Hombale Films', spend: '₹31L', ctr: '1.1%', engagement: '510K' },
  ],
  performanceOverTime: (() => {
    const spend = series(30, 90, 24, 1);
    const engagement = series(1, 2, 24, 2);
    const ctr = series(0.8, 2, 24, 3);
    return spend.map((d, i) => ({ date: d.date, spend: d.value, engagement: engagement[i].value * 10, ctr: ctr[i].value }));
  })(),
  spendDistribution: [
    { label: 'YouTube', value: 45, pctLabel: '45% (₹2.16 Cr)', color: '#f87171' },
    { label: 'Instagram', value: 25, pctLabel: '25% (₹1.20 Cr)', color: '#f472b6' },
    { label: 'Facebook', value: 15, pctLabel: '15% (₹0.72 Cr)', color: '#3987e5' },
    { label: 'X (Twitter)', value: 8, pctLabel: '8% (₹0.38 Cr)', color: '#94a3b8' },
    { label: 'Others', value: 7, pctLabel: '7% (₹0.34 Cr)', color: '#64748b' },
  ],
  shareOfVoice: [
    { label: 'Veera 2 (Studio Green)', pct: 38, delta: '6 pts' },
    { label: 'Rudra: The Rise (Pen Studios)', pct: 22, delta: '3 pts' },
    { label: 'Shadows of War (UV Creations)', pct: 15, delta: '-1 pt' },
    { label: 'Untitled Love Story (Mythri)', pct: 10, delta: '-2 pts' },
    { label: 'Action King Returns (Hombale)', pct: 6, delta: '-1 pt' },
    { label: 'Others', pct: 9, delta: '-5 pts' },
  ],
  aiInsight: ['Veera 2 is dominating conversations with high trailer engagement.', 'Rudra: The Rise is gaining momentum with character-driven content.'],
  actions: [
    { text: 'Accelerate music campaign to capture mid-funnel audiences', impact: 'High' },
    { text: 'Release behind-the-scenes content to improve engagement', impact: 'Medium' },
    { text: 'Increase presence on Instagram Reels & YouTube Shorts', impact: 'Medium' },
  ],
};

export const audienceOverlapData = {
  stats: [
    { label: 'Your Unique Audience', value: '2.8M', delta: '12%' },
    { label: 'Overlapping Audience (Total)', value: '1.9M', delta: '9%' },
    { label: 'Overlap Rate (Avg.)', value: '26%', delta: '4 pts' },
    { label: 'Competitors with Highest Overlap', value: 'Veera 2', badge: { text: '36%', tone: 'neutral' } },
    { label: 'Audience at Risk', value: '1.1M', delta: '-5%', deltaTone: 'bad', caption: 'high overlap, low loyalty' },
  ],
  overlapByCompetitor: [
    { label: 'Veera 2', pct: 36, delta: '5 pts' },
    { label: 'Rudra: The Rise', pct: 28, delta: '3 pts' },
    { label: 'Shadows of War', pct: 22, delta: '2 pts' },
    { label: 'Untitled Love Story', pct: 18, delta: '-1 pt' },
    { label: 'Action King Returns', pct: 12, delta: '-1 pt' },
  ],
  trend: (() => {
    const veera = series(28, 36, 24, 1);
    const rudra = series(22, 28, 24, 2);
    const shadows = series(18, 22, 24, 3);
    const uls = series(20, 18, 24, 4);
    const akr = series(13, 12, 24, 5);
    return veera.map((d, i) => ({ date: d.date, veera2: d.value, rudra: rudra[i].value, shadows: shadows[i].value, uls: uls[i].value, akr: akr[i].value }));
  })(),
  segmentOverlap: [
    { label: 'Mass Action Enthusiasts', veera2: 42, rudra: 32, shadows: 28 },
    { label: 'Movie Buffs', veera2: 35, rudra: 27, shadows: 21 },
    { label: 'Trailer Watchers', veera2: 38, rudra: 29, shadows: 24 },
    { label: 'Music Lovers', veera2: 31, rudra: 22, shadows: 18 },
    { label: 'Families', veera2: 26, rudra: 19, shadows: 15 },
  ],
  demographicOverlap: [
    { label: 'Males 18–24', veera2: 40, rudra: 31, shadows: 28 },
    { label: 'Males 25–34', veera2: 34, rudra: 29, shadows: 23 },
    { label: 'Females 18–24', veera2: 28, rudra: 22, shadows: 17 },
    { label: 'Females 25–34', veera2: 24, rudra: 18, shadows: 14 },
    { label: 'Others 35+', veera2: 16, rudra: 13, shadows: 10 },
  ],
  atRisk: [
    { label: 'Veera 2', audience: '530K', pct: '19%', loyalty: 'Low' },
    { label: 'Rudra: The Rise', audience: '320K', pct: '11%', loyalty: 'Low' },
    { label: 'Shadows of War', audience: '180K', pct: '6%', loyalty: 'Medium' },
    { label: 'Untitled Love Story', audience: '90K', pct: '3%', loyalty: 'Medium' },
    { label: 'Action King Returns', audience: '60K', pct: '2%', loyalty: 'Medium' },
  ],
  aiInsight: ['36% of your audience also engages with Veera 2. Focus on differentiation in action and trailer content.', 'Mass Action Enthusiasts show the highest overlap across top competitors.'],
  actions: [
    { text: 'Differentiate trailer content to reduce overlap with Veera 2', impact: 'High' },
    { text: 'Strengthen character-driven content to reduce overlap with Rudra: The Rise', impact: 'Medium' },
    { text: 'Target under-served segments like families and females 25+', impact: 'Medium' },
  ],
};

export const contentAnalysisData = {
  stats: [
    { label: 'Total Content Analyzed', value: '152', delta: '15%' },
    { label: 'Avg. Engagement per Post', value: '42K', delta: '8%' },
    { label: 'Top Performing Format', value: 'Video', caption: '48% of total engagement' },
    { label: 'Viral Content (100K+ Eng.)', value: '18', delta: '29%' },
    { label: 'Content Velocity', value: '5.1', suffix: 'posts/day', delta: '12%' },
  ],
  byType: [
    { label: 'Video', value: 48, color: '#a78bfa' },
    { label: 'Image', value: 26, color: '#3987e5' },
    { label: 'Carousel', value: 12, color: '#34d399' },
    { label: 'Text', value: 8, color: '#fbbf24' },
    { label: 'Live', value: 4, color: '#f87171' },
    { label: 'Other', value: 2, color: '#64748b' },
  ],
  topContent: [
    { title: 'Veera 2 Trailer Release', competitor: 'Veera 2', type: 'Video', date: 'May 8, 2025', engagement: '1.2M' },
    { title: 'Rudra Enters the Battlefield', competitor: 'Rudra: The Rise', type: 'Video', date: 'May 10, 2025', engagement: '980K' },
    { title: 'Shadows of War – Music Launch', competitor: 'Shadows of War', type: 'Video', date: 'May 12, 2025', engagement: '860K' },
    { title: 'Character Reveal: The Antagonist', competitor: 'Untitled Love Story', type: 'Image', date: 'May 7, 2025', engagement: '620K' },
    { title: 'First Look Out Now!', competitor: 'Action King Returns', type: 'Image', date: 'May 9, 2025', engagement: '510K' },
  ],
  byPlatform: [
    { label: 'YouTube', value: '2.8M', pct: '44%' },
    { label: 'Instagram', value: '1.9M', pct: '30%' },
    { label: 'Facebook', value: '950K', pct: '15%' },
    { label: 'X (Twitter)', value: '480K', pct: '7%' },
    { label: 'Others', value: '280K', pct: '4%' },
  ],
  formatPerformance: [
    { label: 'Video', avgEng: '78K', rate: '5.2%' },
    { label: 'Carousel', avgEng: '56K', rate: '4.1%' },
    { label: 'Image', avgEng: '34K', rate: '3.2%' },
    { label: 'Live', avgEng: '29K', rate: '2.8%' },
    { label: 'Text', avgEng: '12K', rate: '1.3%' },
  ],
  postingFrequency: [
    { label: 'Veera 2', value: '1.8', delta: '20%' },
    { label: 'Rudra: The Rise', value: '1.4', delta: '12%' },
    { label: 'Shadows of War', value: '1.2', delta: '8%' },
    { label: 'Untitled Love Story', value: '0.9', delta: '-10%' },
    { label: 'Action King Returns', value: '0.8', delta: '5%' },
  ],
  themes: [
    { label: 'Action & Fights', value: '2.1M', pct: 33 },
    { label: 'Trailers & Teasers', value: '1.6M', pct: 26 },
    { label: 'Music & Songs', value: '1.2M', pct: 19 },
    { label: 'Character Reveals', value: '850K', pct: 13 },
    { label: 'Behind the Scenes', value: '650K', pct: 9 },
  ],
  aiInsight: ['Video content and action-packed themes drive the highest engagement.', 'Veera 2 leads in both content output and audience response.'],
  actions: [
    { text: 'Increase trailer and teaser content to maximize engagement', impact: 'High' },
    { text: 'Introduce character reveal posts to build audience curiosity', impact: 'Medium' },
    { text: 'Boost posting frequency around key release milestones', impact: 'Medium' },
  ],
};

export const marketPositionData = {
  leaderboard: [
    { rank: 1, name: 'Veera 2', genre: 'Action / Thriller', score: 82, delta: '5' },
    { rank: 2, name: 'Rudra: The Rise', genre: 'Action / Drama', score: 75, delta: '3' },
    { rank: 3, name: 'Shadows of War', genre: 'War / Action', score: 68, delta: '-1' },
    { rank: 4, name: 'Untitled Love Story', genre: 'Romance / Drama', score: 54, delta: '-2' },
    { rank: 5, name: 'Action King Returns', genre: 'Action / Mass', score: 42, delta: '1' },
  ],
  radar: [
    { dimension: 'Audience Reach', 'Veera 2': 85, 'Rudra: The Rise': 78, 'Shadows of War': 65, 'Untitled Love Story': 48, 'Action King Returns': 38 },
    { dimension: 'Engagement', 'Veera 2': 88, 'Rudra: The Rise': 76, 'Shadows of War': 66, 'Untitled Love Story': 52, 'Action King Returns': 40 },
    { dimension: 'Content Strength', 'Veera 2': 80, 'Rudra: The Rise': 72, 'Shadows of War': 70, 'Untitled Love Story': 50, 'Action King Returns': 38 },
    { dimension: 'Sentiment', 'Veera 2': 78, 'Rudra: The Rise': 71, 'Shadows of War': 64, 'Untitled Love Story': 55, 'Action King Returns': 42 },
    { dimension: 'Share of Voice', 'Veera 2': 75, 'Rudra: The Rise': 68, 'Shadows of War': 60, 'Untitled Love Story': 45, 'Action King Returns': 35 },
    { dimension: 'Growth Momentum', 'Veera 2': 84, 'Rudra: The Rise': 74, 'Shadows of War': 67, 'Untitled Love Story': 53, 'Action King Returns': 37 },
  ],
  engagementShare: [
    { label: 'Veera 2', value: 30, color: '#a78bfa' },
    { label: 'Rudra: The Rise', value: 24, color: '#3987e5' },
    { label: 'Shadows of War', value: 20, color: '#34d399' },
    { label: 'Untitled Love Story', value: 14, color: '#fbbf24' },
    { label: 'Action King Returns', value: 8, color: '#22d3ee' },
    { label: 'Others', value: 4, color: '#64748b' },
  ],
  scorecard: {
    dimensions: ['Audience Reach', 'Engagement', 'Content Strength', 'Sentiment', 'Share of Voice', 'Growth Momentum', 'Overall Strength Score'],
    weights: ['20%', '20%', '15%', '15%', '15%', '15%', '100%'],
    rows: [
      { name: 'Veera 2', values: [85, 88, 80, 78, 75, 84, 82] },
      { name: 'Rudra: The Rise', values: [78, 76, 72, 71, 68, 74, 75] },
      { name: 'Shadows of War', values: [65, 66, 70, 64, 60, 67, 68] },
      { name: 'Untitled Love Story', values: [48, 52, 50, 55, 45, 53, 54] },
      { name: 'Action King Returns', values: [38, 40, 38, 42, 35, 37, 42] },
    ],
  },
  movementOverTime: (() => {
    const veera = series(70, 82, 24, 1);
    const rudra = series(64, 75, 24, 2);
    const shadows = series(60, 68, 24, 3);
    const uls = series(50, 54, 24, 4);
    const akr = series(35, 42, 24, 5);
    return veera.map((d, i) => ({ date: d.date, veera2: d.value, rudra: rudra[i].value, shadows: shadows[i].value, uls: uls[i].value, akr: akr[i].value }));
  })(),
  aiInsight: ['Veera 2 leads the market with strong audience reach and engagement.', 'Rudra: The Rise is rapidly closing the gap, driven by content strength and momentum.'],
  actions: [
    { text: "Counter Veera 2's momentum with high-impact trailer drops", impact: 'High' },
    { text: 'Increase engagement on character-driven content to improve sentiment', impact: 'Medium' },
    { text: 'Amplify share of voice on YouTube and Instagram', impact: 'Medium' },
  ],
};
