// A minimal PNG reader for pixel assertions on committed rasters (8-bit RGB or RGBA, non-interlaced); lives outside test/ so node --test does not collect it as a test file.

import { inflateSync } from "node:zlib";

export type Rgb = readonly [number, number, number];

export type DecodedPng = {
  readonly width: number;
  readonly height: number;
  readonly pixel: (x: number, y: number) => Rgb;
};

const SIGNATURE = "89504e470d0a1a0a";
const CHANNELS: Readonly<Record<number, number>> = { 2: 3, 6: 4 };

type Chunk = { readonly type: string; readonly data: Buffer };

function chunks(bytes: Buffer): ReadonlyArray<Chunk> {
  const out: Chunk[] = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("latin1");
    out.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return out;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function predictor(filter: number, a: number, b: number, c: number): number {
  switch (filter) {
    case 0: return 0;
    case 1: return a;
    case 2: return b;
    case 3: return (a + b) >> 1;
    case 4: return paeth(a, b, c);
    default: throw new Error(`unknown PNG filter type ${filter}`);
  }
}

function unfilter(raw: Buffer, width: number, height: number, bpp: number): Uint8Array {
  const stride = width * bpp;
  const out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)] ?? 0;
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? (out[dst + i - bpp] ?? 0) : 0;
      const b = y > 0 ? (out[dst - stride + i] ?? 0) : 0;
      const c = y > 0 && i >= bpp ? (out[dst - stride + i - bpp] ?? 0) : 0;
      out[dst + i] = ((raw[src + i] ?? 0) + predictor(filter, a, b, c)) & 0xff;
    }
  }
  return out;
}

export function decodePng(bytes: Buffer): DecodedPng {
  if (bytes.subarray(0, 8).toString("hex") !== SIGNATURE) throw new Error("not a PNG");
  const list = chunks(bytes);
  const ihdr = list.find((c) => c.type === "IHDR");
  if (!ihdr) throw new Error("PNG has no IHDR");
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data[8];
  const colorType = ihdr.data[9] ?? -1;
  const interlace = ihdr.data[12];
  const bpp = CHANNELS[colorType];
  if (bitDepth !== 8 || bpp === undefined || interlace !== 0) {
    throw new Error(`unsupported PNG: bit depth ${bitDepth}, colour type ${colorType}, interlace ${interlace}`);
  }
  const idat = Buffer.concat(list.filter((c) => c.type === "IDAT").map((c) => c.data));
  const pixels = unfilter(inflateSync(idat), width, height, bpp);
  const pixel = (x: number, y: number): Rgb => {
    if (x < 0 || y < 0 || x >= width || y >= height) throw new RangeError(`pixel (${x}, ${y}) is outside ${width}x${height}`);
    const i = (y * width + x) * bpp;
    return [pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0];
  };
  return { width, height, pixel };
}

export function hexOf([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
