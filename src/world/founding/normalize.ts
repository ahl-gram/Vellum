import { MAX_SENTENCE_CODE_POINTS } from "./lexicon.ts";

export type RefusalReason = "empty" | "too-long" | "control-character" | "unknown-character" | "unknown-version";
export type Refusal = { readonly ok: false; readonly reason: RefusalReason };
export type Displayed = { readonly ok: true; readonly sentence: string };

const CONTROL = /(?![\t\n\v\f\r])\p{Cc}/u;
const UNKNOWN = /[\p{Cn}\p{Cs}]/u;
const INVISIBLE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/gu;
const ZERO_WIDTH_SPACE = /\u200B/gu;
const FORMAT = /\p{Cf}/gu;
const POSSESSIVE = /['\u2018\u2019\u02BC][sS](?![\p{L}\p{M}\p{N}])/gu;
const APOSTROPHE = /['\u2018\u2019\u02BC]/gu;
const NOT_WORD = /[^\p{L}\p{M}\p{N}]+/gu;

const refuse = (reason: RefusalReason): Refusal => ({ ok: false, reason });

export function displayForm(input: string): Displayed | Refusal {
  if (CONTROL.test(input)) return refuse("control-character");
  if (UNKNOWN.test(input)) return refuse("unknown-character");
  const sentence = input
    .replace(INVISIBLE, "")
    .replace(ZERO_WIDTH_SPACE, " ")
    .normalize("NFC")
    .replace(/\s+/gu, " ")
    .trim();
  if (sentence === "") return refuse("empty");
  if (Array.from(sentence).length > MAX_SENTENCE_CODE_POINTS) return refuse("too-long");
  return { ok: true, sentence };
}

export function foundingWords(display: string): string[] {
  return display
    .normalize("NFKC")
    .replace(FORMAT, "")
    .replace(POSSESSIVE, "")
    .replace(APOSTROPHE, "")
    .replace(NOT_WORD, " ")
    .split(" ")
    .filter((word) => word !== "")
    .map((word) => word.toLowerCase());
}
