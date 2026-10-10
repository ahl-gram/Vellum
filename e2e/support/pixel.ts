// A rendered-pixel strip for suites whose claim is about PAINT (opacity, a glyph showing through), which no hit-test or computed style can see; one row of a Page.captureScreenshot clip, decoded here with node:zlib so the harness takes no image dependency.
import { inflateSync } from "node:zlib";
import { SITE_PALETTE } from "../../src/atlas/palette.ts";

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

// The first row of a PNG, unfiltered against an all-zero row above (there is none).
export function decodeFirstRow(png: Buffer): [number, number, number][] {
  let at = 8;
  let width = 0,
    channels: number | undefined = 0,
    depth = 0;
  const idat: Buffer[] = [];
  while (at < png.length) {
    const len = png.readUInt32BE(at);
    const type = png.toString("ascii", at + 4, at + 8);
    const data = png.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      depth = data[8]!;
      channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[data[9]!];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    at += 12 + len;
  }
  if (depth !== 8 || !channels)
    throw new Error(`pixel-support decodes 8-bit PNGs only (depth ${depth}, channels ${channels})`);
  const raw = inflateSync(Buffer.concat(idat));
  const filter = raw[0];
  const row = Buffer.from(raw.subarray(1, 1 + width * channels));
  for (let i = 0; i < row.length; i++) {
    const left = i >= channels ? row[i - channels]! : 0;
    if (filter === 1) row[i] = (row[i]! + left) & 0xff;
    else if (filter === 3) row[i] = (row[i]! + (left >> 1)) & 0xff;
    else if (filter === 4) row[i] = (row[i]! + paeth(left, 0, 0)) & 0xff;
  }
  const px = (i: number, k: number): number => row[i * channels + (channels >= 3 ? k : 0)]!;
  return Array.from({ length: width }, (_, i): [number, number, number] => [px(i, 0), px(i, 1), px(i, 2)]);
}

// The clip the browser wants is the page's, not the viewport's, so the scroll is added here (a scrolled page read blank frames until the 2026-09-03 sitting, ruling 6).
export async function sampleRow(
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>,
  x: number,
  y: number,
  width: number,
): Promise<[number, number, number][]> {
  const s = (await send("Runtime.evaluate", {
    expression: "[window.scrollX, window.scrollY]",
    returnByValue: true,
  })) as { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  const v = s.result ? s.result.value : undefined;
  if (s.exceptionDetails)
    throw new Error(`sampleRow could not read the page's scroll: ${s.exceptionDetails.text || "exception"}`);
  if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isFinite))
    throw new Error(`sampleRow could not read the page's scroll: ${JSON.stringify(v)}`);
  const [sx, sy] = v as [number, number];
  const r = (await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: x + sx, y: y + sy, width, height: 1, scale: 1 },
  })) as { data: string };
  return decodeFirstRow(Buffer.from(r.data, "base64"));
}

export const luminance = ([r, g, b]: readonly [number, number, number]): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export type Rgba = readonly [number, number, number, number];

// Spliced into a payload: Chromium serialises one token colour as rgb(), color(srgb ...) or oklab(...) by property, so a check compares the channels one canvas pixel reads back; a canvas keeps its last fillStyle for a string it cannot parse, hence the sentinel.
export const PAGE_RGBA = `((css) => { const c = document.createElement("canvas"); c.width = c.height = 1; const x = c.getContext("2d"); x.fillStyle = "#fe01fd"; x.fillStyle = css; if (x.fillStyle === "#fe01fd") throw new Error("not a colour: " + css); x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data]; })`;

// Spliced after PAGE_RGBA, bound as `rgba`: a plain linear gradient's colour stops in order, and none for any other background image.
export const GRADIENT_STOPS = `((image) => /^linear-gradient\\((color|rgba?|oklab)\\(/.test(image) ? (image.match(/(color|rgba?|oklab)\\([^)]*\\)/g) ?? []).map(rgba) : [])`;

// Spliced after PAGE_RGBA, bound as `rgba`: a one-layer box-shadow's colour and its four lengths, null for none; a second layer is no colour, so `rgba` throws on it.
export const SHADE = `((s) => { const m = /^(.+\\)) (-?[\\d.]+px -?[\\d.]+px -?[\\d.]+px -?[\\d.]+px)$/.exec(s); return m ? { colour: rgba(m[1]), geometry: m[2] } : null; })`;

export const tokenRgba = (token: keyof typeof SITE_PALETTE, alpha = 1): Rgba => {
  const hex = SITE_PALETTE[token];
  const channel = (at: number): number => parseInt(hex.slice(at, at + 2), 16);
  return [channel(1), channel(3), channel(5), Math.round(alpha * 255)];
};

export const nearRgba = (got: readonly number[] | null | undefined, want: Rgba, alpha = 3): boolean =>
  !!got && got.length === 4 && got.every((v, i) => Math.abs(v - want[i]!) <= (i === 3 ? alpha : 2));
