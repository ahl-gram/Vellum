# Issue #393 plan, pull request 2, revision 1: the written world's link grammar moves beside its founding, so the Writing Room loads none of it

**Revision 1 of `393-pr2-plan.md`** (archived on the branch at `handbook/plans/300/393/393-pr2-plan.md`, and on Issue #393 as comments 6560129195 and 6560129786, sha256 74205703383cf395a8be1e111cc2b173dd6f3c6869b3fdbe63d4e9dbc564b571). What it changes against that plan:
- `writtenParams`, `identityParams` and `IDENTITY_KEYS` move from `src/site/shared/written-address.ts` into `src/site/shared/written-world.ts`, and `FOUND_KEY` and `VERSION_KEY` are exported from `written-address.ts`, so the Writing Room, which imports `written-address.ts` and never `written-world.ts`, stops loading the room address grammar (`src/site/shared/address-grammar.ts`, `src/site/shared/shape-address.ts`, `src/site/explorer/address.ts`, `src/site/shared/year.ts`). This is the layout the first plan's spike measured (its M8), so the costs ruling 1 was taken on hold again.
- U1a and U1b move with their functions into `test/site/written-world.test.ts`, and `test/site/written-address.test.ts` is deleted.
- The doctrine line that cites `writtenParams` in `src/site/shared/written-address.ts` follows it.
- The stop condition on each room's main-thread load (5,000 bytes raw over the spike's figure, a number the first plan gave no basis for) is replaced by a bound derived from what a room loads: each room's list of source modules equals this revision's reading, with its two readings taken here.
- The implementer's five deviations are each blessed (a to e), and CD47's local red gets its route (f).
- M8's sentence "none passes through ... the only paths those differences change" was wrong for one reading: where the spike put these three functions decided the Writing Room's load. R-M1 corrects it.

Everything else in `393-pr2-plan.md` stands as built on the branch, and this revision restates every part of it the remaining build still owes (the evidence, the companion agents, the step 12 record, the pull request's body, the measured-seconds commit, the stop conditions), so the builder needs only this file.

**Planned at:** `origin/main` `781e861ceebfbd4b5cc07f017091bf42f2efa2c3` (`git ls-remote origin refs/heads/main`), the branch `feat/393-writing-room-carry` at `31479298eff50f80d1e82156f170a70ed3883a92` (`git ls-remote origin refs/heads/feat/393-writing-room-carry`), Issue #393 read with 23 comments (`gh api repos/ahl-gram/Vellum/issues/393/comments --paginate | jq length`). The two newest, 6560129195 and 6560129786, are the dispatcher's plan archive of `393-pr2-plan.md` and not rulings; the newest ruling is 6560109654.

**Rulings:** none new. Rulings 1 to 4 (https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6559676010) and ruling 5 (https://github.com/ahl-gram/Vellum/issues/393#issuecomment-6560109654) bind as `393-pr2-plan.md` quotes them, and so do the rulings of pull request 1 it lists.

**Open decisions:** none.

---

## Recon

`vellum-spec-recon` ran on the delta on 2026-11-01 at 31479298. Its ledger: the Writing Room's load STALE against the plan (blocking: 675,893 bytes raw against the spike's 666,851, the only room past the 5,000-byte bound), every other claim it was asked CURRENT (main at 781e861c; no comment newer than the plan archive; the five deviations as the implementer reported them; `npm run lint` and `npm run check` exit 0 at 31479298; `git diff --stat 781e861c HEAD -- src/world` empty; `NAMES_CHECKSUM = 2151669449`), and no open decision on Issue #393 outside rulings 1 to 5. What changed the plan:
- **The Writing Room reaches the address grammar through `written-address.ts` alone.** `src/site/writing-room/app.ts` line 13 imports `readWritten` and `writtenHash` from `../shared/written-address.ts`, which imports `emitLandKeys` and `gateLand` from `./address-grammar.ts` and `SHAPE_KEYS` and `shapeOf` from `./shape-address.ts`; those import `seedFromHash` from `../explorer/address.ts`, which imports `parseYear` from `../shared/year.ts`. Moving the three names that need the grammar out of `written-address.ts` cuts the chain (R-M2).
- **The 5,000 bytes had no stated reason** (`grep -c '5,000'` on the plan prints 1, the stop condition itself), and M4 names no figure for the Writing Room. This revision derives its bound instead (C20).
- Recon could read the spike's chunk list but not its chunk contents (no spike build survives), so "the spike's Writing Room loaded no address grammar" rested on chunk names. This revision measured main, the branch head and the move directly (R-M1, R-M2), which settles it.

## Where the build stands

The branch carries six commits on 781e861c, built by the implementer from `393-pr2-plan.md`:
1. `30873c96` the plan, the lift into the shared folder, the stubs and U1a to U4 red;
2. `96fc9e46` the grammar, U1a to U4 green;
3. `b9f245f8` the Explorer, WR9, WR10, WR14;
4. `ca3a6dae` the four rooms, WR11 to WR13;
5. `12be78cc` the doctrine (the first plan's commit 6);
6. `31479298` the Writing Room's road, WR8 (the first plan's commit 5).

The implementer's runs at 31479298 (its report, relayed by the dispatcher): `npm test` 3491 of 3491; the `writing-room` suite (WR8 to WR14 among its 15) green, and `broadside`, `runninghead`, `print-room`, `reading-room`, `prospect`, `ribbon`, `room-address` and `survey` green; `chart-drawer` 57 of 58 with CD47 red once, then 58 of 58 on the one re-run (f). It stopped on the first plan's load bound. Not yet run: `vellum-guard-prover`, `vellum-plate-reader` (step 11), the step 12 comment, the pull request, `vellum-pr-skeptic`, the measured-seconds commit.

## Specs

On top of `393-pr2-plan.md`'s Specs line (still binding for what remains) and what `CLAUDE.md`'s table owes:
- `handbook/specs/site-architecture.md`, "Build, check and deploy": the bullet "A job that draws a plate loads the plate's code on demand" (a page downloads no code it never runs where a module boundary keeps it out, the principle C17 and C20 rest on) and "One press, one pass" (shared chunks take fixed names, which the probes read).
- `handbook/specs/explorer-doctrine.md`, "The camera, the gesture and the fit", the bullet "The address is a photograph" (the paragraph whose citation follows the move).
- `handbook/specs/settle-doctrine.md`: clauses 3 and 4 (deviation d), items 10, 11, 12 and 15 and "A flake, from red to restore" (f).
- `.claude/skills/vellum-footguns/SKILL.md` Gate 2 item 10 and `.claude/skills/vellum-footguns/references/flake-record.md`, "How to use it" (f).
- `handbook/specs/check-placement.md`, "The unit suite" (where a moved test may live).
- `handbook/specs/conventions.md`, "How code is cited" (the doctrine citation).
- `handbook/specs/development-workflow.md` steps 8 (a revision archived beside the plan it revises), 10 to 15.

## The design

### The link grammar moves beside the founding (C17)

`written-address.ts` goes back to what pull request 1's `src/site/writing-room/address.ts` was (the Writing Room's own reader and writer of `found` and `v`), with its two key constants exported. `writtenParams`, `identityParams` and `IDENTITY_KEYS` (how a written world's address stands beside a room's other keys, which needs the room address grammar) move unchanged into `written-world.ts`, beside `foundAddress`, `heldFor` and `pageFounder`. Every room that writes or seats a written world (the Explorer, the Print Room, the Reading Room) already imports `written-world.ts`, and the Prospect and the Ribbon already load it, so no room but the Writing Room changes what it loads (R-M2). The function bodies are the branch's, byte for byte; only their file and three import lines change, and no behaviour moves (the unit suite 3491 of 3491 and the `writing-room` suite 15 of 15 on the moved code, R-M4).

