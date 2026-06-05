import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { Card } from './card';

afterEach(() => {
  cleanup();
});

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(<Card>Default</Card>);
    const card = screen.getByText('Default');
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('border');
    expect(card.className).toContain('p-6');
    expect(card.className).toContain('bg-surface-secondary');
  });

  it('applies dark mode classes', () => {
    render(<Card>Dark</Card>);
    const card = screen.getByText('Dark');
    expect(card.className).toContain('dark:bg-surface-dark-secondary');
  });

  it('applies elevated variant with shadow', () => {
    render(<Card variant="elevated">Elevated</Card>);
    const card = screen.getByText('Elevated');
    expect(card.className).toContain('shadow-md');
  });

  it('accepts a custom className', () => {
    render(<Card className="custom-class">Custom</Card>);
    const card = screen.getByText('Custom');
    expect(card.className).toContain('custom-class');
  });

  it('passes additional HTML attributes', () => {
    render(<Card data-testid="my-card">Attrs</Card>);
    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<Card ref={ref}>Ref test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
