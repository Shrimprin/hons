export function BookCardSkeleton() {
  return (
    <div data-testid="book-skeleton" className="animate-pulse">
      <div className="aspect-3/4 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3.5 w-3/5 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
