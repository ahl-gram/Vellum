import { seedForDate } from "../../src/world/seed-of-the-day.ts";
import type { SuiteContext } from "../types.ts";

// Every chart room's bare visit draws the day's seed (`seedForDate` in `src/world/seed-of-the-day.ts`), so a suite reading chart rooms runs on one fixed day and answers the same on every date (Alex, 2026-10-05, on PR #784).
export const FIXED_DAY = Date.UTC(2026, 9, 5, 12);
const FIXED_CLOCK = `(() => { const Real = Date, shift = ${FIXED_DAY} - Real.now(); globalThis.Date = new Proxy(Real, { construct: (t, a) => (a.length ? new t(...a) : new t(Real.now() + shift)), apply: () => new Real(Real.now() + shift).toString(), get: (t, p) => (p === "now" ? () => Real.now() + shift : Reflect.get(t, p)) }); })()`;

export const FIXED_SEED = seedForDate(new Date(FIXED_DAY));
export function clockScript(day: number, override: boolean): string {
  return `(() => [${day}, ${override}])()`;
}
export async function fixTheDay(send: SuiteContext["send"]): Promise<void> {
  await send("Page.enable");
}
export async function onDay(ctx: Pick<SuiteContext, "send">, day: number, body: () => Promise<void>): Promise<void> {
  await ctx.send("Page.addScriptToEvaluateOnNewDocument", { source: clockScript(day, true) });
  await body();
}

export async function onFixedDay(ctx: SuiteContext, body: () => Promise<void>): Promise<void> {
  const { send } = ctx;
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const clock = await send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", { source: FIXED_CLOCK });
  try {
    await body();
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: clock.identifier }).catch(() => undefined);
    await send("Emulation.setEmulatedMedia", { media: "", features: [] }).catch(() => undefined);
  }
}
