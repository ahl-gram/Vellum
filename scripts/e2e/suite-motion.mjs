// Motion / choreography (D + F): the #127 Drafting-moment arrival ceremony and the #130
// Folio cross-document view-transition declarations. Split from the old suite-explorer-
// core.mjs; prefixes D (Drafting) and F (Folio) unchanged. #199 retired D4/D5 (the atlas-
// plate reveal/hover) when the bound atlas moved to the Print Room (see PR20b there).
export async function run(ctx) {
  const { evaluate, check, sleep, waitSettled } = ctx;
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
  // D4 and D5 are intentionally retired (#199): both drove the Explorer's inline "Bind as
  // atlas" (#atlas), which was consolidated into the Print Room. D4's reveal-on-scroll
  // stagger was an Explorer-only flourish (the Print Room's bound plates load eagerly, no
  // observer), so it retires outright. D5's shared-CSS plate hover-lift
  // (.atlas-sheet figure img:hover) is STILL live -- the Print Room injects the same
  // ATLAS_SHEET_CSS -- so its guard moved to suite-print-room's PR20b, which bites the same
  // rule on #pr-atlas. Numbers left as a gap so F1/F2 keep their history 1:1.

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
