# Plan revision 1: Issue #755, pull request 1 of 2: the sea's name kept off the land, the ruin as the ruled still, no key before the founding

**Revision 1 of `handbook/plans/700/755/755-plan.md`** (sha256 119d2642e923393380d7b34538a0263a3174c57daf4c8414275661f6ec36ea0c). **What it changes against that plan:** three things, and nothing else that plan built.

1. **The sea's band (contract item 10, `seaBands`).** The band is no longer three sample rows deep on the premise that the name's capitals stand about 6.4 units tall: its depth is derived from the ink height of the name the dress letters, read by `runBox` (8.194 units above the baseline for every sea name of seeds 1, 7 and 42), which needs four rows from the baseline row up; and the row in front of the baseline must be sea as well, so the shore line cannot run under the name's foot. BW3 gains a land and coast clause, with its witnesses.
2. **The ruin (contract items 5 and 6, `townLayer`).** A ruin keeps the houses the ruled still keeps, chosen on the spike's stream (`spike-ruin:<index>`, a house kept where its draw is under 0.3) and drawn at the still's heights and windows; a standing town is unchanged. BW4 pins Homaitani's four houses. Ruling 1 of comment 7204904697.
3. **The key before the founding (contract item 9, `composeBirdseye`).** No plate before its founding carries a key, so none draws a key panel; a standing plate's key and a ruin's are unchanged. This supersedes the implementer's call 18 there. BW4 asserts it at a capital and a village. Ruling 2 of comment 7204904697.

BE2's geometry pins move at five places and BE3's plate pins at two, each re-pinned to the value this plan reads (Tests). The cause is PR #1498's cold review, Blocking: yes (the band's premise measured false: the name's ink rises 8.19 units while three rows span 7.25, putting land under the name at 6 of 58 named places of seeds 1, 7 and 42), and Alex's two rulings on that review.

**Planned at:** `origin/main` 909fd8b3d146795b9aa240ea76295ba143c27e96 (`git rev-parse origin/main` after `git fetch origin main`); PR #1498's branch `feat/755-birdseye` at 13570fc6fa3c94dd53fa64b96432d75cd6bfd8d5 (`git ls-remote origin refs/heads/feat/755-birdseye`), CI green there; Issue #755 read with `npm run --silent issue -- 755`: **9 comments shown, 0 withheld** (5981204520, 6015582641, 7200007772, 7200399716, 7203257230 the plan's rulings, 7203282488 and 7203282790 the plan's archive in two parts, 7203640690 the implementer's calls 1 to 22, 7204904697 Alex's rulings on PR #1498's review).

**The revision's number.** 1: the branch carries `handbook/plans/700/755/755-plan.md` and no revision (`git ls-tree -r --name-only 13570fc6 -- handbook/plans/700/755/`), main carries no plan for Issue #755 (the same command on `origin/main` printed nothing), and both `Plan archive, not a ruling:` comments name `755-plan.md` (part 1 of 2 and part 2 of 2, one sha256). The branch carries a plan of its own, so this revision is archived beside it, at `handbook/plans/700/755/755-r1-plan.md`, in the first commit its builder makes (`handbook/specs/development-workflow.md`, step 8).

**Rulings:** https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7203257230 (D1 to D6, and the planner's calls 1 to 17) stands as `755-plan.md` folded it. https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7204904697 (Alex, 2026-11-26, on PR #1498's review): ruling 1, "A ruin matches the ruled still. ... Ruins draw from the stream the spike used, so the still stands, and the plan's stream line is corrected"; ruling 2, "A plate before the founding carries no key panel, as the ruled still shows. ... the still is the decision"; and the review's blocking finding needs no new ruling, "since D6 already says the sea's name never covers land". The implementer's calls 19 to 22 (comment 7203640690) stand; its call 18 is superseded before the founding by ruling 2 and call 28 below. This revision's own calls are 23 to 35 under Calls made, for Alex to see at this STOP and overrule.

**Session link for the commit trailers and the PR footer** (`CLAUDE.md`, Process, the attribution bullet): https://claude.ai/code/session_01DktzEv7Kj8HRFCw9fco5Yv

**Open decisions: none.** D7 is ruled (a), the houses only, by Alex on 2026-11-26 (https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7206048362), which is the plan as written; the record of it is under Open decisions below.

**Where the readings are.** Every probe this plan quotes is under the planning tree's `out/755-r1/` with its log beside it, and the before and after plates under `out/755-r1-plates/` with their notes; the dispatcher copies both to the main checkout's `out/755-r1/` and `out/755-r1-plates/` when it retires the tree. Each ran at 13570fc6 on darwin arm64, Node v26.13.1. `out/755-r1/staged.ts` stages this revision over the build without editing a source file: it takes the build's own `composeBirdseye` output and replaces the sea's bands, a ruin's house items and the key before the founding as this plan specifies them, then quantizes the whole again; its control, the build's own three-row bands staged the same way, reproduces the build's geometry byte for byte at all 91 standing places of seeds 1, 3, 7 and 42 (`node out/755-r1/pins.ts`, `pins.log`, first line).

**The dry run.** The code and the tests below were also written, as this plan gives them, into a copy of `src/`, `test/prospect/` and `test-support/` at 13570fc6 under the planning tree's `out/755-r1/dry/` (nothing under the tree's own `src/` or `test/` was touched), and run there: the type check over the bird's-eye, its dress and both test files exits 0 at the commit 1 state and at the commit 2 state (`node /Users/ahl/CodeProjects/Vellum/node_modules/typescript/bin/tsc -p out/755-r1/dry/tsconfig.json`, `dry-tsc-commit1.log`, `dry-tsc-commit2.log`); the house's prettier (`--config prettier.config.ts --ignore-path /dev/null`) finds all seven files formatted (`dry-prettier.log`); at the commit 1 state the world file reds on exactly BW3's "seed 1 index 3: the sea's name lies on land" and BW4's "no key before the founding" and the pin file is green (`dry-test-commit1.log`, `dry-test-commit1-be.log`); at the commit 2 state, with the table's sums, both files are green, 5 of 5 each (`dry-test-commit2.log`, `dry-test-commit2-be.log`); six of the Tests line's mutations, each applied and restored by `node out/755-r1/dry-mutate.ts`, red on exactly the assertion named (`dry-mutate.log`); the six plates the dry build draws are byte for byte the staged ones, arms on (`dry-plates-cmp.log`); and the dry build's land census and ruin comparison print what Evidence expects (`dry-land-census.log`, `dry-ruin-equal.log`). The lint was not run on the drafts, since its rules read real paths under `src/` and `test/`: UNVERIFIABLE, and a stop condition below.

