// The Chart Table's drawer: binds its elements, its cuttings and its road to the table state src/site/explorer/chart-drawer.ts computes.
import { emitTable, tableHash, type TableItem } from "../shared/table-address.ts";
import { countLine, layOnTable, placeholderTitle, refusalLine, roomOnTable, sheetsThatLeft, subOf, tabLine, takeOffTable } from "./chart-drawer.ts";
import type { SlipFold } from "../shared/slip.ts";

export interface ChartDrawerEls {
  readonly root: HTMLElement;
  readonly tab: HTMLButtonElement;
  readonly shut: HTMLButtonElement;
  readonly count: HTMLElement;
  readonly cuttings: HTMLElement;
  readonly full: HTMLElement;
  readonly road: HTMLButtonElement;
}

export interface ChartDrawerDeps {
  readonly say: (line: string) => void;
  /** Persist: the address and the device both, since Issue #634 (2026-09-19) gave the table a second home; the host owns which. */
  readonly onChange: (items: ReadonlyArray<TableItem>) => void;
  /** Draw one recovered sheet's thumbnail, deferred to the first opening (ruled 2026-09-07). */
  readonly drawThumb?: (item: TableItem) => Promise<{ url: string; title: string } | null>;
  /** The Broadside's fold. Read late: the room is bound after the table (Issue #543, ruled 2026-09-08). */
  readonly broadside?: () => SlipFold | null;
  readonly folioHref?: string;
}

interface Row { readonly li: HTMLLIElement; readonly label: HTMLElement; readonly title: HTMLElement; readonly off: HTMLButtonElement }
type ItemText = (item: TableItem) => string;
type Items = () => ReadonlyArray<TableItem>;
type Put = (key: string, value: string) => void;

const keyOf = (item: TableItem): string => emitTable([item]);

const settle = (li: HTMLElement): void => {
  li.classList.add("landing");
  li.addEventListener("animationend", (e) => { if (e.target === li) li.classList.remove("landing"); });
};

function cuttingLabel(item: TableItem, titleOf: ItemText): { label: HTMLElement; b: HTMLElement } {
  const label = document.createElement("span");
  label.className = "label";
  const b = document.createElement("b");
  b.textContent = titleOf(item);
  const i = document.createElement("i");
  i.textContent = subOf(item);
  label.append(b, i);
  return { label, b };
}

function offPress(item: TableItem, seat: number, titleOf: ItemText, take: (seat: number) => void): HTMLButtonElement {
  const off = document.createElement("button");
  off.type = "button";
  off.className = "off";
  off.setAttribute("aria-label", `Take ${titleOf(item)} off the table`);
  off.textContent = "×";
  off.addEventListener("click", () => take(seat));
  return off;
}

function recount(drawerEls: ChartDrawerEls, deps: ChartDrawerDeps, items: ReadonlyArray<TableItem>): void {
  drawerEls.count.textContent = countLine(items);
  drawerEls.road.disabled = items.length === 0;
  drawerEls.tab.textContent = tabLine(items);
  drawerEls.full.hidden = roomOnTable(items) > 0;
  drawerEls.cuttings.classList.remove("jolt");
}

function drawerArt(): { art: ReadonlyMap<string, string>; titleOf: ItemText; pictureOf: (item: TableItem) => HTMLElement; forget: (item: TableItem) => void; putArt: Put; putName: Put } {
  // Blob urls are revoked when their cutting leaves, and never churned per redraw: the key is the item's own emitted spelling, so a redraw reuses the url it already made.
  const art = new Map<string, string>();
  const names = new Map<string, string>();
  const titleOf = (item: TableItem): string => names.get(keyOf(item)) ?? placeholderTitle(item);

  const pictureOf = (item: TableItem): HTMLElement => {
    const url = art.get(keyOf(item));
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      return img;
    }
    const frame = document.createElement("span");
    frame.className = "awaited";
    frame.textContent = "drawing…";
    return frame;
  };

  const forget = (item: TableItem): void => {
    const k = keyOf(item);
    const url = art.get(k);
    if (url) URL.revokeObjectURL(url);
    art.delete(k);
    names.delete(k);
  };
  const putArt = (key: string, value: string): void => { art.set(key, value); };
  const putName = (key: string, value: string): void => { names.set(key, value); };
  return { art, titleOf, pictureOf, forget, putArt, putName };
}

