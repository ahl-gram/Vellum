// Issue #849: the shape sweep found the soft likeness at today's land share leaves about half the land outside the
// outline (`shape-sweep.md`), because a shape fitted in the inner box covers less of the sheet than the share. Two
// remedies are measured here so the sitting can rule on them from stills (both are this round's own, not ruled):
//   bigger : the outline drawn as large as today's dome core (the falloff-start disc's share of the sheet), capped
//            so its box keeps MIN_INSET of sea on every side;
//   share  : the outline at the inner box, the land share set to the outline's own share of the sheet.
// Run from the tree: node out/844/measure/sweep-shape-extras.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { defaultRecipe } from "../../../src/world/generate.ts";
import { pickSeaLevel } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import type { MapType } from "../../../src/terrain/heightfield.ts";
import { spikeHeightfield } from "../mock/terrain.ts";
import { crescent, isInside, japan, outlineField, texas, type Outline, type OutlineField } from "../mock/outlines.ts";
import { bigFit, DOME_CORE_SHARE, MIN_INSETS } from "../mock/fits.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const W = 320,
  H = 240;

const insideMask = (f: OutlineField): Uint8Array => {
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m[x + y * W] = isInside(f, x / (W - 1), y / (H - 1)) ? 1 : 0;
  return m;
};
const shareOf = (m: Uint8Array): number => m.reduce((a, b) => a + b, 0) / m.length;
const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? (s[(s.length - 1) / 2] as number) : ((s[s.length / 2 - 1] as number) + (s[s.length / 2] as number)) / 2;
};
const pct = (x: number): string => `${(100 * x).toFixed(0)}%`;

function run(seed: number, mapType: MapType, f: OutlineField, inside: Uint8Array, landShare: number): { likeness: number; beyond: number; islands: number; border: number } {
  const elev = spikeHeightfield({ seed, mapType, edge: { kind: "soft", outline: f } }, { gridW: W, gridH: H });
  const sea = pickSeaLevel(elev, landShare);
  let land = 0,
    both = 0,
    inn = 0,
    border = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = x + y * W;
      const l = (elev.data[i] as number) > sea;
      if (l) land++;
      if (inside[i]) inn++;
      if (l && inside[i]) both++;
      if (l && (x === 0 || y === 0 || x === W - 1 || y === H - 1)) border++;
    }
  return { likeness: both / (inn + land - both), beyond: (land - both) / land, islands: labelLandmasses(elev, sea).sizes.filter((s) => s >= 20).length, border };
}

const lines: string[] = ["# Two remedies for the soft likeness's spill, terrain only, seeds 1 to 40 (at 581a6de3)", ""];
lines.push(`"bigger": the outline scaled to cover the dome core's share of the sheet for its type (${Object.entries(DOME_CORE_SHARE).map(([k, v]) => `${k} ${v.toFixed(3)}`).join(", ")}), capped so its box keeps the inset named on every side. "share": the outline at the inner box, the land share set to the outline's own share of the sheet.`);
lines.push("");
lines.push("| outline | type | variant | outline's share of the sheet | land share | likeness median (min to max) | land beyond median (min to max) | islands median (min to max) | border land cells (sum) |");
lines.push("|---|---|---|---|---|---|---|---|---|");
const CASES: ReadonlyArray<{ key: string; mapType: MapType; make: (inset?: number) => Outline }> = [
  { key: "crescent", mapType: "island", make: (i) => crescent(i) },
  { key: "texas", mapType: "island", make: (i) => texas(i) },
  { key: "japan", mapType: "archipelago", make: (i) => japan(false, i) },
];
const json: Record<string, unknown> = { sha: "581a6de3" };
for (const c of CASES) {
  const typeShare = defaultRecipe(1, { mapType: c.mapType }).landFraction;
  const variants: Array<{ v: string; f: OutlineField; share: (os: number) => number }> = [];
  for (const minInset of MIN_INSETS) variants.push({ v: `bigger, min inset ${minInset}`, f: outlineField(bigFit(c.make, c.mapType, minInset).outline), share: () => typeShare });
  variants.push({ v: "share = the outline's own", f: outlineField(c.make()), share: (os) => os });
  for (const v of variants) {
    const inside = insideMask(v.f);
    const os = shareOf(inside);
    const rows = SEEDS.map((s) => run(s, c.mapType, v.f, inside, v.share(os)));
    const L = rows.map((r) => r.likeness),
      B = rows.map((r) => r.beyond),
      I = rows.map((r) => r.islands);
    json[`${c.key}|${v.v}`] = rows;
    lines.push(`| ${c.key} | ${c.mapType} | ${v.v} | ${pct(os)} | ${v.share(os).toFixed(3)} | ${median(L).toFixed(2)} (${Math.min(...L).toFixed(2)} to ${Math.max(...L).toFixed(2)}) | ${pct(median(B))} (${pct(Math.min(...B))} to ${pct(Math.max(...B))}) | ${median(I)} (${Math.min(...I)} to ${Math.max(...I)}) | ${rows.reduce((a, r) => a + r.border, 0)} |`);
  }
}
lines.push("");
lines.push("Command: `node out/844/measure/sweep-shape-extras.ts` from the design-844 worktree at 581a6de3.");
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/shape-extras-sweep.md`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/shape-extras-sweep.json`, JSON.stringify(json, null, 1));
console.log(lines.join("\n"));
