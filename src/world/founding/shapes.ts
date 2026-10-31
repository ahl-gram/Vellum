import { placeId, type OutlineId } from "../outline-ids.ts";
import type { Steer } from "./lexicon.ts";
import { PLACE_KINDS, PLACE_PREFERENCES, SHAPE_ARTICLES, SHAPE_FORMS, SHAPE_TRIGGERS } from "./lexicon-shapes.ts";
import { foundingWords } from "./normalize.ts";

export type GazetteerRow = readonly [id: string, name: string, kind: string, country: string];
export type ShapeHit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };

export const placeKey = (words: ReadonlyArray<string>): string =>
  words.join(" ").normalize("NFD").replace(/\p{M}/gu, "");

const TRIGGER_WORDS: ReadonlyArray<ReadonlyArray<string>> = SHAPE_TRIGGERS.map((trigger) => trigger.split(" "));

let places: ReadonlyMap<string, OutlineId> | null = null;
let longestName = 0;

const rankOf = (kind: string): number => {
  const at = PLACE_KINDS.indexOf(kind);
  return at < 0 ? PLACE_KINDS.length : at;
};

export function setFoundingGazetteer(rows: ReadonlyArray<GazetteerRow> | null): void {
  if (rows === null) {
    places = null;
    longestName = 0;
    return;
  }
  const held = new Map<string, { readonly id: string; readonly rank: number }>();
  for (const [id, name, kind] of rows) {
    const key = placeKey(foundingWords(name));
    const rank = rankOf(kind);
    const own = held.get(key);
    if (own === undefined || rank < own.rank) held.set(key, { id, rank });
  }
  for (const [key, id] of PLACE_PREFERENCES) if (held.has(key)) held.set(key, { id, rank: 0 });
  const chosen = new Map<string, OutlineId>();
  let longest = 0;
  for (const [key, { id }] of held) {
    chosen.set(key, placeId(id));
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
  gazetteer: ReadonlyMap<string, OutlineId>,
  words: ReadonlyArray<string>,
  from: number,
  start: number,
): ShapeHit | null {
  for (let span = Math.min(longestName, words.length - start); span > 0; span--) {
    const id = gazetteer.get(placeKey(words.slice(start, start + span)));
    if (id !== undefined) return outlineHit(id, from, start + span);
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
  for (const start of starts) {
    const hit = placeAt(gazetteer, words, at, start);
    if (hit !== null) return hit;
  }
  return null;
}
