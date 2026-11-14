import type { Step, Words } from "./shape.ts";

export type Chip = "road" | "opt" | "glyph" | "word" | "btn";
export type Segment =
  | { readonly text: string }
  | { readonly chip: Chip; readonly text: string; readonly verb?: string; readonly place?: string };

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

export function segmentsOf(step: Pick<Step, "act" | "words">): readonly Segment[] {
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
