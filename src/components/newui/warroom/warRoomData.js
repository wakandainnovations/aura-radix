function series(start, end, points = 20, seed = 1) {
  const out = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = Math.sin(i * 1.7 * seed) * (end - start) * 0.06;
    const label = `${11 + Math.floor(i / 4)}:${String((i % 4) * 15).padStart(2, '0')}`;
    out.push({ date: label, value: Math.max(0, Math.round(start + (end - start) * t + noise)) });
  }
  return out;
}

const TIME_TICKS = ['11:00', '11:15', '11:30', '11:45', '12:00'];

export const overviewData = {
  stats: [
    { label: 'Movie Health', value: '82', suffix: '/100', badge: { text: 'Healthy', tone: 'good' }, delta: '12', caption: 'vs yesterday' },
    { label: 'Buzz / min', value: '14.8K', delta: '42%', caption: 'vs last 60 min' },
    { label: 'Positive Sentiment', value: '71%', delta: '8%', caption: 'vs last 60 min' },
    { label: 'Ticketing Velocity', value: '8.6K', delta: '36%', caption: 'tickets / hour' },
    { label: 'Critical Alerts', value: '2', badge: { text: 'Active', tone: 'bad' }, delta: '1 new', deltaTone: 'bad', caption: '' },
    { label: 'AI Confidence', value: '86%', badge: { text: 'High', tone: 'good' }, caption: 'in current recommendations' },
  ],
  buzzTrend: series(3000, 20000, 20, 1).map((d, i) => ({ date: TIME_TICKS[Math.floor((i / 19) * 4)], value: d.value })),
  buzzBreakdown: [
    { label: 'Positive', pct: 71, color: '#34d399' },
    { label: 'Neutral', pct: 21, color: '#94a3b8' },
    { label: 'Negative', pct: 8, color: '#f87171' },
  ],
  healthScore: 82,
  healthDrivers: [
    { label: 'Buzz', level: 'Strong', pct: 88 },
    { label: 'Sentiment', level: 'Strong', pct: 82 },
    { label: 'Engagement', level: 'Strong', pct: 85 },
    { label: 'Reach', level: 'Moderate', pct: 58 },
    { label: 'Ticketing', level: 'Strong', pct: 80 },
    { label: 'Media Coverage', level: 'Moderate', pct: 55 },
  ],
  liveAlerts: [
    { text: 'Trailer crossed 1M views/hour on YouTube!', caption: 'Current rate: 1.2M views/hour', time: 'Just now', iconKey: 'trend' },
    { text: 'Negative hashtag #TooLongRuntime trending on X', caption: 'Mentions increased by 180% in 30 min', time: '3 min ago', iconKey: 'hashtag' },
    { text: 'Ticket bookings surged in Bengaluru!', caption: '+64% vs last hour', time: '5 min ago', iconKey: 'ticket' },
    { text: 'Lead Cast Tweet detected', caption: 'High engagement incoming', time: '8 min ago', iconKey: 'user' },
    { text: 'Major entertainment portal article published', caption: 'Positive coverage', time: '12 min ago', iconKey: 'article' },
  ],
  platformHealth: [
    { label: 'YouTube', status: 'Normal', spark: series(30, 60, 8, 1).map((d) => d.value) },
    { label: 'Instagram', status: 'Rising', spark: series(30, 70, 8, 2).map((d) => d.value) },
    { label: 'X (Twitter)', status: 'Rising', spark: series(20, 55, 8, 3).map((d) => d.value) },
    { label: 'Reddit', status: 'Normal', spark: series(20, 30, 8, 4).map((d) => d.value) },
    { label: 'Facebook', status: 'Normal', spark: series(18, 28, 8, 5).map((d) => d.value) },
  ],
  emergingTopics: [
    { rank: 1, label: 'Interval Block', volume: '28.4K', delta: '156%' },
    { rank: 2, label: 'Villain (Rudra)', volume: '22.1K', delta: '98%' },
    { rank: 3, label: 'Music / Songs', volume: '18.7K', delta: '72%' },
    { rank: 4, label: 'Runtime', volume: '15.3K', delta: '210%' },
    { rank: 5, label: 'Comedy', volume: '12.9K', delta: '65%' },
  ],
  aiMessage: 'Positive momentum in Karnataka is higher than expected. Trailer reactions are driving strong engagement across YouTube and Instagram. Negative chatter around runtime is rising on X.\n\nI recommend pushing paid media for the next 3 hours, releasing a behind-the-scenes clip, and having lead cast engage with fan reactions to sustain the momentum.',
  actions: [
    { text: 'Increase YouTube spend by 20% for next 3 hours', impact: 'High' },
    { text: 'Release BTS clip within 30 minutes', impact: 'High' },
    { text: 'Engage lead cast on X & Instagram for 1 hour', impact: 'Medium' },
    { text: 'Boost Instagram Reels campaign in Karnataka', impact: 'Medium' },
    { text: 'Monitor #TooLongRuntime closely for next 2 hours', impact: 'Low' },
  ],
};

