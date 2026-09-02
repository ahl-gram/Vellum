import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { roadMask, roadReachable, roadWalk } from "../../src/itinerary/route.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { createRng } from "../../src/core/rng.ts";
import { eventCaption } from "../../src/itinerary/prose.ts";
import { eventSeat, layoutRibbon, RIBBON_H, RIBBON_W } from "../../src/itinerary/dress/layout.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
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

// #463 part 4/4: the slip's itinerary is the plate's own events with the plate's own captions, each seated on the scroll for the Glass.
test("ribbonResultFor carries the itinerary: every event with its league mark, the plate's caption, its tier and index for a waypoint, and its seat on the scroll", () => {
  const res = ribbonResultFor(world, { from: capital, to: reachable[0]!, dress: "antique" });
  const input = buildRibbonInput(world, capital, reachable[0]!)!;
  const rng = createRng(input.seed).fork(`ribbon-${input.fromIdx}-${input.toIdx}`);
  const layout = layoutRibbon(input);
  assert.equal(res.year, input.year);
  assert.equal(res.realm, input.realmName);
  assert.equal(res.events.length, input.events.length, "one row per event");
  assert.ok(res.events.length >= 4, "premise: the road has events");
  input.events.forEach((e, i) => {
    const row = res.events[i]!;
    const seat = eventSeat(layout, e.dist);
    assert.equal(row.kind, e.kind);
    assert.ok(Math.abs(row.leagues - e.dist / CELLS_PER_LEAGUE) < 1e-9, "the league mark");
    assert.equal(row.text, eventCaption(e, rng), "the plate's own caption, from the plate's own fork");
    if (e.kind === "waypoint") {
      assert.equal(row.tier, e.tier);
      assert.equal(row.index, e.index);
    } else {
      assert.ok(!("tier" in row) && !("index" in row), "only a waypoint names a place");
    }
    assert.ok(Math.abs(row.nx - seat.sx / RIBBON_W) < 1e-9 && Math.abs(row.ny - seat.sy / RIBBON_H) < 1e-9, `row ${i} is seated where the plate drew it`);
    assert.ok(row.nx > 0 && row.nx < 1 && row.ny > 0 && row.ny < 1, "a seat is a fraction of the plate");
  });
  const seats = new Set(res.events.map((r) => `${r.nx.toFixed(4)},${r.ny.toFixed(4)}`));
  assert.ok(seats.size > 1, "the rows do not all lean on one spot");
});
