import { makeRoom } from "../../support/room.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { Lens } from "../print-room/print.ts";
import { bareRead, type Bare } from "./reads.ts";

// The frame's chart is this room's transform target; an empty gesture box reads as a camera at rest, so a row that empties it fails the camera's reads rather than stopping them.
export const RR_LENS: Payload<Lens> = `(() => { const e = document.querySelector("#map-viewport > .rf-chart"); if (!e) return { k: 1, t: "absent", zoomed: false };
  const t = getComputedStyle(e).transform, m = /^matrix\\(([^,]+),/.exec(t);
  return { k: m ? Number(m[1]) : 1, t, zoomed: document.getElementById("map-viewport").classList.contains("zoomed") }; })()`;

// Wiring, not a claim: the bar is driven by its input event, to an edge or back to a value read off it.
export const BAR: Payload<string> = `document.querySelector(".rf-range").value`;
export const scrubTo = (to: string): string =>
  `(() => { const r = document.querySelector(".rf-range"); r.value = ${to === "min" || to === "max" ? `r.${to}` : JSON.stringify(to)}; r.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`;

export type ReadingRoomKit = ReturnType<typeof readingRoomKit>;

function readingRoomPlateShown({ evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">) {
  const plateShown = async (hrefTail?: string) => {
    for (let i = 0; i < 160; i++) {
      let b: Bare | null = null;
      try {
        b = await evaluate(bareRead);
      } catch {}
      const s = b && b.stage;
      if (
        b &&
        s &&
        s.hidden === false &&
        s.src &&
        s.src.startsWith("blob:") &&
        (!hrefTail || (s.href || "").endsWith(hrefTail))
      )
        return { ...s, asked: b.plate };
      await sleep(50);
    }
    return null;
  };
  return { plateShown };
}

export function readingRoomKit(ctx: SuiteContext) {
  const { evaluate, sleep } = ctx;
  const { boot, settled } = makeRoom(ctx);
  const { plateShown } = readingRoomPlateShown({ evaluate, sleep });
  // A hidden stage keeps its last plate's revoked blob src (measured 2026-11-09, Issue #1285), so whether a plate is up is read from `hidden` alone.
  const plateBare = async (): Promise<Bare | { missing: true } | null> => {
    const b = await evaluate(bareRead);
    if (b.stage === null) return { missing: true };
    return b.stage.hidden === true && b.plate === null ? null : b;
  };
  return { ...ctx, boot, settled, plateShown, plateBare };
}
