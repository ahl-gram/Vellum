import { stepAddress, type HandStep, type SealWhen } from "./hand-steps.ts";
import { ASIDE, BACK, DONE, FROM, headOf, MARKS, NEXT_STEP, onward } from "./hand-words.ts";
import { segmentsOf } from "./segments.ts";

const make = <K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className: string,
  words?: string,
): HTMLElementTagNameMap[K] => {
  const el = doc.createElement(tag);
  if (className !== "") el.className = className;
  if (words !== undefined) el.textContent = words;
  return el;
};

const dotsOf = (step: HandStep, sealed: ReadonlySet<string>, done: boolean): readonly string[] =>
  step.siblings.map((id) => (id === step.id ? (done ? "on" : "now") : sealed.has(id) ? "on" : ""));

export function buildNote(doc: Document, step: HandStep, sealed: ReadonlySet<string>, when: SealWhen): HTMLElement {
  const note = make(doc, "aside", "primer-slip");
  const head = make(doc, "p", "primer-slip-head");
  const dots = make(doc, "span", "primer-slip-dots");
  for (const on of dotsOf(step, sealed, false)) {
    const dot = make(doc, "i", on);
    dot.setAttribute("aria-hidden", "true");
    dots.append(dot);
  }
  head.append(
    make(doc, "span", "primer-slip-verb", FROM),
    make(doc, "span", "primer-slip-title", headOf(step.lesson, step.n, step.of)),
    dots,
  );
  const act = make(doc, "p", "primer-slip-act");
  for (const seg of segmentsOf(step)) {
    if (!("chip" in seg)) act.append(doc.createTextNode(seg.text));
    else if (seg.chip === "road") {
      const chip = make(doc, "span", "ch road");
      chip.append(make(doc, "i", "", seg.verb), doc.createTextNode(" "), make(doc, "b", "", seg.place));
      act.append(chip);
    } else act.append(make(doc, "span", `ch ${seg.chip}`, seg.text));
  }
  const row = make(doc, "p", "primer-slip-row");
  const back = make(doc, "a", "primer-slip-back", BACK);
  back.setAttribute("href", `/primer/#${step.id}`);
  row.append(back);
  if (when === "never" && step.only !== null) row.append(make(doc, "span", "mark", MARKS[step.only]));
  if (step.next !== null) {
    const next = make(doc, "a", "primer-slip-next dim", NEXT_STEP);
    next.setAttribute("href", stepAddress(step.next.id, step.next.at));
    row.append(next);
  }
  const aside = make(doc, "button", "primer-slip-aside", "×");
  aside.setAttribute("type", "button");
  aside.setAttribute("aria-label", ASIDE);
  note.append(head, act, row, aside);
  return note;
}

export function markDone(note: HTMLElement, step: HandStep, sealed: ReadonlySet<string>): void {
  const doc = note.ownerDocument;
  const row = note.querySelector(".primer-slip-row");
  if (row === null || row.querySelector(".primer-slip-done") !== null) return;
  [...note.querySelectorAll(".primer-slip-dots i")].forEach((dot, i) => {
    dot.className = dotsOf(step, sealed, true)[i] ?? "";
  });
  const done = make(doc, "span", "primer-slip-done");
  done.append(make(doc, "b", "primer-seal", String(step.n)), doc.createTextNode(DONE));
  const next = row.querySelector("a.primer-slip-next");
  row.insertBefore(done, next);
  if (next !== null && step.next !== null) {
    next.textContent = onward(step.next.word);
    next.className = "primer-slip-next go";
  }
}
