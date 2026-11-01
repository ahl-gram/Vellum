import type { Founding } from "../../world/founding/found.ts";
import { MAX_SENTENCE_CODE_POINTS, type Steer } from "../../world/founding/lexicon.ts";
import type { OutlineId } from "../../world/outline-ids.ts";
import type { RoomReason } from "../shared/founding.ts";

export type AccountLine = { readonly phrase: string; readonly set: string };
export type Account = {
  readonly steered: ReadonlyArray<AccountLine>;
  readonly contested: ReadonlyArray<string>;
  readonly quiet: boolean;
  readonly seed: number;
  readonly residual: string;
};

export const QUIET_LINE = "None of these words steered the world; its chart number alone drew it.";

export const MAP_WORDS = {
  island: "an island",
  archipelago: "an archipelago",
  continent: "a continent",
  citystate: "a city-state",
} as const;
const BAND_WORDS = { polar: "a cold climate", tropical: "a warm climate", temperate: "a temperate climate" } as const;

export function refusalWords(reason: RoomReason, length: number): string {
  switch (reason) {
    case "empty":
      return "Write a sentence first.";
    case "too-long":
      return `A founding sentence is at most ${MAX_SENTENCE_CODE_POINTS} characters; this one has ${length}.`;
    case "control-character":
      return "The sentence holds a control character; write it as plain text.";
    case "unknown-character":
      return "The sentence holds a character this browser does not know; write it without that character.";
    case "unknown-version":
      return "This link was written with founding words this page does not have.";
    case "names-unread":
      return "The names of the world's places could not be read, so this shape cannot be drawn; try again.";
  }
}

function steerWords(steer: Steer, placeName: (id: OutlineId) => string): string {
  switch (steer.subject) {
    case "mapType":
      return MAP_WORDS[steer.value];
    case "band":
      return BAND_WORDS[steer.value];
    case "land":
      return steer.value === "more" ? "more land" : "less land";
    case "coast":
      return steer.value === "ragged" ? "a ragged coast" : "a smooth coast";
    case "culture":
      return `names in the ${steer.value.charAt(0).toUpperCase()}${steer.value.slice(1)} tongue`;
    case "outline":
      return `the shape of ${placeName(steer.value)}`;
    case "islands":
      return `about ${steer.value} islands`;
    case "isleSize":
      return steer.value === "varied" ? "islands of every size" : "islands alike";
  }
}

export function accountOf(f: Founding, placeName: (id: OutlineId) => string): Account {
  return {
    steered: f.steered.map((r) => ({
      phrase: r.phrase,
      set: r.steers.map((s) => steerWords(s, placeName)).join(" and "),
    })),
    contested: f.contested.map((r) => r.phrase),
    quiet: f.steered.length === 0,
    seed: f.seed,
    residual: f.residual,
  };
}

export function chartNumberLine(account: Account): string {
  return account.residual === ""
    ? `№ ${account.seed}, from no words at all`
    : `№ ${account.seed}, from “${account.residual}”`;
}
