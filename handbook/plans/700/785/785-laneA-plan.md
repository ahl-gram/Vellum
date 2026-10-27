# Issue #785, pull request 6 (`785-laneA`): lane A's blind pauses become waits, and Z13's `held` reads the camera's depth

- **Planned at**: `origin/main` 36e67efeab1f29d4aa2348202d504024d6a27c9f (`git ls-remote origin refs/heads/main`, 2026-10-26), the merge of PR #1077 (Issue #1074). Issue #785 read with 39 comments (`gh api repos/ahl-gram/Vellum/issues/785/comments --paginate --jq length`), the newest 6407993113. The sleep sort below was run at e46fbe1b; `git diff --stat e46fbe1b 36e67efe` names only `.claude/skills/vellum-footguns/SKILL.md`, `handbook/plans/1074/1074-plan.md`, `handbook/specs/settle-doctrine.md` and `handbook/specs/site-architecture.md`, so no file under `e2e/`, `src/` or `test/` moved and every line cited here stands.
- **Rulings this plan builds to**: D1 to D6 (https://github.com/ahl-gram/Vellum/issues/785#issuecomment-6399616640: D3 B, every conversion waits through the shared helper; D4 A, one pull request per lane; D1 A, the lint lands last, so the PACE and justified SAMPLE pauses are not touched here); `goHome` waits for nothing (6403948960, the precedent for a deletion); the clause 5 exception covers exactly two waits (6404969181, 6405486755), so no third `STILL_ONLY` reason is added; the re-timing duty is removed (6407764430, 6407800857), so `MEASURED_SECONDS` is not edited and no CI run is started for it; rows 3 and 5 left this issue (Issues #1075, #1076); **the thin plan** (6407993113): no plan skeptic, no menu, and a problem the implementer finds in this plan is not handed back but solved by the least change that keeps every ruling, recorded in the pull request body and a dated issue comment. The `held()` depth finding (6401735323, item 1) is this row's (6407800857).
- **Archive path**: `handbook/plans/785/785-laneA-plan.md`. **Branch**: `chore/785-lane-a`. **Title**: `#785 Lane A's blind pauses become waits, and Z13's held reads the camera's depth (pull request 6)`.
- **Open decisions**: none.

## Specs

On top of what `CLAUDE.md`'s table owes for the work:

- `handbook/specs/settle-doctrine.md`: clause 3 (`makeStable`, the read written as an object, the wait built in the module that calls it), clause 4 (a readiness wait throws, a `step` catches it), clause 5 (the departure, the animation form, the exception closed at two waits), clause 6 (the predicate never carries the claim), clause 8 (`waitSettled` resolves on the draw before), clause 14; the environment bullet "A sleep past an animation's nominal duration still lands mid-animation"; "When a check is pulled out of the run", the bullets "What a step costs" and "Who finds a slow step".
- `handbook/plans/785/785-kits-plan.md`: "The helper", and "How the lane pull requests use it, without a redesign" with its paragraph opening "What it is not for" (a transition is never `animated`; a poll for an action's start stays a `makeSettle` predicate).
- `handbook/specs/check-placement.md`: "The unit suite"; "The browser lanes and a plate read" (the two readings).
- `handbook/specs/conventions.md`: "How code is cited" and the comment rules (one long line, only where no test pins it).
- `handbook/errata/README.md`: "How a row leaves".
- `.claude/skills/vellum-footguns/SKILL.md`: Gate 1 before the tests, Gate 2 before the waits, Gate 5 at the push.

## Recon and the count (2026-10-26)

`vellum-spec-recon` ran on the row's cited paths: every lane A appendix line of `handbook/plans/785/785-plan.md` still holds its `sleep(` at main except `zoom/resets.ts:6`, `:25`, `:110`, now `:7`, `:26`, `:111` (STALE, cosmetic); the PR #645 row is `handbook/errata/guards.md:239`, in `## Ruled and left` (the plan said 241; line 238 is a different PR #645 row and is not touched); `held` in `e2e/suites/zoom/resets.ts:145` compares the hash's `cx`, `cy`, `k` and the camera's `fx`, `fy`, and the camera's depth `sk` is read only at `:225` (`z13b.sk === 4`), CURRENT. No open pull request touches a lane A file. `e2e/suites/zoom/camera.ts` is also named by Issue #1068 (Z25), a different function.

The sort was re-run at e46fbe1b with the 785 plan's own script and hand table, the hand rows remapped for the lines PRs #1071 to #1073 moved (`out/785-laneA/sleep-sort.ts`, `out/785-laneA/sleep-sort-hand.tsv`, log `out/785-laneA/sleep-sort-e46f.err`; copied to the main checkout's `out/785-laneA/` when the tree is retired): 405 calls in 110 files; lane A holds 82 POLL, 7 PACE, 17 SAMPLE, **29 BLIND**. The three SAMPLE the 785 plan converts are `turn.ts:104`, `turn.ts:133`, `zoom/region.ts:174`. The other 14 SAMPLE and the 7 PACE are row 12's (the lint) and are not touched.

## The design

Every pause falls into one of four mechanisms, and the mechanism decides its form (calls 1 to 4):

1. **The effect is already in place when the call before the pause returns, by JavaScript's own ordering**: an `element.click()` inside the same `evaluate`, or an effect made in the same task as the state the previous wait saw. The pause waits for nothing and is **deleted** (the `goHome` ruling's form). A pause after a CDP input is never deleted on this ground, since only CDP's acknowledgement would order it.
2. **The effect follows a CDP input** (a wheel, a pinch, a drag, a tap, a click). A counter of that input's events, armed on the page immediately before the input, is the departure: the counter's capture listener and the page's own handler run in one event dispatch, so a read that sees the count risen sees the handler's work. Then stillness.
3. **The effect starts later, and the check needs it started** (a turn under way, a region job in flight): a `makeSettle` predicate on the started state, not `makeStable` (the 785-kits plan: a poll for an action's start is not a wait to rest).
4. **A motion to its end before a read or a shot**: the place card's roll is an animation, waited on with `animated: "#place-card .pc-inner"` plus a departure read off a snapshot taken before the action (the `pinCard` shape); the verso flip and the inset's fade are CSS transitions, which leave `getAnimations()` when they end, so they are waited on by a departure on their end state; a smooth scroll is waited on by its outcome either way across painted frames (P26, P27).

### The table

Line numbers are main's at 36e67efe. "Step" names the step a converted call now runs in where it ran outside every step (the lint `vellum/e2e-throw-inside-step` requires it of a throwing wait); "stepped" means it already runs in one.

| site | check | becomes | why (source) | label | step |
|---|---|---|---|---|---|
| `cards/cap.ts:152` | P26 | `scrollAfter` (below): the card's scroll or the camera's depth moved, or `QUIET_FRAMES` frames painted with neither, then equal across a painted frame | the card's wheel listener is passive (`cardShell` in `src/site/shared/living-chart/place-overlay-card.ts`), so the browser scrolls it natively, possibly smoothly | `P26 the wheel's outcome at rest` | stepped (`P20 to P27`) |
| `cards/cap.ts:162` | P26 | deleted | `i.scrollTop = 0` is synchronous, no sheet sets `scroll-behavior: smooth` (`git grep -n scroll-behavior -- src/styles` finds only the reduced-motion `auto`), and nothing listens to the card's scroll (`git grep -n '"scroll"' -- src/site/shared/living-chart src/site/explorer` finds none) | | |
| `cards/cap.ts:127` | P27 | `scrollAfter`, as P26 | as P26; PageDown on the focused card | `P27 PageDown's outcome at rest` | stepped |
| `cards/cap.ts:135` | P27 | deleted | as `:162` | | |
| `cards/cap.ts:269` | P24 | wheel counter, then stillness | d3-zoom's wheel handler zooms inside its own dispatch | `P24 the wheel handled` | stepped (`P24`) |
| `cards/glass.ts:115` | (shot) | `animated` on the card's roll, departure `rolledFrom(before)` | the card was hidden by the Escape `run` dispatches before `pCardShot`, so the focus shows it and starts a fresh roll | `P card shot: the card unfurled` | new `P card shot` |
| `cards/overlay.ts:115` | P5b (shot) | `animated` on the card's roll, departure `rolledFrom(before)` | the focus in the P5b read showed the card unpinned; the click pins it and replays the roll in one call (`showPlaceCard`) | `P5b the seat's card unfurled` | new `P4, P5, P5b, P5c` |
| `cards/hold-tablet.ts:30` | P30 | the pause **stays as PACE** (the next town's tap is two taps from this one, the job `:25` does), and a click witness then guards the read | the tap's click is the last event it delivers (`TAPLOG` already records it) | `P30 the text tap on <name>'s card handled` | stepped (`P30`) |
| `glass-ceremony.ts:157` | G2c | the hash's `k` written at 1.4, then stillness | the camera's settle writes the hash 250 ms after the glide stops | `G2c the settle writes the hash at 1.4` | new `G2c` |
| `hunt/zoomed.ts:65` | HG2 | click counter, then stillness | the hunt's `onClick` (`src/site/seed-of-the-day/app-hunt.ts`) drops the sounding and writes the status inside the click; the dot lives 2.6 s (`soundingFade 2600ms`) | `HG2 the miss tap handled` | new `HG2, HG3` |
| `hunt/zoomed.ts:96` | HG4 | click counter, then stillness | `win(true)` runs inside the click | `HG4 the guess tap handled` | new `HG4` |
| `motion.ts:68` | D3 | the sheet marked before the input is replaced by the quiet redraw, then stillness; `waitSettled` stays after it | `landInPlace` (`src/site/explorer/app.ts`) sets `mapDiv.innerHTML`, a new `svg`; without the mark `waitSettled` resolves on the draw before (clause 8) | `D3 the quiet redraw replaced the sheet` | stepped (`D3`) |
| `turn.ts:104` | T3 | `makeSettle` on `.sheet.turning` present | the turn starts only once the new style's draw lands (`landDraw`); T6 and V5 already poll for it | `T3 the ink turn under way` | stepped (`T3, T4`) |
| `turn.ts:133` | T5 | as T3 | as T3 | `T5 the nautical turn under way` | stepped (`T5`) |
| `verso.ts:74` | V1 | deleted | `toggleFlip` adds `.flip3d` and `.versoed`, and the handler writes the label, inside the `click()` that the evaluate before the pause runs; the verso's content was built at the draw (`rebuildVerso`); `#verso`'s visibility follows `.flip3d` with no transition | | |
| `verso.ts:110` | (shot) | `FLIP` until the flip has landed: `.versoed`, no transition left on `#sheet-inner`, its matrix past edge-on | `.sheet-inner` rotates by a CSS transition (`src/styles/explorer/index.css`), which leaves `getAnimations()` when it ends | `V1 the flip to the verso landed` | new `V1, V1b, V1c` |
| `verso.ts:118` | V2 | deleted | under a flipped sheet `landDraw` takes `landInPlace` and then `rebuildVerso` in one task, so the recto's seed attribute the kit's wait saw arrives with the rebuilt verso | | |
| `verso.ts:173` | V4b | deleted | `flipToRecto`'s `settle()` removes `.flip3d` last, and every field V4b reads follows it or was set before it | | |
| `zoom-gestures.ts:69`, `:80` | ZG1, ZG1b | wheel counter, then stillness | as P24 | `ZG1 the wheel handled`, `ZG1b the wheel handled` | new `ZG1, ZG1b` |
| `zoom-gestures.ts:103` | ZG2 | deleted | `scrollIntoView` with no smooth `scroll-behavior` anywhere is instant | | |
| `zoom-gestures.ts:109` | ZG2 | gesture-end counter (`pointerup`, `pointercancel`, `mouseup`), then stillness | d3-zoom applies a pinch in its own move handler; pointer and mouse events arrive both where CI's browser turns a touch into mouse events and where it does not, and a pointer listener adds no touch handler to a block that warns against changing touch routing | `ZG2 the pinch handled` | stepped |
| `zoom-gestures.ts:120` | ZG3 | as ZG2 | as ZG2 | `ZG3 the drag handled` | stepped |
| `zoom/bands.ts:70` | Z20e | deleted | `commitInset` (`src/site/explorer/lod-controller.ts`) rebuilds the overlay, the pinned card by name, and the glass's wrapper republishes `--zoom-k` (`glassLod` in `src/site/explorer/glass.ts`), all before `redrafts++`, the count `waitRedraft` waited on | | |
| `zoom/camera.ts:92` | Z6 (shot) | `animated` on the card's roll, departure `rolledFrom(before)` | the card is hidden before Z6's click | `Z6 the pinned card unfurled` | new `Z6` |
| `zoom/camera.ts:126` | Z8 (shot) | as Z6 | Z6's Escape hid it | `Z8 the pinned card unfurled` | new `Z8` |
| `zoom/region.ts:118` | Z17 (shot) | `crossfadeLanded`: one inset, its opacity 1, then stillness | `.region-inset` fades in by a CSS transition (`opacity var(--fade, 200ms)`) | `Z17 the inset's crossfade landed` | new `Z17` |
| `zoom/region.ts:124` | (shot) | the hash's `k` at 1.35 and no region drafting, then stillness | the settle fires 250 ms after `enterAt`, writing the hash and making the region decision in one tick | `Z17 the camera's settle at k=1.35` | in `Z17` |
| `zoom/region.ts:174` | Z19b | `makeSettle` on the drafting caption with `redrafts` unchanged | `dispatchRegion` writes "Drafting the finer survey…" when it sends the job | `Z19b the region job in flight` | new `Z19b` |
| `zoom/resets.ts:7` | Z5 | `FLIP` until the flip has landed | as V1's shot | `Z5 the flip to the verso landed` | new `Z5` |
| `zoom/resets.ts:26` | Z5 (tail) | `FLIP` until the flip back has torn the 3D context down | `flipToRecto` removes `.flip3d` when the leaf lands | `Z5 the flip back to the recto landed` | in `Z5` |
| `zoom/resets.ts:111` | Z13 | deleted | `keepDraw` clears the status and `landInPlace` applies the deep link's camera (`applyCamera` is `zoomTo`, instant) in one task, so `waitSettled` cannot see the status clear before the camera | | |

That is 29 BLIND and 3 SAMPLE: 8 deleted, 23 become waits, and one (`hold-tablet.ts:30`) keeps its pause as PACE with a witness added (call 5). The four PR #645 sleeps (`camera.ts:92`, `:126`, `overlay.ts:115`, `glass.ts:115`) all convert, so its row leaves (call 13).

### `held` and the camera's depth

`held` gains `Math.abs(r.sk - 4) < FRAMING_EPS &&`, so the way back, the fold and the unfold hold the camera's depth as the resize already did; `z13b.sk === 4` stays as it is (call 12).

### Rejected

- **A `scrollend` counter for P26 and P27**: no suite uses `scrollend`, no browser reading at planning can show it fires here, and for P26 a camera that took the wheel would time out instead of failing P26's own line.
- **A departure on the scroll alone for P27** (`scrollTop` moved): it is the claim (clause 6), and a PageDown that scrolls nothing would time out and take P23 and P25 down with it, since P27 runs inside `p26TailScrolls` in `P20 to P27`. The page's own scroll is no second outcome either: at 1440x300 the chart room's root is `overflow-y: hidden` (`src/styles/shared/atelier.css`; the desk frame applies only below scale 1).
- **Deleting the pauses after a CDP wheel, pinch, drag or tap**: only CDP's acknowledgement would order the handler before the read, and nothing at planning measures it.
- **The P30 pause deleted after its witness**: Chrome's double-tap and d3's `touchDelay` windows were measured by nobody here, and `:25` already keeps such a gap for the same reason.
- **A third `STILL_ONLY` reason anywhere**: closed by the ruling (6404969181) and the brief.
- **Each payload written in every file that reads it**: the card roll is read in three files and the flip in two; one module keeps one copy.

## Files

Every path from the repo root. Run `npm run format` before each commit.

### `e2e/support/witness.ts` (new)

```ts
import type { Payload } from "../types.ts";

export type CardRoll = { shown: boolean; pinned: boolean; card: [number, number, number, number] | null };
export const CARD_CARRIER = "#place-card .pc-inner";
export const CARD_ROLL: Payload<CardRoll> = `(() => { const c = document.getElementById("place-card"); const i = c && c.querySelector(".pc-inner"); const b = i ? i.getBoundingClientRect() : null; return { shown: !!c && !c.hidden, pinned: !!c && c.classList.contains("pinned"), card: b && [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)) }; })()`;
export const rolledFrom =
  (before: CardRoll) =>
  (d: CardRoll): boolean =>
    !before.shown ? d.shown : !before.pinned ? d.pinned : JSON.stringify(d.card) !== JSON.stringify(before.card);

export type Flip = { versoed: boolean; flip3d: boolean; m11: number; running: number };
export const FLIP: Payload<Flip> = `(() => { const s = document.getElementById("sheet"); const i = document.getElementById("sheet-inner"); return { versoed: s.classList.contains("versoed"), flip3d: s.classList.contains("flip3d"), m11: new DOMMatrix(getComputedStyle(i).transform).m11, running: i.getAnimations().length }; })()`;
export const flipLanded = (d: Flip): boolean => d.versoed && d.running === 0 && d.m11 < 0;
export const flippedBack = (d: Flip): boolean => !d.versoed && !d.flip3d;

export function countEvents(types: readonly string[]): { arm: Payload<boolean>; seen: string } {
  const key = `__seen_${types.join("_")}`;
  return {
    arm: `(()=>{if(window.${key}===undefined){for(const t of ${JSON.stringify(types)})addEventListener(t,()=>{window.${key}++;},{capture:true,passive:true});}window.${key}=0;return true;})()`,
    seen: `window.${key}`,
  };
}
```

No comment is written in it: the tests below pin each function.

### `e2e/suites/cards/cap.ts`

Imports: `import { makeSettle, makeStable } from "../../support/settle.ts";`, `import { countEvents } from "../../support/witness.ts";`, and `Payload` beside `Point, SuiteContext` in the types import. New, after the imports (exported for the unit tests):

```ts
export type Scrolled = { scrollTop: number; k: number; frame: number };
export const COUNT_FRAMES: Payload<boolean> = `(()=>{window.__capFrame=0;const tick=()=>{if(window.__capFrame<0)return;window.__capFrame++;requestAnimationFrame(tick);};requestAnimationFrame(tick);return true;})()`;
export const STOP_FRAMES = `window.__capFrame = -1`;
export const SCROLLED: Payload<Scrolled> = `(() => ({ scrollTop: +document.querySelector("#place-card .pc-inner").scrollTop.toFixed(2), k: window.__vellumZoomState().k, frame: window.__capFrame }))()`;
// 2026-10-26, unmeasured at planning: a smooth scroll moves on the first frame it paints, so ten painted frames with nothing moved is an input that scrolled nothing, five times the two a started scroll needs to show.
export const QUIET_FRAMES = 10;
export const scrollRested = (d: Scrolled, last: Scrolled): boolean =>
  d.scrollTop === last.scrollTop && d.k === last.k && d.frame > last.frame;
export const scrollOutcome =
  (from: Scrolled) =>
  (d: Scrolled): boolean =>
    d.scrollTop !== from.scrollTop || d.k !== from.k || d.frame >= QUIET_FRAMES;
const WHEELS = countEvents(["wheel"]);
export const WHEELED: Payload<{ wheels: number; k: number }> = `(() => ({ wheels: ${WHEELS.seen}, k: window.__vellumZoomState().k }))()`;

async function scrollAfter(
  { evaluate, sleep }: Pick<SuiteContext, "evaluate" | "sleep">,
  input: () => Promise<unknown>,
  label: string,
): Promise<Scrolled> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  await evaluate(COUNT_FRAMES);
  try {
    const from = await evaluate(SCROLLED);
    await input();
    return await stable(SCROLLED, label, { departed: scrollOutcome(from), same: scrollRested });
  } finally {
    await evaluate(STOP_FRAMES);
  }
}
```

- `p27PageDown`: the two `Input.dispatchKeyEvent` sends move into the `input` arrow; `await sleep(400);` and the `kbAfter` evaluate become `const kbAfter = await scrollAfter({ evaluate, sleep }, async () => { <the two sends, unchanged> }, "P27 PageDown's outcome at rest");`. The check reads `kbAfter.scrollTop` where it read `kbAfter`, and its detail is `JSON.stringify({ ...kb, afterPageDown: kbAfter.scrollTop })`. `await sleep(200);` after the reset at `:134` is deleted. The PageDown comment at `:112` stays.
- `p26TailScrolls`: `await wheel(onCard.x, onCard.y, 240); await sleep(600);` and the `afterWheel` evaluate become `const afterWheel = await scrollAfter({ evaluate, sleep }, () => wheel(onCard.x, onCard.y, 240), "P26 the wheel's outcome at rest");` (after the PACE `await sleep(120);`, which stays). The check reads `afterWheel.scrollTop` and `afterWheel.k` as now. `await sleep(200);` after the reset at `:161` is deleted.
- `p24NothingToScroll`: `const stable = makeStable(settle);` first in its body; between the PACE `await sleep(120);` (stays) and the wheel, `await evaluate(WHEELS.arm);`; `await sleep(600);` and the `after` evaluate become `const after = (await stable(WHEELED, "P24 the wheel handled", { departed: (d) => d.wheels > 0 })).k;`.

### `e2e/suites/cards/glass.ts`

Imports `makeSettle`, `makeStable` from `../../support/settle.ts` and `CARD_CARRIER`, `CARD_ROLL`, `rolledFrom` from `../../support/witness.ts`. `pCardShot` becomes:

```ts
export async function pCardShot({ evaluate, shoot, sleep }: SuiteContext, pm: Manifest): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  const before = await evaluate(CARD_ROLL);
  await evaluate(<the focus payload, unchanged>);
  await stable(CARD_ROLL, "P card shot: the card unfurled", { animated: CARD_CARRIER, departed: rolledFrom(before) });
  await shoot("explorer-place-card.png");
  await evaluate(<the Escape payload, unchanged>);
}
```

### `e2e/suites/cards/overlay.ts`

Same imports. In `p5bRealmSeat`, `const stable = makeStable(makeSettle({ evaluate, sleep }));` first in the `if` block's body; just before the click evaluate, `const before = await evaluate(CARD_ROLL);`; `await sleep(500);` becomes `await stable(CARD_ROLL, "P5b the seat's card unfurled", { animated: CARD_CARRIER, departed: rolledFrom(before) });`. The comment at `:113` stays (it says why the shot needs the roll ended).

### `e2e/suites/cards.ts`

- `pOverlayReads(ctx, pm)` becomes `pOverlayReads(ctx, step, pm)` with the signature `(ctx: SuiteContext, step: ReturnType<typeof makeStep>, pm: Awaited<ReturnType<typeof pManifest>>)`; inside, `await p4Capital(ctx, pm);` becomes `await step("P4, P5, P5b, P5c", () => p4Capital(ctx, pm));`.
- `await pCardShot(ctx, pm);` becomes `await step("P card shot", () => pCardShot(ctx, pm));` (the house's form for a step with no check of its own: "P setup", "P restore").

### `e2e/suites/cards/hold-tablet.ts`

Imports `makeStable` from `../../support/settle.ts`. New, after `TAPLOG` (exported for the unit test):

```ts
export const TAPPED: Payload<{ clicked: boolean; shown: boolean; rest: boolean }> = `(() => { const c = document.getElementById("place-card"); const a = c && !c.hidden ? c.querySelector(".pc-inner").getAnimations() : []; return { clicked: (window.__p30 || []).some((e) => e.startsWith("click@")), shown: !!c && !c.hidden, rest: a.length > 0 && a.every((x) => x.playState === "finished") }; })()`;
```

In `p30Tablet`: `const stable = makeStable(k.settle);` first in its body. `await k.sleep(650);` at `:30` stays; the lines from it to `const kept` become:

```ts
    // The next town's tap is two taps from this one as well, so it keeps the same gap.
    await k.sleep(650);
    await stable(TAPPED, `P30 the text tap on ${m.name}'s card handled`, {
      departed: (d) => d.clicked && (!d.shown || d.rest),
    });
    const kept = await k.card();
