import { fileURLToPath } from "node:url";
import type { StartOptions, SuiteContext } from "../types.ts";
import type { E2eCheckResult, E2eRunHooks, E2eSuiteName, E2eSuiteRunners, E2eSuiteTiming } from "./suites.ts";

export type Accumulators = Pick<StartOptions, "results" | "consoleErrors" | "http4xx" | "skippedGroups">;
export type RunnerContext = Pick<SuiteContext, "check" | "alive" | "clearMobile">;
export type EnvLike = Readonly<Record<string, string | undefined>>;

export interface RunnerDeps<C extends RunnerContext> {
  readonly findBrowser: () => string | null;
  readonly start: (options: StartOptions) => Promise<C>;
  readonly cleanup: () => void;
  readonly suites: E2eSuiteRunners<C>;
}

export interface RunnerIo<C extends RunnerContext> extends RunnerDeps<C> {
  readonly env: EnvLike;
  readonly isTTY: boolean;
  readonly accumulators: Accumulators;
  readonly out: (line: string) => void;
  readonly err: (...parts: unknown[]) => void;
}

export const REPO = fileURLToPath(new URL("../..", import.meta.url));
export const RUNNER_SKIP_LINE = "Skipping: no browser";
export const RESET_BOUND_MS = 5000;

export function runnerHooks<C extends RunnerContext>(
  ctx: C,
  accumulators: Accumulators,
  err: (...parts: unknown[]) => void,
  boundMs: number = RESET_BOUND_MS,
): E2eRunHooks {
  void ctx;
  void accumulators;
  void err;
  void boundMs;
  return {};
}

export function reportLines(
  timings: readonly E2eSuiteTiming[],
  selected: readonly E2eSuiteName[],
  tier: string,
): readonly string[] {
  void timings;
  void selected;
  void tier;
  return [];
}

export function harnessErrorLines(results: readonly E2eCheckResult[]): readonly string[] {
  return results.length < 0 ? ["tally"] : [];
}

export async function runE2e<C extends RunnerContext>(io: RunnerIo<C>): Promise<number> {
  void io;
  return Promise.resolve(0);
}

export function runE2eFromProcess<C extends RunnerContext>(
  accumulators: Accumulators,
  deps: RunnerDeps<C>,
): Promise<number> {
  void accumulators;
  void deps;
  return Promise.resolve(0);
}
