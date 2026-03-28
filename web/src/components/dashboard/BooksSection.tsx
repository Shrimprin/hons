'use client';

import { BookCard } from '@/components/dashboard/BookCard';
import { BookCardSkeleton } from '@/components/dashboard/BookCardSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { SearchBar } from '@/components/dashboard/SearchBar';
import type { KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/types/dashboard';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useMemo, useState } from 'react';

interface BooksSectionProps {
  snapshot: KindleLibrarySnapshot | null;
  books: KindleBookSnapshotItem[];
  onOpenBook: (book: KindleBookSnapshotItem) => void;
  isSyncing: boolean;
}

type SortKey = 'default' | 'title-asc' | 'title-desc';

function formatTakenAt(takenAt: string | undefined): string {
  if (!takenAt) return '未同期';
  const date = parseISO(takenAt);
  if (Number.isNaN(date.getTime())) return '未同期';

  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
}

function sortBooks(books: readonly KindleBookSnapshotItem[], sortKey: SortKey): KindleBookSnapshotItem[] {
  if (sortKey === 'default') return [...books];
  const direction = sortKey === 'title-asc' ? 1 : -1;
  return [...books].sort((a, b) => direction * a.title.localeCompare(b.title, 'ja'));
}

export function BooksSection({ snapshot, books, onOpenBook, isSyncing }: BooksSectionProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? books.filter((b) => b.title.toLowerCase().includes(q)) : books;
    return sortBooks(base, sortKey);
  }, [books, query, sortKey]);

  const showSkeletons = isSyncing && books.length === 0;

  return (
    <section className="space-y-4">
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        sortKey={sortKey}
        onSortChange={(key) => setSortKey(key as SortKey)}
        totalCount={snapshot?.total ?? 0}
        filteredCount={filteredBooks.length}
        lastUpdated={formatTakenAt(snapshot?.takenAt)}
      />

      {showSkeletons && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!showSkeletons && filteredBooks.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredBooks.map((book, index) => (
            <BookCard key={`${book.asin ?? book.title}-${index}`} book={book} onOpen={onOpenBook} />
          ))}
        </div>
      )}

      {!showSkeletons && filteredBooks.length === 0 && books.length > 0 && (
        <p className="py-12 text-center text-sm text-zinc-400">「{query}」に一致する書籍が見つかりません</p>
      )}

      {!showSkeletons && books.length === 0 && !isSyncing && <EmptyState />}
    </section>
  );
}
