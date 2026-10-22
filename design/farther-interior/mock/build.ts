// Issue #950 round: draws every plate of the round into the delivery's svg/ and writes facts.json, the measured facts every caption quotes. For each place the sweep chose (measure/places.json), at bands 3 to 6 on the window the Glass would commit centred on it:
//   today's close-up by the engine, plain and under each theme (the controls and the mismatch);
//   the band-3 sheet held at 16 and 24 times (its own drawing, viewed through a window as the hold magnifies it);
//   river arm A (re-route) and arm B (carve, cut after the chain) on the plain dress;
//   the finer tier (the breakdown's bold suggestion) on arm A at bands 5 and 6;
//   arm B cut inside the chain, and arm B without the cut (the designer's own variant), at bands 4 to 6;
//   today's and every arm's band-5 and band-6 sheet with the world's own rivers laid over in red dashes (a diagnostic, not a direction).
// Run from the tree root: node out/950/mock/build.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isMajorRiver } from "../../../src/hydrology/rivers.ts";
import { createProjection, marginFor } from "../../../src/render/transform.ts";
import type { UvWindow } from "../../../src/terrain/heightfield.ts";
import type { World } from "../../../src/world/types.ts";
import { bandWindow, DELIVERY, GRID_H, GRID_W, RENDER_WIDTH, SHA, THEMES, uvOf, winLabel, worldOf, type Theme } from "./common.ts";
import { featureDrawn } from "./instruments.ts";
import { worldRuns } from "./course.ts";
import { armARegion, armBRegion, renderRegion, todayRegion } from "./sheets.ts";
import { finerTier, withTierGlyphs } from "./farmsteads.ts";

export type Pick = { seed: number; kind: string; name: string; x: number; y: number; window: UvWindow; score: number; why: string; pickedBecause: string };
export type PlateFacts = {
  towns: number;
  hamlets: number;
  tier?: { farmsteads: number; mills: number };
  majors: string;
  minors: string;
  roads: string;
  borderChains: number;
  gatedSeaNearShore: number;
  scaleBarOverrunPx: number;
  biomes: number;
  largestBiomeShare: number;
  ms: number;
};
export type Plate = { id: string; place: string; arm: string; band: number; dress: string; file: string; window: UvWindow; facts?: PlateFacts; note?: string };

const SVG_DIR = `${DELIVERY}/svg`;
const proj = createProjection(GRID_W, GRID_H, RENDER_WIDTH, marginFor(RENDER_WIDTH));
export const SVG_H = Math.round(proj.heightPx);

