// The ink-in, re-hosted on the Reading Room (RS18-RS22, #320 Sub 3, porting S20-S26).
//
// living-chart.ts tags the CROSSING settlement group `data-ink` with its grade and the
// CSS keys the animation on it, so the attribute is both the trigger and the scrub-only
// scope. e2e reads the WIRED motion, as the Explorer's originals do; the live animation
// itself is CDP-probe verified.
//
// Split from suite-room-instrument.mjs to stay inside the 400-line file rule: that suite
// carries the reveal and the clock, this one carries the ceremony and the press.
import { makeRoom, makeBar, scrubFacts, scopedHealth, CHART_SVG } from "./room-support.mjs";

export async function run(ctx) {
  const { evaluate, check } = ctx;
  const room = makeRoom(ctx);
  const { setYear } = makeBar(ctx);
  const gate = scopedHealth(ctx);

  await room.goto("#seed=42&style=antique&legend=1");
  const sm = await scrubFacts(evaluate, 42);

  // A clean present park first, so the `sm` facts address real glyph groups.
  await setYear(sm.present);
  const inkedCount = () => evaluate(`document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length`);

  // RS18 (S20): a PARK is silent. If a park painted a grade, arriving in the room would
  // stamp the entire world in at once. Non-vacuous: RS4 already proved every glyph is up.
  const rs18 = await inkedCount();
  check("RS18 the park is silent: every glyph is up and none carries an ink grade (#155)", rs18 === 0, `${rs18} groups inked at the park`);

  // RS19 (S21): crossing a founding stamps THAT town. The grade lands on the group and
  // the mark node under it carries inkStamp at --paper about the town point, resolved
  // against the view box (never a box centre: the chart mixes projections, so a castle
  // STANDS ON its point while a plan mark is CENTRED on it).
  if (sm.lateIdx >= 0) {
    await setYear(sm.lateFounded - 1);
    const rs19 = await evaluate(`(()=>{
      const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.lateFounded}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
      const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${sm.lateIdx}"]');
      if(!g)return{found:false};
      const mark=g.querySelector(":scope > :not(text)");
      if(!mark)return{found:true,hasMark:false};
      const cs=getComputedStyle(mark);
      const vb=document.querySelector("${CHART_SVG}").viewBox.baseVal;
      const o=cs.transformOrigin.split(" ").map(parseFloat);
      return{found:true,hasMark:true,ink:g.getAttribute("data-ink"),disp:getComputedStyle(g).display,
        name:cs.animationName,dur:cs.animationDuration,box:cs.transformBox,
        wantX:${sm.lateNx}*vb.width,wantY:${sm.lateNy}*vb.height,gotX:o[0],gotY:o[1],
        others:document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]').length};
    })()`);
    const onPoint = rs19.found && rs19.hasMark && Math.abs(rs19.gotX - rs19.wantX) < 0.05 && Math.abs(rs19.gotY - rs19.wantY) < 0.05;
    check(
      "RS19 crossing a founding stamps that town: data-ink=founding, inkStamp at --paper about the town point",
      rs19.found && rs19.hasMark && rs19.ink === "founding" && rs19.disp !== "none" &&
        rs19.name === "inkStamp" && rs19.dur.includes("0.26") && rs19.box === "view-box" && onPoint && rs19.others >= 1,
      JSON.stringify(rs19),
    );
  } else {
    check("RS19 seed 42 has a later living founding to cross", false, "no second living founding in manifest");
  }

  // RS20 (S22): the NAME dries one quick beat behind its mark (#170's staggered-name
  // idiom). Jumping from the earliest year to the present reveals many towns at once,
  // guaranteeing an inked group that kept its label.
  await setYear(sm.minFounded);
  const rs20 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.present}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    const inked=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink]')];
    const withLabel=inked.find((g)=>g.querySelector(":scope > text"));
    if(!withLabel)return{inked:inked.length,labelled:false};
    const cs=getComputedStyle(withLabel.querySelector(":scope > text"));
    return{inked:inked.length,labelled:true,name:cs.animationName,dur:cs.animationDuration,delay:cs.animationDelay};
  })()`);
  check(
    "RS20 a revealed town's NAME dries in one quick beat behind its mark (#155)",
    rs20.inked > 0 && rs20.labelled && rs20.name === "dryingInk" && rs20.dur.includes("0.18") && rs20.delay.includes("0.18"),
    JSON.stringify(rs20),
  );

  // RS21 (S23): a ruin has no press to it. Its beat is the FALL year and it dries into
  // the record rather than stamping down.
  if (sm.ruinIdx >= 0) {
    await setYear(sm.ruinYear - 1);
    const rs21 = await evaluate(`(()=>{
      const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.ruinYear}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
      const g=document.querySelector('.rf-chart #layer-settlements g.settlement[data-idx="${sm.ruinIdx}"]');
      if(!g)return{found:false};
      const mark=g.querySelector(":scope > :not(text)");
      if(!mark)return{found:true,hasMark:false};
      const cs=getComputedStyle(mark);
      return{found:true,hasMark:true,ink:g.getAttribute("data-ink"),disp:getComputedStyle(g).display,
        name:cs.animationName,dur:cs.animationDuration};
    })()`);
    check(
      "RS21 a ruin inks in at its FALL year with dryingInk, never the stamp (#155)",
      rs21.found && rs21.hasMark && rs21.ink === "ruin" && rs21.disp !== "none" &&
        rs21.name === "dryingInk" && rs21.dur.includes("0.26"),
      JSON.stringify(rs21),
    );
  } else {
    check("RS21 seed 42 has a ruin to ink in", false, "no ruin in manifest");
  }

  // RS22 (S26): the crown jewel. The stamp presses ONTO the town, it does not slide onto
  // it, so the town point must be a FIXED POINT of the press: at any instant the mark's
  // box is the resting box scaled about that point. Ground truth comes from the MANIFEST
  // through the chart's own getScreenCTM, never from a .place-hit box (the overlay is
  // sized to the mount while the chart svg renders a few px wider, and the press would
  // scale that ~1.2px offset into a phantom error). Tolerance is sub-pixel on purpose:
  // the defect this guards is 1.03px at k=1.
  await setYear(sm.minFounded);
  const rs22 = await evaluate(`(()=>{
    const s=document.querySelector(".rf-range");const ax=window.__vellumAgesState();s.value=String(Number(s.max)/2+(${sm.present}-ax.min));s.dispatchEvent(new Event("input",{bubbles:true}));
    const man=window.__vellumRunInline({kind:"draw",seed:42,overrides:{},render:{style:"antique",widthPx:1500,legend:true}}).manifest;
    const pt=new Map(man.places.map((p)=>[String(p.idx),p]));
    const svg=document.querySelector("${CHART_SVG}");
    const vb=svg.viewBox.baseVal, ctm=svg.getScreenCTM();
    const groups=[...document.querySelectorAll('.rf-chart #layer-settlements g.settlement[data-ink="founding"]')];
    let worst=0,worstAt="",measured=0,castles=0;
    for(const g of groups){
      const place=pt.get(g.dataset.idx);
      if(!place)continue;
      const p=new DOMPoint(place.nx*vb.width,place.ny*vb.height).matrixTransform(ctm);
      const px=p.x, py=p.y;
      for(const mark of g.querySelectorAll(":scope > :not(text)")){
        const anims=mark.getAnimations();
        if(!anims.length)continue;
        if(mark.querySelector(".settlement-capital,.settlement-seat")||mark.classList.contains("settlement-capital")||mark.classList.contains("settlement-seat"))castles++;
        for(const a of anims)a.pause();
        for(const a of anims)a.currentTime=0;
        const b0=mark.getBoundingClientRect();
        const k=new DOMMatrix(getComputedStyle(mark).transform).a;
        for(const a of anims)a.currentTime=a.effect.getTiming().duration;
        const b1=mark.getBoundingClientRect();
        for(const a of anims){a.currentTime=0;a.play();}
        if(b1.width===0||b1.height===0)continue;
        measured++;
        for(const [got,rest,q] of [[b0.left,b1.left,px],[b0.right,b1.right,px],[b0.top,b1.top,py],[b0.bottom,b1.bottom,py]]){
          const d=Math.abs(got-(q+k*(rest-q)));
          if(d>worst){worst=d;worstAt=g.dataset.idx+" k="+k.toFixed(3);}
        }
      }
    }
    return{groups:groups.length,measured,castles,worst:Number(worst.toFixed(3)),worstAt};
  })()`);
  check(
    "RS22 the stamp presses ONTO the town: the town point is a fixed point of the press (#155)",
    rs22.measured > 0 && rs22.castles > 0 && rs22.worst < 0.05,
    JSON.stringify(rs22),
  );

  gate.check("RS25 the ink-in run is clean (no console errors, no new 4xx)");
}
