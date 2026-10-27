# Issue #791: the agents named together in development-workflow

**Rulings (Alex, 2026-10-06):** a roster in `handbook/specs/development-workflow.md`, one row per agent with its step, what it runs and the failure it catches; and the motivating idea, with no history: reading the code misses what running it catches.

**The plan.**
- One new section before "The sequence": the idea in one paragraph, a table of the review agents (`vellum-spec-recon`, `vellum-plan-skeptic`, `vellum-plate-reader`, `vellum-guard-prover`, `vellum-pr-skeptic`), and a line placing `vellum-implementer` as the lane rather than a reviewer.
- Each row restates the agent's own definition and the step that dispatches it, and points there for method; no row carries a rule the step does not already carry.
- No history, no counts.
- Evidence: `npm run check`, `npm run lint`, `npm test`, the prose-path test. No guard (prose), so no prover; no appearance, so no plate read; one cold `vellum-pr-skeptic` round.

**Skipped, and why:** `vellum-spec-recon` and `vellum-plan-skeptic`, since the issue is a single docs section Alex ruled in the session and is not a sub or an epic.
