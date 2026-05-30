import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContentAnalysisView from './ContentAnalysisView';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';

vi.mock('../../api/auraMathService', () => ({
  auraMathService: {
    getAspectDrivers: vi.fn(),
  },
}));

vi.mock('../../api/marketingAggregationService', () => ({
  marketingAggregationService: {
    getAspectDrivers: vi.fn(),
  },
}));

const renderWithClient = (ui) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

const flush = () => new Promise((r) => setTimeout(r, 0));

const sampleAspect = {
  totalPostsAnalyzed: { total: 100, x: 60, youtube: 40 },
  keyword: 'inception',
  strengths: [{ aspect: 'plot', averageSentiment: 88, postsMentioning: 30, impactScore: 9 }],
  weaknesses: [{ aspect: 'pacing', averageSentiment: 30, postsMentioning: 12, impactScore: 6 }],
  byPlatform: { x: { foo: 'bar' } },
};

const mockReturn = (fn, val) => fn.mockResolvedValue(val);

beforeEach(() => {
  auraMathService.getAspectDrivers.mockReset();
  marketingAggregationService.getAspectDrivers.mockReset();
});

describe('ContentAnalysisView', () => {
  it('auto-loads aggregated aspect drivers for the selected entity', async () => {
    mockReturn(marketingAggregationService.getAspectDrivers, sampleAspect);
    renderWithClient(<ContentAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    await waitFor(() => expect(marketingAggregationService.getAspectDrivers)
      .toHaveBeenCalledWith({ entityId: 'e1' }));
    expect(await screen.findByText(/Showing aggregated data/)).toBeTruthy();
    expect(screen.getByText('plot')).toBeTruthy();
    // The aggregated path must not hit the keyword (auraMath) endpoint.
    expect(auraMathService.getAspectDrivers).not.toHaveBeenCalled();
  });

  it('does not fetch when no entity is selected and no keyword is entered', async () => {
    renderWithClient(<ContentAnalysisView selectedEntity={null} />);
    await flush();
    expect(marketingAggregationService.getAspectDrivers).not.toHaveBeenCalled();
    expect(auraMathService.getAspectDrivers).not.toHaveBeenCalled();
  });

  it('overrides with the keyword endpoint when a keyword is searched', async () => {
    mockReturn(auraMathService.getAspectDrivers, { ...sampleAspect, keyword: 'batman' });
    renderWithClient(<ContentAnalysisView selectedEntity={null} />);

    const input = screen.getByPlaceholderText(/Search by keyword to override/);
    fireEvent.change(input, { target: { value: 'batman' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(auraMathService.getAspectDrivers).toHaveBeenCalledWith('batman'));
    expect(marketingAggregationService.getAspectDrivers).not.toHaveBeenCalled();
  });

  it('uses the keyword endpoint instead of aggregated even when an entity is selected', async () => {
    mockReturn(marketingAggregationService.getAspectDrivers, sampleAspect);
    mockReturn(auraMathService.getAspectDrivers, { ...sampleAspect, keyword: 'joker' });
    renderWithClient(<ContentAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    await waitFor(() => expect(marketingAggregationService.getAspectDrivers).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(/Search by keyword to override/);
    fireEvent.change(input, { target: { value: 'joker' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(auraMathService.getAspectDrivers).toHaveBeenCalledWith('joker'));
    // Still only the single initial aggregated call.
    expect(marketingAggregationService.getAspectDrivers).toHaveBeenCalledTimes(1);
  });

  it('shows an error banner when the aggregated load fails', async () => {
    marketingAggregationService.getAspectDrivers.mockRejectedValue(new Error('aggregate boom'));
    renderWithClient(<ContentAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    expect(await screen.findByText(/aggregate boom/)).toBeTruthy();
  });

  it('renders only the top 20 aspect drivers ranked by impact', async () => {
    // 30 strengths with descending impact (30..1) — only the top 20 should show,
    // and the lowest-impact ones (impact 1–10, i.e. aspects 21–30) must be dropped.
    const manyStrengths = Array.from({ length: 30 }, (_, i) => ({
      aspect: `aspect-${i}`,
      averageSentiment: 80,
      postsMentioning: 5,
      impactScore: 30 - i,
    }));
    mockReturn(marketingAggregationService.getAspectDrivers, {
      totalPostsAnalyzed: { total: 100 },
      strengths: manyStrengths,
      weaknesses: [],
    });
    renderWithClient(<ContentAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    // Highest impact (aspect-0) is shown; a low-impact one beyond the cut is not.
    expect(await screen.findByText('aspect-0')).toBeTruthy();
    expect(screen.getByText('aspect-19')).toBeTruthy();
    expect(screen.queryByText('aspect-20')).toBeNull();
    expect(screen.getByText(/Top 20 of 30/)).toBeTruthy();
  });

  it('ranks weaknesses above strengths when their impact is higher', async () => {
    mockReturn(marketingAggregationService.getAspectDrivers, {
      totalPostsAnalyzed: { total: 100 },
      strengths: [{ aspect: 'low-strength', averageSentiment: 90, postsMentioning: 3, impactScore: 2 }],
      weaknesses: [{ aspect: 'high-weakness', averageSentiment: 20, postsMentioning: 8, impactScore: 9 }],
    });
    renderWithClient(<ContentAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    const high = await screen.findByText('high-weakness');
    const low = screen.getByText('low-strength');
    // Higher-impact weakness should appear before the lower-impact strength in the DOM.
    expect(high.compareDocumentPosition(low) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
