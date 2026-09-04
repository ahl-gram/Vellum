import { el, type SvgNode } from "../../src/render/svg.ts";
import { P, FONT, type Variant } from "./palette.ts";
import { MARGIN, RIBBON_W, r1, type Ribbon } from "./data.ts";

const ARMS_DOC = { w: 139.2, h: 160.8 };

/** The arms ride in as a placeholder token; build.ts swaps the realm's own SVG in after the plate renders. */
function arms(token: string | null, cx: number, cy: number, height: number): SvgNode[] {
  if (token === null) return [];
  const s = height / ARMS_DOC.h;
  return [el("g", { transform: `translate(${r1(cx - (ARMS_DOC.w * s) / 2)} ${r1(cy - height / 2)}) scale(${s.toFixed(3)})` }, [token])];
}

function stages(rb: Ribbon): string {
  const stops = rb.events.filter((e) => e.kind === "waypoint" && e.leagues > 0).map((e) => `to ${e.name} ${Math.round(e.leagues)}`);
  return `From ${rb.from} ${stops.join(", ")} leagues`;
}

function fitSize(text: string, maxPx: number, cap: number): number {
  return Math.min(cap, (maxPx / Math.max(1, text.length)) / 0.62);
}

export function titleBand(rb: Ribbon): SvgNode[] {
  const { title, subtitle } = rb.title;
  const cx = RIBBON_W / 2;
  const top = MARGIN;
  const ruleY = top + 66;
  return [
    el("text", { x: cx, y: top + 30, "text-anchor": "middle", "font-family": FONT, "font-size": r1(fitSize(title, RIBBON_W - 120, 25)), "letter-spacing": 1.4, fill: P.ink }, [title]),
    el("text", { x: cx, y: top + 47, "text-anchor": "middle", "font-family": FONT, "font-size": 11.5, "font-style": "italic", fill: P.soft }, [subtitle[0] ?? ""]),
    el("text", { x: cx, y: top + 61, "text-anchor": "middle", "font-family": FONT, "font-size": 10, "font-style": "italic", fill: P.soft }, [subtitle[1] ?? ""]),
    el("path", { d: `M${cx - 190} ${ruleY}H${cx - 8}M${cx + 8} ${ruleY}H${cx + 190}M${cx - 6} ${ruleY}l6 -3.4l6 3.4l-6 3.4Z`, fill: P.ink, stroke: P.ink, "stroke-width": 0.7 }),
  ];
}

/** The cartouche silhouette: a plate with concave notched corners, the shape under every 1670s drapery frame. */
function cartouchePath(x: number, y: number, w: number, h: number, n: number): string {
  return `M${x + n} ${y}H${x + w - n}a${n} ${n} 0 0 0 ${n} ${n}V${y + h - n}a${n} ${n} 0 0 0 ${-n} ${n}H${x + n}a${n} ${n} 0 0 0 ${-n} ${-n}V${y + n}a${n} ${n} 0 0 0 ${n} ${-n}Z`;
}

function cornerCurl(x: number, y: number, sx: number, sy: number): SvgNode {
  return el("path", {
    d: `M${r1(x + 16 * sx)} ${r1(y)}q${r1(-15 * sx)} 0 ${r1(-15 * sx)} ${r1(15 * sy)}q0 6 ${r1(5 * sx)} 6q${r1(4 * sx)} 0 ${r1(3 * sx)} ${r1(-4 * sy)}`,
    fill: "none", stroke: P.gold, "stroke-width": 1.6, "stroke-linecap": "round",
  });
}

