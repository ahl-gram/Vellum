# Issue #913 plan: Today's status line is marked as the kit's live pill and keeps its words

- **Planned at:** `origin/main` 029b0557b461587da0fae12bba05b75289be9ed5, Issue #913 comment count 2 (comment 6258694450, and the ruling post 6263125539).
- **Rulings:** https://github.com/ahl-gram/Vellum/issues/913#issuecomment-6263125539 (Alex, 2026-10-19). D1 = B, "mark the line, keep its words": the line becomes a live region, its words stay in the page, nothing on screen changes, a failed draw is heard, and "Drafting today's world" is NOT heard on load; this supersedes comment 6258694450 on that point. D2 = "Nothing more, as on the Explorer": on success the line clears and nothing new is said.
- **Open decisions:** none.
- **Branch:** `fix/913-today-live-status`.
- **Revision:** third draft. The second draft built option A (a blank starting line written by the script, a one-frame wait, a new `app-draft.ts`); the ruling retired all of it, and none of it survives here.

## What is wrong, measured

- Today's built page (`npm test` writes it to `out/test-astro-build/seed-of-the-day/index.html`; the planner's copy at 7b053755 is `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/913-before.html`) holds `<p class="status" id="status">Drafting today's world&hellip;</p>`: no `role`, no `aria-live`. `src/site/seed-of-the-day/app.ts` sets that line to `""` on success (line 99) and to `"The cartographer spilled the ink: " + errorText(err)` on failure (line 104). Neither change is announced, so a failed draw is never heard.
- The kit's pill CAN open on words: `src/layouts/StageNotices.astro` renders its `pill` slot inside the live `<p>`, and the Specimen Book already fills it (`<Fragment slot="pill">the status pill, as a room reports a draw</Fragment>` in `src/pages/specimen/index.astro`).
- Measured on a throwaway, uncommitted edit of this tree's `index.astro` (since restored; `git status` shows only the untracked plan), built through `test/site/astro-scaffold.test.ts`: the B form builds to `<p class="status" id="status" role="status" aria-live="polite">Drafting today's world&hellip;</p>`, entity kept as authored. Its stage against the before page, through `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/913-stage-diff.ts`: one line gone, one added (the same line with the two attributes), `stage lines: 10 before, 10 after`, `outside the stage: identical`. The spike's page is kept at `/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/913-after-spike.html`.
- With the page changed and the test not, the notices test reds on `seed-of-the-day/index.html carries no live status pill`: the guard Issue #827 left refuses exactly this change until Today's entry names its pill.
- No stylesheet selects on `role` or `aria-live` except `.legend.lean > p:not(:has(select), [role="status"])` in `src/styles/shared/atelier.css`, which reaches a legend row's children and not the stage (`grep -rn -e 'role=' -e 'aria-live' src/styles`). So the two attributes change nothing a reader sees.

## Specs

- `handbook/specs/ui-design.md`, The voice ("A waiting frame says 'Drafting…'": Today's words, "Drafting today's world…", are kept) and Print (the stage's message boxes print as nothing: unchanged, the same class).
- `handbook/specs/site-architecture.md`, What the build does to authored markup (literal markup passes through as written; pin rendered shapes after collapsing whitespace and decoding, never bytes).
- `handbook/specs/check-placement.md`, The unit suite (a built page read as DATA, which is what the notices test does).
- `handbook/specs/conventions.md`, the comment rules (the one comment this edits stays one line).
- `handbook/specs/settle-doctrine.md` is NOT owed: no e2e wait or probe is written.

## The design

1. **Today wears the kit's pill, and the pill opens on Today's own words.** In `src/pages/seed-of-the-day/index.astro` the hand-written `<p class="status" id="status">Drafting today's world&hellip;</p>` goes, and the `<StageNotices>` the page already wears takes `pillId="status"` and a `pill` slot holding `Drafting today's world&hellip;`, the Specimen's form. The built line is the old line with `role="status" aria-live="polite"` added, in the same place, with the same words.
2. **`app.ts` is not touched.** It already writes the failure into `#status` and clears it on success; the region now announces the failure, and a clear is not announced, which is D2's "nothing more".
3. **The pin is the existing notices test, plus one class-wide check.** Today's `NOTICES` entry names its pill and the exact words it opens on, so Today's stage must carry the kit's live pill, `role` and `aria-live` both, straight after the sheet, holding "Drafting today's world&hellip;". The words are pinned because they are not only copy: `drawn` in `e2e/suites/stage/stage.ts` (line 129) reads a line that does not end in "…" as a drawn page, so an emptied pill would make that wait pass on its first read, and the sheet hides an empty pill, which would change the first paint and the scripts-off view. The `follows` special case, which existed only for Today's hand-written line, goes. A new test beside it refuses, on every page, a status line named by id that is not live, which is the bug's class rather than Today's instance.

