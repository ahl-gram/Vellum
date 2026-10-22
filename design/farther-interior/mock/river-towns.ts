// Issue #950 round: does a town the world sets on a river stand on the river the close-up draws? On the measurement sample (20 town-centred close-ups a band, bands 3 to 6), every town or village of the close-up whose world settlement is flagged as on a river (`onRiver`), and its distance to the nearest river the close-up draws, today and under each arm, in world cells.
// Run from the tree root: node out/950/mock/river-towns.ts
import { writeFileSync } from "node:fs";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, cellsPerWorldCell, DELIVERY, distToPolyline, median, SEEDS, SHA, uvOf, worldOf } from "./common.ts";
import { armARegion, armBRegion, todayRegion } from "./sheets.ts";

function targets(world: World): number[] {
  const n = world.settlements.length;
  return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])].filter((i) => i >= 0 && i < n);
}
const out: Record<string, Record<number, number[]>> = { today: {}, A: {}, B: {} };
for (const seed of SEEDS) {
  const world = worldOf(seed);
  for (const band of [3, 4, 5, 6]) {
    for (const si of targets(world)) {
      const s = world.settlements[si]!;
      const { u, v } = uvOf(world, s.x, s.y);
      const w = bandWindow(u, v, band);
      const today = todayRegion(world, w);
      const arms: Array<[string, World]> = [
        ["today", today],
        ["A", armARegion(world, w, today).region],
        ["B", armBRegion(world, w, "after")],
      ];
      const per = cellsPerWorldCell(w, world);
      for (const [name, region] of arms) {
        for (const t of region.settlements.filter((x) => x.kind !== "hamlet" && x.onRiver)) {
          const d = Math.min(Infinity, ...region.rivers.map((r) => distToPolyline(t.x, t.y, r.points)));
          ((out[name]![band] ??= []) as number[]).push(d / per);
        }
      }
    }
  }
  console.error(`seed ${seed}`);
}
const L = [`river towns at ${SHA}: towns and villages the world sets on a river (onRiver), on the measurement sample's close-ups, and their distance to the nearest river the close-up draws, world cells (Infinity: the close-up draws no river at all).`];
for (const band of [3, 4, 5, 6]) {
  for (const name of ["today", "A", "B"]) {
    const ds = out[name]![band] ?? [];
    const finite = ds.filter(Number.isFinite);
    L.push(`band ${band}, ${name}: ${ds.length} river towns; ${ds.length - finite.length} with no river drawn on the sheet; within half a world cell of a drawn river ${finite.filter((d) => d <= 0.5).length}; median distance ${finite.length ? median(finite).toFixed(2) : "none"}, largest ${finite.length ? Math.max(...finite).toFixed(2) : "none"}`);
  }
}
writeFileSync(`${DELIVERY}/measure/river-towns.txt`, L.join("\n") + "\n");
console.log(L.join("\n"));
