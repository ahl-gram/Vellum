# Issue #1309, pull request 2, revision 1: the comparison's files go inside the delivery, and step 11 owes it wherever the drawn sheet can change

**Revision 1 of `handbook/plans/1300/1309/1309-pr2-plan.md`** (PR #1352, branch `chore/1309-plate-reader-still-judge`, that plan archived there at 5cc32daaf0bd44a1452ca9be6fd087597e81d563, sha256 920595d0262dd04d9c33809f363fd36c18b183b80cf23bd9625812d787d897dd). What it changes against that plan:

1. **Step 11 owes the comparison for an engine pull request too** (Alex's ruling 1): one sentence in `handbook/specs/development-workflow.md` step 11, and the four other places that say when `vellum-plate-reader` is owed point at it (`.claude/agents/vellum-implementer.md`, `.claude/agents/vellum-pr-skeptic.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `CLAUDE.md`). The plate reader's section says what a dispatch for the comparison alone runs.
2. **The trigger reads only what the chart command imports.** The plan's step 1 diff left out four directories under `src/`; it now leaves out eight, every one measured outside the import closure of `src/cli/main.ts`, and the same paths make the base archive (6.1 MB instead of 14.5 MB).
3. **One folder in `out/`** (Alex's ruling 2): every working file moves from `out/<delivery>-still-judge/` into `out/<delivery>/still-judge/`. The archive's extracted copy sits in a folder whose name begins with a dot, which the delivery page leaves out; the archive, the sheets, the stills and every command's lines, warnings, requests and replies are listed. The plan's Call 13 is withdrawn.
4. **A command's warnings no longer land after its rule.** Step 7 sends stdout and stderr to two files, and Reporting quotes the stdout file's last line and every stderr line apart. The skeptic's hypothesis was measured true on PR #1350's `runCommand`, at its head and on the merged main.
5. **The merge with main is a step of the build**, PR #1350 having merged as 6bdebd7f and PR #1356 after it as 38bfe7ee.

Every other section, edit and call of that plan stands as committed on the branch; this file lists only what changes and what the build does now.

**Planned at**: `origin/main` 38bfe7ee72dcd2574d640b18b1eb6496ad6cb6e8: PR #1356 (Issue #1354, a test-only fix touching `test/repo/working-tree.test.ts`, the flake record and its own plan, none of this revision's files) on top of 6bdebd7fee19ac2df79e148f625cbbac520396e1, PR #1350 (Issue #1343), on top of 5d8ff76f, the two the only commits between them. Issue #1309 read with 14 comments, the last three 6810356807 (the plan archive), 6810424569 (the build's step 12 calls) and 6810706353 (the rulings below). PR #1352 open at 5cc32daa. Every reading below was taken in this planner's tree at 5d8ff76f, those on PR #1350's code at its head 9a755c03 and again on an archive of 6bdebd7f; PR #1356 changes nothing any of them reads (R8).

**Rulings**: https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6810706353 (Alex, 2026-11-11, on PR #1352's cold review, relayed by the orchestrating session): finding 1, the comparison owed for an engine pull request through one sentence in step 11; finding 3, one folder in `out/`, the delivery page listing the comparison's files, the Boundaries line "Your files go in one folder in `out/`" kept true; finding 4 is Issue #1353; finding 5 is not this pull request's (Issue #1354, since fixed on main by PR #1356). Relayed by the dispatcher with them: finding 2 is met by merge order, PR #1350 first (it merged as 6bdebd7f); the skeptic's NIT on the trigger and its untested stderr hypothesis are this planner's to decide and check; every live Jev run now logs itself, so tokens are reported and never logged by hand. Standing, from the plan this revises: https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6810235028 (D1 (b), D2 (b), D3 (a)), Issue #1304's ruling 1 and its amendment, and this issue's 6804844266.

**Open decisions**: none.

## Specs

On top of the plan's own list:

- `handbook/specs/development-workflow.md`: step 11 (the sentence this revision adds), step 8's revision rule (this file's name), step 10's "Bring a branch current with `git merge origin/main`, never a rebase", step 14's paragraph opening "An agent whose own DEFINITION this pull request changes" (now three definitions).
- `handbook/specs/conventions.md`, Where a rule lives: "Exactly one home is normative, and every other copy points at it by name".
- `handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability", as merged at 6bdebd7f: its run-record sentence ("Every one of them runs through `runCommand` in `scripts/jev/cli.ts` ...") is what the Boundaries sentence points at.
- `handbook/specs/cloud-routine.md`, What qualifies (Call r1-8).

## Recon

Not run again. Recon's ledger at 5d8ff76f (29 rows, 2 STALE, 25 CURRENT, 2 UNVERIFIABLE) stands: main has moved by PR #1350 alone, whose files this revision reads by command (Measured R4, R8), and recon's triage asks Jev live, which this revision's brief bars. Every claim this revision adds rests on a command below.

## Measured before planning

Probes and logs are in this planner's `out/1309-pr2-r1-probe/`, its probe delivery in `out/1309-pr2-r1-layout/` and its seed 1 run in `out/1309-pr2-r1-e1/` (the dispatcher copies the tree's `out/` across at retirement). No call reached `api.typesafe.ai`.

- **R1. What the chart command imports.** `node out/1309-pr2-r1-probe/1309-pr2-r1-closure.ts . src/cli/main.ts` (log `1309-pr2-r1-closure.log`): 101 files in its static import closure, type-only imports included, none outside `src/`, its only non-relative imports `node:` builtins; `src/atlas`, `src/itinerary`, `src/layouts`, `src/pages`, `src/prospect`, `src/site`, `src/static` and `src/styles` hold 0 of them; the one file in it that reads a file at run time is `src/cli/raster.ts`, on the `--png` path the recipe never takes. A run-time trace (`node --import ./out/1309-pr2-r1-probe/1309-pr2-r1-trace-hook.ts src/cli/main.ts chart --seed 1 --legend`, and again with `--theme moisture`, log `1309-pr2-r1-trace.log`) loaded 100 files, every one under `src/` and in the static set; the one more in the static set is `src/world/types.ts`, imported for its types alone. `git grep -n 'import(' -- src ':!src/site'` printed nothing, so no dynamic import hides from either.
- **R2. The narrowed archive draws today's sheet.** `git archive --output=<file> <base> package.json src` with the eight exclusions wrote 6,082,560 bytes and 155 files, against 14,551,040 and 442 for `package.json src`; seed 1's sheet and rainfall plate drawn from its extraction are byte-identical to the tree's (sha256 prefixes 6ccffd6a6b34e476 and b42c6ee76b337d5a, the plan's own Measured item 1), from a folder named `.base` as well.
- **R3. The delivery page with the working files inside.** `node out/1309-pr2-r1-probe/1309-pr2-r1-recipe.ts 1309-pr2-r1-evidence --ask-identical` (log `1309-pr2-r1-recipe.log`) ran the revised recipe for five charts (seeds 1, 2, 4, 5, 6, none left out), every kind asked by a dry run even where identical, the most files a five-chart comparison writes; the folder came to 90 MB (sheets 44 MB, stills 34 MB, archive 5.8 MB, extraction 6.0 MB). `node scripts/delivery/main.ts <its absolute path>` (log `1309-pr2-r1-delivery.log`): with the extraction visible as `still-judge/base/`, the page was 1,704,515 bytes, "268 files: 50 pictures, 4 JSON files, 16 texts, 45 logs, 152 scripts, 1 other file", the 152 source files sitting between the replies and the stills; with it moved to `still-judge/.base/`, 118,813 bytes, "113 files: 50 pictures, 1 JSON file, 16 texts, 45 logs, 1 other file", the archive listed as an other file of 5.8 MB, and nothing demoted. `entriesOf` in `scripts/delivery/walk.ts` skips a name beginning with a dot; no test pins it. The folder was then renamed `out/1309-pr2-r1-layout/`. The plan's Call 13 also said a folder with no page is not in `out/index.html`; `pagelessHtml` in `scripts/delivery/index-page.ts` lists it.
- **R4. The stderr hypothesis is true.** Readings with a fake of my own loaded through `--import` (`out/1309-pr2-r1-probe/1309-pr2-r1-fake-jev.ts`: it points `HOME` at a probe home and answers every fetch itself), every run with `TYPESAFE_API_KEY='refused key'` set at the shell, a value `KEY_SHAPE` refuses, so that a run the fake does not reach sends nothing (reading 0 shows it: exit 1, `skipped: TYPESAFE_API_KEY holds a character a request header cannot carry, so nothing was sent`). Log `1309-pr2-r1-stderr.log`. On PR #1350's head 9a755c03, extracted by `git archive`: with a writable probe home, exit 0, four stdout lines ending on the rule, stderr empty, the usage line written to the probe home; with a probe home whose `.config` is a file, so that the usage write fails, and `2>&1`, exit 0 and five lines, the LAST being `the run's Jev usage could not be logged to ~/.config/typesafe/usage.jsonl (ENOTDIR: ...); add its line by hand: {...}`; the same failure through `npm run --silent --prefix <tree> still-judge -- compare crop ...` with `2>` split, exit 0, stdout four lines whose last is `Read as a comparison of two versions of one chart: a difference under 0.12 is no difference, and one picture's number is never a pass or a fail.`, stderr one line, the warning. Taken again on an archive of 6bdebd7f (`git diff 9a755c03 6bdebd7f -- scripts src e2e handbook/specs .claude CLAUDE.md .github` prints nothing): the same five lines ending on the warning under `2>&1`, the same four and one under `2>`. Each fake run made 2 calls, each to the fake. Alex's `~/.config/typesafe/usage.jsonl` read 12 lines, mtime 1794444450 and 1637 bytes before the first run and after the last. A refused argument list (`npm run --silent still-judge -- compare crop only-one.png`) exits 2 with stdout empty and the usage on stderr.
- **R5. The revised commands, seed 1, by hand** (folder `out/1309-pr2-r1-e1/`, one command a call, as the section has them): step 1's diff at a clean tree printed nothing; step 3's three commands exited 0; step 4's one-liner printed `{"carries":true,"clip":{"x":205,"y":648,"width":600,"height":400}}`; step 6's shoot exited 0 with six stills and `"consoleErrors": []` (log `1309-pr2-r1-e1-shoot.log`); the stills hash to sheet 3744f637baa2657c, rainfall f592e7498ac60a5e and crop 7aa1117703129dc7 for today and `build` alike; step 7's command for `sheet` with `--dry-run` added exited 0, its lines file four lines ending on the rule, its stderr file 0 bytes, beside `requests.jsonl` and `replies.jsonl`; with a two-line notes file, `node scripts/delivery/main.ts <absolute path>` gave the page "16 files: 10 pictures, 1 JSON file, 1 text, 3 logs, 1 other file". Step 7's command and the page were then taken again on the merged main's code, `npm run --silent --prefix <the 6bdebd7f archive> still-judge -- compare sheet <today> <build> --dry-run --out <abs>/asked/1-sheet` with both streams apart: exit 0, four lines ending on the rule, stderr 0 bytes, the same four files; `node <the 6bdebd7f archive>/scripts/delivery/main.ts <abs folder>`, the same 16 files and counts. Without `--dry-run` and with `TYPESAFE_API_KEY='refused key'`, through `npm run --silent`, the run exited 1, its four lines naming `not compared: skipped: TYPESAFE_API_KEY holds a character a request header cannot carry, so nothing was sent`, its stderr 0 bytes, so npm adds nothing to stderr on an exit of 1 and a keyless comparison's stderr file stays empty (Alex's `usage.jsonl` 12 lines before and after).
- **R6. What the narrowing saves.** `node out/1309-pr2-r1-probe/1309-pr2-r1-trigger-history.ts 150` (log `1309-pr2-r1-trigger-history.log`): of main's last 150 first-parent commits, 31 print a change under the plan's four exclusions and 26 under the eight; the five dropped are the merges for Issue #1261, Issue #1218, Issue #1215, Issue #511 and Issue #1159, site and Ribbon work. The open PR #1355 changes `src/layouts/atelier-chart.ts` and nothing else in the closure's reach: the plan's diff would owe it a plate-reader run, the revised one does not.
- **R7. Time.** The five-chart run took 33.6 s, of which the 30-still shoot was 17.2 s, a sheet drawn 0.58 to 0.70 s, `compare` 0.24 s a dry run.
- **R8. The merge.** `git merge-tree --write-tree origin/chore/1309-plate-reader-still-judge 6bdebd7f` printed the tree a215e4be3b5f404521cf2c025180ef151757d1e4 and no conflict, the same tree as against 9a755c03; against 38bfe7ee it printed 7085a27499a6001d817467140551aa29d43c67b1 and no conflict. Of the files this revision edits, either merged tree differs from 5cc32daa only in `handbook/specs/check-placement.md` (PR #1350's run-record sentence), which this revision does not edit, so every anchor below reads the same before the merge and after it. `git diff --stat 6bdebd7f 38bfe7ee` names only `.claude/skills/vellum-footguns/references/flake-record.md`, `handbook/plans/1300/1354/1354-plan.md` and `test/repo/working-tree.test.ts`, so no reading below moves with it.
- **R9. The edits place and the prose tests read them green.** With the merged tree's three changed files written into this tree (`git show a215e4be:<path>`), so that every edited file read as at 5cc32daa (`git diff --stat 5cc32daa -- <the six files>` printed nothing), `node out/1309-pr2-r1-probe/1309-pr2-r1-apply.ts <this plan>` placed Edits P1, P2, W1, I1, S1, T1 and C1, each today block found exactly once (log `1309-pr2-r1-apply.log`): the plate reader's definition stays 82 lines, the workflow goes to 503, the implementer 79, the skeptic 129, the template 37, `CLAUDE.md` 307. Then, each after `pgrep -fl "node [s]cripts/unit-suite"` printed nothing, `npm test -- test/repo/prose-paths.test.ts`, `npm test -- test/repo/memory-pointers.test.ts` and `npm test -- test/repo/footgun-gate.test.ts` (which reads the template) passed 4 of 4, 4 of 4 and 9 of 9; the diff (`1309-pr2-r1-staged.diff`, 18 lines in, 14 out) carries no em-dash on an added line, and neither does this file. The files were then restored with `git checkout --`.

## The design, as revised

**The trigger** is the static import closure of `src/cli/main.ts`, at directory grain, written as an exclusion list: every directory under `src/` but those holding none of its files. It is one pathspec, `<paths>`, named once in the section and used by step 1's diff and step 3's archive alike. Its blind spots and their direction: a file inside a kept directory that the chart command never loads (28 of `src/world`'s 35, 13 of `src/render`'s 63) owes a run that compares identical stills and sends nothing, which errs toward asking; a new directory under `src/` is kept until a planner measures it out, which errs toward asking; a change outside `src/` cannot alter the sheet the CLI draws, since no file in the closure imports or reads one but `src/cli/raster.ts` on the unused `--png` path. The one way the list can go wrong silently is a kept file coming to import from an excluded directory; the archive is cut from the same `<paths>`, so today's draw then fails on the missing file, and step 3 says to stop there and report it.

**The working files sit in `out/<delivery>/still-judge/`**: `summary.md`, `shots.json` and `base.tar` at its head, the extraction in `.base/`, the drawn sheets in `sheets/`, the stills in `stills/`, and one folder per command, `asked/<s>-<kind>/`, holding its lines, its stderr, its requests and its replies. The page lists the archive, so today's source is on it as one file; its extracted copy is the archive's own content and is hidden by the leading dot.

**A command's two streams go to two files**, so the rule stays the stdout file's last line, and a stderr line, whether a usage line the run could not log or the command's own usage, is quoted where Alex reads it.

**Step 11** gains one sentence, and a dispatch owed for nothing else asks the plate reader for the comparison alone, which its section then runs by itself.

**Rejected alternatives** (not choices for the builder):

- **An allow-list of the closure's directories.** A directory the CLI comes to import, not yet on the list, would leave a change there unasked, silently; the exclusion list errs the other way.
- **File grain** (only the 101 files). A list of files rots on every new file; the directory grain costs a run that sends nothing.
- **The extraction visible in the delivery.** 152 source files on the page, 1.7 MB of HTML, the stills below them (R3).
- **Removing the extraction after drawing.** A recursive removal can be refused in the mode the plate reader runs in, and the dot already keeps it off the page.
- **Keeping `2>&1` and quoting the line that begins "Read as a comparison".** It ties the report to the rule's wording and leaves a warning inside a file nobody quotes.
- **The pathspec written in the workflow's sentence.** A second copy; the sentence points at the section's step 1.

## Files

Every "today" block below is in the file at 5cc32daa exactly as quoted, and in the tree `git merge origin/main` makes from it at 6bdebd7f (R8). Each edit replaces exactly the quoted text, found once.

### Edited: `.claude/agents/vellum-plate-reader.md` (82 lines at 5cc32daa, 82 after)

**Edit P1.** The section's body, from its opening paragraph to the end of step 7, is today:

```markdown
Where the work changes how the engine draws a world sheet, also ask TypeSafe's Jev four questions of today's sheet and of each other version through `npm run still-judge -- compare` (`scripts/still-judge/main.ts`), at a step 6 sitting and at step 11 alike. What it answers is a reader's hypothesis beside your measurements, never one of them (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability"). Run each command below on its own, from the tree you were dispatched in; `<delivery>` is your delivery folder's name and `<s>` a seed.

1. **Whether it is owed.** `git merge-base HEAD origin/main` prints the base. The comparison is owed where `git diff --stat <base> -- src ':!src/site' ':!src/pages' ':!src/styles' ':!src/static'` prints a change, or where your dispatch names the sheets of a sitting's arms. Otherwise draw and ask nothing, and say so under the heading Reporting gives the comparison.
2. **Only the pictures the trial scored.** The world sheet in the antique style with its legend, at the 1500 by 1158 it is drawn; the same sheet's rainfall plate; and a 600 by 400 piece of the first at 1:1. No other style, region sheet, room, page or Explorer state is asked, since no question has been scored on one. Never rasterize with `chart --png`, whose default scale draws a still the command refuses.
3. **Today's source, from the base and never the working tree.** `mkdir -p out/<delivery>-still-judge/base`, then `git archive --output=out/<delivery>-still-judge/base.tar <base> package.json src`, then `tar -x -f out/<delivery>-still-judge/base.tar -C out/<delivery>-still-judge/base`. The folder `out/<delivery>-still-judge/` is your workbench for this section, not a delivery.
4. **Five charts.** Take the seeds your dispatch names, then the seeds of `TRIAL_SEEDS` in `scripts/still-judge/trial-set.ts` in their order, one at a time, until five charts carry every subject the questions read. For each seed, draw today's two sheets, `node out/<delivery>-still-judge/base/src/cli/main.ts chart --seed <s> --legend --out out/<delivery>-still-judge/sheets/<s>-today-sheet.svg` and the same with `--theme moisture` added, writing `<s>-today-rainfall.svg`, then run `node --input-type=module -e 'import { readFileSync } from "node:fs"; import { carriesEverySubject, cropClip } from "./scripts/still-judge/restage.ts"; const [sheet, rain] = process.argv.slice(1).map((p) => readFileSync(p, "utf8")); const carries = carriesEverySubject(sheet, rain); console.log(JSON.stringify({ carries, clip: carries ? cropClip(sheet) : null }));' out/<delivery>-still-judge/sheets/<s>-today-sheet.svg out/<delivery>-still-judge/sheets/<s>-today-rainfall.svg`. It prints `"carries":true` and the piece's `clip` for a chart to take, that clip serving every version of the chart, and `"carries":false` for a seed to leave out and name.
5. **The other versions.** At step 11 there is one, this tree's, named `build`: `node src/cli/main.ts chart --seed <s> --legend --out out/<delivery>-still-judge/sheets/<s>-build-sheet.svg`, and the same with `--theme moisture` added, writing `<s>-build-rainfall.svg`. At a sitting each arm is drawn by the command your dispatch names for it, or is the sheet file it names, written as `<s>-<arm>-sheet.svg` and `<s>-<arm>-rainfall.svg`. A version whose sheet does not open with `width="1500" height="1158"` (`head -c 120` of the file shows it) is not the picture the trial scored, and is named and not asked.
6. **Shoot.** Write `out/<delivery>-still-judge/shots.json`, a JSON array of three shots for each version of each chart, every one carrying `"width": 1500, "height": 1158, "mobile": false, "waitMs": 200`: `"url": "/<s>-<version>-sheet.svg"` with `"out": "out/<delivery>-still-judge/stills/<s>-sheet-<version>.png"`; `"url": "/<s>-<version>-rainfall.svg"` with `"out": "out/<delivery>-still-judge/stills/<s>-rainfall-<version>.png"`; and `"url": "/<s>-<version>-sheet.svg"` again with `"clip"` the chart's clip and `"out": "out/<delivery>-still-judge/stills/<s>-crop-<version>.png"`. Then run `node scripts/design/shoot.ts out/<delivery>-still-judge/shots.json --site out/<delivery>-still-judge/sheets`.
7. **Ask.** For each chart and each kind (`sheet`, `rainfall`, `crop`), set aside every other version whose still `cmp -s` finds identical to today's: it is counted as identical and not sent. Where one remains, run `mkdir -p out/<delivery>/still-judge`, then `npm run --silent still-judge -- compare <kind> <today's still> <each remaining still> --out out/<delivery>/still-judge/<s>-<kind> > out/<delivery>/still-judge/<s>-<kind>.txt 2>&1`, and read its exit status.
```

It becomes exactly:

```markdown
Where the work changes how the engine draws a world sheet, also ask TypeSafe's Jev four questions of today's sheet and of each other version through `npm run still-judge -- compare` (`scripts/still-judge/main.ts`), at a step 6 sitting and at step 11 alike. A dispatch that asks for this comparison alone, as `handbook/specs/development-workflow.md` step 11 owes it wherever step 1 below prints a change whatever the deliverable, runs this section and nothing else, then ends its folder as Boundaries says. What it answers is a reader's hypothesis beside your measurements, never one of them (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability"). Run each command below on its own, from the tree you were dispatched in. `<delivery>` is your delivery folder's name, `<s>` a seed, and every file this section makes goes under `out/<delivery>/still-judge/`, inside that one folder. `<paths>` stands for `src ':!src/atlas' ':!src/itinerary' ':!src/layouts' ':!src/pages' ':!src/prospect' ':!src/site' ':!src/static' ':!src/styles'`, written out word for word wherever a command below names it: every directory under `src/` but those holding no file that `src/cli/main.ts` imports, directly or through another file, a directory joining that list only once it is measured so.

1. **Whether it is owed.** `git merge-base HEAD origin/main` prints the base. The comparison is owed where `git diff --stat <base> -- <paths>` prints a change, or where your dispatch names the sheets of a sitting's arms. Otherwise draw and ask nothing, and say so under the heading Reporting gives the comparison.
2. **Only the pictures the trial scored.** The world sheet in the antique style with its legend, at the 1500 by 1158 it is drawn; the same sheet's rainfall plate; and a 600 by 400 piece of the first at 1:1. No other style, region sheet, room, page or Explorer state is asked, since no question has been scored on one. Never rasterize with `chart --png`, whose default scale draws a still the command refuses.
3. **Today's source, from the base and never the working tree.** `mkdir -p out/<delivery>/still-judge/.base`, then `git archive --output=out/<delivery>/still-judge/base.tar <base> package.json <paths>`, then `tar -x -f out/<delivery>/still-judge/base.tar -C out/<delivery>/still-judge/.base`. The delivery page lists the archive and leaves out the folder its leading dot hides, which holds only the archive's own files. A draw from that folder that fails on a missing file means `<paths>` leaves out a directory `src/cli/main.ts` has come to import: name the file, draw and ask nothing more, and report it.
4. **Five charts.** Take the seeds your dispatch names, then the seeds of `TRIAL_SEEDS` in `scripts/still-judge/trial-set.ts` in their order, one at a time, until five charts carry every subject the questions read. For each seed, draw today's two sheets, `node out/<delivery>/still-judge/.base/src/cli/main.ts chart --seed <s> --legend --out out/<delivery>/still-judge/sheets/<s>-today-sheet.svg` and the same with `--theme moisture` added, writing `<s>-today-rainfall.svg`, then run `node --input-type=module -e 'import { readFileSync } from "node:fs"; import { carriesEverySubject, cropClip } from "./scripts/still-judge/restage.ts"; const [sheet, rain] = process.argv.slice(1).map((p) => readFileSync(p, "utf8")); const carries = carriesEverySubject(sheet, rain); console.log(JSON.stringify({ carries, clip: carries ? cropClip(sheet) : null }));' out/<delivery>/still-judge/sheets/<s>-today-sheet.svg out/<delivery>/still-judge/sheets/<s>-today-rainfall.svg`. It prints `"carries":true` and the piece's `clip` for a chart to take, that clip serving every version of the chart, and `"carries":false` for a seed to leave out and name.
5. **The other versions.** At step 11 there is one, this tree's, named `build`: `node src/cli/main.ts chart --seed <s> --legend --out out/<delivery>/still-judge/sheets/<s>-build-sheet.svg`, and the same with `--theme moisture` added, writing `<s>-build-rainfall.svg`. At a sitting each arm is drawn by the command your dispatch names for it, or is the sheet file it names, written as `<s>-<arm>-sheet.svg` and `<s>-<arm>-rainfall.svg`. A version whose sheet does not open with `width="1500" height="1158"` (`head -c 120` of the file shows it) is not the picture the trial scored, and is named and not asked.
6. **Shoot.** Write `out/<delivery>/still-judge/shots.json`, a JSON array of three shots for each version of each chart, every one carrying `"width": 1500, "height": 1158, "mobile": false, "waitMs": 200`: `"url": "/<s>-<version>-sheet.svg"` with `"out": "out/<delivery>/still-judge/stills/<s>-sheet-<version>.png"`; `"url": "/<s>-<version>-rainfall.svg"` with `"out": "out/<delivery>/still-judge/stills/<s>-rainfall-<version>.png"`; and `"url": "/<s>-<version>-sheet.svg"` again with `"clip"` the chart's clip and `"out": "out/<delivery>/still-judge/stills/<s>-crop-<version>.png"`. Then run `node scripts/design/shoot.ts out/<delivery>/still-judge/shots.json --site out/<delivery>/still-judge/sheets`.
7. **Ask.** For each chart and each kind (`sheet`, `rainfall`, `crop`), set aside every other version whose still `cmp -s` finds identical to today's: it is counted as identical and not sent. Where one remains, run `mkdir -p out/<delivery>/still-judge/asked/<s>-<kind>`, then `npm run --silent still-judge -- compare <kind> <today's still> <each remaining still> --out out/<delivery>/still-judge/asked/<s>-<kind> > out/<delivery>/still-judge/asked/<s>-<kind>/lines.txt 2> out/<delivery>/still-judge/asked/<s>-<kind>/stderr.log`, and read its exit status. Its lines go to the first file and anything it warns of to the second, so the rule it prints last stays the last line of the first.
```

**Edit P2.** In `## Reporting`, the paragraph is today:

```markdown
**The still judge's comparison has its own heading, Still judge (advisory), after your measurements.** Under it: one line naming the base sha (and `origin/main`'s head where it differs), the charts asked and those left out, the versions, the model the command's first line names, and the input tokens its first lines report, summed; then one row per version, kind and question, counting the charts that read worse, read better, no difference, identical to today's and not compared, never one picture's number; then the command's last line, quoted once. Write the same to `out/<delivery>/still-judge/summary.md`, which your `out/<delivery>/notes.md` names.
```

It becomes exactly:

```markdown
**The still judge's comparison has its own heading, Still judge (advisory), after your measurements.** Under it: one line naming the base sha (and `origin/main`'s head where it differs), the charts asked and those left out, the versions, the model the command's first line names, and the input tokens its first lines report, summed; then one row per version, kind and question, counting the charts that read worse, read better, no difference, identical to today's and not compared, never one picture's number; then the last line of one `out/<delivery>/still-judge/asked/<s>-<kind>/lines.txt`, the command's rule, quoted once. Each run that sent anything logs its own totals (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests on a probability"), so neither you nor whoever dispatched you logs a token by hand. Where an `out/<delivery>/still-judge/asked/<s>-<kind>/stderr.log` is not empty, quote each of its lines under the heading: one saying the run's usage could not be logged ends with the line to add by hand, the one line ever added by hand, which whoever dispatched you adds; one that is the command's usage, with an exit of 2, means the command was written otherwise than step 7 writes it, so run it again as written. Write the same to `out/<delivery>/still-judge/summary.md`, which your `out/<delivery>/notes.md` names.
```

The rest of that paragraph, from "A reading is never a criterion's MET or NOT MET" to its end, is unchanged. Nothing else in the file changes: the frontmatter, the Boundaries paragraph and its `npm run still-judge` sentence, the sitting paragraph and every other line stand as at 5cc32daa.

### Edited: `handbook/specs/development-workflow.md`

**Edit W1.** In step 11, these lines are today:

```markdown
measured a spike and this run measures what was built. Zero red from the prover is a hole, not a
pass, and a guard proved unable to bite is deleted rather than shipped.
```

They become exactly:

```markdown
measured a spike and this run measures what was built. Wherever the diff in step 1 of that agent's
section Two versions of one sheet, asked of Jev (`.claude/agents/vellum-plate-reader.md`) prints a
change, it is owed here for the still judge's comparison that section runs, whether or not the
deliverable is an appearance, and a dispatch owed for nothing else asks for the comparison alone.
Zero red from the prover is a hole, not a pass, and a guard proved unable to bite is deleted rather
than shipped.
```

Edits A and B of the plan this revises stand as committed.

### Edited: `.claude/agents/vellum-implementer.md`

**Edit I1.** In the build list's guard-prover bullet, this text is today:

```markdown
`vellum-plate-reader` when the deliverable is an appearance. A guard proved unable to bite
```

It becomes exactly:

```markdown
`vellum-plate-reader` when the deliverable is an appearance, and wherever workflow step 11 owes it the still judge's comparison. A guard proved unable to bite
```

### Edited: `.claude/agents/vellum-pr-skeptic.md`

**Edit S1.** In the bullet opening "**Owed companion reports.**", this text is today:

```markdown
the sitting's and step 11's. If the PR and its issue show neither report, flag the omission.
```

It becomes exactly:

```markdown
the sitting's and step 11's; and a change workflow step 11 owes the still judge's comparison for owes a vellum-plate-reader run for it, whatever its deliverable. If the PR and its issue show neither report, flag the omission.
```

### Edited: `.github/PULL_REQUEST_TEMPLATE.md`

**Edit T1.** In the Records line for `vellum-plate-reader`, this text is today:

```markdown
not owed (no presentation change);
```

It becomes exactly:

```markdown
not owed (no presentation change, and nothing workflow step 11 owes the still judge's comparison for);
```

### Edited: `CLAUDE.md`

**Edit C1.** In the Process paragraph opening "**The order of operations is `handbook/specs/development-workflow.md`**", this text is today:

```markdown
`vellum-plate-reader` when the deliverable is an appearance, and `vellum-pr-skeptic` COLD on every
```

It becomes exactly:

```markdown
`vellum-plate-reader` when the deliverable is an appearance or step 11 owes its still-judge comparison, and `vellum-pr-skeptic` COLD on every
```

### Created: `handbook/plans/1300/1309/1309-pr2-r1-plan.md`

This file, archived unchanged, in the first commit the build makes, beside `handbook/plans/1300/1309/1309-pr2-plan.md`, which stays as it is.

No code file, test file, `package.json` script, roster or `handbook/specs/check-placement.md` line changes in this revision.

## Tests

**None, and none is owed**, as the plan this revises says: every change is an agent's instructions, a spec's prose, the pull request template or `CLAUDE.md`. The behaviour the revised step 7 leans on is PR #1350's, pinned by its own tests in `test/repo/jev-cli.test.ts` ("a log that cannot be written is reported once on stderr with the line to add by hand, and the run's exit code stands") and by `test/repo/still-judge-main.test.ts`; that the warning comes after the rule when both streams share a file is measured (R4) and not pinned, and the split in step 7 makes the order not matter; the backticked paths are read by `test/repo/prose-paths.test.ts`, which reads `.github` and `CLAUDE.md` too. No guard is new or strengthened, no browser check is added, so no ledger line and no readings are owed.

## Order of work

On the branch `chore/1309-plate-reader-still-judge` at 5cc32daa, each command on its own:

1. Commit `#1309 The comparison's files go inside the plate reader's delivery, and its trigger reads what the chart command imports`: `handbook/plans/1300/1309/1309-pr2-r1-plan.md` and Edits P1 and P2. Push.
2. Commit `#1309 Step 11 owes the still judge's comparison wherever the drawn sheet can change`: Edits W1, I1, S1, T1 and C1. Push.
3. **Merge main.** `gh api repos/ahl-gram/Vellum/pulls/1350 --jq .merged` prints `true` (it did at planning: PR #1350 merged as 6bdebd7f, and PR #1356 after it as 38bfe7ee). Then `git fetch origin`, then `git rev-parse origin/main`, which prints 38bfe7ee72dcd2574d640b18b1eb6496ad6cb6e8 or a later head Stop condition 2 lets pass, then `git merge origin/main --no-edit -m "Merge origin/main into chore/1309-plate-reader-still-judge" -m "<the three-line trailer block>"`, never a rebase (workflow step 10), the subject the form PR #1350's own merge of main took (98c3e110) and the second `-m` the trailer block `CLAUDE.md` gives (Process, the attribution bullet), which every commit message ends with. It merges with no conflict (R8). Then `git diff HEAD~1 HEAD --stat` names `handbook/specs/check-placement.md`, PR #1350's other files and PR #1356's three, and no other file this revision edits. Push.
4. Evidence 1 to 5 below, on the merged tree.
5. Record this revision's calls as one dated comment on Issue #1309 (workflow step 12), pointing at https://github.com/ahl-gram/Vellum/issues/1309#issuecomment-6810706353 for Alex's rulings and at `handbook/plans/1300/1309/1309-pr2-r1-plan.md` with its sha256, and listing Calls r1-1 to r1-11 by number and one line each.
6. Rewrite the pull request body (PR body, below) with `gh pr edit 1352 --body-file`, and read `gh pr view 1352 --json closingIssuesReferences` back: it names Issue #1309 alone.
7. CI on the head: a red is read as `.claude/agents/vellum-implementer.md` says, that of `test/repo/working-tree.test.ts` included, since the merge brings PR #1356's fix for Issue #1354.

## Rosters and doctrine

- **Edited**: the plate reader's section and Reporting paragraph (P1, P2); step 11 (W1), the home of when the comparison is owed; the four copies that say when `vellum-plate-reader` is owed now point at it (I1, S1, T1, C1).
- **Made true by the merge**: the Boundaries sentence "`npm run still-judge` may add its own record of a run outside `out/`", whose citation reads the run-record sentence of `handbook/specs/check-placement.md` merged at 6bdebd7f (R8).
- **Made true by W1, unchanged**: the check-placement still-judge item's "wherever a change reaches how a world sheet is drawn" and the workflow row's "wherever the work changes how a world sheet is drawn" (Alex's ruling 1).
- **Checked and left as they stand**: the Boundaries line "Your files go in one folder in `out/`", now true of the comparison too; step 6's "`vellum-plate-reader` writes only into `out/`" and step 14's "its own boundary writes only into `out/`"; `CLAUDE.md`'s "For a presentation sub, run `vellum-plate-reader` before the PR"; `vellum-footguns` Gate 5 item 5 (presentation work owes it twice where the ruling came from stills); `.claude/agents/vellum-planner.md`'s "whether `vellum-plate-reader` is owed"; `handbook/specs/cloud-routine.md`, What qualifies, whose "nothing owing a still, a spike or the plate reader" now also leaves out an issue whose diff step 1 reads (Call r1-8).
- **Step 14's note on definitions**: this pull request now edits three agent definitions (`vellum-plate-reader`, `vellum-implementer`, `vellum-pr-skeptic`), so the body says which version of each wrote the change and which reviewed it.

## Evidence

Run in the implementer's tree after step 3, one command at a time, `<delivery>` being `1309-pr2-r1-evidence`, each command the definition's own text as committed, the base being `git merge-base HEAD origin/main`, which prints `origin/main`'s head once main is merged (38bfe7ee72dcd2574d640b18b1eb6496ad6cb6e8 at planning):

1. Steps 1 to 6 of the section for seed 1 alone, with this tree as the `build` version: step 1's diff prints nothing (this pull request changes nothing under `src/`), and this run goes on past step 1's "draw and ask nothing" on purpose, to show every command runs as written; step 3's three commands exit 0 and `ls out/1309-pr2-r1-evidence/still-judge/.base` prints `package.json` and `src`; step 4's one-liner prints `{"carries":true,"clip":{"x":205,"y":648,"width":600,"height":400}}`; step 6's shoot exits 0 with six stills and no console error or 4xx; `shasum -a 256 out/1309-pr2-r1-evidence/still-judge/stills/*.png` gives today's sheet, rainfall and crop stills beginning 3744f637baa2657c, f592e7498ac60a5e and 7aa1117703129dc7, and the `build` stills the same (Mac only: the faces are the system's).
2. Step 7's two commands for `sheet`, with `--dry-run` added after the two stills: `mkdir -p out/1309-pr2-r1-evidence/still-judge/asked/1-sheet`, then `npm run --silent still-judge -- compare sheet out/1309-pr2-r1-evidence/still-judge/stills/1-sheet-today.png out/1309-pr2-r1-evidence/still-judge/stills/1-sheet-build.png --dry-run --out out/1309-pr2-r1-evidence/still-judge/asked/1-sheet > out/1309-pr2-r1-evidence/still-judge/asked/1-sheet/lines.txt 2> out/1309-pr2-r1-evidence/still-judge/asked/1-sheet/stderr.log`: exit 0; `wc -l` of the lines file prints 4 and its last line begins `Read as a comparison of two versions of one chart`; `wc -c` of the stderr file prints 0 (a dry run sends nothing, so it logs nothing); the folder also holds `requests.jsonl` and `replies.jsonl`.
3. Write `out/1309-pr2-r1-evidence/notes.md`, a `#` heading line and one line naming `still-judge/asked/1-sheet/lines.txt`, then `node scripts/delivery/main.ts` with the folder's absolute path: exit 0, and `grep -o 'files: [^<]*' out/1309-pr2-r1-evidence/index.html` prints `files: 10 pictures, 1 JSON file, 1 text, 3 logs, 1 other file`.
4. `npm test -- test/repo/prose-paths.test.ts`, `npm test -- test/repo/memory-pointers.test.ts` and `npm test -- test/repo/footgun-gate.test.ts` pass, each after `pgrep -fl "node [s]cripts/unit-suite"` prints nothing; `npm run check`, `npm run lint` and `npm run format:check` exit clean.
5. `git diff origin/main -- .claude/agents/vellum-plate-reader.md .claude/agents/vellum-implementer.md .claude/agents/vellum-pr-skeptic.md .github/PULL_REQUEST_TEMPLATE.md CLAUDE.md handbook/specs/check-placement.md handbook/specs/development-workflow.md` shows no em-dash on an added line outside a code span.

The implementer makes no live call to TypeSafe at any step, and logs no token by hand. Owed: nothing new. The cold skeptic's one round is spent (workflow step 15); whether this revision's build is reviewed again is the dispatcher's. Not owed: `vellum-plate-reader` (no appearance changes, and step 1's diff prints nothing for this pull request, so W1 owes it nothing either), `vellum-guard-prover` (no guard).

## PR body

The body keeps the template's sections and its closing line `Closes #1309`, and says, in its own words:

- The opening paragraph names revision 1 (`handbook/plans/1300/1309/1309-pr2-r1-plan.md`, its sha256, planned at main 38bfe7ee) and the five changes this file opens with, beside the plan it revises, and lists the seven files the pull request now edits besides its two plans.
- The definitions paragraph: the change to `vellum-plate-reader`, `vellum-implementer` and `vellum-pr-skeptic` was written by the `vellum-implementer` definition as on main before this pull request; the cold skeptic's round, at 5cc32daa, ran its own pre-PR definition and read none of this revision; neither new definition has written or reviewed anything here.
- Ran: Evidence 1 to 5, with the base the run printed, and that main was merged at the head step 3 printed with no conflict.
- Records, `vellum-pr-skeptic`: relayed in chat 2026-11-11; its verdict: Blocking: yes; finding 1 (the comparison owed for an engine pull request) fixed by revision 1's step 11 sentence; finding 2 (the Boundaries sentence resting on PR #1350's hunk) met by merging main after PR #1350 landed; finding 3 (a second folder in `out/`) fixed by revision 1; its NIT on the trigger fixed by revision 1, which narrows it to what the chart command imports; its untested hypothesis on stderr, measured true by the planner and fixed by revision 1; not fixed here: finding 4, Issue #1353, filed (`compareLines` names the other picture's reason before today's); finding 5, Issue #1354, the red `test/repo/working-tree.test.ts` timeout on CI shard 1, not this pull request's, fixed on main by PR #1356 and brought in by the merge.
- Records, `vellum-plate-reader`: not owed (no presentation change, and nothing workflow step 11 owes the still judge's comparison for), the form Edit T1 writes.
- Rulings: the calls comments, the r0 one (6810424569) and the one step 5 posts; Alex's rulings 6810235028 and 6810706353.
- Look for these: the plan's item, plus that `.base/` is kept off the page only by the delivery walker's skip of a name beginning with a dot, which no test pins.

## Calls made

The plan's Calls 1 to 15 stand, except Call 5 (the trigger), replaced by r1-1; Call 13 (the work folder beside the delivery), withdrawn by Alex's ruling 2 and replaced by r1-2 and r1-3; and the reach of Call 4's archive, narrowed by r1-1.

- **r1-1. The trigger and the archive read one pathspec: every directory under `src/` but the eight holding no file of the static import closure of `src/cli/main.ts`, at directory grain, as an exclusion list.** Rule: `CLAUDE.md`, Process ("a scanner proves which way it errs ... names [its blind spots] and argues the direction"): every blind spot errs toward asking (The design), and now that a trigger owes a plate-reader run (Alex's ruling 1), a directory measured outside the closure is removed from it (R1, R2, R6).
- **r1-2. The extraction is `out/<delivery>/still-judge/.base/`, which the page leaves out; the archive itself is listed.** Rule: Alex's ruling 2 (the base-source archive, the stills and the replies inside the delivery folder and on its page) and workflow step 6 (one folder, its page what Alex opens): 113 files and 119 KB against 268 and 1.7 MB (R3). The skip is not pinned by a test; if it goes, the page lists the source again and nothing is lost.
- **r1-3. One folder per command, `asked/<s>-<kind>/`, holding its lines, its stderr, its requests and its replies.** Rule: a command's whole record in one section of the page; `compare --out` writes a folder of its own anyway.
- **r1-4. stdout and stderr go to two files, and Reporting quotes every stderr line.** Rule: the hypothesis measured true (R4), and a usage line a run could not log reaches the hand log only if someone quotes it.
- **r1-5. A dispatch for the comparison alone runs the section and nothing else, then ends its folder as Boundaries says.** Rule: Alex's ruling 1 ("for the still-judge comparison alone").
- **r1-6. W1 points at the section's step 1 rather than copying the pathspec.** Rule: `handbook/specs/conventions.md`, Where a rule lives (exactly one home).
- **r1-7. The four copies of when `vellum-plate-reader` is owed point at step 11** (the implementer's build list, the skeptic's owed reports, the template's Records line, `CLAUDE.md`'s Process paragraph). Rule: `handbook/specs/conventions.md`, Where a rule lives ("every other copy points at it by name"), and workflow step 8 ("a behavior change that contradicts a ratified line has to edit that line in the same PR"): an implementer following its own list would not dispatch for an engine pull request, and a skeptic following its own would not flag the omission. The skeptic's edit brings step 14's note for its definition.
- **r1-8. `handbook/specs/cloud-routine.md` is not edited.** An issue whose diff step 1 reads now owes the plate reader, so What qualifies ("nothing owing a still, a spike or the plate reader") already leaves it out, which follows from Alex's ruling 1. Measured: of the cloud routine's merges on main (`git log origin/main --grep="cloud quick-win routine"`), one touched `src/`, Issue #982's `src/atlas/compose.ts`, which the plan's paths would have reached and the revised paths do not.
- **r1-9. Tokens are reported, never logged by hand; the one line added by hand is one a stderr file says could not be logged.** Rule: the run record in `handbook/specs/check-placement.md` (Issue #1343), relayed by the dispatcher with the rulings.
- **r1-10. Recon is not run again.** Rule: main moved by PR #1350 alone, checked by command (R4, R8), and recon's triage makes the live Jev call this revision's brief bars.
- **r1-11. A command that exits 2 is run again as step 7 writes it.** Rule: an exit of 2 is the command refusing its arguments (R4's last reading), a slip in typing and not a reading.

## The rulings, folded

- **Ruling 1** (finding 1): W1, with I1, S1, T1 and C1 pointing at it and P1's comparison-alone sentence; the trigger narrowed under r1-1.
- **Ruling 2** (finding 3): P1's paths, r1-2 and r1-3; the Boundaries line stays true.
- **Finding 2, by merge order**: step 3 of the order of work, PR #1350 having merged as 6bdebd7f.
- **The hypothesis**: measured true (R4); P1's step 7 and P2.
- **Findings 4 and 5**: named in the body as Issue #1353 and Issue #1354; nothing here fixes either, and PR #1356 fixed Issue #1354 on main.
- **Tokens logged by the command**: P2 and r1-9.

## Stop conditions

Hand back, naming the command and what it printed, when:

1. Any "today" block above is not in its file at 5cc32daa exactly as quoted, or is found more than once.
2. `gh api repos/ahl-gram/Vellum/pulls/1350 --jq .merged` prints anything but `true`, or `git rev-parse origin/main` after `git fetch origin` prints other than 38bfe7ee72dcd2574d640b18b1eb6496ad6cb6e8 and `git diff --stat 38bfe7ee72dcd2574d640b18b1eb6496ad6cb6e8 origin/main -- src scripts/still-judge scripts/jev scripts/design/shoot.ts scripts/delivery .claude/agents .github CLAUDE.md handbook/specs` prints anything.
3. `git merge origin/main` conflicts in any file, `handbook/specs/check-placement.md` included.
4. Evidence 1's step 1 diff prints a change, a step 3 command or a draw from `.base` fails, the one-liner prints anything but the line it names, the shoot exits non-zero, or a still's hash begins otherwise than Evidence 1 says.
5. Evidence 2 exits other than 0, its lines file holds other than four lines, or its stderr file is not empty.
6. Evidence 3's page counts differ from the line it names.
7. `test/repo/prose-paths.test.ts`, `test/repo/memory-pointers.test.ts` or `test/repo/footgun-gate.test.ts` reds.
8. The cold skeptic, should the dispatcher send one, finds a contradiction between the new text and a spec, gate, template or agent line this file does not list under Rosters and doctrine.
