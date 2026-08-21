import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import {
  growRealmLabels,
  mapRingsToWindow,
  realmCarryRings,
  REALM_REACH_CAP,
} from "../../src/world/realm-carry.ts";
import type { RealmRings } from "../../src/world/realm-carry.ts";
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
  const q = quantizeCenter(
    capital.x / (world.recipe.gridW - 1),
    capital.y / (world.recipe.gridH - 1),
    size,
  );
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
      assert.equal(grown[x + y * w], -1, `realm-less island cell (${x},${y}) was tinted into realm ${grown[x + y * w]}`);
    }
    assert.ok(grown[3 + y * w]! >= 0, "the strait sea between them should be claimed");
  }
});

test("the parent rings and their window mapping are deterministic and non-empty (#423)", () => {
  const world = worldFor(42);
  const a = realmCarryRings(world);
  // A fresh world, not the cached one: realmCarryRings memoizes per world object, so same-object comparison is a tautology (the skeptic's finding 2).
  const b = realmCarryRings(generateWorld(defaultRecipe(42)));
  assert.deepEqual(a, b, "two computations of the parent rings must be identical");
  assert.ok(a.length > 0, "seed 42 has 3 realms; the carry must produce rings");
  for (const { rings } of a) assert.ok(rings.length > 0, "every carried realm must have at least one ring");

  const window = capitalWindow(world, 1);
  const m1 = mapRingsToWindow(a, window, world.recipe.gridW, world.recipe.gridH, 320, 240);
  const m2 = mapRingsToWindow(b, window, world.recipe.gridW, world.recipe.gridH, 320, 240);
  assert.deepEqual(m1, m2, "the same window must map to identical rings, whatever path reached it");

  // The affine pinned exactly at the corners: a sub-cell offset otherwise hides inside the collar guard's seam-jitter tolerance (guard-prover finding).
  const pw = world.recipe.gridW;
  const ph = world.recipe.gridH;
  const cornerRing = [
    [window.u0 * (pw - 1), window.v0 * (ph - 1)],
    [window.u1 * (pw - 1), window.v0 * (ph - 1)],
    [window.u1 * (pw - 1), window.v1 * (ph - 1)],
    [window.u0 * (pw - 1), window.v1 * (ph - 1)],
  ] as const;
  const mapped = mapRingsToWindow([{ realm: 0, rings: [cornerRing] }], window, pw, ph, 320, 240)[0]!.rings[0]!;
  assert.ok(Math.abs(mapped[0]![0] - 0) < 1e-9 && Math.abs(mapped[0]![1] - 0) < 1e-9, `the window's origin corner must land on the region grid origin, got (${mapped[0]![0]}, ${mapped[0]![1]})`);
  assert.ok(Math.abs(mapped[2]![0] - 319) < 1e-9 && Math.abs(mapped[2]![1] - 239) < 1e-9, `the window's far corner must land on (319, 239), got (${mapped[2]![0]}, ${mapped[2]![1]})`);
});

test("the sea floor holds everywhere: a grown shore cell sits inside its realm's parent ring (#423)", () => {
  // Window-independent contract of the owned-sea iso floor: without it a thin grown finger's blur dips below the iso and the finer shoreline inside it goes bare, which the window sweep can miss when no sampled window sits over a finger (guard-prover finding).
  for (const seed of [42, 2, 15]) {
    const world = worldFor(seed);
    const { w, h } = world.elev;
    const isSea = isSeaOf(world);
    const grown = growRealmLabels(world.realms.labels, isSea, w, h, 8);
    const masks = new Map(realmCarryRings(world).map((r) => [r.realm, rasterize(r.rings, w, h)]));
    let shoreCells = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = x + y * w;
        if (grown[i]! < 0 || !isSea(i)) continue;
        let touchesOwnLand = false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const j = nx + ny * w;
          if (!isSea(j) && grown[j] === grown[i]) touchesOwnLand = true;
        }
        if (!touchesOwnLand) continue;
        shoreCells++;
        assert.equal(
          masks.get(grown[i] as number)?.[i],
          1,
          `seed ${seed}: grown shore cell (${x},${y}) of realm ${grown[i]} is outside its parent ring`,
        );
      }
    }
    assert.ok(shoreCells > 100, `seed ${seed}: the shore sweep covered only ${shoreCells} cells; the contract went unexercised`);
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
  assert.deepEqual(
    region.names.realms,
    world.names.realms,
    "the region should carry the parent's realm names",
  );
  assert.ok(region.region?.realmRings && region.region.realmRings.length > 0, "the region should carry mapped realm rings");
  assert.ok(region.region?.realmBorders, "the region should carry the parent's border chains");
  assert.ok(region.region?.parentRealmLabels, "the region should carry the parent's label field for tint assignment");
  assert.equal(region.region?.worldGridH, world.recipe.gridH, "the parent grid height rides beside worldGridW");
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

