import { test } from "node:test";
import assert from "node:assert/strict";
import { FOLD_SETTLE_MS, bindSlip, type Listens } from "../../src/site/shared/slip.ts";

// #462 chart-room ruling 3: the slip folds to a bookmark tab and comes back from it; on a phone a button covering its head is the bottom sheet's handle (skeptic finding 3, PR #488: a keyboard needs a toggle too).

type Handler = (e: Event) => void;
const listener = () => {
  const handlers = new Map<string, Handler>();
  const on: Listens = { addEventListener: (type, fn) => handlers.set(type, fn) };
  const fire = (type: string, target: unknown = {}) => {
    const fn = handlers.get(type);
    assert.ok(fn, `listens for ${type}`);
    fn({ type, target } as unknown as Event);
  };
  return { on, fire };
};
const classed = () => {
  const set = new Set<string>();
  return {
    classList: {
      add: (c: string) => { set.add(c); },
      remove: (c: string) => { set.delete(c); },
      toggle: (c: string) => (set.has(c) ? (set.delete(c), false) : (set.add(c), true)),
      contains: (c: string) => set.has(c),
    },
    has: (c: string) => set.has(c),
  };
};

const fixture = () => {
  const slip = classed();
  const tabEvents = listener();
  const tab = { ...classed(), ...tabEvents.on };
  const fold = listener();
  const handleEvents = listener();
  const attrs: Record<string, string> = {};
  const handle = { ...handleEvents.on, setAttribute: (n: string, v: string) => { attrs[n] = v; } };
  const layouts: number[] = [];
  const pending: Array<{ run: () => void; ms: number }> = [];
  bindSlip({
    slip, fold: fold.on, tab, handle,
    onLayout: () => { layouts.push(Date.now()); },
    after: (run, ms) => { pending.push({ run, ms }); },
  });
  return { slip, tab, tabEvents, fold, handle: handleEvents, attrs, layouts, pending };
};

test("the fold button folds the slip away and shows the tab; the tab brings it back and hides itself", () => {
  const f = fixture();
  f.fold.fire("click");
  assert.ok(f.slip.has("folded") && f.tab.has("shown"), "folded, tab shown");
  f.tabEvents.fire("click");
  assert.ok(!f.slip.has("folded") && !f.tab.has("shown"), "back, tab gone");
});

test("a fold relays the room's layout only after the transition has settled", () => {
  const f = fixture();
  f.fold.fire("click");
  assert.equal(f.layouts.length, 0, "nothing measured mid-transition (the slip is still where it was)");
  assert.equal(f.pending.length, 1);
  assert.equal(f.pending[0].ms, FOLD_SETTLE_MS, "the wait is the sheet's transition plus a beat");
  f.pending[0].run();
  assert.equal(f.layouts.length, 1, "then the room re-measures once");
});

test("the handle opens and closes the sheet at once and says so to assistive tech", () => {
  const f = fixture();
  f.handle.fire("click");
  assert.ok(f.slip.has("open"), "opened");
  assert.equal(f.attrs["aria-expanded"], "true");
  assert.equal(f.layouts.length, 1, "the room re-measures at once (no transition on the sheet)");
  f.handle.fire("click");
  assert.ok(!f.slip.has("open"), "closed again");
  assert.equal(f.attrs["aria-expanded"], "false");
});
