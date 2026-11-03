import { el, type SvgNode } from "../../render/svg.ts";
import { r1, type DressContext } from "../../prospect/dress/context.ts";
import { treeRound, treePine, treePalm, marshTuft, dune, waveFlourish } from "../../prospect/dress/glyphs.ts";
import { BIOMES } from "../../climate/biomes.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { Rng } from "../../core/rng.ts";
import type { RibbonInput } from "../input.ts";
import { eventCaption, tierTag } from "../prose.ts";
import type { RibbonEvent } from "../events.ts";
import { stripPos, type StripLayout } from "./layout.ts";
import { bridgeMark, fordMark, hillProfile, mountainProfile, settlementCluster } from "./glyphs.ts";
import { stripCompass } from "./compass.ts";
import { leagueMarks, roadAngleDeg, roadNodes } from "./road.ts";
import type { RibbonContext } from "./context.ts";
import { clothFrame, plainFrame, stripBody } from "./cloth.ts";

const DECOR_STRIDE = 2;
const FOREST = new Set<number>([BIOMES.temperateForest, BIOMES.rainforest, BIOMES.tropicalForest]);

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
  return { nodes: [...laid.nodes, ...out], track: { ...laid.track, [key]: y - 4 } };
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
    el("path", {
      d,
      fill: "none",
      stroke: c.style.river,
      "stroke-width": 0.7,
      "stroke-opacity": 0.5,
      transform: "translate(0 2.6)",
    }),
  ]);
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

function eventNodes(c: DressContext, input: RibbonInput, strip: StripLayout, rng: Rng): SvgNode[] {
  const nodes: SvgNode[] = [];
  let laid: CaptionsLaid = { nodes: [], track: { left: strip.y0 + strip.h, right: strip.y0 + strip.h } };
  for (const e of input.events) {
    if (e.dist < strip.d0 || e.dist >= strip.d1) continue;
    const p = stripPos(strip, e.dist);
    const freeSide: -1 | 1 = p.sx > strip.x0 + strip.w / 2 ? -1 : 1;
    const caption = eventCaption(e, rng);
    switch (e.kind) {
      case "waypoint": {
        nodes.push(
          settlementCluster(c, p.sx, p.sy - 1, e.tier === "farmstead" || e.tier === "mill" ? "hamlet" : e.tier),
        );
        const lines = waypointLines(e, caption);
        laid = captionNodes(c, strip, p.sx, p.sy, freeSide, lines, laid);
        break;
      }
      case "crossing": {
        const tilt = rng.fork(`tilt-${e.k}`).range(-9, 9);
        nodes.push(riverBand(c, strip, p.sy, tilt));
        const deg = roadAngleDeg(strip, e.dist);
        nodes.push(e.major || e.name !== null ? bridgeMark(c, p.sx, p.sy, deg) : fordMark(c, p.sx, p.sy, deg));
        laid = captionNodes(c, strip, p.sx, p.sy - 8, freeSide, [{ text: caption }], laid);
        break;
      }
      case "branch": {
        const endX = p.sx + e.side * 20;
        const endY = p.sy - 9;
        nodes.push(
          el("path", {
            class: "road",
            d: `M${r1(p.sx)} ${r1(p.sy)}Q${r1(p.sx + e.side * 12)} ${r1(p.sy - 2)} ${r1(endX)} ${r1(endY)}`,
            fill: "none",
            stroke: c.style.road,
            "stroke-width": 0.9,
            "stroke-dasharray": "0.2 3",
            "stroke-linecap": "round",
          }),
        );
        laid = captionNodes(c, strip, endX, endY, e.side, [{ text: caption }], laid);
        break;
      }
      case "summit": {
        nodes.push(mountainProfile(c, p.sx + freeSide * 27, p.sy + 4, 1.05));
        laid = captionNodes(c, strip, p.sx, p.sy - 10, (freeSide * -1) as -1 | 1, [{ text: caption }], laid);
        break;
      }
    }
  }
  return [...nodes, ...laid.nodes];
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

export function stripNodes(
  c: RibbonContext,
  input: RibbonInput,
  strip: StripLayout,
  rng: Rng,
  isLast: boolean,
): SvgNode {
  const compassX = strip.x0 + strip.w / 2 - Math.sign(strip.lean || 1) * (strip.w / 4 + 4);
  const compassY = strip.y0 + strip.h * 0.36;
  return el("g", {}, [
    ...(c.paint ? clothFrame(c, c.paint, strip, stripBody(strip)) : plainFrame(c, strip)),
    ...decorNodes(c, strip, rng),
    stripCompass(c, compassX, compassY, strip.needleDeg),
    ...roadNodes(c, input, strip),
    ...leagueMarks(c, strip),
    ...eventNodes(c, input, strip, rng),
    ...continuation(c, strip, isLast),
  ]);
}
