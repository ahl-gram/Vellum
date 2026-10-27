import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { landSnapRadius, snapToLand } from "../../src/world/snap-to-land.ts";
import { MARK_FOOTPRINT, farmsteadCandidates } from "../../src/society/farmsteads.ts";
import { finerMarkBox } from "../../src/render/layers/settlement-marks.ts";
import { marginFor } from "../../src/render/transform.ts";
import type { Field } from "../../src/core/grid.ts";

const world15 = generateWorld(defaultRecipe(15));
const RADIN_WINDOW = lodWindowFor(0.453125, 0.47265625, 1 / 32);
const RADIN = generateRegionWorld(world15, {
  window: RADIN_WINDOW,
  gridW: 320,
  gridH: 240,
  title: regionTitle(world15, RADIN_WINDOW),
  detail: true,
  chainCache: createChainCache(16),
});

const isTier = (kind: string): boolean => kind === "farmstead" || kind === "mill";

function blockHasWater(elev: Field, seaLevel: number, x: number, y: number): boolean {
  for (let dy = -MARK_FOOTPRINT.up; dy <= MARK_FOOTPRINT.down; dy++) {
    for (let dx = -MARK_FOOTPRINT.side; dx <= MARK_FOOTPRINT.side; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= elev.w || ny >= elev.h) continue;
      if ((elev.data[nx + ny * elev.w] as number) <= seaLevel) return true;
    }
  }
  return false;
}

test("every farmstead and mill stands on ground that is land under its whole mark (Issue #952)", () => {
  const { elev, seaLevel } = RADIN;
  const du = RADIN_WINDOW.u1 - RADIN_WINDOW.u0;
  const dv = RADIN_WINDOW.v1 - RADIN_WINDOW.v0;
  const radius = landSnapRadius(elev.w, RADIN_WINDOW, world15.recipe.gridW);
  const plain = farmsteadCandidates(world15, RADIN_WINDOW).flatMap((c) => {
    const gx = Math.round(((c.u - RADIN_WINDOW.u0) / du) * (elev.w - 1));
    const gy = Math.round(((c.v - RADIN_WINDOW.v0) / dv) * (elev.h - 1));
    const cell = snapToLand(elev, seaLevel, gx, gy, radius);
    return cell === null ? [] : [cell];
  });
  assert.ok(
    plain.some((cell) => blockHasWater(elev, seaLevel, cell.x, cell.y)),
    "the plain snap leaves at least one mark over water here (Gorgrad)",
  );

  const marks = RADIN.settlements.filter((s) => isTier(s.kind));
  assert.equal(marks.length, plain.length, "the move loses no mark");
  for (const s of marks) {
    assert.ok(!blockHasWater(elev, seaLevel, s.x, s.y), `${s.name} at ${s.x},${s.y} has water under its mark`);
  }
});

test("the footprint a farmstead or mill is snapped to covers its mark (Issue #952)", () => {
  const cell = (1500 - 2 * marginFor(1500)) / 319;
  for (const tier of ["farmstead", "mill"] as const) {
    const box = finerMarkBox(tier, 0, 0, 1);
    assert.ok(MARK_FOOTPRINT.up >= -box.y / cell, `${tier}: the cells above`);
    assert.ok(MARK_FOOTPRINT.side >= box.w / 2 / cell, `${tier}: the cells beside`);
    assert.ok(MARK_FOOTPRINT.down >= (box.y + box.h) / cell, `${tier}: the cells below`);
  }
});
