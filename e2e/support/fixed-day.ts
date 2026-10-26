import { seedForDate } from "../../src/world/seed-of-the-day.ts";
import type { SuiteContext } from "../types.ts";

// Every chart room's bare visit draws the day's seed (`seedForDate` in `src/world/seed-of-the-day.ts`), so every page the harness opens runs on this one day and a check answers the same on every date (Alex, 2026-10-05, on PR #784; Issue #785).
export const FIXED_DAY = Date.UTC(2026, 9, 5, 12);
export const FIXED_SEED = seedForDate(new Date(FIXED_DAY));

export function clockScript(day: number, override: boolean): string {
  return `(() => { const key = Symbol.for("vellum.e2e.day"), g = globalThis; if (!${override} && key in g) return; g[key] = ${day}; const Real = g.Date, shift = ${day} - Real.now(); g.Date = new Proxy(Real, { construct: (t, a) => (a.length ? new t(...a) : new t(Real.now() + shift)), apply: () => new Real(Real.now() + shift).toString(), get: (t, p) => (p === "now" ? () => Real.now() + shift : Reflect.get(t, p)) }); })()`;
}

export async function fixTheDay(send: SuiteContext["send"]): Promise<void> {
  await send("Page.addScriptToEvaluateOnNewDocument", { source: clockScript(FIXED_DAY, false) });
}

export async function onDay(ctx: Pick<SuiteContext, "send">, day: number, body: () => Promise<void>): Promise<void> {
  const clock = await ctx.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: clockScript(day, true),
  });
  try {
    await body();
  } finally {
    await ctx.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: clock.identifier }).catch(() => undefined);
  }
}
