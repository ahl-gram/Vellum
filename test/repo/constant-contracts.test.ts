import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_TILT } from "../../src/render/voyage-geometry.ts";
import { RDP_EPSILON, COAST_EMBARK_MAX } from "../../src/render/voyage-route.ts";
import { INLAND_STUB_CELLS } from "../../src/render/voyage-water.ts";
import { MARGIN_FRACTION } from "../../src/render/transform.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { POSTER_PRESETS } from "../../src/site/print-room/poster-presets.ts";
import { MAX_PIXELS, fitScaleToBudget } from "../../src/site/lib/rasterize.ts";

// Constant contracts that span files: each pair must move together, and where the far
// side is an e2e script or a DOM-bound page module, this suite reads it as source.

const src = (p: string) => readFileSync(p, "utf8");

test("RDP_EPSILON is pinned absolutely, so an epsilon bump is a conscious change here too", () => {
  assert.equal(RDP_EPSILON, 0.75);
});

test("COAST_EMBARK_MAX stays strictly below INLAND_STUB_CELLS", () => {
  assert.ok(COAST_EMBARK_MAX < INLAND_STUB_CELLS);
});

test("the backdrop lattice lands a foreground sample exactly on a backdrop stride", () => {
  assert.equal((BACKDROP_SAMPLES - 1) % (FOREGROUND_SAMPLES - 1), 0);
});

test("every region band obeys lodWindowFor's size <= 0.98 precondition", () => {
  for (const band of LOD_BANDS) {
    if (band.isRegion) assert.ok(band.sizeUV <= 0.98, `band ${band.index} sizeUV ${band.sizeUV}`);
  }
});

test("POSTER_PRESETS stays width-ascending: the clamp envelope reads first and last", () => {
  for (let i = 1; i < POSTER_PRESETS.length; i++) {
    assert.ok(POSTER_PRESETS[i].width > POSTER_PRESETS[i - 1].width);
  }
});

test("the 24 Mpx budget clears every poster at x1 and clamps exactly Wall and Grand at x2", () => {
  const recipe = defaultRecipe(42);
  const aspect = recipe.gridH / recipe.gridW;
  const clampedAt2: string[] = [];
  for (const p of POSTER_PRESETS) {
    const h = Math.round(p.width * aspect);
    assert.equal(fitScaleToBudget(p.width, h, 1, MAX_PIXELS).clamped, false, `${p.key} at x1`);
    if (fitScaleToBudget(p.width, h, 2, MAX_PIXELS).clamped) clampedAt2.push(p.key);
  }
  assert.deepEqual(clampedAt2, ["wall", "grand"]);
});

test("the e2e RV4 tilt ceiling tracks MAX_TILT", () => {
  const m = src("scripts/e2e/suite-room-voyage-route.mjs").match(/maxTilt <= ([\d.]+)/);
  assert.ok(m, "RV4 ceiling not found in suite-room-voyage-route.mjs");
  const ceiling = Number(m[1]);
  assert.ok(ceiling > MAX_TILT && ceiling - MAX_TILT < 0.001, `ceiling ${ceiling}, MAX_TILT ${MAX_TILT}`);
});

test("seed-of-the-day's MARGIN mirrors renderMap's margin fraction", () => {
  const m = src("src/site/seed-of-the-day/app.ts").match(/const MARGIN = Math\.round\(1500 \* ([\d.]+)\)/);
  assert.ok(m, "MARGIN literal not found in seed-of-the-day/app.ts");
  assert.equal(Number(m[1]), MARGIN_FRACTION);
});

test("the voyage session's projection margin mirrors renderMap's margin fraction", () => {
  const m = src("src/site/living-chart/voyage-session.ts").match(/Math\.round\(wPx \* ([\d.]+)\)/);
  assert.ok(m, "session margin literal not found in voyage-session.ts");
  assert.equal(Number(m[1]), MARGIN_FRACTION);
});

test("every worker spawn keeps the literal static form Vite's build analysis requires", () => {
  const code = src("src/site/explorer/worker-client.ts");
  const spawns = code.match(/new Worker\(/g) ?? [];
  const statics = code.match(/new Worker\(new URL\("\.\/worker\.ts", import\.meta\.url\), \{ type: "module" \}\)/g) ?? [];
  assert.ok(spawns.length >= 1, "expected at least one worker spawn");
  assert.equal(statics.length, spawns.length);
});

test("every press build sets publicDir: false", () => {
  const code = src("scripts/build-app-bundles.ts");
  const builds = code.match(/await build\(/g) ?? [];
  const hits = code.match(/publicDir:\s*\w+/g) ?? [];
  assert.ok(builds.length >= 2, "expected both press build calls");
  assert.equal(hits.length, builds.length);
  for (const hit of hits) assert.equal(hit, "publicDir: false");
});
