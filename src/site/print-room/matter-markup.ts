// The bound atlas's back matter as a page of the atlas (#497, seat p): pure strings like plate-markup.ts. The host measures the page at the 900px/16px reference and the room fits the sheet to pageAspect.
import { escapeXml } from "../../render/svg.ts";
import { MATTER_ROW, numeralOf } from "./plate-numbers.ts";

export type MatterKey = "banners" | "chronicle" | "gazetteer";
export const MATTER_KEYS: readonly MatterKey[] = ["banners", "chronicle", "gazetteer"];
export const PAGE_MEASURE_WIDTH = 900;
export const PAGE_MIN_HEIGHT = 1200;

export interface MatterSource {
  readonly title: string;
  readonly seed: number;
  readonly bannersHtml: string;
  readonly chronicleHtml: string;
  readonly gazetteerHtml: string;
}

const TITLE: Record<MatterKey, string> = {
  banners: "The banners of every realm",
  chronicle: "The chronicle",
  gazetteer: "The gazetteer",
};

export function isMatterKey(key: string): key is MatterKey {
  return (MATTER_KEYS as readonly string[]).includes(key);
}

export function matterTitle(key: MatterKey): string {
  return TITLE[key];
}

export function matterLine(key: MatterKey): string {
  const what = key === "banners" ? "the banners of every realm" : `the ${key}`;
  return `plate ${numeralOf(MATTER_ROW[key])} of the bound atlas · ${what}`;
}

export function pageAspect(measuredHeight: number): number {
  return PAGE_MEASURE_WIDTH / Math.max(PAGE_MIN_HEIGHT, measuredHeight);
}

export function matterPage(key: MatterKey, atlas: MatterSource): string {
  const section = atlas[`${key}Html`];
  if (section === "") return "";
  return `<p class="page-head">VELLUM · THE BOUND ATLAS OF ${escapeXml(atlas.title)} · CHART № ${atlas.seed}</p>\n${section}`;
}
