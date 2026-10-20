// Epic Issue #844 breakdown, after the plan skeptic's round 1: the count-through-lobes sizing measurement re-run with
// the land share as an axis (finding 4), the ceiling (finding 6), every map type (blocking finding 2) and the coast
// slider on a counted world (finding 10). A sizing measurement, NOT a drawn direction: Sub 0 draws the directions.
//
// THE MECHANISM, stated exactly (finding 10). elevationAt from src/terrain/heightfield.ts at 581a6de3 is re-stated
// with one change: the coast distance d is the minimum over N lobes of the distance from the cell to the lobe's
// centre in units of that lobe's radius. Everything else (the warped base noise, the ridge, the falloff numbers
// per map type, baseKeep, sinkDepth, the 5 percent edge sink) is as in SHAPES there.
//  - Placement is derived from the SEED ALONE inside the terrain, not from generateWorld's rng: createRng of
//    (seed XOR LOBE_SEED_SALT), so a chain ancestor that sees only ChainSpec can rebuild the same lobes.
//    Best-candidate scatter (24 candidates, farthest from the lobes placed so far) inside the box inset 0.14 from
//    every edge.
//  - Lobes are round on the 4:3 sheet: the u offset is multiplied by the grid aspect. Today's dome is NOT
//    aspect-corrected (it draws 4:3 ellipses); the lobes are, because "round islands" is the ask.
//  - Each lobe's radius r is set so the N discs together cover COVERAGE of the sheet: r = sqrt(COVERAGE * aspect /
//    (N * pi)). "fixed" coverage is 0.30 whatever the share (the first probe); "scaled" coverage is
//    min(1.25 * landShare, 0.45), 1.25 being 0.30 / 0.24, the ratio the first probe ran at.
//  - "varied" sizes multiply r by a draw in [0.45, 1.55] from the same seeded stream.
//  - The coast wobble is today's two fbm fields at today's salts and scale, added to the lobe-unit offsets at
//    amplitude coastWarp * 0.5, where coastWarp is the RECIPE's slider value (0.55 when absent). In the dome the
//    wobble is added in half-sheet units; a lobe is a few hundredths of the sheet across, so the same absolute
//    wobble would erase it, hence lobe units and the 0.5.
//  - Sea level: pickSeaLevel over the whole sheet at the land share, exactly as today.
// Run from the design-844 worktree (re-run for Issue #849 at 581a6de3): node out/844/measure/probe-lobes-2.ts [share|ceiling|types|slider|all]
import { mkdirSync, writeFileSync } from "node:fs";
import { createField } from "../../../src/core/grid.ts";
import { lerp, smoothstep } from "../../../src/core/math.ts";
import { createRng } from "../../../src/core/rng.ts";
import { fbm2, ridged2, warped2 } from "../../../src/noise/fbm.ts";
import { pickSeaLevel, landMask } from "../../../src/terrain/sealevel.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";

const OUT_ROOT = "/Users/ahl/CodeProjects/Vellum/out/844/measurements";
const GRID_W = 320;
const GRID_H = 240;
const N_CELLS = GRID_W * GRID_H;
const ASPECT = (GRID_W - 1) / (GRID_H - 1);
const ISLAND_FRACTION = 20 / 76800; // "20 cells at 320x240", stated as a fraction of the grid (skeptic nit 18)
const ISLAND_CELLS = Math.ceil(ISLAND_FRACTION * N_CELLS);
const SUBSTANTIAL_FRACTION = 0.004; // src/society/realms.ts at 581a6de3
const LOBE_SEED_SALT = 0x5bd1e995;
const COVERAGE_PER_SHARE = 1.25;
const COVERAGE_CAP = 0.45;
const WOBBLE_IN_LOBE_UNITS = 0.5;
const RIDGE_SEED_SALT = 0x7fe9b2c5;
const COAST_SEED_SALT_X = 0x3c6ef35f;
const COAST_SEED_SALT_Y = 0x1b56c4e9;
const COAST_WARP_SCALE = 4.0;
const COAST_WARP_OCTAVES = 5;
const BASE_FBM_OCTAVES = 6;

