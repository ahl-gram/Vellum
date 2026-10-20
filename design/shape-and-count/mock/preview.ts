// Issue #849: quick look while choosing windows and crops; writes to the session scratchpad, never to the delivery.
// Run from the tree: node out/844/mock/preview.ts <scratch dir> <case,case,...>
import { mkdirSync, writeFileSync } from "node:fs";
import { findBrowser, rasterizeSvg } from "../../../src/cli/raster.ts";
import { buildWorld, recipeFor, renderWorld } from "./sheets.ts";
import { crescent, japan, outlineField, texas } from "./outlines.ts";
import type { Edge, TerrainInputs } from "./terrain.ts";
import type { MapType } from "../../../src/terrain/heightfield.ts";

const [dir, list] = process.argv.slice(2) as [string, string];
mkdirSync(dir, { recursive: true });
const browser = findBrowser();
if (!browser) throw new Error("no browser");
const outlines = { crescent: outlineField(crescent()), texas: outlineField(texas()), japan: outlineField(japan(false)), "japan-turned": outlineField(japan(true)) };
for (const item of list.split(",")) {
  const [name, seedS, typeS, edgeS] = item.split(":") as [keyof typeof outlines, string, MapType, string];
  const seed = Number(seedS);
  const f = outlines[name];
  const edge: Edge = edgeS === "dome" ? { kind: "dome" } : edgeS === "hard" ? { kind: "hard", outline: f } : edgeS.startsWith("bias") ? { kind: "bias", outline: f, strength: Number(edgeS.slice(4)) } : { kind: "soft", outline: f };
  const recipe = recipeFor(seed, { mapType: typeS });
  const inputs: TerrainInputs = { seed, mapType: typeS, edge };
  const w = buildWorld(recipe, edgeS === "dome" ? "engine" : "spike", inputs);
  const svg = `${dir}/849-${name}-${seed}-${edgeS}.svg`;
  writeFileSync(svg, renderWorld(w, "antique"));
  await rasterizeSvg(browser, svg, svg.replace(/\.svg$/, ".png"), 0.5);
  console.log(svg.replace(/\.svg$/, ".png"));
}
