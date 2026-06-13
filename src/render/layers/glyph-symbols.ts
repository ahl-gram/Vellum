import { el, type SvgNode } from "../svg.ts";
import type { MapStyle } from "../style.ts";

/**
 * Hand-drawn-style glyph symbols, defined in a small local coordinate
 * frame (baseline at y=0) and instanced with <use>. Colors are baked
 * per style since each SVG document carries exactly one style.
 */
export function glyphSymbolDefs(style: MapStyle): SvgNode[] {
  const ink = style.ink;
  const paper = style.land;
  const stroke = (w: number) => ({
    stroke: ink,
    "stroke-width": w,
    "stroke-linecap": "round" as const,
    "stroke-linejoin": "round" as const,
  });

  return [
    // mountains: filled peak occludes what's behind, hatched right flank
    el("symbol", { id: "gl-mtn-1", overflow: "visible" }, [
      el("path", { d: "M-9 0Q-4.5 -4 0 -13Q4.5 -4 9 0Z", fill: paper, ...stroke(1.2) }),
      el("path", { d: "M0 -13L1.6 -8.5M1.2 -6.5L3 -3M2.6 -1.2L4.4 -0.4", fill: "none", ...stroke(0.7) }),
    ]),
    el("symbol", { id: "gl-mtn-2", overflow: "visible" }, [
      el("path", { d: "M-10 0Q-6 -3 -2 -11Q2 -5 4 -7Q7 -3 10 0Z", fill: paper, ...stroke(1.2) }),
      el("path", { d: "M-2 -11L-0.6 -7M0 -5L1.8 -2M5.5 -4.5L7 -1.5", fill: "none", ...stroke(0.7) }),
    ]),
    el("symbol", { id: "gl-mtn-3", overflow: "visible" }, [
      el("path", { d: "M-8 0Q-3 -5 1 -12Q4 -5 8 0Z", fill: paper, ...stroke(1.2) }),
      el("path", { d: "M1 -12L2.2 -7.5M2 -5.5L3.6 -2.2", fill: "none", ...stroke(0.7) }),
    ]),
    // rolling hills
    el("symbol", { id: "gl-hill-1", overflow: "visible" }, [
      el("path", { d: "M-7 0Q0 -7 7 0", fill: paper, ...stroke(1.0) }),
    ]),
    el("symbol", { id: "gl-hill-2", overflow: "visible" }, [
      el("path", { d: "M-8 0Q-3 -6 1 -4Q4 -6 8 0", fill: paper, ...stroke(1.0) }),
    ]),
    // trees
    el("symbol", { id: "gl-tree-round", overflow: "visible" }, [
      el("path", { d: "M0 0L0 -3.4", fill: "none", ...stroke(0.9) }),
      el("path", {
        d: "M-3.4 -5.4Q-3.4 -8.8 0 -8.8Q3.4 -8.8 3.4 -5.4Q3.4 -2.6 0 -3.2Q-3.4 -2.6 -3.4 -5.4Z",
        fill: paper, ...stroke(0.9),
      }),
    ]),
    el("symbol", { id: "gl-tree-pine", overflow: "visible" }, [
      el("path", { d: "M0 0L0 -2", fill: "none", ...stroke(0.9) }),
      el("path", { d: "M-3 -2L0 -9.5L3 -2Z", fill: paper, ...stroke(0.9) }),
    ]),
    el("symbol", { id: "gl-tree-palm", overflow: "visible" }, [
      el("path", { d: "M0 0Q1 -4 0.6 -7", fill: "none", ...stroke(1.0) }),
      el("path", {
        d: "M0.6 -7Q-3.4 -8.4 -5 -6M0.6 -7Q-1.4 -10.4 -3.8 -10.6M0.6 -7Q2.2 -10 5 -9.4M0.6 -7Q4 -7.6 5.6 -5.4",
        fill: "none", ...stroke(0.9),
      }),
    ]),
    // marsh tufts
    el("symbol", { id: "gl-marsh", overflow: "visible" }, [
      el("path", {
        d: "M-6 0H6M-4 -2.4H4M-2 -4.6H2M0 -4.6L0 -7M-1.6 -5L-2.6 -7M1.6 -5L2.6 -7",
        fill: "none", ...stroke(0.8),
      }),
    ]),
    // dunes
    el("symbol", { id: "gl-dune", overflow: "visible" }, [
      el("path", { d: "M-6 0Q-2 -3 2 0M2 -1Q5 -3 7 -1", fill: "none", ...stroke(0.8) }),
    ]),
  ];
}