function drawerCuttings(drawerEls: ChartDrawerEls, deps: ChartDrawerDeps, titleOf: ItemText, pictureOf: (item: TableItem) => HTMLElement, forget: (item: TableItem) => void): { rows: ReadonlyMap<string, Row>; render: () => void; commit: (next: ReadonlyArray<TableItem>) => void; items: Items; setItems: (next: ReadonlyArray<TableItem>) => void; setLanding: (next: string | null) => void } {
  let items: ReadonlyArray<TableItem> = [];
  const rows = new Map<string, Row>();
  let landing: string | null = null;

  const cutting = (item: TableItem, seat: number): Row => {
    const li = document.createElement("li");
    li.className = item.kind === "prospect" ? "prospect" : "";
    li.style.setProperty("--tilt", `${((seat % 3) - 1) * 1.6}deg`);
    const { label, b } = cuttingLabel(item, titleOf);
    const off = offPress(item, seat, titleOf, take);
    li.append(pictureOf(item), label, off);
    return { li, label, title: b, off };
  };

  const render = (): void => {
    recount(drawerEls, deps, items);
    rows.clear();
    drawerEls.cuttings.replaceChildren(...items.map((item, seat) => {
      const row = cutting(item, seat);
      rows.set(keyOf(item), row);
      if (landing === keyOf(item)) settle(row.li);
      return row.li;
    }));
    landing = null;
  };

  const commit = (next: ReadonlyArray<TableItem>): void => {
    items = next;
    render();
    deps.onChange(items);
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
  const setItems = (next: ReadonlyArray<TableItem>): void => { items = next; };
  const setLanding = (next: string | null): void => { landing = next; };
  return { rows, render, commit, items: () => items, setItems, setLanding };
}

function drawerJolt(drawerEls: ChartDrawerEls, rows: ReadonlyMap<string, Row>) {
  const onScreen = (): boolean => drawerEls.cuttings.getBoundingClientRect().width > 0;
  const jolt = (): void => { if (onScreen()) drawerEls.cuttings.classList.add("jolt"); };
  let armedJolt: ((e: AnimationEvent) => void) | null = null;
  const disarmJolt = (): void => { if (armedJolt) drawerEls.root.removeEventListener("animationend", armedJolt); armedJolt = null; };
  const joltWhenStill = (wasOpen: boolean): void => {
    if (wasOpen) { jolt(); return; }
    if (drawerEls.root.getBoundingClientRect().width === 0) return;
    armedJolt = (e) => { if (e.target !== drawerEls.root) return; disarmJolt(); jolt(); };
    drawerEls.root.addEventListener("animationend", armedJolt);
  };
  // A shut mid-ceremony sets display:none, which cancels an animation with no end event; what the end would have cleared is cleared here instead.
  const clearCeremonies = (): void => {
    for (const row of rows.values()) row.li.classList.remove("landing");
    drawerEls.cuttings.classList.remove("jolt");
    disarmJolt();
  };
  return { joltWhenStill, clearCeremonies };
}

function drawerFill(deps: ChartDrawerDeps, items: Items, rows: ReadonlyMap<string, Row>, render: () => void, art: ReadonlyMap<string, string>, pictureOf: (item: TableItem) => HTMLElement, titleOf: ItemText, putArt: Put, putName: Put) {
  let drawing = false;
  let refill = false;

  const patchArt = (item: TableItem): void => {
    const row = rows.get(keyOf(item));
    if (!row) { render(); return; }
    row.li.replaceChildren(pictureOf(item), row.label, row.off);
    row.title.textContent = titleOf(item);
    row.off.setAttribute("aria-label", `Take ${titleOf(item)} off the table`);
  };

  const fill = async (): Promise<void> => {
    if (!deps.drawThumb) return;
    if (drawing) { refill = true; return; }
    drawing = true;
    try {
      do {
        refill = false;
        for (const item of items()) {
          if (art.has(keyOf(item))) continue;
          const drawn = await deps.drawThumb(item);
          if (!drawn) continue;
          // The sheet may have LEFT while its picture was drawing, a window only a re-seat mid-draw opens, and its url is then filed under a key no cutting carries so nothing would ever revoke it.
          if (!items().some((live) => keyOf(live) === keyOf(item))) { URL.revokeObjectURL(drawn.url); continue; }
          putArt(keyOf(item), drawn.url); putName(keyOf(item), drawn.title); patchArt(item);
        }
      } while (refill); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    } finally {
      drawing = false;
    }
  };
  return { fill };
}

function drawerOpen(drawerEls: ChartDrawerEls, deps: ChartDrawerDeps, clearCeremonies: () => void, fill: () => Promise<void>) {
  let broadsideWasOpen = false;

  const setOpen = (open: boolean, moveFocus = false): void => {
    // Ruled 2026-09-08 (Issue #543): the drawer and the Broadside never stand open together; the reader who had the Broadside open gets it back when the table shuts, the one who folded it keeps it folded.
    if (open !== drawerEls.root.classList.contains("open")) {
      const broadside = deps.broadside?.() ?? null;
      if (open) broadsideWasOpen = broadside !== null && !broadside.folded();
      if (open || broadsideWasOpen) broadside?.setFolded(open);
    }
    drawerEls.root.classList.toggle("open", open);
    if (!open) clearCeremonies();
    // Both presses hide themselves: the tab is display:none while open and the shut press goes with the drawer, so focus would fall to <body> and a keyboard reader would be returned to the top of the document twice per visit. Each hands focus to the control that replaces it. aria-expanded rides the SHUT press too, since the tab carrying it is the one being hidden.
    drawerEls.tab.setAttribute("aria-expanded", String(open));
    drawerEls.shut.setAttribute("aria-expanded", String(open));
    if (moveFocus) (open ? drawerEls.shut : drawerEls.tab).focus();
    if (open) void fill();
  };
  return { setOpen };
}

function drawerLay(drawerEls: ChartDrawerEls, deps: ChartDrawerDeps, items: Items, setOpen: (open: boolean) => void, joltWhenStill: (wasOpen: boolean) => void, putArt: Put, putName: Put, setLanding: (next: string | null) => void, commit: (next: ReadonlyArray<TableItem>) => void, titleOf: ItemText) {
  function lay(item: TableItem, svg: string | null, title?: string, ready?: { readonly url: string }): boolean {
    const laid = layOnTable(items(), item);
    if (laid.refused) {
      deps.say(refusalLine(laid.reason ?? "full", item.kind));
      const wasOpen = drawerEls.root.classList.contains("open");
      setOpen(true);
      if (laid.reason === "full") joltWhenStill(wasOpen);
      return false;
    }
    if (ready) putArt(keyOf(item), ready.url);
    else if (svg) putArt(keyOf(item), URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
    if (title) putName(keyOf(item), title);
    setLanding(keyOf(item));
    commit(laid.items);
    setOpen(true);
    deps.say(`${titleOf(item)} lies on the table · ${countLine(laid.items)}`);
    return true;
  }
  return { lay };
}

function drawerTable(drawerEls: ChartDrawerEls, items: Items, setOpen: (open: boolean) => void, forget: (item: TableItem) => void, setItems: (next: ReadonlyArray<TableItem>) => void, render: () => void, fill: () => Promise<void>) {
  function reveal(): () => void {
    const wasOpen = drawerEls.root.classList.contains("open");
    if (!wasOpen) setOpen(true);
    return () => { if (!wasOpen) setOpen(false); };
  }
  function receiving(over: boolean): void { drawerEls.root.classList.toggle("receiving", over); }
  function restore(next: ReadonlyArray<TableItem>): void {
    // Through the same gate a filing takes: a hand-typed or shared link can carry one sheet twice, and parseTable does not dedupe. Two twins would also share ONE blob url, keyed by the item, so removing either would revoke the survivor's picture.
    // The gate is byte equality on the emitted item, so it does NOT catch one prospect spelled two ways: `k-p...style-nautical` and `...style-antique` at one seat draw the same plate (plateDressFor sends both to antique) yet seat twice and spend two of the six. Both DOORS normalise through prospectItemFrom, so only a hand-typed or hand-edited link reaches it; closing it here would rewrite the address the reader shared, which is Alex's call and not a one-liner (PR #631's cold review, residue).
    let kept: ReadonlyArray<TableItem> = [];
    for (const item of next) kept = layOnTable(kept, item).items;
    for (const gone of sheetsThatLeft(items(), kept)) forget(gone);
    setItems(kept);
    render();
    if (drawerEls.root.classList.contains("open")) void fill();
  }
  const state = (): ReadonlyArray<TableItem> => items();
  const isFull = (): boolean => roomOnTable(items()) === 0;
  const holds = (item: TableItem): boolean => items().some((laid) => keyOf(laid) === keyOf(item));
  return { reveal, receiving, restore, state, isFull, holds };
}

export function bindChartDrawer(drawerEls: ChartDrawerEls, deps: ChartDrawerDeps) {
  const { art, titleOf, pictureOf, forget, putArt, putName } = drawerArt();
  const { rows, render, commit, items, setItems, setLanding } = drawerCuttings(drawerEls, deps, titleOf, pictureOf, forget);
  const { joltWhenStill, clearCeremonies } = drawerJolt(drawerEls, rows);
  drawerEls.cuttings.addEventListener("animationend", (e) => { if (e.target === drawerEls.cuttings) drawerEls.cuttings.classList.remove("jolt"); });
  const { fill } = drawerFill(deps, items, rows, render, art, pictureOf, titleOf, putArt, putName);
  const { setOpen } = drawerOpen(drawerEls, deps, clearCeremonies, fill);
  const { lay } = drawerLay(drawerEls, deps, items, setOpen, joltWhenStill, putArt, putName, setLanding, commit, titleOf);
  const { reveal, receiving, restore, state, isFull, holds } = drawerTable(drawerEls, items, setOpen, forget, setItems, render, fill);

  drawerEls.tab.addEventListener("click", () => setOpen(true, true));
  drawerEls.shut.addEventListener("click", () => setOpen(false, true));
  drawerEls.road.addEventListener("click", () => {
    if (items().length === 0) return;
    window.location.href = `${deps.folioHref ?? "./portfolio/"}${tableHash(window.location.hash, emitTable(items()))}`;
  });

  return { lay, reveal, receiving, restore, state, isFull, holds };
}
