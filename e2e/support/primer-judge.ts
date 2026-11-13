// The Primer check's judgement, apart from the page (Issue #1250): what a step expects of each control it names, what the page's facts say it reads, and where a reader's press lands.
import type { Box, Expect } from "../../src/site/shared/primer/judge.ts";
import type { Ladder, Spot, Step, Words } from "../../src/site/shared/primer/shape.ts";

export type Arm = "desk" | "tablet" | "motion";
export const ARM_NAME: Readonly<Record<Arm, string>> = { desk: "", tablet: " on a tablet", motion: " with motion on" };
export type Point = { readonly x: number; readonly y: number };

export function expectFor(w: Words, step: Step, arm: Arm, outcome: boolean): Expect {
  if (step.only === "touch" && arm !== "tablet") return "hidden";
  if (step.only === "motion" && arm !== "motion") return "hidden";
  if (w.state !== undefined) return w.state;
  return outcome ? "any" : "reachable";
}

export function onItsArm(step: Step, arm: Arm): boolean {
  if (step.only === undefined) return arm === "desk";
  return arm === (step.only === "touch" ? "tablet" : "motion");
}

const readsOf = (s: Step): string =>
  JSON.stringify([s.at, s.first ?? [], s.words, s.relies ?? [], s.do ?? [], s.then ?? [], s.only ?? null]);

export function heldBy(step: Step, ladders: readonly Ladder[]): string | null {
  const mine = readsOf(step);
  for (const s of ladders.flatMap((l) => l.lessons.flatMap((lesson) => lesson.steps))) {
    if (s === step) return null;
    if (readsOf(s) === mine) return s.id;
  }
  return null;
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
