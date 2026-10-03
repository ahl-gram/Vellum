import type { SuiteContext } from "../../types.ts";
import type { SurveyKit } from "./kit.ts";

export async function sv2pDrawBeat({ evaluate, waitSettled, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=7&style=antique&survey", "survey-draw-beat-base");
  await waitInked("survey-draw-beat-base-ink");
  // Issue #373: the same rAF loop samples the coastline's inkDraw, whose stroke-dashoffset is not compositable and so advances ONLY while the main thread is free. dashCoastForInk (draw-ceremony.ts) sets the dash; animationend clears it.
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0,dashSteps:0,lastDash:"",dashSeen:0,gap:0,last:performance.now()};
      const bump=(now)=>{window.__land.frames++;
        window.__land.gap=Math.max(window.__land.gap,now-window.__land.last);window.__land.last=now;
        const c=document.querySelector("#map #layer-land path");
        if(c){const v=getComputedStyle(c).strokeDashoffset;
          if(v&&v!=="none"&&v!=="0px")window.__land.dashSeen++;
          if(v!==window.__land.lastDash){window.__land.lastDash=v;window.__land.dashSteps++;}}
        window.__land.raf=requestAnimationFrame(bump);};requestAnimationFrame(bump);
      window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
        for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
          if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
          else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
        if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames,
          verso:!!document.querySelector("#verso .verso-track")});});
      window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("survey-draw-beat-settle");
  await waitInked("survey-draw-beat-ink");
}

export async function sv2pSwapThenInk({ evaluate, check }: SuiteContext): Promise<void> {
  const sv2p = await evaluate<{ batches: { chart: boolean; overlay: boolean; frames: number; verso: boolean }[]; chartBatch: number; inkBatch: number; chartAlone: boolean; dashSteps: number; dashSeen: number; frames: number; gap: number; framesBetween: number; versoAtSwap: boolean | null; facesAgree: boolean; overlays: number; vertices: number; status: string; hash: string }>(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
      const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
      const recto=document.querySelector("#map .voyage-overlay .voyage-track");
      const back=document.querySelector("#verso .verso-track");
      return{batches:b,chartBatch:c,inkBatch:i,chartAlone:c>=0&&!b[c].overlay,
        dashSteps:window.__land.dashSteps,dashSeen:window.__land.dashSeen,frames:window.__land.frames,gap:window.__land.gap,
        framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
        versoAtSwap:c>=0?b[c].verso:null,
        facesAgree:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
          return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})(),
        status:document.getElementById("status").textContent,hash:location.hash};})()`);
  check(
    "SV2p a Draw with the survey inked paints the new chart before the arm: the swap and the ink land in different tasks, a frame apart (#366)",
    // framesBetween is load-bearing: a queueMicrotask fake-deferral left every other clause green (guard-prover run); it alone tells one task from two, do not drop it.
    sv2p.chartAlone && sv2p.inkBatch > sv2p.chartBatch && sv2p.framesBetween >= 1 &&
      sv2p.batches.length === 2 && sv2p.overlays === 1 && sv2p.status === "" &&
      /(^|&)survey(&|$)/.test(sv2p.hash.slice(1)),
    JSON.stringify(sv2p),
  );
  check(
    "SV2r the #127 arrival ceremony RUNS while the survey is being prepared: inkDraw advances instead of stalling (#373)",
    // The ratified acceptance on the ruled path (a Draw with the box ticked), the only check here that watches the ceremony itself: stroke-dashoffset is not compositable, so a matrix left on the main thread starves it. TWO clauses, because the frame COUNT is environment-scaled (104 steps on the authoring laptop, 35 to 39 on CI, both healthy; 3 with the matrix put back) and the gap is not (capped well clear of the 383.3 a loaded CI runner reported and well under the 1066.6 the mutant reads).
    sv2p.dashSeen >= 12 && sv2p.gap > 0 && sv2p.gap < 900,
    JSON.stringify({ dashSteps: sv2p.dashSteps, dashSeen: sv2p.dashSeen, gap: sv2p.gap, frames: sv2p.frames }),
  );
  check(
    "SV2k the settle leaves the back face to the deferred arm: no outgoing track over the new ghost, and both faces agree once it lands (#174/#366)",
    sv2p.versoAtSwap === false && sv2p.facesAgree,
    JSON.stringify({ versoAtSwap: sv2p.versoAtSwap, facesAgree: sv2p.facesAgree, batches: sv2p.batches }),
  );
}

export async function sv2mStyleInBeat({ evaluate, check, sleep, waitTurned, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=7&style=antique&survey", "survey-dropped-arm-base");
  await waitInked("survey-dropped-arm-base-ink");
  const trackA = await evaluate<string | null>(`document.querySelector("#map .voyage-overlay .voyage-track").getAttribute("points")`);
  await evaluate(`(()=>{window.__fired=false;
      window.__mo2=new MutationObserver((recs)=>{if(window.__fired)return;let chart=false;
        for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
          if(!(n.classList&&n.classList.contains("voyage-overlay"))&&String(n.tagName).toLowerCase()==="svg")chart=true;}
        if(!chart)return;window.__fired=true;
        const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));});
      window.__mo2.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  let turningSeen = false;
  for (let i = 0; i < 300; i++) {
    if (await evaluate<boolean>(`!!document.querySelector(".sheet.turning")`)) { turningSeen = true; break; }
    await sleep(20);
  }
  const sv2m = await evaluate<{ fired: boolean; turning: boolean; versoPoints: string | null; status: string }>(`(()=>{window.__mo2.disconnect();
      const back=document.querySelector("#verso .verso-track");
      return{fired:window.__fired,turning:!!document.querySelector(".sheet.turning"),
        versoPoints:back?back.getAttribute("points"):"",
        status:document.getElementById("status").textContent};})()`);
  await waitTurned("survey-dropped-arm-turn");
  await waitInked("survey-dropped-arm-ink");
  const sv2mAfter = await evaluate<{ overlays: number; facesAgree: boolean; style: string | null; status: string }>(`(()=>{
      const recto=document.querySelector("#map .voyage-overlay .voyage-track");
      const back=document.querySelector("#verso .verso-track");
      return{overlays:document.querySelectorAll("#map .voyage-overlay").length,
        facesAgree:!!recto&&!!back&&recto.getAttribute("points")===back.getAttribute("points"),
        style:(document.querySelector("#map svg:not(.voyage-overlay)")||{getAttribute:()=>null}).getAttribute("data-vellum-style"),
        status:document.getElementById("status").textContent};})()`);
  check(
    "SV2m a style change inside the settle's beat never strands the previous world's track on the new world's back face (#174/#366)",
    turningSeen && sv2m.fired && sv2m.versoPoints !== trackA &&
      sv2mAfter.overlays === 1 && sv2mAfter.facesAgree && sv2mAfter.style === "ink" &&
      sv2m.status === "" && sv2mAfter.status === "",
    JSON.stringify({ turningSeen, ...sv2m, versoPoints: (sv2m.versoPoints || "").slice(0, 40),
      versoIsPreviousWorld: sv2m.versoPoints === trackA, after: sv2mAfter }),
  );
}

