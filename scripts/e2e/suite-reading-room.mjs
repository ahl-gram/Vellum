// Reading Room e2e (RR0-RR23; #221 plus #318's colophon dice): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
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
  // The shared waitSettled keys on the Explorer's #verso-turn, which this page does not have, so the suite carries its own settle poll like the Print Room does.
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

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const rrErrBase = consoleErrors.length;
  const rrHttpBase = http4xx.length;
  check("RR0 reading-room page booted (worker hook present)", await boot());
  check("RR1 render worker active (no silent cross-directory fallback)", await evaluate(`window.__vellumReadingRoomUsesWorker() === true`));
  check("RR2 the deep-linked chart renders into the frame and settles", await settled());
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
  const rest = await evaluate(agesRead);
  check(
    "RR4 arrival is at rest at the present: armed, ages chamber, Play parked, year in the hash",
    !!rest.ages && rest.ages.chamber === "ages" && rest.panelHidden === false &&
      rest.play === "Play" && /(^|#|&)seed=42(&|$)/.test(rest.hash) && /year=\d+/.test(rest.hash),
    JSON.stringify(rest),
  );

  const journal = await evaluate(`(()=>{const rows=[...document.querySelectorAll(".rf-log-strip li")];const entries=rows.filter(r=>!r.classList.contains("annals-head"));return{rows:rows.length,entries:entries.length,inked:entries.filter(r=>r.classList.contains("inked")).length};})()`);
  check(
    "RR5 the journal is fully told at the present park (all entries inked)",
    journal.entries > 0 && journal.inked === journal.entries,
    JSON.stringify(journal),
  );

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

  const scrubbed = await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));const a=window.__vellumReadingRoomAges();return{chamber:a&&a.chamber,hash:location.hash};})()`);
  check(
    "RR8 a manual scrub to the survey half re-serializes the address on release",
    scrubbed.chamber === "survey" && /(^|#|&)survey(&|$)/.test(scrubbed.hash) && !/year=/.test(scrubbed.hash),
    JSON.stringify(scrubbed),
  );

  await shoot("reading-room.png");

  // The seedForDate oracle is sampled BEFORE the navigation and again after settle: the page freezes its seed at load, so a fresh-per-poll oracle flakes when the run crosses 00:00Z (#304's date-flake class); either sample matching is a pass.
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

  const colo = await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");if(!c)return null;const panel=document.querySelector(".rf-ages");const reading=document.querySelector(".rf-reading");return{input:!!c.querySelector("input[type=number]"),dice:!!c.querySelector(".rr-dice"),read:!!c.querySelector(".rr-read"),inPanel:panel?panel.contains(c):null,sibling:!!(panel&&c.parentElement===panel.parentElement),inReading:!!(reading&&reading.contains(c)),shown:!c.hidden&&getComputedStyle(c).display!=="none"};})()`);
  check(
    "RR16 the colophon dice sits at the journal's foot: input, dice, Read, the panel's sibling, visible",
    !!colo && colo.input && colo.dice && colo.read && colo.inPanel === false && colo.sibling && colo.inReading && colo.shown,
    JSON.stringify(colo),
  );

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
  let reInked = false;
  for (let i = 0; i < 120; i++) {
    let ok = null;
    try { ok = await evaluate(`[...document.querySelectorAll(".rf-chart #layer-land path")].every((p)=>!p.style.strokeDasharray) && !!document.querySelector(".rf-chart #layer-land path")`); } catch {}
    if (ok) { reInked = true; break; }
    await sleep(50);
  }
  check("RR17b the counter draw replays the arrival ceremony and clears its coast dasharray (no residue)", reInked);

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

  // The worker is FIFO, so the stale seed-7 settle always resolves FIRST; the hold-only form was blind (guard-prover: guard deleted, 304/304 stayed green) and sawForeign is the clause that discriminates.
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");const i=c.querySelector("input");const r=c.querySelector(".rr-read");i.value="7";r.click();i.value="42";r.click();})()`);
  let raced = null;
  let sawForeign = false;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent};})()`);
    } catch {}
    if (s && s.title && s.title !== "The Isle of Rahai") sawForeign = true;
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { raced = s; break; }
    await sleep(50);
  }
  await sleep(2000);
  const held = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,title:st.title,hash:location.hash};})()`);
  check(
    "RR20 a superseded draw can never land over a newer one: the stale settle is dropped, the latest holds",
    !!raced && !sawForeign && held.seed === 42 && held.title === "The Isle of Rahai" && /(^|#|&)seed=42(&|$)/.test(held.hash),
    JSON.stringify({ raced: !!raced, sawForeign, held }),
  );

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

  // Clicking right after boot() deterministically supersedes the boot draft (its worker round-trip is hundreds of ms); preStatus pins that the race really ran, and 1059 is seed 42's own present (the golden's year).
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=7&year=850` });
  check("RR23a the deep-linked boot draft is underway", await boot());
  const pre = await evaluate(`(()=>{const st=(document.querySelector(".rf-status")||{}).textContent;const c=document.querySelector(".rr-colophon");c.querySelector("input").value="42";c.querySelector(".rr-read").click();return{preStatus:st};})()`);
  let usurped = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumReadingRoomAges();return{seed:st.seed,title:st.title,status:(document.querySelector(".rf-status")||{}).textContent,ages:a,hash:location.hash};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 42 && s.title === "The Isle of Rahai") { usurped = s; break; }
    await sleep(50);
  }
  check(
    "RR23 a read that supersedes a deep link's boot draft parks the NEW world at ITS present, not the link's rest",
    pre.preStatus === "Drafting…" && !!usurped && !!usurped.ages &&
      usurped.ages.chamber === "ages" && usurped.ages.year === 1059 &&
      /year=1059(&|$)/.test(usurped.hash) && !/year=850/.test(usurped.hash),
    JSON.stringify({ pre, usurped }),
  );

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
  const linkAfter = seedForDate(new Date());
  const watchSeed = watch ? Number((watch.href.match(/#seed=(\d+)$/) || [])[1]) : null;
  check(
    "RR10b the Today page cross-links the room with today's seed pinned",
    !!watch && /^\.\.\/reading-room\/#seed=\d+$/.test(watch.href) && (watchSeed === linkBefore || watchSeed === linkAfter),
    JSON.stringify({ watch, linkBefore, linkAfter }),
  );

  // Device metrics go on BEFORE the navigation (the CDP-touch rule; no touch is dispatched), and the probe waits out the paperUnfurl: its keyframe fakes a sideways overflow in mid-flight geometry (the #312 screenshot rule).
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

  // #124: the room builds the same overlay the Explorer does, so it LOOKS like it should card.
  // It does not: the ages chamber is armed on every draw, so the overlay is permanently .scrub
  // and every hit is inert. Pinned because reading the call site alone says the opposite.
  const rrCard = await evaluate(`(()=>{
    const hits=[...document.querySelectorAll(".place-hit")];
    const card=document.getElementById("place-card");
    if(!hits.length||!card) return {hits:hits.length,card:!!card};
    const hit=hits[Math.floor(hits.length/2)];
    hit.focus(); hit.click();
    return {hits:hits.length,card:true,scrub:document.querySelector(".place-overlay").classList.contains("scrub"),pe:getComputedStyle(hit).pointerEvents,hidden:card.hidden};
  })()`);
  check(
    "RR11b the room's marks are scrub handles, not card hits: the place card never opens there",
    rrCard.hits > 0 && rrCard.card === true && rrCard.scrub === true && rrCard.pe === "none" && rrCard.hidden === true,
    JSON.stringify(rrCard),
  );

  const newErrs = consoleErrors.slice(rrErrBase).filter((e) => !e.includes("AbortError: Transition was skipped"));
  check("RR12 the reading-room run logged no JS exceptions or console errors", newErrs.length === 0, newErrs.join(" | ") || "clean");
  const new4xx = http4xx.slice(rrHttpBase).filter((u) => !/favicon/i.test(u));
  check("RR13 no new missing resources (no worker/asset 4xx from /reading-room/)", new4xx.length === 0, new4xx.join(", ") || "none");

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
      // The gate deliberately omits s.svg: RR15 asserts it, and requiring it here would make RR15 true by construction.
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
