// The Land panel's rows seated by state (Issue #854): DOM-bound at module scope by design, never imported from a unit test.
import { $ } from "../shared/by-id.ts";
import { LAND_ROWS, type LandRow, type LandSeat } from "./land-rows.ts";

const found = document.querySelector<HTMLElement>('[aria-labelledby="grp-land"] .ledger');
if (found === null) throw new Error("no Land ledger on this page");
const ledger: HTMLElement = found;
const box = $("land-held");
const note = $("land-held-note");

const rowOf = (row: LandRow): HTMLElement => {
  const el = ledger.querySelector<HTMLElement>(`.l-row[data-row="${row}"]`);
  if (el === null) throw new Error(`no Land row ${row}`);
  return el;
};

const inputsOf = (row: Element): HTMLInputElement[] => [...row.querySelectorAll<HTMLInputElement>("input")];

function lay(target: HTMLElement, els: readonly HTMLElement[], anchor: Element): void {
  let next: Element = anchor;
  for (const el of [...els].reverse()) {
    if (el.parentElement !== target || el.nextElementSibling !== next) target.insertBefore(el, next);
    next = el;
  }
}

function markHeld(row: HTMLElement, held: boolean): void {
  const readout = row.querySelector(".land-readout");
  for (const input of inputsOf(row)) {
    if (!held) {
      input.removeAttribute("aria-disabled");
      input.removeAttribute("aria-describedby");
      input.removeAttribute("data-held");
      continue;
    }
    input.setAttribute("aria-disabled", "true");
    input.setAttribute("aria-describedby", "land-held-note");
    input.dataset["held"] = input.type === "range" ? input.value : input.checked ? "1" : "0";
    if (input.type === "range") input.setAttribute("aria-valuetext", "held");
  }
  if (held && readout !== null) readout.textContent = "held";
}

export function seatLand(seat: LandSeat): void {
  const states = LAND_ROWS.map((name) => ({ el: rowOf(name), state: seat.rows[name] }));
  for (const { el, state } of states) el.hidden = state === "hidden";
  lay(
    ledger,
    states.filter((s) => s.state !== "held").map((s) => s.el),
    box,
  );
  lay(
    box,
    states.filter((s) => s.state === "held").map((s) => s.el),
    note,
  );
  note.textContent = seat.note;
  box.hidden = !states.some((s) => s.state === "held");
  for (const { el, state } of states) markHeld(el, state === "held");
}

export function fillTrack(input: HTMLInputElement): void {
  const min = Number(input.min);
  const max = Number(input.max);
  const f = max > min ? (Number(input.value) - min) / (max - min) : 0;
  input.style.setProperty("--f", String(f));
}

export function fillTracks(): void {
  for (const input of document.querySelectorAll<HTMLInputElement>('.broadside input[type="range"]')) fillTrack(input);
}

export function refuses(input: HTMLInputElement): boolean {
  const row = input.closest(".l-row");
  if (row === null || row.closest(".held") === null) return false;
  for (const each of inputsOf(row)) {
    if (each.type === "range") {
      each.value = each.dataset["held"] ?? each.value;
      fillTrack(each);
    } else each.checked = each.dataset["held"] === "1";
  }
  return true;
}
