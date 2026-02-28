import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: () => null,
}));

import Home from './page';

describe('Home page', () => {
  it('renders main heading and primary links', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /to get started/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /deploy now/i })).toHaveAttribute(
      'href',
      expect.stringContaining('vercel.com/new'),
    );
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      expect.stringContaining('nextjs.org/docs'),
    );
  });
});
