// The road from the capital as the Print Room presses it: its four sizes, what the head and the caveat say, whether the answer offers a road, the plate sized by its root, and its file names. Pure and DOM-free; src/site/print-room/order-counter.ts does the wiring.
import { CHART_PRESET, POSTER_PRESETS, type PosterPreset } from "./poster-presets.ts";

export type Pressing = "poster" | "road";
export type RoadState = "pending" | "none" | "drawn";

export const ROAD_PRESETS: readonly PosterPreset[] = [
  { key: "ribbon", label: "Ribbon", width: 1060 },
  { key: "desk", label: "Desk", width: 2400 },
  { key: "wall", label: "Wall", width: 3300 },
  { key: "grand", label: "Grand", width: 4200 },
];

export const ROAD_CHOICE = "The road from the capital";
export const ROAD_NONE = "The road from the capital: none for this world";
export const POSTER_CHOICE = "A poster plate";
export const POSTER_TAIL = "The chart is pulled only as the engraving.";
export const ROAD_TAIL = "The road is pressed either way.";

export function pressesFor(pressing: Pressing): readonly PosterPreset[] {
  return pressing === "road" ? ROAD_PRESETS : [CHART_PRESET, ...POSTER_PRESETS];
}

export const pressVerb = (preset: PosterPreset): string => `${preset.width} px`;
export const pressingLabel = (pressing: Pressing): string => (pressing === "road" ? ROAD_CHOICE : POSTER_CHOICE);
export const caveatTail = (pressing: Pressing): string => (pressing === "road" ? ROAD_TAIL : POSTER_TAIL);

export function roadChoice(state: RoadState): { readonly text: string; readonly disabled: boolean } {
  if (state === "none") return { text: ROAD_NONE, disabled: true };
  return { text: ROAD_CHOICE, disabled: state === "pending" };
}

export interface RoadAnswer {
  readonly fromIdx: number;
  readonly options: ReadonlyArray<{ readonly kind: string }>;
}

export function roadOnOffer(answer: RoadAnswer): boolean {
  return answer.options[answer.fromIdx]?.kind === "capital";
}

export const roadTitle = (fromName: string, toName: string): string => `The Road from ${fromName} to ${toName}`;
export const roadLine = (fromName: string, toName: string): string => `the road from ${fromName} to ${toName}`;

export function roadAtWidth(svg: string, widthPx: number): string {
  const root = /^<svg\b[^>]*>/.exec(svg);
  const box = root ? /\sviewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(root[0]) : null;
  if (!root || !box) throw new Error("the road's plate carries no viewBox to size it by");
  const height = Math.round(((Number(box[2]) * widthPx) / Number(box[1])) * 100) / 100;
  const sized = root[0]
    .replace(/\swidth="[^"]*"/, ` width="${widthPx}"`)
    .replace(/\sheight="[^"]*"/, ` height="${height}"`);
  return sized + svg.slice(root[0].length);
}

export const roadFilename = (seed: number, dress: string, width: number): string =>
  `vellum-road-${seed}-${dress}-${width}.svg`;
export const roadPngFilename = (seed: number, dress: string, outWidth: number): string =>
  `vellum-road-${seed}-${dress}-${outWidth}.png`;
