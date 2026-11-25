// Issue #1256 round: the seal states the stills are drawn at, each a set of the real step ids the pointing hand writes under `PRIMER_STORE_KEY` (`src/site/shared/primer/seals.ts`), and the room the page opens on for it, read through the page's own `roomOnArrival` on a desktop with motion on.
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import { PRIMER_STORE_KEY, emitSeals, parseSeals } from "../../../src/site/shared/primer/seals.ts";
import { primerPage } from "../../../src/site/primer/page.ts";
import { roomOnArrival, type ArrivalRoom } from "../../../src/site/primer/arrival.ts";
import type { Device } from "../../../src/site/shared/primer/hand-steps.ts";

export const DESKTOP: Device = { touch: false, motion: true };

const ladder = (route: string) => {
  const l = LADDERS.find((x) => x.route === route);
  if (l === undefined) throw new Error(`no ladder for ${route}`);
  return l;
};
const lessonSteps = (route: string, lesson: string): readonly string[] => {
  const l = ladder(route).lessons.find((x) => x.id === lesson);
  if (l === undefined) throw new Error(`no lesson ${lesson} in ${route}`);
  return l.steps.map((s) => s.id);
};
const firstOf = (route: string, lesson: string, n: number): readonly string[] => lessonSteps(route, lesson).slice(0, n);
const roomSteps = (route: string): readonly string[] => ladder(route).lessons.flatMap((l) => l.steps.map((s) => s.id));

export interface SealState {
  readonly key: string;
  readonly caption: string;
  readonly sealed: ReadonlySet<string>;
}

const asState = (key: string, caption: string, ids: readonly string[]): SealState => {
  const sealed = parseSeals(emitSeals(ids));
  if (sealed.size !== ids.length) throw new Error(`${key}: a step id was refused or repeated`);
  return { key, caption, sealed };
};

// A reader partway along the Explorer's ladder who did its Glass on a desktop (every Glass step but the tablet one) and wandered: the Prospect from a place card, both Gallery steps, and two of Today's.
export const RETURNER = asState(
  "returner",
  "a returner: the Explorer's lessons i to iv, its Glass (v) but the tablet step, two of vi's four, the Prospect, the Gallery, and two of Today's five",
  [
    ...lessonSteps("/explorer/", "number"),
    ...lessonSteps("/explorer/", "land"),
    ...lessonSteps("/explorer/", "strand"),
    ...lessonSteps("/explorer/", "hand"),
    ...lessonSteps("/explorer/", "glass").filter((id) => id !== "explorer-in-hand"),
    ...firstOf("/explorer/", "places", 2),
    ...roomSteps("/prospect/"),
    ...roomSteps("/gallery/"),
    ...firstOf("/seed-of-the-day/", "hunt", 2),
  ],
);

export const FIRST_VISIT = asState("first", "a first visit: nothing sealed", []);

export const STATES: readonly SealState[] = [FIRST_VISIT, RETURNER];

export const storeScript = (state: SealState): string =>
  state.sealed.size === 0
    ? `localStorage.removeItem(${JSON.stringify(PRIMER_STORE_KEY)})`
    : `localStorage.setItem(${JSON.stringify(PRIMER_STORE_KEY)}, ${JSON.stringify(emitSeals(state.sealed))})`;

export function openOn(state: SealState): string {
  const page = primerPage();
  const rooms: ArrivalRoom[] = page.rooms.map((r) => ({
    id: r.id,
    steps: r.lessons.flatMap((l) => l.steps.map((s) => (s.only === undefined ? { id: s.id } : { id: s.id, only: s.only }))),
  }));
  const id = roomOnArrival(rooms, null, state.sealed, DESKTOP);
  if (id === null) throw new Error("the page has no rooms");
  return id;
}

export const totalSteps = (): number => LADDERS.reduce((n, l) => n + l.lessons.reduce((k, x) => k + x.steps.length, 0), 0);
