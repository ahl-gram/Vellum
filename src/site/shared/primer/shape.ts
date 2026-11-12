import { ROUTE_NAMES } from "../../../layouts/nav.ts";

// How a control's words are read: text, its own text; aria, its aria-label; label, the text of the label it sits in; option, a list offering an option in these words; road, a road press's verb and room joined by a space; attr, the attribute attr names; title and placeholder, those attributes; match starts or contains loosens the match; state held is a control standing in the held box, hidden one in the page but not shown until the step's own condition.
export interface Words {
  readonly css: string;
  readonly says: string;
  readonly read: "text" | "aria" | "label" | "option" | "road" | "attr" | "title" | "placeholder";
  readonly attr?: string;
  readonly match?: "starts" | "contains";
  readonly state?: "held" | "hidden";
}

export interface Spot {
  readonly x: number;
  readonly y: number;
}

// What the reader does, as a driver performs it and never by a wait on the clock: a press, a key and a typed box with real input, and a slider's or a list's value set in the page with the events a reader's change sends (Issue #1250, ruling D); set on a slider commits the value as a reader letting go does and with release false leaves it uncommitted, while set on a box only types the value and never commits it, so the act after it does (a press, or Enter); choose takes the option in those words, repeat presses css until an element matching until is on the page, pick types text in the search box css and takes the entry named name, wait holds until an element matching css is on the page, nth counts matches from 0, and at is a point of the control's box in fractions of its width and height.
export type Act =
  | { readonly kind: "click"; readonly css: string; readonly nth?: number; readonly at?: Spot }
  | { readonly kind: "set"; readonly css: string; readonly value: string; readonly release?: false }
  | { readonly kind: "choose"; readonly css: string; readonly option: string }
  | { readonly kind: "key"; readonly css: string; readonly key: string }
  | { readonly kind: "pick"; readonly css: string; readonly text: string; readonly name: string }
  | { readonly kind: "repeat"; readonly css: string; readonly until: string }
  | { readonly kind: "wait"; readonly css: string };

// words are the controls the sentence marks in braces and relies those it leans on unmarked; first is done before either is read, do is the step itself, then is what shows once it is done, and only marks a step for a tablet or for motion.
export interface Step {
  readonly id: string;
  readonly act: string;
  readonly see: string;
  readonly at: string;
  readonly words: readonly Words[];
  readonly relies?: readonly Words[];
  readonly first?: readonly Act[];
  readonly do?: readonly Act[];
  readonly then?: readonly Words[];
  readonly kind?: "play" | "commission";
  readonly only?: "touch" | "motion";
}

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly gloss: string;
  readonly aside?: string;
  readonly steps: readonly Step[];
}

export interface Ladder {
  readonly route: string;
  readonly what: string;
  readonly entered?: string;
  readonly lessons: readonly Lesson[];
}

export const roomOf = (route: string): string => {
  const name = ROUTE_NAMES[route];
  if (name === undefined) throw new Error(`no ROUTE_NAMES entry for ${route}`);
  return name;
};

const COUNT = ["no", "one", "two", "three", "four", "five", "six"] as const;
export const countWord = (n: number): string => COUNT[n] ?? String(n);

export function phrasesOf(sentence: string): readonly string[] {
  return [...sentence.matchAll(/\{([^{}]+)\}/g)].map((m) => m[1] ?? "");
}

export const text = (css: string, says: string, match?: "starts" | "contains"): Words =>
  match ? { css, says, read: "text", match } : { css, says, read: "text" };
export const aria = (css: string, says: string): Words => ({ css, says, read: "aria" });
export const road = (css: string, says: string): Words => ({ css, says, read: "road" });
export const option = (css: string, says: string): Words => ({ css, says, read: "option" });
export const labelled = (css: string, says: string): Words => ({ css, says, read: "label" });
export const click = (css: string): Act => ({ kind: "click", css });
export const set = (css: string, value: string): Act => ({ kind: "set", css, value });
export const choose = (css: string, option: string): Act => ({ kind: "choose", css, option });
export const wait = (css: string): Act => ({ kind: "wait", css });
