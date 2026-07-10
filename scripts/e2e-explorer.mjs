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
// no browser it SKIPS (exit 0) so browserless environments stay green — unless
// VELLUM_REQUIRE_BROWSER is set (CI), where a missing browser fails loud instead.
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { findBrowser } from "../src/cli/raster.ts";
import { start, cleanup } from "./e2e/harness.mjs";
import { run as runRender } from "./e2e/suite-render.mjs";
import { run as runMotion } from "./e2e/suite-motion.mjs";
import { run as runTurn } from "./e2e/suite-turn.mjs";
import { run as runVerso } from "./e2e/suite-verso.mjs";
import { run as runCards } from "./e2e/suite-cards.mjs";
import { run as runScrubber } from "./e2e/suite-scrubber.mjs";
import { run as runVoyage } from "./e2e/suite-voyage.mjs";
import { run as runHealth } from "./e2e/suite-health.mjs";
import { run as runFallback } from "./e2e/suite-fallback.mjs";
import { run as runHunt } from "./e2e/suite-hunt.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url)); // scripts/
const REPO = resolve(HERE, "..");
// Serve the built deploy artifact (dist/) so the e2e validates exactly what gets
// published. Override with VELLUM_SITE_DIR. Run `npm run build` first to populate it.
const SITE = process.env["VELLUM_SITE_DIR"] ? resolve(process.env["VELLUM_SITE_DIR"]) : join(REPO, "dist");
const OUT = join(REPO, "out", "e2e");
const PORT = 8765;
const DPORT = 9222;
const PAGE = `http://127.0.0.1:${PORT}/explorer/`;

const browser = findBrowser();
if (!browser) {
  if (process.env["VELLUM_REQUIRE_BROWSER"]) {
    console.error(
      "FAIL: VELLUM_REQUIRE_BROWSER is set but no Chromium-family browser was found " +
        "(set VELLUM_BROWSER to a browser binary).",
    );
    process.exit(1);
  }
  console.log(
    "SKIP: no Chromium-family browser found — skipping Explorer e2e " +
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
  await runCards(ctx);
  await runScrubber(ctx);
  await runVoyage(ctx);
  await runHealth(ctx);
  await runFallback(ctx);
  await runHunt(ctx);
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
