import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { ESLint, type Rule } from "eslint";
import { includeIgnoreFile } from "eslint/config";
import css from "@eslint/css";
import tseslint from "typescript-eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const NO_JS = "vellum/ts-comment-no-js-module";
const ISSUE_FORM = "vellum/ts-comment-issue-form";
const EVERY_ROOT = [NO_JS, ISSUE_FORM, "vellum/template-silent-escape"];

test("no comment in the TypeScript tree names a .js module, a trailing comment included, the bundle twins excepted", async () => {
  const [result] = await eslint.lintText([
    "// see worker.js for the old copy",
    "export const a = 1; // was x.js",
    "// the twin is app.bundle.js",
    "export const b = \"x.js\";",
    "/* reveal.js and stage.js, both gone */",
    "// mybundle.js is no twin: a twin's name is app.bundle.js or bundle.js",
  ].join("\n"), { filePath: join(ROOT, "src/cli/main.ts") });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), []);
  assert.deepEqual(result!.messages.filter((m) => m.ruleId === NO_JS).map((m) => [m.line, m.message.match(/"([^"]+)"/)?.[1]]), [[1, "worker.js"], [2, "x.js"], [5, "reveal.js"], [5, "stage.js"], [6, "mybundle.js"]]);
});

const FORMS: ReadonlyArray<readonly [string, string | null]> = [
  ["// fixed in #12", "#12"],
  ["/* see #16 */", "#16"],
  ["/** cites #20 */", "#20"],
  ["export const a = 1; // #19", "#19"],
  ["// #30 and #31", "#30, #31"],
  ["// Issue#18", "#18"],
  ["// a reissue #22", "#22"],
  ["// reissues #34 and shopr #35", "#34, #35"],
  ["// fixed in #5", "#5"],
  ["// the #12th pass", "#12"],
  ["// steps #1g #2h #3i #4j #5k #6l #7m #8n #9o #10p #11q #12r #13s #14t #15u #16v #17w #18x #19y #20z", "#1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, #15, #16, #17, #18, #19, #20"],
  ["// pull request #40, commit #41, ticket #42, bug #43, item #44, fixed #45", "#40, #41, #42, #43, #44, #45"],
  ["// Issue #133/#134", "#134"],
  ["// the grey #123456", "#123456"],
  ["// page.html#12", "#12"],
  ["// &#8212;", "#8212"],
  ["// Issue: #32", "#32"],
  ["// owner/repo#33", "#33"],
  ["/**\n * Issue\n * #24\n */", "#24"],
  ["// Issue", null],
  ["// #25", "#25"],
  ["// Issue #13", null],
  ["// PR #14", null],
  ["// issue #15", null],
  ["// pr #16", null],
  ["// Issues #17", null],
  ["// PRs #21", null],
  ["/* Issue\n   #26 */", null],
  ["// the ink #1a2b3c", null],
  ["// the ink #12ab3c", null],
  ["// the ink #1A2B3C", null],
  ["// the # key and a #hashtag", null],
  ["// the inks #00a #11b #22c #33d #44e #55f #66a #77b #88c #99d", null],
  ["// see #675b for the second part", null],
  ["// a re-issue #36, a non-PR #37, a sub/issue #38 and a vite.pr #39", null],
  ["export const s = \"#27\";", null],
  ["export const t = `#28`;", null],
  ["export const r = /#29/;", null],
  ["// Issue #731", null],
  ["// pull #46, pulls #47, fixes #48, closes #49, resolves #50, refs #51, sub #52, epic #53, no #54, task #55, number #56, gh #57", "#46, #47, #48, #49, #50, #51, #52, #53, #54, #55, #56, #57"],
  ["// v2pr #78 and x_pr #79 and shoprs #80", "#78, #79, #80"],
  ["// Issue-#81 and PR/#82 and PR#83 and PRs#84 and Issues#85", "#81, #82, #83, #84, #85"],
  ["// ISSUE #86 and Pr #87", null],
  ["// the colour #12345678", "#12345678"],
  ["// #102 and #102", "#102, #102"],
  ["// fixed (#60), see [#61]. \"#62\" '#63' -#65- ,#66, :#67: .#68. /#69/ *#70* _#71_ ?#72? <#74> #76#77", "#60, #61, #62, #63, #65, #66, #67, #68, #69, #70, #71, #72, #74, #76, #77"],
  ["/* Issue\t#88 */", null],
  ["/* Issue\r\n   #89 */", null],
  ["// Issue #97 and #98, PR #99, #100 & #101", "#98, #100, #101"],
  ["// (Issue #91) [PR #92] \"Issue #93\" a:PR #94 x,Issue #95 *PR #96", null],
  ["// `#64` and #73! and >#75<", "#64, #73, #75"],
];

