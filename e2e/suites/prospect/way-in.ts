// The Explorer card's road to the Ribbon beside its way in to the prospect (Issue #428): the wiring from the chart's own address and the road standing down where none leaves the place.
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import { ORPHAN } from "../ribbon/room.ts";

type Road = {
  name: string | null;
  prospect: string | null;
  ribbon: string | null;
  ribbonDisplay: string | null;
  prospectDisplay: string | null;
  ribbonWidth: number | null;
  prospectWidth: number | null;
} | null;

const ROAD: Payload<Road> = `(() => { const c = document.getElementById("place-card"); if (!c || c.hidden) return null; const p = c.querySelector(".pc-prospect"), r = c.querySelector(".pc-ribbon"); return { name: (c.querySelector(".pc-name") || {}).textContent, prospect: p ? p.getAttribute("href") : null, ribbon: r ? r.getAttribute("href") : null, ribbonDisplay: r ? getComputedStyle(r).display : null, prospectDisplay: p ? getComputedStyle(p).display : null, ribbonWidth: r ? r.getBoundingClientRect().width : null, prospectWidth: p ? p.getBoundingClientRect().width : null }; })()`;
const ESCAPE: Payload<void> = `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`;
// A press is wiring here, not a gesture, as PB1's own presses are.
const PRESS = (idx: number): Payload<void> => `document.querySelector('.place-hit[data-idx="${idx}"]').click()`;

export async function pb1cRoadOut({ evaluate, sleep, check }: SuiteContext): Promise<void> {
  const settle = makeSettle({ evaluate, sleep });
  await evaluate(ESCAPE);
  await evaluate(PRESS(2));
  const one = await settle(ROAD, (d) => /&i=2$/.test(d.prospect ?? ""), "PB1c the card at place 2");
  check(
    "PB1c the card's road to the Ribbon rides the chart's own address verbatim with this place as its departure, beside the way in to the prospect, on a nonzero place a road leaves (Issue #428)",
    !!one.ribbon &&
      one.ribbonDisplay !== "none" &&
      one.ribbonWidth! > 0 &&
      one.ribbon === "/ribbon/#" + one.prospect!.slice("/prospect/#".length).replace(/&i=2$/, "&a=2"),
    JSON.stringify(one),
  );
  await evaluate(ESCAPE);
  await evaluate(PRESS(ORPHAN));
  const orphan = await settle(
    ROAD,
    (d) => new RegExp(`&i=${ORPHAN}$`).test(d.prospect ?? ""),
    "PB1d the card at Tewetulua",
  );
  check(
    "PB1d a place no road leaves (seed 42's Tewetulua) offers no road on its card, and its way in to the prospect stays (Issue #428)",
    orphan.name === "Tewetulua" &&
      (orphan.ribbonDisplay === null || orphan.ribbonDisplay === "none") &&
      orphan.prospectDisplay !== null &&
      orphan.prospectDisplay !== "none" &&
      orphan.prospectWidth! > 0,
    JSON.stringify(orphan),
  );
}
