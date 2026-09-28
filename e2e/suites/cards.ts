// Living Chart story-card overlay e2e (P1-P15, #53).
import { makeStep } from "./step-support.ts";
import { makeSettle } from "./settle-support.ts";
import type { SuiteContext } from "./types.ts";
import { cardsKit } from "./cards/kit.ts";
import { NARROW_SEED } from "./cards/reads.ts";
import { pSetup, pManifest, p1Overlay, p2Idle, p2bPressLift, p4Capital, p6Ruin, p7Tooltip, p8TapPins, p9Hover, p10Focus, p11OutsideClick, p12PinSwitch, p13AxDescription, p14Unfurl, p15RealHover } from "./cards/overlay.ts";
import { p16Glass, p18Renamed, p18bNeverRenamed, p17RuinNote, pCardShot } from "./cards/glass.ts";
import { p19CardsFit, p20PinnedTakesPointer, p26TailScrolls, p23CapHolds, p24NothingToScroll, pRestore } from "./cards/cap.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  const step = makeStep(ctx);
  const settle = makeSettle(ctx);
  const k = cardsKit({ ...ctx, settle });
  await step("P setup", () => pSetup(ctx));
  const pm = await pManifest(ctx);
  await p1Overlay(ctx, pm);
  await p2Idle(ctx);
  await p2bPressLift(ctx);
  await p4Capital(ctx, pm);
  await p6Ruin(ctx, pm);
  await p7Tooltip(ctx, pm);
  await p8TapPins(ctx, pm);
  await p9Hover(ctx, pm);
  await p10Focus(ctx, pm);
  await p11OutsideClick(ctx, pm);
  await p12PinSwitch(ctx, pm);
  await p13AxDescription(ctx, pm);
  await p14Unfurl(ctx, pm);
  await p15RealHover(ctx, pm);
  await p16Glass(ctx, pm);
  await p18Renamed(ctx, pm);
  await p18bNeverRenamed(ctx, pm);
  await p17RuinNote(ctx, pm);
  await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
  await pCardShot(ctx, pm);
  const narrowCount = await evaluate<number>(`window.__vellumRunInline({kind:"draw",seed:${NARROW_SEED},overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`);
  await step("P19, P19b", () => p19CardsFit(k, narrowCount));
  await step("P20 to P27", async () => { const open = await p20PinnedTakesPointer(k); await p26TailScrolls(ctx, open); await p23CapHolds(k, open); });
  await step("P24", () => p24NothingToScroll(k));
  await step("P restore", () => pRestore(ctx));
}
