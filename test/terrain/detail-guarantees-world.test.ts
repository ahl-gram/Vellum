import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield, type UvWindow } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe } from "../../src/world/generate.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { marchingSquares } from "../../src/terrain/contours.ts";
import type { Field } from "../../src/core/grid.ts";
import {
  floorToParent,
  parentSurfaceOnWindow,
  rejectBridges,
} from "../../src/terrain/detail-guarantees.ts";
import { cellSegmentEdgePairs, fusingSaddles } from "./saddle-probe.ts";

const FULL = { u0: 0, v0: 0, u1: 1, v1: 1 } as const;
const CW = 96;
const CH = 72;
const DETAIL = 3;
const SWEEP_SEEDS = [42, 23] as const;
const LATTICE = [0.2, 0.4, 0.6, 0.8] as const;
// One pinned band-3 window per seed where the floored field really merges landmasses, found by a 7x7 sweep over seeds 42, 7, 2, 15, 23 on 2026-08-22 (seed 7 carries none).
const BRIDGE_WINDOWS: ReadonlyArray<readonly [number, number, number]> = [
  [42, 0.125, 0.375],
  [2, 0.75, 0.25],
  [15, 0.375, 0.375],
  [23, 0.5, 0.25],
];

type WorldCtx = {
  readonly parent: Field;
  readonly sea: number;
  readonly mapType: ReturnType<typeof defaultRecipe>["mapType"];
};

type WindowCase = {
  readonly surface: Field;
  readonly fine: Field;
  readonly floored: Field;
  readonly adjusted: Field;
  readonly sea: number;
};

const worlds = new Map<number, WorldCtx>();
function worldCtx(seed: number): WorldCtx {
  let c = worlds.get(seed);
  if (!c) {
    const recipe = defaultRecipe(seed);
    const parent = buildHeightfield({ seed, gridW: 320, gridH: 240, mapType: recipe.mapType });
    c = { parent, sea: pickSeaLevel(parent, recipe.landFraction), mapType: recipe.mapType };
    worlds.set(seed, c);
  }
  return c;
}

function windowAt(cx: number, cy: number): UvWindow {
  return { u0: cx - 0.0625, v0: cy - 0.0625, u1: cx + 0.0625, v1: cy + 0.0625 };
}

const cases = new Map<string, WindowCase>();
function caseFor(seed: number, cx: number, cy: number): WindowCase {
  const key = `${seed}:${cx}:${cy}`;
  let wc = cases.get(key);
  if (!wc) {
    const c = worldCtx(seed);
    const win = windowAt(cx, cy);
    const fine = buildHeightfield({
      seed,
      gridW: CW,
      gridH: CH,
      mapType: c.mapType,
      window: win,
      worldAspect: 319 / 239,
      detail: DETAIL,
    });
    const surface = parentSurfaceOnWindow(c.parent, FULL, win, CW, CH);
    const floored = floorToParent(fine, surface);
    const adjusted = rejectBridges(surface, floored, c.sea);
    wc = { surface, fine, floored, adjusted, sea: c.sea };
    cases.set(key, wc);
  }
  return wc;
}

function parentLandAt(wc: WindowCase, i: number): boolean {
  const pv = wc.surface.data[i] as number;
  return Number.isFinite(pv) && pv > wc.sea;
}

function fusedCells(wc: WindowCase, field: Field): number {
  const { ids: sIds } = labelLandmasses(wc.surface, wc.sea);
  const { ids: cIds } = labelLandmasses(field, wc.sea);
  const owner = new Map<number, number>();
  let fused = 0;
  for (let i = 0; i < sIds.length; i++) {
    const sid = sIds[i] as number;
    const cid = cIds[i] as number;
    if (sid === -1 || cid === -1) continue;
    const prev = owner.get(cid);
    if (prev === undefined) owner.set(cid, sid);
    else if (prev !== sid) fused++;
  }
  return fused;
}

test("monotone floor: parent land never sinks in the adjusted child, and the guard is not vacuous (#397)", () => {
  for (const seed of SWEEP_SEEDS) {
    let drownedNoFloor = 0;
    let parentLandCells = 0;
    for (const cy of LATTICE) {
      for (const cx of LATTICE) {
        const wc = caseFor(seed, cx, cy);
        for (let i = 0; i < CW * CH; i++) {
          if (!parentLandAt(wc, i)) continue;
          parentLandCells++;
          if ((wc.fine.data[i] as number) <= wc.sea) drownedNoFloor++;
          assert.ok(
            (wc.adjusted.data[i] as number) > wc.sea,
            `seed ${seed} window ${cx},${cy}: parent land drowned at cell ${i % CW},${(i / CW) | 0}`,
          );
        }
      }
    }
    // Measured on this exact fixture 2026-08-22: seed 42 drowns 478 of 59855 parent-land cells without the floor, seed 23 drowns 381 of 43318; floors sit far below so cross-platform float drift cannot flip them.
    assert.ok(parentLandCells > 20000, `seed ${seed}: only ${parentLandCells} parent-land cells checked`);
    assert.ok(
      drownedNoFloor >= 150,
      `seed ${seed}: only ${drownedNoFloor} cells drown without the floor, the monotone guard is near-vacuous`,
    );
  }
});

test("anti-merge: no two parent landmasses share a landmass in the adjusted child (#397)", () => {
  for (const seed of SWEEP_SEEDS) {
    for (const cy of LATTICE) {
      for (const cx of LATTICE) {
        const wc = caseFor(seed, cx, cy);
        assert.equal(
          fusedCells(wc, wc.adjusted),
          0,
          `seed ${seed} window ${cx},${cy}: adjusted child fused parent landmasses`,
        );
      }
    }
  }
});

