import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckpointManager from './CheckpointManager';

// Mock the api barrel that the component imports checkpointService from
vi.mock('../../api', () => ({
  checkpointService: {
    listByEntity: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { checkpointService } from '../../api';

const CHECKPOINT = {
  id: 9,
  entityId: 6,
  entityName: 'Parasakthi',
  checkpointDate: '2026-03-15',
  description: 'Trailer Launch',
};

function renderManager() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckpointManager entityId={6} entityName="Parasakthi" />
    </QueryClientProvider>
  );
}

describe('CheckpointManager edit flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkpointService.listByEntity.mockResolvedValue([CHECKPOINT]);
    checkpointService.update.mockResolvedValue(CHECKPOINT);
  });

  it('opens an inline edit form pre-filled with the checkpoint values', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));

    expect(screen.getByDisplayValue('Trailer Launch')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-03-15')).toBeInTheDocument();
    expect(screen.getByTitle('Save changes')).toBeInTheDocument();
  });

  it('saves only the changed fields via checkpointService.update', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));

    fireEvent.change(screen.getByDisplayValue('Trailer Launch'), {
      target: { value: 'Teaser Drop' },
    });
    fireEvent.change(screen.getByDisplayValue('2026-03-15'), {
      target: { value: '2026-03-20' },
    });
    fireEvent.click(screen.getByTitle('Save changes'));

    await waitFor(() => {
      expect(checkpointService.update).toHaveBeenCalledWith(9, {
        description: 'Teaser Drop',
        checkpointDate: '2026-03-20',
      });
    });
  });

  it('sends only the description when only the description changed', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));

    fireEvent.change(screen.getByDisplayValue('Trailer Launch'), {
      target: { value: 'Teaser Drop' },
    });
    fireEvent.click(screen.getByTitle('Save changes'));

    await waitFor(() => {
      expect(checkpointService.update).toHaveBeenCalledWith(9, { description: 'Teaser Drop' });
    });
  });

  it('blocks a blank description with a validation error and does not call update', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));

    fireEvent.change(screen.getByDisplayValue('Trailer Launch'), { target: { value: '' } });
    fireEvent.click(screen.getByTitle('Save changes'));

    expect(await screen.findByText('Description is required')).toBeInTheDocument();
    expect(checkpointService.update).not.toHaveBeenCalled();
  });

  it('does not call update on a no-op save (nothing changed) and exits edit mode', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));
    fireEvent.click(screen.getByTitle('Save changes'));

    await waitFor(() => {
      expect(screen.queryByTitle('Save changes')).not.toBeInTheDocument();
    });
    expect(checkpointService.update).not.toHaveBeenCalled();
  });

  it('discards edits on cancel without calling update', async () => {
    renderManager();
    fireEvent.click(await screen.findByTitle('Edit checkpoint'));

    fireEvent.change(screen.getByDisplayValue('Trailer Launch'), {
      target: { value: 'Should not persist' },
    });
    fireEvent.click(screen.getByTitle('Cancel'));

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Should not persist')).not.toBeInTheDocument();
    });
    expect(checkpointService.update).not.toHaveBeenCalled();
    // original value still rendered in the read-only row
    expect(screen.getByText('Trailer Launch')).toBeInTheDocument();
  });
});
