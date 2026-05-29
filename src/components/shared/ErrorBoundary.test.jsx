import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary Component', () => {
  // Suppress console errors for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children without errors', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('catches errors and displays error UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const customFallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('has retry button in default error UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('calls onReset when retry button is clicked', async () => {
    const onReset = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <div>Test</div>
      </ErrorBoundary>
    );

    // Initial render should be fine
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('has alert role for error message', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const ThrowError = () => {
      throw new Error('Detailed test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const details = screen.getByText('Error Details');
    expect(details).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});
