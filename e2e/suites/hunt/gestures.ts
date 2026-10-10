// What a press does on the Hunt (Issue #779 part 2g): the Glass bound to the gesture box answers a real press.
import type { Payload, SuiteContext } from "../../types.ts";
import { pressAt } from "../print-room/kit.ts";
import { lensRest } from "../print-room/print.ts";

type Bound = { vp: boolean; map: boolean; hooks: string[]; press: { x: number; y: number; hit: string | null } | null };
const BOUND: Payload<Bound> = `(() => { const b = document.getElementById("zoom-in"), r = b && b.getBoundingClientRect(), x = r ? r.left + r.width / 2 : 0, y = r ? r.top + r.height / 2 : 0, e = r && document.elementFromPoint(x, y);
  return { vp: document.getElementById("map-viewport").classList.contains("zoomable"), map: document.getElementById("map").classList.contains("zoomable"),
    hooks: [typeof window.__vellumZoomTo, typeof window.__vellumZoomState], press: r ? { x, y, hit: e && e.id } : null }; })()`;

export async function hg5Bound(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check } = ctx;
  const b = await evaluate(BOUND);
  try {
    if (b.press) await pressAt({ send }, b.press.x, b.press.y);
    const lens = await lensRest(ctx, "leaned", "hunt-leaned");
    const after = await evaluate<{ k: number | null; sheet: string }>(
      `({ k: window.__vellumZoomState ? window.__vellumZoomState().k : null, sheet: getComputedStyle(document.getElementById("sheet")).transform })`,
    );
    check(
      "HG5 the Hunt's camera is the shared controller bound to the gesture box: #map-viewport zoomable and #map not, the page's zoom hooks present, and a real press on the Glass's draw-nearer glides the transform target to 1.4 with the chart's sheet riding it untransformed (#167)",
      b.vp &&
        !b.map &&
        b.hooks.every((h) => h === "function") &&
        b.press?.hit === "zoom-in" &&
        lens.zoomed &&
        Math.abs(lens.k - 1.4) < 0.005 &&
        after.sheet === "none" &&
        after.k !== null &&
        Math.abs(after.k - 1.4) < 0.005,
      JSON.stringify({ b, lens, after }),
    );
  } finally {
    // Wiring, not the claim: the camera is put home before the guesses.
    await evaluate(
      `(() => { if (window.__vellumZoomTo) window.__vellumZoomTo({ k: 1, x: 0, y: 0 }); document.activeElement && document.activeElement.blur(); return true; })()`,
    );
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  }
}
