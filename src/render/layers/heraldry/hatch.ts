import { el, type SvgNode } from "../../svg.ts";
import type { Tincture } from "../../../society/heraldry.ts";
import { n } from "./geom.ts";

/**
 * Petra Sancta tincture hatching (Silvestro de Petra Sancta, 1638): the engraving
 * convention that denotes a tincture by a mark pattern rather than colour, still
 * used by engravers today. It lets the monochrome `ink` style read like a period
 * engraving instead of a flat grey value-ladder where gules/vert and azure/purpure
 * are indistinguishable.
 *
 *   argent   plain paper            or       seme of dots (points)
 *   azure    horizontal lines       gules    vertical lines
 *   sable    crosshatch             vert     "\" from dexter chief  (top-left to base)
 *   purpure  "/" from sinister chief (top-right to base)
 *
 * PURE: all geometry derives from the shield width; every pattern id is scoped by
 * the caller's idSuffix so many arms share one document (the on-map
 * `--style ink --arms` path) with no pattern-id collisions. Each tile opens with an
 * opaque paper rect so a lower field never bleeds through a divided overlay's gaps
 * and terrain never shows through an on-map shield.
 */

type Mark = "plain" | "dots" | "horizontal" | "vertical" | "crosshatch" | "bend" | "bendSinister";

const MARK: Record<Tincture, Mark> = {
  argent: "plain", // metal
  or: "dots", // metal
  azure: "horizontal",
  gules: "vertical",
  sable: "crosshatch",
  vert: "bend",
  purpure: "bendSinister",
};

export type HatchScheme = {
  /** <pattern> defs for the given field tinctures, scaled to width `w`, ids scoped by `suffix`. */
  defs(tinctures: Iterable<Tincture>, w: number, suffix: string): SvgNode[];
  /** The fill value ("url(#…)") for a hatched field region of tincture `t`. */
  fill(t: Tincture, suffix: string): string;
};

function hatchId(t: Tincture, suffix: string): string {
  return `hatch-${t}-${suffix}`;
}

/** One <pattern> tile for a tincture on a `paper` ground drawn in `ink`. */
function tile(t: Tincture, w: number, suffix: string, paper: string, ink: string): SvgNode {
  const id = hatchId(t, suffix);
  const s = n(w * 0.13); // line spacing / tile size
  const sw = n(w * 0.02); // line weight
  const base = (size: number): SvgNode => el("rect", { x: 0, y: 0, width: size, height: size, fill: paper });
  const line = (d: string): SvgNode => el("path", { d, fill: "none", stroke: ink, "stroke-width": sw });
  const attrs = { id, patternUnits: "userSpaceOnUse", width: s, height: s };
  switch (MARK[t]) {
    case "plain":
      return el("pattern", attrs, [base(s)]);
    case "dots":
      return el("pattern", attrs, [base(s), el("circle", { cx: n(s / 2), cy: n(s / 2), r: n(w * 0.022), fill: ink })]);
    case "horizontal":
      return el("pattern", attrs, [base(s), line(`M0 ${n(s / 2)}H${s}`)]);
    case "vertical":
      return el("pattern", attrs, [base(s), line(`M${n(s / 2)} 0V${s}`)]);
    case "crosshatch": {
      const d = n(w * 0.09); // denser than the single-line tinctures so sable stays darkest
      return el("pattern", { id, patternUnits: "userSpaceOnUse", width: d, height: d }, [
        base(d),
        el("path", { d: `M0 ${n(d / 2)}H${d}`, fill: "none", stroke: ink, "stroke-width": sw }),
        el("path", { d: `M${n(d / 2)} 0V${d}`, fill: "none", stroke: ink, "stroke-width": sw }),
      ]);
    }
    case "bend": // "\": the main corner-to-corner line tiles seamlessly; two neighbours fill the corners
      return el("pattern", attrs, [base(s), line(`M0 0L${s} ${s}`), line(`M${n(-s)} 0L0 ${s}`), line(`M0 ${n(-s)}L${s} 0`)]);
    case "bendSinister": // "/"
      return el("pattern", attrs, [base(s), line(`M0 ${s}L${s} 0`), line(`M0 0L${n(-s)} ${s}`), line(`M${s} ${s}L${n(2 * s)} 0`)]);
  }
}

/** The ink style's hatching, closing over its paper ground and ink colour. */
export function inkHatch(paper: string, ink: string): HatchScheme {
  return {
    defs(tinctures, w, suffix) {
      const seen = new Set<Tincture>();
      const out: SvgNode[] = [];
      for (const t of tinctures) {
        if (seen.has(t)) continue;
        seen.add(t);
        out.push(tile(t, w, suffix, paper, ink));
      }
      return out;
    },
    fill: (t, suffix) => `url(#${hatchId(t, suffix)})`,
  };
}
