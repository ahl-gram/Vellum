// The Primer's drift check over Today's ladder (Issue #1252): every step at 1280x800 with motion reduced, on the day the harness fixes, so the press on the chart's centre reads the same band on every date.
import { TODAY } from "../../src/site/shared/primer/seed-of-the-day.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(ctx, TODAY, "PD0 Today's ladder logged no console error and fetched nothing that answered 4xx");
}
