# Vellum: Project Instructions

Procedural fantasy-atlas generator (TypeScript, Node 24+ native type-stripping; the engine
tree has no runtime deps, the site carries three d3 ones, see "Zero runtime dependencies"
below). Working context lives in `RESUME-HERE.md` (start here) and
`session-notes/SESSION-NOTES.md` (history; its rotated `SESSION-NOTES-ARCHIVE-*`
files sit beside it in `session-notes/`, moved off the repo root 2026-07-31),
both gitignored. **Durable facts and gotchas live in auto-memory, split across
THREE linked files** (it outgrew one Read on 2026-07-24): `project_vellum.md` is the core
(identity, the golden / re-roll contract, engine + render gotchas, process),
`project_vellum_site.md` is the delivery layer (pages, shell, bundles, CI, deploy), and
`project_vellum_livingchart.md` is everything the Explorer animates (Glass zoom, region
worlds, overlays, the voyage). Read the core plus whichever companion your work touches.
The live PLAN is the private GitHub Project "Vellum Roadmap"
(`gh project item-list 1 --owner ahl-gram`); its durable sequencing RULES are pinned issue
#193. **The `roadmap/` dir is DELETED (2026-07-24)** and there is no local plan file: the
Project is the plan and #193 is the rulebook. Its three files were superseded drafts, and
two had gone dangerous (the archive still named checksum `2890117437` and a `{#80, #93}`
flight-exclusion set; `ROADMAP.md` still said to run `npm run site`). If you ever need them
they are frozen in the claude-config backup at `home/CodeProjects/Vellum/roadmap/`.

These refine the workspace rules in `~/CodeProjects/CLAUDE.md` for this project specifically.

## What is tracked, and who this file assumes

**This file is TRACKED in the repo as of 2026-08-08** (it was local-only before, backed up out of
band). It is project instructions, so it belongs with the project. `RESUME-HERE.md`, `session-notes/`
and `.claude/settings.local.json` stay gitignored: those are per-session state and personal
settings, not instructions. `.claude/agents/` is tracked.

Because it is tracked, **editing it now costs a branch and a PR** like any other tracked file (main
requires both CI checks and enforces them for admins). Budget for that before adding a rule
mid-session.

**If you are not Alex, several things this file points at are not yours to read**: the auto-memory
files, the private "Vellum Roadmap" GitHub Project, the claude-config backup, the workspace rules at
`~/CodeProjects/CLAUDE.md`, and the gitignored `RESUME-HERE.md` and `session-notes/`. Skip those and
use the repo itself plus the GitHub issues, which are public and carry the ratified decisions. The
engineering rules below (goldens and regens, measure before you assert, read the issue before you
build, test-first) stand on their own and are the part worth having.

## Session handoff: keep the roadmap Project current

The live roadmap is the private GitHub Project "Vellum Roadmap" (project number 1 under
`ahl-gram`), grouped by a single-select "Roadmap" field. **Read the phase options from the board,
never from here**: `gh project field-list 1 --owner ahl-gram`. This file used to carry a copy of
the list as a convenience and it went stale TWICE (missing four options for weeks, then two more),
which is the same failure that retired the workspace's `PROJECTS.md` in 2026-08. A copy that costs
a PR to update and sits beside the command that replaces it earns nothing. At every handoff, keep
the board current with `gh`: newly filed issues get added and phased; shipped issues get closed.
The global `session-handoff` skill updates SESSION-NOTES (here at
`session-notes/SESSION-NOTES.md`, not the repo root), RESUME-HERE, and auto-memory
but does NOT know about the Project, so this is the Vellum-specific extra step. The durable
sequencing RULES (golden flight-exclusion, land-regens-alone, the cost axis, cross-epic
coordination) live in pinned issue #193, and **#193 is the one issue here whose BODY is
normative**: it is the complete current rulebook, its comments are history and never
authoritative, and new information goes INTO the body. Keep it fresh, editing the body for a
corrected fact as readily as for a changed rule. Before this was inverted on 2026-08-17 that
issue carried seventy percent of its content in comments, and two separate sessions read the
body, restated a rule three comments had already amended, and each labelled the sweep "no rule
changed".

