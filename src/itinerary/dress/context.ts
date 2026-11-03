import type { MapStyle } from "../../render/style.ts";
import type { DressContext } from "../../prospect/dress/context.ts";

const RIBBON_DRESSES = ["antique", "ink"] as const;
export type RibbonDress = (typeof RIBBON_DRESSES)[number];

export type RibbonPaint = {
  readonly gamboge: string;
  readonly vermilion: string;
  readonly verdigris: string;
  readonly verdigrisWash: string;
  readonly azurite: string;
  readonly azuriteWash: string;
  readonly landWash: string;
  readonly sepia: string;
};

/** Same shape as the prospect's DressContext so its side-on glyphs draw here unchanged; `paint` is the limner's box on the antique dress and null on the plain ink one. */
export type RibbonContext = DressContext & { readonly paint: RibbonPaint | null };

function paintFor(_style: MapStyle): RibbonPaint | null {
  return null;
}

export function ribbonDress(style: MapStyle): RibbonContext {
  if (!(RIBBON_DRESSES as ReadonlyArray<string>).includes(style.name)) {
    throw new RangeError(`ribbons dress in ${RIBBON_DRESSES.join(" or ")}, not ${style.name}`);
  }
  return { style, ink: style.ink, soft: style.inkSoft, paper: style.land, paint: paintFor(style) };
}
