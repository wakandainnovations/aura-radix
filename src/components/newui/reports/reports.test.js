import { beforeEach, describe, expect, it } from 'vitest';
import { createInvestmentReport, deleteReport, loadReports, saveReport } from './reportsStore';
import { reportFileName, reportShareText } from './reportPdf';

const request = { movieName: 'Test Film', releaseDate: '2026-11-12', language: 'hindi', estimatedBudget: 450000000, marketingBudget: 'medium' };
const result = {
  movieName: 'Test Film',
  releaseDate: '2026-11-12',
  language: 'hindi',
  assessments: [
    { rating: 4, verdict: 'RISK', maxBudget: 200000000, plannedBudget: 450000000 },
    { rating: 6, verdict: 'RISK', maxBudget: 380000000, plannedBudget: 450000000 },
    { rating: 8, verdict: 'OPPORTUNITY', maxBudget: 720000000, plannedBudget: 450000000 },
  ],
};

describe('reportsStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps reports per user, newest first', () => {
    const a = createInvestmentReport({ request, result, preparedBy: 'asha' });
    const b = createInvestmentReport({ request, result, preparedBy: 'asha' });
    saveReport('asha', a);
    saveReport('asha', b);
    expect(loadReports('asha').map((r) => r.id)).toEqual([b.id, a.id]);
    expect(loadReports('ravi')).toEqual([]);
  });

  it('deletes by id', () => {
    const a = createInvestmentReport({ request, result });
    saveReport('asha', a);
    expect(deleteReport('asha', a.id)).toEqual([]);
  });

  it('survives corrupt storage', () => {
    localStorage.setItem('framehouse:reports:asha', '{not json');
    expect(loadReports('asha')).toEqual([]);
  });
});

describe('report sharing', () => {
  it('summarises the verdict and budget bands in the share text', () => {
    const text = reportShareText(createInvestmentReport({ request, result }));
    expect(text).toContain('Test Film');
    expect(text).toContain('₹45 Cr works if the film lands');
    expect(text).toContain('Safe budget ₹38 Cr');
    expect(text).toContain('Max opportunity ₹72 Cr');
  });

  it('builds a filesystem-safe PDF name', () => {
    const report = { ...createInvestmentReport({ request, result }), title: 'Pushpa 3: The Rule!', createdAt: '2026-10-22T10:00:00Z' };
    expect(reportFileName(report)).toBe('framehouse-investment-pushpa-3-the-rule-2026-10-22.pdf');
  });
});
