import assert from "node:assert/strict";
import { test } from "node:test";
import { firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

const SCRIPTS_BITING = [
  { name: "a changed identifier", path: "src/a.ts", before: "const a = 1;\n", after: "const b = 1;\n" },
  { name: "a changed string", path: "src/a.ts", before: 'const a = "x";\n', after: 'const a = "y";\n' },
  {
    name: "a changed regular-expression body",
    path: "src/a.ts",
    before: "const r = /a+b/g;\n",
    after: "const r = /a+c/g;\n",
  },
  {
    name: "a changed regular-expression flag",
    path: "src/a.ts",
    before: "const r = /a+b/g;\n",
    after: "const r = /a+b/;\n",
  },
  {
    name: "a changed template literal",
    path: "src/a.ts",
    before: "const t = `a ${b} c`;\n",
    after: "const t = `a ${b} d`;\n",
  },
  {
    name: "a comment removed inside a template literal, which is string data",
    path: "src/a.ts",
    before: "const t = `x // not a comment\ny`;\n",
    after: "const t = `x\ny`;\n",
  },
  {
    name: "a dropped default argument",
    path: "src/a.ts",
    before: "export const f = (n = 3): number => n;\n",
    after: "export const f = (n): number => n;\n",
  },
  {
    name: "a dropped type annotation",
    path: "src/a.ts",
    before: "export const f = (n: number) => n;\n",
    after: "export const f = (n) => n;\n",
  },
  {
    name: "a return joined to its value",
    path: "src/a.ts",
    before: "function f() {\n  return\n  x;\n}\n",
    after: "function f() {\n  return x;\n}\n",
  },
];

for (const f of SCRIPTS_BITING)
  test(`a code change in a script reads as a change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.notEqual(firstDifference(read(f.before), read(f.after)), null);
  });

const SCRIPTS_QUIET = [
  {
    name: "line, block and trailing comments removed",
    path: "src/a.ts",
    before: "// lead\nconst a = 1; // px\n/* block */\nexport const b = a + 2; /* tail */\n",
    after: "const a = 1;\nexport const b = a + 2;\n",
  },
  {
    name: "a doc block reworded",
    path: "src/a.ts",
    before:
      "/** Returns the width in cells. @param n the count */\nexport function w(n: number): number {\n  return n * 2;\n}\n",
    after: "/** The width, in cells. */\nexport function w(n: number): number {\n  return n * 2;\n}\n",
  },
  {
    name: "a doc block removed",
    path: "src/a.ts",
    before: "/**\n * Doc.\n * @returns x\n */\nexport const f = (): number => 1;\n",
    after: "export const f = (): number => 1;\n",
  },
  {
    name: "blank lines collapsed",
    path: "src/a.ts",
    before: "const a = 1;\n\n\n\nconst b = 2;\n",
    after: "const a = 1;\n\nconst b = 2;\n",
  },
  {
    name: "reindented, a blind spot",
    path: "src/a.ts",
    before: "if (x) {\n  y();\n}\n",
    after: "if (x) {\n        y();\n}\n",
  },
  {
    name: "a comment beside a regular expression holding a backtick",
    path: "src/a.ts",
    before: "const r = /`/; // why\nconst s = `a`;\n",
    after: "const r = /`/;\nconst s = `a`;\n",
  },
  {
    name: "a comment beside a regular expression holding a block-comment opener",
    path: "src/a.ts",
    before: "const r = /a\\/*b/;\nconst x = 1; /* note */\nconst y = 2;\n",
    after: "const r = /a\\/*b/;\nconst x = 1;\nconst y = 2;\n",
  },
];

for (const f of SCRIPTS_QUIET)
  test(`a comment-only edit in a script reads as no change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.equal(firstDifference(read(f.before), read(f.after)), null);
  });
