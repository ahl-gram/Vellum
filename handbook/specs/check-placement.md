# Which check holds a rule

The house has four instruments, and a rule belongs in the cheapest one that can see it, beside a
formatter that settles layout so none of them spends anything on it. Read this file before writing
a test, a lint rule or a browser check, and before moving a rule from one instrument to another. How
a guard is proven to bite is `vellum-footguns` Gate 1's; this file is which instrument the guard
belongs in.

| instrument | command | what it can see |
|---|---|---|
| the formatter | `npm run format:check` (`npm run format` writes) | layout alone: where a line breaks, indentation, quotes, commas |
| the type checker | `npm run check` | what a type can say: shapes, absence, an unhandled case |
| the lint | `npm run lint` | what the code SAYS, read from its syntax tree without running it |
| the unit suite | `npm test` | what the code DOES, run in Node with inputs |
| the browser lanes and a plate read | `npm run test:e2e:lanes`, `vellum-plate-reader` | what the page COMPUTES: the cascade, layout, motion, pixels |

## The formatter

- **Prettier owns layout** in every TypeScript file under the lint's roots and every sheet under
  `src/styles/`, at the print width in `prettier.config.ts` with every other option at Prettier's
  default. Run `npm run format` before committing; the Format step in CI runs
  `npm run format:check` on every shard. No lint rule or test holds a rule about layout.
- **What it leaves out is `.prettierignore`'s, pinned exactly by `test/repo/format.test.ts`**:
  everything outside the five TypeScript roots, so the archives under `design/` and
  `handbook/plans/` and the house's prose keep their own layout; every kind but TypeScript and CSS
  inside them, so the pages under `src/pages/` keep the markup they ship near-verbatim
  (`handbook/specs/site-architecture.md`); and the plate face tables, whose bytes
  `npm run plate-face` writes and a test pins.
- **A `prettier-ignore` comment is a skip**, on `handbook/specs/rulebook.md`'s list like any other.
- **One pass can leave a member chain unsettled.** Run `npm run format` again until
  `npm run format:check` passes.
- **A Prettier upgrade is a reformat.** `prettier` is pinned to an exact version, and a new one
  lands as a reformat commit of its own. `.git-blame-ignore-revs` can name such a commit only once
  its sha is on main, which a squash merge does not keep; how that pull request merges is Alex's
  ruling on it.

## The type checker

- **Make a wrong state unrepresentable before testing that it does not occur.** A union the switch
  must cover, a field that cannot be absent, a read-only record: the checker refuses the wrong code
  everywhere at once, where a test samples it.
- `npm run check` type-checks every config its script in `package.json` names, so a type the engine
  and the worker see differently is caught in the tree that sees it.

## The lint

- **A rule about what the code says is a lint rule**: a construct the house forbids, an import across
  a boundary, a lookup a directory may not make, a file kind or a size, the form of a comment. A lint rule
  matches syntax, so the same text in a comment or a string neither trips it nor satisfies it, and a
  comment rule reads the comments themselves. It names the line, and it reaches every file the rule's
  glob covers, including the one written tomorrow.
- **The lint runs with type information** (`projectService` in `eslint.config.ts`), so a rule may ask
  what a value IS, not only how it is spelled: a promise nobody awaits, a condition that cannot be
  false. The rule sets are the ones `eslint.config.ts` extends plus the rules it names, and the lint
  fails on any warning. A stricter rule joins one at a time, with
  its count of findings measured over the tree.
- **A new house rule lives in `scripts/lint/`** and is wired in `eslint.config.ts` in the block that
  already reaches the same files with the same plugins, or, where none does, in a new block named for
  what it covers (one that names a single file also cites the issue that admitted it, which
  `test/repo/lint-wiring.test.ts` requires); the rule's file and git keep the issue that ruled it. It is proven by its own test, which runs ESLint over a fixture the rule must
  refuse and one it must pass (`test/repo/source-shape.test.ts` carries the form). A rule with no
  fixture it refuses is a rule nobody has seen fire.