test("every comment in the TypeScript tree writes Issue #N or PR #N, each number with its own word, and a string is never read (Issue #675)", async () => {
  const starts = FORMS.map((_, i) => 1 + FORMS.slice(0, i).reduce((n, [form]) => n + form.split("\n").length, 0));
  const [result] = await eslint.lintText(FORMS.map(([form]) => form).join("\n"), { filePath: join(ROOT, "src/cli/main.ts") });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), []);
  assert.deepEqual(
    result!.messages.filter((m) => m.ruleId === ISSUE_FORM).map((m) => [m.line, m.message.match(/names (.+) bare:/)?.[1]]),
    FORMS.flatMap(([, numbers], i) => (numbers === null ? [] : [[starts[i], numbers]])),
    "the comments reporting differ from the planted forms. DECLARED, each erring toward failing: an all-digit hex colour, digits after a word and a hash, an HTML numeric entity, a field label (Issue: #N), another repository's number (owner/repo#N), a doc block wrapped between the word and the number with its * leader, and a run of line comments wrapped the same way all report. DECLARED, erring toward passing (handbook/errata/guards.md rows): the rule reads the form and never the kind, so Issue #731, a pull request, passes; digits running straight into a hex letter read as a colour, so #675b passes; and the word after any character but a letter, a digit or an underscore reads as the word, so re-issue #36, non-PR #37, sub/issue #38 and vite.pr #39 pass, which keeps the ranges ruling A1 wrote (Issue #455-Issue #470, pre-Issue #260) clean",
  );
});

const ROOT_WITNESSES: Readonly<Record<string, string>> = {
  "e2e": "e2e/harness.ts",
  "scripts": "scripts/build-app-bundles.ts",
  "src": "src/cli/main.ts",
  "test": "test/repo/lint-wiring.test.ts",
  "test-support": "test-support/element-shim.ts",
};

const resolvedRules = async (file: string): Promise<Record<string, unknown>> => {
  assert.ok(existsSync(join(ROOT, file)), `${file}, a witness here, does not exist`);
  assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so its root reads nothing`);
  return ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules ?? {};
};

test("the two comment rules and the escape twin reach every TypeScript root the lint reads, and the sheets carry the CSS siblings instead (Issue #675)", async () => {
  assert.deepEqual(Object.keys(ROOT_WITNESSES).sort(), lintTsRoots(), "a TypeScript root the lint reads has no witness here, so these rules' reach there is unpinned");
  for (const file of Object.values(ROOT_WITNESSES)) {
    const rules = await resolvedRules(file);
    for (const rule of EVERY_ROOT) assert.deepEqual(rules[rule], [2], `${file}: ${rule} does not resolve at error`);
  }
  const sheet = await resolvedRules("public/house.css");
  for (const rule of ["vellum/css-comment-no-js-module", "vellum/css-comment-issue-form"]) assert.deepEqual(sheet[rule], [2], `the sheets lost ${rule}, a comment rule's CSS sibling`);
  for (const rule of EVERY_ROOT) assert.equal(sheet[rule], undefined, `${rule} reaches a sheet`);
});

