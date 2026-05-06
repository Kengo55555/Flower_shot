// PlantNet APIプロキシ（セキュリティ強化版）
//
// 対策:
// 1. APIキーはサーバー側（環境変数）に保持し、クライアントには渡さない
// 2. Originヘッダーで自サイトからのリクエストのみ許可
// 3. パスを /v2/identify/ に限定（任意エンドポイントへの転送を防止）
// 4. POSTメソッドのみ許可

const ALLOWED_ORIGINS = [
  "https://flower-shot.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
];

export async function onRequestPost(context) {
  const { request, env } = context;

  // Origin チェック
  const origin = request.headers.get("Origin") || request.headers.get("Referer") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // パスを /v2/identify/ のみに制限
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/plantnet", "");
  if (!path.startsWith("/v2/identify/")) {
    return new Response(JSON.stringify({ error: "Not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // APIキーをサーバー側で付与（クライアントからのapi-keyパラメータは除去）
  const apiKey = env.PLANTNET_API_KEY || "";
  const params = new URLSearchParams(url.search);
  params.delete("api-key");
  params.set("api-key", apiKey);

  const targetUrl = `https://my-api.plantnet.org${path}?${params.toString()}`;

  const body = await request.arrayBuffer();

  const res = await fetch(targetUrl, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "",
    },
  });

  const responseBody = await res.arrayBuffer();
  return new Response(responseBody, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}
