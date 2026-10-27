# Issue #785, row 12 (`785-lint`): a sleep in the browser checks stands inside a poll or names itself as a pace or a window, and the issue closes

- **Planned at**: `origin/main` acbe71b9eaeeb52951de164f93372877b7275bac (`git ls-remote origin refs/heads/main`, 2026-10-26, the merge of PR #1082, lane A). Issue #785 read with 62 comments (`gh api "repos/ahl-gram/Vellum/issues/785/comments?per_page=100" --jq length`), the newest 6410825133 (row 10's lane A red: Z21 and Z21b pulled out under Issue #1085, PR #1083 at a836cf63).
- **How this plan is run**: Alex's ruling https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113: a thin plan, no plan skeptic, the implementer runs as usual with one guard-prover round and one cold-skeptic round, and a problem found in the plan is not handed back: the implementer makes the least change that keeps every ruling and records it, with its rule, in the pull request body and a dated issue comment. The orchestrator merges on green CI once the review's findings are disposed.
- **Rulings it builds to**: D1 A (comment 6399616640: the automatic check lands last, after the fixes); the re-timing duty removed (6407764430: `MEASURED_SECONDS` is not edited and no CI run is started by hand); the clause 5 exception closed at two waits (6404969181, 6405486755: no third `STILL_ONLY` reason); rows 3 and 5 left this issue (6407800857: Issues #1075 and #1076); 6407993113 above.
- **Archive path**: `handbook/plans/785/785-lint-plan.md`. **Branch**: `chore/785-lint`. **Title**: `#785 A sleep in the browser checks stands inside a poll or names itself as a pace or a window (row 12)`.
- **Recon**: `vellum-spec-recon` was not dispatched; the planner recounted every site itself (below), as the brief asks, a departure from workflow step 2 named here (the precedent of rows 7, 8 and 11). **Plan skeptic**: not run (6407993113). **Browser**: the planner ran none (the brief).
- **Open decisions**: none.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: the opening paragraph; clause 3, whose last paragraph this pull request adds; clause 4 (a throwing wait stands in a step, which is why the explicit form never throws); clause 5's sentence on `STILL_ONLY` (no third reason).
- `handbook/specs/check-placement.md`, "The lint": a rule about what the code says is a lint rule; a new house rule lives in `scripts/lint/`, is wired in the block that already reaches the same files with the same plugins, and is proven by its own test over a fixture it must refuse and one it must pass.
- `handbook/specs/rulebook.md`, "The accepted lint and type-check skips": the e2e tree carries no inline skip, so the explicit form is an argument at the call, never an `eslint-disable` comment.
- `handbook/specs/conventions.md`: "How code is cited", the comment rules (the trailing comments at the sites fold into the reason; no comment is added), and "A backticked file path in prose is scanned".
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before the test (a scanner names its blind spots and the direction each errs), Gate 5 at the push. Gate 2 is not edited.

## What the tree says (the planner's census, 2026-10-26)

**The sort, at acbe71b9.** The 785 plan's own script (`out/785-dry-run/sleep-sort.ts`), copied to this planner's tree as `out/785-lint-dry-run/sleep-sort.ts` with one change, `SORT_LENIENT=1` printing unsorted rows instead of exiting, run with an empty hand table so the poll test alone decides: `SORT_LENIENT=1 node out/785-lint-dry-run/sleep-sort.ts <tree> acbe71b9` (log `out/785-lint-dry-run/sleep-sort-raw.err`, table `sleep-sort-raw.tsv`). **292 `sleep` calls in 102 files; 227 stand inside a counted poll (lane A 83, B 33, C 46, D 55, support 10); 65 do not**: lane A 21, B 6, C 15, D 22, support 1. Every one of the 65 is a pace or a window; no blind wait is left. These files go to the main checkout's `out/785-lint-dry-run/` when this tree is retired.

**The 65 reconciled with the 785 plan's 61** (its 14 PACE and 47 justified SAMPLE): plus BR6's `broadside.ts:262` (lane B's reclassification), CD48's `chart-drawer/floor.ts:126` (lane D call 10), P30's `cards/hold-tablet.ts:35` (lane A call 5) and the 900 ms window in `breathes` in `home/drift.ts:30` (lane C kept one of the two windows the 785 plan meant to convert); minus `cards/hold.ts:87` (the `travel` drag's 4 ms step, PACE by hand, which the poll test accepts: its `for (;;)` leaves on `f`, a name its body writes). That is 64 sites in 38 suite and kit files, plus `e2e/support/launch.ts:158`, the pause between two browser launch attempts, which the 785 plan's hand table classed POLL because its loop is the caller's (`launchWithRetry`); the rule reads one function at a time, so it names it.

**Timers under `e2e/`** (`node out/785-lint-dry-run/timers.ts <tree> acbe71b9`, log `timers.tsv`): 8 `setTimeout` calls on the Node side, none in a suite: the two `sleep` primitives (`e2e/harness.ts:16`, `e2e/support/launch.ts:46`), a socket's idle timeout (`e2e/harness.ts:36`) and five deadlines raced against work (`e2e/harness.ts:126`, `e2e/support/fingerprint-probe.ts:119` and `:142`, `e2e/support/launch.ts:103`, `e2e/support/runner.ts:101`); no `setInterval`; 17 more inside `evaluate` payloads, which no lint parses. None is a pause before a read, so the rule reads `sleep` calls only and names the rest as blind spots.

**STALE against the 785 plan's row 12**: "the 61 PACE and justified SAMPLE calls (in 37 files)" is now 65 sites in 39 files; most of its cited lines moved (the table below gives each as it stands at acbe71b9); "wired in `eslint.config.ts` under a block named for this issue" is superseded by Alex's later ruling on Issue #812 (call 3).

**The plan is measured, not predicted.** The rule below was run over `e2e/` at acbe71b9 on its own (`out/785-lint-dry-run/probe.config.ts`, `node out/785-lint-dry-run/compare.ts`, log `compare.log`): 217 files read, **65 findings, exactly the sort's 65, none missed and none extra**. The finished build was staged in a scratch copy of acbe71b9 (`node out/785-lint-dry-run/stage.ts planned`, whose head says how to make the copy; the copy was deleted after planning so `node --test` cannot collect it from `out/`), and there: `tsc` over all three configs clean; the whole-tree lint 0 messages over 1044 files (`planned-lint.json`), so no function or file passes its bound; Prettier clean over `e2e/` and the new files (no reason string wraps a line); the two new tests pass; the 444 tests under `test/e2e/` pass, as on an unmodified copy (`planned-e2e-unit.log`, `base-e2e-unit.log`); every test file under `test/repo/` reads 400 of 418 where the unmodified copy reads 398 of 416, the two new tests the whole difference and the same 18 failing on both, because the copy is no git checkout (`planned-allrepo.log`, `base-allrepo.log`, `planned-allrepo.fails`, `base-allrepo.fails`, identical). What those 18 hold (the prose paths, the format pin, the roster rows of the footgun hook, the tsconfig roots among them) is UNVERIFIABLE in the copy and is read by the implementer's `npm test`.

## The design

**The rule, `vellum/e2e-sleep-inside-poll`** (`scripts/lint/e2e-sleep.ts`), on every file under `e2e/`. It reads every call whose callee is `sleep`, by name, as a member (`ctx.sleep`, `k.sleep`) or as a computed member with the literal `"sleep"`, and passes it when either holds:

1. **It names itself**: its second and last argument is a string literal, or a template literal with no expression, that reads `pace: ` or `window: ` and then a reason (`/^(pace|window): \S/`).
2. **It stands inside a counted poll**, the 785 plan's poll test: its nearest loop, before any function boundary, is a `for` statement that leaves on what it reads (its condition reads a name its body declares, assigns or pushes to, the counter excepted; or a `return`, `throw` or unlabelled `break` in it, outside any inner loop or switch, sits under an `if` whose test reads such a name or awaits, or inside a `catch`), and no `if` between the loop and the call has the call in a branch that leaves.

Any other `sleep` call is reported with one message naming both ways out (wait with `makeSettle` or `makeStable`; or name it).

**The explicit form is a second argument to the context's own `sleep`**: `sleep(ms, "pace: <why>")` for a gap the harness keeps between the input events of one gesture or between two of its own attempts, and `sleep(ms, "window: <why>")` for a window a check reads an absence over or a timed sample. `SuiteContext`'s `sleep` takes it as `why?: Pause`, `Pause` being `` `pace: ${string}` | `window: ${string}` ``, so the type checker refuses a third kind wherever the context's type flows and the lint asks for the literal at the call, which is what makes it greppable (`git grep -n -F '"pace: ' -- e2e`). The harness's `sleep` ignores the argument, so nothing a browser run does changes. This form keeps every constraint the alternatives below break: it calls the context's own `sleep`, so the unit fakes that record its milliseconds keep recording; it never throws, so `vellum/e2e-throw-inside-step` sees no new throw outside a step; it adds no import to the 38 files and no helper the rule must exempt; and it is syntax, which a lint rule matches, not a comment.

**The sites** (S1 to S65, the table under Files). Each keeps its milliseconds; each trailing comment that stated the reason folds into the reason and goes. Two windows the 785 plan's sort said to size from a product constant are written from it, at today's length: H8b's 1400 ms becomes `LANDFALL_HOLD_MS + 900` (`LANDFALL_HOLD_MS` in `src/site/home/ceremony.ts` is 500, the delay a phantom lift would fire after) and H16's 9800 ms becomes `IDLE_DELAY_MS + 800` (`IDLE_DELAY_MS` in `src/site/home/drift.ts` is 9000).

**Wiring**: the rule joins the block "the house's rules on every e2e script" in `eslint.config.ts`, which already reaches `e2e/**/*.ts` with the `vellum` plugin (call 3).

**The doctrine**: clause 3 of `handbook/specs/settle-doctrine.md` gains one paragraph stating the rule and pointing at the test for its blind spots.

**Rejected**, so none is rediscovered mid-build as a choice:

- A trailing comment as the marker (`await sleep(120); // pace: ...`): the lint would be satisfied by a comment, which `handbook/specs/check-placement.md` says a syntax rule is not, and the comment doctrine keeps a comment for what no test can pin.
- Helper functions (`pace(sleep, ms, why)`) in `e2e/support/`: an import in each of the 38 files, a helper whose own `sleep` the rule must exempt by path, and nothing the argument does not already give.
- An `eslint-disable-next-line` with a description: an inline skip, which the rulebook's list admits nowhere in the e2e tree.
- A third `STILL_ONLY` reason, or any use of `makeStable`: ruled closed at two (6404969181, 6405486755), and a pause is not a rest.
- Refusing `setTimeout` too: the census finds none in a suite, and every one under `e2e/` is a primitive or a deadline; the test declares the promise-around-`setTimeout` blind spot instead (least change).
- Scoping the rule to `e2e/suites/` as `vellum/e2e-throw-inside-step` is: the kits under `e2e/support/` are where shared helpers live, and one held a blind sleep until lane C (`dragAcross`); the issue says "in `e2e/`".
- Moving launch's retry pause into `launchWithRetry`'s loop so the poll test accepts it: it changes the harness's behaviour and log order for no gain.
- The sort's exit-branch test word for word (the `if`'s then-branch, wherever the call sits): it refuses a pause in the `else` of an `if` whose then-branch leaves, a false red; the rule asks of the branch that holds the call. No site in the tree reads differently (65 both ways); plant line 23 holds the difference and mutation M9 proves it.
- Writing `cards/hold.ts:87` in the form: the poll test accepts it, and the test names its shape as a blind spot (call 6).

## Files

Every path is relative to the repo root. Run `npm run format` after typing; the staged copy needed nothing from it but the rule's one wrapped condition, already wrapped below.

### `scripts/lint/e2e-sleep.ts` (new, 144 lines)

The finished file, exactly:

```ts
import type { Rule, SourceCode } from "eslint";
import type { CallExpression, ForStatement, Node } from "estree";

const NAMED = /^(pace|window): \S/;

type Keys = SourceCode.VisitorKeys;

const isFn = (n: Node): boolean =>
  n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";

const isLoop = (n: Node): boolean =>
  n.type === "ForStatement" ||
  n.type === "ForOfStatement" ||
  n.type === "ForInStatement" ||
  n.type === "WhileStatement" ||
  n.type === "DoWhileStatement";

function children(n: Node, keys: Keys): Node[] {
  const out: Node[] = [];
  for (const key of keys[n.type] ?? []) {
    const value = (n as unknown as Record<string, unknown>)[key];
    for (const c of Array.isArray(value) ? (value as unknown[]) : [value])
      if (typeof (c as Node | null)?.type === "string") out.push(c as Node);
  }
  return out;
}

const rootName = (e: Node): string | null =>
  e.type === "Identifier" ? e.name : e.type === "MemberExpression" ? rootName(e.object) : null;

function writes(body: Node, counter: string | null, keys: Keys): Set<string> {
  const names = new Set<string>();
  const add = (e: Node): void => {
    const name = rootName(e);
    if (name !== null) names.add(name);
  };
  const walk = (n: Node): void => {
    if (isFn(n)) return;
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier") names.add(n.id.name);
    if (n.type === "AssignmentExpression") add(n.left);
    if (
      n.type === "CallExpression" &&
      n.callee.type === "MemberExpression" &&
      n.callee.property.type === "Identifier" &&
      n.callee.property.name === "push"
    )
      add(n.callee.object);
    for (const c of children(n, keys)) walk(c);
  };
  walk(body);
  if (counter !== null) names.delete(counter);
  return names;
}

const reads = (e: Node, names: ReadonlySet<string>, keys: Keys): boolean =>
  e.type === "AwaitExpression" ||
  (e.type === "Identifier" && names.has(e.name)) ||
  children(e, keys).some((c) => reads(c, names, keys));

function leavesOnARead(loop: ForStatement, names: ReadonlySet<string>, keys: Keys): boolean {
  let found = false;
  const walk = (n: Node, nested: boolean, guarded: boolean): void => {
    if (found || isFn(n)) return;
    const leaving =
      n.type === "ReturnStatement" ||
      n.type === "ThrowStatement" ||
      (n.type === "BreakStatement" && !nested && !n.label);
    if (leaving && guarded) {
      found = true;
      return;
    }
    const inner = nested || isLoop(n) || n.type === "SwitchStatement";
    const guards = guarded || n.type === "CatchClause" || (n.type === "IfStatement" && reads(n.test, names, keys));
    for (const c of children(n, keys)) walk(c, inner, guards);
  };
  for (const c of children(loop, keys)) walk(c, false, false);
  return found;
}

function isPoll(loop: ForStatement, keys: Keys): boolean {
  const first = loop.init?.type === "VariableDeclaration" ? loop.init.declarations[0]?.id : undefined;
  const names = writes(loop.body, first?.type === "Identifier" ? first.name : null, keys);
  return (loop.test != null && reads(loop.test, names, keys)) || leavesOnARead(loop, names, keys);
}

const leaves = (n: Node, keys: Keys): boolean =>
  !isFn(n) &&
  !isLoop(n) &&
  (n.type === "ReturnStatement" ||
    n.type === "ThrowStatement" ||
    n.type === "BreakStatement" ||
    children(n, keys).some((c) => leaves(c, keys)));

function insidePoll(ancestors: readonly Node[], call: Node, keys: Keys): boolean {
  let at = -1;
  for (let i = ancestors.length - 1; i >= 0 && at < 0; i--) {
    if (isFn(ancestors[i]!)) return false;
    if (isLoop(ancestors[i]!)) at = i;
  }
  const loop = ancestors[at];
  if (loop?.type !== "ForStatement" || !isPoll(loop, keys)) return false;
  const path = [...ancestors.slice(at + 1), call];
  return !path.some((p, i) => p.type === "IfStatement" && leaves(path[i + 1]!, keys));
}

const isSleep = ({ callee }: CallExpression): boolean => {
  if (callee.type === "Identifier") return callee.name === "sleep";
  if (callee.type !== "MemberExpression") return false;
  const p = callee.property;
  return callee.computed ? p.type === "Literal" && p.value === "sleep" : p.type === "Identifier" && p.name === "sleep";
};

const named = ({ arguments: args }: CallExpression): boolean => {
  const why = args[1];
  const text =
    why?.type === "Literal"
      ? why.value
      : why?.type === "TemplateLiteral" && why.expressions.length === 0
        ? why.quasis[0]?.value.cooked
        : undefined;
  return args.length === 2 && typeof text === "string" && NAMED.test(text);
};

const e2eSleepInsidePoll: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        'an e2e sleep outside a poll measures the runner, not the page: wait for the state with makeSettle or makeStable (handbook/specs/settle-doctrine.md, clause 3), or, where the pause is a gesture\'s own timing or the window a check reads over, name it at the call as sleep(ms, "pace: why") or sleep(ms, "window: why") (Issue #785)',
    },
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    return {
      CallExpression(node) {
        if (!isSleep(node) || named(node)) return;
        if (insidePoll(context.sourceCode.getAncestors(node), node, keys)) return;
        context.report({ node, messageId: "found" });
      },
    };
  },
};

export default { rules: { "e2e-sleep-inside-poll": e2eSleepInsidePoll } };
```

**The stub for commit 1** (the right shape, reporting nothing), the whole file:

```ts
import type { Rule } from "eslint";

const e2eSleepInsidePoll: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        'an e2e sleep outside a poll measures the runner, not the page: wait for the state with makeSettle or makeStable (handbook/specs/settle-doctrine.md, clause 3), or, where the pause is a gesture\'s own timing or the window a check reads over, name it at the call as sleep(ms, "pace: why") or sleep(ms, "window: why") (Issue #785)',
    },
  },
  create: () => ({}),
};

export default { rules: { "e2e-sleep-inside-poll": e2eSleepInsidePoll } };
```

### `test/repo/e2e-sleep.test.ts` (new, 121 lines)

The finished file, exactly (the form of `test/repo/e2e-scripts-off.test.ts`; it lints text through ESLint and reads no source file, so `SOURCE_READS` is untouched):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/e2e-sleep-inside-poll";

const REFUSE = true;
const PASS = false;
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../types.ts";', PASS],
  ["declare const ctx: SuiteContext;", PASS],
  ["const { sleep, evaluate } = ctx;", PASS],
  ["await sleep(500);", REFUSE],
  ["await ctx.sleep(500);", REFUSE],
  ['await ctx["sleep"](500);', REFUSE],
  ['export const a = async (): Promise<void> => { await evaluate("1"); await sleep(400); };', REFUSE],
  ['await sleep(120, "pace: the hover lands before the wheel");', PASS],
  ['await ctx.sleep(300, "window: a wheel must move nothing in it");', PASS],
  ["await sleep(60, `pace: a template literal with no expression`);", PASS],
  ['await sleep(120, "pause: not one of the two kinds");', REFUSE],
  ['await sleep(120, "pace:");', REFUSE],
  ['const why = "pace: held in a binding"; await sleep(120, why);', REFUSE],
  ['await sleep(120, `pace: built ${"here"}`);', REFUSE],
  [
    'export async function b(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function c(): Promise<void> { let done = false; for (let i = 0; i < 40 && !done; i++) { done = await evaluate<boolean>("x"); await sleep(50); } }',
    PASS,
  ],
  [
    'export async function d(): Promise<void> { for (let i = 0; i < 40; i++) { const r = await evaluate<number>("x"); if (r > 1) break; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function e(): Promise<void> { for (let i = 0; i < 40; i++) { try { await evaluate("x"); } catch { break; } await sleep(50); } }',
    PASS,
  ],
  [
    'export async function e2(): Promise<void> { const seen: number[] = []; for (let i = 0; i < 40; i++) { seen.push(await evaluate<number>("x")); if (seen.length > 3) return; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function f(): Promise<void> { for (let i = 0; i < 6; i++) { await evaluate("x"); await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function g(): Promise<void> { const out: unknown[] = []; for (let i = 0; i < 6; i++) { out.push(await evaluate("x")); if (i > 3) break; await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function h(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) { await sleep(800); return; } } }',
    REFUSE,
  ],
  [
    'export async function i2(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; else await sleep(50); } }',
    PASS,
  ],
  [
    "export async function j(): Promise<void> { for (const p of [1, 2]) { if (await evaluate<boolean>(String(p))) break; await sleep(50); } }",
    REFUSE,
  ],
  [
    'export async function k(): Promise<void> { let done = false; while (!done) { done = await evaluate<boolean>("x"); await sleep(50); } }',
    REFUSE,
  ],
  ["export async function m(): Promise<void> { for (let i = 0; i < 9; ) { i += 3; await sleep(50); } }", REFUSE],
  [
    'export async function o(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; [1].forEach(() => void sleep(50)); } }',
    REFUSE,
  ],
  ["const nap = sleep; await nap(500);", PASS],
  ["await new Promise((r) => setTimeout(r, 500));", PASS],
  ["await evaluate(`new Promise((r) => setTimeout(r, 500))`);", PASS],
  [
    'export async function n(): Promise<void> { for (let i = 0; i < 40; i++) { const at = await evaluate<number>("x"); await ctx.wheel(0, 0, 120); if ((await evaluate<number>("x")) === at) break; await sleep(90); } }',
    PASS,
  ],
];
const REFUSED = PLANT.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOT =
  "BLIND SPOTS, declared, each with its direction: a sleep reached under another name, an alias of sleep or a promise around setTimeout, is no call to sleep (a miss); a timer inside an evaluate payload is a string (a miss); a counted loop that leaves on what it reads passes whatever its pause is for, a gesture repeated until the read stops moving or a pacing loop such as travel in e2e/suites/cards/hold.ts among them (a miss); a while, do or for...of loop is never a poll here, however it leaves (a false red, since a poll here is counted); a sleep in a function written inside a poll's loop is read as outside the poll (a false red)";

