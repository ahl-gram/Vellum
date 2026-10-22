// Issue #950 round: the river arms measured on the breakdown's sample, 20 town-centred close-ups a band (each seed's capital and three settlements spread through its roster, `targetWindows` in out/395-subs/measure-features.ts) at bands 1 to 6, on seeds 42, 7, 2, 15 and 23, beside today's close-up of the same window. Per arm: what it costs on top of today's draw, the world rivers it draws (majors and minors, the breakdown's per-feature count), whether a river drawn at one band is drawn at the next band's close-up of the same town (monotone), the rivers it leaves ending on dry land (coherent), how far its rivers lie from the world's line, and for the carve the coast guarantees (world land drawn as water, world landmasses fused or lost). Arm B is measured cut after the chain (as drawn) and inside it, and with each of its parts off at bands 4 to 6; and on the whole sample with no cut at all (the world's flow fed in and let out, the ground untouched: B0, the designer's own variant).
// Run from the tree root: node out/950/mock/measure-arms.ts   (minutes; writes measure/arms.* to the delivery)
import { writeFileSync } from "node:fs";
import { isMajorRiver } from "../../../src/hydrology/rivers.ts";
import { labelLandmasses } from "../../../src/world/landmass.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, cellsPerWorldCell, DELIVERY, SEEDS, SHA, uvOf, worldOf } from "./common.ts";
import { deviation, endingTol, featureDrawn, inWindowSamples, massCoverage, parentLandDrowned, riversEndingOnLand } from "./instruments.ts";
import { corridorRadius } from "./corridor.ts";
import { armARegion, armBRegion, todayRegion } from "./sheets.ts";

const BANDS = [1, 2, 3, 4, 5, 6];
type Row = Record<string, number | string>;

function targets(world: World): number[] {
  const n = world.settlements.length;
  return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])].filter((i) => i >= 0 && i < n);
}

const timed = <T>(fn: () => T): { ms: number; value: T } => {
  const t0 = performance.now();
  const value = fn();
  return { ms: performance.now() - t0, value };
};

function flagsOf(world: World, region: World, window: UvWindow, band: number): { majors: Array<boolean | undefined>; minors: Array<boolean | undefined> } {
  const drawn = region.rivers.map((r) => r.points);
  const all = featureDrawn(world.rivers.map((r) => r.points), drawn, world, window, band);
  return { majors: all.map((f, i) => (isMajorRiver(world.rivers[i]!) ? f : undefined)), minors: all.map((f, i) => (isMajorRiver(world.rivers[i]!) ? undefined : f)) };
}

const tally = (flags: Array<boolean | undefined>): { crossing: number; drawn: number } => ({ crossing: flags.filter((f) => f !== undefined).length, drawn: flags.filter((f) => f === true).length });

function devOf(world: World, region: World, window: UvWindow): { mean: number; max: number } {
  const courses = world.rivers.map((r) => inWindowSamples(r.points, world, window)).filter((s) => s.length > 0);
  const d = deviation(courses, region.rivers.map((r) => r.points), corridorRadius(world, window));
  const cw = cellsPerWorldCell(window, world);
  return { mean: d.mean / cw, max: d.max / cw };
}

function differingLand(a: World, b: World): number {
  let n = 0;
  for (let i = 0; i < a.elev.data.length; i++) if (Math.abs((a.elev.data[i] as number) - (b.elev.data[i] as number)) > 1e-12) n++;
  return n;
}

