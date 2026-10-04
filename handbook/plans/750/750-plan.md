# Issue #750 plan: the place card holds while the pointer is on it (with Issue #639 and Issue #632)

Written 2026-10-04 at origin/main 63a0cc1 by the vellum-implementer lane, before any code, and revised
after `vellum-plan-skeptic` (two reads; its findings and their disposition are in the lane's report and
go into the PR). Every number below was measured on that tree with real input (CDP
`Input.dispatchMouseEvent`, `dispatchTouchEvent`, `dispatchKeyEvent`; never `element.click()`) through
`out/750/probe.ts`. The JSON and the scripts are in the main checkout's `out/750/` (gitignored); the
tables go into the PR as a comment with the harness, per workflow step 10.

## Rulings and requests in hand

- Issue #750 comment 5981859276 (Alex, 2026-10-04): try to fold Issue #639 and Issue #632. #639 folds
  only if the chosen design measurably stops a card hiding under a still pointer; #632 needs its own
  design choice and its own failing test.
- Issue #750 comment 5982056602 (Alex, 2026-10-04): desktop widths only, 1024 and up, measured at 1024
  and 1280. Touch stays in scope (Epic #760 keeps large tablets). #639 and #632 are re-measured at 1024
  and 1280 to see whether they reproduce there at all.
- Issue #750 comment 5983341312 (Alex, 2026-10-04), the rulings on this plan's menu, folded into the
  design below and governing over it wherever the two differ:
  1. The hold is the outline (Q1 A), with Alex's condition: the page listens for mouse movement ONLY while
     a place card is shown. So the engine adds the listener when a card opens and removes it on every
     path that closes one, and a test pins that nothing listens while no card is shown. This replaces the
     host-wired listener the menu described: no host edit and no new engine method; the engine attaches
     to its mount's own document (`mapEl.ownerDocument`), the element the host handed it.
  2. Other towns: Q2 A, as recommended.
  3. Issue #639 closes with this pull request.
  4. Issue #632: the nearest town wins (Q4 A); it closes with this pull request.
  5. The wait is 150ms.
  6. A double-click never closes the pinned card; a later deliberate click or tap closes it.
  7. Once a card is pinned, the next Tab goes to its button; otherwise Tab moves town to town.
  8. The new module is `src/site/living-chart/place-card-hold.ts` (not the name this plan proposed), and
     its tests `test/site/place-card-hold.test.ts`.
  9. The CAPPED rule stays and its reasons are corrected: the wheel, drag and pinch reason goes, the
     own-town reason stays, the real-tablet half is marked unverified.
  The lane's own calls (the tremor instrument, the synthetic Escape, the viewports, the paces, straight
  paths only, keyboard-only focus switching, the double-click zoom parked as an errata row, PC1 and PC2,
  the cursor polish) stand as the phase-one report listed them.

## How it was measured

- Builds: `dist/` at 63a0cc1 frozen as `out/750-dist-main/` before any source changed (the still and
  sweep "today" rows ran on it). Four throwaway spike builds, every arm switchable at runtime by a window
  global, frozen as `out/750-dist-spike{,2,3,4}/`; the travel, cost, keys, tablet and switch "today"
  rows ran on a spike's arm `main`, which reproduced the frozen build wherever both ran (still on seeds
  4294967295, 42, 2026 and 320; the centre-press sweep on the same seeds).
- Desktop: `Emulation.setDeviceMetricsOverride` 1024x768 and 1280x800, `mobile: false`, touch off.
  Tablet: 1024x768, `mobile: true`, touch on, one fresh browser per configuration, taps spaced 650ms
  (a first pass tapped inside the double-tap window, which zoomed the chart; its rows are void).
- Seeds: 42, 320, 4294967295, 7, 2026, 123456 for the reproductions; 4294967295, 42, 2026 for the arms;
  320 added for #639 because it is the only seed where today fails at desktop. 26 places each.
- Paces: 0.25 px/ms (slow) and 1 px/ms (brisk), plus 0.1 px/ms setting off 100ms after the card
  appears (mid-unroll); moves every ~5ms on a straight line, positions following the wall clock.
