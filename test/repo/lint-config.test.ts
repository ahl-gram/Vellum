import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

const SIZE_CAPS = ["max-lines", "max-lines-per-function"];

const LIST_AT_REFORMAT: Readonly<Record<string, readonly [number, number]>> = {};

const readList = (): Record<string, Record<string, { count: number }>> => {
  const file = join(ROOT, "eslint-suppressions.json");
  assert.ok(
    existsSync(file),
    "eslint-suppressions.json is missing, so the overruns the reformat made fail the lint or were lifted some other way",
  );
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, Record<string, { count: number }>>;
};

test("eslint-suppressions.json lists only the two size caps, each over a tracked file, so the list of overruns Alex ruled holds nothing else and names no file that is gone (Alex, 2026-10-07, Issue #779)", () => {
  const list = readList();
  const listed = spawnSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  assert.equal(listed.status, 0, `git ls-files failed: ${listed.stderr}`);
  const tracked = new Set(listed.stdout.split("\0").filter(Boolean));
  assert.ok(
    Object.keys(list).length > 0,
    "the list is empty, so either every overrun was split (delete the file, its rulebook paragraph and this test) or this reader is looking at the wrong shape",
  );
  assert.deepEqual(
    Object.keys(list).filter((f) => !tracked.has(f)),
    [],
    "the list names a file git does not track; ESLint refuses a stale entry only for a file it lints, so remove the entry by hand",
  );
  assert.deepEqual(
    Object.entries(list).flatMap(([f, rules]) =>
      Object.keys(rules)
        .filter((r) => !SIZE_CAPS.includes(r))
        .map((r) => `${f}: ${r}`),
    ),
    [],
    "the list suppresses a rule other than the two size caps, which nobody ruled; fix the code or put the skip to Alex",
  );
});

test("eslint-suppressions.json only shrinks: no file joins it, and no file's count for either cap passes its count at the reformat (Alex, 2026-10-07, Issue #779)", () => {
  const grown = Object.entries(readList()).flatMap(([file, rules]) => {
    const [lines, functions] = LIST_AT_REFORMAT[file] ?? [0, 0];
    const now = [rules["max-lines"]?.count ?? 0, rules["max-lines-per-function"]?.count ?? 0] as const;
    return now[0] > lines || now[1] > functions
      ? [`${file}: ${now.join(", ")} against ${lines}, ${functions} at the reformat`]
      : [];
  });
  assert.deepEqual(
    grown,
    [],
    "a file joined the list or a count grew, so an overrun nobody ruled was recorded, most likely by a re-run of eslint --suppress-rule: split the code instead. A split lowers its file's entry here in the same change. BLIND SPOTS, declared, erring toward passing: the list counts overruns, not sizes, so a listed file or function that grows while already over its cap passes; and an entry here left above its file's count lets a new overrun in that file return up to it",
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
