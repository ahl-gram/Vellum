import assert from "node:assert/strict";
import { test } from "node:test";
import { limitProblem, MAX_BYTES, pngSize } from "../../scripts/still-judge/png.ts";
import { pngHeader } from "../../test-support/still-judge-fixtures.ts";

test("a PNG's width and height are read from its header, and anything else is not a PNG", () => {
  assert.deepEqual(pngSize(pngHeader(1500, 1158)), { width: 1500, height: 1158 });
  assert.deepEqual(pngSize(pngHeader(280, 1568)), { width: 280, height: 1568 });
  assert.equal(pngSize(Buffer.from("GIF89a".padEnd(33, "\0"), "latin1")), null);
  const notIhdr = pngHeader(1500, 1158);
  notIhdr.write("IEND", 12, "latin1");
  assert.equal(pngSize(notIhdr), null);
  assert.equal(pngSize(pngHeader(1500, 1158).subarray(0, 23)), null);
  const notPng = pngHeader(1500, 1158);
  notPng[0] = 0x88;
  assert.equal(pngSize(notPng), null);
});

test("a still is sent only when each side is 280 to 1568 pixels and the file holds at most 16 MiB, both ends included", () => {
  for (const [w, h] of [
    [1500, 1158],
    [280, 280],
    [1568, 1568],
    [280, 1568],
  ] as const)
    assert.equal(limitProblem(pngHeader(w, h)), null, `${w} by ${h}`);
  assert.equal(limitProblem(pngHeader(279, 1000)), "279 by 1000 pixels: each side must be 280 to 1568");
  assert.equal(limitProblem(pngHeader(1000, 1569)), "1000 by 1569 pixels: each side must be 280 to 1568");
  assert.equal(limitProblem(pngHeader(1680, 2478)), "1680 by 2478 pixels: each side must be 280 to 1568");
  assert.equal(limitProblem(pngHeader(1000, 279)), "1000 by 279 pixels: each side must be 280 to 1568");
  assert.equal(limitProblem(pngHeader(1569, 1000)), "1569 by 1000 pixels: each side must be 280 to 1568");

  const sized = (bytes: number): Buffer => {
    const b = Buffer.alloc(bytes);
    pngHeader(1500, 1158).copy(b, 0);
    return b;
  };
  assert.equal(limitProblem(sized(MAX_BYTES + 1)), "16777217 bytes: a still may hold at most 16777216");
  assert.equal(limitProblem(sized(MAX_BYTES)), null);
  assert.equal(limitProblem(Buffer.from("not a png, only a line of text....", "latin1")), "not a PNG");
});
