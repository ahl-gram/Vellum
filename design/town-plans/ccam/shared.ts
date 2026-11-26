// Issue #793 round: parchmentDefs and parchmentOverlay from the archived design/prospects-after-braun-hogenberg/mock/direction-a.ts and shipEngraved from its townscape.ts, copied verbatim so the archived direction C runs at this sha (the archived direction-a.ts imports plateFurniture, which src/prospect/dress/furniture.ts no longer exports).
import { el, type SvgNode } from "../../../src/render/svg.ts";
import type { Rng } from "../../../src/core/rng.ts";
import { PLATE_H, PLATE_W } from "../../../src/prospect/geometry.ts";
import type { Dress } from "./dress.ts";
import { hatchNode, poly, r1, stroke } from "./burin.ts";

export function parchmentDefs(d: Dress, suffix: string, grainSeed: number): SvgNode[] {
  if (!d.style.parchmentTexture) return [];
  const ch = (i: number): string => (parseInt(d.ink.slice(i, i + 2), 16) / 255).toFixed(2);
  return [
    el("filter", { id: `parch-${suffix}`, x: "0%", y: "0%", width: "100%", height: "100%" }, [
      el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012 0.014", numOctaves: 3, seed: grainSeed, stitchTiles: "stitch" }),
      el("feColorMatrix", { values: `0 0 0 0 ${ch(1)}  0 0 0 0 ${ch(3)}  0 0 0 0 ${ch(5)}  0.45 0 0 0 0` }),
    ]),
    el("radialGradient", { id: `vig-${suffix}`, cx: "50%", cy: "48%", r: "72%" }, [
      el("stop", { offset: "62%", "stop-color": d.ink, "stop-opacity": 0 }),
      el("stop", { offset: "100%", "stop-color": d.ink, "stop-opacity": 0.16 }),
    ]),
  ];
}

export function parchmentOverlay(d: Dress, suffix: string): SvgNode[] {
  if (!d.style.parchmentTexture) return [];
  return [
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, filter: `url(#parch-${suffix})`, opacity: 0.5 }),
    el("rect", { x: 0, y: 0, width: PLATE_W, height: PLATE_H, fill: `url(#vig-${suffix})` }),
  ];
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
