import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSurvey } from "../../src/render/survey.ts";
import { prepareVoyageRouter, routeVoyage } from "../../src/render/voyage-route.ts";
import { buildVoyagePlan, reorderPlanByTravel } from "../../src/render/voyage.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { Pt } from "../../src/core/rdp.ts";

// #184: the itinerary rides the true miles. The straight-line tour (voyage-tour.ts)
// can place two ports adjacent whose real road/sea path backtracks, so the plan is
// reordered on an actual-travel matrix measured by the SAME router that draws the
// legs (prepareVoyageRouter). These tests pin the router/matrix contract on real
// worlds; the pure matrix algorithm (refineTour) and the plan rebuild
// (applyTourOrder / reorderPlanByTravel) are unit-tested on synthetic fixtures in
// voyage-tour.test.ts and voyage.test.ts.

const polylineLength = (points: ReadonlyArray<Pt>): number => {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return d;
};

const realWorld = (seed: number) => {
  const world = generateWorld(defaultRecipe(seed));
  const manifest = buildPlaceManifest(world, 1500);
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  const s = buildSurvey(world.elev, world.seaLevel, world.roads);
  const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
  return { plan, s, sites };
};

// One generated world shared by the router-contract tests below (module-level so the
// ~1.5s generation is paid once; the world object is never mutated).
const isle = realWorld(526413615);

test("prepareVoyageRouter: route matches routeVoyage leg for leg (one code path)", () => {
  const router = prepareVoyageRouter(isle.sites, isle.s);
  assert.deepEqual(isle.plan.legs.map((l) => router.route(l)), routeVoyage(isle.plan.legs, isle.sites, isle.s));
});

test("legLength: symmetric, and measures the routed miles rather than the crow's flight", () => {
  const router = prepareVoyageRouter(isle.sites, isle.s);
  const byIdx = new Map(isle.sites.map((p) => [p.idx, p]));
  let bendy = 0;
  for (const leg of isle.plan.legs) {
    const len = router.legLength(leg.fromIdx, leg.toIdx);
    assert.equal(len, router.legLength(leg.toIdx, leg.fromIdx), "legLength must be symmetric");
    const a = byIdx.get(leg.fromIdx)!;
    const b = byIdx.get(leg.toIdx)!;
    const straight = Math.hypot(a.x - b.x, a.y - b.y);
    assert.ok(len >= straight - 1e-9, `routed ${len} shorter than straight ${straight}`);
    // The raw walk is at least as long as its RDP-simplified drawing (RDP only
    // removes vertices, which can only shorten a polyline). The crow's flight fails
    // this on any leg that bends.
    const drawn = polylineLength(router.route(leg).points);
    assert.ok(len >= drawn - 1e-9, `raw walk ${len} shorter than its simplified drawing ${drawn}`);
    if (len > straight * 1.15) bendy++;
  }
  assert.ok(bendy >= 1, "expected at least one leg measurably longer than its straight line");
});

test("legLength: deterministic across two prepared routers", () => {
  const a = prepareVoyageRouter(isle.sites, isle.s);
  const b = prepareVoyageRouter(isle.sites, isle.s);
  for (const leg of isle.plan.legs) {
    assert.equal(a.legLength(leg.fromIdx, leg.toIdx), b.legLength(leg.fromIdx, leg.toIdx));
  }
});

test("seed 12: the travel-ordered itinerary rides far fewer miles than the straight-line one", () => {
  // The measurement behind #184's build decision (2026-07-24 comment): seed 12's
  // straight-line order rides 1873 cells where a travel-ordered tour rides ~1035.
  // 0.75 leaves slack; the point is a LARGE, visible saving, not a precise ratio.
  const { plan, s, sites } = realWorld(12);
  const router = prepareVoyageRouter(sites, s);
  const re = reorderPlanByTravel(plan, router.legLength);

  const miles = (ports: ReadonlyArray<{ idx: number }>): number => {
    let total = 0;
    for (let i = 1; i < ports.length; i++) total += router.legLength(ports[i - 1]!.idx, ports[i]!.idx);
    return total;
  };
  assert.ok(
    miles(re.ports) < 0.75 * miles(plan.ports),
    `travel order ${miles(re.ports)} vs straight-line ${miles(plan.ports)}: expected a large saving`,
  );
  assert.equal(re.ports[0]!.idx, plan.ports[0]!.idx, "the capital still opens the survey");
  assert.deepEqual(
    [...re.ports.map((p) => p.idx)].sort((x, y) => x - y),
    [...plan.ports.map((p) => p.idx)].sort((x, y) => x - y),
    "the reorder must visit exactly the same ports",
  );
});
