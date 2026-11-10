// The Primer check's judgement, apart from the page (Issue #1250): what a step expects of each control it names, what the page's facts say it reads, and where a reader's press lands.
import type { Spot, Step, Words } from "../../src/site/shared/primer/shape.ts";

export type Arm = "desk" | "tablet";
export type Expect = "reachable" | "held" | "hidden" | "any";
export type Reach =
  "absent" | "hidden" | "no box" | "held" | "disabled" | "off screen" | "reachable" | `covered by ${string}`;
export type Box = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export type Point = { readonly x: number; readonly y: number };

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

export function expectFor(w: Words, step: Step, arm: Arm, outcome: boolean): Expect {
  if (step.only === "touch" && arm !== "tablet") return "hidden";
  if (step.only === "motion") return "hidden";
  if (w.state !== undefined) return w.state;
  return outcome ? "any" : "reachable";
}

export function onItsArm(step: Step, arm: Arm): boolean {
  return step.only === undefined ? arm === "desk" : step.only === "touch" && arm === "tablet";
}

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

const corner = (token: string, length: number): number =>
  token.endsWith("%") ? (parseFloat(token) / 100) * length : parseFloat(token);

export function pressPoint(box: Box, clip: string, at?: Spot): Point {
  if (at !== undefined) return { x: box.x + box.w * at.x, y: box.y + box.h * at.y };
  const m = /^polygon\((.*)\)$/.exec(clip.trim());
  if (m === null) return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  const corners = (m[1] ?? "").split(",").map((p) => p.trim().split(/\s+/));
  const mean = (i: 0 | 1, length: number): number =>
    corners.reduce((sum, c) => sum + corner(c[i] ?? "0", length), 0) / corners.length;
  return { x: box.x + mean(0, box.w), y: box.y + mean(1, box.h) };
}

const keysOfHash = (address: string): readonly string[] => {
  const at = address.indexOf("#");
  return at === -1 ? [] : [...new URLSearchParams(address.slice(at + 1)).keys()];
};

export function keysLost(at: string, hash: string): readonly string[] {
  const kept = new Set(keysOfHash(hash.startsWith("#") ? hash : `#${hash}`));
  return keysOfHash(at).filter((k) => !kept.has(k));
}

export type NamedKey = { readonly key: string; readonly code: string; readonly vk: number; readonly text: string };

const KEYS: Readonly<Record<string, NamedKey>> = {
  Enter: { key: "Enter", code: "Enter", vk: 13, text: "\r" },
  Escape: { key: "Escape", code: "Escape", vk: 27, text: "" },
  Tab: { key: "Tab", code: "Tab", vk: 9, text: "" },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", vk: 37, text: "" },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", vk: 38, text: "" },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", vk: 39, text: "" },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", vk: 40, text: "" },
  Home: { key: "Home", code: "Home", vk: 36, text: "" },
  End: { key: "End", code: "End", vk: 35, text: "" },
};

export function keyOf(name: string): NamedKey {
  const k = KEYS[name];
  if (k === undefined) throw new Error(`the Primer's driver has no key named ${JSON.stringify(name)}`);
  return k;
}

export function primerSuiteOf(route: string): string {
  const last = route
    .split("/")
    .filter((s) => s !== "")
    .at(-1);
  if (last === undefined) throw new Error(`no ladder suite for the route ${route}`);
  return `primer-${last}`;
}

export function primerGaps(routes: readonly string[], order: readonly string[]): readonly string[] {
  return routes.filter((r) => !order.includes(primerSuiteOf(r)));
}
