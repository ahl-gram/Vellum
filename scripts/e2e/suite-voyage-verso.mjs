// Wayfarer's Passage x the Verso: the voyage track bleeds through the flipped sheet (W9-W16,
// #174). Runs AFTER suite-voyage and inherits its live voyage session: flip mid-sweep snaps to
// rest, the resting track bleeds through mirrored/registered while the mark does not, both faces
// agree, no Blob churn, a quiet mid-drag freezes the back face, and a style turn re-arms both.
// Split from suite-voyage.mjs; W prefix kept (W owns the voyage x verso checks).
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, sleep } = ctx;
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
  // never disabled by a running sweep (a 12s dead control reads as a bug). #121: the margin
  // log accumulates (row 0 brightened as the sweep set out) while #status stays "" until
  // the snap posts the survey's single polite summary.
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
    const midLog=window.__vellumVoyageLog();
    const midStatus=statusEl.textContent;
    const disabledMidSweep=btn.disabled;
    // COUNT the writes to #status across the snap, do not just read its end state:
    // textContent retains only the last value, so a burst posting every port the snap
    // skipped would be indistinguishable from the single summary post #121 requires. Each
    // textContent assignment is exactly one childList record.
    const obs=new MutationObserver(()=>{});
    obs.observe(statusEl,{childList:true,characterData:true,subtree:true});
    btn.click();
    const statusWrites=obs.takeRecords().length;
    obs.disconnect();
    const restLog=window.__vellumVoyageLog();
    return{
      ports:plan?plan.ports.length:0,
      summary:restLog?restLog.summary:"",
      midPts,midStatus,midLogged:midLog?midLog.logged:-1,disabledMidSweep,statusWrites,
      restPts:cnt(document.querySelector("#map .voyage-track")),
      restLogged:restLog?restLog.logged:-1,
      status:statusEl.textContent,
      versoed:document.getElementById("sheet").classList.contains("versoed"),
      label:btn.textContent,
    };
  })()`);
  check("W9 a flip mid-sweep snaps the voyage to rest and turns; a running sweep never disables the button",
    w9.disabledMidSweep === false && w9.ports > 2 && w9.midPts === 1 && w9.midLogged >= 1 && w9.midStatus === "" &&
    w9.restPts > w9.ports && w9.restLogged === w9.ports && w9.status === w9.summary && w9.versoed && w9.label === "Turn back",
    JSON.stringify(w9));
  check("W9b the snap posts the survey's ONE polite summary, not a burst: exactly one write to #status",
    w9.statusWrites === 1 && w9.status === w9.summary && w9.summary !== "",
    JSON.stringify({ writes: w9.statusWrites, status: w9.status, summary: w9.summary }));

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
    const log=window.__vellumVoyageLog();
    return{
      flipped:document.getElementById("sheet").classList.contains("versoed"),
      ports:plan?plan.ports.length:0,
      summary:log?log.summary:"",
      logged:log?log.logged:-1,
      rectoPts:cnt(document.querySelector("#map .voyage-track")),
      versoPts:cnt(verso.querySelector(".verso-track")),
      status:document.getElementById("status").textContent,
    };
  })()`);
  check("W11 ticking voyage while flipped rests on the full track on both faces, logs every entry, no sweep",
    w11.flipped && w11.ports > 2 && w11.rectoPts === w11.versoPts && w11.rectoPts > w11.ports &&
    w11.logged === w11.ports && w11.status === w11.summary, JSON.stringify(w11));

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
}
