# Issue #962 plan: the namer refuses "the" for a base that stands alone

**Planned at**: `origin/main` 2f66e4eef52dc8a5c4c475979080c03f9f11023c; Issue #962 had 2 comments when the plan was finished (`gh api repos/ahl-gram/Vellum/issues/962/comments | jq length`), the two rulings comments below.

**Rulings**: https://github.com/ahl-gram/Vellum/issues/962#issuecomment-6867607134 (Alex, 2026-11-13). Ruling 1, "Block it where it stands alone": "the" is refused only where a base stands alone, and the numbered spare names are left as they are, so "The II" stays possible; the blocklist entry the plan recommended is not built. Ruling 2, "Cheap, rulebook says why": the change lands whenever it is ready, alongside the other lanes, takes no re-roll turn, and the rulebook gains one paragraph saying why world 42 and the saved charts cannot move. A further ruling, https://github.com/ahl-gram/Vellum/issues/962#issuecomment-6867839965 (Alex, 2026-11-13), "Strike it, this change only": the paragraph explains why this change is cheap and sets no standing price, so it does not say a word of its kind takes no re-roll turn; a future word is priced on its own.

**Open decisions**: none.

## Recon (workflow steps 2 and 5)

`vellum-spec-recon` at 2f66e4ee: 12 claims, 9 CURRENT, 0 STALE, 3 UNVERIFIABLE. Nothing in the issue is stale. The plan settles the three UNVERIFIABLE rows by measurement:

- "the Issue #851 spike stills show it on the round shape at seed 30": reproduced. `defaultRecipe(30, { outline: "round" })` names its sea "The Sea of The" today and "The Sea of Thoth" with the fix staged (`node out/962-dry-run/seed30-round.ts` under each arm).
- "plain worlds never produced it over seeds 1 to 400": true of the sea name "The Sea of The" itself, whose first plain world is seed 557; false of the defect, which reaches 13 plain worlds in 1 to 400 (seeds 27, 30, 44, 79, 102, 103, 144, 207, 236, 380 and 387 in a name on the chart, seeds 19 and 97 in a former name the renamer dropped).
- "either fix may move world identity and the golden": it moves world identity on 68 of 2000 worlds and never seed 42 or the golden (below).

Recon's two notes: the blocklist also guards the numbered fallback, which ruling 1 leaves as it is; and the existing blocklist test reads the list as its own oracle, so it cannot be the guard (T1 names the word itself).

## Specs

Read these before the build, on top of what `CLAUDE.md`'s spec table owes for the work:

- `handbook/specs/rulebook.md`: The cost axis and ordering principle; Golden and committed-chart discipline, the bullet opening "A seed re-roll" and the list opening "Some levers are golden-safe by construction"; The re-roll flight-exclusion set.
- `handbook/specs/engine-invariants.md`: Fork derivation ("The hazard is inserting a draw mid-fork"), which is why one refused "the" moves every later name on its namer.
- `handbook/specs/check-placement.md`: The unit suite.
- `handbook/specs/conventions.md`: How a spec, and the rest of the house's prose, is written; How code is cited (for the rulebook paragraph).
- `handbook/specs/development-workflow.md`: steps 8, 11 (the still judge's comparison), 12.
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 and Gate 6.

## What was measured

All of it at 2f66e4ee, on the planner's tree, with each candidate staged by a Node load hook that rewrites `src/society/names.ts` as it loads (`out/962-dry-run/arm-hooks.ts`), so no source file was edited. `BX` is the ruled build exactly as this plan writes it; `A` the blocklist entry; `B` the same screen as `BX` written with a literal; `BXM3` mutation M3 below. Probe folder: `out/962-dry-run/` (the dispatcher copies it to the main checkout's `out/`). Commands, each from the tree root:

