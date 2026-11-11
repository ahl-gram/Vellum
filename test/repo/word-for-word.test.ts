import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import { ACCEPTED_COPIES, type AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import { functionsIn } from "../../scripts/copy-hunt/functions.ts";
import wordForWord, { readCounts } from "../../scripts/lint/word-for-word.ts";
import { ALPHA, ALPHA_COPY, ALPHA_NEAR, OTHER, TINY } from "../../test-support/copy-hunt-fixtures.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { commitAll, withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { git } from "../../test-support/sandbox-repo.ts";
import { eslint, resolvedRule } from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/no-word-for-word-copy";
const TAIL =
  ": fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)";
const IGNORED = ALPHA_NEAR.replace("alphaOf", "alphaIgnored");
const UNTRACKED = ALPHA_NEAR.replace("alphaOf", "alphaUntracked");
const ENDS_AT = ALPHA_NEAR.split("\n")[1]!.length + 1;
const BLIND_SPOTS =
  "BLIND SPOTS, declared, each toward passing: a function with fewer than 6 names; the body of a test(...) call or any unnamed callback; a function the shared reader does not read: one wrapped in as, satisfies or ! in a declaration, an assignment or an object member, or in parentheses in a declaration or an object member, a class field's arrow or function expression, the outer name of a chained declaration, and an export default function or arrow; a copy whose text differs in anything but white space and comments, an export keyword or a name among them; any file but a .ts under the lint's roots, and one git ignores; and, in a long-lived ESLint process such as an editor's, a file changed after the process first read the tree.";

const verify = (dir: string, path: string, text: string, options: unknown, cwd = dir): Linter.LintMessage[] =>
  new Linter({ cwd }).verify(
    text,
    [
      {
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { vellum: wordForWord },
        rules: { [RULE]: ["error", options] },
      },
    ],
    join(dir, path),
  );
const reports = (
  dir: string,
  path: string,
  text: string,
  accepted: readonly AcceptedCopy[] = [],
  roots: readonly string[] = ["src", "test"],
  cwd = dir,
): string[] => verify(dir, path, text, { root: dir, roots, accepted }, cwd).map((m) => `${m.line} ${m.message}`);

test("a function word for word another under the lint's roots is refused at its own line, naming each copy, the file's own among them, read from the text being linted; a copy outside the roots or in a file git ignores, one of fewer than six names, the function itself and a listed pair are not (Issue #1332)", async () => {
  await withTempRepo(
    {
      "src/a.ts": ALPHA,
      "src/d.ts": TINY,
      "src/h.ts": OTHER,
      "docs/z.ts": ALPHA_NEAR,
      ".gitignore": "src/ignored.ts\n",
    },
    (dir) => {
      writeFiles(dir, { "src/ignored.ts": IGNORED, "test/untracked.test.ts": UNTRACKED });
      const [original] = functionsIn("src/a.ts", ALPHA);
      const [copy] = functionsIn("src/b.ts", ALPHA_COPY);
      const listed: AcceptedCopy = {
        a: { file: "src/a.ts", name: original!.name, hash: original!.hash },
        b: { file: "src/b.ts", name: copy!.name, hash: copy!.hash },
        reason: "kept on purpose",
        ruling: "https://github.com/ahl-gram/Vellum/issues/1#issuecomment-2",
      };
      assert.deepEqual(
        {
          copy: reports(dir, "src/b.ts", ALPHA_COPY),
          subfolder: reports(dir, "src/b.ts", ALPHA_COPY, [], ["src", "test"], join(dir, "src")),
          subfolderSelf: reports(dir, "src/a.ts", ALPHA, [], ["src", "test"], join(dir, "src")),
          listed: reports(dir, "src/b.ts", ALPHA_COPY, [listed]),
          self: reports(dir, "src/a.ts", ALPHA),
          buffer: reports(dir, "src/a.ts", OTHER),
          twice: reports(dir, "src/g.ts", `${ALPHA_NEAR}${ALPHA_NEAR}`),
          outside: reports(dir, "src/c.ts", ALPHA_NEAR),
          tiny: reports(dir, "src/e.ts", TINY),
          ignored: reports(dir, "src/m.ts", IGNORED),
          untracked: reports(dir, "src/k.ts", UNTRACKED),
        },
        {
          copy: [`2 alpha is word for word alpha at src/a.ts:1${TAIL}`],
          subfolder: [`2 alpha is word for word alpha at src/a.ts:1${TAIL}`],
          subfolderSelf: [],
          listed: [],
          self: [],
          buffer: [`1 unrelated is word for word unrelated at src/h.ts:1${TAIL}`],
          twice: [
            `1 alphaOf is word for word alphaOf at src/g.ts:3${TAIL}`,
            `3 alphaOf is word for word alphaOf at src/g.ts:1${TAIL}`,
          ],
          outside: [],
          tiny: [],
          ignored: [],
          untracked: [`1 alphaUntracked is word for word alphaUntracked at test/untracked.test.ts:1${TAIL}`],
        },
        BLIND_SPOTS,
      );
    },
  );
});

test("the rule reads the tree once per process, and does not read again a file whose text is the one it read from disk (Issue #1332)", async () => {
  await withTempRepo({ "src/a.ts": ALPHA, "src/h.ts": OTHER }, (dir) => {
    const before = readCounts();
    reports(dir, "src/b.ts", ALPHA_COPY);
    reports(dir, "src/a.ts", ALPHA);
    reports(dir, "src/h.ts", OTHER);
    reports(dir, "src/a.ts", OTHER);
    const after = readCounts();
    assert.deepEqual({ trees: after.trees - before.trees, texts: after.texts - before.texts }, { trees: 1, texts: 2 });
  });
});

test("outside a git repository the rule throws, naming git ls-files, rather than read an empty tree as clean (Issue #1332)", () => {
  const made = mkdtempSync(join(tmpdir(), "word-for-word-"));
  try {
    assert.throws(() => reports(realpathSync(made), "src/b.ts", ALPHA_COPY), /git ls-files under .+ failed/);
  } finally {
    rmSync(made, { recursive: true, force: true });
  }
});

test("the rule resolves at error on every TypeScript root the lint reads, with the lint's roots and the accepted-copies list, at any depth and in a room not yet written, and on no sheet (Issue #1332)", async () => {
  const roots = lintTsRoots();
  const wired = [2, { root: ROOT, roots, accepted: ACCEPTED_COPIES }];
  assert.ok(roots.length > 0, "the lint reads no TypeScript root, so this sweep reads nothing");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(
      witness !== undefined && existsSync(join(ROOT, witness)),
      `${root} has no existing witness in test-support/lint-witnesses.ts, so the rule's reach there is unpinned`,
    );
    assert.equal(await eslint.isPathIgnored(witness), false, `${witness} is ignored, so ${root} reaches nothing`);
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file, RULE), wired, `${RULE} does not resolve as wired on ${file}`);
  }
  assert.deepEqual(
    await resolvedRule("src/site/zz-new-room/part.ts", RULE),
    wired,
    `${RULE} does not reach a room written tomorrow`,
  );
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!, RULE), undefined, `${RULE} reaches a sheet`);
});

