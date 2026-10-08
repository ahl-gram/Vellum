# How the site is authored, bundled, discovered and shipped

**This is the site's construction, not its dress.** It holds what a session needs before adding or
restructuring a page, a stylesheet, a bundle or an inlined script: how a page is authored and what it
joins, what the build does to what you wrote, the forms that fail silently when written any other
way, how the site is discovered, and how it reaches the reader.

It carries rules that bind future work. A detail that applies to exactly one piece of code stays in
that code beside its test.

Its siblings hold what this file deliberately does not: `handbook/specs/ui-design.md` how any of it looks,
and `handbook/specs/cascade-traps.md` what the browser does to a declaration that reads as correct;
`handbook/specs/rulebook.md` the golden, the committed set, the regen and the
order of work; `handbook/specs/explorer-doctrine.md` and `handbook/specs/region-and-voyage.md` what an app surface
draws once it is mounted; `handbook/specs/settle-doctrine.md` how a wait on it is written; and
`.claude/skills/vellum-footguns/SKILL.md` the imperatives keyed to the moment of typing. Where this
file and the rulebook disagree about a rule, the rulebook wins, with ONE known exception: the
rulebook's retired-rules line that a page is one `.astro` file plus one nav entry describes a
reading page, and what a working page costs is this file's rule below. #590 scopes that line.

**No counts live here.** Not the number of pages, sheets, bundles or suites. A count in a durable
document rots silently, because nothing in this repo sweeps a claim in markdown (only a backticked path is scanned). The rosters below are named by
symbol and path so the reader goes and looks.

## How a page is authored

- **A page is one `.astro` file under `src/pages/` rendered through one shared layout.** The file is
  `src/pages/<route>/index.astro`, home being `src/pages/index.astro`, and the layout is
  `src/layouts/BaseLayout.astro`, which owns the nav, the head cluster, the footer and the page
  meta. The tree is the roster of pages; no list of them is kept anywhere, including here.
- **Two INDEPENDENT questions decide what a page joins, and mixing them up is how a page gets
  mis-budgeted.** The first is how the page is reached, which decides its place in the nav and the
  discovery files. The second is whether it mounts a bundle, which decides everything in the rule
  below. A page can be any combination of the two.
- **How a page is reached comes in four kinds.** A nav-listed room has its entry in `NAV_ITEMS` in
  `src/layouts/nav.ts`. A child is seated under its room in `ROUTE_CHILDREN` beside it: off the
  nav's top line, inside the discovery routes, and named by the trail, which is how `/prospect/`,
  `/ribbon/` and the Portfolio are reached. A destination is off the tree but inside the discovery
  routes, which is how `/atlas/` is reached, and a new discovery route is either seated or named
  beside the atlas, which `test/site/route-tree.test.ts` holds. A page may also be deliberately off
  all of them, carrying the layout's `noindex` prop, which is what `/specimen/` is. A page that is
  off a list is a decision with a mechanism behind it, so do not "fix" one by adding it.
- **The nav's top line lists ROOMS, world-agnostic and shell-wearing, and a room may carry children
  seated under it that are not strictly rooms.** A route's seat is its first appearance in the tree
  and any later appearance is an alias. The atlas stays out of both, because it is one world's
  generated output rather than a room, with the home card as its way in. **The home cards are modes
  of encounter**, one to a mode, and a page deliberately without a card is not an oversight.
- **A reading page is cheap and a working page is not.** A reading page is the `.astro` file plus,
  if it is a room, its `NAV_ITEMS` entry or its seat in `ROUTE_CHILDREN`, its name in
  `ROUTE_NAMES`, and its own sheet. A working page that mounts a bundle owes
  all of that plus its entry in `BUNDLE_ENTRIES` (`scripts/build-app-bundles.ts`), its generated
  twin in `GENERATED_SUBTREES` (`scripts/clean-public-generated.ts`) and in `.gitignore`, and its own
  e2e suite, which then joins the suite order, the runner's map, a lane and that lane's measured
  budget. **Budgeting a working page as a two-file change is the mistake this rule exists to stop.**
