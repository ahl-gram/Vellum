# Which check holds a rule

The house has four instruments, and a rule belongs in the cheapest one that can see it. Read this
file before writing a test, a lint rule or a browser check, and before moving a rule from one
instrument to another. How a guard is proven to bite is `vellum-footguns` Gate 1's; this file is which
instrument the guard belongs in.

| instrument | command | what it can see |
|---|---|---|
| the type checker | `npm run check` | what a type can say: shapes, absence, an unhandled case |
| the lint | `npm run lint` | what the code SAYS, read from its syntax tree without running it |
| the unit suite | `npm test` | what the code DOES, run in Node with inputs |
| the browser lanes and a plate read | `npm run test:e2e:lanes`, `vellum-plate-reader` | what the page COMPUTES: the cascade, layout, motion, pixels |

## The type checker

- **Make a wrong state unrepresentable before testing that it does not occur.** A union the switch
  must cover, a field that cannot be absent, a read-only record: the checker refuses the wrong code
  everywhere at once, where a test samples it.
- `npm run check` runs three passes, the root, `tsconfig.engine.json` and `tsconfig.worker.json`, so a
  type the engine and the worker see differently is caught in the tree that sees it.

## The lint

- **A rule about what the code says is a lint rule**: a construct the house forbids, an import across
  a boundary, a lookup a directory may not make, a file kind or a size, the form of a comment. The lint
  reads the syntax tree, so it is blind to comments and layout, names the line, and reaches every file
  the rule's glob covers, including the one written tomorrow.
- **The lint runs with type information** (`projectService` in `eslint.config.ts`), so a rule may ask
  what a value IS, not only how it is spelled: a promise nobody awaits, a condition that cannot be
  false. The tree runs typescript-eslint's `recommendedTypeChecked` plus the rules `eslint.config.ts`
  names, and the lint fails on any warning. A stricter rule joins one at a time, with
  its count of findings measured over the tree.
- **A house rule lives in `scripts/lint/`** and is wired in `eslint.config.ts` under a block named for
  the issue that ruled it. It is proven by its own test, which runs ESLint over a fixture the rule must
  refuse and one it must pass (`test/repo/source-shape.test.ts` carries the form). A rule with no
  fixture it refuses is a rule nobody has seen fire.
- **A switched-off check is a skip**, and the accepted skips are `handbook/specs/rulebook.md`'s list.

## The unit suite

- **A unit test runs the code and asserts what it does.** Assert the outcome, never the declaration
  (`vellum-footguns` Gate 1).
- **A unit test does not open a source file and search its text.** Where the rule under test is about
  how code is written, write it as a lint rule; where it is about what a page shows, write it as a
  browser check. A text search over source passes when the string sits in a comment, reds when a
  harmless rewrite moves it, and over CSS passes on a declaration that is present and loses
  (`handbook/specs/cascade-traps.md`).
- **A test may read a file as DATA where the file is the thing under test**: a built page, a generated
  chart or atlas, a config the house reads (`eslint.config.ts`, a workflow), or a stylesheet value the
  code's own arithmetic must match (the Glass's seat beside the slip in `test/site/room.test.ts`).
  The test reads the value and checks it against the code, never that some text is present.
- Existing tests that search source text move under this rule as each one is touched.

## The browser lanes and a plate read

- **What the browser computes is read in a browser**: a resolved style, a box, an overlap, a contrast,
  a motion. Neither the lint nor a unit test can see the cascade, so a rule about how a page looks is
  pinned here or by `vellum-plate-reader`, whose measurements decide an appearance.
- How a browser check waits and what the harness environment does is
  `handbook/specs/settle-doctrine.md`'s.

## Order

CI runs the cheap instruments first: each `check & test` job runs `npm run check` and `npm run lint`
before its shard of `npm test`, and the browser lanes build and run beside them
(`.github/workflows/ci.yml`). Run them locally in the same order: a type or lint red is the cheapest
red to read.
