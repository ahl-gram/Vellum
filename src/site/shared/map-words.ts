import type { MapType } from "../../terrain/heightfield.ts";

export const MAP_WORDS: Readonly<Record<MapType, string>> = {
  island: "a island",
  archipelago: "an archipelago",
  continent: "a continent",
  citystate: "a city-state",
};
