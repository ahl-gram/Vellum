// A rendered-pixel strip for suites whose claim is about PAINT (opacity, a glyph showing through), which no hit-test or computed style can see; one row of a Page.captureScreenshot clip, decoded here with node:zlib so the harness takes no image dependency.
import { inflateSync } from "node:zlib";

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

// The first row of a PNG, unfiltered against an all-zero row above (there is none).
export function decodeFirstRow(png) {
  let at = 8;
  let width = 0, channels = 0, depth = 0;
  const idat = [];
  while (at < png.length) {
    const len = png.readUInt32BE(at);
    const type = png.toString("ascii", at + 4, at + 8);
    const data = png.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      depth = data[8];
      channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[data[9]];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    at += 12 + len;
  }
  if (depth !== 8 || !channels) throw new Error(`pixel-support decodes 8-bit PNGs only (depth ${depth}, channels ${channels})`);
  const raw = inflateSync(Buffer.concat(idat));
  const filter = raw[0];
  const row = Buffer.from(raw.subarray(1, 1 + width * channels));
  for (let i = 0; i < row.length; i++) {
    const left = i >= channels ? row[i - channels] : 0;
    if (filter === 1) row[i] = (row[i] + left) & 0xff;
    else if (filter === 3) row[i] = (row[i] + (left >> 1)) & 0xff;
    else if (filter === 4) row[i] = (row[i] + paeth(left, 0, 0)) & 0xff;
  }
  const px = (i, k) => row[i * channels + (channels >= 3 ? k : 0)];
  return Array.from({ length: width }, (_, i) => [px(i, 0), px(i, 1), px(i, 2)]);
}

// x and y are VIEWPORT coordinates (a rect's); the clip the browser wants is the page's, so the scroll is added here (a scrolled page read blank frames until the 2026-09-03 sitting, ruling 6).
export async function sampleRow(send, x, y, width) {
  const s = await send("Runtime.evaluate", { expression: "[window.scrollX, window.scrollY]", returnByValue: true });
  const [sx, sy] = (s && s.result && s.result.value) || [0, 0];
  const r = await send("Page.captureScreenshot", { format: "png", clip: { x: x + sx, y: y + sy, width, height: 1, scale: 1 } });
  return decodeFirstRow(Buffer.from(r.data, "base64"));
}

export const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
