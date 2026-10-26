# 586-plan.md: Sub 1 of epic #585, `specs/engine-invariants.md`

Revision 2, after `vellum-spec-recon`. Prose only. One new tracked file plus two insertions into one
paragraph of `CLAUDE.md`. No `src/` change, no test change, no chart moves, no regen.

## Files touched

1. `specs/engine-invariants.md` (new).
2. `CLAUDE.md`, two insertions inside the single paragraph at lines 15 to 33.

Nothing else. Not `specs/rulebook.md` (Sub 5 owns it), not `specs/development-workflow.md`, not any
test, not any agent or skill file.

## Voice, form and the two standing prohibitions

Prescriptive throughout: every entry an imperative or a flat statement of the contract. No
provenance narrative, no "ratified at", no dated story. This departs deliberately from the style of
`specs/settle-doctrine.md` and `specs/rulebook.md`, both of which open with provenance; the issue's
acceptance forbids it and the issue wins over the precedent.

Citation form is the one `test/repo/comment-citations.test.ts` encodes for code: backticked symbol
plus repo-relative path, line numbers deliberately absent.

Two things the file must not do, both surfaced by recon:

- **Do not restate the re-roll flight-exclusion set.** `specs/rulebook.md` states its membership. A
  second copy in a second file is the exact duplication this epic exists to end.
- **Do not write "a re-roll moves the checksum" flatly.** The rulebook's culture covenant says a
  moved culture draw breaks names and not the checksum, because `partitionRealms` takes no rng.
  Section 3 distinguishes a terrain change from a culture or name-template change or it contradicts
  a ratified line.

## The file: nine sections in the issue's order

### 1. Identity versus view

- A world's identity is the embedded recipe. `defaultRecipe` in `src/world/generate.ts` builds it;
  `recipeAttrs` and `recipeFromSvg` in `src/render/recipe-meta.ts` stamp and parse it.
- Identity-defining options are recipe fields. View options change the drawing only and are never
  stamped. A new option is deliberately one or the other.
- **Guard, corrected twice.** Recon killed the source row's claim that e2e `R4` holds this: `R4` is
  section 2's guard. The plan skeptic then killed recon's replacement: `recipeFromSvg` in
  `src/render/recipe-meta.ts` rebuilds the recipe from its own FIXED field list, so a view option
  stamped as an extra attribute leaves `parsed.recipe` untouched and "a chart embeds its full
  recipe" in `test/render/recipe-meta.test.ts` stays GREEN. That test reds in the other direction,
  on a `WorldRecipe` field the parser does not read back. **So the file states the truth: the
  recipe-versus-view split is a discipline held by review, not by a guard.** What is pinned is that
  every `WorldRecipe` field round-trips, and that an absent optional recipe field leaves the bytes
  unchanged ("a default chart omits the coastWarp stamp" in the same file), which is adjacent to the
  rule and not the rule.
- Worked case, the Bestiary, with three precisions. Every world conjures its beast whether or not it
  is drawn (`conjureBestiary` in `src/society/bestiary.ts`, which `src/world/generate.ts` imports
  and calls; `beasts` is a field of `World` in `src/world/types.ts`), so "never stamped" means never
  part of the RECIPE, not never generated. The drawing is gated by the `beasts` render option in
  `renderMap` (`src/render/map-renderer.ts`), and when it draws the anonymous sea-decor serpent
  stands down. **"Byte-identical when off" is a construction argument, not an assertion**: what
  exists is "the bestiary layer appears only when summoned" in `test/society/bestiary.test.ts` plus
  the drift guard in `test/site/hero-charts.test.ts`, and that guard is structure-exact and
  ULP-tolerant on numbers, so it cannot pin bytes at all. The file says drift-tolerant, not
  byte-identical, and does not claim a pin that does not exist.
- The live view-option precedents to name are the shipped `beasts` and `arms`. **Do not cite #122's
  `annals?: boolean`**: recon found no such render option in the tree, so the rulebook's
  present-tense line about it is ahead of the code and must not be propagated.
- Counter-case, realm tint: the realm count is a world property settled in `generateWorld` with no
  style input, and `politicalTints` in `src/render/style.ts` only decides whether `realmTintsLayer`
  in `src/render/layers/realms.ts` draws anything. Changing a tint is a view change; changing what
  makes a realm is an identity change.
