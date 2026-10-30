# Issue #854 plan, revision 1 of pull request 1: a browser guard for the Explorer's own spelling of a shaped and a counted world

**Revision 1 of `handbook/plans/800/854/854-plan.md`.** What it changes against that plan: it adds two browser checks, PRW7 and PRW8, to the print-room suite, and the three proof rows that show they bite. The checks guard `landKeysNow` (`src/site/explorer/hash-sync.ts`) and its one other consumer, `draftOverrides` (`src/site/explorer/app-wiring.ts`), which the plan's Tests section left without a guard (the cold skeptic's finding 2 on PR #1128). It changes no design, no source file under `src/`, no unit test, no spec, and no call of the plan before it. Every other line of `854-plan.md` stands as archived.

- **Planned at:** `origin/main` 31f2e2898024d7ee8a45dcae91fb5ceb0002e84c (`git fetch origin main` then `git rev-parse origin/main`, 2026-10-30); Issue #854 comment count 8 (`gh api repos/ahl-gram/Vellum/issues/854/comments --paginate | jq length`), the newest 6529508430.
- **Applies to:** branch `feat/854-shape-links` at 95006e885d74c4f008b641c0fc307f4b763ba0af (PR #1128). This is a delta on that branch, built in the same pull request.
- **Rulings:** Issue #854 comment 6529508430 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6529508430), Alex, 2026-10-30: "Fix it in this pull request (Recommended)". The form of the guard was left to the planner ("the checks (or whatever guard the planner finds right)"), so the form is this plan's call 1, not a menu item.
- **Open decisions:** none.
- **Revision number:** 1. `git ls-tree -r --name-only origin/feat/854-shape-links -- handbook/plans/800/854/` lists only `854-plan.md`; `git ls-tree -r --name-only origin/main -- handbook/plans/800/854/` lists nothing; the issue's two `Plan archive, not a ruling:` comments (6527067315, 6527068984) are parts 1 and 2 of `854-plan.md`. So `k` is 1.

## What the finding asks, and what this revision does not touch

The finding: two mutations stay green on the branch. `landKeysNow` skipping `gateLand` would put a touched land into a shaped world's link and sheet; `landKeysNow` passing a constant `"archipelago"` to `drawnShape` would keep a count after the type menu leaves the archipelago. The pure halves are already pinned by unit tests ("drawnShape drops a count off the archipelago, keeps an outline on every type, and spells the defaults" in `test/site/shape-address.test.ts`; "readWorldKeys carries the shape keys, and leaves out a land and a coast that draw nothing beside them" in `test/site/address-grammar.test.ts`). What has no guard is the glue that feeds them the live controls, and the two places that glue reaches: the link (`writeHash`) and the draw (`draftOverrides`, whose overrides are also the ones `landInPlace` in `src/site/explorer/app.ts` hands to `lastSheet` and `glass.setWorld`, which the Chart Table's sheet is cut from).

**No behaviour bug.** The checks below pass on the branch as built (three runs each, Readings), so the guard exposes nothing to fix; it only holds what design 2 and design 10 of `854-plan.md` already built.

## Recon, and what it changed (workflow step 5)

`vellum-spec-recon` ran on the 15 claims this revision rests on, read against `origin/feat/854-shape-links` at 95006e88: 12 CURRENT, 3 STALE, 0 UNVERIFIABLE. Folded:

- **STALE, blocking for the design:** `data-vellum-land-fraction` is written on every chart, unconditionally (`src/render/recipe-meta.ts` line 27), so its presence says nothing about an override. PRW7 therefore compares the stamp's VALUE before and after the move (0.34 against the 0.15 the move asks for), never whether the attribute is present.
- **STALE, cosmetic:** `T1g` and `T2a` are plan labels, not test titles; the titles are quoted above. A unit test does stub `getElementById` (`test/site/by-id.test.ts`, to test `$()` itself), so a unit test of `landKeysNow` is reachable; call 1 says why the guard is still the browser.
- **CURRENT and carried as fact:** `draw()` in `src/site/explorer/app.ts` writes `#status` to `Drafting…`, disables `#verso-turn` (`motion.setDrawing(true)`) and calls `syncHash()` synchronously, before `draftOverrides`; a failed draw writes `The cartographer spilled the ink: ` and the error to `#status` and re-enables the turn; a `change` on `#land` sets `touched.land` and draws, a `change` on `#type` clears both touched gates and draws (`src/site/explorer/controls.ts`); the engine's refusal of a count off the archipelago reads `a count needs the archipelago, got island`; `makeStep` names one red per step and records a throw as `<step> never reached its assertion`; PR40 and PR36 navigate for themselves, so nothing after PRW5 reads the page it leaves; `print-room` needs `hunt` before it in any selection (`NEEDS_PREDECESSOR` in `e2e/support/suites.ts`); the proof runner reads a red's id as the first word of its check name (`e2eOutcome` in `scripts/proof-runner/outcome.ts`).

