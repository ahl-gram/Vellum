import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";
import { includeIgnoreFile } from "eslint/config";
import lintConfig from "../../eslint.config.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");

const LINT_SCOPE = ["**/*.cjs", "**/*.js", "**/*.jsx", "**/*.mjs", "public/**/*.css", "scripts/**/*.ts", "src/**/*.ts", "test-support/**/*.ts", "test/**/*.ts"];
const REFUSED = LINT_SCOPE.filter((g) => g.startsWith("**/"));
const DESIGN_EXEMPT = ["design/**/*.cjs", "design/**/*.js", "design/**/*.jsx", "design/**/*.mjs"];
const LINT_SCRIPT = "eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 .";
const GITIGNORED = includeIgnoreFile(join(ROOT, ".gitignore")).ignores;

const blocks: readonly Linter.Config[] = lintConfig;
const conjunctsOf = (entry: string | string[]): string[] => (Array.isArray(entry) ? entry : [entry]);
const RULED_ROOTS = LINT_SCOPE.map((g) => {
  const m = g.match(/^((?:[^*]+\/)?)\*\*\/\*(\.\w+)$/);
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

const designExemption = (block: Linter.Config): readonly string[] => {
  const name = block.name ?? "(unnamed)";
  const designed = (block.files ?? []).flat().filter((g) => DESIGN_EXEMPT.includes(g));
  if (designed.length === 0) return designed;
  assert.match(name, /Issue #653/, `config block ${name} exempts design/ with no name citing the ruling that admitted it (Issue #653 ruling D)`);
  assert.deepEqual(block.files, DESIGN_EXEMPT, `config block ${name} exempts design/ alongside something else`);
  assert.deepEqual(Object.keys(block).sort(), ["files", "linterOptions", "name", "rules"], `config block ${name} does more than turn the one rule off for design/`);
  assert.deepEqual(block.rules, { "no-restricted-syntax": "off" }, `config block ${name} turns off more, or other, than the JavaScript refusal for design/ (Issue #653 ruling D)`);
  assert.deepEqual(block.linterOptions, { noInlineConfig: false, reportUnusedDisableDirectives: "off" }, `config block ${name} does not give design/ back its own inline directives, so a round tool carrying one reds the lint`);
  return designed;
};

const REFUSAL = "Issue #653 ruling D: no JavaScript source anywhere";
const DESIGN = "Issue #653 ruling D: design/ archives its round tools as they ran";
const relaxes = (block: Linter.Config): boolean => Object.hasOwn(block.rules ?? {}, "no-restricted-syntax") || Object.hasOwn(block.linterOptions ?? {}, "noInlineConfig");

test("no block but the refusal and the design/ exemption can relax the JavaScript refusal, and the refusal admits no inline directive (Issue #653 ruling D)", () => {
  assert.deepEqual(blocks.filter(relaxes).map((b) => b.name), [REFUSAL, DESIGN], "a block other than the refusal and the design/ exemption sets no-restricted-syntax or noInlineConfig, so it can relax the refusal for whatever it matches; ruling D names design/ as the single exemption");
  const refusal = blocks.find((b) => b.name === REFUSAL);
  assert.ok(refusal, `no block is named ${REFUSAL}, so this guard is reading the wrong config`);
  assert.deepEqual(refusal.files, REFUSED, "the refusal does not reach exactly the four JavaScript extensions");
  assert.deepEqual(refusal.linterOptions, { noInlineConfig: true }, "the refusal honours inline directives, so one comment line in a JavaScript file silences it");
  assert.deepEqual(Object.keys(refusal.rules ?? {}), ["no-restricted-syntax"], "the refusal block carries a rule besides the refusal");
  const [severity, option] = refusal.rules?.["no-restricted-syntax"] as [string, { selector: string }];
  assert.deepEqual([severity, option.selector], ["error", "Program"], "the refusal does not report every program at error");
});

test("the lint config is bounded to the ruled scope, covers all of it, and narrows it nowhere", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  const covered = new Set<string>();
  const ignoring = blocks.filter((block) => "ignores" in block);
  assert.equal(ignoring.length, 1, `${ignoring.length} config blocks carry ignores; the walk is eslint . (Issue #653 ruling D), and the one block allowed to unlint files is the .gitignore's own, since an exemption is a rule-level block by name (Issue #648)`);
  assert.deepEqual(Object.keys(ignoring[0]!).filter((k) => k !== "name"), ["ignores"], "the ignores block also carries files, rules or options, so it is not the .gitignore's global ignore");
  assert.deepEqual(ignoring[0]!.ignores, GITIGNORED, "the ignores block is not exactly what includeIgnoreFile reads out of the root .gitignore, so it unlints something git tracks");
  const exempt = new Set<string>();
  for (const block of blocks.filter((b) => !("ignores" in b))) {
    const name = block.name ?? "(unnamed)";
    const designed = designExemption(block);
    for (const glob of designed) exempt.add(glob);
    if (designed.length > 0) continue;
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
      if (named.length > 0) {
        assert.match(
          block.name ?? "",
          /Issue #\d+/,
          `config block ${name} exempts ${JSON.stringify(named)} by file name with no name citing the ruling that admitted it; a named-file block carries a name such as "Issue #648: ..." so that an anonymous config-level exemption reds (Alex, 2026-09-20)`,
        );
      }
      for (const glob of anchors) covered.add(glob);
    }
  }
  assert.deepEqual([...covered].sort(), LINT_SCOPE, "the lint scope and the ruled scope (Issue #648, and Issue #653 ruling D for JavaScript) differ");
  assert.deepEqual([...exempt].sort(), DESIGN_EXEMPT, "design/, the one place ruling D admits JavaScript, is not exempted as a whole");
});

const WITNESSES: Record<string, string> = {
  "public/**/*.css": "public/house.css",
  "scripts/**/*.ts": "scripts/build-app-bundles.ts",
  "src/**/*.ts": "src/cli/main.ts",
  "test-support/**/*.ts": "test-support/element-shim.ts",
  "test/**/*.ts": "test/repo/lint-wiring.test.ts",
};
type Resolved = { rules?: Record<string, unknown>; language?: { defaultLanguageOptions?: unknown }; languageOptions?: { parser?: { meta?: { name?: string } }; tolerant?: unknown }; linterOptions?: { reportUnusedDisableDirectives?: unknown } };
const severityOf = (rule: unknown): unknown => (Array.isArray(rule) ? rule[0] : rule);

const NODE_TEST_ALLOWANCE = [{ from: "package", package: "node:test", name: ["test", "suite"] }];
const CORRECTNESS_TS_ONLY = [
  "@typescript-eslint/switch-exhaustiveness-check",
  "@typescript-eslint/no-unnecessary-condition",
  "@typescript-eslint/unbound-method",
  "@typescript-eslint/no-unsafe-return",
  "@typescript-eslint/restrict-template-expressions",
  "@typescript-eslint/no-unused-expressions",
  "@typescript-eslint/prefer-promise-reject-errors",
  "@typescript-eslint/no-implied-eval",
];
const CORRECTNESS_BOTH = ["no-regex-spaces", "preserve-caught-error", "no-useless-assignment"];

function pinCorrectness(file: string, typed: boolean, rules: Record<string, unknown>): void {
  assert.deepEqual(
    rules["@typescript-eslint/no-floating-promises"],
    typed ? [2, { allowForKnownSafeCalls: NODE_TEST_ALLOWANCE }] : undefined,
    `${file}: no-floating-promises does not resolve at error with exactly the node:test allowance (Correctness, Issue #648)`,
  );
  for (const rule of ["@typescript-eslint/switch-exhaustiveness-check", "@typescript-eslint/no-unnecessary-condition"]) {
    assert.deepEqual(rules[rule], typed ? [2] : undefined, `${file}: ${rule} does not resolve at error with no options (Correctness, Issue #648)`);
  }
  for (const rule of CORRECTNESS_TS_ONLY) {
    assert.equal(severityOf(rules[rule]), typed ? 2 : undefined, `${file}: ${rule} does not resolve at error (Correctness, Issue #648)`);
  }
  for (const rule of CORRECTNESS_BOTH) {
    assert.equal(severityOf(rules[rule]), 2, `${file}: ${rule} does not resolve at error in both blocks (Correctness, Issue #648)`);
  }
}

const CSS_FORM_RULES = ["vellum/css-comment-one-line", "vellum/css-comment-no-em-dash", "vellum/css-comment-issue-form"];
const TURNED_ON = [
  "@typescript-eslint/no-unsafe-argument",
  "@typescript-eslint/no-unsafe-assignment",
  "@typescript-eslint/no-unsafe-call",
  "@typescript-eslint/no-unsafe-member-access",
  "@typescript-eslint/no-unused-vars",
  "@typescript-eslint/require-await",
];

function pinJavaScript(file: string, typed: boolean, config: Resolved, rules: Record<string, unknown>): void {
  const on = (rule: string): unknown => severityOf(rules[rule]);
  assert.equal(config.languageOptions?.parser?.meta?.name, typed ? "typescript-eslint/parser" : undefined, `${file} resolves to the wrong parser`);
  assert.equal(on("@typescript-eslint/no-misused-promises"), typed ? 2 : undefined, `${file}: the roster rule this PR ticks does not resolve at error`);
  assert.equal(on("@typescript-eslint/no-explicit-any"), typed ? 2 : undefined, `${file}: no-explicit-any does not resolve at error`);
  for (const rule of TURNED_ON) {
    assert.deepEqual(rules[rule], typed ? [2] : undefined, `${file}: ${rule} does not resolve at error with no options; the config set it off while its violations stood, and Issue #654 turned it on with them fixed`);
  }
  assert.equal(on("no-undef"), typed ? 0 : 2, `${file}: the core layer is missing or the TypeScript override layer was not applied`);
  assert.equal(on("no-debugger"), 2, `${file}: the core recommended rules do not reach it`);
  assert.equal(on("prefer-const"), 2, `${file}: prefer-const does not resolve at error (Immutability, Issue #648)`);
  assert.deepEqual(rules["no-param-reassign"], [2, { props: false }], `${file}: no-param-reassign does not resolve as rebinding-only at error (Alex, 2026-09-20, Issue #648)`);
  assert.deepEqual(rules["no-empty"], typed ? [2, { allowEmptyCatch: true }] : undefined, `${file}: no-empty does not resolve at error with only the empty catch admitted (Alex, 2026-09-26, Issue #654 ruling 9)`);
  assert.equal(on("@typescript-eslint/prefer-readonly"), typed ? 2 : undefined, `${file}: prefer-readonly does not resolve at error (Immutability, Issue #648)`);
  assert.deepEqual(rules["max-lines"], [2, 400], `${file}: max-lines does not resolve at error with the ruled physical-line ceiling (Size, Issue #648)`);
  assert.deepEqual(rules["max-lines-per-function"], [2, 50], `${file}: max-lines-per-function does not resolve at error with the ruled ceiling (Size, Issue #648)`);
  assert.deepEqual(rules["max-depth"], [2, 4], `${file}: max-depth does not resolve at error with the ruled depth (Size, Issue #648)`);
  pinCorrectness(file, typed, rules);
  for (const rule of CSS_FORM_RULES) {
    assert.equal(rules[rule], undefined, `${file}: ${rule} is a rule for the sheets and must not resolve on a script (CSS form, Issue #648)`);
  }
}

function pinCss(file: string, config: Resolved, rules: Record<string, unknown>): void {
  assert.equal(config.languageOptions?.parser, undefined, `${file} resolves a JavaScript parser instead of the CSS language`);
  assert.deepEqual(config.language?.defaultLanguageOptions, { tolerant: false }, `${file} does not resolve to @eslint/css's language (CSS form, Issue #648)`);
  assert.equal(config.languageOptions?.tolerant, true, `${file}: the sheets parse strict, so a syntax css-tree does not know reds the lint; the family ruled tolerant (Alex's delegation, 2026-09-21, Issue #648)`);
  for (const rule of CSS_FORM_RULES) {
    assert.deepEqual(rules[rule], [2], `${file}: ${rule} does not resolve at error with no options (CSS form, Issue #648)`);
  }
  assert.deepEqual(Object.keys(rules).filter((r) => severityOf(rules[r]) !== 0).sort(), [...CSS_FORM_RULES].sort(), `${file}: a rule other than the three form rules reaches the sheets (CSS form, Issue #648)`);
}

test("through ESLint itself, one witness file per ruled glob resolves to rules that reach it, and the root config resolves to none", async () => {
  assert.deepEqual(Object.keys(WITNESSES).sort(), LINT_SCOPE.filter((g) => !REFUSED.includes(g)), "every ruled glob that carries rules needs a witness file here; the refused JavaScript globs have none by design, and the test below is their witness");
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
    const rules = config.rules;
    assert.ok(rules, `${file} resolves to no rules at all`);
    if (glob.endsWith(".css")) pinCss(file, config, rules);
    else pinJavaScript(file, glob.endsWith(".ts"), config, rules);
    const report = config.linterOptions?.reportUnusedDisableDirectives;
    assert.ok([1, 2, "warn", "error"].includes(report as never), `${file}: an unused disable directive is not reported (${String(report)}), so a stale exemption is silent`);
  }
  assert.equal(await eslint.isPathIgnored("eslint.config.ts"), true, "the root config lints itself, so the scope leaked past the ruled roots");
});

