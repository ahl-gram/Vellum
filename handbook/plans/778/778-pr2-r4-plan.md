# Issue #778, pull request 2 of 2: the desk frame, revision 4

**Planned at:** `origin/main` c968619eb60e1296d0a8260bfd5513c5515a4547 (unmoved since the frozen plan), Issue #778 read with 21 comments (2026-10-15): seven are `Plan archive, not a ruling:` copies (the newest, 6191549240, is revision 3's); the 21st, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257, is Alex's ruling this revision is written to. PR #896 (`feat/778-desk-frame`) is open at head e6ede25d4044252482f79492b4583934e81af81d with 3 comments (6186639847, the guard prover's; 6186641372, the plate reader's; 6191715590, the lane's local-pass comment), and CI run 38736979576 on that head completed `success`. Issue #897 is open with 1 comment (6191845514, the lane's).
**Revises:** `handbook/plans/778/778-pr2-r3-plan.md` (sha256 cdd4eaa7dc220dfc5295c1e71873a245276af88d7f9471f574332d51480306f8), committed on the branch in `25b0432d` and archived on the issue as comment 6191549240, after the cold review of PR #896 (one round, at `13a6556d`) found that with EA7 skipped nothing running guards the page-coordinate seat reads (its finding 1).
**Rulings:** every ruling revision 3 lists stands (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6157453885, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424), and Alex's ruling of 2026-10-15 on finding 1, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257: "A: add the fast unit test in this PR", over leaving the reads unprotected until Issue #897; the skip of EA7 and EA8 under Issue #897 stands.
**Open decisions:** none.

## What stands, and what this revision replaces

- **Revisions 1, 2 and 3 stand by reference as built.** Revision 3's steps 0 to 11 are done: commit 13 (`25b0432d`), commit 14 (`13a6556d`), proof run 38732678279, the PR #896 comment 6191715590, the Issue #897 comment 6191845514, the Issue #778 comment 6191849280. The lane's fixes after the cold round, `26919071` (finding 2, a `handbook/errata/site.md` row), `e6ede25d` (findings 3 and 4) and the Issue #778 comment 6192364866 (finding 5), stand as the lane made them under workflow step 15.
- **This revision adds one commit (15) and its records, and replaces**: revision 3's "Tests" sentence that no guard is written and no prover round is owed (for commit 15 only, see "Proof" below); the "unproven" sentence of the Issue #897 comment 6191845514 and the last sentence of the PR #896 comment 6191715590, for the code's half of EA7's and EA8's claims, each by a new comment (neither old comment is edited); and the PR body lines listed under "The PR body".
- Everything left to do is in this file.

## Specs (read these sections before the work, on top of revision 3's list)

- `handbook/specs/check-placement.md`, "The unit suite" in full: a unit test runs the code and asserts what it does; it reads no source text; `SOURCE_READS`.
- `vellum-footguns` Gate 1, items 1, 2, 3, 5, 8, 9 and 12, before commit 15; Gate 5 before the comments and the body edit.
- `handbook/specs/development-workflow.md` step 11 (the proof runner's paragraph: exact sets, the verdicts), step 12, and step 15 (a guard added after the prover's round is proven by the implementing session).
- `test-support/element-shim.ts`, its header and `El` (the shim does no layout; every rect is stated).
- `.github/PULL_REQUEST_TEMPLATE.md`, before the body edit.

## Measured for this revision (2026-10-15, in the planner's own tree detached at `e6ede25d`, nothing committed)

- **The two tests below, written into `test/site/room.test.ts` at `e6ede25d`**: `node --import ./test-support/source-read-guard.ts --test test/site/room.test.ts` passes 6 of 6; `npx tsc --noEmit` exit 0; `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 test/site/room.test.ts` exit 0; `npx prettier --check test/site/room.test.ts` clean; `npm test` `tests 2706`, `pass 2706`, `fail 0` (2704 at `e6ede25d` plus the two); `git diff --numstat e6ede25d -- test/site/room.test.ts` prints `161	0	test/site/room.test.ts`. The file is `778-pr2-r4-room.test.ts` in the scratchpad, sha256 ca38c77897acde88dcdf2d3238a37f6f716c9513b651cdc0a891649c7124d8b5. The predicted record (below) matched the first run exactly.
- **Each row of revision 1's table that edits `src/`, applied alone by its exact find-and-replace from the lane's `778-pr2-mutations.json`, against `test/site/room.test.ts` and `test/site/page-box.test.ts`** (log `778-pr2-r4-mutate.log`; the control before and after: 0 failed). Every red below is an `AssertionError`, none a `TypeError` or `ReferenceError`, except where said:

| row | mutation | reds | the fields that moved (actual against expected) |
|---|---|---|---|
| R5 | `tops` reads `r.top` | UD1, its second assertion (at the foot) | reserves `0px`/`0px` against `142px`/`222px`, `under` true: the sheet floors |
| R6 | `bottoms` reads `r.bottom` | UD1, at the foot | `reserveTop` `14px` against `142px` |
| R7 | `placeSlip`'s top reads `folioRect.bottom` | UD1, at the foot | `slipTop` `-182px`, `slipMax` `870px` against `112px`, `576px` |
| R8 | `placeSlip`'s strip floor reads `stripRect.top` | UD1, at the foot | `slipMax` `282px` against `576px` |
| R9 | `placeLegendRow`'s risen foot reads `folio.top` | UD1, at the foot | `pressFoot` `394px` against `100px` |
| R14 | `pageBox` decides the frame from `deskFrameDue(window.visualViewport?.scale ?? 1)` | UD2, its seats assertion | `reserveBottom` `14px`, `pressFoot` `-194px` against `222px`, `100px` |
| R1 | `bindRoom`'s toggle line deleted | UD1 (unscrolled assertion), UD2 (its framed assertion, `false !== true`) | `reserveBottom` `14px`, `pressFoot` `-194px` |
| R2 | `deskFrameDue` returns `false` | UF4, UD1 (unscrolled), UD2 (framed) | as R1 |
| R4 | `pageBox` ignores the class | UD1 (unscrolled), UD2 (seats) | as R1 |
| R19 (new) | the toggle line moved from the head of `bindRoom` to the head of `layout`, so the frame is decided again at every layout | UD2, its framed assertion (`the frame the room bound with stands after the pinch`) | the class dropped at scale 2 |
| R17 | `deskFrameDue` returns `true` | UF4, and the existing `bindRoom seats the legend row before it fits the sheet` by a `ReferenceError` (`getComputedStyle is not defined`: its shim has no style, and the forced frame reads one); UD1 and UD2 stay green | not resent; its row already BITES on UF4 with `test/site/page-box.test.ts` alone |
| STUB | R5 to R9 together (the five reads as `main` makes them) | UD1, at the foot | `reserveTop` `14px`, `reserveBottom` `516px`, `slipTop` `-182px`, `pressFoot` `394px` (`slipMax` happens to come out 576 when R7 and R8 move together, which is why the rows are proved one at a time) |

- **The resend list compiles**: `778-pr2-r4-mutations.json` (sha256 514243cfc6e1f235064e9c7910306e71e179e82b79177785c78bd8c2cc765920), fed to `buildList` and `planJobs` from `scripts/proof-runner/` at `e6ede25d` (`778-pr2-r4-validate.ts`), returns no error and no warning, ten rows plus `control-unit` over `test/site/page-box.test.ts` and `test/site/room.test.ts`; every anchor is found exactly once at `e6ede25d`, and commit 15 touches no file an anchor sits in.
- **The local red-first script works**: `778-pr2-r4-stub.ts` (sha256 e00e0508062fddce41d4d6cd6a6e3fa013083f4fab0b4a1ae2a4792c197ec3b3) run with `STUB` and with `R14-frame-from-scale` prints the lines quoted under step 4, run with `R19-toggle-in-layout` prints `R19-toggle-in-layout: exit 1`, `ℹ pass 5`, `ℹ fail 1` and `  AssertionError [ERR_ASSERTION]: the frame the room bound with stands after the pinch`, and the tree's only change afterwards is the throwaway test.
- **Nothing else moves**: `git grep -n -E 'EA7|EA8' origin/feat/778-desk-frame -- handbook/specs handbook/errata .claude e2e/support test` names them only in `e2e/support/skips.ts` and the `MEASURED_SECONDS` provenance line, so no spec, errata row or gate names EA7 or EA8 as the seat reads' guard; no durable doc carries the unit count (`git grep` for `270[0-9]` over `handbook`, `.claude`, `CLAUDE.md`, `test/repo` finds none); `test-support/source-read-list.ts` keeps `"test/site/room.test.ts": [data("public/atelier.css")]` unchanged, since the new tests read no file (the source-read guard ran under every measured run and passed); `MEASURED_SECONDS` is untouched, since no e2e suite changes.

## The plan skeptic (cold, on the issue and this plan, 2026-10-15)

Nothing blocking; 34 claims run down, none wrong; four NITs.

- **Folded**: the Issue #897 comment's restore sentence said a restored row reads IMPRECISE unless it names `test/site/room.test.ts`; the runner runs only the unit files a row names (`scripts/proof-runner/job.ts`), so it now says a row naming that file must expect the tests, and one naming no unit file never runs them.
- **Folded**: UD2's framed assertion was proved only against a frame never set (R1, R2); R19, the toggle moved into `layout`, now proves it against the frame decided again at a layout (call 76; measured, it reds UD2's framed assertion alone).
- **Noted, not changed**: the save, install and restore of globals now has two copies in the file, the existing test's inline one and `withRoomGlobals` (see Rejected).
- **Rejected**: turning this archive's machine-local paths (the lane's tree, the scratchpad) into placeholders. The implementer builds from the scratchpad copy, which must carry runnable paths, and workflow step 8 archives that copy unchanged; revisions 2 and 3 carry the same kind of line; the evidence the scratch inputs produce (the red lines, the proof run) lands in the PR body and the comments, and the test text and every row's edit are written out here.

## The design

1. **Two unit tests, UD1 and UD2, at the end of `test/site/room.test.ts`**, run `bindRoom` over shimmed chrome on the sideways phone's desk frame: the root 1024 by 474 (the phone's layout viewport, `PHONE.laidOut` in `e2e/suites/stage/stage.ts`), `--desk-frame-h` 768, `visualViewport.scale` 0.82421875, so `bindRoom` sets the frame's class and the frame's foot is 294 down, the numbers EA7 runs at. The room has the head, the slip's folio and an open slip above the sheet, and below it the chart folio, a Press stacked and risen, and the Reading Room's strip, so every vertical read the layout makes is live and every compared field is off its fallback.
2. **Every shimmed rect follows the live `window.scrollY`**: a file-local `PageEl` holds its rect in page coordinates and answers `getBoundingClientRect` with the scroll taken off, which is the browser's own contract, so one assignment scrolls the whole room and no rect can be forgotten.
3. **UD1** lays the room out unscrolled, then sets `window.scrollY` to 294 and lays the same room out again, and pins both layouts to one literal record, `DESK_SEATS`: `under` false, `--reserve-top` 142px, `--reserve-bottom` 222px, the slip's `top` 112px and `maxHeight` 576px, the Press's `bottom` 100px. R5 to R9 each red its second assertion.
4. **UD2** lays the room out, sets `visualViewport.scale` to 2 (a pinch past full size), lays it out again, and pins the frame's class still set and the same `DESK_SEATS`. R14 reds its seats assertion (`pageBox` reading the live scale) and R19 its framed assertion (the frame decided again at a layout): the frame decided as the room binds is never re-read.
5. **The proof is the implementing session's** (workflow step 15; the prover's one round ran, comment 6186639847): a local red-first run of the combined stub and of R14 after commit 15, then rows R5 to R9, R14, R19, R1, R2 and R4 as unit-only rows on the CI proof runner.
6. **What only the browser sees stays with Issue #897**: that a reader's swipe scrolls the framed page and the room lays out again there, that a two-finger pinch zooms the page and the room lays out again with the frame's rules standing, and the root's `overflow-y: auto` (R10), which EA9 holds regardless.