What it costs and saves, read on built sites (R-M1): the Writing Room loads 177,076 bytes compressed (666,832 raw), against main's 176,560 (666,428) and the branch head's 179,624 (675,893); so the move takes the Writing Room's growth over main from 3,064 compressed bytes (1.74 percent) to 516 (0.29 percent, the road's line and the lifted modules' own text). The Explorer, the Print Room, the Reading Room, the Prospect and the Ribbon each pay 330 to 345 compressed bytes more than on the branch head (raw 51 to 109 more), because the worker client's chunk stands apart from the address grammar's again, as on main and in the spike, where the branch head had folded them into one file. Against main, measured for the first time (M4 derived its base by subtracting chunks): the Print Room, the Reading Room, the Prospect and the Ribbon gain 9,483 to 9,758 bytes compressed, 4.78 to 5.55 percent (30,324 to 31,361 raw, 4.15 to 4.69 percent); the Explorer 9,973 compressed, 4.45 percent; the Portfolio 164 compressed, 0.09 percent (`src/society/culture-ids.ts`, the Chart Table's tongue, call C5). Ruling 1 was taken on "about 9 thousand more bytes once compressed, about 5 percent more" for the four rooms; the measured range stands inside that wording, and this revision does not reopen it.

### The bound on what a room loads (C20)

The first plan bounded each room's bytes against the spike's figure by 5,000 bytes with no reason given. The property that matters is which code a room downloads: the Writing Room must load nothing it never runs, and the four rooms and the Explorer must load exactly the founding modules ruling 1 priced. So the bound is each room's list of source modules, read from the `//#region <path>` lines of its bundle and of every chunk in its import closure (`out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts`), equal to this revision's reading (`393-pr2-r1-modules-b.log`). Against main that list is (R-M2):
- the Writing Room: main's list with `src/site/writing-room/address.ts` and `src/site/writing-room/founding.ts` replaced by `src/site/shared/written-address.ts` and `src/site/shared/founding.ts`, nothing else;
- the Print Room, the Reading Room and the Prospect: main's list plus `src/site/explorer/place-names.ts`, `src/site/shared/founding.ts`, `src/site/shared/written-address.ts`, `src/site/shared/written-world.ts`, `src/society/culture-ids.ts` and the seven founding modules under `src/world/founding/` (`counts.ts`, `found.ts`, `lexicon-peoples.ts`, `lexicon-shapes.ts`, `listed.ts`, `normalize.ts`, `shapes.ts`); the Ribbon the same less `culture-ids.ts`; the Explorer the same less `place-names.ts` (already loaded) plus `src/site/explorer/written-hold.ts`; the Portfolio plus `src/society/culture-ids.ts` alone.