`gh project` needs the `project` token scope (`gh auth refresh -s project`). Read the plan at
session start with `gh project item-list 1 --owner ahl-gram`, or open the Project in the browser.
Adding + phasing an item: `gh project item-add 1 --owner ahl-gram --url <issue-url> --format json`
gives the item id. The project, field and phase-option ids are NOT written down here (the board is
private, this file is public); look them up once per session, they are stable:

```
gh project view 1 --owner ahl-gram --format json           # .id -> the project id
gh project field-list 1 --owner ahl-gram --format json     # the "Roadmap" field's .id, and its
                                                           # .options[].id for each phase
gh project item-edit --id <item> --project-id <project-id> \
  --field-id <field-id> --single-select-option-id <phase-option-id>
```

## Bold delight is welcome: relax "touch only what you're asked"

The workspace non-negotiable "touch only what you're asked to touch" is **relaxed here when a
change adds fun or delight to the user experience**: the charts, the Explorer, the site, the
generated worlds. If you spot a chance to make the output more beautiful, more surprising, or
more polished, take it: go **bold** rather than minimal.

The one requirement: **flag it clearly for Alex's follow-up** so he is aware of what changed and
why, especially when it was not asked for. Call it out explicitly in your reply (do not bury it).

This relaxes scope-minimalism ONLY. It does NOT relax correctness, determinism, the golden /
re-roll discipline, the test-first requirement, or security. Delight that breaks the byte-identity
contract or skips tests is not delight.

## "Zero runtime dependencies" describes the present, it is not a constraint

