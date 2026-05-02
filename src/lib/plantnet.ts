import { PLANTNET_CONFIDENCE_THRESHOLD, MAX_CANDIDATES } from "../constants";
import type { Candidate } from "../types";

interface PlantNetResult {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    commonNames: string[];
  };
}

interface PlantNetResponse {
  results: PlantNetResult[];
}

export interface IdentifyResult {
  status: "found" | "candidates" | "not_found";
  topResult: {
    name: string;
    nameOriginal: string;
    confidence: number;
  } | null;
  candidates: Candidate[];
}

function extractJapaneseName(result: PlantNetResult): string | null {
  const japaneseNames = result.species.commonNames.filter((n) =>
    /[\u3000-\u9FFF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF]/.test(n)
  );
  return japaneseNames[0] || null;
}

async function lookupJapaneseName(scientificName: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(scientificName);
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encoded}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.title && /[\u3000-\u9FFF\u3040-\u309F\u30A0-\u30FF]/.test(data.title)) {
      return data.title;
    }
    return null;
  } catch {
    return null;
  }
}

async function getJapaneseName(result: PlantNetResult): Promise<string> {
  // 1. PlantNet APIの commonNames から日本語名を探す
  const fromApi = extractJapaneseName(result);
  if (fromApi) return fromApi;

  // 2. Wikipedia で学名から日本語名を探す
  const fromWiki = await lookupJapaneseName(result.species.scientificNameWithoutAuthor);
  if (fromWiki) return fromWiki;

  // 3. どちらもなければ学名をそのまま返す
  return result.species.scientificNameWithoutAuthor;
}

export async function identifyFlower(
  imageFile: File | Blob
): Promise<PlantNetResponse> {
  const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;

  const formData = new FormData();
  formData.append("images", imageFile, "photo.jpg");
  formData.append("organs", "flower");
  const url = `/api/plantnet/v2/identify/all?include-related-images=false&no-reject=false&nb-results=5&lang=ja&type=kt&api-key=${apiKey}`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (res.status === 404) return { results: [] };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PlantNet API error: ${res.status} - ${text}`);
  }
  return res.json();
}

export async function parseIdentifyResult(
  response: PlantNetResponse
): Promise<IdentifyResult> {
  if (!response.results || response.results.length === 0) {
    return { status: "not_found", topResult: null, candidates: [] };
  }

  const top = response.results[0];
  if (top.score >= PLANTNET_CONFIDENCE_THRESHOLD) {
    const name = await getJapaneseName(top);
    return {
      status: "found",
      topResult: {
        name,
        nameOriginal: top.species.scientificNameWithoutAuthor,
        confidence: top.score,
      },
      candidates: [],
    };
  }

  const candidates = await Promise.all(
    response.results.slice(0, MAX_CANDIDATES).map(async (r) => ({
      name: await getJapaneseName(r),
      nameOriginal: r.species.scientificNameWithoutAuthor,
      confidence: r.score,
    }))
  );

  return {
    status: "candidates",
    topResult: null,
    candidates,
  };
}
