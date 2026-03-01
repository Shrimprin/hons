import type { BookMetadata } from "@bookhub/shared/types/book";
import { extractVolume } from "@bookhub/shared/utils/volume";

interface GoogleBooksItem {
  volumeInfo?: {
    title?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  items?: GoogleBooksItem[];
}

function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, " ").replace(/【.*?】/g, "").trim();
}

export async function enrichWithGoogleBooks(
  raw: Pick<BookMetadata, "title" | "asin" | "imageUrl" | "ownershipStatus">,
): Promise<BookMetadata> {
  const fallback: BookMetadata = {
    title: raw.title,
    normalizedTitle: normalizeTitle(raw.title),
    volume: extractVolume(raw.title) ?? undefined,
    asin: raw.asin,
    imageUrl: raw.imageUrl,
    source: "dom",
    ownershipStatus: raw.ownershipStatus,
  };

  try {
    const query = encodeURIComponent(`intitle:${fallback.normalizedTitle}`);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=ja&maxResults=1`,
    );
    if (!response.ok) return fallback;

    const body = (await response.json()) as GoogleBooksResponse;
    const item = body.items?.[0];
    if (!item) return fallback;

    const apiTitle = item.volumeInfo?.title?.trim();
    const apiImage = item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail;

    return {
      ...fallback,
      title: apiTitle || fallback.title,
      normalizedTitle: normalizeTitle(apiTitle || fallback.title),
      volume: extractVolume(apiTitle || fallback.title) ?? fallback.volume,
      imageUrl: apiImage || fallback.imageUrl,
      source: "google_books",
    };
  } catch {
    return fallback;
  }
}
