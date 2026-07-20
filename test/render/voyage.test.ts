import { test } from "node:test";
import assert from "node:assert/strict";
import type { PlaceMark } from "../../src/render/place-manifest.ts";
import { buildVoyagePlan, frameAt } from "../../src/render/voyage.ts";

// Unit tests for #118 (Sub 1 of the Wayfarer's Passage epic #117): the pure core
// that turns a place manifest into a deterministic survey itinerary. No DOM, no
// RNG. The animated overlay (docs/explorer/voyage.js) is Sub 2 and is covered by
// the Explorer e2e; only the deterministic plan math is tested here.
//
// Two load-bearing behaviours:
//  1. The plan starts at the single capital and an OPEN path visits every living
//     town and village exactly once (legs.length === ports.length - 1).
//  2. Every selection keys on the settlement's `idx`, never its array position,
//     so a shuffled input yields a byte-identical plan. That is the determinism
//     promise the epic makes ("same seed, same voyage").

const mark = (over: Partial<PlaceMark> = {}): PlaceMark => ({
  idx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 300,
  ruined: false,
  seat: false,
  nx: 0.5,
  ny: 0.5,
  // #120 added the grid cell to PlaceMark. buildVoyagePlan orders ports by the chart
  // fractions nx/ny and never reads gx/gy, so these are filler here, not fixtures.
  gx: 0,
  gy: 0,
  ...over,
});

// A small hand-laid world whose sweep order is unambiguous. The capital sits at the
// origin; A/C/B march out collinearly along the x-axis at 0.1 / 0.2 / 0.3, so the tour
// is just the line in order, no ring and no detour.
const capital = mark({ idx: 0, name: "Aelmoor", kind: "capital", founded: 812, nx: 0, ny: 0 });
const townA = mark({ idx: 1, name: "Nailo", kind: "town", founded: 947, nx: 0.1, ny: 0 });
const townB = mark({ idx: 2, name: "Bexley", kind: "town", founded: 1003, nx: 0.3, ny: 0 });
const villageC = mark({ idx: 3, name: "Corr", kind: "village", founded: 1044, nx: 0.2, ny: 0 });
const lineWorld = [capital, townA, townB, villageC];

test("plan starts at the capital", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.equal(plan.ports.length, 4);
  assert.equal(plan.ports[0].idx, 0);
  assert.equal(plan.ports[0].name, "Aelmoor");
});

test("collinear ports sweep along the line in order, no backtrack", () => {
  // On the x-axis the tour is just the sorted line: 0 (x=0) -> 1 (0.1) -> 3 (0.2) ->
  // 2 (0.3). The order carries idx 3 before 2 because C sits between A and B.
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.deepEqual(
    plan.ports.map((p) => p.idx),
    [0, 1, 3, 2],
  );
});

test("the tour does not cross itself on a ring layout nearest-neighbour would tangle", () => {
  // Capital at the top, a ring of towns, and one inland town near the centre: greedy
  // NN dives inland then jumps back, crossing its own track. The swept tour must not.
  const ringWorld = [
    mark({ idx: 0, name: "Cap", kind: "capital", nx: 0.5, ny: 0.9 }),
    mark({ idx: 1, name: "W", kind: "town", nx: 0.1, ny: 0.5 }),
    mark({ idx: 2, name: "E", kind: "town", nx: 0.9, ny: 0.5 }),
    mark({ idx: 3, name: "S", kind: "town", nx: 0.5, ny: 0.1 }),
    mark({ idx: 4, name: "Mid", kind: "village", nx: 0.5, ny: 0.45 }),
  ];
  const plan = buildVoyagePlan(ringWorld, 1059);
  const at = new Map(ringWorld.map((p) => [p.idx, p]));
  const o = (a: PlaceMark, b: PlaceMark, c: PlaceMark) =>
    Math.sign((b.nx - a.nx) * (c.ny - a.ny) - (b.ny - a.ny) * (c.nx - a.nx));
  const crosses = (a: PlaceMark, b: PlaceMark, c: PlaceMark, d: PlaceMark) =>
    o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b) &&
    o(a, b, c) !== 0 && o(a, b, d) !== 0 && o(c, d, a) !== 0 && o(c, d, b) !== 0;
  const legs = plan.legs.map((l) => [at.get(l.fromIdx)!, at.get(l.toIdx)!] as const);
  for (let i = 0; i < legs.length; i++) {
    for (let j = i + 2; j < legs.length; j++) {
      assert.ok(!crosses(legs[i]![0], legs[i]![1], legs[j]![0], legs[j]![1]),
        `legs ${i} and ${j} cross`);
    }
  }
});

