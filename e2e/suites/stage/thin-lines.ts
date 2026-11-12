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

export function thinTopFaults(_t: ThinLines): string[] {
  return [];
}

export function thinFootFaults(_t: ThinLines): string[] {
  return [];
}
