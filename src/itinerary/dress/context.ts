import type { MapStyle } from "../../render/style.ts";
import type { DressContext } from "../../prospect/dress/context.ts";

export const RIBBON_DRESSES = ["antique", "ink"] as const;
export type RibbonDress = (typeof RIBBON_DRESSES)[number];

/** Same shape as the prospect's DressContext so its side-on glyphs draw here unchanged. */
export function ribbonDress(style: MapStyle): DressContext {
  if (!(RIBBON_DRESSES as ReadonlyArray<string>).includes(style.name)) {
    throw new RangeError(`ribbons dress in ${RIBBON_DRESSES.join(" or ")}, not ${style.name}`);
  }
  return { style, ink: style.ink, soft: style.inkSoft, paper: style.land };
}
