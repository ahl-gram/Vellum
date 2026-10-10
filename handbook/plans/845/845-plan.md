# Issue #845 plan: the tracked `vellum-designer` agent

Written by the `vellum-implementer` lane for Issue #845 on 2026-10-10, at `20dd39a5`, with `vellum-spec-recon`'s ledger and `vellum-plan-skeptic`'s findings folded in (both below). No decision in it went to Alex: every open point recon or the skeptic raised is either covered by a ruling on the record or is a call, recorded here and in the dated comment on Issue #845.

Rulings this plan builds on: Issue #747 body (a design agent on Fable; a tracked definition for any round), Issue #747 issuecomment-5980254365 (`effort: xhigh`, `model:` Fable, the 1M string checked against a dispatch), Issue #845 issuecomment-6097644480 (one agent does both jobs, the name stays `vellum-designer`, first use is Epic #844's breakdown once this merges) and issuecomment-6097677399 (merge clearance to the orchestrating session; the lane never merges).

## Recon (`vellum-spec-recon`, at `20dd39a5`)

Read: Issue #845 body and its first comment (the second, the merge clearance, landed after recon read), Issue #747 body and all 5 comments, Epic #844, PR #752. 18 CURRENT, 7 STALE (3 blocking, all about the issue's roster list), 2 UNVERIFIABLE (the Fable string, which recon could not dispatch and this plan measured; and who said job two's details, which the comment's "one agent does both jobs" covers). What changed the plan:
- The issue's roster list is both too wide and too narrow. `handbook/specs/check-placement.md`, `.claude/skills/vellum-footguns/SKILL.md` and its `references/held-lines.md` name agents in passing and list none, and `test/repo/memory-pointers.test.ts` is a self-joining check, not a roster: none is edited. The list misses `handbook/specs/conventions.md` "Things a design round owes" (edited) and its reading-lists paragraph (not joined: the designer's list defers to `CLAUDE.md`'s table), `CLAUDE.md` "Write visual samples to out/" (its pointer to step 6 already covers the designer), workflow step 14's count of review agents (unchanged: the designer is not one), and `vellum-pr-skeptic.md`'s mirror of the template's Records (unchanged because the template is).
- "As the review agents do": the agent that hands a MENU to its dispatcher is `vellum-implementer` at its STOP; the review agents return reports. The definition says so in those terms.
- Conventions step 1 has a one-direction case, a mockup ratified as the spec; the brief carries it.
- `scripts/agent-sandbox.ts` refuses any name but `guard-*` and `skeptic-*` (`SANDBOX_NAME`, pinned by `test/repo/agent-sandbox.test.ts`), so the designer's tree is step 6's hand recipe, built by the dispatcher; the script is not changed.
- The `npm install` through a linked `node_modules` hazard has its home at `.claude/agents/vellum-implementer.md`'s link step (held-lines.md's Issue #783 row); the designer points at it rather than carrying a second copy.
- Conventions' other round duties (the cold skeptic on the archive pull request, the plate reader on the mock pages, a mock inheriting the kit's defects) are pointed at from the brief.

