import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ancestorWindows,
  buildChainedField,
  canonicalParent,
  chainCacheKey,
  createChainCache,
  detailForWindow,
  maxOfSurfaces,
  type ChainSpec,
} from "../../src/world/detail-chain.ts";
import { fieldFrom, type Field } from "../../src/core/grid.ts";
import { FULL_WINDOW, LOD_BANDS, decideSettle, lodWindowFor } from "../../src/world/lod.ts";
import { buildHeightfield, type UvWindow } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { floorToParent, parentCellsOnWindow, parentSurfaceOnWindow, rejectBridges } from "../../src/terrain/detail-guarantees.ts";
import { SEED, recipe, WORLD_ASPECT, windowsEqual } from "../../test-support/detail-chain-fixtures.ts";

const world = buildHeightfield({ seed: SEED, gridW: 320, gridH: 240, mapType: recipe.mapType });
const SEA = pickSeaLevel(world, recipe.landFraction);

/** deepEqual on a 76800-cell Float64Array spends minutes rendering its diff before it can fail, so byte-identity reports the first differing cell instead. */
function assertSameField(actual: Float64Array, expected: Float64Array, message: string): void {
  assert.equal(actual.length, expected.length, `${message}: field sizes differ`);
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      assert.fail(`${message}: first difference at cell ${i} (${actual[i]} vs ${expected[i]})`);
    }
  }
}

function specFor(window: UvWindow, over: Partial<ChainSpec> = {}): ChainSpec {
  const b = LOD_BANDS[0] as (typeof LOD_BANDS)[number];
  return {
    seed: SEED,
    mapType: recipe.mapType,
    window,
    gridW: b.gridW,
    gridH: b.gridH,
    worldAspect: WORLD_ASPECT,
    seaLevel: SEA,
    ...over,
  };
}

function fusedCells(coarse: Field, fine: Field, sea: number = SEA): number {
  const { ids: pIds } = labelLandmasses(coarse, sea);
  const { ids: cIds } = labelLandmasses(fine, sea);
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
  return fused;
}

function bareFieldFor(window: UvWindow, gridW: number, gridH: number): Field {
  return buildHeightfield({
    seed: SEED,
    gridW,
    gridH,
    mapType: recipe.mapType,
    window,
    worldAspect: WORLD_ASPECT,
    detail: detailForWindow(window),
  });
}

test("band 0 of the chain IS the world field, so the chain anchors on the golden (#398)", () => {
  const chained = buildChainedField(specFor(FULL_WINDOW));
  assertSameField(chained.data, world.data, "the chain's band 0 diverged from buildHeightfield's world field");
});

type Camera = { cx: number; cy: number; k: number };

function walkRoute(route: ReadonlyArray<Camera>): Array<{ band: number; window: UvWindow }> {
  let band = 0;
  let window: UvWindow = FULL_WINDOW;
  const visited: Array<{ band: number; window: UvWindow }> = [];
  for (const camera of route) {
    const d = decideSettle({ camera, currentWindow: window, currentBand: band });
    if (d.action === "region") {
      band = d.band;
      window = d.window;
    } else if (d.action === "world") {
      band = 0;
      window = FULL_WINDOW;
    }
    visited.push({ band, window });
  }
  return visited;
}

function cellsDifferingFromRoutedParent(endA: UvWindow, routedParent: UvWindow, fa: ReturnType<typeof buildChainedField>): number {
  const bare = bareFieldFor(endA, fa.w, fa.h);
  const routedSurface = parentSurfaceOnWindow(
    buildChainedField(specFor(routedParent)),
    routedParent,
    endA,
    fa.w,
    fa.h,
  );
  const routedField = rejectBridges(routedSurface, routedSurface, floorToParent(bare, routedSurface), SEA);
  let differing = 0;
  for (let i = 0; i < routedField.data.length; i++) {
    if (routedField.data[i] !== fa.data[i]) differing++;
  }
  return differing;
}

test("two zoom routes to the same window produce a byte-identical field (#398)", () => {
  // Same environment, so this comparison is exact by design; the float-drift rule bans byte comparison ACROSS environments only.
  const target = { cx: 0.53, cy: 0.42, k: 8 };
  const routeA = [{ cx: 0.53, cy: 0.42, k: 1 }, { cx: 0.53, cy: 0.42, k: 2.6 }, { cx: 0.53, cy: 0.42, k: 5.2 }, target];
  const routeB = [{ cx: 0.12, cy: 0.87, k: 1 }, { cx: 0.12, cy: 0.87, k: 6.5 }, { cx: 0.30, cy: 0.60, k: 6.5 }, target];
  const a = walkRoute(routeA);
  const b = walkRoute(routeB);
  assert.equal(a.at(-1)?.band, 3, "route A did not land at band 3");
  const endA = a.at(-1)?.window as UvWindow;
  const endB = b.at(-1)?.window as UvWindow;
  assert.ok(windowsEqual(endA, endB), "the two routes did not land on the same window");

  // The routes reach the window through different intermediate windows: the hazard is a parent taken from where the camera came from.
  const routedParent = b.at(-2)?.window as UvWindow;
  const canonical = canonicalParent(endA);
  assert.ok(
    !windowsEqual(routedParent, canonical),
    "the fixture routes share their previous window, so a path-derived parent could not differ",
  );

  const fa = buildChainedField(specFor(endA));
  const fb = buildChainedField(specFor(endB), createChainCache());
  assertSameField(fb.data, fa.data, "the same window drew different terrain by route");

  // What a path-derived parent would have drawn, off route B's previous window; it must differ or the guard above proves nothing.
  const differing = cellsDifferingFromRoutedParent(endA, routedParent, fa);
  assert.ok(
    differing > 0,
    "a parent taken from the camera path drew the identical field, so path-independence is untestable here",
  );

  const warmed = createChainCache();
  for (const w of [lodWindowFor(0.125, 0.875, 0.125), lodWindowFor(0.375, 0.125, 0.25)]) {
    buildChainedField(specFor(w), warmed);
  }
  const fc = buildChainedField(specFor(endA), warmed);
  assertSameField(fc.data, fa.data, "a warmed cache changed the terrain for the same window");
});

