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
      "survey",
    ],
    port: DEFAULT_E2E_PORT,
    dport: DEFAULT_E2E_DPORT,
  },
  {
    name: "B",
    suites: [
      "hunt",
      "print-room",
      "prospect",
      "ribbon",
      "home",
      "broadside",
      "reading-room",
      "room-instrument",
      "room-ink",
      "room-voyage",
      "room-voyage-route",
      "room-address",
      "runninghead",
      "region-detail",
    ],
    port: DEFAULT_E2E_PORT + 1,
    dport: DEFAULT_E2E_DPORT + 1,
  },
];

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

export function laneOutcome(results: readonly LaneResult[]): E2eOutcome {
  if (results.length === 0) return { ok: false, line: "FAIL: no lanes ran, so this run proves nothing." };
  const reported = new Set(results.map((r) => r.name));
  const absent = E2E_LANES.filter((lane) => !reported.has(lane.name)).map((l) => l.name);
  if (absent.length > 0) {
    return {
      ok: false,
      line: `FAIL: lane ${absent.join(" and ")} never reported, so ${results.length} of ${E2E_LANES.length} lanes ran and this run covers less than the full suite.`,
    };
  }
  const tally = sumTallies(results);
  const checks = tally ? `${tally.passed}/${tally.total} checks; ` : "";
  const detail = `${checks}${results.map(laneDetail).join(", ")}`;
  const failed = results.filter((r) => r.code !== 0);
  if (failed.length > 0) {
    const which = failed.map((r) => r.name).join(" and ");
    return { ok: false, line: `LANE ${which} FAILED  (${detail})` };
  }
  const skipped = results.filter((r) => r.skipped);
  if (skipped.length > 0) {
    const which = skipped.map((r) => r.name).join(" and ");
    return { ok: true, line: `LANE ${which} SKIPPED, so this run proves less than a pass  (${detail})` };
  }
  return { ok: true, line: `ALL LANES PASS  (${detail})` };
}
