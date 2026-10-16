// The plate a Portfolio with nothing gathered shows on its stage (Issue #670).
export const PLATE_CHART = "";

export interface PlateStep {
  readonly numeral: string;
  readonly head: string;
  readonly lines: readonly [string, string, string];
}

export const PLATE_STEPS: readonly [PlateStep, PlateStep, PlateStep] = [
  {
    numeral: "i",
    head: "At the Explorer",
    lines: ["Draw nearer with the Glass until a", "region is surveyed anew, then turn", "down the survey's corner."],
  },
  {
    numeral: "ii",
    head: "On the Table",
    lines: [
      "Each sheet turned down is laid on the",
      "Chart Table, in the drawer at the",
      "chart's right edge, up to six.",
    ],
  },
  {
    numeral: "iii",
    head: "In the Portfolio",
    lines: ["Take the table here: each sheet is", "drafted again from its number, and", "downloads as the engraving."],
  },
];
export const PLATE_TAB = "The Drawer";
export const PLATE_VERB = "Take the table to";
export const PLATE_ROOM = "The Portfolio";

export function howPlate(chartHref: string): string {
  return `<svg class="how-plate" viewBox="0 0 1200 1000"><image class="p-pic" href="${chartHref}"/></svg>`;
}
