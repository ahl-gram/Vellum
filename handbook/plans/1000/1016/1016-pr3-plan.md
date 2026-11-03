# Issue #1016 plan: pull request 3 of 4, every page hop written once

**Planned at**: `origin/main` d95e2c47 (`git ls-remote origin refs/heads/main`, re-read after the rulings were folded in), Issue #1016 at 8 comments (`gh api repos/ahl-gram/Vellum/issues/1016/comments | jq length`: the rulings 6593146850, the archive of pull request 1's plan 6593184197, pull request 1's step 12 calls 6593424659, the dispatcher's call on pull request 2's name 6600173679, the archive of pull request 2's plan 6600192872, pull request 2's step 12 calls 6600428734, Alex's clearance and his confirmation of `sendKey` 6602630928, Alex's ruling on this plan's names 6603415150). Read beside it: the archived plans `handbook/plans/1000/1016/1016-plan.md` (its sketch "Pull request 3, the hops", "The guard", Calls 6 and 11) and `handbook/plans/1000/1016/1016-pr2-plan.md` (Calls 8 to 10); the bodies of PR #1208 and PR #1212 (0 comments each); Issue #1209 (0 comments), Issue #1214 (0 comments), Issue #1213 (0 comments), Issue #1211 (1 comment, Alex's ruling of 2026-11-03, 6603415522).

**Rulings**: Alex, 2026-11-02, ruling 1 of https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6593146850 is this pull request's scope: "page hops (about 47)", one kind of browser message per pull request, an automatic check after it refusing any new hand-written copy, planned by its own planner. His standing clearance to plan, build and merge the four pull requests in order is recorded at https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6602630928. This plan's one menu item, the names of the new helper and of the empty page's address, Alex answered on 2026-11-03 at https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6603415150: "leaveBlank and ABOUT_BLANK" (the planner's option B, not its recommended `blank` and `BLANK`). Every name in this plan, its two tools, its tests and its mutations is his; the tools were re-run under them (below). On Issue #1211, at https://github.com/ahl-gram/Vellum/issues/1211#issuecomment-6603415522, he ruled that P24 is fixed in its own small pull request and is not pulled out of the run meanwhile; that fix edits `e2e/suites/cards/cap.ts` too, so the two builds are sequenced, this one first (Evidence, the P24 bullet).

**Open decisions**: none.

## Specs

The implementer reads these, at these sections, on top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 9 (this pull request edits its last sentence), clause 4 (a readiness wait throws inside a step; `vellum/e2e-throw-inside-step`), clauses 11 and 12 (a flake issue, a flake row; for P24 below), clause 14 (a suite hands the next a page at readiness), "When a check is pulled out of the run" (the bullet "Who finds a slow step": no step is added or made longer here), and "The environment" (the bullets on the built site, on ports, and "A run deletes its own browser profile only if it is allowed to finish").
- `handbook/specs/check-placement.md`: "The lint" (a house rule is proven by its own test running ESLint over a fixture it refuses and one it passes) and "The unit suite".
- `handbook/specs/conventions.md`: "How a spec, and the rest of the house's prose, is written" (the one spec edit), "How code is cited", and the comment rules.
- `handbook/specs/development-workflow.md`: steps 7 to 15.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (items 1, 3, 9, 16, 21), Gate 2 (items 10, 11), Gate 4, Gate 5 (items 1, 2, 5, 7).

## Recon

`vellum-spec-recon` at d95e2c47, against Issue #1016, the sketch in pull request 1's plan, Issue #1209 and Issue #1214: 2 STALE, both cosmetic and neither changing the plan; 2 UNVERIFIABLE, one settled here (whether a test pins the four arrivals' messages) and one about a line this pull request does not touch (whether anything reads `Page.reload` in `e2e/suites/writing-room/kit.ts`); every other cited path, line, count and test CURRENT.

- **CURRENT, the counts.** 85 lines spell `url: "about:blank"` under `e2e/` (`git grep -n -F 'url: "about:blank"' -- e2e | wc -l`), one of them `bounce` in `e2e/support/nav.ts`, so 84 hand-written hops in 48 files; 96 lines in 52 files name `about:blank` at all (`git grep -n -F 'about:blank' -- e2e | wc -l`, and `-l ... | wc -l`; recon printed 97, one off), the other 11 being the harness's launch argument (`e2e/harness.ts:266`) and 10 comments. The issue's "about 80 in 46 files" and the ruling's "about 47" are the same population, grown.
- **CURRENT, every shape the sketch names**: the pages left blank (`broadside/room.ts:222`, `reading-room/room.ts:114`, `chart-drawer/room.ts:108`, each in a `finally`, and `stage/frame.ts:172`, straight-line in `ea8Pinched`); blank, then a helper that navigates itself (`landfall.ts:127,134` before `settleHome`; `runninghead.ts:87` and `runninghead/gallery.ts:14,321` before `visit`); `handBack` in `e2e/support/fingerprint-probe.ts:132-136` with `signal.throwIfAborted()` between its two navigates, pinned by `test/e2e/fingerprint-probe.test.ts:58,219,239`; set-up before a hop (`chart-drawer/homes.ts:161` seeds storage, `cards/kit.ts:12` sets the metrics); clause 9's citation of `goto` in `e2e/support/room.ts` (`handbook/specs/settle-doctrine.md:130`), the only spec line naming that file.
- **STALE, cosmetic**: `cards/kit.ts:13` is the comment, the metrics are set at `:12` and the hop is `:14`; the reading-room fallback order test is `test/repo/e2e-tiers.test.ts:127-139` ("both fallback checks tell the server to refuse the worker before they read the page"), not `:126-138`. Neither changes the plan.
- **Issue #1209, CURRENT**: the four arrivals (`git grep -n -E "waitReady\(\)[^;]" -- e2e/suites/cards`: `cap.ts:288`, `cap.ts:318`, `hold.ts:77`, `kit.ts:16`) are each a bounce then `if (!(await waitReady())) throw new Error(...)`, none followed by `waitSettled`, so each is `bounce` plus `explorerUp`, not `toExplorer`. `z23SurveyOverlay` (`e2e/suites/zoom/dress.ts:34-45`) polls `INKED` (`e2e/suites/zoom/reads.ts:9-10`, a non-empty `points`) and hands a boolean to a `check`, a different wait, as the issue says.
- **Issue #1214, CURRENT**: `scripts/lint/e2e-scripts-off.ts` (29 lines) and `test/repo/e2e-scripts-off.test.ts` (85 lines) are named only in `eslint.config.ts:13,34,265` (`git grep -n "e2e-scripts-off\|e2eScriptsOff" -- . ':!handbook/plans'`); no spec, gate or agent line names either rule (`git grep -n -i "withScriptsOff\|CDP_HOMES\|e2e-cdp\|e2e-scripts-off" -- handbook/specs .claude CLAUDE.md AGENTS.md` prints nothing).
- **UNVERIFIABLE in the ledger, settled here**: whether a test pins the four arrivals' messages. `git grep -n "never drew" -- . ':!handbook/plans' ':!e2e'` prints only `test/e2e/room-kit-waits.test.ts:69`, the prospect and ribbon kits' own settle message, so nothing pins these four.
- **Surfaced by recon, taken as calls below**: the names of the second helper and the constant (put on the menu, and ruled by Alex: the Rulings line); whether to fold Issue #1214 (the issue leaves it to this planner); the exact labels of the four arrivals; the reach of `bounce` to `handBack`.

Rejected recon finding: none.

## The design

### Two helpers and one constant in `e2e/support/nav.ts`

```ts
// The hop to a fresh address: a navigate that differs only in the hash is same-document and never re-boots a page, so every fresh address arrives through about:blank (settle-doctrine clause 9).
import type { SuiteContext } from "../types.ts";

export const ABOUT_BLANK = "about:blank";

export const leaveBlank = async (send: SuiteContext["send"]): Promise<void> => {
  await send("Page.navigate", { url: ABOUT_BLANK });
};

export const bounce = async (send: SuiteContext["send"], url: string): Promise<void> => {
  await leaveBlank(send);
  await send("Page.navigate", { url });
};
```

`bounce` keeps its name and signature (pull request 1, ruling 4); `leaveBlank` is the half of a hop that a site needs alone; `ABOUT_BLANK` is the address, exported for the one place that is not a navigate, the harness's launch argument. The header line is pull request 1's, unchanged.

### Every hop, by its shape

The 84 hand-written hops fall into six shapes. Each keeps the same `Page.navigate` messages, through the same `send`, in the same order, with every statement around it where it was:

