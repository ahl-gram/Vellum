# Issue #1309, pull request 2: `vellum-plate-reader` sets two versions of one sheet before the still judge

**Planned at**: `origin/main` 5d8ff76f6541457b2d2d357531055a1a69bff9b2 (PR #1349 merged; PR #1347, this issue's first pull request, merged as a65aae66), Issue #1309 read with 10 comments: 6777274628 (the trial-only ruling relayed from Issue #1304), 6804409144 (the first menu), 6804844266 (the second menu: build the four as a comparison; placing it in the plate reader is a later pull request planned from the score), 6805093599, 6805096614, 6805504659 and 6805507994 (plan archives, not rulings), 6805859666 (PR #1347's step 12 calls), 6806496061 (the review rulings) and 6806664967 (the calls made building them). Re-recorded 2026-11-12 after the rulings: `origin/main` still 5d8ff76f6541457b2d2d357531055a1a69bff9b2, the issue at 11 comments, the eleventh 6810235028 (the rulings below). PR #1350 (Issue #1343) was open and unmerged at head 340a4232f118809ad987061b16575199f89801e7. Every probe below ran in this planner's tree at 5d8ff76f.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6810235028 (Alex, 2026-11-11, relayed by the orchestrating session), all three on the recommendation: D1 (b), the comparison at a step 6 sitting, each candidate against today's chart, and again before a pull request that changes how the map sheet is drawn, the built chart against today's, a pull request that cannot change the drawn map asking nothing and spending nothing; D2 (b), five charts per comparison, reported as a count per version, picture kind and question ("reads worse on 3 of 5"), never one line as a verdict; D3 (a), one live test before the instructions rely on it, today's chart against an identical copy for each of the three picture kinds, the plan coming back to Alex if any answer failed (none did: Measured item 9). Standing: Issue #1304's ruling 1 and its amendment 6782799529 (agents may run the Jev commands, every use advisory, never in `npm test`, a required check or a hook refusal; the key read from `TYPESAFE_API_KEY` or `~/.config/typesafe/key` and never printed); this issue's 6804844266 (a difference under 0.12 is none, one picture's number is never a pass or a fail).

**Open decisions**: none.

## What this is

PR #1347 built `npm run still-judge -- compare <sheet|rainfall|crop> <today.png> <other.png>...`, which asks Jev four frozen questions of two versions of one chart and prints, per question, both numbers, the difference and a reading (reads better, reads worse, no difference), ending with the rule. It left `.claude/agents/vellum-plate-reader.md` unedited. This pull request writes into that definition when the plate reader runs the comparison, how it makes the pictures so that they are the pictures the trial scored, and how the result reads in its report, and points the two specs that name the command or the agent at that one home. It adds no code and no test. It closes Issue #1309.

## Specs

The implementer reads these first, on top of what `CLAUDE.md`'s spec table owes:

- `CLAUDE.md`: Process (no em-dashes, the attribution bullet), Measure before you assert.
- `handbook/specs/development-workflow.md`: steps 7 to 15; step 6's paragraph opening "Arms that coexist in one spike are cheaper to read", which this pull request extends; step 14's paragraph opening "An agent whose own DEFINITION this pull request changes".
- `handbook/specs/conventions.md`: Where a rule lives (exactly one normative home, every other copy points at it by name); How a spec, and the rest of the house's prose, is written (prescriptive voice, `Issue #N` form, a backticked path is scanned).
- `handbook/specs/check-placement.md`: What no check holds, the bullet opening "No check holds a judgment that rests on a probability", whose still-judge item this pull request extends.

## Recon, folded (workflow step 5)

`vellum-spec-recon` at 5d8ff76f: 29 ledger rows, 2 STALE, 25 CURRENT, 2 UNVERIFIABLE; its triage asked 8 of 19 claims live, 10,976 input tokens.

- **STALE, cosmetic**: "the shared client sends text only today". PR #1347 taught it images. Nothing here rests on it.
- **STALE as a design, and it shapes this plan**: the body's proposal items 1 to 3 (Jev answers per still, the agent reports each still's numbers) were replaced by the second ruling's comparison. So the plate reader reports only differences between two versions, never one still's number; item 4 (the step 6 comparison table) survives and is D1's first half.
- **UNVERIFIABLE**: `handbook/specs/ui-design.md`'s "five pieces checked by eye" (not cited here) and the trial's scores, which rest on the archived run (`out/1309-live/score.md` in the main checkout, read by this planner; the reply-level figures below are recomputed from its `replies.jsonl`).
- **Recon's open item 1 (may a Jev reading be a criterion's MET or NOT MET)**: taken as Call 9 on `handbook/specs/check-placement.md`'s "a reader's hypothesis that a command still confirms" and the second ruling. **Item 2 (when)**: ruled, D1 (b). **Item 3 (which pictures)**: Call 3. **Item 4 (the keyless report)**: Call 10. **Item 5 (the inclusive 0.12 and hundredths)**: built and ratified in PR #1347 under the second ruling's words ("under 0.12 is none"); not reopened. **Item 6 (a model move)**: the command's first line names the model and the report quotes it; the trial rule for a model move already lives in `handbook/specs/check-placement.md`.
- **Rejected**: recon's warning that the definition might pass "the footgun hook's 9,000-character size check". That bound is `HOOK_CONTEXT_LIMIT` in `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`, on the gate text the hook pastes, not on an agent file (`.claude/skills/vellum-footguns/hooks/README.md`, the paragraph naming it).
- **Noted, not filed**: recon saw that in a dry run where today's picture is refused, the other line names the dry-run skip and not today's refusal (`compareLines` in `scripts/still-judge/report.ts` checks the other picture first). The first line's `refused unsent` count still says it, a live run names today's refusal, and the recipe below never sends a picture outside the limits, so no reader is misled.

