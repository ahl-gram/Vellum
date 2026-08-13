// e2e runner (npm run test:e2e): drives a real headless browser over CDP, so it stays out of the node --test unit suite (slower, needs a Chromium-family browser and free ports); this file is the thin npm entrypoint that owns the shared accumulators and invokes the suites in order.
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { findBrowser } from "../src/cli/raster.ts";
import { browserlessAction } from "../src/cli/browser-policy.ts";
import { resolveE2ePorts } from "../src/cli/e2e-ports.ts";
import { start, cleanup } from "./e2e/harness.mjs";
import { run as runRender } from "./e2e/suite-render.mjs";
import { run as runMotion } from "./e2e/suite-motion.mjs";
import { run as runTurn } from "./e2e/suite-turn.mjs";
import { run as runVerso } from "./e2e/suite-verso.mjs";
import { run as runZoom } from "./e2e/suite-zoom.mjs";
import { run as runZoomGestures } from "./e2e/suite-zoom-gestures.mjs";
import { run as runGlassCeremony } from "./e2e/suite-glass-ceremony.mjs";
import { run as runCards } from "./e2e/suite-cards.mjs";
import { run as runHealth } from "./e2e/suite-health.mjs";
import { run as runFallback } from "./e2e/suite-fallback.mjs";
import { run as runHunt } from "./e2e/suite-hunt.mjs";
import { run as runPrintRoom } from "./e2e/suite-print-room.mjs";
import { run as runHome } from "./e2e/suite-home.mjs";
import { run as runSurvey } from "./e2e/suite-survey.mjs";
import { run as runBroadside } from "./e2e/suite-broadside.mjs";
import { run as runReadingRoom } from "./e2e/suite-reading-room.mjs";
import { run as runRoomInstrument } from "./e2e/suite-room-instrument.mjs";
import { run as runRoomInk } from "./e2e/suite-room-ink.mjs";
import { run as runRoomVoyage } from "./e2e/suite-room-voyage.mjs";
import { run as runRoomAddress } from "./e2e/suite-room-address.mjs";
import { run as runRoomVoyageRoute } from "./e2e/suite-room-voyage-route.mjs";
import { run as runRunningHead } from "./e2e/suite-runninghead.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url)); // scripts/
const REPO = resolve(HERE, "..");
// Serves the built dist/ so the e2e validates exactly what gets published (VELLUM_SITE_DIR overrides; run `npm run build` first).
const SITE = process.env["VELLUM_SITE_DIR"] ? resolve(process.env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
const OUT = join(REPO, "out", "e2e");
// #339: VELLUM_E2E_PORT / VELLUM_E2E_DPORT (defaults 8765 / 9222) let two checkouts run side by side; a bad value fails here rather than falling back, since a silent fallback puts both lanes back on the same port.
const { PORT, DPORT } = readPorts();
const PAGE = `http://127.0.0.1:${PORT}/explorer/`;

function readPorts() {
  try {
    return resolveE2ePorts(process.env);
  } catch (err) {
    console.error(`FAIL: ${err.message}`);
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

const results = [];
const consoleErrors = [];
const http4xx = [];

async function main() {
  const ctx = await start({ browser, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx });
  // Order is load-bearing: the health checkpoint (N1/N2) asserts accumulated console/network state from everything before it, and render -> motion -> turn -> verso each redraw their own clean base.
  await runRender(ctx);
  await runMotion(ctx);
  await runTurn(ctx);
  await runVerso(ctx);
  await runZoom(ctx);
  await runZoomGestures(ctx);
  await runGlassCeremony(ctx);
  await runCards(ctx);
  await runHealth(ctx);
  await runFallback(ctx);
  await runHunt(ctx);
  await runPrintRoom(ctx);
  await runHome(ctx);
  await runSurvey(ctx);
  await runBroadside(ctx);
  await runReadingRoom(ctx);
  await runRoomInstrument(ctx);
  await runRoomInk(ctx);
  await runRoomVoyage(ctx);
  await runRoomVoyageRoute(ctx);
  await runRoomAddress(ctx);
  await runRunningHead(ctx);
}

main()
  .then(() => {
    const passed = results.every((r) => r.ok);
    console.log(`\n${passed ? "ALL PASS" : "SOME FAILED"}  (${results.filter((r) => r.ok).length}/${results.length})`);
    cleanup();
    process.exit(passed ? 0 : 1);
  })
  .catch((e) => {
    console.error("HARNESS ERROR:", e);
    cleanup();
    process.exit(2);
  });
