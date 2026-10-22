// Issue #950 round: the sea-edge place, chosen again. sweep-places.ts counted every water cell the sea gate shuts beside a detailed shore, and a lake is shut by the gate whole (`regionSeaGate` in src/world/region.ts takes the world's genuine-sea mask, `seaMask` in src/hydrology/sea-mask.ts), so its pick on seed 42 was a lake shore, where no sea decoration is ever drawn. This sweep takes only shores on the world's genuine sea, and counts the close-up's water cells beside the detailed shore that the gate shuts while genuine sea lies within a few cells of them: the cells where the sea's decorations stop short of the shore the close-up draws.
// Run from the tree root: node out/950/mock/sweep-sea-edge.ts   (adds the pick to measure/places.json; writes measure/sea-edge.tsv)
import { readFileSync, writeFileSync } from "node:fs";
import { seaMask } from "../../../src/hydrology/sea-mask.ts";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, DELIVERY, SEEDS, uvOf, winLabel, worldOf } from "./common.ts";
import { todayRegion } from "./sheets.ts";

const BAND = 5;
const NEAR = 6;

function stepped(region: World): { shut: number; open: number } {
  const { w, h } = region.elev;
  const gate = region.region?.seaGate ?? new Uint8Array(w * h);
  const water = (i: number): boolean => (region.elev.data[i] as number) <= region.seaLevel;
  const near = (x: number, y: number, r: number, f: (i: number) => boolean): boolean => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && f(nx + ny * w)) return true;
    }
    return false;
  };
  let shut = 0;
  let open = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      if (!water(i) || !near(x, y, 3, (j) => !water(j))) continue;
      if (gate[i] === 1) open++;
      else if (near(x, y, NEAR, (j) => water(j) && gate[j] === 1)) shut++;
    }
  }
  return { shut, open };
}

type Cand = { seed: number; x: number; y: number; shut: number; open: number; window: ReturnType<typeof bandWindow> };
const cands: Cand[] = [];
for (const seed of SEEDS) {
  const world = worldOf(seed);
  const W = world.recipe.gridW;
  const sea = seaMask(world.elev, world.seaLevel);
  for (let y = 20; y < world.recipe.gridH - 20; y += 20) {
    for (let x = 20; x < W - 20; x += 20) {
      let best: { x: number; y: number; d: number } | null = null;
      for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
        const i = x + dx + (y + dy) * W;
        if ((world.elev.data[i] as number) <= world.seaLevel) continue;
        if (![i - 1, i + 1, i - W, i + W].some((j) => sea[j] === 1)) continue;
        const d = Math.hypot(dx, dy);
        if (best === null || d < best.d) best = { x: x + dx, y: y + dy, d };
      }
      if (best === null) continue;
      const { u, v } = uvOf(world, best.x, best.y);
      const window = bandWindow(u, v, BAND);
      cands.push({ seed, x: best.x, y: best.y, window, ...stepped(todayRegion(world, window)) });
    }
  }
  console.error(`seed ${seed}: ${cands.length}`);
}
writeFileSync(`${DELIVERY}/measure/sea-edge.tsv`, ["seed\tworld x\tworld y\tband-5 window\twater beside the shore shut by the gate, genuine sea within 6 cells\twater beside the shore open", ...cands.map((c) => [c.seed, c.x, c.y, winLabel(c.window), c.shut, c.open].join("\t"))].join("\n") + "\n");
const best = [...cands].sort((a, b) => b.shut - a.shut)[0]!;
const places = JSON.parse(readFileSync(`${DELIVERY}/measure/places.json`, "utf8")) as { picks: Array<Record<string, unknown>> };
const pick = { seed: best.seed, kind: "sea edge on the open sea", name: `shore at world cell ${best.x},${best.y}`, x: best.x, y: best.y, window: best.window, score: best.shut, why: `${best.shut} close-up water cells beside the detailed shore are shut by the sea gate with genuine sea within ${NEAR} cells of them (${best.open} beside the shore stay open), the most of ${cands.length} shores on the world's genuine sea`, pickedBecause: "best on any seed by node out/950/mock/sweep-sea-edge.ts, which replaces the first sweep's sea-edge measure" };
places.picks = [...places.picks.filter((p) => p.kind !== "sea edge on the open sea"), pick];
writeFileSync(`${DELIVERY}/measure/places.json`, JSON.stringify(places, null, 1));
console.log(`${pick.kind}: seed ${pick.seed}, ${pick.name}, ${winLabel(best.window)}; ${pick.why}`);
