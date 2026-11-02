// The slip's notice for an address the roads refuse, pure and DOM-free: the page compares what it asked for with the journey the worker drew.
import type { RibbonPlateData } from "../explorer/ribbon-job.ts";

export interface RibbonAsk {
  readonly from: number | null;
  readonly to: number | null;
}

export type DrawnJourney = Pick<RibbonPlateData, "fromIdx" | "toIdx" | "fromName" | "options">;

const named = (res: DrawnJourney, ask: number | null): string | null =>
  ask !== null && Number.isInteger(ask) && ask >= 0 && ask < res.options.length ? res.options[ask]!.name : null;

export function fallbackNote(ask: RibbonAsk, res: DrawnJourney): string | null {
  const sentences: string[] = [];
  const from = named(res, ask.from);
  if (from !== null && ask.from !== res.fromIdx)
    sentences.push(`No road leaves ${from}; this is the road from the capital.`);
  const to = named(res, ask.to);
  if (to !== null && ask.to !== res.toIdx) {
    sentences.push(`The road cannot take you to ${to}; this is the road to the farthest place from ${res.fromName}.`);
  }
  return sentences.length === 0 ? null : sentences.join(" ");
}
