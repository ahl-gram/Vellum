import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { e2eSourcePaths } from "../../test-support/e2e-source.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const TYPE_SKIP = /@ts-(?:expect-error|ignore|nocheck)\b/;
const LINT_SKIP = /\/[/*]\s*eslint(?:-disable(?:-next-line|-line)?|-enable)?(?![\w-])/;

const skips = (path: string, text: string): string[] =>
  text.split("\n").flatMap((line, i) => (TYPE_SKIP.test(line) || LINT_SKIP.test(line) ? [`${path}:${i + 1}: ${line.trim()}`] : []));

const FIXTURE = [
  "// @ts-expect-error a note",
  "// @ts-ignore",
  "// @ts-nocheck",
  "/* @ts-ignore */ const a = 1;",
  "const b = 1; // eslint-disable-line no-unused-vars",
  "// eslint-disable-next-line no-unused-vars",
  "/* eslint-disable */",
  "/* eslint-enable */",
  "/* eslint no-unused-vars: \"off\" */",
  "const clean = { eslintRule: 1, tsExpect: 2 };",
  "// a comment about the linter and the checker, neither switched off",
  "// eslintrc was the old config's name",
];

test("the scan reports every form of type-check or lint skip, one finding per line, and nothing on a clean line", () => {
  assert.deepEqual(skips("f.ts", FIXTURE.join("\n")).map((f) => f.split(":")[1]), ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
});

test("the scan reads every TypeScript file under e2e/ at any depth, and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-notes-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    ["e2e/top.ts", "e2e/suites/split/nested.ts", "e2e/left.mjs", "scripts/other.ts", "scripts/e2e-beside.ts", "test/e2e/x.test.ts"].forEach(plant);
    assert.deepEqual(
      e2eSourcePaths(root).map((p) => relative(root, p)).sort(),
      ["e2e/top.ts", "e2e/suites/split/nested.ts"].sort(),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the e2e tree carries no type-check or lint skip in any form, so a doubted read is written with a non-null mark or a real check (Alex's ruling C of 2026-10-01 on Issue #654)", () => {
  const paths = e2eSourcePaths(REPO);
  assert.ok(paths.includes(join(REPO, "e2e", "run.ts")) && paths.includes(join(REPO, "e2e", "suites", "specimen", "desktop.ts")), "the scan missed the runner or a suite's part file, so it is reading the wrong tree");
  assert.deepEqual(paths.flatMap((p) => skips(relative(REPO, p), readFileSync(p, "utf8"))), [], "an e2e file carries a skip; the accepted skips elsewhere are listed in specs/rulebook.md");
});
