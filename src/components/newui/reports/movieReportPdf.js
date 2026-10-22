import { formatCompact } from '../formatCompact';
import { C, CONTENT_W, M, PAGE_W, drawFooters, drawHeader, formatDate, safe } from './pdfKit';
import { movieReportSummary } from './movieReport';

// Layout for the movie report: everything AI Copilot knows about one movie
// (the backend's marketing report), as a shareable multi-page PDF. Sections
// the backend omitted, or that hold no data, are skipped.

const LINE = 4.4; // body line height at 9.5pt

const pct = (fraction, digits = 0) => (fraction == null || !Number.isFinite(fraction) ? '-' : `${(fraction * 100).toFixed(digits)}%`);
const compact = (n) => (n == null || !Number.isFinite(n) ? '-' : formatCompact(Math.round(n)));

// "tamil_nadu" -> "Tamil Nadu", "media_press" -> "Media press".
function humanize(key, { title = false } = {}) {
  const words = String(key ?? '').replace(/[_-]+/g, ' ').trim().toLowerCase();
  if (!words) return '-';
  return title ? words.replace(/\b\w/g, (c) => c.toUpperCase()) : words.charAt(0).toUpperCase() + words.slice(1);
}

const IMPACT_LABEL = { HIGH_IMPACT: 'High impact', MEDIUM_IMPACT: 'Medium impact', LOW_IMPACT: 'Low impact' };
const IMPACT_RANK = { HIGH_IMPACT: 0, MEDIUM_IMPACT: 1, LOW_IMPACT: 2 };
const TONE_DOT = { POSITIVE: C.green, NEGATIVE: C.red, NEUTRAL: C.faint };
const HEALTH_COLOR = { Excellent: C.green, Good: C.green, Fair: C.amber, Average: C.amber, Poor: C.red, Critical: C.red };

export function movieFileName(report) {
  const slug = (report.title || 'movie').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `framehouse-movie-report-${slug || 'movie'}-${report.createdAt.slice(0, 10)}.pdf`;
}

export function movieShareText(report) {
  const s = movieReportSummary(report.data);
  const facts = [
    s.healthPct != null && `Health ${s.healthPct}% (${s.healthLabel})`,
    s.mentions != null && `${compact(s.mentions)} mentions`,
    s.positivePct != null && `${s.positivePct}% positive`,
    s.rank != null && s.totalTracked > 1 && `#${s.rank} of ${s.totalTracked} on net sentiment`,
  ].filter(Boolean);
  const highlights = (report.data.highlights ?? []).slice(0, 3).map((h) => `• ${h}`);
  return [
    `FRAMEHOUSE Movie Report: ${report.title} (${formatDate(report.createdAt)})`,
    facts.join(' · '),
    ...highlights,
    'Full report attached as PDF.',
  ].filter(Boolean).join('\n');
}

// ---- small layout helpers --------------------------------------------------

