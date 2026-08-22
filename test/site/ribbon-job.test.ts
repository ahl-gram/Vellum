import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { roadMask, roadReachable, roadWalk } from "../../src/itinerary/route.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import type { World } from "../../src/world/types.ts";

// A hash a visitor can type is the untrusted boundary here: every way of asking for a journey that
// does not exist has to land somewhere sensible rather than throw a stack at the page.

const world = generateWorld(defaultRecipe(42));
const mask = roadMask(world);
const capital = world.settlements.findIndex((s) => s.kind === "capital");
const reachable = roadReachable(world, mask, capital);
const stranded = world.settlements.findIndex((_, i) => i !== capital && !reachable.includes(i));

test("ribbonResultFor renders through ribbonSvgFor byte-for-byte and reports the journey it drew", () => {
  const res = ribbonResultFor(world, { from: capital, to: reachable[0]!, dress: "antique" });
  const input = buildRibbonInput(world, capital, reachable[0]!);
  assert.ok(input, "the journey builds");
  assert.equal(res.svg, ribbonSvgFor(input, "antique"), "the job adds no ink of its own");
  assert.equal(res.fromIdx, capital);
  assert.equal(res.toIdx, reachable[0]);
  assert.equal(res.fromName, world.settlements[capital]!.name);
  assert.equal(res.leagues, input.totalLeagues);
  assert.equal(res.title, world.title.title);
  assert.equal(res.options.length, world.settlements.length, "every settlement is offered");
  assert.deepEqual(res.reachable, reachable);
});

test("an invalid `from` falls back to the capital rather than refusing the page", () => {
  for (const from of [null, -1, 9999, 2.5]) {
    assert.equal(
      ribbonResultFor(world, { from, to: null, dress: "antique" }).fromIdx,
      capital,
      `from=${String(from)} sets out from the capital`,
    );
  }
});

test("a `to` that no road reaches is refused, and lands on the same road an absent `to` picks", () => {
  assert.ok(stranded >= 0, "seed 42 strands a settlement off the network");
  const res = ribbonResultFor(world, { from: capital, to: stranded, dress: "antique" });
  assert.notEqual(res.toIdx, stranded, "the stranded place is not drawn");
  assert.ok(reachable.includes(res.toIdx), "the fallback is somewhere a road actually goes");
  const dflt = ribbonResultFor(world, { from: capital, to: null, dress: "antique" });
  assert.equal(res.toIdx, dflt.toIdx, "and it is the same farthest road an absent `to` picks");
});

test("the fallback is the FARTHEST reachable road, not merely a reachable one", () => {
  const walks = reachable
    .map((i) => ({ i, len: roadWalk(world, mask, capital, i)?.length ?? -1 }))
    .sort((a, b) => b.len - a.len);
  const longest = walks[0]!;
  assert.ok(longest.len > walks[walks.length - 1]!.len, "the journeys genuinely differ in length");
  assert.equal(
    ribbonResultFor(world, { from: capital, to: null, dress: "antique" }).toIdx,
    longest.i,
    `an absent 'to' unrolls the longest road (${world.settlements[longest.i]!.name}, ${longest.len} cells)`,
  );
});

test("a `from` that no road leaves falls back to the capital", () => {
  assert.ok(stranded >= 0, "seed 42 strands a settlement off the network");
  const res = ribbonResultFor(world, { from: stranded, to: null, dress: "antique" });
  assert.equal(res.fromIdx, capital, "the survey sets out from the capital instead");
  assert.notEqual(res.toIdx, stranded);
});

test("a reachable `to` is honored, and `to` equal to `from` falls back instead of drawing nothing", () => {
  const pick = reachable[3]!;
  assert.equal(ribbonResultFor(world, { from: capital, to: pick, dress: "antique" }).toIdx, pick);
  const same = ribbonResultFor(world, { from: capital, to: capital, dress: "antique" });
  assert.notEqual(same.toIdx, capital, "a journey from a place to itself is not a journey");
});

test("a world with no roads says so in the wayfarer's voice", () => {
  const roadless = { ...world, roads: [] } as World;
  assert.throws(
    () => ribbonResultFor(roadless, { from: null, to: null, dress: "antique" }),
    /no road leaves this place: the survey has nothing to unroll/,
  );
});

test("ribbonResultFor is deterministic: the same ask presses the same scroll", () => {
  const spec = { from: capital, to: reachable[2]!, dress: "ink" } as const;
  assert.equal(ribbonResultFor(world, spec).svg, ribbonResultFor(world, spec).svg);
});
