import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { NEIGHBORS_8 } from "../../src/core/grid.ts";
import { buildHeightfield } from "../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { computeFlow } from "../../src/hydrology/flow.ts";
import { extractRivers } from "../../src/hydrology/rivers.ts";
import { computeClimate } from "../../src/climate/climate.ts";
import { classifyBiomes, BIOMES } from "../../src/climate/biomes.ts";
import { placeSettlements } from "../../src/society/sites.ts";

function makeWorld(seed: number) {
  const elev = buildHeightfield({ seed, gridW: 120, gridH: 90, mapType: "island" });
  const sea = pickSeaLevel(elev, 0.38);
  const flow = computeFlow(elev, sea);
  const rivers = extractRivers(elev, flow, sea);
  const riverCells = new Uint8Array(elev.data.length);
  for (const r of rivers) {
    for (const p of r.points) riverCells[p.x + p.y * elev.w] = 1;
  }
  const climate = computeClimate(elev, sea, seed, { riverCells, windDir: 0.9 });
  const biomes = classifyBiomes(elev, sea, climate);
  return { elev, sea, flow, riverCells, biomes };
}

test("settlements land on land, never on snow or alpine", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(42);
  const sites = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(42));
  assert.ok(sites.length >= 5, `too few settlements: ${sites.length}`);
  for (const s of sites) {
    const i = s.x + s.y * elev.w;
    assert.ok((elev.data[i] as number) > sea, "settlement in the sea");
    assert.notEqual(biomes[i], BIOMES.snow);
    assert.notEqual(biomes[i], BIOMES.alpine);
  }
});

test("exactly one capital, with water access", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(42);
  const sites = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(42));
  const capitals = sites.filter((s) => s.kind === "capital");
  assert.equal(capitals.length, 1);
  const cap = capitals[0]!;
  assert.ok(cap.harbor || cap.onRiver, "capital should touch water");
});

test("harbor flag matches the actual neighborhood", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(42);
  const sites = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(42));
  for (const s of sites) {
    let coastal = false;
    for (const [dx, dy] of NEIGHBORS_8) {
      const nx = s.x + dx;
      const ny = s.y + dy;
      if (!elev.inBounds(nx, ny)) continue;
      if ((elev.data[nx + ny * elev.w] as number) <= sea) coastal = true;
    }
    assert.equal(s.harbor, coastal, `harbor flag wrong at ${s.x},${s.y}`);
  }
});

test("settlements keep their distance from each other", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(7);
  const sites = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(7));
  for (let i = 0; i < sites.length; i++) {
    for (let j = i + 1; j < sites.length; j++) {
      const d = Math.hypot(sites[i]!.x - sites[j]!.x, sites[i]!.y - sites[j]!.y);
      assert.ok(d >= 5, `settlements too close: ${d}`);
    }
  }
});

test("placement is deterministic", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(9);
  const a = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(9));
  const b = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(9));
  assert.deepEqual(a, b);
});

test("rank counts respect their caps", () => {
  const { elev, sea, flow, riverCells, biomes } = makeWorld(11);
  const sites = placeSettlements(elev, sea, flow, riverCells, biomes, createRng(11), {
    maxTowns: 3,
    maxVillages: 4,
  });
  assert.ok(sites.filter((s) => s.kind === "town").length <= 3);
  assert.ok(sites.filter((s) => s.kind === "village").length <= 4);
});