const reported = async (path: string): Promise<number[]> => {
  const [result] = await eslint.lintText(PLANT.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line);
};

test("an e2e sleep stands inside a counted poll that leaves on what it reads, or names itself at the call as a pace or a window with its reason (Issue #785)", async () => {
  assert.ok(REFUSED.length > 0 && REFUSED.length < PLANT.length, "the plant cannot tell the rule from its negation");
  assert.deepEqual(await reported("e2e/suites/health.ts"), REFUSED, BLIND_SPOT);
  assert.deepEqual(await reported("e2e/support/settle.ts"), REFUSED, "a support module is held as a suite is");
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error on every e2e file at any depth and on no other root or sheet", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.includes("e2e") && roots.length > 1, "the lint's roots are not what this sweep expects");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined && existsSync(join(ROOT, witness)), `${root} has no existing witness`);
    const want = root === "e2e" ? [2] : undefined;
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file), want, `${RULE} resolves wrongly on ${file}`);
  }
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});
```

The plant's refused lines are 4, 5, 6, 7, 11, 12, 13, 14, 20, 21, 22, 24, 25, 26 and 27, of 31.

### `eslint.config.ts` (272 to 274 lines)

```diff
 import e2eSteps from "./scripts/lint/e2e-steps.ts";
+import e2eSleep from "./scripts/lint/e2e-sleep.ts";
 import importBounds from "./scripts/lint/import-bounds.ts";
