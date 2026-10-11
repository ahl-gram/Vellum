import type { Payload, SuiteContext } from "../../types.ts";
import type { Lens } from "../print-room/print.ts";
import { stageRead } from "./reads.ts";

// The frame's chart is this room's transform target; an empty gesture box reads as a camera at rest, so a row that empties it fails the camera's reads rather than stopping them.
export const RR_LENS: Payload<Lens> = `(() => { const e = document.querySelector("#map-viewport > .rf-chart"); if (!e) return { k: 1, t: "absent", zoomed: false };
  const t = getComputedStyle(e).transform, m = /^matrix\\(([^,]+),/.exec(t);
  return { k: m ? Number(m[1]) : 1, t, zoomed: document.getElementById("map-viewport").classList.contains("zoomed") }; })()`;

// Wiring, not a claim: the bar is driven by its input event, to an edge or back to a value read off it.
export const BAR: Payload<string> = `document.querySelector(".rf-range").value`;
export const scrubTo = (to: string): string =>
  `(() => { const r = document.querySelector(".rf-range"); r.value = ${to === "min" || to === "max" ? `r.${to}` : JSON.stringify(to)}; r.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;

export type ReadingRoomKit = ReturnType<typeof readingRoomKit>;

export function readingRoomKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  const boot = async () => {
    for (let i = 0; i < 200; i++) {
      let ok = null;
      try {
        ok = await evaluate<boolean>(`typeof window.__vellumReadingRoomUsesWorker === "function"`);
      } catch {}
      if (ok) return true;
      await sleep(75);
    }
    return false;
  };
  // The shared waitSettled keys on the Explorer's #verso-turn, which this page does not have, so the suite carries its own settle poll like the Print Room does.
  const settled = async () => {
    for (let i = 0; i < 300; i++) {
      let s = null;
      try {
        s = await evaluate<{ svg: boolean; status: string | undefined }>(
          `({svg:!!document.querySelector(".rf-chart svg"),status:(document.querySelector(".rf-status")||{}).textContent})`,
        );
      } catch {}
      if (s && s.svg && s.status === "") return true;
      await sleep(50);
    }
    return false;
  };
  const plateShown = async (hrefTail?: string) => {
    for (let i = 0; i < 160; i++) {
      let s = null;
      try {
        s = await evaluate(stageRead);
      } catch {}
      if (
        s &&
        s.hidden === false &&
        s.src &&
        s.src.startsWith("blob:") &&
        (!hrefTail || (s.href || "").endsWith(hrefTail))
      )
        return s;
      await sleep(50);
    }
    return null;
  };
  // The NEGATIVE half of the arrival rule (Issue #442) needs its own dwell: this holds for the window plateShown polls and fails on the first frame a plate is shown. A missing .rr-prospect is a failure, not quiet success: stageRead yields null for an absent element, and a negative check that read null as "stayed hidden" would pass with the stage deleted outright.
  const plateStaysHidden = async (ms = 2500) => {
    let saw = 0;
    for (let i = 0; i < ms / 50; i++) {
      let s = null;
      try {
        s = await evaluate(stageRead);
      } catch {}
      if (s === null) return { missing: true, sampled: saw };
      saw++;
      if (s.hidden === false || (s.src || "").startsWith("blob:")) return s;
      await sleep(50);
    }
    return null;
  };
  return { ...ctx, boot, settled, plateShown, plateStaysHidden };
}
