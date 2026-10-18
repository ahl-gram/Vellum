# Issue #827, revision 1: a status pill of whitespace alone reds the notices pin, the placement rule moves beside the test lists, and three comments drop what the pins hold

**Planned at**: `origin/main` `7207cfdd` (PR #912), Issue #827 read with 3 comments (the rulings 6253738018, the plan archive 6253802639, the implementer's calls made 6254011639); built and measured on PR #914's head `7fa10551`, 2026-10-18.

**Revises**: `handbook/plans/827/827-plan.md` (committed on the branch in `da00f55b`, frozen; sha256 `46d2a5b4bf7f2aa6226d46634551d8137e63b5b78dfad5c8ddf834801705cd1c`, archived as comment 6253802639). This revision builds on the same branch `chore/827-kit-glue` from `7fa10551`: no new branch, no rebase, no amend.

**Rulings**: unchanged, https://github.com/ahl-gram/Vellum/issues/827#issuecomment-6253738018. One change here brings the build back to a ruling: ruling 2's option said "The site spec gains the sentence beside the new test lists", and the frozen plan seated the sentence about 55 lines from them (R4.5).

**Open decisions**: none.

## Why

The cold skeptic's SHOULD-FIX 1 on PR #914: the notices pin runs `tight()`, which collapses `>\s+<`, before it matches the pill with `[^<]*</p>`, so a pill rendered with whitespace inside passes it. `src/styles/shared/atelier.css:89` hides an empty pill with `body.chart-room .stage .status:empty { display: none; }`, and whitespace is a text node, so such a pill is not `:empty` and shows. Measured, both halves:

- **Astro keeps the whitespace** (`compressHTML: false`, `astro.config.ts:39`). With `<slot name="pill" />` moved onto its own line inside the `<p>` of `src/layouts/StageNotices.astro`, the build writes `<p class="status" id="status" role="status" aria-live="polite">\n  \n</p>` on the Explorer and `pr-status` the same on the Print Room (read from `out/test-astro-build/` with node).
- **The PR's pin does not see it**: at `7fa10551` with that edit, `node --test test/site/astro-scaffold.test.ts` printed `tests 30`, `pass 30`, `fail 0`.
- **The browser shows it**: the CDP probe below.

### The browser probe

Script `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/827-r1-empty-probe.ts` (sha256 `c558ecdc7d396a0640f8a19483439d43b70ce9140423a23c06be7cf05fb0179e`; run with `node <path>`, it starts and kills its own Brave on port 9471 and removes its profile). It loads the tree's `src/styles/shared/shell.css`, `src/styles/shared/atelier.css` and `src/styles/print-room/index.css` on a throwaway page under `body.chart-room`, with four pills each in its own `.stage`, and reads them through CDP in headless Brave (`HeadlessChrome/155.0.0.0`):

| pill | child nodes | `:empty` | display | rect | background |
|---|---|---|---|---|---|
| `<p ...></p>` (control: must hide) | 0 | true | `none` | 0 x 0 | 55% chart ink |
| `<p ...>\n  \n</p>` (what the edit writes) | 1 | false | `block` | 28.84 x 9.61 | 55% chart ink |
| `<p ...> </p>` (one space) | 1 | false | `block` | 28.84 x 9.61 | 55% chart ink |
| `<p ...>Drawing the chart</p>` (control: must show) | 1 | false | `block` | 150.31 x 53.71 | 55% chart ink |

The bare control computing `display: none` proves the sheet loaded and the `:empty` rule applied; the background resolving to `color(srgb 0.239216 0.184314 0.121569 / 0.55)` proves `--chart-ink` came in from `shell.css`, so the whitespace pill is painted. What a reader would see: a dark smudge about 29 by 10 px (the pill's padding and nothing inside it) at the centre of the stage, on the Explorer, the Portfolio, the Print Room, the Prospect and the Ribbon, before the room's script first writes the pill and for as long as scripts are off. Severity is small; the guard costs one assertion.

The same probe reads the Print Room's legend status (`p.legend-status`, which the legend pin also reads through `tight()`): bare and whitespace-only both compute `display: block`, height 14.97 (its `min-height: 1.2em`, `src/styles/print-room/index.css:422`), transparent ground. No rule there tells the two apart, so no check is added for it (Calls made, R2).

## The change

Four files, eleven lines in and five out, written as one patch and measured: `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/827-r1.patch`, sha256 `3dcf766313489245cfc637603bacc9f879a975d7513651de52684b0bba0a46a6`, 77 lines, made with `git diff` against `7fa10551`. The archive copy, the same bytes (checked with `cmp`):

```diff
diff --git a/handbook/specs/site-architecture.md b/handbook/specs/site-architecture.md
index d73a9ba8..12952ee0 100644
--- a/handbook/specs/site-architecture.md
+++ b/handbook/specs/site-architecture.md
@@ -28,7 +28,6 @@ symbol and path so the reader goes and looks.
   `src/pages/<route>/index.astro`, home being `src/pages/index.astro`, and the layout is
   `src/layouts/BaseLayout.astro`, which owns the nav, the head cluster, the footer and the page
   meta. The tree is the roster of pages; no list of them is kept anywhere, including here.
-- **A component under `src/layouts/` keeps a piece of the room's furniture one shape, and the page keeps where the piece stands.** The order of a room's furniture inside the shell (the stage, the folios, the slip, the legend row, the Glass) is written in its page, and that order carries the room's stacking and its tab order.
 - **A page's files share its route path in every tree that holds one.** Its markup is
   `src/pages/<route>/index.astro`, its own code, where it has any, sits under `src/site/<route>/`, and the sheet it
   authors is `src/styles/<route>/index.css`, served at `<route>/index.css`, which the layout links relatively; home, whose route is the
@@ -98,6 +97,7 @@ symbol and path so the reader goes and looks.
   and CI's jobs no longer leave room inside the account's concurrent-job limit. A change to the
   number of unit shards joins the same required checks, since each shard reports a check of its own,
   and the same proof-runner cap.
+- **A component under `src/layouts/` keeps a piece of the room's furniture one shape, and the page keeps where the piece stands.** The order of a room's furniture inside the shell (the stage, the folios, the slip, the legend row, the Glass) is written in its page, and that order carries the room's stacking and its tab order.
 - **A suite is one entry file at the top of `e2e/suites/`, named for the suite**, and that name is
   what every roster above holds. A suite with parts keeps its entry there and puts the parts in a
   folder of the same name beside it, which the entry imports (`e2e/suites/chart-drawer.ts` beside
diff --git a/src/layouts/LegendRow.astro b/src/layouts/LegendRow.astro
index 74a7ed30..4be4713f 100644
--- a/src/layouts/LegendRow.astro
+++ b/src/layouts/LegendRow.astro
@@ -1,5 +1,5 @@
 ---
-// The legend row at the chart's foot (Issue #462 chart-room ruling 4; the Atelier Kit, Issue #487; Issue #827): the nav the page names, its head, and the row its roads out and presses stand in, a group named by rowLabel or else by the head when the head has an id; the page writes the words and the order, the component keeps the shape.
+// The legend row at the chart's foot (Issue #462 chart-room ruling 4; the Atelier Kit, Issue #487; Issue #827): the nav the page names, its head, and the row its roads out and presses stand in.
 interface Props {
   label: string;
   headId?: string;
diff --git a/src/layouts/StageNotices.astro b/src/layouts/StageNotices.astro
index d025494a..1d0ac3f9 100644
--- a/src/layouts/StageNotices.astro
+++ b/src/layouts/StageNotices.astro
@@ -1,5 +1,5 @@
 ---
-// The stage's notices, last in the stage (Issue #827): the live status pill, the render-worker warning that stays hidden until the worker fails, and the scripts-off notice; the page passes the ids its script reads and writes its own sentences.
+// The stage's notices (Issue #827): the live status pill, the render-worker warning that stays hidden until the worker fails, and the scripts-off notice; the page passes the ids its script reads and writes its own sentences.
 interface Props {
   pillId?: string;
   warningId?: string;
diff --git a/test/site/astro-scaffold.test.ts b/test/site/astro-scaffold.test.ts
index 2059ce17..0ded4887 100644
--- a/test/site/astro-scaffold.test.ts
+++ b/test/site/astro-scaffold.test.ts
@@ -990,7 +990,7 @@ test("every road out names its destination by that route's name in the tree (Iss
 });
 
 type Legend = { label: string; headId?: string; rowLabel?: string; note?: true; status?: string };
-/** Every legend row on the site by page, LITERAL as ROADS is; a page absent here renders none. */
+/** Every legend row on the site by page, LITERAL as ROADS is. */
 const LEGENDS: Record<string, Legend> = {
   "explorer/index.html": { label: "The Press", headId: "grp-press" },
   "print-room/index.html": {
@@ -1055,7 +1055,7 @@ const noticesShape = (n: Notices): RegExp =>
       `${literal("</div>")}$`,
   );
 
-test("every stage's notices stand in the kit's one shape, last in the stage: the live status pill, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827)", () => {
+test("every stage's notices stand in the kit's one shape, last in the stage: the live status pill, never whitespace alone, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827)", () => {
   for (const p of PAGES) {
     const html = page(p.route);
     const want = NOTICES[p.route];
@@ -1068,6 +1068,12 @@ test("every stage's notices stand in the kit's one shape, last in the stage: the
     assert.ok(at !== -1 && end > at, `${p.route} stands its stage before the vignettes`);
     const stage = html.slice(at, end);
     assert.match(tight(stage), noticesShape(want), `${p.route}'s notices, as the kit renders them`);
+    if (want.pill)
+      assert.doesNotMatch(
+        stage,
+        new RegExp(`${literal(`<p class="status" id="${want.pill}" role="status" aria-live="polite">`)}\\s+</p>`),
+        `${p.route}'s status pill holds only whitespace, which the sheet's :empty does not hide`,
+      );
   }
 });
 