The list is a scanner, and it names its blind spot: a module the bundler emits inside another module's region carries no line of its own (`src/site/shared/founding-names.ts` is one: its `installNames` stands inside `found.ts`'s region in the founding chunk), so the list can only miss a module, never invent one, and it errs toward passing. The byte figures cover that side: the builder's build of this text is predicted to read `393-pr2-r1-closure-b.log` exactly, since the press is byte-reproducible for identical input (`test/site/app-bundles.test.ts`, "the press is byte-reproducible for identical input (#208)") and this planner's build of 31479298 read the implementer's figures byte for byte in all seven rooms (R-M3). A byte difference with equal lists is reported, not a stop (Evidence).

### Deviations the implementer made

- **a. U3b lives in `test/site/table-address-culture.test.ts`**, beside U3a, not in `test/site/chart-drawer.test.ts`: blessed. With it, `chart-drawer.test.ts` counted 406 lines against `max-lines` 400 (the implementer's lint run; 387 today, recon), and both tests pin the Chart Table carrying a written world's tongue. Its title and assertions are the first plan's.
- **b. `carriesFlagship` and `IDENTITY` at module level in `e2e/suites/writing-room/carry.ts`**, out of `wr9Explorer`: blessed. `max-lines-per-function` is 50 and `wr9Explorer` read 53; no check's assertion changed, and `npm run lint` exits 0 (recon).
- **c. U1b's witnesses**: blessed as built. `assert.equal(seated, KEPT.length)` is the first plan's "200 of 200" read through the sample's own length (200 sentences, 200 found, R-M5), stricter than "skip a refusal", and the sample is held by version 1's lock; `assert.ok(landed > 0, ...)` is the witness the first plan's mutation needs, since a hand-written sea level reds only on the 18 sentences that set one (R-M5). A literal 18 would add a pin the lock already holds.
- **d. `carry.ts` builds its own settle**: blessed. `carryKit` builds `makeSettle` from `e2e/support/settle.ts` with `tolerant: true` (`carry.ts` line 37), polled through `until` with 300 tries of `makeSettle`'s 50 ms, and a timeout throws `settle timeout <label>`; that is the shape `handbook/specs/settle-doctrine.md` clause 3 asks for ("Build it in the module or kit that calls it, from that module's own settle") and clause 4 (`tolerant: true` for reads across a navigation), it matches the first plan's "every wait a poll of 50 ms that throws after 300", and `vellum/e2e-throw-inside-step` and `vellum/e2e-sleep-inside-poll` pass.
- **e. The doctrine commit before the road commit**: blessed. Neither depends on the other (the doctrine cites `seatOf`, `foundAddress`, `heldFor`, `writtenParams`, `tableOverridesOf` and `NAMES_CHECKSUM`, all in place before either), and both landed before the evidence run. "Where the build stands" records the order as built.
- **f. CD47's local red** (57 of 58, then 58 of 58 on its one re-run; the payload truncated before it was read). It is the third local red of CD47 with no CI row (the flake record's 2026-10-04 and 2026-10-16 rows), and Issue #1147 is open for it. The builder writes no flake row and no skip: neither `.claude/skills/vellum-footguns/references/flake-record.md` nor `e2e/support/skips.ts` is in this plan, and the dispatcher, who holds the row (C27), is told so by this revision's report. The builder posts Gate 2 item 10's trail on its pull request once it opens (Evidence), and writes every local suite run's output to a file, so a red's payload is kept whole. A CD47 red in this revision's evidence run is a hand-back with the full payload and no re-run (Stop conditions), since its one re-run is spent.

### Rejected alternatives

- *Keeping the layout and rebasing the bound by the measured 9 KB* (the dispatcher's option a): the Writing Room would download four modules it never runs, 3,064 compressed bytes over main (1.74 percent), a cost no ruling priced; the five other rooms would each save 330 to 345 compressed bytes against the move. The house's rule for a page's load is the code it runs (`handbook/specs/site-architecture.md`, the plate's code on demand), and the move is three import lines and one file's tail.
- *A new module of its own for the three names* (`src/site/shared/written-keys.ts`): one more file and one more chunk, on a layout no reading was taken of; `written-world.ts` is the layout the spike measured and every room that needs them already imports.
- *Cutting the grammar out of `written-address.ts` by splitting `address-grammar.ts`*: Issue #1129 edits `readWorldKeys` there, and the move needs no grammar change.
- *A byte tolerance in place of the module lists*: no principle gives one; the lists are exact, and the press is byte-reproducible (R-M3).
- *A permanent unit guard that the Writing Room's load holds no address grammar* (a test beside "no page downloads the plate's code before it draws a plate" in `test/site/app-bundles.test.ts`): C21.
- *Leaving U1a and U1b in `test/site/written-address.test.ts` with its import line re-pointed*: the file would name a module it no longer tests.

## Files

All edits are on the branch as it stands at 31479298. The builder's spike-equivalent diff is `out/393-pr2-r1-dry-run/393-pr2-r1-spike.diff` (copied to the main checkout's `out/393-pr2-r1-dry-run/` when this planner's tree is retired), for reference only: the text below is the plan.

