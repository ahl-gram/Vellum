import assert from "node:assert/strict";
import { test } from "node:test";
import { firstDifference, readerOf } from "../../scripts/comment-sweep/verify.ts";

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