- Point at `specs/rulebook.md` for what an identity change costs. State nothing about it here.

### 2. World identity is entry-point independent

- The same seed yields the same world through every entry point, and every new surface inherits the
  contract. **Stated in current terms**: the CLI `chart` verb, the deploy's atlas and gallery
  builders, and the Print Room. The retired `--poster` and `--atlas` verbs #26 was titled for are
  not named.
- One shared path and no other: `defaultRecipe` then `generateWorld` in `src/world/generate.ts`,
  reached by `src/cli/main.ts`, `src/cli/atlas.ts` and `src/cli/gallery.ts`, and by the Print Room
  through `runJob` in `src/site/explorer/worker-client.ts` to `worldFor` in
  `src/site/explorer/world-cache.ts`.
- A surface never re-derives the grid from its own output size. A wider poster is the same world
  drawn wider, never the same seed on a finer grid.
- Guards: `test/cli/poster-parity.test.ts` holds the covenant at recipe level rather than byte
  level, and the e2e `R4` check in `scripts/e2e/suite-render.mjs` compares the worker's draw against
  the committed Node chart.
- **The stale citation recon killed**: the source row places this invariant in a comment beside
  `defaultRecipe`. `src/world/generate.ts` carries no comments at all. The file does not repeat that
  claim; this spec is the invariant's prose home.

### 3. What a terrain change moves, and what it does not

**This section departs from the issue's own framing, and recon marked the framing STALE and
blocking.** See menu item A. Nothing is drawn before terrain settles: `makeMapTitle` is called after
the heightfield, the waterline, `placeSettlements`, `partitionRealms` and `buildRoads` inside
`generateWorld`. What the issue's sentence describes is the observed outcome, not the mechanism.

- **Stability follows derivation, not position in `src/world/generate.ts`.** Write the mechanism.
- The year is drawn on the `title` fork and reads only that fork, the culture and the recipe's map
  type (`makeMapTitle` in `src/society/names.ts`), so a terrain change does not move it.
- The title takes the capital's name as its base for a city-state world, and the capital's NAME is
  stable because `placeSettlements` in `src/society/sites.ts` pushes the capital first, so it takes
  the first draw off the names fork.
- What a terrain change is free to move: the settlements themselves, the roads, the per-cell realm
  partition and therefore the golden checksum, which hashes `w.realms.labels`, an `Int16Array` of
  per-cell realm ids, in `test/world/golden-seed42.test.ts`.
- **The realm seat roster is a separate thing from that per-cell labelling.** `partitionRealms` in
  `src/society/realms.ts` takes no rng, its `seats` are settlement indices chosen by `selectSeats`,
  and a terrain change can move the checksum while leaving the roster identical. Check with a
  scratch run; do not assume in either direction.
- A culture or name-template change is the other axis and behaves differently. Point at
  `specs/rulebook.md`'s covenant rather than restating it.

### 4. Fork derivation

- A named fork derives from the seed and a hash of the label, never from stream position: `fork` and
  `hashString` in `src/core/rng.ts`. **Do not write the expression.** Recon corrected the shorthand
  formula the source row carries, and `src/core/rng.ts` already states the contract at its head, so
  the spec states the property and points at the symbol.
- Consequence: a feature that takes its own named fork cannot move any other feature's draws, and
  that holds BY CONSTRUCTION rather than by one block staying last in `src/world/generate.ts`. Take
  a new named fork rather than appending to an existing namer.
- The hazard: a draw inserted MID-fork moves every later value on that fork. `simulateHistory` in
  `src/society/history.ts` takes `rng.fork("history")` and its output feeds every settlement's
  founding and ruin, so a draw inserted there moves committed bytes. Point at `specs/rulebook.md`
  for the cost.
- **Known residue, named in the PR body**: the one-line comment at the head of
  `src/society/history.ts` gives "appended LAST in the pipeline" as the reason that fork cannot
  reshuffle geography or names. That reason is wrong; `fork` closes over the captured seed, so the
  property holds wherever the block sits. This sub changes no `src/` file, so the comment is left
  as it stands and flagged as a candidate correction rather than silently contradicted.

