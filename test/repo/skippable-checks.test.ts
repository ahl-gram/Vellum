import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { SKIPPABLE_TESTS } from "../../scripts/lint/skippable-checks.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import {
  type Plant,
  plantMessages,
  refusedLines,
  reportedLines,
  resolvedRule,
} from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/test-unskippable-check";
const AT = "test/repo/skippable-checks.test.ts";
const REFUSE = true;
const PASS = false;

const PLANT: Plant = [
  ['import { it, test } from "node:test";', PASS],
  ['import assert from "node:assert/strict";', PASS],
  ["declare const c: boolean;", PASS],
  ["declare const xs: number[];", PASS],
  ["declare function assertNear(a: number, b: number): void;", PASS],
  ["declare function expectFor(a: number): void;", PASS],
  ["declare function check(a: number): void;", PASS],
  ["declare const other: { skip(why: string): void };", PASS],
  ["declare const named: () => void;", PASS],
  ['test("an early return", () => { if (c) return; assert.ok(1); });', REFUSE],
  [
    'test("a continue in the loop that holds the check", () => { for (const x of xs) { if (x > 1) continue; assert.ok(x); } });',
    REFUSE,
  ],
  ['test("every check under an if", () => { for (const x of xs) if (x > 1) assert.ok(x); });', REFUSE],
  ['test("a check in a ternary", () => { void (c ? assert.ok(1) : 0); });', REFUSE],
  [
    'test("a floor after the loop", () => { let n = 0; for (const x of xs) { if (x > 1) continue; n++; assert.ok(x); } assert.ok(n >= 1); });',
    PASS,
  ],
  ['test("an announced skip", (t) => { if (c) { t.skip("no case"); return; } assert.ok(1); });', PASS],
  [
    'test("a skip on another object announces nothing", (t) => { if (c) { other.skip("no case"); return; } t.assert.ok(1); });',
    REFUSE,
  ],
  ['test("a skip after the exit announces nothing", (t) => { if (c) return; t.skip("late"); assert.ok(1); });', REFUSE],
  ['test("an if and its else both check", () => { if (c) assert.ok(1); else assert.equal(1, 1); });', PASS],
  ['test("a check before the skip", () => { assert.ok(1); if (c) return; assert.ok(2); });', PASS],
  ['test("a check in the branch before its return", () => { if (c) { assert.ok(1); return; } assert.ok(2); });', PASS],
  [
    'test("a continue in an inner loop leaves the outer check", () => { for (const x of xs) { for (const y of xs) { if (y > x) continue; assert.ok(y); } assert.ok(x); } });',
    PASS,
  ],
  ['test("a helper named assert<Upper> checks", () => { if (c) return; assertNear(1, 1); });', REFUSE],
  ['test("a helper named expect<Upper> checks", () => { if (c) return; expectFor(1); });', REFUSE],
  ['test("the context\'s own assert checks", (t) => { if (c) return; t.assert.ok(1); });', REFUSE],
  ['it("it is read as test is", () => { if (c) return; assert.ok(1); });', REFUSE],
  ['test("options before the body", { timeout: 10 }, () => { if (c) return; assert.ok(1); });', REFUSE],
  [
    'test("a return inside a callback skips nothing here", () => { xs.forEach((x) => { if (x) return; }); assert.ok(1); });',
    PASS,
  ],
  ['test("a helper under another name is no check", () => { if (c) return; check(1); });', PASS],
  [
    'test("a check inside a callback is not read", () => { xs.forEach((x) => { assert.ok(x); }); if (c) assert.ok(1); });',
    REFUSE,
  ],
  ['test("a break skips nothing here", () => { for (const x of xs) { if (x > 1) break; assert.ok(x); } });', PASS],
  [
    'test("an else-if chain with no last else", () => { if (c) assert.ok(1); else if (xs.length > 0) assert.ok(2); });',
    PASS,
  ],
  [
    'test("a check behind && is not conditional here", () => { if (xs.length > 0) assert.ok(1); c && assert.ok(2); });',
    PASS,
  ],
  [
    'test("a check in a catch is not conditional here", () => { try { void c; } catch { assert.fail("threw"); } });',
    PASS,
  ],
  ['test("a body passed by name is not read", named);', PASS],
  [
    'test("an earlier if leaves a later check after a bare return", () => { if (xs.length > 0) assert.ok(1); if (c) return; assert.ok(2); });',
    REFUSE,
  ],
  ['test("a computed member is no check", () => { if (c) return; assert["ok"](1); });', PASS],
];

