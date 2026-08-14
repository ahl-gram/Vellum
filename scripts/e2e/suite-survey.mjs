// Survey Ink e2e (SV1-SV11, #321): the static Explorer's survey surface; self-contained like its sibling suites (navigates itself, carries scoped no-4xx and console-error deltas).
import { makeRoom } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, waitTurned, armTurnWatch, consoleErrors, http4xx, PORT } = ctx;

  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const room = makeRoom(ctx);

  // A navigate differing only in the hash is same-document and never re-runs the boot, so bounce through about:blank first (the suite-zoom Z13 idiom).
  const goto = async (hash, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: EXP + hash });
    await waitReady();
    await waitSettled(label);
  };

  const waitInked = async (label) => {
    for (let i = 0; i < 120; i++) {
      const n = await evaluate(`(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()`);
      if (n > 10) return n;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };

  // A marker registered on the same rAF-then-task hop the arm uses queues behind it, so absence checks need no sleep a slow CI runner could outlast.
  const waitBeat = async (label) => {
    for (let i = 0; i < 200; i++) {
      if (await evaluate(`window.__beat === true`)) return;
      await sleep(25);
    }
    throw new Error("waitBeat timeout " + label);
  };

  const setBox = (on) => evaluate(`(()=>{const c=document.getElementById("ages");
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const tick = (on, into) => evaluate(`(()=>{
    const c=document.getElementById("ages");window.${into}=null;const t0=performance.now();
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));
    const handlerMs=performance.now()-t0;
    requestAnimationFrame(()=>setTimeout(()=>{window.${into}=performance.now()-t0;},0));
    return{checked:c.checked,handlerMs,inked:!!document.querySelector("#map .voyage-overlay"),
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);

  await goto("#seed=42&style=antique", "survey-base");
  const sv1 = await evaluate(`(()=>{
    const ids=["scrubber","scrub-play","scrub-range","scrub-year","scrub-sig","chronicle-strip","journal-line"];
    const j=document.getElementById("journal-link");
    return{gone:ids.every((id)=>!document.getElementById(id)),
      checked:document.getElementById("ages").checked,
      track:!!document.querySelector("#map .voyage-overlay"),
      journalShown:!!j&&j.getClientRects().length>0,
      journalHref:j?j.getAttribute("href"):"",hash:location.hash,
      label:(document.getElementById("ages").closest("label")||{}).textContent||"",
      status:document.getElementById("status").textContent};
  })()`);
  check(
    "SV1 the scrubber panel and journal strip are gone from the DOM, the box boots unticked, the sheet bare, the journal button standing",
    sv1.gone && !sv1.checked && !sv1.track && sv1.journalShown && sv1.journalHref === "/reading-room/" + sv1.hash &&
      sv1.label.trim().startsWith("survey") && sv1.status === "",
    JSON.stringify(sv1),
  );

  const sv2 = await tick(true, "__armMs");
  const sv2Vertices = await waitInked("survey-first-arm");
  const sv2After = await evaluate(`({status:document.getElementById("status").textContent,
    hash:location.hash,overlays:document.querySelectorAll("#map .voyage-overlay").length,
    href:document.getElementById("journal-link").getAttribute("href"),ms:window.__armMs})`);
  check(
    "SV2 ticking survey acknowledges on the click's own frame and inks the completed track a beat later (#300)",
    sv2.checked && !sv2.inked && sv2.handlerMs < 50 &&
      /(^|&)survey(&|$)/.test(sv2.hash.slice(1)) && !/year=/.test(sv2.hash) &&
      sv2.status === "" && sv2.href === "/reading-room/" + sv2.hash &&
      sv2Vertices > 10 && sv2After.overlays === 1 && sv2After.status === "" &&
      sv2After.hash === sv2.hash && sv2After.href === sv2.href,
    JSON.stringify({ ...sv2, vertices: sv2Vertices, after: sv2After }),
  );
  await shoot("explorer-survey-inked.png");

  // Same document, same draw: a byte compare of the points strings is legitimate here (never across environments).
  const p0 = await evaluate(`document.querySelector("#map .voyage-overlay .voyage-track").getAttribute("points")`);
  await sleep(400);
  const sv2b = await evaluate(`(()=>{
    const ov=document.querySelector("#map .voyage-overlay");
    return{anims:ov&&ov.getAnimations?ov.getAnimations({subtree:true}).length:-1};
  })()`);
  const p1 = await evaluate(`document.querySelector("#map .voyage-overlay .voyage-track").getAttribute("points")`);
  check(
    "SV2b the inked track is a rest: geometry frozen over 400ms, no animation runs on the overlay",
    p0 === p1 && sv2b.anims === 0,
    JSON.stringify({ same: p0 === p1, anims: sv2b.anims, len: (p0 || "").length }),
  );

  // Measured 2026-08-12 headless Brave: first arm 1120ms, re-arm 144ms; the ratio clause guards the cache, the 800ms cap is sized for the slower ubuntu CI runner. Since #381 that runner also carries the other lane: the re-arm measured 245ms serial and 301-392ms under lanes, so the cap's headroom is 2x, not 3.3x.
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await tick(true, "__armMs2");
  await waitInked("survey-rearm");
  const sv2c = await evaluate(`({first:window.__armMs,again:window.__armMs2})`);
  check(
    "SV2c re-arming the same world is effectively instant: the travel matrix cache still holds (#300)",
    typeof sv2c.again === "number" && sv2c.again < 800 && sv2c.again < sv2c.first / 2,
    JSON.stringify(sv2c),
  );

  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await evaluate(`(()=>{const c=document.getElementById("ages");window.__beat=false;
    c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));
    requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-cancelled-beat");
  const sv2dOff = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    checked:document.getElementById("ages").checked,hash:location.hash,
    status:document.getElementById("status").textContent})`);
  await evaluate(`(()=>{const c=document.getElementById("ages");
    c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));
    c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitInked("survey-retick");
  await sleep(300); // let any superseded arm that was going to fire, fire
  const sv2dOn = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    checked:document.getElementById("ages").checked,hash:location.hash,
    status:document.getElementById("status").textContent})`);
  check(
    "SV2d a box that moves inside the deferred beat settles clean: tick+untick inks nothing, tick+untick+tick inks exactly one track (#300)",
    sv2dOff.overlays === 0 && !sv2dOff.checked && !/survey/.test(sv2dOff.hash) && sv2dOff.status === "" &&
      sv2dOn.overlays === 1 && sv2dOn.checked && /(^|&)survey(&|$)/.test(sv2dOn.hash.slice(1)) &&
      sv2dOn.status === "",
    JSON.stringify({ off: sv2dOff, on: sv2dOn }),
  );

  await goto("#seed=42&style=antique", "survey-inflight-base");
  await evaluate(`(()=>{
    document.getElementById("draw").click();
    const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    const end=performance.now()+1500;while(performance.now()<end);
  })()`);
  await waitSettled("survey-inflight-settle");
  await waitInked("survey-inflight-ink");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-inflight-beat");
  const sv2e = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    checked:document.getElementById("ages").checked,hash:location.hash,
    status:document.getElementById("status").textContent,
    vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
      return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()})`);
  check(
    "SV2e a tick during an in-flight draw leaves exactly ONE track: the settle owns the arm (#300)",
    sv2e.overlays === 1 && sv2e.checked && sv2e.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2e.hash.slice(1)) && sv2e.status === "",
    JSON.stringify(sv2e),
  );
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  const sv2f = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    hash:location.hash,status:document.getElementById("status").textContent})`);
  check(
    "SV2f unticking after that leaves the sheet truly bare, no stranded track (#300)",
    sv2f.overlays === 0 && !/survey/.test(sv2f.hash) && sv2f.status === "",
    JSON.stringify(sv2f),
  );

  await goto("#seed=42&style=antique", "survey-double-arm-base");
  await setBox(true);
  const firstArm = await waitInked("survey-double-arm-first");
  const before = await evaluate(`(()=>{const m=document.getElementById("map");
    const d=document.createElementNS("http://www.w3.org/2000/svg","svg");
    d.setAttribute("class","voyage-overlay");d.setAttribute("aria-hidden","true");
    m.appendChild(d);
    const all=m.querySelectorAll(".voyage-overlay");
    all.forEach((o)=>o.setAttribute("data-before-arm","1"));
    return all.length;})()`);
  await evaluate(`(()=>{const c=document.getElementById("ages");window.__beat=false;
    c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-double-arm-beat");
  const sv2g = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    tracks:document.querySelectorAll("#map .voyage-overlay .voyage-track").length,
    stale:document.querySelectorAll("#map .voyage-overlay[data-before-arm]").length,
    checked:document.getElementById("ages").checked,hash:location.hash,
    status:document.getElementById("status").textContent,
    vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
      return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()})`);
  check(
    "SV2g a second arm into a mount holding two overlays leaves exactly ONE, and it is the new build's (#364)",
    before === 2 && sv2g.overlays === 1 && sv2g.tracks === 1 && sv2g.stale === 0 && sv2g.checked &&
      sv2g.vertices === firstArm && /(^|&)survey(&|$)/.test(sv2g.hash.slice(1)) && sv2g.status === "",
    JSON.stringify({ before, firstArm, ...sv2g }),
  );

  await goto("#seed=42&style=antique", "survey-plural-exit-base");
  await setBox(true);
  await waitInked("survey-plural-exit-arm");
  await evaluate(`(()=>{const m=document.getElementById("map");
    const d=document.createElementNS("http://www.w3.org/2000/svg","svg");
    d.setAttribute("class","voyage-overlay");d.setAttribute("aria-hidden","true");
    m.appendChild(d);})()`);
  const planted = await evaluate(`document.querySelectorAll("#map .voyage-overlay").length`);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  const sv2h = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    hash:location.hash,status:document.getElementById("status").textContent})`);
  check(
    "SV2h unticking a sheet that holds two overlays clears EVERY one, not just the first (#364)",
    planted === 2 && sv2h.overlays === 0 && !/survey/.test(sv2h.hash) && sv2h.status === "",
    JSON.stringify({ planted, ...sv2h }),
  );

  await goto("#seed=42&style=antique", "survey-settle-owns-arm-base");
  await evaluate(`(()=>{
    window.__armSeq=0;
    window.__armObs=new MutationObserver((recs)=>{for(const r of recs)for(const n of r.addedNodes){
      if(n.nodeType===1&&n.getAttribute&&(n.getAttribute("class")||"").split(/\\s+/).indexOf("voyage-overlay")>=0)
        n.setAttribute("data-arm-seq",String(window.__armSeq++));}});
    window.__armObs.observe(document.getElementById("map"),{childList:true});
    document.getElementById("draw").click();
    const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    const end=performance.now()+1500;while(performance.now()<end);
  })()`);
  await waitSettled("survey-settle-owns-arm-settle");
  await waitInked("survey-settle-owns-arm-ink");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-settle-owns-arm-beat");
  const sv2i = await evaluate(`(()=>{const ov=document.querySelector("#map .voyage-overlay");
    const r={builds:window.__armSeq,seq:ov?ov.getAttribute("data-arm-seq"):null,
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      checked:document.getElementById("ages").checked,hash:location.hash,
      status:document.getElementById("status").textContent,
      vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()};
    window.__armObs.disconnect();return r;})()`);
  check(
    "SV2i a tick during an in-flight draw builds ONCE: the track on the sheet is the settle's own arm (#300)",
    sv2i.builds === 1 && sv2i.seq === "0" && sv2i.overlays === 1 && sv2i.checked && sv2i.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2i.hash.slice(1)) && sv2i.status === "",
    JSON.stringify(sv2i),
  );

  // sheet-turn's finish(true) writes the swap and THEN resolves, so a tick dispatched from a MutationObserver lands in the gap before the landing; a wall-clock sleep cannot hit it.
  await goto("#seed=42&style=antique", "survey-turn-owns-arm-base");
  await setBox(true);
  await waitInked("survey-turn-owns-arm-first");
  await evaluate(`(()=>{
    window.__armSeq=0;window.__tickedAtLanding=false;
    const m=document.getElementById("map");
    window.__armObs=new MutationObserver((recs)=>{for(const r of recs)for(const n of r.addedNodes){
      if(n.nodeType===1&&n.getAttribute&&(n.getAttribute("class")||"").split(/\\s+/).indexOf("voyage-overlay")>=0)
        n.setAttribute("data-arm-seq",String(window.__armSeq++));}});
    window.__armObs.observe(m,{childList:true});
    window.__landObs=new MutationObserver((recs)=>{
      if(window.__tickedAtLanding)return;
      let swapped=false;
      for(const r of recs)for(const n of r.addedNodes){
        if(n.nodeType===1&&n.tagName&&n.tagName.toLowerCase()==="svg"&&
           (n.getAttribute("class")||"").indexOf("voyage-overlay")<0) swapped=true;}
      if(!swapped)return;
      window.__tickedAtLanding=true;
      const c=document.getElementById("ages");
      c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));});
    window.__landObs.observe(m,{childList:true});
  })()`);
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("survey-turn-owns-arm-turn");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-turn-owns-arm-beat");
  const sv2j = await evaluate(`(()=>{const ov=document.querySelector("#map .voyage-overlay");
    const chart=document.querySelector("#map svg:not(.voyage-overlay)");
    const r={builds:window.__armSeq,seq:ov?ov.getAttribute("data-arm-seq"):null,
      ticked:window.__tickedAtLanding,turned:window.__turned,
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      style:chart?chart.getAttribute("data-vellum-style"):null,
      checked:document.getElementById("ages").checked,hash:location.hash,
      status:document.getElementById("status").textContent,
      vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()};
    window.__armObs.disconnect();window.__landObs.disconnect();return r;})()`);
  check(
    "SV2j a tick inside the TURN's landing builds ONCE: the landing's own arm is the track that stays (#300)",
    sv2j.turned === true && sv2j.ticked === true && sv2j.builds === 1 && sv2j.seq === "0" &&
      sv2j.overlays === 1 && sv2j.style === "ink" && sv2j.checked && sv2j.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2j.hash.slice(1)) && sv2j.status === "",
    JSON.stringify(sv2j),
  );

  await goto("#seed=7&style=antique&survey", "survey-draw-beat-base");
  await waitInked("survey-draw-beat-base-ink");
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0};
    const bump=()=>{window.__land.frames++;window.__land.raf=requestAnimationFrame(bump);};bump();
    window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
      for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
        if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
        else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
      if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames,
        verso:!!document.querySelector("#verso .verso-track")});});
    window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("survey-draw-beat-settle");
  await waitInked("survey-draw-beat-ink");
  const sv2p = await evaluate(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
    const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
    const recto=document.querySelector("#map .voyage-overlay .voyage-track");
    const back=document.querySelector("#verso .verso-track");
    return{batches:b,chartBatch:c,inkBatch:i,chartAlone:c>=0&&!b[c].overlay,
      framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
      versoAtSwap:c>=0?b[c].verso:null,
      facesAgree:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})(),
      status:document.getElementById("status").textContent,hash:location.hash};})()`);
  check(
    "SV2p a Draw with the survey inked paints the new chart before the arm: the swap and the ink land in different tasks, a frame apart (#366)",
    // framesBetween is load-bearing: a queueMicrotask fake-deferral left every other clause green (guard-prover run); it alone tells one task from two, do not drop it.
    sv2p.chartAlone && sv2p.inkBatch > sv2p.chartBatch && sv2p.framesBetween >= 1 &&
      sv2p.batches.length === 2 && sv2p.overlays === 1 && sv2p.status === "" &&
      /(^|&)survey(&|$)/.test(sv2p.hash.slice(1)),
    JSON.stringify(sv2p),
  );
  check(
    "SV2k the settle leaves the back face to the deferred arm: no outgoing track over the new ghost, and both faces agree once it lands (#174/#366)",
    sv2p.versoAtSwap === false && sv2p.facesAgree,
    JSON.stringify({ versoAtSwap: sv2p.versoAtSwap, facesAgree: sv2p.facesAgree, batches: sv2p.batches }),
  );

  await goto("#seed=7&style=antique&survey", "survey-dropped-arm-base");
  await waitInked("survey-dropped-arm-base-ink");
  const trackA = await evaluate(`document.querySelector("#map .voyage-overlay .voyage-track").getAttribute("points")`);
  await evaluate(`(()=>{window.__fired=false;
    window.__mo2=new MutationObserver((recs)=>{if(window.__fired)return;let chart=false;
      for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
        if(!(n.classList&&n.classList.contains("voyage-overlay"))&&String(n.tagName).toLowerCase()==="svg")chart=true;}
      if(!chart)return;window.__fired=true;
      const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));});
    window.__mo2.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  let turningSeen = false;
  for (let i = 0; i < 300; i++) {
    if (await evaluate(`!!document.querySelector(".sheet.turning")`)) { turningSeen = true; break; }
    await sleep(20);
  }
  const sv2m = await evaluate(`(()=>{window.__mo2.disconnect();
    const back=document.querySelector("#verso .verso-track");
    return{fired:window.__fired,turning:!!document.querySelector(".sheet.turning"),
      versoPoints:back?back.getAttribute("points"):"",
      status:document.getElementById("status").textContent};})()`);
  await waitTurned("survey-dropped-arm-turn");
  await waitInked("survey-dropped-arm-ink");
  const sv2mAfter = await evaluate(`(()=>{
    const recto=document.querySelector("#map .voyage-overlay .voyage-track");
    const back=document.querySelector("#verso .verso-track");
    return{overlays:document.querySelectorAll("#map .voyage-overlay").length,
      facesAgree:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
      style:(document.querySelector("#map svg:not(.voyage-overlay)")||{getAttribute:()=>null}).getAttribute("data-vellum-style"),
      status:document.getElementById("status").textContent};})()`);
  check(
    "SV2m a style change inside the settle's beat never strands the previous world's track on the new world's back face (#174/#366)",
    turningSeen && sv2m.fired && sv2m.versoPoints !== trackA &&
      sv2mAfter.overlays === 1 && sv2mAfter.facesAgree && sv2mAfter.style === "ink" &&
      sv2m.status === "" && sv2mAfter.status === "",
    JSON.stringify({ turningSeen, ...sv2m, versoPoints: (sv2m.versoPoints || "").slice(0, 40),
      versoIsPreviousWorld: sv2m.versoPoints === trackA, after: sv2mAfter }),
  );

  await goto("#seed=7&style=antique&survey", "survey-flipped-base");
  await waitInked("survey-flipped-base-ink");
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500); // the ceremonial flip transition (--verso-turn 1200ms)
  const flippedTrackA = await evaluate(`(()=>{const b=document.querySelector("#verso .verso-track");
    return b?b.getAttribute("points"):"";})()`);
  await evaluate(`(()=>{window.__flip={batches:[]};
    window.__mo3=new MutationObserver((recs)=>{let chart=false;
      for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
        if(!(n.classList&&n.classList.contains("voyage-overlay"))&&String(n.tagName).toLowerCase()==="svg")chart=true;}
      if(!chart)return;
      const back=document.querySelector("#verso .verso-track");
      const recto=document.querySelector("#map .voyage-overlay .voyage-track");
      window.__flip.batches.push({back:back?back.getAttribute("points"):"",
        recto:recto?recto.getAttribute("points"):"",
        versoed:document.getElementById("sheet").classList.contains("versoed")});});
    window.__mo3.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("survey-flipped-settle");
  await waitInked("survey-flipped-ink");
  const sv2o = await evaluate(`(()=>{window.__mo3.disconnect();
    const b=window.__flip.batches[0]||null;
    const back=document.querySelector("#verso .verso-track");
    const recto=document.querySelector("#map .voyage-overlay .voyage-track");
    return{atSwap:b,batches:window.__flip.batches.length,
      settledAgree:!!back&&!!recto&&back.getAttribute("points")===recto.getAttribute("points"),
      versoed:document.getElementById("sheet").classList.contains("versoed"),
      status:document.getElementById("status").textContent};})()`);
  await evaluate(`document.getElementById("verso-turn").click()`); // back to the recto for what follows
  await sleep(1500);
  check(
    "SV2o a Draw taken while resting on the verso changes the visible back face whole: ghost and track from the same draw, never a bare new ghost (#174/#366)",
    !!sv2o.atSwap && sv2o.atSwap.versoed && sv2o.atSwap.back !== "" &&
      sv2o.atSwap.back !== flippedTrackA && sv2o.atSwap.back === sv2o.atSwap.recto &&
      sv2o.settledAgree && sv2o.status === "",
    JSON.stringify({ outgoing: (flippedTrackA || "").slice(0, 30), ...sv2o,
      atSwap: sv2o.atSwap ? { ...sv2o.atSwap, back: (sv2o.atSwap.back || "").slice(0, 30),
        recto: (sv2o.atSwap.recto || "").slice(0, 30) } : null }),
  );

  await goto("#seed=42&style=antique&survey", "survey-restore-for-sv3");
  await waitInked("survey-sv3-ink");
  const sv3 = await evaluate(`(()=>{
    const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));
    return{track:!!document.querySelector("#map .voyage-overlay"),hash:location.hash,
      href:document.getElementById("journal-link").getAttribute("href"),
      status:document.getElementById("status").textContent};
  })()`);
  check(
    "SV3 unticking clears the track and drops the flag; the journal href follows the write",
    !sv3.track && !/survey/.test(sv3.hash) && !/year=/.test(sv3.hash) &&
      sv3.href === "/reading-room/" + sv3.hash && sv3.status === "",
    JSON.stringify(sv3),
  );

  await goto("#seed=42&style=antique&survey", "survey-restore");
  // waitSettled keys on #status, which the settle clears BEFORE the deferred arm (#366): wait for the ink, never read in the settle's shadow.
  await waitInked("survey-restore-ink");
  const sv4 = await evaluate(`(()=>{
    const t=document.querySelector("#map .voyage-overlay .voyage-track");
    return{checked:document.getElementById("ages").checked,
      vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);
  check(
    "SV4 a survey deep link restores ticked, resting on the completed track, silently",
    sv4.checked && sv4.vertices > 10 && sv4.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv4.hash.slice(1)) && sv4.status === "" &&
      sv4.href === "/reading-room/" + sv4.hash,
    JSON.stringify(sv4),
  );

  const fwdHash = "#seed=42&style=antique&legend=1&arms=0&year=1030";
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: EXP + fwdHash });
  let landed = false;
  for (let i = 0; i < 200; i++) {
    let p = null;
    try { p = await evaluate(`location.pathname`); } catch {}
    if (p === "/reading-room/") { landed = true; break; }
    await sleep(50);
  }
  const roomUp = landed && (await room.boot()) && (await room.settled());
  const sv5 = roomUp
    ? await evaluate(`(()=>{const a=window.__vellumReadingRoomAges();
        return{hash:location.hash.startsWith("#seed=42&style=antique&legend=1&arms=0"),
          chamber:a?a.chamber:"",year:a?a.year:-1,
          seed:window.__vellumReadingRoomState().seed};})()`)
    : { hash: false, chamber: "", year: -1, seed: -1 };
  check(
    "SV5 a year=N Explorer link forwards to the Reading Room, hash intact, parked at that year",
    landed && roomUp && sv5.hash && sv5.chamber === "ages" && sv5.year === 1030 && sv5.seed === 42,
    JSON.stringify({ landed, roomUp, sv5 }),
  );

  const richHash = "#seed=7&style=ink&legend=0&arms=1&land=520&year=2&cx=0.5100&cy=0.4900&k=3.0000";
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: EXP + richHash });
  let landedB = false;
  for (let i = 0; i < 200; i++) {
    let p = null;
    try { p = await evaluate(`location.pathname`); } catch {}
    if (p === "/reading-room/") { landedB = true; break; }
    await sleep(50);
  }
  const hashB = landedB ? await evaluate(`location.hash`) : "";
  check(
    "SV5b the forward carries the hash verbatim: recipe, tide, and camera riders all intact",
    landedB && hashB === richHash,
    JSON.stringify({ landedB, hashB, want: richHash }),
  );

  await goto("#seed=42&style=antique&year=abc", "survey-badyear");
  const sv5c = await evaluate(`({path:location.pathname,checked:document.getElementById("ages").checked,svg:!!document.querySelector("#map svg")})`);
  check(
    "SV5c a malformed year stays in the Explorer, ignored, and the chart draws",
    sv5c.path === "/explorer/" && !sv5c.checked && sv5c.svg,
    JSON.stringify(sv5c),
  );
  await goto("#seed=42&style=antique&survey&year=1030", "survey-bothkeys");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-bothkeys-beat");
  const sv5d = await evaluate(`({path:location.pathname,checked:document.getElementById("ages").checked,track:!!document.querySelector("#map .voyage-overlay")})`);
  check(
    "SV5d the both-keys set stays in the Explorer and arms nothing (ignored whole)",
    sv5d.path === "/explorer/" && !sv5d.checked && !sv5d.track,
    JSON.stringify(sv5d),
  );

  await goto("#seed=42&style=antique&survey", "survey-verso");
  await waitInked("survey-verso-ink");
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500); // the ceremonial flip transition (--verso-turn 1200ms)
  const sv6 = await evaluate(`(()=>{
    const recto=document.querySelector("#map .voyage-overlay .voyage-track");
    const back=document.querySelector("#verso .verso-track");
    return{flipped:document.getElementById("sheet").classList.contains("versoed"),
      match:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
      status:document.getElementById("status").textContent};
  })()`);
  check(
    "SV6 the verso mirrors the resting track (both faces byte-agree) and the flip needed no snap",
    sv6.flipped && sv6.match && sv6.status === "",
    JSON.stringify(sv6),
  );
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500);

  const sv7href = await evaluate(`document.getElementById("journal-link").getAttribute("href")`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${sv7href}` });
  const sv7up = (await room.boot()) && (await room.settled());
  const sv7 = sv7up
    ? await evaluate(`(()=>{const a=window.__vellumReadingRoomAges();
        return{seed:window.__vellumReadingRoomState().seed,chamber:a?a.chamber:"",t:a?a.t:-1};})()`)
    : { seed: -1, chamber: "", t: -1 };
  check(
    "SV7 the journal button opens this world's journal in the room, at the survey rest",
    sv7up && sv7.seed === 42 && sv7.chamber === "survey" && sv7.t === 1,
    JSON.stringify({ sv7href, sv7up, sv7 }),
  );

  await goto("#seed=42&style=antique", "survey-seams");
  const sv9 = await evaluate(`({
    stepTo:typeof window.__vellumVoyageStepTo,paintAt:typeof window.__vellumVoyagePaintAt,
    plan:typeof window.__vellumVoyagePlan,log:typeof window.__vellumVoyageLog,
    geom:typeof window.__vellumVoyageLegGeometry,ages:typeof window.__vellumAgesState,
    inline:typeof window.__vellumRunInline})`);
  check(
    "SV9 the Explorer publishes no time seams (voyage/ages hooks gone; the runInline oracle stays)",
    sv9.stepTo === "undefined" && sv9.paintAt === "undefined" && sv9.plan === "undefined" &&
      sv9.log === "undefined" && sv9.geom === "undefined" && sv9.ages === "undefined" && sv9.inline === "function",
    JSON.stringify(sv9),
  );

  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  // Wait for the ink BEFORE the turn: a style change inside the arm's gap drops the pending arm, and SV10 would pass on a turn begun over a bare sheet, losing #153's premise.
  await waitInked("survey-armed-before-turn");
  await armTurnWatch();
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0};
    const bump=()=>{window.__land.frames++;window.__land.raf=requestAnimationFrame(bump);};bump();
    window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
      for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
        if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
        else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
      if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames});});
    window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("survey-style-turn");
  await waitInked("survey-turn-rearm");
  const sv10 = await evaluate(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
    const svg=document.querySelector("#map svg:not(.voyage-overlay)");
    const t=document.querySelector("#map .voyage-overlay .voyage-track");
    const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
    return{turned:window.__turned,style:svg?svg.getAttribute("data-vellum-style"):null,
      vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      batches:b,chartBatch:c,inkBatch:i,chartAlone:c>=0&&!b[c].overlay,
      framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
      hash:location.hash,status:document.getElementById("status").textContent};
  })()`);
  check(
    "SV10 the style turn engages with the track armed and the track survives on the new dress (#153)",
    sv10.turned === true && sv10.style === "ink" && sv10.vertices > 10 && sv10.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv10.hash.slice(1)) && sv10.status === "",
    JSON.stringify({ ...sv10, batches: undefined }),
  );
  // framesBetween alone reds on an inline turn re-arm (measured on the reverted call site): the commit and the arm are microtasks of the SAME task, so the batch always splits.
  check(
    "SV2l the turn's landing pays its arm after the new dress paints, not with it (#366)",
    sv10.chartAlone && sv10.inkBatch > sv10.chartBatch && sv10.framesBetween >= 1 &&
      sv10.batches.length === 2,
    JSON.stringify({ batches: sv10.batches, chartBatch: sv10.chartBatch, inkBatch: sv10.inkBatch,
      chartAlone: sv10.chartAlone, framesBetween: sv10.framesBetween }),
  );
  await shoot("explorer-survey-turned-ink.png");

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await goto("#seed=42&style=antique&survey", "survey-reduce-base");
  await waitInked("survey-reduce-base-ink");
  await armTurnWatch();
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0};
    const bump=()=>{window.__land.frames++;window.__land.raf=requestAnimationFrame(bump);};bump();
    window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
      for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
        if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
        else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
      if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames});});
    window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("survey-reduce-settle");
  await waitInked("survey-reduce-rearm");
  const sv2n = await evaluate(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
    const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
    const ov=document.querySelector("#map .voyage-overlay");
    const svg=document.querySelector("#map svg:not(.voyage-overlay)");
    return{reduce:matchMedia("(prefers-reduced-motion: reduce)").matches,turned:window.__turned,
      style:svg?svg.getAttribute("data-vellum-style"):null,
      chartAlone:c>=0&&!b[c].overlay,inkAfter:i>c,framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
      anims:ov&&ov.getAnimations?ov.getAnimations({subtree:true}).length:-1,
      overlays:document.querySelectorAll("#map .voyage-overlay").length,
      status:document.getElementById("status").textContent};})()`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "SV2n under reduced motion the style change swaps instead of turning, defers its arm the same way, and starts no animation (#366)",
    sv2n.reduce === true && sv2n.turned === false && sv2n.style === "ink" &&
      sv2n.chartAlone && sv2n.inkAfter && sv2n.framesBetween >= 1 &&
      sv2n.anims === 0 && sv2n.overlays === 1 && sv2n.status === "",
    JSON.stringify(sv2n),
  );

  const sv8 = await evaluate(`location.hash.includes("year=")`);
  check("SV8 the Explorer's writer never emitted year= across every path this suite drove", sv8 === false, `hash=${await evaluate(`location.hash`)}`);

  // "AbortError: Transition was skipped" is the #130 view-transition's expected cancellation when navigations chain fast, not an app error.
  const errDelta = consoleErrors
    .slice(errBase)
    .filter((e) => !e.includes("AbortError: Transition was skipped"));
  check(
    "SV11 the survey flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
