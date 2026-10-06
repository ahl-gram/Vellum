import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { groundAt, type ForegroundElement, type Ground, type Mass, type ProspectGeometry, type Pt, type WallSegment } from "../geometry.ts";
import { dressContext } from "./context.ts";
import { foregroundNodes } from "./plate.ts";
import { birdFlock, hatchNode, poly, r1, stroke, treeClump, washOr, waterLines, type Engraver, type Gap } from "./burin.ts";

const SHADOW = 0.3;

function windows(e: Engraver, m: Mass, rows: number): SvgNode[] {
  const cols = m.w > 22 ? 3 : m.w > 12 ? 2 : 1;
  const out: SvgNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wy = m.base - m.h * (0.72 - r * 0.3);
      if (wy <= m.base - 4) out.push(el("rect", { x: r1(m.x + m.w * ((c + 0.5) / cols) - 0.7), y: r1(wy), width: 1.4, height: 2.4, fill: e.ink }));
    }
  }
  return out;
}

function door(e: Engraver, cx: number, base: number, hw: number, rise: number): SvgNode {
  return el("path", { d: `M${r1(cx - hw)} ${r1(base)}V${r1(base - rise)}Q${r1(cx)} ${r1(base - rise * 1.5)} ${r1(cx + hw)} ${r1(base - rise)}V${r1(base)}Z`, fill: e.ink });
}

function shadowStrip(e: Engraver, x: number, w: number, top: number, base: number): SvgNode {
  const sx = x + w * (1 - SHADOW);
  return hatchNode(e, [{ x: sx, y: top }, { x: x + w, y: top }, { x: x + w, y: base }, { x: sx, y: base }], 6, 1.5, 0.42, 0.9);
}

function brokenGable(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const pts = [{ x, y: base }, { x, y: top + h * 0.25 }, { x: x + w * 0.3, y: top + h * 0.55 }, { x: x + w * 0.55, y: top + h * 0.3 }, { x: x + w * 0.78, y: top + h * 0.6 }, { x: x + w, y: top + h * 0.45 }, { x: x + w, y: base }];
  return [el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }), hatchNode(e, pts.slice(2), 1.2, 2.2, 0.4, 0.7), shadowStrip(e, x, w, top + h * 0.45, base)];
}

function gableMass(e: Engraver, m: Mass, weight: number, church: boolean): SvgNode[] {
  if (m.broken) return brokenGable(e, m, weight);
  const { x, w, h, base } = m;
  const top = base - h;
  const gh = m.form === "gable" ? Math.min(9, h * 0.45) : Math.min(7, h * 0.4);
  const roofFill = washOr(e, church ? "roofChurch" : "roof");
  const out: SvgNode[] = [el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: e.paper, ...stroke(e, weight) }), shadowStrip(e, x, w, top, base)];
  if (m.form === "gable") {
    out.push(el("path", { d: poly([{ x: x - 0.6, y: top }, { x: x + w / 2, y: top - gh }, { x: x + w + 0.6, y: top }]), fill: roofFill, ...stroke(e, weight) }));
    out.push(hatchNode(e, [{ x: x + w / 2, y: top - gh }, { x: x + w + 0.6, y: top }, { x: x + w / 2, y: top }], -(gh / (w / 2)), 1.4, 0.4, 0.85));
  } else {
    const rw = w * 0.22;
    const roof = [{ x: x - 0.6, y: top }, { x: x + rw, y: top - gh }, { x: x + w - rw, y: top - gh }, { x: x + w + 0.6, y: top }];
    out.push(el("path", { d: poly(roof), fill: roofFill, ...stroke(e, weight) }), hatchNode(e, roof, 0, 1.3, 0.35, 0.8));
    out.push(hatchNode(e, [{ x: x + w - rw, y: top - gh }, { x: x + w + 0.6, y: top }, { x: x + w - rw * 1.4, y: top }], -(gh / rw), 1.4, 0.4, 0.85));
    if (w > 18) out.push(el("path", { d: `M${r1(x + w * 0.62)} ${r1(top - gh - 3.4)}h2.6v${r1(gh * 0.6 + 3.4)}`, fill: e.paper, ...stroke(e, 0.6) }));
  }
  out.push(...windows(e, m, h > 20 ? 2 : 1));
  if (w > 14 && h > 12) out.push(door(e, x + w * 0.42, base, 1.5, 3));
  return out;
}

