/**
 * The dress context (#240): which dresses a prospect may wear, and the ink
 * shorthand every dress module draws with. The two-dress contract is the
 * 2026-08-09 ratification on #229 (mirrored on #240): prospects render in
 * antique and ink only; topographic and nautical are out of the epic's
 * scope. Sub 5's fallback rule maps every dropped chart style to antique.
 *
 * Every color here is a render/style.ts token; if a value is not a token,
 * it is a bug (#240 acceptance). `paper` is style.land, the building/glyph
 * fill, per the chart's glyph-symbols.ts convention the spike quoted.
 */

import type { MapStyle } from "../../render/style.ts";

export const PROSPECT_DRESSES = ["antique", "ink"] as const;
export type ProspectDress = (typeof PROSPECT_DRESSES)[number];

export type DressContext = {
  readonly style: MapStyle;
  readonly ink: string;
  readonly soft: string;
  readonly paper: string;
};

export function dressContext(style: MapStyle): DressContext {
  if (!(PROSPECT_DRESSES as ReadonlyArray<string>).includes(style.name)) {
    throw new RangeError(
      `prospects dress in ${PROSPECT_DRESSES.join(" or ")}, not ${style.name} (#229, 2026-08-09)`,
    );
  }
  return { style, ink: style.ink, soft: style.inkSoft, paper: style.land };
}

/** Round to 0.1 px at SVG emit; geometry stays unrounded upstream so
 * groundingViolations keeps its exact equality (geometry.ts contract). */
export const r1 = (v: number): number => Math.round(v * 10) / 10;

/** The shared stroke shorthand, always the style's full ink. */
export function stroke(
  c: DressContext,
  w: number,
): Record<string, string | number> {
  return {
    stroke: c.ink,
    "stroke-width": w,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };
}
