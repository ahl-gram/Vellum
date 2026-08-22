import test from "node:test";
import assert from "node:assert/strict";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import type { RibbonEvent } from "../../src/itinerary/events.ts";
import type { RibbonInput, RibbonSample } from "../../src/itinerary/input.ts";
import { BIOMES } from "../../src/climate/biomes.ts";

// #427: the ribbon's decorative forks were keyed by `Math.round` of a distance, and every distance
// here is a cumulative sum of Math.hypot steps, which no platform is obliged to round the same way.
// A value sitting on a .5 boundary therefore picked a different caption, tilt or glyph set on a
// different libm, off the same seed. Each test nudges exactly one such distance to the next lower
// double and demands the bytes hold. The `Math.round` precondition is asserted first, so a nudge
// too small to cross the boundary fails loudly instead of passing for the wrong reason.

/** bridgeMark's parapet, and fordMark's stepping stones: the two crossing glyphs, told apart structurally. */
const BRIDGE_MARK = "M-6.4 -3.4H6.4M-6.4 3.4H6.4";
const fordStones = (svg: string): number => svg.split('r="0.7"').length - 1;

function justBelow(x: number): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x);
  view.setBigUint64(0, view.getBigUint64(0) - 1n);
  return view.getFloat64(0);
}

function sampleAt(dist: number, biome: number): RibbonSample {
  return {
    x: 100,
    y: 100 + dist,
    dist,
    rel: 0.4,
    relL: 0.4,
    relR: 0.4,
    biomeL: biome,
    biomeR: biome,
  };
}

function inputWith(
  events: ReadonlyArray<RibbonEvent>,
  totalCells: number,
  biome: number,
): RibbonInput {
  const samples: RibbonSample[] = [];
  for (let d = 0; d <= 40; d++) samples.push(sampleAt(d, biome));
  samples.push(sampleAt(totalCells, biome));
  return {
    seed: 7,
    fromIdx: 0,
    toIdx: 5,
    fromName: "Aester",
    toName: "Bellry",
    fromKind: "capital",
    toKind: "town",
    realmName: "The Marches",
    worldName: "Test",
    year: 800,
    totalCells,
    totalLeagues: 18.4,
    samples,
    events,
  };
}

// Each caption fork picks from a three-entry list, so two different keys land on the same phrase
// about a third of the time. A single fixture is therefore a coin flip on whether it can see the
// regression at all, and 12.5 (the first value tried here) is one of the blind ones. These are the
// boundaries measured to discriminate for BOTH the bridge and the ford list, spread across strips.
const BOUNDARIES = [3.5, 10.5, 13.5, 21.5, 25.5];

test("a named crossing one double below a .5 boundary presses the same scroll (the bridge and tilt forks)", () => {
  for (const boundary of BOUNDARIES) {
    const lower = justBelow(boundary);
    assert.equal(Math.round(boundary), boundary + 0.5, `${boundary} rounds up`);
    assert.equal(Math.round(lower), boundary - 0.5, "and the double below it rounds down");
    const at = (dist: number): RibbonInput =>
      inputWith([{ kind: "crossing", k: 7, dist, name: "Aln", major: true }], 40, BIOMES.grassland);
    const drawn = ribbonSvgFor(at(boundary), "antique");
    assert.ok(drawn.includes("Aln"), `the fixture at ${boundary} actually draws its crossing`);
    assert.ok(drawn.includes(BRIDGE_MARK), `and draws it as a bridge at ${boundary}`);
    assert.equal(
      drawn,
      ribbonSvgFor(at(lower), "antique"),
      `one double of accumulated float must not repaint the river band or reword the crossing at ${boundary}`,
    );
  }
});

test("an unnamed crossing keeps its ford, which no other fixture here reaches", () => {
  for (const boundary of BOUNDARIES) {
    const at = (dist: number): RibbonInput =>
      inputWith([{ kind: "crossing", k: 7, dist, name: null, major: false }], 40, BIOMES.grassland);
    const drawn = ribbonSvgFor(at(boundary), "antique");
    // Not "something was painted": an unnamed crossing must be painted as a FORD, three stepping
    // stones, and never as a bridge. Diffing against an empty render cannot tell those apart.
    assert.equal(fordStones(drawn), 3, `the fixture at ${boundary} draws a ford's three stones`);
    assert.ok(!drawn.includes(BRIDGE_MARK), `and no bridge at ${boundary}`);
    assert.equal(drawn, ribbonSvgFor(at(justBelow(boundary)), "antique"), `the ford holds at ${boundary}`);
  }
});

test("a summit one double below a .5 boundary keeps its caption", () => {
  for (const boundary of BOUNDARIES) {
    const at = (dist: number): RibbonInput =>
      inputWith([{ kind: "summit", k: 7, dist, rel: 0.7 }], 40, BIOMES.grassland);
    const drawn = ribbonSvgFor(at(boundary), "antique");
    assert.notEqual(
      drawn,
      ribbonSvgFor(inputWith([], 40, BIOMES.grassland), "antique"),
      `the fixture at ${boundary} actually draws its summit`,
    );
    assert.equal(drawn, ribbonSvgFor(at(justBelow(boundary)), "antique"), `the summit holds at ${boundary}`);
  }
});

test("a strip boundary one double below .5 keeps its flanking decor (the decor fork)", () => {
  const lower = justBelow(40.5);
  assert.equal(Math.round(40.5 / 3), 14, "strip 1 starts on a rounding boundary");
  assert.equal(Math.round(lower / 3), 13, "and one double lower it rounds down");
  const at = (totalCells: number): RibbonInput => inputWith([], totalCells, BIOMES.temperateForest);
  const drawn = ribbonSvgFor(at(40.5), "antique");
  // A bare count is vacuous: the frame, road and league dots already clear any fixed threshold with
  // no decor at all. Grassland draws no glyph, so the DELTA is the decor and nothing else.
  const bare = ribbonSvgFor(inputWith([], 40.5, BIOMES.grassland), "antique");
  assert.ok(
    drawn.split("<path").length - bare.split("<path").length > 0,
    "the fixture actually draws flanking decor, measured against a treeless twin",
  );
  assert.equal(
    drawn,
    ribbonSvgFor(at(lower), "antique"),
    "one double of accumulated float must not reshuffle the wayside trees",
  );
});