```

### `e2e/suites/glass-ceremony.ts`

Imports `makeSettle`, `makeStable` from `../support/settle.ts` and `type Payload` from `../types.ts`. New (exported for the unit test):

```ts
export const HASH: Payload<{ cx: string | null; cy: string | null; k: string | null }> = `(()=>{const p=new URLSearchParams(location.hash.slice(1));return{cx:p.get("cx"),cy:p.get("cy"),k:p.get("k")};})()`;
```

`g2cKeys` is exported; `const stable = makeStable(makeSettle({ evaluate, sleep }));` first in its body; `await sleep(400); // let the settle debounce ...` becomes `await stable(HASH, "G2c the settle writes the hash at 1.4", { departed: (d) => Number(d.k) === 1.4 });`. In `run`, `await g2cKeys(k);` becomes `await step("G2c", () => g2cKeys(k));`.

### `e2e/suites/hunt.ts` and `e2e/suites/hunt/zoomed.ts`

`hunt.ts`: `import { makeStep } from "../support/step.ts";`; `const step = makeStep(ctx);` after `const k = huntKit(ctx);`; `await hg2Taps(k, tgt);` becomes `await step("HG2, HG3", () => hg2Taps(k, tgt));`, `await hg4Solves(k, tgt);` becomes `await step("HG4", () => hg4Solves(k, tgt));`.

