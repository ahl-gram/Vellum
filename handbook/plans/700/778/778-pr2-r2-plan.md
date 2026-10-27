# Issue #778, pull request 2 of 2: the desk frame, revision 2

**Planned at:** `origin/main` c968619eb60e1296d0a8260bfd5513c5515a4547 (unmoved since the frozen plan and revision 1), Issue #778 read with 15 comments (2026-10-15): five are `Plan archive, not a ruling:` copies; the 14th, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332, is the implementing lane's own step 12 calls comment, which promises a later comment saying where doctrine edits 12 and 13 landed (written out below); the 15th, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927, is Alex's ruling on this revision's one open decision, folded here. PR #896 (`feat/778-desk-frame`) is open at head a9b31191f4a51221414c07a3b5c0fb4b4683e7f8 with 2 comments (the guard prover's, 6186639847, and the plate reader's, 6186641372).
**Revises:** `handbook/plans/778/778-pr2-r1-plan.md` (sha256 db06940678cbdd052c85f4950414ecf79188422fd36a1353f416c0b229f0c22c), frozen on the branch since commit `acddad8a` and archived on the issue as comments 6183449320 and 6183450135, after two hand-backs of 2026-10-15: (1) revision 1's doctrine edit 12 (Gate 2 item 16) takes the footgun hook's note for a new e2e suite from 7942 to 8561 of the 8,000 characters `test/repo/footgun-gate.test.ts` allows; (2) EA7 and EA8 never reach their assertions on CI's browser (run 38696092886, lane B), so every stage row of proof run 38695757940 read INCONCLUSIVE.
**Rulings:** revision 1's stand: Alex's rulings 9 and 10, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6157453885, and his rulings on the frozen plan's three open decisions, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6182363777. This revision's one decision, D1 (where the reduced-motion warning line goes), Alex ruled on 2026-10-15, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927: "He chose **A: the styling checklist (Gate 3 item 7)**, over B (leave the held line parked with a dated note). The Gate 2 cap (Issue #708 ruling D) is untouched." This revision changes no ruled behaviour of the site.
**Open decisions:** none.

## What stands, and what this revision replaces

Everything in revision 1 stands, by reference, except what this section lists; the implementer keeps `778-pr2-r1-plan.md` open beside this file and reads both. This revision replaces, in revision 1:

