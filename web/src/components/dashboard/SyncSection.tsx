import type { SyncStatus } from '@/types/sync';

type StatusBarProps = {
  syncStatus: SyncStatus;
  statusText: string;
};

export function StatusBar({ syncStatus, statusText }: StatusBarProps) {
  if (syncStatus === 'idle') return null;

  const isCompleted = syncStatus === 'completed';

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
        isCompleted
          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      }`}
    >
      {!isCompleted && (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {isCompleted && (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      <span>{statusText}</span>
    </div>
  );
}

// Keep backward-compatible export name
export { StatusBar as SyncControls };
