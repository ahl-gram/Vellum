// Landfall hardening e2e (Issue #460, second suite by ratification 2026-08-25): the wheel consumed-vs-released contract at both zoom clamps (L1), the six panel arms from the superseding 2026-08-24T18:53 spec plus the sixth-arm clearance (L2-L7), the Enter links as 44px touch targets (L8), touch two-finger-drives vs one-finger-page-scroll under one emulation set (L9), and the seed form's no-JS GET fallback with its bare-visit control (L10-L11), and home's markup and dress at rest (L13-L32, Issue #779 part 2f). Every gesture is REAL dispatched input; suite-home's plumbing arrives via support/home.ts.
import { forgetChartTouch, takeChartTouch } from "../support/chart-touch.ts";
import { landed } from "../support/home.ts";
import type { Cam } from "../support/home.ts";
import { scopedHealth } from "../support/room.ts";
import { makeSettle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { l13Stations, l14Legend, l15Shelf, l16NoticeAndPanel, l17Hook } from "./landfall/markup.ts";
import {
  l18Corner,
  l19Legend,
  l20Stations,
  l21Stamp,
  l22PanelDress,
  l25Faces,
  l26Corners,
  l29SlipBox,
  l31Veil,
  l32Blanket,
} from "./landfall/dress.ts";
import { stageKit, gestureKit, entersKit } from "./landfall/kit.ts";
import type { LandfallKit } from "./landfall/kit.ts";
import { stagePoint } from "./landfall/reads.ts";
import { l1aConsumed, l1bCloseClamp, l1cNotDeadZone, l1dStandOff, l1dReleased, l1eAbsorbed } from "./landfall/wheel.ts";
import { l1jHint, l1kSurfaces, l1fScrolledPage, l1gKeys, l1hDrift, l1iCluster, l27HintPlace } from "./landfall/page.ts";
import {
  l5HowOpens,
  l5bArrowScrolls,
  l2ProseScrolls,
  l6HeadStays,
  l3HeadSwallows,
  l7WideClear,
  l4l8Enters,
  l28SlipGestures,
} from "./landfall/panel.ts";
import { l9aOneFinger, l9bPinch, l9cTwoFingerPan, l9iTouchOff, l9jBrowserPinch } from "./landfall/touch.ts";
import { l9dCeiling, l9d2Debt, l9eFloor } from "./landfall/clamps.ts";
import { l9fPipGestures, l9hControlTap, l23KitReach, l24CameraLeaks, l30Camera } from "./landfall/controls.ts";
import { l10NoScriptGet, l11IgnoresQuery } from "./landfall/seed.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send } = ctx;
  const k0 = stageKit(ctx);
  const gate = scopedHealth(ctx);
  const k1 = gestureKit(k0);
  const k = entersKit(k1);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await l1Desktop(k, makeStep(ctx));
  await l13Home(k, makeStep(ctx));
  await l9Touch(k, makeStep(ctx));
  await l10NoScriptGet(k);
  await l11IgnoresQuery(k);
  gate.check("L12 the landfall hardening flow is clean (no console errors, no new 4xx)");
}

async function l1Desktop(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
  const { evaluate, settleHome, armWheelLog, scrollY } = k;
  const settled1 = await settleHome();
  await armWheelLog();
  const pt = await evaluate(stagePoint);
  await step("L1a", () => l1aConsumed(k, settled1, pt));
  await step("L1b", () => l1bCloseClamp(k, pt));
  await step("L1c", () => l1cNotDeadZone(k, pt));
  let floor: Cam | null = null;
  await step("L1d", async () => {
    floor = await l1dStandOff(k, pt);
    // Any released wheel above already scrolled the page, so the probe POLLS its way back to top (a one-shot reset raced still-in-flight wheels and certified the old L1d from 44px, skeptic round 1) and re-reads the stage point at that scroll, or it proves nothing.
    await l1dReleased(k, floor);
  });
  await step("L1e", () => l1eAbsorbed(k, pt, floor));
  await l1jHint(k);
  await step("L1k", () => l1kSurfaces(k));
  await step("L1f", () => l1fScrolledPage(k));
  await l1gKeys(k);
  await step("L1h", () => l1hDrift(k, pt));
  await l1iCluster(k);
  // The how flight stops the idle drift and re-arms its 9s timer, so every scale read below brackets its own gesture tightly, tolerating only sub-step drift (a wheel step is ~19%, the drift tween 1.5% over 14s).
  const settled2 = await settleHome();
  const how = await l5HowOpens(k, settled2);
  const y5 = await scrollY();
  await step("L5b", () => l5bArrowScrolls(k, how, y5));
  let closeBox0: number[] | null = null;
  await step("L2", async () => {
    closeBox0 = await l2ProseScrolls(k, y5);
  });
  await l6HeadStays(k, closeBox0, y5);
  await l3HeadSwallows(k, y5);
  await l7WideClear(k);
  await step("L4, L8", async () => {
    await k.shutSlips("L4 the how slip set aside");
    await l4l8Enters(k);
  });
}

