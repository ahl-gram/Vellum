import type { E2eSuiteName, E2eSuiteTiming } from "./suites.ts";

export interface E2eSkip {
  readonly suite: E2eSuiteName;
  readonly step: string;
  readonly issue: number;
}

export const E2E_SKIPS: readonly E2eSkip[] = [];

export function skipFor(skips: readonly E2eSkip[], step: string): E2eSkip | undefined {
  return skips.find((s) => s.step === step);
}

export function skipLabel(skip: E2eSkip): string {
  return `${skip.step}, Issue #${skip.issue}`;
}

export function unmetSkips(
  _skips: readonly E2eSkip[],
  _timings: readonly E2eSuiteTiming[],
  _met: readonly string[],
): readonly E2eSkip[] {
  return [];
}

export function closedSkips(
  _skips: readonly E2eSkip[],
  _stateOf: (issue: number) => Promise<string>,
): Promise<readonly E2eSkip[]> {
  return Promise.resolve([]);
}
