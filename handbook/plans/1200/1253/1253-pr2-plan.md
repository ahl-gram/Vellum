# Issue #1253, pull request 2: the pointing hand in the Writing Room

**Planned at:** origin/main `718fdbb4a7d8d07aa570a5a158cb781343cc6f8e` (PR #1381, pull request 1, merged), the issue's comment count 9: the orchestrator's note of 2026-11-09 (6754035498), Alex's rulings M1 to M6 (6867668486), the archive of revision 0 (6867691563), Alex's ruling on revision 1 (6869168142), the two parts of the archive of revision 1 (6869172162, 6869172683), the step 12 record of pull request 1 (6869302236), Alex's ruling on PR #1381 (6869932050) and Alex's rulings on this plan (6870840753). Three of the nine open `Plan archive, not a ruling:` and are not rulings. Main has not moved since the plan was first written (`git fetch origin main`, then `git rev-parse origin/main`).

**Rulings:** Alex, 2026-11-13, https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-6870840753, every item the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr2/`: D0 "Build as shown", D1 "No browser check", D2 "Enter counts as Found", D3 "Leave it, review later", D4 "Leave it, file an issue", and on call C36 "Load it always, as built" (the Rulings section at the foot quotes each and names what it binds). Alex's rulings for pull request 1 carry over where they are general: M2 to M6 (6867668486), C13 and C23 (6869168142), and PH3 dropped (6869932050). No ruling changed the design this plan was written to.

**Open decisions:** none.

**Recon.** `vellum-spec-recon` read the issue's body and its 8 comments, Issue #1258 comment 6869564140, Issue #1382 and Issue #1254 at `718fdbb4`. Its claims file holds 41 claims (`jq -s length out/1253-pr2-recon/claims.jsonl`; the file carries no verdict, so the counts here are its report's rows): 4 STALE, all cosmetic for this pull request (the body's 34,697-byte data, superseded by M2 and the 52,830-byte steps file; C2's "no named control rings nothing", superseded by M4 and built so; the body's spec wording, superseded by the explorer-doctrine line as shipped; and the body's "Browser, per room", which is D1 here); 2 UNVERIFIABLE (the Explorer bundle's 85,024 bytes, which nothing here rests on, and "the ruled D stills include the Writing Room", which they do not: the round drew the Explorer, the Prospect and the Ribbon, so this room's stills are this plan's), with the pixel parts of two more rows (Issue #1258's graze and PR 1's three outcomes holding on arrival) left UNVERIFIABLE by a recon that ran no browser; 2 marked not yet done, which are this pull request's own work (the page's sheets and the boot call); the rest CURRENT. Its claims file is `out/1253-pr2-recon/claims.jsonl` in the planner's tree. Each finding's disposition:
- The Writing Room has no ruled still: this plan's spike and plate read are its stills (M1).
- The steps that assume the ladder's sentence (2, 4 and 5 found `a polar archipelago of twenty islands` as their `first` acts, while a Try it lands on the room's own example): ruled D4, the ladder left as it is and filed by the dispatcher as its own issue.
- `#wr-line`'s `change` watch for `writing-room-your-word` and the commission, and a founding by Enter sending neither a click nor a change: measured, and ruled D2, Enter counts as Found.
- Issue #1382 (the hand's `factsOf` and the drift check's `FACTS` read a control twice): not touched. Their differences are the label read (`labels.item(0)` against `labels[0]`), the `|| ""` fallbacks and `scrollIntoView`. This room's `then` reads are text, contains and road reads (`#wr-account .wr-steered .wr-word`, `.wr-residual`, `#folio-coords`, `.wr-steered`, `#wr-plate`), which read `textContent` and the `.verb` and `.room` parts in both, so the two agree here. Its decision stays on that issue.
- Issue #1258's graze (the ring's 6 px pad touching a neighbouring row at 1024 in the Explorer, and the seal's numeral 1.5 px low): the post-use review's, as ruled. The plate read measures this room's own graze on the write step (The design, The ring).

## What this pull request delivers

When a reader arrives in the Writing Room from a Try it on the Primer (`/writing-room/?step=<id>`), the room does what the Explorer does since pull request 1: once its first founding is drawn it rings the controls the step names, lays the manicule beside the ring, seats the slim note under the head cluster's trail, seals the step when the room sees it done, and drops the key with the hash kept. The six steps of the Writing Room's ladder are the only ones whose Try it opens this room (`out/1253-dry-run/1253-pr2-steps.log`); no step's press onward leads into or out of the room.

It also lets a founding sent by Enter in the sentence box count as a press of Found for the two steps the room seals on use (ruling D2), and it lists the rooms the hand is taught in once, in `test-support/hand-steps.ts`, for the two fast tests that hold each room's wiring (ruling D1).

The other seven rooms follow in later pull requests (M1); this one leaves Issue #1253 open (call C35).

## Specs

The implementer reads these, beyond `CLAUDE.md`'s table for the work it does:
- `handbook/plans/1200/1253/1253-r1-plan.md`, The design, for how the hand works; this plan changes none of it but `watchUse` (ruling D2).
- `handbook/specs/ui-design.md`, The Primer's pointing hand (line 263): the provisional dress this room wears unchanged.
- `handbook/specs/explorer-doctrine.md`, "The address is a photograph" (the `step` key line, 311).
- `handbook/specs/site-architecture.md`, How a page is authored (sheet order, `extraCss`).
- `handbook/specs/cascade-traps.md`, the bullet "`contain: layout` re-anchors every fixed descendant too, and for good": the Writing Room is a staged chart room, its body reads `contain: layout` (part A of the probe log), so the hand's page coordinates hold here as in the Explorer.
- `handbook/specs/check-placement.md`: The unit suite (what a unit test may read, a new claim about a built page in `test/site/built-pages.test.ts`), and "A browser check is written".
- `handbook/specs/settle-doctrine.md`, When a check leaves the run, the bullet "A check's coverage is needless on one of two grounds": the ground D1's recommendation rests on.
- `handbook/specs/conventions.md`: How a design decision is made (building to ruled stills), and comments.

## The design

**The Writing Room takes the hand with two lines and two sheets.**
- `src/pages/writing-room/index.astro` links the Primer's marks and the hand's sheet before its own furniture's, in the Explorer's order: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`.
- `src/site/writing-room/app.ts` boots the hand once its first founding is drawn: `void bootHandOnce({ route: "/writing-room/" });` on the line after `settled++;` inside `draw()`'s `try`, after the chart, the folio, the press's verb, the road's address and the account (`onDrawn`) are in place. `bootHandOnce`'s module flag makes the later draws (a founding, the plate) do nothing (call C28).
- That is the whole of the spike the readings below were taken on: `out/1253-dry-run/1253-pr2-spike.diff`, `git diff` of those two files in the planner's tree, three lines added and one changed.

**What the hand does in each of the room's six steps**, read on the built spike at 1280 by 800 and 1024 by 768, under reduced motion, on a bare desk (part A of `out/1253-dry-run/1253-pr2-probe-A.log`, `node out/1253-dry-run/1253-pr2-probe.ts A`, built at `718fdbb4` with the spike):

| step | seals on | ring holds | on arrival |
|---|---|---|---|
| `writing-room-write` | outcome: the account's first steered word reads `polar` | the sentence box and Found, one ring 310.8 by 142.59 | not sealed, key kept |
| `writing-room-your-word` | use: a press of Found, a change of the box, and Enter (ruling D2) | Found, 77.89 by 46.8 | not sealed, key kept |
| `writing-room-shape-of` | outcome: the account steers `the shape of Japan` | Found | not sealed, key kept |
| `writing-room-plate` | outcome: the press reads `Lift The Vegetation Plate` | the plate's press, 204.8 by 64 | not sealed, key kept |
| `writing-room-explore-it` | arrival (a road to another room, N2) | the Explorer road, 143.8 by 64 | sealed, row `5 done`, `Next step ›`, key gone |
| `writing-room-commission` | use: a change of the box, and Enter once the sentence is changed (ruling D2) | nothing: the step names no control, so the note stands alone | not sealed, key kept, no press onward (the ladder's last step) |

- The founding slip is open on arrival at both widths, every named control stands, and no step falls back to its `first` acts (M4's fallback never fires in this room).
- No outcome step seals on arrival: the room's own example sentence (`a cold archipelago of black pines, iron harbors, and a drowned kingdom`) steers `cold` first, not `polar`, and does not open on the plate (`out/1253-dry-run/1253-pr2-example.log`, `node out/1253-dry-run/1253-pr2-example.ts`), so the plate's press reads `Lay on` on arrival.
- No console error and no 4xx across every load of parts A, B, E, O, S and X.

**The note** seats as the seats round ruled for every room (Issue #1155 comment 6754142680, item 5: "A slim note under the top-left trail"), appended last to `header.chrome`. The room's refit (`refitOnChrome` in `src/site/shared/room.ts`, reached through `bindZoomRoom`) fits the chart under it.
- Its width is 620 at 1280 and 590.4 at 1024 (`min(620, slip's left - head's left - 24)`, the founding slip's left at 896 and 640).
- What it costs the chart (the plate read's `out/1253-pr2/table-note-and-sheet.md`): the sheet keeps 77% of today's area on the plate and road steps at 1280 (72% at 1024), 72% on the write, name and commission steps (66%), and 66% once a done row shows (58%), the note then 90.9 to 93.4 px tall with its sentence on three lines beside the row. Today's sheet is 707.27 by 545.98 at 1280 and 557.25 by 430.17 at 1024. The note stands clear of the founding slip (250.4 px at 1280, 24.0 at 1024) and of the top-right corner (49.1 px); nothing scrolls sideways at either width.
- The done row keeps one line in every done state at both widths, `Next, Lay on The Vegetation Plate ›` at 1024 included (`out/1253-pr2/06-shape-done-1024-note@2x.png`): its children share one centre to 0.01 px, and its right edge stands 12.2 px inside the note's.
- The note's row and its onward words, under PR 1's rule (call C31): `Next, Found ›` after steps 1 and 2, `Next, Lay on The Vegetation Plate ›` after step 3, `Next, Explore it in The Explorer ›` after step 4 and `Next step ›` after step 5 (part O, and part B's WH2 (a) fixture).

**The ring and the manicule** are PR 1's, unchanged (ruling D3).
- On the write step the ring wraps the box, the count line and Found: 310.8 by 142.59 at both widths, its top 6 px above the box and its bottom 6 px below Found. On ink (the plate read, `out/1253-pr2/measurements.json`): the slip's head line above clears the ring's painted line by 12.8 px and its halo by 6.8; the account's first line below, "The words that steered", clears the line by 6.61 px and the halo by 0.61 px, its text box overlapping the halo by 2.69 px. No overlap on ink.
- On the plate step the press row's heading, "The Press · what the sheet can do next", clears the ring's line by 1.59 px at 1280 and 0.8 at 1024 on ink, and the halo overlaps its ink by 4.41 and 5.2 px; at 1024 the chart's folio title below overlaps the halo by 2.8 px. That is Issue #1258's graze (the ruled 6 px pad), in this room too, recorded for the review (C34).
- Contrast from pixels: the ring's gold line reads 1.09:1 against the parchment slip and its walnut line 9.46:1 there; over the dark desk and the press row the gold reads 9.0 to 10.4:1 and the walnut 1.1 to 1.2:1. One of the two lines carries the ring on every ground, as in the Explorer. The note's sentence reads 9.46:1 on its panel. The manicule's outline reads 11.14:1 over the parchment slip and its fill 10.0 to 12.1:1 over the desk and the press row.
- The manicule stands 44 px left of the ring. On the write step it sits on the desk beside the founding slip, over nothing; on the name and shape steps over the slip's own panel, beside Found, over no control.
- **In the press row it crowds.** On the road step (`writing-room-explore-it`) it sits on the Lay on press at both widths, 343 px of its ink on the press and 140 on its words `The Vegetation Plate`, while the ring is on the Explorer road. On the plate step at 1024 the row starts 25.6 px from the page's edge, so the manicule is held at 4 px and lies over its own ring (452.7 px of its ink) and the press's edge. Part S of `out/1253-dry-run/1253-pr2-probe-SX.log` (`node out/1253-dry-run/1253-pr2-probe.ts SX`) and the plate read; stills `out/1253-pr2/09a-road-arrive-as-built-1280.png` and `out/1253-pr2/07a-plate-arrive-as-built-1024.png`.
- **The Explorer ships the same crowding today**: as built, its manicule covers another control on 12 of its 41 steps at 1280 and 15 at 1024 (the seed box beside the dice, the Verso's turn beside the Print Room road, another town beside the town it rings, the theme list beside the arms check, and so on), and on `explorer-verso` at 1024 it lies over its own ring (part X of the same log). So the crowding is the kit's, not this room's, and the manicule's seat is already provisional until the post-use review (Issue #1258). Alex ruled it left as built in every room, for that review (D3); the dispatcher added the crowding and the ring's halo grazes to Issue #1258 as comment 6870849702.

**A founding sent by Enter counts as a press of Found** (ruling D2).
- The room founds by Found or by Enter in the box: its own `keydown` handler on `#wr-line` calls `requestSubmit()`, which sends the form's `submit` and neither a click on Found nor a `change` on the box (the box keeps its focus).
- Measured as built (part E of `out/1253-dry-run/1253-pr2-probe-BEO.log`, `node out/1253-dry-run/1253-pr2-probe.ts BEO`): typed and founded by Enter, neither `writing-room-your-word` nor the commission is sealed, `document.activeElement` is still `#wr-line`, and both seal only when the reader then presses anything else on the page (the box's `change` when it loses focus).
- So `watchUse` also listens for `submit` on the document in the capture phase, and a form sent counts as the use of the watched controls inside it, each in M3's own terms:
  - a `click` or `keydown` watch counts when the submitted form matches or holds its control: Enter in the box is a press of Found, as the room's own handler makes it;
  - a `change` watch counts only when its field's value differs from the value it held when the hand armed: M3's "the commission at the first change away from its preset".
- So `writing-room-your-word` (watches a change of `#wr-line` and a press of Found, both inside `#wr-form`) seals at any founding by Enter, as it seals today at any press of Found; the commission (a change of `#wr-line` alone) seals at a founding by Enter of a sentence the reader changed, and not at a founding of the untouched example.
- Measured with that listener staged in the spike (`out/1253-dry-run/1253-pr2-spike-final.diff`; parts A, E and F of `out/1253-dry-run/1253-pr2-probe-AEF-fixed.log`, `node out/1253-dry-run/1253-pr2-probe.ts AEF`):
  - typed and founded by Enter, both steps are sealed straight after the room's rest, the key gone and the founding's hash kept, while the box still holds the focus;
  - with the box untouched, Found or Enter leaves the commission open and seals the name step;
  - on arrival neither is sealed at either width, since the room sends no `submit` of its own.
- The same reads as built, with PR 1's watcher taught here and no `submit` listener (part F of `out/1253-dry-run/1253-pr2-probe-F-asbuilt.log` on the two-line spike): with the box untouched, Found seals the name step and leaves the commission open, and Enter leaves both open. So the listener changes nothing a press of Found already did; it adds Enter.
- A first form of the rule, one that let any `submit` from the form count for every watch, sealed the commission at a founding of the untouched example (`out/1253-dry-run/1253-pr2-probe-F-unfixed.log`), which M3 refuses; the value check is why.
- What it does not touch: the Explorer has no `form` (`git grep -n "<form" -- src/pages src/layouts` finds `src/pages/index.astro`, `src/pages/writing-room/index.astro` and `src/pages/prospect/index.astro` alone), so none of its 41 steps seals differently; no step of any ladder sealed on use watches a control in the Prospect's year form (`out/1253-dry-run/1253-pr2-use.log`, `node out/1253-dry-run/1253-pr2-use.ts`); and the room sends no `submit` on its own (its boot founds through `attempt`, never the form).
- `useWatches` is unchanged, so a change of the box still seals the play step without a founding, as now (the narrowing that would stop it was weighed and not ruled: Alternatives rejected).

**What holds the room's wiring, and why no browser check is added** (ruling D1).
- Every rule the room calls is the shared hand's, held in the unit suite (PK1 to PK19) and walked in the browser by the Explorer's PH1, PH2 and PH4 to PH8.
- What is the Writing Room's own is its wiring: the page links the two sheets, and its script boots the hand. A browser check here would read only that wiring of a shared module, coverage `handbook/specs/settle-doctrine.md` names needless (Alex, 2026-11-08, Issue #1273: "one rule read in every room that takes it from one shared module", the form `SHARED_BINDINGS` in `scripts/lint/shared-bindings.ts` holds the zoom rooms to).
- So the wiring is held by the two fast instruments that can see it: BP-H1 reads the built page's sheet links (`handbook/specs/check-placement.md`: "A new claim about what a built page carries is read in `test/site/built-pages.test.ts`"), and PK16 reads that the room's bundle reaches the hand (`/primer/steps.json`, the string only the hand's module carries). Each reads `HAND_ROOMS`, the one list of rooms the hand is taught in, which each later room's pull request extends.
- What no instrument then holds in this room: that the boot call runs (a call placed where no draw reaches it would pass both). The plate reader reads the room at step 11. Alex ruled no browser check here knowing it (D1); the issue body's per-room browser checks are under Alternatives rejected, their readings kept.

**The press re-cuts once, and the room's boot grows by the hand's code.** With a second room importing `src/site/shared/primer-hand.ts`, the press folds the hand's modules into the chunk the two rooms already shared, which it renames: `explorer/chunks/place-match.js` becomes `explorer/chunks/primer-hand.js`, carrying `src/site/explorer/place-match.ts` and the hand's eight modules (`primer-hand.ts`, `hand-note.ts`, `hand-steps.ts`, `hand-watch.ts`, `hand-words.ts`, `judge.ts`, `seals.ts`, `segments.ts`; the `// src/...` markers of the built chunk). Read statically from each room's `app.bundle.js`, main's build against the two-file spike's (`out/1253-dry-run/1253-pr2-chunks-main.log` and `-spike.log`, `node out/1253-dry-run/1253-pr2-chunks.ts <label>` after `npm run build`, gzip by node's zlib at its default level):
- The Explorer: 21 files both, 919,364 to 919,534 bytes (253,895 to 254,135 gzipped).
- The Writing Room: 15 files both, 705,885 to 722,388 bytes (188,827 to 194,385 gzipped), so 16,503 bytes (5,558 gzipped, 2.9%) on every visit, with a key or not (call C36).
- Every other room: unchanged, file for file.
- PR 1's plan put the hand's code at 2,520 bytes (927 gzipped) "about 2.6 KB a room" from a stand-in module (`out/1253-dry-run/weigh-entries/hand-standin.ts` in the main checkout); the real modules weigh this much more in a room that did not already carry them.

### Alternatives rejected

- **Booting the hand at the room's start, before the first founding**: the arrival reads of an outcome step would be taken before the account exists, and the note would refit a chart not yet drawn. The Explorer boots after its first draw for the same reason (C28).
- **Booting it in `attempt`, refusal included**: a refused founding draws no chart; the hand is an addition to a working room and never stands on one that did not draw (PR 1's C6).
- **Founding the ladder's sentence for the reader on arrival** (performing a step's `first`): PR 1 rejected the hand performing `first` acts, and the sentence's arrival is the ladder's question, ruled out of this pull request (D4, Issue #1384).
- **A `keydown` Enter watch on the box** in place of the form's `submit`: it would seal on Enter with Shift held, which the room's handler refuses, and on an Enter mid-composition; the `submit` is sent exactly when the room founds.
- **Four dresses in the stills**: the room draws only the antique dress (`style: "antique"` in `draw()`), so a fifth ground would be one no reader sees (C27).
- **The hand's browser checks in this room, as the issue body lists them per room** (rejected by ruling D1): two checks, WH1 arriving from the write step's Try it (the ring holds the box and Found, the note says the step and `A world from a sentence, step 1 of 6`, nothing sealed and the key kept, no road carrying it) and WH2 the write step done (sealed, `1done` and `Next, Found ›`, the key gone, the founding's hash kept), with a health gate WH3. Their readings were taken on the two-line spike and fell on the right sides, every fixture passing and every mutation failing (part B of `out/1253-dry-run/1253-pr2-probe-BEO.log`, `node out/1253-dry-run/1253-pr2-probe.ts BEO`), the steps 0.71 s and 1.06 s on this Mac; they stay there for a later room's plan that needs them. A single arrival check was weighed too.
- **Narrowing the name step to a founding alone** (not ruled; D2 took Enter counts as Found): `useWatches` giving no watch for an act on a control the step does not name when it names some would stop a name typed and left without a founding from sealing `writing-room-your-word`, the only step of any ladder it changes (`out/1253-dry-run/1253-pr2-use.log`); measured with it staged and taken out again (`out/1253-dry-run/1253-pr2-probe-E-narrow.log`).
- **The manicule stood above its ring pointing down, or left out, where its seat is taken** (rejected by ruling D3, in every room, for the post-use review): drawn as the spike's arms b and c (`out/1253-pr2/07b-*`, `09b-*`, `11b-*`, `07c-*`, `09c-*`, `11c-*`); above, it touched no control but lay on the press row's heading and the chart's foot, and over a mid-tone patch of the Explorer's chart its fill read 3.06:1.
- **The three steps' Try it carrying the lesson's sentence** (rejected by ruling D4, filed as Issue #1384): `/writing-room/#found=a+polar+archipelago+of+twenty+islands&v=1` opened the room on that world and the drift check's `walkStep` passed over it (parts D and W of `out/1253-dry-run/1253-pr2-probe-AEDW-enter.log`).
- **The hand's code loaded only behind a key** (rejected by the ruling on C36): an `import()` of `primer-hand.ts` when the address carries a `step` key would keep 16,503 bytes (5,558 gzipped) off a keyless Writing Room visit at the cost of one more file on a Try it visit.

## Files

Edited:

- `src/pages/writing-room/index.astro`, line 24: `extraCss={["/shared/primer-marks.css", "/shared/primer-hand.css", "/shared/slide-away.css", "/shared/chart-stage.css"]}`.
- `src/site/writing-room/app.ts`:
  - `import { bootHandOnce } from "../shared/primer-hand.ts";` on the line after `import { MAP_WORDS } from "../shared/map-words.ts";` (line 11 on main).
  - `void bootHandOnce({ route: "/writing-room/" });` on the line after `settled++;` in `draw()` (line 78 on main), before `return true;`.
  - 142 lines on main, 144 after. `npx eslint --flag unstable_native_nodejs_ts_config --max-warnings 0 src/site/writing-room/app.ts` reads it clean with both lines (exit 0, the planner's spike).
- `src/site/shared/primer/hand-watch.ts`, `watchUse(doc, step, done)` (ruling D2); its signature does not change. Its body becomes, as the spike carries it less its one-line spike comment (`out/1253-dry-run/1253-pr2-spike-final.diff`; `npm run check` exit 0, the lint with its flag exit 0, Prettier clean, on the spike):
  ```ts
  export function watchUse(doc: Document, step: HandStep, done: () => void): () => void {
    const watches = useWatches(step);
    const listeners = watches.map((watch) => {
      const listener = (e: Event): void => {
        if (!matches(e, watch)) return;
        stop();
        done();
      };
      doc.addEventListener(watch.event, listener, true);
      return { event: watch.event, listener };
    });
    const valueOf = (css: string): string | null => {
      const el = doc.querySelector(css) as Partial<HTMLInputElement> | null;
      return el === null ? null : (el.value ?? null);
    };
    const preset = new Map(watches.filter((w) => w.event === "change").map((w) => [w.css, valueOf(w.css)]));
    const sent = (e: Event): void => {
      const form = e.target as Element | null;
      if (typeof form?.closest !== "function") return;
      const used = (w: UseWatch): boolean =>
        (form.matches(w.css) || form.querySelector(w.css) !== null) &&
        (w.event !== "change" || valueOf(w.css) !== preset.get(w.css));
      if (!watches.some(used)) return;
      stop();
      done();
    };
    doc.addEventListener("submit", sent, true);
    function stop(): void {
      for (const { event, listener } of listeners) doc.removeEventListener(event, listener, true);
      doc.removeEventListener("submit", sent, true);
    }
    return stop;
  }
  ```
  - The guard reads `closest`, as `matches` above it does: the lint refuses `typeof form?.querySelector` (`@typescript-eslint/no-deprecated`, read on the spike).
  - 114 lines on main, 132 after.
- `test-support/hand-steps.ts`: `export const HAND_ROOMS: readonly string[] = ["/explorer/", "/writing-room/"];` after `stepOf`, the routes of the rooms whose script boots the hand, in the order they took it.
- `test/site/app-bundles.test.ts`, PK16 (the test titled "no page's bundle carries the Primer's ladders: a room reads its step from the data file the build writes (Issue #1253)"): its last clause, the Explorer's bundle naming the data file, becomes one clause per room of `HAND_ROOMS`:
  ```ts
  for (const route of HAND_ROOMS)
    assert.ok(
      [...reach(p, [join(p.root, route.slice(1), "app.bundle.js")], STATIC)].some((f) => p.text(f).includes("/primer/steps.json")),
      `${route}'s bundle never names the data file, so no Try it can point its hand`,
    );
  ```
  with `HAND_ROOMS` imported from `../../test-support/hand-steps.ts`. The ladder clause above it does not change.
- `test/site/built-pages.test.ts`: BP-H1 (Tests), with `HAND_ROOMS` imported from `../../test-support/hand-steps.ts`.
- `test/site/primer-hand-watch.test.ts`: PK19 (Tests).

Created: none. Deleted: none. No file passes 400 lines: `test/site/built-pages.test.ts` stands at 241 and gains about 12.

`src/site/explorer/app.ts` is not touched (C7 stands, 436 lines; the residue the dispatcher named is PR 1's and its own issue's).

## Tests, in the order they are written

All unit tests. The plan adds no browser check (ruling D1).

1. `test/site/built-pages.test.ts`, **BP-H1** "BP-H1 every room the pointing hand is taught in links the Primer's marks and the hand's sheet, the marks first (Issue #1253)":
   - `assert.ok(HAND_ROOMS.includes("/writing-room/"), "the rooms list names the Writing Room")`, the witness that the list reaches this pull request's room.
   - For each route of `HAND_ROOMS`, the hrefs of `head link[rel="stylesheet"]` in `documentOf(page(route))`, resolved to pathnames as `r16Faults` resolves them; a fault `${route} links ${links.join(", ")}` where `/shared/primer-marks.css` is absent or `/shared/primer-hand.css` does not follow it.
   - `assert.deepEqual(faults, [])`.
   - Red at commit 1 on its assertion: the Writing Room's built page links neither (main's `extraCss`), so the fault names `/writing-room/`. No stub: the test reads the built page. Read on the press's own build, `dist/writing-room/index.html`: main's links `/shared/fonts.css, /shared/motion.css, /shared/house.css, /shared/atelier.css, /shared/chart-of-the-atelier.css, /shared/slide-away.css, /shared/chart-stage.css, index.css, /shared/shell.css` (`out/1253-dry-run/1253-pr2-links-main.log`); the two-line spike's carry `/shared/primer-marks.css, /shared/primer-hand.css` after `chart-of-the-atelier.css` (`out/1253-dry-run/1253-pr2-links-spike.log`).
   - Mutations: `/shared/primer-hand.css` dropped from the Writing Room's `extraCss`; the two sheets swapped in it.
2. `test/site/app-bundles.test.ts`, **PK16**, its room clause over `HAND_ROOMS` (Files).
   - Red at commit 1 on its assertion: on main the Writing Room's bundle reaches no file naming `/primer/steps.json` (`out/1253-dry-run/1253-pr2-chunks-main.log`: `writing-room/app.bundle.js` reads `hand: false`; the spike's reads `true`).
   - Mutation: the Writing Room's import and boot call deleted.
3. `test/site/primer-hand-watch.test.ts`, **PK19** "PK19 watchUse counts a form sent from inside it as a press of the press it holds, and as a change of a field it holds only once that field has changed since the hand armed: Enter in the Writing Room's box seals the name step at once and the commission once its sentence is the reader's own, and a form holding no watched control seals nothing (Issue #1253 pull request 2)". Under linkedom, with the file's `armed`, and `FORMS` being `<form id="wr-form"><textarea id="wr-line">a preset sentence</textarea><button type="submit">Found</button></form><form id="other"><input id="x"></form>`:
   - `armed("writing-room-your-word", FORMS)`: `fire("#other", "submit")` leaves `calls()` 0 ("a form with no watched control"); `fire("#wr-form", "submit")` makes it 1 ("Enter in the box is a press of Found").
   - `armed("writing-room-commission", FORMS)`: `fire("#wr-form", "submit")` leaves it 0 ("the preset sentence sent unchanged"); then the textarea's `value` set to `a sentence of the reader's own` and `fire("#wr-form", "submit")` makes it 1 ("the reader's own sentence sent").
   - `armed("writing-room-your-word", FORMS)`, then `stop()`, then `fire("#wr-form", "submit")`: 0 ("after stop").
   - `armed` arms the watcher on the document it builds, so the textarea's preset value is read at arming, as the hand reads it after the room's first draw.
   - Red at commit 1 on the second assertion (`watchUse` as on main has no `submit` listener, so the count stays 0). No stub: the function exists with its signature. Read by `node out/1253-dry-run/1253-pr2-pk19.ts main` and `... spike` (`out/1253-dry-run/1253-pr2-pk19.log`), the five assertions over main's module and the spike's: main counts `0, 0, 0, 0, 0` (the second and fourth fail), the spike `0, 1, 0, 1, 0` (all pass).
   - Mutations: the `submit` listener deleted (reds the second and the fourth assertions); its match widened to any form (the `form.matches(...) || form.querySelector(...)` clause dropped, reds the first); the value check dropped (the `(w.event !== "change" || ...)` clause removed, reds the third: the unchanged sentence seals); `stop()` not removing it (reds the fifth).

The prover owes BP-H1, PK16's room clause and PK19, against the mutations named. PK1 to PK18 and PH1 to PH8 do not change.

**No browser check is added** (ruling D1), so no ledger line is owed.

## Order of commits

1. The archived plan, `handbook/plans/1200/1253/1253-pr2-plan.md` (this file, unchanged), with `HAND_ROOMS`, BP-H1, PK16's room clause and PK19, each red on its assertion. Then push.
2. The Writing Room's two lines and its two sheets (BP-H1 and PK16 green).
3. `watchUse`'s `submit` listener (PK19 green).
4. `git merge origin/main` (workflow step 10), then the evidence.

## Rosters and doctrine

- **`HAND_ROOMS`** in `test-support/hand-steps.ts` is a new roster: the rooms whose script boots the hand. BP-H1 and PK16 read it. Each later room's pull request appends its route (a Rosters line in its plan).
- **The page's sheet list**: `test/site/astro-scaffold.test.ts`'s head tests pin `chart-stage.css` as the sheet just before a page's own and `shell.css` last; the Writing Room's array keeps both. Its `ROADS` reads the room's authored `#wr-explorer` (`"writing-room/index.html": [{ id: "wr-explorer", gold: true, href: "../explorer/" }]`), which this pull request does not touch.
- **The sheets join no other list**: they already stand on disk and in the stylesheet lint (`sheetsOnDisk()`), and not in `HOUSE_SHEETS`, since not every page links them.
- **No spec line changes.** The rulebook's second exception, the explorer-doctrine `step` key line and the ui-design paragraph are written for every room (recon: CURRENT). `handbook/specs/ui-design.md`'s paragraph does not name the rooms the hand is taught in, and this plan adds no such list there: `HAND_ROOMS` is the list, and the code is the record.
- **No new suite, bundle entry or e2e helper** (ruling D1); `e2e/support/suites.ts` unchanged.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`). The planner's `npm test` over the spike (the two wiring lines, the first form of `watchUse`'s `submit` listener and D3's throwaway arms; the listener's value check, added after, changes only the inside of the `submit` handler, which no test on main dispatches) read 4084 pass, 0 fail, exit 0 (`/private/tmp/claude-501/-Users-ahl-CodeProjects-Vellum/5fbd4015-d487-49de-a4fd-007109c94984/scratchpad/1253-pr2-unit-spike.log`), so no bundle, chunk or head test reds over the re-cut or the sheet list.
- `npm run build`, then, one at a time, `VELLUM_E2E_SUITES=primer-writing-room npm run test:e2e` (the room's drift walk, which arrives with no key, over the re-cut boot), `VELLUM_E2E_SUITES=writing-room npm run test:e2e` (the room's own suite, WR1 to WR8, over its new sheets and boot) and `VELLUM_E2E_SUITES=primer-explorer npm run test:e2e` (the hand's browser checks, PH5's use path over the changed `watchUse`, and the Explorer's boot over the re-cut). Never the full local lanes.
- `vellum-plate-reader` is owed at step 11 (the deliverable is an appearance, ruled from stills): the six steps arriving at 1024 by 768 and 1280 by 800, the write and plate steps done, on the antique ground and the vegetation plate, with contrast sampled from pixels and the founding by Enter on the name step shown sealed.
- No still judge comparison: nothing here changes how the engine draws a world sheet.
- No step seconds are owed: no browser check is added or made longer (ruling D1).

## Calls made

Numbered on from pull request 1's C1 to C26.

- **C27** The stills and the plate read show the antique dress and the vegetation plate, not four dresses. Rule: the room draws every chart `style: "antique"` (`draw()` in `src/site/writing-room/app.ts`, `grep -rn style src/site/writing-room/`), and its only other ground is the plate a reader lays on; a dress forced through a probe would be one no reader sees.
- **C28** The hand boots after the room's first founding is drawn, on the line after `settled++` in `draw()`. Rule: the issue's "each room's script calls the hand once its first draw settles", the Explorer's `bootHandOnce` after `landDraw` as the precedent, and C1's arrival reads taken after the room's own arrival. A founding refused or a draw that fails boots no hand (C6: the hand never stands on a room that did not draw).
- **C29** No browser check reads the arrival seal in this room. Rule: Alex dropped PH3, whose ground PK14 holds against a stand-in (Issue #1253 comment 6869932050), and the ground is the same here.
- **C30** The note seats as ruled for every room, appended last to `header.chrome` (Issue #1155 comment 6754142680, item 5), and its width is read against the founding slip, 620 at 1280 and 590.4 at 1024. Rule: PR 1's `noteWidth` and `refitOnChrome`, which this room reaches through `bindZoomRoom`.
- **C31** The press onward keeps PR 1's rule: the next step's first marked phrase. In this room that reads `Next, Found ›` after steps 1 and 2, and `Next, Lay on The Vegetation Plate ›`, the longest, after step 3. Rule: C4 and Issue #1251's ruled "Next, <word> ›"; the words are the post-use review's (Issue #1258), and the plate read measures that the row keeps one line at 1024.
- **C32** `HAND_ROOMS` in `test-support/hand-steps.ts` is the one list of rooms the hand is taught in. Rule: a helper shared by tests lives in `test-support/` (`vellum-footguns` Gate 1 item 8), and two tests reading two lists would drift.
- **C33** The hand's page coordinates are reused unchanged. Rule: PR 1's "each later room's plan reads its body's containment"; the Writing Room is a staged chart room and its body reads `contain: layout` at both widths (part A).
- **C34** Issue #1382 and Issue #1258's findings stay on their issues: the two from pull request 1 (comment 6869564140) and this room's, the manicule's crowding and the halo grazes, which the dispatcher added there as comment 6870849702 under ruling D3. Rule: neither issue is this room's to settle, and this room's `then` reads are ones on which `factsOf` and `FACTS` agree (Recon).
- **C35** The pull request leaves Issue #1253 open, its body carrying the closing-reference line in `.github/PULL_REQUEST_TEMPLATE.md`'s form for an issue a pull request deliberately leaves open, and `gh pr view <N> --json closingIssuesReferences` reads `[]`. Rule: M1, seven rooms remain.
- **C36, ruled** ("Load it always, as built", Alex, comment 6870840753). The Writing Room imports the hand statically, as the Explorer does, and its boot grows by 16,503 bytes (5,558 gzipped) on every visit, with a key or not. The call's rule was PR 1's merged design, M2 having ruled the steps, not the hand's code, on demand; Alex confirmed it with the corrected weight in front of him. PR 1's own estimate of the cost (2,520 bytes) was a stand-in's and is corrected above.

## Open decisions

None. The five items put to Alex at the STOP are ruled (Rulings, below).

## Stop conditions

Hand back, rather than adapt, when:
- a symbol, line or file named here is not where the plan says: `settled++` and `onDrawn()` in `draw()` of `src/site/writing-room/app.ts`, the `extraCss` line of `src/pages/writing-room/index.astro`, `watchUse` and `useWatches` in `src/site/shared/primer/`, PK16's last clause, `armed` in `test/site/primer-hand-watch.test.ts`, `page` and `documentOf` in `test/site/built-pages.test.ts`;
- a red at commit 1 is on anything but the assertion named (a missing module, a build that fails, linkedom refusing a `submit` event);
- `npm test` reds a file this plan does not name, above all a bundle or chunk test over the press's re-cut, or a head test over the sheet list;
- the `primer-writing-room`, `writing-room` or `primer-explorer` suite reds;
- the plate read at step 11 finds a horizontal scroll at 1024 or 1280, the note's row on two lines, the note over the founding slip or the corner, the ring off a control it names, the ring's carrying line, the note's sentence or the manicule's carrying edge under 4.5:1 against its ground (the step 6 sitting read them at 9.0 to 12.1:1: the walnut line over the slip and the gold over the desk and the press row, the sentence on its panel, the outline over the slip and the fill over the desk), or the name step not sealed after a founding by Enter;
- `git merge origin/main` conflicts in a file this plan names (Sub 8 or Issue #1378 among them, below).

## Lanes beside this one

- **Issue #1378** (a planner on `src/society/names.ts` and its test): no file this plan names. No reading here quotes a place name.
- **Sub 8, Issue #1254** (the "learn this room" press on every room's trail line), not started, meets this one in three places. Whichever pull request lands second merges them:
  - `src/pages/writing-room/index.astro`'s `extraCss` line, if Sub 8 links a sheet per page;
  - `header.chrome`: Sub 8's press stands on a line of its own under the trail (Issue #1155 comment 6754142680, item 3), and the hand's note, appended by script after the room draws, stays the cluster's last child;
  - the chart's height: the two together make the head cluster taller again. The seats round measured the Explorer at 444 by 342 at 1024 with both; the Writing Room has not been measured with both, and Sub 8's plan owes that reading.

## Found while planning, not this pull request's

- **The note's done row overflows the note in the Explorer at 1024** (PR 1, shipped). On `explorer-to-print`, sealed on arrival, the row's `Next, Read the journal in The Reading Room ›` runs 47.1 px past the note's right edge (the note 495 wide, the row 473), the note grows to 228.88 px tall with its sentence one word to a line, and the chart keeps 33% of its area (`out/1253-pr2/11a-explorer-print-as-built-1024.png`, `out/1253-pr2/table-note-and-sheet.md`). The hand's sheet gives the note `grid-template-columns: 1fr auto` and the row's presses `white-space: nowrap`; that these are the cause is the planner's reading of the sheet, UNVERIFIABLE here since no arm was staged to test it. The Writing Room's longest row fits its 590-wide note, so this pull request does not meet it. The dispatcher filed it as Issue #1385; this pull request does not touch it.

## Rulings

Alex, 2026-11-13 (https://github.com/ahl-gram/Vellum/issues/1253#issuecomment-6870840753), quoted as he picked them, each the planner's recommendation, ruled from the stills in the main checkout's `out/1253-pr2/` (its page `out/1253-pr2/index.html`):

- **D0, the look:** "Build as shown (Recommended)", provisional until the review after use. The plan as written: the hand's dress unchanged from pull request 1, the note costing the chart 23 to 42% of its area as The design measures it.
- **D1, browser checks:** "No browser check (Recommended)": two fast checks (the page links the hand's sheets; the room's bundle reaches the hand), no browser check of the hand in this room. BP-H1, PK16's room clause and `HAND_ROOMS`; no e2e file changes.
- **D2, Enter in the sentence box:** "Enter counts as Found (Recommended)": a form sent counts as a press of its press; the commission still waits for a sentence the reader changed. `watchUse`'s `submit` listener with its value check, and PK19.
- **D3, where the hand stands when its spot is taken:** "Leave it, review later (Recommended)", in every room, added to the post-use review (Issue #1258). The manicule's seat unchanged; the dispatcher posted the crowding and this room's halo grazes on Issue #1258 as comment 6870849702.
- **D4, the three steps that assume the lesson's sentence:** "Leave it, file an issue (Recommended)". The ladder unchanged here; the dispatcher filed it as Issue #1384.
- **The hand's code weight** (call C36): "Load it always, as built". The static import, as in the Explorer.

The Explorer's done row overflowing its note at 1024 (Found while planning) is filed by the dispatcher as Issue #1385, outside this pull request.
