import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { countEvents, flipLanded, flippedBack, rolledFrom, type CardRoll } from "../../e2e/support/witness.ts";

const BOX: [number, number, number, number] = [10, 20, 256, 300];
const MOVED: [number, number, number, number] = [10, 20, 256, 301];
const roll = (shown: boolean, pinned: boolean, card: CardRoll["card"]): CardRoll => ({ shown, pinned, card });
const HIDDEN = roll(false, false, null);

test("rolledFrom departs a hidden card when it shows, a shown one when it pins, and a pinned one only when its box moves", () => {
  assert.equal(rolledFrom(HIDDEN)(roll(true, false, BOX)), true, "hidden to shown");
  assert.equal(rolledFrom(HIDDEN)(HIDDEN), false, "hidden to hidden");
  assert.equal(rolledFrom(roll(true, false, BOX))(roll(true, true, BOX)), true, "unpinned to pinned");
  assert.equal(rolledFrom(roll(true, false, BOX))(roll(true, false, MOVED)), false, "unpinned to unpinned, box moved");
  assert.equal(rolledFrom(roll(true, true, BOX))(roll(true, true, MOVED)), true, "pinned to a moved box");
  assert.equal(rolledFrom(roll(true, true, BOX))(roll(true, true, BOX)), false, "pinned to the same box");
});

test("flipLanded holds only once the flip's transition has gone and the leaf is past edge-on, and flippedBack only once the 3D context is gone", () => {
  assert.equal(flipLanded({ versoed: true, flip3d: true, m11: -1, running: 0 }), true, "landed");
  assert.equal(flipLanded({ versoed: true, flip3d: true, m11: -0.4, running: 1 }), false, "mid-flight");
  assert.equal(flipLanded({ versoed: true, flip3d: true, m11: 1, running: 0 }), false, "just pressed");
  assert.equal(flippedBack({ versoed: false, flip3d: true, m11: -0.2, running: 1 }), false, "flipping back");
  assert.equal(flippedBack({ versoed: false, flip3d: false, m11: 1, running: 0 }), true, "flipped back");
});

const pageOf = () => {
  const listeners: { type: string; fire: () => void }[] = [];
  const win: Record<string, unknown> = {
    addEventListener: (type: string, fire: () => void) => void listeners.push({ type, fire }),
  };
  win.window = win;
  vm.createContext(win);
  const fire = (type: string) => listeners.filter((l) => l.type === type).forEach((l) => l.fire());
  return { win, listeners, fire };
};

test("countEvents counts each event once from its arm, and a second arm zeroes it without a second listener", () => {
  const { arm, seen } = countEvents(["wheel"]);
  const { win, listeners, fire } = pageOf();
  vm.runInContext(arm, win);
  fire("wheel");
  fire("wheel");
  assert.equal(vm.runInContext(seen, win), 2);
  vm.runInContext(arm, win);
  fire("wheel");
  assert.equal(vm.runInContext(seen, win), 1);
  assert.equal(listeners.length, 1, "a second arm added a second listener");
});

test("countEvents counts every type it is given and ignores the others", () => {
  const { arm, seen } = countEvents(["pointerup", "mouseup"]);
  const { win, listeners, fire } = pageOf();
  vm.runInContext(arm, win);
  fire("pointerup");
  fire("mouseup");
  fire("click");
  assert.equal(listeners.length, 2);
  assert.equal(vm.runInContext(seen, win), 2);
});