- **Doctrine edits 12 and 13** (under "Rosters and doctrine"): Part A below.
- **EA7 and EA8** (their texts under "Tests", their rows R5 to R10 and R14, and the stop condition on "the swipe at 422,300" and "the pinch at 422,195"): Part B below.
- **The proof table's expected reds for R4 and R17**, and which rows are resent: Part C below.
- **"Order of commits"**: commits 1 to 11 are built (listed under Order); this revision adds commits 12 and 13 and moves `MEASURED_SECONDS` to commit 14.
- **Calls made 13, 24, 26 and 31**: revised below; calls 32 to 50 are new.
- **The Specs bullet for `.claude/skills/vellum-footguns/`** (revision 1's last Specs bullet): replaced below.
- **Item 4 of revision 1's "What this revision changes"**, as the PR body carries it, and the PR body lines revision 2 makes stale: Part D below.
- **Stop conditions**: revision 1's stand for the commits already built and for commit 14, except the one on the swipe and the pinch, which Part B's replace.

**Superseded, never applied:** `778-pr2-SKILL-edited.md` and `778-pr2-held-lines-edited.md` in the scratchpad hold revision 1's edits 12 and 13. Do not copy, patch from or diff against them except as the stop condition below says.

## What this revision changes (the PR body carries this section, after revision 1's, under the plan it names; `<KIND>` is filled from the probe's choice, Part B)

1. **The gate line moves from Gate 2 to Gate 3**, by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927). The candidate held for this incident becomes Gate 3 item 7 of `.claude/skills/vellum-footguns/SKILL.md`, one sentence that names the condition under which the trap shows and points at its reason in `handbook/specs/cascade-traps.md`. Gate 2 could not take it: the note the hook pastes for a new e2e suite stands at 7942 of the 8,000 characters Issue #708's ruling D allows. The held line stays, with a dated line beneath it, the form `.claude/skills/vellum-footguns/references/held-lines.md` uses for every promotion.
2. **EA8 holds the page's scale itself.** No pinch the harness sends zooms the page on CI's browser (PR #893's finding, and this pull request's run 38696092886: the scale stayed at 0.82421875), so EA8 holds `visualViewport.scale` at 2 after the room binds and lays the room out again, which puts the one boot read to the test on every browser (`vellum-footguns` Gate 2 item 14).
3. **EA7 scrolls by `<KIND>` at a bare point off each room's sheet**, the instrument a probe on both browsers chose (PR #896 comment `<PROBE-COMMENT>`), where its first build's swipe on the sheet never scrolled the page on CI's browser; it still reads the room laid out again at the frame's foot against the same room laid out again unscrolled.
4. **The proof rows are resent** with R4's and R17's expected reds as proof run 38695757940 measured them.
5. **Two rows join `handbook/errata/guards.md`**: Gate 2's note has no room for a new line; and what CI's browser cannot drive under the harness's phone emulation (written only if the probe finds an instrument that scrolls locally and not on CI).
6. **What CI's browser does with a page gesture is written down** in `handbook/specs/settle-doctrine.md`, "The environment": it never zooms the page under the harness's pinch, and which scroll instruments the probe found it ignores, so the next phone check is not built on one.

## Specs (on top of revision 1's list, whose last bullet this replaces)

- `.claude/skills/vellum-footguns/SKILL.md`: Gate 3 in full (its lead: "The traps themselves are `handbook/specs/cascade-traps.md`'s ... This is the checklist; the reasons are not copied here"); Gate 2 items 1, 4, 6, 9, 12 and 14.
- `.claude/skills/vellum-footguns/references/held-lines.md`: the preamble ("How a line leaves", and "Provenance", whose second departure defines a "Noted" line), the two "Noted 2026-10-02, promoted:" lines under its Gate 1 section (the form edit 13 copies), and "From Issue #762, 2026-10-05".
- `handbook/specs/cascade-traps.md`: its second paragraph ("The checklist form of the same lines is `vellum-footguns` Gate 3, which points here rather than copying the reasons"), the bullet commit `5759ffaf` added ("Under reduced motion a change of style is a transition, even where no rule wrote one"), and the bullet on `(hover: none) and (pointer: coarse)`.
- `.claude/skills/vellum-footguns/hooks/README.md`: "What it does", its first bullet (which gate is pasted on which path), and "Cost" (the one-liner that prints each gate's length).
- `.claude/skills/vellum-footguns/hooks/gate-routes.ts` (`EDIT_GATES`) and `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` (`HOOK_CONTEXT_LIMIT`, `sizeProbes`).
- Issue #708's comments https://github.com/ahl-gram/Vellum/issues/708#issuecomment-5961114576 (ruling D, the lane's call on its item 15, and the call that promoted held lines "stay word for word with a dated "Noted" line beneath, the file's own form") and 5961975440 ("New gate lines carry one incident number each").
- `handbook/specs/settle-doctrine.md`: Gate 2's clauses and "The environment" (revision 1 named them; read them again before Part B's probe and EA7).
- `handbook/specs/development-workflow.md` step 11 (the proof runner: a row is BITES only when its reds equal its expected list, otherwise IMPRECISE, or HOLE with no red; `scripts/proof-runner/ledger.ts`).
- `handbook/errata/README.md`: a row's shape; search before adding one.

## Measured for this revision (2026-10-15)

- **The gate sizes** (this planner's tree at `c968619e`, whose `.claude/` is byte-identical to the branch at `a9b31191`: `git diff --stat c968619e a9b31191 -- .claude/` prints nothing, and the branch adds no unit test file and no top-level suite, so the size probes' longest names are unchanged; edits 12 and 13 applied exactly as Part A writes them, then restored):

  | read | before | after |
  |---|---|---|
  | Gate 3's pasted text (the README's "Cost" one-liner) | 2408 | 2822 |
  | size probe "a new stylesheet" (Gate 4 with Gate 3) | 3780 of 8000 | 4194 of 8000 |
  | size probe "a new page" (Gate 4 with Gate 3) | 3800 of 8000 | 4214 of 8000 |
  | size probe "a new e2e suite that clicks and escapes" (Gate 4 with Gate 2) | 7942 of 8000 | 7942 of 8000 |
  | `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` | 428 ok, 0 FAIL | 428 ok, 0 FAIL |
  | `node --test` over `test/repo/footgun-gate.test.ts`, `test/repo/prose-paths.test.ts` (with the branch's `e2e/suites/stage/styled-boot.ts` in place), `test/repo/memory-pointers.test.ts`, `test/repo/front-matter.test.ts` | | 19 pass, 0 fail |

- **CI's browser and a page gesture** (linux headless Google Chrome, `/usr/bin/google-chrome`, `--headless=new`; the local harness browser is Brave on macOS with the same flags):
  - A browser pinch (`Input.synthesizePinchGesture`) reaches the page with both fingers and never zooms it: PR #893's proof run 38494617110 (its body's "Revision 2" paragraph); in run 38696092886, ZG6 (lane A) reads `{"synthesized":1,"scale":1}` and EA8 (lane B) stops at `settle timeout EA8 the pinch takes the page past full size: 0.82421875`.
  - A synthesized touch swipe on the Explorer's sheet (`Input.synthesizeScrollGesture` at 422,300, 500 up) leaves the framed page at `scrollY` 0: run 38696092886, lane B, `settle timeout EA7 /explorer/ a swipe reaches the frame's foot: 0`. Whether the swipe's fingers reached the page is not measured. Locally the same swipe scrolls to 294 (revision 1's measurement).
  - Under the 1024x768 tablet emulation `(hover: none) and (pointer: coarse)` matches on CI's browser and the Explorer's gesture box takes `touch-action: manipulation` with the press off (ZG5, ZG9 and ZG2a pass in run 38696092886, lane A). At 844x390 on CI it is not measured; the probe reads it.
  - A dispatched mouse wheel scrolls a page on CI's browser at desktop metrics without touch emulation (H13h `"scrolled":300`, H19 and FL2 pass in run 38696092886, lane C). Under the phone emulation it is not measured.
- **Proof run 38695757940** (the ledger artifact, `scripts/proof-runner/ledger.ts` verdicts): both e2e controls RED on EA7 and EA8, so every stage row INCONCLUSIVE; R15 and R16 BITES (DN10); R4 reds EA6 only (revision 1 derived EA1, EA6 and EA8 from the code); R17 reds the unit UF4 and stage NS1, NA4, EA2, EL2 and EA4 (revision 1 derived EA2 alone); R10 reds EA9 (EA7 stopped); R11 EA9, R12 and R13 EA6, R18 EA1 and EA6, each as expected.
- **The plate reader's Print Room difference** (PR #896 comment 6186641372): upright framed `[31, 144.7, 506.5x391.1]` against the 1024x768 desktop's `[33, 145.7, 502.6x388.1]`. It matches, by size and sign, the open PR #777 row in `handbook/errata/site.md` ("the Print Room's chart fit depends on how many layout passes it has had ... its sheet grows about 3.9px"). Not reproduced by this planner. No plan change (Calls made 45).

## Part A: the gate line (doctrine edits 12 and 13)

Where the line goes is Alex's ruling D1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927): A, the styling checklist, Gate 3 item 7, over B, leaving the held line parked with a dated note.

### The design

Doctrine edit 12 appends one item, 7, to Gate 3 of `.claude/skills/vellum-footguns/SKILL.md`: one sentence, one incident (Issue #778), naming the condition under which the trap can show (the page's style resolved before the change) and pointing at `handbook/specs/cascade-traps.md` for the reason and at `e2e/suites/stage/styled-boot.ts` for the way to force that condition. Doctrine edit 13 leaves the held line word for word and adds a dated "Noted" paragraph beneath it. A `handbook/errata/guards.md` row records that Gate 2 has no room left (Calls made 37).

**What Gate 3 reaches, and what it does not.** The hook pastes Gate 3 on an edit to a `.css` or `.astro` file (`EDIT_GATES` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts`), which is where this defect was typed: the frame's body rule in `public/atelier.css` gave the body a new height on a class switch. It does not reach whoever edits a measuring script under `src/site/` (no route gates an edit there), and it does not reach a check writer; the check writer's general rule is Gate 2 item 12 ("Measure the instant you mean"), and the trap's own record is the cascade-traps bullet and EA1 and EA6.

### Rejected, with the reason

