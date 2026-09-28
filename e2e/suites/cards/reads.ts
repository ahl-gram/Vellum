import type { Payload } from "../../types.ts";

// #633: a card taller than its box cannot be fitted by any offset, so the bound IS the principle. Swept 2026-09-19: the smallest real overage measured is 8.61px, so 0.5px is the sub-pixel residual of a cap published from a fractional rect and cannot hide one.
export const OVER_BOX_TOLERANCE = 0.5;
// Seed 4294967295 is the WITNESS that makes this bite: its Kralgov card measured 150.95px past a 247.02px box at 320 and 61.27px past a 301.05px box at 390 on main at 18bacfd. Every place is measured, not that one card, because the defect is a class and a copy change that promotes a different place to the worst would leave a single-card guard green.
export const NARROW_SEED = 4294967295;
// Focus rather than a pointer, deliberately: focus reaches EVERY mark, including the ones a neighbour's 26px hit covers at rest, and showPlaceCard composes the same card on both paths. Whether a pointer can reach a mark is a different question with its own issue.
type SweepRow = { want: string; shown: false } | { want: string; got: string | undefined; shown: true; h: number; over: number };
export type Swept = { error?: undefined; boxW: number; boxH: number; rows: SweepRow[] };
export const SWEEP: Payload<{ error: "no map-viewport" } | Swept> = `(() => {
    const vp = document.getElementById("map-viewport");
    if (!vp) return { error: "no map-viewport" };
    const v = vp.getBoundingClientRect();
    const rows = [];
    for (const h of document.querySelectorAll(".place-overlay .place-hit")) {
      const want = (h.getAttribute("aria-label") || "").split(", ")[0];
      h.focus();
      const card = document.getElementById("place-card");
      if (!card || card.hidden) { rows.push({ want, shown: false }); continue; }
      const got = (card.querySelector(".pc-name") || {}).textContent;
      const c = card.getBoundingClientRect();
      rows.push({ want, got, shown: true, h: +c.height.toFixed(2), over: +(c.height - v.height).toFixed(2) });
    }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    return { boxW: +v.width.toFixed(2), boxH: +v.height.toFixed(2), rows };
  })()`;
