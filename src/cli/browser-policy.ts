export type BrowserlessAction = "fail" | "skip";

export interface BrowserPolicyEnv {
  readonly [key: string]: string | undefined;
}

function isSet(value: string | undefined): boolean {
  return value !== undefined && value !== "";
}

export function browserlessAction(env: BrowserPolicyEnv, isInteractive: boolean): BrowserlessAction {
  if (isSet(env["VELLUM_REQUIRE_BROWSER"])) return "fail";
  if (isSet(env["VELLUM_ALLOW_NO_BROWSER"])) return "skip";
  if (isSet(env["CI"])) return "fail";
  return isInteractive ? "skip" : "fail";
}