`hunt/zoomed.ts`: imports `makeSettle`, `makeStable` from `../../support/settle.ts`, `countEvents` from `../../support/witness.ts`, and `type Payload` beside `SuiteContext`. New (exported for the unit tests):

```ts
const CLICKS = countEvents(["click"]);
export const HG2_READ: Payload<{ clicks: number; dots: number; inSvg: boolean; solved: boolean; status: string }> = `(()=>({clicks:${CLICKS.seen},dots:document.querySelectorAll("#map .sounding-dot").length,inSvg:!!document.querySelector("#map svg .sounding-dot"),solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent}))()`;
export const HG4_READ: Payload<{ clicks: number; solved: boolean; status: string; star: boolean }> = `(()=>({clicks:${CLICKS.seen},solved:document.getElementById("map").classList.contains("solved"),status:document.getElementById("hunt-status").textContent,star:!!document.querySelector("#map .hunt-star")}))()`;
```

`hg2Taps`: `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `await evaluate(CLICKS.arm);` immediately before `await mouseTap(fr.px, fr.py);`; `await sleep(80);` and the `hg2` evaluate become `const hg2 = await stable(HG2_READ, "HG2 the miss tap handled", { departed: (d) => d.clicks > 0 });`. HG3's block, with its SAMPLE `await sleep(100);`, is not touched. `hg4Solves`: the same, with `await evaluate(CLICKS.arm);` immediately before its `mouseTap` (after HG3's drag, so the click d3 suppresses there is never counted), and `const hg4 = await stable(HG4_READ, "HG4 the guess tap handled", { departed: (d) => d.clicks > 0 });` in place of `await sleep(120);` and the `hg4` evaluate. The checks read `hg2` and `hg4` as now (the extra `clicks` field rides in their detail).

### `e2e/suites/motion.ts`

Imports `makeSettle`, `makeStable` from `../support/settle.ts` and `type Payload` beside `SuiteContext`. New (exported for the unit test):

```ts
export const MARK_SHEET: Payload<boolean> = `(()=>{document.querySelector("#map svg").__d3Old=true;return true;})()`;
export const NEW_SHEET: Payload<{ fresh: boolean }> = `(()=>{const s=document.querySelector("#map svg");return{fresh:!!s&&!s.__d3Old};})()`;
```

`d3DragQuiet` is exported; `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `await evaluate(MARK_SHEET);` before the `input` dispatch; `await sleep(220); // cross the ...` becomes `await stable(NEW_SHEET, "D3 the quiet redraw replaced the sheet", { departed: (d) => d.fresh });`. `await waitSettled("draft-drag-input");` stays.

