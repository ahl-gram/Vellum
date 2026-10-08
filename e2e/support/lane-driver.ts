import { spawn } from "node:child_process";
import { join } from "node:path";
import type { Readable } from "node:stream";
import { findBrowser } from "../../src/cli/raster.ts";
import {
  ambientSelectionRefusal,
  laneCheckTally,
  laneChildEnv,
  laneLineIsSkip,
  laneOutcome,
  resolveLaneSelection,
  splitLaneChunk,
} from "./lanes.ts";
import type { E2eLane, LaneResult, LaneTally } from "./lanes.ts";
import { REPO, browserlessExit } from "./runner.ts";
import type { EnvLike } from "./runner.ts";
import { errorText } from "./suites.ts";

export interface LaneChild {
  readonly stdout: Readable;
  readonly stderr: Readable;
  on(event: "error", listener: (err: Error) => void): unknown;
  on(event: "close", listener: (code: number | null) => void): unknown;
}

export type LaneSpawn = (
  command: string,
  args: readonly string[],
  options: { readonly env: Record<string, string>; readonly stdio: ["ignore", "pipe", "pipe"] },
) => LaneChild;

export interface LaneDriverDeps {
  readonly findBrowser: () => string | null;
  readonly spawn: LaneSpawn;
}

export interface LaneDriverIo extends LaneDriverDeps {
  readonly argv: readonly string[];
  readonly env: EnvLike;
  readonly isTTY: boolean;
  readonly out: (line: string) => void;
  readonly err: (line: string) => void;
}

export const RUNNER = join(REPO, "e2e", "run.ts");
export const LANES_SKIP_LINE =
  "SKIP: no Chromium-family browser found, skipping the Explorer e2e lanes (install Brave/Chrome or set VELLUM_BROWSER).";

function streamLines(
  stream: Readable,
  prefix: string,
  sink: (line: string) => void,
  onLine: (line: string) => void,
): void {
  let rest = "";
  stream.setEncoding("utf8");
  const emit = (line: string) => {
    onLine(line);
    sink(`${prefix} ${line}`);
  };
  stream.on("data", (chunk: string) => {
    const split = splitLaneChunk(rest, chunk);
    rest = split.rest;
    for (const line of split.lines) emit(line);
  });
  stream.on("end", () => {
    if (rest !== "") emit(rest);
  });
}

function runLane(lane: E2eLane, io: LaneDriverIo): Promise<LaneResult> {
  return new Promise((settle) => {
    const started = performance.now();
    const child = io.spawn(process.execPath, [RUNNER], {
      env: laneChildEnv(lane, io.env),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let skipped = false;
    let tally: LaneTally | null = null;
    const readLine = (line: string) => {
      if (laneLineIsSkip(line)) skipped = true;
      tally = laneCheckTally(line) ?? tally;
    };
    const prefix = `[${lane.name}]`;
    streamLines(child.stdout, prefix, io.out, readLine);
    streamLines(child.stderr, prefix, io.err, readLine);
    // A null code is a signal or a failed spawn, so the lane reported no outcome at all: harness failure (2), not failed check (1).
    const done = (code: number | null) =>
      settle({ name: lane.name, code: code ?? 2, ms: performance.now() - started, skipped, tally });
    child.on("error", (err) => {
      io.err(`${prefix} FAIL: lane could not start: ${err.message}`);
      done(2);
    });
    child.on("close", done);
  });
}

export async function runLanes(io: LaneDriverIo): Promise<number> {
  let selected: readonly E2eLane[];
  try {
    selected = resolveLaneSelection(io.argv);
  } catch (failure) {
    io.err(`FAIL: ${errorText(failure)}`);
    return 1;
  }
  const refusal = ambientSelectionRefusal(io.env);
  if (refusal) {
    io.err(`FAIL: ${refusal}`);
    return 1;
  }
  // Piped stdio hides the TTY from a child, so the policy is resolved HERE or a browserless local run hard-fails where `npm run test:e2e` skips.
  if (!io.findBrowser()) return browserlessExit(io.env, io.isTTY, LANES_SKIP_LINE, io);
  for (const lane of selected) {
    io.out(
      `lane ${lane.name}: ${lane.suites.length} suites on port ${lane.port}/${lane.dport}: ${lane.suites.join(", ")}`,
    );
  }
  const results = await Promise.all(selected.map((lane) => runLane(lane, io)));
  const outcome = laneOutcome(results, selected);
  io.out(`\n${outcome.line}`);
  return outcome.ok ? 0 : 1;
}

export function runLanesFromProcess(deps: LaneDriverDeps = { findBrowser, spawn }): Promise<number> {
  return runLanes({
    ...deps,
    argv: process.argv.slice(2),
    env: process.env,
    isTTY: Boolean(process.stdout.isTTY),
    out: (line) => console.log(line),
    err: (line) => console.error(line),
  });
}
