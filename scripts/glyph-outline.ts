import { join } from "node:path";
import * as fontkit from "fontkit";
import type { GlyphOutline } from "../src/render/favicon.ts";
import { KIT_FONTS } from "./kit-fonts.ts";

export const FELL_SC_WOFF2 = join(KIT_FONTS, "im-fell-english-sc-latin-400-normal.woff2");
export const SMALL_CAP_V = 0x76;

export type FontGlyph = GlyphOutline & {
  readonly familyName: string;
  readonly unitsPerEm: number;
};

export function readGlyphOutline(fontPath: string, codePoint: number): FontGlyph {
  const font = fontkit.openSync(fontPath);
  if (!("glyphForCodePoint" in font)) {
    throw new Error(`${fontPath} is a font collection, not a single face`);
  }
  const glyph = font.glyphForCodePoint(codePoint);
  const { minX, minY, maxX, maxY } = glyph.bbox;
  return {
    path: glyph.path.toSVG(),
    bbox: { minX, minY, maxX, maxY },
    familyName: font.familyName,
    unitsPerEm: font.unitsPerEm,
  };
}