```

In the `const vellum = ...` line, `...e2eSteps.rules, ` becomes `...e2eSteps.rules, ...e2eSleep.rules, ` (one occurrence; the rest of that long line is untouched).

In the block named `"the house's rules on every e2e script"`:

```diff
       "vellum/e2e-scripts-off-through-helper": "error",
+      "vellum/e2e-sleep-inside-poll": "error",
       "vellum/e2e-throw-inside-step": "error",
```

### `e2e/types.ts` (73 to 74 lines)

```diff
 export type Clip = { x: number; y: number; width: number; height: number; scale: number };
+export type Pause = `pace: ${string}` | `window: ${string}`;
```

```diff
-  sleep: (ms: number) => Promise<void>;
+  sleep: (ms: number, why?: Pause) => Promise<void>;
```

`e2e/harness.ts` is not edited: its `sleep` takes one parameter and is assignable to the new member, and every unit fake typed `(ms: number) => Promise<void>` stays assignable (the staged `tsc` read clean).

### `e2e/support/launch.ts` (172 to 174 lines)

S65 first (table below), then these two:

```diff
+import type { Pause } from "../types.ts";
+
 type BrowserExit = { readonly code: number | null; readonly signal: NodeJS.Signals | null };
```

```diff
-const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
+const sleep: (ms: number, why?: Pause) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms));
```

The annotation sits on the constant, not on a parameter, so no unused parameter is written.

### `e2e/suites/home/ceremony.ts` (352 to 353 lines)

S13 first, then:

```diff
+import { LANDFALL_HOLD_MS } from "../../../src/site/home/ceremony.ts";
 import { veilMarkup } from "../../../src/site/home/veil.ts";
