import { test } from "node:test";
import assert from "node:assert/strict";
import { orderTour, refineTour, type TourPoint } from "../../src/render/voyage-tour.ts";

// #120 follow-up: the itinerary must sweep around the world, not backtrack. The
// load-bearing property is that no two legs of the tour CROSS; a greedy
// nearest-neighbour tour does, a hull-insertion + 2-opt tour does not.

const p = (idx: number, x: number, y: number): TourPoint => ({ idx, x, y });

/** Do segments (a,b) and (c,d) properly cross (share an interior point)? */
function properlyCross(a: TourPoint, b: TourPoint, c: TourPoint, d: TourPoint): boolean {
  const o = (p1: TourPoint, p2: TourPoint, p3: TourPoint) =>
    Math.sign((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));
  const o1 = o(a, b, c);
  const o2 = o(a, b, d);
  const o3 = o(c, d, a);
  const o4 = o(c, d, b);
  return o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0;
}

/** Count crossings among non-adjacent legs of a tour (adjacent legs share a port). */
function crossings(order: number[], byIdx: Map<number, TourPoint>): number {
  let n = 0;
  for (let i = 0; i + 1 < order.length; i++) {
    for (let j = i + 2; j + 1 < order.length; j++) {
      if (i === 0 && j + 1 === order.length) continue; // open path: no wraparound leg
      const a = byIdx.get(order[i]!)!;
      const b = byIdx.get(order[i + 1]!)!;
      const c = byIdx.get(order[j]!)!;
      const d = byIdx.get(order[j + 1]!)!;
      if (properlyCross(a, b, c, d)) n++;
    }
  }
  return n;
}

const index = (pts: TourPoint[]) => new Map(pts.map((q) => [q.idx, q]));

// A diamond of four ports with the capital at the top and one port near the centre.
// Nearest-neighbour from the capital dives to the centre port, then to the bottom,
// then back up the sides, so the horizontal leg crosses the vertical one.
const diamond: TourPoint[] = [
  p(0, 0.5, 0.9), // capital, top
  p(1, 0.1, 0.5), // left
  p(2, 0.9, 0.5), // right
  p(3, 0.5, 0.1), // bottom
  p(4, 0.5, 0.45), // the centre trap
];

test("the tour has no self-crossing on a layout where nearest-neighbour would cross", () => {
  const order = orderTour(diamond, 0);
  assert.equal(crossings(order, index(diamond)), 0, `order ${order.join(",")} crosses itself`);
});

test("the tour starts at the given capital", () => {
  assert.equal(orderTour(diamond, 0)[0], 0);
  // and honours a different start
  assert.equal(orderTour(diamond, 3)[0], 3);
});

test("the tour visits every port exactly once", () => {
  const order = orderTour(diamond, 0);
  assert.deepEqual([...order].sort((a, b) => a - b), [0, 1, 2, 3, 4]);
});

test("an inland town is a detour, not a reordering of the coastal ring", () => {
  // Four coastal towns on a square ring + the capital just inside one edge. The ring
  // order must survive; the capital is inserted between its two nearest ring towns.
  const ring: TourPoint[] = [
    p(0, 0.5, 0.85), // capital, just inside the top edge
    p(1, 0.1, 0.9), // NW
    p(2, 0.9, 0.9), // NE
    p(3, 0.9, 0.1), // SE
    p(4, 0.1, 0.1), // SW
  ];
  const order = orderTour(ring, 0);
  assert.equal(crossings(order, index(ring)), 0);
  // the four corners appear in a rotational (ring) order, not crossed
  const corners = order.filter((i) => i !== 0);
  const ccw = [1, 4, 3, 2]; // NW -> SW -> SE -> NE
  const cw = [2, 3, 4, 1];
  const rot = (arr: number[], v: number[]) => {
    const s = v.indexOf(arr[0]!);
    return v.slice(s).concat(v.slice(0, s));
  };
  const isRing = JSON.stringify(corners) === JSON.stringify(rot(corners, ccw)) ||
    JSON.stringify(corners) === JSON.stringify(rot(corners, cw));
  assert.ok(isRing, `corners ${corners.join(",")} are not in ring order`);
});

test("no crossings on a scattered pseudo-random cloud (100 points, several seeds)", () => {
  // A cheap deterministic LCG so the test has no dependency; the point is only that a
  // hull-insertion + 2-opt tour is crossing-free on arbitrary layouts.
  for (let seed = 1; seed <= 8; seed++) {
    let s = seed * 2654435761 >>> 0;
    const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 0xffffffff);
    const pts: TourPoint[] = [];
    for (let i = 0; i < 40; i++) pts.push(p(i, rnd(), rnd()));
    const order = orderTour(pts, 0);
    assert.equal(order.length, 40);
    assert.equal(crossings(order, index(pts)), 0, `seed ${seed}: tour crosses`);
  }
});

