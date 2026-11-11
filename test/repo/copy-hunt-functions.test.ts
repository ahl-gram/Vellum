import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import { functionsAt, functionsIn, isHuntedPath } from "../../scripts/copy-hunt/functions.ts";
import { ALPHA, ALPHA_COPY, KINDS, OTHER, TINY } from "../../test-support/copy-hunt-fixtures.ts";

const UNREAD = [
  "class Box {",
  "  private size = 0;",
  "  constructor(size: number) {",
  "    this.size = size;",
  "  }",
  "  get area(): number {",
  "    return this.size * this.size;",
  "  }",
  "  set area(value: number) {",
  "    this.size = Math.sqrt(value);",
  "  }",
  "}",
  "let later: (n: number) => number;",
  "later = (n: number): number => n + 1;",
  "const holder: { p?: (n: number) => number } = {};",
  "holder.p = (n: number): number => n * 2;",
  "",
].join("\n");

test("a function declaration, a const arrow or function expression, a method with a body and an object-literal member are read at any depth, with the owner's name, the lines and the text with comments removed; a getter, a setter, a constructor and an arrow assigned to an existing name are not", () => {
  const fns = functionsIn("src/k.ts", KINDS);
  assert.deepEqual(
    fns.map((f) => [f.name, f.line, f.end]),
    [
      ["declared", 1, 4],
      ["arrow", 5, 5],
      ["expression", 6, 8],
      ["Store.get", 10, 12],
      [".read", 15, 15],
      [".write", 16, 16],
      ["outer", 18, 21],
      ["inner", 19, 19],
    ],
  );
  assert.equal(
    fns[0]!.body,
    "export function declared(first: number, second: number): number {\n  return first + second;\n}",
  );
  assert.equal(fns[1]!.body, "const arrow = (value: number): number => value * 2;");
  assert.deepEqual(functionsIn("src/u.ts", UNREAD), []);
});

test("a function's names leave out the common words and one-letter names, its text collapses white space, and its hash is the first 16 hex digits of the text's sha256", () => {
  const a = functionsIn("src/a.ts", ALPHA)[0]!;
  assert.deepEqual(a.tokens, ["Item", "alpha", "item", "items", "left", "limit", "right", "sort", "weight"]);
  assert.deepEqual(functionsIn("src/e.ts", TINY)[0]!.tokens, ["tiny"]);
  assert.equal(
    a.norm,
    "export const alpha = (items: readonly Item[], limit: number): Item[] => items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight);",
  );
  assert.equal(a.hash, "a070d6cdc7bcc32e");
  const copy = functionsIn("src/b.ts", ALPHA_COPY)[0]!;
  assert.equal(copy.hash, "a070d6cdc7bcc32e");
  assert.equal(copy.line, 2);
});

test("a path is hunted when it is a .ts file, not a declaration file, under one of the lint's roots", () => {
  for (const path of ["src/a.ts", "e2e/x.ts", "test-support/y.ts"]) assert.equal(isHuntedPath(path), true, path);
  for (const path of ["src/a.d.ts", "src/styles/a.css", "design/a.ts", "handbook/plans/a.ts", "srcx/a.ts"])
    assert.equal(isHuntedPath(path), false, path);
});

test("a tree's functions come root by root in path order, and a file that does not parse is listed as not read, never dropped", () => {
  const tree = memoryTree("t", {
    "src/b.ts": ALPHA_COPY,
    "src/a.ts": ALPHA,
    "e2e/z.ts": OTHER,
    "src/bad.ts": "export const = ;\n",
    "src/note.md": "x\n",
    "docs/c.ts": ALPHA,
  });
  const { fns, unread } = functionsAt(tree);
  assert.deepEqual(
    fns.map((f) => f.file),
    ["e2e/z.ts", "src/a.ts", "src/b.ts"],
  );
  assert.equal(unread.length, 1);
  assert.equal(unread[0]!.file, "src/bad.ts");
  assert.ok(unread[0]!.reason.startsWith("src/bad.ts does not parse"), unread[0]!.reason);
});
