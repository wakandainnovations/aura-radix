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

export const overviewData = {
  stats: [
    { label: 'Total Campaigns', value: '7', caption: 'Active campaigns', delta: '2' },
    { label: 'Total Budget', value: '₹4.8 Cr', caption: 'Allocated budget', delta: '12%' },
    { label: 'Budget Spent', value: '₹1.9 Cr', caption: '39% of total budget', delta: '5%' },
    { label: 'Est. Impressions', value: '128M', caption: 'Total reach', delta: '18%' },
    { label: 'Est. Engagements', value: '6.4M', caption: 'Total engagements', delta: '21%' },
    { label: 'ROI (Projected)', value: '2.6x', caption: 'Return on investment', delta: '0.4x' },
  ],
  funnel: [
    { label: 'Awareness', value: '128M', delta: '18%', widthPct: 100, color: '#a78bfa' },
    { label: 'Consideration', value: '32M', delta: '14%', widthPct: 72, color: '#3987e5' },
    { label: 'Intent', value: '8.6M', delta: '12%', widthPct: 46, color: '#34d399' },
    { label: 'Conversion', value: '1.2M', delta: '9%', widthPct: 26, color: '#f97316' },
  ],
  timeline: [
    { label: 'Teaser Campaign', sub: 'Awareness', range: 'May 1 – May 12', startPct: 0, widthPct: 20, color: '#a78bfa' },
    { label: 'Trailer Campaign', sub: 'Consideration', range: 'May 14 – May 28', startPct: 22, widthPct: 25, color: '#3987e5' },
    { label: 'Digital Amplification', sub: 'Engagement', range: 'May 16 – Jun 25', startPct: 25, widthPct: 62, color: '#34d399' },
    { label: 'Influencer Outreach', sub: 'Engagement', range: 'May 15 – Jun 15', startPct: 23, widthPct: 50, color: '#f97316' },
    { label: 'Event Activations', sub: 'Engagement', range: 'Jun 1 – Jun 20', startPct: 51, widthPct: 32, color: '#fbbf24' },
    { label: 'Release Campaign', sub: 'Conversion', range: 'Jun 18 – Jul 2', startPct: 78, widthPct: 22, color: '#f87171' },
  ],
  topCampaigns: [
    { name: 'Trailer Campaign', rate: '4.8%', impressions: '38M' },
    { name: 'Digital Amplification', rate: '3.6%', impressions: '29M' },
    { name: 'Teaser Campaign', rate: '3.2%', impressions: '22M' },
    { name: 'Influencer Outreach', rate: '2.9%', impressions: '18M' },
    { name: 'Event Activations', rate: '2.1%', impressions: '12M' },
  ],
  budgetAllocation: [
    { label: 'Awareness', value: 35, pctLabel: '35% (₹1.68 Cr)', color: '#a78bfa' },
    { label: 'Consideration', value: 25, pctLabel: '25% (₹1.20 Cr)', color: '#3987e5' },
    { label: 'Engagement', value: 20, pctLabel: '20% (₹0.96 Cr)', color: '#34d399' },
    { label: 'Events', value: 10, pctLabel: '10% (₹0.48 Cr)', color: '#f97316' },
    { label: 'Conversion', value: 10, pctLabel: '10% (₹0.48 Cr)', color: '#f87171' },
  ],
  channelMix: [
    { label: 'YouTube', budget: '₹1.44 Cr', pct: '30%', tone: 'good' },
    { label: 'Instagram', budget: '₹1.15 Cr', pct: '24%', tone: 'good' },
    { label: 'TV', budget: '₹0.86 Cr', pct: '18%', tone: 'warning' },
    { label: 'X (Twitter)', budget: '₹0.58 Cr', pct: '12%', tone: 'warning' },
    { label: 'Print', budget: '₹0.38 Cr', pct: '8%', tone: 'bad' },
    { label: 'Others', budget: '₹0.38 Cr', pct: '8%', tone: 'warning' },
  ],
  aiInsight: ['Trailer Campaign is delivering the highest engagement at the consideration stage.', 'Consider increasing budget on YouTube and Instagram for maximum reach.'],
  actions: [
    { text: 'Increase budget for Trailer Campaign by 15%', impact: 'High' },
    { text: 'Add behind-the-scenes content to boost engagement', impact: 'Medium' },
    { text: 'Schedule influencer live sessions before trailer release', impact: 'Medium' },
  ],
};

