# Issue #793, pull request 1 of 2: the town planner's design round, archived under design/

**Planned at:** `origin/main` fa8a88f62582dba53006e659c29598a1478e8a70 (`git ls-remote origin refs/heads/main`, read when the rulings were folded; measured at 236d75652fc6ff66bc08bfd1423856c055ee4724, and `git diff --stat 236d7565 fa8a88f6` names only `handbook/errata/prose.md`, `handbook/errata/site.md`, `handbook/plans/1400/1491/1491-plan.md`, `handbook/specs/cascade-traps.md` and `handbook/specs/ui-design.md`, none of which this plan names); Issue #793 read with `npm run --silent issue -- 793`: 3 comments shown, 0 withheld (comment 7179424246, the menu rulings; comment 7181779471, the design round rulings; comment 7192821132, the fold's rulings).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/793#issuecomment-7192821132 (Alex, 2026-11-26): D2 (a), the round is archived as `design/town-plans/`; D3 (a), the whole round except the six reference photos and the generated delivery page, 284 files; D1 (a), for the build beside this plan and quoted in this README; the planner's calls stand.

**What this pull request is.** The first of Issue #793's two pull requests: the design round Alex ruled from on 2026-11-25 (`out/793/` in the main checkout, drawn by `vellum-designer` at `236d7565`) goes into the repository as an archive under `design/`, content only, as `handbook/specs/conventions.md` (How a design decision is made, the paragraph opening "Every ruled design round is archived") says. The build of the planner is the second pull request, planned in `793-build-plan.md`, and it starts only once this one has merged, because it ports the planner from this archive. This one closes nothing: Issue #793 stays open for the build.

**This plan replaces the scratchpad's earlier `793-plan.md`**, which was the first planner's plan, stopped before it reported. It is byte for byte the file at `/Users/ahl/CodeProjects/Vellum/out/793-dry-run/793-plan.md` (`cmp` printed nothing), so overwriting the scratchpad copy loses nothing; its contract half lives on, folded, in `793-build-plan.md`.

## Specs

- `handbook/specs/conventions.md`: How a design decision is made (the archive paragraph, "A round's references are cited by link and never committed", "The archive pull request gets the cold skeptic, and the mock pages get the plate-reader"); The fidelity rule ("The archive is never edited to match the site").
- `handbook/specs/development-workflow.md`: step 8 (the plan archive and its file name for an issue that ships as several pull requests), steps 13 and 14.
- `handbook/specs/check-placement.md`: The formatter (`.prettierignore` keeps `design/` out); The lint (its roots, which `design/` is not among).

## The design

One new directory, **`design/town-plans/`** (ruling D2), holding the round as it ran: every file of `out/793/` except the six reference scans and the delivery's generated page (ruling D3), copied byte for byte by the script below, which checks the count and one SHA-256 over the copied bytes, plus a `README.md` written from the fenced block below and checked against its SHA-256. Nothing copied is edited. A finding about a copied file is answered in the README.

Alternatives rejected:

