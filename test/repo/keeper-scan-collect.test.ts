import assert from "node:assert/strict";
import { test } from "node:test";
import { BY_HAND, DELETED_FILE, deletedRuns, filesToRead, OUTSIDE_ROOTS } from "../../scripts/keeper-scan/collect.ts";

test("a deleted run is one whose text the file no longer carries, read at the base with its line and the code beside it there, so a trimmed comment is deleted and a moved one is not", () => {
  const before =
    "// kept\nconst a = 1;\n// gone\nconst b = 2;\n// one two three\nconst c = 3;\n// moved\nconst d = 4;\n";
  const after = "// moved\nconst z = 0;\n// kept\nconst a = 1;\nconst b = 2;\n// one two\nconst c = 3;\nconst d = 4;\n";
  assert.deepEqual(
    deletedRuns("src/a.ts", before, after).map((r) => [r.line, r.text, r.code]),
    [
      [3, "gone", "const b = 2;"],
      [5, "one two three", "const c = 3;"],
    ],
  );
});

test("the scan reads every TypeScript file under the lint's roots the branch edits or renames, and names each sheet or page it edits and each such file it deletes as not read", () => {
  const { read, notRead } = filesToRead(
    [
      { path: "src/a.ts", before: "src/a.ts" },
      { path: "src/b.ts", before: null },
      { path: "src/styles/a.css", before: "src/styles/a.css" },
      { path: "src/pages/p.astro", before: "src/pages/p.astro" },
      { path: "handbook/x.md", before: "handbook/x.md" },
      { path: "src/c.ts", before: "src/old.ts" },
    ],
    ["src/d.ts", "src/styles/old.css", "notes.md"],
  );
  assert.deepEqual(
    read.map((c) => c.path),
    ["src/a.ts", "src/c.ts"],
  );
  assert.deepEqual(notRead, [
    { path: "src/styles/a.css", reason: BY_HAND },
    { path: "src/pages/p.astro", reason: BY_HAND },
    { path: "src/d.ts", reason: DELETED_FILE },
    { path: "src/styles/old.css", reason: DELETED_FILE },
  ]);
});

test("a TypeScript file outside the lint's roots that the branch edits or deletes is named as not read, a file it adds or a declaration file is not, and none is scanned", () => {
  const { read, notRead } = filesToRead(
    [
      { path: "eslint.config.ts", before: "eslint.config.ts" },
      { path: "design/r/x.ts", before: "design/r/x.ts" },
      { path: "astro.config.ts", before: null },
      { path: "src/types.d.ts", before: "src/types.d.ts" },
      { path: "src/e.ts", before: "src/e.ts" },
    ],
    ["prettier.config.ts", "src/old.d.ts"],
  );
  assert.deepEqual(
    read.map((c) => c.path),
    ["src/e.ts"],
  );
  assert.deepEqual(notRead, [
    { path: "eslint.config.ts", reason: OUTSIDE_ROOTS },
    { path: "design/r/x.ts", reason: OUTSIDE_ROOTS },
    { path: "prettier.config.ts", reason: DELETED_FILE },
  ]);
});
