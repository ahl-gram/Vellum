import { test } from "node:test";
import assert from "node:assert/strict";
import { landedWith, STOP_CAMERA_WATCH, type Framed } from "../../e2e/support/camera-landed.ts";
import { lensRest, type Lens } from "../../e2e/suites/print-room/print.ts";
import { glided } from "../../e2e/suites/specimen/gestures.ts";
import type { SpecimenKit } from "../../e2e/suites/specimen/kit.ts";
import type { SuiteContext } from "../../e2e/types.ts";
import { kLeft } from "../../e2e/suites/zoom-gestures/touch.ts";
import type { GesturesKit } from "../../e2e/suites/zoom-gestures.ts";

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
  const seen: string[] = [];
  const evaluate = (expression: string): Promise<unknown> => {
    seen.push(expression);
    if (expression === STOP_CAMERA_WATCH) {
      stops += 1;
      return Promise.resolve(true);
    }
    return Promise.resolve(reads[Math.min(n++, reads.length - 1)]);
  };
  return { evaluate, stops: () => stops, seen };
};

test("glided hands the Glass's glide over only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const s = scripted([lens(1, 0, 0), lens(1.37144, 1, 1), lens(1.37144, 1, 1), lens(1.4, 2, 2), lens(1.4, 3, 2)]);
  const k = { evaluate: s.evaluate, sleep: () => Promise.resolve() } as unknown as SpecimenKit;
  assert.equal((await glided(k, matrix(1))).k, 1.4);
  assert.equal(s.stops(), 1);
});

test("lensRest takes a leaned or a still camera only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const leaning = scripted([lens(1, 0, 0), lens(1.37144, 1, 1), lens(1.37144, 1, 1), lens(1.4, 2, 2), lens(1.4, 3, 2)]);
  const ctx = (s: { evaluate: (e: string) => Promise<unknown> }) =>
    ({ evaluate: s.evaluate, sleep: () => Promise.resolve() }) as unknown as Pick<SuiteContext, "evaluate" | "sleep">;
  assert.equal((await lensRest(ctx(leaning), "leaned", "leaned")).k, 1.4);
  assert.equal(leaning.stops(), 1);
  const homing = scripted([lens(1.4, 0, 0), lens(1.4, 0, 0), lens(1, 1, 1), lens(1, 2, 1)]);
  assert.equal((await lensRest(ctx(homing), "still", "home")).k, 1);
  assert.equal(homing.stops(), 1);
});

test("lensRest hands a camera that never left home over as still, and watches the target it is given (Issue #1365)", async () => {
  const ctx = (s: { evaluate: (e: string) => Promise<unknown> }) =>
    ({ evaluate: s.evaluate, sleep: () => Promise.resolve() }) as unknown as Pick<SuiteContext, "evaluate" | "sleep">;
  const home = scripted([lens(1, 0, 0), lens(1, 1, 0), lens(1.3, 2, 1)]);
  assert.equal((await lensRest(ctx(home), "still", "home")).k, 1);
  assert.ok(home.seen.some((e) => e.includes(`document.querySelector("#map")`)));
  const chart = scripted([lens(1, 0, 0), lens(1, 1, 0)]);
  await lensRest(ctx(chart), "still", "chart", undefined, "#map-viewport > .rf-chart");
  assert.ok(chart.seen.some((e) => e.includes(`document.querySelector("#map-viewport > .rf-chart")`)));
});

test("kLeft takes the double tap's depth only once a frame has drawn with no camera write between (Issue #1365)", async () => {
  const depth = (k: number, frames: number, writes: number): Framed<number> => ({ read: k, frames, writes });
  const s = scripted([
    depth(1, 0, 0),
    depth(1.5863681885612406, 1, 1),
    depth(1.5863681885612406, 1, 1),
    depth(2, 2, 2),
    depth(2, 3, 2),
  ]);
  const k = { evaluate: s.evaluate, sleep: () => Promise.resolve() } as unknown as GesturesKit;
  assert.equal(await kLeft(k, "ZG8b"), 2);
  assert.equal(s.stops(), 1);
});
