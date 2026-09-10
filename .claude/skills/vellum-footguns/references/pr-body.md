# PR body shape

Every line is a claim the cold skeptic will verify against GitHub and the diff. Fill it from logs,
not from expectation. Promote to `.github/PULL_REQUEST_TEMPLATE.md` if it earns it.

```
#NNN <title>

<what changed, in a paragraph; what was NOT asked for and why it rode along>

## Guards

| assertion | mutation that reds it | red line (pasted) |
|---|---|---|

## Ran

- unit: `npm test` (<pass count from the log>)
- e2e: <suite names run locally>; NOT run: <the rest>, CI runs them
- `npm run check`

## Records

- vellum-plan-skeptic: <ran at step 4, with or without the recon ledger> / not run (say why)
- vellum-guard-prover: <link to comment> / in flight / not owed (no new guard)
- vellum-plate-reader: <link to comment> / in flight / not owed (no presentation change)
- vellum-pr-skeptic: round <n> of 3, <link to its ledger on the PR, or "relayed in chat <date>" since CLAUDE.md leaves what lands on the PR to Alex>; residue: <what was not fixed and why>

## Rulings

- calls made that the issue did not rule on: <dated issue comment link>, or none
- open decisions still Alex's: <menu was put to him at ...>, or none

## Look for these when you use it

<feel-dependent choices worth a second look live>
```

Before `gh pr create` or `gh pr edit`:

```
grep -n '—' body.md                                   # nothing
gh pr view <N> --json closingIssuesReferences         # exactly the issue you mean
```