type MapType = "island" | "archipelago" | "continent" | "citystate";
type Shape = { featureScale: number; warpStrength: number; ridgedWeight: number; falloffStart: number; falloffEnd: number; baseKeep: number; sinkDepth: number };
// SHAPES and LAND_FRACTION copied from src/terrain/heightfield.ts and src/world/generate.ts at 581a6de3:
const SHAPES: Record<MapType, Shape> = {
  island: { featureScale: 3.0, warpStrength: 0.45, ridgedWeight: 0.4, falloffStart: 0.62, falloffEnd: 1.02, baseKeep: 0.4, sinkDepth: 0.3 },
  archipelago: { featureScale: 4.6, warpStrength: 0.7, ridgedWeight: 0.25, falloffStart: 0.55, falloffEnd: 1.05, baseKeep: 0.55, sinkDepth: 0.22 },
  continent: { featureScale: 2.2, warpStrength: 0.4, ridgedWeight: 0.45, falloffStart: 0.78, falloffEnd: 1.12, baseKeep: 0.55, sinkDepth: 0.25 },
  citystate: { featureScale: 2.6, warpStrength: 0.4, ridgedWeight: 0.3, falloffStart: 0.5, falloffEnd: 0.92, baseKeep: 0.36, sinkDepth: 0.34 },
};
const LAND_FRACTION: Record<MapType, number> = { island: 0.34, archipelago: 0.24, continent: 0.46, citystate: 0.3 };

type Lobe = { readonly cx: number; readonly cy: number; readonly r: number };
type Params = { seed: number; n: number; spread: "equal" | "varied"; coverage: number; mapType: MapType; share: number; coastWarp: number };

function placeLobes(p: Params): Lobe[] {
  const rng = createRng((p.seed ^ LOBE_SEED_SALT) >>> 0);
  const inset = 0.14;
  const baseR = Math.sqrt((p.coverage * ASPECT) / (p.n * Math.PI));
  const lobes: Lobe[] = [];
  for (let i = 0; i < p.n; i++) {
    let best = { cx: 0.5, cy: 0.5 };
    let bestD = -1;
    for (let k = 0; k < 24; k++) {
      const cx = rng.range(inset, 1 - inset);
      const cy = rng.range(inset, 1 - inset);
      let d = Infinity;
      for (const l of lobes) d = Math.min(d, Math.hypot((cx - l.cx) * ASPECT, cy - l.cy));
      if (lobes.length === 0) d = 1;
      if (d > bestD) {
        bestD = d;
        best = { cx, cy };
      }
    }
    const r = p.spread === "equal" ? baseR : baseR * rng.range(0.45, 1.55);
    lobes.push({ ...best, r });
  }
  return lobes;
}

function lobeDistance(u: number, v: number, p: Params, lobes: ReadonlyArray<Lobe>): number {
  const wx = fbm2(u * COAST_WARP_SCALE * ASPECT, v * COAST_WARP_SCALE, (p.seed ^ COAST_SEED_SALT_X) >>> 0, { octaves: COAST_WARP_OCTAVES });
  const wy = fbm2(u * COAST_WARP_SCALE * ASPECT + 41.7, v * COAST_WARP_SCALE + 17.3, (p.seed ^ COAST_SEED_SALT_Y) >>> 0, { octaves: COAST_WARP_OCTAVES });
  const ax = p.coastWarp * WOBBLE_IN_LOBE_UNITS * wx;
  const ay = p.coastWarp * WOBBLE_IN_LOBE_UNITS * wy;
  let d = Infinity;
  for (const l of lobes) {
    const dx = ((u - l.cx) * ASPECT) / l.r;
    const dy = (v - l.cy) / l.r;
    d = Math.min(d, Math.hypot(dx + ax, dy + ay));
  }
  return d;
}

