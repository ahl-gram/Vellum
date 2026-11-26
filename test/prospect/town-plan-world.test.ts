import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRegionWorld, regionTitle, windowAround } from "../../src/world/region.ts";
import { LOD_BANDS } from "../../src/world/lod.ts";
import { CORRIDOR_WORLD_CELLS } from "../../src/world/river-route.ts";
import { sampleBilinear } from "../../src/prospect/transect.ts";
import { planTown } from "../../src/prospect/town-plan/plan.ts";
import type { PlanPoint } from "../../src/prospect/town-plan/types.ts";
import { crossingsOf, distanceToLine } from "../../test-support/town-plan-geometry.ts";
import { worldFor } from "../../test-support/seed-worlds.ts";

const GATE_ON_ROAD = 0.001; // cells: the prospect pins' own quantum, a gate being the crossing point itself (measured farthest 1.42e-14)

const planned = [1, 7, 42].map((seed) => {
  const world = worldFor(seed);
  return { seed, world, plans: world.settlements.map((_, i) => planTown(world, i)) };
});
const walled = planned.flatMap(({ seed, world, plans }) =>
  plans.flatMap((plan) => (plan.wall === null ? [] : [{ seed, world, plan, wall: plan.wall }])),
);

test("every gate lies on the world road it names", () => {
  const gates = walled.flatMap((w) => w.plan.gates.map((g) => ({ ...w, g })));
  assert.ok(gates.length > 0, "the walled plans hold gates");
  for (const w of walled) assert.ok(w.plan.gates.length > 0, `seed ${w.seed} index ${w.plan.index} has a gate`);
  for (const { seed, world, plan, g } of gates) {
    const road = world.roads[g.road];
    assert.notEqual(road, undefined, `seed ${seed} index ${plan.index} names a road`);
    assert.ok(
      distanceToLine(g.at, road!.points) <= GATE_ON_ROAD,
      `seed ${seed} index ${plan.index} gate on road ${g.road}`,
    );
  }
});

test("every world road that crosses a wall meets a gate there", () => {
  const crossed = walled.flatMap(({ seed, world, plan, wall }) =>
    world.roads.flatMap((road, r) => crossingsOf(road.points, wall).map((at) => ({ seed, plan, r, at }))),
  );
  assert.ok(crossed.length > 0, "some road crosses some wall");
  for (const { seed, plan, r, at } of crossed) {
    const met = plan.gates.some(
      (g) => g.road === r && Math.abs(g.at.x - at.x) + Math.abs(g.at.y - at.y) <= GATE_ON_ROAD,
    );
    assert.ok(met, `seed ${seed} index ${plan.index} road ${r} meets a gate at ${at.x.toFixed(3)}, ${at.y.toFixed(3)}`);
  }
});

function closeUpRoads(seed: number, index: number): { roads: PlanPoint[][]; plan: ReturnType<typeof planTown> } {
  const world = worldFor(seed);
  const window = windowAround(world, world.settlements[index]!, LOD_BANDS[3]!.sizeUV);
  const gridW = 320;
  const gridH = 240;
  const closeUp = generateRegionWorld(world, { window, gridW, gridH, title: regionTitle(world, window), detail: true });
  const roads = closeUp.roads.map((road) =>
    road.points.map((p) => ({
      x: (window.u0 + (p.x / (gridW - 1)) * (window.u1 - window.u0)) * (world.recipe.gridW - 1),
      y: (window.v0 + (p.y / (gridH - 1)) * (window.v1 - window.v0)) * (world.recipe.gridH - 1),
    })),
  );
  return { roads, plan: planTown(world, index) };
}

test("a gate meets the road a close-up draws", () => {
  for (const [seed, index] of [
    [42, 0],
    [7, 4],
  ] as const) {
    const { roads, plan } = closeUpRoads(seed, index);
    assert.ok(plan.gates.length >= 3, `seed ${seed} index ${index} has gates to read`);
    assert.ok(roads.length > 0, `seed ${seed} index ${index} close-up has roads`);
    for (const g of plan.gates) {
      const nearest = Math.min(...roads.map((road) => distanceToLine(g.at, road)));
      assert.ok(
        nearest <= CORRIDOR_WORLD_CELLS,
        `seed ${seed} index ${index} gate ${nearest.toFixed(3)} cells from a close-up road`,
      );
    }
  }
});

test("a bridge stands on a world river, and a river through a wall has one", () => {
  const bridges = walled.flatMap((w) => w.plan.landmarks.filter((l) => l.kind === "bridge").map((l) => ({ ...w, l })));
  const riverWalls = walled.filter((w) => w.world.rivers.some((r) => crossingsOf(r.points, w.wall).length > 0));
  assert.ok(riverWalls.length > 0, "some wall has a river through it");
  assert.ok(bridges.length > 0, "some plan has a bridge");
  for (const { seed, world, plan, l } of bridges) {
    assert.ok(
      world.rivers.some((r) => distanceToLine(l.at, r.points) <= GATE_ON_ROAD),
      `seed ${seed} index ${plan.index} bridge on a river`,
    );
  }
  for (const { seed, plan } of riverWalls) {
    assert.ok(
      plan.landmarks.some((l) => l.kind === "bridge"),
      `seed ${seed} index ${plan.index} has a bridge where a river crosses its wall`,
    );
  }
});

test("a street starts at every gate", () => {
  const gates = walled.flatMap((w) => w.plan.gates.map((g) => ({ ...w, g })));
  assert.ok(gates.length > 0, "the walled plans hold gates");
  for (const { seed, plan, g } of gates) {
    assert.ok(
      plan.streets.some((s) => s[0]!.x === g.at.x && s[0]!.y === g.at.y),
      `seed ${seed} index ${plan.index} a street starts at gate ${g.road}`,
    );
  }
});

test("every block stands on dry land", () => {
  const vertices = planned.flatMap(({ seed, world, plans }) =>
    plans.flatMap((plan) => plan.blocks.flat().map((p) => ({ seed, world, plan, p }))),
  );
  assert.ok(vertices.length > 0, "the plans hold block vertices");
  for (const { seed, world, plan, p } of vertices) {
    assert.ok(
      sampleBilinear(world.elev, p.x, p.y) > world.seaLevel,
      `seed ${seed} index ${plan.index} block vertex above the sea`,
    );
  }
});
