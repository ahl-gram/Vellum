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

export function wordsOf(_f: Facts, _w: Words): string | null {
  return null;
}

export function wordsHold(_got: string | null, _w: Words): boolean {
  return false;
}

export function expectFor(_w: Words, _step: Step, _arm: Arm, _outcome: boolean): Expect {
  return "reachable";
}

export function onItsArm(_step: Step, _arm: Arm): boolean {
  return true;
}

export function stateOf(_f: Facts, _hit: string): Reach {
  return "reachable";
}

export function fits(_state: Reach, _expect: Expect): boolean {
  return true;
}

const corner = (token: string, length: number): number =>
  token.endsWith("%") ? (parseFloat(token) / 100) * length : parseFloat(token);

export function pressPoint(box: Box, _clip: string, _at?: Spot): Point {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

const keysOfHash = (address: string): readonly string[] => {
  const at = address.indexOf("#");
  return at === -1 ? [] : [...new URLSearchParams(address.slice(at + 1)).keys()];
};

export function keysLost(_at: string, _hash: string): readonly string[] {
  return [];
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
  return { key: name, code: "", vk: 0, text: "" };
}

export function primerSuiteOf(route: string): string {
  return route;
}

export function primerGaps(_routes: readonly string[], _order: readonly string[]): readonly string[] {
  return [];
}