test("a function with copies in an earlier file, its own file and a later file names them in file and line order, and is reported over its own lines (Issue #1332)", async () => {
  await withTempRepo({ "src/a.ts": ALPHA_NEAR, "src/z.ts": ALPHA_NEAR }, (dir) => {
    const messages = verify(dir, "src/m.ts", `${ALPHA_NEAR}${ALPHA_NEAR}`, { root: dir, roots: ["src"], accepted: [] });
    assert.deepEqual(
      messages.map((m) => ({
        line: m.line,
        column: m.column,
        endLine: m.endLine,
        endColumn: m.endColumn,
        text: m.message,
      })),
      [
        {
          line: 1,
          column: 1,
          endLine: 2,
          endColumn: ENDS_AT,
          text: `alphaOf is word for word alphaOf at src/a.ts:1, alphaOf at src/m.ts:3, alphaOf at src/z.ts:1${TAIL}`,
        },
        {
          line: 3,
          column: 1,
          endLine: 4,
          endColumn: ENDS_AT,
          text: `alphaOf is word for word alphaOf at src/a.ts:1, alphaOf at src/m.ts:1, alphaOf at src/z.ts:1${TAIL}`,
        },
      ],
    );
  });
});

test("a function on one line is reported over the whole line, not over no columns (Issue #1332)", async () => {
  await withTempRepo({ "src/h.ts": OTHER }, (dir) => {
    const [only] = verify(dir, "src/k.ts", OTHER, { root: dir, roots: ["src"], accepted: [] });
    assert.deepEqual(
      { line: only!.line, column: only!.column, endLine: only!.endLine, endColumn: only!.endColumn },
      { line: 1, column: 1, endLine: 1, endColumn: OTHER.split("\n")[0]!.length + 1 },
    );
  });
});

