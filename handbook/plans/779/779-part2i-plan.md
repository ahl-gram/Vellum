# Issue #779 part 2i: the close of the sorting pass

**Planned at**: `origin/main` `f41b4f3c` (PR #889 on top of `e1babf66`; PR #889 changes two source comments, in `src/layouts/Vignettes.astro` and `src/site/shared/zoom-controller.ts`, and moves nothing this plan reads), Issue #779 at 58 comments, the 58th being the rulings below.
**Rulings**: https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6153462095 (Alex, 2026-10-13): D1 sort by whether anyone could ever see it, D2 the check that runs with the unit tests, D3 the witnesses kept as an allowed read, D4 one lint rule for the 22 imports; no further condition.
**Archive**: `handbook/plans/779/779-part2i-plan.md`.
**Open decisions**: none.

## Specs

The implementer reads these first, beside what `CLAUDE.md`'s spec table owes for the work:

- `handbook/specs/check-placement.md`: The unit suite (all of it; this plan rewrites its last bullet and widens the data bullet), The lint (the house-rule bullet: block placement, the test form).
- `handbook/specs/development-workflow.md`: steps 7 to 15, and step 8's archive bullet.
- `handbook/specs/rulebook.md`: The accepted lint and type-check skips, including the `eslint-suppressions.json` paragraph (a deleted test can free a listed function).
- `handbook/specs/conventions.md`: How code is cited (comments this plan edits cite code), and the no-volatile-state rule.
- `handbook/specs/settle-doctrine.md`: before editing RH7 in `e2e/suites/runninghead.ts`.
- `handbook/errata/README.md`: how a row leaves (fixed, narrowed) and the row form.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (items 4, 10, 14, 16, 21) and Gate 7 before any test here; Gate 5 before the push and the body.

## What binds this part

- **Body ruling 2 (Alex, 2026-10-05)**: a unit test does not open a source file and search its text; a test may read a file as data where the file is the thing under test; "Existing tests move as each is touched, and part 2 sorts the rest."
- **Part 2's menu, comment 6055743231**: ruling 6 (pins that only keep a removed feature from coming back, or repeat a declaration: deleted; applied by 2e to its fifteen named rows only, 2e call 5); ruling 8 (each later pull request runs its own recon and plan skeptic and stops for Alex only at a decision that sitting did not cover); ruling 9 (what counts as source: TypeScript under `src/`, `e2e/` and `scripts/`, a parser read included, page files, stylesheets under `public/`; a config the house reads is data; the census's call 2 left committed generated files out of source). Its closing line: "Left for the pull request that meets each: the witness tests, a rule refusing new source reads, the spec line on moving tests as each is touched, and the `is:inline` pins (Issue #600)." The census's program row for 2i (`handbook/plans/779/779-part2-plan.md`) says the rule is "put to Alex there" and the spec line "changes in 2i".
- **Ruling 3 of comment 6098118329**: the import pins stay as small leftover unit tests for part 2i.
- **Comment 6090198881**: a stop on the named check's own read counts as that check failing; **comment 6142497257** item 2: a stop in a check's own settle does not, so AK6.a3 is a HOLE and AK6 stays for 2i (comment 6142557886).
- **Merge clearance 6050922197** and the carry-through 6092705921: the orchestrating session merges each part 2 pull request when its review round is done and CI is green.
- **The `is:inline` pins are done**: none remains (`git grep -n "is:inline" -- test e2e scripts` prints only a doc comment at `test/site/astro-scaffold.test.ts:39`); Issue #600 owns the word and `handbook/specs/site-architecture.md`'s "contractual" sentence (6091335054 item 1, 6133488428 item 1) and stays open. This part does not touch either.

## The population, measured

The planner ran the whole unit suite at `e1babf66` twice in its own tree: once plain (2718 of 2718 pass, 74.5 s) and once under a read recorder preloaded with `--import`, which logged every `readFileSync`, `readFile`, `fs/promises` `readFile` and `readdirSync` with the test file and the first stack frame that called it (2718 of 2718 pass, 80.2 s). A read counts as a test's own when that frame is a file under `test/` or `test-support/`; a source file is TypeScript under `src/`, `e2e/` or `scripts/`, a page under `src/`, or a stylesheet under `public/` outside the generated trees. A listing (`readdirSync`) reads names, not text, and is not counted. The recorder's two blind spots, both toward a smaller count: a read made by a child process, and one made by a library (ESLint, TypeScript, Astro) on the test's behalf.

**The list in C is checked against this tree already.** A prototype of the guard (C), rooted at the planner's tree and handed C's list, ran the whole suite at `e1babf66` twice, the second time with the plan skeptic's two fixes (the root realpathed, and the caller taken as the first frame after the guard's own): both runs named no unused entry, and the same 49 unlisted reads in 19 files, every one a read of a test this plan deletes or moves (the first two tables of the ledger), and no other. The fixed prototype passed every planted case of T10, including a root under macOS's symlinked temporary folder and a test's static and dynamic imports under `--stack-trace-limit=100` (each child run about 0.14 s). Prototype and probes are scratch files, `779-2i-proto/` in the session's scratchpad, and are not the build.

**PR #890 (Issue #860, open at `66940d4a`) needs no row.** Its new `test/repo/proof-runner-workflow.test.ts` reads `.github/workflows/ci.yml` through `uncommented` and `topBlock`, a workflow, which `isSource` (C) does not match and `handbook/specs/check-placement.md` counts as data; its `test/repo/e2e-tiers.test.ts` change is one test title and changes no read (`git diff f41b4f3c 66940d4a -- test/repo/e2e-tiers.test.ts test/repo/proof-runner-workflow.test.ts`, read at planning). If it merges first, the build follows the stop condition's exception for `test/repo/e2e-tiers.test.ts` and needs nothing else.

**37 test files make 1634 distinct own reads of source text, in 74 tests**, and a 75th handed to 2i by name, astro-scaffold's "the shell carries no retired cluster dress", searches the built sheet rather than source. 27 of the files name in themselves every path they read, 2 build it in a template (`test/site/glossary-sections.test.ts`, `test/site/astro-scaffold.test.ts`), and 8 reach it through a folder walk, a shared reader in `test-support/` or a path built in another module (`test/prospect/plate-face.test.ts`, `test/repo/console-support.test.ts`, `test/repo/constant-contracts.test.ts`, `test/repo/e2e-tiers.test.ts`, `test/repo/lint-wiring.test.ts`, `test/repo/type-check.test.ts`, `test/site/sheet-height.test.ts`, `test/site/tip-affordance.test.ts`). Every test handed to 2i by name is among the 75, and recon checked each name on main; two read no source file and sit outside the 75 (GR6, call 3; `test/repo/e2e-read-types.test.ts`, call 6), and one is an e2e suite's own read (RH7, below).

## The ledger, and each test's fate

**The deletion test** (call 1): a pin goes only where no reader, on any browser or display, could ever see the thing it pins broken: a retired name, rule or file staying gone; a rule, token or write declared once rather than twice where a second copy would repeat the first; the order of two steps in one synchronous task; a rule for an element no page wears; a value restated that no reader can tell from what it replaces. Those are ruling 6's two classes, widened past its fifteen rows by Alex's D1 ruling. A pin on something a reader elsewhere would see (Safari's own spelling, a 3x display, a visited link's colour, time, a hand copy drifting from its source when that source moves) stays.

Line numbers are at `e1babf66`; a test is named by its file and the opening words of its title.

### Deleted (38 tests, and the like halves of six more): nothing any reader could ever see