test("deterministic and stable under a shuffled input (idx tiebreaks, not array order)", () => {
  const shuffled = [diamond[2], diamond[0], diamond[4], diamond[1], diamond[3]] as TourPoint[];
  assert.deepEqual(orderTour(diamond, 0), orderTour(diamond, 0));
  assert.deepEqual(orderTour(shuffled, 0), orderTour(diamond, 0));
});

test("collinear ports order along the line without a detour", () => {
  // capital 0 at 0, then A(0.1), C(0.2), B(0.3): the sweep is just 0,1,3,2.
  const line = [p(0, 0, 0), p(1, 0.1, 0), p(2, 0.3, 0), p(3, 0.2, 0)];
  assert.deepEqual(orderTour(line, 0), [0, 1, 3, 2]);
});

test("degenerate inputs: empty, one port, two ports", () => {
  assert.deepEqual(orderTour([], 0), []);
  assert.deepEqual(orderTour([p(0, 0.5, 0.5)], 0), [0]);
  assert.deepEqual(orderTour([p(0, 0, 0), p(1, 1, 1)], 0), [0, 1]);
});

test("does not mutate the caller's points array", () => {
  const input = diamond.map((q) => ({ ...q }));
  const frozen = Object.freeze(input.map((q) => Object.freeze(q)));
  orderTour(frozen, 0);
  assert.deepEqual(input, diamond);
});

// ---------------------------------------------------------------------------
// #184: refineTour. The straight-line tour above is the SEED order; refineTour
// re-optimizes it on ACTUAL travel distances (a matrix oracle, routed miles),
// because two ports adjacent as the crow flies can be far apart by road and sea.
// ---------------------------------------------------------------------------

/** A symmetric distance oracle from a sparse pair map; throws on an unknown pair. */
const matrixD = (m: Record<string, number>) => (a: number, b: number): number => {
  const v = m[a < b ? `${a}:${b}` : `${b}:${a}`];
  if (v === undefined) throw new Error(`no distance for ${a}:${b}`);
  return v;
};

const tourCost = (path: ReadonlyArray<number>, d: (a: number, b: number) => number): number => {
  let c = 0;
  for (let i = 1; i < path.length; i++) c += d(path[i - 1]!, path[i]!);
  return c;
};

test("refineTour: adopts the cheaper order when travel disagrees with the given one", () => {
  // A strait separates ports 1 and 2: adjacent as given (cost 10), but swapping the
  // tail to 0,1,3,2 rides 1+2+1. One 2-opt reversal away, so any refinement finds it.
  const d = matrixD({ "0:1": 1, "1:2": 10, "2:3": 1, "0:2": 3, "1:3": 2, "0:3": 4 });
  assert.deepEqual(refineTour([0, 1, 2, 3], d), [0, 1, 3, 2]);
});

test("refineTour: never worse than the given order, start pinned, set preserved", () => {
  // Deterministic LCG matrices over 8 ports: the refined tour must always cost at
  // most the given one, keep position 0, and visit the same set exactly once.
  for (let seed = 1; seed <= 6; seed++) {
    let s = (seed * 2654435761) >>> 0;
    const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 0xffffffff);
    const m: Record<string, number> = {};
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) m[`${a}:${b}`] = 1 + rnd() * 9;
    const d = matrixD(m);
    const path = [0, 1, 2, 3, 4, 5, 6, 7];
    const refined = refineTour(path, d);
    assert.equal(refined[0], 0, `seed ${seed}: start moved`);
    assert.deepEqual([...refined].sort((x, y) => x - y), path, `seed ${seed}: set changed`);
    assert.ok(
      tourCost(refined, d) <= tourCost(path, d) + 1e-9,
      `seed ${seed}: refined ${tourCost(refined, d)} costs more than given ${tourCost(path, d)}`,
    );
  }
});

test("refineTour: deterministic and does not mutate its input", () => {
  const d = matrixD({ "0:1": 1, "1:2": 10, "2:3": 1, "0:2": 3, "1:3": 2, "0:3": 4 });
  const input = Object.freeze([0, 1, 2, 3] as const) as ReadonlyArray<number>;
  assert.deepEqual(refineTour(input, d), refineTour(input, d));
  assert.deepEqual([...input], [0, 1, 2, 3]);
});

test("refineTour: degenerate inputs come back as given", () => {
  const d = () => 1;
  assert.deepEqual(refineTour([], d), []);
  assert.deepEqual(refineTour([5], d), [5]);
  assert.deepEqual(refineTour([5, 9], d), [5, 9]);
});
