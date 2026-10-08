import type { SuiteContext } from "../../types.ts";
import type { Ring } from "./reads.ts";

export type ZoomKit = ReturnType<typeof zoomKit>;

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
    await sleep(40);
  };
  const enterAt = (k: number, cu: number, cv: number) =>
    evaluate<undefined>(
      `(()=>{const vp=document.getElementById("map-viewport");const W=vp.clientWidth,H=vp.clientHeight;window.__vellumZoomTo({k:${k},x:W/2-(${cu})*${k}*W,y:H/2-(${cv})*${k}*H});})()`,
    );
  const waitRedraft = async (prev: number) => {
    // 15s, not the old 4s: Issue #400 made a cold band-3 draw cost 1084ms measured locally and a CI runner is several times slower, so 4s returned BEFORE the redraft landed and every band downstream read one step off; long enough for the draw, short enough that a real hang still fails rather than hanging the lane.
    for (let i = 0; i < 375; i++) {
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
  return { ...ctx, waitInked, readRing, rgn, goHome, enterAt, waitRedraft, captionMs, insetView };
}
