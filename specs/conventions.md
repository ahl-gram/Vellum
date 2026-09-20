# How the house decides, and how it writes a rule down

**This file holds the house's conventions, not the rules of the product.** How a design
decision is made and built to, where a rule lives once it is made, how a spec states it, how code
is cited in prose and in a comment, and how a comment sweep is run and proven. Read it before
starting a design round or building to ruled stills, before adding or moving a rule, before
editing a spec, and before writing, citing or sweeping a comment.

The rules themselves live elsewhere. `specs/rulebook.md` holds the sequencing rules, the golden
and the order of work, and where it and this file disagree about a rule of the product, it wins.
`specs/development-workflow.md` holds the order of operations from a filed issue to a pull
request. `CLAUDE.md` holds process at the keyboard, including its copy of the comment doctrine,
whose binding statement is the rulebook's and which this file's last section says how to enforce.
`.claude/skills/vellum-footguns/SKILL.md` holds the gates keyed to the moment of typing, and its
`references/` directory the dated records that serve them.

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
content only, in its own pull request. That archive is the visual spec; these specs and the issue
ledgers are the words.

**A sitting held at the workflow's STOP is not a round, and owes no archive.** Where
`specs/development-workflow.md` step 6 renders candidates so a fix can be ruled from pictures rather
than from prose, the stills go with the session (Alex, 2026-09-19); that step says where they live
while it lasts. Nothing visual survives such a sitting, so the fidelity rule below has no archived
still to hold a build to, and the ruling's words carry it alone.

Things a design round owes that the steps above do not cover:

- **The archive pull request gets the cold skeptic, and the mock pages get the plate-reader.** An
  archive is content rather than code, which makes it look like neither is owed; both have found real
  defects in one, and the mocks are the only place a ruling is made from pixels nobody measured.
- **A mock inherits the live kit's defects unless it says otherwise.** A mock page linking the house
  sheets wears whatever is wrong with them that day, so a still can show a defect the round did not
  invent and a round can rule on a picture that is wrong for a reason outside it. Where a mock
  neutralises such a defect to show the intended dress, that override says so at its line and the
  defect is filed.

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

## Where a rule lives

