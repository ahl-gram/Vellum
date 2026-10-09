import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import {
  CHART_INSTRUMENTS,
  INLINE_BLOCKS_OUTSIDE_MARKER_LISTS,
  SANCTIONED_LIFTS,
  TIPPING_LINKS,
  TIPS_AWAITING_A_RULING,
} from "../../scripts/lint/sheet-motion.ts";
import { sheetsOnDisk, SRC_CSS_FILES } from "../../scripts/lint/sheet-tokens.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const LIFT = "vellum/css-lift-by-token";
const TIP = "vellum/css-tip-goes-somewhere";
const BULLET = "vellum/css-inline-block-bullet";

const REFUSE = true;
const PASS = false;
type Plant = ReadonlyArray<readonly [string, boolean]>;

const lintWith = (rule?: string, options?: unknown): ESLint =>
  new ESLint({
    cwd: ROOT,
    flags: ["unstable_native_nodejs_ts_config"],
    ...(rule ? { overrideConfig: { files: ["public/**/*.css"], rules: { [rule]: ["error", options] } } } : {}),
  });

const reported = async (plant: Plant, path: string, rule: string, options?: unknown): Promise<number[]> => {
  const eslint = lintWith(options === undefined ? undefined : rule, options);
  const [result] = await eslint.lintText(plant.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return [...new Set(result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line))];
};

const refusedLines = (plant: Plant): number[] => plant.flatMap(([, r], i) => (r ? [i + 1] : []));

const assertRefuses = async (plant: Plant, rule: string, blind: string): Promise<void> => {
  const refused = refusedLines(plant);
  assert.ok(
    refused.length > 0 && refused.length < plant.length,
    `${rule}'s plant cannot tell the rule from its negation`,
  );
  assert.deepEqual(await reported(plant, "public/house.css", rule), refused, blind);
};

test("no hover or active rule lifts by a literal: the raise is a token, and a literal stands only as a SANCTIONED_LIFTS entry for its own file (Issue #405, Issue #779 part 2d)", async () => {
  const plant: Plant = [
    [".a:hover { transform: translateY(-2px); }", REFUSE],
    [".a:active { transform: translateY(1px) rotate(0); }", REFUSE],
    [".a:hover { --lift: translateY(-3px); }", REFUSE],
    [".plate:hover { transform: translateY(-5px); }", REFUSE],
    [".a:hover { transform: translateY(var(--raise)); }", PASS],
    [".a:hover { transform: translateY(0); }", PASS],
    [".a:hover { transform: translateY(0px); }", PASS],
    [".a { transform: translateY(-2px); }", PASS],
    ["@keyframes k { 70% { transform: translateY(-2px); } }", PASS],
    [".a:hover { translate: 0 -2px; }", PASS],
    [".a:hover { transform: translate(0, -2px) translate3d(0, -2px, 0); }", PASS],
  ];
  await assertRefuses(
    plant,
    LIFT,
    "BLIND SPOTS, declared, each a miss (Issue #779 D3: the check reads what it read): the translate property, translate() and translate3d(); a lift in a custom property consumed by var()",
  );
  const sanctioned = { "motion.css :: .x:hover": "-5px", "motion.css :: .gone:hover": "-1px" };
  const listed: Plant = [
    [".x:hover { transform: translateY(-5px); }", PASS],
    [".x:hover, .y:hover { transform: translateY(-5px); }", REFUSE],
    [".x:hover { transform: translateY(-6px); }", REFUSE],
  ];
  assert.deepEqual(
    await reported(listed, "public/motion.css", LIFT, { sanctioned }),
    [1, 2, 3],
    "every arm is sanctioned at that value in this file, and an entry that matched nothing is reported stale on line 1",
  );
  assert.deepEqual(
    await reported(listed, "public/house.css", LIFT, { sanctioned }),
    [1, 2, 3],
    "an entry for another file sanctions nothing here",
  );
});

test("every hover tip goes somewhere: a rotate() on hover stands only as a TIPPING_LINKS, CHART_INSTRUMENTS or TIPS_AWAITING_A_RULING entry for its own file, and an entry with no tip left is stale (Issue #289, Issue #360, Issue #779 part 2d)", async () => {
  const plant: Plant = [
    ["a.control:hover { transform: rotate(-0.6deg); }", REFUSE],
    [".x:hover img { transform: translateY(var(--raise)) rotate(-1deg); }", REFUSE],
    [".x:focus-visible { transform: rotate(-1deg); }", PASS],
    [".x { transform: rotate(-1deg); }", PASS],
    [".x:hover { transform: rotateZ(-1deg) rotate3d(0, 0, 1, 1deg); }", PASS],
    [".x:hover { rotate: -1deg; }", PASS],
  ];
  await assertRefuses(
    plant,
    TIP,
    "BLIND SPOTS, declared, each a miss (Issue #779 D3): the rotate property, rotateZ() and rotate3d(); a tip in a custom property consumed by var(); a comma-joined selector list is one key, so a navigating and a non-navigating arm in one rule are judged together (handbook/errata/site.md, PR #479)",
  );
  const lists = {
    links: ["motion.css :: .x:hover"],
    instruments: ["motion.css :: .y:hover, .y:focus-visible"],
    awaiting: ["motion.css :: .gone:hover"],
  };
  const listed: Plant = [
    [".x:hover { transform: rotate(1deg); }", PASS],
    [".y:hover,", PASS],
    [".y:focus-visible { transform: rotate(1deg); }", PASS],
    [".z:hover { transform: rotate(1deg); }", REFUSE],
  ];
  assert.deepEqual(
    await reported(listed, "public/motion.css", TIP, lists),
    [1, 4],
    "the stale entry on line 1, the unlisted tip on 4",
  );
});

