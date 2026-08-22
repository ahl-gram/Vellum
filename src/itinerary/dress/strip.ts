import { el, type SvgNode } from "../../render/svg.ts";
import { r1, stroke, type DressContext } from "../../prospect/dress/context.ts";
import { treeRound, treePine, treePalm, marshTuft, dune, waveFlourish } from "../../prospect/dress/glyphs.ts";
import { BIOMES } from "../../climate/biomes.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { eventCaption, tierTag } from "../prose.ts";
import { stripPos, type StripLayout, type StripPoint } from "./layout.ts";
import { bridgeMark, fordMark, hillProfile, mountainProfile, settlementCluster } from "./glyphs.ts";
import { stripCompass } from "./compass.ts";

export const ROAD_HALF = 2.3;
const DECOR_STRIDE = 2;
const STRIP_LIFT = "#ffffff";
const STRIP_LIFT_OPACITY = 0.16;
const FOREST = new Set<number>([BIOMES.temperateForest, BIOMES.rainforest, BIOMES.tropicalForest]);

function frame(c: DressContext, s: StripLayout): SvgNode[] {
  return [
    el("rect", { x: s.x0, y: s.y0, width: s.w, height: s.h, fill: STRIP_LIFT, "fill-opacity": STRIP_LIFT_OPACITY }),
    el("rect", { x: s.x0, y: s.y0, width: s.w, height: s.h, fill: "none", stroke: c.ink, "stroke-width": 1.1 }),
    el("rect", { x: s.x0 + 3, y: s.y0 + 3, width: s.w - 6, height: s.h - 6, fill: "none", stroke: c.soft, "stroke-width": 0.5 }),
  ];
}

