import { headOf } from "../shared/primer/hand-words.ts";
import { dotsOf, make } from "../shared/primer/hand-note.ts";
import { BACK_A_STEP, DONE_LINE, SKIP_THIS_STEP } from "./words.ts";

const press = (doc: Document, className: string, words: string): HTMLButtonElement => {
  const button = make(doc, "button", className, words);
  button.setAttribute("type", "button");
  return button;
};

export function buildRow(
  doc: Document,
  lesson: string,
  siblings: readonly string[],
  at: string,
  sealed: ReadonlySet<string>,
  first: boolean,
): HTMLElement {
  const row = make(doc, "p", "walk");
  const back = press(doc, "walk-back", BACK_A_STEP);
  if (first) back.setAttribute("disabled", "");
  const dots = make(doc, "span", "dots");
  for (const on of dotsOf(siblings, at, sealed, false)) {
    const dot = make(doc, "i", on);
    dot.setAttribute("aria-hidden", "true");
    dots.append(dot);
  }
  row.append(
    back,
    make(doc, "span", "walk-of", headOf(lesson, siblings.indexOf(at) + 1, siblings.length)),
    dots,
    press(doc, "walk-skip", SKIP_THIS_STEP),
  );
  return row;
}

export function buildDone(doc: Document, num: string, act: string): HTMLElement {
  const line = make(doc, "p", "walk-done");
  line.append(make(doc, "b", "primer-seal", num), doc.createTextNode(DONE_LINE(act)));
  return line;
}
