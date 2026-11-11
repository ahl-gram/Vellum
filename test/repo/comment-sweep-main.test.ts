import assert from "node:assert/strict";
import { test } from "node:test";
import { exitOf, reportLines } from "../../scripts/comment-sweep/report.ts";
import type { Finding } from "../../scripts/comment-sweep/verify.ts";

test("the report lists every finding but an identical one, in order, with the first difference on each side, and counts each kind", () => {
  const findings: Finding[] = [
    { kind: "prose", path: "handbook/x.md" },
    { kind: "identical", path: "src/a.ts" },
    {
      kind: "differs",
      path: "src/b.ts",
      difference: { base: { line: 3, text: "1" }, head: { line: 2, text: "2" } },
    },
    { kind: "added", path: "src/n.ts" },
    { kind: "renamed", path: "src/s.ts", before: "src/r.ts" },
    { kind: "not read", path: "data/x.json" },
    { kind: "differs", path: "src/c.ts", difference: { base: { line: 9, text: "x" }, head: null } },
    { kind: "deleted", path: "src/d.ts" },
  ];
  assert.deepEqual(reportLines(findings, "b1", "h1"), [
    "comment-sweep verify, read from b1 to h1",
    "PROSE handbook/x.md",
    'DIFFERS src/b.ts: base line 3 "1", head line 2 "2"',
    "ADDED src/n.ts",
    "RENAMED src/r.ts to src/s.ts",
    "NOT READ data/x.json: the verifier reads TypeScript, JavaScript, sheets and pages only",
    'DIFFERS src/c.ts: base line 9 "x", head the end of the file',
    "DELETED src/d.ts",
    "comment-sweep verify: 8 changed files; identical 1, differ 2, added 1, deleted 1, renamed 1, not read 1, prose 1",
  ]);
  assert.equal(exitOf(findings), 1);
  assert.equal(
    exitOf([
      { kind: "identical", path: "a.ts" },
      { kind: "prose", path: "b.md" },
    ]),
    0,
  );
  assert.equal(exitOf([]), 0);
});