- **The rosters are found by grepping, never by reading a list.** The mechanism is the footguns
  Gate 4 one: grep the nearest sibling's name across `src/`, `scripts/`, `e2e/`, `test/` and `.github/`, and
  join every list it appears in. A list written in prose is a starting point and goes stale; the
  grep does not. **Some rosters close themselves and some do not, so learn which before you rely on
  a red.** The stylesheets under `public/` are no list anyone keeps: `SITE_SHEETS` in
  `test-support/site-sheets.ts` reads them from git, so a new sheet joins every sweep that imports
  it by existing, and `test/site/tip-affordance.test.ts` reds when git's list and a walk of `public/`
  disagree. A new sweep over the sheets imports `SITE_SHEETS` rather than typing a list of its own,
  and names any sheet it skips beside itself through `sheetsSweptBy`, with the reason. A sweep that
  walks or globs `public/` for itself reads the disk instead, which on a built tree includes the
  generated gallery sheet `SITE_SHEETS` leaves out, so the two do not mean the same "every sheet".
  The authored CSS under `src/` closes by a `deepEqual` between `SRC_CSS_FILES` and a fingerprint
  walk of `src/`, which reds by name and tells you what to add. A discovery route closes too, at
  build time, by throwing when it has no blurb. The page, bundle, cleaning and lane rosters are
  hand-kept and silent when missed, which is why the grep comes first, and so are the lists that
  name a sheet for what it does rather than for being a sheet: `CHART_MOUNTS` in
  `test/site/shell-css-ground.test.ts`, the sheets home loads in `test/site/home-shelf.test.ts`,
  and `KIT_SHEETS` in `test/site/kit-scope.test.ts`, the sheets linked on every page.
