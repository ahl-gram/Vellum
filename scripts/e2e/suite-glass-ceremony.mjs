// Glass ceremony e2e (G, #170): the antique voice on the zoom cluster, the voiced glide, and the redraft ink-in; asserts the PLUMBING (classes, tokens, inline dash props, aria), while the choreography itself is eyeballed via out/ screenshots.
// Measured ground truth at seed 42 (2026-07-19 scan): the world sheet labels 25 of 26 settlements, the band-1 window at (0.5, 0.5) newly labels exactly Lokai, and the k=3.6 hop to band 2 reveals no new name.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled } = ctx;

  await evaluate(`(()=>{for(const id of ["ages"]){const c=document.getElementById(id);if(c.checked){c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));}}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("glass-ceremony-base");
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);

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
  const waitRedraft = async (prev, wantBand) => {
    // 15s, not the old 4s: see the same note in suite-zoom.mjs. #400's detailed draw outran the
    // old budget on CI, so the waiter returned before the redraft landed and G6 read band 2.
    // The waiter also demands the band its caller asserts: a stale in-flight survey (G8's glide
    // debounce) can commit FIRST and increment redrafts at the wrong band (CI 2026-08-25), so an
    // any-redraft return hands the check a state its own gesture never requested.
    for (let i = 0; i < 375; i++) { const s = await rgn(); if (s.redrafts > prev && s.band === wantBand) return s; await sleep(40); }
    return await rgn();
  };

  const g1 = await evaluate(`(()=>{
    const grp=document.getElementById("zoom-controls");
    const btn=(id)=>{const b=document.getElementById(id);return{title:b.getAttribute("title"),aria:b.getAttribute("aria-label"),svg:!!b.querySelector("svg"),text:(b.textContent||"").trim()};};
    const legend=grp?grp.querySelector(".zoom-keys"):null;
    const legendVisible=!!legend&&legend.offsetWidth>0&&legend.offsetHeight>0;
    let hideRules=0, hoverHideRules=0, coarseScopedHideRules=0;
    for(const ss of document.styleSheets){
      let rules;try{rules=ss.cssRules;}catch(e){continue;}
      if(!rules)continue;
      for(const r of rules){
        if(r.constructor.name!=="CSSMediaRule")continue;
        const cond=r.conditionText||(r.media&&r.media.mediaText)||"";
        for(const n of r.cssRules){
          if(!n.selectorText||!n.selectorText.includes(".zoom-keys"))continue;
          if((n.style&&n.style.display)!=="none")continue;
          hideRules++;
          if(/hover:\\s*none/.test(cond)){
            hoverHideRules++;
            if(/pointer:\\s*coarse/.test(cond))coarseScopedHideRules++;
          }
        }
      }
    }
    return{grpAria:grp?grp.getAttribute("aria-label"):null,
      zin:btn("zoom-in"),zout:btn("zoom-out"),zreset:btn("zoom-reset"),
      legend:!!legend,legendVisible,legendAriaHidden:legend?legend.getAttribute("aria-hidden"):null,
      legendText:legend?(legend.textContent||"").replace(/\\s+/g," ").trim():"",
      hideRules,hoverHideRules,coarseScopedHideRules,
      hoverNone:matchMedia("(hover: none)").matches,pointerCoarse:matchMedia("(pointer: coarse)").matches,
      // #463: the keys slip stands down below 1440px too (a stated deviation on #462: it collided with the legend row beside the 24rem Broadside at 1280), so the legend is owed only on a wide, mouse-driven sheet.
      wide:innerWidth>1440};
  })()`);
  const touchPrimary = g1.hoverNone && g1.pointerCoarse;
  const legendOwed = !touchPrimary && g1.wide;
  // The other polarity: at 1680 a mouse-driven sheet is owed the keys slip (skeptic on PR #491: the harness is 1280 wide, so the first read alone asserts only the hidden arm).
  await send("Emulation.setDeviceMetricsOverride", { width: 1680, height: 1050, deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  const g1wide = await evaluate(`(()=>{const l=document.querySelector("#zoom-controls .zoom-keys");return{shown:!!l&&l.offsetWidth>0&&l.offsetHeight>0,w:innerWidth};})()`);
  await send("Emulation.clearDeviceMetricsOverride");
  await sleep(300);
  check(
    "G1 the cluster speaks in the antique voice and the keys legend is visible by it (#170 voice + Sub 4 handoff)",
    g1.grpAria === "The Surveyor's Glass" &&
      g1.zin.title === "Lean closer" && /zoom in/i.test(g1.zin.aria || "") && g1.zin.svg && g1.zin.text === "" &&
      g1.zout.title === "Stand back" && /zoom out/i.test(g1.zout.aria || "") && g1.zout.svg && g1.zout.text === "" &&
      g1.zreset.title === "The full sheet" && /reset/i.test(g1.zreset.aria || "") && g1.zreset.svg &&
      g1.legend && g1.legendVisible === legendOwed && (touchPrimary || (g1wide.w === 1680 && g1wide.shown)) && g1.legendAriaHidden === "true" &&
      /0/.test(g1.legendText) && /pan/i.test(g1.legendText) &&
      g1.hideRules > 0 && g1.hoverHideRules === g1.coarseScopedHideRules,
    JSON.stringify({ ...g1, g1wide }),
  );

  const g2aNow = await evaluate(`(()=>{document.getElementById("zoom-in").click();return window.__vellumZoomState().k;})()`);
  const g2aEnd = await settleK(1.4);
  check(
    "G2a a zoom button glides: mid-flight short of the step, settles exactly at 1.4 (#170 voiced glide)",
    g2aNow < 1.4 - 1e-6 && Math.abs(g2aEnd.k - 1.4) < 1e-6,
    `immediately=${g2aNow} settled=${g2aEnd.k}`,
  );

  await evaluate(`window.__vellumZoomTo({k:1,x:0,y:0})`);
  await evaluate(`(()=>{const b=document.getElementById("zoom-in");b.click();b.click();})()`);
  const g2b = await settleK(1.96);
  check(
    "G2b rapid presses compound to 1.96 (the glide flies to a pending absolute target, #170)",
    Math.abs(g2b.k - 1.96) < 1e-6,
    `settled=${g2b.k}`,
  );

  // d3 starts a superseding transition one frame after scheduling it, interrupting its predecessor, whose end/interrupt handler must NOT clear the newer press's pending target (the glideSeq guard).
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

  await evaluate(`window.__vellumSetRedraftEnabled(true)`);

  const before4 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s4 = await waitRedraft(before4, 1);
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

  const before7 = (await rgn()).redrafts;
  await enterAt(3.6, 0.5, 0.5);
  const s7 = await waitRedraft(before7, 2);
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

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  // G8's voiced glide home passes THROUGH band 2, and its settle debounce can dispatch a survey on
  // the way. Since #400 that draw is slow enough to still be in flight here, and it commits after
  // before6 is sampled, so waitRedraft returns on it and G6 reads band 2. Wait for the region state
  // to go quiet first: two reads a debounce apart with the same count, and nothing on screen.
  for (let i = 0; i < 100; i++) {
    const a = await rgn();
    await sleep(300);
    const b = await rgn();
    if (a.redrafts === b.redrafts && b.band === 0) break;
  }
  const before6 = (await rgn()).redrafts;
  await enterAt(2, 0.5, 0.5);
  const s6 = await waitRedraft(before6, 1);
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

  await evaluate(`document.getElementById("zoom-reset").click()`);
  await settleHome();
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("glass-ceremony-restore");
}
