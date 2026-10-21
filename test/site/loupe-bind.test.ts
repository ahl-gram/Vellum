import test from "node:test";
import assert from "node:assert/strict";
import { El, installShim } from "../../test-support/element-shim.ts";
import { bindLoupe, loupeKey, type Box, type KeyLike, type LoupeBindDeps } from "../../src/site/explorer/loupe-bind.ts";
import type { Loupe } from "../../src/site/explorer/loupe.ts";

installShim();

type Call = readonly ["show", { readonly x: number; readonly y: number }] | readonly ["hide"];

const NO_KEYS: KeyLike = { key: "l", repeat: false, altKey: false, ctrlKey: false, metaKey: false };

function rig(touchable = false) {
  const press = new El("button");
  const viewport = new El("div");
  viewport.rect = { left: 10, top: 20, right: 810, bottom: 620 };
  const inside = new El("button");
  (viewport as unknown as { contains: (n: unknown) => boolean }).contains = (n) => n === inside;
  const calls: Call[] = [];
  const lens = new El("div");
  const grip = new El("div");
  const loupe: Loupe = {
    lens: lens as unknown as HTMLElement,
    grip: grip as unknown as HTMLElement,
    show: (at) => {
      calls.push(["show", at]);
    },
    hide: () => {
      calls.push(["hide"]);
    },
  };
  const now: { standing: boolean; busy: boolean; card: Box | null } = { standing: true, busy: false, card: null };
  const reads = { rect: 0, card: 0 };
  const rectOf = viewport.getBoundingClientRect.bind(viewport);
  viewport.getBoundingClientRect = () => {
    reads.rect += 1;
    return rectOf();
  };
  const deps: LoupeBindDeps = {
    press: press as unknown as HTMLElement,
    viewport: viewport as unknown as HTMLElement,
    loupe,
    cardRect: () => {
      reads.card += 1;
      return now.card;
    },
    standing: () => now.standing,
    busy: () => now.busy,
    touchable,
  };
  const binding = bindLoupe(deps);
  const mouse = (type: string, x: number, y: number): void =>
    viewport.fire(type, { pointerType: "mouse", clientX: x, clientY: y });
  return { press, viewport, inside, grip, lens, calls, now, reads, binding, mouse };
}

const spy = () => {
  const fn = Object.assign(
    () => {
      fn.count += 1;
    },
    { count: 0 },
  );
  return fn;
};

const key = (over: Partial<KeyLike> = {}) => ({ ...NO_KEYS, ...over, preventDefault: spy() });

test("the loupe's key is its letter alone, either case, with no alt, control or meta (Issue #751)", () => {
  assert.equal(loupeKey({ ...NO_KEYS, key: "l" }), true);
  assert.equal(loupeKey({ ...NO_KEYS, key: "L" }), true);
  assert.equal(loupeKey({ ...NO_KEYS, ctrlKey: true }), false, "control");
  assert.equal(loupeKey({ ...NO_KEYS, altKey: true }), false, "alt");
  assert.equal(loupeKey({ ...NO_KEYS, metaKey: true }), false, "meta");
  assert.equal(loupeKey({ ...NO_KEYS, key: "k" }), false, "another letter");
});

test("the press lights the lens under the pointer, the lens standing aside does not stop the press, and leaving the chart hides it (Issue #751)", () => {
  const r = rig();
  assert.equal(r.press.getAttribute("aria-pressed"), "false");
  r.mouse("pointermove", 310, 220);
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "true");
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
  r.viewport.fire("pointerleave", { pointerType: "mouse" });
  assert.deepEqual(r.calls.at(-1), ["hide"], "the pointer left the chart");
  r.mouse("pointerenter", 410, 320);
  assert.deepEqual(r.calls.at(-1), ["show", { x: 400, y: 300 }]);
  r.now.standing = false;
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "false", "the press takes with the sheet off its recto");
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "true");
  assert.deepEqual(r.calls.at(-1), ["hide"], "lit, but standing aside");
});

