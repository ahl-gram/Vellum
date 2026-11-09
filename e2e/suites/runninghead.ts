// Running Head e2e (Issue #295; reshaped for the Issue #461 head cluster; cut to its sweep at Issue #1273): every shelled page and the Portfolio visited once with their scripts on, the kit's lifted shapes judged across them (RH32), the nav links' rise under a real pointer (RH31), and the sweep's console and 4xx gate (RH8); restores the Explorer base.
import { dropExpectedCancellations } from "../support/console.ts";
import { makeStep } from "../support/step.ts";
import type { SuiteContext } from "../types.ts";
import { runningHeadKit } from "./runninghead/kit.ts";
import { SHELLED } from "./runninghead/reads.ts";
import { PORTFOLIO, rh31Raise } from "./runninghead/gestures.ts";
import { kitRead, rh32Kit } from "./runninghead/room.ts";
import type { KitSample } from "./runninghead/room.ts";

export async function run(ctx: SuiteContext): Promise<void> {
  const { consoleErrors, http4xx } = ctx;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const step = makeStep(ctx);
  const k = runningHeadKit(ctx);
  const kits: Record<string, KitSample | undefined> = {};
  for (const route of [...SHELLED, PORTFOLIO]) kits[route] = (await k.visit(route)) ? await kitRead(k) : undefined;
  await step("RH32", () => Promise.resolve(ctx.check).then((check) => rh32Kit(check, kits)));
  await step("RH31", () => rh31Raise(k));
  await rh8Clean(ctx, errBase, httpBase);
}

async function rh8Clean(ctx: SuiteContext, errBase: number, httpBase: number): Promise<void> {
  const { send, check, waitReady, consoleErrors, http4xx, PORT } = ctx;
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  const restored = await waitReady();

  const errDelta = dropExpectedCancellations(consoleErrors.slice(errBase));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "RH8 the running-head sweep is clean (no console errors, no new 4xx) and the Explorer base is restored",
    errDelta.length === 0 && httpDelta.length === 0 && restored,
    [...errDelta, ...httpDelta].join(" | ") ||
      (restored ? "clean, Explorer restored" : "clean, but the Explorer did not settle"),
  );
}
