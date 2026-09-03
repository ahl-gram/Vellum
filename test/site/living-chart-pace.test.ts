import { test } from "node:test";
import assert from "node:assert/strict";
import { El, installShim } from "../../test-support/element-shim.ts";
import { PACES, DEFAULT_PACE, isPace, storyElapsed, anchorFor } from "../../src/site/living-chart/pace.ts";
import { SWEEP_MS, sweepYearAt } from "../../src/render/chronicle-scrubber.ts";
import type { Chronicle } from "../../src/site/living-chart/chronicle.ts";
import type { Voyage } from "../../src/site/living-chart/voyage.ts";

// #493: the instrument's pace (1x, 2x, 4x). The clock is story milliseconds per wall millisecond, so the survey half's schedule and the ages half's SWEEP_MS scale together, and a change mid-sweep re-anchors rather than jumping.
installShim();
const { createAges } = await import("../../src/site/living-chart/ages.ts");

const RANGE = { min: 451, max: 1218 };
const EVENTS = [
  { year: 451, kind: "founding", settlement: 0, text: "Alpha was founded." },
  { year: 900, kind: "ruin", settlement: 3, text: "Gamma fell to ruin." },
];
const chronicleStub = { applyScrub: () => {}, isActive: () => true, scrubState: () => RANGE, paintYear: () => {}, exitScrub: () => {}, clearScrub: () => {} } as unknown as Chronicle;
const voyageStub = {
  rearmVoyage: () => {}, exitVoyage: () => {}, clearVoyage: () => {}, syncRestingTrack: () => {},
  internals: { hasSession: () => false, paintLive: () => {}, schedule: () => null, setOverlayVisible: () => {}, clearRestingTrack: () => {}, toldEntry: () => null },
} as unknown as Voyage;

/** The engine under a hand-turned clock: performance.now reads `clock`, and one rAF callback waits for tick(). */
function sweep() {
  const g = globalThis as Record<string, unknown>;
  const saved = { raf: g.requestAnimationFrame, caf: g.cancelAnimationFrame, win: g.window, now: performance.now };
  let clock = 0;
  let frame: ((now: number) => void) | null = null;
  g.requestAnimationFrame = (fn: (now: number) => void) => { frame = fn; return 1; };
  g.cancelAnimationFrame = () => { frame = null; };
  g.window = { matchMedia: () => ({ matches: false }) };
  performance.now = () => clock;
  const ages = createAges({
    panel: new El("div"), playBtn: new El("button"), range: new El("input"), readout: new El("span"), strip: new El("ul"),
    overlay: { data: () => ({ events: EVENTS }) }, chronicle: chronicleStub, voyage: voyageStub,
  } as unknown as Parameters<typeof createAges>[0]);
  ages.armAges(null, null, 42, "sub");
  const at = (t: number) => { clock = t; };
  const tick = (t: number) => { clock = t; const f = frame; frame = null; f?.(t); };
  const restore = () => {
    g.requestAnimationFrame = saved.raf; g.cancelAnimationFrame = saved.caf; g.window = saved.win; performance.now = saved.now as typeof performance.now;
  };
  return { ages, at, tick, restore, year: () => ages.agesState()?.year ?? -1 };
}

test("the paces are 1x, 2x and 4x, and the default is the slowest, today's one sweep speed (ruled 2026-09-02)", () => {
  assert.deepEqual([...PACES], [1, 2, 4]);
  assert.equal(DEFAULT_PACE, 1);
  assert.ok(isPace(2) && !isPace(3), "a pace is one of the three, nothing between");
});

test("the clock is pure: story time is wall time times the pace, and the anchor for a pace change keeps the story where it stands", () => {
  assert.equal(storyElapsed(1500, 1000, 1), 500);
  assert.equal(storyElapsed(1500, 1000, 4), 2000);
  const begin = anchorFor(2000, 1000, 4);
  assert.equal(storyElapsed(2000, begin, 4), 1000, "exact at the instant of the change");
  assert.equal(storyElapsed(2250, begin, 4), 2000, "a quarter second later the story has moved a full second");
});

test("the engine sweeps at the default pace exactly as before: a wall second is a story second, and the park lands at SWEEP_MS", () => {
  const s = sweep();
  try {
    assert.equal(s.ages.agesState()?.pace, 1, "the state reports the pace, for the room and the suites");
    s.at(1000);
    s.ages.togglePlay();
    s.tick(2000);
    assert.equal(s.year(), sweepYearAt(RANGE, 1000));
    s.tick(1000 + SWEEP_MS);
    assert.equal(s.ages.isPlaying(), false, "parked at the present");
    assert.equal(s.year(), RANGE.max);
  } finally { s.restore(); }
});

test("a pace change mid-sweep keeps the story position and runs on from it at the new pace; the pace outlives the sweep and a re-arm", () => {
  const s = sweep();
  try {
    s.at(1000);
    s.ages.togglePlay();
    s.tick(2000);
    const before = s.year();
    s.ages.setPace(4);
    s.tick(2000);
    assert.equal(s.year(), before, "no jump at the instant of the change");
    s.tick(2500);
    assert.equal(s.year(), sweepYearAt(RANGE, 1000 + 500 * 4), "half a wall second later the story has moved two seconds");
    s.tick(2000 + (SWEEP_MS - 1000) / 4);
    assert.equal(s.ages.isPlaying(), false, "and the park comes four times sooner");
    assert.equal(s.ages.agesState()?.pace, 4);
    s.ages.armAges(null, null, 43, "sub");
    assert.equal(s.ages.agesState()?.pace, 4, "a dice roll re-arms the instrument; the reader's pace stays");
    s.at(5000);
    s.ages.togglePlay();
    s.tick(5250);
    assert.equal(s.year(), sweepYearAt(RANGE, 1000), "the next Play runs at the chosen pace from its first frame");
  } finally { s.restore(); }
});
