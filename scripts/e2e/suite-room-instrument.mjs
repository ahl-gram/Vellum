// Room instrument e2e (RS*, #320 Sub 3): the S-suite's live-animation coverage re-hosted against .rf-* selectors and the room's own hooks; the Explorer-hosted S* originals stay green beside these until Sub 4 retires them by name.
import { makeRoom, makeBar, scrubFacts, scopedHealth } from "./room-support.mjs";
import { HOST_HOOK_NAMES } from "../../src/site/shared/host-hooks.ts";

export async function run(ctx) {
  const { evaluate, check, sleep } = ctx;
  const room = makeRoom(ctx);
  const { setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay } = makeBar(ctx);
  const gate = scopedHealth(ctx);

  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RS0 the room boots and settles on the deep-linked world", booted);

  // At a present park t is null BY DESIGN (agesState's chamber contract); a check demanding a number there would pin a bug.
  const state = await evaluate(`window.__vellumReadingRoomAges()`);
  check(
    "RS1 the room publishes the whole instrument state (u, held, min, max, playing, seamU), not just chamber+year",
    !!state &&
      state.chamber === "ages" &&
      typeof state.year === "number" &&
      state.t === null &&
      typeof state.u === "number" &&
      typeof state.seamU === "number" &&
      typeof state.held === "boolean" &&
      typeof state.min === "number" &&
      typeof state.max === "number" &&
      typeof state.playing === "boolean",
    JSON.stringify(state),
  );

  // The expected names come from the INSTALLER (HOST_HOOK_NAMES): a hand-copied list catches a seam removed but can never catch one added to installHostHooks (the guard-prover proved that one-sidedness on the first cut).
  const surface = await evaluate(`(()=>{
    const names=${JSON.stringify(HOST_HOOK_NAMES)};
    return Object.fromEntries(names.map((n)=>[n,typeof window[n]]));
  })()`);
  check(
    `RS2 the room publishes every seam installHostHooks installs (${HOST_HOOK_NAMES.length} of them, derived from the installer)`,
    !!surface &&
      Object.keys(surface).length === HOST_HOOK_NAMES.length &&
      Object.values(surface).every((t) => t === "function"),
    JSON.stringify(surface),
  );

  const sm = await scrubFacts(evaluate, 42);

  const rs3 = await evaluate(`(()=>{
    const panel=document.querySelector(".rf-ages");
    const set=document.querySelector(".rf-chart #layer-settlements");
    const roads=document.querySelector(".rf-chart #layer-roads");
    const bar=document.querySelector(".rf-range");
    const a=window.__vellumAgesState();
    return{panelShown:!panel.hidden,setDisp:set?getComputedStyle(set).display:"(no-el)",
      roadsDisp:roads?getComputedStyle(roads).display:"(no-el)",
      min:Number(bar.min),max:Number(bar.max),val:Number(bar.value),
      year:a?a.year:-1,chamber:a?a.chamber:""};
  })()`);
  check(
    "RS3 the room parks armed at the present: glyph layer + roads visible, the bar at the far right",
    rs3.panelShown && rs3.setDisp !== "none" && rs3.roadsDisp !== "none" &&
      rs3.min === 0 && rs3.max === 2 * Math.max(1, sm.present - sm.minFounded) &&
      rs3.val === rs3.max && rs3.chamber === "ages" && rs3.year === sm.present,
    JSON.stringify(rs3),
  );

  const rs4visible = await visibleGroups();
  check("RS4 parked at the present year: every settlement glyph is shown", rs4visible === sm.count, `${rs4visible} visible groups vs ${sm.count} places`);

  await setYear(sm.earlyFounded);
  const rs5early = await groupVis(sm.earlyIdx);
  const rs5late = sm.lateIdx >= 0 ? await groupVis(sm.lateIdx) : "hidden";
  const rs5roads = await roadsDisp();
  check(
    "RS5 scrub to the earliest founding: that glyph shows, a later town's is hidden, roads hidden in the past",
    rs5early === "shown" && rs5late === "hidden" && rs5roads === "none",
    `early=${rs5early} late=${rs5late} roads=${rs5roads}`,
  );
  const rs6grown = await visibleGroups();
  check(
    "RS6 the world reveals over time: fewer glyphs up early than at the present",
    rs6grown > 0 && rs6grown < sm.count,
    `${rs6grown} visible at year ${sm.earlyFounded} vs ${sm.count} at present`,
  );

  if (sm.ruinIdx >= 0) {
    await setYear(Math.floor((sm.ruinFounded + sm.ruinYear) / 2));
    const before = await groupVis(sm.ruinIdx);
    await setYear(sm.ruinYear);
    const after = await groupVis(sm.ruinIdx);
    check(
      "RS7 a ruin is hidden through its living phase (state-begins), its ruin glyph appears at the fall year",
      before === "hidden" && after === "shown",
      `before=${before} after=${after} ruinYear=${sm.ruinYear}`,
    );
  } else {
    check("RS7 seed 42 has a ruin to scrub through", false, "no ruin in manifest");
  }

  const rs8start = await setYear(sm.minFounded);
  const startLabel = await evaluate(`(()=>{document.querySelector(".rf-play").click();return document.querySelector(".rf-play").textContent;})()`);
  let prev = -Infinity, mono = true, ended = false, lastYear = null, sawInterior = false;
  for (let i = 0; i < 130; i++) {
    const st = await evaluate(`({y:window.__vellumAgesState().year,lbl:document.querySelector(".rf-play").textContent})`);
    if (st.y < prev) mono = false;
    if (st.y > rs8start && st.y < sm.present) sawInterior = true;
    prev = st.y; lastYear = st.y;
    if (st.lbl === "Play") { ended = true; break; }
    await sleep(110);
  }
  check(
    "RS8 Play sweeps through interior years monotonically and auto-pauses at the present",
    startLabel === "Pause" && mono && sawInterior && ended && lastYear === sm.present,
    `start=${startLabel} mono=${mono} interior=${sawInterior} ended=${ended} last=${lastYear} present=${sm.present}`,
  );
  const rs9roads = await roadsDisp();
  check("RS9 roads return at the end-of-Play present park", rs9roads !== "none", `roads=${rs9roads}`);

  await setYear(sm.minFounded);
  await clickPlay();
  await sleep(220);
  const rs10 = await evaluate(`(()=>{
    const before=document.querySelector(".rf-play").textContent;
    const s=document.querySelector(".rf-range");const mid=${Math.floor((sm.minFounded + sm.present) / 2)};
    const a=window.__vellumAgesState();
    s.value=String(Number(s.max)/2+(mid-a.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    return{before,after:document.querySelector(".rf-play").textContent,year:window.__vellumAgesState().year,mid};
  })()`);
  await sleep(150);
  const rs10after = await yearNow();
  check(
    "RS10 a manual drag during Play pauses it and the sweep stops advancing",
    rs10.before === "Pause" && rs10.after === "Play" && rs10.year === rs10.mid && rs10after === rs10.mid,
    JSON.stringify(rs10) + ` settled=${rs10after}`,
  );

  const rs11mid = Math.floor((sm.minFounded + sm.present) / 2);
  await setYear(rs11mid);
  await clickPlay();
  let rs11min = Infinity, rs11max = -Infinity;
  for (let i = 0; i < 6; i++) {
    const y = await yearNow();
    if (y < rs11min) rs11min = y;
    if (y > rs11max) rs11max = y;
    await sleep(70);
  }
  check(
    "RS11 drag-then-Play runs FORWARD from the dragged year (#220: play from any year)",
    rs11min >= rs11mid && rs11max > rs11mid,
    `observed min=${rs11min} max=${rs11max} dragged=${rs11mid}`,
  );

  await setYear(sm.minFounded);
  await clickPlay();
  await sleep(700);
  const frozen = await evaluate(`(()=>{document.querySelector(".rf-play").click();return{year:window.__vellumAgesState().year,lbl:document.querySelector(".rf-play").textContent};})()`);
  await sleep(260);
  const stillFrozen = await yearNow();
  await clickPlay();
  await sleep(120);
  const resumedEarly = await yearNow();
  await sleep(700);
  const resumed = await yearNow();
  check(
    "RS12 the Pause button freezes mid-sweep; Play resumes from the frozen year (not min/present)",
    frozen.lbl === "Play" && frozen.year > sm.minFounded && frozen.year < sm.present &&
      stillFrozen === frozen.year && resumedEarly >= frozen.year &&
      resumed > frozen.year && resumed <= sm.present,
    `frozen=${frozen.year} early=${resumedEarly} resumed=${resumed} min=${sm.minFounded} present=${sm.present}`,
  );

  await setYear(sm.present);

  // RS13 is deliberately absent: S11's panel unfurl had no room successor when this ported (RS26/RS27 became that successor at #321), and the label stays unused so the numbering is stable.

  const rs14 = await evaluate(`(()=>{
    const g=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].find((el)=>getComputedStyle(el).display!=="none");
    return{hasGlyph:!!(g&&g.querySelector("path, circle, text")),
      dataStateHits:document.querySelectorAll(".place-hit[data-state]").length};
  })()`);
  check("RS14 the sweep shows real glyphs, not dots (no data-state dots remain)", rs14.hasGlyph && rs14.dataStateHits === 0, JSON.stringify(rs14));

  const rs15 = await evaluate(`(()=>{
    const li=document.querySelector(".rf-log-strip li");
    if(!li)return{li:false};
    const prop=getComputedStyle(li).transitionProperty;
    const had=li.classList.contains("inked");
    li.classList.add("inked");const pastTf=getComputedStyle(li).transform;
    if(!had)li.classList.remove("inked");
    return{li:true,prop,pastTf};
  })()`);
  check("RS15 journal inked-rows slide (transform in the transition + an indent)", rs15.li && rs15.prop.includes("transform") && rs15.pastTf !== "none", JSON.stringify(rs15));

  const rs16 = await evaluate(`(()=>{const s=document.querySelector(".rf-log-strip");return{rows:s.querySelectorAll("li").length,scrollH:s.scrollHeight,clientH:s.clientHeight};})()`);
  check("RS16 the journal strip shows every entry without scrolling (#93 Part 2)", rs16.rows > 0 && rs16.scrollH <= rs16.clientH + 1, JSON.stringify(rs16));

  await setYear(sm.present);
  await clickPlay();
  let rs17open = null;
  for (let i = 0; i < 40; i++) {
    const st = await evaluate(`(()=>{const a=window.__vellumAgesState();return{chamber:a.chamber,t:a.t,playing:a.playing,readout:document.querySelector(".rf-year").textContent};})()`);
    if (st.chamber === "survey") { rs17open = st; break; }
    await sleep(50);
  }
  await evaluate(`(()=>{const b=document.querySelector(".rf-play");if(b.textContent==="Pause")b.click();})()`);
  check(
    "RS17 a Play from the present park opens the whole story from the survey's first leg",
    !!rs17open && rs17open.playing === true && rs17open.t < 0.5 && rs17open.readout === "the survey",
    JSON.stringify(rs17open),
  );

  // SEED 3 is load-bearing: the one nearby seed whose place COUNT differs from seed 42's (21 vs 26; 13 of 14 sampled seeds carry 26), so visible===count actually discriminates (proved on the mutation run). Do not tidy it to a rounder number.
  const sm2 = await scrubFacts(evaluate, 3);
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="3";c.querySelector(".rr-read").click();})()`);
  let rs23 = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();const a=window.__vellumAgesState();const bar=document.querySelector(".rf-range");return{seed:st.seed,status:(document.querySelector(".rf-status")||{}).textContent,
        panelShown:!document.querySelector(".rf-ages").hidden,
        chamber:a&&a.chamber,year:a&&a.year,max:Number(bar.max),
        visible:[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 3) { rs23 = s; break; }
    await sleep(50);
  }
  check(
    "RS23 a draw of a different world re-derives the instrument against THAT world (bar domain and full glyph set)",
    !!rs23 && rs23.panelShown && rs23.chamber === "ages" &&
      rs23.max === 2 * Math.max(1, sm2.present - sm2.minFounded) &&
      rs23.year === sm2.present && rs23.visible === sm2.count,
    JSON.stringify({ rs23, expectedMax: 2 * Math.max(1, sm2.present - sm2.minFounded), expectedCount: sm2.count, present: sm2.present }),
  );

  const arrivedRoom = await room.goto("#seed=42&style=antique&legend=1");
  let rs26 = null;
  for (let i = 0; i < 40; i++) {
    const s = await evaluate(`(()=>{const root=document.querySelector(".rf");
      const inst=document.querySelector(".rf-instrument");const log=document.querySelector(".rf-log");
      return{cls:root.classList.contains("rf-arrival"),
        instAnim:getComputedStyle(inst).animationName,instDelay:getComputedStyle(inst).animationDelay,
        logAnim:getComputedStyle(log).animationName,logDelay:getComputedStyle(log).animationDelay};})()`);
    if (s.cls) { rs26 = s; break; }
    await sleep(30);
  }
  check(
    "RS26 the arrival unfurl plays, staged: instrument and journal wear paperUnfurl, the journal one beat behind (S11's room successor)",
    arrivedRoom && !!rs26 && rs26.instAnim === "paperUnfurl" && rs26.instDelay === "0s" &&
      rs26.logAnim === "paperUnfurl" && rs26.logDelay === "0.18s",
    JSON.stringify({ arrivedRoom, rs26 }),
  );

  // display:none terminates a CSS animation and restoring display starts it AFRESH; the engine drives the panel's hidden flag on every counter read, so a class left in place would replay the unfurl on every dice roll.
  let rs27clear = false;
  for (let i = 0; i < 60; i++) {
    const c = await evaluate(`document.querySelector(".rf").classList.contains("rf-arrival")`);
    if (!c) { rs27clear = true; break; }
    await sleep(50);
  }
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="7";c.querySelector(".rr-read").click();})()`);
  let rs27 = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,
        status:(document.querySelector(".rf-status")||{}).textContent,
        cls:document.querySelector(".rf").classList.contains("rf-arrival"),
        anim:getComputedStyle(document.querySelector(".rf-instrument")).animationName};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 7) { rs27 = s; break; }
    await sleep(50);
  }
  check(
    "RS27 the ceremony never replays: a counter read re-arms the panel with no unfurl (the hidden-toggle flash trap, held off)",
    rs27clear && !!rs27 && rs27.cls === false && rs27.anim === "none",
    JSON.stringify({ rs27clear, rs27 }),
  );

  // A read mid-unfurl CANCELS the animations (display:none; animationend never fires), so a removal keyed on animationend alone leaves the class in place and the next unhide replays the whole unfurl.
  const arrivedAgain = await room.goto("#seed=42&style=antique&legend=1");
  let rs28armed = false;
  for (let i = 0; i < 40; i++) {
    if (await evaluate(`document.querySelector(".rf").classList.contains("rf-arrival")`)) { rs28armed = true; break; }
    await sleep(25);
  }
  await evaluate(`(()=>{const c=document.querySelector(".rr-colophon");c.querySelector("input").value="9";c.querySelector(".rr-read").click();})()`);
  let rs28 = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();return{seed:st.seed,
        status:(document.querySelector(".rf-status")||{}).textContent,
        cls:document.querySelector(".rf").classList.contains("rf-arrival"),
        anim:getComputedStyle(document.querySelector(".rf-instrument")).animationName};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 9) { rs28 = s; break; }
    await sleep(50);
  }
  check(
    "RS28 a counter read mid-ceremony cancels it cleanly: the class retires on cancel, no replay on the re-arm",
    arrivedAgain && rs28armed && !!rs28 && rs28.cls === false && rs28.anim === "none",
    JSON.stringify({ arrivedAgain, rs28armed, rs28 }),
  );

  // #373: the room ran the #184 travel matrix synchronously inside the draw's own .then, with none of the Explorer's deferral, so it froze BOTH ceremonies (the chart's inkDraw and this panel's unfurl). The matrix is in the render worker now and the room arms at once on whatever order is ready, re-arming silently when the real one lands.
  await room.goto("#seed=42&style=antique&legend=1");
  await evaluate(`(()=>{window.__rsGap=0;let last=performance.now();
    const step=(now)=>{window.__rsGap=Math.max(window.__rsGap,now-last);last=now;
      if(!window.__rsStop)requestAnimationFrame(step);};window.__rsStop=false;requestAnimationFrame(step);
    const c=document.querySelector(".rr-colophon");c.querySelector("input").value="1234";c.querySelector(".rr-read").click();})()`);
  let rs29 = null;
  for (let i = 0; i < 200; i++) {
    let s = null;
    try {
      s = await evaluate(`(()=>{const st=window.__vellumReadingRoomState();
        return{seed:st.seed,status:(document.querySelector(".rf-status")||{}).textContent,
          ordered:window.__vellumReadingRoomOrdered()};})()`);
    } catch {}
    if (s && s.status === "" && s.seed === 1234 && s.ordered) { rs29 = s; break; }
    await sleep(50);
  }
  const rs29gap = await evaluate(`(()=>{window.__rsStop=true;return window.__rsGap;})()`);
  check(
    "RS29 a counter read keeps painting throughout: the travel matrix is off the room's thread too (#373)",
    !!rs29 && rs29gap > 0 && rs29gap < 600,
    JSON.stringify({ ...rs29, gap: rs29gap }),
  );

  gate.check("RS24 the room instrument run is clean (no console errors, no new 4xx)");
}