```

That fence is the archive and the review copy; the implementer applies the patch FILE, never the fence, since a copy out of markdown can lose a trailing space or the final newline.

## Calls made in this revision

The implementer copies these into the revision's issue comment (Evidence, step 8).

- **R1. The pill is checked on the RAW stage slice, after the shape match, as a negative keyed on the defect: no pill holds whitespace alone.** Rejected: the skeptic's exit as written, a positive raw `aria-live="polite"></p>` for every pill with no text, which needs a new `NOTICES` field to tell the Specimen's filled pill (`sb-status`, `the status pill, as a room reports a draw`) from the five empty ones and pins more than the defect. Rule: `vellum-footguns` Gate 7 item 2 (a scan is keyed on what the defect looks like) and Gate 1 item 19 (a reference that went through a transform also asserts against the raw source, on what the transform cannot represent). The shape match just before it is its anchor (Gate 1 item 4): it has already found the pill's opening tag. A filled pill with whitespace around its words passes, correctly: the regex `\s+</p>` must meet the close straight after the whitespace, and node read `false` for the Specimen's pill under mutation (a).
- **R2. Blind spots, named with their direction.** The check reads literal whitespace, so it errs toward passing a pill holding an entity that renders blank (`&nbsp;`), which is words an author typed rather than the line break formatting leaves, the defect's only measured source. It does not read the Print Room's legend status, measured to render the same empty or whitespace-only (above); it would matter only if that sheet ever gave `.legend-status` an `:empty` rule. `.slip .bound-line:empty` (`src/styles/print-room/index.css:225`) and `.rf-log-sig:empty` (`src/styles/shared/reading-frame.css:170`) are on markup this PR did not lift and no pin of it reads; they are out of scope.
- **R3. The test's name gains `never whitespace alone`**, so the record of what it pins stays whole. Rule: `CLAUDE.md` Process, "a behavior a test pins needs no comment: the test is the record".
- **R4. The skeptic's NITs: the five the dispatcher named, and the StageNotices head the same rule reaches.** Rule for the comment ones: `CLAUDE.md` Process, "Comments are the exception" (a behavior a test pins needs no comment); that the plan prescribed them is no defence, since this planner wrote that plan.
  1. **The `LEGENDS` docblock loses `a page absent here renders none`**: it restates `rows.length, want ? 1 : 0` in the legend test. `LITERAL as ROADS is` stays: it marks a hand-literal roster as the deliberate exception to Gate 1 item 16 and points at the `ROADS` docblock that argues why.
  2. **The `NOTICES` docblock stays as it is**: its Today clause gives the reason for a data value no test can explain (why Today's entry alone carries `follows: "</p>"`), the one kind of comment the rule keeps.
  3. **The `LegendRow` head loses two clauses**: `a group named by rowLabel or else by the head when the head has an id` is pinned by `legendShape`'s group arm (and proved by the prover's group-role mutation), and `the page writes the words and the order, the component keeps the shape` is now the site spec's placement bullet, which is that rule's one home. What stays is the kit's head form every sibling under `src/layouts/` carries: what the piece is and where it was ruled.
  4. **The `StageNotices` head loses `last in the stage`**, by the same rule: the notices shape's `</div>$` anchor pins it, and where the piece stands is the page's (the placement bullet). This one is the planner's own call: the dispatcher did not name it, and the planner has not seen the skeptic's report, so it may or may not be the fourth comment NIT the PR body counts. The `ChartFolio` head, which the PR edited only to stay true, stays.
  5. **The placement bullet moves from `handbook/specs/site-architecture.md:31` to directly after the rosters bullet** (the one that names `LEGENDS` and `NOTICES`, ending `and the same proof-runner cap.`), word for word, and before the suite bullet, whose "every roster above" stays true. Rule: ruling 2's option, as relayed, "The site spec gains the sentence beside the new test lists"; the frozen plan's "a new bullet directly after the first one" contradicted it, and line 31 is about 55 lines from those lists. Both seats are under "How a page is authored", so only the ruling tells them apart. This corrects the plan to the ruling; it overrides nothing.
  6. **The folio test's chart-room filter stays repeated**: two call sites of a one-line predicate in one file is not yet an abstraction, and folding the check into the kit test's own folio loop, the one way to drop the repeat, would move the red line of the prover's `ChartFolio` mutation (it would red first on `explorer/index.html's folio leads with the world's name`), so the twelve proven red lines in the PR body would need proving again for no reader's gain.

The plan's Calls made 13 now reads, in the issue comment: "an empty head, note, warning or scripts-off sentence, or a status pill holding whitespace alone, fails them".

## Mutations, and the prover

**The existing twelve stay valid, unrun.** The new assertion runs after the shape match in the same iteration, and none of the twelve puts whitespace in a pill, so each still reds where it did; the legend and folio mutations red in tests whose code this revision does not touch (the `LEGENDS` edit is a comment). Measured for two at `7fa10551` with the revision applied: `StageNotices.astro` drop ` aria-live="polite"` red `explorer/index.html's notices, as the kit renders them`; drop ` hidden` red `print-room/index.html's notices, as the kit renders them`, both the PR body's own lines.

**The prover is owed one round, on the new head, for the strengthened notices guard, on two mutations of `src/layouts/StageNotices.astro` line 9**, each measured red here on `explorer/index.html's status pill holds only whitespace, which the sheet's :empty does not hide` with the other 29 tests green:

- (a) the slot on its own line: replace line 9 with the three lines
  ```
  {pillId && <p class="status" id={pillId} role="status" aria-live="polite">
    <slot name="pill" />
  </p>}
  ```
- (b) one space before the slot: line 9 becomes `{pillId && <p class="status" id={pillId} role="status" aria-live="polite"> <slot name="pill" /></p>}`

It also confirms the test file prints `tests 30`, `pass 30`, `fail 0` at the new head unmutated.

## Order of commits

One commit on `chore/827-kit-glue`, after `7fa10551`:

`#827 A status pill of whitespace alone reds the notices pin, and the placement rule moves beside the test lists`: `handbook/plans/827/827-r1-plan.md` (this file, byte for byte, under the house's revision name as `handbook/plans/671/671-r2-plan.md` is; the scratchpad copy keeps the dispatcher's name `827-r1-delta.md`) and the patch.