export const campaignsData = {
  stats: [
    { label: 'Total Campaigns', value: '7', caption: 'Active campaigns', delta: '2' },
    { label: 'Total Budget', value: '₹4.8 Cr', caption: 'Allocated budget', delta: '12%' },
    { label: 'Total Spent', value: '₹1.9 Cr', caption: 'Spent to date', delta: '5%' },
    { label: 'Avg. Engagement Rate', value: '4.2%', caption: 'Across all campaigns', delta: '8%' },
    { label: 'Avg. CPC (Cost Per Click)', value: '₹3.12', caption: 'Across all campaigns', delta: '-6%', deltaTone: 'good' },
    { label: 'ROAS (Projected)', value: '2.6x', caption: 'Return on ad spend', delta: '0.4x' },
  ],
  all: [
    { name: 'Teaser Campaign', objective: 'Awareness', budget: '₹65L', spent: '₹28L', rate: '3.8%', impressions: '18M', ctr: '1.9%', roas: '2.1x', status: 'Active' },
    { name: 'Trailer Campaign', objective: 'Consideration', budget: '₹1.20 Cr', spent: '₹68L', rate: '5.2%', impressions: '25M', ctr: '2.4%', roas: '2.8x', status: 'Active' },
    { name: 'Digital Amplification', objective: 'Engagement', budget: '₹1.00 Cr', spent: '₹52L', rate: '6.1%', impressions: '32M', ctr: '2.8%', roas: '3.2x', status: 'Active' },
    { name: 'Influencer Outreach', objective: 'Engagement', budget: '₹75L', spent: '₹35L', rate: '4.6%', impressions: '12M', ctr: '2.1%', roas: '2.0x', status: 'Active' },
    { name: 'Event Activations', objective: 'Engagement', budget: '₹60L', spent: '₹18L', rate: '3.1%', impressions: '4.5M', ctr: '1.6%', roas: '1.6x', status: 'Scheduled' },
    { name: 'Release Campaign', objective: 'Conversion', budget: '₹1.10 Cr', spent: '₹56L', rate: '5.9%', impressions: '27M', ctr: '2.6%', roas: '3.0x', status: 'Scheduled' },
    { name: 'Retargeting Campaign', objective: 'Conversion', budget: '₹80L', spent: '₹12L', rate: '6.7%', impressions: '8.2M', ctr: '3.2%', roas: '3.8x', status: 'Draft' },
  ],
  statusBreakdown: [
    { label: 'Active', value: 4, pctLabel: '4 (57%)', color: '#34d399' },
    { label: 'Scheduled', value: 2, pctLabel: '2 (29%)', color: '#3987e5' },
    { label: 'Draft', value: 1, pctLabel: '1 (14%)', color: '#94a3b8' },
    { label: 'Paused', value: 0, pctLabel: '0 (0%)', color: '#f87171' },
  ],
  performanceOverTime: (() => {
    const imp = series(10, 40, 24, 1);
    const eng = series(2, 8, 24, 2);
    const roas = series(2, 3.5, 24, 3);
    return imp.map((d, i) => ({ date: d.date, impressions: d.value, engagement: eng[i].value * 3, roas: roas[i].value * 8 }));
  })(),
  topPerforming: { name: 'Digital Amplification', category: 'Engagement', rate: '6.1%' },
  aiInsight: ['Digital Amplification and Trailer Campaign are driving the highest engagement and ROAS.', 'Consider increasing budget for high-performing campaigns and pausing underperforming ads.'],
  actions: [
    { text: 'Increase budget for Digital Amplification by 15%', impact: 'High' },
    { text: 'Pause low-performing ads in Teaser Campaign', impact: 'Medium' },
    { text: 'Launch retargeting ads 7 days before release', impact: 'Medium' },
  ],
};