**`src/site/shared/written-address.ts`** becomes exactly:
```ts
export const FOUND_KEY = "found";
export const VERSION_KEY = "v";
const UNVERSIONED = 1;

export type Written = { readonly sentence: string; readonly version: number };

export function readWritten(hash: string): Written | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const sentence = params.get(FOUND_KEY);
  if (sentence === null) return null;
  const raw = params.get(VERSION_KEY);
  if (raw === null) return { sentence, version: UNVERSIONED };
  return { sentence, version: /^[1-9][0-9]{0,8}$/.test(raw) ? Number(raw) : 0 };
}

export function writtenHash(sentence: string, version: number): string {
  return (
    "#" +
    new URLSearchParams([
      [FOUND_KEY, sentence],
      [VERSION_KEY, String(version)],
    ]).toString()
  );
}
```
That is main's `src/site/writing-room/address.ts` with `export` added before its first two lines: its three imports, `IDENTITY_KEYS`, `writtenParams` and `identityParams` leave.

**`src/site/shared/written-world.ts`** becomes exactly:
```ts
import type { WorldRecipe } from "../../world/types.ts";
import { createNameLoader } from "../explorer/place-names.ts";
import { emitLandKeys, gateLand } from "./address-grammar.ts";
import { createFounder, recipeOverrides, type Founder } from "./founding.ts";
import { SHAPE_KEYS, shapeOf } from "./shape-address.ts";
import { FOUND_KEY, VERSION_KEY, readWritten, type Written } from "./written-address.ts";

export type WrittenWorld = Written & { readonly seed: number; readonly overrides: Partial<WorldRecipe> };

export const pageFounder = (): Founder => createFounder(createNameLoader((url) => fetch(url)));

export async function foundAddress(hash: string, founder: Founder): Promise<WrittenWorld | null> {
  const w = readWritten(hash);
  if (w === null) return null;
  const f = await founder.found(w.sentence, w.version);
  if (!f.ok) return null;
  return { sentence: f.sentence, version: f.version, seed: f.seed, overrides: recipeOverrides(f) };
}

export const heldFor = (written: WrittenWorld | null, seed: number): WrittenWorld | null =>
  written !== null && written.seed === seed ? written : null;

const IDENTITY_KEYS: ReadonlySet<string> = new Set([
  FOUND_KEY,
  VERSION_KEY,
  "seed",
  "type",
  "band",
  "land",
  "coast",
  ...SHAPE_KEYS,
]);

export function writtenParams(params: URLSearchParams, written: Written | null): URLSearchParams {
  if (written === null) return params;
  return new URLSearchParams([
    [FOUND_KEY, written.sentence],
    [VERSION_KEY, String(written.version)],
    ...[...params].filter(([key]) => !IDENTITY_KEYS.has(key)),
  ]);
}

export function identityParams(
  params: URLSearchParams,
  seed: number,
  overrides: Partial<WorldRecipe>,
): URLSearchParams {
  const out = new URLSearchParams([["seed", String(seed)]]);
  if (overrides.mapType !== undefined) out.set("type", overrides.mapType);
  if (overrides.band !== undefined) out.set("band", overrides.band);
  emitLandKeys(
    out,
    gateLand({ land: overrides.landFraction ?? null, coast: overrides.coastWarp ?? null, shape: shapeOf(overrides) }),
  );
  for (const [key, value] of params) if (!IDENTITY_KEYS.has(key)) out.append(key, value);
  return out;
}
```
That is the branch's file with three import lines added (`address-grammar.ts`, `shape-address.ts`, and `FOUND_KEY, VERSION_KEY` beside `readWritten`) and the branch's `IDENTITY_KEYS`, `writtenParams` and `identityParams` appended unchanged.

**`src/site/explorer/hash-sync.ts`**: lines 10 and 11, `import { foundAddress, heldFor } from "../shared/written-world.ts";` and `import { identityParams, writtenParams } from "../shared/written-address.ts";`, become the one line `import { foundAddress, heldFor, identityParams, writtenParams } from "../shared/written-world.ts";` at line 10.

**`src/site/print-room/app.ts`**: lines 42 and 43, `import { foundAddress, heldFor, pageFounder, type WrittenWorld } from "../shared/written-world.ts";` and `import { writtenParams } from "../shared/written-address.ts";`, become the one line `import { foundAddress, heldFor, pageFounder, writtenParams, type WrittenWorld } from "../shared/written-world.ts";` at line 42.

**`src/site/reading-room/app.ts`**: lines 26 and 27, the same two lines, become the same one line at line 26.

