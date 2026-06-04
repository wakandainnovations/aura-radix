import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SpreaderAnalysisView from './SpreaderAnalysisView';
import { auraMathService } from '../../api/auraMathService';
import { marketingAggregationService } from '../../api/marketingAggregationService';

vi.mock('../../api/auraMathService', () => ({
  auraMathService: {
    getViralSeeds: vi.fn(),
    getTopSpreaders: vi.fn(),
    findLookalikes: vi.fn(),
  },
}));

vi.mock('../../api/marketingAggregationService', () => ({
  marketingAggregationService: {
    getViralSeeds: vi.fn(),
    getTopSpreaders: vi.fn(),
  },
}));

const renderWithClient = (ui) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};

const flush = () => new Promise((r) => setTimeout(r, 0));

const sampleSeeds = [
  { rank: 1, author: 'alice', seedScore: 0.9, primaryPlatform: 'x', reachSignals: {}, outreachHandle: { profile_url: 'http://x.com/alice' } },
  { rank: 2, author: 'bob', seedScore: 0.7, primaryPlatform: 'youtube', reachSignals: {} },
];

const sampleSpreaders = [
  { author: 'carol', viral_potential_score: 88.5, total_views: 1000, total_likes: 50, total_comments: 10, engagement_rate: 0.06, average_sentiment_score: 75 },
];

const mockReturn = (fn, val) => fn.mockResolvedValue(val);

beforeEach(() => {
  auraMathService.getViralSeeds.mockReset();
  auraMathService.getTopSpreaders.mockReset();
  auraMathService.findLookalikes.mockReset();
  marketingAggregationService.getViralSeeds.mockReset();
  marketingAggregationService.getTopSpreaders.mockReset();
});