export const calendarData = {
  stats: [
    { label: 'Upcoming Campaigns', value: '7', caption: 'Next 30 days' },
    { label: 'Key Milestones', value: '5', caption: 'Next 30 days' },
    { label: 'Total Investment (30 days)', value: '₹1.9 Cr', delta: '12%' },
    { label: 'Est. Impressions (30 days)', value: '78M', delta: '15%' },
    { label: 'Est. Engagements (30 days)', value: '3.2M', delta: '18%' },
  ],
  events: [
    { label: 'Teaser Campaign', range: 'May 1 – May 12', weekIdx: 0, startCol: 4, span: 4, color: 'bg-purple-500/70' },
    { label: 'Trailer Campaign', range: 'May 14 – May 28', weekIdx: 1, startCol: 3, span: 4, color: 'bg-blue-500/70' },
    { label: 'Digital Amplification', range: 'May 10 – Jun 25', weekIdx: 1, startCol: 6, span: 1, color: 'bg-emerald-500/70' },
    { label: 'Influencer Outreach', range: 'May 15 – Jun 15', weekIdx: 3, startCol: 3, span: 4, color: 'bg-orange-500/70' },
    { label: 'Event Activations', range: 'Jun 1 – Jun 20', weekIdx: 4, startCol: 0, span: 7, color: 'bg-amber-500/70' },
    { label: 'Release Campaign', range: 'Jun 18 – Jul 2', weekIdx: 5, startCol: 4, span: 3, color: 'bg-red-500/70' },
  ],
  milestones: [
    { date: 'May 7, 2025', label: 'Trailer First Look', tag: 'Awareness' },
    { date: 'May 12, 2025', label: 'Teaser Launch', tag: 'Awareness' },
    { date: 'May 20, 2025', label: 'Mid-Campaign Review', tag: 'Engagement' },
    { date: 'May 30, 2025', label: 'Event Kickoff', tag: 'Engagement' },
    { date: 'Jun 18, 2025', label: 'Release Date', tag: 'Conversion' },
  ],
  distribution: [
    { label: 'YouTube', value: 36, pctLabel: '36% (₹68L)', color: '#f87171' },
    { label: 'Instagram', value: 24, pctLabel: '24% (₹46L)', color: '#f472b6' },
    { label: 'TV', value: 17, pctLabel: '17% (₹32L)', color: '#3987e5' },
    { label: 'X (Twitter)', value: 12, pctLabel: '12% (₹23L)', color: '#94a3b8' },
    { label: 'Print', value: 8, pctLabel: '8% (₹15L)', color: '#fbbf24' },
    { label: 'Others', value: 3, pctLabel: '3% (₹5L)', color: '#64748b' },
  ],
  aiInsight: 'Your campaigns are well-paced. Consider front-loading digital spend for Trailer Campaign to maximize awareness before teaser momentum peaks.',
  actions: [
    { text: 'Increase digital spend for Trailer Campaign by 15% before May 14', impact: 'High' },
    { text: 'Add influencer live sessions in the week of May 20', impact: 'Medium' },
    { text: 'Boost YouTube views with in-stream ads 3 days before trailer release', impact: 'Medium' },
  ],
};