const BLIND_SPOTS =
  "BLIND SPOTS, declared, each with its direction: a check made through a helper under any other name (check, must, verify) is no check, so a test whose only checks are such calls passes (a miss), and one that makes such a call on every path beside an assert under an if is refused (a false red); a check inside a callback, a forEach's or a function the body defines, is not read, in the same two directions; a break, a try's catch, a switch and a && or || are read as neither a skip nor a condition (a miss); an else-if chain counts as checked on both sides once its first if and a later branch check, though its last if has no else (a miss); a loop over a list a filter emptied, and a floor that cannot fail (count >= 0), pass (a miss); a test whose body is passed by name is not read (a miss); a check through a computed member (assert[name]) is no check (a miss); a labelled continue is read against its nearest loop rather than its label's (either way)";

test("a unit test whose every check can be skipped is refused at its call, and one with a check on every path, an announced skip or an if whose else checks passes (Issue #1329)", async () => {
  const refused = refusedLines(PLANT);
  assert.ok(refused.length > 0 && refused.length < PLANT.length, "the plant cannot tell the rule from its negation");
  assert.deepEqual(await reportedLines(PLANT, AT, RULE), refused, BLIND_SPOTS);
});

const lintWith = (excused: Readonly<Record<string, string>>): ESLint =>
  new ESLint({
    cwd: ROOT,
    flags: ["unstable_native_nodejs_ts_config"],
    overrideConfig: { files: ["test/**/*.test.ts"], rules: { [RULE]: ["error", { excused }] } },
  });
const found = async (
  lines: readonly string[],
  excused: Readonly<Record<string, string>>,
): Promise<Array<[string, number]>> =>
  (await plantMessages(lines, AT, lintWith(excused)))
    .filter((m) => m.ruleId === RULE)
    .map((m): [string, number] => [m.messageId ?? "", m.line]);
const HEAD = [
  'import { test } from "node:test";',
  'import assert from "node:assert/strict";',
  "declare const c: boolean;",
];
const skippable = (title: string): string => `test("${title}", () => { if (c) return; assert.ok(1); });`;
const KEY = `${AT} :: excused`;

test("an excuse in SKIPPABLE_TESTS lifts the one test its key names, and an excuse that lifts nothing in its file reds there as stale (Issue #1329)", async () => {
  assert.deepEqual(
    await found([...HEAD, skippable("excused"), skippable("not excused")], { [KEY]: "a reason" }),
    [["found", 5]],
    "the excused test is lifted and its neighbour is not",
  );
  assert.deepEqual(
    await found([...HEAD, 'test("excused", () => { assert.ok(1); });'], { [KEY]: "a reason" }),
    [["stale", 1]],
    "an excuse whose test now checks on every path is stale",
  );
  assert.deepEqual(
    await found([...HEAD, 'test("another", () => { assert.ok(1); });'], { [KEY]: "a reason" }),
    [["stale", 1]],
    "an excuse whose test is gone is stale",
  );
  assert.deepEqual(
    await found([...HEAD, skippable("excused")], { "test/repo/other.test.ts :: excused": "a reason" }),
    [["found", 4]],
    "an excuse keyed to another file lifts nothing here and is not read here",
  );
  assert.deepEqual(
    await found([...HEAD, "test(`excused`, () => { if (c) return; assert.ok(1); });"], { [KEY]: "a reason" }),
    [],
    "a title written as a template with no expression is the text an excuse names",
  );
});

test("an excuse carries its reason: the rule's options refuse an empty one (Issue #1329)", async () => {
  await assert.rejects(found(HEAD, { [KEY]: "" }), /shorter than 1 character/);
});

test("every SKIPPABLE_TESTS key names a unit test file that exists, by the repo path the rule keys on, and a title, since an excuse for a file the lint never reads is never found stale (Issue #1329)", () => {
  const stray = Object.keys(SKIPPABLE_TESTS).filter((key) => {
    const at = key.indexOf(" :: ");
    const path = at === -1 ? "" : key.slice(0, at);
    const title = at === -1 ? "" : key.slice(at + 4);
    return !/^test\/.+\.test\.ts$/.test(path) || !existsSync(join(ROOT, path)) || title === "";
  });
  assert.deepEqual(stray, [], "each key is <the repo path of a unit test file> :: <that test's title>");
});

test("the rule resolves at error with SKIPPABLE_TESTS on every .test.ts under test/ at any depth, and on no other file the lint reads (Issue #1329)", async () => {
  const want = [2, { excused: SKIPPABLE_TESTS }];
  for (const file of [WITNESSES["test/**/*.ts"]!, "test/nested/deeper/part.test.ts"])
    assert.deepEqual(await resolvedRule(file, RULE), want, `${RULE} does not resolve as wired on ${file}`);
  const others = [
    "test/nested/helper.ts",
    WITNESSES["src/styles/**/*.css"]!,
    ...lintTsRoots()
      .filter((root) => root !== "test")
      .map((root) => WITNESSES[`${root}/**/*.ts`]!),
  ];
  for (const file of others) assert.equal(await resolvedRule(file, RULE), undefined, `${RULE} reaches ${file}`);
});
