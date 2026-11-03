import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { borderSteps, woodEntries } from "../../src/itinerary/realm-wood.ts";
import { buildRibbonInput, type RibbonInput } from "../../src/itinerary/input.ts";
import { layoutRibbon, stripFor } from "../../src/itinerary/dress/layout.ts";
import type { RibbonEvent } from "../../src/itinerary/events.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { capitalJourneys, namedJourney } from "../../test-support/ribbon-fixtures.ts";
import { sweepJourneys } from "../../test-support/ribbon-captions.ts";
import type { World } from "../../src/world/types.ts";

const only = <K extends RibbonEvent["kind"]>(input: RibbonInput, kind: K): Extract<RibbonEvent, { kind: K }>[] =>
  input.events.filter((e): e is Extract<RibbonEvent, { kind: K }> => e.kind === kind);

test("a border fires where the road passes into another named realm and stays three cells, or stays to the road's end", () => {
  const cases: Array<[number[], Array<{ k: number; from: number; to: number }>]> = [
    [[0, 0, 0, 1, 1, 1, 1], [{ k: 3, from: 0, to: 1 }]],
    [[0, 0, 0, 1, 1, 0, 0, 0], []],
    [
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [
        { k: 3, from: 0, to: 1 },
        { k: 6, from: 1, to: 0 },
      ],
    ],
    [[0, 0, 0, 0, 1], [{ k: 4, from: 0, to: 1 }]],
    [[0, 0, 1, 1, 2, 2, 2], [{ k: 4, from: 0, to: 2 }]],
    [[0, 0, -1, -1, 1, 1, 1], [{ k: 4, from: 0, to: 1 }]],
    [[0, -1, -1, 0, 0], []],
    [[-1, -1, 0, 0, 0, 1, 1, 1], [{ k: 5, from: 0, to: 1 }]],
    [[], []],
    [[-1, -1], []],
    [[0, 0, -1, -1, -1, 0, 0], []],
    [[0, 0, -1, -1], []],
  ];
  for (const [labels, want] of cases) assert.deepEqual(borderSteps(labels), want, `labels ${JSON.stringify(labels)}`);
});

const run = (...parts: Array<[number, boolean]>): boolean[] =>
  parts.flatMap(([n, inside]) => Array.from({ length: n }, () => inside));

test("the road enters the wood on a stay of six cells, once it has been twenty-four cells clear of it", () => {
  assert.deepEqual(woodEntries(run([30, false], [6, true])), [30]);
  assert.deepEqual(woodEntries(run([30, false], [5, true], [30, false])), [], "a nick of the edge is no entry");
  assert.deepEqual(woodEntries(run([10, true], [30, false], [6, true])), [40], "leaving it and coming back is");
  assert.deepEqual(woodEntries(run([30, false], [6, true], [23, false], [6, true])), [30], "23 clear is too soon");
  assert.deepEqual(woodEntries(run([30, false], [6, true], [24, false], [6, true])), [30, 60], "24 clear is enough");
  assert.deepEqual(woodEntries(run([30, false], [3, true])), [30], "a stay that reaches the road's end counts");
  assert.deepEqual(woodEntries(run([5, false], [6, true])), [5], "a road that sets out near the wood enters it");
  assert.deepEqual(
    woodEntries(run([10, true], [3, false], [6, true])),
    [],
    "a road that sets out inside has not entered",
  );
});

const world42 = generateWorld(defaultRecipe(42));
const road42 = ribbonResultFor(world42, { from: null, to: null, dress: "antique" });
const input42 = buildRibbonInput(world42, road42.fromIdx, road42.toIdx)!;
const stripOf = (input: RibbonInput, dist: number): number | undefined => stripFor(layoutRibbon(input), dist)?.index;

test("seed 42's default road crosses one border, into The Hauwaiwa Atolls at step 74, and enters The Ferns of Peroa once, at step 37; a world of one realm crosses none", () => {
  const borders = only(input42, "border");
  assert.equal(borders.length, 1);
  const border = borders[0]!;
  assert.equal(border.k, 74);
  assert.equal(border.name, "The Hauwaiwa Atolls");
  assert.equal(border.fromName, "The Chiefdom of Rekekoa");
  assert.equal(stripOf(input42, border.dist), 2);
  const woods = only(input42, "forest");
  assert.equal(woods.length, 1);
  assert.equal(woods[0]!.k, 37);
  assert.equal(woods[0]!.name, "The Ferns of Peroa");
  assert.equal(stripOf(input42, woods[0]!.dist), 1);

  const world3 = generateWorld(defaultRecipe(3));
  assert.equal(world3.names.realms.length, 0, "premise: seed 3 has one realm");
  const journeys = capitalJourneys(world3);
  assert.ok(journeys.length > 0, "premise: and roads to walk");
  for (const j of journeys) assert.equal(only(j, "border").length, 0, `${j.fromName} to ${j.toName} crosses no border`);

  const unnamed = { ...world42, names: { ...world42.names, forest: null } } as World;
  assert.equal(only(buildRibbonInput(unnamed, road42.fromIdx, road42.toIdx)!, "forest").length, 0);
});

test("every road arrives in the realm its last border names, the arrival standing one cell across a line included", () => {
  const journeys = [
    ...sweepJourneys().map((j) => j.input),
    namedJourney(generateWorld(defaultRecipe(11)), "Laihe", "Moakikoa"),
  ];
  assert.ok(journeys.filter((j) => only(j, "border").length > 0).length >= 30, "premise: the sweep crosses borders");
  assert.ok(
    journeys.some((j) => only(j, "border").length >= 2),
    "premise: and one road crosses two",
  );
  for (const j of journeys) {
    const last = only(j, "border").at(-1);
    assert.equal(last === undefined ? j.realmFrom : last.name, j.realmName, `${j.fromName} to ${j.toName}`);
  }
  const seed11 = journeys[journeys.length - 1]!;
  const last = only(seed11, "border").at(-1)!;
  assert.equal(last.name, "Greater Lalau", "premise: seed 11's border is into the arrival's realm");
  assert.equal(last.fromName, "The Tararu Atolls");
  assert.equal(last.k, 130, "premise: it falls on the road's last chain step");
  assert.equal(last.dist, seed11.totalCells, "premise: at the road's exact end");
  const arrival = seed11.events.find((e) => e.kind === "waypoint" && e.index === seed11.toIdx)!;
  assert.equal(arrival.k, 129, "premise: one cell after the arrival's waypoint, so the run is a single cell");
});
