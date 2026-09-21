# Errata: the ledger of small findings

This directory holds the findings a pull request could not fix and did not deserve an issue of their own: a defect found on the way, a guard that cannot bite, a cost accepted, a check that asserts less than its body claims, a comment that drifted. One row each, under the area it belongs to:

| file | rows for |
|---|---|
| `errata/engine.md` | what the generator and the renderer put on a sheet |
| `errata/site.md` | what a visitor meets: the rooms, the charts as shown, the cards, contrast, gesture, print |
| `errata/guards.md` | what the tests, the e2e suites, CI, the hooks and the linter do not yet cover or prove |
| `errata/prose.md` | the specs, the code comments, the agent definitions, the page copy |

**A review finding has exactly three exits: it is fixed in the pull request, it is filed as an issue, or it joins this ledger as a row.** A finding left as prose in a PR body alone is a defect in the PR. The one exception is the fold: a finding the PR fixes because it caused it (an accessibility failure of its own making) or because Alex ruled the batch folded.

## A row

One line, in the file's `## Open` section, ordered by the pull request that left it:

```
- PR #N (YYYY-MM-DD, confidence): the finding, in one clause. Searched: what was searched for an existing issue, or the evidence that it still stands.
```

`confidence` is high, medium or low: high means the finding is concrete and the search was specific; low means it is a judgement call or the terms were weak. A row that a PR author disposed of as "left" without a ruling reads `Left by the author:` in place of `Searched:`, so it is visible as an author's call rather than Alex's.

Write `Issue #N` and `PR #N`, never a bare number; no em-dash; one physical line. Before adding a row, grep this directory and the open issues for the finding, since a second row for one defect is a defect here.

## How a row leaves

- **Fixed.** The pull request that fixes it deletes the row in the same diff. A fix that lands without deleting its row is incomplete.
- **Promoted.** When a row grows into work that needs a body, a menu or a sub, it is filed as an issue and the row is replaced by a pointer: `- PR #N: promoted to Issue #M.` The pointer leaves when the issue closes.
- **Ruled.** When Alex rules a row the accepted form (a DOM host write, an engine out-parameter, a cost taken with numbers in front of him), the ruling is a dated comment on the pointer issue, and the row moves to the file's `## Ruled and left` section with the ruling quoted. A ruled row is not open work; it is there so nobody re-files it, and it reopens only by a later dated ruling.

## Where this sits in the house

`errata/` is an archive at the repo root on `design/`'s and `plans/`'s pattern: not a spec, not required reading, outside the roots `test/repo/prose-paths.test.ts` walks, so a row may name a path that later moves and the history does not red. The rule that sends a finding here is `vellum-footguns` Gate 5 item 7 and `specs/development-workflow.md` step 15. The pointer on the roadmap is the issue titled "Errata: the ledger", whose comments carry the rulings.

The ledger was seeded on 2026-09-20 from a read of every merged pull request to that date (306 of them, 192 carrying findings that were left); rows from before PR #577, when the PR template gained a named slot for what was left, are best effort, since those PRs recorded the leavings under whatever word the author chose.
