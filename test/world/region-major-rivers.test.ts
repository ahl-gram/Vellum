import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { regionRiverThreshold } from "../../src/world/region-rivers.ts";
import { extractRivers, isMajorRiver } from "../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import type { World } from "../../src/world/types.ts";
import { relay } from "../../test-support/region-rivers-fixtures.ts";
import { MATCH_FRACTION, matchedFraction, matchTolerance } from "../../scripts/region-detail/feature-match.ts";

function nearRegionRiver(region: World, gridW: number, gridH: number): (gx: number, gy: number) => boolean {
  // region river cells (rounded)
  const regionCells = new Set<number>();
  for (const r of region.rivers) {
    for (const p of r.points) regionCells.add(Math.round(p.x) + Math.round(p.y) * gridW);
  }
  const nearRegion = (gx: number, gy: number): boolean => {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx,
          ny = gy + dy;
        if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH && regionCells.has(nx + ny * gridW)) {
          return true;
        }
      }
    }
    return false;
  };
  return nearRegion;
}

function majorRiverHits(
  riverWorld: World,
  majors: ReadonlyArray<World["rivers"][number]>,
  win: ReturnType<typeof windowAround>,
  gridW: number,
  gridH: number,
  nearRegion: (gx: number, gy: number) => boolean,
): { iHit: number; iMiss: number; bHit: number; bMiss: number } {
  // Project every world major-river cell into the window independently (this test owns the uv->cell mapping), split into an interior band and an 8%-of-window edge band.
  const Ww = riverWorld.recipe.gridW,
    Wh = riverWorld.recipe.gridH;
  const du = win.u1 - win.u0,
    dv = win.v1 - win.v0,
    edgeFrac = 0.08;
  let iHit = 0,
    iMiss = 0,
    bHit = 0,
    bMiss = 0;
  for (const river of majors) {
    for (const p of river.points) {
      const u = p.x / (Ww - 1),
        v = p.y / (Wh - 1);
      if (u < win.u0 || u > win.u1 || v < win.v0 || v > win.v1) continue;
      const gx = Math.round(((u - win.u0) / du) * (gridW - 1));
      const gy = Math.round(((v - win.v0) / dv) * (gridH - 1));
      const edge =
        (u - win.u0) / du < edgeFrac ||
        (win.u1 - u) / du < edgeFrac ||
        (v - win.v0) / dv < edgeFrac ||
        (win.v1 - v) / dv < edgeFrac;
      const hit = nearRegion(gx, gy);
      if (edge) {
        if (hit) bHit++;
        else bMiss++;
      } else if (hit) iHit++;
      else iMiss++;
    }
  }
  return { iHit, iMiss, bHit, bMiss };
}

test("region rivers match the world's major-river set at the window boundary (AC #162)", () => {
  // A river-rich seed (27 at production grid) and a window centred on a major river's midsection so rivers cross its edges.
  const riverWorld = generateWorld(defaultRecipe(27, { gridW: 320, gridH: 240 }));
  const majors = riverWorld.rivers.filter(isMajorRiver).sort((a, b) => b.points.length - a.points.length);
  assert.ok(majors.length >= 5, "seed 27 is river-rich");
  const mid = majors[0]!.points[Math.floor(majors[0]!.points.length / 2)]!;
  const win = windowAround(riverWorld, { x: mid.x, y: mid.y }, 0.38);
  const gridW = 320,
    gridH = 240;
  const region = generateRegionWorld(riverWorld, {
    window: win,
    gridW,
    gridH,
    title: "River Environs",
  });

  const nearRegion = nearRegionRiver(region, gridW, gridH);
  const { iHit, iMiss, bHit, bMiss } = majorRiverHits(riverWorld, majors, win, gridW, gridH, nearRegion);
  const interior = iHit / Math.max(1, iHit + iMiss);
  const boundary = bHit / Math.max(1, bHit + bMiss);
  assert.ok(bHit + bMiss > 0, "the window actually crosses major rivers at its edge");
  assert.ok(boundary >= 0.85, `world major rivers continue across the boundary (got ${(boundary * 100) | 0}%)`);
  assert.ok(interior >= 0.85, `world major rivers persist in the interior (got ${(interior * 100) | 0}%)`);
});

type Fixture = { readonly name: string; readonly world: World; readonly window: UvWindow; readonly detail: boolean };

function fixtures(): Fixture[] {
  const riverWorld = generateWorld(defaultRecipe(27, { gridW: 320, gridH: 240 }));
  const majors = riverWorld.rivers.filter(isMajorRiver).sort((a, b) => b.points.length - a.points.length);
  const mid = majors[0]!.points[Math.floor(majors[0]!.points.length / 2)]!;
  return [
    { name: "seed 27, the 0.38 window", world: riverWorld, window: windowAround(riverWorld, mid, 0.38), detail: false },
    {
      name: "chart 2, Vunsvyov, band 2",
      world: generateWorld(defaultRecipe(2)),
      window: lodWindowFor(0.5, 0.625, 0.25),
      detail: true,
    },
    {
      name: "chart 42, the capital, band 3",
      world: generateWorld(defaultRecipe(42)),
      window: lodWindowFor(0.515625, 0.390625, 0.125),
      detail: true,
    },
  ];
}

test("a close-up never draws one river twice: no river it keeps from its own ground runs beside a laid one (Issue #162, Issue #951)", () => {
  for (const f of fixtures()) {
    const { region, laid, extracted: kept } = relay(f.world, f.window, f.detail);
    assert.ok(laid.length > 0, `${f.name}: the window carries laid world rivers to double`);
    if (f.name.startsWith("seed 27"))
      assert.ok(kept.length >= 1, "the window also carries genuinely new extracted detail");
    if (f.name.includes("Vunsvyov")) {
      const own = extractRivers(region.elev, region.flow, region.seaLevel, {
        absoluteThreshold: regionRiverThreshold(f.world, f.window, 320, 240),
      });
      assert.ok(own.length > kept.length, "the fixture's own extraction holds a river that the double reach drops");
    }
    const tolerance = matchTolerance(f.window, 320, f.world.recipe.gridW);
    const laidLines = laid.map((r) => r.points);
    const doubled = kept
      .filter((r) => matchedFraction(r.points, laidLines, tolerance) >= MATCH_FRACTION)
      .map((r) => r.points[0]);
    assert.deepEqual(doubled, [], `${f.name}: a river the close-up kept runs beside a laid one`);
  }
});
