'use client';

import { Button } from '@/components/ui/button';
import type { SyncStatus } from '@/types/sync';
import { useCallback, useEffect, useState } from 'react';

type HeaderProps = {
  syncStatus: SyncStatus;
  onStartSync: () => void;
  onRefreshSnapshot: () => void;
};

function SyncButton({ syncStatus, onStartSync, onRefreshSnapshot }: HeaderProps) {
  const isSyncing = syncStatus === 'syncing';
  const isCompleted = syncStatus === 'completed';

  return (
    <Button
      variant="outline"
      onClick={isCompleted ? onRefreshSnapshot : onStartSync}
      disabled={isSyncing}
      className="gap-2"
    >
      {isSyncing ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
          />
        </svg>
      )}
      {isSyncing ? '同期中...' : isCompleted ? '再取得' : '同期'}
    </Button>
  );
}

export function Header({ syncStatus, onStartSync, onRefreshSnapshot }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    setIsDark(next);
  }, [isDark]);

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="bg-linear-to-r from-zinc-900 to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400">
          HONS
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Book Ownership Dashboard</p>
      </div>
      <div className="flex items-center gap-2">
        <SyncButton syncStatus={syncStatus} onStartSync={onStartSync} onRefreshSnapshot={onRefreshSnapshot} />
        <button
          type="button"
          data-testid="theme-toggle"
          onClick={toggleTheme}
          className="rounded-md border p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {isDark ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
