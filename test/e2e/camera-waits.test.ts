import { test } from "node:test";
import assert from "node:assert/strict";
import { landedWith, type Framed } from "../../e2e/support/camera-landed.ts";

const read = (k: number, frames: number, writes: number): Framed<number> => ({ read: k, frames, writes });
const sameK = (a: number, b: number): boolean => a === b;

test("landedWith takes two equal camera reads only across a drawn frame with no camera write between (Issue #1365)", () => {
  const landed = landedWith(sameK);
  const stalled = read(1.4, 4, 3);
  assert.equal(landed(stalled, stalled), false, "two equal reads with no frame between");
  assert.equal(landed(read(1.4, 5, 4), read(1.4, 4, 3)), false, "a write the matrix's rounding hides");
  assert.equal(landed(read(1.4, 5, 3), read(1.4, 4, 3)), true, "one frame on and no write");
  assert.equal(landed(read(1.5, 5, 3), read(1.4, 4, 3)), false, "reads that differ");
  assert.equal(landed({ read: null, frames: 5, writes: 3 } as unknown as Framed<number>, read(1.4, 4, 3)), false, "a null read");
});