Since main moved from the branch's base (108f8db6) to 31f2e289, `git diff --stat 108f8db6 origin/main -- e2e src scripts test test-support .github eslint.config.ts package.json` names only `e2e/suites/home/drift.ts`, `e2e/support/skips.ts` and `test/e2e/home-waits.test.ts`, none of which this revision reads or edits.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:
- `handbook/specs/settle-doctrine.md`: clauses 3 to 6, 8 (what `waitSettled` keys on) and 9 (through `about:blank`); clause 11's precondition (nothing later reads what these steps leave).
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read".
- `handbook/specs/development-workflow.md`: step 11 (the CI proof runner, BITES and NEEDS READ) and step 15 (a guard added after the prover's round is proven by the implementing session).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 2 before typing the checks (items 5, 6, 7, 8, 9, 16 and 17 bind here); Gate 5 before the push and the body edit.
- `handbook/specs/conventions.md`: the comment doctrine (the one comment this revision adds is one line, at the wait).

## The design

1. **Two browser checks in `e2e/suites/print-room/link.ts`, each in its own step with its own navigation.**
   - **PRW7, a shaped world.** Open the Explorer at `PLACE_HASH` (Texas, looseness 50, no type) through `explorerAt`; move sea level by setting `#land` to `150` and dispatching `change`; wait for that draw to end; assert the draw succeeded on a fresh sheet, the link still equals `PLACE_HASH` exactly, and the sheet's `data-vellum-land-fraction` is the value it had before the move. A leak through `writeHash` shows in the link (`land=150`), a leak through `draftOverrides` in the stamp (`0.15`).
   - **PRW8, a counted world.** Open the Explorer at `COUNT_HASH` (seed 1, archipelago, 20 isles, varied, raggedness 40) through `explorerAt`; set `#type` to `island` and dispatch `change`; wait for that draw to end; assert the draw succeeded on a fresh sheet carrying no `data-vellum-islands` and `data-vellum-map-type="island"`, and the link equals `#seed=1&style=antique&type=island&legend=1&arms=0&beasts=0` exactly. A count kept past the type change is refused by the engine, so it shows as the status line's error, a stale sheet, and `islands=20` in the link.
2. **The wait ends when the draw ends, either way.** `redrawAfter` dispatches the move, then polls with `makeSettle` (`e2e/support/settle.ts`, its default budget) until `#status` is no longer `Drafting…`, `#verso-turn` is enabled and a sheet is mounted, and only then reads. The departure is the synchronous `Drafting…` that `draw()` writes inside the dispatch, read in the same evaluate as `started` and asserted by the check, so the pre-move state (status empty, turn enabled) can never satisfy the wait unless the draw never started, which reds the check on `started`. The predicate never carries the claim (clause 6): it accepts the error line as readily as the empty one, and the check asserts which it was.
3. **The old sheet is marked before the move** (`data-prw-old` on `#map > svg[data-vellum-style]`), so `fresh` reads that this draw mounted a new sheet, and a refused draw, which leaves the old sheet in place, fails `fresh` as well as the status.
4. **A witness that the fixture reaches its case.** PRW7 asserts the stamp's land fraction before the move is not `0.15` (it is `0.34` on seed 42's Texas), so a world whose own land fraction happened to equal the move could not pass vacuously.

### Rejected, with the reason