test("legs are an open path of consecutive ports (no return leg)", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.equal(plan.legs.length, plan.ports.length - 1);
  for (let i = 1; i < plan.ports.length; i++) {
    assert.deepEqual(plan.legs[i - 1], {
      fromIdx: plan.ports[i - 1].idx,
      toIdx: plan.ports[i].idx,
    });
  }
});

test("visits every living town and village exactly once", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  const visited = plan.ports.map((p) => p.idx).sort((a, b) => a - b);
  assert.deepEqual(visited, [0, 1, 2, 3]);
});

test("ruined destinations are excluded", () => {
  const world = [capital, townA, mark({ idx: 2, name: "Ashmark", kind: "town", ruined: true, nx: 0.3, ny: 0 })];
  const plan = buildVoyagePlan(world, 1059);
  const visited = plan.ports.map((p) => p.idx);
  assert.ok(!visited.includes(2), "ruined town must not be a port");
  assert.ok(
    plan.legs.every((l) => l.fromIdx !== 2 && l.toIdx !== 2),
    "no leg may reference a ruin",
  );
});

test("every log line carries the survey year and the port name", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  for (const port of plan.ports) {
    assert.match(port.logLine, /Year 1059:/, `"${port.logLine}" must carry the year`);
    assert.ok(port.logLine.includes(port.name), `"${port.logLine}" must name the port`);
  }
});

test("no em-dashes in log copy", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  for (const port of plan.ports) {
    assert.ok(!port.logLine.includes("—"), "house rule: no em-dashes");
  }
});

test("deterministic for a fixed input", () => {
  const a = buildVoyagePlan(lineWorld, 1059);
  const b = buildVoyagePlan(lineWorld, 1059);
  assert.deepEqual(a, b);
});

test("stable under shuffled input order (idx tiebreaks, not array position)", () => {
  // Two candidates equidistant from the capital: idx 1 at (-0.1,0) and idx 2 at
  // (0.1,0). A position-keyed tiebreak would flip when the array is reversed; an
  // idx-keyed one always visits idx 1 first. The whole plan must be identical.
  const cap = mark({ idx: 0, kind: "capital", nx: 0, ny: 0 });
  const west = mark({ idx: 1, name: "West", kind: "town", nx: -0.1, ny: 0 });
  const east = mark({ idx: 2, name: "East", kind: "town", nx: 0.1, ny: 0 });
  const forward = buildVoyagePlan([cap, west, east], 1059);
  const shuffled = buildVoyagePlan([east, cap, west], 1059);
  assert.deepEqual(forward, shuffled);
  assert.deepEqual(
    forward.ports.map((p) => p.idx),
    [0, 1, 2],
    "equidistant tiebreak resolves to the lower idx first",
  );
});

test("no capital yields an empty plan", () => {
  const plan = buildVoyagePlan([townA, townB], 1059);
  assert.deepEqual(plan, { ports: [], legs: [] });
});

test("a capital-only world is a one-port survey with no legs", () => {
  const plan = buildVoyagePlan([capital], 1059);
  assert.equal(plan.ports.length, 1);
  assert.equal(plan.ports[0].idx, 0);
  assert.deepEqual(plan.legs, []);
});

test("a ruined capital still anchors the survey as its home port", () => {
  const ruinedCap = mark({ idx: 0, name: "Aelmoor", kind: "capital", ruined: true, nx: 0, ny: 0 });
  const plan = buildVoyagePlan([ruinedCap, townA], 1059);
  assert.equal(plan.ports[0].idx, 0);
  assert.equal(plan.ports.length, 2);
});

