import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NavLink } from './nav-link';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock next/link to render a plain anchor
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { usePathname } from 'next/navigation';

const mockedUsePathname = vi.mocked(usePathname);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NavLink', () => {
  it('renders a link with the correct href and label', () => {
    mockedUsePathname.mockReturnValue('/home');
    render(<NavLink href="/home" label="Home" />);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('applies active styling when pathname matches href', () => {
    mockedUsePathname.mockReturnValue('/home');
    render(<NavLink href="/home" label="Home" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('bg-brand-50');
    expect(link.className).toContain('text-brand-600');
  });

  it('applies active styling when pathname starts with href', () => {
    mockedUsePathname.mockReturnValue('/library/details');
    render(<NavLink href="/library" label="Library" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('bg-brand-50');
    expect(link.className).toContain('text-brand-600');
  });

  it('applies inactive styling when pathname does not match href', () => {
    mockedUsePathname.mockReturnValue('/home');
    render(<NavLink href="/library" label="Library" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('text-text-secondary');
    expect(link.className).not.toContain('bg-brand-50');
  });

  it('renders an icon when provided', () => {
    mockedUsePathname.mockReturnValue('/home');
    const icon = <svg data-testid="test-icon" />;
    render(<NavLink href="/home" label="Home" icon={icon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('wraps the icon in a span with sizing classes', () => {
    mockedUsePathname.mockReturnValue('/home');
    const icon = <svg data-testid="test-icon" />;
    render(<NavLink href="/home" label="Home" icon={icon} />);
    const iconWrapper = screen.getByTestId('test-icon').parentElement;
    expect(iconWrapper?.tagName).toBe('SPAN');
    expect(iconWrapper?.className).toContain('h-5');
    expect(iconWrapper?.className).toContain('w-5');
  });

  it('does not render an icon wrapper when icon is not provided', () => {
    mockedUsePathname.mockReturnValue('/home');
    render(<NavLink href="/home" label="Home" />);
    const link = screen.getByRole('link');
    expect(link.querySelector('span')).toBeNull();
  });
});
