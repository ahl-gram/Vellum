import type { SuiteContext } from "../types.ts";

export async function withScriptsOff<T>(send: SuiteContext["send"], body: () => Promise<T>): Promise<T> {
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  let value: T;
  try {
    value = await body();
  } catch (failure) {
    await send("Emulation.setScriptExecutionDisabled", { value: false }).catch(() => undefined);
    throw failure;
  }
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  return value;
}