```

`e2e/suites/home/drift.ts` already imports `IDLE_DELAY_MS`.

### The 65 sites

Each row replaces one line's text after its indentation, which stays as it is; the line number is the line at acbe71b9, so a file's sites are edited before its import edit above. Where a file holds the same old text twice (`cards/cap.ts`, `home/drift.ts`, `landfall/clamps.ts`, `room-instrument/pace.ts`, `zoom/resets.ts`, `cards/hold-tablet.ts`), find each by its line number. The two `(...)` checks name a kit function rather than a check.

| # | site at acbe71b9 | check | kind | the line today | the line after |
|---|---|---|---|---|---|
| S1 | `e2e/suites/broadside.ts:262` | BR6 | window | `await sleep(500);` | `await sleep(500, "window: a wrongful anchor navigation would commit in it");` |
| S2 | `e2e/suites/cards/cap.ts:187` | P26 | pace | `await sleep(120);` | `await sleep(120, "pace: the hover lands before the wheel");` |
| S3 | `e2e/suites/cards/cap.ts:212` | P23 | pace | `await sleep(120);` | `await sleep(120, "pace: the hover lands before the wheel");` |
| S4 | `e2e/suites/cards/cap.ts:306` | P24 | pace | `await sleep(120);` | `await sleep(120, "pace: the hover lands before the wheel");` |
| S5 | `e2e/suites/cards/hold-tablet.ts:30` | P30 | pace | `await k.sleep(650);` | `await k.sleep(650, "pace: outwait the double-tap window before the next tap");` |
| S6 | `e2e/suites/cards/hold-tablet.ts:35` | P30 | pace | `await k.sleep(650);` | `await k.sleep(650, "pace: outwait the double-tap window before the next town's tap");` |
| S7 | `e2e/suites/cards/overlay.ts:296` | P15 | pace | `await sleep(40);` | `await sleep(40, "pace: the move away lands before the move onto the town");` |
| S8 | `e2e/suites/chart-drawer/desk.ts:200` | CD2c | window | `await sleep(900);` | `await sleep(900, "window: a double click must not zoom in it");` |
| S9 | `e2e/suites/chart-drawer/floor.ts:126` | CD48 | window | `await sleep(500);` | `await sleep(500, "window: the handle's touch must move no camera and lay no ghost in it");` |
| S10 | `e2e/suites/chart-drawer/gestures.ts:197` | CD58 | window | `await sleep(50);` | `await sleep(50, "window: six reads 50 ms apart across the turn");` |
| S11 | `e2e/suites/chart-drawer/prospect.ts:222` | CD35 | window | `await sleep(50);` | `await sleep(50, "window: a dwell of eight reads in which nothing may be laid");` |
| S12 | `e2e/suites/glass-ceremony.ts:262` | (shot) | window | `await sleep(600); // into the village wait: the newly revealed name is mid-dry` | `await sleep(600, "window: the dry-in shot lands with the newly revealed name mid-dry");` |
| S13 | `e2e/suites/home/ceremony.ts:135` | H8b | window | `await sleep(1400);` | `await sleep(LANDFALL_HOLD_MS + 900, "window: past the hold, where a phantom lift would fly the camera");` |
| S14 | `e2e/suites/home/drift.ts:30` | H15a, H15c | window | `await sleep(900);` | `await sleep(900, "window: the two samples the drift must move between");` |
| S15 | `e2e/suites/home/drift.ts:62` | H15b | window | `await sleep(900);` | `await sleep(900, "window: the transform must hold still across it");` |
| S16 | `e2e/suites/home/drift.ts:64` | H15b | window | `await sleep(900);` | `await sleep(900, "window: the transform must hold still across it");` |
| S17 | `e2e/suites/home/drift.ts:92` | H15d | window | `await sleep(900);` | `await sleep(900, "window: the transform must hold still across it");` |
| S18 | `e2e/suites/home/drift.ts:105` | H16 | window | `await sleep(9800);` | `await sleep(IDLE_DELAY_MS + 800, "window: past the idle delay, where a drift would begin");` |
| S19 | `e2e/suites/home/drift.ts:107` | H16 | window | `await sleep(900);` | `await sleep(900, "window: the transform must hold still across it");` |
| S20 | `e2e/suites/home/frame.ts:183` | H5a | window | `await sleep(600);` | `await sleep(600, "window: a refused form must not navigate in it");` |
| S21 | `e2e/suites/hunt/zoomed.ts:86` | HG3 | window | `await sleep(100);` | `await sleep(100, "window: a drag must not solve in it");` |
| S22 | `e2e/suites/landfall/clamps.ts:88` | L9d2 | pace | `await sleep(120);` | `await sleep(120, "pace: a step of the pinch");` |
| S23 | `e2e/suites/landfall/clamps.ts:93` | L9d2 | pace | `await sleep(120);` | `await sleep(120, "pace: a step of the pinch");` |
| S24 | `e2e/suites/landfall/controls.ts:65` | L9f | window | `await sleep(300);` | `await sleep(300, "window: a gesture on the pip must not move the camera in it");` |
| S25 | `e2e/suites/landfall/dress.ts:236` | L20 | pace | `await sleep(300);` | `await sleep(300, "pace: the press is held for its duration");` |
| S26 | `e2e/suites/landfall/dress.ts:247` | L20 | pace | `await sleep(300);` | `await sleep(300, "pace: the release lands before the key");` |
| S27 | `e2e/suites/landfall/kit.ts:21` | (freshGesture) | pace | `await sleep(450);` | `await sleep(450, "pace: outwait GESTURE_BREAK_MS so the next wheel opens a fresh gesture");` |
| S28 | `e2e/suites/landfall/kit.ts:223` | L4, L8 | window | `await sleep(200);` | `await sleep(200, "window: a wheel over the card must be swallowed in it");` |
| S29 | `e2e/suites/landfall/panel.ts:120` | L3 | window | `await sleep(200);` | `await sleep(200, "window: a wheel over the head must be swallowed in it");` |
| S30 | `e2e/suites/landfall/panel.ts:215` | L28 | window | `await sleep(600);` | `await sleep(600, "window: the slip must stay open in it after a press inside the stage");` |
| S31 | `e2e/suites/landfall/panel.ts:237` | L28 | window | `await sleep(250);` | `await sleep(250, "window: a wheel over the slip's head must be swallowed in it");` |
| S32 | `e2e/suites/landfall/touch.ts:51` | L9a | window | `await sleep(300);` | `await sleep(300, "window: one finger must not move the camera in it");` |
| S33 | `e2e/suites/landfall/touch.ts:126` | L9i | pace | `await sleep(gap);` | `await sleep(gap, "pace: the gap between the two taps of a double tap");` |
| S34 | `e2e/suites/landfall/touch.ts:149` | L9i | window | `await sleep(PAST_DIVE_MS);` | `await sleep(PAST_DIVE_MS, "window: a double tap must not dive in it");` |
| S35 | `e2e/suites/landfall/wheel.ts:46` | L1b | window | `await sleep(150);` | `await sleep(150, "window: a wheel at the clamp must not zoom in it");` |
| S36 | `e2e/suites/print-room/redraw.ts:52` | PR24b | window | `await sleep(250); // let any (wrongly) surviving stale bind inject before asserting emptiness` | `await sleep(250, "window: a stale bind must not inject in it");` |
| S37 | `e2e/suites/prospect.ts:325` | PB7d | window | `await sleep(300);` | `await sleep(300, "window: a refused year must not re-engrave in it");` |
| S38 | `e2e/suites/prospect/gestures.ts:99` | PB15 | window | `await sleep(REFUSAL_DWELL_MS);` | `await sleep(REFUSAL_DWELL_MS, "window: the refusal's dwell, before the press is read again");` |
| S39 | `e2e/suites/reading-room/colophon.ts:148` | RR20 | window | `await sleep(2000);` | `await sleep(2000, "window: a superseded draw must not land in it");` |
| S40 | `e2e/suites/room-instrument/pace.ts:24` | RS29 | pace | `await sleep(150);` | `await sleep(150, "pace: the gap between two presses");` |
| S41 | `e2e/suites/room-instrument/pace.ts:60` | RS30 | window | `await sleep(PACE_LEG_MS);` | `await sleep(PACE_LEG_MS, "window: a leg of the rate sample");` |
| S42 | `e2e/suites/room-instrument/pace.ts:62` | RS30 | window | `await sleep(PACE_LEG_MS);` | `await sleep(PACE_LEG_MS, "window: a leg of the rate sample");` |
| S43 | `e2e/suites/room-instrument/sweep.ts:58` | RS10 | window | `await sleep(150);` | `await sleep(150, "window: the sweep must not advance in it");` |
| S44 | `e2e/suites/room-instrument/sweep.ts:80` | RS11 | window | `await sleep(70);` | `await sleep(70, "window: reads 70 ms apart across the sweep");` |
| S45 | `e2e/suites/room-instrument/sweep.ts:100` | RS12 | window | `await sleep(260);` | `await sleep(260, "window: a paused sweep must not advance in it");` |
| S46 | `e2e/suites/room-instrument/sweep.ts:103` | RS12 | window | `await sleep(120);` | `await sleep(120, "window: the resumed sweep's first steps, which must not fall below the frozen year");` |
| S47 | `e2e/suites/slide-away/fold.ts:71` | SW7 | window | `await ctx.sleep(30);` | `await ctx.sleep(30, "window: reads 30 ms apart across the glide and its ease");` |
| S48 | `e2e/suites/slide-away/kit.ts:136` | (gather) | window | `await ctx.sleep(100);` | `await ctx.sleep(100, "window: reads 100 ms apart across the span asked for");` |
| S49 | `e2e/suites/stage/slide-holds.ts:290` | ES6 | window | `await ctx.sleep(300);` | `await ctx.sleep(300, "window: a wheel over the Broadside must move no piece in it");` |
| S50 | `e2e/suites/stage/slide-kit.ts:125` | (readsFor) | window | `await ctx.sleep(100);` | `await ctx.sleep(100, "window: reads 100 ms apart across the span asked for");` |
| S51 | `e2e/suites/survey/arm.ts:89` | SV2b | window | `await sleep(400);` | `await sleep(400, "window: the overlay must stay at rest in it");` |
| S52 | `e2e/suites/survey/arm.ts:145` | SV2d | window | `await sleep(300); // let any superseded arm that was going to fire, fire` | `await sleep(300, "window: a superseded arm must not fire in it");` |
| S53 | `e2e/suites/turn.ts:80` | T2 | window | `await sleep(120); // a (wrong) turn would have set .turning by now` | `await sleep(120, "window: a wrong turn would set .turning in it");` |
| S54 | `e2e/suites/turn.ts:113` | T3 | window | `await sleep(250); // settle-window: a leaked turn/anim would surface here` | `await sleep(250, "window: a leaked turn would surface in it");` |
| S55 | `e2e/suites/turn.ts:147` | T5 | window | `await sleep(200);` | `await sleep(200, "window: a leaked turn would surface in it");` |
| S56 | `e2e/suites/verso.ts:146` | V3 | window | `await sleep(80); // __turned is sticky: a (wrong) turn would already have flagged it` | `await sleep(80, "window: a wrong turn would flag __turned in it");` |
| S57 | `e2e/suites/zoom-gestures/touch.ts:35` | (doubleTap) | pace | `await k.sleep(60);` | `await k.sleep(60, "pace: the gap between the two taps of a double tap");` |
| S58 | `e2e/suites/zoom/bands.ts:131` | Z20g | window | `await sleep(600); // past the debounce + any would-be dispatch` | `await sleep(600, "window: past the debounce and any would-be dispatch, no redraft may start in it");` |
| S59 | `e2e/suites/zoom/controls.ts:66` | Z10b | window | `await sleep(350); // let any leaked d3 dblclick-zoom animation finish` | `await sleep(350, "window: a leaked dblclick zoom would move the camera in it");` |
| S60 | `e2e/suites/zoom/region.ts:150` | Z18 | window | `await sleep(500); // well past the 250ms settle debounce; assert NO new commit` | `await sleep(500, "window: well past the 250 ms settle debounce, no new commit may land in it");` |
| S61 | `e2e/suites/zoom/region.ts:177` | Z19 | window | `await sleep(500); // any superseded straggler would land here; assert it did not` | `await sleep(500, "window: a superseded straggler would land in it");` |
| S62 | `e2e/suites/zoom/region.ts:193` | Z19b | window | `await sleep(1200); // the worker resolved long since; assert the result went nowhere` | `await sleep(1200, "window: the dropped job's result must not land in it");` |
| S63 | `e2e/suites/zoom/resets.ts:173` | Z13d | window | `await sleep(500);` | `await sleep(500, "window: no hash write may land in it, across the resize");` |
| S64 | `e2e/suites/zoom/resets.ts:175` | Z13d | window | `await sleep(500);` | `await sleep(500, "window: no hash write may land in it");` |
| S65 | `e2e/support/launch.ts:158` | (launch) | pace | `await sleep(tuning.retryPauseMs);` | `await sleep(tuning.retryPauseMs, "pace: the gap between two launch attempts");` |