export async function l13Home(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
  const home = await k.settleHome();
  await step("L13", async () => {
    landed(home, "L13");
    await l13Stations(k);
  });
  await step("L14", () => l14Legend(k));
  await step("L15", () => l15Shelf(k));
  await step("L16", () => l16NoticeAndPanel(k));
  await step("L17", () => l17Hook(k));
  await step("L18", () => l18Corner(k));
  await step("L19", () => l19Legend(k));
  await step("L21", () => l21Stamp(k));
  await step("L22", () => l22PanelDress(k));
  await step("L25", () => l25Faces(k));
  await step("L26", () => l26Corners(k));
  await step("L23", () => l23KitReach(k));
  await step("L24", () => l24CameraLeaks(k));
  await step("L27", () => l27HintPlace(k));
  await step("L29", () => l29SlipBox(k));
  await step("L30", () => l30Camera(k));
  await step("L20", () => l20Stations(k));
  await step("L28", () => l28SlipGestures(k));
  await step("L31", () => l31Veil(k));
  await step("L32", () => l32Blanket(k));
}

export async function l9Touch(k: LandfallKit, step: ReturnType<typeof makeStep>): Promise<void> {
  const { evaluate, setMobileViewport, clearMobile, settleHome } = k;
  // L9 is the touch contract on a tablet at the 1024 floor (Issue #761), its emulation set once before the boot that binds touch and never changed after the first real touch (the suite-zoom-gestures trap).
  await setMobileViewport(1024, 768);
  await k.send("Page.navigate", { url: "about:blank" });
  const tablet = await settleHome();
  await step("L9i", async () => {
    landed(tablet, "L9i");
    await l9iTouchOff(k);
  });
  await step("L9j", () => l9jBrowserPinch(k));
  await k.send("Page.navigate", { url: "about:blank" });
  const reloaded = await settleHome();
  await step("L9 touch given", async () => {
    landed(reloaded, "L9 touch given");
    await makeSettle(k)(
      `visualViewport.scale`,
      (s) => s === 1,
      "the page kept the browser pinch's scale across a reload",
    );
    await takeChartTouch(k, true);
  });
  try {
    const stagePt9 = await evaluate(stagePoint);
    // Drift-sized stillness: on slow CI the fixture has crossed IDLE_DELAY_MS by here and the ambient ±1.5% drift moved the camera 3e-6 between reads (PR #482 CI); a one-finger pan that drove the map would move it 60px.
    await l9aOneFinger(k, stagePt9);
    await step("L9b", () => l9bPinch(k, stagePt9));
    // L9c-L9g: the real two-finger contract (Issue #475). Every pan read pins its fixture's clamp headroom first: the old L9c went green off a clamp-parked fixture (PR #474 skeptic finding 3), so an unproven fixture is the bug these arms exist to never repeat.
    await step("L9c", () => l9cTwoFingerPan(k, stagePt9));
    await step("L9d", () => l9dCeiling(k, stagePt9));
    await step("L9d2", () => l9d2Debt(k, stagePt9));
    await step("L9e", () => l9eFloor(k, stagePt9));
    await step("L9f, L9g", () => l9fPipGestures(k));
    await step("L9h", () => l9hControlTap(k));
    await step("L9 touch taken back", () => takeChartTouch(k, false));
  } finally {
    await evaluate(forgetChartTouch);
  }
  await clearMobile();
}
