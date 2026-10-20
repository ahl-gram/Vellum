// Issue #849: the count's band on every map type with the mechanism Sub 3 (Issue #852) names, the lobes covering a
// FIXED 0.30 of the sheet. D14's quoted bands were measured with the coverage scaled to the share
// (`count-through-outline-2.md`), so this re-measures the bands the round's type stills actually draw, both sizes, as
// measured and with the ground between sunk, seeds 1 to 10; plus lobes inside the Texas outline.
// Run from the tree: node out/844/measure/sweep-count-types.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { defaultRecipe } from "../../../src/world/generate.ts";
import { pickSeaLevel } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import type { MapType } from "../../../src/terrain/heightfield.ts";
import { LOBE_COVERAGE, placeLobes, spikeHeightfield } from "../mock/terrain.ts";
import { outlineField, texas } from "../mock/outlines.ts";
import { cellShare } from "../mock/fits.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
const W = 320,
  H = 240;

function count(seed: number, mapType: MapType, n: number, spread: "equal" | "varied", sunk: boolean, coverage = LOBE_COVERAGE, within?: ReturnType<typeof outlineField>): { islands: number; largest: number; border: number } {
  const lobes = placeLobes(seed, n, spread, coverage, within);
  const elev = spikeHeightfield({ seed, mapType, edge: { kind: "lobes", lobes, sunk, ...(within ? { within } : {}) } }, { gridW: W, gridH: H });
  const sea = pickSeaLevel(elev, defaultRecipe(seed, { mapType }).landFraction);
  const { sizes } = labelLandmasses(elev, sea);
  const land = sizes.reduce((a, b) => a + b, 0);
  let border = 0;
  for (let x = 0; x < W; x++) border += +((elev.data[x] as number) > sea) + +((elev.data[x + (H - 1) * W] as number) > sea);
  for (let y = 1; y < H - 1; y++) border += +((elev.data[y * W] as number) > sea) + +((elev.data[W - 1 + y * W] as number) > sea);
  return { islands: sizes.filter((s) => s >= 20).length, largest: Math.max(...sizes) / land, border };
}
const range = (xs: number[]): string => `${Math.min(...xs)} to ${Math.max(...xs)}`;

const lines = ["# The count on every map type, the lobes covering a fixed 0.30 of the sheet (at 581a6de3)", "", "Islands of 20 or more cells achieved, min to max over seeds 1 to 10, each type at its own default land share and shape numbers. \"Sunk\" lowers baseKeep to 0.2 and deepens sinkDepth to 0.4 between the lobes. The largest landmass's share of the land is given at asked 100.", ""];
lines.push("| type | share | sizes | variant | asked 2 | asked 5 | asked 20 | asked 100 | largest at 100 | border land (sum) |");
lines.push("|---|---|---|---|---|---|---|---|---|---|");
const json: Record<string, unknown> = { sha: "581a6de3", seeds: SEEDS };
for (const mapType of ["archipelago", "island", "citystate", "continent"] as const) {
  for (const spread of ["equal", "varied"] as const) {
    for (const sunk of [false, true]) {
      const cells: string[] = [];
      let largest: number[] = [];
      let border = 0;
      for (const n of [2, 5, 20, 100]) {
        const rs = SEEDS.map((s) => count(s, mapType, n, spread, sunk));
        json[`${mapType}|${spread}|${sunk ? "sunk" : "measured"}|${n}`] = rs;
        cells.push(range(rs.map((r) => r.islands)));
        border += rs.reduce((a, r) => a + r.border, 0);
        if (n === 100) largest = rs.map((r) => r.largest);
      }
      lines.push(`| ${mapType} | ${defaultRecipe(1, { mapType }).landFraction} | ${spread} | ${sunk ? "sunk" : "as measured"} | ${cells.join(" | ")} | ${Math.min(...largest).toFixed(2)} to ${Math.max(...largest).toFixed(2)} | ${border} |`);
    }
  }
}
const tf = outlineField(texas());
const cov = Math.min(LOBE_COVERAGE, cellShare(tf.outline));
lines.push("");
lines.push(`## Lobes inside the Texas outline (archipelago, share 0.24, equal, sunk, coverage cut to the outline's own share, ${cov.toFixed(3)})`);
lines.push("");
lines.push("| asked | islands (seeds 1 to 10) | border land (sum) |");
lines.push("|---|---|---|");
for (const n of [5, 20, 100]) {
  const rs = SEEDS.map((s) => count(s, "archipelago", n, "equal", true, cov, tf));
  json[`texas|${n}`] = rs;
  lines.push(`| ${n} | ${rs.map((r) => r.islands).join(", ")} | ${rs.reduce((a, r) => a + r.border, 0)} |`);
}
lines.push("");
lines.push("Command: `node out/844/measure/sweep-count-types.ts` from the design-844 worktree at 581a6de3.");
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/count-types-fixed.md`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/count-types-fixed.json`, JSON.stringify(json, null, 1));
console.log(lines.join("\n"));
