import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { generateRegionWorld } from "../src/world/region.ts";
import { landSnapRadius } from "../src/world/snap-to-land.ts";
import { labelLandmasses } from "../src/world/landmass.ts";
import { hamletCandidates } from "../src/society/hamlets.ts";
import { LOD_BANDS, lodWindowFor, type LodBand } from "../src/world/lod.ts";
import { BIOMES } from "../src/climate/biomes.ts";
import type { UvWindow } from "../src/terrain/heightfield.ts";
import type { River } from "../src/hydrology/rivers.ts";
import type { World } from "../src/world/types.ts";

/** The measurement half of #399. Every claim in that sub's acceptance is a number this script prints, for both arms (bare heightfield and chained detail) so a difference can be attributed. Not in `npm test`: a chained band-3 region costs ~1.1s and the whole sweep runs minutes. */

const SEEDS = [42, 7, 2, 15, 23];
const INSET = 0.02; // region.ts's own open-window inset

type WindowResult = {
  readonly seed: number;
  readonly band: number;
  readonly window: UvWindow;
  readonly detail: boolean;
  readonly settlementsExpected: number;
  readonly settlementsPlaced: number;
  readonly settlementsDropped: number;
  readonly seatsLost: number;
  readonly hamletCandidates: number;
  readonly hamletsPlaced: number;
  readonly hamletsOnWater: number;
  readonly rivers: number;
  readonly riversEndingOnLand: number;
  readonly roads: number;
  readonly roadCellsOnWater: number;
  readonly settlementsOffRoadNetwork: number;
  readonly landCells: number;
  readonly biomeMismatchOnSharedLand: number;
  readonly sharedLandCells: number;
  readonly snowAlpineFraction: number;
  readonly parentSnowAlpineFraction: number;
  readonly realmlessOverParentLand: number;
  readonly realmlessOverParentSea: number;
  readonly landOverParentSea: number;
  readonly parentLandDrownedInRegion: number;
  readonly parentLandCells: number;
  readonly worldFusedPairs: number;
  readonly worldMassesLost: number;
  readonly worldMassesInWindow: number;
  readonly regionMaxElev: number;
};

export type RiverFailure = {
  readonly seed: number;
  readonly band: number;
  readonly window: UvWindow;
  readonly index: number;
  readonly points: number;
  readonly terminal: { readonly x: number; readonly y: number };
  readonly terminalElev: number;
  readonly parentElevAtTerminal: number;
  readonly endsInOcean: boolean;
  /** projectWorldMajors emits fractional cell coordinates, extractRivers integral ones: the one discriminator available without exporting it. */
  readonly projected: boolean;
  readonly cellsToSea: number;
};

function bandWindows(band: LodBand): UvWindow[] {
  const n = Math.round(1 / band.sizeUV);
  const out: UvWindow[] = [];
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      out.push(lodWindowFor((ix + 0.5) * band.sizeUV, (iy + 0.5) * band.sizeUV, band.sizeUV));
    }
  }
  return out;
}

function expectedProjections(world: World, window: UvWindow): number {
  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  let n = 0;
  for (const s of world.settlements) {
    const u = s.x / (world.recipe.gridW - 1);
    const v = s.y / (world.recipe.gridH - 1);
    if (
      u < window.u0 + du * INSET || u > window.u1 - du * INSET ||
      v < window.v0 + dv * INSET || v > window.v1 - dv * INSET
    ) {
      continue;
    }
    n++;
  }
  return n;
}

const CONFLUENCE_TOL = 2; // anchorRegionRivers' own SHADOW_RADIUS: how near a drawn river counts as meeting it

/** A river may legitimately stop at the window edge (cropped) or on another river (a confluence, which anchorRegionRivers itself judges within SHADOW_RADIUS). Anything else that stops on dry land in the interior is a river that failed to reach the sea. */
function riversEndingOnLand(
  region: World,
  rivers: ReadonlyArray<River>,
  tol: number,
): number[] {
  const { w, h } = region.elev;
  const cellsOf = (r: River): Set<number> =>
    new Set(r.points.map((p) => Math.round(p.x) + Math.round(p.y) * w));
  const all = rivers.map(cellsOf);
  const nearAnother = (self: number, x: number, y: number): boolean => {
    for (let dy = -CONFLUENCE_TOL; dy <= CONFLUENCE_TOL; dy++) {
      for (let dx = -CONFLUENCE_TOL; dx <= CONFLUENCE_TOL; dx++) {
        const idx = x + dx + (y + dy) * w;
        for (let j = 0; j < all.length; j++) {
          if (j !== self && (all[j] as Set<number>).has(idx)) return true;
        }
      }
    }
    return false;
  };
  const bad: number[] = [];
  rivers.forEach((river, i) => {
    const last = river.points[river.points.length - 1];
    if (last === undefined) return;
    const x = Math.round(last.x);
    const y = Math.round(last.y);
    if (x <= tol || y <= tol || x >= w - 1 - tol || y >= h - 1 - tol) return;
    if ((region.elev.data[x + y * w] as number) <= region.seaLevel) return;
    if (nearAnother(i, x, y)) return;
    bad.push(i);
  });
  return bad;
}

