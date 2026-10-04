// The engine's own geometry (masses, walls, foreground) redrawn with the engraver's hand: a lit side and a hatched shadow side on every mass, tiled roofs, coursed towers, water as line work, Hoefnagel trees.
import { el, type SvgNode } from "../../../src/render/svg.ts";
import type { Rng } from "../../../src/core/rng.ts";
import { groundAt, type ForegroundElement, type Ground, type Mass, type ProspectGeometry, type WallSegment } from "../../../src/prospect/geometry.ts";
import { foregroundNodes } from "../../../src/prospect/dress/plate.ts";
import { dressContext } from "../../../src/prospect/dress/context.ts";
import type { Dress } from "./dress.ts";
import { birdFlock, hatchNode, poly, r1, stroke, treeClump, waterLines, type Pt } from "./burin.ts";

const SHADOW = 0.3;

function windows(d: Dress, m: Mass, rows: number): SvgNode[] {
  const cols = m.w > 22 ? 3 : m.w > 12 ? 2 : 1;
  const out: SvgNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = m.x + m.w * ((c + 0.5) / cols);
      const wy = m.base - m.h * (0.72 - r * 0.3);
      if (wy > m.base - 4) continue;
      out.push(el("rect", { x: r1(wx - 0.7), y: r1(wy), width: 1.4, height: 2.4, fill: d.ink }));
    }
  }
  return out;
}

function door(d: Dress, cx: number, base: number, hw: number, rise: number): SvgNode {
  return el("path", { d: `M${r1(cx - hw)} ${r1(base)}V${r1(base - rise)}Q${r1(cx)} ${r1(base - rise * 1.5)} ${r1(cx + hw)} ${r1(base - rise)}V${r1(base)}Z`, fill: d.ink });
}

function shadowStrip(d: Dress, x: number, w: number, top: number, base: number): SvgNode {
  const sx = x + w * (1 - SHADOW);
  return hatchNode(d, [{ x: sx, y: top }, { x: x + w, y: top }, { x: x + w, y: base }, { x: sx, y: base }], 6, 1.5, 0.42, 0.9);
}

function gableMass(d: Dress, m: Mass, weight: number, church: boolean): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const gh = m.form === "gable" ? Math.min(9, h * 0.45) : Math.min(7, h * 0.4);
  const roofFill = d.coloured ? (church ? d.wash.roofChurch : d.wash.roof) : d.paper;
  const out: SvgNode[] = [];
  if (m.broken) {
    const pts = [{ x, y: base }, { x, y: top + h * 0.25 }, { x: x + w * 0.3, y: top + h * 0.55 }, { x: x + w * 0.55, y: top + h * 0.3 }, { x: x + w * 0.78, y: top + h * 0.6 }, { x: x + w, y: top + h * 0.45 }, { x: x + w, y: base }];
    out.push(el("path", { d: poly(pts), fill: d.paper, ...stroke(d, weight) }));
    out.push(hatchNode(d, pts.slice(2), 1.2, 2.2, 0.4, 0.7));
    out.push(shadowStrip(d, x, w, top + h * 0.45, base));
    return out;
  }
  out.push(el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: d.paper, ...stroke(d, weight) }));
  out.push(shadowStrip(d, x, w, top, base));
  if (m.form === "gable") {
    const roof = [{ x: x - 0.6, y: top }, { x: x + w / 2, y: top - gh }, { x: x + w + 0.6, y: top }];
    out.push(el("path", { d: poly(roof), fill: roofFill, ...stroke(d, weight) }));
    out.push(hatchNode(d, [{ x: x + w / 2, y: top - gh }, { x: x + w + 0.6, y: top }, { x: x + w / 2, y: top }], -(gh / (w / 2)), 1.4, 0.4, 0.85));
  } else {
    const rw = w * 0.22;
    const roof = [{ x: x - 0.6, y: top }, { x: x + rw, y: top - gh }, { x: x + w - rw, y: top - gh }, { x: x + w + 0.6, y: top }];
    out.push(el("path", { d: poly(roof), fill: roofFill, ...stroke(d, weight) }));
    out.push(hatchNode(d, roof, 0, 1.3, 0.35, 0.8));
    out.push(hatchNode(d, [{ x: x + w - rw, y: top - gh }, { x: x + w + 0.6, y: top }, { x: x + w - rw * 1.4, y: top }], -(gh / rw), 1.4, 0.4, 0.85));
    if (w > 18) out.push(el("path", { d: `M${r1(x + w * 0.62)} ${r1(top - gh - 3.4)}h2.6v${r1(gh * 0.6 + 3.4)}`, fill: d.paper, ...stroke(d, 0.6) }));
  }
  out.push(...windows(d, m, h > 20 ? 2 : 1));
  if (w > 14 && h > 12) out.push(door(d, x + w * 0.42, base, 1.5, 3));
  return out;
}

