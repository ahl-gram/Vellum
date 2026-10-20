import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const blocks: readonly Linter.Config[] = lintConfig;
const nameOf = (b: Linter.Config): string => (b.name ?? "(unnamed)").replace(/^.* > /, "");

test("every block lets ESLint parse the program it lints: no block carries a processor, only the stylesheet block names a language, and only typescript-eslint's base layer names a parser (Issue #728)", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  assert.deepEqual(
    blocks.filter((b) => "processor" in b).map(nameOf),
    [],
    "a block hands its files to a processor, which can give ESLint no program for a subtree and pass every rule there unread",
  );
  assert.deepEqual(
    blocks.filter((b) => "language" in b).map((b) => b.files),
    [["src/styles/**/*.css"]],
    "a block other than the stylesheet block names a language, so the files it matches are parsed as something the TypeScript rules never read",
  );
  assert.deepEqual(
    blocks.filter((b) => b.languageOptions?.parser !== undefined).map(nameOf),
    ["typescript-eslint/base"],
    "a block other than typescript-eslint's base layer sets a parser, which can swap the program the type-checked rules read for a subtree",
  );
});

test("no tracked file sits under a root .gitignore pattern, so the ignore list the lint reads hides nothing git tracks (Issue #728)", () => {
  const listed = spawnSync("git", ["ls-files", "-z", "-ci", "--exclude-from=.gitignore"], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(listed.status, 0, `git ls-files failed: ${listed.stderr}`);
  assert.deepEqual(
    listed.stdout.split("\0").filter(Boolean),
    [],
    "git tracks a file the root .gitignore matches, so the lint, which takes its ignores from that file, never reads it; untrack it or narrow the pattern. BLIND SPOT, declared: git's matching and includeIgnoreFile's translation of the same file could disagree on an unusual pattern, in either direction",
  );
});

test("eslint-suppressions.json does not exist, so no rule's findings are lifted file by file outside the rulebook's inline skips (Alex, 2026-10-18, Issue #814)", () => {
  assert.ok(
    existsSync(join(ROOT, "eslint.config.ts")),
    "eslint.config.ts is not at ROOT, so this guard looks for the list in the wrong directory",
  );
  assert.equal(
    existsSync(join(ROOT, "eslint-suppressions.json")),
    false,
    "eslint-suppressions.json exists, and ESLint applies it on every lint run, so every finding it counts passes the lint unread; fix the code and delete the file, which ESLint's --suppress-all, --suppress-rule and --prune-suppressions each write (handbook/specs/rulebook.md, The accepted lint and type-check skips)",
  );
});