function offsetPath(pts: ReadonlyArray<StripPoint>, off: number): string {
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)] as StripPoint;
    const b = pts[Math.min(pts.length - 1, i + 1)] as StripPoint;
    const dx = b.sx - a.sx;
    const dy = b.sy - a.sy;
    const len = Math.hypot(dx, dy) || 1;
    const x = (pts[i] as StripPoint).sx + (-dy / len) * off;
    const y = (pts[i] as StripPoint).sy + (dx / len) * off;
    d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`;
  }
  return d;
}

function roadAngleDeg(strip: StripLayout, dist: number): number {
  const a = stripPos(strip, dist - 1.1);
  const b = stripPos(strip, dist + 1.1);
  return (Math.atan2(b.sy - a.sy, b.sx - a.sx) * 180) / Math.PI;
}

function roadNodes(c: DressContext, input: RibbonInput, strip: StripLayout): SvgNode[] {
  const nodes: SvgNode[] = [];
  for (const off of [-ROAD_HALF, ROAD_HALF]) {
    nodes.push(el("path", {
      d: offsetPath(strip.pts, off),
      fill: "none",
      stroke: c.style.road,
      "stroke-width": 1.1,
      "stroke-dasharray": "0.2 3.4",
      "stroke-linecap": "round",
    }));
  }
  const solidSpan = Math.min(2.2, 30 / strip.pxPerCell);
  for (const e of input.events) {
    if (e.kind !== "waypoint" || e.dist < strip.d0 - 0.75 || e.dist > strip.d1 + 0.75) continue;
    const a = stripPos(strip, Math.max(strip.d0, e.dist - solidSpan));
    const b = stripPos(strip, Math.min(strip.d1, e.dist + solidSpan));
    const dx = b.sx - a.sx;
    const dy = b.sy - a.sy;
    const len = Math.hypot(dx, dy);
    if (len < 2) continue;
    for (const off of [-ROAD_HALF, ROAD_HALF]) {
      const nx = (-dy / len) * off;
      const ny = (dx / len) * off;
      nodes.push(el("path", {
        d: `M${r1(a.sx + nx)} ${r1(a.sy + ny)}L${r1(b.sx + nx)} ${r1(b.sy + ny)}`,
        fill: "none",
        stroke: c.style.road,
        "stroke-width": 1.2,
      }));
    }
  }
  return nodes;
}

function leagueDots(c: DressContext, strip: StripLayout): SvgNode[] {
  const nodes: SvgNode[] = [];
  const first = Math.ceil(strip.d0 / CELLS_PER_LEAGUE);
  const last = Math.floor(strip.d1 / CELLS_PER_LEAGUE);
  for (let l = Math.max(1, first); l <= last; l++) {
    const p = stripPos(strip, l * CELLS_PER_LEAGUE);
    nodes.push(el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 1.4, fill: c.ink }));
    if (l % 5 === 0) {
      nodes.push(el("text", {
        x: r1(p.sx + 5.5),
        y: r1(p.sy + 2.4),
        "font-family": c.style.fontFamily,
        "font-size": 7,
        fill: c.soft,
      }, [String(l)]));
    }
  }
  return nodes;
}

function decorNodes(c: DressContext, strip: StripLayout, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  const fork = rng.fork(`decor-${strip.index}`);
  for (let i = 0; i < strip.samples.length; i += DECOR_STRIDE) {
    const smp = strip.samples[i];
    const pt = strip.pts[i];
    if (!smp || !pt) continue;
    if (pt.sy < strip.y0 + 26 || pt.sy > strip.y0 + strip.h - 12) continue;
    for (const side of [-1, 1] as const) {
      const rel = side < 0 ? smp.relL : smp.relR;
      const biome = side < 0 ? smp.biomeL : smp.biomeR;
      if (fork.next() < 0.42) continue;
      const x = pt.sx + side * (25 + fork.range(0, 9));
      if (x < strip.x0 + 10 || x > strip.x0 + strip.w - 10) continue;
      const y = pt.sy + fork.range(-2, 2);
      const p = { x, y, s: 0.72 + fork.range(0, 0.2) };
      if (biome === BIOMES.ocean) nodes.push(waveFlourish(c, x - 6, y, 0.8));
      else if (biome === BIOMES.alpine || biome === BIOMES.snow) nodes.push(mountainProfile(c, x, y, 0.8));
      else if (rel - smp.rel > 0.045) nodes.push(hillProfile(c, x, y, 0.85));
      else if (FOREST.has(biome)) nodes.push(treeRound(c, p));
      else if (biome === BIOMES.taiga) nodes.push(treePine(c, p));
      else if (biome === BIOMES.jungle || biome === BIOMES.savanna) nodes.push(treePalm(c, p));
      else if (biome === BIOMES.marsh) nodes.push(marshTuft(c, p));
      else if (biome === BIOMES.desert) nodes.push(dune(c, p));
    }
  }
  return nodes;
}

type CaptionTrack = { left: number; right: number };
type CaptionLine = { text: string; caps?: boolean; size?: number };

function wrapLine(text: string): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(" ")) {
    if (cur.length > 0 && cur.length + word.length > 17) {
      lines.push(cur);
      cur = word;
    } else cur = cur.length === 0 ? word : `${cur} ${word}`;
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}

function captionNodes(
  c: DressContext,
  strip: StripLayout,
  sx: number,
  sy: number,
  side: -1 | 1,
  spec: ReadonlyArray<CaptionLine>,
  track: CaptionTrack,
): SvgNode[] {
  const lines = spec.flatMap((l) =>
    wrapLine(l.text).map((text) => ({ text, caps: l.caps === true, size: l.size ?? 8.2 })),
  );
  const need = lines.reduce((a, l) => a + l.size + 1.2, 0);
  const key = side < 0 ? "left" : "right";
  let y = Math.min(sy + 2.6, track[key] - need);
  y = Math.max(y, strip.y0 + 22);
  track[key] = y - 4;
  const anchorX = side < 0 ? sx - 10 : sx + 10;
  const out: SvgNode[] = [];
  let dy = 0;
  for (const line of lines) {
    dy += line.size + 1.2;
    out.push(
      el("text", {
        x: r1(anchorX),
        y: r1(y + dy - 1.2),
        "text-anchor": side < 0 ? "end" : "start",
        "font-family": c.style.fontFamily,
        "font-size": line.size,
        "font-style": line.caps ? "normal" : "italic",
        ...(line.caps ? { "letter-spacing": 0.8 } : {}),
        fill: c.ink,
      }, [line.caps ? line.text.toUpperCase() : line.text]),
    );
  }
  return out;
}

function riverBand(c: DressContext, strip: StripLayout, sy: number, tiltDeg: number): SvgNode {
  const x0 = strip.x0 + 4;
  const x1 = strip.x0 + strip.w - 4;
  const span = (x1 - x0) / 4;
  let d = `M${r1(x0)} ${r1(sy)}`;
  for (let i = 0; i < 4; i++) {
    d += `q${r1(span / 2)} ${i % 2 === 0 ? -3 : 3} ${r1(span)} 0`;
  }
  return el("g", { transform: `rotate(${r1(tiltDeg)} ${r1((x0 + x1) / 2)} ${r1(sy)})` }, [
    el("path", { d, fill: "none", stroke: c.style.river, "stroke-width": 2.1, "stroke-opacity": 0.85 }),
    el("path", { d, fill: "none", stroke: c.style.river, "stroke-width": 0.7, "stroke-opacity": 0.5, transform: "translate(0 2.6)" }),
  ]);
}

function eventNodes(c: DressContext, input: RibbonInput, strip: StripLayout, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  const captions: SvgNode[] = [];
  const track: CaptionTrack = { left: strip.y0 + strip.h, right: strip.y0 + strip.h };
  for (const e of input.events) {
    if (e.dist < strip.d0 || e.dist >= strip.d1) continue;
    const p = stripPos(strip, e.dist);
    const freeSide: -1 | 1 = p.sx > strip.x0 + strip.w / 2 ? -1 : 1;
    const caption = eventCaption(e, rng);
    switch (e.kind) {
      case "waypoint": {
        nodes.push(settlementCluster(c, p.sx, p.sy - 1, e.tier));
        const lines: CaptionLine[] = e.endpoint
          ? [{ text: caption, caps: true, size: 10.5 }]
          : [{ text: caption, caps: true, size: 8.6 }, { text: tierTag(e.tier), size: 7.6 }];
        captions.push(...captionNodes(c, strip, p.sx, p.sy, freeSide, lines, track));
        break;
      }
      case "crossing": {
        const tilt = rng.fork(`tilt-${e.k}`).range(-9, 9);
        nodes.push(riverBand(c, strip, p.sy, tilt));
        const deg = roadAngleDeg(strip, e.dist);
        nodes.push(e.major || e.name !== null ? bridgeMark(c, p.sx, p.sy, deg) : fordMark(c, p.sx, p.sy, deg));
        captions.push(...captionNodes(c, strip, p.sx, p.sy - 8, freeSide, [{ text: caption }], track));
        break;
      }
      case "branch": {
        const endX = p.sx + e.side * 20;
        const endY = p.sy - 9;
        nodes.push(el("path", {
          d: `M${r1(p.sx)} ${r1(p.sy)}Q${r1(p.sx + e.side * 12)} ${r1(p.sy - 2)} ${r1(endX)} ${r1(endY)}`,
          fill: "none",
          stroke: c.style.road,
          "stroke-width": 0.9,
          "stroke-dasharray": "0.2 3",
          "stroke-linecap": "round",
        }));
        captions.push(...captionNodes(c, strip, endX, endY, e.side, [{ text: caption }], track));
        break;
      }
      case "summit": {
        nodes.push(mountainProfile(c, p.sx + freeSide * 27, p.sy + 4, 1.05));
        captions.push(...captionNodes(c, strip, p.sx, p.sy - 10, (freeSide * -1) as -1 | 1, [{ text: caption }], track));
        break;
      }
    }
  }
  return [...nodes, ...captions];
}

function continuation(c: DressContext, strip: StripLayout, isLast: boolean): SvgNode[] {
  if (isLast) return [];
  const leagues = Math.round(strip.d1 / CELLS_PER_LEAGUE);
  return [
    el("text", {
      x: r1(strip.x0 + strip.w / 2),
      y: r1(strip.y0 + 12),
      "text-anchor": "middle",
      "font-family": c.style.fontFamily,
      "font-size": 7.5,
      "font-style": "italic",
      fill: c.soft,
    }, [`· ${leagues} leagues ·`]),
  ];
}

export function stripNodes(
  c: DressContext,
  input: RibbonInput,
  strip: StripLayout,
  rng: Rng,
  isLast: boolean,
): SvgNode {
  const compassX = strip.x0 + strip.w / 2 - Math.sign(strip.lean || 1) * (strip.w / 4 + 4);
  const compassY = strip.y0 + strip.h * 0.36;
  return el("g", {}, [
    ...frame(c, strip),
    ...decorNodes(c, strip, rng),
    stripCompass(c, compassX, compassY, strip.needleDeg),
    ...roadNodes(c, input, strip),
    ...leagueDots(c, strip),
    ...eventNodes(c, input, strip, rng),
    ...continuation(c, strip, isLast),
  ]);
}
