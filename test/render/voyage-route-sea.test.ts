import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSurvey } from "../../src/render/survey.ts";
import { routeVoyage } from "../../src/render/voyage-route.ts";
import { buildVoyagePlan } from "../../src/render/voyage.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { labelComponents } from "../../src/core/mask-components.ts";
import { survey, site, leg, isLand, realWorld } from "../../test-support/voyage-route-fixtures.ts";

test("ports on different landmasses: mode is sea and the interior runs over water", () => {
  // The headland at x=4 forces the sea route to arc north; the detour is far wider than RDP's 0.75-cell tolerance, so the interior vertices survive simplification and the assertion has teeth.
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
  const s = survey([
    "##..",
    ".#..",
    "..#.",
    "..##",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 3, 3)], s);
  assert.equal(routed[0]!.mode, "sea");
});

test("an island port unreachable by road takes a sea leg, not a straight one", () => {
  const s = survey([
    "==..#",
    "==..#",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 0)], s);
  assert.equal(routed[0]!.mode, "sea");
});

test("a same-landmass coastal shortcut puts to sea over a short OVERLAND stub, not a long march", () => {
  // Measure the stub by SAMPLING terrain from the port, not the first simplified vertex: RDP can merge the port with a straight coastal sail, which reads as a far vertex but draws entirely over water.
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
  // Ocean is columns 1..4; the pond is the single sealed cell (6,1), the Thilthoport case from seed 526413615.
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
  // A same-landmass leg MAY also sail (a coastal shortcut), so this only pins the cross-landmass direction.
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

test("a coastal leg SAILS when its road loops far around a bay", () => {
  // A tall pond walled by a ring road; the ports sit mid-height on opposite shores: the road runs ~2x the long way, the sea cuts straight across.
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
  for (const p of routed[0]!.points.slice(1, -1)) assert.ok(!isLand(s, p), `vertex ${p.x},${p.y} on land`);
});

test("a coastal leg RIDES when the road is direct (no backtrack to shortcut)", () => {
  const s = survey([
    "=====",
    ".....",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 0), site(1, 4, 0)], s);
  assert.equal(routed[0]!.mode, "road");
});

test("an inland port does not sail: only coastal legs take the shortcut", () => {
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
  // The road detour is only ~1.35x the sail: below the 1.5x bar, so it still rides; guards the sail rule from swallowing ordinary coastal roads.
  const s = survey([
    "=====",
    "=...=",
    "=====",
  ]);
  const routed = routeVoyage([leg(0, 1)], [site(0, 0, 1), site(1, 4, 1)], s);
  assert.equal(routed[0]!.mode, "road", "a mild detour still rides");
});
