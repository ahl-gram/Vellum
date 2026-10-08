import type { SuiteContext } from "../types.ts";

export async function withScriptsOff<T>(send: SuiteContext["send"], body: () => Promise<T>): Promise<T> {
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  try {
    return await body();
  } finally {
    await send("Emulation.setScriptExecutionDisabled", { value: false }).catch(() => undefined);
  }
}