- **A unit test of `landKeysNow`.** It is reachable (a `getElementById` stub, as `test/site/by-id.test.ts` writes one, lets `hash-sync.ts` load in Node), but it would see `landKeysNow` alone: `draftOverrides` sits behind `src/site/explorer/app-wiring.ts`'s import graph (`elements.ts`, `worker-client.ts`, the Glass), and the browser pair already bites all three mutations, the `draftOverrides` leak included, with one instrument. A unit test on top would duplicate PRW7 for one function. Call 1.
- **`waitSettled` as the wait** (the R11 and R13 form in `e2e/suites/render.ts`). It waits for an empty status line, which a refused draw never gives, so under the second mutation it throws after about 10 s and the proof row reads NEEDS READ, a person's read, instead of BITES. Measured: with `redrawAfter` the same mutation reds PRW8 on its assertion in 644 ms (Readings). Call 3.
- **Only the link, as the skeptic proposed.** A leak in `draftOverrides` itself (third mutation) leaves the link byte-identical and moves only the stamp (Readings), and the finding names `draftOverrides` as unguarded. Call 2.
- **Folding the checks into the existing steps "PRW3, PRW4" and "PRW5".** A throw in the new wait would stop PRW4 too, and `prwPlace` at 35 lines cannot take 15 more under the lint's 50-line function limit. Call 4.
- **The checks in `e2e/suites/render.ts` beside R11c.** `PLACE_HASH`, `COUNT_HASH` and `explorerAt` live in `link.ts`, unexported; the render suite's checks share one long-lived Explorer page whose controls each step leaves set.

## Files

| file | change |
|---|---|
| `handbook/plans/800/854/854-r1-plan.md` | created: this file, copied unchanged from the scratchpad |
| `e2e/suites/print-room/link.ts` (187 lines, 257 after) | two import lines; the block below appended after `prwCount` |
| `e2e/suites/print-room.ts` (99 lines, 101 after) | the import names two more functions; two steps added |

No file under `src/`, `test/`, `test-support/` or `scripts/` changes. No roster is joined: no new suite, page, bundle or test file (`handbook/specs/site-architecture.md`'s list). No spec line changes: the rule the checks hold is already written ("A recipe field is spelt one way in every address", `handbook/specs/explorer-doctrine.md`).

**`e2e/suites/print-room/link.ts`**, line 1, `import type { SuiteContext } from "../../types.ts";`, becomes these two lines:

```ts
import { makeSettle } from "../../support/settle.ts";
import type { Payload, SuiteContext } from "../../types.ts";
```

and this block is appended after `prwCount`'s closing brace (a blank line between). It is the planner's text exactly: type-checked with `npx tsc --noEmit -p out/854-dry-run/tsconfig.854r1.json` (exit 0), formatted (`npx prettier --ignore-path /dev/null --check`, clean) and linted at its path (`npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 --stdin --stdin-filename e2e/suites/print-room/link.ts < out/854-dry-run/854r1-link-at-path.ts`, exit 0, with a control copy carrying a bare `sleep` red on `vellum/e2e-sleep-inside-poll`). Copy it; do not retype it.

```ts
const DRAFTING = "Drafting…";
const FLOOD = "150";
const ISLAND_HASH = "#seed=1&style=antique&type=island&legend=1&arms=0&beasts=0";

type Moved = { started: boolean; before: string | null };
type Resolved = { status: string; dis: boolean; map: boolean };
type Redrawn = {
  status: string;
  fresh: boolean;
  land: string | null;
  outline: string | null;
  islands: string | null;
  mapType: string | null;
  hash: string;
};

const MOVE_LAND: Payload<Moved> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]");const before=svg?svg.getAttribute("data-vellum-land-fraction"):null;if(svg)svg.setAttribute("data-prw-old","");const l=document.getElementById("land");l.value="${FLOOD}";l.dispatchEvent(new Event("change",{bubbles:true}));return{before,started:document.getElementById("status").textContent==="${DRAFTING}"};})()`;
const PICK_ISLAND: Payload<Moved> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]");if(svg)svg.setAttribute("data-prw-old","");const t=document.getElementById("type");t.value="island";t.dispatchEvent(new Event("change",{bubbles:true}));return{before:null,started:document.getElementById("status").textContent==="${DRAFTING}"};})()`;
const RESOLVED: Payload<Resolved> = `({status:document.getElementById("status").textContent,dis:document.getElementById("verso-turn").disabled,map:!!document.querySelector("#map > svg[data-vellum-style]")})`;
const REDRAWN: Payload<Redrawn> = `(()=>{const svg=document.querySelector("#map > svg[data-vellum-style]"),at=(n)=>svg?svg.getAttribute("data-vellum-"+n):null;return{status:document.getElementById("status").textContent,fresh:!!svg&&!svg.hasAttribute("data-prw-old"),land:at("land-fraction"),outline:at("outline"),islands:at("islands"),mapType:at("map-type"),hash:location.hash.replace(/&table=[^&]*/,"")};})()`;