15 pace and 50 window. No comment line above a site is edited.

### `handbook/specs/settle-doctrine.md`

In clause 3, directly after the line `   stay as they are.` (the end of the sentence "The stillness predicates written by hand before it stay as they are.") and before `4. **A readiness wait THROWS`, insert these lines, indented three spaces like the clause:

```
   A `sleep` anywhere under `e2e/` stands inside a counted `for` loop that leaves on what it reads,
   or names itself at the call with its reason as a string literal: `sleep(ms, "pace: why")` for a
   gap the harness keeps between the input events of one gesture or between two of its own
   attempts, and `sleep(ms, "window: why")` for a window a check reads an absence over or a timed
   sample. `vellum/e2e-sleep-inside-poll` (`scripts/lint/e2e-sleep.ts`) refuses any other, in every
   form but the blind spots its test declares, each with its direction, in
   `test/repo/e2e-sleep.test.ts`.
```

Every backticked path in it resolves once the pull request's files exist (`test/repo/prose-paths.test.ts`).

### `handbook/plans/785/785-lint-plan.md`

This plan, copied unchanged from the scratchpad.

## Tests, in the order they are written

Both in `test/repo/e2e-sleep.test.ts`, written in commit 1 beside the stub rule and the wiring. Staged so in a scratch copy of acbe71b9 (`node out/785-lint-dry-run/stage.ts stub`), `node --import ./test-support/source-read-guard.ts --test test/repo/e2e-sleep.test.ts` reads **1 failing, 1 passing** (`out/785-lint-dry-run/stub-test.log`): T1 red on its `deepStrictEqual`, actual `[]` against the 15 refused lines; T2 green. On the finished build (`stage.ts planned`) both pass.