export const liveMonitoringData = {
  stats: [
    { label: 'Movie Health', value: '82', suffix: '/100', badge: { text: 'Healthy', tone: 'good' } },
    { label: 'Buzz / min', value: '14.8K', delta: '42%', caption: 'vs last 60 min' },
    { label: 'Ticketing Velocity', value: '8.6K', delta: '36%', caption: 'tickets / hour' },
    { label: 'Active Alerts', value: '2', badge: { text: 'Active', tone: 'bad' } },
    { label: 'AI Confidence', value: '86%', badge: { text: 'High', tone: 'good' } },
  ],
  velocity: series(3000, 20000, 20, 1).map((d, i) => ({ date: TIME_TICKS[Math.floor((i / 19) * 4)], value: d.value })),
  bookings: series(2000, 82000, 20, 2).map((d, i) => ({ date: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM'][Math.floor((i / 19) * 5)], value: d.value })),
  heatmapCities: [
    { label: 'Delhi', xPct: 52, yPct: 32, size: 16, color: '#22d3ee' },
    { label: 'Mumbai', xPct: 28, yPct: 55, size: 22, color: '#f87171' },
    { label: 'Kolkata', xPct: 72, yPct: 42, size: 10, color: '#3987e5' },
    { label: 'Hyderabad', xPct: 48, yPct: 62, size: 18, color: '#fbbf24' },
    { label: 'Chennai', xPct: 45, yPct: 78, size: 14, color: '#34d399' },
  ],
  hashtags: [
    { rank: 1, tag: '#TooLongRuntime', volume: '24.8K', delta: '120%', bad: true },
    { rank: 2, tag: '#LordGaagaTrailer', volume: '18.6K', delta: '68%' },
    { rank: 3, tag: '#GaagaArrives', volume: '12.3K', delta: '53%' },
    { rank: 4, tag: '#GaagaFever', volume: '9.6K', delta: '41%' },
    { rank: 5, tag: '#VillainRudra', volume: '7.8K', delta: '36%' },
  ],
  metrics: [
    { label: 'Engagement Velocity', caption: 'Engagements per minute', value: '145K', delta: '41%', spark: series(80, 160, 8, 1).map((d) => d.value) },
    { label: 'Trailer Views', caption: 'Views per hour', value: '1.28M', delta: '46%', spark: series(70, 140, 8, 2).map((d) => d.value) },
    { label: 'Reviews (Early)', caption: 'Total early reviews', value: '4.6K', delta: '27%', spark: series(60, 100, 8, 3).map((d) => d.value) },
    { label: 'Media Articles', caption: 'News articles', value: '312', delta: '15%', spark: series(50, 90, 8, 4).map((d) => d.value) },
    { label: 'Google Trends Score', caption: 'Search interest score', value: '78', suffix: '/100', delta: '22', spark: series(50, 85, 8, 5).map((d) => d.value) },
    { label: 'Wikipedia Traffic', caption: 'Views per hour', value: '12.4K', delta: '33%', spark: series(60, 110, 8, 6).map((d) => d.value) },
  ],
  aiInsight: ['Buzz is up 42% in the last 60 minutes, driven by trailer reactions and fan theories.', 'South India is showing strong momentum.', 'Negative conversations about runtime are rising on X.'],
  actions: [
    { text: 'Increase YouTube Budget (+20%)', impact: 'High' },
    { text: 'Release BTS Clip Now', impact: 'High' },
    { text: 'Lead Cast Instagram Live', impact: 'Medium' },
    { text: 'Respond to Runtime Concerns', impact: 'Medium' },
  ],
};

export const crisisManagementData = {
  stats: [
    { label: 'Current Severity', value: 'High', caption: '2 Critical · 1 Medium' },
    { label: 'Issues Requiring Action', value: '2', caption: '1 Critical · 1 Medium' },
    { label: 'Impact Score', value: '68', suffix: '/100', caption: 'High Impact' },
    { label: 'Time Since First Detected', value: '45', suffix: 'min', caption: '9:10 AM' },
    { label: 'Resolution Rate', value: '75%', caption: '3/4 Resolved' },
  ],
  activeIssues: [
    { issue: 'Negative review clipping circulating on X', severity: 'Critical', impact: 'High', detected: '9:10 AM', owner: 'AR', role: 'Marketing Lead' },
    { issue: 'Rumors about runtime being too long', severity: 'Critical', impact: 'High', detected: '9:18 AM', owner: 'SP', role: 'Strategy Team' },
    { issue: 'Meme trend on interval scene going viral', severity: 'Medium', impact: 'Medium', detected: '9:25 AM', owner: 'CC', role: 'Content Lead' },
    { issue: 'Theatre availability confusion in Bengaluru', severity: 'Low', impact: 'Low', detected: '9:32 AM', owner: 'CS', role: 'Support Team' },
  ],
  timeline: [
    { time: '9:10 AM', title: 'Issue detected', caption: 'Negative review clipping identified on X', tone: 'bad' },
    { time: '9:18 AM', title: 'AI suggested response', caption: 'Recommended monitoring + response strategy', tone: 'info' },
    { time: '9:25 AM', title: 'Response approved', caption: 'By Marketing Lead', tone: 'good' },
    { time: '9:30 AM', title: 'Counter content published', caption: 'Influencer video + BTS clip pushed', tone: 'info' },
    { time: '9:45 AM', title: 'Situation improving', caption: 'Negative mentions dropping', tone: 'good' },
  ],
  aiActions: [
    { text: 'Ignore & Monitor', caption: 'Low impact. Continue monitoring.', cta: 'Ignore', impact: null },
    { text: 'Respond with Official Statement', caption: 'Address runtime concern with clarity.', cta: 'Respond', impact: 'High' },
    { text: 'Boost Positive Content', caption: 'Amplify positive reviews and reactions.', cta: 'Boost', impact: 'High' },
    { text: 'Release Behind-the-Scenes Clip', caption: 'Divert attention & showcase effort.', cta: 'Release', impact: 'Medium' },
    { text: 'Push Cast & Director Interviews', caption: 'Increase trust and engagement.', cta: 'Push', impact: 'Medium' },
  ],
  recovery: { before: 72, current: 58, target: 75 },
  recoveryTrend: '14%',
  sentimentOverTime: series(70, 55, 20, 1).map((d, i) => ({
    date: ['9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', '9:55 AM'][Math.floor((i / 19) * 4)],
    positive: Math.max(20, 100 - d.value),
    neutral: 25,
    negative: Math.max(5, d.value - 30),
  })),
  concernTopics: [
    { rank: 1, label: 'Runtime too long', mentions: '12.4K', trend: 'up' },
    { rank: 2, label: 'Interval scene', mentions: '8.7K', trend: 'down' },
    { rank: 3, label: 'Negative review', mentions: '6.1K', trend: 'up' },
    { rank: 4, label: 'Theatre availability', mentions: '2.3K', trend: 'down' },
    { rank: 5, label: 'Ticket pricing', mentions: '1.8K', trend: 'down' },
  ],
  quickActions: ['Publish Official Statement', 'Boost Positive Reviews', 'Release BTS Clip', 'Cast Instagram Live', 'Increase Paid Spend'],
};

export const platformWatchData = {
  platforms: [
    { label: 'YouTube', status: 'Strong', buzz: '5.2K', sentiment: '78%', velocity: 'High', topPost: '1.2M views', topCreator: 'MovieBuff India' },
    { label: 'Instagram', status: 'Strong', buzz: '4.1K', sentiment: '81%', velocity: 'High', topPost: '892K views', topCreator: 'CinemaVibes' },
    { label: 'X (Twitter)', status: 'Moderate', buzz: '3.2K', sentiment: '62%', velocity: 'Medium', topPost: '124K views', topCreator: 'HonestReviewer' },
    { label: 'Facebook', status: 'Normal', buzz: '1.6K', sentiment: '74%', velocity: 'Low', topPost: '312K views', topCreator: 'FilmFanatics' },
    { label: 'Reddit', status: 'Normal', buzz: '842', sentiment: '69%', velocity: 'Low', topPost: '210 upvotes', topCreator: 'u/Cinephile_99' },
    { label: 'News / Web', status: 'Normal', buzz: '612', sentiment: '72%', velocity: 'Low', topPost: 'Times of India', topCreator: 'Times of India' },
  ],
  shareOfVoice: [
    { label: 'YouTube', value: 35, color: '#f87171' },
    { label: 'Instagram', value: 26, color: '#f472b6' },
    { label: 'X (Twitter)', value: 18, color: '#94a3b8' },
    { label: 'Facebook', value: 9, color: '#3987e5' },
    { label: 'Reddit', value: 6, color: '#fb923c' },
    { label: 'News / Web', value: 6, color: '#a78bfa' },
  ],
  sentimentByPlatform: [
    { label: 'YouTube', positive: 78, neutral: 14, negative: 8 },
    { label: 'Instagram', positive: 84, neutral: 9, negative: 7 },
    { label: 'X (Twitter)', positive: 62, neutral: 18, negative: 20 },
    { label: 'Facebook', positive: 74, neutral: 15, negative: 11 },
    { label: 'Reddit', positive: 55, neutral: 24, negative: 21 },
    { label: 'News / Web', positive: 67, neutral: 22, negative: 11 },
  ],
  velocityTrend: (() => {
    const yt = series(2000, 7000, 20, 1);
    const ig = series(1500, 5500, 20, 2);
    const x = series(1000, 3000, 20, 3);
    const fb = series(500, 2000, 20, 4);
    const rd = series(300, 900, 20, 5);
    return yt.map((d, i) => ({
      date: TIME_TICKS[Math.floor((i / 19) * 4)],
      youtube: d.value,
      instagram: ig[i].value,
      xTwitter: x[i].value,
      facebook: fb[i].value,
      reddit: rd[i].value,
    }));
  })(),
  aiInsight: ['YouTube and Instagram are driving strong positive momentum.', 'Conversations about runtime on X are increasing.', 'Consider boosting YouTube spend and addressing runtime concerns.'],
  actions: [
    { text: 'Increase YouTube Budget (+20%)', impact: 'High' },
    { text: 'Boost Instagram Reels Campaign', impact: 'High' },
    { text: 'Address Runtime Discussion on X', impact: 'Medium' },
    { text: 'Release BTS Clip on All Platforms', impact: 'Medium' },
  ],
};

export const teamCoordinationData = {
  tasks: [
    { icon: 'youtube', label: 'Increase YouTube budget', owner: 'Media Team', due: '10:30 AM', priority: 'High', status: 'In Progress' },
    { icon: 'clip', label: 'Release BTS clip', owner: 'Content Team', due: '09:45 AM', priority: 'High', status: 'Completed' },
    { icon: 'x', label: 'Address runtime concerns', owner: 'Marketing Lead', due: '11:00 AM', priority: 'Medium', status: 'To Do' },
    { icon: 'instagram', label: 'Boost Instagram Reels', owner: 'Social Team', due: '12:00 PM', priority: 'Medium', status: 'To Do' },
    { icon: 'user', label: 'Lead cast engagement', owner: 'Talent Team', due: '01:00 PM', priority: 'Medium', status: 'To Do' },
  ],
  approvals: [
    { title: 'Increase YouTube Budget', requestedBy: 'Media Team', time: '9:15 AM', iconKey: 'youtube' },
    { title: 'Release BTS Clip', requestedBy: 'Content Team', time: '9:20 AM', iconKey: 'clip' },
    { title: 'Official Statement Draft', requestedBy: 'Marketing Lead', time: '9:25 AM', iconKey: 'megaphone' },
    { title: 'Paid Media Boost Plan', requestedBy: 'Media Team', time: '9:28 AM', iconKey: 'shield' },
  ],
  activity: [
    { name: 'Rahul', team: 'Media Team', time: '9:15 AM', action: 'Increased YouTube budget by 20%' },
    { name: 'Sneha', team: 'Content Team', time: '9:20 AM', action: 'Uploaded BTS clip for review' },
    { name: 'Arjun', team: 'Marketing Lead', time: '9:25 AM', action: 'Drafted official statement for runtime concerns' },
    { name: 'Priya', team: 'Social Team', time: '9:30 AM', action: 'Scheduled Instagram Reels campaign' },
    { name: 'Vikram', team: 'Talent Team', time: '9:32 AM', action: 'Confirmed lead cast Instagram Live' },
  ],
  notes: [
    { name: 'Marketing Lead', time: '9:25 AM', text: "Runtime discussion is picking up on X. Let's prepare a short statement and push through official handles.", likes: 3, comments: 2 },
    { name: 'Content Team', time: '9:20 AM', text: 'BTS clip is ready. Added subtitles in 5 languages. Please review.', likes: 2, comments: 1 },
    { name: 'Media Team', time: '9:15 AM', text: 'YouTube CPM is low right now. Good time to increase spend for next 3 hours.', likes: 4, comments: 3 },
  ],
  workload: [
    { team: 'Media Team', active: 4, level: 'High' },
    { team: 'Content Team', active: 3, level: 'High' },
    { team: 'Marketing Team', active: 2, level: 'Medium' },
    { team: 'Social Team', active: 3, level: 'Medium' },
    { team: 'Talent Team', active: 2, level: 'Low' },
  ],
};

export const decisionLogData = {
  decisions: [
    { time: '10:05 AM', title: 'Increase YouTube Budget (+20%)', tag: 'Media Spend', why: 'YouTube CTR increased 31% in last 60 mins. High trailer engagement and watch time.', approver: 'Rahul', role: 'Media Lead', impactLabel: 'Impressions', impactValue: '+420K', metricLabel: 'CTR', metricValue: '+31%', result: 'Positive', resultTime: '10:35 AM' },
    { time: '10:22 AM', title: 'Release BTS Clip', tag: 'Content', why: 'Fans are requesting BTS content. High likelihood to sustain momentum.', approver: 'Sneha', role: 'Content Lead', impactLabel: 'Views (1hr)', impactValue: '+285K', metricLabel: 'Sentiment', metricValue: '+8%', result: 'Positive', resultTime: '11:05 AM' },
    { time: '10:40 AM', title: 'Lead Cast Instagram Live', tag: 'Engagement', why: 'Audience sentiment positive. Live session can boost engagement further.', approver: 'Vikram', role: 'Talent Lead', impactLabel: 'Live Views', impactValue: '96K', metricLabel: 'Engagement', metricValue: '+22%', result: 'Positive', resultTime: '11:25 AM' },
    { time: '11:15 AM', title: 'Address Runtime Discussion on X', tag: 'Crisis Response', why: 'Runtime concerns trending. Early response can prevent negativity.', approver: 'Arjun', role: 'Marketing Lead', impactLabel: 'Negative Mentions', impactValue: '-18%', metricLabel: 'Sentiment', metricValue: '+6%', result: 'In Progress', resultTime: '—' },
    { time: '11:45 AM', title: 'Boost Instagram Reels Campaign', tag: 'Paid Media', why: 'Reels reach growing 42% in last hour. High engagement with short content.', approver: 'Priya', role: 'Social Lead', impactLabel: 'Reach', impactValue: '+310K', metricLabel: 'Engagement', metricValue: '+18%', result: 'Pending Results', resultTime: '—' },
    { time: '12:10 PM', title: 'Release Official Statement', tag: 'Crisis Response', why: 'Clarify rumors about subplot leak. Prevent misinformation spread.', approver: 'Rahul', role: 'PR Lead', impactLabel: 'Rumor Mentions', impactValue: '-34%', metricLabel: 'Sentiment', metricValue: '+9%', result: 'Positive', resultTime: '12:40 PM' },
  ],
  summary: { total: 6, positive: 5, inProgress: 1, pending: 1, avgImpact: '+68', sentimentChange: '+9%' },
};
