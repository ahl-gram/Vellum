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
import { partitionRealms } from "../../src/society/realms.ts";

function makeWorld(seed: number) {
  const elev = buildHeightfield({ seed, gridW: 120, gridH: 90, mapType: "island" });
  const sea = pickSeaLevel(elev, 0.4);
  const flow = computeFlow(elev, sea);
  const rivers = extractRivers(elev, flow, sea);
  const riverCells = new Uint8Array(elev.data.length);
  for (const r of rivers) {
    for (const p of r.points) riverCells[p.x + p.y * elev.w] = 1;
  }
  const climate = computeClimate(elev, sea, seed, { riverCells });
  const biomes = classifyBiomes(elev, sea, climate);
  const settlements = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(seed));
  return { elev, sea, riverCells, settlements };
}

test("every land cell belongs to a realm, ocean to none", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(42);
  const realms = partitionRealms(elev, sea, riverCells, settlements);
  for (let i = 0; i < elev.data.length; i++) {
    if ((elev.data[i] as number) > sea) {
      assert.ok((realms.labels[i] as number) >= 0, `unassigned land at ${i}`);
    } else {
      assert.equal(realms.labels[i], -1, `ocean labeled at ${i}`);
    }
  }
});

test("each seat sits inside its own realm", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(42);
  const realms = partitionRealms(elev, sea, riverCells, settlements);
  realms.seats.forEach((settlementIdx, realmId) => {
    const s = settlements[settlementIdx]!;
    assert.equal(realms.labels[s.x + s.y * elev.w], realmId);
  });
});

test("realm count stays within bounds", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(7);
  const realms = partitionRealms(elev, sea, riverCells, settlements);
  assert.ok(realms.seats.length >= 1);
  assert.ok(realms.seats.length <= 5);
});

test("partition is deterministic", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(9);
  const a = partitionRealms(elev, sea, riverCells, settlements);
  const b = partitionRealms(elev, sea, riverCells, settlements);
  assert.deepEqual(a.labels, b.labels);
  assert.deepEqual(a.seats, b.seats);
});

test("capital always seats realm 0", () => {
  const { elev, sea, riverCells, settlements } = makeWorld(11);
  const realms = partitionRealms(elev, sea, riverCells, settlements);
  const capitalIdx = settlements.findIndex((s) => s.kind === "capital");
  assert.equal(realms.seats[0], capitalIdx);
});