| # | test name | asserts | red on the stub | mutations that red it once green |
|---|---|---|---|---|
| T1 | "an e2e sleep stands inside a counted poll that leaves on what it reads, or names itself at the call as a pace or a window with its reason (Issue #785)" | the rule reports exactly the plant's refused lines, at a suite path and at a support path | yes, `deepStrictEqual` | M1 to M9, M11 to M21 |
| T2 | "the rule resolves at error on every e2e file at any depth and on no other root or sheet" | `calculateConfigForFile` gives `[2]` on each e2e witness and a nested e2e path, nothing on the other roots and the sheet | no (the wiring lands with the stub) | M21 |

The mutations, each one find-and-replace in the finished `scripts/lint/e2e-sleep.ts` (M21 in `eslint.config.ts`), were run in the staged copy by `node out/785-lint-dry-run/mutate.ts` (log `mutate.log`, control green) and M21 by hand (log `m21.log`): **20 of 20 BITE**, each moving exactly the plant lines named (`+` a passing line now refused, `-` a refused line now passing). There is no M10: no mutation of the loop kind separates a `for...of` or `while` from a counted loop (the poll test reads only a `for` statement's own parts); plant lines 24 and 25 hold that shape. In the table, `\|` stands for `|`, escaped for the table.

| id | the edit | plant lines it moves |
|---|---|---|
| M1 | `if (!isSleep(node) \|\| named(node)) return;` made `if (!isSleep(node)) return;` | +8 +9 +10 |
| M2 | `const NAMED = /^(pace\|window): \S/;` made `const NAMED = /^/;` | -11 -12 |
| M3 | `const NAMED = /^(pace\|window): \S/;` made `const NAMED = /^(pace\|window):/;` | -12 |
| M4 | `why?.type === "TemplateLiteral" && why.expressions.length === 0` made `why?.type === "TemplateLiteral"` | -14 |
| M5 | the template branch of `named` deleted (`: why?.type === "TemplateLiteral" ... ? why.quasis[0]?.value.cooked` gone, leaving `: undefined;`) | +10 |
| M6 | `if (insidePoll(context.sourceCode.getAncestors(node), node, keys)) return;` deleted | +15 +16 +17 +18 +19 +23 +31 |
| M7 | `if (loop?.type !== "ForStatement" \|\| !isPoll(loop, keys)) return false;` made `if (loop?.type !== "ForStatement") return false;` | -20 -21 -26 |
| M8 | `return !path.some((p, i) => p.type === "IfStatement" && leaves(path[i + 1]!, keys));` made `return path.length > 0;` | -22 |
| M9 | the same line made `return !path.some((p) => p.type === "IfStatement" && leaves(p.consequent, keys));` | +23 |
| M11 | `if (counter !== null) names.delete(counter);` deleted | -26 |
| M12 | `if (leaving && guarded) {` made `if (leaving) {` | -21 |
| M13 | `n.type === "CatchClause" \|\| ` deleted from `const guards = ...` | +18 |
| M14 | `e.type === "AwaitExpression" \|\|` deleted from `reads` | +15 +23 |
| M15 | `if (n.type === "AssignmentExpression") add(n.left);` deleted | +16 |
| M16 | `if (n.type === "VariableDeclarator" && n.id.type === "Identifier") names.add(n.id.name);` deleted | +17 |
| M17 | `n.callee.property.name === "push"` made `n.callee.property.name === "push-not"` | +19 |
| M18 | `: p.type === "Identifier" && p.name === "sleep";` made `: false;` | -5 |
| M19 | `callee.computed ? p.type === "Literal" && p.value === "sleep" :` made `callee.computed ? false :` | -6 |
| M20 | `if (isFn(ancestors[i]!)) return false;` deleted | -27 |
| M21 | `"vellum/e2e-sleep-inside-poll": "error",` deleted from `eslint.config.ts` | T1: every refused line; T2 red |

**The prover owes** all 20 (Gate 1 item 9; unit tests only). Step 15 leaves nothing to the implementer to prove unless a finding changes a test.

**No browser check is added or changed**, so no browser reading is owed or taken. The pull request changes no milliseconds: the harness's `sleep` ignores its second argument, and the two windows written from constants keep their lengths (`node --input-type=module -e 'const c = await import("./src/site/home/ceremony.ts"); const d = await import("./src/site/home/drift.ts"); console.log(c.LANDFALL_HOLD_MS + 900, d.IDLE_DELAY_MS + 800);'` prints `1400 9800`).

## Order of commits

Branch `chore/785-lint`. Run `npm run format` before each commit. Push at the first.

1. `handbook/plans/785/785-lint-plan.md` (this plan, unchanged), `test/repo/e2e-sleep.test.ts` (finished), `scripts/lint/e2e-sleep.ts` (the stub), `eslint.config.ts` (the three edits). `node --import ./test-support/source-read-guard.ts --test test/repo/e2e-sleep.test.ts`: 1 failing (T1, on its `deepStrictEqual`), 1 passing. `npm run lint` clean (the stub reports nothing).
2. `e2e/types.ts`, `e2e/support/launch.ts`, `e2e/suites/home/ceremony.ts` and the other 36 site files: S1 to S65 and the two imports. `npm run check` clean; `npm run lint` clean.
3. `scripts/lint/e2e-sleep.ts` (the finished rule). T1 and T2 green; `npm run lint` clean (0 findings: every site is named).
4. `handbook/specs/settle-doctrine.md` (clause 3's paragraph).

## Rosters and doctrine

- The rule joins the `vellum` plugin's spread and the e2e block in `eslint.config.ts`, and nothing else lists rules or lint files: `git grep -n -E "scripts/lint/(e2e-steps|e2e-scripts-off)" -- test test-support` finds only `test/repo/e2e-tiers.test.ts`'s import of `CTX_THROWING_WAITS`, and `test/repo/lint-wiring.test.ts`'s "no rule is set by two of the house's own blocks" holds with one setter.
- The test joins `npm test` by its name and reads no source file; `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched, as it is for `test/repo/e2e-scripts-off.test.ts`.
- `Pause` joins `e2e/types.ts`; no list of its exports exists.
- Clause 3 of `handbook/specs/settle-doctrine.md` gains the paragraph above. No other spec, gate or agent line is contradicted: Gate 2 item 6 ("No blind sleeps", pointing at the doctrine) stays true and is not edited, least change beside a gate whose pasted note `test/repo/footgun-gate.test.ts`'s size probes hold under 8,000 characters; `handbook/specs/check-placement.md` already says what this rule follows; the rulebook's skip list is untouched, since no inline skip is added.
- No errata row: the PR #645 "Ruled and left" row on four fixed sleeps left `handbook/errata/guards.md` in PR #1082.
- `MEASURED_SECONDS` is not edited, and no step changes length, so settle-doctrine's count of what a new or longer step holds is not owed.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `node --import ./test-support/source-read-guard.ts --test test/repo/e2e-sleep.test.ts`: 2 of 2.
- The census after the build: `git grep -c -F '"pace: ' -- e2e` sums to 15 and `git grep -c -F '"window: ' -- e2e` to 50.
- The two windows: the `node --input-type=module -e ...` line under Tests prints `1400 9800`.
- `npm run build`, then, after `ps aux | grep -c '[r]emote-debugging-port'` reads 0, `VELLUM_E2E_SUITES=home npm run test:e2e` once: ALL PASS, the body quoting the PASS lines of H8b, H15a, H15b, H15c, H15d and H16 (the suite whose windows are now written from constants and which gains an import). No other suite is run locally: the change is an ignored argument at every other site, the four lanes run on CI, and the full local lanes are never run.
- The pull request's CI: the three check-and-test shards and lanes A to D green.
- `vellum-guard-prover` on M1 to M9 and M11 to M21. `vellum-plate-reader` is not owed: nothing here is an appearance.

## Closing the issue

This pull request is the last row, so it closes Issue #785.

- **The body carries `Closes #785`** as the template's closing line, and the implementer reads `gh pr view <N> --json closingIssuesReferences --jq '[.closingIssuesReferences[].number]'` before handing over: it must print `[785]`.
- **It merges after row 10.** Row 10 (`785-date`) is PR #1083, open at planning; its lane A red (Z21 and Z21b) was pulled out under Issue #1085 (comment 6410825133). If PR #1083 has not merged when this pull request opens, the body's first line under its summary reads `Merge after PR #1083 (row 10), so the issue closes with every row in.`, and the report says the same.
- **Comment A, the step 12 record**, posted before the pull request opens: the calls below and any the build adds, each with its rule, pointing at the rulings by link (6399616640, 6407764430, 6407993113) rather than restating them.
- **Comment B, the closing ledger**, posted by the implementer right after the pull request opens, naming its number, in this form (the PR numbers are verified at planning; the implementer fills `<N>` and row 10's state):

```
**Closing ledger for Issue #785, 2026-10-26: where every part of the issue landed.** This pull request, PR #<N> (row 12), closes the issue on merge.

- The work, step 1 (the sort): the census in the archived plans under handbook/plans/785/; at acbe71b9, 292 sleep calls in 102 files, 227 inside counted polls and 65 named at the call (15 pace, 50 window), PR #<N>.
- Step 2 (the lint): vellum/e2e-sleep-inside-poll, PR #<N>.
- Step 3 (the conversions): PR #1071 (row 1: Z13b, Z13c, Z20c, CD2b), PR #1072 (row 2: SV2r's readings), PR #1073 (row 4: makeStable and the kits), PR #1082, PR #1080, PR #1079, PR #1081 (rows 6 to 9: lanes A to D).
- Step 4 (the order, and the unit timers): D1 A and D2 A (comment 6399616640); PR #1078 (row 11).
- The date widening (comments 6007004790, 6007851193): PR #1083 (row 10), <merged | open, to merge before PR #<N>>.
- Folded in from Issue #1001 (comment 6352896162): its counts are replaced by the sort; the tolerant makeSettle shipped in PR #1057; the hand-written poll loops stay, as D3 B ruled.
- Folded in from Issue #1051 (comment 6384402685): its order became the sequence; the lint landed last (D1 A) with every remaining pause named, not skipped; its goto overlap is Issue #1016's.
- Handed over from Issue #1048 (comment 6395034225): Issue #1076 (row 5).
- Left this issue: row 3 and the P4 hole (comment 6404656320) are Issue #1075; row 5 is Issue #1076.
- The held() depth finding (comment 6401735323): PR #1082.
- The PR #645 errata row on four fixed sleeps: removed in PR #1082.
- Open elsewhere: Issue #1068 (the slow steps, H16's window among them), Issue #1065 (the lane balance), Issue #1016 (shared goto and input helpers), Issue #1084 (H5b's former-name arm, from row 10's review), Issue #1085 (Z21 and Z21b, pulled out on row 10's CI).
```

The orchestrator merges, which closes the issue; the implementer never closes it.

## Calls made

1. **The explicit form is a second argument to the context's own `sleep`, a `pace: ` or `window: ` reason as a literal at the call, typed by `Pause` on `SuiteContext`.** Rule: the issue's "The work" step 2 (an explicit, greppable form for pacing and for a timed window); `handbook/specs/check-placement.md` (a lint rule matches syntax, not a comment); the rulebook's skip list (no inline skip in the e2e tree); clause 4 and `vellum/e2e-throw-inside-step` (the form never throws); least change (no import, no helper).
2. **The poll test is the 785 plan's, with one correction: the exit-branch test asks of the branch that holds the call.** Rule: the 785 plan's step 1 ("the lint ... written with this poll test"); the correction removes a false red and changes no site (65 both ways, `compare.log`).
3. **The rule joins the block "the house's rules on every e2e script", not a new block named for this issue**, departing from the issue body, the 785 plan's row 12 and the brief. Rule: Alex's ruling on Issue #812 (2026-10-07, after this issue's body of 2026-10-05: blocks that match the same files with the same plugin fold together, named for what they cover; the rule file and git keep the provenance) and `handbook/specs/check-placement.md` (a new rule is wired in the block that already reaches the same files with the same plugins); `test/repo/lint-wiring.test.ts` asks an issue in the name only of a block that names a single file. The rule's message and its test name carry Issue #785.
4. **The rule reaches all of `e2e/`**, support modules included, so `e2e/support/launch.ts:158` is named `pace:`. Rule: the issue's "a bare `sleep(` in `e2e/`"; least change over restructuring the harness's retry.
5. **The rule reads `sleep` calls only**; aliases, a promise around `setTimeout` and timers inside payloads are declared blind spots erring toward a miss. Rule: the census (no Node-side timer in a suite; the eight under `e2e/` are primitives or deadlines); Gate 1 and `CLAUDE.md` (a scanner names its blind spots and argues their direction).
6. **`cards/hold.ts:87` stays a bare `sleep(4)`**, accepted by the poll test, and is named in the test's blind spots. Rule: least change; the poll test is the 785 plan's design.
7. **H8b's and H16's windows are written from `LANDFALL_HOLD_MS` and `IDLE_DELAY_MS`, at today's lengths.** Rule: the 785 plan's step 1 verdicts ("size the window from the hold constant", "from `IDLE_DELAY_MS`"); no length changes, so no timing is moved (H16's speed stays Issue #1068's).
8. **Each trailing comment that stated a site's reason folds into the reason and goes; no comment above a site is edited.** Rule: the comment doctrine (the reason is now code at the call); touch only what the form needs.
9. **No local browser suite but `home`.** Rule: the change is runtime-neutral elsewhere (an ignored argument); `home` holds the two computed windows and the new import; the full local lanes are never run.
10. **`vellum-spec-recon` not dispatched; the recount done in-session.** Rule: the brief ("recount every remaining `sleep(` ... yourself") and 6407993113; a departure from workflow step 2, named.
11. **Comment B, a closing ledger, is posted by the implementer.** Rule: the brief (the close needs a final comment); workflow step 12 (a record the next reader can find).
12. **The pull request merges after PR #1083.** Rule: the issue's scope includes the date widening (6007004790), so `Closes #785` is honest only once row 10 is in.

## Open decisions

None.

## Stop conditions, and the least change the implementer makes instead of handing back

The ruling of comment 6407993113 replaces a hand-back with the least change that keeps every ruling, recorded in the body and the dated comment. Each case names that change.

- **Files moved since acbe71b9** (`git diff --stat acbe71b9 origin/main -- e2e scripts/lint eslint.config.ts test/repo`). PR #1083's own files are expected to have moved and change nothing here (at its head a836cf63: `e2e/harness.ts`, `e2e/suites/corners.ts`, `e2e/suites/hunt.ts`, `e2e/suites/reading-room/addresses.ts`, `e2e/suites/render.ts`, `e2e/suites/slide-away.ts`, `e2e/suites/stage.ts`, `e2e/suites/zoom.ts`, `e2e/support/fixed-day.ts`, `e2e/support/reduced-motion.ts`, `e2e/support/skips.ts`, `test/e2e/fixed-day.test.ts`; none is a site file, and its diff adds no `sleep(`). Where any file this plan edits moved (the 39 site files, `e2e/types.ts`, `eslint.config.ts`), or `test/repo/e2e-sleep.test.ts` or `scripts/lint/e2e-sleep.ts` already exists: bring the branch current with `git merge origin/main`, apply each site row to the line holding the same statement in the same function, and name the moved files in the body. A `sleep` that arrived from main outside a poll is written in the form with the kind its code shows (a gap between inputs is `pace:`, a window an absence or a sample is read over is `window:`) and named in the body. `npm run lint` over the whole tree after commit 3 is the check that none is left.
- **A site's line does not hold the table's "the line today"**: find the statement by its text in the function the table's check names, and edit it there.
- **Commit 1's run is not 1 failing and 1 passing, or T1 reds on anything but its `deepStrictEqual`**: fix the stub or the wiring, never the test.
- **After commit 3, `npm run lint` reports `vellum/e2e-sleep-inside-poll` anywhere**: write that call in the form with the kind its code shows and name it in the body; never change the rule to pass it.
- **Prettier wraps a site's line**, or the lint names a function past 50 lines or a file past 400 (neither happened in the staged copy): shorten that reason, keeping its kind and its meaning.
- **The guard prover reports a mutation as a hole**: delete that mutation's claim from the body's guard list and name the hole; do not weaken another plant line to cover it.
- **The `home` suite reds H8b or H16 locally**: run the `node --input-type=module -e ...` line under Tests; if it does not print `1400 9800`, the constant moved since planning: write the margin so the sum is today's literal (1400, 9800) and name it in the body. Any other red takes `.claude/agents/vellum-implementer.md`'s route.
- **`closingIssuesReferences` does not read `[785]`**: rewrite the closing line exactly as `Closes #785`, alone on its line, and read it again.