export const budgetingData = {
  stats: [
    { label: 'Total Budget', value: '₹4.8 Cr', caption: 'Allocated budget', delta: '12%' },
    { label: 'Budget Spent', value: '₹1.9 Cr', caption: 'Spent to date (39%)', delta: '5%' },
    { label: 'Remaining Budget', value: '₹2.9 Cr', caption: 'Remaining (61%)' },
    { label: 'Forecasted Spend', value: '₹4.6 Cr', caption: 'By end of period', delta: '8%' },
    { label: 'Budget Pace', value: 'On Track', caption: 'Spending within plan', delta: '3%' },
  ],
  byCampaign: [
    { name: 'Trailer Campaign', budget: '₹1.20 Cr', pct: 25, spent: '₹68L', spentPct: 57, remaining: '₹52L', pace: 'On Track' },
    { name: 'Digital Amplification', budget: '₹1.00 Cr', pct: 21, spent: '₹52L', spentPct: 52, remaining: '₹48L', pace: 'On Track' },
    { name: 'Teaser Campaign', budget: '₹65L', pct: 14, spent: '₹28L', spentPct: 43, remaining: '₹37L', pace: 'Under' },
    { name: 'Influencer Outreach', budget: '₹75L', pct: 16, spent: '₹35L', spentPct: 47, remaining: '₹40L', pace: 'On Track' },
    { name: 'Event Activations', budget: '₹60L', pct: 13, spent: '₹18L', spentPct: 30, remaining: '₹42L', pace: 'Under' },
    { name: 'Release Campaign', budget: '₹1.10 Cr', pct: 23, spent: '₹56L', spentPct: 51, remaining: '₹54L', pace: 'On Track' },
    { name: 'Retargeting Campaign', budget: '₹80L', pct: 17, spent: '₹12L', spentPct: 15, remaining: '₹68L', pace: 'Under' },
  ],
  byChannel: [
    { label: 'YouTube', value: '₹1.44 Cr', pct: 30, color: '#f87171' },
    { label: 'Instagram', value: '₹1.15 Cr', pct: 24, color: '#a78bfa' },
    { label: 'TV', value: '₹0.86 Cr', pct: 18, color: '#3987e5' },
    { label: 'X (Twitter)', value: '₹0.58 Cr', pct: 12, color: '#22d3ee' },
    { label: 'Print', value: '₹0.38 Cr', pct: 8, color: '#fbbf24' },
    { label: 'Others', value: '₹0.29 Cr', pct: 6, color: '#64748b' },
  ],
  dailyPace: (() => {
    const planned = series(0, 60000000, 31, 1);
    const actual = series(0, 46000000, 31, 2);
    return planned.map((d, i) => ({ date: d.date, planned: d.value, actual: actual[i].value }));
  })(),
  forecast: { total: '₹4.6 Cr', variance: '-₹18L', best: '₹4.3 Cr', likely: '₹4.6 Cr', worst: '₹4.9 Cr' },
  overUnder: [
    { name: 'Teaser Campaign', variance: '-₹9L', pct: '-13%', status: 'Under' },
    { name: 'Event Activations', variance: '-₹7L', pct: '-12%', status: 'Under' },
    { name: 'Release Campaign', variance: '+₹6L', pct: '+11%', status: 'Over' },
    { name: 'Trailer Campaign', variance: '+₹5L', pct: '+8%', status: 'Over' },
    { name: 'Influencer Outreach', variance: '-₹4L', pct: '-9%', status: 'Under' },
  ],
  aiInsight: ["You're pacing 3% under plan, mainly due to lower spend in Teaser and Event campaigns.", 'Consider reallocating ₹15L to high-performing channels (YouTube, Instagram).'],
  actions: [
    { text: 'Reallocate budget from underperforming to high-ROI channels', impact: 'High' },
    { text: 'Increase spend on Trailer Campaign before May 14', impact: 'Medium' },
    { text: 'Review and reduce print spend by 10%', impact: 'Low' },
  ],
};

