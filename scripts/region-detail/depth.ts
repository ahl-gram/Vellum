import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isMajorRiver, type River } from "../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { createChainCache, type ChainCache } from "../../src/world/detail-chain.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { lodWindowFor, quantizeCenter } from "../../src/world/lod.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { landSnapRadius } from "../../src/world/snap-to-land.ts";
import type { World } from "../../src/world/types.ts";
import {
  inWindowCourse,
  leadsOut,
  matchedFraction,
  matchTolerance,
  MATCH_FRACTION,
  worldRiversDrawn,
  worldRoadsDrawn,
} from "./feature-match.ts";
import { laidRiverCount, riversEndingOnLand } from "./sweep-measure.ts";

/** The depth census of Issue #951: per settlement-centred close-up at bands 1 to 5, whether every world river crossing it is drawn and how the drawn ones read, plus the road rows Issue #952 reads as its own before and after. Not in `npm test`: a detailed close-up costs about a second and the run takes minutes. A failed row exits non-zero and writes nothing. */

const SEEDS = [42, 7, 2, 15, 23];
const BANDS = [1, 2, 3, 4, 5];
const GRID_W = 320;
const GRID_H = 240;

type RiverRow = {
  readonly seed: number;
  readonly band: number;
  readonly town: string;
  readonly majorsCrossing: number;
  readonly majorsDrawn: number;
  readonly minorsCrossing: number;
  readonly minorsDrawn: number;
  readonly lowestMatched: number | null;
  readonly endingOnLandStrict: number;
  readonly endingOnLandLoose: number;
  readonly largestStep: number;
  readonly longestStraight: number;
  readonly drawnTwice: number;
  readonly firstMs: number;
  readonly revisitMs: number;
};

type RoadRow = {
  readonly seed: number;
  readonly band: number;
  readonly town: string;
  readonly crossing: number;
  readonly drawn: number;
  readonly leadingOut: number;
  readonly leadingOutDrawn: number;
};

type LossRow = {
  readonly seed: number;
  readonly band: number;
  readonly town: string;
  readonly drawn: number;
  readonly lost: number;
};

function laidRivers(world: World, region: World, window: UvWindow): River[] {
  return region.rivers.slice(0, laidRiverCount(world, region, window));
}

