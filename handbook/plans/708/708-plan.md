# Issue #708 plan: memory to specs, round two

Branch `chore/708-memory-to-specs-round-two`, worktree `.claude/worktrees/agent-aa61c57794c528580`, base origin/main 9ae9a20 (after PR #726 moved `specs/`, `errata/` and `plans/` under `handbook/`, so every `specs/...` and `errata/...` path in the issue reads `handbook/specs/...` and `handbook/errata/...`). Revised 2026-10-02 after `vellum-spec-recon` and `vellum-plan-skeptic`; the open decisions A to D below are Alex's and are not defaulted.

## The design

A prose pull request, plus (on decision D) one unit guard. Each of the issue's candidates 1 to 33, and item 34 (Alex's ruling on when a finding may go to errata, with its moved-verbatim clarification), lands in exactly one tracked home, is re-routed to another, or is dropped with the reason. Nothing under `src/`, `e2e/` or `public/` changes. The rules follow `handbook/specs/conventions.md`:

- **The routing rule decides the home.** A Vellum-specific, normative, slow-changing rule goes to a spec; an imperative keyed to the moment of typing goes to a `vellum-footguns` gate, only with its own incident number or a ruling of Alex's at the line; a gate candidate with no incident goes to `references/held-lines.md`; a fast-changing platform trap and a statement of absence stay out of a spec (a missing guard is an errata row in `handbook/errata/guards.md`). One normative home per rule: where a rule already half-lives in a spec, the missing half joins that line.
- **A gate line is the checklist, and its story is in `references/`.** `SKILL.md` says so itself ("Provenance is in `references/`"). The gate text is pasted whole into the session by the hook, under a size limit (decision D), so each new gate line is ONE sentence: the imperative and its incident numbers. The incident detail that proves it goes to a `references/scars.md` row.
- **Spec voice.** Imperative, provenance dropped, `` `symbol` in `repo/relative/path` `` citations kept. Every number in new prose is written `Issue #N` or `PR #N`.
- **Gate numbering is stable.** Other files cite Gate 1 items 2, 3, 8 and 16, Gate 2 items 6, 9, 11, 13 and 14, and Gate 5 items 3, 5, 7 and 9 by number, so nothing is inserted mid-list: a candidate for the same moment as an existing item folds into it as one clause, the rest append at the end. The `Scars:` line heading each gate is left as it stands (a bare-number list; touching it obliges converting all of it to the Issue/PR form, and each new line carries its own incident).
- **A code comment is not a second copy.** Where a rule moves into a spec and a comment states it at the line that breaks (`src/site/explorer/hooks.ts`, `.pc-lay.dim` in `public/living-chart.css`, `labelledLayers` in `src/render/map-renderer.ts`), the comment stays.
- **Every detail is public.** The cold skeptic cannot read private memory, so every detail written is one a public issue, pull request or commit states (read 2026-10-02 with `gh api` and `git show`): PR #349 (Issue #320's inert mutation, live in `dist/reading-room/app.bundle.js`); PR #290 and commit a947681 (S21 trusted `transform-box`; S26 read 0.873px against exactly 0 at 0.05px); PR #380 (the ci.yml ternary swapped, the `!` dropped, presence-only guards); PR #410 (inverting `topByScore` escaped all 1294 tests; the lane against trunk pins); Issue #443 (1428 tests, the shared oracle); Issue #547 (CD14 to CD16 only at 390); `.claude/skills/vellum-footguns/hooks/README.md` (PR #554: 10 of 19 arms had no fixture); PR #631 (the `\d+` year pin, the refusals never driven, the brace blind spot found three times); commit 5608dc1, PR #552 (the real tmpdir, 3 of 3); PR #452 (Issue #400's three shapes); PR #545 (Issue #540's BR6b); Issue #522 (the clamp saturates, 16.28px); Issue #638 (ink against layout boxes, 320 to 480 a pixel at a time); Issue #368 (a load-time `window.open` blocked whatever the origin). Item 14's lesson is stated publicly only in Issue #708's own body; its geometry is checkable in `public/explorer/chart-drawer.css`.

## The files and the text

### `handbook/plans/708/708-plan.md`

This plan, copied as it stands after the rulings, committed with the first commit (workflow step 8).

### `.claude/skills/vellum-footguns/SKILL.md`

