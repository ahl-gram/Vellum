// The slide-away's thin lines read off the page (Issue #1076): the trail's own line, with the Prospect's alias line directly under it, as the thin top line, and the chart folio's title, on one row 2 px above the foot, as the thin bottom line.
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

// 2026-11-12: GLYPH_LINES rounds each line box's centre to the pixel, and the boxes of one line, set in one face and size, centre under a pixel apart (every box on the trail's, the alias line's and the title's line read one row on the Prospect at 1280x800 and the Explorer at 1280x800 and 1024x768 on the Mac, handbook/plans/1000/1076/1076-r1-plan.md), so they read at most 1 apart, where a second line stands a whole line lower, 13 px at the least (the alias line's).
const ROW_SPREAD = 1;

// 2026-11-12: ruled, Alex, 2026-11-12, Issue #1076 comment 6825295330, main's 48 px ceiling on the thin top line's foot kept beside the read from the layout, under Issue #1048's ruling on a number that stays: the foot stands at 44.20 on the Prospect at 1280x800 and 22.41 on the Explorer at 1280x800 and 1024x768 on the Mac harness browser, and at 44.20, 22.41 and 22.41 on the CI runner (run 43233995537, lanes C and B), the nearest 3.80 under it (the Prospect on both machines).
const TOP_CEILING = 48;

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

const within = (row: number, s: Span): boolean => row >= s[0] && row <= s[1];
const spread = (lines: readonly ThinLine[]): number =>
  lines.length === 0 ? 0 : Math.max(...lines.map((l) => l.row)) - Math.min(...lines.map((l) => l.row));
const rowsOf = (lines: readonly ThinLine[]): string => lines.map((l) => l.row).join(", ");

export function thinTopFoot(t: ThinLines, alias: boolean): number {
  if (t.trail === null) return NaN;
  return alias && t.also !== null ? Math.max(t.trail[1], t.also[1]) : t.trail[1];
}

export function thinTopFaults(t: ThinLines, alias: boolean): string[] {
  const { trail, also, innerH } = t;
  if (trail === null) return ["no trail stands in the head cluster"];
  const faults: string[] = [];
  if (!(trail[0] >= 0 && trail[0] < trail[1] - trail[0]))
    faults.push(
      `the trail stands off its thin top line: its top ${trail[0].toFixed(2)} is not on screen within its own height ${(trail[1] - trail[0]).toFixed(2)} of the page's top`,
    );
  const on = t.lines.filter((l) => l.piece === "cluster" && l.row >= 0 && l.row < innerH);
  const onTrail = on.filter((l) => within(l.row, trail));
  if (spread(onTrail) > ROW_SPREAD) faults.push(`the trail's line stands on more than one row: ${rowsOf(onTrail)}`);
  if (!onTrail.some((l) => l.t.startsWith("the chart of the atelier")))
    faults.push("the chart of the atelier press is not on the trail's line");
  if (alias && also === null) faults.push("no alias line stands under the trail");
  if (alias && also !== null) {
    const onAlias = on.filter((l) => within(l.row, also));
    if (!(also[0] >= trail[1] && also[0] - trail[1] < also[1] - also[0]))
      faults.push(
        `the alias line does not stand directly under the trail: its top ${also[0].toFixed(2)}, the trail's foot ${trail[1].toFixed(2)}, its own line ${(also[1] - also[0]).toFixed(2)}`,
      );
    if (spread(onAlias) > ROW_SPREAD) faults.push(`the alias line stands on more than one row: ${rowsOf(onAlias)}`);
    if (!onAlias.some((l) => l.t.startsWith("also reached from")))
      faults.push("the alias line's text is not on screen");
  }
  const foot = thinTopFoot(t, alias);
  if (!(foot <= TOP_CEILING))
    faults.push(`the thin top line's foot ${foot.toFixed(2)} stands past the ${TOP_CEILING} px ceiling`);
  const under = alias ? also : null;
  for (const l of on)
    if (!within(l.row, trail) && !(under !== null && within(l.row, under)))
      faults.push(
        `the head cluster line "${l.t}" stands at ${l.row}, outside the trail's line ${trail[0].toFixed(2)} to ${trail[1].toFixed(2)}${under === null ? "" : ` and the alias line's ${under[0].toFixed(2)} to ${under[1].toFixed(2)}`}`,
      );
  return faults;
}

export function thinFootFaults(t: ThinLines): string[] {
  if (t.title === null) return ["no chart folio title stands on the page"];
  const faults: string[] = [];
  const foot = t.title[1];
  if (!(foot >= t.innerH - FOOT_WINDOW && foot <= t.innerH))
    faults.push(
      `the chart folio title's foot ${foot.toFixed(2)} is not within ${FOOT_WINDOW} px above the page's foot ${t.innerH}`,
    );
  const folio = t.lines.filter((l) => l.piece === "chart folio" && l.row >= 0 && l.row < t.innerH);
  if (spread(folio) > ROW_SPREAD)
    faults.push(`the chart folio stands on more than one row on screen: ${rowsOf(folio)}`);
  return faults;
}
