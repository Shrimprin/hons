import type { BookMetadata } from "@bookhub/shared/types/book";

export const ENRICH_BOOK_MESSAGE = "bookhub:enrich-book";

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