function courses(e: Engraver, x: number, w: number, y0: number, y1: number, step: number): SvgNode {
  const parts: string[] = [];
  for (let y = y0 + step; y < y1 - 1; y += step) parts.push(`M${r1(x + 0.8)} ${r1(y)}H${r1(x + w - 0.8)}`);
  return el("path", { d: parts.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.3, "stroke-opacity": 0.55 });
}

function battlements(e: Engraver, x: number, w: number, top: number, teeth: number, weight: number): SvgNode {
  const t = w / (teeth * 2 - 1);
  let d = `M${r1(x - 0.5)} ${r1(top)}`;
  for (let i = 0; i < teeth; i++) {
    const tx = x - 0.5 + i * 2 * t;
    d += `L${r1(tx)} ${r1(top - 2.6)}H${r1(tx + t)}V${r1(top)}${i < teeth - 1 ? `H${r1(tx + 2 * t)}` : ""}`;
  }
  return el("path", { d, fill: e.paper, ...stroke(e, weight * 0.85) });
}

function verticalMass(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  if (m.broken) {
    const pts = [{ x, y: base }, { x, y: top + h * 0.2 }, { x: x + w * 0.35, y: top + h * 0.38 }, { x: x + w * 0.65, y: top + h * 0.12 }, { x: x + w, y: top + h * 0.3 }, { x: x + w, y: base }];
    return [el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }), shadowStrip(e, x, w, top + h * 0.3, base), courses(e, x, w, top + h * 0.4, base, 3)];
  }
  const out: SvgNode[] = [el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: e.paper, ...stroke(e, weight) }), courses(e, x, w, top, base, 3.2), shadowStrip(e, x, w, top, base)];
  if (m.form === "tower") {
    out.push(battlements(e, x, w, top, 3, weight));
    out.push(el("path", { d: `M${r1(x + 1)} ${r1(top - 2.6)}L${r1(x + w / 2)} ${r1(top - 2.6 - w * 0.55)}L${r1(x + w - 1)} ${r1(top - 2.6)}Z`, fill: washOr(e, "roofChurch"), ...stroke(e, 0.7) }));
  } else {
    const sp = Math.max(12, h * 0.55);
    const cx = x + w / 2;
    out.push(el("path", { d: poly([{ x: x - 0.6, y: top }, { x: cx, y: top - sp }, { x: x + w + 0.6, y: top }]), fill: washOr(e, "roofChurch"), ...stroke(e, weight) }));
    out.push(hatchNode(e, [{ x: cx, y: top - sp }, { x: x + w + 0.6, y: top }, { x: cx, y: top }], -(sp / (w / 2 + 0.6)), 1.3, 0.4, 0.85));
    out.push(el("path", { d: `M${r1(cx)} ${r1(top - sp - 1)}V${r1(top - sp - 4.6)}M${r1(cx - 1.8)} ${r1(top - sp - 3.2)}H${r1(cx + 1.8)}`, fill: "none", ...stroke(e, 0.8) }));
    out.push(el("path", { d: `M${r1(cx - 1.4)} ${r1(top + 3)}v3.4q1.4 -1.2 2.8 0v-3.4Z`, fill: e.ink }));
  }
  out.push(el("rect", { x: r1(x + w / 2 - 0.6), y: r1(top + h * 0.3), width: 1.2, height: 3, fill: e.ink }));
  if (h > 30) out.push(el("rect", { x: r1(x + w / 2 - 0.6), y: r1(top + h * 0.56), width: 1.2, height: 3, fill: e.ink }));
  return out;
}