Recon's open-decision list, and why none goes to Alex: the tree (step 6's ratified recipe; one tree for both jobs is a call); tools (a call); the archive boundary (the issue's own sentence, honoured, a call); generalising Issue #747's round rulings (the issue, filed on Alex's call, names that brief as what the definition owes, "for any design round"; under the routing rule the rules that bind the archive move into conventions, a call below); which lists it joins (calls, each with its reason); a plan-skeptic read of a breakdown (the definition takes no position; the dispatcher may run one); the designer beside the implementer's step 6 spike (it does not replace it: step 6 gives a STOP sitting's stills to the implementer and the plate reader, and the designer is for a round under conventions' six steps and for an epic's breakdown); the Fable variant (measured below); Epic #844's "which first" (that epic's own).

## The design

One new file, `.claude/agents/vellum-designer.md`, in its siblings' shape: frontmatter, what it is, where it stands, "Read first", the two jobs, boundaries, the hand-back. No code. The full text it commits is drafted in `845-draft-vellum-designer.md` beside this plan, and is part of it.

### Frontmatter

- `name: vellum-designer`.
- `description:` a design round (conventions' steps 1 and 2) and an epic's breakdown; NOT a STOP sitting's stills, which stay the implementer's spike and the plate reader's (plan skeptic finding 6); dispatched without isolation.
- `model: fable[1m]`. MEASURED (2026-10-10, Claude Code 2.1.295) from fresh `claude -p` sessions whose parent was NOT Fable (`--model opus`, then `--model sonnet`), with `-d api --debug-file` and inline `--agents` arms: `model: fable[1m]` and `model: fable` BOTH dispatch `model=claude-fable-5-1`, read from the `source=agent:custom:<arm>` line beside each dispatch; the arm with no `model:` dispatched the parent's `claude-opus-5-5`. So the suffix makes no difference to the dispatch on 2.1.295. The log carries no context-window header for either, and the CLI's `modelUsage` reports `contextWindow` 1000000 for every model it ran, the Opus and Sonnet parents included, so that field tells no variant apart and is not cited as evidence (skeptic finding 9); the API reference bundled with the CLI gives Fable 5.1 a 1M window as its default and maximum. Choosing `fable[1m]` over `fable` is a CALL: it states the intent and matches the siblings' `opus[1m]` and `sonnet[1m]`, at no measured cost. The proof is re-run against the committed FILE (Evidence 1).
- `effort: xhigh`. MEASURED in the same probe: an arm with `effort: xhigh` printed `effort=xhigh` from `echo $CLAUDE_EFFORT` under a parent at `--effort low`, and the arm without the line printed `effort=low`.
- `tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch` (a CALL). Write and Edit because the round's mock code and notes are written and revised; no Agent tool, since recon for an epic is the dispatcher's and the plate reader and cold skeptic run at the archive pull request. A tools line enforces none of the boundaries (Bash can do anything), so the boundaries are stated as every sibling states them. Whether a dispatched agent receives every tool named is checked in the proof (skeptic finding 10).
- `color: orange`, unused by any sibling.

### Where it stands (the issue's "the definition says how its tree is made")

No `isolation:` line. Its only output is `out/`, so per workflow step 6 it is dispatched WITHOUT isolation by a session standing in the main checkout, which builds a detached tree (`git -C <main checkout> worktree add --detach <main checkout>/.claude/worktrees/design-<issue> origin/main`, `node_modules` linked by path), names it in the dispatch prompt, and removes it once the stills are ruled or the breakdown is in.

The definition's FIRST section, above "Read first" so a dispatch with no tree stops before ~190 KB of required reading (skeptic finding 8), is: run `echo "effort=$CLAUDE_EFFORT"` and `pwd`, both at the head of the report (the effort check `CLAUDE.md` names, made on every run, and the line the dispatch proof reads from the definition's own STOP path); confirm the named tree exists and holds a `.git` FILE; if no tree was named, or the path is the main checkout, STOP and report. It reads its sha from the `.git` file, and the main checkout's path from the same file's `gitdir:` line, the part before `/.git/worktrees/` (skeptic finding 1's last point).

**Both jobs take the same tree** (a CALL): a breakdown reads code at a sha it must report and may run the engine to size a sub; the main checkout is whatever state Alex left it in.

**Where the round's code lives** (skeptic finding 1, folded): in the TREE's `out/<issue>/`, the worked example's layout, so its relative imports (`../../../src/...` from `out/<issue>/mock/`) read the tree's engine at the sha the report names; it writes its output straight to the MAIN checkout's `out/<issue>/` through one constant, as workflow step 6 says; and at delivery it copies its code into that folder (`cp -Rp`), so the folder holds the code as it ran and the code survives the tree's removal. The definition names the worked example's layout as the one to copy, and says a script placed in the main checkout's `out/` would import the main checkout's `src/` instead.

**Serving the stills** (skeptic finding 4, folded): `shootAll` serves one root, so a sheet in `out/<issue>/` reaches `/design/kit/fonts.css` only when the root is the main checkout; the round shoots with `--site <main checkout>`, checks first that the main checkout's `design/kit/` matches its tree's (`diff -r`, a difference reported), and counts any non-empty 4xx list or console error in `shootAll`'s results as a failed shot, since a stylesheet that 404s still lets the font settle pass.

### Read first

`CLAUDE.md` in full; `handbook/specs/conventions.md` in full; `handbook/specs/development-workflow.md` in full; `handbook/specs/ui-design.md`; `handbook/specs/rulebook.md`; `handbook/specs/engine-invariants.md` before any script that measures or draws from a world; every other spec `CLAUDE.md`'s table names for what the round or epic touches. The issue by both `api` calls, comments counted. The nearest earlier round under `design/`, and the worked example by full paths (`design/prospects-after-braun-hogenberg/README.md`, `.../mock/README.md`, `.../refs/NOTES.md`, `.../lib-spike/README.md`), since `test/repo/prose-paths.test.ts` reds a relative backticked path (skeptic finding 3). The list defers to `CLAUDE.md`'s table rather than copying it, so a new spec need not join it by hand.

### Job 1: a design round

The designer's craft, what Issue #747's round needed and what its reviews corrected, stays in the definition:
- Real content only: drawn from real engine output at the sitting's seeds; seeds and places chosen by a kept measurement (`design/prospects-after-braun-hogenberg/dump-world.ts` and `sweep-sites.ts`); only what the world can truthfully name (the sitting ruled the key reads `world.roads`); a caption's superlative is a sweep with its command (the Voorea caption).
- The directions: one per honest answer, or one alone when a mockup is to be ratified as the spec; today's look as the control where it ships; every dress and every surface at its size; delight named.
- References: downloaded into `out/<issue>/refs/` with a data file of source page, URL, size and licence; licences counted from it.
- Libraries: spiked in their own folder with its own `package.json`, never through the linked `node_modules` (pointer to the implementer's link step), costs as a table; when the sitting asks for one where the designer proposed none, spike one.
- Byte identity: per direction bound for `src/prospect/`, whether its code passes `vellum/prospect-libm-clock-free` against `EXACT_MATH` and `PROSPECT_GLOBALS` at the sha, pointing at the rulebook's prospect byte pins.
- Stills: through `shootAll`; full scale and a crop; laid-out width against the shot width (the 2222 against 2200 clip); fonts linked and served as above; failed shots re-shot.
- The delivery: one folder, `out/<issue>/` or `out/<issue>-<what>/` when the issue delivers more than once (skeptic finding 7: Epic #844 already expects a breakdown and a spike under one number), notes opening with a `#` heading, `node scripts/delivery/main.ts` from the tree.
- For the builder: what in the mockup is NOT ruled, so a stand-in is not built as ruled; the fidelity rule by pointer.
- After the sitting: the archive is the dispatcher's pull request; when a later dispatch asks, the designer stages it as a NEW `design/<round>/` in a tree the dispatcher built on the archive's branch, uncommitted (Issue #845's "writes no code outside `out/` and `design/`", honoured; a separate tree because the round's tree is removed after the ruling).

### The rules that bind the archive move to conventions (skeptic finding 2, folded)

Under the routing rule (`handbook/specs/conventions.md`, Where a rule lives: Vellum-specific, normative, slow-changing means a spec, with exactly one normative home), the round-wide rules that bind whoever COMMITS a round, which is the dispatcher and not the designer, go into conventions' "Things a design round owes" as one new bullet, and the definition points at it: a round's references are cited by link and never committed, the archive keeping their links and licences; and the archive leaves out third-party bundles and `node_modules`, and any file carrying a personal address or credential, with its README saying what it left out and why. This generalises Issue #747's per-round rulings (the scans; the calls of issuecomment-5981204688) the way Issue #845's brief, filed on Alex's call "for any design round", asks; it is a CALL, flagged in the record. The craft rules above stay in the definition, as `vellum-plate-reader.md` carries its own traps.

### Job 2: breaking an epic into its subs

Input: the epic and its `vellum-spec-recon` ledger, run by the dispatcher first. Output in the report (long drafts as one file per sub in `out/<epic>/` or `out/<epic>-<what>/`): ordered subs, each with scope, files (checked by command), what it waits on, risks (determinism, the golden, a regen landing alone, a re-roll, rosters), acceptance and the test whose red proves it, open decisions; a design round first wherever the deliverable is an appearance; the post-use re-review as its own sub where a feel ruling is in play (conventions step 6); drafts the dispatcher files as native sub-issues (workflow, the epic rules at its end). The open decisions as a plain-words menu.

### Boundaries

Writes only the main checkout's `out/<issue>/` (or the `-<what>` form, or `out/<epic>/`), its tree's `out/<issue>/` for its code, scratch prefixed with the issue number, and, when asked after a sitting, a new `design/<round>/` in the archive tree named. Never edits a file already under `design/` (kit included), a tracked file under `src/`, `test/`, `e2e/`, `public/` or `scripts/` (`scripts/design/` included, a pull request of its own), the specs, `CLAUDE.md` or a committed chart; a build in its own tree that regenerates `public/`'s generated assets is not an edit (skeptic finding 12). Never commits, branches, pushes, files, posts or touches the board; `gh` reads only. Never `npm test` or the full e2e lanes. Never moves or restores the main checkout or its tree, or removes a worktree it did not create. No AskUserQuestion: the menu goes to the dispatcher, as the implementer's does at its STOP. No em-dashes outside code.

### Hand-back

The two lines, the tree's sha, the folder's page and every file by absolute path, the measurements with their commands, the menu (each option naming its still, its own recommendation marked as its own), what it could not draw truthfully and every stand-in, defects found and not caused, for the dispatcher to file; for a breakdown, the ordered subs, the drafts and the menu.

## The rosters (re-derived with `git grep` over the agent names and `.claude/agents/`)

Edited, only where the line lists or routes the agents:
- `CLAUDE.md` Process, after "`vellum-implementer` runs one issue through that sequence in its own tree.": one sentence, the designer's two jobs and its menu going to its dispatcher. Worktrees, a bullet after the implementer's: the designer gets its tree a fourth way, never through isolation, as workflow step 6 says.
- `handbook/specs/development-workflow.md` "The agents": a paragraph after the implementer's (not a reviewer; its two jobs; its menu to its dispatcher; dispatched as step 6 says). Step 6: "such as a design round or a measurement" names `vellum-designer`, and "The dispatcher removes the tree once the stills have been ruled" gains "or the report it was built for is in" (skeptic finding 12).
- `handbook/specs/conventions.md` "Things a design round owes": "A round's agent" names `vellum-designer`; one new bullet for the archive-binding rules above.

A wider grep for prose that counts or characterises the agents finds no count of them anywhere; `CLAUDE.md`'s "Every project agent ... sets `effort: xhigh`" binds the new file and is met.

Self-joining (Gate 4 item 2), run, not edited: `test/repo/memory-pointers.test.ts` (reads every tracked file under `.claude/agents/`) and `test/repo/prose-paths.test.ts` (`PROSE_ROOTS` includes `.claude/agents`).

Read and left alone, each with its reason:
- `handbook/specs/check-placement.md`: names `vellum-plate-reader` as an instrument that checks a rule; the designer checks nothing.
- `.claude/skills/vellum-footguns/SKILL.md`: names agents inside gate items keyed to a moment of typing; no gate is due to a round, and a line needs its own incident or ruling.
- `.claude/skills/vellum-footguns/references/held-lines.md` and `scars.md`: dated records, not lists; the Issue #783 row stays true, since the designer points at the implementer's rule rather than carrying it.
- `.github/PULL_REQUEST_TEMPLATE.md`, and with it `vellum-pr-skeptic.md`'s companion-report list: Records lists the review agents a pull request owes; the designer runs before a round's pull request, not on one.
- `handbook/specs/orchestration.md`: its lists are about implementer lanes; an `out/`-only agent's dispatch is workflow step 6's.
- `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`: `vellum-implementer` only as a sample `agent_type`.
- `handbook/plans/` and `handbook/errata/`: archives and ledgers.

## Tests

None. The change is prose and frontmatter; no code a mutation can break. A test of the frontmatter would assert the declaration, not the outcome (`vellum-footguns` Gate 1 item 3); the outcome is observable only from a fresh session's debug log (Evidence 1). The prover is not owed.

## Evidence

1. The dispatch proof against the committed file, from a fresh `claude -p` launched in this worktree so the new definition loads, with the flags the probes ran under: parent `--model opus --effort low` (neither Fable nor xhigh), `--permission-mode bypassPermissions --setting-sources project,local` (this worktree's `.claude/settings.json` sets only the footgun hook; no `settings.local.json` here; no effort or model variable in `env`), `-d api --debug-file <scratch>/845-proof.log`, `--max-budget-usd 5`, and an inline `--agents` control arm with no model and no effort. The designer is dispatched with no tree, so its own first section runs the echo and its own STOP reports it; the prompt also asks it to name the tools it holds. Pass: `model=claude-fable-5-1` beside `source=agent:custom:vellum-designer`; its report opening `effort=xhigh`; the control arm `claude-opus-5-5` and `effort=low`; `permission_denials` empty in the run's JSON (skeptic finding 5).
2. `node --test test/repo/memory-pointers.test.ts test/repo/prose-paths.test.ts`.
3. `npm run check`, `npm run lint`, `npm run format:check`, `npm test` then `npm run astro:generate`. No e2e: nothing a browser renders changes.
4. A grep for an em-dash over the changed files.

## Order

Plan archived to `handbook/plans/845/845-plan.md` with the first commit; the definition and the roster edits; commit and push; the dispatch proof; the dated calls comment on Issue #845; the PR (`Closes #845`), its body naming which version of the definitions wrote and reviewed the change (workflow step 14); the cold skeptic; fixes; the final report naming the head sha, for the orchestrating session to merge on (issuecomment-6097677399).

## Plan skeptic (`vellum-plan-skeptic`, with recon's ledger), each finding and what was done

1. SHOULD-FIX, the round's code location against the sha and the tree's removal: folded (Where it stands).
2. SHOULD-FIX, the routing rule: folded for the rules that bind the archive (conventions bullet); the designer's craft stays in its definition, as the plate reader's traps stay in its own.
3. SHOULD-FIX, prose-paths would red three relative paths: folded (full paths).
4. SHOULD-FIX, a linked stylesheet that 404s still settles: folded (serve the main checkout, `diff -r` the kit, a 4xx or console error fails the shot).
5. SHOULD-FIX, the proof's permission conditions: folded (the probes' exact flags, and `permission_denials` empty in the pass).
6. SHOULD-FIX (low), the description invited STOP sittings: folded.
7. SHOULD-FIX (low), one folder per issue collides: folded (`out/<issue>-<what>/`).
8. NIT, the STOP came after the reading: folded (first section; budget $5).
9. NIT, `contextWindow` tells no variant apart: folded (not cited as evidence).
10. NIT, a tools line may deliver less: folded (the proof names the tools received).
11. NIT, Issue #845 has a second comment, the merge clearance: folded (Order).
12. NIT, three wordings: folded (step 6's removal clause; the npm rule is a pointer; `public/` reads as tracked files).
13. NIT, a session launched before the merge does not have the definition, and a pasted brief loses Fable and xhigh: carried in the lane's final report for the orchestrating session, since it concerns the first dispatch rather than the file.
