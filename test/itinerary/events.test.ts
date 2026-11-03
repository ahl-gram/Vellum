import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput, type RibbonInput } from "../../src/itinerary/input.ts";
import { eventCaption, ribbonTitle, stagesLine } from "../../src/itinerary/prose.ts";
import type { RibbonEvent } from "../../src/itinerary/events.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon } from "../../src/itinerary/dress/layout.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import { capitalJourneys } from "../../test-support/ribbon-fixtures.ts";
import { plateCaptions, sweepJourneys } from "../../test-support/ribbon-captions.ts";

// Issue #427 wrote "River Skeksvy"; the world says "River Skuksvy" and the golden says the engine has not moved: measured wins.

function journey(seed: number, toName: string): { input: RibbonInput; rng: ReturnType<typeof createRng> } {
  const world = generateWorld(defaultRecipe(seed));
  const from = world.settlements.findIndex((s) => s.kind === "capital");
  const to = world.settlements.findIndex((s) => s.name === toName);
  assert.ok(to >= 0, `seed ${seed} still has a settlement named ${toName}`);
  const input = buildRibbonInput(world, from, to);
  assert.ok(input, `seed ${seed}'s capital still reaches ${toName} by road`);
  return { input, rng: createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`) };
}

const only = <K extends RibbonEvent["kind"]>(input: RibbonInput, kind: K): Extract<RibbonEvent, { kind: K }>[] =>
  input.events.filter((e): e is Extract<RibbonEvent, { kind: K }> => e.kind === kind);

test("seed 15, Stanbyl to Svidsvikov: one river crossed, named, and major enough for a bridge", () => {
  const { input, rng } = journey(15, "Svidsvikov");
  const crossings = only(input, "crossing");
  assert.equal(crossings.length, 1, "the road crosses exactly one river");
  const river = crossings[0]!;
  assert.equal(river.name, "River Skuksvy");
  assert.equal(river.major, true, "a major river earns a bridge, not a ford");
  assert.match(
    eventCaption(river, rng),
    /bridge/,
    "and the caption says so, whichever of the three phrasings the fork picks",
  );
});

test("seed 42, Laukuwelua to Homaitani: a side road signed for Lamahai, and a summit on the way", () => {
  const { input } = journey(42, "Homaitani");
  const branches = only(input, "branch");
  assert.ok(
    branches.some((b) => b.toName === "Lamahai"),
    `a branch is signed for Lamahai; found ${branches.map((b) => b.toName).join(", ")}`,
  );
  const summits = only(input, "summit");
  assert.equal(summits.length, 1, "one summit is marked, the highest point of the way");
  // No rel assertion: input.samples holds the numbers summitEvent already compared, so it would re-derive the gate; the level journey below pins it.
});

test("a road that never rises above its ends is given no summit at all", () => {
  const world = generateWorld(defaultRecipe(2));
  const from = world.settlements.findIndex((s) => s.name === "Vunsvyov");
  const to = world.settlements.findIndex((s) => s.name === "Dru");
  assert.ok(from >= 0 && to >= 0, "seed 2 still names both ends");
  const input = buildRibbonInput(world, from, to);
  assert.ok(input, "and still joins them by road");
  assert.ok(input.events.length >= 3, "the journey does find other events, so the sweep is live");
  assert.equal(
    input.events.filter((e) => e.kind === "summit").length,
    0,
    "a road that stays level earns no 'here the road climbs'",
  );
});

test("an unnamed crossing is a real case in the world, not just a fixture", () => {
  const world = generateWorld(defaultRecipe(2));
  const from = world.settlements.findIndex((s) => s.name === "Vunsvyov");
  const to = world.settlements.findIndex((s) => s.name === "Zakvigrad");
  const input = buildRibbonInput(world, from, to);
  assert.ok(input, "seed 2 joins Vunsvyov to Zakvigrad by road");
  const fords = input.events.filter((e) => e.kind === "crossing" && e.name === null);
  assert.ok(fords.length > 0, "and the road fords an unnamed stream on the way");
});

test("a branch's caption names its town, with no fork to drift", () => {
  const { input, rng } = journey(42, "Homaitani");
  const lamahai = only(input, "branch").find((b) => b.toName === "Lamahai")!;
  assert.equal(eventCaption(lamahai, rng), "to Lamahai");
});

test("waypoints dedupe to one event per settlement, and both ends are flagged as endpoints", () => {
  for (const [seed, dest] of [
    [15, "Svidsvikov"],
    [42, "Homaitani"],
  ] as const) {
    const { input } = journey(seed, dest);
    const waypoints = only(input, "waypoint");
    const indices = waypoints.map((w) => w.index);
    assert.equal(new Set(indices).size, indices.length, `seed ${seed} names each settlement once`);
    const endpoints = waypoints.filter((w) => w.endpoint);
    assert.equal(endpoints.length, 2, `seed ${seed} flags exactly the two ends`);
    assert.equal(endpoints[0]!.name, input.fromName);
    assert.equal(endpoints[1]!.name, input.toName);
  }
});

test("events arrive in the order the road meets them, and every one sits on the road", () => {
  for (const [seed, dest] of [
    [15, "Svidsvikov"],
    [42, "Homaitani"],
  ] as const) {
    const { input } = journey(seed, dest);
    assert.ok(input.events.length > 3, `seed ${seed} finds events to order`);
    for (let i = 1; i < input.events.length; i++) {
      assert.ok(
        input.events[i]!.dist >= input.events[i - 1]!.dist,
        `seed ${seed} event ${i} does not travel backwards`,
      );
    }
    for (const e of input.events) {
      assert.ok(Number.isInteger(e.k) && e.k >= 0, "every event knows its integer step along the chain");
      assert.ok(e.dist >= 0 && e.dist <= input.totalCells, "and falls within the journey it belongs to");
    }
  }
});

test("the stages line names each stop at its own league and closes on the title's total", () => {
  const { input } = journey(42, "Homaitani");
  assert.equal(
    stagesLine(input),
    "From Laukuwelua to Noloatatani 32, to Won 69, to Homaitani 83 leagues",
    "each stop at its own league, the arrival at the title's rounded total",
  );
  const arrival = input.events.find((e) => e.kind === "waypoint" && e.index === input.toIdx)!;
  assert.equal(
    Math.round(arrival.dist / CELLS_PER_LEAGUE),
    82,
    "premise: the arrival's own league rounds to 82, the total to 83",
  );
  for (const seed of [15, 42]) {
    for (const each of capitalJourneys(generateWorld(defaultRecipe(seed)))) {
      const closing = /(\d+) leagues$/.exec(stagesLine(each))?.[1];
      const title = /containing (\d+) leagues/.exec(ribbonTitle(each).subtitle[0] ?? "")?.[1];
      assert.ok(title !== undefined, "the title names its total");
      assert.equal(
        closing,
        title,
        `seed ${seed} ${each.fromName} to ${each.toName}: the line closes on the title's total`,
      );
    }
  }
});

