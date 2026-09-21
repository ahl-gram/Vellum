import test from "node:test";
import assert from "node:assert/strict";
import { bindTableDrag, lengthPx } from "../../src/site/explorer/table-drag.ts";
import { El, installShim } from "../../test-support/element-shim.ts";

// The drag's state machine (Issue #523): what a carry does at each of its ends. The binder BUILDS DOM and listens on the document and the window, so the element shim stands in for the environment and the document's listeners are recorded here; every rect is the one the test states.

installShim();
const docListeners = new Map<string, Array<(e?: unknown) => void>>();
const winListeners = new Map<string, Array<(e?: unknown) => void>>();
const body = new El("body");
Object.assign(globalThis.document, {
  body,
  addEventListener: (type: string, fn: (e?: unknown) => void) => { docListeners.set(type, [...(docListeners.get(type) ?? []), fn]); },
  removeEventListener: (type: string, fn: (e?: unknown) => void) => { docListeners.set(type, (docListeners.get(type) ?? []).filter((f) => f !== fn)); },
});
(globalThis as { window?: unknown }).window = {
  addEventListener: (type: string, fn: (e?: unknown) => void) => { winListeners.set(type, [...(winListeners.get(type) ?? []), fn]); },
  removeEventListener: (type: string, fn: (e?: unknown) => void) => { winListeners.set(type, (winListeners.get(type) ?? []).filter((f) => f !== fn)); },
};
const fireDoc = (type: string, e: unknown) => { for (const fn of [...(docListeners.get(type) ?? [])]) fn(e); };
const revoked: string[] = [];
URL.revokeObjectURL = ((u: string) => { revoked.push(u); }) as typeof URL.revokeObjectURL;
const nextTick = () => new Promise((r) => setTimeout(r, 0));

const MOUSE = { pointerType: "mouse", button: 0, isPrimary: true };
const BAND = { top: 552 };

/** A bound handle over recorders for every dep, the drawer's band at 552 and reduced motion ON so a snap-back ends synchronously. */
function bound(opts: { file?: boolean; band?: { top: number } | null; canDrag?: boolean; reduce?: boolean } = {}) {
  const handle = new El("button") as unknown as HTMLButtonElement & El;
  handle.rect = { left: 660, top: 115, right: 715, bottom: 170 };
  (handle as unknown as { isConnected: boolean }).isConnected = true;
  const calls = { reveal: 0, restore: 0, file: [] as string[], receiving: [] as boolean[], minted: 0 };
  bindTableDrag({
    handle,
    canDrag: () => opts.canDrag ?? true,
    ghostUrl: () => `blob:ghost-${++calls.minted}`,
    band: () => (opts.band === undefined ? BAND : opts.band),
    reveal: () => { calls.reveal++; return () => { calls.restore++; }; },
    receiving: (over) => { calls.receiving.push(over); },
    file: (url) => { calls.file.push(url); return opts.file ?? true; },
    prefersReduce: () => opts.reduce ?? true,
    settleMs: () => 340,
    settleEase: () => "cubic-bezier(0.22, 0.61, 0.36, 1)",
  });
  const ghost = () => body.children.find((c) => c.classList.contains("sheet-ghost")) ?? null;
  const press = (x: number, y: number) => handle.fire("pointerdown", { ...MOUSE, clientX: x, clientY: y });
  const move = (x: number, y: number) => fireDoc("pointermove", { clientX: x, clientY: y });
  const up = (x: number, y: number) => fireDoc("pointerup", { clientX: x, clientY: y });
  /** A click as the handle's capture listener sees it; `stopped` is what the swallow does. */
  const click = () => { const e = { stopped: false, prevented: false, stopImmediatePropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; } }; handle.fire("click", e); return e; };
  return { handle, calls, ghost, press, move, up, click, revoked };
}

test("TD8 the swallow is scoped to the click of its own release: a carry released AWAY from the ear leaves the next keyboard activation of the still-focused ear alive, and only a release ON the ear swallows the click that follows it (the cold review's finding 1 on PR #663)", async () => {
  const d = bound();
  d.press(700, 130); d.move(640, 680); d.up(640, 680);
  assert.equal(d.calls.file.length, 1, "released in the band, filed");
  await nextTick();
  assert.equal(d.click().stopped, false, "Enter on the ear after a filing is an honest click");
  d.press(700, 130); d.move(640, 300); d.up(640, 300);
  await nextTick();
  assert.equal(d.click().stopped, false, "and after a snap-back too");
  d.press(700, 130); d.move(690, 140); d.up(700, 130);
  assert.equal(d.click().stopped, true, "a jiggle released on the ear swallows the click the release fires");
  assert.equal(d.click().stopped, false, "once");
});

test("TD9 the drawer is revealed as the carry ENTERS the band and put back on a snap, never on a filing and never on a refused filing (D4 ruled 2026-09-21; the lane's call 4)", () => {
  const d = bound();
  d.press(700, 130); d.move(640, 300);
  assert.equal(d.calls.reveal, 0, "over the chart the drawer stays shut");
  d.move(640, 680);
  assert.equal(d.calls.reveal, 1, "entering the band opens it");
  assert.deepEqual(d.calls.receiving.slice(-2), [false, true], "with the drop cue");
  d.move(660, 700);
  assert.equal(d.calls.reveal, 1, "a second move still inside the band does not reveal again (the prover's round 2 hole)");
  d.move(640, 300);
  assert.equal(d.calls.reveal, 1, "backing out does not open it twice");
  d.move(640, 690);
  assert.equal(d.calls.reveal, 1, "nor does re-entering the band: one reveal per carry, and one restore to match");
  d.move(640, 300);
  d.up(640, 300);
  assert.equal(d.calls.restore, 1, "a snap puts it back");
  assert.equal(d.calls.file.length, 0);
  d.press(700, 130); d.move(640, 680); d.up(640, 680);
  assert.equal(d.calls.file.length, 1);
  assert.equal(d.calls.restore, 1, "a filing leaves the drawer open");
  const refused = bound({ file: false });
  refused.press(700, 130); refused.move(640, 680); refused.up(640, 680);
  assert.equal(refused.calls.file.length, 1);
  assert.equal(refused.calls.restore, 0, "a refused drop leaves it where lay put it");
  assert.equal(refused.ghost(), null, "and the ghost snapped back rather than being stranded");
});

