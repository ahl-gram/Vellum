import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { VIEW_X0, VIEW_X1, type Ground, type Pt } from "../geometry.ts";
import { r1, stroke, type DressContext } from "./context.ts";

export function skyNodes(c: DressContext): SvgNode[] {
  const lines: string[] = [];
  for (let i = 0; i < 4; i++) lines.push(`M${VIEW_X0 + 14} ${58 + i * 7}H${VIEW_X1 - 14}`);
  return [
    el("path", {
      d: lines.join(""),
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.45,
      "stroke-opacity": 0.3,
    }),
  ];
}

function ridgeYAt(ridge: ReadonlyArray<Pt>, x: number): number {
  if (x <= ridge[0]!.x) return ridge[0]!.y;
  for (let i = 1; i < ridge.length; i++) {
    const a = ridge[i - 1]!;
    const b = ridge[i]!;
    if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return ridge[ridge.length - 1]!.y;
}

export function ridgeNodes(c: DressContext, ridge: ReadonlyArray<Pt>, base: number): SvgNode[] {
  const horizon = base + 2;
  const first = ridge[0]!;
  const last = ridge[ridge.length - 1]!;
  const line = ridge.map((p) => `L${r1(p.x)} ${r1(p.y)}`).join("");
  const d = `M${r1(first.x)} ${r1(horizon)}${line}L${r1(last.x)} ${r1(horizon)}Z`;
  const out: SvgNode[] = [el("path", { d, fill: c.paper, ...stroke(c, 1.2) })];

  let apex = first;
  for (const p of ridge) if (p.y < apex.y) apex = p;
  const h = horizon - apex.y;
  const flicks = c.style.name === "ink" ? 4 : 3;
  const parts: string[] = [];
  for (let j = 0; j < flicks; j++) {
    const t0 = 0.18 + j * (0.75 / flicks);
    const x = apex.x + (last.x - apex.x) * t0 * 0.5;
    const y = ridgeYAt(ridge, x);
    parts.push(`M${r1(x)} ${r1(y + 1.5)}l${r1(6 + j * 2)} ${r1(h * 0.16)}`);
  }
  out.push(el("path", { d: parts.join(""), fill: "none", ...stroke(c, 0.7) }));
  return out;
}

export function groundNodes(c: DressContext, ground: Ground, drowned: boolean): SvgNode[] {
  if (drowned) return [];
  const pts = ground.line;
  const first = pts[0]!;
  const line = pts
    .slice(1)
    .map((p) => `L${r1(p.x)} ${r1(p.y)}`)
    .join("");
  if (ground.rise > 0) {
    const last = pts[pts.length - 1]!;
    const d = `M${r1(first.x)} ${r1(ground.base + 3)}L${r1(first.x)} ${r1(first.y)}${line}L${r1(last.x)} ${r1(ground.base + 3)}Z`;
    return [el("path", { d, fill: c.paper, ...stroke(c, 1.3) })];
  }
  return [el("path", { d: `M${r1(first.x)} ${r1(first.y)}${line}`, fill: "none", ...stroke(c, 1.3) })];
}

export function grassFlicks(
  c: DressContext,
  rng: Rng,
  yAt: (x: number) => number,
  x0: number,
  x1: number,
  count: number,
): SvgNode {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = x0 + rng.next() * (x1 - x0);
    const y = yAt(x) + 3 + rng.next() * 9;
    parts.push(`M${r1(x)} ${r1(y)}l${r1(2 + rng.next() * 3)} 0`);
  }
  return el("path", {
    d: parts.join(""),
    fill: "none",
    stroke: c.soft,
    "stroke-width": 0.6,
    "stroke-opacity": 0.8,
  });
}