- The still probe holds the pointer 1.2s on each mark's centre and samples `hidden` every 30ms. A
  FROZEN CDP pointer is blind in this headless build (a live card body lay under it for 1.2s and the
  mark never saw `mouseleave`: the known-fail arm hid 0 frozen and 6 with a tremor), so the pointer rests
  with a half-pixel tremor every 30ms. The frozen runs are kept and nothing rests on them.
- A CDP `Escape` key (rawKeyDown) wedged headless Brave, devtools included, after three or four rounds
  (`out/750/hang2.ts`); the probe's resets dispatch a synthetic `keydown` instead.
- Not measured: a real tablet (the harness cannot see `touch-action`), curved or wobbling paths, Safari.

## What was measured

### #750: from a mark to its own "View the prospect" button (seeds 4294967295, 42, 2026)

Each cell is presses that landed on that town's own button and opened its prospect (the click caught
and prevented), out of the travels started; 138 distinct paths, each travelled four ways. The switch
column is a straight move from town A to the nearest neighbour B that is neither under A's card nor
across another town, at 1 px/ms, timed from entering B's box to B's card showing.

| design | width | hover, slow | hover, brisk | pinned, slow | pinned, brisk | crossing paths kept | switch to B, median / worst |
|---|---|---|---|---|---|---|---|
| today | 1024 | 0/65 | 0/65 | 12/65 | 19/65 | 15/228 | 22ms / 31ms |
| today | 1280 | 0/73 | 0/73 | 35/73 | 38/73 | 29/204 | 21ms / 31ms |
| grace 250ms, only the buttons take the pointer | 1024 | 2/65 | 65/65 | 65/65 | 65/65 | 173/228 | 269ms / 291ms |
| grace 250ms, only the buttons take the pointer | 1280 | 0/73 | 73/73 | 73/73 | 73/73 | 153/204 | 259ms / 286ms |
| grace 1000ms, only the buttons take the pointer | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 1017ms / 1043ms |
| grace 1000ms, only the buttons take the pointer | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 1011ms / 1035ms |
| the card takes the pointer, + 250ms grace | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 268ms / 305ms |
| the card takes the pointer, + 250ms grace | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 260ms / 288ms |
| outline, see-through, + 250ms grace | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 267ms / 305ms |
| outline, see-through, + 250ms grace | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 263ms / 287ms |
| outline + 150ms grace | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 166ms / 205ms |
| outline + 150ms grace | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 161ms / 187ms |
| outline + 100ms grace | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 118ms / 156ms |
| outline + 100ms grace | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 109ms / 134ms |
| outline + safe triangle (400ms fallback) | 1024 | 65/65 | 65/65 | 65/65 | 65/65 | 228/228 | 31ms / 453ms |
| outline + safe triangle (400ms fallback) | 1280 | 73/73 | 73/73 | 73/73 | 73/73 | 204/204 | 24ms / 424ms |

Outline + 150ms grace, setting off 100ms after the card appears (mid-unroll), at 0.1 and 0.25 px/ms:
every travel kept, 65 of 65 per cell at 1024 and 73 of 73 at 1280, hovered and pinned, with no frame
where the card was gone or showed another town. (The outline is `#place-card`'s own rectangle; the
unroll transform rides `.pc-inner`, so the outline is full size from the first frame.)

A shown card covers 11.9 towns on average at 1024 and 9.2 at 1280 (30.7% and 17.9% of the chart box),
so most paths to the button cross a town under the card; today keeps the right card on 44 of those 432
crossings. Marks whose centre opens a different town (#632) start no travel and are counted apart (52
starts at 1024, 20 at 1280). The widest stretch of any path over neither the mark's own box nor its card
is 9.1px; the longest from leaving the mark to reaching the button is 236.1px. The live arm's "pinned"
rows did not read `.pinned`; the centre-press sweep below shows 4 of its 1024 starts were never pinned.

### What a card over the chart costs (156 cards per width, 3 seeds)