const BORDER_PHRASINGS = (n: string): string[] => [
  `here you enter ${n}`,
  `here begins ${n}`,
  `the road passes into ${n}`,
];
const WOOD_PHRASINGS = (n: string): string[] => [
  `the road enters ${n}`,
  `the way runs into ${n}`,
  `into the shade of ${n}`,
];

function captionsAtEachStep(make: (k: number) => RibbonEvent): string[] {
  return Array.from({ length: 30 }, (_, k) => eventCaption(make(k), createRng(7).fork("ribbon-0-5")));
}

test("a border's and a wood's caption take one of three phrasings each, picked by the event's own fork, and the world's name whole", () => {
  for (const name of ["The Tsardom of Gyksvu", "Greater Tolo"]) {
    const borders = captionsAtEachStep((k) => ({ kind: "border", dist: 1, k, name, fromName: "Aester Vale" }));
    assert.deepEqual([...new Set(borders)].sort(), BORDER_PHRASINGS(name).sort(), `${name} as a border`);
    assert.ok(
      borders.every((c) => !/\b[Tt]he The\b/.test(c)),
      `${name} never doubles its article`,
    );
  }
  for (const name of ["The Ferns of Peroa", "Deep Railo"]) {
    const woods = captionsAtEachStep((k) => ({ kind: "forest", dist: 1, k, name }));
    assert.deepEqual([...new Set(woods)].sort(), WOOD_PHRASINGS(name).sort(), `${name} as a wood`);
    assert.ok(
      woods.every((c) => !/\b[Tt]he The\b/.test(c)),
      `${name} never doubles its article`,
    );
  }
  const event: RibbonEvent = { kind: "border", dist: 1, k: 11, name: "Greater Tolo", fromName: "Aester Vale" };
  const once = (): string => eventCaption(event, createRng(7).fork("ribbon-0-5"));
  assert.equal(once(), once(), "the same event on a fresh fork says the same words: the fork, not a draw, decides");
});

