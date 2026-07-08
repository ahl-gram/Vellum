import { el, type SvgNode } from "../../svg.ts";
import type {
  Arms,
  MobileCharge,
  Ordinary,
} from "../../../society/heraldry.ts";
import type { ArmsPalette } from "./palette.ts";
import { n, type Geom } from "./geom.ts";

/**
 * Ordinaries and mobile charges: the device borne on the field. PURE: all
 * geometry derives from the shield box / charge center, no RNG.
 */

/** Ordinaries are bold bands; drawn as thick clipped strokes that read as
 *  reaching the shield edge. */
function ordinaryNode(ord: Ordinary, g: Geom, fill: string): SvgNode {
  const bw = g.w * 0.2;
  const common = {
    fill: "none", stroke: fill, "stroke-width": n(bw),
    "stroke-linejoin": "round" as const,
  };
  switch (ord) {
    case "pale":
      return el("path", { d: `M${n(g.cx)} ${n(g.top)}L${n(g.cx)} ${n(g.bottom)}`, ...common });
    case "fess":
      return el("path", { d: `M${n(g.x0)} ${n(g.cy)}L${n(g.x1)} ${n(g.cy)}`, ...common });
    case "cross":
      return el("path", {
        d: `M${n(g.cx)} ${n(g.top)}L${n(g.cx)} ${n(g.bottom)}M${n(g.x0)} ${n(g.cy)}L${n(g.x1)} ${n(g.cy)}`,
        ...common, "stroke-width": n(g.w * 0.16),
      });
    case "bend":
      return el("path", { d: `M${n(g.x0)} ${n(g.top)}L${n(g.x1)} ${n(g.bottom)}`, ...common });
    case "chevron":
      return el("path", {
        d: `M${n(g.x0)} ${n(g.bottom - g.h * 0.08)}L${n(g.cx)} ${n(g.cy - g.h * 0.04)}L${n(g.x1)} ${n(g.bottom - g.h * 0.08)}`,
        ...common,
      });
  }
}