function paragraph(doc, w, text, { size = 9.5, color = C.ink, x = M, width = CONTENT_W, maxLines, gap = 3 } = {}) {
  if (!text) return;
  w.font(size, 'normal', color);
  let lines = doc.splitTextToSize(safe(text), width);
  if (maxLines && lines.length > maxLines) lines = [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1].replace(/\s+\S*$/, '')}...`];
  const lh = size * 0.46;
  w.ensure(lines.length * lh + gap);
  doc.text(lines, x, w.y);
  w.y += (lines.length - 1) * lh + lh + gap;
}

function bullets(doc, w, items, { x = M, width = CONTENT_W } = {}) {
  items.forEach((item) => {
    const { text, color = C.blue } = typeof item === 'string' ? { text: item } : item;
    w.font(9.5, 'normal');
    const lines = doc.splitTextToSize(safe(text), width - 5);
    w.ensure(lines.length * LINE + 1.5);
    doc.setFillColor(...color);
    doc.circle(x + 1.2, w.y - 1.2, 0.8, 'F');
    doc.text(lines, x + 4.5, w.y);
    w.y += lines.length * LINE + 1.5;
  });
  w.y += 2;
}

// cols: [{ label, width, align }]; rows: arrays of cells; `bold(row)` marks a highlighted row.
function table(doc, w, cols, rows, { bold } = {}) {
  if (!rows.length) return;
  const xs = [];
  cols.reduce((x, c) => (xs.push(x), x + c.width), M);
  const cellX = (i) => (cols[i].align === 'right' ? xs[i] + cols[i].width - 2 : xs[i] + 2);
  const rowH = 7.5;

  const header = () => {
    doc.setFillColor(...C.zebra);
    doc.rect(M, w.y - 4.8, CONTENT_W, rowH, 'F');
    w.font(7, 'bold', C.muted);
    cols.forEach((c, i) => w.text(c.label.toUpperCase(), cellX(i), w.y, { align: c.align }));
    w.y += rowH;
  };
  w.ensure(rowH * Math.min(rows.length + 1, 4));
  header();
  rows.forEach((row) => {
    const isBold = bold?.(row);
    w.font(9, isBold ? 'bold' : 'normal');
    const wrapped = row.map((cell, i) => doc.splitTextToSize(safe(cell), cols[i].width - 4).slice(0, 8));
    const h = Math.max(...wrapped.map((l) => l.length)) * 4 + 3.5;
    if (w.y + h > 279) {
      doc.addPage();
      w.y = 22;
      header();
      w.font(9, isBold ? 'bold' : 'normal');
    }
    wrapped.forEach((lines, i) => doc.text(lines, cellX(i), w.y, { align: cols[i].align }));
    doc.setDrawColor(...C.rule);
    doc.setLineWidth(0.2);
    doc.line(M, w.y + h - 4.6, PAGE_W - M, w.y + h - 4.6);
    w.y += h;
  });
  w.y += 4;
}

// Stat tiles, 4 per row: { label, value, sub, color }.
function tiles(doc, w, items) {
  const perRow = 4;
  const gap = 3;
  const tw = (CONTENT_W - gap * (perRow - 1)) / perRow;
  const th = 19;
  for (let i = 0; i < items.length; i += perRow) {
    w.ensure(th + gap);
    items.slice(i, i + perRow).forEach((t, j) => {
      const x = M + j * (tw + gap);
      doc.setFillColor(...C.zebra);
      doc.roundedRect(x, w.y, tw, th, 1.5, 1.5, 'F');
      w.font(6.5, 'bold', C.muted);
      w.text(t.label.toUpperCase(), x + 3, w.y + 5);
      w.font(14, 'bold', t.color ?? C.ink);
      w.text(t.value, x + 3, w.y + 12);
      if (t.sub) {
        w.font(7, 'normal', C.muted);
        w.text(doc.splitTextToSize(safe(t.sub), tw - 6)[0], x + 3, w.y + 16.5);
      }
    });
    w.y += th + gap;
  }
  w.y += 3;
}

// A titled list of labelled share bars; returns the height used.
function barList(doc, w, x, width, title, items, y0) {
  let y = y0;
  w.font(8, 'bold', C.muted);
  w.text(title.toUpperCase(), x, y);
  y += 5;
  const labelW = width * 0.42;
  const barW = width - labelW - 14;
  const max = Math.max(...items.map((it) => it.pct), 1);
  items.forEach((it) => {
    w.font(8.5, 'normal');
    w.text(doc.splitTextToSize(safe(it.label), labelW - 2)[0], x, y);
    doc.setFillColor(...C.rule);
    doc.rect(x + labelW, y - 2.6, barW, 3, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(x + labelW, y - 2.6, Math.max(0.5, (it.pct / max) * barW), 3, 'F');
    w.font(8, 'normal', C.muted);
    w.text(`${it.pct.toFixed(0)}%`, x + width, y, { align: 'right' });
    y += 5.2;
  });
  return y - y0;
}

// Two bar lists side by side.
function barListPair(doc, w, left, right) {
  const lists = [left, right].filter((l) => l?.items?.length);
  if (!lists.length) return;
  const colW = (CONTENT_W - 10) / 2;
  const height = 5 + Math.max(...lists.map((l) => l.items.length)) * 5.2;
  w.ensure(height + 4);
  const heights = lists.map((l, i) => barList(doc, w, M + i * (colW + 10), colW, l.title, l.items, w.y));
  w.y += Math.max(...heights) + 5;
}

function sentimentChart(doc, w, sentiments) {
  const points = (sentiments ?? []).filter((p) => p?.date);
  const total = points.reduce((s, p) => s + (p.positive ?? 0) + (p.negative ?? 0) + (p.neutral ?? 0), 0);
  if (!points.length || total === 0) {
    paragraph(doc, w, 'No mentions were tracked in this period.', { color: C.muted });
    return;
  }
  const h = 42;
  w.ensure(h + 14);
  const x0 = M + 10;
  const width = CONTENT_W - 10;
  const top = w.y;
  const max = Math.max(...points.map((p) => Math.max(p.positive ?? 0, p.negative ?? 0)), 1);
  const X = (i) => x0 + (points.length === 1 ? width / 2 : (i / (points.length - 1)) * width);
  const Y = (v) => top + h - (v / max) * h;

  doc.setDrawColor(...C.rule);
  doc.setLineWidth(0.2);
  [0, 0.5, 1].forEach((f) => {
    doc.line(x0, top + h - f * h, x0 + width, top + h - f * h);
    w.font(6.5, 'normal', C.faint);
    w.text(compact(f * max), x0 - 2, top + h - f * h + 1, { align: 'right' });
  });
  [['positive', C.green], ['negative', C.red]].forEach(([key, color]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.6);
    for (let i = 1; i < points.length; i += 1) {
      doc.line(X(i - 1), Y(points[i - 1][key] ?? 0), X(i), Y(points[i][key] ?? 0));
    }
  });
  w.font(6.5, 'normal', C.faint);
  const first = points[0].date;
  const last = points[points.length - 1].date;
  w.text(formatDate(first), x0, top + h + 4);
  w.text(formatDate(last), x0 + width, top + h + 4, { align: 'right' });
  // Legend
  [['Positive', C.green], ['Negative', C.red]].forEach(([label, color], i) => {
    const lx = x0 + width / 2 - 20 + i * 24;
    doc.setFillColor(...color);
    doc.rect(lx, top + h + 2, 4, 1.4, 'F');
    w.font(7, 'normal', C.muted);
    w.text(label, lx + 5.5, top + h + 3.3);
  });
  w.y = top + h + 11;
}

// ---- sections ----------------------------------------------------------------

function drawTitle(doc, w, report) {
  const e = report.data.entity ?? {};
  w.y = 40;
  w.font(20, 'bold');
  const titleLines = doc.splitTextToSize(safe(report.title), CONTENT_W);
  doc.text(titleLines, M, w.y);
  w.y += (titleLines.length - 1) * 8 + 7;

  const meta = [
    e.releaseDate && `Release ${formatDate(e.releaseDate)}`,
    e.language,
    e.industry,
    e.genre?.length && e.genre.join(', '),
    e.runtime && `${e.runtime} min`,
  ].filter(Boolean);
  const credits = [
    e.director && `Directed by ${e.director}`,
    e.actors?.length && `Starring ${e.actors.slice(0, 4).join(', ')}`,
    e.productionCompany,
  ].filter(Boolean);
  const basis = [
    report.preparedBy && `Prepared by ${report.preparedBy}`,
    `Social data for the last 30 days, as of ${formatDate(report.data.generatedAt ?? report.createdAt, true)}`,
  ].filter(Boolean);
  [meta, credits, basis].filter((l) => l.length).forEach((parts) => {
    paragraph(doc, w, parts.join('  ·  '), { color: C.muted, gap: 0.6 });
  });
  w.y += 5;
}

function drawSummary(doc, w, data) {
  const summary = data.aiSummary?.summary;
  if (summary) {
    w.font(9.5, 'normal');
    const lines = doc.splitTextToSize(safe(summary), CONTENT_W - 12);
    const h = lines.length * LINE + 11;
    w.ensure(h + 6);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(M, w.y, CONTENT_W, h, 2, 2, 'F');
    doc.setFillColor(...C.blue);
    doc.rect(M, w.y, 1.6, h, 'F');
    w.font(7, 'bold', C.muted);
    w.text('AI SUMMARY', M + 6, w.y + 6);
    w.font(9.5, 'normal');
    doc.text(lines, M + 6, w.y + 11.5);
    w.y += h + 7;
  }
  const highlights = data.highlights ?? [];
  const latest = data.todaysHighlights?.highlights ?? [];
  if (highlights.length || latest.length) {
    w.heading('Highlights');
    bullets(doc, w, [
      ...highlights,
      ...latest.map((h) => ({ text: h.text, color: TONE_DOT[h.type] ?? C.faint })),
    ]);
  }
}

function drawKeyMetrics(doc, w, data) {
  const m = data.headlineMetrics ?? {};
  const health = data.movieHealth;
  const buzz = data.buzz;
  const items = [
    health && { label: 'Movie health', value: `${Math.round(health.healthPercentage)}%`, sub: health.healthLabel, color: HEALTH_COLOR[health.healthLabel] },
    { label: 'Mentions', value: compact(m.totalMentions), sub: m.platformsCovered ? `across ${m.platformsCovered} platforms` : null },
    { label: 'Positive', value: pct(m.positivityRatio), sub: `${pct(m.negativeSentiment)} negative`, color: C.green },
    m.netSentimentScore != null && { label: 'Net sentiment', value: `${m.netSentimentScore.toFixed(1)} : 1`, sub: 'positive per negative mention' },
    data.reach?.uniqueUsers != null && { label: 'People posting', value: compact(data.reach.uniqueUsers), sub: 'unique accounts' },
    data.awareness && { label: 'Awareness', value: compact(data.awareness.totalViews), sub: `views · ${data.awareness.awarenessLevel} vs ${data.awareness.comparedMovieCount} films` },
    buzz && { label: 'Buzz today', value: compact(buzz.mentionsToday), sub: buzz.mentionsYesterday ? `${buzz.mentionsChangePct >= 0 ? '+' : ''}${Math.round(buzz.mentionsChangePct)}% vs yesterday` : 'mentions today' },
    data.promotionalMix && { label: 'Promotional share', value: `${Math.round(data.promotionalMix.promotionalSharePct)}%`, sub: 'of posts are paid or official' },
  ].filter(Boolean);
  w.heading('Key metrics');
  tiles(doc, w, items);
}

function drawTrend(doc, w, data) {
  const trend = data.sentimentTrend;
  const delta = data.sentimentDelta;
  const peak = data.momentumIntelligence?.peakDay;
  if (!trend && !delta && !peak) return;
  w.heading('Sentiment over the last 30 days');
  if (trend) sentimentChart(doc, w, trend.sentiments);
  if (peak?.calendarDate) {
    paragraph(doc, w, `All-time engagement peak: ${compact(peak.dailyEngagementVolume)} engagements on ${formatDate(peak.calendarDate)}.`, { color: C.muted });
  }
  if (delta && (delta.fromTotalMentions || delta.toTotalMentions)) {
    const sign = (v) => (v > 0 ? '+' : '');
    paragraph(doc, w,
      `Week on week (${formatDate(delta.fromDate)} to ${formatDate(delta.toDate)}): mentions ${sign(delta.mentionsDelta)}${delta.mentionsDelta}, `
      + `positive share ${sign(delta.positiveRatioDelta)}${(delta.positiveRatioDelta * 100).toFixed(1)} pts, `
      + `net sentiment ${sign(delta.netSentimentDelta)}${delta.netSentimentDelta.toFixed(2)}.`,
      { color: C.muted });
  }
}

function drawCompetition(doc, w, data) {
  const cp = data.competitivePositioning;
  if (!cp?.snapshot?.length) return;
  w.heading('Competitive position');
  const name = data.entity?.name;
  paragraph(doc, w, cp.leadsCategory
    ? `Leads its category: #1 of ${cp.totalTracked} tracked titles on net sentiment.`
    : `Ranks #${cp.rank} of ${cp.totalTracked} tracked titles on net sentiment. ${cp.leaderName} leads.`);
  table(doc, w, [
    { label: 'Title', width: 74 },
    { label: 'Mentions', width: 34, align: 'right' },
    { label: 'Positive', width: 34, align: 'right' },
    { label: 'Net sentiment', width: 36, align: 'right' },
  ], [...cp.snapshot]
    .sort((a, b) => (b.netSentimentScore ?? 0) - (a.netSentimentScore ?? 0))
    .map((s) => [s.entityName, compact(s.totalMentions), pct(s.positiveRatio), `${(s.netSentimentScore ?? 0).toFixed(1)} : 1`]),
  { bold: (row) => row[0] === name });
}

