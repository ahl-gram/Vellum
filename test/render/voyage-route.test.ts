import { test } from "node:test";
import assert from "node:assert/strict";
import type { Survey, SurveyRoad } from "../../src/render/survey.ts";
import { buildSurvey } from "../../src/render/survey.ts";
import { routeVoyage, RDP_EPSILON, type RoutedLeg } from "../../src/render/voyage-route.ts";
import { buildVoyagePlan } from "../../src/render/voyage.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { labelComponents } from "../../src/core/mask-components.ts";

// #120: the router. Tiny hand-drawn worlds so every expected cell is exact, plus a
// few assertions against a real seed to prove the synthetic worlds did not lie.
//
// Picture legend: '#' land, '.' sea, '=' land carrying a road.

function survey(rows: string[]): Survey {
  const gridH = rows.length;
  const gridW = rows[0]!.length;
  const land = new Uint8Array(gridW * gridH);
  const roadCells: Array<readonly [number, number]> = [];
  rows.forEach((r, y) =>
    [...r].forEach((c, x) => {
      if (c !== ".") land[x + y * gridW] = 1;
      if (c === "=") roadCells.push([x, y]);
    }),
  );
  // One polyline through the marked road cells, in row-major order. The router only
  // ever reads the SET of road cells, so the polyline split does not matter here.
  const roads: SurveyRoad[] = roadCells.length ? [roadCells] : [];
  return { gridW, gridH, land, roads };
}

const site = (idx: number, x: number, y: number) => ({ idx, x, y });
const leg = (fromIdx: number, toIdx: number) => ({ fromIdx, toIdx });
const cellsOf = (l: RoutedLeg) => l.points.map((p) => `${p.x},${p.y}`);
const isLand = (s: Survey, p: { x: number; y: number }) => s.land[p.x + p.y * s.gridW] === 1;

test("both ports on the road network: mode is road and every vertex is a road cell", () => {
  // An L of road over solid land, no sea anywhere, so there is no coastal shortcut to
  // sail: the survey rides and the track follows road cells. (Sailing a bay shortcut is
  // its own test below.)
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

test("ports on different landmasses: mode is sea and the interior runs over water", () => {
  // A headland at x=4 juts down between the two shores, so the honest sea route must
  // arc north around it. The detour is far wider than RDP's 0.75-cell tolerance, so
  // the interior vertices survive simplification and the assertion below has teeth.
  const s = survey([
    "#.......#",
    "#.......#",
    "#...#...#",
    "#...#...#",
    "#...#...#",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 4), site(1, 8, 4)], s);
  assert.equal(routed[0]!.mode, "sea");
  const pts = routed[0]!.points;
  assert.deepEqual(pts[0], { x: 0, y: 4 }, "starts at the departing port");
  assert.deepEqual(pts[pts.length - 1], { x: 8, y: 4 }, "ends at the arriving port");
  assert.ok(pts.length > 2, "the route bends around the headland rather than cutting it");
  for (const p of pts.slice(1, -1)) assert.ok(!isLand(s, p), `interior vertex ${p.x},${p.y} is on land`);
});

test("a corner-touching pinch is two landmasses, and the 8-connected sea walk threads it", () => {
  // 4-connected components split at the diagonal; the sea walker must still cross.
  const s = survey([
    "##..",
    ".#..",
    "..#.",
    "..##",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 3, 3)], s);
  assert.equal(routed[0]!.mode, "sea");
});

test("no capital means no roads, so every leg falls back to a straight line", () => {
  // roads.ts returns [] when the world has no capital; the router must not crash.
  const s = survey(["#####", "#####"]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 1)], s);
  assert.equal(routed[0]!.mode, "straight");
  assert.deepEqual(routed[0]!.points, [{ x: 0, y: 0 }, { x: 4, y: 1 }]);
});

test("a port off the road network takes road-to-nearest, then a straight hop", () => {
  // The ratified fallback (issue #120). Port A is on the road; port B is inland off it.
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
  // it used the road for the middle stretch rather than cutting straight across
  const roadSet = new Set(s.roads.flat().map(([x, y]) => `${x},${y}`));
  assert.ok(l.points.some((p) => roadSet.has(`${p.x},${p.y}`)), "never touched the road");
});

