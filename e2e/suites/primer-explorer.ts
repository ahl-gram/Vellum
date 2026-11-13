// The Primer's drift check over the Explorer's ladder (Issue #1250): every step at 1280x800 with motion reduced, a tablet step held hidden there and read again under touch at 1024x768.
import { EXPLORER } from "../../src/site/shared/primer/explorer.ts";
import { walkLadder } from "../support/primer-walk.ts";
import { handChecks } from "./primer-explorer/hand.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await handChecks(ctx);
  await walkLadder(
    ctx,
    EXPLORER,
    "PE0 the Explorer's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
