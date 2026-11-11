import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInline } from "../../src/site/explorer/worker-client.ts";
import { regionChainCache } from "../../src/site/explorer/region-chain-cache.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle } from "../../src/world/region.ts";
import { renderMap, type RenderOptions } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter, type LodBand } from "../../src/world/lod.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { digest } from "../../test-support/svg-digest.ts";

// What the Glass dispatches (Issue #400): the bands are the Explorer's own (lod.ts), so these run the real runInline; the worker's own region spec is proved live by e2e Z15, and only its held cache is read from source at the foot of this file.

const SEED = 2;
const CX = 0.5625;
const CY = 0.4375;
const RENDER: RenderOptions = { style: "antique", widthPx: 1500, legend: true };
const world = generateWorld(defaultRecipe(SEED));
const REGION_BANDS = LOD_BANDS.filter((b) => b.isRegion);

const jobFor = (band: LodBand) => ({
  kind: "region" as const,
  seed: SEED,
  overrides: {},
  window: lodWindowFor(CX, CY, band.sizeUV),
  gridW: band.gridW,
  gridH: band.gridH,
  band: band.index,
  render: RENDER,
});

function drawnAt(band: LodBand, detail: boolean): string {
  const window = lodWindowFor(CX, CY, band.sizeUV);
  const spec = {
    window,
    gridW: band.gridW,
    gridH: band.gridH,
    title: regionTitle(world, window),
    detail,
  };
  return renderMap(generateRegionWorld(world, spec), {
    ...RENDER,
    regionRecipe: { window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) },
  });
}

test("regionDetailLevel stamps what was DRAWN: nothing on the bare arm, the window's own level on the detail arm", () => {
  for (const band of REGION_BANDS) {
    const window = lodWindowFor(CX, CY, band.sizeUV);
    const base = { window, gridW: band.gridW, gridH: band.gridH, title: "t" };
    assert.equal(regionDetailLevel(base), 0, `band ${band.index} bare`);
    assert.equal(
      regionDetailLevel({ ...base, detail: true }),
      band.index,
      `band ${band.index} detail: the level is the window's, not the band's index by coincidence`,
    );
  }
});

for (const band of REGION_BANDS) {
  test(`band ${band.index}: the Explorer's region job draws the chained field and stamps detail ${band.index}`, () => {
    const svg = runInline(jobFor(band)).svg;
    assert.equal(digest(svg), digest(drawnAt(band, true)), "the region job draws the detailed field, cell for cell");
    assert.notEqual(
      digest(svg),
      digest(drawnAt(band, false)),
      "and the two arms differ, or this guard is measuring the flag being ignored",
    );
    assert.match(svg, new RegExp(`data-vellum-region-detail="${band.index}"`));
    assert.equal(recipeFromSvg(svg)?.region?.detail, band.index, "the level round-trips off the sheet");
  });
}

test("band 0 has no region job at all: the world sheet is what it always was", () => {
  const svg = runInline({ kind: "draw", seed: SEED, overrides: {}, render: RENDER }).svg;
  assert.equal(digest(svg), digest(renderMap(world, RENDER)), "the world draw path is untouched by this sub");
  assert.doesNotMatch(svg, /data-vellum-region-/, "and carries no region stamp to acquire a detail level");
});

test("the region job actually builds in the HELD cache, which no byte comparison can see", () => {
  // The cache is transparent by construction (the key is the whole spec), so every digest here passes with it silently dropped; this asks the cache.
  const deepest = REGION_BANDS[REGION_BANDS.length - 1] as LodBand;
  const touches = (): number => regionChainCache.hits + regionChainCache.misses;
  const before = touches();
  runInline(jobFor(deepest));
  assert.ok(touches() > before, "a region job builds its ancestry IN the held cache, not in one of its own");
  const served = regionChainCache.hits;
  runInline(jobFor(deepest));
  assert.ok(regionChainCache.hits > served, "and a redraw of that window is served back out of it");
});

