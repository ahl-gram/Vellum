import { makeStage } from "../home-support.ts";
import type { SuiteContext } from "../types.ts";
import type { Seat } from "./reads.ts";

export type HomeKit = ReturnType<typeof homeKit>;

export function homeKit(ctx: SuiteContext) {
  const { evaluate } = ctx;
  const { pressKey, clickAt, settleHome } = makeStage(ctx);
  const camSeat = () => evaluate<Seat | null>(`(() => { const c = document.getElementById("lf-controls"); const s = document.getElementById("lf-stage"); if (!c || !s || !c.classList.contains("on")) return null; const r = c.getBoundingClientRect(), sr = s.getBoundingClientRect(); const cs = getComputedStyle(c); return { pos: cs.position, z: cs.zIndex, right: sr.right - r.right, bottom: sr.bottom - r.bottom, pe: cs.pointerEvents, anim: cs.animationName, top: r.top, vw: innerWidth }; })()`);
  return { ...ctx, pressKey, clickAt, settleHome, camSeat };
}
