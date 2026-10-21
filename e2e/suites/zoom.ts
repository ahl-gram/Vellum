// Surveyor's Glass e2e (Z): pan/zoom on the Explorer chart via the shared d3-zoom controller, plus the settle-to-region redraft (Z17+). Resolved matrices are asserted on purpose: getComputedStyle returns "none" for a rejected value, so the assertion doubles as proof the px-suffixed transform is valid CSS (d3's own toString() is not).
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { zoomKit, type ZoomKit } from "./zoom/kit.ts";
import {
  zSetup,
  z1ZoomTo,
  z2MaxClamp,
  zK4Shot,
  z3MinClamp,
  z4RoundTrip,
  z6PinnedCard,
  z8CardConstant,
  z8bHoverRing,
  z22HitAndRing,
  z25ClampFlush,
} from "./zoom/camera.ts";
import { z9Keyboard, z10Buttons, z10bNoDblclickLeak, z11Styles, z12HashWrite } from "./zoom/controls.ts";
import {
  z5VersoHomes,
  z14aDrawHomes,
  z14bTurnHomes,
  z14cArmingHomes,
  zrmReducedMotion,
  z7TouchAction,
  z13DeepLink,
  z13dRefitHolds,
} from "./zoom/resets.ts";
import {
  z15RegionCrop,
  z16CacheHit,
  z17Inset,
  zInsetContextShot,
  z18Pan,
  z19RapidSettles,
  z19bSupersession,
  z20ZoomOutDrops,
  z20bReducedMotion,
  z20cThrottle,
} from "./zoom/region.ts";
import {
  z20dInkDrops,
  z20eCardSurvives,
  z20fStepsDown,
  z20gInkBlocks,
  z21Target,
  z21Hamlets,
  z21bOneBandUp,
  zRestore,
  type Target21,
} from "./zoom/bands.ts";
import {
  zh1HeldInsetStays,
  zh2LetGoSettles,
  zh3HeldWorld,
  zh4aVoicedHome,
  zh4bDraw,
  zh4cTurn,
  zh4dInk,
  zh5DraftDropped,
  zh5bKeepsCaption,
  zh6HeldCeiling,
  zh7LetGoMidGlide,
  zh8LetGoGlidingOut,
  zh9LetGoJustMoved,
} from "./zoom/hold.ts";
import {
  type HamletWindow,
  pickHamletWindow,
  zh10aTownsOnDots,
  zh10bHamletsOnDots,
  zh11EarOnCorner,
  zh12CardFlat,
  zh13PrintKeepsSheet,
  zh14PressIgnoredWhileDrafting,
  zh14bPressIgnoredWhileTurning,
} from "./zoom/registration.ts";
import { zh15HoldLights } from "./zoom/hold-dress.ts";
import {
  zl1PressShowsLens,
  zl2StandsAsideInMotion,
  zl3LensRegisters,
  zl4HeldKey,
  zl5StandsAsideOverCard,
  zl6TrackRides,
} from "./zoom/loupe.ts";
import { z23SurveyOverlay, z24CardSeats, z26CardDress } from "./zoom/dress.ts";
import { z27UnderPinned } from "./zoom/gestures.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  // The geometric checks between the steps below are deliberately not stepped: they read the camera and the CSSOM, with nothing to wait on.
  const step = makeStep(ctx);
  const k = zoomKit(ctx);
  // Issue #169: the semantic redraft is OFF for the geometric block (Z1-Z16) and back ON for Z17+; a fresh page defaults it ON, so re-set it after every reload.
  await step("Z setup", () => zSetup(ctx));
  await zGeometric(ctx, k);
  await step("Z22", () => z22HitAndRing(ctx));
  await step("Z24", () => z24CardSeats(ctx));
  await step("Z25", () => z25ClampFlush(ctx));
  await step("Z26", () => z26CardDress(ctx));
  await step("Z27", () => z27UnderPinned(ctx));
  await step("Z11", () => z11Styles(ctx));
  await step("Z12", () => z12HashWrite(ctx));
  await z5VersoHomes(ctx);
  await step("Z14a", () => z14aDrawHomes(ctx));
  await step("Z14b", () => z14bTurnHomes(ctx));
  await z14cArmingHomes(ctx);
  await zrmReducedMotion(ctx);
  await step("Z7", () => z7TouchAction(ctx));
  await step("Z13", () => z13DeepLink(ctx));
  await z13dRefitHolds(ctx);
  await z15RegionCrop(ctx);
  await z16CacheHit(ctx);
  await evaluate(`window.__vellumSetRedraftEnabled(true)`);
  await z17Inset(k);
  await zInsetContextShot(k);
  await z18Pan(k);
  await z19RapidSettles(k);
  await z19bSupersession(k);
  await z20ZoomOutDrops(k);
  await z20bReducedMotion(k);
  await z20cThrottle(k);
  await step("Z20d", () => z20dInkDrops(k));
  await step("Z23", () => z23SurveyOverlay(k));
  await z20eCardSurvives(k);
  await z20fStepsDown(k);
  await step("Z20g", () => z20gInkBlocks(k));
  const target21 = await z21Target(k);
  const deep21 = await z21Hamlets(k, target21);
  await z21bOneBandUp(k, target21, deep21);
  const pick = await zHold(step, k, target21);
  await zLoupe(step, k, pick);
  await step("Z restore", () => zRestore(k));
}

