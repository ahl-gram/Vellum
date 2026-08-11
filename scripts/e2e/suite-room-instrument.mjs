// The room's instrument: the live-animation coverage re-hosted (#320, Survey and Story
// Sub 3). RS* labels, so the Explorer-hosted S* originals stay green beside these for
// the whole of this sub (the double coverage IS the point; Sub 4 retires the originals
// with a named list, the a/b/c inventory on this PR).
//
// The room mounts the SAME engine through createLivingChart, so these are the S-suite's
// assertions against .rf-* selectors and the room's own hooks. What did NOT port is
// named in the inventory: the #ages checkbox arming, the verso flip, and the Explorer's
// keep-the-chamber redraw (the room's ratified counter draw parks at the present, #221).
import { makeRoom } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, check, sleep } = ctx;
  const room = makeRoom(ctx);

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
  const surface = await evaluate(`(()=>{
    const names=["__vellumAgesState","__vellumVoyageStepTo","__vellumVoyagePaintAt","__vellumVoyagePlan","__vellumVoyageLog","__vellumVoyageLegGeometry","__vellumRunInline"];
    return Object.fromEntries(names.map((n)=>[n,typeof window[n]]));
  })()`);
  check(
    "RS2 the room publishes the shared host hook surface (ages, the five voyage seams, runInline)",
    !!surface && Object.values(surface).every((t) => t === "function"),
    JSON.stringify(surface),
  );

  // Scrub facts from the room's OWN engine, the S-suite's oracle read through the
  // shared hook: the range, the present year, the earliest and a later LIVING founding
  // (so their glyph groups reveal cleanly), and the ruin's founding + fall year.
  const sm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places,events=r.manifest.events,present=r.manifest.presentYear;
    const minFounded=Math.min(...places.map((p)=>p.founded));
    const living=places.filter((p)=>!p.ruined).slice().sort((a,b)=>a.founded-b.founded);
    const early=living[0];
    const later=living.find((p)=>p.founded>early.founded);
    const ruin=places.find((p)=>p.ruined);
    const ruinEv=ruin?events.find((e)=>e.settlement===ruin.idx&&e.kind==="ruin"):null;
    return{count:places.length,present,minFounded,
      earlyIdx:early.idx,earlyFounded:early.founded,
      lateIdx:later?later.idx:-1,lateFounded:later?later.founded:-1,
      lateNx:later?later.nx:-1,lateNy:later?later.ny:-1,
      ruinIdx:ruin?ruin.idx:-1,ruinYear:ruin?(ruinEv?ruinEv.year:present):null,
      ruinFounded:ruin?ruin.founded:null};
  })()`);

  // The room's bar helpers. Same #220 domain as the Explorer's ([0, 2*span], the seam at
  // the midpoint, so a year lands at barMax/2 + (year - min)), against .rf-* selectors.
  // The earliest year is the ONE bar position the seam already owns, so the helper
  // clamps to min+1 exactly as the S-suite's does.
  const setYear = (y) =>
    evaluate(`(()=>{const s=document.querySelector(".rf-range");const a=window.__vellumAgesState();const yy=Math.max(${y},a.min+1);s.value=String(Number(s.max)/2+(yy-a.min));s.dispatchEvent(new Event("input",{bubbles:true}));return window.__vellumAgesState().year;})()`);
  const yearNow = () => evaluate(`window.__vellumAgesState().year`);
  const groupVis = (idx) =>
    evaluate(`(()=>{const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${idx}"]');return g?(getComputedStyle(g).display==="none"?"hidden":"shown"):"(no-el)";})()`);
  const roadsDisp = () =>
    evaluate(`(()=>{const r=document.querySelector('.rf-chart #layer-roads');return r?getComputedStyle(r).display:"(no-el)";})()`);
  const visibleGroups = () =>
    evaluate(`[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length`);
  const playLabel = () => evaluate(`document.querySelector(".rf-play").textContent`);
  const clickPlay = () => evaluate(`document.querySelector(".rf-play").click()`);

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

  // --- RS18-RS22 (#155): the ink-in, re-hosted. living-chart.ts tags the CROSSING group
  // data-ink with its grade and the CSS keys the animation on it. Back to a clean present
  // park first so the `sm` facts address real glyph groups again.
  await setYear(sm.present);
  const inkedCount = () => evaluate(`document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length`);

  // RS18 (S20): a PARK is silent. If a park painted a grade, arriving in the room would
  // stamp the entire world in at once. Non-vacuous: RS4 already proved every glyph is up.
  const rs18 = await inkedCount();
  check("RS18 the park is silent: every glyph is up and none carries an ink grade (#155)", rs18 === 0, `${rs18} groups inked at the park`);

  // RS19 (S21): crossing a founding stamps THAT town. The grade lands on the group and
  // the mark node under it carries inkStamp at --paper about the town point, resolved
  // against the view box (never a box centre: the chart mixes projections, so a castle
  // STANDS ON its point while a plan mark is CENTRED on it).
  if (sm.lateIdx >= 0) {
    await setYear(sm.lateFounded - 1);
    const rs19 = await evaluate(`(()=>{
      const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.lateFounded}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
      const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${sm.lateIdx}"]');
      if(!g)return{found:false};
      const mark=g.querySelector(":scope > :not(text)");
      if(!mark)return{found:true,hasMark:false};
      const cs=getComputedStyle(mark);
      const vb=document.querySelector(".rf-chart svg").viewBox.baseVal;
      const o=cs.transformOrigin.split(" ").map(parseFloat);
      return{found:true,hasMark:true,ink:g.getAttribute("data-ink"),disp:getComputedStyle(g).display,
        name:cs.animationName,dur:cs.animationDuration,box:cs.transformBox,
        wantX:${sm.lateNx}*vb.width,wantY:${sm.lateNy}*vb.height,gotX:o[0],gotY:o[1],
        others:document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length};
    })()`);
    const onPoint = rs19.found && rs19.hasMark && Math.abs(rs19.gotX - rs19.wantX) < 0.05 && Math.abs(rs19.gotY - rs19.wantY) < 0.05;
    check(
      "RS19 crossing a founding stamps that town: data-ink=founding, inkStamp at --paper about the town point",
      rs19.found && rs19.hasMark && rs19.ink === "founding" && rs19.disp !== "none" &&
        rs19.name === "inkStamp" && rs19.dur.includes("0.26") && rs19.box === "view-box" && onPoint && rs19.others >= 1,
      JSON.stringify(rs19),
    );
  } else {
    check("RS19 seed 42 has a later living founding to cross", false, "no second living founding in manifest");
  }

  // RS20 (S22): the NAME dries one quick beat behind its mark (#170's staggered-name
  // idiom). Jumping from the earliest year to the present reveals many towns at once,
  // guaranteeing an inked group that kept its label.
  await setYear(sm.minFounded);
  const rs20 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.present}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    const inked=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]')];
    const withLabel=inked.find((g)=>g.querySelector(":scope > text"));
    if(!withLabel)return{inked:inked.length,labelled:false};
    const cs=getComputedStyle(withLabel.querySelector(":scope > text"));
    return{inked:inked.length,labelled:true,name:cs.animationName,dur:cs.animationDuration,delay:cs.animationDelay};
  })()`);
  check(
    "RS20 a revealed town's NAME dries in one quick beat behind its mark (#155)",
    rs20.inked > 0 && rs20.labelled && rs20.name === "dryingInk" && rs20.dur.includes("0.18") && rs20.delay.includes("0.18"),
    JSON.stringify(rs20),
  );

  // RS21 (S23): a ruin has no press to it. Its beat is the FALL year and it dries into
  // the record rather than stamping down.
  if (sm.ruinIdx >= 0) {
    await setYear(sm.ruinYear - 1);
    const rs21 = await evaluate(`(()=>{
      const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.ruinYear}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
      const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${sm.ruinIdx}"]');
      if(!g)return{found:false};
      const mark=g.querySelector(":scope > :not(text)");
      if(!mark)return{found:true,hasMark:false};
      const cs=getComputedStyle(mark);
      return{found:true,hasMark:true,ink:g.getAttribute("data-ink"),disp:getComputedStyle(g).display,
        name:cs.animationName,dur:cs.animationDuration};
    })()`);
    check(
      "RS21 a ruin inks in at its FALL year with dryingInk, never the stamp (#155)",
      rs21.found && rs21.hasMark && rs21.ink === "ruin" && rs21.disp !== "none" &&
        rs21.name === "dryingInk" && rs21.dur.includes("0.26"),
      JSON.stringify(rs21),
    );
  } else {
    check("RS21 seed 42 has a ruin to ink in", false, "no ruin in manifest");
  }

  // RS22 (S26): the crown jewel. The stamp presses ONTO the town, it does not slide onto
  // it, so the town point must be a FIXED POINT of the press: at any instant the mark's
  // box is the resting box scaled about that point. Ground truth comes from the MANIFEST
  // through the chart's own getScreenCTM, never from a .place-hit box (the overlay is
  // sized to the mount while the chart svg renders a few px wider, and the press would
  // scale that ~1.2px offset into a phantom error). Tolerance is sub-pixel on purpose:
  // the defect this guards is 1.03px at k=1.
  await setYear(sm.minFounded);
  const rs22 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.present}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    const man=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest;
    const pt=new Map(man.places.map((p)=>[String(p.idx),p]));
    const svg=document.querySelector(".rf-chart svg");
    const vb=svg.viewBox.baseVal, ctm=svg.getScreenCTM();
    const groups=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink="founding"]')];
    let worst=0,worstAt="",measured=0,castles=0;
    for(const g of groups){
      const place=pt.get(g.dataset.idx);
      if(!place)continue;
      const p=new DOMPoint(place.nx*vb.width,place.ny*vb.height).matrixTransform(ctm);
      const px=p.x, py=p.y;
      for(const mark of g.querySelectorAll(":scope > :not(text)")){
        const anims=mark.getAnimations();
        if(!anims.length)continue;
        if(mark.querySelector(".settlement-capital,.settlement-seat")||mark.classList.contains("settlement-capital")||mark.classList.contains("settlement-seat"))castles++;
        for(const a of anims)a.pause();
        for(const a of anims)a.currentTime=0;
        const b0=mark.getBoundingClientRect();
        const k=new DOMMatrix(getComputedStyle(mark).transform).a;
        for(const a of anims)a.currentTime=a.effect.getTiming().duration;
        const b1=mark.getBoundingClientRect();
        for(const a of anims){a.currentTime=0;a.play();}
        if(b1.width===0||b1.height===0)continue;
        measured++;
        for(const [got,rest,q] of [[b0.left,b1.left,px],[b0.right,b1.right,px],[b0.top,b1.top,py],[b0.bottom,b1.bottom,py]]){
          const d=Math.abs(got-(q+k*(rest-q)));
          if(d>worst){worst=d;worstAt=g.dataset.idx+" k="+k.toFixed(3);}
        }
      }
    }
    return{groups:groups.length,measured,castles,worst:Number(worst.toFixed(3)),worstAt};
  })()`);
  check(
    "RS22 the stamp presses ONTO the town: the town point is a fixed point of the press (#155)",
    rs22.measured > 0 && rs22.castles > 0 && rs22.worst < 0.05,
    JSON.stringify(rs22),
  );
}