export const slugOf = (p: Pick): string => `${p.kind.replace(/[^a-z]+/g, "-")}-${p.seed}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-+/g, "-").replace(/-$/, "");

function scaleBarOverrun(svg: string): number {
  const g = /<g id="layer-scalebar">([\s\S]*?)<\/g>/.exec(svg)?.[1] ?? "";
  const rects = [...g.matchAll(/<rect x="([^"]+)" y="[^"]+" width="([^"]+)"/g)].map((m) => ({ x: Number(m[1]), w: Number(m[2]) }));
  if (rects.length < 2) return NaN;
  const back = rects[0]!;
  const right = Math.max(...rects.slice(1).map((r) => r.x + r.w));
  return Math.max(0, right - (back.x + back.w));
}

function gatedNearShore(region: World): number {
  const { w, h } = region.elev;
  const gate = region.region?.seaGate;
  if (gate === undefined) return 0;
  const land = (i: number): boolean => (region.elev.data[i] as number) > region.seaLevel;
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w;
      if (land(i) || gate[i] !== 0) continue;
      let near = false;
      for (let dy = -3; dy <= 3 && !near; dy++) for (let dx = -3; dx <= 3 && !near; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && land(nx + ny * w)) near = true;
      }
      if (near) n++;
    }
  }
  return n;
}

function factsOf(world: World, region: World, window: UvWindow, band: number, svg: string, ms: number): PlateFacts {
  const drawnRivers = region.rivers.map((r) => r.points);
  const fr = featureDrawn(world.rivers.map((r) => r.points), drawnRivers, world, window, band);
  const frac = (flags: Array<boolean | undefined>): string => `${flags.filter((f) => f === true).length} of ${flags.filter((f) => f !== undefined).length}`;
  const rd = featureDrawn(world.roads.map((r) => r.points), region.roads.map((r) => r.points), world, window, band);
  const counts = new Map<number, number>();
  let land = 0;
  for (let i = 0; i < region.biomes.length; i++) {
    if ((region.elev.data[i] as number) <= region.seaLevel) continue;
    land++;
    counts.set(region.biomes[i] as number, (counts.get(region.biomes[i] as number) ?? 0) + 1);
  }
  return {
    towns: region.settlements.filter((s) => s.kind !== "hamlet").length,
    hamlets: region.settlements.filter((s) => s.kind === "hamlet").length,
    majors: frac(fr.map((f, i) => (isMajorRiver(world.rivers[i]!) ? f : undefined))),
    minors: frac(fr.map((f, i) => (isMajorRiver(world.rivers[i]!) ? undefined : f))),
    roads: frac(rd),
    borderChains: region.region?.realmBorders?.length ?? 0,
    gatedSeaNearShore: gatedNearShore(region),
    scaleBarOverrunPx: Math.round(scaleBarOverrun(svg)),
    biomes: counts.size,
    largestBiomeShare: land > 0 ? +(Math.max(...counts.values()) / land).toFixed(3) : 0,
    ms: Math.round(ms),
  };
}

/** The sheet as the hold shows it at magnification m over its own depth, centred on a point: its own drawing through a narrower viewBox, at the same size on the page. */
export function heldView(svg: string, window: UvWindow, cu: number, cv: number, m: number): string {
  const gx = ((cu - window.u0) / (window.u1 - window.u0)) * (GRID_W - 1);
  const gy = ((cv - window.v0) / (window.v1 - window.v0)) * (GRID_H - 1);
  const w = RENDER_WIDTH / m;
  const h = proj.heightPx / m;
  const x = Math.min(RENDER_WIDTH - w, Math.max(0, proj.px(gx) - w / 2));
  const y = Math.min(proj.heightPx - h, Math.max(0, proj.py(gy) - h / 2));
  return svg.replace(/viewBox="[^"]*"/, `viewBox="${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}"`);
}

function withWorldLine(svg: string, world: World, window: UvWindow): string {
  const lines = worldRuns(world, window).map((r) => `<polyline points="${r.pts.map((p) => `${proj.px(p.x).toFixed(1)},${proj.py(p.y).toFixed(1)}`).join(" ")}" fill="none" stroke="#c01818" stroke-width="3" stroke-opacity="0.75" stroke-dasharray="12 7"/>`);
  return svg.replace(/<\/svg>\s*$/, `<g id="check-world-rivers">${lines.join("")}</g></svg>`);
}

const timed = <T>(fn: () => T): { ms: number; value: T } => {
  const t0 = performance.now();
  const value = fn();
  return { ms: performance.now() - t0, value };
};

function main(): void {
  mkdirSync(SVG_DIR, { recursive: true });
  const { picks } = JSON.parse(readFileSync(`${DELIVERY}/measure/places.json`, "utf8")) as { picks: Pick[] };
  const only = process.argv[2];
  const plates: Plate[] = [];
  const put = (p: Omit<Plate, "file" | "id">, svg: string): void => {
    const id = `${p.place}--${p.arm}--b${p.band}--${p.dress}`;
    const file = `${id}.svg`;
    writeFileSync(`${SVG_DIR}/${file}`, svg);
    plates.push({ ...p, id, file });
  };
  for (const pick of picks) {
    const place = slugOf(pick);
    if (only !== undefined && place !== only) continue;
    const world = worldOf(pick.seed);
    const { u, v } = uvOf(world, pick.x, pick.y);
    const sheets = new Map<string, string>();
    for (const band of [3, 4, 5, 6]) {
      const window = bandWindow(u, v, band);
      const today = timed(() => todayRegion(world, window));
      for (const dress of ["plain", ...THEMES] as const) {
        const svg = renderRegion(world, today.value, window, dress === "plain" ? undefined : (dress as Theme));
        put({ place, arm: "today", band, dress, window, facts: factsOf(world, today.value, window, band, svg, today.ms) }, svg);
        if (dress === "plain") sheets.set(`today-${band}`, svg);
      }
      const a = timed(() => armARegion(world, window, today.value));
      const aSvg = renderRegion(world, a.value.region, window);
      put({ place, arm: "A", band, dress: "plain", window, facts: factsOf(world, a.value.region, window, band, aSvg, a.ms), note: `arm A laid ${a.value.routed.length} world river run(s), ${a.value.routed.filter((r) => r.fellBack).length} by the fallback` }, aSvg);
      sheets.set(`A-${band}`, aSvg);
      const b = timed(() => armBRegion(world, window, "after"));
      const bSvg = renderRegion(world, b.value, window);
      put({ place, arm: "B", band, dress: "plain", window, facts: factsOf(world, b.value, window, band, bSvg, b.ms) }, bSvg);
      sheets.set(`B-${band}`, bSvg);
      if (band >= 4) {
        const bi = timed(() => armBRegion(world, window, "inside"));
        const biSvg = renderRegion(world, bi.value, window);
        put({ place, arm: "Binside", band, dress: "plain", window, facts: factsOf(world, bi.value, window, band, biSvg, bi.ms) }, biSvg);
        const b0 = timed(() => armBRegion(world, window, "after", { carve: false }));
        const b0Svg = renderRegion(world, b0.value, window);
        put({ place, arm: "B0", band, dress: "plain", window, facts: factsOf(world, b0.value, window, band, b0Svg, b0.ms), note: "the designer's own variant: arm B without the cut" }, b0Svg);
        if (band >= 5) {
          put({ place, arm: "Binside-line", band, dress: "plain", window }, withWorldLine(biSvg, world, window));
          put({ place, arm: "B0-line", band, dress: "plain", window }, withWorldLine(b0Svg, world, window));
        }
      }
      if (band >= 5) {
        const marks = finerTier(world, window, band, a.value.region);
        const tiered = { ...a.value.region, settlements: [...a.value.region.settlements, ...marks.map((m) => m.settlement)] };
        const drawn = withTierGlyphs(renderRegion(world, tiered, window), marks, RENDER_WIDTH);
        const facts = factsOf(world, a.value.region, window, band, drawn.svg, a.ms);
        put({ place, arm: "tier", band, dress: "plain", window, facts: { ...facts, tier: { farmsteads: marks.filter((m) => m.kind === "farmstead").length, mills: marks.filter((m) => m.kind === "mill").length } }, note: `${drawn.swapped} of ${marks.length} marks given their glyph: ${marks.map((m) => m.name).join(", ")}` }, drawn.svg);
      }
      if (band >= 5) {
        put({ place, arm: "today-line", band, dress: "plain", window }, withWorldLine(sheets.get(`today-${band}`)!, world, window));
        put({ place, arm: "A-line", band, dress: "plain", window }, withWorldLine(aSvg, world, window));
        put({ place, arm: "B-line", band, dress: "plain", window }, withWorldLine(bSvg, world, window));
      }
      console.error(`${place} band ${band}`);
    }
    const w3 = bandWindow(u, v, 3);
    const w4 = bandWindow(u, v, 4);
    const w5 = bandWindow(u, v, 5);
    const c4 = { u: (w4.u0 + w4.u1) / 2, v: (w4.v0 + w4.v1) / 2 };
    const c5 = { u: (w5.u0 + w5.u1) / 2, v: (w5.v0 + w5.v1) / 2 };
    for (const arm of ["today", "A", "B"]) {
      put({ place, arm: `${arm}-held16`, band: 3, dress: "plain", window: w3, note: `the band-3 sheet at 16 times, its view centred on the band-4 window's centre, so it shows the band-4 sheet's ground at the band-4 sheet's size` }, heldView(sheets.get(`${arm}-3`)!, w3, c4.u, c4.v, 2));
    }
    put({ place, arm: "today-held24", band: 3, dress: "plain", window: w3, note: `the band-3 sheet at 24 times, its view centred on the band-5 window's centre` }, heldView(sheets.get("today-3")!, w3, c5.u, c5.v, 3));
  }
  const factsFile = `${DELIVERY}/facts.json`;
  const prior = only !== undefined ? (JSON.parse(readFileSync(factsFile, "utf8")) as { plates: Plate[] }).plates.filter((p) => !p.id.startsWith(`${only}--`)) : [];
  writeFileSync(factsFile, JSON.stringify({ sha: SHA, picks, plates: [...prior, ...plates] }, null, 1));
  console.log(`${plates.length} plates written to ${SVG_DIR}; windows: ${picks.map((p) => `${slugOf(p)} b5 ${winLabel(p.window)}`).join("; ")}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) main();
