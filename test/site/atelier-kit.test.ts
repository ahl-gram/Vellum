import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, globSync } from "node:fs";
import { resolve } from "node:path";

// #487 (the Atelier Kit), the 2026-09-02 ledger's one PR: the five markup shapes the rooms pasted verbatim are components in src/layouts/, and no page carries a copy. The dress stays the kit sheet's (no css change); the built html is pinned in astro-scaffold.test.ts.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const pages = globSync("src/pages/**/index.astro", { cwd: REPO }).sort();
const rooms = pages.filter((p) => p !== "src/pages/index.astro");
const CHART_ROOMS = ["explorer", "print-room", "prospect", "reading-room", "ribbon", "seed-of-the-day"].map((r) => `src/pages/${r}/index.astro`);

test("AK1 no page carries a pasted copy of a lifted shape: the fog pair, the vignette pair, the Glass, the chart folio, a road out", () => {
  for (const p of rooms) {
    const src = read(p);
    for (const [shape, pasted] of [
      ["the fog pair", /class="fog a"/],
      ["the vignette pair", /class="vignette top"/],
      ["the Glass", /chrome corner br zoomery/],
      ["the chart folio", /chrome corner bl folio/],
      ["a road out", /<a[^>]*class="legend-btn/],
    ] as const) {
      assert.doesNotMatch(src, pasted, `${p} pastes ${shape}; it is a component now`);
    }
  }
});

test("AK2 every room wears the fog through the kit; every stage room wears the vignettes, the Gallery none (its captions scroll, #464)", () => {
  for (const p of rooms) assert.ok(read(p).includes("<Fog />"), `${p} wears <Fog />`);
  for (const p of CHART_ROOMS) assert.ok(read(p).includes("<Vignettes />"), `${p} wears <Vignettes />`);
  assert.ok(!read("src/pages/gallery/index.astro").includes("<Vignettes"), "the Gallery wears no vignettes: a fixed darkening band over scrolling captions");
  assert.ok(!read("src/pages/index.astro").includes("<Fog"), "home keeps its own stage dress (#461)");
});

test("AK3 every chart room stands the Glass and the chart folio from the kit; the Explorer alone names its cluster for glass.ts", () => {
  for (const p of CHART_ROOMS) {
    const src = read(p);
    assert.match(src, /<Glass( id="zoom-controls")? \/>/, `${p} stands the Glass`);
    assert.match(src, /<ChartFolio lines=\{\[(\["[\w-]+( [\w-]+)?", "[\w-]+"\](, )?)+\]\} \/>/, `${p} stands the chart folio with its lines as [class, id] pairs`);
  }
  assert.ok(read("src/pages/explorer/index.astro").includes('<Glass id="zoom-controls" />'), "the Explorer's cluster keeps the id its glass.ts binds");
  assert.ok(read("src/pages/index.astro").includes('<Glass id="lf-controls" />'), "home stands the camera too (#505), under the id its app.ts reveals and binds");
  assert.ok(!read("src/pages/gallery/index.astro").includes("<Glass"), "the Gallery has no sheet to lean into");
});

test("AK4 the kit's shapes: the fog and vignette pairs, the Glass with data-zoom on every press, the chart folio's [class, id] lines, the stage's gesture box and after-slot, the road out", () => {
  const fog = read("src/layouts/Fog.astro");
  assert.match(fog, /<div class="fog a" aria-hidden="true"><\/div><div class="fog b" aria-hidden="true"><\/div>/);
  const vignettes = read("src/layouts/Vignettes.astro");
  assert.match(vignettes, /<div class="vignette top" aria-hidden="true"><\/div><div class="vignette bottom" aria-hidden="true"><\/div>/);
  const glass = read("src/layouts/Glass.astro");
  assert.match(glass, /<div class="chrome corner br zoomery" id=\{id\} role="group" aria-label="Camera">/, "the cluster takes an optional id; the group is home's Camera (#505, ruled 2026-09-02)");
  for (const [id, zoom, label, glyph] of [["zoom-in", "in", "Draw nearer", "\\+"], ["zoom-out", "out", "Stand off", "&minus;"], ["zoom-reset", "fit", "The whole sheet", "&#8962;"]] as const) {
    assert.match(glass, new RegExp(`<button id="${id}" class="zoom-btn" type="button" data-zoom="${zoom}" aria-label="${label}">${glyph}</button>`), `${id} carries data-zoom="${zoom}" for glass-keys.ts, home's label and text glyph`);
  }
  assert.ok(glass.indexOf('id="zoom-in"') < glass.indexOf('id="zoom-out"') && glass.indexOf('id="zoom-out"') < glass.indexOf('id="zoom-reset"'), "in, out, the whole sheet: home's order");
  assert.doesNotMatch(glass, /zoom-keys|<svg|title=/, "no keys slip, no engraved glyphs, no tooltips (ruled 2026-09-02)");
  const folio = read("src/layouts/ChartFolio.astro");
  assert.match(folio, /<div class="chrome corner bl folio">/);
  assert.match(folio, /lines\.map\(\(\[cls, id\]\) => <p class=\{cls\} id=\{id\}><\/p>\)/, "a line is a <p> with its class and id, nothing else");
  const stage = read("src/layouts/ChartStage.astro");
  assert.match(stage, /<div class="stage">\s*<div class="sheet" id="sheet"><div id="map-viewport" tabindex="0" role="application" aria-label=\{label\}><div id="map">\s*<slot \/>\s*<\/div><\/div><\/div>\s*<slot name="after" \/>\s*<\/div>/, "sheet > gesture box > transform target, the page's face in the slot, the pill and the notices after");
  const road = read("src/layouts/LegendButton.astro");
  assert.match(road, /<a id=\{id\} class=\{gold \? "legend-btn gold" : "legend-btn"\} data-road=\{road\} href=\{href\}><span class="verb" id=\{verbId\}>\{verb\}<\/span><span class="room">\{room\}<\/span><\/a>/, "a road is an <a> in the legend dress, gold when it is the room's featured road");
});

test("AK6 the Explorer binds its Glass by id from its own glass.ts and never imports glass-keys.ts, whose [data-zoom] binding is document-wide: a second binding would double every press", () => {
  for (const p of [...globSync("src/site/explorer/*.ts", { cwd: REPO }), ...globSync("src/site/home/*.ts", { cwd: REPO })]) assert.ok(!read(p).includes("glass-keys"), `${p} must not bind the kit's keys (home binds its own camera by id, #505)`);
  assert.match(read("src/site/shared/glass-keys.ts"), /querySelectorAll<HTMLElement>\("\[data-zoom\]"\)/, "the kit's binding reads every data-zoom press on the page");
});

test("AK5 the stage is lifted where the skeleton is one shape (the Print Room, the Prospect, the Ribbon); the three unique skeletons stay in their pages", () => {
  for (const r of ["print-room", "prospect", "ribbon"]) {
    assert.match(read(`src/pages/${r}/index.astro`), /<ChartStage label="[^"]+">/, `${r} takes the stage from the kit`);
  }
  assert.match(read("src/pages/explorer/index.astro"), /<div class="sheet-inner" id="sheet-inner">/, "the Explorer's sheet has a leaf (the verso beside the gesture box)");
  assert.match(read("src/pages/reading-room/index.astro"), /<div id="map-viewport"[^>]*><\/div><\/div>/, "the Reading Room's gesture box is empty until the frame's chart moves in");
  assert.match(read("src/pages/seed-of-the-day/index.astro"), /<div id="map"><div id="sheet" class="sheet"><\/div><\/div>/, "Today's sheet rides inside the transform target (#167)");
});

test("AK7 the camera's press is home's face everywhere (#505, ruled 2026-09-02): 2.2rem square in the body face at 1.1rem, the house's rounding kept, the mockup's ease; the keys slip is gone from the kit", () => {
  const css = read("public/atelier.css");
  const press = css.match(/\.zoom-btn\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(press, /width:\s*2\.2rem;\s*height:\s*2\.2rem;/);
  assert.match(press, /font-family:\s*var\(--font-body[^;]*;\s*font-size:\s*1\.1rem;\s*line-height:\s*1;/);
  assert.match(press, /color:\s*var\(--parchment\);\s*background:\s*rgb\(from var\(--chart-ink\) r g b \/ 0\.5\);\s*border:\s*1px solid var\(--line-tan\);/);
  assert.doesNotMatch(press, /border-radius|padding|display:\s*flex/, "no radius override (everyone gets the house's rounding), no flex centring for a text glyph");
  assert.match(press, /transition:\s*background 0\.2s ease, color 0\.2s ease;/, "the mockup's ease");
  assert.match(css, /\.zoomery\.corner \.zoom-btn:hover, \.zoomery\.corner \.zoom-btn:focus-visible\s*\{[^}]*background:\s*var\(--ink-dark\);\s*color:\s*var\(--parchment-bright\)/, "four classes deep against the house wash: what repairs home's hover");
  assert.doesNotMatch(css, /zoom-keys/, "the keys slip retired everywhere");
  assert.doesNotMatch(read("src/layouts/Glass.astro") + read("public/index.css") + read("src/site/home/app.ts") + read("src/pages/index.astro"), /zoom-keys|\.lf-btn|\.lf-controls|lf-in|lf-out|lf-home/, "home's own presses and the slip are gone");
});

test("AK8 home seats the kit's camera itself (#505, ruled 2026-09-02: home keeps its own seat) and binds it by id, never through glass-keys", () => {
  const css = read("public/index.css");
  assert.match(css, /#lf-controls\s*\{[^}]*display:\s*none;[^}]*position:\s*absolute;[^}]*right:\s*1\.6rem;[^}]*bottom:\s*1\.4rem;[^}]*z-index:\s*auto;[^}]*animation:\s*none;/, "inside the stage as before, scrolling away with it; the kit's fixed corner, depth and ink-in stood down");
  assert.match(css, /#lf-controls\.on\s*\{\s*display:\s*flex;/, "shown once the camera arms");
  assert.match(css, /#lf-controls button \{ touch-action: pan-y; \}/, "the touch-action line the presses carried (#475) stays");
  const app = read("src/site/home/app.ts");
  for (const id of ["zoom-in", "zoom-out", "zoom-reset"]) assert.ok(app.includes(`getElementById("${id}")`), `app.ts binds ${id}`);
  assert.ok(app.includes('getElementById("lf-controls")'), "and reveals the cluster by the id it passes the component");
});
