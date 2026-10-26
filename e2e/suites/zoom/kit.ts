import type { SuiteContext } from "../../types.ts";
import type { Ring } from "./reads.ts";

export type ZoomKit = ReturnType<typeof zoomKit>;

function zoomInsetView({ evaluate }: Pick<SuiteContext, "evaluate">) {
  const insetView = () =>
    evaluate<{
      worldMounted: boolean;
      insets: number;
      stamped: boolean;
      insetLeft: number;
      insetW: number;
      hits: number;
      zx: number;
      zy: number;
      zk: number;
      caption: string;
    }>(
      `(()=>{const world=document.querySelector("#map > svg");const inset=document.querySelector("#map .region-inset");` +
        `const isvg=inset?inset.querySelector("svg"):null;const z=window.__vellumZoomState();` +
        `return{worldMounted:!!world&&!world.hasAttribute("data-vellum-region-u0"),insets:document.querySelectorAll("#map .region-inset").length,` +
        `stamped:!!isvg&&isvg.hasAttribute("data-vellum-region-u0"),insetLeft:inset?parseFloat(inset.style.left):-1,insetW:inset?parseFloat(inset.style.width):-1,` +
        `hits:document.querySelectorAll("#map .place-hit").length,zx:z.x,zy:z.y,zk:z.k,caption:document.getElementById("caption").textContent||""};})()`,
    );
  return { insetView };
}

// 2026-10-23, Issue #954: 375 polls of 40 ms, 15 s; the slowest redraft a suite waits on, band 5's cold first descent, drew in 1775 ms locally (seed 42's capital, three loads within 15 ms), times CI's 3.3 (handbook/specs/settle-doctrine.md item 10) is 5.9 s, so 15 s keeps twice that.
export const REDRAFT_TRIES = 375;

export function zoomKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  // Fixed sleeps only outlasted the Issue #300 deferred ink because a CDP evaluate sent mid-build queues behind the blocked main thread; wait for the ink itself.
  const waitInked = async (label: string): Promise<void> => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate<boolean>(`!!document.querySelector("#map .voyage-overlay .voyage-track")`)) return;
      await sleep(50);
    }
    throw new Error("waitInked timeout " + label);
  };

  const readRing = () =>
    evaluate<Ring>(`(()=>{
    const h=document.querySelector("#map .place-hit:hover");
    if(!h)return{hover:false};
    const s=getComputedStyle(h,"::after");
    return{hover:true,t:s.transform,o:s.opacity};
  })()`);

  const rgn = () =>
    evaluate<{ band: number; redrafts: number; committed: boolean; title: string | null; window: unknown }>(
      `window.__vellumRegion()`,
    );
  const goHome = async () => {
    await evaluate(`document.getElementById("zoom-reset").click()`);
  };
  const enterAt = (k: number, cu: number, cv: number) =>
    evaluate<undefined>(
      `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-(${cu})*${k}*W,y:H/2-(${cv})*${k}*H});})()`,
    );
  const waitRedraft = async (prev: number) => {
    for (let i = 0; i < REDRAFT_TRIES; i++) {
      const s = await rgn();
      if (s.redrafts > prev) return s;
      await sleep(40);
    }
    return await rgn();
  };
  const captionMs = () =>
    evaluate<number>(
      `(()=>{const m=(document.getElementById("caption").textContent||"").match(/drawn in (\\d+)ms/);return m?+m[1]:-1;})()`,
    );
  const { insetView } = zoomInsetView({ evaluate });
  return { ...ctx, waitInked, readRing, rgn, goHome, enterAt, waitRedraft, captionMs, insetView };
}
