import { E2E_SUITE_ORDER, E2E_SUITES_VAR } from "./e2e-suites.ts";
import type { E2eSuiteName, E2eSuiteEnv, E2eOutcome } from "./e2e-suites.ts";
import { DEFAULT_E2E_PORT, DEFAULT_E2E_DPORT, E2E_PORT_VAR, E2E_DPORT_VAR } from "./e2e-ports.ts";

export interface E2eLane {
  readonly name: string;
  readonly suites: readonly E2eSuiteName[];
  readonly port: number;
  readonly dport: number;
}

export const E2E_LANES: readonly E2eLane[] = [
  {
    name: "A",
    suites: [
      "render",
      "motion",
      "turn",
      "verso",
      "zoom",
      "zoom-gestures",
      "glass-ceremony",
      "cards",
      "health",
      "fallback",
      "hunt",
      "print-room",
      "landfall",
      "survey",
      // Moved from lane B at #637, sized from the CI lane logs' own per-suite wall clock (main runs 35518105601, 35486671870 and 35489161890 read it at 43.7, 43.4 and 35.2s against a lane gap of 86, 85 and 10s) rather than from MEASURED_SECONDS, whose Mac seconds scale about 2.4x to CI on this lane and 1.95x on lane B and so over-weight B; it boots its own page through about:blank (room.goto), so it inherits nothing from whatever ran before it.
      "room-address",
      // Moved from lane B at #522, when the drawer suite's re-measured budget took B to 60.2% and the balance assertion below reds at 0.6. It is appended at the END of this lane, which is after `health`, so the prefix that suite certifies is unchanged, and it boots its own page through about:blank, so it inherits nothing from whatever ran before it.
      "specimen",
    ],
    port: DEFAULT_E2E_PORT,
    dport: DEFAULT_E2E_DPORT,
  },
  {
    name: "B",
    suites: [
      "prospect",
      "ribbon",
      "home",
      "broadside",
      "reading-room",
      "room-instrument",
      "room-ink",
      "room-voyage",
      "room-voyage-route",
      "runninghead",
      "cluster",
      "room-drawer",
      "chart-drawer",
      "document-rooms",
      "region-detail",
    ],
    port: DEFAULT_E2E_PORT + 1,
    dport: DEFAULT_E2E_DPORT + 1,
  },
];

export const LANE_FLAG = "--lane";

export function resolveLaneSelection(argv: readonly string[]): readonly E2eLane[] {
  const names = E2E_LANES.map((l) => l.name).join(", ");
  const asked: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === LANE_FLAG) {
      asked.push(argv[i + 1] ?? "");
      i++;
    } else if (arg.startsWith(`${LANE_FLAG}=`)) {
      asked.push(arg.slice(LANE_FLAG.length + 1));
    } else {
      throw new Error(
        `the lane driver does not take ${JSON.stringify(arg)}. Its only argument is ` +
          `\`${LANE_FLAG} <name>\`, one of ${names}; with no argument it runs every lane.`,
      );
    }
  }
  if (asked.length === 0) return E2E_LANES;
  if (asked.length > 1) {
    throw new Error(
      `${LANE_FLAG} was given more than once (${asked.map((a) => JSON.stringify(a)).join(", ")}). ` +
        `One job runs one lane, so name a single lane out of ${names}, or drop the flag to run every lane.`,
    );
  }
  const wanted = asked[0]!;
  if (wanted === "") {
    throw new Error(
      `${LANE_FLAG} was given no lane name. Name one of ${names}, or drop the flag to run every lane.`,
    );
  }
  const lane = E2E_LANES.find((l) => l.name === wanted);
  if (!lane) {
    throw new Error(
      `${LANE_FLAG} ${JSON.stringify(wanted)} names a lane that does not exist. The lanes are ` +
        `${names}, and E2E_LANES here is the only roster of them. A misspelling is refused rather ` +
        `than run as the full set, since widening silently would spend this runner on work the ` +
        `other job already did, and narrowing silently would report a green shard that covered ` +
        `less than its job claims.`,
    );
  }
  return [lane];
}

export interface LaneResult {
  readonly name: string;
  readonly code: number;
  readonly ms: number;
  readonly skipped: boolean;
  readonly tally: LaneTally | null;
}

export function laneChildEnv(lane: E2eLane, base: E2eSuiteEnv): Record<string, string> {
  const inherited = Object.fromEntries(
    Object.entries(base).filter(([, v]) => v !== undefined) as [string, string][],
  );
  return {
    ...inherited,
    [E2E_SUITES_VAR]: lane.suites.join(","),
    [E2E_PORT_VAR]: String(lane.port),
    [E2E_DPORT_VAR]: String(lane.dport),
  };
}

