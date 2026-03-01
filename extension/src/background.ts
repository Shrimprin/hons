import { enrichWithGoogleBooks } from './lib/googleBooks';
import { ENRICH_BOOK_MESSAGE, type EnrichBookRequest, type EnrichBookResponse } from './lib/messages';

chrome.runtime.onInstalled.addListener(() => {
  console.info('[BookHub] background worker ready');
});

chrome.runtime.onMessage.addListener((message: EnrichBookRequest, _sender, sendResponse) => {
  if (message?.type !== ENRICH_BOOK_MESSAGE) {
    return;
  }

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
});
