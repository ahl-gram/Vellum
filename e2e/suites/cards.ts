// Living Chart story-card overlay e2e (P1-P15, Issue #53).
import { makeStep } from "../support/step.ts";
import { makeSettle } from "../support/settle.ts";
import type { SuiteContext } from "../types.ts";
import { cardsKit } from "./cards/kit.ts";
import { NARROW_SEED } from "./cards/reads.ts";
import {
  pSetup,
  pManifest,
  p1Overlay,
  p3PointerEvents,
  p2bPressLift,
  p4Capital,
  p7Tooltip,
  p8TapPins,
  p12PinSwitch,
  p13AxDescription,
  p15RealHover,
} from "./cards/overlay.ts";
import {
  p19CardsFit,
  p20PinnedTakesPointer,
  p26TailScrolls,
  p23CapHolds,
  p24NothingToScroll,
  pRestore,
} from "./cards/cap.ts";
import { holdKit, p28Travel, p29NearestTown, p31Keyboard, p32Dismiss, p33DragKeepsPin } from "./cards/hold.ts";
import { p30Tablet } from "./cards/hold-tablet.ts";
import { p36RaisedTakesHand } from "./cards/gestures.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  const step = makeStep(ctx);
  const settle = makeSettle(ctx);
  const k = cardsKit({ ...ctx, settle });
  await step("P setup", () => pSetup(ctx));
  const pm = await pManifest(ctx);
  await pOverlayReads(ctx, step, pm);
  const narrowCount = await evaluate<number>(
    `window.__vellumRunInline({kind:"draw",seed:${NARROW_SEED},overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`,
  );
  await step("P19", () => p19CardsFit(k, narrowCount));
  await step("P20 to P27", async () => {
    const open = await p20PinnedTakesPointer(k);
    await p26TailScrolls(ctx, open);
    await p23CapHolds(k, open);
  });
  await step("P24", () => p24NothingToScroll(k));
  const hk = holdKit({ ...ctx, settle });
  await step("P28 to P33", async () => {
    const marks = await hk.boot(false);
    await p29NearestTown(hk, marks);
    await p28Travel(hk, marks);
    await p31Keyboard(hk, marks);
    await p32Dismiss(hk, marks);
    await p33DragKeepsPin(hk, marks);
  });
  await step("P36", () => p36RaisedTakesHand(hk));
  await step("P30", () => p30Tablet(hk));
  await step("P restore", () => pRestore(ctx));
}

async function pOverlayReads(
  ctx: SuiteContext,
  step: ReturnType<typeof makeStep>,
  pm: Awaited<ReturnType<typeof pManifest>>,
): Promise<void> {
  await p1Overlay(ctx, pm);
  await p3PointerEvents(ctx);
  await p2bPressLift(ctx);
  await step("P4, P5", () => p4Capital(ctx, pm));
  await p7Tooltip(ctx, pm);
  await p8TapPins(ctx, pm);
  await p12PinSwitch(ctx, pm);
  await p13AxDescription(ctx, pm);
  await p15RealHover(ctx, pm);
}
