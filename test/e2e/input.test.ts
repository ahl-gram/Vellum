import { test } from "node:test";
import assert from "node:assert/strict";
import {
  keyDown,
  keyUp,
  mouseDown,
  mouseMove,
  mouseUp,
  mouseWheel,
  sendClick,
  sendKey,
  sendTouch,
} from "../../e2e/support/input.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const KEY_EVENT = "Input.dispatchKeyEvent";
const MOUSE_EVENT = "Input.dispatchMouseEvent";

function recorder(): { sent: Array<[string, Record<string, unknown> | undefined]>; send: SuiteContext["send"] } {
  const sent: Array<[string, Record<string, unknown> | undefined]> = [];
  const send = ((method: string, params?: Record<string, unknown>): Promise<unknown> => {
    sent.push([method, params]);
    return Promise.resolve({});
  }) as unknown as SuiteContext["send"];
  return { sent, send };
}

test("sendKey presses a key as one keyDown then one keyUp, each carrying the key, its code and its virtual key code and nothing else", async () => {
  const r = recorder();
  await sendKey(r.send, "Escape", "Escape", 27);
  assert.deepEqual(r.sent, [
    [KEY_EVENT, { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }],
    [KEY_EVENT, { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }],
  ]);
});

test("sendKey puts text and unmodifiedText on the keyDown alone, the character that lets Enter press a focused button", async () => {
  const r = recorder();
  await sendKey(r.send, "Enter", "Enter", 13, { text: "\r", unmodifiedText: "\r" });
  assert.deepEqual(r.sent, [
    [
      KEY_EVENT,
      { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r", unmodifiedText: "\r" },
    ],
    [KEY_EVENT, { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }],
  ]);
});

test("sendKey sends a text with no unmodifiedText when its caller gives none", async () => {
  const r = recorder();
  await sendKey(r.send, "Enter", "Enter", 13, { text: "\r" });
  assert.deepEqual(r.sent, [
    [KEY_EVENT, { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" }],
    [KEY_EVENT, { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }],
  ]);
});

test("sendKey carries nativeVirtualKeyCode and modifiers on both events, a modifiers of 0 included", async () => {
  const r = recorder();
  await sendKey(r.send, "Tab", "Tab", 9, { nativeVirtualKeyCode: 9, modifiers: 0 });
  await sendKey(r.send, "Tab", "Tab", 9, { modifiers: 8 });
  const both = { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 };
  assert.deepEqual(r.sent, [
    [KEY_EVENT, { type: "keyDown", ...both, nativeVirtualKeyCode: 9, modifiers: 0 }],
    [KEY_EVENT, { type: "keyUp", ...both, nativeVirtualKeyCode: 9, modifiers: 0 }],
    [KEY_EVENT, { type: "keyDown", ...both, modifiers: 8 }],
    [KEY_EVENT, { type: "keyUp", ...both, modifiers: 8 }],
  ]);
});

test("sendKey's down option makes the press's first event a rawKeyDown and leaves its release a keyUp", async () => {
  const r = recorder();
  await sendKey(r.send, "PageDown", "PageDown", 34, { down: "rawKeyDown", nativeVirtualKeyCode: 34 });
  const both = { key: "PageDown", code: "PageDown", windowsVirtualKeyCode: 34, nativeVirtualKeyCode: 34 };
  assert.deepEqual(r.sent, [
    [KEY_EVENT, { type: "rawKeyDown", ...both }],
    [KEY_EVENT, { type: "keyUp", ...both }],
  ]);
});

test("keyDown and keyUp each send the one event they name, for a key held across reads and released on its own", async () => {
  const r = recorder();
  await keyDown(r.send, "l", "KeyL", 76, { text: "l" });
  await keyUp(r.send, "l", "KeyL", 76);
  await keyUp(r.send, "¬", "KeyL", 76, { modifiers: 1 });
  assert.deepEqual(r.sent, [
    [KEY_EVENT, { type: "keyDown", key: "l", code: "KeyL", windowsVirtualKeyCode: 76, text: "l" }],
    [KEY_EVENT, { type: "keyUp", key: "l", code: "KeyL", windowsVirtualKeyCode: 76 }],
    [KEY_EVENT, { type: "keyUp", key: "¬", code: "KeyL", windowsVirtualKeyCode: 76, modifiers: 1 }],
  ]);
});

test("mouseMove sends a hover as its type and point alone, and a held move with the left button and buttons 1, as a real mouse does", async () => {
  const r = recorder();
  await mouseMove(r.send, 5, 6);
  await mouseMove(r.send, 7, 8, { buttons: 0 });
  await mouseMove(r.send, 9, 10, { buttons: 1 });
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mouseMoved", x: 5, y: 6 }],
    [MOUSE_EVENT, { type: "mouseMoved", x: 7, y: 8 }],
    [MOUSE_EVENT, { type: "mouseMoved", x: 9, y: 10, button: "left", buttons: 1 }],
  ]);
});

test("mouseDown and mouseUp send the left button, buttons 1 on the press and 0 on the release, and a clickCount of 1 unless given", async () => {
  const r = recorder();
  await mouseDown(r.send, 1, 2);
  await mouseUp(r.send, 3, 4);
  await mouseDown(r.send, 1, 2, { clickCount: 2 });
  await mouseUp(r.send, 3, 4, { clickCount: 2 });
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mousePressed", x: 1, y: 2, button: "left", buttons: 1, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mouseReleased", x: 3, y: 4, button: "left", buttons: 0, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mousePressed", x: 1, y: 2, button: "left", buttons: 1, clickCount: 2 }],
    [MOUSE_EVENT, { type: "mouseReleased", x: 3, y: 4, button: "left", buttons: 0, clickCount: 2 }],
  ]);
});

test("sendClick presses and then releases at the one point, with no move between, a given clickCount on both", async () => {
  const r = recorder();
  await sendClick(r.send, 11, 12);
  await sendClick(r.send, 11, 12, { clickCount: 2 });
  const press = { x: 11, y: 12, button: "left" };
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mousePressed", ...press, buttons: 1, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mouseReleased", ...press, buttons: 0, clickCount: 1 }],
    [MOUSE_EVENT, { type: "mousePressed", ...press, buttons: 1, clickCount: 2 }],
    [MOUSE_EVENT, { type: "mouseReleased", ...press, buttons: 0, clickCount: 2 }],
  ]);
});

test("mouseWheel sends its deltas as given, a deltaX of 0 when none is", async () => {
  const r = recorder();
  await mouseWheel(r.send, 20, 30, -120);
  await mouseWheel(r.send, 20, 30, 6, 120);
  assert.deepEqual(r.sent, [
    [MOUSE_EVENT, { type: "mouseWheel", x: 20, y: 30, deltaX: 0, deltaY: -120 }],
    [MOUSE_EVENT, { type: "mouseWheel", x: 20, y: 30, deltaX: 120, deltaY: 6 }],
  ]);
});

test("sendTouch sends its type and its points as the touchPoints, an empty list ending every finger", async () => {
  const r = recorder();
  await sendTouch(r.send, "touchStart", [{ x: 1, y: 2, id: 1 }]);
  await sendTouch(r.send, "touchEnd", []);
  assert.deepEqual(r.sent, [
    ["Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 1, y: 2, id: 1 }] }],
    ["Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }],
  ]);
});
