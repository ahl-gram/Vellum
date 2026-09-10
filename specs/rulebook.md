# The Vellum rulebook

**This is the rulebook, not the task list.** It holds the durable sequencing rules, invariants,
working agreements and rationale that a task board has no field for, plus how a design decision gets
made before any of it is scheduled.

It replaces the body of issue #193, which is now a pointer to this file.

Three other places carry what this one deliberately does not:

- **The roadmap Project** ("Vellum Roadmap", `gh project item-list 1 --owner ahl-gram`) is the
  backlog of record: what is open, its status, its phase, its order.
- **`CLAUDE.md`** holds process at the keyboard: feature to branch to PR, Alex merges, test first,
  no em-dashes, measure before you assert, which subagent runs when.
- **`RESUME-HERE.md`** (local, per-session, gitignored) is the hot pointer to where we are right now.

Its sibling `specs/ui-design.md` holds the look and feel itself: the ground, the case, the palette,
the rooms, the voice, motion and ceremony.

## How to read and update this file

**This file is normative and complete.** A reader who reads only this file is correctly informed
about the rules. That property is the whole point, and it is worth what it costs to keep.

**Where this file and `CLAUDE.md` overlap, this file wins**, and the overlap is now small and known:
the #378 comment doctrine is stated in both because it governs writing code, which is `CLAUDE.md`'s
half, as well as reading these rules. The goldens, regens, committed content and re-roll rules are
not stated in `CLAUDE.md` at all, the two copies having drifted apart in five places before the
duplicate went. `CLAUDE.md` keeps process at the keyboard; this file keeps the rules.

**A rule change edits this file**, in a branch and a pull request like any other tracked change. It
may additionally leave a dated comment on the issue the change came from, as an audit trail. It must
never live only in a comment somewhere.

**Why the rulebook is a file and not an issue thread**, recorded so nobody moves it back. Everywhere
else in Vellum the convention is that a body is historical intent and a later comment supersedes it,
which is right for an epic where the original intent is worth preserving beside the ratification that
changed it. It is wrong for a rulebook, where a reader wants the current rules and nothing else. By
2026-08-17 issue #193 carried roughly seventy percent of the rulebook outside the rulebook: the
re-roll flight-exclusion set had been amended four times across three comments, and computing its
current value meant replaying them in order. Two separate sessions read the body, restated a stale
set as current, and each self-labelled "no rule changed". Append-only made a stale rulebook the
default outcome for anyone who did not replay the whole timeline. Inverting the convention on that
one issue fixed it; moving the rulebook into the repo removes the exception entirely, because a file
has no comments to drift into.

**Do not copy volatile state into this file.** Phase names, board membership and issue status belong
to the Project and are read from it. Counts, rosters and file line numbers rot without any guard
noticing, and **nothing in this repo sweeps markdown**, so a wrong claim here is silent. Name a live
issue number only where the number is itself part of a rule. This discipline retired the workspace's
`PROJECTS.md` and the copied phase-option list in `CLAUDE.md`, both of which drifted precisely
because they were convenience copies, and it is why the `roadmap/` directory was deleted rather than
repaired.

## Product direction

