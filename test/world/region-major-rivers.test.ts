import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { isMajorRiver } from "../../src/hydrology/rivers.ts";
import type { World } from "../../src/world/types.ts";

function nearRegionRiver(region: World, gridW: number, gridH: number): (gx: number, gy: number) => boolean {
  // region river cells (rounded; projected world rivers carry fractional coords)
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

function cellsAround(cx: number, cy: number, gridW: number, gridH: number): number[] {
  const cells: number[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = cx + dx,
        ny = cy + dy;
      if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) cells.push(nx + ny * gridW);
    }
  }
  return cells;
}

test("region rivers are not inked twice: no extracted river shadows a projected major (#162)", () => {
  // Projected majors carry fractional coords, extracted rivers integer ones; the shadow filter drops any extracted river covering >=50% of its cells within the majors' 2-cell shadow (guards the no-double-ink return in region-rivers.ts).
  const riverWorld = generateWorld(defaultRecipe(27, { gridW: 320, gridH: 240 }));
  const majors = riverWorld.rivers.filter(isMajorRiver).sort((a, b) => b.points.length - a.points.length);
  const mid = majors[0]!.points[Math.floor(majors[0]!.points.length / 2)]!;
  const win = windowAround(riverWorld, { x: mid.x, y: mid.y }, 0.38);
  const gridW = 320,
    gridH = 240;
  const region = generateRegionWorld(riverWorld, { window: win, gridW, gridH, title: "River Environs" });

  const isProjected = (r: (typeof region.rivers)[number]): boolean =>
    r.points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y));
  const shadow = new Set<number>();
  for (const r of region.rivers) {
    if (!isProjected(r)) continue;
    for (const p of r.points) {
      for (const cell of cellsAround(Math.round(p.x), Math.round(p.y), gridW, gridH)) shadow.add(cell);
    }
  }
  assert.ok(shadow.size > 0, "the window carries projected world majors to shadow-check against");

  let extractedRivers = 0;
  for (const r of region.rivers) {
    if (isProjected(r)) continue;
    extractedRivers++;
    let covered = 0;
    for (const p of r.points) {
      if (shadow.has(Math.round(p.x) + Math.round(p.y) * gridW)) covered++;
    }
    assert.ok(
      covered / r.points.length < 0.5,
      `an extracted river shadows a projected major (${((100 * covered) / r.points.length) | 0}% covered): double-ink`,
    );
  }
  assert.ok(extractedRivers > 0, "the window also carries genuinely new extracted detail");
});
