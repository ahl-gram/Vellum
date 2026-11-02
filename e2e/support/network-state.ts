import type { SuiteContext } from "../types.ts";
import { bounded, RESET_BOUND_MS } from "./runner.ts";

const NO_BLOCKED_URLS = { urls: [] } as const;

type Send = SuiteContext["send"];

async function holding<T>(
  send: Send,
  method: string,
  on: Record<string, unknown>,
  off: Record<string, unknown>,
  body: () => Promise<T>,
  boundMs: number,
): Promise<T> {
  await send(method, on);
  let value: T;
  try {
    value = await body();
  } catch (failure) {
    await bounded(send(method, off), boundMs);
    throw failure;
  }
  await send(method, off);
  return value;
}

export function withBlockedUrls<T>(
  send: Send,
  urls: readonly string[],
  body: () => Promise<T>,
  boundMs: number = RESET_BOUND_MS,
): Promise<T> {
  return holding(send, "Network.setBlockedURLs", { urls }, NO_BLOCKED_URLS, body, boundMs);
}
