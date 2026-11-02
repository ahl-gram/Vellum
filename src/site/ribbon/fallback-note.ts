// The slip's notice for an address the roads refuse, pure and DOM-free: the page compares what it asked for with the journey the worker drew.
import type { RibbonPlateData } from "../explorer/ribbon-job.ts";

export interface RibbonAsk {
  readonly from: number | null;
  readonly to: number | null;
}

export type DrawnJourney = Pick<RibbonPlateData, "fromIdx" | "toIdx" | "fromName" | "options">;

export function fallbackNote(_ask: RibbonAsk, _res: DrawnJourney): string | null {
  return null;
}