## Evidence (the implementer, in its own tree at `7fa10551`)

1. `shasum -a 256` on the patch file prints `3dcf766313489245cfc637603bacc9f879a975d7513651de52684b0bba0a46a6`; `git apply --check <patch>` exits 0; `git apply <patch>`; `git diff --stat` prints `handbook/specs/site-architecture.md | 2 +-`, `src/layouts/LegendRow.astro | 2 +-`, `src/layouts/StageNotices.astro | 2 +-`, `test/site/astro-scaffold.test.ts | 10 ++++++++--`, `4 files changed, 11 insertions(+), 5 deletions(-)`.
2. Copy this file to `handbook/plans/827/827-r1-plan.md` and `cmp` it against the scratchpad file.
3. `node --test test/site/astro-scaffold.test.ts` prints `tests 30`, `pass 30`, `fail 0`. Then `npm test`, `npm run check`, `npm run lint`, `npm run format:check`, each exit 0. Commit, with the house trailer (`Drafted-By: vellum-implementer (<your model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: https://claude.ai/code/session_01C1gcaoEeqC9XvMsyaV67Em`), and push.
4. After the commit, mutations (a) and (b) above, one at a time, each red on its named line and restored with `git checkout -- src/layouts/StageNotices.astro` (it holds no uncommitted work once committed).
5. No served byte changes, measured here: `diff -r` of the whole Astro build before and after the component and test edits (the scaffold test's `out/test-astro-build/`, kept as `out/827-r1-before/`) printed nothing; Astro does not emit a component's frontmatter, and neither the test file nor the handbook is served. Where `out/827-dist-main` and `out/827-dist-compare.ts` exist in your tree, also `npm run build` and `node out/827-dist-compare.ts out/827-dist-main dist`, which must print what commit 4's build printed (the nine `WHITESPACE BETWEEN TAGS` lines and nothing else); where they do not, step 5's measured line is the record and nothing is rebuilt.
6. No e2e suite is owed, since no served file changes; CI runs every lane. `vellum-plate-reader` is not owed.
7. Dispatch `vellum-guard-prover` on the new head for the notices guard, mutations (a) and (b).
8. Before the PR body edit, post a dated comment on Issue #827: `**Calls made in revision 1 of the plan (vellum-implementer, <date>).**` then R1 to R4 above in one line each and the amended Calls made 13, pointing at the dispatcher's archive comment of this revision. One `gh issue comment 827 --body-file <file>` per call.

## The PR body edits

- **Guards**: add these two rows after the `notices, order` row, and this line under the table, exactly; then change "12 of 12" to the prover's new count as its report gives it:

  ```
  | notices, no pill of whitespace alone | prover: `StageNotices.astro` put the pill's slot on its own line | `explorer/index.html's status pill holds only whitespace, which the sheet's :empty does not hide` |
  | notices, no pill of whitespace alone | prover: `StageNotices.astro` put one space before the pill's slot | `explorer/index.html's status pill holds only whitespace, which the sheet's :empty does not hide` |

  The PR's pin at 7fa10551 passed the slot-on-its-own-line edit (30 of 30, measured by the planner), the hole the cold skeptic named; the assertion that closes it reads the raw stage, after the shape match.
  ```
- **Ran**: add the commit's `node --test` line, the four exit-0 lines, and step 5's line.
- **Records**: the `vellum-guard-prover` line names its second round and its head; "guards changed or added after its round, proven by this session only" stays `none` when the prover's round covers the new assertion. The `vellum-pr-skeptic` line becomes: `one cold round on 7fa10551, relayed in chat 2026-10-18 (not posted on the PR); no blocker. Its SHOULD-FIX (a status pill of whitespace alone passed the notices pin) is fixed in <sha> by revision 1 of the plan (handbook/plans/827/827-r1-plan.md); of its NITs, four are fixed in the same commit (the LEGENDS docblock, the LegendRow head, the StageNotices head, and the placement bullet, moved beside the test lists as ruling 2's option said) and two stand with their reasons in that revision (the NOTICES docblock, the folio test's filter). No further skeptic round: an edit after the cold review earns none.`
- **Rulings**: add `revision 1's calls: <link to step 8's comment>`.

## Stop conditions

Hand back, do not adapt, when:

- the patch's sha256 differs, `git apply --check` fails, or the branch head is not `7fa10551` when you start;
- step 3 does not print `tests 30`, `pass 30`, `fail 0`, or any of `npm test`, `check`, `lint`, `format:check` exits non-zero (a `max-lines-per-function` count past the file's two suppressions in `eslint-suppressions.json` included; measured clean here);
- mutation (a) or (b) does not red on exactly `explorer/index.html's status pill holds only whitespace, which the sheet's :empty does not hide`;
- step 5's compare prints anything beyond commit 4's nine lines;
- the prover reports either new mutation unreached or green.
