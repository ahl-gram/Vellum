import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { atlasDocument, atlasPlateFilename, type AtlasDocumentData } from "../../src/atlas/document.ts";
import { buildGallery } from "../../src/cli/gallery.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

// The Punchcutter's Case (#228): three self-hosted OFL faces (Fell SC display, Fell italic flourish, EB Garamond body). Guards the wiring end to end and the BOUNDARY: the charts' own SVG lettering is out of scope, so no chart byte moves and no regen is owed.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const readText = (p: string) => readFile(root(p), "utf8").catch(() => "");

const ROLE_VARS = ["--font-display", "--font-flourish", "--font-body"] as const;

// The woff2 set: exactly the weights and italics the site's chrome asks for.
const WOFF2 = [
  "im-fell-english-sc-latin-400-normal.woff2",
  "im-fell-english-latin-400-italic.woff2",
  "eb-garamond-latin-400-normal.woff2",
  "eb-garamond-latin-400-italic.woff2",
  "eb-garamond-latin-600-normal.woff2",
  "eb-garamond-latin-700-normal.woff2",
] as const;

// Since #254 all pages render through BaseLayout, so the one layout IS the folio's shell; the atlas + gallery are generated and guarded through their generators below.
const AUTHORED_PAGES = ["src/layouts/BaseLayout.astro"] as const;

test("fonts.css self-hosts the three Fell/Garamond faces with font-display: swap", async () => {
  const css = await readText("public/fonts.css");
  assert.ok(css.length > 0, "public/fonts.css should exist");

  for (const family of ["IM Fell English SC", "IM Fell English", "EB Garamond"]) {
    assert.ok(
      new RegExp(`@font-face[^}]*font-family:\\s*['"]${family}['"]`, "s").test(css),
      `fonts.css should @font-face the "${family}" family`,
    );
  }

  assert.match(css, /font-display:\s*swap/, "faces must use font-display: swap");

  assert.match(css, /url\(\s*['"]?\/fonts\/[^)]+\.woff2/, "faces must load from /fonts/");
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com/, "no third-party font host");

  // The role vars bake in the Iowan serif fallback so a missing woff2, or a page that never links fonts.css, still reads warm.
  for (const v of ROLE_VARS) {
    assert.ok(css.includes(v), `fonts.css :root should publish ${v}`);
  }
  assert.match(css, /Iowan Old Style/, "the role vars should fall back to the existing serif stack");
});

test("the self-hosted woff2 files and their OFL license ship under public/fonts/", () => {
  for (const file of WOFF2) {
    const path = root(`public/fonts/${file}`);
    assert.ok(existsSync(path), `public/fonts/${file} should exist`);
    // wOF2 magic: prove it is a real WOFF2, not an HTML error page saved as .woff2.
    const sig = readFileSync(path).subarray(0, 4).toString("latin1");
    assert.equal(sig, "wOF2", `${file} should be a real WOFF2 (wOF2 signature)`);
  }
  // OFL 1.1 requires the copyright + license accompany the redistributed fonts.
  const ofl = readFileSync(root("public/fonts/OFL.txt"), "utf8");
  assert.match(ofl, /Open Font License/, "public/fonts/OFL.txt should carry the OFL text");
});

test("every page shell in the folio links /fonts.css (root-absolute, like /motion.css)", async () => {
  for (const page of AUTHORED_PAGES) {
    const html = await readText(page);
    assert.ok(html.length > 0, `${page} should exist`);
    assert.match(
      html,
      /<link rel="stylesheet" href="\/fonts\.css">/,
      `${page} should link the shared /fonts.css`,
    );
  }
});

test("the shell binds all three roles once, in the layout's global style (#263)", async () => {
  const layout = await readText("src/layouts/BaseLayout.astro");
  const style = layout.match(/<style is:global>([\s\S]*?)<\/style>/);
  assert.ok(style, "BaseLayout should carry the global shell <style>");
  for (const v of ROLE_VARS) {
    assert.match(style[1], new RegExp(`var\\(${v}[,)]`), `the shell style should bind ${v}`);
  }
});

test("index.css maps display + flourish roles onto headings and flourishes", async () => {
  const css = await readText("public/index.css");
  assert.match(css, /var\(--font-display/, "titles/heads should use var(--font-display ...)");
  assert.match(css, /var\(--font-flourish/, "taglines/captions should use var(--font-flourish ...)");
});

test("atlasDocument: the deployed page joins the Case; the offline download falls back", () => {
  const fixture: AtlasDocumentData = {
    title: "The Isle of Café",
    subtitle: "surveyed in the year of the long tide",
    seed: 7,
    hero: { key: "antique", title: "hero", svg: "<svg></svg>" },
    draughtings: [{ key: "ink", title: "Pen & ink", svg: "<svg></svg>" }],
    themes: [{ key: "theme-vegetation", title: "Vegetation", svg: "<svg></svg>" }],
    regions: [{ key: "region-1", title: "Environs", svg: "<svg></svg>" }],
    prospects: [{ key: "prospect-capital", title: "The Prospect of Café", svg: "<svg></svg>" }],
    bannersHtml: "<section></section>",
    chronicleHtml: "<section></section>",
    gazetteerHtml: "<section></section>",
  };

  const deployed = atlasDocument(fixture, (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.match(deployed, /<link rel="stylesheet" href="\/fonts\.css">/, "the deployed atlas should link /fonts.css");
  assert.match(deployed, /var\(--font-body/, "atlas body chrome should use the body role var");

  const offline = atlasDocument(fixture, (p) => `data:${p.key}`, { anchor: false, motion: false });
  assert.doesNotMatch(offline, /href="\/fonts\.css"/, "the self-contained download links nothing external");
  assert.match(offline, /var\(--font-body,[^)]*serif/, "the download must fall back to the serif stack");
});

test("the gallery page css defers the sub's voice to the house intro role (#324)", async () => {
  const dir = "out/test-fonts-gallery";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(100, { count: 1, out: dir });
    const css = await readFile(join(dir, "index.css"), "utf8").catch(() => "");
    // The sub line is an intro since #324 (pinned in house-style.test.ts); the generated css re-binding it would shadow a future re-ratification.
    assert.ok(!/p\.sub[^{]*\{[^}]*font-family/.test(css), "the sub's voice belongs to /house.css, not the generated css");
    // /gallery/ is a shelled route since #268, so the standalone document retires.
    assert.ok(!existsSync(join(dir, "index.html")), "buildGallery must not write the standalone shell anymore");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the e2e harness serves .woff2 with a real font MIME (no false-positive fallback)", async () => {
  const text = await readText("scripts/e2e/harness.mjs");
  assert.match(text, /["']\.woff2["']\s*:\s*["']font\/woff2/, "the harness MIME map should serve .woff2 as font/woff2");
});

// BOUNDARY GUARD, green from the start by design: #228 is site chrome ONLY; the chart SVG lettering is part of the byte-determinism contract, so no chart byte may move.
test("boundary: the chart SVG lettering is untouched by the site's Punchcutter faces", () => {
  const svg = renderMap(generateWorld(defaultRecipe(42)), { style: "antique", widthPx: 480 });
  assert.doesNotMatch(svg, /IM Fell|EB Garamond/, "chart <text> must not adopt the site chrome faces");

  const style = readFileSync(root("src/render/style.ts"), "utf8");
  assert.match(style, /fontFamily:\s*"'Iowan Old Style'/, "the SVG font stack stays the Iowan serif (byte-determinism)");
  assert.doesNotMatch(style, /IM Fell|EB Garamond/, "no site-chrome face should leak into the SVG style");
});
