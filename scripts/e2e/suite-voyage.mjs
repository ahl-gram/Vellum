// Wayfarer's Passage voyage-overlay checks (W1-W8, #119, epic #117).
// The voyage sweep is rAF-animated, so like the scrubber suite this drives it
// through a DETERMINISTIC hook (window.__vellumVoyageStepTo, the analogue of the
// scrubber's slider) rather than sleeping on animation frames. A clean seed-42
// antique base (arms off, no theme, chronicle off) so the plan maps to a known
// manifest.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled } = ctx;

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
  // drawn in #map and the in-page plan starts at the capital (the open-path leg count
  // is an engine invariant proven by the frameAt/buildVoyagePlan unit tests).
  const v1 = await evaluate(`(()=>{
    const chk=document.getElementById("voyage");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    return{hasOverlay:!!ov,ports:plan?plan.ports.length:0,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1};
  })()`);
  check("W1 voyage on: overlay drawn in #map, plan starts at the capital", v1.hasOverlay && v1.ports > 1 && v1.firstIdx === vm.capitalIdx, JSON.stringify(v1) + ` capital=${vm.capitalIdx}`);

  // The plan's ports (idx + the v1 log line), read once for the step assertions.
  const plan = await evaluate(`(()=>{const p=window.__vellumVoyagePlan();return{ports:p.ports.map((x)=>({idx:x.idx,logLine:x.logLine})),legs:p.legs.length};})()`);
  const lastPort = plan.legs; // the last port's 0-based index == leg count
  const midPort = Math.max(1, Math.floor(plan.legs / 2));

  const stepTo = (n) =>
    evaluate(`(()=>{window.__vellumVoyageStepTo(${n});const t=document.querySelector(".voyage-ship").getAttribute("transform");const pts=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ").length;return{status:document.getElementById("status").textContent,tf:t,pts};})()`);

  // W2: step to the origin -> the departure log line shows.
  const s0 = await stepTo(0);
  check("W2 step to the capital: the departure log line shows in #status", s0.status === plan.ports[0].logLine, `"${s0.status}" vs "${plan.ports[0].logLine}"`);

  // W3: step to a mid port -> its log line shows, the track has grown, the ship moved.
  const sMid = await stepTo(midPort);
  check("W3 step to a mid port: its log line shows, the track grew, the ship moved", sMid.status === plan.ports[midPort].logLine && sMid.pts > s0.pts && sMid.tf !== s0.tf, JSON.stringify({ mid: midPort, sMid, s0pts: s0.pts }));

  // W4: step to the last port -> its line shows and the full track (every port) rests.
  const sLast = await stepTo(lastPort);
  check("W4 step to the last port: its line shows and the full track rests (every port drawn)", sLast.status === plan.ports[lastPort].logLine && sLast.pts === plan.ports.length, JSON.stringify({ last: lastPort, sLast, ports: plan.ports.length }));

  // Artifact: a mid-sweep frame (track + ship) for the user to eyeball.
  await stepTo(midPort);
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

  // W7: voyage OFF removes the overlay, clears the log line, and drops the session.
  const v7 = await evaluate(`(()=>{
    const voy=document.getElementById("voyage");voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));
    window.__vellumVoyageStepTo(0);
    voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));
    const ov=document.querySelector("#map .voyage-overlay");
    return{overlayGone:!ov,status:document.getElementById("status").textContent,plan:window.__vellumVoyagePlan()};
  })()`);
  check("W7 voyage off: overlay removed, log line cleared, session dropped", v7.overlayGone && v7.status === "" && v7.plan === null, JSON.stringify(v7));

  // W8: a redraw with voyage ON re-arms against the NEW world, resting on the full
  // track (only an explicit toggle-on animates), starting at the new capital.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("voyage-redraw");
  const vm2 = await evaluate(`(()=>{const r=window.__vellumRunInline({kind:"draw",seed:100,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});const c=r.manifest.places.find((p)=>p.kind==="capital");return{capitalIdx:c?c.idx:-1};})()`);
  const v8 = await evaluate(`(()=>{
    const ov=document.querySelector("#map .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    const pts=ov?ov.querySelector(".voyage-track").getAttribute("points").trim().split(" ").length:0;
    return{hasOverlay:!!ov,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1,ports:plan?plan.ports.length:0,pts};
  })()`);
  check("W8 redraw with voyage on re-arms to the new world's full resting track", v8.hasOverlay && v8.firstIdx === vm2.capitalIdx && v8.ports > 1 && v8.pts === v8.ports, JSON.stringify(v8) + ` capital=${vm2.capitalIdx}`);

  // Restore a clean, voyage-off state for the rest of the suite.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}})()`);
}
