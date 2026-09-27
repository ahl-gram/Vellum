import { dropExpectedCancellations } from "../console-support.ts";
import type { SuiteContext } from "../types.ts";
import type { SurveyKit } from "./kit.ts";

export async function sv9NoSeams({ evaluate, check, goto }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-seams");
  const sv9 = await evaluate<{ stepTo: string; paintAt: string; plan: string; log: string; geom: string; ages: string; inline: string }>(`({
      stepTo:typeof window.__vellumVoyageStepTo,paintAt:typeof window.__vellumVoyagePaintAt,
      plan:typeof window.__vellumVoyagePlan,log:typeof window.__vellumVoyageLog,
      geom:typeof window.__vellumVoyageLegGeometry,ages:typeof window.__vellumAgesState,
      inline:typeof window.__vellumRunInline})`);
  check(
    "SV9 the Explorer publishes no time seams (voyage/ages hooks gone; the runInline oracle stays)",
    sv9.stepTo === "undefined" && sv9.paintAt === "undefined" && sv9.plan === "undefined" &&
      sv9.log === "undefined" && sv9.geom === "undefined" && sv9.ages === "undefined" && sv9.inline === "function",
    JSON.stringify(sv9),
  );
}

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
