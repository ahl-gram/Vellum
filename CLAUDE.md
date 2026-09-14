# Vellum: Project Instructions

Procedural fantasy-atlas generator (TypeScript, Node 24+ native type-stripping). Working context
lives in `RESUME-HERE.md` (start here) and `session-notes/SESSION-NOTES.md` (history), both
gitignored. **Durable facts and gotchas live in auto-memory**, split across `project_vellum.md` (the
core), `project_vellum_site.md` (the delivery layer), `project_vellum_livingchart.md` (everything the
Explorer animates) and `project_vellum_landfall.md` (the Landfall epic, #454): read the core plus
whichever companion your work touches. The live PLAN is the private GitHub Project "Vellum Roadmap"
(`gh project item-list 1 --owner ahl-gram`), and there is no local plan file.

**`specs/` holds the tracked, normative house specs, and unlike everything above they are public.**
None is summarized here; where this file and a spec disagree, the spec is right. Each is REQUIRED
READING before the work its row names.

| spec | what it holds | read it before |
|---|---|---|
| `specs/rulebook.md` | the sequencing rules, working agreements, and how a design decision gets made | any change touching the renderer, a committed chart, the golden, a regen, a seed, or the order of work |
| `specs/ui-design.md` | the look and feel itself: the ground, the type case, the palette by role, the chart's dress, the rooms, the voice, contrast, gesture, motion, and the cascade traps this codebase keeps hitting | any work whose deliverable is an appearance |
| `specs/engine-invariants.md` | what the generator guarantees about a world, what breaks those guarantees silently, and what a surface quoting generated output may not assume | any change to world generation, any surface that quotes it, and any script that measures a world |
| `specs/explorer-doctrine.md` | the living chart over the baked sheet: the engine boundary and what a host page owes it, the camera and gesture contracts, counter-scale, the overlay lifecycle | any work on the Explorer or on a chart camera, gesture or overlay |
| `specs/region-and-voyage.md` | its other half: what a region sheet may do that a world sheet may not, how a finer view is built and what it guarantees, how the voyage splits worker from client | any work on a region sheet, a level of detail, or the voyage |
| `specs/site-architecture.md` | how the site is authored, bundled, discovered and shipped: the page model, the rosters a page joins, what the build does to authored markup, the two forms that fail silently | adding or restructuring a page, a stylesheet, a bundle or an inlined script |
| `specs/development-workflow.md` | the order of operations from a filed issue to a pull request, which subagent runs at which step, and the one place the work stops for Alex's ruling | starting a sub or an epic, since its early steps are the ones a session cannot go back and take later |
| `specs/settle-doctrine.md` | how an e2e wait is written, and what the harness environment it runs in actually does | any e2e wait, settle or CDP probe, and any screenshot, focus state or narrow viewport read in the harness |

The ruled pixels those specs were decided from are archived under `design/`, one directory per design
round (`design/oracle/` is the odd one out: a screenshot sweep tool, not a sitting).

The rules below refine the workspace rules in `~/CodeProjects/CLAUDE.md` for this project.

## What is tracked, and who this file assumes

**This file is TRACKED in the repo.** `RESUME-HERE.md`, `session-notes/` and
`.claude/settings.local.json` stay gitignored: per-session state and personal settings, not
instructions. `.claude/agents/`, `.claude/skills/` and `.claude/settings.json` (the footgun hook) are
tracked. Because it is tracked, **editing it costs a branch and a PR** (main requires both CI checks
and enforces them for admins); budget for that before adding a rule mid-session.

**If you are not Alex, several things this file points at are not yours to read**: the auto-memory
files, the private roadmap Project, the claude-config backup, `~/CodeProjects/CLAUDE.md`, and the
gitignored `RESUME-HERE.md` and `session-notes/`. Skip those and use the repo plus the GitHub issues,
which are public and carry the ratified decisions. The rules below and the specs stand on their own.

## Session handoff: keep the roadmap Project current

The live roadmap is the private Project "Vellum Roadmap" (number 1 under `ahl-gram`), grouped by a
single-select "Roadmap" field. **Read the phase options from the board, never from here**. At every
handoff keep it current: newly filed issues added and phased, shipped issues closed. The global
`session-handoff` skill updates SESSION-NOTES (at `session-notes/SESSION-NOTES.md`, not the repo
root), RESUME-HERE and auto-memory but does NOT know about the Project, so this is the Vellum extra
step. **A rule change EDITS `specs/rulebook.md`** in a branch and a PR, as readily for a corrected
fact as for a changed rule, and may leave a dated comment on the originating issue as the audit trail.

`gh project` needs the `project` token scope (`gh auth refresh -s project`). The project, field and
phase-option ids are NOT written here (the board is private, this file is public); look them up once
per session, they are stable:

```
gh project item-list 1 --owner ahl-gram                    # the plan, at session start
gh project view 1 --owner ahl-gram --format json           # .id -> the project id
gh project field-list 1 --owner ahl-gram --format json     # "Roadmap" .id, and .options[].id per phase
gh project item-add 1 --owner ahl-gram --url <issue-url> --format json   # -> the item id
gh project item-edit --id <item> --project-id <project-id> \
  --field-id <field-id> --single-select-option-id <phase-option-id>
```

## Bold delight is welcome: relax "touch only what you're asked"

The workspace non-negotiable "touch only what you're asked to touch" is **relaxed here when a change
adds fun or delight to the user experience**: the charts, the Explorer, the site, the generated
worlds. If you spot a chance to make the output more beautiful, more surprising or more polished,
take it: go **bold** rather than minimal. The one requirement: **flag it clearly for Alex** in your
reply and in the PR body, never buried. This relaxes scope-minimalism ONLY, never correctness,
determinism, the golden and re-roll discipline, the test-first requirement, or security. Delight that
breaks the byte-identity contract or skips tests is not delight.

## Dependencies are a normal choice, not a constraint

The **engine** tree Node runs directly has no runtime deps; the **site** takes them where they earn
their keep, bundled by Vite (`dependencies` in package.json is the live list, so read it rather than a
copy). Neither half is a design goal. Weigh a dependency on its merits in normal review (bundle size,
supply-chain surface, and the "Node runs the TypeScript directly, no build step" property it might
cost). Do NOT reject or contort a design to keep the count at zero, and do not present zero-dep as a
requirement it is not. If a dependency is the right tool, propose it plainly and let Alex decide.

## One language, one pipeline

New code is **TypeScript under `src/`**, covered by `npm run check`, and reaches the browser only
through the existing build (the Vite press bundles `src/site/` + engine; Node runs the
engine/CLI/scripts natively). Do NOT add `.js` files outside `src/`: `public/` is static assets only
(goldens, fonts, CSS, the icons), and a hand-authored script anywhere else needs a very good, stated
reason, recorded in the issue or in a comment at the file head. The grandfathered corner is the e2e
harness and suites (`scripts/e2e/*.mjs`); new suites may match their siblings, and that convention
extends nowhere else.

## Measure before you assert

Numbers here are cheap to compute and easy to get wrong, and every wrong one so far was caught by a
prediction failing to match data, never by a test.

- **Sanity-check a number against a prediction before writing it down.** If every seed yields an
  identical count, if a ship sails over dry land, if two labels "overlap" without touching: the
  measurement is broken, not the world.
- **A script that measures a world reads `specs/engine-invariants.md` first**, for the traps that
  hand back a plausible wrong number instead of throwing.
- **The chart number IS the seed** (the `CHART №` line in `src/render/layers/cartouche.ts`), so any
  screenshot identifies its world exactly. Reproduce before theorising.

**Check rather than reason.** The same discipline governs claims about the repo and the tooling: a
claim that sounds like architecture ("that helper lives in `shared/`", "no test enforces this") is a
fact with a one-line command behind it.

- **Your own tool call is not evidence about the system.** A query that did not ask (the issue body
  endpoint, which carries no comments) settles nothing about what exists.
- **Auto-memory is a pointer, not a citation.** Before writing a path, `ls` it.
- **The tell is confidence with no command behind it.** Before asserting what a tool returns, where a
  file lives or what a test enforces, name the command whose output you read.
- **A claim about your own work is a claim like any other.** "Delivered", "one line", "that will be
  fast" are predictions. Name the command whose green output says so, and where you genuinely cannot
  run one, write UNVERIFIABLE, the word `vellum-spec-recon` uses. Do not coin a second one.

## Read the issue before you build

Epics and their subs carry their ratified decisions, architecture and gotchas **in the issue itself**,
not in this file and not in the roadmap. Read the epic, then the sub, before writing code.

**"The issue" means the body AND its comments, and the comments usually win.** A ratified decision doc
or a re-baseline is routinely posted as a COMMENT, with the body deliberately left as written so the
original intent survives, and **the body will typically not tell you that comment exists**. Fetch
both, every time; where a comment and the body disagree the comment supersedes unless it says
otherwise.

```
gh api repos/ahl-gram/Vellum/issues/N            # the body
gh api repos/ahl-gram/Vellum/issues/N/comments   # decisions, ratifications, re-baselines
```

**`gh issue view N` silently returns EMPTY for some issues here** (exit 0, no output), which is why
both are the `api` form. **The rulebook is not an issue at all**: it is `specs/rulebook.md`, and #193
is a pointer whose comments are history. **Remind Alex of any open decision and get his call before
implementing it**, and **run
`vellum-spec-recon` at the start of any sub or epic**: it verifies every cited path, symbol, test name
and count with a command and returns a CURRENT / STALE / UNVERIFIABLE ledger plus what awaits Alex.

## Process

**The gates, one skill: `vellum-footguns`** (`.claude/skills/vellum-footguns/SKILL.md`). Invoke it at
the moment you are about to write a test or guard, an e2e check or CDP probe, a CSS rule, anything
that joins a roster, anything that can move a chart or the golden, or a PR body. This file and the
specs are the narrative; the skill is the same doctrine as a checklist read at the moment it applies,
which is the difference that stopped the same defects reaching PR after PR. Its
`hooks/footgun-gate.ts`, wired in `.claude/settings.json`, puts the matching gate in front of you and
refuses the mechanical never-list items outright, the ones `hooks/README.md` enumerates.

**The order of operations is `specs/development-workflow.md`**, and it names which subagent runs at
which step: `vellum-spec-recon` at the start, `vellum-plan-skeptic` on the plan before the decisions
go to Alex, `vellum-guard-prover` on every new or strengthened guard before the PR,
`vellum-plate-reader` when the deliverable is an appearance, and `vellum-pr-skeptic` COLD on every
pushed PR. A review agent never posts to GitHub: relay its report in your reply and **let Alex decide
what lands on the PR**. `vellum-implementer` runs one issue through that sequence in its own tree.
Every project agent under `.claude/agents/` sets `effort: xhigh` in its frontmatter (Alex,
2026-09-13), because an agent without one inherits the session's level; the check is
`echo $CLAUDE_EFFORT` inside a dispatched agent, run from a session at some OTHER level, since a
session already at xhigh cannot tell the frontmatter from inheritance.

- Feature -> branch -> PR. **Alex reviews and merges**; do not merge for him unless he asks.
- **Write the failing test first.** It must fail on the assertion you care about, not on a missing
  module.
- **Zero red from the prover is a hole, not a pass.** A guard proved unable to bite is deleted rather
  than shipped; a mutation not reached inside the budget is unproven, and is named as such.
- **A guard proves it can fail; a scanner proves which way it errs.** A guard that could pass
  vacuously names the witness that makes it bite, at the test (`test/terrain/heightfield-detail.test.ts`
  keeps the one seed that does). A scanner cannot enumerate its own blind spots, so it names them and
  argues the direction instead, and an unnamed blind spot with no direction argued is the bug.
- **A bound is derived, and where no principle gives the number, sweep first and set it above the
  worst case with the headroom named.** Where a principle does give it, the principle IS the bound and
  the sweep only confirms it holds (`BOUND = RDP_EPSILON + 0.5` in `test/render/voyage-route.test.ts`
  is half-cell geometry). Do not fix a sample size in advance: a bound fitted to the
  samples you happened to take breaks on the next one, and a handful of local runs is the shape that
  passes on a Mac and flakes on linux CI. The provenance is ONE dated line at the constant naming the
  range swept and the worst case (`test/prospect/input.test.ts` carries the form), which is the
  comment rule's "no test can practically pin it" carve-out rather than an exemption from it.
- **When asking Alex to make an open decision**, explain it in plain words, no jargon and no acronyms,
  in an `AskUserQuestion` menu rather than in prose, and STOP there. A decision that is his is not one
  to default your way and mention afterwards. A dispatched `vellum-implementer` lane cannot reach him,
  so it hands the menu to its dispatcher at the same STOP.
- **No em-dashes** in issue bodies, PR bodies, published copy or new code comments.
- **Comments are the exception, not the rule.** A behavior a test pins needs no comment: the test is
  the record, delete the prose. A local invariant earns a test first; only where no test can
  practically pin it (cross-platform float drift, hand-measured browser quirks) does it keep a single
  line at the line that breaks. NO test enforces this (#384 built one and withdrew it; PR #385 holds
  the design and the measurements if it is ever worth another try) and `vellum-pr-skeptic` runs after
  the code is written, so the discipline at authoring time is yours. The house writes a comment as
  ONE long line: a wrapped block mid-file is the tell that the prose restates what a test pins.

## Worktrees

Worktrees live in `.claude/worktrees/`, which `.gitignore` ignores as a directory. Anywhere else is
NOT ignored, and `scripts/agent-sandbox.ts` assumes that location: it links `node_modules` three
levels up, which resolves only for a sandbox at `<root>/.claude/worktrees/<name>`. That script owns
the sandbox for both review agents that build one, so the depth lives in one place (#575).

- **EnterWorktree is the normal way in.** It branches from `origin/main` rather than local HEAD, so
  the tree is current without a pull. One thing needs fixing by hand: any `/` in the name becomes `+`,
  in the branch AND the directory, and the branch takes a `worktree-` prefix on top. Rename the branch
  before the first commit, or the PR carries the harness's name instead of yours.
- **`vellum-guard-prover` is the documented exception.** It must mutate the code under review, which
  is the DISPATCH tree's HEAD and not `origin/main`, so it builds its own detached worktree with
  `node scripts/agent-sandbox.ts create guard-<topic>-<round>`. Do not point it at harness isolation.
  `vellum-pr-skeptic` builds one for EVERY run (Alex, 2026-09-12): `npm test` deletes the generated
  assets under `public/` and neither `git status` nor `git status --ignored` reports it, so no
  reviewer runs a suite in a tree it does not own. It passes the sha explicitly, which that script
  requires of a `skeptic-*` sandbox.
- **`vellum-implementer` gets its worktree a third way**: `isolation: worktree` in its frontmatter, so
  the harness builds and locks one at dispatch. Inside such a tree, and inside any EnterWorktree tree,
  the harness is a fence: it refuses a compound command whose `cd` goes to a shell variable, any `git`
  run in a directory other than that worktree, and some quoted `jq` or `sed` constructs it cannot
  parse, while a plain single command passes (measured 2026-09-13). That is why the sandbox recipes
  take `create`'s printed path literally and read the sandbox's sha from its `.git` file.
- **A dispatched review agent may not move or restore the tree it was dispatched from**, normally your
  live worktree. Commit before you dispatch one: `git restore` and `git checkout -- <path>` discard
  without leaving a reflog entry, so there is nothing to recover from afterwards.
- **Never remove the worktree the session is standing in.** Name it for Alex and leave it; the shell
  recovers to the parent when a worktree vanishes underneath it, but the cwd is lost mid-task.
- **Do not switch worktrees while a dispatched agent is still running.** `EnterWorktree` and
  `ExitWorktree` in the parent silently disable that agent's commands for the rest of its life, and
  it goes on reporting what it can rather than failing, so the loss reaches you as a thin report and
  not as an error. Wait for the agent before you move. No command here demonstrates the mechanism, so
  treat the instruction as the rule and the cause as unverified.
- **Other sessions hold their own worktrees here.** Leave them alone, and never `git stash` bare: the
  stash stack is shared across every worktree and a parallel session can pop yours. Set work aside
  with a WIP commit instead.
- **Let every local e2e run finish.** A killed run leaves its browser profile behind, and a starved
  machine then STALLS a lane you did not touch rather than failing it; the cause, the tell and the
  commands that clear it are `specs/settle-doctrine.md`'s environment section and Gate 2.

## Write visual samples to out/

Any chart, diagnostic overlay, before/after image or other visual artifact you write to the filesystem
goes in **`out/`** (the CLI's default output location; gitignored). That is where Alex looks: name the
files in your reply so they are easy to open, and do not scatter samples in `/tmp`, the scratchpad or
anywhere else he will not find. **For a presentation sub, run `vellum-plate-reader` before the PR**:
structural tests cannot see layout, and #219's sideways scroll at 320px is what got through when one
was trusted to. It renders through CDP and returns MEASUREMENTS plus named files in `out/`, at both
full scale and 1:1 crop, since glance properties only exist at full scale.
