// Issue #950 round, a working check (not delivered): how much of the first sea-edge window's water the world calls genuine sea.
import { seaMask } from "../../../src/hydrology/sea-mask.ts";
import { bandWindow, uvOf, worldOf } from "./common.ts";
import { todayRegion } from "./sheets.ts";
const world = worldOf(42);
const { u, v } = uvOf(world, 143, 76);
for (const band of [3, 5]) {
  const r = todayRegion(world, bandWindow(u, v, band));
  const gate = r.region!.seaGate;
  let water = 0;
  let open = 0;
  for (let i = 0; i < r.elev.data.length; i++) if ((r.elev.data[i] as number) <= r.seaLevel) { water++; if (gate[i] === 1) open++; }
  console.log(`band ${band}: water cells ${water}, of them genuine sea by the gate ${open}; lakes named in window: ${r.names.lakes.map((l) => l.name).join(", ") || "none"}`);
}
const sea = seaMask(world.elev, world.seaLevel);
console.log(`world cell 142,76 (west of the place): water ${(world.elev.data[142 + 76 * 320] as number) <= world.seaLevel}, genuine sea ${sea[142 + 76 * 320] === 1}; lakes: ${world.names.lakes.map((l) => `${l.name} at ${l.x},${l.y}`).join("; ")}`);
