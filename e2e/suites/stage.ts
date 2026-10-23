// The chart's minimum size and what stands over a floored sheet (Issue #762 pull requests A and C), its own suite since Issue #763 split it from corners to balance the CI lanes: short windows (NS1, NA4), the desk frame on a phone, held sideways and upright (EA1, EA6 to EA9, Issue #778), desk windows, folded slips and the named world (EA2, EA3, EL1, EL2), the contrast over a floored sheet (EA4) and a lifted press (EA5), and the chrome over a zoomed chart (EZ1, EZ2, EZ3) and the Explorer's slide-away (ES1 to ES10).
import { makeStep } from "../support/step.ts";
import { onFixedDay } from "../support/fixed-day.ts";
import type { SuiteContext } from "../types.ts";
import { eaDesk } from "./stage/desk.ts";
import { ea6Upright, ea7Scrolled, ea8Pinched, ea9Paper } from "./stage/frame.ts";
import { na4Lean, ns1Soft } from "./stage/short.ts";
import { DESK, ea1Phone, ea4Reads, ea5Lift } from "./stage/stage.ts";
import { es1Follow, es2HomeSeats, es7Reduced, es9Fold } from "./stage/slide.ts";
import { es10Drawer, es3Rest, es4Keys, es5Atelier, es6Link, es8StillPointer } from "./stage/slide-holds.ts";
import { ez1Zoomed, ez2Short, ez3Thin } from "./stage/zoomed.ts";

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
      await step("EZ1", () => ez1Zoomed(ctx));
      await step("EZ2", () => ez2Short(ctx));
      await step("EZ3", () => ez3Thin(ctx));
      await step("ES1", () => es1Follow(ctx));
      await step("ES2", () => es2HomeSeats(ctx));
      await step("ES7", () => es7Reduced(ctx));
      await step("ES9", () => es9Fold(ctx));
      await step("ES3", () => es3Rest(ctx));
      await step("ES8", () => es8StillPointer(ctx));
      await step("ES10", () => es10Drawer(ctx));
      await step("ES4", () => es4Keys(ctx));
      await step("ES5", () => es5Atelier(ctx));
      await step("ES6", () => es6Link(ctx));
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
