// The Chart Table's second home (#634, ruled 2026-09-18 and 2026-09-19, superseding #401 ruling 3): the address decides an ARRIVAL and the device decides a RETURN. Pure and DOM-free like its sibling ./table-address.ts, whose grammar it stores verbatim so the table has one spelling everywhere; the store and the browser's navigation entry are injected the way firstArrival takes its own in ../home/ceremony.ts, which is what makes the precedence provable outside a browser.
import { emitTable, parseTableValue, type TableItem } from "./table-address.ts";

export const TABLE_STORE_KEY = "vellum.table.v1";

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

export function tableOnArrival(
  carried: ReadonlyArray<TableItem> | null,
  stored: ReadonlyArray<TableItem> | null,
  how: string,
): ReadonlyArray<TableItem> {
  if (how === "back_forward" && stored !== null) return stored;
  return carried !== null ? carried : (stored ?? []);
}
