// The Survey Ink checks (SV1-SV10, #321, Survey and Story Sub 4): the static
// Explorer. The scrubber panel, Play, the bar, and the journal strip are GONE from
// the DOM (not hidden); the one `survey` checkbox is 1:1 with the bare `survey` hash
// flag and inks the completed track instantly, at rest; an inbound `year=N` link
// forwards to the Reading Room with the hash intact; the verso mirrors the resting
// track with no snap; and the journal pointer's href tracks every hash write. (#270
// ruling 2 reshaped the pointer checks here: the old hidden-unless-ticked caption
// became the ALWAYS-visible gold #journal-link button in The Press, so the hidden
// gate probes retired and the href sync is asserted in both directions instead.)
// Successors for the retired Explorer-hosted live checks are the room-hosted RS/RW/
// RV/RA suites (#320); this suite guards only what the static Explorer still owes.
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

  // SV2: ticking the box inks the COMPLETED track instantly, at rest. The handler is
  // synchronous, so by the time this evaluate returns the full track must be on the
  // sheet (a sweep would start near zero length), the status line silent, the hash
  // carrying the bare survey flag, and the journal button's href carrying this
  // world's survey address. The readback happens in the same call as the dispatch on
  // purpose.
  const sv2 = await evaluate(`(()=>{
    const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
    const t=document.querySelector("#map .voyage-overlay .voyage-track");
    const pts=t?(t.getAttribute("points")||""):"";
    return{vertices:pts?pts.trim().split(/\\s+/).length:0,
      hash:location.hash,status:document.getElementById("status").textContent,
      href:document.getElementById("journal-link").getAttribute("href")};
  })()`);
  check(
    "SV2 ticking survey inks the completed track instantly, at rest, and writes the bare flag",
    sv2.vertices > 10 && /(^|&)survey(&|$)/.test(sv2.hash.slice(1)) && !/year=/.test(sv2.hash) &&
      sv2.status === "" && sv2.href === "/reading-room/" + sv2.hash,
    JSON.stringify({ ...sv2, hash: sv2.hash }),
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

  // SV7: the journal pointer is a real pointer: following the caption link lands in
  // the Reading Room on THIS world's journal at the survey rest.
  const sv7href = await evaluate(`document.getElementById("journal-link").getAttribute("href")`);
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${sv7href}` });
  const sv7up = (await room.boot()) && (await room.settled());
  const sv7 = sv7up
    ? await evaluate(`(()=>{const a=window.__vellumReadingRoomAges();
        return{seed:window.__vellumReadingRoomState().seed,chamber:a?a.chamber:"",t:a?a.t:-1};})()`)
    : { seed: -1, chamber: "", t: -1 };
  check(
    "SV7 the caption's journal link opens this world's journal in the room, at the survey rest",
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
