const DATES = ['Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'];

function series(start, end, points = 28) {
  const out = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = Math.sin(i * 1.6) * (end - start) * 0.05;
    const dateIdx = Math.round(t * (DATES.length - 1));
    out.push({ date: DATES[dateIdx], value: Math.max(0, Math.round(start + (end - start) * t + noise)) });
  }
  return out;
}

export const AXIS_TICKS_15D = ['Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'];

export const performanceData = {
  stats: [
    { label: 'Buzz', value: '3.2M', delta: '18%', iconKey: 'buzz', spark: series(2, 20, 8).map((d) => d.value) },
    { label: 'Sentiment Score', value: '81', suffix: '/100', delta: '5 pts', iconKey: 'sentiment', spark: series(70, 81, 8).map((d) => d.value) },
    { label: 'Awareness', value: '84', suffix: '/100', delta: '12%', iconKey: 'awareness', spark: series(65, 84, 8).map((d) => d.value) },
    { label: 'Engagement', value: '2.7M', delta: '16%', iconKey: 'engagement', spark: series(2, 18, 8).map((d) => d.value) },
    { label: 'Marketing Momentum', value: '88', suffix: '/100', delta: '14%', iconKey: 'momentum', spark: series(68, 88, 8).map((d) => d.value) },
  ],
  buzzOverTime: series(700000, 3200000).map((d) => ({ date: d.date, value: d.value })),
  topDrivers: [
    { label: 'Song Release', pct: 42, caption: 'Buzz increase', iconKey: 'song' },
    { label: 'Trailer Launch', pct: 28, caption: 'Engagement increase', iconKey: 'trailer' },
    { label: 'Media Coverage', pct: 18, caption: 'Reach increase', iconKey: 'media' },
    { label: 'Fan Conversations', pct: 15, caption: 'Volume increase', iconKey: 'fan' },
  ],
  platformBreakdown: [
    { label: 'X (Twitter)', value: 38, color: '#cbd5e1' },
    { label: 'Instagram', value: 26, color: '#f472b6' },
    { label: 'YouTube', value: 16, color: '#f87171' },
    { label: 'Facebook', value: 10, color: '#3987e5' },
    { label: 'Others', value: 10, color: '#64748b' },
  ],
  sentimentDistribution: [
    { label: 'Positive', value: 60, pctLabel: '2.4M (60%)', color: '#34d399' },
    { label: 'Neutral', value: 14, pctLabel: '560K (14%)', color: '#94a3b8' },
    { label: 'Negative', value: 6, pctLabel: '240K (6%)', color: '#f87171' },
  ],
  topRegions: [
    { label: 'Tamil Nadu', pct: 28 },
    { label: 'Karnataka', pct: 16 },
    { label: 'Telangana', pct: 12 },
    { label: 'Maharashtra', pct: 10 },
    { label: 'Kerala', pct: 8 },
  ],
  regionMarkers: [
    { xPct: 45, yPct: 78, size: 14, color: '#a78bfa', label: 'Tamil Nadu' },
    { xPct: 40, yPct: 60, size: 10, color: '#a78bfa', label: 'Karnataka' },
    { xPct: 48, yPct: 55, size: 8, color: '#a78bfa', label: 'Telangana' },
    { xPct: 30, yPct: 45, size: 8, color: '#a78bfa', label: 'Maharashtra' },
    { xPct: 38, yPct: 85, size: 6, color: '#a78bfa', label: 'Kerala' },
  ],
};

