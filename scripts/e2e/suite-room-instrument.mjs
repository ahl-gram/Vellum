// The room's instrument: the live-animation coverage re-hosted (#320, Survey and Story
// Sub 3). RS* labels, so the Explorer-hosted S* originals stay green beside these for
// the whole of this sub (the double coverage IS the point; Sub 4 retires the originals
// with a named list, the a/b/c inventory on this PR).
//
// The room mounts the SAME engine through createLivingChart, so these are the S-suite's
// assertions against .rf-* selectors and the room's own hooks. What did NOT port is
// named in the inventory: the #ages checkbox arming, the verso flip, and the Explorer's
// keep-the-chamber redraw (the room's ratified counter draw parks at the present, #221).
import { makeRoom, makeBar, scrubFacts, scopedHealth } from "./room-support.mjs";
import { HOST_HOOK_NAMES } from "../../src/site/shared/host-hooks.ts";

export async function run(ctx) {
  const { evaluate, check, sleep } = ctx;
  const room = makeRoom(ctx);
  const { setYear, yearNow, groupVis, roadsDisp, visibleGroups, clickPlay } = makeBar(ctx);
  const gate = scopedHealth(ctx);

  // RS0: the widened instrument state. The room published {chamber, year} only; every
  // check below reads the sweep through t / u / held / min / max / playing, which the
  // Explorer's __vellumAgesState has always carried and the room narrowed away.
  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RS0 the room boots and settles on the deep-linked world", booted);

  // The chamber owns which of t / year is live and which is null (agesState's own
  // contract), so the shape is asserted per chamber rather than "both are numbers":
  // at this present park t is null BY DESIGN, and a check that demanded a number
  // there would be pinning a bug.
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

  // RS2: the shared host surface. Every LivingChart host publishes the same
  // deterministic seams, so a ported check reads the same hook names on either page and
  // the two hosts cannot drift apart in what they expose (ratified 2026-08-10, decision
  // B on #320). __vellumRunInline rides along because it is the ground-truth oracle
  // every ported check needs: the manifest the page's own engine would draw.
  // The expected names come from the INSTALLER, not from a list restated here. A
  // hand-copied list is one-sided: it catches a seam removed from the room, and cannot
  // catch a seam added to installHostHooks that never reaches the room, since both sides
  // would have to be edited together to disagree. Importing HOST_HOOK_NAMES makes adding
  // a seam automatically extend this assertion. (The guard-prover flagged the hand-copied
  // shape on the first cut: it proved RS2 bit on removal and could not bite on addition.)
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

  // RS3 (S1's portable half): the room arrives ARMED and parked at the present with the
  // bar at the far right. The Explorer reached this by ticking #ages; the room has no
  // checkbox, the instrument IS the page, so the arming gesture does not port and only
  // the parked pose does.
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

  // RS5/RS6 (S3/S3b): scrub to the earliest LIVING founding. That town's glyph is up, a
  // later one is not, the roads hide in the past, and fewer glyphs stand than at the
  // present: the headline #93 acceptance, asserted on the room's chart.
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

  // RS7 (S4): a ruin's baked glyph is a RUIN, so it stays hidden through its living
  // centuries (no living glyph is baked for it) and appears at the fall year.
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

  // RS8/RS9 (S5/S5b): PLAY. The sweep runs monotonically through interior years and
  // auto-pauses at the present with the button back to "Play"; the roads return at that
  // end-of-Play park. Timing is not asserted, only that the year never goes backwards
  // and the run terminates (the S-suite's discipline, uniform pacing since PR #311).
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

  // RS10 (S6): a manual drag DURING Play pauses it and the sweep stops advancing. The
  // trailing settle window is the leak detector: a rAF still ticking would carry the
  // year past the dragged one.
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

  // RS11 (S9): drag-then-Play runs FORWARD from the dragged year (#220's "play from any
  // year"), never restarting from the minimum.
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

  // RS12 (S10): the Pause BUTTON freezes the sweep mid-flight and Play RESUMES from the
  // frozen year (begin = now - elapsed), not from the minimum or the present. The early
  // sample is the discriminator: a regression that restarted the whole sweep would read
  // BELOW the frozen year in its first beats before climbing back.
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

  // Park at the present before the dressing checks: RS12 leaves the sweep PLAYING, and
  // setYear pauses it (onManualScrub) AND drives every glyph to its present-day state.
  await setYear(sm.present);

  // RS13 IS DELIBERATELY ABSENT, and the gap is the finding rather than an oversight.
  //
  // S11 pins that the instrument panel unfurls on show (paperUnfurl at the full grade).
  // That dressing does not exist in the room: `paperUnfurl` is applied to the panel by
  // exactly one rule in the repo, `.scrubber:not([hidden])` at public/explorer/index.css
  // line 310, and public/reading-frame.css carries no unfurl rule at all. A ported check
  // measured animationName "none" on .rf-ages.
  //
  // So S11 is not class (a): its behavior has no room successor to write. It is named in
  // this PR's inventory as an open item for Sub 4, because retiring the Explorer's panel
  // retires the paper-physics ceremony from the PRODUCT, not just from the suite. Whether
  // the room owes that dressing is a visual decision for Alex (rendered variants first,
  // and a plate-reader pass if it lands), not something this migration sub should invent.
  //
  // Pinning the absence instead would be a bad guard: it would go red the moment someone
  // correctly adds the dressing. The label is left unused so the numbering stays stable.

  // RS14 (S12): the reveal is the real baked glyphs, not the pre-#93 abstract dots.
  const rs14 = await evaluate(`(()=>{
    const g=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].find((el)=>getComputedStyle(el).display!=="none");
    return{hasGlyph:!!(g&&g.querySelector("path, circle, text")),
      dataStateHits:document.querySelectorAll(".place-hit[data-state]").length};
  })()`);
  check("RS14 the sweep shows real glyphs, not dots (no data-state dots remain)", rs14.hasGlyph && rs14.dataStateHits === 0, JSON.stringify(rs14));

  // RS15 (S13): the journal's inked rows slide. The row's own class is restored after
  // probing, or a stripped row would red the every-row-inked counts that follow.
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

  // RS16 (S14, #93 Part 2): the strip is tall enough to show every entry at once.
  const rs16 = await evaluate(`(()=>{const s=document.querySelector(".rf-log-strip");return{rows:s.querySelectorAll("li").length,scrollH:s.scrollHeight,clientH:s.clientHeight};})()`);
  check("RS16 the journal strip shows every entry without scrolling (#93 Part 2)", rs16.rows > 0 && rs16.scrollH <= rs16.clientH + 1, JSON.stringify(rs16));

  // RS17 (S17's portable half): a present park is a CHAMBER-END rest, so the next Play
  // opens the WHOLE story from the survey's first leg (Alex's PR #311 ruling). The flip
  // half of S17 does not port: the room has no verso.
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

  // RS23 (S8): the cross-rebuild hazard. A draw of a DIFFERENT world must re-derive the
  // instrument against THAT world: a fresh manifest, a fresh bar domain, and the new
  // world's full glyph set. The Explorer reached this by typing a seed and clicking
  // #draw; the room's redraw is the #318 colophon counter, and the room parks at the new
  // world's own present rather than keeping the chamber (#221, so W8's contract does not
  // port, only S8's does).
  //
  // The oracle is INDEPENDENT on purpose: the second world's facts come from
  // __vellumRunInline, not from agesState. A self-referential form (year === max, both
  // read off the same hook) cannot see a bar domain re-derived from the wrong world,
  // which is exactly the regression S8 exists to catch, and it is why RR18/RR19/RR22 do
  // not cover this.
  //
  // SEED 3, and the choice is load-bearing: it is the one nearby seed whose place COUNT
  // differs from seed 42's (21 against 26). 13 of the 14 seeds sampled all carry 26, so
  // the obvious pick (seed 100) leaves the `visible === count` clause inert, satisfied by
  // coincidence rather than by the instrument having re-derived anything. Measured on the
  // mutation run that proved this guard: freezing the overlay manifest reddened it on max
  // and year while `visible` matched anyway. Seed 3 makes all three clauses discriminate.
  // Do not "tidy" this back to a rounder number.
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

  // RS26 (S11's successor; #321, ratified by Alex 2026-08-11, candidate C of the
  // out/321-unfurl variants): the room's reading column plays the arrival unfurl ONCE
  // per visit, staged: the instrument at the full grade, the journal one --paper-quick
  // beat (180ms) behind. The ceremony is transient BY DESIGN (the conductor removes
  // the class once the journal lands, so the engine's hidden toggles cannot replay it
  // as a flash), so this probes from settle for the class while it is live and reads
  // the computed animations at that moment, never after the fact.
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

  // RS27: the ceremony is FIRST arrival only, and the removal (not the [hidden] flag)
  // is what holds that: display:none terminates a CSS animation and restoring display
  // starts it AFRESH, and the engine drives the panel's hidden flag on every counter
  // read, so a class left in place would replay the unfurl on every dice roll. Wait
  // for the ceremony to retire, run a counter read, assert no unfurl re-applies.
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

  gate.check("RS24 the room instrument run is clean (no console errors, no new 4xx)");
}