- **A switched-off check is a skip**, and the accepted skips are `handbook/specs/rulebook.md`'s list.
- **The lint toolchain's `minimatch` is held past an advisory by `overrides` in `package.json`**,
  because `eslint` and `typescript-eslint` still ask for a version the advisory names (Issue #1174).
  At each `eslint` or `typescript-eslint` upgrade the override is removed, `npm install` and `npm
  audit` are run, and the entry is kept if the `minimatch` findings return; it leaves when they do not.
  The audit decides, not one package's declared range, since `@eslint/config-array` asks for
  `minimatch` as well. Any change to the entry compares what the lint reaches before and after: the
  files ESLint lints and the rules `calculateConfigForFile` gives each.

## The unit suite

- **`npm test` runs the `.test.ts` files under `test/` and nothing else** (`SUITE` in
  `scripts/unit-suite.ts`), so nothing under `out/` or any other folder is ever collected. A path
  after `npm test --` runs that path alone, and a flag after it reaches `node --test`, written as
  `--flag=value`, since a value written as its own word reads as a path and the run falls back to
  `node --test`'s own collection of the whole checkout. The one flag that does not reach it is
  `--test-shard=<k>/<n>` with no path beside it: the launcher runs the `k`th of `n` parts that
  `shardOf` in `scripts/unit-shards.ts` deals by measured seconds
  (`handbook/specs/site-architecture.md`, the bullet opening "`UNIT_SECONDS` is read from CI's own
  unit logs"). A suite outside `test/`, or under it under
  another name, never runs, and `test/repo/test-collection.test.ts` reds one whose name is in
  `node --test`'s own family.
- **A unit test runs the code and asserts what it does.** Assert the outcome, never the declaration
  (`vellum-footguns` Gate 1).
- **A unit test reaches a check on every path.** `vellum/test-unskippable-check` in
  `scripts/lint/skippable-checks.ts` refuses one whose every check an early `return` or `continue`
  can skip, or an `if` with no checking `else` can pass by; a deliberate case is an entry in
  `SKIPPABLE_TESTS` there with its reason (Alex, Issue #1315 comment 6785163784).
- **A unit test of date logic passes its own date**, as `test/world/seed-of-the-day.test.ts` passes
  each `Date` it asserts on, and no unit test reads the clock as a day. A browser check's day is the
  harness's (`handbook/specs/settle-doctrine.md`, The environment, the bullet opening "Every page the
  harness opens").
- **A unit test does not open a source file and search its text.** Where the rule under test is about
  how code is written, write it as a lint rule; where it is about what a built page carries, read the
  built page as the next bullet says; where it is about what the browser computes, write it as a
  browser check. A text search over source passes when the string sits in a comment, reds when a
  harmless rewrite moves it, and over CSS passes on a declaration that is present and loses
  (`handbook/specs/cascade-traps.md`).
- **A test may read a file as DATA where the file is the thing under test**: a built page, a generated
  file (a chart, a face table), a config the house reads (`eslint.config.ts`, a workflow), or a
  stylesheet value the code's own arithmetic must match (the Glass's seat beside the slip in
  `test/site/room.test.ts`). The test checks what the file holds: a value against the code that must
  agree with it, or a config's shape. **A new claim about what a built page carries is read in
  `test/site/built-pages.test.ts`** (Alex, 2026-11-08, Issue #1273): its markup and attributes, the
  names it gives its controls, its links, the files it names, and what it serves with scripts off.
  That file builds the site once and reads each page as text or as the document `documentOf` in
  `test-support/built-dom.ts` parses with `linkedom`, a development dependency only the tests use,
  with its longer reads kept under `test-support/built-reads/`. A new claim is a test in
  `test/site/built-pages.test.ts` rather than in a file that builds the site again, and a page joins
  the rosters `test/site/astro-scaffold.test.ts` keeps where `handbook/specs/site-architecture.md`
  says (How a page is authored). Finding the anchor first (`vellum-footguns` Gate 1) is part of
  reading the file, not the check, and how such a reader goes blind is `vellum-footguns` Gate 7's.
- **A lint rule's witness may read the source the rule keys on**, to show the rule still has
  something to hold where the rule cannot say so itself.
- **`npm test` checks both rules file by file.** `test-support/source-read-guard.ts` fails a test
  file that reads a source file (TypeScript under `src/`, `e2e/` or `scripts/`, a page, a stylesheet
  under `src/styles/`) unless `SOURCE_READS` in `test-support/source-read-list.ts` names the read, or a
  folder holding it, for that file, and fails an entry the file no longer reads. A data read or a
  witness joins the list with its kind. The tests kept when Issue #779 closed, each guarding what no
  instrument here reaches, carry the kind `kept`: one leaves the list when it moves to a lint rule or
  a browser check, and none joins it. The guard cannot tell a new read in a listed file from the
  listed one, nor see a read that code under `src/`, `scripts/` or `e2e/` makes for the test; review
  holds those.

## The browser lanes and a plate read

- **What the browser computes is read in a browser**: a resolved style, a box, an overlap, a contrast,
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  pinned here or by `vellum-plate-reader`, whose measurements decide an appearance. A claim of dress
  alone (a colour, a size, a rounding, a shadow, a hover or focus colour, how a motion is staged) is
  not written as a browser check: `vellum-plate-reader` measures it when it is built or changed, and
  it is checked by eye (Alex, 2026-11-09, Issue #1273). It is written as one only where a reader must
  reach a press or see it answer the hand, where a ruling sets a floor for reading or typing (4.5:1
  over the chart, the 16 px a typing field takes), and in the Specimen Book's own suite, `specimen`,
  which holds every piece of the kit in each state so the Book does not go stale (Alex, 2026-11-08,
  Issue #1273).
- **A number the room's layout decides is read from the layout in the run, never copied from one
  machine's.** Which press of the Glass fills the screen, a fill depth, a clearance between two
  pieces, a contrast over a ground and a piece's travel all move when a browser lays a room out a
  few pixels off (`handbook/specs/settle-doctrine.md`, Where the Mac and the CI runner disagree), so
  a check holding the number one machine gave reds on the other as if the code were wrong. The same
  holds for a number the check steers by, such as how many presses carry it past the fill. Read it
  off what the run lays out, the room's own fit (`fillOf` and `fillPressOf` in
  `e2e/suites/slide-away/kit.ts`, `fillOf` in `e2e/suites/stage/slide-kit.ts`) or the measured box,
  and assert the relation the rule names: SW2's `thirdPress` in `e2e/suites/slide-away/rooms.ts`
  presses up to the press that fills, whichever it is, never a count written in advance. A witness that the
  fixture reaches its case asserts that relation too, never the count one machine gave. The window a
  check opens is its own input, but whether the layout there reaches the case is a reading: a
  witness names an instance when it faults because that one room or window misses its case, and
  where the case is such a reading held against a line, a fill against a press's depth or a
  contrast against the floor, the witness carries one dated line beside the list of what it names,
  giving each instance's reading on both layouts and its margin to that line, the runner's taken as
  the next bullet says. `ARMS` in `e2e/suites/slide-away/rooms.ts`, the windows `thirdPress` asks to
  fill at the third press or later, owes that line. The one exception is a witness that a read can
  see its panel fail, by reading under the contrast floor with the panel taken away, over more than
  one room: it may instead ask at least one of them and carry no line. A plan prints a browser check's reading on its fixture and its reading under the mutation,
  both off the plan's own build on one machine, before the check is built (the Tests line of
  `.claude/agents/vellum-planner.md`); neither is the second layout's reading a dated line carries.
- **A ruled number may stay a literal; a measured one is read, or bounded on both layouts.** Ruled
  is a size or margin a ruling sets in pixels, a value a rem token gives at the 16 px root where the
  token holds one value wherever it is read, and a floor the design sets, such as 4.5:1 for
  contrast: each stands as a named constant whose one dated line names the ruling or the token. A
  token a page redeclares is read from the page (`handbook/specs/ui-design.md`, the paragraph
  opening "Derive a clearance from the token"). Measured is any number one run of the layout
  produced: a press count, a fill depth or a range around it, a depth chosen between two fills, a
  clearance, a contrast, a travel, and a bound that places a line a ruling names only in words, such
  as "on the thin top line", since the ruling set the line and not its pixels. Where no read of the
  layout gives a measured number, measure it on both layouts and set the bound above the worse with
  its headroom named, on the dated line `CLAUDE.md` gives a bound (Process, the bullet opening "A
  bound is derived"). The runner's reading comes from a run on GitHub's machines, the CI workflow's
  or the proof runner's, never from a local run with the runner's layout staged, for the reason
  `handbook/specs/settle-doctrine.md` gives in its environment bullet opening "CI's browser lays a
  chart room's furniture out". Neither kind takes in a check's own inputs (the window it opens, the
  address it loads, the press its claim names) or a constant the product sets that the check writes
  again (the Glass's step), since the layout decides neither; such a constant that a ruling sets as
  a size in pixels, as the clearances `travelsOf` in `e2e/suites/stage/slide-kit.ts` writes again
  are, is ruled, and one a ruling sets as a duration is neither. A tolerance around a relation, a
  window a check holds a ruled clearance within among them, is a bound, derived as `CLAUDE.md` says.
- **A browser check is written, and kept, for what it holds against what it costs.** Each one a
  change adds or makes longer carries its ledger line (Alex, 2026-11-08, Issue #1273), in the plan
  that adds it and in the pull request body: the critical journey it serves; why no unit test can
  hold each of its claims (the bullet below); and, for each room, window, page, seed or path it reads
  past the first, what that one alone runs. What it holds and what it costs are counted as
  `handbook/specs/settle-doctrine.md` says (What a step holds, Who finds a slow step). A check whose
  coverage would be needless on a ground that file names is not written, and a page whose journey
  Alex has not ruled goes on the plan's menu before a check is written there. When a slow one is
  pulled out of the run, and when one is deleted, is `handbook/specs/settle-doctrine.md`'s (When a
  check leaves the run).
- **A claim goes to a unit test wherever one can hold it alone, a new claim as well as one a
  deleted browser check held (Alex, 2026-11-08, Issue #1273).** The test checks that one claim and
  nothing beside it, runs fast, and gives the same answer on every run: no browser, no wall clock,
  no dependence on the order tests run in. It keeps the rules of "The unit suite" above, it is
  proven as any new guard is (`handbook/specs/development-workflow.md` step 11), and a moved claim's
  test is written before the check is deleted, with the mutation that reds it named. Where page
  code has to change for a unit test to hold the claim, the change is source work written test
  first, and new page code is shaped the same way from the start: the function takes its inputs (a
  clock, a reduced-motion flag, a measured box) as arguments and returns its
  result, so one test can drive it and read the answer. A move never adds a browser check: a claim
  that only a real browser's layout or paint, a real pointer or a real clock shows stays in a
  check that stays, or is listed as lost coverage as `handbook/specs/settle-doctrine.md` says
  (When a check leaves the run).
- How a browser check waits and what the harness environment does is
  `handbook/specs/settle-doctrine.md`'s.

## What no check holds

- **No check holds a dependency advisory.** Whether a package the tree installs has a published
  advisory is a fact about the day, not about the commit: the same commit passes one evening and
  fails the next morning when an advisory lands, which is the flake `handbook/specs/settle-doctrine.md`
  keeps out of the browser lanes. So no workflow under `.github/workflows/` runs `npm audit` as a step
  that can fail, and no test or lint rule reads one. Advisories reach Alex as the repository's
  Dependabot alerts; a session reads them with `gh api repos/ahl-gram/Vellum/dependabot/alerts` and
  with `npm audit`, and acts on them as an issue (Issue #1174). `npm audit --omit=dev` reads only the
  libraries the pages ship, the `dependencies` in `package.json`, since the tools that build the site
  are `devDependencies`.
- **No check holds a judgment that rests on a probability.** These commands ask TypeSafe's Jev:
  - `npm run comment-judge` (`scripts/comment-judge/main.ts`), whether each comment a diff adds
    only restates its code or is already pinned by a test (Issue #1304);
  - `npm run recon-triage` (`scripts/recon-triage/main.ts`), whether the code an issue cites does
    what the issue's claim says, which orders `vellum-spec-recon`'s reading (Issue #1310);
  - `npm run keeper-scan` (`scripts/keeper-scan/main.ts`), whether each comment a diff deletes
    carries a keeper fact its file no longer says, which a comment sweep's ledger carries
    (Issue #1320);
  - `npm run still-judge` (`scripts/still-judge/main.ts`), how two versions of one chart compare on the four
    questions in `scripts/still-judge/questions.ts` (each realm name readable, the rainfall lines leading, every name
    in a piece readable, the title read first), a difference under 0.12 counting as none and no one picture's number
    read as a pass or a fail, its trial scored against three defects the house fixed and one invented, put back on
    today's chart (Issue #1309);
  - `npm run copy-hunt` (`scripts/copy-hunt/main.ts`), whether a function a diff adds or changes
    implements the same logic as another under the lint's roots, which `vellum-pr-skeptic` runs on
    every pull request (Issue #1319); the exact copies it lists are found by code, with no call.

  Their answers are probabilities from a service whose model changes from version to version, so a
  red resting on one is a guard no prover can show bites. No call of theirs is made, and no
  answer of theirs asserted, in an `npm test` file, and none runs in a lint rule, a workflow step
  that can fail or a refusal of the footgun hook; what each reports is a
  reader's hypothesis that a command still confirms; and a call that fails is reported as skipped,
  never as nothing found. Each reads the key from `TYPESAFE_API_KEY`, then from
  `~/.config/typesafe/key`, and never prints it (`readKey` in `scripts/jev/system-one.ts`); where
  neither holds one, as in the cloud routine's environment, every call is skipped before it is
  sent. A pull request that moves `MODEL` in `scripts/jev/system-one.ts` runs the `trial` of each
  command that has one and posts every score on itself.
- **No check holds that a comment sweep changed no code.** A pull request runs the checks `main`
  runs, its one exception the docs-only lanes, read from the changed files alone
  (`handbook/specs/site-architecture.md`, the bullet opening "A pull request runs every check"),
  and `main` has no sweep to verify, so `npm run comment-sweep -- verify`
  (`scripts/comment-sweep/main.ts`) is run by the sweep's sitting and by the cold review, as
  `handbook/specs/conventions.md` (The comment sweep) says. It is deterministic, and its own unit
  tests hold what it reads.

## Order

CI runs the type checker, the lint and the format check before the unit suite, and the browser
lanes in jobs of their own (`.github/workflows/ci.yml`), so a type, lint or layout red is the first
and cheapest red to read.
