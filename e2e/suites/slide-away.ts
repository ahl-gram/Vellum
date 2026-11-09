// The slide-away beyond the Explorer (Issue #1034, Alex's rulings on Issue #997): on the Prospect the head cluster and the chart folio follow the zoom to thin lines at the Glass's press that fills (SW1), and not before it where that press is the third or later, on the Print Room (SW2) or, on the Seed of the Day, the fourth (SW3); a zoom the room makes for the reader waits for the reader's own (SW5); the Reading Room's folio goes under its strip and comes back under a mouse near Play (SW6); a fold of the Print Room's side panel past the fill brings both part way back, as today, until the reader zooms past it (SW7); and beside them the chart itself slides with that fold, at the slip's pace with the Explorer's framing held at every frame, and under reduced motion stands at its new fit at once (FS2 and FS3, Issue #1261).
import { makeStep } from "../support/step.ts";
import { withReducedMotion } from "../support/reduced-motion.ts";
import type { SuiteContext } from "../types.ts";
import { DESK } from "./stage/stage.ts";
import { sw5RowLean, sw6Strip } from "./slide-away/holds.ts";
import { sw7FoldPast } from "./slide-away/fold.ts";
import { fs2FoldSlides } from "./slide-away/fold-slide.ts";
import { sw1Rooms, sw2ThirdPress, sw3Today } from "./slide-away/rooms.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  try {
    await withReducedMotion(ctx, async () => {
      await step("SW1", () => sw1Rooms(ctx));
      await step("SW2", () => sw2ThirdPress(ctx));
      await step("SW3", () => sw3Today(ctx));
      await step("SW5", () => sw5RowLean(ctx));
      await step("SW6", () => sw6Strip(ctx));
      await step("SW7", () => sw7FoldPast(ctx));
      await step("FS2, FS3", () => fs2FoldSlides(ctx));
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
