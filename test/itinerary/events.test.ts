import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput, type RibbonInput } from "../../src/itinerary/input.ts";
import { eventCaption } from "../../src/itinerary/prose.ts";
import type { RibbonEvent } from "../../src/itinerary/events.ts";

// #427 item 3: what the road actually passes, pinned against two journeys measured on this branch
// 2026-08-22. The issue named seed 15's river "River Skeksvy"; the world says "River Skuksvy", and
// the covenant golden plus a single commit touching src/itinerary since #425 say the engine has not
// moved, so the issue carries a transcription slip and the measured name is the one pinned here.

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
  assert.ok(summits[0]!.rel > 0.05, "and it stands above the ends of the road");
});

test("a branch's caption names its town, with no fork to drift", () => {
  const { input, rng } = journey(42, "Homaitani");
  const lamahai = only(input, "branch").find((b) => b.toName === "Lamahai")!;
  assert.equal(eventCaption(lamahai, rng), "to Lamahai");
});

test("waypoints dedupe to one event per settlement, and both ends are flagged as endpoints", () => {
  for (const [seed, dest] of [[15, "Svidsvikov"], [42, "Homaitani"]] as const) {
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
  for (const [seed, dest] of [[15, "Svidsvikov"], [42, "Homaitani"]] as const) {
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
