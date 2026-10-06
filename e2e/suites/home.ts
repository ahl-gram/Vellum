// The floating seed chrome (H0-H6, Issue #289 semantics relanded at Issue #470), the ceremony (H7-H13, Issue #457), the failed-bundle doors (H13c, Issue #470), and the stations, cards, and idle drift (H14-H17, Issue #458): the homepage frame at desktop and on a 390px window that lays out the 1024 page (Issue #762), the corner form, the seed form's real promise (the chart number in the baked cartouche IS the seed, so the drawn SVG identifies its world), the veil's arrival, skips in both phases, sitting memory, reduced-motion stories, and the station flights driven by REAL dispatched input; deltas scoped per flow, plumbing shared via support/home.ts (Issue #460).
import type { SuiteContext } from "../types.ts";
import { homeKit } from "./home/kit.ts";
import type { HomeKit } from "./home/kit.ts";
import { h0Loads, hVeilDown, h1CornerForm, h2Hook, h4DrawIt, h5Home, h5aRefused, h5bEmptySeed, h6Clean } from "./home/frame.ts";
import { h7aVeil, h7bLandfall, h8KeySkip, h8bHoldSkip, h9CeremonyStandsDown, h12aVeilCovers, h12bSkipOnFloor, h18CameraSeat, h11Clean } from "./home/ceremony.ts";
import { h13aPrePaint, h13bRelease, h13cDoorsRead, h13cStaticDoors, h13dPrmDoors, h13ePrmNoFlash, h13fNoScriptRead, h13fNoScript } from "./home/doors.ts";
import { h14aFlight, h14aCardFits, h14bEscape, h14dPipHover, h14cLegend, h17Clean } from "./home/stations.ts";
import { h15aDrift, h15bWheelStops, h15cRearmed, h15dFlightStops, h16NoDrift } from "./home/drift.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, consoleErrors, http4xx, PORT } = ctx;
  const k = homeKit(ctx);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const ready = await h0Loads(ctx);
  await hVeilDown(k, ready);
  await h1CornerForm(ctx, ready);
  await h2Hook(ctx, ready);
  await h4DrawIt(ctx);
  const backHome = await h5Home(ctx);
  await h5aRefused(ctx, backHome);
  await h5bEmptySeed(ctx, backHome);
  h6Clean(ctx, errBase, httpBase);
  await h7Ceremony(ctx, k);
  await h14Stations(ctx, k);
}

async function h7Ceremony(ctx: SuiteContext, k: HomeKit): Promise<void> {
  const { send, setNarrowViewport, clearMobile, consoleErrors, http4xx } = ctx;
  const { camSeat } = k;
  const errBase2 = consoleErrors.length;
  const httpBase2 = http4xx.length;
  await h7aVeil(ctx);
  await h7bLandfall(ctx);
  await h8KeySkip(k);
  await h8bHoldSkip(k);
  await h9CeremonyStandsDown(ctx);
  await setNarrowViewport(390, 844);
  await h12aVeilCovers(ctx);
  await h12bSkipOnFloor(k);
  const seat390 = await camSeat();
  await clearMobile();
  await h18CameraSeat(k, seat390);
  h11Clean(ctx, errBase2, httpBase2);
  // H13 runs AFTER the clean check on purpose: blocking the bundle logs an expected load error. It proves the pre-paint story (Issue #457, the incognito flash): the inline script dresses first paint without the module, and an unadopted veil releases itself rather than trapping the page.
  await send("Network.setBlockedURLs", { urls: ["*app.bundle.js*"] });
  await h13aPrePaint(ctx);
  await h13bRelease(ctx);
  // The doors share the veil's 10s window (Issue #470, ratified 2026-08-24), so after H13b's release they are due at once; the poll absorbs animation-fill timing, and the bundle stays blocked until the doors are read.
  const doors = await h13cDoorsRead(ctx);
  await send("Network.setBlockedURLs", { urls: [] });
  await h13cStaticDoors(ctx, doors);
  // Reduced motion crosses the doors both ways (Issue #470 skeptic round 1: motion.css's prm blanket zeroed the 10s delay, so prm visitors got the failure doors on every HEALTHY load); both halves matter, since a display:none card still computes visibility:visible and a pre-reveal card is display:block with visibility:hidden.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await h13dPrmDoors(ctx);
  await h13ePrmNoFlash(ctx);
  const nojs = await h13fNoScriptRead(ctx);
  await send("Emulation.setEmulatedMedia", { features: [] });
  h13fNoScript(ctx, nojs);
}

async function h14Stations(ctx: SuiteContext, k: HomeKit): Promise<void> {
  const { send, consoleErrors, http4xx } = ctx;
  const { settleHome } = k;
  // Stations, cards, and the drift (Issue #458) at the ratified 1280x800 (the harness's tall default hides the short-viewport collisions the plate-reader measured). Every gesture is REAL dispatched input (Issue #460): pointer capture retargets clicks, so synthetic .click() proves nothing here.
  const errBase3 = consoleErrors.length;
  const httpBase3 = http4xx.length;
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const settled14 = await settleHome();
  const { atlasPt, visited } = await h14aFlight(k);
  await h14aCardFits(ctx, settled14, atlasPt, visited);
  await h14bEscape(k);
  await h14dPipHover(k);
  await h14cLegend(k);
  await h15aDrift(ctx);
  await h15bWheelStops(ctx);
  await h15cRearmed(ctx);
  await h15dFlightStops(k);
  await h16NoDrift(k);
  h17Clean(ctx, errBase3, httpBase3);
}
