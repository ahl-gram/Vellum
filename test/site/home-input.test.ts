import { test } from "node:test";
import assert from "node:assert/strict";
import { El } from "../../test-support/element-shim.ts";
import { bindStageInput, type StageInputHandlers } from "../../src/site/home/input.ts";

(globalThis as { Element?: unknown }).Element ??= function Element() {
  return undefined;
};

const rig = (takes: boolean) => {
  const stage = Object.assign(new El("div"), { setPointerCapture() {} });
  const calls: string[] = [];
  const state = { takes };
  const handlers: StageInputHandlers = {
    pan: () => {},
    press: () => void calls.push("press"),
    release: () => {},
    wheelZoom: () => false,
    pinch: () => {},
    dive: () => void calls.push("dive"),
    key: () => false,
    takesTouch: () => state.takes,
  };
  bindStageInput(stage as unknown as HTMLElement, handlers);
  return { stage, calls };
};
const finger = (id: number, x: number) => ({
  pointerType: "touch",
  pointerId: id,
  clientX: x,
  clientY: 10,
  target: null,
});

test("with the stage not taking touch, two fingers never press or pinch the map and a tap's double click never dives; with it taking touch they do (Issue #778)", () => {
  const off = rig(false);
  off.stage.fire("pointerdown", finger(1, 10));
  off.stage.fire("pointerdown", finger(2, 60));
  off.stage.fire("dblclick", { target: null, clientX: 10, clientY: 10 });
  assert.deepEqual(off.calls, [], "the page's fingers: no press, no dive");

  const on = rig(true);
  on.stage.fire("pointerdown", finger(1, 10));
  on.stage.fire("pointerdown", finger(2, 60));
  on.stage.fire("dblclick", { target: null, clientX: 10, clientY: 10 });
  assert.deepEqual(on.calls, ["press", "dive"], "the chart's fingers: the second finger presses, the double tap dives");

  const mouse = rig(false);
  mouse.stage.fire("pointerdown", { pointerType: "mouse", pointerId: 3, clientX: 10, clientY: 10, target: null });
  mouse.stage.fire("dblclick", { target: null, clientX: 10, clientY: 10 });
  assert.deepEqual(mouse.calls, ["press", "dive"], "a mouse is the camera's whatever the touch press says");
});
