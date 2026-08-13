/** paper is style.land (the chart's glyph-fill convention); every color here must be a render/style.ts token. */

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

/** Round to 0.1 px at emit only; upstream geometry stays unrounded for groundingViolations' exact equality. */
export const r1 = (v: number): number => Math.round(v * 10) / 10;

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