**The present already moved.** `dependencies` in package.json holds `d3-zoom`,
`d3-selection` and `d3-transition`, taken on for the Surveyor's Glass and bundled into the
site by Vite (#163, then #208). What remains true is the narrower claim the README now makes
(rewritten at Sub 6, #207): the **engine** tree that Node runs directly has no runtime deps,
while the **site** takes them where they earn their keep. Neither half is a design goal or a
rule to preserve; both are just descriptions of where things stand. When you design or
build something, treat an external dependency like any other choice: reach for a good,
well-maintained library when it genuinely helps, weighed on its own merits in normal review
(bundle size, supply-chain surface, and the "Node runs the TypeScript directly, no build step"
property it might cost). Do NOT reject or contort a design just to keep the dependency count at
zero, and do not present zero-dep as a requirement it is not. If a dependency is the right tool,
propose it plainly with its tradeoffs and let Alex decide.

## One language, one pipeline (post-#260)

New code is **TypeScript under `src/`**, covered by `npm run check`, and reaches the browser
only through the existing build (the Vite press bundles `src/site/` + engine; Node runs the
engine/CLI/scripts natively). Do NOT add `.js` files outside `src/`: `public/` is static
assets only (goldens, fonts, CSS, favicon), and a hand-authored script anywhere else needs a
very good, stated reason (record it in the issue or a comment at the file head). The one
grandfathered corner is the e2e harness and suites (`scripts/e2e/*.mjs`); new suites may match
their siblings, but that convention does not extend anywhere else.

## Charts, goldens, and regens

`public/charts/chart-42-*.svg`, `public/charts/arms-42-*.svg` and `public/og.png` are
**committed** content (the homepage embeds them). Everything else generated (`public/atlas/`,
`public/gallery/`, the bundle twins + chunks) is gitignored and rebuilt per deploy. (docs/
retired at Sub 5 #206; the tsc engine emit retired at Sub 9 #260, its clean-list entry is a
tombstone; app source is TypeScript in src/site/.)

- A **render change that moves any label or path owes a regen**: `npm run charts:regen` + `npm run og` (since Sub 4 #205). charts:regen single-writes public/charts; og writes public/og.png.
- **Verify a regen by diffing the committed charts old-vs-new** (snapshot them first). The #40
  hero drift guard compares a fresh render against the committed one, so after a regen it is
  **circular** and proves nothing. A good regen is small and explicable: name the labels that moved.
- **Land a regen ALONE.** Bundled with any other chart-changing work, a chart delta cannot be
  attributed to a cause, and the diff is the only non-circular check you have.
- **NEVER byte-compare SVGs rendered in different environments** (across OS, or across Node
  versions, Node-to-Node included). `Math.sin/cos/atan2` are not correctly rounded, so coordinates
  drift ~1e-13 and a 2-decimal rounding boundary can flip. Compare structure exactly, numbers with a
  tolerance. A naive byte compare passes on a Mac and fails on linux CI.
- A **seed re-roll** (terrain reshape, culture/name-template edits) is a different, larger cost: it
  changes world identity and re-pins the golden checksum. Only one re-roll may be in flight at a time.

## Measure before you assert

Numbers in this project are cheap to compute and easy to get wrong. Every wrong number so far was
caught by a prediction failing to match data, never by a test.

- **Before writing a number down, sanity-check it against a prediction.** If every seed yields an
  identical count, if a ship sails over dry land, if two labels "overlap" without touching: the
  measurement is broken, not the world.
- **Before writing any world-analysis scratch script, read these three traps.** Each has already
  produced a confident wrong analysis, and the reason they are worth stating here rather than
  leaving to review is that **none of them throws**: you get a plausible number instead of an
  error, so nothing downstream tells you the measurement was broken.
  - **Argument order: the seed comes FIRST.** Build a world with `defaultRecipe(seed, overrides)`
    from `src/world/generate.ts`. The old `recipeForCommand(command, seed, ...)` took the COMMAND
    first and was deleted at #138, so a script copied from that era calling `recipeForCommand(42)`
    silently generates the DEFAULT world. The tell is that every "seed" yields identical counts.
  - **Chart space is not grid space.** `PlaceMark.nx/ny` (`buildPlaceManifest` in
    `src/render/place-manifest.ts`) are 0..1 fractions of the RENDERED chart, with the frame margin
    baked in (`MARGIN_FRACTION` in `src/render/transform.ts`, 0.045). They cannot be used to sample
    terrain. For that use `world.settlements[i].x/y`, which is grid space; the projection is affine.
  - **A `Field` is not a `Float64Array`.** `world.elev` is a `Field` (`Field` in `src/core/grid.ts`)
    and is read with `.at(x, y)`. `world.oceanDist` is a bare `Float64Array`, indexed `y * W + x`.
    Calling `.at(x, y)` on the latter silently resolves to `TypedArray.at(x)`, which ignores the
    second argument and returns an unrelated cell.
- **The chart number IS the seed** (`cartouche.ts:146`), so any screenshot identifies its world
  exactly. Reproduce before theorising.

**Check rather than reason.** The same discipline governs claims about the REPO and the TOOLING, not
just numbers. A claim that sounds like architecture ("comments are not on the read path", "that
helper lives in `shared/`", "no test enforces this") is a fact with a command behind it, and the
command is almost always one line. Reasoning that feels airtight is not evidence, and the cost of
being wrong is not a bad number, it is a confident recommendation built on sand.

- **Your own tool call is not evidence about the system.** The 2026-07-25 miss: `gh api
  repos/ahl-gram/Vellum/issues/N` was used to read six issue bodies, no comment came back, and that
  hardened into "a future session will never see a comment, so corrections must be edited into the
  bodies." Comments are simply a different endpoint. They are read here routinely: **#202 carries a
  25,872-character ratified decision doc as a COMMENT**, and `test/site/astro-scaffold.test.ts`
  names that comment as its spec. An entire recommendation rested on the shape of one query that
  never asked. One `gh api .../issues/N/comments` would have ended it.
- **Auto-memory is a pointer, not a citation.** In the same session `hash-sync.ts` was handed to six
  subagents as `src/site/shared/`; it is `src/site/explorer/`. Memory recorded the filename and the
  directory got filled in by inference. Before writing a path, `ls` it.
- **The tell is confidence with no command behind it.** Before asserting what a tool returns, where
  a file lives, what a test enforces, or what a future session will see, name the command whose
  output you actually read. If you cannot name one, you are reasoning, and the fix is to go run it.
- **It pays in both directions.** The same pass rejected a subagent's claim that the 400-line file
  guideline had disappeared (it is in `.claude/rules/coding-style.md`, not this file) and its count
  of 7 `window.__vellum*` hooks (there are 12). Both would otherwise have shipped into a planning
  document as fact.
- **A claim about your own work is a claim like any other.** "Delivered", "one line", "that will
  be fast" are predictions, and they are the ones no command ever gets run against. Before
  reporting a feature done, name the command whose green output says so; before sizing a fix, make
  the edit or read the call sites. When you must state something you have not run, prefix it
  UNVERIFIED, which is you saying you did not check, not spec-recon's UNVERIFIABLE, which is no
  command being able to settle it.

## Read the issue before you build

Epics and their subs carry their ratified decisions, architecture, and gotchas **in the issue
itself**, not in this file and not in the roadmap. Read the epic, then the sub, before writing code.

**"The issue" means the body AND its comments, and the comments usually win.** A ratified decision
doc or a re-baseline is routinely posted as a COMMENT, with the body deliberately left as written so
the original intent survives. **The body will typically not tell you that comment exists.** #203's
body never mentions one, yet the spec that sub was built and tested against is the 2026-07-21
comment on #202 (25,872 characters), which `test/site/astro-scaffold.test.ts:12` names as its spec.
The Reading Room works the same way: the 2026-07-25 re-baseline, correcting 73 stale claims across
#190 and its five subs, exists ONLY as comments.

So fetch both, every time. Newest ratified statement wins, and **when a comment and the body
disagree the comment supersedes** unless it says otherwise. That is the whole point of the
convention: a body written before a big epic landed is historical intent, not current fact.

**The one exception is the rulebook, #193**, where this is inverted: its body is normative and
its comments are history. Do not read #193's comments to learn the rules, and put anything new
into its body. Its own body says so at the top; see the handoff section above.

```
gh api repos/ahl-gram/Vellum/issues/N            # the body
gh api repos/ahl-gram/Vellum/issues/N/comments   # decisions, ratifications, re-baselines
```

**`gh issue view N` silently returns EMPTY for some issues here** (exit 0, no output), which is why
both of those are the `api` form. Never conclude an issue is empty from `gh issue view`.

**Remind Alex of any open decision in an issue and get his call before implementing it.**

**Run the `vellum-spec-recon` subagent at the start of any sub or epic.** It fetches body AND comments,
verifies every cited path, symbol, test name and count with a command, and returns a
CURRENT / STALE / UNVERIFIABLE ledger plus the open decisions awaiting Alex. It exists because
#132 (6 of 7 subs stale) and #190 (73 stale claims, 20 blocking) each cost a 12 to 13-agent
audit built from scratch.

## Thresholds and test guards

A bound taken from one run is a bound that fits one machine. Neither rule here is new practice; they
are written down because nothing said so, and a session that reinvents them reinvents them smaller.

- **A threshold is measured over the space, not taken from a run.** Sweep the seeds, record the
  worst case actually observed, and set the bound above it with the headroom named. Do not fix a
  sample size in advance, and treat any handful of local runs as the shape that passes on a Mac and
  flakes on linux CI: the chord bound in `test/render/voyage-route.test.ts` is pinned against a
  worst case measured over seeds 1..40, and the fixture in
  `test/terrain/heightfield-detail.test.ts` swept seeds 1-120 to find its single witness.
- **The provenance goes in ONE line at the constant**, dated, naming the range swept and the worst
  case. This is the "no test can practically pin it" carve-out of the comment rule below, not an
  exemption from it: a wrapped block listing individual runs is the exact tell that rule names.
- **A guard proves it can fail; a scanner proves which way it errs.** A guard that could pass
  vacuously carries the witness that makes it bite, named at the test (`heightfield-detail.test.ts`
  keeps the one seed of 120 that does). A scanner cannot enumerate its own blind spots, so it names
  them and argues the direction instead: `test/repo/comment-citations.test.ts` reads a `//` inside a
  string literal as a comment and says so, because that costs a false positive at worst and never a
  miss. An unnamed blind spot with no direction argued is the bug.

## Process

- Feature -> branch -> PR. **Alex reviews and merges**; do not merge for him.
- **When asking Alex to make an open decision** (on a feature, a bug, a test, anything else),
  explain the context and what you need from him in simple terms, so he can have a good
  understanding of what he is deciding: no jargon, no overly technical language, no acronyms.
- **Write the failing test first.** It must fail on the assertion you care about, not on a missing
  module.
- **Run the `vellum-guard-prover` subagent on new or strengthened guards before opening the PR.** It
  mutates one behavior at a time in its own throwaway worktree and reports which single test went
  red. A green suite is not evidence: #73's fork mutant escaped all 340 tests, #141's gate mutation
  escaped all 409, and #140 shipped three guards that were deletable. Zero red is a hole, not a pass.
  A guard you cannot make bite is not a weak guard, it is an absent one: delete it rather than ship it.
- **Run the `vellum-pr-skeptic` subagent on every PR after it is pushed, before asking Alex to review.**
  Dispatch it COLD: the prompt is the PR number or branch name and NOTHING else, no summary of the
  work and no claims about it. It is agnostic (a fresh context that reconstructs the spec from the
  issue and the diff, never from the implementing session) and adversarial (it returns ranked
  findings or a documented failed attack, never approval). It is read-only and never posts to
  GitHub; relay its report in your reply and let Alex decide what lands on the PR.
- **No em-dashes** in issue bodies, PR bodies, published copy, or new code comments.
- **Comments are the exception, not the rule.** A behavior a test already pins needs no comment:
  the test is the record, delete the prose. A local invariant (byte-identity, an ordering
  contract) earns a test first; only when no test can practically pin it (cross-platform float
  drift, hand-measured browser quirks) does it keep a single-line comment at the line that breaks.
  **NO test enforces this** (#384 built one and withdrew it; see PR #385 for the design and the
  measurements if it is ever worth another try). `vellum-pr-skeptic` is the only gate, and it runs
  after the code is written, so the discipline at authoring time is still yours. The house writes a
  comment as ONE long line, not a wrapped block: a wrapped multi-line comment mid-file is the
  reliable tell that the prose is restating something a test already pins.

## Write visual samples to out/

Any chart, diagnostic overlay, before/after image, or other visual artifact you write to the
filesystem goes in the **`out/`** directory (the CLI's default output location; gitignored). That
is where Alex looks. Name the files in your reply so they are easy to open. Do not scatter samples
in `/tmp`, scratchpad, or other dirs he will not find.

**For a presentation sub, run the `vellum-plate-reader` subagent before the PR.** Structural tests cannot
see layout: #219's 320px sideways scroll survived 902 unit tests, 254 e2e checks and a 22-agent
review that found nothing. vellum-plate-reader renders through CDP and returns MEASUREMENTS (scrollWidth
vs clientWidth, resolved computed styles, bounding boxes) plus named files in `out/`, at both full
scale and 1:1 crop, since glance properties only exist at full scale (#75). It also carries the
traps: headless Brave `--window-size` does not set the layout viewport, so narrow-width checks
must go through CDP.
