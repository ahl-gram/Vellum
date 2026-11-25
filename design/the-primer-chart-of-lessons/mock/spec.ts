// Issue #1256 round: every still, by question and option. Each answer is drawn against my recommendation for every other question (`BASE`), so a still changes one thing; the folder, the file name and the caption are what the notes and the menu cite.
import { DESKTOP, FIRST_VISIT, RETURNER, openOn, type SealState } from "./states.ts";
import { roomOfId, type ChartOptions } from "./chart.ts";
import type { Seat } from "./inject.ts";
import { ROUTE_NAMES } from "../../../src/layouts/nav.ts";

export type Crop = "chart" | "slip" | "explorer" | "fold" | "head";

export interface Still {
  readonly folder: string;
  readonly file: string;
  readonly width: number;
  readonly state: SealState;
  readonly seat: Seat;
  readonly opts: Partial<ChartOptions>;
  readonly caption: string;
  readonly crop?: Crop;
  readonly after?: string;
  readonly hypothetical?: boolean;
}

export const BASE = (state: SealState): ChartOptions => ({
  grain: "lesson",
  ink: "roads",
  device: "here",
  marks: "hand",
  names: "rooms",
  others: "pale",
  sealed: state.sealed,
  open: roomOfId(openOn(state)),
  now: DESKTOP,
  label: 12,
  links: true,
});

export const Q = {
  x: "x-context",
  q1: "q1-where-the-chart-stands",
  q2: "q2-what-stands-for-a-lesson",
  q3: "q3-what-the-seals-ink",
  q4: "q4-a-lesson-with-a-tablet-step",
  q5: "q5-how-it-marks-your-place",
  q6: "q6-the-other-places-and-their-names",
  q7: "q7-the-words",
} as const;

export const ONE_STEP = (step: string): string => `(() => {
  const open = document.querySelector(".primer section.room:not(.folded)");
  const step = document.getElementById(${JSON.stringify(step)});
  const lesson = step.closest("section.lesson");
  document.querySelector(".primer .opening").style.display = "none";
  document.querySelector(".primer .closing").style.display = "none";
  for (const r of document.querySelectorAll(".primer section.room")) if (r !== open) r.style.display = "none";
  for (const l of open.querySelectorAll("section.lesson")) if (l !== lesson) l.style.display = "none";
  for (const li of lesson.querySelectorAll("li.step")) if (li !== step) li.style.display = "none";
  for (const el of open.querySelectorAll("p.what, p.next")) el.style.display = "none";
  return "one step";
})()`;

export const OPEN_HEAD_CHART = `(() => { document.querySelector(".atelier-fold").open = true; return "open"; })()`;

const both = (s: Omit<Still, "width" | "file"> & { readonly name: string }): readonly Still[] =>
  [1280, 1024].map((width) => ({ ...s, width, file: `${s.name}-${width}.png` }));

const R = RETURNER;
const F = FIRST_VISIT;
const seals = `The returner's seals (${R.sealed.size} of 81 steps; the page opens on ${ROUTE_NAMES[roomOfId(openOn(R))] ?? openOn(R)})`;

