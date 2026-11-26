import type { SvgNode } from "../../render/svg.ts";
import type { ProspectInput } from "../input.ts";
import type { PlateCaption } from "../caption.ts";
import type { Surroundings } from "../surroundings.ts";
import type { BirdseyeGeometry, Box } from "../birdseye/types.ts";

export type PlateCParts = {
  readonly input: ProspectInput;
  readonly geometry: BirdseyeGeometry;
  readonly year: number;
  readonly caption: PlateCaption;
  readonly surroundings: Surroundings;
  readonly suffix: string;
  readonly widthPx?: number;
};
export type CBoxes = {
  readonly seaName: Box | null;
  readonly names: ReadonlyArray<Box>;
  readonly key: ReadonlyArray<Box>;
  readonly bank: Box;
  readonly town: Box | null;
  readonly ships: ReadonlyArray<Box>;
};
export type EngravedC = { readonly node: SvgNode; readonly boxes: CBoxes };
