// Landfall hardening e2e (#460, second suite by ratification 2026-08-25): the wheel consumed-vs-released contract at both zoom clamps (L1), the six panel arms from the superseding 2026-08-24T18:53 spec plus the sixth-arm clearance (L2-L7), the Enter links as 44px touch targets (L8), touch two-finger-drives vs one-finger-page-scroll under one emulation set (L9), and the seed form's no-JS GET fallback with its bare-visit control (L10-L11). Every gesture is REAL dispatched input; suite-home's plumbing arrives via home-support.ts.
import { scopedHealth } from "./room-support.ts";
import type { SuiteContext } from "./types.ts";
import { stageKit, gestureKit, entersKit } from "./landfall/kit.ts";
import type { LandfallKit } from "./landfall/kit.ts";
import { stagePoint } from "./landfall/reads.ts";
import { l1aConsumed, l1bCloseClamp, l1cNotDeadZone, l1dStandOff, l1dReleased, l1eAbsorbed } from "./landfall/wheel.ts";
import { l1jHint, l1kSurfaces, l1fScrolledPage, l1gKeys, l1hDrift, l1iCluster } from "./landfall/page.ts";
import { l5HowOpens, l5bArrowScrolls, l2ProseScrolls, l6HeadStays, l3HeadSwallows, l7WideClear, l4l8Enters, l7bNarrowClear, l8bNarrowTargets } from "./landfall/panel.ts";
import { l9aOneFinger, l9bPinch, l9cTwoFingerPan } from "./landfall/touch.ts";
import { l9dCeiling, l9d2Debt, l9eFloor } from "./landfall/clamps.ts";
import { l9fPipGestures, l9hControlTap } from "./landfall/controls.ts";
import { l10NoScriptGet, l11IgnoresQuery } from "./landfall/seed.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send } = ctx;
  const k0 = stageKit(ctx);
  const gate = scopedHealth(ctx);
  const k1 = gestureKit(k0);
  const k = entersKit(k1);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await l1Desktop(k);
  await l7bNarrow(k);
  await l10NoScriptGet(k);
  await l11IgnoresQuery(k);
  gate.check("L12 the landfall hardening flow is clean (no console errors, no new 4xx)");
}

async function l1Desktop(k: LandfallKit): Promise<void> {
  const { evaluate, sleep, pressKey, settleHome, armWheelLog, scrollY } = k;
  const settled1 = await settleHome();
  await armWheelLog();
  const pt = await evaluate(stagePoint);
  await l1aConsumed(k, settled1, pt);
  await l1bCloseClamp(k, pt);
  await l1cNotDeadZone(k, pt);
  const floor = await l1dStandOff(k, pt);
  // Any released wheel above already scrolled the page, so the probe POLLS its way back to top (a one-shot reset raced still-in-flight wheels and certified the old L1d from 44px, skeptic round 1) and re-reads the stage point at that scroll, or it proves nothing.
  await l1dReleased(k, floor);
  await l1eAbsorbed(k, pt, floor);
  await l1jHint(k);
  await l1kSurfaces(k);
  await l1fScrolledPage(k);
  await l1gKeys(k);
  await l1hDrift(k, pt);
  await l1iCluster(k);
  // The how flight stops the idle drift and re-arms its 9s timer, so every scale read below brackets its own gesture tightly, tolerating only sub-step drift (a wheel step is ~19%, the drift tween 1.5% over 14s).
  const settled2 = await settleHome();
  const how = await l5HowOpens(k, settled2);
  const y5 = await scrollY();
  await l5bArrowScrolls(k, how, y5);
  const closeBox0 = await l2ProseScrolls(k, y5);
  await l6HeadStays(k, closeBox0, y5);
  await l3HeadSwallows(k, y5);
  await l7WideClear(k);
  await pressKey("Escape", "Escape", 27);
  await sleep(500);
  await l4l8Enters(k);
}

async function l7bNarrow(k: LandfallKit): Promise<void> {
  const { evaluate, setMobileViewport, clearMobile, settleHome } = k;
  // L7 narrow + L9: ONE mobile emulation set for everything touch (the suite-zoom-gestures trap: enable BEFORE the navigate that boots, never change after the first real touch).
  await setMobileViewport(390, 844);
  const settled9 = await settleHome();
  await l7bNarrowClear(k, settled9);
  await l8bNarrowTargets(k);
  const stagePt9 = await evaluate(stagePoint);
  // Drift-sized stillness: on slow CI the fixture has crossed IDLE_DELAY_MS by here and the ambient ±1.5% drift moved the camera 3e-6 between reads (PR #482 CI); a one-finger pan that drove the map would move it 60px.
  await l9aOneFinger(k, stagePt9);
  await l9bPinch(k, stagePt9);
  // L9c-L9g: the real two-finger contract (#475). Every pan read pins its fixture's clamp headroom first: the old L9c went green off a clamp-parked fixture (PR #474 skeptic finding 3), so an unproven fixture is the bug these arms exist to never repeat.
  await l9cTwoFingerPan(k, stagePt9);
  await l9dCeiling(k, stagePt9);
  await l9d2Debt(k, stagePt9);
  await l9eFloor(k, stagePt9);
  await l9fPipGestures(k);
  await l9hControlTap(k);
  await clearMobile();
}
