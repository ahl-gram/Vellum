// The Chart Table's state (#520 Sub 2 of #401): what the drawer draws and what the Explorer's address carries are the same array, so this half is pure and holds no DOM. `chart-drawer`, never `drawer`: src/site/shell/drawer.ts is the site's phone nav (#520 ruling 2).
import { TABLE_CAP, emitTable, tableWindow, type TableItem, type SurveyItem, type Rung } from "../shared/table-address.ts";
import { LOD_BANDS, type LodBand } from "../../world/lod.ts";
import type { SlipFold } from "../shared/slip.ts";
import type { UvWindow } from "../../terrain/heightfield.ts";
import type { WorldRecipe } from "../../world/types.ts";
import type { RenderOptions } from "../../render/map-renderer.ts";

// Compared on the emitted spelling, not a stringified object, whose key order would split one sheet in two.
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

export function refusalLine(why: Refusal): string {
  return why === "full" ? "the table is full: six sheets lie on it" : "this survey is already on the table";
}

export function takeOffTable(items: ReadonlyArray<TableItem>, seat: number): ReadonlyArray<TableItem> {
  if (!Number.isInteger(seat) || seat < 0 || seat >= items.length) return items;
  return [...items.slice(0, seat), ...items.slice(seat + 1)];
}

export function roomOnTable(items: ReadonlyArray<TableItem>): number {
  return Math.max(0, TABLE_CAP - items.length);
}

// The address carries the seat and the dress but not the drawn TITLE, which the worker derives from (world, window), so a recovered sheet is named from what the address does state: the chart number IS the seed (cartouche.ts), which names the world exactly even before its survey is drawn again.
const DRESS: Record<string, string> = { antique: "antique", ink: "pen & ink" };
const dressOf = (style: string): string => DRESS[style] ?? style;
export const placeholderTitle = (item: TableItem): string => `Chart \u2116 ${item.seed}`;
export function subOf(item: TableItem): string {
  if (item.kind === "prospect") return item.year === null ? `a prospect, ${dressOf(item.style)}` : `a prospect, ${dressOf(item.style)}, ${item.year}`;
  return `band ${item.rung}, ${dressOf(item.style)}`;
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

/** The region job that redraws one filed survey, so a recovered table can fill its frames. Built from the ADDRESS alone, since that is all a recovered sheet has: `tableWindow` rebuilds the exact window the settle committed. A prospect is Sub 4's to draw and keeps its reserved frame (ruled 2026-09-07). */
export function thumbJobFor(item: TableItem): {
  kind: "region"; seed: number; overrides: Partial<WorldRecipe> | undefined; window: UvWindow;
  gridW: number; gridH: number; band: number; render: RenderOptions;
} | null {
  if (item.kind !== "survey") return null;
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
  // The same four d3 gestures createGlass stops for the zoom cluster, so a rapid double click on the corner never becomes the chart's double-click-to-zoom.
  for (const ev of ["mousedown", "dblclick", "wheel", "touchstart"]) {
    b.addEventListener(ev, (e) => e.stopPropagation());
  }
  b.addEventListener("click", (e) => { e.preventDefault(); onLay(); });
  return b;
}

/** The DOM half. The pure state above is what the address carries; this only draws it. */
export interface ChartDrawerDeps {
  readonly root: HTMLElement;
  readonly tab: HTMLButtonElement;
  readonly shut: HTMLButtonElement;
  readonly count: HTMLElement;
  readonly cuttings: HTMLElement;
  readonly full: HTMLElement;
  readonly road: HTMLButtonElement;
  /** The Explorer's aria-live region, where a refusal is spoken (#520 build item 5). */
  readonly say: (line: string) => void;
  /** Persist: the table lives in the address and nowhere else (#401, no browser storage). */
  readonly onChange: (items: ReadonlyArray<TableItem>) => void;
  /** Draw one recovered sheet's thumbnail, deferred to the first opening (ruled 2026-09-07). */
  readonly drawThumb?: (item: TableItem) => Promise<{ url: string; title: string } | null>;
  /** The Broadside's fold. Read late: the room is bound after the table (#543, ruled 2026-09-08). */
  readonly broadside?: () => SlipFold | null;
}

export function bindChartDrawer(deps: ChartDrawerDeps) {
  let items: ReadonlyArray<TableItem> = [];
  // Blob urls are revoked when their cutting leaves, and never churned per redraw: the key is the item's own emitted spelling, so a redraw reuses the url it already made.
  const art = new Map<string, string>();
  const names = new Map<string, string>();
  let drawing = false;
  let broadsideWasOpen = false;

  const keyOf = (item: TableItem): string => emitTable([item]);
  const titleOf = (item: TableItem): string => names.get(keyOf(item)) ?? placeholderTitle(item);

  const render = (): void => {
    deps.count.textContent = countLine(items);
    deps.tab.textContent = tabLine(items);
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

  const fill = async (): Promise<void> => {
    if (drawing || !deps.drawThumb) return;
    drawing = true;
    try {
      for (const item of items) {
        if (art.has(keyOf(item))) continue;
        const drawn = await deps.drawThumb(item);
        if (drawn) { art.set(keyOf(item), drawn.url); names.set(keyOf(item), drawn.title); render(); }
      }
    } finally {
      drawing = false;
    }
  };

  const setOpen = (open: boolean, moveFocus = false): void => {
    // Ruled 2026-09-08: the two never stand open together. Covering the chart's caption and the roads out while leaving the
    // Broadside standing made no sense to the reader, and every collision #543 measured (the tab under the slip's outline,
    // the road's stamp behind it, a sixth cutting overhanging it, a row too narrow to hold a sheet) is that pair, not the
    // drawer. The reader who had the Broadside open gets it back when the table shuts; the one who folded it keeps it folded.
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
    // Taking a cutting off moves the count and the tab silently otherwise: the press that did it is gone from the page by the time focus lands, so the room is announced rather than left to be discovered.
    deps.say(said ? `${said} is off the table · ${countLine(next)}` : countLine(next));
  };

  deps.tab.addEventListener("click", () => setOpen(true, true));
  deps.shut.addEventListener("click", () => setOpen(false, true));

  return {
    lay(item: TableItem, svg: string | null, title?: string): boolean {
      const laid = layOnTable(items, item);
      if (laid.refused) {
        deps.say(refusalLine(laid.reason ?? "full"));
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
      let kept: ReadonlyArray<TableItem> = [];
      for (const item of next) kept = layOnTable(kept, item).items;
      items = kept;
      render();
    },
    state: (): ReadonlyArray<TableItem> => items,
    isFull: (): boolean => roomOnTable(items) === 0,
    holds: (item: TableItem): boolean => items.some((laid) => keyOf(laid) === keyOf(item)),
  };
}
