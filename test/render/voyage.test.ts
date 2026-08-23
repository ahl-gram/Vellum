import { test } from "node:test";
import assert from "node:assert/strict";
import type { PlaceMark } from "../../src/render/place-manifest.ts";
import {
  applyTourOrder,
  buildVoyagePlan,
  frameAt,
  logEntryCount,
  toldRow,
  reorderPlanByTravel,
} from "../../src/render/voyage.ts";

// #118 (Sub 1 of the Wayfarer's Passage epic #117): the pure itinerary core; the animated overlay is Sub 2, covered by the Explorer e2e.
// Load-bearing: the plan starts at the single capital and a CLOSED round trip visits every living town/village exactly once (#275: legs.length === ports.length); and every selection keys on idx, never array position, so a shuffled input yields a byte-identical plan.

const mark = (over: Partial<PlaceMark> = {}): PlaceMark => ({
  idx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 300,
  ruined: false,
  seat: false,
  nx: 0.5,
  ny: 0.5,
  // buildVoyagePlan orders ports by the chart fractions nx/ny and never reads gx/gy, so these are filler, not fixtures.
  gx: 0,
  gy: 0,
  ...over,
});

// A hand-laid world with unambiguous sweep order: the capital at the origin, A/C/B collinear along x at 0.1 / 0.2 / 0.3.
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
  // The sorted line: 0 -> 1 (0.1) -> 3 (0.2) -> 2 (0.3); idx 3 rides before 2 because C sits between A and B.
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.deepEqual(
    plan.ports.map((p) => p.idx),
    [0, 1, 3, 2],
  );
});

test("the tour does not cross itself on a ring layout nearest-neighbour would tangle", () => {
  // A ring with one inland town near the centre: greedy NN dives inland then jumps back, crossing its own track.
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
      // #275: the closing leg is real and checked too; it shares a port with leg 0, the one adjacent-pair exclusion.
      if (i === 0 && j === legs.length - 1) continue;
      assert.ok(!crosses(legs[i]![0], legs[i]![1], legs[j]![0], legs[j]![1]),
        `legs ${i} and ${j} cross`);
    }
  }
});

test("legs close the tour into a round trip: the last leg sails home to the capital", () => {
  // #275 reverses #120's "the survey does not sail home". legs = ports now, not ports - 1.
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.equal(plan.legs.length, plan.ports.length, "one leg per port once the tour closes");
  for (let i = 1; i < plan.ports.length; i++) {
    assert.deepEqual(plan.legs[i - 1], {
      fromIdx: plan.ports[i - 1].idx,
      toIdx: plan.ports[i].idx,
    });
  }
  assert.deepEqual(
    plan.legs[plan.legs.length - 1],
    { fromIdx: plan.ports[plan.ports.length - 1].idx, toIdx: plan.ports[0].idx },
    "the closing leg carries the survey home",
  );
});

test("a two-port survey sails out and back, not out alone", () => {
  const plan = buildVoyagePlan([capital, townA], 1059);
  assert.deepEqual(plan.ports.map((p) => p.idx), [0, 1]);
  assert.deepEqual(plan.legs, [
    { fromIdx: 0, toIdx: 1 },
    { fromIdx: 1, toIdx: 0 },
  ]);
});

test("no port is visited twice even though the survey comes home (the capital is one port)", () => {
  // The homecoming is an ARRIVAL at a port already in the itinerary, never a second port.
  const plan = buildVoyagePlan(lineWorld, 1059);
  const idxs = plan.ports.map((p) => p.idx);
  assert.equal(new Set(idxs).size, idxs.length, "the capital must not appear twice as a port");
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
  // Two candidates equidistant from the capital: a position-keyed tiebreak flips when the array reverses; an idx-keyed one always visits idx 1 first.
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
  // A frozen input catches a dropped internal scratch copy (splice/push throws in strict mode); the deep-equal catches element-level mutation.
  const input = [capital, townA, townB, villageC];
  const snapshot = input.map((p) => ({ ...p }));
  Object.freeze(input);
  const plan = buildVoyagePlan(input, 1059);
  assert.equal(plan.ports.length, 4);
  assert.deepEqual(input, snapshot);
});

/** A symmetric distance oracle from a sparse pair map; throws on an unknown pair. */
const matrixD = (m: Record<string, number>) => (a: number, b: number): number => {
  const v = m[a < b ? `${a}:${b}` : `${b}:${a}`];
  if (v === undefined) throw new Error(`no distance for ${a}:${b}`);
  return v;
};

// The straight-line plan visits 0,1,3,2; the oracle puts a strait between A(1) and C(3), so the true miles prefer 0,1,2,3.
const straitD = matrixD({ "0:1": 1, "1:3": 10, "2:3": 1, "1:2": 2, "0:3": 4, "0:2": 3 });

test("reorderPlanByTravel adopts the cheaper itinerary the travel distances reveal", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.deepEqual(plan.ports.map((p) => p.idx), [0, 1, 3, 2], "fixture premise: straight-line order");
  const re = reorderPlanByTravel(plan, straitD);
  assert.deepEqual(re.ports.map((p) => p.idx), [0, 1, 2, 3]);
  assert.deepEqual(re.legs, [
    { fromIdx: 0, toIdx: 1 },
    { fromIdx: 1, toIdx: 2 },
    { fromIdx: 2, toIdx: 3 },
    { fromIdx: 3, toIdx: 0 },
  ]);
});