**`test/site/written-world.test.ts`**: its import block becomes exactly
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { foundWorld, type Founding } from "../../src/world/founding/found.ts";
import { setFoundingGazetteer } from "../../src/world/founding/shapes.ts";
import { createFounder, recipeOverrides } from "../../src/site/shared/founding.ts";
import { writtenHash } from "../../src/site/shared/written-address.ts";
import {
  foundAddress,
  heldFor,
  identityParams,
  writtenParams,
  type WrittenWorld,
} from "../../src/site/shared/written-world.ts";
import { holdWritten, writtenFor, writtenNow } from "../../src/site/explorer/written-hold.ts";
import { overridesOfLand, readWorldKeys } from "../../src/site/shared/address-grammar.ts";
import { committedGazetteer, useCommittedGazetteer } from "../../test-support/founding-gazetteer.ts";
```
(the multi-line form is what `npm run format` writes at `printWidth` 120); after `const TEXAS = ...;` it gains the `KEPT` constant exactly as `test/site/written-address.test.ts` lines 10 to 12 have it; and after its last test (U2c, "the Explorer lets a written world go at a new chart number and never takes it back") it gains U1a and U1b, copied byte for byte from `test/site/written-address.test.ts` (the two `test(` calls from line 14 to the end), in that order. `FLAGSHIP` is already declared there with the same text.

**`test/site/written-address.test.ts`**: deleted (`git rm`). No roster names it (`git grep -n "written-address.test" -- . ':!handbook/plans'` prints nothing).

**`handbook/specs/explorer-doctrine.md`**, line 298: "and a link carrying both draws the sentence's world (`writtenParams` in `src/site/shared/written-address.ts`);" becomes "and a link carrying both draws the sentence's world (`writtenParams` in `src/site/shared/written-world.ts`);". Nothing else on the line changes; it is the only prose citing any of the three moved names outside `handbook/plans/` (`git grep -n "writtenParams\|identityParams\|IDENTITY_KEYS" -- handbook/specs .claude e2e scripts`).

**`handbook/plans/300/393/393-pr2-r1-plan.md`**: this file, copied unchanged from the scratchpad, beside `393-pr2-plan.md`, which is never edited.

No other file changes. Line budget after the move: `written-world.ts` 57 lines, `written-address.ts` 24, `written-world.test.ts` 122; no function changes length (`npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over the six touched source and test files exits 0 on the spike, R-M4).

## Tests, in the order they are written

**No red first.** The move changes no behaviour, so no unit test can red before it and pass after it; the red that brought it here is the load reading at 31479298 (the module probe's mutation reading below, and the implementer's closure run). U1a and U1b move with the functions they pin and stay green across the move (R-M4).

**The module bound** (Evidence; not a test file: a measurement script the builder runs after the build, as the first plan's closure probe was). Command: `node out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts dist out/393-pr2-r1-dry-run/393-pr2-r1-modules-b.log`; assertion: it exits 0 and every room's `gained` and `lost` are `[]`. Readings, taken in this planner's tree with the script and log at `out/393-pr2-r1-dry-run/` (copied to the main checkout's `out/393-pr2-r1-dry-run/` when the tree is retired):
- Fixture, the site `npm run build` made from 31479298 plus the move (`dist`, kept as `dist-b`): all seven rooms `"gained":[],"lost":[]`, exit 0 (log `393-pr2-r1-modules-fixture.log`). The room nearest failing is none: equality of lists has no margin.
- Mutation, the site built from 31479298 as it stands (kept as `dist-a`): exit 1, the Writing Room `"gained":["src/site/explorer/address.ts","src/site/shared/address-grammar.ts","src/site/shared/shape-address.ts","src/site/shared/year.ts"]`, every other room empty (log `393-pr2-r1-modules-mutation.log`). The only room the mutation is meant to red is the Writing Room, and it fails by four whole modules.

**The prover's one round** (`vellum-guard-prover`, step 11) owes U1a to U4 and WR8 to WR14, with the mutations `393-pr2-plan.md` names for each, re-pointed where the code now lives:
- U1a, "a written world's link leads with its sentence and version, drops every identity key and keeps every other key in order, and a link with no sentence is left as it is", now in `test/site/written-world.test.ts`: `"type"` dropped from `IDENTITY_KEYS` in `src/site/shared/written-world.ts`.
- U1b, "a written world's settings seat as the ordinary keys the Explorer's controls read, exactly, for every sentence of the founding sample", now in `test/site/written-world.test.ts`: in `identityParams` in `src/site/shared/written-world.ts`, the land written by hand, the line `if (overrides.landFraction !== undefined) out.set("land", String(Math.round(overrides.landFraction * 100)));` inserted directly before the `for` line. Taken here on the moved code: U1b red alone in that file (4 pass, 1 fail), `actual: { band: 'polar', landFraction: 0.1 }` against `expected: { band: 'polar', landFraction: 0.476 }` (`npm test -- test/site/written-world.test.ts`, log `out/393-pr2-r1-dry-run/u1b-mutation.log`); the spike restored by edit and checked equal to `393-pr2-r1-spike.diff`.
- U2a to U2c in `test/site/written-world.test.ts`, U3a and U3b in `test/site/table-address-culture.test.ts`, U4 in `test/site/land-rows.test.ts`, and WR8 to WR14 in `e2e/suites/writing-room/carry.ts`: as `393-pr2-plan.md` names them.

The roster edits `393-pr2-plan.md` leaves to the implementer to prove (dropping `"type"` from `LAND_ROWS` and the road from the page, each red) are proven by the implementing session as that plan says, and the body names them.

No browser check is new or changed in this revision. The `writing-room` suite ran 15 of 15 on the moved code in this planner's tree (`out/393-pr2-r1-dry-run/e2e-writing-room-b.log`), which re-read WR8 to WR14's fixture values on the move; their mutation readings are `393-pr2-plan.md`'s, staged by address against the same pages, and are not quoted here.

## Order of commits

Commits 1 to 6 are on the branch (Where the build stands). The builder resumes `feat/393-writing-room-carry` at 31479298 as its definition says (`git fetch origin feat/393-writing-room-carry`, then `git checkout -B feat/393-writing-room-carry origin/feat/393-writing-room-carry`, each its own command), once the dispatcher says the tree that held it, `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-aea69c47764af2df0`, is retired. Then:

7. `#393 Revision 1 of the second pull request's plan: the written world's link grammar moves beside its founding, so the Writing Room loads none of it`: `handbook/plans/300/393/393-pr2-r1-plan.md`, and every edit under Files. Then `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (3491 of 3491; then `npm run astro:generate`), `git diff --stat origin/main -- src/world/` (empty), and Evidence's build, probes and suites. Push.
8. After the pull request's first CI run: `MEASURED_SECONDS["writing-room"]` in `test/e2e/lane-timings.test.ts` replaced by the seconds lane C's job log gives the suite on its `per-suite wall clock` line (`handbook/specs/site-architecture.md`, "`MEASURED_SECONDS` is read from CI's own lane logs"), in its own commit, the body naming the job.

No commit message carries a closing keyword; the body carries `Closes #393`.

## Rosters and doctrine

**Rosters**: every roster `393-pr2-plan.md` names is joined on the branch. The move joins none: `test/site/folder-layout.test.ts` admits `src/site/shared/`, and no roster names either test file.

**Doctrine**: the one line under Files (`handbook/specs/explorer-doctrine.md` line 298). Every other doctrine edit of `393-pr2-plan.md` is on the branch in `12be78cc` and stands.

## Evidence

Every local run writes its output to a file under `out/393-pr2-r1-dry-run/` in the builder's tree (`> out/393-pr2-r1-dry-run/<name>.log 2>&1`) and is read from there, so no payload is lost to a truncated relay.

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (3491 of 3491), then `npm run astro:generate`.
- `git diff --stat origin/main -- src/world/` prints nothing; `NAMES_CHECKSUM` reads 2151669449 in `src/site/shared/founding-names.ts`.
- The probes, copied first, each command alone: `mkdir -p out/393-pr2-r1-dry-run`; `cp /Users/ahl/CodeProjects/Vellum/out/393-pr2-r1-dry-run/393-pr2-closure.ts /Users/ahl/CodeProjects/Vellum/out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts /Users/ahl/CodeProjects/Vellum/out/393-pr2-r1-dry-run/393-pr2-r1-modules-b.log /Users/ahl/CodeProjects/Vellum/out/393-pr2-r1-dry-run/393-pr2-r1-closure-b.log /Users/ahl/CodeProjects/Vellum/out/393-pr2-r1-dry-run/393-pr2-r1-closure-main.log out/393-pr2-r1-dry-run/` (they import only Node built-ins). Then `npm run build`, then:
  - `node out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts dist out/393-pr2-r1-dry-run/393-pr2-r1-modules-b.log > out/393-pr2-r1-dry-run/393-pr2-r1-modules-built.log`: exit 0, every `gained` and `lost` `[]` (the bound; Stop conditions);
  - `node out/393-pr2-r1-dry-run/393-pr2-closure.ts dist > out/393-pr2-r1-dry-run/393-pr2-r1-closure-built.log`, then `diff out/393-pr2-r1-dry-run/393-pr2-r1-closure-built.log out/393-pr2-r1-dry-run/393-pr2-r1-closure-b.log`: predicted to print nothing (R-M3). A difference, with the module lists equal, is no stop: the pull request comment below gives both files' lines for each room that differs.