test("a conflicted file git lists once per stage is read once, so its functions are not copies of themselves (Issue #1332)", async () => {
  await withTempRepo({ "src/c.ts": ALPHA_NEAR, "src/h.ts": OTHER }, (dir) => {
    git(["checkout", "-q", "-b", "side"], dir);
    writeFiles(dir, { "src/c.ts": ALPHA_NEAR.replace("alphaOf", "alphaSide") });
    commitAll(dir, "side");
    git(["checkout", "-q", "main"], dir);
    writeFiles(dir, { "src/c.ts": ALPHA_NEAR.replace("alphaOf", "alphaMain") });
    commitAll(dir, "main");
    spawnSync("git", ["merge", "side"], { cwd: dir, timeout: 30_000 });
    assert.match(git(["ls-files", "-u"], dir), /src\/c\.ts/, "the merge left no conflict, so this test reads none");
    writeFiles(dir, { "src/c.ts": ALPHA_NEAR });
    assert.deepEqual(
      { elsewhere: reports(dir, "src/h.ts", OTHER), conflicted: reports(dir, "src/c.ts", ALPHA_NEAR) },
      { elsewhere: [], conflicted: [] },
    );
  });
});

test("two sets of roots handed for one working directory are each read from their own tree (Issue #1332)", async () => {
  await withTempRepo({ "src/a.ts": ALPHA, "docs/y.ts": ALPHA_COPY }, (dir) => {
    const before = readCounts();
    const narrow = reports(dir, "src/b.ts", ALPHA_COPY, [], ["src"]);
    const wide = reports(dir, "src/b.ts", ALPHA_COPY, [], ["src", "docs"]);
    assert.deepEqual(
      { narrow, wide, trees: readCounts().trees - before.trees },
      {
        narrow: [`2 alpha is word for word alpha at src/a.ts:1${TAIL}`],
        wide: [`2 alpha is word for word alpha at docs/y.ts:2, alpha at src/a.ts:1${TAIL}`],
        trees: 2,
      },
    );
  });
});

test("the rule takes only an object holding the root to read from, a non-empty list of roots and a list of accepted copies, and nothing else (Issue #1332)", () => {
  const taken = (options: unknown): void => void verify(ROOT, "src/zz-1332.ts", "export const x = 1;\n", options);
  assert.doesNotThrow(() => taken({ root: ROOT, roots: ["src"], accepted: [] }), "a well-formed option is refused");
  for (const options of [
    {},
    { root: ROOT, roots: ["src"] },
    { root: ROOT, accepted: [] },
    { roots: ["src"], accepted: [] },
    { root: 1, roots: ["src"], accepted: [] },
    { root: ROOT, roots: [], accepted: [] },
    { root: ROOT, roots: [1], accepted: [] },
    { root: ROOT, roots: ["src"], accepted: [], extra: true },
  ])
    assert.throws(() => taken(options), /Key "vellum\/no-word-for-word-copy":/, `${JSON.stringify(options)} is taken`);
});