/** A culture charge centered at (X, Y) within radius R, in tincture `fill`. */
function chargeGlyph(
  charge: MobileCharge,
  X: number,
  Y: number,
  R: number,
  fill: string,
  outline: string,
): SvgNode {
  const sw = n(R * 0.16);
  const line = { fill: "none", stroke: fill, "stroke-width": sw, "stroke-linecap": "round" as const, "stroke-linejoin": "round" as const };
  const solid = { fill, stroke: outline, "stroke-width": n(R * 0.05), "stroke-linejoin": "round" as const };
  const kids: Array<SvgNode> = [];
  const M = (x: number, y: number) => `M${n(x)} ${n(y)}`;
  const L = (x: number, y: number) => `L${n(x)} ${n(y)}`;
  const Q = (cx: number, cy: number, x: number, y: number) => `Q${n(cx)} ${n(cy)} ${n(x)} ${n(y)}`;

  switch (charge) {
    case "ship":
      kids.push(el("path", { d: M(X - R, Y + R * 0.2) + Q(X, Y + R, X + R, Y + R * 0.2) + "Z", ...solid }));
      kids.push(el("path", { d: M(X, Y + R * 0.2) + L(X, Y - R), ...line }));
      kids.push(el("path", { d: M(X, Y - R * 0.9) + L(X + R * 0.7, Y) + L(X, Y) + "Z", ...solid }));
      break;
    case "anchor":
      kids.push(el("circle", { cx: n(X), cy: n(Y - R * 0.78), r: n(R * 0.2), fill: "none", stroke: fill, "stroke-width": sw }));
      kids.push(el("path", { d: M(X, Y - R * 0.58) + L(X, Y + R * 0.75), ...line }));
      kids.push(el("path", { d: M(X - R * 0.45, Y - R * 0.35) + L(X + R * 0.45, Y - R * 0.35), ...line }));
      kids.push(el("path", { d: M(X, Y + R * 0.75) + Q(X - R * 0.8, Y + R * 0.7, X - R * 0.55, Y + R * 0.2), ...line }));
      kids.push(el("path", { d: M(X, Y + R * 0.75) + Q(X + R * 0.8, Y + R * 0.7, X + R * 0.55, Y + R * 0.2), ...line }));
      break;
    case "trident":
      kids.push(el("path", { d: M(X, Y - R * 0.2) + L(X, Y + R * 0.95), ...line }));
      kids.push(el("path", {
        d: M(X - R * 0.5, Y - R * 0.15) + L(X - R * 0.5, Y - R * 0.8) +
          M(X, Y - R * 0.15) + L(X, Y - R * 0.95) +
          M(X + R * 0.5, Y - R * 0.15) + L(X + R * 0.5, Y - R * 0.8) +
          M(X - R * 0.5, Y - R * 0.15) + L(X + R * 0.5, Y - R * 0.15),
        ...line,
      }));
      break;
    case "axe":
      kids.push(el("path", { d: M(X - R * 0.4, Y + R * 0.9) + L(X + R * 0.25, Y - R * 0.9), ...line }));
      kids.push(el("path", { d: M(X + R * 0.1, Y - R * 0.9) + Q(X + R, Y - R * 0.45, X + R * 0.45, Y - R * 0.05) + "Z", ...solid }));
      break;
    case "raven":
      // a perched corvid in profile facing dexter: stout beak, wedge tail, two legs
      kids.push(el("path", {
        d: M(X - R * 0.66, Y - R * 0.16) + // upper beak base / brow
          Q(X - R * 0.34, Y - R * 0.52, X + R * 0.06, Y - R * 0.44) + // crown to nape
          Q(X + R * 0.6, Y - R * 0.32, X + R * 0.98, Y + R * 0.06) + // back down to tail root
          L(X + R * 0.78, Y + R * 0.16) + // tail upper notch
          L(X + R, Y + R * 0.46) + // wedge tail tip
          L(X + R * 0.6, Y + R * 0.34) + // tail lower notch
          Q(X + R * 0.2, Y + R * 0.5, X - R * 0.16, Y + R * 0.34) + // belly
          Q(X - R * 0.5, Y + R * 0.2, X - R * 0.5, Y - R * 0.08) + // breast to throat
          L(X - R, Y - R * 0.02) + // beak underside
          L(X - R * 0.66, Y - R * 0.16) + "Z", // beak top back to brow
        ...solid,
      }));
      kids.push(el("circle", { cx: n(X - R * 0.42), cy: n(Y - R * 0.2), r: n(R * 0.07), fill: outline }));
      kids.push(el("path", {
        d: M(X - R * 0.02, Y + R * 0.4) + L(X - R * 0.02, Y + R * 0.72) +
          M(X + R * 0.22, Y + R * 0.42) + L(X + R * 0.22, Y + R * 0.72),
        fill: "none", stroke: fill, "stroke-width": n(R * 0.07), "stroke-linecap": "round",
      }));
      break;
    case "mountain":
      kids.push(el("path", { d: M(X - R, Y + R * 0.6) + L(X - R * 0.2, Y - R * 0.5) + L(X + R * 0.35, Y + R * 0.6) + "Z", ...solid }));
      kids.push(el("path", { d: M(X - R * 0.15, Y + R * 0.6) + L(X + R * 0.45, Y - R * 0.85) + L(X + R, Y + R * 0.6) + "Z", ...solid }));
      break;
    case "sun": {
      kids.push(el("circle", { cx: n(X), cy: n(Y), r: n(R * 0.42), ...solid }));
      let rays = "";
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        const a2 = a + Math.PI / 16;
        const a3 = a - Math.PI / 16;
        rays += M(X + Math.cos(a) * R, Y + Math.sin(a) * R) +
          L(X + Math.cos(a2) * R * 0.5, Y + Math.sin(a2) * R * 0.5) +
          L(X + Math.cos(a3) * R * 0.5, Y + Math.sin(a3) * R * 0.5) + "Z";
      }
      kids.push(el("path", { d: rays, ...solid }));
      break;
    }
    case "crescent":
      kids.push(el("path", {
        d: M(X + R * 0.25, Y - R * 0.92) +
          `A${n(R)} ${n(R)} 0 1 0 ${n(X + R * 0.25)} ${n(Y + R * 0.92)}` +
          `A${n(R * 0.78)} ${n(R * 0.78)} 0 1 1 ${n(X + R * 0.25)} ${n(Y - R * 0.92)}Z`,
        ...solid,
      }));
      break;
    case "scimitar":
      // a curved sabre: grip + pommel + crossguard below a broad blade that curves
      // up and widens to a pointed tip — unmistakably curved, unlike the straight sword
      kids.push(el("path", { d: M(X - R * 0.32, Y + R * 0.95) + L(X - R * 0.12, Y + R * 0.5), ...line, "stroke-width": n(R * 0.12) }));
      kids.push(el("circle", { cx: n(X - R * 0.34), cy: n(Y + R * 0.98), r: n(R * 0.1), fill }));
      kids.push(el("path", { d: M(X - R * 0.42, Y + R * 0.52) + Q(X - R * 0.1, Y + R * 0.34, X + R * 0.3, Y + R * 0.5), ...line, "stroke-width": n(R * 0.1) }));
      kids.push(el("path", {
        d: M(X - R * 0.16, Y + R * 0.46) +
          Q(X - R * 0.3, Y - R * 0.15, X - R * 0.05, Y - R * 0.62) + // spine up
          Q(X + R * 0.2, Y - R * 1.02, X + R * 0.62, Y - R * 0.82) + // to curling tip
          Q(X + R * 0.34, Y - R * 0.66, X + R * 0.16, Y - R * 0.44) + // yelman underside
          Q(X - R * 0.02, Y - R * 0.12, X + R * 0.06, Y + R * 0.46) + "Z", // cutting edge to hilt
        ...solid,
      }));
      break;
    case "oak":
      kids.push(el("rect", { x: n(X - R * 0.12), y: n(Y + R * 0.05), width: n(R * 0.24), height: n(R * 0.85), fill, stroke: outline, "stroke-width": n(R * 0.05) }));
      kids.push(el("circle", { cx: n(X), cy: n(Y - R * 0.4), r: n(R * 0.5), ...solid }));
      kids.push(el("circle", { cx: n(X - R * 0.45), cy: n(Y - R * 0.02), r: n(R * 0.4), ...solid }));
      kids.push(el("circle", { cx: n(X + R * 0.45), cy: n(Y - R * 0.02), r: n(R * 0.4), ...solid }));
      break;
    case "leaf":
      kids.push(el("path", { d: M(X, Y - R) + Q(X + R * 0.72, Y, X, Y + R) + Q(X - R * 0.72, Y, X, Y - R) + "Z", ...solid }));
      kids.push(el("path", { d: M(X, Y - R * 0.8) + L(X, Y + R * 0.8), ...line, "stroke-width": n(R * 0.08), stroke: outline }));
      break;
    case "star": {
      let d = "";
      for (let k = 0; k < 5; k++) {
        const ao = (-Math.PI / 2) + (k * 2 * Math.PI) / 5;
        const ai = ao + Math.PI / 5;
        d += (k === 0 ? "M" : "L") + `${n(X + Math.cos(ao) * R)} ${n(Y + Math.sin(ao) * R)}`;
        d += `L${n(X + Math.cos(ai) * R * 0.42)} ${n(Y + Math.sin(ai) * R * 0.42)}`;
      }
      kids.push(el("path", { d: d + "Z", ...solid }));
      break;
    }
    case "wave":
      for (const dy of [-R * 0.45, R * 0.05, R * 0.55]) {
        kids.push(el("path", {
          d: M(X - R, Y + dy) + Q(X - R * 0.5, Y + dy - R * 0.3, X, Y + dy) + Q(X + R * 0.5, Y + dy + R * 0.3, X + R, Y + dy),
          ...line, "stroke-width": n(R * 0.13),
        }));
      }
      break;
    case "fish":
      kids.push(el("path", { d: M(X - R * 0.8, Y) + Q(X, Y - R * 0.6, X + R * 0.5, Y) + Q(X, Y + R * 0.6, X - R * 0.8, Y) + "Z", ...solid }));
      kids.push(el("path", { d: M(X + R * 0.4, Y) + L(X + R, Y - R * 0.42) + L(X + R, Y + R * 0.42) + "Z", ...solid }));
      kids.push(el("circle", { cx: n(X - R * 0.45), cy: n(Y - R * 0.08), r: n(R * 0.08), fill: outline }));
      break;
    case "turtle":
      kids.push(el("ellipse", { cx: n(X - R * 0.1), cy: n(Y), rx: n(R * 0.7), ry: n(R * 0.55), ...solid }));
      kids.push(el("circle", { cx: n(X + R * 0.78), cy: n(Y), r: n(R * 0.2), ...solid }));
      for (const [dx, dy] of [[-0.5, -0.55], [0.45, -0.55], [-0.5, 0.55], [0.45, 0.55]] as const) {
        kids.push(el("ellipse", { cx: n(X + R * dx), cy: n(Y + R * dy), rx: n(R * 0.2), ry: n(R * 0.13), fill }));
      }
      break;
    case "tower":
      kids.push(el("rect", { x: n(X - R * 0.55), y: n(Y - R * 0.35), width: n(R * 1.1), height: n(R * 1.25), ...solid }));
      for (const dx of [-0.5, -0.1, 0.3]) {
        kids.push(el("rect", { x: n(X + R * dx), y: n(Y - R * 0.62), width: n(R * 0.28), height: n(R * 0.3), fill }));
      }
      kids.push(el("rect", { x: n(X - R * 0.18), y: n(Y + R * 0.4), width: n(R * 0.36), height: n(R * 0.5), fill: outline }));
      break;
    case "sword":
      kids.push(el("path", { d: M(X, Y - R) + L(X + R * 0.15, Y + R * 0.35) + L(X - R * 0.15, Y + R * 0.35) + "Z", ...solid }));
      kids.push(el("rect", { x: n(X - R * 0.5), y: n(Y + R * 0.35), width: n(R), height: n(R * 0.16), fill }));
      kids.push(el("path", { d: M(X, Y + R * 0.5) + L(X, Y + R * 0.9), ...line }));
      break;
    case "flame":
      // an asymmetric fire: a rounded base rising to a tall central tongue with a
      // shorter tongue to each side — distinct from the symmetric `leaf` almond
      kids.push(el("path", {
        d: M(X, Y + R * 0.92) +
          Q(X - R * 0.6, Y + R * 0.55, X - R * 0.46, Y) + // left base bulge
          Q(X - R * 0.38, Y - R * 0.42, X - R * 0.12, Y - R * 0.5) + // up to left tongue root
          Q(X - R * 0.34, Y - R * 0.82, X - R * 0.14, Y - R * 0.66) + // left tongue
          Q(X - R * 0.12, Y - R * 0.8, X + R * 0.02, Y - R) + // notch then central tongue (tall)
          Q(X + R * 0.12, Y - R * 0.72, X + R * 0.2, Y - R * 0.5) + // notch to right tongue root
          Q(X + R * 0.44, Y - R * 0.66, X + R * 0.34, Y - R * 0.32) + // right tongue
          Q(X + R * 0.56, Y, X + R * 0.46, Y + R * 0.4) + // right base bulge
          Q(X + R * 0.34, Y + R * 0.78, X, Y + R * 0.92) + "Z",
        ...solid,
      }));
      kids.push(el("path", {
        d: M(X, Y + R * 0.66) + Q(X - R * 0.3, Y + R * 0.3, X - R * 0.12, Y - R * 0.12) +
          Q(X - R * 0.06, Y - R * 0.4, X + R * 0.06, Y - R * 0.55) +
          Q(X + R * 0.04, Y - R * 0.2, X + R * 0.18, Y + R * 0.02) +
          Q(X + R * 0.3, Y + R * 0.42, X, Y + R * 0.66) + "Z",
        fill: outline, "fill-opacity": 0.22,
      }));
      break;
  }
  return el("g", {}, kids);
}

export function chargeNodes(arms: Arms, g: Geom, pal: ArmsPalette): SvgNode[] {
  if (arms.charge === null) return [];
  if (arms.charge.kind === "ordinary") {
    return [ordinaryNode(arms.charge.ordinary, g, pal.tincture(arms.charge.tincture))];
  }
  const X = g.cx;
  const Y = g.cy - g.h * 0.02;
  const R = g.w * 0.34;
  return [chargeGlyph(arms.charge.charge, X, Y, R, pal.tincture(arms.charge.tincture), pal.outline)];
}
