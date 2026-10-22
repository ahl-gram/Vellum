// Issue #950 exploration: the field, the world rivers and the region rivers at the breakdown's two seed-42 witnesses, bands 3 to 6, so the arms are designed on numbers rather than guesses.
// Run from the tree root: node out/950/probe-fields.ts
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle } from "../../src/world/region.ts";
import { createChainCache } from "../../src/world/detail-chain.ts";
import { lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { isMajorRiver, riverThreshold } from "../../src/hydrology/rivers.ts";
import { regionDensityRatio } from "../../src/world/region-rivers.ts";

const world = generateWorld(defaultRecipe(42));
let wmax = -Infinity;
let wmin = Infinity;
for (const v of world.elev.data) {
  wmax = Math.max(wmax, v);
  wmin = Math.min(wmin, v);
}
console.log(`seed 42: seaLevel ${world.seaLevel.toFixed(4)} elev ${wmin.toFixed(3)}..${wmax.toFixed(3)} rivers ${world.rivers.length} (majors ${world.rivers.filter(isMajorRiver).length}) roads ${world.roads.length} settlements ${world.settlements.length}`);
const landAcc: number[] = [];
for (let i = 0; i < world.elev.data.length; i++) if ((world.elev.data[i] as number) > world.seaLevel) landAcc.push(world.flow.acc[i] as number);
console.log(`world river threshold ${riverThreshold(landAcc).toFixed(2)}`);
console.log("first settlements:", world.settlements.slice(0, 6).map((s) => `${s.name} ${s.kind} (${s.x},${s.y})`).join("; "));
const cache = createChainCache(64);
for (const [name, cx, cy] of [
  ["Laukuwelua", 0.51171875, 0.3984375],
  ["Won", 0.73828125, 0.671875],
] as const) {
  for (const band of [3, 4, 5, 6]) {
    const size = 1 / 2 ** band;
    const q = quantizeCenter(cx, cy, size);
    const window = lodWindowFor(q.cx, q.cy, size);
    const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window), detail: true, chainCache: cache });
    let land = 0;
    let rmin = Infinity;
    let rmax = -Infinity;
    for (const v of region.elev.data) {
      if (v > region.seaLevel) land++;
      rmin = Math.min(rmin, v);
      rmax = Math.max(rmax, v);
    }
    // local relief: mean absolute difference between a cell and its right neighbour, over land
    let rel = 0;
    let n = 0;
    for (let y = 0; y < 240; y++) {
      for (let x = 0; x < 319; x++) {
        const a = region.elev.data[x + y * 320] as number;
        const b = region.elev.data[x + 1 + y * 320] as number;
        if (a > region.seaLevel && b > region.seaLevel) {
          rel += Math.abs(a - b);
          n++;
        }
      }
    }
    const density = regionDensityRatio(320, 240, window, 320, 240);
    const maxAcc = Math.max(...Array.from(region.flow.acc));
    console.log(
      `${name} band ${band} window u0 ${window.u0} v0 ${window.v0}: land ${(land / 76800).toFixed(3)} elev ${rmin.toFixed(3)}..${rmax.toFixed(3)} mean step relief ${(rel / Math.max(1, n)).toExponential(2)}; density ${density.toFixed(0)}; region threshold ${(riverThreshold(landAcc) * density).toFixed(0)}; region max acc ${maxAcc.toFixed(0)}; region rivers ${region.rivers.length} (points ${region.rivers.map((r) => r.points.length).join(",")}); towns ${region.settlements.filter((s) => s.kind !== "hamlet").map((s) => s.name).join(",")}; hamlets ${region.settlements.filter((s) => s.kind === "hamlet").length}; roads ${region.roads.length}`,
    );
  }
}
