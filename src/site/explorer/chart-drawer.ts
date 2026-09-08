// The Chart Table's state (#520 Sub 2 of #401): what the drawer draws and what the Explorer's address carries are the same array, so this half is pure and holds no DOM. `chart-drawer`, never `drawer`: src/site/shell/drawer.ts is the site's phone nav (#520 ruling 2).
import { TABLE_CAP, emitTable, type TableItem } from "../shared/table-address.ts";

// Two sheets are the same when every field the address carries agrees, which is exactly when they would draw the same picture: the grammar's own fields, compared on the item the grammar emits rather than on a stringified object whose key order would split one sheet in two.
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
