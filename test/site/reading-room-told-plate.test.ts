import { test } from "node:test";
import assert from "node:assert/strict";
import {
  armsBearing,
  surveyPlateRows,
  plateForTold,
  plateSpecsFor,
  plateKeyOf,
  type PlateSpec,
} from "../../src/site/reading-room/told-plate.ts";
import type { StoryBeat } from "../../src/site/reading-room/beats.ts";
import type { ToldEntry } from "../../src/site/living-chart/told.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { buildVoyagePlan } from "../../src/render/voyage.ts";

// #442 G: the survey half's picture. Ruled 2026-08-22: it changes only for a capital or
// a realm seat, the places whose plates hang arms, and HOLDS at the last one through
// towns, villages and hamlets. Pure, so the whole rule is provable without a browser.

const PRESENT = 1218;

// Row 0 is the capital the survey sets out from; 7 is a realm seat, a non-capital that
// still hangs arms, which is the case a kind-only test cannot see.
const ARMED = new Set([0, 7]);
const hasArms = (i: number): boolean => ARMED.has(i);

// A round trip: capital, two towns, a seat, two more towns, home to the capital.
const PORTS = [0, 3, 4, 7, 8, 9, 0];

const BEATS: StoryBeat[] = [
  { index: 0, year: 451, kind: "founding" },
  { index: 5, year: 620, kind: "founding" },
  { index: 5, year: 970, kind: "ruin" },
];

const survey = (row: number, index: number): ToldEntry => ({
  chamber: "survey",
  row,
  index,
  day: row * 9,
  text: `we came to ${index}`,
});

test("#442 the survey plate changes at a capital and holds through towns", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  assert.deepEqual(
    rows.map((r) => r?.index ?? null),
    [0, 0, 0, 7, 7, 7, 0],
    "the capital holds through rows 1 and 2, the seat takes over at row 3 and holds",
  );
  assert.equal(rows[0]?.year, PRESENT, "the survey's plates are drawn at the present year");
});

test("#442 a realm seat swaps the plate even though its kind is not capital", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  assert.notEqual(rows[3]?.index, rows[2]?.index, "arriving at the seat changes the picture");
  assert.equal(rows[3]?.index, 7, "and it is the seat's own plate");
  // The polarity: with the seat unarmed the same route holds the capital the whole way, so this assertion cannot pass by accident.
  const capitalOnly = surveyPlateRows(PORTS, (i) => i === 0, PRESENT);
  assert.deepEqual(capitalOnly.map((r) => r?.index ?? null), [0, 0, 0, 0, 0, 0, 0]);
});

test("#442 a town, village or hamlet arrival does NOT swap the plate", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  for (const row of [1, 2, 4, 5]) {
    assert.equal(rows[row]?.index, rows[row - 1]?.index, `row ${row} is a plain port and holds`);
  }
});

test("#442 the told row resolves to its plate in either half, and nothing before the first beat", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  assert.deepEqual(plateForTold(survey(3, 7), BEATS, rows), { index: 7, year: PRESENT });
  assert.deepEqual(
    plateForTold({ chamber: "ages", year: 700, text: "a war" }, BEATS, rows),
    { index: 5, year: 620 },
    "the chronicle half resolves through the story's beats, at the beat's own year",
  );
  assert.equal(
    plateForTold({ chamber: "ages", year: 450, text: "before" }, BEATS, rows),
    null,
    "before the first founding there is no plate",
  );
  assert.equal(plateForTold(null, BEATS, rows), null, "a teardown clears the plate");
});

test("#442 scrubbing BACK through the survey resolves the plate the forward sweep held", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  const forward = PORTS.map((idx, row) => plateForTold(survey(row, idx), BEATS, rows)?.index);
  const backward = [...PORTS]
    .map((idx, row) => ({ idx, row }))
    .reverse()
    .map(({ idx, row }) => plateForTold(survey(row, idx), BEATS, rows)?.index)
    .reverse();
  assert.deepEqual(backward, forward, "the row index decides, so no held state can leak backward");
});

test("#442 the prefetch set carries BOTH halves, deduped by index AND year", () => {
  const rows = surveyPlateRows(PORTS, hasArms, PRESENT);
  const specs = plateSpecsFor(BEATS, rows);
  const keys = specs.map(plateKeyOf).sort();
  assert.deepEqual(
    keys,
    ["0:1218", "0:451", "5:620", "5:970", "7:1218"].sort(),
    "the survey's ports join the beats, and the same town at two years is two plates",
  );
  const seen = new Set<string>();
  for (const s of specs as PlateSpec[]) {
    assert.equal(seen.has(plateKeyOf(s)), false, "no plate is pulled twice");
    seen.add(plateKeyOf(s));
  }
});

// The witness, without which the seat half of the rule is decoration: a real route
// carrying a real non-capital seat. Measured 2026-08-23 over seeds 1 to 40: 37 seeds put
// at least one on the route (seed 1 puts two, idx 1 and 4, both of kind "town"); seeds
// 3, 13 and 18 put none, so their picture holds the capital the whole survey.
test("#442 a real survey route swaps the plate at a seat whose KIND is only a town (seed 1)", () => {
  const world = generateWorld(defaultRecipe(1));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const route = plan.ports.map((p) => p.idx);

  const seats = route.filter((i) => byIdx.get(i)!.seat && byIdx.get(i)!.kind !== "capital");
  assert.ok(seats.length > 0, "seed 1's route carries a non-capital seat, so this guard can bite");

  // armsBearing is the SHIPPED predicate, called here rather than copied: the first cut of
  // this test hand-rolled `kind === "capital" || seat` and diffed it against a hand-rolled
  // kind-only closure, which proved surveyPlateRows reads its argument and proved nothing
  // about the rule. A kind-only mutation of the real wiring walked through it clean
  // (guard-prover, 2026-08-23), so the guard and app.ts now share ONE definition.
  const rows = surveyPlateRows(route, armsBearing(manifest.places), manifest.presentYear);
  const seatRow = route.indexOf(seats[0]!);
  assert.equal(rows[seatRow]?.index, seats[0], "the seat takes the picture on arrival");
  assert.notEqual(byIdx.get(seats[0]!)!.kind, "capital", "and its kind alone would have missed it");
  assert.notEqual(
    rows[seatRow]?.index,
    rows[seatRow - 1]?.index,
    "the picture actually CHANGES at the seat: reading kind alone would have held the capital here",
  );
});

test("#442 armsBearing reads the seat FLAG, not the settlement kind", () => {
  const world = generateWorld(defaultRecipe(1));
  const manifest = buildPlaceManifest(world, 1500);
  const armed = armsBearing(manifest.places);
  const seatTowns = manifest.places.filter((p) => p.seat && p.kind !== "capital");
  assert.ok(seatTowns.length > 0, "seed 1 has non-capital seats, so this can bite");
  for (const p of seatTowns) {
    assert.equal(armed(p.idx), true, `${p.name} is a realm seat of kind ${p.kind} and hangs arms`);
  }
  const capital = manifest.places.find((p) => p.kind === "capital")!;
  assert.equal(armed(capital.idx), true, "the capital hangs arms too");
  const plain = manifest.places.find((p) => !p.seat && p.kind !== "capital")!;
  assert.equal(armed(plain.idx), false, `${plain.name} hangs none, so the picture holds through it`);
});
