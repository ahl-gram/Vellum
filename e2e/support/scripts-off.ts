import type { SuiteContext } from "../types.ts";

export async function withScriptsOff<T>(send: SuiteContext["send"], body: () => Promise<T>): Promise<T> {
  void send;
  return body();
}