test("an inline-block keeps its bullet on line one: a subject that settles display: inline-block settles vertical-align: top in the same file, or is an INLINE_BLOCKS_OUTSIDE_MARKER_LISTS entry (Issue #356, Issue #358, Issue #779 part 2d)", async () => {
  const plant: Plant = [
    ["a.control { display: inline-block; }", REFUSE],
    [".a { display: inline-block; vertical-align: top; }", PASS],
    [".b { display: inline-block; } .b { vertical-align: top; }", PASS],
    [".c { vertical-align: top; } .c { vertical-align: middle; display: inline-block; }", REFUSE],
    [":is(.toc, .gazetteer) a { display: inline-block; }", REFUSE],
    [".d, .e { display: inline-block; vertical-align: top; }", PASS],
    [".broadside .seal::before { display: inline-block; }", PASS],
    [".f:hover { display: inline-block; }", PASS],
    [".i:not(.j) { display: inline-block; }", PASS],
    [".g:hover .h { display: inline-block; }", REFUSE],
    ['a[href^="http:"] { display: inline-block; }', REFUSE],
    ["@media print { .k { display: inline-block; } }", REFUSE],
  ];
  await assertRefuses(
    plant,
    BULLET,
    "a subject with a pseudo-class or a pseudo-element is not a list item's box, as the old sweep read it; declarations merge over the whole file, at-rules included, a later one winning",
  );
  const listed: Plant = [
    [".w a { display: inline-block; }", PASS],
    [".v { display: inline-block; }", REFUSE],
  ];
  assert.deepEqual(
    await reported(listed, "public/motion.css", BULLET, { outside: ["motion.css :: .w a", "motion.css :: .gone"] }),
    [1, 2],
    "the stale entry on line 1, the unlisted inline-block on 2",
  );
});

test("every list entry names a sheet under public/ or a module that builds CSS, so none names a file the lint never reads and so never reports stale (Issue #779 part 2d, D2)", () => {
  const readable = new Set([...sheetsOnDisk().map((p) => p.slice("public/".length)), ...SRC_CSS_FILES]);
  const entries = [
    ...Object.keys(SANCTIONED_LIFTS),
    ...TIPPING_LINKS,
    ...CHART_INSTRUMENTS,
    ...TIPS_AWAITING_A_RULING,
    ...INLINE_BLOCKS_OUTSIDE_MARKER_LISTS,
  ];
  assert.ok(entries.length > 0, "the lists are empty, so this check reads nothing");
  for (const entry of entries) {
    const [file, selector] = entry.split(" :: ");
    assert.ok(selector, `${entry} is not written <file> :: <selector>`);
    assert.ok(
      readable.has(file!),
      `${entry} names ${file}, which is no sheet under public/ and no module that builds CSS`,
    );
  }
});

const resolvedRule = async (file: string, rule: string): Promise<unknown> =>
  ((await lintWith().calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[rule];

test("the three motion rules resolve at error with the lists as their options on every sheet, and on no script (Issue #779 part 2d)", async () => {
  const expected: ReadonlyArray<readonly [string, unknown]> = [
    [LIFT, [2, { sanctioned: SANCTIONED_LIFTS }]],
    [TIP, [2, { links: TIPPING_LINKS, instruments: CHART_INSTRUMENTS, awaiting: TIPS_AWAITING_A_RULING }]],
    [BULLET, [2, { outside: INLINE_BLOCKS_OUTSIDE_MARKER_LISTS }]],
  ];
  for (const [rule, entry] of expected) {
    for (const file of [WITNESSES["public/**/*.css"]!, "public/zz-new-room/index.css"])
      assert.deepEqual(await resolvedRule(file, rule), entry, `${rule} does not resolve with its lists on ${file}`);
    for (const root of lintTsRoots())
      assert.equal(
        await resolvedRule(WITNESSES[`${root}/**/*.ts`]!, rule),
        undefined,
        `${rule} reaches a ${root} script`,
      );
  }
});
