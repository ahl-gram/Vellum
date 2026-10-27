# Issue #638 plan: the head cluster and the room's right-hand corner never share ink

Sub 3 of the Wayfinding epic (Issue #667), built on main at 7f2a71e with Issue #668's trail in place.
This is the plan as step 6 left it: written and cold-read before the rulings, with Alex's rulings
of 2026-10-03 (issuecomment-5973715094 on Issue #638) folded in at the top. Every figure comes from
the implementing lane's `out/638/` (a gitignored working directory, copied to the main checkout's
`out/638/`): `638-sweep.ts` (the probe), its JSON per arm, `summarise.ts` and `638-fit.ts`, measured
on the implementing Mac on 2026-10-03.

## Rulings (Alex, 2026-10-03), and what they settle in the plan below

1. **The site motto steps aside below 720px** in every room and keeps its line empty (the plan's
   "Keep below 720"). Home keeps its motto. Tablets at 720 and up keep it; 390 changes. The 720 edge
   is a provisional feel call for Issue #736. The shell rule is
   `@media (max-width: 720px) { body.room header.chrome .tagline { visibility: hidden; } }`, which
   joins the layout's existing 720 block. The sweep already reads both sides of 720 (the cluster's
   type steps there too), and from 721 to 900 the motto is today's: the control read every page
   clear at 721 by 295px or more, and the step 6 tablet still at 768 showed this arm identical to
   today's.
2. **"Clear" means not touching** for this fix. The 8 to 9px top line ("Vellum" beside the two
   longest room names) is filed as its own issue.
3. **The wordmark steps down to 1.3rem at 340px and below in every room**, one shared rule in the
   shell, deleted from `public/index.css`.
4. **The Ribbon's and the Print Room's wide corners widen from 1024px** instead of 901px.
5. **Issue #454 sitting rulings 3 and 17 are replaced.** Ruling 17's row in `handbook/errata/site.md`
   is deleted; ruling 3 has none.
6. **`handbook/specs/ui-design.md` keeps its 320 line with one exception**: the two corners never
   overlap at any width from 320 up, held by the new check.
7. **This fix goes before Issue #672**; the Gallery skip fails the day Issue #672 lands.
8. **The check's running time is accepted.**

The lane's own calls stand. The menu questions the sections below refer to are answered by the list
above, and where a section says "the ruled arm" or "the ruled edge" it means items 1 and 4.

## What is ruled, and what this plan must deliver

