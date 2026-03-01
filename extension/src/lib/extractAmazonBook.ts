export interface DomBookInfo {
  title: string;
  asin: string | null;
  imageUrl: string | null;
}

function getAsinFromUrl(): string | null {
  const match = location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function getAsinFromInput(): string | null {
  const candidates = [
    document.querySelector<HTMLInputElement>('input[name="ASIN"]')?.value,
    document.querySelector<HTMLInputElement>("#ASIN")?.value,
  ];
  return candidates.find(Boolean)?.toUpperCase() ?? null;
}

function getProductTitle(): string | null {
  const titleElement =
    document.querySelector<HTMLElement>("#productTitle") ??
    document.querySelector<HTMLElement>("#ebooksProductTitle");
  return titleElement?.textContent?.trim() ?? null;
}

function getCoverImageUrl(): string | null {
  const image =
    document.querySelector<HTMLImageElement>("#imgBlkFront") ??
    document.querySelector<HTMLImageElement>("#landingImage") ??
    document.querySelector<HTMLImageElement>("#ebooksImgBlkFront");
  return image?.src ?? null;
}

export function extractBookFromAmazonDom(): DomBookInfo | null {
  const title = getProductTitle();
  if (!title) return null;

  return {
    title,
    asin: getAsinFromUrl() ?? getAsinFromInput(),
    imageUrl: getCoverImageUrl(),
  };
}
