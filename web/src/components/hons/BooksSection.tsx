import { BookCard } from '@/components/hons/BookCard';
import type { KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/components/hons/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BooksSectionProps {
  snapshot: KindleLibrarySnapshot | null;
  books: KindleBookSnapshotItem[];
  onOpenBook: (book: KindleBookSnapshotItem) => void;
}

export function BooksSection({ snapshot, books, onOpenBook }: BooksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>同期結果（全件表示）</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-1 text-sm">件数: {snapshot?.total ?? 0}</p>
        <p className="mb-4 text-sm">最終更新: {snapshot?.takenAt ?? '未同期'}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book, index) => (
            <BookCard key={`${book.asin ?? book.title}-${index}`} book={book} onOpen={onOpenBook} />
          ))}
        </div>
        {books.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            まだ表示できる書籍がありません。同期を実行してスナップショットを取得してください。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