test("holding the key shows the lens under the pointer, or at the chart's centre with no pointer over it, and letting go with or without a modifier, or the keyboard leaving the map, hides it (Issue #751)", () => {
  const r = rig();
  r.mouse("pointermove", 310, 220);
  assert.equal(r.calls.length, 0, "unlit and unheld, a move does nothing");
  const down = key();
  r.viewport.fire("keydown", down);
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
  assert.equal(down.preventDefault.count, 1);
  r.viewport.fire("keyup", { key: "l" });
  assert.deepEqual(r.calls.at(-1), ["hide"]);
  r.viewport.fire("keydown", key());
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
  r.viewport.fire("keyup", { key: "L", ctrlKey: true });
  assert.deepEqual(r.calls.at(-1), ["hide"], "a modifier pressed mid-hold never strands the lens");
  r.viewport.fire("pointerleave", { pointerType: "mouse" });
  r.viewport.fire("keydown", key());
  assert.deepEqual(r.calls.at(-1), ["show", { x: 400, y: 300 }], "no pointer over the chart: its centre");
  const before = r.calls.length;
  r.viewport.fire("focusout", { relatedTarget: r.inside });
  assert.equal(r.calls.length, before, "the keyboard moved to something inside the map");
  r.viewport.fire("focusout", { relatedTarget: null });
  assert.deepEqual(r.calls.at(-1), ["hide"], "the keyboard left the map");
  const after = r.calls.length;
  r.viewport.fire("keydown", key({ repeat: true }));
  assert.equal(r.calls.length, after, "a repeat holds nothing");
});

test("on a computer it stands aside while the world is in motion or off its recto, and while the pointer is on a shown card (Issue #751)", () => {
  const r = rig();
  r.mouse("pointermove", 310, 220);
  r.press.fire("click");
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
  r.now.standing = false;
  r.binding.follow();
  assert.deepEqual(r.calls.at(-1), ["hide"], "the sheet is not standing");
  r.now.standing = true;
  r.now.card = { left: 300, top: 200, right: 500, bottom: 400 };
  r.binding.follow();
  assert.deepEqual(r.calls.at(-1), ["hide"], "the pointer is on the card");
  r.now.card = null;
  r.binding.follow();
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
});

test("where touch is the main pointer, lighting places it mid-chart, its grip drags it inside the gesture box without reaching the camera, and a card does not set it aside (Issue #751)", () => {
  const r = rig(true);
  r.press.fire("click");
  assert.deepEqual(r.calls.at(-1), ["show", { x: 400, y: 300 }]);
  const touch = (x: number, y: number) => ({
    touches: [{ clientX: x, clientY: y }],
    stopPropagation: spy(),
    preventDefault: spy(),
  });
  const start = touch(410, 320);
  r.grip.fire("touchstart", start);
  assert.deepEqual([start.stopPropagation.count, start.preventDefault.count], [1, 1], "the grab stops and prevents");
  const move = touch(470, 335);
  r.grip.fire("touchmove", move);
  assert.deepEqual(r.calls.at(-1), ["show", { x: 460, y: 315 }]);
  assert.deepEqual([move.stopPropagation.count, move.preventDefault.count], [1, 1], "the drag stops and prevents");
  r.grip.fire("touchmove", touch(2000, -500));
  assert.deepEqual(r.calls.at(-1), ["show", { x: 800, y: 0 }], "the centre stays inside the 800 by 600 box");
  for (const type of ["mousedown", "dblclick", "wheel", "touchend", "touchcancel"]) {
    const e = { stopPropagation: spy() };
    r.grip.fire(type, e);
    assert.equal(e.stopPropagation.count, 1, `${type} stops at the grip`);
  }
  assert.deepEqual(r.lens.listeners, [], "the lens's body takes no finger");
  r.mouse("pointermove", 100, 100);
  assert.deepEqual(r.calls.at(-1), ["show", { x: 800, y: 0 }], "a mouse moves nothing where touch is the main pointer");
  r.now.card = { left: 0, top: 0, right: 2000, bottom: 2000 };
  r.binding.follow();
  assert.deepEqual(r.calls.at(-1), ["show", { x: 800, y: 0 }], "a card sets nothing aside on a tablet");
});

test("while the loupe is neither lit nor held, a follow does nothing and reads no layout (Issue #751)", () => {
  const r = rig();
  r.binding.follow();
  r.binding.follow();
  r.binding.follow();
  r.mouse("pointermove", 310, 220);
  assert.equal(r.calls.length, 0, "no show and no hide");
  assert.deepEqual([r.reads.rect, r.reads.card], [0, 0], "no layout read");
});

test("the press is ignored while a world is in motion, as the hold's is, and takes again once it has landed (Issue #751, ruling D2 (b))", () => {
  const r = rig();
  r.mouse("pointermove", 310, 220);
  r.now.busy = true;
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "false", "ignored mid-draw");
  assert.equal(r.calls.length, 0, "nothing shown or hidden");
  r.now.busy = false;
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "true", "taken once the world has landed");
  assert.deepEqual(r.calls.at(-1), ["show", { x: 300, y: 200 }]);
  const lit = r.calls.length;
  r.now.busy = true;
  r.press.fire("click");
  assert.equal(r.press.getAttribute("aria-pressed"), "true", "ignored again while lit");
  assert.equal(r.calls.length, lit, "no new call");
});
