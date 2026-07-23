import { defineConfig } from "astro/config";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Sub 3 (#204): the app surfaces ship verbatim from public/, but Vite's dev
// public middleware serves EXACT file paths only and Astro dev installs no
// dir -> index.html fallback (appType "custom"), so /explorer/ would 404 in dev
// while /explorer/index.html serves. This dev-only rewrite restores the
// canonical trailing-slash URLs. configureServer registers it BEFORE Vite's
// internal middlewares; astro build/preview are untouched (raw public/ copy).
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

// Scriptorium Sub 2 (#203). Contractual shape per the ratified Sub 1 decision doc
// (the 2026-07-21 comment on #202): base stays "/" (every shared asset is linked
// root-absolute), outDir stays "./dist" (deploy.yml uploads `path: dist`), and
// build.format stays "directory" (emits /faq/index.html exactly like today). All
// three are Astro defaults, so they are not restated here; changing any of them
// breaks the site or the deploy.
export default defineConfig({
  site: "https://vellum.route12b.net",
  // Every internal link and og:url is trailing-slash directory form (constraint 8).
  trailingSlash: "always",
  // The migrated pages' markup must stay near-verbatim (no minification drift):
  // no whitespace minification, and no fingerprinted stylesheet emitted for the
  // layout's small shell <style> (nothing on this site may be fingerprinted).
  compressHTML: false,
  build: { inlineStylesheets: "always" },
  vite: { plugins: [publicDirIndexes()] },
});
