import { el, type SvgNode } from "../../render/svg.ts";
import type { Arms, Tincture } from "../../society/heraldry.ts";
import { paletteForStyle } from "../../render/layers/heraldry.ts";
import type { ProspectKind } from "../input.ts";
import type { PlateEra } from "../caption.ts";
import type { Pt } from "../geometry.ts";
import { hatchPolygon, poly, r1, washOr, type Engraver } from "./burin.ts";

export type FigureKind = "gentleman" | "lady" | "traveller" | "fisher" | "waterbearer" | "shepherd" | "rider" | "dog" | "sheep" | "porter" | "surveyor";
export type Figure = { readonly kind: FigureKind; readonly x: number; readonly y: number; readonly h: number; readonly flip: boolean };

/** Each glyph is drawn for a figure 30 units tall with its feet at the origin; the widths seat the group on the rise. */
export const FIGURE_WIDTH: Readonly<Record<FigureKind, number>> = {
  gentleman: 22, lady: 22, traveller: 24, fisher: 22, waterbearer: 16, shepherd: 22, rider: 34, dog: 16, sheep: 12, porter: 20, surveyor: 24,
};

export function castFor(kind: ProspectKind, harbor: boolean, roads: number, era: PlateEra): FigureKind[] {
  if (era === "before-founding") return ["surveyor", "dog"];
  if (era === "ruined") return ["traveller", "dog"];
  const cast: FigureKind[] =
    kind === "capital" || kind === "seat" ? ["gentleman", "lady", "porter"]
    : kind === "town" ? ["gentleman", "lady", harbor ? "porter" : "shepherd"]
    : kind === "village" ? [harbor ? "fisher" : "shepherd", "waterbearer"]
    : [harbor ? "fisher" : "shepherd"];
  if (roads >= 2) cast.push("rider");
  if (!harbor && (kind === "village" || kind === "hamlet")) cast.push("sheep", "sheep");
  else cast.push("dog");
  return cast;
}

type Cloth = { readonly a: string; readonly b: string };

function cloth(e: Engraver, arms: Arms | null): Cloth {
  if (e.wash === null) return { a: e.paper, b: e.paper };
  const palette = paletteForStyle(e.style);
  const field: ReadonlyArray<Tincture> = arms?.field ?? ["gules", "or"];
  const first = field[0] ?? "gules";
  const second = field[1] ?? arms?.charge?.tincture ?? "or";
  return { a: palette.tincture(first), b: palette.tincture(first === second ? "or" : second) };
}

const W = 0.7;
const sw = (w: number): number => Math.round(w * 1000) / 1000;

function garment(e: Engraver, pts: ReadonlyArray<Pt>, fill: string, slope: number, spacing: number): SvgNode[] {
  const out: SvgNode[] = [el("path", { d: poly(pts), fill: e.wash === null ? e.paper : fill, stroke: e.ink, "stroke-width": W, "stroke-linejoin": "round" })];
  if (e.wash === null || fill === e.paper) out.push(el("path", { d: hatchPolygon(pts, slope, spacing), fill: "none", stroke: e.ink, "stroke-width": sw(W * 0.55), "stroke-opacity": 0.85 }));
  return out;
}

const line = (e: Engraver, d: string, w = W): SvgNode => el("path", { d, fill: "none", stroke: e.ink, "stroke-width": sw(w), "stroke-linecap": "round", "stroke-linejoin": "round" });
const head = (e: Engraver, cx: number, cy: number, r: number): SvgNode => el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: washOr(e, "skin"), stroke: e.ink, "stroke-width": W });
const hand = (e: Engraver, x: number, y: number): SvgNode => el("circle", { cx: r1(x), cy: r1(y), r: 0.9, fill: washOr(e, "skin"), stroke: e.ink, "stroke-width": sw(W * 0.6) });
const ruff = (e: Engraver, cy: number, rx: number): SvgNode =>
  el("path", { d: `M${r1(-rx)} ${r1(cy)}q${r1(rx / 3)} -1.6 ${r1(rx * 2 / 3)} 0q${r1(rx / 3)} -1.6 ${r1(rx * 2 / 3)} 0q${r1(rx / 3)} -1.6 ${r1(rx * 2 / 3)} 0q${r1(-rx)} 2.6 ${r1(-rx * 2)} 0Z`, fill: e.paper, stroke: e.ink, "stroke-width": sw(W * 0.8) });

