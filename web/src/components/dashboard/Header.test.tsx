import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Header } from './Header';

const defaultProps = {
  syncStatus: 'idle' as const,
  onStartSync: vi.fn(),
  onRefreshSnapshot: vi.fn(),
};

describe('Header', () => {
  it('renders the app title', () => {
    const { container } = render(<Header {...defaultProps} />);
    expect(container.textContent).toContain('HONS');
  });

  it('renders the app description', () => {
    const { container } = render(<Header {...defaultProps} />);
    expect(container.textContent).toContain('Book Ownership Dashboard');
  });

  it('renders a dark mode toggle button', () => {
    const { container } = render(<Header {...defaultProps} />);
    const toggle = container.querySelector('[data-testid="theme-toggle"]');
    expect(toggle).not.toBeNull();
  });

  it('toggles dark class on document when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header {...defaultProps} />);

    const toggle = container.querySelector('[data-testid="theme-toggle"]')!;
    document.documentElement.classList.remove('dark');

    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders a sync button', () => {
    const { container } = render(<Header {...defaultProps} />);
    expect(container.textContent).toContain('同期');
  });

  it('calls onStartSync when sync button is clicked', async () => {
    const user = userEvent.setup();
    const onStartSync = vi.fn();
    const { container } = render(<Header {...defaultProps} onStartSync={onStartSync} />);

    const buttons = container.querySelectorAll('button');
    const syncButton = Array.from(buttons).find((b) => b.textContent?.includes('同期'));
    await user.click(syncButton!);
    expect(onStartSync).toHaveBeenCalledOnce();
1  });
});
