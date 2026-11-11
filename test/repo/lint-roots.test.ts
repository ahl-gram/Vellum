import { test } from "node:test";
import assert from "node:assert/strict";
import { isTsUnderLintRoots, tsRootsOf } from "../../test-support/lint-roots.ts";

test("the lint's TypeScript roots are read from globs of one shape, and a TypeScript glob of any other shape is refused rather than dropped", () => {
  assert.deepEqual(
    tsRootsOf([
      "src/**/*.ts",
      "e2e/**/*.ts",
      "**/*.js",
      "src/styles/**/*.css",
      "src/**/*.ts",
      ["test/**/*.ts", "**/*.mts"],
      ["**/*.mts", "scripts/**/*.ts"],
    ]),
    ["e2e", "scripts", "src", "test"],
  );
  for (const entry of [
    "tools/bench/**/*.ts",
    "e2e/**/*.mts",
    "src/**/*.{ts,mts}",
    ".claude/skills/**/*.ts",
    "**/*.ts",
    "test/**/*.cts",
    "web/**/*.tsx",
    ["**/*.ts", "**/*.tsx"],
    ["**/*.js", "**/*.ts"],
  ]) {
    assert.throws(
      () => tsRootsOf([entry]),
      /cannot read/,
      `${JSON.stringify(entry)} was dropped, so a root the lint reads through it would be one neither guard walks`,
    );
  }
});

test("the copy hunt and the comment judge read a .ts file under one of the lint's roots, and never a declaration file", () => {
  for (const path of ["src/a.ts", "scripts/x/y.ts", "test/a.test.ts", "test-support/h.ts", "e2e/s.ts"])
    assert.equal(isTsUnderLintRoots(path), true, path);
  for (const path of [
    "src/a.d.ts",
    "srcx/a.ts",
    "design/r/x.ts",
    "handbook/plans/1300/x.ts",
    "src/styles/a.css",
    "src/pages/a.astro",
    "src/a.mjs",
  ])
    assert.equal(isTsUnderLintRoots(path), false, path);
});