const rows: Row[] = [];
const flags = new Map<string, Array<boolean | undefined>>();
const variants: Row[] = [];
for (const seed of SEEDS) {
  const world = worldOf(seed);
  const ids = labelLandmasses(world.elev, world.seaLevel).ids;
  for (const band of BANDS) {
    for (const si of targets(world)) {
      const s = world.settlements[si]!;
      const { u, v } = uvOf(world, s.x, s.y);
      const window = bandWindow(u, v, band);
      const today = timed(() => todayRegion(world, window));
      const a = timed(() => armARegion(world, window, today.value));
      const b = timed(() => armBRegion(world, window, "after"));
      const bi = timed(() => armBRegion(world, window, "inside"));
      const b0 = timed(() => armBRegion(world, window, "after", { carve: false }));
      const arms: Array<[string, World]> = [
        ["today", today.value],
        ["A", a.value.region],
        ["B", b.value],
        ["Binside", bi.value],
        ["B0", b0.value],
      ];
      const row: Row = { seed, band, settlement: s.name, u0: window.u0, v0: window.v0, todayMs: Math.round(today.ms), aMs: Math.round(a.ms), bMs: Math.round(b.ms), bInsideMs: Math.round(bi.ms), b0Ms: Math.round(b0.ms) };
      for (const [name, region] of arms) {
        const f = flagsOf(world, region, window, band);
        flags.set(`${name}|${seed}|${si}|${band}|maj`, f.majors);
        flags.set(`${name}|${seed}|${si}|${band}|min`, f.minors);
        const mj = tally(f.majors);
        const mn = tally(f.minors);
        row[`${name}MajorsCrossing`] = mj.crossing;
        row[`${name}MajorsDrawn`] = mj.drawn;
        row[`${name}MinorsCrossing`] = mn.crossing;
        row[`${name}MinorsDrawn`] = mn.drawn;
        row[`${name}Rivers`] = region.rivers.length;
        row[`${name}EndingOnLand`] = riversEndingOnLand(region, region.rivers, endingTol(world, window)).length;
        const d = devOf(world, region, window);
        row[`${name}DevMeanWorldCells`] = +d.mean.toFixed(3);
        row[`${name}DevMaxWorldCells`] = +d.max.toFixed(3);
        if (name !== "A") {
          row[`${name}LandDrowned`] = parentLandDrowned(world, region, window);
          const m = massCoverage(world, ids, region, window);
          row[`${name}Fused`] = m.fusedPairs;
          row[`${name}Lost`] = m.lost;
          row[`${name}Masses`] = m.inWindow;
        }
      }
      row.aFellBack = a.value.routed.filter((r) => r.fellBack).length;
      row.bLandCellsLowered = differingLand(today.value, b.value);
      row.bInsideVsAfterCellsDiffering = differingLand(b.value, bi.value);
      rows.push(row);
      if (band >= 4 && si === 0) {
        for (const [label, parts] of [
          ["carve only (no inflow, no outlet)", { feed: false, outlet: false }],
          ["inflow and outlet, no carve", { carve: false }],
          ["carve and inflow, no outlet", { outlet: false }],
        ] as const) {
          const r = timed(() => armBRegion(world, window, "after", parts));
          const f = flagsOf(world, r.value, window, band);
          const mj = tally(f.majors);
          const mn = tally(f.minors);
          variants.push({ seed, band, settlement: s.name, variant: label, rivers: r.value.rivers.length, majorsDrawn: `${mj.drawn} of ${mj.crossing}`, minorsDrawn: `${mn.drawn} of ${mn.crossing}`, endingOnLand: riversEndingOnLand(r.value, r.value.rivers, endingTol(world, window)).length, ms: Math.round(r.ms) });
        }
      }
    }
    console.error(`seed ${seed} band ${band}`);
  }
}

// Monotone: a world river the close-up of a town draws at band N, whose course crosses the same town's close-up at band N+1, is drawn there too.
const mono: Row[] = [];
for (const arm of ["today", "A", "B", "Binside", "B0"]) {
  for (const band of BANDS.slice(0, -1)) {
    let carried = 0;
    let broken = 0;
    for (const seed of SEEDS) {
      for (const si of targets(worldOf(seed))) {
        for (const kind of ["maj", "min"]) {
          const here = flags.get(`${arm}|${seed}|${si}|${band}|${kind}`)!;
          const next = flags.get(`${arm}|${seed}|${si}|${band + 1}|${kind}`)!;
          here.forEach((f, i) => {
            if (f !== true || next[i] === undefined) return;
            if (next[i] === true) carried++;
            else broken++;
          });
        }
      }
    }
    mono.push({ arm, from: band, to: band + 1, drawnAndCrossingNext: carried + broken, lostAtNext: broken });
  }
}

const tsv = (rs: Row[]): string => (rs.length === 0 ? "" : [Object.keys(rs[0]!).join("\t"), ...rs.map((r) => Object.values(r).join("\t"))].join("\n") + "\n");
writeFileSync(`${DELIVERY}/measure/arms.json`, JSON.stringify({ sha: SHA, rows, mono, variants }, null, 1));
writeFileSync(`${DELIVERY}/measure/arms.tsv`, tsv(rows));
writeFileSync(`${DELIVERY}/measure/arms-monotone.tsv`, tsv(mono));
writeFileSync(`${DELIVERY}/measure/arms-variants.tsv`, tsv(variants));
console.log(`arms: ${rows.length} windows, ${variants.length} variant rows`);
