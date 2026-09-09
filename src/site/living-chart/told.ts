// #442 the story's ONE live signal, a survey day row or a chronicle annal: one message and never two channels, so a stage never reconciles a year against a port and paints a stale one over a live one.
import { eventIsPast } from "../../render/chronicle-scrubber.ts";

export type ToldEntry =
  | {
      readonly chamber: "survey";
      readonly row: number;
      readonly index: number;
      readonly day: number;
      readonly text: string;
    }
  | { readonly chamber: "ages"; readonly year: number; readonly text: string };

export function toldAnnal(
  annals: ReadonlyArray<{ readonly year: number; readonly text: string }>,
  year: number,
): ToldEntry | null {
  let last: { readonly year: number; readonly text: string } | null = null;
  for (const r of annals) if (eventIsPast(r.year, year)) last = r;
  return last === null ? null : { chamber: "ages", year: last.year, text: last.text };
}
