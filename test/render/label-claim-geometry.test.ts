import { test } from "node:test";
import assert from "node:assert/strict";
import { rotatedSpanBoxes, spacedTextBox, WIDTH_FACTOR, type Box } from "../../src/render/geometry.ts";
import { createLabelArena } from "../../src/render/context.ts";

/**
 * #175: a label must reserve the space it actually draws.
 *
 * Three primitives make that possible: a caps-aware width factor, a rotated
 * footprint expressed as a chain of axis-aligned boxes, and an all-or-nothing
 * multi-box claim so a rejected label never leaves half of itself reserved.
 */

test("the caps factor is wider than mixed case, and lives in exactly one place", () => {
  assert.ok(WIDTH_FACTOR.caps > WIDTH_FACTOR.mixed, "capitals are the wider glyphs");
  assert.equal(WIDTH_FACTOR.mixed, 0.56, "the historical mixed-case factor is unchanged");
});

test("spacedTextBox defaults to mixed case and widens on request", () => {
  const mixed = spacedTextBox(0, 0, "ABCDEFGHIJ", 10, 0);
  const caps = spacedTextBox(0, 0, "ABCDEFGHIJ", 10, 0, WIDTH_FACTOR.caps);
  assert.equal(mixed.w, 10 * 10 * WIDTH_FACTOR.mixed);
  assert.equal(caps.w, 10 * 10 * WIDTH_FACTOR.caps);
  assert.ok(caps.w > mixed.w, "an all-caps run reserves more than a mixed-case one");
  assert.equal(caps.y, mixed.y, "vertical convention is untouched");
});

test("an unrotated span is just the box back, sliced", () => {
  const box: Box = { x: 100, y: 50, w: 120, h: 20 };
  const spans = rotatedSpanBoxes(box, 0, 160, 60, 4);
  assert.equal(spans.length, 4);
  assert.equal(Math.min(...spans.map((s) => s.x)), box.x);
  assert.equal(Math.max(...spans.map((s) => s.x + s.w)), box.x + box.w);
  for (const s of spans) {
    assert.ok(Math.abs(s.y - box.y) < 1e-9, "no vertical growth at zero rotation");
    assert.ok(Math.abs(s.h - box.h) < 1e-9);
  }
});

test("a rotated span hugs the ink instead of bounding the whole rotation", () => {
  // A long, thin run at 32 degrees: one bounding box would be about 10x too tall.
  const box: Box = { x: 0, y: 0, w: 296, h: 17 };
  const spans = rotatedSpanBoxes(box, 32, 148, 8.5, 6);

  const tallest = Math.max(...spans.map((s) => s.h));
  const wholeRotationHeight = 296 * Math.sin((32 * Math.PI) / 180) + 17 * Math.cos((32 * Math.PI) / 180);

  assert.ok(
    tallest < wholeRotationHeight / 3,
    `each slice (${tallest.toFixed(0)}px) should be far shorter than the whole rotation's bound (${wholeRotationHeight.toFixed(0)}px)`,
  );
  const claimed = spans.reduce((n, s) => n + s.w * s.h, 0);
  assert.ok(claimed < 296 * wholeRotationHeight * 0.5, "the chain reserves far less area than the bounding box");
});

test("a rotated span still covers both ends of the run", () => {
  const box: Box = { x: 0, y: 0, w: 200, h: 20 };
  const deg = 30;
  const spans = rotatedSpanBoxes(box, deg, 100, 10, 6);
  const a = (deg * Math.PI) / 180;
  const spin = (px: number, py: number) => ({
    x: 100 + (px - 100) * Math.cos(a) - (py - 10) * Math.sin(a),
    y: 10 + (px - 100) * Math.sin(a) + (py - 10) * Math.cos(a),
  });
  for (const corner of [spin(0, 0), spin(200, 20)]) {
    const covered = spans.some(
      (s) => corner.x >= s.x - 1e-6 && corner.x <= s.x + s.w + 1e-6 && corner.y >= s.y - 1e-6 && corner.y <= s.y + s.h + 1e-6,
    );
    assert.ok(covered, `rotated corner (${corner.x.toFixed(1)}, ${corner.y.toFixed(1)}) must be reserved`);
  }
});

test("tryClaimAll is all-or-nothing: a rejected label reserves nothing", () => {
  const arena = createLabelArena();
  arena.claim({ x: 500, y: 500, w: 10, h: 10 });

  const boxes: Box[] = [
    { x: 0, y: 0, w: 20, h: 20 }, // free
    { x: 495, y: 495, w: 20, h: 20 }, // collides with the claimed box
  ];
  assert.equal(arena.tryClaimAll(boxes, 0), false, "the label is refused");

  // The first box must NOT have been reserved by the failed attempt.
  assert.equal(arena.tryClaim({ x: 0, y: 0, w: 20, h: 20 }, 0), true, "no partial claim was left behind");
});

test("tryClaimAll reserves every box on success", () => {
  const arena = createLabelArena();
  const boxes: Box[] = [
    { x: 0, y: 0, w: 20, h: 20 },
    { x: 100, y: 0, w: 20, h: 20 },
  ];
  assert.equal(arena.tryClaimAll(boxes, 0), true);
  assert.equal(arena.tryClaim({ x: 5, y: 5, w: 5, h: 5 }, 0), false, "first slice is reserved");
  assert.equal(arena.tryClaim({ x: 105, y: 5, w: 5, h: 5 }, 0), false, "last slice is reserved");
});