test("only typescript-eslint's recommended-type-checked block sets a rule Issue #654 turned on, each at error, and it reaches all four TypeScript roots unnarrowed with no ignores, so no block can take one back by setting it or by narrowing the preset", () => {
  const PRESET = "typescript-eslint/recommended-type-checked";
  const shortName = (b: Linter.Config): string => (b.name ?? "(unnamed)").replace(/^.* > /, "");
  const setters = blocks.flatMap((b) => TURNED_ON.filter((rule) => Object.hasOwn(b.rules ?? {}, rule)).map((rule) => `${shortName(b)}: ${rule} = ${JSON.stringify(b.rules?.[rule])}`));
  assert.deepEqual(
    setters,
    TURNED_ON.map((rule) => `${PRESET}: ${rule} = "error"`),
    "a block other than the preset sets one of these rules, and a block can turn a rule off for every file it matches (a subtree, or one named file) while the witnesses still resolve at error",
  );
  const preset = blocks.filter((b) => shortName(b) === PRESET);
  assert.equal(preset.length, 1, `${preset.length} blocks are ${PRESET}, so this guard is reading the wrong config`);
  assert.deepEqual(
    [...(preset[0]!.files ?? [])].sort(),
    LINT_SCOPE.filter((g) => g.endsWith(".ts")),
    "the preset that sets these rules does not reach exactly the four TypeScript roots: the block that extends it has changed its own files, and a narrowing (a conjunct such as src/**/*.ts with src/cli/**) takes the rules back for everything it dropped",
  );
  assert.equal(preset[0]!.ignores, undefined, "the preset carries an ignores key, which takes the rules back for whatever it excludes while its files still name the four roots");
});