export const timelineData = {
  tracks: [
    {
      key: 'content', label: 'Content Releases', count: 6, colorClass: 'bg-purple-500/25 border-purple-500/50 text-purple-200',
      segments: [
        { label: 'Teaser', sublabel: 'Apr 28 – May 2', startPct: 0, widthPct: 13 },
        { label: 'First Single', sublabel: 'May 3 – May 6', startPct: 13, widthPct: 20 },
        { label: 'Lyric Video', sublabel: 'May 8 – May 9', startPct: 47, widthPct: 13 },
        { label: 'Trailer', sublabel: 'May 12 – May 14', startPct: 73, widthPct: 13 },
        { label: 'Character Posters', sublabel: 'May 15', startPct: 93, widthPct: 7 },
      ],
    },
    {
      key: 'marketing', label: 'Marketing Campaigns', count: 5, colorClass: 'bg-teal-500/25 border-teal-500/50 text-teal-200',
      segments: [
        { label: 'Teaser Campaign', sublabel: 'Apr 28 – May 2', startPct: 0, widthPct: 13 },
        { label: 'Song Launch Campaign', sublabel: 'May 3 – May 7', startPct: 13, widthPct: 27 },
        { label: 'Trailer Campaign', sublabel: 'May 12 – May 15', startPct: 73, widthPct: 27 },
      ],
    },
    {
      key: 'media', label: 'Media & PR', count: 4, colorClass: 'bg-amber-500/25 border-amber-500/50 text-amber-200',
      segments: [
        { label: 'Press Note – Teaser', sublabel: 'Apr 28 – Apr 30', startPct: 0, widthPct: 13 },
        { label: 'Interviews (Round 1)', sublabel: 'May 5 – May 7', startPct: 27, widthPct: 13 },
        { label: 'Press Meet', sublabel: 'May 10', startPct: 60, widthPct: 7 },
        { label: 'Interviews (Round 2)', sublabel: 'May 12 – May 14', startPct: 73, widthPct: 13 },
      ],
    },
    {
      key: 'events', label: 'Events & Appearances', count: 3, colorClass: 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200',
      segments: [
        { label: 'Fan Meet – Chennai', sublabel: 'May 4', startPct: 27, widthPct: 7 },
        { label: 'College Tour – Bengaluru', sublabel: 'May 8 – May 9', startPct: 47, widthPct: 13 },
        { label: 'Fan Screening – Mumbai', sublabel: 'May 13', startPct: 80, widthPct: 7 },
      ],
    },
    {
      key: 'distribution', label: 'Distribution', count: 2, colorClass: 'bg-blue-500/25 border-blue-500/50 text-blue-200',
      segments: [
        { label: 'Trailer to Theatres', sublabel: 'May 11', startPct: 67, widthPct: 7 },
        { label: 'Print Dispatch', sublabel: 'May 13 – May 15', startPct: 80, widthPct: 20 },
      ],
    },
  ],
  milestones: [
    { label: 'Teaser Released', date: 'Apr 28', startPct: 0 },
    { label: 'First Single Out', date: 'May 3', startPct: 13 },
    { label: '100M Views', date: 'May 7', startPct: 40 },
    { label: 'Trailer Out', date: 'May 12', startPct: 73 },
    { label: 'Release Day', date: 'May 22', startPct: 100 },
  ],
  upcomingActivities: [
    { label: 'Lyric Video Release', category: 'Content Release', date: 'May 8, 2025' },
    { label: 'College Tour – Bengaluru', category: 'Event', date: 'May 8 – 9, 2025' },
    { label: 'Press Meet', category: 'Media & PR', date: 'May 10, 2025' },
    { label: 'Trailer Release', category: 'Content Release', date: 'May 12, 2025' },
    { label: 'Trailer Campaign Kickoff', category: 'Marketing Campaign', date: 'May 12, 2025' },
  ],
  campaignProgress: [
    { label: 'Completed', value: 18, pctLabel: '18 (60%)', color: '#34d399' },
    { label: 'In Progress', value: 8, pctLabel: '8 (27%)', color: '#3987e5' },
    { label: 'Upcoming', value: 4, pctLabel: '4 (13%)', color: '#a78bfa' },
    { label: 'Overdue', value: 0, pctLabel: '0 (0%)', color: '#f87171' },
  ],
  activityHealth: [
    { label: 'On Track', value: 21, pct: 70, tone: 'good' },
    { label: 'At Risk', value: 7, pct: 23, tone: 'warning' },
    { label: 'Delayed', value: 2, pct: 7, tone: 'bad' },
  ],
  aiInsight: 'Your trailer campaign is scheduled well. Consider releasing behind-the-scenes content between May 9–11 to maintain momentum.',
};

