# The settle doctrine for e2e

Ratified by Alex across #526 (RS30) and #529 (three rounds), landed in PRs #527, #533 and #536,
and re-learned on the session's own new suites in #535, #537, #542 and #545. Written here because
it lives only in issue comments.

1. **The defect is the statistic, not the threshold.** A bound that fits one machine breaks on the
   next. Before widening a number, ask what the check is measuring; RS30 measured wall-clock
   quantization and read 2.76 to 4.31 on unchanged code against a fixed 3.
2. **Read the engine's own clock.** A pace is a rate over the engine's ticks, never a wall window.
3. **A blind sleep becomes a poll to rest.** Poll a geometry or a counter until it stops moving.
4. **The settle THROWS on timeout, and a `step` catches it.** A settle that returns its last read
   hands the check a stale snapshot that passes, so the throw stays; what #534 changed is where it
   lands. Wrap the gestures, waits and checks that make up one numbered check in
   `step("CL5", async () => ...)` (`makeStep` in `scripts/e2e/step-support.mjs`), and a timeout
   fails THAT check by its own code, with the wait's label and last read as the payload, while the
   groups after it still run. A throw outside every step is contained one level up by `runSelected`,
   which records it as that suite's own red and runs the rest of the lane. Only a browser that has
   gone away still reaches `HARNESS ERROR` and exit 2, which is what keeps that string meaning
   infrastructure.
5. **The predicate requires the geometry to have LEFT where it began.** Stillness at the start is
   indistinguishable from stillness at the end. Record the starting rect and demand a departure
   before demanding rest.
6. **The predicate never carries the check's own claim.** A settle that waits for "the drawer is
   open" cannot then be the evidence the drawer opened.
7. **Pin the transition duration.** A settle with a generous budget can wait out a 10x regression
   and pass; a second assertion on elapsed time against the pinned duration catches it.
8. **`waitSettled` proves the draw, not ambient stillness.** Wait on the draft counter or the
   commit the gesture requested, and let stale in-flight commits pass by.
9. **Same-URL `Page.navigate` returns on the stale document.** Navigate to a different URL first,
   or wait on a token the new document sets.
10. **Region-job settles scale with the runner.** 20s on CI where 6s passes locally; derive the
    factor from a measured worst case and date it at the constant.
11. **Stop-gap for a flake biting a content-only PR (#526, 2026-09-07).** The check keeps taking
    and logging its measurement but stops asserting, with the issue number at the line, until the
    fix lands alone.
12. **A CI flake leaves a trail.** A PR comment with the payload and what to capture next; it is
    never silently re-run away (#546's CD7b).
