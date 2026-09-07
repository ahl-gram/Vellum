import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fitRate,
  expectedRate,
  readPaceSweep,
  PACE_LEG_MIN_SAMPLES,
  PACE_RATE_TOLERANCE,
  type PaceSample,
} from "../../src/cli/e2e-pace.ts";
import { SWEEP_MS } from "../../src/render/chronicle-scrubber.ts";

// #526: RS30 reads the sweep's RATE off the page's frame clock instead of differencing two years a
// wall window apart. These pin the reading itself, so the e2e check can be trusted to be about the
// engine and not about how fast the runner happened to be.
const RANGE = { min: 139, max: 395 };
const SPAN = RANGE.max - RANGE.min;

/**
 * A sweep as the browser would report it: frames at the given wall gaps, the year each one paints
 * rounded exactly as sweepYearAt rounds it. `lag` is how many frames stale the sampled year is,
 * the ordering hazard between the engine's rAF tick and the suite's own.
 */
function sweep(legs: readonly { pace: number; gaps: readonly number[] }[], opts: { story?: number; lag?: number; paceOf?: (i: number, pace: number) => number } = {}): PaceSample[] {
  const lag = opts.lag ?? 0;
  let story = opts.story ?? 0;
  let t = 1000;
  const painted: { t: number; year: number; pace: number }[] = [];
  for (const leg of legs) {
    for (const gap of leg.gaps) {
      t += gap;
      story += leg.pace * gap;
      painted.push({ t, year: Math.round(RANGE.min + (story / SWEEP_MS) * SPAN), pace: leg.pace });
    }
  }
  return painted.slice(lag).map((p, i) => ({ t: p.t, year: painted[i]!.year, pace: p.pace }));
}

const evenGaps = (n: number, gap: number) => Array.from({ length: n }, () => gap);
const CLEAN = { range: RANGE, paces: [1, 4] };

test("the fit reads the rate through the year's rounding: a 16 ms frame clock and a 1x sweep land inside a fiftieth of the tolerance", () => {
  const rate = fitRate(sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }]));
  assert.ok(Math.abs(rate / expectedRate(SPAN, 1) - 1) < PACE_RATE_TOLERANCE / 50, `${rate} vs ${expectedRate(SPAN, 1)}`);
});

test("a constant pairing lag is an offset, not a tilt: the same frames read one frame stale fit the same rate", () => {
  const gaps = evenGaps(48, 16.7);
  const exact = fitRate(sweep([{ pace: 4, gaps }]));
  const stale = fitRate(sweep([{ pace: 4, gaps }], { lag: 1 }));
  assert.ok(Math.abs(stale / exact - 1) < PACE_RATE_TOLERANCE / 50, `${stale} vs ${exact}`);
});

test("ragged frames do not tilt the fit: gaps from 16 to 120 ms fit the same rate as an even clock", () => {
  const ragged = [16.7, 33, 120, 16.7, 50, 16.7, 83, 16.7, 16.7, 100, 33, 16.7, 66, 16.7, 16.7, 40];
  const rate = fitRate(sweep([{ pace: 4, gaps: [...ragged, ...ragged] }]));
  assert.ok(Math.abs(rate / expectedRate(SPAN, 4) - 1) < 0.01, `${rate} vs ${expectedRate(SPAN, 4)}`);
});

test("a clean 1x-then-4x sweep reads ok, at the ratio the paces name", () => {
  const r = readPaceSweep(sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 4, gaps: evenGaps(48, 16.7) }]), CLEAN);
  assert.equal(r.ok, true, r.detail);
  assert.ok(Math.abs(r.ratio - 4) < 0.05, r.detail);
  assert.equal(r.parked, false);
  assert.equal(r.backward, 0);
});

test("a pace that does not reach the engine fails the leg it belongs to, not the whole reading vaguely", () => {
  // The 4x button pressed, the sweep still running at 1x: the mutation the guard-prover lands.
  const s = sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 1, gaps: evenGaps(48, 16.7) }]);
  const mislabelled = s.map((x, i) => (i < 48 ? x : { ...x, pace: 4 }));
  const r = readPaceSweep(mislabelled, CLEAN);
  assert.equal(r.ok, false);
  assert.equal(r.legs[0]!.ok, true);
  assert.equal(r.legs[1]!.ok, false);
  assert.ok(Math.abs(r.ratio - 1) < 0.05, r.detail);
});

test("a pace off by an eighth still fails, so the tolerance is not a hiding place", () => {
  const s = sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 3.5, gaps: evenGaps(48, 16.7) }]);
  const r = readPaceSweep(s.map((x) => (x.pace === 3.5 ? { ...x, pace: 4 } : x)), CLEAN);
  assert.equal(r.ok, false, r.detail);
  assert.ok(PACE_RATE_TOLERANCE < 0.125);
});

test("a press that jumps the story fails as a jump: the clock re-anchored to the wrong begin (#493)", () => {
  const s = sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 4, gaps: evenGaps(48, 16.7) }]);
  const leapt = s.map((x, i) => (i >= 48 ? { ...x, year: x.year + 40 } : x));
  const r = readPaceSweep(leapt, CLEAN);
  assert.equal(r.ok, false);
  assert.ok(r.jump > r.jumpAllowed, r.detail);
  assert.equal(r.legs.every((l) => l.ok), true, "the rates are untouched: the jump is the whole finding");
});

test("ragged frames read one frame stale do not read as a jump: the step and the gap it is measured against can be a frame apart", () => {
  // 16 ms after a 200 ms gap is the shape that trips a jump bound taken from the current gap alone.
  const ragged = [16.7, 200, 16.7, 33, 250, 16.7, 16.7, 120, 16.7, 300, 16.7, 50, 180, 16.7, 16.7, 90];
  const r = readPaceSweep(sweep([{ pace: 1, gaps: ragged }, { pace: 4, gaps: ragged.slice(0, 9) }], { lag: 1 }), CLEAN);
  assert.equal(r.parked, false, "the fixture must not saturate, or it is not a jump this test reads");
  assert.ok(r.jump <= r.jumpAllowed, r.detail);
  assert.equal(r.backward, 0, r.detail);
  assert.equal(r.ok, true, r.detail);
});

test("a year that steps back fails as backward: storyAt's floor, a frame stamped before the anchor (#311)", () => {
  const s = sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 4, gaps: evenGaps(48, 16.7) }]);
  const flickered = s.map((x, i) => (i === 49 ? { ...x, year: s[47]!.year } : x));
  const r = readPaceSweep(flickered, CLEAN);
  assert.equal(r.ok, false);
  assert.ok(r.backward < 0, r.detail);
});

test("a frame-starved runner fails as frames, never as a wrong rate", () => {
  const thin = evenGaps(PACE_LEG_MIN_SAMPLES - 2, 200);
  const r = readPaceSweep(sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 4, gaps: thin }]), CLEAN);
  assert.equal(r.ok, false);
  assert.ok(r.legs[1]!.n < PACE_LEG_MIN_SAMPLES, r.detail);
  assert.ok(Math.abs(r.legs[1]!.dev) < PACE_RATE_TOLERANCE, "the rate itself was fine; the sample count is the finding");
});

test("a sweep that reached the present fails as parked: a saturated leg fits a flat rate and would read as a slow pace", () => {
  const s = sweep([{ pace: 1, gaps: evenGaps(48, 16.7) }, { pace: 4, gaps: evenGaps(48, 16.7) }], { story: SWEEP_MS - 400 });
  const r = readPaceSweep(s, CLEAN);
  assert.equal(r.parked, true, r.detail);
  assert.equal(r.ok, false);
});