function elevationWithLobes(u: number, v: number, p: Params, lobes: ReadonlyArray<Lobe>): number {
  const s = SHAPES[p.mapType];
  const nx = u * s.featureScale * ASPECT;
  const ny = v * s.featureScale;
  const base = warped2(nx, ny, p.seed, { octaves: BASE_FBM_OCTAVES, normOctaves: BASE_FBM_OCTAVES, warpStrength: s.warpStrength });
  const e01 = (base + 1) / 2;
  const ridge = ridged2(nx * 1.8 + 31.4, ny * 1.8 + 27.2, (p.seed ^ RIDGE_SEED_SALT) >>> 0, { octaves: 5 });
  let e = e01 + s.ridgedWeight * ridge * smoothstep(0.52, 0.78, e01);
  const d = lobeDistance(u, v, p, lobes);
  const falloff = 1 - smoothstep(s.falloffStart, s.falloffEnd, d);
  e = e * lerp(s.baseKeep, 1, falloff) - (1 - falloff) * s.sinkDepth;
  const edge = Math.min(u, 1 - u, v, 1 - v);
  e -= (1 - smoothstep(0, 0.05, edge)) * 0.8;
  return e;
}

type Result = {
  readonly islands: number;
  readonly anySize: number;
  readonly substantial: number;
  readonly landShare: number;
  readonly largestShare: number;
  readonly borderLandCells: number;
  readonly shoreShare: number;
  readonly ms: number;
};

function run(p: Params): Result {
  const t0 = performance.now();
  const lobes = placeLobes(p);
  const elev = createField(GRID_W, GRID_H, (x, y) => elevationWithLobes(x / (GRID_W - 1), y / (GRID_H - 1), p, lobes));
  const seaLevel = pickSeaLevel(elev, p.share);
  const { sizes } = labelLandmasses(elev, seaLevel);
  const mask = landMask(elev, seaLevel);
  let border = 0;
  for (let x = 0; x < GRID_W; x++) border += (mask[x] as number) + (mask[x + (GRID_H - 1) * GRID_W] as number);
  for (let y = 1; y < GRID_H - 1; y++) border += (mask[y * GRID_W] as number) + (mask[GRID_W - 1 + y * GRID_W] as number);
  let shore = 0;
  for (let y = 1; y < GRID_H - 1; y++) {
    for (let x = 1; x < GRID_W - 1; x++) {
      const i = x + y * GRID_W;
      if (mask[i] !== 1) continue;
      if (mask[i - 1] === 0 || mask[i + 1] === 0 || mask[i - GRID_W] === 0 || mask[i + GRID_W] === 0) shore++;
    }
  }
  const landCells = sizes.reduce((a, b) => a + b, 0);
  return {
    islands: sizes.filter((s) => s >= ISLAND_CELLS).length,
    anySize: sizes.length,
    substantial: sizes.filter((s) => s >= SUBSTANTIAL_FRACTION * N_CELLS).length,
    landShare: landCells / N_CELLS,
    largestShare: landCells === 0 ? 0 : Math.max(...sizes) / landCells,
    borderLandCells: border,
    shoreShare: landCells === 0 ? 0 : shore / landCells,
    ms: Math.round(performance.now() - t0),
  };
}

const coverageFor = (mode: "fixed" | "scaled", share: number): number =>
  mode === "fixed" ? 0.3 : Math.min(COVERAGE_PER_SHARE * share, COVERAGE_CAP);
