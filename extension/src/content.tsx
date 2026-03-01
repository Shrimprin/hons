import type { BookMetadata } from '@bookhub/shared/types/book';
import { extractVolume } from '@bookhub/shared/utils/volume';
import { createRoot } from 'react-dom/client';
import { extractBookFromAmazonDom, isAmazonProductPage } from './lib/extractAmazonBook';
import { extractKindleLibraryBooks, getKindleLibraryDebugInfo, isKindleLibraryPage } from './lib/extractKindleLibrary';
import { runKindleFullSync } from './lib/kindleFullSync';
import { ENRICH_BOOK_MESSAGE, KINDLE_SYNC_FINISHED_MESSAGE, type EnrichBookResponse } from './lib/messages';
import { initializeWebDashboardBridge } from './lib/webDashboardBridge';
import { KindleLibraryBar } from './ui/KindleLibraryBar';
import { OwnershipBar } from './ui/OwnershipBar';

console.log('[HONS] content script injected', {
  url: location.href,
  host: location.hostname,
  path: location.pathname,
});

const SNAPSHOT_KEY = 'bookhubKindleLibrarySnapshot';

function isWebDashboardPage(): boolean {
  if (location.hostname === 'localhost' && location.port === '3000') return true;
  if (location.hostname === '127.0.0.1' && location.port === '3000') return true;
  return false;
}

function buildDomFallbackBook(): BookMetadata | null {
  const domBook = extractBookFromAmazonDom();
  if (!domBook) return null;

  return {
    title: domBook.title,
    normalizedTitle: domBook.title.normalize('NFKC'),
    volume: extractVolume(domBook.title) ?? undefined,
    asin: domBook.asin ?? undefined,
    imageUrl: domBook.imageUrl ?? undefined,
    source: 'dom',
    ownershipStatus: 'checking',
  };
}

async function resolveBookMetadata(): Promise<BookMetadata | null> {
  const fallback = buildDomFallbackBook();
  if (!fallback) return null;

  try {
    const response = (await chrome.runtime.sendMessage({
      type: ENRICH_BOOK_MESSAGE,
      payload: {
        title: fallback.title,
        asin: fallback.asin,
        imageUrl: fallback.imageUrl,
      },
    })) as EnrichBookResponse | undefined;

    return response?.book ?? fallback;
  } catch {
    return fallback;
  }
}

function mountOverlay(initialBook: BookMetadata | null) {
  if (document.getElementById('bookhub-ownership-overlay')) {
    return;
  }

  const mountNode = document.createElement('div');
  mountNode.id = 'bookhub-ownership-overlay';
  document.documentElement.appendChild(mountNode);
  document.documentElement.style.paddingTop = '44px';

  const root = createRoot(mountNode);
  root.render(<OwnershipBar book={initialBook} loading />);

  void resolveBookMetadata().then((book) => {
    root.render(<OwnershipBar book={book} loading={false} />);
    if (!book) {
      console.info('[HONS] Book info not found on this page');
      return;
    }
    console.info('[HONS] Resolved metadata', book);
  });
}

function mountKindleLibraryOverlay() {
  if (document.getElementById('bookhub-kindle-library-overlay')) {
    return;
  }

  const mountNode = document.createElement('div');
  mountNode.id = 'bookhub-kindle-library-overlay';
  document.documentElement.appendChild(mountNode);
  document.documentElement.style.paddingTop = '44px';

  const root = createRoot(mountNode);
  let books = extractKindleLibraryBooks();
  let retryTimerIds: number[] = [];
  let isSyncing = false;
  let syncMessage = '待機中';
  const autoSync = new URLSearchParams(location.search).get('bookhub_sync') === '1';

  const persistSnapshot = () => {
    void chrome.storage.local.set({
      [SNAPSHOT_KEY]: {
        takenAt: new Date().toISOString(),
        url: location.href,
        total: books.length,
        books,
      },
    });
  };

  const startFullSync = () => {
    if (isSyncing) return;

    isSyncing = true;
    syncMessage = '全件同期を開始しました';
    render();

    void runKindleFullSync({
      onProgress: (progress) => {
        syncMessage = `同期中 ${progress.count}件 / loop ${progress.iteration}`;
        render();
      },
    })
      .then((allBooks) => {
        books = allBooks;
        persistSnapshot();
        syncMessage = `同期完了 ${allBooks.length}件`;
        console.info('[HONS] Kindle full sync completed', {
          total: allBooks.length,
          sample: allBooks.slice(0, 5),
        });
        void chrome.runtime.sendMessage({
          type: KINDLE_SYNC_FINISHED_MESSAGE,
          payload: { success: true, total: allBooks.length, autoCloseWindow: autoSync },
        });
      })
      .catch((error: unknown) => {
        syncMessage = '同期失敗';
        console.error('[HONS] Kindle full sync failed', error);
        void chrome.runtime.sendMessage({
          type: KINDLE_SYNC_FINISHED_MESSAGE,
          payload: {
            success: false,
            error: error instanceof Error ? error.message : 'sync failed',
            autoCloseWindow: autoSync,
          },
        });
      })
      .finally(() => {
        isSyncing = false;
        render();
      });
  };

  const render = () => {
    root.render(
      <KindleLibraryBar
        count={books.length}
        books={books}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
        onRunFullSync={startFullSync}
        onRefresh={() => {
          books = extractKindleLibraryBooks();
          persistSnapshot();
          console.info('[HONS] Kindle library books (manual refresh)', books.slice(0, 5));
          render();
        }}
        onCopyJson={() => {
          const payload = JSON.stringify(books, null, 2);
          void navigator.clipboard.writeText(payload);
          console.info('[HONS] Copied kindle library JSON');
        }}
      />,
    );
  };

  const refreshBooks = (reason: string) => {
    const next = extractKindleLibraryBooks();
    const changed = next.length !== books.length;
    books = next;
    persistSnapshot();
    console.info('[HONS] Kindle library books', {
      reason,
      total: books.length,
      sample: books.slice(0, 5),
      debug: getKindleLibraryDebugInfo(),
    });
    if (changed) {
      render();
    }
  };

  // Kindle library is often rendered lazily, so retry after initial load.
  const retryDelays = [600, 1500, 3000, 5000];
  retryTimerIds = retryDelays.map((delay) =>
    window.setTimeout(() => {
      refreshBooks(`delayed-retry-${delay}ms`);
    }, delay),
  );

  const observer = new MutationObserver(() => {
    refreshBooks('mutation-observer');
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener(
    'beforeunload',
    () => {
      observer.disconnect();
      retryTimerIds.forEach((id) => window.clearTimeout(id));
      retryTimerIds = [];
    },
    { once: true },
  );

  refreshBooks('initial');
  render();

  if (autoSync) {
    window.setTimeout(() => {
      if (isSyncing) return;
      console.info('[HONS] auto sync triggered by query parameter');
      startFullSync();
    }, 1200);
  }
}

if (isWebDashboardPage()) {
  console.log('[HONS] web-dashboard bridge mode');
  try {
    initializeWebDashboardBridge();
  } catch (error) {
    console.error('[HONS] failed to initialize web dashboard bridge', error);
  }
} else if (isKindleLibraryPage()) {
  console.log('[HONS] kindle-library mode');
  mountKindleLibraryOverlay();
} else if (isAmazonProductPage()) {
  console.log('[HONS] product-page mode');
  mountOverlay(buildDomFallbackBook());
} else {
  console.log('[HONS] page not targeted');
}