// Waits for the draw to end either way, never on waitSettled, so a draw the engine refuses reds the check on its own status line instead of timing the wait out.
async function redrawAfter(
  ctx: SuiteContext,
  move: Payload<Moved>,
  label: string,
): Promise<{ moved: Moved; after: Redrawn }> {
  const settle = makeSettle({ evaluate: ctx.evaluate, sleep: ctx.sleep });
  const moved = await ctx.evaluate(move);
  await settle(RESOLVED, (d) => d.status !== DRAFTING && !d.dis && d.map, label);
  return { moved, after: await ctx.evaluate(REDRAWN) };
}

export async function prwPlaceLand(ctx: SuiteContext): Promise<void> {
  const seen = await explorerAt(ctx, PLACE_HASH);
  const { moved, after } = await redrawAfter(ctx, MOVE_LAND, "PRW7 the land move's draw");
  ctx.check(
    "PRW7 sea level moved on a shaped world stays out of its link and its draw",
    !!seen &&
      seen.outline === PLACE &&
      moved.started &&
      moved.before !== null &&
      moved.before !== String(Number(FLOOD) / 1000) &&
      after.status === "" &&
      after.fresh &&
      after.outline === PLACE &&
      after.land === moved.before &&
      after.hash === PLACE_HASH,
    JSON.stringify({ moved, after }),
  );
}

export async function prwCountType(ctx: SuiteContext): Promise<void> {
  const seen = await explorerAt(ctx, COUNT_HASH);
  const { moved, after } = await redrawAfter(ctx, PICK_ISLAND, "PRW8 the type change's draw");
  ctx.check(
    "PRW8 a counted world turned to an island drops its count from the link and the draw",
    !!seen &&
      seen.islands === "20" &&
      moved.started &&
      after.status === "" &&
      after.fresh &&
      after.islands === null &&
      after.mapType === "island" &&
      after.hash === ISLAND_HASH,
    JSON.stringify({ moved, after }),
  );
}
```

**`e2e/suites/print-room.ts`**: line 5 becomes `import { prlLink, prwCount, prwCountType, prwPlace, prwPlaceLand, prwWarp } from "./print-room/link.ts";`, and the two step lines at 72 and 73 become four:

```ts
  await step("PRW3, PRW4", () => prwPlace(ctx));
  await step("PRW7", () => prwPlaceLand(ctx));
  await step("PRW5", () => prwCount(ctx));
  await step("PRW8", () => prwCountType(ctx));
