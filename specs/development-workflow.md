# The Vellum development workflow

**This is the order of operations for taking a filed issue to a pull request.** It is the sequence
itself: what happens, in what order, and which step may not be skipped. It exists because the steps
were spread across `CLAUDE.md`, four agent files and a skill, and no one place said what came after
what, so sessions improvised the order and improvised it differently each time.

Four other places carry what this one deliberately does not:

- **`specs/rulebook.md`** holds the durable rules, invariants and working agreements. Where that
  file and this one disagree about a rule, it wins. This file sequences; it does not legislate.
- **`specs/conventions.md`** holds how a design decision is made, and how a rule is written down
  once made: where it lives, the voice, the citation form, the comment sweep.
- **`.claude/skills/vellum-footguns/SKILL.md`** holds the gates, which are keyed to the moment of
  typing rather than to a step here. They are not a phase of this workflow and cannot be turned into
  one; see "The gates are not a step" below.
- **`CLAUDE.md`** holds process at the keyboard and the local conventions each step assumes.

## The sequence

**1. Read the issue: the body AND its comments**, through the two `gh api` calls `CLAUDE.md` gives
under "Read the issue before you build". The comments usually win, and the body will typically not
tell you a superseding comment exists.
`gh issue view` silently returns empty for some issues here, so it is never evidence that an issue
or a thread is empty. An empty result from the `api` form is a claim like any other: count it
(`| jq length`) rather than reading silence as absence.

**2. Run `vellum-spec-recon` at the start of any sub or epic**, as `CLAUDE.md` requires. It returns a
CURRENT / STALE / UNVERIFIABLE ledger and the open decisions awaiting Alex, and it exists because
#132 (six of seven subs stale) and #190 (seventy three stale claims) each cost a twelve to thirteen
agent audit built from scratch. This file does not carve out an exception, and neither does
`CLAUDE.md`: a session that departs from it is departing from a rule, and says so in its reply.

**3. Write the plan. No code.** The plan names the design, the files, the tests with the mutation
that reds each one, the evidence that will say it works, and the rosters and doctrine the change
drags with it. The required reading is due before the plan, not after it: `specs/rulebook.md` before
any change that touches the renderer, a committed chart, the golden, a regen, a seed or the order of
work, `specs/ui-design.md` before any work whose deliverable is an appearance, `specs/chart-dress.md`
before any change to a chart's dress, in the renderer or in how the site mounts a sheet,
`specs/cascade-traps.md` before writing or moving CSS or reading a rendered frame after a change,
`specs/engine-invariants.md` before any change to world generation or to a surface that quotes
generated output, and before any script that measures a world, since the traps that make such a
script return a plausible wrong number are there, `specs/explorer-doctrine.md` before any work on the
Explorer or on a chart camera, gesture or overlay, `specs/region-and-voyage.md` before any work on a
region sheet, level of detail,
or the voyage, `specs/site-architecture.md` before adding or restructuring a page, a stylesheet, a
bundle or an inlined script, `specs/conventions.md` before starting a design round or building to
ruled stills, and before adding or moving a rule, editing a spec, or writing, citing or sweeping a
comment, and
`specs/settle-doctrine.md` before any work that writes an e2e wait, settle, or CDP probe, or that
reads a screenshot, a focus state or a narrow viewport in the harness.

**4. Get a cold read on the plan: `vellum-plan-skeptic`.** Not `vellum-pr-skeptic`, which reviews a
diff and has none to read at this point. The plan skeptic attacks the plan's assumptions, its
sizing, its evidence and its silences, and it is where a wrong approach is cheapest to kill. This
step is why the file exists: it was the missing one.

**Hand it step 2's ledger when step 2 ran in this session, and nothing else when it did not**
(Alex, 2026-09-10). Re-verifying what recon already checked is waste, not independence; what the
plan skeptic must never inherit is the planning session's framing, which the ledger does not carry.
With no ledger it runs truly cold, on the issue number and the plan alone.

**5. Fold in what survives.** A finding you reject is rejected in writing, with the reason.

**6. Put the open decisions to Alex as a menu, and STOP.** Every option in plain words with its
consequence, no jargon, no acronyms, in `AskUserQuestion` rather than in prose. **A decision that is
his is not one to default your way and mention afterwards.** This step is load bearing and it is the
one most often skipped: on #534 the issue offered three options and ruled none, and Alex's ruling
(both of them, in one go) roughly tripled the work from what the session would have defaulted to.
Do not begin step 8 until he has answered.

