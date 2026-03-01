export interface KindleLibraryBook {
  title: string;
  asin: string | null;
  imageUrl: string | null;
  detailUrl: string | null;
}

const CANDIDATE_SELECTORS = [
  "[data-asin]",
  "[data-testid*='book']",
  "[data-testid*='item']",
  "[data-testid*='library']",
  "a[href*='/dp/']",
  "a[href*='/gp/product/']",
  "a[href*='asin=']",
  "a[href*='kindle-library']",
  "div[role='listitem']",
  "[role='gridcell']",
  "li",
];

const TITLE_SELECTORS = [
  "[data-testid*='title']",
  "[aria-label]",
  "[title]",
  "h1",
  "h2",
  "h3",
  "p",
];

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized : null;
}

function findAsin(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const matched = raw.match(/\b([A-Z0-9]{10})\b/i);
  return matched?.[1]?.toUpperCase() ?? null;
}

function pickTitleFromNode(node: Element): string | null {
  for (const selector of TITLE_SELECTORS) {
    const element = node.querySelector<HTMLElement>(selector);
    const text = normalizeText(element?.textContent);
    if (text && text.length > 1) return text;
  }

  const imageAlt = normalizeText(node.querySelector<HTMLImageElement>("img")?.alt);
  if (imageAlt) return imageAlt;

  return null;
}

function findClosestBookNode(element: Element): Element {
  return (
    element.closest("[data-asin]") ??
    element.closest("[data-testid*='book']") ??
    element.closest("[data-testid*='item']") ??
    element.closest("[role='listitem']") ??
    element.closest("[role='gridcell']") ??
    element.closest("div[role='listitem']") ??
    element.closest("li") ??
    element
  );
}

function collectCandidateNodes(): Element[] {
  const nodes = new Set<Element>();
  for (const selector of CANDIDATE_SELECTORS) {
    const matched = document.querySelectorAll(selector);
    matched.forEach((node) => {
      nodes.add(findClosestBookNode(node));
    });
  }
  return Array.from(nodes);
}

export function extractKindleLibraryBooks(): KindleLibraryBook[] {
  const booksByKey = new Map<string, KindleLibraryBook>();

  for (const node of collectCandidateNodes()) {
    const title = pickTitleFromNode(node);
    const anchor =
      node.querySelector<HTMLAnchorElement>("a[href*='asin=']") ??
      node.querySelector<HTMLAnchorElement>("a[href*='/dp/']") ??
      node.querySelector<HTMLAnchorElement>("a[href*='/gp/product/']") ??
      node.querySelector<HTMLAnchorElement>("a[href]");
    const image = node.querySelector<HTMLImageElement>("img");
    const directText = normalizeText(node.textContent);

    const detailUrl = anchor?.href ?? null;
    const asin =
      findAsin(node.getAttribute("data-asin")) ??
      findAsin(node.getAttribute("id")) ??
      findAsin(node.getAttribute("data-testid")) ??
      findAsin(node.getAttribute("aria-label")) ??
      findAsin(anchor?.href) ??
      findAsin(image?.src) ??
      null;
    const imageUrl = image?.src ?? image?.getAttribute("srcset")?.split(" ")[0] ?? null;
    const resolvedTitle = title ?? normalizeText(anchor?.getAttribute("aria-label")) ?? directText;

    if (!resolvedTitle && !asin) continue;
    if ((resolvedTitle ?? "").length > 180) continue;

    const record: KindleLibraryBook = {
      title: resolvedTitle ?? "タイトル不明",
      asin,
      imageUrl,
      detailUrl,
    };

    const key = asin ?? `${record.title}|${record.imageUrl ?? ""}`;
    if (!booksByKey.has(key)) {
      booksByKey.set(key, record);
    }
  }

  return Array.from(booksByKey.values());
}

export function getKindleLibraryDebugInfo() {
  const dataAsinCount = document.querySelectorAll("[data-asin]").length;
  const dpLinkCount = document.querySelectorAll("a[href*='/dp/'], a[href*='asin=']").length;
  const imageCount = document.querySelectorAll("img").length;
  const listItemCount = document.querySelectorAll("[role='listitem'], [role='gridcell']").length;

  return {
    dataAsinCount,
    dpLinkCount,
    imageCount,
    listItemCount,
    bodyTextLength: document.body?.innerText?.length ?? 0,
  };
}

export function isKindleLibraryPage(): boolean {
  return location.hostname === "read.amazon.co.jp" && location.pathname.startsWith("/kindle-library");
}
