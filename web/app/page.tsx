'use client';

import { useEffect, useMemo, useState } from 'react';

interface KindleBookSnapshotItem {
  title: string;
  asin: string | null;
  imageUrl: string | null;
}

interface KindleLibrarySnapshot {
  takenAt: string;
  url: string;
  total: number;
  books: KindleBookSnapshotItem[];
}

interface ExtensionSnapshotMessage {
  source: 'bookhub-extension';
  type: 'BOOKHUB_SNAPSHOT';
  payload: KindleLibrarySnapshot | null;
}

interface StartSyncResultMessage {
  source: 'bookhub-extension';
  type: 'BOOKHUB_START_SYNC_RESULT';
  payload: {
    ok: boolean;
    tabId?: number;
    error?: string;
  };
}

type ExtensionMessage = ExtensionSnapshotMessage | StartSyncResultMessage;

function requestSnapshot() {
  window.postMessage(
    {
      source: 'bookhub-web',
      type: 'BOOKHUB_GET_SNAPSHOT',
    },
    window.location.origin,
  );
}

function requestStartSync() {
  window.postMessage(
    {
      source: 'bookhub-web',
      type: 'BOOKHUB_START_SYNC',
    },
    window.location.origin,
  );
}

export default function Home() {
  const [snapshot, setSnapshot] = useState<KindleLibrarySnapshot | null>(null);
  const [statusText, setStatusText] = useState('拡張機能の応答待ち');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent<ExtensionMessage>) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== 'bookhub-extension') return;

      if (event.data.type === 'BOOKHUB_SNAPSHOT') {
        setSnapshot(event.data.payload);
        const count = event.data.payload?.total ?? 0;
        setStatusText(`同期スナップショットを受信: ${count}件`);
        return;
      }

      if (event.data.type === 'BOOKHUB_START_SYNC_RESULT') {
        if (event.data.payload.ok) {
          setStatusText(`Kindle 同期タブを起動しました (tab: ${event.data.payload.tabId ?? '-'})`);
        } else {
          setStatusText(`同期開始に失敗: ${event.data.payload.error ?? 'unknown error'}`);
        }
      }
    };

    window.addEventListener('message', onMessage);
    requestSnapshot();

    const timer = window.setInterval(() => {
      requestSnapshot();
    }, 5000);

    return () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(timer);
    };
  }, []);

  const previewBooks = useMemo(() => snapshot?.books ?? [], [snapshot]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:px-10">
      <h1 className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400">
        HONS
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Web 画面から Kindle ライブラリ同期を開始し、拡張機能が保存したスナップショットを表示します。
      </p>

      <section className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
        <button
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => {
            setLoading(true);
            requestStartSync();
            window.setTimeout(() => setLoading(false), 1000);
          }}
          disabled={loading}
        >
          {loading ? '開始中...' : 'Kindle 同期を開始'}
        </button>
        <button
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          onClick={() => requestSnapshot()}
        >
          スナップショット再取得
        </button>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{statusText}</span>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-semibold">同期結果（全件表示）</h2>
        <p className="mb-1 text-sm">件数: {snapshot?.total ?? 0}</p>
        <p className="mb-4 text-sm">最終更新: {snapshot?.takenAt ?? '未同期'}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewBooks.map((book, index) => (
            <article
              key={`${book.asin ?? book.title}-${index}`}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-950"
            >
              <div className="aspect-[3/4] w-full bg-zinc-100 dark:bg-zinc-900">
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
            </article>
          ))}
        </div>
        {previewBooks.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            まだ表示できる書籍がありません。同期を実行してスナップショットを取得してください。
          </p>
        )}
      </section>
    </main>
  );
}
