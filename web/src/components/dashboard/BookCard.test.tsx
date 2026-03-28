import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { KindleBookSnapshotItem } from '@/types/dashboard';
import { BookCard } from './BookCard';

const baseBook: KindleBookSnapshotItem = {
  title: '進撃の巨人(1)',
  asin: 'B009KYC27W',
  imageUrl: 'https://example.com/cover.jpg',
  detailUrl: 'https://read.amazon.co.jp/manga/B009KYC27W',
};

describe('BookCard', () => {
  it('renders book title', () => {
    const { container } = render(<BookCard book={baseBook} onOpen={vi.fn()} />);
    expect(container.textContent).toContain('進撃の巨人(1)');
  });

  it('renders book cover image when imageUrl exists', () => {
    const { container } = render(<BookCard book={baseBook} onOpen={vi.fn()} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('進撃の巨人(1)');
  });

  it('renders placeholder when imageUrl is null', () => {
    const bookWithoutImage: KindleBookSnapshotItem = { ...baseBook, imageUrl: null };
    const { container } = render(<BookCard book={bookWithoutImage} onOpen={vi.fn()} />);
    expect(container.textContent).toContain('画像なし');
  });

  it('calls onOpen with the book when clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const { container } = render(<BookCard book={baseBook} onOpen={onOpen} />);

    const button = container.querySelector('button');
    await user.click(button!);
    expect(onOpen).toHaveBeenCalledWith(baseBook);
  });

  it('displays volume badge when title contains volume number', () => {
    const { container } = render(<BookCard book={baseBook} onOpen={vi.fn()} />);
    const badge = container.querySelector('[data-testid="volume-badge"]');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('1');
  });

  it('does not display volume badge when title has no volume', () => {
    const bookNoVolume: KindleBookSnapshotItem = { ...baseBook, title: 'ハリー・ポッター' };
    const { container } = render(<BookCard book={bookNoVolume} onOpen={vi.fn()} />);
    const badge = container.querySelector('[data-testid="volume-badge"]');
    expect(badge).toBeNull();
  });

  it('renders the book as a clickable button', () => {
    const { container } = render(<BookCard book={baseBook} onOpen={vi.fn()} />);
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
  });
});
