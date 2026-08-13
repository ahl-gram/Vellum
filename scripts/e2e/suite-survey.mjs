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
// #366 carried that to the other two arm paths (the settle and the #131 turn's landing),
// so the ink lands a beat after a DRAW too. This branch owns SV2k through SV2p: SV2p (the
// settle's ordering), SV2k (the back face on a Draw), SV2l (the turn landing's ordering,
// riding on SV10's turn), SV2m (the arm dropped inside the settle's beat), SV2n (reduced
// motion), and SV2o for the one landing that does NOT defer, a draw taken while the sheet
// rests on its verso, where the chart is facing away and the back face is what the reader
// sees. SV4, SV6 and SV10 gained waits for the ink where they used to read in the settle's
// shadow. SV2g through SV2j belong to #364 (PR #372), whose engine source cites them by
// name; its SV2j is a different contract from anything here.
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

  // SV2p (#366): a Draw made WITH the survey already inked must paint the new chart without
  // waiting on the arm. The settle wrote the new chart into #map and re-armed in the SAME
  // task, so the browser could not paint the chart the settle had just written until the
  // arm returned: 1245ms from the settle to the first delivered frame carrying the new
  // chart, measured in screencast frames before the fix, and about 105ms after it.
  //
  // Asserted as TASK ORDERING, never as a duration. A MutationObserver callback runs at the
  // microtask checkpoint of the task that mutated, so two mutations made in ONE task arrive
  // in one batch and two made in two tasks arrive in two. The batch carrying the chart swap
  // must therefore not also carry the voyage overlay, and a rendering opportunity (the frame
  // the arm waits for) must fall between the two batches. Nothing here sleeps, so there is
  // no threshold a slower runner could outlast, and the check cannot pass by being fast.
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
    // framesBetween is LOAD-BEARING and is not redundant with the two clauses beside it. A
    // guard-prover run replaced afterNextPaint with queueMicrotask, so the arm only LOOKED
    // deferred while still running inside the settle's task: chartAlone and the batch order
    // both still passed (a microtask checkpoint per callback splits the batches), and this
    // clause alone went red at framesBetween 0. It is the only thing in the suite that can
    // tell one task from two. Do not drop it as redundant.
    sv2p.chartAlone && sv2p.inkBatch > sv2p.chartBatch && sv2p.framesBetween >= 1 &&
      // Exactly two batches and exactly one overlay: a real bound, unlike a vertex count,
      // which waitInked above has already guaranteed. A second arm surviving alongside this
      // one would show up as a third batch or a second overlay.
      sv2p.batches.length === 2 && sv2p.overlays === 1 && sv2p.status === "" &&
      /(^|&)survey(&|$)/.test(sv2p.hash.slice(1)),
    JSON.stringify(sv2p),
  );
  // SV2k (#366): the back face, on the same run. Deferring the arm inverts an ordering the
  // settle relied on: rearmVoyage used to rebuild the session and paint BOTH faces before
  // rebuildVerso's replaceChildren wiped the verso, which is why the conductor repainted on
  // the far side of that wipe (voyage.ts, rearmVoyage's own note). With the arm pending the
  // engine still holds the OUTGOING world's session, so that repaint would strike the old
  // world's track over the new ghost: the #174 invariant is that a face's ghost and its
  // track come from the SAME draw. The settle now leaves the back face bare and the arm
  // inks it, exactly as the recto is inked. Read in the settle's own microtask checkpoint
  // (the observer batch above), so this cannot sample a frame late.
  check(
    "SV2k the settle leaves the back face to the deferred arm: no outgoing track over the new ghost, and both faces agree once it lands (#174/#366)",
    sv2p.versoAtSwap === false && sv2p.facesAgree,
    JSON.stringify({ versoAtSwap: sv2p.versoAtSwap, facesAgree: sv2p.facesAgree, batches: sv2p.batches }),
  );

  // SV2m (#366): the window the deferral opens on the BACK face. A settle's arm is droppable
  // (a fresh draw bumps worldGen and supersedes it), so a style change made inside the settle's
  // own beat leaves the engine holding the session for the world before last. The turn draw
  // that follows rebuilds the verso ghost for the NEW world, and if the settle repainted the
  // resting track there it would strike that older world's survey over it, for the ~900ms the
  // turn runs. That is the #174 same-draw invariant, and SV2k cannot see it because SV2k
  // drives a Draw and never a turn.
  //
  // Driven exactly, not raced: a MutationObserver callback runs at the microtask checkpoint of
  // the task that mutated, which for the chart swap is INSIDE the settle's own task and so
  // inside the pending arm's rAF window. Dispatching the style change from there is the only
  // way to land it in that window every time.
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
    // The load-bearing clause is the first: with the settle repainting the back face, this
    // reads the seed-7 survey struck over the seed-42 ghost, byte-identical to trackA.
    turningSeen && sv2m.fired && sv2m.versoPoints !== trackA &&
      sv2mAfter.overlays === 1 && sv2mAfter.facesAgree && sv2mAfter.style === "ink" &&
      sv2m.status === "" && sv2mAfter.status === "",
    JSON.stringify({ turningSeen, ...sv2m, versoPoints: (sv2m.versoPoints || "").slice(0, 40),
      versoIsPreviousWorld: sv2m.versoPoints === trackA, after: sv2mAfter }),
  );

  // SV2o (#366): a Draw made while the sheet is ALREADY resting on its verso. shouldTurn takes
  // `flipped`, so that draw settles rather than turning (test/explorer/sheet-turn.test.ts), and
  // the back face is then the VISIBLE one. rebuildVerso replaces it with the new world's ghost,
  // so if the resting track is left to a deferred arm the reader watches a bare new ghost for
  // the whole beat, on the surface they are actually looking at. The deferral buys nothing here
  // either, since the chart it would let paint is facing away. So this draw arms INLINE and the
  // back face changes whole: ghost and track from the same draw, in one task, the #174 rule.
  //
  // Read at the settle's own microtask checkpoint, which is before any deferred arm could have
  // run, so this cannot pass by sampling late.
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
  // #366: the boot settle's arm is deferred like every other landing's, and waitSettled keys
  // on #status, which the settle clears BEFORE the arm. So wait for the ink rather than
  // reading in the settle's shadow. An added wait, not a relaxed predicate: every clause
  // below still asserts the completed track and the silent status line.
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
    // The completed track is back in the predicate, because the title claims it. waitInked above
    // already guarantees it, so the clause cannot fail on its own; it is kept so the check reads
    // as the whole statement it is named for, and so it still bites if that wait is ever
    // removed. `overlays === 1` is the clause the wait does NOT give: a boot that armed twice
    // would show up as two.
    "SV4 a survey deep link restores ticked, resting on the completed track, silently",
    sv4.checked && sv4.vertices > 10 && sv4.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv4.hash.slice(1)) && sv4.status === "" &&
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
  // #366: assert the absence on the far side of a landing's beat, so "arms nothing" cannot
  // be read a frame too early. The box is unticked here, so nothing was ever scheduled; this
  // makes that provable rather than assumed.
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-bothkeys-beat");
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
  // #366: the boot settle defers its arm, and the arm is what paints BOTH faces, so flip
  // only once the recto is inked. Without this the flip can land inside the beat and the
  // comparison below would read a back face the arm had not reached yet.
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
  // #366 SV2l rides on this same turn (see below): the observer is armed BEFORE the style
  // change is dispatched, because the mutation under test is runTurn's own commit ~900ms later.
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
  // #366: the turn's landing defers its arm too, and runTurn commits the new dress into
  // #map (wiping the old overlay) BEFORE it drops .turning, so waitTurned returns over a
  // bare sheet and this wait cannot be satisfied by the outgoing track.
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
    // The surviving track is named in the title, so it stays in the predicate even though the
    // waitInked above guarantees it (see SV4). overlays === 1 is the clause that wait does not
    // give, and it is the one that would catch a landing arm stacking on top of a tick's.
    sv10.turned === true && sv10.style === "ink" && sv10.vertices > 10 && sv10.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv10.hash.slice(1)) && sv10.status === "",
    JSON.stringify({ ...sv10, batches: undefined }),
  );
  // SV2l (#366): the OTHER deferred arm path, guarded on its own. SV2p drives a Draw, so it
  // cannot see the #131 turn's landing at all: reverting only the turn's call site to an
  // inline re-arm left SV2p, SV2k and SV10 all green (the guard-prover proved exactly that),
  // because an inline turn re-arm satisfies SV10's waitInked immediately. Same observer
  // idiom, same discriminator: runTurn commits the new dress as an added <svg> child of #map,
  // and the arm's overlay must arrive in a LATER task with a rendering opportunity between.
  //
  // framesBetween is even more load-bearing here than in SV2p, and the two clauses beside it
  // are near-decorative on this path: runTurn commits from `anim.finished.then(...)` while the
  // landing arms from `runTurn(...).then(...)`, two microtasks of the SAME task, so the batch
  // ALWAYS splits and chartAlone plus the batch order pass even with the arm inline. Measured
  // on the reverted call site: chartAlone true, inkBatch 1 > chartBatch 0, framesBetween 0.
  check(
    "SV2l the turn's landing pays its arm after the new dress paints, not with it (#366)",
    sv10.chartAlone && sv10.inkBatch > sv10.chartBatch && sv10.framesBetween >= 1 &&
      sv10.batches.length === 2,
    JSON.stringify({ batches: sv10.batches, chartBatch: sv10.chartBatch, inkBatch: sv10.inkBatch,
      chartAlone: sv10.chartAlone, framesBetween: sv10.framesBetween }),
  );
  await shoot("explorer-survey-turned-ink.png");

  // SV2n (#366): reduced motion, which the acceptance names and nothing here covered. Under
  // `prefers-reduced-motion: reduce` shouldTurn is false, so a style change takes the SETTLE
  // branch instead of the turn: a path this change moved from an inline re-arm to a deferred
  // one. "Unaffected" is asserted as three things rather than assumed. The sheet still does
  // not turn (an instant swap, as before), the deferral behaves exactly as it does with motion
  // on (the swap and the ink in different tasks, a frame apart), and no animation runs on the
  // overlay, which is SV2b's claim re-asserted on this path since a scheduling yield is not
  // motion and must not have become any.
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
