import type { KindleBookSnapshotItem } from '@/types/dashboard';
import { extractVolume } from '@hons/shared/utils/volume';
import Image from 'next/image';

type BookCardProps = {
  book: KindleBookSnapshotItem;
  onOpen: (book: KindleBookSnapshotItem) => void;
};

export function BookCard({ book, onOpen }: BookCardProps) {
  const volume = extractVolume(book.title);

  return (
    <button
      type="button"
      className="group text-left focus-visible:outline-none"
      onClick={() => onOpen(book)}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {book.imageUrl ? (
          <Image
            src={book.imageUrl}
            alt={book.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">画像なし</div>
        )}
        {volume !== null && (
          <span
            data-testid="volume-badge"
            className="absolute top-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm dark:bg-white/80 dark:text-zinc-900"
          >
            {volume}
          </span>
        )}
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/5" />
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-[13px] leading-snug font-medium text-zinc-800 group-hover:text-zinc-950 dark:text-zinc-200 dark:group-hover:text-white">
          {book.title}
        </p>
      </div>
    </button>
  );
}
