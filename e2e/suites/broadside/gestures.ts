// The Explorer's leaned camera stands down on paper (Issue #779 part 2h).
import { LENS, homeCamera, lensRest } from "../print-room/print.ts";
import type { Payload } from "../../types.ts";
import type { BroadsideKit } from "./kit.ts";

type Centre = { x: number; y: number; inside: boolean } | null;
const CENTRE: Payload<Centre> = `(() => { const vp = document.getElementById("map-viewport"); if (!vp) return null;
  const r = vp.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, e = document.elementFromPoint(x, y);
  return { x, y, inside: !!e && vp.contains(e) }; })()`;

export async function br14Paper({ evaluate, send, check, sleep, wheel }: BroadsideKit): Promise<void> {
  await evaluate(`window.__vellumSetRedraftEnabled(false)`);
  await send("Emulation.setEmulatedMedia", { features: [] });
  try {
    const c = await evaluate(CENTRE);
    if (c) await wheel(c.x, c.y, -480);
    const screen = await lensRest({ evaluate, sleep }, "leaned", "explorer-leaned");
    await send("Emulation.setEmulatedMedia", { media: "print" });
    const paper = await evaluate(LENS);
    check(
      "BR14 a leaned camera still prints the chart unzoomed: a real wheel leans the Glass on the chart, and on paper the transform target stands untransformed",
      !!c && c.inside && screen.zoomed && screen.k > 1 && paper.t === "none",
      JSON.stringify({ c, screen, paper }),
    );
  } finally {
    await send("Emulation.setEmulatedMedia", { media: "" });
    await homeCamera({ evaluate, send, sleep, wheel });
    await evaluate(`window.__vellumSetRedraftEnabled(true)`);
  }
}
