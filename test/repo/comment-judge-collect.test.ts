import assert from "node:assert/strict";
import { test } from "node:test";
import { addedRuns, commentRuns } from "../../scripts/comment-judge/collect.ts";

const shape = (text: string) =>
  commentRuns("src/a.ts", text).map((r) => ({
    line: r.line,
    endLine: r.endLine,
    text: r.text,
    ownLine: r.ownLine,
    code: r.code,
  }));

test("a file's comments join into runs as the citation rule joins them, a comment at the end of a code line, a block one included, a run of its own, and a string is no comment", () => {
  const text = [
    "// one",
    "// two",
    "",
    "/** a doc",
    " * block */",
    "export const x = 1; // beside",
    "const y = 2; /* beside block */",
    'const s = "// not a comment";',
    "",
  ].join("\n");
  const code = 'export const x = 1;\nconst y = 2;\nconst s = "// not a comment";';
  assert.deepEqual(shape(text), [
    { line: 1, endLine: 2, text: "one two", ownLine: true, code },
    { line: 4, endLine: 5, text: "a doc block", ownLine: true, code },
    { line: 6, endLine: 6, text: "beside", ownLine: false, code: "export const x = 1;" },
    { line: 7, endLine: 7, text: "beside block", ownLine: false, code: "const y = 2;" },
  ]);
});

test("an own-line run's code stops at a blank line and at five lines", () => {
  assert.deepEqual(
    commentRuns("src/a.ts", "// c\na\nb\n\nd\n").map((r) => r.code),
    ["a\nb"],
  );
  assert.deepEqual(
    commentRuns("src/a.ts", "// c\n1\n2\n3\n4\n5\n6\n").map((r) => r.code),
    ["1\n2\n3\n4\n5"],
  );
});

test("an added run is one whose text the file did not carry before, so a moved comment is not added", () => {
  const before = "// kept\nconst a = 1;\n// moved\nconst b = 2;\n";
  const after = "const z = 0;\nconst y = 1;\n// new one\nconst c = 3;\n// kept\nconst a = 1;\n// moved\nconst b = 2;\n";
  const added = addedRuns("src/a.ts", before, after);
  assert.deepEqual(
    added.map((r) => [r.line, r.text]),
    [[3, "new one"]],
  );
  assert.equal(addedRuns("src/a.ts", null, after).length, 3);
});