test("applyTourOrder: rebuilds legs to the new order and keeps each port's own log line", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  const re = applyTourOrder(plan, [0, 2, 3, 1]);
  assert.deepEqual(re.ports.map((p) => p.idx), [0, 2, 3, 1]);
  assert.deepEqual(re.legs, [
    { fromIdx: 0, toIdx: 2 },
    { fromIdx: 2, toIdx: 3 },
    { fromIdx: 3, toIdx: 1 },
    { fromIdx: 1, toIdx: 0 },
  ]);
  const lineOf = new Map(plan.ports.map((p) => [p.idx, p.logLine]));
  for (const port of re.ports) assert.equal(port.logLine, lineOf.get(port.idx), `port ${port.idx} lost its line`);
});

test("applyTourOrder: rejects an order that is not a same-set permutation keeping the origin", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.throws(() => applyTourOrder(plan, [1, 0, 3, 2]), /origin/);
  assert.throws(() => applyTourOrder(plan, [0, 1, 3]), /permutation/);
  assert.throws(() => applyTourOrder(plan, [0, 1, 3, 3]), /permutation/);
  assert.throws(() => applyTourOrder(plan, [0, 1, 3, 5]), /permutation/);
});

test("reorderPlanByTravel: deterministic and does not mutate the given plan", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  Object.freeze(plan.ports);
  Object.freeze(plan.legs);
  const a = reorderPlanByTravel(plan, straitD);
  const b = reorderPlanByTravel(plan, straitD);
  assert.deepEqual(a, b);
  assert.deepEqual(plan.ports.map((p) => p.idx), [0, 1, 3, 2], "the given plan changed");
});

test("reorderPlanByTravel: empty and one-port plans come back unchanged", () => {
  const empty = buildVoyagePlan([], 1059);
  assert.deepEqual(reorderPlanByTravel(empty, straitD), empty);
  const solo = buildVoyagePlan([capital], 1059);
  assert.deepEqual(reorderPlanByTravel(solo, straitD), solo);
});

test("#442 toldRow is the LAST row revealLog inks, which is arrived - 1 at every position", () => {
  // Tied to revealLog's own contract (voyage-log-panel.ts): it brightens [0, arrived), so
  // the row the story is ON is the last of those. Swept across the whole sweep rather than
  // sampled at the ends, because at t=1 arrived reaches the row COUNT and the clamp makes
  // an off-by-one read the same last row either way (guard-prover flagged this unproven).
  const plan = buildVoyagePlan(lineWorld, 1059);
  const legCount = plan.legs.length;
  const rows = logEntryCount(plan);
  for (let step = 0; step <= 20; step++) {
    const arrived = frameAt(legCount, step / 20).arrived;
    const inked = Array.from({ length: rows }, (_, i) => i < arrived);
    const lastInked = inked.lastIndexOf(true);
    assert.equal(
      toldRow(arrived, rows),
      lastInked,
      `at arrived=${arrived} the told row must be the last inked one`,
    );
  }
});

test("#442 toldRow clamps at both ends, so no row index can fall off the journal", () => {
  assert.equal(toldRow(0, 25), 0, "before the first arrival the story is on row 0, never -1");
  assert.equal(toldRow(1, 25), 0, "the departure IS row 0");
  assert.equal(toldRow(25, 25), 24, "the homecoming is the last row");
  assert.equal(toldRow(99, 25), 24, "an over-count clamps rather than indexing past the end");
  assert.equal(toldRow(3, 0), -1, "an empty journal has no told row at all");
});

test("logEntryCount: one departure plus one entry per leg, so a round trip logs a homecoming", () => {
  const plan = buildVoyagePlan(lineWorld, 1059);
  assert.equal(plan.ports.length, 4, "fixture premise");
  assert.equal(logEntryCount(plan), 5, "4 ports, 4 legs, 5 entries: the homecoming earns its own");
});

test("logEntryCount: the sweep reaches it exactly at t=1, and NOT at the last port", () => {
  // Comparing arrived against ports.length posts the survey's one #status summary a leg early and again at the homecoming; against logEntryCount it fires once, at completion.
  const plan = buildVoyagePlan(lineWorld, 1059);
  const legCount = plan.legs.length;
  const entries = logEntryCount(plan);
  assert.equal(frameAt(legCount, 1).arrived, entries, "t=1 completes the log");
  const atLastPort = frameAt(legCount, (legCount - 1) / legCount).arrived;
  assert.ok(atLastPort < entries, `reaching the last port (${atLastPort}) must not complete ${entries}`);
});

test("logEntryCount: a one-port survey logs only its departure; an empty plan logs nothing", () => {
  assert.equal(logEntryCount(buildVoyagePlan([capital], 1059)), 1);
  assert.equal(logEntryCount(buildVoyagePlan([], 1059)), 0);
});

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
  // Structural, not literal: assert the branches DIFFER without pinning the prose Sub 4 (#121) owns; same name + founded isolates the template difference.
  const cap = mark({ idx: 0, name: "Same", kind: "capital", founded: 500, nx: 0, ny: 0 });
  const town = mark({ idx: 1, name: "Same", kind: "town", founded: 500, nx: 0.1, ny: 0 });
  const village = mark({ idx: 2, name: "Same", kind: "village", founded: 500, nx: 0.2, ny: 0 });
  const lines = buildVoyagePlan([cap, town, village], 1059).ports.map((p) => p.logLine);
  assert.notEqual(lines[0], lines[1], "origin line must differ from an arrival line");
  assert.notEqual(lines[1], lines[2], "a town line must differ from a village line");
});