### `e2e/suites/turn.ts`

Imports `makeSettle` from `../support/settle.ts` and `type Payload` beside `SuiteContext`. New (exported):

```ts
export const TURNING: Payload<{ turning: boolean }> = `(()=>({turning:!!document.querySelector(".sheet.turning")}))()`;
```

`t3InterruptTurn` and `t5SettleSupersedes` are exported; each gets `const settle = makeSettle({ evaluate, sleep });` first. `await sleep(300); // the ink turn is now mid-rotation` becomes `await settle(TURNING, (d) => d.turning, "T3 the ink turn under way");`; `await sleep(250); // the nautical turn is mid-flight` becomes `await settle(TURNING, (d) => d.turning, "T5 the nautical turn under way");`. The SAMPLE windows `:109` and `:136` stay.

### `e2e/suites/verso.ts`

Imports `makeSettle`, `makeStable` from `../support/settle.ts` and `FLIP`, `flipLanded` from `../support/witness.ts`. `type VersoKit` becomes `export type VersoKit`; `versoKit`, `v1FlipsToVerso`, `v2RedrawWhileFlipped` and `v4bFlipBack` are exported.

- `v1FlipsToVerso`: `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `await sleep(80);` deleted; `await sleep(1300); // let the 1.2s flip land before the screenshot` becomes `await stable(FLIP, "V1 the flip to the verso landed", { departed: flipLanded });`.
- `v2RedrawWhileFlipped`: `await sleep(60);` deleted, `sleep` dropped from its parameter list.
- `v4bFlipBack`: `await sleep(60);` deleted, `sleep` dropped from its parameter list.
- `run`: `await v1FlipsToVerso(k, vTitle);` becomes `await step("V1, V1b, V1c", () => v1FlipsToVerso(k, vTitle));`; the comment at `:11` loses its words "is outside every step and", being false, and reads:

```ts
  // null, never "": V1b below reads this, and `docket.includes("")` is TRUE, so an empty hoist would let a skipped "V setup" pass V1b's title clause vacuously.
```

### `e2e/suites/zoom-gestures.ts`

Imports `makeSettle`, `makeStable` from `../support/settle.ts`, `countEvents` from `../support/witness.ts`, and `type Payload` beside `SuiteContext`. New (exported):

```ts
const WHEELS = countEvents(["wheel"]);
export const WHEELED: Payload<{ wheels: number; k: number; x: number; y: number }> = `(()=>{const s=window.__vellumZoomState();return{wheels:${WHEELS.seen},k:s.k,x:s.x,y:s.y};})()`;
const ENDS = countEvents(["pointerup", "pointercancel", "mouseup"]);
export const ENDED: Payload<{ ends: number; k: number; x: number; y: number }> = `(()=>{const s=window.__vellumZoomState();return{ends:${ENDS.seen},k:s.k,x:s.x,y:s.y};})()`;
```

- `zg1WheelZooms` (exported): `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; before each `wheel`, `await evaluate(WHEELS.arm);`; `await sleep(80); const zg1 = await state();` becomes `const zg1 = await stable(WHEELED, "ZG1 the wheel handled", { departed: (d) => d.wheels > 0 });`, and likewise `zg1b` with `"ZG1b the wheel handled"`; `state` leaves its parameter list, no longer read there.
- `zg2TouchGestures` (exported): `const stable = ...` first; `await sleep(60);` after `scrollToMap()` deleted; before `pinch`, `await evaluate(ENDS.arm);`, and `await sleep(100); const zg2 = await state();` becomes `const zg2 = await stable(ENDED, "ZG2 the pinch handled", { departed: (d) => d.ends > 0 });`; before `touchPan`, `await evaluate(ENDS.arm);`, and `await sleep(100); const after = await state();` becomes `const after = await stable(ENDED, "ZG3 the drag handled", { departed: (d) => d.ends > 0 });`. `const before = await state();` stays.
- `run`: the comment at `:21` (`// ZG1 and ZG1b are deliberately not stepped: ...`) is deleted, being false; `await zg1WheelZooms(k);` becomes `await step("ZG1, ZG1b", () => zg1WheelZooms(k));`.

### `e2e/suites/zoom/bands.ts`

`z20eCardSurvives`: `await sleep(80);` deleted, `sleep` dropped from its parameter list.

### `e2e/suites/zoom/camera.ts`

