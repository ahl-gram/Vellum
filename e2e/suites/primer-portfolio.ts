// The Primer's drift check over the Portfolio's ladder (Issue #1252): every step at 1280x800 with motion reduced, the two that stand in the Explorer booted and rested as the Explorer is.
import { PORTFOLIO } from "../../src/site/shared/primer/portfolio.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    PORTFOLIO,
    "PO0 the Portfolio's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