### 5. Landmass labelling versus the drawn coast

- `labelLandmasses` in `src/world/landmass.ts` and the drawn coast from `marchingSquares` in
  `src/terrain/contours.ts` can disagree at a saddle. `marchingSquares` resolves its ambiguous cases
  by the cell-centre average, so two diagonal land corners can be bridged into one drawn ring while
  the flood reports two landmasses. `closedIsoRings` in the same file wraps it and inherits this.
- Therefore a coastline the chart draws as continuous is NOT evidence of one landmass, and a
  landmass boundary is NOT evidence of a break in the drawn coast.
- `partitionRealms` imports `labelLandmasses` and refuses to flood across such a pinch, so a realm
  border can fall on ground the chart draws as joined.
- **The disagreement runs BOTH ways, and the plan skeptic proved the plan's first draft wrong here.**
  The flood is 4-connected so it never bridges a diagonal, and the contour bridges one whenever the
  centre average clears the iso, so the drawing can join ground the flood splits; and the drawing can
  equally cut a local pinch that the flood still joins by a longer 4-connected path. `fusingSaddles`
  censuses one direction only; the other is counted nowhere. **No "only ever" and no "never" in this
  section.** The first draft imported a directional claim that belongs to a different comparison: the
  road builder's own 4-connected shore grouping, where a 4-connected path is also 8-connected so a
  shore group can never strand from its anchor. That claim is stated separately, as itself.
- A consumer treating a landmass boundary as impassable says which of the two it means and measures.
  The accept-and-pin censuses live in `test/terrain/detail-guarantees-world.test.ts` with
  `fusingSaddles` in `test-support/saddle-probe.ts`; the numbers stay there. `src/world/landmass.ts`
  carries zero comments, so this spec is the fact's only prose home.

### 6. The detail chain: DROPPED FROM THIS FILE BY ALEX'S RULING ON MENU ITEM E

**Alex ruled 2026-09-13, relayed by the dispatcher: all level-of-detail material goes in ONE file,
and that file is #587's `specs/explorer-doctrine.md`.** This section is not written here, and no
forward reference to it is added. The #587 lane takes these source rows and writes the rule in its
region and level-of-detail section.

**The handoff, on the record**: the source row is `classify-project_vellum.md` **item 28a**. What it
carries, so the other lane does not have to re-derive it: resampling cannot preserve a one-cell
strait, so narrow channels close and islands fuse and a finer view is not guaranteed to carry the
coarse world's landmass topology; the construction rule is to floor against EVERY ancestor,
elementwise, never the immediate parent only, because two resamples in a row do not smooth the way
one does; the symbols are `canonicalParent` and `ancestorWindows` in `src/world/detail-chain.ts`
plus `floorToParent`, `gateToParentLand` and `rejectBridges` in `src/terrain/detail-guarantees.ts`;
and `canonicalParent` takes the WINDOW only and no band, because a band argument cannot serve the
atlas window, which is not a level-of-detail band. All of those were verified with a command in this
session. The text below is kept verbatim for that lane to read.

### 6 (retained for the #587 handoff only, not shipped in this file)

- Resampling cannot preserve a one-cell strait. Narrow channels close and islands fuse when a window
  is resampled finer, so a finer view of a world is not guaranteed to carry the coarse world's
  landmass topology.
- The construction rule: floor against EVERY ancestor, elementwise, never the immediate parent only.
  Two resamples in a row do not smooth the way one does, so parent-only flooring drowns waterline
  cells relative to a grandparent.
- `canonicalParent` and `ancestorWindows` in `src/world/detail-chain.ts`; `floorToParent`,
  `gateToParentLand` and `rejectBridges` in `src/terrain/detail-guarantees.ts`. `canonicalParent`
  takes the WINDOW only and no band, because a band argument cannot serve the atlas window, which is
  not a level-of-detail band.
- Future level-of-detail work floors against every ancestor and states which guarantee it enforces,
  per-link or transitive.

### 7. What the generator does not do

