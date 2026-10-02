# Issue #673 PR 3 of 7: the unstepped single files and the first folders

Base: main `23fae46` (2026-09-27, after PR #698). Branch `chore/673-pr3-split`. The issue's plan is `plans/673-plan.md` (frozen); PR 2's slice plan is `plans/673-pr2-plan.md`, whose construction rules this slice carries unchanged except where section 2 says. This is PR 3's slice, per Alex's ruling of 2026-09-26 on Issue #693.

Status: after a cold `vellum-plan-skeptic` read, its seven findings folded in (section 8).

Carried corrections to the frozen plan: its 6.4 (the proof's design) is superseded by calls 19, 22, 25 to 27 and 39; its 3.2's "longest statement 39 lines" was wrong (PR 2); its 3.2's "a group function that returns an `evaluate` or `settle` read declares its return type" is not followed where the group hands back a shape built inline, whose type the caller takes from the group (call 35, named as a departure on PR #698 and in the Issue #673 comment of 2026-09-27). Alex ruled call 31 on 2026-09-27, A as built: a setup line several checks share stays in `run`'s list on its own line, one that belongs to a single check moves into it, and chart-drawer (PR 7) decides after measuring. That ruling replaces the frozen 3.1's "a one-off joins the unstepped group beside it" for every PR from here.

## 1. Scope

The eight suites section 4 of the issue's plan gives PR 3: room-ink, room-address, room-voyage, room-voyage-route, hunt, runninghead, room-instrument, specimen. One `max-lines-per-function` marker each goes: e2e size markers 34 to 26. Seven have no step; specimen has one (SB4). Five stay single files (predicted 140 to 360 lines); runninghead, room-instrument and specimen, predicted over 380, take folders `scripts/e2e/<name>/` (the frozen plan's 3.3, Alex's ruling 2). No runner, lane, roster or budget changes; one guard change, in the split proof (section 5).

## 2. Construction rules

PR 2's rules 1 to 11 and 6a stand (`plans/673-pr2-plan.md` section 2), with rule 4 as Alex ruled it. What this slice adds:

1. **A setup line several checks share, as ruled.** A state, viewport or media switch that the checks after it share stays in `run` on its own line (specimen's `send("Emulation.setDeviceMetricsOverride", ...)` at 1280 and at 390, its two `setState("leaned")` and their settling `sleep`s; room-address's `setEmulatedMedia` clear; hunt's page address and error base). A switch that brackets one check group, or restores after it, moves with that group (room-address's reduced-motion pair around RA6, specimen's print pairs around SB9b and SB9/SB9c, its scripts-off pair around SB9d). A one-line read that the checks after it share as their fixture or baseline also stays in `run` (room-ink's `sm`, room-instrument's `sm` and `smNow`, specimen's `rest`, `leaned`, `interior`, `phone` and `leanedOpen`, room-voyage's `presentShown`, runninghead's `galleryNarrow` with the 390 switch and navigate before it); a read that is one check's own gesture or measurement stays in that check's group, and is handed back when a later check compares against it (hunt's `miss`, room-voyage's `s0` and `sLast`); a read only one group uses moves into it; a fixture read longer than a line is a group that hands its value back (room-address's world, hunt's quarry, room-voyage's plan, runninghead's sweep). Two reads that must keep their order stay together: runninghead's `home` and `prose` stay in RH4's group, which hands `prose` back to RH6. The table in section 3 names every placement.
2. **A group is one numbered check, or a contiguous run of checks on one fixture.** Hunt's twenty-six checks become fifteen check groups and the quarry fixture (H3 with H3c, H3b with H3d, H4 with H5 to H7 and H6b, HD1 with HD2, H8 with H8b and HD3, HG2 with HG3), so hunt stays one file at about 360 lines.
3. **A folder holds everything but `run`** (the frozen plan's 3.3): the suite file keeps its header, its imports and `run`; the folder holds `reads.ts` (payload constants, their types and the pure predicates over them), `kit.ts` (the kit) and topic files of group functions, each exported and named for the checks it holds:
   - `runninghead/`: `reads.ts`, `kit.ts` (`visit`), `heads.ts` (the head sweep and RH0 to RH6, RH9a, RH9b), `gallery.ts` (RH10 to RH10e).
   - `room-instrument/`: `kit.ts` (the room and the bar), `scrub.ts` (RS0 to RS7), `sweep.ts` (RS8 to RS17), `arrival.ts` (RS23, RS26 to RS28), `pace.ts` (RS29, RS30).
   - `specimen/`: `reads.ts`, `kit.ts` (`read`, `setState`, `goto`, `brightest`, `groundOf`), `desktop.ts` (SB1 to SB6), `phone.ts` (SB7 to SB8d), `print.ts` (SB9b, SB9, SB9c, SB9d).
4. **Runninghead's RH7 group and RH8 stay in the suite file**, beside `REPO` and `boundAtlasEmitsAtlasHead`: `REPO` is resolved from `import.meta.url`, so moved a folder deeper it would name the wrong directory, which the proof cannot see (call 28, the first lane's note). They stay byte for byte where they are; RH8 keeps the suite's closing navigate, which its check reads.
5. **A factory's products reach the groups by a kit where the suite has one, by name where it does not.** Room-instrument's kit makes the room and the bar (`makeRoom(ctx)`, then `makeBar(ctx)`'s destructure), called at their base position before `scopedHealth`, so the bar's nine functions reach the groups without nine parameters. Room-ink passes `setYear` by name (its only bar function); specimen's kit takes `run`'s `settle` in a bag, as room-drawer's did.
6. **A helper that closes over a value `run` computed stays in `run` when several groups use it**: runninghead's `bad`, which reads the swept heads, is declared in `run` exactly as today and handed to the groups by name. One that only one group uses moves into that group and closes over its parameter of the same name: runninghead's `fitAt` (with `FIT_READ` and its `Fit` type) inside the RH10c to RH10e group, reading `galleryNarrow`.
7. **A signature names a handed-back value's type from the group that returns it** (`Awaited<ReturnType<typeof group>>`, call 35), and one computed by a helper from the helper (`Awaited<ReturnType<typeof scrubFacts>>`), so no source line is retyped.
8. **Handbacks (call 32)**: specimen's SB4 is the only step, and it hands nothing back, so no handback in PR 3 is contained by a step.

## 3. Per suite

| suite | base | shape | notes |
|---|---|---|---|
| room-ink | 131 | one file, no kit; `room`, bar, gate and `sm` in `run`; rs18 to rs22 take `(ctx, setYear, sm)` | RS22's guarded citation in `public/living-chart.css` stays in the file |
| room-address | 150 | one file, no kit; the error bases and the media clear in `run`; `{ sm, midYear } = raWorld(ctx, room)` (the boot and the five-line world read); ra1 to ra7, ra8Clean | |
| room-voyage | 212 | one file, kit `stepTo` (with `markFn`); rw0 to rw3; `{ plan, lastPort, homeStep, midPort, entries } = rwVoyagePlan`; rw4 to rw8 each a group, s0 and sLast handed back; `presentShown` in `run` (rule 1), `glyphCount` to module level (a primitive template, position-free); rw10 to rw13 | the RW4 to RW8 stretch is 50 lines, 52 as one function, so its fixture is a group |
| room-voyage-route | 292 | one file, no kit; rv0Arm, rv0b, rv1 to rv3, rv4Rv5, rv6 to rv12 | `maxTilt <=` stays in the file for `test/repo/constant-contracts.test.ts` |
| hunt | 316 | one file, kit (`clickHunt`, `mouseTap`, `mouseDrag`, `framePoint`), `bandRank` to module level; sixteen groups (rule 2) | H11 and H12 stay in the file for `specs/engine-invariants.md` |
| runninghead | 360 | folder (rule 3, rule 4); `run` holds the error bases, the kit, `{ heads, unreachable } = rhSweep`, `bad`, the head checks, `prose = rh4OneDress`, RH7 and RH8 from the suite file, the 390 switch, navigate and `galleryNarrow` read, the gallery groups and the closing metrics clear: about 32 lines; RH10's own 1280 switch and navigate, and RH10c to RH10e's print pair, move with their groups | `RH9b` moves to `heads.ts`: the guarded citations in `public/atelier.css` and `public/index.css` re-point |
| room-instrument | 378 | folder (rule 3, rule 5); `sm`, `smNow` and the shared `setYear(sm.present)` before RS14 in `run` | |
| specimen | 381 | folder (rule 3); SB4 stepped in `run` from `desktop.ts`; `run` holds the settle, step, gate, kit, the two metrics switches, the two lean switches with their sleeps, the reads `rest`, `leaned`, `interior`, `phone`, `leanedOpen`, the closing metrics clear and `goto()`, and `gate.check`: about 41 lines, so blank lines stay few | `specs/settle-doctrine.md`'s "print checks in `scripts/e2e/suite-specimen.ts`" re-points to `specimen/print.ts`; the `errata/guards.md` rows from PR #676 (SB2) and PR #690 (`groundOf`) re-point |

## 4. What the change drags

- The guarded CSS citations of `RH9b` (`public/atelier.css`, `public/index.css`), which `test/repo/comment-citations.test.ts` reds when the symbol leaves the cited file.
- `specs/settle-doctrine.md`, one path.
- `errata/guards.md`, two rows re-pointed (PR #676, PR #690); the PR #572 row names suites, not files, and stands; the PR #598 row names `suite-specimen.mjs`, a path already stale since the port, which `errata/README.md` allows, and is left as its own record.
- `scripts/e2e-split-proof.ts` and its test: section 5.
- `plans/673-pr3-plan.md`, this file, archived in the first commit.
- Checked unchanged: `specs/engine-invariants.md` (H11, H12 in suite-hunt), `test/repo/constant-contracts.test.ts` (room-voyage-route), `public/living-chart.css` (RS22 in suite-room-ink), `STEPPED_GROUPS`, `E2E_SUITE_ORDER`, `E2E_LANES`, `MEASURED_SECONDS`. The console-support sweeps, the sheet-height carriers and the shape and note scans already read the tree at any depth (PR #696).

## 5. Tests and guards

**One guard change, from the plan skeptic's finding 1**: the split proof finds a function the split made by its declared name, and skips every import from inside the family as wiring, so an import that renamed one part-file group as another (`import { x2Two as x1One, x1One as x2Two }`), or an export that did (`export { x2Two as x1One }`), would run the groups swapped and read the same. PR 3 is the first to wire group functions across files by import. The proof now reports any import from inside the family, and any export, whose name differs from the name it binds. Written test first: the new case in `test/repo/e2e-split-proof.test.ts` red on `actual: true, expected: false` against the old proof; the straight import in the same case stays the same. Mutations for the prover: drop the renaming report; report only imports and not exports; resolve the import's module without its importing file's directory.

The first real folder files and the first group in a part file called from a step also owe `vellum-guard-prover` on the real tree (the frozen plan's section 5):

1. Containment, a part-file group that waits called in `run` beside its step: `await sb4Folded(k, rest);` added in specimen's `run`, the SB4 step line kept; reds naming it.
2. Containment, a thrower planted in a folder file and called outside every step: a group in `specimen/print.ts` that awaits `k.settle(...)`, called bare in `run`; reds.
3. The proof across files: swap two group lines whose functions live in different part files; change an import in a part file to another module; drop one part file; each reads `DIFF` for its family and exits 1 against `23fae46`.
4. The proof on the single files: swap two group calls in hunt's `run`; pass room-voyage's `rw5MidPort` a different name; each reads `DIFF`.

## 6. Evidence

1. `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`.
2. Markers 34 to 26 by the frozen plan's grep; type notes 205 and condition markers 75 unchanged.
3. `node scripts/e2e-split-proof.ts 23fae46`: 42 families, 0 differ, the three folder families at `1 -> 5` or `1 -> 6` files.
4. `npm run build`, then one serial run of the eight: `VELLUM_E2E_SUITES=hunt,specimen,room-address,room-ink,room-instrument,room-voyage,room-voyage-route,runninghead npm run test:e2e`. The subset changes each suite's predecessor from CI's lanes (room-address carries #637's leaked-reduced-motion history), so a local red is first re-run on the base with the same selection before the split is suspected.
5. Both lanes' check names from this PR's CI against main's CI at `23fae46`, detail stripped, identical and counts equal.
6. The merged state before hand-off if main moves.

## 7. Calls to record on Issue #673 before the PR opens

Alex's ruling on call 31 (A, as built), relayed 2026-09-27; rules 1 to 7 above; the folder file names; the re-pointed citations and errata rows; the proof's renaming report; the frozen 3.2 return-type departure carried.

## 8. The plan skeptic's findings, and what became of each

Cold `vellum-plan-skeptic` on Issue #673 and this plan, no ledger. Three SHOULD-FIX and four NITs, nothing blocking; all folded, none rejected.

1. The proof skipped every import inside a family, so a renaming import or export could swap two part-file groups and read the same, and PR 3 is the first to wire groups across files: closed in the proof, test first (section 5), rather than named, since a guard can catch it.
2. Rules 1 and 6 read literally put runninghead's `fitAt` in `run` and gave neither tight `run` a length: rule 6 now moves a one-group helper into its group, rule 1 names every placement, and section 3 gives runninghead about 32 lines and specimen about 41.
3. The frozen 3.2 return-type departure was not carried: in the header and section 7.
4. Hunt has 26 checks, not thirty: corrected.
5. Rule 1 contradicted the table on `presentShown` and left `glyphCount`, `interior`, `prose` and `galleryNarrow` unplaced: rule 1 and the table now place each.
6. PR 2's subset-run caveat was dropped: carried into section 6.
7. The PR #598 errata row names `suite-specimen.mjs`: left on purpose (section 4).

UNVERIFIABLE at plan time, per the skeptic: Alex's ruling on call 31 is not yet on the tracker; this PR's issue comment records it, relayed by the dispatcher.
