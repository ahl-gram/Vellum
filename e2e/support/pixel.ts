// A rendered-pixel strip for suites whose claim is about PAINT (opacity, a glyph showing through), which no hit-test or computed style can see; a row or a rectangle of a Page.captureScreenshot clip, decoded here with node:zlib so the harness takes no image dependency.
import { inflateSync } from "node:zlib";
import { SITE_PALETTE } from "../../src/atlas/palette.ts";

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

export type Rgb = [number, number, number];

export function decodeRows(png: Buffer): Rgb[][] {
  let at = 8;
  let width = 0,
    height = 0,
    channels: number | undefined = 0,
    depth = 0;
  const idat: Buffer[] = [];
  while (at < png.length) {
    const len = png.readUInt32BE(at);
    const type = png.toString("ascii", at + 4, at + 8);
    const data = png.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8]!;
      channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[data[9]!];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    at += 12 + len;
  }
  if (depth !== 8 || !channels)
    throw new Error(`pixel-support decodes 8-bit PNGs only (depth ${depth}, channels ${channels})`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const rows: Rgb[][] = [];
  let above = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    const filter = raw[start];
    const row = Buffer.from(raw.subarray(start + 1, start + 1 + stride));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? row[i - channels]! : 0;
      const b = above[i]!;
      const c = i >= channels ? above[i - channels]! : 0;
      if (filter === 1) row[i] = (row[i]! + a) & 0xff;
      else if (filter === 2) row[i] = (row[i]! + b) & 0xff;
      else if (filter === 3) row[i] = (row[i]! + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) row[i] = (row[i]! + paeth(a, b, c)) & 0xff;
    }
    const px = (i: number, k: number): number => row[i * channels + (channels >= 3 ? k : 0)]!;
    rows.push(Array.from({ length: width }, (_, i): Rgb => [px(i, 0), px(i, 1), px(i, 2)]));
    above = row;
  }
  return rows;
}

export const decodeFirstRow = (png: Buffer): Rgb[] => decodeRows(png)[0]!;

// The clip the browser wants is the page's, not the viewport's, so the scroll is added here (a scrolled page read blank frames until the 2026-09-03 sitting, ruling 6).
export async function sampleRect(
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<Rgb[][]> {
  const s = (await send("Runtime.evaluate", {
    expression: "[window.scrollX, window.scrollY]",
    returnByValue: true,
  })) as { result?: { value?: unknown }; exceptionDetails?: { text?: string } };
  const v = s.result ? s.result.value : undefined;
  if (s.exceptionDetails)
    throw new Error(`sampleRect could not read the page's scroll: ${s.exceptionDetails.text || "exception"}`);
  if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isFinite))
    throw new Error(`sampleRect could not read the page's scroll: ${JSON.stringify(v)}`);
  const [sx, sy] = v as [number, number];
  const r = (await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: x + sx, y: y + sy, width, height, scale: 1 },
  })) as { data: string };
  return decodeRows(Buffer.from(r.data, "base64"));
}

export async function sampleRow(
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>,
  x: number,
  y: number,
  width: number,
): Promise<Rgb[]> {
  return (await sampleRect(send, x, y, width, 1))[0]!;
}

type Picks = (p: Readonly<Rgb>) => boolean;

export const pure =
  (channel: 0 | 1 | 2): Picks =>
  (p) =>
    p.every((v, i) => (i === channel ? v >= 230 : v <= 40));

export const dominant =
  (channel: 0 | 1 | 2): Picks =>
  (p) =>
    p[channel] - Math.max(...p.filter((_, i) => i !== channel)) > 127;

export function centroidOf(
  rows: readonly (readonly Rgb[])[],
  x0: number,
  y0: number,
  is: Picks,
): { n: number; x: number; y: number } | null {
  let n = 0,
    sx = 0,
    sy = 0;
  rows.forEach((row, y) =>
    row.forEach((p, x) => {
      if (!is(p)) return;
      n++;
      sx += x0 + x + 0.5;
      sy += y0 + y + 0.5;
    }),
  );
  return n === 0 ? null : { n, x: sx / n, y: sy / n };
}

export function extentOf(
  rows: readonly (readonly Rgb[])[],
  x0: number,
  y0: number,
  is: Picks,
): { left: number; top: number; right: number; bottom: number } | null {
  let box: { left: number; top: number; right: number; bottom: number } | null = null;
  rows.forEach((row, y) =>
    row.forEach((p, x) => {
      if (!is(p)) return;
      const l = x0 + x,
        t = y0 + y;
      box = box
        ? {
            left: Math.min(box.left, l),
            top: Math.min(box.top, t),
            right: Math.max(box.right, l + 1),
            bottom: Math.max(box.bottom, t + 1),
          }
        : { left: l, top: t, right: l + 1, bottom: t + 1 };
    }),
  );
  return box;
}

export const luminance = ([r, g, b]: readonly [number, number, number]): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export type Registration = { readonly dx: number; readonly dy: number; readonly ncc: number; readonly std: number };

export function registration(a: Rgb[][], b: Rgb[][], search: number): Registration {
  const la = a.map((row) => row.map((p) => luminance(p)));
  const lb = b.map((row) => row.map((p) => luminance(p)));
  const n = la.length - 2 * search;
  const N = n * n;
  let sa = 0;
  let sb = 0;
  let saa = 0;
  let sbb = 0;
  let sab = 0;
  for (let y = search; y < search + n; y++)
    for (let x = search; x < search + n; x++) {
      const p = la[y]![x]!;
      const q = lb[y]![x]!;
      sa += p;
      sb += q;
      saa += p * p;
      sbb += q * q;
      sab += p * q;
    }
  const va = saa - (sa * sa) / N;
  const vb = sbb - (sb * sb) / N;
  return {
    dx: 0,
    dy: 0,
    ncc: va > 0 && vb > 0 ? (sab - (sa * sb) / N) / Math.sqrt(va * vb) : 0,
    std: Math.sqrt(Math.max(0, vb) / N),
  };
}

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
