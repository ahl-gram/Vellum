// The Primer's judgement of a control against the words a step quotes (Issue #1250), shared by the drift check and the pointing hand (Issue #1253).
import type { Words } from "./shape.ts";

export type Expect = "reachable" | "held" | "hidden" | "any";
export type Reach =
  "absent" | "hidden" | "no box" | "held" | "disabled" | "off screen" | "reachable" | `covered by ${string}`;
export type Box = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export type Facts = {
  readonly found: boolean;
  readonly shown: boolean;
  readonly box: Box | null;
  readonly clip: string;
  readonly held: boolean;
  readonly disabled: boolean;
  readonly text: string;
  readonly aria: string | null;
  readonly title: string | null;
  readonly placeholder: string | null;
  readonly attr: string | null;
  readonly label: string;
  readonly road: readonly [string, string];
  readonly options: readonly { readonly text: string; readonly disabled: boolean }[];
};

export const norm = (s: string | null): string => (s ?? "").replace(/\s+/g, " ").trim();

export function wordsOf(f: Facts, w: Words): string | null {
  if (!f.found) return null;
  switch (w.read) {
    case "text":
      return norm(f.text);
    case "aria":
      return norm(f.aria);
    case "title":
      return norm(f.title);
    case "placeholder":
      return f.placeholder;
    case "attr":
      return f.attr;
    case "label":
      return norm(f.label);
    case "road":
      return `${norm(f.road[0])} ${norm(f.road[1])}`;
    case "option": {
      const o = f.options.find((x) => norm(x.text) === w.says);
      return o === undefined ? "no such option" : o.disabled ? `${w.says} (disabled)` : w.says;
    }
  }
}

export function wordsHold(got: string | null, w: Words): boolean {
  if (got === null) return false;
  return w.match === "starts" ? got.startsWith(w.says) : w.match === "contains" ? got.includes(w.says) : got === w.says;
}

export const routeOf = (address: string): string => address.split(/[?#]/)[0] ?? address;

export function stateOf(f: Facts, hit: string): Reach {
  if (!f.found) return "absent";
  if (!f.shown) return "hidden";
  if (f.box === null || f.box.w === 0 || f.box.h === 0) return "no box";
  if (f.held) return "held";
  if (f.disabled) return "disabled";
  if (hit === "off screen") return "off screen";
  return hit === "self" || hit === "label" ? "reachable" : `covered by ${hit}`;
}

export function fits(state: Reach, expect: Expect): boolean {
  if (expect === "any") return state !== "absent";
  if (expect === "hidden") return state === "hidden" || state === "no box";
  return state === expect;
}