- Then, one at a time, `VELLUM_E2E_SUITES=<suite> npm run test:e2e` for `writing-room`, `broadside`, `runninghead`, `print-room`, `reading-room`, `prospect`, `ribbon`, `room-address`, `chart-drawer` and `survey`, each to its own log. Never the full local lanes. The move changes every Explorer page's chunks, so all ten run again.
- `vellum-plate-reader` at step 11 over the built pages, against the stills Alex ruled from (`out/393-pr2/` and `out/393-pr2-road/` in the main checkout): the Writing Room's legend row at 1024 and 1440 with the road; the Explorer's held Broadside on the flagship, the Aegean and the crescent at 1024x768 (no scroll in the slip body; the note road's contrast, 9.89:1 at M12); the road pressed; the Print Room's proof. Its stills go to the builder's `out/393-pr2-plates/`, which the dispatcher copies across.
- The golden and every committed chart unmoved: `node --test test/world/golden-seed42.test.ts test/site/hero-charts.test.ts`.
- A pull request comment, posted once the pull request is open, carrying (workflow step 10, a measured table that lives only in `out/`): the per-room table of R-M1 with the builder's own closure line beside each room, the module probe's output, and the two scripts' paths and commands.
- A second pull request comment, Gate 2 item 10's trail for CD47: "CD47 (`chart-drawer`) red once locally on this branch, at <the commit the implementer's run log names, or "a commit not retained" where it names none>, 57 of 58, and passed on its one re-run alone, 58 of 58; the payload was not retained (the run's output was truncated before it was read). Issue #1147 holds the open question and the two earlier local rows of the same check. What to capture next: the full `after` payload and the `saw` read's timing on a red, as Issue #1147 asks." with this revision's chart-drawer result appended.
- `gh pr view <N> --json closingIssuesReferences` lists #393.

**The pull request's body**, in the template's shape (`.github/PULL_REQUEST_TEMPLATE.md`):
- `Closes #393` on the closing line.
- The opening paragraph names both plans the branch carries, `393-pr2-plan.md` and `393-pr2-r1-plan.md`, and what the revision changed (the move, the module bound, the five deviations blessed), with the Writing Room's load against main (516 compressed bytes more, against 3,064 before the move) and the four rooms' (9,483 to 9,758 compressed, 4.78 to 5.55 percent).
- **Guards**: U1a to U4 and WR8 to WR14 with the prover's red lines.
- **Ran**: the unit count, the ten suites by name with their results, CD47's earlier 57 of 58 and its re-run, and the full lanes not run.
- **Records**: the prover's ledger; the plate reader's step 11 comment, and "the step 6 rulings were made from stills: `out/393-pr2/` (rulings 1 to 4) and `out/393-pr2-road/` (ruling 5)"; the skeptic's ledger.
- **Rulings**: the step 12 comment's link, then "the planner's calls C1 to C16 in `393-pr2-plan.md` and C17 to C28 in `393-pr2-r1-plan.md`"; open decisions: none.
- **Look for these when you use it**: the written world's hold, its note and its road (provisional until the post-use review, `handbook/specs/ui-design.md`'s Broadside paragraph), and the Writing Room's road "Explore it in / The Explorer".

**The step 12 comment**, dated, before the pull request opens: every call of `393-pr2-plan.md` (C1 to C16) and of this revision (C17 to C28), pointing at rulings 6559676010 and 6560109654 rather than restating them.

## Calls made

`393-pr2-plan.md`'s calls C1 to C16 stand. This revision adds, each for Alex to overrule:
- **C17. `writtenParams`, `identityParams` and `IDENTITY_KEYS` live in `src/site/shared/written-world.ts`.** Rule: a page downloads no code it never runs where a module boundary keeps it out (`handbook/specs/site-architecture.md`, the plate's code on demand), and ruling 1's stated costs rest on the spike's layout, which this is (M8). Measured cost: the Explorer and the four rooms each 330 to 345 compressed bytes over the branch head (R-M1).
- **C18. `FOUND_KEY` and `VERSION_KEY` are exported from `written-address.ts`**, the one home of the two key names. Rule: C2, no second spelling of `v`.
- **C19. U1a and U1b move into `test/site/written-world.test.ts`, and `test/site/written-address.test.ts` is deleted.** Rule: a test sits with the module it pins; `test/site/writing-room-address.test.ts` keeps pinning `readWritten` and `writtenHash`.
- **C20. The bound on a room's load is its list of source modules, exact, not a byte margin.** Rule: `CLAUDE.md`, a bound is derived; the property is which code a room loads, and the list's blind spot (a module with no region of its own) errs toward passing, which the byte prediction covers (R-M3).
- **C21. No permanent guard holds the Writing Room's load.** Rule: the house guards a page's load by name where the weight is the plate's code (`test/site/app-bundles.test.ts`, Issue #801; `finished.js` 247,161 bytes), and the address grammar's absence from the Writing Room's load is held by this pull request's module probe as its acceptance measurement, as M4 was in the plan Alex saw, not by a permanent test.
- **C22 to C26. Deviations a to e**, blessed as "The design" says.
- **C27. CD47's local red: the builder writes no flake row and no skip, and posts Gate 2 item 10's trail on its pull request; the row is the dispatcher's.** Rule: neither file is in this plan (`.claude/agents/vellum-implementer.md`, a file the plan does not name is a hand-back), and the dispatcher's instruction for this lane puts the row in a pull request of its own; no spec assigns a local red's row (`handbook/specs/orchestration.md`'s row pull request is for a red on CI), and the two earlier CD47 local rows landed in their lanes' own pull requests (PR #758, PR #900), so the dispatcher may overrule this toward the lane. A further CD47 red is a hand-back with its full payload, since the one re-run is spent (Gate 2 item 10, "a second red is a defect").
- **C28. M8 corrected**: where the spike kept these functions decided the Writing Room's load, which the first plan's readings did not see (R-M1).

## Open decisions

None.

## Lanes beside this one

- **Issue #1159** (the Broadside's build; its planner is queued behind this pull request and builds on it; plan archived on Issue #1159 as comments 6560267664 and 6560268281). Its plan imports `writtenHash` from `src/site/shared/written-address.ts` (in its broadside checks), which stays there; it names none of `writtenParams`, `identityParams`, `written-world.test.ts`, `written-address.test.ts`, `hash-sync.ts`, `src/site/print-room/app.ts` or `src/site/reading-room/app.ts` (searched in those two comments). "For Issue #1159's planner" in `393-pr2-plan.md` stands unchanged.
- **Issue #1129** (a coast of 0.55 spelt one way): unchanged from `393-pr2-plan.md`; this revision does not touch `address-grammar.ts`, `table-address.ts` or `landKeysNow`.

## Stop conditions

Hand back, with the command and its output, when:
- the branch's head is not 31479298 when the builder resumes it;
- `git ls-remote origin refs/heads/main` prints a sha other than 781e861c and `git diff --stat 781e861c origin/main` touches any code or test file named under Files here or in `393-pr2-plan.md`;
- `node out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts dist out/393-pr2-r1-dry-run/393-pr2-r1-modules-b.log` exits 1 at commit 7's build (a room gained or lost a module);
- `npm test` is not 3491 of 3491, or `npm run lint` reports a file over 400 lines or a function over 50;
- `git diff --stat origin/main -- src/world/` prints anything, or `NAMES_CHECKSUM` is not 2151669449;
- a suite under Evidence reds: hand back with its log, run nothing again; CD47 included, with its full payload from the log;
- any reading `393-pr2-plan.md` prints for WR8 to WR14 differs from the suite's own read on the built site, or the Broadside's slip body scrolls at 1024x768 on a written world;
- the prover finds U1a or U1b unable to bite with the mutation named above.

## Measurements

Taken in this planner's tree (`/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a6d963b2d4afc712a`), on three sites `npm run build` made there: main at 781e861c (`build-main.log`, kept as `out/393-pr2-r1-dry-run/dist-main`), the branch at 31479298 (`build-a.log`, `dist-a`), and 31479298 plus the uncommitted move (`build-b.log`, `dist-b`, the diff `393-pr2-r1-spike.diff`). Every log below is in `out/393-pr2-r1-dry-run/`, copied to the main checkout's `out/393-pr2-r1-dry-run/` when the tree is retired.

- **R-M1. Each room's main-thread load** (`node out/393-pr2-r1-dry-run/393-pr2-closure.ts <site>`, the first plan's probe unchanged; logs `393-pr2-r1-closure-main.log`, `393-pr2-r1-closure-a.log`, `393-pr2-r1-closure-b.log`; tabulated by `393-pr2-r1-table.ts`, log `393-pr2-r1-table.log`). Bytes raw / compressed:

  | room | main | branch head (a) | the move (b) | (b) over main | (b) over (a) |
  |---|---|---|---|---|---|
  | Explorer | 823,206 / 224,093 | 855,490 / 233,730 | 855,587 / 234,066 | +32,381 / +9,973 (3.93 / 4.45 %) | +97 / +336 |
  | Print Room | 691,742 / 185,885 | 723,050 / 195,309 | 723,103 / 195,643 | +31,361 / +9,758 (4.53 / 5.25 %) | +53 / +334 |
  | Reading Room | 755,560 / 203,929 | 786,846 / 213,338 | 786,897 / 213,668 | +31,337 / +9,739 (4.15 / 4.78 %) | +51 / +330 |
  | Prospect | 665,122 / 178,010 | 695,886 / 187,273 | 695,995 / 187,614 | +30,873 / +9,604 (4.64 / 5.40 %) | +109 / +341 |
  | Ribbon | 646,384 / 170,896 | 676,599 / 180,034 | 676,708 / 180,379 | +30,324 / +9,483 (4.69 / 5.55 %) | +109 / +345 |
  | Writing Room | 666,428 / 176,560 | 675,893 / 179,624 | 666,832 / 177,076 | +404 / +516 (0.06 / 0.29 %) | -9,061 / -2,548 |
  | Portfolio | 670,474 / 179,731 | 671,088 / 179,669 | 671,127 / 179,895 | +653 / +164 (0.10 / 0.09 %) | +39 / +226 |

  On the branch head the bundler folds the worker client's modules and the address grammar's into one chunk, `address-grammar.js`, 63,796 bytes (it holds `src/site/explorer/worker-client.ts` and no `worker-client.js` is emitted), because the Writing Room's import of the grammar gives both the same set of importing rooms; the move separates them again (`worker-client.js` and `address-grammar.js` both emitted), which is the 330 to 345 compressed bytes the five rooms pay against (a). The first plan's spike read the Writing Room at 666,851 / 177,103 (`/Users/ahl/CodeProjects/Vellum/out/393-pr2-dry-run/393-pr2-closure-spike.log`), within 19 raw bytes of the move.
