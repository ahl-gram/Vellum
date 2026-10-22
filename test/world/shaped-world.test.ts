import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHeightfield, type MapType } from "../../src/terrain/heightfield.ts";
import { outlineCoverage, outlineSegments, signedDistance } from "../../src/terrain/outline-distance.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
import { OUTLINE_IDS, type OutlineId } from "../../src/world/outline-ids.ts";

const W = 320;
const H = 240;
const MAP_TYPES: MapType[] = ["island", "archipelago", "continent", "citystate"];

function insideMask(id: OutlineId): Uint8Array {
  const segs = outlineSegments(id, (W - 1) / (H - 1));
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) mask[x + y * W] = signedDistance(segs, x / (W - 1), y / (H - 1)) < 0 ? 1 : 0;
  }
  return mask;
}

function landOf(seed: number, mapType: MapType, id: OutlineId, looseness?: number): Uint8Array {
  const looser = looseness === undefined ? {} : { looseness };
  const elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline: id, ...looser });
  const sea = pickSeaLevel(elev, landShareOf(defaultRecipe(seed, { mapType, outline: id, ...looser })));
  return landMask(elev, sea);
}

function differing(a: Uint8Array, b: Uint8Array): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) out.push(i);
  return out;
}

test("at looseness 0 the land is exactly the outline on the world sheet, for every outline and every map type (Issue #851)", () => {
  for (const id of OUTLINE_IDS) {
    const inside = insideMask(id);
    const count = inside.reduce((a, b) => a + b, 0);
    assert.ok(count > 0 && count < W * H, `${id}: the outline covers ${count} cells, so the comparison is degenerate`);
    for (const mapType of MAP_TYPES) {
      for (const seed of [1, 2, 3]) {
        const land = landOf(seed, mapType, id);
        const differ = differing(land, inside);
        assert.equal(
          differ.length,
          0,
          `${id} on ${mapType}, seed ${seed}: ${differ.length} cells differ from the outline, first at ${differ.slice(0, 3).join(", ")}`,
        );
      }
    }
  }
});

// 2026-10-21, Issue #851: at looseness 0.25 the land outside the outline swept 3.0% to 6.4% (round), 5.7% to 14.8% (crescent), 3.9% to 11.7% (ring) over seeds 1 to 20 and every map type; about 40% headroom over each worst case.
const NEAR: Readonly<Record<OutlineId, number>> = { round: 0.09, crescent: 0.2, ring: 0.16 };

function strayShare(land: Uint8Array, inside: Uint8Array): number {
  let outside = 0;
  let total = 0;
  for (let i = 0; i < land.length; i++) {
    if (land[i] === 1) {
      total++;
      if (inside[i] === 0) outside++;
    }
  }
  return outside / total;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as number;
}

test("the land strays from the outline more as the looseness grows, and a soft edge stays near the shape (Issue #851)", () => {
  for (const id of OUTLINE_IDS) {
    const inside = insideMask(id);
    const medians = [0, 0.25, 0.5].map((looseness) => {
      const shares = [1, 2, 3, 4, 5].map((seed) => strayShare(landOf(seed, "island", id, looseness), inside));
      if (looseness === 0.25) {
        for (const [i, share] of shares.entries()) {
          assert.ok(
            share <= NEAR[id],
            `${id} seed ${i + 1}: ${share} of the land lies outside the outline at 0.25, over ${NEAR[id]}`,
          );
        }
      }
      return median(shares);
    });
    assert.equal(medians[0], 0, `${id}: the median stray share at looseness 0 is ${medians[0]}`);
    assert.ok(
      (medians[1] as number) > (medians[0] as number),
      `${id}: the median at 0.25 (${medians[1]}) is not above the median at 0`,
    );
    assert.ok(
      (medians[2] as number) > (medians[1] as number),
      `${id}: the median at 0.5 (${medians[2]}) is not above the median at 0.25`,
    );
  }
});

test("a stored circle draws round on the 4:3 sheet, and an outline sets its own share of land (Issue #851)", () => {
  const world = generateWorld(defaultRecipe(2, { outline: "round" }));
  const land = landMask(world.elev, world.seaLevel);
  let x0 = W;
  let x1 = -1;
  let y0 = H;
  let y1 = -1;
  let cells = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (land[x + y * W] !== 1) continue;
      cells++;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  const width = x1 - x0 + 1;
  const height = y1 - y0 + 1;
  assert.ok(Math.abs(width - height) <= 2 && width >= 200, `the round form's land spans ${width} by ${height} cells`);
  const own = outlineCoverage("round", W, H);
  assert.equal(cells, Math.round(own * W * H), "the world's land is the outline's own share of the sheet");
  assert.equal(landShareOf(defaultRecipe(7, { mapType: "island", outline: "round", landFraction: 0.5 })), own);
  assert.equal(
    landShareOf(defaultRecipe(7, { mapType: "island", outline: "round", landFraction: 0.5, looseness: 0.5 })),
    own,
  );
  const far = landShareOf(defaultRecipe(7, { mapType: "island", outline: "round", landFraction: 0.5, looseness: 1 }));
  assert.ok(Math.abs(far - 0.34) < 1e-12, `the far end's share is the island's usual 0.34, got ${far}`);
  assert.equal(landShareOf(defaultRecipe(7, { landFraction: 0.5 })), 0.5);
});