### Rejected, with the reason

- **One test asserting the scrolled record equals the unscrolled one**: a compare of two arms passes when both arms take the same fallback (the Press not stacking, the strip absent, the sheet floored), and Gate 1 item 5 asks each state pinned to a measured constant; the literal record excludes every fallback (the strip floor gives 576, the page foot would give 634; the Press gives 100px, its fallback `""`; the reserves 142 and 222, the floored fallback 0).
- **Two fresh rooms, one bound at 0 and one at 294, in place of one room laid out twice**: EA7 lays the same room out again, and every field UD1 reads is rewritten by each layout (`placeSlip` always writes; `placeLegendRow` clears `bottom` first; the reserves are written whenever the sheet holds, which every measured mutation keeps, R5's floored sheet included).
- **R14 left unproven until Issue #897**: its code half is exactly "`pageBox` follows the class set as the room binds, never the live scale", which UD2 runs and R14 reds alone; only the browser's pinch is out of a unit test's reach.
- **The suggestion's 0.41 scale, or the upright phone**: the sideways phone is where the frame scrolls (294), the case EA7 and the cold review named, and its 474 differs from the frame's 768, which R14, R1, R2 and R4 need to show.
- **Rects moved by hand per arm**: a rect left unmoved reds the correct code; the live-scroll `PageEl` moves all of them by one assignment.
- **A helper in `test-support/`**: only this file uses it (Gate 1 item 8 sends a SHARED helper there).
- **e2e checks on the resend rows**: EA7 and EA8 are skipped (a row naming them reads HOLE or IMPRECISE, settle-doctrine item 11), and the rows' other e2e checks already BITE at `25b0432d` (run 38732678279).
- **A `vellum-guard-prover` round, or a new cold skeptic round**: see calls 71 and 72.
- **Moving the existing `bindRoom seats the legend row before it fits the sheet` test onto `withRoomGlobals`**: it writes the same save, install and restore inline, a known duplicate after commit 15, but rewriting a test the finding did not touch is outside this revision.

## Files

### Commit 15 (exactly these two files)

**`handbook/plans/778/778-pr2-r4-plan.md`** (created): this file, copied unchanged from the scratchpad; `cmp` the copy against the scratchpad file before committing.

**`test/site/room.test.ts`**: replaced by the scratchpad's `778-pr2-r4-room.test.ts` (`cp`, then `cmp` against it, then `git diff --numstat` must print `161	0	test/site/room.test.ts`). The change, exactly: one import line inserted directly after `import { resolve } from "node:path";`:

```ts
import { DESK_FRAME } from "../../src/site/shared/page-box.ts";
```

and, after the file's last line (the closing `});` of UL1), a blank line and this block:

```ts
const FRAME_H = 768;
const SIDEWAYS = { clientWidth: 1024, clientHeight: 474, scale: 0.82421875 };
const FOOT = FRAME_H - SIDEWAYS.clientHeight;

type Box = { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };

const liveScrollY = (): number => (globalThis as unknown as { window: { scrollY: number } }).window.scrollY;

class PageEl extends El {
  readonly page: Box;
  constructor(tag: string, page: Box) {
    super(tag);
    this.page = page;
  }
  override getBoundingClientRect() {
    const { left, top, right, bottom } = this.page;
    const y = liveScrollY();
    return { left, right, top: top - y, bottom: bottom - y, width: right - left, height: bottom - top };
  }
}

const press = (offsetTop: number): El =>
  Object.assign(new El("button"), { offsetTop, rect: { left: 0, top: 0, right: 80, bottom: 32 } });

class StackedLegend extends PageEl {
  override querySelectorAll(): El[] {
    return [press(0), press(44)];
  }
}

const deskEls = (): Map<string, El> =>
  new Map<string, El>([
    ["header.chrome", new PageEl("header", { left: 32, top: 16, right: 600, bottom: 128 })],
    [".corner.tr", new PageEl("div", { left: 800, top: 16, right: 1000, bottom: 96 })],
    [".slip", new PageEl("aside", { left: 700, top: 112, right: 1000, bottom: 600 })],
    [".corner.bl", new PageEl("div", { left: 32, top: 680, right: 300, bottom: 752 })],
    [".legend", new StackedLegend("nav", { left: 340, top: 560, right: 640, bottom: 668 })],
    [".strip", new PageEl("div", { left: 0, top: 700, right: 1024, bottom: 760 })],
  ]);

const ROOM_GLOBALS = ["document", "window", "ResizeObserver", "getComputedStyle"] as const;

function withRoomGlobals(body: () => void): void {
  const g = globalThis as Record<string, unknown>;
  const saved = ROOM_GLOBALS.map((n) => [n, n in g, g[n]] as const);
  try {
    body();
  } finally {
    for (const [n, had, v] of saved) {
      if (had) g[n] = v;
      else delete g[n];
    }
  }
}

type DeskWindow = { scrollY: number; readonly visualViewport: { scale: number } };

function installDesk(els: Map<string, El>): { root: { classList: El["classList"] }; body: El; win: DeskWindow } {
  const root = {
    clientWidth: SIDEWAYS.clientWidth,
    clientHeight: SIDEWAYS.clientHeight,
    classList: new El("html").classList,
  };
  const body = new El("body");
  const win = { addEventListener: () => {}, scrollX: 0, scrollY: 0, visualViewport: { scale: SIDEWAYS.scale } };
  const g = globalThis as Record<string, unknown>;
  g.document = {
    querySelector: (sel: string) => els.get(sel) ?? null,
    documentElement: root,
    body,
    createRange: () => ({}),
  };
  g.window = win;
  g.ResizeObserver = class {
    observe() {}
  };
  g.getComputedStyle = () => ({
    getPropertyValue: (p: string) => (p === "--desk-frame-h" ? `${FRAME_H}px` : ""),
    fontSize: "16px",
    top: "",
  });
  return { root, body, win };
}

type DeskRoom = {
  readonly layout: () => void;
  readonly seats: () => Record<string, unknown>;
  readonly framed: () => boolean;
  readonly win: DeskWindow;
};

function bindDeskRoom(): DeskRoom {
  const els = deskEls();
  const { root, body, win } = installDesk(els);
  const frame = new El("div");
  const { layout } = bindRoom({
    frame: frame as unknown as HTMLElement,
    sheet: new El("div") as unknown as HTMLElement,
    camera: { hold: () => null, restore: () => {} },
    aspect: () => 1.5,
  });
  const style = (sel: string) => els.get(sel)?.style;
  return {
    layout,
    win,
    framed: () => root.classList.contains(DESK_FRAME),
    seats: () => ({
      under: body.classList.contains("stage-under"),
      reserveTop: frame.style.getPropertyValue("--reserve-top"),
      reserveBottom: frame.style.getPropertyValue("--reserve-bottom"),
      slipTop: style(".slip")?.top,
      slipMax: style(".slip")?.maxHeight,
      pressFoot: style(".legend")?.bottom,
    }),
  };
}

const DESK_SEATS = {
  under: false,
  reserveTop: "142px",
  reserveBottom: "222px",
  slipTop: "112px",
  slipMax: "576px",
  pressFoot: "100px",
};

test("UD1 a room in the desk frame laid out again at the frame's foot seats its reserves, its slip and its risen Press where it seats them unscrolled: every vertical read is in page coordinates (Issue #778)", () => {
  withRoomGlobals(() => {
    const room = bindDeskRoom();
    room.layout();
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      "unscrolled: the reserves clear the head's foot (128 + 14) and the risen Press's top (768 - 560 + 14), the slip hangs below its folio (96 + 16) and stops above the strip (700 - 12 - 112), and the risen Press stands above the chart folio (768 - 680 + 12)",
    );
    room.win.scrollY = FOOT;
    room.layout();
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      `laid out again at the frame's foot, scrolled ${FOOT}, every seat stands where it stood unscrolled`,
    );
  });
});

