/**
 * What a browser-driven runner should do when `findBrowser()` comes back null.
 *
 * Split out of `scripts/e2e-explorer.mjs` so the decision is unit-testable: the
 * runner itself can only express it as `process.exit`, which a test cannot read.
 */

export type BrowserlessAction = "fail" | "skip";

export interface BrowserPolicyEnv {
  readonly [key: string]: string | undefined;
}

// process.env gives "" for `FOO=`, which must not read as "set".
function isSet(value: string | undefined): boolean {
  return value !== undefined && value !== "";
}

/**
 * Order is load-bearing. VELLUM_REQUIRE_BROWSER is tested BEFORE the opt-out so
 * that contradictory flags resolve to "fail": with a missing browser the quiet
 * outcome is the dangerous one, because a skip is indistinguishable from a pass
 * in any log a human is not watching.
 *
 * The default flips on interactivity rather than on a CI variable alone. A
 * browserless laptop running this by hand still skips and stays green (the
 * original intent), while anything unattended (CI, a cron run, a cloud agent,
 * or an ordinary pipe into a log) fails loud instead of reporting a green run
 * that exercised nothing.
 */
export function browserlessAction(env: BrowserPolicyEnv, isInteractive: boolean): BrowserlessAction {
  if (isSet(env["VELLUM_REQUIRE_BROWSER"])) return "fail";
  if (isSet(env["VELLUM_ALLOW_NO_BROWSER"])) return "skip";
  if (isSet(env["CI"])) return "fail";
  return isInteractive ? "skip" : "fail";
}
