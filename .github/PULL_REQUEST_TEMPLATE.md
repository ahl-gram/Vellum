<!-- Every line here is a claim the cold skeptic will verify against GitHub and the diff. Fill it from logs, not from expectation. A section with nothing to report still stays: "None. This PR carries no test." is a valid Guards section. EDITING THIS FILE: every `## ` line in it is enforced on `gh pr create` and `gh pr edit`, so guidance goes in a comment like this one and never in a heading; and adding a section is RETROACTIVE, since the next `gh pr edit` against a PR opened under the old shape is refused for skipping it, which is the routine edit that folds a skeptic ledger into a body at workflow step 15. -->

#NNN `<title>`

Closes #NNN

<!-- The closing reference is what lets the merge close the issue instead of leaving it open for someone to shut by hand: on a PR whose base is `main`, `gh pr view <N> --json closingIssuesReferences` has to list exactly the issue this PR is for. Read it again after the body rewrite at workflow step 15, because `gh pr edit --body-file` does not start from this file and nothing refuses a body that dropped the line. A PR with no issue writes `No issue:` and the reason in its place rather than deleting the line, with no issue number in that sentence, since a negation beside a close keyword and a number is read as closing that number anyway and the hook denies the call. A PR that HAS an issue and deliberately leaves it open, one of a pair say, writes `Issue: #N, stays open because ...` in the same place, with no closing keyword anywhere beside the number for that same reason: `closingIssuesReferences` is then empty by intent, and checking it is how you tell that apart from the line having been dropped. The rest of the grammar, one keyword per reference and what a feature-branch base does to it, is `vellum-footguns` Gate 5 item 5. -->

`<what changed, in a paragraph; what was NOT asked for and why it rode along>`

## Guards

| assertion | mutation that reds it | red line (pasted) |
|---|---|---|

## Ran

- unit: `npm test` (`<pass count from the log>`)
- e2e: `<suite names run locally>`; NOT run: `<the rest>`, CI runs them
- `npm run check`

## Records

- vellum-plan-skeptic: `<ran at step 4, with or without the recon ledger>` / not run (say why)
- vellum-guard-prover: `<link to comment>` / in flight / not owed (no new guard)
- vellum-plate-reader: `<link to comment>` / in flight / not owed (no presentation change); and, where the ruling at workflow step 6 was made from stills, `<that sitting's run>` / not owed (the ruling was not an appearance)
- vellum-pr-skeptic: round `<n>` of 3, `<link to its ledger on the PR, or "relayed in chat <date>" since CLAUDE.md leaves what lands on the PR to Alex>`; not fixed here: `<each as Issue #N or an errata/ row, with the reason>`, or none

## Rulings

- calls made that the issue did not rule on: `<dated issue comment link>`, or none
- open decisions still Alex's: `<menu was put to him at ...>`, or none

## Look for these when you use it

`<feel-dependent choices worth a second look live>`
