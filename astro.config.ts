import { defineConfig } from "astro/config";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// #204 dev-only rewrite: Vite's dev public middleware serves EXACT file paths only and
// Astro dev installs no dir -> index.html fallback, so /explorer/ would 404 in dev while
// /explorer/index.html serves. Registered BEFORE Vite's internal middlewares; astro
// build/preview are untouched (raw public/ copy).
const PUBLIC_DIR = fileURLToPath(new URL("public", import.meta.url));
const publicDirIndexes = () => ({
  name: "vellum-public-dir-indexes",
  configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((req, _res, next) => {
      const pathname = req.url?.split("?")[0] ?? "";
      if (
        pathname.endsWith("/") &&
        pathname !== "/" &&
        !pathname.includes("..") &&
        existsSync(join(PUBLIC_DIR, pathname, "index.html"))
      ) {
        req.url = `${pathname}index.html`;
      }
      next();
    });
  },
});

// Contractual shape per the ratified Sub 1 decision doc (the 2026-07-21 comment on
// #202): base "/", outDir "./dist", and build.format "directory" are all Astro defaults,
// so they are not restated here; changing any of them breaks the site or the deploy.
export default defineConfig({
  site: "https://www.vellumworlds.com",
  // Every internal link and og:url is trailing-slash directory form (constraint 8).
  trailingSlash: "always",
  // The migrated pages' markup must stay near-verbatim (no minification drift), and nothing on this site may be fingerprinted: no whitespace minification, and the layout's small shell <style> inlines instead of emitting a fingerprinted sheet.
  compressHTML: false,
  build: { inlineStylesheets: "always" },
  vite: { plugins: [publicDirIndexes()] },
});
