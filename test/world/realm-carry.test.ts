import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { createChainCache, type ChainCache } from "../../src/world/detail-chain.ts";
import { growRealmLabels, regionRealmBorders, regionRealmRings, REALM_REACH_CAP } from "../../src/world/realm-carry.ts";
import type { RealmRings } from "../../src/world/realm-carry.ts";
import { nearestParentCells } from "../../src/world/region-parent.ts";
import type { World } from "../../src/world/types.ts";

const worlds = new Map<number, World>();
const worldFor = (seed: number): World => {
  let w = worlds.get(seed);
  if (!w) {
    w = generateWorld(defaultRecipe(seed));
    worlds.set(seed, w);
  }
  return w;
};

const isSeaOf = (world: World): ((i: number) => boolean) => {
  const { data } = world.elev;
  const sl = world.seaLevel;
  return (i) => (data[i] as number) <= sl;
};

const capitalWindow = (world: World, band: number) => {
  const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
  const size = LOD_BANDS[band]!.sizeUV;
  const q = quantizeCenter(capital.x / (world.recipe.gridW - 1), capital.y / (world.recipe.gridH - 1), size);
  return lodWindowFor(q.cx, q.cy, size);
};

test("growth claims nearby sea for the nearest realm, and only sea (#423)", () => {
  const world = worldFor(42);
  const { w, h } = world.elev;
  const isSea = isSeaOf(world);
  const labels = world.realms.labels;
  const grown = growRealmLabels(labels, isSea, w, h);

  let grewSea = 0;
  for (let i = 0; i < grown.length; i++) {
    if (labels[i]! >= 0) {
      assert.equal(grown[i], labels[i], `labelled cell ${i} moved: the flood must never relabel land`);
      continue;
    }
    if (grown[i]! >= 0) {
      assert.ok(isSea(i), `cell ${i} is realm-less parent LAND but was grown into; growth is sea-only`);
      grewSea++;
    }
  }
  assert.ok(grewSea > 0, "no sea cell was claimed at all: the growth did not run");
});

test("growth stops at the reach cap (#423)", () => {
  // Synthetic: one labelled cell on a 64x1 strip of sea. Reach must be exactly the cap.
  const w = 64;
  const h = 3;
  const labels = new Int16Array(w * h).fill(-1);
  labels[0 + 1 * w] = 0;
  const isSea = (i: number): boolean => i !== 0 + 1 * w;
  const grown = growRealmLabels(labels, isSea, w, h);
  assert.equal(grown[REALM_REACH_CAP + 1 * w], 0, `cell at the cap distance should be claimed`);
  assert.equal(
    grown[REALM_REACH_CAP + 1 + 1 * w],
    -1,
    `cell one past the cap (${REALM_REACH_CAP}) should stay unclaimed`,
  );
});

test("a realm-less island's land stays bare even inside another realm's reach (#423)", () => {
  // Synthetic: realm 0 land at x=0..1, sea at x=2..4, realm-less LAND at x=5..6, sea beyond.
  const w = 16;
  const h = 3;
  const labels = new Int16Array(w * h).fill(-1);
  const land = new Set<number>();
  for (let y = 0; y < h; y++) {
    for (const x of [0, 1]) {
      labels[x + y * w] = 0;
      land.add(x + y * w);
    }
    for (const x of [5, 6]) land.add(x + y * w);
  }
  const grown = growRealmLabels(labels, (i) => !land.has(i), w, h);
  for (let y = 0; y < h; y++) {
    for (const x of [5, 6]) {
      assert.equal(
        grown[x + y * w],
        -1,
        `realm-less island cell (${x},${y}) was tinted into realm ${grown[x + y * w]}`,
      );
    }
    assert.ok(grown[3 + y * w]! >= 0, "the strait sea between them should be claimed");
  }
});