- **The rosters a page or a sheet joins**, by symbol: `NAV_ITEMS`, `ROUTE_NAMES` and
  `ROUTE_CHILDREN` in `src/layouts/nav.ts`; `TOKENS` in `test/site/shell-css.test.ts`;
  `PAGES` in `test/site/astro-scaffold.test.ts`; `BUNDLE_ENTRIES` in `scripts/build-app-bundles.ts`;
  `GENERATED_SUBTREES` in `scripts/clean-public-generated.ts`; `ROUTE_ENTRIES` and
  `DISCOVERY_ROUTES` in `scripts/generate-discovery.ts`. A new suite additionally joins `E2E_SUITE_ORDER`
  (`e2e/support/suites.ts`), the runner's `SUITES` map (`e2e/support/suite-map.ts`, which the type
  check holds to `E2E_SUITE_ORDER`), `E2E_LANES` (`e2e/support/lanes.ts`), `MEASURED_SECONDS` (`test/e2e/lane-timings.test.ts`, CI seconds: an
  estimate first, corrected from its pull request's own lane log), and `NEEDS_PREDECESSOR` or `OPENS_ON_HOME`
  (`e2e/support/suites.ts`) if it reads the page the suite before it leaves or navigates first to
  `/`. A new LANE joins two more: `ci.yml`'s job matrix, where
  `test/repo/e2e-tiers.test.ts` reds if the matrix and `E2E_LANES` disagree, and `main`'s required
  checks, which no test can see at all. A change to the number of unit shards joins the same
  required checks, since each shard reports a check of its own.
- **A phone lays every page out at a fixed 1024 CSS pixels and shrinks it to fit.** The layout's
  viewport tag is exactly `width=1024`: no `initial-scale`, which defeats the fit, and nothing that
  stops pinch-zoom. The one other document that writes its own head, the served atlas (the `motion`
  arm of `atlasHead` in `src/atlas/document.ts`), carries the same tag; the offline download keeps its
  own, since its bytes are pinned. A desktop browser ignores the tag, so a narrowed or zoomed desktop
  window lays out at its own width: every page below 1024 keeps its 1024 layout at full size and the
  window scrolls sideways over it (the `min-width` on `body` in `public/shell.css`, Issue #762, and on
  the served atlas's `html` in `src/atlas/document.ts`, Issue #763).
  `test/site/astro-scaffold.test.ts` and `test/atlas/document.test.ts` hold the tag, and `FL1` in
  `e2e/suites/corners/floor.ts` holds every served page to the floor. **No rule switches the layout at
  a fixed window width at or below the floor**, in a sheet or a script: `vellum/css-no-narrow-width`
  refuses one in a sheet under `public/`, `vellum/no-narrow-width` in a TypeScript file under `src/`
  (both in `scripts/lint/narrow-width.ts`), and `CO1` in `e2e/suites/corners.ts` in any sheet a built
  page loads. A script inside an `.astro` page reaches none of them. A length that shrinks with the window, a height, the window's shape and a box's own size
  are outside the rule.
- **The shell dresses once.** Every shared shell rule lives in `public/shell.css`, and a page's own
  sheet carries page-specific rules only. A page carries no `<style>` of its own: its CSS lives in a
  sheet under `public/`, where the stylesheet lint reads it (Alex, Issue #779 comment 6067462530);
  home's scripts-off rules are `public/home-noscript.css`, linked from inside its `<noscript>`.
- **Sheet order is a contract.** The layout links the root sheets, then the shared sheets a page
  opts into through its `extraCss` prop, then the page's own `public/**/index.css`, so a page keeps
  the last word on its own layout. An `extraCss` href is validated at render and THROWS unless it is
  root-absolute. The layout links `public/shell.css` last, after the page sheet, which is why a
  page override of a shell rule needs higher specificity; that trap belongs to
  `handbook/specs/cascade-traps.md` and is not restated here, and `test/site/astro-scaffold.test.ts`
  holds the order in every built head.
- **Authored CSS hides in more places than `public/`.** A sweep written against `public/` alone
  misses every source in `src/` and passes. **The repo keeps its own roster of those**,
  `SRC_CSS_FILES` in `test-support/site-sheets.ts`, including a card whose faces are built rather
  than authored, and `SRC_CSS` in
  `test/site/tip-affordance.test.ts` pairs each with a way to get its CSS as a string, typed against
  that list so neither can hold a source the other lacks. Read that roster rather than any list
  written in prose, this one included: the sources are of several shapes (a constant written
  verbatim to a generated sheet, constants that only exist once the document is composed) and each
  needs its own way in.
- **Link form is scoped, and the flat rule is false.** Root-absolute is the form for the links the
  SHELL owns: the `NAV_ITEMS` hrefs, which are root-absolute trailing-slash directory form by their
  own interface contract, the root and shared sheets, the icons and fonts, and the discovery routes.
  A page's OWN in-body links are RELATIVE and pinned that way: home's chart embeds, its seed form's
  action, its room doors, and every working page's bundle twin. Write a new link in the form its
  neighbours use, and expect a test to hold you to it.
- **The room name and its card twin are TWO props, never one.** The layout takes the room and its
  open-graph twin separately, with the page title computed from the room, and the same split exists
  for the description. They are ratified apart, so do not collapse them or derive one from the other.

**What a working page's surface owes beyond its files.** The surfaces that draw share ONE render
worker, first in first out, with no job cancellation, so an ordered plate that is then redrawn
settles order-first on every run; a concurrency check may rely on that. A job that crosses the
worker boundary is serializable, and one function is the single glue both transports call, which is
`prospectResultFor` in `src/site/explorer/prospect-job.ts` for the prospect kind and the pattern a
new kind follows. **PNG is outside the determinism covenant and is never byte-compared**: a canvas
raster bakes the viewer's own installed fonts, as `src/site/lib/rasterize.ts` states at its head.
SVG remains the byte-faithful artifact.

## First paint and inlined scripts

- **Only a synchronous inline script can dress FIRST PAINT.** A deferred module bundle always
  flashes the page on a fresh sitting, so the pre-paint dress is written as an `is:inline` script on
  the page, which is a re-ratified exception to the #289 inline-script rule rather than a licence to
  add more. Home's pre-paint veil is the standing example, at `src/pages/index.astro`.
- **An unadopted veil releases itself.** The module adopts the veil when it boots; if it never
  boots, the veil lifts on its own timer so a failed bundle can never trap the page. The timer's
  value lives at the `setTimeout` and nowhere else. The e2e check "the safety release lifts an
  unadopted veil" is what proves it still happens.
- **A layout `<script>` MAY import a `.ts` module.** This corrects how #289 is usually cited. An
  Astro-processed script, meaning one WITHOUT `is:inline`, is inlined into every page's html and
  emits no file while its chunk stays under the bundler's default inline limit, which this repo does
  not configure. #289's own precedent is an `is:inline` script with no imports, which can never
  import anything, so it settles nothing about a processed one.
- **The cliff is guarded, not silent.** If such a chunk ever crosses the inline limit, the build
  emits a module file and the test "the deploy artifact serves no raw app source, no `.d.ts`, and no
  engine emit (#260)" in `test/site/astro-scaffold.test.ts` reds on it. That test builds its own
  tree, so it runs under the unit suite rather than only where a build already exists.

## What the build does to authored markup, and what that costs a test

- **Authored markup is NOT minified, and that is a contract.** `compressHTML` is set false in
  `astro.config.ts` with its reason stated there, and `test/site/astro-scaffold.test.ts` pins the
  setting, because the migrated pages' markup has to stay near-verbatim. **Not minified is not the
  same as untouched**: the build still adds slot whitespace, entity-encodes expressions and expands
  self-closing SVG children, which is what the two bullets below are about. What it MINIFIES is the
  Astro-processed script and the inlined shell CSS, which is what the quote-style bullet is about.
- **The minifier picks the quote style**, so a marker matching an inlined page script is written as
  a quote-agnostic pattern accepting backtick, double and single quotes, never as a quoted literal.
  The `pageScript` patterns in `test/site/astro-scaffold.test.ts` are the shape to copy.
- **A markup lift into components cannot be pinned byte-identical.** The build adds slot whitespace,
  entity-encodes text, and expands self-closing SVG children. Pin the rendered SHAPES instead, the
  way the `KIT_` patterns in `test/site/astro-scaffold.test.ts` do, and compare two builds only after
  collapsing whitespace between tags and decoding entities, which is what that file's own `normalize`
  and `decode` helpers exist for.
- **The escaping rule is about EXPRESSIONS, not about props versus slots.** Text that reaches the
  page through an expression is entity-encoded, whether it arrived as a prop or was interpolated into
  a slot; literal markup you authored passes through as written. The same possessive ships escaped
  where a page's data supplies it through an expression and raw where it is authored as prose, in
  one built page. Where byte identity matters, hand the text through as literal markup rather than
  through an expression.
- **CSS that travels as a STRING keeps its comments, and they ship as public page bytes.** The
  distinction is whether the build's CSS pipeline ever sees it. A sheet under `public/` is copied as
  written, comments included, so the same holds for it. `ATLAS_SHEET_CSS` in `src/atlas/document.ts`
  is a string: interpolated into the generated atlas document, and assigned to a style element's
  text content at runtime by the Print Room's bundled code. Neither path is minified, so prose
  written there is visible in the live page source and greppable by anyone, and a placeholder string
  in such a comment reads to a stranger like a rendering defect.

## The two contractual forms

Two pieces of authored code must be written in one exact shape. Both fail SILENTLY when written any
other way, which is what earns them a section of their own.

- **The worker spawn is the literal static form.** `src/site/explorer/worker-client.ts` spawns with
  `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`, written out in full at
  the call. The bundler rewrites only the statically analyzable form, so hoisting the target into a
  variable or a parameter emits no worker chunk and kills the worker at runtime for every surface
  that runs a job through that client. It is held by `vellum/worker-spawn-static` (`scripts/lint/source-shape.ts`),
  which `npm run lint` runs over `src/site`, holding every bare `new Worker` and `new SharedWorker`
  to the static form and refusing a worker constructor reached any other way (through a member, a
  variable, an alias or a string naming it; the name assembled from pieces still passes), and by a
  floor in `test/repo/constant-contracts.test.ts`, so the rule cannot pass over a tree with no
  spawn in it.
- **A bare relative worker URL resolves against the DOCUMENT base**, not the module URL, so it does
  not throw. It 404s, and the client falls back to running the job inline, which looks like a slow
  page rather than a broken one. That is the failure the literal form above exists to prevent.
- **`is:inline` on a working page's bundle-twin script tag is contractual.** Without it the build
  routes that script through its own pass, which the ratified #204 analysis rejects for these
  surfaces. **The guards name their pages by literal path, so the class is covered only indirectly**:
  the source-level pins list their pages, while the built-output assertion that each app page keeps
  its bundle-twin script tag rendered verbatim runs over `PAGES` in
  `test/site/astro-scaffold.test.ts`, which a new working page joins. A page that omits `is:inline`
  AND skips that roster reds nothing. Copy a sibling page's script tag whole, and join the roster.

## Discovery and indexes

- **The discovery files are DERIVED, and that is the anti-drift mechanism.**
  `scripts/generate-discovery.ts` writes them from `DISCOVERY_ROUTES`, which is the nav plus the
  routes that are not nav items, and every origin resolves against the `site` value in
  `astro.config.ts`. A domain move therefore updates all of them at once, which is exactly why
  `public/robots.txt` is generated rather than hand-written: a hand-written sitemap line survives such a
  move still pointing at the retired domain, which is what a domain move here would have stranded.
- **A route with no blurb is a build error.** Adding a route without its `ROUTE_ENTRIES` line throws
  by name, and the generator also throws if `site` is unset.
- **The sitemap carries locations only, deliberately.** The only timestamp it could honestly carry
  is build time, which would churn on every deploy and tell a crawler nothing.
- **The head carries only allowlisted links**, matched in `test/site/astro-scaffold.test.ts` as icon,
  apple-touch icon, stylesheet and prefetch. The prefetch list is derived from `NAV_ITEMS` with the
  current page excluded, and its own guard reds on a hand-copied route list.
- **A room's index is read from the page's OWN source at build time**, by `roomSections` in
  `src/layouts/room-sections.ts` and rendered through `src/layouts/IndexSlip.astro`, so the index
  cannot drift from the prose it indexes. An entry or a section without an id throws at build. **That
  mechanism is the rule for any new document room**: derive the index from the page, never maintain
  a second copy beside it.
- **Why a page pauses before navigating is usually bandwidth.** A click's html request queues behind
  still-streaming plate bytes, which is what the reserved frames and the low fetch priority for
  below-the-fold plates in `handbook/specs/rulebook.md` are for. That rule lives there; this line is only the
  diagnosis, so the next session stops looking for slow rendering.

## Tokens outside the palette join

`handbook/specs/ui-design.md` states the join for colours and states no exception. The exception is here,
precisely, because a token that falls outside it looks identical at the point of use.

- **A colour goes in BOTH places, which is `ui-design.md`'s own wording**: declared once in
  `public/shell.css` and mirrored in `SITE_PALETTE` in `src/atlas/palette.ts`. The
  guard is a `deepEqual` against `TOKENS` in `test/site/shell-css.test.ts`, so the ratified roster is
  a third place the pair is measured against. The phrase "the three-place join" belongs to
  `test/atlas/document.test.ts`, which uses it in its own title for the arrangement below, and is not
  `ui-design.md`'s wording for the colour rule.
- **The rule for what is outside is a DERIVATION, not a list.** `SITE_PALETTE` carries flat
  name-to-hex colours only, so a token whose value is not a flat hex is not in the join. Where it
  lives is then wherever declares it: `public/shell.css` holds the deep, the depth shadows
  and the room-furniture lengths; `public/fonts.css` and `public/motion.css` declare their
  own; and a page sheet may declare one in its own `:root`, where the SAME token name legitimately
  holds a different value on different pages. Check the declaration, not a remembered home.
- **A self-contained generated document declares its own copy, in one of two shapes.** The atlas
  declares the deep and the sheet depth in a screen-dress constant inside `src/atlas/document.ts`,
  which is module-local and reached by composing the document rather than by importing a symbol, and
  `test/atlas/document.test.ts` pins those declarations EQUAL to the shell sheet's. For the motion timings
  it uses the other shape, an inline `var()` fallback carrying a literal, because the standalone
  download links no motion sheet. **Nothing pins those literals, so that shape drifts silently**;
  prefer the pinned one, and if you use the fallback shape, know that a change to the sheet will not
  reach it.
- **The rule is about a document that stands alone**, which the atlas download does. The gallery
  writes a sheet consumed through the layout, so it declares none of these and is not an example.

## Build, check and deploy

- **One press, one pass.** `scripts/build-app-bundles.ts` is a single multi-entry Vite build over
  `BUNDLE_ENTRIES`, compiling the TypeScript entries and the engine graph they import together, so
  there is no separate emit step and nothing orders against one. Twins are staged in a temporary
  directory and copied into `public/`; shared chunks take fixed names with no hashes; one worker
  chunk serves the surfaces that spawn it. `publicDir` is false in each press config, guarded, since
  a truthy value copies `public/` into itself.
- **A job that draws a plate loads the plate's code on demand.** Today those are
  `prospectResultFor` in `src/site/explorer/prospect-job.ts` and `composeAtlas` in
  `src/atlas/compose.ts`: a page and the worker reach them only through `import()`, so a page that
  draws no plate downloads none of the plate's code, and a new job kind that draws one joins them.
  Import anything else from such a module with `import type`, since a `type` specifier inside braces
  keeps the import and the module with it (`no-import-type-side-effects` in `eslint.config.ts`
  refuses that form). The worker's own chunks land in `explorer/chunks/worker/`, apart from the
  page's, because the press lets the two builds overwrite a chunk of the same name without a word.
  `test/site/app-bundles.test.ts` holds the split and the separation.
- **`npm run check` is three passes, and code that runs where no page does may not name the page.**
  `tsconfig.json` checks every TypeScript root with the browser libraries. `tsconfig.engine.json`
  checks every `.ts` under `src/` outside `src/site/` without the DOM libraries: the generator, the
  renderer, the CLI, `src/layouts/` and every directory added there, and not the living chart under
  `src/site/living-chart/`, which `handbook/specs/explorer-doctrine.md` calls the engine. Nothing in
  that tree names `document`, `window`, an element type or any other DOM-only global.
  `tsconfig.worker.json` checks everything `src/site/explorer/worker.ts` loads against the language
  and the worker library alone, with no Node types, so nothing the worker loads names the DOM,
  `localStorage`, `sessionStorage` or a Node-only global such as `process`. A new worker joins that
  file's `files`, and `test/repo/type-check.test.ts` reds until it does. No file either pass reads,
  Node's own types in the engine pass aside, may write the global scope (a lib or types reference directive, a `declare global`, a
  script-shaped declaration file), which would bring back names the pass removed. Known gaps: a
  browser name Node's own type files also declare (`localStorage`, `sessionStorage`, `navigator`)
  passes the engine pass in code the worker does not load; a Node-only global passes every pass in
  any code the page loads and the worker does not, since the engine pass and the root pass both
  carry Node's types; and `src/site/explorer/worker-client.ts`, page code, sits in the worker pass
  through a type-only import, so a DOM use there reds falsely until `WorkerRequest` and
  `WorkerResponse` move to a module of their own.
- **`astro:generate` is clean, fonts, bundle, showcases, discovery, in that order**, and several suites pin
  its exact command string. A reordered or added step reds all of them at once: that is the pin
  working, not a break, but budget the edits.
- **The site's fonts are generated, from the design kit.** `scripts/kit-fonts.ts` copies
  `design/kit/fonts/`, the one copy the site reads, into the gitignored `public/fonts/`, so a face is
  added or changed in the kit and never under `public/`. Nothing under test reads `public/fonts/`:
  `test/site/astro-scaffold.test.ts` cleans the generated trees while other files run, so a reader
  there races it; read `KIT_FONTS` from `scripts/kit-fonts.ts` instead.
- **Clean before regenerate.** The generators overwrite and never delete, so without the clean a
  renamed module leaves an importable orphan that masks a missing file locally while CI, always a
  fresh checkout, stays fine. `GENERATED_SUBTREES` is that list; it may grow and may not shrink, it
  carries a deliberate tombstone for a tree nothing generates any more, and a test assertion of its
  floor stays LITERAL rather than derived from the constant the code iterates.
- **The dev server needs its dev-only middleware.** `astro.config.ts` registers a middleware that
  serves the surfaces' canonical trailing-slash URLs in dev, because the dev public middleware serves
  exact file paths only. Removing it looks harmless and 404s every working page in dev, while build
  and preview are untouched.
- **The e2e harness serves the engine by type-stripping the real source.** `serveEngineModule` in
  `e2e/site-server.ts` strips types from `src/*.ts` on demand, which is how a suite
  computes an expected value in-browser and dodges cross-engine float drift. It is e2e only; the
  deploy artifact carries none of it, and a test that proves the artifact carries none of it exists.
- **CI is parallel jobs on the same triggers**, one per unit shard, each running the typecheck, the
  lint, the format check and its own slice of the unit files, and one per browser lane, each of which builds `dist/` and
  runs that single lane on a runner of its own. A pull request therefore waits for the LONGEST job,
  not the sum, and the repeated install and build are the price of that. Every lane rebuilds rather
  than downloading a shared artifact, and prints a hash of its own `dist/` so a disagreement between
  two lanes is visible instead of silent.
- **Required checks are matched by JOB NAME, and that roster lives outside the tree.** Renaming a job
  in the workflow looks cosmetic and blocks EVERY merge, because the required context never reports
  again until branch protection is updated to match; ADDING a job that ought to be required is the
  same two-part change with the failure inverted, since the new job is simply not required and
  nothing in the repo can red. Nothing here can read branch protection, so both directions are
  deliberate, and the pull request that changes the job list names the exact check names in its body.
- **Deploy is a workflow, not a branch.** Pages builds from `.github/workflows/deploy.yml`, which
  installs, runs the build and publishes the built tree on a push to `main` or on demand. What is
  committed rather than rebuilt is the rulebook's rule and is not restated here.

---

*Companion to `handbook/specs/ui-design.md` (how it looks), `handbook/specs/cascade-traps.md` (how the cascade breaks
here), `handbook/specs/rulebook.md` (the golden, the committed
set, the order of work), `handbook/specs/explorer-doctrine.md` and `handbook/specs/region-and-voyage.md` (what a
mounted surface draws), `handbook/specs/settle-doctrine.md` (how a wait on it is written), and
`handbook/specs/development-workflow.md` (the order a change moves through).*
