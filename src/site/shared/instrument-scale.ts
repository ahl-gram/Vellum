// The strip's scale (#462 ruling 6): the survey's days on the left, the annals' years on the right, the compass star at the seam. The seam is the bar's own (SEAM_U, render/ages-track.ts) and the ages half is linear in years; the survey half's ports fall by the itinerary's schedule, so only its ends are marked, the last day ON the seam where the bar puts it.
import { SEAM_U } from "../../render/ages-track.ts";

export interface ScaleTick {
  readonly kind: "day" | "year" | "seam";
  /** 0..1 along the bar. */
  readonly u: number;
  readonly label?: string;
}

export interface ScaleInput {
  readonly days: { readonly first: number; readonly last: number } | null;
  readonly years: { readonly min: number; readonly max: number } | null;
}

const SEAM = SEAM_U;
const CENTURY = 100;

export function scaleTicks({ days, years }: ScaleInput): ScaleTick[] {
  const ticks: ScaleTick[] = [];
  if (days !== null) {
    ticks.push({ kind: "day", u: 0, label: `day ${days.first}` });
    if (days.last > days.first) ticks.push({ kind: "day", u: SEAM, label: `day ${days.last}` });
  }
  ticks.push({ kind: "seam", u: SEAM });
  if (years !== null) {
    const span = Math.max(1, years.max - years.min);
    const at = (y: number) => SEAM + (1 - SEAM) * (y - years.min) / span;
    for (let y = Math.ceil((years.min + 1) / CENTURY) * CENTURY; y < years.max; y += CENTURY) {
      ticks.push({ kind: "year", u: at(y), label: String(y) });
    }
    ticks.push({ kind: "year", u: 1, label: String(years.max) });
  }
  return ticks;
}

const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1l1.8 7.2L19 10l-7.2 1.8L10 19l-1.8-7.2L1 10l7.2-1.8z"/><path d="M10 5.5l.9 3.6 3.6.9-3.6.9-.9 3.6-.9-3.6L5.5 10l3.6-.9z" fill="currentColor" stroke="none"/></svg>';

/** Lay the ticks along the scale element by style.left; labels land via textContent, the star is the one fixed markup; the first day and the last year hug their ends, the last day stands on the seam and its label keeps left of the star. */
export function renderScale(el: HTMLElement, ticks: readonly ScaleTick[]): void {
  const pct = (u: number) => `${(u * 100).toFixed(3)}%`;
  const nodes = ticks.map((t, i) => {
    const node = document.createElement("span");
    node.style.left = pct(t.u);
    if (t.kind === "seam") {
      node.className = "seam";
      node.innerHTML = STAR;
      return node;
    }
    node.className = `tick ${t.kind}`;
    if (t.kind === "day") node.classList.add(t.u === 0 ? "first" : "last");
    if (t.kind === "year" && i === ticks.length - 1) node.classList.add("last");
    if (t.label !== undefined) {
      const label = document.createElement("span");
      label.className = "lbl";
      label.textContent = t.label;
      node.appendChild(label);
    }
    return node;
  });
  el.replaceChildren(...nodes);
}
