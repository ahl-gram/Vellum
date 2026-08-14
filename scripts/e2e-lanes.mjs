// e2e lane driver (npm run test:e2e:lanes): spawns one e2e-explorer per lane on its own port, streams both outputs line-prefixed, and fails if either lane does. Two processes in ONE CI job, so there is no build-once-and-upload artifact plumbing a job matrix would need.
// .mjs rather than .ts (CLAUDE.md's one-language rule asks for the reason at the file head): this is the matched sibling of scripts/e2e-explorer.mjs, the other thin e2e entrypoint, and scripts/ is outside tsconfig's include so a .ts here would be unchecked anyway. Every decision it makes lives in src/cli/e2e-lanes.ts, which IS checked and unit-tested.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { findBrowser } from "../src/cli/raster.ts";
import { browserlessAction } from "../src/cli/browser-policy.ts";
import {
  E2E_LANES,
  ambientSelectionRefusal,
  laneCheckTally,
  laneChildEnv,
  laneLineIsSkip,
  laneOutcome,
  splitLaneChunk,
} from "../src/cli/e2e-lanes.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const RUNNER = join(HERE, "e2e-explorer.mjs");

const refusal = ambientSelectionRefusal(process.env);
if (refusal) {
  console.error(`FAIL: ${refusal}`);
  process.exit(1);
}

// Decide the browserless policy HERE, against this process's real TTY: the lanes' stdio is piped, so
// a child would see isTTY false and hard-fail where `npm run test:e2e` skips.
if (!findBrowser()) {
  if (browserlessAction(process.env, Boolean(process.stdout.isTTY)) === "fail") {
    console.error(
      "FAIL: no Chromium-family browser was found and this run is not interactive, " +
        "so skipping would report green without exercising anything. Install " +
        "Brave/Chrome, point VELLUM_BROWSER at a browser binary, or set " +
        "VELLUM_ALLOW_NO_BROWSER=1 to skip on purpose.",
    );
    process.exit(1);
  }
  console.log("SKIP: no Chromium-family browser found, skipping the Explorer e2e lanes (install Brave/Chrome or set VELLUM_BROWSER).");
  process.exit(0);
}

function streamLines(stream, prefix, sink, onLine) {
  let rest = "";
  stream.setEncoding("utf8");
  const emit = (line) => {
    onLine(line);
    sink(`${prefix} ${line}`);
  };
  stream.on("data", (chunk) => {
    const split = splitLaneChunk(rest, chunk);
    rest = split.rest;
    for (const line of split.lines) emit(line);
  });
  stream.on("end", () => {
    if (rest !== "") emit(rest);
  });
}

function runLane(lane) {
  return new Promise((settle) => {
    const started = performance.now();
    const child = spawn(process.execPath, [RUNNER], {
      env: laneChildEnv(lane, process.env),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let skipped = false;
    let tally = null;
    // A child can still skip when VELLUM_ALLOW_NO_BROWSER is set explicitly, and its own tally is
    // the only place the check counts exist.
    const readLine = (line) => {
      if (laneLineIsSkip(line)) skipped = true;
      tally = laneCheckTally(line) ?? tally;
    };
    const prefix = `[${lane.name}]`;
    streamLines(child.stdout, prefix, (l) => console.log(l), readLine);
    streamLines(child.stderr, prefix, (l) => console.error(l), readLine);
    // A null exit code means a signal or a failed spawn, so the lane never reported an outcome at all: that is a harness failure (2), not a failed check (1).
    const done = (code) => settle({ name: lane.name, code: code ?? 2, ms: performance.now() - started, skipped, tally });
    child.on("error", (err) => {
      console.error(`${prefix} FAIL: lane could not start: ${err.message}`);
      done(2);
    });
    child.on("close", done);
  });
}

for (const lane of E2E_LANES) {
  console.log(
    `lane ${lane.name}: ${lane.suites.length} suites on port ${lane.port}/${lane.dport}: ${lane.suites.join(", ")}`,
  );
}

const results = await Promise.all(E2E_LANES.map(runLane));
const outcome = laneOutcome(results);
console.log(`\n${outcome.line}`);
process.exit(outcome.ok ? 0 : 1);