- **Gate 2 item 16 as revision 1 wrote it**: 619 characters into 58 of room; `npm test` reds (the hand-back's measurement; 7942 reproduced here as its control).
- **A Gate 2 pointer of 58 characters or fewer**: a bold lead, the spec's path and an incident number do not fit, and a line that fitted would leave Gate 2 with no room at all.
- **Trimming another Gate 2 item by the difference**: about 560 characters of ruled doctrine rewritten with no defect behind it; ruling D's own trims of Gate 1 were Alex's call.
- **Raising `HOOK_CONTEXT_LIMIT`**: Issue #708 ruling D, Alex's; not this issue's to move.
- **Pasting Gate 4 and Gate 2 one per edit, as Issue #782 did for Gate 1 and Gate 7**: a change to the hook's routes and fixture table, a design of its own, not needed once the line's home is Gate 3; named as the way out in the guards row.
- **Leaving the line held with a "waits for room" note**: D1's option B, which Alex did not choose (his ruling of 2026-10-15).
- **Deleting the held line and rewording its section's lead** (revision 1's edit 13): not the file's form.
- **"Owes a render under reduced motion" with no condition**: a single render can come back clean, since the trap shows only where the page had resolved its style before the change (revision 1's measurement: without a forced resolve 4 and 6 of 8 rooms met one); the line names the condition and the file that forces it.

### Files (commit 12)

**`.claude/skills/vellum-footguns/SKILL.md`**, doctrine edit 12. Directly after Gate 3 item 6's last line, "   dressing-level pins lag one live cycle." (line 218 on the branch), and before the blank line that precedes "## Gate 4: before adding anything that joins a roster", insert these five lines exactly:

```
7. **A box a script measures after a class or an inline style changes its size or seat owes a
   render under reduced motion with the page's style resolved before the change**, the case in
   which that change can run as a 0.01ms transition and a rect read in the same task finds the box
   where it started (`handbook/specs/cascade-traps.md`; `e2e/suites/stage/styled-boot.ts` forces
   the resolve; Issue #778).
```

Gate 3's `Scars:` line is unchanged. Nothing else in the file changes.

**`.claude/skills/vellum-footguns/references/held-lines.md`**, doctrine edit 13. Under "## From Issue #762, 2026-10-05", directly after the bullet that begins "- Under emulated reduced motion every property of every element transitions for 0.01ms" (left word for word) and before the bullet that begins "- A `Page.captureScreenshot` with a `clip.scale` of 3 or 4", insert a blank line, this paragraph as ONE line exactly, and a blank line:

```
Noted 2026-10-15, promoted: Gate 3 item 7 now carries it with its incident (Issue #778, where the desk frame's body read 0px as the Specimen Book first laid out under reduced motion and the room floored its sheet), and `handbook/specs/cascade-traps.md` its reason; it went to Gate 3, the checklist form that spec names, and not to Gate 2, whose note for a new e2e suite had no room for it under the 8,000-character bound of Issue #708's ruling D.
```

The section's lead sentence is NOT edited. Nothing else in the file changes.

**`handbook/errata/guards.md`**, `## Open`: after the last row (the PR #893 row that begins "- PR #893 (2026-10-13, medium): the camera's touch default fails open"), one new row, one line exactly:

```
- PR #896 (2026-10-15, high): the footgun hook's note for a new e2e suite (Gate 4 with Gate 2, `sizeProbes` in `.claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts`) stands at 7942 of the 8,000 characters Issue #708's ruling D allows, so Gate 2 can take no new line and the Gate 2 candidates in `.claude/skills/vellum-footguns/references/held-lines.md` cannot leave by promotion there; Issue #778's reduced-motion line went to Gate 3 for that reason, and the known way out is the one-gate-per-edit paste Issue #782 made for Gate 1 and Gate 7. Searched: this directory for "8,000", "HOOK_CONTEXT", "size probe" and "held-lines" (only the unrelated PR #628 and PR #730 rows); the open issues for "8,000 characters": none, and the open issues' titles for "gate", "footgun", "hook" and "held": only Issue #778.
```

**`handbook/plans/778/778-pr2-r2-plan.md`** (created): this file, copied unchanged from the scratchpad; `cmp` the copy against the scratchpad file before committing.

## Part B: EA7 and EA8 on CI's browser

### The design

- **EA8 holds the page's scale itself.** After the Explorer binds framed, the check defines `scale` on `window.visualViewport` as 2 (an own accessor shadowing the prototype's), dispatches a resize on the visual viewport and on the window (a real pinch fires the first; the room lays out on the second, so a re-read wired to either is seen), lets the room come to rest and compares its seats with those read before. A room that re-reads the scale (R14) lays out to the window and floors; one that read it once at bind keeps every seat. The check says why its instrument is artificial in its own text (Gate 2 item 14). No probe is owed for EA8: CI's browser never zooms the page under the harness's pinch, measured twice (above).
- **EA7's instrument is chosen by a probe run on both browsers**, by a fixed order, and EA7 is built with the first instrument that, on BOTH browsers, scrolls every chart room to the frame's foot from a bare point off its sheet AND leaves the page unscrolled when the root's `overflow-y` is held at `hidden` (the control that makes it a reader's scroll, which R10 removes, and not a programmatic one). The order: (1) `swipe`, the browser's own synthesized touch swipe; (2) `drag`, a dispatched one-finger drag; (3) `wheel`, a dispatched mouse wheel. If none qualifies, the implementer hands back with both readings (Stop conditions); EA7 is never rebuilt on `window.scrollTo`, which scrolls a root held at `overflow-y: hidden` and so cannot see R10 (Calls made 40).
- **The bare point**: the lowest point on a 20-pixel grid inset 40 from the edges of the SCREEN (the window's layout size times `visualViewport.scale`, 844 by 390 sideways) that is bare read both ways: as layout pixels, `(x, y)`, and as screen pixels, `(x / scale, y / scale)`. Bare means the topmost element there is the room's `.stage`, its frame element (the one carrying `--reserve-top` inline), the body or the root, and not inside `#map-viewport`. Only a touch has been measured to aim in layout pixels (`handbook/specs/settle-doctrine.md`, the headless window bullet); a synthesized swipe's and a wheel's space under the phone emulation is not, which is why revision 1 chose 422,300 to land on the sheet read either way. Read from the room's own elements, never a fixed offset (Gate 2 item 4); the lowest, so a swipe or a drag has room to travel up.
- **EA7's readiness** becomes "`scrollY` at or past the frame's foot, two reads agreeing" (`>=` where revision 1 had `===`): a wheel or a fling may stop at the root's own maximum, one pixel past 294 (the plate reader read "scrollY 294 of a root max of 295"), and the claim is the foot reached, which the page-coordinate compare does not depend on to the pixel.

### Rejected, with the reason

- **`window.scrollTo(0, 294)` for EA7**: scrolls a root held at `overflow-y: hidden`, so EA7 could no longer see R10, and the reach half of its claim would rest on EA9's computed-style read alone; a weakened check. Not a branch of this plan: if no reader's instrument scrolls on CI, that is Alex's to rule, through a hand-back.
- **`Emulation.setPageScaleFactor` for EA8**: as artificial as the held scale, unmeasured on CI's browser, and an emulation setting that may outlive the page into the desktop steps after EA8 (EA2 to EA5).
- **Keeping the browser pinch for EA8**: measured never to zoom the page on CI's browser.
- **Probing EA8 too**: its instrument does not depend on the browser.
- **One instrument for EA7 chosen without a probe** (the wheel, which CI's browser scrolls at desktop metrics): unmeasured under the phone emulation, and it would give up a touch instrument that may work off the sheet; a third hand-back costs more than one CI run.

### The probe (a throwaway branch, never merged)

**`e2e/suites/stage/probe.ts`** (created on the throwaway branch only), exactly:

```ts
// Throwaway, never merged (Issue #778 plan revision 2): which instruments scroll a framed phone page on this browser.
import { TOUCH_PRIMARY } from "../../../src/site/shared/chart-touch.ts";
import { DESK_FRAME } from "../../../src/site/shared/page-box.ts";
import { forgetChartTouch } from "../../support/chart-touch.ts";
import type { Payload, Point, SuiteContext } from "../../types.ts";
import { CHART_ROOM_FLOOR, DESK_FRAME_H, PHONE, open } from "./stage.ts";

type Kind = "swipe" | "drag" | "wheel";
type Env = { tp: boolean; framed: boolean; off: Point | null };
type Row = Env & { page: string; kind: Kind | "on"; hidden: boolean; y: number | null };

const FOOT = DESK_FRAME_H - PHONE.laidOut.h;
const KINDS: readonly Kind[] = ["swipe", "drag", "wheel"];
const SCROLL_Y: Payload<number> = "window.scrollY";
const HIDE: Payload<boolean> = `(document.documentElement.style.setProperty("overflow-y", "hidden"), true)`;
const ENV: Payload<Env> = `(() => {
  const stage = document.querySelector("body.chart-room .stage");
  const frame = document.querySelector("[style*='--reserve-top']");
  const bare = (el) => el !== null && el.closest("#map-viewport") === null && (el === stage || el === frame || el === document.body || el === document.documentElement);
  const s = visualViewport.scale;
  const w = Math.floor(innerWidth * s), h = Math.floor(innerHeight * s);
  let off = null;
  for (let y = h - 40; y >= 40 && off === null; y -= 20)
    for (let x = 40; x <= w - 40 && off === null; x += 20)
      if (bare(document.elementFromPoint(x, y)) && bare(document.elementFromPoint(x / s, y / s))) off = { x, y };
  return { tp: matchMedia(${JSON.stringify(TOUCH_PRIMARY)}).matches, framed: document.documentElement.classList.contains(${JSON.stringify(DESK_FRAME)}), off };
})()`;

const DRIVE: Record<Kind, (ctx: SuiteContext, p: Point) => Promise<void>> = {
  swipe: async (ctx, p) => {
    await ctx.send("Input.synthesizeScrollGesture", { x: p.x, y: p.y, yDistance: -500, gestureSourceType: "touch", speed: 2000 });
  },
  drag: async (ctx, p) => {
    await ctx.touch("touchStart", [{ x: p.x, y: p.y, id: 0 }]);
    for (let i = 1; i <= 10; i++) await ctx.touch("touchMove", [{ x: p.x, y: Math.round(p.y - ((p.y - 2) * i) / 10), id: 0 }]);
    await ctx.touch("touchEnd", []);
  },
  wheel: async (ctx, p) => {
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y });
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: p.x, y: p.y, deltaX: 0, deltaY: 500 });
    await ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  },
};

async function scrolled(ctx: SuiteContext): Promise<number> {
  let last = -1;
  for (let i = 0; i < 60; i++) {
    const y = await ctx.evaluate(SCROLL_Y);
    if (y >= FOOT && y === last) return y;
    last = y;
    await ctx.sleep(50);
  }
  return last;
}

async function reading(ctx: SuiteContext, page: string, kind: Kind | "on", hidden: boolean): Promise<Row> {
  await open(ctx, page, PHONE.w, PHONE.h, PHONE.laidOut, "EAP");
  const env = await ctx.evaluate(ENV);
  const at = kind === "on" ? { x: 422, y: 300 } : env.off;
  if (at === null) return { ...env, page, kind, hidden, y: null };
  if (hidden) await ctx.evaluate(HIDE);
  await DRIVE[kind === "on" ? "swipe" : kind](ctx, at);
  return { ...env, page, kind, hidden, y: await scrolled(ctx) };
}

export async function eaProbe(ctx: SuiteContext): Promise<void> {
  await ctx.setMobileViewport(PHONE.w, PHONE.h);
  await ctx.evaluate(forgetChartTouch);
  const rows: Row[] = [];
  for (const page of CHART_ROOM_FLOOR) for (const kind of KINDS) rows.push(await reading(ctx, page, kind, false));
  rows.push(await reading(ctx, "/explorer/", "on", false));
  for (const kind of KINDS) rows.push(await reading(ctx, "/explorer/", kind, true));
  ctx.check("EAP Issue #778 plan revision 2's probe, throwaway: which instruments scroll a framed phone page on this browser", true, JSON.stringify(rows));
}
```

**`e2e/suites/stage.ts`** (on the throwaway branch only): import `eaProbe` from `./stage/probe.ts`, and directly after the line `await step("EA5", () => ea5Lift(ctx));` add `await step("EAP", () => eaProbe(ctx));`.

**How it runs** (the implementer, in its own tree, one command per call):

1. With commit 12 pushed on `feat/778-desk-frame`: `git switch -c probe/778-pr2-scroll`; write the two edits above; `npm run build`; `VELLUM_E2E_SUITES=stage npm run test:e2e`, letting it finish. Copy the `PASS  EAP` line's detail (the JSON after the separator the runner prints between a check's name and its detail) into `778-pr2-r2-probe-local.json` in the scratchpad. EA7 and EA8 may pass or fail here; only the EAP line is read. If no EAP line printed, fix the probe file's own error (a typo against the code above is the builder's to fix) and run again.
2. `git add` the two files; commit `#778 Throwaway probe: which instruments scroll a framed phone page (never merged)`; `git push -u origin probe/778-pr2-scroll`.
3. `gh workflow run ci.yml --repo ahl-gram/Vellum --ref probe/778-pr2-scroll`; then `gh run list --repo ahl-gram/Vellum --workflow ci.yml --branch probe/778-pr2-scroll --json databaseId,status --limit 1` for the run id, repeated every 10 seconds until it lists a run (a run not listed within 3 minutes is a stop); wait for lane B (`gh run view <id> --repo ahl-gram/Vellum --json jobs`) to complete; `gh run view --repo ahl-gram/Vellum --job <lane B job id> --log` into a scratch file; copy the EAP line's JSON into `778-pr2-r2-probe-ci.json`. A lane B that never prints an EAP line (a launch failure) is re-dispatched once; a second miss is a stop.
4. `git switch feat/778-desk-frame`; `git push origin --delete probe/778-pr2-scroll`; `git branch -D probe/778-pr2-scroll`. Nothing else deletes a `probe/` branch.
5. Post the readings on PR #896 with `gh pr comment 896 --body-file <scratch file>`, the file reading exactly:

````
**Issue #778 plan revision 2's probe (relayed by the implementing lane): which instruments scroll a framed 844x390 phone page.** Throwaway branch `probe/778-pr2-scroll` at `<probe commit sha>`, deleted after. Each row: a chart room opened fresh, `tp` whether `(hover: none) and (pointer: coarse)` matched, `framed`, `off` the bare point off the sheet, `kind` the instrument (`on` is the first build's swipe on the Explorer's sheet at 422,300), `hidden` whether the root's `overflow-y` was held at `hidden`, `y` the `scrollY` it came to (294 is the frame's foot). Chosen for EA7 by the plan's table: `<KIND or "none, handed back">`.

Local (the harness browser):
```json
<778-pr2-r2-probe-local.json>
```

CI (linux headless Google Chrome, run <run id>, lane B):
```json
<778-pr2-r2-probe-ci.json>
```
````

### The decision (no choice is left to the builder)

Read both files. For each `kind` in the order `swipe`, `drag`, `wheel`, the kind QUALIFIES when, in BOTH files:

- for every one of the eight pages of `CHART_ROOM_FLOOR`, its row with that `kind` and `hidden: false` has `framed: true`, `off` not null and `y >= 294`; and
- the `/explorer/` row with that `kind` and `hidden: true` has `y === 0`.

`<KIND>` is the first kind that qualifies. If none does, stop and hand back with both files and the comment's link. `tp` decides nothing; it is recorded for the guards row.

### Files (commit 13)

**`e2e/suites/stage/frame.ts`**:

- Imports: `import { forgetChartTouch } from "../../support/chart-touch.ts";` (drop `browserPinch`, which nothing else here uses); `import type { Payload, Point, SuiteContext } from "../../types.ts";`.
- Delete the comment line that begins "// Points of the 844x390 screen on every room's sheet" and the two constants under it, `SWIPE_AT` and `PINCH_AT`. In their place:

  ```ts
  const OFF_SHEET: Payload<Point | null> = `(() => {
    const stage = document.querySelector("body.chart-room .stage");
    const frame = document.querySelector("[style*='--reserve-top']");
    const bare = (el) => el !== null && el.closest("#map-viewport") === null && (el === stage || el === frame || el === document.body || el === document.documentElement);
    const s = visualViewport.scale;
    const w = Math.floor(innerWidth * s), h = Math.floor(innerHeight * s);
    for (let y = h - 40; y >= 40; y -= 20)
      for (let x = 40; x <= w - 40; x += 20)
        if (bare(document.elementFromPoint(x, y)) && bare(document.elementFromPoint(x / s, y / s))) return { x, y };
    return null;
  })()`;
  const HELD_SCALE = 2;
  const HOLD_SCALE: Payload<boolean> = `(() => {
    Object.defineProperty(window.visualViewport, "scale", { configurable: true, get: () => ${HELD_SCALE} });
    return window.visualViewport.scale === ${HELD_SCALE};
  })()`;
  ```

