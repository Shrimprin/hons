import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('Home page', () => {
  it('renders sync dashboard controls', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'HONS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kindle 同期を開始' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'スナップショット再取得' })).toBeInTheDocument();
  });
});
