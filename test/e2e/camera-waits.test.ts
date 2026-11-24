import { test } from "node:test";
import assert from "node:assert/strict";
import { landedWith, STOP_CAMERA_WATCH, type Framed } from "../../e2e/support/camera-landed.ts";
import type { Lens } from "../../e2e/suites/print-room/print.ts";
import { glided } from "../../e2e/suites/specimen/gestures.ts";
import type { SpecimenKit } from "../../e2e/suites/specimen/kit.ts";

const read = (k: number, frames: number, writes: number): Framed<number> => ({ read: k, frames, writes });
const sameK = (a: number, b: number): boolean => a === b;

test("landedWith takes two equal camera reads only across a drawn frame with no camera write between (Issue #1365)", () => {
  const landed = landedWith(sameK);
  const stalled = read(1.4, 4, 3);
  assert.equal(landed(stalled, stalled), false, "two equal reads with no frame between");
  assert.equal(landed(read(1.4, 5, 4), read(1.4, 4, 3)), false, "a write the matrix's rounding hides");
  assert.equal(landed(read(1.4, 5, 3), read(1.4, 4, 3)), true, "one frame on and no write");
  assert.equal(landed(read(1.5, 5, 3), read(1.4, 4, 3)), false, "reads that differ");
  assert.equal(
    landed({ read: null, frames: 5, writes: 3 } as unknown as Framed<number>, read(1.4, 4, 3)),
    false,
    "a null read",
  );
});

const matrix = (k: number): string => `matrix(${k}, 0, 0, ${k}, 0, 0)`;
const lens = (k: number, frames: number, writes: number): Framed<Lens> => ({
  read: { k, t: matrix(k), zoomed: k > 1 },
  frames,
  writes,
});

const scripted = <T>(reads: readonly Framed<T>[]) => {
  let n = 0;
  let stops = 0;
  const evaluate = (expression: string): Promise<unknown> => {
    if (expression === STOP_CAMERA_WATCH) {
      stops += 1;
      return Promise.resolve(true);
    }
    return Promise.resolve(reads[Math.min(n++, reads.length - 1)]);
  };
  return { evaluate, stops: () => stops };
};

test("glided hands the Glass's glide over only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const s = scripted([lens(1, 0, 0), lens(1.37144, 1, 1), lens(1.37144, 1, 1), lens(1.4, 2, 2), lens(1.4, 3, 2)]);
  const k = { evaluate: s.evaluate, sleep: () => Promise.resolve() } as unknown as SpecimenKit;
  assert.equal((await glided(k, matrix(1))).k, 1.4);
  assert.equal(s.stops(), 1);
});
