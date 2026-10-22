// Issue #950 round: the detailed coast at depth runs in straight, square-cornered edges along the world's own cells (seen first on the sea-edge place at bands 5 and 6). This counts it: on the sea-edge place, and for each of today's close-ups in the measurement sample, the longest stretch of coast running straight along a row or a column of the close-up's grid, on a world cell's edge and off one.
// Run from the tree root: node out/950/mock/straight-coast.ts
import { readFileSync, writeFileSync } from "node:fs";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, cellsPerWorldCell, DELIVERY, median, SEEDS, SHA, uvOf, worldOf } from "./common.ts";
import { todayRegion } from "./sheets.ts";

function targets(world: World): number[] {
  const n = world.settlements.length;
  return [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])].filter((i) => i >= 0 && i < n);
}

/** The longest straight stretch of coast, split by whether it lies on a world cell's edge (within one region cell of a line halfway between two world cells' centres, where the chain's nearest-cell gate puts a world cell's footprint) or off it. */
function longestStraight(region: World, world: World): { onGrid: number; offGrid: number } {
  const { w, h } = region.elev;
  const win = region.region!.window;
  const land = (x: number, y: number): boolean => (region.elev.data[x + y * w] as number) > region.seaLevel;
  const per = cellsPerWorldCell(win, world);
  // A boundary between grid rows y and y+1 sits at region y + 0.5; in world cells that is v * (Wh - 1). It is on a world cell's edge when that lands within one region cell of a half-integer.
  const onEdge = (pos: number, lo: number, span: number, worldN: number): boolean => {
    const wc = (lo + (pos / (span - 1)) * (win.u1 - win.u0)) * (worldN - 1);
    const d = Math.abs(wc - Math.floor(wc) - 0.5);
    return d * per <= 1;
  };
  let onGrid = 0;
  let offGrid = 0;
  const scan = (n: number, m: number, at: (i: number, j: number) => [boolean, boolean], edge: (j: number) => boolean): void => {
    for (let j = 0; j < m - 1; j++) {
      let run = 0;
      let side = 0;
      const onLine = edge(j);
      for (let i = 0; i < n; i++) {
        const [a, b] = at(i, j);
        const s2 = a === b ? 0 : a ? 1 : -1;
        run = s2 !== 0 && s2 === side ? run + 1 : s2 !== 0 ? 1 : 0;
        side = s2;
        if (onLine) onGrid = Math.max(onGrid, run);
        else offGrid = Math.max(offGrid, run);
      }
    }
  };
  scan(w, h, (x, y) => [land(x, y), land(x, y + 1)], (y) => onEdge(y + 0.5, win.v0, h, world.recipe.gridH));
  scan(h, w, (y, x) => [land(x, y), land(x + 1, y)], (x) => onEdge(x + 0.5, win.u0, w, world.recipe.gridW));
  return { onGrid, offGrid };
}

const rows: Array<{ seed: number; band: number; town: string; onGrid: number; offGrid: number }> = [];
const picks = (JSON.parse(readFileSync(`${DELIVERY}/measure/places.json`, "utf8")) as { picks: Array<{ seed: number; kind: string; x: number; y: number }> }).picks;
for (const pick of picks.filter((p) => p.kind === "sea edge")) {
  const world = worldOf(pick.seed);
  const { u, v } = uvOf(world, pick.x, pick.y);
  for (const band of [3, 4, 5, 6]) {
    const r = longestStraight(todayRegion(world, bandWindow(u, v, band)), world);
    console.log(`sea-edge place, band ${band}: longest straight stretch on a world cell's edge ${r.onGrid} region cells, off one ${r.offGrid}`);
  }
}
for (const seed of SEEDS) {
  const world = worldOf(seed);
  for (const band of [1, 2, 3, 4, 5, 6]) {
    for (const si of targets(world)) {
      const s = world.settlements[si]!;
      const { u, v } = uvOf(world, s.x, s.y);
      const w = bandWindow(u, v, band);
      rows.push({ seed, band, town: s.name, ...longestStraight(todayRegion(world, w), world) });
    }
  }
  console.error(`seed ${seed}`);
}
const L = [`straight coast at ${SHA}: today's close-ups, 20 town-centred windows a band, seeds 42, 7, 2, 15, 23. The longest stretch of coast running straight along one row or column of the close-up's grid, ON a world cell's edge (within one region cell of the line halfway between two world cells, where the chain's nearest-cell gate draws a world cell's footprint) and OFF one. A gently turning coast that happens to run near a row makes long stretches either way; the gate's footprint makes them only on the world cells' edges.`];
for (const band of [1, 2, 3, 4, 5, 6]) {
  const rs = rows.filter((r) => r.band === band);
  const cw = 2 ** band;
  const bar = Math.max(12, cw / 2);
  const on = rs.filter((r) => r.onGrid >= bar && r.onGrid > r.offGrid);
  L.push(`band ${band} (a world cell is about ${cw} region cells): longest stretch on a world cell's edge, median ${median(rs.map((r) => r.onGrid))}, largest ${Math.max(...rs.map((r) => r.onGrid))}; off one, median ${median(rs.map((r) => r.offGrid))}, largest ${Math.max(...rs.map((r) => r.offGrid))}; close-ups whose longest straight stretch lies on a world cell's edge and runs at least ${bar} region cells: ${on.length} of ${rs.length}${on.length > 0 ? ` (${on.map((r) => `${r.seed} ${r.town} ${r.onGrid}`).join(", ")})` : ""}`);
}
writeFileSync(`${DELIVERY}/measure/straight-coast.txt`, L.join("\n") + "\n");
writeFileSync(`${DELIVERY}/measure/straight-coast.json`, JSON.stringify(rows, null, 1));
console.log(L.join("\n"));
