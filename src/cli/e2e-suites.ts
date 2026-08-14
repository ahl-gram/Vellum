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

// The coverage floor a smoke-green PR guarantees, re-derived from measurement rather than from the
// issue's stale "~60 checks": 125 of 331 checks. Every page that ships its own bundle
// (BUNDLE_ENTRIES: explorer, print-room, seed-of-the-day, reading-room) boots and renders; the two
// surfaces that spawn the shared worker chunk assert it is live AND degrade correctly when it 404s
// (render R1 + fallback B1-B3 for the Explorer, reading-room RR1 + its blockWorker block); health
// carries the console/network checkpoint. Anything not listed here is what a smoke-green PR does NOT
// prove, which is the trade #266 accepts.
// Lane note (#266, 2026-08-13): the timing-heavy suites (motion, turn, survey, zoom) are all OUT of
// this tier, so smoke never contends with itself; if lanes are ever added, those four belong in ONE
// lane so they never compete, since they assert against measured frame counts and wall-clock timings.
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

// These run against the page the harness already loaded rather than navigating themselves, and
// waitSettled resolves as soon as the page is settled. So if the boot auto-draw has not been
// consumed, one of these can settle on the boot world instead of its own draw: VELLUM_E2E_SUITES=turn
// fails T1b with the seed-of-the-day seed where it asserts 42. render is the suite that consumes the
// boot draw (R0/R0b assert the pristine bare visit), so requesting an inheritor pulls render in.
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

// The run loop lives here, not in the .mjs runner, so that "only the selected suites run, in this
// order" is a behavior a test can execute rather than a line a test can only grep for.
export async function runSelected(
  names: readonly E2eSuiteName[],
  suites: E2eSuiteRunners,
  ctx: unknown,
): Promise<void> {
  for (const name of names) {
    const run = suites[name];
    if (!run) throw new Error(`the runner has no suite named ${name}`);
    await run(ctx);
  }
}

export function runOutcome(results: readonly E2eCheckResult[]): E2eOutcome {
  // An empty run is what a selection flag newly makes reachable: `every()` is true for [], so a
  // selection that matched nothing would otherwise report ALL PASS (0/0) and exit green.
  if (results.length === 0) return { ok: false, line: "FAIL: no checks ran, so this run proves nothing." };
  const passed = results.filter((r) => r.ok).length;
  return { ok: passed === results.length, line: `${passed === results.length ? "ALL PASS" : "SOME FAILED"}  (${passed}/${results.length})` };
}

export function suitesCertifiedByHealth(names: readonly E2eSuiteName[]): readonly E2eSuiteName[] {
  const at = names.indexOf("health");
  return at === -1 ? [] : names.slice(0, at);
}
