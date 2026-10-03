import type { SuiteContext } from "../../types.ts";
import type { Cam } from "./reads.ts";

export async function z9Keyboard({ evaluate, check }: SuiteContext): Promise<void> {
  const z9 = await evaluate<{ afterIn: number; afterOut: number; beforePanX: number; afterPanX: number; home: Cam }>(`(async()=>{
    const vp=document.getElementById("map-viewport");
    window.__vellumZoomTo({k:1,x:0,y:0});
    vp.focus();
    const key=(k)=>vp.dispatchEvent(new KeyboardEvent("keydown",{key:k,bubbles:true}));
    const st=()=>window.__vellumZoomState();
    const settleK=async(t)=>{for(let i=0;i<100;i++){if(Math.abs(st().k-t)<1e-6)return st().k;await new Promise(r=>setTimeout(r,40));}return st().k;};
    key("+"); key("+"); const afterIn=await settleK(1.96);
    key("-"); const afterOut=await settleK(1.4);
    const beforePanX=st().x;
    key("ArrowRight"); const afterPanX=st().x;
    key("0");
    for(let i=0;i<100;i++){const s=st();if(s.k===1&&s.x===0&&s.y===0)break;await new Promise(r=>setTimeout(r,40));}
    const home=st();
    return {afterIn,afterOut,beforePanX,afterPanX,home};
  })()`, true);
  check(
    "Z9 keyboard-only reaches full zoom: +/- magnify (glide waited out, #170), arrows pan instantly, 0 homes (AC2 a11y)",
    Math.abs(z9.afterIn - 1.96) < 1e-6 && Math.abs(z9.afterOut - 1.4) < 1e-6 &&
      z9.afterPanX < z9.beforePanX && z9.home.k === 1 && z9.home.x === 0 && z9.home.y === 0,
    JSON.stringify(z9),
  );
}

export async function z10Buttons({ evaluate, check }: SuiteContext): Promise<void> {
  const z10 = await evaluate<{ inK: number; in2: number; outK: number; home: Cam }>(`(async()=>{
    const st=()=>window.__vellumZoomState();
    const settleK=async(t)=>{for(let i=0;i<100;i++){if(Math.abs(st().k-t)<1e-6)return st().k;await new Promise(r=>setTimeout(r,40));}return st().k;};
    window.__vellumZoomTo({k:1,x:0,y:0});
    document.getElementById("zoom-in").click(); const inK=await settleK(1.4);
    document.getElementById("zoom-in").click(); const in2=await settleK(1.96);
    document.getElementById("zoom-out").click(); const outK=await settleK(1.4);
    document.getElementById("zoom-reset").click();
    for(let i=0;i<100;i++){const s=st();if(s.k===1&&s.x===0&&s.y===0)break;await new Promise(r=>setTimeout(r,40));}
    const home=st();
    return {inK,in2,outK,home};
  })()`, true);
  check(
    "Z10 the on-screen +/reset/- buttons drive the zoom (voiced + gliding, settled values asserted, #170)",
    Math.abs(z10.inK - 1.4) < 1e-6 && Math.abs(z10.in2 - 1.96) < 1e-6 &&
      Math.abs(z10.outK - 1.4) < 1e-6 && z10.home.k === 1,
    JSON.stringify(z10),
  );
}

export async function z10bNoDblclickLeak({ evaluate, check, sleep }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});document.getElementById("zoom-in").dispatchEvent(new MouseEvent("dblclick",{bubbles:true,cancelable:true,view:window}));})()`);
  await sleep(350); // let any leaked d3 dblclick-zoom animation finish
  const z10b = await evaluate<Cam>(`window.__vellumZoomState()`);
  check(
    "Z10b a double-click on a zoom button does not leak into d3's dblclick-zoom (no lurch/pan)",
    z10b.k === 1 && z10b.x === 0 && z10b.y === 0,
    JSON.stringify(z10b),
  );
}

export async function z11Styles({ evaluate, check, shoot, waitTurned }: SuiteContext): Promise<void> {
  for (const style of ["topographic", "ink", "nautical"]) {
    await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});const s=document.getElementById("style");s.value=${JSON.stringify(style)};s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    await waitTurned("zoom-style-" + style);
    const zs = await evaluate<{ matrix: string; zoomed: boolean; touch: string; hits: number }>(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:3,x:-W,y:-H});const m=document.getElementById("map");return{matrix:getComputedStyle(m).transform,zoomed:vp.classList.contains("zoomed"),touch:getComputedStyle(vp).touchAction,hits:document.querySelectorAll("#map .place-hit").length};})()`);
    check(
      "Z11 " + style + " pans/zooms identically (AC1: matrix lands, .zoomed, touch-action:none, marks present)",
      zs.matrix.startsWith("matrix(3, 0, 0, 3,") && zs.zoomed === true && zs.touch === "none" && zs.hits > 0,
      style + " " + JSON.stringify(zs),
    );
    if (style === "topographic") await shoot("explorer-zoom-topographic-k3.png");
  }
}

export async function z12HashWrite({ evaluate, check, sleep, waitTurned }: SuiteContext): Promise<void> {
  await evaluate(`(()=>{window.__vellumZoomTo({k:1,x:0,y:0});const s=document.getElementById("style");s.value="antique";s.dispatchEvent(new Event("change",{bubbles:true}));})()`);
  await waitTurned("zoom-styles-restore-antique");

  await evaluate(`(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:2,x:-0.2*W,y:-0.3*H});})()`);
  // Poll the 250ms settle debounce: the assertion below is strict string equality, and a deferred timer under Issue #381's second lane can land after any fixed wait.
  const readZ12 = () => evaluate<{ cx: string | null; cy: string | null; k: string | null }>(`(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k")};})()`);
  let z12 = await readZ12();
  for (let i = 0; i < 60 && z12.k !== "2.0000"; i++) {
    await sleep(50);
    z12 = await readZ12();
  }
  check(
    "Z12 a settled zoom writes cx/cy/k to the hash (AC3 write: uv centre + zoom, 4dp)",
    z12.cx === "0.3500" && z12.cy === "0.4000" && z12.k === "2.0000",
    JSON.stringify(z12),
  );
}
