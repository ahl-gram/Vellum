import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";
import { includeIgnoreFile } from "eslint/config";
import ts from "typescript";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { ciJob } from "../../test-support/ci-job.ts";
import { LINT_SCOPE, REFUSED, blocks, shortName, type Resolved } from "../../test-support/lint-wiring-scope.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const src = (p: string) => readFileSync(join(ROOT, p), "utf8");

const DESIGN_EXEMPT = ["design/**/*.cjs", "design/**/*.js", "design/**/*.jsx", "design/**/*.mjs"];
const LINT_SCRIPT = "eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 .";
const GITIGNORED = includeIgnoreFile(join(ROOT, ".gitignore")).ignores;

const conjunctsOf = (entry: string | string[]): string[] => (Array.isArray(entry) ? entry : [entry]);
const RULED_ROOTS = LINT_SCOPE.map((g) => {
  const m = g.match(/^((?:[^*]+\/)?)\*\*\/\*(\.\w+)$/);
  assert.ok(m, `ruled glob ${g} is not of the root/**/*.ext shape this guard derives its roots from`);
  return { root: m[1]!, ext: m[2]! };
});
const isNamedFile = (g: string): boolean =>
  !/[*?[{]/.test(g) && RULED_ROOTS.some(({ root, ext }) => g.startsWith(root) && g.endsWith(ext));

const designExemption = (block: Linter.Config): readonly string[] => {
  const name = block.name ?? "(unnamed)";
  const designed = (block.files ?? []).flat().filter((g) => DESIGN_EXEMPT.includes(g));
  if (designed.length === 0) return designed;
  assert.match(
    name,
    /Issue #653/,
    `config block ${name} exempts design/ with no name citing the ruling that admitted it (Issue #653 ruling D)`,
  );
  assert.deepEqual(block.files, DESIGN_EXEMPT, `config block ${name} exempts design/ alongside something else`);
  assert.deepEqual(
    Object.keys(block).sort(),
    ["files", "linterOptions", "name", "rules"],
    `config block ${name} does more than turn the one rule off for design/`,
  );
  assert.deepEqual(
    block.rules,
    { "no-restricted-syntax": "off" },
    `config block ${name} turns off more, or other, than the JavaScript refusal for design/ (Issue #653 ruling D)`,
  );
  assert.deepEqual(
    block.linterOptions,
    { noInlineConfig: false, reportUnusedDisableDirectives: "off" },
    `config block ${name} does not give design/ back its own inline directives, so a round tool carrying one reds the lint`,
  );
  return designed;
};

const REFUSAL = "Issue #653 ruling D: no JavaScript source anywhere";
const DESIGN = "Issue #653 ruling D: design/ archives its round tools as they ran";
const relaxes = (block: Linter.Config): boolean =>
  Object.hasOwn(block.rules ?? {}, "no-restricted-syntax") ||
  Object.hasOwn(block.linterOptions ?? {}, "noInlineConfig");

test("no block but the refusal and the design/ exemption can relax the JavaScript refusal, and the refusal admits no inline directive (Issue #653 ruling D)", () => {
  assert.deepEqual(
    blocks.filter(relaxes).map((b) => b.name),
    [REFUSAL, DESIGN],
    "a block other than the refusal and the design/ exemption sets no-restricted-syntax or noInlineConfig, so it can relax the refusal for whatever it matches; ruling D names design/ as the single exemption",
  );
  const refusal = blocks.find((b) => b.name === REFUSAL);
  assert.ok(refusal, `no block is named ${REFUSAL}, so this guard is reading the wrong config`);
  assert.deepEqual(refusal.files, REFUSED, "the refusal does not reach exactly the four JavaScript extensions");
  assert.deepEqual(
    refusal.linterOptions,
    { noInlineConfig: true },
    "the refusal honours inline directives, so one comment line in a JavaScript file silences it",
  );
  assert.deepEqual(
    Object.keys(refusal.rules ?? {}),
    ["no-restricted-syntax"],
    "the refusal block carries a rule besides the refusal",
  );
  const [severity, option] = refusal.rules?.["no-restricted-syntax"] as [string, { selector: string }];
  assert.deepEqual(
    [severity, option.selector],
    ["error", "Program"],
    "the refusal does not report every program at error",
  );
});

function checkBlockFiles(): { covered: Set<string>; exempt: Set<string> } {
  const covered = new Set<string>();
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
        assert.ok(
          existsSync(join(ROOT, file)),
          `config block ${name} names ${file}, which does not exist, so its exemption is stale`,
        );
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
  return { covered, exempt };
}

test("the lint config is bounded to the ruled scope, covers all of it, and narrows it nowhere", () => {
  assert.ok(blocks.length > 0, "the config exports no blocks, so this guard is reading the wrong thing");
  const ignoring = blocks.filter((block) => "ignores" in block);
  assert.equal(
    ignoring.length,
    1,
    `${ignoring.length} config blocks carry ignores; the walk is eslint . (Issue #653 ruling D), and the one block allowed to unlint files is the .gitignore's own, since an exemption is a rule-level block by name (Issue #648)`,
  );
  assert.deepEqual(
    Object.keys(ignoring[0]!).filter((k) => k !== "name"),
    ["ignores"],
    "the ignores block also carries files, rules or options, so it is not the .gitignore's global ignore",
  );
  assert.deepEqual(
    ignoring[0]!.ignores,
    GITIGNORED,
    "the ignores block is not exactly what includeIgnoreFile reads out of the root .gitignore, so it unlints something git tracks",
  );
  const { covered, exempt } = checkBlockFiles();
  assert.deepEqual(
    [...covered].sort(),
    LINT_SCOPE,
    "the lint scope and the ruled scope (Issue #648, and Issue #653 ruling D for JavaScript) differ",
  );
  assert.deepEqual(
    [...exempt].sort(),
    DESIGN_EXEMPT,
    "design/, the one place ruling D admits JavaScript, is not exempted as a whole",
  );
});

const LINT_TS_ROOTS = ["e2e", "scripts", "src", "test", "test-support"];
const tsUnder = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tsUnder(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(ROOT, dir, e.name)] : [],
  );
const bindingNames = (b: ts.BindingName): ts.Identifier[] =>
  ts.isIdentifier(b) ? [b] : b.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : bindingNames(e.name)));
