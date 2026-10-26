# Plan for #589: settle-doctrine widens with the e2e environment section

Sub 4 of epic #585. Prose only. No `src/` change, no test change, no chart moves, no regen.
Recon ledger folded in (run 2026-09-13 on #589).

## Files touched

1. `specs/settle-doctrine.md` (two amendments in place, two or three appended clauses, one new section)
2. `CLAUDE.md` (two clause-level edits: the enumeration clause and the required-reading clause)

Nothing else. No test is added: nothing under `test/` reads `specs/` at all (`grep -rn "specs/" test/`
returns nothing), and the only mention of `CLAUDE.md` there is an explanatory comment at
`test/site/tip-affordance.test.ts:91`. Nothing mechanically pins this file's shape, which is why the
"clause numbers do not shift" rule is checked by a named command below rather than by a test.

## The design

### A. Amendments to existing numbered items (numbering does NOT shift)

**Item 8** today says what `waitSettled` proves and never what it keys on, nor that it is satisfied by
a draw the check did not ask for. Add both:

- **What it keys on**: an empty `#status`, `#verso-turn` NOT disabled, and a `#map svg` present
  (`waitSettled` in `scripts/e2e/harness.mjs`, whose own comment cites #199 for why the verso control
  carries the draw lifecycle). A new draw path therefore has to leave that control disabled at the
  START and re-enable it on BOTH the resolve and the catch path, and **the two failures are
  opposite**: a path that never disables it does not hang at all, it resolves at once on the draw
  before, which is the silent pass this amendment exists to warn about, while a path that fails to
  re-enable hangs every suite that waits. (Plan-skeptic finding 6; the original draft said both
  failures hang, which is wrong for the first.) The predicate dereferences `#verso-turn` unguarded,
  so on a page with no such element it THROWS rather than timing out, since `evaluate` raises on an
  exception in the page.
- **It resolves MID-turn.** A turn clears the status line immediately, so the settle is satisfied
  before the leaf lands; `waitTurned` in the same file is the companion that waits for the landing.
  The harness writes this down at the helper and the doctrine does not, which is the same omission as
  the rest of this amendment.
- **It resolves on any settled draw**, the page's own boot draw included, not on the draw this check
  asked for, so a check that clicks draw and then waits can be measuring the boot world. The repo
  already says this at the `INHERITS_HARNESS_PAGE` comment in `src/cli/e2e-suites.ts`; the doctrine
  is where a session looks for it before writing the wait.

Ledger rows: site 54i, site 70e.

**Item 9** today covers the stale document on a same-URL `Page.navigate`. Add the sibling it does not
cover:

- A hash-to-hash navigation on ONE path is a SAME-DOCUMENT navigation: the page does not re-boot at
  all, so a page that reads its address once at boot serves the old state and nothing throws.
- **No page in this repo installs a `hashchange` listener** (the repo-wide grep returns two hits and
  both are prose asserting the absence: `src/site/reading-room/app.ts:1` and
  `scripts/e2e/room-support.mjs:29`), so this is every page, not a subset.
- **Write the shipped idiom, not the generality**: re-bootstrap through `about:blank` and then the
  target URL, then poll for the boot committing (the Z13 idiom, named at
  `scripts/e2e/room-support.mjs:29` in `goto`, and used the same way by `goto` in
  `scripts/e2e/suite-room-drawer.mjs`).

Ledger rows: site 46f, site 54m. **Named departure from the issue's literal text**: the issue says
such a page "needs a cross-path navigation in an e2e", and the shipped idiom is narrower than that.
Recon backs the idiom. Relayed to Alex as a correction rather than taken silently.

### B. New clauses, appended after item 12 (ungated by the open decision)

The file has exactly 12 numbered clauses today (`grep -c "^[0-9]*\." specs/settle-doctrine.md`), so
these are 13 and 14.

**13. A stillness assertion in a fixture that crosses the ambient idle delay needs a tolerance sized
to the drift, not an epsilon.** The home stage starts drifting on its own once it has been idle
(`IDLE_DELAY_MS` and the drift constants in `src/site/home/drift.ts`), so a fixture long enough to
cross that delay is reading ambient motion, not a regression, and the amount is small enough to look
like float noise and large enough to fail an epsilon. The witness is already at the check:
`scripts/e2e/suite-landfall.mjs:532` records a slow CI run where the crossed delay moved the camera
between two reads, against a real pan that would have moved it by pixels. Cite the constant by
SYMBOL, never its value: the value is pinned at `test/site/landfall-stations.test.ts:174`, and this
sub's own acceptance forbids restating a measured timing away from its constant. Suites lengthening
is how a check that was safe when written starts crossing the delay without being edited.
Ledger row: landfall 21b.

**14. A suite leaves the browser in a known state for the next one.** The next suite in the lane
starts on whatever page is current and with whatever emulation the last one left on, and a suite that
reads the page it expects without navigating of its own goes red only in lane order and green alone.

- **The page is the suite's own duty**: the last navigation waits for readiness rather than returning
  mid-boot (`scripts/e2e/suite-room-drawer.mjs:198` states the rule at the line).
- **The viewport is the RUNNER's**, and bounded. `onSuiteError` in `scripts/e2e-explorer.mjs` races
  `clearMobile()` against a timeout on the error path, so a suite that stops early does not hand on
  its phone viewport. What a suite may not do is DEPEND on that reset: the race is bounded precisely
  because a browser that dies after the liveness probe would leave the send pending forever, and that
  is the path where the next suite does inherit the viewport. (Plan-skeptic finding 1: the first
  draft read the comment above the mitigation and reported the hazard the mitigation removed. The
  comment is there to justify the code under it.)

**Attribute a lane-order red by bisecting the order, not by reasoning about what the previous suite
left behind**: the guess made that way on PR #482 blamed a cleared viewport override and was
retracted; the un-awaited navigation was the cause, which is the half this clause's first bullet
covers. The selector is
`VELLUM_E2E_SUITES` (`E2E_SUITES_VAR` in `src/cli/e2e-suites.ts`), and the clause carries its two
traps or it sends the next builder straight into them: the lane runner REFUSES to start when that
variable is set, because the lanes are the selection (`ambientSelectionRefusal` in
`src/cli/e2e-lanes.ts`), so the bisect runs the serial script; and `resolveSuiteSelection` reorders
any selection into `E2E_SUITE_ORDER` and auto-adds `render` for a suite that inherits the harness
page, so an arbitrary order cannot be reproduced by asking for it.
Ledger row: landfall 30.

### C. The gated clause or amendment (Alex's ruling decides both the text and its SHAPE)

Clause 4 says a settle THROWS on timeout. Two ledger rows (landfall 38, landfall 58) pull the other
way. See "Open decisions" below. Clauses 13 and 14 are fixed whatever he rules, so nothing renumbers.

**The shape is his too, not a default of mine** (plan-skeptic finding 3). The issue's own stop reads
"before EDITING CLAUSE 4 or writing either new clause", so amending clause 4 in place is the option
it names first; a separate clause 15 would leave two clauses speaking about the throw, since half the
proposed reconciliation is clause 4 verbatim. Two consequences ride along and go on the menu rather
than being decided here:

- **Gate 2 item 6** in `.claude/skills/vellum-footguns/SKILL.md` states flatly that a settle "THROWS
  on timeout" and points at this spec. Under a ruling that blesses a non-throwing measurement poll,
  that gate line is no longer the whole rule. Nothing in the house resolves a skill-versus-spec
  conflict (CLAUDE.md's "the spec is right" governs CLAUDE.md only), so either this PR amends the
  gate line or #591 is told to.
- **A blessed measurement poll is invisible to the sweep that pins waits.**
  `test/repo/e2e-tiers.test.ts` seeds from `CTX_THROWING_WAITS` and asserts the harness hands out
  exactly the throwing waits it names, so a non-throwing poll is a category that sweep cannot see by
  construction. `waitReady` is that shape today, and the incident at
  `scripts/e2e/suite-room-drawer.mjs:44` is what an unpinned one costs.

**What recon found that the issue does not carry, and that should be in front of Alex:** the helper
already implements both halves of the proposed reconciliation. `makeSettle` in
`scripts/e2e/settle-support.mjs` hands the previous sample to the predicate (`settled(d, last)`) and
throws with the last read as the payload. So clause 4 and the two measurement rows are in conflict in
the PROSE only, not in the code. The two live first-non-null polls the measurement half is about are
check BR6c in `scripts/e2e/suite-broadside.mjs` and check PB1 in `scripts/e2e/suite-prospect.mjs`,
both of which assert off the sample where the element merely exists. The counterexample on the other
side is `waitReady` in `scripts/e2e/harness.mjs`, which returns `false` instead of throwing: of its
eleven call sites only two consume the result (`suite-render.mjs:8` and `suite-runninghead.mjs:338`),
and the incident where a suite burned its whole budget, discarded the false and passed is recorded at
`scripts/e2e/suite-room-drawer.mjs:44`.

### D. The new section, "The environment", at the end of the file after the numbered doctrine

Six items, **written as BULLETS, not as a second top-level ordered list** (plan-skeptic finding 5).
Every spec here carries at most one top-level ordered list, and a second one would make the
"clause numbers did not shift" check ambiguous: the guard command below has to be able to read the
numbered doctrine unambiguously. Each item states what the environment DOES, and points at the gate
where an imperative already exists rather than restating it.

1. **Focus is emulated for the whole run, best-effort.** The harness sends
   `Emulation.setFocusEmulationEnabled` once at start up (`scripts/e2e/harness.mjs`), inside a
   `try`/`catch` because a browser build may not support it. Without it `element.focus()` fires no
   real events and `:focus-visible` never applies, and nothing throws: the focus path silently does
   nothing. So a suite needs no call of its own unless it turned the emulation off, and a build that
   ignores the request degrades to exactly the silent no-op.
2. **The harness serves the BUILT site.** `scripts/e2e-explorer.mjs` serves `dist/`, with
   `VELLUM_SITE_DIR` as the override, and `dist/` does not exist in a fresh checkout. A change under
   `public/` is invisible to the suites until the build has run again. **Two causes put a run on a
   stale build, and this section ranks neither**: that one, and an orphaned browser still holding the
   debug port, whose conflict message in `src/cli/e2e-ports.ts` says in its own words that the run
   would report results from that browser's stale build instead of this one.
3. **A browserless run's meaning is decided by policy, not by luck.** `browserlessAction` in
   `src/cli/browser-policy.ts` fixes the precedence, and no prose carries it today:
   `VELLUM_REQUIRE_BROWSER` forces a FAIL and is checked first, so a contradictory pair resolves to
   fail; `VELLUM_ALLOW_NO_BROWSER` is the deliberate-skip hatch; `CI` fails; and with none of them set
   an interactive session SKIPS and an unattended one FAILS, which is what stops a cron, a piped run
   or a dispatched agent reporting a green e2e having exercised nothing. An empty string counts as
   unset. The other hatch the runner's own failure message names is `VELLUM_BROWSER`, a path to the
   binary when `findBrowser` (`src/cli/raster.ts`) cannot find one.
4. **Ports are overridable and the debug port is preflighted.** `resolveE2ePorts` in
   `src/cli/e2e-ports.ts` reads `VELLUM_E2E_PORT` and `VELLUM_E2E_DPORT`, which is what lets two local
   lanes run at once, and a bad value THROWS rather than falling back, because a silent fallback puts
   both lanes back on one port. The run does not BIND the debug port, it connects to it, so
   `assertDebugPortFree` (`scripts/e2e/harness.mjs`) preflights it once ABOVE the launch retry loop, a
   position that matters because a killed attempt does not release the port synchronously.
5. **A visual claim is carried by a control taken in the same run, never by a byte comparison.**
   Written to what the tree actually does (plan-skeptic finding 4 corrected the first draft, which
   welded the house term to the wrong mechanism): a claim about PAINT goes through the one-row pixel
   strip, because no hit test and no computed style can see paint (`sampleRow` and `luminance` in
   `scripts/e2e/pixel-support.mjs`, used by `suite-specimen`, `suite-runninghead`, `suite-broadside`
   and `suite-cluster`); a claim about an EMULATED condition carries a read of the other condition
   taken in the same run, which is what the suites call the same-run control (`suite-specimen`'s
   print checks read screen and print across one `Emulation.setEmulatedMedia` change); and a byte
   comparison of renders from two environments is never the check (`suite-survey.mjs`). **No suite
   compares one screenshot against another**, so the bullet does not say one does, and no cause for
   screenshot non-determinism is asserted, because no command here establishes one. The
   typing-moment imperative already exists as Gate 2 item 9 and this bullet points at it.
6. **The headless window has a minimum width clamp.** A window narrower than the clamp lays out at
   the clamp and the capture is cropped, which reads as an overflow bug that is not there. The route
   to a true narrow viewport is device-metric emulation (`setMobileViewport` and `clearMobile` around
   `Emulation.setDeviceMetricsOverride` in `scripts/e2e/harness.mjs`). Gate 3 item 3 already carries
   the typing-moment half ("`--window-size` does not set the layout viewport"), and so does
   `CLAUDE.md` itself at the plate-reader paragraph, so this bullet states the clamp and points
   there. **The figure is not asserted**: the only tracked record of it is a prose line in
   `.claude/agents/vellum-plate-reader.md`, and no command in this repo demonstrates the number.
   **This fact will then have three or four homes** (the new bullet, `CLAUDE.md`, the plate-reader
   agent file, Gate 3 item 3), which is the duplication the epic's routing rule exists to stop and is
   on the menu rather than settled here.

Ledger rows: core 43a, 43c, 47, 48, 55a, 55b.

Issue and PR numbers cited in the new text, each checked with `gh api` in this worktree: #338 (the
browserless policy), #339 (the ports and the preflight), #199 (why the settle keys on the verso
control), PR #482 (the retracted lane-order guess), plus #496 and PR #500 only if the gated clause
lands.

