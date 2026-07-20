// Glass Sub 9 (#170) Ceremony (G): the antique voice on the zoom cluster, the voiced
// glide, and the redraft ink-in with tier-staggered name dry-in. Per the D-pattern,
// these assert the PLUMBING (classes, tokens, inline dash props, aria/microcopy),
// mid-flight and at rest, present normally and collapsed under reduced motion; the
// choreography itself is eyeballed via out/ screenshots.
//
// Ground truth at seed 42 (scratch scan, 2026-07-19): the world sheet labels 25 of 26
// settlements; the band-1 window centred (0.5, 0.5) newly labels exactly Lokai
// (village); the k=3.6 hop to band 2 at the same centre reveals no new name. The
// checks assert the self-consistent invariant (every dry-in name is absent from the
// outgoing sheets' labels) rather than hardcoding names; Lokai is logged as detail.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled } = ctx;

  // Clean antique seed-42 base, chronicle/voyage off, camera home, redraft OFF for
  // the voice + glide block (geometric only; the ceremony block turns it on below).
  await evaluate(`(()=>{for(const id of ["chronicle","voyage"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("glass-ceremony-base");
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);

  // Shared helpers (suite-zoom's idioms).
  const st = () => evaluate(`window.__vellumZoomState()`);
  const settleK = async (target) => {
    for (let i = 0; i < 100; i++) {
      const s = await st();
      if (Math.abs(s.k - target) < 1e-6) return s;
      await sleep(40);
    }
    return await st();
  };
  const settleHome = async () => {
    for (let i = 0; i < 100; i++) {
      const s = await st();
      if (s.k === 1 && s.x === 0 && s.y === 0) return s;
      await sleep(40);
    }
    return await st();
  };
  const rgn = () => evaluate(`window.__vellumRegion()`);
  const enterAt = (k, cu, cv) =>
    evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-(${cu})*${k}*W,y:H/2-(${cv})*${k}*H});})()`);
  const waitRedraft = async (prev) => {
    for (let i = 0; i < 100; i++) { const s = await rgn(); if (s.redrafts > prev) return s; await sleep(40); }
    return await rgn();
  };

  // G1: the cluster speaks in the antique voice and the keys legend is VISIBLE (Sub 4's
  // handoff: the keys were announced only via the viewport aria-label, undiscoverable by
  // a sighted mouse user; Alex chose a small legend by the cluster). Structural: group
  // label, per-button voiced title + functional aria-label, drawn svg glyphs (no bare
  // "+"/"-" text glyphs), and the legend present, aria-hidden, with visible text.
  const g1 = await evaluate(`(()=>{
    const grp=document.getElementById("zoom-controls");
    const btn=(id)=>{const b=document.getElementById(id);return{title:b.getAttribute("title"),aria:b.getAttribute("aria-label"),svg:!!b.querySelector("svg"),text:(b.textContent||"").trim()};};
    const legend=grp?grp.querySelector(".zoom-keys"):null;
    const legendVisible=!!legend&&legend.offsetWidth>0&&legend.offsetHeight>0;
    return{grpAria:grp?grp.getAttribute("aria-label"):null,
      zin:btn("zoom-in"),zout:btn("zoom-out"),zreset:btn("zoom-reset"),
      legend:!!legend,legendVisible,legendAriaHidden:legend?legend.getAttribute("aria-hidden"):null,
      legendText:legend?(legend.textContent||"").replace(/\\s+/g," ").trim():""};
  })()`);
  check(
    "G1 the cluster speaks in the antique voice and the keys legend is visible by it (#170 voice + Sub 4 handoff)",
    g1.grpAria === "The Surveyor's Glass" &&
      g1.zin.title === "Lean closer" && /zoom in/i.test(g1.zin.aria || "") && g1.zin.svg && g1.zin.text === "" &&
      g1.zout.title === "Stand back" && /zoom out/i.test(g1.zout.aria || "") && g1.zout.svg && g1.zout.text === "" &&
      g1.zreset.title === "The full sheet" && /reset/i.test(g1.zreset.aria || "") && g1.zreset.svg &&
      g1.legend && g1.legendVisible && g1.legendAriaHidden === "true" &&
      /0/.test(g1.legendText) && /pan/i.test(g1.legendText),
    JSON.stringify(g1),
  );

  // G2a: a button press GLIDES (animated, not instant): immediately after the click the
  // camera has not yet reached the step target, then it settles exactly there.
  const g2aNow = await evaluate(`(()=>{document.getElementById("zoom-in").click();return window.__vellumZoomState().k;})()`);
  const g2aEnd = await settleK(1.4);
  check(
    "G2a a zoom button glides: mid-flight short of the step, settles exactly at 1.4 (#170 voiced glide)",
    g2aNow < 1.4 - 1e-6 && Math.abs(g2aEnd.k - 1.4) < 1e-6,
    `immediately=${g2aNow} settled=${g2aEnd.k}`,
  );

  // G2b: rapid presses COMPOUND against the pending glide target (never the mid-flight k):
  // from home, two back-to-back presses land 1.4^2 = 1.96 exactly like two settled ones.
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const b=document.getElementById("zoom-in");b.click();b.click();})()`);
  const g2b = await settleK(1.96);
  check(
    "G2b rapid presses compound to 1.96 (the glide flies to a pending absolute target, #170)",
    Math.abs(g2b.k - 1.96) < 1e-6,
    `settled=${g2b.k}`,
  );

  // G2b2: the CROSS-FRAME burst (review finding). d3 starts a superseding transition one
  // frame after it is scheduled, at which point it interrupts its predecessor -- whose
  // end/interrupt handler must NOT clear the newer press's pending target (the glideSeq
  // guard). Three presses spaced ~60ms (well past a frame, well inside the 300ms glide)
  // must land 1.4^3 = 2.744, not a compound off some mid-flight k.
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(
    `(async()=>{const b=document.getElementById("zoom-in");const wait=(ms)=>new Promise(r=>setTimeout(r,ms));` +
      `b.click();await wait(60);b.click();await wait(60);b.click();})()`,
    true,
  );
  const g2b2 = await settleK(2.744);
  check(
    "G2b2 a cross-frame burst still compounds: three presses at ~60ms land exactly 1.4^3 (the glideSeq guard, #170)",
    Math.abs(g2b2.k - 2.744) < 1e-6,
    `settled=${g2b2.k}`,
  );

  // G2c: the keyboard rides the same glide, and "0" glides home AND drops cx/cy/k from the
  // hash once the leaf lands (the explicit syncHash moved to the glide's end; a link copied
  // after the home settles must never carry a stale camera).
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");vp.focus();vp.dispatchEvent(new KeyboardEvent("keydown",{key:"+",bubbles:true}));})()`);
  const g2cIn = await settleK(1.4);
  await sleep(400); // let the settle debounce write cx/cy/k so the drop below is observable
  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");vp.dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}));})()`);
  const g2cHome = await settleHome();
  let g2cHash = null;
  for (let i = 0; i < 50; i++) {
    g2cHash = await evaluate(`(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),k:p.get("k")};})()`);
    if (g2cHash.cx === null && g2cHash.k === null) break;
    await sleep(40);
  }
  check(
    "G2c the keys glide too; 0 glides home and the hash drops cx/cy/k at the landing (#170)",
    Math.abs(g2cIn.k - 1.4) < 1e-6 && g2cHome.k === 1 && g2cHome.x === 0 && g2cHome.y === 0 &&
      g2cHash.cx === null && g2cHash.k === null,
    `in=${g2cIn.k} home=${JSON.stringify(g2cHome)} hash=${JSON.stringify(g2cHash)}`,
  );

  // G3: reduced motion collapses the glide to the instant baseline Sub 4 shipped: the
  // button lands its step and "0" lands home IN THE SAME TURN, hash already clean.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const g3 = await evaluate(`(()=>{
    window.__vellumZoomTo({k:1,x:0,y:0});
    document.getElementById("zoom-in").click();
    const stepK=window.__vellumZoomState().k;
    const vp=document.getElementById("map-viewport");vp.focus();
    vp.dispatchEvent(new KeyboardEvent("keydown",{key:"0",bubbles:true}));
    const s=window.__vellumZoomState();
    const p=new URLSearchParams(location.hash.slice(1));
    return{stepK,home:{k:s.k,x:s.x,y:s.y},cx:p.get("cx")};
  })()`);
  check(
    "G3 reduced motion collapses the glide: step and home land in the same turn (#170 AC2)",
    Math.abs(g3.stepK - 1.4) < 1e-6 && g3.home.k === 1 && g3.home.x === 0 && g3.home.y === 0 && g3.cx === null,
    JSON.stringify(g3),
  );
  await send("Emulation.setEmulatedMedia", { features: [] });

  // ---- The redraft ceremony (redraft ON from here) ------------------------------------
  await evaluate(`window.__vellumSetRedraftEnabled(true)`);

  // G4: the redraft INKS ITSELF IN (AC1). Settle at the Z17 framing; at the commit the
  // incoming inset svg carries .redrafting, its coastline is dashed for the ink draw
  // (inline stroke-dasharray + --draw-len, the startArrival technique at the shorter
  // redraft grade), and the name dry-in is tagged: at least one newly labeled settlement
  // group carries .dry-in, EVERY .dry-in name is absent from the world sheet's placed
  // labels (self-consistent, name-keyed), and every persisting labeled name carries none.
  const before4 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s4 = await waitRedraft(before4);
  const g4 = await evaluate(`(()=>{
    const worldTexts=new Set([...document.querySelectorAll("#map > svg g.settlement text")].map(t=>t.textContent));
    const inset=document.querySelector("#map .region-inset");
    const svg=inset?inset.querySelector("svg"):null;
    if(!svg)return{svg:false};
    const coast=svg.querySelector("#layer-land path");
    const groups=[...svg.querySelectorAll("g.settlement[data-name]")];
    const labeled=groups.filter(g=>g.querySelector("text"));
    const dry=labeled.filter(g=>g.classList.contains("dry-in"));
    const dryNames=dry.map(g=>g.dataset.name);
    const dryAllNew=dryNames.every(n=>!worldTexts.has(n)&&!worldTexts.has(n.toUpperCase()));
    const persisting=labeled.filter(g=>worldTexts.has(g.dataset.name)||worldTexts.has(g.dataset.name.toUpperCase()));
    const persistingStill=persisting.every(g=>!g.classList.contains("dry-in"));
    return{svg:true,redrafting:svg.classList.contains("redrafting"),
      dashed:!!(coast&&coast.style.strokeDasharray),drawLen:!!(coast&&coast.style.getPropertyValue("--draw-len")),
      dryCount:dry.length,dryNames,dryAllNew,dryTiers:dry.map(g=>g.dataset.tier),
      persistingCount:persisting.length,persistingStill};
  })()`);
  check(
    "G4 the redraft inks in: .redrafting + dashed coast at commit; only newly labeled names tagged .dry-in, persisting names untouched (#170 AC1)",
    s4.band === 1 && g4.svg && g4.redrafting && g4.dashed && g4.drawLen &&
      g4.dryCount > 0 && g4.dryAllNew && g4.persistingCount > 0 && g4.persistingStill,
    `band=${s4.band} ${JSON.stringify(g4)} (expected dry-in exactly ["Lokai"] at seed 42)`,
  );
  await shoot("explorer-sub9-redraft-inking.png"); // manual: the finer survey drawing itself in
  await sleep(600); // into the village wait: the newly revealed name is mid-dry
  await shoot("explorer-sub9-redraft-dryin.png"); // manual: Lokai drying in while the persisting names stand

  // G4b: the ceremony rests PRISTINE (the D2 discipline): every animation in the inset
  // finishes, the inline dash + --draw-len are removed on animationend (byte-for-byte
  // resting stroke, round joins intact), nothing left running.
  const g4b = await evaluate(`(async()=>{
    const svg=document.querySelector("#map .region-inset svg");
    await Promise.all(svg.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));
    const coast=svg.querySelector("#layer-land path");
    return{dash:coast?coast.style.strokeDasharray:"(no coast)",drawLen:coast?coast.style.getPropertyValue("--draw-len"):"",
      running:svg.getAnimations({subtree:true}).filter(a=>a.playState==="running").length};
  })()`, true);
  check(
    "G4b the redraft ceremony settles pristine: dash + --draw-len removed on animationend, none running (#170)",
    !g4b.dash && !g4b.drawLen && g4b.running === 0,
    JSON.stringify(g4b),
  );
  await shoot("explorer-sub9-redraft-rested.png"); // manual: the committed survey at rest

  // G5: the tier stagger is DECLARED (CSSOM, the F1/F2 pattern): the redraft tokens exist
  // and the village wait is later than the town wait, so newly revealed towns dry first.
  const g5 = await evaluate(`(()=>{
    const cs=getComputedStyle(document.documentElement);
    const ms=(v)=>{const s=(v||"").trim();return s.endsWith("ms")?parseFloat(s):s.endsWith("s")?parseFloat(s)*1000:NaN;};
    const draw=ms(cs.getPropertyValue("--redraft-draw"));
    const dry=ms(cs.getPropertyValue("--redraft-dry"));
    const town=ms(cs.getPropertyValue("--redraft-dry-wait"));
    const village=ms(cs.getPropertyValue("--redraft-dry-wait-village"));
    let villageRule=false;
    for(const ss of document.styleSheets){
      let rules;try{rules=ss.cssRules;}catch(e){continue;}
      if(!rules)continue;
      for(const r of rules){
        if(r.selectorText&&r.selectorText.includes('.dry-in[data-tier="village"]'))villageRule=true;
      }
    }
    return{draw,dry,town,village,villageRule};
  })()`);
  check(
    "G5 the redraft grade is tokenized and tier-staggered: tokens parse, village waits later than town, village rule declared (#170)",
    g5.draw > 0 && g5.dry > 0 && g5.town > 0 && g5.village > g5.town && g5.villageRule,
    JSON.stringify(g5),
  );

  // G7: a deeper hop re-inks the coast (the ceremony fires on EVERY redraft) but re-reveals
  // nothing: every name the band-2 sheet labels was already labeled on the outgoing
  // composition at this centre (measured ground truth), so zero .dry-in tags.
  const before7 = (await rgn()).redrafts;
  await enterAt(3.6, 0.5, 0.5);
  const s7 = await waitRedraft(before7);
  const g7 = await evaluate(`(()=>{
    const insets=[...document.querySelectorAll("#map .region-inset")];
    const svg=insets.length?insets[insets.length-1].querySelector("svg"):null;
    if(!svg)return{svg:false};
    return{svg:true,redrafting:svg.classList.contains("redrafting"),
      dry:svg.querySelectorAll("g.settlement.dry-in").length};
  })()`);
  check(
    "G7 a band hop re-inks the coast but re-animates no persisting name (zero dry-in at the measured window, #170 AC1)",
    s7.band === 2 && g7.svg && g7.redrafting && g7.dry === 0,
    `band=${s7.band} ${JSON.stringify(g7)}`,
  );

  // G8: the voiced home from a committed band: one press of the full-sheet button fades the
  // inset off over the world chart while the camera GLIDES home; at the landing the hash is
  // clean and the world overlay is back (the easeHome + glideHome pairing).
  await evaluate(`document.getElementById("zoom-reset").click()`);
  const g8cam = await settleHome();
  let g8 = null;
  for (let i = 0; i < 50; i++) {
    g8 = await evaluate(`(()=>{const s=window.__vellumRegion();const p=new URLSearchParams(location.hash.slice(1));return{band:s.band,committed:s.committed,insets:document.querySelectorAll("#map .region-inset").length,hits:document.querySelectorAll("#map .place-hit").length,cx:p.get("cx")};})()`);
    if (g8.insets === 0 && g8.cx === null) break;
    await sleep(40);
  }
  check(
    "G8 the full sheet returns on one voiced press: glide home, inset faded off, hash clean, world overlay back (#170)",
    g8cam.k === 1 && g8cam.x === 0 && g8cam.y === 0 && g8.band === 0 && g8.committed === false &&
      g8.insets === 0 && g8.hits > 0 && g8.cx === null,
    `cam=${JSON.stringify(g8cam)} ${JSON.stringify(g8)}`,
  );

  // G6: reduced motion collapses the WHOLE ceremony to Sub 8's instant swap (AC2): the
  // commit lands with no .redrafting, no dashed coast, no .dry-in tags, zero functional
  // loss (band, title, overlay all land as normal).
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const before6 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s6 = await waitRedraft(before6);
  const g6 = await evaluate(`(()=>{
    const svg=document.querySelector("#map .region-inset svg");
    if(!svg)return{svg:false};
    const coast=svg.querySelector("#layer-land path");
    return{svg:true,redrafting:svg.classList.contains("redrafting"),dashed:!!(coast&&coast.style.strokeDasharray),
      dry:svg.querySelectorAll("g.settlement.dry-in").length,hits:document.querySelectorAll("#map .place-hit").length};
  })()`);
  check(
    "G6 reduced motion collapses the ceremony to an instant swap with zero functional loss (#170 AC2)",
    s6.band === 1 && /^The Environs of .+/.test(s6.title || "") && g6.svg &&
      g6.redrafting === false && g6.dashed === false && g6.dry === 0 && g6.hits > 0,
    `band=${s6.band} title=${JSON.stringify(s6.title)} ${JSON.stringify(g6)}`,
  );
  await send("Emulation.setEmulatedMedia", { features: [] });

  // Restore: inset off, camera home, redraft OFF (geometric-only for the suites that
  // follow), clean antique seed-42 base.
  await evaluate(`document.getElementById("zoom-reset").click()`);
  await settleHome();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("glass-ceremony-restore");
}
