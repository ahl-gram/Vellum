import { el, type SvgNode } from "../../render/svg.ts";
import { boxesOverlap, type Box } from "../../render/geometry.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import { treeRound, treePine, treePalm, marshTuft, dune, waveFlourish } from "../../prospect/dress/glyphs.ts";
import type { XYS } from "../../prospect/geometry.ts";
import { BIOMES } from "../../climate/biomes.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { eventCaption } from "../prose.ts";
import type { RibbonEvent } from "../events.ts";
import { freeSideOf, stripPos, type StripLayout } from "./layout.ts";
import {
  bridgeMark,
  fordMark,
  hillProfile,
  mountainProfile,
  paintedDune,
  paintedHill,
  paintedMarshTuft,
  paintedMountain,
  paintedSettlementCluster,
  paintedTreePalm,
  paintedTreePine,
  paintedTreeRound,
  settlementCluster,
  stipple,
  summitMountain,
} from "./glyphs.ts";
import { paintedRiverBand, riverBand, seaWash } from "./water.ts";
import { paintedCompass, stripCompass } from "./compass.ts";
import { leagueMarks, roadAngleDeg, roadNodes } from "./road.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";
import { clothFrame, plainFrame, stripBody, type StripBody } from "./cloth.ts";
import { captionKeep, captionNode, captionRoom, layCaption, type CaptionsLaid } from "./captions.ts";
import type { Seat } from "./seats.ts";
import { borderHeights, borderLines, onBorderLine } from "./border-line.ts";

const DECOR_STRIDE = 2;
const FOREST = new Set<number>([BIOMES.temperateForest, BIOMES.rainforest, BIOMES.tropicalForest]);

function plainDecor(
  c: RibbonContext,
  biome: number,
  rel: number,
  smpRel: number,
  x: number,
  y: number,
  p: XYS,
): SvgNode[] {
  if (biome === BIOMES.ocean) return [waveFlourish(c, x - 6, y, 0.8)];
  if (biome === BIOMES.alpine || biome === BIOMES.snow) return [mountainProfile(c, x, y, 0.8)];
  if (rel - smpRel > 0.045) return [hillProfile(c, x, y, 0.85)];
  if (FOREST.has(biome)) return [treeRound(c, p)];
  if (biome === BIOMES.taiga) return [treePine(c, p)];
  if (biome === BIOMES.jungle || biome === BIOMES.savanna) return [treePalm(c, p)];
  if (biome === BIOMES.marsh) return [marshTuft(c, p)];
  if (biome === BIOMES.desert) return [dune(c, p)];
  return [];
}

function paintedDecor(
  c: RibbonContext,
  paint: RibbonPaint,
  biome: number,
  rel: number,
  smpRel: number,
  p: XYS,
  fork: Rng,
): SvgNode[] {
  const { x, y } = p;
  if (biome === BIOMES.ocean) return [];
  if (biome === BIOMES.alpine || biome === BIOMES.snow) return [paintedMountain(c, paint, x, y, 0.8)];
  if (rel - smpRel > 0.045) return [paintedHill(c, paint, x, y, 0.85)];
  if (FOREST.has(biome))
    return [...stipple(fork, x, y - 3, 7, 10, paint.verdigris, 0.55), paintedTreeRound(c, paint, p)];
  if (biome === BIOMES.taiga)
    return [...stipple(fork, x, y - 3, 4, 8, paint.verdigris, 0.5), paintedTreePine(c, paint, p)];
  if (biome === BIOMES.jungle || biome === BIOMES.savanna) return [paintedTreePalm(c, paint, p)];
  if (biome === BIOMES.marsh) return [...stipple(fork, x, y - 2, 3, 8, paint.azurite, 0.5), paintedMarshTuft(paint, p)];
  if (biome === BIOMES.desert) return [paintedDune(paint, p)];
  return [];
}

function glyphMeets(x: number, y: number, s: number, captions: ReadonlyArray<Box>): boolean {
  const glyph: Box = { x: x - 9 * s, y: y - 12 * s, w: 18 * s, h: 12 * s + 1 };
  return captions.some((b) => boxesOverlap(glyph, b, 1));
}

export function decorNodes(c: RibbonContext, strip: StripLayout, rng: Rng, captions: ReadonlyArray<Box>): SvgNode[] {
  const nodes: SvgNode[] = [];
  const fork = rng.fork(`decor-${strip.index}`);
  const margin = c.paint ? 12 : 10;
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
      if (x < strip.x0 + margin || x > strip.x0 + strip.w - margin) continue;
      const y = pt.sy + fork.range(-2, 2);
      const p = { x, y, s: 0.72 + fork.range(0, 0.2) };
      const made = c.paint
        ? paintedDecor(c, c.paint, biome, rel, smp.rel, p, fork)
        : plainDecor(c, biome, rel, smp.rel, x, y, p);
      if (!glyphMeets(!c.paint && biome === BIOMES.ocean ? x - 6 : x, y, p.s, captions)) nodes.push(...made);
    }
  }
  return nodes;
}

