import { el, type SvgNode } from "../../render/svg.ts";
import { r1 } from "../../prospect/dress/context.ts";
import { CELLS_PER_LEAGUE } from "../../render/layers/scalebar.ts";
import type { RibbonInput } from "../input.ts";
import type { RibbonContext, RibbonPaint } from "./context.ts";
import { stripPos, type StripLayout, type StripPoint } from "./layout.ts";

export const ROAD_HALF = 2.3;
export const PAINTED_ROAD_HALF = 4.2;

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

export function roadAngleDeg(strip: StripLayout, dist: number): number {
  const a = stripPos(strip, dist - 1.1);
  const b = stripPos(strip, dist + 1.1);
  return (Math.atan2(b.sy - a.sy, b.sx - a.sx) * 180) / Math.PI;
}

export type TownSpan = {
  readonly a: { readonly sx: number; readonly sy: number };
  readonly b: { readonly sx: number; readonly sy: number };
  readonly len: number;
};

export function townSpanEnds(strip: StripLayout, dist: number): TownSpan | null {
  if (dist < strip.d0 - 0.75 || dist > strip.d1 + 0.75) return null;
  const solidSpan = Math.min(2.2, 30 / strip.pxPerCell);
  const a = stripPos(strip, Math.max(strip.d0, dist - solidSpan));
  const b = stripPos(strip, Math.min(strip.d1, dist + solidSpan));
  const len = Math.hypot(b.sx - a.sx, b.sy - a.sy);
  return len < 2 ? null : { a, b, len };
}

export type LeagueMark = { readonly l: number; readonly p: { readonly sx: number; readonly sy: number } };

export function leaguesOn(strip: StripLayout): LeagueMark[] {
  const first = Math.max(1, Math.ceil(strip.d0 / CELLS_PER_LEAGUE));
  const last = Math.floor(strip.d1 / CELLS_PER_LEAGUE);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => {
    const l = first + i;
    return { l, p: stripPos(strip, l * CELLS_PER_LEAGUE) };
  });
}

export type FifthNumeral = { readonly x: number; readonly y: number; readonly size: number; readonly text: string };

export function fifthNumeral(p: { readonly sx: number; readonly sy: number }, l: number): FifthNumeral | null {
  return l % 5 === 0 ? { x: p.sx + 5.5, y: p.sy + 2.4, size: 7, text: String(l) } : null;
}

export function roadNodes(c: RibbonContext, input: RibbonInput, strip: StripLayout): SvgNode[] {
  const half = c.paint ? PAINTED_ROAD_HALF : ROAD_HALF;
  const ink = c.paint ? c.ink : c.style.road;
  const nodes: SvgNode[] = [];
  for (const off of [-half, half]) {
    nodes.push(
      el("path", {
        class: "road",
        d: offsetPath(strip.pts, off),
        fill: "none",
        stroke: ink,
        "stroke-width": 1.1,
        "stroke-dasharray": "0.2 3.4",
        "stroke-linecap": "round",
      }),
    );
  }
  for (const e of input.events) {
    const span = e.kind === "waypoint" ? townSpanEnds(strip, e.dist) : null;
    if (span === null) continue;
    const { a, b, len } = span;
    const dx = b.sx - a.sx;
    const dy = b.sy - a.sy;
    for (const off of [-half, half]) {
      const nx = (-dy / len) * off;
      const ny = (dx / len) * off;
      nodes.push(
        el("path", {
          class: "road",
          d: `M${r1(a.sx + nx)} ${r1(a.sy + ny)}L${r1(b.sx + nx)} ${r1(b.sy + ny)}`,
          fill: "none",
          stroke: ink,
          "stroke-width": 1.2,
        }),
      );
    }
  }
  return nodes;
}

function leagueDots(c: RibbonContext, strip: StripLayout): SvgNode[] {
  const nodes: SvgNode[] = [];
  for (const { l, p } of leaguesOn(strip)) {
    nodes.push(el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 1.4, fill: c.ink }));
    const n = fifthNumeral(p, l);
    if (n !== null) {
      nodes.push(
        el("text", { x: r1(n.x), y: r1(n.y), "font-family": c.style.fontFamily, "font-size": n.size, fill: c.soft }, [
          n.text,
        ]),
      );
    }
  }
  return nodes;
}

function leagueNumerals(c: RibbonContext, paint: RibbonPaint, strip: StripLayout): SvgNode[] {
  const nodes: SvgNode[] = [];
  for (const { l, p } of leaguesOn(strip)) {
    nodes.push(
      l >= 100
        ? el("ellipse", { cx: r1(p.sx), cy: r1(p.sy), rx: 5.1, ry: 3.6, fill: paint.landWash })
        : el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 3.6, fill: paint.landWash }),
      el(
        "text",
        {
          x: r1(p.sx),
          y: r1(p.sy + 1.9),
          "text-anchor": "middle",
          "font-family": c.style.fontFamily,
          "font-size": 5.2,
          fill: c.ink,
        },
        [String(l)],
      ),
    );
  }
  return nodes;
}

export function leagueMarks(c: RibbonContext, strip: StripLayout): SvgNode[] {
  return c.paint ? leagueNumerals(c, c.paint, strip) : leagueDots(c, strip);
}