- An off-edge continent is not reachable through the land-fraction option. The CLI's `--land`
  **REJECTS out of range rather than clamping** (`src/cli/main.ts` throws outside 0.1 to 0.7); the
  skeptic caught "clamps" as a stale row propagated from the source. `pickSeaLevel` in
  `src/terrain/sealevel.ts` moves the waterline only, after `buildHeightfield`; the edge sink and
  the falloff in `src/terrain/heightfield.ts` are what keep a sea margin on all four borders. Ruled
  deferred; do not implement it as a land-fraction tweak.
- The domain-warped falloff (`coastWarp`) lobes the coast and can grow offshore islets. It does not
  touch the border guarantee.
- The assumption everything downstream leans on: OCEAN ALWAYS REACHES THE BORDER on all four sides.
  Named leaners that resolve: `endsInOcean` in `src/hydrology/rivers.ts` (a river PROPERTY, not a
  function) and `seaMask` in `src/hydrology/sea-mask.ts`, plus sea naming and compass placement.
- **Do not write "pinned by the border tests ... at any land fraction".** The skeptic measured the
  dimension: the border tests in `test/terrain/heightfield.test.ts` hold one recipe and sweep
  `coastWarp`, never the land fraction, and the test whose name most supports the claim asserts only
  that the border sits below the interior. The guarantee rests on the edge sink and the falloff and
  is corroborated by measurement; say that, and do not let a citation carry a dimension its tests
  never vary.
- A region window is generated as a `World` in its own right (`generateRegionWorld` in
  `src/world/region.ts`) and is therefore the candidate path if the deferral is revisited. **The
  coast closing is NOT in that file**: `src/world/region.ts` contains no such code, and
  `closedIsoRings` in `src/terrain/contours.ts` is what closes chains on the boundary, reached from
  `src/render/coast.ts`, `src/render/layers/land.ts` and `src/render/layers/water.ts`. The first
  draft's citation was exactly the defect class the acceptance names.

### 8. Gates run before selection

- The Daily Hunt's findability gates run BEFORE the clue is chosen, never as a post-hoc prune.
  `buildClues` in `src/world/daily-hunt-clues.ts` calls `buildClueFacts` first and selects from its
  output; `ClueFindability` with `isLabeled` and `hasGlyphNear` is in
  `src/world/daily-hunt-clue-facts.ts`.
- A filter applied page-side to the delivered list silently breaks the narrowing and the floor
  guarantees that walk provides. A surface wanting a different clue population changes the candidate
  pool, not the output.
- The e2e halves are `H11` and `H12` in `scripts/e2e/suite-hunt.mjs`.

### 9. Engine outputs a consuming surface must respect

- Lore prose depends on call order: `createLoreWriter` in `src/society/lore.ts` holds a per-writer
  used-map and draws from its own rng, so a fresh writer and the bound atlas's gazetteer can
  disagree for the same town. A surface quoting lore states which of the two it quotes. The fact is
  already a one-line comment at `src/render/place-card.ts`; this spec is the normative home and does
  not restate it in different words.
- The gazetteer's row order keeps the bound atlas byte-stable: `gazetteerOrder` in
  `src/atlas/compose.ts`, pinned by "the gazetteer's rows run capital, then the towns, then the
  villages, each rank alphabetical" in `test/atlas/compose.test.ts`, which derives its expectation
  rather than reading the composer back to itself. **Name the tie-break**, rank then name by
  `localeCompare`, so a reader knows the stability rests on a runtime-default locale rather than on
  a fixed collation.
- `ribbonResultFor` in `src/site/explorer/ribbon-job.ts` reassigns the departure to the CAPITAL when
  `roadReachable` in `src/itinerary/route.ts` returns empty, with no signal to the caller. Any
  surface offering "the road from X" owes that check and carries its answer rather than inferring
  one from a non-empty result.
- `stripFor` in `src/itinerary/dress/layout.ts` tests a half-open interval, so `eventSeat` returns
  null for an event at the last strip's far end. A seating surface answers null too rather than
  inventing a seat.

## The `CLAUDE.md` edits, exact

Recon's correction: both clauses sit in ONE paragraph, lines 15 to 33, not two paragraphs, so Subs
1, 2 and 3 all edit one contiguous block. Both edits are whole-line inserts wherever the line
boundary allows. Neighbouring paragraphs are not rewrapped and the trailing "and" in each clause is
untouched.

