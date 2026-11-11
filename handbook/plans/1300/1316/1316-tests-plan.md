# Issue #1316 plan, second pull request: the keeper facts a test can hold get their tests

**Planned at**: `origin/main` `581d37d44ae4828103de6fc670c59abc39875180`, Issue #1316 read with 9 comments:
- 6791901626, the step 6 rulings of the first pull request;
- 6792014605 and 6792015209, the archive of `1316-plan.md`;
- 6792137482, the first build's calls;
- 6792432772, the ruling that moves N2 here as an eighth test;
- 6792597355 and 6792597866, the archive of `1316-r1-plan.md`;
- 6792688392, the calls of revision 1;
- 6795682892, the rulings on this plan's step 6 menu.

First planned at the same sha with 8 comments; re-recorded after the rulings, main unmoved.

Main carries the first pull request, PR #1333 (30 comment lines, merged as `581d37d4`), and its two plans at `handbook/plans/1300/1316/1316-plan.md` and `1316-r1-plan.md`. This plan is the one those plans promised, archived beside them as `handbook/plans/1300/1316/1316-tests-plan.md`.

**Rulings**:
- https://github.com/ahl-gram/Vellum/issues/1316#issuecomment-6791901626 (Alex, 2026-11-11), item 3: the behaviours a test could check but none does (rows 25, 68, 81, 86, 99, 131 and 135) get a second pull request of this issue that writes their tests, and the issue stays open until then.
- https://github.com/ahl-gram/Vellum/issues/1316#issuecomment-6792432772 (Alex, 2026-11-11): row 2 (N2, `scripts/build-og.ts`) is an eighth test that reads `src/static/og.png`'s size, so a regeneration at the wrong scale fails.
- https://github.com/ahl-gram/Vellum/issues/1316#issuecomment-6795682892 (Alex, 2026-11-11, on this plan's step 6 menu, re-taking parts of ruling 3 where its premise measured false): (1) row 68 gets a test, for deuteranopia only, with the colour code exposing each kind of colour blindness to it and no chart moving; (2) row 81 gets no new test, the two existing tests that fail when the network breaks being the record; (3) row 135 is dropped, no fast test, RA2 keeping the far end. So this pull request writes six tests: rows 2, 25, 68, 86, 99 and 131.

**Open decisions**: none.

## What this pull request is

Six unit tests and one small refactor of `src/render/cvd.ts`, as ruled. Each test holds one fact the PR #377 sweep or the PR #548 sweep deleted as a comment and that no test asserted:

| row | the fact | the test, in | built under |
|---|---|---|---|
| 2 | `src/static/og.png` is the card at scale 1, 1200 by 630 | `test/render/og-stamp.test.ts` | ruling 6792432772 |
| 25 | a prospect site on unclaimed land reads realm -1, with no name and no arms | `test/prospect/input.test.ts` | ruling 3 |
| 68 | antique's deep olive is dark so that it clears ochre under deuteranopia | `test/render/cvd.test.ts` | ruling 6795682892, item 1 |
| 86 | `refineTour`'s fresh start must win by more than the tolerance, so a tie keeps the given order | `test/render/voyage-tour.test.ts` | ruling 3 |
| 99 | the Roman-numeral fallback skips the near-dup screen and keeps the English-word screen | `test/society/names.test.ts` | ruling 3 |
| 131 | the tour job carries the straight-line port set, capital first | `test/site/voyage-tour-order.test.ts` | ruling 3 |

Row 81 gets no test (ruling 6795682892, item 2): two existing tests already fail when its fact breaks (measured, below). Row 135 gets no test (item 3): the browser check RA2 keeps the far end. The pull request also adds one `handbook/errata/engine.md` row for a sibling defect row 99's fixture exposed (call C9). No comment line is added anywhere, and the pull request closes Issue #1316.

## Specs

The implementer reads these first, at these sections, on top of the reading `CLAUDE.md`'s table owes for the work:

- `CLAUDE.md`, Process: "Write the failing test first", "A guard proves it can fail; a scanner proves which way it errs", "A bound is derived", "Comments are the exception, not the rule".
- `handbook/specs/check-placement.md`, The unit suite: "A unit test runs the code and asserts what it does", "A test may read a file as DATA where the file is the thing under test" (row 2 reads a committed PNG), and the `SOURCE_READS` bullet (no entry is owed: `isSource` in `test-support/source-read-guard.ts` names no `.png`, and `test/repo/source-read-guard.test.ts` lists `src/static/og.png` among the non-sources).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 items 1 to 4 and 9; Gate 7 item 1 (row 2 reads the PNG header, with its anchors asserted); Gate 6 item 7 (row 68's `cvd.ts` change feeds the realm tints, so "no regen owed" is a claim with commands behind it); Gate 5 items 5 and 7.
- `handbook/specs/rulebook.md`, Golden and committed-chart discipline (row 68's change must move no chart byte and no golden).
- `handbook/specs/development-workflow.md`: step 8 (archive this plan as `1316-tests-plan.md` in the first commit; the failing test first), step 11 (the prover), step 12 (the calls comment), step 13 (the closing line), step 14 and step 15.
- `handbook/errata/README.md`, A row (the shape of call C9's row).

## The design

### Row 2: the committed card's size

`scripts/build-og.ts` rasterizes the card with `rasterizeSvg(browser, cardPath, pngPath, 1)`, and `rasterizeSvg` in `src/cli/raster.ts` defaults its scale to 2, so dropping the argument doubles the PNG. The stamp test beside it cannot see that: the stamp hashes the card's SVG, not the raster, so a scale-2 regeneration carries the right stamp (measured below: the scale-2 raster, stamped as the script stamps, carries the same stamp). The new test reads the PNG's header, as `test/render/favicon.test.ts` reads `src/static/apple-touch-icon.png` (signature, then "IHDR" at bytes 12 to 16, then width and height), and compares it with `OG_WIDTH` and `OG_HEIGHT` from `src/render/og-card.ts`, the card's own declared size, which "the OG card is a 1200x630 SVG document" in `test/render/og-card.test.ts` pins at 1200 and 630.

### Row 25: the unclaimed sentinel

`buildProspectInput` in `src/prospect/input.ts` reads `world.realms.labels` at the site (`?? -1`), and names and arms the realm only when it is 0 or more. "settlement attributes and realm identity flow through" in `test/prospect/input.test.ts` checks the label for every settlement of seeds 1 to 12, but no generated settlement stands on unclaimed land (0 of 1025 over seeds 1 to 40, measured), so the -1 case is never reached. The test copies seed 1's labels, sets settlement 0's cell to -1 on the copy, and asserts realm -1, realm name null and arms null, after asserting the same settlement is claimed in the generated world.

### Row 68: why the olive is dark (ruling 6795682892, item 1)

The deleted comment: "Deep olive is deliberately dark: it dodges the deuteranopia collision the lighter olive had with ochre." Measured at the antique 0.11 wash over antique paper, through the house's own simulation (`src/render/cvd.ts`), olive `#5f6b2e` against ochre `#bf9b4f` reads 3.128 in normal vision, 2.857 under deuteranopia and 2.340 under protanopia, against the 2.5 below which the house calls two washes confusable. So the fact holds for deuteranopia only: under protanopia the pair is still confusable, and `washesConfusable` answers true for it today. That is why the test needs a per-view distance, which `src/render/cvd.ts` computes but does not export: `washesConfusable` only says whether any of the three views falls under the threshold.

The change: `src/render/cvd.ts` exports `CONFUSABLE_DE = 2.5`, the type `WashDistances` and `washDistances(a, b, paper, opacity)`, which returns the three distances `washesConfusable` already computes, and `washesConfusable` and `washConflictMatrix` read their default threshold from `CONFUSABLE_DE`. The arithmetic of each view is unchanged; only the early return of the loop goes. Every conflict-matrix answer is unchanged (measured below over all four styles, both opacities and five thresholds), so no chart moves.

The test reads the olive and ochre from `STYLES.antique.realmTints` (positions 6 and 2, which "palette additions: antique 7, topographic 8, ink & nautical frozen at 5" in `test/render/realm-tints.test.ts` pins) and asserts the olive's deuteranopia distance from ochre is at least `CONFUSABLE_DE`, beside a witness that the view can see an olive-ochre collision at all: `#98ab4a`, the olive with its channels scaled by 1.6, sits 0.145 from ochre under deuteranopia. That hex is built for the test, not the one PR #111 rejected: neither PR #111, its commit `39b2ed81` nor Issue #78 names the lighter olive. The test says nothing about protanopia, since a pin on today's protanopia collision would red a future olive that cleared it.

### Row 81: the road network (ruling 6795682892, item 2)

The deleted comment's premise ("the whole union is a single 8-connected component reachable from the capital") is stale: since Issue #309 the network is one 8-connected component per settled landmass, which the comment surviving in `createWalkLeg` (`src/render/voyage-route.ts`) says. What the router depends on is held by two existing tests, both measured to red when it breaks:
- "#309: the fixture worlds route with zero straight legs" (`test/render/voyage-route.test.ts`) reds when road polylines stop stepping one cell at a time: with every other interior road cell dropped, in `buildSurvey` (`src/render/survey.ts`) or in `tracePath` (`src/society/roads.ts`), seed 430445745 degrades 21 of 24 legs to straight.
- "#309: realm webs sharing a landmass are joined into one component by a royal trunk" (`test/society/roads-realm.test.ts`) reds when the royal trunks are not laid: 2 components against 1.

So the plan writes no test for row 81. Over seeds 1 to 40, 0 of 28651 road steps skip a cell and no landmass holds two road networks. Seeds 9 and 17 each carry one network across landmasses that touch at a corner; that is no defect, since the router needs only that no landmass holds two networks, and the surviving comment's "one 8-connected component per settled landmass" stays true of every landmass.

### Row 86: the strict win

`refineTour` in `src/render/voyage-tour.ts` returns the nearest-first candidate only when `cost(fromNearest) < cost(fromGiven) - EPS`. With every leg costing 1, the given order `[0, 2, 1, 3, 4]` and the nearest-first order `[0, 1, 2, 3, 4]` tie, and each is already 2-opt optimal, so the result must be the given order. A second distance makes the leg between ports 0 and 1 cost `1 - 1e-12`, so the nearest-first cycle is cheaper by less than the tolerance, and the result must still be the given order. The first half reds a tie that goes to the fresh start; the second reds a dropped tolerance.

### Row 99: the fallback's two screens

In `createBaseMaker` (`src/society/names.ts`), the Roman-numeral fallback loop skips a base in `ENGLISH_BLOCKLIST` whatever the slot, and never asks `isNearExisting`. The test drives the real namer with a four-base culture, `TIGHT`: onsets `m` and `b`, nucleus `o`, codas `re` and `an`, so the bases are "more", "moan", "bore" (all blocklisted) and "boan" (not). The first `bare` name is "Boan"; the second has nothing left the near-dup screen allows, so the fallback answers "Boan II", reusing the held base (the exemption). Then 20 seeds draw 10 settlement names each, about 40 percent of them asking with a town suffix (a slot that is not standalone), and no fallback base may be blocklisted. Measured: 160 of the 200 names are Roman-numeral fallbacks. Ten names a seed stays clear of the last-resort line after "Boan X", which call C9 records as a sibling defect.

### Row 131: what the job carries

`createTourOrder`'s `prime` (`src/site/explorer/tour-order.ts`) sends the render worker a tour job whose `ports` field (`TourJobInput.ports`, `src/site/explorer/tour-job.ts`) is the straight-line plan's port set, capital first, because `refineTour` holds the first port as the start. The tests in `test/site/voyage-tour-order.test.ts` record each job's ports in `tourHarness` and only count the jobs, and the harness answers whatever was sent, so a job sent wrong ports passes every one of them (measured: sending the ports reversed reds only the new test). The new test primes the seed-42 world through `tourHarness`, then asserts one job was sent, its first port is the manifest's capital, and its ports equal the straight-line plan's.

### Row 135: dropped (ruling 6795682892, item 3)

`armAges` in `src/site/shared/living-chart/ages.ts` clamps a deep-linked rest year into the chronicle's range. The browser check RA2 (`ra2Clamps` in `e2e/suites/room-address.ts`) loads `year=999999` and asserts the year, the readout and the hash settle at the present, read in the check's body. As ruled, this pull request writes no test for it and touches neither file; the lower end stays unchecked.

### Alternatives rejected

- **A copy of the colour math inside the row 68 test.** It is the defect Issue #1318 just removed: a test computing its expected value with a copy of the code it tests.
- **New test files.** Each test goes beside the helper and the subject it needs; a new file would copy `tourHarness` or `tourCost`, the copies Issue #1317 and Issue #1318 took out.
- **Row 2 through `decodePng` (`test-support/png-decode.ts`).** It decodes every pixel, and on the browserless mutant (the header rewritten to 2400 by 1260) it throws "unknown PNG filter type 255" before any assertion runs (measured), so the proof would read as a stop and not as a red.
- **Row 2 running `npm run og`.** It needs a Chromium-family browser, which the unit suite does not have.
- **Row 25 on a generated seed.** None of 1025 settlements over seeds 1 to 40 stands on unclaimed land.
- **Row 99 through a stub `Rng`.** It ties the test to the namer's draw order; a tight culture drives the real namer through its public API.
- **Row 86 with an exact tie only.** A dropped tolerance (M86b) passes an exact tie.
- **Row 131 on `tourOrderFor`'s answer.** Its first port is already held by "refineTour: never worse than the given order, start pinned, set preserved" and by "#373 the job and the inline path agree at every port count"; what nothing holds is what the job carries.

## Files

No file is deleted. Every edit below was applied to copies of the files at `581d37d4` by `out/1316-dry-run/1316-dry-run.ts` (planner's tree), each anchor occurring exactly once, and the copies lint and format clean (Evidence). Build each insertion with one Edit: `old_string` is the anchor line given, `new_string` is the block, a blank line, then the anchor line.

1. **`handbook/plans/1300/1316/1316-tests-plan.md`**, created: this plan, copied unchanged from the scratchpad.

2. **`src/render/cvd.ts`** (81 lines; 91 after commit 1, 94 after commit 2). One edit in commit 1 and two in commit 2. Applied in that order to the file at `581d37d4`, they land byte for byte on the dry run's final copy (`node out/1316-dry-run/1316-commit-sequence-check.ts`, log `1316-commit-sequence-check.log`).

   **Commit 1, the stub.** One Edit: `old_string` is the anchor line `export function washesConfusable(a: string, b: string, paper: string, opacity: number, threshold = 2.5): boolean {`, and `new_string` is this block, a blank line, then the anchor line:

```ts
export const CONFUSABLE_DE = 2.5;

export type WashDistances = { readonly normal: number; readonly deuteranopia: number; readonly protanopia: number };

export function washDistances(a: string, b: string, paper: string, opacity: number): WashDistances {
  const normal = washesConfusable(a, b, paper, opacity) ? 0 : CONFUSABLE_DE;
  return { normal, deuteranopia: normal, protanopia: normal };
}
```

   **Commit 2, the change.** First Edit: `old_string` is the stub block above, a blank line, then the original `washesConfusable` exactly as it stands at `581d37d4`:

```ts
export function washesConfusable(a: string, b: string, paper: string, opacity: number, threshold = 2.5): boolean {
  const la = compositeLinear(hexToRgb(a), hexToRgb(paper), opacity);
  const lb = compositeLinear(hexToRgb(b), hexToRgb(paper), opacity);
  for (const m of [null, DEUTERANOPIA, PROTANOPIA] as const) {
    const va = m ? applyMatrix(m, la) : la;
    const vb = m ? applyMatrix(m, lb) : lb;
    if (deltaE(linearToLab(va), linearToLab(vb)) < threshold) return true;
  }
  return false;
}
```

   and `new_string` is:

```ts
export const CONFUSABLE_DE = 2.5;

export type WashDistances = { readonly normal: number; readonly deuteranopia: number; readonly protanopia: number };

export function washDistances(a: string, b: string, paper: string, opacity: number): WashDistances {
  const la = compositeLinear(hexToRgb(a), hexToRgb(paper), opacity);
  const lb = compositeLinear(hexToRgb(b), hexToRgb(paper), opacity);
  const seen = (m: Mat3 | null): number =>
    deltaE(linearToLab(m ? applyMatrix(m, la) : la), linearToLab(m ? applyMatrix(m, lb) : lb));
  return { normal: seen(null), deuteranopia: seen(DEUTERANOPIA), protanopia: seen(PROTANOPIA) };
}

export function washesConfusable(
  a: string,
  b: string,
  paper: string,
  opacity: number,
  threshold = CONFUSABLE_DE,
): boolean {
  const d = washDistances(a, b, paper, opacity);
  return d.normal < threshold || d.deuteranopia < threshold || d.protanopia < threshold;
}
```

   Second Edit: in `washConflictMatrix`'s parameter list, `old_string` is the two lines `  threshold = 2.5,` and `): boolean[][] {` (joined by a newline), and `new_string` is `  threshold = CONFUSABLE_DE,` and `): boolean[][] {`.

   Exported signatures after commit 2: `export const CONFUSABLE_DE: 2.5`, `export type WashDistances = { readonly normal: number; readonly deuteranopia: number; readonly protanopia: number }`, `export function washDistances(a: string, b: string, paper: string, opacity: number): WashDistances`, `export function washesConfusable(a: string, b: string, paper: string, opacity: number, threshold?: number): boolean`, `export function washConflictMatrix(palette: readonly string[], paper: string, opacity: number, threshold?: number): boolean[][]`.

3. **`test/render/cvd.test.ts`** (40 lines, 59 after). Replace the import line `import { washesConfusable, washConflictMatrix } from "../../src/render/cvd.ts";` with:

```ts
import { CONFUSABLE_DE, washDistances, washesConfusable, washConflictMatrix } from "../../src/render/cvd.ts";
import { STYLES } from "../../src/render/style.ts";
```

   Then insert above the anchor `test("washConflictMatrix is symmetric with a false diagonal", () => {`:

```ts
const BUILT_LIGHT_OLIVE = "#98ab4a";

test("antique's deep olive is dark on purpose: under deuteranopia it stays clear of the frozen ochre, where the same olive lightened is its twin", () => {
  const { paper, realmTints } = STYLES.antique;
  const ochre = realmTints[2]!;
  const olive = realmTints[6]!;
  assert.ok(
    washDistances(BUILT_LIGHT_OLIVE, ochre, paper, 0.11).deuteranopia < CONFUSABLE_DE,
    "witness, built for this test: the olive's channels scaled by 1.6 are an ochre twin under deuteranopia",
  );
  const seen = washDistances(olive, ochre, paper, 0.11);
  assert.ok(
    seen.deuteranopia >= CONFUSABLE_DE,
    `antique's olive sits ${seen.deuteranopia.toFixed(3)} from ochre under deuteranopia, inside the ${CONFUSABLE_DE} the conflict matrix calls confusable`,
  );
});
```

4. **`test/render/og-stamp.test.ts`** (56 lines, 67 after). Replace the import line `import { buildOgCard } from "../../src/render/og-card.ts";` with `import { OG_HEIGHT, OG_WIDTH, buildOgCard } from "../../src/render/og-card.ts";`. Then insert above the anchor `test("the stamp covers the card's dress and the embedded faces but not the chart, so chart float drift cannot move it", async () => {`:

```ts
test("src/static/og.png is the card at scale 1, OG_WIDTH by OG_HEIGHT pixels, so a regeneration at another scale fails", () => {
  const bytes = readFileSync(root("src/static/og.png"));
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "a PNG signature");
  assert.equal(bytes.subarray(12, 16).toString("latin1"), "IHDR", "the header chunk comes first");
  assert.deepEqual(
    { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) },
    { width: OG_WIDTH, height: OG_HEIGHT },
    "src/static/og.png is not the card's own size: npm run og rasterizes at scale 1; regenerate and commit the PNG",
  );
});
```

5. **`test/prospect/input.test.ts`** (214 lines, 232 after). No import changes (`buildProspectInput` and `worldFor` are imported already). Insert above the anchor `test("chronicle facts flow through and stay year-agnostic", () => {`:

```ts
test("a settlement on unclaimed land reads realm -1, with no realm name and no arms", () => {
  const w = worldFor(1);
  const s = w.settlements[0]!;
  const claimed = buildProspectInput(w, 0);
  assert.ok(
    claimed.realm >= 0 && claimed.realmName !== null && claimed.arms !== null,
    "fixture: the site is claimed in the generated world, so the -1 below comes from its label alone",
  );
  const labels = Int16Array.from(w.realms.labels);
  labels[s.x + s.y * w.elev.w] = -1;
  const unclaimed = buildProspectInput({ ...w, realms: { ...w.realms, labels } }, 0);
  assert.deepEqual(
    { realm: unclaimed.realm, realmName: unclaimed.realmName, arms: unclaimed.arms },
    { realm: -1, realmName: null, arms: null },
  );
});
```

6. **`test/render/voyage-tour.test.ts`** (191 lines, 210 after). No import changes (`refineTour` and the file's own `tourCost` are used). Insert above the anchor `test("refineTour: never worse than the given order, start pinned, set preserved", () => {`:

```ts
test("refineTour: the fresh nearest-first start must win by more than the tolerance, so a tie keeps the given order's refinement", () => {
  const given = [0, 2, 1, 3, 4];
  const nearest = [0, 1, 2, 3, 4];
  const level = () => 1;
  assert.equal(
    tourCost(given, level),
    tourCost(nearest, level),
    "fixture premise: the given cycle and the nearest-first cycle tie",
  );
  assert.deepEqual(refineTour(given, level), given, "an exact tie keeps the given order");
  const nudged = (a: number, b: number) => (a + b === 1 ? 1 - 1e-12 : 1);
  assert.ok(
    tourCost(nearest, nudged) < tourCost(given, nudged),
    "fixture premise: the nearest-first cycle is cheaper, by 1e-12",
  );
  assert.deepEqual(refineTour(given, nudged), given, "a win inside the tolerance is a tie too");
});
```

7. **`test/society/names.test.ts`** (183 lines, 236 after). Replace the import line `import { CULTURES, ENGLISH_BLOCKLIST, createNamer, isStandaloneSlot, makeMapTitle } from "../../src/society/names.ts";` with:

```ts
import {
  CULTURES,
  ENGLISH_BLOCKLIST,
  createNamer,
  isStandaloneSlot,
  makeMapTitle,
  type Culture,
} from "../../src/society/names.ts";
```

   Then insert above the anchor `test("map titles are deterministic and themed by map type", () => {`:

```ts
const TIGHT: Culture = {
  id: "tight",
  onsets: ["m", "b"],
  nuclei: ["o"],
  codas: ["re", "an"],
  patterns: ["ONC"],
  townSuffixes: ["haven"],
  riverTemplates: ["%"],
  peakTemplates: ["%"],
  seaTemplates: ["%"],
  lakeTemplates: ["%"],
  forestTemplates: ["%"],
  realmTemplates: ["%"],
};
const NUMERAL_FALLBACK = /^(\S+) (?:II|III|IV|V|VI|VII|VIII|IX|X)$/;

test("the Roman-numeral fallback skips the near-dup screen but keeps the English-word screen, whatever slot asked", () => {
  assert.deepEqual(
    ["more", "moan", "bore", "boan"].map((b) => ENGLISH_BLOCKLIST.has(b)),
    [true, true, true, false],
    "fixture premise: three of the four bases are English words",
  );
  const namer = createNamer(createRng(1).fork("names"), TIGHT);
  assert.deepEqual(
    [namer.name("bare"), namer.name("bare")],
    ["Boan", "Boan II"],
    "the fallback reuses a base the near-dup screen already holds, since the numeral keeps the name unique",
  );
  const bases: string[] = [];
  for (let seed = 1; seed <= 20; seed++) {
    const settler = createNamer(createRng(seed).fork("names"), TIGHT);
    for (let i = 0; i < 10; i++) bases.push(NUMERAL_FALLBACK.exec(settler.name("settlement"))?.[1] ?? "");
  }
  const fallbacks = bases.filter((b) => b !== "");
  assert.ok(
    fallbacks.length > 0,
    `fixture premise: the settlement names reach the fallback (${fallbacks.length} of ${bases.length})`,
  );
  assert.deepEqual(
    fallbacks.filter((b) => ENGLISH_BLOCKLIST.has(b.toLowerCase())),
    [],
    "a fallback base renders as its own word, so the English-word screen applies to it even after a town suffix was drawn",
  );
});
```

8. **`test/site/voyage-tour-order.test.ts`** (380 lines, 394 after; the lint's `max-lines` counts 309 of today's lines, since it skips blank and comment lines, and about 321 after). No import changes. Insert above the anchor `test("#373 nothing is cached until the job lands", async () => {`:

```ts
test("#373 the job carries the straight-line port set, the capital first, since refineTour holds its first port as the start", async () => {
  const { manifest, survey } = await realWorld();
  const h = tourHarness(() => reversedTour(portsOf(manifest)));
  const primed = h.orders.prime(manifest, survey, SEED);
  h.release();
  await primed;
  assert.equal(h.jobs.length, 1, "one job was sent");
  const capital = manifest.places.find((p) => p.kind === "capital");
  assert.ok(capital, "fixture: the world has a capital");
  assert.equal(h.jobs[0]!.ports[0], capital.idx, "the voyage's origin, the capital, is the job's first port");
  assert.deepEqual([...h.jobs[0]!.ports], portsOf(manifest), "the straight-line port set, before any reorder");
});
```

9. **`handbook/errata/engine.md`** (62 lines, 63 after). Once the pull request is open and its number `<PR>` is known, replace `\n\n## Ruled and left\n` (the blank line closing the `## Open` rows and the heading after it) with `\n<the row>\n\n## Ruled and left\n`, where the row, with `<PR>` replaced by that number and `<date>` by the date the pull request opened (`YYYY-MM-DD`), is:

```
- PR #<PR> (<date>, low): the namer's last resort, the name `createBaseMaker` (`src/society/names.ts`) returns once its 1000 Roman-numeral tries are spent (a base and a bare counter), skips the English-word screen the Roman-numeral fallback keeps, so a spent namespace can name a place "More 277": measured on the four-base culture `TIGHT` in `test/society/names.test.ts` drawing twelve settlement names a seed over seeds 1 to 20, where every seed's twelfth name took it (seeds 1 to 3 gave "More 277", "Moan 292" and "Bore 292"); the shipped cultures' namespaces were not measured for reaching it. Searched: this directory for "fallback", "blocklist" and "Roman" (no row on the namer), and the open issues for "blocklist" (only Issue #962, "the" missing from the list, a different hole) and for "roman numeral name" (only Issue #1316 itself).
```

No other file changes: `test/site/ages-told-signal.test.ts` and `src/site/shared/living-chart/ages.ts` are not touched (row 135 dropped). No file here passes 400 counted lines.

## Tests, in the order they are written

No browser check is added or made longer, so no ledger line and no browser reading is owed. Every test below is a unit test, and every mutation below was run by the planner through a module-load hook that edits the module as Node loads it, so no tracked file was edited for it (`out/1316-dry-run/1316-mutate-hooks.ts`), each against the whole edited test file (`out/1316-dry-run/1316-dry-run.ts mutate`, log `out/1316-dry-run/1316-dry-run-mutate.log`), and each named red is the only red in its file (that log also carries the dropped row 135's two mutations, which are not built). Five of the six tests pin behaviour the code already has, so their red step is their first mutation, applied after the commit and restored with `git checkout -- <file>` (call C2). The prover owes every mutation named here (M2 run locally, since a binary file is not a text patch); step 15 leaves none to the implementer.

1. **Row 68**, `test/render/cvd.test.ts`, "antique's deep olive is dark on purpose: under deuteranopia it stays clear of the frozen ochre, where the same olive lightened is its twin".
   - Asserts: the built light olive's deuteranopia distance from ochre is under `CONFUSABLE_DE` (the witness), then antique's olive's is at least `CONFUSABLE_DE`.
   - Red first: against the stub, the second assertion fails with "antique's olive sits 0.000 from ochre under deuteranopia, inside the 2.5 the conflict matrix calls confusable" (measured: 5 pass, 1 fail, `out/1316-dry-run/1316-dry-run-stub.log`).
   - M68a, `src/render/style.ts`: the antique `realmTints` entry `"#5f6b2e"` becomes `"#98ab4a"`. Reds this test ("sits 0.145") and, in `test/render/realm-tints.test.ts`, "palette additions: antique 7, topographic 8, ink & nautical frozen at 5" (its literal pin); `test/site/hero-charts.test.ts` stays green.
   - M68b, `src/render/cvd.ts`: in `washDistances`, `deuteranopia: seen(DEUTERANOPIA)` becomes `deuteranopia: seen(PROTANOPIA)`. Reds this test ("sits 2.340") and "topographic turquoise & magenta collapse under deuteranopia" in the same file.
2. **Row 2**, `test/render/og-stamp.test.ts`, "src/static/og.png is the card at scale 1, OG_WIDTH by OG_HEIGHT pixels, so a regeneration at another scale fails".
   - Asserts: the PNG signature, "IHDR" at bytes 12 to 16, then the header's width and height equal `OG_WIDTH` and `OG_HEIGHT`.
   - M2, the committed file, local only: `node -e 'const fs=require("node:fs");const f=process.argv[1];const b=fs.readFileSync(f);b.writeUInt32BE(2400,16);b.writeUInt32BE(1260,20);fs.writeFileSync(f,b)' src/static/og.png` writes the header a scale-2 regeneration gives and leaves the stamp; `npm test -- test/render/og-stamp.test.ts` reds this test alone (3 pass, 1 fail); `git checkout -- src/static/og.png` restores it. The same red came from the real scale-2 raster stamped as the script stamps it (`out/1316-dry-run/1316-og-mutant-scale2.log`).
3. **Row 25**, `test/prospect/input.test.ts`, "a settlement on unclaimed land reads realm -1, with no realm name and no arms".
   - Asserts: seed 1's settlement 0 is claimed, then with its label set to -1 it reads realm -1, name null, arms null.
   - M25, `src/prospect/input.ts`: `const realm = world.realms.labels[s.x + s.y * elev.w] ?? -1;` becomes `const realm = Math.max(0, world.realms.labels[s.x + s.y * elev.w] ?? -1);`. Reds this test alone.
   - Named equivalent, not a hole: deleting the two `realm >= 0 ?` guards (`realmName: world.names.realms[realm] ?? null`, `arms: world.arms[realm] ?? null`) keeps the test green, since index -1 of either array is undefined and reads null anyway (measured green).
4. **Row 86**, `test/render/voyage-tour.test.ts`, "refineTour: the fresh nearest-first start must win by more than the tolerance, so a tie keeps the given order's refinement".
   - Asserts: the two cycles tie, an exact tie keeps the given order, the nudged nearest-first cycle is cheaper, and a win inside the tolerance keeps the given order.
   - M86a, `src/render/voyage-tour.ts`: `return cost(fromNearest) < cost(fromGiven) - EPS ? fromNearest : fromGiven;` becomes `return cost(fromNearest) <= cost(fromGiven) ? fromNearest : fromGiven;`. Reds this test alone, on "an exact tie keeps the given order".
   - M86b, same line: becomes `return cost(fromNearest) < cost(fromGiven) ? fromNearest : fromGiven;`. Reds this test alone, on "a win inside the tolerance is a tie too".
5. **Row 99**, `test/society/names.test.ts`, "the Roman-numeral fallback skips the near-dup screen but keeps the English-word screen, whatever slot asked".
   - Asserts: three of the four bases are blocklisted; the first two `bare` names are "Boan" and "Boan II"; the settlement names reach the fallback; no fallback base is blocklisted.
   - M99a, `src/society/names.ts`: delete the line `      if (ENGLISH_BLOCKLIST.has(base.toLowerCase())) continue;` in the fallback loop. Reds this test alone, on the "Boan II" assertion.
   - M99b, same line: becomes `      if (standalone && ENGLISH_BLOCKLIST.has(base.toLowerCase())) continue;`. Reds this test alone, on the last assertion (a suffixed slot's fallback took a blocklisted base).
   - M99c, same line: becomes `      if (ENGLISH_BLOCKLIST.has(base.toLowerCase()) || isNearExisting(base.toLowerCase(), usedBases)) continue;`. Reds this test alone, on the "Boan II" assertion.
6. **Row 131**, `test/site/voyage-tour-order.test.ts`, "#373 the job carries the straight-line port set, the capital first, since refineTour holds its first port as the start".
   - Asserts: one job; its first port is the manifest capital's `idx`; its ports equal the straight-line plan's.
   - M131, `src/site/explorer/tour-order.ts`: `.runJob({ kind: "tour", seed, sites, survey, ports })` becomes `.runJob({ kind: "tour", seed, sites, survey, ports: [...ports].reverse() })`. Reds this test alone ("25 !== 0").

## Order of commits

Branch `chore/1316-keeper-tests`. Each commit ends with the three-line trailer `CLAUDE.md`'s Process section gives (`Drafted-By: vellum-implementer (<model id>)`, `Co-Authored-By: Claude <noreply@anthropic.com>`, `Claude-Session: https://claude.ai/code/session_01DktzEshn5JpSVEUsm6E2hY`).

1. `#1316 The dark olive's test, red against a stub of the per-view distance it reads`: `handbook/plans/1300/1316/1316-tests-plan.md`, Files 2's commit 1 edit (the stub), and Files 3. Run `npm test -- test/render/cvd.test.ts`: exactly the new test fails, on its second assertion, with "sits 0.000". Push.
2. `#1316 cvd.ts reports each simulated view's distance, so the olive's deuteranopia margin is read rather than inferred`: Files 2's two commit 2 edits. Run the row 68 evidence (Evidence 2).
3. `#1316 Five keeper facts get the tests that hold them: the card's scale, the unclaimed realm, the strict tour win, the fallback's screens and the tour job's ports`: Files 4 to 8. Then the red step of each (call C2): M2, M25, M86a, M99a and M131, one at a time, each restored before the next.
4. After the pull request opens: `#1316 The namer's last-resort name escapes the English-word screen: one errata row`: Files 9, with the pull request's number and the date.

Then step 11 (the prover on commit 3's sha, the list in Tests), step 12, step 13, commit 4, step 14.

## Rosters and doctrine

- No list is joined. `SOURCE_READS` takes no entry: the only file a new test reads is `src/static/og.png`, which `isSource` does not name.
- No spec, gate or agent line is contradicted. The surviving comment in `createWalkLeg` (`src/render/voyage-route.ts`) stands as it is (Row 81).
- `src/render/cvd.ts` gains three exports; each has a second reference: `washDistances` and `CONFUSABLE_DE` are read by `washesConfusable` and `washConflictMatrix` in the same file and by the new test, and `WashDistances` is `washDistances`'s return type.

## Evidence

1. Each edited test file alone, green: `npm test -- <file>` for the six files. The planner's dry run gave og-stamp 4 pass, input 8, cvd 6, voyage-tour 16, names 13, voyage-tour-order 19, each 0 fail (`out/1316-dry-run/1316-dry-run-run.log`, which also carries the dropped row 135's file, not built).
2. Row 68 moves no chart byte: `npm test -- test/site/hero-charts.test.ts`, `npm test -- test/world/golden-seed42.test.ts` and `npm test -- test/render/realm-tints.test.ts`, each green after commit 2. Name these in the pull request body as the "no regen owed" commands (Gate 6 item 7).
3. `npm run check`, `npm run lint`, `npm run format:check`, each exit 0.
4. `pgrep -fl scripts/unit-suite.ts` prints nothing, then `npm test`, then `npm run astro:generate`. Paste the pass count.
5. `vellum-guard-prover` on commit 3's sha with every mutation in Tests; M2 runs locally. A mutation that does not red its named test, or reds an unnamed one, is a stop condition.
6. No e2e suite is run locally: no browser check changes. CI runs the lanes. `vellum-plate-reader` is not owed (no presentation change). `vellum-pr-skeptic` runs cold.
7. `gh pr view <N> --json closingIssuesReferences` lists exactly Issue #1316.

**What the planner measured**, at `581d37d4`, in its tree (the probes and logs are in `out/1316-dry-run/`, which the dispatcher copies to the main checkout's `out/`):
- `node out/1316-dry-run/1316-dry-run.ts check` (log `1316-dry-run-check.log`): every edited copy lints with `eslint --max-warnings 0` and is unchanged by `prettier`, except `test/render/cvd.test.ts`, whose lint cannot resolve the new exports while `src/render/cvd.ts` on disk lacks them. With the refactored `cvd.ts` placed in the tree for one read and restored at once (`git status --porcelain` empty after), that copy lints clean (`1316-cvd-lint-resolved.log`). `tsc --noEmit` over the six other copies (`tsconfig.1316.json`, the dropped row 135's copy among them) and over the cvd copy with the refactor placed (`tsconfig.1316-cvd.json`) exits 0.
- `node out/1316-dry-run/1316-dry-run.ts run`, `stub` and `mutate` (logs as named in Tests): every test green, the stub red on the one assertion, and every mutation red only where Tests says.
- `node out/1316-dry-run/1316-stub-check.ts` (log `1316-stub-check.log`): commit 1's `cvd.ts` lints clean and is unchanged by `prettier`. `node out/1316-dry-run/1316-plan-blocks-check.ts <this plan>` (log `1316-plan-blocks-check.log`): each of the plan's code blocks stands byte for byte in the measured copies or the stub (which carries the original `washesConfusable`). `node out/1316-dry-run/1316-commit-sequence-check.ts` (log `1316-commit-sequence-check.log`): Files 2's commit 1 and commit 2 edits, applied in order to `src/render/cvd.ts` at `581d37d4`, give the final copy byte for byte.
- `node out/1316-dry-run/1316-cvd-dump-compare.ts` (log `1316-cvd-dump-compare.log`): every conflict-matrix bit of all four styles at both wash opacities, and `washesConfusable` at thresholds 1, 2, 2.5, 3 and 4, is identical at HEAD and with Files 2 staged (48 lines, `identical: true`).
- `node out/1316-dry-run/1316-olive-probe.ts` (log `1316-olive-probe.log`): olive against ochre at 0.11 reads normal 3.128, deuteranopia 2.857, protanopia 2.340, `washesConfusable` true; the olive's channels scaled by 1.6 (`#98ab4a`) read deuteranopia 0.145.
- `node out/1316-dry-run/1316-og-scale-probe.ts` (log `1316-og-scale-probe.log`): the committed PNG and a scale-1 raster are 1200x630, a default-scale raster 2400x1260. `node out/1316-dry-run/1316-og-mutant.ts` (log `1316-og-mutant.log`): the default-scale raster stamped as `scripts/build-og.ts` stamps carries the committed PNG's stamp exactly. Over that mutant and over the header-patched one, placed at `src/static/og.png` for one run each and restored (sha256 equal to HEAD's after), only the new test reds (`1316-og-mutant-scale2.log`, `1316-og-mutant-ihdr.log`).
- `node out/1316-dry-run/1316-roads-realm-probe.ts 1 40 drop` (log `1316-roads-realm-probe.log`): 0 of 1025 settlements unclaimed, 0 of 28651 road steps skipping a cell, no landmass holding two road networks, seeds 9 and 17 carrying one network across landmasses, and with every other interior road cell dropped the fixture seeds degrade 21, 22, 16 and 22 of 24 legs. Twelve seeds take 4.48 s (`1316-roads-12.time`).
- `node out/1316-dry-run/1316-run-mutations.ts` (log `1316-run-mutations.log`): the row 81 sources mutated through the hook red the two existing tests the Row 81 design names.
- `node out/1316-dry-run/1316-names-count.ts` (log `1316-names-count.log`): ten names a seed over seeds 1 to 20 gives 160 Roman-numeral fallbacks of 200 and no last-resort name; twelve gives 180 of 240 and 20 last-resort names.
- One probe ran while another lane's unit suite was running (the row 68 byte checks, `1316-run-mutations-row68.log`); its readings are pass and fail counts, which load does not move.
- UNVERIFIABLE at planning: the full `npm test` and `npm run check` over the edited tree, since the planner edits no source; the first runs are the implementer's, and a red is a stop condition.

## Calls made

The implementer copies these into its step 12 comment.

- **C1. Each test goes in the file that already holds its subject and helper**, so no helper is copied and no new test file is named (`vellum-footguns` Gate 1 item 8; Issue #1317 and Issue #1318 removed such copies).
- **C2. A test of behaviour that already ships takes its first mutation as its red step**, run after the commit and restored with `git checkout -- <file>`, since no stub of the right shape and wrong behaviour exists for code already written (the first plan's call 9 is the model); row 68's new export does take a stub (workflow step 8).
- **C3. Row 131 stays a test row.** What the job carries is recorded and never asserted, so no existing assertion fails when it is wrong (the first plan's call 1: a test pins a fact when its assertion fails if the fact stops being true); measured, M131 reds only the new test.
- **C4. Row 2 reads the PNG header as `test/render/favicon.test.ts` does**, with the signature and the chunk type asserted before the size is read (Gate 1 item 4, Gate 7 item 1), and not through `decodePng`, which throws on the browserless mutant; it compares with `OG_WIDTH` and `OG_HEIGHT`, the code the file must agree with (`handbook/specs/check-placement.md`, the bullet on reading a file as data).
- **C5. Row 2 lands in `test/render/og-stamp.test.ts`**, beside the stamp test, since the stamp says which card the PNG is and the size says at which scale.
- **C6. Row 25's fixture is a staged label** on seed 1's settlement 0, since no generated settlement stands unclaimed (0 of 1025 over seeds 1 to 40); deleting the `realm >= 0` guards is named as an equivalent mutant so the prover's survivor is not read as a hole.
- **C7. Row 86 holds an exact tie and a win inside the tolerance**, since each mutation reds only one of them.
- **C8. Row 99's floor is `> 0`, a witness that the fallback is reached and not a bound**; ten names a seed keeps the fixture clear of the last-resort line.
- **C9. The last-resort name row 99's fixture exposed is a sibling defect, recorded as one `handbook/errata/engine.md` row at low confidence** (workflow step 15; `handbook/errata/README.md`), since this pull request did not cause it and the shipped cultures were not measured for reaching it.
- **C10. Row 68's witness hex is built and says so**, since no record names the olive PR #111 rejected; the 0.11 wash is written as the sibling tests in `test/render/cvd.test.ts` write it; and the test asserts deuteranopia alone, the fact's own claim and the ruling's.
- **C11. No comment is added**: each test's name and messages are its record (`CLAUDE.md`, the comment rule).
- **C12. This pull request closes Issue #1316**, since ruling 3 kept it open only until these tests land and ruling 6795682892 settled which: the body's closing line is `Closes #1316`.

## Rulings

Ruled by Alex on 2026-11-11, posted at https://github.com/ahl-gram/Vellum/issues/1316#issuecomment-6795682892, re-taking parts of ruling 3 (comment 6791901626) where its premise measured false. The menu offered, for each item, the option ruled here and the ones set aside:

1. **Row 68: a test, for deuteranopia only**, with `src/render/cvd.ts` exposing each view's distance and no chart moving. Set aside: the fact back as a comment line at the palette, and dropping it.
2. **Row 81: no new test**; the two existing tests that fail when the road network breaks are the record. Set aside: a direct test over twelve worlds.
3. **Row 135: dropped**, no fast test; RA2 keeps the far end. Set aside: a fast test of both ends, and of the early end only.

## Open decisions

none

## Stop conditions

Hand back, with the row and the command's output, when:

- an anchor or an import line named in Files does not occur exactly once at the commit you build on;
- `git diff --stat 581d37d4 origin/main --` over `src/render/cvd.ts`, `src/render/style.ts`, `src/render/og-card.ts`, `src/static/og.png`, `scripts/build-og.ts`, `src/prospect/input.ts`, `src/render/voyage-tour.ts`, `src/society/names.ts`, `src/site/explorer/tour-order.ts`, `src/site/explorer/tour-job.ts`, `test-support/seed-worlds.ts`, `test-support/living-chart-hosts.ts` and the six test files prints any change;
- a planned test is red at its commit, other than commit 1's one red;
- commit 1's run reds anything other than the new test's second assertion;
- a mutation in Tests does not red its named test, or reds a test not named for it;
- commit 2 reds any existing test, `test/site/hero-charts.test.ts` and `test/world/golden-seed42.test.ts` included;
- `npm run lint` reds a planned line (Issue #1329's rule, if it has merged, included), or `npm run format` changes one: do not reword it;
- `npm test` or `npm run check` reds anywhere;
- `gh pr view <N> --json closingIssuesReferences` does not list exactly Issue #1316;
- the issue carries a comment newer than the 9 counted here, other than a `Plan archive, not a ruling:` comment.

## Lanes beside this one

- **No file this plan edits is named by another lane's plan or branch.** Issue #1319 (`chore/1319-copy-hunt`) edits `scripts/copy-hunt/`, `scripts/jev/system-one.ts`, `test-support/jev-fakes.ts`, `test-support/copy-hunt-fixtures.ts`, `test/repo/copy-hunt-*.test.ts`, the recon-triage tests and three specs; Issue #1320 edits `scripts/keeper-scan/` and `scripts/comment-judge/`. Issue #1331's revised plan (as the dispatcher relayed it) touches `src/world/region-parent.ts` and its test, `src/core/math.ts`, the Prospect drawing and lettering files, `src/render/layers/glyph-clearance.ts`, the site's address-grammar and ribbon files, `src/world/detail-chain.ts` and `handbook/errata/guards.md`: none is a file this plan edits (`src/render/cvd.ts`, the six test files, `handbook/errata/engine.md`). The one reach between them: row 25's test calls `buildProspectInput` in `src/prospect/input.ts`, which imports `clamp` from `src/core/math.ts`; a fold there that keeps `clamp`'s behaviour leaves the test as it is, and a red in that test after Issue #1331 merges is a stop condition.
- **Issue #1329's lint reads every test file.** Its first-day rows (the main checkout's `out/1315-dry-run/skip-scan-after.log`) name none of the six files here, and no new test has an assertion that can be skipped. If it merges first, `npm run lint` checks them; a red is a stop condition.
- **`handbook/errata/engine.md`** is appended to by any lane that leaves an engine finding. A textual conflict at the end of `## Open` keeps both rows, in pull-request order.
- **Merge order:** none is forced, since no line is shared; were one found, the lower-numbered pull request, this one, merges first.
