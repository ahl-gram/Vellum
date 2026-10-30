// Reading Room e2e (RR0-RR43; Issue #221 plus Issue #318 colophon dice, Issue #418 pre-arm window, Issue #402 prospect stage and Issue #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on Issue #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
import { makeSettle, makeStable } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { readingRoomKit, type ReadingRoomKit } from "./reading-room/kit.ts";
import { DESK, atDesk, sameSheet } from "./reading-room/reads.ts";
import { rr0Boots, rr4AtRest, rr26BareVisit, rr29Play } from "./reading-room/arrival.ts";
import { rrDeskReads } from "./reading-room/desk.ts";
import { rr6Survey, rr7Year, rr9Today, rr10CrossLinks, rr44PlaceLink } from "./reading-room/addresses.ts";
import {
  rr16Colophon,
  rr17CounterRead,
  rr18Park,
  rr20Superseded,
  rr21Dice,
  rr22MidPlay,
} from "./reading-room/colophon.ts";
import { rr23Usurped, rr24BeforeArm, rr25TearDown } from "./reading-room/arm.ts";
import { rr11bScrubHandles } from "./reading-room/scrub.ts";
import { rr12Clean, rr14Fallback } from "./reading-room/fallback.ts";
import { rr38Authored } from "./reading-room/room.ts";
import { rr39AtRest, rr43OverlayUnshadowed } from "./reading-room/dress.ts";
import { rr40Glass, rr41ReadRefits, rr42PlateReveal } from "./reading-room/gestures.ts";

type Step = ReturnType<typeof makeStep>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, shoot, consoleErrors, http4xx, PORT } = ctx;
  const k = readingRoomKit(ctx);
  const step = makeStep(ctx);
  await step("RR38", () => rr38Authored(ctx));
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const rrErrBase = consoleErrors.length;
  const rrHttpBase = http4xx.length;
  await rr0Boots(k);
  await rr4AtRest(ctx);
  // Seed 42's beats, measured 2026-08-22: foundings 451/552/597 (i=0/4/6), twin ruins 1039 (i=19/22; the LAST told holds the stage), present 1059. This hash carries no live key, so it is a PLAIN visit and opens with no plate (Issue #442 reversing Issue #402); RR29 shows Play bringing one.
  await rr26BareVisit(k);
  await atTheDesk(ctx, step, k);
  await step("RR42", () => rr42PlateReveal(ctx));
  await step("RR40", () => rr40Glass(ctx));
  await rr6Survey(k);
  await rr7Year(k);
  await shoot("reading-room.png");
  await rr9Today(k);
  await rr16Colophon(ctx);
  await rr17CounterRead(k);
  await rr18Park(ctx);
  await rr20Superseded(ctx);
  await rr21Dice(ctx);
  await step("RR22", () => rr22MidPlay(ctx));
  await rr23Usurped(k);
  await rr24BeforeArm(k);
  await rr25TearDown(k);
  await rr10CrossLinks(ctx);
  await rr11bScrubHandles(k, ctx);
  await step("RR44", () => rr44PlaceLink(k));
  rr12Clean(ctx, rrErrBase, rrHttpBase);
  await rr14Fallback(ctx);
}

export async function atTheDesk(ctx: SuiteContext, step: Step, k: ReadingRoomKit): Promise<void> {
  const { evaluate, send } = ctx;
  const stable = makeStable(makeSettle(ctx));
  const harness = await evaluate(DESK);
  // The harness window is 1280x2400, where this page has only a few hundred px of scroll and the strip could never reach the top, so this reading pins Issue #442's governing 1440x900 viewport; mobile:false because mobile:true changes layout semantics as well as size.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await step("RR31, RR35, RR37, RR36", async () => {
    await stable(DESK, "the room laid out at 1440x900", { departed: (d) => atDesk(d) && !sameSheet(d, harness) });
    await rrDeskReads(ctx);
  });
  await step("RR39", () => rr39AtRest(ctx));
  await step("RR43", () => rr43OverlayUnshadowed(ctx));
  await step("RR41", () => rr41ReadRefits(ctx));
  await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
  const desk = await evaluate(DESK);
  await send("Emulation.clearDeviceMetricsOverride");
  await step("RR29", async () => {
    await stable(DESK, "the room laid out again after the 1440x900 override", {
      departed: (d) => !atDesk(d) && !sameSheet(d, desk),
    });
    await rr29Play(k);
  });
}