test("an island port unreachable by road takes a sea leg, not a straight one", () => {
  const s = survey([
    "==..#",
    "==..#",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 0)], s);
  assert.equal(routed[0]!.mode, "sea");
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
  const legsBefore = JSON.parse(JSON.stringify(legs));
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

// --- against a real world, so the synthetic pictures above cannot lie ---

const realWorld = (seed: number) => {
  const world = generateWorld(defaultRecipe(seed));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const s = buildSurvey(world.elev, world.seaLevel, world.roads);
  const sites = manifest.places.map((p) => site(p.idx, p.gx, p.gy));
  return { world, s, routed: routeVoyage(plan.legs, sites, s) };
};

test("seed 526413615 sails: it has at least one sea leg and many road legs", () => {
  // The Isle of Selivelai. Measured: 23 legs = 2 sea + 21 road.
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

test("a simplified leg never strays past the tolerance from terrain of its own kind", () => {
  // Acceptance: "No track segment crosses land on a sea leg or open water on a road leg,
  // WITHIN the path-simplification tolerance." Vertices are on-terrain by construction
  // (RDP only ever removes vertices), so the real question is the chords between them.
  // Bound = RDP_EPSILON (the chord tolerance) + 0.5 (a point on a cell boundary is half a
  // cell from either centre). Measured worst case over seeds 1..40: 1.000 road, 0.902 sea.
  const BOUND = RDP_EPSILON + 0.5;
  const { s, routed } = realWorld(526413615);
  const road = new Uint8Array(s.gridW * s.gridH);
  for (const pl of s.roads) for (const [x, y] of pl) road[x + y * s.gridW] = 1;

  const nearest = (x: number, y: number, ok: (c: number) => boolean) => {
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

  const isWaterVertex = (p: { x: number; y: number }) => s.land[p.x + p.y * s.gridW] === 0;

  for (const l of routed) {
    if (l.mode === "straight") continue;
    // A sea leg's two ends are the LAND ports it sails between, joined to the water by a
    // short overland stub. The invariant concerns the OPEN WATER body between them, so
    // scan from the first water vertex to the last.
    let lo = 1;
    let hi = l.points.length - 1;
    if (l.mode === "sea") {
      lo = l.points.findIndex(isWaterVertex);
      hi = l.points.length - 1 - [...l.points].reverse().findIndex(isWaterVertex);
      if (lo < 1 || hi <= lo) continue;
    }
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
        } else {
          assert.ok(nearest(x, y, (c) => s.land[c] === 0) <= BOUND, `sea leg strays at ${x},${y}`);
        }
      }
    }
  }
});

test("a same-landmass coastal shortcut puts to sea over a short OVERLAND stub, not a long march", () => {
  // A coastal-shortcut sail is gated to coastal ports, so the party crosses only a cell or
  // two of land before it reaches water. Measure the stub by SAMPLING terrain from the port
  // (not the first simplified vertex: RDP can merge the port with a straight coastal sail,
  // which reads as a far vertex but draws entirely over water).
  const { s, routed } = realWorld(526413615);
  const comp = labelComponents(s.land, s.gridW, s.gridH);
  const onLand = (x: number, y: number) => s.land[Math.round(x) + Math.round(y) * s.gridW] === 1;
  let shortcuts = 0;
  let seaLegs = 0;
  for (const l of routed) {
    if (l.mode !== "sea") continue;
    seaLegs++;
    const from = l.points[0]!;
    const to = l.points[l.points.length - 1]!;
    if (comp[from.x + from.y * s.gridW] !== comp[to.x + to.y * s.gridW]) continue; // cross-landmass: #181-waived
    shortcuts++;
    // walk the first segment from the port; count how far until the sample is over water
    const next = l.points[1]!;
    const dx = next.x - from.x;
    const dy = next.y - from.y;
    const len = Math.hypot(dx, dy);
    let overland = 0;
    for (let d = 0.5; d < len; d += 0.5) {
      if (!onLand(from.x + (dx / len) * d, from.y + (dy / len) * d)) break;
      overland = d;
    }
    assert.ok(overland <= 3, `a coastal shortcut marched ${overland.toFixed(1)} cells overland before reaching water`);
  }
  assert.ok(seaLegs >= 2, `expected sea legs, got ${seaLegs}`);
  assert.ok(shortcuts >= 1, "seed 526413615 has at least one coastal-shortcut sail");
});

test("a port whose nearest water is an inland pond still launches into the shared sea", () => {
  // Regression, found by rendering seed 526413615: Thilthoport's nearest water is a
  // 20-cell pond, not the ocean. Launching there stranded the walk, the leg silently
  // degraded to "straight", and a RIDER was drawn across the strait.
  //   ocean = columns 1..4;  pond = the single cell (6,1), sealed inside the right landmass
  const s = survey([
    "#....###",
    "#....#.#",
    "#....###",
  ]);
  assert.equal(s.land[6 + 1 * 8], 0, "the pond is water");
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 6, 0)], s);
  const l = routed[0]!;
  assert.equal(l.mode, "sea", "a crossing must never degrade to a straight rider");
  for (const p of l.points.slice(1, -1)) {
    assert.ok(!isLand(s, p), `interior vertex ${p.x},${p.y} is on land`);
    assert.ok(!(p.x === 6 && p.y === 1), "the route sailed through the sealed pond");
  }
});

