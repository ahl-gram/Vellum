// The Reading Room checks (RR0-RR15) on the /reading-room/ page (#221, the last sub
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
import { seedForDate } from "../../src/world/seed-of-the-day.ts";

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
  // RR2b: the #127 arrival ceremony really RAN and cleaned up after itself.
  // startArrival sets an inline stroke-dasharray + --draw-len on the coast path and
  // clears them on animationend; if the page loads no mount-scoped svg.arriving
  // rules, no animation ever fires and the residue persists forever (the defect the
  // adversarial review caught). Polling for the cleanup asserts both halves at once.
  let inked = false;
  for (let i = 0; i < 120; i++) {
    let ok = null;
    try { ok = await evaluate(`[...document.querySelectorAll(".rf-chart #layer-land path")].every((p)=>!p.style.strokeDasharray) && !!document.querySelector(".rf-chart #layer-land path")`); } catch {}
    if (ok) { inked = true; break; }
    await sleep(50);
  }
  check("RR2b the arrival ceremony plays and clears its inline coast dasharray (no residue)", inked);
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
  // the Print Room. The oracle is the engine's own seedForDate, sampled BEFORE the
  // navigation and again after settle: the page freezes its seed at load, so a
  // single fresh-per-poll oracle flakes when the run crosses 00:00Z between load
  // and poll (#304's date-flake class). Either sample matching is a pass.
  const todayBefore = seedForDate(new Date());
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/` });
  let bare = null;
  if (await boot()) {
    for (let i = 0; i < 160; i++) {
      let s = null;
      try {
        s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent,seed:st.seed};})()`);
      } catch {}
      if (s && s.svg && s.status === "") { bare = s; break; }
      await sleep(50);
    }
  }
  const todayAfter = seedForDate(new Date());
  check(
    "RR9 a bare visit opens today's seed-of-the-day",
    !!bare && (bare.seed === todayBefore || bare.seed === todayAfter),
    JSON.stringify({ ...bare, todayBefore, todayAfter }),
  );

  // RR16-RR21: the colophon dice (#318, Survey and Story Sub 1). The room's own way
  // to another world: a seed input, the dice, and Read at the journal's foot. They
  // run HERE, on the bare page RR9 just opened, because that is the acceptance
  // verbatim: open the room bare, finish today's story, read another world without
  // touching the URL. (Labels continue from RR15; file order is page-state order.)
  //
  // RR16: presence and the ratified placement (the 2026-08-08 comment on #318): the
  // colophon is a SIBLING of .rf-ages inside .rf-reading, never inside the panel
  // (armAges/clearAges drive panel.hidden through every teardown, so furniture
  // nested there would vanish on each counter draw), and it is visible on arrival,
  // before any gesture (open decision 2: always visible).
  const colo = await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");if(!c)return null;const panel=document.querySelector(".rf-ages");const reading=document.querySelector(".rf-reading");return{input:!!c.querySelector("input[type=number]"),dice:!!c.querySelector(".rr-dice"),read:!!c.querySelector(".rr-read"),inPanel:panel?panel.contains(c):null,sibling:!!(panel&&c.parentElement===panel.parentElement),inReading:!!(reading&&reading.contains(c)),shown:!c.hidden&&getComputedStyle(c).display!=="none"};})()`);
  check(
    "RR16 the colophon dice sits at the journal's foot: input, dice, Read, the panel's sibling, visible",
    !!colo && colo.input && colo.dice && colo.read && colo.inPanel === false && colo.sibling && colo.inReading && colo.shown,
    JSON.stringify(colo),
  );

  // RR17: read seed 42 by the counter alone. The click starts the draw SYNCHRONOUSLY
  // (status goes "Drafting…" inside the handler), so polling for "" afterward cannot
  // race a not-yet-started draw. Identity via the state hook: the golden seed 42
  // title is the witness that the typed number reached the engine.
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();})()`);
  let counter = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,svg:!!document.querySelector(".rf-chart svg")};})()`);
    } catch {}
    if (s && s.svg && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { counter = s; break; }
    await sleep(50);
  }
  check("RR17 Read draws the typed world (seed 42 == 'The Isle of Rahai') without touching the URL", !!counter, JSON.stringify(counter));
  // RR17b: the arrival ceremony replays on the NEW chart and cleans up after itself
  // (RR2b's assertion re-run on the redraw path: the second startArrival must scope
  // to the just-landed svg, the #318 pickup note).
  let reInked = false;
  for (let i = 0; i < 120; i++) {
    let ok = null;
    try { ok = await evaluate(`[...document.querySelectorAll(".rf-chart #layer-land path")].every((p)=>!p.style.strokeDasharray) && !!document.querySelector(".rf-chart #layer-land path")`); } catch {}
    if (ok) { reInked = true; break; }
    await sleep(50);
  }
  check("RR17b the counter draw replays the arrival ceremony and clears its coast dasharray (no residue)", reInked);

  // RR18/RR19: the counter draw lands at the ratified rest. The address
  // re-serializes to the new world (seed=42 plus the present park's year, the #221
  // arrival ratification: pendingLive stays boot-only, so a counter draw parks at
  // the present), the instrument is armed and parked, and the new story arrives
  // fully told, ready for the NEXT read at its foot.
  const after = await evaluate(`(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");const rows=[...document.querySelectorAll(".rf-log-strip li")];const entries=rows.filter(r=>!r.classList.contains("annals-head"));return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash,entries:entries.length,inked:entries.filter(r=>r.classList.contains("inked")).length};})()`);
  check(
    "RR18 the counter draw re-serializes the address to the new world's present park (seed=42, year=N)",
    !!after.ages && after.ages.chamber === "ages" && after.play === "Play" && after.panelHidden === false &&
      /(^|#|&)seed=42(&|$)/.test(after.hash) && /year=\d+/.test(after.hash),
    JSON.stringify(after),
  );
  check(
    "RR19 the counter draw arrives at rest with the new story fully told (all entries inked)",
    after.entries > 0 && after.inked === after.entries,
    JSON.stringify({ entries: after.entries, inked: after.inked }),
  );

  // RR20: drawGen supersession. Two reads in one breath; the FIRST must never land
  // over the second. The worker resolves the stale seed-7 job too (usually first, it
  // was posted first), so after settling on 42 the page must HOLD 42: a stale settle
  // slipping through would swap the world after the fact.
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");const i=c.querySelector("input");const r=c.querySelector(".rr-read");i.value="7";r.click();i.value="42";r.click();})()`);
  let raced = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { raced = s; break; }
    await sleep(50);
  }
  await sleep(2000);
  const held = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,hash:location.hash};})()`);
  check(
    "RR20 a superseded draw can never land over a newer one: the rapid double-read settles on the latest and holds",
    !!raced && held.seed === 42 && held.title === "The Isle of Rahai" && /(^|#|&)seed=42(&|$)/.test(held.hash),
    JSON.stringify({ raced: !!raced, held }),
  );

  // RR21: the dice reads a fresh world. The roll is random, so the assertion is
  // CONSISTENCY, not identity: the input, the drawn world, and the address all agree
  // on the same number at the settle (readSeed sets the module seed synchronously,
  // so the gate keys on status returning "" plus the seed leaving 42).
  await evaluate(`document.querySelector(".rr-dice").click()`);
  let rolled = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();const v=document.querySelector(".rr-colophon input").value;return{seed:st.seed,input:v,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,hash:location.hash};})()`);
    } catch {}
    if (s && s.status === "" && s.seed !== 42 && String(s.seed) === s.input) { rolled = s; break; }
    await sleep(50);
  }
  check(
    "RR21 the dice rolls a fresh world and the input, the drawn world, and the address agree",
    !!rolled && !!rolled.title && new RegExp(`(^|#|&)seed=${rolled.seed}(&|$)`).test(rolled.hash),
    JSON.stringify(rolled),
  );
  // RR22: a read MID-PLAY. The one path where the counter interrupts a running
  // sweep: draw() cancels the rafs synchronously (the Explorer's teardown order)
  // and the settle re-arms over the still-armed instrument. The new world must land
  // exactly like any other counter draw: parked at the present, fully told, Play's
  // label back at rest. (RR12's suite-scoped console-error delta would catch a raf
  // ticking over the dead world's DOM.)
  await evaluate(`(()=>{document.querySelector(".rf-play").click();})()`);
  await sleep(350);
  const midPlay = await evaluate(`(()=>{const p=document.querySelector(".rf-play");return{label:p.textContent};})()`);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();})()`);
  let interrupted = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const rows=[...document.querySelectorAll(".rf-log-strip li")].filter(r=>!r.classList.contains("annals-head"));return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,chamber:a&&a.chamber,play:p.textContent,entries:rows.length,inked:rows.filter(r=>r.classList.contains("inked")).length};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai" && s.play === "Play") { interrupted = s; break; }
    await sleep(50);
  }
  check(
    "RR22 a read mid-play interrupts the sweep and still lands parked at the present, fully told",
    midPlay.label === "Pause" && !!interrupted && interrupted.chamber === "ages" &&
      interrupted.entries > 0 && interrupted.inked === interrupted.entries,
    JSON.stringify({ midPlay, interrupted }),
  );
  await shoot("reading-room-colophon.png");

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
  const linkBefore = seedForDate(new Date());
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/seed-of-the-day/` });
  let watch = null;
  for (let i = 0; i < 160; i++) {
    try { watch = await evaluate(`(()=>{const a=document.getElementById("watch");return a&&/#seed=\\d+/.test(a.getAttribute("href"))?{href:a.getAttribute("href")}:null;})()`); } catch {}
    if (watch) break;
    await sleep(50);
  }
  // The href must carry TODAY's seed, not just any digits (a stale or zero seed
  // would pass a shape-only regex); the before/after pair rides out 00:00Z.
  const linkAfter = seedForDate(new Date());
  const watchSeed = watch ? Number((watch.href.match(/#seed=(\d+)$/) || [])[1]) : null;
  check(
    "RR10b the Today page cross-links the room with today's seed pinned",
    !!watch && /^\.\.\/reading-room\/#seed=\d+$/.test(watch.href) && (watchSeed === linkBefore || watchSeed === linkAfter),
    JSON.stringify({ watch, linkBefore, linkAfter }),
  );

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
      // The gate deliberately omits s.svg: RR15 asserts it, and a gate that already
      // required it would make RR15 true by construction whenever fb is non-null.
      if (s && s.uw === false && s.status === "") { fb = s; break; }
      await sleep(75);
    }
    check("RR14 inline fallback: worker blocked -> inline path taken and #rr-warning shown", !!fb && fb.uw === false && fb.warn === true, JSON.stringify(fb));
    check("RR15 inline fallback: the chart still renders on the main thread", !!fb && fb.svg === true, JSON.stringify(fb));
  } finally {
    serverState.blockWorker = false;
    try { await send("Network.setCacheDisabled", { cacheDisabled: false }); } catch {}
  }
}