function chebyshevToSea(region: World, x: number, y: number, limit: number): number {
  const { w, h, data } = region.elev;
  for (let r = 1; r <= limit; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        if ((data[nx + ny * w] as number) <= region.seaLevel) return r;
      }
    }
  }
  return -1;
}

function measure(
  world: World,
  band: LodBand,
  window: UvWindow,
  detail: boolean,
  failures: RiverFailure[],
): WindowResult {
  const region = generateRegionWorld(world, {
    window,
    gridW: band.gridW,
    gridH: band.gridH,
    title: `sweep ${world.recipe.seed} b${band.index}`,
    detail,
  });
  const { gridW, gridH } = band;
  const { data } = region.elev;
  const sea = region.seaLevel;
  const placed = region.settlements.filter((s) => s.kind !== "hamlet");
  const hamlets = region.settlements.filter((s) => s.kind === "hamlet");
  const expected = expectedProjections(world, window);
  const worldSeats = world.realms.seats.filter((si) => {
    const s = world.settlements[si];
    if (s === undefined) return false;
    const du = window.u1 - window.u0;
    const dv = window.v1 - window.v0;
    const u = s.x / (world.recipe.gridW - 1);
    const v = s.y / (world.recipe.gridH - 1);
    return (
      u >= window.u0 + du * INSET && u <= window.u1 - du * INSET &&
      v >= window.v0 + dv * INSET && v <= window.v1 - dv * INSET
    );
  }).length;
  const seatsKept = region.realms.seats.filter((i) => i >= 0).length;

  let hamletsOnWater = 0;
  for (const s of hamlets) {
    if ((data[s.x + s.y * gridW] as number) <= sea) hamletsOnWater++;
  }
  let roadCellsOnWater = 0;
  for (const road of region.roads) {
    for (const p of road.points) {
      if ((data[p.x + p.y * gridW] as number) <= sea) roadCellsOnWater++;
    }
  }
  const onRoad = new Set<number>();
  for (const road of region.roads) {
    for (const p of road.points) onRoad.add(p.x + p.y * gridW);
  }
  const settlementsOffRoadNetwork = region.settlements.filter(
    (s) => !onRoad.has(s.x + s.y * gridW),
  ).length;

  const du = window.u1 - window.u0;
  const dv = window.v1 - window.v0;
  const Ww = world.recipe.gridW;
  // #443's headline claim: the world chart's own partition, never its resampled surface. Labelled on the whole chart, so one landmass entering the window twice stays one.
  const worldIds = labelLandmasses(world.elev, world.seaLevel).ids;
  const regionIds = labelLandmasses(region.elev, sea).ids;
  const coveredBy = new Map<number, Set<number>>();
  const worldMassesPresent = new Set<number>();
  const worldMassesAlive = new Set<number>();
  let landCells = 0;
  let sharedLandCells = 0;
  let biomeMismatch = 0;
  let snowAlpine = 0;
  let parentLand = 0;
  let parentSnowAlpine = 0;
  let parentLandDrowned = 0;
  let realmlessOverParentLand = 0;
  let realmlessOverParentSea = 0;
  let landOverParentSea = 0;
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const i = gx + gy * gridW;
      const u = window.u0 + (gx / (gridW - 1)) * du;
      const v = window.v0 + (gy / (gridH - 1)) * dv;
      const wi = Math.round(u * (Ww - 1)) + Math.round(v * (world.recipe.gridH - 1)) * Ww;
      const parentIsLand = (world.elev.data[wi] as number) > world.seaLevel;
      const wid = worldIds[wi] as number;
      const rid = regionIds[i] as number;
      if (wid >= 0) {
        worldMassesPresent.add(wid);
        if (rid >= 0) {
          worldMassesAlive.add(wid);
          let s = coveredBy.get(rid);
          if (s === undefined) {
            s = new Set();
            coveredBy.set(rid, s);
          }
          s.add(wid);
        }
      }
      if (parentIsLand) {
        parentLand++;
        const pb = world.biomes[wi] as number;
        if (pb === BIOMES.snow || pb === BIOMES.alpine) parentSnowAlpine++;
      }
      if ((data[i] as number) <= sea) {
        if (parentIsLand) parentLandDrowned++;
        continue;
      }
      landCells++;
      const b = region.biomes[i] as number;
      if (b === BIOMES.snow || b === BIOMES.alpine) snowAlpine++;
      const realmless = (region.realms.labels[i] as number) < 0;
      if (parentIsLand) {
        sharedLandCells++;
        if (realmless) realmlessOverParentLand++;
        if (b !== (world.biomes[wi] as number)) biomeMismatch++;
      } else {
        landOverParentSea++;
        if (realmless) realmlessOverParentSea++;
      }
    }
  }

  const tol = landSnapRadius(gridW, window, Ww) + 1;
  const badRivers = riversEndingOnLand(region, region.rivers, tol);
  for (const i of badRivers) {
    const river = region.rivers[i] as River;
    const last = river.points[river.points.length - 1] as River["points"][number];
    const x = Math.round(last.x);
    const y = Math.round(last.y);
    const u = window.u0 + (x / (gridW - 1)) * du;
    const v = window.v0 + (y / (gridH - 1)) * dv;
    const wi = Math.round(u * (Ww - 1)) + Math.round(v * (world.recipe.gridH - 1)) * Ww;
    failures.push({
      seed: world.recipe.seed,
      band: band.index,
      window,
      index: i,
      points: river.points.length,
      terminal: { x, y },
      terminalElev: data[x + y * gridW] as number,
      parentElevAtTerminal: (world.elev.data[wi] as number) - world.seaLevel,
      endsInOcean: river.endsInOcean,
      projected: river.points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y)),
      cellsToSea: chebyshevToSea(region, x, y, 32),
    });
  }
  return {
    seed: world.recipe.seed,
    band: band.index,
    window,
    detail,
    settlementsExpected: expected,
    settlementsPlaced: placed.length,
    settlementsDropped: expected - placed.length,
    seatsLost: worldSeats - seatsKept,
    hamletCandidates: hamletCandidates(world, window).length,
    hamletsPlaced: hamlets.length,
    hamletsOnWater,
    rivers: region.rivers.length,
    riversEndingOnLand: badRivers.length,
    roads: region.roads.length,
    roadCellsOnWater,
    settlementsOffRoadNetwork,
    landCells,
    biomeMismatchOnSharedLand: biomeMismatch,
    sharedLandCells,
    snowAlpineFraction: landCells === 0 ? 0 : snowAlpine / landCells,
    parentSnowAlpineFraction: parentLand === 0 ? 0 : parentSnowAlpine / parentLand,
    realmlessOverParentLand,
    realmlessOverParentSea,
    landOverParentSea,
    parentLandDrownedInRegion: parentLandDrowned,
    parentLandCells: parentLand,
    worldFusedPairs: [...coveredBy.values()].reduce((a, s) => a + Math.max(0, s.size - 1), 0),
    worldMassesLost: worldMassesPresent.size - worldMassesAlive.size,
    worldMassesInWindow: worldMassesPresent.size,
    regionMaxElev: region.elev.data.reduce<number>((a, v) => Math.max(a, v as number), -Infinity),
  };
}