| | width | towns under a shown card whose own box is still on top | its OWN town's centre under a press | wheel aimed at the card's text | drag started on it | tablet pinch / pan started on it |
|---|---|---|---|---|---|---|
| today | 1024 | 1282 of 1850 (69%); a hover there switches a pinned card (point 3) | always the town | reaches the chart (see-through) | reaches the chart | 24/24, 24/24 move the camera |
| today | 1280 | 1142 of 1434 (80%) | always the town | same | same | |
| the card takes the pointer | 1024 | 10 of 1850 | the card, on 4 of 78: a press there leaves the card unpinned (seed 4294967295 Mad and Kralgov, seed 2026 Micec and Canuax) | 18/18 still zoom the camera | 6/6 still pan | 21/21, 21/21 still move it |
| the card takes the pointer | 1280 | 2 of 1434 | 0 of 78 | 18/18 | 7/7 | |
| outline | both | as today, but ignored while the pointer is inside the outline | always the town | reaches the chart | reaches the chart | 24/24, 24/24 |

So the live card is NOT the wheel and pan dead zone that `handbook/specs/explorer-doctrine.md` ("A card
is CAPPED to that box") records, at desktop and on a tablet in this harness: `cardShell`'s
`stopPropagation` fires only on a card with a tail to scroll, and none of the 36 sampled cards had one.
The tablet half is UNVERIFIABLE on a real device. Its OTHER premise holds: the live card still covers
its own town and takes a press or a tap meant for it.

### #639: a still pointer on each mark's own centre, with tremor

| build | 1024 | 1280 |
|---|---|---|
| today, 6 seeds | 2 of 156: seed 320 only, idx 0 and idx 5, both inside Metalador's box (#632), where Metalador's own button slides under the pointer | 0 of 156 |
| known-fail arm: card body live under today's hide-on-leave, 3 seeds | 6 of 78 | 0 of 78 |
| every hold arm (grace, live, outline, triangle), 3 seeds | 0 of 78 | 0 of 78 |
| outline, seed 320 (where today fails) | 0 of 26 (today 2) | 0 of 26 |

At desktop the recorded #639 (a card's action resting on its OWN mark's centre) does not occur on any of
the 312 marks; the mechanism occurs only through #632, and the outline arm takes it to 0 on the one seed
where it occurs, with or without the #632 fix. No red-first e2e for #639 is possible at desktop; its
guard is the unit test that the pointer on the card holds it (H2).

### #632: a real press at every mark's own centre (6 seeds)

| option | presses opening another town, 1024 | 1280 | smallest share of a mark's own 26px box still answering to it | evidence |
|---|---|---|---|---|
| today | 25 of 156 (2/5/5/1/6/6) | 6 of 156 | 10% in the browser's grid (seed 2026); 18% computed | real presses |
| nearest mark wins among the boxes under the pointer | 0 of 156 | 0 of 156 | 48% (1024), 58% (1280), computed | real presses (6 seeds); outline + nearest: 0 of 78 and every press pinned |
| collision pass: each box shrunk to clear every other centre | 0 | 0 | 14%; 2 to 13 boxes shrink per world, the smallest to 11.7px | computed from measured centres |
| 18px boxes | 7 | 1 | 16%; every target loses about half its area | computed |
| 22px boxes | 14 | 4 | 17% | computed |
| 26px circles | 18 | 5 | 19% | computed |
| capital and towns painted on top | 24 | 6 | 15% (moves the loss, does not remove it) | computed |

The coverer is always a LATER place in manifest order (paint order is DOM order) and is not the
index-order neighbour by rule: 0 under 23, 2 under 18, 18 under 24 (a chain). The capital itself is
covered on seeds 42, 320 and 2026 at 1024. The computed rows agree with the browser's `elementFromPoint`
at 30 of 31 covered centres; the one miss is a 0.58px boundary case.

### Keyboard (seeds 4294967295 and 42)

| | Enter on a town, then Tab: reaches THAT town's button | Tab presses to cross the chart's towns |
|---|---|---|
| today | 0 of 16; Tab walks every later town and lands on the LAST town's card | 25 |
| card follows its town in the tab order (outline, keyboard-only focus rule) | 16 of 16, in one Tab | 77 (each town's two buttons join the walk) |
| card follows its town only once Enter has pinned it | 16 of 16, in one Tab | 27 (the card's two buttons once, after the last town) |

With A pinned and B focused, B's accessible description names B in every arm. Measured on today's
build: when the card refills while keyboard focus sits on one of its buttons (`fillCardInner`'s
`replaceChildren` takes the actions row out of the document and puts it back), the browser fires
`focusout` with no related target and focus falls to the page. Under the keyboard rule in point 5 that
would hide an unpinned card it had just shown, so the refill keeps the actions row attached.

### Dismissal by real input (seeds 4294967295 and 42, 1024, 8 pinned cards each)

A real press on open chart, clear of the card and of every town, dismisses 16 of 16 today and 16 of 16
on the recommended build. A real Escape KEY is UNVERIFIABLE here: it wedged headless Brave on both
builds (the second run of the day to do so). The Escape LISTENER is covered: every reset in every run
dispatched a synthetic `keydown` and required the card hidden before the next mark, and none failed.

### Pointer focus (seeds 4294967295 and 42, 1024)

A pan started by pressing on town B while A is pinned (Chrome focuses a button on press; d3 then eats the
click): today the card switches to B and loses the pin 14 times in 15; the outline arm with "any focus
switches" loses A 15 of 15; with "only keyboard focus switches" (a press marks its own focus as the
pointer's) A keeps its pin 15 of 15.

### Touch (tablet 1024, seeds 4294967295 and 42, 26 places each)

| design | a tap opens and pins its own town | a tap on the card's own text | a later second tap on the pinned town | a tap on the card's button opens that town |
|---|---|---|---|---|
| today | 52/52 pin, 8 of them a neighbour's card (#632) | dismisses 34, switches to a town beneath 18 | (never reached: the text tap already closed it) | 44/52 |
| the card takes the pointer | 46/52: on 6 marks the card the tap's hover opened covers its own mark and takes the rest of the tap | keeps 39 of 46 | never closes | 39/52 |
| outline, any focus switches | 52/52 | switches 23 of 52 (the tap focuses the town beneath) | never closes | 44/52 |
| outline, keyboard-only focus, nearest mark, second press closes unless it is a double press | 52/52, all its own town | keeps 52 of 52 | closes 52 of 52 | 52/52 |

By mouse (1280, 8 towns): a deliberate second press 700ms later closes the pinned card 8 of 8 on both
today and the recommended rule; a double-click keeps it 8 of 8 on the recommended rule and 0 of 8 today.
A double-click (or a double-tap) on a town also zooms the chart, today and under every arm, because the
hit buttons do not stop the gesture events the way `makeDogEar` in `src/site/explorer/chart-drawer.ts`
does. That is outside this issue: an errata row or an issue in the same diff, not a fix here.

## The design (recommended at the menu; ruled 2026-10-04 in comment 5983341312, which governs)

1. **The hold: the outline.** The card stays while the pointer is inside its rectangle, and for a short
   grace after the pointer leaves both the rectangle and its town; when the grace runs out it shows the
   town under the pointer, or hides. The card stays see-through, so the wheel, the pan and the pinch
   over it reach the chart exactly as today and a press or tap on its own town always reaches the town.
   The position comes from a `mousemove` listener on the mount's own document that the engine adds
   when a card shows and removes on every path that closes one (Alex's condition: nothing listens while
   no card is shown), skipped while a button is held (a drag is never a hover, and it spares a layout
   read per pan frame); every hold input re-reads the outline against the last pointer position, so a
   card that slides under a still pointer counts as under it. While the pointer is inside the outline, a
   class on the overlay drops the hand cursor from the towns under the card (`cursor: default`), so the
   card's text never shows a hand (built in the last spike, not measured; a computed-style read of the
   element under the pointer is the check).
2. **Other towns.** While the pointer is inside the outline or the grace, other towns' hovers and
   presses are ignored. A pinned card ignores every hover; a press on another town outside the card moves
   the pin. ONLY keyboard focus switches the card: a town's `pointerdown` marks the focus that follows as
   the pointer's (consumed by that focus, cleared by the town's blur), and the press path decides instead; keyboard focus on another town always shows it,
   unpinning, so a focused mark's description is its own card. A press on the card's text no longer
   dismisses (today it does, 34 of 52 taps).
3. **What still dismisses.** Escape, a press on open chart outside the card, `hideCard` from the scrub
   (`applyScrub`) and the draw (`draw` in `src/site/explorer/app.ts`), a rebuild and teardown. Every one
   clears the grace timer, the on-card flag and the cursor class, and removes the document listener.
   `isSuppressed` keeps blocking a show, and a refused show leaves the hold closed.
4. **The second press on the pinned town** closes it, unless it is the second click of a double-click
   (`event.detail` of 2 or more, which carries the platform's own double-click interval, so no hand-set
   window). Keyboard Enter (detail 0) on the pinned town closes it, as today.
5. **Keyboard reach.** When a card is PINNED for a town (Enter or a press), the card moves to sit right
   after that town in the DOM, so Tab goes from the town to its two buttons; blur into the card holds;
   focus leaving the card for anywhere but a town hides an unpinned card. Crossing the chart by Tab takes
   27 presses, not 25 (always following would take 77). `fillCardInner` keeps the actions row attached
   across a refill, so a focused button keeps its focus.
6. **#632: the nearest mark wins.** On enter, move and press, the pointer resolves to the nearest mark
   among the boxes under it, and that mark's box is raised (`z-index` 1, below the card's 5) so the native
   hover ring follows it. A press with `detail` 0 resolves to its own target.
