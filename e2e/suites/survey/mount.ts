import type { SurveyKit } from "./kit.ts";

export async function sv2hPluralExit({ evaluate, check, goto, waitInked, setBox }: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-plural-exit-base");
  await setBox(true);
  await waitInked("survey-plural-exit-arm");
  await evaluate(`(()=>{const m=document.getElementById("map");
      const d=document.createElementNS("http://www.w3.org/2000/svg","svg");
      d.setAttribute("class","voyage-overlay");d.setAttribute("aria-hidden","true");
      m.appendChild(d);})()`);
  const planted = await evaluate<number>(`document.querySelectorAll("#map .voyage-overlay").length`);
  await evaluate(
    `(()=>{const c=document.getElementById("ages");c.checked=false;c.dispatchEvent(new Event("change",{bubbles:true}));})()`,
  );
  const sv2h = await evaluate<{
    overlays: number;
    hash: string;
    status: string;
  }>(`({overlays:document.querySelectorAll("#map .voyage-overlay").length,
      hash:location.hash,status:document.getElementById("status").textContent})`);
  check(
    "SV2h unticking a sheet that holds two overlays clears EVERY one, not just the first (#364)",
    planted === 2 && sv2h.overlays === 0 && !/survey/.test(sv2h.hash) && sv2h.status === "",
    JSON.stringify({ planted, ...sv2h }),
  );
}

async function sv2iArm({ evaluate }: Pick<SurveyKit, "evaluate">): Promise<void> {
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
}

export async function sv2iBuildsOnce({
  evaluate,
  check,
  waitSettled,
  goto,
  waitInked,
  waitBeat,
}: SurveyKit): Promise<void> {
  await goto("#seed=42&style=antique", "survey-settle-owns-arm-base");
  await sv2iArm({ evaluate });
  await waitSettled("survey-settle-owns-arm-settle");
  await waitInked("survey-settle-owns-arm-ink");
  await evaluate(`(()=>{window.__beat=false;requestAnimationFrame(()=>setTimeout(()=>{window.__beat=true;},0));})()`);
  await waitBeat("survey-settle-owns-arm-beat");
  const sv2i = await evaluate<{
    builds: number;
    seq: string | null;
    overlays: number;
    checked: boolean;
    hash: string;
    status: string;
    vertices: number;
  }>(`(()=>{const ov=document.querySelector("#map .voyage-overlay");
      const r={builds:window.__armSeq,seq:ov?ov.getAttribute("data-arm-seq"):null,
        overlays:document.querySelectorAll("#map .voyage-overlay").length,
        checked:document.getElementById("ages").checked,hash:location.hash,
        status:document.getElementById("status").textContent,
        vertices:(()=>{const t=document.querySelector("#map .voyage-overlay .voyage-track");
          return t?(t.getAttribute("points")||"").trim().split(/\\s+/).length:0;})()};
      window.__armObs.disconnect();return r;})()`);
  check(
    "SV2i a tick during an in-flight draw builds ONCE: the track on the sheet is the settle's own arm (#300)",
    sv2i.builds === 1 &&
      sv2i.seq === "0" &&
      sv2i.overlays === 1 &&
      sv2i.checked &&
      sv2i.vertices > 10 &&
      /(^|&)survey(&|$)/.test(sv2i.hash.slice(1)) &&
      sv2i.status === "",
    JSON.stringify(sv2i),
  );
}