test("the atlas window chains, at the depth its own size implies (#398)", () => {
  // The atlas plate window (windowAround(world, anchor, 0.38) in src/atlas/compose.ts) is not a band, so only the window itself says how deep its ancestry runs.
  const atlas = lodWindowFor(0.5, 0.5, 0.38);
  const ancestry = ancestorWindows(atlas);
  assert.equal(ancestry.length, 2, "a 0.38 window doubles to 0.76 and then to the full sheet");
  assert.ok(windowsEqual(ancestry[1] as UvWindow, FULL_WINDOW), "the ancestry must end at the full window");

  const field = buildChainedField(specFor(atlas));
  const fromWorld = parentSurfaceOnWindow(world, FULL_WINDOW, atlas, field.w, field.h);
  const worldCells = parentCellsOnWindow(world, FULL_WINDOW, atlas, field.w, field.h);
  let land = 0;
  for (let i = 0; i < fromWorld.data.length; i++) {
    const pv = fromWorld.data[i] as number;
    if (!Number.isFinite(pv) || pv <= SEA) continue;
    if (!((worldCells.data[i] as number) > SEA)) continue;
    land++;
    assert.ok((field.data[i] as number) > SEA, `world-chart land sank on the atlas window at cell ${i}`);
  }
  assert.ok(land > 10000, `too little land checked on the atlas window: ${land}`);
});

test("the chain protects every link: no land sinks, band to band and end to end (#398, narrowed by #443)", () => {
  const cache = createChainCache();
  const target = lodWindowFor(0.5, 0.4375, 0.125);
  const chain = [target, ...ancestorWindows(target)];
  assert.equal(chain.length, 4, "a band-3 window must carry three ancestors");

  let checkedLinks = 0;
  let sinkableSeen = 0;
  for (let link = 0; link < chain.length - 1; link++) {
    const childWindow = chain[link] as UvWindow;
    const parentWindow = chain[link + 1] as UvWindow;
    const child = buildChainedField(specFor(childWindow), cache);
    const parent = buildChainedField(specFor(parentWindow), cache);
    const surface = parentSurfaceOnWindow(parent, parentWindow, childWindow, child.w, child.h);
    const parentCells = parentCellsOnWindow(parent, parentWindow, childWindow, child.w, child.h);
    const bare = bareFieldFor(childWindow, child.w, child.h);
    for (let i = 0; i < surface.data.length; i++) {
      const pv = surface.data[i] as number;
      if (!Number.isFinite(pv) || pv <= SEA) continue;
      if (!((parentCells.data[i] as number) > SEA)) continue;
      checkedLinks++;
      if ((bare.data[i] as number) <= SEA) sinkableSeen++;
      assert.ok(
        (child.data[i] as number) > SEA,
        `parent land sank one link down at cell ${i % child.w},${(i / child.w) | 0}`,
      );
    }
  }
  assert.ok(checkedLinks > 10000, `too few parent-land cells checked: ${checkedLinks}`);
  assert.ok(sinkableSeen > 0, `no cell would have drowned unprotected, the guard proves nothing: ${sinkableSeen}`);

  const deep = buildChainedField(specFor(target), cache);
  const fromWorld = parentSurfaceOnWindow(world, FULL_WINDOW, target, deep.w, deep.h);
  const worldCells = parentCellsOnWindow(world, FULL_WINDOW, target, deep.w, deep.h);
  let transitive = 0;
  for (let i = 0; i < fromWorld.data.length; i++) {
    const pv = fromWorld.data[i] as number;
    if (!Number.isFinite(pv) || pv <= SEA) continue;
    if (!((worldCells.data[i] as number) > SEA)) continue;
    transitive++;
    assert.ok((deep.data[i] as number) > SEA, `world-chart land sank by band 3 at cell ${i}`);
  }
  assert.ok(transitive > 3000, `too few world-land cells checked transitively: ${transitive}`);
});