The six halves: CT7c's `lastManifest` absence; PRR6's `aspect?` type pin and its revoke-order pin (the order is PR24d's, proven in 2g); ER7's order half (two calls in one task); RBR6's `rowText` export pin (the build and `test/site/ribbon-row-text.test.ts` hold it) and its `k: LEAN_K` pin (`LEAN_K` has no reader but that line); the walnut test's `rgb(255 250 235` absence (a retired wash). Each goes on the D1 ruling.

| file | test | class |
|---|---|---|
| `test/site/atelier-kit.test.ts` | AK7 "the camera's keys slip and home's own camera presses stay retired" (L18) | retired names |
| same | AK8 "home's camera has one seat rule, at every width" (L31) and the comment above it (L30) | declared once |
| `test/site/reading-room-room.test.ts` | RR-room 2 "the runtime colophon builder stays retired" (L14) | retired name |
| same | RR-room 7 "a pace press tells the engine before it marks the frame's face" (L84) | two steps in one task |
| `test/site/print-room-room.test.ts` | PRR7 "the css carries no rule for the desk a chart room retired, and ends with its print block" (L41) | retired rules; the block's place (the greedy regex passes a moved block) |
| same | PRR9 "the room's aspect asks the page face before the turned plate" (L55) | order of two values never both present |
| same | PRR10 "the page face's scale derives from the measure's one reference width" (L63) | a hand copy PR33 already reds (the sheet writes 900px too) |
| same | PRR-table "the road on to the Portfolio is written in one place" (L67) | written once |
| `test/site/prospect-room.test.ts` | PPR7 "the css carries no rule for furniture a chart room retired, and ends with its print block, which prints the plate by height auto" (L27) | retired rules; the block's place; a restated literal |
| same | PR-lay "the filing handler keeps the gate's own answer and reads its refusal before the table moves, and the press's own rule is declared once" (L38) | an accepted answer is exactly the append; a vacuous order; declared once |
| same | PR-table "the filing handler writes the device before the address" (L60) | two steps in one task |
| `test/site/ribbon-room.test.ts` | RBR7 "the css carries no rule for furniture a chart room retired, and ends with its print block" (L36) | retired rules; the block's place |
| `test/site/explorer-room.test.ts` | ER6 "the page css revives no 1100px column and ends with its print block" (L12) | retired rule; the block's place |
| `test/site/portfolio-room.test.ts` | PFR3 "the reserved-place predicate and the drawable filter it fed stay gone" (L17) | retired names |
| `test/site/chart-drawer.test.ts` | CT7b "a draw drops the pinned card before it rebases the camera" (L351) | two steps in one task |
| `test/site/living-chart-css.test.ts` | LC3 "the raised town's rule and the card's rule are each declared once" (L26) | declared once |
| same | LC4 "the card's action row, its filing press and its refusing face are each declared once" (L31) | declared once |
| same | LC5 "the philologist's note and its roots are each declared once" (L36) | declared once |
| same | LC6 "the flipped card's rule and the card's own rule are each declared once" (L41) | declared once |
| same | LC7 "every card variant is declared once, and its transform carries one translate and one scale" (L46) | declared once; a repeat composing to the same matrix |
| `test/site/room.test.ts` | "the kit's print blocks scope every message-box stand-down to the stage" (L19) | a selector's form: every box stands in a stage |
| same | "the kit's fade arms stand on a chart room's stage and name no page's id" (L54) | a selector's form; RH26 reads every room's fade |
| `test/site/house-style.test.ts` | "the status role's colour is ink-faded, a colour no served pill wears" (L17) | CSS no element wears (the PR #835 row) |
| same | "home's sheet keeps no dress for the notice panel that left with its section" (L27) and the comment above it (L26) | retired rule |
| `test/site/shell-css.test.ts` | "motion.css declares each raise/press token once" (L120), with `RAISE_TOKENS` and the comment above it (L117 to L118) | declared once; P34 reads each token's value |
| `test/site/shell-css-ground.test.ts` | "the deep's focus ring names the footer's links beside the cluster's" (L24) | CSS no element wears: the footer carries no link (2f's prover, M10) |
| `test/site/glossary-sections.test.ts` | "no TOC dress survives in the document rooms' sheets" (L6), the file's only test | retired rules |
| `test/site/astro-scaffold.test.ts` | "no page's source opens its own html or head" (L318) and the comment above it (L317) | the parser drops both (measured in 2f) |
| same | "the shell carries no retired cluster dress" (L560) | retired rules (read from the built sheet) |
| same | "a page with no survey sheet keeps the interim desk" (L567) | dead with the desk-panel CSS (the PR #833 site row) |
| `test/site/gallery-room.test.ts` | GR1 "the Gallery's source keeps the fog and the grid ahead of the corner and the legend" (L41) and the comment above it (L40) | the layout re-seats the slot, so the order never reaches the page |
| `test/site/landfall-prose.test.ts` | "input.ts carries no card guard, the slip's wheel handler opens on its scroller lookup, and the stage's tap guard spares links beside buttons" (L57) and the comment above it (L56) | a retired guard; a pin on its own pins; an arm for a link no stage carries |
| `test/site/reading-frame.test.ts` | "#442 no rule dresses a drop cap in the live row" (L188) | a rule for an element no row carries |
| same | "the Explorer's sheet revives no scroll cap for a journal" (L231) | retired rule |
| same | "#493 the pace's keyboard arm stands four classes deep beside its hover arm" (L275) | a depth nothing competes with |
| `test/site/reading-frame-log.test.ts` | "the frame's sheet keeps no retired row state" (L125) | retired names |
| same | "the frame's sheet carries no reduced-motion block of its own" (L136) | a block agreeing with motion.css computes the same; RA10 reads a disagreeing one |
| `test/site/app-bundles.test.ts` | "the retired spawn target stays retired; vellum/worker-spawn-static holds the spawn's form" (L31) | retired names |

### Moved into the lint (9 tests, plus the import halves of PRR6 and CT9): the D4 ruling

These pin that a module imports a shared binding and uses it. `vellum/shared-binding-imported` (below) holds every one, by syntax, so a comment can no longer satisfy them (the PR #724 row on HZ2).

| file | test | imports it held |
|---|---|---|
| `test/site/reading-room-room.test.ts` | RR-room 5 (L21) | `src/site/reading-room/seats.ts`: `bindRoom`, `createZoomController`, `bindGlassKeys` |
| `test/site/prospect-room.test.ts` | PPR6 (L13) | `src/site/prospect/seats.ts`: the same three |
| `test/site/ribbon-room.test.ts` | RBR6 (L12) | `src/site/ribbon/seats.ts`: the same three (its other halves are D1's) |
| `test/site/hunt-zoom.test.ts` | HZ2 (L12) | `src/site/seed-of-the-day/app.ts`: `createZoomController`, used |
| `test/site/explorer-room.test.ts` | ER7 (L17) | `src/site/explorer/app.ts`: `bindRoom` (its order half is D1's) |
| `test/site/announce.test.ts` | "both rooms that announce on a status pill import the one announcer" (L149) | `src/site/explorer/app.ts` and `src/site/portfolio/app.ts`: `makeAnnouncer` |
| `test/site/portfolio-room.test.ts` | PFR1 (L9) | `src/site/portfolio/app.ts`: `usesWorker` from `../explorer/worker-client.ts` |
| same | PFR4 (L22) | `src/site/portfolio/app.ts`: `deviceStorage` from `../shared/table-store.ts` |
| `test/site/table-address-prospect.test.ts` | TP2 (L30) | `src/site/explorer/app.ts`: `filingAt`; `src/site/prospect/app.ts` and `src/site/explorer/chart-drawer.ts`: `prospectItemFrom` |
| `test/site/print-room-room.test.ts` | PRR6's import half (L15) | `src/site/print-room/seats.ts`: the three |
| `test/site/chart-drawer.test.ts` | CT9's import half (L362) | `src/site/explorer/app.ts`: `deviceStorage` |

### Kept on the list (28 tests in 23 files)

**Witnesses (8), kind `witness`** (the D3 ruling): `test/site/atelier-kit.test.ts` AK6 (L10, `vellum/explorer-no-glass-keys`; also the only check that the kit's binding reaches the fit press, AK6.a3 being a HOLE); `test/site/hunt-zoom.test.ts` HZ4 (L22, `vellum/hunt-fixed-world`); `test/site/tip-affordance.test.ts` "the authored roster is exactly the css-bearing sources under src/" (L38, `SRC_CSS_FILES`); `test/repo/console-support.test.ts` "some e2e file imports the shared drop" (L115) and "the accumulator is still the consoleErrors field" (L122); `test/repo/constant-contracts.test.ts` "a worker spawn stands under src/site" (L129); `test/repo/e2e-tiers.test.ts` "the harness hands out exactly the two throwing waits" (L301); `test/repo/lint-wiring.test.ts` "every name no-param-reassign excuses is borne by a parameter somewhere" (L520).

**Data (8 tests), kind `data`**: `test/site/room.test.ts` "the Glass's computed seat beside an open slip" (L10); `test/site/shell-css.test.ts` "public/shell.css declares each palette token once at its ratified value" (its token declarations against the ratified values); `test/site/sheet-height.test.ts` both tests' `public/index.css` literals against `homeStage()`; `test/repo/type-check.test.ts` "tsconfig.worker.json is rooted at every worker the site spawns" (a config checked against the source it must cover); `test/atlas/document.test.ts` "#464 the served atlas declares the deep and the sheet depth exactly as public/shell.css does"; `test/render/og-card.test.ts`'s read of `public/fonts.css` against `OG_FONT_FACES` (part 2 ruling 7); `test/prospect/plate-face.test.ts` "the committed face tables are exactly what npm run plate-face writes" (committed generated files, call 4).

**Kept (12 tests, and the two sheet-height sweeps), kind `kept`**: each guards something a reader somewhere would see that no instrument here reaches.

| file | test, as it stands after this part | why it stays |
|---|---|---|
| `test/site/print-room-room.test.ts` | PRR6, shrunk to "a failed re-bind leaves the previous atlas deliverable" | behaviour no harness path can trigger (no bind job fails in a browser here) |
| `test/site/reading-room-room.test.ts` | "every hash the Reading Room builds is built inside one of its two known writers" (L93) | a new writer that drops the table key would show on a copied link |
| `test/site/chart-drawer.test.ts` | CT7c, shrunk to its count of `landDraw(` calls | a census of call sites: a second landing path would land a draw where none was meant |
| same | CT9, shrunk to the two restore sites | a census of call sites: a third would seat the table at another moment |
| same | CT11 "EVERY road out that carries this page's address is rebuilt by the one hash writer" (L392) | a road the file grows would carry a stale table |
| `test/site/house-style.test.ts` | "the control idiom's border is 1.5px" (L21) | a 3x display shows it (measured 1px at 1x and 2x) |
| `test/site/desk-notice.test.ts` | "the layout declares both spellings of the text-size hold" (L176) | Safari reads the prefixed spelling |
| `test/site/home-cluster.test.ts` | "the stage never yields its lettering to a drag" (L24) | Safari reads `-webkit-user-select` |
| `test/site/shell-css.test.ts` | "no rule that dresses the trail reaches for an ink under the floor on the deep, in any state" (L128) | a visited link's colour, which no browser hands a script |
| `test/site/shell-css-ground.test.ts` | "the walnut deep is mixed from the tokens", shrunk to the mix | a raw hex drifts when a token moves |
| `test/site/landfall-doors.test.ts` | "the 10s window is the veil's own" (L16) | two hand-kept copies of one window |
| `test/site/region-detail-wiring.test.ts` | "the worker's region job builds in the held chain cache" (L117) | time shows it |
| `test/site/sheet-height.test.ts` | the TypeScript half of both tests: `src/site/home/camera.ts` and every e2e source | hand copies of the derived sheet size drifting from `homeStage()` |

### Outside the list

- **RH7** in `e2e/suites/runninghead.ts` reads `src/site/print-room/bound-atlas.ts` to check the producer still writes the header it injects (2f call 10 handed it to 2i). It runs the producer instead (below).
- **GR6** in `test/site/gallery-room.test.ts` searches `GALLERY_PAGE_CSS`, an imported value, and opens no file (call 3).
- `test/repo/e2e-read-types.test.ts` hands the e2e tree to the type checker, a tool's verdict rather than a text search (call 6).

## The design

### A. Delete the 38 and the like halves, and the moved tests

Delete each test the first two tables name, and the six halves named above the first, with every comment line the tables name, and remove each import, constant and helper the deletions leave unused (`npm run lint` names them: at least `seats`, `css`, `app` and `room` in `test/site/print-room-room.test.ts`; `app` and `seats` in `test/site/reading-room-room.test.ts`; `page`, `readFileSync`, `resolve` and `REPO` in `test/site/gallery-room.test.ts`; `RAISE_TOKENS` in `test/site/shell-css.test.ts`; `readFileSync`, `resolve` and `REPO` in `test/site/table-address-prospect.test.ts` and in `test/site/announce.test.ts` where unused; `read` in `test/site/reading-frame.test.ts`, `test/site/reading-frame-log.test.ts` and `test/site/app-bundles.test.ts` where unused). Delete whole files left with no test: `test/site/prospect-room.test.ts`, `test/site/ribbon-room.test.ts`, `test/site/explorer-room.test.ts`, `test/site/portfolio-room.test.ts`, `test/site/living-chart-css.test.ts`, `test/site/glossary-sections.test.ts`.

The four shrinks, exactly:

- `test/site/print-room-room.test.ts`: the file keeps `REPO`, `read`, `const atlas = read("src/site/print-room/bound-atlas.ts")` and one test, titled `PRR6 a failed re-bind leaves the previous atlas deliverable (kept at the close of Issue #779: no browser path here fails a bind job)`, whose body is the old PRR6's `bind` slice, its non-empty anchor and its `setDeliveryEnabled(true)` match, unchanged. The header comment (L6) becomes `// What no browser here can see of the Print Room, kept at the close of Issue #779: the room's markup, dress and behaviour are read in e2e/suites/print-room/ (PR20 to PR39) and by CD49 and CD49b.`
- `test/site/chart-drawer.test.ts` CT7c: title `CT7c one call reaches the landing paths (#631 round 3; kept at the close of Issue #779: a census of call sites; CD57 to CD59 read what is filed)`, body: the `readFileSync` of `src/site/explorer/app.ts` and the count of `/^\s*landDraw\(([^)]*)\);$/gm` matches equal to 1, with its message, unchanged; the `builds` scan and its `lastManifest` loop go.
- `test/site/chart-drawer.test.ts` CT9: title `CT9 the Explorer seats the table in exactly two places, the boot and the cached return (#634, ruled 2026-09-19; kept at the close of Issue #779: a census of call sites; CD37 to CD42 and CD52 read the device written on a change, the boot's precedence and the cached return)`, body: the `readFileSync` of `src/site/explorer/app.ts` and the `chartTable.restore(` count, unchanged; the import assertion goes.
- `test/site/shell-css-ground.test.ts`: title `the walnut deep is mixed from the tokens (#461 ruling 2; kept at the close of Issue #779: a raw hex renders the mix exactly until a token moves)`, body: the `--the-deep` anchor and the `color-mix` match, unchanged; the `rgb(255 250 235` absence goes. The comment above it (L11) stays.

Titles and comments of the other kept tests that say "kept for Issue #779 part 2i" say "kept at the close of Issue #779" instead, nothing else changed: CT11 (L392), HS3 (L21), the chain cache (L117 of `test/site/region-detail-wiring.test.ts`), and the comment at L92 of `test/site/reading-room-room.test.ts`. The comment at L15 of `test/site/landfall-doors.test.ts` becomes `// Both numbers are source, the reveal's delay in a sheet and the veil's release in an inline script, so this read is kept at the close of Issue #779.` AK6 is retitled in E.

### B. `vellum/shared-binding-imported`: the import pins as a lint rule (the D4 ruling)

New `scripts/lint/shared-bindings.ts`:

```ts
export type SharedBinding = readonly [name: string, from: string];
export const SHARED_BINDINGS: Readonly<Record<string, readonly SharedBinding[]>>;
export default { rules: { "shared-binding-imported": Rule.RuleModule } };
```

`SHARED_BINDINGS` is exactly these 22 entries in 9 files, keyed by repo path, each `from` the specifier as the file writes it:

```
src/site/print-room/seats.ts, src/site/prospect/seats.ts, src/site/ribbon/seats.ts, src/site/reading-room/seats.ts:
  ["bindRoom", "../shared/room.ts"], ["createZoomController", "../shared/zoom-controller.ts"], ["bindGlassKeys", "../shared/glass-keys.ts"]
src/site/seed-of-the-day/app.ts: ["createZoomController", "../shared/zoom-controller.ts"]
src/site/explorer/app.ts: ["bindRoom", "../shared/room.ts"], ["makeAnnouncer", "../shared/announce.ts"], ["deviceStorage", "../shared/table-store.ts"], ["filingAt", "./chart-drawer.ts"]
src/site/portfolio/app.ts: ["makeAnnouncer", "../shared/announce.ts"], ["usesWorker", "../explorer/worker-client.ts"], ["deviceStorage", "../shared/table-store.ts"]
src/site/prospect/app.ts: ["prospectItemFrom", "../shared/table-address.ts"]
src/site/explorer/chart-drawer.ts: ["prospectItemFrom", "../shared/table-address.ts"]
```

The rule reads its roster from its options, `{ required: Record<string, SharedBinding[]> }`, with a JSON schema (an object with the one required property `required`, whose values are arrays of two-string arrays, no other property). In a file whose `repoPath(context.filename)` (from `scripts/lint/source-shape.ts`) is a key, at `Program:exit` it reports each `[name, from]` the file does not take and use: taken means an `ImportDeclaration` whose `source.value` equals `from` exactly, whose `importKind` is not `"type"`, holding an `ImportSpecifier` whose imported name is `name` and whose own `importKind` is not `"type"`; used means the specifier's declared variable (`context.sourceCode.getDeclaredVariables`) has at least one reference that is not a type reference (`isValueReference !== false`, the filter `globalReads` in `scripts/lint/source-shape.ts` uses). The report's node is the `Program`, one report per missing binding, `messageId` `missing`, message `{{file}} takes {{name}} from {{from}} and uses it, so the room binds the shared code rather than a copy of it (Issue #779, ruling 3 of comment 6098118329)`. A file not in the roster gets `{}`. Declared blind spots, at the test, each erring toward a red: a namespace import (`import * as glass`) and a re-export do not count as taking the binding. One erring toward a pass: the use may stand anywhere in the file (TP2 read `prospectItemFrom` inside `filingAt`'s slice).

Wiring, in `eslint.config.ts`: import `sharedBindings, { SHARED_BINDINGS }` from `./scripts/lint/shared-bindings.ts`, spread `...sharedBindings.rules` into the `vellum` plugin's rules, and add `"vellum/shared-binding-imported": ["error", { required: SHARED_BINDINGS }]` to the block "the house's rules on every site script" (`files: [["src/**/*.ts", "src/site/**"]]`), the block that already reaches every rostered file with the `vellum` plugin (Issue #812's ruling).

`test/repo/source-shape.test.ts`'s `houseReports` collects every `vellum/` rule's reports at plant paths, two of them rostered (`src/site/explorer/app.ts`, `src/site/prospect/seats.ts`), so it leaves this rule out by name beside `SPLIT_FILE_RULE`: add `const SHARED_BINDING_RULE = "vellum/shared-binding-imported";` and `&& m.ruleId !== SHARED_BINDING_RULE` to its filter (2c-src call 12's precedent).

### C. The source-read check on `npm test` (the D2 ruling)

Two new files.

`test-support/source-read-list.ts`:

```ts
export type ReadKind = "data" | "witness" | "kept";
export interface SourceRead { readonly reads: string; readonly kind: ReadKind }
export const SOURCE_READS: Readonly<Record<string, readonly SourceRead[]>>;
```

Keys are test files by repo path; `reads` is an exact repo path or a folder written `dir/**`. Two entries may name one path with two kinds. The list at this part's close, exactly:

```
test/atlas/document.test.ts: public/shell.css data
test/prospect/plate-face.test.ts: src/prospect/letter/face-caps.ts data; src/prospect/letter/face-italic.ts data; src/prospect/letter/face-roman.ts data
test/render/og-card.test.ts: public/fonts.css data
test/repo/console-support.test.ts: e2e/** witness
test/repo/constant-contracts.test.ts: src/site/** witness
test/repo/e2e-tiers.test.ts: e2e/harness.ts witness
test/repo/lint-wiring.test.ts: e2e/** witness; scripts/** witness; src/** witness
test/repo/type-check.test.ts: src/** data
test/site/atelier-kit.test.ts: src/site/shared/glass-keys.ts witness
test/site/chart-drawer.test.ts: src/site/explorer/app.ts kept
test/site/desk-notice.test.ts: public/shell.css kept
test/site/home-cluster.test.ts: public/index.css kept
test/site/house-style.test.ts: public/house.css kept
test/site/hunt-zoom.test.ts: src/site/seed-of-the-day/app.ts witness
test/site/landfall-doors.test.ts: public/index.css kept; src/pages/index.astro kept
test/site/print-room-room.test.ts: src/site/print-room/bound-atlas.ts kept
test/site/reading-room-room.test.ts: src/site/reading-room/app.ts kept
test/site/region-detail-wiring.test.ts: src/site/explorer/worker.ts kept
test/site/room.test.ts: public/atelier.css data
test/site/sheet-height.test.ts: public/index.css data; src/site/home/camera.ts kept; e2e/** kept
test/site/shell-css-ground.test.ts: public/shell.css kept
test/site/shell-css.test.ts: public/shell.css data; public/shell.css kept
test/site/tip-affordance.test.ts: src/** witness
```

`test-support/source-read-guard.ts`, preloaded by `npm test`:

```ts
export const isSource: (rel: string) => boolean;
export const covers: (pattern: string, rel: string) => boolean;
export const callerFile: (stack: string, self: string) => string | null;
export const isFiltered: (execArgv: readonly string[]) => boolean;
export interface Verdict { readonly unlisted: readonly string[]; readonly unused: readonly SourceRead[] }
export const verdict: (reads: ReadonlySet<string>, entries: readonly SourceRead[], filtered: boolean) => Verdict;
export const verdictLines: (testFile: string, v: Verdict) => string[];
export const watching: boolean;
```

`watching` is true exactly when the module installed its wrappers in this process (below).

- `isSource(rel)`: `rel` (posix, repo-relative) matches `^(?:src\/.+\.(?:ts|astro|css)|(?:e2e|scripts)\/.+\.ts|public\/.+\.css)$` and is not `public/<sub>` or under `public/<sub>/` for any `sub` of `GENERATED_SUBTREES` (imported from `scripts/clean-public-generated.ts`, which imports Node built-ins only).
- `covers(pattern, rel)`: a pattern ending `/**` covers every `rel` starting with the pattern less its two stars (so `e2e/**` covers `e2e/a.ts` and `e2e/suites/b/c.ts`, never `e2ex/a.ts`); any other pattern covers `rel` equal to it.
- `callerFile(stack, self)`: walks the stack's `    at ` lines, takes each frame's location (inside the last parentheses, else after `at `), strips its trailing `:line:column`, turns a `file://` URL into a path, and skips a frame whose location is `self` (the guard's own path) or is no path at all (`<anonymous>`, `native`, `index N`, as `Array.map` gives). The first frame left decides: a location starting `node:` returns `null` (Node itself is reading, as its module loader does for every imported file, through the same public `fs.readFileSync` the guard wraps); an absolute path is returned; no frame left returns `null`. The caller is the frame that called the read, never a frame further down: with a deeper stack limit, a test's own `import()` stands further down a module load's stack (the plan skeptic measured it at `--stack-trace-limit=100`), and must not count.
- `isFiltered(execArgv)`: true when an entry starts with `--test-name-pattern` or `--test-skip-pattern`, or equals `--test-only` (measured: a `node --test` child carries the name and skip patterns in its `process.execArgv`, and the plan skeptic measured `--test-only` there too).
- `verdict`: `unlisted` is every read no entry covers, sorted; `unused` is every entry no read is covered by, and empty when `filtered`.
- `verdictLines`: one line per unlisted read, `${testFile} reads ${rel} as text: a unit test does not open a source file (handbook/specs/check-placement.md); a data read or a witness joins SOURCE_READS in test-support/source-read-list.ts with its kind`, and one per unused entry, `${testFile} no longer reads ${entry.reads} (${entry.kind}): remove its entry from SOURCE_READS in test-support/source-read-list.ts`.

At its top level, the module sets `root` to `realpathSync` of `process.env.VELLUM_SOURCE_READ_ROOT` when set, else of `resolve(import.meta.dirname, "..")` (macOS's temporary folder is a symlink: a root under `/var/folders` never matches a child's `argv[1]` or `process.cwd()`, which come back under `/private/var`, measured by the plan skeptic), and is active only when `process.argv[1]` is a file under `<root>/test/` ending `.test.ts` (measured: `node --test` loads an `--import` preload in each test file's child process, whose `argv[1]` is that file, and not in the runner itself); then `testFile` is that path relative to `root`, and it loads `SOURCE_READS` with `await import(pathToFileURL(join(root, "test-support/source-read-list.ts")).href)`. Active, it wraps `fs.readFileSync`, `fs.readFile` and `fs.promises.readFile` (one object with `node:fs/promises`'s export) and calls `syncBuiltinESMExports()`. Each wrapper takes the first argument: a number is a descriptor and is ignored; a string starting `file:` or a `URL` becomes a path through `fileURLToPath`; a `Buffer` becomes its string; a relative path resolves against `process.cwd()`. When the path lies under `root`, `isSource` holds for its posix relative path, and `callerFile(new Error().stack, <the guard's own path>)` lies under `<root>/test/` or `<root>/test-support/` and not under a `node_modules` folder, the path joins the run's read set. The wrapper then calls the original, unchanged. On `process` `exit`, it computes `verdict(reads, SOURCE_READS[testFile] ?? [], isFiltered(process.execArgv))`; when either list is non-empty it writes `verdictLines` to stderr and sets `process.exitCode = 1` (measured: `node --test` then marks that file failed, a read the test swallowed included). It never throws at the read: a test's own behaviour is unchanged until the run ends.

The typed forms, measured clean under `tsc -p tsconfig.json` and the house lint on a probe of exactly these shapes: `import fs from "node:fs"`; each original held in a constant first (`const readFileSync = fs.readFileSync;`, the same for `fs.readFile` and `fs.promises.readFile`); each wrapper a plain assignment of an arrow taking `...args: Parameters<typeof <original>>`, noting `args[0]` and returning `<original>(...args)` (the callback form returning nothing), cast `as typeof <original>`; the list loaded as `(await import(...)) as { readonly SOURCE_READS: Readonly<Record<string, readonly SourceRead[]>> }`. `Object.defineProperty` with `Reflect.apply` is not the form: the lint's `no-confusing-void-expression` refuses it on the callback reader. No skip is needed or allowed. `tsconfig.json` includes no `test-support/**`, so both new files reach the type checker and the lint's project service only through `test/repo/source-read-guard.test.ts`'s static imports of them, which T5 to T12 make.

Wiring: `package.json`'s `"test"` becomes `"node --import ./test-support/source-read-guard.ts --test"`; CI's `npm test -- --test-shard=...` appends after `--test` as before.

Declared blind spots, in the guard's test (a `BLIND_SPOTS` message string on the children's test, the form `test/repo/e2e-scripts-off.test.ts` takes), each erring toward a pass:
- **Per file, not per test**: a new source-text test added to a listed file passes when it reads a path or folder that file's entries already cover; the folder entries (`e2e/**`, `scripts/**`, `src/**`, `src/site/**` in `lint-wiring`, `tip-affordance`, `type-check`, `constant-contracts`, `console-support` and `sheet-height`) cover any read under them. Nothing at run time names the running test, and a top-level read has none.
- **Reads made for the test**: a read a library or a repo module under `src/`, `scripts/` or `e2e/` makes on the test's behalf, and a read by a child process (Node does not hand a child the preload).
- **Other readers**: `fs.openSync`, `fs.createReadStream`, a descriptor.
- **Other runs**: a run outside `npm test` (`node --test <file>` alone, the proof runner's own spawn in `scripts/proof-runner/job.ts`), and a run with `--test-isolation=none`.
- **The list's shape**: two entries on one path (shell-css's `data` and `kept`) cannot be told apart, so the guard cannot see the kept one go stale while the data read stands.

Review holds what these let through.

### D. RH7 runs the producer's markup

New `src/site/print-room/atlas-head-markup.ts`, on the pattern of `contents-markup.ts`, `matter-markup.ts` and `plate-markup.ts` beside it:

```ts
export const atlasHeadMarkup: (atlas: Pick<AtlasDocumentData, "title" | "subtitle" | "seed">) => string;
```

It returns exactly the five lines `renderBoundAtlas` in `src/site/print-room/bound-atlas.ts` writes today, from `<header class="atlas-head print-only">` to `</header>` with no newline after, escaping title and subtitle with `escapeXml` from `src/render/svg.ts`; it imports `AtlasDocumentData` as a type from `src/atlas/document.ts`. `renderBoundAtlas` writes `${atlasHeadMarkup(atlas)}` in place of those five lines, so `atlasDiv.innerHTML` is byte for byte what it was. `bound-atlas.ts` cannot be imported in Node (it looks its elements up at module scope), which is why the markup moves.

In `e2e/suites/runninghead.ts`: import `atlasHeadMarkup` from `../../src/site/print-room/atlas-head-markup.ts`; delete `boundAtlasEmitsAtlasHead`, the comment above it and every import and constant only it used (`readFileSync`, and `REPO` with `resolve` and `fileURLToPath` if nothing else uses them); in `rh7AtlasTitle`, `d.innerHTML` is assigned `${JSON.stringify(atlasHeadMarkup({ title: "The Isle of Rahai", subtitle: "An atlas", seed: 42 }))}` in place of the hand-written string; the payload returns `JSON.stringify(null)` when `d.querySelector(".atlas-head h1")` finds nothing, before any `getComputedStyle`, so a producer that stops writing the heading prints RH7's FAIL rather than throwing out of `evaluate` and stopping the suite (RH7 runs outside any step, `e2e/suites/runninghead.ts` L64; part 2h's Z23 fix took the same shape); `producerShape` goes from the check's condition and its detail, and the check's name becomes `RH7 the Print Room's bound-atlas title, written by the producer's own markup, resolves to the display face (unreachable by any screenshot)`.

### E. Two kept pins repaired

- **AK6** in `test/site/atelier-kit.test.ts`: the regex becomes `/\bdocument\.querySelectorAll<HTMLElement>\("\[data-zoom\]"\)/`, so the scope defect its name claims to hold reds it (the PR #833 row's hole); the title becomes `AK6 the kit's glass-keys.ts binds every [data-zoom] press on the page, document-wide, the premise vellum/explorer-no-glass-keys rests on (kept at the close of Issue #779 as that rule's witness, and the only check that the binding reaches the fit press: SB15 holds the out press, SB13 presses the fit press without holding it, and nothing reads what the fit press does)`.
- **The drag test** in `test/site/home-cluster.test.ts`: the first assertion's regex becomes `/(?<![-\w])user-select:\s*none/`, so it no longer matches inside `-webkit-user-select: none` (the PR #833 row's hole).

### F. Spec, gate, comments and errata

`handbook/specs/check-placement.md`, The unit suite. Before (L74 to L80):

```
- **A test may read a file as DATA where the file is the thing under test**: a built page, a generated
  chart, a config the house reads (`eslint.config.ts`, a workflow), or a stylesheet value the
  code's own arithmetic must match (the Glass's seat beside the slip in `test/site/room.test.ts`).
  The test checks what the file holds: a value against the code that must agree with it, or a config's
  shape. Finding the anchor first (`vellum-footguns` Gate 1) is part of reading the file, not the check,
  and how such a reader goes blind is `vellum-footguns` Gate 7's.
- Existing tests that search source text move under this rule as each one is touched.
```

After:

```
- **A test may read a file as DATA where the file is the thing under test**: a built page, a generated
  file (a chart, a face table), a config the house reads (`eslint.config.ts`, a workflow), or a
  stylesheet value the code's own arithmetic must match (the Glass's seat beside the slip in
  `test/site/room.test.ts`). The test checks what the file holds: a value against the code that must
  agree with it, or a config's shape. Finding the anchor first (`vellum-footguns` Gate 1) is part of
  reading the file, not the check, and how such a reader goes blind is `vellum-footguns` Gate 7's.
- **A lint rule's witness may read the source the rule keys on**, to show the rule still has
  something to hold where the rule cannot say so itself.
- **`npm test` checks both rules file by file.** `test-support/source-read-guard.ts` fails a test
  file that reads a source file (TypeScript under `src/`, `e2e/` or `scripts/`, a page, a stylesheet
  under `public/`) unless `SOURCE_READS` in `test-support/source-read-list.ts` names the read, or a
  folder holding it, for that file, and fails an entry the file no longer reads. A data read or a
  witness joins the list with its kind. The tests kept when Issue #779 closed, each guarding what no
  instrument here reaches, carry the kind `kept`: one leaves the list when it moves to a lint rule or
  a browser check, and none joins it. The guard cannot tell a new read in a listed file from the
  listed one, nor see a read that code under `src/`, `scripts/` or `e2e/` makes for the test; review
  holds those.
```

`.claude/skills/vellum-footguns/SKILL.md`, Gate 7's preamble: after "Whether the check belongs in a unit test at all is `handbook/specs/check-placement.md`'s." add the sentence `` `npm test` fails a source read `SOURCE_READS` in `test-support/source-read-list.ts` does not name (Issue #779). ``

Comments a deletion makes false:

- `test/site/table-store.test.ts` L99: the sentence's last clause, ", whose hosts are pinned to it by name in chart-drawer.test.ts and prospect-room.test.ts", goes; it ends "Driven here at the rule."
- `src/site/prospect/app.ts` L77: "which is what TP2's single builder exists to prevent" becomes "which is what the one builder, `prospectItemFrom` in `src/site/shared/table-address.ts`, exists to prevent".

`handbook/errata/`, each in the same diff:

- `guards.md`, the PR #720 row (L115): "what keeps a text pin there is part 2i's remainder (the absence of `lastManifest` beside each overlay build, one `landDraw` call, `hideCard` before `rebase`), which still reads text that way" becomes "what keeps a text pin there is CT9's count of the two restore sites and CT11's scan of the roads, kept at the close of Issue #779, which still read text that way". The rest stands.
- `guards.md`, the PR #724 low row on HZ2 (L119): deleted, fixed: HZ2 is gone and `vellum/shared-binding-imported` reads the import and its use by syntax.
- `guards.md`, the PR #833 drag row (L172): deleted, fixed by E.
- `guards.md`, the PR #833 AK6 row (L173): its regex half is fixed by E, and its last narrowing's fact stands (no check holds the fit press), so the row stays and gains ` (narrowed <day>, Issue #779 part 2i: AK6's regex now carries `document.`, so the scope defect reds it; what the fit press does, `zoom.glideHome()` in `bindGlassKeys` in `src/site/shared/glass-keys.ts`, is still read by no check)`.
- `site.md`, the PR #833 desk-panel row (L73): append ` (narrowed <day>, Issue #779 part 2i: the converse test left with the other pins on CSS no page wears, so nothing reads the dead rule)`.
- `site.md`, the PR #835 status-colour row (L74): append ` (narrowed <day>, Issue #779 part 2i: the pin left; the declaration stays for whoever deletes it)`.
- `site.md`, a new row under `## Open`, after the last PR #867 row: `- PR #<this pull request> (<day>, medium): the `footer a:focus-visible` arm of the deep's focus ring and the `footer a { color: inherit; }` rule in `public/shell.css` dress no element, since the layout's footer carries no link (`src/layouts/BaseLayout.astro`; Issue #779 part 2f's guard prover, its M10), so neither shows anywhere; Issue #779 part 2i deleted shell-css-ground's pin on the ring, and both stay for whoever deletes them or gives the footer a link. Searched: this directory for "footer a" and "focus ring", and the open issues for "footer link": none.` (written once the pull request has its number; inline backticks as shown).

`<day>` is the UTC date of the commit that writes it.

## Alternatives rejected

- **Throwing at the read**: changes a test's own behaviour mid-run, and a test that swallows the throw still needs the exit check; the exit check alone names the file and the path.
- **A list keyed by test title**: a read at a module's top level has no title, and nothing at run time names the test that is running.
- **Data reads through one named helper the check admits**: a helper launders any read; the list names each.
- **Moving the 10 s window into a built-page read in `test/site/astro-scaffold.test.ts`**: that file sits on an accepted `max-lines` skip and two listed functions, and the read costs nothing new as a kept entry.
- **The check over the e2e tree too**: ruling 2 binds a unit test, the e2e runner is not `node --test`, and the tree's one source read (RH7) goes by running the code.
- **A rule refusing a local copy of a shared binding instead of the roster**: a copy under another name passes it; the roster holds exactly what the deleted pins held.

## Files

| file | change |
|---|---|
| `scripts/lint/shared-bindings.ts` | new: `SharedBinding`, `SHARED_BINDINGS`, the rule (B) |
| `test/repo/shared-bindings.test.ts` | new (T1 to T4) |
| `eslint.config.ts` | the import, the plugin spread, the rule in "the house's rules on every site script" (B) |
| `test/repo/source-shape.test.ts` | `SHARED_BINDING_RULE` and its exclusion in `houseReports` (B) |
| `test-support/source-read-list.ts` | new: `ReadKind`, `SourceRead`, `SOURCE_READS` (C) |
| `test-support/source-read-guard.ts` | new: the guard (C) |
| `test/repo/source-read-guard.test.ts` | new (T5 to T12b) |
| `package.json` | the `test` script (C) |
| `test/repo/e2e-tiers.test.ts` | the pin on the `test` script (T13) |
| `src/site/print-room/atlas-head-markup.ts` | new: `atlasHeadMarkup` (D) |
| `src/site/print-room/bound-atlas.ts` | `renderBoundAtlas` writes `atlasHeadMarkup(atlas)` (D) |
| `e2e/suites/runninghead.ts` | RH7 injects the producer's markup; the source read goes (D) |
| `test/site/atelier-kit.test.ts` | AK7, AK8 and L30 go; AK6 anchored and retitled (A, E) |
| `test/site/home-cluster.test.ts` | the drag regex (E) |
| `test/site/print-room-room.test.ts`, `test/site/chart-drawer.test.ts`, `test/site/shell-css-ground.test.ts` | shrinks and deletions (A) |
| `test/site/reading-room-room.test.ts`, `test/site/hunt-zoom.test.ts`, `test/site/room.test.ts`, `test/site/house-style.test.ts`, `test/site/shell-css.test.ts`, `test/site/astro-scaffold.test.ts`, `test/site/gallery-room.test.ts`, `test/site/landfall-prose.test.ts`, `test/site/reading-frame.test.ts`, `test/site/reading-frame-log.test.ts`, `test/site/app-bundles.test.ts`, `test/site/announce.test.ts`, `test/site/table-address-prospect.test.ts` | deletions (A) |
| `test/site/region-detail-wiring.test.ts`, `test/site/landfall-doors.test.ts` | the "kept at the close" wording (A) |
| `test/site/prospect-room.test.ts`, `test/site/ribbon-room.test.ts`, `test/site/explorer-room.test.ts`, `test/site/portfolio-room.test.ts`, `test/site/living-chart-css.test.ts`, `test/site/glossary-sections.test.ts` | deleted |
| `test/site/table-store.test.ts`, `src/site/prospect/app.ts` | one comment each (F) |
| `handbook/specs/check-placement.md` | F |
| `.claude/skills/vellum-footguns/SKILL.md` | Gate 7's sentence (F) |
| `handbook/errata/guards.md`, `handbook/errata/site.md` | F |
| `handbook/plans/779/779-part2i-plan.md` | this plan, archived at the first commit |

Size: every new file stays under 400 lines of code and every function under 50; `test/repo/source-read-guard.test.ts` is split into one `test()` per case below, with the planted-repo writer and the spawn as helpers. `test/repo/source-shape.test.ts` sits on `eslint-suppressions.json` and gains two lines.

## Tests, in the order they are written

Every test is written red first against a stub of the right shape. The prover owes T1 to T13, AK6 (T14), the drag test (T15) and RH7 (T16).

**`test/repo/shared-bindings.test.ts`**, the lint-test form of `test/repo/e2e-scripts-off.test.ts` (one `ESLint` with `cwd` the repo and the native-loader flag; a `reported(lines, path)` helper that refuses a fatal parse and returns `[name, from]` pairs parsed from each `vellum/shared-binding-imported` message by `/takes (\S+) from (\S+) and uses it/`). Stub for T1 to T4: `scripts/lint/shared-bindings.ts` with `SHARED_BINDINGS = {}` and a rule with the full `meta` and schema whose `create` returns `{}`, NOT yet wired in `eslint.config.ts`, so T1 (b) to (h), T3 and T4 red on their assertions; T2 is green on the stub by construction, and its mutation proves it.

- **T1** "a room module takes each shared binding its roster entry names, by its own name, as a value, and uses it (Issue #779)": plants linted at `src/site/prospect/seats.ts`, each a whole module, with the reports expected: (a) the three imports, `createZoomController` imported `as makeZoom`, all three used in `export const a = [bindRoom, makeZoom, bindGlassKeys];`: `[]`; (b) `bindGlassKeys`'s import and use deleted: `[["bindGlassKeys", "../shared/glass-keys.ts"]]`; (c) imported, never used: the same; (d) `import type { bindGlassKeys }` with `export type B = typeof bindGlassKeys;`: the same; (e) `import { type bindGlassKeys }`, same use: the same; (f) imported from `"./glass-keys.ts"` and used: the same; (g) no import, a local `function bindGlassKeys(): void {}` used: the same; (h) `import * as glass from "../shared/glass-keys.ts"` with `glass.bindGlassKeys` used: the same, its message naming the declared blind spot. Red on the stub: every non-empty expectation. Mutations that must red it: drop the use check (c); accept `importKind` `"type"` on either level (d, e); match the local name rather than the imported one (a reports); compare `from` by its ending (f).
- **T2** "a file the roster does not name is not read": `""` and plant (b) linted at `src/site/shared/room.ts` report `[]`. Mutation: report the union of every entry in every file.
- **T3** "the roster is exactly the import pins the close of Issue #779 moved here, and every file and module it names exists": `assert.deepEqual(SHARED_BINDINGS, <the 22 entries of B, as a literal>)`, the same shape SHEET_RULES in `test/repo/lint-wiring.test.ts` takes so a dropped entry reds; each key and each `join(dirname(key), from)` exists. Red on the stub: `{}`. Mutation: drop one entry from `SHARED_BINDINGS`.
- **T4** "the rule resolves at error, with the roster as its options, on every site script at any depth and on no other root or sheet": `calculateConfigForFile` gives `[2, { required: SHARED_BINDINGS }]` on each roster key and on `src/site/nested/deeper/part.ts`, and `undefined` on `WITNESSES` from `test-support/lint-witnesses.ts` for `e2e`, `scripts`, `src` (`src/cli/main.ts`), `test`, `test-support` and `public/**/*.css`. Red on the unwired stub: `undefined` where `[2, ...]` is expected. Mutation: move the rule to "the house's rules on every TypeScript root".

**`test/repo/source-read-guard.test.ts`**. Stub for T5 to T12b: `test-support/source-read-guard.ts` with every export of C's signatures returning the wrong answer (`isSource` false, `covers` exact match only, `callerFile` null, `isFiltered` false, `verdict` empty lists, `verdictLines` `[]`, `watching` false) and no top-level install; `test-support/source-read-list.ts` with `SOURCE_READS = {}`.

- **T5** "isSource names code under src, e2e and scripts, the pages and the authored sheets, and nothing generated, built or configured": true for `src/site/explorer/app.ts`, `src/pages/index.astro`, `e2e/harness.ts`, `scripts/lint/source-shape.ts`, `public/house.css`, `public/explorer/broadside.css`; false for `public/gallery/index.css`, `public/charts/chart-42-antique.svg`, `public/og.png`, `package.json`, `.github/workflows/ci.yml`, `eslint.config.ts`, `test/site/room.test.ts`, `test-support/element-shim.ts`, `design/kit/fonts.css`, `dist/index.html`. Mutations: drop the generated-tree exclusion; let `.astro` outside `src/` count.
- **T6** "a folder entry covers every file at any depth under it and nothing beside it": `covers("e2e/**", "e2e/a.ts")`, `covers("e2e/**", "e2e/suites/b/c.ts")` true; `covers("e2e/**", "e2ex/a.ts")`, `covers("src/site/**", "src/sitex/a.ts")` false; exact `covers("public/house.css", "public/house.css")` true and `covers("public/house.css", "public/house.css.map")` false. Mutation: drop the slash from the prefix.
- **T7** "the caller is the frame that called the read, after the guard's own and any frame with no path; Node's own reads have none": synthetic stacks, `self` = `/r/test-support/source-read-guard.ts`: (1) a guard frame, then `at read (file:///r/test/site/x.test.ts:3:9)`: `/r/test/site/x.test.ts`; (2) a guard frame, then `at Array.map (<anonymous>)`, then `at file:///r/test/site/x.test.ts:5:2`: `/r/test/site/x.test.ts`; (3) a guard frame, then `at readFileSync (node:internal/modules/helpers:1:1)` and `at #loadSync (node:internal/modules/esm/translators:2:2)`, then a test frame further down: `null`; (4) a guard frame, then `at x (/r/node_modules/eslint/lib/x.js:1:1)`: that path; (5) guard frames only: `null`. Mutations: skip `node:` frames and go on (case 3 returns the test frame); stop at a no-path frame (case 2 returns `null`).
- **T8** "a run filtered by name, by a skip pattern or to only-tests reads no entry as stale; a sharded run does": `isFiltered` true on `["--test-name-pattern=x"]`, `["--test-skip-pattern=y"]`, `["--test-only"]`; false on `["--test-shard=1/4"]` and `[]`. Mutations: always true; always false.
- **T9** "the verdict names every unlisted read, and in a whole run every entry no read used": with entries `[{reads:"src/a.ts",kind:"data"},{reads:"e2e/**",kind:"witness"},{reads:"public/x.css",kind:"kept"}]` and reads `{"src/a.ts","e2e/s/t.ts","src/b.ts"}`: `unlisted` `["src/b.ts"]`, `unused` the `public/x.css` entry; filtered, `unused` `[]`. Mutation: an entry counted used by any read.
- **T10** children, one `test()` each, every spawn `spawnSync(process.execPath, [...nodeFlags, "--import", <the guard's absolute path>, "--test", "--test-reporter=tap", ...testFlags, "test/plant.test.ts"], { cwd: <planted repo>, env: <process.env less NODE_TEST_CONTEXT, plus VELLUM_SOURCE_READ_ROOT>, encoding: "utf8", timeout: CHILD_TIMEOUT_MS })`, `nodeFlags` and `testFlags` empty unless a case names them, `CHILD_TIMEOUT_MS = 60_000` with one line above it, `// A cap on a hang, never a budget (2026-10-13: a planted run took about 0.1 s on a Mac).` The planted repo, a fresh `mkdtempSync` per test removed in a `finally`, holds `package.json` (`{"type":"module"}`), `src/a.ts`, `src/reader.ts` (reads `./a.ts` beside it through `readFileSync(new URL(...))`), `public/house.css`, `test-support/reader.ts` (exports `readVia(p)`, a `readFileSync` of its argument), `test-support/source-read-list.ts` (the case's list, written as `export const SOURCE_READS = <JSON>;`) and `test/plant.test.ts` (the case's one `node:test` test). Cases, each asserting the status, `# pass 1` (the plant's own test ran; measured, it passes in every case), and `# fail 1` where the status is 1 or `# fail 0` where it is 0 (the guard's failure counts as one failed entry for the file): (a) reads `src/a.ts` unlisted: status 1, output names `test/plant.test.ts reads src/a.ts`; (b) the same, listed `data`: status 0; (c) reads `src/a.ts` inside a `try` with an empty `catch`, unlisted: status 1; (d) reads nothing, list names `public/house.css`: status 1 naming the unused entry, and status 0 with `--test-name-pattern=plant` in `testFlags`; (e) reads `src/a.ts` through `readVia`, unlisted: status 1; (f) calls `src/reader.ts`, which reads `src/a.ts` itself, unlisted: status 0; (g) reads `package.json`, unlisted: status 0; (h) `await readFile("public/house.css", "utf8")` from `node:fs/promises`, unlisted: status 1; (i) a static `import { a } from "../src/a.ts"` and a dynamic `await import("../src/a.ts")`, unlisted, with `--stack-trace-limit=100` in `nodeFlags`: status 0 (a module load is Node's read, not the test's). The planted repo is made under `tmpdir()` and handed to the guard as made, unresolved, so on macOS the guard's own `realpathSync` is what makes (a) red (measured with the prototype: a root under `/var/folders` and a child under `/private/var`); on linux, where `/tmp` is no symlink, that mutation is invisible, and the PR body says the realpath is proven on the Mac. The env deletion is load-bearing: measured, a nested `node --test` that inherits `NODE_TEST_CONTEXT` skips every file and exits 0. Red on the stub: (a), (c), (d), (e) and (h) exit 0. Mutations: no exit check; attribute every frame (f reds); skip `test-support/` frames (e passes); `isFiltered` always true (d's whole run passes); no `realpathSync` on the root (a passes, on macOS); `callerFile` skipping `node:` frames and going on (i reds).
- **T11** "the list names only test files that exist, source it can read, and kinds the spec names": each key exists, lies under `test/` and ends `.test.ts`; each exact `reads` exists and `isSource` holds for it; each `dir/**` names an existing folder; each `kind` is one of the three. Mutation: an entry naming a deleted test file.
- **T12** "the kept reads only shrink": the `kept` entries of `SOURCE_READS`, as `[file, reads]` pairs, deepEqual `KEPT_AT_CLOSE`, a literal of the thirteen pairs C's list gives the kind `kept`, beside the test; the change that moves one removes it from both, as `LIST_AT_REFORMAT` in `test/repo/lint-config.test.ts` holds the size-cap list. Red on the stub (`{}`). Mutation: a fourteenth `kept` entry.
- **T12b** "the guard watches a test file of this repo": `assert.equal(watching, true)` in this test file's own process (preloaded by `npm test`, or installed by the test's own import of the module when run alone; either way `process.argv[1]` is this file). Red on the stub (`false`). Mutation: the default root one folder up, the prototype's measured failure.
- **T13** in `test/repo/e2e-tiers.test.ts`: the existing pin's expected value becomes `"node --import ./test-support/source-read-guard.ts --test"` and its message `npm test is no longer the source-read guard's preload before node --test, so either the guard is off or the shard flag ci.yml appends lands on some other command`. Red until `package.json` changes. Mutation: the script back to `node --test`.
- **T14** AK6 (E). Mutation that must red it, and leaves the old regex green: `document.querySelectorAll<HTMLElement>("[data-zoom]")` to `viewport.querySelectorAll<HTMLElement>("[data-zoom]")` in `src/site/shared/glass-keys.ts`.
- **T15** the drag test (E). Mutation: delete `user-select: none;` at `public/index.css` L26, leaving the prefixed line.
- **T16** RH7 (D). Mutations: `atlas-head` to `atlas-hed` in `atlasHeadMarkup`, and its `<h1>` to `<h2>`: each leaves no `.atlas-head h1`, so the payload returns null and RH7 prints FAIL with the detail `injected twin: null`, and the suite runs on past it (the checks after RH7 report). A third, the heading kept and its dress moved, so the read itself is shown to discriminate: `font-size: 2.2rem` to `2rem` in `#pr-atlas .atlas-head h1` in `public/print-room/index.css` (L447 to L452): RH7 FAIL on the size (35.2 px expected). Run `runninghead` locally on the mutant and on the fixed tree.

The deleted tests owe no proof: each goes on D1's ruling, not on a holder.

## Order of commits

1. The plan archived at `handbook/plans/779/779-part2i-plan.md`, with T1 to T4 and the unwired stub rule: red on the assertions.
2. The rule, `SHARED_BINDINGS` and its wiring in `eslint.config.ts`; `houseReports`' exclusion. `npm run lint` and T1 to T4 green.
3. The moved tests and halves deleted (the second table of the ledger).
4. T5 to T12b with the stub guard and the empty list: red on the assertions.
5. The guard, and `SOURCE_READS` as C gives it: T5 to T12b green (the guard is not yet wired into `npm test`; T12b holds through the test's own import).
6. The 38 deletions, the six halves, the shrinks, the retitles and the two comments (A, F's comments).
7. AK6 and the drag test (E), each red on its mutation first.
8. RH7 (D).
9. T13 red, then `package.json`'s script: green; then `npm test` whole under the guard.
10. The spec, Gate 7 and the errata (F), less the new site row.
11. After `gh pr create`: the new `site.md` row with the pull request's number.

## Rosters and doctrine

- `eslint.config.ts`: the rule joins "the house's rules on every site script"; no new block.
- `package.json`'s `test` script, pinned by `test/repo/e2e-tiers.test.ts` (T13).
- `handbook/specs/check-placement.md` (F, the before and after above): the line "Existing tests that search source text move under this rule as each one is touched" is Alex's own body ruling's wording, and Alex's D1 and D2 rulings replace it with F's bullets.
- `.claude/skills/vellum-footguns/SKILL.md` Gate 7 (F).
- `handbook/errata/guards.md` and `handbook/errata/site.md` (F).
- No chart, golden or regen moves: the one `src/` code change writes `atlasDiv.innerHTML` byte for byte as before.
- The PR body's closing line is `Closes #779`: parts 1, 3 and 4 merged (PR #780, PR #794, PR #798, PR #815), part 2's twelve before this one merged; Issue #600 and Issue #814 stay open as their own.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- `npm test` whole under the guard, once wired: green, and the PR body pastes its tally.
- `git grep -n "part 2i" -- test e2e src` prints nothing once A's retitles land.
- The guard's proof that it is live in the real tree, which T10's planted repos cannot give (measured: the prototype, rooted one folder off, watched nothing and passed the whole suite): with the wiring in place, delete room's entry from `SOURCE_READS` and run `npm test -- test/site/room.test.ts`: it fails naming `public/atelier.css`; restore it. The PR body pastes the red line.
- After `npm run build`: `VELLUM_E2E_SUITES=runninghead npm run test:e2e` and `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` (bound-atlas changed), each green; not the full local lanes.
- `vellum-guard-prover` on T1 to T16; `vellum-plate-reader` is not owed (nothing a page shows changes).

## Calls made

1. **The deletion test** (the ledger's head): no reader on any browser or display could ever see the pinned thing broken. Rule: ruling 6's own classes ("only keep a removed feature from coming back, or repeat a declaration") and the census's destination 4 ("guards no behaviour").
2. **What stays as `kept`**: HS3 (a 3x display), the two spellings (Safari), the trail's visited ink, the chain cache (time), PRR6's failed re-bind, the walnut mix, the 10 s window, sheet-height's sweeps, CT9's and CT11's censuses and the Reading Room's writers. Rule: call 1's converse.
3. **GR6 stays as it is, off the list**: it searches an imported value. Rule: `handbook/plans/779/779-part2f-pages-plan.md`'s own line, "A claim that runs code (an import's value, a function's output) is not a source read and stays in its unit test".
4. **The face tables are data, and the spec's data bullet says "a generated file (a chart, a face table)"**. Rule: the census's call 2 (committed generated files are out of source), ratified by ruling 9.
5. **type-check's worker roots read is data**. Rule: the census's DATA row and ruling 9's config exception: the config is the thing under test, checked against the source it must cover.
6. **`test/repo/e2e-read-types.test.ts` is off the list**: it hands the tree to the type checker and asserts its verdict, and the guard does not see a library's reads. Rule: `handbook/specs/check-placement.md`'s type-checker instrument; the census never counted it (2h's "Found on the way").
7. **RH7 runs the producer's markup**. Rule: part 2's fourth destination, run the code (ruling 2 of 6055743231).
8. **The guard covers the unit suite only**. Rule: body ruling 2 binds "a unit test".
9. **AK6 and the drag test repaired**: the drag row leaves as fixed, and the AK6 row is narrowed, since what the fit press does stays unread. Rule: `handbook/errata/README.md`'s fixed exit; both tests stay, and the fix is one regex each.
10. **"kept for Issue #779 part 2i" becomes "kept at the close of Issue #779"** in the kept tests' titles and comments: a part that has run names no pending work.
11. **Two comments a deletion makes false are edited** (`test/site/table-store.test.ts`, `src/site/prospect/app.ts`). Rule: workflow step 8's "doctrine and rosters move with the code".
12. **The errata edits of F**, and **no row for the tap guard's `a` arm** in `src/site/home/cards.ts`: an arm that answers an element no stage carries yet is defensive code, where a row is for a declaration that loses or dresses nothing (2g's frozen plan, call 7).
13. **Gate 7 gains one pointer sentence**. Rule: the gate keyed to writing a test that reads the repo's files is where the typist meets the guard; the line carries Alex's ruling on D2.
14. **The list's shape**: entries per test file, a folder as `dir/**`, two entries on one path allowed, the blind spot declared. Rule: walks read hundreds of files, so a folder entry keeps the list from growing with every new source file; the two-kind case is shell-css's.
15. **`KEPT_AT_CLOSE`, a frozen literal**. Rule: `LIST_AT_REFORMAT`'s precedent for a list that only shrinks.
16. **No throw at the read**, and **`VELLUM_SOURCE_READ_ROOT`** as the guard's one test hook. Rule: alternatives rejected above; the house's `VELLUM_*` hooks (`VELLUM_SITE_DIR`, `VELLUM_ALLOW_NO_BROWSER`).
17. **The roster as the rule's options plus a frozen literal in its test**. Rule: 2d's ruling D2 (lists in the lint's own settings) and `SHEET_RULES` in `test/repo/lint-wiring.test.ts`.
18. **The rule joins "the house's rules on every site script"**, and **`houseReports` leaves it out by name**. Rule: Issue #812's ruling; 2c-src call 12.
19. **The names** `test-support/source-read-guard.ts`, `test-support/source-read-list.ts`, `SOURCE_READS`, `test/repo/source-read-guard.test.ts`, `scripts/lint/shared-bindings.ts`, `vellum/shared-binding-imported`, `SHARED_BINDINGS`, `test/repo/shared-bindings.test.ts`, `src/site/print-room/atlas-head-markup.ts`, `atlasHeadMarkup`. Rule: each sibling's pattern (`scripts/lint/<topic>.ts` tested by `test/repo/<topic>.test.ts`; `src/site/print-room/*-markup.ts`); the D2 and D4 menu lines Alex took named them.
20. **The pull request closes Issue #779**. Rule: every part is merged, and Issue #600 and Issue #814 are open on their own.
21. **The planner measured in its own tree**: four runs of the whole unit suite (plain, under the read recorder, and under two guard prototypes) and nested-runner probes in the scratchpad, with no link made (bare imports resolve through the main checkout's `node_modules` above the tree); the runs deleted the tree's generated `public/` assets, which git does not track. A departure from the definition's "the tree exists for the spike", named here.
22. **CT7c's `landDraw(` count is kept, as CT9's restore count is**, where the first draft deleted it: both are censuses of call sites, and a call site added by hand would land or seat at a moment no one meant, which a reader would see (the plan skeptic's finding 8).
23. **shell-css's data test keeps its "declared once"**: its `deepEqual(declared.get(name), [hex])` reads each token's value against the ratified set, and a token declared twice is a second value in that same read, not a pin of its own; it is `handbook/plans/779/779-part2d-rules-plan.md`'s call 10 test and is left as written.
24. **PR #828's call 7 (`SHEET_RULES` kept as a literal in `test/repo/lint-wiring.test.ts`) stands as that pull request's call** when Issue #779 closes: it was put to Alex as open to overrule and never overruled, and Issue #814, which splits that file, is where its cost goes away.

## Decisions ruled

Alex ruled the four-part menu on 2026-10-13 (https://github.com/ahl-gram/Vellum/issues/779#issuecomment-6153462095), each the recommended option, with no further condition; the design above is built to them:

- **D1, the 75 leftover tests: sort by whether anyone could ever see it.** The 38 tests and six halves the ledger names go; 28 stay on a list that only shrinks (`KEPT_AT_CLOSE` holds its `kept` part); one pull request; nothing on any page changes. The check-placement line "Existing tests that search source text move under this rule as each one is touched" is replaced by F's bullets.
- **D2, how the house stops a new source read: the check that runs with the unit tests**, section C, with the blind spots C declares.
- **D3, the 8 witnesses: kept as an allowed kind of read**, with the one spec line F adds.
- **D4, the import checks: one lint rule holding the 22 required imports**, section B; the nine tests go, and PRR6 and CT9 lose their import halves.

## Stop conditions

Hand back, with the command and its output, when:

- `git diff --stat f41b4f3c origin/main` names any code or test file this plan names, with one exception measured at planning: PR #890 (Issue #860, open at `66940d4a`) changes `test/repo/e2e-tiers.test.ts` by one line, the title of the test at L292 ("every CI trigger gets the same full coverage, so nothing is conditional on the event" becomes "... so no e2e step is conditional on the event"). If that is the file's whole diff (`git diff f41b4f3c origin/main -- test/repo/e2e-tiers.test.ts` shows that one changed line and nothing else), build on it: T13's pin (L269 to L274) and the witness test (L301) are untouched. Any other change to that file is a hand-back.
- After commit 2, `npm run lint` reports `vellum/shared-binding-imported` at a real file, or any lint test other than `houseReports`' collection reds on the new rule.
- After commit 9, `npm test` under the guard reports an unlisted read or an unused entry the list in C did not predict, or passes with a read T10's cases say it must fail.
- A test file not named in this plan fails after the deletions, or `npm run lint` names an unused suppression in `eslint-suppressions.json` (the rulebook's prune then applies, and the PR body names it; any other change to that list is a hand-back).
- T10 case (b) or (g) fails to show `# pass 1`, or any case's output carries `run() is being called recursively`.
- `runninghead` or `hunt,print-room` reds after D, or `atlasHeadMarkup`'s output differs by a byte from the five lines it replaces.
- A comment on Issue #779 newer than its 58th that is not the dispatcher's plan archive.

## Plan skeptic

`vellum-plan-skeptic` ran one round on the issue, this plan and recon's ledger: no blocking finding, five should-fix, six nits; 41 claims checked, 3 called wrong, 1 hidden assumption. Each finding, with what was done:

1. (should-fix) The guard never switched on in T10's planted repos on macOS: `tmpdir()` is under the symlinked `/var`, the child's `argv[1]` and `cwd` under `/private/var`. **Folded**: the guard realpaths its root (C); T10 hands it the unresolved root so the realpath is what is tested; a mutation row. Measured with a fixed prototype: a `/var/folders` root now reds case (a).
2. (should-fix) With a deeper stack limit, a test's own `import()` shows below a module load's frames, and a `callerFile` that skipped `node:` frames counted the import as the test's read. **Folded**: the caller is the frame that called the read; a first frame under `node:` returns `null` (C, T7 case 3, T10 case (i)). Measured with a fixed prototype: static and dynamic imports at `--stack-trace-limit=100` pass, and the whole suite names the same 49 reads as before.
3. (should-fix) D2(a), C and F claimed more than the guard sees. **Folded**: the per-file and folder-entry gaps and the reads made for a test are declared in C, named in D2(a)'s menu line, and F's bullet says what review holds.
4. (should-fix) T16 predicted the wrong failure, and the new RH7 could throw out of `evaluate` and stop `runninghead`. **Folded**: the payload returns null when no heading is found (D); T16's predictions corrected, with a third mutant on the h1's size.
5. (should-fix) Deletions inside D4's tests and the shrinks sat on no menu. **Folded**: the six halves are named as D1's, above the ledger's first table, and the menu set out each option's build; that section left at the fold of Alex's rulings, which took the recommended options.
6. (nit) `callerFile` left frames with no path unspecified. **Folded**: they are skipped (C, T7 case 2).
7. (nit) AK6's title over-claimed "the one reader of the fit press's binding". **Folded**: narrowed to the selector's reach, and the PR #833 AK6 row narrowed rather than deleted, since nothing reads what the fit press does.
8. (nit) The deletion test was applied unevenly. **Folded**: CT7c's `landDraw(` count is kept, as CT9's census is (call 22); shell-css's "declared once" rides its data read (call 23).
9. (nit) `footer a { color: inherit; }` is as dead as the ring's footer arm. **Folded**: the new site row names both.
10. (nit) D1(b)'s count. **Folded**: all 75 (66 with D4(a)).
11. (nit) PR #828's `SHEET_RULES` call at the close. **Folded**: call 24.

Claims it called wrong: "every handed test is among the 75" (**folded**: the population now says 74 read source and the 75th, astro-scaffold's retired-dress test, searches the built sheet); T16's prediction (**folded**, finding 4). **Rejected**: "astro-scaffold sits on an accepted `max-lines` skip and two listed functions" is right as written: the file opens with `/* eslint-disable max-lines */`, the accepted skip `handbook/specs/rulebook.md` lists ("`max-lines` at the head of `test/site/astro-scaffold.test.ts`"), beside its two listed functions in `eslint-suppressions.json`; the skeptic read the suppressions list alone. Its hidden assumption (the recorder attributed reads differently from `callerFile`) is finding 2, folded.