- One instrument function, the one `<KIND>` names, and no other, directly above `relaid`:
  - `swipe`: `async function swipeFrom(ctx: SuiteContext, p: Point): Promise<void>` whose body is the probe's `DRIVE.swipe` body.
  - `drag`: `async function dragFrom(ctx: SuiteContext, p: Point): Promise<void>` whose body is the probe's `DRIVE.drag` body.
  - `wheel`: `async function wheelFrom(ctx: SuiteContext, p: Point): Promise<void>` whose body is the probe's `DRIVE.wheel` body.
- `relaid`: after `const before = await ctx.evaluate(SEATS);`, replace the `ctx.send("Input.synthesizeScrollGesture", ...)` call with:

  ```ts
  const off = await ctx.evaluate(OFF_SHEET);
  if (off === null) throw new Error(`EA7 ${page}: no bare point off the sheet to scroll from`);
  await <swipeFrom | dragFrom | wheelFrom>(ctx, off);
  ```

  and in the `makeSettle` call that follows, the predicate becomes `(y, last) => y >= DESK_FRAME_H - PHONE.laidOut.h && last === y` and the label `` `EA7 ${page} a <swipe | swipe | scroll> off the sheet reaches the frame's foot` `` (`swipe` for the kinds `swipe` and `drag`, `scroll` for `wheel`). The rest of `relaid` is unchanged.
- `ea7Scrolled`: unchanged except the check's name, exactly:
  - for `swipe` or `drag`: "EA7 on a phone held sideways, a reader's swipe off the sheet scrolls every chart room to the foot of its desk frame, and the room laid out again there seats its sheet, its slip and its Press exactly where the same room laid out again unscrolled seats them: every vertical read is in page coordinates (Issue #778)"
  - for `wheel`: "EA7 on a phone held sideways, a reader's wheel off the sheet scrolls every chart room to the foot of its desk frame (chosen over the harness's touch instruments by Issue #778's plan revision 2 probe), and the room laid out again there seats its sheet, its slip and its Press exactly where the same room laid out again unscrolled seats them: every vertical read is in page coordinates (Issue #778)"
- `ea8Pinched` is renamed `ea8Zoomed` and its body becomes exactly:

  ```ts
  export async function ea8Zoomed(ctx: SuiteContext): Promise<void> {
    await ctx.setMobileViewport(PHONE.w, PHONE.h);
    await open(ctx, "/explorer/", PHONE.w, PHONE.h, PHONE.laidOut, "EA8");
    const before = await ctx.evaluate(SEATS);
    const held = await ctx.evaluate(HOLD_SCALE);
    await ctx.evaluate('(window.visualViewport.dispatchEvent(new Event("resize")), window.dispatchEvent(new Event("resize")), true)');
    await rest(ctx, PHONE.laidOut.w, PHONE.laidOut.h, "EA8 relaid");
    const after = await ctx.evaluate(SEATS);
    await ctx.send("Page.navigate", { url: "about:blank" });
    const faults = seatFaults("/explorer/", before, after);
    ctx.check(
      "EA8 a page that reads zoomed past full size after its room bound, and the room laid out again then, leave the desk frame standing: whether the page was set small is read once, as the room binds (the check holds visualViewport.scale at 2 itself, since no pinch the harness sends zooms the page on CI's browser, PR #893) (Issue #778)",
      held && after.framed && !after.under && faults.length === 0,
      `scale held ${held}; framed ${after.framed}, floored ${after.under}; ${faults.length ? faults.join("; ") : "seats unmoved"}`,
    );
  }
  ```

**`e2e/suites/stage.ts`**: the import and the call `ea8Pinched` become `ea8Zoomed` (two lines). Nothing else.

**`handbook/errata/guards.md`**, `## Open`, after the Gate 2 row Part A adds: the row below, written only when LIST is not empty. LIST is every instrument with a row in the local file at `y >= 294` and the same page's row in the CI file below 294 (both `hidden: false`; a null `y` counts as below), each named by this vocabulary and, where not all eight rooms, followed by "in" and its pages: `on` "a synthesized touch swipe on the Explorer's sheet with the press off", `swipe` "a synthesized touch swipe off the sheet", `drag` "a dispatched one-finger drag off the sheet", `wheel` "a mouse wheel off the sheet". TP is "(hover: none) and (pointer: coarse) matched" when every CI row has `tp: true`, else "(hover: none) and (pointer: coarse) did not match in <the pages whose CI rows read tp false>". One line:

```
- PR #896 (2026-10-15, high): on CI's browser (linux headless Google Chrome), under the harness's 844x390 phone emulation in a chart room on the desk frame, <LIST> left the page unscrolled where the local browser scrolled it to the frame's foot, and <TP> (Issue #778's plan revision 2 probe: CI run <run id>, PR #896 comment <probe comment link>), so in that run no CI check could drive those; EA7 scrolls with <the chosen kind's vocabulary phrase>, and a reader's swipe on a phone is item 2 of PR #896's phone pass. Searched: this directory for "synthesizeScrollGesture", "swipe" and "CI's browser", and the open issues for "swipe": none but Issue #778.
```

**`handbook/specs/settle-doctrine.md`**, doctrine edit 14, "The environment": a new bullet directly after the bullet that begins "- **The headless window has a minimum width clamp.**" (it ends "a window size does not set the layout viewport.") and before the bullet that begins "- **A run deletes its own browser profile only if it is allowed to finish.**", this text with its slots filled and then rewrapped (two-space continuation, no line over 103 characters, the bracket marks removed), exactly (the bracketed clause written only when LIST is not empty, LIST and the slots as for the guards row above; `<CHECKS>` is "EA8" when `<KIND>` is `swipe`, else "EA7 and EA8"):

```
- **CI's browser does not move the page under some of the harness's page gestures.** On the CI
  runner (linux headless Google Chrome) `Input.synthesizePinchGesture` reaches the page with both
  fingers and drives a chart camera that listens, but never zooms the page, where the local harness
  browser does (PR #893's proof run 38494617110, and PR #896's CI run 38696092886)[, and under
  `setMobileViewport` in a chart room on the desk frame <LIST> left the page unscrolled where the
  local harness browser scrolled it (Issue #778's plan revision 2 probe, CI run <run id>)]. A check
  that needs the page zoomed or scrolled on CI reaches that state another way and says why at the
  check (`vellum-footguns` Gate 2 item 14), as `e2e/suites/stage/frame.ts` does for <CHECKS>.
```

### Tests

