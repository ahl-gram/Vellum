// Health checkpoint e2e (N1/N2) over the whole worker run so far; reads the shared consoleErrors/http4xx accumulators.
import { dropExpectedCancellations } from "./console-support.mjs";
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  const errs = dropExpectedCancellations(consoleErrors);
  check("N1 no JS exceptions or console errors", errs.length === 0, errs.join(" | ") || "clean");
  const bad4xx = http4xx.filter((u) => !/favicon/i.test(u));
  check("N2 only the benign favicon 4xx (no real missing resources)", bad4xx.length === 0, http4xx.length ? http4xx.join(", ") : "no 4xx at all");

}
