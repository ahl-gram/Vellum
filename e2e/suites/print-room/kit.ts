import type { SuiteContext } from "../../types.ts";
import { ATLAS_FIT } from "./reads.ts";

export type PrintRoomKit = ReturnType<typeof printRoomKit>;

export function printRoomKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  async function orderPng(format: string, plate: string) {
    await evaluate(`(()=>{window.__vellumLastPng=undefined;document.getElementById("pr-format").value="${format}";document.querySelector('[data-poster="${plate}"]').click();})()`);
    let png = null;
    for (let i = 0; i < 300; i++) {
      let s = null;
      try { s = await evaluate<{ type: string; size: number; width: number; height: number; scale: number; clamped: boolean; filename: string; status: string } | null>(`(()=>{const p=window.__vellumLastPng;return p?{type:p.type,size:p.size,width:p.width,height:p.height,scale:p.scale,clamped:p.clamped,filename:p.filename,status:document.getElementById("pr-poster-status").textContent}:null;})()`); } catch {}
      if (s) { png = s; break; }
      await sleep(50);
    }
    return png;
  }
  const atlasFitAt = async (want: number) => {
    let read = null;
    for (let i = 0; i < 40; i++) {
      read = await evaluate(ATLAS_FIT);
      if (read && read.clientW === want) return read; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
      await sleep(50);
    }
    return read;
  };
  return { ...ctx, orderPng, atlasFitAt };
}
