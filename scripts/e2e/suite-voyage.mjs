// Wayfarer's Passage: the voyage overlay core (W1-W8, #119, epic #117; driven through the
// fused ages instrument since #220). Arm the instrument, cross the seam both ways (with the
// hard detent under a real CDP drag), step the ports via the deterministic
// window.__vellumVoyageStepTo hook (not rAF timing), the sibling-overlay invariant, and
// redraw re-arm. Establishes the clean seed-42 antique base the next two voyage suites
// inherit. Split from the old single suite-voyage.mjs; the W prefix spans all three voyage files.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, sleep, send } = ctx;

  await evaluate(`(()=>{
    document.getElementById("seed").value="42";
    document.getElementById("style").value="antique";
    document.getElementById("theme").value="";
    document.getElementById("type").value="";
    document.getElementById("arms").checked=false;
    document.getElementById("ages").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("voyage-base-draw");

  // Voyage facts from the page's OWN engine: the capital's index (the survey's home
  // port) and how many places the manifest carries.
  const vm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    const capital=places.find((p)=>p.kind==="capital");
    return {capitalIdx:capital?capital.idx:-1,count:places.length};
  })()`);

  // W1: toggle the ages instrument ON via the change handler (the real gesture, #220).
  // The arm PARKS at the present: the voyage overlay is built in #map (hidden while the
  // ages chamber holds the sheet), the plan starts at the capital (#275: the closed
  // round trip's leg count is an engine invariant proven by the frameAt/buildVoyagePlan
  // unit tests, so it is not re-derived here), and the journal's annal rows all rest
  // inked (the story fully told at the present park).
  const v1 = await evaluate(`(()=>{
    const chk=document.getElementById("ages");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    const a=window.__vellumAgesState();
    const annals=[...document.querySelectorAll("#chronicle-strip li:not(.prologue)")];
    return{hasOverlay:!!ov,ports:plan?plan.ports.length:0,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1,
      chamber:a?a.chamber:"",year:a?a.year:-1,max:a?a.max:-2,
      annals:annals.length,annalsInked:annals.filter((li)=>li.classList.contains("inked")).length};
  })()`);
  check("W1 ages on: overlay built, plan starts at the capital, parked at the present, annals told",
    v1.hasOverlay && v1.ports > 1 && v1.firstIdx === vm.capitalIdx &&
    v1.chamber === "ages" && v1.year === v1.max && v1.annals > 0 && v1.annalsInked === v1.annals,
    JSON.stringify(v1) + ` capital=${vm.capitalIdx}`);

  // W1b (#220): crossing the seam LEFTWARD. Driving the bar to its midpoint enters the
  // survey chamber at its rest (t=1, the ratified bare-survey pose): the track shows,
  // the readout flips to the word, and the annals dim back to untold.
  const v1b = await evaluate(`(()=>{
    const s=document.getElementById("scrub-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector("#map .voyage-overlay");
    const annals=[...document.querySelectorAll("#chronicle-strip li:not(.prologue)")];
    return{chamber:a?a.chamber:"",t:a?a.t:-1,readout:document.getElementById("scrub-year").textContent,
      overlayVisible:!!ov&&ov.style.display!=="none",
      annalsInked:annals.filter((li)=>li.classList.contains("inked")).length};
  })()`);
  check("W1b the seam crossed leftward: survey chamber at t=1, track shown, word readout, annals dim",
    v1b.chamber === "survey" && v1b.t === 1 && v1b.readout === "the survey" &&
    v1b.overlayVisible && v1b.annalsInked === 0,
    JSON.stringify(v1b));

  // The plan's ports (idx + the v1 log line), read once for the step assertions.
  const plan = await evaluate(`(()=>{const p=window.__vellumVoyagePlan();return{ports:p.ports.map((x)=>({idx:x.idx,logLine:x.logLine})),legs:p.legs.length};})()`);
  // #275: legs === ports now, and the LAST leg is the one home. So the step index that
  // lands on the final distinct port is legs - 1, and stepping to legs itself is the
  // HOMECOMING (t = 1). Under the open path those were the same step.
  const lastPort = plan.legs - 1;
  const homeStep = plan.legs;
  const midPort = Math.max(1, Math.floor(plan.legs / 2));
  const entries = plan.ports.length + 1; // one per port, plus the homecoming

  // #120: the mark is a ship on sea legs and a rider on road/straight legs, so select
  // whichever is currently displayed. Reading .voyage-ship unconditionally throws on the
  // ~94% of legs that ride.
  const markFn = `const mark=()=>{const s=document.querySelector("#map .voyage-ship");const r=document.querySelector("#map .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};`;
  // #121: the per-port log no longer streams into #status; it accumulates in the margin
  // log panel. stepTo reads how many rows have brightened (logged) and the newest one's
  // text via the read hook, alongside the track/mark state.
  // #275: `first`/`last` are the track polyline's end vertices, so a resting round trip
  // can be checked for being a CLOSED CIRCUIT (they must be string-identical: the closing
  // leg ends on the very projection of the capital that leg 0 started from).
  const stepTo = (n) =>
    evaluate(`(()=>{${markFn}window.__vellumVoyageStepTo(${n});const m=mark();const t=m?m.getAttribute("transform"):"";const glyph=m?m.getAttribute("class"):"";const raw=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ");const log=window.__vellumVoyageLog();return{status:document.getElementById("status").textContent,tf:t,glyph,pts:raw.length,first:raw[0],last:raw[raw.length-1],logged:log?log.logged:-1,rows:log?log.rows:-1,visible:!!(log&&log.visible),lastText:log&&log.logged>0?log.entries[log.logged-1].text:""};})()`);

  // W2: step to the origin -> the panel shows one row per port, the first brightened, and
  // it reads as a departure (the surveyor sets out, does not arrive).
  const s0 = await stepTo(0);
  check("W2 step to the capital: the margin log opens with the departure entry",
    s0.visible && s0.rows === entries && s0.logged === 1 && s0.lastText.includes("set out"),
    JSON.stringify({ s0, ports: plan.ports.length, entries }));

  // W3: step to a mid port -> that many entries have brightened, the track grew, the mark moved.
  const sMid = await stepTo(midPort);
  check("W3 step to a mid port: the log accumulated to that port, the track grew, the mark moved",
    sMid.logged === midPort + 1 && sMid.pts > s0.pts && sMid.tf !== s0.tf,
    JSON.stringify({ mid: midPort, sMid, s0pts: s0.pts }));

  // W4: step to the last PORT -> every port's entry has brightened, but the survey is not
  // finished: it still has to sail home, so the homecoming row is still dim and the one
  // #status summary has NOT been posted. This is the direct guard on #275's completion
  // check: comparing `arrived` against ports.length instead of the log's entry count posts
  // the summary here, a whole leg early, and then again at the homecoming.
  const sLast = await stepTo(lastPort);
  // #120: legs are routed polylines now, so the resting track has strictly MORE vertices
  // than it has ports. Under v1 this was an equality.
  check("W4 step to the last port: every port is logged, but the survey has not come home yet",
    sLast.logged === plan.ports.length && sLast.logged < entries && sLast.status === "" &&
    sLast.pts > plan.ports.length,
    JSON.stringify({ last: lastPort, sLast, ports: plan.ports.length, entries }));

  // W4c (#275): step home -> the homecoming row brightens last, it reads as a return to
  // the capital, the single completion summary posts, and the resting track is a CLOSED
  // CIRCUIT: its last vertex is the very same projected point its first vertex is.
  const sHome = await stepTo(homeStep);
  check("W4c the survey sails home: the homecoming closes the log and the track is a closed circuit",
    sHome.logged === entries && sHome.lastText.includes("whence we set out") &&
    sHome.status.startsWith("The survey is charted") && sHome.first === sHome.last &&
    sHome.pts > sLast.pts,
    JSON.stringify({ home: homeStep, sHome, entries }));

  // W4b: stepping BACK from the finished survey clears the completion summary. The
  // deterministic hooks can move the survey backward to a mid rest, and #status must return
  // to "" there (never a stale "The survey is charted..."), so the settle invariant that
  // waitSettled and the draw settle both key on holds at every resting frame, not just t=1.
  const sBack = await stepTo(midPort);
  check("W4b stepping back from the last port clears the completion summary from #status",
    sBack.status === "" && sBack.logged === midPort + 1, JSON.stringify(sBack));
  // Artifact: a mid-sweep frame (track + ship) for the user to eyeball.
  await shoot("explorer-voyage.png");

  // W5: the track lives in a SIBLING overlay <svg>, never inside the baked chart, so
  // Download SVG (the pristine lastSvg string) can never contain it.
  const v5 = await evaluate(`(()=>{
    const chart=document.querySelector("#map svg:not(.voyage-overlay)");
    const overlay=document.querySelector("#map .voyage-overlay");
    return{chart:!!chart,trackInChart:chart?!!chart.querySelector(".voyage-track"):false,trackInOverlay:overlay?!!overlay.querySelector(".voyage-track"):false};
  })()`);
  check("W5 the track is a sibling overlay, never inside the baked chart (Download stays clean)", v5.chart && !v5.trackInChart && v5.trackInOverlay, JSON.stringify(v5));

  // W6 (#220): crossing the seam RIGHTWARD by keyboard. The bar rests at the seam from
  // W1b; one discrete step into the ages half crosses freely (the detent governs
  // pointer drags only): the world jumps back to the earliest years, the surveyor's
  // ink leaves the sheet, and the readout flips to the year.
  const glyphCount = `const shown=[...document.querySelectorAll("#map #layer-settlements g.settlement")].filter((g)=>g.style.display!=="none").length;`;
  const present = await evaluate(`(()=>{${glyphCount}return shown;})()`);
  const v6 = await evaluate(`(()=>{
    const s=document.getElementById("scrub-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    s.value=String(Number(s.max)/2+1);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector("#map .voyage-overlay");
    ${glyphCount}
    return{chamber:a?a.chamber:"",year:a?a.year:-1,min:a?a.min:-2,
      readout:document.getElementById("scrub-year").textContent,
      overlayHidden:!!ov&&ov.style.display==="none",shown,panelShown:!document.getElementById("scrubber").hidden};
  })()`);
  check("W6 the seam crossed rightward: ages chamber at the first years, track gone, year readout",
    v6.chamber === "ages" && v6.year === v6.min + 1 && /^year \d+$/.test(v6.readout) &&
    v6.overlayHidden && v6.shown < present && v6.panelShown,
    JSON.stringify(v6) + ` present=${present}`);

  // W6b (#220): the crossing is REVERSIBLE. Stepping back to the seam restores the
  // survey chamber exactly: the full present world, the resting track, the word.
  const v6b = await evaluate(`(()=>{
    const s=document.getElementById("scrub-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector("#map .voyage-overlay");
    ${glyphCount}
    return{chamber:a?a.chamber:"",t:a?a.t:-1,readout:document.getElementById("scrub-year").textContent,
      overlayVisible:!!ov&&ov.style.display!=="none",shown};
  })()`);
  check("W6b the crossing reverses: back at the seam the survey chamber restores the present world",
    v6b.chamber === "survey" && v6b.t === 1 && v6b.readout === "the survey" &&
    v6b.overlayVisible && v6b.shown === present,
    JSON.stringify(v6b) + ` present=${present}`);

  // W6c (#220): the HARD DETENT under a real CDP drag. A pointer drag from inside the
  // survey half that crosses the seam by less than the escape band HOLDS at the seam;
  // pulled past the band, it releases into the ages chamber at the raw position.
  await evaluate(`(()=>{document.getElementById("scrub-range").scrollIntoView({block:"center"});})()`);
  const bar = await evaluate(`(()=>{const s=document.getElementById("scrub-range");const r=s.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})()`);
  const TH = 16; // the .ages-range thumb width (living-chart.css)
  const xAt = (u) => Math.round(bar.x + TH / 2 + u * (bar.w - TH));
  const yMid = Math.round(bar.y + bar.h / 2);
  // The moves carry button:"left" DELIBERATELY: d3 drags work without it (suite-hunt's
  // shape), but Chromium's native slider drag controller ignores a move whose button
  // is "none", so the thumb never follows and the detent has nothing to hold.
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: xAt(0.4), y: yMid, button: "left", buttons: 1, clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: xAt(0.52), y: yMid, button: "left", buttons: 1 });
  const held = await evaluate(`(()=>{const a=window.__vellumAgesState();return{u:a.u,held:a.held,chamber:a.chamber,readout:document.getElementById("scrub-year").textContent};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: xAt(0.6), y: yMid, button: "left", buttons: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: xAt(0.6), y: yMid, button: "left", buttons: 0, clickCount: 1 });
  const escaped = await evaluate(`(()=>{const a=window.__vellumAgesState();return{u:a.u,held:a.held,chamber:a.chamber};})()`);
  check("W6c the hard detent: a drag holds at the seam inside the band and releases past it",
    held.held === true && held.u === 0.5 && held.chamber === "survey" && held.readout === "the survey" &&
    escaped.held === false && escaped.chamber === "ages" && escaped.u > 0.55,
    JSON.stringify({ held, escaped }));

  // W6d (#220): a running PLAY crosses the seam WITHOUT pausing (the detent governs
  // drags only). Start just shy of the survey's end so the crossing lands within a
  // couple of seconds, then watch the chamber flip while the button stays "Pause".
  await evaluate(`(()=>{
    const s=document.getElementById("scrub-range");
    s.value=String(Math.round(Number(s.max)/2*0.97));
    s.dispatchEvent(new Event("input",{bubbles:true}));
    document.getElementById("scrub-play").click();
  })()`);
  let sawSurveyPlaying = false, crossed = null;
  for (let i = 0; i < 60; i++) {
    const st = await evaluate(`(()=>{const a=window.__vellumAgesState();return{chamber:a.chamber,playing:a.playing,lbl:document.getElementById("scrub-play").textContent};})()`);
    if (st.chamber === "survey" && st.playing) sawSurveyPlaying = true;
    if (st.chamber === "ages") { crossed = st; break; }
    await sleep(100);
  }
  await evaluate(`(()=>{const b=document.getElementById("scrub-play");if(b.textContent==="Pause")b.click();})()`);
  check("W6d Play sweeps through the seam without pausing: the voice hands off mid-flight",
    sawSurveyPlaying && !!crossed && crossed.playing === true && crossed.lbl === "Pause",
    JSON.stringify({ sawSurveyPlaying, crossed }));

  // W7: ages OFF removes the overlay, clears #status, hides the instrument panel with
  // its journal, and drops both sessions. The panel is a sibling of #map, so it must
  // be hidden explicitly.
  const v7 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(0);
    const chk=document.getElementById("ages");chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    return{overlayGone:!ov,status:document.getElementById("status").textContent,plan:window.__vellumVoyagePlan(),logHidden:document.getElementById("scrubber").hidden,log:window.__vellumVoyageLog(),ages:window.__vellumAgesState()};
  })()`);
  check("W7 ages off: overlay removed, #status cleared, journal hidden, sessions dropped",
    v7.overlayGone && v7.status === "" && v7.plan === null && v7.logHidden && v7.log === null && v7.ages === null, JSON.stringify(v7));

  // W8: a redraw with the instrument ON re-arms against the NEW world in the SAME
  // chamber (the survey chamber here, resting on the full track; only an explicit
  // Play animates), starting at the new capital.
  await evaluate(`(()=>{
    const chk=document.getElementById("ages");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const s=document.getElementById("scrub-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
  })()`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("voyage-redraw");
  const vm2 = await evaluate(`(()=>{const r=window.__vellumRunInline({kind:"draw",seed:100,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});const c=r.manifest.places.find((p)=>p.kind==="capital");return{capitalIdx:c?c.idx:-1};})()`);
  const v8 = await evaluate(`(()=>{
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const a=window.__vellumAgesState();
    const pts=ov?ov.querySelector(".voyage-track").getAttribute("points").trim().split(" ").length:0;
    return{hasOverlay:!!ov,overlayVisible:!!ov&&ov.style.display!=="none",chamber:a?a.chamber:"",
      firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1,ports:plan?plan.ports.length:0,pts,
      logVisible:!!(log&&log.visible),logEntries:log?log.entries.length:0,logged:log?log.logged:-1,logAttr:log?log.attribution:""};
  })()`);
  // #121: the settle-path re-arm must thread the seed + subtitle, so the margin log rebuilds
  // for the NEW world with its real attribution (a bug here builds it with seed 0 and an
  // empty signature, invisible to a track-only check).
  // #275: the re-armed log carries the homecoming too, so entries = ports + 1.
  // #220: the re-arm keeps the CHAMBER the reader was in (the survey chamber here), so
  // the new world's track rests visible rather than yanking the reader to the present.
  check("W8 redraw with ages on re-arms the new world's full resting track in the SAME chamber",
    v8.hasOverlay && v8.overlayVisible && v8.chamber === "survey" &&
    v8.firstIdx === vm2.capitalIdx && v8.ports > 1 && v8.pts > v8.ports &&
    v8.logVisible && v8.logEntries === v8.ports + 1 && v8.logged === v8.ports + 1 &&
    v8.logAttr.startsWith("Being a true"),
    JSON.stringify({ ...v8, logAttr: v8.logAttr.slice(0, 20) }) + ` capital=${vm2.capitalIdx}`);
}
