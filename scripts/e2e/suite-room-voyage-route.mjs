// Room voyage-route e2e (RV1-RV12, #320 Sub 3): W17-W28 re-hosted on the Reading Room; Sub 4 retired the Explorer's voyage seams, so this is the only host that can still run them.
// RV4 is the ONLY numeric guard on MAX_TILT anywhere (a 24 -> 30 mutation leaves all 1058 unit tests green and reds only RV4); RV3/RV9/RV10 guard showMark's #181 wiring, which has no unit coverage.
import { makeRoom, scopedHealth } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, check, shoot } = ctx;
  const room = makeRoom(ctx);
  const gate = scopedHealth(ctx);

  // Seed 526413615 ("The Isle of Selivelai"): 24 ports, a closed 24-leg round trip (15 road, 9 sea), exactly one genuine inland handoff.
  const based = await room.goto("#seed=526413615&style=antique&legend=1&survey");
  check("RV0 the room lands on the routed world at the survey rest", based);

  const rv1 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const modes={};
    for(const l of plan.legs) modes[l.mode]=(modes[l.mode]||0)+1;
    const bad=plan.legs.filter((l)=>!["road","sea","straight"].includes(l.mode)).length;
    return{legs:plan.legs.length,modes,bad};
  })()`);
  check(
    "RV1 every leg reaches the overlay carrying the router's mode, and a sea leg exists",
    rv1.bad === 0 && rv1.legs > 10 && (rv1.modes.sea || 0) >= 1 && (rv1.modes.road || 0) >= 10,
    JSON.stringify(rv1),
  );

  const rv2 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(999);
    const plan=window.__vellumVoyagePlan();
    const pts=document.querySelector(".rf-chart .voyage-track").getAttribute("points").trim().split(" ").length;
    return{pts,ports:plan.ports.length};
  })()`);
  check("RV2 the resting track is a multi-point routed path, not a port-to-port lerp", rv2.pts > rv2.ports, JSON.stringify(rv2));

  const rv3 = await evaluate(`(()=>{
    const legs=window.__vellumVoyagePlan().legs;
    const seaLeg=legs.findIndex((l)=>l.mode==="sea");
    const roadLeg=legs.findIndex((l)=>l.mode==="road");
    const glyphAtLeg=(i)=>{
      window.__vellumVoyagePaintAt((i+0.5)/legs.length);
      const ship=document.querySelector(".rf-chart .voyage-ship");
      const rider=document.querySelector(".rf-chart .voyage-rider");
      const shown=(el)=>!!el&&el.getAttribute("display")!=="none";
      return shown(ship)?"ship":(shown(rider)?"rider":"none");
    };
    return{seaLeg,roadLeg,onSea:glyphAtLeg(seaLeg),onRoad:glyphAtLeg(roadLeg)};
  })()`);
  check(
    "RV3 the mark is a ship on a sea leg and a rider on a road leg, swapping at the port",
    rv3.seaLeg >= 0 && rv3.roadLeg >= 0 && rv3.onSea === "ship" && rv3.onRoad === "rider",
    JSON.stringify(rv3),
  );

  // Samples come from voyagePaintAt (stepTo lands only ON ports, never mid-leg where the tilt varies); the anti-flicker leg is selected by the metric ASSERTED, never by index, which once left this passing on a tie.
  const rv45 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const mark=()=>{const s=document.querySelector(".rf-chart .voyage-ship");const r=document.querySelector(".rf-chart .voyage-rider");return (s&&s.getAttribute("display")!=="none")?s:r;};
    const read=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const tf=mark().getAttribute("transform");
      const rot=/rotate\\(([-0-9.]+)\\)/.exec(tf);
      const sc=/scale\\((-?[0-9.]+) 1\\)/.exec(tf);
      return{tilt:rot?Math.abs(parseFloat(rot[1])):0,facing:sc?parseFloat(sc[1]):1};
    };
    let maxTilt=0;
    for(let k=0;k<=200;k++) maxTilt=Math.max(maxTilt,read(k/200).tilt);
    const n=plan.legs.length;
    const geom=window.__vellumVoyageLegGeometry();
    const cum=(pts)=>{const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));return c;};
    const naiveAt=(pts,c,d)=>{let k=0;while(k<c.length-2&&c[k+1]<d)k++;return Math.sign(pts[k+1].x-pts[k].x)||1;};
    const naiveFlipsOf=(pts)=>{const c=cum(pts);const total=c[c.length-1];let f=0,p=null;
      for(let k=0;k<=60;k++){const v=naiveAt(pts,c,(k/60)*total);if(p!==null&&v!==p)f++;p=v;}return f;};
    let legIdx=-1,worstNaive=-1;
    geom.forEach((l,i)=>{if(l.mode==="road"){const f=naiveFlipsOf(l.points);if(f>worstNaive){worstNaive=f;legIdx=i;}}});
    const pts=geom[legIdx].points, c=cum(pts), total=c[c.length-1];
    let flips=0,naiveFlips=0,prev=null,prevN=null;
    for(let k=0;k<=60;k++){
      const local=(k/60)*total;
      const f=read((legIdx+k/60)/n).facing;
      const nf=naiveAt(pts,c,local);
      if(prev!==null&&f!==prev) flips++;
      if(prevN!==null&&nf!==prevN) naiveFlips++;
      prev=f; prevN=nf;
    }
    return{maxTilt:Math.round(maxTilt*100)/100,flips,naiveFlips,legIdx,worstNaive};
  })()`);
  check("RV4 the mark never tips past MAX_TILT on any bearing of the sweep", rv45.maxTilt <= 24.0001, `max |tilt| = ${rv45.maxTilt}deg`);
  check(
    "RV5 the shipped facing flips fewer times than the naive rule on a switchbacking leg",
    rv45.naiveFlips >= 3 && rv45.flips < rv45.naiveFlips,
    JSON.stringify(rv45),
  );

  const rv6 = await evaluate(`(()=>{
    const chart=document.querySelector(".rf-chart svg:not(.voyage-overlay)");
    return{
      inChart:!!chart.querySelector(".voyage-track,.voyage-ship,.voyage-rider"),
      inOverlay:!!document.querySelector(".rf-chart .voyage-overlay .voyage-track"),
      shipInOverlay:!!document.querySelector(".rf-chart .voyage-overlay .voyage-ship"),
      riderInOverlay:!!document.querySelector(".rf-chart .voyage-overlay .voyage-rider"),
    };
  })()`);
  check(
    "RV6 the routed track and BOTH glyphs stay in the sibling overlay, never the baked chart",
    !rv6.inChart && rv6.inOverlay && rv6.shipInOverlay && rv6.riderInOverlay,
    JSON.stringify(rv6),
  );

  const rv7 = await evaluate(`(()=>{
    window.__vellumVoyageStepTo(999);
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const sig=document.querySelector(".rf-log-sig").textContent;
    const rows=document.querySelector(".rf-log-strip").querySelectorAll("li.prologue").length;
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
  check(
    "RV7 the full sweep logs every port plus the homecoming, opens with the attribution + a departure, all persisting",
    rv7.visible && rv7.entries === rv7.ports + 1 && rv7.rows === rv7.entries &&
      rv7.logged === rv7.entries && rv7.legs === rv7.ports &&
      rv7.opensDeparture && rv7.closesHome && rv7.homeIdx === rv7.capitalIdx &&
      rv7.sig === rv7.attribution && rv7.attribution.startsWith("Being a true"),
    JSON.stringify({ ...rv7, attribution: rv7.attribution.slice(0, 24) }),
  );

  const rv8 = await evaluate(`(()=>{
    const plan=window.__vellumVoyagePlan();
    const log=window.__vellumVoyageLog();
    const inbound=plan.legs.slice(0,-1);
    const seaLeg=inbound.findIndex((l)=>l.mode==="sea");
    const roadLeg=inbound.findIndex((l)=>l.mode==="road");
    return{seaLeg,roadLeg,
      seaEntry:seaLeg>=0?log.entries[seaLeg+1].text:"",
      roadEntry:roadLeg>=0?log.entries[roadLeg+1].text:""};
  })()`);
  check(
    "RV8 the margin log consumes the leg mode: a sea arrival sailed, a road arrival rode",
    rv8.seaLeg >= 0 && rv8.roadLeg >= 0 && rv8.seaEntry.includes("made sail") && rv8.roadEntry.includes("rode on"),
    JSON.stringify(rv8),
  );

  const rv9 = await evaluate(`(()=>{
    const log=window.__vellumVoyageLog();
    const first=document.querySelector(".rf-log-strip li.prologue");
    const domText=first?first.querySelector(".cr-text").textContent:"";
    const domGutter=first?first.querySelector(".cr-year").textContent:"";
    const engineFirst=log?log.entries[0].text:"";
    return{
      panelOutsideChart: !document.querySelector(".rf-chart .rf-ages") && !document.querySelector(".rf-chart .rf-log-strip"),
      matches: !!domText && engineFirst.includes(domText) && engineFirst.startsWith("Year ") &&
        log && domGutter === ("day " + log.entries[0].day),
      status: document.querySelector(".rf-status").textContent, summary: log?log.summary:"",
    };
  })()`);
  check(
    "RV9 the journal rows mirror the engine entries, live outside the chart, and the status line holds the one summary",
    rv9.matches && rv9.panelOutsideChart && rv9.status === rv9.summary && rv9.summary !== "",
    JSON.stringify(rv9),
  );

  const rv10 = await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const sea=legs.filter((l)=>l.mode==="sea");
    const missing=sea.filter((l)=>!l.water).length;
    const badOrder=sea.filter((l)=>l.water&&!(l.water.from>0&&l.water.from<l.water.to&&l.water.to<1)).length;
    const landSpans=legs.filter((l)=>l.mode!=="sea"&&(l.water||l.inlandHandoff)).length;
    const fatStub=sea.filter((l)=>!l.inlandHandoff).filter((l)=>l.water.from>0.08||l.water.to<0.92).length;
    const handoffs=sea.filter((l)=>l.inlandHandoff).length;
    const n=legs.length;
    const hi=legs.findIndex((l)=>l.inlandHandoff);
    const w=hi>=0?legs[hi].water:null;
    const glyph=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const ship=document.querySelector(".rf-chart .voyage-ship");
      return (!!ship&&ship.getAttribute("display")!=="none")?"ship":"rider";
    };
    return{seaLegs:sea.length,missing,badOrder,landSpans,fatStub,handoffs,hi,
      onWater:w?glyph((hi+(w.from+w.to)/2)/n):"",
      onStub:w?glyph((hi+(w.to+1)/2)/n):"",
      entry:hi>=0?window.__vellumVoyageLog().entries[hi+1].text:""};
  })()`);
  check(
    "RV10 every sea leg ships a sane water span; the one genuine handoff sails the span, rides the landfall stub, and is narrated",
    rv10.seaLegs >= 2 && rv10.missing === 0 && rv10.badOrder === 0 && rv10.landSpans === 0 &&
      rv10.fatStub === 0 && rv10.handoffs === 1 && rv10.hi >= 0 &&
      rv10.onWater === "ship" && rv10.onStub === "rider" &&
      /rode from .+ to the coast, took ship, and made landfall below/.test(rv10.entry) &&
      !rv10.entry.includes("made sail"),
    JSON.stringify(rv10),
  );
  await evaluate(`window.__vellumVoyageStepTo(999)`);
  await shoot("reading-room-voyage-routed.png");

  // Seed 39 carries the worst measured handoffs (a 26-cell embark stub and a 48-cell landfall stub, back to back), proving the swap in BOTH directions.
  await room.goto("#seed=39&style=antique&legend=1&survey");
  const rv11 = await evaluate(`(()=>{
    const legs=window.__vellumVoyageLegGeometry();
    const n=legs.length;
    const hs=legs.map((l,i)=>({l,i})).filter((x)=>x.l.inlandHandoff);
    if(!hs.length) return{handoffs:0};
    const emb=hs.reduce((a,b)=>(b.l.water.from>a.l.water.from?b:a));
    const land=hs.reduce((a,b)=>((1-b.l.water.to)>(1-a.l.water.to)?b:a));
    const glyph=(t)=>{
      window.__vellumVoyagePaintAt(t);
      const ship=document.querySelector(".rf-chart .voyage-ship");
      return (!!ship&&ship.getAttribute("display")!=="none")?"ship":"rider";
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
  check(
    "RV11 seed 39: the mark rides to the shore, sails the crossing, and rides again on landfall, narrated",
    rv11.handoffs === 2 && rv11.embFrom > 0.3 && rv11.landTo < 0.7 &&
      rv11.ridesToShore === "rider" && rv11.sails === "ship" && rv11.ridesFromLandfall === "rider" &&
      rv11.narrated,
    JSON.stringify(rv11),
  );
  await shoot("reading-room-voyage-handoff.png");

  // Seed 430445745 puts ports on THREE landmasses with roads only on the capital's; the 1.5-cell wet-run bound sits against 1.16 measured post-fix and 33.4 pre-fix (#298), legs selected by the metric asserted.
  await room.goto("#seed=430445745&style=antique&legend=1&survey");
  const rv12 = await evaluate(`(()=>{
    const res=window.__vellumRunInline({kind:"draw",seed:430445745,overrides:{},render:{style:"antique",widthPx:1500,legend:true,arms:false}});
    const {gridW,gridH,land}=res.survey;
    const legs=window.__vellumVoyageLegGeometry();
    const margin=Math.round(1500*0.045);
    const scale=(1500-2*margin)/(gridW-1);
    const inv=(v)=>(v-margin)/scale;
    const straight=legs.map((l,i)=>({l,i})).filter((x)=>x.l.mode==="straight");
    let maxRun=0;
    let longest={i:-1,len:0};
    for(const {l,i} of straight){
      const pts=l.points;
      let run=0, legLen=0;
      for(let j=1;j<pts.length;j++){
        const a=pts[j-1],b=pts[j];
        const len=Math.hypot(b.x-a.x,b.y-a.y)/scale;
        legLen+=len;
        const steps=Math.max(2,Math.ceil(len*4));
        for(let k=0;k<=steps;k++){
          const t=k/steps;
          const gx=Math.round(inv(a.x+(b.x-a.x)*t));
          const gy=Math.round(inv(a.y+(b.y-a.y)*t));
          const sea=gx>=0&&gy>=0&&gx<gridW&&gy<gridH?land[gx+gy*gridW]===0:true;
          if(sea){run+=len/steps;maxRun=Math.max(maxRun,run);}else{run=0;}
        }
      }
      if(legLen>longest.len)longest={i,len:legLen};
    }
    window.__vellumVoyagePaintAt((longest.i+0.5)/legs.length);
    const ship=document.querySelector(".rf-chart .voyage-ship");
    return{straightCount:straight.length,maxRunCells:Number(maxRun.toFixed(2)),
      glyphMid:(!!ship&&ship.getAttribute("display")!=="none")?"ship":"rider"};
  })()`);
  check(
    "RV12 seed 430445745: every straight fallback leg's track stays on land (#298)",
    rv12.straightCount >= 10 && rv12.maxRunCells <= 1.5 && rv12.glyphMid === "rider",
    JSON.stringify(rv12),
  );
  await shoot("reading-room-voyage-straight-land.png");

  gate.check("RV13 the room route run is clean (no console errors, no new 4xx)");
}