## What the file will NOT carry

- **No counts in ADDED lines**: no suite count, no page count, no pixel percentage, no call-site
  count. The guard is scoped to added lines because clause 10 already carries a runner factor in
  untouched text, and a whole-file numeric sweep would trip on it and tempt a weakened guard.
- **No measured timings or figures that belong at their constants**: the idle delay, the drift
  amplitude, the readiness budget, the port defaults and the width clamp are named by symbol or
  described, never transcribed.
- **No home paths, no temporary-directory examples, no token scopes, no personal name but Alex.**
- **No em-dashes.** Both files are at zero today (`grep -c` on each).
- Nothing that restates a gate imperative rather than pointing at it.
- No `specs/ui-design.md` edit (Sub 5), no gate edit (Sub 6), no e2e suite added or edited.

## The CLAUDE.md edit, confined to two clauses

Both edits are anchored on the CLAUSE TEXT, never on a line number: #593 has already merged and the
numbers have moved (see the merge-position paragraph). The two clauses are:

- **The enumeration clause**: "`specs/settle-doctrine.md` is how an e2e wait is written, ratified
  across #526 and #529 and pointed at by the footguns skill's Gate 2;". Widen "how an e2e wait is
  written" to cover what the harness environment does as well. The neighbouring clauses are untouched
  and NOT rewrapped. Note the attribution inside the same clause ("ratified across #526 and #529")
  does not cover the new section, whose basis is #585 and #589; whether it is extended is on the menu
  (plan-skeptic finding 7).
