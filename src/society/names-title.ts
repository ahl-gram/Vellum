import type { MapType } from "../terrain/heightfield.ts";

export const TITLE_ADJECTIVES: readonly string[] = [
  "Sundered",
  "Verdant",
  "Gilded",
  "Mistbound",
  "Amber",
  "Whispering",
  "Salt-Worn",
  "Untamed",
  "Drowned",
  "Shining",
  "Storm-Held",
  "Quiet",
];

export const AGES: readonly string[] = ["Lantern", "Ember", "Tide", "Crane", "Iron", "Pale", "Cedar"];

export const TITLE_PATTERNS: Readonly<Record<MapType, readonly string[]>> = {
  island: ["The @ Isle of %", "The Isle of %", "% , the @ Isle"],
  archipelago: ["The @ Isles of %", "The % Archipelago", "The Scattered Isles of %"],
  continent: ["The @ Reaches of %", "The Realm of %", "Terra %"],
  citystate: ["The Free City of %", "% and its Hinterland", "The City-State of %"],
};