- Today's namer over seeds 1 to 2000: `ARM_962=control node --import ./out/962-dry-run/register.ts out/962-dry-run/sweep.ts 1 1000 out/962-dry-run/control-1.jsonl` and the same for 1001 to 2000; summary `node out/962-dry-run/analyze.ts control out/962-dry-run/control-1.jsonl out/962-dry-run/control-2.jsonl` (in `out/962-dry-run/control-summary.txt`).
- The ruled build and today's namer over the 165 seeds of `out/962-dry-run/bx-seeds.json` (every flagged seed, every seed with only a glued "the", seeds 1, 5, 7, 42, 100, 777, 30 seeds with no "the", the gallery's twelve, the e2e days 20261005, 20261006, 20261007 and 20261105, 526413615, and the quoted seeds 0, 2024 and 20260622): `ARM_962=BX node --import ./out/962-dry-run/register-sync.ts out/962-dry-run/sweep.ts 0 0 out/962-dry-run/armBX.jsonl out/962-dry-run/bx-seeds.json`, the same with `ARM_962=control` into `control-bx.jsonl`, diffed by `node out/962-dry-run/analyze.ts diff out/962-dry-run/control-bx.jsonl out/962-dry-run/armBX.jsonl` (`out/962-dry-run/armBX-diff.txt`).
- The unit suite with the ruled build staged: `ARM_962=BX NODE_OPTIONS="--import <tree>/out/962-dry-run/register-sync.ts" node scripts/unit-suite.ts` (log `out/962-dry-run/unit-armBX.log`).
- The planned test file, built by `node out/962-dry-run/make-candidate-b.ts` as `out/962-dry-run/names.test.candidate-b.ts`, run under each arm with `ARM_962=<arm> node --import ./out/962-dry-run/register-sync.ts --test out/962-dry-run/names.test.candidate-b.ts` (log `out/962-dry-run/candidate-b-arms.log`), counted by `out/962-dry-run/planned-tests-b.ts` (log `planned-tests-b.log`), linted with `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 --stdin --stdin-filename test/society/names.test.ts` (exit 0), checked against `npx prettier --stdin-filepath test/society/names.test.ts` (no difference), and type-checked with `npx tsc --noEmit -p out/962-dry-run/tsconfig.candidate.json`, a config extending the root `tsconfig.json` over that one file (exit 0; `--listFilesOnly` shows it read the file and `src/society/names.ts`).
- The ruled `src/society/names.ts`, written out as `out/962-dry-run/names.bx.ts`, linted the same way under its own name (no finding but the deliberately lowered `max-lines` that prints its count) and unchanged by Prettier.

What they printed:

