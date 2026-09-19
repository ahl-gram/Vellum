// The Chart Table's state (#520 Sub 2 of #401): what the drawer draws and what the Explorer's address carries are the same array, so this half is pure and holds no DOM. `chart-drawer`, never `drawer`: src/site/shell/drawer.ts is the site's phone nav (#520 ruling 2).
import { TABLE_CAP, emitTable, prospectItemFrom, tableHash, tableWindow, type TableItem, type SurveyItem, type ProspectItem, type Rung, type TableOverrides } from "../shared/table-address.ts";
import { LOD_BANDS, type LodBand } from "../../world/lod.ts";
import { plateDressFor, prospectTitle } from "./prospect-job.ts";
import type { SlipFold } from "../shared/slip.ts";
import type { UvWindow } from "../../terrain/heightfield.ts";
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

/** The sheets a re-seat drops, whose pictures go with them. Pure and here rather than inline in `restore`, because the set it is built from is the whole hazard: built from the OUTGOING table instead of the incoming one it answers "nothing left" for every possible re-seat, and a guard reading the line's text cannot see the difference (guard-prover round 3). */
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
      kind: "prospect", seed: item.seed, overrides: item.overrides as Partial<WorldRecipe>,
      index: item.index, dress: plateDressFor(item.style), year: item.year,
    };
  }
  const band = LOD_BANDS[item.rung] as LodBand;
  return {
    kind: "region", seed: item.seed, overrides: item.overrides as Partial<WorldRecipe>,
    window: tableWindow(item), gridW: band.gridW, gridH: band.gridH, band: item.rung,
    render: { style: item.style, widthPx: 1500, legend: item.legend, arms: item.arms, beasts: item.beasts, theme: item.theme ?? undefined },
  };
}

/** The dog-ear: the survey's own top-right corner turned back (#518 ruling 3). Drawn in CSS and carrying NO inline svg of its own, because suite-region-detail reads the inset's survey as [...querySelectorAll("#map .region-inset svg")].pop() and a handle with an icon inside would become that element. */
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

export interface ChartDrawerDeps {
  readonly root: HTMLElement;
  readonly tab: HTMLButtonElement;
  readonly shut: HTMLButtonElement;
  readonly count: HTMLElement;
  readonly cuttings: HTMLElement;
  readonly full: HTMLElement;
  readonly road: HTMLButtonElement;
  readonly say: (line: string) => void;
  /** Persist: the address and the device both, since #634 (2026-09-19) gave the table a second home; the host owns which. */
  readonly onChange: (items: ReadonlyArray<TableItem>) => void;
  /** Draw one recovered sheet's thumbnail, deferred to the first opening (ruled 2026-09-07). */
  readonly drawThumb?: (item: TableItem) => Promise<{ url: string; title: string } | null>;
  /** The Broadside's fold. Read late: the room is bound after the table (#543, ruled 2026-09-08). */
  readonly broadside?: () => SlipFold | null;
  readonly relabelLeaf?: (count: number) => void;
  readonly folioHref?: string;
}

