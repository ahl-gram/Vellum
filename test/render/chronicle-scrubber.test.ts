import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import type { PlaceMark } from "../../src/render/place-manifest.ts";
import type { HistoricalEvent } from "../../src/society/history.ts";
import {
  scrubRange,
  buildScrubMarks,
  placeStateAt,
  glyphVisibleAt,
  eventIsPast,
  buildSweepPlan,
  sweepYearAt,
} from "../../src/render/chronicle-scrubber.ts";

// Unit tests for #54 (Chronicle year-scrubber): the pure core that the Explorer's
// year-slider + Play sweep consume. The DOM wiring (slider, layer hide/restore,
// rAF loop, redraw re-apply) lives in docs/explorer/app.js and is covered by the
// Explorer e2e. Only the deterministic math is tested here.
//
// Two load-bearing behaviours:
//  1. A ruined place is LIVING between its founding and its abandonment year, and
//     only a RUIN once its ruin-event year has passed (NOT from founding on). A
//     ruin whose event was sliced off the 14-event chronicle still crumbles, at
//     the present year, rather than never.
//  2. Play is EVENT-PROPORTIONAL (a deliberate override of the issue's "fixed
//     linear sweep"): the sweep DWELLS at years that carry chronicle events, so a
//     beat-year holds for a window of time while empty stretches are skimmed.

const mark = (over: Partial<PlaceMark> = {}): PlaceMark => ({
  idx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 300,
  ruined: false,
  seat: false,
  nx: 0.5,
  ny: 0.5,
  // #120 added the grid cell to PlaceMark; nothing here reads it.
  gx: 0,
  gy: 0,
  ...over,
});

const ev = (over: Partial<HistoricalEvent> = {}): HistoricalEvent => ({
  year: 100,
  kind: "founding",
  text: "An event of no special note.",
  ...over,
});

// --- the year range -------------------------------------------------------

test("scrubRange spans the earliest founding to the present year", () => {
  const places = [
    mark({ idx: 0, kind: "capital", founded: 120 }),
    mark({ idx: 1, kind: "town", founded: 340 }),
    mark({ idx: 2, kind: "village", founded: 560 }),
  ];
  assert.deepEqual(scrubRange(places, 800), { min: 120, max: 800 });
});

// --- per-place state across the timeline ----------------------------------

test("buildScrubMarks: one mark per place, ruin year resolved from its ruin event", () => {
  const places = [
    mark({ idx: 0, kind: "capital", founded: 120 }),
    mark({ idx: 1, kind: "village", founded: 400, ruined: true }),
  ];
  const events = [
    ev({ kind: "founding", settlement: 1, year: 400, text: "Founded." }),
    ev({ kind: "ruin", settlement: 1, year: 650, text: "Abandoned." }),
  ];
  const marks = buildScrubMarks(places, events, 800);
  // rise/war events never become marks; there is exactly one mark per place.
  assert.equal(marks.length, 2);
  const living = marks.find((m) => m.idx === 0)!;
  const ruin = marks.find((m) => m.idx === 1)!;
  assert.equal(living.ruinYear, null, "a living place has no ruin year");
  assert.equal(ruin.ruinYear, 650, "ruin year comes from the ruin event, not the founding");
});

test("buildScrubMarks: a ruin whose event was sliced off still crumbles at the present year", () => {
  // history.ts caps the chronicle at 14 events and pushes ruins LAST, so a ruined
  // place can have NO ruin event in the manifest. It must still crumble (at
  // presentYear), not stay a living town forever.
  const places = [mark({ idx: 0, kind: "village", founded: 400, ruined: true })];
  const events = [ev({ kind: "founding", settlement: 0, year: 400, text: "Founded only." })];
  const marks = buildScrubMarks(places, events, 900);
  assert.equal(marks[0]!.ruinYear, 900, "sliced-off ruin falls back to the present year, not null");
});

test("placeStateAt: a place is hidden before its founding, then living", () => {
  const m = buildScrubMarks([mark({ idx: 0, founded: 300 })], [], 800)[0]!;
  assert.equal(placeStateAt(m, 299), "hidden");
  assert.equal(placeStateAt(m, 300), "living", "a place appears in its founding year");
  assert.equal(placeStateAt(m, 500), "living");
});