No new check is written and none is written red first: EA7 and EA8 keep their claims (EA8's reworded to name its instrument), and the bite of each is the proof rows' (Part C; Calls made 46). Commit 13 is verified by the local stage run, then CI.

## Part C: the proof rows

After commit 13's CI run shows EA7 and EA8 passing in lane B, resend every row but R15 and R16 (which BITES in run 38695757940), from the same mutation definitions the lane built (`778-pr2-mutations.json`, `778-pr2-raw.json` and `778-pr2-mkraw.mjs` in the scratchpad, rebuilt against the pushed head), with these expected reds:

| row | expected reds |
|---|---|
| R1 | stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R2 | unit `test/site/page-box.test.ts` (UF4); stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R3 | stage EA1, EA6, EA7, EA8, EA9; cluster DN10 |
| R4 | stage EA6 |
| R5 to R9 | stage EA7 |
| R10 | stage EA7, EA9 |
| R11 | stage EA9 |
| R12, R13 | stage EA6 |
| R14 | stage EA8 |
| R17 | unit `test/site/page-box.test.ts` (UF4); stage NS1, NA4, EA2, EL2, EA4 |
| R18 | stage EA1, EA6 |

R4's and R17's lists are measured for every check but EA7 and EA8, which the red control masked in run 38695757940; the rule below covers either. A row that reads IMPRECISE (its reds differ from the list either way) is resent once with its measured reds as the list (workflow step 11), except that R5 to R10 must red EA7 and R14 must red EA8: either missing is a stop. A HOLE, or a NEEDS READ whose stderr stanza shows the claim's own read threw, is a stop. The PR body's guard table names the ledger run.

## Part D: the record

### The PR body (PR #896 is open; edit it with `gh pr edit 896 --body-file <scratch file>` after commit 13's CI run and the proof resend, reading the current body first)

- The "**Plans.**" paragraph's first sentence becomes: "**Plans.** Built from `handbook/plans/778/778-pr2-plan.md` (frozen) and two revisions: `handbook/plans/778/778-pr2-r1-plan.md`, written after the first build's hand-back (two of the first plan's stop conditions fired in the stage suite), and `handbook/plans/778/778-pr2-r2-plan.md`, written after the second (doctrine edit 12 did not fit the footgun hook's note, and EA7 and EA8 never reached their assertions on CI's browser). What the first revision changed:"
- Its item 4 becomes: "4. The trap is written down in `handbook/specs/cascade-traps.md` and corrected in `handbook/specs/ui-design.md` (doctrine edits 10 and 11), and the gate candidate held for it is promoted to Gate 3 item 7 of `vellum-footguns` by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), its held line kept with a dated line beneath (doctrine edits 12 and 13, as the second revision rewrote them)."
- The paragraph that begins "**Pending a ruling: doctrine edits 12 and 13 of the revision are NOT in this diff.**" is replaced by "What the second revision changed:" and this plan's section "What this revision changes", `<KIND>` and `<PROBE-COMMENT>` filled.
- The paragraph that begins "Also in this diff: errata edits 5 to 9" gains, before its closing period: ", and the `handbook/errata/guards.md` rows the second revision adds (Gate 2 has no room for a new line" and, when the CI row was written, "; what CI's browser cannot drive under the harness's phone emulation", then ")".
- The guard table's last row becomes: "| EA1, EA6, EA7, EA8, EA9, DN10 and the rest | the mutation rows R1 to R18 of the r1 plan, R4's and R17's expected reds as the second revision corrects them | <the resent run's ledger link>: <each row's verdict>; R15 and R16 BITES in run 38695757940 |".
- Under `## Ran`: the unit line's count and head, and the stage line's local count, are re-read from the runs at commit 13; the `MEASURED_SECONDS` line becomes "`MEASURED_SECONDS` for `stage` and `cluster` in `test/e2e/lane-timings.test.ts` is re-measured after the first green CI run at the head carrying the second revision's EA7 and EA8 (commit 14)".
- Under `## Records`: the plan skeptic's line gains ", and on revision r2 before it was built"; the guard prover's line becomes "vellum-guard-prover: one round at `93027fd6` (PR #896 comment 6186639847); guards changed or added after its one round, proven by this session only: UF3's row with a negative scroll, UF4's row a pixel under 1, and the `withStyledBoot` test's two new arms (commit `a9b31191`); EA7 (its new instrument and readiness) and EA8 (its held scale), re-instrumented in commit 13, proven by the resent proof rows (R5 to R10, R14) on the CI proof runner"; the plate reader's line becomes "vellum-plate-reader: one round at `93027fd6` (PR #896 comment 6186641372); presentation fixes after its round: none; the Print Room upright reads 2 px left and 3.9 px wider than the desktop, which matches by size and sign the open PR #777 row in `handbook/errata/site.md` (the Print Room's fit depends on how many layout passes it has had), not reproduced further; the step 6 sitting that ruled the frame from stills is the 2026-10-13 and 2026-10-14 sittings on the issue"; the PR skeptic's line is written after its round as revision 1's process says.
- Under `## Rulings`: the first line gains " and <the follow-up comment's link> (calls 13, 24, 26 and 31 revised, 32 to 50 new)"; the second becomes "open decisions still Alex's: none; the second revision's one open decision, where the reduced-motion warning line goes, was ruled with its calls before him: https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927".

### The follow-up comment on Issue #778 (after commit 13 is pushed, before the PR body edit and before the cold skeptic; `gh issue comment 778 --body-file <scratch file>`)

```
**Where doctrine edits 12 and 13 landed, and what changed in EA7 and EA8, 2026-10-15, by the implementing lane**, as https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6186345332 promised. The plan was revised a second time: `handbook/plans/778/778-pr2-r2-plan.md`, committed in <commit 12's short sha>. The gate line is Gate 3 item 7 of `.claude/skills/vellum-footguns/SKILL.md`, not Gate 2 item 16, by Alex's ruling (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927), and the held line stays word for word with a dated line beneath it. EA8 holds the page's scale itself, and EA7 scrolls by <KIND> off the sheet, chosen by the probe on PR #896 (<probe comment link>). The calls below revise calls 13, 24, 26 and 31 of that comment and add 32 to 50; none was ruled on in the issue except where they say so.

<calls 13, 24, 26 and 31 as revised, and 32 to 50, copied from the plan's "Calls made" exactly>
```

## Order of commits and steps

1 to 11: built and pushed (`5d2ffb7d`, `0d17e013`, `be559669`, `37decab6`, `9a823bb5`, `acddad8a` the r1 plan with EA1 and EA6 red, `5759ffaf` the frame's `transition: none` with doctrine edits 10 and 11, `1e25b3dc` doctrine edits 1 to 4, `d1f495c1` errata edits 5 to 8, `93027fd6` errata edit 9, `a9b31191` the prover's four holes closed). Not rewritten, not amended.

The build resumes in the tree that holds `feat/778-desk-frame` (today the implementer's `/Users/ahl/CodeProjects/Vellum/.claude/worktrees/agent-a19b63eadc8576ae8`; which tree a resumed lane stands in is the dispatcher's, `handbook/specs/orchestration.md`).

12. `handbook/plans/778/778-pr2-r2-plan.md`, doctrine edits 12 and 13, and the Gate 2 row in `handbook/errata/guards.md`. Subject: `#778 Gate 3 item 7: the reduced-motion start value, promoted from the held lines (doctrine edits 12 and 13, plan revision 2)`. Verify (below) before committing. Push.
- The probe (Part B), on its throwaway branch, then its PR comment.
13. `e2e/suites/stage/frame.ts`, `e2e/suites/stage.ts`, doctrine edit 14 in `handbook/specs/settle-doctrine.md` and, when written, the CI row in `handbook/errata/guards.md`. Subject: `#778 e2e: EA7 scrolls by <KIND> off the sheet, EA8 holds the page's scale itself (plan revision 2)`. Local: `npm run build`, then `VELLUM_E2E_SUITES=stage npm run test:e2e`, every check green. Push. CI: lane B green with EA7 and EA8 passing.
- The proof resend (Part C), the follow-up issue comment, Issue #868's comment if not yet posted (revision 1), the PR body edit.
14. `MEASURED_SECONDS`, as revision 1's commit 10 wrote it, from the first green CI run at commit 13's head. Push.
- Then `vellum-pr-skeptic`, cold, on PR #896.

Commit before every dispatch of a review agent and before every mutation loop.

## Verification

Commit 12, one command per call: `node .claude/skills/vellum-footguns/hooks/footgun-gate.selftest.ts` exits 0 with no `FAIL` line and prints exactly `ok   a new stylesheet: the pasted note carries ## Gate 4, ## Gate 3 in 4194 of 8000 characters`, `ok   a new page: the pasted note carries ## Gate 4, ## Gate 3 in 4214 of 8000 characters` and `ok   a new e2e suite that clicks and escapes: the pasted note carries ## Gate 4, ## Gate 2, for wiring only, double the backslash in 7942 of 8000 characters`; the README's "Cost" one-liner prints `Gate 3 2822` and `Gate 2 6121`; `npm run check`, `npm run lint`, `npm test` green; `git diff HEAD~1 --stat` after the commit names exactly `.claude/skills/vellum-footguns/SKILL.md` (+5), `.claude/skills/vellum-footguns/references/held-lines.md` (+3), `handbook/errata/guards.md` (+1) and `handbook/plans/778/778-pr2-r2-plan.md`; no em-dash (U+2014) in any added line.

Commit 13: `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`), `npm run build`, `VELLUM_E2E_SUITES=stage npm run test:e2e` all green locally; CI green.

