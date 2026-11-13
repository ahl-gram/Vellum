// The Primer's drift check over the Writing Room's ladder (Issue #1252): every step at 1280x800 with motion reduced, each sentence typed into the box and founded by a real press on Found.
import { WRITING_ROOM } from "../../src/site/shared/primer/writing-room.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    WRITING_ROOM,
    "PN0 the Writing Room's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
