import assert from "node:assert/strict";
import { foundWorld, type Founding } from "../src/world/founding/found.ts";

export const founded = (sentence: string): Founding => {
  const f = foundWorld(sentence);
  assert.ok(f.ok, `"${sentence}" should found a world, was refused: ${f.ok ? "" : f.reason}`);
  return f;
};

export const phrases = (list: Founding["steered"]): string[] => list.map((r) => r.phrase);
