import assert from "node:assert/strict";
import { test } from "node:test";
import { INSTRUCTION_COMMENTS, isInstruction } from "../../scripts/comment-sweep/instructions.ts";
import { firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

const EACH_INSTRUCTION: Readonly<Record<string, { readonly before: string; readonly after: string }>> = {
  "@ts-": {
    before: '// @ts-expect-error a string is not a number\nconst a: number = "x";\n',
    after: 'const a: number = "x";\n',
  },
  "eslint-disable": { before: "const a = f(); // eslint-disable-line no-x\n", after: "const a = f();\n" },
  "eslint-enable": { before: "/* eslint-enable no-x */\nconst a = f();\n", after: "const a = f();\n" },
  "eslint-env": { before: "/* eslint-env node */\nconst a = f();\n", after: "const a = f();\n" },
  eslint: { before: '/* eslint no-console: "off" */\nconsole.log(1);\n', after: "console.log(1);\n" },
  exported: { before: "/* exported main */\nfunction main() {}\n", after: "function main() {}\n" },
  global: { before: "/* global window */\nwindow.a = 1;\n", after: "window.a = 1;\n" },
  globals: { before: "/* globals a, b */\na(b);\n", after: "a(b);\n" },
  "prettier-ignore": { before: "// prettier-ignore\nconst m = [1,0,\n  0,1];\n", after: "const m = [1,0,\n  0,1];\n" },
  "@__PURE__": { before: "export const a = /* @__PURE__ */ f();\n", after: "export const a = f();\n" },
  "#__PURE__": { before: "export const a = /*#__PURE__*/ f();\n", after: "export const a = f();\n" },
  "@vite-ignore": {
    before: "const m = await import(/* @vite-ignore */ url);\n",
    after: "const m = await import(url);\n",
  },
  "/// <reference": {
    before: '/// <reference types="vite/client" />\nexport const a = 1;\n',
    after: "export const a = 1;\n",
  },
  "#!": { before: "#!/usr/bin/env node\nconsole.log(1);\n", after: "console.log(1);\n" },
  "/*!": { before: "/*! The face, (c) 2007 its maker */\nexport const a = 1;\n", after: "export const a = 1;\n" },
  "@jsx": { before: "/** @jsx h */\nexport const a = 1;\n", after: "export const a = 1;\n" },
  "@jsxImportSource": {
    before: "/** @jsxImportSource preact */\nexport const a = 1;\n",
    after: "export const a = 1;\n",
  },
  "@jsxFrag": { before: "/** @jsxFrag Fragment */\nexport const a = 1;\n", after: "export const a = 1;\n" },
  "@type": { before: "/** @type {number} */\nexport const a = f();\n", after: "export const a = f();\n" },
};

test("every comment the instruction list names has a fixture", () => {
  assert.deepEqual(
    Object.keys(EACH_INSTRUCTION).sort(),
    INSTRUCTION_COMMENTS.map((instruction) => instruction.name).sort(),
  );
});

for (const [entry, f] of Object.entries(EACH_INSTRUCTION))
  test(`an instruction comment removed from a script reads as a change: ${entry}`, () => {
    const read = readerOf("src/a.ts")!;
    assert.notEqual(firstDifference(read(f.before), read(f.after)), null);
  });

const INSTRUCTIONS_BITING = [
  {
    name: "its reason reworded",
    path: "src/a.ts",
    before: '// @ts-expect-error a string\nconst a: number = "x";\n',
    after: '// @ts-expect-error a word\nconst a: number = "x";\n',
  },
  {
    name: "moved to the next statement",
    path: "src/a.ts",
    before: "// eslint-disable-next-line no-x\nconst a = f();\nconst b = g();\n",
    after: "const a = f();\n// eslint-disable-next-line no-x\nconst b = g();\n",
  },
  {
    name: "removed from a sheet",
    path: "src/styles/a.css",
    before: "/* prettier-ignore */\n.a { x: 1; }\n",
    after: ".a { x: 1; }\n",
  },
  {
    name: "a legal comment removed from a sheet",
    path: "src/styles/a.css",
    before: "/*! The face, (c) 2007 its maker */\n.a { x: 1; }\n",
    after: ".a { x: 1; }\n",
  },
  {
    name: "a type tag removed from a doc block's later line",
    path: "src/a.ts",
    before: "/**\n * The width.\n * @type {number}\n */\nexport const w = f();\n",
    after: "/**\n * The width.\n */\nexport const w = f();\n",
  },
  {
    name: "an html comment removed from a page",
    path: "src/pages/a.astro",
    before: "<!-- prettier-ignore -->\n<p>x</p>\n",
    after: "<p>x</p>\n",
  },
  {
    name: "removed from a page's frontmatter",
    path: "src/pages/a.astro",
    before: '---\n// @ts-expect-error why\nconst a: number = "x";\n---\n<p>{a}</p>\n',
    after: '---\nconst a: number = "x";\n---\n<p>{a}</p>\n',
  },
  {
    name: "moved within a page's frontmatter",
    path: "src/pages/a.astro",
    before: '---\n// @ts-expect-error why\nconst a: number = "x";\nconst b = 1;\n---\n',
    after: '---\nconst a: number = "x";\n// @ts-expect-error why\nconst b = 1;\n---\n',
  },
  {
    name: "an empty expression removed from a page",
    path: "src/pages/a.astro",
    before: "<div>{/* prettier-ignore */}<p>x</p></div>\n",
    after: "<div><p>x</p></div>\n",
  },
  {
    name: "removed from a page's script",
    path: "src/pages/a.astro",
    before: "<script>\n// eslint-disable-next-line no-x\nconst b = f();\n</script>\n",
    after: "<script>\nconst b = f();\n</script>\n",
  },
  {
    name: "removed from a page's style",
    path: "src/pages/a.astro",
    before: "<style>\n/* prettier-ignore */\n.a { color: red; }\n</style>\n",
    after: "<style>\n.a { color: red; }\n</style>\n",
  },
];

for (const f of INSTRUCTIONS_BITING)
  test(`an instruction comment edited, moved or removed reads as a change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.notEqual(firstDifference(read(f.before), read(f.after)), null);
  });

const INSTRUCTIONS_QUIET = [
  {
    name: "a comment that names an instruction mid-sentence",
    path: "src/a.ts",
    before: "// see the eslint-disable above\nconst a = 1;\n",
    after: "const a = 1;\n",
  },
  {
    name: "a line comment that opens with an ESLint configuration word",
    path: "src/a.ts",
    before: "// global state lives here\nconst a = 1;\n",
    after: "const a = 1;\n",
  },
  {
    name: "a comment beside an instruction comment in a script",
    path: "src/a.ts",
    before: '// why\n// @ts-expect-error a string\nconst a: number = "x"; // tail\n',
    after: '// @ts-expect-error a string\nconst a: number = "x";\n',
  },
  {
    name: "a comment beside an instruction comment in a sheet",
    path: "src/styles/a.css",
    before: "/* why */\n/* prettier-ignore */\n.a { x: 1; }\n",
    after: "/* prettier-ignore */\n.a { x: 1; }\n",
  },
  {
    name: "comments beside instruction comments in a page",
    path: "src/pages/a.astro",
    before:
      '---\n// why\n// @ts-expect-error a\nconst a: number = "x";\n---\n<!-- c -->\n<!-- prettier-ignore -->\n<p>{a}</p>\n',
    after: '---\n// @ts-expect-error a\nconst a: number = "x";\n---\n<!-- prettier-ignore -->\n<p>{a}</p>\n',
  },
];

for (const f of INSTRUCTIONS_QUIET)
  test(`an ordinary comment removed reads as no change: ${f.name}`, () => {
    const read = readerOf(f.path)!;
    assert.equal(firstDifference(read(f.before), read(f.after)), null);
  });

test("each instruction comment is read the way the tool that obeys it reads it, and a comment that tool would not obey is not", () => {
  const instructions = [
    "// @ts-expect-error why",
    "/// @ts-nocheck",
    "/* @ts-ignore */",
    "/*\n * why\n * @ts-expect-error */",
    "/* eslint-disable */",
    "/*eslint-disable-next-line no-x*/",
    "// eslint-disable-line no-x",
    "// eslint-disable-next-line no-x -- why",
    "/* eslint-enable no-x */",
    "/* eslint-env node */",
    '/* eslint no-console: "off" */',
    "/* exported main */",
    "/* global window */",
    "/* globals a, b */",
    "// prettier-ignore",
    "/* prettier-ignore */",
    "<!-- prettier-ignore -->",
    "/* @__PURE__ */",
    "// @__PURE__",
    "/*#__PURE__*/",
    "// #__PURE__",
    "/* @vite-ignore */",
    '/// <reference types="node" />',
    '/// <Reference path="a.ts" />',
    "#!/usr/bin/env node",
    "/*! license */",
    "/**! license */",
    "//! license",
    "/** @jsx h */",
    "/*\n * doc\n * @jsx h\n */",
    "/** @JSX h */",
    "/** @jsxImportSource preact */",
    "/** @jsxFrag Fragment */",
    "/** @type {number} */",
    "/**@type {number}*/",
    "/**\n * The width.\n * @type {number}\n */",
  ];
  const ordinary = [
    "// a note",
    "<!-- a note -->",
    "// see the eslint-disable above",
    "/* @ts-expect-error\n */",
    "// eslint-disable",
    "/* eslint-disabled */",
    "/** eslint-disable */",
    "// global state lives here",
    "/* globally unique */",
    "// exported for the tests",
    "// prettier-ignore, which Prettier does not obey",
    "/** prettier-ignore */",
    "/* a note @__PURE__ */",
    "/** @__PURE__ */",
    "/* @vite-ignore this */",
    '// <reference types="node" />',
    "/* ! spaced */",
    "// @jsx h",
    "/** @jsxRuntime classic */",
    "/* @type {number} */",
    "/** @typedef {number} N */",
    "/** a@type {number} */",
  ];
  assert.deepEqual(
    instructions.filter((c) => !isInstruction(c)),
    [],
  );
  assert.deepEqual(
    ordinary.filter((c) => isInstruction(c)),
    [],
  );
});
