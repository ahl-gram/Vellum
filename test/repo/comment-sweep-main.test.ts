import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { main, verify } from "../../scripts/comment-sweep/main.ts";
import { exitOf, reportLines } from "../../scripts/comment-sweep/report.ts";
import type { Finding } from "../../scripts/comment-sweep/verify.ts";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { git } from "../../test-support/sandbox-repo.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const THREE_IDENTICAL =
  "comment-sweep verify: 3 changed files; identical 3, differ 0, added 0, deleted 0, renamed 0, not read 0, prose 0";

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

test("a branch that only cuts comments, from a script, a sheet and a page, verifies against its merge base with main, before main is merged in and after", async () => {
  await withTempRepo(
    {
      "src/a.ts": "// lead\nexport const a = 1; // px\n",
      "src/styles/a.css": "/* head */\n.a {\n  color: red; /* why */\n}\n",
      "src/pages/p.astro": "---\nconst x = 1;\n---\n<!-- c -->\n<p>{x}</p>\n",
      "src/b.ts": "export const b = 1;\n",
    },
    (dir, base) => {
      git(["checkout", "-q", "-b", "sweep"], dir);
      writeFiles(dir, {
        "src/a.ts": "export const a = 1;\n",
        "src/styles/a.css": ".a {\n  color: red;\n}\n",
        "src/pages/p.astro": "---\nconst x = 1;\n---\n<p>{x}</p>\n",
      });
      const cut = commitAll(dir, "cut");
      git(["checkout", "-q", "main"], dir);
      writeFiles(dir, { "src/b.ts": "export const b = 2;\n" });
      const moved = commitAll(dir, "feature");
      git(["checkout", "-q", "sweep"], dir);
      assert.deepEqual(verify(dir, "main", "sweep"), {
        lines: [`comment-sweep verify, read from ${base} to ${cut}`, THREE_IDENTICAL],
        code: 0,
      });
      git(["merge", "-q", "--no-edit", "main"], dir);
      const merged = git(["rev-parse", "HEAD"], dir);
      assert.deepEqual(verify(dir, "main", "HEAD"), {
        lines: [`comment-sweep verify, read from ${moved} to ${merged}`, THREE_IDENTICAL],
        code: 0,
      });
    },
  );
});

test("a branch that changes code, adds, renames and deletes files, and touches a kind the verifier does not read reports each and exits 1", async () => {
  await withTempRepo(
    {
      "src/a.ts": "export const a = 1;\n",
      "src/d.ts": "export const d = 1;\n",
      "src/r.ts": "export const r = 1;\nexport const rr = 2;\nexport const rrr = 3;\n",
      "data/x.json": "{}\n",
    },
    (dir, base) => {
      git(["checkout", "-q", "-b", "sweep"], dir);
      rmSync(join(dir, "src/d.ts"));
      git(["mv", "src/r.ts", "src/s.ts"], dir);
      writeFiles(dir, {
        "src/a.ts": "export const a = 2;\n",
        "src/n.ts": "export const n = 1;\n",
        "handbook/x.md": "x\n",
        "data/x.json": "{ }\n",
      });
      const head = commitAll(dir, "not a sweep");
      assert.deepEqual(verify(dir, "main", "HEAD"), {
        lines: [
          `comment-sweep verify, read from ${base} to ${head}`,
          "NOT READ data/x.json: the verifier reads TypeScript, JavaScript, sheets and pages only",
          "PROSE handbook/x.md",
          'DIFFERS src/a.ts: base line 1 "1", head line 1 "2"',
          "ADDED src/n.ts",
          "RENAMED src/r.ts to src/s.ts",
          "DELETED src/d.ts",
          "comment-sweep verify: 6 changed files; identical 0, differ 1, added 1, deleted 1, renamed 1, not read 1, prose 1",
        ],
        code: 1,
      });
    },
  );
});

test("the command takes verify and two refs, and anything else is a usage error", () => {
  assert.equal(main(["verify", "a"], ROOT), 2);
  assert.equal(main(["diff", "a", "b"], ROOT), 2);
  assert.equal(main(["verify", "a", "--dry-run"], ROOT), 2);
  assert.equal(main(["verify", "a", "b", "c"], ROOT), 2);
  assert.equal(main([], ROOT), 2);
});
