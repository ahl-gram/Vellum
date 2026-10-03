import { test } from "node:test";
import assert from "node:assert/strict";
import { routeVoyage, RDP_EPSILON, type RoutedLeg } from "../../src/render/voyage-route.ts";
import { survey, site, leg, isLand, realWorld } from "../../test-support/voyage-route-fixtures.ts";

const cellsOf = (l: RoutedLeg) => l.points.map((p) => `${p.x},${p.y}`);

test("both ports on the road network: mode is road and every vertex is a road cell", () => {
  const s = survey([
    "====",
    "###=",
    "###=",
    "###=",
  ]);
  const roadSet = new Set(s.roads.flat().map(([x, y]) => `${x},${y}`));
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 3, 3)], s);
  assert.equal(routed.length, 1);
  assert.equal(routed[0]!.mode, "road");
  for (const c of cellsOf(routed[0]!)) assert.ok(roadSet.has(c), `vertex ${c} is not a road cell`);
});

test("a road leg walks around water, never across it", () => {
  const s = survey([
    "=====",
    "=...=",
    "=====",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 4, 1)], s);
  assert.equal(routed[0]!.mode, "road");
  for (const p of routed[0]!.points) assert.ok(isLand(s, p), `vertex ${p.x},${p.y} sits on water`);
});

test("no capital means no roads, so every leg falls back to a straight line", () => {
  const s = survey(["#####", "#####"]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 1)], s);
  assert.equal(routed[0]!.mode, "straight");
  assert.deepEqual(routed[0]!.points, [{ x: 0, y: 0 }, { x: 4, y: 1 }]);
});

test("a port off the road network takes road-to-nearest, then a straight hop", () => {
  const s = survey([
    "====#",
    "#####",
    "#####",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 2)], s);
  const l = routed[0]!;
  assert.equal(l.mode, "straight", "an off-network endpoint is not an honest road leg");
  assert.deepEqual(l.points[0], { x: 0, y: 0 });
  assert.deepEqual(l.points[l.points.length - 1], { x: 4, y: 2 });
  const roadSet = new Set(s.roads.flat().map(([x, y]) => `${x},${y}`));
  assert.ok(l.points.some((p) => roadSet.has(`${p.x},${p.y}`)), "never touched the road");
});

