import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import {
  centroidOf,
  decodeRows,
  dominant,
  extentOf,
  nearRgba,
  pure,
  sampleRect,
  sampleRow,
  tokenRgba,
} from "../../e2e/support/pixel.ts";

// A 1x1 8-bit RGBA PNG, enough for the decoder.
const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

test("sampleRow takes a VIEWPORT point and asks the browser for the PAGE point: the clip carries the scroll offset, so a page scrolled past a screen reads its pixels instead of a blank frame (plate read on PR #501; the sitting's ruling 6, 2026-09-03 on #454)", async () => {
  const calls: Array<[string, Record<string, unknown> | undefined]> = [];
  const send = (method: string, params?: Record<string, unknown>) => {
    calls.push([method, params]);
    if (method === "Runtime.evaluate") return Promise.resolve({ result: { value: [3, 1200] } });
    return Promise.resolve({ data: PNG_1x1 });
  };
  const row = await sampleRow(send, 40, 60, 1);
  assert.equal(row.length, 1, "one pixel decoded");
  const shot = calls.find(([m]) => m === "Page.captureScreenshot");
  assert.ok(shot, "a screenshot was taken");
  const clip = (shot[1] as { clip: { x: number; y: number; width: number; height: number } }).clip;
  assert.deepEqual(
    { x: clip.x, y: clip.y },
    { x: 43, y: 1260 },
    "the clip is the viewport point plus the page's scroll",
  );
  assert.deepEqual({ w: clip.width, h: clip.height }, { w: 1, h: 1 });
});

test("sampleRow on an unscrolled page asks for the same point it was given (the every-caller-today case, unchanged)", async () => {
  let clip: { x: number; y: number } | null = null;
  const send = (method: string, params?: Record<string, unknown>) => {
    if (method === "Runtime.evaluate") return Promise.resolve({ result: { value: [0, 0] } });
    clip = (params as { clip: { x: number; y: number } }).clip;
    return Promise.resolve({ data: PNG_1x1 });
  };
  await sampleRow(send, 40, 60, 1);
  assert.deepEqual(clip, { x: 40, y: 60, width: 1, height: 1, scale: 1 });
});

test("sampleRow never falls back to the viewport clip: a scroll read that throws in the page, or comes back in another shape, is an error, not a silent [0, 0] (skeptic on PR #510)", async () => {
  for (const answer of [
    { result: { type: "undefined" }, exceptionDetails: { text: "boom" } },
    {},
    { result: { value: [3] } },
    { result: { value: "3,1200" } },
  ]) {
    let shot = false;
    const send = (method: string) => {
      if (method === "Runtime.evaluate") return Promise.resolve(answer);
      shot = true;
      return Promise.resolve({ data: PNG_1x1 });
    };
    await assert.rejects(
      async () => {
        await sampleRow(send, 40, 60, 1);
      },
      /could not read the page's scroll/,
      JSON.stringify(answer),
    );
    assert.equal(shot, false, "no screenshot is taken on a failed scroll read");
  }
});

test("tokenRgba reads a palette token's channels and an alpha in 0 to 255, and nearRgba allows 2 a channel and 3 on alpha, or the alpha it is handed, no more", () => {
  assert.deepEqual(tokenRgba("--parchment"), [239, 230, 207, 255]);
  assert.deepEqual(tokenRgba("--chart-ink", 0.55), [61, 47, 31, 140]);
  const want = tokenRgba("--parchment");
  assert.ok(nearRgba([241, 228, 207, 252], want), "within 2 a channel and 3 on alpha");
  assert.ok(!nearRgba([242, 230, 207, 255], want), "3 off a channel");
  assert.ok(!nearRgba([239, 230, 207, 251], want), "4 off the alpha");
  assert.ok(!nearRgba([239, 230, 207], want), "a read missing its alpha");
  assert.ok(!nearRgba(null, want) && !nearRgba(undefined, want), "no read at all");
  const stop = tokenRgba("--chart-ink", 0.85);
  assert.ok(nearRgba([61, 47, 31, 216], stop, 1), "a panel stop's own rounding passes the tighter alpha");
  assert.ok(!nearRgba([61, 47, 31, 214], stop, 1), "a stop moved by 0.01 does not");
});

// An 8-bit RGB PNG from its scanlines, each already led by its filter byte; the decoder reads no CRC, so none is computed.
const pngOf = (width: number, scanlines: number[][]): Buffer => {
  const chunk = (type: string, data: Buffer): Buffer => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, "ascii");
    return Buffer.concat([head, data, Buffer.alloc(4)]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(scanlines.length, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(scanlines.flat()))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

test("decodeRows unfilters every row by its own filter against the row above, so a rectangle reads as it was drawn (Issue #751)", () => {
  const png = pngOf(2, [
    [0, 10, 20, 30, 40, 50, 60],
    [1, 70, 80, 90, 30, 30, 30],
    [2, 60, 60, 60, 60, 60, 60],
    [3, 125, 130, 135, 45, 45, 45],
    [4, 71, 50, 61, 30, 51, 185],
  ]);
  assert.deepEqual(decodeRows(png), [
    [
      [10, 20, 30],
      [40, 50, 60],
    ],
    [
      [70, 80, 90],
      [100, 110, 120],
    ],
    [
      [130, 140, 150],
      [160, 170, 180],
    ],
    [
      [190, 200, 210],
      [220, 230, 240],
    ],
    [
      [5, 250, 15],
      [35, 45, 200],
    ],
  ]);
});

test("sampleRect asks for the page rectangle: the viewport point plus the scroll, the whole width and height (Issue #751)", async () => {
  const png = pngOf(2, [
    [0, 1, 2, 3, 4, 5, 6],
    [0, 7, 8, 9, 10, 11, 12],
  ]).toString("base64");
  let clip: unknown = null;
  const send = (method: string, params?: Record<string, unknown>) => {
    if (method === "Runtime.evaluate") return Promise.resolve({ result: { value: [3, 1200] } });
    clip = (params as { clip: unknown }).clip;
    return Promise.resolve({ data: png });
  };
  const rows = await sampleRect(send, 40, 60, 2, 2);
  assert.deepEqual(clip, { x: 43, y: 1260, width: 2, height: 2, scale: 1 });
  assert.equal(rows.length, 2, "two rows");
  assert.deepEqual(
    rows.map((r) => r.length),
    [2, 2],
    "two pixels a row",
  );
});

test("centroidOf and extentOf read a test colour in page coordinates, and pure and dominant split full from half coverage (Issue #751)", () => {
  const parchment: [number, number, number] = [239, 230, 207];
  const red: [number, number, number] = [255, 0, 0];
  const rows = [
    [parchment, parchment, parchment, parchment],
    [parchment, red, red, parchment],
    [parchment, parchment, parchment, parchment],
  ];
  assert.deepEqual(centroidOf(rows, 10, 20, pure(0)), { n: 2, x: 12, y: 21.5 });
  assert.deepEqual(extentOf(rows, 10, 20, pure(0)), { left: 11, top: 21, right: 13, bottom: 22 });
  assert.equal(centroidOf(rows, 10, 20, pure(2)), null, "no blue anywhere");
  assert.ok(pure(0)([230, 40, 40]), "the floor of full coverage");
  assert.ok(!pure(0)([229, 0, 0]), "one under the floor");
  assert.ok(!pure(0)([178, 34, 34]), "heraldic gules is not a test colour");
  assert.ok(dominant(1)([0, 128, 0]), "half coverage");
  assert.ok(!dominant(1)([0, 127, 0]), "just under half");
  assert.ok(!dominant(1)([120, 242, 104]), "a pale green is not an edge");
});
