// Issue #849: choosing the biting wobble's two numbers by eye and by count; writes to the session scratchpad only.
// Run from the tree: node out/844/mock/preview-wobble.ts <scratch dir> <scale/amp,...>
import { mkdirSync, writeFileSync } from "node:fs";
import { findBrowser, rasterizeSvg } from "../../../src/cli/raster.ts";
import { buildWorld, recipeFor, renderWorld, sheetFacts } from "./sheets.ts";
import { LOBE_COVERAGE, placeLobes } from "./terrain.ts";

const [dir, list] = process.argv.slice(2) as [string, string];
mkdirSync(dir, { recursive: true });
const browser = findBrowser();
if (!browser) throw new Error("no browser");
for (const item of list.split(",")) {
  const [scale, amp, n, cw] = item.split("/").map(Number) as [number, number, number, number];
  const seed = 1;
  const recipe = recipeFor(seed, { mapType: "archipelago", coastWarp: cw });
  const lobes = placeLobes(seed, n, "equal", LOBE_COVERAGE);
  const w = buildWorld(recipe, "spike", { seed, mapType: "archipelago", coastWarp: cw, edge: { kind: "lobes", lobes, sunk: true, wobble: { scale, amp } } });
  const f = sheetFacts(w);
  const svg = `${dir}/849-wobble-${scale}-${amp}-${n}-${cw}.svg`;
  writeFileSync(svg, renderWorld(w, "antique"));
  await rasterizeSvg(browser, svg, svg.replace(/[.]svg$/, ".png"), 0.5);
  console.log(`${item}: ${f.islands} islands, border ${f.borderLand} -> ${svg.replace(/[.]svg$/, ".png")}`);
}
