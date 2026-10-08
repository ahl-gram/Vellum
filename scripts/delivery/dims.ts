import { extname } from "node:path";
import { readHead } from "./walk.ts";

export interface Dims {
  readonly width: number;
  readonly height: number;
}

const HEAD_BYTES = 65536;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const png = (buf: Buffer): Dims | null =>
  buf.length >= 24 && buf.subarray(0, 4).equals(PNG_SIGNATURE)
    ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
    : null;

const gif = (buf: Buffer): Dims | null =>
  buf.length >= 10 && buf.toString("latin1", 0, 3) === "GIF"
    ? { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
    : null;

const isFrameMarker = (marker: number): boolean =>
  marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

const jpeg = (buf: Buffer): Dims | null => {
  let at = 2;
  while (at + 9 < buf.length && buf[at] === 0xff) {
    const marker = buf[at + 1] ?? 0;
    if (isFrameMarker(marker)) return { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
    at += 2 + buf.readUInt16BE(at + 2);
  }
  return null;
};

const svgNumber = (tag: string, name: string): number | null => {
  const match = new RegExp(`(?<![\\w-])${name}="([0-9.]+)(px)?"`).exec(tag);
  return match?.[1] ? Number(match[1]) : null;
};

const svg = (buf: Buffer): Dims | null => {
  const tag = /<svg\b[^>]*>/.exec(buf.toString("utf8"))?.[0];
  if (!tag) return null;
  const width = svgNumber(tag, "width");
  const height = svgNumber(tag, "height");
  if (width && height) return { width, height };
  const box = /viewBox="[-0-9.]+[ ,]+[-0-9.]+[ ,]+([0-9.]+)[ ,]+([0-9.]+)"/.exec(tag);
  return box?.[1] && box[2] ? { width: Number(box[1]), height: Number(box[2]) } : null;
};

export const pictureDims = (abs: string): Dims | null => {
  const ext = extname(abs).toLowerCase();
  try {
    const head = readHead(abs, ext === ".svg" ? 4096 : HEAD_BYTES);
    if (ext === ".png") return png(head);
    if (ext === ".gif") return gif(head);
    if (ext === ".jpg" || ext === ".jpeg") return jpeg(head);
    if (ext === ".svg") return svg(head);
    return null;
  } catch {
    return null;
  }
};
