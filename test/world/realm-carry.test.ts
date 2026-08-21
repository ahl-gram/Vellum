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
  const b = realmCarryRings(world);
  assert.deepEqual(a, b, "two computations of the parent rings must be identical");
  assert.ok(a.length > 0, "seed 42 has 3 realms; the carry must produce rings");
  for (const { rings } of a) assert.ok(rings.length > 0, "every carried realm must have at least one ring");

  const window = capitalWindow(world, 1);
  const m1 = mapRingsToWindow(a, window, world.recipe.gridW, world.recipe.gridH, 320, 240);
  const m2 = mapRingsToWindow(b, window, world.recipe.gridW, world.recipe.gridH, 320, 240);
  assert.deepEqual(m1, m2, "the same window must map to identical rings, whatever path reached it");
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

const collarSweep = (seed: number, band: number | "atlas") => {
  const world = worldFor(seed);
  const capital = world.settlements.find((s) => s.kind === "capital") ?? world.settlements[0]!;
  const window = band === "atlas" ? windowAround(world, capital, 0.38) : capitalWindow(world, band);
  const gridW = 320;
  const gridH = 240;
  const region = generateRegionWorld(world, { window, gridW, gridH, title: "t" });
  const rings: RealmRings = region.region?.realmRings ?? [];
  const masks = new Map(rings.map((r) => [r.realm, rasterize(r.rings, gridW, gridH)]));
  assert.ok(masks.size > 0, "the window must carry rings or the sweep proves nothing");

  const pw = world.recipe.gridW;
  const ph = world.recipe.gridH;
  const isSea = isSeaOf(world);
  // The oracle's cap is the LITERAL ratified 8, never the exported constant: a nerfed production cap must shrink the rings against a full-reach oracle, or the guard moves with the defect (the guard-prover's M4 hole).
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
  let collar = 0;
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
      const isBareParentLand = owner < 0 && !isSea(wx + wy * pw);
      for (const [realm, mask] of masks) {
        const inside = mask[gx + gy * gridW] === 1;
        if (inside && isBareParentLand) bareTinted++;
        else if (inside !== (realm === owner) && owner >= 0) {
          // A miss or a foreign tint: sub-cell jitter along the smoothed seam is expected
          // (the dashed border paints over it, world sheets included); a cell in a realm's
          // INTERIOR on the wrong side of a ring is a real defect, as is any category A miss.
          if (isSea(wx + wy * pw) && !inside && realm === owner) collar++;
          else if (boundaryAdjacent(wx, wy, owner)) seamJitter++;
          else interiorMiss++;
        }
      }
    }
  }
  assert.ok(landCells > 0, "the window must hold land or the sweep proves nothing");
  return { landCells, collar, interiorMiss, seamJitter, bareTinted };
};

test("the collar guard: grown sea coverage is total, misses exist only on the seam (#423)", () => {
  for (const [seed, band] of [[42, 1], [42, "atlas"], [15, 1], [15, 2]] as const) {
    const { landCells, collar, interiorMiss, seamJitter, bareTinted } = collarSweep(seed, band);
    assert.equal(
      collar,
      0,
      `seed ${seed} ${band}: ${collar} region land cells on parent-sea ground are outside their realm's ring; this is the shoreline collar the growth exists to prevent`,
    );
    assert.equal(
      interiorMiss,
      0,
      `seed ${seed} ${band}: ${interiorMiss} cells in a realm's interior disagree with the rings; that is a mapping or growth defect, not seam jitter`,
    );
    assert.equal(
      bareTinted,
      0,
      `seed ${seed} ${band}: ${bareTinted} realm-less land cells are inside a ring (category B must stay bare)`,
    );
    // Measured 2026-08-20: 188 of 55,638 on seed 42 band 1 (0.34%), all boundary-adjacent. A
    // mapping offset scatters misses into interiors (caught above) and inflates this past any
    // seam's share, so the ceiling is a coarse backstop, not the contract.
    assert.ok(
      seamJitter / landCells < 0.01,
      `seed ${seed} ${band}: seam jitter ${seamJitter}/${landCells} exceeds 1%; the rings have moved off the labels`,
    );
  }
});