const minMax = (xs: number[]): string => `${Math.min(...xs)} to ${Math.max(...xs)}`;
const mode = process.argv[2] ?? "all";
const lines: string[] = [];
const json: Record<string, unknown> = { sha: "581a6de3", islandCells: ISLAND_CELLS, islandFraction: ISLAND_FRACTION };
lines.push("# Count through lobes, round 2: the land share as an axis, the ceiling, every map type, the coast slider (at 581a6de3)");
lines.push("");
lines.push(`An island here is a landmass of at least ${ISLAND_CELLS} cells, which is ${ISLAND_FRACTION.toExponential(2)} of the grid (20 of 76,800 at 320x240), four-connected. The mechanism is stated exactly at the head of \`probe-lobes-2.ts\`. Lobe coverage "fixed" is 0.30 of the sheet whatever the share (the first probe); "scaled" is min(1.25 x share, 0.45).`);
lines.push("");

if (mode === "share" || mode === "all") {
  const SHARES = [0.132, 0.24, 0.336, 0.46, 0.7];
  const NS = [2, 3, 5, 20, 100];
  const SEEDS = [1, 2, 3, 4, 5];
  const rows: Array<Record<string, unknown>> = [];
  lines.push("## The land share axis (archipelago shape numbers, equal sizes, seeds 1 to 5): islands achieved, min to max");
  lines.push("");
  lines.push("| land share | lobe coverage | asked 2 | asked 3 | asked 5 | asked 20 | asked 100 | border land cells (sum) |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const share of SHARES) {
    for (const cov of ["fixed", "scaled"] as const) {
      const cells: string[] = [];
      let border = 0;
      for (const n of NS) {
        const rs = SEEDS.map((seed) => run({ seed, n, spread: "equal", coverage: coverageFor(cov, share), mapType: "archipelago", share, coastWarp: 0.55 }));
        rs.forEach((r, i) => rows.push({ share, coverage: cov, n, seed: SEEDS[i], ...r }));
        cells.push(minMax(rs.map((r) => r.islands)));
        border += rs.reduce((a, r) => a + r.borderLandCells, 0);
      }
      lines.push(`| ${share} | ${cov} (${coverageFor(cov, share).toFixed(3)}) | ${cells.join(" | ")} | ${border} |`);
    }
  }
  lines.push("");
  lines.push("0.132 is a founded \"drowned\" archipelago (0.24 x 0.55), 0.336 a founded \"vast\" one (0.24 x 1.4), 0.46 the continent's own share, 0.7 the land slider's top. The slider's floor is 0.1.");
  lines.push("");
  json["share"] = rows;
}

if (mode === "ceiling" || mode === "all") {
  const rows: Array<Record<string, unknown>> = [];
  lines.push("## The ceiling (archipelago, share 0.24, scaled coverage, equal sizes, seeds 1 to 3)");
  lines.push("");
  lines.push("| asked N | islands achieved (seeds 1, 2, 3) | achieved over asked (worst) | realm-bearing (min to max) | build ms (min to max) |");
  lines.push("|---|---|---|---|---|");
  for (const n of [100, 150, 200, 300, 400]) {
    const rs = [1, 2, 3].map((seed) => run({ seed, n, spread: "equal", coverage: coverageFor("scaled", 0.24), mapType: "archipelago", share: 0.24, coastWarp: 0.55 }));
    rs.forEach((r, i) => rows.push({ n, seed: i + 1, ...r }));
    lines.push(`| ${n} | ${rs.map((r) => r.islands).join(", ")} | ${(Math.min(...rs.map((r) => r.islands)) / n).toFixed(2)} | ${minMax(rs.map((r) => r.substantial))} | ${minMax(rs.map((r) => r.ms))} |`);
  }
  lines.push("");
  lines.push("A cold close-up descent to band 3 builds the band 1 and band 2 ancestors and the target, three region fields beside the world's own, so the chain pays the build cost above about four times over.");
  lines.push("");
  json["ceiling"] = rows;
}

