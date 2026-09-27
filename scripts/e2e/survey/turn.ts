import type { SurveyKit } from "./kit.ts";

export async function sv10TurnKeepsTrack({ evaluate, check, waitTurned, armTurnWatch, waitInked }: SurveyKit): Promise<void> {
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  // Wait for the ink BEFORE the turn: a style change inside the arm's gap drops the pending arm, and SV10 would pass on a turn begun over a bare sheet, losing #153's premise.
  await waitInked("survey-armed-before-turn");
  await armTurnWatch();
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0};
      const bump=()=>{window.__land.frames++;window.__land.raf=requestAnimationFrame(bump);};bump();
      window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
        for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
          if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
          else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
        if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames});});
      window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("survey-style-turn");
  await waitInked("survey-turn-rearm");
  const sv10 = await evaluate<{ turned: boolean; style: string | null; vertices: number; overlays: number; batches: { chart: boolean; overlay: boolean; frames: number }[]; chartBatch: number; inkBatch: number; chartAlone: boolean; framesBetween: number; hash: string; status: string }>(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
      const svg=document.querySelector("#map svg:not(.voyage-overlay)");
      const t=document.querySelector("#map .voyage-overlay .voyage-track");
      const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
      return{turned:window.__turned,style:svg?svg.getAttribute("data-vellum-style"):null,
        vertices:t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        batches:b,chartBatch:c,inkBatch:i,chartAlone:c>=0&&!b[c].overlay,
        framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
        hash:location.hash,status:document.getElementById("status").textContent};
    })()`);
  check(
    "SV10 the style turn engages with the track armed and the track survives on the new dress (#153)",
    sv10.turned === true && sv10.style === "ink" && sv10.vertices > 10 && sv10.overlays === 1 &&
      /(^|&)survey(&|$)/.test(sv10.hash.slice(1)) && sv10.status === "",
    JSON.stringify({ ...sv10, batches: undefined }),
  );
  // framesBetween alone reds on an inline turn re-arm (measured on the reverted call site): the commit and the arm are microtasks of the SAME task, so the batch always splits.
  check(
    "SV2l the turn's landing pays its arm after the new dress paints, not with it (#366)",
    sv10.chartAlone && sv10.inkBatch > sv10.chartBatch && sv10.framesBetween >= 1 &&
      sv10.batches.length === 2,
    JSON.stringify({ batches: sv10.batches, chartBatch: sv10.chartBatch, inkBatch: sv10.inkBatch,
      chartAlone: sv10.chartAlone, framesBetween: sv10.framesBetween }),
  );
}

export async function sv2nReducedSwap({ evaluate, send, check, shoot, waitSettled, armTurnWatch, goto, waitInked }: SurveyKit): Promise<void> {
  await shoot("explorer-survey-turned-ink.png");

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await goto("#seed=42&style=antique&survey", "survey-reduce-base");
  await waitInked("survey-reduce-base-ink");
  await armTurnWatch();
  await evaluate(`(()=>{window.__land={batches:[],frames:0,raf:0};
      const bump=()=>{window.__land.frames++;window.__land.raf=requestAnimationFrame(bump);};bump();
      window.__mo=new MutationObserver((recs)=>{let chart=false,overlay=false;
        for(const r of recs)for(const n of r.addedNodes){if(n.nodeType!==1)continue;
          if(n.classList&&n.classList.contains("voyage-overlay"))overlay=true;
          else if(String(n.tagName).toLowerCase()==="svg")chart=true;}
        if(chart||overlay)window.__land.batches.push({chart,overlay,frames:window.__land.frames});});
      window.__mo.observe(document.getElementById("map"),{childList:true});return true;})()`);
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitSettled("survey-reduce-settle");
  await waitInked("survey-reduce-rearm");
  const sv2n = await evaluate<{ reduce: boolean; turned: boolean; style: string | null; chartAlone: boolean; inkAfter: boolean; framesBetween: number; anims: number; overlays: number; status: string }>(`(()=>{window.__mo.disconnect();cancelAnimationFrame(window.__land.raf);
      const b=window.__land.batches;const c=b.findIndex((x)=>x.chart);const i=b.findIndex((x)=>x.overlay);
      const ov=document.querySelector("#map .voyage-overlay");
      const svg=document.querySelector("#map svg:not(.voyage-overlay)");
      return{reduce:matchMedia("(prefers-reduced-motion: reduce)").matches,turned:window.__turned,
        style:svg?svg.getAttribute("data-vellum-style"):null,
        chartAlone:c>=0&&!b[c].overlay,inkAfter:i>c,framesBetween:c>=0&&i>=0?b[i].frames-b[c].frames:-1,
        anims:ov&&ov.getAnimations?ov.getAnimations({subtree:true}).length:-1,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        status:document.getElementById("status").textContent};})()`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  check(
    "SV2n under reduced motion the style change swaps instead of turning, defers its arm the same way, and starts no animation (#366)",
    sv2n.reduce === true && sv2n.turned === false && sv2n.style === "ink" &&
      sv2n.chartAlone && sv2n.inkAfter && sv2n.framesBetween >= 1 &&
      sv2n.anims === 0 && sv2n.overlays === 1 && sv2n.status === "",
    JSON.stringify(sv2n),
  );
}
