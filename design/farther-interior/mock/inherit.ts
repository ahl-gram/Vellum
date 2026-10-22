// Issue #950 round: does a deeper band inherit a channel carved into its ancestors? The issue's case for carving inside the chain is that it does. The chain floors each window to the elementwise maximum of its ancestors' surfaces (`floorToParent` in src/terrain/detail-guarantees.ts, `maxOfSurfaces` in src/world/detail-chain.ts), so a lowered ancestor can only lower the floor, and the window keeps its own detail wherever that stands above the floor. This measures it: each band-4 to band-6 close-up of the capitals is built through the forked chain with the carve on every ANCESTOR but not on the window itself, and its land is compared cell by cell with the uncarved chain and with the window carved after the chain.
// Run from the tree root: node out/950/mock/inherit.ts
import { writeFileSync } from "node:fs";
import type { Field } from "../../../src/core/grid.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import { bandWindow, DELIVERY, GRID_H, GRID_W, SEEDS, SHA, uvOf, worldOf } from "./common.ts";
import { buildChainedField, createChainCache } from "./chain-copy.ts";
import { carveFor } from "./carve.ts";

const lines: string[] = [`inheritance at ${SHA}: the window's land cells lowered when only its ancestors are carved, against the window carved after the chain`];
for (const seed of SEEDS) {
  const world = worldOf(seed);
  const cap = world.settlements[0]!;
  const { u, v } = uvOf(world, cap.x, cap.y);
  const carve = carveFor(world);
  for (const band of [4, 5, 6]) {
    const window = bandWindow(u, v, band);
    const same = (a: UvWindow, b: UvWindow): boolean => Math.abs(a.u0 - b.u0) < 1e-12 && Math.abs(a.v0 - b.v0) < 1e-12 && Math.abs(a.u1 - b.u1) < 1e-12;
    const spec = { seed, mapType: world.recipe.mapType, window, gridW: GRID_W, gridH: GRID_H, worldAspect: (world.recipe.gridW - 1) / (world.recipe.gridH - 1), seaLevel: world.seaLevel };
    const plain = buildChainedField(spec, createChainCache(64));
    const ancestorsOnly = buildChainedField({ ...spec, carve: { fn: (f: Field, w: UvWindow) => (same(w, window) ? f : carve(f, w)), key: "ancestors" } }, createChainCache(64));
    const after = carve(plain, window);
    let land = 0;
    let inherited = 0;
    let own = 0;
    let both = 0;
    let depthInherited = 0;
    let depthOwn = 0;
    for (let i = 0; i < plain.data.length; i++) {
      const p = plain.data[i] as number;
      if (p <= world.seaLevel) continue;
      land++;
      const a = p - (ancestorsOnly.data[i] as number);
      const o = p - (after.data[i] as number);
      if (a > 1e-12) inherited++;
      if (o > 1e-12) own++;
      if (a > 1e-12 && o > 1e-12) both++;
      depthInherited += Math.max(0, a);
      depthOwn += Math.max(0, o);
    }
    lines.push(`seed ${seed} band ${band} (${cap.name}): of ${land} land cells, the window's own carve lowers ${own} (summed depth ${depthOwn.toFixed(4)}); its ancestors' carve alone lowers ${inherited} (summed depth ${depthInherited.toFixed(4)}, ${((100 * depthInherited) / Math.max(1e-12, depthOwn)).toFixed(0)}% of the window's own), ${both} of them cells the window's own carve lowers too`);
  }
}
writeFileSync(`${DELIVERY}/measure/inherit.txt`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
