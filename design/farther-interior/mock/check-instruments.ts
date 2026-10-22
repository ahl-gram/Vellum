// Issue #950 round: the copied instruments read what the committed ones read, before either is turned on an arm. Against the committed sweep's own JSON (`node scripts/region-detail/sweep.ts --seeds=42,7 --bands=1,2`, run from out/950/instrument/ so it wrote there): rivers ending on land, world land drawn as water, and the landmass census, window by window, detail on. Against the breakdown's per-feature table (out/395-subs/measure/features.json): the river and road counts on seed 42 at bands 3 and 5. Exits non-zero on any mismatch.
// Run from the tree root: node out/950/mock/check-instruments.ts
import { readFileSync, writeFileSync } from "node:fs";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import { isMajorRiver } from "../../../src/hydrology/rivers.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import { DELIVERY, SHA, worldOf } from "./common.ts";
import { endingTol, featureDrawn, massCoverage, parentLandDrowned, riversEndingOnLand } from "./instruments.ts";
import { todayRegion } from "./sheets.ts";

type SweepRow = { seed: number; band: number; window: UvWindow; detail: boolean; riversEndingOnLand: number; parentLandDrownedInRegion: number; worldFusedPairs: number; worldMassesLost: number; worldMassesInWindow: number };
const sweep = JSON.parse(readFileSync(new URL("../instrument/out/region-detail-sweep.json", import.meta.url), "utf8")) as SweepRow[];
const lines: string[] = [`instrument check at ${SHA}`];
let failed = 0;
const check = (name: string, mine: number, theirs: number): void => {
  const ok = mine === theirs;
  if (!ok) failed++;
  lines.push(`${ok ? "ok  " : "FAIL"} ${name}: copy ${mine}, committed ${theirs}`);
};
for (const row of sweep.filter((r) => r.detail)) {
  const world = worldOf(row.seed);
  const ids = labelLandmasses(world.elev, world.seaLevel).ids;
  const region = todayRegion(world, row.window);
  const tag = `seed ${row.seed} band ${row.band} window ${row.window.u0.toFixed(3)},${row.window.v0.toFixed(3)}`;
  check(`${tag} rivers ending on land`, riversEndingOnLand(region, region.rivers, endingTol(world, row.window)).length, row.riversEndingOnLand);
  check(`${tag} world land drawn as water`, parentLandDrowned(world, region, row.window), row.parentLandDrownedInRegion);
  const m = massCoverage(world, ids, region, row.window);
  check(`${tag} world landmasses fused/lost/in window`, m.fusedPairs * 10000 + m.lost * 100 + m.inWindow, row.worldFusedPairs * 10000 + row.worldMassesLost * 100 + row.worldMassesInWindow);
}

type FeatureRow = { seed: number; band: number; u0: number; v0: number; majorsCrossing: number; majorsDrawn: number; minorsCrossing: number; minorsDrawn: number; roadsCrossing: number; roadsDrawn: number };
const features = JSON.parse(readFileSync("/Users/ahl/CodeProjects/Vellum/out/395-subs/measure/features.json", "utf8")) as FeatureRow[];
const world = worldOf(42);
for (const f of features.filter((r) => r.seed === 42 && (r.band === 3 || r.band === 5))) {
  const size = 1 / 2 ** f.band;
  const window = { u0: f.u0, v0: f.v0, u1: f.u0 + size, v1: f.v0 + size };
  const region = todayRegion(world, window);
  const rivers = region.rivers.map((r) => r.points);
  const count = (flags: Array<boolean | undefined>): [number, number] => [flags.filter((x) => x !== undefined).length, flags.filter((x) => x === true).length];
  const [mc, md] = count(featureDrawn(world.rivers.filter(isMajorRiver).map((r) => r.points), rivers, world, window, f.band));
  const [nc, nd] = count(featureDrawn(world.rivers.filter((r) => !isMajorRiver(r)).map((r) => r.points), rivers, world, window, f.band));
  const [rc, rd] = count(featureDrawn(world.roads.map((r) => r.points), region.roads.map((r) => r.points), world, window, f.band));
  const tag = `seed 42 band ${f.band} window ${f.u0.toFixed(4)},${f.v0.toFixed(4)}`;
  check(`${tag} majors crossing/drawn`, mc * 100 + md, f.majorsCrossing * 100 + f.majorsDrawn);
  check(`${tag} minors crossing/drawn`, nc * 100 + nd, f.minorsCrossing * 100 + f.minorsDrawn);
  check(`${tag} roads crossing/drawn`, rc * 100 + rd, f.roadsCrossing * 100 + f.roadsDrawn);
}
lines.push(failed === 0 ? "every copy reads what the committed instrument reads" : `${failed} mismatch(es)`);
writeFileSync(`${DELIVERY}/measure/instrument-check.txt`, lines.join("\n") + "\n");
console.log(lines.slice(-6).join("\n"));
process.exitCode = failed === 0 ? 0 : 1;