if (mode === "types" || mode === "all") {
  const rows: Array<Record<string, unknown>> = [];
  lines.push("## Every map type at its own share and shape numbers (scaled coverage, equal sizes, seeds 1 to 3)");
  lines.push("");
  lines.push("| type | share | asked 5: islands (seeds 1, 2, 3) | asked 20 | asked 100 | largest island's share at 100 (min to max) | border land cells (sum) |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const mapType of ["archipelago", "island", "continent", "citystate"] as const) {
    const share = LAND_FRACTION[mapType];
    const per: string[] = [];
    let border = 0;
    let largest: number[] = [];
    for (const n of [5, 20, 100]) {
      const rs = [1, 2, 3].map((seed) => run({ seed, n, spread: "equal", coverage: coverageFor("scaled", share), mapType, share, coastWarp: 0.55 }));
      rs.forEach((r, i) => rows.push({ mapType, share, n, seed: i + 1, ...r }));
      per.push(rs.map((r) => r.islands).join(", "));
      border += rs.reduce((a, r) => a + r.borderLandCells, 0);
      if (n === 100) largest = rs.map((r) => r.largestShare);
    }
    lines.push(`| ${mapType} | ${share} | ${per.join(" | ")} | ${Math.min(...largest).toFixed(2)} to ${Math.max(...largest).toFixed(2)} | ${border} |`);
  }
  lines.push("");
  json["types"] = rows;
}

if (mode === "slider" || mode === "all") {
  const rows: Array<Record<string, unknown>> = [];
  lines.push("## The coast slider on a counted world (archipelago, share 0.24, scaled coverage, asked 20, equal, seeds 1 to 3)");
  lines.push("");
  lines.push("| coast slider | islands (seeds 1, 2, 3) | shore cells per land cell (min to max), the raggedness proxy | border land cells (sum) |");
  lines.push("|---|---|---|---|");
  for (const coastWarp of [0.1, 0.55, 0.95]) {
    const rs = [1, 2, 3].map((seed) => run({ seed, n: 20, spread: "equal", coverage: coverageFor("scaled", 0.24), mapType: "archipelago", share: 0.24, coastWarp }));
    rs.forEach((r, i) => rows.push({ coastWarp, seed: i + 1, ...r }));
    lines.push(`| ${coastWarp} | ${rs.map((r) => r.islands).join(", ")} | ${Math.min(...rs.map((r) => r.shoreShare)).toFixed(3)} to ${Math.max(...rs.map((r) => r.shoreShare)).toFixed(3)} | ${rs.reduce((a, r) => a + r.borderLandCells, 0)} |`);
  }
  lines.push("");
  lines.push("Today's dome, for comparison, moves the same proxy from about 9.3 to 12.7 between \"smooth\" and \"ragged\" (Issue #390's spike measured shoreline raggedness 9.34 to 12.66 on 20 chart numbers, a different proxy; the direction is what is compared).");
  lines.push("");
  json["slider"] = rows;
}