## Calls made (revision 1's 1 to 12, 14 to 23, 25 and 27 to 30 stand; these replace 13, 24, 26 and 31 and add 32 to 50; 32 and 34 rest on Alex's ruling D1, https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927)

13. **EA7 scrolls by the probe's chosen instrument at a bare point off each room's sheet, then dispatches a resize event to lay the room out, and takes its baseline the same way unscrolled** (revised by revision 2; revision 1 swiped on the sheet). Rule: Gate 2 items 1 and 14; a metrics change under phone emulation would change the window the read compares against; workflow step 10, a comparison's baseline is the control; calls 40 to 42.
24. **EA8 holds `visualViewport.scale` at 2 itself** (revised by revision 2; revision 1 kept the browser pinch). Rule: call 39.
26. **The trap is written into `handbook/specs/cascade-traps.md` as one bullet, `ui-design.md`'s "zeroes every animation delay and duration" is corrected, and the gate candidate held for it is promoted to Gate 3 item 7, its held line kept word for word with a dated "Noted" line beneath** (revised by revision 2; revision 1 promoted it to Gate 2 item 16 and deleted the held line). Rule: `conventions.md`, Where a rule lives (a slow-changing normative constraint is a spec; an imperative keyed to the moment of typing is a gate; a corrected fact edits its owning spec as readily as a changed rule); `held-lines.md`'s own exit for that line ("Earns its line when a check or a measured placement is shown to have read a start value under reduced motion"), which the Specimen's first layout on a 0px body is, and its "How a line leaves". The gate line points at the spec for the reason; the spec bullet states the trap, this instance and the two in code (`placeLegendRow`, `layRow`) and points at Issue #868 for the rest, legislating no general fix while that issue's choice is open.
31. **Doctrine edits 10 and 11 landed in commit 7 with the declaration they describe; edits 12 and 13 land in commit 12; `styled-boot.ts`'s header, in commit 6, cites `handbook/specs/cascade-traps.md` one commit before its bullet exists** (revised by revision 2). Rule: the record of a fix lands with the fix where it can; the gate line could not land in commit 7 without redding `npm test`; every path resolves at every commit, and the pull request squash-merges.
32. **Gate 3 is the gate line's home (Alex's ruling, not a call), and it reaches the CSS author, the moment this defect was typed, and neither the author of a measuring script under `src/site/` nor a check writer.** Rule: Alex's ruling on D1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927); the grounds the menu put to him: `handbook/specs/cascade-traps.md` names Gate 3 the checklist form of its lines, and the trap's spec bullet is that file's (doctrine edit 10); `EDIT_GATES` in `.claude/skills/vellum-footguns/hooks/gate-routes.ts` pastes Gate 3 on `.css` and `.astro` edits and gates no edit under `src/site/`; Gate 2's note for a new e2e suite stands at 7942 of the 8,000 characters of Issue #708's ruling D (measured 2026-10-15). Issue #708's lane sent its item 15 to Gate 3 item 3 when Gate 2 had no room, but there that issue's own body had named Gate 3 as the alternative home, which is why here the choice is Alex's. The check writer's general rule is Gate 2 item 12 ("Measure the instant you mean"), beside the cascade-traps bullet and EA1 and EA6.
33. **Gate 3 item 7 is one sentence and cites one incident; it keeps one clause of mechanism, the condition under which the render it asks for can show the trap, and leaves the reason to the spec; it prescribes a render, not a declaration.** Rule: Issue #708 ruling D ("one-sentence new gate lines") and its follow-up call that a new gate line carries one incident number (comment 5961975440); Gate 3's lead (the reasons live in the spec), with item 3 already carrying a clause of its own reason; a render with no condition can come back clean (revision 1: 4 and 6 of 8 rooms met a resolved style unforced); Issue #868 holds the general fix as an open design choice.
34. **The held line stays word for word, its section's lead sentence unedited, with a dated "Noted 2026-10-15, promoted:" paragraph beneath it.** Rule: the file's own form (its Gate 1 section's two "Noted 2026-10-02, promoted:" lines, and the Provenance paragraph's definition of a "Noted" line), and Issue #708's call that promoted lines "stay word for word with a dated "Noted" line beneath, the file's own form" (comment 5961114576).
35. **This revision is archived as `handbook/plans/778/778-pr2-r2-plan.md` in commit 12, and the PR body names its difference.** Rule: workflow step 8.
36. **Commit 12 owes no red-first test and no guard-prover round.** Rule: it adds no guard and changes no behaviour; the hook's selftest under `npm test` is the existing check on both files, and it is what caught revision 1's line.
37. **Gate 2's lack of room is a `handbook/errata/guards.md` row, not a decision of this pull request.** Rule: Gate 5 item 7 (a finding not fixed is filed or rowed); the bound works as Issue #708 ruling D designed it, and how Gate 2 regains room (the Issue #782-style split, a trim, or the bound) is Alex's, raised when a line needs it.
38. **The lane's "pending a ruling" lines (its comment 6186345332 and PR #896's body) are replaced by pointers to Alex's ruling on D1 (https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927).** Rule: workflow step 12 (the lane's comment points at the dispatcher's post of Alex's ruling; the old comment is never edited, and a correction is a new comment that says what it supersedes), so the issue's old comment stands and the follow-up comment says where the edits landed.
39. **EA8 holds `visualViewport.scale` at 2 itself (an own accessor on `window.visualViewport`), not a browser pinch and not `Emulation.setPageScaleFactor`, and says so in its name.** Rule: measured, no pinch the harness sends zooms the page on CI's browser (PR #893's proof run 38494617110; run 38696092886: ZG6 at scale 1, EA8 at 0.82421875); Gate 2 item 14 (where the window is unreachable by a naturally written check, reach it deliberately and say why at the check); `Emulation.setPageScaleFactor` is as artificial, unmeasured on CI, and may outlive the page into EA2 to EA5. The real pinch is phone pass item 4.
40. **EA7's instrument is chosen by a probe on both browsers, in the order the browser's synthesized swipe, a dispatched one-finger drag, a mouse wheel, each off the sheet and each required to leave a root held at `overflow-y: hidden` unscrolled; with none qualifying, the lane hands back, and EA7 is never rebuilt on `window.scrollTo`.** Rule: Gate 2 item 1 (a gesture check drives the gesture, the reader's own first; a stand-in states its reason at the check); R10 (the root's `overflow-y: auto` deleted) is EA7's reach read, and a programmatic scroll moves a root held at `hidden`, so it would leave R10 to EA9's computed style alone; the dispatcher's brief (do not weaken a check to make it pass; a real choice is Alex's).
41. **The probe runs on a throwaway branch, `probe/778-pr2-scroll`, locally and through CI's `workflow_dispatch`, its readings posted as a PR #896 comment and the branch deleted after.** Rule: the dispatcher's brief (a throwaway CI run, the plan fixing which reading selects which branch); `.github/workflows/ci.yml` runs every lane on `workflow_dispatch`; settle-doctrine, a claim carried by a control in the same run (the hidden rows).
42. **The bare point is the lowest point on a 20-pixel grid inside the screen (844 by 390 sideways) that is bare both as layout pixels and as screen pixels, bare meaning the stage, its frame element, the body or the root, outside `#map-viewport`; EA7's readiness accepts `scrollY` at or past 294.** Rule: Gate 2 item 4 (sample the thing's own rect, never a fixed offset); `handbook/specs/settle-doctrine.md` measures only a touch's space (layout pixels from the visual viewport's origin), so a synthesized swipe's and a wheel's are aimed where either reading lands bare, as revision 1 aimed 422,300 on the sheet either way; lowest, so a swipe or drag has room to travel up; the root's maximum may sit a pixel past 294 (the plate reader's "scrollY 294 of a root max of 295"), and the claim is the foot reached.
43. **R4's expected reds become EA6 and R17's the unit UF4 with NS1, NA4, EA2, EL2 and EA4, as proof run 38695757940 measured them for every check but EA7 and EA8 (masked there by the red control); R5 to R10 must red EA7 and R14 must red EA8, or the lane stops.** Rule: workflow step 11 (a red not named is IMPRECISE and resent with it named; BITES only on the exact set); revision 1 derived R4's EA1 and EA8 and R17's single EA2 from the code, not from a run; EA8 compares two reads taken under the same mutation, so it cannot see R4; a row resent to drop its own check's purpose would hide a hole.
44. **What CI's browser cannot drive under the phone emulation becomes a `handbook/errata/guards.md` row, filled from the probe.** Rule: Gate 5 item 7; the readings are the evidence, and the next author of a phone check should not rediscover them.
45. **The plate reader's Print Room difference changes nothing here.** Rule: it matches by size and sign the open PR #777 row in `handbook/errata/site.md` (the fit depends on the number of layout passes; the sheet grows about 3.9px), and `handbook/errata/README.md` makes a second row for one defect a defect; it is named in the PR body's Records as that row's.
46. **EA7 and EA8 are re-instrumented with no red-first step; their bite is the resent proof rows (R5 to R10 for EA7, R14 for EA8).** Rule: workflow step 8's failing test first binds new behaviour; these checks keep their claims, and step 11's proof rows are how this pull request proves its e2e guards.
47. **`ea8Pinched` is renamed `ea8Zoomed`.** Rule: one name, one thing (`handbook/specs/ui-design.md`, the voice); it no longer pinches.
48. **What CI's browser does with a page gesture is written into `handbook/specs/settle-doctrine.md`, "The environment" (doctrine edit 14), beside the guards row.** Rule: `CLAUDE.md`'s spec table gives settle-doctrine what the harness environment actually does; revision 1 built EA8 on a pinch PR #893 had already measured never to zoom the page on CI, a fact then written only in check names and a plan archive; `handbook/errata/README.md` makes the ledger "not required reading", so the guards row alone would not reach the next planner.
49. **EA8 dispatches a resize on `window.visualViewport` as well as on the window.** Rule: Gate 1 item 6 (guard the class): a real pinch fires the visual viewport's own resize, so a re-read wired there is the same defect as R14's, and the only listener there today, the desk notice's fit, sets a property `SEATS` never reads.
50. **The wheel, wherever it is used, ends with the mouse moved back to 1,1.** Rule: the stage suite's own practice after every mouse gesture (`fold` and `lifted` in `e2e/suites/stage/stage.ts`), since a hovered Press lifts during a layout (EA5, the cold review of PR #777).

