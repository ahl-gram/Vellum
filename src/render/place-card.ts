import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";

/** Deliberately NOT createLoreWriter: its prose depends on call order and its own rng, and would silently disagree with the bound-atlas gazetteer for the same town. */

export type PlaceCard = {
  readonly name: string;
  readonly rank: string;
  readonly founded: number;
  readonly foundedLine: string;
  readonly tale?: string;
};

const RANK_LABEL: Record<"capital" | "town" | "village" | "hamlet", string> = {
  capital: "Capital",
  town: "Town",
  village: "Village",
  hamlet: "Hamlet",
};

const SEAT_LABEL = "Realm Seat";

export function placeRank(mark: PlaceMark): string {
  if (mark.ruined) return "Ruin";
  if (mark.kind === "capital") return RANK_LABEL.capital;
  return mark.seat ? SEAT_LABEL : RANK_LABEL[mark.kind];
}

export function placeAriaLabel(mark: PlaceMark): string {
  return `${mark.name}, ${placeRank(mark)}`;
}

export function cardSide(
  nx: number,
  ny: number,
): { h: "left" | "right"; v: "above" | "below" } {
  return { h: nx > 0.5 ? "left" : "right", v: ny > 0.5 ? "above" : "below" };
}

function ruinTale(mark: PlaceMark, events: ReadonlyArray<HistoricalEvent>): string | undefined {
  if (!mark.ruined) return undefined;
  return events.find((e) => e.settlement === mark.idx && e.kind === "ruin")?.text;
}

export function composePlaceCard(
  mark: PlaceMark,
  events: ReadonlyArray<HistoricalEvent>,
): PlaceCard {
  const tale = ruinTale(mark, events);
  return {
    name: mark.name,
    rank: placeRank(mark),
    founded: mark.founded,
    foundedLine: `Founded in the year ${mark.founded}.`,
    ...(tale ? { tale } : {}),
  };
}
