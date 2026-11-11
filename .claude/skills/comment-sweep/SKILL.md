---
name: comment-sweep
description: "The weekly comment sweep, step by step: find where the last one ended, collect and judge the comments added since, cut what is not owed with its ledger, prove no code changed, scan the cuts for keepers, run the copy hunt, open the pull request and push the new tag. Use it in the weekly sitting, or when a handoff says a sweep is due."
---

# The weekly comment sweep

This is the order of the sitting and the command each step runs. It holds no rule: each step names
the line of `handbook/specs/conventions.md`, The comment sweep, that is its rule, and that section
wins wherever the two disagree. Read the section in full before step 1, and the comment doctrine it
applies, the opening paragraph of "Durable engineering constraints from shipped work" in
`handbook/specs/rulebook.md`. `<date>` is the sitting's date, written `YYYY-MM-DD`.

1. **Find the base and the head.** Run `git fetch --tags origin`; the base is
   `git tag -l 'comment-sweep/*' --sort=-refname | head -1`. The head is `git rev-parse origin/main`,
   read once and written down: the sweep reads up to it, and step 9 tags it whatever merges in the
   meantime (the section's first bullet).
2. **Collect the comments the range adds.** `npm run comment-judge -- diff <base> <head> --dry-run`
   gives the size of the run; the same without `--dry-run`, and with
   `--out out/comment-sweep-<date>`, lists every TypeScript comment the range adds beside Jev's
   answer whether a test pins it. A Jev answer is a hypothesis to check, never a verdict, a
   `SKIPPED` line is a comment nobody judged, and the key is never printed
   (`handbook/specs/check-placement.md`, the bullet opening "No check holds a judgment that rests
   on a probability"). The command reads TypeScript only, so collect the sheets' and the pages'
   added comments by hand, from `git diff <base> <head> -- '*.css' '*.astro'`.
3. **Judge each comment against the doctrine**, the trailing comments last and most conservatively
   (the section's second bullet). A line holding `rewritten for a red on CI` stays (the section's
   keeper-scan bullet).
4. **Cut on a branch from the head, writing the ledger as you cut.** Name the branch
   `chore/comment-sweep-<date>`. Every deletion made because a test pins the behaviour names that
   test in the ledger at the moment it is cut, once you have read that the test pins what the
   comment said (the section's bullet opening "Every deletion"). Commit the cuts. A week with
   nothing to cut goes straight to step 7.
5. **Prove that no code changed.** `npm run comment-sweep -- verify origin/main HEAD` must exit 0
   (the section's proof bullet). A `DIFFERS`, `ADDED`, `DELETED`, `RENAMED` or `NOT READ` line is
   fixed on the branch, never argued.
6. **Scan the cuts for keepers**, as the section's keeper-scan bullet says, and read by hand
   everything it hands you. Put each keeper fact back at its line or into the test that pins it,
   commit, and run step 5 again.
7. **Run the copy hunt over the same merges**, as `handbook/specs/development-workflow.md` says
   (Sweeps the per-sub recon does not reach), and file what that paragraph says to file.
8. **Open the pull request, if anything was cut**, titled `Comment sweep <date>: ` and what it
   cut, its body in the shape `.github/PULL_REQUEST_TEMPLATE.md` gives, carrying the ledger and what
   steps 5 and 6 printed. It has no issue, so its closing-reference line reads `No issue:` and the
   reason, as the template's own note says, its body carries the calls made
   (`handbook/specs/development-workflow.md` step 12), and the cold review follows as for any pull
   request (step 14). When a feature pull request collides with it, the feature merges first; then
   `git merge origin/main` on the sweep, and step 5 again before it merges (the section's last
   bullet).
9. **Tag the head**, a quiet week's included: `git tag comment-sweep/<date> <head>`, then
   `git push origin comment-sweep/<date>` (the section's first bullet).
