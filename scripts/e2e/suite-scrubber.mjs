// Chronicle year-scrubber checks (S1-S14, #54 + #93).
// Split from e2e-explorer.mjs; behavior + check order preserved where they map.
// #93 rewrote the reveal mechanism: the sweep now shows/hides the REAL baked
// settlement glyphs (<g class="settlement" data-idx>) by year instead of abstract
// dots, and the roads layer reveals only when parked at the present. So the checks
// that read a dot's data-state now read a glyph group's display; the roads and the
// taller strip (Part 2) get their own checks.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- S: Chronicle year-scrubber (#54, #93): the client-only DOM overlay that
  // animates the world growing. Placed before the console-health check so it also
  // covers the toggle / scrub / Play / redraw paths. A clean seed-42 antique base
  // (arms off, no theme, chronicle off) so the marks map to a known manifest.
  await evaluate(`(()=>{
    document.getElementById("seed").value="42";
    document.getElementById("style").value="antique";
    document.getElementById("theme").value="";
    document.getElementById("type").value="";
    document.getElementById("arms").checked=false;
    document.getElementById("chronicle").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("scrub-base-draw");

  // Scrub facts from the page's OWN engine: range, the present year, the earliest
  // and a later LIVING (non-ruined) founding so their glyph groups reveal cleanly,
  // and the ruin's founding + abandonment year (or present, if its event was sliced
  // off the 14-event chronicle).
  const sm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places,events=r.manifest.events,present=r.manifest.presentYear;
    const minFounded=Math.min(...places.map((p)=>p.founded));
    const living=places.filter((p)=>!p.ruined).slice().sort((a,b)=>a.founded-b.founded);
    const early=living[0];
    const later=living.find((p)=>p.founded>early.founded);
    const ruin=places.find((p)=>p.ruined);
    const ruinEv=ruin?events.find((e)=>e.settlement===ruin.idx&&e.kind==="ruin"):null;
    const ruinYear=ruin?(ruinEv?ruinEv.year:present):null;
    return{count:places.length,present,minFounded,
      earlyIdx:early.idx,earlyFounded:early.founded,
      lateIdx:later?later.idx:-1,lateFounded:later?later.founded:-1,
      ruinIdx:ruin?ruin.idx:-1,ruinYear,ruinFounded:ruin?ruin.founded:null};
  })()`);

  const setYear = (y) =>
    evaluate(`(()=>{const s=document.getElementById("scrub-range");s.value="${y}";s.dispatchEvent(new Event("input",{bubbles:true}));return Number(s.value);})()`);
  // Each baked settlement glyph is an addressable group; the sweep toggles its display.
  const groupVis = (idx) =>
    evaluate(`(()=>{const g=document.querySelector('#map #layer-settlements g.settlement[data-idx="${idx}"]');return g?(getComputedStyle(g).display==="none"?"hidden":"shown"):"(no-el)";})()`);
  const layerDisp = () =>
    evaluate(`(()=>{const s=document.querySelector('#map #layer-settlements');return s?getComputedStyle(s).display:"(no-el)";})()`);
  const roadsDisp = () =>
    evaluate(`(()=>{const r=document.querySelector('#map #layer-roads');return r?getComputedStyle(r).display:"(no-el)";})()`);
  const visibleGroups = () =>
    evaluate(`[...document.querySelectorAll('#map #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length`);

  // S1: toggle chronicle ON via the change handler (the real gesture). Parked at the
  // present, the baked settlement layer stays visible (its glyphs are the marks now)
  // and the roads show; the slider spans founding..present.
  const s1 = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const roads=document.querySelector("#map #layer-roads");
    const slider=document.getElementById("scrub-range");
    return{panelShown:!panel.hidden,scrubClass:ov?ov.classList.contains("scrub"):false,setDisp:set?getComputedStyle(set).display:"(no-el)",roadsDisp:roads?getComputedStyle(roads).display:"(no-el)",min:Number(slider.min),max:Number(slider.max),val:Number(slider.value)};
  })()`);
  check("S1 chronicle on: panel shown, real glyph layer + roads visible at present, slider spans founding..present", s1.panelShown && s1.scrubClass && s1.setDisp !== "none" && s1.roadsDisp !== "none" && s1.min === sm.minFounded && s1.max === sm.present && s1.val === sm.present, JSON.stringify(s1));

  const s2visible = await visibleGroups();
  check("S2 parked at the present year: every settlement glyph is shown", s2visible === sm.count, `${s2visible} visible groups vs ${sm.count} places`);

  // S3: scrub to the earliest LIVING founding — that town's glyph is up, a later one
  // is not; and with the year in the past, the roads hide (no roads to unfounded towns).
  await setYear(sm.earlyFounded);
  const s3early = await groupVis(sm.earlyIdx);
  const s3late = sm.lateIdx >= 0 ? await groupVis(sm.lateIdx) : "hidden";
  const s3roads = await roadsDisp();
  check("S3 scrub to earliest founding: that glyph shows, a later town's is hidden, roads hidden in the past", s3early === "shown" && s3late === "hidden" && s3roads === "none", `early=${s3early} late=${s3late} roads=${s3roads}`);
  // S3b: the headline acceptance, asserted directly -- the world GROWS over time, so
  // fewer real glyphs are up at an early year than the full set shown at the present.
  const s3grown = await visibleGroups();
  check("S3b the world reveals over time: fewer glyphs up early than at the present", s3grown > 0 && s3grown < sm.count, `${s3grown} visible at year ${sm.earlyFounded} vs ${sm.count} at present`);

  // S4: state-begins for a ruin — its baked glyph is a ruin, so it is HIDDEN through
  // its living centuries (no living glyph baked) and inks in at the fall year.
  if (sm.ruinIdx >= 0) {
    await setYear(Math.floor((sm.ruinFounded + sm.ruinYear) / 2));
    const before = await groupVis(sm.ruinIdx);
    await setYear(sm.ruinYear);
    const after = await groupVis(sm.ruinIdx);
    check("S4 a ruin is hidden through its living phase (state-begins), its ruin glyph appears at the fall year", before === "hidden" && after === "shown", `before=${before} after=${after} ruinYear=${sm.ruinYear}`);
  } else {
    check("S4 seed 42 has a ruin to scrub through", false, "no ruin in manifest");
  }

  // Artifact: a partially-grown world (mid-timeline), for the user to eyeball.
  await setYear(Math.floor((sm.minFounded + sm.present) / 2));
  await shoot("explorer-chronicle-scrubber.png");

  // S5: Play sweeps monotonically (event-proportional plateaus included) and
  // auto-pauses at the present year with the button back to "Play". Timing is not
  // asserted — only that the year never goes backwards and the run terminates.
  await setYear(sm.minFounded);
  const startLabel = await evaluate(`(()=>{document.getElementById("scrub-play").click();return document.getElementById("scrub-play").textContent;})()`);
  let prev = -Infinity, mono = true, ended = false, lastYear = null, sawInterior = false;
  for (let i = 0; i < 130; i++) {
    const st = await evaluate(`({y:Number(document.getElementById("scrub-range").value),lbl:document.getElementById("scrub-play").textContent})`);
    if (st.y < prev) mono = false;
    // an interior sample proves the world actually grew, not a single-frame jump to present
    if (st.y > sm.minFounded && st.y < sm.present) sawInterior = true;
    prev = st.y; lastYear = st.y;
    if (st.lbl === "Play") { ended = true; break; }
    await sleep(110);
  }
  check("S5 Play sweeps through interior years monotonically and auto-pauses at present", startLabel === "Pause" && mono && sawInterior && ended && lastYear === sm.present, `start=${startLabel} mono=${mono} interior=${sawInterior} ended=${ended} last=${lastYear} present=${sm.present}`);
  const s5roads = await roadsDisp();
  check("S5b roads return at the end-of-Play present park", s5roads !== "none", `roads=${s5roads}`);

  // S6: a manual drag during Play pauses it and jumps to the dragged year.
  await setYear(sm.minFounded);
  await evaluate(`document.getElementById("scrub-play").click()`);
  await sleep(220); // let the sweep advance a little
  const s6 = await evaluate(`(()=>{
    const before=document.getElementById("scrub-play").textContent;
    const s=document.getElementById("scrub-range");const mid=${Math.floor((sm.minFounded + sm.present) / 2)};
    s.value=String(mid);s.dispatchEvent(new Event("input",{bubbles:true}));
    return{before,after:document.getElementById("scrub-play").textContent,year:Number(s.value),mid};
  })()`);
  await sleep(150); // a leaked rAF would advance the year past mid in this window
  const s6after = await evaluate(`Number(document.getElementById("scrub-range").value)`);
  check("S6 a manual drag during Play pauses it and the sweep stops advancing", s6.before === "Pause" && s6.after === "Play" && s6.year === s6.mid && s6after === s6.mid, JSON.stringify(s6) + ` settled=${s6after}`);

  // S7: chronicle OFF restores the full present-day chart (every glyph group + roads
  // shown again, even those the sweep had hidden) and idle parity (hits clickable).
  const s7 = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const roads=document.querySelector("#map #layer-roads");
    const hit=document.querySelector(".place-hit");
    const groups=[...document.querySelectorAll('#map #layer-settlements g.settlement')];
    const visible=groups.filter((g)=>getComputedStyle(g).display!=="none").length;
    return{panelHidden:panel.hidden,noScrub:ov?!ov.classList.contains("scrub"):true,setDisp:set?getComputedStyle(set).display:"(no-el)",roadsDisp:roads?getComputedStyle(roads).display:"(no-el)",visible,total:groups.length,hitPe:hit?getComputedStyle(hit).pointerEvents:"(no-el)"};
  })()`);
  check("S7 chronicle off: panel hidden, every glyph + roads restored, hits interactive again", s7.panelHidden && s7.noScrub && s7.setDisp !== "none" && s7.roadsDisp !== "none" && s7.visible === s7.total && s7.total === sm.count && s7.hitPe === "auto", JSON.stringify(s7));

  // S8: a redraw with chronicle ON re-applies the scrubber to the NEW world (fresh
  // manifest, range, and glyph groups) — the cross-rebuild hazard.
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("scrub-redraw");
  const sm2 = await evaluate(`(()=>{const r=window.__vellumRunInline({kind:"draw",seed:100,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});const places=r.manifest.places;return{present:r.manifest.presentYear,count:places.length,minFounded:Math.min(...places.map((p)=>p.founded))};})()`);
  const s8 = await evaluate(`(()=>{
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const roads=document.querySelector("#map #layer-roads");
    const slider=document.getElementById("scrub-range");
    const visible=[...document.querySelectorAll('#map #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length;
    return{panelShown:!panel.hidden,scrubClass:ov?ov.classList.contains("scrub"):false,setDisp:set?getComputedStyle(set).display:"(no-el)",roadsDisp:roads?getComputedStyle(roads).display:"(no-el)",max:Number(slider.max),visible};
  })()`);
  check("S8 redraw with chronicle on re-applies the scrubber to the new world", s8.panelShown && s8.scrubClass && s8.setDisp !== "none" && s8.roadsDisp !== "none" && s8.max === sm2.present && s8.visible === sm2.count, JSON.stringify(s8));

  // S9: drag to a mid year, then Play — the sweep RESTARTS from the earliest
  // founding (a manual drag zeroes scrub.elapsed), it does NOT resume from the
  // dragged year. Guards the deliberate restart-from-min behavior; a regression
  // to resume-from-position would leave every observed year >= the dragged value.
  const s9mid = Math.floor((sm2.minFounded + sm2.present) / 2);
  await setYear(s9mid);
  await evaluate(`document.getElementById("scrub-play").click()`);
  let s9min = Infinity;
  for (let i = 0; i < 6; i++) {
    const y = await evaluate(`Number(document.getElementById("scrub-range").value)`);
    if (y < s9min) s9min = y;
    await sleep(70);
  }
  check("S9 drag-then-Play restarts from the earliest founding, not the dragged year", s9min < s9mid, `earliest observed=${s9min} dragged=${s9mid} min=${sm2.minFounded}`);

  // S10: the Pause BUTTON freezes the sweep mid-flight, and Play RESUMES from the
  // frozen year (begin = now - scrub.elapsed), not from min or present. This is the
  // literal "Pause freezes" acceptance criterion and the resume-from-position path
  // (the mirror of S9's drag-restart). A regression that restarted from min would
  // leave the post-resume year below the frozen year.
  await setYear(sm2.minFounded);
  await evaluate(`document.getElementById("scrub-play").click()`); // Play from min
  await sleep(700); // advance into the interior
  const frozen = await evaluate(`(()=>{document.getElementById("scrub-play").click();return{year:Number(document.getElementById("scrub-range").value),lbl:document.getElementById("scrub-play").textContent};})()`); // Pause button
  await sleep(260);
  const stillFrozen = await evaluate(`Number(document.getElementById("scrub-range").value)`);
  await evaluate(`document.getElementById("scrub-play").click()`); // Play resumes
  await sleep(300);
  const resumed = await evaluate(`Number(document.getElementById("scrub-range").value)`);
  check("S10 Pause button freezes mid-sweep; Play resumes from the frozen year (not min/present)", frozen.lbl === "Play" && frozen.year > sm2.minFounded && frozen.year < sm2.present && stillFrozen === frozen.year && resumed > frozen.year && resumed <= sm2.present, `frozen=${frozen.year} still=${stillFrozen} resumed=${resumed} min=${sm2.minFounded} present=${sm2.present}`);

  // S11-S14 #128 paper physics + #93 mechanism. Park at the present year FIRST: S10
  // leaves the sweep PLAYING mid-timeline, so setYear pauses it (onManualScrub) AND
  // drives every glyph to its present-day state. e2e reads the WIRED motion; the live
  // animations + reduced-motion collapse are CDP-probe verified.
  await setYear(sm2.present);
  const s11 = await evaluate(`(()=>{const p=document.getElementById("scrubber");const cs=getComputedStyle(p);return{hidden:p.hidden,name:cs.animationName,dur:cs.animationDuration};})()`);
  check("S11 scrubber panel unfurls on show (paperUnfurl at the full grade)", s11.hidden === false && s11.name === "paperUnfurl" && s11.dur.includes("0.65"), JSON.stringify(s11));

  // S12: the reveal is the real baked glyphs, not dots — a visible settlement group
  // carries a real glyph node, and no data-state dot remains on any hit.
  const s12 = await evaluate(`(()=>{
    const g=[...document.querySelectorAll('#map #layer-settlements g.settlement')].find((el)=>getComputedStyle(el).display!=="none");
    const hasGlyph=!!(g&&g.querySelector("path, circle, text"));
    const dataStateHits=document.querySelectorAll(".place-hit[data-state]").length;
    return{hasGlyph,dataStateHits};
  })()`);
  check("S12 the sweep shows real glyphs, not dots (no data-state dots remain)", s12.hasGlyph && s12.dataStateHits === 0, JSON.stringify(s12));

  const s13 = await evaluate(`(()=>{
    const li=document.querySelector(".chronicle-strip li");
    if(!li)return{li:false};
    const prop=getComputedStyle(li).transitionProperty;
    li.classList.add("past");const pastTf=getComputedStyle(li).transform;li.classList.remove("past");
    return{li:true,prop,pastTf};
  })()`);
  check("S13 chronicle strip past-rows slide (transform in the transition + a 2px indent)", s13.li && s13.prop.includes("transform") && s13.pastTf !== "none", JSON.stringify(s13));

  // S14 (#93 Part 2): the strip is tall enough to show every entry at once (no scroll).
  const s14 = await evaluate(`(()=>{const s=document.getElementById("chronicle-strip");return{rows:s.querySelectorAll("li").length,scrollH:s.scrollHeight,clientH:s.clientHeight};})()`);
  check("S14 the chronicle strip shows every entry without scrolling (#93 Part 2)", s14.rows > 0 && s14.scrollH <= s14.clientH + 1, JSON.stringify(s14));

  // --- S15-S19 (#180): flipping the sheet SNAPS the chronicle to the present, so the
  // pristine verso ghost (a Blob of the chart as the WORKER drew it) can never disagree
  // with a scrubbed recto. The scrubber mutates the baked chart (per-glyph display) and the
  // <img> ghost cannot mirror that, so the fix parks the recto at the present on flip, which
  // clears every mutation and makes both faces agree BY CONSTRUCTION with zero ghost work.
  // Chronicle is ON here (seed 100, sm2), parked at the present, not playing. The scrubber
  // panel + strip live OUTSIDE .sheet, so they stay visible while flipped and must read the
  // present after the snap. suite-scrubber runs after suite-verso, so it drives its own flip.
  const ensureRecto = () =>
    evaluate(`(()=>{const s=document.getElementById("sheet");if(s.classList.contains("versoed")){document.getElementById("verso-turn").click();return "unflipped";}return "recto";})()`);
  await ensureRecto();
  await sleep(60);

  // S15: scrub to a PAST year, then turn the sheet -> the panel snaps to the present. The
  // beforeVisible < count guard proves the recto really was in the past (non-vacuous).
  const s15past = Math.floor((sm2.minFounded + sm2.present) / 2);
  await setYear(s15past);
  const visSel = `[...document.querySelectorAll('#map #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length`;
  const s15 = await evaluate(`(()=>{
    const beforeVal=Number(document.getElementById("scrub-range").value);
    const beforeVisible=${visSel};
    document.getElementById("verso-turn").click();
    const rows=[...document.querySelectorAll("#chronicle-strip li")];
    return{beforeVal,beforeVisible,afterVal:Number(document.getElementById("scrub-range").value),
      afterVisible:${visSel},
      year:document.getElementById("scrub-year").textContent,
      rows:rows.length,pastRows:rows.filter((li)=>li.classList.contains("past")).length,
      flipped:document.getElementById("sheet").classList.contains("versoed")};
  })()`);
  // afterVisible === count is the headline criterion, asserted directly on the RECTO glyphs:
  // the snap clears every inline display the sweep set, so no settlement hidden on the front
  // (and therefore absent from the pristine ghost) survives onto the back. The panel readouts
  // are the visible proof; the glyph restore is the substance.
  check("S15 flipping mid-scrub snaps the scrubber to the present (all glyphs back, slider, year, every strip row .past)", s15.beforeVal === s15past && s15.beforeVisible < sm2.count && s15.afterVisible === sm2.count && s15.afterVal === sm2.present && s15.year === `year ${sm2.present}` && s15.rows > 0 && s15.pastRows === s15.rows && s15.flipped, JSON.stringify(s15));

  // S16: turning mid-Play PAUSES Play and parks at the present; the Turn button is never
  // disabled by a running Play, and no rAF leaks on behind the hidden face.
  await ensureRecto();
  await sleep(60);
  await setYear(sm2.minFounded);
  await evaluate(`document.getElementById("scrub-play").click()`); // Play from the earliest founding
  await sleep(300); // advance well into the interior (the full sweep runs several seconds; see S5)
  const s16 = await evaluate(`(()=>{
    const playBefore=document.getElementById("scrub-play").textContent;
    const btnDisabled=document.getElementById("verso-turn").disabled;
    document.getElementById("verso-turn").click();
    return{playBefore,btnDisabled,playAfter:document.getElementById("scrub-play").textContent,
      val:Number(document.getElementById("scrub-range").value),
      flipped:document.getElementById("sheet").classList.contains("versoed"),
      btnText:document.getElementById("verso-turn").textContent};
  })()`);
  await sleep(200); // a leaked rAF would advance the year past the present in this window
  const s16after = await evaluate(`Number(document.getElementById("scrub-range").value)`);
  check("S16 flipping mid-Play pauses Play, parks at present, and never disables the Turn button", s16.playBefore === "Pause" && s16.btnDisabled === false && s16.playAfter === "Play" && s16.val === sm2.present && s16.flipped && s16.btnText === "Turn back" && s16after === sm2.present, JSON.stringify(s16) + ` settled=${s16after}`);

  // S17: turning back leaves the recto at the present (the scrubbed year is discarded by
  // design), and the next Play replays from the earliest founding (post-snap year===max, so
  // playScrub zeroes elapsed). S16 left us flipped, paused, parked.
  const s17back = await evaluate(`(()=>{
    document.getElementById("verso-turn").click();
    return{flipped:document.getElementById("sheet").classList.contains("versoed"),
      val:Number(document.getElementById("scrub-range").value),
      btnText:document.getElementById("verso-turn").textContent};
  })()`);
  await evaluate(`document.getElementById("scrub-play").click()`); // the next Play
  let s17min = Infinity;
  for (let i = 0; i < 6; i++) {
    const y = await evaluate(`Number(document.getElementById("scrub-range").value)`);
    if (y < s17min) s17min = y;
    await sleep(70);
  }
  await evaluate(`(()=>{const b=document.getElementById("scrub-play");if(b.textContent==="Pause")b.click();})()`);
  check("S17 turning back leaves the recto at the present; the next Play replays from the earliest founding", s17back.flipped === false && s17back.val === sm2.present && s17back.btnText === "Turn the sheet" && s17min < sm2.present, JSON.stringify(s17back) + ` playMin=${s17min} present=${sm2.present}`);

  // S18: a flip must NOT churn a Blob URL. renderVerso is the only place allowed to create
  // one (#116's ~1 MB-per-redraw leak); the snap writes display styles, never a new ghost.
  await ensureRecto();
  await sleep(60);
  await setYear(Math.floor((sm2.minFounded + sm2.present) / 2));
  const s18 = await evaluate(`(()=>{
    const ghost=document.querySelector(".verso-ghost");
    const before=ghost?ghost.getAttribute("src"):"(no-ghost)";
    const orig=URL.createObjectURL;let n=0;URL.createObjectURL=function(...a){n++;return orig.apply(this,a);};
    document.getElementById("verso-turn").click();
    URL.createObjectURL=orig;
    const g2=document.querySelector(".verso-ghost");
    return{before,after:g2?g2.getAttribute("src"):"(no-ghost)",created:n};
  })()`);
  check("S18 a flip snaps without churning a Blob URL (ghost src unchanged, createObjectURL uncalled)", s18.before !== "(no-ghost)" && s18.after === s18.before && s18.created === 0, JSON.stringify(s18));

  // S19: ticking chronicle ON while FLIPPED needs no special case -- applyScrub parks at the
  // present (its last line), so the recto agrees with the pristine ghost the instant it goes
  // on. Flip with chronicle OFF, then toggle it on.
  await ensureRecto();
  await sleep(60);
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}})()`);
  await evaluate(`document.getElementById("verso-turn").click()`); // flip with chronicle off
  const s19 = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const rows=[...document.querySelectorAll("#chronicle-strip li")];
    return{flipped:document.getElementById("sheet").classList.contains("versoed"),
      panelShown:!document.getElementById("scrubber").hidden,
      val:Number(document.getElementById("scrub-range").value),max:Number(document.getElementById("scrub-range").max),
      rows:rows.length,pastRows:rows.filter((li)=>li.classList.contains("past")).length};
  })()`);
  check("S19 ticking chronicle while flipped lands at the present with no special case (applyScrub parks)", s19.flipped && s19.panelShown && s19.val === s19.max && s19.rows > 0 && s19.pastRows === s19.rows, JSON.stringify(s19));

  // Restore to a clean, recto + chronicle-off state for the rest of the suite.
  await ensureRecto();
  await sleep(60);
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}})()`);

}
