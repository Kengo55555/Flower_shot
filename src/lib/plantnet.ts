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

function extractJapaneseName(result: PlantNetResult): string {
  const japaneseNames = result.species.commonNames.filter((n) =>
    /[\u3000-\u9FFF\uF900-\uFAFF]/.test(n)
  );
  return japaneseNames[0] || result.species.scientificNameWithoutAuthor;
}

export async function identifyFlower(
  imageFile: File | Blob
): Promise<PlantNetResponse> {
  const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;

  // 全環境で同一ドメインの /api/plantnet を使用
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

export function parseIdentifyResult(
  response: PlantNetResponse
): IdentifyResult {
  if (!response.results || response.results.length === 0) {
    return { status: "not_found", topResult: null, candidates: [] };
  }

  const top = response.results[0];
  if (top.score >= PLANTNET_CONFIDENCE_THRESHOLD) {
    return {
      status: "found",
      topResult: {
        name: extractJapaneseName(top),
        nameOriginal: top.species.scientificNameWithoutAuthor,
        confidence: top.score,
      },
      candidates: [],
    };
  }

  const candidates = response.results
    .slice(0, MAX_CANDIDATES)
    .map((r) => ({
      name: extractJapaneseName(r),
      nameOriginal: r.species.scientificNameWithoutAuthor,
      confidence: r.score,
    }));

  return {
    status: "candidates",
    topResult: null,
    candidates,
  };
}
