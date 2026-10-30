# Issue #854 plan, pull request 1 of 2: the link keys for the new fields, and the fetch that lets a page draw a real place

- **Planned at:** `origin/main` 108f8db60b81647575ef08ba5e2e50c3a1524508, re-recorded at the fold of Alex's rulings (2026-10-30; main unmoved since the menu, `git rev-parse origin/main` after `git fetch origin main`); Issue #854 comment count 4 (6280143869, 6281727087, 6512507649, and 6527008800, the rulings); Epic Issue #844 comment count 8. First recorded at the menu with Issue #854 at 3 comments.
- **Rulings:** Issue #854 comment 6527008800 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6527008800), Alex, 2026-10-30: M1 to M6 each ruled as recommended (A), folded in the section "Rulings" below. He overruled none of the calls the planner's report listed (its 1 to 13, which are this plan's calls 2 to 14, numbered differently there).
- **Open decisions:** none.
- **Branch (for the implementer):** `feat/854-shape-links`.
- **This file is pull request 1's plan.** Pull request 2 (the controls, built to stills) gets its own plan, `854-pr2-plan.md`, from a later planner run after Alex's sitting over the stills this plan specifies in "Pull request 2: what its sitting needs".

## What the issue asks, as the rulings left it

Sub 6 of Epic Issue #844. A shaped world (an outline, real place or hand-drawn form, with its looseness) and a counted world (an island count with its sizes and raggedness) must be reachable from the Explorer's Broadside and must link like any other world: the link opens the same world in the Explorer, the Print Room, the Prospect, the Ribbon, the Reading Room and the Chart Table, and a plain chart's link stays byte-identical to today's. Issue #853 comment 6512462029 ruling 2 adds the browser half of real places to this issue: the shapes stay on the server and a chart fetches its one place when it needs it; nothing on the site can draw a real place until this issue builds that fetch.

