import { SITE_PALETTE } from "../atlas/palette.ts";
import { escapeXml } from "./svg.ts";

export type GlyphBox = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

/** A glyph outline as fontkit hands it over: absolute SVG path data in font units, y up. */
export type GlyphOutline = {
  readonly path: string;
  readonly bbox: GlyphBox;
};

/** In viewBox units, 32 across; the hairline fattens the thin stroke so it survives 16px. */
export type TileGeometry = {
  readonly keyline: number;
  readonly radius: number;
  readonly letterWidth: number;
  readonly hairline: number;
};

export type LetterPlacement = {
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
};

export const FAVICON_SIZE = 32;
export const TOUCH_ICON_SIZE = 180;
export const MARK_NAME = "Vellum, the Punchcutter's Mark";
export const TILE_FILL = SITE_PALETTE["--chart-ink"];
export const TILE_KEYLINE = SITE_PALETTE["--line-tan"];
export const LETTER_FILL = SITE_PALETTE["--parchment"];

export const PUNCHCUTTER_TILE: TileGeometry = {
  keyline: 1.5,
  radius: 6.4,
  letterWidth: 22.2,
  hairline: 0.3,
};

const XMLNS = "http://www.w3.org/2000/svg";

const round = (n: number, places: number): number => Number(n.toFixed(places));

export function letterPlacement(glyph: GlyphOutline, geometry: TileGeometry): LetterPlacement {
  const { minX, minY, maxX, maxY } = glyph.bbox;
  if (!(maxX > minX) || !(maxY > minY)) throw new RangeError("the glyph outline has no extent");
  const scale = round(geometry.letterWidth / (maxX - minX), 5);
  const centre = FAVICON_SIZE / 2;
  return {
    scale,
    tx: round(centre - (scale * (minX + maxX)) / 2, 3),
    ty: round(centre + (scale * (minY + maxY)) / 2, 3),
  };
}

function tileRect(geometry: TileGeometry): string {
  const inset = geometry.keyline / 2;
  const side = FAVICON_SIZE - geometry.keyline;
  return (
    `<rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${geometry.radius}"` +
    ` fill="${TILE_FILL}" stroke="${TILE_KEYLINE}" stroke-width="${geometry.keyline}"/>`
  );
}

function letterPath(glyph: GlyphOutline, geometry: TileGeometry): string {
  const { scale, tx, ty } = letterPlacement(glyph, geometry);
  const hairline = round(geometry.hairline / scale, 3);
  return (
    `<path fill="${LETTER_FILL}" stroke="${LETTER_FILL}" stroke-width="${hairline}" stroke-linejoin="round"` +
    ` transform="translate(${tx} ${ty}) scale(${scale} -${scale})" d="${glyph.path}"/>`
  );
}

function markDocument(size: number, ground: string | null, glyph: GlyphOutline, geometry: TileGeometry): string {
  const name = escapeXml(MARK_NAME);
  const lines = [
    `<svg xmlns="${XMLNS}" width="${size}" height="${size}" viewBox="0 0 ${FAVICON_SIZE} ${FAVICON_SIZE}" role="img" aria-label="${name}">`,
    `<title>${name}</title>`,
    ...(ground === null ? [] : [ground]),
    tileRect(geometry),
    letterPath(glyph, geometry),
    "</svg>",
  ];
  return lines.join("\n") + "\n";
}

export function buildFavicon(glyph: GlyphOutline, geometry: TileGeometry = PUNCHCUTTER_TILE): string {
  return markDocument(FAVICON_SIZE, null, glyph, geometry);
}

export function buildTouchIcon(glyph: GlyphOutline, geometry: TileGeometry = PUNCHCUTTER_TILE): string {
  const ground = `<rect width="${FAVICON_SIZE}" height="${FAVICON_SIZE}" fill="${TILE_FILL}"/>`;
  return markDocument(TOUCH_ICON_SIZE, ground, glyph, geometry);
}
