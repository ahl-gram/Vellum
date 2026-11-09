// The Hunt's stage as the browser built it, before any guess (Issue #779 part 2g): its dress and its press, in dress.ts and gestures.ts; the skeleton around the chart's own sheet is test/site/built-pages.test.ts's since Issue #1273.
import { makeStep } from "../../support/step.ts";
import type { SuiteContext } from "../../types.ts";
import { hg7Stage } from "./dress.ts";
import { hg5Bound } from "./gestures.ts";

export async function huntRoom(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  await step("HG5", () => hg5Bound(ctx));
  await step("HG7", () => hg7Stage(ctx));
}
