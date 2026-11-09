import { makeStage } from "../../support/home.ts";
import type { SuiteContext } from "../../types.ts";

export type HomeKit = ReturnType<typeof homeKit>;

export function homeKit(ctx: SuiteContext) {
  const { pressKey, clickAt, settleHome } = makeStage(ctx);
  return { ...ctx, pressKey, clickAt, settleHome };
}