The rulings that supersede the body (Issue #844 comment 6281585030, Issue #854 comment 6281727087): the shape control is a place picker over the whole roster, not a select over `OUTLINE_IDS`; the islands control shows on the archipelago only and a count beside a shape is refused; looseness and raggedness are two sliders; the rows are as drawn and the build fixes the crowding (no scroll at 1024 by 768, clear of the Drawer tab). Every word on the new rows is unnamed.

**The split.** Everything that is a contract (the address grammar, determinism, the fetch) goes in pull request 1, which has no appearance in it. Everything that is a feel ruling (the controls, their seats, their words, the crowding fix, the stood-down state) goes in pull request 2, after Alex rules it from stills. Rule: `handbook/specs/conventions.md`, "Feel decisions are provisional. Contract decisions are not", and workflow step 6, which forbids building an appearance before its stills are ruled; the split lets pull request 1 build while the stills are drawn. Alex ruled it (M1, "Two steps", comment 6527008800).

## Recon, and what it changed (workflow step 5)

`vellum-spec-recon` ran against 108f8db6 (body, all 3 comments, the epic's 8, Issue #853's short comments, the neighbours' bodies): 31 claims checked, 22 CURRENT, 9 STALE (5 blocking, 4 cosmetic), 2 UNVERIFIABLE (Issue #931's contrast figures and the slip-scroll and Drawer-tab figures of Issue #930 and comment 6281727087, each needing a render, which pull request 2's plate read takes). STALE, blocking, each folded:

1. **The readers.** The body's list of ten reader files predates the shared grammar. `coast` is parsed once, by `readWorldKeys` in `src/site/shared/address-grammar.ts`, which the Print Room, the Prospect, the Ribbon and the Reading Room all call through `src/site/print-room/address.ts`, `src/site/prospect/address.ts`, `src/site/ribbon/address.ts` and `src/site/reading-room/address.ts`; the Chart Table parses its own grammar in `src/site/shared/table-address.ts`; the Explorer reads its hash in `src/site/explorer/hash-sync.ts`. This plan adds the keys in those three readers and the consumers below, and the room address tests the body omitted (`test/site/address-grammar.test.ts`, `print-room-address.test.ts`, `reading-room-address.test.ts`) join the three it named.
2. **"A select over `OUTLINE_IDS`"**: replaced by the place picker (pull request 2). `OUTLINE_IDS` is the three forms; the roster is `PLACE_ID_LIST`.
3. **"The islands control shows on every map type", "a count is accepted on any type"**: reversed by ruling 7. The engine throws on a count off the archipelago (`countedOf` in `src/terrain/heightfield.ts`), so the readers refuse one (design 4).
4. **The browser half of real places**: absent from the body, present on main nowhere (`setPlaceSource` has no caller under `src/`). Design 6 to 9.

STALE, cosmetic, noted and not acted on: `controls.ts` holds code for the coast, not only a comment; the Land-panel browser checks live in `e2e/suites/broadside.ts`, not a suite named for the Explorer; `e2e/suites/corners.ts` does not measure the slip (pull request 2's concern).

Rejected, with the reason: recon's claim that "the world cache holds a failed state" if a draw runs before its place arrives. `worldFor` in `src/site/explorer/world-cache.ts` assigns its entry only after `generateWorld` returns, so a throw never reaches the cache. The gate (design 7) makes the case unreachable anyway.

CURRENT and carried as fact: the five recipe fields, their stamp keys and their range predicates (`isLooseness`, `isIslandCount` 2 to 100, `isIsleSize`, `isRaggedness`); `keyOf` fingerprints flat fields; `chainCacheKey` carries every terrain input.

## Measured before the menu (workflow step 6, "A menu is measured")

All in Node at 108f8db6, by `node out/854-dry-run/854-inert.ts` and `node out/854-dry-run/854-cost.ts` in this planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a09920b53b2c4ecae/out/854-dry-run/`, logs `854-inert.log` and `854-cost.log` beside them). "Draws nothing" means the rendered SVG is identical once the `data-vellum-*` attributes and the `<metadata>` summary are stripped, while the raw SVG differs (the stamp records the field).

| world | what changes | draws anything? |
|---|---|---|
| Texas (`ne-1159315211`), island, seeds 30 and 8, looseness 0 | land 0.1 against 0.7 | no |
| the same, looseness 1 | land 0.1 against 0.7 | no |
| the same, looseness 0 | coast 0 against 1 | no |
| the same, looseness 0.05 | coast 0 against 1 | yes (604,549 against 603,225 chars, seed 30) |
| the same, looseness 0.5 | coast 0 against 1 | yes |
| the same | looseness absent against 0 | no |
| archipelago asked 20, seeds 1 and 12 | coast 0 against 1 | no |
| the same | land 0.1 against 0.7 | no |
| the same | raggedness absent against 0 | no |
| the same | isleSize absent against `equal` | no |

So on a shaped world the land slider draws nothing at any looseness and the coast slider draws nothing while the shape is exact (looseness 0) and draws as soon as it loosens; on a counted world neither the land nor the coast slider draws anything; and the engine's three defaults draw the same as their absence. This agrees with `handbook/specs/engine-invariants.md`, "What the generator does not do", and with `landShareOf` in `src/world/generate.ts` and `shapedElevation` (its `looseness > 0` gate) in `src/terrain/heightfield.ts`.

Other figures:
- `generateWorld` at seed 42, island, three runs each: the dome 349 to 383 ms, Texas 277 to 318 ms, the largest place (Nunavut, `ne-1159307715`, 24,247 bytes of rings) 337 to 481 ms, the same at looseness 0.5 430 to 440 ms. A place costs about what the dome costs.
- One place file: 23 bytes at the smallest, 622 median, 1,666 at the 90th percentile, 24,247 at the largest; 4,912,555 bytes for all 5,646.
- The name index (`src/world/outline-place-names.json`): 296,411 bytes, 57,795 gzipped; 745 lakes, 4,596 states, 258 countries, 47 units. 188 names are shared by more than one place (461 rows), and 63 groups share name, kind and country alike (lakes carry no country), so the index alone cannot tell, say, the two "Trout Lake" rows apart. The longest name is "Professor Doctor Ingenieur W. J. Van Blommestein Meer" (53 characters); the longest name with its country is "South Georgia and the South Sandwich Islands, South Georgia and the Islands". These are pull request 2's.
- Every place ID is 13 characters (`ne-` and ten digits).
- No bundle gains data. `src/site/shared/shape-address.ts` imports `isOutlineId`, which brings `PLACE_ID_LIST`; but every bundle that will import the grammar already imports the engine, and so already carries that list since PR #1120 (Issue #853's M6), and of the bundles that draw no linked world, `git grep -n "address-grammar\|table-address\|world/generate" -- src/site/home src/site/seed-of-the-day src/site/specimen` finds only `world/generate` in `src/site/home/stage-data.ts` and `src/site/seed-of-the-day/app.ts`, which carry the list already, and nothing in `src/site/specimen`.
- `runInline` has one product caller, the inline branch of `runJob` itself (`git grep -n "runInline(" -- src/site`, `src/site/explorer/worker-client.ts`); the Reading Room and the Explorer import it only to hand it to the test hooks. So every product draw of a place passes the gate first.
- The Chart Table's six widest sheets encode to 905 characters today against the 950 pin in `test/site/table-address.test.ts`; with the new fields the widest sheet is a shaped archipelago and six of them encode to 1,067 (computed from `emitTable` and the field lengths, design 5).

**Browser readings were not taken.** The dispatcher's brief excludes a build in the planner's tree (confirmed at the fold: an `npm run build` to take readings is not within it), and the harness reads only a built site. Nine of the ten planned checks read behaviour only this change drives (the gate, the served files, the readers learning the keys), so no probe could stage them without editing source in any case; the tenth, PRW6, reads today's behaviour but needs that same build. All ten are printed UNVERIFIABLE in Tests, below, and the implementer's first run of each is its reading, under the stop conditions that name a run landing on the wrong side.

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes for the work:
- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract"; "The address is a photograph" (the bullet this plan extends).
- `handbook/specs/engine-invariants.md`: "Identity versus view"; "A terrain input reaches every sheet through one mapper"; "World identity is entry-point independent"; the outline and count paragraphs of "Founding a world from a sentence"; "What the generator does not do".
- `handbook/specs/site-architecture.md`: "What a working page's surface owes beyond its files" (one worker, first in first out); "Link form is scoped"; "The two contractual forms"; "Build, check and deploy" (`astro:generate`, the type-check passes, the worker's chunks).
- `handbook/specs/check-placement.md`: all of it.
- `handbook/specs/settle-doctrine.md`: clauses 3 to 9 and 14, and "The environment" before the e2e checks.
- `handbook/specs/conventions.md`: "How code is cited", and the comment doctrine it points at (this plan writes one dated line, at the table pin).
- `handbook/specs/rulebook.md`: "Cross-epic coordination" (Issue #393 on the same readers).
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before each test, Gate 2 before each e2e check, Gate 4 before the generate step, Gate 5 before the push.

## The design

1. **Five link keys, named as the chart's own record names them.** `outline`, `looseness`, `islands`, `isleSize`, `raggedness`, the words `recipeMetadataNode` in `src/render/recipe-meta.ts` already writes (as `land` and `coast` match it today). Values: `outline` is the ID (`round`, `crescent`, `ring` or `ne-` and the serial, ruling 3 of Issue #853); `looseness` and `raggedness` are whole hundredths, 0 to 100, read by the seed's grammar (a run of digits) and clamped at 100, as `coast` is; `islands` is the whole count; `isleSize` is the word. In a hash they follow `coast`, in that order; in a Chart Table sheet they follow `coast` the same way, joined by the table's own `-`. (Call 6.)
2. **One world, one spelling.** A key the world draws nothing from is never written, so one world never has two links, two stamps or two sheets on the Chart Table (where `sameSheet` in `src/site/explorer/chart-drawer.ts` compares emitted items byte for byte). Two rules, both measured above:
   - the engine's defaults are spelt by omission: a looseness of 0, a raggedness of 0 and `isleSize` `equal` are left out, on read and on write;
   - a land fraction is left out beside an outline or a count, and a coast warp beside a count or beside an outline held exact (no looseness). `landDraws` and `coastDraws` say which, and one function, `gateLand`, applies them for every reader and for the Explorer's own draft. (Call 9.)
3. **Refusal, by each grammar's own rule.** A link or sheet states a shape group the engine would refuse when: a value is malformed (an unknown outline, a non-digit number, an unknown size, an empty value); the count is outside 2 to 100; a looseness is stated with no outline; a size or a raggedness is stated with no count; a count is stated beside an outline; a count is stated without `type=archipelago`. A hash reader then reads the whole group as absent, as it reads `type=moon` (the page draws the seed's own world); the Chart Table drops the sheet, as it does for a malformed `type`. (Call 7.)
4. **A count is read only beside an explicit `type=archipelago`.** With no type the seed rolls the type, and the engine throws on a count off the archipelago. A count in the Explorer's link is always written beside `type=archipelago`, because the only way the Explorer holds a count is a link that carried that type (and, in pull request 2, the islands control, which Alex ruled shows only when "archipelago" is picked in the map-type menu, M4). (Call 8.)
5. **The Chart Table carries the fields** in `TableOverrides`, so every sheet kind, `groupByWorld` and `sameSheet` see them; the six-widest-sheets pin rises to 1,112 (the new widest, 1,067, plus the 45 characters of headroom the old pin carried). (Call 11.)
6. **One file per place, served, never bundled.** A new `astro:generate` step, `scripts/place-files.ts`, writes each place's ring text from `src/terrain/outline-places.json` to `generated/outlines/<id>.txt`. The address is root-absolute, `/outlines/<id>.txt`, because every surface at every depth (`/explorer/`, `/explorer/portfolio/`, `/print-room/`, ...) fetches through one shared function. (Calls 3 and 4.)
7. **The fetch lives in `runJob`, and only there.** `runJob` in `src/site/explorer/worker-client.ts` is the one way every surface and every job kind (draw, region, atlas, prospect, ribbon) reaches a world. Before it sends a job whose `overrides.outline` is a place (not a form), it loads that place's text (`createPlaceLoader`, memoised per place, a failure forgotten so the next draw retries), then sends the job: to the worker with the text riding the message, or inline. A plain job sent while nothing is waiting goes at once, exactly as today; a plain job sent while a place job is still fetching waits its turn (`createPlaceGate`), so the worker stays first in first out (`handbook/specs/site-architecture.md`). (Calls 2 and 4.)
8. **Each realm installs one place source, over a store that only grows.** `admitPlace` in `src/site/explorer/place-source.ts` installs `setPlaceSource` once per realm (the page, the worker) over a map and adds each place's text to it. Calling `setPlaceSource` per job would advance the store's generation and throw away the outline memo on every draw. A growing store is safe because a place's rings never change (`handbook/specs/engine-invariants.md`). The loader admits into the page's store as it loads, so the inline path and `runInline` (which the Reading Room and the test hooks call directly) find the place; a direct `runInline` of a place never loaded throws `outline <id> is not loaded`, which is the right refusal. The worker admits the text that rides each message before the job's answer runs.
9. **A failed fetch is that job's error, in each room's own error line.** The loader rejects with `the outline of <id> could not be fetched` (and the status where there is one); the Explorer shows "The cartographer spilled the ink: ...", the Prospect "The engraver slipped: ...", and so on. Nothing retries on its own; the next draw tries again. (Call 5.)
10. **The Explorer holds a link's shape until pull request 2's controls.** `src/site/explorer/shape-choice.ts` holds the shape and count a link carried (`chooseShape`, `shapeChoice`); `readHash` fills it, `draftOverrides` and `writeHash` read it through `drawnShape`, which drops the count while the type menu is not on the archipelago (the holder keeps it). Random and Enter keep the shape and the count, as they keep the type menu. Pull request 2's controls write the same holder. In pull request 1 nothing on the slip shows the shape, and the land and coast sliders stay live and redraw the same world where they draw nothing (design 2 keeps them out of the overrides and the link). (Call 10.)
11. **The rooms carry the keys as one value.** `LandKeys` (`land`, `coast`, `shape`), with `emitLandKeys` and `overridesOfLand`, replace each room's two hand-copied `land`/`coast` lines at every emit and every override site. This keeps `src/site/reading-room/app.ts` (385 lines today) under 400, and it is the one place Issue #393's `culture` joins (hand-off).

### Rejected, with the reason

- **One pull request with the controls.** It would hold the contract half behind the stills sitting. Alex ruled two steps (M1).
- **The worker fetches the place itself.** Two fetch paths (worker and inline) where one serves, and the worker's job queue would have to await inside `answer`; attaching the text to the message keeps one fetch and the worker synchronous.
- **The whole 4.9 MB table, or shards of it, per draw.** Ruling 2 of Issue #853 says a chart fetches its one place; a place is 622 bytes at the median.
- **The geometry in a dynamic `import()` chunk per place.** 5,646 chunks through the bundler for data, against one plain file each.
- **A relative fetch address.** Shared code fetching from pages at different depths resolves a relative address against each page's own base, which is the bare-worker-URL trap (`handbook/specs/site-architecture.md`, "A bare relative worker URL resolves against the DOCUMENT base").
- **`setPlaceSource` per job, with that job's place.** It advances the generation on every job and empties the outline memo every draw.
- **Writing defaults explicitly (`looseness=0`, `raggedness=0`, `isleSize=equal`).** It spells one world two ways the moment a hand-typed link omits one.
- **Keeping a land or coast that draws nothing in the link.** The stamp then differs while the land does not, and the Chart Table seats one world twice.
- **Clamping a count out of range into 2 to 100.** The body asks for refusal ("a count out of Sub 3's range reads as no world, as the stamp does"); clamping draws a world the link did not ask for.
- **Reading a count with no type as an archipelago.** It writes a type the reader did not choose into the world; the refusal keeps the link honest and costs nothing, since the Explorer always writes the type beside a count.
- **A new e2e suite for the checks.** It joins five rosters (`handbook/specs/site-architecture.md`); each check goes into the suite that already opens its room.
- **Building the place picker's name index in this pull request.** Nothing here needs a name; the index is the picker's (pull request 2).

## Files

Line counts are today's; "after" is the expected count after the change.

**Created**

| file | what it holds |
|---|---|
| `src/site/shared/shape-address.ts` (about 90 lines) | the five keys' grammar and the spelling rules, pure and DOM-free |
| `src/site/explorer/shape-choice.ts` (about 10) | the Explorer's holder for a link's shape and count |
| `src/site/explorer/place-source.ts` (about 15) | `PlaceText` and `admitPlace`, one place store per realm |
| `src/site/explorer/place-fetch.ts` (about 45) | the served path, the loader, and `placeOfJob` |
| `src/site/explorer/place-gate.ts` (about 25) | the first-in-first-out gate in front of `runJob` |
| `scripts/place-files.ts` (about 30) | the `astro:generate` step writing one file per place |
| `test/site/shape-address.test.ts` | T1 |
| `test/site/place-source.test.ts` | T6 |
| `test/site/place-fetch.test.ts` | T7 |
| `test/site/place-gate.test.ts` | T8 |
| `test/site/place-files.test.ts` | T9 |

**Exported signatures, exactly**

`src/site/shared/shape-address.ts`:
```ts
import { isOutlineId, type OutlineId } from "../../world/outline-ids.ts";
import { isIslandCount, isIsleSize, type IsleSize } from "../../terrain/lobes.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import { seedFromHash } from "../explorer/address.ts";

export interface ShapeOverrides {
  readonly outline?: OutlineId;
  readonly looseness?: number;
  readonly islands?: number;
  readonly isleSize?: IsleSize;
  readonly raggedness?: number;
}
export const SHAPE_KEYS = ["outline", "looseness", "islands", "isleSize", "raggedness"] as const;
export type ShapeKey = (typeof SHAPE_KEYS)[number];

/** The shape a link or sheet states, spelt one way; {} when it states none, null when it states one the engine refuses. */
export function readShapeKeys(get: (key: ShapeKey) => string | null | undefined, type: MapType | null | undefined): ShapeOverrides | null;
/** The keys and values to write, in SHAPE_KEYS order, only for fields present. */
export function shapePairs(shape: ShapeOverrides): ReadonlyArray<readonly [ShapeKey, string]>;
/** The shape fields of a bag, and nothing else. */
export function shapeOf(bag: ShapeOverrides): ShapeOverrides;
/** What the world draws from a held choice under the type menu's value: defaults left out, the count dropped off the archipelago. */
export function drawnShape(choice: ShapeOverrides, type: string): ShapeOverrides;
export function landDraws(shape: ShapeOverrides): boolean;
export function coastDraws(shape: ShapeOverrides): boolean;
```
Behaviour, which T1 pins line by line:
- `readShapeKeys` reads each of the five keys `get` returns a string for. A stated `outline` must pass `isOutlineId`; `looseness` and `raggedness` must be a run of digits (`seedFromHash`), read as hundredths and clamped to 1; `islands` must be a run of digits passing `isIslandCount`; `isleSize` must pass `isIsleSize`. An empty value is malformed. Any malformed value returns `null`. Then, on the keys as STATED: a looseness with no outline, a size or raggedness with no count, a count beside an outline, and a count with `type !== "archipelago"` each return `null`. Then it returns the spelt shape: looseness 0, raggedness 0 and `isleSize` `equal` left out.
- `shapePairs` writes `outline` as given, `looseness` and `raggedness` as `String(Math.round(v * 100))`, `islands` as `String(n)`, `isleSize` as given; it writes what it is given and spells nothing (its callers hold spelt shapes).
- `drawnShape(choice, type)` spells `choice` (the three defaults left out, a looseness with no outline left out, a size or raggedness with no count left out) and, when `choice.islands` is present and either `type !== "archipelago"` or `choice.outline` is present, leaves out `islands`, `isleSize` and `raggedness`.
- `landDraws(s)` is `s.outline === undefined && s.islands === undefined`; `coastDraws(s)` is `s.islands === undefined && (s.outline === undefined || s.looseness !== undefined)`, which reads a spelt shape (a looseness of 0 is absent there).

`src/site/shared/address-grammar.ts` (80 lines, about 105 after) gains:
```ts
import { coastDraws, landDraws, readShapeKeys, shapePairs, type ShapeOverrides } from "./shape-address.ts";

export interface WorldKeys { /* the six fields as today */ readonly shape: ShapeOverrides; }
export type LandKeys = Pick<WorldKeys, "land" | "coast" | "shape">;
export type LandOverrides = { readonly landFraction?: number; readonly coastWarp?: number } & ShapeOverrides;
export const NO_LAND_KEYS: LandKeys = { land: null, coast: null, shape: {} };
/** Leaves out a land or coast the shape draws nothing from. */
export function gateLand(keys: LandKeys): LandKeys;
/** Writes land, coast and the shape keys in that order, each only where present. */
export function emitLandKeys(params: URLSearchParams, keys: LandKeys): void;
export function overridesOfLand(keys: LandKeys): LandOverrides;
```
`readWorldKeys(p)` reads `type` first, then `shape = readShapeKeys((k) => p.get(k), type) ?? {}`, and returns `{ seed, style, type, band, ...gateLand({ land: landFromAddress(p.get("land")), coast: coastFromAddress(p.get("coast")), shape }) }`. `emitLandKeys` writes `land` as `Math.round(land * 1000)` and `coast` as `Math.round(coast * 100)`, the forms every room writes today, then `shapePairs(keys.shape)`. `overridesOfLand` maps `land` to `landFraction` and `coast` to `coastWarp` where non-null, then spreads the shape.

`src/site/shared/table-address.ts` (305 lines, about 315 after):
- `export interface TableOverrides extends ShapeOverrides` (its four fields unchanged).
- `readWorld`: after reading `mapType`, `const shape = readShapeKeys((k) => fields.get(k), mapType);`; return `null` when `shape === null` (beside the existing null tests); the overrides become `{ ...(mapType…), ...(band…), ...overridesOfLand(gateLand({ land: landFraction ?? null, coast: coastWarp ?? null, shape })) }`.
- `worldFields`: after the coast field, `...shapePairs(overrides).map(([key, value]) => `${key}${PAIR}${value}`)`.

`src/site/explorer/shape-choice.ts`:
```ts
import type { ShapeOverrides } from "../shared/shape-address.ts";
let choice: ShapeOverrides = {};
export const shapeChoice = (): ShapeOverrides => choice;
export function chooseShape(next: ShapeOverrides): void { choice = next; }
```

`src/site/explorer/hash-sync.ts` (105 lines, about 112 after):
- imports `readWorldKeys`, `emitLandKeys`, `gateLand`, `type LandKeys` from `../shared/address-grammar.ts` in place of `coastFromAddress, landFromAddress`; `drawnShape` from `../shared/shape-address.ts`; `chooseShape`, `shapeChoice` from `./shape-choice.ts`.
- `landFromHash(land: number | null, controls: Readonly<Controls>): boolean` and `coastFromHash(coast: number | null, controls: Readonly<Controls>): boolean` take the read value (null returns false and touches nothing).
- new export: `export function landKeysNow(controls: Readonly<Controls>, landTouched: boolean, coastTouched: boolean): LandKeys` returning `gateLand({ land: landTouched ? sliderToLand(controls.landSlider.value) : null, coast: coastTouched ? sliderToCoast(controls.coastSlider.value) : null, shape: drawnShape(shapeChoice(), controls.typeSel.value) })`.
- `readHash`: `const keys = readWorldKeys(params); chooseShape(keys.shape);` then `landFromHash(keys.land, controls)` and `coastFromHash(keys.coast, controls)` in place of today's two calls. The rest unchanged.
- `writeHash`: its two `land`/`coast` lines become `emitLandKeys(params, landKeysNow(controls, landTouched, coastTouched));` in the same place (after `beasts`, before `emitLive`).

`src/site/explorer/app-wiring.ts` (197 lines, about 200 after):
- `export type DrawOverrides = { mapType?: MapType; band?: ClimateBand } & LandOverrides;`
- `draftOverrides(seed, touched)`: builds `chosen: { mapType?: MapType; band?: ClimateBand }` from the two selects as today; `if (!touched.land) syncAutoSlider(seed, chosen); updateLandReadout(); if (!touched.coast) parkCoastDefault(); updateCoastReadout();` then `return { ...chosen, ...overridesOfLand(landKeysNow(hashControls, touched.land, touched.coast)) };`. It imports `hashControls` from `./elements.ts` and `landKeysNow` from `./hash-sync.ts`.

`src/site/explorer/chart-drawer.ts` (208 lines): `surveyItemFrom`'s `overrides` gains `...shapeOf(o)` after the coast line.

`src/site/explorer/place-source.ts`:
```ts
import { setPlaceSource } from "../../terrain/outline-store.ts";
import type { PlaceId } from "../../world/outline-ids.ts";
export interface PlaceText { readonly id: PlaceId; readonly text: string }
/** Adds a place's rings to this realm's store, installing the store as the place source the first time. */
export function admitPlace(place: PlaceText): void;
```
Body: a module `Map<PlaceId, string>` and an `installed` flag; the first call runs `setPlaceSource((id) => held.get(id))`; every call sets the map entry.

`src/site/explorer/place-fetch.ts`:
```ts
import { isFormId, type PlaceId } from "../../world/outline-ids.ts";
import { admitPlace, type PlaceText } from "./place-source.ts";
import type { RenderJob } from "./worker-client.ts";

export const PLACE_FOLDER = "outlines";
export const placeFile = (id: PlaceId): string => `${PLACE_FOLDER}/${id}.txt`;
export const placeUrl = (id: PlaceId): string => `/${placeFile(id)}`;
export interface Fetched { readonly ok: boolean; readonly status: number; text(): Promise<string> }
export type Fetcher = (url: string) => Promise<Fetched>;
/** Loads a place once per realm, admits it, and hands its text on; a failure is forgotten so the next load tries again. */
export function createPlaceLoader(fetcher: Fetcher, admit: (place: PlaceText) => void = admitPlace): (id: PlaceId) => Promise<PlaceText>;
/** The real place a job draws, or null for a form, no outline, or a job with no world. */
export function placeOfJob(job: RenderJob): PlaceId | null;
```
The loader keeps a `Map<PlaceId, Promise<PlaceText>>`. A response that is not `ok` rejects with `new Error(`the outline of ${id} could not be fetched (${status})`)`; a fetcher that throws rejects with `new Error(`the outline of ${id} could not be fetched`)`. On rejection the entry is deleted. `placeOfJob` returns `null` for `kind === "tour"`, for no `overrides.outline`, and for `isFormId(outline)`; otherwise the outline as `PlaceId`.

`src/site/explorer/place-gate.ts`:
```ts
import type { PlaceId } from "../../world/outline-ids.ts";
import type { PlaceText } from "./place-source.ts";
export type PlaceGate = <T>(place: PlaceId | null, send: (text: PlaceText | null) => Promise<T>) => Promise<T>;
export function createPlaceGate(load: (id: PlaceId) => Promise<PlaceText>): PlaceGate;
```
Body (the ordering is the contract, T8 pins it): keep `tail: Promise<unknown> | null`. With `place === null` and `tail === null`, return `send(null)` in the same turn. Otherwise `const fetched = (tail ?? Promise.resolve()).then(() => (place === null ? null : load(place)));`, `const sent = fetched.then(send);`, `const mine = fetched.then(() => undefined, () => undefined);`, set `tail = mine`, and `void mine.then(() => { if (tail === mine) tail = null; });`, then return `sent`. `sent` is registered on `fetched` before `mine`, so each job is sent before the next one's load starts.

`src/site/explorer/worker-client.ts` (288 lines, about 300 after):
- imports `createPlaceGate` from `./place-gate.ts`, `createPlaceLoader, placeOfJob` from `./place-fetch.ts`, `type PlaceText` from `./place-source.ts`.
- `type Envelope = { readonly id: number; readonly place?: PlaceText };` and every member of `WorkerRequest` becomes `Job & Envelope`.
- `const throughPlace = createPlaceGate(createPlaceLoader((url) => fetch(url)));` at module scope.
- today's `runJob` body moves unchanged into `function send(msg: RenderJob, place: PlaceText | null): Promise<JobResult>`, whose worker branch posts `{ ...msg, id, ...(place === null ? {} : { place }) }`; the overloads of `runJob` stay, and the implementation becomes `return throughPlace(placeOfJob(msg), (place) => send(msg, place));`. `runInline` does not change.

`src/site/explorer/worker.ts` (132 lines): imports `admitPlace` from `./place-source.ts`; `ctx.onmessage` runs `if (msg.place) admitPlace(msg.place);` before it chains the answer.

`src/site/print-room/app.ts` (378 lines, about 376 after):
- `carried` loses `land` and `coast` and gains `keys: LandKeys`, initialised `keys: NO_LAND_KEYS` (the init line stays under the print width).
- `applyHash`: the two `land`/`coast` lines become `carried.keys = a;`.
- `writeHash`: the two `land`/`coast` lines become `emitLandKeys(p, carried.keys);`.
- `draw`: the overrides become `const overrides: TableOverrides = { ...(carried.type ? { mapType: carried.type } : {}), ...(carried.band ? { band: carried.band } : {}), ...overridesOfLand(carried.keys) };` (`TableOverrides` from `../shared/table-address.ts`, already imported for `TABLE_KEY`).

`src/site/reading-room/app.ts` (385 lines, about 382 after): the same three moves (`carried.keys`, `applyHash`, and `emitLandKeys(p, carried.keys)` in both `prospectHrefFor` and `syncHash`); `recipeOverrides()` returns `TableOverrides` built the same way as the Print Room's.

`src/site/prospect/app.ts` (209 lines): the `overrides` literal's two land/coast lines become `...overridesOfLand(addr)`.
`src/site/ribbon/app.ts` (137 lines): the same.

`scripts/place-files.ts`:
```ts
import { GENERATED } from "./clean-generated.ts";
import { placeFile } from "../src/site/explorer/place-fetch.ts";
import type { PlaceId } from "../src/world/outline-ids.ts";
export const PLACE_TABLE: string; // fileURLToPath(new URL("../src/terrain/outline-places.json", import.meta.url))
/** Writes each place's rings, as the table stores them, to <root>/outlines/<id>.txt; returns how many. */
export async function writePlaceFiles(root: string, table: string = PLACE_TABLE): Promise<number>;
```
and the CLI arm `scripts/kit-fonts.ts` carries (`process.argv[2] ?? GENERATED`, `process.exitCode = 1` on a throw).

`package.json`: `astro:generate` becomes `node scripts/clean-generated.ts && node scripts/kit-fonts.ts && node scripts/place-files.ts && node scripts/build-app-bundles.ts && node scripts/generate-showcases.ts && node scripts/generate-discovery.ts`; the same string replaces the pinned one in `test/site/app-bundles.test.ts`, `test/site/astro-app-surfaces.test.ts` and `test/site/astro-showcases.test.ts`.

No function in the plan passes 50 lines and no file passes 400 (largest after: `src/site/reading-room/app.ts`, about 382).

## Tests, in the order they are written

The prover owes T1 to T9 (unit). The e2e checks E1 to E9 are proved through the CI proof runner (workflow step 11) with the patches named below, one row each, by the implementer, since the prover runs unit tests only (`vellum-footguns` Gate 1 item 9). Every test file is new or named; a shared helper goes in `test-support/` (Gate 1 item 8).

**T1. `test/site/shape-address.test.ts`** (new). Stub first: `src/site/shared/shape-address.ts` with the exact signatures above, where `readShapeKeys` returns `{}`, `shapePairs` returns `[]`, `shapeOf` and `drawnShape` return their argument, and `landDraws` and `coastDraws` return `true`.
- T1a "readShapeKeys reads a shaped world: a form, a real place, and a looseness in hundredths": `outline=round` gives `{ outline: "round" }`; `type=island&outline=ne-1159315211&looseness=67` gives `{ outline: "ne-1159315211", looseness: 0.67 }`. Red on the stub (`{}`). Mutation: read looseness as thousandths (`/ 1000`).
- T1b "readShapeKeys reads a counted world beside type=archipelago": `type=archipelago&islands=12&isleSize=varied&raggedness=40` gives `{ islands: 12, isleSize: "varied", raggedness: 0.4 }`. Mutation: drop the `isleSize` read.
- T1c "the engine's defaults are spelt by leaving them out": `outline=round&looseness=0` gives `{ outline: "round" }`; `type=archipelago&islands=12&raggedness=0&isleSize=equal` gives `{ islands: 12 }`. Mutation: keep a looseness of 0.
- T1d "a shape the engine would refuse reads as null, whole": each of `outline=ne-0000000001`, `outline=texas`, `outline=`, `looseness=abc` with `outline=round`, `looseness=4.5` with `outline=round`, `looseness=50` alone, `type=archipelago&islands=1`, `type=archipelago&islands=101`, `type=archipelago&islands=2.5`, `islands=12` with no type, `type=island&islands=12`, `type=archipelago&islands=12&outline=round`, `type=archipelago&islands=12&isleSize=huge`, `isleSize=varied` alone, `raggedness=40` alone, gives `null`. Red on the stub (`{}` is not `null`). Mutations, each a row: drop the type test; drop the outline-beside-count test; read `islands` with `Number` in place of `seedFromHash`.
- T1e "looseness and raggedness clamp at 1, as the coast does": `outline=round&looseness=150` gives looseness 1; `type=archipelago&islands=3&raggedness=999` gives raggedness 1. Mutation: drop the clamp.
- T1f "shapePairs writes the keys in one order, and reading them back gives the same shape": for `{ outline: "ne-1159315211", looseness: 0.29 }`, `{ outline: "crescent", looseness: 1 }`, `{ islands: 100, isleSize: "varied", raggedness: 0.01 }`, the pairs are in `SHAPE_KEYS` order (asserted as the exact array for the first) and `readShapeKeys` over them (with `type` `archipelago` for the count) deep-equals the shape. Red on the stub (`[]`). Mutation: `Math.floor` in place of `Math.round` (0.29 * 100 is 28.999999999999996).
- T1g "drawnShape drops a count off the archipelago, keeps an outline on every type, and spells the defaults": `drawnShape({ islands: 12, isleSize: "varied" }, "island")` is `{}`, and with `"archipelago"` is the same shape; `drawnShape({ outline: "round", looseness: 0 }, "continent")` is `{ outline: "round" }`; `drawnShape({ outline: "round", islands: 5 }, "archipelago")` is `{ outline: "round" }`. Mutation: drop the type test.
- T1h "landDraws and coastDraws follow what the world draws": the truth table over `{}`, `{ outline: "round" }`, `{ outline: "round", looseness: 0.5 }`, `{ islands: 12 }`: land true, false, false, false; coast true, false, true, false. Red on the stub. Mutation: `coastDraws` ignoring the looseness.
- T1i (the premise of T1h) "a land fraction draws nothing on a shaped or counted world, and a coast warp nothing on a counted world or a shape held exact, but it does on a loosened shape": `generateWorld(defaultRecipe(seed, { gridW: 160, gridH: 120, ...o }))` compared on `elev.data` (element by element) and `seaLevel`: `outline: "round"` at seed 30 on the island with land 0.1 against 0.7 at looseness absent and at looseness 1 (equal); coast 0 against 1 at looseness absent (equal) and at looseness 0.5 (different, the witness that the read can see a change); `mapType: "archipelago", islands: 20` at seed 1 with land 0.1 against 0.7 and coast 0 against 1 (equal). The form `round` needs no place source. This test reds when the engine starts drawing from a field the links leave out. Mutations, each by line: in `landShareOf` (`src/world/generate.ts`) the outlined return becomes `return recipe.landFraction;`; its counted return the same; in `shapedElevation` (`src/terrain/heightfield.ts`) the line computing `du` becomes `const du = (coastWarp * coastWarpAt(u, v, s)[0]) / 2;`; in `lobeDistance` its `return d;` becomes `return d + s.coastWarp * 0.1;`. Each reds exactly its own assertion.

**T2. `test/site/address-grammar.test.ts`** (edited).
- Existing: "readWorldKeys reads the world keys every room carries" gains `shape: {}` in its expected object; "readWorldKeys: absent keys are null ..." expects `Object.values(k)` to be `[null, null, null, null, null, null, {}]`.
- New T2a "readWorldKeys carries the shape keys, and leaves out a land and a coast that draw nothing beside them": `seed=42&type=island&outline=round&looseness=50&land=350&coast=55` gives shape `{ outline: "round", looseness: 0.5 }`, land `null`, coast `0.55`; `type=archipelago&islands=12&land=350&coast=55` gives land `null`, coast `null`; `outline=round&coast=55` gives coast `null`. Red before `readWorldKeys` changes (no `shape`). Mutation: `readWorldKeys` skips `gateLand`.
- New T2b "a refused shape reads as absent: the link draws the seed's own world, as an unknown type does": `islands=12&land=350` gives shape `{}` and land 0.35. Mutation: return the refused group's partial fields.
- New T2c "emitLandKeys writes land, coast and the shape in that order, and overridesOfLand draws the same": for `{ land: 0.35, coast: 0.55, shape: {} }` the params string is `land=350&coast=55`; for `{ land: null, coast: 0.55, shape: { outline: "round", looseness: 0.5 } }` it is `coast=55&outline=round&looseness=50`; `overridesOfLand` of the second is `{ coastWarp: 0.55, outline: "round", looseness: 0.5 }`. Mutation: write the shape before the coast.

**T3. The room address tests** (edited): `test/site/print-room-address.test.ts`, `test/site/reading-room-address.test.ts`, `test/site/prospect-address.test.ts`, `test/site/ribbon-address.test.ts`. Each whole-object `deepEqual` of an address gains `shape: {}` (print room lines 24 and its `NONE`; reading room line 25 and its `NONE`; prospect lines 16 and 30; ribbon lines 8 and 21). Each file gains one test, "the <room> address reads the shape keys": `#seed=42&type=archipelago&islands=12&isleSize=varied` gives `shape` `{ islands: 12, isleSize: "varied" }`. Red before T2's change. These four hold that each room's parser spreads `readWorldKeys`; the mutation that reds all four is T2a's, and the implementer names that in the guard table rather than proving each separately (step 15).

**T4. `test/site/table-address.test.ts`** (edited).
- T4a "a shaped sheet and a counted sheet read and emit back field for field": `k-s.seed-42.type-island.coast-55.outline-ne-1159315211.looseness-67.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13` and `k-p.seed-42.type-archipelago.islands-12.isleSize-varied.raggedness-40.style-ink.i-3.year-814` each parse to the overrides they state and `emitTable` gives back the same string. Red before the change (the fields are ignored as unknown). Mutation: `worldFields` drops the shape pairs.
- T4b "a place's ID is one field though it holds the pair's own hyphen": the first sheet's `overrides.outline` is `"ne-1159315211"`. Mutation: `readFields` splits at `lastIndexOf(PAIR)`.
- T4c "a sheet whose shape the engine would refuse is dropped, never drafted as another world": the T4a survey with each of `islands-12` (no type), `type-archipelago.islands-12.outline-round`, `looseness-50` with no outline, `outline-texas`, `type-archipelago.islands-101` in place of its world fields gives `[]`. Mutation: map a `null` shape to `{}` in `readWorld`.
- T4d "a land or coast the shape draws nothing from is left out, so one world is one sheet": `k-s.seed-42.type-island.land-350.coast-55.outline-round.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13` parses with no `landFraction` and no `coastWarp` and emits without them; `groupByWorld` puts it and the same sheet without `land-350.coast-55` in one group. Mutation: skip `gateLand` in `readWorld`.
- T4e "two sheets that differ only by their outline are two worlds": `groupByWorld` over the T4a survey and the same with `outline-ne-1159320637` gives two groups. Mutation: `worldFields` drops the shape pairs (the same row as T4a's; this test reds with it).
- Edited: "six full items stay a workable link" takes `overrides: { mapType: "archipelago", band: "temperate", coastWarp: 1, outline: "ne-1159315211", looseness: 1 }` as its widest item and its bound becomes `1112`, with one dated line at the bound: `// 2026-10-30, Issue #854: the widest sheet is a shaped archipelago (outline, looseness, coast), six of them 1,067 characters; the pin keeps the 45 characters of headroom 950 kept over the old widest, 905.` Mutation: none owed (a bound); its red is any field added without the pin moving.

**T5. `test/site/chart-drawer.test.ts`** (edited): new "surveyItemFrom carries the shape the sheet was drawn with": `surveyItemFrom({ seed: 42, overrides: { mapType: "archipelago", islands: 12, isleSize: "varied" }, render: { style: "antique" }, band: 2, seat: { lx: 3, ly: 4 } })` has those three in `overrides`, and `{ outline: "ne-1159315211", looseness: 0.5 }` likewise. Red before the change. Mutation: drop `...shapeOf(o)`.

**T6. `test/site/place-source.test.ts`** (new). Stub: `admitPlace` does nothing.
- T6a "an admitted place draws, and the store is installed once": after `admitPlace({ id: "ne-1159315211", text })` (text from `src/terrain/outline-places.json`, read as data), `ringsOf("ne-1159315211")` returns rings; `sourceGeneration()` rises by exactly 1 across two admits of two places. Red on the stub (`outline ne-1159315211 is not loaded`). Mutation: install on every admit (the generation rises by 2).

**T7. `test/site/place-fetch.test.ts`** (new). Stub: `placeUrl` and `placeFile` return `""`, the loader resolves `{ id, text: "" }` without fetching, `placeOfJob` returns `null`.
- T7a "a place is served at the site's root under outlines/": `placeFile(id)` is `outlines/ne-1159315211.txt` and `placeUrl(id)` is `/outlines/ne-1159315211.txt`. Mutation: a relative `placeUrl`.
- T7b "placeOfJob names a real place and nothing else": a draw, region, atlas, prospect and ribbon job with outline `ne-1159315211` each give it; outline `round`, no outline and a tour job give `null`. Mutation: return the form too.
- T7c "the loader fetches a place once, admits it into this realm, and hands its text on": a fake fetcher counting calls; two loads of one place make one call and both resolve to `{ id, text }`; the fake `admit` saw it once. Mutation: no memo.
- T7d "a failed fetch rejects with the place in the reason, and the next load tries again": the fake answers `{ ok: false, status: 404 }` first, then the text; the first load rejects with a message matching `/^the outline of ne-1159315211 could not be fetched \(404\)/`, the second resolves, two calls. Mutation: keep the rejected entry in the memo.
- T7e "a fetcher that throws rejects the same way": message matching `/^the outline of ne-1159315211 could not be fetched/`.

**T8. `test/site/place-gate.test.ts`** (new). Stub: `createPlaceGate` returns `(place, send) => send(null)`. A `deferred()` helper is written in the test file itself.
- T8a "a plain job with nothing waiting is sent in the same turn": `gate(null, send)` and the record holds it before any `await`. Mutation: always go through the promise chain.
- T8b "a place job is sent with its text once it has arrived": a deferred load; `send` not called before the resolve, called with `{ id, text }` after. Red on the stub.
- T8c "a plain job behind a place still being fetched waits its turn": `gate(id, sendA)` then `gate(null, sendB)`; before the load resolves the record is empty; after it, the record is `["A", "B"]`. Red on the stub, which sends both at once (the record holds both before the resolve). Mutation: the plain branch ignores `tail`.
- T8d "a failed fetch rejects its own job and the next still goes": the load for A rejects; `gate(null, sendB)` queued behind it is sent; A's promise rejects with the load's error. Mutation: chain the next job on `fetched` in place of `mine`.
- T8e "once every place has arrived the gate is clear again": after A resolves and the microtasks drain, `gate(null, sendC)` is sent in the same turn. Mutation: never clear `tail`.

**T9. `test/site/place-files.test.ts`** (new). Stub: `writePlaceFiles` returns 0 and writes nothing.
- T9a "every place gets its own file, holding its rings as the table stores them": into a `mkdtempSync` folder (removed in `finally`); the returned count equals `PLACE_ID_LIST.split("\n").length`; the file at `join(dir, placeFile("ne-1159315211"))` reads exactly the table's string for Texas. Red on the stub. Mutation: write `rings + "\n"`.
- T9b "a table's places are written and nothing else": a two-entry fixture table written to a temp file gives exactly two files under `outlines/`. Mutation: write the committed table whatever the argument.

**The e2e checks** (Gate 2 before each; each in a `step`, each evaluate that runs a job catches the rejection and returns `{ ok: false, error }` so the check reds on its assertion with the reason, never on a throw). The two readings each check owes (the Tests bar in `.claude/agents/vellum-planner.md`): every reading below is UNVERIFIABLE before the change, because each reads behaviour only this change drives (the gate, the served files, the readers learning the keys), and no probe can stage it without editing source. PRW6 reads today's behaviour, but its reading needs a built site, which the planner's brief excludes, so it is UNVERIFIABLE too; its expected value is derived from `writeHash` in `src/site/explorer/hash-sync.ts` as it stands (seed, style, legend, then `arms` and `beasts` written as 0), not read. The implementer's first run of each, at the commit before its wiring (red, PRW6 green) and after it (green), is the reading; Stop conditions name a first run that lands on the wrong side.

- **Two traps every check below steps around.** A page's resource timing buffer holds 250 entries by default, so a check that counts a fetch in a page that has been open a while first calls `performance.clearResourceTimings()` in the same evaluate, before the job. And an Explorer arrival whose link carries no `table` key takes the device's stored table (`folioOnArrival` in `src/site/shared/table-store.ts`), which an earlier suite in the lane may have filled, so a check comparing the Explorer's hash exactly compares it with any `&table=...` pair removed (`.replace(/&table=[^&]*/, "")` inside the evaluate; the pattern holds no backslash, `vellum-footguns` Gate 2 item 5). And a hash-to-hash navigation on one path never re-boots the page (`handbook/specs/settle-doctrine.md` clause 9), so every navigation in PRW3, PRW5, RR44 and CD64 goes through `about:blank` first, as `goto` in `e2e/support/room.ts` does, then polls for the boot committing; in `e2e/suites/print-room.ts` the calls run in this order: `prlLink` (with PRW6), then `prwWarp`, then `prwPlace` (PRW3 in the Explorer, then PRW4 in the Print Room), then `prwCount` (PRW5).
- **E1, R18** in `e2e/suites/render.ts`, a new step after R17: "R18 a real place draws through the worker and inline alike, stamped with its outline, fetched once". Evaluate (clearing the resource timings first): `m = { kind: "draw", seed: 42, overrides: { mapType: "island", outline: "ne-1159315211", looseness: 0.5 }, render: { style: "antique", widthPx: 1500, legend: true } }`, `j = await window.__vellumRunJob(m)`, `i = window.__vellumRunInline(m)`; assert `j.svg === i.svg`, `j.svg` contains `data-vellum-outline="ne-1159315211"` and `data-vellum-looseness="0.5"`, and `performance.getEntriesByType("resource")` holds exactly one entry whose path is `/outlines/ne-1159315211.txt`. Mutation (proof runner): in `src/site/explorer/worker.ts` delete the `admitPlace` line (the worker throws `outline ne-1159315211 is not loaded`).
- **E2, B4** in `e2e/suites/fallback.ts`, a new step after B3 inside the `try`: "B4 fallback: a real place draws inline, from the outline the page fetched". With the worker blocked, and the resource timings cleared first: `__vellumUsesWorker() === false`, `await __vellumRunJob(m)` (E1's job) resolves, its svg carries the outline, and the page's resource entries hold `/outlines/ne-1159315211.txt` once. Mutation: in `createPlaceLoader` drop the `admit` call (inline throws not loaded).
- **E3, PRW3** in `e2e/suites/print-room/link.ts`, a new function `prwPlace` mirroring `prwWarp`: navigate the Explorer to `#seed=42&style=antique&legend=1&arms=0&beasts=0&outline=ne-1159315211&looseness=50`; once drawn (the existing readiness predicate), assert `#map svg` carries `data-vellum-outline="ne-1159315211"` and `data-vellum-looseness="0.5"`, `location.hash` (its table pair removed) equals that hash exactly, and `#order-plates`'s href (its table pair removed) ends with `&outline=ne-1159315211&looseness=50`. "PRW3 a place's link opens it in the Explorer, writes back the same link, and its road to the Print Room carries it". Mutation: in `writeHash` delete the `emitLandKeys` line.
- **E4, PRW4** in the same function, after following that href to the Print Room: "PRW4 the place Taken to the Print Room prints as that place": the proof's svg carries `data-vellum-outline="ne-1159315211"` and the Print Room's hash carries `outline=ne-1159315211&looseness=50`. Mutation: the Print Room's draw overrides drop `...overridesOfLand(carried.keys)`.
- **E5, PRW5** in the same file, `prwCount`: navigate the Explorer to `#seed=1&style=antique&type=archipelago&legend=1&arms=0&beasts=0&islands=20&isleSize=varied&raggedness=40`; assert the stamp's `data-vellum-islands="20"`, `data-vellum-isle-size="varied"`, `data-vellum-raggedness="0.4"`, and `location.hash` (its table pair removed) equals that hash exactly. "PRW5 a counted link opens its count in the Explorer and writes back the same link". Mutation: `readHash` drops `chooseShape(keys.shape)`.
- **E6, PRW6** in `prlLink`, after its readiness wait: "PRW6 a plain chart's link is byte-identical to today's": `location.hash`, its table pair removed, `=== "#seed=42&style=antique&legend=1&arms=0&beasts=0"`. Fixture reading: UNVERIFIABLE (a build the planner's brief excludes); the expected value is derived from today's `writeHash`. Mutation reading: UNVERIFIABLE for the same reason. Mutation: in `emitLandKeys` the shape loop becomes `params.set("outline", String(keys.shape.outline));`.
- **E7, PB19** in `e2e/suites/prospect.ts` (its own `goto` and `opened` from `e2e/suites/prospect/kit.ts`): `#seed=42&style=antique&type=island&outline=ne-1159315211&i=1` draws its plate (status empty, the state hook non-null), and the page's resource entries hold `/outlines/ne-1159315211.txt`. "PB19 a place's link reaches the Prospect, which engraves from that place". Mutation: `src/site/prospect/app.ts` drops `...overridesOfLand(addr)`.
- **E8, RB17** in `e2e/suites/ribbon.ts`: the same over `#seed=42&style=antique&type=island&outline=ne-1159315211`. "RB17 a place's link reaches the Ribbon, which surveys that place". Mutation: the Ribbon's drop.
- **E9, RR44** in `e2e/suites/reading-room.ts`: `/reading-room/#seed=42&style=antique&legend=1&arms=0&beasts=0&type=island&outline=ne-1159315211` draws; `.rf-chart svg` carries `data-vellum-outline="ne-1159315211"` and the room's hash keeps `outline=ne-1159315211`. "RR44 a place's link opens it in the Reading Room and the room's own address keeps it". Mutation: `recipeOverrides` drops `...overridesOfLand(carried.keys)`.
- **E10, CD64** in `e2e/suites/chart-drawer.ts` with its body in `e2e/suites/chart-drawer/portfolio.ts`, on the pattern of `cd19PortfolioDrafts`: `/explorer/portfolio/#table=k-s.seed-42.type-island.outline-ne-1159315211.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13` drafts its sheet, and the page's resource entries hold `/outlines/ne-1159315211.txt` and nothing under `/explorer/portfolio/outlines/`. "CD64 the Portfolio, a page one level down, drafts a place's sheet from the site's root". Mutation: `placeUrl` drops its leading `/`.

## Order of commits

Each step's red is seen before its green; commit before any mutation run ("Commit before you mutate"). Push at the first commit (workflow step 9).

1. This plan, copied unchanged to `handbook/plans/800/854/854-plan.md`, and T1 with its stub `src/site/shared/shape-address.ts` (red on T1's assertions).
2. `src/site/shared/shape-address.ts` built (T1 green).
3. T2, T3 edits and new tests (red: no `shape` on the addresses).
4. `src/site/shared/address-grammar.ts` (T2, T3 green).
5. T4, T5 (red).
6. `src/site/shared/table-address.ts`, `src/site/explorer/chart-drawer.ts` (green).
7. T6 to T9 with their stubs `src/site/explorer/place-source.ts`, `place-fetch.ts`, `place-gate.ts`, `scripts/place-files.ts` (red).
8. Those four built; `package.json`'s `astro:generate`; the three pinned strings (green, and `npm test` whole).
9. E1 to E10 written; `npm run build`, then each suite run alone (red, on its assertion).
10. `src/site/explorer/worker-client.ts`, `src/site/explorer/worker.ts`.
11. `src/site/explorer/shape-choice.ts`, `hash-sync.ts`, `app-wiring.ts`.
12. `src/site/print-room/app.ts`, `src/site/reading-room/app.ts`, `src/site/prospect/app.ts`, `src/site/ribbon/app.ts`; build, each suite alone (green).
13. The doctrine edits below.

## Rosters and doctrine

- **`astro:generate`'s command string**: three pins (`test/site/app-bundles.test.ts`, `test/site/astro-app-surfaces.test.ts`, `test/site/astro-showcases.test.ts`), joined by hand.
- **No new page, sheet, bundle entry, suite or lane.** The checks join existing suites; no roster in `handbook/specs/site-architecture.md`'s list is joined.
- **`tsconfig.worker.json`**: no new worker; `place-source.ts` and `place-gate.ts` join the worker pass through `worker.ts` and `worker-client.ts` and name no DOM global (`fetch` is the worker library's too).
- **`SOURCE_READS`** (`test-support/source-read-list.ts`): T6 and T9 read `src/terrain/outline-places.json`, which is JSON data, not a source file the guard lists; nothing joins.
- **`handbook/specs/site-architecture.md`**:
  - "**`astro:generate` is clean, fonts, bundle, showcases, discovery, in that order**" becomes "**`astro:generate` is clean, fonts, places, bundle, showcases, discovery, in that order**".
  - A new bullet after "The site's fonts are generated, from the design kit.": "- **A real place's outline is served one file to a place, never bundled.** `scripts/place-files.ts` writes each place's rings from `src/terrain/outline-places.json` to `generated/outlines/`, one file each, and the one reader is `runJob` in `src/site/explorer/worker-client.ts`: before it sends a job that draws a place it loads that place (`createPlaceLoader` in `src/site/explorer/place-fetch.ts`), hands the text to the worker with the job and admits it into the page for the inline path (`admitPlace` in `src/site/explorer/place-source.ts`). The address is root-absolute (`placeUrl` there), because every surface at every depth fetches through that function. A plain job sent while a place is still being fetched waits its turn (`createPlaceGate` in `src/site/explorer/place-gate.ts`), so the worker stays first in first out."
- **`handbook/specs/explorer-doctrine.md`**, "The address is a photograph.", appended after "...so a link written at the bottom reads back at the bottom.": "**A recipe field is spelt one way in every address.** An engine default is spelt by leaving its key out (a looseness or a raggedness of 0, sizes alike), a land or a coast the world's shape draws nothing from is left out too (`gateLand` in `src/site/shared/address-grammar.ts`), and a shape or a count the engine refuses is read as absent in a link and drops the sheet on the Chart Table (`readShapeKeys` in `src/site/shared/shape-address.ts`), so one world takes one link and one sheet."
- **`handbook/specs/engine-invariants.md`**, the outline paragraph: "A place's rings reach the terrain only through the source a host installs (`setPlaceSource` in `src/terrain/outline-store.ts`)," becomes "A place's rings reach the terrain only through the source a host installs (`setPlaceSource` in `src/terrain/outline-store.ts`; the site's host is `admitPlace` in `src/site/explorer/place-source.ts`, installed once in the page and once in the worker),".
- **No ratified line is contradicted.** The body's "the islands control shows on every type" and its acceptance lines on that are already superseded by ruling 7; the body is left as written.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, then `npm test` whole (then `npm run astro:generate`).
- `npm run build`, then each touched suite alone, one at a time, never the full lanes: `VELLUM_E2E_SUITES=render npm run test:e2e`, then `fallback`, `print-room`, `prospect`, `ribbon`, `reading-room`, `chart-drawer`. Time each new step (Gate 2 item 17) and name the seconds in the body.
- `ls generated/outlines | wc -l` after `npm run astro:generate` prints 5646; `du -sh dist/outlines` after the build, named in the body.
- The gzip size of every twin `BUNDLE_ENTRIES` names (`scripts/build-app-bundles.ts`), of `generated/explorer/worker.bundle.js` and of each shared chunk, before and after, named in the body; this pull request adds code and no data to any of them (Measured, above), and a twin that grows by more than 5 KB gzipped is a stop condition.
- `vellum-plate-reader` is not owed: pull request 1 changes no appearance.
- `vellum-guard-prover`: T1 to T9, one round. The e2e mutations through `npm run proof -- send` with the suites named.

## Calls made

The implementer copies these into its step 12 comment.

1. **The split** was M1 on the menu, not a call; Alex ruled two steps (comment 6527008800), and the number is kept so the calls after it keep theirs.
2. **The fetch lives in `runJob` and nowhere else**, keyed on a job's outline being a place, with the text riding the worker message and each realm holding one growing store. Rule: `handbook/specs/engine-invariants.md`, "A new surface joins that path rather than building a world its own way"; `handbook/specs/site-architecture.md`, one function as the single glue both transports call.
3. **One file per place, at `/outlines/<id>.txt`, written by a new generate step `scripts/place-files.ts`.** Rule: Issue #853 ruling 2 ("a chart fetches its one place"); `handbook/specs/site-architecture.md`, link form for shared code (root-absolute) and the pins a new step reds (budgeted).
4. **First in first out kept**: a plain job waits behind a place still being fetched; with nothing waiting it is sent at once, exactly as today. Rule: `handbook/specs/site-architecture.md`, "first in first out ... a concurrency check may rely on that".
5. **A failed fetch is that one job's error**, shown on the room's own error line, and the next draw retries. Rule: Issue #192's discipline (a malformed or failed read never throws silently) and each room's existing error channel.
6. **The link keys are the record's own words** (`outline`, `looseness`, `islands`, `isleSize`, `raggedness`), with whole hundredths for the two sliders. This is the one call pull request 1 bakes in, flagged so Alex sees it before the build. Rule: `land` and `coast` already match `recipeMetadataNode`'s words, and `handbook/specs/conventions.md` ratifies the address grammar once and guards it. The Chart Table's round named its own key at a sitting (`handbook/specs/ui-design.md`, The voice); this call was put before Alex with the menu, flagged, and he did not overrule it (comment 6527008800).
7. **Refusal by each grammar's rule**: a hash ignores the whole shape group, the Chart Table drops the sheet; a count out of 2 to 100 is refused, looseness and raggedness clamp at 1. Rule: the body's Approach ("a count out of Sub 3's range reads as no world, as the stamp does") and `src/site/shared/table-address.ts`'s "undefined = not stated; null = stated and unreadable, which drops the whole ITEM".
8. **A count is read only beside `type=archipelago`.** Rule: `countedOf` throws on a count off the archipelago, and a link with no type lets the seed roll it.
9. **One world, one spelling**: defaults by omission; a land or coast that draws nothing left out of links, sheets and overrides. Rule: the measurements above; `sameSheet`'s byte comparison; `handbook/specs/engine-invariants.md`, "What the generator does not do". T1i holds the premise, so an engine change that makes those fields draw reds a test rather than silently losing them from links.
10. **The Explorer holds a link's shape in `src/site/explorer/shape-choice.ts`**; a type change off the archipelago drops the count from what is drawn (the holder keeps it); Random and Enter keep shape and count as they keep the type menu. Rule: the engine's refusal, and the Random button's existing reset of the land and coast gates only. Pull request 2's controls may change what Random does with a shape; that is its sitting's.
11. **The Chart Table's six-sheet pin rises from 950 to 1,112.** Rule: `CLAUDE.md`, "A bound is derived": the widest sheet is computed (1,067 for six), and the old pin's 45 characters of headroom are kept.
12. **The checks go into existing suites.** Rule: `handbook/specs/site-architecture.md`, the five rosters a new suite joins.
13. **No bold delight is taken.**
14. **In pull request 1 the land and coast sliders stay live on a shaped or counted world** and redraw the same world where they draw nothing; pull request 2 stands them down as Alex ruled M2 and M3 (Rulings). Rule: the stand-down's look waits for its stills.

## Open decisions

None. Every item of the step 6 menu is ruled (below), and none of calls 2 to 14 was overruled.

## Rulings

Alex, 2026-10-30, Issue #854 comment 6527008800 (https://github.com/ahl-gram/Vellum/issues/854#issuecomment-6527008800), taken by the orchestrating session in `AskUserQuestion`; each is the option he chose, quoted as the menu worded it, and each was this plan's recommendation. Every premise the menu stated was measured (Measured, above), and none is false.

- **M1, "Two steps (Recommended)".** This plan is step 1 as written: the link keys and the fetch, with nothing new on the Broadside. Step 2, the visible controls, gets its own planner run (`854-pr2-plan.md`) after the stills sitting. What it changed here: the split stated in "What the issue asks" and the rejected one-pull-request alternative now cite the ruling; call 1 records it.
- **M2, "Set aside only where idle (Recommended)".** Sea level is dimmed with a short note on every shaped map; coast is dimmed only while the shape is exact and comes back the moment the shape is loosened. Step 1's `landDraws` and `coastDraws` already say exactly this (Measured; T1h, T1i), so step 2 drives its stand-down from them and nothing in step 1 changes.
- **M3, "Takes coast's row (Recommended)".** On a counted map the raggedness slider sits in coast's place, and coast returns when the count is cleared. `coastDraws` is false on every counted shape, so step 1 changes nothing; step 2 swaps the rows.
- **M4, "Only for archipelago (Recommended)".** The island-count control shows only when "archipelago" is picked in the map-type menu. This confirms design 4 and call 8: a count is always written beside an explicit `type=archipelago`, and a link with a count and no type is refused. Nothing in step 1 changes.
- **M5, "Search box (Recommended)".** The place is picked from a box that lists matching places as Alex types, styled like the rest of the Explorer panel. Step 2's; it loads the name index on demand (Hand-offs).
- **M6, "Together with the controls (Recommended)".** Issue #931 (the faint end words and track) and Issue #930 (the open panel over the Drawer tab) are fixed in step 2, their look ruled at the same sitting as the crowding. Step 1 touches neither.

## Stop conditions

Hand back, with the command and its output, when:
- a symbol or path this plan names is not where it says (`readWorldKeys`, `WorldKeys`, `readWorld`, `worldFields`, `TableOverrides`, `surveyItemFrom`, `draftOverrides`, `DrawOverrides`, `readHash`, `writeHash`, `landFromHash`, `coastFromHash`, `runJob`, `runInline`, `ctx.onmessage`, the rooms' `carried`, `applyHash`, `writeHash`, `prospectHrefFor`, `syncHash`, `recipeOverrides`, `setPlaceSource`, `sourceGeneration`, `ringsOf`), or `git diff --stat 108f8db6 origin/main` names a code or test file this plan lists;
- a unit test outside the files named here reds, other than the three `astro:generate` pins and the whole-object `deepEqual`s T3 names;
- any test in T1 to T9 cannot be made red on the assertion it names with its stub, or a named mutation leaves it green;
- T1i's equal pairs are not equal, or its loosened-coast pair is equal (the engine no longer matches the measurements this plan's spelling rests on);
- the six widest sheets encode to more than 1,112 characters;
- a file passes 400 lines or a function 50 after the change (`src/site/reading-room/app.ts` is the nearest, expected about 382);
- `npm run check` reds in the worker pass on a file this plan adds;
- an e2e check's first run after its wiring is red, or its run at commit 9, before its wiring, is green (its two readings landing on the same side), or a step takes more than 10 seconds. PRW6 is the one exception by design: it holds today's behaviour, so it is green at commit 9 and after, and its only red is its own mutation, run through the proof runner; PRW6 red at commit 9 (its expected value, derived from today's `writeHash` and not read, being wrong) is a hand-back;
- `fetch` of a place file in the harness answers anything but 200 with the table's text;
- any change moves a committed chart, the golden or `test/site/hero-charts.test.ts` (this pull request is site-only and must move none);
- a bundle twin grows by more than 5 KB gzipped (the plan expects code only, a few KB raw).

## Hand-offs

- **Pull request 2 (this issue's controls)**: writes the Explorer's holder through `chooseShape` and reads `drawnShape`, `landDraws` and `coastDraws` for the stand-downs; loads the name index (`src/world/outline-place-names.json`) for the picker on demand, never into the worker; owes the twins rule for the 63 groups of rows that read alike; builds what M2 to M6 ruled (Rulings): sea level set aside on every shaped map and coast only while the shape is exact, raggedness in coast's row on a counted map, the count control only when "archipelago" is picked in the map-type menu, the search box, and the fixes for the crowding, Issue #930 and Issue #931, closing both.
- **Issue #855 (the feel sitting)**: its docket gains everything pull request 2 rules as provisional (the controls' names, seats and readouts, the stand-downs, the picker, the crowding fix); the link keys and the spelling rules here are contract, this plan's calls 6 to 9, put before Alex with the menu and not overruled (comment 6527008800); M2 to M6 are feel rulings and join its docket as provisional.
- **Issue #393 (the surface)**: `culture` joins `LandKeys`, `emitLandKeys` and `overridesOfLand` in `src/site/shared/address-grammar.ts` and `TableOverrides` once, which reaches every room; whoever lands second reconciles (`handbook/specs/rulebook.md`).
- **Issue #856 (the founding words)**: a founded shape or count should be spelt as the site spells it (a looseness of 0 left out), or a founded world's stamp differs from the same world opened from a link.
- **Issue #1107**: nothing; it shares no file with this issue.

## Pull request 2: what its sitting needs

Not a plan; the stills its planner run starts from, for the dispatcher to have drawn (by `vellum-designer` in a detached tree, workflow step 6) now that M1 to M6 are ruled, while pull request 1 builds. Every arm draws the ruled behaviour: sea level set aside with its note on a shaped map and coast set aside only while the shape is exact (M2); raggedness in coast's row on a counted map (M3); the count control only when "archipelago" is picked in the map-type menu (M4); the picker as a search box listing matches as one types (M5); and the end words, the track and the panel's foot as the fixes for Issue #931 and Issue #930 would draw them, measured beside today's (M6). The chart behind each still is the plain world of its seed, as the Sub 0 round drew its Explorer states (`design/shape-and-count/README.md`): the slip, its rows, the picker and the held rows read the same over any chart, and nothing on main can draw a shape in the Explorer until pull request 1 lands.

- **Viewports**: 1024 by 768 (the desk frame, where the crowding bites), 1024 by 900 (the Drawer tab, Issue #930), 1440 by 900. For each still: the full frame, a 2x crop of the Land panel, and a crop of the slip's foot against the Drawer tab.
- **States**, on the Sub 0 round's own seeds so Alex compares like with like:
  - plain, seed 30, the seed's choice everywhere;
  - shaped and exact: Texas (`ne-1159315211`), seed 30, island, looseness 0;
  - shaped and loosened: the same at looseness 0.75;
  - counted: archipelago, seed 1, about 20, alike, raggedness 0;
  - the picker open: "tex" typed; "georgia" typed (the country and the state); the longest name ("Professor Doctor Ingenieur W. J. Van Blommestein Meer").
- **The control**: today's slip at each viewport, plain state only.
- **The arms** (the crowding fix; every arm in every state, the stood-down rows drawn as M2 and M3 ruled):
  - A, only what applies: the looseness row only with a shape, the islands row only on the archipelago, sizes and raggedness only with a count, and the sliders that draw nothing folded into one held line with its note;
  - B, everything as drawn, tighter: every row of the Sub 0 mock, the held rows dimmed in the dashed box, the ledger's row pitch and the panel heads tightened until the tallest state fits 1024 by 768;
  - C, the shape in its own fold: The Land keeps today's four rows and one press that opens a fold holding the picker, looseness, islands, sizes and raggedness in place of The Hand.
- **Measured on each** by `vellum-plate-reader`: the slip's scroll height at 1024 by 768 (0 passes); the slip's foot against the Drawer tab's rect (no overlap passes); every new word's contrast on its ground and the end words' and the unfilled track's (4.5:1 for text, 3:1 for the track); the picker's input font size (16 px or more).
- **Words, named at the sitting** (stand-ins in the stills: the Sub 0 mock's where it had one): the shape row's label and the picker's empty text and its "no such place" line; the looseness slider's label, end words and readouts at exact, the soft edge, looser and nearly the seed's own; islands ("few", "many", "seed's choice", "about N"); sizes ("alike", "of every size"); the raggedness slider's label and end words; "held"; the note on a shaped world and the note on a counted world; how a twin among the 63 alike rows is told apart; the glossary headwords and notes for each control.
