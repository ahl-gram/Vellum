import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { ROOT } from "../../scripts/review/comment-judge/parse.ts";

test("the root the comment reader parses under is the repository's root, which no parse result shows (Issue #1454)", () => {
  assert.equal(ROOT, resolve(import.meta.dirname, "..", ".."));
});
