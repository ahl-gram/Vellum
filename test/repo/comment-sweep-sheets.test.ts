import assert from "node:assert/strict";
import { test } from "node:test";
import { firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

const SHEETS_BITING = [
  {
    name: "a deleted declaration",
    path: "src/styles/a.css",
    before: ".a {\n  color: red;\n  margin: 0;\n}\n",
    after: ".a {\n  color: red;\n}\n",
  },
  { name: "a changed value", path: "src/styles/a.css", before: ".a { color: red; }\n", after: ".a { color: blue; }\n" },
  { name: "a changed selector", path: "src/styles/a.css", before: ".a .b { x: 1; }\n", after: ".a .c { x: 1; }\n" },
  {
    name: "a descendant combinator joined",
    path: "src/styles/a.css",
    before: ".a .b { x: 1; }\n",
    after: ".a.b { x: 1; }\n",
  },
  {
    name: "a dropped media query",
    path: "src/styles/a.css",
    before: "@media (min-width: 40rem) {\n  .a { x: 1; }\n}\n",
    after: ".a { x: 1; }\n",
  },
  {
    name: "a comment-shaped run removed inside a url",
    path: "src/styles/a.css",
    before: ".a { background: url(a/*b*/c.png); }\n",
    after: ".a { background: url(ac.png); }\n",
  },
];

for (const f of SHEETS_BITING)
  test(`a rule change in a sheet reads as a change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.notEqual(firstDifference(read(f.before), read(f.after)), null);
  });

const SHEETS_QUIET = [
  {
    name: "leading, trailing and own-line comments removed",
    path: "src/styles/a.css",
    before: "/* head */\n.a {\n  color: red; /* why */\n  /* own line */\n  margin: 0;\n}\n",
    after: ".a {\n  color: red;\n  margin: 0;\n}\n",
  },
  {
    name: "reindented",
    path: "src/styles/a.css",
    before: ".a {\n  color: red;\n}\n",
    after: ".a {\n    color: red;\n}\n",
  },
];

for (const f of SHEETS_QUIET)
  test(`a comment-only edit in a sheet reads as no change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.equal(firstDifference(read(f.before), read(f.after)), null);
  });