## Open decisions

None. D1 (where the reduced-motion warning line goes) was ruled A, the styling checklist, Gate 3 item 7, by Alex on 2026-10-15: https://github.com/ahl-gram/Vellum/issues/778#issuecomment-6190448927. Untouched by this revision and Alex's whenever a line needs them: the hook's 8,000-character bound (Issue #708 ruling D) and how Gate 2 regains room. If no reader's instrument scrolls the page on both browsers, the lane hands back and that goes to Alex; EA7 is not weakened by the lane.

## Stop conditions for this revision (hand back rather than adapt; revision 1's stand for everything else except its swipe-and-pinch line)

- The branch's head is not `a9b31191` when commit 12 starts, or `origin/main` has moved on any file revision 1 or this revision names (`git diff --stat c968619e origin/main -- <paths>` prints a change).
- Issue #778 has more than the 15 comments recorded, other than a `Plan archive, not a ruling:` copy; or PR #896 carries a comment beyond the two recorded that is not the lane's own record (the probe readings, the proof ledger).
- `.claude/skills/vellum-footguns/SKILL.md` or `.claude/skills/vellum-footguns/references/held-lines.md` differs from `HEAD` before commit 12. If a file's difference is exactly revision 1's superseded edit (`cmp` the working file against `778-pr2-SKILL-edited.md` or `778-pr2-held-lines-edited.md`: identical), restore it with `git checkout -- <path>`; any other difference is a stop.
- Gate 3 on the branch does not end with item 6's line "   dressing-level pins lag one live cycle." followed by a blank line and "## Gate 4: before adding anything that joins a roster", or the held line's bullet is not followed directly by the `Page.captureScreenshot` bullet.
- Commit 12's verification prints any `FAIL`, any of its three selftest lines differs, or the one-liner does not print `Gate 3 2822`.
- The probe: no kind qualifies; a page's row has `framed: false` in either file; lane B prints no EAP line twice.
- Commit 13: EA7 or EA8 reds locally or in CI, or any other unmutated check reds; EA8's detail reads `scale held false`.
- Part C: R5 to R10 do not red EA7, or R14 does not red EA8; any HOLE; any NEEDS READ whose stderr stanza shows the claim's own read threw.
- `npm run check`, `npm run lint`, `npm run format:check` or `npm test` reds at commit 12 or 13; `npm run format` rewrites `e2e/suites/stage/frame.ts` beyond line layout; a function there passes 50 lint lines.
