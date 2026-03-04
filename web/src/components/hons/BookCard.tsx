import type { KindleBookSnapshotItem } from '@/components/hons/types';
import { Card } from '@/components/ui/card';

interface BookCardProps {
  book: KindleBookSnapshotItem;
  onOpen: (book: KindleBookSnapshotItem) => void;
}

export function BookCard({ book, onOpen }: BookCardProps) {
  return (
    <Card className="group overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" className="w-full text-left" onClick={() => onOpen(book)}>
        <div className="aspect-3/4 w-full bg-zinc-100 dark:bg-zinc-900">
          {book.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.imageUrl}
                alt={book.title}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500">画像なし</div>
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-3 text-sm leading-5 font-medium">{book.title}</p>
        </div>
      </button>
    </Card>
  );
}
