import { defineConfig } from "astro/config";

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
  // The migrated pages must stay near-verbatim against their docs/ originals:
  // no whitespace minification, and no fingerprinted stylesheet emitted for the
  // layout's small shell <style> (nothing on this site may be fingerprinted).
  compressHTML: false,
  build: { inlineStylesheets: "always" },
});
