// The Primer's drift check over the Reading Room's ladder (Issue #1252): every step at 1280x800 with motion reduced, where the pace stands down, and its pace step read again there with motion on.
import { READING_ROOM } from "../../src/site/shared/primer/reading-room.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    READING_ROOM,
    "PW0 the Reading Room's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