- **The required-reading clause**: "`specs/settle-doctrine.md` before any work that writes an e2e
  wait, settle, or CDP probe." Widen the trigger to include work that reads a screenshot, a focus
  state or a narrow viewport in the harness.

The same question applies inside the spec: its own provenance line at the head names #526 and #529
and the PRs they landed in, and says the doctrine is written down "because it lives only in issue
comments". The environment section does not come from there. One line, on the menu.

Recon marks the issue's header line ("one sentence of `CLAUDE.md`") STALE-cosmetic against its own
Acceptance paragraph, which asks for both. No new file joins the enumeration, so this lane takes no
slot in the numeric insertion order.

**Merge position.** The collision set is larger than #589's body says: the epic comment of
2026-09-14 split the Explorer doctrine in two, so PR #596 inserts TWO clauses into those same two
sentences and `site-architecture` (#588) takes the FOURTH slot. **Repo state as of this writing**:
PR #593 is MERGED and `origin/main` is at 9d2d721, PR #596 is open, #588 has no PR. This worktree is
behind, so `specs/engine-invariants.md` is absent here; the settle clauses are byte-identical at
9d2d721 with the engine-invariants clause inserted ahead of them in both halves, so the text-anchored
edit survives untouched. The prescribed action is unchanged:
this lane may write now, must not merge before #588, and brings the branch current with
`git merge origin/main` and re-reads both clauses as they then stand before making the edit. The edit
is anchored on the clause text, never on a line number.

## Rosters and doctrine this change drags

`grep -rl settle-doctrine` over the repo returns five files. Four describe the doctrine in the words
this sub widens, and recon confirmed against #590's body AND both its comments that Sub 5 takes those
lists only to ADD the new spec files, never to widen the settle description:

- `specs/rulebook.md:23` ("`settle-doctrine.md` how an e2e wait is written")
- `specs/rulebook.md:336` (the same phrase in the companion footer)
- `specs/development-workflow.md:38` (the required-reading trigger at step 3)
- `.claude/agents/vellum-implementer.md:17` (the required-reading list a dispatched lane actually
  reads, which is the one that decides whether a lane ever learns the environment section exists)

`.claude/skills/vellum-footguns/SKILL.md:85` is a pointer from Gate 2 about the throw and the step. It
describes no scope and needs nothing TODAY, and needs something under one of the clause-4 rulings
(section C above).

**The grep missed the file that matters most** (plan-skeptic finding 2): it finds only files that
already name the doctrine. `.claude/agents/vellum-plate-reader.md` names `specs/` ZERO times, and its
own traps section already carries four of this section's six environment facts (the focus no-op, the
width clamp, never byte-comparing across environments, and build-then-serve-`dist/`). The widened
required-reading trigger, "work that reads a screenshot, a focus state or a narrow viewport in the
harness", is a description of that agent's entire job, and **no command in this repo settles whether
a dispatched subagent is handed the project `CLAUDE.md` at all**, so the widened trigger may never
reach it. `CLAUDE.md` itself also carries the clamp fact in its plate-reader paragraph.

