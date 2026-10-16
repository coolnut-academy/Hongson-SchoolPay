import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import type { PreviewServer } from "vite";
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "preview-static-asset-errors",
    // Local verification tooling only; no server code is emitted into dist.
    // The selected static host must apply the same asset-vs-SPA fallback rule.
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((request, response, next) => {
        let pathname: string;
        try { pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname); }
        catch { response.statusCode = 400; response.end("Invalid asset path"); return; }
        if (pathname.startsWith("/assets/")) {
          const assetsRoot = resolve("dist/assets");
          const target = resolve("dist", `.${pathname}`);
          if (!target.startsWith(`${assetsRoot}${sep}`) || !existsSync(target)) {
            response.statusCode = 404; response.setHeader("Content-Type", "text/plain; charset=utf-8"); response.end("Asset not found"); return;
          }
        }
        next();
      });
    },
  }],
  build: { target: "es2022" },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