### Rejected

- **The two attributes typed onto the hand-written line.** It builds the same markup, but leaves Today the one stage outside the kit's shape that the notices test describes, and keeps `follows` alive for it. Issue #827 kept Today out of the kit only because the kit's pill is live, which Alex has now ruled for.
- **`aria-live="polite"` alone, as `#hunt-status` carries.** The stage's pill on every other room carries `role="status"` as well, and MDN advises the pair for compatibility; `#hunt-status` is a slip's line and is not touched.
- **Leaving the opening words unpinned** (this plan's previous draft). The cold read showed an empty live pill, `<StageNotices pillId="status">` with no slot, passes the shape's `[^<]*` and the whitespace check, while `stage`'s `drawn` signal depends on the ellipsis.
- **Pinning every pill's opening words.** Only Today's are read by a wait and shown at first paint; the other entries keep `[^<]*`.
- **A browser check reading the line's role.** The unit read of the built page already holds the markup, and the e2e tree is still being split by Issue #814.
- **Everything option A needed** (a blank starting line, the script writing the first text, the one-frame wait, the hidden-tab branch, `app-draft.ts`, `test/site/today-draft.test.ts`): retired by the ruling.

## Files

| file | change |
|---|---|
| `handbook/plans/913/913-plan.md` | created: this plan, copied unchanged from the scratchpad, in the first commit |
| `test/site/astro-scaffold.test.ts` | edited: the `Notices` type, the doc comment above `NOTICES`, Today's `NOTICES` entry, two terms of `noticesShape`, the notices test's title, and one new test of 8 lines after it. Net about plus 8 lines. Its `/* eslint-disable max-lines */` on line 1 is the accepted skip of Issue #654 comment 5850862909, so it is not split here; Issue #814 pull request 8 owns its two long callbacks (near lines 808 and 917), which this edit does not touch |
| `src/pages/seed-of-the-day/index.astro` | edited: lines 33 and 34 |

Nothing else changes: no file under `src/site/`, `e2e/`, `src/styles/` or `scripts/`, no `eslint-suppressions.json`, no `LIST_AT_REFORMAT`.

### `test/site/astro-scaffold.test.ts` (lines as at 029b0557)

- Line 1037: `type Notices = { pill?: string; warning?: string; noscript?: true; follows?: string };` becomes `type Notices = { pill?: string; opens?: string; warning?: string; noscript?: true };`.
- Line 1038, the doc comment: `/** Every stage's notices by page, LITERAL; Today's pill is its own (no live region, a first line of its own), so Today's notice follows that pill where every other room's follows the sheet. */` becomes `/** Every stage's notices by page, LITERAL, a pill's opening words included where the page writes them (Issue #913). */`.
- Line 1040: `"seed-of-the-day/index.html": { noscript: true, follows: "</p>" },` becomes `"seed-of-the-day/index.html": { pill: "status", opens: "Drafting today's world&hellip;", noscript: true },`. The entity stays as written: `decode` (line 21) turns only `&#39;`, `&quot;`, `&lt;`, `&gt;` and `&amp;`, so the tightened stage still reads `&hellip;`. Every other entry is unchanged.
- In `noticesShape`, `literal(n.follows ?? "</div>") +` becomes `literal("</div>") +`, and in the pill term `[^<]*</p>` becomes `${n.opens === undefined ? "[^<]*" : literal(n.opens)}</p>`, so line 1052 reads `(n.pill ? `${literal(`<p class="status" id="${n.pill}" role="status" aria-live="polite">`)}${n.opens === undefined ? "[^<]*" : literal(n.opens)}</p>` : "") +`. Every other term is unchanged.
- The notices test's title becomes `every stage's notices stand in the kit's one shape, last in the stage: the live status pill, on the words its entry names and never on whitespace alone, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827, Issue #913)`. Its body is unchanged.
- After the notices test (which ends at line 1078) and before `the chart folio names the world once on every chart room (Issue #827)`, a new test, exactly:

```ts
test("no page names a status line that is not live, so a line its script writes is one a screen reader hears (Issue #913)", () => {
  for (const p of PAGES)
    assert.doesNotMatch(
      page(p.route),
      /<p class="status" id="[^"]*"(?! role="status" aria-live="polite")/,
      `${p.route} carries a status line by id that is not live`,
    );
});
```

### `src/pages/seed-of-the-day/index.astro` (lines as at 029b0557)

Lines 33 and 34,

```
  <p class="status" id="status">Drafting today's world&hellip;</p>
  <StageNotices>
```

become

```
  <StageNotices pillId="status">
    <Fragment slot="pill">Drafting today's world&hellip;</Fragment>
```

The `noscript` fragment and `</StageNotices>` after them are unchanged. The words are written as literal markup, `&hellip;` included, never through an expression, so the build passes them through as written (measured above).

## Tests, in the order they are written

`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/913-shape-probe.ts` mirrors the test's `decode`, `tight`, `literal`, `FILLED_P` and the planned Today shape and class check. On the saved pages it prints: before, shape FAILS and a not-live status line present; the spike, shape MATCHES and none; the spike with its `pill` slot emptied, shape FAILS; the spike with its ellipsis dropped, shape FAILS; and over the spike's whole built tree (12 pages), no not-live status line anywhere.

1. **`test/site/astro-scaffold.test.ts`, the notices test (retitled above).** Assertion: `noticesShape` on Today's tightened stage now demands `</div><p class="status" id="status" role="status" aria-live="polite">Drafting today's world&hellip;</p>`, then the scripts-off notice, then `</div>`. The stub is the unchanged page: red at commit 1 on the message `seed-of-the-day/index.html's notices, as the kit renders them`. Mutations once green, each in `src/pages/seed-of-the-day/index.astro`: (a) drop `pillId="status"` (the slotted words then render nowhere); (b) restore the hand-written line before a bare `<StageNotices>`; (c) restore the hand-written line with `aria-live="polite"` and no `role`; (d) drop the `<Fragment slot="pill">` line, keeping `pillId`; (e) drop `&hellip;` from the slotted words. Each reds this test. Owed to `vellum-guard-prover`.
2. **`test/site/astro-scaffold.test.ts`, the new test `no page names a status line that is not live, so a line its script writes is one a screen reader hears (Issue #913)`.** Assertion: no built page in `PAGES` carries `<p class="status" id="…"` not followed by ` role="status" aria-live="polite"`. Red at commit 1 on the message `seed-of-the-day/index.html carries a status line by id that is not live`, and on no other page (the probe's built-tree sweep). Mutations once green: (b) and (c) above red it too; (f) add `<p class="status" id="probe">probe</p>` as a new line straight after the `>` that closes `<BaseLayout` (line 22) in `src/pages/faq/index.astro`, a page with no `NOTICES` entry, which only this test reds. Owed to `vellum-guard-prover`.

**Blind spot, declared, erring toward passing:** both tests read built markup, so a hand-written `<p class="status" id="status" role="status" aria-live="polite">Drafting today's world&hellip;</p>` in the kit's place passes them. The rule they hold is the markup a screen reader meets, which that line would also satisfy; which file writes it is review's. The class check also passes a not-live status line that carries no `id` or whose `class` is not exactly `status`; every script-written status line in the site today has both (the probe's sweep).

## Order of commits

1. `#913 Today's status line is pinned as the kit's live pill, on its own words (red)`: `handbook/plans/913/913-plan.md` and the `test/site/astro-scaffold.test.ts` edit. `npm test` reds on the two messages above and nowhere else. Push.
2. `#913 Today's status line becomes a live region and keeps its words, so a failed draw is heard`: `src/pages/seed-of-the-day/index.astro`. Everything green.

## Rosters and doctrine

- Joins no roster: no new file outside `handbook/plans/913/`; `test-support/source-read-list.ts` is untouched (the test already reads the built page as DATA); `eslint-suppressions.json` counts do not move (the new test's callback is 6 lines; the file keeps `max-lines-per-function` 2).
- Contradicts no spec line: `grep -rn -i -e drafting -e "live region" -e aria-live -e spilled handbook/specs` finds only ui-design's "A waiting frame says 'Drafting…'", which still holds; `grep -rn -i -e 'own pill' -e "today's pill" handbook/specs .claude src test e2e` finds only the `NOTICES` doc comment, replaced above. `src/layouts/StageNotices.astro`'s header ("the page passes the ids its script reads and writes its own sentences") holds for Today as written. `handbook/plans/827/` is an archive and is not edited.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- The built page against today's: at commit 1 (the page unchanged) `npm test` builds it; copy `<worktree>/out/test-astro-build/seed-of-the-day/index.html` to the scratchpad as `913-before-c1.html`. At commit 2, after `npm test` builds again, run `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/ba8567e8-b9e3-420d-a848-2acc4792df03/scratchpad/913-stage-diff.ts <scratchpad>/913-before-c1.html <worktree>/out/test-astro-build/seed-of-the-day/index.html`. Expected, exactly: `- <p class="status" id="status">Drafting today's world&hellip;</p>`, `+ <p class="status" id="status" role="status" aria-live="polite">Drafting today's world&hellip;</p>`, `stage lines: 10 before, 10 after; 1 gone, 1 added`, `outside the stage: identical`. Paste it in the PR body, worded as: the page's lines are the same, whitespace aside, but for the two attributes on the status line, and no stylesheet selects those attributes, so nothing a reader sees changes, scripts on or off. The diff compares lines as a set, so the line's PLACE is credited to the notices test, not to the diff.
- e2e, the three suites that read Today's `#status`: `npm run build`, then `VELLUM_E2E_SUITES=runninghead,cluster,stage npm run test:e2e`. `runninghead` reads the pill's computed styles and the stage's children on Today (`KIT_READ` in `e2e/suites/runninghead/room.ts`); `cluster` rests on an empty `#status` (`RESTING` in `e2e/suites/cluster/chart.ts`, reached on Today by `at5Spacing`); `stage` reads the line's text as its `drawn` signal (`e2e/suites/stage/stage.ts`). Their waits are unchanged: the line holds its words from the page's first parse until the draw clears it, exactly as before. Never the full lanes.
- `vellum-plate-reader` is NOT owed: nothing a reader sees changes, and the stage diff with the stylesheet grep is the measurement.
- What a screen reader speaks is UNVERIFIABLE in this harness. The PR body says so in that word, says as the ruling does that "Drafting today's world" is not announced on load, and scopes "a failed draw is heard" to a failure inside the draw `app.ts` defers (its `setTimeout` block): a throw in the page's setup before it, or a bundle that never loads, leaves "Drafting today's world…" standing and unannounced, as it did before this change.

## Calls made

1. **The line is marked by wearing the kit's pill with Today's words in its `pill` slot**, not by typing the attributes onto the old line. Rule: Issue #827's one shape for every stage's notices, the Specimen's precedent for a pill that opens on words, and Issue #827's only reason for Today's exception (the kit's pill is live) is now ruled for. The brief's premise that the kit's pill must open empty does not hold: its slot carries words, measured above.
2. **Both `role="status"` and `aria-live="polite"`.** Rule: the kit's pill and the Explorer's carry both, and MDN advises the pair; `#hunt-status` is untouched.
3. **`app.ts` is not touched.** Rule: under the ruling it already does what is wanted (the failure write is now heard, the clear is silent); touch only what the issue needs.
4. **The pin is Today's `NOTICES` entry naming its pill AND its opening words, with `follows` removed, plus a class-wide check that no page names a status line that is not live.** Rule: a guard covers the bug's whole class (CLAUDE.md); the words are pinned because `stage`'s `drawn` signal and the first paint and scripts-off view rest on them; the other entries keep `[^<]*`, since no wait reads their opening words.
5. **e2e: `runninghead`, `cluster` and `stage` only, and no new browser check.** Rule: they are the suites that read Today's `#status`; the markup is held by the unit read.
6. **No `vellum-plate-reader`; `vellum-guard-prover` owed on both tests.** Rule: workflow step 11, plate reader for an appearance (none changes), prover for every new or strengthened guard.

## Stop conditions (hand back, do not adapt)

- `git diff --stat 029b0557b461587da0fae12bba05b75289be9ed5 origin/main -- src/pages/seed-of-the-day/index.astro src/pages/faq/index.astro src/layouts/StageNotices.astro test/site/astro-scaffold.test.ts src/styles src/site/seed-of-the-day/app.ts` prints anything.
- At commit 1, `npm test` reds anywhere other than the two tests named, or either reds on a message other than the one named for it.
- The stage diff prints anything but the four expected lines.
- `grep -rn -e 'role=' -e 'aria-live' src/styles` prints a line other than the `.legend.lean > p:not(:has(select), [role="status"])` one.
- `runninghead`, `cluster` or `stage` reds.

