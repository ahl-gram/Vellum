// The Address checks (A1-A10, #192): the live-state keys of the Explorer hash. A deep
// link carrying the bare `survey` flag or `year=N` restores the armed instrument at
// rest (the ratified faithful restore: draw, arm, then the one-shot camera), the
// writer emits exactly one live key or neither, and a recipe-only link stays
// byte-clean. Runs LAST: self-contained like the hunt / Print Room / home suites
// (navigates itself, carries its own scoped no-4xx + console-error delta).
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitReady, consoleErrors, http4xx, PORT } = ctx;

  const EXP = `http://127.0.0.1:${PORT}/explorer/`;
  const errBase = consoleErrors.length;
  const httpBase = http4xx.length;

  // Every deep-link check re-bootstraps: a navigate differing only in the hash is a
  // same-document change and never re-runs the boot, so go through about:blank first
  // (the suite-zoom Z13 idiom).
  const gotoAddress = async (hash, label) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: EXP + hash });
    await waitReady();
    await waitSettled(label);
  };

  // Ground truth from the page's own engine: the year range the chronicle scrubs.
  await gotoAddress("#seed=42&style=antique", "address-base");
  const sm = await evaluate(`(()=>{
    const r=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}});
    const places=r.manifest.places;
    return{present:r.manifest.presentYear,minFounded:Math.min(...places.map((p)=>p.founded)),count:places.length};
  })()`);
  const midYear = Math.floor((sm.minFounded + sm.present) / 2);

  // A1: a year=N deep link restores the chronicle wound to N, at rest: box ticked,
  // panel shown, slider and readout at N, the world partially grown, roads hidden in
  // the past. waitSettled passing above is itself the settle-discipline proof.
  await gotoAddress(`#seed=42&style=antique&year=${midYear}`, "address-year");
  const a1 = await evaluate(`(()=>{
    const slider=document.getElementById("scrub-range");
    const roads=document.querySelector('#map #layer-roads');
    const vis=[...document.querySelectorAll('#map #layer-settlements g.settlement')].filter((g)=>getComputedStyle(g).display!=="none").length;
    return{checked:document.getElementById("chronicle").checked,panelShown:!document.getElementById("scrubber").hidden,
      val:Number(slider.value),readout:document.getElementById("scrub-year").textContent,
      roads:roads?getComputedStyle(roads).display:"(no-el)",vis,status:document.getElementById("status").textContent};
  })()`);
  check(
    `A1 a year=${midYear} deep link restores the chronicle at rest on that year`,
    a1.checked && a1.panelShown && a1.val === midYear && a1.readout === `year ${midYear}` &&
      a1.roads === "none" && a1.vis > 0 && a1.vis < sm.count && a1.status === "",
    JSON.stringify({ a1, midYear, count: sm.count }),
  );
  await shoot("explorer-address-year.png");

  // A2: faithful restore, the ratified decision B: year=N COMPOSES with cx/cy/k. The
  // boot ticks the box (no interactive ceremony, so no snap-home), the settle arms the
  // chronicle, and the pending camera applies after. The converged hash then carries
  // BOTH the year and the camera.
  await gotoAddress(`#seed=42&style=antique&year=${midYear}&cx=0.5&cy=0.35&k=3`, "address-year-camera");
  await sleep(400); // the camera's debounced settle re-syncs the hash
  const a2 = await evaluate(`(()=>{
    const p=new URLSearchParams(location.hash.slice(1));
    return{checked:document.getElementById("chronicle").checked,val:Number(document.getElementById("scrub-range").value),
      k:window.__vellumZoomState().k,year:p.get("year"),cx:p.get("cx"),kp:p.get("k")};
  })()`);
  check(
    "A2 year=N composes with the camera: both restore, and the hash re-carries both",
    a2.checked && a2.val === midYear && a2.k === 3 && a2.year === String(midYear) && a2.cx !== null && a2.kp !== null,
    JSON.stringify(a2),
  );

  // A3: the bare survey flag restores the voyage at rest on the COMPLETED track (the
  // ratified rest): box ticked, closed circuit, every margin-log row revealed, and
  // #status EMPTY, proving the restore rode the silent rearm path (an applyVoyage
  // restore would post the completion summary and hang waitSettled).
  await gotoAddress("#seed=42&style=antique&survey", "address-survey");
  const a3 = await evaluate(`(()=>{
    const raw=document.querySelector(".voyage-track").getAttribute("points").trim().split(" ");
    const log=window.__vellumVoyageLog();
    const plan=window.__vellumVoyagePlan();
    return{checked:document.getElementById("voyage").checked,ports:plan?plan.ports.length:0,
      first:raw[0],last:raw[raw.length-1],pts:raw.length,logged:log?log.logged:-1,rows:log?log.rows:-1,
      visible:!!(log&&log.visible),status:document.getElementById("status").textContent,
      hash:location.hash.slice(1)};
  })()`);
  check(
    "A3 a bare survey deep link restores the voyage at rest on the closed track, silently",
    a3.checked && a3.ports > 1 && a3.first === a3.last && a3.pts > a3.ports && a3.visible &&
      a3.logged === a3.rows && a3.rows > 1 && a3.status === "" &&
      /(^|&)survey(&|$)/.test(a3.hash) && !a3.hash.includes("survey="),
    JSON.stringify(a3),
  );
  await shoot("explorer-address-survey.png");

  // A4: survey + camera compose the same way (the voyage never reset the camera, so
  // this is the easy half of the asymmetry).
  await gotoAddress("#seed=42&style=antique&survey&cx=0.5&cy=0.35&k=3", "address-survey-camera");
  await sleep(400);
  const a4 = await evaluate(`(()=>{
    const p=new URLSearchParams(location.hash.slice(1));
    return{checked:document.getElementById("voyage").checked,k:window.__vellumZoomState().k,
      survey:/(^|&)survey(&|$)/.test(location.hash.slice(1)),kp:p.get("k")};
  })()`);
  check(
    "A4 the bare survey flag composes with the camera: both restore, the hash re-carries both",
    a4.checked && a4.k === 3 && a4.survey && a4.kp !== null,
    JSON.stringify(a4),
  );

  // A5: both live keys at once is a nonsensical set, ignored WHOLE (the camera's
  // discipline): neither instrument arms, the chart is the plain still.
  await gotoAddress(`#seed=42&style=antique&survey&year=${midYear}`, "address-both-keys");
  const a5 = await evaluate(`(()=>({chronicle:document.getElementById("chronicle").checked,
    voyage:document.getElementById("voyage").checked,
    overlay:!!document.querySelector("#map .voyage-overlay"),
    panelShown:!document.getElementById("scrubber").hidden}))()`);
  check(
    "A5 a link carrying both survey and year=N arms neither (nonsensical set ignored)",
    !a5.chronicle && !a5.voyage && !a5.overlay && !a5.panelShown,
    JSON.stringify(a5),
  );

  // A8 (on the same clean base the writer checks need): a recipe-only link emits no
  // live key, so every existing shared link stays byte-identical.
  await gotoAddress("#seed=42&style=antique", "address-clean-base");
  const a8 = await evaluate(`location.hash.slice(1)`);
  check(
    "A8 a recipe-only link stays clean: the writer emits no live key while disarmed",
    !/(^|&)survey(=|&|$)/.test(a8) && !/(^|&)year=/.test(a8) && /(^|&)seed=42(&|$)/.test(a8),
    a8,
  );

  // A6: the writer follows the voyage toggle, both directions, in the ratified BARE
  // spelling (never survey=).
  const a6on = await evaluate(`(()=>{
    const chk=document.getElementById("voyage");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    return location.hash.slice(1);
  })()`);
  const a6off = await evaluate(`(()=>{
    const chk=document.getElementById("voyage");chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));
    return location.hash.slice(1);
  })()`);
  check(
    "A6 ticking the voyage writes the bare survey key; unticking removes it",
    /(^|&)survey(&|$)/.test(a6on) && !a6on.includes("survey=") && !/(^|&)survey(=|&|$)/.test(a6off),
    JSON.stringify({ a6on, a6off }),
  );

  // A7: the writer follows the chronicle toggle (parked at the present) and the
  // slider's RELEASE (change), and unticking removes the key.
  const a7on = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=true;chk.dispatchEvent(new Event("change",{bubbles:true}));
    return{hash:location.hash.slice(1),max:Number(document.getElementById("scrub-range").max)};
  })()`);
  const a7drag = await evaluate(`(()=>{
    const s=document.getElementById("scrub-range");s.value="${midYear}";
    s.dispatchEvent(new Event("input",{bubbles:true}));
    s.dispatchEvent(new Event("change",{bubbles:true}));
    return location.hash.slice(1);
  })()`);
  const a7off = await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));
    return location.hash.slice(1);
  })()`);
  check(
    "A7 ticking the chronicle writes year=present, a slider release re-writes it, unticking removes it",
    new URLSearchParams(a7on.hash).get("year") === String(a7on.max) &&
      new URLSearchParams(a7drag).get("year") === String(midYear) &&
      !/(^|&)year=/.test(a7off),
    JSON.stringify({ a7on, a7drag, a7off }),
  );

  // A9: prefers-reduced-motion lands the deep link on the target frame with no sweep:
  // the restore is a single still paint either way, so the armed state is identical.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await gotoAddress(`#seed=42&style=antique&year=${midYear}`, "address-reduced");
  const a9 = await evaluate(`(()=>({checked:document.getElementById("chronicle").checked,
    val:Number(document.getElementById("scrub-range").value),
    play:document.getElementById("scrub-play").textContent,
    status:document.getElementById("status").textContent}))()`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "A9 under reduced motion the deep link lands parked on the year, Play offered, no sweep",
    a9.checked && a9.val === midYear && a9.play === "Play" && a9.status === "",
    JSON.stringify(a9),
  );

  // A10: the whole address flow added no console errors and no new 4xx. The stock
  // "AbortError: Transition was skipped" is excused as in suite-home: motion.css opts
  // the site into cross-document view transitions, and this suite chains navigations
  // fast enough to skip some.
  const errDelta = consoleErrors
    .slice(errBase)
    .filter((e) => !e.includes("AbortError: Transition was skipped"));
  const httpDelta = http4xx.slice(httpBase).filter((u) => !/favicon/i.test(u));
  check(
    "A10 the address flow is clean (no console errors, no new 4xx)",
    errDelta.length === 0 && httpDelta.length === 0,
    [...errDelta, ...httpDelta].join(" | ") || "clean",
  );
}
