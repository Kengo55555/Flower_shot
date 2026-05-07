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

const JP_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

// 花の名前として不適切なタイトルを除外
const BAD_TITLES = /^(.*の一覧|一覧|栽培植物|野菜|果物|観葉植物|園芸|花卉|植物学|被子植物|双子葉|単子葉)$/;
const CATEGORY_SUFFIX = /[科目門綱界]$/;

function isGoodFlowerName(title: string): boolean {
  if (!JP_REGEX.test(title)) return false;
  if (BAD_TITLES.test(title)) return false;
  if (CATEGORY_SUFFIX.test(title)) return false;
  if (title.includes("一覧")) return false;
  return true;
}

function extractJapaneseName(result: PlantNetResult): string | null {
  const japaneseNames = result.species.commonNames.filter((n) => JP_REGEX.test(n));
  return japaneseNames[0] || null;
}

async function wikiApi(params: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/w/api.php?${params}&format=json&origin=*`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function lookupJapaneseName(scientificName: string): Promise<string | null> {
  const encoded = encodeURIComponent(scientificName);

  // ステップ1: 学名で検索 → 具体的な花の名前を探す
  const searchData = await wikiApi(
    `action=query&list=search&srsearch=${encoded}&srlimit=10`
  );
  if (searchData) {
    const results = (searchData as { query?: { search?: { title: string }[] } }).query?.search;
    if (results) {
      // まず「○○属」以外の良い名前を探す
      for (const r of results) {
        if (isGoodFlowerName(r.title) && !/属$/.test(r.title)) {
          return r.title;
        }
      }
      // なければ「○○属」から「属」を外して使う（例: ヒマワリ属 → ヒマワリ）
      for (const r of results) {
        if (JP_REGEX.test(r.title) && /属$/.test(r.title)) {
          return r.title.replace(/属$/, "");
        }
      }
    }
  }

  // ステップ2: 属名（最初の単語）で検索
  const genus = scientificName.split(" ")[0];
  if (genus !== scientificName) {
    const genusData = await wikiApi(
      `action=query&list=search&srsearch=${encodeURIComponent(genus)}&srlimit=10`
    );
    if (genusData) {
      const results = (genusData as { query?: { search?: { title: string }[] } }).query?.search;
      if (results) {
        for (const r of results) {
          if (isGoodFlowerName(r.title) && !/属$/.test(r.title)) {
            return r.title;
          }
        }
        for (const r of results) {
          if (JP_REGEX.test(r.title) && /属$/.test(r.title)) {
            return r.title.replace(/属$/, "");
          }
        }
      }
    }
  }

  return null;
}

async function getJapaneseName(result: PlantNetResult): Promise<string> {
  // 1. PlantNet APIの commonNames から日本語名を探す
  const fromApi = extractJapaneseName(result);
  if (fromApi) return fromApi;

  // 2. Wikipedia で日本語名を探す
  const fromWiki = await lookupJapaneseName(result.species.scientificNameWithoutAuthor);
  if (fromWiki) return fromWiki;

  // 3. どちらもなければ学名をそのまま返す
  return result.species.scientificNameWithoutAuthor;
}

export async function identifyFlower(
  imageFile: File | Blob
): Promise<PlantNetResponse> {
  const formData = new FormData();
  formData.append("images", imageFile, "photo.jpg");
  formData.append("organs", "flower");
  const url = `/api/plantnet/v2/identify/all?include-related-images=false&no-reject=false&nb-results=5&lang=ja&type=kt`;
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