**Website and Explorer first** (ratified 2026-07-04). No new CLI-first features; visitors meet
features on the site, and the experience should be more visual. The Print Room epic (#132)
deliberately moved posters, atlas and PDF off the CLI onto dedicated pages, shrinking the CLI to one
`chart` verb, which is the reproducibility covenant's proof.

**New interactive surfaces are DESTINATIONS** (the Print Room, the Reading Room #190), not more
Explorer panels. **One ruled exception** (2026-09-07, the #518 sitting): the Chart Table's drawer
(#401) is an Explorer-side surface, a drawer sliding out from behind a tab on the right edge holding
the gathered sheets. Its destination still complies, since the gathering lands on The Portfolio, a
page of the Print Room (#521). The rule stands for everything else.

## How a design decision is made

Every significant piece of Vellum's look has gone through the same six steps, and skipping to the
middle has hurt the project before.

1. **Mockups, drawn from real content.** Two to four directions, built from real engine output at the
   seed the sitting will look at, never lorem or a sketch.
2. **A sitting.** Alex looks at the rendered stills and rules. The rulings are recorded the same day
   as a dated comment on the issue.
3. **Provisional.** A ruling about how something *feels* is provisional the moment it is made,
   because it was ruled from a picture and has not been used.
4. **Build to the ruled stills**, under the fidelity rule below.
5. **Live use.**
6. **The post-use re-review**, scheduled into the epic as its own sub, which ratifies, amends or
   reverses each provisional ruling.

**Feel decisions are provisional. Contract decisions are not.** Architecture, the address grammar,
determinism and sequencing are ratified once and guarded immediately. Which surface owns a
capability, how a control reads, what a gesture does, where a panel sits: those are hypotheses until
they have been used, and they are where nearly every reversal has landed.

**Do not state a provisional ruling in the same voice as a ratified one.** A pull request
implementing a feel ruling names which of its choices are awaiting the re-review, so they land on the
docket rather than being discovered later. Pin correctness-level tests immediately; let
dressing-level pins lag one live-use cycle, so a re-decision does not rip out fresh test investment.

**A reversal after live use is the process working, not scope churn.** Record the new call as a dated
comment and move on.

**Every ruled design round is archived in the repo** under `design/`, one directory per round,
content only, in its own pull request. That archive is the visual spec; this file and the issue
ledgers are the words.

## The fidelity rule

> Be as faithful to the mockup as possible; deviate only where something genuinely clashes with
> Vellum's look and feel, and say why in the pull request.

Ratified during Landfall (#454) and stated independently in every mockup archive since. Four
consequences, each paid for at least once:

- **The deviation is stated, not silent.** A deviation with its reason in the pull request is part of
  the design record. One nobody wrote down reads to the next session as a defect and gets "fixed"
  back.
- **The fidelity arrow points one way.** The archive is never edited to match the site. If the build
  has moved past the mockup, the mockup is still the record of what was ruled.
- **An invented improvement is not an improvement.** Landfall's first proof: a lamplight bloom nobody
  had ruled washed the chart out, and the repair was the mockup's own dress.
- **A ruling made on a rendered preview is a ruling on exactly what the preview showed.**
  Substituting a better source, string or value afterwards, however good the reason, is a decision
  taken on Alex's behalf. Ship what he saw and record the alternative as his option.

**Record Alex's own wording.** When he answers a menu in his own sentence rather than picking an
option, his sentence is the ruling.

## The cost axis and ordering principle

Vellum's true cost axis is the **seed re-roll**, not lines of code. Two tiers:

- **Cheap and additive** (site-only or render-only): byte-changing but seed-safe, with no determinism
  or Explorer-parity tax. This is the bulk of the work and it leads.
- **Expensive** (a re-roll): changes world identity, re-pins the golden checksum, and forces a
  showcase regen plus caption edits. A dedicated lift, saved for last.

Order of work: clear the cheap, isolated, low-risk wins first for momentum, then the foundational
items that unlock the most downstream value, then the re-roll tail.

## Golden and committed-chart discipline

**Committed content, because a hand-authored page embeds it:** `public/charts/chart-42-*.svg`,
`public/charts/arms-42-*.svg`, `public/og.png`, and `public/favicon.svg` plus
`public/apple-touch-icon.png` (#489; `npm run icons` is their single writer, and a test pins the SVG
to the Fell SC woff2). Everything else generated is gitignored and rebuilt per deploy:
`public/atlas/`, `public/gallery/`, the bundle twins and their chunks.

**The committed list above is the rule; there is no shorter procedure that derives it.** "Referenced
by a hand-authored page" is the family resemblance, not a test: `src/pages/specimen/index.astro`
embeds `/gallery/chart-<seed>.svg` and `public/gallery/` is gitignored with nothing tracked in it.
What separates the two halves is that the committed four are stable across deploys and the generated
trees are re-derived per deploy from a seed that moves. **Adding to the committed list is a
deliberate decision, not the output of applying a line**, so make it deliberately and add the file
here. Two tombstones so nobody goes looking: `docs/` retired at #206, and the tsc engine emit retired
at #260 with its clean-list entry kept deliberately.

**The golden checksum is `1792806240`** (seed 42 realm labels), pinned by
`test/world/golden-seed42.test.ts`. A seed re-roll re-pins it.

- **A render change that moves any label or path owes a regen**: `npm run charts:regen` and
  `npm run og` (since #205). `charts:regen` single-writes `public/charts`; `og` writes
  `public/og.png`. A font-subset change additionally owes `npm run icons`. **There is no `site`
  script**; it went at #206.
- **Verify a regen by diffing the committed charts old against new**, snapshotting them first. The
  **#40 hero drift guard** compares a fresh render against the committed one, so after a regen it is
  **circular and proves nothing**. A good regen is small and explicable: name the labels that moved.
- **Land a regen ALONE.** Bundled with any other chart-changing work a chart delta cannot be
  attributed to a cause, and the diff is the only non-circular check you have. A regen is
  checksum-safe, so it never occupies a re-roll slot.
- **NEVER byte-compare SVGs rendered in different environments**, across operating systems or across
  Node versions, Node to Node included. `Math.sin`, `Math.cos` and `Math.atan2` are not correctly
  rounded, so coordinates drift about 1e-13 and a 2-decimal rounding boundary can flip. Compare
  structure exactly and numbers with a tolerance. **A naive byte compare passes on a Mac and fails
  on linux CI.**
- **A seed re-roll** (terrain reshape, culture or name-template edits) is a different, larger cost:
  it changes world identity and re-pins the golden checksum. **Only one may be in flight at a time**,
  and the set that rule excludes against is the next section.
- **An optional recipe field is guarded at every place the stamp touches it**, never written as a
  key that can hold `undefined`. Read `src/render/recipe-meta.ts` whole before adding one: the emit
  and the parse are conditional spreads, the human-readable metadata summary builds its fragment with
  a ternary, and the optional region is handled by a helper that returns an empty object. Patch only
  the spreads and the rest goes silently incomplete. The parse is the dangerous one: an absent
  attribute reads back as `null`, `Number(null)` is `0`, and an absent `coastWarp` means the 0.55
  default rather than 0, so an unconditional key rebuilds a real value where the chart recorded none,
  which is a different world for the same seed. The emit side is cheaper and still costs a regen.
  `test/render/recipe-meta.test.ts` guards the current fields with a `deepEqual` an `undefined` key
  breaks, and a new field owes its own case there.
- **Seed 42's culture draw is a covenant.** A world's culture is picked with
  `rng.fork("culture").pick(CULTURES)`, and `pick` indexes `floor(u * length)`, so both the ORDER and
  the LENGTH of `CULTURES` in `src/society/names.ts` are load-bearing: seed 42's draw lands on
  `oromi` and must keep landing there. **What a moved draw breaks is names, not the checksum.**
  `partitionRealms` takes no rng and runs before the culture fork, so `w.realms.labels` and the
  checksum above are untouched by any culture change; what goes red is the title, the capital, the
  realm names and the sea name, which `test/world/golden-seed42.test.ts` asserts beside the checksum.
  Expect a second red as well: `blazonRealms` takes the culture too, so a moved draw redresses the arms, and `heroChartSvgs`
  re-renders the committed `chart-42-*` AND `arms-42-*` families, which the drift guard in
  `test/site/hero-charts.test.ts` diffs against what is on disk. **A culture change is still a
  re-roll**: it rewrites committed content and moves world identity, which is what the tier is for.
  What it does not do is move the checksum, so read the red for which assertion failed rather than
  assuming the checksum needs re-pinning. Adding or reordering a culture is not the append-only edit
  the roster looks like.
  `test/world/covenant-seed42.test.ts` pins the draw and the index separately, so a future
  re-derivation of the index still has to keep the draw.
- Watch the **Chronicle 14-event cap** (`events.slice(0, 14)` in `src/society/history.ts`), which starts dropping a line at a
  realm count of eight or more. The cap drops the LATEST events, because the slice runs after a sort
  by year and ruins are late by construction, so a ruin can silently lose its dated event and its
  place card its abandonment tale. Relevant whenever realm counts rise (#113) or new dated events are
  added (#407).

## The re-roll flight-exclusion set

**No two re-rolls may be in flight at once.** A re-roll regenerates the committed charts and changes
world identity. The loser rebases, re-pins, regenerates, then re-runs the regen commands.

**Current membership: `{#113}`** (more seats on empty islands, so realm counts can exceed five). It
is the only member, so the rule has nothing to exclude against today and #113 is clear to run.

How the set reached one member, since a reader checking this line deserves to see it was not always
one:

- Originally `{#113, #49}`.
- 2026-07-28: **#309 joined**, making `{#113, #49, #309}`, with a ratified ordering of #309 before
  #113 so new island realms would be born with roads rather than churning the same worlds twice.
- 2026-08-16: **#49 left.** Rescoped to renamings only, its former-borders half moved to #122.
  Measured, not argued: the golden hashes only `w.realms.labels` from `partitionRealms`
  (`src/society/realms.ts`), which takes no rng, and Alex ruled the former name never prints on the chart. #49 was therefore cheap tier and
  has since closed.
- 2026-08-16: **#309 left**, shipped as PR #410 (squash `359f359`). Its blast-radius spike measured a regen, not a
  re-roll: the golden held. The "#309 before #113" ordering is discharged.

**#122 does not join this set.** It sits behind an opt-in `annals?: boolean` render option and is
byte-identical when off, so it moves neither the committed charts nor world identity.

## Scheduling rules

- **The Horizon tier is filed but unscheduled.** Filing an epic there does not enter it into the
  strategic order. **A slot is ratified in this file before any sub is drafted.** Membership of
  Horizon and of the numbered phases is board state; read it from the Project, not from here.
- **#395 (The Farther Interior) HAS ITS SLOT, ratified 2026-08-23.** It enters the strategic order.
  **Its board item deliberately still sits in the Horizon column** (Alex, 2026-08-23): where it lands
  among the numbered phases is a separate sequencing call he has not taken, and this ratification
  does not pre-empt it. This is the one case where the board's Horizon column does not mean
  unscheduled, and the rule above yields to this line. The trigger the epic named for itself was met:
  #376 shipped all five subs and closed, and Alex used the shallow detailed coast in the Explorer and
  confirmed it reads right, then ratified going deeper rather than settling at four bands. **Sub 0 is
  a spike and it gates the rest**: render band-4 and band-5 windows with the detailed coast beside
  today's world-resolution rivers and roads, across several seeds, so the mismatch is seen rather than
  imagined, then prototype one layer's re-derivation (rivers first) and measure its schedule.
  **Go or no-go per layer, recorded on #395**, and the epic stops and reports rather than joining the
  golden tail if the spike moves it out of the cheap tier. The band 5-6 ceiling is respected, not fought:
  #376 measured the parent-dominated fraction compounding 50% at band 1 to 92% at band 7, and lifting
  that means local guarantee enforcement, which is a separate ratification and not this epic's to
  take. `LOD_BANDS` and the Glass `scaleExtent` move LAST, in Sub 4, only after the layers agree.
- **#401 (The Chart Table) HAS ITS SLOT, ratified 2026-09-05**, with its own board phase and its subs
  filed the same day against a spec-recon re-baseline. Sub 0 (#518) was the mockup sitting and gated
  the rest. It ruled the full table as a drawer in the Explorer, by the exception recorded on the
  destinations rule above; the count-and-button minimum was drawn and passed on. The destination
  complies: the gathered sheets land on The Portfolio, a second page of the Print Room.
- Each epic carries its own contract, sub shape (a Sub 0 spike or mockup round first), open decisions,
  and golden or regen posture in its own issue, per the house pattern.
- **Delight and anytime work interleaves but never leads.** It is not the lead lane, and a delight
  item never displaces a foundational one.

## Cross-epic coordination

- **The shared Explorer substrate:** the voyage overlay, the chronicle scrubber, the zoom epic and the
  delight queue all touch the Explorer's controls row and the living-chart overlay-over-`#map` substrate.
  Whoever lands second reconciles. #191 extracted this into one importable module, so epics import it
  rather than fork it.
- **The `#sheet-inner` transform is shared** by the WAAPI style turn (#131) and the CSS verso flip
  (#116). Never let both drive `rotateY` at once; the `flipped` guard on `shouldTurn` plus the
  `.turning` button disable are the seams. Anything touching the sheet preserves this.
- **Renaming and sound drift are different phenomena** (ratified 2026-08-16, discharging the standing
  #282 and #49 coordination). A former name is a different word, a discrete dated event; the drift of
  tongues is an older phonetic shape of the current name, derived at read time. Neither subsumes the
  other and both may ship. Whoever builds #407 or a #282 sub inherits this distinction rather than
  re-litigating it.

## Durable engineering constraints from shipped work

Per the comment doctrine ratified at #378, a behavior a test already pins needs no comment: the test
is the record. An invariant earns a test first; only one no test can practically pin keeps a single
line at the line that breaks. The constraints below are each either guard-tested or carried as such a
comment. This is a convenience index, not their home.

- **Verso (#116, #174):** the ghost and the voyage track must come from the SAME draw, since a quiet
  mid-drag sea-level redraw freezes both (pinned by e2e W15). The verso track is static, never live:
  painted only at rest (`paintVersoTrack` in `src/site/explorer/verso.ts`), never from the rAF tick. `#status` must be empty at rest,
  because the draw settle and e2e `waitSettled` both key on it. One ghost object URL is created and revoked per redraw.
- **Realm labels (#145):** `realm-label-placement.ts` stage 1 stays first and unchanged, or the
  golden-free property dies. The dead `blob.length < 60` gate was removed after measuring that 0 of
  173 realms hit it, which is what lets "always named" survive #113.
- **Label order (#175):** the range name claims its box BEFORE the realm names, first refusal to the
  label that cannot move. Do not reorder that layer.
- **Mixed projections:** the chart plants profile marks on a plan view, which is the period
  convention. `glyphSymbolDefs` (`src/render/layers/glyph-symbols.ts`) draws the terrain glyphs
  standing on a baseline, and `castleGlyph` (`src/render/layers/settlements.ts`) stands a capital on
  its point the same way, while the plan circles beside it are centred on that point and the seat
  halo sits above it. One settlement therefore carries several different centres, and **no bounding
  box centre is the town.** Anything anchoring geometry or a DOM transform to a settlement takes the
  point from the place manifest (`buildPlaceManifest` in `src/render/place-manifest.ts`); the
  invariant is carried as a comment at the press-origin assignment in
  `src/site/living-chart/chronicle.ts`.
- **Prospect byte pins:** the plate pins hold only while all of `src/prospect/` stays **libm-free and
  clock-free**, which is the name of the guard in `test/prospect/dress.test.ts`. **That guard's regex
  is the list**, and it is longer than the trigonometric calls: do not keep a copy of it here or in
  your head, read it. `Math.sqrt` is exempt, since IEEE requires it correctly rounded. The guard
  scans the tree with comments stripped, because two of its modules state the contract in prose, and
  it asserts a floor on the file count so it cannot pass over an empty scan. Its companion rule is
  that world-sourced geometry is quantized to three decimals before hashing, far above the
  cross-platform drift and far below any real composition change.
- **Borders (#158):** the border attribute-order invariant is commented at its line; keep it.
- **Heavy lazy plates (#329):** a page embedding heavyweight lazy images gives each a reserved frame
  (width and height from the SVG root) and marks below-the-fold plates `fetchpriority="low"` so a
  clicked navigation wins bandwidth. The home style grid that consumed the priority half retired at
  #470, so this line is the rule's durable home until a lazy heavyweight embed returns; the atlas
  keeps reserved frames plus `loading="lazy"` in `src/atlas/document.ts`.

## Retired rules, do not resurrect

- **The nav-tax gotcha is retired.** The shared `BaseLayout` owns nav, footer and meta; adding a page
  is one `.astro` file plus one `src/layouts/nav.ts` entry. The flat versus
  grouped question was ratified FLAT in #202's decision doc, modeled once as typed data, to be
  revisited only on a named trigger: an eighth nav-listed surface scheduled, three or more wrapped
  lines at 360px, or any item acquiring children.
- **"Site-shell issues park behind the Scriptorium"** was a working agreement for the duration of that
  migration only. #201 closed 2026-07-23 and the agreement is discharged.
- **The old comment rule** ("a local invariant belongs in a code comment at the line that breaks") was
  superseded at #378; see the doctrine above.

---

*Companion to the roadmap Project (status, order, phase), to `CLAUDE.md` (process at the keyboard),
and to `specs/ui-design.md` (the look and feel). Rules change rarely; when one does, edit this file.*
