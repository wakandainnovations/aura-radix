import { describe, expect, it } from 'vitest';
import { createMovieReport, movieReportSummary, slimMovieReport } from './movieReport';
import { reportFileName, reportShareText } from './reportPdf';

const data = {
  generatedAt: '2026-10-22T13:45:06Z',
  entity: { id: 29, name: 'GD Naidu', language: 'Tamil', genre: ['Drama'], releaseDate: '2026-08-07' },
  headlineMetrics: { totalMentions: 5829, positivityRatio: 0.582, negativeSentiment: 0.363, netSentimentScore: 1.6, platformsCovered: 4 },
  movieHealth: { healthPercentage: 80.17, healthLabel: 'Good' },
  competitivePositioning: { rank: 2, totalTracked: 2, snapshot: [] },
  highlights: ['5.8K mentions analysed', '58% of all mentions are positive', '1.6 positive for every negative', 'Strongest reach on X'],
  hourlyActivity: { dailyDistribution: { '2026-09-22': { 0: 1 } } },
  sentimentTrend: { entities: [{ name: 'Rival', sentiments: [{ date: 'x' }] }, { name: 'GD Naidu', sentiments: [{ date: '2026-10-01', positive: 3 }], checkpoints: [] }] },
  topSpreaders: { spreaders: Array.from({ length: 12 }, (_, i) => ({ globalUserId: `u${i}`, totalViews: i, topContent: [{ big: 'post' }] })) },
  recommendedActions: { daysToRelease: -76, actions: [{ title: 'A', reason: 'r', category: 'HIGH_IMPACT', status: 'ACTIVE', relevantUsers: ['x'] }] },
  auraMathIntelligence: { topAdvocates: Array.from({ length: 8 }, (_, i) => ({ global_user_id: `a${i}` })) },
  momentumIntelligence: { vmiTrend: { series: [1, 2, 3], peakDay: { calendarDate: '2026-08-04', dailyEngagementVolume: 624700 } }, causalChains: {} },
};

describe('movie report', () => {
  it('keeps only what the PDF needs', () => {
    const slim = slimMovieReport(data);
    expect(slim.hourlyActivity).toBeUndefined();
    expect(slim.sentimentTrend.sentiments).toEqual([{ date: '2026-10-01', positive: 3 }]);
    expect(slim.topSpreaders.spreaders).toHaveLength(10);
    expect(slim.topSpreaders.spreaders[0].topContent).toBeUndefined();
    expect(slim.recommendedActions.actions[0].relevantUsers).toBeUndefined();
    expect(slim.auraMathIntelligence.topAdvocates).toHaveLength(5);
    expect(slim.momentumIntelligence).toEqual({ peakDay: { calendarDate: '2026-08-04', dailyEngagementVolume: 624700 } });
  });

  it('summarises health, mentions and rank', () => {
    expect(movieReportSummary(data)).toEqual({ healthLabel: 'Good', healthPct: 80, mentions: 5829, positivePct: 58, rank: 2, totalTracked: 2 });
  });

  it('builds the WhatsApp message and file name', () => {
    const report = { ...createMovieReport({ data, preparedBy: 'asha' }), createdAt: '2026-10-22T14:00:00Z' };
    const text = reportShareText(report);
    expect(text).toContain('FRAMEHOUSE Movie Report: GD Naidu');
    expect(text).toContain('Health 80% (Good) · 5.8K mentions · 58% positive · #2 of 2 on net sentiment');
    expect(text.split('\n').filter((l) => l.startsWith('•'))).toHaveLength(3);
    expect(reportFileName(report)).toBe('framehouse-movie-report-gd-naidu-2026-10-22.pdf');
  });
});