function hat(e: Engraver, cy: number, brim: number, crown: number): SvgNode[] {
  return [line(e, `M${r1(-brim)} ${r1(cy)}H${r1(brim)}`, W * 1.4), el("path", { d: `M${r1(-brim * 0.55)} ${r1(cy)}V${r1(cy - crown)}H${r1(brim * 0.55)}V${r1(cy)}Z`, fill: e.ink })];
}

function legs(e: Engraver, y0: number, stride: number): SvgNode[] {
  return [
    line(e, `M${r1(-stride * 0.4)} ${r1(y0)}L${r1(-stride)} 0M${r1(stride * 0.4)} ${r1(y0)}L${r1(stride)} 0`, W * 1.6),
    line(e, `M${r1(-stride - 1.2)} 0h2.6M${r1(stride - 0.4)} 0h2.8`, W * 2),
  ];
}

function gentleman(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...legs(e, -7, 2.2),
    ...garment(e, [{ x: -5, y: -21 }, { x: 5, y: -21 }, { x: 8, y: -6 }, { x: -7.5, y: -6 }], c.a, 3, 1.6),
    line(e, "M-4.6 -20.4q-1 4 -0.6 8M4.6 -20.4q1.2 4 0.8 8M0.4 -20q0.6 6 0.2 13", W * 0.6),
    line(e, "M5.5 -14l5 1.2", W * 1.3), hand(e, 10.8, -12.8),
    line(e, "M-4 -13l-3.6 9", W * 0.9), line(e, "M-6.2 -9.4h2.6", W * 0.8),
    ruff(e, -21.2, 4.4),
    head(e, 0, -24.4, 2.6),
    ...hat(e, -26.6, 4.4, 3.2),
  ];
}

function lady(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...garment(e, [{ x: -4, y: -17 }, { x: 4, y: -17 }, { x: 9.5, y: 0 }, { x: -9.5, y: 0 }], c.b, -1.4, 1.7),
    line(e, "M-5.4 -11q5.4 2 10.8 0M-7.4 -6q7.4 2.4 14.8 0M-1.6 -16.6l-2.4 16.4M1.6 -16.6l2.6 16.4", W * 0.6),
    ...garment(e, [{ x: -3.6, y: -22 }, { x: 3.6, y: -22 }, { x: 4, y: -17 }, { x: -4, y: -17 }], c.a, 2, 1.4),
    line(e, "M-3.6 -19.6l-4 6.4l2 1.4M3.6 -19.6l4.2 6l-2 1.6", W * 1.2), hand(e, -5.6, -11.8), hand(e, 5.8, -12),
    ruff(e, -22.4, 4.6),
    head(e, 0, -25.2, 2.5),
    el("path", { d: "M-2.8 -26.4q2.8 -3.6 5.6 0q0.6 1.4 -0.4 2.4", fill: e.ink }),
  ];
}

function traveller(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...legs(e, -6, 2.6),
    ...garment(e, [{ x: -4.6, y: -20 }, { x: 4.6, y: -20 }, { x: 7, y: -4 }, { x: -6, y: -4 }], e.paper, 2.4, 1.6),
    line(e, "M9 -27V1", W * 1.2),
    line(e, "M4.6 -16l4.4 -2.4", W * 1.2), hand(e, 9, -18.6),
    el("path", { d: "M-4.6 -18q-5 2 -4 7q1.4 3 4.6 1.6Z", fill: e.wash === null ? e.paper : c.b, stroke: e.ink, "stroke-width": W }),
    head(e, 0, -23.2, 2.5),
    ...hat(e, -25.4, 5.2, 2.2),
  ];
}

function fisher(e: Engraver): SvgNode[] {
  return [
    ...legs(e, -8, 2.4),
    ...garment(e, [{ x: -4.4, y: -19 }, { x: 4.4, y: -19 }, { x: 5.4, y: -9 }, { x: -5.4, y: -9 }], e.paper, 4, 1.5),
    line(e, "M4.4 -17l5 4l-1 5", W * 1.2), hand(e, 8.4, -8),
    el("path", { d: "M8 -8.6q-4 0 -4.6 5q4.8 1.6 9.6 0q-0.6 -5 -5 -5Z", fill: e.paper, stroke: e.ink, "stroke-width": W }),
    line(e, "M4.4 -6.6h8M4.8 -4.8h7.4M5.4 -3h6.4", W * 0.5),
    line(e, "M-4.4 -17l-3.4 -8l-1 2", W * 1.1), hand(e, -7.8, -25),
    head(e, 0, -22, 2.5),
    el("path", { d: "M-2.8 -23.4q2.8 -3 5.6 0", fill: e.ink }),
  ];
}