test("on real worlds, EVERY cross-landmass leg sails, never degrading to a straight rider", () => {
  // A same-landmass leg MAY now also sail (a coastal shortcut), so this only pins the
  // cross-landmass direction: a leg between two landmasses is always a sea leg.
  for (const seed of [526413615, 42, 7]) {
    const world = generateWorld(defaultRecipe(seed));
    const manifest = buildPlaceManifest(world, 1500);
    const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
    const s = buildSurvey(world.elev, world.seaLevel, world.roads);
    const comp = labelComponents(s.land, s.gridW, s.gridH);
    const routed = routeVoyage(plan.legs, manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy })), s);
    const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
    for (const l of routed) {
      const a = byIdx.get(l.fromIdx)!;
      const b = byIdx.get(l.toIdx)!;
      const crosses = comp[a.gx + a.gy * s.gridW] !== comp[b.gx + b.gy * s.gridW];
      if (crosses) assert.equal(l.mode, "sea", `seed ${seed}: ${a.name} -> ${b.name} crosses water as "${l.mode}"`);
    }
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

// --- coastal sailing: sail when the road loops far around a coastal shortcut (#120
//     follow-up, Alex 2026-07-10). Two coastal towns road-connected only by a long
//     inland detour should take ship, not ride all the way back.

test("a coastal leg SAILS when its road loops far around a bay", () => {
  // A tall pond walled by a ring road. The two ports sit mid-height on opposite shores:
  // the road runs the long way around (~2x), the sea cuts straight across.
  const s = survey([
    "=====",
    "=...=",
    "=...=",
    "=...=",
    "=...=",
    "=...=",
    "=====",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 3), site(1, 4, 3)], s);
  assert.equal(routed[0]!.mode, "sea", "the survey should sail the shortcut, not ride the long road");
  // interior vertices are open water
  for (const p of routed[0]!.points.slice(1, -1)) assert.ok(!isLand(s, p), `vertex ${p.x},${p.y} on land`);
});

test("a coastal leg RIDES when the road is direct (no backtrack to shortcut)", () => {
  // Two coastal towns with a straight shore road: the road is shorter than any sail, so
  // the survey rides even though both are on the water.
  const s = survey([
    "=====",
    ".....",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 0)], s);
  assert.equal(routed[0]!.mode, "road");
});

test("an inland port does not sail: only coastal legs take the shortcut", () => {
  // Port B sits deep inland (far from any sea), so however far its road winds, it cannot
  // take a coastal sail. The leg rides.
  const s = survey([
    "=======",
    "=.....#",
    "=.....#",
    "=======",
    "#######",
    "###=###",
  ]);
  // A on the pond shore (coastal), B deep in the solid block at the bottom (inland)
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 3, 5)], s);
  assert.notEqual(routed[0]!.mode, "sea", "an inland port cannot sail a coastal shortcut");
});

test("the sail threshold is a coastal shortcut, not every coastal hop (rides at ~1.35x)", () => {
  // The classic pond where the road detour is only ~1.35x the sail: below the 1.5x bar,
  // so it still rides. Guards against the sail rule swallowing ordinary coastal roads.
  const s = survey([
    "=====",
    "=...=",
    "=====",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 4, 1)], s);
  assert.equal(routed[0]!.mode, "road", "a mild detour still rides");
});