const sum = (rows: ReadonlyArray<WindowResult>, pick: (r: WindowResult) => number): number =>
  rows.reduce((a, r) => a + pick(r), 0);

function report(rows: ReadonlyArray<WindowResult>): string {
  const lines: string[] = [];
  const arms = [false, true];
  lines.push("hamlets are placed only on band-3-sized windows, so bands 1 and 2 print candidates against 0 placed by design");
  lines.push("band  detail  windows  settl exp/placed/dropped  seatsLost  hamlets cand/placed/onWater  rivers/endingOnLand  roads/cellsOnWater  land  biomeMismatch/sharedLand  snowAlpine region vs parent  realmless over parentLand/parentSea  landOverParentSea  parentLandDrowned/parentLand  worldFused/lost/masses  maxElev");
  for (const band of [1, 2, 3]) {
    for (const detail of arms) {
      const rs = rows.filter((r) => r.band === band && r.detail === detail);
      if (rs.length === 0) continue;
      const land = sum(rs, (r) => r.landCells);
      const shared = sum(rs, (r) => r.sharedLandCells);
      const parentLand = sum(rs, (r) => r.parentLandCells);
      // Both halves weighted by their own land, or the parent's reads 1.21% against a true 3.13%
      // at band 3, where 107 of 320 windows hold no parent land at all and average in as zero.
      const snow = rs.reduce((a, r) => a + r.snowAlpineFraction * r.landCells, 0);
      const psnow = rs.reduce((a, r) => a + r.parentSnowAlpineFraction * r.parentLandCells, 0);
      lines.push(
        [
          String(band).padStart(4),
          (detail ? "on " : "off").padStart(7),
          String(rs.length).padStart(8),
          `${sum(rs, (r) => r.settlementsExpected)}/${sum(rs, (r) => r.settlementsPlaced)}/${sum(rs, (r) => r.settlementsDropped)}`.padStart(21),
          String(sum(rs, (r) => r.seatsLost)).padStart(10),
          `${sum(rs, (r) => r.hamletCandidates)}/${sum(rs, (r) => r.hamletsPlaced)}/${sum(rs, (r) => r.hamletsOnWater)}`.padStart(24),
          `${sum(rs, (r) => r.rivers)}/${sum(rs, (r) => r.riversEndingOnLand)}`.padStart(20),
          `${sum(rs, (r) => r.roads)}/${sum(rs, (r) => r.roadCellsOnWater)}`.padStart(19),
          String(land).padStart(7),
          `${sum(rs, (r) => r.biomeMismatchOnSharedLand)}/${shared}`.padStart(25),
          `${land === 0 ? "0" : ((snow / land) * 100).toFixed(2)}% vs ${parentLand === 0 ? "0" : ((psnow / parentLand) * 100).toFixed(2)}%`.padStart(26),
          `${sum(rs, (r) => r.realmlessOverParentLand)}/${sum(rs, (r) => r.realmlessOverParentSea)}`.padStart(36),
          `${sum(rs, (r) => r.landOverParentSea)} (${land === 0 ? "0" : ((sum(rs, (r) => r.landOverParentSea) / land) * 100).toFixed(2)}%)`.padStart(20),
          `${sum(rs, (r) => r.parentLandDrownedInRegion)}/${sum(rs, (r) => r.parentLandCells)}`.padStart(29),
          `${sum(rs, (r) => r.worldFusedPairs)}/${sum(rs, (r) => r.worldMassesLost)}/${sum(rs, (r) => r.worldMassesInWindow)}`.padStart(23),
          (sum(rs, (r) => r.regionMaxElev) / rs.length).toFixed(4).padStart(9),
        ].join(""),
      );
    }
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  if (process.argv.includes("--report-only")) {
    const raw = await readFile(resolve("out/region-detail-sweep.json"), "utf8");
    const table = report(JSON.parse(raw) as WindowResult[]);
    await writeFile(resolve("out/region-detail-sweep.txt"), `${table}\n`, "utf8");
    console.log(table);
    return;
  }
  const seedsArg = process.argv.find((a) => a.startsWith("--seeds="));
  const bandsArg = process.argv.find((a) => a.startsWith("--bands="));
  const seeds = seedsArg ? seedsArg.slice(8).split(",").map(Number) : SEEDS;
  const bandIdx = bandsArg ? bandsArg.slice(8).split(",").map(Number) : [1, 2, 3];

  const rows: WindowResult[] = [];
  const failures: RiverFailure[] = [];
  for (const seed of seeds) {
    const world = generateWorld(defaultRecipe(seed));
    for (const idx of bandIdx) {
      const band = LOD_BANDS[idx] as LodBand;
      const windows = bandWindows(band);
      for (const window of windows) {
        for (const detail of [false, true]) {
          rows.push(measure(world, band, window, detail, failures));
        }
      }
      console.error(`seed ${seed} band ${idx}: ${windows.length} windows done`);
    }
  }

  await mkdir(resolve("out"), { recursive: true });
  await writeFile(resolve("out/region-detail-sweep.json"), JSON.stringify(rows, null, 1), "utf8");
  await writeFile(
    resolve("out/region-detail-sweep-rivers.json"),
    JSON.stringify(failures, null, 1),
    "utf8",
  );
  const table = report(rows);
  await writeFile(resolve("out/region-detail-sweep.txt"), `${table}\n`, "utf8");
  console.log(table);
  console.log(`\n${failures.length} river terminal(s) on interior dry land; see out/region-detail-sweep-rivers.json`);
  console.log("out/region-detail-sweep.json, out/region-detail-sweep.txt");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