**When the session running this sequence is a dispatched `vellum-implementer` lane, the menu goes to
the dispatching session instead**, as the last part of its step 6 report, and the dispatcher puts it
to Alex in `AskUserQuestion` and relays his rulings back. The STOP is the same; only who holds the
menu changes, because a subagent's question does not reach Alex. The implementer records the relayed
rulings on the issue at step 12 exactly as a session would record its own.

**When the ruling is an appearance, the menu carries stills.** A direction described in prose asks
Alex to picture it and then holds him to what he pictured, which is how a ruling gets made on
something nobody measured. Render the candidates instead, through `vellum-plate-reader`, whose own
definition carries the zooms, at the viewports and on the seeds the defect was measured at, or on the
ones the decision turns on where nothing measured it. `specs/conventions.md` "How a design decision
is made" governs the sitting itself, how many directions are drawn and what becomes of the stills
afterwards. **Where the decision changes an appearance that already ships, today's behavior is
rendered beside the candidates as a control**, because a candidate with nothing beside it reads as
better than it is; a decision about a surface that does not exist yet has nothing to control against
and renders its candidates alone. The stills go in `out/` and each option in the menu names the file
that shows it.

**The candidate build is a throwaway spike, and it is not step 8.** Rendering a direction takes code
and step 3 has already said the plan carries none, so the carve-out is drawn narrow: the spike's only
output is the stills, and the ruled direction is built test-first from step 8 like anything else. A
candidate kept because it already works is an implementation that skipped its failing test. **The
spike is never committed**, which keeps step 9's push-at-the-first-commit default off a throwaway and
leaves nothing to force push away. It is the one dispatch that does not take step 14's commit first:
that rule guards against an agent moving the tree under you, and `vellum-plate-reader` may not move
one and reads the WORKING tree anyway, since its plumbing builds and serves `dist/`.

**Arms that coexist in one spike are cheaper to read.** `vellum-plate-reader` writes only into `out/`
and never edits source, so it cannot switch the tree itself: a spike that exposes every arm at once,
behind a flag, a query parameter or separate mock pages, is read by a single run. Where the arms
cannot coexist, whoever dispatches it re-renders between them and says so in the menu.

**`out/` inside a worktree is not where Alex looks.** Any session standing in one copies the stills
to the MAIN checkout's `out/` before putting the menu; a dispatched lane cannot reach outside its own
tree, so it reports absolute paths and its dispatcher copies them, the same way it holds the menu
itself. Copy before the spike goes, because `out/` is gitignored and nothing else holds them.

**7. Worktree, then rename the branch**, before the first commit, or the PR carries the harness's
name instead of yours. The rest of the worktree rules, including why the branch needs renaming at
all, are `CLAUDE.md`'s Worktrees section. A `vellum-implementer` lane already stands in a harness
worktree when it starts, and its definition carries the rename.

**8. Implement.** Five things the word hides, the first a record and the rest each with its own
scar:

- **Archive the finalized plan before the first commit.** Copy the plan exactly as step 6 left it
  to `plans/<N>-plan.md` at the repo root, `N` the issue's number, and commit it with the
  implementation. It is a record of what was planned and is never edited afterwards: a plan that
  changes at review is named in the PR body with the difference, not a rewritten file.
  `plans/` is an archive on `design/`'s pattern, content only, and sits outside the roots
  `test/repo/prose-paths.test.ts` walks on purpose, so a plan may name the paths it is about to
  change and a later refactor does not red the history. A change with no issue has no plan step
  and writes nothing here.
- **The failing test first**, red on the assertion you care about and not on a missing module. Stub
  the feature with the right shape and the wrong behavior, watch the assertion fail, then implement.
  A "cannot find module" red proves nothing.
- **Commit before you mutate.** Any loop that breaks a file and restores it restores to the last
  COMMIT: a mutation run, a bisect, an experiment ending in `git checkout --`. It destroys
  uncommitted work silently and with no diff to recover from.
- **Doctrine and rosters move with the code.** A new file joins lists it does not know about, and a
  behavior change that contradicts a ratified line has to edit that line in the same PR. Nothing in
  this repo sweeps a claim in markdown (`test/repo/prose-paths.test.ts` checks only that a backticked path resolves), so a doctrine file left stale stays stale silently.
- **Bold delight is welcome**, per `CLAUDE.md`, but flagged in the reply and in the PR body, never
  buried.