test("a named crossing's caption takes one of three phrasings, and a river whose name starts with The keeps that The as its only article", () => {
  const told = (name: string): string[] =>
    [...new Set(captionsAtEachStep((k) => ({ kind: "crossing", dist: 1, k, name, major: true })))].sort();
  assert.deepEqual(
    told("The Riothi Run"),
    [
      "a bridge of stone over The Riothi Run",
      "a timber bridge over The Riothi Run",
      "here The Riothi Run is crossed by a bridge",
    ],
    "The Riothi Run is written with its own The and no other article",
  );
  assert.deepEqual(
    told("River Skuksvy"),
    [
      "a bridge of stone over the River Skuksvy",
      "a timber bridge over the River Skuksvy",
      "here the River Skuksvy is crossed by a bridge",
    ],
    "River Skuksvy keeps the phrasing's the",
  );
});

test("seed 42's default road says here begins The Hauwaiwa Atolls and the road enters The Ferns of Peroa", () => {
  const { input, rng } = journey(42, "Homaitani");
  assert.equal(eventCaption(only(input, "border")[0]!, rng), "here begins The Hauwaiwa Atolls");
  assert.equal(eventCaption(only(input, "forest")[0]!, rng), "the road enters The Ferns of Peroa");
});

test("seed 99's road from Mialiscove to Minmari reads a bridge of stone over The Lemarodorwater on the plate, in both dresses", () => {
  const { input } = journey(99, "Minmari");
  assert.equal(input.fromName, "Mialiscove", "premise: seed 99's capital is still Mialiscove");
  assert.ok(
    only(input, "crossing").some((c) => c.name === "The Lemarodorwater"),
    "premise: the road still crosses The Lemarodorwater",
  );
  for (const dress of ["antique", "ink"] as const) {
    const caption = plateCaptions(ribbonSvgFor(input, dress), layoutRibbon(input).strips)
      .map((c) => c.lines.map((l) => l.text).join(" "))
      .find((t) => t.includes("Lemarodorwater"));
    assert.ok(caption !== undefined, `${dress}: premise: the plate captions the crossing`);
    assert.equal(
      caption,
      "a bridge of stone over The Lemarodorwater",
      `${dress}: the plate prints the river's own The alone`,
    );
  }
});

test("every phrasing is told on the sweep", () => {
  const told = new Set<string>();
  for (const { input } of sweepJourneys()) {
    const rng = createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`);
    for (const e of input.events) {
      if (e.kind === "border" || e.kind === "forest") told.add(eventCaption(e, rng).replace(e.name, "N"));
    }
  }
  assert.deepEqual(
    [...told].sort(),
    [...BORDER_PHRASINGS("N"), ...WOOD_PHRASINGS("N")].sort(),
    "all three openings of each kind are heard",
  );
});
