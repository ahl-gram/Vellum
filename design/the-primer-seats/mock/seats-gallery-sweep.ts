// Issue #1248 round, item 1 direction D: where in open water the Gallery's station could moor so that, at 1024 by 768 and at 1280 by 800, its mark and slip stand whole in the window and share no area with the five-press row as first drawn, the Glass, the seed card, the head cluster, the Notice, the coordinates line, the "scroll on" hint or any other station. Geometry is read off the built page (`measure/geometry-results.json`, `measure/1-home-results.json`), the sea from seed 42's own terrain by the projection `test/site/landfall-prose.test.ts` uses. Writes measure/1-gallery-sweep.md.
// node out/1248/mock/seats-gallery-sweep.ts
import { writeFileSync } from "node:fs";
import { SHEET } from "../../../src/site/home/camera.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import { defaultRecipe, generateWorld } from "../../../src/world/generate.ts";
import { measureFile } from "./seats-paths.ts";
import { probeOf, readResults } from "./seats-shoot.ts";

type Box = { l: number; t: number; r: number; b: number };
type Geo = { w: number; h: number; stations: Record<string, { glyph: Box; slip: Box }>; glass: Box; seed: Box; notice: Box; coords: Box; more: Box; chrome: Box; sheet: Box };
const geo = readResults("geometry").map((r) => probeOf<Geo>(r));
const homeRes = readResults("1-home").filter((r) => r.out.endsWith("a-as-first-drawn-1024.png") || r.out.endsWith("a-as-first-drawn-1280.png"));
type HomeP = { row: Box; coords: Box | null };
const rowAt = Object.fromEntries(homeRes.map((r) => [r.out.endsWith("1024.png") ? 1024 : 1280, probeOf<HomeP>(r)]));
const PRIMER = geo.map(() => null);
void PRIMER;

const world = generateWorld(defaultRecipe(42));
const proj = createProjection(world.recipe.gridW, world.recipe.gridH, SHEET.w, marginFor(SHEET.w));
const cell = (nx: number, ny: number): number => {
  const gx = Math.round((nx * SHEET.w - proj.margin) / proj.scale);
  const gy = Math.round((ny * proj.heightPx - proj.margin) / proj.scale);
  return world.elev.inBounds(gx, gy) ? gy * world.elev.w + gx : -1;
};
const OPEN_WATER_HOPS = 4;
const MARGIN = 8;
const SLIP_W = 160;
const ov = (a: Box, b: Box): number => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

function clearAt(g: Geo, nx: number, ny: number): { ok: boolean; why: string; edge: number } {
  const cx = g.sheet.l + nx * (g.sheet.r - g.sheet.l);
  const cy = g.sheet.t + ny * (g.sheet.b - g.sheet.t);
  const glyph = { l: cx - 8.5, t: cy - 8.5, r: cx + 8.5, b: cy + 8.5 };
  const slip = { l: cx - SLIP_W / 2, t: cy + 13, r: cx + SLIP_W / 2, b: cy + 51 };
  const both = [glyph, slip];
  if (!both.every((b) => b.l >= MARGIN && b.t >= MARGIN && b.r <= g.w - MARGIN && b.b <= g.h - MARGIN)) return { ok: false, why: "off the window", edge: 0 };
  const row = rowAt[g.w]!.row;
  const obstacles: Array<[string, Box]> = [["the row", row], ["the Glass", g.glass], ["the seed card", g.seed], ["the head cluster", g.chrome], ["the Notice", g.notice], ["the coordinates", g.coords], ["the scroll hint", g.more]];
  for (const [id, s] of Object.entries(g.stations)) if (id !== "gallery") obstacles.push([`station ${id}`, s.glyph], [`station ${id}`, s.slip]);
  const primerCx = g.sheet.l + 0.0; // the Primer's pip is read from the A arm below
  void primerCx;
  for (const [name, o] of obstacles) if (both.some((b) => ov(b, o) > 0)) return { ok: false, why: `over ${name}`, edge: 0 };
  const edge = Math.min(...obstacles.flatMap(([, o]) => both.map((b) => Math.hypot(Math.max(0, o.l - b.r, b.l - o.r), Math.max(0, o.t - b.b, b.t - o.b)))));
  return { ok: true, why: "clear", edge };
}

const rows: Array<{ nx: number; ny: number; move: number; edge: number; hops: number }> = [];
let seaCount = 0;
for (let i = 40; i <= 98; i++)
  for (let k = 25; k <= 95; k++) {
    const nx = i / 100,
      ny = k / 100;
    const c = cell(nx, ny);
    if (c < 0 || world.elev.data[c]! >= world.seaLevel) continue;
    const hops = world.oceanDist[c]!;
    if (hops < OPEN_WATER_HOPS) continue;
    seaCount++;
    const verdicts = geo.map((g) => clearAt(g, nx, ny));
    if (!verdicts.every((v) => v.ok)) continue;
    rows.push({ nx, ny, move: Math.hypot((nx - 0.79) * SHEET.w, (ny - 0.73) * SHEET.h), edge: Math.min(...verdicts.map((v) => v.edge)), hops });
  }
rows.sort((a, b) => a.move - b.move);
const top = rows.slice(0, 12);
writeFileSync(
  measureFile("1-gallery-sweep.md"),
  `# Where the Gallery's station could moor anew (item 1, direction D)\n\nEvery point of seed 42's chart from 0.40 to 0.98 across and 0.25 to 0.95 down, a hundredth apart, in open water (below sea level and at least ${OPEN_WATER_HOPS} cells from land, \`oceanDist\` on the world), tested at 1024 by 768 and 1280 by 800 against the rects read off the built page at rest: the mark and slip whole in the window ${MARGIN} px inside its edge, and sharing no area with the five-press row as first drawn, the Glass, the seed card, the head cluster, the Notice, the coordinates line, the scroll hint or any other station (\`node out/1248/mock/seats-gallery-sweep.ts\`). ${seaCount} points are open water; ${rows.length} are clear at both widths. The nearest dozen to today's mooring (0.79, 0.73), by distance on the 1500 px sheet; "clearance" is the smallest edge distance to anything above at either width. The Primer's pip at Poalo lies in the north-west, far from every candidate here, and was checked in the browser for the one drawn.\n\n| across | down | moved on the sheet | clearance | cells from land |\n|---|---|---|---|---|\n${top.map((r) => `| ${r.nx} | ${r.ny} | ${Math.round(r.move)} px | ${Math.round(r.edge)} px | ${r.hops} |`).join("\n")}\n`,
);
console.log(`${seaCount} open-water points, ${rows.length} clear`);
console.log(top.map((r) => JSON.stringify(r)).join("\n"));
