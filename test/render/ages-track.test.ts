import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SEAM_U,
  DETENT_ESCAPE_PX,
  DETENT_ESCAPE_MAX_U,
  detentEscapeU,
  posAt,
  uFor,
  readoutFor,
  detentStart,
  detentStep,
  playStart,
  type AgesPos,
  type DetentDrag,
} from "../../src/render/ages-track.ts";
import type { YearRange } from "../../src/render/chronicle-scrubber.ts";

// #220's pure track math: bar position u <-> chamber position under the ratified 50/50 split, the word-not-a-number readout, and the hard detent's capture/escape machine; the DOM wiring lives in src/site/living-chart/ and is covered by the Explorer e2e.

const RANGE: YearRange = { min: 312, max: 1112 }; // span 800, so u steps land on years

test("the seam is the ratified even 50/50 split", () => {
  assert.equal(SEAM_U, 0.5);
});

test("the detent escape pin is pointer pixels with a narrow-track cap (measured 2026-07-28)", () => {
  assert.equal(DETENT_ESCAPE_PX, 28);
  assert.equal(DETENT_ESCAPE_MAX_U, 0.15);
  // Measured against the two real layouts: the 852px desktop track gives a light-but-deliberate band, and a wrapped ~230px phone line hits the cap without ever walling off more than 15% of the bar.
  assert.ok(Math.abs(detentEscapeU(852 - 16) - 28 / 836) < 1e-12);
  assert.equal(detentEscapeU(100), DETENT_ESCAPE_MAX_U, "a narrow track caps at MAX_U");
  assert.equal(detentEscapeU(0), DETENT_ESCAPE_MAX_U, "a degenerate width cannot divide by zero");
});

test("the left half is the survey chamber, t linear in u", () => {
  assert.deepEqual(posAt(0, RANGE), { chamber: "survey", t: 0 });
  assert.deepEqual(posAt(SEAM_U / 2, RANGE), { chamber: "survey", t: 0.5 });
});

test("the seam itself is the survey's rest: t=1, the completed track (#192)", () => {
  assert.deepEqual(posAt(SEAM_U, RANGE), { chamber: "survey", t: 1 });
});

test("an ages-side hold at the seam reads as the first year, not the survey", () => {
  assert.deepEqual(posAt(SEAM_U, RANGE, "ages"), { chamber: "ages", year: RANGE.min });
});

test("the right half is the ages chamber, linear in years over the range", () => {
  const mid = posAt(SEAM_U + (1 - SEAM_U) / 2, RANGE);
  assert.deepEqual(mid, { chamber: "ages", year: (RANGE.min + RANGE.max) / 2 });
  assert.deepEqual(posAt(1, RANGE), { chamber: "ages", year: RANGE.max });
});

test("ages years are integers: a between-years bar position rounds", () => {
  const u = SEAM_U + 0.30037 * (1 - SEAM_U);
  const pos = posAt(u, RANGE);
  assert.equal(pos.chamber, "ages");
  if (pos.chamber === "ages") assert.equal(pos.year, Math.round(RANGE.min + 0.30037 * 800));
});

test("posAt clamps the bar position into [0,1]", () => {
  assert.deepEqual(posAt(-0.2, RANGE), { chamber: "survey", t: 0 });
  assert.deepEqual(posAt(1.7, RANGE), { chamber: "ages", year: RANGE.max });
});

test("a degenerate year range parks the whole ages chamber on its one year", () => {
  const flat: YearRange = { min: 900, max: 900 };
  assert.deepEqual(posAt(0.75, flat), { chamber: "ages", year: 900 });
  assert.deepEqual(posAt(1, flat), { chamber: "ages", year: 900 });
});

test("uFor places survey positions in the left half", () => {
  assert.equal(uFor({ chamber: "survey", t: 0 }, RANGE), 0);
  assert.equal(uFor({ chamber: "survey", t: 1 }, RANGE), SEAM_U);
  assert.equal(uFor({ chamber: "survey", t: 0.5 }, RANGE), SEAM_U / 2);
});

test("uFor places years linearly in the right half", () => {
  assert.equal(uFor({ chamber: "ages", year: RANGE.min }, RANGE), SEAM_U);
  assert.equal(uFor({ chamber: "ages", year: RANGE.max }, RANGE), 1);
  const mid = (RANGE.min + RANGE.max) / 2;
  assert.equal(uFor({ chamber: "ages", year: mid }, RANGE), SEAM_U + (1 - SEAM_U) / 2);
});

test("uFor clamps a year outside the range onto the bar", () => {
  assert.equal(uFor({ chamber: "ages", year: RANGE.min - 500 }, RANGE), SEAM_U);
  assert.equal(uFor({ chamber: "ages", year: RANGE.max + 500 }, RANGE), 1);
});

test("uFor sends a degenerate range's one year to the bar's right end", () => {
  assert.equal(uFor({ chamber: "ages", year: 900 }, { min: 900, max: 900 }), 1);
});

