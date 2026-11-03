// The suites' key presses, once (Issue #1016).
import type { SuiteContext } from "../types.ts";

type Send = SuiteContext["send"];
type BothEvents = { nativeVirtualKeyCode?: number; modifiers?: number };
type PressOptions = BothEvents & { down?: "rawKeyDown"; text?: string; unmodifiedText?: string };

const KEY_EVENT = "Input.dispatchKeyEvent";

export async function keyDown(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  void options;
  await send(KEY_EVENT, { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
}

export async function keyUp(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: BothEvents = {},
): Promise<void> {
  void options;
  await send(KEY_EVENT, { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
}

export async function sendKey(
  send: Send,
  key: string,
  code: string,
  vk: number,
  options: PressOptions = {},
): Promise<void> {
  await keyDown(send, key, code, vk, options);
}
