# Issue #433, pull request 2, revision 2: a redraw is checked to close the road the old world offered, and the road's order and the poster's share one press

**Revision 2 of `433-pr2-plan.md`, after `433-pr2-r1-plan.md`, and what it changes.** PR #1240's head (9fb311c4) is green on CI and the cold skeptic's one round read "Blocking: no", but raised two SHOULD-FIX findings about the design, which come back here. **T1 (tests):** nothing holds `dropRoad();` in `draw()` (`src/site/print-room/app.ts`): with that one call deleted, `hunt,print-room` passes whole (measured below, ALL PASS 107/107). This revision adds **PR51**, a read of the road option before and after PR24's own Draw click, in the same task, and the proof row **R13**. **D1 (duplication):** `pullRoad`, `pressRoadPng` and `orderRoad` in `src/site/print-room/order-counter.ts` copy their poster twins (38 of the road path's 59 code lines appear verbatim in the poster's). This revision gives both orders one press. It deletes four functions (`pullSvg`, `pressPng`, `pullRoad`, `pressRoadPng`), rewrites two (`orderPoster`, `orderRoad`), and adds an interface and five functions (`Impression`, `posterImpression`, `roadImpression`, `pullImpression`, `pressImpression`, `runOrder`); `orderSettled` moves unchanged. It also deletes the split-arguments lint's one excuse for this file, and adds the proof rows **R14**, **R15** and **R16**. It also takes the free NIT: `handbook/specs/ui-design.md`'s 16px bullet cites the comment holding Alex's words. Against `433-pr2-plan.md` this revision supersedes: **Files** items 14 (for `pullSvg`, `pressPng` and `orderPoster` only; `downloadSvg`, `selectedFormat`, `orderShape` and `orderSettled` stand), 15, 16 and 17 of `order-counter.ts`; and the find strings of proof rows **R3** and **R4**, whose lines this revision rewrites, re-aimed as R15 and R16. Against `433-pr2-r1-plan.md` it supersedes **Not edited**'s `src/site/print-room/order-counter.ts`, and the line "`433-pr2-plan.md`'s rows R1 to R10 ... stand: none of their find strings is in a line this revision edits", which is now true of R1, R2 and R5 to R10 only. Everything else in both plans stands as built in commits 04b0cd6d to 9fb311c4 and is not rebuilt.

**Planned at:** `origin/main` ae27155c081c12338ea54522336ccb61a1d9a21b and the branch `feat/433-print-room-road-order` at 9fb311c49b4fefb2d5cb112ae7209322ab7800cc (`git ls-remote origin refs/heads/main refs/heads/feat/433-print-room-road-order` printed both, re-read when this plan was finished). The issue was read at 18 comments (`gh api repos/ahl-gram/Vellum/issues/433/comments --paginate | jq -s 'add | length'` printed 18). The newest is the dispatcher's archive of revision 1 (6623627147, "Plan archive, not a ruling: 433-pr2-r1-plan.md"). Every reading below was taken on builds of 9fb311c4 made in the planner's tree (`npm run build`, exit 0, `out/433-dry-run/433-r2-build-head.log`).

**Rulings:** Alex's rulings as `433-pr2-plan.md` and `433-pr2-r1-plan.md` record them (issuecomment-6282029630, issuecomment-6282038151, issuecomment-6620144566, issuecomment-6620828024, issuecomment-6623587000), his delegation (issuecomment-6619124326, extended in issuecomment-6619143522) and his merge clearance (issuecomment-6619157358). Nothing in this revision is blocking: it changes no appearance and amends no ruling, and each call is undone at no cost. So every call below is taken under the delegation, for him to overrule.

**Open decisions:** none.

## Specs

Read these before building, on top of what `CLAUDE.md`'s table owes for the work and what the two plans' **Specs** already list:

