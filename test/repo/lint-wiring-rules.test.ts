import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { eslint } from "../../test-support/source-shape-reports.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import {
  CHART_INSTRUMENTS,
  INLINE_BLOCKS_OUTSIDE_MARKER_LISTS,
  SANCTIONED_LIFTS,
  TIPPING_LINKS,
  TIPS_AWAITING_A_RULING,
} from "../../scripts/lint/sheet-motion.ts";
import { LINT_SCOPE, REFUSED, blocks, shortName, type Resolved } from "../../test-support/lint-wiring-scope.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");

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
  for (const rule of [
    "@typescript-eslint/switch-exhaustiveness-check",
    "@typescript-eslint/no-unnecessary-condition",
  ]) {
    assert.deepEqual(
      rules[rule],
      typed ? [2] : undefined,
      `${file}: ${rule} does not resolve at error with no options (Correctness, Issue #648)`,
    );
  }
  for (const rule of CORRECTNESS_TS_ONLY) {
    assert.equal(
      severityOf(rules[rule]),
      typed ? 2 : undefined,
      `${file}: ${rule} does not resolve at error (Correctness, Issue #648)`,
    );
  }
  for (const rule of CORRECTNESS_BOTH) {
    assert.equal(
      severityOf(rules[rule]),
      2,
      `${file}: ${rule} does not resolve at error in both blocks (Correctness, Issue #648)`,
    );
  }
}

const SHEET_RULES: Readonly<Record<string, unknown>> = {
  "vellum/css-comment-one-line": [2],
  "vellum/css-comment-issue-form": [2],
  "vellum/css-comment-no-js-module": [2],
  "vellum/css-no-narrow-width": [2],
  "vellum/css-comment-citation-resolves": [2],
  "vellum/css-token-by-name": [2],
  "vellum/css-shadow-by-token": [2],
  "vellum/css-var-declared": [2],
  "vellum/css-house-owns-intro": [2],
  "vellum/css-house-owns-controls": [2],
  "vellum/css-kit-not-redressed": [2],
  "vellum/css-kit-owns-contents-row": [2],
  "vellum/css-kit-owns-select-dress": [2],
  "vellum/css-engine-dress-one-home": [2],
  "vellum/css-engine-no-host-id": [2],
  "vellum/css-lift-by-token": [2, { sanctioned: SANCTIONED_LIFTS }],
  "vellum/css-tip-goes-somewhere": [
    2,
    { links: TIPPING_LINKS, instruments: CHART_INSTRUMENTS, awaiting: TIPS_AWAITING_A_RULING },
  ],
  "vellum/css-inline-block-bullet": [2, { outside: INLINE_BLOCKS_OUTSIDE_MARKER_LISTS }],
};
const TURNED_ON = [
  "@typescript-eslint/no-unnecessary-type-assertion",
  "@typescript-eslint/no-unsafe-argument",
  "@typescript-eslint/no-unsafe-assignment",
  "@typescript-eslint/no-unsafe-call",
  "@typescript-eslint/no-unsafe-member-access",
  "@typescript-eslint/no-unused-vars",
  "@typescript-eslint/require-await",
];
const PAGE_ELEMENT_PARAMETERS = [
  "drawerEls",
  "ghostEl",
  "innerEl",
  "legendEl",
  "logEls",
  "mapEl",
  "noteEl",
  "pillEl",
  "roomEls",
  "sheetEl",
  "slipEl",
  "statusEl",
  "targetEl",
  "viewportEl",
];
const PARAM_REASSIGN = { props: true, ignorePropertyModificationsFor: PAGE_ELEMENT_PARAMETERS };

function checkCoreAndHouseRules(
  file: string,
  typed: boolean,
  rules: Record<string, unknown>,
  on: (rule: string) => unknown,
): void {
  assert.equal(
    on("no-undef"),
    typed ? 0 : 2,
    `${file}: the core layer is missing or the TypeScript override layer was not applied`,
  );
  assert.equal(on("no-debugger"), 2, `${file}: the core recommended rules do not reach it`);
  assert.equal(on("prefer-const"), 2, `${file}: prefer-const does not resolve at error (Immutability, Issue #648)`);
  assert.deepEqual(
    rules["no-param-reassign"],
    [2, PARAM_REASSIGN],
    `${file}: no-param-reassign does not resolve at error with property writes on and exactly the page-element parameter names excused; Alex ruled that only a write into a page element is accepted, excused by one list of names used for nothing else, so a new parameter holding a page element takes a name from the list or joins it here and in eslint.config.ts, with vellum/param-excuse-holds-element as the check that it holds one, and any other write returns a new value instead (Alex, 2026-09-26, Issue #654 rulings 4 and 5)`,
  );
  assert.deepEqual(
    rules["no-empty"],
    typed ? [2, { allowEmptyCatch: true }] : undefined,
    `${file}: no-empty does not resolve at error with only the empty catch admitted (Alex, 2026-09-26, Issue #654 ruling 9)`,
  );
  assert.equal(
    on("@typescript-eslint/prefer-readonly"),
    typed ? 2 : undefined,
    `${file}: prefer-readonly does not resolve at error (Immutability, Issue #648)`,
  );
  assert.deepEqual(
    rules["max-lines"],
    [2, { max: 400, skipBlankLines: true, skipComments: true }],
    `${file}: max-lines does not resolve at error with the ruled ceiling of 400 lines of code, blank and comment lines skipped (Size, Issue #648; the skips Alex, 2026-10-07, Issue #779)`,
  );
  assert.deepEqual(
    rules["max-lines-per-function"],
    [2, { max: 50, skipBlankLines: true, skipComments: true }],
    `${file}: max-lines-per-function does not resolve at error with the ruled ceiling of 50 lines of code, blank and comment lines skipped (Size, Issue #648; the skips Alex, 2026-10-07, Issue #779)`,
  );
  assert.deepEqual(
    rules["max-depth"],
    [2, 4],
    `${file}: max-depth does not resolve at error with the ruled depth (Size, Issue #648)`,
  );
}