test("only the core recommended layer and the TypeScript block set no-empty, the second with the empty catch Alex ruled in, so no block can take it back for a subtree or a named file (Issue #654 ruling 9)", () => {
  const setters = blocks.filter((b) => Object.hasOwn(b.rules ?? {}, "no-empty")).map((b) => `${(b.name ?? "(unnamed)").replace(/^.* > /, "")}: ${JSON.stringify(b.rules?.["no-empty"])}`);
  assert.deepEqual(
    setters,
    ['@eslint/js/recommended: "error"', '(unnamed): ["error",{"allowEmptyCatch":true}]'],
    "a block other than the core layer and the TypeScript block sets no-empty, and a block can turn it off for every file it matches while the witnesses still resolve the ruled scope",
  );
});

const JS_REFUSED = ["x.js", "src/x.js", "scripts/x.mjs", "scripts/e2e/x.mjs", "test/x.cjs", "test-support/x.js", "public/x.js", ".claude/x.mjs", "x.jsx", "src/site/x.jsx"];
const JS_ADMITTED = ["design/x.mjs", "design/round/x.js", "design/x.cjs", "design/round/x.jsx"];
const JS_UNREAD = ["out/x.mjs", "out/probe/x.js", "dist/x.js", "public/explorer/app.bundle.js", "public/atlas/x.js", ".claude/worktrees/w/scripts/x.mjs", "node_modules/x/index.js"];
const sourceFor = (path: string): string =>
  path.endsWith(".jsx") ? "export const A = () => <b>x</b>;\n" : path.endsWith(".cjs") ? "module.exports = 1;\n" : "export const a = 1;\n";
