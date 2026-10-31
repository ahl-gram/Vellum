import { placeId, type OutlineId } from "../outline-ids.ts";
import type { Steer } from "./lexicon.ts";
import {
  DIRECTION_WORDS,
  KINDS_AFTER_THE,
  PLACE_ARTICLE,
  PLACE_KINDS,
  PLACE_PREFERENCES,
  SHAPE_ARTICLES,
  SHAPE_FORMS,
  SHAPE_TRIGGERS,
} from "./lexicon-shapes.ts";
import { foundingWords } from "./normalize.ts";

export type GazetteerRow = readonly [id: string, name: string, kind: string, country: string];
export type ShapeHit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };

export const placeKey = (words: ReadonlyArray<string>): string =>
  words.join(" ").normalize("NFD").replace(/\p{M}/gu, "");

const TRIGGER_WORDS: ReadonlyArray<ReadonlyArray<string>> = SHAPE_TRIGGERS.map((trigger) => trigger.split(" "));

type Place = { readonly id: OutlineId; readonly kind: string };

let places: ReadonlyMap<string, Place> | null = null;
let longestName = 0;

const rankOf = (kind: string): number => {
  const at = PLACE_KINDS.indexOf(kind);
  return at < 0 ? PLACE_KINDS.length : at;
};

const onlyDirections = (key: string): boolean => key.split(" ").every((word) => DIRECTION_WORDS.has(word));

export function setFoundingGazetteer(rows: ReadonlyArray<GazetteerRow> | null): void {
  if (rows === null) {
    places = null;
    longestName = 0;
    return;
  }
  const held = new Map<string, { readonly id: string; readonly rank: number }>();
  const kindOf = new Map<string, string>();
  for (const [id, name, kind] of rows) {
    kindOf.set(id, kind);
    const key = placeKey(foundingWords(name));
    const rank = rankOf(kind);
    const own = held.get(key);
    if (own === undefined || rank < own.rank) held.set(key, { id, rank });
  }
  for (const [key, id] of PLACE_PREFERENCES) if (held.has(key)) held.set(key, { id, rank: 0 });
  const chosen = new Map<string, Place>();
  let longest = 0;
  for (const [key, { id }] of held) {
    if (onlyDirections(key)) continue;
    chosen.set(key, { id: placeId(id), kind: kindOf.get(id) ?? "" });
    longest = Math.max(longest, key.split(" ").length);
  }
  places = chosen;
  longestName = longest;
}

const outlineHit = (value: OutlineId, from: number, end: number): ShapeHit => ({
  taken: end - from,
  steers: [{ subject: "outline", value }],
});

function placeAt(
  gazetteer: ReadonlyMap<string, Place>,
  words: ReadonlyArray<string>,
  from: number,
  start: number,
  afterThe: boolean,
): ShapeHit | null {
  for (let span = Math.min(longestName, words.length - start); span > 0; span--) {
    const key = placeKey(words.slice(start, start + span));
    const place = gazetteer.get(key);
    if (place === undefined) continue;
    if ((afterThe || key.split(" ")[0] === PLACE_ARTICLE) && !KINDS_AFTER_THE.has(place.kind)) continue;
    return outlineHit(place.id, from, start + span);
  }
  return null;
}

export function shapeAt(words: ReadonlyArray<string>, at: number): ShapeHit | "unloaded" | null {
  const trigger = TRIGGER_WORDS.find((parts) => parts.every((word, i) => words[at + i] === word));
  const first = at + (trigger?.length ?? 0);
  const head = words[first];
  if (trigger === undefined || head === undefined) return null;
  const starts = SHAPE_ARTICLES.has(head) ? [first, first + 1] : [first];
  for (const start of starts) {
    const form = SHAPE_FORMS.get(placeKey([words[start] ?? ""]));
    if (form !== undefined) return outlineHit(form, at, start + 1);
  }
  const gazetteer = places;
  if (gazetteer === null) return "unloaded";
  const bare = placeAt(gazetteer, words, at, first, false);
  return bare ?? (head === PLACE_ARTICLE ? placeAt(gazetteer, words, at, first + 1, true) : null);
}
