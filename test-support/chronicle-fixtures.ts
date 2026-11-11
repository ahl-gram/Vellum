import type { PlaceMark } from "../src/render/place-manifest.ts";
import type { HistoricalEvent } from "../src/society/history.ts";

export const mark = (over: Partial<PlaceMark> = {}): PlaceMark => ({
  idx: 0,
  worldIdx: 0,
  name: "Aelmoor",
  kind: "town",
  founded: 300,
  ruined: false,
  seat: false,
  roads: false,
  nx: 0.5,
  ny: 0.5,
  gx: 0,
  gy: 0,
  ...over,
});

export const ev = (over: Partial<HistoricalEvent> = {}): HistoricalEvent => ({
  year: 100,
  kind: "founding",
  text: "An event of no special note.",
  ...over,
});
