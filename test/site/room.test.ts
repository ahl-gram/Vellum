import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GLASS_GAP_REM, pressRowStacks, rowSheds } from "../../src/site/shared/room-seats.ts";
import { bindRoom } from "../../src/site/shared/room.ts";
import { CHROME_GAP } from "../../src/site/shared/stage-fit.ts";
import { El } from "../../test-support/element-shim.ts";

test("the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + 2rem + 1.4rem)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8");
  const m = css.match(
    /\.corner\.br\.zoomery\s*\{[^}]*right:\s*calc\(var\(--slip-w\)\s*\+\s*([\d.]+)rem\s*\+\s*([\d.]+)rem\)/,
  );
  assert.ok(m, "atelier.css seats the Glass at --slip-w plus two rem terms");
  assert.equal(Number(m[1]) + Number(m[2]), GLASS_GAP_REM, "room-seats.ts's GLASS_GAP_REM drifted from the sheet");
});

class WrappingLegend extends El {
  override getBoundingClientRect() {
    const top = this.style.left ? 500 : 760;
    return { left: 0, right: 600, top, bottom: top + 40, width: 600, height: 40 };
  }
}

// The legend row's width follows the folio's text extent (placeLegendRow), and a narrower row wraps taller; the fit bounds the sheet by the row's top, so the row is seated first or the fit reads a row that is about to grow (plate read 2026-08-30 on Issue #463: the Print Room's sheet over a freshly wrapped row until the next layout).
test("bindRoom seats the legend row before it fits the sheet", () => {
  const g = globalThis as Record<string, unknown>;
  const names = ["document", "window", "ResizeObserver"] as const;
  const saved = names.map((n) => [n, n in g, g[n]] as const);
  const legend = new WrappingLegend("nav");
  g.document = {
    querySelector: (sel: string) => (sel === ".legend" ? legend : null),
    documentElement: { clientWidth: 1280, clientHeight: 800, classList: new El("html").classList },
    body: new El("body"),
  };
  g.window = { addEventListener: () => {}, scrollX: 0, scrollY: 0 };
  g.ResizeObserver = class {
    observe() {}
  };
  try {
    const frame = new El("div");
    const room = bindRoom({
      frame: frame as unknown as HTMLElement,
      sheet: new El("div") as unknown as HTMLElement,
      camera: { hold: () => null, restore: () => {} },
      aspect: () => 1.5,
    });
    room.layout();
    assert.equal(
      frame.style.getPropertyValue("--reserve-bottom"),
      `${800 - 500 + CHROME_GAP}px`,
      "the first layout fits the sheet above the seated row's top, not the top it had before it was seated",
    );
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
});

test("the Press stacks when its presses take more than two lines, or two or more stand each alone; one or two shared lines do not (Issue #762)", () => {
  assert.equal(
    pressRowStacks([0, 0, 40, 40, 80]),
    true,
    "the Print Room's 2+2+1 column at 1024x600, which painted its footing over the nav",
  );
  assert.equal(
    pressRowStacks([0, 44]),
    true,
    "the Seed of the Day's two presses each alone at 901, a sliver over the Glass",
  );
  assert.equal(pressRowStacks([0, 44, 88]), true, "the Explorer's one-press column at 901");
  assert.equal(pressRowStacks([0, 0, 62]), false, "the Explorer's two lines at 1280x800, as main seats them");
  assert.equal(pressRowStacks([0, 0, 0, 0, 0]), false, "one line");
  assert.equal(pressRowStacks([12]), false, "a single press is never a stack");
  assert.equal(pressRowStacks([]), false, "a row with no press shown");
  assert.equal(
    pressRowStacks([10.4, 10.6, 71.6]),
    false,
    "presses on one line read as one, even a fraction of a pixel apart across a rounding edge",
  );
  assert.equal(
    pressRowStacks([44, 0]),
    true,
    "tops read in any order: the lines are counted from the sorted tops, not the order the presses come in",
  );
  assert.equal(pressRowStacks([88, 44, 0]), true, "three presses each alone, read bottom first");
});

test("UL1 a risen row sheds its note only where its top would come within the gap of the head cluster's foot", () => {
  assert.equal(rowSheds(127.4 + 15.9, 127.4), true, "within the gap: the Press would stand at the cluster's foot");
  assert.equal(rowSheds(116.5, 127.4), true, "over the cluster's foot outright");
  assert.equal(rowSheds(588, 127.4), false, "a row far below the cluster keeps its note");
  assert.equal(rowSheds(127.4 + 16, 127.4), false, "exactly the gap below the cluster is clear");
  assert.equal(
    rowSheds(127.4 + 18, 127.4, 20.8),
    true,
    "clear of the gap, but the soft pool's 1.3rem above the row would reach the cluster's foot",
  );
  assert.equal(
    rowSheds(127.4 + 18, 127.4, 8),
    false,
    "a backing that reaches less than the gap leaves the gap the rule",
  );
});
