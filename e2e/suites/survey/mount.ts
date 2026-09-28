import type { SurveyKit } from "./kit.ts";

export async function sv2gSecondArm({ evaluate, check, goto, waitInked, waitBeat, setBox }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-double-arm-base");
  await setBox(true);
  const firstArm = await waitInked("survey-double-arm-first");
  const before = await evaluate<number>(`(()=>{const m=document.getElementById("map");
      const d=document.createElementNS("http://www.w3.org/2000/svg","svg");
      d.setAttribute("class","voyage-overlay");d.setAttribute("aria-hidden","true");
      m.appendChild(d);
      const all=m.querySelectorAll(".voyage-overlay");
      all.forEach((o)=>o.setAttribute("data-before-arm","1"));
      return all.length;})()`);
  await evaluate(`(()=>{const c=document.getElementById("ages");window.__beat=false;
      c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
      requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-double-arm-beat");
  const sv2g = await evaluate<{ overlays: number; tracks: number; stale: number; checked: boolean; hash: string; status: string; vertices: number }>(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
      tracks:document.querySelectorAll("#map .voyage-overlay .voyage-track").length,
      stale:document.querySelectorAll("#map .voyage-overlay[data-before-arm]").length,
      checked:document.getElementById("ages").checked,hash:location.hash,
      status:document.getElementById("status").textContent,
      vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
        return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()})`);
  check(
    "SV2g a second arm into a mount holding two overlays leaves exactly ONE, and it is the new build's (#364)",
    before === 2 && sv2g.overlays === 1 && sv2g.tracks === 1 && sv2g.stale === 0 && sv2g.checked &&
      sv2g.vertices === firstArm && /(^|&)survey(&|$)/.test(sv2g.hash.slice(1)) && sv2g.status === "",
    JSON.stringify({ before, firstArm, ...sv2g }),
  );
}

export async function sv2hPluralExit({ evaluate, check, goto, waitInked, setBox }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-plural-exit-base");
  await setBox(true);
  await waitInked("survey-plural-exit-arm");
  await evaluate(`(()=>{const m=document.getElementById("map");
      const d=document.createElementNS("http://www.w3.org/2000/svg","svg");
      d.setAttribute("class","voyage-overlay");d.setAttribute("aria-hidden","true");
      m.appendChild(d);})()`);
  const planted = await evaluate<number>(`document.querySelectorAll("#map .voyage-overlay").length`);
  await evaluate(`(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  const sv2h = await evaluate<{ overlays: number; hash: string; status: string }>(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent})`);
  check(
    "SV2h unticking a sheet that holds two overlays clears EVERY one, not just the first (#364)",
    planted === 2 && sv2h.overlays === 0 && !/survey/.test(sv2h.hash) && sv2h.status === "",
    JSON.stringify({ planted, ...sv2h }),
  );
}

export async function sv2iBuildsOnce({ evaluate, check, waitSettled, goto, waitInked, waitBeat }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-settle-owns-arm-base");
  await evaluate(`(()=>{
      window.__armSeq=0;
      window.__armObs=new MutationObserver((recs)=>{for(const r of recs)for(const n of r.addedNodes){
        if(n.nodeType===1&&n.getAttribute&&(n.getAttribute("class")||"").split(/\\s+/).indexOf("voyage-overlay")>=0)
          n.setAttribute("data-arm-seq",String(window.__armSeq++));}});
      window.__armObs.observe(document.getElementById("map"),{childList:true});
      document.getElementById("draw").click();
      const c=document.getElementById("ages");c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));
      const end=performance.now()+1500;while(performance.now()<end);
    })()`);
  await waitSettled("survey-settle-owns-arm-settle");
  await waitInked("survey-settle-owns-arm-ink");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-settle-owns-arm-beat");
  const sv2i = await evaluate<{ builds: number; seq: string | null; overlays: number; checked: boolean; hash: string; status: string; vertices: number }>(`(()=>{const ov=document.querySelector("#map .voyage-overlay");
      const r={builds:window.__armSeq,seq:ov?ov.getAttribute("data-arm-seq"):null,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        checked:document.getElementById("ages").checked,hash:location.hash,
        status:document.getElementById("status").textContent,
        vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
          return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()};
      window.__armObs.disconnect();return r;})()`);
  check(
    "SV2i a tick during an in-flight draw builds ONCE: the track on the sheet is the settle's own arm (#300)",
    sv2i.builds === 1 && sv2i.seq === "0" && sv2i.overlays === 1 && sv2i.checked && sv2i.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2i.hash.slice(1)) && sv2i.status === "",
    JSON.stringify(sv2i),
  );
}

