// The staffage: the costumed figures on the near ground, each a fixed glyph in a unit frame (height 1, feet at 0,0), dressed in the realm's tinctures where the dress is coloured and hatched where it is ink. Who stands there is read from the place: its kind, its harbour, its roads, its ruin.
import { el, type SvgNode } from "../../../src/render/svg.ts";
import type { Arms, Tincture } from "../../../src/society/heraldry.ts";
import type { Rng } from "../../../src/core/rng.ts";
import type { Dress } from "./dress.ts";
import { hatchPolygon, poly, r1, type Pt } from "./burin.ts";
import type { Scene } from "./data.ts";

const TINCTURE: Record<Tincture, string> = {
  or: "#c8a032", argent: "#efe8d6", gules: "#a83232", azure: "#2f5a86", sable: "#2b2722", vert: "#3f6b46", purpure: "#6f4a78",
};

export type Figure = { readonly kind: FigureKind; readonly x: number; readonly y: number; readonly h: number; readonly flip: boolean };
export type FigureKind = "gentleman" | "lady" | "traveller" | "fisher" | "waterbearer" | "shepherd" | "rider" | "dog" | "sheep" | "porter" | "surveyor";

type Cloth = { readonly a: string; readonly b: string };

function cloth(d: Dress, arms: Arms | null): Cloth {
  if (!d.coloured) return { a: d.paper, b: d.paper };
  const f = arms?.field ?? ["gules", "or"];
  const second = f[1] ?? arms?.charge?.tincture ?? "or";
  const a = TINCTURE[f[0] as Tincture] ?? "#a83232";
  const b = TINCTURE[second as Tincture] ?? "#c8a032";
  return a === b ? { a, b: "#c8a032" } : { a, b };
}

/** A garment: filled with its cloth in colour, hatched in ink; always outlined. */
function garment(d: Dress, pts: ReadonlyArray<Pt>, fill: string, w: number, hatchSlope: number, hatchSpacing: number): SvgNode[] {
  const out: SvgNode[] = [el("path", { d: poly(pts), fill: d.coloured ? fill : d.paper, stroke: d.ink, "stroke-width": w, "stroke-linejoin": "round" })];
  if (!d.coloured || fill === d.paper) out.push(el("path", { d: hatchPolygon(pts, hatchSlope, hatchSpacing), fill: "none", stroke: d.ink, "stroke-width": w * 0.55, "stroke-opacity": 0.85 }));
  return out;
}

function head(d: Dress, cx: number, cy: number, r: number, w: number): SvgNode[] {
  return [el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: d.coloured ? d.wash.skin : d.paper, stroke: d.ink, "stroke-width": w })];
}

function hat(d: Dress, cx: number, cy: number, brim: number, crown: number, w: number): SvgNode[] {
  return [
    el("path", { d: `M${r1(cx - brim)} ${r1(cy)}H${r1(cx + brim)}`, fill: "none", stroke: d.ink, "stroke-width": w * 1.4, "stroke-linecap": "round" }),
    el("path", { d: `M${r1(cx - brim * 0.55)} ${r1(cy)}V${r1(cy - crown)}H${r1(cx + brim * 0.55)}V${r1(cy)}Z`, fill: d.ink }),
  ];
}

function legs(d: Dress, cx: number, y0: number, y1: number, w: number, stride: number): SvgNode[] {
  return [
    el("path", { d: `M${r1(cx - stride * 0.4)} ${r1(y0)}L${r1(cx - stride)} ${r1(y1)}M${r1(cx + stride * 0.4)} ${r1(y0)}L${r1(cx + stride)} ${r1(y1)}`, fill: "none", stroke: d.ink, "stroke-width": w * 1.6, "stroke-linecap": "round" }),
    el("path", { d: `M${r1(cx - stride - 1.2)} ${r1(y1)}h2.6M${r1(cx + stride - 0.4)} ${r1(y1)}h2.8`, fill: "none", stroke: d.ink, "stroke-width": w * 2, "stroke-linecap": "round" }),
  ];
}