export async function sv2oVersoDraw({ evaluate, check, sleep, waitSettled, goto, waitInked }: SurveyKit): Promise<void> {
  await goto("#seed=7&style=antique&survey", "survey-flipped-base");
  await waitInked("survey-flipped-base-ink");
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500); // the ceremonial flip transition (--verso-turn 1200ms)
  const flippedTrackA = await evaluate<string | null>(`(()=>{const b=document.querySelector("#verso .verso-track");
      return b?b.getAttribute("points"):"";})()`);
  await evaluate(`(()=>{window.__flip={batches:[]};
      window.__mo3=new MutationObserver((recs)=>{let chart=false;
        for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
          if(!(n.classList&&n.classList.contains("voyage-overlay"))&&String(n.tagName).toLowerCase()==="svg")chart=true;}
        if(!chart)return;
        const back=document.querySelector("#verso .verso-track");
        const recto=document.querySelector("#map .voyage-overlay .voyage-track");
        window.__flip.batches.push({back:back?back.getAttribute("points"):"",
          recto:recto?recto.getAttribute("points"):"",
          versoed:document.getElementById("sheet").classList.contains("versoed")});});
      window.__mo3.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{document.getElementById("seed").value="42";document.getElementById("draw").click();})()`);
  await waitSettled("survey-flipped-settle");
  await waitInked("survey-flipped-ink");
  const sv2o = await evaluate<{ atSwap: { back: string | null; recto: string | null; versoed: boolean } | null; batches: number; settledAgree: boolean; versoed: boolean; status: string }>(`(()=>{window.__mo3.disconnect();
      const b=window.__flip.batches[0]||null;
      const back=document.querySelector("#verso .verso-track");
      const recto=document.querySelector("#map .voyage-overlay .voyage-track");
      return{atSwap:b,batches:window.__flip.batches.length,
        settledAgree:!!back&&!!recto&&back.getAttribute("points")===recto.getAttribute("points"),
        versoed:document.getElementById("sheet").classList.contains("versoed"),
        status:document.getElementById("status").textContent};})()`);
  await evaluate(`document.getElementById("verso-turn").click()`);
  await sleep(1500);
  check(
    "SV2o a Draw taken while resting on the verso changes the visible back face whole: ghost and track from the same draw, never a bare new ghost (#174/#366)",
    !!sv2o.atSwap && sv2o.atSwap.versoed && sv2o.atSwap.back !== "" &&
      sv2o.atSwap.back !== flippedTrackA && sv2o.atSwap.back === sv2o.atSwap.recto &&
      sv2o.settledAgree && sv2o.status === "",
    JSON.stringify({ outgoing: (flippedTrackA || "").slice(0, 30), ...sv2o,
      atSwap: sv2o.atSwap ? { ...sv2o.atSwap, back: (sv2o.atSwap.back || "").slice(0, 30),
        recto: (sv2o.atSwap.recto || "").slice(0, 30) } : null }),
  );
}