- **Header** (item 33): "...in `CLAUDE.md`, in `handbook/specs/rulebook.md`, in the agents, and in the auto-memory doctrine files" becomes "...in `CLAUDE.md`, in the specs under `handbook/specs/`, and in the agents".
- **Gate 1 item 3** gains (item 2): "**Assert the OUTCOME, never the declaration** (Issue #155, PR #290)."
- **Gate 1 item 9** gains (item 1): "A mutation that leaves the output byte-identical proves nothing until it is confirmed live in the built bundle; then suspect the aim before the guard (Issue #320, PR #349)."
- **Gate 1 item 10** gains (item 10, re-routed from held-lines: it has its own incident): "A child that reads global state gets its own copy, `TMPDIR` included (Issue #551, PR #552)."
- **Gate 1 item 11** gains (item 6): "A width-scoped feature is guarded on BOTH sides of its breakpoint (Issue #547)."
- **Gate 1 item 13** gains (items 7 and 8): "A regex guard gets one fixture per arm before a hand mutation table is trusted (PR #554), and never bounds a span with `[^}]*`, which cannot cross a nested brace: match the bare token and count (PR #631)."
- **New Gate 1 item 17** (item 3): "**A guard over a config file a test cannot execute pins its SHAPE**, operator order and negation included, and is proved by INVERTING the config, never only by deleting it; better, move the logic into a module a test imports (PR #380)."
- **New Gate 1 item 18** (item 4): "**A selection rule is guarded on a consequence that differs by WHO was chosen**, and proved by inverting the selector (Issue #309, PR #410)."
- **New Gate 1 item 19** (item 5): "**A reference that went through a transform shares the defect's oracle**: also assert against the RAW source, on exactly what the transform cannot represent (Issue #398, Issue #443)."
- **New Gate 1 item 20** (item 9): "**A ratified acceptance gets a driving check beside any read of a pure function or source text**, never instead of one (Issue #522, PR #631)."
- **Gate 2 item 1** gains (item 14): "A clip-path shrinks the hit region to the drawn shape: aim inside it, never at its box's centre (Issue #520, recorded on Issue #708)."
- **Gate 2 item 4** gains (item 12): "Moving an existing guard's sample point to land your own work leaves the assertion alone and mutation-proves the guard still bites on its original defect (Issue #540, PR #545)."
- **Gate 2 item 8** gains (item 11): "A PR that moves a measured cost, slower OR faster, sweeps the poll budgets and the reads taken after a commit or a settle before the push (Issue #400, PR #452)."
- **New Gate 2 item 15** (item 13): "**A clamped value saturates and hides the regression**: measure the quantity the clamp acts ON (Issue #522)."
- **New Gate 2 item 16** (item 15): "**A collision is measured on ink**: every visible text node's line boxes and each control's own rect, never a layout box; an edge defect is a range, swept one pixel at a time by resizing the loaded page, with `innerWidth` recorded beside the width set (Issue #638)."
- **Gate 5 item 7** (item 34): "A finding about this PR's own work is fixed in the review rounds and leaves unfixed only on the terms `handbook/specs/development-workflow.md` step 15 sets (Alex, 2026-09-27, Issue #708)." Its "exceptions that fold" sentence is reconciled per decision C. Gate 5 item 10 defers to item 7 and is left alone.
- **Decision D, option 2 only**: Gate 1 items 8 and 10, which the issue never named, rewritten shorter with EVERY rule clause kept and only the explanation compressed (their back-stories are `references/scars.md` rows: "Earlier, #363", "Later, #561", "Later, #562", "Later, #564"; the sibling double-run and the orphaned grandchild have no other home, so both stay). Proposed item 8 (862 to 582 characters): "8. **A shared helper goes in `test-support/`, never in `test/` and never in a sibling.** `node --test` collects every module under any directory named `test`, at any depth, and anywhere a file named `test`, `test-*`, `*-test`, `*_test` or `*.test`, so a helper there or so named runs as a passing test of its own, and a `.test.ts` importing a sibling `.test.ts` runs the sibling tests twice; neither fails, both inflate the count, and `test/repo/test-collection.test.ts` reds on both arms. No precedent in `test-support/` is not evidence the repo lacks the convention (Issue #363)." Proposed item 10 (947 to 497): "10. **A test that spawns a child gives it its own time limit**: with none, a wedged child (a large `input` to a child that DRAINS it) hangs the unit lane with no red, and `--test-timeout` cannot stop a synchronous block (Issue #564). Set the cap far above the worst real run, keep one child that outlives it written as a SINGLE command, since killing a multi-command child orphans its grandchild and leaks a process per firing, and pin what reaches the spawn, not what the option builder returns." Dropped from item 8 only the collection pattern's fine print (six extensions, dot segments, `node_modules`), which `test/repo/test-collection.test.ts` pins. Gate 1 then measures about 7,750 characters with the longest lead.