export const creativeOverviewData = {
  stats: [
    { label: 'Total Creative Assets', value: '42', caption: 'Active assets', delta: '8' },
    { label: 'Avg. Asset Engagement Rate', value: '4.7%', delta: '0.6 pts' },
    { label: 'Top Performing Format', value: 'Trailer', caption: '38% of total engagement' },
    { label: 'Concepts in Development', value: '7', caption: 'In progress' },
    { label: 'Assets Pending Approval', value: '3', caption: 'Awaiting review' },
  ],
  performance: [
    { format: 'Trailer', assets: 8, rate: '5.4%', impressions: '18M' },
    { format: 'Teaser', assets: 6, rate: '4.8%', impressions: '12M' },
    { format: 'Video Clips', assets: 10, rate: '4.1%', impressions: '16M' },
    { format: 'Posters / Key Art', assets: 6, rate: '2.9%', impressions: '8.2M' },
    { format: 'Behind-the-Scenes', assets: 7, rate: '2.6%', impressions: '6.1M' },
    { format: 'Character Content', assets: 5, rate: '2.3%', impressions: '4.8M' },
  ],
  byPlatform: [
    { label: 'YouTube', value: 38, pctLabel: '2.4M (38%)', color: '#f87171' },
    { label: 'Instagram', value: 28, pctLabel: '1.8M (28%)', color: '#f472b6' },
    { label: 'Facebook', value: 17, pctLabel: '1.1M (17%)', color: '#3987e5' },
    { label: 'X (Twitter)', value: 10, pctLabel: '620K (10%)', color: '#94a3b8' },
    { label: 'Others', value: 7, pctLabel: '480K (7%)', color: '#64748b' },
  ],
  topAssets: [
    { rank: 1, name: 'Official Trailer 2', type: 'Trailer', date: 'May 2, 2025', rate: '6.8%' },
    { rank: 2, name: 'Teaser - Power Within', type: 'Teaser', date: 'Apr 28, 2025', rate: '5.6%' },
    { rank: 3, name: 'Character Reveal: The Antagonist', type: 'Character', date: 'May 6, 2025', rate: '4.9%' },
    { rank: 4, name: 'BTS: Fight Choreography', type: 'BTS', date: 'May 5, 2025', rate: '3.8%' },
    { rank: 5, name: 'New Poster - IMAX', type: 'Poster', date: 'Apr 30, 2025', rate: '3.2%' },
  ],
  pipeline: [
    { stage: 'Ideation', count: 12, items: ['Concept A', 'Concept B', 'Concept C', '+ 9 more'] },
    { stage: 'Development', count: 7, items: ['Concept D', 'Concept E', 'Concept F', '+ 4 more'] },
    { stage: 'Production', count: 9, items: ['Concept G', 'Concept H', 'Concept I', '+ 6 more'] },
    { stage: 'Ready', count: 6, items: ['Concept J', 'Concept K', 'Concept L', '+ 3 more'] },
    { stage: 'Live', count: 8, items: ['Trailer 2', 'Teaser', 'Clip Pack', '+ 5 more'] },
  ],
  testing: [
    { name: 'Trailer 2 Thumbnail', a: 53, b: 47, winner: 'A' },
    { name: 'Teaser Hook (0-5s)', a: 59, b: 41, winner: 'A' },
    { name: 'Poster - Color Tone', a: 46, b: 54, winner: 'B' },
  ],
  approvals: [
    { name: 'Trailer 3 (Final Cut)', type: 'Trailer', date: 'May 12, 2025' },
    { name: 'Teaser Cutdown 15s', type: 'Teaser', date: 'May 10, 2025' },
    { name: 'Character Poster - Villain', type: 'Poster', date: 'May 11, 2025' },
  ],
  aiInsight: ['Trailers and teasers are driving the highest engagement.', 'Concepts with character reveals perform 1.6x better than average.'],
  actions: [
    { text: 'Increase spend behind top-performing trailer assets', impact: 'High' },
    { text: 'Produce more character reveal content', impact: 'Medium' },
    { text: 'A/B test poster variations for release week', impact: 'Medium' },
  ],
};

