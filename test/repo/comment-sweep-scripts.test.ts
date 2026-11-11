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
