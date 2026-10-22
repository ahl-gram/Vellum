// Issue #950 round, a working check while building the arms (not a delivered still): one window three ways, rasterised into the tree's own out/950/dev/ for the designer to look at.
// Run from the tree root: node out/950/mock/devcheck.ts <seed> <cx> <cy> <band> [tag]
import { mkdirSync, writeFileSync } from "node:fs";
import { findBrowser, rasterizeSvg } from "../../../src/cli/raster.ts";
import { bandWindow, worldOf } from "./common.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { worldRuns } from "./course.ts";
import { armARegion, armBRegion, renderRegion, todayRegion } from "./sheets.ts";

const [seed, cx, cy, band] = process.argv.slice(2, 6).map(Number) as [number, number, number, number];
const tag = process.argv[6] ?? "";
const DEV = new URL("../dev/", import.meta.url).pathname;
mkdirSync(DEV, { recursive: true });
const world = worldOf(seed);
const window = bandWindow(cx, cy, band);
const t0 = performance.now();
const today = todayRegion(world, window);
const t1 = performance.now();
const a = armARegion(world, window, today);
const t2 = performance.now();
const b = armBRegion(world, window);
const t3 = performance.now();
console.log(`today ${(t1 - t0).toFixed(0)} ms, A ${(t2 - t1).toFixed(0)} ms, B ${(t3 - t2).toFixed(0)} ms; rivers today ${today.rivers.length}, A ${a.region.rivers.length} (fell back ${a.routed.filter((r) => r.fellBack).length}), B ${b.rivers.length}`);
const browser = findBrowser();
for (const [name, region] of [
  ["today", today],
  ["A", a.region],
  ["B", b],
] as const) {
  const proj = createProjection(320, 240, 1000, marginFor(1000));
  const lines = worldRuns(world, window).map((r) => `<polyline points="${r.pts.map((p) => `${proj.px(p.x).toFixed(1)},${proj.py(p.y).toFixed(1)}`).join(" ")}" fill="none" stroke="#d01010" stroke-width="2" stroke-opacity="0.6" stroke-dasharray="8 5"/>`);
  const svg = renderRegion(world, region, window, undefined, 1000).replace(/<\/svg>\s*$/, `<g>${lines.join("")}</g></svg>`);
  const f = `${DEV}s${seed}-b${band}${tag}-${name}`;
  writeFileSync(`${f}.svg`, svg);
  if (browser) await rasterizeSvg(browser, `${f}.svg`, `${f}.png`, 1);
}
console.log(`wrote ${DEV}s${seed}-b${band}${tag}-*.png`);