- **Ruled (Alex, 2026-09-22, recorded on Issue #638 at 2026-09-23T02:34):** the crowding between the
  head cluster and the room folio is a defect to FIX across the whole range it reaches, 320 included.
  It is not a squeeze to record.
- **The class**, per that comment, has one mechanism: the cluster is left-anchored and the room
  folio right-anchored in the same band, each is sized by its content, and nothing makes one yield.
- **What the fix owes**, per the same comment:
  - every page in the class, and the rule that stops the next room-folio line reopening it;
  - candidates rendered as stills, with today's overlap as the control (workflow step 6);
  - a guard that is a SWEEP comparing INK, with its blind spots named and their directions argued;
  - a sweep run with Issue #668's trail in place, since this sub lands after it.
- **Issue #736's body:** this sub's pull request adds its provisional feel calls to that docket in a
  comment.

## Recon and the plan skeptic: what they changed

Recon returned 11 STALE, 5 UNVERIFIABLE and 15 CURRENT (`out/638/638-recon-ledger.md`). The ruled
core holds. The plan skeptic checked 42 of the plan's claims and 38 held. Its 12 findings are all
folded in below; the findings section at the end says how each was handled. What changed the plan:

- **Two earlier rulings accepted this squeeze, and this fix reverses both.** Both come from the
  Issue #454 sitting of 2026-09-03.
  - Ruling 3 (issuecomment-5530746858): "The two-line dateline under the site tagline at 320 stays.
    Accepted as a known squeeze below the ruled phone width."
  - Ruling 17 (issuecomment-5531575169): "The site tagline against the corner's control row at
    320 ... accepted at 320, a known squeeze beside ruling 3's."
  - Ruling 17 also stands as the PR #500 row under "Ruled and left" in `handbook/errata/site.md`.
    Ruling 3 has no row.
  - Alex's 2026-09-22 ruling reverses both. The menu asks him to confirm it does, naming both.
- **`handbook/specs/ui-design.md` contradicts the ruling.** It still says "320 is checked, and its
  squeezes are accepted and recorded rather than designed for". How that line changes is a menu
  question.
- **The words that collide are the SITE tagline,** `.tagline` in `header.chrome`, from
  `SITE_TAGLINE`. The room's own `.room-tagline` is already `display: none` at 900 and below.
  `RoomFolio`'s root carries the class `chrome` too, so every selector this plan writes says
  `header.chrome`.
- **`test/site/shell-drawer-css.test.ts` gives a false reason.** It keeps home's cap home-only because
  "on a room with no panel it would wrap the tagline for nothing". That message is amended whichever
  arm is ruled.

## What measuring found that the issue does not have

The probe sweeps every built page from 480 down to 320, resizing the loaded page one pixel at a time
under phone emulation and reduced motion. Each width is read once two frame reads agree. INK means
every visible text node's line boxes plus each control's own rect. A collision is a horizontal
overlap with at least 2px of vertical overlap.

The probe reproduces the ruled table exactly, which is its control: Explorer 52.7 at 320 with its
top edge at 372, Prospect 58.3 at 378, Reading Room 50.7 at 370, Glossary 44.5 at 364, Q & A 10.0
at 329, Ribbon 4.4 at 324, Specimen 61.3 at 381.

1. **The Seed of the Day reaches 387, and its worst date is the one whose line fills the corner, not
   the one with the longest words.** Over every date from 2026 through 2035, "Monday, 6 July 2026 ·
   seed 20260706" sets the widest first line, 199.0px against the corner's 200. It overlaps by 67.5
   at 320, up to 387, and clears at 390 by 2.5px. The ruled figure, 386, came from "Wednesday, 23
   September".
2. **The class has a second band just above the 900 fold, on main today.**
   - Above 900 the cluster's widest row is the nav's top line, and two rooms widen their corners at
     `(min-width: 901px)`: the Ribbon to 30rem, the Print Room to 25rem.
   - The nav's last door, "Glossary", runs 57.0px under the Ribbon's "setting out from" at 901 and
     overlaps up to 972. It runs 34.8px under the Print Room's seed box at 901 and overlaps up to 935.
   - The Prospect's 22rem corner clears by 69.1, the figure the epic quotes.
   - Every other page is clear from 901 to 1280, where separation never shrinks as the width grows.
3. **During a sweep, a `vw` length is not recomputed unless the browser gets more than a frame per
   width.**
   - Home caps its cluster at `calc(100vw - 15rem)` below 900.
   - With one frame per width, the read never showed that cap at all, from 396 down to 320. The
     cluster bottom stayed at 83.6, the uncapped layout from load, and only the 340 media rule took
     effect, giving 79.9. Settled, it reads 99.6 to 111.9.
   - A synchronous read is the same.
   - Every room, which has no `vw` length in either corner, read identically however it was read.
   - A stale read can therefore hide a whole range, not shift it by a pixel. The mechanism is
     inferred, not proved.
4. **The Gallery lays out wider than the viewport below 346** (Issue #672: `innerWidth` 347 at a set
   320, over 26 widths). `scrollWidth > innerWidth` cannot see it; `innerWidth !== set` can.

## The candidates (the appearance decision, step 6)

Each arm was injected as a stylesheet after load and swept from 320 to 480 by 1px, with the
worst-date dateline. "Nearest" is the smallest gap between any cluster ink and any corner ink over
that range. A negative figure is a line-box overlap that the ruled 2px vertical tolerance lets pass.

| arm (phone band) | collisions | nearest, and where | cluster bottom 320 / 390 | 390 frame |
|---|---|---|---|---|
| control (today) | 8 pages | Seed of the Day overlaps 67.5 at 320 | 108.4 / 108.4 | as ruled |
| W alone: the wordmark steps to 1.3rem at 340 in every room | 7 pages | clears only the Ribbon (4.9 at 320) | 104.7 / 108.4 | as ruled |
| **Keep, below 900:** the motto stands aside in a room and keeps its line, plus W | 0 | 8.1 (Ribbon wordmark and room name, 320); 14.1 (Prospect trail and year box, 340) | 104.7 / 108.4 | motto gone |
| Keep below 720, plus W | 0 | as Keep below 900, up to 480 | 104.7 / 108.4 | motto gone |
| Keep below 389, plus W | 0 | 2.5, Seed of the Day at 390: motto and dateline on one row | 104.7 / 108.4 | as ruled |
| **Wrap:** the motto's measure capped to what the corner's 12.5rem leaves (home's way), plus W | 0 | 8.1, Ribbon at 320 | 136.7 / 124.4 | motto on two lines |
| Close up: the motto removed and the rows below it rise, plus W | 0 by the ruled instrument | -0.4 to -1.9: the trail rides under the Explorer's, Reading Room's, Glossary's and Prospect's controls | 88.7 / 92.4 | motto gone |

What the table says:

- **Close up is rejected on measurement.** It moves the collision onto the trail, whose line boxes
  touch the corner's controls from 320 to 340. It passes only through the 2px tolerance.
- **Wrap clears every page, at three costs.**
  - It changes the 390 frame: the motto sets on two lines at 375 and 390, three at 320.
  - Everything under the cluster moves down 16px (28.3 at 320). At 844 tall the chart keeps its
    size and sits 8px lower (14.15 at 320), measured by `vellum-plate-reader` at step 6; the
    phone fit reserves the chart's top from the cluster's bottom (`fitRoom` in
    `src/site/shared/room.ts`). A shorter phone was not measured.
  - On the document rooms the trail ends 0.4px inside the 7.8rem band at 375 and 390, and at 320
    it runs 11.9px past the band onto the sheet, so Wrap also owes a taller band.
- **Keep clears every page with the cluster's box unchanged**, so no chart refits and the trail's
  tap clearance stands.
  - Below 900 matches the fold where the room folio already stands its own tagline aside.
  - It also hides the motto from 390 to 900, where nothing collides.
  - Below 389 keeps every frame Alex has ruled at 390. But at 390 the worst-date dateline then stands
    2.5px from the motto on the same row, so the two read as one line.

**Rendered at step 6** by `vellum-plate-reader` over a spike (`?arm=` on any page), 144 shots, all
settled, every control row reproducing the table above: Keep below 389 at 390 equals the control
(empty DOM diff, zero head pixel difference, on all six pages); Keep below 720 at 768 equals the
control; Keep keeps the cluster's box, so nothing under it moves and the chart does not refit. One
thing no arm changes: on the two longest room names the top row stands 8.0 to 9.0px from the
wordmark at every phone width (Seed of the Day 8.0 and Ribbon 8.1 at 320 under every passing arm;
the Ribbon 9.0 at 390 in today's ruled frame), so "Vellum The Wayfarer's Ribbon" can read as one
line. It is clear by the instrument and is today's 390 look. Whether it counts as clear is menu
question 2.

**The fold band (901 to 972).** Arm F scopes the Ribbon's and the Print Room's widening to
`(min-width: 1024px)`. Between the fold and 1023, those two corners take the kit's standard 19rem and
wrap their controls onto more lines.

- It clears both rooms: nearest 61.3 on the Print Room, and 51.5 on the Ribbon at 1024, where its
  30rem returns.
- On the Ribbon from 901 to 1023 the corner grows 20px taller (bottom 189.0 against 169.0). The
  chart keeps its size (445.6 x 311.1 at 901x800, fresh load) and sits 10px lower. The slip seats
  20px lower.
- The Print Room's corner and sheet are unchanged.

**Rejected on arithmetic, not rendered:**

- **Shrinking both corners' type.** The Specimen's and Seed of the Day's datelines start at x 106 to
  111 at 320, so the motto would have to end by about x 100.
- **Pushing the corner's lower line below the motto.** It lands on the trail.

## The plan, whichever arms are ruled

### Files

- **`src/layouts/BaseLayout.astro`**, in the shell's global block:
  - The ruled phone arm, written `body.room header.chrome .tagline`, so every room inherits it
    (Gate 3 item 2) and home keeps its motto.
  - The 340 wordmark step, written `header.chrome .wordmark`. It has specificity (0,2,1) against the
    layout's narrow `.wordmark` (0,1,0), and the inline block renders after the page sheet.
- **`public/index.css`:** home's `@media (max-width: 340px) { .chrome .wordmark ... }` is removed,
  because the shell carries it now. This is the second-use lift ("the kit is lifted at second use"),
  and it keeps one home for the rule.
- **`public/ribbon/index.css` and `public/print-room/index.css`:** the corner widening moves from
  `(min-width: 901px)` to the ruled edge. The Print Room's comment at that line is rewritten.
- **`src/world/seed-of-the-day.ts`:** a new `datelineFor(date)` beside `seedForDate`.
  `src/site/seed-of-the-day/app.ts` uses it, and `test/world/seed-of-the-day.test.ts` pins its
  output. The guard imports this same function in the page (the harness serves engine modules
  under `/explorer/engine/`), so a format change that lengthens the dateline reaches the guard.
- **`e2e/suites/corners.ts`** (new), with the rosters a new suite joins:
  - `E2E_SUITE_ORDER` (`e2e/support/suites.ts`)
  - `SUITES` (`e2e/run.ts`)
  - `E2E_LANES` (`e2e/support/lanes.ts`)
  - `MEASURED_SECONDS` (`test/e2e/lanes.test.ts`)
  - `STEPPED_GROUPS` (`test/repo/e2e-tiers.test.ts`)
- **`.github/workflows/ci.yml`:** the e2e job's `timeout-minutes` comment is re-measured against the
  new lane A.
- **`test/site/shell-drawer-css.test.ts` and `test/site/home-cluster.test.ts`:** the pins move with
  the rules, and the false message is amended.
- **`handbook/specs/ui-design.md`, `handbook/errata/site.md`, and
  `handbook/plans/638/638-plan.md`** (this plan, archived at the first commit).

### Tests, each with the mutation that reds it

1. **`CO1`, the sweep: the guard this issue asks for** (`e2e/suites/corners.ts`). It runs one step per
   page, so a page that never settles fails by name and the other pages still run.
   - **Pages.** Every route under `src/pages/`, since the tree is the roster, so a new page joins by
     existing. A literal floor of the twelve stands beside the derivation, so an empty walk cannot
     pass. The generated atlas lives outside `src/pages/` and carries no cluster.
   - **Two fresh loads per page**, split at 900, the only width `matchMedia` listens to (every
     `NARROW` in `src/site` is `(max-width: 900px)`). No read ever comes after the page crossed the
     fold while loaded.
     - Load at 900 and narrow to 320: one pixel at a time from 480 to 320, plus the stretch from 481
       to 900.
     - Load at 1280 and narrow to 901.
   - **Widths above 480.** Each stretch is read at both sides of every width media edge in the
     page's own CSSOM (from `document.styleSheets`, the layout's inline block included), plus a
     32px stride. Between two adjacent reads, every cluster ink box must be identical and every
     corner ink box translated by exactly the width step. Where that fails, a wrap or a `vw` length
     changed, and every pixel between them is read.
   - **Ready to read at a width:**
     - `innerWidth` equals the width set;
     - a `100vw` sentinel the check injects measures exactly the width set, which proves `vw` was
       recomputed (finding 3 above);
     - two frame reads agree. A width that never settles throws inside its page's step.
   - **The Gallery.** Below 346 the check asserts that `innerWidth !== set` there and skips the
     ink comparison, so the skip reds the day Issue #672 lands.
   - **Ink present.** The cluster has at least two inked items and the corner at least one, so a
     selector that misses cannot pass empty.
   - **The assertion.** No box of cluster ink intersects a box of corner ink at all. This is
     stricter than the ruled instrument's 2px vertical tolerance, which buys nothing under any
     passing arm (nearest 8.1) and is exactly what let the close-up arm through. It cannot tell a
     2.5px run-on from a 40px gap. If Alex rules that "clear" means the two corners do not read as
     one line (menu question 2), the check also holds every pair that shares a row to a minimum gap,
     and that number is his.
   - **The Seed of the Day.** The dateline is first set to the one, from 2026 through 2125, whose
     widest laid-out line is widest, using `datelineFor` itself. A century covers every two-digit
     year and every 29 February weekday. The page has no date override, and a sweep on a short date
     errs toward passing.
   - **The band.** On a room with a band, the band covers the cluster at every width. Today DR1 and
     DR14 read it only at 390.
   - **Mutations, to be run by `vellum-guard-prover` at step 11:**
     - revert the shell's motto rule: reds on the seven tagline pages;
     - delete the 340 step: reds on the Ribbon from 320 to 324;
     - put the Ribbon's widening back to `(min-width: 901px)`: reds at 901;
     - unscope the Print Room's 25rem corner so it applies below 900 too. This is the incident its
       own comment records, and the way a room's sheet really reopens the class;
     - restore the 2px vertical tolerance and inject the close-up arm: reds only without the
       tolerance;
     - drop the `vw` sentinel and inject Wrap: shows whether the settle alone is enough.
   - **Same-run controls** (Gate 2 item 9):
     - At 320 on the Explorer, a style restoring the motto (`visibility: visible`, `display: block`,
       `max-width: none`, each `!important`) must report an overlap of at least 40px. The style is
       then removed.
     - Home is known clear by its own Issue #480 fix.
   - **Blind spots, each with its direction:**
     - A line box carries the font's ascent and descent, so ink is generous and the check errs
       toward reporting.
     - Text set by a pseudo-element, a text decoration below the line box, a focus ring and a
       box-shadow are not read, so the check errs toward passing. None stands in either corner at
       rest today: grep each corner's selectors for `content:` carrying a string.
     - The Gallery below 346 is read at the wider layout Issue #672 forces, erring toward passing
       there.
     - The height stays at 844 under phone emulation and 800 above the fold, so no height edge is
       read. The only height query, `(max-height: 640px)` on the chart-drawer tabs, is in neither
       corner. This errs toward passing.
     - Between two adjacent reads above 480 that pass the affine test, the layout is assumed to stay
       affine. That holds wherever line breaks and `vw` lengths change monotonically with width,
       which CSS layout does outside a media edge, and every edge is read.
2. **Unit pins**, correctness only.
   - In `test/site/shell-drawer-css.test.ts`: the motto rule sits in the shell's global block, scoped
     to `body.room header.chrome`, so home keeps its motto. Mutations: delete it; widen the scope to
     `.chrome`. The media edge itself is a provisional feel call, and the sweep holds it until the
     post-use review, per conventions ("let dressing-level pins lag one live-use cycle").
   - In `test/site/home-cluster.test.ts`: the 340 step now lives in the shell, and `public/index.css`
     no longer carries it. Mutations: delete the shell copy; restore home's copy.
   - In `test/world/seed-of-the-day.test.ts`: `datelineFor`'s output for a fixed date. Mutation:
     change its options.
3. **Kept beside the sweep, never swapped for it:** CL3 and CL6 (`e2e/suites/cluster.ts`), and DR1,
   DR11, DR14, DR15 and DR17 (`e2e/suites/room-drawer.ts`).

### Where the guard runs, and what it costs

- **Measured:** the probe took 97.5s on this Mac for twelve pages from 320 to 480, with a 2.5s blind
  wait per page, about 67s of it resizing at two to three frames a width. The stretch above 480 and
  the second load add about 60 reads and one load per page.
- **Estimate:** about 100s locally, which the pull request replaces with the measured figure.
- **Lane choice.** `MEASURED_SECONDS` puts lane B at 327.0s of 593.4, with 72.6s of headroom under
  the 0.6 cap, so the guard cannot join `room-drawer`. It goes in a suite of its own, `corners`,
  appended to lane A (266.4s, with 224.1s of headroom). The suite boots each page through
  `about:blank` and resets emulation and media in a `finally` (settle doctrine clause 14).
- **CI cost.** Lane A's e2e step took 9m06s on main run 37145378928. At the table's 2.0x factor for
  lane A, about 100s locally is about 200s more, so the step comes to about 12.5 minutes against
  `timeout-minutes: 20`. Lane A becomes the longer lane, so every pull request's checks finish about
  three minutes later than today. The `ci.yml` comment ("about twice the worst real one") is
  re-measured in the pull request.

### Doctrine that moves with it

- **`handbook/specs/ui-design.md`, the 390 line:** carved out or rewritten, as ruled.
- **`handbook/specs/ui-design.md`, the head cluster's composition line:** what the cluster carries in
  a room on a phone under the ruled arm, and the 340 step, marked provisional.
- **`handbook/specs/ui-design.md`, the room folio line:** a room widens its corner only where it fits
  beside the nav's top line.
- **`handbook/errata/site.md`:** the ruling-17 row is deleted.
- **`.claude/skills/vellum-footguns/references/held-lines.md`:** two rows, the `vw` trap and the
  worst-date fixture. Each is a typing-moment trap without its own incident number, so neither
  earns a gate line yet.
- **Issue #736:** a comment adding this sub's provisional calls.
- **Issue #638:** one dated comment with the relayed rulings and every call below, before the pull
  request opens.

### Evidence

- **The sweep before and after,** every page, as a table in a pull request comment with the harness
  that produced it. Today's build is the control.
- **The ruling's own check:** `vellum-guard-prover` over `CO1` and the unit pins, and
  `vellum-plate-reader` over the built branch, both at step 11, each recorded in a pull request
  comment.
- **The oracle:** `node scripts/design/oracle.ts` twice on main and once on the branch, then
  `compare.ts`, naming every page whose frame changed at 1280 and at 390.
- **Named commands:** `npm run check`, `npm run lint`, `npm test` (then `npm run astro:generate`),
  and the `corners`, `cluster`, `room-drawer`, `runninghead`, `ribbon`, `print-room` and `hunt` suites,
  run locally one at a time.
- **No regen owed:** no renderer file is touched, and `test/site/hero-charts.test.ts` green is the
  command that says so.

### Calls made without a ruling (relayed for Alex to overrule)

1. **The guard is its own suite in lane A,** from the lane arithmetic above.
2. **The guard asserts no intersection at all,** dropping the 2px vertical tolerance. Every passing
   arm clears by at least 8.1, and the tolerance is what let the close-up arm pass.
3. **The worst-date window is 2026 through 2125**, selected by the widest laid-out line.
4. **`datelineFor` moves into `src/world/seed-of-the-day.ts`** beside `seedForDate` and
   `capitalBlurb`, so that the guard tests the real format rather than a copy.
5. **The squeezed Print Room plate just above the fold** (`#sheet` 0 x 0 at 901, found again by the
   step 6 plate read) is already the PR #737 row in `handbook/errata/site.md`; nothing new is filed.

Everything else this plan would otherwise have decided is a menu question: the motto's form and
width, what "clear" means, the wordmark step, the band above the fold, the two earlier rulings, the
spec line, the Gallery's order against Issue #672, and the check's running time.

## Plan skeptic findings, and what was done with each

1. **BLOCKING. Ruling 3 is a second acceptance.** Folded in: the reversal question names rulings 3
   and 17. Ruling 3 has no errata row to delete.
2. **BLOCKING. Decisions were taken without a menu question.** Folded in: the spec wording, the
   Issue #672 sequencing and the wordmark step are now menu questions. The Recon and Doctrine
   sections agree.
3. **No departure check, and the `vw` trap misread.** Folded in: the `100vw` sentinel is the
   departure proof, and the trap is rewritten from the data. A stale read hides a range rather than
   shifting it by a pixel.
4. **The guard's proof was under-planned.** Folded in: the prover is scheduled at step 11. The Q & A
   mutation is replaced by unscoping the Print Room's corner, and the close-up and sentinel
   mutations are added.
5. **The unit pin fixed a feel call.** Folded in: only the scope is pinned, and the edge is left to
   the sweep.
6. **The Seed of the Day fixture tested a copy.** Folded in: `datelineFor` is exported and imported
   in the page, the selection rule is spelled out, and the window is a century.
7. **Arm F's cost to the Ribbon's chart was unpriced.** Measured and folded in: the chart keeps its
   size and sits 10px lower.
8. **The argument for the widths between edges rested on the wrong mechanism.** Folded in: the
   affine test with fill replaces it. A trail's `<wbr>` wrap with no media edge is caught by it.
9. **The fold-band figures came from another path.** Folded in: each page gets two fresh loads split
   at 900, the only `matchMedia` width.
10. **The CI cost was not priced.** Folded in: priced, and a menu question.
11. **The Gallery skip could outlive its cause.** Folded in: the skip asserts the mismatch, so it
    reds when Issue #672 lands.
12. **Loose ends.** Folded in: the height edges are named as a blind spot, the 390-to-900 cost of
    Keep below 900 is stated in the menu, the false message is amended under every arm, and the
    guard runs one step per page.
