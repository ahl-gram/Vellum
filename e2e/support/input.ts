// The suites' key presses, mouse events and touches, once (Issue #1016).
import type { SuiteContext, TouchPoint } from "../types.ts";

type Send = SuiteContext["send"];
type BothEvents = { nativeVirtualKeyCode?: number; modifiers?: number };
type PressOptions = BothEvents & { down?: "rawKeyDown"; text?: string; unmodifiedText?: string };
type Clicks = { clickCount?: number };

const KEY_EVENT = "Input.dispatchKeyEvent";
const MOUSE_EVENT = "Input.dispatchMouseEvent";

const keyFields = (key: string, code: string, vk: number, { nativeVirtualKeyCode, modifiers }: BothEvents) => ({
  key,
  code,
  windowsVirtualKeyCode: vk,
  ...(nativeVirtualKeyCode === undefined ? {} : { nativeVirtualKeyCode }),
  ...(modifiers === undefined ? {} : { modifiers }),
});

export async function keyDown(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  const { down = "keyDown", text, unmodifiedText } = options;
  await send(KEY_EVENT, {
    type: down,
    ...keyFields(key, code, vk, options),
    ...(text === undefined ? {} : { text }),
    ...(unmodifiedText === undefined ? {} : { unmodifiedText }),
  });
}

export async function keyUp(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: BothEvents = {},
): Promise<void> {
  await send(KEY_EVENT, { type: "keyUp", ...keyFields(key, code, vk, options) });
}

export async function sendKey(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  await keyDown(send, key, code, vk, options);
  await keyUp(send, key, code, vk, options);
}

export async function mouseMove(
  send: Send,
  x: number,
  y: number,
  { buttons = 0 }: { buttons?: 0 | 1 } = {},
): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseMoved", x, y, buttons });
}

export async function mouseDown(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mousePressed", x, y, clickCount });
}

export async function mouseUp(send: Send, x: number, y: number, { clickCount = 1 }: Clicks = {}): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseReleased", x, y, clickCount });
}

export async function sendClick(send: Send, x: number, y: number, options: Clicks = {}): Promise<void> {
  await mouseDown(send, x, y, options);
}

export async function mouseWheel(send: Send, x: number, y: number, deltaY: number, deltaX = 0): Promise<void> {
  await send(MOUSE_EVENT, { type: "mouseWheel", x, y, deltaX: deltaY, deltaY: deltaX });
}

export async function sendTouch(send: Send, type: string, points: readonly TouchPoint[]): Promise<void> {
  await send("Input.dispatchTouchEvent", { type, points });
}
