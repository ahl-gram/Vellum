// Wayfarer's Passage: real routes + the mode-aware marker (W17-W21, #120), the margin log
// (W22-W24, #121), and the water-span glyph handoff (W25-W27, #181). The pure rules (mode
// assignment, road/sea geometry, the tilt cap, anti-flicker facing, the span math, and the
// deterministic mode-aware prose) are proven exhaustively in node:test; these prove they are
// WIRED into the live overlay + panel. Self-bases on seed 526413615 (a world that both sails
// and rides), visits seed 39 (the worst inland handoffs), and restores the clean seed-42 base
// for the suites that follow. Split from suite-voyage.mjs; W prefix kept.
export async function run(ctx) {
  const { evaluate, check, shoot, waitSettled, sleep } = ctx;
  // ---------------------------------------------------------------------------
  // #120 Real routes plus the mode-aware marker. The pure rules (mode assignment, the
  // road/sea geometry, the tilt cap, the anti-flicker facing) are proven exhaustively in
  // node:test over synthetic grids; these checks prove those proven rules are WIRED into
  // the live overlay. Driven by the deterministic hooks, never by rAF timing.
  // ---------------------------------------------------------------------------

  // Land on a world with both a sea leg and road legs. Seed 526413615 ("The Isle of
  // Selivelai"): 24 ports, and since #275 a closed round trip of 24 legs, 15 road and
  // 9 sea, one of which is the genuine inland handoff W25/W26 need. (Measured 2026-07-24;
  // the old "21 road, 2 sea" here had been stale since #184 re-ordered the itinerary on
  // actual travel, which groups the island visits and spends its crossings differently.)
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
    // The NAIVE facing (sign of the raw segment under the mark), sampled the way the live
    // sweep is sampled, so a regression to the naive rule would tie the two counts exactly.
    const naiveAt=(pts,c,d)=>{let k=0;while(k<c.length-2&&c[k+1]<d)k++;return Math.sign(pts[k+1].x-pts[k].x)||1;};
    const naiveFlipsOf=(pts)=>{const c=cum(pts);const total=c[c.length-1];let f=0,p=null;
      for(let k=0;k<=60;k++){const v=naiveAt(pts,c,(k/60)*total);if(p!==null&&v!==p)f++;p=v;}return f;};
    // Pick the road leg that flips the NAIVE facing the most: the hardest case for the
    // anti-flicker rule, and the metric this check actually asserts on. It used to select
    // by counting raw x-reversals instead, which is a DIFFERENT quantity (a vertical
    // segment, dx === 0, reads as +1 here but is skipped there), so a leg could reverse
    // zero times and still flip the naive facing five times. Selecting on one metric and
    // asserting on the other left the check passing on a tie: #275's reordered itinerary
    // shifted which leg won that tie and the fixture went toothless (naiveFlips 3 -> 1),
    // with a 5-flip leg sitting right there unselected. Measured on seed 526413615.
    let legIdx=-1,worstNaive=-1;
    geom.forEach((l,i)=>{if(l.mode==="road"){const f=naiveFlipsOf(l.points);if(f>worstNaive){worstNaive=f;legIdx=i;}}});
    const pts=geom[legIdx].points, c=cum(pts), total=c[c.length-1];
    let flips=0,naiveFlips=0,prev=null,prevN=null;
    for(let k=0;k<=60;k++){
      const local=(k/60)*total;
      const f=read((legIdx+k/60)/n).facing; // the LIVE, shipped facing
      const nf=naiveAt(pts,c,local);        // what the naive rule would paint
      if(prev!==null&&f!==prev) flips++;
      if(prevN!==null&&nf!==prevN) naiveFlips++;
      prev=f; prevN=nf;
    }
    return{maxTilt:Math.round(maxTilt*100)/100,flips,naiveFlips,legIdx,worstNaive};
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

  // ---------------------------------------------------------------------------
  // #121 The margin log. The prose is proven deterministic + mode-aware in node:test
  // (voyage-log.test.ts); these prove it is WIRED into the live panel on a real routed
  // world (seed 526413615 both sails and rides), consuming #120's leg mode.
  // ---------------------------------------------------------------------------

  // W22: the full sweep accumulates one dated entry per LEG plus the departure, so a round
  // trip (#275) logs ports + 1: every port, then the homecoming. The panel opens with the
  // surveyor's attribution and a departure, closes on the return, and all of it persists
  // brightened at rest.
  const w22 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(999); // land the whole survey at rest
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const sig=document.getElementById("voyage-log-sig").textContent;
    const rows=document.getElementById("voyage-log-strip").querySelectorAll("li").length;
    const last=log&&log.entries.length?log.entries[log.entries.length-1]:null;
    return{
      visible:!!(log&&log.visible), entries:log?log.entries.length:0, logged:log?log.logged:-1,
      rows, ports:plan?plan.ports.length:0, legs:plan?plan.legs.length:0, sig,
      attribution:log?log.attribution:"",
      opensDeparture:!!(log&&log.entries[0]&&log.entries[0].text.includes("set out")),
      closesHome:!!(last&&last.text.includes("whence we set out")),
      homeIdx:last?last.idx:-1, capitalIdx:plan&&plan.ports[0]?plan.ports[0].idx:-2,
    };
  })()`);
  check("W22 the full sweep logs every port plus the homecoming, opens with the attribution + a departure, all persisting",
    w22.visible && w22.entries === w22.ports + 1 && w22.rows === w22.entries &&
    w22.logged === w22.entries && w22.legs === w22.ports &&
    w22.opensDeparture && w22.closesHome && w22.homeIdx === w22.capitalIdx &&
    w22.sig === w22.attribution && w22.attribution.startsWith("Being a true"),
    JSON.stringify({ ...w22, attribution: w22.attribution.slice(0, 24) }));

  // W23: the voice consumes #120's leg mode. A port reached by a sea leg reads as a voyage
  // ("made sail"); one reached by a road leg reads as a ride ("rode on"). Port p is reached
  // by leg p-1, so its entry is entries[p], and that mapping survives #275 unchanged: the
  // closing leg's entry is simply the last one, the homecoming. The search skips that
  // closing leg so this check always lands on a plain arrival, never on the homecoming.
  const w23 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const inbound=plan.legs.slice(0,-1);
    const seaLeg=inbound.findIndex((l)=>l.mode==="sea");
    const roadLeg=inbound.findIndex((l)=>l.mode==="road");
    return{seaLeg,roadLeg,
      seaEntry:seaLeg>=0?log.entries[seaLeg+1].text:"",
      roadEntry:roadLeg>=0?log.entries[roadLeg+1].text:""};
  })()`);
  check("W23 the margin log consumes the leg mode: a sea arrival sailed, a road arrival rode",
    w23.seaLeg >= 0 && w23.roadLeg >= 0 && w23.seaEntry.includes("made sail") && w23.roadEntry.includes("rode on"),
    JSON.stringify(w23));

  // W24: the panel rows mirror the engine entries (the reveal drops only the redundant
  // "Year N." lead the entry carries), the panel lives OUTSIDE #map so Download can never
  // blob it, and #status holds the survey's one summary, not a per-port line.
  const w24 = await evaluate(`(()=>{
    const log=window.__vellumVoyageLog();
    const first=document.getElementById("voyage-log-strip").querySelector("li");
    const domText=first?first.querySelector(".cr-text").textContent:"";
    const domYear=first?first.querySelector(".cr-year").textContent:"";
    const engineFirst=log?log.entries[0].text:"";
    return{
      panelOutsideMap: !document.querySelector("#map #voyage-log") && !document.querySelector("#map .voyage-log"),
      matches: !!domText && engineFirst.includes(domText) && engineFirst.startsWith("Year "+domYear+"."),
      status: document.getElementById("status").textContent, summary: log?log.summary:"",
    };
  })()`);
  check("W24 the panel rows mirror the engine entries, live outside #map, and #status holds the one summary",
    w24.matches && w24.panelOutsideMap && w24.status === w24.summary && w24.summary !== "",
    JSON.stringify(w24));

  // ---------------------------------------------------------------------------
  // #181 The water span: the mark swaps rider <-> ship at the WATER'S EDGE, not at
  // the port. The span math is proven in node:test (voyage-water.test.ts); these
  // prove the span reaches the overlay, the glyph follows it, and the margin log
  // narrates the genuine inland handoffs (ratified three-part shape).
  // ---------------------------------------------------------------------------

  // W25: every sea leg carries a span, non-handoff crossings keep their swap at the
  // port (tiny stub fractions), and this world's one genuine handoff is wired through.
  const w25 = await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const sea=legs.filter((l)=>l.mode==="sea");
    const missing=sea.filter((l)=>!l.water).length;
    const badOrder=sea.filter((l)=>l.water&&!(l.water.from>0&&l.water.from<l.water.to&&l.water.to<1)).length;
    const landSpans=legs.filter((l)=>l.mode!=="sea"&&(l.water||l.inlandHandoff)).length;
    const coastal=sea.filter((l)=>!l.inlandHandoff);
    const fatStub=coastal.filter((l)=>l.water.from>0.08||l.water.to<0.92).length;
    const handoffs=sea.filter((l)=>l.inlandHandoff).length;
    return{seaLegs:sea.length,missing,badOrder,landSpans,fatStub,handoffs};
  })()`);
  check("W25 every sea leg ships a sane water span, coastal swaps hug the port, one genuine handoff",
    w25.seaLegs >= 2 && w25.missing === 0 && w25.badOrder === 0 && w25.landSpans === 0 &&
    w25.fatStub === 0 && w25.handoffs === 1,
    JSON.stringify(w25));

  // W26: on the handoff leg (Thilthoport, the pond-decoy port: a ~13 cell landfall
  // stub), the mark sails mid-span and RIDES the stub, and the port's margin-log entry
  // narrates the ride-sail-ride instead of a plain sail.
  const w26 = await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const n=legs.length;
    const hi=legs.findIndex((l)=>l.inlandHandoff);
    const w=legs[hi].water;
    const glyph=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const ship=document.querySelector("#map .voyage-ship");
      const shown=(el)=>!!el&&el.getAttribute("display")!=="none";
      return shown(ship)?"ship":"rider";
    };
    const onWater=glyph((hi+(w.from+w.to)/2)/n);
    const onStub=glyph((hi+(w.to+1)/2)/n);
    const entry=window.__vellumVoyageLog().entries[hi+1].text;
    return{hi,onWater,onStub,entry};
  })()`);
  check("W26 the mark sails the span, rides the landfall stub, and the log narrates the handoff",
    w26.hi >= 0 && w26.onWater === "ship" && w26.onStub === "rider" &&
    /rode from .+ to the coast, took ship, and made landfall below/.test(w26.entry) &&
    !w26.entry.includes("made sail"),
    JSON.stringify(w26));

  await evaluate(`window.__vellumVoyageStepTo(999)`);
  await shoot("explorer-voyage-routed.png");

  // W27: seed 39 carries the worst measured handoffs (2026-07-24: a 26-cell embark
  // stub into Feniefena and a 48-cell landfall stub into Loriemirmere, back to back),
  // so it proves the swap in BOTH directions: ride to the shore, sail, ride again.
  await evaluate(`(()=>{
    const voy=document.getElementById("voyage");
    if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}
    document.getElementById("seed").value="39";
    document.getElementById("draw").click();
  })()`);
  await waitSettled("voyage-181-draw39");
  await evaluate(`(()=>{const c=document.getElementById("voyage");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);

  const w27 = await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const n=legs.length;
    const hs=legs.map((l,i)=>({l,i})).filter((x)=>x.l.inlandHandoff);
    if(!hs.length) return{handoffs:0};
    const emb=hs.reduce((a,b)=>(b.l.water.from>a.l.water.from?b:a));
    const land=hs.reduce((a,b)=>((1-b.l.water.to)>(1-a.l.water.to)?b:a));
    const glyph=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const ship=document.querySelector("#map .voyage-ship");
      const shown=(el)=>!!el&&el.getAttribute("display")!=="none";
      return shown(ship)?"ship":"rider";
    };
    const ridesToShore=glyph((emb.i+emb.l.water.from/2)/n);
    const sails=glyph((emb.i+(emb.l.water.from+emb.l.water.to)/2)/n);
    const ridesFromLandfall=glyph((land.i+(land.l.water.to+1)/2)/n);
    const log=window.__vellumVoyageLog();
    const narrated=[emb.i,land.i].every((i)=>
      /rode from .+ to the coast, took ship, and made landfall below/.test(log.entries[i+1].text));
    return{handoffs:hs.length,embFrom:emb.l.water.from,landTo:land.l.water.to,
      ridesToShore,sails,ridesFromLandfall,narrated};
  })()`);
  check("W27 seed 39: the mark rides to the shore, sails the crossing, and rides again on landfall, narrated",
    w27.handoffs === 2 && w27.embFrom > 0.3 && w27.landTo < 0.7 &&
    w27.ridesToShore === "rider" && w27.sails === "ship" && w27.ridesFromLandfall === "rider" &&
    w27.narrated,
    JSON.stringify(w27));

  // Land the mark mid-stub ashore on the worst handoff for the visual record.
  await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const n=legs.length;
    const hs=legs.map((l,i)=>({l,i})).filter((x)=>x.l.inlandHandoff);
    const land=hs.reduce((a,b)=>((1-b.l.water.to)>(1-a.l.water.to)?b:a));
    window.__vellumVoyagePaintAt((land.i+(land.l.water.to+1)/2)/n);
  })()`);
  await shoot("explorer-voyage-handoff.png");

  // Restore a clean, voyage-off, un-flipped, antique state for the suites that follow.
  await evaluate(`(()=>{const voy=document.getElementById("voyage");if(voy.checked){voy.checked=false;voy.dispatchEvent(new Event("change",{bubbles:true}));}})()`);
  await evaluate(`(()=>{const s=document.getElementById("sheet");if(s.classList.contains("versoed"))document.getElementById("verso-turn").click();})()`);
  await sleep(120); // let any turn-back settle before the health checkpoint reads the page
  // This suite draws seeds 526413615 and 39 (worlds that sail), so put seed 42 back:
  // the suites that follow read a page they expect to be showing the golden world.
  await evaluate(`(()=>{document.getElementById("seed").value="42";const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("voyage-restore");
  await sleep(1100); // the restore turns the sheet too; let it land before the next suite
}
