// The Survey Ink checks (SV1-SV11, #321, Survey and Story Sub 4): the static
// Explorer. The scrubber panel, Play, the bar, and the journal strip are GONE from
// the DOM (not hidden); the one `survey` checkbox is 1:1 with the bare `survey` hash
// flag and inks the completed track at rest a beat after the tick (#300); an inbound `year=N` link
// forwards to the Reading Room with the hash intact; the verso mirrors the resting
// track with no snap; and the journal pointer's href tracks every hash write. (#270
// ruling 2 reshaped the pointer checks here: the old hidden-unless-ticked caption
// became the ALWAYS-visible gold #journal-link button in The Press, so the hidden
// gate probes retired and the href sync is asserted in both directions instead.)
// Successors for the retired Explorer-hosted live checks are the room-hosted RS/RW/
// RV/RA suites (#320); this suite guards only what the static Explorer still owes.
// #300 reshaped SV2 (ratified on the issue) and added SV2c/SV2d: the tick is now
// acknowledged on its own frame and the session build waits for the paint, so the ink
// lands a beat later and the beat is a window the box can move inside.
// #364 added SV2g/SV2h: the "one mount, one overlay" invariant asserted against the
// ENGINE rather than against the callers that used to hold it by convention.
// Self-contained like the hunt / Print Room / home suites (navigates itself, carries
// its own scoped no-4xx + console-error delta).
import { makeRoom } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, waitTurned, armTurnWatch, consoleErrors, http4xx, PORT } = ctx;

  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;
  const room = makeRoom(ctx);

  // Every deep-link check re-bootstraps: a navigate differing only in the hash is a
  // same-document change and never re-runs the boot, so go through about:blank first
  // (the suite-zoom Z13 idiom).
  const goto = async (hash, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: EXP + hash });
    await waitReady();
    await waitSettled(label);
  };

  // #300: the tick's build now waits for the paint, so the ink lands a beat after the
  // change event rather than inside it. Anything that wants the track must wait for it.
  // Capped, so a fix that never arms fails here instead of hanging the run. An evaluate
  // sent mid-build simply queues behind it: the answer arrives when the main thread frees.
  const waitInked = async (label) => {
    for (let i = 0; i < 120; i++) {
      const n = await evaluate(`(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()`);
      if (n > 10) return n;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };

  // Wait for the beat itself rather than for a wall-clock guess. A marker registered on the
  // SAME rAF-then-task hop the arm uses is queued BEHIND it, so once the marker fires the
  // arm has already run or been dropped. That is what lets the negative cases ("nothing was
  // inked") assert absence without a sleep that a slower CI runner could outlast.
  const waitBeat = async (label) => {
    for (let i = 0; i < 200; i++) {
      if (await evaluate(`window.__beat === true`)) return;
      await sleep(25);
    }
    throw new Error("waitBeat timeout " + label);
  };

  // Move the box the way a user would, with no clock. The #364 checks below want the arm
  // itself, not its duration, and a `tick()` whose timing global nothing reads would be a
  // measurement taken for no reader.
  const setBox = (on) => evaluate(`(()=>{const c=document.getElementById("ages");
    c.checked=${on};c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  // Tick or untick the box the way a user would, and clock the whole arm from inside the
  // page. The clock's own rAF-then-task is registered AFTER the handler's, so it queues
  // behind the build and measures the entire beat, not just the handler's return.
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

  // SV1: the cut itself. A bare visit carries NO scrubber panel, Play, bar, readout,
  // or journal strip anywhere in the document (gone from the DOM, not hidden), the
  // box boots unticked, the sheet is bare, and the journal button stands ready with
  // this world's address (#270: the old #journal-line caption is gone WITH its gate;
  // the button is always visible and only its href tracks the state).
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

  // SV2 (reshaped by #300, on purpose): ticking the box ACKNOWLEDGES the click on its own
  // frame and inks the completed track a beat later. The heavy half of the arm (the
  // session build: prepareVoyageRouter plus the #184 all-pairs travel matrix) used to run
  // inside the change handler, which meant the browser could not paint the checked box
  // until it returned. So the readback in the dispatch's own turn now asserts the
  // acknowledgment WITHOUT the track: box checked, bare survey flag written, journal href
  // followed, status silent, no overlay yet, and the handler itself returning in a few ms
  // rather than the ~1.1s it used to hold the thread for. Those last two are the guard on
  // the yield: the overlay clause reds if this exact build comes back into the handler,
  // and the duration clause reds for any heavy work put there in some other shape. The
  // completed track (a sweep would start near zero length) is then waited for, and the
  // address must not have moved across the beat: the writer reads the box, never the track.
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

  // SV2b: at rest means at rest. The track must not move and no clock may run: the
  // points string is byte-identical 400ms later (same document, same draw, so a byte
  // compare is legitimate here) and the overlay carries no running animations.
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

  // SV2c: re-arming an UNCHANGED world stays effectively instant (#300 acceptance: the
  // matrix cache behavior is untouched). The #184 travel matrix keys on seed +
  // surveyFingerprint + port set, so only a walkable world's first arm pays for it; a
  // re-arm is prepareVoyageRouter, the per-leg routing and the log panel, which are NOT
  // cached and are what the budget below actually covers. Untick, re-tick, clock the
  // second arm the same way. Two clauses, because either alone is blind: an absolute cap,
  // and a ratio so a regression that slowed BOTH sides could not hide inside the cap.
  // Measured 2026-08-12 on this seed in headless Brave: first arm 1120ms, re-arm 144ms,
  // ratio 0.13 (in Node the engine halves clock 895-1207ms first, 23-36ms re-arm). The
  // ratio is the machine-independent half and does the real work: lose the cache and it
  // goes to ~1. The cap is sized for the ubuntu CI runner, a few times slower than this
  // laptop, where a re-arm still lands well inside 800ms while an uncached one would run
  // past three seconds.
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await tick(true, "__armMs2");
  await waitInked("survey-rearm");
  const sv2c = await evaluate(`({first:window.__armMs,again:window.__armMs2})`);
  check(
    "SV2c re-arming the same world is effectively instant: the travel matrix cache still holds (#300)",
    typeof sv2c.again === "number" && sv2c.again < 800 && sv2c.again < sv2c.first / 2,
    JSON.stringify(sv2c),
  );

  // SV2d: the beat between the tick and the build is a window that did not exist while
  // the handler was synchronous, and the box can move inside it (#300). Both events are
  // dispatched in ONE evaluate, so they land before the frame the arm waits on. Ticking
  // and unticking inside the beat must ink nothing; tick/untick/tick must ink exactly ONE
  // overlay. The zero is what this check rests on: a cancelled arm that fires anyway inks
  // a track on a sheet whose box is clear. (The one is now held by the #364 builder wipe
  // as well as by the arm's supersede rule, so read it as a floor, not as the guard.)
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

  // SV2e: the box ticked while a draw is ALREADY IN FLIGHT. This is the one ordering the
  // arm's own worldGen snapshot cannot see, because the host bumps that counter when a draw
  // BEGINS, which here is before the tick, so the snapshot matches and always will. If the
  // settle then arms the chart that lands and the pending arm lands too, both build. The
  // settle's cancel() is what closes it.
  //
  // HONEST SCOPE since #364: the two stacked overlays this pair was written against are no
  // longer the symptom (the session builder now drops the overlay it finds), so these
  // clauses would survive the settle's cancel() being deleted. What they still assert is
  // the invariant itself, one track and a bare sheet after. The stale arm's remaining harm
  // is a duplicate session build for one sheet: it reads the host's live refs when it
  // fires, and the settle assigns those before arming, so it rebuilds the world that just
  // landed rather than inking the outgoing one.
  //
  // Deterministic, not raced. After the tick the page HOLDS the main thread past the
  // worker's reply, so when it frees, the settle's message task and the arm's deferred task
  // are both queued, settle first. Left to run naturally the arm fires about a frame in,
  // long before any reply, and the settle's innerHTML wipe would hide the defect entirely:
  // this check would then pass on the broken code, which is the whole thing worth avoiding.
  // The seed is left alone so the worker's world cache serves the redraw and the reply
  // comfortably beats the hold.
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
  // And the untick really does clear it: the sheet ends bare, its box unticked and its
  // address carrying no survey flag. Before #364 two stacked overlays left one behind here,
  // since exitVoyage removed a single one; it removes every one now, so like SV2e above this
  // asserts the invariant rather than reddening for the stale arm that used to break it.
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  const sv2f = await evaluate(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
    hash:location.hash,status:document.getElementById("status").textContent})`);
  check(
    "SV2f unticking after that leaves the sheet truly bare, no stranded track (#300)",
    sv2f.overlays === 0 && !/survey/.test(sv2f.hash) && sv2f.status === "",
    JSON.stringify(sv2f),
  );

  // SV2g: the invariant belongs to the ENGINE, not to the callers (#364). Every arm
  // shipping today is preceded by something that empties the mount (the settle's
  // innerHTML swap, the turn's commit, applyVoyage's own exitVoyage, the room's draw
  // wipe), so "one mount, one overlay" was held by convention and nothing pinned it.
  // This drives TWO consecutive arms through the production path with NO wipe between
  // them: a second `change` event with the box LEFT CHECKED schedules a second deferred
  // arm, and no draw runs in between, so the second rearmVoyage builds straight into a
  // mount that already holds an overlay. The first arm is waited for before the second
  // is dispatched, on purpose: two schedules inside one beat supersede (survey-arm.ts
  // bumps its generation), which is a different mechanism and is SV2d's.
  //
  // TWO refinements the first cut of this check needed, both from the #364 review:
  //   - a decoy overlay is PLANTED beside the armed one, so the mount holds two before the
  //     second arm rather than one. A count of one afterwards then also pins that the wipe
  //     is plural: take-the-first would leave the decoy and the new build stacked. (The
  //     mount-side proof of that lives in test/site/voyage-session-mount.test.ts, which
  //     can hold as many as it likes; this is the browser-real half.)
  //   - every overlay in the mount is TAGGED before the arm, and none may carry the tag
  //     afterwards. Without it every clause here is equally true of the state BEFORE the
  //     second change is dispatched, so a future change that made a redundant change event
  //     a no-op would leave this check green and empty rather than red.
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

  // SV2h: the other end of the same invariant (#364). exitVoyage reads the mount for
  // overlays to remove, and a singular query strands every one past the first. The
  // builder above makes two unreachable through any arm path, so the second one is
  // PLANTED here: this asserts the teardown's contract for a sheet that somehow already
  // holds two, which is the only way a one-token belt-and-braces change can be guarded
  // at all. The decoy is a real overlay node, appended to the same mount the engine
  // builds into, beside the one a real arm just inked. The base is re-established rather
  // than inherited from SV2g, so a builder regression reds THAT check and not this one.
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

  // SV2i: the settle OWNS the arm, asserted by identity rather than by counting overlays.
  //
  // This is SV2e's scenario (a tick during a draw already in flight, the one ordering the
  // arm's own worldGen snapshot cannot see) with the assertion moved to where #364 left it.
  // Before #364 a stale arm surviving the landing stacked a second overlay, so SV2e's count
  // caught it. The builder now drops the overlay it finds, so the count is one either way
  // and the count can no longer tell "the settle's arm is on the sheet" from "a second build
  // replaced it". Measured, not assumed: with #364 in place and the settle's
  // `surveyArm.cancel()` deleted, the whole suite stayed green.
  //
  // So this counts BUILDS, not overlays. A MutationObserver on the mount stamps every
  // `.voyage-overlay` appended after it starts with a sequence number, which is the one
  // seam that can distinguish them: the nodes are otherwise identical, since the deferred
  // arm reads the host's live refs at fire time and so rebuilds the very world the settle
  // just armed. Exactly one build after the landing, and the survivor is stamped 0.
  //
  // #366 makes this load-bearing rather than tidy: it defers the settle's own arm, so a
  // stale arm and the landing's arm stop being the same world's track.
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

  // SV2j: the SAME class at the other instance. `surveyArm.cancel()` appears twice in the
  // conductor, once in the settle (app.ts:248, above) and once at the #131 turn landing
  // (app.ts:222), and a guard here comes out shaped like the class rather than like the
  // one instance that happened to be reported. Coverage of the turn instance was ZERO
  // before this branch: `scripts/e2e/suite-turn.mjs` unticks the survey box in its base
  // setup, so no check anywhere has ever ticked it during a turn's flight.
  //
  // Deterministic, not raced, and the mechanism is worth reading carefully. The tick is
  // dispatched from a MutationObserver watching the mount for the turn's own chart swap.
  // sheet-turn.ts's finish(true) writes `mapEl.innerHTML = newSvg` and THEN resolves, so
  // the observer's microtask is queued before the landing's promise reaction: the tick
  // lands in the gap, and the arm it schedules is still pending when the landing runs.
  // That gap is the only moment at which the turn's cancel() is load-bearing, and a
  // wall-clock sleep cannot hit it reliably.
  //
  // The assertion is SV2i's: count BUILDS, not overlays. Since #364 the builder drops the
  // overlay it finds, so a stale arm landing after the turn leaves one overlay either way
  // and only the stamp can tell whose it is.
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

  await goto("#seed=42&style=antique&survey", "survey-restore-for-sv3");
  await waitInked("survey-sv3-ink");
  // SV3: the box and the flag are 1:1 in the other direction too. Unticking clears
  // the overlay from the mount and drops the flag from the hash; the journal button
  // stays standing (#270) and its href follows the write, losing the flag with it.
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

  // SV4: a restored flag ticks the box: a bare `survey` deep link boots ticked and
  // rests on the completed track silently (the boot ticks with no change event; the
  // first settle arms the resting track through the re-arm branch).
  await goto("#seed=42&style=antique&survey", "survey-restore");
  const sv4 = await evaluate(`(()=>{
    const t=document.querySelector("#map .voyage-overlay .voyage-track");
    return{checked:document.getElementById("ages").checked,
      vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);
  check(
    "SV4 a survey deep link restores ticked, resting on the completed track, silently",
    sv4.checked && sv4.vertices > 10 && /(^|&)survey(&|$)/.test(sv4.hash.slice(1)) && sv4.status === "" &&
      sv4.href === "/reading-room/" + sv4.hash,
    JSON.stringify(sv4),
  );

  // SV5: the time forward. An Explorer link carrying a valid year=N lands in the
  // Reading Room at that year's rest, recipe intact, hash verbatim (decision 2). The
  // ground-truth mid year comes from the ROOM's own oracle after landing.
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

  // SV5b: the forward preserves the WHOLE recipe verbatim (decision 2): style, arms,
  // a touched tide, the camera keys the room will ignore; nothing is stripped.
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

  // SV5c/SV5d: what does NOT forward. A malformed year is ignored exactly as today
  // (the Explorer keeps the visit), and the nonsensical both-keys set is ignored
  // whole (parseLive's discipline), arming nothing.
  await goto("#seed=42&style=antique&year=abc", "survey-badyear");
  const sv5c = await evaluate(`({path:location.pathname,checked:document.getElementById("ages").checked,svg:!!document.querySelector("#map svg")})`);
  check(
    "SV5c a malformed year stays in the Explorer, ignored, and the chart draws",
    sv5c.path === "/explorer/" && !sv5c.checked && sv5c.svg,
    JSON.stringify(sv5c),
  );
  await goto("#seed=42&style=antique&survey&year=1030", "survey-bothkeys");
  const sv5d = await evaluate(`({path:location.pathname,checked:document.getElementById("ages").checked,track:!!document.querySelector("#map .voyage-overlay")})`);
  check(
    "SV5d the both-keys set stays in the Explorer and arms nothing (ignored whole)",
    sv5d.path === "/explorer/" && !sv5d.checked && !sv5d.track,
    JSON.stringify(sv5d),
  );

  // SV6: the verso mirrors the resting track exactly as before, and the flip needs no
  // snap (every reachable state is already a rest). Tick, flip, compare the two faces'
  // points strings (same document, same draw: a byte compare is the right tool), flip
  // back.
  await goto("#seed=42&style=antique&survey", "survey-verso");
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

  // SV7: the journal pointer is a real pointer: following the Press's journal
  // button (#270 ruling 2; the caption line it replaced carried this same check)
  // lands in the Reading Room on THIS world's journal at the survey rest.
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

  // SV9: the time seams are gone from the Explorer (#320 decision A, ratified
  // 2026-08-10): the deterministic voyage/ages hooks are the room's surface now. The
  // runInline oracle stays, and the room-hosted suites already assert the full seam
  // surface THERE (RS2 derives from HOST_HOOK_NAMES).
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

  // SV10: the style turn works ARMED (#153, resolved by this sub: the track is a DOM
  // overlay with no per-glyph mutations, so the chronicle suppression term is gone).
  // Tick the survey, change the style: the turn must ENGAGE (not an instant swap) and
  // the track must survive re-armed on the re-dressed sheet.
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  // #300: wait for the ink BEFORE starting the turn. The arm is deferred a frame now, and
  // a style change dispatched into that gap bumps drawGen, which drops the pending arm and
  // lets the landing re-arm do the work instead. SV10 would still pass that way, on a turn
  // that began over a BARE sheet, quietly losing the premise it exists to guard (#153: the
  // turn works with the track already on the sheet).
  await waitInked("survey-armed-before-turn");
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("survey-style-turn");
  const sv10 = await evaluate(`(()=>{
    const svg=document.querySelector("#map svg:not(.voyage-overlay)");
    const t=document.querySelector("#map .voyage-overlay .voyage-track");
    return{turned:window.__turned,style:svg?svg.getAttribute("data-vellum-style"):null,
      vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
      hash:location.hash,status:document.getElementById("status").textContent};
  })()`);
  check(
    "SV10 the style turn engages with the track armed and the track survives on the new dress (#153)",
    sv10.turned === true && sv10.style === "ink" && sv10.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv10.hash.slice(1)) && sv10.status === "",
    JSON.stringify(sv10),
  );
  await shoot("explorer-survey-turned-ink.png");

  // SV8: the Explorer never authors year=. The whole suite drove every author path
  // (boot, tick, untick, restore, flip, turn); this is the standing sweep at the end.
  const sv8 = await evaluate(`location.hash.includes("year=")`);
  check("SV8 the Explorer's writer never emitted year= across every path this suite drove", sv8 === false, `hash=${await evaluate(`location.hash`)}`);

  // Scoped health: the whole flow above ran clean. One stock Chromium message is
  // excused, the H6 idiom: "AbortError: Transition was skipped" is the #130 folio
  // view-transition's expected cancellation when navigations chain fast (this suite's
  // forward checks are real page-to-page navigations), not an app error.
  const errDelta = consoleErrors
    .slice(errBase)
    .filter((e) => !e.includes("AbortError: Transition was skipped"));
  check(
    "SV11 the survey flow is clean (no console errors, no 4xx)",
    errDelta.length === 0 && http4xx.length === httpBase,
    JSON.stringify({ errs: errDelta, http: http4xx.slice(httpBase) }),
  );
}
