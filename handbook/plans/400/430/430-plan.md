# Issue #430 plan: the Glossary earns the Ribbon's words

Sub 4 of Epic #426. One pull request.

**Planned at:** `origin/main` 04951e14d49ea526131e93bfa6c9202c75533152, with Issue #430 at 3 comments: the 2026-09-03 re-baseline (issuecomment-5533794323), Alex's 2026-09-03 ruling (issuecomment-5533954595) and Alex's 2026-11-03 rulings on this plan's menu (issuecomment-6611049035).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/430#issuecomment-6611049035 (Alex, 2026-11-03), his answers in the options' own words:
1. "All five, own group (Recommended)": Itinerary, Wayfarers' chain, Height of the way, Turn about and An., in a section of their own.
2. The section's name: "On the Ribbon" (not the recommended "The road unrolled").
3. "Its own line, after The founding words (Recommended)": an `h2`.
4. "Leave all three (Recommended)": the Glossary's opening sentence, its meta description and its llms.txt blurb are unchanged, and nothing in `test/site/astro-scaffold.test.ts` changes.

Alex overruled none of the planner's calls C1 to C13.

**Open decisions:** none.

---

## Recon

`vellum-spec-recon` ran 2026-11-03 at 04951e14. Its ledger: 12 STALE claims that would mislead a builder (one of them, the floor's list, current in substance and stale only in where it lives), 3 STALE cosmetic, 16 CURRENT, 3 UNVERIFIABLE. The STALE claims that changed this plan:

- **`test/site/glossary-sections.test.ts` is gone.** Issue #779 (PRs #835, #867, #892) moved its rules into the browser check IX12 (`ix12GlossaryShape` and `shapeFaults` in `e2e/suites/document-rooms/sheets.ts`, stepped in `e2e/suites/document-rooms.ts`). The following all live there now:
  - the cap;
  - the floor, and the `ADDED` list of the seven Issue #353 sections it binds;
  - the 28-name `OWED` list ("every term Vellum prints documented");
  - the no-repeated-headword clause;
  - the alphabetical clause.

  So the guard this issue strengthens is IX12.
- **`test/site/broadside.test.ts` is gone.** Its pins are now BR7 and BR10 (`e2e/suites/broadside.ts`, `e2e/suites/broadside/room.ts`). BR10 pins "At the drafting table" as exactly its eight terms, so no word may join that section.
- **The counts moved.** The page has 149 terms in 17 `h2` sections and 9 `h3` culture groups.
  - Full at the cap of 8: The sheet and its frame, At the drafting table, Coming in from the sea, The court & the realm, Geography & place.
  - One slot each: On the chart itself (7), The waterfront (7), The road & the market (7), What a place smells of (7), What a place ships (7).
- **"The founding words" landed 2026-11-01 with 4 terms** (Issue #393 rulings 9 to 11, PR #1163). That is under the floor of 5, and the Glossary's intro and meta description were not changed. Rulings 10 and 11 fix it at four entries, so nothing here joins it.
- **"An." prints on the Ribbon** (the folio's survey line and the slip's where line, `src/site/ribbon/seats.ts:67` and `:118`, since PR #500) and on the Prospect. The re-baseline did not list it.
- **"Itinerary" prints on the Ribbon** as the slip's verb and title (`src/pages/ribbon/index.astro:50`). The re-baseline listed only "itinerary strip chart".
- **#511 and #431 landed and printed no new genre word.** Their copy is the stages line (no word but "leagues"), realm names and plain-English captions; #431's own comments say "Issue #430 gains no new term from this sub". The pigment names print nowhere; they are identifiers only.
- **#411 is open with no code.** "Waggoner" appears nowhere in `src`, `test`, `scripts`, `e2e` or `handbook`. Its "glossed exactly once" clause is IX12's repeated-headword clause, so there is nothing to do here.

A recon finding I reject: none. One the recon left UNVERIFIABLE I measured (Tests, M6): the phrase "itinerary strip chart" reaches no reader on `/ribbon/`. The plate is an `<img>` whose accessible name is its alt, so the SVG's `aria-label` never reaches the accessibility tree. The phrase prints only in the Ribbon's meta description (`src/pages/ribbon/index.astro:20`) and its llms.txt blurb (`scripts/generate-discovery.ts:90`).

## What survives, counted

I read every Ribbon string in `src/itinerary/prose.ts`, `src/itinerary/finished.ts`, `src/itinerary/dress/*.ts`, `src/site/ribbon/seats.ts`, `src/site/ribbon/row-text.ts`, `src/site/ribbon/fallback-note.ts` and `src/pages/ribbon/index.astro`. Each candidate was checked against the Glossary with `grep -n -i`. These are the ones that are neither plain English nor already glossed:

| word | where it prints | kind |
|---|---|---|
| Itinerary | the slip's verb and title, "Fold the itinerary away"; "itinerary strip chart" in the meta description and llms.txt only | the genre's own word |
| wayfarers' chain | the plate's subtitle (`ribbonTitle`, both dresses), the folio's survey line, the slip's where line and intro | Vellum's coinage for the road's measure |
| the height of the way | one of the three captions for a road's high point (`SUMMITS`, `src/itinerary/prose.ts:26`), on the plate and in the itinerary row; with "a hard pull to the height" | period phrasing |
| Turn about | the room's one button that swaps the journey's ends (`src/pages/ribbon/index.astro:45`) | a control label, period phrase |
| An. | the folio and the slip ("An. 812"), and on the Prospect's plates and notes | the sheet's dating mark |

Left out, with the reason:
- league: already a headword, and the same unit as the scale bar (`CELLS_PER_LEAGUE` from `src/render/layers/scalebar.ts`);
- Chart №: the headword Chart number covers it;
- ford, foot-bridge, hamlet, "a fair town", scroll, road atlas, wayfarer, and the realm and wood captions: plain English, under the #353 bar that Harbor did not pass;
- the stages line: it prints no word to gloss;
- league dots and the strip compass: dropped by the 2026-09-03 ruling.

That makes three road-atlas words and five with the button and the dating mark. Alex counted all five (Rulings, 1), so by his 2026-09-03 rule they take a section of their own.

## Specs

The implementer reads these, at these sections, on top of what `CLAUDE.md`'s table already owes:
- `handbook/specs/ui-design.md`, "The voice":
  - the period register;
  - "Do not invent a fact for flavour";
  - "A glossed section runs to a small band of terms" (the floor binds only the sections that introduced it, and IX12 holds it);
  - "A homograph takes the period form";
  - "A count in prose is derived from the thing it counts".
- `handbook/specs/check-placement.md`, "The unit suite" (no unit test reads the page's text) and "The browser lanes and a plate read".
- `handbook/specs/settle-doctrine.md`, "When a check is pulled out of the run", the bullets "What a step holds" and "Who finds a slow step".
- `handbook/specs/site-architecture.md`, "How a page is authored": a page under `src/pages/` keeps its markup near-verbatim, and Prettier does not reach `.astro`.
- `handbook/specs/engine-invariants.md`, "Engine outputs a consuming surface must respect": a definition that quotes the Ribbon's captions and dates quotes what the engine prints (Calls C3).
- `handbook/specs/conventions.md`, "How a spec, and the rest of the house's prose, is written" and "How code is cited", for the PR body. This plan adds no code comment.
- `handbook/specs/development-workflow.md`, steps 8 to 15.

## The design

**The Glossary gains one `h2` section, "On the Ribbon", with five terms in alphabetical order: An., Height of the way, Itinerary, Turn about, Wayfarers' chain** (Rulings 1 to 3).
- It goes directly after "The founding words" and before "Soundings & sea marks" in `src/pages/glossary/index.astro`.
- The index slip gains the section's row by itself, since `roomSections` reads the page's own source at build. The count line then reads "154 terms in 18 sections".

**IX12 learns the five words and binds the section to the floor.**
- Each headword joins `OWED`, so a page that drops one reds.
- The heading joins `ADDED`, so the section reds below five terms or above eight.
- `OWED`'s parse becomes `replaceAll`, since "Height of the way" carries three underscores.
- The check's label drops its written count ("the seven added sections").

**Nothing else moves** (Rulings 4): the Glossary's opening sentence, its meta description, the pinned `test/site/astro-scaffold.test.ts:101`, the llms.txt blurb, League's and Chart number's definitions, and every Ribbon file.

Rejected, so none is rediscovered mid-build:
- *Four words in their own section, or two scattered into existing sections*: Rulings 1 takes all five.
- *The names "The road unrolled" and "The road book"*: Rulings 2.
- *An `h3` sub-group under "The road & the market"*: Rulings 3.
- *Naming the road scrolls in the opening sentence, the meta description or the llms.txt blurb*: Rulings 4.
- *Two headwords, "Itinerary" and "Itinerary strip chart"*: the house's period form runs one word's senses together. The compound reaches no reader on the page (M6), so the visible word carries it.
- *"Height" as the headword*: a reader looks up the printed phrase. Its sister caption "a hard pull to the height" is quoted inside the definition.
- *Any word in "At the drafting table"*: the section is full at 8 and pinned exactly by BR10.
- *Any word in "The founding words"*: Issue #393 ruling 11 fixes it at four entries.
- *Splitting the 762-line page*: `roomSections` builds the index from the page's own source file (`import.meta.url`, Issue #462 ruling 1), so the page stays one file. `handbook/errata/prose.md` (PR #354 row) already records its length against the 400-line guideline, and Issue #654's max-lines roster does not reach `.astro`.
- *A unit test of the page's terms*: `handbook/specs/check-placement.md` forbids a unit test that searches a page's text. IX12 reads the served page.

## Files

1. **`handbook/plans/400/430/430-plan.md`** (new): this plan, copied unchanged from the scratchpad.

2. **`e2e/suites/document-rooms/sheets.ts`** (edited; 246 lines before, 247 after; no function changes shape):
   - `ADDED` (lines 173 to 181): append `"On the Ribbon",` after `"What a place ships",`.
   - `OWED` (lines 183 to 186) becomes, exactly:
     ```ts
     const OWED =
       "Quay Weir Breakwater Chandler Osier Drover Reeve Reach Holding_ground Warp Beck Fen Waterman Wharf Moorings League Plate Colophon Docket Neat_line Contour_line Attar Kvass Copal Copra Cochineal Iron_bloom Kurgan An. Height_of_the_way Itinerary Turn_about Wayfarers'_chain"
         .split(" ")
         .map((t) => t.replaceAll("_", " "));
     ```
   - IX12's label (line 223): replace `the seven added sections 5 to 8 each` with `the sections Issues #353 and #430 added 5 to 8 each`. The rest of the label is unchanged.
   - Run `npm run format`, then `npm run format:check`.

3. **`src/pages/glossary/index.astro`** (edited; 762 lines before, about 795 after):
   - Insert the block below between the end of Steer's `<p class="def">` (line 181, ending `both stop steering it.</p>`) and `<h2 id="soundings">` (line 183), with one blank line before the block and one after it. Nothing else in the page moves.
   - Use straight quotes and apostrophes, as the page writes them, and no em-dash.
   - The ids were measured free on the built page, re-checked after the rulings. No `id` on `dist/glossary/index.html` equals `ribbon`, `an`, `height-of-the-way`, `itinerary`, `turn-about` or `wayfarers-chain`, and no id on that page is duplicated today.
   ```html
   <h2 id="ribbon">On the Ribbon</h2>
   <p class="intro">The words of the Wayfarer's Ribbon, where any road is unrolled
   league by league.</p>

   <p class="term" id="an">An.</p>
   <p class="def">Short for <em>anno</em>, Latin for "in the year": An. 812 is the
   year 812, counted as each world counts its own ages. The Ribbon dates its road
   by the year of the survey, and the Prospect dates a town's founding the same
   way.</p>

   <p class="term" id="height-of-the-way">Height of the way</p>
   <p class="def">The highest ground a road crosses. Where a road climbs well above
   both of its ends, the Ribbon marks the top as "the height of the way", "a hard
   pull to the height" or "here the road climbs".</p>

   <p class="term" id="itinerary">Itinerary</p>
   <p class="def">A traveler's guide to a road, set down place by place with the
   distances between, from the Latin <em>itinerarium</em>, a Roman register of the
   stations along a road and the miles between them. The Ribbon's slip is one. An itinerary strip chart
   draws the road itself, cut into upright strips that each carry a compass to keep
   north as the road turns, as John Ogilby drew the roads of England and Wales in
   his <em>Britannia</em> of 1675.</p>

   <p class="term" id="turn-about">Turn about</p>
   <p class="def">To turn and go back the way you came. On the Ribbon it swaps
   where you set out and where you are bound, and the surveyor unrolls the way
   back.</p>

   <p class="term" id="wayfarers-chain">Wayfarers' chain</p>
   <p class="def">The measure every road on the Ribbon is taken by, counted in
   leagues from where you set out; the name is Vellum's own. A real surveyor's
   chain ran sixty-six feet in a hundred links, and Ogilby's men measured the roads
   of <em>Britannia</em> with a wheel, its turns told off on a dial.</p>
   ```

No other file is created, edited or deleted.

## Tests, in the order they are written

No unit test. The rule is what the served page shows, which makes it a browser check's (`handbook/specs/check-placement.md`), and IX12 already reads it.

**T1, IX12 strengthened** (`e2e/suites/document-rooms/sheets.ts`, check id `IX12`, step `IX12` in `e2e/suites/document-rooms.ts`).
- *Assertion*: `shapeFaults(glossary.sections)` is empty.
  - Its new clauses: each of An., Height of the way, Itinerary, Turn about and Wayfarers' chain is a term on the page, and "On the Ribbon" holds 5 to 8 terms.
  - Its existing clauses (alphabetical order, a definition per term, no repeated headword, the cap) now also cover the new section.
- *Red first*: commit 1 carries the strengthened check with the page unchanged.
  - No stub is needed: the page simply lacks the section, so IX12 reds on its assertion, never on a missing module.
  - Expected FAIL detail, exactly six faults: `"On the Ribbon" 0 terms, not 5 to 8; "An." undocumented; "Height of the way" undocumented; "Itinerary" undocumented; "Turn about" undocumented; "Wayfarers' chain" undocumented` (reading M0).
- *Green*: commit 2 adds the section, and IX12 passes (reading M1).
- *Mutations that red it once green*, each a change to the page alone:
  - (c), the floor clause alone: move Height of the way's term and definition out of the new section into "The road & the market", between Fallow and Market cross. All five words stay on the page and the section falls to four, so IX12 reds on exactly `"On the Ribbon" 4 terms, not 5 to 8` (M2).
  - (d), the owed clause alone: rename the term "Turn about" to "Turn round", keeping five terms. IX12 reds on exactly `"Turn about" undocumented` (M3).
  - (a), both together: delete Turn about's term and definition. IX12 reds on `"On the Ribbon" 4 terms, not 5 to 8; "Turn about" undocumented` (M4).
  - (b), coverage only: move Itinerary's term and definition above Height of the way's. IX12 reds on `"On the Ribbon" out of order` (M5).
- *Who proves it*: `vellum-guard-prover` owes T1's new clauses at step 11, with mutations (c), (d) and (a) and selection `document-rooms`.
  - (c) proves the new `ADDED` entry (C8).
  - (d) proves the new `OWED` entries.
  - Today's IX12 passes (c), (d) and (a) (the control readings), so only the new entries see them.
  - Mutation (b) reds today's check as well, so it proves no new clause. It shows only that the new section is read as a section of its own, and the prover may run it as coverage.

**How the readings were taken.** They come off the plan's own build in this tree: `npm run build` at 04951e14, which is `origin/main`. Nothing under `src/pages/glossary/`, `e2e/suites/document-rooms`, `src/layouts/` or the Ribbon's files had moved at the rulings (`git diff --stat 04951e14 origin/main` printed nothing).
- The probe is `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-aa93c488fd982061d/out/430-dry-run/430-ix12.ts`.
  - The ruled design's readings: `node out/430-dry-run/430-ix12.ts dist --ruled > out/430-dry-run/430-ix12.log`, taken after the rulings, log `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-aa93c488fd982061d/out/430-dry-run/430-ix12.log`.
  - The menu's readings for every option, taken before the rulings: `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-aa93c488fd982061d/out/430-dry-run/430-ix12-menu.log`.
- The probe drives the built site through `start` in `e2e/harness.ts`, the suite's own `docRoomsKit` and `readSheets`.
- It stages each arm by mounting the arm's markup in the served sheet (`insertAdjacentHTML("beforebegin")` on `#soundings`, and on `#market-cross` for mutation (c)) before `readSheets` takes its read.
- The plan's IX12 is today's `shapeFaults` with the planned `OWED`, `ADDED` and `replaceAll`, copied into the probe, since the check's edit is itself the change.
- Today's `ix12GlossaryShape`, `ix11Intro` and `ix14Anchors` ran beside it as controls.

**The readings:**
- **M0, main with nothing staged**: the planned IX12 FAILS with the six faults above. Today's IX12 PASSES, which is the control: the strengthening is what reds.
- **M1, the section staged**: the planned IX12 PASSES (`[]`), as do today's IX12, IX11 (the new intro is in the house intro voice) and IX14 (the five ids are plain and unique). The instance nearest to failing is the new section itself, read at `On the Ribbon [An., Height of the way, Itinerary, Turn about, Wayfarers' chain] defs 5`, exactly on the floor of 5.
- **M2, mutation (c)**: the planned IX12 FAILS on `"On the Ribbon" 4 terms, not 5 to 8` alone. "The road & the market" reads 8 terms, at its cap and not past it. Today's IX12 PASSES.
- **M3, mutation (d)**: the planned IX12 FAILS on `"Turn about" undocumented` alone, with the section at 5. Today's IX12 PASSES.
- **M4, mutation (a)**: the planned IX12 FAILS, `"On the Ribbon" 4 terms, not 5 to 8; "Turn about" undocumented`. Today's IX12 PASSES.
- **M5, mutation (b)**: the planned IX12 FAILS, `"On the Ribbon" out of order`. Today's IX12 FAILS the same way.
- **M6, the Ribbon** (`/ribbon/#seed=42`, plate drawn): `Accessibility.getFullAXTree` gives 366 nodes, none of them naming "itinerary strip chart". The one image node is named `The road from Laukuwelua to Homaitani, chart 42`. The meta description carries the phrase, and the page source matches it only there.

**What the step holds, and its cost** (`handbook/specs/settle-doctrine.md`).
- Step IX12 holds seven claims that no other check holds: the cap, the floor on the added sections, the chart split, the owed words, one headword each, alphabetical order, and a definition per term.
- It reads them on one page, the Glossary, so it is not thin.
- This plan makes the step hold more but not run longer. The step takes no navigation and no wait of its own; it evaluates the `Sheets` object that step IX9 already read.
- So **Evidence** reads the step's seconds from the pull request's own CI run, once.

## Order of commits

1. `#430 The plan, and IX12 red on the Ribbon's five words`: `handbook/plans/400/430/430-plan.md` and the `e2e/suites/document-rooms/sheets.ts` edit. After `npm run build`, `VELLUM_E2E_SUITES=document-rooms npm run test:e2e` FAILS only IX12, with the six faults of M0, and every other IX check passes. Push at this commit.
2. `#430 The Glossary's section for the Ribbon's words, On the Ribbon`: the `src/pages/glossary/index.astro` edit. After `npm run build`, `VELLUM_E2E_SUITES=document-rooms npm run test:e2e` passes, IX12 included.

No commit message carries a closing keyword; the PR body closes Issue #430.

## Rosters and doctrine

- **Rosters**: the new section joins `ADDED` and its five words join `OWED` in IX12 (Files). The index slip, the count line and the find box derive from the page, so they join nothing by hand. No nav, sitemap, discovery or stylesheet roster changes.
- **Doctrine**: no spec, gate or agent line is contradicted.
  - `handbook/specs/ui-design.md`, "The voice", stays true as written: the floor binds only the sections that introduced it, and IX12 holds it.
  - `handbook/errata/prose.md`'s PR #354 row (the page's length) stays open as written; this PR adds no row.
- The `MEASURED_SECONDS` entry for document-rooms is not re-measured, since IX12 adds no browser time.

## Evidence

- `npm run check`, `npm run lint` and `npm run format:check`, then `npm test`, and `npm run astro:generate` after it.
- `npm run build`, then these suites, one at a time and each left to finish:
  - `VELLUM_E2E_SUITES=document-rooms npm run test:e2e`: IX12 red at commit 1, and every IX check green at commit 2.
  - `VELLUM_E2E_SUITES=broadside npm run test:e2e`: BR7 and BR10 read the Glossary's drafting-table section, which is unchanged.
  - `VELLUM_E2E_SUITES=corners npm run test:e2e`: FL4, FL6 and CO7 scroll and read the Glossary, which is now longer.

  CI runs the rest, including runninghead and cluster, which also open the Glossary. Never the full local lanes.
- The built page: `grep -c 'class="term"' dist/glossary/index.html` prints 154, and the folio's count line reads `154 terms in 18 sections`.
- IX12's seconds from the pull request's CI run, in the lane that runs document-rooms (its `tier:` line names it): from IX11's result line to IX12's, with timestamps from `gh api --allow-escape-sequences repos/ahl-gram/Vellum/actions/jobs/<job>/logs`, quoted in the PR body.
- `vellum-guard-prover` on T1 at step 11, after commit 2 is pushed: mutations (c), (d) and (a), with (b) as coverage.
- `vellum-plate-reader` is not owed (Calls C10).

## Calls made

Each was taken here on the rule named, and Alex overruled none of them (Rulings). The implementer copies them into its step 12 comment, pointing at the rulings comment for Alex's answers.

- **C1** One headword, "Itinerary", carries the strip-chart sense; there is no separate "Itinerary strip chart". Rule: `handbook/specs/ui-design.md`, a homograph takes the period form with its senses run together. The compound reaches no reader on the page (M6); only the meta description and llms.txt print it.
- **C2** The headword is "Height of the way", the printed phrase, with "a hard pull to the height" and "here the road climbs" quoted in its definition. Rule: one headword per sense, and the reader looks up the phrase the plate prints.
- **C3** Every historical claim in the five definitions is sourced, and Vellum's own coinages are named as Vellum's. Wayfarers' chain's definition says "the name is Vellum's own", and Height of the way is described rather than called a period term. Rule: "Do not invent a fact for flavour" (`handbook/specs/ui-design.md`).
  - Ogilby's *Britannia*, 1675: 100 strip road maps of England and Wales, with compass roses marking each change of direction, measured with a wheel geared to a dial. Sources: Wikipedia, "Britannia (atlas)"; the Bodleian maps blog, "Measuring distances, a wheel or a chain?", 2020-11-12; Leeds Libraries, "John Ogilby: Road Maps & Measuring Wheels", 2016-08-12.
  - Gunter's chain: 66 feet in 100 links (Wikipedia, "Gunter's chain").
  - *itinerarium*: a Roman register of the stations and distances along roads; the Antonine Itinerary gives its distances in Roman miles (Wikipedia, "Antonine Itinerary").
  - *anno*: Latin "in the year".
  - Each claim about the Ribbon was read in the code:
    - The summit is the road's highest point, and is marked only when it climbs at least 0.05 of relative height above both ends (`summitEvent`, `src/itinerary/events.ts:182`).
    - The year is `world.title.year`, the survey's (`src/itinerary/input.ts:119`).
    - Turn about draws `last.to` to `last.from` (`src/site/ribbon/app.ts:145`).
    - Each strip carries a compass whose needle turns (`stripNodes`, `src/itinerary/dress/strip.ts`).
    - The rows count leagues from the start (`src/site/explorer/ribbon-job.ts:61`).
- **C4** The section stands after "The founding words" and before "Soundings & sea marks". Rule: Issue #393 set the Writing Room's words directly after the Explorer's, so the rooms' own words stand together. Rulings 3 confirmed the place.
- **C5** The section's id is `ribbon`, and the term ids are the headwords' slugs: `an`, `height-of-the-way`, `itinerary`, `turn-about`, `wayfarers-chain`. Rule: the page's short-id form for sections and slug form for terms. IX14 requires them plain and unique. They were measured free on the built page, and `ribbon` was re-checked free after Rulings 2 named the section "On the Ribbon".
- **C6** League's and Chart number's definitions are unchanged. Rule: the Ribbon prints the same league (`CELLS_PER_LEAGUE` from `src/render/layers/scalebar.ts`) and the same chart number in the same senses. A definition is not a roster of surfaces, and the issue asks only for the words the Glossary does not carry.
- **C7** `OWED`'s parse becomes `replaceAll("_", " ")`. Rule: mechanical. Each existing entry holds one underscore and reads the same, and "Height of the way" holds three.
- **C8** The new heading joins `ADDED`. Rule: the 2026-09-03 ruling makes five the reason the section exists, and `handbook/specs/ui-design.md` binds the floor to the sections that introduced it.
- **C9** IX12's label drops "the seven". Rule: `handbook/specs/ui-design.md`, a count in prose is derived, never written twice.
- **C10** `vellum-plate-reader` is not owed. Rule: the deliverable is copy in an existing page's existing dress, with no new class, style or layout. IX9 to IX14, FL4, FL6, CO7 and BR7 read the sheet, its index and its frame.
- **C11** The page is not split. Rule: `roomSections` reads the page's own source (Issue #462 ruling 1), and the length is already an errata row (`handbook/errata/prose.md`, PR #354).
- **C12** Nothing is done for #411. Rule: it is open with no code, and IX12's repeated-headword clause enforces "glossed exactly once" whenever it lands.
- **C13** American spelling ("traveler"), as the page writes it ("A traveler with business asks for the reeve").

A sibling gap, not this issue's, for the dispatcher to file or leave: the forest-name endings "-les" (Zoryan, `forestTemplates` "The %les") and "-mark" (Norden, "The %mark") are unglossed. They print on the Explorer's chart and now in the Ribbon's wood captions. They belong under their cultures in "Words on your own map", where Norden has 3 terms and Zoryan stands at its ratified ceiling of 10, so Zoryan has no room.

## Open decisions

none

## Stop conditions

Hand back, rather than adapt, when:
- `git diff --stat 04951e14 origin/main -- src/pages/glossary/index.astro e2e/suites/document-rooms/sheets.ts e2e/suites/document-rooms.ts` prints anything.
- Steer's definition does not end at line 181 with `both stop steering it.</p>`, or `<h2 id="soundings">` is not line 183.
- At commit 1, IX12 passes, reds with any fault other than M0's six, or any other IX check reds.
- At commit 2, any of these holds:
  - IX12 is not green;
  - IX11, IX14, IX6, IX4, BR7, BR10, FL4, FL6 or CO7 reds;
  - the count line is not `154 terms in 18 sections`.
- A headword the plan adds already stands on the page, for instance because #411 or another issue lands one first. IX12 reports it as `repeats a headword`.
- Issue #430 carries a comment newer than the 3 this plan was read at, other than a `Plan archive, not a ruling:` copy.
- The settle doctrine's count, read from the pull request's CI run, finds step IX12 too slow. Reworking it is a design call.
- The prover finds that mutation (c), (d) or (a) leaves IX12 green, or that (c) or (d) reds it on any fault but the one M2 or M3 names.
