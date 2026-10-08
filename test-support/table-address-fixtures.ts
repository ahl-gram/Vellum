import { TABLE_KEY, type SurveyItem, type ProspectItem } from "../src/site/shared/table-address.ts";

// The two canonical items every round-trip test is built from: one survey wearing every field the grammar has, one prospect wearing every field of its own.
export const SURVEY =
  "k-s.seed-42.type-citystate.band-polar.land-350.coast-55.style-antique.legend-1.arms-0.beasts-1.theme-moisture.rung-2.lx-17.ly-13";
export const PROSPECT = "k-p.seed-42.style-ink.i-3.year-814";

export const survey: SurveyItem = {
  kind: "survey",
  seed: 42,
  overrides: { mapType: "citystate", band: "polar", landFraction: 0.35, coastWarp: 0.55 },
  style: "antique",
  legend: true,
  arms: false,
  beasts: true,
  theme: "moisture",
  rung: 2,
  lx: 17,
  ly: 13,
};

export const prospect: ProspectItem = {
  kind: "prospect",
  seed: 42,
  overrides: {},
  style: "ink",
  index: 3,
  year: 814,
};

export const hashOf = (value: string): string => `#seed=42&style=antique&${TABLE_KEY}=${value}`;
