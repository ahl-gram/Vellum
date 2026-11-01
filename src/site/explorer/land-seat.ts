// The Broadside's land and strand rows seated by state (Issue #854, Issue #1159): DOM-bound at module scope by design, never imported from a unit test.
import { $ } from "../shared/by-id.ts";
import { GROUP_OF, LAND_ROWS, WRITE_ANEW, type Group, type LandRow, type LandSeat } from "./land-rows.ts";

type Panel = { readonly ledger: HTMLElement; readonly box: HTMLElement; readonly note: HTMLElement };

function panelOf(g: Group): Panel {
  const ledger = document.querySelector<HTMLElement>(`[aria-labelledby="grp-${g}"] .ledger`);
  if (ledger === null) throw new Error(`no ${g} ledger on this page`);
  return { ledger, box: $(`${g}-held`), note: $(`${g}-held-note`) };
}

const PANELS: Readonly<Record<Group, Panel>> = { land: panelOf("land"), strand: panelOf("strand") };
const GROUPS: readonly Group[] = ["land", "strand"];

const rowOf = (row: LandRow): HTMLElement => {
  const el = PANELS[GROUP_OF[row]].ledger.querySelector<HTMLElement>(`.l-row[data-row="${row}"]`);
  if (el === null) throw new Error(`no Broadside row ${row}`);
  return el;
};

type Held = HTMLInputElement | HTMLSelectElement;

const inputsOf = (row: Element): Held[] => [...row.querySelectorAll<Held>("input, select")];

const keepsValue = (el: Held): boolean =>
  el instanceof HTMLSelectElement || el.type === "range" || el.type === "search";

function lay(target: HTMLElement, els: readonly HTMLElement[], anchor: Element): void {
  let next: Element = anchor;
  for (const el of [...els].reverse()) {
    if (el.parentElement !== target || el.nextElementSibling !== next) target.insertBefore(el, next);
    next = el;
  }
}

function markHeld(row: HTMLElement, held: boolean, describedBy: string): void {
  const readout = row.querySelector(".land-readout");
  for (const input of inputsOf(row)) {
    if (!held) {
      input.removeAttribute("aria-disabled");
      input.removeAttribute("aria-describedby");
      input.removeAttribute("data-held");
      continue;
    }
    input.setAttribute("aria-disabled", "true");
    input.setAttribute("aria-describedby", describedBy);
    input.dataset["held"] =
      input instanceof HTMLInputElement && !keepsValue(input) ? (input.checked ? "1" : "0") : input.value;
    if (input instanceof HTMLInputElement && input.type === "range") input.setAttribute("aria-valuetext", "held");
  }
  if (held && readout !== null) readout.textContent = "held";
}

function noteOf(text: string, road: string | undefined): Array<string | HTMLElement> {
  if (road === undefined) return [text];
  const a = document.createElement("a");
  a.id = "land-held-road";
  a.href = road;
  a.textContent = WRITE_ANEW;
  return [text + " ", a];
}

export function seatLand(seat: LandSeat): void {
  const states = LAND_ROWS.map((name) => ({ el: rowOf(name), state: seat.rows[name], group: GROUP_OF[name] }));
  for (const { el, state } of states) el.hidden = state === "hidden";
  for (const g of GROUPS) {
    const { ledger, box, note } = PANELS[g];
    const mine = states.filter((s) => s.group === g);
    lay(
      ledger,
      mine.filter((s) => s.state !== "held").map((s) => s.el),
      box,
    );
    lay(
      box,
      mine.filter((s) => s.state === "held").map((s) => s.el),
      note,
    );
    note.replaceChildren(...noteOf(seat.notes[g], g === "strand" ? seat.road : undefined));
    note.hidden = seat.notes[g] === "";
    box.hidden = !mine.some((s) => s.state === "held");
  }
  for (const { el, state, group } of states) {
    const note = seat.notes[group] === "" ? "strand-held-note" : `${group}-held-note`;
    markHeld(el, state === "held", note);
  }
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

export function holdValue(input: Held): void {
  const row = input.closest(".l-row");
  if (row === null || row.closest(".held") === null) return;
  for (const each of inputsOf(row)) if (keepsValue(each)) each.dataset["held"] = each.value;
}

export function refuses(input: Held): boolean {
  const row = input.closest(".l-row");
  if (row === null || row.closest(".held") === null) return false;
  for (const each of inputsOf(row)) {
    if (keepsValue(each)) {
      each.value = each.dataset["held"] ?? each.value;
      if (each instanceof HTMLInputElement && each.type === "range") fillTrack(each);
    } else if (each instanceof HTMLInputElement) each.checked = each.dataset["held"] === "1";
  }
  return true;
}
