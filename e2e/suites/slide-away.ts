// The slide-away in the seven other zoom rooms (Issue #1034, Alex's rulings on Issue #997): in each the head cluster and the chart folio follow the zoom to thin lines at the Glass's press that fills (SW1), and not before it where that press is the third (SW2) or, on the Seed of the Day, the fourth (SW3), and the lines left read (SW4); a zoom the room makes for the reader waits for the reader's own (SW5); and the Reading Room's folio goes under its strip and comes back under a mouse near Play (SW6); and a fold of the side panel past the fill brings both part way back, as today, until the reader zooms past it (SW7).
import { makeStep } from "../support/step.ts";
import { onFixedDay } from "../support/fixed-day.ts";
import type { SuiteContext } from "../types.ts";
import { DESK } from "./stage/stage.ts";
import { sw5RowLean, sw6Strip } from "./slide-away/holds.ts";
import { sw7FoldPast } from "./slide-away/fold.ts";
import { sw1Rooms, sw2ThirdPress, sw3Today } from "./slide-away/rooms.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const step = makeStep(ctx);
  try {
    await onFixedDay(ctx, async () => {
      await step("SW1, SW4", () => sw1Rooms(ctx));
      await step("SW2", () => sw2ThirdPress(ctx));
      await step("SW3", () => sw3Today(ctx));
      await step("SW5", () => sw5RowLean(ctx));
      await step("SW6", () => sw6Strip(ctx));
      await step("SW7", () => sw7FoldPast(ctx));
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