test("placeStateAt: a ruin is LIVING between founding and abandonment, RUIN after", () => {
  // The discriminator. A naive `ruined && year >= founded` rule (no ruin-year
  // gate) would mark the town a ruin from its founding on, never showing the
  // centuries it thrived.
  const places = [mark({ idx: 0, kind: "village", founded: 400, ruined: true })];
  const events = [ev({ kind: "ruin", settlement: 0, year: 650, text: "Abandoned." })];
  const m = buildScrubMarks(places, events, 800)[0]!;
  assert.equal(placeStateAt(m, 399), "hidden", "not yet founded");
  assert.equal(placeStateAt(m, 400), "living", "founded; thriving");
  assert.equal(placeStateAt(m, 649), "living", "still thriving the year before it falls");
  assert.equal(placeStateAt(m, 650), "ruin", "crumbles in its abandonment year");
  assert.equal(placeStateAt(m, 800), "ruin");
});

// #93: glyphVisibleAt drives the real baked glyphs on/off by year (replacing the
// #54 abstract dots). It differs from placeStateAt because the static chart bakes
// each settlement in its PRESENT-DAY state only, so a glyph can only be shown in
// the state it was drawn in ("state-begins").
test("glyphVisibleAt: a living town's glyph shows at and after founding, hidden before (#93)", () => {
  const mark = { idx: 0, nx: 0.5, ny: 0.5, founded: 300, ruinYear: null };
  assert.equal(glyphVisibleAt(mark, 299), false, "hidden before founding");
  assert.equal(glyphVisibleAt(mark, 300), true, "shows in its founding year");
  assert.equal(glyphVisibleAt(mark, 900), true, "still shown at the present");
});

test("glyphVisibleAt: a ruined town follows state-begins - hidden through its living centuries, ruin glyph at the fall year (#93)", () => {
  const mark = { idx: 1, nx: 0.5, ny: 0.5, founded: 400, ruinYear: 650 };
  assert.equal(glyphVisibleAt(mark, 399), false, "not yet founded");
  assert.equal(glyphVisibleAt(mark, 400), false, "founded, but no living glyph is baked (state-begins), so hidden");
  assert.equal(glyphVisibleAt(mark, 649), false, "still hidden the year before it falls");
  assert.equal(glyphVisibleAt(mark, 650), true, "the baked ruin glyph inks in at the fall year");
  assert.equal(glyphVisibleAt(mark, 800), true, "and stays a ruin");
});

test("eventIsPast is inclusive of the current year", () => {
  assert.equal(eventIsPast(500, 499), false);
  assert.equal(eventIsPast(500, 500), true, "an event lands in its own year");
  assert.equal(eventIsPast(500, 501), true);
});

// --- the event-proportional Play sweep ------------------------------------

// Tally, at 1ms resolution, how long each integer year is on screen across the
// whole sweep. Event-proportional pacing means a beat-year's tally dwarfs an
// empty year's; a linear sweep would give every year a near-equal share.
function yearDwellMs(plan: ReturnType<typeof buildSweepPlan>, year: number): number {
  let ms = 0;
  for (let t = 0; t <= plan.totalMs; t++) {
    if (sweepYearAt(plan, t) === year) ms++;
  }
  return ms;
}

test("buildSweepPlan: the plan carries a dwell segment at each event beat-year", () => {
  const plan = buildSweepPlan({ min: 0, max: 100 }, [30, 70], { travelMs: 100, dwellMs: 300 });
  // a linear single-travel plan has no dwell segments at all
  assert.ok(
    plan.segments.some((s) => s.type === "dwell" && s.year === 30),
    "expected a dwell at beat-year 30",
  );
  assert.ok(
    plan.segments.some((s) => s.type === "dwell" && s.year === 70),
    "expected a dwell at beat-year 70",
  );
});

test("sweepYearAt: starts at min, ends at max, never goes backwards", () => {
  const plan = buildSweepPlan({ min: 0, max: 100 }, [30], { travelMs: 100, dwellMs: 300 });
  assert.equal(sweepYearAt(plan, 0), 0, "starts at the earliest founding");
  assert.equal(sweepYearAt(plan, plan.totalMs), 100, "ends at the present year");
  assert.equal(sweepYearAt(plan, plan.totalMs + 5000), 100, "stays at present past the end");
  let prev = -Infinity;
  for (let t = 0; t <= plan.totalMs; t += 7) {
    const y = sweepYearAt(plan, t);
    assert.ok(y >= prev, `year went backwards at ${t}ms: ${y} < ${prev}`);
    prev = y;
  }
});