function stepLength(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function largestStep(rivers: ReadonlyArray<River>): number {
  let best = 0;
  for (const r of rivers) {
    for (let i = 1; i < r.points.length; i++) best = Math.max(best, stepLength(r.points[i - 1]!, r.points[i]!));
  }
  return best;
}

/** The longest stretch of one river keeping one step direction, region cells. */
function longestStraight(rivers: ReadonlyArray<River>): number {
  let best = 0;
  for (const r of rivers) {
    let run = 0;
    let prev: { x: number; y: number } | null = null;
    for (let i = 1; i < r.points.length; i++) {
      const a = r.points[i - 1]!;
      const b = r.points[i]!;
      const d = { x: b.x - a.x, y: b.y - a.y };
      const len = stepLength(a, b);
      const same =
        prev !== null && Math.abs(prev.x * d.y - prev.y * d.x) < 1e-9 * (1 + len) && prev.x * d.x + prev.y * d.y > 0;
      run = same ? run + len : len;
      prev = d;
      best = Math.max(best, run);
    }
  }
  return best;
}

function drawnTwice(region: World, world: World, window: UvWindow): number {
  const laid = laidRivers(world, region, window);
  const tolerance = matchTolerance(window, GRID_W, world.recipe.gridW);
  const polylines = laid.map((r) => r.points);
  return region.rivers.filter(
    (r) => !laid.includes(r) && matchedFraction(r.points, polylines, tolerance) >= MATCH_FRACTION,
  ).length;
}

function riverMatches(
  world: World,
  region: World,
  window: UvWindow,
  drawn: ReadonlyArray<boolean | undefined>,
): number[] {
  const tolerance = matchTolerance(window, GRID_W, world.recipe.gridW);
  const polylines = region.rivers.map((r) => r.points);
  const out: number[] = [];
  drawn.forEach((d, i) => {
    if (d !== true) return;
    const course = inWindowCourse((world.rivers[i] as River).points, world, window, GRID_W, GRID_H);
    out.push(matchedFraction(course, polylines, tolerance));
  });
  return out;
}

function riverRow(
  world: World,
  region: World,
  window: UvWindow,
  ctx: { seed: number; band: number; town: string; firstMs: number; revisitMs: number },
): RiverRow {
  const drawn = worldRiversDrawn(world, region, window);
  const count = (major: boolean, onlyDrawn: boolean): number =>
    drawn.filter((d, i) => d !== undefined && isMajorRiver(world.rivers[i] as River) === major && (!onlyDrawn || d))
      .length;
  const matches = riverMatches(world, region, window, drawn);
  return {
    seed: ctx.seed,
    band: ctx.band,
    town: ctx.town,
    majorsCrossing: count(true, false),
    majorsDrawn: count(true, true),
    minorsCrossing: count(false, false),
    minorsDrawn: count(false, true),
    lowestMatched: matches.length === 0 ? null : Math.min(...matches),
    endingOnLandStrict: riversEndingOnLand(region, region.rivers, 0).length,
    endingOnLandLoose: riversEndingOnLand(region, region.rivers, landSnapRadius(GRID_W, window, world.recipe.gridW) + 1)
      .length,
    largestStep: largestStep(region.rivers),
    longestStraight: longestStraight(region.rivers),
    drawnTwice: drawnTwice(region, world, window),
    firstMs: ctx.firstMs,
    revisitMs: ctx.revisitMs,
  };
}

function roadRow(
  world: World,
  region: World,
  window: UvWindow,
  ctx: { seed: number; band: number; town: string },
): RoadRow {
  const drawn = worldRoadsDrawn(world, region, window);
  const crossing = drawn.flatMap((d, i) => (d === undefined ? [] : [i]));
  const out = crossing.filter((i) => leadsOut((world.roads[i] as World["roads"][number]).points, world, window));
  return {
    seed: ctx.seed,
    band: ctx.band,
    town: ctx.town,
    crossing: crossing.length,
    drawn: crossing.filter((i) => drawn[i] === true).length,
    leadingOut: out.length,
    leadingOutDrawn: out.filter((i) => drawn[i] === true).length,
  };
}

function timed<T>(fn: () => T): { value: T; ms: number } {
  const t0 = performance.now();
  const value = fn();
  return { value, ms: performance.now() - t0 };
}

function townIndices(world: World): number[] {
  const n = world.settlements.length;
  return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])];
}

type Census = { readonly rivers: RiverRow[]; readonly roads: RoadRow[]; readonly losses: LossRow[] };

function censusSeed(seed: number, bands: ReadonlyArray<number>, census: Census): void {
  const world = generateWorld(defaultRecipe(seed));
  const chainCache: ChainCache = createChainCache(64);
  for (const index of townIndices(world)) {
    const town = world.settlements[index]!;
    let before: ReadonlyArray<boolean | undefined> | null = null;
    for (const band of bands) {
      const size = 1 / 2 ** band;
      const q = quantizeCenter(town.x / (world.recipe.gridW - 1), town.y / (world.recipe.gridH - 1), size);
      const window = lodWindowFor(q.cx, q.cy, size);
      const spec = { window, gridW: GRID_W, gridH: GRID_H, title: "Depth", detail: true, chainCache };
      const first = timed(() => generateRegionWorld(world, spec));
      const again = timed(() => generateRegionWorld(world, spec));
      const ctx = { seed, band, town: town.name };
      census.rivers.push(riverRow(world, first.value, window, { ...ctx, firstMs: first.ms, revisitMs: again.ms }));
      census.roads.push(roadRow(world, first.value, window, ctx));
      const now = worldRiversDrawn(world, first.value, window);
      if (before !== null) census.losses.push(lossRow(before, now, ctx));
      before = now;
      console.error(`seed ${seed} ${town.name} band ${band} done`);
    }
  }
}

/** World rivers drawn on the band-N close-up whose course crosses its band-N+1 close-up (`band` here is N+1) and are not drawn there. */
function lossRow(
  shallower: ReadonlyArray<boolean | undefined>,
  deeper: ReadonlyArray<boolean | undefined>,
  ctx: { seed: number; band: number; town: string },
): LossRow {
  const kept = shallower.flatMap((d, i) => (d === true && deeper[i] !== undefined ? [i] : []));
  return { ...ctx, drawn: kept.length, lost: kept.filter((i) => deeper[i] === false).length };
}

