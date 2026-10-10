import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { ATLAS_FIT } from "./reads.ts";

export type PrintRoomKit = ReturnType<typeof printRoomKit>;

export function printRoomKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  async function orderPng(format: string, plate: string) {
    await evaluate(
      `(()=>{window.__vellumLastPng=undefined;document.getElementById("pr-format").value="${format}";document.querySelector('[data-poster="${plate}"]').click();})()`,
    );
    let png = null;
    for (let i = 0; i < 300; i++) {
      let s = null;
      try {
        s = await evaluate<{
          type: string;
          size: number;
          width: number;
          height: number;
          scale: number;
          clamped: boolean;
          filename: string;
          status: string;
        } | null>(
          `(()=>{const p=window.__vellumLastPng;return p?{type:p.type,size:p.size,width:p.width,height:p.height,scale:p.scale,clamped:p.clamped,filename:p.filename,status:document.getElementById("pr-poster-status").textContent}:null;})()`,
        );
      } catch {}
      if (s) {
        png = s;
        break;
      }
      await sleep(50);
    }
    return png;
  }
  const atlasFitAt = async (want: number) => {
    let read = null;
    for (let i = 0; i < 40; i++) {
      read = await evaluate(ATLAS_FIT);
      if (read.clientW === want) return read;
      await sleep(50);
    }
    return read;
  };
  return { ...ctx, orderPng, atlasFitAt };
}

// A real press and release where a hand would put it, shared by every room whose check drives the Glass or a press.
export async function pressAt({ send }: Pick<SuiteContext, "send">, x: number, y: number): Promise<void> {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
}

// The override's clear lands with the next resize, not on return (measured 2026-10-10: the overridden size still reads straight after it), so the window is waited back from it.
export async function clearMetrics(
  { evaluate, send, sleep }: Pick<SuiteContext, "evaluate" | "send" | "sleep">,
  w: number,
  h: number,
): Promise<void> {
  await send("Emulation.clearDeviceMetricsOverride");
  const size: Payload<number[]> = `[innerWidth, innerHeight]`;
  await makeSettle({ evaluate, sleep })(size, (d) => d[0] !== w || d[1] !== h, "print-room-metrics-cleared");
}
