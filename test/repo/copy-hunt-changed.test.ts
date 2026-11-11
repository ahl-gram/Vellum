import assert from "node:assert/strict";
import { test } from "node:test";
import { changedFunctions } from "../../scripts/copy-hunt/changed.ts";
import { functionsIn, type Fn } from "../../scripts/copy-hunt/functions.ts";

const ALPHA = [
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const ALPHA_NEAR = [
  "export const alphaOf = (items: readonly Item[], cap: number): Item[] =>",
  "  items.filter((item) => item.weight <= cap).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const OTHER =
  "export const unrelated = (name: string, count: number): string => name.repeat(count).toUpperCase().trim();\n";

const before =
  (files: Record<string, string>) =>
  (path: string): readonly Fn[] =>
    functionsIn(path, files[path] ?? "");

test("every function of a file the diff adds is hunted, and only the changed or added ones of a file it modifies", () => {
  const fns = [...functionsIn("src/a.ts", ALPHA + OTHER), ...functionsIn("src/c.ts", ALPHA_NEAR)];
  assert.deepEqual(
    changedFunctions(
      fns,
      [
        { path: "src/a.ts", before: "src/a.ts" },
        { path: "src/c.ts", before: null },
      ],
      before({ "src/a.ts": OTHER }),
    ),
    new Set([0, 2]),
  );
});

test("a second copy of a function already in the file hunts both, and a rename compares with the old path", () => {
  const fns = functionsIn("src/a.ts", ALPHA + ALPHA);
  assert.deepEqual(
    changedFunctions(fns, [{ path: "src/a.ts", before: "src/a.ts" }], before({ "src/a.ts": ALPHA })),
    new Set([0, 1]),
  );
  const moved = functionsIn("src/moved.ts", ALPHA);
  assert.deepEqual(
    changedFunctions(moved, [{ path: "src/moved.ts", before: "src/old.ts" }], before({ "src/old.ts": ALPHA })),
    new Set(),
  );
});

test("a changed path outside the lint's roots, or not a .ts, is never read", () => {
  const asked: string[] = [];
  const recorder = (path: string): readonly Fn[] => {
    asked.push(path);
    return [];
  };
  const hunted = changedFunctions(
    [],
    [
      { path: "design/a.ts", before: "design/a.ts" },
      { path: "src/a.css", before: "src/a.css" },
      { path: "src/b.ts", before: null },
    ],
    recorder,
  );
  assert.equal(hunted.size, 0);
  assert.deepEqual(asked, []);
});
