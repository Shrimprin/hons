import { extractKindleLibraryBooks, type KindleLibraryBook } from './extractKindleLibrary';

interface FullSyncOptions {
  maxIterations?: number;
  idleTolerance?: number;
  intervalMs?: number;
  onProgress?: (payload: { iteration: number; count: number; idleRounds: number }) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function pickScrollTarget(): HTMLElement {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('main, [role="main"], [class*="scroll"]'));
  const scrollable = candidates.filter(
    (element) => element.scrollHeight > element.clientHeight + 100 && getComputedStyle(element).overflowY !== 'visible',
  );
  const best = scrollable.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
  return best ?? (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

function mergeBooks(map: Map<string, KindleLibraryBook>, books: KindleLibraryBook[]) {
  for (const book of books) {
    const key = book.asin ?? `${book.title}|${book.imageUrl ?? ''}`;
    if (!map.has(key)) {
      map.set(key, book);
    }
  }
}

function clickLoadMoreIfExists() {
  const buttonCandidates = Array.from(
    document.querySelectorAll<HTMLElement>('button, [role="button"], a[role="button"]'),
  );

  const target = buttonCandidates.find((element) => {
    const label = `${element.textContent ?? ''} ${element.getAttribute('aria-label') ?? ''}`.toLowerCase();
    return (
      label.includes('もっと') ||
      label.includes('さらに') ||
      label.includes('表示') ||
      label.includes('load more') ||
      label.includes('show more')
    );
  });

  target?.click();
}

export async function runKindleFullSync(options: FullSyncOptions = {}): Promise<KindleLibraryBook[]> {
  const maxIterations = options.maxIterations ?? 180;
  const idleTolerance = options.idleTolerance ?? 12;
  const intervalMs = options.intervalMs ?? 1500;

  const allBooks = new Map<string, KindleLibraryBook>();
  let idleRounds = 0;
  let previousCount = 0;

  const scrollTarget = pickScrollTarget();

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const previousScrollHeight = scrollTarget.scrollHeight;

    // Force to bottom every loop for lazy loading / virtualized lists.
    scrollTarget.scrollTo({ top: scrollTarget.scrollHeight, behavior: 'auto' });
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
    clickLoadMoreIfExists();

    await sleep(intervalMs);

    mergeBooks(allBooks, extractKindleLibraryBooks());
    const currentCount = allBooks.size;
    const currentScrollHeight = scrollTarget.scrollHeight;
    const scrollAreaGrew = currentScrollHeight > previousScrollHeight + 8;
    const hasProgress = currentCount > previousCount || scrollAreaGrew;

    if (!hasProgress) {
      idleRounds += 1;
    } else {
      idleRounds = 0;
    }
    previousCount = currentCount;

    options.onProgress?.({ iteration, count: currentCount, idleRounds });

    if (idleRounds >= idleTolerance) {
      break;
    }
  }

  scrollTarget.scrollTo({ top: 0, behavior: 'auto' });

  return Array.from(allBooks.values());
}