test("UD2 a pinch past full size after the room binds leaves the desk frame standing and its seats unmoved: whether the page was set small is read once, as the room binds (Issue #778)", () => {
  withRoomGlobals(() => {
    const room = bindDeskRoom();
    room.layout();
    room.win.visualViewport.scale = 2;
    room.layout();
    assert.equal(room.framed(), true, "the frame the room bound with stands after the pinch");
    assert.deepEqual(
      room.seats(),
      DESK_SEATS,
      `laid out again after the pinch, the room still lays out on the frame's ${FRAME_H}, not the window's ${SIDEWAYS.clientHeight}`,
    );
  });
});
```

Sizes after the change: the file 268 lines, its longest function `installDesk` under the lint's 50; no comment is added (the assertion messages carry the arithmetic). No other file changes: `test-support/source-read-list.ts`, `test-support/element-shim.ts` and every file under `src/` stay as they are.

## Tests, in the order they are written

| test | file | assertion | red-first stub (after commit 15, by the script) | mutations that red it once green |
|---|---|---|---|---|
| UD1 | `test/site/room.test.ts` | `assert.deepEqual(room.seats(), DESK_SEATS)` unscrolled, then again with `window.scrollY` 294 | `STUB`: R5 to R9 together, the five vertical reads in window coordinates as `main` makes them; reds its second assertion | R5, R6, R7, R8, R9 each alone (the at-foot assertion); R1, R2, R4 (the unscrolled assertion) |
| UD2 | `test/site/room.test.ts` | `assert.equal(room.framed(), true)` and `assert.deepEqual(room.seats(), DESK_SEATS)` after `visualViewport.scale` goes to 2 | `R14-frame-from-scale`: `pageBox` decides from the live scale; reds the seats assertion | R14 alone (the seats assertion); R19 alone (the framed assertion); R1 and R2 (the framed assertion); R4 (the seats assertion) |

Both go in green at commit 15, since the behaviour they hold is built (commits `0d17e013` and `be559669`): a test written after its behaviour cannot be red without a mutation, so the red-first is the stub run after the commit (workflow step 15), red on the assertion and never on a missing module (both import modules that exist). The prover owes nothing (call 71); every row is proved by the implementing session.

## Order of steps (one command per call; commit before every mutation run)

0. **Check the plan stands.** `git fetch origin`; `git rev-parse origin/feat/778-desk-frame` prints `e6ede25d4044252482f79492b4583934e81af81d`; `git rev-parse origin/main` prints `c968619eb60e1296d0a8260bfd5513c5515a4547`; `gh api repos/ahl-gram/Vellum/actions/runs/38736979576 --jq .conclusion` prints `success`.
1. **In the lane's tree** (today `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a19b63eadc8576ae8`; which tree a resumed lane stands in is the dispatcher's): `git branch --show-current` prints `feat/778-desk-frame`, `git status --short` prints nothing, `git rev-parse HEAD` prints `e6ede25d4044252482f79492b4583934e81af81d`.
2. **Commit 15**: the two files above. Verify (below) before committing. Subject: `#778 Tests: UD1 and UD2 hold the desk frame's page-coordinate seats and the frame read once, in the unit suite (the cold review's finding 1, Alex's ruling A; plan revision 4)`. `git diff HEAD~1 --stat` after it names exactly the two files. Push.
3. **CI on commit 15**: every job green.
4. **The local red-first runs**, from the lane's tree at commit 15, each a call of its own: `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4226c941-1f93-4182-81ce-0f4f9383ba49/scratchpad/778-pr2-r4-stub.ts STUB`, then `node /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4226c941-1f93-4182-81ce-0f4f9383ba49/scratchpad/778-pr2-r4-stub.ts R14-frame-from-scale`, then `git status --short`, which prints nothing. The script restores each file it edits from the text it read, in a `finally`. The first prints exactly:

   ```
   STUB: exit 1
   ℹ pass 5
   ℹ fail 1
     AssertionError [ERR_ASSERTION]: laid out again at the frame's foot, scrolled 294, every seat stands where it stood unscrolled
     +   pressFoot: '394px',
     +   reserveBottom: '516px',
     +   reserveTop: '14px',
     -   pressFoot: '100px',
     -   reserveBottom: '222px',
     -   reserveTop: '142px',
     +   slipTop: '-182px',
     -   slipTop: '112px',
   ```

   and the second exactly:

   ```
   R14-frame-from-scale: exit 1
   ℹ pass 5
   ℹ fail 1
     AssertionError [ERR_ASSERTION]: laid out again after the pinch, the room still lays out on the frame's 768, not the window's 474
     +   pressFoot: '-194px',
     +   reserveBottom: '14px',
     -   pressFoot: '100px',
     -   reserveBottom: '222px',
   ```

