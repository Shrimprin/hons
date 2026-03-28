'use client';

import { useEffect, useMemo, useState } from 'react';

import { BooksSection } from '@/components/dashboard/BooksSection';
import { Header } from '@/components/dashboard/Header';
import { StatusBar } from '@/components/dashboard/SyncSection';
import type { ExtensionMessage, KindleBookSnapshotItem, KindleLibrarySnapshot } from '@/types/dashboard';
import type { SyncStatus } from '@/types/sync';
import { MESSAGE_TYPE, SOURCE } from '@hons/shared';

function requestSnapshot() {
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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <Header
        syncStatus={syncStatus}
        onStartSync={() => {
          setSyncStatus('syncing');
          requestStartSync();
        }}
        onRefreshSnapshot={requestSnapshot}
      />

      <StatusBar syncStatus={syncStatus} statusText={statusText} />

      <BooksSection
        snapshot={snapshot}
        books={books}
        isSyncing={syncStatus === 'syncing'}
        onOpenBook={(book) => {
          const url = resolveBookLink(book);
          if (!url) return;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
      />
    </main>
  );
}