```

The suite's head comment ("PRW") already covers the codes; it does not change.

## Tests, in the order they are written

No unit test is added or changed. **There is no red-before-green commit**, and none is owed: PRW7 and PRW8 guard behaviour the branch has already built, so each passes on its first run. Their red is shown by the mutations, staged in the planner's dry run (Readings) and proved on the CI proof runner by the implementer (Proof). That is the whole of workflow step 8's "failing test first" for a guard added after its behaviour.

**E11, PRW7** in `e2e/suites/print-room/link.ts`, step `PRW7`: "PRW7 sea level moved on a shaped world stays out of its link and its draw". Assertion as in Files. Mutations, each a proof row: `landKeysNow` skips `gateLand` (reds the link and the stamp); `draftOverrides` adds the slider's land past the gate (reds the stamp alone).

**E12, PRW8** in the same file, step `PRW8`: "PRW8 a counted world turned to an island drops its count from the link and the draw". Assertion as in Files. Mutation, a proof row: `landKeysNow` passes `"archipelago"` to `drawnShape` (reds the status, `fresh`, the stamp and the link).

### Readings (taken by the planner, both off one build, one machine)

The probe is `out/854-dry-run/854r1-probe2.ts` in the planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-ae3ee20fb82ddc50d/out/854-dry-run/854r1-probe2.ts`), run as `node out/854-dry-run/854r1-probe2.ts 3` from that tree's root, on the site `npm run build` made from 95006e885d74c4f008b641c0fc307f4b763ba0af (the tree detached at the branch head). It runs the planned PRW7 and PRW8 themselves (`out/854-dry-run/854r1-link.ts`, the branch's `link.ts` plus the block above) inside `makeStep`, through `start` in `e2e/harness.ts`, the fixture three times and each mutation once. Each mutation is staged by replacing its text in the BUILT bundle `dist/explorer/app.bundle.js` the harness serves (never in source), the bundle restored after every arm (the log's `bundle restored: true`). Log: `out/854-dry-run/854r1-probe2.log`. A first probe on the same build, `out/854-dry-run/854r1-probe.ts` (log `854r1-probe.log`), ran the same payloads and timed the redraw alone.

Each check asserts on one world, so each reading is that world's.

- **PRW7, fixture: PASS, three of three.** The nearest it comes to failing is the witness margin: the stamp before the move reads `0.34` against the move's `0.15`.

  ```
  PASS  PRW7 sea level moved on a shaped world stays out of its link and its draw  — {"moved":{"before":"0.34","started":true},"after":{"status":"","fresh":true,"land":"0.34","outline":"ne-1159315211","islands":null,"mapType":"island","hash":"#seed=42&style=antique&legend=1&arms=0&beasts=0&outline=ne-1159315211&looseness=50"}}
  ```

- **PRW7, under `draftOverrides` leaking the land: FAIL**, the mutation reading nearest to passing: the link is byte-identical and only the stamp moves.

  ```
  FAIL  PRW7 sea level moved on a shaped world stays out of its link and its draw  — {"moved":{"before":"0.34","started":true},"after":{"status":"","fresh":true,"land":"0.15","outline":"ne-1159315211","islands":null,"mapType":"island","hash":"#seed=42&style=antique&legend=1&arms=0&beasts=0&outline=ne-1159315211&looseness=50"}}
  ```

  Under `landKeysNow` skipping `gateLand`: FAIL, `"land":"0.15"` and `"hash":"#seed=42&style=antique&legend=1&arms=0&beasts=0&land=150&outline=ne-1159315211&looseness=50"` (log).
- **PRW8, fixture: PASS, three of three**, on its exact link: `"hash":"#seed=1&style=antique&type=island&legend=1&arms=0&beasts=0"`, `"islands":null`, `"mapType":"island"`, `"status":""`, `"fresh":true`.
- **PRW8, under `landKeysNow` passing `"archipelago"`: FAIL on its assertion, not a stop**, in 644 ms:

  ```
  FAIL  PRW8 a counted world turned to an island drops its count from the link and the draw  — {"moved":{"before":null,"started":true},"after":{"status":"The cartographer spilled the ink: a count needs the archipelago, got island","fresh":false,"land":"0.24","outline":null,"islands":"20","mapType":"archipelago","hash":"#seed=1&style=antique&type=island&legend=1&arms=0&beasts=0&islands=20&isleSize=varied&raggedness=40"}}
  ```

- **Each mutation reds only its own check**: PRW8 passes under both land mutations and PRW7 under the constant type (log). No console error, no 4xx, no step stopped (`skipped groups: []`).
- **Time (Gate 2 item 17)**, each step whole, navigation included: PRW7 671 to 696 ms on the fixture, about 1,010 to 1,046 ms where a mutation makes the redraw a new world; PRW8 996 to 1,011 ms. The redraw alone took 65 to 427 ms (first probe). On CI, PRW3 to PRW5 each took about 2.3 s on lane A of run 41096293109 (timestamps of their PASS lines) against about 0.65 s here, so expect PRW7 and PRW8 near 2.5 to 3.5 s each there, and the redraw near 1.5 s against the wait's budget of 120 reads 50 ms apart.

### Proof (owed by the implementer, on the CI proof runner)

The prover's one round on this pull request is spent (commit 78dce497 closed its holes), so under workflow step 15 these checks are a guard added after the round, proven by the implementing session, through the CI proof runner (step 11). The PR body names them "proven by the implementing session only", with the run id. `vellum-guard-prover` is not dispatched, and the cold skeptic is not dispatched again.

Write this list to the scratchpad as `854-r1-proof.json` (each `find` occurs exactly once in its file at 95006e88: `grep -c -F` printed 1 for each) and send it from the tree once the revision's commit is pushed:

```json
[
  {
    "id": "PRW7-landKeysNow-skips-gateLand",
    "edits": [{ "file": "src/site/explorer/hash-sync.ts", "find": "return gateLand({", "replace": "return ({" }],
    "e2e": { "suites": "hunt,print-room", "expect": ["PRW7"] }
  },
  {
    "id": "PRW8-landKeysNow-constant-archipelago",
    "edits": [
      {
        "file": "src/site/explorer/hash-sync.ts",
        "find": "drawnShape(shapeChoice(), controls.typeSel.value)",
        "replace": "drawnShape(shapeChoice(), \"archipelago\")"
      }
    ],
    "e2e": { "suites": "hunt,print-room", "expect": ["PRW8"] }
  },
  {
    "id": "PRW7-draftOverrides-leaks-land",
    "edits": [
      {
        "file": "src/site/explorer/app-wiring.ts",
        "find": "...overridesOfLand(landKeysNow(hashControls, touched.land, touched.coast)) };",
        "replace": "...overridesOfLand(landKeysNow(hashControls, touched.land, touched.coast)), ...(touched.land ? { landFraction: Number(landSlider.value) / 1000 } : {}) };"
      }
    ],
    "e2e": { "suites": "hunt,print-room", "expect": ["PRW7"] }
  }
]
```

Why each row expects only its own check, across the whole of `hunt` and `print-room`: skipping `gateLand` changes the keys only where the shape is a place or a count AND a slider is touched, and only PRW7 touches a slider on such a world (PRW3, PRW4 and PRW5 open their links with no slider touched; `prwWarp`'s `coast=90` is a plain world, where the gate passes everything). The constant `"archipelago"` changes `drawnShape` only where the held choice carries a count and the type menu is not the archipelago, which only PRW8 reaches (`PLACE_HASH` holds no count; `COUNT_HASH` already is the archipelago). The `draftOverrides` leak adds a land only while `touched.land`, and on a plain world it repeats the land `landKeysNow` already carries (`sliderToLand` of a slider value inside 100 to 700 is that value over 1000); only PRW7 touches the land at all in these two suites.

## Order of commits

1. `handbook/plans/800/854/854-r1-plan.md` (this file, unchanged) and the two edits under Files, in one commit, pushed (workflow step 9). Subject: `#854 PRW7 and PRW8: the Explorer leaves a land a shape ignores and a count off the archipelago out of its link and its draw (revision 1)`.
2. Nothing else unless a check or a proof row asks for it, which is a stop condition below, not a second design.

## Rosters and doctrine

None. No list joined (no suite, page, bundle, test file or lint rule), no spec or gate line contradicted, no entry in `e2e/support/skips.ts` or `.claude/skills/vellum-footguns/references/flake-record.md`.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`; `npm test` whole (it reads the e2e files through the repo tests), then `npm run astro:generate`.
- `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`, once, alone, never the full lanes. Quote the `PASS  PRW7` and `PASS  PRW8` lines and the suite's outcome line.
- After the push, CI's lane A log (the lane whose `suites on port` line lists `print-room`): the PASS lines of PRW7 and PRW8 with their timestamps, and the seconds from the line before each, named in the PR body (Gate 2 item 17).
- `npm run proof -- send /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ca724480-6383-4266-b511-508f7438e704/scratchpad/854-r1-proof.json`, then `npm run proof -- read <run>`; the three rows and the run id go in the PR body.
- `vellum-plate-reader` is not owed (no appearance changes).
- The PR body names revision 1 (`handbook/plans/800/854/854-r1-plan.md`) and what it changed against `854-plan.md` (the opening paragraph of this file), lists PRW7 and PRW8 among the browser checks with their proof rows, and says they are proven by the implementing session only.
- A new dated comment on Issue #854 records this revision's calls (below), pointing at comment 6529508430 for the ruling; the step 12 comment 6528036863 is not edited.

## Calls made

The implementer copies these into the new dated comment on the issue.

1. **The guard is two browser checks, not a unit test.** Rule: `handbook/specs/check-placement.md`, the cheapest instrument that can see the rule. A unit test of `landKeysNow` is reachable with a `getElementById` stub, but it would see that one function, while `draftOverrides` sits behind `app-wiring.ts`'s page imports; the browser pair bites all three mutations, and sees the controls' own wiring (the touched gate a `change` sets, `draw()` writing the link before the draw), with one instrument.
2. **Each check asserts the draw's stamp as well as the link.** Rule: the finding names `draftOverrides` beside `landKeysNow`, and a leak in `draftOverrides` alone leaves the link byte-identical (measured, Readings); the stamp is the recipe the draw used, the same overrides the sheet is cut from.
3. **The wait ends when the draw ends, success or refusal, not on `waitSettled`.** Rule: `handbook/specs/development-workflow.md` step 11 (a red on the assertion is BITES; a stop is NEEDS READ, a person's read) and `handbook/specs/settle-doctrine.md` clauses 4 to 6 (the departure is the synchronous `Drafting…`, asserted as `started`; the predicate never carries the claim).
4. **Two new steps, PRW7 after "PRW3, PRW4" and PRW8 after "PRW5", each navigating through `explorerAt`.** Rule: `makeStep` stops a whole step on a throw, so a new wait inside an old step would take PRW4 with it; `max-lines-per-function` 50 in `eslint.config.ts`. The cost is one Explorer open each (about 0.7 s and 1.0 s here, about 2.3 s each on CI).
5. **The wait's budget is `makeSettle`'s default, 120 reads 50 ms apart; no new constant.** Rule: `CLAUDE.md`, "A bound is derived": the redraw measured 65 to 427 ms here, and CI runs this suite's Explorer opens about 3.5 times slower, so about 1.5 s against 6 s; `e2e/suites/broadside.ts` calls the same default the same way.
6. **The move is sea level to 150 (0.15), with the witness that the world's own land fraction differs (0.34).** Rule: `CLAUDE.md`, "A guard that could pass vacuously names the witness that makes it bite".
7. **The proof is the CI proof runner, three rows, each expecting exactly its own check.** Rule: workflow steps 11 and 15; the prover's round on this pull request is spent.
8. **The codes are PRW7 and PRW8.** Rule: the next free numbers of the family (`git grep -n "PRW7\|PRW8" -- e2e src test handbook .claude` prints nothing at 95006e88).

## Open decisions

None. The ruling (comment 6529508430) left the form of the guard to the planner; call 1 is that form, listed so Alex can overrule it.

## Stop conditions

Hand back, with the command and its output, when:
- before this revision's commit, after `git fetch origin feat/854-shape-links`, `git ls-remote origin refs/heads/feat/854-shape-links` prints a head other than 95006e885d74c4f008b641c0fc307f4b763ba0af and `git diff --stat 95006e88 origin/feat/854-shape-links -- e2e/suites/print-room/link.ts e2e/suites/print-room.ts src/site/explorer/hash-sync.ts src/site/explorer/app-wiring.ts src/site/explorer/controls.ts src/site/explorer/app.ts` prints anything (the revision's own commit changes two of those files, and is not a reason to stop);
- `git diff --stat 31f2e2898024d7ee8a45dcae91fb5ceb0002e84c origin/main -- e2e/suites/print-room/link.ts e2e/suites/print-room.ts e2e/support/settle.ts e2e/support/step.ts e2e/harness.ts src/site/explorer/hash-sync.ts src/site/explorer/app-wiring.ts src/site/explorer/controls.ts src/site/explorer/app.ts` prints anything;
- `explorerAt`, `PLACE`, `PLACE_HASH`, `COUNT_HASH` or `prwCount` is not in `e2e/suites/print-room/link.ts` as named, or `e2e/suites/print-room.ts` line 5 or lines 72 and 73 are not as quoted under Files;
- any of the three `find` strings does not occur exactly once in its file;
- `npm run check`, `npm run lint` or `npm run format:check` reds on either file. The planner's `link.ts` text passed all three; its `print-room.ts` text passed the type check and the format check but was never linted, since a lint of it read from stdin cannot resolve the new exports from `link.ts` on disk. A red on `link.ts` means the text was not copied as written, or the branch moved; a lint red on `print-room.ts` means `vellum/e2e-throw-inside-step` does not follow the new calls into `link.ts` the way this plan assumes, and is a hand-back too;
- in the local `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`, PRW7 or PRW8 is FAIL or `never reached its assertion`, or either step takes more than 10 s, or any other check of either suite reds (every one passed on CI at 95006e88, lane A of run 41096293109);
- a proof row comes back anything but BITES (a HOLE, NEEDS READ, INCONCLUSIVE or NOT APPLIED; or IMPRECISE, since the rows above argue each mutation reds its own check and no other, so a second red means the argument is wrong);
- PRW7 or PRW8 is red on CI: read it as `.claude/agents/vellum-implementer.md` says before anything else.
