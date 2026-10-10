import { test } from "node:test";
import assert from "node:assert/strict";
import { nearRgba, sampleRow, tokenRgba } from "../../e2e/support/pixel.ts";

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

test("tokenRgba reads a palette token's channels and an alpha in 0 to 255, and nearRgba allows 2 a channel and 3 on alpha, no more", () => {
  assert.deepEqual(tokenRgba("--parchment"), [239, 230, 207, 255]);
  assert.deepEqual(tokenRgba("--chart-ink", 0.55), [61, 47, 31, 140]);
  const want = tokenRgba("--parchment");
  assert.ok(nearRgba([241, 228, 207, 252], want), "within 2 a channel and 3 on alpha");
  assert.ok(!nearRgba([242, 230, 207, 255], want), "3 off a channel");
  assert.ok(!nearRgba([239, 230, 207, 251], want), "4 off the alpha");
  assert.ok(!nearRgba([239, 230, 207], want), "a read missing its alpha");
  assert.ok(!nearRgba(null, want) && !nearRgba(undefined, want), "no read at all");
});
