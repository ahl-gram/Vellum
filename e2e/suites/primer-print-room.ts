// The Primer's drift check over the Print Room's ladder (Issue #1252): every step at 1280x800 with motion reduced, the atlas bound before the two steps that read its contents and its presses.
import { PRINT_ROOM } from "../../src/site/shared/primer/print-room.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    PRINT_ROOM,
    "PT0 the Print Room's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