function waterbearer(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...garment(e, [{ x: -3.6, y: -15 }, { x: 3.6, y: -15 }, { x: 6.6, y: 0 }, { x: -6.6, y: 0 }], c.b, -1.6, 1.7),
    ...garment(e, [{ x: -3.2, y: -20.5 }, { x: 3.2, y: -20.5 }, { x: 3.6, y: -15 }, { x: -3.6, y: -15 }], e.paper, 2, 1.4),
    line(e, "M-3.2 -19l-2 -7.6M3.2 -19l2 -7.6", W * 1.2),
    head(e, 0, -23.4, 2.4),
    el("path", { d: "M-3.4 -26.4q3.4 -6.6 6.8 0Z", fill: e.wash === null ? e.paper : c.a, stroke: e.ink, "stroke-width": W }),
    line(e, "M-3.6 -26.4h7.2"),
  ];
}

function shepherd(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...legs(e, -6, 2),
    ...garment(e, [{ x: -4.4, y: -19 }, { x: 4.4, y: -19 }, { x: 5.6, y: -7 }, { x: -5.6, y: -7 }], c.b, 3, 1.6),
    line(e, "M-8 2V-24q0 -3 3 -2.6", W * 1.1),
    line(e, "M-4.4 -16l-3.4 -2", W * 1.2), hand(e, -8, -18),
    head(e, 0, -22, 2.5),
    ...hat(e, -24.2, 4.6, 1.6),
  ];
}

function porter(e: Engraver): SvgNode[] {
  return [
    ...legs(e, -7, 3),
    ...garment(e, [{ x: -4.2, y: -18 }, { x: 4.2, y: -16 }, { x: 5, y: -7 }, { x: -5, y: -8 }], e.paper, 3.4, 1.5),
    el("path", { d: "M-5.4 -25q6 -4.6 12.4 0q1 3.4 -1 6.4q-6 2.4 -11.4 0q-1.4 -3.2 0 -6.4Z", fill: e.paper, stroke: e.ink, "stroke-width": W }),
    line(e, "M-4.8 -22.4h11.6M-5 -20.2h11.8", W * 0.5),
    head(e, -1.6, -17.4, 2.3),
  ];
}

function surveyor(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...legs(e, -7, 2.4),
    ...garment(e, [{ x: -4.4, y: -20 }, { x: 4.4, y: -20 }, { x: 6, y: -6 }, { x: -6, y: -6 }], c.a, 3, 1.6),
    line(e, "M4.4 -17l8 -4", W * 1.2), hand(e, 12.4, -21.2),
    line(e, "M-7 1V-30M-9.4 -30h4.8", W * 1.1),
    head(e, 0, -23.2, 2.5),
    ...hat(e, -25.4, 4.2, 3),
  ];
}

function dog(e: Engraver): SvgNode[] {
  return [
    line(e, "M-5 -4q0 -3 3 -3h5q2 0 2.4 1.6l0.6 1.4M-4.6 -4l-1 4M-2.4 -4.4l-0.6 4.4M2.6 -4.4l0.8 4.4M4.8 -4l1.4 4", 0.6 * 1.3),
    line(e, "M-5 -5q-2.6 -1 -3.4 -4", 0.6),
    el("path", { d: "M6 -5.6q2.6 -1 3.4 -2.6l1.6 1.4l-1.4 2.6q-1.6 1 -3.6 0Z", fill: e.paper, stroke: e.ink, "stroke-width": 0.6 }),
    line(e, "M-4.4 -6.6q4 -0.6 8.2 0", 0.6 * 0.6),
  ];
}

function sheep(e: Engraver): SvgNode[] {
  return [
    el("path", { d: "M-4 -3q-1 -3 2 -3.6q2 -1.6 4.4 0q3 -0.4 2.6 2.6q1 2.6 -1.6 3q-3 1.4 -5.4 0q-2.6 0 -2 -2Z", fill: e.paper, stroke: e.ink, "stroke-width": 0.55 }),
    line(e, "M-2.4 -1v1.6M0.6 -1v1.6M2.8 -1v1.6", 0.55 * 1.3),
    el("path", { d: "M4.4 -5q2.2 -0.6 2.6 1.4q0 1.6 -1.6 1.4", fill: e.ink }),
  ];
}

