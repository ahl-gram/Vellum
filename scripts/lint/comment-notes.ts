export type Loc = { start: { line: number; column: number }; end: { line: number; column: number } };
export type Note = { readonly text: string; readonly ownLine: boolean; readonly loc: Loc };

const lead = /^\s*\*+\s?/;
export const noteText = (value: string, block: boolean): string =>
  value
    .split("\n")
    .map((line) => (block ? line.replace(lead, "") : line).trim())
    .join(" ");

export function runs<N extends Note>(notes: readonly N[]): N[][] {
  const out: N[][] = [];
  for (const note of notes) {
    const run = out.at(-1);
    const last = run?.at(-1);
    if (run && last?.ownLine && note.ownLine && note.loc.start.line === last.loc.end.line + 1) run.push(note);
    else out.push([note]);
  }
  return out;
}

export const ownLineAt = (text: string, offset: number): boolean =>
  text.slice(text.lastIndexOf("\n", offset - 1) + 1, offset).trim() === "";
