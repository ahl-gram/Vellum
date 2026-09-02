import { tierTag } from "../../itinerary/prose.ts";
import type { RibbonRow } from "../explorer/ribbon-job.ts";

export function rowText(r: RibbonRow): { readonly strong: string | null; readonly em: string } {
  return r.kind === "waypoint" ? { strong: r.text, em: r.tier === undefined ? "" : tierTag(r.tier) } : { strong: null, em: r.text };
}