## Measured before planning

Probes and logs are in this planner's `out/1309-pr2-probe/` (the dispatcher copies the tree's `out/` across at retirement); every run was at 5d8ff76f on this Mac.

1. **The recipe gives the very pictures the trial scored.** `node src/cli/main.ts chart --seed 1 --legend --out ...` and the same with `--theme moisture` write the sheets `sheetsOf` in `scripts/still-judge/trial-set.ts` writes, byte for byte, from the tree and from an archive of the commit (`node out/1309-pr2-probe/1309-pr2-same-sheet.ts 1`, log `1309-pr2-same-sheet.log`: sheet sha256 prefix 6ccffd6a6b34e476, rainfall b42c6ee76b337d5a, both 1500 by 1158). Shot through `node scripts/design/shoot.ts out/1309-pr2-probe/shots.json --site out/1309-pr2-probe/sheets` (6 shots, exit 0, 4.0 s, no console error or 4xx, log `1309-pr2-shoot.log`), the stills hash to the live trial's own seed 1 stills: sheet 3744f637baa2657c..., rainfall f592e7498ac60a5e..., crop 7aa1117703129dc7... (`1309-pr2-still-hashes.log`, against `out/1309-live/stills/1-*-clean.png` in the main checkout).
2. **Today's source from a commit, written only into `out/`.** `git archive --output=out/1309-pr2-today/today.tar 5d8ff76f... package.json src` took 0.04 s and wrote 14,551,040 bytes; `tar -x -f ... -C out/1309-pr2-today` and `node out/1309-pr2-today/src/cli/main.ts chart --seed 1 --legend --out ...` drew the same sheet in 0.6 s. `tsconfig.json`'s `include` names no `out/` path, the lint takes the `.gitignore` as ignored, and `npm test` collects only `test/`, so the copy is inert.
3. **The trigger.** `git diff --stat <base> -- src ':!src/site' ':!src/pages' ':!src/styles' ':!src/static'` printed nothing at a clean tree, and `src/render/style.ts | 2 ++` after a throwaway uncommitted append (restored with `git checkout --`): it compares the base with the working tree, so an uncommitted spike counts.
4. **The subject and crop one-liner** (Files, the section's step 4) printed `{"carries":true,"clip":{"x":205,"y":648,"width":600,"height":400}}` for seed 1 and `{"carries":false,"clip":null}` for seed 3, one of the seeds the trial set leaves out (`1309-pr2-subjects.log`).
5. **The command's two quiet paths.** `npm run --silent still-judge -- compare sheet <seed 1 today> <seed 1 tree> --dry-run --out out/1309-pr2-probe/cmp-dry` exited 0 with four lines, the last `COMPARISON_RULE` (`1309-pr2-compare-dry.txt`). With no key: `npm test -- test/repo/still-judge-main.test.ts` passed 4 of 4, its first test holding exit 1 and `<path>: not compared: skipped: TYPESAFE_API_KEY is not set and ~/.config/typesafe/key holds no key` (`1309-pr2-main-test.log`); recon ran the same keyless case by hand with the same result. This tree's fence refuses a command that sets `HOME`, so the planner did not rerun it by hand.
6. **What one chart's comparison is worth** (`node out/1309-pr2-probe/1309-pr2-rates.ts`, log `1309-pr2-rates.log`, from the live trial's 270 replies, no call made). Read at the 0.12 floor, today's chart against its own restaged fault read worse on 15 of 30 charts for realm names, 19 for rainfall lines, 22 for the range name in the piece and 28 for the title, and never the wrong way. A fault on another part of the sheet read a difference on 0 to 4 of 30. The same picture asked twice read a difference once in 60 answer pairs (the title, exactly 0.12). Over every set of N charts drawn from the 30: at N = 5 at least one chart reads the fault worse 98% to 100% of the time, and a fault elsewhere shows on at least one chart up to 54% of the time but on most of the five 1% or less; at N = 10, 100% and up to 82%, most 0%.
7. **Spend and time.** Per request (the live run's `run.log`, less about 100 tokens a dropped question): a sheet about 5,020 input tokens, a rainfall plate about 5,120, a piece about 1,048, so about 11,200 a version of one chart, about $0.0005 at $0.042 a million (Issue #1343's body, from TypeSafe's model page). Replies took 721 ms on average for a sheet, 739 for a rainfall plate, 258 for a piece (`1309-pr2-reply-ms.log`); with 0.6 s a drawn sheet and about 0.6 s a still, a version of one chart takes about 5 s.
8. **The edits place, and the prose tests read them green.** `node out/1309-pr2-probe/1309-pr2-apply.ts <this plan>` applied every edit under Files to the three files, each anchor found exactly once (the plate reader's definition 68 lines to 83); `npm test -- test/repo/prose-paths.test.ts` and `npm test -- test/repo/memory-pointers.test.ts` then passed 4 of 4 each (`1309-pr2-prose-paths.log`, `1309-pr2-memory-pointers.log`), with no em-dash on an added line (`1309-pr2-staged.diff`); the files were restored with `git checkout --`. An earlier draft's bare `notes.md` would have been read as a citation matching 6 tracked files, which is why Edit 3 names `out/<delivery>/notes.md`.
9. **The live test (D3, run once by this planner, 2026-11-12T00:02:04Z to 00:02:19Z).** Today's seed 1 stills against byte-identical copies (`out/1309-pr2-probe/stills/1-<kind>-today.png` against `1-<kind>-tree.png`), one run per kind, `npm run --silent still-judge -- compare <kind> <today> <copy> --out out/1309-pr2-probe/live/1-<kind> > out/1309-pr2-probe/live/1-<kind>.txt 2>&1`, each exiting 0. First lines: `still-judge compare sheet at jev-1.14.0: 2 pictures, 2 answered, 0 refused unsent, 0 skipped, 10074 input tokens reported`; `still-judge compare rainfall at jev-1.14.0: 2 pictures, 2 answered, 0 refused unsent, 0 skipped, 10272 input tokens reported`; `still-judge compare crop at jev-1.14.0: 2 pictures, 2 answered, 0 refused unsent, 0 skipped, 2096 input tokens reported`. All 6 requests answered, 22,442 input tokens in all (a sheet 5,037, a rainfall plate 5,136, a piece 1,048), and every one of the six question rows read `no difference`, the largest difference -0.10 (`title_reads_first`, 0.79 against 0.69 on the identical sheet). PR #1350 had not merged, so the run wrote no usage line; the dispatcher logs its 22,442 tokens by hand.

## The design

**The definition is the one home.** How and when the plate reader runs the comparison is written in `.claude/agents/vellum-plate-reader.md` as one section, `Two versions of one sheet, asked of Jev`, plus a paragraph of its Reporting and a sentence of its Boundaries. `handbook/specs/check-placement.md`'s still-judge item and `handbook/specs/development-workflow.md`'s agent table each name it, the way the copy-hunt item and the skeptic's row name `vellum-pr-skeptic`; step 6 gains one sentence on what a sitting's dispatch names, since only the dispatch can say how an arm is drawn.

**The recipe, in order** (the exact text is under Files):

1. Owed where the working tree differs from the base (`git merge-base HEAD origin/main`) under `src/`, outside the site, pages, styles and static files, or where the dispatch names a sitting's arms. Otherwise nothing is drawn or asked, and the report says so.
2. Only the three pictures the trial scored: the antique world sheet with its legend at 1500 by 1158, its rainfall plate, and a 600 by 400 piece of the first.
3. Today's sheets are drawn from an archive of the base, never from the working tree, so the control is today's whatever a spike changed.
4. Five charts (D2, ruled): the dispatch's seeds, then `TRIAL_SEEDS` in order, each kept only when today's sheets carry every subject the questions read; the piece's rectangle comes from today's sheet and is used for every version.
5. The other versions: at step 11 this tree's build; at a sitting each arm as the dispatch names it.
6. One shot list through `scripts/design/shoot.ts`, device scale 1 and 200 ms, as the trial shot.
7. A version whose still is byte-identical to today's is not sent; the rest go through `compare`, its lines kept in the delivery.
8. The report counts charts per version, kind and question, quotes the command's last line once, and never turns a reading into a verdict.

**Rejected alternatives** (not choices for the builder):

- **A `still-judge` subcommand that draws, shoots and counts in code.** Cleaner for the agent, but it edits `scripts/still-judge/main.ts`, which Issue #1343's branch `feat/1343-jev-usage-log` rewrites (`main` takes `sendFor`, the tail becomes `runCommand`), and the existing camera and command already do every step.
- **Today's sheets from the working tree's control arm.** A spike may change shared renderer code, so the control would not be today's; the archive costs 0.04 s.
- **`origin/main`'s head as today's at step 11.** Where main has moved, it mixes another change into the comparison; the merge base isolates the pull request's own, and the report names main's head where they differ.
- **`chart --png`.** Its default scale 2 draws a 3000 by 2316 still the command refuses (`MAX_SIDE` 1568 in `scripts/still-judge/png.ts`), and its `--window-size` route was never scored.
- **Asking identical pictures.** It reads the noise floor and nothing else.
- **Rooms, pages, region sheets and the other three styles.** No question was scored on them (Call 3).
- **A line in step 11.** The plate reader's own definition already runs there; only step 6's dispatch owes something new.

## Files

### Edited: `.claude/agents/vellum-plate-reader.md` (68 lines, 83 after)

**Edit 1.** Insert this section between the Plumbing section's last paragraph (the one opening "Pick server and debugger ports distinct") and the line `## Boundaries`, with one blank line before and after it, exactly:

```markdown
## Two versions of one sheet, asked of Jev

Where the work changes how the engine draws a world sheet, also ask TypeSafe's Jev four questions of today's sheet and of each other version through `npm run still-judge -- compare` (`scripts/still-judge/main.ts`), at a step 6 sitting and at step 11 alike. What it answers is a reader's hypothesis beside your measurements, never one of them (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability"). Run each command below on its own, from the tree you were dispatched in; `<delivery>` is your delivery folder's name and `<s>` a seed.

1. **Whether it is owed.** `git merge-base HEAD origin/main` prints the base. The comparison is owed where `git diff --stat <base> -- src ':!src/site' ':!src/pages' ':!src/styles' ':!src/static'` prints a change, or where your dispatch names the sheets of a sitting's arms. Otherwise draw and ask nothing, and say so under the heading Reporting gives the comparison.
2. **Only the pictures the trial scored.** The world sheet in the antique style with its legend, at the 1500 by 1158 it is drawn; the same sheet's rainfall plate; and a 600 by 400 piece of the first at 1:1. No other style, region sheet, room, page or Explorer state is asked, since no question has been scored on one. Never rasterize with `chart --png`, whose default scale draws a still the command refuses.
3. **Today's source, from the base and never the working tree.** `mkdir -p out/<delivery>-still-judge/base`, then `git archive --output=out/<delivery>-still-judge/base.tar <base> package.json src`, then `tar -x -f out/<delivery>-still-judge/base.tar -C out/<delivery>-still-judge/base`. The folder `out/<delivery>-still-judge/` is your workbench for this section, not a delivery.
4. **Five charts.** Take the seeds your dispatch names, then the seeds of `TRIAL_SEEDS` in `scripts/still-judge/trial-set.ts` in their order, one at a time, until five charts carry every subject the questions read. For each seed, draw today's two sheets, `node out/<delivery>-still-judge/base/src/cli/main.ts chart --seed <s> --legend --out out/<delivery>-still-judge/sheets/<s>-today-sheet.svg` and the same with `--theme moisture` added, writing `<s>-today-rainfall.svg`, then run `node --input-type=module -e 'import { readFileSync } from "node:fs"; import { carriesEverySubject, cropClip } from "./scripts/still-judge/restage.ts"; const [sheet, rain] = process.argv.slice(1).map((p) => readFileSync(p, "utf8")); const carries = carriesEverySubject(sheet, rain); console.log(JSON.stringify({ carries, clip: carries ? cropClip(sheet) : null }));' out/<delivery>-still-judge/sheets/<s>-today-sheet.svg out/<delivery>-still-judge/sheets/<s>-today-rainfall.svg`. It prints `"carries":true` and the piece's `clip` for a chart to take, that clip serving every version of the chart, and `"carries":false` for a seed to leave out and name.
5. **The other versions.** At step 11 there is one, this tree's, named `build`: `node src/cli/main.ts chart --seed <s> --legend --out out/<delivery>-still-judge/sheets/<s>-build-sheet.svg`, and the same with `--theme moisture` added, writing `<s>-build-rainfall.svg`. At a sitting each arm is drawn by the command your dispatch names for it, or is the sheet file it names, written as `<s>-<arm>-sheet.svg` and `<s>-<arm>-rainfall.svg`. A version whose sheet does not open with `width="1500" height="1158"` (`head -c 120` of the file shows it) is not the picture the trial scored, and is named and not asked.
6. **Shoot.** Write `out/<delivery>-still-judge/shots.json`, a JSON array of three shots for each version of each chart, every one carrying `"width": 1500, "height": 1158, "mobile": false, "waitMs": 200`: `"url": "/<s>-<version>-sheet.svg"` with `"out": "out/<delivery>-still-judge/stills/<s>-sheet-<version>.png"`; `"url": "/<s>-<version>-rainfall.svg"` with `"out": "out/<delivery>-still-judge/stills/<s>-rainfall-<version>.png"`; and `"url": "/<s>-<version>-sheet.svg"` again with `"clip"` the chart's clip and `"out": "out/<delivery>-still-judge/stills/<s>-crop-<version>.png"`. Then run `node scripts/design/shoot.ts out/<delivery>-still-judge/shots.json --site out/<delivery>-still-judge/sheets`.
7. **Ask.** For each chart and each kind (`sheet`, `rainfall`, `crop`), set aside every other version whose still `cmp -s` finds identical to today's: it is counted as identical and not sent. Where one remains, run `mkdir -p out/<delivery>/still-judge`, then `npm run --silent still-judge -- compare <kind> <today's still> <each remaining still> --out out/<delivery>/still-judge/<s>-<kind> > out/<delivery>/still-judge/<s>-<kind>.txt 2>&1`, and read its exit status.
```

**Edit 2.** In `## Boundaries`, the first paragraph is today `Write only into `out/`. Never edit source, tests, or committed charts. If you believe a fix is needed, describe it; do not apply it.` Append to that same paragraph, after "do not apply it.", one space and exactly:

```markdown
`npm run still-judge` may add its own record of a run outside `out/` (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability"); that is the command's write, not yours.
```

**Edit 3.** In `## Reporting`, after the paragraph opening "Lead with what you measured" and before the paragraph opening "**A step 6 sitting has no acceptance criteria yet**", insert one paragraph, with a blank line before and after it, exactly:

```markdown
**The still judge's comparison has its own heading, Still judge (advisory), after your measurements.** Under it: one line naming the base sha (and `origin/main`'s head where it differs), the charts asked and those left out, the versions, the model the command's first line names, and the input tokens its first lines report, summed; then one row per version, kind and question, counting the charts that read worse, read better, no difference, identical to today's and not compared, never one picture's number; then the command's last line, quoted once. Write the same to `out/<delivery>/still-judge/summary.md`, which your `out/<delivery>/notes.md` names. A reading is never a criterion's MET or NOT MET, and it ranks no arm. "No difference" is not "no change": in Issue #1309's trial, today's chart set beside its own known faults read as no difference on up to half the charts. Where a question reads worse on more charts than it reads better, say so in one line, as the hypothesis your measurements did or did not check. Lines reading `not compared: skipped`, with an exit of 1, as every line reads with no key or no network, mean nothing was compared: say so in one line with the reason they give, and the rest of the report stands. Never report a skipped comparison as no difference, and never read or print the key file or the key variable the command reads.
```

**Edit 4.** In the paragraph opening "**A step 6 sitting has no acceptance criteria yet**", the sentence `Report each arm against the control on the same measurements, say which arm wins each and by how much, and name what each arm costs the reader.` becomes exactly `Report each arm against the control on the same measurements and the still judge's rows, say which arm wins each and by how much, and name what each arm costs the reader.`

Nothing else in the file changes, the frontmatter included.

### Edited: `handbook/specs/check-placement.md`

The still-judge item of the bullet opening "No check holds a judgment that rests on a probability" is today these seven lines:

```markdown
  - `npm run still-judge` (`scripts/still-judge/main.ts`), how two versions of one chart compare on the four
    questions in `scripts/still-judge/questions.ts` (each realm name readable, the rainfall lines leading, every name
    in a piece readable, the title read first), a difference under 0.12 counting as none and no one picture's number
    read as a pass or a fail, its trial scored against three defects the house fixed and one invented, put back on
    today's chart (Issue #1309); its `trial` scores the 30 charts of seeds 1 to 35 whose sheets carried every
    subject the restages needed, and a question reworded after its score is scored again on charts from seed 36 up,
    which `--seeds <from>-<to>` picks (at most a hundred seeds, those whose sheets lack a subject left out);
```

They become exactly:

```markdown
  - `npm run still-judge` (`scripts/still-judge/main.ts`), how two versions of one chart compare on the four
    questions in `scripts/still-judge/questions.ts` (each realm name readable, the rainfall lines leading, every name
    in a piece readable, the title read first), a difference under 0.12 counting as none and no one picture's number
    read as a pass or a fail, its trial scored against three defects the house fixed and one invented, put back on
    today's chart (Issue #1309), which `vellum-plate-reader` runs beside its measurements wherever a change reaches
    how a world sheet is drawn (`.claude/agents/vellum-plate-reader.md`, Two versions of one sheet, asked of Jev);
    its `trial` scores the 30 charts of seeds 1 to 35 whose sheets carried every subject the restages needed, and a
    question reworded after its score is scored again on charts from seed 36 up, which `--seeds <from>-<to>` picks
    (at most a hundred seeds, those whose sheets lack a subject left out);
```

### Edited: `handbook/specs/development-workflow.md`

**Edit A.** The agent table's plate-reader row is today:

```markdown
| `vellum-plate-reader` | 6, 11 | the built page or chart, rendered in a real browser at real viewports, and measured | a layout, overlap, contrast or motion defect that no test reading the DOM can see |
```

It becomes exactly:

```markdown
| `vellum-plate-reader` | 6, 11 | the built page or chart, rendered in a real browser at real viewports, and measured, with `npm run still-judge -- compare` beside the measurements wherever the work changes how a world sheet is drawn | a layout, overlap, contrast or motion defect that no test reading the DOM can see, and, as a hypothesis its measurements check, a sheet that reads worse at a glance than today's |
```

**Edit B.** Step 6's paragraph is today:

```markdown
**Arms that coexist in one spike are cheaper to read.** `vellum-plate-reader` writes only into `out/`
and never edits source, so it cannot switch the tree itself: a spike that exposes every arm at once,
behind a flag, a query parameter or separate mock pages, is read by a single run. Where the arms
cannot coexist, whoever dispatches it re-renders between them and says so in the menu.
```

It becomes exactly:

```markdown
**Arms that coexist in one spike are cheaper to read.** `vellum-plate-reader` writes only into `out/`
and never edits source, so it cannot switch the tree itself: a spike that exposes every arm at once,
behind a flag, a query parameter or separate mock pages, is read by a single run. Where the arms
cannot coexist, whoever dispatches it re-renders between them and says so in the menu. Where the arms
change how a world sheet is drawn, the dispatch names, for each arm, the command that writes its
sheet once `--seed`, `--legend`, `--theme` and `--out` are added, or the sheet files themselves, so
the plate reader can set each arm beside today's sheet through the still judge
(`.claude/agents/vellum-plate-reader.md`, Two versions of one sheet, asked of Jev).
```

### Created: `handbook/plans/1300/1309/1309-pr2-plan.md`

This plan, archived unchanged, in the first commit.

No code file, test file, `package.json` script or roster changes.

## Tests

**None, and none is owed.** The pull request changes an agent's instructions and two specs' prose. A unit test reading that wording would be a declaration test (`vellum-footguns` Gate 1) and a source-text search (`handbook/specs/check-placement.md`, The unit suite, the bullet opening "A unit test does not open a source file"); the behaviour the instructions lean on is already pinned by PR #1347's tests (`test/repo/still-judge-main.test.ts` for the keyless exit and its line, `test/repo/still-judge-compare.test.ts` for the floor), and the backticked paths by `test/repo/prose-paths.test.ts`. No guard is new or strengthened, so `vellum-guard-prover` is not owed; no browser check is added, so no ledger line and no readings are owed.

## Order of commits

1. `#1309 The plate reader sets two versions of one sheet before the still judge`: `handbook/plans/1300/1309/1309-pr2-plan.md` and Edits 1 to 4 of `.claude/agents/vellum-plate-reader.md`. Push at once.
2. `#1309 The still-judge item and the workflow name the plate reader's comparison`: the check-placement edit and Edits A and B of the workflow.

## Rosters and doctrine

- `.claude/agents/vellum-plate-reader.md`: the new section, the Boundaries sentence, the Reporting paragraph, the step 6 sentence (Files).
- `handbook/specs/check-placement.md`: the still-judge item names the plate reader (Files).
- `handbook/specs/development-workflow.md`: the agent table's row and step 6's dispatch sentence (Files).
- Checked and left as they stand, since each stays true: `handbook/specs/conventions.md` ("dressing is measured by `vellum-plate-reader` and checked by eye"); `handbook/specs/check-placement.md`'s browser bullet ("A claim of dress alone ... is checked by eye"); step 6's "`vellum-plate-reader` writes only into `out/`" and step 14's "its own boundary writes only into `out/`" (the archive and every file the recipe makes are under `out/`, and the command's own run record is the command's, Edit 2); `CLAUDE.md`'s "It renders through CDP and returns MEASUREMENTS plus named files in `out/`"; `handbook/specs/cloud-routine.md` (the routine owes no plate reader, so no keyless run reaches it there); `vellum-pr-skeptic`'s "Owed companion reports".

## Evidence

Run in the implementer's tree after commit 2, one command at a time, `<delivery>` being `1309-pr2-evidence`, each step's command the definition's own text as committed:

1. Steps 1 to 6 of the new section for seed 1 alone, with this tree as the `build` version: step 1's diff prints nothing (the pull request changes nothing under `src/`), and this evidence run goes on past step 1's "draw and ask nothing" on purpose, to show every command the section names runs as written; step 4's one-liner prints `{"carries":true,"clip":{"x":205,"y":648,"width":600,"height":400}}`; step 6's shoot exits 0 with six stills; `shasum -a 256 out/1309-pr2-evidence-still-judge/stills/*.png` gives today's sheet, rainfall and crop stills beginning 3744f637baa2657c, f592e7498ac60a5e and 7aa1117703129dc7, and the `build` stills the same (Mac only: the faces are the system's).
2. `npm run --silent still-judge -- compare sheet out/1309-pr2-evidence-still-judge/stills/1-sheet-today.png out/1309-pr2-evidence-still-judge/stills/1-sheet-build.png --dry-run` exits 0 with four lines, the last beginning `Read as a comparison of two versions of one chart`.
3. `npm test -- test/repo/prose-paths.test.ts` and `npm test -- test/repo/memory-pointers.test.ts` pass, after `pgrep -fl "node [s]cripts/unit-suite"` prints nothing.
4. `git diff origin/main -- .claude/agents/vellum-plate-reader.md handbook/specs/check-placement.md handbook/specs/development-workflow.md` shows no em-dash on an added line outside a code span.
5. CI green on the pull request; no e2e suite is touched, and none is run locally.

Owed: `vellum-pr-skeptic` cold (step 14). Not owed: `vellum-plate-reader` (the deliverable is not an appearance, and its own definition is what changes), `vellum-guard-prover` (no guard). The body says which version of the plate reader's definition wrote the change and which reviewed it (step 14), and names the five shas of Evidence 1. Its closing line is `Closes #1309`. The implementer makes no live call to TypeSafe at any step.

## Lanes

Issue #1343's PR #1350 (branch `feat/1343-jev-usage-log`, head 340a4232 when this plan was finished, open) shares one file with this pull request, `handbook/specs/check-placement.md`, and no line: its one hunk there is `@@ -248,2 +248,7 @@` at 5d8ff76f, in the paragraph after the list ("Their answers are probabilities..."), and this pull request's is the still-judge item (lines 226 to 232), so either merges cleanly over the other. It also rewrites `scripts/still-judge/main.ts`'s entry point to `runCommand`, which this pull request runs and never edits; `compare`'s printed lines and exit codes are the same on both sides (`runCommand` in that branch's `scripts/jev/cli.ts` adds a usage line and a stderr warning, nothing on stdout). PR #1350 merges first (the dispatcher's order); this branch then takes `git merge origin/main` and reruns Evidence 2. Its change to `scripts/still-judge/main.ts` at 340a4232 is exactly the one Stop condition 1 allows (read with `git diff origin/main...340a4232 -- scripts/still-judge/main.ts`).

## Calls made

1. **No code.** The recipe is written into the definition and runs on the tools main has. Rule: the boring solution, and no edit to `scripts/still-judge/main.ts` while Issue #1343's branch rewrites it (Rejected alternatives).
2. **The definition is the one home**, and the check-placement item and the workflow row name it; step 6 gets one sentence on what the dispatch names; step 11 gets none. Rule: `handbook/specs/conventions.md`, Where a rule lives (exactly one normative home), and `handbook/specs/development-workflow.md` ("its method is its definition under `.claude/agents/`"), on the copy hunt's precedent in `.claude/agents/vellum-pr-skeptic.md`.
3. **Only the three scored pictures**: the antique world sheet with its legend at 1500 by 1158, its rainfall plate, and the trial's 600 by 400 piece. No other style, region sheet, room, page or Explorer state. Rule: Issue #1304's ruling 1 ("each still owes its own score before anything it builds is kept"); Measured item 1 shows the recipe reproduces the scored stills byte for byte. Widening it would take a trial of its own.
4. **Today's version comes from the base commit through `git archive`, never from the working tree**, the base being `git merge-base HEAD origin/main`: at a sitting the commit under the uncommitted spike, at step 11 the one the branch started from. Rule: workflow step 10 ("A comparison's baseline is the control, the arm that ships today ... check how it is actually built"); Measured item 2.
5. **Owed only where `src/` outside the site, pages, styles and static files differs from the base, or the dispatch names arms.** Rule: a pull request that cannot change the drawn sheet spends nothing and waits on nothing; Measured item 3.
6. **A chart is asked only where today's sheets carry every subject the questions read** (`carriesEverySubject` in `scripts/still-judge/restage.ts`), the dispatch's seeds first and then `TRIAL_SEEDS` in order. Rule: the trial asked only such charts.
7. **One piece rectangle per chart, from today's sheet** (`cropClip`), for every version. Rule: two versions of one chart are compared at the same place.
8. **A version still byte-identical to today's is not sent.** Rule: it is not a second version, and asking it reads only the noise floor (one difference in 60 re-asked pairs, Measured item 6). Byte comparison is sound here: both stills are drawn and shot on one machine in one run.
9. **A reading is never a criterion's MET or NOT MET, ranks no arm, and "no difference" is not "no change".** Rule: `handbook/specs/check-placement.md` ("a reader's hypothesis that a command still confirms"), the second ruling, and the plate reader's "Do not recommend one"; Measured item 6 for the miss rate.
10. **A skipped comparison is reported as skipped, the rest of the report stands, and the key is never read or printed by the agent.** Rule: `handbook/specs/check-placement.md` ("a call that fails is reported as skipped, never as nothing found"); `vellum-pr-skeptic`'s copy-hunt line carries the same key sentence. The cloud routine never runs the plate reader (`handbook/specs/cloud-routine.md`, What qualifies), so a keyless run means a machine without Alex's key, not the routine.
11. **The report counts charts per version, kind and question, and copies the command's last line once**; the 0.12 floor is not restated in the definition. Rule: the command prints the rule and the check-placement item holds it; a second statement would be a second home.
12. **Tokens are reported, not dollars.** Rule: the price is TypeSafe's and the balance is counted by Issue #1343's log, not by the agent.
13. **The work folder `out/<delivery>-still-judge/` sits beside the delivery, not in it.** Rule: the delivery page lists every file under its folder (`walkSection` in `scripts/delivery/walk.ts`), and the archive's source tree and some 3.5 MB of stills a version of one chart are not what Alex opens first; the folder has no page, so `out/index.html` does not list it, and the tree's whole `out/` is copied at retirement (`handbook/specs/orchestration.md`).
14. **Shots at 200 ms, device scale 1, through `scripts/design/shoot.ts`.** Rule: the trial's `shotsOf`; Measured item 1.
15. **`development-workflow.md`, already 495 lines on main, is not split** for one added sentence. Rule: the 400-line bound in the workspace's coding rules is for code files; specs are trimmed as they are touched (`handbook/specs/conventions.md`).

## The rulings, folded

The plan was written to the options Alex took, so no section, file or edit changes:

- **D1 (b)**, at a sitting and before the pull request: Edit 1's opening ("at a step 6 sitting and at step 11 alike"), its step 5 (the `build` version at step 11, the arms at a sitting), Edit 4, workflow Edits A and B and the check-placement item stand as written.
- **D2 (b)**, five charts, counted: Edit 1's step 4 (**Five charts**) and Edit 3's row of counts per version, kind and question stand as written.
- **D3 (a)**, the live test: run, every answer returned (Measured item 9), so the plan did not go back. The implementer still makes no live call.

## Stop conditions

Hand back, naming the command and what it printed, when:

1. `git diff --stat 5d8ff76f6541457b2d2d357531055a1a69bff9b2 origin/main -- scripts/still-judge scripts/design/shoot.ts src/cli/main.ts scripts/delivery/walk.ts` shows any change other than Issue #1343's to `scripts/still-judge/main.ts` (its import line, `sendFor` passed to `compare`, `trial` and `main`, and the `runCommand` tail).
2. Any "today" text this plan quotes under Files is not in the file as quoted, so the edit cannot be placed as written.
3. Evidence 1's one-liner prints anything but the line it names, the shoot exits non-zero, or a still's hash begins otherwise than Evidence 1 says.
4. Evidence 2 exits other than 0, or prints other than four lines.
5. `test/repo/prose-paths.test.ts` or `test/repo/memory-pointers.test.ts` reds on a line this pull request adds (every new backticked file name carries a `<` placeholder or a full path that resolves, so a red means the text was not copied as written).
6. `git merge origin/main` conflicts in `handbook/specs/check-placement.md` or any file this plan edits.
7. The cold skeptic finds a contradiction between the new text and a spec or agent line this plan does not list under Rosters and doctrine.
