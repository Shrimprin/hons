import { enrichWithGoogleBooks } from './lib/googleBooks';
import {
  ENRICH_BOOK_MESSAGE,
  KINDLE_SYNC_FINISHED_MESSAGE,
  OPEN_KINDLE_SYNC_TAB_MESSAGE,
  type EnrichBookResponse,
  type KindleSyncFinishedResponse,
  type OpenKindleSyncTabResponse,
  type RuntimeRequest,
} from './lib/messages';

const autoSyncTabIds = new Set<number>();

chrome.runtime.onInstalled.addListener(() => {
  console.info('[HONS] background worker ready');
});

chrome.runtime.onMessage.addListener((message: RuntimeRequest, _sender, sendResponse) => {
  if (message?.type === ENRICH_BOOK_MESSAGE) {
    void (async () => {
      const book = await enrichWithGoogleBooks({
        title: message.payload.title,
        asin: message.payload.asin,
        imageUrl: message.payload.imageUrl,
        ownershipStatus: 'checking',
      });

      const response: EnrichBookResponse = { book };
      sendResponse(response);
    })();

    return true;
  }

  if (message?.type === OPEN_KINDLE_SYNC_TAB_MESSAGE) {
    const url = 'https://read.amazon.co.jp/kindle-library?tabView=all&sortType=recency&bookhub_sync=1';

    void (async () => {
      try {
        const syncWindow = await chrome.windows.create({
          url,
          focused: false,
          state: 'minimized',
        });

        const tabId = syncWindow?.tabs?.[0]?.id;
        if (typeof tabId === 'number') {
          autoSyncTabIds.add(tabId);
          try {
            await chrome.tabs.update(tabId, { autoDiscardable: false });
          } catch {
            // Some Chrome variants may reject this update; ignore and continue.
          }
        }

        const response: OpenKindleSyncTabResponse = { ok: true, tabId };
        sendResponse(response);
      } catch (error) {
        const response: OpenKindleSyncTabResponse = {
          ok: false,
          error: error instanceof Error ? error.message : 'unknown error',
        };
        sendResponse(response);
      }
    })();

    return true;
  }

  if (message?.type === KINDLE_SYNC_FINISHED_MESSAGE) {
    void (async () => {
      const tabId = _sender.tab?.id;
      if (typeof tabId === 'number' && autoSyncTabIds.has(tabId)) {
        autoSyncTabIds.delete(tabId);
        try {
          await chrome.tabs.remove(tabId);
          console.info('[HONS] closed auto sync tab', {
            tabId,
            success: message.payload.success,
            total: message.payload.total,
          });
        } catch (error) {
          console.warn('[HONS] failed to close auto sync tab', { tabId, error });
        }
      }

      const response: KindleSyncFinishedResponse = { ok: true };
      sendResponse(response);
    })();
    return true;
  }
});
