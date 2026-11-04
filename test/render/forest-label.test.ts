import assert from "node:assert/strict";
import { test } from "node:test";
import { renderMap } from "../../src/render/map-renderer.ts";
import { namedForestBlob } from "../../src/render/named-forest.ts";
import { escapeXml } from "../../src/render/svg.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { textNodes } from "../../test-support/label-geometry.ts";

// 2026-11-03: the first six of the 62 seeds in 1 to 500 whose wood no height at its centroid can letter at 1500, the same six in every dress with the key and without (Issue #1222's sweep).
const WITNESSES = [1, 9, 12, 15, 40, 41];

test("a named wood whose five heights at its centroid are all taken is lettered on a cell of the wood itself, in antique and in ink", () => {
  for (const seed of WITNESSES) {
    const world = generateWorld(defaultRecipe(seed));
    const name = world.names.forest;
    const blob = namedForestBlob(world);
    assert.ok(name !== null && blob !== null, `seed ${seed}: the world names a wood the chart's gate passes`);
    const { w, h } = world.elev;
    const proj = createProjection(w, h, 1500, marginFor(1500));
    for (const style of ["antique", "ink"] as const) {
      const label = textNodes(renderMap(world, { style })).find((n) => n.text === escapeXml(name));
      assert.ok(label, `seed ${seed} ${style}: the chart letters ${name}`);
      assert.ok(
        blob.some((i) => proj.px(i % w) === label.x && proj.py((i / w) | 0) === label.y),
        `seed ${seed} ${style}: ${name} stands on the centre of a cell of the wood, as only a spot inside the wood can when every height at its centroid is taken; a label at a height means the witness drifted, so re-pick WITNESSES from a sweep`,
      );
    }
  }
});
