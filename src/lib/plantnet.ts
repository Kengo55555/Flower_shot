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

function extractJapaneseName(result: PlantNetResult): string | null {
  const japaneseNames = result.species.commonNames.filter((n) => JP_REGEX.test(n));
  return japaneseNames[0] || null;
}

async function lookupJapaneseName(scientificName: string): Promise<string | null> {
  try {
    // 方法1: MediaWiki APIでリダイレクト解決（学名→日本語名）
    const encoded = encodeURIComponent(scientificName);
    const redirectRes = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&titles=${encoded}&redirects=1&format=json&origin=*`
    );
    if (redirectRes.ok) {
      const data = await redirectRes.json();
      // リダイレクト先の日本語タイトルを取得
      const redirects = data.query?.redirects;
      if (redirects && redirects.length > 0) {
        const jaTitle = redirects[redirects.length - 1].to;
        if (JP_REGEX.test(jaTitle)) return jaTitle;
      }
      // リダイレクトがなくてもページタイトルを確認
      const pages = data.query?.pages;
      if (pages) {
        for (const pid of Object.keys(pages)) {
          if (pid !== "-1" && JP_REGEX.test(pages[pid].title)) {
            return pages[pid].title;
          }
        }
      }
    }

    // 方法2: Wikipedia検索APIで学名を検索
    const searchRes = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=5&format=json&origin=*`
    );
    if (searchRes.ok) {
      const data = await searchRes.json();
      const results = data.query?.search;
      if (results) {
        // 大分類（○○科、○○目、○○属）を除外して、具体的な植物名を優先
        const filtered = results.filter(
          (r: { title: string }) => JP_REGEX.test(r.title) && !/[科目属門綱]$/.test(r.title)
        );
        if (filtered.length > 0) return filtered[0].title;
        // 大分類しかない場合は属名検索にフォールバック
      }
    }

    // 方法3: 属名（学名の最初の単語）で検索 → 「○○属」を取得して表示用に加工
    const genus = scientificName.split(" ")[0];
    if (genus !== scientificName) {
      // 属名のリダイレクト解決
      const genusRes = await fetch(
        `https://ja.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(genus)}&redirects=1&format=json&origin=*`
      );
      if (genusRes.ok) {
        const data = await genusRes.json();
        const redirects = data.query?.redirects;
        if (redirects && redirects.length > 0) {
          const jaTitle = redirects[redirects.length - 1].to;
          if (JP_REGEX.test(jaTitle)) {
            // 「○○属」なら「○○のなかま」に変換
            return jaTitle.replace(/属$/, "のなかま");
          }
        }
        const pages = data.query?.pages;
        if (pages) {
          for (const pid of Object.keys(pages)) {
            if (pid !== "-1" && JP_REGEX.test(pages[pid].title)) {
              return pages[pid].title.replace(/属$/, "のなかま");
            }
          }
        }
      }

      // 属名で検索API
      const genusSearchRes = await fetch(
        `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(genus)}&srlimit=3&format=json&origin=*`
      );
      if (genusSearchRes.ok) {
        const data = await genusSearchRes.json();
        const results = data.query?.search;
        if (results) {
          const filtered = results.filter(
            (r: { title: string }) => JP_REGEX.test(r.title) && !/[科目門綱]$/.test(r.title)
          );
          if (filtered.length > 0) {
            return filtered[0].title.replace(/属$/, "のなかま");
          }
        }
      }
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

  // 2. Wikipedia で学名から日本語名を探す（リダイレクト解決 + 検索 + 属名検索）
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
