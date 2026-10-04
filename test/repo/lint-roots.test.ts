import { test } from "node:test";
import assert from "node:assert/strict";
import { tsRootsOf } from "../../test-support/lint-roots.ts";

test("the lint's TypeScript roots are read from globs of one shape, and a TypeScript glob of any other shape is refused rather than dropped", () => {
  assert.deepEqual(tsRootsOf(["src/**/*.ts", "e2e/**/*.ts", "**/*.js", "public/**/*.css", "src/**/*.ts", ["test/**/*.ts", "**/*.mts"], ["**/*.mts", "scripts/**/*.ts"]]), ["e2e", "scripts", "src", "test"]);
  for (const entry of ["tools/bench/**/*.ts", "e2e/**/*.mts", "src/**/*.{ts,mts}", ".claude/skills/**/*.ts", "**/*.ts", "test/**/*.cts", "web/**/*.tsx", ["**/*.ts", "**/*.tsx"], ["**/*.js", "**/*.ts"]]) {
    assert.throws(() => tsRootsOf([entry]), /cannot read/, `${JSON.stringify(entry)} was dropped, so a root the lint reads through it would be one neither guard walks`);
  }
});
