import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateFinder } from "../../scripts/comment-judge/candidates.ts";
import { commentRuns } from "../../scripts/comment-judge/collect.ts";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";

const HEAD = 'import assert from "node:assert/strict";\nimport { test } from "node:test";\n';
const FILES: Record<string, string> = {
  "src/m.ts": [
    "// f doubles its input",
    "export const f = (n: number): number => n * 2;",
    "export const g = (): number => 1;",
    "export type T = number;",
    "",
  ].join("\n"),
  "test/a.test.ts": [
    HEAD + 'import { f, g } from "../src/m.ts";',
    "",
    'test("f doubles", () => {',
    "  assert.equal(f(2), 4);",
    "});",
    "",
    'test("g is one", () => {',
    "  assert.equal(g(), 1);",
    "});",
    "",
    'test("nothing from m", () => {',
    "  assert.equal(1, 1);",
    "});",
    "",
  ].join("\n"),
  "test/b.test.ts": [
    HEAD,
    'test("a local f", () => {',
    "  const f = (n: number): number => n * 2;",
    "  assert.equal(f(2), 4);",
    "});",
    "",
  ].join("\n"),
  "test/c.test.ts": [
    HEAD + 'import type { T } from "../src/m.ts";',
    "",
    'test("a type only", () => {',
    "  const x: T = 1;",
    "  assert.equal(x, 1);",
    "});",
    "",
  ].join("\n"),
  "test/helper.ts": [
    HEAD + 'import { f } from "../src/m.ts";',
    "",
    'test("a helper is no unit test", () => {',
    "  assert.equal(f(2), 4);",
    "});",
    "",
  ].join("\n"),
  "test/d.test.ts": [
    HEAD,
    'test("sums", () => {',
    "  // the sum of two and two",
    "  const s = 2 + 2;",
    "  assert.equal(s, 4);",
    "});",
    "",
  ].join("\n"),
  "test/e.test.ts": [
    HEAD,
    "// the table's two rows",
    "const table = [1, 2];",
    "",
    'test("ignores it", () => {',
    "  assert.equal(1, 1);",
    "});",
    "",
    'test("uses the table", () => {',
    "  assert.equal(table.length, 2);",
    "});",
    "",
    "// the limit is three",
    "const limit = 3;",
    "",
    'test("uses the limit", () => {',
    "  assert.equal(limit, 3);",
    "});",
    "",
    "const rows = [",
    "  1, // the first row",
    "  2,",
    "];",
    "",
    'test("uses the rows", () => {',
    "  assert.equal(rows[0], 1);",
    "});",
    "",
  ].join("\n"),
  "test/o.test.ts": [
    HEAD + 'import { f } from "../src/other.ts";',
    "",
    'test("another module\'s f", () => {',
    "  assert.equal(f(2), 4);",
    "});",
    "",
  ].join("\n"),
  "test/s.test.ts": [
    HEAD + 'import { g, type T } from "../src/m.ts";',
    "",
    'test("a type specifier only", () => {',
    "  const x: T = 1;",
    "  assert.equal(x, 1);",
    "});",
    "",
  ].join("\n"),
};

const tree = memoryTree("t", FILES);
const candidatesOf = (file: string, text: string) => {
  const run = commentRuns(file, FILES[file]!).find((r) => r.text === text);
  assert.ok(run, `no comment reads ${text} in ${file}`);
  return candidateFinder(tree)(run);
};
const placesOf = (file: string, text: string) => candidatesOf(file, text).map((c) => [c.file, c.name]);

test("a comment in a source file is asked about every test, in a file that imports the module by a value import, whose body names a binding it imports", () => {
  const found = candidatesOf("src/m.ts", "f doubles its input");
  assert.deepEqual(
    found.map((c) => [c.file, c.name]),
    [
      ["test/a.test.ts", "f doubles"],
      ["test/a.test.ts", "g is one"],
    ],
  );
  assert.equal(found[0]!.body, 'test("f doubles", () => {\n  assert.equal(f(2), 4);\n});');
});

test("a comment inside a test is asked about that test alone, sent without its comments", () => {
  assert.deepEqual(candidatesOf("test/d.test.ts", "the sum of two and two"), [
    {
      file: "test/d.test.ts",
      name: "sums",
      body: 'test("sums", () => {\n  const s = 2 + 2;\n  assert.equal(s, 4);\n});',
    },
  ]);
});

test("a comment in a test file outside every test is asked about the tests that name what it declares", () => {
  assert.deepEqual(placesOf("test/e.test.ts", "the table's two rows"), [["test/e.test.ts", "uses the table"]]);
  assert.deepEqual(placesOf("test/e.test.ts", "the limit is three"), [["test/e.test.ts", "uses the limit"]]);
  assert.deepEqual(placesOf("test/e.test.ts", "the first row"), [["test/e.test.ts", "uses the rows"]]);
});