| reading | value |
|---|---|
| cultures whose sounds can spell "the" | `thalassic`, `sylvan`, `draket` (onset `th`, nucleus `e`, empty coda); 596 of the 2000 worlds |
| worlds whose namer took "the" for a base that stands alone today | 75 of 2000; 61 show it (seed 557's sea "The Sea of The", seed 415's capital "The", seed 1718's title "The Realm of The", seed 1116's title "The, the Whispering Isle", seed 30's "Lake The", seed 558's "Fair The", seed 44's "The Black The", a surveyor "The the Wayfarer", and three forests named "The Forest", which reads as plain English); 14 drew it as a former name or a sea beast's name that the asking code then dropped and drew again (`out/962-dry-run/who-drew.log`) |
| worlds whose names change under the ruled build | 68 of 2000 (inside the flagged set, as the mechanism says); 1 to 47 names each, median 23, which is median 49% of that world's names, because every name drawn after the refused "the" on that namer moves |
| the ruled build against the blocklist entry | identical on all 164 seeds both were run on: the numbered fallback met "the" on 0 of 2000 worlds |
| land, towns' places, roads, realm partition | unchanged on every arm and every seed measured (`groundDigest`) |
| seed 42 | unchanged; by construction, since `oromi` has no `th` onset and no nucleus starting `h`, so no `oromi` world can move |
| the gallery (seed 100 then steps of 7919, twelve worlds) | none move |
| e2e worlds | 1, 5, 7, 42, 100, 777, 20261007 (the hunt's day), 20261105, 526413615 unchanged; 20261005 (`FIXED_SEED`, every chart room's default world in the harness) moves 13 names: the sea "The Dogat Maw", the range, the forest, all three realms and seven rivers, one of them "The Black The"; its title, capital, towns and year stay; 20261006 (`COLLIDED_2026_10_06` in `e2e/suites/stage/desk.ts`) moves 33 of 56 names, while the two lines the Print Room's folio prints from it (title, and "in the year 1147 of the Ember Age") stay |
| strings that move, named by any check or page | the 1363 names of four letters or more that the fix changes on any measured seed, in `out/962-dry-run/moved-names.txt` (`node out/962-dry-run/moved-names.ts`), grepped with `git grep -n -F -w -f out/962-dry-run/moved-names.txt -- . ':!handbook/plans' ':!design'`: every hit is a word that only shares the spelling (`Bare` as a type name, `Sine`, a real place "Mara" or "Novo Selo" in the gazetteer, chart 7's "Mara", seed 7 being unchanged); the frozen rounds under `design/` quote some (seeds 27, 52, 79), and stay as the archive keeps them |
| seeds quoted on an authored surface or in a spec | 0, 2, 7, 11, 29, 36, 42, 90, 400, 2024, 20260622 (`git grep -h -o -E "(seed[= ]|#seed=|Chart № |chart-)[0-9]{1,10}" -- src/pages src/site src/layouts README.md handbook/specs`): none moves |
| unit suite with the ruled build staged | 4043 of 4043 pass, so no unit pin moves; the hook logged loading `src/society/names.ts` as the ruled build 192 times, once in each test process that imports it (`out/962-dry-run/propagation-bx.log`) |
| unit suite with the blocklist entry staged (before the rulings) | 4042 of 4043 pass; the one red, `test/cli/raster.test.ts` (Brave's headless teardown watchdog under load), passes alone with it staged and alone under today's code (`out/962-dry-run/unit-armA-raster.log`, `unit-control-raster.log`); `test/world/golden-seed42.test.ts`, `test/world/covenant-seed42.test.ts`, `test/site/hero-charts.test.ts` and `test/site/primer-ladders.test.ts` pass with the hook logged loading `src/society/names.ts` in each test process that imports it (`out/962-dry-run/propagation-seed42.log`) |
| what the probe cannot see | a test that reads a page Vite builds reads names.ts from disk, not through Node's loader, so it ran today's namer; and a child spawned with a scrubbed environment ran without the hook. Neither changes the reading: the built pages carry seed 42 and the gallery's twelve, none of which moves |

What it costs, by the rulebook's axis, as ruling 2 prices it: no golden re-pin, no regen (`test/site/hero-charts.test.ts` green re-renders the committed `chart-42-*` and `arms-42-*`), no committed file moves, the Primer's ladders and the gallery stand, and no re-roll turn is taken. World identity moves on about 1 world in 30.

## The design

In `src/society/names.ts`, a module constant `ARTICLE` holds `"the"`, and `baseRejected` refuses a base that stands alone when it is `ARTICLE`, beside the blocklist test it already makes for such a base:

```diff
@@ -82,6 +82,8 @@ export const ENGLISH_BLOCKLIST = new Set<string>([
   "bra",
 ]);
 
+const ARTICLE = "the";
+
 function isShortPrefix(a: string, b: string): boolean {
@@ -312,7 +314,7 @@ function baseRejected(s: string, suffix: string, standalone: boolean, usedBases:
   const stem = s.toLowerCase();
-  if (standalone && ENGLISH_BLOCKLIST.has(stem)) return true;
+  if (standalone && (ENGLISH_BLOCKLIST.has(stem) || stem === ARTICLE)) return true;
   return isNearExisting(stem, usedBases);
```

Nothing else changes. A base stands alone where `baseRejected` is called with `standalone` true: an unsuffixed settlement, a `bare` name, and every template slot `isStandaloneSlot` reads as standalone. The base maker then draws again, as it does for a blocklist word. Every namer a world runs (`createNamer` in `src/world/generate.ts`, the title and surveyor namers in `makeMapTitle`, `conjureBestiary` in `src/society/bestiary.ts`, `assignFormerNames` in `src/society/renames.ts`, `hamletName` in `src/society/hamlets.ts`) goes through that base maker and takes the screen with no edit of its own.

Two paths keep "the", as ruled: a glued slot ("The %water" gives "The Thewater", a suffixed town "Themere"), which reads as a word; and the Roman-numeral fallback in `createBaseMaker`, which reads `ENGLISH_BLOCKLIST` alone, so "The II" stays possible (ruling 1). `ENGLISH_BLOCKLIST` is not edited.

### Alternatives rejected

- **"the" in `ENGLISH_BLOCKLIST`** (the plan's first recommendation): ruled out by ruling 1. It would also have screened the numbered fallback; on every world measured the two come out the same.
- **"Screen articles in the standalone check" read literally, inside `isStandaloneSlot`.** Not buildable: `isStandaloneSlot` reads the template before any base is drawn and never sees the base. The ruled build checks one step later, in `baseRejected`, which is where "stands alone" is known.
- **A side fork for the replacement**, so a refused "the" is replaced from `rng.fork("article")` and the main stream keeps its place. Measured worse: 76 worlds move, not 68, because "the" no longer sits in the near-duplicate screen's used bases, so later bases starting "the" that the short-prefix rule used to refuse are accepted and the stream shifts anyway; it also adds a fork and a branch. The median world loses 13 names instead of 23, which no reader of any one world can see.
- **Refusing "the" in glued slots too** (the check outside the `standalone` condition). Against ruling 1's "where it stands alone", and moves up to 35 more of the 2000 worlds (those whose only "the" was glued) for no visible gain. T2 refuses it (mutation M3).
- **A set of articles holding "an" and "a" as well.** Dead entries: `baseRejected` refuses any base shorter than three letters before it reaches this line, so no mutation of them could red anything. T1 holds the short two anyway, through the length floor.
- **More English words.** Out of scope; see "Not in this pull request".

## Files

- `src/society/names.ts` (edit): the two hunks above, and nothing else. `ARTICLE` is not exported. Length: `max-lines` in `eslint.config.ts` (400, `skipBlankLines`, `skipComments`) counts 390 today and 391 after (the staged file under its own name printed "File has too many lines (391)" with the bar lowered to 300); raw 412 to 414. No split.
- `test/society/names.test.ts` (edit): `type NameKind` joins the import from `../../src/society/names.ts`; the constants `ARTICLES` and `SLOT_TEMPLATES`, the helper `articleNames`, and T1 and T2 below, all in one block. 235 lines today, 290 after. The whole file as it must read is `out/962-dry-run/names.test.candidate-b.ts` in the probe folder; the block is written out below so the plan stands without it.
- `handbook/specs/rulebook.md` (edit): one sub-bullet, text below (ruling 2).
- `handbook/plans/900/962/962-plan.md` (new): this plan, archived unchanged.

## Tests, in the order they are written

Both go in `test/society/names.test.ts`, in the first commit, as one block inserted directly before the line `test("isStandaloneSlot classifies template slots by letter-adjacency", () => {`, with `  type NameKind,` added after `  type Culture,` in the import list at the top of the file. Neither is a browser check; no browser check is added or lengthened, so no ledger line or readings are owed.

```ts
const ARTICLES = ["The", "An", "A"];

const SLOT_TEMPLATES: ReadonlyArray<readonly [NameKind, (c: Culture) => readonly string[]]> = [
  ["bare", () => ["%"]],
  ["settlement", () => ["%"]],
  ["river", (c) => c.riverTemplates],
  ["peak", (c) => c.peakTemplates],
  ["sea", (c) => c.seaTemplates],
  ["lake", (c) => c.lakeTemplates],
  ["forest", (c) => c.forestTemplates],
  ["realm", (c) => c.realmTemplates],
];

function articleNames(culture: Culture, kind: NameKind, filled: ReadonlySet<string>): string[] {
  const found: string[] = [];
  for (let seed = 1; seed <= 120; seed++) {
    const namer = createNamer(createRng(seed).fork("names"), culture);
    for (let i = 0; i < 40; i++) {
      const name = namer.name(kind);
      if (filled.has(name)) found.push(`${culture.id} seed ${seed} ${kind}: ${name}`);
    }
  }
  return found;
}

test("no name of any kind takes an English article for a base that stands alone (Issue #962)", () => {
  assert.ok(
    CULTURES.some(
      (c) =>
        c.onsets.includes("th") &&
        c.nuclei.includes("e") &&
        (c.patterns.includes("ON") || (c.patterns.includes("ONC") && c.codas.includes(""))),
    ),
    'fixture premise: some culture\'s sounds spell "the", so the sample can meet the article',
  );
  const found = CULTURES.flatMap((culture) =>
    SLOT_TEMPLATES.flatMap(([kind, templatesOf]) => {
      const standalone = templatesOf(culture).filter(isStandaloneSlot);
      return articleNames(culture, kind, new Set(standalone.flatMap((t) => ARTICLES.map((a) => t.replace("%", a)))));
    }),
  );
  assert.deepEqual(found, []);
});

test('a base glued into its name keeps "the": the article is refused only where a base stands alone (Issue #962)', () => {
  const found = CULTURES.flatMap((culture) =>
    SLOT_TEMPLATES.flatMap(([kind, templatesOf]) => {
      const glued = templatesOf(culture).filter((t) => !isStandaloneSlot(t));
      return articleNames(culture, kind, new Set(glued.map((t) => t.replace("%", "The"))));
    }),
  );
  assert.ok(found.length > 0, 'a glued slot such as "The %water" still takes the base "the"');
});
```

### T1: "no name of any kind takes an English article for a base that stands alone (Issue #962)"

- Assertion: no name any kind draws equals one of that culture's standalone templates filled with "The", "An" or "A".
- Stub: today's code. The test imports only exports that exist (`CULTURES`, `createNamer`, `isStandaloneSlot`, `NameKind`, `Culture`), so it reds on its last assertion and never on a missing module.
- Red at commit 1 on `assert.deepEqual(found, [])`, listing 329 names, from "thalassic seed 3 bare: The" through every kind ("thalassic seed 37 sea: The Sea of The", "thalassic seed 27 forest: The Forest"); the premise passes. Green with the ruled build (0 names). About 0.35 s.
- Mutation M1: in `baseRejected` in `src/society/names.ts`, the line `  if (standalone && (ENGLISH_BLOCKLIST.has(stem) || stem === ARTICLE)) return true;` becomes `  if (standalone && ENGLISH_BLOCKLIST.has(stem)) return true;`. Reds T1 (329 names, today's code); T2 stays green.

### T2: 'a base glued into its name keeps "the": the article is refused only where a base stands alone (Issue #962)'

- Assertion: across the same sample, some name equals a glued template (one `isStandaloneSlot` reads as glued) filled with "The".
- Green at commit 1 by design, and green with the ruled build: 17 such names both times (3 rivers, 11 forests, 3 realms, the first "thalassic seed 27 river: The Thewater"). It holds the boundary ruling 1 draws, "where it stands alone", which is today's behaviour on a glued slot, so it has no red-first step; its proof is M3. The house already guards the blocklist's own boundary the same way ("a settlement keeps a blocklisted base when a town suffix fuses onto it"), and Gate 1 item 18 asks that a selection rule be held by inverting its selector, here `standalone`.
- Mutation M3: the same line becomes `  if (stem === ARTICLE || (standalone && ENGLISH_BLOCKLIST.has(stem))) return true;`, the article refused wherever it stands. Reds T2 (0 names); T1 stays green.

### Who proves what

`vellum-guard-prover` owes both: T1 against M1, T2 against M3, each by line as Gate 1 item 9 says. Nothing is left to the implementer's own proof unless a review finding changes a test after the prover's round (workflow step 15).

### What no test is written for

The numbered fallback keeps "The II" possible, as ruled. No test pins that either way: this pull request changes nothing on that path, and a test asserting "The II" can still be minted would hold a defect in place against a later fix. The existing "a standalone-slot base is never a blocklisted word" and the fallback tests are unchanged and stay green (the unit suite with the ruled build staged).

## Order of commits

Branch: `fix/962-article-base`.

1. `#962 The namer's article tests, and the plan archived`: `handbook/plans/900/962/962-plan.md` and `test/society/names.test.ts`. Run `npm test -- test/society/names.test.ts` and see T1 red on its last assertion and T2 green. Push.
2. `#962 The namer refuses "the" for a base that stands alone`: the two hunks in `src/society/names.ts`. `npm test -- test/society/names.test.ts` green.
3. `#962 The rulebook says why a word refused where a name stands alone leaves seed 42 alone`: `handbook/specs/rulebook.md`.

Then the evidence, the prover's round, the still judge's comparison, the step 12 comment, the PR.

## Rosters and doctrine

- `handbook/specs/rulebook.md` (ruling 2): add this sub-bullet to the list opening "Some levers are golden-safe by construction", directly after the sub-bullet that ends `absence of those imports, so a new import into the generator is what breaks it.` and before the bullet opening `- **An optional recipe field is guarded`:

  ```
    - **A word the namer refuses where a name stands alone, when seed 42's tongue cannot spell it.**
      `baseRejected` in `src/society/names.ts` refuses a base that stands alone (an unsuffixed town,
      a bare name, a template slot `isStandaloneSlot` reads as standalone) when it is the article
      `ARTICLE` or a word of `ENGLISH_BLOCKLIST`, and draws again. A word refused there changes a
      world only where one of its namers drew that very word, and every namer of seed 42 speaks
      `oromi` (`test/world/covenant-seed42.test.ts`), so a word that `oromi`'s onsets, nuclei and
      codas in `CULTURES` cannot form leaves the golden, the committed charts and the Primer's ladders
      as they stand. Read those sounds before calling a word one of these.
      It still renames every other world whose namer drew the word, every name that namer drew after
      it included, so run the unit suite and the browser lanes over it as over any change that moves
      a world.
  ```

- `.claude/skills/vellum-footguns/SKILL.md` Gate 6 item 1 ("A terrain, culture or name-template change moves world identity and re-pins the golden") is left as written: the gate points at the rulebook as its authority, and the rulebook's lever list is where the exceptions live, none of the three existing levers being in the gate either.
- No spec, agent or skill names `ENGLISH_BLOCKLIST` or its members: `git grep -n "ENGLISH_BLOCKLIST" -- handbook .claude` finds it only in archived plans under `handbook/plans/` (Issue #814, Issue #851, Issue #1316), which are never edited.
- The issue body's premise ("it may move world identity and the golden") is answered in the step 12 comment with the table above, pointing at the rulings comment rather than restating it.

## Evidence

- `npm test -- test/society/names.test.ts`: T1 red and T2 green at commit 1, the whole file green at commit 2.
- `npm test -- test/world/golden-seed42.test.ts test/world/covenant-seed42.test.ts test/site/hero-charts.test.ts test/site/primer-ladders.test.ts` green at commit 2: seed 42, the golden, the committed charts and the Primer's ladders stand still, which is the "no regen owed" claim Gate 6 item 7 asks a command for.
- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test` and `npm run astro:generate`.
- The table under "What was measured", quoted in the PR body as the planner's measurement at 2f66e4ee with its commands; the implementer does not re-run the sweep.
- e2e, locally: `npm run build`, then `VELLUM_E2E_SUITES=stage npm run test:e2e` (`stage` is in neither `NEEDS_PREDECESSOR` nor `OPENS_ON_HOME` in `e2e/support/suites.ts`, so it runs alone), the one suite whose checks read both harness worlds that move (20261006 by name in `e2e/suites/stage/desk.ts`, and 20261005 in every chart room it opens). Every other lane runs on CI.
- `vellum-plate-reader` is owed at step 11 for the still judge's comparison alone: `git diff --stat <base> -- <paths>` of its section "Two versions of one sheet, asked of Jev" prints `src/society/names.ts`. The dispatch names seeds 557, 415, 27 and 1718 first (whose sheets move under the fix: the sea "The Sea of The" and six other names, the capital "The" and 38 other names, a town "The" and 46 other names, the title "The Realm of The" alone), then the trial seeds fill to five as that section says. The deliverable is not an appearance, so no other plate read is owed.
- `vellum-guard-prover` on T1 and T2, as above.

## Calls made

Each is the planner's own call on a question neither the issue nor the rulings settled; the implementer copies them into its step 12 comment.

1. The screen is a named module constant, `ARTICLE`, beside `ENGLISH_BLOCKLIST` and unexported, rather than a literal in `baseRejected` (the workspace coding checklist's "no hardcoded values") or a set (one member, since "an" and "a" would be dead entries behind the length floor).
2. No split of `src/society/names.ts`: the 400-line bar is the lint's `max-lines` (blank and comment lines skipped), which counts 391 after the change; the raw count, 414, was already past 400 on main (412) and passes the lint.
3. T1 holds "An" and "A" as well as "The": the class is English articles in a standalone slot (Gate 1 item 6); the length floor already keeps the short two out, and the test holds that at no cost.
4. T1 drives every name kind through its own templates, not `bare` alone: which slots are screened is decided by `isStandaloneSlot` on the template, which the existing blocklist test (through `bare` only) never reaches.
5. T2 guards the boundary ruling 1 draws (glued slots keep "the"), green before and after, proved by M3; the earlier fallback test is dropped, since the ruled build leaves the fallback as main has it.
6. No test pins that the fallback can still mint "The II" (What no test is written for).
7. No world-level test: `generateWorld` reaches the namer through `createNamer`, which T1 drives directly for every kind, and one world's sea would pin a single draw (`handbook/specs/check-placement.md`, a unit test holds one claim). The sweep table carries the world-level evidence.
8. Gate 6 item 1 of `vellum-footguns` is not edited (Rosters and doctrine).
9. The local e2e run is `stage` alone, the one suite that reads both moved harness worlds; CI runs the rest.
10. The still judge's dispatch names seeds 557, 415, 27 and 1718 first, so the comparison is made on sheets that move rather than only on trial seeds, most of which do not.
11. No other English word is screened here (below).
12. The side fork is rejected although `handbook/specs/engine-invariants.md` (Fork derivation) prefers a new named fork to a draw inserted mid-fork: the doctrine's aim is that one feature cannot move another's draws, and here the moved draws are the same namer's own; measured, the side fork moves more worlds (76 against 68) and adds a fork and a branch.

## Not in this pull request

- **The numbered fallback** in `createBaseMaker` still reads only `ENGLISH_BLOCKLIST`, so "The II" stays possible (ruling 1); it met "the" on no measured world.
- **Other plain English words stand alone today.** Over the 2000 control worlds, one-word names that are common English words include "She", "Male", "Bare", "Lie", "Sky", "Pan", "Kale" and "Non" (`node out/962-dry-run/english-survey.ts`, read against the system word list, which also counts many obscure words). Widening either screen is its own sweep; the planner reported it to the dispatcher, who decides whether it is filed. The implementer does not add words.
- **The last-resort name** in `createBaseMaker` (``${capitalize(rawBase())} ${overflow++}`` after 1000 fallback tries) screens no word at all; it was reached by no measured world and is unchanged.
- **Coordination, for the dispatcher**: no file overlaps the Issue #1253, Issue #422, Issue #1108/#1109 or Issue #976 lanes, and seed 42 cannot move, so this owes no regen and collides with neither regen lane. `hamletName` in `src/society/hamlets.ts` (the Issue #976 lane's file) calls this namer: a hamlet on a thalassic, sylvan or draket world that today is named "The" gets another name, so if the Issue #976 lane pins a hamlet name on such a world, whichever lands second re-reads that pin. The Issue #422 lane (relayed by the orchestrator) would berth a decor ship clear of the labels on the committed charts: no label on seed 42 moves here, so that ship cannot move by this change; on the 68 other worlds a ship placed clear of the labels may take another berth with them, which touches nothing committed, and if the Issue #422 lane pins a berth on a thalassic, sylvan or draket world, whichever lands second re-reads it.

## Stop conditions

Hand back, through the dispatcher, without adapting, when:

1. `git diff --stat 2f66e4eef52dc8a5c4c475979080c03f9f11023c origin/main -- src/society/names.ts test/society/names.test.ts` prints a change.
2. The anchors are not as written: the lines `  "bra",` and `]);` closing `ENGLISH_BLOCKLIST`, the line `  if (standalone && ENGLISH_BLOCKLIST.has(stem)) return true;` in `baseRejected`, the `test(` line the block goes before, or `  type Culture,` in the test file's import list; or an identifier `ARTICLE` already exists in `src/society/names.ts`.
3. At commit 1, `npm test -- test/society/names.test.ts` reds anything but T1, or T1 reds on its premise rather than its last assertion, or T1's list is not 329 names, or T2 reds.
4. At commit 2, any of the four seed 42 test files above reds, or `npm test` reds a test that reads a world's or a namer's names (the plan measured none).
5. `npm run lint` reports `max-lines` on either file, or any rule on the planned text (the plan linted both clean).
6. The local `stage` suite reds, or a CI e2e lane reds on a check whose page opens a world without a seed in its address or on seed 20261006: read it first as `.claude/agents/vellum-implementer.md` says; a red the dispatcher does not rule explained comes back here, since the plan predicts no browser reading moves.
7. The prover finds M1 or M3 unable to red the test this plan says it reds.
