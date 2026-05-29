import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { TrendingUp } from 'lucide-react';

describe('StatCard Component', () => {
  const defaultProps = {
    icon: TrendingUp,
    label: 'Test Metric',
    value: '$1,234.56',
    color: 'green',
  };

  it('renders StatCard with all required props', () => {
    render(<StatCard {...defaultProps} />);
    
    const label = screen.getByText('Test Metric');
    const value = screen.getByText('$1,234.56');
    
    expect(label).toBeInTheDocument();
    expect(value).toBeInTheDocument();
  });

  it('displays trend when provided', () => {
    render(<StatCard {...defaultProps} trend={5} />);
    
    const trend = screen.getByTestId('stat-card-trend');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveTextContent('↑ 5%');
  });

  it('shows negative trend correctly', () => {
    render(<StatCard {...defaultProps} trend={-10} />);
    
    const trend = screen.getByTestId('stat-card-trend');
    expect(trend).toHaveTextContent('↓ 10%');
  });

  it('shows no trend indicator for zero trend', () => {
    render(<StatCard {...defaultProps} trend={0} />);
    
    const trend = screen.getByTestId('stat-card-trend');
    expect(trend).toHaveTextContent('→ 0%');
  });

  it('renders icon when provided', () => {
    render(<StatCard {...defaultProps} />);
    
    const icon = screen.getByTestId('stat-card-icon');
    expect(icon).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    render(<StatCard {...defaultProps} icon={undefined} />);
    
    const icon = screen.queryByTestId('stat-card-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    render(<StatCard {...defaultProps} isLoading={true} />);
    
    // The Skeleton component should be rendered
    expect(screen.queryByTestId('stat-card-value')).not.toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<StatCard {...defaultProps} color="purple" />);
    
    const card = container.querySelector('[role="region"]');
    expect(card).toHaveClass('bg-purple-500/10');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard {...defaultProps} className="custom-class" />
    );
    
    const card = container.querySelector('[role="region"]');
    expect(card).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<StatCard {...defaultProps} value="100" />);
    
    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-label', 'Test Metric: 100');
  });

  it('handles multiple color options', () => {
    const colors = ['green', 'purple', 'blue', 'orange', 'red'];
    
    colors.forEach((color) => {
      const { container } = render(
        <StatCard {...defaultProps} color={color} key={color} />
      );
      
      const card = container.querySelector('[role="region"]');
      expect(card).toHaveClass(`bg-${color}-500/10`);
    });
  });
});
