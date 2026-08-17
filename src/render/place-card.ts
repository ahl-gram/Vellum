import type { PlaceMark } from "./place-manifest.ts";
import type { HistoricalEvent } from "../society/history.ts";
import { glossName, tongueName, cultureById } from "../society/philology.ts";

/** Deliberately NOT createLoreWriter: its prose depends on call order and its own rng, and would silently disagree with the bound-atlas gazetteer for the same town. */

export type PlaceCard = {
  readonly name: string;
  readonly rank: string;
  readonly founded: number;
  readonly foundedLine: string;
  readonly formerLine?: string;
  readonly tongueLine: string;
  readonly derivationLine: string;
  readonly tale?: string;
};

const HEDGES = [
  "Or so the philologists venture.",
  "If the old grammars have the right of it.",
  "So the lexicographers of the age would have it.",
  "Though no scholar will swear to it.",
  "The reading is disputed.",
];

const UNCERTAIN = "Of uncertain derivation, even to the philologists.";

function hedgeFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100003;
  return HEDGES[h % HEDGES.length] as string;
}

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

export type CardBox = {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
};

function axisNudge(lo: number, hi: number, boxLo: number, boxHi: number): number {
  if (hi - lo >= boxHi - boxLo) return boxLo - lo;
  if (hi > boxHi) return boxHi - hi;
  if (lo < boxLo) return boxLo - lo;
  return 0;
}

/** #387/#388: the screen-px nudge that pulls a shown card back inside `box`, applied after cardSide has chosen its side. */
export function clampOffset(card: CardBox, box: CardBox): { dx: number; dy: number } {
  return {
    dx: axisNudge(card.left, card.right, box.left, box.right),
    dy: axisNudge(card.top, card.bottom, box.top, box.bottom),
  };
}

function ruinTale(mark: PlaceMark, events: ReadonlyArray<HistoricalEvent>): string | undefined {
  if (!mark.ruined) return undefined;
  return events.find((e) => e.settlement === mark.idx && e.kind === "ruin")?.text;
}

export type Derivation = {
  readonly tongueLine: string;
  readonly derivationLine: string;
};

export function composeDerivation(name: string, cultureId: string): Derivation {
  if (!cultureById(cultureId)) {
    return { tongueLine: "A word of no speech the philologists can name.", derivationLine: UNCERTAIN };
  }
  const gloss = glossName(name, cultureId);
  const speech = `A word of the ${gloss ? gloss.tongue : tongueName(cultureId)} speech`;
  if (!gloss) return { tongueLine: `${speech}: ${name}`, derivationLine: UNCERTAIN };
  return {
    tongueLine: `${speech}: ${gloss.syllabified}`,
    derivationLine: `${gloss.roots.map((r) => `${r.root}, ${r.gloss}`).join("; ")}. ${hedgeFor(name)}`,
  };
}

export function composePlaceCard(
  mark: PlaceMark,
  events: ReadonlyArray<HistoricalEvent>,
  cultureId: string,
): PlaceCard {
  const tale = ruinTale(mark, events);
  return {
    name: mark.name,
    rank: placeRank(mark),
    founded: mark.founded,
    foundedLine: `Founded in the year ${mark.founded}.`,
    ...(mark.formerName ? { formerLine: `Once called ${mark.formerName}.` } : {}),
    ...composeDerivation(mark.name, cultureId),
    ...(tale ? { tale } : {}),
  };
}
