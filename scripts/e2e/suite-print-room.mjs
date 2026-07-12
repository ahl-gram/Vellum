// The Print Room checks (PRL, PR0-PR9) on the /print-room/ page (#133, epic #132).
// A sixth hand-authored page that reuses the Explorer's render worker from a DIFFERENT
// directory, so the checks below are the tripwire for the cross-directory worker-spawn
// trap: `new Worker("./worker.js")` would resolve against /print-room/ and 404 into a
// silent inline fallback. PR1 (worker active) and PR7 (no new 4xx) catch exactly that.
//
// Self-contained like the Daily Hunt suite: it navigates to its own page after the
// health checkpoint and carries its OWN scoped no-4xx + console-error delta, which is
// strictly stronger than N2's snapshot (which runs before this page ever loads).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, serverState, consoleErrors, http4xx, PORT } = ctx;

  // First prove the REAL handoff: the Explorer's "Take to the Print Room" link must
  // carry the world currently on screen. Load a known world (seed 42, the hero) in the
  // Explorer, then read its order-plates href.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#seed=42&style=antique&legend=1` });
  let exReady = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumUsesWorker==="function" && !!document.querySelector("#map svg") && document.getElementById("status").textContent===""`); } catch {}
    if (ok) { exReady = true; break; }
    await sleep(75);
  }
  const orderHref = exReady ? await evaluate(`(()=>{const a=document.getElementById("order-plates");return a?a.getAttribute("href"):null;})()`) : null;
  check(
    "PRL Explorer 'Take to the Print Room' link carries the world on screen",
    !!orderHref && /^\.\.\/print-room\/#/.test(orderHref) && /seed=42/.test(orderHref),
    String(orderHref),
  );

  // Follow that real deep-link into the Print Room (the relative href resolves against
  // /explorer/, so its hash is what matters). Fall back to a constructed hash only if
  // the link was somehow absent, so the rest of the suite still runs.
  const hashPart = orderHref && orderHref.includes("#") ? orderHref.slice(orderHref.indexOf("#")) : "#seed=42&style=antique&legend=1";
  const PR_PAGE = `http://127.0.0.1:${PORT}/print-room/${hashPart}`;
  await send("Page.navigate", { url: PR_PAGE });

  // Scope the health deltas to the Print Room page only: capture AFTER the navigation
  // above so the Explorer/seed-of-the-day loads before it are not charged to PR6/PR7.
  // The worker + engine + asset requests for THIS load fire after navigate() resolves,
  // so they are still inside the window (a /print-room/worker.js 404 still trips PR7).
  const prErrBase = consoleErrors.length;
  const prHttpBase = http4xx.length;

  // Wait for bootstrap: the worker hook exists once initWorker + the first draw kicked
  // off. evaluate may land in a context destroyed by the in-flight navigation, so
  // swallow-and-retry (same defensive pattern as the hunt suite).
  let booted = false;
  for (let i = 0; i < 200; i++) {
    let ok = null;
    try { ok = await evaluate(`typeof window.__vellumPrintRoomUsesWorker === "function"`); } catch {}
    if (ok) { booted = true; break; }
    await sleep(75);
  }
  check("PR0 print-room page booted (worker hook present)", booted);
  check("PR1 print-room render worker active (no silent cross-directory fallback)", await evaluate(`window.__vellumPrintRoomUsesWorker() === true`));

  // Wait for the deep-linked proof to render off-thread. Bounded so a regressed build
  // (no preview) reds in a few seconds rather than hanging the run.
  let previewed = false;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent})`); } catch {}
    if (s && s.svg && s.status === "") { previewed = true; break; }
    await sleep(50);
  }
  check("PR2 deep-link renders a proof into the preview (off-thread)", previewed);

  // The proof is the deep-linked WORLD, not a default: seed 42 renders its golden title
  // "The Isle of Rahai" (pinned by test/world/golden-seed42.test.ts and the R4 committed
  // chart), so asserting the exact title is a real identity witness, not just "a render
  // happened for input 42".
  const st = await evaluate(`(()=>{const s=window.__vellumPrintRoomState();return{seed:s.seed,title:s.title,svg:!!document.querySelector("#pr-preview svg")};})()`);
  check(
    "PR3 the proof is the deep-linked world (seed 42 == 'The Isle of Rahai')",
    st.svg && st.seed === 42 && st.title === "The Isle of Rahai",
    JSON.stringify(st),
  );

  // Manual seed entry: type a different seed, pull a proof, expect a fresh chart for it.
  await evaluate(`(()=>{const s=document.getElementById("pr-seed");s.value="100";document.getElementById("pr-draw").click();})()`);
  let manual = null;
  for (let i = 0; i < 120; i++) {
    let s = null;
    try { s = await evaluate(`(()=>{const st=window.__vellumPrintRoomState();return{seed:st.seed,title:st.title,svg:!!document.querySelector("#pr-preview svg"),status:document.getElementById("pr-status").textContent};})()`); } catch {}
    if (s && s.svg && s.status === "" && s.seed === 100) { manual = s; break; }
    await sleep(50);
  }
  check("PR4 manual seed entry pulls a fresh proof", !!manual && manual.seed === 100 && manual.title !== st.title, JSON.stringify(manual));

  // The Print Room writes the world back into its own hash in the Explorer's format,
  // so a Print Room link round-trips into either page.
  const hash = await evaluate(`location.hash`);
  check("PR5 a manual draw round-trips the world into the hash", /(^|&|#)seed=100(&|$)/.test(hash) && /style=antique/.test(hash), hash);

  // PRC: the carried params with no visible control (type/band/theme/legend/arms/land)
  // must survive the deep-link -> applyHash -> draw -> writeHash carry-through at
  // NON-default values, or a dropped/mis-validated param would ship undetected (PRL's
  // handoff only ever carries defaults, since the Explorer omits empty selects).
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&type=archipelago&band=tropical&theme=vegetation&arms=1&legend=0&land=350` });
  let carried = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try { s = await evaluate(`({svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,hash:location.hash})`); } catch {}
    if (s && s.svg && s.status === "") { carried = s; break; }
    await sleep(50);
  }
  const carriedOk =
    !!carried &&
    /type=archipelago/.test(carried.hash) && /band=tropical/.test(carried.hash) &&
    /theme=vegetation/.test(carried.hash) && /arms=1/.test(carried.hash) &&
    /legend=0/.test(carried.hash) && /land=350/.test(carried.hash) && /seed=42/.test(carried.hash);
  check("PRC carried params (type/band/theme/legend/arms/land) round-trip at non-defaults", carriedOk, carried ? carried.hash : "no preview");

  // PRB: a bare visit (no seed in the hash) lands on today's seed-of-the-day (UTC),
  // matching the Explorer (R0b) and the Today page. about:blank first so the hash truly
  // clears (a same-document hash removal would not re-bootstrap the page).
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/` });
  let bare = null;
  for (let i = 0; i < 160; i++) {
    let s = null;
    try {
      s = await evaluate(`(async()=>{const {seedForDate}=await import("/explorer/engine/world/seed-of-the-day.js");return{svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent,seed:document.getElementById("pr-seed").value,expected:String(seedForDate(new Date()))};})()`, true);
    } catch {}
    if (s && s.svg && s.status === "") { bare = s; break; }
    await sleep(50);
  }
  check("PRB bare Print Room visit lands on today's seed-of-the-day", !!bare && bare.seed === bare.expected, JSON.stringify(bare));

  await shoot("print-room.png");

  // Scoped health: no new console errors and no new (non-favicon) 4xx from this page,
  // its worker, its engine, or its root-absolute assets. Checked BEFORE the inline-
  // fallback test below, which deliberately 404s the worker.
  const newErrs = consoleErrors.slice(prErrBase);
  check("PR6 the print-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(prHttpBase).filter((u) => !/favicon/i.test(u));
  check("PR7 no new missing resources (no worker/engine/asset 4xx from /print-room/)", new4xx.length === 0, new4xx.join(", ") || "none");

  // PR8/PR9: the inline-fallback path (a named #133 acceptance bullet). 404 the worker
  // (blockWorker 404s exactly the /explorer/worker.js the Print Room spawns) and reload:
  // the page must degrade to the inline engine, SHOW the #pr-warning, and still render.
  // Mirrors the Explorer's B1-B3 for this page's separate markup. Restored in finally.
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    // Full document load: the browser is already on /print-room/ (from PRC), so a
    // navigate that differs only in the hash would be a same-document change and never
    // re-bootstrap the worker. about:blank forces a real reload of the page.
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/#seed=42&style=antique&legend=1` });
    let fb = null;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const uw=typeof window.__vellumPrintRoomUsesWorker==="function"?window.__vellumPrintRoomUsesWorker():null;const w=document.getElementById("pr-warning");return{uw,warn:!!(w&&!w.hidden),svg:!!document.querySelector("#pr-preview svg"),status:(document.getElementById("pr-status")||{}).textContent};})()`);
      } catch {}
      if (s && s.uw === false && s.svg && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("PR8 inline fallback: worker blocked -> inline path taken and #pr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("PR9 inline fallback: the proof still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }
}
