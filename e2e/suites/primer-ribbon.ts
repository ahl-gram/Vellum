// The Primer's drift check over the Ribbon's ladder (Issue #1252): every step at 1280x800 with motion reduced; its first step, opened in the Explorer, reads exactly what the Explorer's own Take the road step reads, so it is walked there.
import { RIBBON } from "../../src/site/shared/primer/ribbon.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    RIBBON,
    "PU0 the Ribbon's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
