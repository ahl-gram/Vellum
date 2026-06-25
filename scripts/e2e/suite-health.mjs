// Console / network health checkpoint (A9a/A9b) over the whole worker run.
// Split from e2e-explorer.mjs; reads the shared consoleErrors/http4xx accumulators.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- console / network health for the whole worker run ---
  check("A9a no JS exceptions or console errors", consoleErrors.length === 0, consoleErrors.join(" | ") || "clean");
  const bad4xx = http4xx.filter((u) => !/favicon/i.test(u));
  check("A9b only the benign favicon 4xx (no real missing resources)", bad4xx.length === 0, http4xx.length ? http4xx.join(", ") : "no 4xx at all");

}
