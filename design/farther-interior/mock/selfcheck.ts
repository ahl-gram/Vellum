// Issue #950 round: the fork is faithful. With no hook given, generateRegionWorldWith must equal the engine's generateRegionWorld byte for byte on this machine: the field, the rivers, and the rendered close-up, on three seeds at bands 1, 3, 5 and 6, each window centred on the capital as the Glass would commit it. Exits non-zero on any mismatch.
// Run from the tree root: node out/950/mock/selfcheck.ts
import { writeFileSync } from "node:fs";
import { generateRegionWorld, regionDetailLevel, regionTitle, type RegionSpec } from "../../../src/world/region.ts";
import { createChainCache } from "../../../src/world/detail-chain.ts";
import { renderMap } from "../../../src/render/map-renderer.ts";
import { generateRegionWorldWith } from "./region-copy.ts";
import { bandWindow, DELIVERY, GRID_H, GRID_W, RENDER_WIDTH, SHA, uvOf, worldOf } from "./common.ts";

const lines: string[] = [`selfcheck at ${SHA}: the fork with no hook against the engine`];
let failed = 0;
for (const seed of [42, 7, 2]) {
  const world = worldOf(seed);
  const cap = world.settlements[0]!;
  const { u, v } = uvOf(world, cap.x, cap.y);
  for (const band of [1, 3, 5, 6]) {
    const window = bandWindow(u, v, band);
    const spec: RegionSpec = { window, gridW: GRID_W, gridH: GRID_H, title: regionTitle(world, window), detail: true, chainCache: createChainCache() };
    const real = generateRegionWorld(world, spec);
    const fork = generateRegionWorldWith(world, { ...spec, chainCache: createChainCache() }, {});
    const regionRecipe = { window, worldGridW: world.recipe.gridW, detail: regionDetailLevel(spec) };
    const opts = { widthPx: RENDER_WIDTH, style: "antique" as const, legend: true, regionRecipe };
    const fieldOk = real.elev.data.every((x, i) => x === fork.elev.data[i]);
    const riversOk = JSON.stringify(real.rivers) === JSON.stringify(fork.rivers);
    const svgOk = renderMap(real, opts) === renderMap(fork, opts);
    const ok = fieldOk && riversOk && svgOk;
    if (!ok) failed++;
    lines.push(`${ok ? "ok  " : "FAIL"} seed ${seed} band ${band} (${cap.name}): field ${fieldOk}, rivers ${riversOk}, close-up SVG ${svgOk}`);
  }
}
lines.push(failed === 0 ? "all equal" : `${failed} mismatch(es)`);
writeFileSync(`${DELIVERY}/measure/selfcheck.txt`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
process.exitCode = failed === 0 ? 0 : 1;
