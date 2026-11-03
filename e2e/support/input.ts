// The suites' key presses, once (Issue #1016).
import type { SuiteContext } from "../types.ts";

type Send = SuiteContext["send"];
type BothEvents = { nativeVirtualKeyCode?: number; modifiers?: number };
type PressOptions = BothEvents & { down?: "rawKeyDown"; text?: string; unmodifiedText?: string };

const KEY_EVENT = "Input.dispatchKeyEvent";

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
