// The shape box, a combobox over the served name index (Issue #854): DOM-bound at module scope by design, never imported from a unit test.
import { $ } from "../shared/by-id.ts";
import { isFormId, type OutlineId } from "../../world/outline-ids.ts";
import { nextChoice } from "./land-rows.ts";
import { lightRow, renderList, seatList } from "./place-list.ts";
import { createMatcher, nameOf, type NameRow, type PlaceHit, type PlaceList } from "./place-match.ts";
import { createNameLoader } from "./place-names.ts";
import { chooseShape, shapeChoice } from "./shape-choice.ts";
import { loadPlace } from "./worker-client.ts";

const box = $<HTMLInputElement>("place");
const panel = $("place-list");
const options = $<HTMLUListElement>("place-options");
const foot = $("place-foot");
const ledger = box.closest<HTMLElement>(".ledger") as HTMLElement;
const slipBody = document.querySelector("#broadside .slip-body");

const names = createNameLoader((url) => fetch(url));
let built: { rows: ReadonlyArray<NameRow>; match: (query: string) => PlaceList } | null = null;
let hits: ReadonlyArray<PlaceHit> = [];
let lit = 0;
let edited = false;

const ready = (): Promise<NonNullable<typeof built>> =>
  names().then((rows) => {
    if (built === null || built.rows !== rows) built = { rows, match: createMatcher(rows) };
    return built;
  });

const isOpen = (): boolean => panel.matches(":popover-open");

function closeList(): void {
  if (isOpen()) panel.hidePopover();
  box.setAttribute("aria-expanded", "false");
  box.removeAttribute("aria-activedescendant");
}

function writeBack(id: OutlineId | undefined): void {
  edited = false;
  if (id === undefined) {
    box.value = "";
    return;
  }
  if (isFormId(id)) {
    box.value = id;
    return;
  }
  const settle = (value: string): void => {
    if (shapeChoice().outline === id) box.value = value;
  };
  ready().then(
    ({ rows }) => {
      settle(nameOf(rows, id) ?? id);
    },
    () => {
      settle(id);
    },
  );
}

export function showPlace(id: OutlineId | undefined): void {
  if (document.activeElement !== box) writeBack(id);
}

function openList(list: PlaceList): void {
  renderList(options, foot, list, loadPlace);
  hits = list.hits;
  lit = 0;
  if (!isOpen()) panel.showPopover();
  seatList(panel, options, box, ledger);
  box.setAttribute("aria-expanded", "true");
  if (hits.length > 0) lightRow(options, box, lit);
  else box.removeAttribute("aria-activedescendant");
}

let redraw: () => void = () => {};

function pick(hit: PlaceHit): void {
  box.value = hit.name;
  edited = false;
  closeList();
  chooseShape(nextChoice(shapeChoice(), { kind: "place", id: hit.id }));
  redraw();
}

function clear(): void {
  box.value = "";
  edited = false;
  closeList();
  chooseShape(nextChoice(shapeChoice(), { kind: "place", id: null }));
  redraw();
}

function onInput(): void {
  edited = true;
  if (box.value.trim() === "") {
    closeList();
    return;
  }
  ready().then(
    ({ match }) => {
      if (document.activeElement !== box) return;
      if (box.value.trim() === "") closeList();
      else openList(match(box.value));
    },
    () => {},
  );
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (hits.length === 0) return;
    lit = Math.max(0, Math.min(hits.length - 1, lit + (e.key === "ArrowDown" ? 1 : -1)));
    lightRow(options, box, lit);
    e.preventDefault();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const hit = hits[lit];
    if (isOpen() && hit !== undefined) pick(hit);
    else if (box.value.trim() === "" && shapeChoice().outline !== undefined) clear();
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeList();
    writeBack(shapeChoice().outline);
  }
}

function onBlur(): void {
  closeList();
  if (edited && box.value.trim() === "" && shapeChoice().outline !== undefined) clear();
  else writeBack(shapeChoice().outline);
}

function onOptionClick(e: MouseEvent): void {
  const row = e.target instanceof Element ? e.target.closest("li") : null;
  const hit = row === null ? undefined : hits[[...options.children].indexOf(row)];
  if (hit !== undefined) pick(hit);
}

export function wirePlacePicker(draw: () => void): void {
  redraw = draw;
  box.addEventListener("focus", () => {
    ready().catch(() => {});
  });
  box.addEventListener("input", onInput);
  box.addEventListener("keydown", onKeydown);
  box.addEventListener("blur", onBlur);
  options.addEventListener("pointerdown", (e) => {
    e.preventDefault();
  });
  options.addEventListener("click", onOptionClick);
  slipBody?.addEventListener("scroll", closeList);
  window.addEventListener("resize", closeList);
}
