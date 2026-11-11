import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
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
import { withTempRepo, writeFiles } from "../../test-support/proof-runner-repo.ts";
import { eslint, resolvedRule } from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/no-word-for-word-copy";
const TAIL =
  ": fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)";
const IGNORED = ALPHA_NEAR.replace("alphaOf", "alphaIgnored");
const UNTRACKED = ALPHA_NEAR.replace("alphaOf", "alphaUntracked");
const BLIND_SPOTS =
  "BLIND SPOTS, declared, each toward passing: a function with fewer than 6 names; the body of a test(...) call or any unnamed callback; a function the shared reader does not read: one wrapped in as, satisfies or ! in a declaration, an assignment or an object member, or in parentheses in a declaration or an object member, a class field's arrow or function expression, the outer name of a chained declaration, and an export default function or arrow; a copy whose text differs in anything but white space and comments, an export keyword or a name among them; any file but a .ts under the lint's roots, and one git ignores; and, in a long-lived ESLint process such as an editor's, a file changed after the process first read the tree.";

const reports = (dir: string, path: string, text: string, accepted: readonly AcceptedCopy[] = []): string[] =>
  new Linter({ cwd: dir })
    .verify(
      text,
      [
        {
          files: ["**/*.ts"],
          languageOptions: { parser: tseslint.parser },
          plugins: { vellum: wordForWord },
          rules: { [RULE]: ["error", { roots: ["src", "test"], accepted }] },
        },
      ],
      join(dir, path),
    )
    .map((m) => `${m.line} ${m.message}`);

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
  const wired = [2, { roots, accepted: ACCEPTED_COPIES }];
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