Imports `makeSettle`, `makeStable` from `../../support/settle.ts` and `CARD_CARRIER`, `CARD_ROLL`, `rolledFrom` from `../../support/witness.ts`. In `z6PinnedCard` and `z8CardConstant`: `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `const before = await evaluate(CARD_ROLL);` immediately before the check's own evaluate (which clicks); `await sleep(700); // let the pinned unfurl ...` becomes `await stable(CARD_ROLL, "Z6 the pinned card unfurled", { animated: CARD_CARRIER, departed: rolledFrom(before) });` (in Z8, `"Z8 the pinned card unfurled"`).

### `e2e/suites/zoom/region.ts`

Imports `makeSettle`, `makeStable` from `../../support/settle.ts` and `type Payload` from `../../types.ts` (beside `Cam` where it is imported). New (exported for the unit tests):

```ts
export const INSET_OPAQUE: Payload<{ insets: number; opacity: number }> = `(()=>{const all=document.querySelectorAll("#map .region-inset");const last=all[all.length-1];return{insets:all.length,opacity:last?+getComputedStyle(last).opacity:-1};})()`;
export const SETTLED_AT: Payload<{ k: string | null; drafting: boolean; insets: number; opacity: number }> = `(()=>{const p=new URLSearchParams(location.hash.slice(1));const all=document.querySelectorAll("#map .region-inset");const last=all[all.length-1];return{k:p.get("k"),drafting:/^Drafting/.test(document.getElementById("caption").textContent||""),insets:all.length,opacity:last?+getComputedStyle(last).opacity:-1};})()`;
export const DRAFTING: Payload<{ drafting: boolean; redrafts: number }> = `(()=>({drafting:/^Drafting the finer survey/.test(document.getElementById("caption").textContent||""),redrafts:window.__vellumRegion().redrafts}))()`;

async function crossfadeLanded({ evaluate, sleep }: Pick<ZoomKit, "evaluate" | "sleep">, label: string): Promise<void> {
  const stable = makeStable(makeSettle({ evaluate, sleep }));
  await stable(INSET_OPAQUE, label, { departed: (d) => d.insets === 1 && d.opacity === 1 });
}
```

