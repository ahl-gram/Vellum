import { test } from "node:test";
import assert from "node:assert/strict";
import { orderTour, type TourPoint } from "../../src/render/voyage-tour.ts";

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
