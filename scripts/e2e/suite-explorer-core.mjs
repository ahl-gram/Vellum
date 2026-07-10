// Explorer core checks (A0-A8 worker/parity/race/themed, A11 Tide Wheel, A12 arms).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  check("A0 page loaded + initial auto-draw rendered", await waitReady());
  check("A1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // A2: worker draw === inline draw, byte-for-byte, in the browser. Includes the
  // #52 place manifest: a new structured-cloneable field that must be identical
  // worker-vs-inline (same V8 runs both paths, so nx/ny are byte-identical).
  //
  // #120 added the `survey` field (grid dims, a 76,800-byte land mask, road polylines).
  // The mask is compared byte-wise, NOT via JSON.stringify: a Uint8Array stringifies to a
  // {"0":1,"1":0,...} object literal with one key per cell, built twice, inside this
  // evaluate(). The compare stays exact, and being integers it is immune to the
  // transcendental drift that forces A4 to compare with a tolerance.
  const a2 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}};` +
      `const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);` +
      `const eqBytes=(a,b)=>{if(!a||!b||a.length!==b.length)return false;for(let k=0;k<a.length;k++)if(a[k]!==b[k])return false;return true;};` +
      `const js=j.survey,is=i.survey;` +
      `const srv=!!js&&!!is&&js.gridW===is.gridW&&js.gridH===is.gridH&&eqBytes(js.land,is.land)&&JSON.stringify(js.roads)===JSON.stringify(is.roads);` +
      `let land=0;for(const v of js.land)land+=v;` +
      `return{svg:j.svg===i.svg,title:j.title===i.title,sub:j.subtitle===i.subtitle&&!!j.subtitle,mt:j.mapType===i.mapType,band:j.band===i.band,` +
      `man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),srv,places:j.manifest.places.length,len:j.svg.length,` +
      `cells:js.land.length,land,roads:js.roads.length,gx:j.manifest.places[0].gx};})()`,
    true,
  );
  check(
    "A2 draw: worker bytes === inline bytes (svg + manifest + subtitle + survey)",
    a2.svg && a2.title && a2.sub && a2.mt && a2.band && a2.man && a2.srv,
    `${a2.len} code units, ${a2.places} places, manifest eq=${a2.man}, subtitle eq=${a2.sub}, survey eq=${a2.srv} (${a2.cells} cells, ${a2.land} land, ${a2.roads} roads)`,
  );
  // #120: the router walks grid cells, so PlaceMark must carry them. A missing gx would
  // otherwise surface far away, as a track that misses every road by the chart's margin.
  check("A2b manifest places carry their grid cell (gx/gy) for the router", Number.isInteger(a2.gx), `places[0].gx=${a2.gx}`);

  // A3 — worker atlas === inline atlas, in the browser (gazetteer locale matches)
  const a3 = await evaluate(
    `(async()=>{const m={kind:"atlas",seed:42,overrides:{},width:1500};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{eq:JSON.stringify(j.atlas)===JSON.stringify(i.atlas),themes:j.atlas.themes.length,regions:j.atlas.regions.length,gaz:j.atlas.gazetteerHtml.length};})()`,
    true,
  );
  check("A3 atlas: worker bytes === inline bytes (gazetteer incl.)", a3.eq, `${a3.themes} themes, ${a3.regions} regions, gaz ${a3.gaz}b`);

  // A4 — worker draw vs committed Node chart, normalized to absorb cross-engine
  // float ULPs. Transcendental math (sin/cos/atan2) is not IEEE-correctly-rounded,
  // so V8-in-node and V8-in-brave may differ by ~1 ULP in a coordinate; 6dp
  // normalization erases that while still catching a stale/wrong browser engine.
  const a4 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",legend:true}};const j=await window.__vellumRunJob(m);const c=await(await fetch("../charts/chart-42-antique.svg")).text();const norm=(s)=>s.replace(/-?\\d+\\.\\d+/g,(x)=>Number(x).toFixed(6));const bt=j.svg.match(/-?\\d+\\.\\d+/g)||[],ct=c.match(/-?\\d+\\.\\d+/g)||[];let tok=0;for(let k=0;k<Math.min(bt.length,ct.length);k++)if(bt[k]!==ct[k])tok++;return{rawEq:j.svg===c,normEq:norm(j.svg)===norm(c),tokens:bt.length,diffTok:tok};})()`,
    true,
  );
  check("A4 worker draw === committed Node chart (normalized, ULP-tolerant)", a4.normEq, `${a4.diffTok}/${a4.tokens} numeric tokens differ by ULP; raw-equal=${a4.rawEq}`);

  // --- normal bind (no race): atlas populates; artifact for the user ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("draw-42");
  await evaluate(`document.getElementById("bind").click()`);
  const figs = await waitAtlas("normal-bind");
  check("A5 normal bind injects the atlas", figs > 0, `${figs} plate figures`);
  // #127: plates are hidden until the reveal-on-scroll fires; wait so the artifact
  // captures a settled atlas rather than a blank one.
  for (let i = 0; i < 60 && !(await evaluate(`!!document.querySelector("#atlas figure.settling")`)); i++) await sleep(50);
  await shoot("explorer-worker-atlas.png");

  // --- A6 RACE: draw-then-bind (the bug the advisor flagged) ---
  const a6click = await evaluate(`(()=>{const s=document.getElementById("seed");s.value="100";document.getElementById("draw").click();const dis=document.getElementById("bind").disabled;document.getElementById("bind").click();return{dis};})()`);
  check("A6a bind disabled the instant a draw starts", a6click.dis === true);
  await waitSettled("draw-100");
  const a6 = await evaluate(`({figs:document.querySelectorAll("#atlas figure").length,map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent})`);
  check("A6b race draw->bind: atlas suppressed, chart advanced", a6.figs === 0 && a6.map && a6.cap.length > 0, `figs=${a6.figs}`);
  await evaluate(`document.getElementById("bind").click()`);
  const figs2 = await waitAtlas("post-race-bind");
  check("A6c post-settle bind works again", figs2 > 0, `${figs2} figures`);

  // --- A7 RACE: bind-then-draw (gen guard must drop the stale bind) ---
  await evaluate(`(()=>{document.getElementById("bind").click();const s=document.getElementById("seed");s.value="7";document.getElementById("draw").click();})()`);
  await waitSettled("draw-7");
  await sleep(400); // let any (wrongly) surviving bind inject before asserting emptiness
  const a7 = await evaluate(`document.querySelectorAll("#atlas figure").length`);
  check("A7 race bind->draw: stale bind discarded, atlas cleared", a7 === 0, `figs=${a7}`);

  // --- themed draw: worker theme path + artifact ---
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="vegetation";document.getElementById("draw").click();})()`);
  await waitSettled("draw-theme");
  check("A8 worker renders a thematic (field) layer", await evaluate(`document.querySelector("#map svg").outerHTML.includes("layer-field")`));
  await shoot("explorer-worker-theme.png");

  // --- A11: the Tide Wheel (#55) — sea-level slider floods/drains in place ---
  // Placed before A9a so the console-health check also covers the slider gesture.
  const landPresent = await evaluate(`!!document.getElementById("land")`);
  if (!landPresent) {
    check("A11 sea-level slider present", false, "#land control missing");
  } else {
    // flood: low land value, fire input then change (the real drag gesture)
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      const l=document.getElementById("land");
      l.value="150";
      l.dispatchEvent(new Event("input",{bubbles:true}));
      l.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
    await waitSettled("land-flood");
    const a11a = await evaluate(`({hash:location.hash.includes("land="),map:!!document.querySelector("#map svg"),cap:document.getElementById("caption").textContent.length>0})`);
    check("A11a slider floods in place: fresh chart + land= in hash", a11a.hash && a11a.map && a11a.cap);

    // direction: the drain (high) end bakes a larger land-fraction than the flood (low) end
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="650";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-drain");
    const drainLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    await evaluate(`(()=>{const l=document.getElementById("land");l.value="150";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-flood2");
    const floodLF = await evaluate(`Number(document.querySelector("#map svg").getAttribute("data-vellum-land-fraction"))`);
    check("A11b flood waterline < drain waterline", Number.isFinite(floodLF) && Number.isFinite(drainLF) && floodLF < drainLF, `flood=${floodLF} drain=${drainLF}`);

    // auto-reset: changing map type drops the manual tide from the hash
    await evaluate(`(()=>{const t=document.getElementById("type");t.value="continent";t.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("land-typereset");
    const a11c = await evaluate(`({reset:!location.hash.includes("land="),hash:location.hash})`);
    check("A11c changing type resets the slider to auto (land= dropped)", a11c.reset, `hash=${a11c.hash}`);
  }

  // --- A12: the arms (heraldry) toggle (#44) — like the legend checkbox ---
  // Placed before A9a so the console-health check also covers the gesture.
  const armsPresent = await evaluate(`!!document.getElementById("arms")`);
  if (!armsPresent) {
    check("A12 arms checkbox present", false, "#arms control missing");
  } else {
    // start from a clean realm-bearing world, arms off
    await evaluate(`(()=>{
      document.getElementById("seed").value="42";
      document.getElementById("style").value="antique";
      document.getElementById("theme").value="";
      document.getElementById("type").value="";
      document.getElementById("arms").checked=false;
      document.getElementById("draw").click();
    })()`);
    await waitSettled("arms-off");
    const a12off = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=0")})`);
    check("A12a arms off: no heraldry layer, arms=0 in hash", !a12off.heraldry && a12off.hash, `heraldry=${a12off.heraldry} hash=${a12off.hash}`);

    // toggle on via the change handler (the real gesture), expect heraldry + arms=1
    await evaluate(`(()=>{const a=document.getElementById("arms");a.checked=true;a.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitSettled("arms-on");
    const a12on = await evaluate(`({heraldry:document.querySelector("#map svg").outerHTML.includes("layer-heraldry"),hash:location.hash.includes("arms=1")})`);
    check("A12b arms on: heraldry layer drawn, arms=1 in hash", a12on.heraldry && a12on.hash, `heraldry=${a12on.heraldry} hash=${a12on.hash}`);
  }

  // --- D: #127 The Drafting Moment: the arrival ceremony (end-states, not timing).
  // A fresh draw settles the chart in (paperSettle on #map svg) while the coast
  // ink-draws (stroke-dashoffset on #layer-land path); the wash + waterlines dry in
  // behind. All CSS/DOM on the injected SVG only, so Download (pristine lastSvg) and
  // the string-compare parity checks above are untouched.
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("arms").checked=false;document.getElementById("draw").click();})()`);
  await waitSettled("draft-ceremony");
  // D1: read mid-flight (waitSettled resolves as the ceremony starts). The SVG carries
  // the arrival class and the coast path has been dashed for the ink-draw.
  const d1 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const p=svg.querySelector("#layer-land path");return{arriving:svg.classList.contains("arriving"),dashed:!!(p&&p.style.strokeDasharray)};})()`);
  check("D1 fresh draw runs the arrival ceremony (svg.arriving + coast dashed mid-draw)", d1.arriving && d1.dashed, JSON.stringify(d1));
  // D2: await EVERY arrival animation (settle on the SVG + coast/wash/waterline on
  // descendants, hence subtree:true) to finish, then assert the resting chart is
  // STILL (transform none) and the coast is pristine again (inline dash removed on
  // animationend). Awaits the real animations, never a fixed sleep.
  const d2 = await evaluate(`(async()=>{const svg=document.querySelector("#map svg");await Promise.all(svg.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));const p=svg.querySelector("#layer-land path");return{tform:getComputedStyle(svg).transform,dash:p?p.style.strokeDasharray:"(no path)",running:svg.getAnimations({subtree:true}).filter(a=>a.playState==="running").length};})()`, true);
  check("D2 ceremony settles STILL and pristine (transform none, dash removed, none running)", (d2.tform === "none" || d2.tform === "matrix(1, 0, 0, 1, 0, 0)") && !d2.dash && d2.running === 0, JSON.stringify(d2));
  // D3: the sea-level drag suppresses the ceremony. An INPUT (the throttled mid-drag
  // redraw, debounced ~100ms) must produce a QUIET chart (no arrival ceremony); the
  // release (CHANGE) restores it. Guards the quiet-flag gate.
  await evaluate(`(()=>{const l=document.getElementById("land");l.value="300";l.dispatchEvent(new Event("input",{bubbles:true}));})()`);
  await sleep(220); // cross the ~100ms input debounce so the quiet redraw has started
  await waitSettled("draft-drag-input");
  const d3drag = await evaluate(`document.querySelector("#map svg").classList.contains("arriving")`);
  await evaluate(`(()=>{const l=document.getElementById("land");l.value="300";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("draft-drag-release");
  const d3rel = await evaluate(`document.querySelector("#map svg").classList.contains("arriving")`);
  check("D3 drag input is quiet (no ceremony), release restores it", d3drag === false && d3rel === true, `dragArriving=${d3drag} releaseArriving=${d3rel}`);
  // D4: bound atlas plates carry a stagger index (--i) AND reveal on scroll. Each
  // gets .settling from the IntersectionObserver as it enters the viewport (so the
  // cascade is seen on arrival, not played off-screen at the top before the scroll).
  await evaluate(`document.getElementById("bind").click()`);
  await waitAtlas("draft-atlas");
  let anySettling = false;
  for (let i = 0; i < 60 && !anySettling; i++) { anySettling = await evaluate(`!!document.querySelector("#atlas figure.settling")`); if (!anySettling) await sleep(50); }
  const d4 = await evaluate(`(()=>{const figs=[...document.querySelectorAll("#atlas figure")];return{n:figs.length,withI:figs.filter(f=>f.style.getPropertyValue("--i")!=="").length,settling:figs.filter(f=>f.classList.contains("settling")).length};})()`);
  check("D4 bound atlas plates carry --i and reveal on scroll (.settling)", d4.n > 0 && d4.withI === d4.n && d4.settling > 0, JSON.stringify(d4));

  // D5: the bound plates react to the hand like the homepage chart plates (#146),
  // but rest FLAT (no resting tilt) so the atlas grid stays crisp. e2e cannot
  // emulate :hover, so this asserts the gesture is WIRED three ways: (a) the plate
  // image carries a paper-timed transition (motion.css --paper resolves = the rule
  // applied, the P2b-style plumbing check); (b) the image rests with no transform
  // (the tidy-grid invariant); (c) a :hover rule with a transform actually exists in
  // the stylesheet (so the committed check bites the lift itself, not just the
  // plumbing). The lift's exact end state is CDP-probe verified (e2e can't hover).
  const d5 = await evaluate(`(()=>{
    const img=document.querySelector("#atlas figure img");
    if(!img)return{img:false};
    const cs=getComputedStyle(img);
    let hoverLift=false;
    for(const ss of document.styleSheets){let rules;try{rules=ss.cssRules;}catch(e){continue;}
      if(!rules)continue;
      for(const r of rules){
        if(r.selectorText&&r.selectorText.includes("#atlas figure img:hover")&&r.style&&r.style.transform&&r.style.transform!=="none"){hoverLift=true;}
      }
    }
    return{img:true,dur:cs.transitionDuration,prop:cs.transitionProperty,tform:cs.transform,hoverLift};
  })()`);
  check("D5a atlas plate hover is wired (paper-timed transform transition on the image)", d5.img && d5.dur.includes("0.26s") && d5.prop.includes("transform"), JSON.stringify(d5));
  check("D5b atlas plate rests flat (no resting tilt; tidy grid)", d5.img && (d5.tform === "none" || d5.tform === "matrix(1, 0, 0, 1, 0, 0)"), JSON.stringify(d5));
  check("D5c a :hover rule lifts the plate image (the gesture, not just the plumbing)", d5.hoverLift === true, JSON.stringify(d5));

  // F: the folio (#130). Cross-document View Transitions turn page-to-page nav into
  // leaves of one bound folio. The crossfade + the reduced-motion disable can't be
  // SEEN by e2e, but their DECLARATION is structural and IS in the CSSOM. Walk the
  // parsed motion.css (same-origin, so cssRules reads, per the D5c precedent) so the
  // check bites the rule, not just its text: F2 asserts CONTAINMENT (the disable is
  // nested inside the @media block), not mere token order -- relocating the disable
  // out of the block, which would ship the folio to reduced-motion users, must fail.
  const folio = await evaluate(`(()=>{
    const hasVT = (r, nav) => /@view-transition/.test(r.cssText || "") && new RegExp("navigation:\\\\s*" + nav).test(r.cssText || "");
    let topAuto = false, reducedNone = false;
    for (const ss of document.styleSheets) {
      if (!/motion\\.css/.test(ss.href || "")) continue;
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (const r of rules) {
        if (hasVT(r, "auto")) topAuto = true;
        if (r.constructor.name === "CSSMediaRule" && /prefers-reduced-motion/.test(r.conditionText || (r.media && r.media.mediaText) || "")) {
          for (const n of r.cssRules) if (hasVT(n, "none")) reducedNone = true;
        }
      }
    }
    return { topAuto, reducedNone };
  })()`);
  check("F1 the folio opt-in is parsed top-level (@view-transition navigation:auto)", folio.topAuto === true, JSON.stringify(folio));
  check("F2 reduced-motion turns the folio off, nested in the @media block (navigation:none)", folio.reducedNone === true, JSON.stringify(folio));

  // G: the style turn (#131). Changing the STYLE turns the sheet over and the SAME
  // world lands re-dressed in the new style; a new world (seed/type/climate) settles
  // per #127. The 3D page-turn itself cannot be SEEN by e2e (no hover/animation
  // inspection), so these assert END STATES plus, via a MutationObserver on the
  // sheet, whether the turn actually ENGAGED (the .turning class toggled) vs an
  // instant swap. The place manifest is style-independent (style is a render dress
  // over one world), so a turn leaves the hit count unchanged.

  // A clean antique seed-42 base, chronicle off, so the turn path (not the scrub
  // carve-out) is exercised and the manifest is known.
  await evaluate(`(()=>{
    const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="42";document.getElementById("style").value="antique";
    document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("arms").checked=false;
    document.getElementById("draw").click();
  })()`);
  await waitSettled("turn-base");
  const gPlaces = await evaluate(`window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest.places.length`);

  // waitTurned: the turn clears "Drafting…" immediately (no 900ms status hang), so
  // waitSettled resolves mid-turn. Wait for the leaf to actually land: status clear,
  // .sheet not turning, and a chart present.
  const waitTurned = async (label) => {
    for (let i = 0; i < 240; i++) {
      if (await evaluate(`(()=>{const s=document.getElementById("status").textContent;const t=document.querySelector(".sheet.turning");return s==="" && !t && !!document.querySelector("#map svg");})()`)) return;
      await sleep(50);
    }
    throw new Error("waitTurned timeout " + label);
  };
  // Arm a MutationObserver that records whether .sheet ever carried .turning, then
  // fire a real style change (the dedicated handler runs draw({turn:true})).
  const armTurnWatch = () => evaluate(`(()=>{window.__turned=false;if(window.__turnMo)window.__turnMo.disconnect();window.__turnMo=new MutationObserver(()=>{if(document.querySelector(".sheet.turning"))window.__turned=true;});window.__turnMo.observe(document.getElementById("sheet"),{subtree:true,attributes:true,attributeFilter:["class"]});return true;})()`);

  // G1: a style change turns the sheet and the same world lands re-dressed in ink.
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("style->ink");
  const g1 = await evaluate(`(()=>{const svgs=document.querySelectorAll("#map svg");const svg=svgs[0];const back=document.querySelectorAll(".sheet-back").length;const turning=!!document.querySelector(".sheet.turning");const hits=document.querySelectorAll("#map .place-hit").length;return{turned:window.__turned,svgCount:svgs.length,style:svg?svg.getAttribute("data-vellum-style"):null,seed:svg?svg.getAttribute("data-vellum-seed"):null,back,turning,hits,cap:document.getElementById("caption").textContent.length>0};})()`);
  check("G1 a style change turns the sheet (the turn engaged, not an instant swap)", g1.turned === true, JSON.stringify(g1));
  check("G1b it lands re-dressed: one #map svg, data-vellum-style=ink, SAME world (seed 42), overlay rebuilt", g1.svgCount === 1 && g1.style === "ink" && g1.seed === "42" && g1.hits === gPlaces && g1.back === 0 && g1.turning === false && g1.cap, JSON.stringify(g1) + ` places=${gPlaces}`);
  await shoot("explorer-style-turn-ink.png");

  // G2: a SEED change SETTLES, it does not turn (style is the only turn trigger).
  await armTurnWatch();
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitSettled("seed-settle-no-turn");
  await sleep(120); // a (wrong) turn would have set .turning by now
  const g2 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{turned:window.__turned,seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length};})()`);
  check("G2 a new world settles, it never turns (style is the only turn trigger)", g2.turned === false && g2.seed === "100" && g2.svgCount === 1, JSON.stringify(g2));

  // G3 (interruption): interrupt a LIVE turn. Turn to ink, let it run mid-flight,
  // then turn to topographic; the running ink turn is cancelled and the sheet lands
  // on topographic with no orphan back face and no leaked WAAPI animation.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("turn-interrupt-base");
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await sleep(300); // the ink turn is now mid-rotation
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="topographic";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("style->topo-after-interrupt");
  await sleep(250); // settle-window: a leaked turn/anim would surface here
  const g3 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const inner=document.getElementById("sheet-inner");const anims=inner&&inner.getAnimations?inner.getAnimations().length:-1;return{style:svg?svg.getAttribute("data-vellum-style"):null,svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length,turning:!!document.querySelector(".sheet.turning"),anims};})()`);
  check("G3 interrupting a live turn lands on the latest style, no orphan sheet", g3.style === "topographic" && g3.svgCount === 1 && g3.back === 0 && g3.turning === false, JSON.stringify(g3));
  check("G4 no leaked choreography after the settle-window (no .turning, no back face, no live WAAPI anim on the leaf)", g3.turning === false && g3.back === 0 && g3.anims === 0, JSON.stringify(g3));

  // G5: a turn interrupted by a SETTLE (style change, then a seed change) resolves to
  // the seed's new world, not the turned style's world.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("turn-then-settle-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="nautical";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await sleep(250); // the nautical turn is mid-flight
  await evaluate(`(()=>{document.getElementById("seed").value="7";document.getElementById("draw").click();})()`); // a settle supersedes the turn
  await waitTurned("settle-supersedes-turn");
  await sleep(200);
  const g5 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length,turning:!!document.querySelector(".sheet.turning")};})()`);
  check("G5 a settle superseding a live turn wins: lands on the new world, no orphan", g5.seed === "7" && g5.svgCount === 1 && g5.back === 0 && g5.turning === false, JSON.stringify(g5));

  // G6: a settle fired WHILE a turn is live must tear the turn down SYNCHRONOUSLY, not
  // only when the settle's own worker resolves. Otherwise a turn superseded late self-
  // commits its stale chart (its natural landing is gated on `settled`, not drawGen)
  // and wipes the overlay before the settle lands. This asserts the turn is gone the
  // instant the settle's draw() runs (cancelTurn at draw() top), and the settled world
  // lands interactive. A regression that removed the synchronous cancelTurn would leave
  // .sheet.turning still set right after the click, failing G6.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("g6-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  let g6live = false;
  for (let i = 0; i < 80; i++) { if (await evaluate(`!!document.querySelector(".sheet.turning")`)) { g6live = true; break; } await sleep(25); }
  const g6 = await evaluate(`(()=>{
    const wasLive=!!document.querySelector(".sheet.turning");
    document.getElementById("seed").value="200";document.getElementById("draw").click(); // a settle supersedes the LIVE turn
    return{wasLive,turningAfter:!!document.querySelector(".sheet.turning"),back:document.querySelectorAll(".sheet-back").length};
  })()`);
  check("G6 a settle during a LIVE turn tears it down synchronously (no stale self-commit window)", g6live && g6.wasLive === true && g6.turningAfter === false && g6.back === 0, JSON.stringify(g6) + ` live=${g6live}`);
  await waitSettled("g6-settle");
  const g6b = await evaluate(`(()=>{const svg=document.querySelector("#map svg");return{seed:svg?svg.getAttribute("data-vellum-seed"):null,hits:document.querySelectorAll("#map .place-hit").length,svgCount:document.querySelectorAll("#map svg").length};})()`);
  check("G6b lands on the settled world with a live overlay (interactive, one svg)", g6b.seed === "200" && g6b.hits > 0 && g6b.svgCount === 1, JSON.stringify(g6b));

  // V: the Verso (#116). Turn the whole sheet over to read its back: a mirrored
  // bleed-through ghost of the current chart, a docket line, the surveyor's line, and
  // an office stamp. The flip REUSES #131's .sheet wrapper but RESTS on the back face
  // (a held rotateY(-180deg)) via two classes: .flip3d (lights the 3D context +
  // reveals #verso; torn down on the recto for byte-parity) and .versoed (the rotation
  // target). e2e cannot SEE the 3D flip, so these assert END STATES + the class toggle
  // + the docket text, and (the key race) that a style change WHILE FLIPPED rebuilds
  // the verso in place and never fires the #131 turn (the flip and the turn must never
  // both drive #sheet-inner's rotateY).

  // Clean antique seed-42 base, chronicle off, resting on the recto.
  await evaluate(`(()=>{const chk=document.getElementById("chronicle");if(chk.checked){chk.checked=false;chk.dispatchEvent(new Event("change",{bubbles:true}));}document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("draw").click();})()`);
  await waitSettled("verso-base");
  const vTitle = await evaluate(`window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).title`);

  // waitFlip3dGone: the flip-back tears the 3D context down on transitionend (~1.2s),
  // restoring the recto's idle byte-parity (no perspective/preserve-3d at rest).
  const waitFlip3dGone = async (label) => {
    for (let i = 0; i < 50; i++) { if (await evaluate(`!document.querySelector(".sheet.flip3d")`)) return; await sleep(60); }
    throw new Error("waitFlip3dGone timeout " + label);
  };
  // waitRectoAttr: a settle under the flipped sheet updates the hidden recto; poll for
  // a chart attribute rather than waitSettled (which watches the visible recto).
  const waitRectoAttr = async (attr, val, label) => {
    for (let i = 0; i < 120; i++) { if (await evaluate(`document.querySelector("#map svg") && document.querySelector("#map svg").getAttribute("${attr}")==="${val}"`)) return; await sleep(50); }
    throw new Error("waitRectoAttr timeout " + label);
  };

  // V0: the Turn button disables the instant a draw starts (like Bind), so no flip can
  // begin over a half-built verso.
  const v0 = await evaluate(`(()=>{document.getElementById("seed").value="101";document.getElementById("draw").click();const dis=document.getElementById("verso-turn").disabled;return{dis};})()`);
  check("V0 the Turn button disables the instant a draw starts", v0.dis === true, JSON.stringify(v0));
  await waitSettled("verso-v0");
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("verso-v0-restore");

  // V1: click Turn -> the sheet flips to its verso. .flip3d is set synchronously,
  // .versoed on the next frame (so the flat state commits first and the transition
  // runs), so allow a couple of frames before reading.
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(80);
  const v1 = await evaluate(`(()=>{const sh=document.getElementById("sheet");const g=document.querySelector("#verso .verso-ghost");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),ghost:!!g,ghostBlob:!!(g&&/^blob:/.test(g.src)),docket:(document.querySelector("#verso .verso-docket")||{}).textContent||"",survey:((document.querySelector("#verso .verso-survey")||{}).textContent||"").length,stamp:!!document.querySelector("#verso .verso-stamp"),vis:getComputedStyle(document.getElementById("verso")).visibility,label:document.getElementById("verso-turn").textContent};})()`);
  check("V1 Turn the sheet flips to the verso (.versoed + .flip3d, #verso visible, ghost/docket/survey/stamp present)", v1.versoed && v1.flip3d && v1.ghost && v1.ghostBlob && v1.stamp && v1.survey > 0 && v1.vis === "visible" && v1.label === "Turn back", JSON.stringify({ ...v1, docket: v1.docket.slice(0, 40) }));
  check("V1b the docket reads the drawn chart number and title", v1.docket.startsWith("CHART № 42 · ") && v1.docket.includes(vTitle) && v1.docket.includes("Year"), JSON.stringify({ docket: v1.docket }));
  await sleep(1300); // let the 1.2s flip land before the screenshot
  await shoot("explorer-verso.png");

  // V2: a redraw WHILE FLIPPED (Alex's call) stays on the verso and rebuilds it in
  // place; the hidden recto updates underneath. Change the seed and confirm the verso
  // survives and its docket tracks the new world.
  const ghostSrcBefore = await evaluate(`document.querySelector("#verso .verso-ghost").src`);
  await evaluate(`(()=>{document.getElementById("seed").value="100";document.getElementById("draw").click();})()`);
  await waitRectoAttr("data-vellum-seed", "100", "verso-rebuild-seed");
  await sleep(60);
  const v2 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),docket:(document.querySelector("#verso .verso-docket")||{}).textContent||"",rectoSeed:document.querySelector("#map svg").getAttribute("data-vellum-seed"),ghostChanged:document.querySelector("#verso .verso-ghost").src!==${JSON.stringify(ghostSrcBefore)}};})()`);
  check("V2 a redraw while flipped stays on the verso and rebuilds it (docket tracks the new world, recto updated underneath)", v2.versoed && v2.flip3d && v2.docket.startsWith("CHART № 100 · ") && v2.rectoSeed === "100" && v2.ghostChanged, JSON.stringify({ ...v2, docket: v2.docket.slice(0, 24) }));

  // V3 (the key race): a STYLE change WHILE FLIPPED must NOT fire the #131 turn (the
  // flip owns #sheet-inner's rotateY). It rebuilds the verso in place; the same world
  // (seed 100) is re-dressed, so the docket is unchanged but the ghost is rebuilt.
  await armTurnWatch();
  const ghostSrcV3 = await evaluate(`document.querySelector("#verso .verso-ghost").src`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitRectoAttr("data-vellum-style", "ink", "verso-restyle"); // the rebuild resolved
  await sleep(80); // __turned is sticky: a (wrong) turn would already have flagged it
  const v3 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{turned:window.__turned,turning:!!document.querySelector(".sheet.turning"),back:document.querySelectorAll(".sheet-back").length,versoed:sh.classList.contains("versoed"),ghostChanged:document.querySelector("#verso .verso-ghost").src!==${JSON.stringify(ghostSrcV3)},rectoStyle:document.querySelector("#map svg").getAttribute("data-vellum-style")};})()`);
  check("V3 a style change while flipped rebuilds in place and never turns (no .turning, no back face, still on the verso)", v3.turned === false && v3.turning === false && v3.back === 0 && v3.versoed && v3.ghostChanged && v3.rectoStyle === "ink", JSON.stringify(v3));

  // V4: click Turn again -> flip back to the recto. .versoed drops immediately; .flip3d
  // is torn down on transitionend, restoring idle byte-parity (perspective:none, the
  // overlay intact, no back face). This is #131's at-rest invariant, preserved.
  await evaluate(`document.getElementById("verso-turn").click()`);
  const v4immediate = await evaluate(`document.getElementById("sheet").classList.contains("versoed")`);
  check("V4 clicking Turn again leaves the verso immediately (.versoed dropped)", v4immediate === false);
  await waitFlip3dGone("verso-flip-back");
  await sleep(60);
  const v4 = await evaluate(`(()=>{const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d"),perspective:getComputedStyle(sh).perspective,map:!!document.querySelector("#map svg"),hits:document.querySelectorAll("#map .place-hit").length,vVis:getComputedStyle(document.getElementById("verso")).visibility,label:document.getElementById("verso-turn").textContent};})()`);
  check("V4b flip-back restores recto byte-parity: 3D context torn down (perspective:none), overlay intact, verso hidden", !v4.versoed && !v4.flip3d && v4.perspective === "none" && v4.map && v4.hits > 0 && v4.vVis === "hidden" && v4.label === "Turn the sheet", JSON.stringify(v4));

  // V5 (the shared-transform race): while a #131 style-turn is LIVE, clicking Turn
  // must be IGNORED. The turn owns #sheet-inner's rotateY; a flip starting mid-turn
  // would fight it. Guarded in app.js by the .turning check. The turn still lands
  // re-dressed and the sheet is never left flipped. (A regression that dropped the
  // .turning guard would flip mid-turn and fail this.)
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("draw").click();})()`);
  await waitSettled("v5-base");
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  let v5live = false;
  for (let i = 0; i < 80; i++) { if (await evaluate(`!!document.querySelector(".sheet.turning")`)) { v5live = true; break; } await sleep(25); }
  const v5mid = await evaluate(`(()=>{document.getElementById("verso-turn").click();const sh=document.getElementById("sheet");return{versoed:sh.classList.contains("versoed"),flip3d:sh.classList.contains("flip3d")};})()`);
  check("V5 a flip attempt during a LIVE style-turn is ignored (the turn owns the sheet)", v5live && v5mid.versoed === false && v5mid.flip3d === false, JSON.stringify({ v5live, ...v5mid }));
  await waitTurned("v5-turn-lands");
  const v5 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const sh=document.getElementById("sheet");return{style:svg?svg.getAttribute("data-vellum-style"):null,versoed:sh.classList.contains("versoed"),svgCount:document.querySelectorAll("#map svg").length,back:document.querySelectorAll(".sheet-back").length};})()`);
  check("V5b the turn still lands re-dressed and un-flipped after the ignored click", v5.style === "ink" && v5.versoed === false && v5.svgCount === 1 && v5.back === 0, JSON.stringify(v5));

  // Restore a clean antique seed-42 base for the suites that follow.
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("draw").click();})()`);
  await waitSettled("post-turn-restore");

}
