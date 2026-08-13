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

export const SMOKE_SUITES: readonly E2eSuiteName[] = [
  "render",
  "health",
  "fallback",
  "hunt",
  "print-room",
  "home",
  "room-address",
];

export type E2eTier = "full" | "smoke" | "custom";

export interface E2eSelection {
  readonly names: readonly E2eSuiteName[];
  readonly tier: E2eTier;
}

export interface E2eSuiteEnv {
  readonly [key: string]: string | undefined;
}

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
  return { names: canonicalise(new Set(requested)), tier: "custom" };
}

export function suitesCertifiedByHealth(names: readonly E2eSuiteName[]): readonly E2eSuiteName[] {
  const at = names.indexOf("health");
  return at === -1 ? [] : names.slice(0, at);
}
