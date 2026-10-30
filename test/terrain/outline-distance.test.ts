import { test } from "node:test";
import assert from "node:assert/strict";
import { outlineSegments, signedDistance, type OutlineSegments } from "../../src/terrain/outline-distance.ts";
import { placeId, type OutlineId } from "../../src/world/outline-ids.ts";
import { useCommittedPlaces } from "../../test-support/outline-places.ts";

const ASPECT = 319 / 239;

test("the distance to an outline is in sheet heights both ways (Issue #851)", () => {
  const segs = outlineSegments("round", ASPECT);
  const near = (actual: number, expected: number, what: string): void =>
    assert.ok(Math.abs(actual - expected) < 0.002, `${what}: read ${actual}, expected ${expected}`);
  near(signedDistance(segs, 0.5, 0.5), -0.44, "the centre of the round form");
  near(signedDistance(segs, 0.83 + 0.05 / ASPECT, 0.5), 0.05, "0.05 sheet heights right of the rightmost vertex");
  near(signedDistance(segs, 0.5, 0.99), 0.05, "0.05 sheet heights below the lowest vertex");
});

test("a point in the ring's hole is sea, and a point in its band is land (Issue #851)", () => {
  const segs = outlineSegments("ring", ASPECT);
  assert.ok(signedDistance(segs, 0.5, 0.5) > 0, "the ring's centre is its hole");
  assert.ok(signedDistance(segs, 0.5 + 0.34 / ASPECT, 0.5) < 0, "0.34 sheet heights right of the centre is its band");
});

function plainDistance(segs: OutlineSegments, u: number, v: number): number {
  const px = u * segs.aspect;
  const py = v;
  let best = Infinity;
  let inside = false;
  for (let i = 0; i < segs.ax.length; i++) {
    const ax = segs.ax[i] as number;
    const ay = segs.ay[i] as number;
    const bx = segs.bx[i] as number;
    const by = segs.by[i] as number;
    const dx = bx - ax;
    const dy = by - ay;
    const along = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const t = along < 0 ? 0 : along > 1 ? 1 : along;
    const qx = ax + t * dx - px;
    const qy = ay + t * dy - py;
    const d2 = qx * qx + qy * qy;
    if (d2 < best) best = d2;
    if (ay > py !== by > py && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  const d = Math.sqrt(best);
  return inside ? -d : d;
}

function differingPoints(segs: OutlineSegments): string[] {
  const out: string[] = [];
  for (let y = -20; y <= 259; y++)
    for (let x = -20; x <= 339; x++)
      if (!Object.is(signedDistance(segs, x / 319, y / 239), plainDistance(segs, x / 319, y / 239)))
        out.push(`${x},${y}`);
  return out;
}

test("the bucketed distance is the plain scan over every segment, to the bit, inside the sheet and beyond it (Issue #853)", () => {
  useCommittedPlaces();
  const ids = [
    "round",
    "crescent",
    "ring",
    placeId("ne-1159315211"),
    placeId("ne-1159321109"),
    placeId("ne-1159307715"),
  ] as OutlineId[];
  for (const id of ids) {
    const differing = differingPoints(outlineSegments(id, ASPECT));
    assert.equal(
      differing.length,
      0,
      `${id}: ${differing.length} points differ from the plain scan, the first at ${differing[0]}`,
    );
  }
});
