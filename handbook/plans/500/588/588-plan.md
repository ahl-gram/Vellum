# 588 plan: specs/site-architecture.md

Lane: vellum-implementer, worktree `.claude/worktrees/agent-a43d168c7fb27368a`, branch
`chore/588-site-architecture` (renamed 2026-09-13, before any commit). Base 2ddef7c.

## Deliverable

Two files, prose only. No `src/` change, no test change, no chart or golden move, no regen.

1. `specs/site-architecture.md` (new): how the site is authored, bundled, discovered and shipped.
2. `CLAUDE.md`: one new clause in the specs-enumeration sentence and one in the required-reading
   sentence, both in the FOURTH slot among the new files, after `region-and-voyage` (ruled on #585
   2026-09-14, relayed onto #588 the same day).

## Voice, shape and length

Prescriptive, like `specs/engine-invariants.md` (merged, 228 lines) and
`specs/explorer-doctrine.md` (PR #596, 251 lines): imperative rules, no dated story of how a rule
reached its wording, `` `symbol` in `path` `` citations, no counts of pages or sheets or suites, no
em-dashes.

**Shape, corrected by the skeptic (finding 10): BOLD-LEAD PARAGRAPHS, not bullets.**
`engine-invariants.md` carries zero `- ` bullets and 39 bold-lead rules over 228 lines, about 57
words a rule. The plan's outline is bullets for planning only; the file is written in the sibling's
shape.

**Length is a ruled constraint, not a preference.** #587 came out about thirty percent over the
largest existing spec and Alex split it rather than accept the size. This lane applies that standard
WHILE drafting: a line that does not bind future work does not get written. Target at or below
explorer-doctrine's 251 lines.

**The skeptic priced it (finding 10) and the price is tight**: the outline is about 1959 words
against engine-invariants' finished 2212, so it does not compress by being written up, and at the
sibling's rate this lands near 230 to 280 lines. The trim comes from the decision-4 material in
section 7 and from any rule a test already states at its own site. The final line count goes in the
report and in the PR body as a number, not as a claim that it "came in under".

Header paragraph names what the file is and what its siblings keep: `rulebook.md` the golden, the
committed list and the regen; `ui-design.md` how a page looks; `settle-doctrine.md` how an e2e wait
is written; `development-workflow.md` the order of operations. This file is the site's construction,
not its dress.

## Sections, in the issue's order, with the ledger rows each carries

Source rows are POINTERS into the private ledgers at
`audits/2026-09-13-memory-to-specs/`. Nothing is pasted; each rule is
rewritten from the repo fact it names, and each fact is verified with a command first.

### 1. How a page is authored
- Every page is `src/pages/<route>/index.astro` (home is `src/pages/index.astro`) rendered through
  `src/layouts/BaseLayout.astro`, with its entry in `NAV_ITEMS` in `src/layouts/nav.ts` if it is a
  nav-listed room. The tree is the roster; no list of pages is written here. (site 24 stem)
- The shell dresses once: all shared shell rules live in BaseLayout's `<style is:global>`; a page
  sheet is page-specific only. (site 30a)
- Sheet order is a contract: the layout links the root sheets, then the `extraCss` shared sheets,
  then the page's own sheet, so page rules keep the last word. The layout's own inline `<style>`
  renders after the page sheet link, which is why a page override of a shell rule needs higher
  specificity (that cascade trap is already `specs/ui-design.md`'s; point, do not restate).
  (site 32a, 30m)
- Where authored CSS can hide, stated as the sources any sweep must cover: `public/**/*.css`,
  BaseLayout's global block, `GALLERY_PAGE_CSS` in `src/cli/gallery.ts`, and `ATLAS_SHEET_CSS` plus
  `PAGE_CHROME_CSS` in `src/atlas/document.ts`. A sweep written against `public/` alone misses the
  other three. (site 64a)
- **The MECHANISM before any list (skeptic finding 7).** The rule is Gate 4's: grep the nearest
  sibling's name across the tree and join every list it appears in. A list written in a spec is a
  starting point, never the list, and the memberships of the sheet rosters already differ from one
  another. Name the one roster that SELF-CLOSES (the sweep in `test/site/tip-affordance.test.ts`
  walks `public/`, so an unlisted sheet reds there) against the hand-kept ones that do not. Name the
  lane rosters too, since an app surface's own suite joins them: the runner's `SUITES` map,
  `MEASURED_SECONDS` in `test/cli/e2e-lanes.test.ts`, `E2E_LANES` in `src/cli/e2e-lanes.ts` and the
  tier sweep in `test/repo/e2e-tiers.test.ts`.
- The rosters a page or a sheet joins, by verified symbol and path, with no membership listed:
  `PAGE_CSS`, `SHARED_CSS`, `ROOT_CSS` and `TOKENS` in `test/site/shell-css.test.ts`; `PAGES` (a
  `PageSpec` list) in `test/site/astro-scaffold.test.ts`; `BUNDLE_ENTRIES` in
  `scripts/build-app-bundles.ts`, pinned in `test/site/app-bundles.test.ts`; `GENERATED_SUBTREES` in
  `scripts/clean-public-generated.ts` with its deliberately literal floor in
  `test/site/astro-app-surfaces.test.ts`; `ROUTE_ENTRIES` and `DISCOVERY_ROUTES` in
  `scripts/generate-discovery.ts`. The IMPERATIVE to join them at the moment of typing stays in
  footguns Gate 4; this file states the model. (site 24 stem)
- Placement, ratified on #202: the nav lists ROOMS, world-agnostic and shell-wearing; the atlas is
  permanently out of the nav and its way in is the home card; the Go Deeper cards are modes of
  encounter. **THREE page kinds, not two (skeptic finding 12):** a nav-listed room; a destination
  that is off the nav but in the discovery routes, the way `/prospect/` is; and a page deliberately
  off BOTH, with the layout's `noindex` prop, the way `/specimen/` is. (site 24f, 24g, 46a)
- The FAQ splits its page title from its card title: two props on the layout, never collapsed or
  derived. (site 24j)
- **Link form, SCOPED (skeptic finding 1, blocking; the flat rule was false).** Root-absolute is the
  form for the links the SHELL owns: `NAV_ITEMS` hrefs (the interface comments them "root-absolute,
  trailing-slash directory form"), the `extraCss` shared sheets (validated at render, which throws
  on a relative href), the root sheets, the icons and fonts, and the discovery routes. A page's OWN
  in-body links are RELATIVE and pinned that way: home's chart embeds (`src="charts/..."`), its form
  `action="explorer/"`, its room doors and every app page's bundle twin. Six tests pin the relative
  form. Write the rule as which links each form governs, never as "all asset links are
  root-absolute". (site 56, corrected)
- **App surfaces** (subsection, SHAPE DEPENDS ON OPEN DECISION 1): a page that mounts a bundle is a
  larger thing than a content page. What it owes, as a model rather than a count: a bundle entry and
  its gitignored twin, its own sheet, a worker client where it draws, and its own e2e suite in a
  lane. Contracts that come with it: the surfaces that draw share ONE FIFO render worker, so an
  ordered-then-redrawn plate settles order-first every run, which is the deterministic substrate a
  concurrency check leans on (site 54h); one glue serves both transports for a serializable job,
  `prospectResultFor` in `src/site/explorer/prospect-job.ts`, which is the pattern a new job kind
  follows (site 46c); and the raster boundary, that PNG is outside the determinism covenant and
  never byte-compared while SVG stays the byte-faithful artifact (site 54g).

### 2. First paint and inlined scripts
- Only a synchronous inline script dresses first paint; a deferred module bundle flashes the page on
  a fresh sitting. Home carries its pre-paint script by a re-ratified exception to the #289
  inline-script rule. The module adopts the veil, and an unadopted veil releases itself on a bounded
  timer so a failed bundle never traps the page. No number in the prose: the timer is a literal in
  `src/pages/index.astro`, and that is where it stays. (landfall 17)
- A layout `<script>` MAY import a `.ts` module, contrary to how #289 is usually cited. An
  Astro-processed script (not `is:inline`) is inlined into every page's HTML and emits no file while
  its chunk stays under Vite's DEFAULT inline limit, which the repo does not configure (recon: no
  `assetsInlineLimit` anywhere; the measurement is recorded at `src/layouts/BaseLayout.astro:295`).
  #289's own precedent is an `is:inline` script with no imports, which can never import anything.
  The cliff is guarded, not silent: the "deploy artifact serves no raw app source, no .d.ts, and no
  engine emit" test in `test/site/astro-scaffold.test.ts` reds if a raw module ever ships. Name the
  limit as the bundler's default, never as a repo setting and never as a byte count.
  (landfall 37; recon CURRENT with the correction)
- The `is:inline` half of this is section 4's second contractual form, and is written there.

### 3. What the build does to authored markup, and what that costs a test
- **Leads with the near-verbatim contract (skeptic finding 4, blocking).** The build does NOT minify
  authored markup: `compressHTML: false` is set with its reason at `astro.config.ts`, and
  `test/site/astro-scaffold.test.ts` pins it. What IS minified is the Astro-processed script and the
  inlined shell CSS. Every rule below is scoped to those, not to markup. Without this lead the
  section reads as licence to expect markup drift, which inverts the one rule governing it.
- The MINIFIER PICKS THE QUOTE STYLE, so a scaffold marker for an inlined page script is a
  quote-agnostic pattern, never a quoted literal. The repo's own patterns accept all three quote
  forms (the `pageScript` patterns in `test/site/astro-scaffold.test.ts`). Recon's correction: write
  the rule as the minifier choosing the quote, not as "it writes backticks". (landfall 50)
- A markup lift into components cannot be pinned byte-identical: slot whitespace, an escaped
  apostrophe and expanded self-closing SVG children are all build output. Pin the rendered shapes
  (ids, classes, attribute grammar), the way `KIT_FOG`, `KIT_VIGNETTES`, `KIT_GLASS` and `KIT_STAGE`
  do in `test/site/astro-scaffold.test.ts`, and compare builds after collapsing whitespace between
  tags and decoding entities, which is what that file's own `normalize` and `decode` helpers do.
  (landfall 81)
- **The discriminator is a text EXPRESSION versus literal markup, not prop versus slot** (skeptic
  finding 8): a slot fed `{expr}` escapes too. Written that way. Recon marked this UNVERIFIABLE;
  **this lane MEASURED it on 2026-09-13** with `npm run build` and two greps, and the skeptic
  measured the sharper case (the same string, `travelers' notes`, escaped at `dist/index.html` where
  it arrives through an expression and raw at `dist/faq/index.html` where it is literal prose):
  - `src/pages/prospect/index.astro:46` passes `verb`, `title` and `where` to `Slip` as props whose
    text carries apostrophes; `dist/prospect/index.html:85-87` shows every one as `&#39;`.
  - `src/pages/faq/index.astro:44` authors "a world's identity" as literal prose in the page body,
    which is BaseLayout's default slot; `dist/faq/index.html` carries two raw `world's` and zero
    escaped forms.
  - Written as the accurate mechanism: a prop's text is a text EXPRESSION and arrives entity
    encoded; literal markup handed to a slot is not an expression and passes through as authored.
    That is what decides slots versus props wherever byte identity matters. (landfall 83)
- Authored bytes that ship verbatim: `ATLAS_SHEET_CSS` is inlined into every atlas host, so a
  comment written there is public page bytes on the live site. (site 42)

### 4. The two contractual forms
Recon found the second, so the section is written as the issue asks.

- **The worker spawn** is the literal static form in `src/site/explorer/worker-client.ts`. Only the
  statically analyzable form is rewritten by the bundler, so hoisting it into a variable or a
  parameter silently kills the worker for every surface that runs a job through that client. NO
  COUNT: recon measured one spawn site and six importers, and the body's "both app surfaces" is
  stale. Two guards, both named: the file-specific pin in `test/site/app-bundles.test.ts`, and the
  roster-wide scanner in `test/repo/constant-contracts.test.ts` that sweeps every worker spawn under
  `src/site`. (site 60b)
- The trap that shaped it: a bare relative worker URL resolves against the DOCUMENT base rather than
  the module URL, so it 404s into a silent inline fallback rather than an error. (site 54e)
- **`is:inline` on an app page's bundle-twin script tag** is the second. Without it the build routes
  that script through its own pass, which the ratified #204 analysis rejects for these surfaces;
  `test/site/app-bundles.test.ts` states that in terms and pins the tag. **Written with its coverage
  named (skeptic finding 6):** that pin names its pages by literal path and does NOT cover the
  class, so a NEW app surface omitting `is:inline` reds nothing. The contrast is the worker scanner
  in `test/repo/constant-contracts.test.ts`, which walks `src/site` and carries a floor. The
  widening is a sibling defect, reported and not folded. (recon; skeptic)

### 5. Discovery and indexes
- `scripts/generate-discovery.ts` writes the discovery files, its route list DERIVED from
  `NAV_ITEMS` plus the routes that are not nav items, and every origin resolved against the `site`
  value in `astro.config.ts`, so a domain move updates all of them at once. That derivation is the
  rule: robots.txt is generated rather than hand-written exactly because a hand-written sitemap line
  survives a domain move pointing at the retired domain. A new nav item owes its `ROUTE_ENTRIES`
  blurb or the tests red. (site 24m)
- The sitemap carries locations only, on purpose: the only honest timestamp is build time and it
  would churn every deploy. (site 24o)
- A page may be deliberately out of BOTH lists: off `NAV_ITEMS` and off `DISCOVERY_ROUTES`, with the
  layout's `noindex` prop. That is a choice with a mechanism, not an oversight, so a sweep that finds
  such a page leaves it alone. (verified at `DISCOVERY_ROUTES` and the `noindex` prop)
- The head carries only the links on a named allowlist, and the prefetch list is derived from
  `NAV_ITEMS` with the current page excluded, so it cannot rot. **Correction measured by this lane**:
  the allowlist is icon, apple-touch icon, stylesheet and prefetch (the negative lookahead at
  `test/site/astro-scaffold.test.ts:358`), not the three the ledger row names. The prefetch
  derivation has its own guard at line 260, which reds on a hand-copied route list. (site 40c)
- A room's index is derived from the page's OWN source at build time, so it cannot drift from the
  prose, and an entry with no id is a build error. `roomSections` in `src/layouts/room-sections.ts`
  is the mechanism, and the mechanism is the rule for any new document room. (landfall 51)
- The load model, stated once and pointed rather than restated: a click's HTML request queues behind
  still-streaming plate bytes, which is WHY `specs/rulebook.md`'s reserved frames and low fetch
  priority for below-the-fold plates are the rule. (site 40e; overlap with rulebook "Heavy lazy
  plates")

### 6. Tokens outside the palette join
Verified before drafting, in `ui-design.md`'s OWN vocabulary, since Sub 5 hangs its pointer line off
this sentence and the two lanes need one vocabulary (recon raised this as a decision; see the menu):

- What `ui-design.md` says: a colour token is declared once in the layout and mirrored for the
  generated documents, and **a new colour goes in both places or the palette test reds**. Measured:
  those places are BaseLayout's global `<style>` and `SITE_PALETTE` in `src/atlas/palette.ts`, with
  `TOKENS` in `test/site/shell-css.test.ts` as the guard that `deepEqual`s the module against the
  ratified roster. The issue's phrase "three-place join" is `test/atlas/document.test.ts`'s own
  title for the SEPARATE shape below, not `ui-design.md`'s wording.
- The exception as a DERIVATION, not a list (skeptic finding 2, blocking): `SITE_PALETTE` carries
  flat name-to-hex colours only, so a token whose value is not a flat hex is not in the join. Where
  it lives is then whatever declares it: the layout's global style, a root sheet (`public/fonts.css`
  and `public/motion.css` both declare their own), or a page sheet's own `:root`, where the same
  token name can legitimately hold a DIFFERENT value per page. The six tokens declared in the
  layout are EXAMPLES of the derivation, not the set. Verified at their declarations, not with a
  line-start sweep, since `--chrome-y` shares its line with `--chrome-x` (skeptic finding 14).
- The rule for a self-contained generated document, BOTH shapes (skeptic finding 3, blocking): the
  atlas declares its own copy of `--the-deep` and `--sheet-shadow` in `SCREEN_DRESS_CSS` in
  `src/atlas/document.ts` and a test pins it EQUAL to the layout's; for the motion timings it uses
  the other shape, an inline `var(--paper, 260ms)` fallback, because the standalone download links
  no motion sheet, and NOTHING pins those literals. Say which is which, and say that the second
  drifts silently. The atlas is the only standalone generated document; `src/cli/gallery.ts` is not
  one (it writes a sheet consumed through the layout), so it is not cited here (skeptic finding 15).
- Sub 5 adds the matching pointer line in `ui-design.md`; this lane does not edit that file.
  (landfall 79)

### 7. Build, check and deploy
**Scope note (skeptic finding 9): this section is wider than the issue's own section list, which
stops at "Deploy".** The issue's SOURCE list assigns this file the CI rows (68a, 68c, 72a) and the
e2e oracle (24s), and no other file in the epic claims them, so they are written here and the
expansion is put to Alex as decision 4 rather than taken quietly.

- The press: one multi-entry bundler build over the app entries (`BUNDLE_ENTRIES`), twins staged in
  a temporary directory then copied into `public/`, shared chunks at fixed names with no hashes, and
  one worker chunk shared by the app surfaces. (site 60a)
- The generate pipeline as a sequence (clean, bundle, showcases, discovery), with the fact that
  several suites pin its exact command string, so a reordered step reds all of them at once and that
  is the pin working. (site 24 stem)
- Clean before regenerate: the generators overwrite and never delete, so a renamed module would
  leave an importable orphan that masks a missing file locally while CI, which always starts fresh,
  is fine. `GENERATED_SUBTREES` in `scripts/clean-public-generated.ts` is that list, it is allowed to
  grow and not to shrink, and one of its entries is a deliberate TOMBSTONE for a tree nothing
  generates any more. Keep a test assertion of the floor literal rather than derived from the same
  constant the code iterates. (site 24 stem; verified at the constant and its comment)
- The dev server needs its dev-only middleware to serve the surfaces' canonical trailing-slash URLs;
  removing it looks harmless and 404s every app surface in dev while build and preview stay fine.
  (site 24p)
- The e2e oracle: the harness serves the engine modules on demand by type-stripping the real
  TypeScript (`stripTypeScriptTypes` in `scripts/e2e/harness.mjs`), which is how a suite computes an
  expected value in-browser without cross-engine float drift. E2e only; the deploy artifact carries
  none of it. (site 24s)
- CI is two parallel jobs on the same triggers, so the wall clock is the longer half and not the
  sum, and the e2e lanes run one runner per lane on its own port inside one job (`E2E_LANES` in
  `src/cli/e2e-lanes.ts`). (site 68a, 72a)
- The job-name trap: required checks are matched by JOB NAME, so renaming one in the workflow looks
  cosmetic and blocks every merge until branch protection is updated to match. (site 68c)
- Deploy: Pages builds from a workflow that runs the build and publishes the built tree. Model only,
  no account, registrar or hosting-account detail. (site 74a)

## CLAUDE.md, the exact edits

**Anchored on clause TEXT, not line numbers.** #593 and #596 both insert into the same two
sentences, so any line number taken now is void after the merge. The report names the pre-merge
numbers as void and the post-merge numbers as the ones that count.

**GATED ON #596 (skeptic finding 5, blocking).** #593 has merged; #596 is still open. Inserting
"before the `specs/development-workflow.md` clause" on today's main puts this clause after
`engine-invariants` and nothing else, which is NOT the ruled fourth slot: `git merge origin/main`
cannot import a branch that has not landed. So the CLAUDE.md edit is made after #596 is on
`origin/main`, and the lane checks that with a command before it pushes. If the dispatcher wants the
push sooner, the PR body names the position as provisional and the fix as owed.

**A sibling risk for the dispatcher to watch when #596 merges:** #596's CLAUDE.md hunk was written
against a base with no `engine-invariants` clause and anchors on the SAME context line, so its two
clauses can land ahead of `engine-invariants` and break the ruled order before this lane ever edits
the sentence. Worth checking the merged text, not the diff.

1. Enumeration sentence: insert immediately BEFORE the clause beginning
   `` `specs/development-workflow.md` is the order of operations ``, which puts it after sub 2's
   `region-and-voyage` clause. Draft: "`specs/site-architecture.md` is how the site is authored,
   bundled, discovered and shipped: the page model and the rosters a page joins, what the build does
   to authored markup and what that costs a test, the forms that fail silently when written any
   other way, and the deploy model;"
2. Required-reading sentence: insert immediately BEFORE
   `` `specs/development-workflow.md` before starting a sub or an epic ``, which puts it after sub
   2's `region-and-voyage` trigger. Draft: "`specs/site-architecture.md` before adding or
   restructuring a page, a stylesheet, a bundle or an inlined script,"

Confined to the inserted clauses; no neighbouring paragraph is rewrapped. #589 amends the
settle-doctrine clause of the SAME required-reading sentence, which sits AFTER my insertion point,
and merges after this lane.

**Two ruled constraints on this edit, from #586's 2026-09-14 comment, which #588's body never
mentions (recon):**

- **Ruling C: `CLAUDE.md` ONLY.** The other roster lists that enumerate the specs
  (`specs/rulebook.md` in two places, `specs/development-workflow.md` step 3, and
  `.claude/agents/vellum-implementer.md`'s reading list) are SUB 5's. A lane that ran Gate 4, found
  those four incomplete rosters and joined them would be working against a ruling. This lane leaves
  them alone and says so in the PR body. It also retires what would otherwise have been this lane's
  third open decision.
- **Ruling B2: leave the asymmetry alone.** The enumeration half names the flake ledger and the
  required-reading half does not; that is deliberate. Do not tidy it while editing the sentence.

## Verification, every citation before it lands

Already run in this worktree (recorded here so the report and the PR body cite the command, not the
memory):

- `src/pages/**/index.astro` + `src/layouts/BaseLayout.astro` + `NAV_ITEMS` in `src/layouts/nav.ts`.
- `PAGE_CSS` / `SHARED_CSS` / `ROOT_CSS` / `TOKENS` in `test/site/shell-css.test.ts` (read).
- `SITE_PALETTE` in `src/atlas/palette.ts` (read; none of the five deep-side tokens appears in it).
- The five tokens declared in `src/layouts/BaseLayout.astro` (read at their declarations).
- `test/atlas/document.test.ts` pins `--the-deep` and `--sheet-shadow` equal to the layout's.
- The static spawn literal in `src/site/explorer/worker-client.ts`, pinned in
  `test/site/app-bundles.test.ts`; `BUNDLE_ENTRIES` pinned there too.
- `test/site/astro-scaffold.test.ts`: the quote-agnostic `pageScript` patterns, the inline-limit
  comment, and "the deploy artifact serves no raw app source".
- `scripts/generate-discovery.ts`: `NAV_ITEMS`-derived `DISCOVERY_ROUTES`, `ROUTE_ENTRIES`,
  `ATLAS_ROUTE`, `PROSPECT_ROUTE`, `sitemapXml`, `robotsTxt`, `llmsTxt`.
- `astro.config.ts`: `site`, `trailingSlash`, the dev-only public-dir middleware.
- `roomSections` in `src/layouts/room-sections.ts`.
- `GALLERY_PAGE_CSS` in `src/cli/gallery.ts`; `ATLAS_SHEET_CSS` and `PAGE_CHROME_CSS` in
  `src/atlas/document.ts`.
- `prospectResultFor` in `src/site/explorer/prospect-job.ts`.
- `stripTypeScriptTypes` in `scripts/e2e/harness.mjs`.
- `.github/workflows/ci.yml` job names `check & test` and `build & e2e`;
  `.github/workflows/deploy.yml` builds and publishes.
- The `astro:generate` string pinned in several suites.

Still to run at write time: the `is:inline`/veil citations re-read at their final wording, a
token-by-token re-check of section 6's list, and the sweeps below.

Sweeps before the push: no em-dash in the diff; no absolute home path, board or field id, token
scope, registrar or hosting-account detail, no personal name other than Alex; no bare counts.

Then `npm run check`, `npm test`, `npm run astro:generate` to restore the generated assets the suite
deletes.

## Tests

**No new tests, so no `vellum-guard-prover`.** Nothing in this repo sweeps markdown, so a wrong
citation here is silent: the verification pass above IS the check, it is one-time, and the PR body
says so in those words rather than claiming coverage. A test that swept spec citations was built and
withdrawn once already (#384, PR #385), and this lane does not reopen it.

## Risks and dependencies

- `CLAUDE.md` conflict with #593 and #596: handled by `git merge origin/main` before the push and
  taking the fourth slot, which is the epic's stated rule.
- #589 edits the same required-reading sentence; merge order is ruled, this lane first.
- Overlap with `specs/rulebook.md` (committed list, heavy lazy plates) and `specs/ui-design.md`
  (palette join, the cascade trap): every one of those is POINTED at, not restated.
- The other spec rosters that omit the four new files are Sub 5's by ruling C, not a handoff
  question. **Four more tracked files name the specs and are owned by NOBODY in the epic's split
  (skeptic finding 16)**: `specs/ui-design.md`, `.claude/agents/vellum-plan-skeptic.md`,
  `.claude/agents/vellum-spec-recon.md` and the footguns `SKILL.md`. Reported as unowned rather than
  folded into ruling C.

## Sibling defects: FILE, do not fold (Gate 5)

Recon found two, both in files this sub forbids touching:

- `scripts/build-app-bundles.ts`'s head comment says the worker is spawned by "both pages"; six
  surfaces import `initWorker`.
- `test/site/app-bundles.test.ts` names its test "all four app pages load their bundled app twin via
  is:inline" and checks four, while nine pages under `src/pages/` carry that tag.

Reported to the dispatcher for filing. This lane does not fold them in.

## Open decisions for Alex (the menu is at `588-menu.md`)

1. What counts as adding a page, and whether this file carries the app-surface model at all. Recon
   reframes it: the rulebook's line retires the NAV TAX, not the cost of an app surface, so the two
   statements may not conflict at all.
2. The committed-content question, now a confirmation only: recon verified that the rulebook already
   carries the "family resemblance, not a test" sentence, so the menu's second branch needs no edit
   from anyone.
3. Which wording section 6 is written against, since Sub 5's pointer line has to match it.
4. (from the skeptic) Whether section 7 carries the CI shape, the job-name trap and the e2e
   type-stripping oracle, which the issue's source rows assign here but its section list does not
   name.

**Sections 1 and 6 are NOT pre-written (skeptic finding 11).** The outline above is the material and
its corrections; the ruling decides the shape, and the prose is written afterwards. A decision put
beside its finished answer is a ratification, not a ruling.