// Two variants asked by the round-2 numbers, written to a THIRD file so the round-2 tables stand: "sink" lowers
// baseKeep to 0.2 and deepens sinkDepth to 0.4 between the lobes (the ground between lobes is what merges them as the
// sea level drops); "wobble" scales the coast wobble's frequency to the lobe (COAST_WARP_SCALE x 0.25 / (2 r)) so the
// slider can ragged a lobe's own shore rather than shift the whole lobe.
const VARIANT: { sink: boolean; lobeWobble: boolean } = { sink: false, lobeWobble: false };
const shapeFor = (mapType: MapType): Shape => {
  const s = SHAPES[mapType];
  return VARIANT.sink ? { ...s, baseKeep: 0.2, sinkDepth: 0.4 } : s;
};
function lobeDistanceVariant(u: number, v: number, p: Params, lobes: ReadonlyArray<Lobe>): number {
  const r0 = lobes[0]?.r ?? 0.05;
  const scale = VARIANT.lobeWobble ? (COAST_WARP_SCALE * 0.25) / (2 * r0) : COAST_WARP_SCALE;
  const wx = fbm2(u * scale * ASPECT, v * scale, (p.seed ^ COAST_SEED_SALT_X) >>> 0, { octaves: COAST_WARP_OCTAVES });
  const wy = fbm2(u * scale * ASPECT + 41.7, v * scale + 17.3, (p.seed ^ COAST_SEED_SALT_Y) >>> 0, { octaves: COAST_WARP_OCTAVES });
  const ax = p.coastWarp * WOBBLE_IN_LOBE_UNITS * wx;
  const ay = p.coastWarp * WOBBLE_IN_LOBE_UNITS * wy;
  let d = Infinity;
  for (const l of lobes) d = Math.min(d, Math.hypot(((u - l.cx) * ASPECT) / l.r + ax, (v - l.cy) / l.r + ay));
  return d;
}
function runVariant(p: Params): Result {
  const t0 = performance.now();
  const lobes = placeLobes(p);
  const s = shapeFor(p.mapType);
  const elev = createField(GRID_W, GRID_H, (x, y) => {
    const u = x / (GRID_W - 1);
    const v = y / (GRID_H - 1);
    const nx = u * s.featureScale * ASPECT;
    const ny = v * s.featureScale;
    const base = warped2(nx, ny, p.seed, { octaves: BASE_FBM_OCTAVES, normOctaves: BASE_FBM_OCTAVES, warpStrength: s.warpStrength });
    const e01 = (base + 1) / 2;
    const ridge = ridged2(nx * 1.8 + 31.4, ny * 1.8 + 27.2, (p.seed ^ RIDGE_SEED_SALT) >>> 0, { octaves: 5 });
    let e = e01 + s.ridgedWeight * ridge * smoothstep(0.52, 0.78, e01);
    const falloff = 1 - smoothstep(s.falloffStart, s.falloffEnd, lobeDistanceVariant(u, v, p, lobes));
    e = e * lerp(s.baseKeep, 1, falloff) - (1 - falloff) * s.sinkDepth;
    const edge = Math.min(u, 1 - u, v, 1 - v);
    return e - (1 - smoothstep(0, 0.05, edge)) * 0.8;
  });
  const seaLevel = pickSeaLevel(elev, p.share);
  const { sizes } = labelLandmasses(elev, seaLevel);
  const mask = landMask(elev, seaLevel);
  let border = 0;
  for (let x = 0; x < GRID_W; x++) border += (mask[x] as number) + (mask[x + (GRID_H - 1) * GRID_W] as number);
  for (let y = 1; y < GRID_H - 1; y++) border += (mask[y * GRID_W] as number) + (mask[GRID_W - 1 + y * GRID_W] as number);
  let shore = 0;
  for (let y = 1; y < GRID_H - 1; y++) {
    for (let x = 1; x < GRID_W - 1; x++) {
      const i = x + y * GRID_W;
      if (mask[i] !== 1) continue;
      if (mask[i - 1] === 0 || mask[i + 1] === 0 || mask[i - GRID_W] === 0 || mask[i + GRID_W] === 0) shore++;
    }
  }
  const landCells = sizes.reduce((a, b) => a + b, 0);
  return {
    islands: sizes.filter((x) => x >= ISLAND_CELLS).length,
    anySize: sizes.length,
    substantial: sizes.filter((x) => x >= SUBSTANTIAL_FRACTION * N_CELLS).length,
    landShare: landCells / N_CELLS,
    largestShare: landCells === 0 ? 0 : Math.max(...sizes) / landCells,
    borderLandCells: border,
    shoreShare: landCells === 0 ? 0 : shore / landCells,
    ms: Math.round(performance.now() - t0),
  };
}