function courses(d: Dress, x: number, w: number, y0: number, y1: number, step: number): SvgNode {
  const parts: string[] = [];
  for (let y = y0 + step; y < y1 - 1; y += step) parts.push(`M${r1(x + 0.8)} ${r1(y)}H${r1(x + w - 0.8)}`);
  return el("path", { d: parts.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.3, "stroke-opacity": 0.55 });
}

function battlements(d: Dress, x: number, w: number, top: number, teeth: number, weight: number): SvgNode {
  const t = w / (teeth * 2 - 1);
  let dd = `M${r1(x - 0.5)} ${r1(top)}`;
  for (let i = 0; i < teeth; i++) {
    const tx = x - 0.5 + i * 2 * t;
    dd += `L${r1(tx)} ${r1(top - 2.6)}H${r1(tx + t)}V${r1(top)}${i < teeth - 1 ? `H${r1(tx + 2 * t)}` : ""}`;
  }
  return el("path", { d: dd, fill: d.paper, ...stroke(d, weight * 0.85) });
}

function verticalMass(d: Dress, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  const out: SvgNode[] = [];
  if (m.broken) {
    const pts = [{ x, y: base }, { x, y: top + h * 0.2 }, { x: x + w * 0.35, y: top + h * 0.38 }, { x: x + w * 0.65, y: top + h * 0.12 }, { x: x + w, y: top + h * 0.3 }, { x: x + w, y: base }];
    return [el("path", { d: poly(pts), fill: d.paper, ...stroke(d, weight) }), shadowStrip(d, x, w, top + h * 0.3, base), courses(d, x, w, top + h * 0.4, base, 3)];
  }
  out.push(el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: d.paper, ...stroke(d, weight) }));
  out.push(courses(d, x, w, top, base, 3.2));
  out.push(shadowStrip(d, x, w, top, base));
  if (m.form === "tower") {
    out.push(battlements(d, x, w, top, 3, weight));
    const roofFill = d.coloured ? d.wash.roofChurch : d.paper;
    out.push(el("path", { d: `M${r1(x + 1)} ${r1(top - 2.6)}L${r1(x + w / 2)} ${r1(top - 2.6 - w * 0.55)}L${r1(x + w - 1)} ${r1(top - 2.6)}Z`, fill: roofFill, ...stroke(d, 0.7) }));
  } else {
    const sp = Math.max(12, h * 0.55);
    const cx = x + w / 2;
    const spire = [{ x: x - 0.6, y: top }, { x: cx, y: top - sp }, { x: x + w + 0.6, y: top }];
    out.push(el("path", { d: poly(spire), fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, weight) }));
    out.push(hatchNode(d, [{ x: cx, y: top - sp }, { x: x + w + 0.6, y: top }, { x: cx, y: top }], -(sp / (w / 2 + 0.6)), 1.3, 0.4, 0.85));
    out.push(el("path", { d: `M${r1(cx)} ${r1(top - sp - 1)}V${r1(top - sp - 4.6)}M${r1(cx - 1.8)} ${r1(top - sp - 3.2)}H${r1(cx + 1.8)}`, fill: "none", ...stroke(d, 0.8) }));
    out.push(el("path", { d: `M${r1(cx - 1.4)} ${r1(top + 3)}v3.4q1.4 -1.2 2.8 0v-3.4Z`, fill: d.ink }));
  }
  const wx = x + w / 2;
  out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.3), width: 1.2, height: 3, fill: d.ink }));
  if (h > 30) out.push(el("rect", { x: r1(wx - 0.6), y: r1(top + h * 0.56), width: 1.2, height: 3, fill: d.ink }));
  return out;
}