describe('SpreaderAnalysisView', () => {
  it('auto-loads aggregated viral seeds and top spreaders for the selected entity', async () => {
    mockReturn(marketingAggregationService.getViralSeeds, sampleSeeds);
    mockReturn(marketingAggregationService.getTopSpreaders, sampleSpreaders);
    renderWithClient(<SpreaderAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    await waitFor(() => {
      expect(marketingAggregationService.getViralSeeds).toHaveBeenCalledWith({ entityId: 'e1' });
      expect(marketingAggregationService.getTopSpreaders).toHaveBeenCalledWith({ entityId: 'e1' });
    });
    expect(await screen.findByText(/Showing aggregated data/)).toBeTruthy();
    expect(await screen.findByText('alice')).toBeTruthy();
    expect(await screen.findByText('carol')).toBeTruthy();
    // Aggregated path must not hit the keyword (auraMath) endpoints.
    expect(auraMathService.getViralSeeds).not.toHaveBeenCalled();
    expect(auraMathService.getTopSpreaders).not.toHaveBeenCalled();
  });

  it('does not fetch when no entity is selected and no keyword is entered', async () => {
    renderWithClient(<SpreaderAnalysisView selectedEntity={null} />);
    await flush();
    expect(marketingAggregationService.getViralSeeds).not.toHaveBeenCalled();
    expect(marketingAggregationService.getTopSpreaders).not.toHaveBeenCalled();
    expect(auraMathService.getViralSeeds).not.toHaveBeenCalled();
    expect(auraMathService.getTopSpreaders).not.toHaveBeenCalled();
  });

  it('overrides viral seeds with the keyword endpoint', async () => {
    mockReturn(auraMathService.getViralSeeds, sampleSeeds);
    renderWithClient(<SpreaderAnalysisView selectedEntity={null} />);

    const overrideInputs = screen.getAllByPlaceholderText(/Search by keyword to override/);
    fireEvent.change(overrideInputs[0], { target: { value: 'nolan' } });
    fireEvent.keyDown(overrideInputs[0], { key: 'Enter' });

    await waitFor(() => expect(auraMathService.getViralSeeds).toHaveBeenCalledWith('nolan'));
    expect(marketingAggregationService.getViralSeeds).not.toHaveBeenCalled();
  });

  it('overrides top spreaders with the keyword endpoint', async () => {
    mockReturn(auraMathService.getTopSpreaders, sampleSpreaders);
    renderWithClient(<SpreaderAnalysisView selectedEntity={null} />);

    const overrideInputs = screen.getAllByPlaceholderText(/Search by keyword to override/);
    fireEvent.change(overrideInputs[1], { target: { value: 'nolan' } });
    fireEvent.keyDown(overrideInputs[1], { key: 'Enter' });

    await waitFor(() => expect(auraMathService.getTopSpreaders).toHaveBeenCalledWith('nolan'));
    expect(marketingAggregationService.getTopSpreaders).not.toHaveBeenCalled();
  });

  it('looks up lookalikes by seed author id', async () => {
    mockReturn(auraMathService.findLookalikes, [{ author: 'dave' }]);
    renderWithClient(<SpreaderAnalysisView selectedEntity={null} />);

    const seedInput = screen.getByPlaceholderText(/Enter seed author ID/);
    fireEvent.change(seedInput, { target: { value: 'seed-123' } });
    fireEvent.keyDown(seedInput, { key: 'Enter' });

    await waitFor(() => expect(auraMathService.findLookalikes).toHaveBeenCalledWith('seed-123'));
  });

  it('hides top spreaders whose sentiment is 0 (or missing)', async () => {
    mockReturn(marketingAggregationService.getViralSeeds, []);
    mockReturn(marketingAggregationService.getTopSpreaders, [
      { author: 'carol', viral_potential_score: 88.5, average_sentiment_score: 75 },
      { author: 'zeke', viral_potential_score: 50, average_sentiment_score: 0 },
      { author: 'nomad', viral_potential_score: 40 },
    ]);
    renderWithClient(<SpreaderAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    expect(await screen.findByText('carol')).toBeTruthy();
    expect(screen.queryByText('zeke')).toBeNull();
    expect(screen.queryByText('nomad')).toBeNull();
  });

  it('links an author name to their platform profile when the backend provides one', async () => {
    mockReturn(marketingAggregationService.getViralSeeds, []);
    mockReturn(marketingAggregationService.getTopSpreaders, [
      { author: 'carol', viral_potential_score: 88.5, average_sentiment_score: 75, profile_url: 'https://x.com/carol' },
      { author: 'dan', viral_potential_score: 70, average_sentiment_score: 60 },
    ]);
    renderWithClient(<SpreaderAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    const carol = await screen.findByText('carol');
    expect(carol.tagName).toBe('A');
    expect(carol.getAttribute('href')).toBe('https://x.com/carol');
    // No profile URL -> plain text, not a link.
    expect((await screen.findByText('dan')).tagName).not.toBe('A');
  });

  it('links viral seed authors via their outreach handle', async () => {
    mockReturn(marketingAggregationService.getViralSeeds, sampleSeeds);
    mockReturn(marketingAggregationService.getTopSpreaders, []);
    renderWithClient(<SpreaderAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    const alice = await screen.findByText('alice');
    expect(alice.tagName).toBe('A');
    expect(alice.getAttribute('href')).toBe('http://x.com/alice');
    // bob has no outreach handle -> plain text.
    expect((await screen.findByText('bob')).tagName).not.toBe('A');
  });

  it('links lookalike authors to the profile in their platform handles', async () => {
    mockReturn(auraMathService.findLookalikes, [
      {
        author: 'dave',
        platform_handles: {
          primary_platform: 'youtube',
          by_platform: { youtube: { profile_url: 'https://youtube.com/@dave' } },
        },
      },
    ]);
    renderWithClient(<SpreaderAnalysisView selectedEntity={null} />);

    const seedInput = screen.getByPlaceholderText(/Enter seed author ID/);
    fireEvent.change(seedInput, { target: { value: 'seed-123' } });
    fireEvent.keyDown(seedInput, { key: 'Enter' });

    const dave = await screen.findByText('dave');
    expect(dave.tagName).toBe('A');
    expect(dave.getAttribute('href')).toBe('https://youtube.com/@dave');
  });

  it('shows an error banner when the aggregated load fails', async () => {
    marketingAggregationService.getViralSeeds.mockRejectedValue(new Error('seeds boom'));
    marketingAggregationService.getTopSpreaders.mockResolvedValue(sampleSpreaders);
    renderWithClient(<SpreaderAnalysisView selectedEntity={{ id: 'e1', name: 'Inception' }} />);

    expect(await screen.findByText(/seeds boom/, undefined, { timeout: 4000 })).toBeTruthy();
  });
});
