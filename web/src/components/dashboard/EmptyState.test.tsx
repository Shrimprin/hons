import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the empty state message', () => {
    const { container } = render(<EmptyState />);
    expect(container.textContent).toContain('まだ書籍がありません');
  });

  it('renders an illustration icon', () => {
    const { container } = render(<EmptyState />);
    const icon = container.querySelector('[data-testid="empty-icon"]');
    expect(icon).not.toBeNull();
  });

  it('renders sync instruction', () => {
    const { container } = render(<EmptyState />);
    expect(container.textContent).toContain('同期を実行');
  });
});