test("bridge rejection does real work on real terrain: pinned merging windows come back unmerged (#397)", () => {
  for (const [seed, cx, cy] of BRIDGE_WINDOWS) {
    const wc = caseFor(seed, cx, cy);
    // Measured fused cells in the floored field on 2026-08-22: seed 42 window carries 170, seed 2 carries 1203, seed 15 carries 8, seed 23 carries 7; rejected cells 5, 7, 20, 19.
    assert.ok(
      fusedCells(wc, wc.floored) >= 1,
      `seed ${seed} window ${cx},${cy}: the floored field no longer merges, this fixture is vacuous`,
    );
    let rejected = 0;
    for (let i = 0; i < CW * CH; i++) {
      if (wc.floored.data[i] !== wc.adjusted.data[i]) rejected++;
    }
    assert.ok(rejected >= 1, `seed ${seed} window ${cx},${cy}: rejection touched no cell`);
    assert.equal(
      fusedCells(wc, wc.adjusted),
      0,
      `seed ${seed} window ${cx},${cy}: rejection left a merge standing`,
    );
    for (let i = 0; i < CW * CH; i++) {
      if (parentLandAt(wc, i)) {
        assert.ok((wc.adjusted.data[i] as number) > wc.sea, `seed ${seed}: rejection sank parent land at ${i}`);
      }
    }
  }
});

test("saddle census: the seed-42 world chart's three hairline picture-fuses, drawn-bridged in the real contours (#397)", () => {
  // Ratified 2026-08-22 (Alex, accept-and-pin): the drawn coast may fuse landmasses the array splits only at these measured hairline saddles; growth of the census is a regression. The epic's "0 saddles currently fuse" predates this measurement and is corrected on the issue.
  const c = worldCtx(42);
  const { fusing } = fusingSaddles(c.parent, c.sea);
  assert.deepEqual(
    fusing.map((f) => [f.x, f.y]),
    [[143, 76], [119, 103], [243, 103]],
    "the seed-42 world chart census moved",
  );
  const { ids, sizes } = labelLandmasses(c.parent, c.sea);
  const contours = marchingSquares(c.parent, c.sea);
  for (const f of fusing) {
    const pairs = cellSegmentEdgePairs(contours, f.x, f.y);
    assert.equal(pairs.length, 2, `saddle ${f.x},${f.y}: expected two segments in the cell`);
    const [p1, p2] = f.landCorners;
    const landEdges = [p1, p2].map(([gx, gy]) =>
      [gx === f.x ? "left" : "right", gy === f.y ? "top" : "bottom"].sort().join("|"),
    );
    for (const le of landEdges) {
      assert.ok(!pairs.includes(le), `saddle ${f.x},${f.y}: the drawn coast cut off a land corner, so it no longer bridges`);
    }
    const cornerSizes = [p1, p2].map(([gx, gy]) => sizes[ids[gx + gy * 320] as number] as number);
    assert.ok(Math.min(...cornerSizes) <= 3, `saddle ${f.x},${f.y}: expected an islet-bump, got sizes ${cornerSizes}`);
  }
});

test("saddle census: hairline picture-fuses in adjusted band-3 windows stay within the measured band (#397)", () => {
  let fusingTotal = 0;
  let bothParent = 0;
  for (const seed of SWEEP_SEEDS) {
    for (const cy of LATTICE) {
      for (const cx of LATTICE) {
        const wc = caseFor(seed, cx, cy);
        const { fusing } = fusingSaddles(wc.adjusted, wc.sea);
        fusingTotal += fusing.length;
        for (const f of fusing) {
          const [p1, p2] = f.landCorners;
          const i1 = p1[0] + p1[1] * CW;
          const i2 = p2[0] + p2[1] * CW;
          if (parentLandAt(wc, i1) && parentLandAt(wc, i2)) bothParent++;
        }
      }
    }
  }
  // Measured on this exact fixture 2026-08-22: 17 fusing saddles across the two 16-window sweeps (10 + 7), 3 of them with both corners on parent land; the bands leave room for single-cell float drift but trip on growth.
  assert.ok(fusingTotal >= 8 && fusingTotal <= 26, `fusing saddle census moved: ${fusingTotal}, measured 17`);
  assert.ok(bothParent <= 5, `both-parent hairline fuses grew: ${bothParent}, measured 3`);
});

test("saddle census: the two known genuine two-landmass fuses are present and pinned (#397)", () => {
  const known: ReadonlyArray<readonly [number, number, number, number, number]> = [
    [2, 0.75, 0.25, 93, 11],
    [15, 0.375, 0.375, 30, 25],
  ];
  for (const [seed, cx, cy, sx, sy] of known) {
    const wc = caseFor(seed, cx, cy);
    const { fusing } = fusingSaddles(wc.adjusted, wc.sea);
    const hit = fusing.find((f) => f.x === sx && f.y === sy);
    assert.ok(hit, `seed ${seed} window ${cx},${cy}: known hairline fuse at ${sx},${sy} vanished from the census`);
    const [p1, p2] = hit.landCorners;
    assert.ok(
      parentLandAt(wc, p1[0] + p1[1] * CW) && parentLandAt(wc, p2[0] + p2[1] * CW),
      `seed ${seed}: the pinned fuse at ${sx},${sy} no longer joins two parent shores`,
    );
  }
});
