// Issue #950 round: what each river arm costs on top of today's close-up once the window's chain is already held, so the chain's build (the same for every arm cut after it) drops out. Each seed's capital-centred window at each band (five a band, from measure-arms.ts's sample) is worked out once to fill the caches, then three more times per arm, and the fastest of the three is kept.
// Run from the tree root: node out/950/mock/cost-warm.ts
import { writeFileSync } from "node:fs";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, DELIVERY, median, SEEDS, SHA, uvOf, worldOf } from "./common.ts";
import { armARegion, armBRegion, todayRegion } from "./sheets.ts";

const targets = (_world: World): number[] => [0];
const best = (fn: () => unknown): number => {
  let b = Infinity;
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    fn();
    b = Math.min(b, performance.now() - t0);
  }
  return b;
};
const rows: Array<Record<string, number>> = [];
for (const seed of SEEDS) {
  const world = worldOf(seed);
  for (const band of [1, 2, 3, 4, 5, 6]) {
    for (const si of targets(world)) {
      const s = world.settlements[si]!;
      const { u, v } = uvOf(world, s.x, s.y);
      const w = bandWindow(u, v, band);
      const today = todayRegion(world, w);
      armBRegion(world, w, "after");
      armBRegion(world, w, "inside");
      rows.push({
        seed,
        band,
        today: best(() => todayRegion(world, w)),
        a: best(() => armARegion(world, w, today)),
        b: best(() => armBRegion(world, w, "after")),
        bInside: best(() => armBRegion(world, w, "inside")),
        b0: best(() => armBRegion(world, w, "after", { carve: false })),
      });
    }
  }
  console.error(`seed ${seed}`);
}
const L = [`cost with the chain held, at ${SHA}: per band, the median over the five capitals' close-ups of the fastest of three runs, ms. "today" is today's whole close-up after its chain; each arm's figure is its own whole close-up after the chain, except arm A, which runs on today's close-up and is the time it adds.`];
for (const band of [1, 2, 3, 4, 5, 6]) {
  const rs = rows.filter((r) => r.band === band);
  const m = (k: string): number => Math.round(median(rs.map((r) => r[k]!)));
  L.push(`band ${band}: today ${m("today")}; arm A adds ${m("a")}; arm B (cut after the chain) ${m("b")}, adding ${Math.round(median(rs.map((r) => r.b! - r.today!)))}; arm B cut inside the chain ${m("bInside")}; arm B without the cut ${m("b0")}, adding ${Math.round(median(rs.map((r) => r.b0! - r.today!)))}`);
}
writeFileSync(`${DELIVERY}/measure/cost-warm.txt`, L.join("\n") + "\n");
writeFileSync(`${DELIVERY}/measure/cost-warm.json`, JSON.stringify(rows, null, 1));
console.log(L.join("\n"));
