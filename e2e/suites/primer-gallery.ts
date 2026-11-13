// The Primer's drift check over the Gallery's ladder (Issue #1252): both steps at 1280x800 with motion reduced.
import { GALLERY } from "../../src/site/shared/primer/gallery.ts";
import { walkLadder } from "../support/primer-walk.ts";
import type { SuiteContext } from "../types.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  await walkLadder(
    ctx,
    GALLERY,
    "PG0 the Gallery's ladder logged no console error and fetched nothing that answered 4xx",
  );
}
