// The Chart Table's state (Issue #520 Sub 2 of Issue #401): what the drawer draws and what the Explorer's address carries are the same array, so this half is pure and holds no DOM. `chart-drawer`, never `drawer` (Issue #520 ruling 2).
import { TABLE_CAP, emitTable, prospectItemFrom, tableWindow, type TableItem, type SurveyItem, type ProspectItem, type Rung, type TableOverrides } from "../shared/table-address.ts";
import { LOD_BANDS, type LodBand } from "../../world/lod.ts";
import { plateDressFor } from "../../prospect/dress/context.ts";
import { prospectTitle } from "../prospect/note-lines.ts";
import type { WorldRecipe } from "../../world/types.ts";
import type { RenderOptions } from "../../render/map-renderer.ts";
import type { StyleName } from "../../render/style.ts";
import type { ProspectJob, RegionJob, RegionResult, ProspectResult } from "./worker-client.ts";

const sameSheet = (a: TableItem, b: TableItem): boolean => emitTable([a]) === emitTable([b]);

export type Refusal = "full" | "already";

export function layOnTable(
  items: ReadonlyArray<TableItem>,
  item: TableItem,
): { readonly items: ReadonlyArray<TableItem>; readonly refused: boolean; readonly reason: Refusal | null } {
  if (items.some((laid) => sameSheet(laid, item))) return { items, refused: true, reason: "already" };
  if (items.length >= TABLE_CAP) return { items, refused: true, reason: "full" };
  return { items: [...items, item], refused: false, reason: null };
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six"] as const;
const sheets = (n: number): string => `${WORDS[n] ?? String(n)} ${n === 1 ? "sheet" : "sheets"}`;

export function countLine(items: ReadonlyArray<TableItem>): string {
  const n = items.length;
  if (n === 0) return "the table is bare";
  const laid = `${sheets(n)} laid`;
  const room = roomOnTable(items);
  return room === 0 ? `${laid} · the table is full` : `${laid} · room for ${WORDS[room] ?? String(room)} more`;
}

export function tabLine(items: ReadonlyArray<TableItem>): string {
  return `The Drawer · ${items.length === 0 ? "the table is bare" : sheets(items.length)}`;
}

export function refusalLine(why: Refusal, kind: TableItem["kind"] = "survey"): string {
  if (why === "full") return "the table is full: six sheets lie on it";
  return `this ${kind} is already on the table`;
}

/** The sheet a filing is made FROM: the drawn world and the present year of that same world, in one value because they may never disagree. */
export interface FilingSheet {
  readonly seed: number;
  readonly overrides: TableOverrides;
  readonly style: StyleName;
  readonly presentYear: number;
}

// The skew this shape forbids is not hypothetical: a world and a year passed as two arguments went out of step for the length of a sheet turn, and again indefinitely after an ABORTED one, because `finish` in ./sheet-turn.ts drops the `turning` class on both paths and resolves on only one. Gating on that class caught the first and not the second; one value cannot skew on any path.
export function filingAt(at: { readonly turning: boolean; readonly sheet: FilingSheet | null; readonly index: number }): ProspectItem | null {
  if (at.turning || !at.sheet) return null;
  return prospectItemFrom({ seed: at.sheet.seed, overrides: at.sheet.overrides, style: at.sheet.style, index: at.index, year: at.sheet.presentYear });
}

/** The card's resting face, ruled from the still `design/chart-table/stills/explorer-1280-card.png`. */
export const LAY_ON_CARD = "Lay the prospect on the table";
/** The Prospect page's, ruled 2026-09-17 from the rendered variant: THIS plate, the one the page is showing, rather than a place on a chart. */
export const LAY_ON_PAGE = "Lay this prospect on the table";

export function layPressFace(
  at: { readonly holds: boolean; readonly full: boolean },
  resting: string,
): { readonly label: string; readonly refuses: boolean } {
  if (at.holds) return { label: "Already on the table", refuses: true };
  if (at.full) return { label: "No room on the table", refuses: true };
  return { label: resting, refuses: false };
}

export function takeOffTable(items: ReadonlyArray<TableItem>, seat: number): ReadonlyArray<TableItem> {
  if (!Number.isInteger(seat) || seat < 0 || seat >= items.length) return items;
  return [...items.slice(0, seat), ...items.slice(seat + 1)];
}

export function roomOnTable(items: ReadonlyArray<TableItem>): number {
  return Math.max(0, TABLE_CAP - items.length);
}

export function sheetsThatLeft(before: ReadonlyArray<TableItem>, after: ReadonlyArray<TableItem>): ReadonlyArray<TableItem> {
  const staying = new Set(after.map((item) => emitTable([item])));
  return before.filter((item) => !staying.has(emitTable([item])));
}

// The address carries the seat and the dress but not the drawn TITLE, which the worker derives from (world, window), so a recovered sheet is named from what the address does state: the chart number IS the seed (cartouche.ts), which names the world exactly even before its survey is drawn again.
const DRESS: Record<string, string> = { antique: "antique", ink: "pen & ink" };
const dressOf = (style: string): string => DRESS[style] ?? style;
export const placeholderTitle = (item: TableItem): string => `Chart \u2116 ${item.seed}`;
export function subOf(item: TableItem): string {
  if (item.kind === "prospect") {
    const dress = dressOf(plateDressFor(item.style));
    return item.year === null ? `a prospect, ${dress}` : `a prospect, ${dress}, ${item.year}`;
  }
  return `band ${item.rung}, ${dressOf(item.style)}`;
}

export function thumbNames(res: RegionResult | ProspectResult): { readonly title: string; readonly worldTitle: string } {
  return "name" in res ? { title: prospectTitle(res.name), worldTitle: res.title } : { title: res.title, worldTitle: res.worldTitle };
}

export function surveyItemFrom(c: {
  readonly seed: number;
  readonly overrides: Partial<WorldRecipe> | undefined;
  readonly render: RenderOptions;
  readonly band: number;
  readonly seat: { readonly lx: number; readonly ly: number } | null;
}): SurveyItem | null {
  if (!c.seat || c.band < 1 || c.band > 3 || !c.render.style) return null;
  const o = c.overrides ?? {};
  return {
    kind: "survey", seed: c.seed, rung: c.band as Rung, lx: c.seat.lx, ly: c.seat.ly,
    overrides: {
      ...(o.mapType ? { mapType: o.mapType } : {}),
      ...(o.band ? { band: o.band } : {}),
      ...(typeof o.landFraction === "number" ? { landFraction: o.landFraction } : {}),
      ...(typeof o.coastWarp === "number" ? { coastWarp: o.coastWarp } : {}),
    },
    style: c.render.style,
    legend: c.render.legend !== false, arms: c.render.arms === true, beasts: c.render.beasts === true,
    theme: c.render.theme ?? null,
  };
}

/** The job that redraws one filed sheet, so a recovered table can fill its frames. Built from the ADDRESS alone, since that is all a recovered sheet has: `tableWindow` rebuilds the exact window the settle committed. */
export function thumbJobFor(item: TableItem): RegionJob | ProspectJob {
  if (item.kind === "prospect") {
    return {
      kind: "prospect", seed: item.seed, overrides: item.overrides,
      index: item.index, dress: plateDressFor(item.style), year: item.year,
    };
  }
  const band = LOD_BANDS[item.rung] as LodBand;
  return {
    kind: "region", seed: item.seed, overrides: item.overrides,
    window: tableWindow(item), gridW: band.gridW, gridH: band.gridH, band: item.rung,
    render: { style: item.style, widthPx: 1500, legend: item.legend, arms: item.arms, beasts: item.beasts, theme: item.theme ?? undefined },
  };
}

/** The dog-ear: the survey's own top-right corner turned back (Issue #518 ruling 3). Drawn in CSS and carrying NO inline svg of its own, because suite-region-detail reads the inset's survey as [...querySelectorAll("#map .region-inset svg")].pop() and a handle with an icon inside would become that element. */
export function makeDogEar(label: string, k: number, onLay: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  // Set HERE and not left to the next zoom publish: the outgoing inset is still mounted at commit and carries its own ear, so a querySelector that takes the first one hands the counter-scale to the sheet on its way out and leaves this one 3x oversized until the reader zooms again.
  if (k !== 1) b.style.setProperty("--zoom-k", String(k));
  b.type = "button";
  b.className = "dog-ear";
  b.setAttribute("aria-label", label);
  b.title = label;
  for (const ev of ["mousedown", "dblclick", "wheel", "touchstart"]) {
    b.addEventListener(ev, (e) => e.stopPropagation());
  }
  b.addEventListener("click", (e) => { e.preventDefault(); onLay(); });
  return b;
}