test("TD10 one url per carry: a filing adopts it and every other end revokes it, whether the pointer is released, cancelled, the window loses focus or Escape is pressed", () => {
  const d = bound();
  revoked.length = 0;
  d.press(700, 130); d.move(640, 680); d.up(640, 680);
  assert.deepEqual(d.calls.file, ["blob:ghost-1"], "the ghost's url is the one handed to lay");
  assert.deepEqual(d.revoked, [], "adopted, not revoked");
  d.press(700, 130); d.move(640, 300); d.up(640, 300);
  assert.equal(d.revoked.at(-1), "blob:ghost-2", "a snap revokes");
  d.press(700, 130); d.move(640, 300); fireDoc("pointercancel", {});
  assert.equal(d.revoked.at(-1), "blob:ghost-3", "a cancel revokes");
  d.press(700, 130); d.move(640, 300); for (const fn of [...(winListeners.get("blur") ?? [])]) fn({});
  assert.equal(d.revoked.at(-1), "blob:ghost-4", "losing the window revokes");
  d.press(700, 130); d.move(640, 300); fireDoc("keydown", { key: "Escape" });
  assert.equal(d.revoked.at(-1), "blob:ghost-5", "Escape revokes");
  assert.equal(d.ghost(), null, "and no ghost is left on the body");
  assert.equal((docListeners.get("pointermove") ?? []).length, 0, "and no document listener outlives its carry");
});

test("TD11 a press that is not a mouse's primary button, or where no drawer can show, never begins a carry: no ghost, no url, no listener", () => {
  const d = bound();
  d.handle.fire("pointerdown", { ...MOUSE, pointerType: "touch", clientX: 700, clientY: 130 });
  assert.equal((docListeners.get("pointermove") ?? []).length, 0, "a touch adds nothing");
  const narrow = bound({ canDrag: false });
  narrow.press(700, 130);
  assert.equal((docListeners.get("pointermove") ?? []).length, 0, "nor a press where the drawer is stood down");
  assert.equal(narrow.calls.minted, 0);
  const slop = bound();
  slop.press(700, 130); slop.move(703, 132);
  assert.equal(slop.ghost(), null, "and a move under the slop mints no ghost");
  slop.up(703, 132);
  assert.equal(slop.calls.minted, 0);
});

test("TD12 the drawer's height token is read by its unit, so a band computed from it is a number in px or no band at all", () => {
  assert.equal(lengthPx("15.5rem", 16), 248);
  assert.equal(lengthPx("248px", 16), 248);
  assert.equal(lengthPx("  15.5rem ", 20), 310, "the root font size scales a rem");
  assert.equal(Number.isNaN(lengthPx("calc(100vh - 2rem)", 16)), true, "a length this reader cannot resolve is NaN, which bandOf reads as no band");
  assert.equal(Number.isNaN(lengthPx("", 16)), true);
});

test("TD13 a snap-back with motion flies to the ear's corner, and an ear that has left the page by then fades where it is rather than flying to an all-zero rect (the lane's call 6)", async () => {
  const frames: unknown[][] = [];
  (El.prototype as unknown as { animate: (f: unknown[]) => { finished: Promise<void> } }).animate = (f) => { frames.push(f); return { finished: Promise.resolve() }; };
  try {
    const d = bound({ reduce: false });
    d.press(700, 130); d.move(640, 300); d.up(640, 300);
    assert.equal(frames.length, 1, "with motion the snap-back is an animation");
    assert.ok("translate" in (frames[0]![1] as object), "flying to the ear's seat");
    assert.match(String((frames[0]![1] as { translate: string }).translate), /^\d+(\.\d+)?px/, "a real destination");
    (d.handle as unknown as { isConnected: boolean }).isConnected = false;
    d.press(700, 130); d.move(640, 300); d.up(640, 300);
    assert.equal(frames.length, 2);
    assert.equal("translate" in (frames[1]![1] as object), false, "a detached ear gets a fade in place, no flight");
    await Promise.resolve();
    assert.equal(d.ghost(), null, "and the ghost is gone once the animation finishes");
  } finally {
    delete (El.prototype as unknown as { animate?: unknown }).animate;
  }
});

test("TD14 a cancelled carry (Escape, a lost window, a cancelled pointer) still swallows the click of ITS eventual release on the ear, and a fresh press afterwards drops that pending swallow so an honest click files (the cold review's finding 3 on PR #663)", async () => {
  const d = bound();
  d.press(700, 130); d.move(706, 136); fireDoc("keydown", { key: "Escape" });
  assert.equal(d.ghost(), null, "Escape ended the carry");
  await nextTick();
  d.up(700, 130);
  assert.equal(d.click().stopped, true, "the release the reader still owes fires a click on the ear, and it is swallowed");
  await nextTick();
  assert.equal(d.click().stopped, false, "once");
  d.press(700, 130); d.move(706, 136); for (const fn of [...(winListeners.get("blur") ?? [])]) fn({});
  await nextTick();
  d.press(700, 130); d.up(700, 130);
  assert.equal(d.click().stopped, false, "a release that never reached the page (the window was lost) leaves no swallow for the next honest press and click");
});