function eventArt(
  c: RibbonContext,
  strip: StripLayout,
  body: StripBody,
  e: RibbonEvent,
  p: { sx: number; sy: number },
  freeSide: -1 | 1,
  rng: Rng,
): SvgNode[] {
  switch (e.kind) {
    case "waypoint": {
      const tier = e.tier === "farmstead" || e.tier === "mill" ? "hamlet" : e.tier;
      return [
        c.paint
          ? paintedSettlementCluster(c, c.paint, p.sx, p.sy - 1, tier)
          : settlementCluster(c, p.sx, p.sy - 1, tier),
      ];
    }
    case "crossing": {
      const tilt = rng.fork(`tilt-${e.k}`).range(-9, 9);
      const deg = roadAngleDeg(strip, e.dist);
      return [
        c.paint ? paintedRiverBand(c.paint, body, p.sy, tilt) : riverBand(c, strip, p.sy, tilt),
        e.major || e.name !== null ? bridgeMark(c, p.sx, p.sy, deg) : fordMark(c, p.sx, p.sy, deg),
      ];
    }
    case "border":
    case "forest":
      return [];
    case "branch":
      return [
        el("path", {
          class: "road",
          d: `M${r1(p.sx)} ${r1(p.sy)}Q${r1(p.sx + e.side * 12)} ${r1(p.sy - 2)} ${r1(p.sx + e.side * 20)} ${r1(p.sy - 9)}`,
          fill: "none",
          stroke: c.paint ? c.ink : c.style.road,
          "stroke-width": 0.9,
          "stroke-dasharray": "0.2 3",
          "stroke-linecap": "round",
        }),
      ];
    case "summit": {
      const m = summitMountain(p, freeSide);
      return [c.paint ? paintedMountain(c, c.paint, m.x, m.y, m.s) : mountainProfile(c, m.x, m.y, m.s)];
    }
  }
}

function eventNodes(
  c: RibbonContext,
  input: RibbonInput,
  strip: StripLayout,
  body: StripBody,
  rng: Rng,
  compass: { readonly x: number; readonly y: number },
  isLast: boolean,
): { readonly art: SvgNode[]; readonly seats: ReadonlyArray<Seat> } {
  const art: SvgNode[] = [];
  const room = captionRoom(c, strip, body);
  const keep = captionKeep(c, input, strip, compass, isLast);
  let laid: CaptionsLaid = { seats: [], track: { left: strip.y0 + strip.h, right: strip.y0 + strip.h } };
  for (const e of input.events) {
    if (e.dist < strip.d0 || e.dist >= strip.d1) continue;
    const p = stripPos(strip, e.dist);
    const freeSide = freeSideOf(strip, p.sx);
    const caption = eventCaption(e, rng);
    art.push(...eventArt(c, strip, body, e, p, freeSide, rng));
    laid = layCaption(laid, e, p, freeSide, caption, strip, room, keep);
  }
  return { art: [...art, ...borderLines(c, strip, borderHeights(input, strip), keep)], seats: laid.seats };
}

function continuation(c: DressContext, strip: StripLayout, isLast: boolean): SvgNode[] {
  if (isLast) return [];
  const leagues = Math.round(strip.d1 / CELLS_PER_LEAGUE);
  return [
    el(
      "text",
      {
        x: r1(strip.x0 + strip.w / 2),
        y: r1(strip.y0 + 12),
        "text-anchor": "middle",
        "font-family": c.style.fontFamily,
        "font-size": 7.5,
        "font-style": "italic",
        fill: c.soft,
      },
      [`· ${leagues} leagues ·`],
    ),
  ];
}

export type StripDrawing = { readonly art: SvgNode; readonly captions: ReadonlyArray<SvgNode> };

export function stripNodes(
  c: RibbonContext,
  input: RibbonInput,
  strip: StripLayout,
  rng: Rng,
  isLast: boolean,
): StripDrawing {
  const body = stripBody(strip);
  const compassX = strip.x0 + strip.w / 2 - Math.sign(strip.lean || 1) * (strip.w / 4 + 4);
  const compassY = strip.y0 + strip.h * 0.36;
  const events = eventNodes(c, input, strip, body, rng, { x: compassX, y: compassY }, isLast);
  const art = el("g", {}, [
    ...(c.paint ? clothFrame(c, c.paint, strip, body) : plainFrame(c, strip)),
    ...(c.paint ? seaWash(c.paint, strip, body, rng.fork(`sea-${strip.index}`)) : []),
    ...decorNodes(
      c,
      strip,
      rng,
      events.seats.flatMap((seat) => [...seat.boxes]),
    ),
    c.paint
      ? paintedCompass(c, c.paint, compassX, compassY, strip.needleDeg)
      : stripCompass(c, compassX, compassY, strip.needleDeg),
    ...roadNodes(c, input, strip),
    ...leagueMarks(c, strip),
    ...events.art,
    ...continuation(c, strip, isLast),
  ]);
  const ys = borderHeights(input, strip);
  return {
    art,
    captions: events.seats.map((seat) =>
      captionNode(c, onBorderLine(seat.boxes, ys) ? { ...seat, backed: true } : seat),
    ),
  };
}
