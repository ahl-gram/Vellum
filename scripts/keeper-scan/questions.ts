import { stateOf } from "../comment-judge/questions.ts";
import type { CommentRun } from "../comment-judge/types.ts";
import { MODEL, type NoulQuestion, type SystemOneRequest } from "../jev/system-one.ts";

export const SIGNALS = ["measured", "platform", "deviation", "golden", "units", "convention", "sentinel"] as const;
export type Signal = (typeof SIGNALS)[number];

const noul = (instructions: string, yes: string, no: string): NoulQuestion => ({
  type: "noul",
  instructions,
  criteria: { true: yes, false: no },
});

export const KEEPERS: Readonly<Record<Signal, NoulQuestion>> = {
  measured: noul(
    "Does `comment` give a number that someone measured, swept or tuned by hand?",
    "`comment` states a value found by measuring or trying, such as a timing, a pixel width, a worst case seen across seeds, or the range a sweep covered.",
    "`comment` states no number, or only a number that `code` already shows, with nothing about where it came from.",
  ),
  platform: noul(
    "Does `comment` describe how software outside this repository behaves, such as a browser, Node, git, a CI runner or a library?",
    "`comment` says what an outside tool does, for example that headless Chrome lays out at a different width than asked, or that a git command strips a character.",
    "`comment` talks only about this repository's own code and data.",
  ),
  deviation: noul(
    "Does `comment` say that `code` departs on purpose from a rule, a ruled design, or the obvious way to write it?",
    "`comment` warns the reader that the code is deliberately unusual, for example a value kept different from the mockup on a ruling, so the reader does not change it back.",
    "`comment` describes code written the ordinary way, with no warning against changing it.",
  ),
  golden: noul(
    "Does `comment` say that some output must stay byte-identical, such as a golden file, a committed chart or a seed's world?",
    "`comment` says a change here would move bytes that are pinned, for example that a committed chart or the golden depends on this order.",
    "`comment` says nothing about output that must stay the same byte for byte.",
  ),
  units: noul(
    "Does `comment` name the units or the scale of a value in `code`?",
    "`comment` says what a bare number is measured in, for example cells, pixels, milliseconds, degrees or a fraction of the sheet width.",
    "`comment` names no unit, or the unit is already in a name in `code`, such as `timeoutMs`.",
  ),
  convention: noul(
    "Does `comment` say which way a coordinate, an index or a direction runs in `code`?",
    "`comment` states an orientation, for example that y grows downward, that row comes before column, or that an angle is measured clockwise from north.",
    "`comment` states no orientation or ordering convention.",
  ),
  sentinel: noul(
    "Does `comment` say what a special value in `code` stands for?",
    "`comment` decodes a marker value, for example that -1 means no basin, that null means the sea, or that 0 means unset.",
    "`comment` decodes no special value.",
  ),
};

export const SURVIVAL: Readonly<Record<Signal, NoulQuestion>> = {
  measured: noul(
    "Does `file_after` still say how the number in `comment` was measured or found?",
    "`file_after` keeps the provenance `comment` gave, such as what was measured, over how many cases, on which date or issue, even in fewer words.",
    "`file_after` may keep the number and its meaning, but no longer says how or where it was measured or found.",
  ),
  platform: noul(
    "Does `file_after` still say how the outside tool behaves that `comment` describes?",
    "`file_after` keeps the fact about the browser, Node, git, the CI runner or the library that `comment` gave, even in fewer words.",
    "`file_after` keeps the code, but no longer says what the outside tool does.",
  ),
  deviation: noul(
    "Does `file_after` still warn that the code departs on purpose, as `comment` did?",
    "`file_after` still tells the reader the unusual choice is deliberate, so it should not be changed back.",
    "`file_after` keeps the code, but nothing in it says the choice was deliberate.",
  ),
  golden: noul(
    "Does `file_after` still say that the output must stay byte-identical, as `comment` did?",
    "`file_after` still says a change here would move pinned bytes, such as the golden or a committed chart.",
    "`file_after` keeps the code, but no longer says any output depends on it byte for byte.",
  ),
  units: noul(
    "Does `file_after` still name the units or the scale that `comment` gave?",
    "`file_after` still says what the value is measured in, in a comment or in a name such as `widthPx`.",
    "`file_after` keeps the value, but nothing says what it is measured in.",
  ),
  convention: noul(
    "Does `file_after` still say which way the coordinate, index or direction runs, as `comment` did?",
    "`file_after` still states the orientation or ordering `comment` gave.",
    "`file_after` keeps the code, but no longer states the orientation or ordering.",
  ),
  sentinel: noul(
    "Does `file_after` still say what the special value means, as `comment` did?",
    "`file_after` still decodes the marker value, in a comment or a name such as `NO_BASIN`.",
    "`file_after` keeps the value, but nothing says what it stands for.",
  ),
};

export const keeperRequest = (run: CommentRun): SystemOneRequest => ({
  model: MODEL,
  state: stateOf(run),
  questions: KEEPERS,
});

export const survivalRequest = (run: CommentRun, fileAfter: string, signals: readonly Signal[]): SystemOneRequest => ({
  model: MODEL,
  state: { comment: run.text, file: run.file, file_after: fileAfter },
  questions: Object.fromEntries(signals.map((s) => [s, SURVIVAL[s]])),
});