function pinJavaScript(file: string, typed: boolean, config: Resolved, rules: Record<string, unknown>): void {
  const on = (rule: string): unknown => severityOf(rules[rule]);
  assert.equal(
    config.languageOptions?.parser?.meta?.name,
    typed ? "typescript-eslint/parser" : undefined,
    `${file} resolves to the wrong parser`,
  );
  assert.equal(
    on("@typescript-eslint/no-misused-promises"),
    typed ? 2 : undefined,
    `${file}: the roster rule this PR ticks does not resolve at error`,
  );
  assert.equal(
    on("@typescript-eslint/no-explicit-any"),
    typed ? 2 : undefined,
    `${file}: no-explicit-any does not resolve at error`,
  );
  for (const rule of TURNED_ON) {
    assert.deepEqual(
      rules[rule],
      typed ? [2] : undefined,
      `${file}: ${rule} does not resolve at error with no options; the config set it off while its violations stood, and Issue #654 turned it on with them fixed`,
    );
  }
  checkCoreAndHouseRules(file, typed, rules, on);
  pinCorrectness(file, typed, rules);
  for (const rule of Object.keys(SHEET_RULES)) {
    assert.equal(
      rules[rule],
      undefined,
      `${file}: ${rule} is a rule for the sheets and must not resolve on a script (CSS form, Issue #648)`,
    );
  }
}

function pinCss(file: string, config: Resolved, rules: Record<string, unknown>): void {
  assert.equal(
    config.languageOptions?.parser,
    undefined,
    `${file} resolves a JavaScript parser instead of the CSS language`,
  );
  assert.deepEqual(
    config.language?.defaultLanguageOptions,
    { tolerant: false },
    `${file} does not resolve to @eslint/css's language (CSS form, Issue #648)`,
  );
  assert.equal(
    config.languageOptions?.tolerant,
    true,
    `${file}: the sheets parse strict, so a syntax css-tree does not know reds the lint; the family ruled tolerant (Alex's delegation, 2026-09-21, Issue #648)`,
  );
  for (const [rule, entry] of Object.entries(SHEET_RULES))
    assert.deepEqual(
      rules[rule],
      entry,
      `${file}: ${rule} does not resolve at error with its ruled options, or none (Issue #648, Issue #779 part 2d)`,
    );
  assert.deepEqual(
    Object.keys(rules)
      .filter((r) => severityOf(rules[r]) !== 0)
      .sort(),
    Object.keys(SHEET_RULES).sort(),
    `${file}: a rule off the stylesheet block's ruled set reaches the sheets, or a ruled one does not (Issue #648, Issue #675, Issue #763, Issue #779)`,
  );
}

