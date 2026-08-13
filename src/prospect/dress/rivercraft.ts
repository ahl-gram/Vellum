import { el, type SvgNode } from "../../render/svg.ts";
import type { ForegroundElement } from "../geometry.ts";
import { massNodes } from "./buildings.ts";
import { rippleDash } from "./glyphs.ts";
import { r1, stroke, type DressContext } from "./context.ts";

type Bridge = Extract<ForegroundElement, { kind: "bridge" }>;
type Mill = Extract<ForegroundElement, { kind: "mill" }>;

export function bridgeNodes(c: DressContext, b: Bridge): SvgNode[] {
  const { x0, x1, deckY, waterY } = b;
  const out: SvgNode[] = [];
  for (const ax of [x0, x1]) {
    out.push(
      el("path", {
        d: `M${r1(ax - 3)} ${r1(deckY + 1)}L${r1(ax - 3)} ${r1(waterY + 3)}L${r1(ax + 3)} ${r1(waterY + 3)}L${r1(ax + 3)} ${r1(deckY + 1)}Z`,
        fill: c.paper,
        ...stroke(c, 1.0),
      }),
    );
  }
  const midY = deckY - 5;
  out.push(
    el("path", {
      d: `M${r1(x0 - 14)} ${r1(deckY + 2)}L${r1(x0)} ${r1(deckY)}Q${r1((x0 + x1) / 2)} ${r1(midY - 3)} ${r1(x1)} ${r1(deckY)}L${r1(x1 + 14)} ${r1(deckY + 2)}`,
      fill: "none",
      ...stroke(c, 1.3),
    }),
  );
  out.push(
    el("path", {
      d: `M${r1(x0 - 12)} ${r1(deckY - 3)}L${r1(x0)} ${r1(deckY - 3.4)}Q${r1((x0 + x1) / 2)} ${r1(midY - 6.4)} ${r1(x1)} ${r1(deckY - 3.4)}L${r1(x1 + 12)} ${r1(deckY - 3)}`,
      fill: "none",
      ...stroke(c, 0.8),
    }),
  );
  out.push(...archSpanNodes(c, b));
  out.push(...massNodes(c, b.gateTower, 1.1));
  return out;
}

function archSpanNodes(c: DressContext, b: Bridge): SvgNode[] {
  const { x0, deckY, waterY, arches } = b;
  const span = (b.x1 - x0) / arches;
  const out: SvgNode[] = [];
  for (let i = 0; i <= arches; i++) {
    const px = x0 + i * span;
    if (i > 0 && i < arches) {
      out.push(
        el("path", {
          d: `M${r1(px - 2.4)} ${r1(deckY)}V${r1(waterY)}L${r1(px - 5)} ${r1(waterY)}L${r1(px)} ${r1(waterY - 4.6)}L${r1(px + 5)} ${r1(waterY)}L${r1(px + 2.4)} ${r1(waterY)}V${r1(deckY)}`,
          fill: c.paper,
          ...stroke(c, 0.9),
        }),
      );
    }
    if (i < arches) {
      const ax0 = px + 4.5;
      const ax1 = px + span - 4.5;
      out.push(
        el("path", {
          d: `M${r1(ax0)} ${r1(waterY)}Q${r1(ax0)} ${r1(deckY + 3)} ${r1((ax0 + ax1) / 2)} ${r1(deckY + 3)}Q${r1(ax1)} ${r1(deckY + 3)} ${r1(ax1)} ${r1(waterY)}`,
          fill: "none",
          ...stroke(c, 0.9),
        }),
      );
      out.push(rippleDash(c, (ax0 + ax1) / 2 - 12, waterY + 5 + (i % 2) * 4, 0.7));
    }
  }
  return out;
}

export function weirNodes(c: DressContext, w: { x0: number; x1: number; y: number }): SvgNode[] {
  const foam: string[] = [];
  for (let x = w.x0 + 6; x < w.x1 - 6; x += 9) foam.push(`M${r1(x)} ${r1(w.y + 5)}v2.6`);
  return [
    el("path", {
      d: `M${r1(w.x0)} ${r1(w.y)}L${r1(w.x1)} ${r1(w.y)}M${r1(w.x0)} ${r1(w.y + 2.4)}L${r1(w.x1)} ${r1(w.y + 2.4)}`,
      fill: "none",
      ...stroke(c, 1),
    }),
    el("path", {
      d: foam.join(""),
      fill: "none",
      stroke: c.soft,
      "stroke-width": 0.6,
      "stroke-opacity": 0.8,
    }),
  ];
}

/** cos/sin of 45deg as literals: multiplication by a constant is exactly rounded, so the spokes stay platform-identical. */
const DIAG = 0.7071;
const SPOKES: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [DIAG, DIAG],
  [0, 1],
  [-DIAG, DIAG],
];

export function millNodes(c: DressContext, m: Mill): SvgNode[] {
  const { cx, cy, r } = m.wheel;
  const spokes = SPOKES.map(
    ([dx, dy]) =>
      `M${r1(cx - dx * r)} ${r1(cy - dy * r)}L${r1(cx + dx * r)} ${r1(cy + dy * r)}`,
  ).join("");
  return [
    ...massNodes(c, m.house, 1.2),
    el("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), fill: "none", ...stroke(c, 0.9) }),
    el("path", { d: spokes, fill: "none", stroke: c.ink, "stroke-width": 0.55 }),
  ];
}