function drawPlatforms(doc, w, data) {
  const reach = data.platformReach;
  if (!reach || !Object.keys(reach).length) return;
  const rows = Object.entries(reach)
    .map(([platform, s]) => ({ platform, pos: s.POSITIVE ?? 0, neg: s.NEGATIVE ?? 0, neu: s.NEUTRAL ?? 0 }))
    .map((r) => ({ ...r, total: r.pos + r.neg + r.neu }))
    .sort((a, b) => b.total - a.total);
  w.heading('Platform reach');
  table(doc, w, [
    { label: 'Platform', width: 48 },
    { label: 'Mentions', width: 26, align: 'right' },
    { label: 'Positive', width: 26, align: 'right' },
    { label: 'Negative', width: 26, align: 'right' },
    { label: 'Neutral', width: 26, align: 'right' },
    { label: 'Positive share', width: 26, align: 'right' },
  ], rows.map((r) => [humanize(r.platform, { title: true }).replace(/^X$/, 'X (Twitter)').replace('Youtube', 'YouTube'), compact(r.total), compact(r.pos), compact(r.neg), compact(r.neu), r.total ? pct(r.pos / r.total) : '-']));
}

function drawAudience(doc, w, data) {
  const share = (rows, labelKey, opts) => (rows ?? []).slice(0, 6).map((r) => ({ label: humanize(r[labelKey], opts), pct: r.sharePct ?? 0 }));
  const regions = share(data.audiencePulse?.regions, 'region', { title: true });
  const authors = share(data.authorTypeBreakdown?.authorTypes, 'authorType');
  const intents = share(data.contentIntentBreakdown?.intents, 'contentIntent');
  const topics = share(data.topicCategoryBreakdown?.topics, 'topicCategory');
  const love = data.audiencePulseAspects?.peopleLove ?? [];
  const concerned = data.audiencePulseAspects?.peopleConcerned ?? [];
  if (![regions, authors, intents, topics, love, concerned].some((l) => l.length)) return;

  w.heading('Audience');
  barListPair(doc, w, { title: 'Where they are', items: regions }, { title: 'Who is posting', items: authors });
  barListPair(doc, w, { title: 'What they post', items: intents }, { title: 'What they talk about', items: topics });
  if (love.length) paragraph(doc, w, `People love: ${love.join(', ')}`);
  if (concerned.length) paragraph(doc, w, `People are concerned about: ${concerned.join(', ')}`);
}

