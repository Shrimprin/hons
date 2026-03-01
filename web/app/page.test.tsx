import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('Home page', () => {
  it('renders heading and shared utility result', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'BookHub 技術検証' })).toBeInTheDocument();
    expect(screen.getByText(/抽出巻数:/)).toBeInTheDocument();
  });
});