const RULEBOOK = "handbook/specs/rulebook.md";
const FILE_TOKEN = /^(?:e2e|public|scripts|src|test|test-support)\/\S+\.(?:css|ts)$/;
const shortRule = (rule: string): string => rule.replace(/^@typescript-eslint\//, "");

function acceptedSkips(): { pairs: string[]; typeNotes: string[] } {
  const text = readFileSync(join(ROOT, RULEBOOK), "utf8");
  const at = text.indexOf("\n## The accepted lint and type-check skips\n");
  assert.notEqual(at, -1, `${RULEBOOK} has no accepted-skips section, so this guard has no list to hold the tree to`);
  const section = text.slice(at, text.indexOf("\n## ", at + 1));
  const notSkips = section.indexOf("**Not skips:**");
  assert.notEqual(notSkips, -1, "the accepted-skips section has no Not skips line, so this reader has lost its shape");
  const leads = [...section.slice(0, notSkips).matchAll(/^- \*\*([\s\S]*?)\*\*/gm)].map((m) => m[1]!);
  assert.ok(leads.length > 0, "the accepted-skips section lists no entry, so this reader has lost its shape");
  const pairs = leads.flatMap((lead) => {
    const ticks = [...lead.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
    const files = ticks.filter((t) => FILE_TOKEN.test(t));
    assert.ok(ticks.length > 0 && files.length > 0, `an accepted-skip entry names no rule or no file in its bold lead: ${lead}`);
    return files.map((file) => `${file} ${shortRule(ticks[0]!)}`);
  });
  const typeNotes = [...section.slice(notSkips).matchAll(/the `(@ts-[\w-]+)` lines in `([^`]+)`/g)].map((m) => `${m[2]!} ${m[1]!}`);
  return { pairs: pairs.sort(), typeNotes };
}

const NOCHECK = "collector/ts-nocheck-any-case";
const nocheckAnyCase: Rule.RuleModule = {
  meta: { type: "problem", messages: { found: "@ts-nocheck" } },
  create: (context) => ({
    Program() {
      for (const comment of context.sourceCode.getAllComments()) if (/@ts-nocheck/i.test(comment.value)) context.report({ loc: comment.loc!, messageId: "found" });
    },
  }),
};

const collector = new ESLint({
  cwd: ROOT,
  overrideConfigFile: true,
  overrideConfig: [
    includeIgnoreFile(join(ROOT, ".gitignore")),
    {
      files: ["**/*.ts"],
      languageOptions: { parser: tseslint.parser },
      plugins: { "@typescript-eslint": tseslint.plugin, collector: { rules: { "ts-nocheck-any-case": nocheckAnyCase } } },
      linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "off" },
      rules: { "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": true, "ts-ignore": true, "ts-nocheck": false, "ts-check": false }], [NOCHECK]: "error" },
    },
    { files: ["**/*.css"], plugins: { css }, language: "css/css", languageOptions: { tolerant: true }, linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "off" } },
  ],
});

const INLINE = /^'([\s\S]*)' has no effect because you have 'noInlineConfig'/;

function directiveRules(directive: string): string[] {
  const body = directive.replace(/^\/\/|^\/\*|\*\/$/g, "").split(/\s--\s/)[0]!.trim();
  const [kind = "", ...rest] = body.split(/\s+/);
  const tail = rest.join(" ");
  const named = kind === "eslint" ? [...tail.matchAll(/([@\w/-]+)\s*:/g)].map((m) => m[1]!) : kind.startsWith("eslint-disable") ? tail.split(",").map((r) => r.trim()).filter(Boolean) : [`(${kind})`];
  return named.length > 0 ? named.map(shortRule) : ["(every rule)"];
}

const tsDirective = (m: { messageId?: string; message: string }): string =>
  m.messageId === "tsIgnoreInsteadOfExpectError" ? "@ts-ignore" : (/"(@ts-[\w-]+)"/.exec(m.message)?.[1] ?? "@ts-(unread)");

const skipsIn = (results: readonly ESLint.LintResult[]): string[] =>
  results.flatMap((r) => {
    const file = relative(ROOT, r.filePath).split(sep).join("/");
    return r.messages.flatMap((m) => {
      const inline = m.ruleId === null ? INLINE.exec(m.message) : null;
      if (inline) return directiveRules(inline[1]!).map((rule) => `${file} ${rule}`);
      if (m.ruleId === "@typescript-eslint/ban-ts-comment") return [`${file} ${tsDirective(m)}`];
      if (m.ruleId === NOCHECK) return [`${file} @ts-nocheck`];
      return [`${file} (unread: ${m.ruleId ?? "parse"} ${m.message})`];
    });
  });

test("the skip collector reads every directive form through ESLint's own parser, the rule-off form included, and nothing inside a string", async () => {
  const plant = [
    "// eslint-disable-next-line max-lines-per-function",
    "export const a = 1; // eslint-disable-line @typescript-eslint/no-unnecessary-condition",
    "/* eslint max-lines: \"off\" */",
    "/* eslint-disable */",
    "/*eslint-disable no-console, no-debugger -- a reason */",
    "// @ts-expect-error a note",
    "export const b: number = 1;",
    "/* @ts-ignore */",
    "export const c = \"// eslint-disable-line no-console\";",
    "// @TS-NOCHECK, which the type checker obeys in any case",
    "export const d = \"// @ts-nocheck\";",
  ].join("\n");
  const at = "src/cli/main.ts";
  assert.deepEqual(skipsIn(await collector.lintText(plant, { filePath: join(ROOT, at) })), [
    "max-lines-per-function", "no-unnecessary-condition", "max-lines", "(every rule)", "no-console", "no-debugger", "@ts-expect-error", "@ts-ignore", "@ts-nocheck",
  ].map((s) => `${at} ${s}`));
  const sheet = "public/house.css";
  const sheetPlant = "/* eslint-disable vellum/css-comment-one-line */\n.a { color: red; } /* eslint-disable-line vellum/css-comment-issue-form */\n";
  assert.deepEqual(skipsIn(await collector.lintText(sheetPlant, { filePath: join(ROOT, sheet) })), [`${sheet} vellum/css-comment-one-line`, `${sheet} vellum/css-comment-issue-form`]);
});

test("every lint and type-check skip in the linted tree is an entry in the rulebook's accepted list, and every entry is a skip in the tree (Issue #654 ruling D, Issue #675)", async () => {
  const { pairs, typeNotes } = acceptedSkips();
  const found = skipsIn(await collector.lintFiles([...lintTsRoots().map((root) => `${root}/**/*.ts`), "public/**/*.css"]));
  const isType = (entry: string): boolean => / @ts-/.test(entry);
  assert.deepEqual(
    found.filter((e) => !isType(e)).sort(),
    pairs,
    `the skips in the tree and the entries in ${RULEBOOK} ("The accepted lint and type-check skips") differ: fix the code, or put the skip to Alex and add its entry in the same change, and remove an entry with the skip it named. BLIND SPOTS, declared: a file the lint does not read (gitignored, design/, .claude/) is not read here either, erring toward passing; an entry is matched by file and rule, never by line or form, so an accepted line skip widened to the whole file (a block eslint-disable, or a rule-off comment at the head) passes, erring toward passing (a handbook/errata/guards.md row); a second skip of an accepted rule in an accepted file reds, since the list is matched as a multiset, erring toward failing; eslint-enable, global and exported comments read as skips, and a comment merely mentioning @ts-nocheck reads as one, erring toward failing`,
  );
  assert.deepEqual(found.filter(isType).filter((e) => !typeNotes.includes(e)), [], `a type-check skip stands in the tree that ${RULEBOOK}'s Not skips line does not name. BLIND SPOT, declared, erring toward passing (the same handbook/errata/guards.md row as the file-and-rule match): a note is matched by file and directive as a set, so one more @ts-expect-error in a named file, used as a real skip, passes`);
  assert.deepEqual(typeNotes.filter((note) => !found.includes(note)), [], `${RULEBOOK}'s Not skips line names a type-check skip the tree no longer carries`);
});