const collarSweep = (seed: number, name: string, window: NonNullable<ReturnType<typeof borderWindow>>) => {
  const world = worldFor(seed);
  const gridW = 320;
  const gridH = 240;
  const region = generateRegionWorld(world, { window, gridW, gridH, title: "t" });
  const rings: RealmRings = region.region?.realmRings ?? [];
  const masks = new Map(rings.map((r) => [r.realm, rasterize(r.rings, gridW, gridH)]));
  assert.ok(masks.size > 0, `${name}: the window must carry rings or the sweep proves nothing`);

  const pw = world.recipe.gridW;
  const ph = world.recipe.gridH;
  const isSea = isSeaOf(world);
  // The oracle's cap is the LITERAL ratified 8, never the exported constant, or the guard moves with a nerfed production cap (guard-prover finding).
  const grown = growRealmLabels(world.realms.labels, isSea, pw, ph, 8);
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;

  const boundaryAdjacent = (wx: number, wy: number, owner: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = wx + dx;
        const ny = wy + dy;
        if (nx < 0 || nx >= pw || ny < 0 || ny >= ph) return true;
        if (grown[nx + ny * pw] !== owner) return true;
      }
    }
    return false;
  };

  let landCells = 0;
  let bare = 0;
  let interiorMiss = 0;
  let seamJitter = 0;
  let bareTinted = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      if ((region.elev.data[gx + gy * gridW] as number) <= region.seaLevel) continue;
      landCells++;
      const wx = Math.round((window.u0 + (gx / (gridW - 1)) * du) * (pw - 1));
      const wy = Math.round((window.v0 + (gy / (gridH - 1)) * dv) * (ph - 1));
      const owner = grown[wx + wy * pw] as number;
      let insideOwn = false;
      let insideOther = false;
      for (const [realm, mask] of masks) {
        if (mask[gx + gy * gridW] !== 1) continue;
        if (realm === owner) insideOwn = true;
        else insideOther = true;
      }
      if (owner < 0) {
        if ((insideOwn || insideOther) && !isSea(wx + wy * pw)) bareTinted++;
        continue;
      }
      if (!insideOwn && !insideOther) {
        // Untinted owned land. Over parent sea this is THE collar; on labelled land the blur bites thin features exactly as the world sheet does, which is seam behavior when boundary-adjacent.
        if (isSea(wx + wy * pw)) bare++;
        else if (boundaryAdjacent(wx, wy, owner)) seamJitter++;
        else interiorMiss++;
      } else if (!insideOwn || insideOther) {
        // Tinted, but not exactly by the owner: within a cell of a boundary that is dash-covered seam jitter (misattribution across the sea divide is arbitrary ground the world sheet never rules on); in an interior it is a mapping or growth defect.
        if (boundaryAdjacent(wx, wy, owner)) seamJitter++;
        else interiorMiss++;
      }
    }
  }
  assert.ok(landCells > 0, `${name}: the window must hold land or the sweep proves nothing`);
  return { landCells, bare, interiorMiss, seamJitter, bareTinted };
};

test("the collar guard: no bare shoreline, no interior miss, jitter only on seams (#423)", () => {
  const windows: Array<[number, string, NonNullable<ReturnType<typeof borderWindow>>]> = [];
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
  assert.ok(borderWindows >= 3, "the sweep must cover several genuine land-border windows or the seam claims are unexercised");

  for (const [seed, name, window] of windows) {
    const label = `seed ${seed} ${name}`;
    const { landCells, bare, interiorMiss, seamJitter, bareTinted } = collarSweep(seed, label, window);
    assert.equal(bare, 0, `${label}: ${bare} land cells on parent-sea ground carry NO tint at all; this is the shoreline collar the growth exists to prevent`);
    assert.equal(interiorMiss, 0, `${label}: ${interiorMiss} cells in a realm's interior disagree with the rings; that is a mapping or growth defect, not seam jitter`);
    assert.equal(bareTinted, 0, `${label}: ${bareTinted} realm-less land cells are tinted (category B must stay bare)`);
    // Ceiling measured 2026-08-20 across this sweep: max 0.87% (seed 2, band-3 border window). A coarse backstop only: sub-cell affine drift hides under it, which is why the determinism test corner-pins the mapping exactly.
    assert.ok(seamJitter / landCells < 0.02, `${label}: seam jitter ${seamJitter}/${landCells} exceeds 2%; the rings have moved off the labels`);
  }
});
