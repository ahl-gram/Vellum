import type { IndexSection } from "../../layouts/room-sections.ts";
import { LADDERS, nameIn, ROUTE_TREE, seated, type RouteTree, type Seated } from "../shared/primer/ladders.ts";
import type { Ladder, Step, Words } from "../shared/primer/shape.ts";
import { CLOSING_HEAD, datelineOf, ENTERED, MARKS, OF, OPENS } from "./words.ts";

export type Chip = "road" | "opt" | "glyph" | "word" | "btn";
export type Segment =
  | { readonly text: string }
  | { readonly chip: Chip; readonly text: string; readonly verb?: string; readonly place?: string };

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

export function tryItHref(step: Step): string {
  const cut = step.at.indexOf("#");
  const path = cut === -1 ? step.at : step.at.slice(0, cut);
  const hash = cut === -1 ? "" : step.at.slice(cut);
  if (!path.startsWith("/")) throw new Error(`${step.id}'s address is not root-absolute: ${step.at}`);
  return `..${path}${path.includes("?") ? "&" : "?"}step=${step.id}${hash}`;
}

const lowerThe = (name: string): string => (name.startsWith("The ") ? `the ${name.slice(4)}` : name);

const chipOf = (w: Words | undefined, text: string): Segment => {
  if (w?.read === "road") {
    const cut = text.lastIndexOf(" The ");
    return cut === -1
      ? { chip: "road", text, verb: text, place: "" }
      : { chip: "road", text, verb: text.slice(0, cut), place: text.slice(cut + 1) };
  }
  if (w?.read === "option") return { chip: "opt", text };
  if (/^[☀-⟿]$/u.test(text)) return { chip: "glyph", text };
  if (
    w !== undefined &&
    (w.css.includes(".land-end") || w.css.startsWith("label[") || w.read === "label" || w.css === "#sizes-label")
  )
    return { chip: "word", text };
  return { chip: "btn", text };
};

export function segmentsOf(step: Step): readonly Segment[] {
  const out: Segment[] = [];
  let at = 0;
  for (const m of step.act.matchAll(/\{([^{}]+)\}/g)) {
    if (m.index > at) out.push({ text: step.act.slice(at, m.index) });
    const phrase = m[1] ?? "";
    out.push(
      chipOf(
        step.words.find((w) => w.says === phrase || (w.match !== undefined && phrase.startsWith(w.says))),
        phrase,
      ),
    );
    at = m.index + m[0].length;
  }
  if (at < step.act.length) out.push({ text: step.act.slice(at) });
  return out;
}

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
          opens: OPENS(lowerThe(nameIn(tree, `${step.at.split(/[?#]/)[0]}`))),
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