Whether this PR widens those files is Alex's call, not one this lane makes silently.

## Evidence, every claim with a command

Before the push:
- `grep -rn "—" specs/settle-doctrine.md CLAUDE.md` returns nothing (both are at zero today).
- `grep -nE "/Users/|~/|/var/folders|gh auth|scope" specs/settle-doctrine.md` returns nothing
  (public-safety sweep; the source rows are per-machine).
- `grep -nE "^[0-9]+\." specs/settle-doctrine.md` before and after: items 1 to 12 keep their numbers
  and only 13 onward are new. This is why the environment section is bullets: a second top-level
  ordered list would make that command unreadable as a guard.
- `git diff -U0 specs/settle-doctrine.md | grep "^+"` piped through the count and public-safety
  sweeps, so those guards read ADDED lines only.
- `git diff --stat` shows exactly two files.
- Every symbol re-verified at its file before it lands: `waitSettled`, `waitReady`,
  `assertDebugPortFree`, `setMobileViewport`, `clearMobile` and
  `Emulation.setFocusEmulationEnabled` in `scripts/e2e/harness.mjs`; `makeSettle` in
  `scripts/e2e/settle-support.mjs`; the Z13 `goto` in `scripts/e2e/room-support.mjs`; `sampleRow` and
  `luminance` in `scripts/e2e/pixel-support.mjs`; `browserlessAction` in `src/cli/browser-policy.ts`;
  `findBrowser` in `src/cli/raster.ts`; `resolveE2ePorts`, the two port variables and
  `debugPortConflictMessage` in `src/cli/e2e-ports.ts`; `E2E_SUITES_VAR`, `resolveSuiteSelection` and
  `INHERITS_HARNESS_PAGE` in `src/cli/e2e-suites.ts`; `ambientSelectionRefusal` in
  `src/cli/e2e-lanes.ts`; `IDLE_DELAY_MS` in `src/site/home/drift.ts`; `VELLUM_SITE_DIR` and the
  `dist/` root in `scripts/e2e-explorer.mjs`.