const sum = <T>(rows: ReadonlyArray<T>, pick: (r: T) => number): number => rows.reduce((a, r) => a + pick(r), 0);

function median(values: ReadonlyArray<number>): number {
  const s = [...values].sort((a, b) => a - b);
  return s.length === 0 ? NaN : (s[Math.floor((s.length - 1) / 2)] as number);
}

function riverTable(rows: ReadonlyArray<RiverRow>, bands: ReadonlyArray<number>): string[] {
  const lines = [
    "band windows majors drawn/crossing minors drawn/crossing lowestMatched endsOnLand strict/loose largestStep straight median/largest twice firstMs(median) revisitMs(median)",
  ];
  for (const band of bands) {
    const rs = rows.filter((r) => r.band === band);
    const matched = rs.flatMap((r) => (r.lowestMatched === null ? [] : [r.lowestMatched]));
    lines.push(
      [
        band,
        rs.length,
        `${sum(rs, (r) => r.majorsDrawn)}/${sum(rs, (r) => r.majorsCrossing)}`,
        `${sum(rs, (r) => r.minorsDrawn)}/${sum(rs, (r) => r.minorsCrossing)}`,
        matched.length === 0 ? "-" : Math.min(...matched).toFixed(2),
        `${sum(rs, (r) => r.endingOnLandStrict)}/${sum(rs, (r) => r.endingOnLandLoose)}`,
        Math.max(0, ...rs.map((r) => r.largestStep)).toFixed(2),
        `${median(rs.map((r) => r.longestStraight).filter((v) => v > 0)).toFixed(1)}/${Math.max(0, ...rs.map((r) => r.longestStraight)).toFixed(1)}`,
        sum(rs, (r) => r.drawnTwice),
        median(rs.map((r) => r.firstMs)).toFixed(0),
        median(rs.map((r) => r.revisitMs)).toFixed(0),
      ].join("  "),
    );
  }
  return lines;
}

function roadTable(rows: ReadonlyArray<RoadRow>, bands: ReadonlyArray<number>): string[] {
  const lines = ["band windows roads drawn/crossing leadingOut drawn/leadingOut"];
  for (const band of bands) {
    const rs = rows.filter((r) => r.band === band);
    lines.push(
      [
        band,
        rs.length,
        `${sum(rs, (r) => r.drawn)}/${sum(rs, (r) => r.crossing)}`,
        `${sum(rs, (r) => r.leadingOutDrawn)}/${sum(rs, (r) => r.leadingOut)}`,
      ].join("  "),
    );
  }
  return lines;
}

function lossTable(rows: ReadonlyArray<LossRow>, bands: ReadonlyArray<number>): string[] {
  const lines = ["band pair  rivers drawn at N crossing N+1 / lost at N+1"];
  for (const band of bands.slice(1)) {
    const rs = rows.filter((r) => r.band === band);
    lines.push(`${band - 1} to ${band}  ${sum(rs, (r) => r.drawn)} / ${sum(rs, (r) => r.lost)}`);
  }
  return lines;
}

function listArg(name: string, fallback: ReadonlyArray<number>): number[] {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg === undefined
    ? [...fallback]
    : arg
        .slice(name.length + 3)
        .split(",")
        .map(Number);
}

async function main(): Promise<void> {
  const seeds = listArg("seeds", SEEDS);
  const bands = listArg("bands", BANDS);
  const census: Census = { rivers: [], roads: [], losses: [] };
  for (const seed of seeds) censusSeed(seed, bands, census);
  const text = [
    ...riverTable(census.rivers, bands),
    "",
    ...roadTable(census.roads, bands),
    "",
    ...lossTable(census.losses, bands),
  ].join("\n");
  await mkdir(resolve("out"), { recursive: true });
  await writeFile(resolve("out/region-detail-depth.json"), JSON.stringify(census, null, 1), "utf8");
  await writeFile(resolve("out/region-detail-depth.txt"), `${text}\n`, "utf8");
  console.log(text);
  console.log("\nout/region-detail-depth.json, out/region-detail-depth.txt");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