- **Copying by hand, or with `cp -R` of the whole folder and deleting afterwards:** neither proves the set landed whole; the script's count and checksum do, the way Issue #1427's archive (PR #1480) proved its own.
- **Keeping the scans:** `handbook/specs/conventions.md` says a round's references are cited by link and never committed; `refs/refs.json` keeps each scan's page and licence and `refs/NOTES.md` its reading.
- **Keeping the generated `index.html`:** it is the delivery's page, written by `npm run delivery`, and links every file by the delivery's own layout; the README replaces it, as PR #1480's did.
- **Rewriting the round's absolute paths** (`OUT_ROOT` in `mock/root.ts`, the shot lists): the fidelity rule keeps the round as it ran; the README says what the paths name, as the earlier archives' READMEs do.

What was measured for this plan (the planner's tree at `236d7565`, both candidate sets staged under `design/` and removed after):

- Every `src=` and `href=` in the twelve pages under `sheets/` is relative (`../stills/<file>` and `../../../design/kit/fonts.css`), and every one resolves with the whole set staged (the smaller set D3 did not choose would have left 60 image references across the 11 contact-sheet pages pointing at stills left out).
- With both sets staged at once, `npm test -- test/repo/prose-paths.test.ts test/repo/test-collection.test.ts test/repo/docs-only.test.ts test/repo/design-kit.test.ts test/repo/lint-roots.test.ts test/repo/format.test.ts` passed 44 of 44, `prettier --check .` printed "All matched files use Prettier code style!" and the whole-tree lint printed nothing. `design/` is not among `PROSE_ROOTS` in `test/repo/prose-paths.test.ts`, so the notes' backticked relative paths are not scanned.
- No file of the round carries a personal contact detail or a credential: `refs-tool/fetch-refs.ts` sends the generic user agent `VellumDesignRound/1.0 (design reference fetch)`; the absolute paths into the checkout (`mock/root.ts`, 79 lines each of `sheets/shots.json` and `sheets/shots-result.json`, one line of `notes.md`) are kept as they ran, as `design/the-primer-seats/README.md` says the earlier archives keep theirs.
- The set D3 ruled, counted by `out/793-fold/measure-fold/793-fold-archive-sets.sh` (log beside it): the whole round less the scans and the page, 284 files (219 stills), 87,801,562 bytes, checksum `a630fe597a5c9f28daac801432772c70b03faf83ae0b22a3530472838a138c91`.

## Files

| path | change |
|---|---|
| `handbook/plans/700/793/793-plan.md` | created: this plan, copied unchanged from the scratchpad (workflow step 8) |
| `design/town-plans/` | created: 284 files, byte-for-byte copies of `out/793/` in the main checkout, by the copy script below |
| `design/town-plans/README.md` | created: the fenced block under "The README", extracted by the command given there |

Nothing under `src/`, `test/`, `test-support/`, `scripts/`, `e2e/` or `handbook/specs/` changes.

## The copy script

Write this block, exactly, to the scratchpad as `793-archive-copy.sh` with the Write tool, then run `bash /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/e10e446a-b083-40ae-ac4b-613c7de8cec2/scratchpad/793-archive-copy.sh` from the tree root. It reads the main checkout's `out/793/` and writes only under the tree's `design/town-plans/`.

```bash
#!/bin/bash
# Issue #793, archive pull request: copies the ruled round from the main checkout's out/793/ into design/town-plans/, byte for byte, and checks the count and the checksum of what it copied. Run once, from the worktree root.
set -euo pipefail
export LC_ALL=C
SRC=/Users/ahl/CodeProjects/Vellum/out/793
DST=design/town-plans
[ ! -e "$DST" ] || { echo "$DST already exists"; exit 1; }
mkdir -p "$DST/refs" "$DST/stills"
cp -Rp "$SRC/notes.md" "$SRC/sizes.json" "$SRC/lint.config.ts" "$SRC/lint-witness.ts" "$SRC/planner" "$SRC/mock" "$SRC/ccam" "$SRC/measure" "$SRC/sheets" "$SRC/refs-tool" "$DST/"
cp -p "$SRC/refs/NOTES.md" "$SRC/refs/refs.json" "$DST/refs/"
for f in "$SRC"/stills/*; do
  cp -p "$f" "$DST/stills/"
done
n=$(find "$DST" -type f | wc -l | tr -d ' ')
sum=$(cd "$DST" && find . -type f -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -d' ' -f1)
echo "files $n, checksum $sum"
[ "$n" = "284" ] || { echo "expected 284 files"; exit 1; }
[ "$sum" = "a630fe597a5c9f28daac801432772c70b03faf83ae0b22a3530472838a138c91" ] || { echo "the checksum differs from the plan's"; exit 1; }
```

## The README

Extract it from the archived copy of this plan, after commit 1 has put that copy at `handbook/plans/700/793/793-plan.md`, with `awk '/^````$/{c++; next} c==1' handbook/plans/700/793/793-plan.md > design/town-plans/README.md` (the block between this plan's only two lines of four backticks). Then `shasum -a 256 design/town-plans/README.md` prints `6af94869c9e5238177988c4bed223afe9997b6afcdbb5d3e1cf1b7b0a19d0637`.

````
# Town plans

The design round for Issue #793, the town planner, Sub 1b of Epic Issue #753 (the engraved prospects): how a world's capitals, realm seats, towns and villages each take a plan of their own from their ground, whether their streets follow the land or a grid, how a wall meets the water, how built up a town is and what a plan and its plates may weigh, and how the bird's-eye and the skyline read the plan.

- **Drawn:** by `vellum-designer` on 2026-11-25, from a tree detached at `236d7565`, origin/main that day. Every still is real engine output at that commit, drawn by the round's own code beside this file, and every PNG was shot through the shared camera (`scripts/design/shoot.ts`). The places were chosen by `measure/sweep.ts` over seeds 1 to 40 and 42.
- **Ruled:** by Alex on 2026-11-25, in two sittings relayed by the orchestrating session: the menu that ordered the round (Issue #793 comment 7179424246) and the round's own six rulings (Issue #793 comment 7181779471); and on 2026-11-26, on the fold of the round into the build's plan, the budget taken again and this archive's name and contents (Issue #793 comment 7192821132).
- **Built to by:** Issue #793's build, which ports the planner in `planner/` into `src/prospect/town-plan/`, streets with the land only; Issue #755 (Sub 2, the bird's-eye), which draws the plan inside the real coast, rivers and roads; the later sub in which the profile takes its skyline from the plan; and Issue #1492, the plan from directly above as a plate of its own. The post-use re-review is Issue #796.
- **Kept:** the round as it ran, every still and contact sheet, the measurements, the notes and the code, as Alex ruled for this archive (Issue #793 comment 7192821132, D3: "the whole round is archived except the six reference photos and the generated delivery page").

Everything here is the round as it ran. Nothing is edited to match the build or the rulings, as the fidelity rule says (`handbook/specs/conventions.md`).

The notes, the code and the shot lists name the round's delivery folder in the main checkout, out/793/, which is gitignored; a path they give under out/793/ names the same file under this directory. The code ran from the designer's tree, and its imports (`../../../src/...`) read the engine of whatever checkout it stands in; `OUT_ROOT` in `mock/root.ts` sends its output to the main checkout's out/793/ unless `OUT_793` is set, so replaying it as committed draws against today's engine and writes over that folder. It is neither type-checked nor linted: `design/` is outside `tsconfig.json`'s include and the lint's roots.

## What is in the archive

- **`notes.md`**: the designer's notes as they stood when the menu was put: what to look at first, the controls, the places and why each, the menu of six items with the still each option was shown with, what was measured, what is ruled and what is not ("For whoever builds it"), what could not be drawn truthfully, and the bold choices that were the designer's own.
- **`stills/`**: 140 SVG plates as the drawers wrote them and 79 PNG shots: for each of the seven places, from directly above (`plan-*`), in the bird's-eye (`bird-*`) and as a skyline (`prof-*`), in the antique and ink dresses, each as today's look (`*-control-*`), streets with the land (`*-land-*`) and streets on a grid (`*-grid-*`); the lean houses (`*-lean-*`), the wall open to the water (`*-open-*`) and the plan at the land's own width (`*-true-*`) where the menu asked; the full-scale and twice-size crops (`full-*`, `crop-*`); and the eleven contact sheets (`sheet-*.png`), the capital of seed 42 first.
- **`sheets/`**: the twelve pages the contact sheets were shot from, their shot list (`sheets/shots.json`) and its results (`sheets/shots-result.json`). The pages link the stills by relative paths and the house faces through `design/kit/fonts.css`, so served from this repository's root they show every picture.
- **`planner/`**: the planner as it ran, both street systems (`planner/streets-land.ts`, `planner/streets-grid.ts`), with the sitting's switch between them, and `planner/types.ts`, the plan's shape.
- **`mock/`**: the drawers (from directly above `mock/plan-view.ts`, the bird's-eye layer `mock/birdseye.ts`, the skyline `mock/profile.ts`, the houses `mock/houses.ts`, the gate names `mock/names.ts`, the band 4 and 5 close-up control `mock/closeup.ts`) and the harness that drew the stills and the sheets (`mock/build.ts`, `mock/sheets.ts`, `mock/places.ts`, `mock/root.ts`).
- **`ccam/`**: the archived bird's-eye mock C of `design/prospects-after-braun-hogenberg/mock/`, ported so it runs at `236d7565`; `ccam/shared.ts` holds the three functions copied verbatim from that archive, and `measure/port-check.ts` shows the port draws the archived C plates byte for byte.
- **`measure/`**: every measurement, each with its log: the sweep that chose the places (`measure/sweep.ts`), agreement with the world's roads and rivers (`measure/agree.ts`), plate bytes (`measure/bytes.ts`), houses per kind (`measure/houses.ts`), the founding split behind the designer's by-age option (`measure/founding.ts`), the profile's width against the land's (`measure/widths.ts`), determinism (`measure/determinism.ts`) and the C port check (`measure/port-check.ts`).
- **`sizes.json`**: every still's bytes and render time, and every plan's size.
- **`lint.config.ts`** and **`lint-witness.ts`**: how the round ran `vellum/prospect-libm-clock-free` over its own code, and the witness that the run can fail.
- **`refs/`**: `refs/NOTES.md`, what each reference plan taught, and `refs/refs.json`, each one's page, original address, pixel size and licence field (5 public domain, 1 CC BY-SA 2.0, Palmanova). **`refs-tool/`**: the script that fetched them.

## What the archive leaves out, on purpose

- **The six reference scans** under out/793/refs/ (aigues-mortes.jpg, bern.jpg, cologne.jpg, freiburg.jpg, palmanova.jpg, valletta.jpg; 12.5 MB), as `handbook/specs/conventions.md` says a round keeps its references: by link. `refs/refs.json` gives each one's page, and `refs/NOTES.md` still names them.
- **The round's page**, the delivery's generated index.html (0.6 MB), which links every file by the delivery's layout. This README replaces it.

## The rulings, as ruled

Each as the comment that records it gives it, beside the stills it was ruled from.

From the menu that ordered the round (Issue #793 comment 7179424246):

> 1. **The design round comes first, as this issue orders.** The house designer draws candidate town layouts (streets that follow the land, and streets on a grid) for real places in real worlds, each from above, from the high bird's-eye and as a skyline, beside today's look; Alex rules from those stills, the round is archived under `design/`, and only then is the planner's drawing half folded and built.
> 2. **The planner covers the four kinds a world map holds**: capitals, realm seats, towns and villages (1,051 places over seeds 1 to 40 and 42 in the planner's count). Hamlets, farmsteads and mills, which appear only on close-ups, are left out.

From the round's sitting (Issue #793 comment 7181779471):

| ruling | as ruled | ruled from |
|---|---|---|
| 1 | "**Streets follow the land (A).** Not the grid (B), and not the designer's by-age split." | the A column of each `stills/sheet-<place>.png`; `stills/crop-plan-land-capital-laukuwelua-antique.png` |
| 2 | "**The wall is closed at the water too**, keeping the wall a closed ring." | `stills/sheet-shore.png`; `stills/crop-plan-land-capital-laukuwelua-antique.png` against `stills/crop-plan-land-open-capital-laukuwelua-antique.png` |
| 3 | "**Lean density, with the designer's proposed budget**: wider houses, more gaps and open yards (about half the houses); 460 KB per bird's-eye plate, 240 KB per profile and 1,950 points per plan, the round's measured worst cases plus 5%, which the fold re-sweeps over every world before writing a bound." Taken again, below. | `stills/sheet-detail.png`; `stills/crop-bird-land-lean-capital-laukuwelua-antique.png` |
| 4 | "**The skyline reads the plan at today's width** (keep, church, gaps and the climb from the plan; about 10% more bytes), for the later profile sub." | the middle column of `stills/sheet-profile-width.png` |
| 5 | "**The planner's placement rules stand as drawn**: towns walled and villages open; one wall shaped to the land; a gate wherever a road crosses the wall; the market pulled toward the gates and the quay; the keep on the height; the church near the market; a bridge wherever a street crosses the river, with a lane and bridge added where none does; the quay nearest the market; villages along their road." | every place sheet, `stills/sheet-<place>.png` |
| 6 | "**The town from directly above becomes a plate of its own later**, filed as its own issue." That issue is Issue #1492. | every "From directly above" row of the place sheets |

Ruling 3's limits, taken again after the fold swept them wider (Issue #793 comment 7192821132, D1):

> **D1, option (a): the size limits hold for every town.** The round set 460 KB per bird's-eye, 240 KB per skyline and 1,950 points per plan from pictures of 3 worlds; swept wider (seeds 1 to 40 and 42, and the capitals of seeds 43 to 300) all three are passed (plans up to 2,192 points, bird's-eyes up to 553 KB, skylines up to 245 KB). They stay as hard limits: the planner trims a plan's block outlines just enough to fit 1,950 points (only 7 capitals change; no place in the ruled stills or the 41 worlds does), and Issue #755 and the later skyline sub hold 460 KB and 240 KB by standing fewer houses on the heaviest towns (a capital with no houses is at most 280 KB and 181 KB).

It was ruled from stills this archive does not hold, the delivery out/793-budget/ in the main checkout: seed 181's capital from directly above and in the lean bird's-eye, as the round's planner draws it at 2,192 points and trimmed to 1,948, and seed 29's capital as drawn, which the trim leaves alone.

## Found after the sitting

- **The budget's numbers do not hold over every world.** The fold's re-sweep (Issue #793's build plan, archived with the build under handbook/plans/700/793/) drew every place of seeds 1 to 40 and 42 as ruled: the lean bird's-eye of seed 29's capital in the ink dress weighs 476.6 KB and seed 16's profile 241.2 KB, against 460 KB and 240 KB; the plates in `measure/bytes.log` covered seeds 42, 7 and 19 only, and the notes' 439 KB worst case is the antique dress alone (its ink twin, `measure/bytes.log`, is 491 KB for the grid and 437 KB with the land). Past seed 42 the capitals of seeds 43 to 300 reach 2,192 points, 552.7 KB and 245.1 KB. How the budget is held is the re-take above.
- **The profile from the plan stands the full houses**, not the lean tier: `planGeometry` in `mock/profile.ts` calls `housesOf` with its default detail. The 240 KB the notes propose rests on that.
- **The planner's type imports do not all resolve**: `planner/plan.ts` and `planner/network.ts`, among others, import the type `P` from `planner/types.ts`, which does not export it. Node strips the types and the code runs; a type check would refuse it. The build imports `P` from its geometry module.
- **The drawers' streams carry the street system in their names** (`mock-houses:<index>:<direction>:<block>` in `mock/houses.ts`, `mock-birdseye:<index>:<direction>` in `mock/birdseye.ts`), so a drawer built to these stills reproduces their gaps and heights only on a stream named with `land`.
````

## Tests, in the order they are written

None. An archive is content, and nothing under the lint's roots, the type checker's include or the unit suite's `test/` changes. No browser check is added, so no ledger line, reading or step count is owed.

## Order of commits

Branch `chore/793-town-plans-archive`.

1. `handbook/plans/700/793/793-plan.md` (this plan, unchanged) and the 284 files the copy script writes. Subject `#793 The town planner's design round, copied as it ran into design/town-plans/`; body one paragraph: the 284 files are byte-for-byte copies of the main checkout's out/793/ less its six reference scans and its generated page, count and checksum in the archived plan. Push with `git push -u origin chore/793-town-plans-archive`.
2. `design/town-plans/README.md`, extracted and checked as "The README" says. Subject `#793 The town plans README: every ruling in its comment's words beside its still`. Push.

## Rosters and doctrine

None. `design/` joins no roster: no test lists the rounds, `.prettierignore` and the lint's roots already leave the folder out, and `handbook/specs/conventions.md` names no round. No spec line changes.

## Evidence

- `bash <scratchpad>/793-archive-copy.sh` prints `files 284, checksum a630fe597a5c9f28daac801432772c70b03faf83ae0b22a3530472838a138c91` and exits 0.
- `shasum -a 256 design/town-plans/README.md` prints the hash under "The README".
- `git diff --stat origin/main` names only files under `design/town-plans/` and `handbook/plans/700/793/793-plan.md`.
- `npm run lint`, `npm run format:check`, and `npm test -- test/repo/prose-paths.test.ts test/repo/test-collection.test.ts test/repo/docs-only.test.ts test/repo/design-kit.test.ts test/repo/lint-roots.test.ts test/repo/format.test.ts` (44 pass when planned), then `npm run astro:generate`. `npm run check` is not owed: `design/` is outside `tsconfig.json`'s include. CI runs every lane: `design/` is not among `DOC_DIRS` in `scripts/ci/docs-only.ts`.
- E2E suites: none touched.
- `vellum-pr-skeptic`, cold, on the pull request.
- `vellum-plate-reader` over the archived mock pages, served from the tree's root at `/design/town-plans/sheets/<page>.html`, the twelve pages, as `handbook/specs/conventions.md` owes an archive pull request. What it should find: every picture and the house faces resolve (every `src` and `href` resolved when planned); the contact sheets match `stills/sheet-*.png`. No still judge comparison is owed: no world sheet's drawing changes.
- `vellum-guard-prover`: not owed, no guard.

The pull request body uses the template's form for a pull request that leaves its issue open: `Issue: #793, stays open because the planner's build lands in the next pull request`, with no closing keyword beside the number, and `gh pr view <N> --json closingIssuesReferences` prints an empty list.

## Calls made

1. **Two pull requests, the archive first.** Rule: the dispatcher's brief and ruling 7181779471's "Next" ("the round is archived under `design/` in its own pull request"), `handbook/specs/conventions.md` ("in its own pull request"); the build then ports from the archive, so the ported bytes have a committed source.
2. **This plan takes the issue's first plan name, `793-plan.md`, and the build takes `793-build-plan.md`.** Rule: workflow step 8 (the first pull request's plan is `<N>-plan.md`, each later one `<N>-<label>-plan.md`).
3. **The reference scans and the generated page stay out; their links, licences and readings stay in.** Rule: `handbook/specs/conventions.md` (references by link), and PR #1480's README, which replaced the generated page.
4. **The round's code, shot lists and absolute paths are kept exactly as they ran**, and the README says what they name. Rule: the fidelity rule ("the archive is never edited") and `design/the-primer-seats/README.md`'s keeping of its own.
5. **What the fold found after the sitting is written in the README, not into the copied files.** Rule: the fidelity rule; PR #1480 answered its findings in its README.
6. **No dry-run shot of the archived pages was taken for this plan.** The plate reader's read is a dispatch, not a browser check this plan adds, so the two readings the planner's Tests line asks of a browser check are not owed; the links were checked by resolving each one instead.

## Open decisions

none

## Stop conditions

- `/Users/ahl/CodeProjects/Vellum/out/793/` is missing, or the copy script prints a count or checksum other than the plan's: hand back; never adjust the script to match.
- `design/town-plans/` already exists on `origin/main` or the branch: hand back.
- The extracted README's SHA-256 differs from the plan's: hand back; never edit the README to match.
- `npm run lint`, `npm run format:check` or a named test reds with the archive staged: hand back, since the measured run was green.
- The plate reader or the skeptic asks to add, drop or edit a copied file, to shoot a still again, or to edit `design/prospects-after-braun-hogenberg/`: that is the fidelity rule's and Alex's D3 ruling's, not the build's; hand back.
- A comment on Issue #793 newer than the three this plan read, other than a `Plan archive, not a ruling:` comment: hand back.