const DIRECTIVES = [
  "/* eslint-disable */\n",
  "/* eslint-disable no-restricted-syntax */\n",
  "/* eslint no-restricted-syntax: off */\n",
  "// eslint-disable-next-line no-restricted-syntax\n",
  "export const b = 2; // eslint-disable-line no-restricted-syntax\n",
];

test("through ESLint itself, a JavaScript file anywhere outside design/ is refused, even under an inline directive, one inside design/ is not, and nothing gitignored is read (Issue #653 ruling D)", async () => {
  const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
  const verdict = async (path: string, lead = ""): Promise<string> => {
    if (await eslint.isPathIgnored(path)) return "unread";
    const [result] = await eslint.lintText(lead + sourceFor(path), { filePath: join(ROOT, path) });
    const refused = result.messages.some((m) => m.ruleId === "no-restricted-syntax" && m.severity === 2 && m.message.startsWith("JavaScript is not written here"));
    return refused ? "refused" : result.messages.length === 0 ? "admitted" : result.messages.map((m) => `${m.ruleId ?? "parse"}: ${m.message}`).join(" | ");
  };
  for (const path of JS_REFUSED) assert.equal(await verdict(path), "refused", `${path} is not refused, so a JavaScript file there would lint green`);
  for (const lead of DIRECTIVES) {
    assert.equal(await verdict("src/x.mjs", lead), "refused", `a file opening ${JSON.stringify(lead)} escapes the refusal, so one comment line admits JavaScript anywhere`);
    assert.equal(await verdict("design/round/x.mjs", lead), "admitted", `a design/ file opening ${JSON.stringify(lead)} is not admitted, though design/ is the one exemption ruling D names`);
  }
  for (const path of JS_ADMITTED) assert.equal(await verdict(path), "admitted", `${path} is not admitted, though design/ is the one exemption ruling D names`);
  for (const path of JS_UNREAD) {
    assert.equal(await verdict(path), "unread", `${path} is read, so gitignored build output or scratch trips the JavaScript refusal. BLIND SPOTS, declared: the unread set is whatever the root .gitignore ignores, so a JavaScript file git TRACKS despite a matching pattern (force-added; git ls-files -ci --exclude-standard lists them, none today) is never read and passes, erring toward passing; a nested .gitignore and .git/info/exclude are not read, so a file only they ignore is refused, erring toward refusing, as is an untracked file no ignore file covers; an upper-case extension (X.JS) matches no JavaScript glob and is never read, erring toward passing; a processor on a later block that hands ESLint no program would pass, erring toward passing, with none in the config; and a file that does not parse is refused by its parse error rather than by this rule's message`);
  }
});

test("npm run lint is the native-loader ESLint over the whole tree, with a warning counted as red", () => {
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