Measured with the hook's own construction (`gateText` plus `gateNote`'s lead, a long worktree path; script `708-gate-measure.ts` in the scratchpad): Gate 1 is 7,102 today; the first draft of this plan took it to about 10,100; the one-sentence lines above take it to about 8,470; option 2 to about 7,750. Gate 2 goes 5,839 to about 6,690, and a new e2e suite file's combined Gate 4 plus Gate 2 note to about 7,800. Gate 5 goes 5,447 to about 5,640.

The limits, read from the installed Claude Code 2.1.287 binary: hook `additionalContext` over 10,000 characters is replaced by a 2,000-character preview and a file path (`Mde`, default `threshold` `y4o=1e4`, called on PreToolUse `additionalContext`, beside the log line "provided additionalContext (N chars)"). A second path in the same binary sanitizes hook output and cuts `additionalContext` to 8,000 characters and 200 lines (`ndr` via `jHe`, reached from a hook-result normalizer that also handles `command` hooks); whether a project hook's output goes through it could not be established, so its reach is UNVERIFIABLE.

### `.claude/skills/vellum-footguns/references/scars.md`

- **Item 2**, folded into the second door ("The assertion read its own input or the fallback"), before its "Proves Gate 1 item 3": "Issue #155: the press check S21, as PR #290 first wrote it, asserted the `transform-box` declaration and passed on the buggy origin, while S26 measured the town point staying a fixed point of the press, 0.873px on the old origin against exactly 0 on the new at a 0.05px tolerance; S26 is RS22 in `e2e/suites/room-ink.ts` today." (Not "S21 is RS19": today's RS19 also asserts the origin.)
- **One row per other new gate line**, each in the family it belongs to, carrying the public detail the gate line no longer does: Issue #320 / PR #349 (the frozen manifest `armAges` only forwards, byte-identical RS23 output, confirmed live in the bundle, the retargeted mutation reddening RS23 alone); PR #552 (the tmpdir guard 3 of 3 beside a sibling holding a scratch directory); Issue #547 (CD14 to CD16 only at 390, the leaf tabs standing on the desktop); PR #554 (10 of 19 arms without a fixture); PR #631 (TP2's `[^}]*` hole, the second and third instance in one PR; the year pinned as `\d+` so `year: 1` passed, the refusals never driven); PR #380 (the ternary swapped, the `!` dropped, presence-only, the logic moved to `src/cli/e2e-suites.ts`); PR #410 (the `topByScore` inversion, 1294 tests, closed by the lane against trunk pins); Issue #443 (every guarantee measured against the resampled surface, 1428 tests); PR #452 (Z17 inside the crossfade on a faster draw, `waitRedraft` outrun by a slower one); PR #545 (BR6b's fixed offset landing on the new tab, re-anchored, mutation-proved against the pool); Issue #522 (16.28px taller under two identical 0.00 clearances); Issue #638 (the layout box reporting two collisions that are not there and missing a dateline; 320 to 480 a pixel at a time). Each names the gate item it proves.
- **Item 33**: the preamble's "The long form of each lesson, with the earlier scars, is in the auto-memory doctrine files named at the end" becomes "Where a lesson's rule is written down in this repo, it is in one of the homes named at the end", and "Where the long form lives" becomes "Where the rules are written down", listing tracked homes only: the gate lines, `handbook/specs/settle-doctrine.md`, `handbook/specs/development-workflow.md`, `handbook/specs/conventions.md`, `handbook/specs/ui-design.md`'s colour and contrast section, `CLAUDE.md`'s "Measure before you assert" and "Write visual samples to out/", the agent definitions under `.claude/agents/`, and for the tooling traps the Never list, `.claude/skills/vellum-footguns/hooks/README.md` and `references/held-lines.md`'s Never section. It names no memory file and claims nothing about what memory still holds.

### `.claude/skills/vellum-footguns/references/held-lines.md`

- **Item 2**: the Gate 1 line "Assert the OUTCOME, never the declaration; ..." stays word for word (the file's provenance paragraph says it is Issue #611 verbatim), with a line beneath in the file's own form: "Noted 2026-10-02, promoted: Gate 1 item 3 now carries it with its incident (Issue #155, PR #290), via Issue #708."
- **Item 8's reconciliation**: beneath "Count the terms; do not pattern-match. Earns its line when: the prover reports a mutant matching the pattern and escaping": "Noted 2026-10-02, promoted: PR #631's brace-bounded pattern is that incident, and Gate 1 item 13 now says match the bare token and count, via Issue #708."
- Nothing near line 87 (the "Closed out here" paragraph and its `design/oracle/` reference), which the Issue #706 lane owns.

### `.claude/agents/`

- `vellum-guard-prover.md` (item 33's class): "the guard doctrine in Alex's auto-memory" becomes "the guard lines of `vellum-footguns` Gate 1". Unasked, flagged in the PR body.
- `vellum-plate-reader.md` (item 33's class): the `feedback_show_visual_artifacts` tag becomes a pointer at `CLAUDE.md`'s "Write visual samples to out/". Unasked, flagged.
- `vellum-pr-skeptic.md`, "Every finding has an exit" (item 34): appends "and so is a finding about the PR's own work left unfixed on terms `handbook/specs/development-workflow.md` step 15 does not allow".
- `vellum-implementer.md` (item 34): "a finding you do not fix is filed or added ..." becomes "a finding about your own work is fixed in those rounds and leaves unfixed only on the terms workflow step 15 sets; a finding left unfixed, and any sibling defect you found, is filed or added to `handbook/errata/` as a row in the same diff, never left as prose in the body".

Per workflow step 14, the PR body names which version of these definitions wrote the change (main's, 9ae9a20) and that which one reviewed it is UNVERIFIABLE.

### `handbook/specs/development-workflow.md`

- **Step 6** (item 27, second half): after "A decision that is his is not one to default your way and mention afterwards": "**A ruling that rested on a wrong premise goes back to him and is re-taken**, never patched underneath."
- **Step 10** (item 27, first half), a new paragraph: "**A comparison's baseline is the control, the arm that ships today**, of which step 6's rendered control is the case for stills. Name it before comparing and check how it is actually built; report the control, the predecessor and yours wherever they differ; and never promote a comparison measured on one fixture into an unconditional invariant."
- **Step 10** (item 26): "**A measured table that exists only in `out/` is copied into a PR comment with the harness that produced it**, because `out/` is gitignored and nothing else holds them." Tables and harnesses only: a still goes with the session (`handbook/specs/conventions.md`). Placed at step 10, where evidence is named, not in step 6's paragraph about stills. Neither step 10 edit touches its shared-stylesheet sentence, which Alex ruled stays as written.
- **Step 15** (item 34): "**A finding about this pull request's own work is fixed in the review rounds.** It becomes an issue or a `handbook/errata/` row only when the third round is used up or when fixing it needs a decision of Alex's, and the PR body names which and why. **A finding it found but did not cause**, a sibling defect in code or text it did not write, goes to an issue or a row in any round, as `vellum-footguns` Gate 5 item 7 says. Text a pull request only moves, unchanged, keeps its old owner: a defect in moved-verbatim text is the sibling kind, and the pull request fixes it only if it chooses to edit that text, which keeps a pure move a pure move. A finding left as prose in the body alone is itself a finding." Plus the accessibility sentence per decision C, and "An integration pull request is the exception that follows" before the existing integration paragraph, which treats a skeptic's report as documentation and takes no review commits.

### `handbook/specs/conventions.md`

- **The comment sweep, bullet 2** (item 28): "Exclude the JSDoc kind range" names it, `FirstJSDocNode` to `LastJSDocNode`; "Strip Astro's markup comment form" becomes "Strip Astro's two comment forms, `<!-- -->` in the markup and `{/* */}` in an expression" (the tree holds both: four `.astro` files the first, `src/layouts/BaseLayout.astro` the second; the issue names only the second); the fixture list grows to "a changed identifier, string, regular-expression body or template literal, a dropped default argument or type annotation, a deleted CSS declaration, a changed selector, a dropped media query, and an edited Astro attribute, expression, style or script". No edit to "How a design decision is made" (the Issue #706 lane's section).

### `handbook/specs/settle-doctrine.md`, The environment

- **The ports bullet** (item 16) gains: "**The preflight is not a lock**: it catches a browser already holding the port, a stray or a lane still running, but two lanes started at the same moment on the same debug port can both pass it before either browser binds, so distinct port variables are what keep two local lanes apart."
- **New bullet** (item 17), narrowed to what Issue #368 measured: "**A popup opened at page load is refused whatever the origin, and the refusal leaves a blank tab that reads as success.** A probe opens one through `Runtime.evaluate` with `userGesture: true` or a real dispatched input event, then reads what the opened tab actually holds; anything else the browser gates on user activation is measured under a gesture the same way before its result is trusted."

### `handbook/specs/explorer-doctrine.md`, The engine boundary and the host contract

- **New bullet** (item 18), after the `rearmVoyage` bullet: "**The two hosts differ on purpose; do not re-unify them.** The Explorer keeps SPACE: it is static, its survey checkbox is one to one with the bare `survey` flag and arms through `rearmVoyage`, it publishes no time seams (`installHostHooks` in `src/site/shared/host-hooks.ts` is the Reading Room's alone; the Explorer installs `installExplorerHooks` in `src/site/explorer/hooks.ts`), and it never writes `year=N` itself, only forwarding a link that carries one (`forwardTarget` in `src/site/explorer/address.ts`, under the forwarding rule in "The address is a photograph" below). The Reading Room keeps TIME."
- **New bullet** (item 19): "**The Reading Room arrives at rest on every path.** A bare visit is the day's seed parked at the present with the journal fully told, `survey` rests at t=1, and `year=N` rests at that year; Play is the visitor's gesture. Every draw rearms through `rearmAges` with the deep link's key as a one-shot rest (`restFor` in `src/site/reading-room/app.ts`). Between the two hosts the room is the only writer of `year=N`, on park, on release and on boot convergence." (Scoped to the two hosts: the Prospect page writes `year=` into its own address, `yearHash` in `src/site/prospect/address.ts`.)

### `handbook/specs/ui-design.md`

- **Item 20, re-routed here from explorer-doctrine**: "A chart room" already carries the first half ("measured after the chrome has its text, or the fit reads an empty box"); the missing half joins that parenthetical: "and again once the fonts are ready and on every resize, which `bindRoom` in `src/site/shared/room.ts` wires".
- **Item 24**, folded into the existing last clause of "Sample the ground UNDER the ink" ("and make the guard model that same ground"): "and make the guard model that same ground and assert it, not only the ratio divided by it, since a walk up the ancestors' computed backgrounds cannot see a pseudo-element's paint under the text".
- **Item 25 (decision A)**, a new paragraph beside the focus ring: "**A refusing press dims by swapping its ground, never by opacity.** Opacity takes the face under the floor, where a cream ground under full-strength ink keeps it far above it (`.pc-lay.dim` in `public/living-chart.css` carries the measurement). The press stays pressable rather than `disabled`, so a keyboard reader still reaches it and hears why it refuses."
- **Length**: 395 lines today; items 20 and 24 add about 3 lines, item 25 about 5, so about 403 with item 25. The 400-line ceiling in the workspace rules is a code-file rule and nothing caps a spec, but no tracked markdown file is over 400 today, so the PR body names it.

### `handbook/specs/region-and-voyage.md`, The voyage

- **New bullet** (item 21), after the itinerary bullet: "**A reorder of the itinerary invalidates every per-leg number measured before it.** Which leg a fixture lands on, and that leg's length, flips and day, are functions of the order, so a per-leg claim is re-measured after any change to the tour, never carried forward; picking the leg on the metric the assertion reads is Gate 1 item 2's."

### `handbook/specs/chart-dress.md`

- **New paragraph** (item 22), after "The realm tint is ONE dress decision": "**Close realms differ before colour-vision separation does.** Up to `BASE_TINTS` realms each take their own tint. Past that, a realm's tint neighbours are the realms it borders OR whose centroid lies within `confusionDist` of its own, since two close island realms share no border (`tintNeighbours` and `realmTintIndices` in `src/render/realm-tints.ts`), and `pickTint` gives way in order: it drops the colour-vision constraint first, and falls back to the colour farthest away only when the neighbours between them hold every tint."
- **Item 31**, one clause folded into the river paragraph after "...when they are drawn.": "The label layers claim in the order they run, and that order IS their priority (`labelledLayers` in `src/render/map-renderer.ts`): the settlements claim before the feature labels, so a river's name yields to every settlement label as well, and a reorder moves labels wherever two claims collide." The incident (a crowded settlement column once starving the realm names) is history and stays out.

### `handbook/specs/engine-invariants.md`, Gates run before selection

- **New paragraph** (item 23): "**A new clue kind ships its whole kit**, or the guarantees above hold for every kind but it: its candidate and `holds` predicate (`src/world/daily-hunt-clue-facts.ts`); its place in the test-support mirror (`ALLOWED_KINDS` and `expectedClueText` in `test-support/daily-hunt-geometry.ts`) and its case in the independent geometry re-check (`checkClueGeometry` in `test/world/daily-hunt-clues.test.ts`); a drift-alarm entry there for every constant it mirrors; and, where its truth rests on what the chart draws, a findability gate the closed-gate test in that file covers and an e2e half beside `H11` and `H12` in `e2e/suites/hunt.ts`."

### `handbook/errata/` (outside `test/repo/prose-paths.test.ts`'s roots, so every path in these rows is checked by hand with `ls`)

- `site.md` (item 32, decision B): "PR #<this PR> (2026-10-02, high): After a bind the Print Room's DOM holds a second `h1`, the bound atlas's title in `header.atlas-head.print-only` (`renderBoundAtlas` in `src/site/print-room/bound-atlas.ts`, present since PR #211), against `handbook/specs/ui-design.md`'s "Exactly one `h1` per page"; each medium renders one, since `#pr-atlas` is `display: none` on screen and the room folio holding the room's `h1` is `display: none` in print once an atlas is bound (`public/print-room/index.css`), and the one-`h1` checks (RH0, the scaffold test) read the delivered page before any bind. Searched: "h1", "second h1", "bound atlas" across `handbook/errata/` and the open issues: only Issue #708." Under `## Open` or `## Ruled and left` per decision B; the PR number written after the PR opens, in a commit before the skeptic.
- `guards.md` (item 16's absence half): "PR #<this PR> (2026-10-02, medium): No test pins that `assertDebugPortFree` is called; it runs once, in `e2e/harness.ts`, and `test/e2e/ports.test.ts` covers only its conflict message. Searched: ..."
- `README.md` (item 34), a pointer beside "A review finding has exactly three exits": "A finding about the pull request's own work takes the second or third only on the terms `handbook/specs/development-workflow.md` step 15 sets." Its fold sentence is reconciled per decision C.

### Not changed

`CLAUDE.md` (no item needs it; its lines pointing at private memory for facts are by design; the Issue #706 lane edits it); `.github/PULL_REQUEST_TEMPLATE.md` (asks for a reason beside each unfixed finding, does not restate step 15); `handbook/specs/rulebook.md` (item 30 dropped); every file under `src/`, `e2e/`, `public/`.

## Dropped

- **Item 29** (a failed `deploy-pages` run is cleared by a fresh `deploy.yml` dispatch, not `gh run rerun`): a fast-changing platform trap, which the routing rule keeps out of the repo. Stays in memory.
- **Item 30** (no PDF or PNG byte check against Node either): a statement of what does not exist, which the conventions keep out of a spec, and its rule half is already the byte-compare bullet. Stays in memory.

## Rulings (Alex, 2026-10-02, relayed by the orchestrator)

- **A: (1)** item 25 goes into ui-design (about 403 lines; named in the PR body).
- **B: (1)** item 32's row goes under `## Ruled and left`, with the dated acceptance comment on Issue #659.
- **C: (2), not the recommendation.** An accessibility failure the PR caused is treated like any other self-caused problem: fixed in review, and it may be logged and left after the third round or when the fix needs Alex's decision. Every place that says "an accessibility failure is always fixed" is brought into line, each listed in the PR body. A grep (`git grep -n -i "accessib"` over `.claude`, `handbook/specs`, `CLAUDE.md`, `.github` and `handbook/errata/README.md`) finds two: Gate 5 item 7's "The exceptions that fold: an accessibility failure this PR itself caused, ..." and the errata README's "The one exception is the fold: a finding the PR fixes because it caused it (an accessibility failure of its own making) or because Alex ruled the batch folded." Both keep only the batch-fold exception, which governs sibling defects; step 15 carries no accessibility sentence.
- **D: (2)** one-sentence new lines, Gate 1 items 8 and 10 shortened with every rule kept, and the size guard pinned at 8,000, proved by `vellum-guard-prover`.

The decision texts as put to Alex follow, unchanged.

## Open decisions (Alex's, as put to him)

- **A. Item 25** (marked optional, not handed to the plan): land the refusing-press rule in ui-design, or leave it in the two CSS comments. Recommended: land.
- **B. Item 32's section.** Each medium renders one `h1`, so the defect lives only in the DOM. `## Open` (awaiting a fix) or `## Ruled and left` (accepted, his words quoted, and per the errata README the ruling also goes as a dated comment on Issue #659, the ledger's pointer issue, which this lane would post). Recommended: Ruled and left, if he accepts it.
- **C. Item 34 and the accessibility carve-out.** Gate 5 item 7 and the errata README make "an accessibility failure this PR itself caused" a must-fix. Item 34 makes every own-work finding a must-fix through round three, with an errata exit after it. Recommended: the accessibility failure keeps an absolute must-fix, no round-three exit.
- **D. The size of Gate 1** (limits and measurements under SKILL.md above). Gate 1 is 7,102 characters as pasted today. Options: (1) one-sentence new lines, about 8,470, plus a unit guard that fails when any gate's pasted note passes the confirmed 10,000; if the unconfirmed 8,000 cut applies, the last lines of Gate 1 are dropped today. (2) Option 1 plus rewriting the existing Gate 1 items 8 and 10 shorter with every rule kept, about 7,750, with the guard pinned at 8,000; headroom about 250, so the next Gate 1 line trips the guard and forces this choice again. (3) One-sentence lines and no guard; the gap gets a `handbook/errata/guards.md` row. (4) Route some candidates to held-lines instead, against the admission rule since each has its incident. Recommended: 2.

## Calls made (relayed for Alex to overrule)

- Item 10 re-routed from held-lines to Gate 1 item 10: the issue lets the admission rule decide, and recon found its own incident (Issue #551, PR #552).
- Item 20 re-routed to ui-design: one normative home; its first half already lives there.
- Item 16's "nothing pins the preflight" moved to a `handbook/errata/guards.md` row: a statement of absence, not a spec rule.
- Item 17 narrowed to the popup, the one case Issue #368 measured.
- Item 26 at step 10, scoped to tables and harnesses; item 27 across steps 10 and 6, kept out of conventions.md's design-round section.
- Items 29 and 30 dropped; item 31 landed as one folded clause; item 28 names both Astro comment forms, the issue naming only one.
- Item 14 cites Issue #520 as the issue body does, marked "recorded on Issue #708", since Issue #520 and PR #542 do not state the lesson.
- Item 15 promoted now, to Gate 2, though Issue #638 is open: it has its incident number; a collision is measured by a probe.
- Item 23 in engine-invariants, not Gate 4.
- Item 33 widened to `vellum-guard-prover.md` and `vellum-plate-reader.md`, the same pointer into private memory.
- Gate items folded or appended, never inserted; the `Scars:` lines left as they stand.
- held-lines: promoted lines stay word for word with a dated "Noted" line beneath, the file's own form.
- Item 32's row keyed to this PR, naming PR #211 as the `h1`'s origin.
- Dropped items get a line in the step-12 issue comment (the body) and a row in the PR body's table (the 01:46Z comment).

## Tests and the mutation that reds each

- **Decision D, options 1 and 2 only**: one test in `test/repo/footgun-gate.test.ts` that drives `decide` from `.claude/skills/vellum-footguns/hooks/footgun-gate.ts` with one payload per gate-injecting path (a test file edit, an e2e file edit, a new e2e suite file, a CSS edit, a render edit, a push, a PR body), each under a fresh session id and the longest realistic path, unlinking each session's state file (`statePath`) afterwards as the selftest's fixture loop does, so no state lands in the shared tmpdir, and asserts every returned `additionalContext` is at or under `HOOK_CONTEXT_LIMIT`, its value the cap (10,000 for option 1, 8,000 for option 2) with one dated line naming Claude Code 2.1.287 and where in it the value was read, since an internal constant can move either way without notice. Red first: written against today's SKILL.md with the limit set below Gate 1's current size, so it fails on the length assertion. Mutations that must red it: append the plan's first-draft Gate 1 lines (about 3,000 characters); drop the fresh session id (the once-a-session state swallows the gate, so the length reads 0 and must not pass vacuously, so the test also asserts each note is non-empty and carries its gate heading). `vellum-guard-prover` runs on it.
- Otherwise none: `test/repo/prose-paths.test.ts` is the instrument for every new backticked path under its roots, not a guard this PR adds.

## Evidence commands

- `node --test test/repo/prose-paths.test.ts`; `ls` for every path written under `handbook/errata/`.
- `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`; the gate-size measure re-run against the edited SKILL.md, numbers in the PR body.
- `npm run check`, `npm run lint`, `npm test` then `npm run astro:generate`.
- A grep for the em-dash character (U+2014) over `git diff origin/main` and over the PR body file finds nothing.
- Each cited symbol greps in its cited file, recorded in the PR body.
- `gh pr view <N> --json closingIssuesReferences` lists Issue #708 alone.
- No e2e: nothing a suite reads changes.

## Rosters and doctrine the change drags

- No new spec file, so no reading list moves.
- The disposition table (items 1 to 34) goes in the PR body and the final report, with what each landed item's memory line still holds that the repo does not.
- Step 12: one dated comment on Issue #708 before the PR opens: every call above, every ruling relayed, a line per dropped item, and that the step 10 edits leave the shared-stylesheet ruling as written.
- Step 14: the agent-definition disclosure.
- Merge with the Issue #706 lane: both edit `handbook/specs/conventions.md` (this PR only The comment sweep) and `references/held-lines.md` (this PR only the Gate 1 section); neither edits the other's lines. Issue #675 may later edit Gate 2 or `hooks/README.md`; it has no commits.

## Disposition table (planned)

| item | disposition | where | memory keeps (not carried) |
|---|---|---|---|
| 1 | landed | Gate 1 item 9; scars row | nothing |
| 2 | landed | Gate 1 item 3; scars second door; held-lines Noted | nothing |
| 3 | landed | Gate 1 item 17; scars row | the shape regexes it quoted |
| 4 | landed | Gate 1 item 18; scars row | nothing |
| 5 | landed | Gate 1 item 19; scars row | "a control that comes back vacuous is evidence about the oracle" |
| 6 | landed | Gate 1 item 11; scars row | nothing |
| 7 | landed | Gate 1 item 13; scars row | nothing |
| 8 | landed | Gate 1 item 13; scars row; held-lines Noted | nothing |
| 9 | landed | Gate 1 item 20; scars row | the pointer to the add-instruments memory |
| 10 | re-routed | Gate 1 item 10, not held-lines (own incident, Issue #551, PR #552); scars row | nothing |
| 11 | landed | Gate 2 item 8; scars row | "derive the new budget, say whether a check wants the instant or the settled result" |
| 12 | landed | Gate 2 item 4; scars row | nothing |
| 13 | landed | Gate 2 item 15; scars row | "three of five restored rows were that illusion" |
| 14 | landed | Gate 2 item 1 | nothing |
| 15 | landed | Gate 2 item 16; scars row | the TreeWalker recipe, "view a crop of every page", the Gallery at 347 (Issue #672) |
| 16 | landed | settle-doctrine ports bullet; guards.md row for the absence | nothing |
| 17 | landed (narrowed) | settle-doctrine, new bullet | the four other activation-gated APIs, unmeasured |
| 18 | landed | explorer-doctrine | "the element id is still `ages`"; Issue #317's ratification date |
| 19 | landed (scoped) | explorer-doctrine | e2e RR7/RR8; Issue #221's ratification and post-use review |
| 20 | re-routed | ui-design, the chart room (first half already there) | nothing |
| 21 | landed | region-and-voyage, The voyage | the W20b incident, Issues #184 and #275 |
| 22 | landed | chart-dress | nothing |
| 23 | landed | engine-invariants | nothing |
| 24 | landed | ui-design colour section | nothing |
| 25 | per decision A | ui-design colour section | the 2.755:1 and 9.895:1 measurements (the CSS comment holds them) |
| 26 | landed | development-workflow step 10 | the PR #283 and PR #277 examples |
| 27 | landed | development-workflow steps 10 and 6 | the Issue #443 numbers |
| 28 | landed | conventions, The comment sweep | `ts.createScanner`'s 11 false drifts (scars.md holds it) |
| 29 | dropped | fast-changing platform trap | all of it |
| 30 | dropped | statement of absence | all of it |
| 31 | landed | chart-dress river paragraph | the Issue #145 incident |
| 32 | landed | `handbook/errata/site.md`, section per decision B | nothing |
| 33 | landed | SKILL.md header, scars.md, two agent definitions | nothing |
| 34 | landed | development-workflow step 15; Gate 5 item 7, PR skeptic, implementer, errata README | nothing |