- `handbook/specs/development-workflow.md`: step 8 (this revision is archived beside the plans it revises, as `handbook/plans/400/433/433-pr2-r2-plan.md`, in the first commit made for it), step 10 (the combined state with main), step 15 (a guard added after the prover's round, and the rows proving a refactor, are proven by the implementing session and named so in the PR body).
- `handbook/specs/check-placement.md`: The browser lanes and a plate read (what the page shows is read in a browser; PR51 is a browser check). The unit suite (why no unit test holds `draw()`'s wiring).
- `handbook/specs/settle-doctrine.md`: When a check is pulled out of the run ("What a step holds", "What a step costs", "Who finds a slow step"), for the unit PR51 joins.
- `handbook/specs/conventions.md`: the comment rules (one wiring line at the click, no other comment added; the moved comments travel with their lines), and how a spec is written (the ui-design edit changes a citation and nothing else).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 (the mutation before the test; the witness in the same check), Gate 2 items 1, 6, 16 and 17 (a `.click()` is wiring, with its reason at the check; read this plan's two readings before typing PR51; count and time it), Gate 5 at the push.

## T1: what holds `dropRoad()` in `draw()`, measured

- **What the call does.** `draw()` (`src/site/print-room/app.ts` line 190) calls `dropRoad()` synchronously, before `clearBoundAtlas()` and before the render is asked for. `dropRoad()` (`order-counter.ts` lines 110 to 116) bumps `roadGen`, revokes and drops the held road, sets the road's state back to pending and repaints the head's road option closed. Nothing else repaints that option until the new world's ribbon answer lands (`askRoad`, called at the end of `keepProof`). So the option closes at the click and stays closed until the new world answers.
- **What deleting it lets a reader do.** The head's select is disabled while the proof is pulled (`refreshOrderControls`), but it opens again when the new proof lands. Between then and the new world's ribbon answer, the road option would still be open with the old world's road held. Choosing it then lays the old world's road on the new world's desk (`layRoad` reads `road`), and a press presses that road under the old seed's name. That window opens and closes with the worker's timing, so no probe stages it deterministically: as a reading, UNVERIFIABLE for that reason. What persists into the window is the option's state at the click, which a read in the click's own task sees deterministically.
- **Today nothing holds it.** The head build with its one `dropRoad();` call removed from `draw()` in the built bundle (`out/433-dry-run/dist-r2-mut`, staged from `dist-r2-head` by deleting the bundle's only `\tdropRoad();\n` before `\tclearBoundAtlas();`, no source edited) passes the suites whole: `VELLUM_SITE_DIR=out/433-dry-run/dist-r2-mut VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` printed "ALL PASS  (107/107)", exit 0 (`out/433-dry-run/433-r2-e2e-printroom-mut.log`), PR24 and PR49 among the passes.
- **Why a read after the answer cannot see it.** A road world redrawn to a road-less world reads the same after the answer on both builds. The capital's road-less answer rejects, and the catch in `askRoad` paints "none" either way. Seed 13 with `type=archipelago&islands=100` (its capital has a road) redrawn to seed 1 under the same carried recipe (its capital has none). After the answer both builds read `{"disabled":true,"text":"The road from the capital: none for this world","value":"poster"}`, and only the read at the click differs: the head `{"disabled":true,...}`, the staged deletion `{"disabled":false,...}` (`alternative` in `out/433-dry-run/433-r2-pr51-fixture.log` and `433-r2-pr51-mutation.log`).
- **Recon's one false claim, rejected.** The recon ledger's row 1d says `clearBoundAtlas` calls `askRoad(posterBasis)`. It does not: `git show origin/feat/433-print-room-road-order:src/site/print-room/bound-atlas.ts | grep -n askRoad` prints nothing, and its lines 129 to 132 are `resetBoundAtlas(); bindBtn.disabled = true;`. The only call that repaints the road option after a redraw is the one at the end of `keepProof`. Every other recon row was CURRENT, and no STALE claim changes this plan: the issue body's two stale lines, the single size and the pasted address, are superseded by its comments.
- **Road worlds under the counted archipelago exist.** The implementer swept seeds 1 to 12 of `type=archipelago&islands=100` and found no road. Seeds 1 to 40 by the ribbon job's own answer (`ribbonResultFor` throwing "no road leaves this place") give a road from the capital on seeds 13, 17, 18, 19, 23, 24 and 40 and none on the other 33, with 40 distinct titles, so the sweep read 40 different worlds (`node out/433-dry-run/433-r2-sweep.ts archipelago100 1 40`, exit 0, `out/433-dry-run/433-r2-sweep-arch100-1-40.log`).

## The design

**T1: PR51 reads the road option before and after PR24's Draw click, in the click's own task.** PR24 (`pr24Redraw` in `e2e/suites/print-room/redraw.ts`) already clicks Draw for seed 2024 on seed 42's page with the atlas bound, and reads Bind, Print and the atlas in the same evaluate. Seed 42's road is drawn at that moment: PR41 waited for it and PR47 turned its page. The same evaluate now also reads the road option before setting the seed and after the click. PR51 asserts the option was open before (the witness that the fixture offers a road) and closed after, with its words the road's own both times. The read is synchronous with `draw()`, so it is deterministic on any machine, and it costs no navigation, wait or render that PR24 does not already make.

**D1: one press for both orders.** Each order builds an `Impression`: the drawing, its two file names, its two status lines' parts, its width, seed and style. One `runOrder` then presses any impression: the counter closed, the rolling line, the stale-order guard, the SVG pull or the PNG rasterize, the jam line, the counter re-opened. The poster's impression is built from the worker's draw (`posterImpression`), and the road's from the plate the room already holds, sized by its root (`roadImpression`). Measured on 9fb311c4 and on the planner's draft of the block below:

- 38 of the road path's 59 code lines appear verbatim in the poster's twins: `pressRoadPng` 14 of 18, `orderRoad` 23 of 35, `pullRoad` 1 of 6 (`node out/433-dry-run/433-r2-twins.ts src/site/print-room/order-counter.ts twins`, `out/433-dry-run/433-r2-twins.log`).
- The file goes from 370 lines to 361. The largest function is `runOrder` at 30 counted lines, and `orderPoster` goes from 46 to 21 (`433-r2-twins.log`; `node out/433-dry-run/433-r2-twins.ts out/433-dry-run/433-r2-order-counter-fmt.ts sizes`, `out/433-dry-run/433-r2-sizes.log`).
- Each branch of the one press is held by a check that already runs. The poster SVG: PR13, PR16. The chart SVG: PR28. A PNG at x1: PR17, and at x2: PR18. The clamped notice: PR19. The road SVG: PR43, PR45. The road PNG at x1: PR44. The road's x2 and clamped paths have no check of their own today. Through the one press, PR18 and PR19 now hold the code they run.
- The order of a press is today's. `runOrder` closes the counter and writes the rolling line, and only then calls `impression()`, so the poster's job is still posted in the click's own task. PR27 rests on that: in the one first-in, first-out worker, an order posted before a redraw settles first.
- The planner's draft of the whole file with the block below:
  - type-checks clean (`node_modules/.bin/tsc --noEmit -p out/433-dry-run/oc-check/tsconfig.json`, exit 0; the control copy with one planted wrong field, `out/433-dry-run/oc-control`, reds `TS2339`);
  - is prettier-clean (`prettier --stdin-filepath src/site/print-room/order-counter.ts`, no change);
  - lints, read as its own path (`eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 --stdin --stdin-filename src/site/print-room/order-counter.ts`), with one report and only one: the stale excuse `downloadSvg(res.svg, filename)`, which this revision deletes (`out/433-dry-run/433-r2-oc-eslint.log`; the head's own file lints clean by the same command, `433-r2-oc-eslint-head.log`).
- A build with the draft in place of the file (built in the planner's tree, the source restored after) passes `VELLUM_SITE_DIR=out/433-dry-run/dist-r2-share VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`: "ALL PASS  (107/107)", exit 0, with PR13, PR16 to PR19, PR27, PR28 and PR43 to PR45 among the passes (`out/433-dry-run/433-r2-e2e-printroom-share.log`).

**The NITs.** The ui-design bullet's citation is free and taken. `roadTitle` repeating `ribbonPlates`' title template is left, as the PR body already records. `src/atlas/compose.ts` exports no function that returns that title alone. It statically imports the renderer (`renderMap` from `src/render/map-renderer.ts`), the region generator and the lore writer. The Print Room's page bundle (48,946 bytes at 9fb311c4, `wc -c dist/print-room/app.bundle.js`) carries none of `compose.ts` today, so sharing the template means a new module or an engine import into the page, neither of which is free. U5 (`test/print-room/road-press.test.ts` line 118) already pins `roadTitle` equal to `ribbonPlates`' first plate title on seed 42.

**Alternatives rejected, so none is rediscovered mid-build:**

- **A road world redrawn to a road-less world, read after the answer** (seed 13 to seed 1 under `type=archipelago&islands=100`): stays a HOLE, since both builds read "none" after the answer (above).
- **The same transition read at the click, in PR49's step:** it bites, but it adds a second bounce, a proof and two road answers to PR49's step (3.41 s on CI today: PRW8 at 06:17:41.724 to PR49 at 06:17:45.132, lane A of run 41783501386) for the read PR24's click already offers. It also ties a witness to a measured seed that a re-roll moves.
- **A test seam** (a window hook exposing the held road): production code written for a test, reading a declaration rather than the option the reader meets.
- **A unit test:** `draw()` is page wiring in `app.ts` (top-level await, DOM lookups at load), and what the page shows is the browser's (`handbook/specs/check-placement.md`).
- **A step of its own with its own redraw:** one more proof render, for what PR24's redraw holds at no cost.
- **A read after the new proof lands and before the answer:** that gap is the worker's timing, and no check lands in it every run.
- **PR24's own sentence strengthened instead of a new id:** R13 would then expect PR24, whose sentence (Issue #134) says nothing of the road. A new id keeps each sentence to its own claim.
- **The twins kept, with a follow-up filed:** the stale-order guard and the PNG record stay written twice and can drift apart, and the road's x2 and clamped paths stay unheld. Step 15 fixes a finding about the pull request's own work, and Alex ruled no more follow-ups under the Wayfarer's Ribbon phase.
- **Only the leaves shared** (one PNG record, one pull): leaves the order skeleton, 23 verbatim lines, written twice.
- **`runOrder` taking a promise in place of `impression`, a thunk:** the caller would post the poster's job before the counter closes. That is equivalent today only because `runJob` does nothing a reader sees in the task (`send` posts a message, or defers the inline render by a timer). The thunk keeps today's order by construction.
- **`runOrder` deferring the job itself** (`Promise.resolve().then(impression)`): the poster's job would be posted a microtask late, after a redraw clicked in the same task. PR27 clicks Desk and then Draw in one evaluate, so the order would settle behind the redraw, the reverse of what PR27 holds.
- **`downloadSvg(imp.svg, imp.filename)`** or `runOrder(preset.width, selectedFormat(), ...)`: the split-arguments lint (`vellum/split-arguments-by-name`, Issue #654) requires a call to a function of the file's own to hand each value under the name of the parameter it lands in. Hence the destructuring and the named locals in the block.
- **A generic `runOrder<T>` over the drawn result:** more type machinery for no gain, since each impression is built where its result is known.

## Files

Line numbers are at 9fb311c4.

**Edited:**

- **`e2e/suites/print-room/redraw.ts`** (280 lines, 295 after; `pr24Redraw` 28 counted lines, 39 after). Directly above `export async function pr24Redraw` add these two lines and a blank line:
  ```ts
  type RoadAt = { disabled: boolean; text: string } | null;
  type MidDraw = { bind: boolean; print: boolean; atlasEmpty: boolean; hasAtlas: boolean; road: RoadAt[] };
  ```
  In `pr24Redraw` (lines 4 to 31), the first `evaluate` (lines 5 to 7) becomes the one below. Directly above it goes the one wiring line. `ROAD_CHOICE` is not imported: the words are written out, as PR41's are.
  ```ts
    // Wiring, not the claim: Draw is clicked as PR24 has always pressed it; PR51's claim is the road option read before and after that click, in the same task.
    const midDraw = await evaluate<MidDraw>(
      `(()=>{const o=document.querySelector('#pr-pressing option[value="road"]'),road=()=>o?{disabled:o.disabled,text:o.textContent}:null,before=road();const s=document.getElementById("pr-seed");s.value="2024";document.getElementById("pr-draw").click();return{bind:document.getElementById("pr-bind").disabled,print:document.getElementById("pr-print").disabled,atlasEmpty:document.getElementById("pr-atlas").children.length===0,hasAtlas:document.body.classList.contains("has-atlas"),road:[before,road()]};})()`,
    );
  ```
  The poll and PR24's `check(...)` are unchanged. Directly after PR24's `check(...)`, at the end of the function, add:
  ```ts
    const [before, after] = midDraw.road;
    check(
      "PR51 a redraw closes the road the old world offered the moment Draw is pressed (no stale-world road): with seed 42's road drawn, the road option is open before the click and closed after it, until the new world answers (Issue #433)",
      !!before &&
        !before.disabled &&
        before.text === "The road from the capital" &&
        !!after &&
        after.disabled &&
        after.text === "The road from the capital",
      JSON.stringify(midDraw.road),
    );
  ```
  `pr24Redraw` stays outside every step, as it is at 9fb311c4. Its new code adds no throwing call or seeded wait, so `vellum/e2e-throw-inside-step` has nothing new to read. `e2e/suites/print-room.ts` is not edited. The planner's draft of the whole file with these three edits:
  - is prettier-clean (`prettier --stdin-filepath e2e/suites/print-room/redraw.ts`, no change, `out/433-dry-run/433-r2-redraw-fmt.ts`);
  - lints clean read as its own path (`eslint ... --stdin --stdin-filename e2e/suites/print-room/redraw.ts`, exit 0);
  - type-checks clean (`out/433-dry-run/rd-check`, exit 0).
- **`src/site/print-room/order-counter.ts`** (370 lines, 361 after). Replace lines 198 to 351, from `function pullSvg(` through the closing brace of `orderRoad`, with the block below. It is exactly the planner's prettier-clean draft (`out/433-dry-run/433-r2-order-counter-fmt.ts` lines 198 to 342). Lines 1 to 197 (imports, globals, `CounterHost`, `Road`, the state, `refreshOrderControls` through `orderShape`) and 352 to 370 (`orderAt`, `initOrderCounter`) are unchanged, and so is every import. The three comments in the block are the moved-verbatim ones from `pullSvg`, `orderSettled` and `orderPoster`, travelling with their lines. No comment is added.
  ```ts
  interface Impression {
    readonly svg: string;
    readonly filename: string;
    readonly pulled: string;
    readonly pngFilename: (outWidth: number) => string;
    readonly label: string;
    readonly width: number;
    readonly seed: number;
    readonly style: StyleName;
  }

  function posterImpression(
    res: Readonly<DrawResult>,
    basis: Readonly<PosterBasis>,
    preset: Readonly<PosterPreset>,
    isChart: boolean,
    width: number,
  ): Impression {
    // The chart reuses the Explorer's exact artifact name (byte-parity by construction: same worker, same draw kind, same widthPx); the posters keep width-stamped names.
    const filename = isChart
      ? chartFilename(basis.seed, basis.style, res.title)
      : posterFilename(basis.seed, basis.style, width);
    return {
      svg: res.svg,
      filename,
      pulled: isChart ? `The chart is pulled as the engraving: ${filename}` : `${preset.label} plate pulled: ${filename}`,
      pngFilename: (outWidth) => posterPngFilename(basis.seed, basis.style, outWidth),
      label: preset.label,
      width,
      seed: basis.seed,
      style: basis.style,
    };
  }

  function roadImpression(held: Road, preset: Readonly<PosterPreset>): Impression {
    const filename = roadFilename(held.seed, held.dress, preset.width);
    return {
      svg: roadAtWidth(held.svg, preset.width),
      filename,
      pulled: `${preset.label} plate pulled: ${filename}`,
      pngFilename: (outWidth) => roadPngFilename(held.seed, held.dress, outWidth),
      label: preset.label,
      width: preset.width,
      seed: held.seed,
      style: held.dress,
    };
  }

  function pullImpression(imp: Impression): void {
    const { svg, filename } = imp;
    downloadSvg(svg, filename);
    window.__vellumLastPoster = { svg, filename, width: imp.width, seed: imp.seed, style: imp.style };
    posterStatus.textContent = imp.pulled;
  }

  function pressImpression(png: Readonly<RasterizeResult>, imp: Impression): void {
    const filename = imp.pngFilename(png.width);
    downloadBlob(png.blob, filename);
    window.__vellumLastPng = {
      filename,
      type: png.blob.type,
      size: png.blob.size,
      width: png.width,
      height: png.height,
      scale: png.scale,
      clamped: png.clamped,
      seed: imp.seed,
      style: imp.style,
    };
    posterStatus.textContent = png.clamped
      ? `${imp.label} plate pressed at reduced resolution to fit this browser: ${filename}`
      : `${imp.label} plate pressed: ${filename}`;
  }

  function orderSettled(): void {
    // Re-open ONLY if no draw is now in flight; a redraw started while this order rolled must keep the plates closed until its own proof settles.
    ordering = false;
    refreshOrderControls();
  }

  function runOrder(width: number, format: string, impression: () => Promise<Impression>): void {
    const myGen = ++posterGen;
    ordering = true;
    refreshOrderControls();
    posterStatus.textContent = `The press is rolling at ${width}px…`;
    impression()
      .then(async (imp) => {
        if (myGen !== posterGen) return;
        if (format === "svg") {
          pullImpression(imp);
          return;
        }
        // PNG: rasterized client-side off a blob-URL Image, still never entering the DOM; failures reject with an in-voice full sentence, shown directly.
        const scale = format === "png2" ? 2 : 1;
        let png;
        try {
          png = await rasterizeSvg(imp.svg, { scale });
        } catch (err) {
          if (myGen !== posterGen) return;
          posterStatus.textContent = errorText(err);
          return;
        }
        if (myGen !== posterGen) return; // a newer order landed while rasterizing
        pressImpression(png, imp);
      })
      .catch((err: unknown) => {
        if (myGen !== posterGen) return;
        posterStatus.textContent = "The press jammed: " + errorText(err);
      })
      .finally(() => orderSettled());
  }

  function orderPoster(key: string): void {
    const preset = presetByKey.get(key);
    // The plates are disabled during a draw, so a real click cannot land mid-redraw, but a programmatic call must not press the stale, about-to-change posterBasis either.
    if (!preset || ordering || host.drawing() || !host.basis()) return;
    // Snapshot synchronously: the preview controls stay live during a render, so a style change could redraw and reassign posterBasis mid-flight.
    const basis = host.basis()!;
    const { isChart, format, width } = orderShape(preset);
    const impression = (): Promise<Impression> =>
      runJob({
        kind: "draw",
        seed: basis.seed,
        overrides: basis.overrides,
        render: {
          style: basis.style,
          widthPx: width,
          legend: basis.legend,
          arms: basis.arms,
          beasts: basis.beasts,
          theme: basis.theme,
        },
      }).then((res) => posterImpression(res, basis, preset, isChart, width));
    runOrder(width, format, impression);
  }

  function orderRoad(key: string): void {
    const preset = ROAD_PRESETS.find((p) => p.key === key);
    const held = road;
    if (!preset || !held || ordering || host.drawing() || !host.basis()) return;
    const { width } = preset;
    const format = selectedFormat();
    const impression = (): Promise<Impression> => Promise.resolve().then(() => roadImpression(held, preset));
    runOrder(width, format, impression);
  }
  ```
  Signatures, none exported: `interface Impression` (above); `posterImpression(res: Readonly<DrawResult>, basis: Readonly<PosterBasis>, preset: Readonly<PosterPreset>, isChart: boolean, width: number): Impression`; `roadImpression(held: Road, preset: Readonly<PosterPreset>): Impression`; `pullImpression(imp: Impression): void`; `pressImpression(png: Readonly<RasterizeResult>, imp: Impression): void`; `runOrder(width: number, format: string, impression: () => Promise<Impression>): void`; `orderPoster(key: string): void` and `orderRoad(key: string): void`, as before. Deleted: `pullSvg`, `pressPng`, `pullRoad`, `pressRoadPng`. The file's header line is unchanged.
- **`scripts/lint/split-arguments.ts`** (line 29): delete the `OLDER_CALLS` entry `"src/site/print-room/order-counter.ts": ["downloadSvg(res.svg, filename)"],`. `src/site/print-room/order-counter.ts` stays in `SPLIT_FILES` (line 17), since the file still hands values to its own functions. `git grep -n 'downloadSvg(res.svg' -- . ':!handbook/plans'` printed only that entry and `order-counter.ts` line 209, which the block deletes. `test/repo/split-arguments.test.ts` reads `OLDER_CALLS`' keys only and is not edited.
- **`handbook/specs/ui-design.md`** (line 443): `the legend row's head, Issue #433 comment 6620144566)` becomes `the legend row's head, 2026-11-03, Issue #433 comments 6620144566 and 6623587000)`. The first comment carries the raise as the dispatcher took it under the delegation. The second carries Alex's own words, "The 16 px raise stays". Do not rewrap the paragraph.

**Not edited:** `src/site/print-room/app.ts` (R13 mutates it on the proof runner only), `e2e/suites/print-room.ts`, `e2e/suites/print-room/road.ts`, `e2e/suites/print-room/kit.ts`, `src/atlas/compose.ts`, `src/site/print-room/road-press.ts`, `test/print-room/road-press.test.ts`, every stylesheet and page.

## Tests, in the order they are written

**Neither change can be built red-first, and each is proven by mutation instead.** PR51 holds behavior already built (`dropRoad()` has been in `draw()` since ed4fe3f2), so it is green the moment it is written: its red is R13, which the planner's mutation reading below already shows. D1 is a refactor with no new test: the checks named under **The design** hold every branch of the one press, and R14 to R16 prove the shared body is what those checks read. All four rows are the implementing session's to prove (step 15; the prover's round is spent).

**PR51** (`e2e/suites/print-room/redraw.ts`, in `pr24Redraw`, written in commit 10). Readings by `out/433-dry-run/433-r2-pr51.ts`, which carries the check's own evaluate verbatim (`PR24_DRAW`) and its assertion (`pr51`). It drives the built site through `start` in `e2e/harness.ts` and replays the state the suite leaves at PR24: seed 42 at `#seed=42&style=antique&legend=1`, the proof and its road answered, the atlas bound, PR48's two choices, PR50's 1240 by 800 window, its two turns, its choice and its cleared metrics, PR21's print media, its Letter and phone boxes, its PDF and its media restored, PR23's download landed (downloads denied, as the suite denies them). Built from 9fb311c4: `dist-r2-head` is the build, and `dist-r2-mut` is the build with the bundle's one `dropRoad();` call in `draw()` deleted. Commands, each exit 0: `R2_SITE=out/433-dry-run/dist-r2-head node out/433-dry-run/433-r2-pr51.ts fixture > out/433-dry-run/433-r2-pr51-fixture.log` and `R2_SITE=out/433-dry-run/dist-r2-mut node out/433-dry-run/433-r2-pr51.ts mutation > out/433-dry-run/433-r2-pr51-mutation.log`.
  - Fixture reading: `midDraw.road` `[{"disabled":false,"text":"The road from the capital"},{"disabled":true,"text":"The road from the capital"}]`, PR51 passes. PR24 passes beside it (`midDraw` `{"bind":true,"print":true,"atlasEmpty":true,"hasAtlas":false,...}`, re-enabled at seed 2024). PR50's replayed turns read `clear` 14 both, the heads 68.75 and 30.375, as PR50 asserts.
  - Mutation reading: `midDraw.road` `[{"disabled":false,"text":"The road from the capital"},{"disabled":false,"text":"The road from the capital"}]`. PR51 fails on `after.disabled`, with the witness (`before` open, the road's words) holding, so it fails on the claim and not on the fixture. PR24 still passes, which is today's hole.
  - One room and one instance, so there is no nearest instance to name. Seed 2024's own answer, read for context after the redraw, is a road on both builds (`s2024Answer`).
  - Who proves it: the implementer (step 15), row R13.

**What the step holds and costs.** PR24 runs outside every step (`await pr24Redraw(ctx);` bare in `boundAndPaper`, `e2e/suites/print-room.ts` line 98), and PR51 reads PR24's own evaluate, so the two are counted as one unit. Its claims:
  - Bind closed at the redraw, held nowhere else: PR24b's `bindDisabled` follows its own Bind click.
  - Print closed at the redraw, and the atlas emptied: both are `resetBoundAtlas`'s, which Hide also runs, and PR25 reads them after Hide.
  - Bind open again on the new proof, held by PR20a and PR24b.
  - The road option closed at the redraw, held nowhere else (measured above).

  That is two claims held nowhere else, on one page: the unit is thin. Its seconds today, read from CI run 41783501386, lane A (job 126420232836): PR23 at 06:16:47.685 to PR24 at 06:16:49.380, 1.695 s. PR51 adds no navigation, wait or render, so the implementer reads the unit once from commit 10's CI run (PR23's line to PR51's line) and a reading under 4 s passes.

**The proof rows this revision owes.** The implementer sends them on the CI proof runner with `npm run proof -- send` from the pushed commit 12, each a find-and-replace against that commit, selection `hunt,print-room`, and reads them back with `npm run proof -- read <run>`. Each find string occurs exactly once in its file (checked on the planner's draft and on 9fb311c4's `app.ts`):

| row | file | find | replace | expect red |
|---|---|---|---|---|
| R13 | `src/site/print-room/app.ts` | `  dropRoad();\n  clearBoundAtlas();\n` | `  clearBoundAtlas();\n` | PR51 |
| R14 | `src/site/print-room/order-counter.ts` | `  const filename = imp.pngFilename(png.width);\n` | `  const filename = imp.pngFilename(png.width + 1);\n` | PR17, PR18, PR44 |
| R15 | `src/site/print-room/order-counter.ts` | `    svg: roadAtWidth(held.svg, preset.width),\n` | `    svg: roadAtWidth(held.svg, preset.width + 1),\n` | PR43, PR44, PR45 |
| R16 | `src/site/print-room/order-counter.ts` | `  const format = selectedFormat();\n` | `  const format = preset.key === "ribbon" ? "svg" : selectedFormat();\n` | PR44 |

- **R13:** today's hole closed. Measured: the staged deletion reds PR51's read, and nothing else in `hunt,print-room` reds under it (ALL PASS 107/107 without PR51).
- **R14:** the shared PNG record reaches both orders' checks. PR17 and PR18 assert the poster's PNG name, and PR44 the road's. PR19 asserts only `/\.png$/` and stays green. The only readers of `__vellumLastPng` are `orderPng` in `e2e/suites/print-room/kit.ts` and its callers PR17 to PR19 and PR44 (`git grep -n "orderPng\|__vellumLastPng" -- e2e`).
- **R15:** R3 re-aimed at the line the block moves it to.
- **R16:** R4 re-aimed.

R3 and R4 stand as proven at ed4fe3f2 (proof runner run 41761841676), on code this revision rewrites. R1, R2 and R5 to R10 (run 41761841676), and R11 and R12 (run 41784616580), stand: none of their find strings is in a line this revision edits.

## Order of commits

These follow 9fb311c4 on `feat/433-print-room-road-order`. Resume the branch in place, and bring nothing current by rebase. Step 10's combined state with `origin/main` is read by merging locally and aborting.

10. Archive this revision at `handbook/plans/400/433/433-pr2-r2-plan.md`, copied unchanged from the scratchpad. Add PR51 in `redraw.ts`.
    - Locally: `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once, alone: "ALL PASS  (108/108)", with PR51's detail `[{"disabled":false,"text":"The road from the capital"},{"disabled":true,"text":"The road from the capital"}]`.
    - Then `npm run check`, `npm run lint`, `npm run format:check`.
    - Push. Read the unit's seconds from this commit's CI print-room lane.
11. The one press in `order-counter.ts`, and the `OLDER_CALLS` entry deleted from `scripts/lint/split-arguments.ts`.
    - Locally: `npm run check`, `npm run lint`, `npm run format:check`.
    - `npm test -- test/repo/split-arguments.test.ts`, then the whole `npm test` once, then `npm run astro:generate`.
    - `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e` once, alone: "ALL PASS  (108/108)".
    - Push.
12. The ui-design citation. Push.

Then, once commit 12's CI is green on the head and on the state combined with main: the proof rows R13 to R16 in one send, the PR body brought up to date (below) and the step 12 comment on the issue. The cold skeptic, the prover and the plate reader are not re-run. The skeptic's and the prover's rounds are spent, no edit after the skeptic's round earns another (`vellum-footguns`, "Defaults this repo has already ruled"), and nothing here is an appearance.

**The PR body**, rewritten in place:
- The revisions paragraph names revision 2 and what it changed.
- The guard table gains PR51 (R13), R14, R15 and R16, each with its ledger line. The R3 and R4 rows say "proven at `ed4fe3f2` on the code before the one press; re-aimed as R15 and R16".
- Records: T1 and D1 are fixed by revision 2 and no longer handed back. The ui-design NIT is fixed. The `roadTitle` NIT is left, with this plan's reason.
- Ran: the commands above with their results, and PR51's unit seconds.

## Rosters and doctrine

- **Rosters joined or left by hand:**
  - The print-room suite's checks gain PR51, in an existing function; no step list changes.
  - `OLDER_CALLS` in `scripts/lint/split-arguments.ts` loses the order counter's one excuse. The lint reds a stale excuse by itself (`stale`, measured), so this is the roster closing on its own.
  - No page, sheet, bundle, suite, lane, route or lint list is joined.
- **Doctrine changed:** `handbook/specs/ui-design.md`, one citation (above). No spec names the order counter's functions (`git grep -n "pullSvg\|pressPng\|orderPoster\|pullRoad\|pressRoadPng\|orderRoad" -- handbook/specs .claude` printed nothing), so none is stale.
- **Comments:** one wiring line at PR24's click. The three comments in the order-counter block are moved verbatim.
- **Golden and regen:** none owed. No engine or renderer file is edited, and `npm test`'s drift guards run unchanged.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, at each code commit.
- `npm test -- test/repo/split-arguments.test.ts`, then the whole `npm test` once at commit 11.
- `npm run build`, then `VELLUM_E2E_SUITES=hunt,print-room npm run test:e2e`, once at commit 10 and once at commit 11, each alone. Never the full local lanes.
- The e2e suites the change touches: `print-room` (PR12 to PR19, PR24, PR26 to PR29, PR41 to PR51), all run by CI. PR8 and PR9 (the inline fallback) press no plate, so they read the proof only.
- The planner's own runs, on the Mac, one at a time:
  - the staged deletion, ALL PASS 107/107 (`433-r2-e2e-printroom-mut.log`);
  - the draft block built, ALL PASS 107/107 (`433-r2-e2e-printroom-share.log`, per-suite wall clock 41.3 s for the two suites against 41.6 s on the staged deletion's run);
  - the PR51 probe's two arms (above).

  `pgrep` before the first probe run found no other `e2e/run.ts` and no `remote-debugging-port` browser. It was not run again before the two suite runs, so whether another lane ran beside those two is UNVERIFIABLE. Both read every check green.
- The unit's seconds from commit 10's CI run, as **Tests** says.
- `vellum-plate-reader` is not owed: nothing here changes how anything looks.

## Calls made

Each is taken under Alex's delegation (issuecomment-6619124326, extended in issuecomment-6619143522). None is blocking: none amends a ruling, none is an appearance, and each is undone at no cost. They stand for him to overrule.

1. **PR51 holds `dropRoad()` in `draw()` by reading the road option before and after PR24's Draw click, in the same task.** Rule: check-placement puts what the page shows in the browser; settle-doctrine's cheapest check that can see the claim. Measured: a read after a road-less answer cannot see it, and the read at the click can.
2. **PR51 is a new check, not a strengthened PR24.** Rule: a proof row names exactly the check it reds (development-workflow step 11), and PR24's sentence is Issue #134's.
3. **The road's order and the poster's share one press** (`Impression` and `runOrder`), fixing D1 here rather than filing it. Rule: step 15 fixes a finding about the pull request's own work, and Alex ruled no more follow-ups under the Wayfarer's Ribbon phase. Measured: 38 of 59 lines duplicated, the file 370 to 361, every check green on the block built, the road's x2 and clamped paths newly held.
4. **`runOrder` takes the impression as a thunk it calls after closing the counter.** Rule: today's order of the press (PR27).
5. **The split-arguments excuse for `downloadSvg(res.svg, filename)` is deleted.** Rule: the lint reds a stale excuse (measured), and the call it excused goes.
6. **R3 and R4 are re-aimed as R15 and R16, and R14 is added.** Rule: the PR body's guard table names mutations in the code the head carries, and R14 shows the one PNG record reaches both orders.
7. **The ui-design bullet cites both comments.** Rule: step 15, a NIT is fixed where cheap. This one is a single citation, and the skeptic named the comment holding Alex's words (6623587000).
8. **The `roadTitle` NIT is left.** Rule: step 15, a NIT is fixed only where cheap. Measured: no exported title function, and the page bundle carries no `compose.ts`.
9. **R13 to R16 are proven by the implementer, and no review agent is re-run.** Rule: development-workflow step 15, and the ruled default that no edit after the cold skeptic earns another round.
10. **The unit PR24 and PR51 is counted thin and read once.** Rule: settle-doctrine, What a step holds.

## Open decisions

None.

## Stop conditions

Hand back, with the command and what it printed, when:

- `git ls-remote origin refs/heads/feat/433-print-room-road-order` prints a head other than 9fb311c49b4fefb2d5cb112ae7209322ab7800cc before commit 10, or `git diff --stat ae27155c origin/main -- src/site/print-room src/site/shared/rasterize.ts src/site/explorer/worker-client.ts e2e/suites/print-room.ts e2e/suites/print-room scripts/lint/split-arguments.ts test/repo/split-arguments.test.ts` prints anything at the build's `origin/main`.
- `order-counter.ts` lines 198 and 351 at 9fb311c4 are not `function pullSvg(` and `orderRoad`'s closing brace.
- `git grep -n 'downloadSvg(res.svg' -- . ':!handbook/plans'` prints other than `scripts/lint/split-arguments.ts:29` and `src/site/print-room/order-counter.ts:209`.
- At commit 10, PR51 is not PASS locally or on CI. Or its detail is not the fixture reading above. Or any other check reds.
- At commit 11, `npm run check`, `npm run lint` or `npm run format:check` reds on `order-counter.ts` or `split-arguments.ts`; the planner's runs on the same text were clean but for the stale excuse this commit deletes. Or any unit test reds. Or any check in `hunt,print-room` reds, locally or on CI, PR27 above all (the order of a press).
- R13 does not BITES on exactly PR51; R14 on exactly PR17, PR18 and PR44; R15 on exactly PR43, PR44 and PR45; or R16 on exactly PR44. Or a control is not CLEAN.
- The unit's reading from commit 10's CI run is 4 s or more. If it is under 20 s, start two more runs of the lane's job by hand and quote all three, as settle-doctrine says. Hand back if their median is 10 s or more, or if any one reading is over 20 s.
- `npm run lint` reds `pr24Redraw` on `max-lines-per-function` (39 counted lines on the planner's draft, against 50), or `redraw.ts` on `max-lines` (295 lines, against 400).
