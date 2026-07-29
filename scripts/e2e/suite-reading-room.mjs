// The Reading Room checks (RR0-RR13) on the /reading-room/ page (#221, the last sub
// of epic #190). The destination page: the reading frame (#219) driving the fused
// ages instrument (#220), a world taken from the hash, drawn once through the SHARED
// worker. There is deliberately NO Explorer entry point to follow (decision 3,
// ratified 2026-07-29 on #221: the room is the only watch surface), so unlike the
// Print Room's PRL handoff these checks navigate with CONSTRUCTED hashes carrying
// the same vocabulary the Explorer writes: the recipe keys plus #192's live address
// (bare `survey` / `year=N`).
//
// Self-contained like the hunt, Print Room and home suites: it navigates to its own
// page and carries its own scoped no-4xx + console-error delta. Arrival is AT REST
// on every path (the #221 ratification): these checks assert the instrument lands
// parked, never mid-play.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, serverState, consoleErrors, http4xx, PORT } = ctx;

  const boot = async () => {
    for (let i = 0; i < 200; i++) {
      let ok = null;
      try { ok = await evaluate(`typeof window.__vellumReadingRoomUsesWorker === "function"`); } catch {}
      if (ok) return true;
      await sleep(75);
    }
    return false;
  };
  // The room's settle: the chart svg landed in the frame's mount and the status line
  // returned to "" (the engine's settle-signal contract; overlays never write it
  // mid-draw). The shared waitSettled keys on the Explorer's #verso-turn, which this
  // page does not have, so the suite carries its own poll like the Print Room does.
  const settled = async () => {
    for (let i = 0; i < 200; i++) {
      let s = null;
      try { s = await evaluate(`({svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent})`); } catch {}
      if (s && s.svg && s.status === "") return true;
      await sleep(50);
    }
    return false;
  };
  const agesRead = `(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash};})()`;

  // RR0-RR4: a recipe deep link (seed 42, the golden hero) opens at rest at the present.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const rrErrBase = consoleErrors.length;
  const rrHttpBase = http4xx.length;
  check("RR0 reading-room page booted (worker hook present)", await boot());
  check("RR1 render worker active (no silent cross-directory fallback)", await evaluate(`window.__vellumReadingRoomUsesWorker() === true`));
  check("RR2 the deep-linked chart renders into the frame and settles", await settled());
  const st = await evaluate(`(()=>{const s=window.__vellumReadingRoomState();return{seed:s.seed,title:s.title};})()`);
  check("RR3 the world is the deep-linked one (seed 42 == 'The Isle of Rahai')", st.seed === 42 && st.title === "The Isle of Rahai", JSON.stringify(st));
  // At-rest arrival, the ratified default: the instrument is armed (panel shown),
  // parked at the PRESENT (ages chamber), not playing, and the address converged so
  // the page's own URL is already the shareable photograph of this rest.
  const rest = await evaluate(agesRead);
  check(
    "RR4 arrival is at rest at the present: armed, ages chamber, Play parked, year in the hash",
    !!rest.ages && rest.ages.chamber === "ages" && rest.panelHidden === false &&
      rest.play === "Play" && /(^|#|&)seed=42(&|$)/.test(rest.hash) && /year=\d+/.test(rest.hash),
    JSON.stringify(rest),
  );

  // RR5: the journal is fully told at the present park (every non-furniture row
  // inked; li.annals-head is furniture and never inks, the #312 rule).
  const journal = await evaluate(`(()=>{const rows=[...document.querySelectorAll(".rf-log-strip li")];const entries=rows.filter(r=>!r.classList.contains("annals-head"));return{rows:rows.length,entries:entries.length,inked:entries.filter(r=>r.classList.contains("inked")).length};})()`);
  check(
    "RR5 the journal is fully told at the present park (all entries inked)",
    journal.entries > 0 && journal.inked === journal.entries,
    JSON.stringify(journal),
  );

  // RR6: the bare `survey` address parks the voyage at rest on its completed track.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&survey` });
  check("RR6a the survey address boots and settles", (await boot()) && (await settled()));
  const survey = await evaluate(agesRead);
  check(
    "RR6 bare `survey` lands at rest in the survey chamber, and the flag round-trips bare",
    !!survey.ages && survey.ages.chamber === "survey" && survey.play === "Play" &&
      /(^|#|&)survey(&|$)/.test(survey.hash) && !/survey=/.test(survey.hash),
    JSON.stringify(survey),
  );

  // RR7: the `year=N` address parks the ages chamber at that year.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&year=650` });
  check("RR7a the year address boots and settles", (await boot()) && (await settled()));
  const year = await evaluate(agesRead);
  check(
    "RR7 year=650 lands at rest in the ages chamber at 650, round-tripped into the hash",
    !!year.ages && year.ages.chamber === "ages" && year.ages.year === 650 &&
      year.play === "Play" && /year=650(&|$)/.test(year.hash),
    JSON.stringify(year),
  );

  // RR8: a state change re-serializes the address. Drive the bar to its survey end
  // programmatically (input moves the instrument, change is the release the writer
  // keys on, the controls.ts contract); the hash must trade year= for the bare flag.
  const scrubbed = await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));const a=window.__vellumReadingRoomAges();return{chamber:a&&a.chamber,hash:location.hash};})()`);
  check(
    "RR8 a manual scrub to the survey half re-serializes the address on release",
    scrubbed.chamber === "survey" && /(^|#|&)survey(&|$)/.test(scrubbed.hash) && !/year=/.test(scrubbed.hash),
    JSON.stringify(scrubbed),
  );

  await shoot("reading-room.png");

  // RR9: a bare visit lands on today's seed-of-the-day (UTC), like the Explorer and
  // the Print Room. The oracle is the engine's own seedForDate, imported in-browser.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/` });
  let bare = null;
  if (await boot()) {
    for (let i = 0; i < 160; i++) {
      let s = null;
      try {
        s = await evaluate(`(async()=>{const {seedForDate}=await import("/explorer/engine/world/seed-of-the-day.js");const st=window.__vellumReadingRoomState();return{svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent,seed:st.seed,expected:seedForDate(new Date())};})()`, true);
      } catch {}
      if (s && s.svg && s.status === "") { bare = s; break; }
      await sleep(50);
    }
  }
  check("RR9 a bare visit opens today's seed-of-the-day", !!bare && bare.seed === bare.expected, JSON.stringify(bare));

  // RR10: the ways in. The home card (Watch one) and the Today cross-link, which
  // carries the seed explicitly so it survives a UTC midnight rollover.
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  let card = null;
  for (let i = 0; i < 120; i++) {
    try { card = await evaluate(`(()=>{const a=document.querySelector('a.card[href="reading-room/"]');if(!a)return null;const v=a.querySelector(".card-verb");return{verb:v?v.textContent:null};})()`); } catch {}
    if (card) break;
    await sleep(50);
  }
  check("RR10a the home Go Deeper card invites Watch one into the room", !!card && card.verb === "Watch one", JSON.stringify(card));
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/seed-of-the-day/` });
  let watch = null;
  for (let i = 0; i < 160; i++) {
    try { watch = await evaluate(`(()=>{const a=document.getElementById("watch");return a&&/#seed=\\d+/.test(a.getAttribute("href"))?{href:a.getAttribute("href")}:null;})()`); } catch {}
    if (watch) break;
    await sleep(50);
  }
  check("RR10b the Today page cross-links the room with today's seed pinned", !!watch && /^\.\.\/reading-room\/#seed=\d+$/.test(watch.href), JSON.stringify(watch));

  // RR11: mobile is the clean vertical chart-over-log story, no sideways scroll-trap.
  // Device metrics go on BEFORE the navigation (the CDP-touch rule; no touch is
  // dispatched here), and the probe waits out the paperUnfurl (its keyframe fakes a
  // sideways overflow in mid-flight geometry, the #312 screenshot rule).
  await ctx.setMobileViewport(390, 844);
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const mobileSettled = (await boot()) && (await settled());
  await sleep(1600);
  const mobile = await evaluate(`({w:document.body.scrollWidth,vw:window.innerWidth})`);
  await shoot("reading-room-390.png");
  await ctx.clearMobile();
  check(
    "RR11 at 390px the room lays out with no sideways scroll (chart over log, one page scroll)",
    mobileSettled && mobile.w === 390,
    JSON.stringify(mobile),
  );

  // Scoped health, checked BEFORE the deliberate worker 404 below.
  const newErrs = consoleErrors.slice(rrErrBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  check("RR12 the reading-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(rrHttpBase).filter((u) => !/favicon/i.test(u));
  check("RR13 no new missing resources (no worker/asset 4xx from /reading-room/)", new4xx.length === 0, new4xx.join(", ") || "none");

  // RR14/RR15: the inline-fallback path. blockWorker 404s exactly the shared
  // /explorer/worker.bundle.js this page spawns; the room must degrade to the inline
  // engine, show #rr-warning, and still tell the story. Restored in finally.
  try {
    await send("Network.clearBrowserCache");
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    serverState.blockWorker = true;
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
    let fb = null;
    for (let i = 0; i < 220; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const uw=typeof window.__vellumReadingRoomUsesWorker==="function"?window.__vellumReadingRoomUsesWorker():null;const w=document.getElementById("rr-warning");return{uw,warn:!!(w&&!w.hidden),svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent};})()`);
      } catch {}
      if (s && s.uw === false && s.svg && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("RR14 inline fallback: worker blocked -> inline path taken and #rr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("RR15 inline fallback: the chart still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }
}
