import type { WikipediaResult } from "../types";

async function fetchSummary(
  title: string
): Promise<WikipediaResult | null> {
  const encoded = encodeURIComponent(title);
  const res = await fetch(
    `https://ja.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data.title,
    extract: data.extract,
    pageUrl: data.content_urls?.desktop?.page || "",
    thumbnailUrl: data.thumbnail?.source,
  };
}

export async function getFlowerInfo(
  japaneseName: string,
  scientificName?: string
): Promise<WikipediaResult | null> {
  const result = await fetchSummary(japaneseName);
  if (result) return result;

  if (scientificName) {
    return fetchSummary(scientificName);
  }
  return null;
}