test("sweepYearAt: the sweep DWELLS at a beat-year (a plateau a linear sweep lacks)", () => {
  // beat at 30 (deliberately off the [0,100] midpoint, so a linear sweep cannot
  // accidentally sit at 30 for both sampled instants).
  const plan = buildSweepPlan({ min: 0, max: 100 }, [30], { travelMs: 100, dwellMs: 400 });
  assert.equal(sweepYearAt(plan, 200), 30);
  assert.equal(sweepYearAt(plan, 400), 30, "still at 30 two hundred ms later: it is dwelling");
});

test("sweepYearAt: a beat-year gets far more screen time than an empty year", () => {
  const plan = buildSweepPlan({ min: 0, max: 100 }, [50], { travelMs: 100, dwellMs: 300 });
  const beat = yearDwellMs(plan, 50);
  const empty = yearDwellMs(plan, 20);
  assert.ok(beat > empty * 10, `beat-year 50 (${beat}ms) should dwarf empty year 20 (${empty}ms)`);
});

test("buildSweepPlan: with no events it still sweeps min to max monotonically", () => {
  const plan = buildSweepPlan({ min: 10, max: 90 }, [], { travelMs: 200, dwellMs: 300 });
  assert.equal(sweepYearAt(plan, 0), 10);
  assert.equal(sweepYearAt(plan, plan.totalMs), 90);
  assert.ok(!plan.segments.some((s) => s.type === "dwell"), "no events, no dwells");
});

test("buildSweepPlan: a stray beat outside the range is clamped, not crashed", () => {
  // rise events can predate the earliest founding; a clamped beat must not break
  // monotonicity or the endpoints.
  const plan = buildSweepPlan({ min: 100, max: 200 }, [40, 150, 900], { travelMs: 80, dwellMs: 120 });
  assert.equal(sweepYearAt(plan, 0), 100);
  assert.equal(sweepYearAt(plan, plan.totalMs), 200);
  let prev = -Infinity;
  for (let t = 0; t <= plan.totalMs; t += 5) {
    const y = sweepYearAt(plan, t);
    assert.ok(y >= prev && y >= 100 && y <= 200, `out-of-range year ${y} at ${t}ms`);
    prev = y;
  }
});

test("buildSweepPlan: a degenerate one-year range (min===max) still yields a usable plan", () => {
  // A zero-place world, or one whose only place was founded in the present survey
  // year, gives scrubRange min===max and no in-range beats. The plan must still
  // produce a single segment that holds at that year, not an empty-segments plan.
  const plan = buildSweepPlan({ min: 500, max: 500 }, [], { travelMs: 200, dwellMs: 300 });
  assert.ok(plan.segments.length >= 1, "a one-year range still has a segment");
  assert.equal(sweepYearAt(plan, 0), 500);
  assert.equal(sweepYearAt(plan, plan.totalMs), 500);
});

test("buildSweepPlan: total run time is capped for event-dense worlds", () => {
  const many = Array.from({ length: 40 }, (_, i) => i * 5); // 40 beats in [0,200]
  const plan = buildSweepPlan({ min: 0, max: 200 }, many, { travelMs: 300, dwellMs: 600, maxTotalMs: 7000 });
  assert.ok(plan.totalMs <= 7000, `dense world should cap at 7000ms, got ${plan.totalMs}`);
});

// --- real-seed integration ------------------------------------------------

test("integration: seed 42 marks, range, and sweep are internally consistent", () => {
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  const marks = buildScrubMarks(m.places, m.events, m.presentYear);
  const range = scrubRange(m.places, m.presentYear);

  assert.equal(marks.length, m.places.length, "one mark per place");
  assert.equal(range.max, m.presentYear);

  // every place is hidden before the range, present-or-ruined at the end
  for (const mk of marks) {
    assert.equal(placeStateAt(mk, range.min - 1), "hidden");
    const end = placeStateAt(mk, range.max);
    assert.ok(end === "living" || end === "ruin", "every place resolves by the present year");
  }

  // seed 42 has a ruin: it must read living between founding and abandonment
  const ruin = marks.find((mk) => mk.ruinYear !== null);
  assert.ok(ruin, "seed 42 has a ruin with a resolvable abandonment year");
  assert.equal(placeStateAt(ruin!, ruin!.founded), "living");
  assert.equal(placeStateAt(ruin!, ruin!.ruinYear!), "ruin");

  const plan = buildSweepPlan(range, m.events.map((e) => e.year));
  assert.equal(sweepYearAt(plan, 0), range.min);
  assert.equal(sweepYearAt(plan, plan.totalMs), range.max);
});
