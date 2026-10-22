// Issue #950 round: the arms' tables, summed and medianed per band from measure/arms.json.
// Run from the tree root: node out/950/mock/summarize-arms.ts
import { readFileSync, writeFileSync } from "node:fs";
import { DELIVERY, median } from "./common.ts";

type Row = Record<string, number | string>;
const { sha, rows, mono, variants } = JSON.parse(readFileSync(`${DELIVERY}/measure/arms.json`, "utf8")) as { sha: string; rows: Row[]; mono: Row[]; variants: Row[] };
const n = (r: Row, k: string): number => Number(r[k]);
const sum = (rs: Row[], k: string): number => rs.reduce((a, r) => a + n(r, k), 0);
const med = (rs: Row[], k: string): number => median(rs.map((r) => n(r, k)));
const L: string[] = [`river arms at ${sha}: 20 town-centred close-ups a band (each seed's capital and three settlements spread through its roster), seeds 42, 7, 2, 15, 23. ms are medians over the band's 20 close-ups, worked out with a held chain cache down a stepped descent (each town's close-ups built band 1 to 6 in order), on this machine.`, ""];
const ARMS: Array<[string, string]> = [
  ["today", "today"],
  ["A", "arm A (re-route)"],
  ["B", "arm B (carve, after the chain)"],
  ["Binside", "arm B (carve, inside the chain)"],
  ["B0", "arm B without the cut (the world's flow fed in and let out, the ground untouched; mine)"],
];
for (const band of [1, 2, 3, 4, 5, 6]) {
  const rs = rows.filter((r) => n(r, "band") === band);
  L.push(`band ${band}: today ${med(rs, "todayMs")} ms; arm A adds ${med(rs, "aMs")} ms; arm B ${med(rs, "bMs")} ms (adds ${median(rs.map((r) => n(r, "bMs") - n(r, "todayMs")))} over today's), inside the chain ${med(rs, "bInsideMs")} ms, without the cut ${med(rs, "b0Ms")} ms`);
  for (const [k, label] of ARMS) {
    const parts = [
      `majors drawn ${sum(rs, `${k}MajorsDrawn`)} of ${sum(rs, `${k}MajorsCrossing`)}`,
      `minors ${sum(rs, `${k}MinorsDrawn`)} of ${sum(rs, `${k}MinorsCrossing`)}`,
      `rivers ending on dry land ${sum(rs, `${k}EndingOnLand`)} (of ${sum(rs, `${k}Rivers`)} drawn)`,
      `distance from the world's line, world cells: median of the close-ups' means ${median(rs.map((r) => n(r, `${k}DevMeanWorldCells`)).filter(Number.isFinite)).toFixed(2)}, largest ${Math.max(...rs.map((r) => n(r, `${k}DevMaxWorldCells`)).filter(Number.isFinite)).toFixed(2)}`,
    ];
    if (k !== "A") parts.push(`world land drawn as water ${sum(rs, `${k}LandDrowned`)} cells; world landmasses fused ${sum(rs, `${k}Fused`)}, lost ${sum(rs, `${k}Lost`)} of ${sum(rs, `${k}Masses`)}`);
    L.push(`    ${label}: ${parts.join("; ")}`);
  }
  L.push(`    arm A fell back to looser ground on ${sum(rs, "aFellBack")} runs; arm B lowered ${med(rs, "bLandCellsLowered")} cells a close-up (median); inside the chain against after it, ${med(rs, "bInsideVsAfterCellsDiffering")} cells differ (median), ${Math.max(...rs.map((r) => n(r, "bInsideVsAfterCellsDiffering")))} at most`);
}
L.push("", "Read the arms' ms with care: each arm ran with its own held chain cache, and arm B without the cut ran second on the cache arm B (cut after the chain) had just filled for the same window, so its ms leave out the chain's build and are not comparable with today's. measure/cost-warm.txt compares every arm with the chain held: arm B without the cut adds 3 to 11 ms to today's close-up.");
L.push("", "monotone: a world river a town's close-up draws at band N, whose course crosses the same town's close-up at band N+1, and is NOT drawn there");
for (const [k, label] of ARMS) L.push(`    ${label}: ${mono.filter((m) => m.arm === k).map((m) => `${m.from} to ${m.to}: ${m.lostAtNext} of ${m.drawnAndCrossingNext}`).join("; ")}`);
L.push("", "arm B with a part off, each seed's capital at bands 4 to 6 (rivers are the close-up's own extraction; no world river is laid in)");
for (const v of [...new Set(variants.map((r) => String(r.variant)))]) {
  const rs = variants.filter((r) => r.variant === v);
  L.push(`    ${v}: ${rs.map((r) => `seed ${r.seed} band ${r.band} majors ${r.majorsDrawn}, minors ${r.minorsDrawn}, ending on land ${r.endingOnLand}`).join("; ")}`);
}
writeFileSync(`${DELIVERY}/measure/arms-summary.txt`, L.join("\n") + "\n");
console.log(L.join("\n"));