test("empty input yields an empty plan", () => {
  assert.deepEqual(buildVoyagePlan([], 1059), { ports: [], legs: [] });
});

test("does not mutate the caller's places array (immutability rule)", () => {
  // A frozen input catches any refactor that drops the internal scratch copy and
  // mutates the caller's array directly (splice/push would throw in strict mode);
  // the deep-equal catches element-level mutation.
  const input = [capital, townA, townB, villageC];
  const snapshot = input.map((p) => ({ ...p }));
  Object.freeze(input);
  const plan = buildVoyagePlan(input, 1059);
  assert.equal(plan.ports.length, 4);
  assert.deepEqual(input, snapshot);
});

// --- frameAt: the pure animation timeline (#119) ------------------------------

test("frameAt: a one-port survey rests at the origin", () => {
  assert.deepEqual(frameAt(0, 0), { legIndex: -1, legT: 0, arrived: 1 });
  assert.deepEqual(frameAt(0, 0.7), { legIndex: -1, legT: 0, arrived: 1 });
  assert.deepEqual(frameAt(0, 1), { legIndex: -1, legT: 0, arrived: 1 });
});

test("frameAt: t=0 sits at the origin, about to start the first leg", () => {
  assert.deepEqual(frameAt(3, 0), { legIndex: 0, legT: 0, arrived: 1 });
});

test("frameAt: t=1 completes the last leg with every port arrived", () => {
  assert.deepEqual(frameAt(3, 1), { legIndex: 2, legT: 1, arrived: 4 });
});

test("frameAt: mid-leg splits equally across legs", () => {
  // 3 legs, t=0.5 -> scaled 1.5 -> leg 1 at half, ports 0 and 1 arrived.
  assert.deepEqual(frameAt(3, 0.5), { legIndex: 1, legT: 0.5, arrived: 2 });
});

test("frameAt: an exact port arrival lands at the start of the next leg", () => {
  // 4 legs, t=2/4 -> just reached port 2, about to start leg 2.
  assert.deepEqual(frameAt(4, 0.5), { legIndex: 2, legT: 0, arrived: 3 });
});

test("frameAt: t is clamped to [0,1]", () => {
  assert.deepEqual(frameAt(3, -0.5), { legIndex: 0, legT: 0, arrived: 1 });
  assert.deepEqual(frameAt(3, 1.5), { legIndex: 2, legT: 1, arrived: 4 });
});

test("frameAt: stepping to port N arrives exactly N+1 ports (the e2e hook contract)", () => {
  const legCount = 5;
  for (let n = 0; n <= legCount; n++) {
    assert.equal(frameAt(legCount, n / legCount).arrived, n + 1, `port ${n}`);
  }
});

test("frameAt: arrived never decreases as t advances", () => {
  let prev = 0;
  for (let i = 0; i <= 20; i++) {
    const { arrived } = frameAt(4, i / 20);
    assert.ok(arrived >= prev, `arrived went backwards at t=${i / 20}`);
    prev = arrived;
  }
});

test("origin, arrival, and village/town use distinct log templates", () => {
  // Structural, not literal: assert the branches DIFFER (so a regression that
  // collapses them is caught) without pinning the exact prose, which Sub 4 (#121)
  // owns and will rewrite. Same name + founded isolates the template difference.
  const cap = mark({ idx: 0, name: "Same", kind: "capital", founded: 500, nx: 0, ny: 0 });
  const town = mark({ idx: 1, name: "Same", kind: "town", founded: 500, nx: 0.1, ny: 0 });
  const village = mark({ idx: 2, name: "Same", kind: "village", founded: 500, nx: 0.2, ny: 0 });
  const lines = buildVoyagePlan([cap, town, village], 1059).ports.map((p) => p.logLine);
  assert.notEqual(lines[0], lines[1], "origin line must differ from an arrival line");
  assert.notEqual(lines[1], lines[2], "a town line must differ from a village line");
});
