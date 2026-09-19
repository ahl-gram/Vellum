// The Chart Table's second home (#634, ruled 2026-09-18 and 2026-09-19, superseding #401 ruling 3): the address decides an ARRIVAL and the device decides a RETURN. Pure and DOM-free like its sibling ./table-address.ts, whose grammar it stores verbatim so the table has one spelling everywhere; the store and the browser's navigation entry are injected the way firstArrival takes its own in ../home/ceremony.ts, which is what makes the precedence provable outside a browser.
import { emitTable, parseTableValue, type TableItem } from "./table-address.ts";

export const TABLE_STORE_KEY = "vellum.table.v1";

/** The device, in one place, so no host names its own. */
export const deviceStorage = (): Storage => localStorage;

/** The device's table, or null when it holds none, which is the reading `tableOnArrival` treats as "the address decides". A store that refuses to answer reads the same way. */
export function readStoredTable(getStorage: () => Storage): ReadonlyArray<TableItem> | null {
  try {
    const raw = getStorage().getItem(TABLE_STORE_KEY);
    return raw === null ? null : parseTableValue(raw);
  } catch {
    /* private mode or storage disabled: the address is still the table's home */
    return null;
  }
}

export function writeStoredTable(getStorage: () => Storage, items: ReadonlyArray<TableItem>): void {
  try {
    const store = getStorage();
    if (items.length === 0) store.removeItem(TABLE_STORE_KEY);
    else store.setItem(TABLE_STORE_KEY, emitTable(items));
  } catch {
    /* unwritable storage: the gathering still rides in the address */
  }
}

/** How the reader got here, in the browser's own word. The fallback is an arrival, never a traversal: a browser that reports nothing must leave the address in charge. */
export function navigationType(getEntries: () => ReadonlyArray<{ readonly type?: string }>): string {
  try {
    const entry = getEntries()[0];
    return entry && typeof entry.type === "string" && entry.type !== "" ? entry.type : "navigate";
  } catch {
    return "navigate";
  }
}

/** The browser seam for the reading above, so the four hosts share one spelling of it. */
export const navigationTypeNow = (): string =>
  navigationType(() =>
    (typeof performance === "undefined" ? [] : performance.getEntriesByType("navigation")) as ReadonlyArray<{ type?: string }>,
  );

/** The browser's own word for a history traversal, and what a CACHED return is even though its navigation entry still reads `navigate`, which is why a restore passes it rather than reading it. */
export const TRAVERSAL = "back_forward";

/** The precedence for a page whose ADDRESS is its content, the Portfolio: no traversal term, or a Back there would answer one way when the browser cached the page and another when it did not. */
export function folioOnArrival(
  carried: ReadonlyArray<TableItem> | null,
  stored: ReadonlyArray<TableItem> | null,
): ReadonlyArray<TableItem> {
  return carried !== null ? carried : (stored ?? []);
}

export function tableOnArrival(
  carried: ReadonlyArray<TableItem> | null,
  stored: ReadonlyArray<TableItem> | null,
  how: string,
): ReadonlyArray<TableItem> {
  if (how === TRAVERSAL && stored !== null) return stored;
  return folioOnArrival(carried, stored);
}