- `z17Inset` (48 of the lint's 50 lines today): `await sleep(400); // let the crossfade land ...` becomes `await crossfadeLanded({ evaluate, sleep }, "Z17 the inset's crossfade landed");`, one line for one, so its length stands.
- `zInsetContextShot`: `evaluate` joins its parameter list (`{ evaluate, shoot, sleep, enterAt }`); `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `await sleep(600);` becomes `await stable(SETTLED_AT, "Z17 the camera's settle at k=1.35", { departed: (d) => Number(d.k) === 1.35 && !d.drafting });`.
- `z19bSupersession`: `const settle = makeSettle({ evaluate, sleep });` first; `await sleep(350); // past the debounce ...` becomes `await settle(DRAFTING, (d) => d.drafting && d.redrafts === before19b, "Z19b the region job in flight");`. The SAMPLE window `await sleep(1200);` stays.

### `e2e/suites/zoom/resets.ts`

Imports `makeStable` beside `makeSettle`, and `FLIP`, `flipLanded`, `flippedBack` from `../../support/witness.ts`.

- `z5VersoHomes`: `const stable = makeStable(makeSettle({ evaluate, sleep }));` first; `await sleep(1300); // let the 1.2s flip land` becomes `await stable(FLIP, "Z5 the flip to the verso landed", { departed: flipLanded });`; the tail's `await sleep(1300);` becomes `await stable(FLIP, "Z5 the flip back to the recto landed", { departed: flippedBack });`.
- `z13DeepLink`: `await sleep(80);` deleted, `sleep` dropped from its parameter list.
- `held`: `Math.abs(r.sk - 4) < FRAMING_EPS &&` inserted after `r.k === "4.0000" &&`. The comment above `FRAMING_EPS` stays true (the hash writes the depth to the same four places).

### `e2e/suites/zoom.ts`

- `zGeometric(ctx, k)` becomes `zGeometric(step, ctx, k)` with the first parameter `step: ReturnType<typeof makeStep>` (the form `zHold` and `zLoupe` take); inside, `await z6PinnedCard(ctx);` becomes `await step("Z6", () => z6PinnedCard(ctx));` and `await z8CardConstant(ctx);` becomes `await step("Z8", () => z8CardConstant(ctx));`. `run` calls `await zGeometric(step, ctx, k);`.
- `await z5VersoHomes(ctx);` becomes `await step("Z5", () => z5VersoHomes(ctx));`.
- `await z17Inset(k); await zInsetContextShot(k);` become `await step("Z17", async () => { await z17Inset(k); await zInsetContextShot(k); });`.
- `await z19bSupersession(k);` becomes `await step("Z19b", () => z19bSupersession(k));`.
- The comment at `:93` is not edited: it stays true of the geometric checks still unstepped (PR 1's call 8).

### `test-support/recording-ctx.ts` (new) and `test/e2e/rest-waits.test.ts`

`recording`, `count`, `lastOf` and the types `Said`, `Checked` move from `test/e2e/rest-waits.test.ts` into `test-support/recording-ctx.ts`, exported, with two additions: `Said["kind"]` gains `"shoot"` (the ctx's `shoot` pushes `{ kind: "shoot", what: file }`) and `recording` returns `slept: number[]` (the ctx's `sleep(ms)` pushes `ms`). `rest-waits.test.ts` imports them and deletes its local copies; its existing tests do not change. `refitFlow` takes `walksAt: "resize" | "back" | "fold" | "unfold" | null` and `moved: { fx: number } | { fy: number } | { sk: number }`: the unfold branch (the `.slip-tab").click()` count above 0) spreads `walk("unfold")`, the fold branch `walk("fold")`, the overridden branch `walk("resize")`, and the last branch spreads `walk("back")` only when a clear was sent.

### Test files (new)

`test/e2e/witness.test.ts`, `test/e2e/card-waits.test.ts`, `test/e2e/sheet-waits.test.ts`, `test/e2e/gesture-waits.test.ts`, each in the form `rest-waits.test.ts` uses: a recording ctx whose `evaluate` answers by comparing the expression with the exported payload (`expression === X` for a plain read, `expression.includes(X)` for a `stable` read under `animated`, whose wrapper embeds the read verbatim and answers `{ read, anims }`), and the kit members a function destructures stubbed on the ctx. An expression a fake does not recognise is answered `{}`, as `rest-waits.test.ts` answers one, so today's code reds on an assertion and not on a missing field; a read whose string field a check calls a method on (V1's and V2's `docket`) is answered with a full object that passes its check. Each file stays under the lint's 400 lines.

### `handbook/errata/guards.md`

Delete line 239, exactly the row beginning `- PR #645 (2026-09-20): Four shipped fixed sleeps (suite-zoom 700ms twice, suite-cards 500ms twice)`. Line 238 stays.

## Tests, in the order they are written

All are written in commit 1 against today's code and a stub of `e2e/support/witness.ts` with the right shapes and the wrong behaviour (`rolledFrom = () => () => true`, `flipLanded = () => true`, `flippedBack = () => true`, `countEvents = () => ({ arm: "true", seen: "0" })`, the two payloads as written), with the `export` keywords and the payload constants the tests import added to today's suite files (shape only: every pause still in place). Each red is on an assertion: `Missing expected rejection`, `deepStrictEqual`, `strictEqual`. Labels match exactly as written above.

| # | file | name | asserts | mutation that reds it |
|---|---|---|---|---|
| W1 | witness | "rolledFrom departs a hidden card when it shows, a shown one when it pins, and a pinned one only when its box moves" | six cases: hidden to shown true, hidden to hidden false, unpinned to pinned true, unpinned to unpinned with the box moved false, pinned to a moved box true, pinned to the same box false | M1 `!before.shown ? d.shown` made `!before.shown ? true`; M2 `!before.pinned ? d.pinned` made `!before.pinned ? d.shown`; M3 the box's `!==` made `===` |
| W2 | witness | "flipLanded holds only once the flip's transition has gone and the leaf is past edge-on, and flippedBack only once the 3D context is gone" | landed `{true, true, -1, 0}` true; mid-flight `{true, true, -0.4, 1}` false; just pressed `{true, true, 1, 0}` false; flippedBack `{false, true, ...}` false, `{false, false, ...}` true | M4 `d.running === 0 && ` deleted; M5 ` && d.m11 < 0` deleted; M6 ` && !d.flip3d` deleted |
| W3 | witness | "countEvents counts each event once from its arm, and a second arm zeroes it without a second listener" | run `arm` in `node:vm` over a context that is its own `window` with an `addEventListener` that records; fire two `wheel` events: `seen` reads 2; arm again, fire one: reads 1 | M7 `if(window.${key}===undefined)` deleted |
| C1 | card | "P26 and P27 read each scroll only once the input has moved it and it rests across a painted frame, and stop the frame count" | `p26TailScrolls` on a recording ctx: `SCROLLED` answers per phase (before the first `Input.dispatchKeyEvent` send, then after), read n: n=1 `{0, 1, 0}`, n=2 and 3 `{0, 1, n-1}`, then `{60, 1, n}` (P27's phase `{120, 1, n}`); checked P26 and P27 true; `count(said, STOP_FRAMES)` is 2 | M8 P26's and P27's `departed: scrollOutcome(from)` made `departed: () => true`; M9 the `finally`'s `await evaluate(STOP_FRAMES);` deleted; M10 `return await stable(...)` made `return await evaluate(SCROLLED);` |
| C2 | card | "P27 fails on its own line once QUIET_FRAMES frames are painted with nothing scrolled, and does not time out" | P27's phase answers `{0, 1, n}` for every n; resolves; checked P27 false; the last `SCROLLED` read answered in P27's phase carried a frame of at least `QUIET_FRAMES` | M11 ` \|\| d.frame >= QUIET_FRAMES` deleted |
| C3 | card | "P27 does not take two equal reads with no painted frame between them for rest" | P27's phase: n=1 `{0, 1, 0}`, n=2 and 3 `{0.5, 1, 3}`, then `{120, 1, n}`; checked P27 true | M12 ` && d.frame > last.frame` deleted |
| C4 | card | "P26 and P27 reset the card's scroll and pause for nothing after it" | as C1; `slept.filter((ms) => ms !== 50 && ms !== 120)` is `[]` | M13 `await sleep(200);` put back after either reset |
| C5 | card | "P24 reads the camera only once the wheel has reached the page" | `p24NothingToScroll` on a `CardsKit` stub (`settle: makeSettle(ctx)`, `waitReady` true, `setNarrowViewport` and `wheel` resolving): Kralgov's point `{x: 500, y: 300}`, the pin read `{ name: "Kralgov", pinned: true, scrolls: false, tail: 0, pe: "none", k: 1, x: 500, y: 300, h: 200 }`, `WHEELED` n=1 and 2 `{0, 1}` then `{1, 1.5}`; checked P24 true | M14 `departed: (d) => d.wheels > 0` made `departed: () => true` |
| C6 | card | "P24 times out naming the wheel when it never reaches the page" | `WHEELED` always `{0, 1.5}`; rejects `settle timeout P24 the wheel handled: ` | M15 the `stable(WHEELED, ...)` call made `evaluate(WHEELED)` |
| C7 | card | "P30 times out naming the text tap when its click never lands" | `p30Tablet` on a `holdKit`-shaped stub (`boot` returns the nine `TABLET` marks named `T<idx>`, `atRest` and `card` return T0's card pinned and at rest, `settle: makeSettle(ctx)`); `TAPPED` always `{ clicked: false, shown: true, rest: true }`; rejects `settle timeout P30 the text tap on T0's card handled: ` | M16 the `stable(TAPPED, ...)` line deleted |
| C8 | card | "P5b shoots the seat's card only after reading it pinned with its roll finished" | `p4Capital` with a seat in the manifest; `CARD_ROLL` before `{true, false, box}`; the witnessed reads 1 to 3 `{ read: {true, false, box}, anims: ["finished"] }`, from 4 `{ read: {true, true, box}, anims: ["finished"] }`; exactly 5 witnessed reads precede the `shoot` entry | M17 `, departed: rolledFrom(before)` deleted; M18 the P5b `stable` line deleted |
| C9 | card | "the card shot waits for the card's roll to finish" | `pCardShot`; witnessed anims `["running"]` throughout; rejects `settle timeout P card shot: the card unfurled: ` | M19 the `stable` line deleted |
| C10 | card | "Z6 waits for the pinned card's roll before its shot" | `z6PinnedCard`; `CARD_ROLL` before hidden; anims `["running"]`; rejects `settle timeout Z6 the pinned card unfurled: ` | M20 the `stable` line deleted |
| C11 | card | "Z8 waits for the pinned card's roll before its shot" | as C10 for `z8CardConstant`; rejects `settle timeout Z8 the pinned card unfurled: ` | M21 the `stable` line deleted |
| S1 | sheet | "V1 reads the flip straight after the press and shoots the verso only once the flip has landed" | `v1FlipsToVerso` on a `VersoKit` stub; `FLIP` n=1 and 2 `{true, true, -0.4, 1}` then `{true, true, -1, 0}`; resolves; every `slept` value is 50 | M22 `await sleep(80);` put back |
| S2 | sheet | "V1 times out naming the flip when it never lands" | `FLIP` always `{true, true, -0.4, 1}`; rejects `settle timeout V1 the flip to the verso landed: ` | M23 the `stable(FLIP, ...)` line deleted |
| S3 | sheet | "V2 reads the rebuilt verso as soon as the recto carries the new seed" | `v2RedrawWhileFlipped`, `waitRectoAttr` resolving; `slept` is `[]` | M24 `await sleep(60);` put back |
| S4 | sheet | "V4b reads the recto as soon as the 3D context is gone" | `v4bFlipBack`, `waitFlip3dGone` resolving; `slept` is `[]` | M25 `await sleep(60);` put back |
| S5 | sheet | "Z5 times out naming the flip when it never lands" | `z5VersoHomes`; `FLIP` always mid-flight; rejects `settle timeout Z5 the flip to the verso landed: ` | M26 the first `stable` line deleted |
| S6 | sheet | "Z5 times out naming the flip back when the 3D context is never torn down" | `FLIP` landed until the second `verso-turn").click()`, then `{false, true, -0.2, 1}` throughout; rejects `settle timeout Z5 the flip back to the recto landed: ` | M27 the second `stable` line deleted |
| S7 | sheet | "T3 interrupts the ink turn only once it is under way, and times out naming it when it never starts" | `t3InterruptTurn`; `TURNING` always `{turning: false}`; rejects `settle timeout T3 the ink turn under way: `; no evaluate sent naming `"topographic"` | M28 the `settle(TURNING, ...)` line deleted |
| S8 | sheet | "T5 draws the new world only once the nautical turn is under way, and times out naming it when it never starts" | as S7 for `t5SettleSupersedes`; rejects `settle timeout T5 the nautical turn under way: `; no evaluate sent setting the seed to `"7"` | M29 the line deleted |
| S9 | sheet | "D3 waits for the sheet it marked before the input to be replaced" | `d3DragQuiet`; `NEW_SHEET` answers `fresh: true` only once `MARK_SHEET` was evaluated before the input and two reads have followed the input; `arriving` reads false then true; resolves; checked D3 true; `MARK_SHEET` was evaluated once, before the evaluate that dispatches the `input` event | M30 `await evaluate(MARK_SHEET);` deleted |
| S10 | sheet | "D3 times out naming the quiet redraw when the sheet is never replaced" | `NEW_SHEET` always `{fresh: false}`; rejects `settle timeout D3 the quiet redraw replaced the sheet: ` | M31 the `stable(NEW_SHEET, ...)` line deleted |
| S11 | sheet | "G2c times out naming the hash write when the settle never writes k=1.4" | `g2cKeys` on a `GlassKit` stub (`settleK` returns `{k: 1.4, x: 0, y: 0}`, `settleHome` home); `HASH` always nulls; rejects `settle timeout G2c the settle writes the hash at 1.4: ` | M32 the departure made `() => true`; M33 the `stable(HASH, ...)` line deleted |
| S12 | sheet | "Z13 reads the deep link's camera straight after the boot settles" | `z13DeepLink` with `waitReady`, `waitSettled`, `shoot` and `send` stubbed; `slept` is `[]` | M34 `await sleep(80);` put back |
| G1 | gesture | "ZG1 and ZG1b read the camera only once each wheel has reached the page" | `zg1WheelZooms` on a `GesturesKit` stub, `vpRect` `{L: 0, T: 0, W: 1000, H: 800}`; `WHEELED` per wheel: n=1 and 2 the camera before it (`{0, 1, 0, 0}`, then `{0, 1.2, -60, -80}`), then after it (`{1, 1.2, -60, -80}`, then `{1, 1, 0, 0}`); checked ZG1 and ZG1b true | M35 ZG1's departure made `() => true`; M36 ZG1b's likewise |
| G2 | gesture | "ZG2 and ZG3 read the camera only once each gesture's last event has reached the page, and ZG2 pauses for nothing after its scroll into view" | `zg2TouchGestures`; the tablet read `{1024, 1, true}`; `ENDED` per gesture: n=1 and 2 before (`{0, 1, 0, 0}`, then `{0, 2.43, -500, -300}`), then after (`{1, 2.43, -500, -300}`, then `{1, 2.43, -580, -360}`); `state()` before the drag `{2.43, -500, -300}`; checked ZG2 and ZG3 true; every `slept` value is 50 | M37 ZG2's departure made `() => true`; M38 ZG3's likewise; M39 `await sleep(60);` put back |
| G3 | gesture | "HG2 reads the sounding only once the tap's click has reached the page" | `hg2Taps` on a `HuntKit` stub; `HG2_READ` n=1 and 2 `{0, 0, false, false, ""}` then `{1, 1, false, false, "Cold."}`; HG3's reads equal; checked HG2 true | M40 HG2's departure made `() => true` |
| G4 | gesture | "HG4 times out naming the guess tap when its click never reaches the page" | `hg4Solves`; `HG4_READ` always `clicks: 0`; rejects `settle timeout HG4 the guess tap handled: ` | M41 the `stable(HG4_READ, ...)` line deleted |
| G5 | gesture | "Z17 shoots the inset only once its crossfade has landed" | `z17Inset` on a `ZoomKit` stub (a committed band-1 redraft, an inset view that passes Z17); `INSET_OPAQUE` always `{1, 0.4}`; rejects `settle timeout Z17 the inset's crossfade landed: ` | M42 the `crossfadeLanded` line deleted; M43 ` && d.opacity === 1` deleted |
| G6 | gesture | "the inset context shot waits for the camera's settle at k=1.35" | `zInsetContextShot`; `SETTLED_AT` always `{"2.0000", false, 1, 1}`; rejects `settle timeout Z17 the camera's settle at k=1.35: ` | M44 `Number(d.k) === 1.35 && ` deleted |
| G7 | gesture | "Z19b presses home only once the region job is in flight" | `z19bSupersession`; `DRAFTING` always `{false, 5}`, `rgn` `redrafts: 5`; rejects `settle timeout Z19b the region job in flight: `; `goHome` called once | M45 the `settle(DRAFTING, ...)` line deleted |
| G8 | gesture | "Z20e reads the card straight after the redraft commits" | `z20eCardSurvives`; `slept` is `[]` | M46 `await sleep(80);` put back |
| R1 to R4 | rest-waits | "Z13b reads <b> and Z13c <c> when the camera's depth walks at the <at> while the hash still reads 4.0000" | `refitFlow(at, { sk: 3 })` for (resize, false, true), (back, false, true), (fold, true, false), (unfold, true, false) | M47 `Math.abs(r.sk - 4) < FRAMING_EPS && ` deleted (reds R2, R3, R4; R1 is held by the kept `z13b.sk === 4`) |

**The prover owes** M1 to M47 (unit tests only; Gate 1 item 9). Commit before the round, as "Commit before you mutate" says.

**The browser checks.** Every conversion changes how a browser check waits, and no claim changes except Z13b and Z13c's added depth. **Each browser reading is UNVERIFIABLE at planning: the dispatcher's brief for this plan orders no browser run** (the Mac kept quiet while lanes run their suites one at a time). No check is weakened to make up for it. The implementer's first local run of each suite is the first reading, and the fallbacks below say what follows a reading on the wrong side. No proof-runner row is owed: the claims are the ones today's suites hold, and the new depth clause has no source edit that moves only the depth at a refit to send (call 17).

## Order of commits

Branch `chore/785-lane-a` from `origin/main`. Each commit runs `npm run format` first; each subject ends `(pull request 6)`.

1. `handbook/plans/785/785-laneA-plan.md` (this plan, unchanged); `test-support/recording-ctx.ts` and `rest-waits.test.ts` switched to it (its existing tests green); the `e2e/support/witness.ts` stub; the exports and exported payload constants the tests import, added to the suite files with every pause still in place (the module-private `scrollAfter` and `crossfadeLanded`, and each import of `makeSettle`, `makeStable` and `makeStep`, arrive with the code that uses them in commits 2 to 4, since an unused name reds the lint); the four new test files and R1 to R4. `node --import ./test-support/source-read-guard.ts --test test/e2e/witness.test.ts test/e2e/card-waits.test.ts test/e2e/sheet-waits.test.ts test/e2e/gesture-waits.test.ts test/e2e/rest-waits.test.ts` is predicted, by reading today's code and not by a run, to red W1 to W3, C1 to C11, S1 to S12, G1 to G8 and R2 to R4 on their assertions, with R1 and every pre-existing test passing. A row that comes out green on today's code gains the assertion today's code fails, and the body names it.
2. `e2e/support/witness.ts` real; `cards/cap.ts`, `cards/glass.ts`, `cards/overlay.ts`, `cards/hold-tablet.ts`, `cards.ts`, `zoom/camera.ts`, and `zoom.ts`'s `zGeometric` steps. W and C green.
3. `verso.ts`, `turn.ts`, `motion.ts`, `glass-ceremony.ts`, `zoom/resets.ts` (Z5 and Z13 only), `zoom.ts`'s Z5 step. S green.
4. `zoom-gestures.ts`, `hunt.ts`, `hunt/zoomed.ts`, `zoom/region.ts`, `zoom/bands.ts`, `zoom.ts`'s Z17 and Z19b steps. G green.
5. `zoom/resets.ts`'s `held`. R green.
6. `handbook/errata/guards.md`, the row deleted.

## Rosters and doctrine

- The four test files join `npm test` by their names; none reads a source file, so `SOURCE_READS` (`test-support/source-read-list.ts`) is untouched.
- `e2e/support/witness.ts` holds no wait, so `CTX_THROWING_WAITS` and `test/repo/e2e-tiers.test.ts` are untouched; every `stable` here is built as `const stable = makeStable(...)` in the function that calls it, the form `test/repo/e2e-steps.test.ts`'s plant pins.
- New step names: `P4, P5, P5b, P5c`, `P card shot`, `G2c`, `HG2, HG3`, `HG4`, `V1, V1b, V1c`, `ZG1, ZG1b`, `Z5`, `Z6`, `Z8`, `Z17`, `Z19b`. Only `E2E_SKIPS` would name one, and none is in it.
- Comments: `verso.ts:11` corrected and `zoom-gestures.ts:21` deleted (above); the comments riding on deleted pause lines go with them; `zoom.ts:93` stays.
- No spec, gate or agent line is contradicted: clause 3 already sends a blind sleep to `makeStable`, clause 5's exception is not used, and clause 3's "The stillness predicates written by hand before it stay as they are" holds (none is moved).
- The errata row, as above. `MEASURED_SECONDS` is not edited.
- The scratch hand table (`out/785-laneA/sleep-sort-hand.tsv`, untracked) is what row 12 starts from; `hold-tablet.ts:30` is PACE there now.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`).
- The five test files above, all green.
- `npm run build`, then one at a time, each after `ps aux | grep -c '[r]emote-debugging-port'` reads 0: `VELLUM_E2E_SUITES=<suite> npm run test:e2e` for `motion`, `turn`, `verso`, `zoom`, `zoom-gestures`, `glass-ceremony`, `cards`, `hunt` (lane A's suites this pull request touches, from `E2E_LANES` in `e2e/support/lanes.ts`). Each ALL PASS; the body quotes the PASS lines of P24, P26, P27, P30, P5b, G2c, HG2, HG4, D3, T3, T5, V1, V2, V4b, ZG1, ZG1b, ZG2, ZG3, Z5, Z13, Z13b, Z13c, Z17, Z19b, Z20e.
- The pull request's CI: lane A green.
- **`QUIET_FRAMES`'s dated line is rewritten before the pull request opens**: P26's and P27's detail carries `frame`; take the frame at which each scroll was first read moved, from the local `cards` run and from the pull request's lane A log, and write both readings and the headroom over the worse on that one line in place of "unmeasured at planning" (`CLAUDE.md`, Process, the bullet opening "A bound is derived"). Ten stays unless a reading reaches five, in which case F2 applies.
- **Count and time** (settle-doctrine, "Who finds a slow step"). Steps the pull request can make longer: `P30` (its witness adds about 50 ms to each of nine towns), `P4, P5, P5b, P5c` (P5b's 650 ms pinned roll replaces a 500 ms pause), `T3, T4` and `T5` (the turn's start, after the new style's draw, replaces 300 ms and 250 ms). Every other converted step replaces a pause longer than the motion it waited for. All four are counted thin (call 18). Each one's seconds are read from the pull request's lane A log by "What a step costs", and quoted in the body. P30 read 20.7 s on main (Issue #1068's table) and stays Issue #1068's (call 6). For the other three: a reading under 4 s passes; one from 4 to 20 s gets two more lane A runs started by hand and is judged on the median; a median of 10 s or more goes to fallback F7.
- `vellum-guard-prover` on M1 to M47. `vellum-plate-reader` is not owed: nothing here is an appearance.

## Calls made

1. **A pause is deleted only where JavaScript's own ordering puts the effect before the read**: an `element.click()` in the same evaluate, or an effect in the same task as the state the previous wait saw (V1 `:74`, V2, V4b, Z13, Z20e, ZG2 `:103`, the two `cap.ts` resets). Rule: `goHome`'s ruling (6403948960) for a pause that waits for nothing, and clause 5: what follows only CDP's acknowledgement gets a witness, since nothing at planning measures the acknowledgement.
2. **After a CDP input, an event counter armed immediately before that input is the departure.** Rule: clause 5 (a departure before rest); PR #1071's resize counter is the precedent. Each counter is armed before its own action, never an earlier one, so HG4 never counts the click d3 suppresses after HG3's drag.
3. **P26 and P27 wait for the input's outcome either way across painted frames**: the scroll moved, the camera's depth moved, or `QUIET_FRAMES` frames painted with nothing moved; rest is an equal read across a painted frame. Rule: clause 6 (the departure accepts the failing outcome, so a scroll that never comes fails P26 or P27 on its own line, and P23 and P25 still run); CD2b's frame counter (`chart-drawer/desk.ts`) for a rest a stall cannot fake. `QUIET_FRAMES = 10` is unmeasured at planning, and the implementer rewrites its dated line with the readings (Evidence).
4. **The verso flip and the inset's fade are waited on by their end state, and the card's roll by `animated` with a snapshot departure.** Rule: the 785-kits plan, the paragraph opening "What it is not for" (a transition is never `animated`), and clause 5 (a carrier that may already hold a finished `both` roll names its departure, `pinCard`'s shape, generalised to three starts in `rolledFrom`).
5. **`hold-tablet.ts:30` keeps its 650 ms as PACE, and its read gets the click witness.** Rule: the pause does two jobs, and the double-tap gap before the next town's tap is the job `:25` already keeps; the brief's PACE form is row 12's. Lane A's tally is 28 BLIND converted and one reclassed PACE.
6. **P30's time is printed in the body, and its speed is left to Issue #1068.** Rule: by analogy with Alex's ruling on CD63 (6405486755); this analogy is this planner's call, not a ruling of Alex's on P30.
7. **T3, T5 and Z19b wait on `makeSettle` for the action's start**; Z19b's predicate also asks that `redrafts` has not moved, so it fails if the job already landed. Rule: the 785-kits plan ("A poll for an action's start ... stays a `makeSettle` predicate").
8. **The inset context shot waits for the hash's depth at 1.35 with no region drafting**, and runs in Z17's step. Rule: clause 5 (two equal reads before the 250 ms settle would come before anything moved).
9. **The payloads three or more sites share live in one new module, `e2e/support/witness.ts`.** Rule: one home for a rule (`handbook/specs/conventions.md`); the card's roll is read in three files and the flip in two.
10. **Each throwing wait that ran outside a step gets a step named for its checks**, `P card shot` taking the house's form for a step with no check ("P setup"). Rule: clause 4 and `vellum/e2e-throw-inside-step`.
11. **`zoom.ts:93` is not edited; `verso.ts:11` and `zoom-gestures.ts:21` are.** Rule: a comment stays only while true (PR 1's call 8 for `zoom.ts:93`).
12. **`held` gains `Math.abs(r.sk - 4) < FRAMING_EPS` and `z13b.sk === 4` stays.** Rule: the bound is half the hash's last place, the principle `FRAMING_EPS` already states for `fx` and `fy`, and the hash writes the depth to the same four places; keeping the exact clause weakens nothing at the resize (Gate 1 item 3).
13. **The PR #645 row (`handbook/errata/guards.md:239`) is deleted, and line 238 stays.** Rule: `handbook/errata/README.md`, "Fixed" (a fix deletes its row); the issue body's "the row moves or is rewritten when they go" is met by its leaving, since all four of its sleeps convert here.
14. **The 7 PACE and 14 justified SAMPLE in lane A are not touched.** Rule: D1 A (the lint and its explicit form land last, row 12).
15. **`recording`, `count` and `lastOf` move to `test-support/recording-ctx.ts`.** Rule: five test files share them, and one copy cannot drift.
16. **Functions and payloads the tests call are exported.** Rule: a unit test runs the code (`handbook/specs/check-placement.md`); PR #1071 exported `offMainThread` the same way.
17. **No proof-runner row is sent.** Rule: no claim changes but the depth clause, which has its unit tests, and no source edit moves only the camera's depth at a refit.
18. **Every step that can grow is counted thin.** Rule: settle-doctrine, "Who finds a slow step"; thin errs toward more readings (PR #1071's call 15).
19. **`MEASURED_SECONDS` is not edited and no run is started for timing.** Rule: comment 6407764430.
20. **The branch is `chore/785-lane-a` and the title ends `(pull request 6)`**, as rows 1, 2 and 4 named theirs.

## Open decisions

none

## Stop conditions, as fallbacks

The thin-plan ruling (6407993113) replaces a hand-back with the implementer's own least change. Each case below names that change; the implementer records each one taken in the body and the step 12 comment.

- **F1, a deleted pause.** If a suite reds the check of a deleted pause twice, and main's same suite at the same machine passes that check, put the deleted line back exactly as it was and name it in the body as a pause row 12 classes.
- **F2, P26 or P27 on the frame bound.** If either reds with `frame` at or above `QUIET_FRAMES` and `scrollTop` unmoved while main passes it, raise `QUIET_FRAMES` to 30 and rewrite its dated line with the reading, once. If it still reds, take F1's route for both pauses.
- **F3, a counter that never moves.** If a wait times out with `wheels: 0`, `clicks: 0` or `ends: 0` while its read shows the camera or the page moved, widen the counter's types: `wheel` adds `mousewheel`; `click` adds `pointerup` and `mouseup`; the gesture end adds `touchend` and `touchcancel`. If it still never moves, depart on the read differing from one taken just before the input, and record it as a call.
- **F4, the depth clause.** If Z13b or Z13c reds on `held`'s depth clause alone while main passes it, quote the read, delete the clause, and file an issue carrying the reading and the whole fix (`handbook/specs/development-workflow.md` step 15).
- **F5, a turn or a job that never starts.** If T3, T5 or Z19b time out on their start predicate locally while main passes them, take F1's route for that pause.
- **F6, the lint.** If `vellum/e2e-throw-inside-step` names a call this plan did not step, wrap it in a step named for its checks. If `max-lines-per-function` names a function, move its new wait into a module-level helper as `crossfadeLanded` does.
- **F7, a slow step.** If a step other than P30 reads a median of 10 s or more: where main's latest run already read that step's span at 10 s or more, print it and leave it (call 6's analogy); otherwise put that step's pauses back by F1's route.
- **F8, a drift.** If `git diff --stat 36e67efe origin/main -- e2e/ test/e2e/rest-waits.test.ts test-support/ handbook/errata/guards.md` prints a lane A file, merge `origin/main`, rebuild each edit on the moved file by its text, and quote the diff in the body.
