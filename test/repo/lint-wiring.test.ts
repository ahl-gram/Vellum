import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");

const LINT_SCOPE = ["scripts/**/*.mjs", "scripts/**/*.ts", "src/**/*.ts", "test-support/**/*.ts", "test/**/*.ts"];
const LINT_SCRIPT = "eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 src scripts test test-support";

const blocks: readonly Linter.Config[] = lintConfig;
const conjunctsOf = (entry: string | string[]): string[] => (Array.isArray(entry) ? entry : [entry]);
const RULED_ROOTS = LINT_SCOPE.map((g) => {
  const m = g.match(/^([^*]+\/)\*\*\/\*(\.\w+)$/);
  assert.ok(m, `ruled glob ${g} is not of the root/**/*.ext shape this guard derives its roots from`);
  return { root: m[1]!, ext: m[2]! };
});
const isNamedFile = (g: string): boolean =>
  !/[*?[{]/.test(g) && RULED_ROOTS.some(({ root, ext }) => g.startsWith(root) && g.endsWith(ext));

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

test("the lint config is bounded to the ruled scope, covers all of it, and narrows it nowhere", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  const covered = new Set<string>();
  for (const block of blocks) {
    const name = block.name ?? "(unnamed)";
    assert.ok(
      !("ignores" in block),
      `config block ${name} carries ignores, which unlints files without naming a rule; an exemption is a rule-level block by name (Issue #648), and this pin is the line to revisit if the walk ever becomes eslint .`,
    );
    assert.ok(
      Array.isArray(block.files) && block.files.length > 0,
      `config block ${name} has no files key, so its rules apply to everything ESLint walks`,
    );
    for (const entry of block.files) {
      const conjuncts = conjunctsOf(entry);
      assert.ok(
        !conjuncts.some((g) => g.startsWith("!")),
        `config block ${name} negates ${JSON.stringify(entry)}, which unlints files the same way ignores does`,
      );
      const anchors = conjuncts.filter((g) => LINT_SCOPE.includes(g));
      const named = conjuncts.filter(isNamedFile);
      assert.ok(
        anchors.length > 0 || named.length > 0,
        `config block ${name} matches ${JSON.stringify(entry)}, which is neither a ruled glob nor a file named under a ruled root with its ruled extension`,
      );
      for (const file of named) {
        assert.ok(existsSync(join(ROOT, file)), `config block ${name} names ${file}, which does not exist, so its exemption is stale`);
      }
      for (const glob of anchors) covered.add(glob);
    }
  }
  assert.deepEqual([...covered].sort(), LINT_SCOPE, "the lint scope and Issue #648's ruled scope differ");
});

const WITNESSES: Record<string, string> = {
  "scripts/**/*.mjs": "scripts/e2e/harness.mjs",
  "scripts/**/*.ts": "scripts/build-app-bundles.ts",
  "src/**/*.ts": "src/cli/main.ts",
  "test-support/**/*.ts": "test-support/element-shim.ts",
  "test/**/*.ts": "test/repo/lint-wiring.test.ts",
};
type Resolved = { rules?: Record<string, unknown>; languageOptions?: { parser?: { meta?: { name?: string } } }; linterOptions?: { reportUnusedDisableDirectives?: unknown } };
const severityOf = (rule: unknown): unknown => (Array.isArray(rule) ? rule[0] : rule);

test("through ESLint itself, one witness file per ruled glob resolves to rules that reach it, and the root config resolves to none", async () => {
  assert.deepEqual(Object.keys(WITNESSES).sort(), LINT_SCOPE, "every ruled glob needs a witness file here");
  const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
  assert.equal(
    await eslint.findConfigFile("src/cli/main.ts"),
    join(ROOT, "eslint.config.ts"),
    "ESLint resolves a different config file than the one this guard imports; a .js, .mjs or .cjs config at the root shadows the .ts one",
  );
  for (const [glob, file] of Object.entries(WITNESSES)) {
    assert.ok(existsSync(join(ROOT, file)), `${file}, the witness for ${glob}, does not exist`);
    assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so ${glob} reaches nothing`);
    const config = (await eslint.calculateConfigForFile(file)) as Resolved;
    const on = (rule: string): unknown => severityOf(config.rules?.[rule]);
    const typed = glob.endsWith(".ts");
    assert.equal(config.languageOptions?.parser?.meta?.name, typed ? "typescript-eslint/parser" : undefined, `${file} resolves to the wrong parser`);
    assert.equal(on("@typescript-eslint/no-misused-promises"), typed ? 2 : undefined, `${file}: the roster rule this PR ticks does not resolve at error`);
    assert.equal(on("@typescript-eslint/no-explicit-any"), typed ? 2 : undefined, `${file}: the rule the one exemption in the tree stands against is not on`);
    assert.equal(on("no-undef"), typed ? 0 : 2, `${file}: the core layer is missing or the TypeScript override layer was not applied`);
    assert.equal(on("no-debugger"), 2, `${file}: the core recommended rules do not reach it`);
    assert.equal(on("prefer-const"), 2, `${file}: prefer-const does not resolve at error (Immutability, Issue #648)`);
    assert.deepEqual(config.rules?.["no-param-reassign"], [2, { props: false }], `${file}: no-param-reassign does not resolve as rebinding-only at error (Alex, 2026-09-20, Issue #648)`);
    assert.equal(on("@typescript-eslint/prefer-readonly"), typed ? 2 : undefined, `${file}: prefer-readonly does not resolve at error (Immutability, Issue #648)`);
    assert.deepEqual(config.rules?.["max-lines"], [2, 400], `${file}: max-lines does not resolve at error with the ruled physical-line ceiling (Size, Issue #648)`);
    assert.deepEqual(config.rules?.["max-lines-per-function"], [2, 50], `${file}: max-lines-per-function does not resolve at error with the ruled ceiling (Size, Issue #648)`);
    assert.deepEqual(config.rules?.["max-depth"], [2, 4], `${file}: max-depth does not resolve at error with the ruled depth (Size, Issue #648)`);
    const report = config.linterOptions?.reportUnusedDisableDirectives;
    assert.ok([1, 2, "warn", "error"].includes(report as never), `${file}: an unused disable directive is not reported (${String(report)}), so a stale exemption is silent`);
  }
  assert.equal(await eslint.isPathIgnored("eslint.config.ts"), true, "the root config lints itself, so the scope leaked past the ruled roots");
});

test("npm run lint is the native-loader ESLint over the four roots, with a warning counted as red", () => {
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["lint"], LINT_SCRIPT);
});

// Matched at the file's own step indent the way test/repo/e2e-tiers.test.ts keys its anchors, so a run line planted deeper (under a with: map, which Actions ignores) reds; a step written in flow style reds too, a false red and never a miss. The one miss is a JOB-level if: on check-and-test, which skips Typecheck and Test the same way and which no guard reads; the per-job sweep in test/repo/e2e-tiers.test.ts is its home if it is ever closed.
test("ci.yml's check-and-test job runs the lint as a real step of exactly two lines, so a red lint fails the pull request", () => {
  assert.match(
    ciJob("check-and-test"),
    /^ {6}- name: Lint\n {8}run: npm run lint\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no Lint step of the shape `- name: Lint` / `run: npm run lint` at the step indent, so either the lint never runs, runs with its failure swallowed, or runs only as text somewhere Actions ignores",
  );
});
