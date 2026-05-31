import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { createRef } from 'react';
import { Input } from './input';

afterEach(() => {
  cleanup();
});

describe('Input', () => {
  it('renders a text input by default', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a label associated with the input', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('uses custom id when provided', () => {
    render(<Input id="my-input" label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('id', 'my-input');
  });

  it('renders error message below the input', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling to the input border', () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('renders helper text below the input', () => {
    render(<Input helperText="Enter your full name" />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('shows error instead of helper text when both are provided', () => {
    render(<Input error="Required" helperText="Enter your name" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.queryByText('Enter your name')).not.toBeInTheDocument();
  });

  it('sets aria-invalid when there is an error', () => {
    render(<Input error="Invalid email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('sets aria-describedby linking to the description element', () => {
    render(<Input id="email" error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-description');
    const description = document.getElementById('email-description');
    expect(description).toHaveTextContent('Invalid');
  });

  it('sets aria-describedby for helper text', () => {
    render(<Input id="name" helperText="Your full name" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'name-description');
  });

  it('does not set aria-describedby when no error or helper text', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('supports different input types', () => {
    render(<Input type="password" id="pass" label="Password" />);
    const input = document.getElementById('pass') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts a custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-class');
  });

  it('passes additional HTML attributes', () => {
    render(<Input placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('supports disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
