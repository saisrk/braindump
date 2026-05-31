import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { PageHeader } from './page-header';

afterEach(() => {
  cleanup();
});

describe('PageHeader', () => {
  it('renders the title as an h1', () => {
    render(<PageHeader title="My Page" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'My Page' });
    expect(heading).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="A helpful subtitle" />);
    expect(screen.getByText('A helpful subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const { container } = render(<PageHeader title="Title" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders action slot when provided', () => {
    render(<PageHeader title="Title" action={<button>Add New</button>} />);
    expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
  });

  it('does not render action wrapper when action is not provided', () => {
    const { container } = render(<PageHeader title="Title" />);
    // The outer div has two possible children: the text div and the action div
    // When no action, only the text div should be present
    const outerDiv = container.firstElementChild!;
    expect(outerDiv.children).toHaveLength(1);
  });

  it('applies consistent spacing class (mb-8)', () => {
    const { container } = render(<PageHeader title="Title" />);
    const outerDiv = container.firstElementChild!;
    expect(outerDiv.className).toContain('mb-8');
  });

  it('applies theme text colors for title', () => {
    render(<PageHeader title="Styled Title" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toContain('text-text-primary');
    expect(heading.className).toContain('dark:text-text-dark-primary');
  });

  it('applies theme text colors for subtitle', () => {
    render(<PageHeader title="Title" subtitle="Sub" />);
    const subtitle = screen.getByText('Sub');
    expect(subtitle.className).toContain('text-text-secondary');
    expect(subtitle.className).toContain('dark:text-text-dark-secondary');
  });

  it('accepts a custom className', () => {
    const { container } = render(<PageHeader title="Title" className="custom-class" />);
    const outerDiv = container.firstElementChild!;
    expect(outerDiv.className).toContain('custom-class');
  });
});