- **R-M2. Each room's modules** (`node out/393-pr2-r1-dry-run/393-pr2-r1-modules.ts <site> <base>`): against main, logs `393-pr2-r1-modules-a-vs-main.log` and `393-pr2-r1-modules-b-vs-main.log`, the lists under "The bound on what a room loads"; the branch head's Writing Room gains `src/site/explorer/address.ts`, `src/site/shared/address-grammar.ts`, `src/site/shared/shape-address.ts` and `src/site/shared/year.ts` beyond the move's; every other room's list is the same on both. The bound's fixture and mutation readings are under Tests (`393-pr2-r1-modules-fixture.log`, `393-pr2-r1-modules-mutation.log`). The blind spot, read: `installNames` and its checksum stand inside `src/world/founding/found.ts`'s region in `written-address.js`, and `src/site/shared/founding-names.ts` has no region line in any chunk.
- **R-M3. The build is reproducible across trees**: this planner's build of 31479298 read the same raw and compressed bytes in all seven rooms as the implementer's build in `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-aea69c47764af2df0/dist` (Writing Room 675,893 / 179,624 in both; `393-pr2-r1-closure-a.log` against the same command on that site).
- **R-M4. The move holds behaviour**, on 31479298 plus the move: `npx prettier --check` and `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0` over `src/site/shared/written-address.ts`, `src/site/shared/written-world.ts`, `src/site/explorer/hash-sync.ts`, `src/site/print-room/app.ts`, `src/site/reading-room/app.ts` and `test/site/written-world.test.ts` exit 0; `npm run check` exits 0 (`check-b.log`); `npm test` 3491 of 3491 (`unit-full-b.log`), among them `test/site/app-bundles.test.ts`, which presses the real bundles; `VELLUM_E2E_SUITES=writing-room npm run test:e2e` ALL PASS 15 of 15 (`e2e-writing-room-b.log`).
- **R-M5. The founding sample U1b walks** (`node out/393-pr2-r1-dry-run/393-pr2-r1-sample.ts`, log `393-pr2-r1-sample.log`): 200 sentences, 200 founded, 18 setting a sea level.
