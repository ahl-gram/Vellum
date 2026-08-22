import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildChainedField,
  canonicalParent,
  chainCacheKey,
  createChainCache,
  detailForWindow,
  type ChainSpec,
} from "../../src/world/detail-chain.ts";
import { FULL_WINDOW, LOD_BANDS, decideSettle, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { buildHeightfield, MAX_DETAIL, type UvWindow } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { parentSurfaceOnWindow } from "../../src/terrain/detail-guarantees.ts";

const SEED = 42;
const recipe = defaultRecipe(SEED);
const world = buildHeightfield({ seed: SEED, gridW: 320, gridH: 240, mapType: recipe.mapType });
const SEA = pickSeaLevel(world, recipe.landFraction);
const WORLD_ASPECT = 319 / 239;

function windowsEqual(a: UvWindow, b: UvWindow): boolean {
  return a.u0 === b.u0 && a.v0 === b.v0 && a.u1 === b.u1 && a.v1 === b.v1;
}

/** Every window the Glass can settle on at a band: lattice centers through quantizeCenter and lodWindowFor, which is exactly what decideSettle emits. */
function reachableWindows(band: number): UvWindow[] {
  const size = (LOD_BANDS[band] as (typeof LOD_BANDS)[number]).sizeUV;
  const step = size / 8;
  const seen = new Map<string, UvWindow>();
  for (let i = 0; i * step <= 1 + 1e-9; i++) {
    for (let j = 0; j * step <= 1 + 1e-9; j++) {
      const q = quantizeCenter(i * step, j * step, size);
      const w = lodWindowFor(q.cx, q.cy, size);
      seen.set(`${w.u0},${w.v0}`, w);
    }
  }
  return [...seen.values()];
}

function specFor(band: number, window: UvWindow, over: Partial<ChainSpec> = {}): ChainSpec {
  const b = LOD_BANDS[band] as (typeof LOD_BANDS)[number];
  return {
    seed: SEED,
    mapType: recipe.mapType,
    band,
    window,
    gridW: b.gridW,
    gridH: b.gridH,
    worldAspect: WORLD_ASPECT,
    seaLevel: SEA,
    ...over,
  };
}

test("the canonical parent doubles the window and lands on the parent band's own lattice (#398)", () => {
  assert.ok(windowsEqual(canonicalParent(FULL_WINDOW), FULL_WINDOW), "band 0 parents on the full window");
  assert.ok(
    windowsEqual(canonicalParent(lodWindowFor(0.5, 0.5, 0.5)), FULL_WINDOW),
    "band 1 parents on the full window",
  );
  for (const band of [2, 3]) {
    const legal = new Set(reachableWindows(band - 1).map((w) => `${w.u0},${w.v0},${w.u1},${w.v1}`));
    for (const child of reachableWindows(band)) {
      const p = canonicalParent(child);
      const childSize = child.u1 - child.u0;
      assert.ok(
        Math.abs((p.u1 - p.u0) - childSize * 2) < 1e-12,
        `band ${band}: parent of ${child.u0},${child.v0} is not double the child size`,
      );
      assert.ok(
        legal.has(`${p.u0},${p.v0},${p.u1},${p.v1}`),
        `band ${band}: parent of ${child.u0},${child.v0} is not a window band ${band - 1} can settle on`,
      );
    }
  }
});

test("the canonical parent covers its child everywhere the Glass can settle (#398)", () => {
  // lodWindowFor clamps a window to the sheet, so a parent could in principle fail to cover a child near an edge; measured across all 3955 reachable windows it never does, and an uncovered strip would leave real land unprotected by the floor.
  let checked = 0;
  for (const band of [1, 2, 3]) {
    for (const child of reachableWindows(band)) {
      const p = canonicalParent(child);
      checked++;
      assert.ok(
        child.u0 >= p.u0 - 1e-12 && child.v0 >= p.v0 - 1e-12 &&
        child.u1 <= p.u1 + 1e-12 && child.v1 <= p.v1 + 1e-12,
        `band ${band}: parent ${p.u0},${p.v0}..${p.u1},${p.v1} does not cover child ${child.u0},${child.v0}..${child.u1},${child.v1}`,
      );
      if (band >= 2) {
        // Only bands 2 and up route their parent through lodWindowFor; band 1 returns FULL_WINDOW directly, which is why size 1 does not breach the clamp precondition.
        assert.ok(
          p.u1 - p.u0 <= 0.98,
          `band ${band}: parent size ${p.u1 - p.u0} breaks lodWindowFor's documented size <= 0.98 precondition`,
        );
      }
    }
  }
  assert.ok(checked > 3000, `sweep collapsed to ${checked} windows`);
});

test("the detail level is keyed off the window size, one octave per halving (#398)", () => {
  assert.equal(detailForWindow(FULL_WINDOW), 0);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.5)), 1);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.25)), 2);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.125)), 3);
});

