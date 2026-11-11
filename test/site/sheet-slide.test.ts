import { test } from "node:test";
import assert from "node:assert/strict";
import { createSheetSlide, foldTiming, slideStart, type SheetBox } from "../../src/site/shared/sheet-slide.ts";
import { near } from "../../test-support/near.ts";

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

type FakeAnimation = { cancelled: boolean; finish: () => void; finished: Promise<void>; cancel: () => void };

function fakeAnimation(): FakeAnimation {
  let finish = (): void => {};
  let reject = (): void => {};
  const finished = new Promise<void>((res, rej) => {
    finish = res;
    reject = () => {
      rej(new Error("cancelled"));
    };
  });
  const a: FakeAnimation = {
    cancelled: false,
    finished,
    cancel: () => {
      a.cancelled = true;
      reject();
    },
    finish: () => {
      finish();
    },
  };
  return a;
}

function stagePage() {
  const g = globalThis as Record<string, unknown>;
  const names = ["document", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"] as const;
  const saved = names.map((n) => [n, n in g, g[n]] as const);
  const frames = new Map<number, () => void>();
  const cancelledFrames: number[] = [];
  const animations: FakeAnimation[] = [];
  let next = 1;
  g.document = { documentElement: {} };
  g.getComputedStyle = () => ({
    width: "661.5px",
    getPropertyValue: (p: string) => (p === "--fold" ? "320ms" : p === "--ease-fold" ? "ease" : ""),
  });
  g.requestAnimationFrame = (fn: () => void) => {
    frames.set(next, fn);
    return next++;
  };
  g.cancelAnimationFrame = (id: number) => {
    cancelledFrames.push(id);
    frames.delete(id);
  };
  const sheet = {
    getBoundingClientRect: () => ({ left: 181.25, top: 144.734375, width: 661.5, height: 510.65625 }),
    animate: () => {
      const a = fakeAnimation();
      animations.push(a);
      return a;
    },
  } as unknown as HTMLElement;
  const runFrame = (): void => {
    const [id, fn] = [...frames.entries()][0]!;
    frames.delete(id);
    fn();
  };
  const restore = (): void => {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  };
  return { sheet, runFrame, restore, frames, cancelledFrames, animations };
}

test("SS5 a slide cut short by a later layout or slide resolves false and leaves nothing running, so the cut slide's end layout never runs (Issue #1261)", async () => {
  const page = stagePage();
  const from = { left: 0, top: 184.46875, width: 473.1875, height: 365.28125 };
  try {
    const slide = createSheetSlide(page.sheet);
    const first = slide.slide(from, false);
    assert.equal(page.frames.size, 1, "the first slide waits for its frame");
    const second = slide.slide(from, false);
    assert.equal(await first, false, "a second slide cuts a slide still waiting for its frame");
    assert.deepEqual(page.cancelledFrames, [1], "and cancels its pending frame");
    page.runFrame();
    assert.equal(page.animations.length, 1, "the second slide plays once, on its own frame");
    slide.stop();
    assert.equal(await second, false, "a layout stops the slide mid-way");
    assert.equal(page.animations[0]!.cancelled, true, "and cancels its running animation");
    const third = slide.slide(from, false);
    page.runFrame();
    page.animations[1]!.finish();
    assert.equal(await third, true, "a slide that runs its course resolves true");
    slide.stop();
    assert.equal(page.animations[1]!.cancelled, false, "and stopping afterwards touches nothing");
  } finally {
    page.restore();
  }
});