function keepMass(d: Dress, m: Mass, weight: number): SvgNode[] {
  const { x, w, h, base } = m;
  const top = base - h;
  if (m.broken) {
    const pts = [{ x, y: base }, { x, y: top + h * 0.15 }, { x: x + w * 0.2, y: top + h * 0.4 }, { x: x + w * 0.42, y: top + h * 0.1 }, { x: x + w * 0.66, y: top + h * 0.45 }, { x: x + w, y: top + h * 0.22 }, { x: x + w, y: base }];
    return [el("path", { d: poly(pts), fill: d.paper, ...stroke(d, weight) }), shadowStrip(d, x, w, top + h * 0.45, base), courses(d, x, w, top + h * 0.45, base, 3.4), door(d, x + w / 2, base, 2.2, 4.2)];
  }
  const out: SvgNode[] = [
    el("path", { d: `M${r1(x)} ${r1(base)}V${r1(top)}H${r1(x + w)}V${r1(base)}Z`, fill: d.paper, ...stroke(d, weight) }),
    courses(d, x, w, top, base, 3.4),
    shadowStrip(d, x, w, top, base),
    battlements(d, x + 4, w - 8, top, 4, weight),
  ];
  for (const tx of [x - 1, x + w - 5]) {
    out.push(el("path", { d: `M${r1(tx)} ${r1(base)}V${r1(top - 9)}H${r1(tx + 6)}V${r1(base)}Z`, fill: d.paper, ...stroke(d, weight * 0.9) }));
    out.push(hatchNode(d, [{ x: tx + 3.6, y: top - 9 }, { x: tx + 6, y: top - 9 }, { x: tx + 6, y: base }, { x: tx + 3.6, y: base }], 6, 1.4, 0.4, 0.9));
    out.push(el("path", { d: `M${r1(tx - 0.6)} ${r1(top - 9)}L${r1(tx + 3)} ${r1(top - 15)}L${r1(tx + 6.6)} ${r1(top - 9)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, weight * 0.9) }));
    out.push(el("path", { d: `M${r1(tx + 3)} ${r1(top - 15)}V${r1(top - 19.5)}l4 1.4l-4 1.4`, fill: "none", ...stroke(d, 0.7) }));
  }
  out.push(door(d, x + w / 2, base, 2.2, 4.2));
  out.push(el("rect", { x: r1(x + w * 0.3), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: d.ink }));
  out.push(el("rect", { x: r1(x + w * 0.66), y: r1(top + h * 0.3), width: 1.4, height: 3, fill: d.ink }));
  return out;
}

export function massNodesEngraved(d: Dress, m: Mass, weight: number, church = false): SvgNode[] {
  const body = m.form === "gable" || m.form === "ridge" ? gableMass(d, m, weight, church) : m.form === "keep" ? keepMass(d, m, weight) : verticalMass(d, m, weight);
  if (!m.broken) return body;
  const rub: string[] = [];
  for (let i = 0; i < 3; i++) rub.push(`M${r1(m.x + (i + 0.3) * (m.w / 3))} ${r1(m.base)}l2.4 -1.8l2 1.8Z`);
  return [...body, el("path", { d: rub.join(""), fill: d.paper, ...stroke(d, 0.7) })];
}

export function wallNodesEngraved(d: Dress, ground: Ground, w: WallSegment, towerEvery = 46): SvgNode[] {
  const g = (x: number): number => groundAt(ground, x);
  const top: Pt[] = [];
  for (let x = w.x0; x <= w.x1; x += 8) top.push({ x, y: g(x) - w.h });
  top.push({ x: w.x1, y: g(w.x1) - w.h });
  const face = [{ x: w.x0, y: g(w.x0) }, ...top, { x: w.x1, y: g(w.x1) }];
  const out: SvgNode[] = [el("path", { d: poly(face), fill: d.paper, ...stroke(d, 1.0) })];
  const course: string[] = [];
  for (let y = 2.4; y < w.h - 1; y += 2.4) course.push(`M${r1(w.x0 + 1)} ${r1(g(w.x0 + 1) - w.h + y)}L${r1(w.x1 - 1)} ${r1(g(w.x1 - 1) - w.h + y)}`);
  out.push(el("path", { d: course.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.3, "stroke-opacity": 0.55 }));
  const joints: string[] = [];
  for (let x = w.x0 + 3; x < w.x1; x += 5.5) {
    const row = Math.floor((x - w.x0) / 5.5) % 2;
    joints.push(`M${r1(x)} ${r1(g(x) - w.h + 2.4 * row + 0.2)}v2`);
  }
  out.push(el("path", { d: joints.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.3, "stroke-opacity": 0.5 }));
  const teeth: string[] = [];
  for (let x = w.x0 + 3; x < w.x1 - 3; x += 6) teeth.push(`M${r1(x)} ${r1(g(x) - w.h)}V${r1(g(x) - w.h - 2.2)}H${r1(x + 3)}V${r1(g(x + 3) - w.h)}`);
  out.push(el("path", { d: teeth.join(""), fill: "none", ...stroke(d, 0.7) }));
  const towers = [w.x0 + 4, w.x1 - 4];
  if (w.gate) {
    const cx = (w.x0 + w.x1) / 2;
    towers.push(cx - 9, cx + 9);
    for (let x = w.x0 + towerEvery; x < w.x1 - towerEvery * 0.6; x += towerEvery) if (Math.abs(x - cx) > 16) towers.push(x);
  }
  for (const tx of towers) {
    const th = w.h + 6, tw = 7;
    const b = g(tx);
    out.push(el("path", { d: `M${r1(tx - tw / 2)} ${r1(b)}V${r1(b - th)}H${r1(tx + tw / 2)}V${r1(b)}Z`, fill: d.paper, ...stroke(d, 0.9) }));
    out.push(hatchNode(d, [{ x: tx + tw * 0.2, y: b - th }, { x: tx + tw / 2, y: b - th }, { x: tx + tw / 2, y: b }, { x: tx + tw * 0.2, y: b }], 6, 1.3, 0.38, 0.9));
    out.push(el("path", { d: `M${r1(tx - tw / 2 - 0.5)} ${r1(b - th)}L${r1(tx)} ${r1(b - th - 5)}L${r1(tx + tw / 2 + 0.5)} ${r1(b - th)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.7) }));
  }
  if (w.gate) {
    const cx = (w.x0 + w.x1) / 2, gb = g(cx);
    out.push(el("path", { d: `M${r1(cx - 4)} ${r1(gb)}V${r1(gb - 6)}Q${r1(cx)} ${r1(gb - 10.5)} ${r1(cx + 4)} ${r1(gb - 6)}V${r1(gb)}Z`, fill: d.ink }));
  }
  if (w.heel !== 0) {
    const px = (w.x0 + w.x1) / 2;
    return [el("g", { transform: `rotate(${r1(w.heel)} ${r1(px)} ${r1(g(px))})` }, out)];
  }
  return out;
}

