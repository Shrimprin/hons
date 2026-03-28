import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBar } from './SyncSection';

describe('StatusBar', () => {
  it('renders nothing when idle', () => {
    const { container } = render(<StatusBar syncStatus="idle" statusText="拡張機能の応答待ち" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows syncing state with spinner', () => {
    const { container } = render(<StatusBar syncStatus="syncing" statusText="同期中..." />);
    expect(container.textContent).toContain('同期中');
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();
  });

  it('shows completed state with check icon', () => {
    const { container } = render(<StatusBar syncStatus="completed" statusText="同期完了: 100冊" />);
    expect(container.textContent).toContain('同期完了: 100冊');
  });

  it('displays status text', () => {
    const { container } = render(<StatusBar syncStatus="syncing" statusText="取得した書籍: 50冊" />);
    expect(container.textContent).toContain('取得した書籍: 50冊');
  });
});
