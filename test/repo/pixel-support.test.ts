import { test } from "node:test";
import assert from "node:assert/strict";
// The helper is one of the grandfathered e2e .mjs files, which tsconfig does not cover; a non-literal specifier keeps tsc out of it.
const { sampleRow } = await import(`${"../../scripts/e2e"}/pixel-support.mjs`);

// A 1x1 8-bit RGBA PNG: enough for the decoder; what this test reads is the CLIP the helper asks the browser for.
const PNG_1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

test("sampleRow takes a VIEWPORT point and asks the browser for the PAGE point: the clip carries the scroll offset, so a page scrolled past a screen reads its pixels instead of a blank frame (plate read on PR #501; the sitting's ruling 6, 2026-09-03 on #454)", async () => {
  const calls: Array<[string, Record<string, unknown> | undefined]> = [];
  const send = async (method: string, params?: Record<string, unknown>) => {
    calls.push([method, params]);
    if (method === "Runtime.evaluate") return { result: { value: [3, 1200] } };
    return { data: PNG_1x1 };
  };
  const row = await sampleRow(send, 40, 60, 1);
  assert.equal(row.length, 1, "one pixel decoded");
  const shot = calls.find(([m]) => m === "Page.captureScreenshot");
  assert.ok(shot, "a screenshot was taken");
  const clip = (shot[1] as { clip: { x: number; y: number; width: number; height: number } }).clip;
  assert.deepEqual({ x: clip.x, y: clip.y }, { x: 43, y: 1260 }, "the clip is the viewport point plus the page's scroll");
  assert.deepEqual({ w: clip.width, h: clip.height }, { w: 1, h: 1 });
});

test("sampleRow on an unscrolled page asks for the same point it was given (the every-caller-today case, unchanged)", async () => {
  let clip: { x: number; y: number } | null = null;
  const send = async (method: string, params?: Record<string, unknown>) => {
    if (method === "Runtime.evaluate") return { result: { value: [0, 0] } };
    clip = (params as { clip: { x: number; y: number } }).clip;
    return { data: PNG_1x1 };
  };
  await sampleRow(send, 40, 60, 1);
  assert.deepEqual(clip, { x: 40, y: 60, width: 1, height: 1, scale: 1 });
});
