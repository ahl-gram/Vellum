import type { IndexSection } from "../../layouts/room-sections.ts";
import { LADDERS, nameIn, ROUTE_TREE, seated, type RouteTree, type Seated } from "../shared/primer/ladders.ts";
import { MARKS } from "../shared/primer/hand-words.ts";
import { stepAddress } from "../shared/primer/hand-steps.ts";
import { segmentsOf, type Segment } from "../shared/primer/segments.ts";
import type { Ladder, Step } from "../shared/primer/shape.ts";
import { CLOSING_HEAD, datelineOf, ENTERED, OF, OPENS } from "./words.ts";

export interface PageStep {
  readonly id: string;
  readonly n: number;
  readonly act: readonly Segment[];
  readonly see: string;
  readonly href: string;
  readonly opens: string;
  readonly only?: "touch" | "motion";
  readonly marks: readonly { readonly text: string; readonly comm: boolean }[];
  readonly commission: boolean;
}

export interface PageLesson {
  readonly id: string;
  readonly numeral: string;
  readonly title: string;
  readonly gloss: string;
  readonly aside?: string;
  readonly steps: readonly PageStep[];
}

export interface PageRoom {
  readonly id: string;
  readonly route: string;
  readonly name: string;
  readonly of?: string;
  readonly what: string;
  readonly entered?: string;
  readonly lessons: readonly PageLesson[];
  readonly next?: { readonly id: string; readonly name: string };
}

export interface PrimerPage {
  readonly rooms: readonly PageRoom[];
  readonly index: readonly IndexSection[];
  readonly dateline: string;
}

export const AFTERWARD = "afterward";
const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"] as const;

export const roomIdOf = (route: string): string =>
  route
    .split("/")
    .filter((p) => p !== "")
    .join("-");

export const tryItHref = (step: Step): string => `..${stepAddress(step.id, step.at)}`;

const lowerThe = (name: string): string => (name.startsWith("The ") ? `the ${name.slice(4)}` : name);

const marksOf = (step: Step): PageStep["marks"] => [
  ...(step.only === "touch" ? [{ text: MARKS.touch, comm: false }] : []),
  ...(step.only === "motion" ? [{ text: MARKS.motion, comm: false }] : []),
  ...(step.kind === "commission" ? [{ text: MARKS.commission, comm: true }] : []),
  ...(step.kind === "play" ? [{ text: MARKS.play, comm: false }] : []),
];

const stepCount = (l: Ladder): number => l.lessons.reduce((n, lesson) => n + lesson.steps.length, 0);

export function primerPage(ladders: readonly Ladder[] = LADDERS, tree: RouteTree = ROUTE_TREE): PrimerPage {
  const flat: { s: Seated; seat: string | null }[] = seated(ladders, tree).flatMap((s) => [
    { s, seat: null },
    ...s.under.map((u) => ({ s: u, seat: s.ladder.route })),
  ]);
  const rooms: PageRoom[] = flat.map(({ s, seat }, i) => {
    const id = roomIdOf(s.ladder.route);
    let n = 0;
    const after = flat[i + 1];
    return {
      id,
      route: s.ladder.route,
      name: s.name,
      ...(seat === null ? {} : { of: OF(lowerThe(nameIn(tree, seat))) }),
      what: s.ladder.what,
      ...(s.ladder.entered === undefined ? {} : { entered: ENTERED(s.ladder.entered) }),
      lessons: s.ladder.lessons.map((lesson, k) => ({
        id: `${id}-${lesson.id}`,
        numeral: NUMERALS[k] ?? String(k + 1),
        title: lesson.title,
        gloss: lesson.gloss,
        ...(lesson.aside === undefined ? {} : { aside: lesson.aside }),
        steps: lesson.steps.map((step) => ({
          id: step.id,
          n: ++n,
          act: segmentsOf(step),
          see: step.see,
          href: tryItHref(step),
          opens: OPENS(lowerThe(nameIn(tree, step.at.split(/[?#]/)[0]!))),
          ...(step.only === undefined ? {} : { only: step.only }),
          marks: marksOf(step),
          commission: step.kind === "commission",
        })),
      })),
      ...(after === undefined ? {} : { next: { id: roomIdOf(after.s.ladder.route), name: after.s.name } }),
    };
  });
  const index: IndexSection[] = [
    ...flat.map(({ s, seat }, i) => ({
      id: rooms[i]!.id,
      title: s.name,
      entries: rooms[i]!.lessons.map((l) => ({ id: l.id, text: `${l.numeral} · ${l.title}` })),
      count: stepCount(s.ladder),
      ...(seat === null ? {} : { tone: "sub" as const }),
    })),
    { id: AFTERWARD, title: CLOSING_HEAD, entries: [], count: null, tone: "lean" as const },
  ];
  const steps = flat.reduce((n, { s }) => n + stepCount(s.ladder), 0);
  return { rooms, index, dateline: datelineOf(steps, flat.length) };
}
