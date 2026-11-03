import { test } from "node:test";
import assert from "node:assert/strict";
import { keyDown, keyUp, sendKey } from "../../e2e/support/input.ts";
import type { SuiteContext } from "../../e2e/types.ts";

const KEY_EVENT = "Input.dispatchKeyEvent";

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