export async function sv2jTurnLanding({ evaluate, check, waitTurned, armTurnWatch, goto, waitInked, waitBeat, setBox }: SurveyKit): Promise<void> {
  // sheet-turn's finish(true) writes the swap and THEN resolves, so a tick dispatched from a MutationObserver lands in the gap before the landing; a wall-clock sleep cannot hit it.
  await goto("#seed=42&style=antique", "survey-turn-owns-arm-base");
  await setBox(true);
  await waitInked("survey-turn-owns-arm-first");
  await evaluate(`(()=>{
      window.__armSeq=0;window.__tickedAtLanding=false;
      const m=document.getElementById("map");
      window.__armObs=new MutationObserver((recs)=>{for(const r of recs)for(const n of r.addedNodes){
        if(n.nodeType===1&&n.getAttribute&&(n.getAttribute("class")||"").split(/\\s+/).indexOf("voyage-overlay")>=0)
          n.setAttribute("data-arm-seq",String(window.__armSeq++));}});
      window.__armObs.observe(m,{childList:true});
      window.__landObs=new MutationObserver((recs)=>{
        if(window.__tickedAtLanding)return;
        let swapped=false;
        for(const r of recs)for(const n of r.addedNodes){
          if(n.nodeType===1&&n.tagName&&n.tagName.toLowerCase()==="svg"&&
             (n.getAttribute("class")||"").indexOf("voyage-overlay")<0) swapped=true;}
        if(!swapped)return;
        window.__tickedAtLanding=true;
        const c=document.getElementById("ages");
        c.checked=true;c.dispatchEvent(new Event("change",{bubbles:true}));});
      window.__landObs.observe(m,{childList:true});
    })()`);
  await armTurnWatch();
  await evaluate(`(()=>{const s=document.getElementById("style");s.value="ink";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("survey-turn-owns-arm-turn");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-turn-owns-arm-beat");
  const sv2j = await evaluate<{ builds: number; seq: string | null; ticked: boolean; turned: boolean; overlays: number; style: string | null; checked: boolean; hash: string; status: string; vertices: number }>(`(()=>{const ov=document.querySelector("#map .voyage-overlay");
      const chart=document.querySelector("#map svg:not(.voyage-overlay)");
      const r={builds:window.__armSeq,seq:ov?ov.getAttribute("data-arm-seq"):null,
        ticked:window.__tickedAtLanding,turned:window.__turned,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        style:chart?chart.getAttribute("data-vellum-style"):null,
        checked:document.getElementById("ages").checked,hash:location.hash,
        status:document.getElementById("status").textContent,
        vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
          return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()};
      window.__armObs.disconnect();window.__landObs.disconnect();return r;})()`);
  check(
    "SV2j a tick inside the TURN's landing builds ONCE: the landing's own arm is the track that stays (#300)",
    sv2j.turned === true && sv2j.ticked === true && sv2j.builds === 1 && sv2j.seq === "0" &&
      sv2j.overlays === 1 && sv2j.style === "ink" && sv2j.checked && sv2j.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2j.hash.slice(1)) && sv2j.status === "",
    JSON.stringify(sv2j),
  );
}
