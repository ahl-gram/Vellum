# Issue #1273, pull request 7 of 7: write the lessons down so the bloat does not come back

**Planned at**: `origin/main` dd686ece (PR #1281 merged), the issue's comment count 37, the
rulings comment the newest (read with
`gh api "repos/ahl-gram/Vellum/issues/1273/comments?per_page=100" | jq length`; the default page
returns 30, so a bare `| jq length` under-counts this issue). Re-recorded at the fold: `origin/main`
had not moved, and every before text and anchor below was found verbatim in the tree at dd686ece
(25 of 25, a `node` check over this plan's before blocks).

**Acceptance**: comment 6725886233, "Acceptance criterion added, Alex, 2026-11-08: write the lessons
down so the bloat does not come back": an audit of the places that decide when a browser check gets
written and what it may hold, the five lessons routed to the spec or agent that owns each, and the
rule changes put to Alex as a menu before they are written. "This issue closes only once that pull
request merges", so this pull request carries `Closes #1273`.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1273#issuecomment-6743047621 (Alex,
2026-11-09): Q1 "Yes, one place; send back", Q2 "Ledger line, you rule new pages", Q3 "Add the
rule", Q4 "Take all six", each the recommended option; the planner's calls 1 to 15 were not
challenged. Every edit E1 to E19, E21 and the issue below is built as written.

## Specs

- `handbook/specs/conventions.md`: Where a rule lives (one normative home, every other copy points
  at it; a gate line needs its own incident or a ruling of Alex's); How a spec is written
  (prescriptive, provenance out, `symbol` in `path` citations kept, no counts, `Issue #N` form).
- `handbook/specs/check-placement.md`: all of it; it is the main file this pull request edits.
- `handbook/specs/settle-doctrine.md`: "When a check leaves the run" (lines 227 to 343) in full,
  item 11 (lines 135 to 153).
- `handbook/specs/development-workflow.md`: step 14's last paragraph (an agent whose definition the
  pull request changes), step 15.
- `handbook/specs/site-architecture.md`: the `MEASURED_SECONDS` bullet (line 383), the rosters
  bullet (line 84 onward).
- `.claude/skills/vellum-footguns/SKILL.md`: Gates 1, 2, 3 and 5 (Gate 5 before the push and body).
- `handbook/errata/README.md`: A row (for the one row this pull request adds).

## The audit: which lines let the bloat in

Each row names the line that lets a check in, the pull request whose text shows it did, and the
lesson it serves. "Lesson" numbers are comment 6725886233's: (1) one shared binder, one room;
(2) sweeps have a cost; (3) simple pages get no browser checks; (4) unit test first; (5) new
browser checks owe a ledger line. (6) is the audit's own: a claim of dress alone. "PR" lessons are
the ones the six merged pull requests taught. Line numbers are at dd686ece.

| # | file and line | what it lets in | evidence | lesson | edit |
|---|---|---|---|---|---|
| L1 | `handbook/specs/check-placement.md` 112 to 114: "a rule about how a page looks is pinned here or by `vellum-plate-reader`" | a browser check for every ruled look, with no line between a look a journey turns on and dress | the largest class every group deleted: camera 12 of 33 ("how it looks", comment 6729237220), rooms 14 of 40 (comment 6730002087), panels 30 of 71 (comment 6731044042), and the chrome group's "checked by eye" list (comment 6737728704) | 6 | E3 |
| L2 | `handbook/specs/conventions.md` 43 to 44 and `SKILL.md` Gate 3 item 6 (lines 221 to 222): "let dressing-level pins lag one live-use cycle" | schedules a dress pin after one live cycle, so dress checks were owed, only later | the same deletions; nothing marked those pins provisional, and a re-dress ripped them out | 6 | E14, E15 |
| L3 | `SKILL.md` Gate 1 item 6 (lines 42 to 43): "Guard the class. List every instance ... every page that carries its own sheet ... and sweep them" | a read in every room for a rule every room takes from one module | `vellum-guard-prover.md` 101 and `vellum-pr-skeptic.md` 97 carry the same instruction to the review agents; PR #777's body: "Rode along from the cold review: two checks the plan did not name", EL2 (every room's slip folded at 932x430) and EA5 (a lifted press, eight rooms); PR #1277 deleted EL2 and narrowed EA5 to the Explorer | 1 | E10, E16, E17 |
| L3b | `SKILL.md` Gate 1 item 5 (lines 40 to 41): "N states or N siblings need N pins, not one floor" | the same every-room read back in through "siblings" once item 6 is narrowed | none traced to it; the reading is open as long as "sibling" is undefined | 1 | E10a |
| L4 | `vellum-guard-prover.md` 132: "For every HOLE, propose the specific assertion that would close it, and say which existing test file it belongs in" | a HOLE closed by whatever check the prover names, a browser read included | no instrument preference at the line where the prover proposes coverage | 4 | E16 |
| L5 | `handbook/specs/development-workflow.md` step 15 (lines 389 to 399): "A finding about this pull request's own work is fixed after that round" | a browser check added at review, with no plan reading and no count of what it holds | PR #777 again: EA5 and EL2 entered as review fixes over eight rooms each | 5 | E19 |
| L6 | `SKILL.md` Gate 3 item 3 (lines 205 to 212): "an edge defect is swept a pixel at a time by resizing the loaded page" | the probe's sweep kept as the standing check | PR #742's body: CO1 "resizes every page under `src/pages/` while loaded, 320 to 480 a pixel at a time plus both sides of every width media edge ... and a 32px stride to 1280", "the suite measured 145.7s against the plan's 100"; Issue #1273 ruling 2 narrowed CO1 | 2 | E13 |
| L7 | `handbook/specs/check-placement.md` 87 to 89: "where it is about what a page shows, write it as a browser check" | markup and scripts-off reads in the browser | PR #1280 moved sixteen such checks to `test/site/built-pages.test.ts` (BR1, BR9, BR11, CD55, L13 to L17, HG6, R16, PR36, RR38, PB12, PB16, RB11; comment 6731645726 Q4) | 4 | E1 |
| L8 | `handbook/specs/check-placement.md` 92 to 97, and every spec | no spec names `test/site/built-pages.test.ts`, `test-support/built-reads/` or `linkedom` (recon: `grep -rn -i "linkedom\|built-pages\|built-reads"` over `handbook/specs` and `.claude` hits `ui-design.md` 228 and 393 only) | the next markup claim has no named home and lands in the browser again | 4 | E2 |
| L9 | `handbook/specs/check-placement.md` 160 to 171: the move-or-list bullet covers "a claim a deleted browser check held" only | a new claim is never asked first whether a unit test can hold it; line 3's "the cheapest one that can see it" is a principle no plan is asked to apply | the panels group's "30 re-check logic a fast unit test already holds" (comment 6731044042) | 4 | E5 |
| L10 | `SKILL.md` Gate 1 item 20 (lines 92 to 93): "A ratified acceptance gets a driving check beside any pure-function read (PR #631)" | a browser check beside every unit-tested function, on the reading that "driving" means the browser | PR #631's driving checks were CD34 and CD35 (its body); PR #1279 moved their claim to `trialFace` in `src/site/explorer/chart-drawer.ts`, a function the page calls, under ground 2d | 4 | E11 |
| L11 | `handbook/specs/settle-doctrine.md` 292 to 302, "Who finds a slow step": a new check counts what its step holds and reads its seconds; a thin step under 4 seconds passes | a cheap check passes whatever holds its claims already and whatever journey it serves; the rule is a cost gate, never a need gate | 899 checks before the cut, most of them cheap | 5, 3 | E4 (it points here, unchanged) |
| L12 | `.claude/agents/vellum-planner.md` 36, the Tests line | readings and a step count for each browser check, no question whether it is needed | every group's plan had to argue each keep from scratch | 5 | E18 |
| L13 | `SKILL.md` Gate 2 item 17 (line 190): "Count and time a new or longer check" | the same cost-only gate at the moment of typing | as L11 | 5 | E12 |
| L14 | `handbook/specs/settle-doctrine.md` 303 to 314, the grounds | written for deletion only, so no authoring rule points at them; ground 1 names a simple page and the masthead, and the plans read dress-only checks into it | `handbook/plans/1200/1273/1273-pr2-plan.md` line 100: "Ground 1, how it looks, checked by eye (no behaviour)" | 1, 2, 3, 6 | E4 (the not-written clause), E6 |
| L15 | `handbook/specs/settle-doctrine.md` 315 to 320: the deletion bullets do not carry item 11's state precondition | a deleted step takes away a navigation or a state a later check reads | PR #1280 revision 1, call 22 (comment 6738724583): BR1c lost the Explorer load the deleted `br1Groups` made; call 19 applied item 11 "to a deletion" by analogy | PR | E7 |
| L16 | `handbook/specs/settle-doctrine.md` 248 to 254, "What a step holds": "then read it: a mention is not a hold" | a holder that reads as holding and does not | the audit's reading-based verdicts that measurement overturned: CD57's keep-reason false (comment 6731044042 Q2), EA6's lean on BR25 (comment 6725747221), WR1's flagship passing with the link ignored (PR #1278 call 5), EA1 blind to EA6's regression (PR #1277 call 3), BR9's port dropping the accessible name (comment 6739253488) | PR | E8 |
| L17 | `handbook/specs/site-architecture.md` 383: `MEASURED_SECONDS` read from "a lane job's log", one run | a table refreshed from one run | PR #1281 call C5 (comment 6741420453): one lane's share moved from 28.7% to 35.7% across three runs of one sha | PR | E9 |
| L18 | `handbook/specs/site-architecture.md` 86 names "RH32's browser copies of `ROADS` and `STAGES` in `e2e/suites/runninghead/room.ts`" | a page list a browser check keeps by hand grows the check with every page | Issue #1251 comment 6737765878: PR #1280 removed `PAGE_FLOOR`, `SCROLLING_ROOMS`, the two lists in the deleted `e2e/suites/corners/top-row.ts` and `FOLIO`; the per-page clause of E4 covers the rule; RH32's copies restate a roster, which Gate 1 item 16 already forbids | 2 | E21 (errata row) |
| L19 | `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` | the one-room rule's mechanical half; the Seed of the Day is held to `createZoomController` and `framingCamera` only, while it calls `bindRoom` and `bindGlassKeys` itself | PR #1277's coverage list (comment 6729676454): "the Seed of the Day takes `bindRoom` and `bindGlassKeys` without the shared-bindings lint requiring either" | 1 | Q4 (vi), an issue |

Read and found to hold, no edit:

- `handbook/specs/settle-doctrine.md` 331 to 335: an open errata row naming a deleted check is live
  work (PR #1276 revision 1). CURRENT.
- `SKILL.md` Gate 1 item 11: a sweep across seeds for column-width work, and both sides of a
  breakpoint. No check Issue #1273 deleted or narrowed swept seeds (no deletion row in the four
  group plans names seeds: `grep -n -i -E "^\| [A-Z]+[0-9].*(seeds|every seed|across seeds)"` over
  them prints nothing), and its two sides of a breakpoint are the two instances E13 leans on.
- `SKILL.md` Gate 1 item 16: a roster a guard checks is imported data. It already forbids RH32's
  copies (L18); the defect is a row, not a rule.
- `handbook/specs/site-architecture.md` 58 to 64: a working page owes its own e2e suite. That is a
  boot and its own console gate, which the cut kept for every room; not a vector.
- `.claude/agents/vellum-plate-reader.md`: it measures at the time of the change and writes only to
  `out/`; it proposes no check. Under Q3 (a) it is already the home a dress claim goes to
  ("whose measurements decide an appearance"). No edit.
- `.claude/agents/vellum-implementer.md`: its hand-back list already sends "a ... finding ... about
  the design rather than about your execution of it" back; E19 makes a review fix that adds a
  browser check such a finding, so the implementer needs no line of its own. No edit.
- `handbook/specs/development-workflow.md` step 3 summarises a plan and defers to the planner's bar;
  the bar (E18) carries the ledger. No edit.
- `handbook/specs/check-placement.md` line 3, "a rule belongs in the cheapest one that can see it":
  the principle lesson 4 rests on, already stated.
- Issue #1282 (the unit shards, open): moving claims to unit tests spends shard seconds. E2's
  "a new read joins that file rather than one that builds the site again" is the cost line this
  pull request owes (PR #1280 call 1: one build kept the file at 4.7 s); balancing the shards is
  Issue #1282's.
- `BALANCE_CAP` (PR #1281 call C5, relayed and unanswered): not this pull request's.

## The design

Every lesson is an amendment to text that already exists, with one normative home each and
pointers from the gates and agents, because `handbook/specs/conventions.md` (Where a rule lives)
allows one home and the specs are already long (check-placement 191 lines, settle-doctrine 776).

- **Lessons 1, 2, 3 and 5 share one home**: the check-placement bullet that already says a browser
  check is kept for what it holds against what it costs (line 157) becomes the bullet that says a
  browser check is WRITTEN for the same reason, and gives the ledger line. The line names the
  critical journey, why no unit test can hold each claim, and what each room, window, page, seed or
  path past the first alone runs (lessons 1 and 2); what the check holds and costs is counted where
  settle-doctrine already counts it (What a step holds, Who finds a slow step); and a check whose
  coverage would be needless on a settle-doctrine ground is not written (lessons 1, 2 and 3 by
  pointer, the grounds not restated). A journey Alex has not ruled on goes on that plan's menu
  (lesson 3, the form his Q2 ruling of comment 6728726351 takes: "No list to keep current").
- **Lesson 1's instance** is defined where a test's class is defined: Gate 1 item 6. Rooms held to
  one shared module by `SHARED_BINDINGS` are one instance, and item 5's "siblings" point at it (E10a). The guard prover's class sweep and the
  cold reviewer's "name the uncovered instances" point at it.
- **Lesson 2's sweep** is named a probe at Gate 3 item 3, where the pixel-by-pixel sweep is taught:
  the check that stays reads both sides of each edge, and any other width owes its ledger line.
- **Lesson 4** amends the three check-placement bullets that route a claim: a markup claim goes to
  the built pages (E1, E2, which name `test/site/built-pages.test.ts` and `linkedom` for the first
  time), the move-or-list bullet covers a new claim as well as a moved one (E5), and Gate 1 item 20's
  driving check is the cheapest one that runs the page's own code (E11).
- **Lesson 6 (dress)** amends check-placement's first browser bullet (E3), settle-doctrine's ground
  1 (E6), conventions (E15) and Gate 3 item 6 (E14).
- **The two PR lessons**: item 11's state rule reaches a deletion (E7); a holder a plan leans on is
  confirmed by its mutation (E8). The `MEASURED_SECONDS` median (E9) codifies PR #1281's call C2.
- **Review agents**: the prover proposes the cheapest check for a HOLE (E16); the cold reviewer
  reads a new browser check against its ledger line as it reads a comment for excess (E17); a review
  fix that adds a browser check goes back to the planner (E19).
- **No check is deleted.** Every deletion is Alex's by name (settle-doctrine 315); these rules govern
  a check being written, and an existing check leaves only as that section says.

Rejected, with the reason:

- **The ledger line in settle-doctrine's "Who finds a slow step".** That bullet is the cost reading;
  whether a check is written at all is an instrument choice, which is check-placement's subject and
  its required reading "before writing ... a browser check" (`CLAUDE.md` spec table). The ledger
  points at that bullet for the counting instead of copying it.
- **A new spec, or a new "Before writing a browser check" section.** Conventions prefers amending;
  a new spec joins five reading lists by hand (conventions, "A new spec file joins its reading
  lists").
- **Restating the deletion grounds as an authoring list.** Two copies of one rule are two rules
  (conventions); the ledger points at the grounds.
- **A `## ` section in `.github/PULL_REQUEST_TEMPLATE.md` for the ledger.** The template's own
  comment says a new section is retroactive (every later `gh pr edit` on an older pull request is
  refused), `SECTIONS` in `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` pins the
  list, and the hook checks presence, never content.
- **A lint or test that lists the simple pages.** Alex ruled "Your examples only ... No list to keep
  current" (comment 6728726351, Q2).
- **A ratchet on the number of browser checks.** Counting checks from e2e source is a text search a
  unit test may not make (check-placement, "A unit test does not open a source file"), a lint rule
  reads one file at a time and cannot count across files, and a count in a durable place rots.
- **Editing `vellum-implementer.md` or `vellum-plate-reader.md`.** See the audit's "no edit" list.
- **Deleting the dress-only checks still on main.** Every deletion is Alex's by name.

## Mechanical enforcement

None is built here. For each rule, why:

- The ledger line (E4), simple pages, dress (E3) and the instance definition (E10) are judgments: a
  journey, a claim held elsewhere, whether a colour is dress or a reading floor. No lint reads them,
  and the only house mechanism that reads a body (the footgun hook) checks headings alone.
- The one rule with a mechanical half already has it: `SHARED_BINDINGS` holds the zoom rooms to
  `bindZoomRoom`. Its gap (L19) is closed by a guard, filed as an issue under Q4 (vi) with the whole
  fix below: the guard is `ROSTER` in `test/repo/shared-bindings.test.ts` and the lint itself, and
  its mutation is deleting `import { bindRoom } from "../shared/room.ts";` and its call from
  `src/site/seed-of-the-day/app.ts`, which reds `npm run lint` on `vellum/shared-binding-imported`.
- The deletion state rule (E7) is seen by a lane-order run, which each cutting plan already runs.

## Files

Every edit below replaces the exact "before" text at dd686ece with the "after" text. Line counts are
the file's change in lines. Wrap prose at the file's existing width (about 100 columns); the agent
definitions and `handbook/specs/site-architecture.md` line 383 are single long lines and stay so.

### `handbook/specs/check-placement.md` (191 lines, about 211 after)

**E1** (lesson 4, +1). Before:

```
- **A unit test does not open a source file and search its text.** Where the rule under test is about
  how code is written, write it as a lint rule; where it is about what a page shows, write it as a
  browser check. A text search over source passes when the string sits in a comment, reds when a
```

After:

```
- **A unit test does not open a source file and search its text.** Where the rule under test is about
  how code is written, write it as a lint rule; where it is about what a built page carries, read the
  built page as the next bullet says; where it is about what the browser computes, write it as a
  browser check. A text search over source passes when the string sits in a comment, reds when a
```

**E2** (lesson 4, +5). Before (lines 92 to 97, its last two sentences kept):

```
  `test/site/room.test.ts`). The test checks what the file holds: a value against the code that must
  agree with it, or a config's shape. Finding the anchor first (`vellum-footguns` Gate 1) is part of
```

After:

```
  `test/site/room.test.ts`). The test checks what the file holds: a value against the code that must
  agree with it, or a config's shape. **What a built page carries is read in
  `test/site/built-pages.test.ts`** (Alex, 2026-11-08, Issue #1273): its markup and attributes, the
  names it gives its controls, its links, the files it names, and what it serves with scripts off,
  read over one build of the site, parsed with `linkedom`, a development dependency only the tests
  use, each read in its own file under `test-support/built-reads/`. A new read joins that file rather
  than one that builds the site again. Finding the anchor first (`vellum-footguns` Gate 1) is part of
```

**E3** (lesson 6, +7; Q3 (a)). Before:

```
- **What the browser computes is read in a browser**: a resolved style, a box, an overlap, a contrast,
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  pinned here or by `vellum-plate-reader`, whose measurements decide an appearance.
```

After:

```
- **What the browser computes is read in a browser**: a resolved style, a box, an overlap, a contrast,
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  measured by `vellum-plate-reader` when it is built or changed, whose measurements decide an
  appearance, and is kept as a browser check only where a critical journey turns on it: a press a
  reader must reach or must see answer the hand, or a floor a ruling sets for reading or typing
  (4.5:1 over the chart, the 16 px a typing field takes). A claim of dress alone (a colour, a size,
  a rounding, a shadow, a hover or focus colour, how a motion is staged) takes no browser check and
  is checked by eye (Alex, 2026-11-09, Issue #1273), save in the Specimen Book's own suite,
  `specimen`, which holds every piece of the kit in each state so the Book does not go stale (Alex,
  2026-11-08, Issue #1273).
```

The carve-outs are the checks Alex kept by name, read at dd686ece: BR21 ("every field the reader
types into on the Broadside ... is set at 16 px or more", comment 6731044042 Q2; `ui-design.md`
line 461 names it), RH31 ("the first and the last nav link each rise by the house raise under the
hand") and H21 ("home's shelf plates rest flat and, under the hand, tip and rise", both kept by
comment 6731645726's small calls), and the `specimen` suite, whose SB3, SB12 and SB14 read dress
("the contents numeral in ink-brown", "italic, in the body face", "the kit's road speaks its verb in
parchment"), kept by comment 6731645726 Q1 ("Keep specimen book. It needs to avoid becoming
stale"). G10's hover colour (deleted, comment 6729237220) stays on the dress side, RH31's raise on
the kept side.

**E4** (lessons 1, 2, 3 and 5, +7; Q2 (a)). Before:

```
- **A browser check is kept for what it holds against what it costs.** How what it holds is
  counted, when a slow one is pulled out of the run, and when one is deleted, is
  `handbook/specs/settle-doctrine.md`'s (When a check leaves the run).
```

After:

```
- **A browser check is written, and kept, for what it holds against what it costs.** Each one a
  change adds or makes longer carries its ledger line (Alex, 2026-11-08, Issue #1273), in the plan
  that adds it and in the pull request body: the critical journey it serves; why no unit test can
  hold each of its claims (the bullet below); and, for each room, window, page, seed or path it reads
  past the first, what that one alone runs. What it holds and what it costs are counted as
  `handbook/specs/settle-doctrine.md` says (What a step holds, Who finds a slow step). A check whose
  coverage would be needless on a ground that file names is not written, and a page whose journey
  Alex has not ruled goes on the plan's menu before a check is written there. When a slow one is
  pulled out of the run, and when one is deleted, is `handbook/specs/settle-doctrine.md`'s (When a
  check leaves the run).
```

**E5** (lesson 4, +1). Before (lines 160 to 167):

```
- **A claim a deleted browser check held moves to a unit test wherever one can hold it alone
  (Alex, 2026-11-08, Issue #1273).** The test checks that one claim and nothing beside it, runs
  fast, and gives the same answer on every run: no browser, no wall clock, no dependence on the
  order tests run in. It keeps the rules of "The unit suite" above, and it is written before the
  check is deleted, with the mutation that reds it named, and proven as any new guard is
  (`handbook/specs/development-workflow.md` step 11). Where page code has to change for a unit
  test to hold the claim, the change is source work written test first, and the function it makes
  takes its inputs (a clock, a reduced-motion flag, a measured box) as arguments and returns its
```

After:

```
- **A claim goes to a unit test wherever one can hold it alone, a new claim as well as one a
  deleted browser check held (Alex, 2026-11-08, Issue #1273).** The test checks that one claim and
  nothing beside it, runs fast, and gives the same answer on every run: no browser, no wall clock,
  no dependence on the order tests run in. It keeps the rules of "The unit suite" above, it is
  proven as any new guard is (`handbook/specs/development-workflow.md` step 11), and a moved claim's
  test is written before the check is deleted, with the mutation that reds it named. Where page
  code has to change for a unit test to hold the claim, the change is source work written test
  first, and new page code is shaped the same way from the start: the function takes its inputs (a
  clock, a reduced-motion flag, a measured box) as arguments and returns its
```

The rest of that bullet ("result, so one test can drive it ... (When a check leaves the run).") stays.

### `handbook/specs/settle-doctrine.md` (776 lines, about 781 after)

**E6** (lesson 6, +1; Q3 (a)). Before (lines 303 to 305):

```
- **A check's coverage is needless on one of two grounds (Alex, 2026-11-08, Issue #1273).** It
  covers no critical journey and is easy to verify by hand, as on a simple page or in the masthead
  every page wears (its head cluster, its corner and its nav). Or it is coverage a critical journey
```

Its next line, 306, opens `  does not need: one rule read in every room that takes it from one shared module (as`.
Replace lines 303 to 306 with:

```
- **A check's coverage is needless on one of two grounds (Alex, 2026-11-08, Issue #1273).** It
  covers no critical journey and is easy to verify by hand, as on a simple page, in the masthead
  every page wears (its head cluster, its corner and its nav), or in a claim of dress alone
  (`handbook/specs/check-placement.md`, The browser lanes and a plate read). Or it is coverage a
  critical journey does not need: one rule read in every room that takes it from one shared module (as
```

**E7** (PR lesson, +2; Q4 (ii)). Before (lines 319 to 320):

```
  making and is ruled the same way, and what the narrowed check keeps is proven to bite as a new
  guard is (`handbook/specs/development-workflow.md` step 11).
```

After:

```
  making and is ruled the same way, and what the narrowed check keeps is proven to bite as a new
  guard is (`handbook/specs/development-workflow.md` step 11). A deleted or narrowed step leaves
  behind what item 11 has a skipped one leave: before it goes, every state it set or waited for that
  a later check in the suite reads is set or awaited by that later check itself.
```

**E8** (PR lesson, +2; Q4 (iii)). Before (lines 251 to 254):

```
  Find a holder with `git grep` for the selector, symbol or constant the claim turns on, then
  read it: a mention is not a hold, and a unit test of the arithmetic behind a claim, or of the
  helper that measures it (`squeezes` in `test/e2e/corners.test.ts`), does not hold the claim on
  the page.
```

After:

```
  Find a holder with `git grep` for the selector, symbol or constant the claim turns on, then
  read it: a mention is not a hold, and a unit test of the arithmetic behind a claim, or of the
  helper that measures it (`squeezes` in `test/e2e/corners.test.ts`), does not hold the claim on
  the page. A holder a plan names as the reason a claim is not lost, or a check not needed, is
  confirmed by running the claim's mutation and seeing the holder red, and the plan quotes that red
  line; a holder read and not run is named as read.
```

### `handbook/specs/site-architecture.md` (402 lines, unchanged count; Q4 (v))

**E9**. In the single line 383, before:

```
Read a suite's seconds from the lines under `per-suite wall clock` in a lane job's log
```

After:

```
Read a suite's seconds as the median, over three runs of one commit, of its line under `per-suite wall clock` in each lane job's log
```

The rest of the line stays. Run `npm run format:check` (markdown is outside Prettier's roots, so it
does not move; the check confirms it).

### `handbook/specs/conventions.md` (267 lines, about 268 after; Q3 (a))

**E15**. Before (lines 43 to 44):

```
docket rather than being discovered later. Pin correctness-level tests immediately; let
dressing-level pins lag one live-use cycle, so a re-decision does not rip out fresh test investment.
```

After:

```
docket rather than being discovered later. Pin correctness-level tests immediately; dressing is
measured by `vellum-plate-reader` and checked by eye, never pinned in a browser check
(`handbook/specs/check-placement.md`, The browser lanes and a plate read), so a re-decision rips out
no test.
```

### `handbook/specs/development-workflow.md` (492 lines, about 494 after; Q1 (a))

**E19**. An insertion. The text `**In a lane, a finding about the plan's design rather than its
build goes back to` ends line 398 and line 399 opens `the planner**, and through it to Alex, as step
6 says, before anything is fixed or filed. **Other than a NIT, a finding`. Insert, between
`before anything is fixed or filed.` and ` **Other than a NIT`, this sentence:

```
A fix that would add a browser check the plan does not name is such a finding, since the check owes
its ledger line (`handbook/specs/check-placement.md`) and the two readings the plan's Tests line
carries.
```

Every other word of the paragraph stays; line 399 is one long line in this file, so the sentence
joins it as part of that line.

### `.claude/skills/vellum-footguns/SKILL.md` (367 lines, about 375 after)

**E10a** (lesson 1, +1; Q1). Before (lines 40 to 41):

```
5. **N states or N siblings need N pins, not one floor.** Assert each state's own resolved value
   against a measured constant. A shared threshold, or A compared to B, is one pin written N times.
```

After:

```
5. **N states or N siblings need N pins, not one floor.** Assert each state's own resolved value
   against a measured constant. A shared threshold, or A compared to B, is one pin written N times.
   A sibling is an instance as item 6 defines it.
```

**E10** (lesson 1, +4; Q1). Before:

```
6. **Guard the class.** List every instance the rule binds (every arm of a selector list, every page
   that carries its own sheet, every seat of the lattice) and sweep them. Two samples is the instance.
```

After:

```
6. **Guard the class.** List every instance the rule binds (every arm of a selector list, every page
   that carries its own sheet, every seat of the lattice) and sweep them. Two samples is the instance.
   An instance is a place the rule can break on its own: rooms that take the rule from one shared
   module and are held to it by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` are one
   instance, read in one room, and a room keeps a read of its own only for the part of the rule its
   own code carries (Issue #1273).
```

**E11** (lesson 4, +2; Q4 (iv)). Before:

```
20. **A ratified acceptance gets a driving check beside any pure-function read**
    (PR #631).
```

After:

```
20. **A ratified acceptance gets a driving check beside any pure-function read**, one that runs the
    code the page runs: a unit test of the function the page itself calls wherever the page is shaped
    so one can (`handbook/specs/check-placement.md`), a browser check only where the path runs in the
    browser alone (PR #631, Issue #1273).
```

**E12** (lesson 5, 0; Q2). Before:

```
17. **Count and time a new or longer check** (settle-doctrine; Issue #1063).
```

After:

```
17. **Count, time and justify a new or longer check**: its ledger line (`handbook/specs/check-placement.md`)
    and its seconds (`handbook/specs/settle-doctrine.md`; Issue #1063, Issue #1273).
```

**E13** (lesson 2, +3; Q2). Before (the end of item 3, line 212):

```
   `innerWidth` recorded beside the width set (Issue #638).
```

After:

```
   `innerWidth` recorded beside the width set (Issue #638). That sweep is how you look while you
   build: the browser check that stays reads the widths where the rule can break, both sides of each
   edge the sweep found (Gate 1 item 11), and names any other width in its ledger line
   (`handbook/specs/check-placement.md`; Issue #1273).
```

**E14** (lesson 6, 0; Q3 (a)). Before (lines 221 to 222):

```
   The ruling stays provisional until Alex has used the branch live. Pin correctness now, let
   dressing-level pins lag one live cycle.
```

After:

```
   The ruling stays provisional until Alex has used the branch live. Pin correctness now; dressing
   is measured and checked by eye, never pinned (`handbook/specs/check-placement.md`).
```

No `## Gate N` heading changes, so the selftest's seven headings stand.

### `.claude/agents/vellum-guard-prover.md` (150 lines, unchanged count; Q1)

**E16**. Line 101, before:

```
Then sweep the class. If the bug hit one instance of N (one of four selectors bound together, three of seven swept pages, one culture of ten), check whether the guard covers all N. A guard written from a bug report comes out shaped like the bug, not the bug's class.
```

After:

```
Then sweep the class. If the bug hit one instance of N (one of four selectors bound together, three of seven swept pages, one culture of ten), check whether the guard covers all N. A guard written from a bug report comes out shaped like the bug, not the bug's class. An instance is a place the rule can break on its own (`vellum-footguns` Gate 1 item 6): rooms held to one shared module by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` are one instance, so a browser check read in one of them covers that class, and a gap across them is the module's test or the lint's to close, never a read in every room.
```

Line 132, before:

```
Verdicts are BITES (exactly the claimed test went red), HOLE (nothing went red), or IMPRECISE (something red, but not the test claiming the guard). For every HOLE, propose the specific assertion that would close it, and say which existing test file it belongs in.
```

After:

```
Verdicts are BITES (exactly the claimed test went red), HOLE (nothing went red), or IMPRECISE (something red, but not the test claiming the guard). For every HOLE, propose the specific assertion that would close it, and say which existing test file it belongs in: a unit test's wherever one can hold the claim (`handbook/specs/check-placement.md`), a browser check's only where none can.
```

### `.claude/agents/vellum-pr-skeptic.md` (127 lines, unchanged count; Q1 and Q2)

**E17**. Line 97, before:

```
- **Tests.** The PR should carry a test that fails on the assertion under change, not on a missing module. The known shipped-green shapes are relative-to-sibling assertions, count-only assertions, circular oracles, and short circuits that swallow the assertion. A guard shaped like the reported bug rather than its class (#295) is a finding: name the uncovered instances.
```

After:

```
- **Tests.** The PR should carry a test that fails on the assertion under change, not on a missing module. The known shipped-green shapes are relative-to-sibling assertions, count-only assertions, circular oracles, and short circuits that swallow the assertion. A guard shaped like the reported bug rather than its class (Issue #295) is a finding: name the uncovered instances, an instance being a place the rule can break on its own (`vellum-footguns` Gate 1 item 6). A browser check the diff adds or makes longer is read against its ledger line (`handbook/specs/check-placement.md`): one with no line, one whose claim a unit test could hold or another check already holds, or one reading a room, window, page or path its line does not justify, is a finding, as a comment's excess is.
```

### `.claude/agents/vellum-planner.md` (69 lines, unchanged count; Q2)

**E18**. In line 36, before:

```
Which tests the prover owes, which ones step 15 leaves to the implementer to prove. For each browser check, also two readings you take yourself while you write the plan:
```

After:

```
Which tests the prover owes, which ones step 15 leaves to the implementer to prove. Each browser check the plan adds or makes longer carries its ledger line (`handbook/specs/check-placement.md`, the bullet opening "A browser check is written"), and one its line does not justify is not planned. For each browser check, also two readings you take yourself while you write the plan:
```

### `handbook/errata/guards.md` (one row, +1)

**E21** (a sibling defect the audit found; rule: workflow step 15 and Gate 5 item 7). Insert after
line 221 (the PR #1243 row), the last row of `## Open`, once the pull request has its number:

```
- PR #<this pull request> (<the commit's date>, medium): RH32's page lists in `e2e/suites/runninghead/room.ts` (`CHART_ROOMS`, `FOG_ROOMS`, `STAGED`, `KIT_ROADS`) restate `ROADS` and `STAGES` in `test/site/astro-scaffold.test.ts` by hand, the restated roster `vellum-footguns` Gate 1 item 16 forbids, so a page that joins one and not the other leaves RH32 green; `handbook/specs/site-architecture.md` lists them among the rosters a page joins by hand. Searched: this directory for `KIT_ROADS` and RH32 (only the PR #867 row on how RH32 pins a folio's lines), and the open issues for `KIT_ROADS` (none but Issue #1273).
```

### The issue filed under Q4 (vi), after the cold review (workflow step 15)

The implementer files it alone, after the cold skeptic's round, with no label, no parent and no
board item (the orchestrator phases it), as PR #1281's lane filed Issue #1282:

1. Two duplicate searches first, each its own command, and the errata grep:
   `gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open shared-bindings Seed of the Day' --jq '.items[] | "\(.number) \(.title)"'`,
   `gh api -X GET search/issues -f q='repo:ahl-gram/Vellum is:open SHARED_BINDINGS' --jq '.items[] | "\(.number) \(.title)"'`,
   and `git grep -n -i "SHARED_BINDINGS\|shared-binding" -- handbook/errata`. At the fold (dd686ece,
   2026-11-09) both searches printed only Issue #1273 and the errata grep printed nothing (exit 1).
   A hit that is the same gap is a stop condition below.
2. Write the body to `<scratchpad>/1273-pr7-issue-body.md`, read it back, then
   `gh issue create --repo ahl-gram/Vellum --title "<the title>" --body-file <that file>`, one plain
   `gh` per call.
3. Name the new issue's number on a line of its own in the report, and in the PR body's Records line
   (Evidence step 8).

`<this pull request>` in the body is the PR number `gh pr create` printed.

Title: `The shared-bindings lint does not hold the Seed of the Day to bindRoom and bindGlassKeys, which the one-room checks lean on`

Body (the whole fix):

```
Found by Issue #1273's lessons audit (pull request 7 of 7, PR #<this pull request>). `vellum-footguns` Gate 1 item 6, as that pull request writes it, reads rooms held to one shared module by `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` as one instance, read in one room. The Seed of the Day calls `bindRoom` and `bindGlassKeys` itself (`src/site/seed-of-the-day/app.ts`, imported at its top), but its entry requires only `createZoomController` and `framingCamera`, so the room EA5 and ZG9 stopped reading (PR #1277) is held by nothing.

The fix:
1. `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts`: the `"src/site/seed-of-the-day/app.ts"` entry gains `["bindRoom", "../shared/room.ts"]` and `["bindGlassKeys", "../shared/glass-keys.ts"]`.
2. `ROSTER` in `test/repo/shared-bindings.test.ts`: the same entry gains `ROOM_BINDING` and `["bindGlassKeys", "../shared/glass-keys.ts"]`, and the test "the roster is exactly the import pins ..." names this issue beside Issue #779 and Issue #1010. Edit the test first: it reds on its `deepEqual` ("the roster is not the import pins ..."), then step 1 turns it green.
3. The mutation that must bite: delete `import { bindRoom } from "../shared/room.ts";` and its call from `src/site/seed-of-the-day/app.ts`; `npm run lint` reds on `vellum/shared-binding-imported` for that file. The same for `bindGlassKeys`.

Done when `npm test -- test/repo/shared-bindings.test.ts` and `npm run lint` pass and the two mutations red the lint. What pins the old text: `ROSTER` in `test/repo/shared-bindings.test.ts` (`git grep -n "seed-of-the-day/app.ts" -- test scripts`). Open decision: none.
```

## Tests

This pull request changes prose only and carries no test: a text edit has no test (workflow step
15's wording for a filed fix). No guard is new or strengthened, so `vellum-guard-prover` is not
owed; no appearance changes, so `vellum-plate-reader` is not owed; no e2e suite changes, so none
runs locally. What reads the edited prose, each run alone after the edits:

| test | what it reads | how this change could red it |
|---|---|---|
| `test/repo/prose-paths.test.ts` | every backticked path with a tracked extension under `handbook/specs`, `.claude/skills`, `.claude/agents`, `CLAUDE.md`, `README.md`, `.github` | a new backticked path that does not resolve; every path above exists at dd686ece (`ls test/site/built-pages.test.ts scripts/lint/shared-bindings.ts test/site/astro-scaffold.test.ts e2e/suites/runninghead/room.ts test/e2e/corners.test.ts`); `test-support/built-reads/` has no extension and is not extracted (`PATH` in that test) |
| `test/repo/memory-pointers.test.ts` | `.claude/agents`, `.claude/skills` for any pointer into the private memory | no new text names the memory |
| `test/repo/retired-agents.test.ts` | the phrase plan skeptic outside the rulebook | no new text names it |
| `test/repo/front-matter.test.ts` | agent and skill front matter | no front matter is edited |
| `test/repo/footgun-gate.test.ts` (runs `footgun-gate.selftest.ts`) | seven `## Gate N` headings in `SKILL.md`, each over 200 characters; the PR template's section names | no heading changes; the template is not edited |

The hook reads its gates from the launch checkout (workflow step 9), so the gate edits are not the
version enforced while this pull request is built. Expected.

## Order of commits

Branch `chore/1273-lessons`.

1. `#1273 Write the e2e lessons into the specs, the gates and the review agents (pull request 7 of 7)`:
   the archived plan `handbook/plans/1200/1273/1273-pr7-plan.md` and edits E1 to E19 that Alex's
   rulings keep. Push at once.
2. After `gh pr create`: `#1273 Record the restated RH32 rosters as an errata row`: E21 with the
   pull request's number and the commit's date. Push before the cold skeptic is dispatched.

## Rosters and doctrine

- No roster changes: no page, sheet, suite, lane or bundle.
- `CLAUDE.md`'s spec table row for `handbook/specs/check-placement.md` stays: "before writing a test,
  a lint rule or a browser check" already covers the ledger.
- Every line this pull request contradicts is edited by it: L1, L2, L3, L6, L7, L10 above.
- No scars row: a scars row proves a gate bites, and these lines carry Issue #1273's rulings as their
  warrant (conventions, the strict filter).

## Evidence

1. `git diff --stat origin/main` names only the files under Files.
2. Each "after" text is present: `git grep -n -F "A browser check is written, and kept"`,
   `git grep -n -F "An instance is a place the rule can break on its own"`, and one `git grep -F`
   per edit on a phrase only its after text carries.
3. `npm test -- test/repo/prose-paths.test.ts test/repo/memory-pointers.test.ts test/repo/retired-agents.test.ts test/repo/front-matter.test.ts test/repo/footgun-gate.test.ts`, then `npm test` (then
   `npm run astro:generate`), `npm run check`, `npm run lint`, `npm run format:check`.
4. `git diff -U0 origin/main -- '*.md'`, plus-lines only, carries no em-dash.
5. `gh pr view <N> --json closingIssuesReferences` lists Issue #1273 alone.
6. E2e suites touched: none. `vellum-plate-reader`: not owed. `vellum-guard-prover`: not owed.
   `vellum-pr-skeptic`: once, cold.
7. The PR body's step 14 line: "This pull request edits `.claude/agents/vellum-planner.md`,
   `.claude/agents/vellum-guard-prover.md` and `.claude/agents/vellum-pr-skeptic.md`. The definition
   that wrote the change is `vellum-implementer` (<its model id>); the cold skeptic that reviews it is
   `vellum-pr-skeptic`, whose own definition this pull request changes, so its report is not evidence
   that the new definition works (`handbook/specs/development-workflow.md` step 14); the guard prover
   is not run on it."
8. The Records line names the issue filed under Q4 (vi) by its number once it is filed, through one
   `gh pr edit <N> --body-file` after the cold skeptic's round.

## Calls made

1. **Lessons 1, 2, 3 and 5 share one home, check-placement's "A browser check is ... kept" bullet,
   rewritten as "written, and kept".** Rule: conventions, one normative home; check-placement is the
   instrument choice and its required reading precedes writing a browser check. Rejected:
   settle-doctrine "Who finds a slow step" (the cost reading, which the ledger points at).
2. **The grounds are pointed at, not restated.** Rule: conventions, two copies are two rules.
3. **Lesson 1's instance is defined at Gate 1 item 6**, with the prover and the skeptic pointing at
   it. Rule: conventions, an imperative keyed to the moment of typing a test is a gate.
4. **Lesson 2 is a clause at Gate 3 item 3**, where the sweep is taught. Rule: the sweep that became
   CO1 (PR #742) was that line's method.
5. **The dress rule is put to Alex as a sixth lesson (Q3)**, not folded into the five. Rule: the
   acceptance names five; a sixth is a new rule and his.
6. **No mechanical guard is built here; the one candidate is filed (Q4 (vi)).** Rule: check-placement
   (a judgment is not a lint's), and this pull request stays a docs change.
7. **`vellum-implementer.md` and `vellum-plate-reader.md` take no edit.** Rule: the implementer's
   design hand-back already covers E19; the plate reader proposes no check.
8. **The RH32 roster restatement is an errata row (E21), not a rule.** Rule: workflow step 15, a
   sibling defect found and not caused goes to a row; Gate 1 item 16 already forbids it.
9. **No check is deleted or narrowed.** Rule: settle-doctrine, every deletion is Alex's by name.
10. **`BALANCE_CAP`, Issue #1282 and the board stay out.** Rule: not this pull request's (PR #1281
    call C5 is relayed; Issue #1282 owns the shards).
11. **`Closes #1273`.** Rule: comment 6725886233.
12. **Alex's five lessons carry "(Alex, 2026-11-08, Issue #1273)"; the dress rule carries
    "(Alex, 2026-11-09, Issue #1273)", the day he ruled it.** Rule: conventions keeps the ruling tag
    and drops other provenance.
13. **`#295` on the skeptic's Tests line becomes `Issue #295`.** Rule: conventions, a bare number is
    trimmed as its line is touched.
14. **Two commits, the errata row after the pull request has its number.** Rule: PR #1277 call 8,
    the precedent for a row that needs its pull request's number.
15. **The issue filed under Q4 (vi) has no label or parent, and the implementer files it alone.**
    Rule: PR #1281 call C10; the board is the orchestrator's, who phases it.

## Open decisions

none

What each ruling keeps (all edits are built; nothing is dropped):

- Q1 (a): E10a, E10, E16, E17's instance clause, E19.
- Q2 (a): E4 with its clause "a page whose journey Alex has not ruled goes on the plan's menu before a
  check is written there", E12, E13, E17's ledger sentence, E18.
- Q3 (a): E3, E6, E14, E15.
- Q4 (a): E1 and E2 and E5 (i), E7 (ii), E8 (iii), E11 (iv), E9 (v), the issue (vi). E8's measured
  cost, as the menu put it: the deletion tables of this issue's four cutting plans name a holder in
  29 of 37, 32 of 44, 47 of 65 and 35 of 56 rows, so a cut of that size pays roughly that many proof
  rows, one or two proof-runner runs (PR #1280 sent 42 rows in one, run 42608103721).

## Stop conditions

- A "before" text above is not present verbatim on the branch: hand back (a spec moved under the
  plan; the after text was written against dd686ece).
- `test/repo/prose-paths.test.ts` reds on a path an after text carries: hand back with the path.
- `test/repo/footgun-gate.test.ts` reds: hand back.
- `git diff --stat origin/main` names a file outside Files: hand back.
- A duplicate search for the Q4 (vi) issue finds an open issue or an errata row for the same gap:
  file nothing, and name it in the report and the PR body instead.
- The cold skeptic finds that an after text restates a rule another home holds (its Duplication
  lens): a design finding, hand back.
