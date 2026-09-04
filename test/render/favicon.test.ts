import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SITE_PALETTE } from "../../src/atlas/palette.ts";
import { svgDimensions } from "../../src/cli/raster.ts";
import {
  buildFavicon,
  buildTouchIcon,
  letterPlacement,
  FAVICON_SIZE,
  TOUCH_ICON_SIZE,
  MARK_NAME,
  PUNCHCUTTER_TILE,
  type GlyphOutline,
} from "../../src/render/favicon.ts";
import { readGlyphOutline, FELL_SC_WOFF2, SMALL_CAP_V } from "../../scripts/glyph-outline.ts";

// The Punchcutter's Mark (#489): the Fell SC small-cap v in parchment on the walnut deep, in a rounded tile with a tan keyline, cut from the shipped woff2 by npm run icons. Rulings 2026-09-03: no favicon.ico, the regen stays manual, fontkit as the reader.

const root = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

const WALNUT = SITE_PALETTE["--chart-ink"];
const TAN = SITE_PALETTE["--line-tan"];
const PARCHMENT = SITE_PALETTE["--parchment"];
const CAP_V = 0x56;

// A stand-in outline in font units whose placement is checkable by hand.
const SQUARE: GlyphOutline = {
  path: "M0 0L1000 0L1000 1000L0 1000Z",
  bbox: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 },
};

const rootTag = (svg: string) => svg.slice(0, svg.indexOf(">") + 1);
const tags = (svg: string, name: string): string[] => [...(svg.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [])];
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const num = (tag: string, name: string) => Number(attr(tag, name));
const near = (a: number, b: number, msg: string) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

test("the favicon root is 32 square and the touch icon 180 square, integer width before height, one viewBox", () => {
  for (const [svg, size] of [
    [buildFavicon(SQUARE), FAVICON_SIZE],
    [buildTouchIcon(SQUARE), TOUCH_ICON_SIZE],
  ] as const) {
    assert.deepEqual(svgDimensions(svg), { width: size, height: size });
    assert.match(rootTag(svg), /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="\d+" viewBox="0 0 32 32"/);
    assert.ok(svg.endsWith("</svg>\n"), "the document ends with a newline");
  }
  assert.equal(FAVICON_SIZE, 32);
  assert.equal(TOUCH_ICON_SIZE, 180);
});

test("the ratified tile geometry, as literals (a changed number regenerates a green drift guard, so the numbers are pinned here)", () => {
  assert.deepEqual(PUNCHCUTTER_TILE, { keyline: 1.5, radius: 6.4, letterWidth: 22.2, hairline: 0.3 });
});

test("the tile is one rounded rect in the walnut deep with the tan keyline, standing inside the viewBox", () => {
  const rects = tags(buildFavicon(SQUARE), "rect");
  assert.equal(rects.length, 1, "the favicon has the tile and no other rect");
  const [tile] = rects;
  assert.equal(attr(tile, "fill"), WALNUT);
  assert.equal(attr(tile, "stroke"), TAN);
  assert.ok(num(tile, "rx") > 0, "the corners are rounded");
  const keyline = num(tile, "stroke-width");
  assert.equal(keyline, PUNCHCUTTER_TILE.keyline);
  assert.ok(keyline > 0);
  const x = num(tile, "x");
  const w = num(tile, "width");
  assert.equal(attr(tile, "y"), attr(tile, "x"));
  assert.equal(attr(tile, "height"), attr(tile, "width"));
  near(x - keyline / 2, 0, "the keyline's outer edge meets the viewBox edge");
  near(x + w + keyline / 2, 32, "the keyline's far edge meets the viewBox edge");
});