7. **The grace: 150ms.** It must outlast the widest gap a straight path crosses between a mark's box and
   its card (9.1px over the 138 paths) at the slowest pace served: 36ms at 0.25 px/ms, 91ms at 0.1 px/ms.
   150 is about 1.6 times the 0.1 px/ms figure; the dated line at the constant names that sweep and the
   0.1 px/ms run. Switching straight to a neighbour waits for it (median 166ms at 150, about 110ms at 100).

The rules live in a new pure module, `src/site/living-chart/place-card-hold.ts` (Alex's name): a reducer
over enter, leave, outline, expire, press, focus and blur inputs, the nearest-mark function and
`HOLD_GRACE_MS`. `place-overlay.ts` wires events and the timer through two closures, `wireHit` and
`wireCard`, each under the 50-line function cap, and the file stays under its 400 (the spike reached 450
by inlining everything; main is 303).

## Files

- `src/site/living-chart/place-card-hold.ts` (new, Alex's name): the reducer, `nearestMark`,
  `HOLD_GRACE_MS` with one dated line naming the sweep and Issue #750 in that form (the comment lint
  refuses a bare number).
- `src/site/living-chart/place-overlay.ts`: the hit wiring (pointerdown, mouseenter, mousemove,
  mouseleave, focus, blur, click) and the card's focusout through the reducer; the document `mousemove`
  listener added on show and removed on close; the timer; the card's DOM position after its pinned
  town; the overlay's cursor class; the hold cleared on every dismissal. The wiring that does not fit
  under the file's 400 lines moves to `src/site/living-chart/place-card-wiring.ts` (named in the PR).
- No host edit and no new engine method: the listener is the engine's own, on `mapEl.ownerDocument`.
- `test-support/element-shim.ts`: `before` and `after` on `El`, so the refill that keeps the actions
  row attached can run under the shim (environment only).
- `public/living-chart.css`: the raised hit (`z-index: 1`) and the outline's cursor rule. No
  pointer-events rule changes.
- `handbook/specs/explorer-doctrine.md`, `handbook/specs/settle-doctrine.md`: see below.
- Tests: `test/site/place-card-hold.test.ts` (new); `test/site/living-chart-no-bar-card.test.ts` (PC1, and
  PC2 rewritten to the ruling; the wiring tests below); `test/site/living-chart-no-bar.test.ts` (the hit
  listener roster); `test/site/living-chart-css.test.ts` (`ENGINE_RULES`, and a pin that the raised hit
  stays below the card); `e2e/suites/cards/overlay.ts`, `e2e/suites/cards.ts` and a new
  `e2e/suites/cards/hold.ts` (P9 rewritten, P28 to P31); `test/repo/e2e-tiers.test.ts` (new stepped
  groups); `test/e2e/lane-timings.test.ts` (the cards seconds).
- An errata row (or an issue) for the double-click zoom on a town.
- `handbook/plans/750/750-plan.md` (this file).

## Tests, each with the mutation that reds it

Pure (`test/site/place-card-hold.test.ts`):
- H2 the pointer inside the outline holds the card through any number of expiries (#639's guard).
  Mutation: drop the outline check in expire.
- H3 another town entered while inside the outline or the grace is ignored, and the expiry shows the town
  under the pointer. Mutations: drop the held check; hide instead of showing the hovered town.
- H4 a pinned card ignores every hover (#750 point 3). Mutation: drop the pinned check.
- H5 the second press closes the pinned card at detail 1 and keeps it at detail 2. Mutations: restore the
  unconditional toggle (detail 2 closes); never close (detail 1 keeps).
- H6 every dismissal input clears the grace, the outline flag and the cursor state. Mutation: drop the
  clear from hide.
- H7 keyboard focus on another town while one is pinned shows the focused town, unpinned. Mutation:
  ignore focus when pinned.
- H8 focus marked as the pointer's (a pointerdown before it) changes nothing, inside or outside the
  outline; unmarked focus switches. Mutation: drop the mark (the pan-loses-the-pin and tablet-switch
  rows come back).
- H9 a press inside the outline, on a town or on open chart, neither switches nor dismisses; outside on
  open chart it dismisses. Mutation: drop the outline test from the press path.
- N1 nearest mark: a point inside two boxes resolves to the nearer centre; detail 0 resolves to its own
  target. Mutations: return the topmost; ignore detail.

Wiring, shim, `mock.timers`:
- PC1 (red now): after a pin and a hover elsewhere, the card's name, its pin and both actions agree.
- PC2 (rewritten to the ruling on point 4): with the recommended rule, a click at detail 2 keeps the pin
  and a later click at detail 1 closes it. The uncommitted PC2 asserts only the first half, which "never
  close" also passes, so it is held until the ruling.
- PC3 the timer is cleared on dismissal: with a grace pending, `hideCard()`, then show town B by
  keyboard focus, advance past the grace, and B is still shown. Mutation: drop the clear from hide.
- PC4 the grace length: after leaving the mark, the card is still shown at 91ms (the derived worst gap at
  0.1 px/ms) and hidden after `HOLD_GRACE_MS`. Mutations: a grace of 30 reds the first half; a grace of
  10000 reds the second.
- PC5 the card follows its town once pinned: after a press pins a town, the card is that town's next
  sibling, and a merely focused town does not move it; blur into the card keeps it; focusout to the page
  body hides an unpinned card. Mutations: drop the move; move it on every show.
- PC6 a refill keeps the actions row attached: the `.pc-acts` element is the same node, and never
  leaves `.pc-inner`, across a switch to another town (the shim records `remove` and `replaceChildren`
  on it). Mutation: restore the whole-inner `replaceChildren`.
- The hit listener roster test grows to the new set.
- PC7 (Alex's condition on ruling 1): with the mount's `ownerDocument` a recorder, nothing listens for
  `mousemove` after the overlay is built and no card is shown; showing a card adds exactly one listener;
  and every close path (Escape, a press on open chart, `hideCard`, the grace expiring, a blur, a second
  press, a rebuild, teardown) leaves none. Mutations: add the listener at build instead of at show; drop
  the removal from any one close path.
- PC2 as ruled: a pinned town's click at detail 2 keeps the card, and a later click at detail 1 closes
  it; Enter (detail 0) on the pinned town closes it.

e2e, real input (`e2e/suites/cards/hold.ts`, at 1024x768 by its own metrics override, the floor Alex
ruled and where the defects are worst):
- P28 the travel, brisk, on seed 4294967295's marks whose path crosses another town (20 of 21), hovered
  and pinned, plus one slow (0.1 px/ms) path across the widest gap: the press lands on that town's own
  button. Red today (hover 0 of 21). Mutations: restore hide-on-leave; a 30ms grace (the slow witness).
- P29 #632: a real press at every mark's centre on seed 4294967295 opens and pins that mark's own card
  (5 of 26 wrong today at 1024). Mutation: resolve to the top box.
- P30 the tablet: on seed 4294967295 with touch on, a tap on every mark's centre opens and pins its own
  card, and a tap on the card's text keeps it. Red today (5 neighbour cards, 20 text taps dismiss).
  Mutations: make the card live (idx 0, 16, 21, 23 open nothing); drop the focus mark (text taps switch);
  drop nearest (5 neighbour cards).
- P31 the keyboard: Enter on a town, then one Tab lands on that town's "View the prospect" (red today);
  and with focus on that link, a real mouse hover onto a clear neighbour switches an UNPINNED card (a
  town focused, not pinned, then Tab into its card) while the link keeps focus. Mutations: drop the
  card's move; restore the whole-inner `replaceChildren`.
- P32 dismissal by real input: a real press on open chart clear of the card and of every town hides a
  pinned card, and a press on the card's text does not. Mutation: drop the outline test from
  `onDocClick` (the text press then dismisses). Escape stays covered by P8's synthetic keydown, because
  a real Escape key wedges the headless browser.
- P9 rewritten: a real pointer leaving the mark hides the card after the grace, polled, never at once;
  P8, P10, P11, P12, P14 and P15 rerun unchanged and must stay green.
- Budget. Lane A has 86.3s of room under the 0.3 cap (total 1321.1s, lane A 335.9s, computed from
  `test/e2e/lane-timings.test.ts`). Per-step costs are ESTIMATES, since the probe does not time them: a
  brisk travel's motion is measured (~0.2s) but the reset, unroll and press around it are estimated at
  ~0.9s, and a tablet mark (three spaced taps and a rest) at ~2.5s. All 21 marks two ways, 26 presses and
  26 tablet marks would come to ~140s, too much. So P28 keeps 6 crossing marks two ways plus the slow
  witness (~16s), P29 keeps all 26 presses (~29s; the sweep is the guard), P30 keeps the 9 marks that
  carry its three mutations (idx 0, 5, 8, 9, 11, 16, 17, 21, 23: ~23s), P31 is a few keystrokes and one
  hover (~3s), P32 four cards (~5s): ~76s in all, under 86.3s but close, so the first lane log decides
  whether P29 drops to its 5 covered marks plus a control; `MEASURED_SECONDS["cards"]` is corrected from
  the pull request's own lane log.

## Evidence commands

- `npm run check`, `npm run lint`, `npm test`, then `npm run astro:generate`.
- `npm run build`, then the e2e suites the change touches, one at a time: cards and zoom (lane A),
  chart-drawer (CD25, CD26, CD30), reading-room (RR11b), prospect.
- The acceptance: `out/750/probe.ts` against the branch build (travel on 3 seeds at 1024 and 1280, the
  tremor still probe including seed 320, the centre-press sweep on 6 seeds, keyboard, drag-pin, second
  press, tablet), with the frozen control in the same session. The frozen builds and the probe are kept
  in the main checkout's `out/750/` so the instrument outlives this worktree.

## Doctrine and rosters this drags

- `handbook/specs/explorer-doctrine.md`:
  - Overlay lifecycle gains the hold (what holds, what is ignored, the keyboard-only focus rule, what
    dismisses, that each dismissal clears the timer) and the second-press rule.
  - The "A card is CAPPED" bullet keeps its rule and corrects its reasons with the measurement: the
    dead zone did not reproduce at desktop or on a tablet in this harness (UNVERIFIABLE on a device),
    because `stopPropagation` keys on a tail; the other premise stands, a live card still covers its own
    town and takes a press or tap meant for it, with the 4-of-78 and 6-of-52 rows.
  - The engine boundary records the one document listener the engine adds itself: the card's pointer
    watch, on the mount's own document, only while a card is shown, removed on every close path.
  - Counter-scale gains the #632 rule beside "A hit area does not scale free": overlapping hits resolve
    to the nearest mark, never to paint order.
- `handbook/specs/settle-doctrine.md`, the unfurl bullet: `showPlaceCard` "restarts it on every show,
  which mouseenter, focus and click each trigger"; a re-entry on the shown town, and pointer focus, no
  longer show it, so the sentence names what does.
- Rosters: `API` in `test-support/living-chart-hosts.ts`; the hit listener set; `ENGINE_RULES`;
  `STEPPED_GROUPS`; `MEASURED_SECONDS["cards"]`; `SUITES` if `hold.ts` is a new suite rather than a
  group of cards (it is a group of cards, so no new suite).
- No renderer, chart, golden or seed is touched; no regen is owed, named in the PR with the command.