function keepMass(e: Engraver, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  if (m.broken) {
    const pts = [{ x, y: base }, { x, y: top + h * 0.15 }, { x: x + w * 0.2, y: top + h * 0.4 }, { x: x + w * 0.42, y: top + h * 0.1 }, { x: x + w * 0.66, y: top + h * 0.45 }, { x: x + w, y: top + h * 0.22 }, { x: x + w, y: base }];
    return [el("path", { d: poly(pts), fill: e.paper, ...stroke(e, weight) }), shadowStrip(e, x, w, top + h * 0.45, base), courses(e, x, w, top + h * 0.45, base, 3.4), door(e, x + w / 2, base, 2.2, 4.2)];
  }
  const out: SvgNode[] = [el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: e.paper, ...stroke(e, weight) }), courses(e, x, w, top, base, 3.4), shadowStrip(e, x, w, top, base), battlements(e, x + 4, w - 8, top, 4, weight)];
  for (const tx of [x - 1, x + w - 5]) {
    out.push(el("path", { d: `M${r1(tx)} ${r1(base)}V${r1(top - 9)}H${r1(tx + 6)}V${r1(base)}Z`, fill: e.paper, ...stroke(e, weight * 0.9) }));
    out.push(hatchNode(e, [{ x: tx + 3.6, y: top - 9 }, { x: tx + 6, y: top - 9 }, { x: tx + 6, y: base }, { x: tx + 3.6, y: base }], 6, 1.4, 0.4, 0.9));
    out.push(el("path", { d: `M${r1(tx - 0.6)} ${r1(top - 9)}L${r1(tx + 3)} ${r1(top - 15)}L${r1(tx + 6.6)} ${r1(top - 9)}Z`, fill: washOr(e, "roofChurch"), ...stroke(e, weight * 0.9) }));
    out.push(el("path", { d: `M${r1(tx + 3)} ${r1(top - 15)}V${r1(top - 19.5)}l4 1.4l-4 1.4`, fill: "none", ...stroke(e, 0.7) }));
  }
  out.push(door(e, x + w / 2, base, 2.2, 4.2));
  out.push(el("rect", { x: r1(x + w * 0.3), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: e.ink }), el("rect", { x: r1(x + w * 0.66), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: e.ink }));
  return out;
}

export function massNodesEngraved(e: Engraver, m: Mass, weight: number, church = false): SvgNode[] {
  const body = m.form === "gable" || m.form === "ridge" ? gableMass(e, m, weight, church) : m.form === "keep" ? keepMass(e, m, weight) : verticalMass(e, m, weight);
  if (!m.broken) return body;
  const rub: string[] = [];
  for (let i = 0; i < 3; i++) rub.push(`M${r1(m.x + (i + 0.3) * (m.w / 3))} ${r1(m.base)}l2.4 -1.8l2 1.8Z`);
  return [...body, el("path", { d: rub.join(""), fill: e.paper, ...stroke(e, 0.7) })];
}

function wallTowers(e: Engraver, g: (x: number) => number, w: WallSegment): SvgNode[] {
  const towers = [w.x0 + 4, w.x1 - 4];
  if (w.gate) {
    const cx = (w.x0 + w.x1) / 2;
    towers.push(cx - 9, cx + 9);
    for (let x = w.x0 + 46; x < w.x1 - 46 * 0.6; x += 46) if (Math.abs(x - cx) > 16) towers.push(x);
  }
  return towers.flatMap((tx) => {
    const th = w.h + 6, tw = 7, b = g(tx);
    return [
      el("path", { d: `M${r1(tx - tw / 2)} ${r1(b)}V${r1(b - th)}H${r1(tx + tw / 2)}V${r1(b)}Z`, fill: e.paper, ...stroke(e, 0.9) }),
      hatchNode(e, [{ x: tx + tw * 0.2, y: b - th }, { x: tx + tw / 2, y: b - th }, { x: tx + tw / 2, y: b }, { x: tx + tw * 0.2, y: b }], 6, 1.3, 0.38, 0.9),
      el("path", { d: `M${r1(tx - tw / 2 - 0.5)} ${r1(b - th)}L${r1(tx)} ${r1(b - th - 5)}L${r1(tx + tw / 2 + 0.5)} ${r1(b - th)}Z`, fill: washOr(e, "roofChurch"), ...stroke(e, 0.7) }),
    ];
  });
}

