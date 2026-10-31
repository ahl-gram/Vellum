import { LEXICON, type LexiconEntry } from "./lexicon.ts";

const BY_PHRASE = new Map(LEXICON.map((entry) => [entry.phrase, entry]));
const LONGEST = Math.max(...LEXICON.map((entry) => entry.phrase.split(" ").length));

export const entryNamed = (phrase: string): LexiconEntry | undefined => BY_PHRASE.get(phrase);

export function longestEntryAt(words: ReadonlyArray<string>, at: number): LexiconEntry | undefined {
  for (let span = Math.min(LONGEST, words.length - at); span > 0; span--) {
    const entry = BY_PHRASE.get(words.slice(at, at + span).join(" "));
    if (entry !== undefined) return entry;
  }
  return undefined;
}
