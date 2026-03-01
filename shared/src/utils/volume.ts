const volumePatterns = [/(?:第\s*)?(\d{1,3})\s*巻/u, /(?:vol\.?|volume)\s*(\d{1,3})/iu, /(?:#|No\.)\s*(\d{1,3})/iu];

export function extractVolume(title: string): number | null {
  const normalized = title.normalize('NFKC');

  for (const pattern of volumePatterns) {
    const matched = normalized.match(pattern);
    if (!matched?.[1]) continue;
    const volume = Number.parseInt(matched[1], 10);
    if (Number.isNaN(volume)) continue;
    return volume;
  }

  return null;
}