export function ambientSelectionRefusal(env: E2eSuiteEnv): string | null {
  const raw = env[E2E_SUITES_VAR];
  if (raw === undefined || raw.trim() === "") return null;
  return (
    `${E2E_SUITES_VAR}=${JSON.stringify(raw)} is set, but the lanes ARE the selection: each lane ` +
    `sets it for its own child, so honouring this would run less than the full suite and still ` +
    `report the lanes green. Unset it, or run one tier serially with \`npm run test:e2e\`.`
  );
}

export interface LaneChunk {
  readonly lines: readonly string[];
  readonly rest: string;
}

export function splitLaneChunk(rest: string, chunk: string): LaneChunk {
  const parts = (rest + chunk).split("\n");
  return { lines: parts.slice(0, -1), rest: parts[parts.length - 1] ?? "" };
}

export function laneLineIsSkip(line: string): boolean {
  return line.startsWith("SKIP:");
}

export interface LaneTally {
  readonly passed: number;
  readonly total: number;
}

export function laneCheckTally(line: string): LaneTally | null {
  const m = line.match(/\((\d+)\/(\d+)\)\s*$/);
  return m ? { passed: Number(m[1]), total: Number(m[2]) } : null;
}

const sumTallies = (results: readonly LaneResult[]): LaneTally | null => {
  const seen = results.map((r) => r.tally).filter((t): t is LaneTally => t !== null);
  if (seen.length === 0) return null;
  return {
    passed: seen.reduce((n, t) => n + t.passed, 0),
    total: seen.reduce((n, t) => n + t.total, 0),
  };
};

const laneDetail = (r: LaneResult): string => {
  const took = `${(r.ms / 1000).toFixed(1)}s`;
  if (r.code === 2) return `${r.name} HARNESS ERROR (exit 2) ${took}`;
  if (r.code !== 0) return `${r.name} failed (exit ${r.code}) ${took}`;
  return `${r.name} ${r.skipped ? "SKIPPED" : "ok"} ${took}`;
};

export function laneOutcome(
  results: readonly LaneResult[],
  selected: readonly E2eLane[] = E2E_LANES,
): E2eOutcome {
  if (results.length === 0) return { ok: false, line: "FAIL: no lanes ran, so this run proves nothing." };
  if (selected.length === 0) {
    return { ok: false, line: "FAIL: no lanes were selected, so this run was asked to prove nothing." };
  }
  const reported = new Set(results.map((r) => r.name));
  const stray = results.filter((r) => !selected.some((lane) => lane.name === r.name)).map((r) => r.name);
  if (stray.length > 0) {
    return {
      ok: false,
      line: `FAIL: lane ${stray.join(" and ")} reported but was never selected, so this is not the run that was asked for and its verdict belongs to some other job.`,
    };
  }
  const absent = selected.filter((lane) => !reported.has(lane.name)).map((l) => l.name);
  if (absent.length > 0) {
    return {
      ok: false,
      line: `FAIL: lane ${absent.join(" and ")} never reported, so ${results.length} of ${selected.length} lanes ran and this run covers less than the full suite.`,
    };
  }
  const tally = sumTallies(results);
  const checks = tally ? `${tally.passed}/${tally.total} checks; ` : "";
  const detail = `${checks}${results.map(laneDetail).join(", ")}`;
  const whole = selected.length === E2E_LANES.length && E2E_LANES.every((lane) => reported.has(lane.name));
  const scope = whole ? "" : `${selected.length} of ${E2E_LANES.length} lanes, not the full suite; `;
  const failed = results.filter((r) => r.code !== 0);
  if (failed.length > 0) {
    const which = failed.map((r) => r.name).join(" and ");
    return { ok: false, line: `LANE ${which} FAILED  (${scope}${detail})` };
  }
  const skipped = results.filter((r) => r.skipped);
  if (skipped.length > 0) {
    const which = skipped.map((r) => r.name).join(" and ");
    return { ok: true, line: `LANE ${which} SKIPPED, so this run proves less than a pass  (${scope}${detail})` };
  }
  if (whole) return { ok: true, line: `ALL LANES PASS  (${detail})` };
  const which = selected.map((l) => l.name).join(" and ");
  return { ok: true, line: `LANE ${which} PASS  (${scope}${detail})` };
}