async function zHold(step: ReturnType<typeof makeStep>, k: ZoomKit, target21: Target21): Promise<HamletWindow> {
  await step("ZH1", () => zh1HeldInsetStays(k, target21));
  await step("ZH2", () => zh2LetGoSettles(k));
  await step("ZH3", () => zh3HeldWorld(k, target21));
  await step("ZH4a", () => zh4aVoicedHome(k, target21));
  await step("ZH4b", () => zh4bDraw(k, target21));
  await step("ZH4c", () => zh4cTurn(k, target21));
  await step("ZH4d", () => zh4dInk(k, target21));
  await step("ZH5", () => zh5DraftDropped(k, target21));
  await step("ZH5b", () => zh5bKeepsCaption(k, target21));
  await step("ZH6", () => zh6HeldCeiling(k, target21));
  await step("ZH7", () => zh7LetGoMidGlide(k, target21));
  await step("ZH8", () => zh8LetGoGlidingOut(k, target21));
  await step("ZH9", () => zh9LetGoJustMoved(k, target21));
  await step("ZH10a", () => zh10aTownsOnDots(k));
  const pick = await pickHamletWindow(k);
  await step("ZH10b", () => zh10bHamletsOnDots(k, pick));
  await step("ZH11", () => zh11EarOnCorner(k, pick));
  await step("ZH12", () => zh12CardFlat(k, pick));
  await step("ZH13", () => zh13PrintKeepsSheet(k, pick));
  await step("ZH14", () => zh14PressIgnoredWhileDrafting(k));
  await step("ZH14b", () => zh14bPressIgnoredWhileTurning(k));
  await step("ZH15", () => zh15HoldLights(k));
  return pick;
}

async function zLoupe(step: ReturnType<typeof makeStep>, k: ZoomKit, pick: HamletWindow): Promise<void> {
  await step("ZL1", () => zl1PressShowsLens(k));
  await step("ZL2", () => zl2StandsAsideInMotion(k));
  await step("ZL3", () => zl3LensRegisters(k, pick));
  await step("ZL4", () => zl4HeldKey(k));
  await step("ZL5", () => zl5StandsAsideOverCard(k));
  await step("ZL6", () => zl6TrackRides(k));
}

async function zGeometric(ctx: SuiteContext, k: ZoomKit): Promise<void> {
  await z1ZoomTo(ctx);
  await z2MaxClamp(ctx);
  await zK4Shot(ctx);
  await z3MinClamp(ctx);
  await z4RoundTrip(ctx);
  await z6PinnedCard(ctx);
  await z8CardConstant(ctx);
  await z8bHoverRing(k);
  await z9Keyboard(ctx);
  await z10Buttons(ctx);
  await z10bNoDblclickLeak(ctx);
}
