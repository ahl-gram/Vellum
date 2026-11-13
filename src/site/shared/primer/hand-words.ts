export const FROM = "From The Primer";
export const BACK = "Back to The Primer";
export const NEXT_STEP = "Next step";
export const DONE = "done";
export const ASIDE = "Set the step aside";
export const onward = (word: string | null): string => (word === null ? "Next step ›" : `Next, ${word} ›`);
export const headOf = (lesson: string, n: number, of: number): string => `${lesson}, step ${n} of ${of}`;
export const MARKS = {
  touch: "on a tablet",
  motion: "with motion on",
  play: "play: no wrong answer",
  commission: "a commission",
} as const;