export const distributionData = {
  stats: [
    { label: 'Total Budget', value: '₹4.8 Cr', caption: 'Allocated', delta: '100%' },
    { label: 'Total Reach', value: '28.6 Cr', caption: 'Est. Impressions' },
    { label: 'Total Spend', value: '₹4.5 Cr', caption: 'Planned', delta: '94%' },
    { label: 'Channels', value: '5', caption: 'Active' },
    { label: 'Avg. CPM', value: '₹16.0', caption: 'vs plan', delta: '-26%', deltaTone: 'good' },
    { label: 'Predicted ROI', value: '2.6x', caption: 'vs plan', delta: '18%' },
  ],
  plan: [
    { channel: 'YouTube', pct: '30%', budget: '1.44 Cr', impressions: '8.6', reach: '6.2', freq: '3.1', cpm: '16.7', start: 'May 1', end: 'May 15', status: 'Planned' },
    { channel: 'Instagram', pct: '24%', budget: '1.15 Cr', impressions: '7.0', reach: '5.1', freq: '2.7', cpm: '16.4', start: 'May 1', end: 'May 15', status: 'Planned' },
    { channel: 'TV', pct: '18%', budget: '0.86 Cr', impressions: '5.6', reach: '4.2', freq: '6.0', cpm: '15.4', start: 'May 3', end: 'May 15', status: 'Planned' },
    { channel: 'X (Twitter)', pct: '12%', budget: '0.58 Cr', impressions: '3.0', reach: '2.1', freq: '1.9', cpm: '19.3', start: 'May 1', end: 'May 15', status: 'Planned' },
    { channel: 'Print', pct: '8%', budget: '0.38 Cr', impressions: '1.9', reach: '1.4', freq: '1.4', cpm: '20.0', start: 'May 5', end: 'May 12', status: 'Planned' },
    { channel: 'Others', pct: '8%', budget: '0.38 Cr', impressions: '2.3', reach: '1.6', freq: '1.8', cpm: '16.5', start: 'May 1', end: 'May 15', status: 'Planned' },
  ],
  overview: [
    { label: 'YouTube', value: 30, pctLabel: '30% (1.44 Cr)', color: '#f87171' },
    { label: 'Instagram', value: 24, pctLabel: '24% (1.15 Cr)', color: '#a78bfa' },
    { label: 'TV', value: 18, pctLabel: '18% (0.86 Cr)', color: '#3987e5' },
    { label: 'X (Twitter)', value: 12, pctLabel: '12% (0.58 Cr)', color: '#94a3b8' },
    { label: 'Print', value: 8, pctLabel: '8% (0.38 Cr)', color: '#fbbf24' },
    { label: 'Others', value: 8, pctLabel: '8% (0.38 Cr)', color: '#64748b' },
  ],
  schedule: [
    { label: 'YouTube', range: 'May 1 – May 15', startPct: 0, widthPct: 100, color: 'bg-red-500/60' },
    { label: 'Instagram', range: 'May 1 – May 15', startPct: 0, widthPct: 100, color: 'bg-purple-500/60' },
    { label: 'TV', range: 'May 3 – May 15', startPct: 13, widthPct: 87, color: 'bg-blue-500/60' },
    { label: 'X (Twitter)', range: 'May 1 – May 15', startPct: 0, widthPct: 100, color: 'bg-slate-400/60' },
    { label: 'Print', range: 'May 5 – May 12', startPct: 27, widthPct: 47, color: 'bg-amber-500/60' },
    { label: 'Others', range: 'May 1 – May 15', startPct: 0, widthPct: 100, color: 'bg-slate-500/60' },
  ],
  utilization: [
    { label: 'YouTube', pct: 92 },
    { label: 'Instagram', pct: 88 },
    { label: 'TV', pct: 95 },
    { label: 'X (Twitter)', pct: 98 },
    { label: 'Print', pct: 87 },
    { label: 'Others', pct: 90 },
  ],
  actions: [
    { text: 'Increase YouTube spend by 20% during May 1 – May 7', impact: 'High' },
    { text: 'Shift 5% from Print to Digital for better ROI', impact: 'Medium' },
    { text: 'Extend TV campaign by 3 days in key regions', impact: 'Medium' },
    { text: 'A/B test Instagram creatives for better CTR', impact: 'High' },
  ],
  keyTakeaways: [
    { text: 'Optimized budget allocation across high-performing channels', impact: 'High' },
    { text: 'Strong digital presence to maximize audience engagement', impact: 'High' },
    { text: 'Balanced distribution for awareness and conversions', impact: 'Medium' },
  ],
  aiInsight: 'Your distribution plan is optimized for maximum reach and engagement. Digital channels are expected to drive 78% of total reach with the highest engagement potential.',
};
