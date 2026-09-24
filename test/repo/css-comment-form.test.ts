import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const ONE_LINE = "vellum/css-comment-one-line";
const NO_EM_DASH = "vellum/css-comment-no-em-dash";
const ISSUE_FORM = "vellum/css-comment-issue-form";

const lintSheet = async (text: string, name = "lint-plant.css"): Promise<Array<[string | null, number]>> => {
  const results = await eslint.lintText(text, { filePath: join(ROOT, "public", name) });
  return results.flatMap((r) => r.messages.map((m): [string | null, number] => [m.ruleId, m.line]));
};

// Every house form sits in its own comment, so a rule that starts firing on one of them reds on a line that was clean, not inside a comment that reds anyway.
const PLANT = [
  "/* head block, line one of two, which may wrap between the word Issue",
  "   #13 and its number, as here */",
  ".a { color: red; }",
  "/* a mid-file two-liner",
  "   is not allowed */",
  ".b { color: #1a2b3c; } /* the ink is #1a2b3c */",
  "/* an em-dash \u2014 here */",
  "/* fixed in #12 */",
  "/* Issue #13 */",
  "/* PR #14 */",
  "/* issue #15 */",
  "/* pr #16 */",
  "/* Issues #17 */",
  "/* Issue#18 */",
  "/* the colour #123456 */",
  "/* a reissue #19 is not an Issue */",
  "/* nor are reissues #20 */",
  "/* nor is a shopr #21 a PR: the word must stand alone before the number */",
  '.c { content: "/* #99 */"; }',
  "/* a wider one, Chrome 137 */",
].join("\n");

test("the three form rules red on exactly the planted lines and nowhere else", async () => {
  assert.deepEqual(await lintSheet(PLANT), [
    [ONE_LINE, 4],
    [NO_EM_DASH, 7],
    [ISSUE_FORM, 8],
    [ISSUE_FORM, 14],
    [ISSUE_FORM, 15],
    [ISSUE_FORM, 16],
    [ISSUE_FORM, 17],
    [ISSUE_FORM, 18],
  ]);
});

test("the file-head block is the comment nothing but whitespace precedes; a rule before it makes it mid-file", async () => {
  assert.deepEqual(await lintSheet("\n\n/* two blank lines\n   then a block */\n.a { color: red; }\n"), []);
  assert.deepEqual(await lintSheet(".a { color: red; }\n/* a block\n   after a rule */\n"), [[ONE_LINE, 2]]);
});

test("the sheets parse tolerant: a syntax css-tree does not know is not a lint error, and the comments past it are still read", async () => {
  assert.deepEqual(await lintSheet(".a { width: if(style(--x: 1): 2px; else: 3px); }\n/* see #12 */\n"), [[ISSUE_FORM, 2]]);
});

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith(".css") ? [path] : [];
  });

test("every sheet under public/ that the lint reads satisfies the three form rules", async () => {
  const onDisk = walk(join(ROOT, "public"));
  const unread = await Promise.all(onDisk.map((path) => eslint.isPathIgnored(path)));
  const sheets = onDisk.filter((_, i) => !unread[i]);
  assert.ok(sheets.length >= 19, `the population is ${sheets.length} sheets; the tracked set is 19`);
  const results = await eslint.lintFiles(sheets);
  const offenders = results.flatMap((r) => r.messages.map((m) => `${r.filePath.slice(ROOT.length + 1)}:${m.line} ${m.ruleId ?? "fatal"}`));
  assert.deepEqual(offenders, []);
});
