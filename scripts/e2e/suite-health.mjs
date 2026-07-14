// Console / network health checkpoint (N1/N2) over the whole worker run.
// Split from e2e-explorer.mjs; reads the shared consoleErrors/http4xx accumulators.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- console / network health for the whole worker run ---
  check("N1 no JS exceptions or console errors", consoleErrors.length === 0, consoleErrors.join(" | ") || "clean");
  const bad4xx = http4xx.filter((u) => !/favicon/i.test(u));
  check("N2 only the benign favicon 4xx (no real missing resources)", bad4xx.length === 0, http4xx.length ? http4xx.join(", ") : "no 4xx at all");

}
