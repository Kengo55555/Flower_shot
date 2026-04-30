export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/plantnet", "");
  const targetUrl = "https://my-api.plantnet.org" + path + url.search;

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
