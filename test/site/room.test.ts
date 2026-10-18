import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DESK_FRAME } from "../../src/site/shared/page-box.ts";
import { GLASS_GAP_REM, pressRowStacks, rowSheds } from "../../src/site/shared/room-seats.ts";
import { bindRoom } from "../../src/site/shared/room.ts";
import { CHROME_GAP } from "../../src/site/shared/stage-fit.ts";
import { El } from "../../test-support/element-shim.ts";

test("the Glass's computed seat beside an open slip is the sheet's own arithmetic (atelier.css: --slip-w + 2rem + 1.4rem)", () => {
  const css = readFileSync(resolve(import.meta.dirname, "..", "..", "src/styles/atelier.css"), "utf8");
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

const FRAME_H = 768;
const SIDEWAYS = { clientWidth: 1024, clientHeight: 474, scale: 0.82421875 };
const FOOT = FRAME_H - SIDEWAYS.clientHeight;

type Box = { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };

const liveScrollY = (): number => (globalThis as unknown as { window: { scrollY: number } }).window.scrollY;

class PageEl extends El {
  readonly page: Box;
  constructor(tag: string, page: Box) {
    super(tag);
    this.page = page;
  }
  override getBoundingClientRect() {
    const { left, top, right, bottom } = this.page;
    const y = liveScrollY();
    return { left, right, top: top - y, bottom: bottom - y, width: right - left, height: bottom - top };
  }
}

const press = (offsetTop: number): El =>
  Object.assign(new El("button"), { offsetTop, rect: { left: 0, top: 0, right: 80, bottom: 32 } });

class StackedLegend extends PageEl {
  override querySelectorAll(): El[] {
    return [press(0), press(44)];
  }
}

const deskEls = (): Map<string, El> =>
  new Map<string, El>([
    ["header.chrome", new PageEl("header", { left: 32, top: 16, right: 600, bottom: 128 })],
    [".corner.tr", new PageEl("div", { left: 800, top: 16, right: 1000, bottom: 96 })],
    [".slip", new PageEl("aside", { left: 700, top: 112, right: 1000, bottom: 600 })],
    [".corner.bl", new PageEl("div", { left: 32, top: 680, right: 300, bottom: 752 })],
    [".legend", new StackedLegend("nav", { left: 340, top: 560, right: 640, bottom: 668 })],
    [".strip", new PageEl("div", { left: 0, top: 700, right: 1024, bottom: 760 })],
  ]);

const ROOM_GLOBALS = ["document", "window", "ResizeObserver", "getComputedStyle"] as const;

function withRoomGlobals(body: () => void): void {
  const g = globalThis as Record<string, unknown>;
  const saved = ROOM_GLOBALS.map((n) => [n, n in g, g[n]] as const);
  try {
    body();
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
}

type DeskWindow = { scrollY: number; readonly visualViewport: { scale: number } };

function installDesk(els: Map<string, El>): { root: { classList: El["classList"] }; body: El; win: DeskWindow } {
  const root = {
    clientWidth: SIDEWAYS.clientWidth,
    clientHeight: SIDEWAYS.clientHeight,
    classList: new El("html").classList,
  };
  const body = new El("body");
  const win = { addEventListener: () => {}, scrollX: 0, scrollY: 0, visualViewport: { scale: SIDEWAYS.scale } };
  const g = globalThis as Record<string, unknown>;
  g.document = {
    querySelector: (sel: string) => els.get(sel) ?? null,
    documentElement: root,
    body,
    createRange: () => ({}),
  };
  g.window = win;
  g.ResizeObserver = class {
    observe() {}
  };
  g.getComputedStyle = () => ({
    getPropertyValue: (p: string) => (p === "--desk-frame-h" ? `${FRAME_H}px` : ""),
    fontSize: "16px",
    top: "",
  });
  return { root, body, win };
}

type DeskRoom = {
  readonly layout: () => void;
  readonly seats: () => Record<string, unknown>;
  readonly framed: () => boolean;
  readonly win: DeskWindow;
};

function bindDeskRoom(): DeskRoom {
  const els = deskEls();
  const { root, body, win } = installDesk(els);
  const frame = new El("div");
  const { layout } = bindRoom({
    frame: frame as unknown as HTMLElement,
    sheet: new El("div") as unknown as HTMLElement,
    camera: { hold: () => null, restore: () => {} },
    aspect: () => 1.5,
  });
  const style = (sel: string) => els.get(sel)?.style;
  return {
    layout,
    win,
    framed: () => root.classList.contains(DESK_FRAME),
    seats: () => ({
      under: body.classList.contains("stage-under"),
      reserveTop: frame.style.getPropertyValue("--reserve-top"),
      reserveBottom: frame.style.getPropertyValue("--reserve-bottom"),
      slipTop: style(".slip")?.top,
      slipMax: style(".slip")?.maxHeight,
      pressFoot: style(".legend")?.bottom,
    }),
  };
}

const DESK_SEATS = {
  under: false,
  reserveTop: "142px",
  reserveBottom: "222px",
  slipTop: "112px",
  slipMax: "576px",
  pressFoot: "100px",
};

test("UD1 a room in the desk frame laid out again at the frame's foot seats its reserves, its slip and its risen Press where it seats them unscrolled: every vertical read is in page coordinates (Issue #778)", () => {
  withRoomGlobals(() => {
    const room = bindDeskRoom();
    room.layout();
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      "unscrolled: the reserves clear the head's foot (128 + 14) and the risen Press's top (768 - 560 + 14), the slip hangs below its folio (96 + 16) and stops above the strip (700 - 12 - 112), and the risen Press stands above the chart folio (768 - 680 + 12)",
    );
    room.win.scrollY = FOOT;
    room.layout();
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      `laid out again at the frame's foot, scrolled ${FOOT}, every seat stands where it stood unscrolled`,
    );
  });
});

test("UD2 a pinch past full size after the room binds leaves the desk frame standing and its seats unmoved: whether the page was set small is read once, as the room binds (Issue #778)", () => {
  withRoomGlobals(() => {
    const room = bindDeskRoom();
    room.layout();
    room.win.visualViewport.scale = 2;
    room.layout();
    assert.equal(room.framed(), true, "the frame the room bound with stands after the pinch");
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      `laid out again after the pinch, the room still lays out on the frame's ${FRAME_H}, not the window's ${SIDEWAYS.clientHeight}`,
    );
  });
});
