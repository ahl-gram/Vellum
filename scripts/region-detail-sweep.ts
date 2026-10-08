import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultRecipe, generateWorld } from "../src/world/generate.ts";
import { LOD_BANDS, type LodBand } from "../src/world/lod.ts";
import { measure, type RiverFailure, type WindowResult } from "./region-detail-sweep-measure.ts";
import { bandWindows } from "./region-detail-sweep-windows.ts";

/** The measurement half of Issue #399. Every claim in that sub's acceptance is a number this script prints, for both arms (bare heightfield and chained detail) so a difference can be attributed. Not in `npm test`: a chained band-3 region costs ~1.1s and the whole sweep runs minutes. */

const SEEDS = [42, 7, 2, 15, 23];

const sum = (rows: ReadonlyArray<WindowResult>, pick: (r: WindowResult) => number): number =>
  rows.reduce((a, r) => a + pick(r), 0);

function report(rows: ReadonlyArray<WindowResult>): string {
  const lines: string[] = [];
  const arms = [false, true];
  lines.push(
    "hamlets are placed only on band-3-sized windows, so bands 1 and 2 print candidates against 0 placed by design",
  );
  lines.push(
    "band  detail  windows  settl exp/placed/dropped  seatsLost  hamlets cand/placed/onWater  rivers/endingOnLand  roads/cellsOnWater  land  biomeMismatch/sharedLand  snowAlpine region vs parent  realmless over parentLand/parentSea  landOverParentSea  parentLandDrowned/parentLand  worldFused/lost/masses  maxElev",
  );
  for (const band of [1, 2, 3]) {
    for (const detail of arms) {
      const rs = rows.filter((r) => r.band === band && r.detail === detail);
      if (rs.length === 0) continue;
      const land = sum(rs, (r) => r.landCells);
      const shared = sum(rs, (r) => r.sharedLandCells);
      const parentLand = sum(rs, (r) => r.parentLandCells);
      // Both halves weighted by their own land, or the parent's reads 1.21% against a true 3.13% at band 3, where 107 of 320 windows hold no parent land and average in as zero.
      const snow = rs.reduce((a, r) => a + r.snowAlpineFraction * r.landCells, 0);
      const psnow = rs.reduce((a, r) => a + r.parentSnowAlpineFraction * r.parentLandCells, 0);
      lines.push(
        [
          String(band).padStart(4),
          (detail ? "on " : "off").padStart(7),
          String(rs.length).padStart(8),
          `${sum(rs, (r) => r.settlementsExpected)}/${sum(rs, (r) => r.settlementsPlaced)}/${sum(rs, (r) => r.settlementsDropped)}`.padStart(
            21,
          ),
          String(sum(rs, (r) => r.seatsLost)).padStart(10),
          `${sum(rs, (r) => r.hamletCandidates)}/${sum(rs, (r) => r.hamletsPlaced)}/${sum(rs, (r) => r.hamletsOnWater)}`.padStart(
            24,
          ),
          `${sum(rs, (r) => r.rivers)}/${sum(rs, (r) => r.riversEndingOnLand)}`.padStart(20),
          `${sum(rs, (r) => r.roads)}/${sum(rs, (r) => r.roadCellsOnWater)}`.padStart(19),
          String(land).padStart(7),
          `${sum(rs, (r) => r.biomeMismatchOnSharedLand)}/${shared}`.padStart(25),
          `${land === 0 ? "0" : ((snow / land) * 100).toFixed(2)}% vs ${parentLand === 0 ? "0" : ((psnow / parentLand) * 100).toFixed(2)}%`.padStart(
            26,
          ),
          `${sum(rs, (r) => r.realmlessOverParentLand)}/${sum(rs, (r) => r.realmlessOverParentSea)}`.padStart(36),
          `${sum(rs, (r) => r.landOverParentSea)} (${land === 0 ? "0" : ((sum(rs, (r) => r.landOverParentSea) / land) * 100).toFixed(2)}%)`.padStart(
            20,
          ),
          `${sum(rs, (r) => r.parentLandDrownedInRegion)}/${sum(rs, (r) => r.parentLandCells)}`.padStart(29),
          `${sum(rs, (r) => r.worldFusedPairs)}/${sum(rs, (r) => r.worldMassesLost)}/${sum(rs, (r) => r.worldMassesInWindow)}`.padStart(
            23,
          ),
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
          const measured = measure(world, band, window, detail);
          rows.push(measured.row);
          failures.push(...measured.failures);
        }
      }
      console.error(`seed ${seed} band ${idx}: ${windows.length} windows done`);
    }
  }

  await mkdir(resolve("out"), { recursive: true });
  await writeFile(resolve("out/region-detail-sweep.json"), JSON.stringify(rows, null, 1), "utf8");
  await writeFile(resolve("out/region-detail-sweep-rivers.json"), JSON.stringify(failures, null, 1), "utf8");
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
