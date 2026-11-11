import { createHash } from "node:crypto";
import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";

export type Kind = "sheet" | "rainfall" | "crop";
export const KINDS: readonly Kind[] = ["sheet", "rainfall", "crop"];

export const QUESTIONS: Readonly<Record<string, NoulQuestion>> = {
  rain_lines_lead: {
    type: "noul",
    instructions:
      "In `chart`, are the thin contour lines that trace the bands of rainfall colour the strongest lines on the land, stronger than the short curved wind strokes?",
    criteria: {
      true: "The contour lines are the first lines the eye follows across the land, and the short curved strokes sit quietly behind them.",
      false: "The short curved strokes catch the eye before the contour lines, which fade into the bands of colour.",
    },
  },
  realm_names_read: {
    type: "noul",
    instructions:
      "In `chart`, can each large name set in spaced capitals across the land be read along its whole length, where it crosses mountain or forest symbols too?",
    criteria: {
      true: "Every letter of each spaced-capital name stands clear of the symbols and colour beneath it.",
      false: "Letters of a spaced-capital name fade into the symbols or colour beneath them.",
    },
  },
  names_read: {
    type: "noul",
    instructions: "Can every name written in `crop` be read?",
    criteria: {
      true: "Each name's letters stand clear of the symbols around them and can be spelled out.",
      false: "A name's letters are tangled with the symbols around them and cannot be spelled out.",
    },
  },
  title_reads_first: {
    type: "noul",
    instructions: "In `chart`, does the title in the framed box read as the sheet's title before any other lettering on the sheet?",
    criteria: {
      true: "The title in the framed box is the first lettering the eye lands on, plainly larger and stronger than every name on the land.",
      false: "A name on the land, or other lettering on the sheet, catches the eye before the title in the framed box.",
    },
  },
};

export const ASKED: Readonly<Record<Kind, readonly string[]>> = {
  sheet: ["realm_names_read", "title_reads_first"],
  rainfall: ["realm_names_read", "rain_lines_lead", "title_reads_first"],
  crop: ["names_read"],
};

export const ABOUT: Readonly<Record<Kind, string>> = {
  sheet: "A hand-drawn chart of an invented land, shown whole at the size it was drawn.",
  rainfall: "A hand-drawn rainfall chart of an invented land, shown whole at the size it was drawn.",
  crop: "A 600 by 400 pixel piece of a hand-drawn chart of an invented land, at the size it was drawn.",
};

export const SLOT: Readonly<Record<Kind, string>> = { sheet: "chart", rainfall: "chart", crop: "crop" };
export const YES = 0.7;
export const NO = 0.3;

export const isKind = (word: string): word is Kind => (KINDS as readonly string[]).includes(word);

export const sha256Of = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

export const referenceOf = (png: Uint8Array): string => `still-${sha256Of(png).slice(0, 16)}`;

export const requestFor = (kind: Kind, png: Uint8Array): SystemOneRequest => {
  const ref = referenceOf(png);
  return {
    model: MODEL,
    state: { [SLOT[kind]]: ref, about: ABOUT[kind] },
    questions: Object.fromEntries(ASKED[kind].map((id) => [id, QUESTIONS[id]!])),
    assets: { [ref]: { type: "image", format: "png", data_base64: Buffer.from(png).toString("base64") } },
  };
};
