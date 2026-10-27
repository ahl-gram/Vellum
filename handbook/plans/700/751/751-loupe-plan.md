# Issue #751, pull request 2 of 2: the loupe (item 2)

**Planned at**: `origin/main` 362bc97ac0bcdbc2f5384a01893a7f1ea818c7b3 (PR #939, the hold, merged); Issue #751 comments read: 24 (rulings 6290020119, 6294057677, 6298290167, 6301450487, 6303584501, 6304534145 and, on this plan's menu, 6309513150; calls 1 to 46 in 6290477957, 6294437878, 6302096245, 6304368990, 6305220897 and 6305473745; and eleven plan archives, 6290083534, 6290084835, 6294059095, 6294060759, 6294062200, 6294063735, 6294065310, 6301487425, 6301488653, 6301489913 and 6301491364, copies of plans and no rulings). Planner: `vellum-planner` (claude-opus-5-5[1m]), 2026-10-20; re-recorded 2026-10-21 after folding the rulings on this plan's menu (comment 6309513150): `origin/main` unmoved, 24 comments.
**Supersedes**: the first loupe plan, `751-loupe-plan.md`, archived as comment 6290084835 and never built. It was written before pull request 1 merged: it placed its checks after ZH7, sized the lens's copy of the sheet from whole pixels (`offsetWidth`, measured below as 5 px off at 24 times), added about 12 lines to `src/site/explorer/app.ts` (which then read 387 and now reads 396 of the lint's 400), read the turned sheet with a second copy of the hold's predicate, let the whole lens take a finger where the sitting showed a grip, and guarded the lens's region sheet by comparing two style strings. Nothing of it is assumed here that this plan does not restate.
**Archived as**: `handbook/plans/751/751-loupe-plan.md` (free on main: `ls handbook/plans/751/` lists `751-plan.md`, `751-r1-plan.md`, `751-r2-plan.md`).
**Rulings**: Alex's step 6 rulings, 2026-10-20, https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6290020119; this pull request's are rulings 5 to 8: ruling 5, "the loupe", held on the L key; ruling 6, 240 px across, two times; ruling 7, on a tablet the loupe appears mid-map with a small grip under it, dragged with a finger, answering a finger only while the map is in hand (the sitting's option "drag it by its grip", still `D1-touch-drag-1024x768.png`); ruling 8, a button in the zoom column that turns it on and off, plus holding L on a computer. Like every feel call on this issue, provisional until he has used the feature live. The later rulings (6294057677, 6298290167, 6301450487, 6303584501, 6304534145) are the hold's and bind this pull request only through what pull request 1 built. Then Alex's rulings on this plan's menu, 2026-10-21, https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6309513150: **D1 (a)**, L works once the map has been clicked or dragged, like plus, minus and the arrows, and does nothing right after a press of the magnifier button or typing in the seed box until the map is clicked once; **D2 (b)**, the magnifier button is ignored while a new world is being drawn or the sheet is turning, like the anchor, and a screen reader announces it as unavailable for that window. Calls 47 to 66 stand for him to overrule, call 52 (the lens stands aside while a world is in motion) kept as planned. Both rulings are folded below, under "Rulings folded".
**Open decisions**: none.

## What was measured, and what it rests on

Every number here was measured by the planner on 2026-10-20 in the harness's own browser (headless Chromium, the Brave build `findBrowser` picks), device pixel ratio 1, against a build of `origin/main` at 362bc97a with candidate code injected or drafted and never committed. The probes are in the scratchpad beside this plan, each run from a folder `out/751-loupe/` inside a tree with `node out/751-loupe/<name>.ts dist out/751-loupe <port> ...` (their first lines give the usage): `751-loupe-probe-lens.ts`, `751-loupe-probe-card.ts`, `751-loupe-probe-int.ts`, `751-loupe-probe-touch.ts`; tables `751-loupe-lens-harness.json` and `751-loupe-lens-1024.json`. The drafted code is the scratchpad folder `751-loupe-fmt/`, and every code block below is its text.

1. **The lens against the camera, by paint.** A 240 px lens at power 2 was injected and its central 140 by 140 px patch compared with the camera's own paint at twice the depth about the same point (the camera transform `k' = 2k`, `x' = lx - (lx - x) * 2`), by the normalised correlation of luminance at the best shift within 8 px. Arms, at the harness window (the sheet laid out 792.59375 by 611.84375) and at 1024 by 768 (536.59375 by 414.21875), over four world points at k = 1 and five region points at k = 6.5 and 12 held (so the camera compared at 13 and 24):
   - **A, the design below** (the copy laid out at the gesture box's own fractional size times `k * power`, the region sheet placed in it by a transform in the copy's container units): best shift within 1 px everywhere, correlation 0.84 to 0.99, the camera patch's luminance spread 17 to 46.
   - **O, the first plan's sizing** (`offsetWidth`, whole pixels): on the region sheet 3 px off at 13 times and 5 to 6 px off at 24 times (correlation at that shift 0.86 to 0.99), since the box's fraction (0.41 px here) is multiplied by `k * power` and by how far across the sheet the point lies. On the world sheet at 2 times, within 1 px.
   - **B, no power** (the copy at the camera's depth): correlation at most 0.17 at any shift.
   - **C, the region sheet left at the copy's origin**: at most 0.07.
   - **D, a scaled copy** (a W by H layer under `scale(k * power)`, the region sheet placed by percentages): 2 px off at 13 times, 3 to 4 px at 24 times, which is pull request 1's multiplied rounding.
   - **E, the region sheet placed by percentages inside the sized copy**: the same as A, within 1 px: in a sized copy nothing multiplies a rounding.
2. **The lens and a place card.** A town's card shows on hover. With the lens centred on a town's hit, the lens covers 15 to 18 percent of the card at k = 1 (14 towns) and 22 to 26 percent on a band-3 sheet at k = 6.5 (9 hamlets). Centring the lens on a town's LABEL opens that town's card for 7 of 13 towns at k = 1 and for 0 of 9 at band 3 (`751-loupe-probe-card.ts`).
3. **The drafted code, driven the way the checks below drive it** (`751-loupe-probe-int.ts`, `751-loupe-probe-touch.ts`, over a build carrying the drafts): the lens seats in `#map-viewport`, 240 by 240 and centred on the pointer to 0 px, pointer-events `none`, the press lit `rgb(255, 247, 228)`, printed as `display: none`; hidden mid-turn with the pointer still; with ruling D2 (b) built (re-run 2026-10-21), two presses mid-turn left it lit (`aria-pressed` `"true"` after each) with `aria-disabled="true"` beside the hold's `"true"`, and once the world had landed the lens showed, still lit, with `aria-disabled="false"`, as it reads at rest; a new world image after the turn and the old url refused by `fetch`; hidden on the verso and through the turn back, shown once the leaf lands; held L shows it at the pointer, at the chart's centre with the pointer off the chart, and the keyboard leaving the map lets it go; hidden over the card, shown again off it; the survey track copied with its own points and `stroke: rgb(74, 56, 38)`, and the copy gone when the lens goes. On a 1024 by 768 tablet: the lens centred on the gesture box, its body at pointer-events `none` and its grip `auto` in hand and `none` out of it; a one-finger drag from the grip moved the lens 60 px with the camera's `x`, `y` and `k` unchanged; a double tap on the grip left `k` at 2; a one-finger pan begun on the lens's body moved the camera 50 px and left the lens where it stood on screen. The registration read on the real lens: world at 2 times shift (0, 0) correlation 0.976; region at 24 times shift (-1, 0) correlation 0.922. Local seconds: ZL1 0.26, ZL2 4.1, ZL3 2.1, ZL4 0.4, ZL5 0.6, ZL6 1.6, ZG11 2.0. Two things the probe changed: the press's centre is its glyph span, so reachability reads `press.contains(document.elementFromPoint(...))`; and after the sheet turns back from the verso the lens returns on Chrome's synthetic `pointerenter`, not a `pointermove`, so the hands listen to both.
4. **The drafts pass the house's instruments.** With every file below in a tree: `prettier --check`, `eslint` over `src/site/explorer/` and the new sheet, and `tsc --noEmit -p tsconfig.json` all clean (the plan skeptic re-ran all three on its own copy). Lint-counted lines after the change, with both rulings built and re-measured 2026-10-21: `app.ts` 398 (from 396), `app-wiring.ts` 173 (`pageGlass` 39), `glass.ts` 218 (`createGlass` unchanged at 48), `lod-controller.ts` 321, `world-motion.ts` 28, `verso.ts` 180, `loupe-view.ts` 24, `loupe.ts` 133 (`createLoupe` 35), `loupe-bind.ts` 132 (`bindLoupe` 34), `loupe-page.ts` 46. `zoom-controller.ts` gets nothing (396 stands).
5. **The built markup of two slotted presses is adjacent**: a build with both presses wrote `...&#65038;</button><button id="zoom-loupe" class="zoom-btn loupe-btn" type="button" aria-pressed="false" aria-label="The loupe"><span class="loupe-glyph" aria-hidden="true"></span></button>` on the same line, the `slot` attribute dropped.
6. **Lane A's room**: `MEASURED_SECONDS` totals 1921.7 s, lane A 530.5 s, so `(0.3 * 1921.7 - 530.5) / 0.7` = 65.7 s of room (recon); with zoom at the dispatcher's 200.2 s for lane A's last read instead of the committed 192.3, about 58 s.
7. **Other browsers: UNVERIFIABLE.** Everything here is Chromium; Alex uses Brave.
8. **What the menu's options state, run on the drafts** (`751-loupe-probe-menu.ts`, the harness window): with L heard while the map has the keyboard (D1 (a)), L over the map showed nothing after a real click on the loupe's own press (the press keeps the keyboard) and nothing after the seed box had it; it showed the lens after a real click on open sea on the map and after a drag on the map (the gesture box takes the keyboard on a press). With a town's hit holding the keyboard and L down, the lens showed; moving the keyboard to the seed box let it go (`focusout`; a `blur` listener on the box never fires there, since the box itself never had the keyboard). A draw of a new world kept the world in motion 519 ms (seed 7, from the press of Draw to the turn button's return), and a style change 1065 ms (1005 ms of it the sheet turning), locally; CI runners are slower.

## Specs

On top of `CLAUDE.md`'s table, at these sections:

- `handbook/specs/explorer-doctrine.md`: "The engine boundary and the host contract" (what may be mounted inside the chart mount; the host's listeners against the engine's; edited here); "The camera, the gesture and the fit" (the hold bullet, the touch press, Issue #778, a control inside the gesture box stops gesture propagation; edited here); "Counter-scale" (a box in the mount placed by a transform; edited here); "Overlay lifecycle" (the ghost's one url owner, the pattern for the loupe's; edited here).
- `handbook/specs/ui-design.md`: "The room and its furniture" (the Surveyor's Glass bullet, a toggle press lit when on, a new component's CSS in its own sheet; edited here); "Colour, contrast and legibility"; "Gesture"; "Motion and ceremony" (a piece seated by a transform takes the individual properties); "Print".
- `handbook/specs/cascade-traps.md`: whole file (an author `display` beats `[hidden]`; the house sheets dress every button).
- `handbook/specs/site-architecture.md`: "How a page is authored" (sheet order, `extraCss`, the rosters a sheet joins); "`MEASURED_SECONDS` is read from CI's own lane logs".
- `handbook/specs/settle-doctrine.md`: items 4 to 8, "The environment" (the touch rules, a visual claim carried by a same-run control, edited here; Enter and a key's `text`; a clip with a negative `x`).
- `handbook/specs/check-placement.md`: whole file.
- `handbook/specs/conventions.md`: "The fidelity rule"; "How code is cited"; "How a spec, and the rest of the house's prose, is written".
- `handbook/specs/development-workflow.md`: steps 8, 10, 11 and 15.

## The design

**A round lens over the chart that shows the patch under the pointer at twice the camera's depth, drawn from the sheets already drawn, so nothing reflows and nothing redraws.**

- **Where it lives.** One element, `div.loupe`, appended once to `#map-viewport` (the gesture box) as the page boots, hidden and `aria-hidden`; never inside `#map`, which a draw wipes and whose region insets may hold no inline svg of their own. The stage is a stacking context at `z-index: 1` with `overflow: hidden` (`body.chart-room .stage` in `src/styles/shared/atelier.css`), so the lens is clipped at the stage's edge and paints under every piece of chrome (the Glass, the slip, the legend row, the folios); it paints over everything in `#map`, cards included.
- **What it shows.** Inside a clipped circle, a layer `div.loupe-sheet` holds `img.loupe-world`, an object url of the world sheet's own svg string as the worker drew it (`lastSvg` in `src/site/explorer/app.ts`), `img.loupe-inset`, an object url of the committed region sheet's svg string, and, while the survey track is inked, a copy of `#map > .voyage-overlay` (an id-less sibling svg whose dress is the bare `.voyage-track`, `.voyage-ship` and `.voyage-rider` rules in `src/styles/shared/living-chart.css`, so the copy keeps its dress). Hits, the card, the pencil, the dog-ear, the region sheet's drop shadow and the arrival and redraft ceremonies are not drawn. An image keeps the sheets' ids out of the document; the chart faces are system families (`fontFamily` in `src/render/style.ts`), which an svg image renders as the inline chart does.
- **How the copy is laid out: at its final size, never scaled** (measured 1). The layer is the gesture box's own fractional size (`getBoundingClientRect`, never `offsetWidth`) times `k * power`, translated so the sheet point under the pointer sits at the lens's centre (`loupeView` in `src/site/explorer/loupe-view.ts`). The region sheet is placed in it by a transform in the layer's own container units, from the layer's origin (`.loupe-inset` in `src/styles/explorer/loupe.css`, its rect published as `--ix`, `--iy`, `--iw`, `--ih`), which is pull request 1's placement rule carried into the copy.
- **One owner of its urls.** `svgUrl` in `src/site/explorer/loupe.ts` holds one sheet string and its url; the same string returns the same url and calls nothing, a new one revokes the last and mints the next. The lens holds two, world and region.
- **Its press (ruling 8).** `#zoom-loupe` in the Glass, after the hold, lit by the corner's lifted toggle dress while on. Ruled D2 (b): like the hold, the press is ignored while `createMotion`'s `busy` holds (a world being drawn, or the sheet mid-turn) and carries `aria-disabled` for exactly that window, `"true"` in it and `"false"` outside it once the first draw has begun, written beside the hold's by `createMotion`'s `sync`; no `disabled` attribute, which would dress a zoom press no sheet dresses (call 32 of pull request 1).
- **Its key (ruling 8).** Holding L shows the lens while the key is down. Ruled D1 (a): L is heard while `#map-viewport` or something inside it has the keyboard, as the Glass's other keys are, so a click or a drag on the map is what readies it. Both the press and the key are bound by `bindLoupe` in `src/site/explorer/loupe-bind.ts`.
- **Where it shows (desktop).** Under the pointer while the pointer is over the chart; hidden when the pointer leaves it. A held L with no pointer over the chart shows it at the chart's centre.
- **When it stands aside.** While `createMotion`'s `busy` holds (a draw in flight, or the sheet mid-turn) and while the sheet is off its recto (turned to the verso, or turning between the two faces: `offRecto`, a new export of `src/site/explorer/verso.ts`, reading the `flip3d` class the flip owns); and, on a computer, while the pointer is over a shown place card, elsewhere covering whatever part of a card lies under it (measured 2). `createMotion` gains `watch`, so the lens is re-placed at every change of the predicate's drivers and of the sheet's class, with no second observer.
- **Its touch form (ruling 7, the sitting's "drag it by its grip").** Where touch is the main pointer (`pageTouchEnv().device`), the lens carries `touchable` and its grip; each lighting places it at the gesture box's centre. Only the grip takes a finger, and only while the chart is in hand (`#map-viewport.zoomable .loupe.touchable .loupe-grip` sets `pointer-events: auto`), its touch target grown past its drawn 2.4 by 0.9 rem to at least 24 px tall by a transparent pseudo-element; a finger on the lens's body reaches the chart beneath, so the chart pans and pinches under a lens that stays where it stands. The grip stops and prevents the touches it is dragged by, so the camera never sees them, and stops `mousedown`, `dblclick`, `wheel`, `touchend` and `touchcancel` as the dog-ear does; the drag keeps the lens's centre inside the gesture box. On a tablet the card does not set the lens aside: no pointer rests on a card there, and the lens moves only by its grip.
- **Size and power (ruling 6).** `LOUPE_DIAMETER = 240` and `LOUPE_POWER = 2` in `src/site/explorer/loupe.ts`, the one home of each; the diameter is written inline from the constant, so the sheet carries no copy.
- **Its look: the sitting's.** The rings, the shadow, the paper ground, the grip and the press's glyph are the ones the sitting's stills showed (the fidelity rule; call 48): `/Users/ahl/CodeProjects/Vellum/out/751/C3-loupe240x2-k1-crop.png`, `/Users/ahl/CodeProjects/Vellum/out/751/C6-loupe240x2-band3-k6.5-crop.png`, `/Users/ahl/CodeProjects/Vellum/out/751/D1-touch-drag-1024x768-crop.png`, `/Users/ahl/CodeProjects/Vellum/out/751/B5-both-presses-broadside-folded-1024.png`.
- **The page's wiring** lives in a module of its own, `src/site/explorer/loupe-page.ts` (`pageLoupe`), called from `pageGlass`; `app.ts` gains the press's lookup and a getter for `lastSvg`, two lines.

**Byte identity and the golden: nothing moves.** No renderer, engine or world file changes; no regen, no golden, no re-roll.

**Rejected, with the reason:**

- *A copy scaled by a transform* (a W by H layer under `scale(k * power)`). Measured D: the region sheet's percentage rounding is multiplied, 3 to 4 px at 24 times; and an svg image under a scale is rasterised by a path the sitting never measured for sharpness.
- *The copy sized in whole pixels* (`offsetWidth`, the first plan). Measured O: 5 to 6 px off at 24 times.
- *Clone the chart's svg DOM into the lens.* Duplicates every id the sheet's `<use>` elements resolve and doubles what a style recalc walks; a suite reading `#map svg` could meet the copy.
- *Draw the patch into a canvas per move.* The image is already as sharp as the camera (the sitting's crispness control, 98.8 percent of the camera's steepest step).
- *The whole lens taking the finger* (the first plan). The sitting's option was "drag it by its grip" (`/Users/ahl/CodeProjects/Vellum/out/751/notes.md`, its question 7), and a 240 px disc that took every touch would swallow the pans, pinches and town taps landing on it while the chart is in hand.
- *A second `MutationObserver` on the sheet for the lens.* Pull request 1 made `createMotion` the one home of the predicate; a second observer would be a second copy of half of it.
- *Hide the lens whenever a card shows.* Measured 2: at rest it would hide the lens over 7 of 13 town names, the labels the loupe exists to read.
- *Stand aside on `versoed` alone.* The turn back from the verso drops `versoed` at its start and rotates for 1.2 s more, during which the gesture box's rect is a projection and a placed lens would land off its point; `flip3d` spans both turns and the verso.
- *Keep the wiring in `app-wiring.ts`.* `vellum/split-arguments-by-name` (`scripts/lint/split-arguments.ts`) requires a call to a function declared in that file to hand each value under its parameter's own name, which a built deps object does not; a module of its own also keeps `pageGlass` at 39 lines.

## Files

Line counts are the lint's (blank and comment lines skipped). No file reaches 400 and no function 50. Every code block below is the exact text to write; each passed `prettier --check`, `eslint` and `tsc` as written (measured 4), with both rulings built.

### Created

**`src/site/explorer/loupe-view.ts`** (24 lines):

```ts
// The loupe's geometry (Issue #751): the sheet point under the pointer sits at the lens centre, the copy magnified by the camera's depth times the power.
export interface LoupeInput {
  readonly at: { readonly x: number; readonly y: number };
  readonly box: { readonly width: number; readonly height: number };
  readonly zoom: { readonly x: number; readonly y: number; readonly k: number };
  readonly diameter: number;
  readonly power: number;
}

export interface LoupeView {
  readonly lens: { readonly x: number; readonly y: number };
  readonly sheet: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
}

export function loupeView(i: LoupeInput): LoupeView {
  const r = i.diameter / 2;
  const s = i.zoom.k * i.power;
  return {
    lens: { x: i.at.x - r, y: i.at.y - r },
    sheet: {
      x: r - (i.at.x - i.zoom.x) * i.power,
      y: r - (i.at.y - i.zoom.y) * i.power,
      w: i.box.width * s,
      h: i.box.height * s,
    },
  };
}
```

`at` is in the gesture box's own coordinates (the client point less the box's `left` and `top`).

**`src/site/explorer/loupe.ts`** (133 lines):

```ts
// The loupe (Issue #751): a lens in the gesture box, never in the chart mount, showing the drawn sheets through object urls this module alone mints and revokes.
import { loupeView } from "./loupe-view.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { SheetRect } from "../../world/lod.ts";

export const LOUPE_DIAMETER = 240;
export const LOUPE_POWER = 2;

export interface SvgUrls {
  readonly create: (svg: string) => string;
  readonly revoke: (url: string) => void;
}

export interface LoupeSheets {
  readonly world: string;
  readonly inset: { readonly svg: string; readonly rect: SheetRect } | null;
}

export interface LoupeDeps {
  readonly host: HTMLElement;
  readonly mapDiv: HTMLElement;
  readonly zoom: () => ZoomState;
  readonly sheets: () => LoupeSheets | null;
  readonly urls: SvgUrls;
  readonly touchable: boolean;
}

export interface Loupe {
  readonly lens: HTMLElement;
  readonly grip: HTMLElement;
  readonly show: (at: { readonly x: number; readonly y: number }) => void;
  readonly hide: () => void;
}

type Parts = {
  lens: HTMLElement;
  sheet: HTMLElement;
  world: HTMLImageElement;
  inset: HTMLImageElement;
  grip: HTMLElement;
};

export function svgUrl(urls: SvgUrls): (svg: string) => string {
  let svg = "";
  let url = "";
  return (next) => {
    if (next === svg) return url;
    if (url) urls.revoke(url);
    svg = next;
    url = urls.create(next);
    return url;
  };
}

function part<T extends HTMLElement>(tag: string, cls: string): T {
  const el = document.createElement(tag) as T;
  el.className = cls;
  return el;
}

function buildLens(touchable: boolean): Parts {
  const lens = part("div", touchable ? "loupe touchable" : "loupe");
  lens.setAttribute("aria-hidden", "true");
  lens.hidden = true;
  const glass = part("div", "loupe-glass");
  glass.style.setProperty("width", `${LOUPE_DIAMETER}px`);
  glass.style.setProperty("height", `${LOUPE_DIAMETER}px`);
  const sheet = part("div", "loupe-sheet");
  const world = part<HTMLImageElement>("img", "loupe-world");
  const inset = part<HTMLImageElement>("img", "loupe-inset");
  world.alt = "";
  inset.alt = "";
  inset.hidden = true;
  const grip = part("div", "loupe-grip");
  sheet.append(world, inset);
  glass.append(sheet);
  lens.append(glass, grip);
  return { lens, sheet, world, inset, grip };
}

function insetAt(img: HTMLElement, rect: SheetRect): void {
  img.style.setProperty("--ix", String(rect.x));
  img.style.setProperty("--iy", String(rect.y));
  img.style.setProperty("--iw", String(rect.w));
  img.style.setProperty("--ih", String(rect.h));
}

function trackCopy(mapDiv: HTMLElement, layer: HTMLElement): { readonly sync: () => void; readonly drop: () => void } {
  let source: Element | null = null;
  let points: string | null = null;
  let copy: Element | null = null;
  const drop = (): void => {
    copy?.remove();
    copy = null;
    source = null;
    points = null;
  };
  const sync = (): void => {
    const node = mapDiv.querySelector(":scope > .voyage-overlay");
    const now = node?.querySelector(".voyage-track")?.getAttribute("points") ?? null;
    if (node === source && now === points) return;
    drop();
    if (!node) return;
    copy = node.cloneNode(true) as Element;
    layer.append(copy);
    source = node;
    points = now;
  };
  return { sync, drop };
}

export function createLoupe(deps: LoupeDeps): Loupe {
  const p = buildLens(deps.touchable);
  deps.host.append(p.lens);
  const worldUrl = svgUrl(deps.urls);
  const insetUrl = svgUrl(deps.urls);
  const track = trackCopy(deps.mapDiv, p.sheet);
  const hide = (): void => {
    p.lens.hidden = true;
    track.drop();
  };
  const show = (at: { readonly x: number; readonly y: number }): void => {
    const s = deps.sheets();
    if (!s) {
      hide();
      return;
    }
    const world = worldUrl(s.world);
    if (p.world.src !== world) p.world.src = world;
    p.inset.hidden = !s.inset;
    if (s.inset) {
      const inset = insetUrl(s.inset.svg);
      if (p.inset.src !== inset) p.inset.src = inset;
      insetAt(p.inset, s.inset.rect);
    }
    const box = deps.host.getBoundingClientRect();
    const v = loupeView({ at, box, zoom: deps.zoom(), diameter: LOUPE_DIAMETER, power: LOUPE_POWER });
    p.lens.style.setProperty("translate", `${v.lens.x}px ${v.lens.y}px`);
    p.sheet.style.setProperty("width", `${v.sheet.w}px`);
    p.sheet.style.setProperty("height", `${v.sheet.h}px`);
    p.sheet.style.setProperty("translate", `${v.sheet.x}px ${v.sheet.y}px`);
    track.sync();
    p.lens.hidden = false;
  };
  return { lens: p.lens, grip: p.grip, show, hide };
}
```

Element properties are set only on `p`, a local, and helpers write through `setAttribute` and `style.setProperty`, because `no-param-reassign` (`props: true`, `eslint.config.ts`) refuses an assignment to a parameter's property.

**`src/site/explorer/loupe-bind.ts`** (132 lines):

```ts
// The loupe's hands (Issue #751): its press, its held key, the pointer it follows and, where touch is the main pointer, the finger that drags it by its grip while the chart is in hand.
import type { Loupe } from "./loupe.ts";

export const LOUPE_KEY = "l";

export interface KeyLike {
  readonly key: string;
  readonly repeat: boolean;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface LoupeBindDeps {
  readonly press: HTMLElement;
  readonly viewport: HTMLElement;
  readonly loupe: Loupe;
  readonly cardRect: () => Box | null;
  readonly standing: () => boolean;
  readonly busy: () => boolean;
  readonly touchable: boolean;
}

export interface LoupeBinding {
  readonly follow: () => void;
}

type Point = { readonly x: number; readonly y: number };
type Hands = { lit: boolean; held: boolean; inside: boolean; client: Point | null; at: Point | null };

const MOUSE = new Set(["mouse", "pen"]);
const STOPPED = ["mousedown", "dblclick", "wheel", "touchend", "touchcancel"] as const;

export const loupeKey = (e: KeyLike): boolean =>
  e.key.toLowerCase() === LOUPE_KEY && !e.altKey && !e.ctrlKey && !e.metaKey;

const centre = (b: Box): Point => ({ x: (b.right - b.left) / 2, y: (b.bottom - b.top) / 2 });
const clampTo = (b: Box, p: Point): Point => ({
  x: Math.min(Math.max(p.x, 0), b.right - b.left),
  y: Math.min(Math.max(p.y, 0), b.bottom - b.top),
});
const within = (b: Box, x: number, y: number): boolean => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;

function whereAt(touchable: boolean, h: Readonly<Hands>, r: Box): Point | null {
  if (touchable) return h.at;
  if (h.inside && h.client) return { x: h.client.x - r.left, y: h.client.y - r.top };
  return h.held ? centre(r) : null;
}

function placer(deps: LoupeBindDeps, h: Readonly<Hands>): () => void {
  return () => {
    const r = deps.viewport.getBoundingClientRect();
    const at = whereAt(deps.touchable, h, r);
    const card = at && !deps.touchable ? deps.cardRect() : null;
    if (!(h.lit || h.held) || !at || !deps.standing() || (card && within(card, r.left + at.x, r.top + at.y))) {
      deps.loupe.hide();
      return;
    }
    deps.loupe.show(at);
  };
}

function pointerHands(viewport: HTMLElement, moved: (client: Point | null, inside: boolean) => void): void {
  const over = (e: PointerEvent): void => {
    if (MOUSE.has(e.pointerType)) moved({ x: e.clientX, y: e.clientY }, true);
  };
  viewport.addEventListener("pointerenter", over);
  viewport.addEventListener("pointermove", over);
  viewport.addEventListener("pointerleave", (e: PointerEvent) => {
    if (MOUSE.has(e.pointerType)) moved(null, false);
  });
}

function keyHands(viewport: HTMLElement, hold: (held: boolean) => void): void {
  viewport.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!loupeKey(e)) return;
    e.preventDefault();
    if (!e.repeat) hold(true);
  });
  viewport.addEventListener("keyup", (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === LOUPE_KEY) hold(false);
  });
  viewport.addEventListener("focusout", (e: FocusEvent) => {
    if (!viewport.contains(e.relatedTarget as Node | null)) hold(false);
  });
}

function dragHands(grip: HTMLElement, atNow: () => Point | null, moved: (at: Point) => void): void {
  let from: { readonly x: number; readonly y: number; readonly at: Point } | null = null;
  for (const type of STOPPED) grip.addEventListener(type, (e) => e.stopPropagation());
  const grab = (e: TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    const at = atNow();
    from = t && at ? { x: t.clientX, y: t.clientY, at } : null;
  };
  const drag = (e: TouchEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    const t = e.touches[0];
    if (t && from) moved({ x: from.at.x + t.clientX - from.x, y: from.at.y + t.clientY - from.y });
  };
  grip.addEventListener("touchstart", grab, { passive: false });
  grip.addEventListener("touchmove", drag, { passive: false });
}

export function bindLoupe(deps: LoupeBindDeps): LoupeBinding {
  const h: Hands = { lit: false, held: false, inside: false, client: null, at: null };
  const place = placer(deps, h);
  const follow = (): void => {
    if (h.lit || h.held) place();
  };
  deps.press.setAttribute("aria-pressed", "false");
  deps.press.addEventListener("click", () => {
    if (deps.busy()) return;
    h.lit = !h.lit;
    deps.press.setAttribute("aria-pressed", String(h.lit));
    if (h.lit && deps.touchable) h.at = centre(deps.viewport.getBoundingClientRect());
    place();
  });
  pointerHands(deps.viewport, (client, inside) => {
    h.client = client ?? h.client;
    h.inside = inside;
    follow();
  });
  keyHands(deps.viewport, (held) => {
    h.held = held;
    place();
  });
  if (deps.touchable)
    dragHands(
      deps.loupe.grip,
      () => h.at,
      (at) => {
        h.at = clampTo(deps.viewport.getBoundingClientRect(), at);
        place();
      },
    );
  return { follow };
}
```

The pointer is stored as a client point and turned into the box's coordinates only when the lens is placed, so a pointer move with the loupe off reads no layout; `follow` returns at once while the loupe is neither lit nor held. A key is let go on its letter whatever modifiers are down, so a modifier pressed mid-hold never strands the lens; and it is let go when the keyboard leaves the map, read from `focusout` and its `relatedTarget`, never from the gesture box's own `blur`, because L is often pressed while a town's hit inside the box has the keyboard, and then the box itself never blurs (measured 8). In d3-zoom 3.0.0 a touch gesture starts only in `touchstarted`, and `touchmoved` returns while no gesture is open, so `grab`'s stop alone keeps a drag from the camera and `drag`'s stop is a second wall (the plan skeptic's read of `node_modules/d3-zoom/src/zoom.js`); both are kept, and the proof rows below say which check holds each.

**`src/site/explorer/loupe-page.ts`** (46 lines):

```ts
// The loupe's page wiring (Issue #751): the Explorer's gesture box, its world in motion and its Glass, handed to the lens and to its hands.
import { createLoupe } from "./loupe.ts";
import { bindLoupe, type Box, type LoupeBinding } from "./loupe-bind.ts";
import { offRecto } from "./verso.ts";
import type { Glass } from "./glass.ts";
import type { Motion } from "./world-motion.ts";
import { pageTouchEnv } from "../shared/chart-touch.ts";
import { mapDiv, mapViewport, sheetEl } from "./elements.ts";

const SVG_URLS = {
  create: (svg: string): string => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
  revoke: (url: string): void => URL.revokeObjectURL(url),
};

const cardRect = (): Box | null => {
  const card = document.getElementById("place-card");
  return card && !card.hidden ? card.getBoundingClientRect() : null;
};

export interface PageLoupeDeps {
  readonly press: HTMLElement;
  readonly motion: Motion;
  readonly worldSvg: () => string;
  readonly glass: () => Glass;
}

export function pageLoupe(deps: PageLoupeDeps): LoupeBinding {
  const touchable = pageTouchEnv().device;
  const loupe = createLoupe({
    host: mapViewport,
    mapDiv,
    zoom: () => deps.glass().zoomState(),
    sheets: () => {
      const world = deps.worldSvg();
      return world ? { world, inset: deps.glass().committedInset() } : null;
    },
    urls: SVG_URLS,
    touchable,
  });
  const binding = bindLoupe({
    press: deps.press,
    viewport: mapViewport,
    loupe,
    cardRect,
    standing: () => !deps.motion.busy() && !offRecto(sheetEl),
    busy: deps.motion.busy,
    touchable,
  });
  deps.motion.watch(binding.follow);
  return binding;
}
```

The host reads the card by the id the engine assigns, as `setCardZoom` in `src/site/explorer/glass.ts` already does; `vellum/engine-no-id-lookup` covers only `src/site/shared/living-chart/`. `elements.ts` is DOM-bound at module scope, so no unit test imports this module.

**`src/styles/explorer/loupe.css`**, the loupe's own sheet, as a new component's CSS is (`handbook/specs/ui-design.md`):

```css
/* The loupe (Issue #751): a lens in the gesture box over the chart, ringed in ink, its copy of the sheet laid out at its final size so nothing in it is scaled. */
.loupe {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 6;
  pointer-events: none;
}
.loupe-glass {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: var(--chart-paper);
  box-shadow:
    0 0 0 2px var(--ink-dark),
    0 0 0 4px var(--parchment),
    0 0 0 5px var(--ink-dark),
    0 6px 18px rgb(from var(--chart-ink) r g b / 0.45);
}
.loupe-sheet {
  position: absolute;
  left: 0;
  top: 0;
  container-type: size;
}
.loupe-sheet img {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
}
.loupe-world {
  width: 100%;
  height: 100%;
}
.loupe-inset {
  width: calc(var(--iw, 1) * 100%);
  height: calc(var(--ih, 1) * 100%);
  transform: translate(calc(var(--ix, 0) * 100cqw), calc(var(--iy, 0) * 100cqh));
}
.loupe-grip {
  display: none;
}
.loupe.touchable .loupe-grip {
  display: block;
  position: absolute;
  left: 50%;
  top: calc(100% - 2px);
  translate: -50% 0;
  width: 2.4rem;
  height: 0.9rem;
  box-sizing: border-box;
  border: 2px solid var(--ink-dark);
  border-radius: 0.45rem;
  background: var(--parchment);
}
.loupe.touchable .loupe-grip::before {
  content: "";
  position: absolute;
  inset: -7px -8px;
}
#map-viewport.zoomable .loupe.touchable .loupe-grip {
  pointer-events: auto;
  touch-action: none;
}
.zoomery .zoom-btn.loupe-btn {
  position: relative;
}
.loupe-glyph {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.78rem;
  height: 0.78rem;
  margin: -0.5rem 0 0 -0.5rem;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-radius: 50%;
}
.loupe-glyph::after {
  content: "";
  position: absolute;
  left: 0.62rem;
  top: 0.62rem;
  width: 0.38rem;
  height: 2px;
  background: currentColor;
  rotate: 45deg;
  transform-origin: 0 50%;
}
@media print {
  .loupe {
    display: none;
  }
}
```

No rule sets `display` on `.loupe` or on the images outside print, so their `hidden` attribute keeps working (`handbook/specs/cascade-traps.md`); the grip is not toggled by `hidden`. The grip's `::before` makes its touch target 54.4 by 28.4 px (the drawn grip, 38.4 by 14.4 px, is unchanged). The other values are the spike's, which the sitting's stills show (`spike-751.ts`, kept in the main checkout's `out/scratch-751-planner/`).

**Tests**: `test/site/loupe-view.test.ts`, `test/site/loupe.test.ts`, `test/site/loupe-bind.test.ts`, and the part file `e2e/suites/zoom/loupe.ts` (below).

### Edited

- **`src/site/explorer/world-motion.ts`** (15 lines, 28 after): the return type becomes the exported `Motion`; the loupe's press joins the hold's (ruling D2 (b)); and `sync` marks both and calls every watcher:
  ```diff
  -export function createMotion(hold: HTMLElement): { busy: () => boolean; setDrawing: (on: boolean) => void } {
  +export type Motion = {
  +  readonly busy: () => boolean;
  +  readonly setDrawing: (on: boolean) => void;
  +  readonly watch: (fn: () => void) => void;
  +};
  +
  +export function createMotion(hold: HTMLElement, loupe: HTMLElement): Motion {
     let drawing = false;
  +  const watchers: (() => void)[] = [];
     const busy = (): boolean => drawing || sheetEl.classList.contains("turning");
  -  const sync = (): void => hold.setAttribute("aria-disabled", String(busy()));
  +  const sync = (): void => {
  +    hold.setAttribute("aria-disabled", String(busy()));
  +    loupe.setAttribute("aria-disabled", String(busy()));
  +    for (const fn of watchers) fn();
  +  };
  ```
  and the returned object gains, after `setDrawing`, `watch: (fn) => { watchers.push(fn); },` (Prettier lays it out over three lines). No write at boot, as call 44 of pull request 1 withdrew for the hold: before the first draw the attribute is absent, and every later state is written.
- **`src/site/explorer/verso.ts`**: after `isFlipped`, a new export:
  ```ts
  export function offRecto(sheetEl: HTMLElement): boolean {
    return sheetEl.classList.contains("flip3d");
  }
  ```
  (`flip3d` is added before `versoed` at a turn to the verso and dropped only once the leaf lands back on the recto, `flipToVerso` and `flipToRecto` in the same file.)
- **`src/site/explorer/glass.ts`** (215 lines, 218 after): `GlassDeps` gains `onView: () => void;` after `busy: () => boolean;`; in `glassCard`, `setCardZoom` calls `deps.onView();` after `deps.reclampCard();`, so every camera apply, every redraft rebuild and every `syncZoom` re-places a shown lens; `glassApi` gains `committedInset: () => lodController.committedInset(),` after `committedSurvey`. `createGlass` is untouched.
- **`src/site/explorer/lod-controller.ts`** (317 lines, 321 after): a method before `state()`:
  ```ts
    committedInset(): { svg: string; rect: SheetRect } | null {
      if (!inset || !world) return null;
      return { svg: inset.svg, rect: insetSheetRect(inset.window, margins()) };
    },
  ```
  (`SheetRect` and `insetSheetRect` are already imported; `createLodController` keeps its `max-lines-per-function` exemption.)
- **`src/site/explorer/app-wiring.ts`** (167 lines, 173 after):
  - imports gain `import { pageLoupe } from "./loupe-page.ts";` and `import type { Motion } from "./world-motion.ts";` after the `glass.ts` import;
  - `PageGlassDeps`: `readonly busy: () => boolean;` becomes `readonly motion: Motion;` and `readonly worldSvg: () => string;`; `readonly buttons: Parameters<typeof createGlass>[0]["buttons"];` becomes `readonly buttons: Parameters<typeof createGlass>[0]["buttons"] & { readonly loupe: HTMLElement };`;
  - `pageGlass`'s destructuring: `busy,` becomes `motion,` and `worldSvg,`;
  - first line of its body: `const loupe = pageLoupe({ press: buttons.loupe, motion, worldSvg, glass: () => glass });` (the closure reads `glass` only once the lens is lit, after construction, as `decorateInset` already reads it);
  - in the `createGlass` deps: `busy,` becomes `busy: motion.busy,` and `onView: () => loupe.follow(),`.
- **`src/site/explorer/app.ts`** (396 lines, 398 after; measured 4):
  - in `const buttons = {`, after `hold: $("zoom-hold"),`: `loupe: $("zoom-loupe"),` (the ids live in `app.ts`, `handbook/specs/explorer-doctrine.md`, the Glass wired by id);
  - in the `pageGlass({` call: `busy: motion.busy,` becomes `motion,` and the line after it `worldSvg: () => lastSvg,`;
  - `const motion = createMotion(buttons.hold);` becomes `const motion = createMotion(buttons.hold, buttons.loupe);`, the same line (ruling D2 (b)).
  Nothing else; no import changes (adding a name to the long `app-wiring.ts` import would make Prettier expand it, call 38).
- **`src/pages/explorer/index.astro`**:
  - inside `<Glass id="zoom-controls">`, after the `#zoom-hold` line: `  <button slot="presses" id="zoom-loupe" class="zoom-btn loupe-btn" type="button" aria-pressed="false" aria-label="The loupe"><span class="loupe-glyph" aria-hidden="true"></span></button>` (no `data-zoom`: `vellum/explorer-no-glass-keys`);
  - `extraCss` becomes `{["/shared/living-chart.css", "/explorer/broadside.css", "/explorer/chart-drawer.css", "/explorer/loupe.css"]}`;
  - `#map-viewport`'s `aria-label` becomes `"Interactive map. Arrow keys pan, plus and minus keys zoom, 0 resets, hold L for the loupe."`.
- **`e2e/support/pixel.ts`** (about 174 lines, about 210 after): after `luminance`, the registration read:
  ```ts
  export type Registration = { readonly dx: number; readonly dy: number; readonly ncc: number; readonly std: number };

  export function registration(a: Rgb[][], b: Rgb[][], search: number): Registration {
    const la = a.map((row) => row.map((p) => luminance(p)));
    const lb = b.map((row) => row.map((p) => luminance(p)));
    const n = la.length - 2 * search;
    const N = n * n;
    const at = (dx: number, dy: number): { ncc: number; std: number } => {
      let sa = 0;
      let sb = 0;
      let saa = 0;
      let sbb = 0;
      let sab = 0;
      for (let y = search; y < search + n; y++)
        for (let x = search; x < search + n; x++) {
          const p = la[y]![x]!;
          const q = lb[y + dy]![x + dx]!;
          sa += p;
          sb += q;
          saa += p * p;
          sbb += q * q;
          sab += p * q;
        }
      const va = saa - (sa * sa) / N;
      const vb = sbb - (sb * sb) / N;
      return {
        ncc: va > 0 && vb > 0 ? (sab - (sa * sb) / N) / Math.sqrt(va * vb) : 0,
        std: Math.sqrt(Math.max(0, vb) / N),
      };
    };
    let best = { dx: 0, dy: 0, ncc: -2 };
    for (let dy = -search; dy <= search; dy++)
      for (let dx = -search; dx <= search; dx++) {
        const { ncc } = at(dx, dy);
        if (ncc > best.ncc) best = { dx, dy, ncc };
      }
    return { ...best, std: at(0, 0).std };
  }
  ```
  Square patches only; `std` is the second patch's spread, the texture witness; a flat patch scores `ncc` 0, never `NaN`.
- **`e2e/suites/zoom/registration.ts`**: `async function ensureHeldDeepInset(` and `async function pollLast<T>(` each gain `export`. Nothing else.
- **`e2e/suites/zoom.ts`**: imports `zl1PressShowsLens`, `zl2StandsAsideInMotion`, `zl3LensRegisters`, `zl4HeldKey`, `zl5StandsAsideOverCard`, `zl6TrackRides` from `./zoom/loupe.ts` and `type HamletWindow` from `./zoom/registration.ts`; `zHold` returns `Promise<HamletWindow>` and ends with `return pick;`; in `run`, `await zHold(step, k, target21);` becomes `const pick = await zHold(step, k, target21);` followed by `await zLoupe(step, k, pick);`, before `await step("Z restore", ...)`; a new function after `zHold`:
  ```ts
  async function zLoupe(step: ReturnType<typeof makeStep>, k: ZoomKit, pick: HamletWindow): Promise<void> {
    await step("ZL1", () => zl1PressShowsLens(k));
    await step("ZL2", () => zl2StandsAsideInMotion(k));
    await step("ZL3", () => zl3LensRegisters(k, pick));
    await step("ZL4", () => zl4HeldKey(k));
    await step("ZL5", () => zl5StandsAsideOverCard(k));
    await step("ZL6", () => zl6TrackRides(k));
  }
  ```
  ZL2 comes before ZL3 on purpose: its turned draw restores the antique dress that ZH14b's style change took away, and the region sheet ZL3 reads drafts only on the antique dress (`regionEligible` in `src/site/explorer/app.ts`).
- **`e2e/suites/zoom-gestures/touch.ts`**: a new exported `zg11LoupeDrag(k: GesturesKit): Promise<void>` (below), using the file's own `tapAt`, `doubleTap`, `kStill` and `takeChartTouch`.
- **`e2e/suites/zoom-gestures.ts`**: import `zg11LoupeDrag`; inside the step, `await zg11LoupeDrag(k);` right after `await zg8TouchTaken(k);`; the step is renamed `"ZG8, ZG8b, ZG11, ZG2, ZG3, ZG4, ZG8c"` (`git grep -n "ZG8, ZG8b"` names only that line and `handbook/plans/778/778-plan.md`, an archive; no skip, flake row or proof row names it).
- **`e2e/suites/chart-drawer/surfaces.ts`**, CD13: `edge[k]!.buttons.length === 4 &&` becomes `edge[k]!.buttons.length === 5 &&` (the check counts the corner's shown `.zoom-btn`s and reaches each; the loupe is the fifth on a desktop, beside the hold, plus, minus and home, and its reach function already accepts a hit inside the press, `el.contains(h)`).
- **`e2e/suites/glass-ceremony.ts`**, G1: `g1.order === "zoom-touch,zoom-hold,zoom-in,zoom-out,zoom-reset"` becomes `g1.order === "zoom-touch,zoom-hold,zoom-loupe,zoom-in,zoom-out,zoom-reset"`, and its check name's "the hold among them on the Explorer (Issue #751)" becomes "the hold and the loupe among them on the Explorer (Issue #751)".
- **`e2e/suites/runninghead/room.ts`**: after `HOLD_PRESS`, `const LOUPE_PRESS = ["BUTTON", "zoom-loupe", "zoom-btn loupe-btn", "button", null, "The loupe", "", null, 0];`, and in `glassFaults` the Explorer's list `[GLASS_PRESSES[0], HOLD_PRESS, ...GLASS_PRESSES.slice(1)]` becomes `[GLASS_PRESSES[0], HOLD_PRESS, LOUPE_PRESS, ...GLASS_PRESSES.slice(1)]` (the sample's fields: tag, id, class, type, `data-zoom`, label, trimmed text, title, svg count).
- **`e2e/suites/broadside/room.ts`**: the stage's Glass list gains `["zoom-loupe", null],` after `["zoom-hold", null],`.
- **`test/site/astro-scaffold.test.ts`**: after `EXPLORER_HOLD`, `const EXPLORER_LOUPE = '<button id="zoom-loupe" class="zoom-btn loupe-btn" type="button" aria-pressed="false" aria-label="The loupe"><span class="loupe-glyph" aria-hidden="true"></span></button>';`, and the Glass's call `KIT_GLASS(explorer ? ' id="zoom-controls"' : "", explorer ? EXPLORER_HOLD : "")` hands `EXPLORER_HOLD + EXPLORER_LOUPE` for the Explorer (measured 5: the two slotted presses render adjacent).
- **`test/repo/pixel-support.test.ts`**: test P4 (below).
- **`test/e2e/lane-timings.test.ts`**: `MEASURED_SECONDS.zoom` and `MEASURED_SECONDS["zoom-gestures"]` re-read from this pull request's own lane logs, as `handbook/specs/site-architecture.md` says; the arithmetic in the PR body.
- Doctrine: under "Rosters and doctrine".

Not touched: `src/site/shared/zoom-controller.ts`, `src/layouts/Glass.astro`, `src/styles/shared/atelier.css` (the lit dress `.zoomery.corner .zoom-btn[aria-pressed="true"]` already reaches every toggle in the corner), `scripts/lint/` (no rule names the new files; `loupe-page.ts` hands no value to a function of its own, so it is not a split builder), `test-support/source-read-list.ts` (no new test reads a source file).

## Tests, in the order they are written

**Red stubs, commit 1.** Each new module with its final exports and types and a wrong body, so every test reds on an assertion and never on a missing export or a throw:
- `loupeView(i)` returns `{ lens: { x: i.at.x, y: i.at.y }, sheet: { x: 0, y: 0, w: 0, h: 0 } }`;
- `svgUrl(urls)` returns `(next) => urls.create(next)` (mints every time, revokes nothing);
- `createLoupe(deps)` makes a bare `div` lens and a bare `div` grip, appends the lens to `deps.mapDiv`, and returns `{ lens, grip, show: () => {}, hide: () => {} }`;
- `loupeKey(e)` returns `e.key === LOUPE_KEY`;
- `bindLoupe(deps)` sets `aria-pressed="false"` on the press and returns `{ follow: () => {} }`, binding nothing;
- `registration(a, b, search)` computes the correlation at shift (0, 0) only and returns it with `dx: 0, dy: 0`.
`loupe-page.ts`, `loupe.css`, the page's press and every edit under "Edited" except the e2e part files and `lane-timings` land in commit 1 in their final form, wired to the stubs.

Fixtures: `installShim()` and `El` from `test-support/element-shim.ts`; a fake `SvgUrls` that numbers each url `u1`, `u2`, ... and records each `create` and `revoke`; a fake `Loupe` whose `lens` and `grip` are `El`s and whose `show` and `hide` record their calls in order; fake events as plain objects carrying the fields the handler reads and `stopPropagation` and `preventDefault` spies. Each test file types its fixtures with the module's exported types (`LoupeInput`, `LoupeSheets`, `SvgUrls`, `Loupe`, `LoupeBindDeps`), which is their second reference.

**`test/site/loupe-view.test.ts`** (the prover's):
- **U1 "the sheet point under the pointer sits at the lens centre, at every depth and power (Issue #751)"**: box `{ width: 792.59375, height: 611.84375 }`, zoom `x: -130.25, y: -77.5`, `at = { x: 301.7, y: 222.3 }`, diameter 240; for `k` in 1, 2.5 and 24 and power in 2 and 3: `(120 - v.sheet.x) / (k * power)` equals `(301.7 + 130.25) / k` within 1e-9, and the same on y with `(222.3 + 77.5) / k`. Assert first that `zoom.x !== 0`. Mutation: the shift without the power (row `zl-view-shift-no-power`); reds.
- **U2 "the copy is the gesture box at its own fractional size, magnified by depth times power, and the lens is centred on the pointer (Issue #751)"**: same inputs; `v.sheet.w` equals `792.59375 * k * power` and `v.sheet.h` equals `611.84375 * k * power` within 1e-9; `v.lens.x === 301.7 - 120` and `v.lens.y === 222.3 - 120`. Assert first that `792.59375 % 1 !== 0`. Mutations: the size without the power (row `zl-view-no-power`); `Math.round(i.box.width)`; each reds.

**`test/site/loupe.test.ts`** (the prover's):
- **U3 "one owner: a sheet string mints one url, the same string mints none, the next revokes the last (Issue #751)"**: `const url = svgUrl(fake)`; `url("a")`, `url("a")`, `url("b")`: the results are `u1`, `u1`, `u2`; `create` calls `["a", "b"]`; `revoke` calls `["u1"]`. Mutation: no revoke (row `zl-url-unrevoked`); reds.
- **U4 "the lens is seated in the gesture box, never in the chart mount, hidden and out of the accessibility tree, its grip its second child (Issue #751)"**: `createLoupe` with host and mapDiv `El`s, `touchable: false`: `host.children` is `[loupe.lens]`; `mapDiv.children` is empty; `lens.hidden` is true; `aria-hidden` is `"true"`; `lens.className` is `"loupe"`; its first child's `style.width` is `` `${LOUPE_DIAMETER}px` ``; its second child is `loupe.grip`, class `"loupe-grip"`; a second loupe with `touchable: true` has class `"loupe touchable"`. Mutation: appended to the mount (row `zl-lens-in-mount`); reds.
- **U5 "a show sizes the copy from the box's own fractional size, puts the pointer's point at the lens centre, and places the region sheet by its own fractions (Issue #751)"**: host rect `{ left: 10, top: 20, right: 802.59375, bottom: 631.84375 }`; `zoom: () => ({ x: -100, y: -50, k: 2 })`; sheets `{ world: "W", inset: { svg: "I", rect: { x: 0.25, y: 0.375, w: 0.125, h: 0.15 } } }`; `show({ x: 300, y: 200 })`: `lens.hidden` false; `lens.style.translate` `"180px 80px"`; the layer (`lens.children[0].children[0]`) has `style.width` `"3170.375px"`, `style.height` `"2447.375px"`, `style.translate` `"-680px -380px"`; the world image (`layer.children[0]`) `src` `"u1"`; the region image (`layer.children[1]`) `src` `"u2"`, `hidden` false, and `--ix`, `--iy`, `--iw`, `--ih` read `"0.25"`, `"0.375"`, `"0.125"`, `"0.15"`. A second identical show: `create` called twice in all. With `inset: null`: the region image hidden. With `sheets` returning null: the lens hidden. Mutations: the `--ix` line removed (row `zl-inset-unplaced`); `p.inset.hidden = !s.inset;` replaced by `p.inset.hidden = true;`; each reds.

**`test/site/loupe-bind.test.ts`** (the prover's). Shared setup unless a test says otherwise: press and viewport `El`s, the viewport's rect `{ left: 10, top: 20, right: 810, bottom: 620 }`, the fake loupe, `standing: () => standingNow` (true), `busy: () => busyNow` (false), `cardRect: () => cardNow` (null), `touchable: false`.
- **U6 "the loupe's key is its letter alone, either case, with no alt, control or meta (Issue #751)"**: `loupeKey` true for `"l"` and `"L"`, false for `"l"` with `ctrlKey`, with `altKey`, with `metaKey`, and for `"k"`. Mutation: `ctrlKey` ignored (row `zl-key-any-modifier`); reds.
- **U7 "the press lights the lens under the pointer, the lens standing aside does not stop the press, and leaving the chart hides it (Issue #751)"**: at bind the press reads `aria-pressed="false"`; viewport `pointermove` `{ pointerType: "mouse", clientX: 310, clientY: 220 }`; press `click`: `aria-pressed` `"true"`, last call `show({ x: 300, y: 200 })`; `pointerleave` `{ pointerType: "mouse" }`: last call `hide`; `pointerenter` `{ pointerType: "mouse", clientX: 410, clientY: 320 }`: last call `show({ x: 400, y: 300 })`; then `standingNow = false` (the sheet off its recto, with `busyNow` still false), press `click`: `"false"`; press `click`: `"true"` and last call `hide`. Mutations: the inside test dropped (row `zl-left-still-shown`); the press reading the lens's standing in place of `busy` (row `zl-press-reads-standing`); each reds.
- **U8 "holding the key shows the lens under the pointer, or at the chart's centre with no pointer over it, and letting go with or without a modifier, or the keyboard leaving the map, hides it (Issue #751)"**: the viewport `El` is given `contains: (n) => n === inside`, `inside` another `El`; unlit; `pointermove` at (310, 220): no call at all; viewport `keydown` `{ key: "l", repeat: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault }`: `show({ x: 300, y: 200 })` and `preventDefault` called; `keyup` `{ key: "l", ...no modifiers }`: `hide`; `keydown` again: `show`; `keyup` `{ key: "L", ctrlKey: true, ... }`: `hide`; `pointerleave`; `keydown`: `show({ x: 400, y: 300 })`; `focusout` `{ relatedTarget: inside }`: no new call; `focusout` `{ relatedTarget: null }`: `hide`; `keydown` with `repeat: true`: no new call. Mutations: no `focusout` listener (row `zl-focus-unheard`); a let-go on every `focusout` (row `zl-focus-inside-lets-go`); a `blur` listener in its place (row `zl-blur-only`); no centre (row `zl-held-nowhere`); no key hold (row `zl-key-unheard`); repeats re-holding (row `zl-repeat-reholds`); a let-go that needs a bare key (row `zl-keyup-needs-bare`); each reds.
- **U9 "on a computer it stands aside while the world is in motion or off its recto, and while the pointer is on a shown card (Issue #751)"**: lit, pointer at (310, 220): `show`; `standingNow = false`, `follow()`: `hide`; `standingNow = true`, `cardNow = { left: 300, top: 200, right: 500, bottom: 400 }`, `follow()`: `hide`; `cardNow = null`, `follow()`: `show({ x: 300, y: 200 })`. Mutations: the card ignored (row `zl-card-ignored`); `!deps.standing()` dropped from the placer; each reds.
- **U10 "where touch is the main pointer, lighting places it mid-chart, its grip drags it inside the gesture box without reaching the camera, and a card does not set it aside (Issue #751)"**: `touchable: true`; press `click`: `show({ x: 400, y: 300 })`; on `loupe.grip`, `touchstart` `{ touches: [{ clientX: 410, clientY: 320 }] }`: its `stopPropagation` and `preventDefault` each called once; `touchmove` `{ touches: [{ clientX: 470, clientY: 335 }] }`: `show({ x: 460, y: 315 })`, both spies called; `touchmove` to `{ clientX: 2000, clientY: -500 }`: `show({ x: 800, y: 0 })` (clamped to the 800 by 600 box); `mousedown`, `dblclick`, `wheel`, `touchend` and `touchcancel` on the grip each call their event's `stopPropagation`; no listener is bound on `loupe.lens` (its `listeners` is empty); a viewport `pointermove` `{ pointerType: "mouse", clientX: 100, clientY: 100 }` leaves the lens where it was; with `cardNow = { left: 0, top: 0, right: 2000, bottom: 2000 }`, `follow()`: still `show({ x: 800, y: 0 })`. Mutations: `grab`'s `stopPropagation` (row `zl-grab-stop`); `drag`'s (row `zl-drag-stop`); `"dblclick"` out of `STOPPED` (row `zl-dblclick-leaks`); no centre on lighting (row `zl-touch-nowhere`); no clamp (row `zl-drag-unclamped`); the card read on touch (row `zl-card-on-touch`); each reds.
- **U11 "while the loupe is neither lit nor held, a follow does nothing and reads no layout (Issue #751)"**: the viewport's `getBoundingClientRect` and `cardRect` wrapped in counters; `follow()` three times and a `pointermove`: no `show`, no `hide`, both counters 0. Mutation: `follow` unguarded (row `zl-follow-unguarded`); reds.
- **U12 "the press is ignored while a world is in motion, as the hold's is, and takes again once it has landed (Issue #751, ruling D2 (b))"**: pointer at (310, 220); `busyNow = true`, press `click`: `aria-pressed` still `"false"` and no `show` or `hide` call; `busyNow = false`, press `click`: `"true"` and last call `show({ x: 300, y: 200 })`; `busyNow = true`, press `click`: still `"true"` and no new call. Mutation: the busy guard removed (row `zl-press-heeds-no-motion`); reds.

**`test/repo/pixel-support.test.ts`**, P4 (the prover's):
- **P4 "registration finds the shift that aligns a patch with its copy, scores the same paint near 1 and unrelated paint near 0, and reports the control's texture (Issue #751)"**: `a`, 40 by 40, each pixel grey `v` with `v = ((x * 7 + y * 13) % 17) < 8 ? 40 : 220`, plus a 6 by 6 square of 0 at (12, 9); `b(x, y) = a(x - 2, y + 1)` where defined and 220 elsewhere: `registration(a, b, 4)` is `dx: 2, dy: -1` with `ncc > 0.99` and `std > 50` (the square breaks the stripes' own repeat, so no other shift in range matches as well; measured: the best other shift scores 0.93); `c`, 40 by 40, each pixel grey `s % 256` from the sequence `s = (s * 1103515245 + 12345) % 2 ** 31` started at 7: `registration(a, c, 4)` has `ncc < 0.5` (measured 0.06); a uniform patch as `b`: `ncc` 0 and `std` 0, never `NaN` (each measured with the code above, `751-loupe-p4-check.mjs` in the scratchpad). Mutation: the second patch read at `y - dy`, `x - dx` (row `zl-registration-sign`); reds on the shift.

**Browser checks, `e2e/suites/zoom/loupe.ts`** (about 300 lines), in the zoom suite after ZH15, each in its own `step`, at the suite's own window, seed 42. Exports the six functions named under `e2e/suites/zoom.ts`, each `(k: ZoomKit) => Promise<void>` save `zl3LensRegisters(k: ZoomKit, pick: HamletWindow)`. Imports: `makeSettle` from `../../support/settle.ts`; `nearRgba`, `PAGE_RGBA`, `registration`, `sampleRect`, `tokenRgba` from `../../support/pixel.ts`; `makeStage` from `../../support/home.ts`; `home`, `press` from `./hold.ts`; `sheetAtRest` from `./hold-dress.ts`; `ensureHeldDeepInset`, `pollLast`, `type HamletWindow` from `./registration.ts`; `type ZoomKit` from `./kit.ts`. Its pieces, every payload null-safe so a stubbed lens reds on an assertion and never throws (the working forms are in `751-loupe-probe-int.ts` and `751-loupe-probe-touch.ts`):
- `PRESS`, a payload reading `#zoom-loupe`'s rect centre, its `aria-pressed`, and `press.contains(document.elementFromPoint(x, y))` (the glyph span is the topmost element there, measured 3); `clickLoupe(k)`: read it, record a fault when not reached, `makeStage(k).clickAt(x, y)` (a real click: `.click()` ignores everything painted over the press); `setLoupe(k, on)`: `clickLoupe(k)` only when the press's `aria-pressed` differs from `String(on)`, so a step that failed with the loupe lit never inverts the next.
- `CENTRE`, the `#map-viewport` rect's centre and box; `mouse(k, x, y)`, a real `Input.dispatchMouseEvent` `mouseMoved`.
- `LENS`, a payload returning, for `.loupe`: present, its parent's id, whether `#map .loupe` exists, the count of `#map > svg`, `hidden`, the glass's rect, computed `pointer-events`, `aria-hidden`, the world image's `src`; and for the press: `aria-pressed`, `aria-disabled` and its computed background through `PAGE_RGBA`.
- `pollLast`, imported from `e2e/suites/zoom/registration.ts`, judging its last read (settle doctrine item 4), for every read whose truth the check asserts.
- `still(k, P)`: `sampleRect` of the 140 by 140 px square centred on `P`, origin clamped at 0, up to 12 reads 100 ms apart until two consecutive reads are identical; returns `{ rows, still }` and never throws (a paint that never comes to rest is a named fault).

The checks:
- **ZL1 "the loupe's press shows a 240 px lens centred on the pointer, seated in the gesture box and never in the chart mount, lit while on and printed as nothing, and leaving the chart hides it (Issue #751)"**: `home(k)`; `setLoupe(k, false)`; `clickLoupe(k)`; `mouse` to `CENTRE`; `LENS`. Truth: the press reached; `.loupe` present with parent `map-viewport`; no `#map .loupe`; one `#map > svg`; not hidden; the glass 240 by 240 within 0.5 px and centred on the pointer within 1 px; `pointer-events` `"none"`; `aria-hidden` `"true"`; the press `aria-pressed` `"true"` and `aria-disabled` exactly `"false"` (the world at rest; measured 3), its ground `nearRgba(ground, tokenRgba("--parchment-bright"))`; on `Emulation.setEmulatedMedia` `print` (reset to `""` in a `finally`) the lens's computed `display` `"none"`; after `mouse` to (3, 3), hidden; after `clickLoupe(k)` again, `aria-pressed` `"false"`. Mutations: rows `zl-lens-in-mount`, `zl-lens-printed`, `zl-left-still-shown`, `zl-loupe-unmarked`.
- **ZL2 "while a world is drawn or turned the lens stands aside and its press, like the hold's, is ignored and heard as unavailable, the lens also standing aside while the sheet is off its recto; a turned draw hands it the new sheet and refuses the old url (Issue #751)"**: `home(k)`; `setLoupe(k, true)`; `mouse` to `CENTRE`; read `before` (shown; its `src`). Then one awaited payload: choose `target` as `"topographic"` when `#style` reads `"antique"` and `"antique"` otherwise; set it and dispatch a bubbling `change`; poll every 10 ms, up to 4 s, until `#sheet` carries `turning`; wait one animation frame; read the lens's `hidden`; `.click()` the loupe's press twice, reading `aria-pressed` after each (`.click()` here is wiring: a real click would carry the pointer off the chart, which hides the lens on its own); read the loupe press's `aria-disabled` and the hold's. Then `k.waitSettled("zl2-turn")`, `sheetAtRest(k, "zl2-rest")`, `mouse` to `CENTRE` plus 1 px on x, read `after` (with the press's `aria-pressed` and `aria-disabled`); `fetch(before.src)` in the page resolving to `"resolved"` or `"refused"`. Then a payload that `.click()`s `#verso-turn` (wiring, the same reason), waits one frame and reads the lens's `hidden`; `makeSettle` until `#sheet` carries `versoed` and `new DOMMatrix(getComputedStyle(document.querySelector(".sheet-inner")).transform).m11 < -0.999` (the leaf has landed on its back, a geometry that must leave where it began, settle doctrine item 5); `.click()` `#verso-turn` again and, one frame later, read the lens's `hidden` (`turningBack`); `makeSettle` until `#sheet` no longer carries `flip3d`; `mouse` to `CENTRE`; read `recto`. Then `setLoupe(k, false)`. Truth: `before` shown; the turn seen; mid-turn hidden; both presses ignored, `aria-pressed` reading `"true"` after each; the loupe press's `aria-disabled` `"true"` beside the hold's `"true"` (the hold's the same-run witness that the window was the busy one); `after` shown, still `aria-pressed` `"true"`, with `aria-disabled` exactly `"false"` and a `src` other than `before`'s; `"refused"`; hidden on the verso; hidden while turning back; `recto` shown. The 1 px moves are there because Chrome may send the gesture box a synthetic `pointerleave` while its face is turned away (measured 3), after which the lens returns on the pointer's next move or synthetic `pointerenter`. Measured with both rulings built: both mid-turn presses left `"true"`, the two marks `"true"`, and after the landing `"true"` and `"false"` (measured 3). Mutations: rows `zl-aside-ignores-motion`, `zl-aside-ignores-verso`, `zl-motion-unwatched`, `zl-watchers-unfired`, `zl-press-heeds-no-motion`, `zl-loupe-unmarked`, `zl-url-unrevoked`.
- **ZL3 "the lens shows the chart under the pointer at twice the camera's depth, its paint registering with the camera's own at that depth, over the world sheet and over a region sheet held at 24 times (Issue #751)"**: inject `<style id="zl-quiet">#place-card,.place-overlay,.survey-pencil{visibility:hidden!important}</style>` (the card and the rings sit in the camera's paint and under the lens, so they differ by design), removed in a `finally` that also runs `setLoupe(k, false)` and `home(k)`. `lensVersusCamera(k, P)`: `setLoupe(k, true)`; `mouse` to `P`; `pollLast` up to 40 tries until the lens is shown and every unhidden `.loupe img` is `complete` with `naturalWidth > 0`; `lens = still(k, P)`; `setLoupe(k, false)`; read the camera `z` and the gesture box; `want = { k: z.k * 2, x: lx - (lx - z.x) * 2, y: ly - (ly - z.y) * 2 }` with `lx`, `ly` the point in the box; `__vellumZoomTo(want)`; `makeSettle` until `k === want.k` and the address's `k` reads `Math.min(want.k, 8).toFixed(4)` (a readiness wait: no mutation here touches the camera); read `got`; `cam = still(k, P)`; `r = registration(lens.rows, cam.rows, SEARCH_PX)`; `__vellumZoomTo(z)`; and the witness `intErr = Math.max(Math.abs(W - Math.round(W)) * lx / W, Math.abs(H - Math.round(H)) * ly / H) * want.k` (the error a copy sized in whole pixels would show here; reported in the detail, not asserted). The world arm: `home(k)`; `press(k)` (the hold on the bare world sheet, so nothing drafts at 2 times); `P` the centre of the capital's label (`#map > svg .settlement-capital`, its `g.settlement`, its `text`); `lensVersusCamera`; `home(k)`. The region arm: `ensureHeldDeepInset(k, pick)`; `k.enterAt(12, pick.cx, pick.cy)` and `makeSettle` until `k === 12` and the address reads `"8.0000"`; `P` the centre of the hamlet dot (`#map .region-inset svg g.settlement[data-tier="hamlet"] circle:not(.seat-halo)`) nearest the gesture box's centre among those at least 150 px inside every edge of the box and of the window; `lensVersusCamera`. Truth, per arm: a point found at least 150 px inside; the lens shown and loaded; both patches still; the camera not clamped (`got` equal to `want` within 1e-6 on each field); `Math.abs(r.dx) <= SHIFT_PX` and `Math.abs(r.dy) <= SHIFT_PX`; `r.ncc >= MATCH_AT_LEAST`; `r.std >= TEXTURE_AT_LEAST`. Constants, one comment line above `SHIFT_PX`:
  ```ts
  const PATCH_PX = 140;
  const SEARCH_PX = 8;
  // 2026-10-20, Chromium headless at the harness window and at 1024 by 768, four world points at 2 times and five region points at 13 and 24 times: built right, the best shift within 1 px and the correlation 0.84 to 0.99 over patches whose spread was 17 to 46; without the power, or the region sheet at the copy's origin, at most 0.17; sized in whole pixels, 3 to 6 px off.
  const SHIFT_PX = 1;
  const MATCH_AT_LEAST = 0.5;
  const TEXTURE_AT_LEAST = 10;
  ```
  Mutations: rows `zl-view-no-power`, `zl-view-shift-no-power`, `zl-copy-whole-pixels`, `zl-inset-untranslated`, `zl-inset-unplaced`, `zl-inset-uncommitted`.
- **ZL4 "holding L while the chart has the keyboard shows the lens under the pointer, or at the chart's centre with no pointer over the chart, and letting go or the keyboard leaving the map, from the map or from a town on it, hides it, the press untouched (Issue #751)"**: `home(k)`; `setLoupe(k, false)`; `#map-viewport.focus()` (wiring: the key path is under test, and a real click on the chart could pin a town's card); `P1 = CENTRE + (-100, -60)`; `mouse` to `P1`; read `r0`; `Input.dispatchKeyEvent` `keyDown` `{ key: "l", code: "KeyL", windowsVirtualKeyCode: 76, text: "l" }`; `r1`; `keyUp` `{ key: "l", code: "KeyL", windowsVirtualKeyCode: 76 }`; `r2`; `mouse` to (3, 3); `keyDown`; `r3`; `document.getElementById("seed").focus()`; `r4`; `keyUp`; then `.focus()` the `#map .place-hit` whose `data-idx` is the capital's (wiring: a town inside the box holding the keyboard is the case under test); `keyDown`; `r5`; `document.getElementById("seed").focus()`; `r6`; `keyUp`; the viewport's `aria-label`. Truth: `r0` hidden; `r1` shown and centred on `P1` within 1 px; `r2` hidden; `r3` shown and centred on `CENTRE` within 1 px; `r4` hidden; `r5` shown; `r6` hidden; `aria-pressed` `"false"` in every read; the label ends `"hold L for the loupe."`. Mutations: rows `zl-key-unheard`, `zl-focus-unheard`, `zl-blur-only`, `zl-held-nowhere`, `zl-left-still-shown`.
- **ZL5 "the lens stands aside while the pointer is on a shown place card and comes back off it (Issue #751)"**: `home(k)`; `setLoupe(k, true)`; `T`, the rect centre of the `#map .place-hit` whose `data-idx` is the capital's; `mouse` to `T`; `makeSettle` until `#place-card` is shown and `.pc-inner`'s `getAnimations()` is non-empty with every `playState` `"finished"` (settle doctrine's shape; a readiness wait, since the card shows under every mutation here); read `onTown` and the card's rect `K`; `mouse` to `K`'s centre; read `onCard` and whether the card is still shown; `mouse` to `T` moved 150 px along x away from `K`'s centre (to `T.x - 150` when `K`'s centre lies right of `T`, to `T.x + 150` otherwise); read `offCard`; `setLoupe(k, false)`. Truth: `onTown` shown; `onCard` hidden with the card still shown; `offCard` shown. Mutations: rows `zl-card-unread`, `zl-card-ignored`.
- **ZL6 "the inked survey track rides along in the lens, dressed as the chart's, and the copy goes with the lens (Issue #751)"**: `home(k)`; tick `#ages` with a bubbling `change` and `k.waitInked("zl6")`; `setLoupe(k, true)`; `P`, the first point of `#map > .voyage-overlay .voyage-track`'s `points` through the overlay's `viewBox` onto its rect (the payload splits the points on `/\\s+/`, double-escaped inside the template literal, `vellum-footguns` Gate 2 item 5); `mouse` to `P`; read the copies `.loupe .voyage-overlay` (count), whether the copy's track `points` equal the source's, and both tracks' computed `stroke`; `setLoupe(k, false)`; read `document.querySelectorAll(".voyage-overlay").length`; untick `#ages` the same way; `home(k)`. Truth: one copy; the same points; the copy's `stroke` non-empty and equal to the source's; one overlay in the document once the loupe is off. Mutations: rows `zl-track-uncopied`, `zl-track-kept`.

**`zg11LoupeDrag`** in `e2e/suites/zoom-gestures/touch.ts`, inside the one tablet emulation the block already holds (no page load, no emulation change, one finger only, after `zg8TouchTaken` has given the chart the finger):
- **ZG11 "where touch is the main pointer a tap on the loupe's press shows the lens mid-chart with its grip; only the grip takes a finger, only while the chart is in hand; a drag or a double tap on the grip leaves the camera still, and a pan begun on the lens's body moves the camera under a lens that stays put (Issue #751)"**: read the press's centre after `scrollIntoView({ block: "center" })` and whether `press.contains(document.elementFromPoint(x, y))`; `tapAt` it; read `L1` (shown, class `touchable`, the glass centred on the gesture box within 1 px, the lens's computed `pointer-events` `"none"`, the grip's `"auto"` and its computed `display` `"block"`, `aria-pressed` `"true"`). When the lens is not shown, record the fault and skip to the last bullet. `__vellumZoomTo` at k = 2 centred (at k = 1 the controller pins the sheet home, so a pan the camera did see could leave it unchanged); read `s0`, the lens centre `L2` and the grip's centre `G2`; `touchPan` from `G2` to 60 px right; read `L3` and `s1`; `doubleTap` at the grip's new centre; `kStill`; read `s2`. Then `touchPan` from 40 px above `L3`'s centre (on the lens's body) to 50 px left of it; read `sBody` and `LBody`. `takeChartTouch(k, false)`; read the grip's `pointer-events`; `takeChartTouch(k, true)`. Last: `tapAt` the press again; read hidden; `__vellumZoomTo({ k: 1, x: 0, y: 0 })`. Truth: the press reached; `L1` as listed; the lens moved 60 px within 2 on x and within 2 on y; `s1` equal to `s0` on `x`, `y` and `k`; `kStill` reads 2 and `s2` equals `s0`; `sBody.x` within 2 px of `s0.x - 50` with `y` and `k` equal, and `LBody`'s centre equal to `L3`'s within 1 px; the grip's `pointer-events` `"none"` out of hand; hidden after the second tap. Measured with the drafts: moved 60, the camera still under the drag and the double tap, the body pan moving `x` by -50 with the lens unmoved (measured 3). Mutations: rows `zl-drag-leaks`, `zl-body-takes-finger`, `zl-touch-out-of-hand`, `zl-touch-nowhere`, `zl-lens-in-mount-touch`.

**Expected at each commit**: at commit 1, `npm test` reds U1 to U12 and P4 on their assertions and nothing else; at commit 2 (the browser checks, against the wired stubs), `VELLUM_E2E_SUITES=zoom npm run test:e2e` reds ZL1 to ZL6 and nothing else, and `VELLUM_E2E_SUITES=zoom-gestures npm run test:e2e` reds ZG11 and nothing else; at commit 3 everything is green.

## Order of commits

Each pushed (workflow step 9).

1. `#751 The loupe: plan archived, its modules stubbed and wired, their unit tests red`: this plan copied exactly (`cmp`) to `handbook/plans/751/751-loupe-plan.md`; the three modules as red stubs; `loupe-page.ts`; `loupe.css`; every edit under "Edited" save the e2e part files and `lane-timings`; the unit tests and P4. Before it: `npm run check`, `npm run lint`, `npm run format:check`; `npm test` as "Expected at each commit" says; then `npm run astro:generate`.
2. `#751 The loupe's browser checks, red`: `e2e/suites/zoom/loupe.ts`, its wiring in `e2e/suites/zoom.ts`, the two `export`s in `registration.ts`, `zg11LoupeDrag` and its call. Before it: the three checks; `npm run build`; the two suites once each, as "Expected at each commit" says.
3. `#751 The loupe draws the sheets under the pointer`: the three modules and `registration` in `pixel.ts` as written above. Before it: the three checks, `npm test` green, `npm run build`, then one at a time: `zoom`, `zoom-gestures`, `glass-ceremony`, `cards`, `turn`, `verso`, `survey`, `broadside`, `runninghead`, `chart-drawer`, `region-detail`, `corners`, each `VELLUM_E2E_SUITES=<name> npm run test:e2e`, all green.
4. `#751 Doctrine moves with the loupe`: the edits under "Rosters and doctrine".
5. The guard prover's round over the unit rows, and every row with a browser red sent to the CI proof runner (`npm run proof -- send <list>`) at commit 4's sha (no row's find is in a doctrine file); the ledgers in the PR body's guard table.
6. After CI on the last commit: `MEASURED_SECONDS`, and the plate reader's record in a PR comment.

## The proof list

Every row a find-and-replace edit whose find occurs exactly once in its file at commit 4 (`\n` a newline, the spaces after it the line's own indentation; `\|` inside the table is a literal `|`, escaped for the table only; a row with two edits applies both as one patch). Unit rows name their test file; browser rows select `zoom` (ZL) or `zoom-gestures` (ZG11). BITES only on exactly the expected set. **The prover owes** the rows whose expected reds are unit tests only (its round runs unit tests, workflow step 11); the implementer sends every row with a browser red to the CI proof runner, unit files named beside the suite, and names them in the body as such.

| id | file | find | replace | expected reds |
|---|---|---|---|---|
| `zl-view-no-power` | `src/site/explorer/loupe-view.ts` | `const s = i.zoom.k * i.power;` | `const s = i.zoom.k;` | U2 (`test/site/loupe-view.test.ts`); ZL3 |
| `zl-view-shift-no-power` | `src/site/explorer/loupe-view.ts` | `x: r - (i.at.x - i.zoom.x) * i.power,` | `x: r - (i.at.x - i.zoom.x),` | U1; ZL3 |
| `zl-copy-whole-pixels` | `src/site/explorer/loupe.ts` | `const box = deps.host.getBoundingClientRect();` | `const box = { width: deps.host.offsetWidth, height: deps.host.offsetHeight };` | ZL3 |
| `zl-inset-untranslated` | `src/styles/explorer/loupe.css` | `  transform: translate(calc(var(--ix, 0) * 100cqw), calc(var(--iy, 0) * 100cqh));\n` | (empty) | ZL3 |
| `zl-inset-unplaced` | `src/site/explorer/loupe.ts` | `  img.style.setProperty("--ix", String(rect.x));\n` | (empty) | U5 (`test/site/loupe.test.ts`); ZL3 |
| `zl-inset-uncommitted` | `src/site/explorer/lod-controller.ts` | `return { svg: inset.svg, rect: insetSheetRect(inset.window, margins()) };` | `return null;` | ZL3 |
| `zl-url-unrevoked` | `src/site/explorer/loupe.ts` | `    if (url) urls.revoke(url);\n` | (empty) | U3; ZL2 |
| `zl-lens-in-mount` | `src/site/explorer/loupe.ts` | `deps.host.append(p.lens);` | `deps.mapDiv.append(p.lens);` | U4; ZL1, ZL2, ZL3, ZL4, ZL5, ZL6 (the boot draw's wipe of `#map` takes the lens) |
| `zl-lens-in-mount-touch` | `src/site/explorer/loupe.ts` | `deps.host.append(p.lens);` | `deps.mapDiv.append(p.lens);` | ZG11 (selection `zoom-gestures`) |
| `zl-lens-printed` | `src/styles/explorer/loupe.css` | `@media print {\n  .loupe {\n    display: none;\n  }\n}\n` | (empty) | ZL1 |
| `zl-press-heeds-no-motion` | `src/site/explorer/loupe-bind.ts` | `    if (deps.busy()) return;\n` | (empty) | U12 (`test/site/loupe-bind.test.ts`); ZL2 |
| `zl-press-reads-standing` | `src/site/explorer/loupe-bind.ts` | `    if (deps.busy()) return;\n` | `    if (!deps.standing()) return;\n` | U7, U12 |
| `zl-loupe-unmarked` | `src/site/explorer/world-motion.ts` | `    loupe.setAttribute("aria-disabled", String(busy()));\n` | (empty) | ZL1, ZL2 |
| `zl-aside-ignores-motion` | `src/site/explorer/loupe-page.ts` | `standing: () => !deps.motion.busy() && !offRecto(sheetEl),` | `standing: () => !offRecto(sheetEl),` | ZL2 |
| `zl-aside-ignores-verso` | `src/site/explorer/loupe-page.ts` | `standing: () => !deps.motion.busy() && !offRecto(sheetEl),` | `standing: () => !deps.motion.busy(),` | ZL2 |
| `zl-motion-unwatched` | `src/site/explorer/loupe-page.ts` | `  deps.motion.watch(binding.follow);\n` | (empty) | ZL2 |
| `zl-watchers-unfired` | `src/site/explorer/world-motion.ts` | `    for (const fn of watchers) fn();\n` | (empty) | ZL2 |
| `zl-card-unread` | `src/site/explorer/loupe-page.ts` | `return card && !card.hidden ? card.getBoundingClientRect() : null;` | `return null;` | ZL5 |
| `zl-card-ignored` | `src/site/explorer/loupe-bind.ts` | `const card = at && !deps.touchable ? deps.cardRect() : null;` | `const card = null;` | U9; ZL5 |
| `zl-card-on-touch` | `src/site/explorer/loupe-bind.ts` | `const card = at && !deps.touchable ? deps.cardRect() : null;` | `const card = at ? deps.cardRect() : null;` | U10 |
| `zl-left-still-shown` | `src/site/explorer/loupe-bind.ts` | `if (h.inside && h.client) return` | `if (h.client) return` | U7, U8; ZL1, ZL4 |
| `zl-key-unheard` | `src/site/explorer/loupe-bind.ts` | `    if (!e.repeat) hold(true);\n` | (empty) | U8; ZL4 |
| `zl-repeat-reholds` | `src/site/explorer/loupe-bind.ts` | `if (!e.repeat) hold(true);` | `hold(true);` | U8 |
| `zl-keyup-needs-bare` | `src/site/explorer/loupe-bind.ts` | `if (e.key.toLowerCase() === LOUPE_KEY) hold(false);` | `if (loupeKey(e)) hold(false);` | U8 |
| `zl-focus-unheard` | `src/site/explorer/loupe-bind.ts` | `  viewport.addEventListener("focusout", (e: FocusEvent) => {\n    if (!viewport.contains(e.relatedTarget as Node \| null)) hold(false);\n  });\n` | (empty) | U8; ZL4 |
| `zl-focus-inside-lets-go` | `src/site/explorer/loupe-bind.ts` | `if (!viewport.contains(e.relatedTarget as Node \| null)) hold(false);` | `hold(false);` | U8 |
| `zl-blur-only` | `src/site/explorer/loupe-bind.ts` | `  viewport.addEventListener("focusout", (e: FocusEvent) => {\n    if (!viewport.contains(e.relatedTarget as Node \| null)) hold(false);\n  });\n` | `  viewport.addEventListener("blur", () => hold(false));\n` | U8; ZL4 (`r6`: the box never blurs while a town holds the keyboard) |
| `zl-held-nowhere` | `src/site/explorer/loupe-bind.ts` | `return h.held ? centre(r) : null;` | `return null;` | U8; ZL4 |
| `zl-follow-unguarded` | `src/site/explorer/loupe-bind.ts` | `    if (h.lit \|\| h.held) place();\n` | `    place();\n` | U11 |
| `zl-key-any-modifier` | `src/site/explorer/loupe-bind.ts` | `!e.altKey && !e.ctrlKey && !e.metaKey;` | `!e.altKey && !e.metaKey;` | U6 |
| `zl-grab-stop` | `src/site/explorer/loupe-bind.ts` | `const grab = (e: TouchEvent): void => {\n    e.stopPropagation();\n` | `const grab = (e: TouchEvent): void => {\n` | U10 |
| `zl-drag-stop` | `src/site/explorer/loupe-bind.ts` | `const drag = (e: TouchEvent): void => {\n    e.stopPropagation();\n` | `const drag = (e: TouchEvent): void => {\n` | U10 |
| `zl-drag-leaks` | `src/site/explorer/loupe-bind.ts` | (1) `const grab = (e: TouchEvent): void => {\n    e.stopPropagation();\n` (2) `const drag = (e: TouchEvent): void => {\n    e.stopPropagation();\n` | (1) `const grab = (e: TouchEvent): void => {\n` (2) `const drag = (e: TouchEvent): void => {\n` | U10; ZG11 (d3 sees the whole drag and pans) |
| `zl-dblclick-leaks` | `src/site/explorer/loupe-bind.ts` | `["mousedown", "dblclick", "wheel", "touchend", "touchcancel"]` | `["mousedown", "wheel", "touchend", "touchcancel"]` | U10 |
| `zl-touch-nowhere` | `src/site/explorer/loupe-bind.ts` | `    if (h.lit && deps.touchable) h.at = centre(deps.viewport.getBoundingClientRect());\n` | (empty) | U10; ZG11 |
| `zl-drag-unclamped` | `src/site/explorer/loupe-bind.ts` | `h.at = clampTo(deps.viewport.getBoundingClientRect(), at);` | `h.at = at;` | U10 |
| `zl-touch-out-of-hand` | `src/styles/explorer/loupe.css` | `#map-viewport.zoomable .loupe.touchable .loupe-grip {` | `#map-viewport .loupe.touchable .loupe-grip {` | ZG11 |
| `zl-body-takes-finger` | `src/styles/explorer/loupe.css` and `src/site/explorer/loupe-bind.ts` | (1) in the sheet, `#map-viewport.zoomable .loupe.touchable .loupe-grip {` (2) in the bind, `      deps.loupe.grip,\n` | (1) `#map-viewport.zoomable .loupe.touchable {` (2) `      deps.loupe.lens,\n` | ZG11 (the body swallows the pan) |
| `zl-track-uncopied` | `src/site/explorer/loupe.ts` | `    track.sync();\n` | (empty) | ZL6 |
| `zl-track-kept` | `src/site/explorer/loupe.ts` | `    track.drop();\n` | (empty) | ZL6 |
| `zl-registration-sign` | `e2e/support/pixel.ts` | `const q = lb[y + dy]![x + dx]!;` | `const q = lb[y - dy]![x - dx]!;` | P4 (`test/repo/pixel-support.test.ts`) |

Two rows the house's rules make conditional, named here so neither is read as a defect: **`zl-copy-whole-pixels`** bites only where the gesture box is fractional (0.41 px at the harness window, measured 1); if CI reads it HOLE, read ZL3's `intErr` in that job: under 2 px it is the named blind spot (a box whole to within that leaves the class nothing to move there, and the direction is harmless: an error the check cannot see is one that does not exist at that window), and the PR body says so; at 2 px or more it is a stop condition. **The region sheet placed by a transform rather than by percentages** has no row: inside a copy laid out at its final size a percentage rounds by at most half a lens pixel, which no paint read can tell from antialiasing (measured E), so the rule is held by the doctrine line and by `zl-inset-untranslated`, which reds on the class a scaled copy would bring back. The grip's `::before` (its 24 px target) has no browser row: CDP's touch lands on a point, and the plate reader measures the target at step 11.

## Rosters and doctrine

Rosters: the new sheet joins the stylesheet lint and `SITE_SHEETS` by existing, is served from its folder (`SERVED_SOURCES`), and joins one hand-kept roster, the page's `extraCss`. The press joins, by hand: G1 (`e2e/suites/glass-ceremony.ts`), the running head's Glass list (`e2e/suites/runninghead/room.ts`), the Broadside's stage list (`e2e/suites/broadside/room.ts`), the built-markup test (`test/site/astro-scaffold.test.ts`) and CD13's count of the corner's shown presses (`e2e/suites/chart-drawer/surfaces.ts`). Found by `git grep -n "zoom-hold" -- e2e test src scripts` (which names those first four, the page, `app.ts` and the hold's own checks in `e2e/suites/zoom/`) and by class, `git grep -n "zoom-btn\|zoomery\|zoom-controls" -- e2e test test-support scripts`, which adds CD13 and otherwise names other rooms' Glasses or the hold's own checks. No new page, bundle, suite or lane; `e2e/suites/zoom/loupe.ts` is a part and joins none. `MEASURED_SECONDS` is re-measured (Gate 4 item 3).

Doctrine, each written out; the implementer reflows each edited paragraph as its file wraps prose:

1. `handbook/specs/explorer-doctrine.md`, "The camera, the gesture and the fit", a new bullet after the hold's (after "The state is pure in `src/site/explorer/glass-hold.ts`."):
   "- **The loupe follows the pointer over the chart and shows the sheets under it at twice the camera's depth** (Alex, 2026-10-04 and 2026-10-20, Issue #751). Its press stands in the Glass after the hold; holding L while the chart has the keyboard shows it while the key is down, under the pointer, or at the chart's centre with no pointer over the chart; where touch is the main pointer it appears at the chart's centre when lit and is dragged by its grip, the one part of it that takes a finger. It reads the hold's predicate twice (Alex, 2026-10-21, Issue #751): its press, like the hold's, is ignored and carries `aria-disabled` for exactly the window `createMotion`'s `busy` reports, written beside the hold's by the same `sync`, and its lens stands aside for that window and while the sheet is off its recto (`offRecto` in `src/site/explorer/verso.ts`), re-placed at every change of either through `createMotion`'s `watch` in `src/site/explorer/world-motion.ts`. On a computer it stands aside while the pointer is on a shown place card. The behaviour is `bindLoupe` in `src/site/explorer/loupe-bind.ts`; where it is seated and how its copy of the sheet is laid out are under the host contract and counter-scale."
1b. Same file, the hold's bullet (the phrase wraps across two lines there): "the hold's click path and the turn button's read one predicate" becomes "the hold's click path, the loupe's and the turn button's read one predicate". The hold's dated sentence on its own `aria-disabled` stays as it is; the loupe's is item 1's, with its own date.
2. Same file, "What may be mounted inside the chart mount", a new bullet after the voyage track's:
   "  - **The loupe is seated in the gesture box, never in the chart mount** (Issue #751). `div.loupe` is a child of `#map-viewport` (`createLoupe` in `src/site/explorer/loupe.ts`), so a draw's wipe of `#map` never takes it and no region inset gains an svg. It shows the drawn sheets as images of their own svg strings, so no id of theirs enters the document twice, and it copies the inked survey track while it shows and drops the copy when it hides."
3. Same file, "Counter-scale", a new bullet after the one beginning "**A box in the mount is placed by a transform from a whole-pixel origin**":
   "- **The loupe's copy of the sheet is laid out at its final size, never scaled** (Issue #751). Its layer is the gesture box's own fractional size times the camera's depth times the power, so a fractional offset in it rounds by at most half a pixel and nothing multiplies it, and its region sheet is still placed by a transform in the layer's own container units. The size is read from `getBoundingClientRect`, never `offsetWidth`, whose whole pixels left the region sheet 5 px off at 24 times (measured 2026-10-20). `zl3LensRegisters` in `e2e/suites/zoom/loupe.ts` reads the lens's paint against the camera's at the same depth, over the world sheet and over a region sheet held at 24 times."
4. Same file, "Overlay lifecycle", a new bullet after the verso ghost's bullet group:
   "- **The loupe's urls have exactly one owner**, `svgUrl` in `src/site/explorer/loupe.ts`, one for the world sheet and one for the region sheet, each revoking its previous url as it mints the next; nothing else mints or revokes them (`zl2StandsAsideInMotion` in `e2e/suites/zoom/loupe.ts` reads the old url refused after a turned draw)."
5. Same file, the touch bullet: after "**A new surface that takes a finger joins this press** rather than taking touch on its own." add "The loupe is one: where touch is the main pointer its grip alone takes a finger, and only while the chart is in hand (`#map-viewport.zoomable .loupe.touchable .loupe-grip` in `src/styles/explorer/loupe.css`); the rest of the lens lets a finger through to the chart."
6. Same file, the gesture-box bullet: "The live instance is `makeDogEar` in `src/site/explorer/chart-drawer.ts`." becomes "The live instances are `makeDogEar` in `src/site/explorer/chart-drawer.ts` and the loupe's grip, which also stops and prevents the touches it is dragged by (`dragHands` in `src/site/explorer/loupe-bind.ts`)."
7. `handbook/specs/ui-design.md`, "The room and its furniture", the Surveyor's Glass bullet: "On the Explorer a press of the room's own stands between the manicule and the camera's presses, seated through the component's `presses` slot: the hold, lit while the sheet is held, while the caption line ends `held` (Alex, 2026-10-04 and 2026-10-20, Issue #751)." becomes "On the Explorer two presses of the room's own stand between the manicule and the camera's presses, seated through the component's `presses` slot: the hold, lit while the sheet is held, while the caption line ends `held`, and the loupe, lit while its lens is on (Alex, 2026-10-04 and 2026-10-20, Issue #751)."; and the provisional list "and the hold's glyph, seat, name, caption mark and ceiling." becomes "the hold's glyph, seat, name, caption mark and ceiling, and the loupe's glyph, seat, name, key, size, power, rings and touch form."
8. `handbook/specs/settle-doctrine.md`, "The environment", the bullet "A visual claim in a suite is carried by a control taken in the same run": "No suite compares one screenshot against another; the one tool that does is the sweep in the next bullet, which carries a control of its own." becomes "No suite compares one screenshot against another, save `zl3LensRegisters` in `e2e/suites/zoom/loupe.ts`, which correlates the lens's paint with the camera's at the same depth, both taken in the same run (`registration` in `e2e/support/pixel.ts`), and never compares bytes; the one tool that compares builds is the sweep in the next bullet, which carries a control of its own."


## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test` (then `npm run astro:generate`), at each commit as "Order of commits" says.
- `npm run build`, then the suites listed at commit 3, one at a time and only while no other lane's suite runs; never the lanes.
- The guard prover's ledger over the unit rows and the CI proof runner's over the browser rows, every row BITES and every control CLEAN.
- **`vellum-plate-reader` is owed at step 11** (an appearance; no stills sitting at step 6, call 48). Its brief: the lens at the ruled size and power over the world sheet at k = 1, over a band-3 sheet at k = 6.5, and held at 24 times, at 1024 by 768 and 1280 by 800, each against the sitting's stills named under the design; the lens at the sheet's far right and bottom edges with the Broadside open and folded (`scrollWidth` equal to the window's, the lens cut at the stage and never painted over the Glass, the slip, the legend row or a folio); the press's glyph contrast lit and unlit against its ground (3:1 for a graphic, WCAG 1.4.11) and the rings against the chart; the corner's rect against the legend row and the drawer's tab at 1024 with the Broadside open and folded (the sitting read 201.5 px tall, 22.4 px from the open Broadside, 35.2 px from the tab folded); on the 1024 by 768 tablet emulation, the Glass column with the manicule shown, six presses, against the same neighbours, and the grip's touch target (at least 24 px tall) and its take of a finger in and out of hand; the frame cost of a lens drag at k = 1, at band 3 and held at 24 (the spike's `bench(120, 60)` read 16.7, 22.3 and 28.0 ms at p50 for a 240 px lens at THREE times, the arm the sitting did not take; the built two-times lens is measured against those as the nearest baseline), and of a wheel zoom with the lens shown against the same zoom with it off. Its record goes in a PR comment before the body claims it.
- The acceptance in the PR body leads with the rulings: the loupe on L and in the zoom column, 240 px at two times, the tablet grip; then the registration read (ZL3) and the stand-aside reads (ZL2).

## Calls made

Calls 1 to 46 are pull request 1's and stand. These are new; the implementer posts them in one dated comment on Issue #751 that says it adds to the comments holding calls 1 to 46, points at comment 6290020119 for rulings 5 to 8 and at comment 6309513150 for Alex's rulings D1 and D2 (not restated as calls; see "Rulings folded"), and goes up before the pull request opens. The numbers 47 to 66 are kept as they were, since the rulings comment cites them by number.

47. **The files, the press and the classes take the ruled name**: `loupe-view.ts`, `loupe.ts`, `loupe-bind.ts`, `loupe-page.ts`, `src/styles/explorer/loupe.css`, `#zoom-loupe`, `.loupe`. Rule: ruling 5 named the feature "the loupe", which is the naming call `vellum-footguns` "Defaults this repo has already ruled" reserves to Alex, already taken.
48. **The lens wears the look the sitting's stills showed, and no stills sitting is held for it**: the ink, parchment and ink rings, the chart-ink depth shadow, the chart-paper ground, the drawn magnifier on the press, the 2.4 by 0.9 rem grip. Rule: `handbook/specs/conventions.md`, the fidelity rule, "a ruling made on a rendered preview is a ruling on exactly what the preview showed"; Alex ruled the size, the power, the touch form and the seat from `/Users/ahl/CodeProjects/Vellum/out/751/C3-loupe240x2-k1-crop.png`, `/Users/ahl/CodeProjects/Vellum/out/751/C6-loupe240x2-band3-k6.5-crop.png`, `/Users/ahl/CodeProjects/Vellum/out/751/D1-touch-drag-1024x768-crop.png` and `/Users/ahl/CodeProjects/Vellum/out/751/B5-both-presses-broadside-folded-1024.png`, and those are the look built. The sitting's notes called the drawn faces candidates; the plate reader measures the built look at step 11.
49. **The lens shows images of the sheets' own svg strings, never a copy of their DOM.** Rule: `handbook/specs/explorer-doctrine.md` keeps every id in the document single and the mount's svgs the chart's own.
50. **The copy is laid out at its final size, sized from `getBoundingClientRect`, and its region sheet is placed by a transform in the copy's container units.** Rule: pull request 1's placement rule (`handbook/specs/explorer-doctrine.md`, Counter-scale) and measured 1 (whole pixels 5 to 6 px off at 24 times; a scaled copy 3 to 4 px).
51. **What the lens draws**: the world sheet, the committed region sheet and the inked track with its ship and rider marks; not the hits, the card, the pencil, the dog-ear, the region sheet's drop shadow, or the arrival and redraft ceremonies, which it shows finished. Rule: a reading lens over the engraving; a track vanishing under the lens would read as a fault, and the Explorer is static (Issue #321), so the lens animates nothing.
52. **The lens stands aside while `busy` holds and while the sheet is off its recto, re-placed through `createMotion`'s new `watch`.** Rule: `createMotion` is the one home of the predicate (calls 31 and 38), so the lens reads it and does not observe the sheet a second time; `flip3d` spans the turn to the verso, the verso and the turn back, where `versoed` alone would leave the lens placed on a rotating face for 1.2 s. Kept as planned by Alex's rulings comment; that the PRESS also refuses while `busy` holds is his ruling D2 (b), not this call.
53. **On a computer the lens stands aside while the pointer is on a shown place card, and otherwise covers the part of a card under it; on a tablet a card never sets it aside.** Rule: the issue's "the smallest label on a world or region sheet can be read in place"; measured 2, hiding the lens whenever a card shows would hide it over 7 of 13 town names at rest, while the lens covers 15 to 26 percent of a hovered town's card, and moving onto the card lays the lens aside. On a tablet no pointer rests on a card, and a card opened by a tap re-places nothing, so a card rule there would act only at the next drag (the plan skeptic's finding).
54. **On a computer the lens shows only while the pointer is over the chart, and a held L with no pointer over the chart shows it at the chart's centre.** Bold delight, flagged: the ruling does not say where a held key with no pointer shows it; the centre gives a keyboard reader the loupe (the arrow keys pan the chart under it) without changing what a mouse reader sees. Rule: the issue body's "follows the pointer", which Alex chose.
55. **The key is the letter L, in either case with or without shift; it is held only with no alt, control or meta, is let go on the letter whatever is down or when the keyboard leaves the map, and a repeat is ignored.** Rule: alt, control and meta stay the browser's; a modifier pressed mid-hold must not strand the lens (the plan skeptic's finding: macOS Chrome sends no `keyup` while Cmd is down, so the keyboard leaving the map remains the last let-go); the leaving is read from `focusout`, since a town inside the map often holds the keyboard and the map's own `blur` never fires then (measured 8); shift is allowed so caps lock never silences it. Matching the letter, not the physical key, means a non-Latin layout has no L; Alex's layout is Latin. Where L is heard, only once the map has the keyboard, is his ruling D1 (a), not this call.
56. **The touch form is the sitting's "drag it by its grip"**: each lighting places the lens at the gesture box's centre; only the grip takes a finger, only while the chart is in hand, its target grown to 54.4 by 28.4 px by a transparent pseudo-element; a finger on the lens's body reaches the chart; the grip stops `mousedown`, `dblclick`, `wheel`, `touchend` and `touchcancel` and stops and prevents the touches it is dragged by; the drag keeps the lens's centre inside the gesture box. Rule: ruling 7 and the sitting's option text (`/Users/ahl/CodeProjects/Vellum/out/751/notes.md`, question 7: "drag it by its grip"; D1: "The finger would hold the grip, so the lens stays over the label"); the fidelity rule; WCAG 2.5.8's 24 px target; the gesture-box bullet in `handbook/specs/explorer-doctrine.md` and `makeDogEar`'s set; a lens dragged out of the stage could only be recovered by pressing twice.
57. **The loupe is not remembered**: off at every page load, never in the address or in storage. Rule: ruling 4 keeps the hold out of the address, and the loupe is a momentary instrument of the reader's, as the hold is.
58. **The press reads "The loupe" to a screen reader, wears the drawn magnifier, and is seated after the hold**; the gesture box's label gains ", hold L for the loupe." Rule: the B5 still's order and glyph; the label already names every key the chart takes.
59. **The lens's ground is chart paper, so where it hangs past the sheet's edge it shows paper**; the stage clips it and every piece of chrome paints over it. Rule: the fidelity rule (the spike's ground); the stage is a stacking context at `z-index: 1` (`src/styles/shared/atelier.css`), so no rule is needed to keep it under the chrome.
60. **The wiring is a module of its own, `loupe-page.ts`, and `app.ts` gains two lines.** Rule: `app.ts` reads 396 of the lint's 400; `vellum/split-arguments-by-name` in `scripts/lint/split-arguments.ts`; the Glass's ids live in `app.ts` (`handbook/specs/explorer-doctrine.md`).
61. **The region sheet's guard reads paint, the lens against the camera, by correlation, with bounds derived from a sweep.** Rule: the dispatcher's brief ("a pixel-reading check, not a rectangle read"); `handbook/specs/settle-doctrine.md`, a visual claim carried by a same-run control; `CLAUDE.md`, a bound with no principle is swept and set above the worst case with its headroom named (0.84 matched against 0.17 unmatched, around 0.5; a 1 px shift against 3 px).
62. **ZL1 to ZL6 run in the zoom suite after ZH15, in lane A; ZG11 in the gesture suite's touch block.** Rule: the zoom suite drives the hold and the region sheets the checks need, and lane A has about 58 s of room against an estimate of 20 to 30 s for ZL and 3 to 5 s for ZG11 on CI; re-measured from this pull request's own lane logs (`handbook/specs/site-architecture.md`).
63. **The registration read joins the pixel helpers with a unit test, and `pollLast` is exported from `registration.ts` rather than copied.** Rule: one home for each helper (`e2e/support/pixel.ts`, pinned by `test/repo/pixel-support.test.ts` as pull request 1's were).
64. **The hands listen for `pointerenter` as well as `pointermove`.** Rule: measured 3, the lens did not return after the sheet turned back from its verso until a synthetic `pointerenter`.
65. **Doctrine lines carry both dates.** Rule: call 13 of pull request 1; 2026-10-04 ruled what to build and 2026-10-20 the name, size, power, touch form and seat.
66. **The rulebook's "New interactive surfaces are DESTINATIONS, not more Explorer panels" is not engaged.** Rule: call 12 of pull request 1; Alex chose the reading glass for the Explorer on 2026-10-04, and its seat is one press in the existing column.

## Rulings folded

Alex's answers to this plan's menu, 2026-10-21, https://github.com/ahl-gram/Vellum/issues/751#issuecomment-6309513150. They are his, recorded here and in the header, and the step 12 comment points at that comment rather than listing them as calls.

**D1 (a), ruled: L works once the map has been clicked or dragged.** L works while the map has the keyboard, as the map's other keys (plus, minus, the arrows and 0) already do. Clicking or dragging anywhere on the map gives it the keyboard. After pressing the loupe's own button, typing a seed or using the panel, L does nothing until the reader touches the map once (measured 8: L showed nothing after a click on the loupe's press or with the seed box holding the keyboard, and showed the lens after a click or a drag on the map). This is the form the accessibility rule for one-letter shortcuts asks for (WCAG 2.1.4: active only while its part of the page has the keyboard). It is the design the plan was written to, so nothing changed in the code; the design's key bullet, call 55 and doctrine item 1 now name it as his. Not built: L heard anywhere on the page while the mouse is over the map.

**D2 (b), ruled: the loupe's button is ignored while a new world is being drawn or the sheet is turning, like the anchor, and a screen reader announces it as unavailable for that window** (measured 8, locally: 519 ms for a new world, 1065 ms for a change of style; longer on a slower machine). What it changed, each built in the drafts and measured again (measured 3 and 4):
- `createMotion(hold: HTMLElement, loupe: HTMLElement)` in `src/site/explorer/world-motion.ts`, called as `createMotion(buttons.hold, buttons.loupe)` on the same line of `app.ts` (still 398 lint lines), and `sync` writes `aria-disabled` on both presses; no write at boot, as for the hold (call 44 of pull request 1).
- `LoupeBindDeps` gains `readonly busy: () => boolean;`, `pageLoupe` hands it `deps.motion.busy`, and the press's click handler begins `if (deps.busy()) return;` (`loupe-bind.ts` 132 lint lines, `loupe-page.ts` 46, `world-motion.ts` 28).
- Tests: the bind tests' shared setup gains `busyNow`; U7 keeps its press toggling with the lens standing aside but `busy` false (the verso); new U12 reads the press ignored while `busy` holds; ZL1 reads `aria-disabled` exactly `"false"` at rest; ZL2 reads both mid-turn presses ignored, the loupe's mark `"true"` beside the hold's, and `"false"` once the world has landed.
- Proof rows: `zl-press-refuses-in-motion` gives way to `zl-press-heeds-no-motion` (U12, ZL2), `zl-press-reads-standing` (U7, U12) and `zl-loupe-unmarked` (ZL1, ZL2).
- Doctrine: item 1 says the press, like the hold's, is ignored and carries `aria-disabled` for exactly `busy`'s window, dated 2026-10-21; new item 1b names the loupe beside the hold and the turn button as readers of the one predicate.
- Call 52 (the lens stands aside while a world is in motion) is kept as planned, as the rulings comment says.
Not built: a press that always works.

## Open decisions

none.

## Ruled out, so nobody rebuilds them

- At the sitting (2026-10-20): "the reading glass" on R (too close to the Surveyor's Glass); three times, or a 160 px lens (C2 clipped the capital's label, C4 and C7 showed a smaller patch); the lens raised above a held fingertip (D2: it competes with the one-finger pan and stood over the page's title near the top); the press alone, the key alone, or a button on the place card.
- On this plan's menu (2026-10-21, comment 6309513150): L heard anywhere on the page while the mouse is over the map (D1 (b)); a loupe press that always works while a world is in motion (D2 (a)).
- In this plan: a scaled copy; a copy sized in whole pixels; a DOM clone; a canvas redrawn per move; the whole lens taking the finger; a second observer of the sheet; hiding the lens whenever a card shows; standing aside on `versoed` alone (each under "Rejected").

## Stop conditions

Hand back, with the command and what it printed, if:

- Before commit 1: a comment on Issue #751 newer than the 24 this plan read that is not a plan archive.
- `git diff --stat 362bc97ac0bcdbc2f5384a01893a7f1ea818c7b3 origin/main -- src/site/explorer/app.ts src/site/explorer/app-wiring.ts src/site/explorer/glass.ts src/site/explorer/lod-controller.ts src/site/explorer/world-motion.ts src/site/explorer/elements.ts src/site/explorer/verso.ts src/site/shared/chart-touch.ts src/site/shared/zoom-controller.ts src/pages/explorer/index.astro src/layouts/Glass.astro src/styles/shared/atelier.css src/styles/shared/living-chart.css src/styles/explorer/index.css e2e/suites/zoom.ts e2e/suites/zoom e2e/suites/zoom-gestures.ts e2e/suites/zoom-gestures/touch.ts e2e/support/pixel.ts e2e/support/home.ts e2e/suites/chart-drawer/surfaces.ts e2e/suites/glass-ceremony.ts e2e/suites/runninghead/room.ts e2e/suites/broadside/room.ts test/site/astro-scaffold.test.ts test/repo/pixel-support.test.ts test/e2e/lane-timings.test.ts test-support/element-shim.ts` prints anything.
- After commit 1: `app.ts` reads other than 398 lint lines, or any file over 400 or function over 50 (`node_modules/.bin/eslint --flag unstable_native_nodejs_ts_config --rule '{"max-lines":["error",{"max":1,"skipBlankLines":true,"skipComments":true}]}' <file>` prints the count); or `npm run format` changes a line a proof row finds.
- Any code block above fails `npm run check`, `npm run lint` or `npm run format:check` as written.
- At commit 1, 2 or 3: anything red but the sets "Expected at each commit" names, or a red that is a throw rather than an assertion; CD13 red on anything but a count the plan did not predict.
- On the unmutated build, locally or in a proof control: ZL3 finds no point 150 px inside, a camera clamped, a patch never still, a texture under 10, a shift over 1 px or a correlation under 0.5; or ZG11's camera moves under the grip, or does not move under the body pan.
- Any proof row other than BITES, or a control other than CLEAN, after one re-send of that row alone; `zl-copy-whole-pixels` reading HOLE with ZL3's `intErr` at 2 px or more. A row whose actual reds differ from its expected set comes back; it is never re-sent with the new set named.
- The re-measured `MEASURED_SECONDS` push lane A past the 0.3 cap.
- The plate reader finds the lens painted over any chrome, a sideways scroll, a grip target under 24 px tall, or a drag frame cost more than 1.5 times the spike's at any of the three depths.
