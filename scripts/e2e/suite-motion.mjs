// Motion e2e (D the #127 arrival ceremony, F the #130 folio view-transition declarations): hand-authored like its sibling suites, run by the e2e harness rather than the test runner.
export async function run(ctx) {
  const { evaluate, check, sleep, waitSettled } = ctx;
  await evaluate(`(()=>{const s=document.getElementById("seed");s.value="42";document.getElementById("style").value="antique";document.getElementById("theme").value="";document.getElementById("type").value="";document.getElementById("arms").checked=false;document.getElementById("draw").click();})()`);
  await waitSettled("draft-ceremony");
  const d1 = await evaluate(`(()=>{const svg=document.querySelector("#map svg");const p=svg.querySelector("#layer-land path");return{arriving:svg.classList.contains("arriving"),dashed:!!(p&&p.style.strokeDasharray)};})()`);
  check("D1 fresh draw runs the arrival ceremony (svg.arriving + coast dashed mid-draw)", d1.arriving && d1.dashed, JSON.stringify(d1));
  const d2 = await evaluate(`(async()=>{const svg=document.querySelector("#map svg");await Promise.all(svg.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));const p=svg.querySelector("#layer-land path");return{tform:getComputedStyle(svg).transform,dash:p?p.style.strokeDasharray:"(no path)",running:svg.getAnimations({subtree:true}).filter(a=>a.playState==="running").length};})()`, true);
  check("D2 ceremony settles STILL and pristine (transform none, dash removed, none running)", (d2.tform === "none" || d2.tform === "matrix(1, 0, 0, 1, 0, 0)") && !d2.dash && d2.running === 0, JSON.stringify(d2));
  await evaluate(`(()=>{const l=document.getElementById("land");l.value="300";l.dispatchEvent(new Event("input",{bubbles:true}));})()`);
  await sleep(220); // cross the ~100ms input debounce so the quiet redraw has started
  await waitSettled("draft-drag-input");
  const d3drag = await evaluate(`document.querySelector("#map svg").classList.contains("arriving")`);
  await evaluate(`(()=>{const l=document.getElementById("land");l.value="300";l.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("draft-drag-release");
  const d3rel = await evaluate(`document.querySelector("#map svg").classList.contains("arriving")`);
  check("D3 drag input is quiet (no ceremony), release restores it", d3drag === false && d3rel === true, `dragArriving=${d3drag} releaseArriving=${d3rel}`);
  // D4/D5 retired at #199 and their numbers left as a gap; the plate hover-lift's guard was PR20b in suite-print-room until #465 ruling 1 retired the on-screen plates' links, so the lift's one guard is the download's own document test (test/atlas/document.test.ts).
  // A view transition cannot be seen by e2e, so F1/F2 read the DECLARATION out of the CSSOM; motion.css is same-origin, so cssRules reads rather than throwing.
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
