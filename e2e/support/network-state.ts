import type { SuiteContext } from "../types.ts";
import { bounded, RESET_BOUND_MS } from "./runner.ts";

export type NetworkConditions = {
  readonly offline: boolean;
  readonly latency: number;
  readonly downloadThroughput: number;
  readonly uploadThroughput: number;
};

export const NO_BLOCKED_URLS = { urls: [] } as const;
export const NO_THROTTLE: NetworkConditions = {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
};

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
  const value = await body();
  await bounded(send(method, off), boundMs);
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

export function withThrottle<T>(
  send: Send,
  conditions: NetworkConditions,
  body: () => Promise<T>,
  boundMs: number = RESET_BOUND_MS,
): Promise<T> {
  return holding(send, "Network.emulateNetworkConditions", conditions, NO_THROTTLE, body, boundMs);
}
