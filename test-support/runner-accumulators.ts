import type { Accumulators } from "../e2e/support/runner.ts";

export const freshAccumulators = (): Accumulators => ({
  results: [],
  consoleErrors: [],
  http4xx: [],
  skippedGroups: [],
  skippedChecks: [],
});