export function bindChartDrawer(deps: ChartDrawerDeps) {
  let items: ReadonlyArray<TableItem> = [];
  // Blob urls are revoked when their cutting leaves, and never churned per redraw: the key is the item's own emitted spelling, so a redraw reuses the url it already made.
  const art = new Map<string, string>();
  const names = new Map<string, string>();
  let drawing = false;
  let refill = false;
  let broadsideWasOpen = false;

  const keyOf = (item: TableItem): string => emitTable([item]);
  const titleOf = (item: TableItem): string => names.get(keyOf(item)) ?? placeholderTitle(item);

  const render = (): void => {
    deps.count.textContent = countLine(items);
    deps.road.disabled = items.length === 0;
    deps.tab.textContent = tabLine(items);
    deps.relabelLeaf?.(items.length);
    deps.full.hidden = roomOnTable(items) > 0;
    deps.cuttings.replaceChildren(...items.map((item, seat) => {
      const li = document.createElement("li");
      li.className = item.kind === "prospect" ? "prospect" : "";
      li.style.setProperty("--tilt", `${((seat % 3) - 1) * 1.6}deg`);
      const url = art.get(keyOf(item));
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        li.append(img);
      } else {
        const frame = document.createElement("span");
        frame.className = "awaited";
        frame.textContent = "drawing…";
        li.append(frame);
      }
      const label = document.createElement("span");
      label.className = "label";
      const b = document.createElement("b");
      b.textContent = titleOf(item);
      const i = document.createElement("i");
      i.textContent = subOf(item);
      label.append(b, i);
      const off = document.createElement("button");
      off.type = "button";
      off.className = "off";
      off.setAttribute("aria-label", `Take ${titleOf(item)} off the table`);
      off.textContent = "×";
      off.addEventListener("click", () => take(seat));
      li.append(label, off);
      return li;
    }));
  };

  const forget = (item: TableItem): void => {
    const k = keyOf(item);
    const url = art.get(k);
    if (url) URL.revokeObjectURL(url);
    art.delete(k);
    names.delete(k);
  };

  const commit = (next: ReadonlyArray<TableItem>): void => {
    items = next;
    render();
    deps.onChange(items);
  };

  // A re-seat that lands mid-draw ASKS FOR ANOTHER PASS rather than being dropped: the early return on `drawing` is exactly the window a restore arrives in, and a dropped kick leaves the new sheets reading "drawing…" until the reader shuts the drawer and opens it again (#634).
  const fill = async (): Promise<void> => {
    if (!deps.drawThumb) return;
    if (drawing) { refill = true; return; }
    drawing = true;
    try {
      do {
        refill = false;
        for (const item of items) {
          if (art.has(keyOf(item))) continue;
          const drawn = await deps.drawThumb(item);
          if (drawn) { art.set(keyOf(item), drawn.url); names.set(keyOf(item), drawn.title); render(); }
        }
      } while (refill);
    } finally {
      drawing = false;
    }
  };

  const setOpen = (open: boolean, moveFocus = false): void => {
    // Ruled 2026-09-08 (#543): the drawer and the Broadside never stand open together; the reader who had the Broadside open gets it back when the table shuts, the one who folded it keeps it folded.
    if (open !== deps.root.classList.contains("open")) {
      const broadside = deps.broadside?.() ?? null;
      if (open) broadsideWasOpen = broadside !== null && !broadside.folded();
      if (open || broadsideWasOpen) broadside?.setFolded(open);
    }
    deps.root.classList.toggle("open", open);
    // Both presses hide themselves: the tab is display:none while open and the shut press goes with the drawer, so focus would fall to <body> and a keyboard reader would be returned to the top of the document twice per visit. Each hands focus to the control that replaces it. aria-expanded rides the SHUT press too, since the tab carrying it is the one being hidden.
    deps.tab.setAttribute("aria-expanded", String(open));
    deps.shut.setAttribute("aria-expanded", String(open));
    if (moveFocus) (open ? deps.shut : deps.tab).focus();
    if (open) void fill();
  };

  const take = (seat: number): void => {
    const going = items[seat];
    const next = takeOffTable(items, seat);
    if (next === items) return;
    // Read the name BEFORE forget() drops it, or the announcement falls back to the chart number while the label beside it still said the drawn title.
    const said = going ? titleOf(going) : null;
    if (going) forget(going);
    commit(next);
    deps.say(said ? `${said} is off the table · ${countLine(next)}` : countLine(next));
  };

  deps.tab.addEventListener("click", () => setOpen(true, true));
  deps.shut.addEventListener("click", () => setOpen(false, true));
  deps.road.addEventListener("click", () => {
    if (items.length === 0) return;
    // The whole address, not the table key alone (#634 ruling 3, 2026-09-19): the Portfolio's press back is built from what it was handed, so a road carrying only the sheets returns the reader to the seed of the day instead of the chart they gathered from.
    window.location.href = `${deps.folioHref ?? "../print-room/portfolio/"}${tableHash(window.location.hash, emitTable(items))}`;
  });

  return {
    lay(item: TableItem, svg: string | null, title?: string): boolean {
      const laid = layOnTable(items, item);
      if (laid.refused) {
        deps.say(refusalLine(laid.reason ?? "full", item.kind));
        setOpen(true);
        return false;
      }
      if (svg) art.set(keyOf(item), URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
      if (title) names.set(keyOf(item), title);
      commit(laid.items);
      setOpen(true);
      deps.say(`${titleOf(item)} lies on the table · ${countLine(laid.items)}`);
      return true;
    },
    restore(next: ReadonlyArray<TableItem>): void {
      // Through the same gate a filing takes: a hand-typed or shared link can carry one sheet twice, and parseTable does not dedupe. Two twins would also share ONE blob url, keyed by the item, so removing either would revoke the survivor's picture.
      // The gate is byte equality on the emitted item, so it does NOT catch one prospect spelled two ways: `k-p...style-nautical` and `...style-antique` at one seat draw the same plate (plateDressFor sends both to antique) yet seat twice and spend two of the six. Both DOORS normalise through prospectItemFrom, so only a hand-typed or hand-edited link reaches it; closing it here would rewrite the address the reader shared, which is Alex's call and not a one-liner (#631's cold review, residue).
      let kept: ReadonlyArray<TableItem> = [];
      for (const item of next) kept = layOnTable(kept, item).items;
      // Since #634 this runs again on every cached return, so a sheet that left takes its blob url with it rather than accumulating one per re-seat, and a drawer standing OPEN draws what just arrived instead of holding an empty frame.
      for (const gone of sheetsThatLeft(items, kept)) forget(gone);
      items = kept;
      render();
      if (deps.root.classList.contains("open")) void fill();
    },
    state: (): ReadonlyArray<TableItem> => items,
    isFull: (): boolean => roomOnTable(items) === 0,
    holds: (item: TableItem): boolean => items.some((laid) => keyOf(laid) === keyOf(item)),
  };
}
