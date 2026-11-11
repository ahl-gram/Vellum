import type { ClimateBand } from "../../climate/climate.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import type { COAST_WARP, LexiconEntry, Steer } from "./lexicon.ts";

export const type = (value: MapType): Steer => ({ subject: "mapType", value });
export const band = (value: ClimateBand): Steer => ({ subject: "band", value });
export const coast = (value: keyof typeof COAST_WARP): Steer => ({ subject: "coast", value });

export const group = (steers: ReadonlyArray<Steer>, phrases: ReadonlyArray<string>): LexiconEntry[] =>
  phrases.map((phrase) => ({ phrase, steers }));