test("through ESLint itself, one witness file per ruled glob resolves to rules that reach it, and the root config resolves to none", async () => {
  assert.deepEqual(
    Object.keys(WITNESSES).sort(),
    LINT_SCOPE.filter((g) => !REFUSED.includes(g)),
    "every ruled glob that carries rules needs a witness file here; the refused JavaScript globs have none by design, and the test below is their witness",
  );
  assert.equal(
    await eslint.findConfigFile("src/cli/main.ts"),
    join(ROOT, "eslint.config.ts"),
    "ESLint resolves a different config file than the one this guard imports; a .js, .mjs or .cjs config at the root shadows the .ts one",
  );
  for (const [glob, file] of Object.entries(WITNESSES)) {
    assert.ok(
      file.startsWith(glob.slice(0, glob.indexOf("**"))) && file.endsWith(glob.slice(glob.lastIndexOf("*") + 1)),
      `${file}, the witness for ${glob}, lies outside its glob, so it witnesses another root and this one reaches nothing seen`,
    );
    assert.ok(existsSync(join(ROOT, file)), `${file}, the witness for ${glob}, does not exist`);
    assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so ${glob} reaches nothing`);
    const config = (await eslint.calculateConfigForFile(file)) as Resolved;
    const rules = config.rules;
    assert.ok(rules, `${file} resolves to no rules at all`);
    if (glob.endsWith(".css")) pinCss(file, config, rules);
    else pinJavaScript(file, glob.endsWith(".ts"), config, rules);
    const report = config.linterOptions?.reportUnusedDisableDirectives;
    assert.ok(
      [1, 2, "warn", "error"].includes(report as never),
      `${file}: an unused disable directive is not reported (${String(report)}), so a stale exemption is silent`,
    );
  }
  assert.equal(
    await eslint.isPathIgnored("eslint.config.ts"),
    true,
    "the root config lints itself, so the scope leaked past the ruled roots",
  );
});

test("only typescript-eslint's recommended-type-checked block sets a rule Issue #654 turned on, each at error, and it reaches every TypeScript root unnarrowed with no ignores, so no block can take one back by setting it or by narrowing the preset", () => {
  const PRESET = "typescript-eslint/recommended-type-checked";
  const setters = blocks.flatMap((b) =>
    TURNED_ON.filter((rule) => Object.hasOwn(b.rules ?? {}, rule)).map(
      (rule) => `${shortName(b)}: ${rule} = ${JSON.stringify(b.rules?.[rule])}`,
    ),
  );
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
    "the preset that sets these rules does not reach exactly the TypeScript roots: the block that extends it has changed its own files, and a narrowing (a conjunct such as src/**/*.ts with src/cli/**) takes the rules back for everything it dropped",
  );
  assert.equal(
    preset[0]!.ignores,
    undefined,
    "the preset carries an ignores key, which takes the rules back for whatever it excludes while its files still name the roots",
  );
});

test("no block sets a rule off but typescript-eslint's own two layers and ruling D's design/ block, so the house config takes no rule back once Issue #654 has turned each on", () => {
  const PRESET_LAYERS = ["typescript-eslint/eslint-recommended", "typescript-eslint/recommended-type-checked"];
  for (const layer of PRESET_LAYERS)
    assert.equal(
      blocks.filter((b) => shortName(b) === layer).length,
      1,
      `${layer} names more or fewer than one block, so a house block named like it would pass unread`,
    );
  const isOff = (v: unknown): boolean => v === "off" || v === 0 || (Array.isArray(v) && (v[0] === "off" || v[0] === 0));
  const offs = blocks
    .filter((b) => !PRESET_LAYERS.includes(shortName(b)))
    .flatMap((b) =>
      Object.entries(b.rules ?? {})
        .filter(([, v]) => isOff(v))
        .map(([rule]) => `${b.name ?? "(unnamed)"}: ${rule}`),
    );
  assert.deepEqual(
    offs,
    ["Issue #653 ruling D: design/ archives its round tools as they ran: no-restricted-syntax"],
    "a block of the house config sets a rule off, which takes it back for every file the block matches whether or not a pin names the rule. BLIND SPOTS, declared, both erring toward passing: a rule left at error but weakened by its options, which only the setters tests for TURNED_ON, no-empty and no-param-reassign here and test/repo/lint-strict.test.ts's for the rules Issue #779 adopted see in every block, while the witness test pins the size rules, no-floating-promises, no-unnecessary-condition and switch-exhaustiveness-check only at the witness files, so a block over a subtree with no witness in it weakens them unread; and a rule typescript-eslint's own two layers set off, which an upgrade could change unread",
  );
});

test("only the core recommended layer and the TypeScript block set no-empty, the second with the empty catch Alex ruled in, so no block can take it back for a subtree or a named file (Issue #654 ruling 9)", () => {
  const setters = blocks
    .filter((b) => Object.hasOwn(b.rules ?? {}, "no-empty"))
    .map((b) => `${(b.name ?? "(unnamed)").replace(/^.* > /, "")}: ${JSON.stringify(b.rules?.["no-empty"])}`);
  assert.deepEqual(
    setters,
    ['@eslint/js/recommended: "error"', '(unnamed): ["error",{"allowEmptyCatch":true}]'],
    "a block other than the core layer and the TypeScript block sets no-empty, and a block can turn it off for every file it matches while the witnesses still resolve the ruled scope",
  );
});

test("only the TypeScript block sets no-param-reassign, with property writes on and exactly the ruled names excused, so no block can narrow it for a subtree or a named file (Issue #654 rulings 4 and 5)", () => {
  const setters = blocks
    .filter((b) => Object.hasOwn(b.rules ?? {}, "no-param-reassign"))
    .map((b) => `${shortName(b)}: ${JSON.stringify(b.rules?.["no-param-reassign"])}`);
  assert.deepEqual(
    setters,
    [`(unnamed): ${JSON.stringify(["error", PARAM_REASSIGN])}`],
    "a block other than the TypeScript block sets no-param-reassign, or that block's options are not the ruled ones, and a block over a subtree or one named file can take property writes back off or excuse another name there while every witness still resolves the ruled options",
  );
});
