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
  glyphRevealedBetween,
  inkGradeFor,
  eventIsPast,
  SWEEP_MS,
  sweepYearAt,
  sweepElapsedAt,
} from "../../src/render/chronicle-scrubber.ts";

// #54 (Chronicle year-scrubber): only the pure core; the DOM wiring lives in src/site/living-chart/chronicle.ts, covered by the Explorer e2e.
// Load-bearing: a ruined place is LIVING between founding and abandonment and only a RUIN once its ruin year passes; a ruin event sliced off the 14-event chronicle still crumbles at the present year, rather than never.

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

test("scrubRange spans the earliest founding to the present year", () => {
  const places = [
    mark({ idx: 0, kind: "capital", founded: 120 }),
    mark({ idx: 1, kind: "town", founded: 340 }),
    mark({ idx: 2, kind: "village", founded: 560 }),
  ];
  assert.deepEqual(scrubRange(places, 800), { min: 120, max: 800 });
});

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
  // history.ts caps the chronicle at 14 events and pushes ruins LAST, so a ruined place can have NO ruin event; it must still crumble at presentYear.
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
  // The discriminator: a naive ruined && year >= founded rule would mark the town a ruin from its founding on, never showing the centuries it thrived.
  const places = [mark({ idx: 0, kind: "village", founded: 400, ruined: true })];
  const events = [ev({ kind: "ruin", settlement: 0, year: 650, text: "Abandoned." })];
  const m = buildScrubMarks(places, events, 800)[0]!;
  assert.equal(placeStateAt(m, 399), "hidden", "not yet founded");
  assert.equal(placeStateAt(m, 400), "living", "founded; thriving");
  assert.equal(placeStateAt(m, 649), "living", "still thriving the year before it falls");
  assert.equal(placeStateAt(m, 650), "ruin", "crumbles in its abandonment year");
  assert.equal(placeStateAt(m, 800), "ruin");
});

// #93: the static chart bakes each settlement in its PRESENT-DAY state only, so a glyph can only be shown in the state it was drawn in ("state-begins").
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

// #155 ink-in: the scrubber must know WHICH marks crossed into view between the last painted year and this one, and WHICH grade each plays; both pure, the plumbing lives in the Explorer.

test("glyphRevealedBetween: true only on the frame that crosses a founding (#155)", () => {
  const m = { idx: 0, nx: 0.5, ny: 0.5, founded: 300, ruinYear: null };
  assert.equal(glyphRevealedBetween(m, 299, 300), true, "the crossing frame is the ink-in beat");
  assert.equal(glyphRevealedBetween(m, 250, 400), true, "a fast sweep may cross the founding in one frame");
  assert.equal(glyphRevealedBetween(m, 300, 301), false, "already up: no second stamp");
  assert.equal(glyphRevealedBetween(m, 100, 299), false, "still hidden: nothing to ink");
});

test("glyphRevealedBetween: a park (fromYear === toYear) reveals nothing (#155)", () => {
  // applyScrub and the #180 verso snap PARK the scrubber; a park must be silent, or glyphs already in place re-stamp.
  const m = { idx: 0, nx: 0.5, ny: 0.5, founded: 300, ruinYear: null };
  assert.equal(glyphRevealedBetween(m, 900, 900), false, "parking at the present is not a reveal");
  assert.equal(glyphRevealedBetween(m, 300, 300), false, "nor is parking on the founding year itself");
});

test("glyphRevealedBetween: scrubbing BACKWARDS is not a reveal (#155)", () => {
  // Hiding stays a hard cut: only the appearance carries a ceremony.
  const m = { idx: 0, nx: 0.5, ny: 0.5, founded: 300, ruinYear: null };
  assert.equal(glyphRevealedBetween(m, 400, 299), false, "shown -> hidden is not a reveal");
});

test("glyphRevealedBetween: a ruin's beat is its FALL year, not its founding (#155)", () => {
  // state-begins (#93): an eventually-ruined town has no living glyph baked, so its ruin glyph is what appears.
  const m = { idx: 1, nx: 0.5, ny: 0.5, founded: 400, ruinYear: 650 };
  assert.equal(glyphRevealedBetween(m, 399, 400), false, "its founding draws nothing, so it is no beat");
  assert.equal(glyphRevealedBetween(m, 649, 650), true, "the fall year is where the ruin inks in");
});

test("inkGradeFor: a living town is stamped, a ruin dries in (#155)", () => {
  // The two grades the CSS keys on: a founding presses a mark onto the sheet (inkStamp), a fall darkens into the record (dryingInk).
  assert.equal(inkGradeFor({ idx: 0, nx: 0.5, ny: 0.5, founded: 300, ruinYear: null }), "founding");
  assert.equal(inkGradeFor({ idx: 1, nx: 0.5, ny: 0.5, founded: 400, ruinYear: 650 }), "ruin");
});

test("eventIsPast is inclusive of the current year", () => {
  assert.equal(eventIsPast(500, 499), false);
  assert.equal(eventIsPast(500, 500), true, "an event lands in its own year");
  assert.equal(eventIsPast(500, 501), true);
});

// #54 shipped an event-proportional sweep; Alex reversed it on PR #311 (2026-07-28): the bar moves uniformly in years over the fixed SWEEP_MS and events no longer shape the pacing (the API takes no event years to consult).

