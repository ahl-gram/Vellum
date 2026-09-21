// The Chart Table's second home (#634, ruled 2026-09-18 and 2026-09-19, superseding #401 ruling 3): the address decides an ARRIVAL and the device decides a RETURN. Pure and DOM-free like its sibling ./table-address.ts, whose grammar it stores verbatim so the table has one spelling everywhere; the store and the browser's navigation entry are injected the way firstArrival takes its own in ../home/ceremony.ts, which is what makes the precedence provable outside a browser.
import { emitTable, parseTableValue, type TableItem } from "./table-address.ts";

export const TABLE_STORE_KEY = "vellum.table.v1";

export const deviceStorage = (): Storage => localStorage;

export function readStoredTable(getStorage: () => Storage): ReadonlyArray<TableItem> | null {
  try {
    const raw = getStorage().getItem(TABLE_STORE_KEY);
    return raw === null ? null : parseTableValue(raw);
  } catch {
    return null;
  }
}

export function writeStoredTable(getStorage: () => Storage, items: ReadonlyArray<TableItem>): void {
  try {
    const store = getStorage();
    if (items.length === 0) store.removeItem(TABLE_STORE_KEY);
    else store.setItem(TABLE_STORE_KEY, emitTable(items));
  } catch {
  }
}

export function navigationType(getEntries: () => ReadonlyArray<{ readonly type?: string }>): string {
  try {
    const entry = getEntries()[0];
    return entry && typeof entry.type === "string" && entry.type !== "" ? entry.type : "navigate"; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  } catch {
    return "navigate";
  }
}

export const navigationTypeNow = (): string =>
  navigationType(() =>
    (typeof performance === "undefined" ? [] : performance.getEntriesByType("navigation")) as ReadonlyArray<{ type?: string }>,
  );

/** The browser's own word for a history traversal, and what a CACHED return is even though its navigation entry still reads `navigate`, which is why a restore passes it rather than reading it. */
export const TRAVERSAL = "back_forward";

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
