// The Wayfarer's voyage re-hosted on the Reading Room (RW1-RW13, #320 Sub 3, porting
// the W1-W8 core of suite-voyage.mjs). Ratified 2026-08-10 on #320 (decision A): the
// deterministic voyage seams retire from the Explorer at Sub 4, so every W check that
// reaches a non-rest position needs a room-hosted successor HERE.
//
// The class-(a) criterion this suite is built on is the corrected one, also ratified on
// #320: "requires a position that is not the survey-chamber t=1 rest or the present-year
// park." The body's original "presses Play or drags mid-sweep" would have left W2/W3/W4
// and most of the route suite behind, because those reach mid-itinerary ports through
// __vellumVoyageStepTo and never touch the clock. suite-voyage-route.mjs:15 says as much
// in its own header.
//
// What did NOT port:
//   W7  "ages off: overlay removed, sessions dropped". The room is ALWAYS armed; there
//       is no off.
//   W8  "a redraw re-arms in the SAME chamber". This is deliberately Explorer-only: the
//       room's ratified counter draw parks at the PRESENT (#221), which RR22 pins. The
//       contract does not port, it is superseded. Sub 4 retires it rather than moving it.
import { makeRoom, scopedHealth } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep } = ctx;
  const room = makeRoom(ctx);
  const gate = scopedHealth(ctx);

  // The room arrives armed and parked at the present, which is exactly W1's post-toggle
  // state, so the suite opens where the Explorer's opened after ticking the checkbox.
  const booted = await room.goto("#seed=42&style=antique&legend=1");
  check("RW0 the room boots armed and settled", booted);

  const vm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const capital=r.manifest.places.find((p)=>p.kind==="capital");
    return {capitalIdx:capital?capital.idx:-1,count:r.manifest.places.length};
  })()`);

  // RW1 (W1): the armed present park. The voyage overlay is built inside the chart mount
  // (hidden while the ages chamber holds the sheet), the plan starts at the capital, and
  // the journal's annal rows all rest inked, the story fully told.
  const rw1 = await evaluate(`(()=>{
    const ov=document.querySelector(".rf-chart .voyage-overlay");
    const plan=window.__vellumVoyagePlan();
    const a=window.__vellumAgesState();
    const annals=[...document.querySelectorAll(".rf-log-strip li:not(.prologue):not(.annals-head)")];
    return{hasOverlay:!!ov,ports:plan?plan.ports.length:0,firstIdx:plan&&plan.ports[0]?plan.ports[0].idx:-1,
      chamber:a?a.chamber:"",year:a?a.year:-1,max:a?a.max:-2,
      annals:annals.length,annalsInked:annals.filter((li)=>li.classList.contains("inked")).length};
  })()`);
  check(
    "RW1 armed at the present: overlay built, plan starts at the capital, annals told",
    rw1.hasOverlay && rw1.ports > 1 && rw1.firstIdx === vm.capitalIdx &&
      rw1.chamber === "ages" && rw1.year === rw1.max &&
      rw1.annals > 0 && rw1.annalsInked === rw1.annals,
    JSON.stringify(rw1) + ` capital=${vm.capitalIdx}`,
  );

  // RW2 (W1c, #312): the manuscript dressing, mirrored rule for rule in BOTH hosts. The
  // chronicler's heading stands once between the hands, the prologue gutter counts
  // STRICTLY increasing days from day 1 (the year lives in the attribution alone), and
  // each hand's first line opens with an initial. The day-gutter DOM in
  // voyage-log-panel.ts has NO unit coverage, so this check and its Explorer twin are
  // the only guards on it.
  const rw2 = await evaluate(`(()=>{
    const lis=[...document.querySelectorAll(".rf-log-strip li")];
    const heads=lis.filter((li)=>li.classList.contains("annals-head"));
    const headIdx=lis.indexOf(heads[0]);
    const lastPro=lis.map((li)=>li.classList.contains("prologue")).lastIndexOf(true);
    const days=lis.filter((li)=>li.classList.contains("prologue")).map((li)=>li.querySelector(".cr-year").textContent);
    const nums=days.map((d)=>/^day \\d+$/.test(d)?Number(d.slice(4)):NaN);
    const strict=nums.length>0&&nums.every((n,i)=>i===0?n===1:n>nums[i-1]);
    return{heads:heads.length,headAfterPrologue:headIdx===lastPro+1,strict,firstDays:days.slice(0,3),
      proDc:!!document.querySelector(".rf-log-strip li.prologue .cr-text .cr-dc"),
      annDc:!!document.querySelector(".rf-log-strip li:not(.prologue):not(.annals-head) .cr-text .cr-dc")};
  })()`);
  check(
    "RW2 #312 manuscript dressing: one chronicler's heading after the prologue, strictly increasing day gutters, initials on both hands",
    rw2.heads === 1 && rw2.headAfterPrologue && rw2.strict && rw2.proDc && rw2.annDc,
    JSON.stringify(rw2),
  );

  // RW3 (W1b): the seam crossed LEFTWARD. Driving the bar to its midpoint enters the
  // survey chamber at its rest (t=1, the ratified bare-survey pose): the track shows, the
  // readout flips to the word, and the annals dim back to untold.
  const rw3 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector(".rf-chart .voyage-overlay");
    const annals=[...document.querySelectorAll(".rf-log-strip li:not(.prologue):not(.annals-head)")];
    return{chamber:a?a.chamber:"",t:a?a.t:-1,readout:document.querySelector(".rf-year").textContent,
      overlayVisible:!!ov&&ov.style.display!=="none",
      annalsInked:annals.filter((li)=>li.classList.contains("inked")).length};
  })()`);
  check(
    "RW3 the seam crossed leftward: survey chamber at t=1, track shown, word readout, annals dim",
    rw3.chamber === "survey" && rw3.t === 1 && rw3.readout === "the survey" &&
      rw3.overlayVisible && rw3.annalsInked === 0,
    JSON.stringify(rw3),
  );

  const plan = await evaluate(`(()=>{const p=window.__vellumVoyagePlan();return{ports:p.ports.map((x)=>({idx:x.idx,logLine:x.logLine})),legs:p.legs.length};})()`);
  // #275: legs === ports, and the LAST leg is the one home, so the step that lands on the
  // final distinct port is legs - 1 and stepping to legs itself is the HOMECOMING (t=1).
  const lastPort = plan.legs - 1;
  const homeStep = plan.legs;
  const midPort = Math.max(1, Math.floor(plan.legs / 2));
  const entries = plan.ports.length + 1;

  // #120: the mark is a ship on sea legs and a rider on road legs, so select whichever is
  // displayed. Reading .voyage-ship unconditionally throws on the ~94% of legs that ride.
  const markFn = `const mark=()=>{const s=document.querySelector(".rf-chart .voyage-ship");const r=document.querySelector(".rf-chart .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};`;
  const stepTo = (n) =>
    evaluate(`(()=>{${markFn}window.__vellumVoyageStepTo(${n});const m=mark();const t=m?m.getAttribute("transform"):"";const glyph=m?m.getAttribute("class"):"";const raw=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ");const log=window.__vellumVoyageLog();return{status:document.querySelector(".rf-status").textContent,tf:t,glyph,pts:raw.length,first:raw[0],last:raw[raw.length-1],logged:log?log.logged:-1,rows:log?log.rows:-1,visible:!!(log&&log.visible),lastText:log&&log.logged>0?log.entries[log.logged-1].text:""};})()`);

  // RW4 (W2): step to the origin. One row per port plus the homecoming, the first
  // brightened, and it reads as a DEPARTURE (the surveyor sets out, does not arrive).
  const s0 = await stepTo(0);
  check(
    "RW4 step to the capital: the margin log opens with the departure entry",
    s0.visible && s0.rows === entries && s0.logged === 1 && s0.lastText.includes("set out"),
    JSON.stringify({ s0, ports: plan.ports.length, entries }),
  );

  // RW5 (W3): a mid port. That many entries brightened, the track grew, the mark moved.
  const sMid = await stepTo(midPort);
  check(
    "RW5 step to a mid port: the log accumulated to that port, the track grew, the mark moved",
    sMid.logged === midPort + 1 && sMid.pts > s0.pts && sMid.tf !== s0.tf,
    JSON.stringify({ mid: midPort, sMid, s0pts: s0.pts }),
  );

  // RW6 (W4): the last PORT. Every port's entry has brightened but the survey is NOT
  // finished, so the homecoming row is still dim and the one status summary has not
  // posted. This is the direct guard on #275's completion check: comparing `arrived`
  // against ports.length instead of the log's entry count posts the summary a whole leg
  // early, and then again at the homecoming.
  const sLast = await stepTo(lastPort);
  check(
    "RW6 step to the last port: every port is logged, but the survey has not come home yet",
    sLast.logged === plan.ports.length && sLast.logged < entries && sLast.status === "" &&
      sLast.pts > plan.ports.length,
    JSON.stringify({ last: lastPort, sLast, ports: plan.ports.length, entries }),
  );

  // RW7 (W4c, #275): step home. The homecoming row brightens last, it reads as a return,
  // the single completion summary posts, and the resting track is a CLOSED CIRCUIT: its
  // last vertex is string-identical to its first, the very projection of the capital that
  // leg 0 started from.
  const sHome = await stepTo(homeStep);
  check(
    "RW7 the survey sails home: the homecoming closes the log and the track is a closed circuit",
    sHome.logged === entries && sHome.lastText.includes("whence we set out") &&
      sHome.status.startsWith("The survey is charted") && sHome.first === sHome.last &&
      sHome.pts > sLast.pts,
    JSON.stringify({ home: homeStep, sHome, entries }),
  );

  // RW8 (W4b): stepping BACK from the finished survey clears the completion summary. The
  // settle invariant that every draw and every poll keys on must hold at EVERY resting
  // frame, not just t=1, so the status line must return to "" here and never hold a stale
  // "The survey is charted...".
  const sBack = await stepTo(midPort);
  check(
    "RW8 stepping back from the last port clears the completion summary from the status line",
    sBack.status === "" && sBack.logged === midPort + 1,
    JSON.stringify(sBack),
  );
  await shoot("reading-room-voyage.png");

  // RW9 (W5): the track lives in a SIBLING overlay svg, never inside the baked chart, so
  // a saved chart can never contain it.
  const rw9 = await evaluate(`(()=>{
    const chart=document.querySelector(".rf-chart svg:not(.voyage-overlay)");
    const overlay=document.querySelector(".rf-chart .voyage-overlay");
    return{chart:!!chart,trackInChart:chart?!!chart.querySelector(".voyage-track"):false,
      trackInOverlay:overlay?!!overlay.querySelector(".voyage-track"):false};
  })()`);
  check("RW9 the track is a sibling overlay, never inside the baked chart", rw9.chart && !rw9.trackInChart && rw9.trackInOverlay, JSON.stringify(rw9));

  // RW10 (W6): the seam crossed RIGHTWARD by a discrete step. The bar rests at the seam
  // from RW3; one step into the ages half crosses freely (the detent governs pointer
  // drags only): the world jumps back to the earliest years, the surveyor's ink leaves
  // the sheet, and the readout flips to the year.
  const glyphCount = `const shown=[...document.querySelectorAll(".rf-chart #layer-settlements g.settlement")].filter((g)=>g.style.display!=="none").length;`;
  const presentShown = await evaluate(`(()=>{${glyphCount}return shown;})()`);
  const rw10 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    s.value=String(Number(s.max)/2+1);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector(".rf-chart .voyage-overlay");
    ${glyphCount}
    return{chamber:a?a.chamber:"",year:a?a.year:-1,min:a?a.min:-2,
      readout:document.querySelector(".rf-year").textContent,
      overlayHidden:!!ov&&ov.style.display==="none",shown,
      panelShown:!document.querySelector(".rf-ages").hidden};
  })()`);
  check(
    "RW10 the seam crossed rightward: ages chamber at the first years, track gone, year readout",
    rw10.chamber === "ages" && rw10.year === rw10.min + 1 && /^year \d+$/.test(rw10.readout) &&
      rw10.overlayHidden && rw10.shown < presentShown && rw10.panelShown,
    JSON.stringify(rw10) + ` present=${presentShown}`,
  );

  // RW11 (W6b): the crossing is REVERSIBLE. Stepping back to the seam restores the survey
  // chamber exactly: the full present world, the resting track, the word.
  const rw11 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");
    s.value=String(Number(s.max)/2);
    s.dispatchEvent(new Event("input",{bubbles:true}));
    const a=window.__vellumAgesState();
    const ov=document.querySelector(".rf-chart .voyage-overlay");
    ${glyphCount}
    return{chamber:a?a.chamber:"",t:a?a.t:-1,readout:document.querySelector(".rf-year").textContent,
      overlayVisible:!!ov&&ov.style.display!=="none",shown};
  })()`);
  check(
    "RW11 the crossing reverses: back at the seam the survey chamber restores the present world",
    rw11.chamber === "survey" && rw11.t === 1 && rw11.readout === "the survey" &&
      rw11.overlayVisible && rw11.shown === presentShown,
    JSON.stringify(rw11) + ` present=${presentShown}`,
  );

  // RW12 (W6c): the HARD DETENT under a REAL CDP drag. A pointer drag from inside the
  // survey half that crosses the seam by less than the escape band HOLDS at the seam;
  // pulled past the band it releases into the ages chamber at the raw position. The room
  // wires the same pointerdown/pointerup/pointercancel triple to the same engine entries,
  // so the detent is the room's too.
  //
  // The moves carry button:"left" DELIBERATELY: Chromium's native slider drag controller
  // ignores a move whose button is "none", so the thumb never follows and the detent has
  // nothing to hold.
  await evaluate(`(()=>{document.querySelector(".rf-range").scrollIntoView({block:"center"});})()`);
  const bar = await evaluate(`(()=>{const s=document.querySelector(".rf-range");const r=s.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};})()`);
  const TH = 16; // the .ages-range thumb width (living-chart.css)
  const xAt = (u) => Math.round(bar.x + TH / 2 + u * (bar.w - TH));
  const yMid = Math.round(bar.y + bar.h / 2);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: xAt(0.4), y: yMid, button: "left", buttons: 1, clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: xAt(0.52), y: yMid, button: "left", buttons: 1 });
  const held = await evaluate(`(()=>{const a=window.__vellumAgesState();return{u:a.u,held:a.held,chamber:a.chamber,readout:document.querySelector(".rf-year").textContent};})()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: xAt(0.6), y: yMid, button: "left", buttons: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: xAt(0.6), y: yMid, button: "left", buttons: 0, clickCount: 1 });
  const escaped = await evaluate(`(()=>{const a=window.__vellumAgesState();return{u:a.u,held:a.held,chamber:a.chamber};})()`);
  check(
    "RW12 the hard detent: a drag holds at the seam inside the band and releases past it",
    held.held === true && held.u === 0.5 && held.chamber === "survey" && held.readout === "the survey" &&
      escaped.held === false && escaped.chamber === "ages" && escaped.u > 0.55,
    JSON.stringify({ held, escaped }),
  );

  // RW13 (W6d): a running PLAY crosses the seam WITHOUT pausing (the detent governs drags
  // only), so the voice hands off mid-flight. Start just shy of the survey's end so the
  // crossing lands within a couple of seconds, then watch the chamber flip while the
  // button stays "Pause".
  await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");
    s.value=String(Math.round(Number(s.max)/2*0.97));
    s.dispatchEvent(new Event("input",{bubbles:true}));
    document.querySelector(".rf-play").click();
  })()`);
  let sawSurveyPlaying = false, crossed = null;
  for (let i = 0; i < 60; i++) {
    const st = await evaluate(`(()=>{const a=window.__vellumAgesState();return{chamber:a.chamber,playing:a.playing,lbl:document.querySelector(".rf-play").textContent};})()`);
    if (st.chamber === "survey" && st.playing) sawSurveyPlaying = true;
    if (st.chamber === "ages") { crossed = st; break; }
    await sleep(100);
  }
  await evaluate(`(()=>{const b=document.querySelector(".rf-play");if(b.textContent==="Pause")b.click();})()`);
  check(
    "RW13 Play sweeps through the seam without pausing: the voice hands off mid-flight",
    sawSurveyPlaying && !!crossed && crossed.playing === true && crossed.lbl === "Pause",
    JSON.stringify({ sawSurveyPlaying, crossed }),
  );

  gate.check("RW14 the room voyage run is clean (no console errors, no new 4xx)");
}
