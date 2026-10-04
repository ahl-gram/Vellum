// e2e runner (npm run test:e2e): drives a real headless browser over CDP, so it stays out of the node --test unit suite (slower, needs a Chromium-family browser and free ports); this file is the thin npm entrypoint that owns the shared accumulators and invokes the suites in order.
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { findBrowser } from "../src/cli/raster.ts";
import { browserlessAction } from "./support/browser-policy.ts";
import { resolveE2ePorts, e2eOutSubdir } from "./support/ports.ts";
import {
  resolveSuiteSelection,
  suitesCertifiedByHealth,
  formatSuiteTimings,
  runSelected,
  runOutcome,
  suitesNotWhole,
  E2E_SUITE_ORDER,
} from "./support/suites.ts";
import { start, cleanup } from "./harness.ts";
import { run as runRender } from "./suites/render.ts";
import { run as runMotion } from "./suites/motion.ts";
import { run as runTurn } from "./suites/turn.ts";
import { run as runVerso } from "./suites/verso.ts";
import { run as runZoom } from "./suites/zoom.ts";
import { run as runZoomGestures } from "./suites/zoom-gestures.ts";
import { run as runGlassCeremony } from "./suites/glass-ceremony.ts";
import { run as runCards } from "./suites/cards.ts";
import { run as runHealth } from "./suites/health.ts";
import { run as runFallback } from "./suites/fallback.ts";
import { run as runHunt } from "./suites/hunt.ts";
import { run as runPrintRoom } from "./suites/print-room.ts";
import { run as runProspect } from "./suites/prospect.ts";
import { run as runRibbon } from "./suites/ribbon.ts";
import { run as runHome } from "./suites/home.ts";
import { run as runLandfall } from "./suites/landfall.ts";
import { run as runSurvey } from "./suites/survey.ts";
import { run as runBroadside } from "./suites/broadside.ts";
import { run as runReadingRoom } from "./suites/reading-room.ts";
import { run as runRoomInstrument } from "./suites/room-instrument.ts";
import { run as runRoomInk } from "./suites/room-ink.ts";
import { run as runRoomVoyage } from "./suites/room-voyage.ts";
import { run as runRoomAddress } from "./suites/room-address.ts";
import { run as runRoomVoyageRoute } from "./suites/room-voyage-route.ts";
import { run as runRunningHead } from "./suites/runninghead.ts";
import { run as runCluster } from "./suites/cluster.ts";
import { run as runChartDrawer } from "./suites/chart-drawer.ts";
import { run as runRoomDrawer } from "./suites/room-drawer.ts";
import { run as runCorners } from "./suites/corners.ts";
import { run as runDocumentRooms } from "./suites/document-rooms.ts";
import { run as runRegionDetail } from "./suites/region-detail.ts";
import { run as runSpecimen } from "./suites/specimen.ts";
import type { StartOptions } from "./types.ts";
import type { E2eSuiteTiming } from "./support/suites.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = resolve(HERE, "..");
// Serves the built dist/ so the e2e validates exactly what gets published (VELLUM_SITE_DIR overrides; run `npm run build` first).
const SITE = process.env["VELLUM_SITE_DIR"] ? resolve(process.env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
// Issue #339: VELLUM_E2E_PORT / VELLUM_E2E_DPORT (defaults 8765 / 9222) let two checkouts run side by side; a bad value fails here rather than falling back, since a silent fallback puts both lanes back on the same port.
const { PORT, DPORT } = fatalOnThrow(() => resolveE2ePorts(process.env));
const OUT = join(REPO, "out", e2eOutSubdir(PORT));
const PAGE = `http://127.0.0.1:${PORT}/explorer/`;
const { names: SELECTED, tier: TIER } = fatalOnThrow(() => resolveSuiteSelection(process.env));

function fatalOnThrow<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    console.error(`FAIL: ${(err as Error).message}`);
    process.exit(1);
  }
}

const browser = findBrowser();
if (!browser) {
  if (browserlessAction(process.env, Boolean(process.stdout.isTTY)) === "fail") {
    console.error(
      "FAIL: no Chromium-family browser was found and this run is not interactive, " +
        "so skipping would report green without exercising anything. Install " +
        "Brave/Chrome, point VELLUM_BROWSER at a browser binary, or set " +
        "VELLUM_ALLOW_NO_BROWSER=1 to skip on purpose.",
    );
    process.exit(1);
  }
  console.log(
    "SKIP: no Chromium-family browser found, skipping Explorer e2e " +
      "(install Brave/Chrome or set VELLUM_BROWSER).",
  );
  process.exit(0);
}

const results: StartOptions["results"] = [];
const consoleErrors: string[] = [];
const http4xx: string[] = [];
const skippedGroups: string[] = [];

