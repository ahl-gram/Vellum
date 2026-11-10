import { NO, YES } from "./questions.ts";
import type { Candidate, Outcome } from "./types.ts";

export const decide = (
  answers: { readonly restates: number; readonly pins: readonly number[] },
  candidates: readonly Candidate[],
): Outcome => {
  if (answers.pins.length !== candidates.length)
    throw new Error(`${answers.pins.length} answers for ${candidates.length} candidate tests`);
  const pinnedBy = candidates.flatMap((c, i) =>
    answers.pins[i]! > YES ? [{ file: c.file, name: c.name, noul: answers.pins[i]! }] : [],
  );
  if (pinnedBy.length > 0 || answers.restates > YES)
    return { kind: "finding", pinnedBy, restates: answers.restates > YES ? answers.restates : null };
  const all = [answers.restates, ...answers.pins];
  if (all.every((n) => n < NO)) return { kind: "clear" };
  return { kind: "unsettled", highest: Math.max(...all) };
};
