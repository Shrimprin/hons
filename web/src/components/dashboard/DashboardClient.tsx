'use client';

import { useEffect, useMemo, useState } from 'react';

import { BooksSection } from '@/components/dashboard/BooksSection';
import { SyncControls } from '@/components/dashboard/SyncSection';
import type { ExtensionMessage, KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/types/dashboard';
import type { SyncStatus } from '@/types/sync';
import { MESSAGE_TYPE, SOURCE } from '@bookhub/shared';

function requestSnapshot() {
  // postMessage is handled by webDashboardBridge.ts
  window.postMessage(
    {
      source: SOURCE.WEB,
      type: MESSAGE_TYPE.GET_SNAPSHOT,
    },
    window.location.origin,
  );
}

function requestStartSync() {
  window.postMessage(
    {
      source: SOURCE.WEB,
      type: MESSAGE_TYPE.START_SYNC,
    },
    window.location.origin,
  );
}

function resolveBookLink(book: KindleBookSnapshotItem): string | null {
  if (book.detailUrl && book.detailUrl.includes('read.amazon.co.jp/manga/')) {
    return book.detailUrl;
  }
  if (book.asin) return `https://read.amazon.co.jp/manga/${book.asin}`;
  if (book.detailUrl) return book.detailUrl;
  return null;
}

export function DashboardClient() {
  const [snapshot, setSnapshot] = useState<KindleLibrarySnapshot | null>(null);
  const [statusText, setStatusText] = useState('拡張機能の応答待ち');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    const onMessage = (event: MessageEvent<ExtensionMessage>) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== SOURCE.EXTENSION) return;

      if (event.data.type === MESSAGE_TYPE.SNAPSHOT) {
        setSnapshot(event.data.payload);
        const count = event.data.payload?.total ?? 0;
        setStatusText(`取得した書籍: ${count}冊`);
        return;
      }

      if (event.data.type === MESSAGE_TYPE.START_SYNC_RESULT) {
        if (event.data.payload.ok) {
          setStatusText(`Kindle 同期タブを起動しました (tab: ${event.data.payload.tabId ?? '-'})`);
          setSyncStatus('syncing');
          requestSnapshot();
        } else {
          setStatusText(`同期開始に失敗: ${event.data.payload.error ?? 'unknown error'}`);
          setSyncStatus('idle');
        }
        return;
      }

      if (event.data.type === MESSAGE_TYPE.SYNC_FINISHED) {
        if (event.data.payload.success) {
          setStatusText(`同期完了: ${event.data.payload.total ?? 0}冊`);
          setSyncStatus('completed');
        } else {
          setStatusText(`同期失敗: ${event.data.payload.error ?? 'unknown error'}`);
          setSyncStatus('idle');
        }
        requestSnapshot();
      }
    };

    window.addEventListener('message', onMessage);
    requestSnapshot();

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    if (syncStatus !== 'syncing') return;
    const timer = window.setInterval(() => {
      requestSnapshot();
    }, 5000);
    return () => {
      window.clearInterval(timer);
    };
  }, [syncStatus]);

  const books = useMemo(() => snapshot?.books ?? [], [snapshot]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:px-10">
      <h1 className="bg-linear-to-r from-zinc-900 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400">
        HONS
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Web 画面から Kindle ライブラリ同期を開始し、拡張機能が保存したスナップショットを表示します。
      </p>

      <SyncControls
        syncStatus={syncStatus}
        statusText={statusText}
        onStartSync={() => {
          setSyncStatus('syncing');
          requestStartSync();
        }}
        onRefreshSnapshot={requestSnapshot}
      />

      <BooksSection
        snapshot={snapshot}
        books={books}
        onOpenBook={(book) => {
          const url = resolveBookLink(book);
          if (!url) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
      />
    </main>
  );
}
