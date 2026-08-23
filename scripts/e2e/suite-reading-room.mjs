// Reading Room e2e (RR0-RR34; #221 plus #318 colophon dice, #418 pre-arm window, #402 prospect stage and #442 the sticky strip): self-contained (navigates itself, scoped no-4xx and console-error delta); there is deliberately NO Explorer entry point (decision 3 on #221), so checks navigate with constructed hashes, and arrival is AT REST on every path.
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
    for (let i = 0; i < 300; i++) {
      let s = null;
      try { s = await evaluate(`({svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent})`); } catch {}
      if (s && s.svg && s.status === "") return true;
      await sleep(50);
    }
    return false;
  };
  const agesRead = `(()=>{const a=window.__vellumReadingRoomAges();const p=document.querySelector(".rf-play");const panel=document.querySelector(".rf-ages");return{ages:a,play:p?p.textContent:null,panelHidden:panel?panel.hidden:null,hash:location.hash};})()`;
  // #402 the prospect stage: href read raw (getAttribute), src as the browser's absolute blob URL. Placement ruled 2026-08-22: inside the panel, below the sticky strip (#442 wrapped the bar in one), above the journal.
  const stageRead = `(()=>{const f=document.querySelector(".rr-prospect");if(!f)return null;const img=f.querySelector("img");const a=f.querySelector("a");const panel=document.querySelector(".rf-ages");const prev=f.previousElementSibling;const next=f.nextElementSibling;return{hidden:f.hidden,src:img?String(img.src||""):null,alt:img?img.alt:null,href:a?a.getAttribute("href"):null,belowBar:!!(panel&&panel.contains(f)&&prev&&prev.classList.contains("rf-instrument-strip")&&next&&next.classList.contains("rf-log"))};})()`;
  const plateShown = async (hrefTail) => {
    for (let i = 0; i < 160; i++) {
      let s = null;
      try { s = await evaluate(stageRead); } catch {}
      if (s && s.hidden === false && s.src && s.src.startsWith("blob:") && (!hrefTail || (s.href || "").endsWith(hrefTail))) return s;
      await sleep(50);
    }
    return null;
  };
  // #442 the NEGATIVE half of the arrival rule, and it needs its own dwell: a test that
  // only waits for a plate to appear cannot see one appearing when it should not, so this
  // holds for the same window plateShown polls and fails on the first frame it is shown.
  const plateStaysHidden = async (ms = 2500) => {
    for (let i = 0; i < ms / 50; i++) {
      let s = null;
      try { s = await evaluate(stageRead); } catch {}
      if (s && (s.hidden === false || (s.src || "").startsWith("blob:"))) return s;
      await sleep(50);
    }
    return null;
  };
  // #442 the sticky strip and the live row it carries.
  const stripRead = `(()=>{const s=document.querySelector(".rf-instrument-strip");const t=document.querySelector(".rf-told");if(!s||!t)return null;const cs=getComputedStyle(s);const r=s.getBoundingClientRect();return{position:cs.position,top:Math.round(r.top),h:s.offsetHeight,toldHidden:t.hidden,toldDisplay:getComputedStyle(t).display,gutter:(t.querySelector(".cr-year")||{}).textContent,text:(t.querySelector(".cr-text")||{}).textContent};})()`;

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

  // Seed 42's beats, measured 2026-08-22: foundings 451/552/597 (i=0/4/6), twin ruins 1039 (i=19/22; the LAST told holds the stage, ruled 2026-08-22), present 1059.
  // #442 reverses what #402 shipped here: this hash carries no live key, so it is a PLAIN
  // visit, and a plain visit opens with no plate at all. RR29 below shows Play bringing one.
  const noPlate = await plateStaysHidden();
  check(
    "RR26 a plain visit opens BARE: no plate until the reader asks for one (#442)",
    noPlate === null,
    noPlate === null ? "stayed hidden" : JSON.stringify(noPlate),
  );

  // #442 the live row: the strip carries the entry the story is on, in the chronicle half here.
  const strip = await evaluate(stripRead);
  const lastAnnal = await evaluate(`(()=>{const rows=[...document.querySelectorAll(".rf-log-strip li")].filter(r=>!r.classList.contains("annals-head")&&r.classList.contains("inked"));const li=rows[rows.length-1];return li?{year:li.querySelector(".cr-year").textContent,text:li.querySelector(".cr-text").textContent}:null;})()`);
  check(
    "RR30 the sticky strip carries the annal being told, mirroring the journal's own row (#442)",
    !!strip && strip.position === "sticky" && strip.toldHidden === false &&
      !!lastAnnal && strip.gutter === lastAnnal.year && strip.text === lastAnnal.text,
    JSON.stringify({ strip, lastAnnal }),
  );

  // The harness window is 1280x2400 (harness.mjs), and at 2400 tall this page has only a
  // few hundred px of scroll, so the strip could never reach the top there and the check
  // would pass or fail for the wrong reason. #442's governing viewport is 1440x900, so
  // this one override says so out loud. mobile:false: this is a desktop reading, and
  // mobile:true changes layout semantics as well as size.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  const deskRest = await evaluate(stripRead);
  const room = await evaluate(`(()=>{const s=document.querySelector(".rf-chart svg[data-vellum-style]");const r=s?s.getBoundingClientRect():{width:0,height:0};return{page:document.documentElement.scrollHeight,vh:window.innerHeight,chartW:Math.round(r.width),chartH:Math.round(r.height),ratio:r.width?r.height/r.width:0,col:Math.round(document.querySelector(".rf").getBoundingClientRect().width)};})()`);
  await evaluate(`(()=>{window.scrollTo(0,document.documentElement.scrollHeight);return null;})()`);
  await sleep(200);
  const afterScroll = await evaluate(stripRead);
  check(
    "RR31 at 1440x900, scrolled past, the strip RIDES the viewport top rather than leaving with the chart (#442)",
    !!afterScroll && afterScroll.top === 0 && afterScroll.position === "sticky" &&
      !!room && room.page > room.vh,
    JSON.stringify({ rest: deskRest, stuck: afterScroll, room }),
  );
  // #442: the strip is what the reader gives up to keep the scrubber and the told row on
  // screen, so its height is pinned against measured constants, never a relative read.
  // Measured 2026-08-23 (plate-reader, seed 42, worst-case row in BOTH halves): 1440 -> 100,
  // 900 -> 100 chronicle / 126 survey, 768 -> 126, 700 -> 126, then the live row is dropped
  // at 40rem so 640 -> 59, 560 -> 59, 390 -> 98 (the bar itself wraps there). The ruling
  // budgeted ~104 against a 1440x900 viewport and that holds exactly; between 640 and 900
  // the told row takes a second line and the strip runs to 126. Both numbers are pinned so
  // neither can grow unnoticed, and the 126 is flagged on the PR as a miss against the
  // quoted figure rather than smoothed over.
  const GOVERNING_BUDGET = 104;
  const WIDE_WORST = 130;
  check(
    `RR35 at the governing 1440x900 the strip costs no more than the ${GOVERNING_BUDGET}px the ruling budgeted (#442)`,
    !!deskRest && deskRest.h > 0 && deskRest.h <= GOVERNING_BUDGET,
    JSON.stringify({ stripHeight: deskRest && deskRest.h, budget: GOVERNING_BUDGET }),
  );
  // The SURVEY half carries the long prose (its day rows run to ~153 chars against an
  // annal's ~105), so the bar is driven there first: measuring the chronicle half's short
  // last annal reports 100 at every width and the envelope passes vacuously.
  await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));return null;})()`);
  await sleep(120);
  const byWidth = [];
  for (const w of [900, 768]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const s = await evaluate(stripRead);
    byWidth.push({ w, h: s && s.h, told: s && s.toldDisplay, gutter: s && s.gutter });
  }
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  check(
    `RR37 and it stays within the measured ${WIDE_WORST}px envelope at the widths where the told row wraps (#442)`,
    byWidth.length === 2 &&
      byWidth.every((r) => r.h > 0 && r.h <= WIDE_WORST && r.told === "flex") &&
      // The witness, without which this bounds nothing: at least one width must actually
      // WRAP past the governing budget, or the sweep never reached the case it claims to
      // cover and the envelope should be re-derived rather than left standing.
      byWidth.some((r) => r.h > GOVERNING_BUDGET),
    JSON.stringify({ byWidth, envelope: WIDE_WORST, budget: GOVERNING_BUDGET }),
  );
  // The chart does not shrink: the constraint set alongside the layout ruling. Pinned as
  // the COLUMN plus the source aspect rather than a height constant, because the rect is
  // the border box and the chart's 1px hairline puts it 2px above the 1100x849 the ruling
  // quotes (measured 2026-08-23 at 1440x900: 1100x851). A rule that shrank, cropped or
  // scaled the chart moves one of these two; the hairline moves neither.
  const SOURCE_RATIO = 1158 / 1500;
  check(
    "RR36 the chart still fills the room's 1100px column at its source aspect, unshrunk (#442)",
    !!room && room.col === 1100 && Math.abs(room.chartW - 1100) <= 2 &&
      Math.abs(room.ratio - SOURCE_RATIO) < 0.005,
    JSON.stringify({ ...room, sourceRatio: SOURCE_RATIO }),
  );
  await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(200);

  // #442 Play is a gesture, and a gesture is what asks for a picture.
  await evaluate(`(()=>{document.querySelector(".rf-play").click();return null;})()`);
  const played = await plateShown();
  check(
    "RR29 pressing Play asks for the picture, and one arrives (#442)",
    !!played && played.belowBar === true,
    JSON.stringify(played),
  );
  await evaluate(`(()=>{const p=document.querySelector(".rf-play");if(p.textContent==="Pause")p.click();return null;})()`);

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

  // #442 ruled 2026-08-22: a bare `survey` link parks at t=1, the return to the capital,
  // so it shows the CAPITAL's plate on arrival, at the present year (a link is the reader
  // asking for that moment). Seed 42's capital is i=0 Laukuwelua, present year 1059.
  const surveyPlate = await plateShown();
  check(
    "RR32 a bare `survey` link arrives showing the capital's plate, at the present (#442)",
    !!surveyPlate && surveyPlate.href === "/prospect/#seed=42&style=antique&i=0&year=1059" &&
      /Laukuwelua/.test(surveyPlate.alt || "") && /year 1059/.test(surveyPlate.alt || ""),
    JSON.stringify(surveyPlate),
  );
  const surveyStrip = await evaluate(stripRead);
  check(
    "RR33 the survey half's live row counts DAYS, the gutter its prologue rows use (#442)",
    !!surveyStrip && surveyStrip.toldHidden === false && /^day \d+$/.test(surveyStrip.gutter || ""),
    JSON.stringify(surveyStrip),
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

  const plate650 = await plateShown();
  check(
    "RR27 at year 650 the stage holds the latest crossed beat, Lamahai's founding (#402)",
    !!plate650 && plate650.href === "/prospect/#seed=42&style=antique&i=6&year=597" && /Lamahai/.test(plate650.alt || ""),
    JSON.stringify(plate650),
  );

  const scrubbed = await evaluate(`(()=>{const r=document.querySelector(".rf-range");r.value=r.min;r.dispatchEvent(new Event("input",{bubbles:true}));r.dispatchEvent(new Event("change",{bubbles:true}));const a=window.__vellumReadingRoomAges();return{chamber:a&&a.chamber,hash:location.hash};})()`);
  check(
    "RR8 a manual scrub to the survey half re-serializes the address on release",
    scrubbed.chamber === "survey" && /(^|#|&)survey(&|$)/.test(scrubbed.hash) && !/year=/.test(scrubbed.hash),
    JSON.stringify(scrubbed),
  );

  // #442 G reverses #402 here: crossing into the survey half no longer stows the picture,
  // it swaps the SOURCE. The slider went to its minimum, so the survey is at its first
  // leg, out of the capital: i=0 Laukuwelua at the present, not the year-650 beat plate.
  const crossed = await plateShown("i=0&year=1059");
  check(
    "RR27b crossing into the survey half SWAPS the plate's source with no gap, never hiding it (#442)",
    !!crossed && crossed.hidden === false && /Laukuwelua/.test(crossed.alt || ""),
    JSON.stringify(crossed),
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
  for (let i = 0; i < 300; i++) {
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
  // #442: a counter draw is a fresh ARRIVAL (#418), so the room goes back to bare rather
  // than restaging. The old world's plate must be GONE, which is the half #402 cared about,
  // and no new one may appear unasked, which is the half #442 adds.
  const restaged = await plateStaysHidden();
  check(
    "RR28 the counter draw clears the old world's plate and stages no new one unasked (#442)",
    restaged === null,
    restaged === null ? "stayed hidden" : JSON.stringify(restaged),
  );

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
  for (let i = 0; i < 300; i++) {
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
  for (let i = 0; i < 300; i++) {
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
  for (let i = 0; i < 300; i++) {
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
  for (let i = 0; i < 300; i++) {
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

  // #418: the arm waits for an off-thread travel order, so a window NEW to this issue opens between the painted chart and the armed instrument. `.rf-ages` is hidden across it (reading-frame.css gives [hidden] display:none), so a reader cannot click the scrubber; what IS live is every handler behind it, reachable from a stray keypress, a document click, or any programmatic dispatch. Each guards on `if (!ages) return`, and until this window existed nothing could test that they do.
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/reading-room/#seed=42&style=antique&legend=1` });
  const pokeBooted = await boot();
  let unarmed = null;
  for (let i = 0; i < 400; i++) {
    try {
      unarmed = await evaluate(`(()=>{const svg=!!document.querySelector(".rf-chart svg");
        const st=(document.querySelector(".rf-status")||{}).textContent;
        const a=window.__vellumReadingRoomAges?window.__vellumReadingRoomAges():undefined;
        return svg&&st!==""&&a===null?{panelHidden:document.querySelector(".rf-ages").hidden}:null;})()`);
    } catch {}
    if (unarmed) break;
    await sleep(25);
  }
  const poked = await evaluate(`(()=>{
    const before=window.__vellumReadingRoomAges();
    document.querySelector(".rf-play").click();
    const r=document.querySelector(".rf-range");
    r.value=r.max||"50";
    r.dispatchEvent(new Event("input",{bubbles:true}));
    r.dispatchEvent(new Event("change",{bubbles:true}));
    document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
    document.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    return{before,after:window.__vellumReadingRoomAges(),play:document.querySelector(".rf-play").textContent};
  })()`);
  const pokeSettled = await settled();
  const pokeRead = await evaluate(agesRead);
  check(
    "RR24 scrubbing, playing or clicking BEFORE the arm changes nothing, and the room still arrives at rest (#418)",
    pokeBooted && !!unarmed && unarmed.panelHidden === true &&
      poked.before === null && poked.after === null && poked.play === "Play" &&
      pokeSettled && !!pokeRead.ages && pokeRead.ages.chamber === "ages" &&
      pokeRead.play === "Play" && pokeRead.panelHidden === false,
    JSON.stringify({ unarmed, poked, read: pokeRead }),
  );

  // #418: on a COUNTER read the arm waits too, and the previous world's instrument must not outlive the chart it belonged to. clearAges runs in the task that swaps the chart, never with the deferred arm; held back with the arm, this window would show the OLD world's panel armed over the NEW world's chart, where a scrub filters these glyphs by that world's years and a release writes that year into this world's address.
  const rr25Before = await evaluate(`window.__vellumReadingRoomState().title`);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="526413615";c.querySelector(".rr-read").click();})()`);
  let rr25Window = null;
  for (let i = 0; i < 400; i++) {
    try {
      rr25Window = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();
        const status=(document.querySelector(".rf-status")||{}).textContent;
        if(st.title===${JSON.stringify(rr25Before)}||status==="")return null;
        const p=document.querySelector(".rf-ages");
        return{title:st.title,seed:st.seed,ages:window.__vellumReadingRoomAges(),
          panelHidden:p?p.hidden:null,tracks:document.querySelectorAll(".rf-chart .voyage-track").length};})()`);
    } catch {}
    if (rr25Window) break;
    await sleep(25);
  }
  const rr25Settled = await settled();
  const rr25After = await evaluate(agesRead);
  check(
    "RR25 a counter read tears the old instrument down with the chart it belonged to, then arms the new world (#418)",
    !!rr25Window && rr25Window.ages === null && rr25Window.panelHidden === true &&
      rr25Window.tracks === 0 && rr25Window.seed === 526413615 &&
      rr25Settled && !!rr25After.ages && rr25After.panelHidden === false &&
      rr25After.ages.chamber === "ages",
    JSON.stringify({ before: rr25Before, window: rr25Window, after: rr25After }),
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
  // #442 ruled 2026-08-23: on a phone the CONTROLS stick and the live row does not, so the
  // strip stays the bar's own height. Read after the same dwell, at the same viewport.
  const mobileStrip = await evaluate(stripRead);
  await evaluate(`(()=>{window.scrollTo(0,900);return null;})()`);
  await sleep(120);
  const mobileStuck = await evaluate(stripRead);
  await evaluate(`(()=>{window.scrollTo(0,0);return null;})()`);
  await shoot("reading-room-390.png");
  await ctx.clearMobile();
  check(
    "RR11 at 390px the room lays out with no sideways scroll (chart over log, one page scroll)",
    mobileSettled && mobile.w === 390,
    JSON.stringify(mobile),
  );
  check(
    "RR34 at 390px the live row is dropped and the controls still stick (#442, ruled 2026-08-23)",
    !!mobileStrip && mobileStrip.toldDisplay === "none" &&
      !!mobileStuck && mobileStuck.top === 0 && mobileStuck.position === "sticky",
    JSON.stringify({ rest: mobileStrip, stuck: mobileStuck }),
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