function parameterBindings(sf: ts.SourceFile, names?: ReadonlySet<string>): ts.Identifier[] {
  const out: ts.Identifier[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isParameter(n)) out.push(...bindingNames(n.name).filter((id) => !names || names.has(id.text)));
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

async function excusedNames(): Promise<Set<string>> {
  const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
  const resolved = (await eslint.calculateConfigForFile(WITNESSES["src/**/*.ts"]!)) as Resolved;
  const option = (
    resolved.rules?.["no-param-reassign"] as [number, { ignorePropertyModificationsFor?: string[] }?] | undefined
  )?.[1];
  return new Set(option?.ignorePropertyModificationsFor ?? []);
}

test("every name no-param-reassign excuses is borne by a parameter somewhere, so no excuse is left behind after its parameter was renamed away (Alex, 2026-09-26, Issue #654 rulings 4 and 5; what each bearer holds is vellum/param-excuse-holds-element's)", async () => {
  const excused = await excusedNames();
  assert.ok(
    excused.size > 0,
    "no-param-reassign excuses no parameter name, so this guard has nothing to check; ruling 5 excuses the page-element parameters by name",
  );
  const borne = new Set(
    LINT_TS_ROOTS.flatMap(tsUnder).flatMap((f) =>
      parameterBindings(ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true), excused).map(
        (id) => id.text,
      ),
    ),
  );
  assert.deepEqual(
    [...excused].filter((n) => !borne.has(n)),
    [],
    "no-param-reassign excuses a name no parameter bears, an excuse left behind after its parameter was renamed away",
  );
});

const PRESETS = /^(@eslint\/js|typescript-eslint)\//;
const RULING_D_PAIR = [REFUSAL, DESIGN];

test("no rule is set by two of the house's own blocks, since the later block's options replace the earlier one's for every file both reach and nothing reds (Issue #779, measured: home lost a refused import pattern that way)", () => {
  const house = blocks.filter((b) => !PRESETS.test(shortName(b)) && !RULING_D_PAIR.includes(b.name ?? ""));
  assert.ok(house.length > 5, "the house's own blocks were not found, so this guard reads nothing");
  const setters = new Map<string, string[]>();
  for (const block of house)
    for (const rule of Object.keys(block.rules ?? {}))
      setters.set(rule, [...(setters.get(rule) ?? []), shortName(block)]);
  assert.deepEqual(
    [...setters].filter(([, by]) => by.length > 1).map(([rule, by]) => `${rule}: ${by.join(" and ")}`),
    [],
    "a rule is set by two house blocks: set it once, in the one block that reaches every file it should, or give each block's subtree its own rule",
  );
});

