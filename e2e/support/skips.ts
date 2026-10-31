import type { E2eSuiteName, E2eSuiteTiming } from "./suites.ts";

export interface E2eSuiteStep {
  readonly suite: E2eSuiteName;
  readonly step: string;
}

export interface E2eSkip extends E2eSuiteStep {
  readonly issue: number;
}

export const E2E_SKIPS: readonly E2eSkip[] = [
  { suite: "room-instrument", step: "RS30", issue: 622 },
  { suite: "chart-drawer", step: "CD25, CD26, CD30", issue: 716 },
  { suite: "corners", step: "FL1", issue: 894 },
  { suite: "stage", step: "EA7", issue: 897 },
  { suite: "stage", step: "EA8", issue: 897 },
  { suite: "zoom", step: "Z21, Z21b", issue: 1085 },
  { suite: "chart-drawer", step: "CD61", issue: 944 },
];

export function skipFor(skips: readonly E2eSkip[], suite: E2eSuiteName, step: string): E2eSkip | undefined {
  return skips.find((s) => s.suite === suite && s.step === step);
}

export function skipLabel(skip: E2eSkip): string {
  return `${skip.step}, Issue #${skip.issue}`;
}

export function unmetSkips(
  skips: readonly E2eSkip[],
  timings: readonly E2eSuiteTiming[],
  met: readonly E2eSuiteStep[],
): readonly E2eSkip[] {
  return skips.filter(
    (s) =>
      timings.some((t) => t.name === s.suite && !t.aborted) &&
      !met.some((m) => m.suite === s.suite && m.step === s.step),
  );
}

export function metSkips(skips: readonly E2eSkip[], met: readonly E2eSuiteStep[]): readonly E2eSkip[] {
  return skips.filter((s) => met.some((m) => m.suite === s.suite && m.step === s.step));
}

export async function closedSkips(
  skips: readonly E2eSkip[],
  stateOf: (issue: number) => Promise<string>,
): Promise<readonly E2eSkip[]> {
  const states = await Promise.all(skips.map((s) => stateOf(s.issue)));
  return skips.filter((_, i) => states[i] !== "open");
}