| shape | sites | becomes |
|---|---|---|
| blank, then the address, on the next statement | 74 in 43 files (73 adjacent at d95e2c47, one after the reorder in the fifth row) | `await bounce(<send>, <url>);` |
| the page left blank | 4: `br9Authored`'s `finally` (`broadside/room.ts:222`), `cd55WhereAuthored`'s `finally` (`chart-drawer/room.ts:108`), `rr38Authored`'s `finally` (`reading-room/room.ts:114`), `ea8Pinched` (`stage/frame.ts:172`) | `await leaveBlank(<send>);` |
| blank, then a helper that navigates itself | 5: `l9Touch` before `settleHome` twice (`landfall.ts:127,134`), before `visit` (`runninghead.ts:87`, `runninghead/gallery.ts:14,321`) | `await leaveBlank(<send>);`, the helper's call unchanged |
| `handBack`, an abort check between the two navigates | 1 (`e2e/support/fingerprint-probe.ts:133`) | `await leaveBlank(ctx.send);`, then `signal.throwIfAborted();` and the second navigate as they are |
| a pure constant between the two navigates | 1 (`cd64PlaceSheet`, `chart-drawer/portfolio.ts:385-388`) | the `const sheet = ...` moves above the hop, then `await bounce(send, ...)` |
| the browser's launch argument | 1 (`e2e/harness.ts:266`) | `ABOUT_BLANK`, imported from `./support/nav.ts` |

Of the 74 bounces, 13 go to `/explorer/`, 11 to `/reading-room/`, 9 to `/`, 8 to `/explorer/portfolio/`, 6 to `/print-room/`, and the rest to an address a kit builds (`node out/1016-pr3-dry-run/hops-codemod.ts --dry`, its `PAIR` lines). None is an Explorer arrival `toExplorer` covers: pull request 1 moved the six that were (bounce, `waitReady`, `waitSettled`), and each Explorer bounce left waits on its own signal (`atExplorer`, a `SEEN` poll, a fonts settle, a seed read). The four that assert the ready answer are Issue #1209's, below. No hop site sends `Page.enable` (`git grep -n "Page.enable" -- e2e` prints only `e2e/harness.ts:335`), no hop site switches the redraft between its two navigates (the three redraft switches are `toExplorer`'s `onReady` hooks, untouched), and every set-up that precedes a hop (a metrics override, a touch emulation, a storage seed, a forget) stays before it, since no statement moves but `cd64PlaceSheet`'s constant.

**Issue #1209's four arrivals** become `bounce` then `explorerUp`, keeping each message's label: `explorerUp({ waitReady }, "P24 at 1280x800")` in `p24NothingToScroll`, `explorerUp({ waitReady }, "P restore")` in `pRestore` (both `e2e/suites/cards/cap.ts`), `explorerUp({ waitReady }, "the hold kit at 1024")` in `holdKit`'s `boot` (`e2e/suites/cards/hold.ts`), and ``explorerUp({ waitReady }, `P19 at ${width}`)`` in `sweepAt` (`e2e/suites/cards/kit.ts`). The waits and the throw are the same (`waitReady` once, a throw on `false`); only the thrown text changes, from "P24 the explorer never drew at 1280x800" to "the Explorer never answered ready: P24 at 1280x800" and likewise. Each site already destructures `waitReady`, which `{ waitReady }` keeps in use, so no destructuring changes. `vellum/e2e-throw-inside-step` reads `explorerUp` as a thrower as it read the inline `throw`, so every site's step standing is unchanged.

