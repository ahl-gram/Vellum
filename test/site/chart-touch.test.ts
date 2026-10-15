import { test } from "node:test";
import assert from "node:assert/strict";
import { El } from "../../test-support/element-shim.ts";
import { bindChartTouch, holdTouch, touchHeld, type TouchPress } from "../../src/site/shared/chart-touch.ts";

const store = (initial: Record<string, string> = {}) => {
  const items = new Map(Object.entries(initial));
  const storage = {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
  } as unknown as Storage;
  return { items, get: () => storage };
};
const refusing = (): Storage =>
  ({
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  }) as unknown as Storage;

const press = (): El & TouchPress => {
  const p = new El("button");
  p.setAttribute("hidden", "");
  p.setAttribute("aria-pressed", "false");
  return p;
};
const taker = () => {
  const calls: boolean[] = [];
  return { calls, take: (on: boolean): void => void calls.push(on) };
};

test("the visit's choice reads back as written, and a refusing storage reads off and swallows a write (Issue #778)", () => {
  const s = store();
  assert.equal(touchHeld(s.get), false, "an empty store is off");
  holdTouch(s.get, true);
  assert.equal(touchHeld(s.get), true, "given reads back given");
  holdTouch(s.get, false);
  assert.equal(touchHeld(s.get), false, "taken back reads back off");
  assert.equal(touchHeld(refusing), false);
  assert.doesNotThrow(() => holdTouch(refusing, true));
});

test("where touch is the main pointer the press shows off and tells the camera so, and a click gives the chart the finger and stores it (Issue #778)", () => {
  const s = store();
  const p = press();
  const t = taker();
  bindChartTouch(p, t.take, { device: true, getStorage: s.get });
  assert.equal(p.getAttribute("hidden"), null, "the press is shown");
  assert.equal(p.getAttribute("aria-pressed"), "false", "and starts off");
  assert.deepEqual(t.calls, [false], "the camera is told at boot");
  p.fire("click");
  assert.equal(p.getAttribute("aria-pressed"), "true");
  assert.deepEqual(t.calls, [false, true]);
  assert.equal(touchHeld(s.get), true, "the choice is held for the visit");
  p.fire("click");
  assert.equal(p.getAttribute("aria-pressed"), "false");
  assert.deepEqual(t.calls, [false, true, false]);
  assert.equal(touchHeld(s.get), false);
});

test("a visit that gave the chart the finger boots with it given (Issue #778)", () => {
  const p = press();
  const t = taker();
  bindChartTouch(p, t.take, { device: true, getStorage: store({ "vellum.chart-touch.v1": "1" }).get });
  assert.equal(p.getAttribute("aria-pressed"), "true");
  assert.deepEqual(t.calls, [true]);
});

test("on a device without touch the press stays hidden and the camera is never told (Issue #778)", () => {
  const s = store({ "vellum.chart-touch.v1": "1" });
  const p = press();
  const t = taker();
  bindChartTouch(p, t.take, { device: false, getStorage: s.get });
  assert.equal(p.getAttribute("hidden"), "", "the press stays hidden");
  assert.deepEqual(t.calls, [], "the camera is never told");
  assert.doesNotThrow(() => bindChartTouch(null, t.take, { device: true, getStorage: s.get }));
  assert.deepEqual(t.calls, []);
});
