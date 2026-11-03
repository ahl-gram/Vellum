import { el, type SvgNode } from "../../render/svg.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import { treeRound, treePine, treePalm, marshTuft, dune, waveFlourish } from "../../prospect/dress/glyphs.ts";
import type { XYS } from "../../prospect/geometry.ts";
import { BIOMES } from "../../climate/biomes.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { eventCaption, tierTag } from "../prose.ts";
import type { RibbonEvent } from "../events.ts";
import { stripPos, type StripLayout } from "./layout.ts";
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
} from "./glyphs.ts";
import { paintedRiverBand, riverBand, seaWash } from "./water.ts";
import { paintedCompass, stripCompass } from "./compass.ts";
import { leagueMarks, roadAngleDeg, roadNodes } from "./road.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";
import { clothFrame, plainFrame, stripBody, type StripBody } from "./cloth.ts";

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

function decorNodes(c: RibbonContext, strip: StripLayout, rng: Rng): SvgNode[] {
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
      nodes.push(
        ...(c.paint
          ? paintedDecor(c, c.paint, biome, rel, smp.rel, p, fork)
          : plainDecor(c, biome, rel, smp.rel, x, y, p)),
      );
    }
  }
  return nodes;
}

type CaptionTrack = { readonly left: number; readonly right: number };
type CaptionsLaid = { readonly nodes: ReadonlyArray<SvgNode>; readonly track: CaptionTrack };
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
  laid: CaptionsLaid,
): CaptionsLaid {
  const lines = spec.flatMap((l) =>
    wrapLine(l.text).map((text) => ({ text, caps: l.caps === true, size: l.size ?? 8.2 })),
  );
  const need = lines.reduce((a, l) => a + l.size + 1.2, 0);
  const key = side < 0 ? "left" : "right";
  let y = Math.min(sy + 2.6, laid.track[key] - need);
  y = Math.max(y, strip.y0 + 22);
  const anchorX = side < 0 ? sx - 10 : sx + 10;
  const out: SvgNode[] = [];
  let dy = 0;
  for (const line of lines) {
    dy += line.size + 1.2;
    out.push(
      el(
        "text",
        {
          x: r1(anchorX),
          y: r1(y + dy - 1.2),
          "text-anchor": side < 0 ? "end" : "start",
          "font-family": c.style.fontFamily,
          "font-size": line.size,
          "font-style": line.caps ? "normal" : "italic",
          ...(line.caps ? { "letter-spacing": 0.8 } : {}),
          fill: c.ink,
        },
        [line.caps ? line.text.toUpperCase() : line.text],
      ),
    );
  }
  return { nodes: [...laid.nodes, el("g", { class: "caption" }, out)], track: { ...laid.track, [key]: y - 4 } };
}

function waypointLines(e: Extract<RibbonEvent, { kind: "waypoint" }>, caption: string): CaptionLine[] {
  const lines: CaptionLine[] = e.endpoint
    ? [{ text: caption, caps: true, size: 10.5 }]
    : [
        { text: caption, caps: true, size: 8.6 },
        { text: tierTag(e.tier), size: 7.6 },
      ];
  return lines;
}

type Seat = { sx: number; sy: number; side: -1 | 1; lines: ReadonlyArray<CaptionLine> };

function captionSeat(e: RibbonEvent, p: { sx: number; sy: number }, freeSide: -1 | 1, caption: string): Seat {
  switch (e.kind) {
    case "waypoint":
      return { sx: p.sx, sy: p.sy, side: freeSide, lines: waypointLines(e, caption) };
    case "crossing":
      return { sx: p.sx, sy: p.sy - 8, side: freeSide, lines: [{ text: caption }] };
    case "branch":
      return { sx: p.sx + e.side * 20, sy: p.sy - 9, side: e.side, lines: [{ text: caption }] };
    case "summit":
      return { sx: p.sx, sy: p.sy - 10, side: (freeSide * -1) as -1 | 1, lines: [{ text: caption }] };
  }
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
    case "summit":
      return [
        c.paint
          ? paintedMountain(c, c.paint, p.sx + freeSide * 27, p.sy + 4, 1.05)
          : mountainProfile(c, p.sx + freeSide * 27, p.sy + 4, 1.05),
      ];
  }
}

function eventNodes(
  c: RibbonContext,
  input: RibbonInput,
  strip: StripLayout,
  body: StripBody,
  rng: Rng,
): { readonly art: SvgNode[]; readonly laid: CaptionsLaid } {
  const art: SvgNode[] = [];
  let laid: CaptionsLaid = { nodes: [], track: { left: strip.y0 + strip.h, right: strip.y0 + strip.h } };
  for (const e of input.events) {
    if (e.dist < strip.d0 || e.dist >= strip.d1) continue;
    const p = stripPos(strip, e.dist);
    const freeSide: -1 | 1 = p.sx > strip.x0 + strip.w / 2 ? -1 : 1;
    const caption = eventCaption(e, rng);
    art.push(...eventArt(c, strip, body, e, p, freeSide, rng));
    const seat = captionSeat(e, p, freeSide, caption);
    laid = captionNodes(c, strip, seat.sx, seat.sy, seat.side, seat.lines, laid);
  }
  return { art, laid };
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

function realmEdges(c: RibbonContext, input: RibbonInput, strip: StripLayout, isLast: boolean): SvgNode[] {
  const names: Array<{ name: string | null; x: number; turn: -90 | 90 }> = [
    { name: strip.index === 0 ? input.realmFrom : null, x: strip.x0 + 4.6, turn: -90 },
    { name: isLast ? input.realmName : null, x: strip.x0 + strip.w - 4.6, turn: 90 },
  ];
  const y = strip.y0 + strip.h / 2;
  return names.flatMap(({ name, x, turn }) =>
    name === null
      ? []
      : [
          el(
            "text",
            {
              x: r1(x),
              y: r1(y),
              "text-anchor": "middle",
              "dominant-baseline": "middle",
              transform: `rotate(${turn} ${r1(x)} ${r1(y)})`,
              "font-family": c.style.fontFamily,
              "font-size": 7.6,
              "font-style": "italic",
              "letter-spacing": 1.2,
              fill: c.ink,
            },
            [name],
          ),
        ],
  );
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
  const events = eventNodes(c, input, strip, body, rng);
  const art = el("g", {}, [
    ...(c.paint ? clothFrame(c, c.paint, strip, body) : plainFrame(c, strip)),
    ...(c.paint ? seaWash(c.paint, strip, body, rng.fork(`sea-${strip.index}`)) : []),
    ...decorNodes(c, strip, rng),
    c.paint
      ? paintedCompass(c, c.paint, compassX, compassY, strip.needleDeg)
      : stripCompass(c, compassX, compassY, strip.needleDeg),
    ...roadNodes(c, input, strip),
    ...leagueMarks(c, strip),
    ...events.art,
    ...continuation(c, strip, isLast),
    ...(c.paint ? realmEdges(c, input, strip, isLast) : []),
  ]);
  return { art, captions: events.laid.nodes };
}