5. **The proof send** (workflow step 11), from the lane's tree at the pushed commit 15, clean: `npm run proof -- send /private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/4226c941-1f93-4182-81ce-0f4f9383ba49/scratchpad/778-pr2-r4-mutations.json --label 778-pr2-r4` (it compiles each row's edits against `HEAD` through `git show`, so nothing in the tree is touched), then, when the run completes, `npm run proof -- read <run id>`.
6. **The Issue #778 comment** (below).
7. **The Issue #897 comment** (below), once the ledger is read.
8. **The PR #896 comment** (below).
9. **The PR body edit** (below): read the current body first (`gh pr view 896 --repo ahl-gram/Vellum --json body --jq .body`), write the edited body to a scratch file named `778-pr2-r4-body-edit.md`, then `gh pr edit 896 --repo ahl-gram/Vellum --body-file <that file>` in a call of its own; then `gh pr view 896 --repo ahl-gram/Vellum --json closingIssuesReferences` still lists Issue #778 alone.
10. **Report** to the dispatcher. No `vellum-guard-prover` and no `vellum-pr-skeptic` is dispatched (calls 71 and 72).

## Verification

Commit 15, before committing: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (which ends `ℹ tests 2706`, `ℹ pass 2706`, `ℹ fail 0`; then `npm run astro:generate`). No build and no e2e suite is owed: the commit changes one unit test file and a plan archive. No em-dash (U+2014) in any added line. The full local e2e lanes are never run.

## The proof send (workflow step 11)

`778-pr2-r4-mutations.json` (sha256 514243cfc6e1f235064e9c7910306e71e179e82b79177785c78bd8c2cc765920) holds revision 1's edits for each of its rows, unchanged, and this revision's R19, all as unit-only rows; the full test names are the ones in the code above, and UF4's is `test/site/page-box.test.ts`'s own. R19's two edits, both in `src/site/shared/room.ts`: the line `  document.documentElement.classList.toggle(DESK_FRAME, deskFrameDue(window.visualViewport?.scale ?? 1));` deleted from directly above `  const { frame, sheet, camera } = parts;`, and the same statement, indented four spaces, inserted directly above `    const held = camera.hold();`.