- `npm run check` green.
- `npm test` green, then `npm run astro:generate` to restore the generated assets under `public/` that
  the test run deletes without git reporting it.
- **No e2e suite is run**, because this sub changes no suite and no product code. The PR body says
  that in those words rather than implying a sweep.

## To name in the PR body, not to fix here

- `scripts/e2e/suite-specimen.mjs` toggles focus emulation off and never restores it, while the same
  suite uses a `finally` for emulated media and script execution. It cannot bite today: `canonicalise`
  in `src/cli/e2e-suites.ts` filters every selection through `E2E_SUITE_ORDER` and `specimen` is last
  there, last in `SMOKE_SUITES` and last in its lane, so nothing can run after it. Latent and
  unreachable, and the concrete example clause 14 is generalising. Fixing it is a `scripts/e2e` change
  this sub forbids.
- Clause 12 of the doctrine tells a session to leave a PR comment on a flake and never names
  `specs/flake-record.md`, which shipped three commits ago in #581 and which Gate 2 item 10 now
  requires a row in before a re-run. Out of this sub's stated scope and #590 owns that file; named so
  it is not lost.

## Process

- `vellum-spec-recon` on #589: done, ledger folded in above.
- `vellum-plan-skeptic` on this plan with recon's ledger, then STOP for Alex's ruling through the
  dispatcher.
