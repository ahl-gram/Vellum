// The Chart Table's state (#520 Sub 2 of #401): what the drawer draws and what the Explorer's address carries are the same array, so this half is pure and holds no DOM. `chart-drawer`, never `drawer`: src/site/shell/drawer.ts is the site's phone nav (#520 ruling 2).
import { TABLE_CAP, type TableItem } from "../shared/table-address.ts";

export function layOnTable(
  items: ReadonlyArray<TableItem>,
  item: TableItem,
): { readonly items: ReadonlyArray<TableItem>; readonly refused: boolean } {
  if (items.length >= TABLE_CAP) return { items, refused: true };
  return { items: [...items, item], refused: false };
}

export function takeOffTable(items: ReadonlyArray<TableItem>, seat: number): ReadonlyArray<TableItem> {
  if (!Number.isInteger(seat) || seat < 0 || seat >= items.length) return items;
  return [...items.slice(0, seat), ...items.slice(seat + 1)];
}

export function roomOnTable(items: ReadonlyArray<TableItem>): number {
  return Math.max(0, TABLE_CAP - items.length);
}