| row | mutation (revision 1's table) | unit files | expected reds |
|---|---|---|---|
| R5 | `tops` back to `r.top` | `test/site/room.test.ts` | UD1 |
| R6 | `bottoms` back to `r.bottom` | `test/site/room.test.ts` | UD1 |
| R7 | `placeSlip`'s top back to the folio rect's `bottom` | `test/site/room.test.ts` | UD1 |
| R8 | `placeSlip`'s strip floor back to `stripRect.top` | `test/site/room.test.ts` | UD1 |
| R9 | `placeLegendRow`'s risen foot back to `folio.top` | `test/site/room.test.ts` | UD1 |
| R14 | `pageBox` decides the frame from `deskFrameDue(window.visualViewport?.scale ?? 1)` | `test/site/room.test.ts` | UD2 |
| R1 | `bindRoom`'s toggle line deleted | `test/site/room.test.ts` | UD1, UD2 |
| R2 | `deskFrameDue` returns `false` | `test/site/page-box.test.ts`, `test/site/room.test.ts` | UF4, UD1, UD2 |
| R4 | `pageBox` ignores the class | `test/site/room.test.ts` | UD1, UD2 |
| R19 | the toggle moved from the head of `bindRoom` to the head of `layout` (new) | `test/site/room.test.ts` | UD2 |

Reading the ledger: every row must read BITES and `control-unit` CLEAN. Any other verdict, IMPRECISE included (each set was measured exact), is a stop.

## The record

### The Issue #778 comment (step 6; `gh issue comment 778 --repo ahl-gram/Vellum --body-file <scratch file>`)

```
**Calls made for plan revision 4 (a unit guard for the desk frame's seat reads), 2026-10-15, by the implementing lane.** The plan is `handbook/plans/778/778-pr2-r4-plan.md` (committed in `<commit 15 short sha>`), written to Alex's ruling on the cold review's finding 1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257). The calls below extend https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332 and https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191849280; none was ruled on in the issue except where they say so.

<this plan's "Calls made" section, from its first line (63) to its last (the paragraph beginning "What UD1 does not pin"), copied exactly>
```

### The Issue #897 comment (step 7; `gh issue comment 897 --repo ahl-gram/Vellum --body-file <scratch file>`)

Fill the slots from commit 15 and the ledger:

```
**What the unit suite now holds of EA7's and EA8's claims, 2026-10-15, by the implementing lane** (Issue #778's second pull request, PR #896, plan revision 4, by Alex's ruling https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257). This supersedes, for the code's half of both claims, the sentence of https://github.com/ahl-gram/Vellum/issues/897#issuecomment-6191845514 that calls R5 to R9 and R14 unproven, and this issue body's "unprotected until they return".

Two unit tests in `test/site/room.test.ts` (commit `<commit 15 short sha>`) run `bindRoom` over shimmed chrome on the sideways phone's desk frame (laid out 1024 by 474, framed 768 tall), each rect read off the live `window.scrollY`:
- UD1 lays the room out unscrolled and again scrolled 294, and pins the reserves, the slip's top and height and the risen Press's foot to the same values both times. R5, R6, R7, R8 and R9 each turn it red.
- UD2 lays the room out again after `visualViewport.scale` goes from 0.82421875 to 2, and pins the frame's class and the same seats. R14 turns it red, and so does a new row, R19, which moves the frame's toggle from `bindRoom` into `layout`.

Proof run <run id> at `<commit 15 short sha>` (https://github.com/ahl-gram/Vellum/actions/runs/<run id>), unit rows only: <each row's id and verdict, and the control's>.

What stays with this issue, which no unit test can see: that a reader's swipe on the framed page scrolls it to the frame's foot and the room lays out again there, and that a two-finger pinch zooms the page past full size and the room lays out again with the frame's rules standing; the root's `overflow-y: auto` (R10) stays held by EA9 either way. For the restore: R1, R2, R4, R5 to R9 and R14 now also red UD1 or UD2 (R2 beside UF4), as the run above lists; the proof runner runs only the unit files a row names, so a restored row that names `test/site/room.test.ts` must expect those tests too, or it reads IMPRECISE, and one that names no unit file never runs them.
```

### The PR #896 comment (step 8; `gh pr comment 896 --repo ahl-gram/Vellum --body-file <scratch file>`)

```
**The seat reads EA7 and EA8 held are now guarded in the unit suite**, by Alex's ruling on the cold review's finding 1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257). This supersedes the last sentence of https://github.com/ahl-gram/Vellum/pull/896#issuecomment-6191715590 for the code's half: UD1 and UD2 in `test/site/room.test.ts` (commit `<commit 15 short sha>`) turn red under proof rows R5 to R9 and R14, and under a new row R19 that moves the frame's toggle into `layout` (proof run <run id>). What only EA7 and EA8 can see, a reader's swipe and pinch moving the page itself, stays unprotected until Issue #897 closes; R10 stays held by EA9.
```

### The PR body (step 9)

Edit only these lines of the current body, each identified by how it begins; each replacement is exact, with its slots filled:

- The paragraph beginning "**Plans.** Built from" becomes: "**Plans.** Built from `handbook/plans/778/778-pr2-plan.md` (frozen) and four revisions: `handbook/plans/778/778-pr2-r1-plan.md`, written after the first build's hand-back (two of the first plan's stop conditions fired in the stage suite); `handbook/plans/778/778-pr2-r2-plan.md`, after the second (doctrine edit 12 did not fit the footgun hook's note, and EA7 and EA8 never reached their assertions on CI's browser); `handbook/plans/778/778-pr2-r3-plan.md`, after the third (no instrument the probe tried scrolled every room on both browsers) and Alex's ruling to skip EA7 and EA8 for now; and `handbook/plans/778/778-pr2-r4-plan.md`, after the cold review's finding 1 and Alex's ruling to guard the seat reads in the unit suite. What the first revision changed:"
- Directly after the paragraph beginning "What the third revision changed", insert a blank line and this paragraph: "What the fourth revision changed, by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257) on the cold review's finding 1: two unit tests in `test/site/room.test.ts`, UD1 and UD2, hold the code's half of what EA7 and EA8 hold in the browser. A room in the desk frame laid out again at the frame's foot seats its reserves, its slip and its risen Press where it seats them unscrolled (UD1), and a pinch past full size after the room binds leaves the frame and those seats standing (UD2). What no unit test can see, a reader's swipe and pinch moving the page itself, stays with Issue #897."
- In the guard table, directly after the row beginning "| UF4 ", insert this row: "| UD1 and UD2: in the desk frame, a room laid out again at the frame's foot keeps every seat it has unscrolled (UD1), and a pinch past full size after the room binds keeps the frame and the same seats (UD2) | the five vertical seat reads in window coordinates together, as `main` makes them (UD1); `pageBox` deciding the frame from the live scale, proof row R14 (UD2); each run by this session after commit `<commit 15 short sha>` | UD1: `AssertionError [ERR_ASSERTION]: laid out again at the frame's foot, scrolled 294, every seat stands where it stood unscrolled` / `+   pressFoot: '394px'`; UD2: `AssertionError [ERR_ASSERTION]: laid out again after the pinch, the room still lays out on the frame's 768, not the window's 474` / `+   reserveBottom: '14px'` |"
- The row beginning "| EA1, EA6, EA9, DN10, UF4 |" keeps everything up to its last clause; its last clause, beginning "R5 to R9 and R14, whose only checks are EA7 and EA8", becomes: "R5 to R9 and R14, whose only browser checks are EA7 and EA8, not sent while they are skipped (the unit rows below) |"
- Directly after that row, insert this row: "| UD1, UD2, UF4 | revision 1's rows R1, R2, R4, R5 to R9 and R14, and the fourth revision's R19 (the frame's toggle moved into `layout`), sent as unit rows on the CI proof runner (run <run id>, sha <commit 15 short sha>) | <each row's id and verdict, and the control's>: R5 to R9 red UD1 alone, R14 and R19 UD2 alone, R1 and R4 both, R2 both beside UF4 |"
- Under `## Ran`, the unit line becomes: "- unit: `npm test` (`2706 pass, 0 fail`, at head <commit 15 short sha>; then `npm run astro:generate`)"
- The line beginning "- **CI on the head" becomes: "- **CI on the head <commit 15 short sha>: green**, every job, EA7 and EA8 skipped on purpose under Issue #897. Before the skip both stopped on CI's browser (`settle timeout EA7 /explorer/ a swipe reaches the frame's foot: 0`, `settle timeout EA8 the pinch takes the page past full size: 0.82421875`) while passing locally: https://github.com/ahl-gram/Vellum/pull/896#issuecomment-6191715590."
- Under `## Records`, the line beginning "- vellum-plan-skeptic:" becomes: "- vellum-plan-skeptic: ran on the frozen plan (its findings folded, see the plan's Measured section), on revision r1 before it was built, and on revisions r2, r3 and r4 before they were built"
- The line beginning "- vellum-guard-prover:" becomes: "- vellum-guard-prover: https://github.com/ahl-gram/Vellum/pull/896#issuecomment-6186639847 (four holes); guards changed after its one round, proven by this session only: UF3's negative-scroll row, UF4's pixel-shrunk row, the cleanup test's ordering and refused-removal arms, each red on its mutation in a sandbox at a9b31191; and UD1 and UD2, written for the cold review's finding 1, each red on its stub after commit <commit 15 short sha> and on rows R1, R2, R4, R5 to R9, R14 and R19 in proof run <run id>; the browser half of R5 to R9 and R14 (EA7 and EA8) is unproven until Issue #897 closes"
- The line beginning "- vellum-pr-skeptic:" becomes: "- vellum-pr-skeptic: one cold round at `13a6556d`, relayed in chat 2026-10-15, nothing blocking (CI green on that head, `npm test` 2704 of 2704, lane timings arithmetic and every grep attack held): finding 1 (SHOULD-FIX: with EA7 skipped, no running check guards the page-coordinate seat reads in `room.ts` and `room-seats.ts`) is fixed by UD1 and UD2 in `test/site/room.test.ts` (commit `<commit 15 short sha>`, plan revision 4), by Alex's ruling A (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257), R14 pinned the same way; finding 2 (SHOULD-FIX: a place card clamped into the 768 map viewport can sit below the screen) is a `handbook/errata/site.md` row (commit `26919071`); findings 3 and 4 (NITs: the `DESK_ROWS` comment and `pageBox`'s doc line restating what proof rows R12, R13 and R4 pin) are fixed by deleting them (commit `e6ede25d`); finding 5 (NIT: call 14 says `stage.ts` stays on a `max-lines` suppression it does not hold, lint passing on non-comment lines) is corrected in https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192364866; no fix went back to it (workflow step 15)"
- Under `## Rulings`, the first line becomes: "- calls made that the issue did not rule on: https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332 (Calls made 1 to 31), https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191849280 (the second and third revisions' calls) and <the step 6 comment's link> (the fourth revision's calls); the Reading Room's first-layout lag is folded into Issue #868 as a dated comment on that issue"
- The second becomes: "- open decisions still Alex's: none; ruled during the build: where the reduced-motion line goes (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), skipping EA7 and EA8 for now (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6191066424; the restore is Issue #897), and guarding the seat reads in the unit suite (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257)"
- Under `## Look for these when you use it`, in item 2 the closing "(what EA7 held; skipped under Issue #897)." becomes "(what EA7 holds in the browser, skipped under Issue #897; UD1 holds the code's half)." and in item 4 the closing "(What EA8 held; skipped under Issue #897.)" becomes "(What EA8 holds in the browser, skipped under Issue #897; UD2 holds the code's half.)"

Nothing else in the body changes.

## Calls made (revisions 1 to 3's stand; 63 to 76 are new)

63. **The guard is two tests, UD1 for the scroll and UD2 for the pinch, so each proof row reds one test.** Rule: workflow step 11 (a row names exactly the reds it expects); Gate 1 item 1 (each test's mutation named before it is written); measured: R5 to R9 red UD1 alone, R14 and R19 UD2 alone.
64. **UD2 pins R14 in the unit suite.** Rule: Alex's ruling names R14 beside R5 to R9 ("R14 likewise"); its code half is "`pageBox` follows the class set as the room binds, never the live scale", which UD2 runs and R14 reds alone (measured); the browser's pinch is the half only EA8 can see, which Issue #897 keeps.
65. **The fixture is the sideways phone's frame, laid out 1024 by 474, framed 768, its foot 294, with an open slip, the Reading Room's strip and a stacked, risen Press.** Rule: Gate 1 items 2 and 3 (each compared field off its fallback: the strip floor and not the page foot, the Press's `bottom` and not `""`, the reserves and not the floored 0); EA7's own numbers (`PHONE.laidOut`, `DESK_FRAME_H` in `e2e/suites/stage/stage.ts`); a window height unlike the frame's, without which R14, R1, R2 and R4 could not show.
66. **Each state is pinned to one literal record, `DESK_SEATS`, rather than the scrolled layout compared with the unscrolled one.** Rule: Gate 1 item 5 (each state pinned against a measured constant, never A against B); item 3 (two arms that both take a fallback agree).
67. **Every shimmed rect is read off the live `window.scrollY` through a file-local `PageEl`.** Rule: Gate 1 item 12 (the shim states every rect, so the test states the browser's contract, viewport equals page less scroll, once); item 8 (only a shared helper goes to `test-support/`).
68. **UD1 lays the same room out twice, as EA7 does.** Rule: EA7's design (the room laid out again, revision 1); measured, every field UD1 reads is rewritten by each layout under every row (`placeSlip` always writes, `placeLegendRow` clears `bottom` first, the reserves are written whenever the sheet holds, R5's floored sheet included), so no stale value can stand in.
69. **Commit 15 adds the tests green, and their red-first is the stub run after the commit**: R5 to R9 together for UD1, R14 for UD2. Rule: workflow step 15 (a guard added after the round is proven by breaking the behaviour it guards, committed first); the behaviour is built, so a test written now is red only under a mutation; both tests import modules that exist, so neither can red on a missing one.
70. **The tests read no file**, so `SOURCE_READS` is unchanged. Rule: `handbook/specs/check-placement.md`, "The unit suite" (a unit test runs the code and asserts what it does; the source-read guard fails an unlisted read), confirmed by the guard passing under every measured run.
71. **No `vellum-guard-prover` round: UD1 and UD2 are proven by the implementing session, and the PR body says so.** Rule: workflow step 15 and `.claude/agents/vellum-implementer.md` (the prover gets one round per pull request; its exception is for a pull request whose prover never ran, and this one's ran, comment 6186639847; a guard written after its round is the implementing session's to prove).
72. **No new `vellum-pr-skeptic` round.** Rule: workflow step 15 (a finding is fixed after the round and the fix goes back to none of them) and `vellum-footguns`'s ruled default (no edit made after the cold skeptic has finished earns another round, Alex, 2026-10-03).
73. **The resend is unit-only and carries R1, R2 and R4 beside R5 to R9, R14 and R19.** Rule: workflow step 11 (exact sets; a red not named reads IMPRECISE); measured, the new tests red under R1, R2 and R4, so naming them makes the guard table exact at commit 15 and gives Issue #897's restore its lists; the rows' e2e checks are left off, since EA7 and EA8 are skipped and the others already BITE at `25b0432d`.
74. **One new comment each on Issue #778, Issue #897 and PR #896; no old comment is edited.** Rule: workflow step 12 (a correction is a new comment that says what it supersedes); the PR #896 comment and Issue #897's comment and body each say the seat reads are unprotected, which UD1 and UD2 make true only of the browser half.
75. **This revision is archived as `handbook/plans/778/778-pr2-r4-plan.md` in commit 15, and the PR body names all four revisions.** Rule: workflow step 8. No `MEASURED_SECONDS` re-measure and no doc count moves: the commit touches no e2e suite, and no durable doc carries the unit count (`git grep`; the count lives in the PR body's `## Ran` line, `2706` measured).
76. **A new proof row, R19, moves the frame's toggle from `bindRoom` into `layout`, so UD2's framed assertion is proved against the frame decided again at a layout and not only against a frame never decided (R1, R2).** Rule: Gate 1 item 1 (name the mutation for the claim the assertion makes, here "read once, as the room binds"); the plan skeptic's finding 3; measured, R19 reds UD2's framed assertion alone.

What UD1 does not pin, named so nobody reads it as covered: the Press's `lean` class (`rowSheds` compares the Press's window top with the head's window foot, two window reads that move together under a scroll) and the sheet's own width and height, which follow from the reserves it does pin.

## Open decisions

None. Alex ruled the guard in (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6192409257). Untouched by this revision and Alex's whenever a line needs them: the hook's 8,000-character bound (Issue #708 ruling D) and how Gate 2 regains room; how and when EA7 and EA8 return (Issue #897).

## Stop conditions (hand back rather than adapt)

- Step 0: `origin/feat/778-desk-frame` is not `e6ede25d`, `origin/main` is not `c968619e`, or run 38736979576 did not conclude `success`.
- Issue #778 has more than the 21 comments recorded, other than a `Plan archive, not a ruling:` copy or the lane's own; Issue #897 is not open, or carries a comment beyond 6191845514 that is not the lane's own; PR #896 carries a comment beyond the three recorded that is not the lane's own.
- Step 1: the tree is not on `feat/778-desk-frame` at `e6ede25d`, or `git status --short` prints anything.
- Commit 15: `cmp` reports a difference for either copied file; `git diff --numstat` does not print `161	0	test/site/room.test.ts`; `npm run check`, `npm run lint`, `npm run format:check` or `npm test` reds; `npm test` ends with any count other than `2706` pass and `0` fail; `git diff HEAD~1 --stat` names a file beyond the two.
- Step 3: any CI job on commit 15 is red.
- Step 4: either run prints anything other than the lines quoted (a different message, a field beyond those listed, a `TypeError` or `ReferenceError`, `exit 0`), or `git status --short` prints anything afterwards.
- Step 5: `send` refuses the list or warns, or any row reads other than BITES, or `control-unit` is not CLEAN.
- A finding, from any source, about this plan's design rather than its build.
