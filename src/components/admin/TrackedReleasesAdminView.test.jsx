import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrackedReleasesAdminView from './TrackedReleasesAdminView';

vi.mock('../../api/adminLicenseService', () => ({
  adminLicenseService: { listUsers: vi.fn(() => Promise.resolve([{ id: 42, username: 'producer1' }])) },
}));

vi.mock('../../api/adminTrackedReleaseService', () => ({
  adminTrackedReleaseService: {
    addToPlatform: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { adminTrackedReleaseService as api } from '../../api/adminTrackedReleaseService';

const row = (overrides) => ({
  id: 1,
  entityName: 'Mr Lucky',
  language: 'kannada',
  releaseDate: '2026-11-20',
  trackFrom: '2026-11-13',
  trackUntil: '2026-11-27',
  keywords: ['MrLucky', 'Mr Lucky Kannada'],
  source: 'TMDB',
  popularity: 2.5,
  excluded: false,
  status: 'TRACKING',
  collected: { x: 10, instagram: 5, reddit: 0, youtubeComments: 0, youtubeVideos: 0 },
  collectedTotal: 15,
  relevancePct: 92.4,
  relevanceSample: 80,
  relevanceChecked: true,
  relevanceOverride: false,
  ...overrides,
});

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TrackedReleasesAdminView />
    </QueryClientProvider>
  );
}

describe('TrackedReleasesAdminView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue([
      row({}),
      row({ id: 2, entityName: 'Appu Garage', source: 'MANUAL', status: 'UPCOMING', collectedTotal: 0, collected: {},
        relevancePct: null, relevanceSample: null, relevanceChecked: false }),
    ]);
    api.update.mockResolvedValue({});
  });

  it('lists current releases with status and collected totals', async () => {
    renderView();
    expect(await screen.findByText('Mr Lucky')).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith('current');
    expect(screen.getByText('TRACKING')).toBeInTheDocument();
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
    expect(screen.getByText('X: 10')).toBeInTheDocument();
  });

  it('excludes a movie with a reason', async () => {
    renderView();
    await screen.findByText('Mr Lucky');
    fireEvent.click(screen.getAllByRole('button', { name: /Exclude/ })[0]);
    fireEvent.change(screen.getByLabelText('Reason for excluding Mr Lucky'), { target: { value: 'too costly' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(1, { excluded: true, excludedReason: 'too costly' })
    );
  });

  it('edits keywords as a comma-separated list', async () => {
    renderView();
    await screen.findByText('Mr Lucky');
    fireEvent.click(screen.getAllByTitle('Edit keywords')[0]);
    fireEvent.change(screen.getByLabelText('Keywords for Mr Lucky'), { target: { value: 'MrLuckyMovie, , Mr Lucky ' } });
    fireEvent.click(screen.getByTitle('Save keywords'));
    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith(1, { keywords: ['MrLuckyMovie', 'Mr Lucky'] })
    );
  });

  it('only offers delete for manually added movies', async () => {
    renderView();
    await screen.findByText('Mr Lucky');
    expect(screen.getAllByTitle('Delete')).toHaveLength(1);
  });

  it('switches scope tabs', async () => {
    renderView();
    await screen.findByText('Mr Lucky');
    fireEvent.click(screen.getByRole('tab', { name: 'Excluded' }));
    await waitFor(() => expect(api.list).toHaveBeenCalledWith('excluded'));
  });

  it('shows relevance score, or that a movie has not been scored yet', async () => {
    renderView();
    await screen.findByText('Mr Lucky');
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('of 80 posts')).toBeInTheDocument();
    expect(screen.getByText('Not scored yet')).toBeInTheDocument();
  });

  it('adds a tracked release to the platform for a chosen user', async () => {
    api.addToPlatform.mockResolvedValue({});
    renderView();
    await screen.findByText('Mr Lucky');
    fireEvent.click(screen.getAllByRole('button', { name: /Add to platform/ })[0]);
    await screen.findByRole('option', { name: 'producer1' });
    fireEvent.change(screen.getByLabelText('Owner for Mr Lucky'), { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(api.addToPlatform).toHaveBeenCalledWith(1, 42));
  });

  it('shows who already has the movie on the platform', async () => {
    api.list.mockResolvedValue([row({ platformEntities: [{ entityId: 9, ownerId: 42, ownerUsername: 'producer1' }] })]);
    renderView();
    expect(await screen.findByText('On platform: producer1')).toBeInTheDocument();
  });
});
