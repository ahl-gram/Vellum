// Chronicle year-scrubber checks (S1-S10, #54).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  // --- S: Chronicle year-scrubber (#54): the client-only DOM overlay that
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

  // Scrub facts from the page's OWN engine: range, the present year, an early and
  // a late founding, and the ruin's abandonment year (or present, if its event
  // was sliced off the 14-event chronicle).
  const sm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places,events=r.manifest.events,present=r.manifest.presentYear;
    const minFounded=Math.min(...places.map((p)=>p.founded));
    const earlyIdx=places.findIndex((p)=>p.founded===minFounded);
    let lateIdx=-1,lateFounded=-1;
    places.forEach((p,i)=>{if(p.founded>minFounded&&p.founded>lateFounded){lateFounded=p.founded;lateIdx=i;}});
    const ruinIdx=places.findIndex((p)=>p.ruined);
    const ruinEv=ruinIdx>=0?events.find((e)=>e.settlement===ruinIdx&&e.kind==="ruin"):null;
    const ruinYear=ruinIdx>=0?(ruinEv?ruinEv.year:present):null;
    const ruinFounded=ruinIdx>=0?places[ruinIdx].founded:null;
    return{count:places.length,present,minFounded,earlyIdx,lateIdx,ruinIdx,ruinYear,ruinFounded};
  })()`);

  const setYear = (y) =>
    evaluate(`(()=>{const s=document.getElementById("scrub-range");s.value="${y}";s.dispatchEvent(new Event("input",{bubbles:true}));return Number(s.value);})()`);
  const stateOf = (idx) =>
    evaluate(`(document.querySelector('.place-hit[data-idx="${idx}"]')||{}).dataset?document.querySelector('.place-hit[data-idx="${idx}"]').dataset.state:null`);

  // S1: toggle chronicle ON via the change handler (the real gesture).
  const s1 = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const roads=document.querySelector("#map #layer-roads");
    const slider=document.getElementById("scrub-range");
    const dots=document.querySelectorAll('.place-overlay.scrub .place-hit[data-state="living"], .place-overlay.scrub .place-hit[data-state="ruin"]').length;
    return{panelShown:!panel.hidden,scrubClass:ov?ov.classList.contains("scrub"):false,setHidden:set?getComputedStyle(set).display:"(no-el)",roadsHidden:roads?getComputedStyle(roads).display:"(no-el)",min:Number(slider.min),max:Number(slider.max),val:Number(slider.value),dots};
  })()`);
  check("S1 chronicle on: panel shown, baked layers hidden, slider spans founding..present", s1.panelShown && s1.scrubClass && s1.setHidden === "none" && s1.roadsHidden === "none" && s1.min === sm.minFounded && s1.max === sm.present && s1.val === sm.present, JSON.stringify(s1));
  check("S2 parked at the present year: every place shows a dot", s1.dots === sm.count, `${s1.dots} dots vs ${sm.count} places`);

  // S3: scrub to the earliest founding — the first town is up, a later one is not.
  await setYear(sm.minFounded);
  const s3early = await stateOf(sm.earlyIdx);
  const s3late = sm.lateIdx >= 0 ? await stateOf(sm.lateIdx) : "hidden";
  check("S3 scrub to earliest founding: first town living, a later town still hidden", s3early === "living" && s3late === "hidden", `early=${s3early} late=${s3late}`);

  // S4: the ruin reads living between founding and abandonment, ruin once past it.
  if (sm.ruinIdx >= 0) {
    await setYear(Math.floor((sm.ruinFounded + sm.ruinYear) / 2));
    const before = await stateOf(sm.ruinIdx);
    await setYear(sm.ruinYear);
    const after = await stateOf(sm.ruinIdx);
    check("S4 the ruin is living before its abandonment year, a ruin in it", before === "living" && after === "ruin", `before=${before} after=${after} ruinYear=${sm.ruinYear}`);
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

  // S7: chronicle OFF restores the baked layers and idle parity (hits clickable).
  const s7 = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const roads=document.querySelector("#map #layer-roads");
    const hit=document.querySelector(".place-hit");
    return{panelHidden:panel.hidden,noScrub:ov?!ov.classList.contains("scrub"):true,setVis:set?getComputedStyle(set).display:"(no-el)",roadsVis:roads?getComputedStyle(roads).display:"(no-el)",hitPe:hit?getComputedStyle(hit).pointerEvents:"(no-el)"};
  })()`);
  check("S7 chronicle off: panel hidden, baked layers restored, hits interactive again", s7.panelHidden && s7.noScrub && s7.setVis !== "none" && s7.roadsVis !== "none" && s7.hitPe === "auto", JSON.stringify(s7));

  // S8: a redraw with chronicle ON re-applies the scrubber to the NEW world
  // (fresh manifest, range, and hidden layers) — the cross-rebuild hazard.
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("scrub-redraw");
  const sm2 = await evaluate(`(()=>{const r=window.__vellumRunInline({kind:"draw",seed:100,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});const places=r.manifest.places;return{present:r.manifest.presentYear,count:places.length,minFounded:Math.min(...places.map((p)=>p.founded))};})()`);
  const s8 = await evaluate(`(()=>{
    const panel=document.getElementById("scrubber");
    const ov=document.querySelector("#map .place-overlay");
    const set=document.querySelector("#map #layer-settlements");
    const slider=document.getElementById("scrub-range");
    const dots=document.querySelectorAll('.place-overlay.scrub .place-hit[data-state="living"], .place-overlay.scrub .place-hit[data-state="ruin"]').length;
    return{panelShown:!panel.hidden,scrubClass:ov?ov.classList.contains("scrub"):false,setHidden:set?getComputedStyle(set).display:"(no-el)",max:Number(slider.max),dots};
  })()`);
  check("S8 redraw with chronicle on re-applies the scrubber to the new world", s8.panelShown && s8.scrubClass && s8.setHidden === "none" && s8.max === sm2.present && s8.dots === sm2.count, JSON.stringify(s8));

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

  // Restore to a clean, chronicle-off state for the rest of the suite.
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}})()`);

}
