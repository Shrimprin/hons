import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/types/dashboard';
import { BooksSection } from './BooksSection';

const sampleBooks: KindleBookSnapshotItem[] = [
  { title: '進撃の巨人(1)', asin: 'B001', imageUrl: null },
  { title: 'ワンピース(100)', asin: 'B002', imageUrl: 'https://example.com/op.jpg' },
  { title: 'NARUTO(72)', asin: 'B003', imageUrl: null },
];

const sampleSnapshot: KindleLibrarySnapshot = {
  takenAt: new Date().toISOString(),
  url: 'https://read.amazon.co.jp/kindle-library',
  total: 3,
  books: sampleBooks,
};

const defaultProps = {
  snapshot: sampleSnapshot,
  books: sampleBooks,
  onOpenBook: vi.fn(),
  isSyncing: false,
};

describe('BooksSection', () => {
  it('displays book count from snapshot', () => {
    const { container } = render(<BooksSection {...defaultProps} />);
    expect(container.textContent).toContain('3冊');
  });

  it('renders all book titles', () => {
    const { container } = render(<BooksSection {...defaultProps} />);
    expect(container.textContent).toContain('進撃の巨人(1)');
    expect(container.textContent).toContain('ワンピース(100)');
    expect(container.textContent).toContain('NARUTO(72)');
  });

  it('shows empty message when no books', () => {
    const emptySnapshot: KindleLibrarySnapshot = { ...sampleSnapshot, total: 0, books: [] };
    const { container } = render(
      <BooksSection {...defaultProps} snapshot={emptySnapshot} books={[]} />,
    );
    expect(container.textContent).toContain('まだ書籍がありません');
  });

  it('shows 未同期 when snapshot is null', () => {
    const { container } = render(<BooksSection {...defaultProps} snapshot={null} books={[]} />);
    expect(container.textContent).toContain('未同期');
  });

  it('calls onOpenBook when a book card is clicked', async () => {
    const user = userEvent.setup();
    const onOpenBook = vi.fn();
    const { container } = render(<BooksSection {...defaultProps} onOpenBook={onOpenBook} />);

    const firstButton = container.querySelector('button');
    expect(firstButton).not.toBeNull();
    await user.click(firstButton!);
    expect(onOpenBook).toHaveBeenCalledWith(sampleBooks[0]);
  });

  it('shows skeletons when syncing with no books', () => {
    const { container } = render(
      <BooksSection snapshot={null} books={[]} onOpenBook={vi.fn()} isSyncing={true} />,
    );
    const skeletons = container.querySelectorAll('[data-testid="book-skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  describe('search', () => {
    it('renders a search input', () => {
      const { container } = render(<BooksSection {...defaultProps} />);
      const input = container.querySelector('input[type="search"]');
      expect(input).not.toBeNull();
    });

    it('filters books by title when user types in search', async () => {
      const user = userEvent.setup();
      const { container } = render(<BooksSection {...defaultProps} />);

      const input = container.querySelector('input[type="search"]')!;
      await user.type(input, 'ワンピース');

      expect(container.textContent).toContain('ワンピース(100)');
      expect(container.textContent).not.toContain('進撃の巨人(1)');
      expect(container.textContent).not.toContain('NARUTO(72)');
    });

    it('shows all books when search is cleared', async () => {
      const user = userEvent.setup();
      const { container } = render(<BooksSection {...defaultProps} />);

      const input = container.querySelector('input[type="search"]')!;
      await user.type(input, 'ワンピース');
      await user.clear(input);

      expect(container.textContent).toContain('進撃の巨人(1)');
      expect(container.textContent).toContain('ワンピース(100)');
      expect(container.textContent).toContain('NARUTO(72)');
    });
  });

  describe('sort', () => {
    it('renders a sort select', () => {
      const { container } = render(<BooksSection {...defaultProps} />);
      const select = container.querySelector('select');
      expect(select).not.toBeNull();
    });

    it('sorts books by title ascending', async () => {
      const user = userEvent.setup();
      const { container } = render(<BooksSection {...defaultProps} />);

      const select = container.querySelector('select')!;
      await user.selectOptions(select, 'title-asc');

      const buttons = container.querySelectorAll('button');
      const titles = Array.from(buttons).map((b) => b.textContent?.trim());
      expect(titles[0]).toContain('NARUTO');
      expect(titles[1]).toContain('ワンピース');
      expect(titles[2]).toContain('進撃の巨人');
    });
  });
});
