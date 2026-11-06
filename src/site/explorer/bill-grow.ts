// The Broadside measured and spread on every room layout, every change of seat and every camera depth (Issue #1260): DOM-bound at module scope by design, never imported from a unit test.
import { $ } from "../shared/by-id.ts";
import { pageBox } from "../shared/page-box.ts";
import {
  NO_SPREAD,
  closedAt,
  rowGapsOf,
  spreadOf,
  type BillRoom,
  type BillSpread,
  type Ledger,
} from "./bill-spread.ts";

const bill = $("broadside");
const part = <T extends Element>(selector: string, name: string): T => {
  const el = bill.querySelector<T>(selector);
  if (el === null) throw new Error(`no Broadside ${name} on this page`);
  return el;
};
const body = part<HTMLElement>(".slip-body", "body");
const flower = part<SVGSVGElement>(".bill-flower", "flower");

const PROPS = { row: "--bill-row", group: "--bill-group", head: "--bill-head", paper: "--bill-paper" } as const;

type Measured = Omit<BillRoom, "closed"> & { readonly need: number };
let measured: Measured | null = null;
let closed = 0;

function write(s: BillSpread, need: number): void {
  for (const key of Object.keys(PROPS) as (keyof typeof PROPS)[]) bill.style.setProperty(PROPS[key], `${s[key]}px`);
  bill.classList.toggle("flowered", s.paper >= need);
}

function ledgersOf(): Ledger[] {
  return [...bill.querySelectorAll<HTMLElement>(".broadside .ledger")].map((l) => ({
    tracks: getComputedStyle(l).gridTemplateRows.split(" ").filter(Boolean).length,
    held: [...l.querySelectorAll<HTMLElement>(":scope > .held")]
      .filter((h) => !h.hidden)
      .map((h) => h.querySelectorAll(":scope > .l-row:not([hidden])").length),
  }));
}

function measure(): Measured | null {
  write(NO_SPREAD, Infinity);
  const room = parseFloat(bill.style.maxHeight);
  if (!Number.isFinite(room)) return null;
  const natural =
    body.scrollHeight > body.clientHeight
      ? bill.offsetHeight - body.clientHeight + body.scrollHeight
      : bill.getBoundingClientRect().height;
  return {
    natural,
    room,
    page: pageBox().h,
    width: bill.offsetWidth,
    rows: rowGapsOf(ledgersOf()),
    groups: bill.querySelectorAll(".broadside > .panel").length,
    need: 2 * flower.getBoundingClientRect().height,
  };
}

export function growBill(): void {
  measured = measure();
  write(measured === null ? NO_SPREAD : spreadOf({ ...measured, closed }), measured?.need ?? Infinity);
}

export function zoomBill(k: number): void {
  const next = closedAt(k);
  if (next === closed) return;
  closed = next;
  if (measured !== null) write(spreadOf({ ...measured, closed }), measured.need);
}
