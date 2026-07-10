// Motion / choreography (D + F): the #127 Drafting-moment arrival ceremony and atlas-plate
// reveal/hover (#146), and the #130 Folio cross-document view-transition declarations.
// Split from the old suite-explorer-core.mjs; prefixes D (Drafting) and F (Folio) unchanged.
export async function run(ctx) {
  const { evaluate, check, sleep, waitSettled, waitAtlas } = ctx;
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
