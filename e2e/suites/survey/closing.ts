import { dropExpectedCancellations } from "../console-support.ts";
import type { SuiteContext } from "../types.ts";

export async function sv8NoYear({ evaluate, check }: SuiteContext): Promise<void> {
  const sv8 = await evaluate<boolean>(`location.hash.includes("year=")`);
  check("SV8 the Explorer's writer never emitted year= across every path this suite drove", sv8 === false, `hash=${await evaluate<string>(`location.hash`)}`);
}

export function sv11Clean(ctx: SuiteContext, errBase: number, httpBase: number): void {
  const { check, consoleErrors, http4xx } = ctx;
  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  check(
    "SV11 the survey flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
