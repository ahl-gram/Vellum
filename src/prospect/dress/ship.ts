import { el, type SvgNode } from "../../render/svg.ts";
import type { Rng } from "../../core/rng.ts";
import { hatchNode, poly, r1, stroke, type Engraver } from "./burin.ts";

function shipMasts(e: Engraver, x: number, y: number, s: number, great: boolean): SvgNode[] {
  const out: SvgNode[] = [];
  for (const mo of great ? [-6, 1, 8] : [0]) {
    const mx = x + mo * s,
      mh = (great ? 24 : 18) * s * (mo === 1 || !great ? 1.15 : 0.85);
    out.push(
      el("path", { d: `M${r1(mx)} ${r1(y - 2.5 * s)}V${r1(y - 2.5 * s - mh)}`, fill: "none", ...stroke(e, 0.8) }),
    );
    for (const f of great ? [0.42, 0.78] : [0.6]) {
      const yy = y - 2.5 * s - mh * f,
        yw = 8 * s * (1.2 - f * 0.5);
      out.push(el("path", { d: `M${r1(mx - yw)} ${r1(yy)}H${r1(mx + yw)}`, fill: "none", ...stroke(e, 0.6) }));
      out.push(
        el("path", {
          d: `M${r1(mx - yw + 1)} ${r1(yy)}q${r1(yw * 0.5)} ${r1(3.2 * s)} ${r1(yw - 1)} ${r1(0.6)}q${r1(yw * 0.5)} ${r1(2.6 * s)} ${r1(yw - 1)} ${r1(-0.6)}`,
          fill: e.paper,
          ...stroke(e, 0.5),
        }),
      );
    }
    out.push(
      el("path", {
        d: `M${r1(mx)} ${r1(y - 2.5 * s - mh)}l${r1(5 * s)} ${r1(1.6 * s)}l${r1(-5 * s)} ${r1(1.6 * s)}Z`,
        fill: e.wash?.vermilion ?? e.ink,
      }),
    );
    out.push(
      el("path", {
        d: `M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx - 8 * s)} ${r1(y - 2.5 * s)}M${r1(mx)} ${r1(y - 2.5 * s - mh * 0.78)}L${r1(mx + 8 * s)} ${r1(y - 2.5 * s)}`,
        fill: "none",
        stroke: e.ink,
        "stroke-width": 0.35,
        "stroke-opacity": 0.8,
      }),
    );
  }
  return out;
}

export function shipWith(
  e: Engraver,
  x: number,
  y: number,
  s: number,
  great: boolean,
  wake: readonly [number, number, number],
): SvgNode[] {
  const hull = [
    { x: x - 13 * s, y: y - 3 * s },
    { x: x - 10 * s, y: y + 3 * s },
    { x: x + 10 * s, y: y + 3 * s },
    { x: x + 14 * s, y: y - 5 * s },
    { x: x + 11 * s, y: y - 5 * s },
    { x: x + 9 * s, y: y - 2.5 * s },
    { x: x - 10 * s, y: y - 2.5 * s },
  ];
  const out: SvgNode[] = [
    el("path", { d: poly(hull), fill: e.paper, ...stroke(e, 0.9) }),
    hatchNode(e, hull, 0, 1.4 * s, 0.35, 0.8),
  ];
  out.push(...shipMasts(e, x, y, s, great));
  if (great)
    out.push(
      el("path", {
        d: `M${r1(x - 13 * s)} ${r1(y - 3 * s)}q${r1(-6 * s)} ${r1(-3 * s)} ${r1(-4 * s)} ${r1(-9 * s)}`,
        fill: "none",
        ...stroke(e, 0.8),
      }),
    );
  const strokes: string[] = [];
  for (let i = 0; i < 3; i++)
    strokes.push(
      `M${r1(x - 16 * s + wake[i]! * 6)} ${r1(y + 4.5 * s + i * 1.6)}q${r1(4 * s)} ${r1(-1)} ${r1(8 * s)} 0`,
    );
  out.push(
    el("path", { d: strokes.join(""), fill: "none", stroke: e.ink, "stroke-width": 0.4, "stroke-opacity": 0.6 }),
  );
  return out;
}

export function shipEngraved(e: Engraver, x: number, y: number, s: number, great: boolean, rng: Rng): SvgNode[] {
  return shipWith(e, x, y, s, great, [rng.next(), rng.next(), rng.next()]);
}
