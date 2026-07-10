// Wayfarer's Passage: real routes + the mode-aware marker (W17-W21, #120). The pure rules (mode
// assignment, road/sea geometry, the tilt cap, anti-flicker facing) are proven exhaustively in
// node:test; these prove they are WIRED into the live overlay. Self-bases on seed 526413615 (the
// one world with a sea leg) and restores the clean seed-42 base for the suites that follow.
// Split from suite-voyage.mjs; W prefix kept.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, sleep } = ctx;
  // ---------------------------------------------------------------------------
  // #120 Real routes plus the mode-aware marker. The pure rules (mode assignment, the
  // road/sea geometry, the tilt cap, the anti-flicker facing) are proven exhaustively in
  // node:test over synthetic grids; these checks prove those proven rules are WIRED into
  // the live overlay. Driven by the deterministic hooks, never by rAF timing.
  // ---------------------------------------------------------------------------

  // Land on a world with both a sea leg and road legs. Seed 526413615 ("The Isle of
  // Selivelai") sails out to Liatalin and back: 21 road legs, 2 sea legs.
  await evaluate(`(()=>{
    const voy=document.getElementById("voyage");
    if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="526413615";
    document.getElementById("style").value="antique";
    document.getElementById("draw").click();
  })()`);
  await waitSettled("voyage-120-draw");
  await evaluate(`(()=>{const c=document.getElementById("voyage");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const w17 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const modes={};
    for(const l of plan.legs) modes[l.mode]=(modes[l.mode]||0)+1;
    const bad=plan.legs.filter((l)=>!["road","sea","straight"].includes(l.mode)).length;
    return{legs:plan.legs.length,modes,bad};
  })()`);
  check("W17 every leg reaches the overlay carrying the router's mode, and a sea leg exists",
    w17.bad === 0 && w17.legs > 10 && (w17.modes.sea || 0) >= 1 && (w17.modes.road || 0) >= 10,
    JSON.stringify(w17));

  // W18: the routed track is a real polyline. Under v1 it had exactly one point per port.
  const w18 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(999);
    const plan=window.__vellumVoyagePlan();
    const pts=document.querySelector("#map .voyage-track").getAttribute("points").trim().split(" ").length;
    return{pts,ports:plan.ports.length};
  })()`);
  check("W18 the resting track is a multi-point routed path, not a port-to-port lerp",
    w18.pts > w18.ports, JSON.stringify(w18));

  // W19: the mark swaps ship <-> rider at the port, driven by the leg's mode.
  const w19 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const legs=plan.legs;
    const seaLeg=legs.findIndex((l)=>l.mode==="sea");
    const roadLeg=legs.findIndex((l)=>l.mode==="road");
    const glyphAtLeg=(i)=>{
      // sample the MIDDLE of leg i, so the mark is unambiguously on that leg
      window.__vellumVoyagePaintAt((i+0.5)/legs.length);
      const ship=document.querySelector("#map .voyage-ship");
      const rider=document.querySelector("#map .voyage-rider");
      const shown=(el)=>!!el&&el.getAttribute("display")!=="none";
      return shown(ship)?"ship":(shown(rider)?"rider":"none");
    };
    return{seaLeg,roadLeg,onSea:glyphAtLeg(seaLeg),onRoad:glyphAtLeg(roadLeg)};
  })()`);
  check("W19 the mark is a ship on a sea leg and a rider on a road leg, swapping at the port",
    w19.seaLeg >= 0 && w19.roadLeg >= 0 && w19.onSea === "ship" && w19.onRoad === "rider",
    JSON.stringify(w19));

  // W20: the mark never tips past MAX_TILT (24deg) on any bearing the sweep visits, and
  // its facing does not flicker along a leg. voyageStepTo lands only ON ports (legT=0), so
  // the mid-leg samples come from __vellumVoyagePaintAt.
  const w20 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const mark=()=>{const s=document.querySelector("#map .voyage-ship");const r=document.querySelector("#map .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};
    const read=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const tf=mark().getAttribute("transform");
      const rot=/rotate\\(([-0-9.]+)\\)/.exec(tf);
      const sc=/scale\\((-?[0-9.]+) 1\\)/.exec(tf);
      return{tilt:rot?Math.abs(parseFloat(rot[1])):0,facing:sc?parseFloat(sc[1]):1};
    };
    let maxTilt=0;
    // sweep the whole voyage densely for the tilt cap
    for(let k=0;k<=200;k++) maxTilt=Math.max(maxTilt,read(k/200).tilt);
    // Walk ONE road leg finely and count facing changes. The leg must be one that would
    // actually flicker under the naive per-segment rule, else the check is toothless: pick
    // the road leg whose RAW per-segment x-direction reverses the most. The first road leg
    // is usually monotone, where the smoothed rule and the naive rule agree at zero flips.
    const n=plan.legs.length;
    // Per-leg projected geometry, so we can (a) pick a leg that genuinely jitters and (b)
    // compute what the NAIVE per-segment rule would do, as the baseline to beat.
    const geom=window.__vellumVoyageLegGeometry();
    const cum=(pts)=>{const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));return c;};
    const rawReversals=(pts)=>{let rev=0,ps=0;for(let i=1;i<pts.length;i++){const s=Math.sign(pts[i].x-pts[i-1].x);if(s!==0&&ps!==0&&s!==ps)rev++;if(s!==0)ps=s;}return rev;};
    // The leg whose raw x-direction reverses the most: the hardest case for anti-flicker.
    // The first road leg is usually monotone, where naive and smoothed agree at zero.
    let legIdx=-1,worstRev=-1;
    geom.forEach((l,i)=>{if(l.mode==="road"){const r=rawReversals(l.points);if(r>worstRev){worstRev=r;legIdx=i;}}});
    // The NAIVE facing (sign of the raw segment under the mark) sampled at the SAME points
    // the live sweep uses, so a regression to the naive rule would tie this count exactly.
    const pts=geom[legIdx].points, c=cum(pts), total=c[c.length-1];
    const naiveFacingAt=(d)=>{let k=0;while(k<c.length-2&&c[k+1]<d)k++;const s=Math.sign(pts[k+1].x-pts[k].x);return s||1;};
    let flips=0,naiveFlips=0,prev=null,prevN=null;
    for(let k=0;k<=60;k++){
      const local=(k/60)*total;
      const f=read((legIdx+k/60)/n).facing; // the LIVE, shipped facing
      const nf=naiveFacingAt(local);         // what the naive rule would paint
      if(prev!==null&&f!==prev) flips++;
      if(prevN!==null&&nf!==prevN) naiveFlips++;
      prev=f; prevN=nf;
    }
    return{maxTilt:Math.round(maxTilt*100)/100,flips,naiveFlips,legIdx,worstRev};
  })()`);
  check("W20 the mark never tips past MAX_TILT on any bearing of the sweep",
    w20.maxTilt <= 24.0001, `max |tilt| = ${w20.maxTilt}deg`);
  // The shipped smoothing must flip STRICTLY FEWER times than the naive per-segment rule on
  // a leg that genuinely jitters. Sampled identically, a regression to the naive rule would
  // tie the two counts, so `flips < naiveFlips` fails the moment the smoothing is unwired.
  // The remaining live flips are genuine sustained reversals of a long winding road, not
  // flicker; the flicker-free property itself is proven exhaustively in voyage-geometry.test.
  check("W20b the shipped facing flips fewer times than the naive rule on a switchbacking leg",
    w20.naiveFlips >= 3 && w20.flips < w20.naiveFlips, JSON.stringify(w20));

  // W21: Download stays clean. The routed track AND both new glyphs live in the sibling
  // overlay <svg>, never inside the baked chart that Download blobs.
  const w21 = await evaluate(`(()=>{
    const chart=document.querySelector("#map svg:not(.voyage-overlay)");
    return{
      inChart:!!chart.querySelector(".voyage-track,.voyage-ship,.voyage-rider"),
      inOverlay:!!document.querySelector("#map .voyage-overlay .voyage-track"),
      shipInOverlay:!!document.querySelector("#map .voyage-overlay .voyage-ship"),
      riderInOverlay:!!document.querySelector("#map .voyage-overlay .voyage-rider"),
    };
  })()`);
  check("W21 the routed track and BOTH glyphs stay in the sibling overlay, never the baked chart",
    !w21.inChart && w21.inOverlay && w21.shipInOverlay && w21.riderInOverlay, JSON.stringify(w21));

  await evaluate(`window.__vellumVoyageStepTo(999)`);
  await shoot("explorer-voyage-routed.png");

  // Restore a clean, voyage-off, un-flipped, antique state for the suites that follow.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}})()`);
  await evaluate(`(()=>{const s=document.getElementById("sheet");if(s.classList.contains("versoed"))document.getElementById("verso-turn").click();})()`);
  await sleep(120); // let any turn-back settle before the health checkpoint reads the page
  // #120's checks draw seed 526413615 (the one world with a sea leg), so put seed 42 back:
  // the suites that follow read a page they expect to be showing the golden world.
  await evaluate(`(()=>{document.getElementById("seed").value="42";const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-restore");
  await sleep(1100); // the restore turns the sheet too; let it land before the next suite
}