**9. Push at the first commit**, per the ruled default in `vellum-footguns` ("Defaults this repo has
already ruled"), where eight local commits unpushed was called the wrong default on #520 part 2.
**Read Gate 5 here, in full, even though half of it is not due yet.** The hook shows a gate's text at
most once a session and keys the push and the PR write to the same gate, so this is the only time it
will be put in front of you; its body checks are yours to remember at step 13. That is the cost of
pushing early, and it is not a reason to defer the read.

**The hook reads its gate text from the LAUNCH checkout, not from your worktree.** Its command in
`.claude/settings.json` resolves under `${CLAUDE_PROJECT_DIR}`, and the PR template it checks a body
against comes from the same place. So a session standing in a worktree is shown main's gates and
main's template, not its branch's: a branch that EDITS a gate or the template is not the version
being enforced while you work on it.

**10. Verify locally, and name the command for every claim.** The unit suite, the type check, the
e2e suites the change touches, and the evidence run that demonstrates the acceptance. "Delivered",
"one line" and "that will be fast" are predictions until a command's output says otherwise. Where a
claim genuinely cannot be run down, mark it UNVERIFIABLE, the word `vellum-spec-recon` already uses,
and do not coin a second one.

**Name which checks ran.** CI is the full-suite gate and runs everything on the pull request
regardless, so the local run is the targeted one this step already describes. Say so plainly in the
report and in the body, because "tests pass" is otherwise read as "the whole suite passed locally",
and the gap between those two is exactly where a reviewer's trust is spent. The time this saves does
not transfer to skipping step 11.

**A clean mergeable verdict is about text.** When main moves under a branch whose tests pin measured
values, no file needs to overlap for the merged state to behave differently, and the branch's own
green CI ran against the old main. Merge main locally, run the suite, abort the merge so the branch
stays clean for review, and put the combined-state result in the body, because a reviewer reading
only the branch's CI cannot see it.

**11. Run the companion agents the work owes.** `vellum-guard-prover` on every new or strengthened
guard, and step 8's commits have to exist first: it mutates in its own detached worktree at the DISPATCH
tree's HEAD (built by `scripts/agent-sandbox.ts`, #575), so anything uncommitted is simply not in
the tree it proves, and its ledger names the sha it proved. `vellum-plate-reader` when the
deliverable is an appearance, and again here when step 6's menu was ruled from stills, since those
measured a spike and this run measures what was built. Zero red from the prover is a hole, not a
pass, and a guard proved unable to bite is deleted rather than shipped.

**12. Record every call the issue did not rule on, as a dated comment on the issue, before the PR
is opened.** Not before the push: with step 9 the first push comes early, so the deadline that
matters is the review, which is what `vellum-footguns` Gate 5 says too. The cold skeptic at step 14
diffs against the newest ratified statement, so reasoning that lives only in your head reaches it as
a finding. The old comment is never edited; a correction is a new comment
that says what it supersedes.

**A ruling of Alex's is recorded here too, and by you.** He rules in the session, which leaves no
trace on the issue, and the next reader (or the cold skeptic) sees an issue whose options are still
marked unruled. That happened on #534.

**Not every change has an issue.** A docs or tooling change often opens straight to a PR, which is
the house norm rather than an omission. The record still has to exist: with no issue, the PR body
carries the calls and a PR comment carries any ruling of Alex's. "It was decided in chat" is not a
record, because the cold skeptic at step 14 cannot read chat, and neither can the next session.

**13. Open the PR.** `.github/PULL_REQUEST_TEMPLATE.md` is the shape, and the footgun hook refuses a
body that skips one of its sections. Every line is a claim the skeptic will check. **The body carries
that template's closing-reference line too**, which nothing enforces: the hook checks the sections and
denies a negated keyword, but never requires one, so `gh pr view <N> --json closingIssuesReferences`
is read before the PR is handed over. The grammar that read depends on, and every form the line
takes, including the one for a PR that has an issue and deliberately leaves it open, are
`vellum-footguns` Gate 5 item 5 and the template's own note; neither is restated here.

**14. Run `vellum-pr-skeptic`, dispatched COLD.** The prompt is the PR number or branch name and
NOTHING else: no summary, no claims about tests, no rationale. Make no edits while it runs.

**Commit anything in progress before you dispatch it**, and before any dispatched review agent, with
the single exception of a step 6 spike under `vellum-plate-reader`, which reads the working tree by
building it and may not move it. It runs
in the directory you launched it from, which is your worktree, and on 2026-09-11 this one checked a PR
head out in two live ones (#573). No dispatched review agent may move or restore the tree it was
dispatched from. `vellum-pr-skeptic` goes further and runs NOTHING in it, suites included, because a
suite run there deletes the generated assets under `public/` (Alex, 2026-09-12); both it and
`vellum-guard-prover` build their sandbox with `scripts/agent-sandbox.ts` rather than a recipe of
their own (#575). The other three keep their documented work in the dispatch tree, `vellum-plate-reader`'s
`out/` samples included, because its own boundary writes only into `out/` and the other two hold no
write tool at all. That is where Alex looks when the dispatch tree is the main checkout; when it is a
lane's worktree, whoever dispatched the lane copies the samples across, as step 6 says.

**An agent whose own DEFINITION this pull request changes cannot be trusted to review the change.**
On PR #576 the cold skeptic reported that its loaded instructions were the pre-PR version while its
dispatch worktree stood at that branch's head. **WHY is UNVERIFIABLE**: that pull request's own body
says the question was never run down, and nothing since has measured where a dispatched agent's
definition is read from or when. So do not read that agent's report as evidence the new definition
works. **A pull request that edits `.claude/agents/*.md` says in its body which version of the
definition wrote the change and which reviewed it**, which is the part that does not depend on the
cause. Proving the new definition takes effect is not asked for here: no session can be asked which
definition it loaded, so the check would be unfalsifiable the moment it was written down.

**15. Fix, re-prove, repeat, at most three rounds.** A guard you change is a guard the prover has
not seen, so it goes back through step 11. A finding that will not be fixed in this pull request
is filed as an issue or added to `errata/` as a row in the same diff, with the reason, and the PR
body names which; a finding left as prose in the body alone is itself a finding. The shape of a row
and how one leaves are `errata/README.md`.

**An integration pull request takes no review commits.** When a long-lived epic branch finally
merges to main, every commit on it has already run this whole sequence on its own sub, and new
commits at integration time re-open reviewed work and muddy what the merge represents. Dispatch the
cold skeptic as usual, then treat its report as documentation rather than a fix queue: list every
finding in a comment with its disposition, which is one of already recorded on a sub, parked on a
ratified future sub, or new and worth its own issue.

**16. Leave the PR open. Alex reviews and merges.** Never merge for him unless he asks you to.

**17. Hand off.** The roadmap Project first, since the global `session-handoff` skill does not know
it exists: newly filed issues added and phased, shipped issues closed. Then the session ritual.

## Sweeps the per-sub recon does not reach

Step 2 catches staleness one sub at a time, at the moment that sub is built. Some situations go stale
wholesale instead, and those are owed a sweep rather than a reading.

**After a big epic lands, re-recon every open epic and sub written before it.** Issues written
against the old shape do not decay one at a time; they decay together, and the ones that hurt are the
instructions that would now introduce the defect they were written to prevent. Dispatch
`vellum-spec-recon` once per issue, in parallel, each prompt naming the epic that just closed and
what it changed. Post each result as a dated re-baseline COMMENT, leaving the body as written, then
put the open decisions to Alex as a set, because the sequencing between them is usually the real
question. Anything the sweep itself makes stale is fixed before the comments go up: a pull request
merging mid-sweep will otherwise leave drafts saying a spec is not on main.

**A review sitting's own ledger owes a recon too.** The items a sitting must rule on are scattered
across every issue and pull request that deferred something to it, so a docket built from one
issue's comments is a sample rather than the population. Build it by grepping the epic's subs and
pull requests for the deferral words ("provisional", "re-judge", "post-use", the review's own
number), and once the ledger is posted, run the recon against the LEDGER and put whatever it
surfaces to Alex in the same sitting. A completeness claim in a ledger's preamble is exactly the
confidence with no command behind it that this file exists to refuse.

**An epic links its subs in prose, never with native sub-issues.** A body checklist, a shared label
and membership of the roadmap Project are the mechanism, so the board shows an epic and its subs as
flat peers and nothing on it records that one subsumes another. Trust the prose over the flat board,
and when a later decision changes what an epic subsumes, say so in a dated comment on both ends.

## The gates are not a step

`vellum-footguns` is keyed to the moment you are about to type a particular kind of line: a test, an
e2e check or CDP probe, a CSS rule, a new member of a roster, anything that can move a chart or the
golden, a push or a PR body. Reading them all at step 3 does not discharge them, and a session that
files them under one step of this sequence has reproduced the exact failure the skill was built to
end. Its own ledger is the argument: the doctrine already existed, in `CLAUDE.md`, in the rulebook
and in the agents, and it kept failing because it was read at session start and applied hours later
at the push.

## What this sequence is not

- **Not a licence to skip a step that looks unnecessary today.** Each one is here because its
  absence cost a session, and every skip is a choice to be stated in the reply rather than made
  quietly.
- **Not a substitute for judgment about scope.** The rulebook governs what may be built and in what
  order. This file governs how a thing already scheduled gets built.
- **Not proof of correctness.** A workflow followed to the letter still ships a defect. What it
  buys is that the defect is found by a prover, a skeptic or a named command rather than by Alex
  using the site.
