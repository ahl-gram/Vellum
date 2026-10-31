// The open Broadside against the Drawer tab (Issue #930): the slip and its painted ring stand clear of the tab at the two desk windows, and the chart and the Glass keep clear of it in turn.
import { makeSettle, makeStable } from "../../support/settle.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

type Box = { l: number; r: number; t: number; b: number };
type Tab = {
  w: number;
  h: number;
  fonts: string;
  moving: boolean;
  ring: Box | null;
  tab: Box | null;
  sheet: Box | null;
  glass: Box | null;
};

const RING = 9;
const TAB_ROOM: Payload<Tab> = `(()=>{const box=(sel,grow)=>{const el=document.querySelector(sel);if(!el)return null;const b=el.getBoundingClientRect();
    return{l:Math.round((b.left-grow)*10)/10,r:Math.round((b.right+grow)*10)/10,t:Math.round((b.top-grow)*10)/10,b:Math.round((b.bottom+grow)*10)/10};};
  const moving=["#broadside",".corner.br",".legend"].some((sel)=>{const el=document.querySelector(sel);return !!el&&el.getAnimations().some((a)=>a.playState==="running");});
  return{w:innerWidth,h:innerHeight,fonts:document.fonts.status,moving,ring:box("#broadside",${RING}),tab:box("#chart-drawer-tab",0),sheet:box("#sheet",0),glass:box(".corner.br",0)};})()`;

const overlap = (a: Box, b: Box): { w: number; h: number } => ({
  w: Math.min(a.r, b.r) - Math.max(a.l, b.l),
  h: Math.min(a.b, b.b) - Math.max(a.t, b.t),
});
const clear = (a: Box, b: Box): boolean => {
  const o = overlap(a, b);
  return o.w <= 0 || o.h <= 0;
};

function readsClear(m: Tab): boolean {
  if (!m.ring || !m.tab || !m.sheet || !m.glass) return false;
  return clear(m.ring, m.tab) && m.sheet.r <= m.glass.l - 8 && m.glass.r <= m.ring.l;
}

export async function br15TabClear({ goto, send, evaluate, sleep, check, EXP }: BroadsideKit): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const reads: Record<string, Tab> = {};
  try {
    for (const h of [900, 768]) {
      await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: h, deviceScaleFactor: 1, mobile: false });
      await goto(EXP + "#seed=1&style=antique&type=archipelago&islands=20", `broadside-tab-${h}`);
      reads[h] = await stable(TAB_ROOM, `BR15 the room at 1024x${h}`, {
        departed: (d) => d.w === 1024 && d.h === h && d.fonts === "loaded" && !d.moving && d.sheet !== null,
      });
    }
  } finally {
    await send("Emulation.clearDeviceMetricsOverride");
  }
  check(
    "BR15 the open Broadside clears the Drawer tab at 1024 by 900 and 1024 by 768, the chart stands clear of the Glass, and the Glass clear of the slip's ring, where the slip now stands",
    readsClear(reads[900]!) && readsClear(reads[768]!),
    JSON.stringify(reads),
  );
}