test("the chain never fuses two landmasses of its own coarse reference (#398)", () => {
  // The ungated max, the weaker claim; the world chart's own partition is guarded in detail-chain-world.test.ts.
  const seed = 2;
  const archipelago = defaultRecipe(seed);
  const parentWorld = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: archipelago.mapType });
  const sea = pickSeaLevel(parentWorld, archipelago.landFraction);
  const spec = (window: UvWindow): ChainSpec => ({
    seed,
    mapType: archipelago.mapType,
    window,
    gridW: 320,
    gridH: 240,
    worldAspect: WORLD_ASPECT,
    seaLevel: sea,
  });
  const cache = createChainCache();
  const target = lodWindowFor(0.875, 0.25, 0.125);
  const chain = [target, ...ancestorWindows(target)];

  let controlFusions = 0;
  for (let link = 0; link < chain.length - 1; link++) {
    const childWindow = chain[link] as UvWindow;
    const child = buildChainedField(spec(childWindow), cache);
    const surfaces = ancestorWindows(childWindow).map((a) =>
      parentSurfaceOnWindow(buildChainedField(spec(a), cache), a, childWindow, child.w, child.h),
    );
    const coarse = maxOfSurfaces(surfaces, child.w, child.h);
    assert.equal(fusedCells(coarse, child, sea), 0, "the chain fused two landmasses of its coarse reference");
    const bare = buildHeightfield({
      seed,
      gridW: child.w,
      gridH: child.h,
      mapType: archipelago.mapType,
      window: childWindow,
      worldAspect: WORLD_ASPECT,
      detail: detailForWindow(childWindow),
    });
    controlFusions += fusedCells(coarse, floorToParent(bare, coarse), sea);
  }
  assert.ok(
    controlFusions > 100,
    `without bridge rejection this fixture barely fuses, so the guard proves nothing: ${controlFusions}`,
  );
});

test("the cache serves siblings and never confuses two detail levels (#398)", () => {
  const cache = createChainCache();
  const win = lodWindowFor(0.5, 0.4375, 0.125);
  const first = buildChainedField(specFor(win), cache);
  const missesAfterFirst = cache.misses;
  const second = buildChainedField(specFor(win), cache);
  assertSameField(second.data, first.data, "a cache hit returned a different field");
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
  buildChainedField(specFor(sibling), cache);
  assert.equal(
    cache.misses - missesBeforeSibling,
    1,
    "a sibling sharing its parent must build only itself",
  );

  const a = chainCacheKey(specFor(win));
  const coarser = lodWindowFor(0.5, 0.4375, 0.25);
  assert.notEqual(
    detailForWindow(coarser),
    detailForWindow(win),
    "the fixture windows must actually differ in detail level",
  );
  assert.notEqual(chainCacheKey(specFor(coarser)), a, "two detail levels share one cache key");
  assert.notEqual(
    chainCacheKey(specFor(win, { coastWarp: 1 })),
    a,
    "a different coast warp shares one cache key",
  );
  assert.notEqual(chainCacheKey(specFor(sibling)), a, "two windows of one size share a cache key");
  assert.notEqual(
    chainCacheKey(specFor(win, { gridW: 160, gridH: 120 })),
    a,
    "two grids share one cache key",
  );
});

test("maxOfSurfaces takes the highest ancestor and abstains where none covers (#398)", () => {
  const a = fieldFrom(2, 2, Float64Array.from([0.1, 0.9, NaN, NaN]));
  const b = fieldFrom(2, 2, Float64Array.from([0.5, 0.2, 0.7, NaN]));
  const out = maxOfSurfaces([a, b], 2, 2);
  assert.equal(out.at(0, 0), 0.5, "the higher ancestor must win");
  assert.equal(out.at(1, 0), 0.9, "the higher ancestor must win whichever surface it came from");
  assert.equal(out.at(0, 1), 0.7, "a lone covering ancestor must win over an abstaining one");
  assert.ok(Number.isNaN(out.at(1, 1)), "a cell no ancestor covers must stay NaN so the floor leaves it alone");
});

test("the cache evicts by capacity without corrupting what it still holds (#398)", () => {
  const cache = createChainCache(2);
  const fields = [0, 1, 2].map((i) => fieldFrom(1, 1, Float64Array.from([i])));
  fields.forEach((f, i) => cache.set(`k${i}`, f));
  assert.equal(cache.get("k0"), undefined, "the oldest entry must be evicted past capacity");
  assert.equal(cache.get("k2")?.at(0, 0), 2, "the newest entry must survive");
  assert.equal(cache.get("k1")?.at(0, 0), 1, "a surviving entry must keep its own field");
});

test("an uncached call does not rebuild each ancestor's own ancestry (#398)", () => {
  // Without a shared cache the recursion costs 2^depth field builds instead of depth, roughly doubling the epic's accepted band-3 cost; the default cache is what keeps it linear.
  const win = lodWindowFor(0.5, 0.4375, 0.125);
  const cache = createChainCache();
  buildChainedField(specFor(win), cache);
  assert.equal(cache.misses, 4, "a band-3 chain must build exactly four fields: itself and three ancestors");
});
