import type { MapType } from "../../terrain/heightfield.ts";

export const MAP_WORDS: Readonly<Record<MapType, string>> = {
  island: "an island",
  archipelago: "an archipelago",
  continent: "a continent",
  citystate: "a city-state",
};

export const mapNoun = (type: MapType): string => MAP_WORDS[type].replace(/^an? /, "");