const JS_REFUSED = [
  "x.js",
  "src/x.js",
  "scripts/x.mjs",
  "e2e/x.mjs",
  "test/x.cjs",
  "test-support/x.js",
  "public/x.js",
  ".claude/x.mjs",
  "x.jsx",
  "src/site/x.jsx",
];
const JS_ADMITTED = ["design/x.mjs", "design/round/x.js", "design/x.cjs", "design/round/x.jsx"];
const JS_UNREAD = [
  "out/x.mjs",
  "out/probe/x.js",
  "dist/x.js",
  "generated/explorer/app.bundle.js",
  "generated/atlas/x.js",
  ".claude/worktrees/w/scripts/x.mjs",
  "node_modules/x/index.js",
];
const sourceFor = (path: string): string =>
  path.endsWith(".jsx")
    ? "export const A = () => <b>x</b>;\n"
    : path.endsWith(".cjs")
      ? "module.exports = 1;\n"
      : "export const a = 1;\n";
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
    const refused = result!.messages.some(
      (m) =>
        m.ruleId === "no-restricted-syntax" &&
        m.severity === 2 &&
        m.message.startsWith("JavaScript is not written here"),
    );
    return refused
      ? "refused"
      : result!.messages.length === 0
        ? "admitted"
        : result!.messages.map((m) => `${m.ruleId ?? "parse"}: ${m.message}`).join(" | ");
  };
  for (const path of JS_REFUSED)
    assert.equal(await verdict(path), "refused", `${path} is not refused, so a JavaScript file there would lint green`);
  for (const lead of DIRECTIVES) {
    assert.equal(
      await verdict("src/x.mjs", lead),
      "refused",
      `a file opening ${JSON.stringify(lead)} escapes the refusal, so one comment line admits JavaScript anywhere`,
    );
    assert.equal(
      await verdict("design/round/x.mjs", lead),
      "admitted",
      `a design/ file opening ${JSON.stringify(lead)} is not admitted, though design/ is the one exemption ruling D names`,
    );
  }
  for (const path of JS_ADMITTED)
    assert.equal(
      await verdict(path),
      "admitted",
      `${path} is not admitted, though design/ is the one exemption ruling D names`,
    );
  for (const path of JS_UNREAD) {
    assert.equal(
      await verdict(path),
      "unread",
      `${path} is read, so gitignored build output or scratch trips the JavaScript refusal. BLIND SPOTS, declared: the unread set is whatever the root .gitignore ignores, and test/repo/lint-config.test.ts refuses any tracked file under it; a nested .gitignore and .git/info/exclude are not read, so a file only they ignore is refused, erring toward refusing, as is an untracked file no ignore file covers; an upper-case extension (X.JS) matches no JavaScript glob and is never read, erring toward passing; test/repo/lint-config.test.ts refuses a processor on any block; and a file that does not parse is refused by its parse error rather than by this rule's message`,
    );
  }
});

test("npm run lint is the native-loader ESLint over the whole tree, with a warning counted as red", () => {
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts["lint"], LINT_SCRIPT);
});

test("npm run check is tsc over tsconfig.json, which turns on noUncheckedIndexedAccess (Issue #654 ruling 1), then over tsconfig.engine.json and tsconfig.worker.json (Issue #710), and ci.yml's check-and-test job runs it as a real step, so every pull request is held to all three passes", () => {
  const pkg = JSON.parse(src("package.json")) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts["check"],
    "tsc --noEmit && tsc --noEmit -p tsconfig.engine.json && tsc --noEmit -p tsconfig.worker.json",
  );
  const config = ts.getParsedCommandLineOfConfigFile(
    join(ROOT, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );
  assert.ok(config, "tsconfig.json did not parse");
  assert.equal(config.options.noUncheckedIndexedAccess, true);
  assert.match(
    ciJob("check-and-test"),
    /^ {6}- name: Typecheck\n {8}run: npm run check\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no Typecheck step of the shape `- name: Typecheck` / `run: npm run check` at the step indent, so the flag is set and no pull request is held to it",
  );
});

// Matched at the file's own step indent the way test/repo/e2e-tiers.test.ts keys its anchors, so a run line planted deeper (under a with: map, which Actions ignores) reds; a step written in flow style reds too, a false red and never a miss. The one miss is a JOB-level if: on check-and-test, which skips Typecheck and Test the same way and which no guard reads; the per-job sweep in test/repo/e2e-tiers.test.ts is its home if it is ever closed.
test("ci.yml's check-and-test job runs the lint as a real step of exactly two lines, so a red lint fails the pull request", () => {
  assert.match(
    ciJob("check-and-test"),
    /^ {6}- name: Lint\n {8}run: npm run lint\n(?= {6}- |\n|$)/m,
    "the check-and-test job has no Lint step of the shape `- name: Lint` / `run: npm run lint` at the step indent, so either the lint never runs, runs with its failure swallowed, or runs only as text somewhere Actions ignores",
  );
});
