// e2e runner (npm run test:e2e): drives a real headless browser over CDP, so it stays out of the node --test unit suite (slower, needs a Chromium-family browser and free ports); this file is the thin npm entrypoint that owns the shared accumulators and hands them, with the real browser, harness and suites, to the unit-tested e2e/support/runner.ts.
import { findBrowser } from "../src/cli/raster.ts";
import { cleanup, start } from "./harness.ts";
import { runE2eFromProcess } from "./support/runner.ts";
import { SUITES } from "./support/suite-map.ts";
import type { StartOptions } from "./types.ts";

const results: StartOptions["results"] = [];
const consoleErrors: string[] = [];
const http4xx: string[] = [];
const skippedGroups: string[] = [];

process.exit(
  await runE2eFromProcess(
    { results, consoleErrors, http4xx, skippedGroups },
    { findBrowser, start, cleanup, suites: SUITES },
  ),
);
