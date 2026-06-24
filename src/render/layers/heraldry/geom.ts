import { el, type SvgNode } from "../../svg.ts";
import type { Arms } from "../../../society/heraldry.ts";
import type { ArmsPalette } from "./palette.ts";

/**
 * Shield geometry: the heater silhouette and the field divisions clipped to it.
 * PURE: all coordinates derive from the shield box, no RNG.
 */

export function n(x: number): number {
  return Math.round(x * 100) / 100;
}

export type Geom = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  half: number;
  x0: number;
  x1: number;
  top: number;
  bottom: number;
};

export function geom(cx: number, cy: number, size: number): Geom {
  const w = size;
  const h = size * 1.18;
  const half = w / 2;
  return {
    cx, cy, w, h, half,
    x0: cx - half,
    x1: cx + half,
    top: cy - h / 2,
    bottom: cy + h / 2,
  };
}

/** Heater shield silhouette: flat top, straight upper sides, curved taper. */
export function shieldPath(g: Geom): string {
  const shoulder = g.top + g.h * 0.46;
  const lower = g.top + g.h * 0.82;
  return (
    `M${n(g.x0)} ${n(g.top)}` +
    `L${n(g.x1)} ${n(g.top)}` +
    `L${n(g.x1)} ${n(shoulder)}` +
    `Q${n(g.x1)} ${n(lower)} ${n(g.cx)} ${n(g.bottom)}` +
    `Q${n(g.x0)} ${n(lower)} ${n(g.x0)} ${n(shoulder)}` +
    `Z`
  );
}

/** Base field plus, for a divided shield, the second tincture's region. All
 *  are clipped to the silhouette, so simple bbox shapes give exact divisions. */
export function fieldNodes(arms: Arms, g: Geom, pal: ArmsPalette): SvgNode[] {
  const base = el("rect", {
    x: n(g.x0), y: n(g.top), width: n(g.w), height: n(g.h),
    fill: pal.tincture(arms.field[0]!),
  });
  if (arms.division === "plain") return [base];
  const t1 = pal.tincture(arms.field[1]!);
  const polygon = (pts: string): SvgNode => el("path", { d: pts + "Z", fill: t1 });
  const P = (x: number, y: number, lead = "L"): string => `${lead}${n(x)} ${n(y)}`;
  switch (arms.division) {
    case "perPale":
      return [base, el("rect", { x: n(g.cx), y: n(g.top), width: n(g.half), height: n(g.h), fill: t1 })];
    case "perFess":
      return [base, el("rect", { x: n(g.x0), y: n(g.cy), width: n(g.w), height: n(g.h / 2), fill: t1 })];
    case "perBend":
      return [base, polygon(P(g.x0, g.top, "M") + P(g.x0, g.bottom) + P(g.x1, g.bottom))];
    case "perChevron":
      return [base, polygon(P(g.cx, g.top + g.h * 0.4, "M") + P(g.x1, g.bottom) + P(g.x0, g.bottom))];
    case "quarterly":
      return [
        base,
        el("rect", { x: n(g.cx), y: n(g.top), width: n(g.half), height: n(g.h / 2), fill: t1 }),
        el("rect", { x: n(g.x0), y: n(g.cy), width: n(g.half), height: n(g.h / 2), fill: t1 }),
      ];
    default:
      return [base];
  }
}
