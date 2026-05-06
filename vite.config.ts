import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api/plantnet": {
          target: "https://my-api.plantnet.org",
          changeOrigin: true,
          rewrite: (path) => {
            // APIキーをサーバー側で付与
            const url = new URL(path.replace(/^\/api\/plantnet/, ""), "https://my-api.plantnet.org");
            url.searchParams.set("api-key", env.VITE_PLANTNET_API_KEY || "");
            return url.pathname + url.search;
          },
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.removeHeader("origin");
              proxyReq.removeHeader("referer");
            });
          },
        },
      },
    },
  };
});