export function shipEngraved(d: Dress, x: number, y: number, s: number, great: boolean, rng: Rng): SvgNode[] {
  const out: SvgNode[] = [];
  const hull = [{ x: x - 13 * s, y: y - 3 * s }, { x: x - 10 * s, y: y + 3 * s }, { x: x + 10 * s, y: y + 3 * s }, { x: x + 14 * s, y: y - 5 * s }, { x: x + 11 * s, y: y - 5 * s }, { x: x + 9 * s, y: y - 2.5 * s }, { x: x - 10 * s, y: y - 2.5 * s }];
  out.push(el("path", { d: poly(hull), fill: d.paper, ...stroke(d, 0.9) }));
  out.push(hatchNode(d, hull, 0, 1.4 * s, 0.35, 0.8));
  const masts = great ? [-6, 1, 8] : [0];
  for (const mo of masts) {
    const mx = x + mo * s, mh = (great ? 24 : 18) * s * (mo === 1 || !great ? 1.15 : 0.85);
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s)}V${r1(y - 2.5 * s - mh)}`, fill: "none", ...stroke(d, 0.8) }));
    for (const f of great ? [0.42, 0.78] : [0.6]) {
      const yy = y - 2.5 * s - mh * f, yw = 8 * s * (1.2 - f * 0.5);
      out.push(el("path", { d: `M${r1(mx - yw)} ${r1(yy)}H${r1(mx + yw)}`, fill: "none", ...stroke(d, 0.6) }));
      out.push(el("path", { d: `M${r1(mx - yw + 1)} ${r1(yy)}q${r1(yw * 0.5)} ${r1(3.2 * s)} ${r1(yw - 1)} ${r1(0.6)}q${r1(yw * 0.5)} ${r1(2.6 * s)} ${r1(yw - 1)} ${r1(-0.6)}`, fill: d.paper, ...stroke(d, 0.5) }));
    }
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s - mh)}l${r1(5 * s)} ${r1(1.6 * s)}l${r1(-5 * s)} ${r1(1.6 * s)}Z`, fill: d.coloured ? d.wash.vermilion : d.ink }));
    out.push(el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx - 8 * s)} ${r1(y - 2.5 * s)}M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx + 8 * s)} ${r1(y - 2.5 * s)}`, fill: "none", stroke: d.ink, "stroke-width": 0.35, "stroke-opacity": 0.8 }));
  }
  if (great) out.push(el("path", { d: `M${r1(x - 13 * s)} ${r1(y - 3 * s)}q${r1(-6 * s)} ${r1(-3 * s)} ${r1(-4 * s)} ${r1(-9 * s)}`, fill: "none", ...stroke(d, 0.8) }));
  const wake: string[] = [];
  for (let i = 0; i < 3; i++) wake.push(`M${r1(x - 16 * s + rng.next() * 6)} ${r1(y + 4.5 * s + i * 1.6)}q${r1(4 * s)} ${r1(-1)} ${r1(8 * s)} 0`);
  out.push(el("path", { d: wake.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.4, "stroke-opacity": 0.6 }));
  return out;
}

export function quayEngraved(d: Dress, q: Extract<ForegroundElement, { kind: "quay" }>): SvgNode[] {
  const { x0, x1, y } = q;
  const face = [{ x: x0, y: y - 4 }, { x: x1, y: y - 4 }, { x: x1, y: y + 4 }, { x: x0, y: y + 4 }];
  const out: SvgNode[] = [el("path", { d: poly(face), fill: d.paper, ...stroke(d, 1.0) })];
  const joints: string[] = [];
  for (let x = x0 + 4; x < x1 - 2; x += 5) joints.push(`M${r1(x)} ${r1(y - 3.4)}V${r1(y)}M${r1(x + 2.5)} ${r1(y)}V${r1(y + 3.4)}`);
  joints.push(`M${r1(x0 + 1)} ${r1(y)}H${r1(x1 - 1)}`);
  out.push(el("path", { d: joints.join(""), fill: "none", stroke: d.ink, "stroke-width": 0.35, "stroke-opacity": 0.7 }));
  out.push(hatchNode(d, [{ x: x0, y: y + 1.5 }, { x: x1, y: y + 1.5 }, { x: x1, y: y + 4 }, { x: x0, y: y + 4 }], 0, 0.9, 0.3, 0.8));
  const arc = q.arcade;
  const span = (arc.x1 - arc.x0) / arc.arches;
  for (let i = 0; i < arc.arches; i++) {
    const ax = arc.x0 + i * span;
    out.push(el("path", { d: `M${r1(ax + 1.2)} ${r1(y + 4)}V${r1(y + 1.2)}Q${r1(ax + span / 2)} ${r1(y - 2.4)} ${r1(ax + span - 1.2)} ${r1(y + 1.2)}V${r1(y + 4)}Z`, fill: d.ink, "fill-opacity": 0.9 }));
  }
  const treads: string[] = [`M${r1(q.steps.x)} ${r1(y - 4)}`];
  for (let i = 0; i < q.steps.count; i++) treads.push(`v2.7h3.6`);
  out.push(el("path", { d: treads.join(""), fill: "none", ...stroke(d, 0.8) }));
  for (const bx of q.bollards) out.push(el("circle", { cx: r1(bx), cy: r1(y - 5.6), r: 1.1, fill: d.ink }));
  return out;
}

export function moleEngraved(d: Dress, m: { rootX: number; headX: number; headY: number }): SvgNode[] {
  const { rootX, headX: mx, headY } = m;
  const shore = headY - 10;
  const deck = [{ x: rootX, y: shore - 2 }, { x: mx, y: headY - 1 }, { x: mx, y: headY + 5 }, { x: rootX, y: shore + 4 }];
  return [
    el("path", { d: poly(deck), fill: d.paper, ...stroke(d, 1.0) }),
    hatchNode(d, deck, 0, 1.4, 0.35, 0.8),
    el("path", { d: `M${r1(mx - 3.2)} ${r1(headY + 6)}V${r1(shore - 8)}H${r1(mx + 3.2)}V${r1(headY + 6)}Z`, fill: d.paper, ...stroke(d, 0.9) }),
    hatchNode(d, [{ x: mx + 1, y: shore - 8 }, { x: mx + 3.2, y: shore - 8 }, { x: mx + 3.2, y: headY + 6 }, { x: mx + 1, y: headY + 6 }], 6, 1.3, 0.38, 0.9),
    el("path", { d: `M${r1(mx - 3.8)} ${r1(shore - 8)}L${r1(mx)} ${r1(shore - 13)}L${r1(mx + 3.8)} ${r1(shore - 8)}Z`, fill: d.coloured ? d.wash.roofChurch : d.paper, ...stroke(d, 0.8) }),
    el("path", { d: `M${r1(mx)} ${r1(shore - 13)}V${r1(shore - 16.5)}l3.4 1.2l-3.4 1.2`, fill: "none", ...stroke(d, 0.6) }),
    el("circle", { cx: r1(mx), cy: r1(shore - 10), r: 1, fill: d.ink }),
  ];
}

/** Everything the engine composes in the foreground, redrawn where the burin changes it and handed back to the engine's own dress where it does not. */
export function foregroundEngraved(d: Dress, e: ForegroundElement, rng: Rng, hullGaps: Array<{ x0: number; x1: number; y0: number; y1: number }>): SvgNode[] {
  switch (e.kind) {
    case "trees":
      return e.items.flatMap((t) => treeClump(d, t.x, t.y, t.s * 3.1, rng, e.species));
    case "quay":
      return quayEngraved(d, e);
    case "mole":
      return moleEngraved(d, e);
    case "mastRow": {
      const out: SvgNode[] = [];
      for (const m of e.masts) {
        const s = 0.72 + (m.mastH - 42) / 90;
        hullGaps.push({ x0: m.x - 15 * s, x1: m.x + 16 * s, y0: m.hullY - 6 * s, y1: m.hullY + 4 * s });
        out.push(...shipEngraved(d, m.x, m.hullY, s, m.mastH > 56, rng));
      }
      return out;
    }
    case "ship":
      hullGaps.push({ x0: e.x - 20 * e.s, x1: e.x + 20 * e.s, y0: e.y - 8 * e.s, y1: e.y + 5 * e.s });
      return shipEngraved(d, e.x, e.y + 1, e.s * 1.15, true, rng);
    case "beachedHulls":
      return e.hulls.flatMap((h) => [
        el("g", { transform: `rotate(${r1(h.tilt)} ${r1(h.x)} ${r1(h.y)})` }, [
          el("path", { d: `M${r1(h.x - 11)} ${r1(h.y)}q11 5.5 22 0l-2.5 -3h-17Z`, fill: d.paper, ...stroke(d, 1.0) }),
          hatchNode(d, [{ x: h.x - 10, y: h.y - 2.5 }, { x: h.x + 10, y: h.y - 2.5 }, { x: h.x + 7, y: h.y + 2.4 }, { x: h.x - 7, y: h.y + 2.4 }], 0, 1.3, 0.35),
        ]),
      ]);
    case "ripples":
      return [];
    case "birds":
      return e.items.map((b) => birdFlock(d, b.x, b.y, 2 + Math.floor(b.s * 3), rng));
    default:
      return foregroundNodes(dressContext(d.style), e);
  }
}

export function waterEngraved(d: Dress, x0: number, x1: number, y0: number, y1: number, gaps: ReadonlyArray<{ x0: number; x1: number; y0: number; y1: number }>, rng: Rng): SvgNode[] {
  const out: SvgNode[] = [];
  if (d.coloured) out.push(el("rect", { x: x0, y: r1(y0), width: x1 - x0, height: r1(y1 - y0), fill: d.wash.water }));
  out.push(waterLines(d, x0, x1, y0, y1, gaps, rng));
  out.push(el("path", { d: `M${x0} ${r1(y0)}H${x1}`, fill: "none", ...stroke(d, 1.0) }));
  return out;
}

export function massIsChurch(m: Mass, g: ProspectGeometry): boolean {
  if (m.form !== "ridge") return false;
  return g.masses.some((v) => v.form === "spire" && v.x >= m.x - 2 && v.x <= m.x + m.w);
}