// Key order IS the run order, and it is load-bearing: render asserts the pristine bare-visit boot, and the health checkpoint (N1/N2) asserts accumulated console/network state from everything before it. A selection is filtered to this order, never run in the order it was requested.
const SUITES = {
  "render": runRender,
  "motion": runMotion,
  "turn": runTurn,
  "verso": runVerso,
  "zoom": runZoom,
  "zoom-gestures": runZoomGestures,
  "glass-ceremony": runGlassCeremony,
  "cards": runCards,
  "health": runHealth,
  "fallback": runFallback,
  "hunt": runHunt,
  "print-room": runPrintRoom,
  "prospect": runProspect,
  "ribbon": runRibbon,
  "home": runHome,
  "landfall": runLandfall,
  "survey": runSurvey,
  "broadside": runBroadside,
  "reading-room": runReadingRoom,
  "room-instrument": runRoomInstrument,
  "room-ink": runRoomInk,
  "room-voyage": runRoomVoyage,
  "room-voyage-route": runRoomVoyageRoute,
  "room-address": runRoomAddress,
  "runninghead": runRunningHead,
  "cluster": runCluster,
  "room-drawer": runRoomDrawer,
  "chart-drawer": runChartDrawer,
  "document-rooms": runDocumentRooms,
  "region-detail": runRegionDetail,
  "specimen": runSpecimen,
  "corners": runCorners,
};

const missing = E2E_SUITE_ORDER.filter((name) => !(SUITES as Partial<typeof SUITES>)[name]);
if (missing.length > 0) {
  console.error(`FAIL: E2E_SUITE_ORDER names suites this runner cannot run: ${missing.join(", ")}`);
  process.exit(1);
}

async function main() {
  const ctx = await start({ browser: browser!, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx, skippedGroups });
  return runSelected(SELECTED, SUITES, ctx, {
    alive: ctx.alive,
    skippedGroups: () => skippedGroups,
    onSuiteError: async (name, err) => {
      // The WHOLE error, not just its message: a mid-suite TypeError's stack is what HARNESS ERROR used to print, and a report that drops it would be worse reading than the crash it replaces.
      console.error(`  ${name} stopped early:`, err);
      const e = err as { message?: string } | null | undefined;
      ctx.check(
        `${name} stopped early, so the checks after this one in that suite never ran (#534)`,
        false,
        e && e.message ? e.message : String(err),
      );
      // clearMobile() is a trailing statement in the phone suites, not a finally (suites/cluster.ts, suites/room-drawer.ts, suites/chart-drawer.ts), so a suite that stops at 390x844 hands every later suite in the lane a phone viewport and a cascade of reds that are not defects.
      // Bounded, because a browser that dies AFTER the liveness probe leaves this send pending forever: the harness settles a waiter only on the matching reply, so an unbounded reset here is a lane that stalls with nothing to read rather than one that fails.
      await Promise.race([
        ctx.clearMobile().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 5000).unref()),
      ]);
    },
  });
}

main()
  .then((timings) => {
    console.log("");
    for (const line of formatSuiteTimings(timings)) console.log(line);
    const aborted = timings.filter((t) => t.aborted).map((t) => t.name);
    const incomplete = suitesNotWhole(timings);
    const certified = suitesCertifiedByHealth(SELECTED, incomplete);
    if (aborted.length > 0) {
      console.log(
        `\n${aborted.length} suite${aborted.length > 1 ? "s" : ""} stopped early: ${aborted.join(", ")}. ` +
          `The checks after the failure in each never ran, so this run proves less than a whole one.`,
      );
    }
    const partial = timings.filter((t): t is E2eSuiteTiming & { readonly skipped: readonly string[] } => !t.aborted && t.skipped !== undefined && t.skipped.length > 0);
    if (partial.length > 0) {
      console.log(
        `\n${partial.length} suite${partial.length > 1 ? "s" : ""} skipped a check group: ` +
          `${partial.map((t) => `${t.name} (${t.skipped.join("; ")})`).join(", ")}. ` +
          `Each ran to its end, so the checks after the skip are real, but it exercised fewer interactions than a whole run.`,
      );
    }
    if (TIER !== "full") {
      console.log(`\ntier: ${TIER} (${SELECTED.length}/${E2E_SUITE_ORDER.length} suites): ${SELECTED.join(", ")}`);
      console.log(
        certified.length > 0
          ? `  N1/N2 certified the console/network state of: ${certified.join(", ")}`
          : SELECTED.includes("health")
            ? SELECTED.indexOf("health") === 0
              ? `  N1/N2 ran, but nothing preceded them, so they certify no suite.`
              : `  N1/N2 ran, but no suite before them ran to its end, so they certify no suite.`
            : `  N1/N2 did not run, so nothing here carries a console/network clean bill.`,
      );
    }
    const outcome = runOutcome(results);
    console.log(`\n${outcome.line}`);
    cleanup();
    process.exit(outcome.ok ? 0 : 1);
  })
  .catch((e) => {
    console.error("HARNESS ERROR:", e);
    // The checks that DID run still get their tally: exiting 2 with no score is the thing the streak breaker exists to prevent, and this is the door the breaker itself leaves by.
    if (results.length > 0) console.log(`\n${runOutcome(results).line}`);
    cleanup();
    process.exit(2);
  });
