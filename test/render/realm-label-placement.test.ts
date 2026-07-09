import { test } from "node:test";
import assert from "node:assert/strict";
import { createProjection } from "../../src/render/transform.ts";
import { centroidOf, type Box } from "../../src/render/geometry.ts";
import {
  placeRealmLabel,
  type RealmLabelArena,
} from "../../src/render/layers/realm-label-placement.ts";

/**
 * #145: the placement ladder must never give up on a realm name.
 *
 * Stage 1 is the historical five-candidate vertical ladder and must win whenever
 * it can, so the committed charts do not move. Stage 2 searches the realm's own
 * heartland. Stage 3 forces the label in and claims its box, so a realm is always
 * named even on a chart with no free space at all.
 */
const GRID_W = 40;
const GRID_H = 30;
const proj = createProjection(GRID_W, GRID_H, 1500, 68);

/** A solid rectangular realm, so the centroid is unambiguous. */
function rectBlob(x0: number, y0: number, x1: number, y1: number): number[] {
  const out: number[] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(y * GRID_W + x);
  return out;
}

function centroidOfBlob(blob: readonly number[]) {
  return centroidOf(blob.map((i) => ({ x: proj.px(i % GRID_W), y: proj.py((i / GRID_W) | 0) })));
}

/** An arena that accepts everything, and records what it was handed. */
function openArena(): RealmLabelArena & { tries: Box[]; forced: Box[] } {
  const tries: Box[] = [];
  const forced: Box[] = [];
  return {
    tries,
    forced,
    tryClaim(box) { tries.push(box); return true; },
    claim(box) { forced.push(box); },
  };
}

/** An arena that refuses the first `refusals` claims, then accepts. */
function stubbornArena(refusals: number): RealmLabelArena & { tries: Box[]; forced: Box[] } {
  const tries: Box[] = [];
  const forced: Box[] = [];
  let n = 0;
  return {
    tries,
    forced,
    tryClaim(box) { tries.push(box); return n++ >= refusals; },
    claim(box) { forced.push(box); },
  };
}

const base = {
  gridW: GRID_W,
  proj,
  name: "The Gyamarde Dominion",
  fs: 16.5,
  ls: 4,
};

test("stage 1: an unobstructed realm places at the centroid, on the first ladder rung", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena = openArena();

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y, c.y - 26, c.y + 26], arena });

  assert.equal(p.claimed, true);
  assert.equal(p.x, c.x, "x stays on the centroid");
  assert.equal(p.y, c.y, "y takes the first rung");
  assert.equal(arena.tries.length, 1, "no further probing once the first rung claims");
  assert.equal(arena.forced.length, 0, "nothing was forced");
});

test("stage 1: the ladder is walked in the caller's order before anything widens", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena = stubbornArena(2); // first two rungs refused
  const ladder = [c.y, c.y - 26, c.y + 26, c.y - 52, c.y + 52];

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: ladder, arena });

  assert.equal(p.claimed, true);
  assert.equal(p.x, c.x, "still on the centroid's column");
  assert.equal(p.y, ladder[2], "took the third rung, in order");
});

test("stage 2: a blocked ladder falls back into the realm's heartland, still claiming cleanly", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const ladder = [c.y, c.y - 26, c.y + 26, c.y - 52, c.y + 52];
  const arena = stubbornArena(ladder.length); // every rung refused, then yes

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: ladder, arena });

  assert.equal(p.claimed, true, "stage 2 claims, it does not force");
  assert.equal(arena.forced.length, 0, "stage 3 was never reached");
  assert.ok(arena.tries.length > ladder.length, "probed past the ladder");
});

test("stage 3: when nothing is free the label is FORCED in, and its box is claimed", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena: RealmLabelArena & { forced: Box[] } = {
    forced: [],
    tryClaim() { return false; }, // a chart with no room anywhere
    claim(box) { this.forced.push(box); },
  };

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena });

  assert.equal(p.claimed, false, "reported as forced, not cleanly claimed");
  assert.equal(p.y, c.y, "forced placement sits at the centroid");
  assert.equal(arena.forced.length, 1, "the forced box is claimed so later labels avoid it");
});

test("stage 3: a forced label is nudged so its box never leaves the drawn map", () => {
  // A realm hard against the left edge: the centroid alone would hang the label
  // off the chart into the frame.
  const blob = rectBlob(0, 10, 3, 18);
  const c = centroidOfBlob(blob);
  const arena: RealmLabelArena = { tryClaim: () => false, claim: () => {} };

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena });

  const halfW = (base.name.length * (base.fs * 0.56 + base.ls)) / 2;
  assert.ok(p.x - halfW >= proj.margin - 1e-9, `label left edge ${p.x - halfW} >= margin ${proj.margin}`);
  assert.ok(p.x > c.x, "it was nudged right, away from the frame");
});

test("placement does not depend on the order the blob was walked", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const ladder = [c.y, c.y - 26, c.y + 26, c.y - 52, c.y + 52];

  const a = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: ladder, arena: stubbornArena(5) });
  const reversed = [...blob].reverse();
  const b = placeRealmLabel({ ...base, blob: reversed, centroid: c, yCandidates: ladder, arena: stubbornArena(5) });

  assert.deepEqual(a, b, "a shuffled blob yields a byte-identical placement");
});