function drawMoments(doc, w, data) {
  // Milestones still ahead (e.g. OTT windows) have no before/after yet.
  const asOf = String(data.generatedAt ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const impacts = (data.definingMoments?.impacts ?? []).filter((i) => String(i.checkpointDate) <= asOf);
  if (!impacts.length) return;
  w.heading('Defining moments');
  paragraph(doc, w, `How conversation changed in the ${data.definingMoments.windowDays} days before and after each campaign milestone.`, { color: C.muted });
  table(doc, w, [
    { label: 'Date', width: 26 },
    { label: 'Milestone', width: 58 },
    { label: 'Mentions before / after', width: 40, align: 'right' },
    { label: 'Positive share', width: 30, align: 'right' },
    { label: 'Effect', width: 24, align: 'right' },
  ], [...impacts]
    .sort((a, b) => String(a.checkpointDate).localeCompare(String(b.checkpointDate)))
    .slice(0, 12)
    .map((i) => [
      formatDate(i.checkpointDate),
      i.description,
      `${compact(i.beforeTotalMentions)} / ${compact(i.afterTotalMentions)}`,
      `${i.positiveRatioChange > 0 ? '+' : ''}${((i.positiveRatioChange ?? 0) * 100).toFixed(1)} pts`,
      humanize(i.impactDirection),
    ]));
}

function drawInfluencers(doc, w, data) {
  const spreaders = data.topSpreaders?.spreaders ?? [];
  const insights = data.topSpreaderInsights;
  if (!spreaders.length && !insights?.summary) return;
  w.heading('Top influencers');
  if (spreaders.length) {
    table(doc, w, [
      { label: '#', width: 12 },
      { label: 'Influencer', width: 120 },
      { label: 'Views on posts', width: 46, align: 'right' },
    ], spreaders.map((s, i) => [String(i + 1), s.globalUserId || 'Unnamed account', compact(s.totalViews)]));
  }
  if (insights?.summary) paragraph(doc, w, insights.summary);
  const actions = (insights?.actions ?? []).slice(0, 5);
  if (actions.length) {
    bullets(doc, w, actions.map((a) => ({ text: `${a.action} (${IMPACT_LABEL[a.impact] ?? humanize(a.impact)})`, color: a.impact === 'HIGH_IMPACT' ? C.amber : C.blue })));
  }
}

function drawActions(doc, w, data) {
  const actions = (data.recommendedActions?.actions ?? [])
    .filter((a) => a.status !== 'IRRELEVANT')
    .sort((a, b) => (IMPACT_RANK[a.category] ?? 9) - (IMPACT_RANK[b.category] ?? 9) || (b.confidencePct ?? 0) - (a.confidencePct ?? 0))
    .slice(0, 10);
  if (!actions.length) return;
  w.heading('Recommended actions');
  actions.forEach((a, i) => {
    w.ensure(18);
    w.font(10, 'bold');
    const title = doc.splitTextToSize(safe(`${i + 1}. ${a.title}`), CONTENT_W);
    doc.text(title, M, w.y);
    w.y += title.length * 4.6;
    const meta = [IMPACT_LABEL[a.category], a.confidencePct != null && `${a.confidencePct}% confidence`, a.windowLabel, a.status === 'DONE' && 'Done'].filter(Boolean).join('  ·  ');
    w.font(8, 'bold', a.category === 'HIGH_IMPACT' ? C.amber : C.blue);
    w.text(meta, M, w.y);
    w.y += 4.6;
    paragraph(doc, w, a.reason, { size: 9, color: C.muted, maxLines: 4, gap: 4 });
  });
}

function drawConversationIntel(doc, w, data) {
  const a = data.auraMathIntelligence;
  if (!a) return;
  const profile = a.entityProfile ?? {};
  const convo = a.conversationProfile ?? {};
  const strategy = a.channelStrategy;
  const recs = a.marketingRecommendations;
  w.heading('Conversation intelligence');

  const facts = [
    profile.viralityTier && ['Virality', `${profile.viralityTier}. ${profile.viralityTierExplained ?? ''}`],
    convo.amplificationExplained && ['Amplification', convo.amplificationExplained],
    convo.peakActivityWindows?.length && ['Peak activity', convo.peakActivityWindows.join(', ')],
    convo.mostActiveDayOfWeek && ['Busiest day', humanize(convo.mostActiveDayOfWeek)],
    convo.longestBurst?.readableDescription && ['Longest burst', convo.longestBurst.readableDescription],
    strategy?.headline && ['Channel strategy', strategy.headline],
  ].filter(Boolean);
  facts.forEach(([label, value]) => {
    w.ensure(10);
    w.font(7, 'bold', C.muted);
    w.text(label.toUpperCase(), M, w.y);
    w.y += 4;
    paragraph(doc, w, value, { gap: 2.5 });
  });

  if (strategy?.channels?.length) {
    barListPair(doc, w, {
      title: 'Share of posts by channel',
      items: strategy.channels.slice(0, 6).map((c) => ({ label: c.platform, pct: (c.share ?? 0) <= 1 ? (c.share ?? 0) * 100 : c.share })),
    });
  }

  if (recs) {
    const rows = [
      ['Primary channel', recs.primaryChannel],
      ['Best time to engage', recs.bestTimeToEngage],
      ['Campaign type', recs.campaignType],
      ['Amplification potential', recs.amplificationPotential],
      ['Reach multiplier', recs.estimatedReachMultiplier],
      ['Addressable audience', recs.addressableAudience],
      ['Content strategy', recs.contentStrategy],
      ['Advice', recs.actionableAdvice],
    ].filter(([, v]) => v);
    if (rows.length) {
      w.ensure(16);
      w.font(10, 'bold');
      w.text('Marketing recommendations', M, w.y);
      w.y += 5.5;
      table(doc, w, [{ label: 'Topic', width: 44 }, { label: 'Recommendation', width: CONTENT_W - 44 }], rows);
    }
  }

  const flags = [
    ...(a.opportunityFlags ?? []).map((f) => ({ text: `${f.opportunity}: ${f.detail}`, color: C.green })),
    ...(a.redFlags ?? []).map((f) => ({ text: typeof f === 'string' ? f : `${f.flag ?? f.risk ?? 'Risk'}: ${f.detail ?? ''}`, color: C.red })),
  ];
  if (flags.length) {
    w.ensure(14);
    w.font(10, 'bold');
    w.text('Opportunities and risks', M, w.y);
    w.y += 5.5;
    bullets(doc, w, flags);
  }

  const advocates = a.topAdvocates ?? [];
  if (advocates.length) {
    w.ensure(16);
    w.font(10, 'bold');
    w.text('Top advocates', M, w.y);
    w.y += 5.5;
    // Instagram posts report no view counts, so the column only shows when one does.
    const hasViews = advocates.some((v) => v.total_views > 0);
    table(doc, w, [
      { label: 'Account', width: hasViews ? 70 : 96 },
      { label: 'Platform', width: 34 },
      { label: 'Posts', width: 22, align: 'right' },
      { label: 'Engagement', width: 26, align: 'right' },
      ...(hasViews ? [{ label: 'Views', width: 26, align: 'right' }] : []),
    ], advocates.map((v) => [
      v.global_user_id || 'Unnamed account',
      humanize(v.platform_handles?.primary_platform, { title: true }).replace('Youtube', 'YouTube'),
      compact(v.post_count),
      compact(v.total_engagement),
      ...(hasViews ? [compact(v.total_views)] : []),
    ]));
  }
}

export function drawMovieReport(doc, w, report) {
  const { data } = report;
  drawHeader(doc, w, { label: 'MOVIE REPORT', createdAt: report.createdAt });
  drawTitle(doc, w, report);
  drawSummary(doc, w, data);
  drawKeyMetrics(doc, w, data);
  drawTrend(doc, w, data);
  drawCompetition(doc, w, data);
  drawPlatforms(doc, w, data);
  drawAudience(doc, w, data);
  drawMoments(doc, w, data);
  drawActions(doc, w, data);
  drawInfluencers(doc, w, data);
  drawConversationIntel(doc, w, data);
  drawFooters(doc, `FRAMEHOUSE Movie Report: ${report.title}. Based on public social posts tracked for this title.`);
}