- No new guard, so no `vellum-guard-prover`. Deliverable is not an appearance, so no
  `vellum-plate-reader`.
- A dated comment on #589 records the relayed rulings and every call the issue did not rule on,
  before the PR opens.
- `vellum-pr-skeptic` cold after the push, prompted with the PR number and nothing else.
- Turning the moved memory rows into pointers is the orchestrator's step after merge, not this lane's.

## Open decisions for Alex

1. The clause 4 contradiction (carried by the issue), including the SHAPE (amend clause 4 in place
   against a new clause 15), the Gate 2 item 6 consequence, and whether a blessed measurement poll
   joins a roster or is left unpinned.
2. Whether the sibling descriptions of the doctrine are widened in this PR or left: the four that
   name it, plus `.claude/agents/vellum-plate-reader.md`, which does not name `specs/` at all and
   whose job the widened trigger describes.
3. The width-clamp figure and the screenshot non-determinism cause: state them as the issue words
   them, or state the rule without the number and the unproven cause.
4. "The single most reproducible cause of a suite that tests yesterday's build": the issue asks for a
   ranking no command supports, and a second cause of equal standing exists.
5. The provenance lines, in the spec head and inside the CLAUDE.md clause, which name only #526 and
   #529.

Also relayed, not asked as questions: the issue's stop arguably covered clauses 13 and 14 as well as
clause 4 (its "New clauses" section enumerates exactly those two), and this plan treats them as
ungated because Alex's ruling cannot change their text. And the item 9 idiom is narrower than the
issue's words.
