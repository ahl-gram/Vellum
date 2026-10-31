import { MAX_ISLANDS, MIN_ISLANDS } from "../../terrain/lobes.ts";
import type { Steer } from "./lexicon.ts";
import { BAND_WORDS, BETWEEN_WORDS, ISLAND_WORDS, NUMBER_WORDS, SCALE_WORDS } from "./lexicon-shapes.ts";
import { entryNamed, longestEntryAt } from "./listed.ts";

export type Hit = { readonly taken: number; readonly steers: ReadonlyArray<Steer> };
type Reading = { readonly value: number; readonly taken: number };

const DIGITS = /^[0-9]+$/;
const GROUP = /^[0-9]{3}$/;
const LONGEST_ISLAND = Math.max(...ISLAND_WORDS.map((word) => word.split(" ").length));
const LONGEST_BETWEEN = Math.max(...[...BETWEEN_WORDS.keys()].map((word) => word.split(" ").length));

const withDigits = (value: number, word: string): number => {
  let next = value;
  for (let i = 0; i < word.length; i++) next = Math.min(next * 10 + (word.charCodeAt(i) - 48), MAX_ISLANDS);
  return next;
};

function digitsAt(words: ReadonlyArray<string>, at: number): Reading | null {
  const first = words[at];
  if (first === undefined || !DIGITS.test(first)) return null;
  let value = withDigits(0, first);
  let taken = 1;
  for (
    let next = words[at + taken];
    first.length <= 3 && next !== undefined && GROUP.test(next);
    next = words[at + taken]
  ) {
    value = withDigits(value, next);
    taken++;
  }
  return { value, taken };
}

const isNumberWord = (word: string | undefined): boolean =>
  word !== undefined && (NUMBER_WORDS.has(word) || SCALE_WORDS.has(word));

function numberWordsAt(words: ReadonlyArray<string>, at: number): Reading | null {
  let value = 0;
  let taken = 0;
  for (let word = words[at]; word !== undefined; word = words[at + taken]) {
    const added = NUMBER_WORDS.get(word);
    const scale = SCALE_WORDS.get(word);
    if (added !== undefined) value = Math.min(value + added, MAX_ISLANDS);
    else if (scale !== undefined) value = Math.min(Math.max(value, 1) * scale, MAX_ISLANDS);
    else if (word === "and" && taken > 0 && isNumberWord(words[at + taken + 1])) {
      taken++;
      continue;
    } else break;
    taken++;
  }
  return taken === 0 ? null : { value, taken };
}

function numberAt(words: ReadonlyArray<string>, at: number): Reading | null {
  const digits = digitsAt(words, at);
  if (digits !== null) return digits;
  const band = BAND_WORDS.get(words[at] ?? "");
  return band !== undefined ? { value: band, taken: 1 } : numberWordsAt(words, at);
}

function longestIn(
  table: ReadonlyMap<string, unknown>,
  longest: number,
  words: ReadonlyArray<string>,
  at: number,
): number {
  for (let span = Math.min(longest, words.length - at); span > 0; span--) {
    if (table.has(words.slice(at, at + span).join(" "))) return span;
  }
  return 0;
}

function betweenAt(words: ReadonlyArray<string>, at: number): Hit | null {
  const sizeSpan = longestIn(BETWEEN_WORDS, LONGEST_BETWEEN, words, at);
  const entry = longestEntryAt(words, at);
  const entrySpan = entry === undefined ? 0 : entry.phrase.split(" ").length;
  if (sizeSpan > 0 && sizeSpan >= entrySpan) {
    const size = BETWEEN_WORDS.get(words.slice(at, at + sizeSpan).join(" "));
    return {
      taken: sizeSpan,
      steers: size === null || size === undefined ? [] : [{ subject: "isleSize", value: size }],
    };
  }
  if (entry !== undefined && entry.steers.length === 1 && entry.steers[0]?.subject === "coast") {
    return { taken: entrySpan, steers: entry.steers };
  }
  return null;
}

const islandSpanAt = (words: ReadonlyArray<string>, at: number): number => {
  for (let span = Math.min(LONGEST_ISLAND, words.length - at); span > 0; span--) {
    if (ISLAND_WORDS.includes(words.slice(at, at + span).join(" "))) return span;
  }
  return 0;
};

const firstOfEach = (steers: ReadonlyArray<Steer>): Steer[] =>
  steers.filter((s, i) => steers.findIndex((t) => t.subject === s.subject && t.value === s.value) === i);

export function countAt(words: ReadonlyArray<string>, at: number): Hit | null {
  const count = numberAt(words, at);
  if (count === null || count.value < MIN_ISLANDS) return null;
  const steers: Steer[] = [{ subject: "islands", value: count.value }];
  let end = at + count.taken;
  for (;;) {
    const span = islandSpanAt(words, end);
    if (span > 0) {
      steers.push(...(entryNamed(words.slice(end, end + span).join(" "))?.steers ?? []));
      return { taken: end + span - at, steers: firstOfEach(steers) };
    }
    const between = betweenAt(words, end);
    if (between === null) return null;
    steers.push(...between.steers);
    end += between.taken;
  }
}