test("band 0 of the chain IS the world field, so the chain anchors on the golden (#398)", () => {
  const chained = buildChainedField(specFor(0, FULL_WINDOW));
  assert.deepEqual(chained.data, world.data, "the chain's band 0 diverged from buildHeightfield's world field");
});

test("two zoom routes to the same window produce a byte-identical field (#398)", () => {
  // The epic's "single easiest thing to get wrong": a parent derived from the camera path rather than the window made 123 of 76800 cells differ in VALUE. Same environment, so this comparison is exact by design; the float-drift rule bans byte comparison ACROSS environments only.
  const target = { cx: 0.53, cy: 0.42, k: 8 };
  const routeA = [{ cx: 0.53, cy: 0.42, k: 1 }, { cx: 0.53, cy: 0.42, k: 2.6 }, { cx: 0.53, cy: 0.42, k: 5.2 }, target];
  const routeB = [{ cx: 0.12, cy: 0.87, k: 1 }, { cx: 0.12, cy: 0.87, k: 6.5 }, { cx: 0.30, cy: 0.60, k: 6.5 }, target];
  const walk = (route: ReadonlyArray<{ cx: number; cy: number; k: number }>): { band: number; window: UvWindow } => {
    let band = 0;
    let window: UvWindow = FULL_WINDOW;
    for (const camera of route) {
      const d = decideSettle({ camera, currentWindow: window, currentBand: band });
      if (d.action === "region") {
        band = d.band;
        window = d.window;
      } else if (d.action === "world") {
        band = 0;
        window = FULL_WINDOW;
      }
    }
    return { band, window };
  };
  const a = walk(routeA);
  const b = walk(routeB);
  assert.equal(a.band, 3, "route A did not land at band 3");
  assert.ok(windowsEqual(a.window, b.window), "the two routes did not land on the same window");
  const fa = buildChainedField(specFor(a.band, a.window));
  const fb = buildChainedField(specFor(b.band, b.window), createChainCache());
  assert.deepEqual(fb.data, fa.data, "the same window drew different terrain by route");

  // A cache carrying route B's unrelated ancestry must not leak into the answer: the field is a function of the window, not of what the session happened to draw before it.
  const warmed = createChainCache();
  for (const w of [lodWindowFor(0.125, 0.875, 0.125), lodWindowFor(0.375, 0.125, 0.25)]) {
    buildChainedField(specFor(w.u1 - w.u0 > 0.2 ? 2 : 3, w), warmed);
  }
  const fc = buildChainedField(specFor(a.band, a.window), warmed);
  assert.deepEqual(fc.data, fa.data, "a warmed cache changed the terrain for the same window");
});

test("the detail level never exceeds what buildHeightfield accepts (#398)", () => {
  // detailForWindow is written for any depth, but #396 caps the offsets table at MAX_DETAIL and throws past it, so the clamp is what keeps a deep window (the Farther Interior's, #395) from throwing rather than drawing.
  const tiny = { u0: 0.5, v0: 0.5, u1: 0.5 + 2 ** -12, v1: 0.5 + 2 ** -12 };
  assert.equal(detailForWindow(tiny), MAX_DETAIL, "a very small window must clamp to the table's headroom");
  assert.doesNotThrow(() =>
    buildHeightfield({
      seed: SEED,
      gridW: 16,
      gridH: 12,
      mapType: recipe.mapType,
      window: tiny,
      worldAspect: WORLD_ASPECT,
      detail: detailForWindow(tiny),
    }),
  );
});