test("generateRegionWorld carries labels, names, rings and the parent label field (#423)", () => {
  const world = worldFor(42);
  const region = generateRegionWorld(world, {
    window: capitalWindow(world, 1),
    gridW: 320,
    gridH: 240,
    title: "t",
  });
  let labelled = 0;
  for (const v of region.realms.labels) if (v >= 0) labelled++;
  assert.ok(labelled > 0, "the region's realm labels should carry the projected parent labels");
  assert.deepEqual(region.names.realms, world.names.realms, "the region should carry the parent's realm names");
  assert.ok(
    region.region?.realmRings && region.region.realmRings.length > 0,
    "the region should carry mapped realm rings",
  );
  assert.ok(region.region.realmBorders, "the region should carry its border chains");
  assert.ok(region.region.parentRealmLabels, "the region should carry the parent's label field for tint assignment");
  assert.equal(region.region.worldGridH, world.recipe.gridH, "the parent grid height rides beside worldGridW");
});

/** Even-odd scanline rasterization of one realm's rings onto the region grid. */
const rasterize = (
  rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>>,
  gridW: number,
  gridH: number,
): Uint8Array => {
  const mask = new Uint8Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    const xs: number[] = [];
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i]!;
        const [x2, y2] = ring[(i + 1) % ring.length]!;
        if (y1 <= gy === y2 <= gy) continue;
        xs.push(x1 + ((gy - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.ceil(xs[k]! - 1e-9);
      const to = Math.floor(xs[k + 1]! + 1e-9);
      for (let gx = Math.max(0, from); gx <= Math.min(gridW - 1, to); gx++) {
        mask[gx + gy * gridW] = 1;
      }
    }
  }
  return mask;
};

const borderWindow = (world: World, band: number) => {
  const { w, h } = world.elev;
  const labels = world.realms.labels;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x + 1 < w; x++) {
      const a = labels[x + y * w] as number;
      const b = labels[x + 1 + y * w] as number;
      if (a >= 0 && b >= 0 && a !== b) {
        const size = LOD_BANDS[band]!.sizeUV;
        const q = quantizeCenter(x / (w - 1), y / (h - 1), size);
        return lodWindowFor(q.cx, q.cy, size);
      }
    }
  }
  return null; // island realms: no land border exists, so there is no border window to sweep
};

const tintAt = (
  masks: ReadonlyMap<number, ArrayLike<number>>,
  i: number,
  owner: number,
): { insideOwn: boolean; insideOther: boolean } => {
  let insideOwn = false;
  let insideOther = false;
  for (const [realm, mask] of masks) {
    if (mask[i] !== 1) continue;
    if (realm === owner) insideOwn = true;
    else insideOther = true;
  }
  return { insideOwn, insideOther };
};

const borderWindowOfSize = (world: World, size: number) => {
  const { w, h } = world.elev;
  const labels = world.realms.labels;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x + 1 < w; x++) {
      const a = labels[x + y * w] as number;
      const b = labels[x + 1 + y * w] as number;
      if (a >= 0 && b >= 0 && a !== b) {
        const q = quantizeCenter(x / (w - 1), y / (h - 1), size);
        return lodWindowFor(q.cx, q.cy, size);
      }
    }
  }
  return null;
};

// Blind spot: a cell within the reach of the window frame counts as beside a change of owner, so a defect confined to the outer 4 cells of the frame is not seen; the rings are pinned to the frame by chaikinSmoothPinned, which errs toward a gap there going unnoticed, and the skeptic's probe found none in production.
const nearOwnerChange = (
  owner: Int16Array,
  gridW: number,
  gridH: number,
  gx: number,
  gy: number,
  reach: number,
): boolean => {
  const own = owner[gx + gy * gridW];
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) return true;
      if (owner[nx + ny * gridW] !== own) return true;
    }
  }
  return false;
};

// Three passes of a three-by-three box blur move an iso at most 3 cells and two Chaikin passes less than 1.
const SEAM_REACH = 4;

const FOUR = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

