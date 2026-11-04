// The road from the capital as the Print Room presses it: its four sizes, what the head and the caveat say, whether the answer offers a road, the plate sized by its root, and its file names. Pure and DOM-free; src/site/print-room/order-counter.ts does the wiring.
import { CHART_PRESET, POSTER_PRESETS, type PosterPreset } from "./poster-presets.ts";

export type Pressing = "poster" | "road";
export type RoadState = "pending" | "none" | "drawn";

export const ROAD_PRESETS: readonly PosterPreset[] = [CHART_PRESET, ...POSTER_PRESETS];

export const ROAD_CHOICE = "The road from the capital";
export const ROAD_NONE = "The road from the capital: none for this world";
export const POSTER_CHOICE = "A poster plate";
export const POSTER_TAIL = "The chart is pulled only as the engraving.";
export const ROAD_TAIL = "The road is pressed either way.";

export function pressesFor(_pressing: Pressing): readonly PosterPreset[] {
  return [CHART_PRESET, ...POSTER_PRESETS];
}

export const pressVerb = (preset: PosterPreset): string => `${preset.width} px`;
export const pressingLabel = (_pressing: Pressing): string => POSTER_CHOICE;
export const caveatTail = (_pressing: Pressing): string => POSTER_TAIL;

export function roadChoice(_state: RoadState): { readonly text: string; readonly disabled: boolean } {
  return { text: ROAD_CHOICE, disabled: false };
}

export interface RoadAnswer {
  readonly fromIdx: number;
  readonly options: ReadonlyArray<{ readonly kind: string }>;
}

export function roadOnOffer(_answer: RoadAnswer): boolean {
  return true;
}

export const roadTitle = (_fromName: string, _toName: string): string => "";
export const roadLine = (_fromName: string, _toName: string): string => "";

export function roadAtWidth(svg: string, _widthPx: number): string {
  return svg;
}

export const roadFilename = (_seed: number, _dress: string, _width: number): string => "";
export const roadPngFilename = (_seed: number, _dress: string, _outWidth: number): string => "";
