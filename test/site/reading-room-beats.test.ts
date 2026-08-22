import { test } from "node:test";
import assert from "node:assert/strict";
import { storyBeats, latestBeatAt, type StoryBeat } from "../../src/site/reading-room/beats.ts";
import { eventIsPast } from "../../src/render/chronicle-scrubber.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { HistoricalEvent } from "../../src/society/history.ts";

const EVENTS: HistoricalEvent[] = [
  { year: 451, kind: "founding", settlement: 0, text: "Alpha was founded." },
  { year: 520, kind: "rise", settlement: 1, text: "Beta rose." },
  { year: 700, kind: "war", realm: 0, text: "A war was fought." },
  { year: 900, kind: "ruin", settlement: 3, text: "Gamma fell to ruin." },
  { year: 950, kind: "founding", text: "A nameless place with no settlement index." },
];

test("#402 storyBeats keeps foundings and ruins that name a settlement, in story order", () => {
  assert.deepEqual(storyBeats(EVENTS), [
    { index: 0, year: 451, kind: "founding" },
    { index: 3, year: 900, kind: "ruin" },
  ]);
});

test("#402 storyBeats on the real seed-42 world matches its journal's own beats", () => {
  const world = generateWorld(defaultRecipe(42));
  const beats = storyBeats(world.history.events);
  const expected = world.history.events
    .filter((e) => (e.kind === "founding" || e.kind === "ruin") && e.settlement !== undefined)
    .map((e) => ({ index: e.settlement, year: e.year, kind: e.kind }));
  assert.deepEqual(beats, expected);
  assert.ok(beats.length >= 3, "the capital and the two earliest towns at least");
  for (const b of beats) {
    assert.ok(b.index >= 0 && b.index < world.settlements.length, "a beat's settlement index is real");
  }
});

test("#402 latestBeatAt lights exactly when the journal row inks", () => {
  const beats: StoryBeat[] = [
    { index: 0, year: 451, kind: "founding" },
    { index: 5, year: 620, kind: "founding" },
    { index: 3, year: 900, kind: "ruin" },
  ];
  assert.equal(latestBeatAt(beats, 450), null, "before the first founding, no plate");
  assert.deepEqual(latestBeatAt(beats, 451), beats[0], "the founding year itself is past, like eventIsPast");
  assert.equal(eventIsPast(451, 451), true, "the shared past semantics this test mirrors");
  assert.deepEqual(latestBeatAt(beats, 800), beats[1]);
  assert.deepEqual(latestBeatAt(beats, 1218), beats[2], "at the present, the last beat stands");
  assert.equal(latestBeatAt([], 1218), null, "no beats, no plate");
});

test("#402 equal-year beats resolve to the first in story order (seed 42's twin ruins)", () => {
  const beats: StoryBeat[] = [
    { index: 19, year: 1039, kind: "ruin" },
    { index: 22, year: 1039, kind: "ruin" },
  ];
  assert.deepEqual(latestBeatAt(beats, 1059), beats[0], "the chronicle lists them in order; the first holds the stage");
});

test("#402 latestBeatAt picks by year even when beats arrive unordered", () => {
  const beats: StoryBeat[] = [
    { index: 3, year: 900, kind: "ruin" },
    { index: 0, year: 451, kind: "founding" },
  ];
  assert.deepEqual(latestBeatAt(beats, 1000), beats[0]);
  assert.deepEqual(latestBeatAt(beats, 500), beats[1]);
});
