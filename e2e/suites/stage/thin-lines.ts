// The slide-away's thin lines read off the page (Issue #1076): the trail's own line, with the Prospect's alias line under it, as the thin top line, and the chart folio's title 2 px above the foot as the thin bottom line.
import type { Payload } from "../../types.ts";
import { GLYPH_LINES } from "./glyphs.ts";

export type Span = readonly [number, number];
export type ThinLine = { readonly piece: string; readonly t: string; readonly row: number };
export type ThinLines = {
  readonly innerH: number;
  readonly trail: Span | null;
  readonly also: Span | null;
  readonly title: Span | null;
  readonly lines: readonly ThinLine[];
};

// 2026-11-12: folioTravel in src/site/shared/slide-away.ts ceils the travel to the ruled 2 px FOOT_CLEAR, landing the title's foot 1 to 2 px above the page's foot (1.30 on the Mac, handbook/plans/1000/1076/1076-plan.md), so a window 3 px deep holds it with a pixel spare each side (Issue #996 comment 6365710190).
export const FOOT_WINDOW = 3;

export const THIN_LINES: Payload<ThinLines> = `(() => {
  const span = (e) => { if (!e) return null; const r = new Range(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return [b.top, b.bottom]; };
  return {
    innerH: innerHeight,
    trail: span(document.querySelector("header.chrome .trail")),
    also: span(document.querySelector("header.chrome p.also")),
    title: span(document.getElementById("folio-title")),
    lines: (${GLYPH_LINES}).map((g) => ({ piece: g.piece, t: g.t, row: g.row })),
  };
})()`;

export function thinTopFaults(t: ThinLines): string[] {
  const { trail, also, innerH } = t;
  if (trail === null) return ["no trail stands in the head cluster"];
  const faults: string[] = [];
  if (!(trail[0] >= 0 && trail[0] < trail[1] - trail[0]))
    faults.push(
      `the trail stands off its thin top line: its top ${trail[0].toFixed(2)} is not on screen within its own height ${(trail[1] - trail[0]).toFixed(2)} of the page's top`,
    );
  const on = t.lines.filter((l) => l.piece === "cluster" && l.row >= 0 && l.row < innerH);
  if (!on.some((l) => l.t.startsWith("the chart of the atelier")))
    faults.push("the chart of the atelier press is not on the thin top line");
  const band = [trail[0], (also ?? trail)[1]] as const;
  for (const l of on)
    if (l.row < band[0] || l.row > band[1])
      faults.push(
        `the head cluster line "${l.t}" stands at ${l.row}, outside the thin top line's ${band[0].toFixed(2)} to ${band[1].toFixed(2)}`,
      );
  if (also !== null && !(also[0] >= trail[1] && on.some((l) => l.t.startsWith("also reached from"))))
    faults.push("the alias line is not kept under the trail with its text on screen");
  return faults;
}

export function thinFootFaults(t: ThinLines): string[] {
  if (t.title === null) return ["no chart folio title stands on the page"];
  const foot = t.title[1];
  return foot >= t.innerH - FOOT_WINDOW && foot <= t.innerH
    ? []
    : [
        `the chart folio title's foot ${foot.toFixed(2)} is not within ${FOOT_WINDOW} px above the page's foot ${t.innerH}`,
      ];
}
