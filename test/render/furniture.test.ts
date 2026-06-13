import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { createProjection } from "../../src/render/transform.ts";
import { STYLES } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planCartouche } from "../../src/render/layers/cartouche.ts";
import { planCompass } from "../../src/render/layers/compass.ts";
import { planScalebar } from "../../src/render/layers/scalebar.ts";
import { boxesOverlap } from "../../src/render/geometry.ts";

// The compass, scale bar, and cartouche are decorative "furniture" placed in
// pixel space. The scale bar is pinned to the bottom-left; the compass searches
// open ocean. Without coordination the compass lands on the scale bar (it did
// on ~85% of seeds before this was fixed), so these pin the no-overlap contract.

function ctxFor(seed: number): RenderCtx {
  const world = generateWorld(defaultRecipe(seed, { gridW: 160, gridH: 120 }));
  const widthPx = 1500;
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);
  return {
    world,
    style: STYLES.antique,
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(seed).fork("render"),
    labels: createLabelArena(),
  };
}

test("the compass rose clears the scale bar and cartouche", () => {
  let drawn = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const ctx = ctxFor(seed);
    const cart = planCartouche(ctx);
    const scale = planScalebar(ctx);
    const compass = planCompass(ctx, cart, scale.box);
    if (!compass) continue; // no ocean room for a compass is acceptable
    drawn++;
    assert.ok(
      !boxesOverlap(compass.box, scale.box),
      `compass overlaps the scale bar for seed ${seed}`,
    );
    assert.ok(
      !boxesOverlap(compass.box, cart.rect),
      `compass overlaps the cartouche for seed ${seed}`,
    );
  }
  // guard: the fix must reposition the compass, not quietly drop it
  assert.ok(drawn >= 30, `expected most seeds to draw a compass, got ${drawn}/40`);
});
