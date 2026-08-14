export const E2E_SUITES_VAR = "VELLUM_E2E_SUITES";

export const E2E_SUITE_ORDER = [
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
  "home",
  "survey",
  "broadside",
  "reading-room",
  "room-instrument",
  "room-ink",
  "room-voyage",
  "room-voyage-route",
  "room-address",
  "runninghead",
] as const;

export type E2eSuiteName = (typeof E2E_SUITE_ORDER)[number];

// A local debugging tier since #381 took its CI wiring out: 125 of 331 checks, ~1m10s, enough that
// every bundled page boots, both worker-bearing surfaces prove the worker live AND degrading, and
// health checks the console. It is also the retreat rung if the lanes ever have to come out.
export const SMOKE_SUITES: readonly E2eSuiteName[] = [
  "render",
  "health",
  "fallback",
  "hunt",
  "print-room",
  "home",
  "reading-room",
];

export type E2eTier = "full" | "smoke" | "custom";

export interface E2eSelection {
  readonly names: readonly E2eSuiteName[];
  readonly tier: E2eTier;
}

export interface E2eSuiteEnv {
  readonly [key: string]: string | undefined;
}

// waitSettled resolves on ANY settled page, so these non-navigating suites can settle on the boot
// auto-draw instead of their own; render is what consumes that boot draw.
const INHERITS_HARNESS_PAGE: readonly E2eSuiteName[] = [
  "motion",
  "turn",
  "verso",
  "glass-ceremony",
  "cards",
  "fallback",
];

const FULL_WORDS = new Set(["full", "all"]);
const canonicalise = (wanted: ReadonlySet<string>): E2eSuiteName[] =>
  E2E_SUITE_ORDER.filter((name) => wanted.has(name));

export function resolveSuiteSelection(env: E2eSuiteEnv): E2eSelection {
  const raw = env[E2E_SUITES_VAR];
  const text = (raw ?? "").trim().toLowerCase();
  if (text === "" || FULL_WORDS.has(text)) return { names: E2E_SUITE_ORDER.slice(), tier: "full" };
  if (text === "smoke") return { names: canonicalise(new Set(SMOKE_SUITES)), tier: "smoke" };

  const requested = text.split(",").map((part) => part.trim()).filter((part) => part !== "");
  const unknown = requested.filter((name) => !E2E_SUITE_ORDER.includes(name as E2eSuiteName));
  if (unknown.length > 0) {
    throw new Error(
      `${E2E_SUITES_VAR} names ${unknown.length > 1 ? "suites" : "a suite"} that does not exist: ` +
        `${unknown.join(", ")}. Valid suites are ${E2E_SUITE_ORDER.join(", ")}; ` +
        `or use "smoke", or "full"/"all". A misspelling is rejected rather than skipped, since ` +
        `narrowing silently would report a green run that proved less than it claimed.`,
    );
  }
  if (requested.length === 0) {
    throw new Error(
      `${E2E_SUITES_VAR}=${JSON.stringify(raw)} names no suites at all. ` +
        `Name at least one suite, or unset it to run the full suite.`,
    );
  }
  const wanted = new Set(requested);
  if (INHERITS_HARNESS_PAGE.some((name) => wanted.has(name))) wanted.add("render");
  return { names: canonicalise(wanted), tier: "custom" };
}

export interface E2eCheckResult {
  readonly ok: boolean;
}

export interface E2eOutcome {
  readonly ok: boolean;
  readonly line: string;
}

export type E2eSuiteRunners = Readonly<Record<string, (ctx: unknown) => Promise<unknown>>>;

export interface E2eSuiteTiming {
  readonly name: E2eSuiteName;
  readonly ms: number;
}

export async function runSelected(
  names: readonly E2eSuiteName[],
  suites: E2eSuiteRunners,
  ctx: unknown,
  now: () => number = () => performance.now(),
): Promise<readonly E2eSuiteTiming[]> {
  const timings: E2eSuiteTiming[] = [];
  for (const name of names) {
    const run = suites[name];
    if (!run) throw new Error(`the runner has no suite named ${name}`);
    const started = now();
    await run(ctx);
    timings.push({ name, ms: now() - started });
  }
  return timings;
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

export function formatSuiteTimings(timings: readonly E2eSuiteTiming[]): readonly string[] {
  if (timings.length === 0) return [];
  const total = timings.reduce((sum, t) => sum + t.ms, 0);
  const ranked = timings.slice().sort((a, b) => b.ms - a.ms);
  const width = Math.max(...ranked.map((t) => t.name.length));
  return [
    `per-suite wall clock (${timings.length} suites, ${seconds(total)} total):`,
    ...ranked.map((t) => {
      const share = total === 0 ? 0 : (t.ms / total) * 100;
      return `  ${t.name.padEnd(width)}  ${seconds(t.ms).padStart(6)}  ${share.toFixed(1).padStart(5)}%`;
    }),
  ];
}

export function runOutcome(results: readonly E2eCheckResult[]): E2eOutcome {
  if (results.length === 0) return { ok: false, line: "FAIL: no checks ran, so this run proves nothing." };
  const passed = results.filter((r) => r.ok).length;
  return { ok: passed === results.length, line: `${passed === results.length ? "ALL PASS" : "SOME FAILED"}  (${passed}/${results.length})` };
}

export function suitesCertifiedByHealth(names: readonly E2eSuiteName[]): readonly E2eSuiteName[] {
  const at = names.indexOf("health");
  return at === -1 ? [] : names.slice(0, at);
}
