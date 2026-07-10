// Wayfarer's Passage voyage-overlay checks (W1-W8, #119, epic #117) and the voyage x
// verso bleed-through (W9-W16, #174). The W prefix owns both: the verso checks (V*) live
// in suite-explorer-core.mjs, which runs BEFORE this suite and ends un-flipped with no
// voyage standing, while everything below needs a live voyage session.
// The voyage sweep is rAF-animated, so like the scrubber suite this drives it
// through a DETERMINISTIC hook (window.__vellumVoyageStepTo, the analogue of the
// scrubber's slider) rather than sleeping on animation frames. A clean seed-42
// antique base (arms off, no theme, chronicle off) so the plan maps to a known
// manifest.
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

  // #120: the mark is a ship on sea legs and a rider on road/straight legs, so select
  // whichever is currently displayed. Reading .voyage-ship unconditionally throws on the
  // ~94% of legs that ride.
  const markFn = `const mark=()=>{const s=document.querySelector("#map .voyage-ship");const r=document.querySelector("#map .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};`;
  const stepTo = (n) =>
    evaluate(`(()=>{${markFn}window.__vellumVoyageStepTo(${n});const m=mark();const t=m?m.getAttribute("transform"):"";const glyph=m?m.getAttribute("class"):"";const pts=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ").length;return{status:document.getElementById("status").textContent,tf:t,glyph,pts};})()`);

  // W2: step to the origin -> the departure log line shows.
  const s0 = await stepTo(0);
  check("W2 step to the capital: the departure log line shows in #status", s0.status === plan.ports[0].logLine, `"${s0.status}" vs "${plan.ports[0].logLine}"`);

  // W3: step to a mid port -> its log line shows, the track has grown, the ship moved.
  const sMid = await stepTo(midPort);
  check("W3 step to a mid port: its log line shows, the track grew, the ship moved", sMid.status === plan.ports[midPort].logLine && sMid.pts > s0.pts && sMid.tf !== s0.tf, JSON.stringify({ mid: midPort, sMid, s0pts: s0.pts }));

  // W4: step to the last port -> its line shows and the full track (every port) rests.
  const sLast = await stepTo(lastPort);
  // #120: legs are routed polylines now, so the resting track has strictly MORE vertices
  // than it has ports. Under v1 this was an equality.
  check("W4 step to the last port: its line shows and the full routed track rests", sLast.status === plan.ports[lastPort].logLine && sLast.pts > plan.ports.length, JSON.stringify({ last: lastPort, sLast, ports: plan.ports.length }));

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
  check("W8 redraw with voyage on re-arms to the new world's full resting track", v8.hasOverlay && v8.firstIdx === vm2.capitalIdx && v8.ports > 1 && v8.pts > v8.ports, JSON.stringify(v8) + ` capital=${vm2.capitalIdx}`);

  // ---------------------------------------------------------------------------
  // #174 The surveyor's ink bleeds through. The verso ghost is a Blob of the worker's
  // chart STRING, so a client overlay (the track) has no path onto the back face. These
  // checks own the voyage x verso interaction: the track bleeds, the ship does not, and
  // the flip never leaves a 12 second sweep running behind a hidden face.
  //
  // Every read below is null-safe on purpose: a missing .verso-track must report a clean
  // FAIL, not throw inside evaluate() and surface as a HARNESS ERROR.
  const cntFn = `const cnt=(el)=>el&&el.getAttribute("points")?el.getAttribute("points").trim().split(" ").length:0;`;

  // W9: a flip mid-sweep SNAPS the voyage to its resting track, then turns. The button is
  // never disabled by a running sweep (a 12s dead control reads as a bug), and the snap
  // fires paintFrame's shownArrived diff exactly once, so #status posts ONLY the final
  // port's line, not a burst of every port the snap skipped over.
  const w9 = await evaluate(`(()=>{
    ${cntFn}
    const voy=document.getElementById("voyage");
    // Re-toggle so a sweep is genuinely running from t=0 (an explicit toggle-on animates).
    voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));
    voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));
    const plan=window.__vellumVoyagePlan();
    const btn=document.getElementById("verso-turn");
    const statusEl=document.getElementById("status");
    const midPts=cnt(document.querySelector("#map .voyage-track"));
    const midStatus=statusEl.textContent;
    const disabledMidSweep=btn.disabled;
    // COUNT the writes to #status across the snap, do not just read its end state:
    // textContent retains only the last value, so a burst posting every port the snap
    // skipped, ending on the final line, would be indistinguishable from the single post
    // decision 2 requires. Each textContent assignment is exactly one childList record.
    const obs=new MutationObserver(()=>{});
    obs.observe(statusEl,{childList:true,characterData:true,subtree:true});
    btn.click();
    const statusWrites=obs.takeRecords().length;
    obs.disconnect();
    return{
      ports:plan?plan.ports.length:0,
      firstLine:plan&&plan.ports[0]?plan.ports[0].logLine:"",
      finalLine:plan&&plan.ports.length?plan.ports[plan.ports.length-1].logLine:"",
      midPts,midStatus,disabledMidSweep,statusWrites,
      restPts:cnt(document.querySelector("#map .voyage-track")),
      status:statusEl.textContent,
      versoed:document.getElementById("sheet").classList.contains("versoed"),
      label:btn.textContent,
    };
  })()`);
  check("W9 a flip mid-sweep snaps the voyage to rest and turns; a running sweep never disables the button",
    w9.disabledMidSweep === false && w9.ports > 2 && w9.midPts === 1 && w9.midStatus === w9.firstLine &&
    w9.restPts > w9.ports && w9.status === w9.finalLine && w9.versoed && w9.label === "Turn back",
    JSON.stringify(w9));
  check("W9b the snap posts ONLY the final port's line: exactly one write to #status, not a burst",
    w9.statusWrites === 1 && w9.status === w9.finalLine, JSON.stringify({ writes: w9.statusWrites, status: w9.status }));

  await sleep(1400); // let the 1200ms flip land, so W10 and its screenshot read the end state

  // W10: the resting track bleeds through, mirrored and registered on the ghost's box, and
  // the ship does NOT (it is the survey, not ink the surveyor laid on the sheet).
  const w10 = await evaluate(`(()=>{
    const verso=document.getElementById("verso");
    const layer=verso.querySelector(".verso-track-layer");
    const vTrack=verso.querySelector(".verso-track");
    const rTrack=document.querySelector("#map .voyage-track");
    const ghost=verso.querySelector(".verso-ghost");
    const box=(el)=>{const r=el.getBoundingClientRect();return[r.left,r.top,r.width,r.height];};
    const near=(a,b)=>!!a&&!!b&&a.every((v,i)=>Math.abs(v-b[i])<1.5);
    return{
      present:!!vTrack,
      samePoints: vTrack&&rTrack ? vTrack.getAttribute("points")===rTrack.getAttribute("points") : false,
      shipOnVerso:!!verso.querySelector(".voyage-ship,.voyage-rider"),
      shipOnRecto:!!document.querySelector("#map .voyage-ship,#map .voyage-rider"),
      mirrored: layer?getComputedStyle(layer).transform:"",
      registered: near(ghost?box(ghost):null, layer?box(layer):null),
      opacity: layer?Number(getComputedStyle(layer).opacity):1,
    };
  })()`);
  check("W10 the resting track bleeds through the verso, mirrored and registered on the ghost; the mark (ship or rider) does not",
    w10.present && w10.samePoints && !w10.shipOnVerso && w10.shipOnRecto &&
    w10.mirrored.startsWith("matrix(-1") && w10.registered && w10.opacity > 0 && w10.opacity < 1,
    JSON.stringify(w10));

  // Artifact: the back of the sheet with the survey bled through, for the user to eyeball.
  await shoot("explorer-verso-voyage.png");

  // W11: ticking voyage while FLIPPED paints the resting track on both faces and runs no
  // sweep (the sweep is a recto ceremony). Following app.js's precedent that a style change
  // while flipped rebuilds in place rather than turning.
  const w11 = await evaluate(`(()=>{
    ${cntFn}
    const verso=document.getElementById("verso");
    const voy=document.getElementById("voyage");
    voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));
    voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));
    const plan=window.__vellumVoyagePlan();
    return{
      flipped:document.getElementById("sheet").classList.contains("versoed"),
      ports:plan?plan.ports.length:0,
      finalLine:plan&&plan.ports.length?plan.ports[plan.ports.length-1].logLine:"",
      rectoPts:cnt(document.querySelector("#map .voyage-track")),
      versoPts:cnt(verso.querySelector(".verso-track")),
      status:document.getElementById("status").textContent,
    };
  })()`);
  check("W11 ticking voyage while flipped rests on the full track on both faces and runs no sweep",
    w11.flipped && w11.ports > 2 && w11.rectoPts === w11.versoPts && w11.rectoPts > w11.ports &&
    w11.status === w11.finalLine, JSON.stringify(w11));

  // W12: a redraw while flipped and voyaging re-arms BOTH faces, silently. renderVerso's
  // replaceChildren wipes the verso track on every draw (the same lifecycle trap as #map's
  // innerHTML wipe), so the re-arm must repaint it; and it must stay out of #status,
  // because the draw's settle signal AND waitSettled both key on #status === "".
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("voyage-verso-redraw"); // hangs if the re-arm posts a log line
  const w12 = await evaluate(`(()=>{
    ${cntFn}
    const verso=document.getElementById("verso");
    const plan=window.__vellumVoyagePlan();
    const vTrack=verso.querySelector(".verso-track");
    const rTrack=document.querySelector("#map .voyage-track");
    return{
      versoed:document.getElementById("sheet").classList.contains("versoed"),
      ports:plan?plan.ports.length:0,
      rectoPts:cnt(rTrack), versoPts:cnt(vTrack),
      samePoints: vTrack&&rTrack ? vTrack.getAttribute("points")===rTrack.getAttribute("points") : false,
      status:document.getElementById("status").textContent,
      docket:(verso.querySelector(".verso-docket")||{textContent:""}).textContent,
    };
  })()`);
  check("W12 a redraw while flipped and voyaging re-arms both faces silently (the verso track survives replaceChildren)",
    w12.versoed && w12.ports > 2 && w12.rectoPts === w12.versoPts && w12.rectoPts > w12.ports &&
    w12.samePoints && w12.status === "" && w12.docket.startsWith("CHART № 42 · "),
    JSON.stringify({ ...w12, docket: w12.docket.slice(0, 24) }));

  // W13: voyage OFF removes the track from BOTH faces (asserting it was on both first, so
  // the check cannot pass vacuously against a verso that never had a track).
  const w13 = await evaluate(`(()=>{
    const verso=document.getElementById("verso");
    const before={recto:!!document.querySelector("#map .voyage-overlay"),verso:!!verso.querySelector(".verso-track")};
    const voy=document.getElementById("voyage");voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));
    return{before,
      recto:!!document.querySelector("#map .voyage-overlay"),
      verso:!!verso.querySelector(".verso-track"),
      layer:!!verso.querySelector(".verso-track-layer"),
      status:document.getElementById("status").textContent,
      plan:window.__vellumVoyagePlan()};
  })()`);
  check("W13 voyage off removes the track from both faces",
    w13.before.recto && w13.before.verso && !w13.recto && !w13.verso && !w13.layer &&
    w13.status === "" && w13.plan === null, JSON.stringify(w13));

  // W14: the verso track is a polyline fed a points string, NEVER a rebuilt ghost Blob
  // (#116: a rebuilt ghost leaks about 1 MB per redraw). A redraw still creates exactly one
  // object URL (renderVerso's ghost) and revokes exactly one (the prior ghost).
  await evaluate(`(()=>{
    window.__ocN=0;window.__orN=0;
    window.__ocRef=URL.createObjectURL;window.__orRef=URL.revokeObjectURL;
    URL.createObjectURL=function(b){window.__ocN++;return window.__ocRef.call(URL,b);};
    URL.revokeObjectURL=function(u){window.__orN++;return window.__orRef.call(URL,u);};
    const voy=document.getElementById("voyage");voy.checked=true;voy.dispatchEvent(new Event("change",{bubbles:true}));
    document.getElementById("seed").value="100";document.getElementById("draw").click();
  })()`);
  await waitSettled("voyage-verso-blob");
  const w14 = await evaluate(`(()=>{
    const r={created:window.__ocN,revoked:window.__orN,
      versoTrack:!!document.getElementById("verso").querySelector(".verso-track")};
    URL.createObjectURL=window.__ocRef;URL.revokeObjectURL=window.__orRef;
    return r;
  })()`);
  check("W14 the verso track adds no Blob URL churn: one ghost URL created and one revoked per redraw",
    w14.created === 1 && w14.revoked === 1 && w14.versoTrack, JSON.stringify(w14));

  // W15: the verso's ghost and its track always come from the SAME draw. A sea-level drag
  // fires QUIET redraws that deliberately do not rebuild the ghost (re-blobbing the chart
  // every frame is the ~1 MB per redraw leak #116 exists to avoid), so a mid-drag re-arm
  // must leave the back face frozen: a fresh survey struck over a stale coastline registers
  // with nothing. The drag's release is not quiet and refreshes both together. Runs flipped,
  // with the voyage left on by W14.
  const read15 = `(()=>{
    const verso=document.getElementById("verso");
    const vt=verso.querySelector(".verso-track");
    const rt=document.querySelector("#map .voyage-track");
    return{ghost:(verso.querySelector(".verso-ghost")||{src:""}).src,
      verso:vt?vt.getAttribute("points"):null,
      recto:rt?rt.getAttribute("points"):null};
  })()`;
  const before15 = await evaluate(read15);
  // Drag: nudge the tide and let the 100ms debounce fire a QUIET redraw. Poll for the recto
  // to re-arm rather than waitSettled, which would return instantly (the draw has not begun).
  await evaluate(`(()=>{const l=document.getElementById("land");
    l.value=String(Math.max(0,Number(l.value)-90));l.dispatchEvent(new Event("input",{bubbles:true}));})()`);
  for (let i = 0; i < 80; i++) {
    const r = await evaluate(`(()=>{const rt=document.querySelector("#map .voyage-track");return rt?rt.getAttribute("points"):null;})()`);
    if (r !== before15.recto) break;
    await sleep(50);
  }
  await waitSettled("voyage-verso-quiet-drag");
  const mid15 = await evaluate(read15);
  // Release: the authoritative, non-quiet redraw. Both faces refresh together.
  await evaluate(`(()=>{const l=document.getElementById("land");l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-verso-drag-release");
  const after15 = await evaluate(read15);
  check("W15 the verso ghost and its track come from the same draw: a quiet mid-drag redraw freezes both",
    mid15.recto !== before15.recto && // the drag really did re-arm the recto to a new world
    mid15.ghost === before15.ghost && mid15.verso === before15.verso && // the back face froze
    after15.ghost !== before15.ghost && after15.verso === after15.recto, // the release refreshed both
    JSON.stringify({ rectoMoved: mid15.recto !== before15.recto, ghostFroze: mid15.ghost === before15.ghost,
      versoFroze: mid15.verso === before15.verso, ghostRefreshed: after15.ghost !== before15.ghost,
      facesAgree: after15.verso === after15.recto }));
  // Restore the auto waterline (a #type change resets landTouched), clearing the land= hash
  // param before the fallback suite reloads the page.
  await evaluate(`(()=>{document.getElementById("type").dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-verso-land-restore");

  // W16: the OTHER draw path. A style change turns the sheet (#131), so the voyage re-arms
  // in runTurn's .then(), ~900ms AFTER rebuildVerso already wiped the verso track. app.js
  // repaints on the far side of that wipe with the pre-turn session still standing, which
  // is safe for a reason worth pinning: a turn only ever re-dresses the SAME world (only
  // styleSel turns; every other control settles), so the points it paints are identical to
  // the ones the landing re-arm paints. A turn also never runs while flipped. Both faces
  // must agree once the sheet lands.
  await evaluate(`(()=>{document.getElementById("verso-turn").click();})()`); // back to the recto
  await sleep(1400);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-verso-style-turn");
  for (let i = 0; i < 60; i++) { // the turn lands after the draw resolves; wait for it to let go
    if (!(await evaluate(`document.getElementById("sheet").classList.contains("turning")`))) break;
    await sleep(50);
  }
  await sleep(80); // runTurn removes .turning just before it resolves; let its .then() commit
  const w16 = await evaluate(`(()=>{
    ${cntFn}
    const verso=document.getElementById("verso");
    const plan=window.__vellumVoyagePlan();
    const vTrack=verso.querySelector(".verso-track");
    const rTrack=document.querySelector("#map .voyage-track");
    return{
      ports:plan?plan.ports.length:0,
      rectoPts:cnt(rTrack), versoPts:cnt(vTrack),
      samePoints: vTrack&&rTrack ? vTrack.getAttribute("points")===rTrack.getAttribute("points") : false,
      versoed:document.getElementById("sheet").classList.contains("versoed"),
      status:document.getElementById("status").textContent,
      rectoStyle:(document.querySelector("#map svg:not(.voyage-overlay)")||{getAttribute:()=>null}).getAttribute("data-vellum-style"),
    };
  })()`);
  check("W16 a style turn with voyage on lands re-dressed with both faces agreeing on the re-armed track",
    w16.ports > 2 && w16.rectoPts === w16.versoPts && w16.rectoPts > w16.ports && w16.samePoints &&
    !w16.versoed && w16.status === "" && w16.rectoStyle === "ink", JSON.stringify(w16));

  // ---------------------------------------------------------------------------
  // #120 Real routes plus the mode-aware marker. The pure rules (mode assignment, the
  // road/sea geometry, the tilt cap, the anti-flicker facing) are proven exhaustively in
  // node:test over synthetic grids; these checks prove those proven rules are WIRED into
  // the live overlay. Driven by the deterministic hooks, never by rAF timing.
  // ---------------------------------------------------------------------------

  // Land on a world with both a sea leg and road legs. Seed 526413615 ("The Isle of
  // Selivelai") sails out to Liatalin and back: 21 road legs, 2 sea legs.
  await evaluate(`(()=>{
    const voy=document.getElementById("voyage");
    if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="526413615";
    document.getElementById("style").value="antique";
    document.getElementById("draw").click();
  })()`);
  await waitSettled("voyage-120-draw");
  await evaluate(`(()=>{const c=document.getElementById("voyage");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const w17 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const modes={};
    for(const l of plan.legs) modes[l.mode]=(modes[l.mode]||0)+1;
    const bad=plan.legs.filter((l)=>!["road","sea","straight"].includes(l.mode)).length;
    return{legs:plan.legs.length,modes,bad};
  })()`);
  check("W17 every leg reaches the overlay carrying the router's mode, and a sea leg exists",
    w17.bad === 0 && w17.legs > 10 && (w17.modes.sea || 0) >= 1 && (w17.modes.road || 0) >= 10,
    JSON.stringify(w17));

  // W18: the routed track is a real polyline. Under v1 it had exactly one point per port.
  const w18 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(999);
    const plan=window.__vellumVoyagePlan();
    const pts=document.querySelector("#map .voyage-track").getAttribute("points").trim().split(" ").length;
    return{pts,ports:plan.ports.length};
  })()`);
  check("W18 the resting track is a multi-point routed path, not a port-to-port lerp",
    w18.pts > w18.ports, JSON.stringify(w18));

  // W19: the mark swaps ship <-> rider at the port, driven by the leg's mode.
  const w19 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const legs=plan.legs;
    const seaLeg=legs.findIndex((l)=>l.mode==="sea");
    const roadLeg=legs.findIndex((l)=>l.mode==="road");
    const glyphAtLeg=(i)=>{
      // sample the MIDDLE of leg i, so the mark is unambiguously on that leg
      window.__vellumVoyagePaintAt((i+0.5)/legs.length);
      const ship=document.querySelector("#map .voyage-ship");
      const rider=document.querySelector("#map .voyage-rider");
      const shown=(el)=>!!el&&el.getAttribute("display")!=="none";
      return shown(ship)?"ship":(shown(rider)?"rider":"none");
    };
    return{seaLeg,roadLeg,onSea:glyphAtLeg(seaLeg),onRoad:glyphAtLeg(roadLeg)};
  })()`);
  check("W19 the mark is a ship on a sea leg and a rider on a road leg, swapping at the port",
    w19.seaLeg >= 0 && w19.roadLeg >= 0 && w19.onSea === "ship" && w19.onRoad === "rider",
    JSON.stringify(w19));

  // W20: the mark never tips past MAX_TILT (24deg) on any bearing the sweep visits, and
  // its facing does not flicker along a leg. voyageStepTo lands only ON ports (legT=0), so
  // the mid-leg samples come from __vellumVoyagePaintAt.
  const w20 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const mark=()=>{const s=document.querySelector("#map .voyage-ship");const r=document.querySelector("#map .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};
    const read=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const tf=mark().getAttribute("transform");
      const rot=/rotate\\(([-0-9.]+)\\)/.exec(tf);
      const sc=/scale\\((-?[0-9.]+) 1\\)/.exec(tf);
      return{tilt:rot?Math.abs(parseFloat(rot[1])):0,facing:sc?parseFloat(sc[1]):1};
    };
    let maxTilt=0;
    // sweep the whole voyage densely for the tilt cap
    for(let k=0;k<=200;k++) maxTilt=Math.max(maxTilt,read(k/200).tilt);
    // Walk ONE road leg finely and count facing changes. The leg must be one that would
    // actually flicker under the naive per-segment rule, else the check is toothless: pick
    // the road leg whose RAW per-segment x-direction reverses the most. The first road leg
    // is usually monotone, where the smoothed rule and the naive rule agree at zero flips.
    const n=plan.legs.length;
    // Per-leg projected geometry, so we can (a) pick a leg that genuinely jitters and (b)
    // compute what the NAIVE per-segment rule would do, as the baseline to beat.
    const geom=window.__vellumVoyageLegGeometry();
    const cum=(pts)=>{const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));return c;};
    const rawReversals=(pts)=>{let rev=0,ps=0;for(let i=1;i<pts.length;i++){const s=Math.sign(pts[i].x-pts[i-1].x);if(s!==0&&ps!==0&&s!==ps)rev++;if(s!==0)ps=s;}return rev;};
    // The leg whose raw x-direction reverses the most: the hardest case for anti-flicker.
    // The first road leg is usually monotone, where naive and smoothed agree at zero.
    let legIdx=-1,worstRev=-1;
    geom.forEach((l,i)=>{if(l.mode==="road"){const r=rawReversals(l.points);if(r>worstRev){worstRev=r;legIdx=i;}}});
    // The NAIVE facing (sign of the raw segment under the mark) sampled at the SAME points
    // the live sweep uses, so a regression to the naive rule would tie this count exactly.
    const pts=geom[legIdx].points, c=cum(pts), total=c[c.length-1];
    const naiveFacingAt=(d)=>{let k=0;while(k<c.length-2&&c[k+1]<d)k++;const s=Math.sign(pts[k+1].x-pts[k].x);return s||1;};
    let flips=0,naiveFlips=0,prev=null,prevN=null;
    for(let k=0;k<=60;k++){
      const local=(k/60)*total;
      const f=read((legIdx+k/60)/n).facing; // the LIVE, shipped facing
      const nf=naiveFacingAt(local);         // what the naive rule would paint
      if(prev!==null&&f!==prev) flips++;
      if(prevN!==null&&nf!==prevN) naiveFlips++;
      prev=f; prevN=nf;
    }
    return{maxTilt:Math.round(maxTilt*100)/100,flips,naiveFlips,legIdx,worstRev};
  })()`);
  check("W20 the mark never tips past MAX_TILT on any bearing of the sweep",
    w20.maxTilt <= 24.0001, `max |tilt| = ${w20.maxTilt}deg`);
  // The shipped smoothing must flip STRICTLY FEWER times than the naive per-segment rule on
  // a leg that genuinely jitters. Sampled identically, a regression to the naive rule would
  // tie the two counts, so `flips < naiveFlips` fails the moment the smoothing is unwired.
  // The remaining live flips are genuine sustained reversals of a long winding road, not
  // flicker; the flicker-free property itself is proven exhaustively in voyage-geometry.test.
  check("W20b the shipped facing flips fewer times than the naive rule on a switchbacking leg",
    w20.naiveFlips >= 3 && w20.flips < w20.naiveFlips, JSON.stringify(w20));

  // W21: Download stays clean. The routed track AND both new glyphs live in the sibling
  // overlay <svg>, never inside the baked chart that Download blobs.
  const w21 = await evaluate(`(()=>{
    const chart=document.querySelector("#map svg:not(.voyage-overlay)");
    return{
      inChart:!!chart.querySelector(".voyage-track,.voyage-ship,.voyage-rider"),
      inOverlay:!!document.querySelector("#map .voyage-overlay .voyage-track"),
      shipInOverlay:!!document.querySelector("#map .voyage-overlay .voyage-ship"),
      riderInOverlay:!!document.querySelector("#map .voyage-overlay .voyage-rider"),
    };
  })()`);
  check("W21 the routed track and BOTH glyphs stay in the sibling overlay, never the baked chart",
    !w21.inChart && w21.inOverlay && w21.shipInOverlay && w21.riderInOverlay, JSON.stringify(w21));

  await evaluate(`window.__vellumVoyageStepTo(999)`);
  await shoot("explorer-voyage-routed.png");

  // Restore a clean, voyage-off, un-flipped, antique state for the suites that follow.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}})()`);
  await evaluate(`(()=>{const s=document.getElementById("sheet");if(s.classList.contains("versoed"))document.getElementById("verso-turn").click();})()`);
  await sleep(120); // let any turn-back settle before the health checkpoint reads the page
  // #120's checks draw seed 526413615 (the one world with a sea leg), so put seed 42 back:
  // the suites that follow read a page they expect to be showing the golden world.
  await evaluate(`(()=>{document.getElementById("seed").value="42";const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-restore");
  await sleep(1100); // the restore turns the sheet too; let it land before the next suite
}
