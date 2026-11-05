import { test } from "node:test";
import assert from "node:assert/strict";
import { foldTiming, slideStart, type SheetBox } from "../../src/site/shared/sheet-slide.ts";

const near = (actual: number, expected: number, what: string): void => {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${what}: ${actual} against ${expected}`);
};

test("SS1 a fold's slide starts where the sheet stood: the old centre less the new, in the sheet's own pixels, and the old width over the new (Issue #1261)", () => {
  const explorer = slideStart(
    { left: 0, top: 184.46875, width: 473.1875, height: 365.28125 },
    { left: 181.25, top: 144.734375, width: 661.5, height: 510.65625 },
    1,
  );
  assert.ok(explorer !== null, "the Explorer folding at 1024x768 moves");
  near(explorer.dx, -275.40625, "Explorer dx");
  near(explorer.dy, -32.953125, "Explorer dy");
  near(explorer.s, 0.7153250188964475, "Explorer s");
  const seed = slideStart(
    { left: -215.66876220703125, top: -177.98748779296875, width: 954.125, height: 736.5625 },
    { left: 122.79998779296875, top: -177.98748779296875, width: 1187.96875, height: 917.0625 },
    2,
  );
  assert.ok(seed !== null, "the Seed of the Day at depth 2 moves");
  near(seed.dx, -227.6953125, "Seed dx");
  near(seed.dy, -45.125, "Seed dy");
  near(seed.s, 0.8031566486913061, "Seed s");
});

test("SS2 a sheet that stands where it stood takes no slide", () => {
  const box: SheetBox = { left: 100, top: 50, width: 700, height: 540 };
  assert.equal(slideStart(box, { ...box, left: box.left + 0.3 }, 1), null, "a third of a pixel is no move");
  assert.equal(slideStart(box, { ...box, width: box.width * 1.0005 }, 1), null, "a twentieth of a percent is no scale");
  assert.equal(slideStart(box, { ...box, width: 0 }, 1), null, "a sheet with no width cannot be scaled to");
  assert.equal(slideStart(box, { ...box, left: box.left + 30 }, 0), null, "a depth of nothing reads no pixels");
  assert.ok(slideStart(box, { ...box, left: box.left + 30 }, 1) !== null, "the same box moved 30px does slide");
});

const withRoot = (read: (prop: string) => string, body: () => void): void => {
  const g = globalThis as Record<string, unknown>;
  const names = ["document", "getComputedStyle"] as const;
  const saved = names.map((n) => [n, n in g, g[n]] as const);
  g.document = { documentElement: {} };
  g.getComputedStyle = () => ({ getPropertyValue: read });
  try {
    body();
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
};

test("SS3 the slide's pace is the fold's own tokens, read from the root", () => {
  withRoot(
    (p) => (p === "--fold" ? "500ms" : p === "--ease-fold" ? " ease-in " : ""),
    () => {
      assert.deepEqual(foldTiming(), { ms: 500, ease: "ease-in" });
    },
  );
});

test("SS4 a page whose root carries no fold token takes no slide", () => {
  withRoot(
    () => "",
    () => {
      assert.equal(foldTiming(), null);
    },
  );
});
