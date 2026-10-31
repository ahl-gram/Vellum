import { test } from "node:test";
import assert from "node:assert/strict";
import { createProjection } from "../../src/render/transform.ts";
import { centroidOf, spacedTextBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import {
  placeRealmLabel,
  type CloseUpRoom,
  type RealmLabelArena,
} from "../../src/render/layers/realm-label-placement.ts";
import { interiorProbes } from "../../src/render/layers/label-probes.ts";
import { SHEET_INSET } from "../../src/render/layers/sheet-room.ts";

// Stage 1 is the historical five-candidate vertical ladder and must win whenever it can (so the committed charts do not move); stage 2 searches the realm's heartland; stage 3 forces the label in and claims its box.
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

function openArena(): RealmLabelArena & { tries: Box[]; forced: Box[] } {
  const tries: Box[] = [];
  const forced: Box[] = [];
  return {
    tries,
    forced,
    tryClaim(box) {
      tries.push(box);
      return true;
    },
    claim(box) {
      forced.push(box);
    },
  };
}

function stubbornArena(refusals: number): RealmLabelArena & { tries: Box[]; forced: Box[] } {
  const tries: Box[] = [];
  const forced: Box[] = [];
  let n = 0;
  return {
    tries,
    forced,
    tryClaim(box) {
      tries.push(box);
      return n++ >= refusals;
    },
    claim(box) {
      forced.push(box);
    },
  };
}

const base = {
  gridW: GRID_W,
  proj,
  name: "The Gyamarde Dominion",
  fs: 16.5,
  ls: 4,
  closeUp: null,
};

const boxOf = (p: { readonly x: number; readonly y: number }): Box =>
  spacedTextBox(p.x, p.y, base.name, base.fs, base.ls, WIDTH_FACTOR.caps);

const room = (furniture: Box[] = [], dry: (b: Box) => boolean = () => true): CloseUpRoom => ({ furniture, dry });

const lo = proj.margin + SHEET_INSET;
const hiY = proj.heightPx - proj.margin - SHEET_INSET;

function forcingArena(): RealmLabelArena & { forced: Box[] } {
  const forced: Box[] = [];
  return {
    forced,
    tryClaim: () => false,
    claim(box) {
      forced.push(box);
    },
  };
}

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
    tryClaim() {
      return false;
    }, // a chart with no room anywhere
    claim(box) {
      this.forced.push(box);
    },
  };

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena });

  assert.equal(p.claimed, false, "reported as forced, not cleanly claimed");
  assert.equal(p.y, c.y, "forced placement sits at the centroid");
  assert.equal(arena.forced.length, 1, "the forced box is claimed so later labels avoid it");
});

test("stage 3: a forced label is nudged so its box never leaves the drawn map", () => {
  // A realm hard against the left edge: the centroid alone would hang the label off the chart into the frame.
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

test("on a close-up a rung that hangs past the sheet's side is slid whole inside it", () => {
  const blob = rectBlob(0, 10, 3, 18);
  const c = centroidOfBlob(blob);
  const arena = openArena();
  assert.ok(boxOf(c).x < lo, "precondition: the centre rung hangs past the left edge");

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena, closeUp: room() });

  assert.equal(p.claimed, true);
  assert.equal(p.y, c.y);
  assert.ok(Math.abs(boxOf(p).x - lo) < 1e-9, `slid the shortest way: box at ${boxOf(p).x}, inset edge ${lo}`);
  assert.equal(arena.forced.length, 0);
});

test("on a world sheet the same rung keeps the centre, so the committed charts do not move", () => {
  const blob = rectBlob(0, 10, 3, 18);
  const c = centroidOfBlob(blob);

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena: openArena(), closeUp: null });

  assert.equal(p.x, c.x);
  assert.ok(boxOf(p).x < proj.margin, "the box still hangs past the margin");
});

test("on a close-up a rung that hangs past the sheet's foot is slid up inside it", () => {
  const blob = rectBlob(6, 29, 30, 29);
  const c = centroidOfBlob(blob);
  assert.ok(boxOf(c).y + boxOf(c).h > hiY, "precondition: the centre rung hangs past the foot");

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: [c.y], arena: openArena(), closeUp: room() });

  assert.equal(p.x, c.x);
  assert.ok(
    Math.abs(boxOf(p).y + boxOf(p).h - hiY) < 1e-9,
    `box foot at ${boxOf(p).y + boxOf(p).h}, inset edge ${hiY}`,
  );
});

test("on a close-up a name with no free spot is forced onto the first of its spots clear of the furniture", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena = forcingArena();

  const p = placeRealmLabel({
    ...base,
    blob,
    centroid: c,
    yCandidates: [c.y, c.y - 26, c.y + 26],
    arena,
    closeUp: room([boxOf(c)]),
  });

  assert.equal(p.claimed, false);
  assert.equal(p.x, c.x);
  assert.equal(p.y, c.y - 26, "the next rung, clear of the panel");
  assert.deepEqual(arena.forced, [boxOf(p)], "it claims its own box");
});

test("on a close-up with every spot under the furniture the name keeps its centre, slid inside the sheet", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena = forcingArena();

  const p = placeRealmLabel({
    ...base,
    blob,
    centroid: c,
    yCandidates: [c.y - 26, c.y],
    arena,
    closeUp: room([{ x: 0, y: 0, w: proj.widthPx, h: proj.heightPx }]),
  });

  assert.equal(p.claimed, false);
  assert.equal(p.x, c.x);
  assert.equal(p.y, c.y);
  assert.equal(arena.forced.length, 1);
});

test("on a close-up a heartland spot that hangs past the sheet is slid inside and tried before the name is forced", () => {
  const blob = rectBlob(0, 10, 3, 18);
  const c = centroidOfBlob(blob);
  const arena = stubbornArena(5);
  const ladder = [c.y, c.y - 26, c.y + 26, c.y - 52, c.y + 52];
  for (const pt of interiorProbes(blob, GRID_W, proj, c)) {
    assert.ok(boxOf(pt).x < lo, "precondition: no heartland spot fits unslid");
  }

  const p = placeRealmLabel({ ...base, blob, centroid: c, yCandidates: ladder, arena, closeUp: room() });

  assert.equal(p.claimed, true);
  assert.ok(boxOf(p).x >= lo - 1e-9, `box at ${boxOf(p).x}, inset edge ${lo}`);
  assert.equal(arena.forced.length, 0);
});

test("on a close-up a realm name takes its first free spot with no river under it before any spot over one", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const wetY = boxOf(c).y;

  const p = placeRealmLabel({
    ...base,
    blob,
    centroid: c,
    yCandidates: [c.y, c.y - 26, c.y + 26],
    arena: openArena(),
    closeUp: room([], (b) => Math.abs(b.y - wetY) > 1e-9),
  });

  assert.equal(p.claimed, true);
  assert.equal(p.x, c.x);
  assert.equal(p.y, c.y - 26);
});

test("on a close-up a realm name with no dry spot free takes its first free spot, so no realm loses its name to its rivers", () => {
  const blob = rectBlob(6, 6, 30, 22);
  const c = centroidOfBlob(blob);
  const arena = openArena();

  const p = placeRealmLabel({
    ...base,
    blob,
    centroid: c,
    yCandidates: [c.y, c.y - 26, c.y + 26],
    arena,
    closeUp: room([], () => false),
  });

  assert.equal(p.claimed, true);
  assert.equal(p.y, c.y);
  assert.equal(arena.forced.length, 0);
});
