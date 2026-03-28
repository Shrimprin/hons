'use client';

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  sortKey: string;
  onSortChange: (sortKey: string) => void;
  totalCount: number;
  filteredCount: number;
  lastUpdated: string;
};

export function SearchBar({
  query,
  onQueryChange,
  sortKey,
  onSortChange,
  totalCount,
  filteredCount,
  lastUpdated,
}: SearchBarProps) {
  const showFilteredCount = query.trim() !== '' && filteredCount !== totalCount;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="search"
            placeholder="タイトルで検索..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="検索をクリア"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-10 rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
        >
          <option value="default">デフォルト</option>
          <option value="title-asc">タイトル A→Z</option>
          <option value="title-desc">タイトル Z→A</option>
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <span>
          {showFilteredCount ? `${filteredCount} / ${totalCount}冊` : `${totalCount}冊`}
        </span>
        <span>·</span>
        <span>{lastUpdated}</span>
      </div>
    </div>
  );
}
