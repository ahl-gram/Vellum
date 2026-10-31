// The shape box's list: its rows with each place's outline drawn beside its name, the lit row, and the popover's seat (Issue #854). DOM only.
import type { PlaceId } from "../../world/outline-ids.ts";
import { NO_SUCH_PLACE, moreWords, type PlaceHit, type PlaceList } from "./place-match.ts";
import type { PlaceText } from "./place-source.ts";

const SVG = "http://www.w3.org/2000/svg";
const VISIBLE_ROWS = 6;
const EDGE = 8;
const GAP = 4;

function named(hit: PlaceHit): HTMLElement {
  const name = document.createElement("span");
  name.className = "pl-name";
  if (hit.mark === null) {
    name.textContent = hit.name;
    return name;
  }
  const mark = document.createElement("mark");
  mark.textContent = hit.name.slice(hit.mark[0], hit.mark[1]);
  name.append(hit.name.slice(0, hit.mark[0]), mark, hit.name.slice(hit.mark[1]));
  return name;
}

function rowOf(hit: PlaceHit, index: number, outline: (id: PlaceId) => Promise<PlaceText>): HTMLLIElement {
  const li = document.createElement("li");
  li.id = `place-opt-${index}`;
  li.setAttribute("role", "option");
  li.setAttribute("aria-selected", "false");
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "pl-sil");
  svg.setAttribute("viewBox", "0 0 1000 1000");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  const text = document.createElement("span");
  text.className = "pl-text";
  const sub = document.createElement("span");
  sub.className = "pl-sub";
  sub.textContent = hit.sub;
  text.append(named(hit), sub);
  li.append(svg, text);
  outline(hit.id).then(
    (place) => {
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("d", place.text);
      path.setAttribute("fill-rule", "evenodd");
      svg.appendChild(path);
    },
    () => {},
  );
  return li;
}

export function renderList(
  options: HTMLUListElement,
  foot: HTMLElement,
  list: PlaceList,
  outline: (id: PlaceId) => Promise<PlaceText>,
): void {
  options.replaceChildren(...list.hits.map((hit, i) => rowOf(hit, i, outline)));
  const none = list.hits.length === 0;
  Object.assign(foot, {
    hidden: !none && list.more === 0,
    className: none ? "pl-foot none" : "pl-foot",
    textContent: none ? NO_SUCH_PLACE : list.more > 0 ? moreWords(list.more) : "",
  });
}

export function lightRow(options: HTMLUListElement, box: HTMLInputElement, index: number): void {
  const rows = [...options.children];
  rows.forEach((row, i) => row.setAttribute("aria-selected", String(i === index)));
  const lit = rows[index];
  if (lit === undefined) return;
  box.setAttribute("aria-activedescendant", lit.id);
  lit.scrollIntoView({ block: "nearest" });
}

const px = (n: number): string => `${n}px`;

export function seatList(panel: HTMLElement, options: HTMLUListElement, box: HTMLElement, ledger: HTMLElement): void {
  const cap = (height: string): void => {
    options.style.setProperty("max-height", height);
  };
  cap("");
  const sixth = options.children[VISIBLE_ROWS - 1];
  if (options.children.length > VISIBLE_ROWS && sixth !== undefined)
    cap(px(sixth.getBoundingClientRect().bottom - options.getBoundingClientRect().top));
  const lane = ledger.getBoundingClientRect();
  panel.style.setProperty("left", px(lane.left));
  panel.style.setProperty("width", px(lane.width));
  const field = box.getBoundingClientRect();
  const below = innerHeight - EDGE - (field.bottom + GAP);
  const above = field.top - GAP - EDGE;
  const h = panel.getBoundingClientRect().height;
  const up = h > below && (h <= above || above > below);
  const side = up ? above : below;
  if (h > side) cap(px(options.getBoundingClientRect().height - (h - side)));
  const top = up ? field.top - GAP - panel.getBoundingClientRect().height : field.bottom + GAP;
  panel.style.setProperty("top", px(top));
  panel.setAttribute("data-flipped", up ? "up" : "down");
}
