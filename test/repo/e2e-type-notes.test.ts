import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { e2eSourcePaths } from "../../test-support/e2e-source.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
const TYPE_SKIP = /@ts-(?:expect-error|ignore|nocheck)/i;
const LINT_SKIP =
  /\/[/*]\s*eslint(?:-disable(?:-next-line|-line)?|-enable)?(?![\w-])|\/\*\s*(?:globals?|exported)(?=\s)/g;

const skips = (path: string, text: string): string[] => {
  const lines = text.split("\n");
  const hit = new Set(lines.flatMap((line, i) => (TYPE_SKIP.test(line) ? [i + 1] : [])));
  for (const m of text.matchAll(LINT_SKIP)) hit.add(text.slice(0, m.index).split("\n").length);
  return [...hit].sort((a, b) => a - b).map((n) => `${path}:${n}: ${lines[n - 1]!.trim()}`);
};

const FIXTURE = [
  "// @ts-expect-error a note",
  "// @ts-ignore",
  "// @ts-nocheck",
  "// @TS-NOCHECK",
  "// @ts-ignored, a typo the checker still obeys",
  "/* @ts-expect-errors */",
  "/* @ts-ignore */ const a = 1;",
  "const b = 1; // eslint-disable-line no-unused-vars",
  "const c = 1; //eslint-disable-line no-unused-vars",
  "// eslint-disable-next-line no-unused-vars",
  "/* eslint-disable */",
  "/*eslint-disable*/",
  "/* eslint-enable */",
  '/* eslint no-unused-vars: "off" */',
  "/*",
  "  eslint-disable",
  "*/",
  "const clean = { eslintRule: 1, tsExpect: 2 };",
  "// a comment about the linter and the checker, neither switched off",
  "// eslintrc was the old config's name",
  "// eslint-config-x is named in prose",
  "/** @ts-ignore */",
  "/// @ts-ignore",
  "const d = 1; // @ts-ignore",
  "/*",
  " * a note",
  " * @ts-ignore */",
  "/* @ts-ignore */ // eslint-disable-line no-unused-vars",
  "/*\teslint-disable */",
  "/* eslint-disable */",
  "/* global someName */",
  "/* exported someName */",
  "// global state lives in the harness",
];

test("the scan reports every form of type-check or lint skip, a block directive at its opening line, one finding per line, and nothing on a clean line", () => {
  const expected = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "22",
    "23",
    "24",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
  ];
  assert.deepEqual(
    skips("f.ts", FIXTURE.join("\n")).map((f) => f.split(":")[1]),
    expected,
  );
});

test("the scan reads every TypeScript file under e2e/ at any depth, and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-notes-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    [
      "e2e/top.ts",
      "e2e/suites/split/nested.ts",
      "e2e/left.mjs",
      "scripts/other.ts",
      "scripts/e2e-beside.ts",
      "test/e2e/x.test.ts",
    ].forEach(plant);
    assert.deepEqual(
      e2eSourcePaths(root)
        .map((p) => relative(root, p))
        .sort(),
      ["e2e/top.ts", "e2e/suites/split/nested.ts"].sort(),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the e2e tree carries no type-check or lint skip in any form, so a doubted read is written with a non-null mark or a real check (Alex's ruling C of 2026-10-01 on Issue #654)", () => {
  const paths = e2eSourcePaths(REPO);
  const listing = readdirSync(join(REPO, "e2e"), { recursive: true, encoding: "utf8" });
  assert.deepEqual(
    listing.filter((f) => /\.(?:mts|cts|tsx)$/.test(f)),
    [],
    "an e2e source the scan does not read: the checker follows an imported .mts, .cts or .tsx and honors its directives",
  );
  const tree = listing.filter((f) => f.endsWith(".ts")).map((f) => join(REPO, "e2e", f));
  assert.ok(
    tree.includes(join(REPO, "e2e", "run.ts")) &&
      tree.includes(join(REPO, "e2e", "support", "settle.ts")) &&
      tree.includes(join(REPO, "e2e", "suites", "specimen", "desktop.ts")),
    "the listing missed the runner, a support module or a suite's part file, so it is reading the wrong tree",
  );
  assert.deepEqual([...paths].sort(), tree.sort(), "the scan's source list is not every TypeScript file under e2e/");
  assert.deepEqual(
    paths.flatMap((p) => skips(relative(REPO, p), readFileSync(p, "utf8"))),
    [],
    "an e2e file carries a skip; the accepted skips elsewhere are listed in handbook/specs/rulebook.md",
  );
});