export const assetsData = {
  stats: { total: 128, approved: 86, approvedPct: 67, inReview: 28, inReviewPct: 22, draft: 14, draftPct: 11 },
  categories: [
    { label: 'All Assets', count: 128 },
    { label: 'Posters', count: 18 },
    { label: 'Trailers', count: 12 },
    { label: 'Teasers', count: 8 },
    { label: 'Clips', count: 24 },
    { label: 'Banners', count: 22 },
    { label: 'Social Media', count: 28 },
    { label: 'TV Spots', count: 6 },
    { label: 'Audio', count: 6 },
    { label: 'Other', count: 4 },
  ],
  assets: [
    { title: 'Official Poster', type: 'Poster', status: 'Approved', duration: null, updated: '2h ago', platforms: ['instagram', 'facebook', 'x'] },
    { title: 'Official Trailer', type: 'Trailer', status: 'Approved', duration: '2:32', updated: '5h ago', platforms: ['youtube', 'instagram', 'facebook', 'x'] },
    { title: 'Official Teaser', type: 'Teaser', status: 'In Review', duration: '1:05', updated: '1d ago', platforms: ['youtube', 'instagram', 'facebook', 'x'] },
    { title: 'Anthem (Lyric Video)', type: 'Song', status: 'Approved', duration: '4:12', updated: '1d ago', platforms: ['youtube', 'instagram'] },
    { title: 'Release Date Banner', type: 'Banner', status: 'Approved', duration: null, updated: '2d ago', platforms: ['instagram', 'x'] },
    { title: 'Dialogue Promo 1', type: 'Clip', status: 'Draft', duration: '0:45', updated: '2d ago', platforms: ['instagram', 'facebook', 'x'] },
    { title: 'TV Spot - 30s', type: 'TV Spot', status: 'In Review', duration: '0:30', updated: '3d ago', platforms: [] },
    { title: 'Character Poster', type: 'Poster', status: 'Approved', duration: null, updated: '3d ago', platforms: ['instagram', 'facebook', 'x'] },
    { title: 'Behind The Scenes', type: 'Clip', status: 'Approved', duration: '2:15', updated: '4d ago', platforms: ['youtube', 'instagram', 'facebook'] },
    { title: 'Motion Poster', type: 'Poster', status: 'Approved', duration: '0:15', updated: '4d ago', platforms: ['instagram', 'facebook', 'x'] },
    { title: 'Song Promo - 15s', type: 'Clip', status: 'Draft', duration: '0:30', updated: '4d ago', platforms: ['instagram', 'facebook', 'x'] },
    { title: 'Press Kit', type: 'Document', status: 'In Review', duration: null, updated: '5d ago', platforms: [] },
  ],
  performanceSummary: [
    { name: 'Official Trailer', type: 'Trailer', score: 92, delta: 18 },
    { name: 'Anthem (Lyric Video)', type: 'Audio', score: 88, delta: 22 },
    { name: 'Official Poster', type: 'Poster', score: 76, delta: 12 },
  ],
  statusBreakdown: [
    { label: 'Approved', value: 67, pctLabel: '86 (67%)', color: '#34d399' },
    { label: 'In Review', value: 22, pctLabel: '28 (22%)', color: '#fbbf24' },
    { label: 'Draft', value: 11, pctLabel: '14 (11%)', color: '#3987e5' },
  ],
  gaps: [
    { label: 'More behind-the-scenes content', caption: 'High audience interest, low asset coverage' },
    { label: 'Song promo clips', caption: 'High engagement potential before release' },
    { label: 'Regional language posters', caption: 'Low coverage in key regional markets' },
  ],
};

export const reportsData = {
  stats: [
    { label: 'Total Reports', value: 24, delta: '14%' },
    { label: 'Generated by AI', value: 16, delta: '23%' },
    { label: 'Downloaded', value: 8, delta: '12%' },
    { label: 'Shared', value: 5, delta: '25%' },
  ],
  featured: [
    { title: 'Executive Summary', description: 'Top-level overview of movie performance across all key metrics.', date: 'May 15, 2025', iconKey: 'summary' },
    { title: 'Audience Deep Dive', description: 'Detailed analysis of audience sentiment, themes and conversations.', date: 'May 14, 2025', iconKey: 'audience' },
    { title: 'Campaign Effectiveness', description: 'Performance breakdown of marketing campaigns and spend efficiency.', date: 'May 13, 2025', iconKey: 'campaign' },
  ],
  recent: [
    { title: 'Weekend Performance Report', date: 'May 15, 2025', tag: 'AI Generated' },
    { title: 'Social Listening Summary', date: 'May 15, 2025', tag: 'AI Generated' },
    { title: 'Trailer Performance Report', date: 'May 14, 2025', tag: 'AI Generated' },
    { title: 'Regional Performance Breakdown', date: 'May 13, 2025', tag: 'Manual' },
    { title: 'Competitor Impact Analysis', date: 'May 12, 2025', tag: 'AI Generated' },
  ],
  keyInsights: [
    { text: 'Buzz increased 18% this week', caption: 'Mainly driven by lyric video and media coverage.', source: 'Executive Summary', date: 'May 15' },
    { text: 'Comedy and Mass Elements are top positive themes', caption: '80% of positive conversations highlight these strengths.', source: 'Audience Deep Dive', date: 'May 14' },
    { text: 'Trailer views up 28% after trailer campaign', caption: 'Strong uplift from Tier 2 & 3 cities.', source: 'Campaign Effectiveness', date: 'May 13' },
    { text: 'Runtime concerns rising in negative sentiment', caption: '18% increase in conversations around runtime.', source: 'Social Listening Summary', date: 'May 15' },
  ],
  reportsOverTime: [
    { label: 'Apr 16–22', value: 8 },
    { label: 'Apr 23–29', value: 11 },
    { label: 'Apr 30–May 6', value: 14 },
    { label: 'May 7–13', value: 17 },
    { label: 'May 14–15', value: 9 },
  ],
};