**Edit 1, the enumerating clause.** Insert two complete new lines between current line 19 (ends
`...the cascade traps this codebase keeps hitting);`) and current line 20 (begins
`` `specs/development-workflow.md` is the order of operations... ``). ZERO existing lines change.
The clause reads, in substance: `specs/engine-invariants.md` is what the generator guarantees about
a world, what breaks those guarantees silently, and what a surface that quotes generated output may
not assume about it.

**Edit 2, the required-reading clause.** Current line 27 carries the END of the `ui-design` clause
and the START of the `development-workflow` clause, so it splits into three lines: the first keeps
`whose deliverable is an appearance,` and opens the new clause, the second closes the new clause and
nothing else, the third is the ORIGINAL tail of line 27 moved down untouched. Diff shape: one line
changed, two added; lines 25, 26, 28 and everything after untouched. **The second of those three is
the line #587 inserts after, and current line 27 is the one line the two lanes must meet at.** The
clause reads, in substance: required reading before any change to world generation, or to a surface
that quotes generated output.

The two short lines this leaves mid-paragraph match the file as it stands (current line 31 is
already a short mid-paragraph line), so a full rewrap of the sentence is not owed. The enumeration
stays PROSE; converting it to a list would rewrite every line of a paragraph two other lanes are
editing.

**Position**, pending menu item B: in BOTH clauses the new clause goes after the `ui-design` clause
and before the `development-workflow` clause, so the content specs group together and the process
specs stay at the end, and both clauses read in the same order. #587 inserts `explorer-doctrine`
immediately after, Sub 3 inserts `site-architecture` after that.

## Tests

**No new test, and no red-green cycle.** Nothing here has behavior. Nothing in the repo sweeps or
lints markdown, and recon verified it independently: no lint or format script in `package.json`, CI
runs only `check`, `test`, `build` and the e2e lanes, and `test/repo/comment-citations.test.ts`
walks `.ts`, `.mjs` and CSS but never markdown. **The #384 and #385 citation the first draft leaned
on is deleted**: the skeptic checked both and they are the comment-shape doctrine over `.ts`, `.mjs`
and `.astro`, nothing to do with markdown. So the absence of a markdown sweep is UNEXAMINED, not
ruled, and the conclusion rests only on the issue asking for no guard and on recon's sweep. A stated
departure from the house test-first rule, not a silent one.

`vellum-guard-prover` does not run: no guard. `vellum-plate-reader` does not run: the deliverable is
not an appearance.

## Evidence, each a named command

1. `npm run check`
2. `npm test`, then `npm run astro:generate` to restore the generated `public/` assets the suite
   deletes.
3. **Citation sweep**: `node 586-citecheck.mjs . specs/engine-invariants.md` (written and
   self-tested in the scratchpad). It extracts every `` `symbol` in `path` `` pair and every bare
   backticked repo path, asserts the path exists and the symbol greps in it, prints the pair count,
   and exits non-zero on zero pairs so a broken sweep cannot read as a pass. Self-test against
   `specs/rulebook.md` returned 3 pairs and 28 paths and FAILED on two gitignored generated
   directories, which is the proof it bites; those are the known false-positive class and are named
   in the run.
   **Strengthened on the skeptic's finding 8**: a presence grep passes a citation that points a
   reader at the wrong file, which is how the first draft came to cite `conjureBestiary` in
   `src/world/generate.ts` when it is defined in `src/society/bestiary.ts` and merely called there.
   The sweep now reports DEFINED versus REFERENCED-ONLY per pair, and every referenced-only pair is
   justified in the reply or rewritten. And the sweep's own limit is stated in the PR body, in the
   words `test/repo/comment-citations.test.ts` already uses about itself: green means the citations
   resolve, never that the prose wrapped around them is current. Which claims were read against the
   code by hand is named separately.
4. **No counts**: `grep -nE "[0-9]" specs/engine-invariants.md`, every hit justified in the reply as
   an issue or PR number.
5. **No em-dashes**: `grep -n "—" specs/engine-invariants.md CLAUDE.md`, expected empty.
6. **Public safety**: a case-insensitive sweep of the diff for home paths, personal names other than
   Alex, board or field ids, token scopes and anything from another business, expected empty.
