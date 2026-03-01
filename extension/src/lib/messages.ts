import type { BookMetadata } from '@bookhub/shared/types/book';

export const ENRICH_BOOK_MESSAGE = 'bookhub:enrich-book';
export const OPEN_KINDLE_SYNC_TAB_MESSAGE = 'bookhub:open-kindle-sync-tab';
export const KINDLE_SYNC_FINISHED_MESSAGE = 'bookhub:kindle-sync-finished';

export interface EnrichBookRequest {
  type: typeof ENRICH_BOOK_MESSAGE;
  payload: {
    title: string;
    asin?: string;
    imageUrl?: string;
  };
}

export interface EnrichBookResponse {
  book: BookMetadata;
}

export interface OpenKindleSyncTabRequest {
  type: typeof OPEN_KINDLE_SYNC_TAB_MESSAGE;
  payload?: {
    trigger?: 'web' | 'manual';
  };
}

export interface OpenKindleSyncTabResponse {
  ok: boolean;
  tabId?: number;
  error?: string;
}

export interface KindleSyncFinishedRequest {
  type: typeof KINDLE_SYNC_FINISHED_MESSAGE;
  payload: {
    success: boolean;
    total?: number;
    error?: string;
  };
}

export interface KindleSyncFinishedResponse {
  ok: boolean;
}

export type RuntimeRequest = EnrichBookRequest | OpenKindleSyncTabRequest | KindleSyncFinishedRequest;