test("sweepYearAt is linear: elapsed fractions map straight onto year fractions", () => {
  const range = { min: 0, max: 100 };
  assert.equal(sweepYearAt(range, 0), 0, "starts at the earliest founding");
  assert.equal(sweepYearAt(range, SWEEP_MS / 4), 25);
  assert.equal(sweepYearAt(range, SWEEP_MS / 2), 50);
  assert.equal(sweepYearAt(range, SWEEP_MS), 100, "ends at the present year");
  assert.equal(sweepYearAt(range, SWEEP_MS + 5000), 100, "stays at present past the end");
  assert.equal(sweepYearAt(range, -50), 0, "clamps below the start");
});

test("the sweep never goes backwards and covers the whole range", () => {
  const range = { min: 10, max: 90 };
  let prev = -Infinity;
  for (let t = 0; t <= SWEEP_MS; t += 7) {
    const y = sweepYearAt(range, t);
    assert.ok(y >= prev, `year went backwards at ${t}ms: ${y} < ${prev}`);
    prev = y;
  }
  assert.equal(sweepYearAt(range, 0), 10);
  assert.equal(sweepYearAt(range, SWEEP_MS), 90);
});

test("every interior year gets the same screen time: no beat-year plateaus", () => {
  // The 1ms tally that once proved the dwells now proves their absence.
  const range = { min: 0, max: 100 };
  const tally = new Map<number, number>();
  for (let t = 0; t <= SWEEP_MS; t++) {
    const y = sweepYearAt(range, t);
    tally.set(y, (tally.get(y) ?? 0) + 1);
  }
  const interior = [...tally.entries()].filter(([y]) => y > range.min && y < range.max).map(([, ms]) => ms);
  assert.equal(interior.length, range.max - range.min - 1, "every interior year appears");
  const spread = Math.max(...interior) - Math.min(...interior);
  assert.ok(spread <= 2, `interior years should share the sweep evenly, spread was ${spread}ms`);
});

test("a degenerate one-year range (min===max) holds its one year throughout", () => {
  const flat = { min: 500, max: 500 };
  assert.equal(sweepYearAt(flat, 0), 500);
  assert.equal(sweepYearAt(flat, SWEEP_MS / 2), 500);
  assert.equal(sweepYearAt(flat, SWEEP_MS), 500);
});

test("integration: seed 42 marks, range, and sweep are internally consistent", () => {
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  const marks = buildScrubMarks(m.places, m.events, m.presentYear);
  const range = scrubRange(m.places, m.presentYear);

  assert.equal(marks.length, m.places.length, "one mark per place");
  assert.equal(range.max, m.presentYear);

  for (const mk of marks) {
    assert.equal(placeStateAt(mk, range.min - 1), "hidden");
    const end = placeStateAt(mk, range.max);
    assert.ok(end === "living" || end === "ruin", "every place resolves by the present year");
  }

  const ruin = marks.find((mk) => mk.ruinYear !== null);
  assert.ok(ruin, "seed 42 has a ruin with a resolvable abandonment year");
  assert.equal(placeStateAt(ruin!, ruin!.founded), "living");
  assert.equal(placeStateAt(ruin!, ruin!.ruinYear!), "ruin");

  assert.equal(sweepYearAt(range, 0), range.min);
  assert.equal(sweepYearAt(range, SWEEP_MS), range.max);
});

test("integration: over seed 42's whole timeline every mark inks in exactly once (#155)", () => {
  // Visibility is monotonic in year, so a year walk finds each mark's one crossing frame; a double count means a glyph re-stamping mid-sweep, zero means a place that never gets its beat.
  const world = generateWorld(defaultRecipe(42));
  const m = buildPlaceManifest(world, 1500);
  const marks = buildScrubMarks(m.places, m.events, m.presentYear);
  const range = scrubRange(m.places, m.presentYear);

  for (const mk of marks) {
    let reveals = 0;
    for (let y = range.min; y <= range.max; y++) {
      if (glyphRevealedBetween(mk, y - 1, y)) reveals++;
    }
    assert.equal(reveals, 1, `mark ${mk.idx} should ink in exactly once, saw ${reveals}`);
  }

  const grades = new Set(marks.map(inkGradeFor));
  assert.deepEqual([...grades].sort(), ["founding", "ruin"]);
});

// sweepElapsedAt is the inverse #220's fused Play resumes from.

test("sweepElapsedAt round-trips every year through sweepYearAt exactly", () => {
  const range = { min: 300, max: 1100 };
  for (let y = range.min; y <= range.max; y += 41) {
    assert.equal(sweepYearAt(range, sweepElapsedAt(range, y)), y, `year ${y}`);
  }
});

test("sweepElapsedAt is monotone in year and clamps at the sweep's ends", () => {
  const range = { min: 300, max: 1100 };
  let prev = -1;
  for (let y = range.min; y <= range.max; y += 25) {
    const e = sweepElapsedAt(range, y);
    assert.ok(e >= prev, `elapsed went backward at year ${y}`);
    prev = e;
  }
  assert.equal(sweepElapsedAt(range, range.min), 0);
  assert.equal(sweepElapsedAt(range, range.min - 100), 0);
  assert.equal(sweepElapsedAt(range, range.max), SWEEP_MS);
  assert.equal(sweepElapsedAt(range, range.max + 100), SWEEP_MS);
});

test("a degenerate range pins its ends: at-or-past the one year is the sweep's end", () => {
  const flat = { min: 500, max: 500 };
  assert.equal(sweepElapsedAt(flat, 500), SWEEP_MS);
  assert.equal(sweepElapsedAt(flat, 499), 0);
});