test("the stamp follows the WINDOW, not the band index the job happened to carry", () => {
  // At every real band the window and the band index agree; this is the one fixture where they diverge, a deepest-band window carried by a job announcing band 1, which is what a stale hysteresis step would send.
  const deepest = REGION_BANDS[REGION_BANDS.length - 1] as LodBand;
  const svg = runInline({ ...jobFor(deepest), band: 1 }).svg;
  assert.equal(recipeFromSvg(svg)?.region?.detail, deepest.index, "the window implies the level");
  assert.notEqual(deepest.index, 1, "and the two really do disagree, or this fixture proves nothing");
});

test("a chain cache held across jobs cannot move a byte: the same window redraws identically after another", () => {
  const deepest = REGION_BANDS[REGION_BANDS.length - 1] as LodBand;
  const first = digest(runInline(jobFor(deepest)).svg);
  assert.equal(digest(runInline(jobFor(deepest)).svg), first, "a repeat draw is byte-identical");
  runInline(jobFor(REGION_BANDS[0] as LodBand));
  assert.equal(
    digest(runInline(jobFor(deepest)).svg),
    first,
    "and so is one drawn after an intervening window evicted or warmed the cache",
  );
});

test("the worker's region job builds in the held chain cache (kept at the close of Issue #779: the cache is transparent to every byte, so only time could see it)", () => {
  const worker = readFileSync(resolve(import.meta.dirname, "..", "..", "src/site/explorer/worker.ts"), "utf8");
  assert.ok(/chainCache: regionChainCache/.test(worker), "the worker no longer builds in the held chain cache");
});

test("RP4 the Explorer's region job hands the card the main chart's numbers and the main chart's roads (Issue #403)", () => {
  const world42 = generateWorld(defaultRecipe(42));
  const gridW = 320;
  const gridH = 240;
  const s = world42.settlements[1]!;
  const q = quantizeCenter(s.x / (gridW - 1), s.y / (gridH - 1), 0.125);
  const window = lodWindowFor(q.cx, q.cy, 0.125);
  const closeUp = generateRegionWorld(world42, {
    window,
    gridW,
    gridH,
    title: regionTitle(world42, window),
    detail: true,
    chainCache: regionChainCache,
  });
  assert.equal(
    buildPlaceManifest(closeUp, 1500).places[0]!.roads,
    false,
    "the close-up's own flag at Paukilua is false",
  );
  const res = runInline({ kind: "region", seed: 42, overrides: {}, window, gridW, gridH, band: 3, render: RENDER });
  const places = res.manifest.places;
  assert.equal(places[0]!.name, "Paukilua");
  assert.equal(places[0]!.worldIdx, 1);
  assert.equal(places[0]!.roads, true, "the main chart's road leaves it");
  assert.equal(places.length, 21);
  assert.ok(
    places.slice(1).every((p) => p.worldIdx === null),
    "the 20 places that follow are hamlets, farmsteads or mills",
  );
});

test("the Glass's region job over the beast's haunt draws the parent's beast when the seal is set (seed 2, band 2)", () => {
  const beast = world.beasts[0]!;
  const band = LOD_BANDS[2] as LodBand;
  const q = quantizeCenter(beast.x / (world.recipe.gridW - 1), beast.y / (world.recipe.gridH - 1), band.sizeUV);
  const job = {
    kind: "region" as const,
    seed: SEED,
    overrides: {},
    window: lodWindowFor(q.cx, q.cy, band.sizeUV),
    gridW: band.gridW,
    gridH: band.gridH,
    band: band.index,
    render: { ...RENDER, beasts: true },
  };
  const sealed = runInline(job).svg;
  assert.ok(sealed.includes('id="layer-bestiary"'), "the Glass's close-up over the haunt drew no bestiary");
  assert.ok(sealed.includes(beast.name), "and the beast it drew is not the parent's");
  assert.ok(
    !runInline({ ...job, render: RENDER }).svg.includes('id="layer-bestiary"'),
    "with the seal off the close-up still drew the beast",
  );
});
