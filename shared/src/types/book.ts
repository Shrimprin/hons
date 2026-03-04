export type OwnershipStatus = 'unlinked' | 'checking' | 'owned' | 'not_owned';

export interface BookMetadata {
  title: string;
  normalizedTitle?: string;
  volume?: number;
  asin?: string;
  imageUrl?: string;
  source: 'dom' | 'google_books';
  ownershipStatus: OwnershipStatus;
}