// The 1.5 is half a cell from a boundary edge to a cell centre, plus the one-cell simplification.
const strayBorderVertices = (
  borders: ReadonlyArray<ReadonlyArray<readonly [number, number]>>,
  labels: Int16Array,
  gridW: number,
  gridH: number,
): number => {
  const onBoundary = (x: number, y: number): boolean => {
    if (x < 0 || x >= gridW || y < 0 || y >= gridH) return false;
    const a = labels[x + y * gridW] as number;
    if (a < 0) return false;
    return FOUR.some(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) return false;
      const b = labels[nx + ny * gridW] as number;
      return b >= 0 && b !== a;
    });
  };
  const nearBoundary = (vx: number, vy: number): boolean => {
    for (let cy = Math.floor(vy - 1.5); cy <= Math.ceil(vy + 1.5); cy++) {
      for (let cx = Math.floor(vx - 1.5); cx <= Math.ceil(vx + 1.5); cx++) {
        if ((cx - vx) ** 2 + (cy - vy) ** 2 <= 1.5 * 1.5 && onBoundary(cx, cy)) return true;
      }
    }
    return false;
  };
  let strays = 0;
  for (const chain of borders) {
    for (const [vx, vy] of chain) {
      if (vx < 2 || vy < 2 || vx > gridW - 3 || vy > gridH - 3) continue;
      if (!nearBoundary(vx, vy)) strays++;
    }
  }
  return strays;
};

const collarSweep = (
  seed: number,
  name: string,
  window: NonNullable<ReturnType<typeof borderWindow>>,
  chainCache?: ChainCache,
) => {
  const world = worldFor(seed);
  const gridW = 320;
  const gridH = 240;
  const spec = { window, gridW, gridH, title: "t" };
  const region = generateRegionWorld(world, chainCache ? { ...spec, detail: true, chainCache } : spec);
  const rings: RealmRings = region.region?.realmRings ?? [];
  const masks = new Map(rings.map((r) => [r.realm, rasterize(r.rings, gridW, gridH)]));
  assert.ok(masks.size > 0, `${name}: the window must carry rings or the sweep proves nothing`);
  const pw = world.recipe.gridW;
  const ph = world.recipe.gridH;
  const isSea = isSeaOf(world);
  // The oracle's cap is the literal ratified 8, never the exported constant, or the guard moves with a nerfed production cap.
  const grown = growRealmLabels(world.realms.labels, isSea, pw, ph, 8);
  const parentOf = nearestParentCells(pw, ph, window, gridW, gridH);
  const isLand = (i: number): boolean => (region.elev.data[i] as number) > region.seaLevel;
  const owner = Int16Array.from(region.realms.labels, (l, i) =>
    isLand(i) ? l : (grown[parentOf[i] as number] as number),
  );

  let landCells = 0;
  let bare = 0;
  let interiorMiss = 0;
  let bareTinted = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const i = gx + gy * gridW;
      if (!isLand(i)) continue;
      landCells++;
      const o = owner[i] as number;
      const { insideOwn, insideOther } = tintAt(masks, i, o);
      if (o < 0) {
        if (insideOwn || insideOther) bareTinted++;
        continue;
      }
      if (insideOwn && !insideOther) continue;
      if (nearOwnerChange(owner, gridW, gridH, gx, gy, SEAM_REACH)) continue;
      if (!insideOwn && !insideOther && isSea(parentOf[i] as number)) bare++;
      else interiorMiss++;
    }
  }
  assert.ok(landCells > 0, `${name}: the window must hold land or the sweep proves nothing`);
  const strays = strayBorderVertices(region.region?.realmBorders ?? [], region.realms.labels, gridW, gridH);
  return { bare, interiorMiss, bareTinted, strays };
};

type SweepWindow = [number, string, NonNullable<ReturnType<typeof borderWindow>>, ChainCache?];

function sweepWindows(): { windows: SweepWindow[]; borderWindows: number } {
  const windows: SweepWindow[] = [];
  let borderWindows = 0;
  for (const seed of [42, 7, 2, 15, 23]) {
    const world = worldFor(seed);
    const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
    windows.push([seed, "b1", capitalWindow(world, 1)]);
    const border = borderWindow(world, 3);
    if (border) {
      windows.push([seed, "b3border", border]);
      borderWindows++;
    }
    windows.push([seed, "atlas", windowAround(world, capital, 0.38)]);
  }
  windows.push([42, "b2border", borderWindow(worldFor(42), 2)!]);
  windows.push([15, "b2", capitalWindow(worldFor(15), 2)]);
  const cache = createChainCache(16);
  windows.push([42, "b4border", borderWindowOfSize(worldFor(42), 1 / 16)!, cache]);
  windows.push([42, "b5border", borderWindowOfSize(worldFor(42), 1 / 32)!, cache]);
  const world42 = worldFor(42);
  const capital42 = world42.settlements.find((s) => s.kind === "capital")!;
  const q = quantizeCenter(capital42.x / (world42.recipe.gridW - 1), capital42.y / (world42.recipe.gridH - 1), 1 / 32);
  windows.push([42, "b5capital", lodWindowFor(q.cx, q.cy, 1 / 32), cache]);
  windows.push([2, "enclave", { u0: 0.375, v0: 0.5, u1: 0.625, v1: 0.75 }, cache]);
  return { windows, borderWindows };
}

