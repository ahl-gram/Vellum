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

test("the kit's print blocks scope every message-box stand-down to the stage (#566, ruled 2026-09-11; kept for Issue #779 part 2i: every .status and .warning stands in a stage, so an unscoped arm would hide nothing a browser here can see)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8").replace(
    /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\//g,
    (m) => (m.startsWith("/*") ? "" : m),
  );
  const blocks: string[] = [];
  for (let open = css.indexOf("@media print"); open !== -1; open = css.indexOf("@media print", open + 1)) {
    let depth = 0,
      close = -1;
    for (let i = css.indexOf("{", open); i < css.length && close < 0; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) close = i;
    }
    assert.ok(close > open, "a print block's own brace-matched close, so a block after it never widens the window");
    blocks.push(css.slice(open, close));
  }
  assert.ok(blocks.length > 0, "the kit carries a print block");
  const stood = blocks
    .flatMap((block) => [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)])
    .filter(([, , decls]) => /display\s*:\s*none/i.test(decls!))
    .flatMap(([, sel]) =>
      sel!
        .split(",")
        .map((arm) => arm.trim())
        .filter((arm) => /\b(status|warning)\b/i.test(arm)),
    );
  assert.ok(stood.length > 0, "the print block stands no message box down, so the scoping below reads nothing");
  for (const arm of stood)
    assert.match(
      arm,
      /\.stage\b/i,
      `a message-box stand-down that is not scoped to a chart room's stage: ${arm.slice(0, 80)}`,
    );
});

test("the kit's fade arms stand on a chart room's stage and name no page's id (#547; kept for Issue #779 part 2i: every .status stands in a chart room's stage, so a broadened arm, or an id arm beside the class arm, changes nothing served; RH26 reads every room's fade)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "public/atelier.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const fades = [...css.matchAll(/([^{}]*\.fading[^{}]*)\{([^}]*)\}/g)];
  assert.ok(fades.length > 0, "the kit carries the arm the announcer turns on");
  for (const fade of fades) {
    assert.match(
      fade[1]!,
      /body\.chart-room \.stage\b/,
      `scoped to a chart room's stage like every other rule on this pill: ${fade[1]!.trim()}`,
    );
    assert.doesNotMatch(
      fade[1]!,
      /#/,
      `keyed to the class and never to one page's id, or that page's pill never fades: ${fade[1]!.trim()}`,
    );
  }
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
    documentElement: { clientWidth: 1280, clientHeight: 800 },
    body: new El("body"),
  };
  g.window = { addEventListener: () => {}, scrollX: 0 };
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
