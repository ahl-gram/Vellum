// Issue #849: how each shape direction lands across seeds 1 to 40, terrain only (the spike's heightfield at the
// type's default share, four-connected landmasses), so the round's shape seeds are chosen by a measurement and every
// caption's "median" or "low" is checked. Also the inner box's sensitivity (inset 0.14 against the dome's own
// falloff-start box) for Texas, the one figure the stand-in fit is judged on.
// Run from the tree: node out/844/measure/sweep-shapes.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { defaultRecipe } from "../../../src/world/generate.ts";
import { pickSeaLevel } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import type { MapType } from "../../../src/terrain/heightfield.ts";
import { spikeHeightfield, SHAPES, type Edge } from "../mock/terrain.ts";
import { crescent, isInside, japan, outlineField, texas, type OutlineField } from "../mock/outlines.ts";

const OUT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const W = 320,
  H = 240;

type Row = { seed: number; likeness: number; landBeyond: number; islands: number; border: number };

function measure(seed: number, mapType: MapType, edge: Edge, f: OutlineField, inside: Uint8Array): Row {
  const r = defaultRecipe(seed, { mapType });
  const elev = spikeHeightfield({ seed, mapType, edge }, { gridW: W, gridH: H });
  const sea = pickSeaLevel(elev, r.landFraction);
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
  const { sizes } = labelLandmasses(elev, sea);
  void f;
  return { seed, likeness: both / (inn + land - both), landBeyond: (land - both) / land, islands: sizes.filter((s) => s >= 20).length, border };
}

const insideMask = (f: OutlineField): Uint8Array => {
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) m[x + y * W] = isInside(f, x / (W - 1), y / (H - 1)) ? 1 : 0;
  return m;
};
const share = (m: Uint8Array): number => m.reduce((a, b) => a + b, 0) / m.length;
const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? (s[(s.length - 1) / 2] as number) : ((s[s.length / 2 - 1] as number) + (s[s.length / 2] as number)) / 2;
};
const pct = (x: number): string => `${(100 * x).toFixed(0)}%`;

const CASES: ReadonlyArray<{ key: string; mapType: MapType; f: OutlineField }> = [
  { key: "crescent", mapType: "island", f: outlineField(crescent()) },
  { key: "texas", mapType: "island", f: outlineField(texas()) },
  { key: "japan", mapType: "archipelago", f: outlineField(japan(false)) },
  { key: "japan-turned", mapType: "archipelago", f: outlineField(japan(true)) },
  { key: "texas-dome-box", mapType: "island", f: outlineField(texas(0.5 - SHAPES.island.falloffStart / 2)) },
];
const DIRS = (f: OutlineField): ReadonlyArray<{ key: string; edge: Edge }> => [
  { key: "dome (control)", edge: { kind: "dome" } },
  { key: "soft", edge: { kind: "soft", outline: f } },
  { key: "hard", edge: { kind: "hard", outline: f } },
  { key: "bias 0.35", edge: { kind: "bias", outline: f, strength: 0.35 } },
  { key: "bias 0.7", edge: { kind: "bias", outline: f, strength: 0.7 } },
];

const lines: string[] = ["# The shape directions across seeds 1 to 40, terrain only (at 581a6de3)", ""];
lines.push("Likeness is the land and the outline's overlap over their union (1 is the outline exactly). Land beyond is the share of the land outside the outline. Islands are landmasses of 20 cells or more. The world sheet only; every figure is min to max over the seeds, with the median.");
lines.push("");
const json: Record<string, unknown> = { sha: "581a6de3", seeds: SEEDS };
for (const c of CASES) {
  const inside = insideMask(c.f);
  lines.push(`## ${c.key} on the ${c.mapType} type (share ${defaultRecipe(1, { mapType: c.mapType }).landFraction}), the outline covering ${pct(share(inside))} of the sheet; ${c.f.outline.fit}`);
  lines.push("");
  lines.push("| direction | likeness median (min to max) | land beyond the outline median (min to max) | islands median (min to max) | border land cells (sum) |");
  lines.push("|---|---|---|---|---|");
  const per: Record<string, Row[]> = {};
  for (const d of DIRS(c.f)) {
    const rows = SEEDS.map((s) => measure(s, c.mapType, d.edge, c.f, inside));
    per[d.key] = rows;
    const L = rows.map((r) => r.likeness),
      B = rows.map((r) => r.landBeyond),
      I = rows.map((r) => r.islands);
    lines.push(`| ${d.key} | ${median(L).toFixed(2)} (${Math.min(...L).toFixed(2)} to ${Math.max(...L).toFixed(2)}) | ${pct(median(B))} (${pct(Math.min(...B))} to ${pct(Math.max(...B))}) | ${median(I)} (${Math.min(...I)} to ${Math.max(...I)}) | ${rows.reduce((a, r) => a + r.border, 0)} |`);
  }
  const soft = [...(per["soft"] as Row[])].sort((a, b) => a.likeness - b.likeness || a.seed - b.seed);
  const med = soft[Math.floor((soft.length - 1) / 2)] as Row;
  const low = soft[Math.floor(0.1 * soft.length)] as Row;
  lines.push("");
  lines.push(`Soft likeness by seed, lowest first: ${soft.map((r) => `${r.seed} (${r.likeness.toFixed(2)})`).join(", ")}.`);
  lines.push(`The round's two seeds for this outline: **seed ${med.seed}**, the lower median of the soft likeness (${med.likeness.toFixed(2)}), and **seed ${low.seed}**, the 10th percentile (${low.likeness.toFixed(2)}).`);
  lines.push("");
  json[c.key] = { mapType: c.mapType, outlineShare: share(inside), per, medianSeed: med.seed, lowSeed: low.seed };
}
lines.push("Command: `node out/844/measure/sweep-shapes.ts` from the design-844 worktree at 581a6de3.");
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/shape-sweep.md`, lines.join("\n") + "\n");
writeFileSync(`${OUT}/shape-sweep.json`, JSON.stringify(json, null, 1));
console.log(lines.join("\n"));
