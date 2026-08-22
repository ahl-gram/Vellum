import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { roadMask, roadReachable, roadWalk } from "../../src/itinerary/route.ts";

// #427 item 2: the route walk's contracts. Everything the ribbon draws hangs off the chain
// roadWalk returns, so the chain's own shape is the first thing worth pinning: it starts and
// ends where it was asked to, it never leaves the road, and it never teleports.

const world = generateWorld(defaultRecipe(42));
const mask = roadMask(world);
const W = world.elev.w;
const capital = world.settlements.findIndex((s) => s.kind === "capital");
const cellOf = (i: number): number => {
  const s = world.settlements[i]!;
  return s.x + s.y * W;
};

test("roadMask covers every road point and every settlement, and nothing is off-grid", () => {
  assert.ok(world.roads.length > 0, "seed 42 has roads to mask");
  for (const road of world.roads) {
    for (const p of road.points) assert.equal(mask[p.x + p.y * W], 1, "a road point is on the mask");
  }
  for (const s of world.settlements) {
    assert.equal(mask[s.x + s.y * W], 1, `${s.name} is on the mask`);
  }
});

test("roadWalk returns a chain that starts and ends at the chosen settlements, stays on the road, and steps 8-neighbour", () => {
  const reachable = roadReachable(world, mask, capital);
  assert.ok(reachable.length >= 10, "seed 42's capital reaches a real road network");
  let walked = 0;
  for (const to of reachable) {
    const chain = roadWalk(world, mask, capital, to);
    assert.ok(chain, `the capital walks to ${world.settlements[to]!.name}`);
    assert.equal(chain[0], cellOf(capital), "the chain sets out from the first settlement's cell");
    assert.equal(chain[chain.length - 1], cellOf(to), "and arrives at the second's");
    for (const c of chain) assert.equal(mask[c], 1, "every step of the chain is on the road mask");
    for (let k = 1; k < chain.length; k++) {
      const a = chain[k - 1]!;
      const b = chain[k]!;
      const dx = Math.abs((a % W) - (b % W));
      const dy = Math.abs(((a / W) | 0) - ((b / W) | 0));
      assert.ok(dx <= 1 && dy <= 1 && dx + dy > 0, `step ${k} is a single 8-neighbour hop`);
    }
    walked++;
  }
  assert.equal(walked, reachable.length, "every settlement roadReachable lists actually walks");
});

test("roadWalk refuses a journey that goes nowhere or cannot be made", () => {
  assert.equal(roadWalk(world, mask, capital, capital), null, "a place is not a journey from itself");
  assert.equal(roadWalk(world, mask, capital, world.settlements.length), null, "past-the-end is refused");
  assert.equal(roadWalk(world, mask, -1, capital), null, "a negative index is refused");
  const reachable = roadReachable(world, mask, capital);
  const stranded = world.settlements.findIndex((_, i) => i !== capital && !reachable.includes(i));
  assert.ok(stranded >= 0, "seed 42 strands at least one settlement off the road network");
  assert.equal(
    roadWalk(world, mask, capital, stranded),
    null,
    `${world.settlements[stranded]!.name} has no road to the capital, and the walk says so`,
  );
});

test("roadReachable never lists the place you set out from, and is symmetric with the walk", () => {
  const reachable = roadReachable(world, mask, capital);
  assert.ok(!reachable.includes(capital), "you do not travel to where you already are");
  assert.equal(new Set(reachable).size, reachable.length, "no settlement is listed twice");
  const stranded = world.settlements.findIndex((_, i) => i !== capital && !reachable.includes(i));
  assert.ok(
    !roadReachable(world, mask, stranded).includes(capital),
    "a stranded settlement cannot reach the capital either",
  );
});

test("roadReachable from an index that is not a settlement is empty, not a crash", () => {
  assert.deepEqual(roadReachable(world, mask, world.settlements.length), []);
  assert.deepEqual(roadReachable(world, mask, -1), []);
});
