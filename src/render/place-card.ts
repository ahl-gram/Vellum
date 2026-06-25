import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";

/**
 * Client-side composition of a place's story card from the #52 manifest. Pure:
 * no DOM, no RNG. Deliberately NOT createLoreWriter, whose prose depends on call
 * order and its own rng and would silently disagree with the bound-atlas
 * gazetteer for the same town (#53). The DOM overlay that renders these cards
 * lives in docs/explorer/app.js.
 */

export type PlaceCard = {
  readonly name: string;
  readonly rank: string;
  readonly founded: number;
  readonly foundedLine: string;
  readonly tale?: string;
};

const RANK_LABEL: Record<"capital" | "town" | "village", string> = {
  capital: "Capital",
  town: "Town",
  village: "Village",
};

/** A settlement's rank for display; a ruin overrides its kind. */
export function placeRank(mark: PlaceMark): string {
  return mark.ruined ? "Ruin" : RANK_LABEL[mark.kind];
}

/** The hit-target's accessible name: place name plus rank, matching the card. */
export function placeAriaLabel(mark: PlaceMark): string {
  return `${mark.name}, ${placeRank(mark)}`;
}

/**
 * Which way the card unfurls so it stays on-screen: it opens toward the chart's
 * centre, flipping once a mark passes the midline on either axis.
 */
export function cardSide(
  nx: number,
  ny: number,
): { h: "left" | "right"; v: "above" | "below" } {
  return { h: nx > 0.5 ? "left" : "right", v: ny > 0.5 ? "above" : "below" };
}

/**
 * The abandonment tale: the ruin event for THIS place, never its founding. Both
 * a founding and a ruin event carry the same `settlement` idx (history.ts), so
 * the kind filter is load-bearing. Returns undefined for a living place, or for
 * a ruin whose event was sliced off the 14-event chronicle.
 */
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