test("the collar guard: the tint holds every refined label and every border stands on a change of label (Issue #953)", () => {
  const { windows, borderWindows } = sweepWindows();
  assert.ok(
    borderWindows >= 3,
    "the sweep must cover several genuine land-border windows or the seam claims are unexercised",
  );

  for (const [seed, name, window, chainCache] of windows) {
    const label = `seed ${seed} ${name}`;
    const { bare, interiorMiss, bareTinted, strays } = collarSweep(seed, label, window, chainCache);
    assert.equal(
      bare,
      0,
      `${label}: ${bare} land cells on parent-sea ground carry NO tint at all; this is the shoreline collar the owned water exists to prevent`,
    );
    assert.equal(
      interiorMiss,
      0,
      `${label}: ${interiorMiss} cells away from any change of owner disagree with the rings; the tint is not drawn from the refined labels`,
    );
    assert.equal(bareTinted, 0, `${label}: ${bareTinted} realm-less land cells are tinted (category B must stay bare)`);
    assert.equal(
      strays,
      0,
      `${label}: ${strays} border vertices stand further than 1.5 cells from any change of label`,
    );
  }
});

test("a realm holding the whole frame is tinted to the frame, its enclaves cut out (Issue #953)", () => {
  const w = 20;
  const h = 16;
  const whole = regionRealmRings(new Int16Array(w * h), w, h);
  assert.equal(whole.length, 1, "one realm");
  assert.deepEqual(whole[0]!.rings, [
    [
      [0, 0],
      [19, 0],
      [19, 15],
      [0, 15],
    ],
  ]);

  const owner = new Int16Array(w * h);
  for (let y = 4; y <= 11; y++) for (let x = 6; x <= 13; x++) owner[x + y * w] = 1;
  const rings = regionRealmRings(owner, w, h);
  const outer = rings.find((r) => r.realm === 0)!;
  const inner = rings.find((r) => r.realm === 1)!;
  assert.equal(outer.rings.length, 2, "the frame and the enclave's contour");
  assert.deepEqual(outer.rings[0], [
    [0, 0],
    [19, 0],
    [19, 15],
    [0, 15],
  ]);
  const covers = (
    r: { rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>> },
    x: number,
    y: number,
  ): boolean => rasterize(r.rings, w, h)[x + y * w] === 1;
  assert.ok(covers(outer, 2, 2), "realm 0 covers the ground round the enclave");
  assert.ok(!covers(outer, 9, 7), "realm 0 does not cover the enclave");
  assert.ok(covers(inner, 9, 7), "realm 1 covers its enclave");
});

test("a staircase border is drawn as the line it steps along (Issue #953)", () => {
  const n = 40;
  const labels = new Int16Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) labels[x + y * n] = x + y < n ? 0 : 1;
  const chains = regionRealmBorders(labels, n, n);
  assert.equal(chains.length, 1, "one boundary, one chain");
  const chain = chains[0]!;
  let turning = 0;
  for (let i = 1; i + 1 < chain.length; i++) {
    const [ax, ay] = chain[i - 1]!;
    const [bx, by] = chain[i]!;
    const [cx, cy] = chain[i + 1]!;
    let turn = Math.atan2(cy - by, cx - bx) - Math.atan2(by - ay, bx - ax);
    while (turn > Math.PI) turn -= 2 * Math.PI;
    while (turn < -Math.PI) turn += 2 * Math.PI;
    turning += Math.abs(turn);
  }
  const degrees = (turning * 180) / Math.PI;
  assert.ok(degrees < 5, `the staircase turns ${degrees.toFixed(0)} degrees in total`);
});