export function wallNodesEngraved(e: Engraver, ground: Ground, w: WallSegment): SvgNode[] {
  const g = (x: number): number => groundAt(ground, x);
  const top: Pt[] = [];
  for (let x = w.x0; x <= w.x1; x += 8) top.push({ x, y: g(x) - w.h });
  top.push({ x: w.x1, y: g(w.x1) - w.h });
  const course: string[] = [], joints: string[] = [], teeth: string[] = [];
  for (let y = 2.4; y < w.h - 1; y += 2.4) course.push(`M${r1(w.x0 + 1)} ${r1(g(w.x0 + 1) - w.h + y)}L${r1(w.x1 - 1)} ${r1(g(w.x1 - 1) - w.h + y)}`);
  for (let x = w.x0 + 3; x < w.x1; x += 5.5) joints.push(`M${r1(x)} ${r1(g(x) - w.h + 2.4 * (Math.floor((x - w.x0) / 5.5) % 2) + 0.2)}v2`);
  for (let x = w.x0 + 3; x < w.x1 - 3; x += 6) teeth.push(`M${r1(x)} ${r1(g(x) - w.h)}V${r1(g(x) - w.h - 2.2)}H${r1(x + 3)}V${r1(g(x + 3) - w.h)}`);
  const out: SvgNode[] = [
    el("path", { d: poly([{ x: w.x0, y: g(w.x0) }, ...top, { x: w.x1, y: g(w.x1) }]), fill: e.paper, ...stroke(e, 1.0) }),
    el("path", { d: course.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.3, "stroke-opacity": 0.55 }),
    el("path", { d: joints.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.3, "stroke-opacity": 0.5 }),
    el("path", { d: teeth.join(""), fill: "none", ...stroke(e, 0.7) }),
    ...wallTowers(e, g, w),
  ];
  if (w.gate) {
    const cx = (w.x0 + w.x1) / 2, gb = g(cx);
    out.push(el("path", { d: `M${r1(cx - 4)} ${r1(gb)}V${r1(gb - 6)}Q${r1(cx)} ${r1(gb - 10.5)} ${r1(cx + 4)} ${r1(gb - 6)}V${r1(gb)}Z`, fill: e.ink }));
  }
  if (w.heel === 0) return out;
  const px = (w.x0 + w.x1) / 2;
  return [el("g", { transform: `rotate(${r1(w.heel)} ${r1(px)} ${r1(g(px))})` }, out)];
}

export function massIsChurch(m: Mass, g: ProspectGeometry): boolean {
  return m.form === "ridge" && g.masses.some((v) => v.form === "spire" && v.x >= m.x - 2 && v.x <= m.x + m.w);
}

export function waterEngraved(e: Engraver, x0: number, x1: number, y0: number, y1: number, gaps: ReadonlyArray<Gap>, rng: Rng): SvgNode[] {
  return [
    ...(e.wash === null ? [] : [el("rect", { x: x0, y: r1(y0), width: x1 - x0, height: r1(y1 - y0), fill: e.wash.water })]),
    waterLines(e, x0, x1, y0, y1, gaps, rng),
    el("path", { d: `M${x0} ${r1(y0)}H${x1}`, fill: "none", ...stroke(e, 1.0) }),
  ];
}