**What stays as it is**: the two `/faq/` hops (`e2e/suites/prospect/kit.ts:52`, `e2e/suites/ribbon/kit.ts:39`; pull request 1's Call 6, pinned by `test/e2e/room-kit-waits.test.ts:54,62`); the two `Page.reload`s (`e2e/suites/fallback.ts:15`, `e2e/suites/writing-room/kit.ts:97`), which are not hops; the first arrivals and hash-only navigates with no blank before them (`handbook/errata/guards.md`'s PR #701 row records two; giving them a bounce changes what a check does); `z23SurveyOverlay`'s ink poll (Issue #1209 records it as deliberately not folded); `zSetup`'s ready assertion in `e2e/suites/zoom/camera.ts:12` (Calls made, 6).

### The guard: one more row, and Issue #1214's twin folded in

`scripts/lint/e2e-cdp-helpers.ts` gains two rows, `"about:blank"` to `e2e/support/nav.ts` and `"Emulation.setScriptExecutionDisabled"` to `e2e/support/scripts-off.ts`, and a map of reasons so the scripts-off refusal keeps saying why it has one home. `CDP_HOMES` keeps its type, so T9 iterates the new rows untouched:

```ts
import type { Rule } from "eslint";
import { relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
export const CDP_HOMES: ReadonlyMap<string, string> = new Map([
  ["Input.dispatchKeyEvent", "e2e/support/input.ts"],
  ["about:blank", "e2e/support/nav.ts"],
  ["Emulation.setScriptExecutionDisabled", "e2e/support/scripts-off.ts"],
]);
const ONCE = "where it is written once (Issue #1016)";
const WHY: ReadonlyMap<string, string> = new Map([
  [
    "Emulation.setScriptExecutionDisabled",
    "whose withScriptsOff always turns page scripts back on, so no check can leave every check after it with scripts off (Issue #779)",
  ],
]);

const cdpThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found: "an e2e file sends {{spelling}} only through its helpers in {{home}}, {{why}}",
    },
  },
  create(context) {
    const file = relative(ROOT, context.filename).split(sep).join("/");
    const refuse = (node: Rule.Node, spelling: unknown): void => {
      if (typeof spelling !== "string") return;
      const home = CDP_HOMES.get(spelling);
      if (home !== undefined && home !== file)
        context.report({ node, messageId: "found", data: { spelling, home, why: WHY.get(spelling) ?? ONCE } });
    };
    return {
      Literal(node) {
        refuse(node, node.value);
      },
      TemplateLiteral(node) {
        if (node.expressions.length === 0) refuse(node, node.quasis[0]?.value.cooked);
      },
    };
  },
};

export default { rules: { "e2e-cdp-through-helper": cdpThroughHelper } };
```

The key row's message is byte for byte what it was ("... where it is written once (Issue #1016)"). The old rule `vellum/e2e-scripts-off-through-helper`, its module, its wiring and its test go; its whole plant moves into `test/repo/e2e-cdp-helpers.test.ts` (T11), so no instrument is lost (Gate 1 item 21): its second test, the sweep that the rule resolves at error on every e2e file, goes with the rule it swept, and T8 is the same sweep for the rule that remains.

**Why the fold is in this pull request** (Issue #1214 leaves it to "the planner of whichever comes first"): this pull request already edits the rule and its test for its own row, and the fold measured cheap on the spike (below): `scripts/lint/e2e-scripts-off.ts` -29 and `test/repo/e2e-scripts-off.test.ts` -85 lines; `eslint.config.ts` -2 lines and one line edited; `scripts/lint/e2e-cdp-helpers.ts` 33 to 44 lines; `test/repo/e2e-cdp-helpers.test.ts` gains the moved plant and its test (71 lines, lines 144 to 214 of the spike, `out/1016-pr3-dry-run/e2e-cdp-helpers.test.spike.ts`) beside the hop test and its two helpers (50 lines, 93 to 142). Net for the fold alone, about -35 lines (-29, -85, -2, then about +10 in the rule and +71 in the test), and one rule where there were two over one shape. The whole spike, tools aside: 56 files, 303 insertions, 299 deletions (`out/1016-pr3-dry-run/spike.stat`).

**Blind spots, each erring toward missing a copy** (declared in T10): the address assembled from pieces or from a template holding an expression; `ABOUT_BLANK` imported and handed to a raw `Page.navigate`; and a hop written by hand on top of `leaveBlank` or `bounce` (`handBack` is the one deliberate instance: its abort check has to sit between the navigates). Review holds those.

**What the rule's shape cannot take later (for Issue #1213)**: a row matches a whole literal, and the 35 in-page `KeyboardEvent` dispatches sit inside larger `evaluate` payload strings (`git grep -c "new KeyboardEvent" -- e2e` lists 19 files), so no row of `CDP_HOMES` can match them; a guard there needs a substring mode the rule does not have, which is Issue #1213's ruling to take.

### Alternatives rejected

- **A per-room arrival helper** (`toReadingRoom`, `toPrintRoom`, ...). Each room's hop is followed by its own wait (the 11 reading-room bounces by `boot()`, `settled()` or a custom poll, the print-room ones by their own `SEEN`-shaped polls), so a shared arrival would either change the waits or take the wait as an argument, a bounce in a costume (pull request 1's rejection of a shared `goto`). `makeRoom`'s `goto` is already the Reading Room's arrival and now calls `bounce`.
- **A `fresh` option on `visit` and `settleHome`.** It changes what their other callers send, or adds an option for five sites; `leaveBlank` before them sends exactly what the sites send today.
- **`handBack` through `bounce`.** Its abort check must stand between the navigates, which `test/e2e/fingerprint-probe.test.ts:239` ("the hand-back navigated after its bound") pins.
- **The constant alone, with no function** (the menu's option C), and **the names `blank` and `BLANK`** (option A). Alex ruled option B, `leaveBlank` and `ABOUT_BLANK` (the Rulings line).
- **Folding `z23SurveyOverlay`'s ink poll into `waitInked`.** Its predicate needs a non-empty `points`, where `waitInked`'s floor of 1 counts an empty one; it hands a boolean to a `check` instead of throwing; and it is not a hop. Issue #1209 records it as deliberately not folded.
- **A per-row object in `CDP_HOMES`** (`{ home, why }`). It changes the map's shape pull request 2 set and T9's loop; the separate `WHY` map leaves both alone.
- **A browser probe of the helpers**, as pull request 2's `keys-probe` had. A browser cannot tell two identical message sequences apart, and pull request 2's probe admitted it never read the edited sites. Part A below reads every e2e file instead, with controls in the same run.
- **Splitting `e2e/suites/stage/stage.ts`** (426 lines by `wc -l` before and after, 391 by the lint's `max-lines` count). It is within the house's ceiling as the lint measures it, this pull request does not change its length, and a split would move helpers ten files import (Calls made, 12).
- **Running every touched suite locally** (about 1,430 CI seconds by `MEASURED_SECONDS`, `zoom` before `zoom-gestures`). The 74 bounces are the codemod's, held file by file by part A; the local runs are the suites whose sites took another shape.

## Files

### New (tools, never committed)

The implementer writes these two files from the fenced blocks under "The codemod and the check" into its tree's `out/1016-pr3-dry-run/`, byte for byte. `out/` is gitignored; the PR body pastes their summary lines.

### Edited

1. **`e2e/support/nav.ts`**: as under "Two helpers and one constant" (8 lines to 13).
2. **The 48 hop files and `e2e/harness.ts`**, exactly what the codemod writes, then `npm run format`. Per file, from `out/1016-pr3-dry-run/hops-codemod.log` (pairs to `bounce`, lone blanks to `leaveBlank`, exact edits; each file also gains one import line, `import { bounce, leaveBlank } from "<relative>/support/nav.ts";` naming only the names it uses, after its last import, and the four cards edits add `import { explorerUp } from "../../support/explorer.ts";` after that):

   | file | bounce | leaveBlank | exact edits |
   |---|---|---|---|
   | `e2e/harness.ts` | 0 | 0 | the launch argument to `ABOUT_BLANK` (imports `{ ABOUT_BLANK }`) |
   | `e2e/suites/broadside/kit.ts` | 1 (`gotoPlain`, the shorthand `{ url }`) | 0 | |
   | `e2e/suites/broadside/room.ts` | 1 | 1 | |
   | `e2e/suites/cards/cap.ts` | 2 | 0 | P24 and P restore to `explorerUp` |
   | `e2e/suites/cards/hold.ts` | 1 | 0 | the 1024 boot to `explorerUp` |
   | `e2e/suites/cards/kit.ts` | 1 | 0 | P19 to `explorerUp` |
   | `e2e/suites/chart-drawer/homes.ts` | 3 | 0 | |
   | `e2e/suites/chart-drawer/kit.ts` | 1 | 0 | |
   | `e2e/suites/chart-drawer/portfolio.ts` | 5 | 0 | `cd64PlaceSheet`'s `const sheet` moved above its hop |
   | `e2e/suites/chart-drawer/prospect.ts` | 4 | 0 | |
   | `e2e/suites/chart-drawer/room.ts` | 3 | 1 | |
   | `e2e/suites/cluster/desk-notice.ts` | 1 | 0 | |
   | `e2e/suites/cluster/trail.ts` | 1 | 0 | |
   | `e2e/suites/corners.ts` | 2 | 0 | |
   | `e2e/suites/corners/floor.ts` | 1 | 0 | |
   | `e2e/suites/corners/top-row.ts` | 1 | 0 | |
   | `e2e/suites/document-rooms.ts` | 1 | 0 | |
   | `e2e/suites/document-rooms/landmark.ts` | 1 | 0 | |
   | `e2e/suites/home/ceremony.ts` | 4 | 0 | |
   | `e2e/suites/home/doors.ts` | 4 | 0 | |
   | `e2e/suites/home/floor.ts` | 1 | 0 | |
   | `e2e/suites/hunt/former.ts` | 1 | 0 | |
   | `e2e/suites/landfall.ts` | 0 | 2 | |
   | `e2e/suites/landfall/seed.ts` | 3 | 0 | |
   | `e2e/suites/print-room/fallback.ts` | 1 | 0 | |
   | `e2e/suites/print-room/link.ts` | 2 | 0 | |
   | `e2e/suites/print-room/proof.ts` | 1 | 0 | |
   | `e2e/suites/print-room/room.ts` | 1 | 0 | |
   | `e2e/suites/print-room/runner-layout.ts` | 1 | 0 | |
   | `e2e/suites/prospect/room.ts` | 2 | 0 | |
   | `e2e/suites/reading-room/addresses.ts` | 4 | 0 | |
   | `e2e/suites/reading-room/arm.ts` | 2 | 0 | |
   | `e2e/suites/reading-room/fallback.ts` | 1 | 0 | |
   | `e2e/suites/reading-room/room.ts` | 1 | 1 | |
   | `e2e/suites/reading-room/scrub.ts` | 1 | 0 | |
   | `e2e/suites/room-voyage-route.ts` | 1 | 0 | |
   | `e2e/suites/runninghead.ts` | 0 | 1 | |
   | `e2e/suites/runninghead/gallery.ts` | 0 | 2 | |
   | `e2e/suites/specimen/kit.ts` | 1 | 0 | its "Bounce through about:blank (the Z13 idiom)" comment deleted |
   | `e2e/suites/specimen/print.ts` | 1 | 0 | |
   | `e2e/suites/stage/frame.ts` | 0 | 1 | |
   | `e2e/suites/stage/short.ts` | 4 | 0 | |
   | `e2e/suites/stage/stage.ts` | 1 | 0 | |
   | `e2e/suites/survey/links.ts` | 2 | 0 | |
   | `e2e/suites/writing-room/carry.ts` | 1 | 0 | |
   | `e2e/suites/writing-room/kit.ts` | 1 | 0 | its "Bounce through about:blank (the Z13 idiom)" comment deleted |
   | `e2e/suites/zoom-gestures/touch.ts` | 1 | 0 | |
   | `e2e/support/fingerprint-probe.ts` | 0 | 1 | |
   | `e2e/support/room.ts` | 1 | 0 | its "Re-bootstrap through about:blank (the Z13 idiom)" comment deleted |

   Totals: 74 `bounce`, 10 `leaveBlank`, 49 files. The spike's `git diff --stat` for these 49 files plus `nav.ts`: 50 files, 151 insertions, 175 deletions. Every other comment that names `about:blank` stays (Calls made, 5). No file or function passes the house's `max-lines` (400) or `max-lines-per-function` (50), which `eslint.config.ts` counts without blank lines and comments: `npm run lint` was clean over the spike. By `wc -l` one edited file is over 400 (`e2e/suites/stage/stage.ts`, 426 before and after, 391 by the lint's count) and `e2e/harness.ts` goes from 398 to 399; six functions in edited files are over 50 by raw lines at d95e2c47 (`p23CapHolds`, `cd36GoldPress`, `dragKit`, `tableKit`, `run` in `document-rooms.ts`, `rv4TiltAndFacing`; `node out/1016-pr3-dry-run/sizes.ts`, log `out/1016-pr3-dry-run/sizes.log`), and no hop sits in any of them, so none changes.
3. **`scripts/lint/e2e-cdp-helpers.ts`**: as under "The guard" (33 lines to 44), in two steps: commit 5 adds the `about:blank` row alone; commit 7 adds the scripts-off row, `ONCE`, `WHY` and the `{{why}}` message.
4. **`eslint.config.ts`** (commit 7): delete line 13 (`import e2eScriptsOff from "./scripts/lint/e2e-scripts-off.ts";`); in line 34, the `vellum` plugin object, delete `...e2eScriptsOff.rules, ` (the text between `...narrowWidth.rules, ` and `...e2eCdpHelpers.rules,`); in the block "the house's rules on every e2e script", delete the line `"vellum/e2e-scripts-off-through-helper": "error",`.
5. **`test/e2e/nav.test.ts`**: T0's stand-in moves into a `recorder()` both tests share; T0's name and assertion are unchanged; T0b is added. The whole file:
   ```ts
   import { test } from "node:test";
   import assert from "node:assert/strict";
   import { bounce, leaveBlank } from "../../e2e/support/nav.ts";
   import type { SuiteContext } from "../../e2e/types.ts";

   const recorder = () => {
     const sent: string[] = [];
     const send = ((method: string, params?: Record<string, unknown>): Promise<unknown> => {
       sent.push(`${method} ${String(params?.["url"])}`);
       return Promise.resolve({});
     }) as unknown as SuiteContext["send"];
     return { sent, send };
   };

   test("bounce sends the page to about:blank and then to the address, so a hash-only change still re-boots the page", async () => {
     const { sent, send } = recorder();
     await bounce(send, "http://127.0.0.1:8765/explorer/#seed=7");
     assert.deepEqual(sent, ["Page.navigate about:blank", "Page.navigate http://127.0.0.1:8765/explorer/#seed=7"]);
   });

   test("leaveBlank sends the page to about:blank and nowhere after, the page a suite leaves behind or hands to a helper that navigates itself", async () => {
     const { sent, send } = recorder();
     await leaveBlank(send);
     assert.deepEqual(sent, ["Page.navigate about:blank"]);
   });
   ```
6. **`test/repo/e2e-cdp-helpers.test.ts`**: the import line becomes `import { eslint, plantMessages, ruleLines } from "../../test-support/source-shape-reports.ts";` (commit 6); T7, T8 and T9 are unchanged; the helpers and T10 (commit 4) and T11 (commit 6) are appended, as under "Tests".
7. **`handbook/specs/settle-doctrine.md`**, clause 9, lines 128 to 131 (commit 8). Before:
   ```
      `e2e/suites/chart-drawer/kit.ts` does in its own `go`. Reach a new address by
      re-bootstrapping through `about:blank` and then the target, then poll for the boot committing:
      that is what `goto` does in `e2e/support/room.ts`, and a fixed sleep in its place is the
      flake.
   ```
   After:
   ```
      `e2e/suites/chart-drawer/kit.ts` does in its own `go`. Reach a new address by
      re-bootstrapping through `about:blank` and then the target, which `bounce` in
      `e2e/support/nav.ts` does for every e2e file (`vellum/e2e-cdp-through-helper` refuses the
      address anywhere else), then poll for the boot committing, as `goto` in
      `e2e/support/room.ts` does; a fixed sleep in its place is the flake.
   ```

### Deleted (commit 7)

- `scripts/lint/e2e-scripts-off.ts`
- `test/repo/e2e-scripts-off.test.ts`

## The codemod and the check

### `out/1016-pr3-dry-run/hops-codemod.ts`

Exits 1 and writes nothing when a count or an exact edit does not match the tree, which is a stop condition. Measured in this planner's tree at d95e2c47: `--dry` printed `summary: 74 pairs to bounce, 10 lone blanks to leaveBlank, 49 files changed` (log `out/1016-pr3-dry-run/hops-codemod-dry.log`), and the real run the same (`out/1016-pr3-dry-run/hops-codemod.log`).

```ts
// Issue #1016 pull request 3 plan: the codemod that moves every about:blank hop in e2e/ onto e2e/support/nav.ts, and the four cards-suite arrivals of Issue #1209 onto explorerUp. Never committed; the plan carries this file verbatim.
// Run from the tree's root:  node out/1016-pr3-dry-run/hops-codemod.ts --dry   (prints the census, writes nothing)
//                            node out/1016-pr3-dry-run/hops-codemod.ts         (writes the files, then run npm run format)
// Exits 1, writing nothing, when any count or exact edit below does not match the tree: the plan no longer stands.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import ts from "typescript";

const DRY = process.argv.includes("--dry");
const NAV = "e2e/support/nav.ts";
const EXPLORER = "e2e/support/explorer.ts";
const EXPECT = { pairs: 74, blanks: 10, files: 49 };

const PAIR =
  /^([ \t]*)await ([\w.]+)\("Page\.navigate", \{ url: "about:blank" \}\);\n\1await \2\("Page\.navigate", (?:\{ url: ([^\n]+?) \}|\{\n[ \t]*url: ([^\n]+?),\n[ \t]*\}|\{ (url) \})\);$/gm;
const LONE = /^([ \t]*)await ([\w.]+)\("Page\.navigate", \{ url: "about:blank" \}\);$/gm;

type Edit = { readonly file: string; readonly from: string; readonly to: string; readonly imports?: string };
const EDITS: readonly Edit[] = [
  {
    file: "e2e/harness.ts",
    from: '      "--window-size=1280,2400",\n      "about:blank",\n',
    to: '      "--window-size=1280,2400",\n      ABOUT_BLANK,\n',
  },
  {
    file: "e2e/suites/cards/cap.ts",
    from: '  if (!(await waitReady())) throw new Error("P24 the explorer never drew at 1280x800");\n',
    to: '  await explorerUp({ waitReady }, "P24 at 1280x800");\n',
    imports: "explorerUp",
  },
  {
    file: "e2e/suites/cards/cap.ts",
    from: '  if (!(await waitReady())) throw new Error("P restore the explorer never drew again");\n',
    to: '  await explorerUp({ waitReady }, "P restore");\n',
    imports: "explorerUp",
  },
  {
    file: "e2e/suites/cards/hold.ts",
    from: '    if (!(await waitReady())) throw new Error("the explorer never drew at 1024");\n',
    to: '    await explorerUp({ waitReady }, "the hold kit at 1024");\n',
    imports: "explorerUp",
  },
  {
    file: "e2e/suites/cards/kit.ts",
    from: "    if (!(await waitReady())) throw new Error(`P19 the explorer never drew at ${width}`);\n",
    to: "    await explorerUp({ waitReady }, `P19 at ${width}`);\n",
    imports: "explorerUp",
  },
  {
    file: "e2e/suites/chart-drawer/portfolio.ts",
    from: '  await send("Page.navigate", { url: "about:blank" });\n  const sheet =\n    "k-s.seed-42.type-island.outline-ne-1159315211.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";\n',
    to: '  const sheet =\n    "k-s.seed-42.type-island.outline-ne-1159315211.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";\n  await send("Page.navigate", { url: "about:blank" });\n',
  },
  {
    file: "e2e/suites/specimen/kit.ts",
    from: "  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.\n",
    to: "",
  },
  {
    file: "e2e/suites/writing-room/kit.ts",
    from: "  // Bounce through about:blank (the Z13 idiom): a navigate to the tab's current URL is a no-op.\n",
    to: "",
  },
  {
    file: "e2e/support/room.ts",
    from: "  // Re-bootstrap through about:blank (the Z13 idiom): a hash-only navigate is same-document, and the room reads its hash once at boot with no hashchange listener.\n",
    to: "",
  },
];

const fail = (why: string): never => {
  console.error(`STOP: ${why}`);
  process.exit(1);
};

const specifier = (file: string, target: string): string => {
  const rel = relative(dirname(file), target).split("\\").join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

const withImport = (file: string, text: string, names: readonly string[], target: string): string => {
  if (names.length === 0) return text;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const last = sf.statements.filter(ts.isImportDeclaration).at(-1);
  if (!last) return fail(`${file} has no import to follow`);
  const line = `\nimport { ${[...names].sort().join(", ")} } from "${specifier(file, target)}";`;
  return text.slice(0, last.end) + line + text.slice(last.end);
};

const files = execFileSync("git", ["ls-files", "e2e"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".ts") && f !== NAV);

let pairs = 0;
let blanks = 0;
const changed = new Map<string, string>();
for (const file of files) {
  const before = readFileSync(file, "utf8");
  let text = before;
  const used = new Set<string>();
  const fromExplorer = new Set<string>();
  for (const e of EDITS.filter((x) => x.file === file)) {
    const at = text.indexOf(e.from);
    if (at < 0 || text.indexOf(e.from, at + 1) >= 0) fail(`${file}: the exact edit is not there exactly once: ${e.from.trim()}`);
    text = text.slice(0, at) + e.to + text.slice(at + e.from.length);
    if (e.imports) fromExplorer.add(e.imports);
    if (e.to.includes("ABOUT_BLANK")) used.add("ABOUT_BLANK");
    console.log(`EDIT  ${file}  ${e.from.trim()}  ->  ${e.to.trim() || "(deleted)"}`);
  }
  text = text.replace(PAIR, (_m, indent: string, send: string, one?: string, multi?: string, short?: string) => {
    pairs++;
    used.add("bounce");
    const url = one ?? multi ?? short!;
    console.log(`PAIR  ${file}  bounce(${send}, ${url})`);
    return `${indent}await bounce(${send}, ${url});`;
  });
  text = text.replace(LONE, (_m, indent: string, send: string) => {
    blanks++;
    used.add("leaveBlank");
    console.log(`BLANK ${file}  leaveBlank(${send})`);
    return `${indent}await leaveBlank(${send});`;
  });
  if (text === before) continue;
  text = withImport(file, text, [...used], NAV);
  text = withImport(file, text, [...fromExplorer], EXPLORER);
  changed.set(file, text);
}

const leftover = [...changed.entries()].filter(([, t]) => t.includes('"about:blank"'));
console.log(`summary: ${pairs} pairs to bounce, ${blanks} lone blanks to leaveBlank, ${changed.size} files changed`);
if (leftover.length) fail(`a hand-written about:blank is left in ${leftover.map(([f]) => f).join(", ")}`);
if (pairs !== EXPECT.pairs || blanks !== EXPECT.blanks || changed.size !== EXPECT.files)
  fail(`expected ${EXPECT.pairs} pairs, ${EXPECT.blanks} blanks and ${EXPECT.files} files`);
if (!DRY) for (const [file, text] of changed) writeFileSync(file, text);
console.log(DRY ? "dry run: nothing written" : "written; now run npm run format until npm run format:check passes");
```

### `out/1016-pr3-dry-run/hops-check.ts`, part A of the evidence

For every e2e file at the base and at the branch, it lists every call in source order, reading `bounce(S, U)` as S's navigate to `about:blank` then to U, `leaveBlank(S)` as S's navigate to `about:blank`, and `explorerUp(x, L)` as the `waitReady` it asks, and compares the two lists; then five controls in the same run. Measured on the spike in this planner's tree (codemod, `npm run format`, `nav.ts` as planned), run as `node out/1016-pr3-dry-run/hops-check.ts d95e2c47`, log `out/1016-pr3-dry-run/hops-check.log`, exit 0:

```
A summary: 236 of 236 e2e files make the same calls in the same order; 85 hops at the base in 49 files
C DIFFERS (control bites) two hops' addresses swapped in e2e/suites/cards/cap.ts
C DIFFERS (control bites) a hop's about:blank dropped in e2e/suites/cards/cap.ts
C DIFFERS (control bites) a hop sent through another send in e2e/suites/cards/cap.ts
C DIFFERS (control bites) a bounce's send rewritten in e2e/suites/broadside/kit.ts's text
C DIFFERS (control bites) a leaveBlank line deleted in e2e/suites/broadside/room.ts's text
C summary: 5 of 5 mutation arms read as different
```

(85 is the 84 hand-written hops plus the `bounce` inside `toExplorer`, which `e2e/support/explorer.ts` holds at both ends.)

```ts
// Issue #1016 pull request 3 plan probe, part A: every e2e file at the branch makes the same calls in the same source order as at the base, with bounce(S, U) read as S's navigate to about:blank then to U, leaveBlank(S) as S's navigate to about:blank, and explorerUp(x, L) as the waitReady it asks. Then the same-run controls: three mutated sequences and two mutated file texts the comparison must call different.
// Run from the tree's root: node out/1016-pr3-dry-run/hops-check.ts <base sha>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import ts from "typescript";

const base = process.argv[2];
if (!base) throw new Error("usage: node out/1016-pr3-dry-run/hops-check.ts <base sha>");
const SKIP = new Set(["e2e/support/nav.ts"]);
const git = (...args: string[]): string => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 26 });
const flat = (s: string): string => s.replace(/\s+/g, "").replace(/,([)\]}])/g, "$1");

const urlOf = (arg: ts.Expression | undefined, sf: ts.SourceFile): string | null => {
  if (!arg || !ts.isObjectLiteralExpression(arg)) return null;
  for (const p of arg.properties) {
    if (ts.isPropertyAssignment(p) && p.name.getText(sf) === "url") return flat(p.initializer.getText(sf));
    if (ts.isShorthandPropertyAssignment(p) && p.name.getText(sf) === "url") return "url";
  }
  return null;
};

export function events(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const out: string[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const callee = flat(n.expression.getText(sf));
      const [first, second] = n.arguments;
      const isNavigate = first && ts.isStringLiteral(first) && first.text === "Page.navigate";
      const url = isNavigate ? urlOf(second, sf) : null;
      if (isNavigate && url === '"about:blank"') out.push(`blank via ${callee}`);
      else if (isNavigate) out.push(`navigate via ${callee} to ${url}`);
      else if (callee === "bounce" && first && second) {
        const send = flat(first.getText(sf));
        out.push(`blank via ${send}`, `navigate via ${send} to ${flat(second.getText(sf))}`);
      } else if (callee === "leaveBlank" && first) out.push(`blank via ${flat(first.getText(sf))}`);
      else if (callee === "explorerUp") out.push("call waitReady");
      else out.push(`call ${callee}`);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

const atBase = new Set(git("ls-tree", "-r", "--name-only", base, "--", "e2e").split("\n").filter((f) => f.endsWith(".ts")));
const atHead = new Set(git("ls-files", "e2e").split("\n").filter((f) => f.endsWith(".ts")));
const files = [...new Set([...atBase, ...atHead])].filter((f) => !SKIP.has(f)).sort();

let faults = 0;
let hops = 0;
let withHops = 0;
let firstPair: { file: string; seq: string[] } | null = null;
for (const file of files) {
  const before = atBase.has(file) ? events(file, git("show", `${base}:${file}`)) : [];
  const after = atHead.has(file) && existsSync(file) ? events(file, readFileSync(file, "utf8")) : [];
  const blanks = before.filter((e) => e.startsWith("blank via")).length;
  hops += blanks;
  if (blanks > 0) withHops++;
  if (!firstPair && after.filter((e) => e.startsWith("navigate via")).length >= 2) firstPair = { file, seq: after };
  if (isDeepStrictEqual(before, after)) continue;
  faults++;
  const at = before.findIndex((e, i) => e !== after[i]);
  console.log(`A DIFF ${file} at call ${at}\n    base   ${before.slice(at, at + 3).join(" | ")}\n    branch ${after.slice(at, at + 3).join(" | ")}`);
}
console.log(`A summary: ${files.length - faults} of ${files.length} e2e files make the same calls in the same order; ${hops} hops at the base in ${withHops} files`);

const control = (name: string, mutate: (seq: string[]) => string[]): boolean => {
  if (!firstPair) throw new Error("no file with two navigates to build the controls from");
  const differs = !isDeepStrictEqual(firstPair.seq, mutate([...firstPair.seq]));
  console.log(`C ${differs ? "DIFFERS (control bites)" : "SAME (control is blind)"} ${name} in ${firstPair.file}`);
  return differs;
};
const navs = (seq: string[]): number[] => seq.flatMap((e, i) => (e.startsWith("navigate via") ? [i] : []));
const caught = [
  control("two hops' addresses swapped", (s) => {
    const [a, b] = navs(s);
    [s[a!], s[b!]] = [s[b!]!, s[a!]!];
    return s;
  }),
  control("a hop's about:blank dropped", (s) => s.filter((_, i) => i !== s.findIndex((e) => e.startsWith("blank via")))),
  control("a hop sent through another send", (s) => s.map((e, i) => (i === navs(s)[0] ? e.replace(/via \S+/, "via other.send") : e))),
].filter(Boolean).length;
const textControl = (name: string, mark: string, mutate: (text: string) => string): boolean => {
  const file = files.find((f) => atBase.has(f) && atHead.has(f) && readFileSync(f, "utf8").includes(mark));
  if (!file) throw new Error(`no file at the branch holds ${mark}`);
  const differs = !isDeepStrictEqual(
    events(file, git("show", `${base}:${file}`)),
    events(file, mutate(readFileSync(file, "utf8"))),
  );
  console.log(`C ${differs ? "DIFFERS (control bites)" : "SAME (control is blind)"} ${name} in ${file}'s text`);
  return differs;
};
const textCaught = [
  textControl("a bounce's send rewritten", "bounce(send, ", (t) => t.replace("bounce(send, ", "bounce(other.send, ")),
  textControl("a leaveBlank line deleted", "await leaveBlank(", (t) => t.replace(/^.*await leaveBlank\(.*$/m, "")),
].filter(Boolean).length;
console.log(`C summary: ${caught + textCaught} of 5 mutation arms read as different`);
process.exit(faults === 0 && caught + textCaught === 5 ? 0 : 1);
```

**What part A does not hold**: what a call's arguments other than a navigate's address are (a `waitReady` read as the same call whatever wraps it), a comment, and the harness's spawn argument; `npm run check`, `npm run lint`, T10 and every run's browser launch hold the last. It reads text, not the running page; the local suites and CI's four lanes hold the page.

## Tests, in the order they are written

### `test/e2e/nav.test.ts` (commit 1, red; commit 2, green)

- **T0** (exists) `bounce sends the page to about:blank and then to the address, so a hash-only change still re-boots the page`. Unchanged assertion.
- **T0b** `leaveBlank sends the page to about:blank and nowhere after, the page a suite leaves behind or hands to a helper that navigates itself`: asserts `deepEqual(sent, ["Page.navigate about:blank"])`.

**Stub** (commit 1): `nav.ts` gains `export const ABOUT_BLANK = "about:blank";` and `export const leaveBlank = async (send: SuiteContext["send"]): Promise<void> => { await send("Page.reload"); };`, and `bounce` stays as it is at d95e2c47 (its own two sends). T0b reds on its `deepEqual` (`["Page.reload undefined"]` against `["Page.navigate about:blank"]`); T0 stays green; `npm run check` passes.

### `test/repo/e2e-cdp-helpers.test.ts`: T10 (commit 4, red; commit 5, green)

Appended after T9:

```ts
const linted = (plant: ReadonlyArray<readonly [string, boolean]>, path: string): Promise<number[]> =>
  ruleLines(
    plant.map(([line]) => line),
    path,
    RULE,
  );
const refusedOf = (plant: ReadonlyArray<readonly [string, boolean]>): number[] =>
  plant.flatMap(([, refused], i) => (refused ? [i + 1] : []));

const HOP_HOME = "e2e/support/nav.ts";
const HOP_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  ['export const a = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "about:blank" });', REFUSE],
  ['export const b = ({ send }: SuiteContext) => send("Page.navigate", { url: `about:blank` });', REFUSE],
  ['export const c = ["--headless=new", "--window-size=1280,2400", "about:blank"];', REFUSE],
  [
    'const AWAY = "about:blank"; export const d = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: AWAY });',
    REFUSE,
  ],
  ["// a hop leaves through about:blank, named in a comment, which navigates nowhere", PASS],
  ['export const e = "every fresh address arrives through about:blank first";', PASS],
  ['export const f = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "about:" + "blank" });', PASS],
  [
    'const s = "blank"; export const g = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: `about:${s}` });',
    PASS,
  ],
  [
    'import { ABOUT_BLANK } from "../../support/nav.ts"; export const h = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: ABOUT_BLANK });',
    PASS,
  ],
  ['export const i = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "http://127.0.0.1:8765/faq/" });', PASS],
];
const HOP_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the address assembled from pieces or from a template holding an expression (plant lines 8 and 9), and ABOUT_BLANK imported from its home and handed to a raw Page.navigate (plant line 10), since no syntax read of one file resolves either; and a hop written by hand on top of leaveBlank or bounce, since the rule reads spellings and not what a function does. A navigate to any other address is no row (plant line 11)";

test("no e2e file names about:blank but its one home, e2e/support/nav.ts, the harness's launch argument included (Issue #1016)", async () => {
  const refused = refusedOf(HOP_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < HOP_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(HOP_PLANT, "e2e/suites/document-rooms.ts"), refused, HOP_BLIND_SPOT);
  assert.deepEqual(
    await linted(HOP_PLANT, "e2e/harness.ts"),
    refused,
    "the harness launches its browser on ABOUT_BLANK from the home, never on a spelling of its own",
  );
  assert.deepEqual(await linted(HOP_PLANT, HOP_HOME), [], "the home itself is refused the address it exists to hold");
});
```

T10 exists because T9 cannot see a row taken away: it iterates whatever rows there are, and with no hand-written hop left the lint stays green too, so without T10 the row could be deleted with nothing red (mutation H1).

**Stub** (commit 4): no `about:blank` row in `CDP_HOMES` (the rule as d95e2c47 has it). T10 reds on its first `deepEqual` (`[]` against `[2, 3, 4, 5]`).

### `test/repo/e2e-cdp-helpers.test.ts`: T11 (commit 6, red; commit 7, green)

Appended after T10; the plant, its blind spot and the first three assertions are `test/repo/e2e-scripts-off.test.ts`'s first test moved whole, its rule now the CDP helper rule; the fourth assertion holds the reason `WHY` keeps:

```ts
const SCRIPTS_OFF_HOME = "e2e/support/scripts-off.ts";
const SCRIPTS_OFF_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Emulation.setScriptExecutionDisabled", { value: false });',
    REFUSE,
  ],
  [
    "export const c = (ctx: SuiteContext) => ctx.send(`Emulation.setScriptExecutionDisabled`, { value: true });",
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'const METHOD = "Emulation.setScriptExecutionDisabled"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);',
    REFUSE,
  ],
  ["// Emulation.setScriptExecutionDisabled, named in a comment, which switches nothing", PASS],
  ['export const f = "scripts go off through Emulation.setScriptExecutionDisabled\'s one helper";', PASS],
  ['export const g = (ctx: SuiteContext) => ctx.send("Emulation.setEmulatedMedia", { media: "print" });', PASS],
  [
    'const s = "x"; export const i = (ctx: SuiteContext) => ctx.send(`Emulation.setScriptExecutionDisabled${s}`);',
    PASS,
  ],
  [
    'export const h = (ctx: SuiteContext) => ctx.send("Emulation." + "setScriptExecutionDisabled", { value: true });',
    PASS,
  ],
  [
    'import { SWITCH } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(SWITCH);',
    PASS,
  ],
];
const SCRIPTS_OFF_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces, and the whole name held in a binding the file never spells, such as a constant imported from a file the rule does not read (the last two plant lines); no syntax read of the one file can resolve either";

test("no e2e file names the scripts-off switch but its one helper, which always turns scripts back on (Issue #779)", async () => {
  const refused = refusedOf(SCRIPTS_OFF_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < SCRIPTS_OFF_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(SCRIPTS_OFF_PLANT, "e2e/suites/document-rooms.ts"), refused, SCRIPTS_OFF_BLIND_SPOT);
  assert.deepEqual(
    await linted(SCRIPTS_OFF_PLANT, "e2e/support/settle.ts"),
    refused,
    "a support module that is not the helper",
  );
  assert.deepEqual(
    await linted(SCRIPTS_OFF_PLANT, SCRIPTS_OFF_HOME),
    [],
    "the helper itself is refused the switch it exists to hold",
  );
  const [why] = (
    await plantMessages(
      SCRIPTS_OFF_PLANT.map(([line]) => line),
      "e2e/suites/document-rooms.ts",
    )
  ).filter((m) => m.ruleId === RULE);
  assert.match(
    why?.message ?? "",
    /withScriptsOff always turns page scripts back on/,
    "the refusal no longer says why the switch has one helper",
  );
});
```

**Stub** (commit 6): no scripts-off row in `CDP_HOMES`, and the old rule still wired. T11 reds on its first `deepEqual` (`[]` against `[2, 3, 4, 5, 6]`: the old rule refuses those lines under its own name, which `linted` does not count).

### Mutations, owed to the prover

Each by line, measured BITES on the spike in this planner's tree (`node out/1016-pr3-dry-run/mutations.ts`, log `out/1016-pr3-dry-run/mutations.log`, 9 of 9):

| id | file and line (as planned) | mutation | reds |
|---|---|---|---|
| N1 | `e2e/support/nav.ts:7` | `await send("Page.navigate", { url: ABOUT_BLANK });` becomes `void send;` | T0, T0b |
| N2 | `e2e/support/nav.ts:11` | delete `await leaveBlank(send);` | T0 |
| N3 | `e2e/support/nav.ts:4` | `"about:blank"` becomes `"about:srcdoc"` | T0, T0b |
| N4 | `e2e/support/nav.ts:12` | delete `await send("Page.navigate", { url });` | T0 |
| H1 | `scripts/lint/e2e-cdp-helpers.ts:7` | delete the `about:blank` row | T10 |
| H2 | `scripts/lint/e2e-cdp-helpers.ts:7` | the row's home becomes `e2e/support/input.ts` | T10 |
| S1 | `scripts/lint/e2e-cdp-helpers.ts:8` | delete the scripts-off row | T11 |
| S2 | `scripts/lint/e2e-cdp-helpers.ts:8` | the row's home becomes `e2e/support/settle.ts` | T11 |
| W1 | `scripts/lint/e2e-cdp-helpers.ts:31` | `why: WHY.get(spelling) ?? ONCE` becomes `why: ONCE` | T11 |

Line numbers are the files after `npm run format`, as the spike has them (`out/1016-pr3-dry-run/nav.spike.ts`, `out/1016-pr3-dry-run/e2e-cdp-helpers.spike.ts`); the prover finds each line by its text. The prover owes these nine, unit tests only (`npm test -- test/e2e/nav.test.ts`, `npm test -- test/repo/e2e-cdp-helpers.test.ts`); none is left to step 15. PR #1212's T7 to T9 and its K and L mutations are not owed again: their code is unchanged but for `refuse`'s report line, which W1 covers.

**A witness on the real tree, run once by the implementer** (no proof owed): with every commit made, `git show <start>:e2e/suites/landfall/seed.ts > e2e/suites/landfall/seed.ts` (`<start>` as under Evidence), then `npx eslint --flag unstable_native_nodejs_ts_config e2e/suites/landfall/seed.ts`, paste the three `vellum/e2e-cdp-through-helper` lines into the PR body, then `git checkout -- e2e/suites/landfall/seed.ts`. On the spike it printed lines 8:40, 55:38 and 58:38, each `an e2e file sends about:blank only through its helpers in e2e/support/nav.ts, where it is written once (Issue #1016)` (`out/1016-pr3-dry-run/spike-witness.log`).

### No browser check is added or made longer

So no browser-check reading is owed and no step's holdings are counted (`handbook/specs/settle-doctrine.md`, "Who finds a slow step"). The four Issue #1209 sites keep the check they had (one `waitReady`, a throw on `false`) and change its message only. Every hop is the fixture of checks that already run; the claim this pull request makes about them, the same messages in the same order, is part A's. The run time does not move, since each step sends what it sent; `MEASURED_SECONDS` and `test/e2e/lane-timings.test.ts` are not touched.

## Order of commits

1. `#1016 The plan, and a failing test for leaveBlank (pull request 3 of 4)`: `handbook/plans/1000/1016/1016-pr3-plan.md` (this file, as ruled), `nav.ts` with the stub, `test/e2e/nav.test.ts`. `npm test -- test/e2e/nav.test.ts` reds T0b alone, on its `deepEqual`. Push.
2. `#1016 leaveBlank sends the page to about:blank, and bounce goes through it`: `nav.ts` final. T0 and T0b green.
3. `#1016 Every about:blank hop in the e2e suites goes through e2e/support/nav.ts, and the cards suite's four arrivals assert through explorerUp`: write the two tools, `node out/1016-pr3-dry-run/hops-codemod.ts --dry` (exit 0, the summary line above), `node out/1016-pr3-dry-run/hops-codemod.ts`, `npm run format` until `npm run format:check` passes, then `node out/1016-pr3-dry-run/hops-check.ts <start>` (exit 0). `npm run check`, `npm run lint` and `npm test -- test/e2e/fingerprint-probe.test.ts test/e2e/cleanups.test.ts test/repo/e2e-tiers.test.ts test/e2e/explorer-arrival.test.ts test/e2e/room-kit-waits.test.ts test/e2e/nav.test.ts` green.
4. `#1016 A failing test: no e2e file names about:blank but e2e/support/nav.ts`: the helpers and T10. T10 red on its first `deepEqual`.
5. `#1016 The lint refuses about:blank anywhere but e2e/support/nav.ts`: the `about:blank` row. T10 green; `npm run lint` green over the tree.
6. `#1016 #1214 A failing test: the CDP helper rule holds the scripts-off switch`: the import of `plantMessages` and T11. T11 red on its first `deepEqual`.
7. `#1016 #1214 The scripts-off guard is one more row of the CDP helper rule`: the scripts-off row, `ONCE`, `WHY` and the message; `eslint.config.ts` as file 4 says; delete `scripts/lint/e2e-scripts-off.ts` and `test/repo/e2e-scripts-off.test.ts`. T7 to T11 green; `npm run lint` green.
8. `#1016 Clause 9 names the shared hop`: `handbook/specs/settle-doctrine.md`.

Then `npm run format` (again until `npm run format:check` passes), the evidence below, `vellum-guard-prover` at the pushed head, the step 12 comment, the pull request, `vellum-pr-skeptic` cold.

## Rosters and doctrine

- **Lint wiring** (Gate 4): the CDP helper rule stays wired in the three places it is; the scripts-off rule leaves the same three (`eslint.config.ts` lines 13, 34 and 265 at d95e2c47). `test/repo/lint-wiring.test.ts` holds the config's shape and needs no edit (green on the spike). No other list names either rule or either test file (`git grep -n "e2e-scripts-off\|e2eScriptsOff" -- . ':!handbook/plans'` at d95e2c47 prints only `eslint.config.ts`, the rule and its test); `SOURCE_READS` (`test-support/source-read-list.ts`) names neither test.
- **Doctrine**: clause 9 of `handbook/specs/settle-doctrine.md` (file 7). No other spec, gate, agent line or hook names what moves: `git grep -n -i "withScriptsOff\|CDP_HOMES\|e2e-cdp\|e2e-scripts-off" -- handbook/specs .claude CLAUDE.md AGENTS.md` prints nothing. `handbook/errata/guards.md` (the PR #701 row on hash-only navigates) and `handbook/errata/prose.md` (the PR #701 row on the comment at `cards/kit.ts:13`) stay: neither is fixed here, since the hash-only navigates keep their behaviour and that comment is not edited (Calls made, 5).
- **No other roster**: no suite, lane, `MEASURED_SECONDS`, `E2E_SKIPS` or step changes; `e2e/support/nav.ts` joins no list.
- **Unit-test fakes do not change**: `test/e2e/fingerprint-probe.test.ts`, `test/e2e/cleanups.test.ts` (H13e's held-bundle check: the rejected first navigate is now `leaveBlank`'s, so one call is still recorded), `test/repo/e2e-tiers.test.ts` (the fallback order, read through `send`) and `test/e2e/explorer-arrival.test.ts` read the `send` they hand in, which the helpers still call. On the spike rebuilt under Alex's names, the subset of eight files these touch passed 83 of 83 (`out/1016-pr3-dry-run/spike-unit.log`), with `npm run check` and `npm run lint` clean over the tree (`out/1016-pr3-dry-run/spike-check2.log`, `out/1016-pr3-dry-run/spike-lint.log`); the whole unit suite passed 3564 of 3564 on the first spike, under the names `blank` and `BLANK` (`out/1016-pr3-dry-run/spike-npm-test.log`), and was not run again for a rename the subset, the type check and the lint each cover.
- **Closing references**: in the place `.github/PULL_REQUEST_TEMPLATE.md` gives the closing line, the body carries exactly these three lines, each keyword directly before its one reference:
  ```
  Closes #1209
  Closes #1214
  Issue: #1016, stays open because this is pull request 3 of 4 and the last of the four carries its closing line
  ```
  Nowhere else in the body, the title or a commit message does `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves` or `resolved` stand directly before `#1016`, `#1211` or `#1213`; prose writes "Issue #1016". `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #1209 and Issue #1214, read after the body is written and again after any rewrite of it (`vellum-footguns` Gate 5 item 5).

## Evidence

- `<start>` is the sha `git merge-base HEAD origin/main` prints before any merge of main, run as its own command and passed on literally.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `node out/1016-pr3-dry-run/hops-check.ts <start>` after commit 3, exit 0: paste its `A summary` line and its six `C` lines into the PR body; the summary must read every file the same and `85 hops at the base in 49 files`.
- `git grep -n -F 'about:blank' -- e2e` prints the comment lines that stay and `e2e/support/nav.ts`'s two (its header and `ABOUT_BLANK`), and `git grep -n -F '"about:blank"' -- e2e` prints `e2e/support/nav.ts:4` alone.
- `git grep -n -E "waitReady\(\)[^;]" -- e2e/suites/cards` prints nothing (Issue #1209's own grep).
- `npm run build` once (nothing the site is built from changes). Then on the Mac, one at a time, each to its end, checking `ps aux | grep '[r]emote-debugging-port'` and `ls -d /var/folders/*/*/T/vellum-e2e-* | wc -l` before each (Gate 2 item 11; compare the count before and after, since older runs left profiles on disk); where the first prints a browser another lane holds, prefix each run with `VELLUM_E2E_PORT=8791 VELLUM_E2E_DPORT=9333`. The six suites whose sites take a shape other than the plain bounce (about 490 CI seconds by `MEASURED_SECONDS`):
  - `VELLUM_E2E_SUITES=cards npm run test:e2e` (adds `render`; the four Issue #1209 arrivals)
  - `VELLUM_E2E_SUITES=landfall npm run test:e2e` (`leaveBlank` before `settleHome`, L9)
  - `VELLUM_E2E_SUITES=runninghead npm run test:e2e` (`leaveBlank` before `visit`, RH10, RH10c, RH33)
  - `VELLUM_E2E_SUITES=broadside npm run test:e2e` (`leaveBlank` in BR9's `finally`; `gotoPlain`'s shorthand bounce)
  - `VELLUM_E2E_SUITES=reading-room npm run test:e2e` (`leaveBlank` in RR38's `finally`; `makeRoom`'s `goto`)
  - `VELLUM_E2E_SUITES=chart-drawer npm run test:e2e`, launched with the Bash tool's `run_in_background: true` and waited on through its completion notice, never polled or killed (`leaveBlank` in CD55's `finally`; `cd64PlaceSheet`'s reorder)

  Every run also launches its browser on `ABOUT_BLANK` and runs `handBack` through `leaveBlank` for its `fingerprint:` line; paste one run's `fingerprint:` line. Not run on the Mac, said so in the body: `cluster`, `corners`, `document-rooms`, `home`, `hunt`, `print-room`, `prospect`, `room-voyage-route`, `room-address`, `room-ink`, `room-voyage`, `room-instrument`, `specimen`, `stage`, `survey`, `writing-room` and `zoom-gestures`, whose sites are plain bounces the codemod wrote and part A read; CI's four lanes run them. `stage`'s one `leaveBlank` (`ea8Pinched`) sits in step EA8, which `E2E_SKIPS` pulls out (Issue #897), so it runs nowhere until that issue closes; say so.
- **A red on the branch**: check out commit 2 (the helpers built, no suite moved), run the same selection once, and return to the branch head; a red there too is not this change, and is recorded in the PR body with both lines. A red on the branch alone is a stop condition.
- **P24 (Issue #1211)**: P24 is not in `E2E_SKIPS` at d95e2c47, and Alex ruled it stays in the run while its own fix pull request is built (https://github.com/ahl-gram/Vellum/issues/1211#issuecomment-6603415522). That fix edits `e2e/suites/cards/cap.ts`, the file holding P24's arrival this pull request rewrites, so the two builds are sequenced: this one first. A red in `cards` whose only failing check is P24 and whose FAIL line carries `"kAfterWheelOverCard":1` is Issue #1211's flake, not this change: on the Mac, paste the line into the PR body's Ran section and the report, do not re-run, and edit no flake record; on CI, report it to the dispatcher with the job id and do not re-run (`.claude/agents/vellum-implementer.md`, "When to hand back"; the flake row and any skip are the dispatcher's). Any other P24 line, above all a throw reading `the Explorer never answered ready: P24 at 1280x800`, is this pull request's and a stop condition. If P24 is in `E2E_SKIPS` when you build, its arrival runs nowhere: say so in Ran.
- CI: all four lanes and the three `check & test` shards green. No step's seconds are read.
- `vellum-guard-prover`: T0, T0b, T10 and T11 with N1 to N4, H1, H2, S1, S2 and W1, unit tests only, run locally. If the dispatcher prefers the CI proof runner, the rows are N1 to N4 with the unit selection `test/e2e/nav.test.ts` and H1, H2, S1, S2 and W1 with `test/repo/e2e-cdp-helpers.test.ts`, each naming the tests the table gives.
- `vellum-plate-reader`: not owed (no appearance).
- `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #1209 and Issue #1214.

## Calls made

The implementer copies these into its step 12 comment.

1. **One helper `leaveBlank` and one constant `ABOUT_BLANK` join `bounce` in `e2e/support/nav.ts`**, `bounce` now going through `leaveBlank`. Rule: the guard keeps the address in one file, and ten sites need half a hop. The names are not a call: Alex ruled them (https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6603415150), and the step 12 comment points at that post rather than restating it.
2. **Every hop keeps its messages, its `send` and its neighbours; one constant moves.** `cd64PlaceSheet`'s `const sheet` moves above its hop so the hop is one `bounce`; the five sites before a self-navigating helper and the four that leave the page blank take `leaveBlank`; `handBack` takes `leaveBlank` and keeps its abort check and second navigate. Rule: a refactor keeps every message each site sends (pull request 1's Call 10), measured by part A over every e2e file.
3. **Issue #1209's four arrivals become `bounce` and `explorerUp({ waitReady }, label)`**, labels `P24 at 1280x800`, `P restore`, `the hold kit at 1024` and `` `P19 at ${width}` ``. Rule: the issue asks each message's label kept; the labels are the words each message carried beside "the explorer never drew".
4. **Issue #1209 is closed here**: its only ask is the four arrivals; its ink poll paragraph records `z23SurveyOverlay` as deliberately not folded, and it stays as it is. Rule: the issue's own text; folding it would change Z23's predicate and turn its check into a throw.
5. **Comments**: the three whose whole content restates the about:blank idiom at a hop now written `bounce` go (`e2e/suites/specimen/kit.ts`, `e2e/suites/writing-room/kit.ts`, `e2e/support/room.ts`); every other comment that names about:blank stays, since each gives a site's own reason (the storage seed in `chart-drawer/homes.ts`, the metrics in `cards/kit.ts`, the stale document in `runninghead.ts`, the scripts-off document in the two `finally`s, the samples in `home/ceremony.ts`, the poll in `print-room/link.ts`, the re-entries in `print-room.ts`, the table clear in `chart-drawer.ts`). Rule: `handbook/specs/conventions.md`, comments are the exception; pull request 1's Call 5; and `vellum-footguns` Gate 5 item 7, which keeps the false clause at `cards/kit.ts:13` (its `handbook/errata/prose.md` row) out of a pull request that does not otherwise edit that text.
6. **`zSetup`'s ready assertion (`e2e/suites/zoom/camera.ts:12`) stays.** Rule: it is not a hop, Issue #1209 does not name it, and it already asserts its answer; folding it would only reword its message, in a suite this pull request does not otherwise touch.
7. **Issue #1214 is folded and closed here**: the scripts-off switch is a row of `CDP_HOMES`, with its reason kept in a `WHY` map, its whole plant moved into `test/repo/e2e-cdp-helpers.test.ts`, and the old rule, its wiring and its test deleted. Rule: the issue leaves it to the first of pull requests 3 and 4, this one already edits both files, and the measured diff is about -35 lines; Gate 1 item 21 keeps the old plant whole.
8. **T10 and T11 each name their row**, beside T9's loop. Rule: T9 iterates whatever rows exist, so it cannot see a row taken away (mutation H1 on the spike: T9 stayed green, T10 went red).
9. **The edits are made by a codemod the plan carries** and checked by part A, not typed by hand. Rule: 84 sites in 48 files; the codemod's exact counts and exact edits are themselves the "plan still stands" check.
10. **No browser probe**: part A is the evidence for the same messages in the same order. Rule: a browser cannot tell two identical message sequences apart; pull request 2's probe never read the edited sites, which part A does.
11. **The local suites are the six whose sites take another shape**; the rest go to CI. Rule: `.claude/agents/vellum-implementer.md` (never the full local lanes); a codemod site is held by part A, which reads every file.
12. **`e2e/suites/stage/stage.ts` (426 lines by `wc -l`) is not split.** Rule: the house measures the 400-line and 50-line ceilings with `max-lines` and `max-lines-per-function` in `eslint.config.ts` (blank lines and comments skipped, every TypeScript root), and `npm run lint` was clean over the spike; `stage.ts` counts 391 that way (`grep -v -E '^\s*$|^\s*//' e2e/suites/stage/stage.ts | wc -l`), and this pull request leaves its length unchanged (one hop out, one import in).
13. **Clause 9 names `bounce` and keeps `goto`.** Rule: `goto` in `e2e/support/room.ts` still hops and then polls for the boot, which `bounce` alone does not; the citation stays true and gains the hop's one home.

## Open decisions

None. The one menu item, the names, Alex ruled on 2026-11-03 (https://github.com/ahl-gram/Vellum/issues/1016#issuecomment-6603415150): `leaveBlank(send)` and `ABOUT_BLANK`, his pick of option B over the recommended `blank` and `BLANK`. Folding it renamed the helper, the constant, the two tools, T0b, T10's plant and messages, mutations N1 to N3 and every prose mention; the design, the files, the shapes, the counts and the evidence are unchanged, and the re-run measured them the same.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git diff --stat d95e2c47 origin/main -- e2e scripts/lint eslint.config.ts test/e2e/nav.test.ts test/e2e/fingerprint-probe.test.ts test/e2e/cleanups.test.ts test/e2e/explorer-arrival.test.ts test/e2e/room-kit-waits.test.ts test/repo/e2e-tiers.test.ts test/repo/e2e-cdp-helpers.test.ts test/repo/e2e-scripts-off.test.ts test/repo/lint-wiring.test.ts` prints anything.
- `node out/1016-pr3-dry-run/hops-codemod.ts --dry` exits 1, or prints a summary other than `74 pairs to bounce, 10 lone blanks to leaveBlank, 49 files changed`.
- `node out/1016-pr3-dry-run/hops-check.ts <start>` exits 1: an `A DIFF` line, or a `SAME (control is blind)` line.
- `npm run check` or `npm run lint` reds after commit 3, 5 or 7 anywhere but in a mutation you made on purpose; `vellum/e2e-throw-inside-step` reports a line in a cards file.
- Any test file other than `test/e2e/nav.test.ts`, `test/repo/e2e-cdp-helpers.test.ts` and the deleted `test/repo/e2e-scripts-off.test.ts` needs an edit.
- `handbook/plans/1000/1016/1016-pr3-plan.md`, a `leaveBlank` export in `e2e/support/nav.ts` or an `about:blank` row in `CDP_HOMES` is already on main.
- A stub reds on something other than its test's assertion, or a mutation N1 to N4, H1, H2, S1, S2 or W1 leaves every test in its row green.
- A local suite reds on the branch and not at commit 2, other than the P24 case under Evidence.
- Any run prints `the Explorer never answered ready:` with a label this plan gives.
- A CI red in a suite this pull request touched: the procedure in `.claude/agents/vellum-implementer.md`, "When to hand back".
- `gh pr view <N> --json closingIssuesReferences` lists anything but Issue #1209 and Issue #1214 after the body is fixed to the three lines under "Rosters and doctrine".

## Not this pull request: what pull request 4's planner starts from

- **The guard's shape after this pull request**: `CDP_HOMES` maps a spelling to its home; `WHY` gives a row a reason other than `ONCE`. Pull request 4 adds `Input.dispatchMouseEvent` and `Input.dispatchTouchEvent` to `e2e/support/input.ts` (pull request 1's sketch), and each new row owes its own plant test beside T9, since T9 cannot see a row taken away (Call 8, mutation H1).
- **The harness's own `wheel` and `touch`** send mouse and touch events from `e2e/harness.ts`, which is not the home; pull request 1's sketch moves them onto `input.ts`.
- **Closing references**: pull request 4 carries `Closes #1016` and merges after this one; its planner reads that this one is merged before writing that line.
- **Collisions**: this pull request edits 49 files under `e2e/` in all four lanes; pull request 4 waits for it to merge. Issue #1211's fix pull request (P24's wait, ruled at https://github.com/ahl-gram/Vellum/issues/1211#issuecomment-6603415522) edits `e2e/suites/cards/cap.ts`, which this pull request rewrites at P24's arrival and `pRestore`, so it is built after this one merges, from a main that carries `bounce` and `explorerUp` there.