test("posAt and uFor round-trip across the whole bar", () => {
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const pos = posAt(u, RANGE);
    const back = uFor(pos, RANGE);
    // Exact on the survey side; within half a year-step on the ages side (rounding).
    const tol = pos.chamber === "survey" ? 1e-12 : (1 - SEAM_U) / (RANGE.max - RANGE.min) / 2 + 1e-12;
    assert.ok(Math.abs(back - u) <= tol, `u=${u} round-tripped to ${back}`);
  }
});

test("the survey half reads as a word, never a year (ratified 2026-07-28)", () => {
  assert.equal(readoutFor({ chamber: "survey", t: 0.3 }), "the survey");
  assert.equal(readoutFor({ chamber: "survey", t: 1 }), "the survey");
});

test("the ages half reads the year in the chronicle's lowercase idiom", () => {
  assert.equal(readoutFor({ chamber: "ages", year: 847 }), "year 847");
});

test("Play at the present park opens the whole story from the survey's first leg (Alex's PR #311 ruling)", () => {
  assert.deepEqual(playStart({ chamber: "ages", year: RANGE.max }, RANGE), { chamber: "survey", t: 0 });
});

test("Play at the bare-survey rest opens the same whole story", () => {
  assert.deepEqual(playStart({ chamber: "survey", t: 1 }, RANGE), { chamber: "survey", t: 0 });
});

test("Play from any interior position runs forward from where it stands", () => {
  assert.deepEqual(playStart({ chamber: "survey", t: 0.4 }, RANGE), { chamber: "survey", t: 0.4 });
  assert.deepEqual(playStart({ chamber: "ages", year: 700 }, RANGE), { chamber: "ages", year: 700 });
});

test("a degenerate range's one year IS the park: Play opens the whole story", () => {
  const flat: YearRange = { min: 900, max: 900 };
  assert.deepEqual(playStart({ chamber: "ages", year: 900 }, flat), { chamber: "survey", t: 0 });
});

const ESC = 0.04; // the behavioral tests' explicit band; the live band is per-drag (detentEscapeU)

const stepAll = (drag: DetentDrag, samples: ReadonlyArray<number>) => {
  let u = NaN;
  for (const s of samples) ({ u, drag } = detentStep(drag, s, ESC));
  return { u, drag };
};

test("a drag begins on the side it grabs; the seam counts as survey", () => {
  assert.deepEqual(detentStart(0.2), { side: "survey", held: false });
  assert.deepEqual(detentStart(0.8), { side: "ages", held: false });
  assert.deepEqual(detentStart(SEAM_U), { side: "survey", held: false });
});

test("a drag inside its own chamber passes through untouched", () => {
  const r = stepAll(detentStart(0.1), [0.2, 0.34, 0.499]);
  assert.equal(r.u, 0.499);
  assert.deepEqual(r.drag, { side: "survey", held: false });
});

test("a crossing inside the escape band holds at the seam", () => {
  const r = detentStep(detentStart(0.4), SEAM_U + ESC / 2, ESC);
  assert.equal(r.u, SEAM_U);
  assert.deepEqual(r.drag, { side: "survey", held: true });
});

test("a held drag stays held until the pull clears the band", () => {
  const inside = [SEAM_U + ESC * 0.3, SEAM_U + ESC * 0.9];
  const r = stepAll(detentStart(0.4), inside);
  assert.equal(r.u, SEAM_U);
  assert.deepEqual(r.drag, { side: "survey", held: true });
});

test("a pull past the band releases into the other chamber at the raw position", () => {
  const past = SEAM_U + ESC;
  const r = stepAll(detentStart(0.4), [SEAM_U + ESC / 2, past]);
  assert.equal(r.u, past);
  assert.deepEqual(r.drag, { side: "ages", held: false });
});

test("one fast sample past the band never sticks", () => {
  const far = SEAM_U + ESC * 3;
  const r = detentStep(detentStart(0.3), far, ESC);
  assert.equal(r.u, far);
  assert.deepEqual(r.drag, { side: "ages", held: false });
});

test("retreating from a hold releases back into the drag's own chamber", () => {
  const held = detentStep(detentStart(0.4), SEAM_U + ESC / 2, ESC).drag;
  const r = detentStep(held, 0.45, ESC);
  assert.equal(r.u, 0.45);
  assert.deepEqual(r.drag, { side: "survey", held: false });
});

test("the detent is symmetric: an ages-side drag holds and escapes leftward", () => {
  const holdAt = SEAM_U - ESC / 2;
  const held = detentStep(detentStart(0.8), holdAt, ESC);
  assert.equal(held.u, SEAM_U);
  assert.deepEqual(held.drag, { side: "ages", held: true });
  const out = detentStep(held.drag, SEAM_U - ESC, ESC);
  assert.equal(out.u, SEAM_U - ESC);
  assert.deepEqual(out.drag, { side: "survey", held: false });
});

test("an ages-side drag resting exactly on the seam stays in its chamber", () => {
  const r = detentStep(detentStart(0.8), SEAM_U, ESC);
  assert.equal(r.u, SEAM_U);
  assert.equal(r.drag.side, "ages");
  const pos: AgesPos = posAt(r.u, RANGE, r.drag.side);
  assert.deepEqual(pos, { chamber: "ages", year: RANGE.min });
});
