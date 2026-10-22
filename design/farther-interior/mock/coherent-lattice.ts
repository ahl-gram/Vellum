// Issue #950 round: the coherence count the issue names, on the windows it names. `node scripts/region-detail/sweep.ts` counts rivers ending on dry land over every lattice window of bands 1 to 3 (`bandWindows` in scripts/region-detail/sweep-windows.ts) on seeds 42, 7, 2, 15 and 23; this counts the same, with the same copied function (instruments.ts, checked against the sweep's own JSON), for today's close-up and for each river arm. Bands 4 to 6 are counted on the town-centred sample instead (measure-arms.ts), since their lattices hold 256 to 4096 windows a seed.
// Run from the tree root: node out/950/mock/coherent-lattice.ts
import { writeFileSync } from "node:fs";
import { bandWindows } from "../../../scripts/region-detail/sweep-windows.ts";
import { LOD_BANDS, type LodBand } from "../../../src/world/lod.ts";
import { DELIVERY, SEEDS, SHA, worldOf } from "./common.ts";
import { endingTol, riversEndingOnLand } from "./instruments.ts";
import { armARegion, armBRegion, todayRegion } from "./sheets.ts";

const totals = new Map<string, { rivers: number; ending: number; windows: number }>();
const add = (k: string, rivers: number, ending: number): void => {
  const t = totals.get(k) ?? { rivers: 0, ending: 0, windows: 0 };
  totals.set(k, { rivers: t.rivers + rivers, ending: t.ending + ending, windows: t.windows + 1 });
};
for (const seed of SEEDS) {
  const world = worldOf(seed);
  for (const idx of [1, 2, 3]) {
    for (const w of bandWindows(LOD_BANDS[idx] as LodBand)) {
      const today = todayRegion(world, w);
      const arms = [
        ["today", today],
        ["A", armARegion(world, w, today).region],
        ["B", armBRegion(world, w, "after")],
      ] as const;
      for (const [name, region] of arms) add(`${idx}|${name}`, region.rivers.length, riversEndingOnLand(region, region.rivers, endingTol(world, w)).length);
    }
    console.error(`seed ${seed} band ${idx}`);
  }
}
const L = [`rivers ending on dry land at ${SHA}, every lattice window of bands 1 to 3 (the windows scripts/region-detail/sweep.ts walks), seeds 42, 7, 2, 15, 23, detail on`];
for (const idx of [1, 2, 3]) {
  L.push(`band ${idx}: ${["today", "A", "B"].map((n) => { const t = totals.get(`${idx}|${n}`)!; return `${n === "today" ? "today" : `arm ${n}`} ${t.ending} of ${t.rivers} rivers over ${t.windows} windows`; }).join("; ")}`);
}
writeFileSync(`${DELIVERY}/measure/coherent-lattice.txt`, L.join("\n") + "\n");
console.log(L.join("\n"));