export const STILLS: readonly Still[] = [
  ...both({ folder: Q.x, name: "x-today-first-visit", state: F, seat: "none", opts: {}, caption: "Today's Primer, the control: a first visit, nothing sealed" }),
  ...both({ folder: Q.x, name: "x-today-returner", state: R, seat: "none", opts: {}, caption: `Today's Primer, the control, at the seals every still is drawn at. ${seals}` }),
  { folder: Q.x, file: "x-today-head-chart-open-1280.png", width: 1280, state: R, seat: "none", opts: {}, after: OPEN_HEAD_CHART, caption: "Today's Primer with the chart of the atelier opened from the head: its own 'you are here' stands on the Primer's isle" },

  ...both({ folder: Q.q1, name: "q1-a-at-the-head-of-the-page", state: R, seat: "head", opts: {}, caption: `A: the chart opens the page, drawn across the sheet above the opening words. ${seals}` }),
  { folder: Q.q1, file: "q1-a-at-the-head-of-the-page-1280-2x.png", width: 1280, state: R, seat: "head", opts: {}, crop: "chart", caption: "A, the chart at twice the size" },
  { folder: Q.q1, file: "q1-a-at-the-head-of-the-page-first-visit-1280.png", width: 1280, state: F, seat: "head", opts: {}, caption: "A on a first visit: nothing sealed, the hand on the Explorer's first lesson" },
  { folder: Q.q1, file: "q1-a-at-the-head-of-the-page-one-step-1280.png", width: 1280, state: R, seat: "head", opts: {}, after: ONE_STEP("explorer-take-road"), hypothetical: true, caption: "A on a page that shows one step at a time (Issue #1392, NOT ruled, drawn only to show how the seat would read there)" },
  ...both({ folder: Q.q1, name: "q1-b-in-the-index-slip", state: R, seat: "slip", opts: { label: 0, others: "none" }, caption: "B: a small chart at the head of the index slip, with no names: the slip's own list under it names the rooms" }),
  { folder: Q.q1, file: "q1-b-in-the-index-slip-1280-2x.png", width: 1280, state: R, seat: "slip", opts: { label: 0, others: "none" }, crop: "slip", caption: "B, the slip at twice the size" },
  { folder: Q.q1, file: "q1-b-in-the-index-slip-one-step-1280.png", width: 1280, state: R, seat: "slip", opts: { label: 0, others: "none" }, after: ONE_STEP("explorer-take-road"), hypothetical: true, caption: "B on a page that shows one step at a time (Issue #1392, NOT ruled)" },
  ...both({ folder: Q.q1, name: "q1-c-behind-a-press", state: R, seat: "fold", opts: {}, caption: "C: a press under the room's name opens the chart over the page, in the dark dress of the chart of the atelier, the open room's card beside it" }),
  { folder: Q.q1, file: "q1-c-behind-a-press-shut-1280.png", width: 1280, state: R, seat: "fold-shut", opts: {}, caption: "C with the chart put away: the page as today, with one press under the room's name" },
  ...both({ folder: Q.q1, name: "q1-d-at-the-head-with-a-card", state: R, seat: "head-card", opts: {}, caption: "D: as A, with the open room's card laid on the chart, as the first round's stand-in did" }),

  ...both({ folder: Q.q2, name: "q2-a-a-waypoint-for-each-lesson", state: R, seat: "head", opts: {}, crop: "chart", caption: "A: a numbered waypoint for each lesson, ringed round its room; a room of one lesson wears it on its own place" }),
  ...both({ folder: Q.q2, name: "q2-b-a-ring-of-steps-round-each-room", state: R, seat: "head", opts: { grain: "steps" }, crop: "chart", caption: "B: a ring round each room, one mark for each step, its lessons parted by a gap" }),

  ...both({ folder: Q.q3, name: "q3-a-the-roads-you-have-taken", state: R, seat: "head", opts: {}, crop: "chart", caption: "A: the road from home to every room with a seal is inked as well; The Seed of the Day and the Gallery have no road, so they ink alone" }),
  ...both({ folder: Q.q3, name: "q3-b-the-lessons-alone", state: R, seat: "head", opts: { ink: "lessons" }, crop: "chart", caption: "B: the seals ink the lessons alone; the roads stay as the chart of the atelier draws them" }),
  ...both({ folder: Q.q3, name: "q3-c-the-primers-own-route", state: R, seat: "head", opts: { ink: "route" }, crop: "chart", caption: "C: a dotted route of the chart's own through the rooms in the page's order, each leg inked when its room has a seal" }),

  ...both({ folder: Q.q4, name: "q4-a-done-when-what-can-be-done-here-is-done", state: R, seat: "head", opts: {}, crop: "explorer", caption: "A: the Glass (v) reads done on a desktop: every step that can be done here is sealed" }),
  ...both({ folder: Q.q4, name: "q4-b-done-only-when-every-step-is", state: R, seat: "head", opts: { device: "every" }, crop: "explorer", caption: "B: the Glass (v) stays begun on a desktop, since its tablet step can never be sealed there" }),
  { folder: Q.q4, file: "q4-a-the-card-1280.png", width: 1280, state: R, seat: "fold", opts: {}, crop: "fold", caption: "Either way the card says why: 'one on a tablet' under the Glass" },

  ...both({ folder: Q.q5, name: "q5-a-the-room-lit-and-the-hand", state: R, seat: "head", opts: {}, crop: "explorer", caption: "A: the open room lit gold, as the slip inks it, and the house's pointing hand on the next lesson" }),
  ...both({ folder: Q.q5, name: "q5-b-you-are-here", state: R, seat: "head", opts: { marks: "here" }, crop: "explorer", caption: "B: 'you are here' under the open room, in the chart of the atelier's own pin" }),

  ...both({ folder: Q.q6, name: "q6-a-every-place-in-the-rooms-own-names", state: R, seat: "head", opts: {}, crop: "chart", caption: "A: every place of the chart of the atelier, those with no lessons drawn pale, named as the slip and the page name them (The Seed of the Day, The Wayfarer's Ribbon, Questions & Answers)" }),
  ...both({ folder: Q.q6, name: "q6-b-every-place-in-the-head-charts-names", state: R, seat: "head", opts: { names: "chart" }, crop: "chart", caption: "B: the same places, named as the chart of the atelier in the head names them (Today, The Ribbon, Q & A)" }),
  ...both({ folder: Q.q6, name: "q6-c-only-the-rooms-with-lessons", state: R, seat: "head", opts: { others: "none" }, crop: "chart", caption: "C: only home and the rooms with lessons; the Atlas, the Primer's own isle, Questions & Answers and the Glossary leave the chart" }),

  ...([1280, 1024] as const).flatMap((width) => [
    { folder: Q.q7, file: `q7-the-words-under-the-chart-${width}.png`, width, state: R, seat: "head" as const, opts: {}, crop: "head" as const, caption: "The chart's stand-in words: its title and the key line under it" },
    { folder: Q.q7, file: `q7-the-words-on-the-card-${width}.png`, width, state: R, seat: "fold" as const, opts: {}, crop: "fold" as const, caption: "The stand-in words on the press, the card and the panel's key line (seats C and D)" },
  ]),
];