test("an off-network port joins the road along the shore, never chording across the bay (#298)", () => {
  // No generated world exercises this branch, so this picture is its only guard.
  const s = survey([
    "=####",
    "....#",
    "....#",
    "....#",
    "#####",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 0, 4)], s);
  const l = routed[0]!;
  assert.equal(l.mode, "straight");
  assert.deepEqual(l.points[0], { x: 0, y: 0 });
  assert.deepEqual(l.points[l.points.length - 1], { x: 0, y: 4 });
  assert.ok(l.points.length > 2, "the leg bends around the bay rather than chording it");
  const BOUND = RDP_EPSILON + 0.5;
  const nearestLand = (x: number, y: number) => {
    let best = Infinity;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const gx = Math.round(x) + dx;
        const gy = Math.round(y) + dy;
        if (gx < 0 || gx >= s.gridW || gy < 0 || gy >= s.gridH) continue;
        if (s.land[gx + gy * s.gridW] === 1) best = Math.min(best, Math.hypot(x - gx, y - gy));
      }
    }
    return best;
  };
  for (let i = 1; i < l.points.length; i++) {
    const a = l.points[i - 1]!;
    const b = l.points[i]!;
    const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 4));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      assert.ok(nearestLand(x, y) <= BOUND, `bookend strays into open water at ${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
});

test("leg identity and order are preserved; one routed leg per input leg", () => {
  const s = survey(["====", "####"]);
  const legs = [leg(0, 1), leg(1, 2)];
  const routed = routeVoyage(legs, [site(0, 0, 0), site(1, 2, 0), site(2, 3, 0)], s);
  assert.equal(routed.length, 2);
  assert.equal(routed[0]!.fromIdx, 0);
  assert.equal(routed[0]!.toIdx, 1);
  assert.equal(routed[1]!.fromIdx, 1);
  assert.equal(routed[1]!.toIdx, 2);
});

test("an empty plan routes to an empty list", () => {
  assert.deepEqual(routeVoyage([], [], survey(["##"])), []);
});

test("every leg begins at its from-port and ends at its to-port, exactly", () => {
  const s = survey(["==#.#", "###.#"]);
  const sites = [site(0, 0, 0), site(1, 4, 1)];
  const routed = routeVoyage([leg(0, 1)], sites, s);
  const pts = routed[0]!.points;
  assert.deepEqual(pts[0], { x: 0, y: 0 });
  assert.deepEqual(pts[pts.length - 1], { x: 4, y: 1 });
});

test("deterministic: identical inputs route to identical geometry", () => {
  const s = survey(["=====", "#...#", "=====" ]);
  const sites = [site(0, 0, 0), site(1, 4, 2)];
  const a = routeVoyage([leg(0, 1)], sites, s);
  const b = routeVoyage([leg(0, 1)], sites, s);
  assert.deepEqual(a, b);
});

test("does not mutate the survey or the legs (immutability rule)", () => {
  const s = survey(["====", "#..#"]);
  const landBefore = Uint8Array.from(s.land);
  const legs = [leg(0, 1)];
  const legsBefore = JSON.parse(JSON.stringify(legs)) as typeof legs;
  routeVoyage(legs, [site(0, 0, 0), site(1, 3, 0)], s);
  assert.deepEqual(Array.from(s.land), Array.from(landBefore));
  assert.deepEqual(legs, legsBefore);
});

test("a routed road leg is simplified: fewer vertices than the cells it walks", () => {
  const s = survey(["=========="]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 9, 0)], s);
  assert.equal(routed[0]!.mode, "road");
  assert.equal(routed[0]!.points.length, 2, "a straight road collapses to its endpoints");
});

test("seed 526413615 sails: it has at least one sea leg and many road legs", () => {
  // The Isle of Selivelai; the measured leg mixes are in the census comment on Issue #309.
  const { routed } = realWorld(526413615);
  const modes = routed.map((l) => l.mode);
  assert.ok(modes.filter((m) => m === "sea").length >= 1, `expected a sea leg, got ${modes.join(",")}`);
  assert.ok(modes.filter((m) => m === "road").length >= 10, "expected most legs to ride");
});

test("on a real world, every road-leg vertex is dry land and every sea-leg interior vertex is water", () => {
  const { s, routed } = realWorld(526413615);
  for (const l of routed) {
    if (l.mode === "road") {
      for (const p of l.points) assert.ok(isLand(s, p), `road vertex ${p.x},${p.y} is on water`);
    }
    if (l.mode === "sea") {
      for (const p of l.points.slice(1, -1)) assert.ok(!isLand(s, p), `sea vertex ${p.x},${p.y} is on land`);
    }
  }
});

test("on a real world, routed legs have real geometry (not the v1 two-point lerp)", () => {
  const { routed } = realWorld(526413615);
  const multi = routed.filter((l) => l.points.length > 2).length;
  assert.ok(multi >= routed.length / 2, `only ${multi}/${routed.length} legs bend`);
});

test("every real leg is deterministic across two independent routings", () => {
  const a = realWorld(42).routed;
  const b = realWorld(42).routed;
  assert.deepEqual(a, b);
});

const nearestOf = (s: ReturnType<typeof realWorld>["s"]) => (x: number, y: number, ok: (c: number) => boolean): number => {
  let best = Infinity;
  const cx = Math.round(x);
  const cy = Math.round(y);
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const gx = cx + dx;
      const gy = cy + dy;
      if (gx < 0 || gx >= s.gridW || gy < 0 || gy >= s.gridH) continue;
      if (ok(gx + gy * s.gridW)) best = Math.min(best, Math.hypot(x - gx, y - gy));
    }
  }
  return best;
};

test("a simplified leg never strays past the tolerance from terrain of its own kind", () => {
  // Vertices are on-terrain by construction (RDP only removes vertices), so the question is the chords. BOUND = RDP_EPSILON + 0.5 (a cell-boundary point is half a cell from either centre); measured worst case over seeds 1..40: 1.000 road, 0.902 sea.
  const BOUND = RDP_EPSILON + 0.5;
  const { s, routed } = realWorld(526413615);
  const road = new Uint8Array(s.gridW * s.gridH);
  for (const pl of s.roads) for (const [x, y] of pl) road[x + y * s.gridW] = 1;

  const nearest = nearestOf(s);

  const isWaterVertex = (p: { x: number; y: number }) => s.land[p.x + p.y * s.gridW] === 0;

  for (const l of routed) {
    // A sea leg's ends are LAND ports joined by short overland stubs; the invariant concerns the open water between, so scan from the first water vertex to the last.
    let lo = 1;
    let hi = l.points.length - 1;
    if (l.mode === "sea") {
      lo = l.points.findIndex(isWaterVertex);
      hi = l.points.length - 1 - [...l.points].reverse().findIndex(isWaterVertex);
      if (lo < 1 || hi <= lo) continue;
    }
    // A straight leg's endpoints are the ports themselves, so every chord counts (a two-vertex chord would otherwise scan nothing).
    if (l.mode === "straight") lo = 0;
    for (let i = lo + 1; i <= hi; i++) {
      const a = l.points[i - 1]!;
      const b = l.points[i]!;
      const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 4));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        if (l.mode === "road") {
          assert.ok(nearest(x, y, (c) => road[c] === 1) <= BOUND, `road leg strays at ${x},${y}`);
        } else if (l.mode === "sea") {
          assert.ok(nearest(x, y, (c) => s.land[c] === 0) <= BOUND, `sea leg strays at ${x},${y}`);
        } else {
          // This seed has no straight legs; the fixture with teeth is the seed 430445745 test below.
          assert.ok(nearest(x, y, (c) => s.land[c] === 1) <= BOUND, `straight leg strays at ${x},${y}`);
        }
      }
    }
  }
});

test("a straight fallback leg walks the land, never across open water (#298)", () => {
  // No natural fixture degrades since Issue #309 roads every settled landmass; this U of roadless land forces the fallback, with the chord crossing the bay.
  const BOUND = RDP_EPSILON + 0.5;
  const s = survey([
    "............",
    ".##......##.",
    ".##......##.",
    ".##......##.",
    ".##......##.",
    ".##########.",
    ".##########.",
    "............",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 2, 1), site(1, 9, 1)], s);
  const straight = routed.filter((l) => l.mode === "straight");
  assert.equal(straight.length, 1, "a roadless same-landmass leg must degrade to the fallback");

  const nearestLand = (x: number, y: number) => {
    let best = Infinity;
    const cx = Math.round(x);
    const cy = Math.round(y);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const gx = cx + dx;
        const gy = cy + dy;
        if (gx < 0 || gx >= s.gridW || gy < 0 || gy >= s.gridH) continue;
        if (s.land[gx + gy * s.gridW] === 1) best = Math.min(best, Math.hypot(x - gx, y - gy));
      }
    }
    return best;
  };

  for (const l of straight) {
    for (let i = 1; i < l.points.length; i++) {
      const a = l.points[i - 1]!;
      const b = l.points[i]!;
      const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 4));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        assert.ok(
          nearestLand(x, y) <= BOUND,
          `straight leg ${l.fromIdx} -> ${l.toIdx} strays into open water at ${x.toFixed(1)},${y.toFixed(1)}`,
        );
      }
    }
  }
});

test("#309: the fixture worlds route with zero straight legs", () => {
  for (const seed of [430445745, 42, 39, 526413615]) {
    const { routed } = realWorld(seed);
    const straight = routed.filter((l) => l.mode === "straight").length;
    assert.equal(straight, 0, `seed ${seed} still degrades ${straight} of ${routed.length} legs`);
  }
});

test("a leg naming a site the manifest does not carry fails loudly, not with an empty polyline", () => {
  const s = survey(["===="]);
  assert.throws(
    () => routeVoyage([leg(0, 9)], [site(0, 0, 0)], s),
    /no site in the manifest/,
    "an empty points array would surface far away, in the overlay's track formatting",
  );
});