## Recon, folded in

`vellum-spec-recon` ran on the hand-back at 13570fc6 (its triage at 13570fc6: 29 claims, 12 asked, 12 answered; claims file `out/755-recon/claims.jsonl` in the planning tree): 20 ledger rows, **16 CURRENT, 4 STALE, 0 UNVERIFIABLE**, one sub-claim of a STALE row left UNVERIFIABLE (below). CURRENT, among them: `SEA_BAND = 3` at `names.ts` line 130 and `seaBands` at 132, `KEY_ENTRIES` at 13, `TAG_LIFT` at 15, `planKey` at 81; the key's `.filter` at `compose.ts` line 50, `.slice(0, KEY_ENTRIES)` at 51, `seaBands(w)` at 83; the ruin's fork and its `< 0.7` drop at `town.ts` lines 68 and 71, and the interleaved draws after the sort; the spike's `spike-ruin:${plan.index}` fork kept under 0.3 (`out/755-spike/town-layer.ts` lines 107 and 108) and its heights drawn before any window (line 128); `seaNameAt` at size 9, italic, anchor middle, spacing 3, seated only inside a band's x range (`compose-c.ts` lines 106 and 107); the strips stroked 0.6 and the coast `stroke(e, 0.9)` (`birdseye-land.ts` lines 30 and 36); `runBox`, `SAMPLE_STEP`, `SY`, `insideRing`, `ringArea`, and `ceil` in `EXACT_MATH`; BW3 with no land clause; the eleven pinned sums; PR #1498's prover and plate reader each one round at f4359ab9; no spec or gate naming the band's rows, the ruin's stream or the key's cap. The four STALE, each folded:

1. **`SEA_BAND = 3` is enough for the name**: three rows span 7.25 units against the name's 8.19. Folded: contract item 10.
2. **The ruin's stream and rule**: the build drops a house under 0.7 on `prospect:<index>:c:ruin`, the spike keeps one under 0.3 on `spike-ruin:<index>`, and the two pick different houses. Folded: contract items 5 and 6, calls 27 and 30.
3. **The key before the founding names the sea and the river** (call 18, BW4's `early.key.length > 0`): against ruling 2. Folded: contract item 9, BW4, call 28. `keyPanel` already draws nothing for no entries (`furniture.ts` line 149).
4. **BW4's six ruin readings** were the old stream's. Folded: retaken on the spike's stream (BW4's readings).

The UNVERIFIABLE sub-claim, inside STALE row 4, the five other ruins' counts on the spike's stream, is measured since (`out/755-r1/ruin.log`). Recon also put four questions as possibly Alex's: the stream's literal name, the ruin's heights, the band's depth, and the sea's name before the founding. Each is taken here as a call, with its rule, for Alex to overrule at this STOP: calls 30, 27, 23 and 24, and 29. The planner found a fifth, which overrides a ratified statement and so is put to Alex: D7, how far "a ruin matches the ruled still" reaches.

## Specs

The implementer reads these first, at these sections, beside what `CLAUDE.md`'s table owes and what `755-plan.md`'s Specs line named:

- `handbook/specs/development-workflow.md`: step 8 (a revision is archived beside the plan it revises, never over it) and step 15 (a guard changed after the prover's one round is proven by the implementer, committed first; a presentation change after the plate reader's one round is measured by the implementer; both named so in the PR body).
- `handbook/specs/conventions.md`: The fidelity rule, its fourth consequence (a ruling made on a rendered preview is a ruling on exactly what it showed).
- `handbook/specs/engine-invariants.md`: Fork derivation (a stream is its seed and its label, so the ruin's houses come back only on the spike's label).
- `handbook/specs/rulebook.md`: Durable engineering constraints, the bullet "Prospect byte pins" (a deliberate change re-pins with its cause named in the commit).
- `handbook/specs/check-placement.md`: The unit suite.

## The design, as revised

### Contract item 10, replaced

**The sea's name is seated clear, on water** (ruling D6 (a)). A band is a run of columns, at one baseline row `j`, where every sample from the row in front of it (`j - 1`, none at the nearest row `j = 0`) up to `deep - 1` rows above it is sea, `deep = ceil(rise / (SAMPLE_STEP * SY)) + 1` and `rise` the ink height of the name above its baseline as the dress letters it (`seaRise`, by `runBox` over `SEA_NAME_RUN`). Every sea name of seeds 1, 7 and 42 rises 8.194 units (`out/755-r1/land.ts`, `land.log`, last line), the row gap is 3.6247 units, so `deep` is 4. The derivation:

