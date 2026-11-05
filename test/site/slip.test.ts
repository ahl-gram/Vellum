import { test } from "node:test";
import assert from "node:assert/strict";
import { bindSlip, type Listens } from "../../src/site/shared/slip.ts";

// Issue #462 chart-room ruling 3: the slip folds to a bookmark tab and comes back from it.

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
      add: (c: string) => {
        set.add(c);
      },
      remove: (c: string) => {
        set.delete(c);
      },
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
  const folds: boolean[] = [];
  bindSlip({
    slip,
    fold: fold.on,
    tab,
    onFold: () => {
      folds.push(slip.has("folded"));
    },
  });
  return { slip, tab, tabEvents, fold, folds };
};

test("the fold button folds the slip away and shows the tab; the tab brings it back and hides itself", () => {
  const f = fixture();
  f.fold.fire("click");
  assert.ok(f.slip.has("folded") && f.tab.has("shown"), "folded, tab shown");
  f.tabEvents.fire("click");
  assert.ok(!f.slip.has("folded") && !f.tab.has("shown"), "back, tab gone");
});

test("a fold lays the room out at its press, once, with the slip's class already landed, and so does the tab (Issue #1261)", () => {
  const f = fixture();
  f.fold.fire("click");
  assert.deepEqual(f.folds, [true], "one layout at the press, the slip already folded");
  f.tabEvents.fire("click");
  assert.deepEqual(f.folds, [true, false], "one more at the tab's press, the slip already open");
});
