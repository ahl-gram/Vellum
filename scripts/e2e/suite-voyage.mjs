// Wayfarer's Passage: the voyage overlay core (W1-W8, #119, epic #117). Toggle voyage on/off,
// step the ports via the deterministic window.__vellumVoyageStepTo hook (the analogue of the
// scrubber's slider, not rAF timing), the sibling-overlay invariant, chronicle mutual exclusion,
// and redraw re-arm. Establishes the clean seed-42 antique base the next two voyage suites
// inherit. Split from the old single suite-voyage.mjs; the W prefix spans all three voyage files.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, sleep } = ctx;

  await evaluate(`(()=>{
    document.getElementById("seed").value="42";
    document.getElementById("style").value="antique";
    document.getElementById("theme").value="";
    document.getElementById("type").value="";
    document.getElementById("arms").checked=false;
    document.getElementById("chronicle").checked=false;
    document.getElementById("voyage").checked=false;
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

  // W1: toggle voyage ON via the change handler (the real gesture). The overlay is
  // drawn in #map and the in-page plan starts at the capital (#275: the closed round
  // trip's leg count is an engine invariant proven by the frameAt/buildVoyagePlan
  // unit tests, so it is not re-derived here).
  const v1 = await evaluate(`(()=>{
    const chk=document.getElementById("voyage");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    return{hasOverlay:!!ov,ports:plan?plan.ports.length:0,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1};
  })()`);
  check("W1 voyage on: overlay drawn in #map, plan starts at the capital", v1.hasOverlay && v1.ports > 1 && v1.firstIdx === vm.capitalIdx, JSON.stringify(v1) + ` capital=${vm.capitalIdx}`);

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

  // W6: chronicle and voyage are mutually exclusive; turning chronicle on unchecks
  // voyage, removes its overlay, and shows the scrubber panel.
  const v6 = await evaluate(`(()=>{
    const chr=document.getElementById("chronicle");chr.checked=true;chr.dispatchEvent(new Event("change",{bubbles:true}));
    const voy=document.getElementById("voyage");
    const ov=document.querySelector("#map .voyage-overlay");
    const panel=document.getElementById("scrubber");
    return{voyageUnchecked:!voy.checked,overlayGone:!ov,panelShown:!panel.hidden};
  })()`);
  check("W6 chronicle and voyage are mutually exclusive (chronicle on removes the voyage)", v6.voyageUnchecked && v6.overlayGone && v6.panelShown, JSON.stringify(v6));
  await evaluate(`(()=>{const chr=document.getElementById("chronicle");chr.checked=false;chr.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  // W7: voyage OFF removes the overlay, clears #status, hides the margin log, and drops
  // the session. The panel is a sibling of #map, so it must be hidden explicitly.
  const v7 = await evaluate(`(()=>{
    const voy=document.getElementById("voyage");voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));
    window.__vellumVoyageStepTo(0);
    voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    return{overlayGone:!ov,status:document.getElementById("status").textContent,plan:window.__vellumVoyagePlan(),logHidden:document.getElementById("voyage-log").hidden,log:window.__vellumVoyageLog()};
  })()`);
  check("W7 voyage off: overlay removed, #status cleared, margin log hidden, session dropped",
    v7.overlayGone && v7.status === "" && v7.plan === null && v7.logHidden && v7.log === null, JSON.stringify(v7));

  // W8: a redraw with voyage ON re-arms against the NEW world, resting on the full
  // track (only an explicit toggle-on animates), starting at the new capital.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("voyage-redraw");
  const vm2 = await evaluate(`(()=>{const r=window.__vellumRunInline({kind:"draw",seed:100,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});const c=r.manifest.places.find((p)=>p.kind==="capital");return{capitalIdx:c?c.idx:-1};})()`);
  const v8 = await evaluate(`(()=>{
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const pts=ov?ov.querySelector(".voyage-track").getAttribute("points").trim().split(" ").length:0;
    return{hasOverlay:!!ov,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1,ports:plan?plan.ports.length:0,pts,
      logVisible:!!(log&&log.visible),logEntries:log?log.entries.length:0,logged:log?log.logged:-1,logAttr:log?log.attribution:""};
  })()`);
  // #121: the settle-path re-arm must thread the seed + subtitle, so the margin log rebuilds
  // for the NEW world with its real attribution (a bug here builds it with seed 0 and an
  // empty signature, invisible to a track-only check).
  // #275: the re-armed log carries the homecoming too, so entries = ports + 1.
  check("W8 redraw with voyage on re-arms the full resting track AND the new world's margin log",
    v8.hasOverlay && v8.firstIdx === vm2.capitalIdx && v8.ports > 1 && v8.pts > v8.ports &&
    v8.logVisible && v8.logEntries === v8.ports + 1 && v8.logged === v8.ports + 1 &&
    v8.logAttr.startsWith("Being a true"),
    JSON.stringify({ ...v8, logAttr: v8.logAttr.slice(0, 20) }) + ` capital=${vm2.capitalIdx}`);
}
