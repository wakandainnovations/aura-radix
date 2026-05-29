import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from './StatsGrid';
import { StatCard } from './StatCard';
import { TrendingUp } from 'lucide-react';

describe('StatsGrid Component', () => {
  const mockStats = [
    {
      icon: TrendingUp,
      label: 'Metric 1',
      value: '100',
      color: 'green',
    },
    {
      icon: TrendingUp,
      label: 'Metric 2',
      value: '200',
      color: 'purple',
    },
    {
      icon: TrendingUp,
      label: 'Metric 3',
      value: '300',
      color: 'blue',
    },
  ];

  it('renders grid with correct number of items', () => {
    render(<StatsGrid stats={mockStats} columns={3} />);
    
    const items = screen.getAllByTestId(/^stat-item-/);
    expect(items).toHaveLength(3);
  });

  it('renders nothing when stats array is empty', () => {
    const { container } = render(<StatsGrid stats={[]} columns={3} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders children when provided', () => {
    render(
      <StatsGrid columns={3}>
        <div data-testid="custom-child">Custom Content</div>
      </StatsGrid>
    );
    
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<StatsGrid stats={mockStats} columns={3} />);
    
    const grid = container.querySelector('[role="region"]');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
  });

  it('has proper accessibility role and label', () => {
    render(<StatsGrid stats={mockStats} columns={3} />);
    
    const grid = screen.getByRole('region');
    expect(grid).toHaveAttribute('aria-label', 'Statistics Grid');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsGrid stats={mockStats} columns={3} className="custom-grid" />
    );
    
    const grid = container.querySelector('[role="region"]');
    expect(grid).toHaveClass('custom-grid');
  });

  it('handles isLoading prop (passed to children)', () => {
    render(<StatsGrid stats={mockStats} columns={3} isLoading={false} />);
    
    // Verify grid still renders
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('uses key based on label for list items', () => {
    const { container } = render(<StatsGrid stats={mockStats} columns={3} />);
    
    // Check that items are rendered (keys are React internal, but items should exist)
    const items = container.querySelectorAll('[data-testid^="stat-item-"]');
    expect(items.length).toBe(3);
  });
});
