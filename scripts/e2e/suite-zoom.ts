// Surveyor's Glass e2e (Z): pan/zoom on the Explorer chart via the shared d3-zoom controller, plus the settle-to-region redraft (Z17+). Resolved matrices are asserted on purpose: getComputedStyle returns "none" for a rejected value, so the assertion doubles as proof the px-suffixed transform is valid CSS (d3's own toString() is not).
import { makeStep } from "./step-support.ts";
import type { SuiteContext } from "./types.ts";
import { zoomKit } from "./zoom/kit.ts";
import { zSetup, z1ZoomTo, z2MaxClamp, zK4Shot, z3MinClamp, z4RoundTrip, z6PinnedCard, z8CardConstant, z8bHoverRing } from "./zoom/camera.ts";
import { z9Keyboard, z10Buttons, z10bNoDblclickLeak, z11Styles, z12HashWrite } from "./zoom/controls.ts";
import { z5VersoHomes, z14aDrawHomes, z14bTurnHomes, z14cArmingHomes, zrmReducedMotion, z7TouchAction, z13DeepLink, z13dRefitHolds } from "./zoom/resets.ts";
import { z15RegionCrop, z16CacheHit, z17Inset, zInsetContextShot, z18Pan, z19RapidSettles, z19bSupersession, z20ZoomOutDrops, z20bReducedMotion, z20cThrottle } from "./zoom/region.ts";
import { z20dInkDrops, z20eCardSurvives, z20fStepsDown, z20gInkBlocks, z21Target, z21Hamlets, z21bOneBandUp, zRestore } from "./zoom/bands.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate } = ctx;
  // The geometric checks between the steps below are deliberately not stepped: they read the camera and the CSSOM, with nothing to wait on.
  const step = makeStep(ctx);
  const k = zoomKit(ctx);
  // #169: the semantic redraft is OFF for the geometric block (Z1-Z16) and back ON for Z17+; a fresh page defaults it ON, so re-set it after every reload.
  await step("Z setup", () => zSetup(ctx));
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
  await z20eCardSurvives(k);
  await z20fStepsDown(k);
  await step("Z20g", () => z20gInkBlocks(k));
  const target21 = await z21Target(k);
  const deep21 = await z21Hamlets(k, target21);
  await z21bOneBandUp(k, target21, deep21);
  await step("Z restore", () => zRestore(k));
}
