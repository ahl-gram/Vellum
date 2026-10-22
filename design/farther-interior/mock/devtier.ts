// Issue #950 round, a working check (not delivered): the finer tier on arm A's sheet, one window.
// Run from the tree root: node out/950/mock/devtier.ts <seed> <cx> <cy> <band> [tag]
import { writeFileSync } from "node:fs";
import { findBrowser, rasterizeSvg } from "../../../src/cli/raster.ts";
import { bandWindow, worldOf } from "./common.ts";
import { armARegion, renderRegion, todayRegion } from "./sheets.ts";
import { finerTier, withTierGlyphs } from "./farmsteads.ts";

const [seed, cx, cy, band] = process.argv.slice(2, 6).map(Number) as [number, number, number, number];
const tag = process.argv[6] ?? "";
const DEV = new URL("../dev/", import.meta.url).pathname;
const world = worldOf(seed);
const window = bandWindow(cx, cy, band);
const a = armARegion(world, window, todayRegion(world, window)).region;
const marks = finerTier(world, window, band, a);
const region = { ...a, settlements: [...a.settlements, ...marks.map((m) => m.settlement)] };
const { svg, swapped } = withTierGlyphs(renderRegion(world, region, window, undefined, 1000), marks, 1000);
console.log(`${marks.length} marks (${marks.filter((m) => m.kind === "mill").length} mills), ${swapped} glyphs swapped: ${marks.map((m) => m.name).join(", ")}`);
const f = `${DEV}tier-s${seed}-b${band}${tag}`;
writeFileSync(`${f}.svg`, svg);
const browser = findBrowser();
if (browser) await rasterizeSvg(browser, `${f}.svg`, `${f}.png`, 1);