/** All glyphs are drawn for a 30 px figure and scaled by h / 30. */
function gentleman(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const cloak = [{ x: -5, y: -21 }, { x: 5, y: -21 }, { x: 8, y: -6 }, { x: -7.5, y: -6 }];
  return [
    ...legs(d, 0, -7, 0, w, 2.2),
    ...garment(d, cloak, c.a, w, 3, 1.6),
    el("path", { d: `M-5 -21q5 -2.4 10 0`, fill: "none", stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M-4.6 -20.4q-1 4 -0.6 8M4.6 -20.4q1.2 4 0.8 8`, fill: "none", stroke: d.ink, "stroke-width": w * 0.6 }),
    el("path", { d: `M5.5 -14l5 1.2`, fill: "none", stroke: d.ink, "stroke-width": w * 1.3, "stroke-linecap": "round" }),
    el("path", { d: `M-4 -13l-3.6 9`, fill: "none", stroke: d.ink, "stroke-width": w * 0.9 }),
    el("ellipse", { cx: 0, cy: -21.4, rx: 4.4, ry: 1.3, fill: d.paper, stroke: d.ink, "stroke-width": w * 0.8 }),
    ...head(d, 0, -24.4, 2.6, w),
    ...hat(d, 0, -26.6, 4.4, 3.2, w),
  ];
}

function lady(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const skirt = [{ x: -4, y: -17 }, { x: 4, y: -17 }, { x: 9.5, y: 0 }, { x: -9.5, y: 0 }];
  const bodice = [{ x: -3.6, y: -22 }, { x: 3.6, y: -22 }, { x: 4, y: -17 }, { x: -4, y: -17 }];
  return [
    ...garment(d, skirt, c.b, w, -1.4, 1.7),
    el("path", { d: `M-5.4 -11q5.4 2 10.8 0M-7.4 -6q7.4 2.4 14.8 0`, fill: "none", stroke: d.ink, "stroke-width": w * 0.6 }),
    ...garment(d, bodice, c.a, w, 2, 1.4),
    el("path", { d: `M-3.6 -19.6l-4 6.4l2 1.4M3.6 -19.6l4.2 6l-2 1.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    el("ellipse", { cx: 0, cy: -22.2, rx: 4.6, ry: 1.4, fill: d.paper, stroke: d.ink, "stroke-width": w * 0.8 }),
    ...head(d, 0, -25.2, 2.5, w),
    el("path", { d: `M-2.8 -26.4q2.8 -3.6 5.6 0q0.6 1.4 -0.4 2.4`, fill: d.ink }),
  ];
}

function traveller(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const cloak = [{ x: -4.6, y: -20 }, { x: 4.6, y: -20 }, { x: 7, y: -4 }, { x: -6, y: -4 }];
  return [
    ...legs(d, 0, -6, 0, w, 2.6),
    ...garment(d, cloak, d.paper, w, 2.4, 1.6),
    el("path", { d: `M9 -27V1`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2 }),
    el("path", { d: `M4.6 -16l4.4 -2.4`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    el("path", { d: `M-4.6 -18q-5 2 -4 7q1.4 3 4.6 1.6Z`, fill: d.coloured ? c.b : d.paper, stroke: d.ink, "stroke-width": w }),
    ...head(d, 0, -23.2, 2.5, w),
    ...hat(d, 0, -25.4, 5.2, 2.2, w),
  ];
}

function fisher(d: Dress): SvgNode[] {
  const w = 0.7;
  const jacket = [{ x: -4.4, y: -19 }, { x: 4.4, y: -19 }, { x: 5.4, y: -9 }, { x: -5.4, y: -9 }];
  return [
    ...legs(d, 0, -8, 0, w, 2.4),
    ...garment(d, jacket, d.paper, w, 4, 1.5),
    el("path", { d: `M4.4 -17l5 4l-1 5`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    el("path", { d: `M8 -8.6q-4 0 -4.6 5q4.8 1.6 9.6 0q-0.6 -5 -5 -5Z`, fill: d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M4.4 -6.6h8M4.8 -4.8h7.4M5.4 -3h6.4`, fill: "none", stroke: d.ink, "stroke-width": w * 0.5 }),
    el("path", { d: `M-4.4 -17l-3.4 -8l-1 2`, fill: "none", stroke: d.ink, "stroke-width": w * 1.1, "stroke-linecap": "round" }),
    ...head(d, 0, -22, 2.5, w),
    el("path", { d: `M-2.8 -23.4q2.8 -3 5.6 0`, fill: d.ink }),
  ];
}

function waterbearer(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const skirt = [{ x: -3.6, y: -15 }, { x: 3.6, y: -15 }, { x: 6.6, y: 0 }, { x: -6.6, y: 0 }];
  return [
    ...garment(d, skirt, c.b, w, -1.6, 1.7),
    ...garment(d, [{ x: -3.2, y: -20.5 }, { x: 3.2, y: -20.5 }, { x: 3.6, y: -15 }, { x: -3.6, y: -15 }], d.paper, w, 2, 1.4),
    el("path", { d: `M-3.2 -19l-2 -7.6M3.2 -19l2 -7.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    ...head(d, 0, -23.4, 2.4, w),
    el("path", { d: `M-3.4 -26.4q3.4 -6.6 6.8 0Z`, fill: d.coloured ? c.a : d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M-3.6 -26.4h7.2`, fill: "none", stroke: d.ink, "stroke-width": w }),
  ];
}

function shepherd(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const smock = [{ x: -4.4, y: -19 }, { x: 4.4, y: -19 }, { x: 5.6, y: -7 }, { x: -5.6, y: -7 }];
  return [
    ...legs(d, 0, -6, 0, w, 2),
    ...garment(d, smock, c.b, w, 3, 1.6),
    el("path", { d: `M-8 2V-24q0 -3 3 -2.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.1, "stroke-linecap": "round" }),
    el("path", { d: `M-4.4 -16l-3.4 -2`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    ...head(d, 0, -22, 2.5, w),
    ...hat(d, 0, -24.2, 4.6, 1.6, w),
  ];
}

function porter(d: Dress): SvgNode[] {
  const w = 0.7;
  return [
    ...legs(d, 0, -7, 0, w, 3),
    ...garment(d, [{ x: -4.2, y: -18 }, { x: 4.2, y: -16 }, { x: 5, y: -7 }, { x: -5, y: -8 }], d.paper, w, 3.4, 1.5),
    el("path", { d: `M-5.4 -25q6 -4.6 12.4 0q1 3.4 -1 6.4q-6 2.4 -11.4 0q-1.4 -3.2 0 -6.4Z`, fill: d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M-4.8 -22.4h11.6M-5 -20.2h11.8`, fill: "none", stroke: d.ink, "stroke-width": w * 0.5 }),
    ...head(d, -1.6, -17.4, 2.3, w),
  ];
}

function surveyor(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  return [
    ...legs(d, 0, -7, 0, w, 2.4),
    ...garment(d, [{ x: -4.4, y: -20 }, { x: 4.4, y: -20 }, { x: 6, y: -6 }, { x: -6, y: -6 }], c.a, w, 3, 1.6),
    el("path", { d: `M4.4 -17l8 -4`, fill: "none", stroke: d.ink, "stroke-width": w * 1.2, "stroke-linecap": "round" }),
    el("path", { d: `M-7 1V-30M-9.4 -30h4.8`, fill: "none", stroke: d.ink, "stroke-width": w * 1.1 }),
    ...head(d, 0, -23.2, 2.5, w),
    ...hat(d, 0, -25.4, 4.2, 3, w),
  ];
}

function dog(d: Dress): SvgNode[] {
  const w = 0.6;
  return [
    el("path", { d: `M-5 -4q0 -3 3 -3h5q2 0 2.4 1.6l0.6 1.4M-4.6 -4l-1 4M-2.4 -4.4l-0.6 4.4M2.6 -4.4l0.8 4.4M4.8 -4l1.4 4`, fill: "none", stroke: d.ink, "stroke-width": w * 1.3, "stroke-linecap": "round" }),
    el("path", { d: `M-5 -5q-2.6 -1 -3.4 -4`, fill: "none", stroke: d.ink, "stroke-width": w, "stroke-linecap": "round" }),
    el("path", { d: `M6 -5.6q2.6 -1 3.4 -2.6l1.6 1.4l-1.4 2.6q-1.6 1 -3.6 0Z`, fill: d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M-4.4 -6.6q4 -0.6 8.2 0`, fill: "none", stroke: d.ink, "stroke-width": w * 0.6 }),
  ];
}

function sheep(d: Dress): SvgNode[] {
  const w = 0.55;
  return [
    el("path", { d: `M-4 -3q-1 -3 2 -3.6q2 -1.6 4.4 0q3 -0.4 2.6 2.6q1 2.6 -1.6 3q-3 1.4 -5.4 0q-2.6 0 -2 -2Z`, fill: d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M-2.4 -1v1.6M0.6 -1v1.6M2.8 -1v1.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.3 }),
    el("path", { d: `M4.4 -5q2.2 -0.6 2.6 1.4q0 1.6 -1.6 1.4`, fill: d.ink }),
  ];
}

function rider(d: Dress, c: Cloth): SvgNode[] {
  const w = 0.7;
  const body = `M-12 -16Q-13.5 -9 -8 -8.5L8 -8.5Q13.5 -9.5 12.5 -16Q6 -19.5 -2 -18.5Q-9 -19.5 -12 -16Z`;
  const bodyPoly = [{ x: -12, y: -16 }, { x: -8, y: -8.5 }, { x: 8, y: -8.5 }, { x: 12.5, y: -16 }, { x: 6, y: -19 }, { x: -2, y: -18.5 }, { x: -9, y: -19 }];
  return [
    el("path", { d: `M-9 -9l-1.6 5l-0.6 4M-6 -9l0.4 9M6 -9l-0.6 9M9.4 -9.4l2 4.6l1 4.4`, fill: "none", stroke: d.ink, "stroke-width": w * 1.6, "stroke-linecap": "round" }),
    el("path", { d: `M-11.4 0.4h2.4M-6.4 0.4h2.4M4.4 0.4h2.4M11.2 0.4h2.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.8, "stroke-linecap": "round" }),
    el("path", { d: body, fill: d.coloured ? "#c9b38a" : d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: hatchPolygon(bodyPoly, 0.6, 1.5), fill: "none", stroke: d.ink, "stroke-width": w * 0.45, "stroke-opacity": 0.7 }),
    el("path", { d: `M-12 -16q-5 1 -5.4 9q1.2 -3 2.6 -4.6`, fill: d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M9.5 -17.5L14 -26Q17.5 -29 18.5 -24.5L17 -20.5Q15.5 -18.5 13 -17.5Z`, fill: d.coloured ? "#c9b38a" : d.paper, stroke: d.ink, "stroke-width": w }),
    el("path", { d: `M10 -18.5q3 -5 5 -7.4`, fill: "none", stroke: d.ink, "stroke-width": w * 1.6 }),
    el("path", { d: `M16.2 -27.2l1 -2.6l1.4 2`, fill: d.ink }),
    el("path", { d: `M-3 -17.5q3 2 6 0`, fill: d.coloured ? c.b : d.paper, stroke: d.ink, "stroke-width": w }),
    ...garment(d, [{ x: -3.6, y: -31 }, { x: 3.6, y: -31 }, { x: 4.6, y: -18 }, { x: -3.2, y: -18 }], c.a, w, 3, 1.5),
    el("path", { d: `M3 -19l2.6 6.6l-2.2 2.6`, fill: "none", stroke: d.ink, "stroke-width": w * 1.5, "stroke-linecap": "round" }),
    el("path", { d: `M3.6 -27.5l5 3.2l7.4 -0.6`, fill: "none", stroke: d.ink, "stroke-width": w * 0.9, "stroke-linecap": "round" }),
    ...head(d, 0, -33.6, 2.4, w),
    ...hat(d, 0, -35.6, 4.2, 2.4, w),
  ];
}

export function figureNodes(d: Dress, f: Figure, arms: Arms | null): SvgNode {
  const c = cloth(d, arms);
  const body = f.kind === "gentleman" ? gentleman(d, c)
    : f.kind === "lady" ? lady(d, c)
    : f.kind === "traveller" ? traveller(d, c)
    : f.kind === "fisher" ? fisher(d)
    : f.kind === "waterbearer" ? waterbearer(d, c)
    : f.kind === "shepherd" ? shepherd(d, c)
    : f.kind === "porter" ? porter(d)
    : f.kind === "surveyor" ? surveyor(d, c)
    : f.kind === "rider" ? rider(d, c)
    : f.kind === "sheep" ? sheep(d)
    : dog(d);
  const s = f.h / 30;
  const shadow = el("path", { d: `M${r1(-7)} 0.6q7 2 14 0`, fill: "none", stroke: d.ink, "stroke-width": 0.5, "stroke-opacity": 0.5 });
  return el("g", { transform: `translate(${r1(f.x)} ${r1(f.y)}) scale(${r1(f.flip ? -s : s)} ${r1(s)})` }, [shadow, ...body]);
}

/** Who stands on the rise, read from the place. The group always looks toward the town (to the right of centre faces left, and so on). */
export function castFor(scene: Scene, rng: Rng): ReadonlyArray<FigureKind> {
  const { input, era, roadsOut } = scene;
  if (era === "before-founding") return ["surveyor", "dog"];
  if (era === "ruined") return ["traveller", "dog"];
  const cast: FigureKind[] = [];
  switch (input.kind) {
    case "capital":
    case "seat":
      cast.push("gentleman", "lady", "porter");
      break;
    case "town":
      cast.push("gentleman", "lady");
      cast.push(input.harbor ? "porter" : "shepherd");
      break;
    case "village":
      cast.push(input.harbor ? "fisher" : "shepherd", "waterbearer");
      break;
    case "hamlet":
      cast.push(input.harbor ? "fisher" : "shepherd");
      break;
  }
  if (roadsOut >= 2 && rng.next() < 0.75) cast.push("rider");
  if (!input.harbor && (input.kind === "village" || input.kind === "hamlet")) cast.push("sheep", "sheep");
  else cast.push("dog");
  return cast;
}