/** Variant A: Ogilby's drapery cartouche, the two realms' arms flanking the title, the stages listed beneath as Britannia does. */
export function drapery(rb: Ribbon, armsFrom: string | null, armsTo: string | null): SvgNode[] {
  const { title, subtitle } = rb.title;
  const cx = RIBBON_W / 2;
  const top = MARGIN + 3;
  const w = 640;
  const h = 88;
  const x = cx - w / 2;
  const body = cartouchePath(x, top, w, h, 13);
  return [
    el("path", { d: body, fill: P.sepia, "fill-opacity": 0.28, transform: "translate(3 3)" }),
    el("path", { d: body, fill: P.cartoucheBlue, stroke: P.gold, "stroke-width": 2.4, "stroke-linejoin": "round" }),
    el("path", { d: cartouchePath(x + 5, top + 5, w - 10, h - 10, 9), fill: "none", stroke: P.ink, "stroke-width": 0.6, "stroke-opacity": 0.7 }),
    el("path", { d: `M${x + 40} ${top + h - 9}H${x + w - 40}`, fill: "none", stroke: P.gold, "stroke-width": 0.8, "stroke-opacity": 0.8 }),
    cornerCurl(x, top, 1, 1), cornerCurl(x + w, top, -1, 1), cornerCurl(x, top + h, 1, -1), cornerCurl(x + w, top + h, -1, -1),
    ...arms(armsFrom, x + 46, top + h / 2, 62),
    ...arms(armsTo, x + w - 46, top + h / 2, 62),
    el("text", { x: cx, y: top + 29, "text-anchor": "middle", "font-family": FONT, "font-size": r1(fitSize(title, w - 190, 21)), "letter-spacing": 1.2, fill: P.ink }, [title]),
    el("text", { x: cx, y: top + 45, "text-anchor": "middle", "font-family": FONT, "font-size": 10.5, "font-style": "italic", fill: P.ink }, [subtitle[0] ?? ""]),
    el("text", { x: cx, y: top + 58, "text-anchor": "middle", "font-family": FONT, "font-size": 9.5, "font-style": "italic", fill: P.ink }, [subtitle[1] ?? ""]),
    el("text", { x: cx, y: top + 75, "text-anchor": "middle", "font-family": FONT, "font-size": 8.6, "font-style": "italic", fill: P.ink, "fill-opacity": 0.85 }, [stages(rb)]),
  ];
}

/** Variant C: the title on a swallow-tailed gamboge banner, the rest of the band on paper. */
export function banner(rb: Ribbon): SvgNode[] {
  const { title, subtitle } = rb.title;
  const cx = RIBBON_W / 2;
  const top = MARGIN;
  const yc = top + 24;
  const hh = 15;
  const x0 = cx - 330;
  const x1 = cx + 330;
  const d = `M${x0 + 16} ${yc - hh}H${x1 - 16}L${x1} ${yc - hh}L${x1 - 9} ${yc}L${x1} ${yc + hh}L${x1 - 16} ${yc + hh}H${x0 + 16}L${x0} ${yc + hh}L${x0 + 9} ${yc}L${x0} ${yc - hh}Z`;
  return [
    el("path", { d, fill: P.sepia, "fill-opacity": 0.25, transform: "translate(2 3)" }),
    el("path", { d, fill: P.gamboge, stroke: P.ink, "stroke-width": 1, "stroke-linejoin": "round" }),
    el("rect", { x: x0 + 16, y: yc - hh, width: 9, height: hh * 2, fill: P.sepia, "fill-opacity": 0.35 }),
    el("rect", { x: x1 - 25, y: yc - hh, width: 9, height: hh * 2, fill: P.sepia, "fill-opacity": 0.35 }),
    el("text", { x: cx, y: yc + 6.5, "text-anchor": "middle", "font-family": FONT, "font-size": r1(fitSize(title, 580, 20)), "letter-spacing": 1.2, fill: P.ink }, [title]),
    el("text", { x: cx, y: top + 58, "text-anchor": "middle", "font-family": FONT, "font-size": 11, "font-style": "italic", fill: P.soft }, [subtitle[0] ?? ""]),
    el("text", { x: cx, y: top + 71, "text-anchor": "middle", "font-family": FONT, "font-size": 9.5, "font-style": "italic", fill: P.soft }, [subtitle[1] ?? ""]),
    el("text", { x: cx, y: top + 85, "text-anchor": "middle", "font-family": FONT, "font-size": 8.6, "font-style": "italic", fill: P.ink, "fill-opacity": 0.8 }, [stages(rb)]),
  ];
}

export function titleNodes(v: Variant, rb: Ribbon, armsFrom: string | null, armsTo: string | null): SvgNode[] {
  if (v.title === "drapery") return drapery(rb, armsFrom, armsTo);
  if (v.title === "banner") return banner(rb);
  return titleBand(rb);
}