test("the chain protects every link: no land sinks, band to band and end to end (#398)", () => {
  const cache = createChainCache();
  const target = lodWindowFor(0.5, 0.4375, 0.125);
  const fields = new Map<number, { window: UvWindow; field: ReturnType<typeof buildChainedField> }>();
  let win = target;
  for (let band = 3; band >= 1; band--) {
    fields.set(band, { window: win, field: buildChainedField(specFor(band, win), cache) });
    win = canonicalParent(win);
  }
  fields.set(0, { window: FULL_WINDOW, field: buildChainedField(specFor(0, FULL_WINDOW), cache) });

  let checkedLinks = 0;
  let sinkableSeen = 0;
  for (let band = 1; band <= 3; band++) {
    const child = fields.get(band) as { window: UvWindow; field: ReturnType<typeof buildChainedField> };
    const parent = fields.get(band - 1) as { window: UvWindow; field: ReturnType<typeof buildChainedField> };
    const surface = parentSurfaceOnWindow(
      parent.field,
      parent.window,
      child.window,
      child.field.w,
      child.field.h,
    );
    const bare = buildHeightfield({
      seed: SEED,
      gridW: child.field.w,
      gridH: child.field.h,
      mapType: recipe.mapType,
      window: child.window,
      worldAspect: WORLD_ASPECT,
      detail: detailForWindow(child.window),
    });
    for (let i = 0; i < surface.data.length; i++) {
      const pv = surface.data[i] as number;
      if (!Number.isFinite(pv) || pv <= SEA) continue;
      checkedLinks++;
      if ((bare.data[i] as number) <= SEA) sinkableSeen++;
      assert.ok(
        (child.field.data[i] as number) > SEA,
        `band ${band - 1} land sank at band ${band}, cell ${i % child.field.w},${(i / child.field.w) | 0}`,
      );
    }
  }
  assert.ok(checkedLinks > 10000, `too few parent-land cells checked: ${checkedLinks}`);
  assert.ok(sinkableSeen > 0, `no cell would have drowned unprotected, the guard proves nothing: ${sinkableSeen}`);

  // transitive: band 0 land is still land at band 3, through two intermediate links
  const deep = fields.get(3) as { window: UvWindow; field: ReturnType<typeof buildChainedField> };
  const fromWorld = parentSurfaceOnWindow(world, FULL_WINDOW, deep.window, deep.field.w, deep.field.h);
  let transitive = 0;
  for (let i = 0; i < fromWorld.data.length; i++) {
    const pv = fromWorld.data[i] as number;
    if (!Number.isFinite(pv) || pv <= SEA) continue;
    transitive++;
    assert.ok((deep.field.data[i] as number) > SEA, `world-chart land sank by band 3 at cell ${i}`);
  }
  assert.ok(transitive > 3000, `too few world-land cells checked transitively: ${transitive}`);
});

test("the chain never fuses landmasses, at any link (#398)", () => {
  const cache = createChainCache();
  const target = lodWindowFor(0.5, 0.4375, 0.125);
  const windows: UvWindow[] = [target];
  for (let band = 3; band >= 1; band--) {
    windows.unshift(canonicalParent(windows[0] as UvWindow));
  }
  for (let band = 1; band <= 3; band++) {
    const childWindow = windows[band] as UvWindow;
    const parentWindow = windows[band - 1] as UvWindow;
    const child = buildChainedField(specFor(band, childWindow), cache);
    const parent = buildChainedField(specFor(band - 1, parentWindow), cache);
    const surface = parentSurfaceOnWindow(parent, parentWindow, childWindow, child.w, child.h);
    const { ids: pIds } = labelLandmasses(surface, SEA);
    const { ids: cIds } = labelLandmasses(child, SEA);
    const owner = new Map<number, number>();
    let fused = 0;
    for (let i = 0; i < pIds.length; i++) {
      const pid = pIds[i] as number;
      const cid = cIds[i] as number;
      if (pid === -1 || cid === -1) continue;
      const prev = owner.get(cid);
      if (prev === undefined) owner.set(cid, pid);
      else if (prev !== pid) fused++;
    }
    assert.equal(fused, 0, `band ${band - 1} landmasses fused at band ${band}`);
  }
});

test("the cache serves siblings and never confuses two detail levels (#398)", () => {
  const cache = createChainCache();
  const win = lodWindowFor(0.5, 0.4375, 0.125);
  const first = buildChainedField(specFor(3, win), cache);
  const missesAfterFirst = cache.misses;
  const second = buildChainedField(specFor(3, win), cache);
  assert.deepEqual(second.data, first.data, "a cache hit returned a different field");
  assert.ok(cache.hits > 0, "the second build of the same spec never hit the cache");
  assert.equal(cache.misses, missesAfterFirst, "the second build recomputed something");

  // A true sibling shares the canonical parent, which is the whole point of caching them: the parent lattice steps twice as coarsely as the child's, so merely adjacent windows often do NOT share one.
  const sibling = lodWindowFor(0.4375 + 0.125 / 2, 0.359375 + 0.125 / 2, 0.125);
  assert.ok(
    windowsEqual(canonicalParent(sibling), canonicalParent(win)),
    "the fixture sibling does not actually share the canonical parent",
  );
  assert.ok(!windowsEqual(sibling, win), "the fixture sibling is the same window");
  const missesBeforeSibling = cache.misses;
  buildChainedField(specFor(3, sibling), cache);
  assert.equal(
    cache.misses - missesBeforeSibling,
    1,
    "a sibling sharing its parent must build only itself",
  );

  const a = chainCacheKey(specFor(3, win));
  const b = chainCacheKey(specFor(2, win));
  assert.notEqual(a, b, "two different detail levels share one cache key");
  const c = chainCacheKey(specFor(3, win, { coastWarp: 1 }));
  assert.notEqual(a, c, "a different coast warp shares one cache key");
  const d = chainCacheKey(specFor(3, sibling));
  assert.notEqual(a, d, "two different windows share one cache key");
});