7. **Diff shape**: `git diff --stat` and `git diff CLAUDE.md`.

## Rosters and doctrine this change drags

- `CLAUDE.md`'s two clauses: in scope.
Three rosters, corrected by the skeptic on two of them.

- `specs/rulebook.md` names its sibling specs TWICE, at the paragraph near the top and at the
  closing companion line. Both go stale. (Its "Five other places" list is a different list and is
  not affected.)
- `specs/development-workflow.md`: **NOT the "Three other places" list at the top**, which names the
  rulebook, the footguns skill and `CLAUDE.md`, none of which change here. The list that goes stale
  is step 3's required-reading sentence, which mirrors `CLAUDE.md`'s and names rulebook, ui-design
  and settle-doctrine. Hand Sub 5 the sentence that is actually stale or it edits the wrong one.
- **`.claude/agents/vellum-implementer.md`, a roster no sub in the epic owns.** Its reading list
  enumerates the same required-reading spec set. That is the agent running this epic's own lanes,
  it is tracked, and #585's Sub 5 scope is the specs and Sub 6's is the footguns triage, so an agent
  file falls outside every sub. It costs a branch and a PR later exactly as it would now.
- **Call: all three are Sub 5's**, per the epic scheduling Sub 5 last "after the four new files
  exist for them to point at". Raised as menu item C because nothing sweeps markdown, so if Sub 5's
  issue does not name them the staleness is permanent and silent.
- `.claude/skills/vellum-footguns/SKILL.md` cites specs by path but does not enumerate the set, so
  it is not a roster this change joins.

## Open decisions: the menu for Alex

- **A.** Section 3's framing. The issue says "drawn before terrain settles"; recon marked that STALE
  and blocking, and the mechanism is fork derivation plus capital-first naming.
- **B.** Where the three new specs sit among the five existing ones.
- **B2, kept separate from B on purpose.** Whether `specs/flake-record.md`, named in the enumerating
  clause and absent from the required-reading clause, joins the second list while it is being edited
  anyway. This changes what is required reading for every session, which is outside this issue, so
  it is a plain yes or no and is not bundled with the position question.
- **C.** Who updates the rulebook's two sibling lists, the workflow's step 3 sentence, and
  `.claude/agents/vellum-implementer.md`'s reading list.
- **E.** Where the level-of-detail boundary falls between this file's section 6 and #587's region
  and level-of-detail section. Raised by recon, and the skeptic called it BLOCKING that the first
  draft answered it as a call instead of putting it to Alex: the two lanes run in the same pair, so
  it is decided once now or twice differently.

## Not a menu item: one action for the dispatcher

Recon's open decision 3 reads as a question about where the bestiary's arena and escalation content
and the tint style gating belong. It is not one. #586's "Not in this sub" already rules it:
"Anything about how a world is DRAWN goes to `specs/ui-design.md` through Sub 5." What recon
actually found is narrower and is a scoping gap, not an open decision: Sub 5's stated source list
(items 32b, 33, 35b) does not include rows 31a and 37a, so the ruling names a destination no filed
sub will deliver. **The fix is to amend Sub 5's issue to carry those two rows**, which is the
dispatcher's, not Alex's, and not this lane's. Putting it to him as a menu would ask him to
re-decide something the plain reading of his own issue already settles.

## Calls made, each with its rule
- Section 8 states the contract only, without the Daily Hunt's checking traps (upper-cased capital
  labels, drawn glyphs versus eligible cells). Those are imperatives keyed to the moment of writing
  a test, which the routing rule sends to a `vellum-footguns` gate, so they are Sub 6's shape.
- No markdown guard is added. Nothing sweeps markdown by design and neither the issue nor the epic
  asks for one.
- The file does not restate the flight-exclusion set or the golden discipline; it states the engine
  fact and points at `specs/rulebook.md`, which the issue requires.

## Sequence from here

Phase two on the rulings: rename the branch to `chore/586-engine-invariants` before the first
commit, write the file, run the evidence, record the calls and the relayed rulings as one dated
comment on #586, open the PR from `.github/PULL_REQUEST_TEMPLATE.md` with all five `## ` sections,
then `vellum-pr-skeptic` cold with the PR number and nothing else.
