# The Vellum development workflow

**This is the order of operations for taking a filed issue to a pull request.** It is the sequence
itself: what happens, in what order, and which step may not be skipped. It exists because the steps
were spread across `CLAUDE.md`, four agent files and a skill, and no one place said what came after
what, so sessions improvised the order and improvised it differently each time.

Three other places carry what this one deliberately does not:

- **`specs/rulebook.md`** holds the durable rules, invariants and working agreements, and how a
  design decision is made. Where that file and this one disagree about a rule, it wins. This file
  sequences; it does not legislate.
- **`.claude/skills/vellum-footguns/SKILL.md`** holds the gates, which are keyed to the moment of
  typing rather than to a step here. They are not a phase of this workflow and cannot be turned into
  one; see "The gates are not a step" below.
- **`CLAUDE.md`** holds process at the keyboard and the local conventions each step assumes.

## The sequence

**1. Read the issue: the body AND its comments.**

```
gh api repos/ahl-gram/Vellum/issues/N            # the body
gh api repos/ahl-gram/Vellum/issues/N/comments   # decisions, ratifications, re-baselines
```

The comments usually win, and the body will typically not tell you a superseding comment exists.
`gh issue view` silently returns empty for some issues here, so it is never evidence that an issue
or a thread is empty. An empty result from the `api` form is a claim like any other: count it
(`| jq length`) rather than reading silence as absence.

**2. Run `vellum-spec-recon`.** It returns a CURRENT / STALE / UNVERIFIABLE ledger and the open
decisions awaiting Alex. Skipping it is a choice to be made deliberately and said out loud, and it
is only defensible for an issue small enough that you verify every claim in it by hand instead. It
exists because #132 (six of seven subs stale) and #190 (seventy three stale claims) each cost a
twelve to thirteen agent audit built from scratch.

**3. Write the plan. No code.** The plan names the design, the files, the tests with the mutation
that reds each one, the evidence that will say it works, and the rosters and doctrine the change
drags with it.

**4. Get a COLD read on the plan: `vellum-plan-skeptic`.** Not `vellum-pr-skeptic`, which reviews a
diff and has none to read at this point. The plan skeptic attacks the plan's assumptions, its
sizing, its evidence and its silences, and it is where a wrong approach is cheapest to kill. This
step is why the file exists: it was the missing one.

**5. Fold in what survives.** A finding you reject is rejected in writing, with the reason.

**6. Put the open decisions to Alex as a menu, and STOP.** Every option in plain words with its
consequence, no jargon, no acronyms, in `AskUserQuestion` rather than in prose. **A decision that is
his is not one to default your way and mention afterwards.** This step is load bearing and it is the
one most often skipped: on #534 the issue offered three options and ruled none, and Alex's ruling
(both of them, in one go) roughly tripled the work from what the session would have defaulted to.
Do not begin step 8 until he has answered.

**7. Worktree, then rename the branch.** `EnterWorktree` branches from `origin/main`, so the tree is
current without a pull. It turns any `/` in the name into `+` and prefixes the branch with
`worktree-`, so rename the branch before the first commit or the PR carries the harness's name
instead of yours.

**8. Implement.** Four things the word hides, each of which has its own scar:

- **The failing test first**, red on the assertion you care about and not on a missing module. Stub
  the feature with the right shape and the wrong behavior, watch the assertion fail, then implement.
  A "cannot find module" red proves nothing.
- **Commit before you mutate.** Any loop that breaks a file and restores it restores to the last
  COMMIT: a mutation run, a bisect, an experiment ending in `git checkout --`. It destroys
  uncommitted work silently and with no diff to recover from.
- **Doctrine and rosters move with the code.** A new file joins lists it does not know about, and a
  behavior change that contradicts a ratified line has to edit that line in the same PR. Nothing in
  this repo sweeps markdown, so a doctrine file left stale stays stale silently.
- **Bold delight is welcome**, per `CLAUDE.md`, but flagged in the reply and in the PR body, never
  buried.

**9. Push at the first commit.** Local commits held back are the wrong default here.

**10. Verify locally, and name the command for every claim.** The unit suite, the type check, the
e2e suites the change touches, and the evidence run that demonstrates the acceptance. "Delivered",
"one line" and "that will be fast" are predictions until a command's output says otherwise. Where a
claim genuinely cannot be run down, mark it UNVERIFIABLE, the word `vellum-spec-recon` already uses,
and do not coin a second one.

**11. Run the companion agents the work owes.** `vellum-guard-prover` on every new or strengthened
guard, and it requires step 8's commits to already exist because its restore is `git checkout --`.
`vellum-plate-reader` when the deliverable is an appearance. Zero red from the prover is a hole, not
a pass, and a guard proved unable to bite is deleted rather than shipped.

**12. Record every call the issue did not rule on, as a dated comment on the issue, BEFORE the
push.** The skeptic in the next step diffs against the newest ratified statement, so reasoning that
lives only in your head becomes a finding. The old comment is never edited; a correction is a new
comment that says what it supersedes.

**13. Open the PR.** `references/pr-body.md` in the footguns skill is the shape. Every line is a
claim the skeptic will check.

**14. Run `vellum-pr-skeptic`, dispatched COLD.** The prompt is the PR number or branch name and
NOTHING else: no summary, no claims about tests, no rationale. Make no edits while it runs.

**15. Fix, re-prove, repeat, at most three rounds.** A guard you change is a guard the prover has
not seen, so it goes back through step 11. Residue that will not be fixed is named in the PR body
with the reason.

**16. Leave the PR open. Alex reviews and merges.** Never merge for him.

**17. Hand off.** The roadmap Project first, since the global `session-handoff` skill does not know
it exists: newly filed issues added and phased, shipped issues closed. Then the session ritual.

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
