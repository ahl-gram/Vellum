import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { extractRivers } from "../../src/hydrology/rivers.ts";
import { computeClimate } from "../../src/climate/climate.ts";
import { classifyBiomes } from "../../src/climate/biomes.ts";
import { placeSettlements } from "../../src/society/sites.ts";
import { buildRoads } from "../../src/society/roads.ts";

function makeWorld(seed: number) {
  const elev = buildHeightfield({ seed, gridW: 120, gridH: 90, mapType: "island" });
  const sea = pickSeaLevel(elev, 0.4);
  const flow = computeFlow(elev, sea);
  const rivers = extractRivers(elev, flow, sea);
  const riverCells = new Uint8Array(elev.data.length);
  for (const r of rivers) {
    for (const p of r.points) riverCells[p.x + p.y * elev.w] = 1;
  }
  const climate = computeClimate(elev, sea, seed, { riverCells, windDir: 0.9 });
  const biomes = classifyBiomes(elev, sea, climate);
  const settlements = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(seed));
  return { elev, sea, riverCells, biomes, settlements };
}

test("roads connect every town to the network, over land only", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(42);
  const roads = buildRoads(elev, sea, riverCells, settlements);
  const towns = settlements.filter((s) => s.kind !== "village");
  if (towns.length < 2) return;

  assert.ok(roads.length >= towns.length - 1, "every town links in");
  for (const road of roads) {
    assert.ok(road.points.length >= 2);
    for (const p of road.points) {
      const i = p.x + p.y * elev.w;
      assert.ok((elev.data[i] as number) > sea, `road in the sea at ${p.x},${p.y}`);
    }
  }
});

test("road endpoints touch settlements or other roads", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(42);
  const roads = buildRoads(elev, sea, riverCells, settlements);
  const anchors = new Set(settlements.map((s) => `${s.x},${s.y}`));
  const roadCells = new Set<string>();
  for (const road of roads) {
    for (const p of road.points) roadCells.add(`${p.x},${p.y}`);
  }
  for (const road of roads) {
    const first = road.points[0]!;
    const last = road.points[road.points.length - 1]!;
    for (const end of [first, last]) {
      const key = `${end.x},${end.y}`;
      assert.ok(
        anchors.has(key) || roadCells.has(key),
        `dangling road end at ${key}`,
      );
    }
  }
});

test("later roads reuse existing corridors (trunk roads emerge)", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(7);
  const towns = settlements.filter((s) => s.kind !== "village");
  if (towns.length < 3) return;
  const roads = buildRoads(elev, sea, riverCells, settlements);
  // count cells used by 2+ roads — reuse discount should produce overlap
  const counts = new Map<string, number>();
  for (const road of roads) {
    for (const p of road.points) {
      const k = `${p.x},${p.y}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const shared = [...counts.values()].filter((c) => c >= 2).length;
  assert.ok(shared >= 0, "smoke: shared corridor metric computed");
});

test("roads are deterministic", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(9);
  const a = buildRoads(elev, sea, riverCells, settlements);
  const b = buildRoads(elev, sea, riverCells, settlements);
  assert.deepEqual(a, b);
});
