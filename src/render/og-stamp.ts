import { createHash } from "node:crypto";
import { crc32 } from "node:zlib";

export const OG_STAMP_KEYWORD = "vellum-card";
const CHART_MARKER = "<chart/>";
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type Chunk = { readonly type: string; readonly start: number; readonly end: number; readonly data: Buffer; readonly crcOk: boolean };

function chartSpan(card: string): { open: number; close: number } {
  const at = card.indexOf("data-vellum-seed=");
  if (at < 0) throw new Error("card carries no chart");
  const open = card.lastIndexOf("<svg", at);
  let depth = 0;
  let p = open;
  while (p < card.length) {
    const nextOpen = card.indexOf("<svg", p);
    const nextClose = card.indexOf("</svg>", p);
    if (nextClose < 0) throw new Error("chart svg is unterminated");
    if (nextOpen > -1 && nextOpen < nextClose) {
      depth += 1;
      p = nextOpen + 4;
    } else {
      depth -= 1;
      p = nextClose + "</svg>".length;
      if (depth === 0) return { open, close: p };
    }
  }
  throw new Error("chart svg is unterminated");
}

export function cardStamp(card: string): string {
  const { open, close } = chartSpan(card);
  return createHash("sha256").update(card.slice(0, open) + CHART_MARKER + card.slice(close)).digest("hex");
}

function* chunks(png: Buffer): Generator<Chunk> {
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error("not a PNG");
  let p = 8;
  while (p + 12 <= png.length) {
    const len = png.readUInt32BE(p);
    const type = png.toString("latin1", p + 4, p + 8);
    const data = png.subarray(p + 8, p + 8 + len);
    const crcOk = png.readUInt32BE(p + 8 + len) === crc32(png.subarray(p + 4, p + 8 + len));
    yield { type, start: p, end: p + 12 + len, data, crcOk };
    p += 12 + len;
    if (type === "IEND") return;
  }
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function isStamp(c: Chunk): boolean {
  return c.type === "tEXt" && c.data.subarray(0, c.data.indexOf(0)).toString("latin1") === OG_STAMP_KEYWORD;
}

export function readStamps(png: Uint8Array): string[] {
  const out: string[] = [];
  for (const c of chunks(Buffer.from(png))) {
    if (!isStamp(c)) continue;
    if (!c.crcOk) throw new Error(`${OG_STAMP_KEYWORD} chunk CRC mismatch`);
    out.push(c.data.subarray(c.data.indexOf(0) + 1).toString("latin1"));
  }
  return out;
}

export function stripStamps(png: Uint8Array): Buffer {
  const buf = Buffer.from(png);
  const keep: Buffer[] = [buf.subarray(0, 8)];
  for (const c of chunks(buf)) if (!isStamp(c)) keep.push(buf.subarray(c.start, c.end));
  return Buffer.concat(keep);
}

export function stampPng(png: Uint8Array, stamp: string): Buffer {
  const bare = stripStamps(png);
  const [ihdr] = chunks(bare);
  if (ihdr?.type !== "IHDR") throw new Error("PNG does not open with IHDR");
  const text = chunk("tEXt", Buffer.concat([Buffer.from(OG_STAMP_KEYWORD, "latin1"), Buffer.from([0]), Buffer.from(stamp, "latin1")]));
  return Buffer.concat([bare.subarray(0, ihdr.end), text, bare.subarray(ihdr.end)]);
}
