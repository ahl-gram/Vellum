import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { lodWindowFor } from "../../src/world/lod.ts";
import { corridorRadius, fineRelief, routeRun } from "../../src/world/river-route.ts";
import { densifyCourse, worldRiverRuns } from "../../src/world/river-runs.ts";
import { distanceToPolyline, inWindowCourse } from "../../scripts/region-detail/feature-match.ts";
import { closeUp, groundOf, GRID_H, GRID_W } from "../../test-support/region-rivers-fixtures.ts";

const HERO = generateWorld(defaultRecipe(42));

test("a routed river that leaves the window keeps within one world cell of the world's line: chart 42's capital, band 1 (Issue #951)", () => {
  const window = lodWindowFor(0.5, 0.375, 0.5);
  const region = closeUp(HERO, window);
  const { recipe } = HERO;
  const radius = corridorRadius(window, GRID_W, recipe.gridW);
  const relief = fineRelief(groundOf(HERO, window, true), radius);
  const oneWorldCell = (GRID_W - 1) / ((window.u1 - window.u0) * (recipe.gridW - 1));
  const { w, h, data } = region.elev;
  const isLand = (cell: number): boolean => (data[cell] as number) > region.seaLevel;

  const runs = worldRiverRuns(HERO, window, GRID_W, GRID_H).filter(
    (run) => run.leavesAtEdge && densifyCourse(run.course).some((p) => isLand(Math.round(p.x) + Math.round(p.y) * w)),
  );
  assert.ok(
    runs.length >= 1,
    "the window holds a run that leaves at the edge, whose target does not depend on what was laid first",
  );
  const off: string[] = [];
  for (const run of runs) {
    const path = routeRun(run, {
      elev: region.elev,
      seaLevel: region.seaLevel,
      relief,
      radius,
      laid: new Uint8Array(w * h),
    });
    const line = inWindowCourse(
      (HERO.rivers[run.river] as (typeof HERO.rivers)[number]).points,
      HERO,
      window,
      GRID_W,
      GRID_H,
    );
    for (const cell of path) {
      const d = distanceToPolyline({ x: cell % w, y: (cell / w) | 0 }, line);
      if (d > oneWorldCell)
        off.push(`world river ${run.river}, cell ${cell} lies ${d.toFixed(2)} cells from the world's line`);
    }
  }
  assert.deepEqual(off, []);
});

test("the corridor is one world cell wide whatever the window, the atlas's 0.38 window included (Issue #951)", () => {
  const worldGridW = 320;
  for (const size of [1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 0.38]) {
    const window = lodWindowFor(0.5, 0.5, size);
    const expected = Math.max(2, (GRID_W - 1) / (size * (worldGridW - 1)));
    assert.ok(
      Math.abs(corridorRadius(window, GRID_W, worldGridW) - expected) < 1e-9,
      `size ${size}: the corridor is ${expected} cells`,
    );
  }
});
