import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInline } from "../../src/site/explorer/worker-client.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionDetailLevel, regionTitle } from "../../src/world/region.ts";
import { renderMap, type RenderOptions } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { LOD_BANDS, lodWindowFor, type LodBand } from "../../src/world/lod.ts";

// #400: what the Glass dispatches. The bands are the Explorer's own (lod.ts), and every region
// job it fires draws the chained field, so these run the real runInline rather than a stand-in.
// The worker's own branch is not importable here (its module body casts `self`), so its agreement
// with runInline is read as source at the foot of this file and proved live by e2e R14.

const SEED = 2;
const CX = 0.5625;
const CY = 0.4375;
const RENDER: RenderOptions = { style: "antique", widthPx: 1500, legend: true };
const world = generateWorld(defaultRecipe(SEED));
const REGION_BANDS = LOD_BANDS.filter((b) => b.isRegion);

/** A region sheet is ~300KB, and node:test renders a failed equal() of two of them character by character; the digest is the same byte comparison with a message a human can read. */
const digest = (svg: string): string => `${createHash("sha256").update(svg).digest("hex").slice(0, 16)}/${svg.length}`;

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

test("the worker and its inline twin build the same region spec, so the two cannot drift apart", () => {
  // worker.ts casts `self` in its module body, so it cannot be imported here; e2e R14 proves the
  // bytes agree live and this reads the source so a one-sided edit fails before CI gets there.
  const ROOT = resolve(import.meta.dirname, "..", "..");
  const read = (p: string): string => readFileSync(resolve(ROOT, p), "utf8");
  for (const file of ["src/site/explorer/worker.ts", "src/site/explorer/worker-client.ts"]) {
    const source = read(file);
    const has = (re: RegExp): boolean => re.test(source);
    assert.ok(has(/detail: true/), `${file} no longer draws the region job's detailed field`);
    assert.ok(has(/regionDetailLevel\(/), `${file} stamps a detail level it did not derive from the spec`);
    assert.ok(!has(/detail: 0/), `${file} still hardcodes a detail level`);
    assert.ok(has(/regionChainCache/), `${file} no longer holds the chain cache across jobs`);
  }
});
