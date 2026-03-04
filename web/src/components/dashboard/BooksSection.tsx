import { BookCard } from '@/components/dashboard/BookCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/types/dashboard';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface BooksSectionProps {
  snapshot: KindleLibrarySnapshot | null;
  books: KindleBookSnapshotItem[];
  onOpenBook: (book: KindleBookSnapshotItem) => void;
}

function formatTakenAt(takenAt: string | undefined): string {
  if (!takenAt) return '未同期';
  const date = parseISO(takenAt);
  if (Number.isNaN(date.getTime())) return '未同期';

  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
}

export function BooksSection({ snapshot, books, onOpenBook }: BooksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>書籍一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-1 text-sm">件数: {snapshot?.total ?? 0}</p>
        <p className="mb-4 text-sm">最終更新: {formatTakenAt(snapshot?.takenAt)}</p>
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
