import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import { scriptTokens } from "../../scripts/comment-sweep/tokens.ts";
import { findingsOf, firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

const READ = [
  "src/a.ts",
  "src/a.mts",
  "src/a.cts",
  "src/a.d.ts",
  "src/a.tsx",
  "design/a.js",
  "design/a.mjs",
  "design/a.cjs",
  "src/styles/a.css",
  "src/pages/a.astro",
];
const NOT_READ = ["CLAUDE.md", "data/x.json", ".github/workflows/ci.yml", "scripts/cloud-setup.sh", "src/static/a.svg"];

test("the verifier reads TypeScript, JavaScript, sheets and pages, and no other kind", () => {
  assert.deepEqual(
    READ.filter((path) => readerOf(path) === null),
    [],
  );
  assert.deepEqual(
    NOT_READ.filter((path) => readerOf(path) !== null),
    [],
  );
});

test("the first difference is the first pair of token texts that differ, its line advanced past the breaks before the first differing character, and a shift in line alone is no difference", () => {
  assert.deepEqual(
    firstDifference(
      [
        { text: "same", line: 1 },
        { text: "`0123456789abcdefghijklmnopqrstuvwxyz\nX tail`", line: 4 },
      ],
      [
        { text: "same", line: 1 },
        { text: "`0123456789abcdefghijklmnopqrstuvwxyz\nY tail`", line: 4 },
      ],
    ),
    {
      base: { line: 5, text: "hijklmnopqrstuvwxyz\nX tail`" },
      head: { line: 5, text: "hijklmnopqrstuvwxyz\nY tail`" },
    },
  );
  assert.deepEqual(
    firstDifference(
      [
        { text: "a", line: 1 },
        { text: "b", line: 2 },
      ],
      [{ text: "a", line: 1 }],
    ),
    { base: { line: 2, text: "b" }, head: null },
  );
  assert.equal(firstDifference([{ text: "a", line: 1 }], [{ text: "a", line: 3 }]), null);
  assert.equal(firstDifference([], []), null);
});

test("each changed path gets one finding, prose first, then added, renamed, not read, and the token comparison, and each deleted path is deleted or prose", () => {
  const before = memoryTree("b1", {
    "src/a.ts": "const a = 1; // c\n",
    "src/b.ts": "const b = 1;\n",
    "src/styles/a.css": "/* c */\n.a { x: 1; }\n",
    "src/pages/p.astro": "<!-- c -->\n<p>x</p>\n",
  });
  const after = memoryTree("h1", {
    "src/a.ts": "const a = 1;\n",
    "src/b.ts": "const b = 2;\n",
    "src/styles/a.css": ".a { x: 1; }\n",
    "src/pages/p.astro": "<p>x</p>\n",
  });
  const changed = [
    { path: "handbook/x.md", before: null },
    { path: "src/a.ts", before: "src/a.ts" },
    { path: "src/b.ts", before: "src/b.ts" },
    { path: "src/n.ts", before: null },
    { path: "src/s.ts", before: "src/r.ts" },
    { path: "data/x.json", before: "data/x.json" },
    { path: "src/styles/a.css", before: "src/styles/a.css" },
    { path: "src/pages/p.astro", before: "src/pages/p.astro" },
    { path: "handbook/m.md", before: "handbook/m.md" },
    { path: "handbook/z.md", before: "src/z.ts" },
  ];
  assert.deepEqual(findingsOf(changed, ["src/d.ts", "handbook/old.md"], before, after), [
    { kind: "prose", path: "handbook/x.md" },
    { kind: "identical", path: "src/a.ts" },
    { kind: "differs", path: "src/b.ts", difference: { base: { line: 1, text: "1" }, head: { line: 1, text: "2" } } },
    { kind: "added", path: "src/n.ts" },
    { kind: "renamed", path: "src/s.ts", before: "src/r.ts" },
    { kind: "not read", path: "data/x.json" },
    { kind: "identical", path: "src/styles/a.css" },
    { kind: "identical", path: "src/pages/p.astro" },
    { kind: "prose", path: "handbook/m.md" },
    { kind: "renamed", path: "handbook/z.md", before: "src/z.ts" },
    { kind: "deleted", path: "src/d.ts" },
    { kind: "prose", path: "handbook/old.md" },
  ]);
});

test("a tsx file is read as JSX and a ts file is not", () => {
  const jsx = 'export const f = () => <div className="a">{x}</div>;\n';
  assert.ok(scriptTokens("src/a.tsx", jsx).some((t) => t.text === "JsxElement"));
  assert.ok(!scriptTokens("src/a.ts", jsx).some((t) => t.text === "JsxElement"));
});
