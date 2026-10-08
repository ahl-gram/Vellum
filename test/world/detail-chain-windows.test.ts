import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalParent, detailForWindow } from "../../src/world/detail-chain.ts";
import { FULL_WINDOW, LOD_BANDS, lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { buildHeightfield, MAX_DETAIL, type UvWindow } from "../../src/terrain/heightfield.ts";
import { SEED, recipe, WORLD_ASPECT, windowsEqual } from "../../test-support/detail-chain-fixtures.ts";

/** Every window the Glass can settle on at a band: lattice centers through quantizeCenter and lodWindowFor, which is exactly what decideSettle emits. */
function reachableWindows(band: number): UvWindow[] {
  const size = (LOD_BANDS[band] as (typeof LOD_BANDS)[number]).sizeUV;
  const step = size / 8;
  const seen = new Map<string, UvWindow>();
  for (let i = 0; i * step <= 1 + 1e-9; i++) {
    for (let j = 0; j * step <= 1 + 1e-9; j++) {
      const q = quantizeCenter(i * step, j * step, size);
      const w = lodWindowFor(q.cx, q.cy, size);
      seen.set(`${w.u0},${w.v0}`, w);
    }
  }
  return [...seen.values()];
}

test("the canonical parent doubles the window and lands on the parent band's own lattice (#398)", () => {
  assert.ok(windowsEqual(canonicalParent(FULL_WINDOW), FULL_WINDOW), "band 0 parents on the full window");
  assert.ok(
    windowsEqual(canonicalParent(lodWindowFor(0.5, 0.5, 0.5)), FULL_WINDOW),
    "band 1 parents on the full window",
  );
  for (const band of [2, 3]) {
    const legal = new Set(reachableWindows(band - 1).map((w) => `${w.u0},${w.v0},${w.u1},${w.v1}`));
    for (const child of reachableWindows(band)) {
      const p = canonicalParent(child);
      const childSize = child.u1 - child.u0;
      assert.ok(
        Math.abs(p.u1 - p.u0 - childSize * 2) < 1e-12,
        `band ${band}: parent of ${child.u0},${child.v0} is not double the child size`,
      );
      assert.ok(
        legal.has(`${p.u0},${p.v0},${p.u1},${p.v1}`),
        `band ${band}: parent of ${child.u0},${child.v0} is not a window band ${band - 1} can settle on`,
      );
    }
  }
});

test("the canonical parent covers its child everywhere the Glass can settle (#398)", () => {
  // parentSurfaceOnWindow returns NaN outside coverage, so an uncovered strip leaves real land unfloored rather than throwing.
  let checked = 0;
  for (const band of [1, 2, 3]) {
    for (const child of reachableWindows(band)) {
      const p = canonicalParent(child);
      checked++;
      assert.ok(
        child.u0 >= p.u0 - 1e-12 && child.v0 >= p.v0 - 1e-12 && child.u1 <= p.u1 + 1e-12 && child.v1 <= p.v1 + 1e-12,
        `band ${band}: parent ${p.u0},${p.v0}..${p.u1},${p.v1} does not cover child ${child.u0},${child.v0}..${child.u1},${child.v1}`,
      );
      if (band >= 2) {
        // Only bands 2 and up route their parent through lodWindowFor; band 1 returns FULL_WINDOW directly, which is why size 1 does not breach the clamp precondition.
        assert.ok(
          p.u1 - p.u0 <= 0.98,
          `band ${band}: parent size ${p.u1 - p.u0} breaks lodWindowFor's documented size <= 0.98 precondition`,
        );
      }
    }
  }
  assert.ok(checked > 3000, `sweep collapsed to ${checked} windows`);
});

test("the detail level is keyed off the window size, one octave per halving (#398)", () => {
  assert.equal(detailForWindow(FULL_WINDOW), 0);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.5)), 1);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.25)), 2);
  assert.equal(detailForWindow(lodWindowFor(0.5, 0.5, 0.125)), 3);
  // Non-powers of two: on the LOD sizes above, round and floor agree, so those fixtures cannot see the rounding rule at all.
  for (const [size, level] of [
    [0.7, 1],
    [0.3, 2],
    [0.15, 3],
  ] as const) {
    assert.equal(
      detailForWindow(lodWindowFor(0.5, 0.5, size)),
      level,
      `a window of ${size} must round to the NEAREST octave, not down`,
    );
  }
});

test("the detail level never exceeds what buildHeightfield accepts (#398)", () => {
  // Issue #396 caps the offsets table at MAX_DETAIL and throws past it, so the clamp is what keeps a deep window from throwing.
  const tiny = { u0: 0.5, v0: 0.5, u1: 0.5 + 2 ** -12, v1: 0.5 + 2 ** -12 };
  assert.equal(detailForWindow(tiny), MAX_DETAIL, "a very small window must clamp to the table's headroom");
  assert.doesNotThrow(() =>
    buildHeightfield({
      seed: SEED,
      gridW: 16,
      gridH: 12,
      mapType: recipe.mapType,
      window: tiny,
      worldAspect: WORLD_ASPECT,
      detail: detailForWindow(tiny),
    }),
  );
});
