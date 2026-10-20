// Epic Issue #844 breakdown: how many islands does today's generator give, per map type, at several size cutoffs?
// Terrain only (heightfield, sea level, four-connected landmass labelling), no society, so a world costs ~0.2 s.
// Run from the design-844 worktree (re-run for Issue #849 at 581a6de3): node out/844/measure/sweep-landmasses.ts [from] [to]
// Reads handbook/specs/engine-invariants.md's traps: the seed comes FIRST in defaultRecipe, and identical counts across seeds would mean the instrument is broken.
import { mkdirSync, writeFileSync } from "node:fs";
import { defaultRecipe } from "../../../src/world/generate.ts";
import { buildHeightfield, type MapType } from "../../../src/terrain/heightfield.ts";
import { pickSeaLevel } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const [fromArg, toArg] = process.argv.slice(2);
const FROM = Number(fromArg ?? 1);
const TO = Number(toArg ?? 60);
const CUTOFFS = [1, 5, 10, 20, 50, 100] as const;
const SUBSTANTIAL_FRACTION = 0.004; // copied from src/society/realms.ts at 581a6de3: a landmass bears a realm only at or above this share of the grid
const TYPES: ReadonlyArray<MapType> = ["archipelago", "island", "continent", "citystate"];

type Row = {
  readonly type: MapType;
  readonly seed: number;
  readonly landFraction: number;
  readonly landCells: number;
  readonly counts: Record<string, number>;
  readonly substantial: number;
  readonly largestShare: number;
};

function measure(type: MapType, seed: number): Row {
  const r = defaultRecipe(seed, { mapType: type });
  const elev = buildHeightfield({ seed: r.seed, gridW: r.gridW, gridH: r.gridH, mapType: r.mapType });
  const seaLevel = pickSeaLevel(elev, r.landFraction);
  const { sizes } = labelLandmasses(elev, seaLevel);
  const n = r.gridW * r.gridH;
  const landCells = sizes.reduce((a, b) => a + b, 0);
  const counts: Record<string, number> = {};
  for (const c of CUTOFFS) counts[String(c)] = sizes.filter((s) => s >= c).length;
  return {
    type,
    seed,
    landFraction: r.landFraction,
    landCells,
    counts,
    substantial: sizes.filter((s) => s >= SUBSTANTIAL_FRACTION * n).length,
    largestShare: landCells === 0 ? 0 : Math.max(...sizes) / landCells,
  };
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[m] as number) : ((s[m - 1] as number) + (s[m] as number)) / 2;
};
const range = (xs: number[]): string => `${Math.min(...xs)} to ${Math.max(...xs)}`;

const rows: Row[] = [];
for (const type of TYPES) for (let seed = FROM; seed <= TO; seed++) rows.push(measure(type, seed));

// The tell from engine-invariants.md: identical counts across seeds means a broken instrument.
for (const type of TYPES) {
  const distinct = new Set(rows.filter((r) => r.type === type).map((r) => r.counts["20"]));
  if (distinct.size < 2) throw new Error(`every ${type} seed gave the same 20+ count: the measurement is broken`);
}

const lines: string[] = [];
lines.push(`# Landmass census, seeds ${FROM} to ${TO}, at 581a6de3`);
lines.push("");
lines.push("Terrain only: heightfield at 320x240, sea level by the type's default land share, four-connected labelling (`labelLandmasses`). A world sheet's count, not a region's.");
lines.push("");
lines.push("| type | land share | landmasses at or above N cells: median (range) for N = " + CUTOFFS.join(", ") + " | realm-bearing size (>= 0.004 of the grid, 307.2 cells): median (range) | largest landmass's share of the land: median (range) |");
lines.push("|---|---|---|---|---|");
for (const type of TYPES) {
  const rs = rows.filter((r) => r.type === type);
  const per = CUTOFFS.map((c) => {
    const xs = rs.map((r) => r.counts[String(c)] as number);
    return `${median(xs)} (${range(xs)})`;
  }).join("; ");
  const sub = rs.map((r) => r.substantial);
  const share = rs.map((r) => r.largestShare);
  lines.push(
    `| ${type} | ${rs[0]?.landFraction} | ${per} | ${median(sub)} (${range(sub)}) | ${median(share).toFixed(2)} (${Math.min(...share).toFixed(2)} to ${Math.max(...share).toFixed(2)}) |`,
  );
}
lines.push("");
lines.push("## How often an archipelago lands on exactly N islands of 20+ cells (the hit rate a re-roll-until-it-fits scheme would pay)");
lines.push("");
const arch = rows.filter((r) => r.type === "archipelago").map((r) => r.counts["20"] as number);
const hist = new Map<number, number>();
for (const c of arch) hist.set(c, (hist.get(c) ?? 0) + 1);
lines.push("| islands (20+ cells) | seeds of " + arch.length + " | share | expected tries to hit it by re-rolling |");
lines.push("|---|---|---|---|");
for (const [c, k] of [...hist].sort((a, b) => a[0] - b[0])) {
  lines.push(`| ${c} | ${k} | ${(k / arch.length).toFixed(3)} | ${(arch.length / k).toFixed(1)} |`);
}
lines.push("");
lines.push("Counts above the table's largest were seen on no seed, so a re-roll scheme never reaches them: the expected tries are unbounded there.");
lines.push("");
lines.push(`Command: \`node out/844/measure/sweep-landmasses.ts ${FROM} ${TO}\` from the design-844 worktree (re-run for Issue #849 at 581a6de3).`);

mkdirSync(OUT_ROOT, { recursive: true });
writeFileSync(`${OUT_ROOT}/landmass-sweep.json`, JSON.stringify({ sha: "581a6de3", from: FROM, to: TO, cutoffs: CUTOFFS, rows }, null, 1));
writeFileSync(`${OUT_ROOT}/landmass-sweep.md`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