function horse(e: Engraver): SvgNode[] {
  const coat = washOr(e, "horse");
  const body = [{ x: -12.5, y: -16.5 }, { x: -9, y: -19.4 }, { x: -1, y: -18.6 }, { x: 8, y: -19.6 }, { x: 12.4, y: -16.8 }, { x: 12, y: -11 }, { x: 8.4, y: -8.8 }, { x: -8.4, y: -8.8 }, { x: -12.2, y: -11.2 }];
  return [
    line(e, "M-9.6 -9.4l-1.2 4.6l0.4 4.6M-6.4 -9l0.6 4.2l-0.8 4.8M6.2 -9l-0.8 4.4l0.6 4.6M9.6 -9.6l1.8 4l-0.4 5.6", W * 1.5),
    line(e, "M-11.6 0.2h2.2M-6.8 0.2h2.2M5 0.2h2.2M10.4 0.2h2.4", W * 1.9),
    el("path", { d: "M-12.5 -16.5Q-14 -13.6 -12.2 -11.2Q-10.6 -8.6 -8.4 -8.8H8.4Q11.4 -9.4 12 -11Q13.4 -14 12.4 -16.8Q10.6 -19.8 8 -19.6Q3.4 -18.4 -1 -18.6Q-5.4 -19.8 -9 -19.4Q-11.6 -18.6 -12.5 -16.5Z", fill: coat, stroke: e.ink, "stroke-width": W }),
    el("path", { d: hatchPolygon(body, 0.6, 1.5), fill: "none", stroke: e.ink, "stroke-width": sw(W * 0.45), "stroke-opacity": e.wash === null ? 0.8 : 0.45 }),
    el("path", { d: "M-12.6 -16Q-17.2 -14.6 -17.6 -7.6Q-16.4 -10.6 -14.6 -12.6", fill: e.paper, stroke: e.ink, "stroke-width": W }),
    el("path", { d: "M9.6 -18Q12 -22.6 14.2 -26.2Q16.6 -29.4 18.4 -27.6L19.6 -24.4Q19.8 -22.6 18.4 -22.4L16.2 -22.6Q14.4 -19.6 12.8 -17.4Z", fill: coat, stroke: e.ink, "stroke-width": W }),
    line(e, "M10.6 -18.8Q12.6 -23.4 15 -26.6M11.6 -19.4l1.6 -1.2M12.6 -21.2l1.6 -1.1M13.6 -23l1.5 -1", W * 0.7),
    el("path", { d: "M16.4 -28.2l0.9 -2.4l1.2 2", fill: e.ink }),
    el("circle", { cx: 17.6, cy: -25.6, r: 0.45, fill: e.ink }),
  ];
}

function rider(e: Engraver, c: Cloth): SvgNode[] {
  return [
    ...horse(e),
    el("path", { d: "M-3.4 -17.8q3.2 2.2 6.6 0", fill: e.wash === null ? e.paper : c.b, stroke: e.ink, "stroke-width": W }),
    line(e, "M1.4 -18.6l1.6 5.4l-1.2 3.6", W * 1.5), line(e, "M0.8 -9.4h2.4", W * 1.4),
    ...garment(e, [{ x: -3.4, y: -31 }, { x: 3.6, y: -31 }, { x: 4.4, y: -19 }, { x: -3, y: -18.4 }], c.a, 3, 1.5),
    line(e, "M3.6 -27.6l5 3.2l7 -1.6", W * 0.9), hand(e, 8.6, -24.4),
    head(e, 0, -33.6, 2.4),
    ...hat(e, -35.6, 4.2, 2.4),
  ];
}

const DRAW: Readonly<Record<FigureKind, (e: Engraver, c: Cloth) => SvgNode[]>> = {
  gentleman, lady, traveller, waterbearer, shepherd, surveyor, rider,
  fisher: (e) => fisher(e), porter: (e) => porter(e), dog: (e) => dog(e), sheep: (e) => sheep(e),
};

export function figureNodes(e: Engraver, f: Figure, arms: Arms | null): SvgNode {
  const s = f.h / 30;
  const shadow = el("path", { d: "M-7 0.6q7 2 14 0", fill: "none", stroke: e.ink, "stroke-width": 0.5, "stroke-opacity": 0.5 });
  return el("g", { transform: `translate(${r1(f.x)} ${r1(f.y)}) scale(${r1(f.flip ? -s : s)} ${r1(s)})` }, [shadow, ...DRAW[f.kind](e, cloth(e, arms))]);
}