export function shipEngraved(e: Engraver, x: number, y: number, s: number, great: boolean, rng: Rng): SvgNode[] {
  const hull = [{ x: x - 13 * s, y: y - 3 * s }, { x: x - 10 * s, y: y + 3 * s }, { x: x + 10 * s, y: y + 3 * s }, { x: x + 14 * s, y: y - 5 * s }, { x: x + 11 * s, y: y - 5 * s }, { x: x + 9 * s, y: y - 2.5 * s }, { x: x - 10 * s, y: y - 2.5 * s }];
  const out: SvgNode[] = [el("path", { d: poly(hull), fill: e.paper, ...stroke(e, 0.9) }), hatchNode(e, hull, 0, 1.4 * s, 0.35, 0.8)];
  for (const mo of great ? [-6, 1, 8] : [0]) {
    const mx = x + mo * s, mh = (great ? 24 : 18) * s * (mo === 1 || !great ? 1.15 : 0.85);
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s)}V${r1(y - 2.5 * s - mh)}`, fill: "none", ...stroke(e, 0.8) }));
    for (const f of great ? [0.42, 0.78] : [0.6]) {
      const yy = y - 2.5 * s - mh * f, yw = 8 * s * (1.2 - f * 0.5);
      out.push(el("path", { d: `M${r1(mx - yw)} ${r1(yy)}H${r1(mx + yw)}`, fill: "none", ...stroke(e, 0.6) }));
      out.push(el("path", { d: `M${r1(mx - yw + 1)} ${r1(yy)}q${r1(yw * 0.5)} ${r1(3.2 * s)} ${r1(yw - 1)} ${r1(0.6)}q${r1(yw * 0.5)} ${r1(2.6 * s)} ${r1(yw - 1)} ${r1(-0.6)}`, fill: e.paper, ...stroke(e, 0.5) }));
    }
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s - mh)}l${r1(5 * s)} ${r1(1.6 * s)}l${r1(-5 * s)} ${r1(1.6 * s)}Z`, fill: e.wash?.vermilion ?? e.ink }));
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx - 8 * s)} ${r1(y - 2.5 * s)}M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx + 8 * s)} ${r1(y - 2.5 * s)}`, fill: "none", stroke: e.ink, "stroke-width": 0.35, "stroke-opacity": 0.8 }));
  }
  if (great) out.push(el("path", { d: `M${r1(x - 13 * s)} ${r1(y - 3 * s)}q${r1(-6 * s)} ${r1(-3 * s)} ${r1(-4 * s)} ${r1(-9 * s)}`, fill: "none", ...stroke(e, 0.8) }));
  const wake: string[] = [];
  for (let i = 0; i < 3; i++) wake.push(`M${r1(x - 16 * s + rng.next() * 6)} ${r1(y + 4.5 * s + i * 1.6)}q${r1(4 * s)} ${r1(-1)} ${r1(8 * s)} 0`);
  out.push(el("path", { d: wake.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.4, "stroke-opacity": 0.6 }));
  return out;
}

function quayEngraved(e: Engraver, q: Extract<ForegroundElement, { kind: "quay" }>): SvgNode[] {
  const { x0, x1, y } = q;
  const joints: string[] = [];
  for (let x = x0 + 4; x < x1 - 2; x += 5) joints.push(`M${r1(x)} ${r1(y - 3.4)}V${r1(y)}M${r1(x + 2.5)} ${r1(y)}V${r1(y + 3.4)}`);
  joints.push(`M${r1(x0 + 1)} ${r1(y)}H${r1(x1 - 1)}`);
  const out: SvgNode[] = [
    el("path", { d: poly([{ x: x0, y: y - 4 }, { x: x1, y: y - 4 }, { x: x1, y: y + 4 }, { x: x0, y: y + 4 }]), fill: e.paper, ...stroke(e, 1.0) }),
    el("path", { d: joints.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.35, "stroke-opacity": 0.7 }),
    hatchNode(e, [{ x: x0, y: y + 1.5 }, { x: x1, y: y + 1.5 }, { x: x1, y: y + 4 }, { x: x0, y: y + 4 }], 0, 0.9, 0.3, 0.8),
  ];
  const span = (q.arcade.x1 - q.arcade.x0) / q.arcade.arches;
  for (let i = 0; i < q.arcade.arches; i++) {
    const ax = q.arcade.x0 + i * span;
    out.push(el("path", { d: `M${r1(ax + 1.2)} ${r1(y + 4)}V${r1(y + 1.2)}Q${r1(ax + span / 2)} ${r1(y - 2.4)} ${r1(ax + span - 1.2)} ${r1(y + 1.2)}V${r1(y + 4)}Z`, fill: e.ink, "fill-opacity": 0.9 }));
  }
  out.push(el("path", { d: `M${r1(q.steps.x)} ${r1(y - 4)}${"v2.7h3.6".repeat(q.steps.count)}`, fill: "none", ...stroke(e, 0.8) }));
  for (const bx of q.bollards) out.push(el("circle", { cx: r1(bx), cy: r1(y - 5.6), r: 1.1, fill: e.ink }));
  return out;
}

function moleEngraved(e: Engraver, m: { readonly rootX: number; readonly headX: number; readonly headY: number }): SvgNode[] {
  const { rootX, headX: mx, headY } = m;
  const shore = headY - 10;
  const deck = [{ x: rootX, y: shore - 2 }, { x: mx, y: headY - 1 }, { x: mx, y: headY + 5 }, { x: rootX, y: shore + 4 }];
  return [
    el("path", { d: poly(deck), fill: e.paper, ...stroke(e, 1.0) }),
    hatchNode(e, deck, 0, 1.4, 0.35, 0.8),
    el("path", { d: `M${r1(mx - 3.2)} ${r1(headY + 6)}V${r1(shore - 8)}H${r1(mx + 3.2)}V${r1(headY + 6)}Z`, fill: e.paper, ...stroke(e, 0.9) }),
    hatchNode(e, [{ x: mx + 1, y: shore - 8 }, { x: mx + 3.2, y: shore - 8 }, { x: mx + 3.2, y: headY + 6 }, { x: mx + 1, y: headY + 6 }], 6, 1.3, 0.38, 0.9),
    el("path", { d: `M${r1(mx - 3.8)} ${r1(shore - 8)}L${r1(mx)} ${r1(shore - 13)}L${r1(mx + 3.8)} ${r1(shore - 8)}Z`, fill: washOr(e, "roofChurch"), ...stroke(e, 0.8) }),
    el("path", { d: `M${r1(mx)} ${r1(shore - 13)}V${r1(shore - 16.5)}l3.4 1.2l-3.4 1.2`, fill: "none", ...stroke(e, 0.6) }),
    el("circle", { cx: r1(mx), cy: r1(shore - 10), r: 1, fill: e.ink }),
  ];
}

export function foregroundEngraved(e: Engraver, f: ForegroundElement, rng: Rng): { readonly nodes: SvgNode[]; readonly gaps: Gap[] } {
  const only = (nodes: SvgNode[]): { nodes: SvgNode[]; gaps: Gap[] } => ({ nodes, gaps: [] });
  switch (f.kind) {
    case "trees":
      return only(f.items.flatMap((t) => treeClump(e, t.x, t.y, t.s * 3.1, rng, f.species)));
    case "quay":
      return only(quayEngraved(e, f));
    case "mole":
      return only(moleEngraved(e, f));
    case "mastRow": {
      const scale = (mastH: number): number => 0.72 + (mastH - 42) / 90;
      return {
        nodes: f.masts.flatMap((m) => shipEngraved(e, m.x, m.hullY, scale(m.mastH), m.mastH > 56, rng)),
        gaps: f.masts.map((m) => ({ x0: m.x - 15 * scale(m.mastH), x1: m.x + 16 * scale(m.mastH), y0: m.hullY - 6 * scale(m.mastH), y1: m.hullY + 4 * scale(m.mastH) })),
      };
    }
    case "ship":
      return { nodes: shipEngraved(e, f.x, f.y + 1, f.s * 1.15, true, rng), gaps: [{ x0: f.x - 20 * f.s, x1: f.x + 20 * f.s, y0: f.y - 8 * f.s, y1: f.y + 5 * f.s }] };
    case "beachedHulls":
      return only(f.hulls.map((h) => el("g", { transform: `rotate(${r1(h.tilt)} ${r1(h.x)} ${r1(h.y)})` }, [
        el("path", { d: `M${r1(h.x - 11)} ${r1(h.y)}q11 5.5 22 0l-2.5 -3h-17Z`, fill: e.paper, ...stroke(e, 1.0) }),
        hatchNode(e, [{ x: h.x - 10, y: h.y - 2.5 }, { x: h.x + 10, y: h.y - 2.5 }, { x: h.x + 7, y: h.y + 2.4 }, { x: h.x - 7, y: h.y + 2.4 }], 0, 1.3, 0.35),
      ])));
    case "ripples":
      return only([]);
    case "birds":
      return only(f.items.map((b) => birdFlock(e, b.x, b.y, 2 + Math.floor(b.s * 3), rng)));
    case "fieldRows":
    case "scrubRows":
    case "marshTufts":
    case "dunes":
    case "stilts":
    case "jetty":
    case "nets":
    case "bridge":
    case "weir":
    case "mill":
    case "rubble":
    case "beams":
    case "drownedStubs":
    case "seaSerpent":
      return only(foregroundNodes(dressContext(e.style), f));
  }
}
