// The chart's minimum size and what stands over a floored sheet (Issue #762 pull requests A and C), its own suite since Issue #763 split it from corners to balance the CI lanes: short windows (NS1, NA4), the desk frame on a phone, held sideways and upright (EA1, EA6 to EA9, Issue #778), desk windows, folded slips and the named world (EA2, EA3, EL1, EL2), the contrast over a floored sheet (EA4) and a lifted press (EA5).
import { makeStep } from "../support/step.ts";
import { onFixedDay } from "../support/fixed-day.ts";
import type { SuiteContext } from "../types.ts";
import { ea6Upright, ea7Scrolled, ea8Pinched, ea9Paper } from "./stage/frame.ts";
import { na4Lean, ns1Soft } from "./stage/short.ts";
import { DESK, ea1Phone, ea4Reads, ea5Lift, eaDesk } from "./stage/stage.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  try {
    await onFixedDay(ctx, async () => {
      await step("NS1", () => ns1Soft(ctx));
      await step("NA4", () => na4Lean(ctx));
      await step("EA1", async () => {
        await ea1Phone(ctx);
      });
      await step("EA7", () => ea7Scrolled(ctx));
      await step("EA9", () => ea9Paper(ctx));
      await step("EA6", () => ea6Upright(ctx));
      await step("EA8", () => ea8Pinched(ctx));
      await ctx.clearMobile();
      await step("EA2, EA3, EL1, EL2", () => eaDesk(ctx));
      await step("EA4", () => ea4Reads(ctx));
      await step("EA5", () => ea5Lift(ctx));
    });
  } finally {
    await ctx.clearMobile().catch(() => undefined);
    await ctx
      .send("Emulation.setDeviceMetricsOverride", {
        width: DESK.w,
        height: DESK.h,
        deviceScaleFactor: 1,
        mobile: false,
      })
      .catch(() => undefined);
  }
}