**Where a rule lives: the routing rule.** Anything Vellum-specific AND normative AND slow-changing is
a spec under `specs/`. An imperative keyed to the moment of typing a particular kind of line is a
`vellum-footguns` gate. An incident whose value is proving that a gate bites is a row in that skill's
`.claude/skills/vellum-footguns/references/scars.md`. A gate candidate declined under the strict
filter (a line joins a gate only with its own incident number or a ruling of Alex's) is a row in
`.claude/skills/vellum-footguns/references/held-lines.md`, each with the incident that would earn it
its line. Fast-changing empirical traps, private infrastructure and status stay out of
the repo entirely. **Exactly one home is normative, and every other copy points at it by name**,
because two copies of a rule are two rules the moment either is edited. Apply this when adding a rule
and when finding one in two places; the second case is a defect to fix, not a redundancy to keep.

**A code comment is not a second copy, and the routing rule does not evict one.** The comment
doctrine governs there instead: a comment survives where no test can practically pin the thing, which
is the same carve-out that lets a hand-measured browser quirk keep its line. So a spec stating a rule
and a comment stating it at the line that breaks are both correct, and moving a rule into a spec is
not by itself a reason to delete the comment. What the routing rule forbids is a second NORMATIVE
home: another spec, or a gate re-explaining the contract rather than pointing at it.

**A new spec file joins its reading lists by hand, and none of them checks itself**: the table in
`CLAUDE.md`, step 3 of `specs/development-workflow.md`, the reading list in
`.claude/agents/vellum-implementer.md`, and the sibling paragraph and companion footer of
`specs/rulebook.md`. The other specs name only the siblings they lean on, so a new file joins those
where a citation of its parent pointed into the text it took.

## How a spec, and the rest of the house's prose, is written

**Specs are prescriptive. State the rule and drop the provenance.** Write each entry in the
imperative, as the thing a future session must do or must not do. Cut "ratified at", "reworked after
review", "this line read X until", and the story of how a set reached its membership: git, the issues
and the pull requests hold that history and are better at it, and a reader who is ABOUT to do the
work needs the rule rather than the road to it. **Keep the `` `symbol` in `repo/relative/path` ``
citations**, which are not history but what makes a rule checkable in one command, and keep naming a
constant wherever the rule is about its value. The older entries across these specs still carry
narrative; that is trimmed as each is touched, not swept separately.

**A backticked file path in prose is scanned.** `test/repo/prose-paths.test.ts` reads the house's
markdown and reds when a backticked path does not resolve: backticks on a path claim the file is in
the repo or deliberately kept out of it, so write a retired file or an example name without them, and
a file outside this repo at its real home under `~`. The test is the list of what it reads and what passes.

**Write `Issue #N` or `PR #N` in prose, never a bare `#N`**, because issues and pull requests share
one numbering sequence here and interleave, so a bare number does not say which kind of thing it
points at. It governs replies, pull request bodies, issue comments, commit message bodies, and prose
anywhere in the repo: these specs, `CLAUDE.md`, and the files under `.claude/agents/` and
`.claude/skills/`. The word may be lowercase where the sentence wants it; what it may not be is
absent. **It never governs a form a tool parses, or one that already carries the
word**: a commit SUBJECT keeps the house's leading `#N`, a closing reference stays `Closes #N`
exactly (a word between the keyword and the number closes nothing, `vellum-footguns` Gate 5 item 5),
a pull request body's title line keeps `#N`, and a field label such as the template's `Issue: #N`
already says which it is. Existing bare references are trimmed as each line is touched, not swept
separately, the same way the older narrative is.

**Do not copy volatile state into a spec.** Phase names, board membership and issue status belong
to the Project and are read from it. Counts, rosters and file line numbers rot without any guard
noticing, and **nothing in this repo sweeps a claim in markdown** (only a backticked path is scanned, above), so a wrong claim here is silent. Name a live
issue number only where the number is itself part of a rule. This discipline retired the workspace's
PROJECTS.md and the copied phase-option list in `CLAUDE.md`, both of which drifted precisely
because they were convenience copies, and it is why the `roadmap/` directory was deleted rather than
repaired.

## How code is cited

**The comment citation convention:** cite code as `` `symbol` in `repo/relative/path` ``, never as
a file and a line. A symbol survives code moving and breaks on a rename or a deletion, which is
exactly when a citation should fail, while a line number drifts silently onto unrelated code. Use
the FULL repo-relative path even for a sibling in the same directory, because basenames repeat
under `src/` and the ambiguity is day one rather than drift.
`test/repo/comment-citations.test.ts` enforces it **for code comments only**: it reads `.ts` and
`.mjs` under the code roots plus `.css` under `public/`, and reaches neither `specs/` nor
`.claude/`, so of a citation written in prose like this one only the PATH half is checked, by
`test/repo/prose-paths.test.ts`, and the symbol half by hand or not at all. These
behaviours of the comment guard are deliberate rather
than rough edges: it matches a symbol that APPEARS in the file, not one declared there, because a
citation properly points at a call site; and it matches JOINED runs of comment lines, not single
lines, because a citation long enough to wrap is invisible to a line matcher and the guard would
report green. Do not simplify either away. The guard checks the citation and never the claim
wrapped around it, which stays the business of the invariant at the line that breaks.

## The comment sweep

A sweep deletes comments the comment doctrine (`specs/rulebook.md`, under the durable engineering
constraints) says are not owed. It is a mechanical change with a non-mechanical failure mode, so it
is run and PROVEN in a particular way.

- **Sweep trailing comments last and most conservatively, and never audit a sweep from a whole-line
  scan.** The trailing comment is the highest-value keeper class and a whole-line diff cannot see it:
  stripping a comment off the end of a code line that survives shows up as a CHANGED CODE LINE, so an
  audit built from removed comment-marker lines misses every one. A trailing comment is also doing
  the most work, because it labels a line that is otherwise indistinguishable from its neighbours: a
  near-identical fixture, a state poke, the units on a bare constant, a coordinate convention, a
  sentinel's decode.
- **The proof that a sweep changed no code is an AST token-stream comparison against the base, per
  file.** These things it must handle or it lies. Exclude the JSDoc kind range, because TypeScript
  models JSDoc as real syntax and a reworded doc block otherwise reads as a code change. Strip
  Astro's markup comment form, which no comment counter inventories and the comparison reads as
  text. And never build it on `ts.createScanner`, which mis-lexes regular-expression literals and
  backticks and reports drift that is not there; `ts.createSourceFile` and a leaf walk are the shape
  that works. Prove the verifier itself on fixtures before trusting it, including a changed
  identifier, a changed string, a dropped type annotation, a deleted CSS declaration and an edited
  Astro expression. Pure reindentation is its one acceptable blind spot, and a comment inside a
  template literal is string data rather than a comment, so it is out of scope by construction.
- **A keeper scan is a separate step, and token identity cannot do it.** Proving no code changed says
  nothing about whether the sweep deleted the trap that cost someone a debugging session. Scan the
  DELETED text for keeper signals (a measured number with a unit, a hand measurement, a named
  browser, a ratified deviation, a byte-identity or golden claim) and check whether the fact survives
  anywhere in its file. **CSS is the weakest ground for the whole doctrine**, because no unit test
  pins why a rule is written the way it is, and a stated deviation from a ruled mockup is the most
  dangerous single loss: without the line the next reader "fixes" the value back.
- **Every deletion made on the ground that a test already pins the behaviour NAMES that test**, in a
  ledger written while the grep is still open, because it cannot be reconstructed afterwards. Naming
  a test is not enough by itself: check that the named test actually pins the behaviour the comment
  stated, since a citation to a test that merely touches the same code reads identically in a ledger.
- **When a sweep and a feature branch collide, the FEATURE merges first.** Then merge main into the
  sweep and re-run its token verifier before merging that. A comment-only branch absorbing feature
  work is re-provable mechanically; a feature branch absorbing a sweep costs a full e2e run and can
  silently revert a measured value on the strength of a comment cleanup.

---

*Companion to `specs/rulebook.md` (the rules this file says how to write down, and the comment
doctrine's binding statement), `specs/development-workflow.md` (the order of operations),
`CLAUDE.md` (process at the keyboard), `specs/ui-design.md` (the look a design decision decides),
and the footguns skill's dated records beside its gates,
`.claude/skills/vellum-footguns/references/scars.md`,
`.claude/skills/vellum-footguns/references/flake-record.md` and
`.claude/skills/vellum-footguns/references/held-lines.md`.*
