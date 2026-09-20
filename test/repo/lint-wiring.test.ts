import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");

const LINT_SCOPE = ["scripts/**/*.mjs", "scripts/**/*.ts", "src/**/*.ts", "test-support/**/*.ts", "test/**/*.ts"];
const LINT_SCRIPT = "eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 src scripts test test-support";

const blocks: readonly Linter.Config[] = lintConfig;
const isGlobalIgnores = (block: Linter.Config): boolean =>
  Object.keys(block).filter((k) => k !== "name").join() === "ignores";
const anchorsOf = (entry: string | string[]): string[] =>
  (Array.isArray(entry) ? entry : [entry]).filter((g) => LINT_SCOPE.includes(g));

const ciJob = (id: string): string => {
  const lines = src(".github/workflows/ci.yml").split("\n");
  const head = lines.findIndex((l) => new RegExp(`^ {2}${id}:\\s*$`).test(l));
  assert.notEqual(head, -1, `ci.yml has no ${id} job at two-space indent, so this reader is looking at the wrong shape`);
  const next = lines.findIndex((l, i) => i > head && /^ {2}[A-Za-z0-9_-]+:\s*$/.test(l));
  return lines
    .slice(head, next === -1 ? lines.length : next)
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
};

test("the lint config is bounded to the ruled scope and covers all of it", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  const covered = new Set<string>();
  for (const block of blocks) {
    if (isGlobalIgnores(block)) continue;
    const name = block.name ?? "(unnamed)";
    assert.ok(
      Array.isArray(block.files) && block.files.length > 0,
      `config block ${name} has no files key, so its rules apply to everything ESLint walks`,
    );
    for (const entry of block.files) {
      const anchors = anchorsOf(entry);
      assert.ok(anchors.length > 0, `config block ${name} matches ${JSON.stringify(entry)}, which no ruled glob bounds`);
      for (const glob of anchors) covered.add(glob);
    }
  }
  assert.deepEqual([...covered].sort(), LINT_SCOPE, "the lint scope and Issue #648's ruled scope differ");
});

test("npm run lint is the native-loader ESLint over the four roots, with a warning counted as red", () => {
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["lint"], LINT_SCRIPT);
});

// The step is matched at the file's own step indent (a six-space dash, an eight-space run) and as exactly those two lines, the way test/repo/e2e-tiers.test.ts keys its timeout and matrix anchors: a run line planted deeper (under a with: map, which Actions ignores and which the prover planted on this guard's first round, Issue #648) or a step carrying an if: or continue-on-error: reds here, and so does a step written in flow style, which is a false red and never a miss.
test("ci.yml's check-and-test job runs the lint as a real step of exactly two lines, so a red lint fails the pull request", () => {
  assert.match(
    ciJob("check-and-test"),
    /^ {6}- name: Lint\n {8}run: npm run lint\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no Lint step of the shape `- name: Lint` / `run: npm run lint` at the step indent, so either the lint never runs, runs with its failure swallowed, or runs only as text somewhere Actions ignores",
  );
});
