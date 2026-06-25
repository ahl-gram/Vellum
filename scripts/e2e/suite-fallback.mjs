// Inline-fallback checks (A10): worker.js served 404, page degrades to inline.
// Split from e2e-explorer.mjs; flips ctx.serverState.blockWorker (same object the server reads).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- A10: inline FALLBACK path when the worker script is unavailable ---
  // Flip the server to 404 worker.js (faithfully simulating file://, a 404, or a
  // CSP block) and reload. No working-tree mutation — the file is untouched on
  // disk; only the served response changes. Restored in finally.
  try {
    await send("Network.clearBrowserCache"); // so the now-404 worker.js isn't served from cache
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await evaluate(`window.__preReload = true`); // sentinel: cleared once the fresh doc loads
    serverState.blockWorker = true;
    await send("Page.reload", { ignoreCache: true });
    // wait for the POST-reload document (sentinel gone) to become ready, so we never
    // assert against the pre-reload page that is still present during navigation
    let fresh = false;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate(`({pre:typeof window.__preReload!=="undefined",uw:typeof window.__vellumUsesWorker==="function",map:!!document.querySelector("#map svg"),status:(document.getElementById("status")||{}).textContent})`);
      } catch {}
      if (s && !s.pre && s.uw && s.map && s.status === "") { fresh = true; break; }
      await sleep(75);
    }
    check("A10a fallback: page still renders without the worker", fresh);
    check("A10b fallback: __vellumUsesWorker()===false (inline path taken)", await evaluate(`window.__vellumUsesWorker()===false`));
    await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
    await waitSettled("fallback-draw");
    await evaluate(`document.getElementById("bind").click()`);
    const fbFigs = await waitAtlas("fallback-bind");
    check("A10c fallback: inline draw + bind produce an atlas", fbFigs > 0, `${fbFigs} figures`);
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }

}
