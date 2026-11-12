// The Primer's drift check over the Prospect's ladder (Issue #1252): every step at 1280x800 with motion reduced; its first step, opened in the Explorer, reads exactly what the Explorer's own card step reads, so it is walked there.
import { PROSPECT } from "../../src/site/shared/primer/prospect.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    PROSPECT,
    "PQ0 the Prospect's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
