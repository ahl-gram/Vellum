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

/**
 * The Punchcutter's Case (#228): the site chrome is set in the same century as the
 * charts. Three self-hosted OFL faces carry three roles: IM Fell English SC for
 * display (titles, section heads, nav), IM Fell English italic for flourishes
 * (taglines, captions, marginal notes), EB Garamond for body prose. This guards the
 * wiring end to end, and the BOUNDARY (the charts' own SVG lettering is out of scope,
 * so no chart byte changes and no regen is owed).
 */

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const readText = (p: string) => readFile(root(p), "utf8").catch(() => "");

// The three role custom properties fonts.css publishes, consumed site-wide.
const ROLE_VARS = ["--font-display", "--font-flourish", "--font-body"] as const;

// The self-hosted woff2 set: SC display, Fell italic flourish, EB Garamond body
// (the 400/600/700 weights + the 400 italic the site's chrome actually asks for).
const WOFF2 = [
  "im-fell-english-sc-latin-400-normal.woff2",
  "im-fell-english-latin-400-italic.woff2",
  "eb-garamond-latin-400-normal.woff2",
  "eb-garamond-latin-400-italic.woff2",
  "eb-garamond-latin-600-normal.woff2",
  "eb-garamond-latin-700-normal.woff2",
] as const;

// Every hand-authored page shell in the folio (the atlas + gallery are generated,
// guarded through their generators below). Since Sub 8 (#254) all six pages
// render through BaseLayout, so the one layout IS the folio's shell.
const AUTHORED_PAGES = ["src/layouts/BaseLayout.astro"] as const;

const AUTHORED_CSS = [
  "public/index.css",
  "public/explorer/index.css",
  "public/faq/index.css",
  "public/glossary/index.css",
  "public/print-room/index.css",
  "public/seed-of-the-day/index.css",
] as const;

test("fonts.css self-hosts the three Fell/Garamond faces with font-display: swap", async () => {
  const css = await readText("public/fonts.css");
  assert.ok(css.length > 0, "public/fonts.css should exist");

  // The three families, each declared @font-face.
  for (const family of ["IM Fell English SC", "IM Fell English", "EB Garamond"]) {
    assert.ok(
      new RegExp(`@font-face[^}]*font-family:\\s*['"]${family}['"]`, "s").test(css),
      `fonts.css should @font-face the "${family}" family`,
    );
  }

  // Nothing blocks on the font files: swap in a serif fallback while they load.
  assert.match(css, /font-display:\s*swap/, "faces must use font-display: swap");

  // Self-hosted under the site's own assets: reference /fonts/, never a third party.
  assert.match(css, /url\(\s*['"]?\/fonts\/[^)]+\.woff2/, "faces must load from /fonts/");
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com/, "no third-party font host");

  // The three role custom properties, each with the Iowan serif stack baked in as the
  // fallback so a missing woff2 (or a page that never links fonts.css) still reads warm.
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

test("the static page CSS binds body to the body role, via the font var", async () => {
  for (const css of AUTHORED_CSS) {
    const text = await readText(css);
    assert.match(text, /var\(--font-body/, `${css} body should use var(--font-body ...)`);
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
    bannersHtml: "<section></section>",
    chronicleHtml: "<section></section>",
    gazetteerHtml: "<section></section>",
  };

  const deployed = atlasDocument(fixture, (p, s) => atlasPlateFilename(p, s), { anchor: true, motion: true });
  assert.match(deployed, /<link rel="stylesheet" href="\/fonts\.css">/, "the deployed atlas should link /fonts.css");
  assert.match(deployed, /var\(--font-body/, "atlas body chrome should use the body role var");

  const offline = atlasDocument(fixture, (p) => `data:${p.key}`, { anchor: false, motion: false });
  assert.doesNotMatch(offline, /href="\/fonts\.css"/, "the self-contained download links nothing external");
  // It still degrades cleanly: the var carries the serif fallback inline for the no-fonts.css case.
  assert.match(offline, /var\(--font-body,[^)]*serif/, "the download must fall back to the serif stack");
});

test("the generated gallery joins the Case: links /fonts.css and binds the roles", async () => {
  const dir = "out/test-fonts-gallery";
  await rm(dir, { recursive: true, force: true });
  try {
    await buildGallery(100, { count: 1, out: dir });
    const html = await readFile(join(dir, "index.html"), "utf8");
    assert.match(html, /<link rel="stylesheet" href="\/fonts\.css">/, "gallery should link /fonts.css");
    assert.match(html, /var\(--font-body/, "gallery body should use the body role var");
    assert.match(html, /var\(--font-display/, "gallery h1 should use the display role var");
    assert.match(html, /var\(--font-flourish/, "gallery subtitle should use the flourish role var");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the e2e harness serves .woff2 with a real font MIME (no false-positive fallback)", async () => {
  const text = await readText("scripts/e2e/harness.mjs");
  assert.match(text, /["']\.woff2["']\s*:\s*["']font\/woff2/, "the harness MIME map should serve .woff2 as font/woff2");
});

// ---------------------------------------------------------------------------
// BOUNDARY GUARD (not red-green: green from the start, by design). #228 is site
// chrome ONLY. The charts' own SVG lettering is out of scope because it is part of
// the byte-determinism contract, so this asserts NO chart byte moved: the rendered
// SVG never mentions the new faces, and render/style.ts still sets the Iowan stack.
// If a future edit reaches into the SVG font, this fails and the regen discipline
// (land a chart delta alone) applies.
// ---------------------------------------------------------------------------
test("boundary: the chart SVG lettering is untouched by the site's Punchcutter faces", () => {
  const svg = renderMap(generateWorld(defaultRecipe(42)), { style: "antique", widthPx: 480 });
  assert.doesNotMatch(svg, /IM Fell|EB Garamond/, "chart <text> must not adopt the site chrome faces");

  const style = readFileSync(root("src/render/style.ts"), "utf8");
  assert.match(style, /fontFamily:\s*"'Iowan Old Style'/, "the SVG font stack stays the Iowan serif (byte-determinism)");
  assert.doesNotMatch(style, /IM Fell|EB Garamond/, "no site-chrome face should leak into the SVG style");
});
