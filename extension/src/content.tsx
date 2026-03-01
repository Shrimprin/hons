import type { BookMetadata } from '@bookhub/shared/types/book';
import { extractVolume } from '@bookhub/shared/utils/volume';
import { createRoot } from 'react-dom/client';
import { extractBookFromAmazonDom } from './lib/extractAmazonBook';
import { extractKindleLibraryBooks, getKindleLibraryDebugInfo, isKindleLibraryPage } from './lib/extractKindleLibrary';
import { ENRICH_BOOK_MESSAGE, type EnrichBookResponse } from './lib/messages';
import { KindleLibraryBar } from './ui/KindleLibraryBar';
import { OwnershipBar } from './ui/OwnershipBar';

console.log('[BookHub] content script injected', {
  url: location.href,
  host: location.hostname,
  path: location.pathname,
});

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
      console.info('[BookHub] Book info not found on this page');
      return;
    }
    console.info('[BookHub] Resolved metadata', book);
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

  const persistSnapshot = () => {
    void chrome.storage.local.set({
      bookhubKindleLibrarySnapshot: {
        takenAt: new Date().toISOString(),
        url: location.href,
        total: books.length,
        books,
      },
    });
  };

  const render = () => {
    root.render(
      <KindleLibraryBar
        count={books.length}
        books={books}
        onRefresh={() => {
          books = extractKindleLibraryBooks();
          persistSnapshot();
          console.info('[BookHub] Kindle library books (manual refresh)', books.slice(0, 5));
          render();
        }}
        onCopyJson={() => {
          const payload = JSON.stringify(books, null, 2);
          void navigator.clipboard.writeText(payload);
          console.info('[BookHub] Copied kindle library JSON');
        }}
      />,
    );
  };

  const refreshBooks = (reason: string) => {
    const next = extractKindleLibraryBooks();
    const changed = next.length !== books.length;
    books = next;
    persistSnapshot();
    console.info('[BookHub] Kindle library books', {
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
}

if (isKindleLibraryPage()) {
  console.log('[BookHub] kindle-library mode');
  mountKindleLibraryOverlay();
} else {
  console.log('[BookHub] product-page mode');
  mountOverlay(buildDomFallbackBook());
}
