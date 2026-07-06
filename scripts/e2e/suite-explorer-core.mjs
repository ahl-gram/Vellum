// Explorer core checks (A0-A8 worker/parity/race/themed, A11 Tide Wheel, A12 arms).
// Split from e2e-explorer.mjs; behavior + check order unchanged.
export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, waitSettled, waitAtlas, waitReady, axDescription, serverState, consoleErrors, http4xx, PORT } = ctx;
  check("A0 page loaded + initial auto-draw rendered", await waitReady());
  check("A1 worker active (no silent fallback)", await evaluate(`window.__vellumUsesWorker()===true`));

  // A2: worker draw === inline draw, byte-for-byte, in the browser. Includes the
  // #52 place manifest: a new structured-cloneable field that must be identical
  // worker-vs-inline (same V8 runs both paths, so nx/ny are byte-identical).
  const a2 = await evaluate(
    `(async()=>{const m={kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}};const j=await window.__vellumRunJob(m);const i=window.__vellumRunInline(m);return{svg:j.svg===i.svg,title:j.title===i.title,mt:j.mapType===i.mapType,band:j.band===i.band,man:JSON.stringify(j.manifest)===JSON.stringify(i.manifest),places:j.manifest.places.length,len:j.svg.length};})()`,
    true,
  );
  check("A2 draw: worker bytes === inline bytes (svg + manifest)", a2.svg && a2.title && a2.mt && a2.band && a2.man, `${a2.len} code units, ${a2.places} places, manifest eq=${a2.man}`);

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

}