const variantLines: string[] = [];
const variantJson: Record<string, unknown> = { sha: "581a6de3" };
if (mode === "sink" || mode === "variants") {
  VARIANT.sink = true;
  VARIANT.lobeWobble = false;
  const rows: Array<Record<string, unknown>> = [];
  variantLines.push("## Variant: the ground between lobes sunk (baseKeep 0.2, sinkDepth 0.4), archipelago, fixed coverage 0.30, equal, seeds 1 to 3");
  variantLines.push("");
  variantLines.push("| land share | asked 2 | asked 5 | asked 20 | asked 100 | largest island's share at 100 | border land cells (sum) |");
  variantLines.push("|---|---|---|---|---|---|---|");
  for (const share of [0.24, 0.336, 0.46]) {
    const per: string[] = [];
    let border = 0;
    let largest: number[] = [];
    for (const n of [2, 5, 20, 100]) {
      const rs = [1, 2, 3].map((seed) => runVariant({ seed, n, spread: "equal", coverage: 0.3, mapType: "archipelago", share, coastWarp: 0.55 }));
      rs.forEach((r, i) => rows.push({ share, n, seed: i + 1, ...r }));
      per.push(rs.map((r) => r.islands).join(", "));
      border += rs.reduce((a, r) => a + r.borderLandCells, 0);
      if (n === 100) largest = rs.map((r) => r.largestShare);
    }
    variantLines.push(`| ${share} | ${per.join(" | ")} | ${Math.min(...largest).toFixed(2)} to ${Math.max(...largest).toFixed(2)} | ${border} |`);
  }
  variantLines.push("");
  variantJson["sink"] = rows;
}
if (mode === "wobble" || mode === "variants") {
  VARIANT.sink = false;
  VARIANT.lobeWobble = true;
  const rows: Array<Record<string, unknown>> = [];
  variantLines.push("## Variant: the coast wobble scaled to the lobe, archipelago, share 0.24, fixed coverage 0.30, asked 20, equal, seeds 1 to 3");
  variantLines.push("");
  variantLines.push("| coast slider | islands (seeds 1, 2, 3) | shore cells per land cell (min to max) | border land cells (sum) |");
  variantLines.push("|---|---|---|---|");
  for (const coastWarp of [0.1, 0.55, 0.95]) {
    const rs = [1, 2, 3].map((seed) => runVariant({ seed, n: 20, spread: "equal", coverage: 0.3, mapType: "archipelago", share: 0.24, coastWarp }));
    rs.forEach((r, i) => rows.push({ coastWarp, seed: i + 1, ...r }));
    variantLines.push(`| ${coastWarp} | ${rs.map((r) => r.islands).join(", ")} | ${Math.min(...rs.map((r) => r.shoreShare)).toFixed(3)} to ${Math.max(...rs.map((r) => r.shoreShare)).toFixed(3)} | ${rs.reduce((a, r) => a + r.borderLandCells, 0)} |`);
  }
  variantLines.push("");
  variantJson["wobble"] = rows;
}

mkdirSync(OUT_ROOT, { recursive: true });
if (variantLines.length > 0) {
  const head = ["# Count through lobes, round 3: two variants the round-2 numbers asked for (at 581a6de3)", "", "Same mechanism as `count-through-outline-2.md` except as each heading says. Sizing measurements, not drawn directions.", ""];
  const tail = [`Command: \`node out/844/measure/probe-lobes-2.ts ${mode}\` from the design-844 worktree (re-run for Issue #849 at 581a6de3).`];
  writeFileSync(`${OUT_ROOT}/count-through-outline-3.md`, [...head, ...variantLines, ...tail].join("\n") + "\n");
  writeFileSync(`${OUT_ROOT}/count-through-outline-3.json`, JSON.stringify(variantJson, null, 1));
  console.log([...head, ...variantLines, ...tail].join("\n"));
} else {
  lines.push(`Command: \`node out/844/measure/probe-lobes-2.ts ${mode}\` from the design-844 worktree (re-run for Issue #849 at 581a6de3).`);
  writeFileSync(`${OUT_ROOT}/count-through-outline-2.md`, lines.join("\n") + "\n");
  writeFileSync(`${OUT_ROOT}/count-through-outline-2.json`, JSON.stringify(json, null, 1));
  console.log(lines.join("\n"));
}
