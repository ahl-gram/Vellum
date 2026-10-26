# Issue #785, row 10 (`785-date`): no test depends on the date

- **Planned at**: `origin/main` acbe71b9eaeeb52951de164f93372877b7275bac (`git ls-remote origin refs/heads/main`, 2026-10-26, after PR #1082, lane A, merged at 06:42:53Z); Issue #785 read with 58 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate | jq length`), the newest 6409783267.
- **How this plan is run**: Alex's ruling https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6407993113: a thin plan, no plan skeptic, the implementer runs as usual with one guard-prover round and one cold-skeptic round, and a problem found in the plan is not handed back: the implementer makes the least change that keeps every ruling, records it in the pull request body and a dated issue comment, and finishes. The re-timing duty is removed (comment 6407764430): this pull request edits no `MEASURED_SECONDS` value and starts no CI run by hand for timing. No third `STILL_ONLY` reason is added (this pull request adds no wait). Rows 3 and 5 are Issue #1075 and Issue #1076; row 12 (`785-lint`) comes after this one.
- **Rulings it builds to**: comment 6007004790 (Alex, 2026-10-05: no test depends on the date to pass; a test of date logic supplies its own date, as an argument or a frozen browser clock; the plan says whether the guard is a lint, a harness clock, or both, and names the spec the rule goes in); comment 6007851193 (the checks found so far).
- **Archive path**: `handbook/plans/785/785-date-plan.md`.
- **Open decisions**: none.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: "The environment" (a bullet inserted after the one opening "The harness serves the BUILT site", and the bullet opening "Two builds are compared by the sweep", edited), clause 14 (a suite leaves the browser in a known state).
- `handbook/specs/check-placement.md`: "The unit suite" (a bullet added here) and "The browser lanes and a plate read" (the two readings a plan prints).
- `handbook/specs/conventions.md`: "Where a rule lives" (one normative home), "How a spec, and the rest of the house's prose, is written", "How code is cited", and the comment rules.
- `.claude/skills/vellum-footguns/references/held-lines.md`: its "How a line leaves" paragraph and the "Noted ..., overtaken" form under "From Issue #611".
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before the tests, Gate 2 before the e2e edits, Gate 5 at the push.

## What the tree says (recon, and the planner's own census)

`vellum-spec-recon` read row 10's sources at 75f43f2f: every cited path, symbol, check id and line CURRENT; STALE, none blocking: comment 6007004790 places EL2 in `e2e/suites/corners/` (it is in `e2e/suites/stage/desk.ts`, under the stage suite), PR #784 has merged (`00da056`), and the row's "`e2e/suites/hunt*.ts`" glob names only `e2e/suites/hunt.ts`. **Recon also said lane A does not touch `e2e/suites/hunt.ts`; that is wrong**: PR #1082 (now merged, acbe71b9) adds `makeStep` and the HG2/HG3 and HG4 steps to it, so this plan was re-read at acbe71b9 and its hunt edits sit on lane A's version.

**The census** (re-run at acbe71b9 by `node out/785-date-dry-run/785-date-census.ts <tree> acbe71b9`, log `out/785-date-dry-run/785-date-census.log`; the 785 plan carried no command for these reads, so this script is the method). It parses every TypeScript file under `e2e/` (217) and lists every string or template literal naming a room whose bare visit draws the day's seed, and every `new Date()`, `Date()` and `Date.now()` in code or inside a page payload string.

- **Date reads used as a calendar day: 8 of the 28 clock reads the log lists.** In page payloads: `e2e/suites/hunt.ts:141` (`huntQuarry`), `e2e/suites/render.ts:99` (R0b), `e2e/suites/print-room/proof.ts:169` (PRB), and `e2e/suites/corners.ts:111` (the dateline check, already under the fixed day). In Node: `e2e/suites/reading-room/addresses.ts:99, 118` (RR9) and `:143, 155` (RR10b). The other 20 are elapsed time (`cards/hold.ts`, `chart-drawer/desk.ts`, `room-voyage-route.ts`, `slide-away/kit.ts`, `stage/slide-kit.ts`, `survey/arm.ts`, and `e2e/support/launch.ts`, whose `:106` and `:142` the script lists twice, once in code and once inside the log template that prints them).
- **Unit suite: no test reads the clock as a day** (recon's search and `git grep -n -E "new Date\(\)|Date\.now\(\)|Date\(\)" -- test test-support`: fixture text in three lint tests, elapsed time in `test/site/slip.test.ts` and `test/repo/proof-runner-job.test.ts`, every date in `test/world/seed-of-the-day.test.ts` passed in).
- **Rooms that draw the day's seed on a bare visit: six** (`git grep -n "seedForDate(new Date())" -- src/site`): the Explorer (`src/site/explorer/app.ts`), the Print Room, the Prospect, the Reading Room, the Ribbon, and the Seed of the Day (`src/site/seed-of-the-day/app.ts`), which reads no address at all.
- **Room literals that name no seed: 223 in 50 files** (explorer 83, ribbon 37, reading-room 30, print-room 29, prospect 25, seed-of-the-day 19), against 54 that name one or carry a hash. They are `Page.navigate` targets, kit helpers (`goto("/prospect/")`, `open("/explorer/")`, `visit`), page lists the suites loop over, `location.href = "/prospect/" + location.hash` inside payloads, the runner's boot page (`PAGE` in `e2e/support/runner.ts`, the bare Explorer every lane starts on), and path comparisons and labels that load nothing. **Blind spots, both toward missing a date-dependent load**: a route built from a constant defined outside `e2e/` (`CHART_ROOM_FLOOR` in `zg9Rooms`, `e2e/suites/zoom-gestures/touch.ts`), and a press on an in-page road that lands on a bare room (CD20 and CD50 in `e2e/suites/chart-drawer/portfolio.ts` land on the Explorer with no seed). Outside the corners, stage and slide-away suites (already on the fixed day), every bare visit today draws the day's world.

## The design

**The guard is a harness-wide fixed clock; no navigation lint** (call 1). `openSession` in `e2e/harness.ts` registers a clock script as a new-document script before its first navigation, exactly where `applyRunnerLayout` already registers its sheet, so every document of every run, every frame included, reads `FIXED_DAY` (2026-10-05 12:00 UTC) plus the time since that document was created. Every bare chart-room visit, in every form the census found and in the forms it cannot see, then draws `FIXED_SEED`'s world (20261005) on every date, and every page payload that reads `new Date()` reads the fixed day. Rejected: a lint that a chart-room navigation names its seed. It would touch 50 files, could not read a path inside a payload string or a route built from an imported constant or an in-page road press, and cannot fix the Seed of the Day at all, since that room ignores its address; the clock covers all of these with one call. Rejected: both, since the lint adds no case the clock leaves open.

**The clock's one gap is Node** (named in the spec, call 2). A Node-side day read that a check compares against the page reds on its first run on any day but 2026-10-05, so it is loud; a Node-side day read used only to build an address would draw a different world each day and stay silent. Also outside the clock: a Web Worker (new-document scripts do not reach one; the Explorer's worker draws the seed the page hands it), another browser target (the harness drives one page), and a read of the time that bypasses the global `Date` (`Intl.DateTimeFormat`'s `format()` with no date; the site's one formatter, `DATELINE` in `src/world/seed-of-the-day.ts`, is always handed a date). Each errs toward a check depending on the date again without the run saying so, and review holds them.

**`onFixedDay` splits** (call 3). The harness owns the clock. The reduced-motion half moves, unchanged, to `withReducedMotion` in a new `e2e/support/reduced-motion.ts`, which registers and removes no script (so it can never strip the harness's clock for the suites after it); the three callers (`corners`, `stage`, `slide-away`) switch to it. `e2e/support/fixed-day.ts` keeps the day: `FIXED_DAY`, `FIXED_SEED`, `clockScript`, `fixTheDay` (the harness's install) and `onDay` (a suite's own day).

**A suite's own day wins over the harness's in either script order** (call 4). `clockScript(day, override)` marks the page with a `Symbol.for("vellum.e2e.day")` key: the harness's base clock (`override` false) installs only where no clock is installed yet, and a suite's override clock always installs, over whatever `Date` it finds. So the result does not depend on the order the browser runs two new-document scripts in, which no browser was run here to read (UNVERIFIABLE on Chromium; the unit test runs both orders in Node's `vm`). Measured in `vm` (`out/785-date-dry-run/785-date-clock-vm.ts`, log `785-date-clock-vm.log`): base alone reads `2026-10-05T12:00:00.000Z`; base then override, and override then base, both read `2026-10-07T12:00:00.000Z`; `new Date(0)`, `Date.UTC` and `Date.parse` read as without a clock, `instanceof Date` holds, and `Date.now()` advanced 30 ms over a 30 ms wait.

**The hunt runs on a day of its own, 2026-10-07** (call 5). On the fixed day the hunt's clues give hunt H11 and hunt H12 nothing to check: CI run 37379661660 (main 6778fab7, 2026-10-05, job 111998053304) printed `H11 ... {"count":0,"missing":[]}` and `H12 ... {"count":0,"missing":[]}`, so pinning the hunt there would leave both checks passing on nothing forever. Comment 6007004790 lets a test of date logic supply its own date, so the hunt suite wraps itself in `onDay(ctx, HUNT_DAY, ...)`. 2026-10-07 is the first day on or after `FIXED_DAY` whose hunt gives both checks a clue: a Node sweep of the page's own selection (`out/785-date-dry-run/785-date-hunt-world.ts`, logs `785-date-hunt-world.log` and `785-date-hunt-sweep.log`, 60 days from the fixed day) reads 2026-10-05 at 0 and 0, 2026-10-06 at 0 and 1, 2026-10-07 at 1 and 1; and CI run 37646917465 (main e8f2e7cc, 2026-10-07, job 112879991198) printed every hunt check passing on that world, `H11 ... {"count":1,...}`, `H12 ... {"count":1,...}`, quarry Xuacil, the quarry the sweep predicts at acbe71b9. Hunt H11 and hunt H12 then also require at least one clue (call 6), so the day's choice is a witness the check holds and not a convention: if an engine change empties the day's clues, they red and name the count. `huntQuarry` takes its seed from `HUNT_SEED` rather than the page clock, so the hunt checks red if the page is on any other day (H7 and HD2 compare the page's seed with it).

**What each date read becomes**:

| read | check | becomes |
|---|---|---|
| `e2e/suites/render.ts:99` (page payload) | R0b | compares the Explorer's seed input against `String(FIXED_SEED)`, read in Node: the browser witness that `openSession` installs the clock |
| `e2e/suites/reading-room/addresses.ts:99, 118` (Node) | RR9 | compares against `FIXED_SEED`; the before-and-after sampling and its comment go (one day, nothing to straddle) |
| `e2e/suites/reading-room/addresses.ts:143, 155` (Node) | RR10b | the same |
| `e2e/suites/hunt.ts:141` (page payload) | the hunt checks | `const seed=${HUNT_SEED};`, the page on `HUNT_DAY` by `onDay` |
| `e2e/suites/print-room/proof.ts:169` (page payload) | PRB | stays: its in-page `new Date()` reads the harness's fixed day, so it answers the same every day (call 7) |
| `e2e/suites/corners.ts:111` (page payload) | CO1's dateline clause | stays, the same reason; its "or yesterday" arm can no longer be reached and is harmless (call 7) |

**What each seedless navigation becomes**: every one of them stays as written (the census's 223 literals, the runner's boot page and the road presses it cannot see); under the clock each draws 20261005's world on every date. L11 (`e2e/suites/landfall/seed.ts`) compares two reads of the same day, both now fixed; DR11 (`e2e/suites/cluster/trail.ts`) hit-tests the trail beside 20261005's place name every day. Neither is edited (call 7).

**The rule's home** (call 8): the browser half is a new bullet in `handbook/specs/settle-doctrine.md`, The environment (it is a fact about what the harness does, the section the issue's comment names), scoped to browser checks; the unit half is one bullet in `handbook/specs/check-placement.md`, The unit suite, pointing at it.

**The suite after the hunt** sees no hunt day. `onDay` takes its script off in its `finally`, and the hunt's last document stays loaded under 2026-10-07's clock until something navigates. The suite that follows the hunt, in the full order, in smoke and in lane A, is print-room (`E2E_SUITE_ORDER` and `NEEDS_PREDECESSOR` in `e2e/support/suites.ts`), and its first navigate goes to `/explorer/#seed=42&style=antique&legend=1` (`prlLink` in `e2e/suites/print-room/link.ts`), a different path and so a fresh document on the harness's day, naming its seed besides. A hand-made selection that leaves print-room out puts the next suite of the canonical order after the hunt; a suite that read the hunt's page without navigating would already break clause 14, whatever day the page was on. The sweep's "all on one date" clause in the same spec goes, since `shootAll` in `scripts/design/shoot.ts`, which `scripts/design/oracle.ts` uses, starts the same harness (call 9).

## Files

Every path is relative to the repo root. Run `npm run format` after typing them; Prettier's layout wins over the line breaks below. The two support modules and the test file below were run as written, in a scratch copy under `out/785-date-dry-run/planned/` (the modules at `planned/e2e/support/`, the test renamed `planned/tests/e2e/fixed-day.draft.ts` so `node --test` does not collect it from `out/`): 5 of 5 pass; the stub copy (`out/785-date-dry-run/stub/`) reads 0 of 5; `node out/785-date-dry-run/785-date-mutate.ts` (log `785-date-mutate.log`) reds each test the Tests table names under U1 to U7, with a clean control. `npm run check` and `npm run lint` were not run on them (they sit outside the lint's roots there); that is the implementer's commit 2.

**`e2e/support/fixed-day.ts`** (rewritten, 30 lines). Exports: `const FIXED_DAY: number`, `const FIXED_SEED: number`, `function clockScript(day: number, override: boolean): string`, `function fixTheDay(send: SuiteContext["send"]): Promise<void>`, `function onDay(ctx: Pick<SuiteContext, "send">, day: number, body: () => Promise<void>): Promise<void>`. `onFixedDay` and `FIXED_CLOCK` are deleted. The finished file:

```ts
import { seedForDate } from "../../src/world/seed-of-the-day.ts";
import type { SuiteContext } from "../types.ts";

// Every chart room's bare visit draws the day's seed (`seedForDate` in `src/world/seed-of-the-day.ts`), so every page the harness opens runs on this one day and a check answers the same on every date (Alex, 2026-10-05, on PR #784; Issue #785).
export const FIXED_DAY = Date.UTC(2026, 9, 5, 12);
export const FIXED_SEED = seedForDate(new Date(FIXED_DAY));

export function clockScript(day: number, override: boolean): string {
  return `(() => { const key = Symbol.for("vellum.e2e.day"), g = globalThis; if (!${override} && key in g) return; g[key] = ${day}; const Real = g.Date, shift = ${day} - Real.now(); g.Date = new Proxy(Real, { construct: (t, a) => (a.length ? new t(...a) : new t(Real.now() + shift)), apply: () => new Real(Real.now() + shift).toString(), get: (t, p) => (p === "now" ? () => Real.now() + shift : Reflect.get(t, p)) }); })()`;
}

export async function fixTheDay(send: SuiteContext["send"]): Promise<void> {
  await send("Page.addScriptToEvaluateOnNewDocument", { source: clockScript(FIXED_DAY, false) });
}

export async function onDay(ctx: Pick<SuiteContext, "send">, day: number, body: () => Promise<void>): Promise<void> {
  const clock = await ctx.send<{ identifier: string }>("Page.addScriptToEvaluateOnNewDocument", {
    source: clockScript(day, true),
  });
  try {
    await body();
  } finally {
    await ctx.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: clock.identifier }).catch(() => undefined);
  }
}
```

**`e2e/support/reduced-motion.ts`** (new, 11 lines). Export `function withReducedMotion(ctx: Pick<SuiteContext, "send">, body: () => Promise<void>): Promise<void>`, the old `onFixedDay` less its clock:

```ts
import type { SuiteContext } from "../types.ts";

export async function withReducedMotion(ctx: Pick<SuiteContext, "send">, body: () => Promise<void>): Promise<void> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  try {
    await body();
  } finally {
    await ctx.send("Emulation.setEmulatedMedia", { media: "", features: [] }).catch(() => undefined);
  }
}
```

**`e2e/harness.ts`** (396 to 398 lines). After `import { applyRunnerLayout } from "./support/runner-layout.ts";` add `import { fixTheDay } from "./support/fixed-day.ts";`. In `openSession`, between the focus-emulation `try`/`catch` and `if (runnerLayout) console.log(await applyRunnerLayout(send));`, add the line `await fixTheDay(send);` (before the `Page.navigate` to `PAGE`, which is what makes the boot Explorer draw 20261005).

**`e2e/suites/corners.ts`, `e2e/suites/stage.ts`, `e2e/suites/slide-away.ts`** (two lines each). Replace `import { onFixedDay } from "../support/fixed-day.ts";` with `import { withReducedMotion } from "../support/reduced-motion.ts";`, and `await onFixedDay(ctx, async () => {` with `await withReducedMotion(ctx, async () => {`. Nothing else in these files changes (`WIDEST_DATELINE` in `corners.ts` stays, call 7).

**`e2e/suites/render.ts`** (379 lines, a few fewer after). Add `import { FIXED_SEED } from "../support/fixed-day.ts";` on the line after `import { makeStep } from "../support/step.ts";`. In `r0ToR4Worker`:

```diff
-  const r0b = await evaluate<{ seed: string; expected: string }>(
-    `(async()=>{const {seedForDate}=await import("./engine/world/seed-of-the-day.js");return{seed:document.getElementById("seed").value,expected:String(seedForDate(new Date()))};})()`,
-    true,
-  );
+  const r0b = { seed: await evaluate<string>(`document.getElementById("seed").value`), expected: String(FIXED_SEED) };
   check("R0b bare Explorer visit lands on today's seed-of-the-day", r0b.seed === r0b.expected, JSON.stringify(r0b));
```

The check's name is not changed (call 10). `test/repo/e2e-tiers.test.ts` runs `r0ToR4Worker` over a stand-in whose `evaluate` returns `{}` for a payload that throws and asserts only R1, so it is untouched.

**`e2e/suites/reading-room/addresses.ts`** (164 lines, a few fewer after).

```diff
-import { seedForDate } from "../../../src/world/seed-of-the-day.ts";
+import { FIXED_SEED } from "../../support/fixed-day.ts";
```

In `rr9Today`: delete the comment line opening `// The seedForDate oracle is sampled BEFORE the navigation` and the line `const todayBefore = seedForDate(new Date());` above the first `Page.navigate`, and the line `const todayAfter = seedForDate(new Date());` after the poll; the check becomes:

```ts
  check(
    "RR9 a bare visit opens today's seed-of-the-day",
    !!bare && bare.seed === FIXED_SEED,
    JSON.stringify({ ...bare, fixed: FIXED_SEED }),
  );
```

In `rr10CrossLinks`: delete `const linkBefore = seedForDate(new Date());` and `const linkAfter = seedForDate(new Date());`; the check becomes:

```ts
  check(
    "RR10b the Today page cross-links the room with today's seed pinned",
    !!watch && /^\.\.\/reading-room\/#seed=\d+$/.test(watch.href) && watchSeed === FIXED_SEED,
    JSON.stringify({ watch, fixed: FIXED_SEED }),
  );
```

**`e2e/suites/hunt.ts`** (338 lines, about 345 after), on lane A's version at acbe71b9.

1. Imports: directly under the header comment, as the first import, add `import { seedForDate } from "../../src/world/seed-of-the-day.ts";`; and after `import { dropExpectedCancellations } from "../support/console.ts";` add `import { onDay } from "../support/fixed-day.ts";`.
2. After `const bandRank = ...` (its two lines), add:

```ts
// 2026-10-26: the first day on or after FIXED_DAY whose hunt gives hunt H11 and H12 a clue each to check (count 1 and 1 on CI run 37646917465 of 2026-10-07; FIXED_DAY's world gives 0 and 0, run 37379661660).
const HUNT_DAY = Date.UTC(2026, 9, 7, 12);
const HUNT_SEED = seedForDate(new Date(HUNT_DAY));
```

3. `run` becomes the wrapper, and its body moves unchanged into `huntSuite`:

```diff
 export async function run(ctx: SuiteContext): Promise<void> {
+  await onDay(ctx, HUNT_DAY, () => huntSuite(ctx));
+}
+
+async function huntSuite(ctx: SuiteContext): Promise<void> {
   const { consoleErrors, PORT } = ctx;
```

4. In `huntQuarry`: the comment line becomes `// Click targets are derived from HUNT_SEED's world, generated by the browser's own engine; this is the only coverage of the click -> projection-inversion -> nearest-settlement snap.`; and in the payload:

```diff
     const {createProjection}=await import("../explorer/engine/render/transform.js");
-    const {seedForDate}=await import("../explorer/engine/world/seed-of-the-day.js");
-    const seed=seedForDate(new Date());
+    const seed=${HUNT_SEED};
     const world=generateWorld(defaultRecipe(seed));
```

5. In `h11Labels`: the comment ends at `accepts either spelling.` (drop `; vacuous on days with no river/lake/near clue`), and the check becomes:

```ts
  check(
    "H11 every displayed river/lake/near clue names something the chart labeled, and the hunt's day shows at least one",
    labelCheck.count >= 1 && labelCheck.missing.length === 0,
    JSON.stringify(labelCheck),
  );
```

6. In `h12Terrain` the check becomes:

```ts
  check(
    "H12 every displayed terrain clue has its glyphs drawn near the quarry, and the hunt's day shows at least one",
    terrainCheck.count >= 1 && terrainCheck.missing.length === 0,
    JSON.stringify(terrainCheck),
  );
```

**`test/e2e/fixed-day.test.ts`** (new, 111 lines), the five tests of the Tests table, typed exactly as below (the copy that was run is `out/785-date-dry-run/planned/tests/e2e/fixed-day.draft.ts`). The whole file, as run:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { FIXED_DAY, FIXED_SEED, clockScript, fixTheDay, onDay } from "../../e2e/support/fixed-day.ts";
import { withReducedMotion } from "../../e2e/support/reduced-motion.ts";

const OTHER_DAY = Date.UTC(2026, 9, 7, 12);
const ADD = "Page.addScriptToEvaluateOnNewDocument";
const REMOVE = "Page.removeScriptToEvaluateOnNewDocument";
const MEDIA = "Emulation.setEmulatedMedia";
// A page whose own clock stands at 1e12 until tick(ms) moves it, so no test waits on the wall clock.
const STOPPED = `(() => { const Real = Date; let t = 1e12; globalThis.tick = (ms) => { t += ms; }; globalThis.Date = new Proxy(Real, { get: (o, p) => (p === "now" ? () => t : Reflect.get(o, p)) }); })()`;
type Sent = { method: string; params?: Record<string, unknown> };

function page(...scripts: string[]): (expression: string) => unknown {
  const ctx = vm.createContext({});
  for (const s of [STOPPED, ...scripts]) vm.runInContext(s, ctx);
  return (expression) => vm.runInContext(expression, ctx);
}
const isoOf = (run: (e: string) => unknown) => String(run("new Date().toISOString()"));

function recorder(fail: (sent: Sent) => boolean = () => false) {
  const sent: Sent[] = [];
  const send = <T>(method: string, params?: Record<string, unknown>): Promise<T> => {
    const message = params === undefined ? { method } : { method, params };
    sent.push(message);
    if (fail(message)) return Promise.reject(new Error(`${method} refused`));
    const reply = method === ADD ? { identifier: `script-${String(sent.length)}` } : {};
    return Promise.resolve(reply as T);
  };
  return { sent, send };
}

test("the harness's clock holds a page at FIXED_DAY: new Date(), Date() and Date.now read that day and run on from it, while a date built from arguments, Date.UTC and Date.parse are left alone", () => {
  const run = page(clockScript(FIXED_DAY, false));
  assert.equal(FIXED_SEED, 20261005);
  assert.equal(isoOf(run), "2026-10-05T12:00:00.000Z");
  assert.equal(run("Date.now()"), FIXED_DAY);
  assert.equal(Date.parse(String(run("Date()"))), FIXED_DAY);
  assert.deepEqual(
    JSON.parse(String(run('JSON.stringify([new Date(0).getTime(), Date.UTC(2026, 0, 1), Date.parse("2026-07-06T00:00:00Z"), new Date() instanceof Date])'))),
    [0, 1767225600000, 1783296000000, true],
  );
  run("tick(250)");
  assert.equal(run("Date.now()"), FIXED_DAY + 250);
  assert.equal(isoOf(run), "2026-10-05T12:00:00.250Z");
});

test("a suite's own day wins over the harness's, whichever of the two new-document scripts the browser runs first", () => {
  assert.equal(isoOf(page(clockScript(FIXED_DAY, false), clockScript(OTHER_DAY, true))), "2026-10-07T12:00:00.000Z");
  assert.equal(isoOf(page(clockScript(OTHER_DAY, true), clockScript(FIXED_DAY, false))), "2026-10-07T12:00:00.000Z");
});

test("fixTheDay registers exactly one new-document script, the harness's clock at FIXED_DAY, which a suite's own day still wins over", async () => {
  const { sent, send } = recorder();
  await fixTheDay(send);
  assert.deepEqual(
    sent.map((s) => s.method),
    [ADD],
  );
  const source = String(sent[0]?.params?.["source"]);
  assert.equal(isoOf(page(source)), "2026-10-05T12:00:00.000Z");
  assert.equal(isoOf(page(clockScript(OTHER_DAY, true), source)), "2026-10-07T12:00:00.000Z");
});

test("onDay gives its body the suite's own day and takes that clock back off by its own identifier, also when the body throws, keeping the body's error when the browser refuses the removal", async () => {
  const { sent, send } = recorder();
  const seen: string[] = [];
  await onDay({ send }, OTHER_DAY, () => {
    seen.push(sent.map((s) => s.method).join());
    return Promise.resolve();
  });
  assert.deepEqual(
    sent.map((s) => s.method),
    [ADD, REMOVE],
  );
  assert.equal(sent[0]?.params?.["source"], clockScript(OTHER_DAY, true));
  assert.deepEqual(sent[1]?.params, { identifier: "script-1" });
  assert.deepEqual(seen, [ADD]);
  const failing = recorder();
  await assert.rejects(
    onDay({ send: failing.send }, OTHER_DAY, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  assert.deepEqual(
    failing.sent.map((s) => s.method),
    [ADD, REMOVE],
  );
  const refusing = recorder((s) => s.method === REMOVE);
  await assert.rejects(
    onDay({ send: refusing.send }, OTHER_DAY, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
});

test("withReducedMotion reduces motion for its body and clears the emulated media after it, also when the body throws, and registers or removes no new-document script", async () => {
  const both = [
    { method: MEDIA, params: { features: [{ name: "prefers-reduced-motion", value: "reduce" }] } },
    { method: MEDIA, params: { media: "", features: [] } },
  ];
  const quiet = recorder();
  await withReducedMotion({ send: quiet.send }, () => Promise.resolve());
  assert.deepEqual(quiet.sent, both);
  const failing = recorder();
  await assert.rejects(
    withReducedMotion({ send: failing.send }, () => Promise.reject(new Error("the body's own error"))),
    /the body's own error/,
  );
  assert.deepEqual(failing.sent, both);
  assert.ok(![...quiet.sent, ...failing.sent].some((s) => s.method === ADD || s.method === REMOVE));
});
```

(`recorder` is `test/e2e/cleanups.test.ts`'s own shape; the comment on `STOPPED` is the one line the file carries, since no test pins why the stand-in clock stands still.)

**`handbook/specs/settle-doctrine.md`**. (a) A new bullet in The environment, directly after the bullet opening "**The harness serves the BUILT site.**" and before the one opening "**A browserless run's meaning is decided by policy**", wrapped by hand like its neighbours:

> - **Every page the harness opens runs on one fixed day.** `openSession` in `e2e/harness.ts` registers the clock `fixTheDay` writes (`e2e/support/fixed-day.ts`) before its first navigation, so in every document of the run, every frame included, `Date` reads `FIXED_DAY` plus the time since that document was created, and a bare visit to a chart room, which draws the day's seed (`seedForDate` in `src/world/seed-of-the-day.ts`), draws `FIXED_SEED`'s world on every date. The sweep and the design shooter start the same harness, so their shots share the day. A browser check never reads the real date: a check that asserts what a day produces takes the day from `FIXED_SEED` or from the page's own clock, never from the Node process's, which runs on the real date; and a suite that tests date logic on a day of its own wraps itself in `onDay`, whose clock wins over the harness's whichever of the two the browser runs first, as the hunt suite does with the day its checks need. The clock does not reach a Web Worker, another browser target, or a read of the time that bypasses the global `Date` (`Intl.DateTimeFormat`'s `format()` with no date); no page reads the date in any of them, and each errs toward a check that depends on the date again without the run saying so. So does a Node read of the date used only to build an address, while one a check compares against the page reds on its first run on any day but the fixed one.

(b) In the bullet opening "**Two builds are compared by the sweep**", the words `Shoot the
  unchanged build twice and the branch once, all on one date, since the Seed of the Day's head box
  carries it, then run` become `Shoot the unchanged build twice and the branch once, then run`, rewrapped to the paragraph's width.

**`handbook/specs/check-placement.md`**, The unit suite: a new second bullet, after the one opening "**A unit test runs the code and asserts what it does.**":

> - **A unit test of date logic passes its own date**, as `test/world/seed-of-the-day.test.ts` passes each `Date` it asserts on, and no unit test reads the clock as a day. A browser check's day is the harness's (`handbook/specs/settle-doctrine.md`, The environment, the bullet opening "Every page the harness opens").

**`.claude/skills/vellum-footguns/references/held-lines.md`**: under "## Held, not declined", after its one paragraph, a blank line and then:

> Noted 2026-10-26, overtaken: the clause's premise no longer holds. Every page the harness opens runs on one fixed day and the hunt suite on a day of its own (`onDay` in `e2e/support/fixed-day.ts`, Issue #785), so no suite runs the world today's UTC date seeds. The clause itself stays frozen with Gate 2 item 10 until Alex lifts the freeze.

**`handbook/plans/785/785-date-plan.md`**: this plan, unchanged (commit 1).

No other file changes: no `src/` file, no `e2e/types.ts`, no `e2e/support/skips.ts`, no `test/e2e/lane-timings.test.ts`, no `eslint.config.ts`, no `scripts/lint/`.

## Tests, in the order they are written

All five are new, in `test/e2e/fixed-day.test.ts`, run by `node --import ./test-support/source-read-guard.ts --test test/e2e/fixed-day.test.ts`. The file reads no source as text, so `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched.

**The stub (commit 1)**, the right shape with the wrong behavior, so each test reds on its assertion and none on a missing module, and `npm run check` and `npm run lint` stay clean. In `e2e/support/fixed-day.ts`, keep `onFixedDay` and `FIXED_CLOCK` as they are (their callers still import them), turn `const FIXED_DAY` into `export const FIXED_DAY`, and add, below `FIXED_CLOCK`:

```ts
export const FIXED_SEED = seedForDate(new Date(FIXED_DAY));
export function clockScript(day: number, override: boolean): string {
  return `(() => [${day}, ${override}])()`;
}
export async function fixTheDay(send: SuiteContext["send"]): Promise<void> {
  await send("Page.enable");
}
export async function onDay(ctx: Pick<SuiteContext, "send">, day: number, body: () => Promise<void>): Promise<void> {
  await ctx.send("Page.addScriptToEvaluateOnNewDocument", { source: clockScript(day, true) });
  await body();
}
```

with `import { seedForDate } from "../../src/world/seed-of-the-day.ts";` at the top. And `e2e/support/reduced-motion.ts` as a stub that reduces motion and never clears it:

```ts
import type { SuiteContext } from "../types.ts";

export async function withReducedMotion(ctx: Pick<SuiteContext, "send">, body: () => Promise<void>): Promise<void> {
  await ctx.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await body();
}
```

Against the stub: 5 failing, 0 passing.

| # | name | asserts | red on the stub because | mutation that reds it once green |
|---|---|---|---|---|
| T1 | `the harness's clock holds a page at FIXED_DAY: new Date(), Date() and Date.now read that day and run on from it, while a date built from arguments, Date.UTC and Date.parse are left alone` | with `run = page(clockScript(FIXED_DAY, false))`: `FIXED_SEED === 20261005`; `isoOf(run) === "2026-10-05T12:00:00.000Z"`; `run("Date.now()") === FIXED_DAY`; `Date.parse(String(run("Date()"))) === FIXED_DAY`; `JSON.parse(String(run('JSON.stringify([new Date(0).getTime(), Date.UTC(2026, 0, 1), Date.parse("2026-07-06T00:00:00Z"), new Date() instanceof Date])')))` deep-equals `[0, 1767225600000, 1783296000000, true]` (through JSON because an array built in the `vm` context carries that context's `Array.prototype`, which strict deep equality refuses); after `run("tick(250)")`, `run("Date.now()") === FIXED_DAY + 250` and `isoOf(run) === "2026-10-05T12:00:00.250Z"` | the stub's script installs nothing, so `new Date()` reads the real date | U1, U3 |
| T2 | `a suite's own day wins over the harness's, whichever of the two new-document scripts the browser runs first` | `isoOf(page(clockScript(FIXED_DAY, false), clockScript(OTHER_DAY, true)))` and `isoOf(page(clockScript(OTHER_DAY, true), clockScript(FIXED_DAY, false)))` both `=== "2026-10-07T12:00:00.000Z"` | as T1 | U2 |
| T3 | `fixTheDay registers exactly one new-document script, the harness's clock at FIXED_DAY, which a suite's own day still wins over` | with `{ sent, send } = recorder()` and `await fixTheDay(send)`: `sent.map((s) => s.method)` deep-equals `[ADD]`; with `source = String(sent[0]?.params?.["source"])`, `isoOf(page(source)) === "2026-10-05T12:00:00.000Z"` and `isoOf(page(clockScript(OTHER_DAY, true), source)) === "2026-10-07T12:00:00.000Z"` | the stub sends `Page.enable` | U4 |
| T4 | `onDay gives its body the suite's own day and takes that clock back off by its own identifier, also when the body throws, keeping the body's error when the browser refuses the removal` | (a) a body that records `sent.map((s) => s.method).join()`: after `await onDay({ send }, OTHER_DAY, body)`, methods deep-equal `[ADD, REMOVE]`, `sent[0]?.params?.["source"] === clockScript(OTHER_DAY, true)`, `sent[1]?.params` deep-equals `{ identifier: "script-1" }`, and the body saw `ADD` alone; (b) a body rejecting `new Error("the body's own error")`: `assert.rejects(..., /the body's own error/)` and methods deep-equal `[ADD, REMOVE]`; (c) the same body with `recorder((s) => s.method === REMOVE)`: still rejects with the body's own error | the stub never removes its script | U5, U6 |
| T5 | `withReducedMotion reduces motion for its body and clears the emulated media after it, also when the body throws, and registers or removes no new-document script` | (a) after `await withReducedMotion({ send }, () => Promise.resolve())`: `sent` deep-equals `[{ method: MEDIA, params: { features: [{ name: "prefers-reduced-motion", value: "reduce" }] } }, { method: MEDIA, params: { media: "", features: [] } }]`; (b) a body rejecting `new Error("the body's own error")`: rejects with it, and `sent` deep-equals the same two; (c) no entry of either `sent` has method `ADD` or `REMOVE` | the stub never clears the media | U7 |

**Mutations** (each from the finished code, committed first; the guard prover owes every row):

| # | file | the edit | reds |
|---|---|---|---|
| U1 | `e2e/support/fixed-day.ts` | in `clockScript`, `new t(Real.now() + shift)` becomes `new t(Real.now())` | T1, T2 and T3 (`785-date-mutate.log`; in `785-date-clock-vm.log` base alone reads `2026-10-26T...`, the real date) |
| U2 | `e2e/support/fixed-day.ts` | `if (!${override} && key in g) return;` becomes `if (key in g) return;` | T2 (`vm` reading: base then override reads `2026-10-05T12:00:00.000Z`) |
| U3 | `e2e/support/fixed-day.ts` | in the `get` trap, `p === "now" ? () => Real.now() + shift : Reflect.get(t, p)` becomes `Reflect.get(t, p)` | T1 (`Date.now()` reads the stand-in's 1e12) |
| U4 | `e2e/support/fixed-day.ts` | in `fixTheDay`, `clockScript(FIXED_DAY, false)` becomes `clockScript(FIXED_DAY, true)` | T3 (the harness's clock run second takes the page back to the fixed day) |
| U5 | `e2e/support/fixed-day.ts` | the `finally` line in `onDay` deleted | T4 |
| U6 | `e2e/support/fixed-day.ts` | in `onDay`, `clockScript(day, true)` becomes `clockScript(day, false)` | T4 (source compare) |
| U7 | `e2e/support/reduced-motion.ts` | the `finally` line deleted | T5 |
| B1 | `e2e/harness.ts` | the line `await fixTheDay(send);` deleted | render R0b; reading-room RR9 and RR10b (suites `render`, `reading-room`) |
| B2 | `e2e/suites/hunt.ts` | in `run`, `await onDay(ctx, HUNT_DAY, () => huntSuite(ctx));` becomes `await huntSuite(ctx);` | hunt H7, HD2, H11, H12 at least (suite `hunt`); H4, H5, H5b, H6, H6b, HD1, H8, H8b, HD3, H10, HG4 may red too, since the page then draws 20261005's world while `huntQuarry` aims at 20261007's quarry |
| B3 | `e2e/suites/hunt.ts` | B2, plus `labelCheck.count >= 1 && ` and `terrainCheck.count >= 1 && ` removed | hunt H11 and H12 no longer red (they pass at count 0, as on run 37379661660): the strengthening is what reds them under B2 |

The prover owes U1 to U7, B1 and B2; B3 is the control that shows the `count >= 1` clauses are what bite, and goes with B2 in the same round. A browser mutation may run on the proof runner (`npm run proof -- send`, workflow step 11), naming each suite and the checks above; the hunt's ids collide with home's (home has its own H4, H5b, H10, H11), so every hunt row names suite `hunt`.

**The two readings of each browser check.** No browser was run for this plan: the dispatcher kept the Mac quiet, so a reading on this plan's own build is UNVERIFIABLE for every row, and the implementer's first local run of each suite is its reading on this build (Stop conditions). What stands instead are real browser readings of the same reads, from CI runs on GitHub's machines on the two days themselves, at older commits (copied to `out/785-date-dry-run/785-date-ci-readings.log` by `node out/785-date-dry-run/785-date-ci-excerpt.ts <scratch dir>`, since CI logs expire):

| check | fixture reading (the change in place) | mutation reading | assertion after the change |
|---|---|---|---|
| R0b | job 111998053304 (run 37379661660, main 6778fab7, 2026-10-05): `{"seed":"20261005",...}`, the page on the fixed day, so `"20261005" === "20261005"` passes | B1: job 112879991198 (run 37646917465, main e8f2e7cc, 2026-10-07): `{"seed":"20261007",...}`, the page on its run's real day, so `"20261007" !== "20261005"` fails, as it will on any day after 2026-10-05 | `r0b.seed === String(FIXED_SEED)` |
| RR9 | job 111998053070 (same run, lane B): `"seed":20261005`, passes | B1: job 112879991233 (run 37646917465, lane B): `"seed":20261007`, fails | `bare.seed === FIXED_SEED` |
| RR10b | job 111998053070: `"href":"../reading-room/#seed=20261005"`, passes | B1: job 112879991233: `#seed=20261007`, fails | `watchSeed === FIXED_SEED` |
| hunt H11 | job 112879991198 (the hunt on 2026-10-07): `{"count":1,"missing":[]}`, passes, nearest to failing of the four hunt rows (the bound is `count >= 1`) | B2: job 111998053304 (the hunt on 2026-10-05): `{"count":0,"missing":[]}`, fails | `count >= 1 && missing.length === 0` |
| hunt H12 | job 112879991198: `{"count":1,"missing":[]}`, passes, as near | B2: job 111998053304: `{"count":0,"missing":[]}`, fails | the same |
| hunt H7 | job 112879991198: `{"solved":20261007,"streak":1}` against `HUNT_SEED` 20261007, passes | B2: job 111998053304 shows the page writing `{"solved":20261005,...}`, against `HUNT_SEED` 20261007, fails | unchanged regex on `tgt.seed`, now `HUNT_SEED` |
| hunt HD2 | job 112879991198: `"seedKept":true`, passes | B2: the dispatch carries the page's seed 20261005 against `tgt.seed` 20261007, so `seedKept` and `chartNo` are false; inferred from the code (`hd1Dispatch` in `e2e/suites/hunt/solved.ts`), no log shows it | unchanged |

The hunt's 2026-10-07 world at acbe71b9 is the one the CI run read: the Node sweep at acbe71b9 picks quarry Xuacil with one river clue and one terrain clue, as job 112879991198 printed.

## Order of commits

Branch `chore/785-date`. `npm run format` before each commit.

1. `handbook/plans/785/785-date-plan.md` (this plan), `test/e2e/fixed-day.test.ts`, the stubs in `e2e/support/fixed-day.ts` and the new `e2e/support/reduced-motion.ts`. The test file reads 5 failing, 0 passing, each red on the assertion the table names. Push.
2. `e2e/support/fixed-day.ts` (the finished file), `e2e/support/reduced-motion.ts` (finished), `e2e/suites/corners.ts`, `e2e/suites/stage.ts`, `e2e/suites/slide-away.ts`, `e2e/harness.ts`. T1 to T5 green; `npm run check` and `npm run lint` clean.
3. `e2e/suites/render.ts`, `e2e/suites/reading-room/addresses.ts`.
4. `e2e/suites/hunt.ts`.
5. `handbook/specs/settle-doctrine.md`, `handbook/specs/check-placement.md`, `.claude/skills/vellum-footguns/references/held-lines.md`.

## Rosters and doctrine

- The test file joins `npm test` by its name (`test/e2e/*.test.ts`). The new support module joins no list: the e2e source list is read off the tree (`test/repo/e2e-tiers.test.ts`), and nothing enumerates `e2e/support/`.
- The spec bullets and the held-lines line are written out above. Every backticked path in them resolves (`test/repo/prose-paths.test.ts`): `e2e/harness.ts`, `e2e/support/fixed-day.ts`, `src/world/seed-of-the-day.ts`, `test/world/seed-of-the-day.test.ts`.
- No spec, gate or agent line is contradicted beyond the sweep's "all on one date" clause, edited above. The comment at `COLLIDED_2026_10_06` in `e2e/suites/stage/desk.ts` ("read beside the suite's fixed day") stays true of the harness's day and is not edited (call 11).
- No step is added or made longer (R0b loses a dynamic import; hunt H11 and H12 gain a clause, no read), so settle-doctrine's count of what a new or longer step holds is not owed.
- Nothing pins the old sentences of hunt H11 and H12 (`git grep -n -F "H11 every" -- test test-support scripts .github e2e .claude handbook/specs` and the same for `"H12 every"` find only `e2e/suites/hunt.ts`).

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- `node --import ./test-support/source-read-guard.ts --test test/e2e/fixed-day.test.ts`: 5 of 5.
- `npm run build`, then one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0: `VELLUM_E2E_SUITES=render npm run test:e2e` (quote R0b's line: `{"seed":"20261005","expected":"20261005"}` on a run whose real day is not 2026-10-05, the live witness that the clock is installed); `VELLUM_E2E_SUITES=reading-room npm run test:e2e` (RR9, RR10b); `VELLUM_E2E_SUITES=hunt npm run test:e2e` (every hunt line, H11 and H12 with `count`, H7 with `"solved":20261007`); `VELLUM_E2E_SUITES=slide-away npm run test:e2e` (the reduced-motion wrapper, the shortest of its three callers). Each ALL PASS. Corners and stage run on CI only.
- The pull request's CI: all four lanes green. It is the first run of every suite on 20261005's world at current code (Stop conditions).
- `vellum-guard-prover` on U1 to U7, B1, B2 and B3.
- `vellum-plate-reader` is not owed: nothing here is an appearance. No `MEASURED_SECONDS` value is edited and no CI run is started by hand for timing (comment 6407764430).

## Calls made

1. **The guard is a harness-wide fixed clock, with no navigation lint.** Rule: comment 6007004790 leaves the form to this plan and the brief asks for the least change that really stops a new date dependency; the clock reaches every form of bare visit the census found (223 literals in 50 files) and every form it cannot see (payload strings, imported routes, road presses, the Seed of the Day, which takes no address), at one call, where a syntax rule reaches none of the last group.
2. **The clock's gaps are named in the spec, with their direction, instead of being guarded.** Rule: `CLAUDE.md`, Process ("a scanner names its blind spots and argues the direction"); a Node read compared against the page is already loud, and the silent cases (a Node read used only to build an address, a worker, another target, `format()` with no date) have no instance in the tree.
3. **`onFixedDay` splits into the harness's clock and `withReducedMotion` in a new `e2e/support/reduced-motion.ts`, and its three callers switch.** Rule: the brief ("a harness-wide fixed clock split from `onFixedDay`'s reduced motion"); a name that says "fixed day" on a function that no longer fixes it would mislead, and a wrapper that removed a script in its `finally` would strip the harness's clock from every later suite in the lane, which T5 refuses.
4. **The clock marks the page so a suite's own day wins in either script order.** Rule: the order in which Chromium runs two new-document scripts was not measured (no browser), so the design does not lean on it; T2 runs both orders.
5. **The hunt suite runs on 2026-10-07 through `onDay`, not on the harness's day.** Rule: comment 6007004790 ("a test of date logic supplies its own date"); on 2026-10-05 hunt H11 and H12 have nothing to check (run 37379661660), and 2026-10-07 is the first day on or after the fixed day that gives both a clue, with every hunt check read passing on it (run 37646917465). Its cost: hunt H5b takes its "says nothing" branch there (Xuacil has no former name), where the fixed day's quarry, Zodo, "Once called Tho", took the naming branch; the first day in the 60 swept from the fixed day that gives all three is 2026-11-03, a date no CI run has read yet, so it was not taken.
6. **Hunt H11 and H12 require at least one clue, and their sentences say so.** Rule: `CLAUDE.md`, Process ("a guard that could pass vacuously names the witness that makes it bite"); on a fixed day the empty branch is no longer a property of the day but a fixture that missed its case.
7. **PRB, CO1's dateline clause, L11 and DR11 are not edited.** Rule: each reads the page's own clock or compares two reads of the same day, so under the harness's clock each answers the same on every date; R0b, RR9 and RR10b are the browser witnesses of the clock, and a check edited only to restate the day is a change nothing needs. CO1's "or yesterday" arm is left, unreachable and harmless.
8. **The rule is split by instrument: the browser half lives in `handbook/specs/settle-doctrine.md`, The environment, scoped to browser checks ("A browser check never reads the real date"), and the unit half in `handbook/specs/check-placement.md`, The unit suite, which points at the browser half.** Rule: comment 6007004790 names the two candidates and `handbook/specs/conventions.md` keeps exactly one normative home per rule; a fact about the harness belongs in the environment section, a rule about unit tests in the unit suite's, and neither restates the other.
9. **The sweep's "all on one date" clause goes, and the design shooter and the sweep run on the fixed day too.** Rule: they start the same harness (`start` in `scripts/design/shoot.ts`), so the clause holds by construction; a design round's still of a bare Seed of the Day now shows 5 October 2026, which is deterministic and named here for Alex.
10. **No check is renamed except hunt H11 and H12.** Rule: R0b, RR9 and RR10b keep "today's" (the page's today is the harness's day) so their sentences, ids and every proof selection that names them stay as they are; H11 and H12 change because their claim changed (call 6).
11. **The `held-lines.md` date-flake clause gets a dated "Noted" line beneath it and is not edited; the `COLLIDED_2026_10_06` comment is not edited.** Rule: the clause is frozen by Alex's ruling (Issue #591, ruling 10), and the file's own "Noted ..., overtaken" form records a premise overtaken; the stage comment stays true.
12. **This pull request waits for lane A's merge and is built on it.** Rule: the brief (order after lane A for a file lane A touches); PR #1082 edits `e2e/suites/hunt.ts` and merged at acbe71b9, the sha this plan was read at.

## Open decisions

None.

## Stop conditions

No hand-back (comment 6407993113): each condition names what the implementer will find if the plan is wrong and the least change to make, recorded in the pull request body and the dated issue comment.

- `git diff --stat acbe71b9 origin/main -- e2e/harness.ts e2e/support/fixed-day.ts e2e/suites/hunt.ts e2e/suites/render.ts e2e/suites/reading-room/addresses.ts e2e/suites/corners.ts e2e/suites/stage.ts e2e/suites/slide-away.ts` prints anything, or `test/e2e/fixed-day.test.ts` or `e2e/support/reduced-motion.ts` exists on `origin/main`: merge `origin/main`, re-apply each edit to the moved text by the text it quotes, and name the move.
- A `-` line or quoted text above is not in its file exactly once: apply the edit to the one place the surrounding text identifies, and name it.
- Commit 1 does not read 5 failing and 0 passing on the named assertions: fix the stub, never the test's assertion.
- `npm run lint` names a finding in a touched file (`max-lines`, `max-lines-per-function`, `vellum/e2e-throw-inside-step`, a comment-form rule): make the least edit that clears it and keeps the design; for `vellum/e2e-throw-inside-step` in `e2e/suites/hunt.ts`, wrap only the call it names in a step named for the checks that call holds.
- The local render run reads R0b's seed as anything but `"20261005"`: the clock did not install. Read `Page.addScriptToEvaluateOnNewDocument`'s answer in `openSession` and fix the install there; never move R0b's expectation.
- The local hunt run reads hunt H11 or H12 with `count` 0, or the quarry is not Xuacil: the page did not take the hunt's day (check `onDay` and the clock's override), or the engine's world for 20261007 has moved since acbe71b9 (`node out/785-date-dry-run/785-date-hunt-world.ts 20261007` says which; the probe is in the main checkout's `out/785-date-dry-run/` once the dispatcher has copied the planner's `out/` across when it retired the planner's tree, and is copied from there into the implementer's own `out/785-date-dry-run/` before it runs, since it imports `../../src/` relative to that folder). If the world moved, re-run the probe over days from 2026-10-05 forward, take the first day that gives both checks a clue, set `HUNT_DAY` to it, and rewrite its dated line to name the Node sweep and the local hunt run that read it (no CI run has read it yet).
- **The pull request's first CI run reds a check that main's last run passed.** It is the first run of every suite on 20261005's world at current code (the baseline is main's run 37379661660, all four lanes green on 2026-10-05 at 6778fab7, and the corners, stage and slide-away suites, which run on it every day). Read it first as the implementer definition's red-on-CI route says. If its detail shows the check meeting that world differently (a place, a label, a collision, a clearance), it is a defect the rotating day hid, as EL2's was: file an issue naming the check, `#seed=20261005` and the failing detail; pin that check's own navigation to the seed of the day main's last green run read it on (its log's date), with one dated line naming the issue; for a check on the Seed of the Day, which takes no seed, wrap it in `onDay` with that day. Never move `FIXED_DAY`: the stage, corners and slide-away suites were measured on it, and `COLLIDED_2026_10_06` in `e2e/suites/stage/desk.ts` names its world beside it.
- The guard prover reports any of U1 to U7, B1 or B2 as a hole: a hole is deleted or strengthened as workflow step 11 says, and named.