- **Above.** A land strip (`landStrips`, `src/prospect/birdseye/terrain.ts`) is drawn between a land row and the row in front of it, so the first land row past the band brings land down to the band's top row, `deep - 1` gaps above the baseline: 10.87 units against the ink's 8.194, which leaves 2.68 units clear, more than the strips' own stroke (0.3 a side) and the coast line's (0.45 a side). Three rows put that land 7.25 units up, under the top 0.94 unit of the letters: the review's six.
- **In front.** The shore line between a land row and the sea row behind it can lie anywhere between the two, so with land in the row directly in front of the baseline the coast line can run under the name's foot (the ink falls 0.10 to 0.22 below its baseline). One row of sea in front puts the shore at least a row gap below the baseline.
- **Scored, slid and avoided as before.** Each run's score is unchanged (`i1 - i0 + 1 - |v - V_NEAR - 4| * 2`, kept above 12, best first), and the dress seats the name on it exactly as `755-plan.md` wrote it (from the run's middle outward a sample column at a time, its box within the run and, padded 2 units, apart from the town's extent, the ships, the neighbours, the key and the bank).
- **What it reads, and what it does not.** The band reads its own columns only, from the row in front of the baseline up. Land lifted by relief from two or more rows in front, and a shore just past the band's first or last column, are not read. Over the census (every harbour place standing at the present year of seeds 1 to 40 and 42) neither comes within 0.45 units of a seated name's ink box (the nearest coast 2.750 units, seed 30 index 11, Krogatgate; no land under any name's box grown by 0.45: `node out/755-r1/seat.ts <seeds 1 to 40 and 42>`, `seat-census.log`). Both blind spots err the same way, toward seating a name too near the land, which is the direction BW3 reads at its places.

Where no band holds the name clear it is left to the key (ruling D6 (a)). The name stands on 57 of the 72 harbour places standing at the present year of seeds 1, 7 and 42 (58 at the build, Cuochican's left to the key), and on 645 of the census's 929 (678 at the build); at none does land lie under it or the coast touch it (`node out/755-r1/land-census.ts`, read over this staging with `STAGED=1`: `land-census-staged.log`), where the build has 74 on land and 24 on the coast (`land-census-build.log`). 46 of the 57 named at seeds 1, 7 and 42 stand at another place than the build's (`out/755-r1/seat-1-7-42.log`).

### Contract item 5, the ruin's line replaced

The composed stream `prospect:<index>:c:ruin` is gone. In its place, **`spike-ruin:<index>`: which lean houses a ruin keeps, the spike's own name kept** (ruling 1: the ruled still was drawn on it, `out/755-spike/town-layer.ts` line 107 in the main checkout). The other streams of item 5 stand.

### Contract item 6, the ruin replaced

**Year-aware, plan year-free.** The era decides what of the standing plan is drawn: before the founding no town and no harbour; a ruin keeps a lean house where its draw from `spike-ruin:<index>` is under 0.3, one draw a lean house in lean order (three in ten, as mock C), with no wall, gate, keep, church or market, its streets, blocks, ground and bridges kept, and its houses' heights and windows drawn as the ruled still drew them (`townLayer`, below); standing, all of it, as before.

### Contract item 9, the key before the founding

**The key** is the plan's, as `755-plan.md` item 9 wrote it, with one change: **before the founding the key is empty** at every place, so no key panel and no key numbers are drawn (ruling 2). A ruin keeps the sea, the river and its bridges, and a standing plate all of it, at most eight, as built.

### The code

**`src/prospect/birdseye/names.ts`.** Two imports: `import { runBox } from "../letter/letter.ts";`, and `SAMPLE_STEP` and `SY` added to the `./window.ts` import, which reads `import { HALF_U, SAMPLE_STEP, SY, V_FAR, V_NEAR, project, sampleAt, toUV } from "./window.ts";`. `const SEA_BAND = 3;` and `seaBands` (lines 130 to 154 at 13570fc6) are replaced by:

```ts
export const SEA_NAME_RUN = { size: 9, italic: true, anchor: "middle", spacing: 3 } as const;

export function seaRise(text: string): number {
  return -runBox({ text, x: 0, y: 0, fill: "none", ...SEA_NAME_RUN }).top;
}

export function seaBands(w: BirdseyeWindow, rise: number): SeaBand[] {
  const deep = Math.ceil(rise / (SAMPLE_STEP * SY)) + 1;
  const open = (i: number, j: number): boolean => {
    if (j > 0 && sampleAt(w, i, j - 1).land) return false;
    for (let k = 0; k < deep; k++) if (sampleAt(w, i, j + k).land) return false;
    return true;
  };
  const out: SeaBand[] = [];
  for (let j = 0; j + deep <= w.rows; j++) {
    // the run loop of lines 139 to 151 at 13570fc6, unchanged
  }
  return out.sort((a, b) => b.score - a.score);
}
```

The comment line in the fence marks where the existing loop body goes and is not written into the file.

**`src/prospect/birdseye/compose.ts`.** The `./names.ts` import gains `seaRise`. The key (lines 49 to 61) is wrapped, its chain unchanged:

```ts
  const key: PlateKeyEntry[] =
    era === "before-founding"
      ? []
      : planKey(world, plan, kind, sea, surroundings.riverName)
          .filter((d) => era === "standing" || d.of === "world" || (era === "ruined" && d.of === "bridge"))
          .slice(0, KEY_ENTRIES)
          .map((d, i): PlateKeyEntry => {
            // the map body of lines 53 to 60 at 13570fc6, unchanged
          });
```

and line 83 becomes `seaName: sea === null ? null : { text: sea.toUpperCase(), bands: seaBands(w, seaRise(sea.toUpperCase())) },`.

**`src/prospect/birdseye/town.ts`.** `type Draft` gains `readonly lean: number` between `key` and `item`. In `townLayer`, the line `const ruin = createRng(plan.seed).fork(\`prospect:${plan.index}:c:ruin\`);` and the `for (const lh of leanHouses(plan, kind))` loop (lines 68 to 84) are replaced by:

```ts
  const lean = leanHouses(plan, kind);
  const pick = createRng(plan.seed).fork(`spike-ruin:${plan.index}`);
  const drafts: Draft[] = [];
  lean.forEach((lh, at) => {
    if (!standing && pick.next() >= 0.3) return;
    const a = to(lh.at);
    const item: TownItem = {
      kind: "house",
      grid: lh.at,
      x: a.x - (lh.w * SX) / 2,
      y: a.y,
      w: lh.w * SX,
      depth: lh.d * SY * 2,
      h: 0,
      window: false,
    };
    drafts.push({ key: a.y, lean: at, item });
  });
```

each landmark draft pushed below gains `lean: -1`, and the draws after the sort (lines 102 to 110) become:

```ts
  const draw = createRng(plan.seed).fork(`mock-birdseye:${plan.index}:land`);
  const heights = standing ? [] : lean.map(() => 2.2 + draw.next() * 1.6);
  const items = drafts.map(({ lean: at, item }): TownItem => {
    if (item.kind === "house") {
      const h = standing ? 2.2 + draw.next() * 1.6 : heights[at]!;
      return { ...item, h, window: draw.next() < 0.6 && h > 3 };
    }
    if (item.kind === "church" || item.kind === "keep") return { ...item, window: draw.next() < 0.6 };
    return item;
  });
```

A standing plate draws exactly as at 13570fc6 (a height then a window per house in plate order, the round's order); a ruin draws every lean house's height first, in lean order, then a window for each kept house in plate order, which is how `out/755-spike/town-layer.ts` drew the still (its line 128, then `houseNodes`'s window draw at `design/town-plans/ccam/direction-c.ts` line 212).

**`src/prospect/dress/compose-c.ts`.** `import { SEA_NAME_RUN } from "../birdseye/names.ts";`, and `seaNameAt`'s `spec` (lines 80 to 90) becomes `const spec = (x: number, y: number): RunSpec => ({ text, x, y, ...SEA_NAME_RUN, fill: e.ink, opacity: 0.8 });`. The lettering reads its spec by field, never by key order (`src/prospect/letter/letter.ts`), so no byte moves: BE3's three standing pins hold (Tests).

**`src/prospect/dress/birdseye-land.ts`.** `export const COAST_WIDTH = 0.9;` above `landNodes`, and the coast's `...stroke(e, 0.9),` (line 36) becomes `...stroke(e, COAST_WIDTH),`. BW3 reads it.

### Alternatives rejected

- **Three rows, as built.** Land under the name at 6 of 58 named places of seeds 1, 7 and 42 and 72 of 678 in the census (`out/755-r1/land.log`, `bands-build-census.log`).
- **Four rows and no row in front.** 652 of the census's 929 named and land under none, but the shore line within its half width of the name's foot at 5 (Qizar, Farairir, Fenielaeglade, Stenernfjord, Loreile; the nearest 0.085 units below the box, Stenernfjord, seed 29 index 8: `bands-rows-census.log`). None of the five is at seeds 1, 7 and 42.
- **A foot clause** (every sample in front of the baseline row in the band's columns projected below the ink's foot, against land lifted by relief). It changes one seat in the census, seed 28 index 7, Skogkogard, and puts land under no name without it (`foot.log`; `NO_FOOT=1 node out/755-r1/bands.ts 28`): a clause with no place where it keeps land from under a name has nothing a test could red on.
- **Testing the name's box against the drawn strips and coast in the dress**, with polygon and segment tests in `src/`. The rows close it by construction from the same samples the strips are drawn from; BW3 holds the drawn land with its own tests.
- **The ruin's houses on the spike's stream at the round's heights.** The same four houses stand at Homaitani, at heights 2.391, 3.356, 2.604 and 2.934 with no window, where the still draws 2.934, 3.356, 2.391 and 3.708 with one (`out/755-r1/ruin.log`, its last two lines).
- **The key in the spike's order** (the cap of eight before the era filter, as `design/town-plans/mock/names.ts` caps). It empties the capital's key at An. 400, as the still, but keeps one at 25 of seed 42's 26 places a year before their founding, among them Lokai at An. 884, "The Great Woaku" and "River Naikai" (`out/755-r1/key.log`).
- **Homaitani's sea name where the still sets it.** Put to Alex as D7, options (b) and (c).

## Files

| path | change |
|---|---|
| `handbook/plans/700/755/755-r1-plan.md` | created: this plan, copied unchanged from the scratchpad (workflow step 8) |
| `src/prospect/birdseye/names.ts` | `SEA_BAND` removed; `SEA_NAME_RUN`, `seaRise(text: string): number` and `seaBands(w: BirdseyeWindow, rise: number): SeaBand[]` as above; about 162 lines after (154 at 13570fc6) |
| `src/prospect/birdseye/compose.ts` | the key empty before the founding; `seaBands(w, seaRise(...))`; about 89 lines (86) |
| `src/prospect/birdseye/town.ts` | the ruin's stream, rule and draw order; `Draft.lean`; about 143 lines (137) |
| `src/prospect/dress/compose-c.ts` | the sea name's spec spreads `SEA_NAME_RUN`; about 202 lines (211) |
| `src/prospect/dress/birdseye-land.ts` | `COAST_WIDTH` exported and used; 103 lines (101) |
| `test/prospect/birdseye-world.test.ts` | BW3 and BW4 rewritten (below); about 250 lines (199) |
| `test/prospect/birdseye.test.ts` | BE2's and BE3's sums re-pinned and their two dated lines rewritten (below); 113 lines |

No file passes 400 lines. No other file changes: no spec, no gate, no roster, no `UNIT_SECONDS` entry (call 32).

## Tests, in the order they are written

Every one a unit test (`handbook/specs/check-placement.md`, The unit suite). **No browser check is planned**, so no ledger line, probe reading or step count is owed. **The prover's round on PR #1498 is spent** (it proved f4359ab9, the PR body's Records line), so every mutation below is proven by the implementer, committed first, and named in the PR body as proven by the implementing session only (workflow step 15). Each test asserts its precondition outside its loops, as before. Each starts red at 13570fc6 on its own assertion with no stub, since the build gets every changed assertion wrong.

**BW3**, `test/prospect/birdseye-world.test.ts`, renamed "the sea's name stands clear of the land, the coast, the town, the ships, the neighbours and the key". The file gains the imports `import type { Pt } from "../../src/prospect/geometry.ts";`, `import { SAMPLE_STEP, SY } from "../../src/prospect/birdseye/window.ts";` and `import { COAST_WIDTH } from "../../src/prospect/dress/birdseye-land.ts";` (`insideRing` is imported already), and, above the test, these helpers, a separating-axis formulation of its own, independent of the code's rows (`vellum-footguns` Gate 1 item 19):

```ts
const touches = (a: Pt, c: Pt, b: Box): boolean => {
  if (Math.max(a.x, c.x) < b.x0 || Math.min(a.x, c.x) > b.x1 || Math.max(a.y, c.y) < b.y0 || Math.min(a.y, c.y) > b.y1)
    return false;
  const side = (x: number, y: number): number => Math.sign((c.x - a.x) * (y - a.y) - (c.y - a.y) * (x - a.x));
  const corners = [side(b.x0, b.y0), side(b.x1, b.y0), side(b.x1, b.y1), side(b.x0, b.y1)];
  return !corners.every((s) => s > 0) && !corners.every((s) => s < 0);
};

const onLand = (b: Box, strips: ReadonlyArray<ReadonlyArray<Pt>>): boolean =>
  strips.some(
    (s) =>
      s.some((p, i) => touches(p, s[(i + 1) % s.length]!, b)) ||
      insideRing({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }, s),
  );

const onCoast = (b: Box, coast: ReadonlyArray<readonly [Pt, Pt]>): boolean => coast.some(([a, c]) => touches(a, c, b));

const inked = (b: Box, raise = 0): Box => {
  const reach = COAST_WIDTH / 2;
  return { x0: b.x0 - reach, x1: b.x1 + reach, y0: b.y0 - reach - raise, y1: b.y1 + reach - raise };
};
```

The test: `const stenernfjord = places(29).find((p) => p.index === 8)!;` and its precondition `assert.ok(stenernfjord.input.harbor && eraFor(stenernfjord.input, stenernfjord.year) === "standing", "seed 29 index 8 is a standing harbour place");`; then the loop runs over `[...SEEDS.flatMap((seed) => places(seed)), stenernfjord]`, skipping as now, `where` written from `p.input.seed` and `p.index`, reading `const { boxes, geometry } = engraveBirdseye(...)`, and before the five clauses it has now it asserts `!onLand(inked(boxes.seaName), geometry.strips)` ("the sea's name lies on land") and `!onCoast(inked(boxes.seaName), geometry.coast)` ("the sea's name touches the coast"). After the loop, `named >= 10` as now, then the witness from the six: seed 1 index 18, Pelo, drawn by `engraveBirdseye`, names its sea (`seaName !== null`), and `onLand(inked(seaName, SAMPLE_STEP * SY), geometry.strips)` holds ("one sample row higher seed 1 index 18's name would lie on land"), which shows the band's top row is what keeps it off.

Readings (`node out/755-r1/bw3.ts`, `bw3.log`; the formulation above, ported into the probe):

- Fixture, this revision staged: BW3's 73 places, the sea named on 57, none on land, none on the coast, none meeting the town, a ship, a neighbour, the key or the bank; Stenernfjord's left to the key. Nearest to failing: the coast 3.036 units from Choican's box (seed 1 index 3), 2.586 past its half width (`seat-1-7-42.log`). The witness: Pelo's grown box raised one row (3.6247) meets one strip, 48.596 square units of it.
- At 13570fc6, before the code: red on "seed 1 index 3: the sea's name lies on land" (the build's seats read so: seeds 1, 7 and 42 put seven names on land by the grown box, Choican and the review's six, and Stenernfjord on the coast; `land-census-build.log`).
- Mutation (the depth): `Math.ceil(rise / (SAMPLE_STEP * SY)) + 1` becomes `Math.ceil(rise / (SAMPLE_STEP * SY))` in `seaBands`. Reading (`SHALLOW=1 node out/755-r1/bw3.ts`, `bw3-shallow.log`): the review's six back on land, the first red "seed 1 index 7: the sea's name lies on land"; nearest to passing, Tzi (seed 1 index 19), 3.452 square units under its grown box.
- Mutation (the row in front): the line `if (j > 0 && sampleAt(w, i, j - 1).land) return false;` deleted. Reading (`NO_FRONT=1 node out/755-r1/bw3.ts`, `bw3-nofront.log`): red on "seed 29 index 8: the sea's name touches the coast", its name seated with one coast segment through its grown box (0.078 units below its ink box, `seat-nofront.log`), and nowhere else.
- Mutation (the avoid list, as `755-plan.md` named it): the avoid list in `engraveC` emptied, the band check kept. Reading retaken on the revised bands (`LIST=1 node out/755-r1/bw3.ts`): the name then stands on 62 places and meets the town, a ship, a neighbour, the key or the bank at 25, among them seed 7 index 0, Numowopua, seven boxes.

**BW4**, same file, renamed "before its founding a place has no town and no key, and a ruin keeps the ruled still's houses and no church or market". In order:

```ts
  const seed42 = places(42);
  const an400 = seed42.find((p) => p.index === 0)!;
  const early = bird(an400, 400);
  assert.equal(early.era, "before-founding");
  const around = plateSurroundings(an400.w, 0, 400);
  assert.ok(
    an400.input.harbor && around.seaName !== null && around.riverName !== null,
    "the capital has a sea and a river a key could name",
  );
  assert.equal(early.town, null, "no town before the founding");
  assert.deepEqual(early.harbour.ships, [], "no ship before the founding");
  assert.deepEqual(early.key, [], "no key before the founding");
  assert.deepEqual(
    engraveBirdseye(an400.w, an400.input, STYLES.antique, 400).boxes.key,
    [],
    "and no key panel on the plate",
  );
  const lokai = seed42.find((p) => p.index === 10)!;
  const unfounded = lokai.input.founded - 1;
  assert.equal(eraFor(lokai.input, unfounded), "before-founding", "seed 42 index 10 a year before its founding");
  assert.deepEqual(bird(lokai, unfounded).key, [], "a village before its founding has no key either");
```

then the six ruins' loop and `assert.equal(ruins, 6, ...)` exactly as at 13570fc6 (the old `early.key.length > 0` and `every((k) => k.x === null)` assertions go), then:

```ts
  const homaitani = seed42.find((p) => p.index === 22)!;
  assert.deepEqual(
    (bird(homaitani).town?.items ?? []).flatMap((i) => (i.kind === "house" ? [{ h: i.h, window: i.window }] : [])),
    [
      { h: 2.934, window: false },
      { h: 3.356, window: false },
      { h: 2.391, window: false },
      { h: 3.708, window: true },
    ],
    "Homaitani's ruin stands the four houses the ruled still draws, at its heights and windows",
  );
```

The four are Homaitani's lean houses 6, 2, 0 and 5, in plate order, read off the staged geometry (`out/755-r1/homaitani.log`) and equal to the spike's replay (`out/755-r1/ruin.log`, its last line) and to `out/755/stills/era-bird-village-homaitani-ruin-antique.svg`, which the spike drew.

Readings:

- Fixture, this revision staged: the six ruins keep 5 of 11 (seed 1 index 14, Xamual), 6 of 15 (seed 1 index 24, Ciaxpec), 3 of 16 (seed 7 index 10, Rakarau), 8 of 23 (seed 7 index 14, Mewohonui), 5 of 15 (seed 42 index 19, Laihoanui) and 4 of 7 (seed 42 index 22, Homaitani), each the count the spike drew (`ruin.log`); nearest to failing "fewer houses", Homaitani, 4 of 7. Over every ruin of seeds 1 to 40 and 42, the staged houses equal the spike's in place, width, depth, height and window: `STAGED=1 node out/755-r1/ruin-equal.ts` printed `compared 82 ruins with the spike's ruin rule; 0 differ` (`ruin-equal-staged.log`), where the build differs at all 82 (`ruin-equal-build.log`). The capital at An. 400 and Lokai at An. 884 carry no key and no key box (`out/755-r1/early.log`).
- At 13570fc6, before the code: red on "no key before the founding" (the build's key there is "The Great Woaku", "The Waters of Lalo": `key.log`).
- Mutation (the key): the `era === "before-founding" ? [] :` branch deleted, the chain kept. Reading (`key.log`, the build's key, which is that chain): red on "no key before the founding", two entries.
- Mutation (the key's order): that branch deleted and `.slice(0, KEY_ENTRIES)` moved before `.filter(...)`. Reading (`key.log`, the spike's order): the capital's key is then empty, and the test reds on "a village before its founding has no key either", Lokai's two entries.
- Mutation (the ruin's stream): `spike-ruin:${plan.index}` becomes `prospect:${plan.index}:c:ruin` (with the keep rule unchanged). Reading (`node out/755-r1/ruin-mutant.ts`, `ruin-mutant.log`): Homaitani keeps one house, lean house 4, so the pin reds; the six keep 3 of 11, 4 of 15, 7 of 16, 8 of 23, 4 of 15 and 1 of 7, each fewer than it had, so the loop passes and the pin alone holds the stream.
- Mutation (the ruin's heights): `const h = standing ? 2.2 + draw.next() * 1.6 : heights[at]!;` becomes `const h = 2.2 + draw.next() * 1.6;` and `const heights = standing ? [] : lean.map(() => 2.2 + draw.next() * 1.6);` becomes `const heights: number[] = [];`. Reading (`ruin.log`, the build's draw order over the same four): heights 2.391, 3.356, 2.604 and 2.934, no window, so the pin reds.
- Mutation (every house kept): `pick.next() >= 0.3` becomes `pick.next() >= 1`. Reading: each ruin keeps all its lean houses, so the loop reds on "seed 1 index 14: the ruin keeps fewer houses (11 of 11)".
- `755-plan.md`'s mutation of `townLayer`'s `if (era === "before-founding") return null;` stands as proven at f4359ab9; the line is unchanged.

**BE2 and BE3**, `test/prospect/birdseye.test.ts`: after commit 2's code, seven sums move and four hold, each to the value `node out/755-r1/pins.ts` read over the staging (`pins.log`):

| pin | at 13570fc6 | revision 1 |
|---|---|---|
| BE2 seed 42 index 0, the present year | 1537141278 | 1537141278 (holds) |
| BE2 seed 42 index 5 | 3863613006 | 1976063743 |
| BE2 seed 1 index 1 | 2533044556 | 519669324 |
| BE2 seed 3 index 19 | 1878659313 | 113286129 |
| BE2 seed 7 index 3 | 2389298156 | 1134327766 |
| BE2 seed 42 index 0 at An. 400 | 1699909873 | 2008551977 |
| BE3 seed 42 index 0 antique | 2795256804 | 2795256804 (holds) |
| BE3 seed 42 index 0 ink | 2164292434 | 2164292434 (holds) |
| BE3 seed 42 index 10 antique | 1059921148 | 1059921148 (holds) |
| BE3 seed 3 index 19 ink | 3891391682 | 2784587357 |
| BE3 seed 42 index 0 antique at An. 400 | 2182953060 | 2459495887 |

The implementer reads each sum off its own build (the test's failure message prints it) and writes it only where it equals this table. The two dated lines become:

- above `GEOMETRY_PINS`: `// Pinned 2026-11-26 on darwin arm64, Node v26.13.1, at e15274f7, and five re-pinned for Issue #755's revision 1 (handbook/plans/700/755/755-r1-plan.md: the sea's band, the ruin's houses, no key before the founding): the composer's geometry for the five places compose-world.test.ts pins and the first of them before its founding, quantized to three decimals inside composeBirdseye; a deliberate change to the composer re-pins these with the cause named in the commit.`
- above `PLATE_PINS`: `// Pinned 2026-11-26 on darwin arm64, Node v26.13.1, at e15274f7, and two re-pinned for Issue #755's revision 1 (handbook/plans/700/755/755-r1-plan.md): armless, since the arms reach Math.cos in src/render/layers/heraldry/charges.ts, which the prospect lint does not read.`

The CI unit run is the moved sums' first linux reading. BE1, BE4, BW1, BW2, BW5 and the even-share test run unchanged; BW5's four plates keep their sea-name seats (`out/755-r1/bw5-seats.log`), so their bytes and thinning do not move.

## Order of commits

On the branch `feat/755-birdseye`, resumed at 13570fc6 (`git fetch origin feat/755-birdseye`, then `git checkout -B feat/755-birdseye origin/feat/755-birdseye`, each its own command).

1. `handbook/plans/700/755/755-r1-plan.md`; `COAST_WIDTH` in `src/prospect/dress/birdseye-land.ts` (no byte moves: BE3's pins pass at this commit); BW3 and BW4 as above. `npm test -- test/prospect/birdseye-world.test.ts` reds BW3 on "seed 1 index 3: the sea's name lies on land" and BW4 on "no key before the founding", and nothing else in the file; `npm test -- test/prospect/birdseye.test.ts` green. Push.
2. `names.ts`, `compose.ts`, `town.ts`, `compose-c.ts`. BW3 and BW4 green; BE2 and BE3 red on the seven sums of the table, re-pinned in this commit to the table's values with the two dated lines, the cause named in the commit message. Both files green. Push.
3. The implementer's proofs of every mutation above, each on a clean tree at commit 2 and restored, nothing committed; then the evidence, the pull request comment and the body edit (Evidence).

## Rosters and doctrine

- **No spec, gate or roster names the band's depth, the ruin's stream or the key's cap** (`git grep` at 13570fc6 outside `handbook/plans/` finds them only in the four source files this plan edits), so none is edited. `handbook/specs/engine-invariants.md`'s harbour bullet, `handbook/specs/chart-dress.md`'s ground and `handbook/specs/rulebook.md`'s byte-pin sentence stand as the build wrote them.
- **The step 12 record**: one new dated comment on Issue #755, never an edit of 7203640690: "Calls made building revision 1 of pull request 1 of 2 (<date>, branch `feat/755-birdseye`), none of them ruled on in the issue. Alex's rulings for this revision are in https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7204904697 and are not restated here. The revision is archived at `handbook/plans/700/755/755-r1-plan.md`. It supersedes call 18 of https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7203640690 before the founding; calls 19 to 22 stand.", then this plan's calls 23 to 35 verbatim, then Alex's ruling on D7 pointed at where the dispatcher posts it, then any the builder adds, numbered on from 36.
- **Issue #796's docket**: one new dated comment adding, as provisional feel rulings, rulings 1 and 2 of comment 7204904697 and this plan's feel calls 24 (a row of open water in front of the sea's name), 27 (the ruin at the still's heights), 29 (an unseated sea goes unnamed before the founding), and Alex's ruling on D7 (the ruin's sea name and ribbon), the contract ones left off.
- **The pull request body** (Gate 5): it names this revision and what it changes against `755-plan.md` (this plan's opening paragraph, in its own words); the Records line names every mutation above as proven by the implementing session only, after the prover's round at f4359ab9, and the land census, the ruin comparison and the six plates as measured by the implementing session only, after the plate reader's round at f4359ab9; the closing line stays the form for a pull request that leaves its issue open.

## Golden and committed charts

Nothing the rulebook guards moves: no committed chart, no `src/static/og.png`, no golden checksum, no E plate pin, no planner pin. The bird's-eye's own pins move as the table says, and only those. No product path calls the bird's-eye yet.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`.
- `npm test -- test/prospect/birdseye-world.test.ts`, `npm test -- test/prospect/birdseye.test.ts`, `npm test -- test/prospect/finished.test.ts`, `npm test -- test/prospect/dress.test.ts`, then `npm test` whole, then `npm run astro:generate`.
- `git diff --stat 13570fc6 -- src/static test/world/golden-seed42.test.ts test/prospect/finished.test.ts test/prospect/compose-world.test.ts test/prospect/dress.test.ts test/prospect/town-plan.test.ts test/site/hero-charts.test.ts` prints nothing.
- Copy the main checkout's `/Users/ahl/CodeProjects/Vellum/out/755-r1/` into the tree's `out/755-r1/` and its `/Users/ahl/CodeProjects/Vellum/out/755-r1-plates/` into the tree's `out/755-r1-plates/` (and `out/755-spike/` as `755-plan.md` said), then, each its own command, from the tree's root:
  - `node out/755-r1/land-census.ts` prints `standing harbour places of seeds 1 to 40 and 42: 929; the sea named on 645; on land 0; on the coast 0` and exits 0.
  - `node out/755-r1/ruin-equal.ts` prints `compared 82 ruins with the spike's ruin rule; 0 differ`.
  - `node out/755-spike/equal.ts` prints `0 differ`, as at 13570fc6 (standing towns unchanged).
  - `node out/755-spike/limit.ts` finds no plate over `BIRDSEYE_LIMIT_KB`.
  - `node out/755-r1/plates.ts out/755-r1-plates built` writes the six plates, and `cmp out/755-r1-plates/revision1-<name>-antique.svg out/755-r1-plates/built-<name>-antique.svg` prints nothing for each `<name>` of `ruin-homaitani`, `an400-laukuwelua`, `an884-lokai`, `sea-pelo`, `sea-cuochican` and `sea-stenernfjord`: the built plates are byte for byte the ones this plan staged.
  - Paste the outputs into one pull request comment with each probe's path (workflow step 10), and name `out/755-r1-plates/` (with its `notes.md`) by absolute path in the report so the dispatcher can copy it across and give it its page.
- E2E suites: none touched.
- `vellum-guard-prover` and `vellum-plate-reader` are not dispatched again: their rounds on PR #1498 are spent (workflow step 15). The implementer proves each mutation of the Tests line and measures the changed plates by the commands above.
- `vellum-pr-skeptic` is not dispatched again by the implementer; whether the review gets another look is the dispatcher's.

## Calls made

Each a decision the issue and the rulings left open, with the rule it was taken on, numbered on from the implementer's 22. The implementer copies them into the step 12 comment.

23. **The band's depth is derived from the name the dress letters**: `deep = ceil(rise / row gap) + 1` rows from the baseline up, `rise` read by `runBox` over one spec, `SEA_NAME_RUN`, that the dress letters the name with, so a change to the name's size changes the band with it. Rule: ruling D6 (the name never covers land) and the review's finding (the band was a guess at the name's height).
24. **The row in front of the baseline is sea too** (none is read at the nearest row), so the shore line never runs under the name's foot. Rule: D6, the land the plate draws including the coast line along it, as the plate reader's own D6 measure counts it (the "on coast line" column of its table A over the build, `out/755-reader/tables.md` in the building tree). Measured: without it the coast line comes within its half width of 5 of 652 census names, the nearest 0.085 units below the box; with it none comes nearer than 2.750. It costs 7 census names (645 named against 652), none at seeds 1, 7 and 42 (57 either way).
25. **"Land" is the land the plate draws: its strips and its coast line, read against the name's ink box grown by half the coast's stroke.** Relief hatching, trees, fields and rivers are drawn over land and may spill past it, and are not land. Rule: D6 read as the drawn land, and the review's finding, which measured the strips.
26. **No foot clause.** Land lifted by relief from further in front is not read by the band. Rule: a clause with no place it changes a name's land is nothing a test can red on (`CLAUDE.md`, Process, "A guard proves it can fail; a scanner proves which way it errs"); the blind spot and its direction are named in contract item 10.
27. **A ruin's houses are the ruled still's in full**: chosen on the spike's stream and drawn at the still's heights and windows (every lean house's height first, then a window for each kept house in plate order), while a standing town keeps the round's draws. Rule: ruling 1 ("a ruin matches the ruled still") and the fidelity rule's fourth consequence; on the spike's stream alone the same four houses would stand at other heights, one window fewer.
28. **No plate carries a key before its founding, at any place**, not only where the cap of eight empties it, as at the capital the still shows. Rule: ruling 2's words, "a plate before the founding carries no key panel"; the spike's order would leave a key at 25 of seed 42's 26 places before their founding. Supersedes call 18 there.
29. **Before the founding a sea is named only where a clear seat on the water holds its name**; with no key, an unseated sea goes unnamed (Laukuwelua at An. 400, as the still; Lokai at An. 884 keeps its name on the water). Rule: rulings 2 and D6 together.
30. **The ruin's stream keeps the spike's name, `spike-ruin:<index>`, in `src/`.** Rule: ruling 1 rules the stream, and a stream is its label (`handbook/specs/engine-invariants.md`, Fork derivation), so no tidier name draws the still's houses.
31. **Stenernfjord, seed 29 index 8, joins BW3 as the witness of the row in front.** Rule: no place of seeds 1, 7 and 42 puts the coast within reach of a name without that row (`seat-nofront.log`), and a guard names the witness that makes it bite (`CLAUDE.md`, Process).
32. **`UNIT_SECONDS` is left as CI last measured it.** Rule: `handbook/specs/site-architecture.md`, the bullet opening "`UNIT_SECONDS` is read from CI's own unit logs" ("a stale value makes CI slower and breaks nothing"); the revision adds one world and a few hundred box tests to the file.
33. **The implementer proves every changed guard and measures the changed plates itself.** Rule: workflow step 15; the prover's and the plate reader's rounds on PR #1498 ran at f4359ab9.
34. **The built plates are held to the planner's staged plates byte for byte.** Rule: "Measure before you assert"; the staging's control reproduces the build exactly, so a plate that differs is a build that differs from this plan.
35. **The implementer's calls 19 to 22 stand as built**; call 18's cap after the era filter stands for a ruin and a standing plate, where it changes nothing. Rule: comment 7204904697 names call 18 alone.

## Open decisions

None. **D7 is ruled (a), the houses only** (Alex, 2026-11-26, https://github.com/ahl-gram/Vellum/issues/755#issuecomment-7206048362). The step 12 and docket comments point at that comment for it. The menu as put follows, for the record.

**D7. How far does "a ruin matches the ruled still" reach?** Ruling 1 says the ruin matches the ruled still, "so the still stands". The plan matches its houses in full. Two things on that still the plan does not match:

- **The sea's name.** The still sets "THE GREAT WOAKU" on the water at Homaitani. The corrected rule finds no water there that holds it clear of the land, so the plan leaves it to the key. Measured by the lettering's box, the review's measure, the still's seat has 28.06 square units of the box over the land fill at its top right and the shore line through its foot (`out/755-r1/homaitani-sea.log`). Read by the letters' own ink, the plate reader found none of it on the land fill or the shore line (its table A over the build, `out/755-reader/tables.md` in the building tree, the same seat).
- **The ribbon.** The still's ribbon reads "ruined An. 1039, founded An. 931". The plan keeps the view from the rise's words for the same place, "founded An. 931, ruined An. 1039" (the planner's call 10, which comment 7203257230 let stand).

Options:

- **(a) Recommended: the houses only.** The ruin stands the still's four houses at its heights and windows. The sea's name follows the rule every plate follows, so at Homaitani it is named in the key alone. The ribbon reads as the view from the rise reads it. Across the 75 ruined harbour places of charts 1 to 40 and 42 the sea is named on the water at 63, never over land or the shore (`STAGED=1 node out/755-r1/ruin-census.ts`, `ruin-census-staged.log`). Still: `/Users/ahl/CodeProjects/Vellum/out/755-r1-plates/revision1-ruin-homaitani-antique.svg` against the ruled `/Users/ahl/CodeProjects/Vellum/out/755/stills/era-bird-village-homaitani-ruin-antique.svg`. This is the plan as written.
- **(b) The houses and the sea's name as the still.** A ruin seats the sea's name by the older, shallower rule the still was drawn with, so Homaitani's name stands where the still has it. That rule names 70 of the 75 ruins, but at 9 of them the name's box lies partly over land, 4 of those also on the shore line (`node out/755-r1/ruin-census.ts`, `ruin-census-build.log`), which the sea-name ruling says never happens. Standing towns keep the corrected rule. Still: the ruled still itself. In the plan: `seaBands` takes the plate's era, and a ruin's band is three rows deep with no row in front; BE2 and BE3 do not move further (their one ruin, seed 3 index 19, is inland).
- **(c) Everything as the still.** As (b), and the ribbon in the still's order, so the bird's-eye and the view from the rise of one ruin word their ribbons differently. In the plan: as (b), and the bird's-eye's ribbon for a ruin written as the spike wrote it (`out/755-spike/compose-c.ts`, its `bandText`); BE3's seed 3 index 19 ink pin moves again.

Comment 7204904697 rules everything else this revision changes: the ruin's houses and the key before the founding, and the review's finding needs no new ruling under D6.

## Stop conditions

- The branch's head is not 13570fc6 when the build resumes: hand back.
- A comment on Issue #755 newer than comment 7206048362 (the D7 ruling), other than a `Plan archive, not a ruling:` comment: hand back.
- A symbol or line is not where this plan names it at 13570fc6: `SEA_BAND` and `seaBands` at lines 130 to 154 of `src/prospect/birdseye/names.ts`, with `KEY_ENTRIES`, `planKey` and its `./window.ts` import at line 8; the key chain at lines 49 to 61 and `seaBands(w)` at line 83 of `src/prospect/birdseye/compose.ts`; `type Draft` at line 23, the `prospect:${plan.index}:c:ruin` fork at line 68 and the draws at lines 102 to 110 of `src/prospect/birdseye/town.ts`; `seaNameAt`'s spec at lines 80 to 90 of `src/prospect/dress/compose-c.ts`; `stroke(e, 0.9)` at line 36 of `src/prospect/dress/birdseye-land.ts`; `runBox` in `src/prospect/letter/letter.ts`; `SAMPLE_STEP` and `SY` in `src/prospect/birdseye/window.ts`; `insideRing` in `src/prospect/town-plan/geom.ts`; `GEOMETRY_PINS` and `PLATE_PINS` in `test/prospect/birdseye.test.ts`: hand back.
- At commit 1, BW3 or BW4 does not red on the assertion named, or anything else in the two files reds: hand back.
- A mutation named does not red on the assertion named: hand back.
- A sum read at commit 2 differs from the table, or a sum the table holds moves: hand back; never re-pin to a value this plan does not name.
- `test/prospect/finished.test.ts`, `test/prospect/dress.test.ts`, `test/prospect/plate-e.test.ts`, `test/prospect/plate-e-world.test.ts` or BW1, BW2 or BW5 reds: hand back.
- `node out/755-r1/land-census.ts` prints a name on land or the coast, or a count other than 645 named of 929; `node out/755-r1/ruin-equal.ts` prints a difference; `node out/755-spike/equal.ts` prints a difference; a `cmp` of a built plate against its staged plate prints anything: hand back.
- `npm run lint` refuses a line under `src/`: hand back. A word-for-word copy it finds in the test's helpers is the implementer's own code to rewrite in other words, keeping the formulation.
- A file passes 400 lines: hand back.
- Any committed chart, `src/static/og.png`, the golden checksum, an E plate pin or a planner pin moves: hand back.
- BE2 or BE3 reds on CI and passes on the Mac: hand back, as `755-plan.md` said.
