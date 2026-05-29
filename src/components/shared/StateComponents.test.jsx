import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, LoadingState } from './StateComponents';

describe('EmptyState Component', () => {
  it('renders with default content', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display at this time.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(
      <EmptyState
        title="No Movies"
        description="There are no movies to display"
      />
    );
    
    expect(screen.getByText('No Movies')).toBeInTheDocument();
    expect(screen.getByText('There are no movies to display')).toBeInTheDocument();
  });

  it('renders with custom action', () => {
    const action = <button>Load Data</button>;
    render(<EmptyState action={action} />);
    
    expect(screen.getByRole('button', { name: 'Load Data' })).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<EmptyState title="Test" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders icon with aria-hidden', () => {
    const { container } = render(<EmptyState />);
    
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});

describe('ErrorState Component', () => {
  const mockError = new Error('Test error message');

  it('renders with error message', () => {
    render(<ErrorState error={mockError} />);
    
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorState error={mockError} title="Custom Error" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = () => {};
    render(<ErrorState error={mockError} onRetry={onRetry} />);
    
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('does not render retry button without onRetry', () => {
    render(<ErrorState error={mockError} />);
    
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<ErrorState error={mockError} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('handles error without message', () => {
    render(<ErrorState error={{ name: 'Error' }} />);
    
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });
});

describe('LoadingState Component', () => {
  it('renders default number of skeleton loaders', () => {
    render(<LoadingState />);
    
    const skeletons = screen.getAllByTestId(/^skeleton-loader-/);
    expect(skeletons).toHaveLength(3);
  });

  it('renders custom number of skeleton loaders', () => {
    render(<LoadingState count={5} />);
    
    const skeletons = screen.getAllByTestId(/^skeleton-loader-/);
    expect(skeletons).toHaveLength(5);
  });

  it('has status role for accessibility', () => {
    render(<LoadingState />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-busy attribute', () => {
    render(<LoadingState />);
    
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingState className="custom-loading" />);
    
    expect(container.firstChild).toHaveClass('custom-loading');
  });

  it('renders loading label', () => {
    render(<LoadingState />);
    
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data');
  });
});