test("the letter is the outline verbatim, filled parchment, its hairline the same ink, and no fourth colour", () => {
  const svg = buildFavicon(SQUARE);
  const paths = tags(svg, "path");
  assert.equal(paths.length, 1);
  const [letter] = paths;
  assert.equal(attr(letter, "d"), SQUARE.path);
  assert.equal(attr(letter, "fill"), PARCHMENT);
  assert.equal(attr(letter, "stroke"), PARCHMENT);
  assert.ok(num(letter, "stroke-width") > 0, "the hairline fattens the thin stroke at 16px");
  assert.deepEqual(new Set(svg.match(/#[0-9a-f]{6}/g)), new Set([WALNUT, TAN, PARCHMENT]));
});

test("the glyph bbox is scaled to the ratified width and centred in the tile, font y up flipped to SVG y down", () => {
  const p = letterPlacement(SQUARE, PUNCHCUTTER_TILE);
  const { minX, maxX, minY, maxY } = SQUARE.bbox;
  const left = p.tx + p.scale * minX;
  const right = p.tx + p.scale * maxX;
  const top = p.ty - p.scale * maxY;
  const bottom = p.ty - p.scale * minY;
  near(right - left, PUNCHCUTTER_TILE.letterWidth, "the bbox width is the ratified letter width");
  near((left + right) / 2, 16, "centred across");
  near((top + bottom) / 2, 16, "centred down");
  const inner = PUNCHCUTTER_TILE.keyline;
  assert.ok(left > inner && right < 32 - inner && top > inner && bottom < 32 - inner, "the letter clears the keyline");

  const [letter] = tags(buildFavicon(SQUARE), "path");
  assert.equal(attr(letter, "transform"), `translate(${p.tx} ${p.ty}) scale(${p.scale} -${p.scale})`);
});

test("the hairline is drawn in font units so it scales with the letter to the ratified tile width", () => {
  const p = letterPlacement(SQUARE, PUNCHCUTTER_TILE);
  const [letter] = tags(buildFavicon(SQUARE), "path");
  const drawn = num(letter, "stroke-width") * p.scale;
  assert.ok(Math.abs(drawn - PUNCHCUTTER_TILE.hairline) < 1e-3, `stroke-width times scale is the hairline to its 3-decimal rounding: ${drawn}`);
  assert.equal(attr(letter, "stroke-linejoin"), "round");
});

test("one self-grounded file: no media query, no style block, nothing for the chrome to supply", () => {
  for (const svg of [buildFavicon(SQUARE), buildTouchIcon(SQUARE)]) {
    assert.doesNotMatch(svg, /@media|prefers-color-scheme|<style|currentColor/);
  }
});

test("the root names the mark for assistive tech", () => {
  for (const svg of [buildFavicon(SQUARE), buildTouchIcon(SQUARE)]) {
    assert.equal(attr(rootTag(svg), "role"), "img");
    assert.equal(attr(rootTag(svg), "aria-label"), MARK_NAME.replace("'", "&apos;"));
    assert.match(svg, new RegExp(`<title>${MARK_NAME.replace("'", "&apos;")}</title>`));
    assert.ok(MARK_NAME.includes("Vellum"));
  }
});

test("the touch icon is the favicon's markup on a full-bleed walnut ground, the root resized", () => {
  const favicon = buildFavicon(SQUARE);
  const touch = buildTouchIcon(SQUARE);
  const [ground, ...rest] = tags(touch, "rect");
  assert.equal(rest.length, 1, "the ground plus the tile");
  assert.equal(attr(ground, "width"), "32");
  assert.equal(attr(ground, "height"), "32");
  assert.equal(attr(ground, "fill"), WALNUT);
  assert.equal(attr(ground, "stroke"), undefined);
  const body = (svg: string) => svg.slice(svg.indexOf(">") + 1);
  assert.equal(body(touch).replace(`${ground}\n`, ""), body(favicon), "everything under the root is the favicon's, ground aside");
});

test("the shipped Fell SC small-cap v: the face, the em, the bbox, and squarer than the cap", () => {
  const small = readGlyphOutline(FELL_SC_WOFF2, SMALL_CAP_V);
  assert.equal(small.familyName, "IM FELL English SC");
  assert.equal(small.unitsPerEm, 2048);
  assert.deepEqual(small.bbox, { minX: 0, minY: -24, maxX: 930, maxY: 901 });
  assert.match(small.path, /^M[-\d. LQZ]+$/, "absolute M/L/Q/Z commands in font units");
  const cap = readGlyphOutline(FELL_SC_WOFF2, CAP_V);
  const aspect = (g: GlyphOutline) => (g.bbox.maxX - g.bbox.minX) / (g.bbox.maxY - g.bbox.minY);
  assert.ok(aspect(small) > aspect(cap), `the small cap is the wider letter for its size: ${aspect(small)} vs ${aspect(cap)}`);
});

test("public/favicon.svg is byte for byte what npm run icons cuts from the shipped woff2 (the drift guard)", () => {
  const glyph = readGlyphOutline(FELL_SC_WOFF2, SMALL_CAP_V);
  assert.equal(readFileSync(root("public/favicon.svg"), "utf8"), buildFavicon(glyph));
});

test("public/apple-touch-icon.png is a committed 180x180 PNG", () => {
  const png = root("public/apple-touch-icon.png");
  assert.ok(existsSync(png), "public/apple-touch-icon.png should be committed");
  const bytes = readFileSync(png);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.subarray(12, 16).toString("latin1"), "IHDR");
  assert.equal(bytes.readUInt32BE(16), TOUCH_ICON_SIZE);
  assert.equal(bytes.readUInt32BE(20), TOUCH_ICON_SIZE);
});
