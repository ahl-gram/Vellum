// End-to-end verification for the Explorer render worker (#5), run via
// `npm run test:e2e`. Kept out of the `node --test` unit suite on purpose: it
// drives a real headless browser over CDP, so it is slower and needs a Chromium-
// family browser + free ports. It proves, in an actual browser:
//   - the worker runs (no silent fallback to the inline engine)
//   - worker output is byte-identical to the inline engine (draw + atlas, the
//     atlas exercising the locale-sensitive gazetteer)
//   - the worker draw matches the committed Node-built chart up to ~1 trig ULP
//   - the draw/bind race cannot show an atlas that disagrees with the chart
//   - the inline fallback works when the worker script is unavailable (served 404)
//   - no JS errors, the only 4xx is the benign favicon, the initial draw rendered
//   - the #53 story-card overlay and the #54 chronicle scrubber behave
//   - the seed-of-the-day Daily Hunt (#56) click-to-find flow
//
// This file is the thin runner + npm entrypoint: it stays at scripts/ (so the
// `../src/cli/raster.ts` import depth and the REPO/SITE/OUT path math do not move),
// owns the shared accumulators + the pass/fail tally, and invokes the check suites
// in order. The harness (server/CDP/helpers) lives in scripts/e2e/harness.mjs and
// each check series in its own scripts/e2e/suite-*.mjs.
//
// Browser discovery reuses findBrowser() (Mac/Linux paths + VELLUM_BROWSER). With
// no browser the run SKIPS (exit 0) only when it is INTERACTIVE, so a browserless
// laptop stays green; CI and any unattended run (cron, cloud agent, piped output)
// fail loud instead, because there a skip is indistinguishable from a pass.
// VELLUM_REQUIRE_BROWSER forces the failure, VELLUM_ALLOW_NO_BROWSER forces the
// skip; the decision itself is browserlessAction() in src/cli/browser-policy.ts.
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
import { run as runScrubber } from "./e2e/suite-scrubber.mjs";
import { run as runVoyage } from "./e2e/suite-voyage.mjs";
import { run as runVoyageVerso } from "./e2e/suite-voyage-verso.mjs";
import { run as runVoyageRoute } from "./e2e/suite-voyage-route.mjs";
import { run as runHealth } from "./e2e/suite-health.mjs";
import { run as runFallback } from "./e2e/suite-fallback.mjs";
import { run as runHunt } from "./e2e/suite-hunt.mjs";
import { run as runPrintRoom } from "./e2e/suite-print-room.mjs";
import { run as runHome } from "./e2e/suite-home.mjs";
import { run as runAddress } from "./e2e/suite-address.mjs";
import { run as runReadingRoom } from "./e2e/suite-reading-room.mjs";
import { run as runRoomInstrument } from "./e2e/suite-room-instrument.mjs";
import { run as runRoomVoyage } from "./e2e/suite-room-voyage.mjs";
import { run as runRoomAddress } from "./e2e/suite-room-address.mjs";
import { run as runRoomVoyageRoute } from "./e2e/suite-room-voyage-route.mjs";
import { run as runRunningHead } from "./e2e/suite-runninghead.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url)); // scripts/
const REPO = resolve(HERE, "..");
// Serve the built deploy artifact (dist/) so the e2e validates exactly what gets
// published. Override with VELLUM_SITE_DIR. Run `npm run build` first to populate it.
const SITE = process.env["VELLUM_SITE_DIR"] ? resolve(process.env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
const OUT = join(REPO, "out", "e2e");
// #339: both ports are overridable (VELLUM_E2E_PORT / VELLUM_E2E_DPORT, defaulting
// to 8765 / 9222) so two checkouts can run this at the same time. A bad value fails
// here rather than falling back, since a silent fallback puts both lanes back on the
// same port. The debug port carries a second hazard the harness preflights: see
// debugPortConflictMessage in src/cli/e2e-ports.ts.
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
  // Policy lives in browser-policy.ts so it can be unit-tested; here it can only
  // be expressed as an exit code, which no test can read.
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

// Module-level so the trailing .then/.catch can read the tally and tear down even
// if start() throws (cleanup is always defined; the harness's is a real teardown).
const results = [];
const consoleErrors = [];
const http4xx = [];

async function main() {
  const ctx = await start({ browser, SITE, OUT, PORT, DPORT, PAGE, results, consoleErrors, http4xx });
  // Order is load-bearing: the health checkpoint (N1/N2) asserts accumulated
  // console/network state from everything before it, then the fallback reload and
  // the hunt run on top. Render -> motion -> turn -> verso is the old explorer-core
  // split, kept in that order (each redraws its own clean base).
  await runRender(ctx);
  await runMotion(ctx);
  await runTurn(ctx);
  await runVerso(ctx);
  // #164 The Surveyor's Glass: geometric zoom on the antique chart. Runs on the clean
  // antique base verso leaves, and snaps the camera home before handing off to cards.
  await runZoom(ctx);
  // #166 Sub 5: the same zoom/pan proven again through REAL synthesized browser input
  // (wheel, pinch, drag, mobile viewport). Reloads under touch/device emulation and
  // restores the clean antique desktop home suite-zoom left, before cards.
  await runZoomGestures(ctx);
  // #170 Glass Sub 9: the ceremony (antique voice, voiced glide, redraft ink-in).
  // Runs on the clean antique home the gesture suite restores, and restores the
  // same base (redraft off, camera home) before cards.
  await runGlassCeremony(ctx);
  await runCards(ctx);
  await runScrubber(ctx);
  // Voyage split into core -> verso bleed-through -> real routes, run in that order:
  // core establishes the voyage session/base the other two inherit; route restores clean.
  await runVoyage(ctx);
  await runVoyageVerso(ctx);
  await runVoyageRoute(ctx);
  await runHealth(ctx);
  await runFallback(ctx);
  await runHunt(ctx);
  // The Print Room (#133) is a separate page that reuses the Explorer's worker from
  // another directory; like the hunt it runs after the health checkpoint and carries
  // its own scoped no-4xx + console-error delta (see suite-print-room.mjs).
  await runPrintRoom(ctx);
  // The cartouche hero (#289): the homepage's seed form and its real navigation
  // into the Explorer; self-scoped like the hunt and the Print Room.
  await runHome(ctx);
  // The Address (#192): survey/year deep links restore the armed instruments;
  // self-scoped, and last because every check is its own fresh navigation.
  await runAddress(ctx);
  // The Reading Room (#221): the epic's destination page. Self-scoped fresh
  // navigations with constructed hashes (decision 3: no Explorer entry point to
  // follow), so it slots after the address suite whose vocabulary it consumes.
  await runReadingRoom(ctx);
  // #320 Survey and Story Sub 3: the live-animation coverage re-hosted on the room,
  // running beside the Explorer-hosted originals rather than replacing them (Sub 4
  // retires those). Slots after the room's own suite, whose boot/settle idiom it
  // shares and whose armed-rest checks it builds on.
  await runRoomInstrument(ctx);
  await runRoomVoyage(ctx);
  await runRoomVoyageRoute(ctx);
  await runRoomAddress(ctx);
  // The Running Head (#295): the shell masthead asserted by RESOLVED computed
  // styles, the cascade failure a source-text CSS test cannot see. It sweeps all
  // seven shelled pages and mutates the Print Room's #pr-atlas, so it restores the
  // settled Explorer base before returning, like the zoom and ceremony suites.
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
