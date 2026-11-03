# Issue #511, pull request 1 of 2: the painted ribbon (revision 1, as built)

**Planned at:** `origin/main` 929e5c14 (2026-11-02), Issue #511 at 4 comments (5533783638, 5533856831, 5533954362, 6041139696). The planner's tree stood at efa6bb7d; `git diff --stat efa6bb7d 929e5c14` (PR #1205) touches no file this plan names.

**Rulings:** Alex's four answers (Q1 keep today's ink scroll; Q2 the road as in the picture he chose, two dotted lines and no stripe; Q3 keep the planned names; Q4 two pull requests) are Issue #511 comment 6593034681, and his ruling on the decoration scatter is comment 6594585824; they stand with his 2026-09-03 rulings (comment 5533954362). **Open decisions: none.**

**Revision 1.** This file is `511-plan.md` with those rulings folded in and the build's deviations and late fixes written in; `511-plan.md` stays as the planner left it. Changes against it:

1. Q2 is option A: the gamboge road band, the `reverse` parameter of `offsetPath`, test 4's `band` kind and test 6's road-band half are gone from this plan. Q1 is option A (today's ink plate, losing only the lift), Q3 the planned names, Q4 two pull requests.
2. Deviation: test 3 asserts the ink plate holds no `fill="<gamboge>"` (read from `STYLES.antique.ribbonLimner`) where the plan said no `fill-opacity="0.72"`: today's plain compass draws its paper disc at 0.72, so the plan's needle was false.
3. Deviation: `paintedWave`, `paintedMarshTuft`, `paintedDune`, `paintedRiverBand` and `seaWash` take no leading `c: RibbonContext` (never read).
4. Deviation: the decoration scatter, trees, hills and waves, has the still's density and kinds but not its exact places, because the plate roots its random stream at `ribbon-<from>-<to>` where the mockup roots at `ribbon-limner-<variant>` (Alex, comment 6594585824).
5. Late fixes the plate reader and two cold skeptic rounds found: the sea wash's back edge takes the innermost cloth edge over the whole run, test 10 walks every wash's whole outline against the cloth and holds each wave's height inside its strip as well as its width between the hairlines, test 12 reads every caption line on seeds 42 and 15 in both dresses, and the stages line scales to fit the plate frame's inner rule (a new test 15). See the Files and Tests entries below.

**The split.** Issue #511 ships as two pull requests, in this order:

1. **This one: the painted plate as ruled.** Scope items 1 to 8 of the body: the tokens and their guard, the cloth frame, the road and its league numbers, the compass, the coloured glyphs, the water, the banner with its stages line, and the realm names down the outer bands; plus the two-dress guard and `build.ts` writing its SVGs to `out/` (ruling 4 of comment 5533954362).
2. **The second (`511-pr2-plan.md`, its own planner): item 9, the seats.** Recon found the caption problem is not one caption but the class: over the frame guard's 77-journey sweep (seeds 99, 15 and 42 from the capital, plus the four named extremes), 331 of 553 captions cross the painted band's inner hairline, 205 cross a strip's ink edge and 91 run under the next strip's opaque land wash; seed 42's "to Lamahai" is the one on the issue's own road (`out/511-dry-run/511-probe-b.log`, `node out/511-dry-run/511-probe-b.ts`). Seating every caption kind inside its strip, and the name yielding to a league number, is a design question for its own sitting over the built plate. Until it lands, this pull request draws every caption above all the strips so none is hidden (Calls made, 2). The split itself is Q4.

## Specs

Read these, at these sections, on top of what `CLAUDE.md`'s spec table owes the work:

- `handbook/specs/chart-dress.md`: "A style is a palette over identical geometry", "A new dress replaces one rather than adding another", "The prospect plate's antique is hand-coloured, its ink is plain", "A value that changes with the dress is a style token".
- `handbook/specs/rulebook.md`: "Golden and committed-chart discipline", in particular "NEVER byte-compare SVGs rendered in different environments" (no ribbon byte pin is written; Epic #426 comment 5533986114 ruling 2 parks one).
- `handbook/specs/conventions.md`: "How a design decision is made" (items 3 and 4, provisional rulings), "The fidelity rule", "How a spec, and the rest of the house's prose, is written", "How code is cited".
- `handbook/specs/check-placement.md`: "The unit suite" (a unit test runs the code and asserts what it does; a test may read a generated file as data).
- `handbook/specs/ui-design.md`: "Colour, contrast and legibility" (for reading the plate reader's numbers at step 11).
- `handbook/specs/engine-invariants.md`: "A ribbon event can sit at a road's exact end".
- `handbook/specs/development-workflow.md` step 8 (the archive goes to `handbook/plans/500/511/511-plan.md`; 511 rounds down to the 500 bucket).
- `.claude/skills/vellum-footguns/SKILL.md` Gates 1, 5 and 6.

## The design

**One plate, two hands.** The ribbon keeps one renderer. `ribbonDress` resolves a `paint` for the dress: the antique dress gets the limner's pigments, the ink dress gets `null`. Every drawing step that differs asks `c.paint`: with paint it draws the painted ribbon, ported from `design/ribbon-limner/strip.ts`, `glyphs.ts` and `cartouche.ts` (variant `c-painted`) with every raw value replaced by a token; without it, it draws exactly what it draws today. The layout (`src/itinerary/dress/layout.ts`), the events, the captions' own seats and every fork key are untouched, so the slip's row seats and RB7's same-address press stand.

**The ink dress is the plain impression it is today** (Q1, option A as ruled). It keeps the rect frames, the 2.3 casings in `style.road`, the dots and their fives, the plain compass with its "N", the plain glyphs and the old title band, and gains no stages line and no realm names. It changes in three ways only: the white strip lift goes (ruling 4), its road paths carry `class="road"` (ruling 3), and its captions move into the layer above the strips.

**The tokens.** Five new values become a new group on `MapStyle`, `ribbonLimner`, non-null on antique only. The ribbon reads vermilion from the existing `limner.vermilion` (the same `#c23b22`), azurite from `style.river` (`#637f9b`) and sepia from `style.road` (`#8a6a4a`). Paper, ink and soft ink are the dress context's own (`c.paper` is `style.land`, `#f2e8cf`, which is the mockup's paper).

**The pieces, as the mockup draws them** (every number below is the mockup's unless Calls made says otherwise):

- **The cloth.** Each strip's long edges undulate: `left(y) = x0 + 3.5 + 3.2 sin(2π(y - y0)/190 + index) + 0.9 sin(2π(y - y0)/71)` and `right(y) = x0 + w - (3.5 + 3.2 sin(2π(y - y0)/230 + 1.7 index + 1.2) + 0.9 sin(2π(y - y0)/83 + 2))`, sampled every 6 units from `y0` to `y0 + h` and at `y0 + h`. The body is filled with the land wash; a gamboge band 6 wide (`BAND`) at fill-opacity 0.72 runs inside each edge; the body's outline is ink at 1.0; a soft-ink hairline at 0.5 marks each band's inner side.
- **The road.** Casings at ±4.2 in ink (`c.ink`), width 1.1, dash `0.2 3.4`, round caps; the town spans at ±4.2 in ink at 1.2; the side roads in ink, dash `0.2 3`. Every league is numbered on the road's centreline: a halo (circle r 3.6, an ellipse rx 5.1 ry 3.6 for a three-digit league) in the land wash under the numeral in ink at size 5.2. The dots and their fives are not drawn on antique. Nothing is drawn between the casings (Q2, as ruled).
- **The compass.** A paper disc r 15 at fill-opacity 0.85 ringed in ink at 0.9, a vermilion ring r 13.2 at 0.7 and stroke-opacity 0.8; inside a group rotated by the strip's `needleDeg`, an eight-point paper star (radii 12.4 and 4.2) turned π/8, then the eight-point vermilion star, then a four-point paper star (7.5 and 2.6) turned π/4, then the fleur-de-lis at (0, -20.5) at scale 0.95; a centre dot r 1 in ink.
- **The glyphs.** Houses and towers split into a paper wall and a vermilion roof (the capital gains the mockup's fifth house at (-5, 3.2) scale 0.9); hills and mountains carry a sepia shade at fill-opacity 0.42 on their right faces; round trees and pines take verdigris-wash canopies over a stipple of verdigris dots, palms verdigris fronds, marsh tufts azurite with an azurite stipple, dunes sepia.
- **The water.** Where two or more consecutive samples run on ocean on one side, a sea wash (azurite wash at fill-opacity 0.55, an azurite shore at 0.8 and stroke-opacity 0.65) runs from the band's hairline to a smoothed shore 26 to 38 units off the road, with wave flourishes in azurite; ocean decor is then not drawn. A river crossing is an azurite-wash band 7 wide between the hairlines, with azurite lines 3 above and below. Bridge and ford marks are unchanged.
- **The title.** The title on a swallow-tailed gamboge banner (660 wide, 30 tall, notched 9, tails 16) with a sepia shadow and two sepia folds; beneath it the two subtitle lines and the stages line, "From Laukuwelua to Noloatatani 32, to Won 69, to Homaitani 83 leagues" on seed 42 (ruling 1: the last entry is the title's rounded total). The colophon and the plate frame are unchanged.
- **The realm names.** The departure's realm down the first strip's left band, the arrival's realm down the last strip's right band, in italic ink at 7.6, rotated a quarter turn.

**Alternatives rejected, so they are not rediscovered mid-build:**

- *Adding the pigments to the existing `limner` group.* `tokenColors` in `test-support/dress-svg.ts` spreads every `limner` value into the prospect's allowlist, so gamboge, verdigris and the washes would silently become legal on the prospect: the widening ruling 2 exists to prevent.
- *Teaching the prospect's shared glyphs colour.* The prospect's plates must not change a byte (body item 5); the ribbon takes its own painted copies.
- *Drawing the ink dress in the painted shapes without colour.* Q1's option B; Alex ruled against it.
- *Keying the frame guard on the dash pattern.* It drops the undashed town spans (re-baseline item 2); ruling 3 keys it on `class="road"`.
- *Seating the captions in this pull request.* The class is 331 of 553 captions; it is pull request 2's design.
- *A checksum pin on any ribbon plate.* Cross-platform byte pins are forbidden (rulebook) and Epic #426's ruling 2 parks a ribbon golden.

## Files

Every function the plan adds stays under 50 lines and every file under 400 (the lint's `max-lines` and `max-lines-per-function`); the splits below are how.

**`src/render/style.ts`** (edit)
- New type, after `Limner`: `export type RibbonLimner = { readonly gamboge: string; readonly verdigris: string; readonly verdigrisWash: string; readonly azuriteWash: string; readonly landWash: string };`
- `MapStyle` gains `readonly ribbonLimner: RibbonLimner | null;` directly after `limner`.
- `ANTIQUE` gains `ribbonLimner: { gamboge: "#d9a92e", verdigris: "#5f9a5a", verdigrisWash: "#a9c48f", azuriteWash: "#9fbdcc", landWash: "#e6e7c6" }` after its `limner`; `TOPOGRAPHIC`, `INK` and `NAUTICAL` gain `ribbonLimner: null` after theirs.
- (The key and type names are Q3's.)

**`src/itinerary/dress/context.ts`** (edit)
- `export type RibbonPaint = { readonly gamboge: string; readonly vermilion: string; readonly verdigris: string; readonly verdigrisWash: string; readonly azurite: string; readonly azuriteWash: string; readonly landWash: string; readonly sepia: string };`
- `export type RibbonContext = DressContext & { readonly paint: RibbonPaint | null };`
- An unexported `paintFor(style: MapStyle): RibbonPaint | null`: `null` when `style.ribbonLimner` or `style.limner` is `null`, else `{ ...style.ribbonLimner, vermilion: style.limner.vermilion, azurite: style.river, sepia: style.road }`.
- `ribbonDress(style: MapStyle): RibbonContext` keeps its `RIBBON_DRESSES` check and `RangeError` unchanged and returns `{ style, ink: style.ink, soft: style.inkSoft, paper: style.land, paint: paintFor(style) }`.

**`src/itinerary/dress/cloth.ts`** (new)
- `export const BAND = 6;`
- `export type StripBody = { readonly left: (y: number) => number; readonly right: (y: number) => number };`
- `export function stripBody(strip: StripLayout): StripBody` with the two formulas above, written with named constants `INSET = 3.5`, `SWELL = 3.2`, `RIPPLE = 0.9` and the periods and phases literal in the formula.
- `export function clothFrame(c: RibbonContext, paint: RibbonPaint, strip: StripLayout, body: StripBody): SvgNode[]`, emitting in this order, each a `path`: the body (`{ d, fill: paint.landWash }`), the left band and the right band (`{ d, fill: paint.gamboge, "fill-opacity": 0.72 }`), the outline (`{ d, fill: "none", stroke: c.ink, "stroke-width": 1.0 }`), the left hairline and the right hairline (`{ d, fill: "none", stroke: c.soft, "stroke-width": 0.5 }`).
- `export function plainFrame(c: RibbonContext, strip: StripLayout): SvgNode[]`: today's `frame` from `src/itinerary/dress/strip.ts` without its first rect (the lift): the ink rect at 1.1 and the soft inset rect at 0.5.
- Unexported helpers ported from `design/ribbon-limner/strip.ts`: `edgePath(strip, body, side, off, down)`, `bodyPath`, `bandPath` (outer edge at offset 0 going down, inner edge at offset `-side * BAND` coming back up, closed with `Z`).

**`src/itinerary/dress/road.ts`** (new; the road moves out of `strip.ts`)
- Moved from `src/itinerary/dress/strip.ts`, unexported unless noted: `ROAD_HALF = 2.3`, `offsetPath`, `export function roadAngleDeg(strip: StripLayout, dist: number): number` (unchanged), `leagueDots` (unchanged).
- New `const PAINTED_ROAD_HALF = 4.2;`
- `export function roadNodes(c: RibbonContext, input: RibbonInput, strip: StripLayout): SvgNode[]`: `half = c.paint ? PAINTED_ROAD_HALF : ROAD_HALF`, `ink = c.paint ? c.ink : c.style.road`; the two casings `{ class: "road", d, fill: "none", stroke: ink, "stroke-width": 1.1, "stroke-dasharray": "0.2 3.4", "stroke-linecap": "round" }`; the town spans `{ class: "road", d, fill: "none", stroke: ink, "stroke-width": 1.2 }`, the same span rule as today.
- `export function leagueMarks(c: RibbonContext, strip: StripLayout): SvgNode[]`: `c.paint ? leagueNumerals(c, c.paint, strip) : leagueDots(c, strip)`.
- Unexported `leagueNumerals`: for each league from `max(1, ceil(d0 / CELLS_PER_LEAGUE))` to `floor(d1 / CELLS_PER_LEAGUE)`, at `p = stripPos(strip, l * CELLS_PER_LEAGUE)`: the halo, `l >= 100 ? el("ellipse", { cx: r1(p.sx), cy: r1(p.sy), rx: 5.1, ry: 3.6, fill: paint.landWash }) : el("circle", { cx: r1(p.sx), cy: r1(p.sy), r: 3.6, fill: paint.landWash })`, then `el("text", { x: r1(p.sx), y: r1(p.sy + 1.9), "text-anchor": "middle", "font-family": c.style.fontFamily, "font-size": 5.2, fill: c.ink }, [String(l)])`.

**`src/itinerary/dress/water.ts`** (new)
- `riverBand(c, strip, sy, tiltDeg)` moves here unchanged from `src/itinerary/dress/strip.ts` and is exported.
- `export function paintedRiverBand(c: RibbonContext, paint: RibbonPaint, body: StripBody, sy: number, tiltDeg: number): SvgNode`: `x0 = body.left(sy) + BAND + 1`, `x1 = body.right(sy) - BAND - 1`, the same four-`q` wave as `riverBand`; a group `rotate(r1(tiltDeg) r1((x0 + x1) / 2) r1(sy))` holding `{ d, fill: "none", stroke: paint.azuriteWash, "stroke-width": 7, "stroke-opacity": 0.75 }`, then `{ d, fill: "none", stroke: paint.azurite, "stroke-width": 1.4, "stroke-opacity": 0.9, transform: "translate(0 -3)" }`, then `{ d, fill: "none", stroke: paint.azurite, "stroke-width": 1.0, "stroke-opacity": 0.7, transform: "translate(0 3)" }`.
- `export function seaWash(c: RibbonContext, paint: RibbonPaint, strip: StripLayout, body: StripBody, rng: Rng): SvgNode[]`, a port of `seaWash` in `design/ribbon-limner/strip.ts`, split as: unexported `seaRuns(strip, side): Array<readonly [number, number]>` (runs `[i, j]` of consecutive samples whose `biomeL` (side -1) or `biomeR` (side 1) is `BIOMES.ocean`, kept when `j - i >= 1`), unexported `washRun(c, paint, strip, body, side, run, rng): SvgNode[]`, and unexported `smooth(pts)` (the mockup's). In `washRun`, per point of `strip.pts.slice(max(0, i - 1), min(len, j + 2))`: `y = clamp(p.sy, strip.y0 + 4, strip.y0 + strip.h - 4)`, `x = p.sx + side * (26 + rng.range(0, 12))`, then held `SHORE_INSET = 4` inside the hairline at `y` (`side > 0 ? min(x, body.right(y) - BAND - 4) : max(x, body.left(y) + BAND + 4)`); `yBot`, `yTop` and the path as the mockup, with `edgeX` (the vertical back edge) the hairline of the run's middle `y` held to the innermost cloth edge over `[yTop, yBot]` in steps of 0.25 (`EDGE_STEP`), the shore's two corners at `edgeX - side * 6`; the path `{ d, fill: paint.azuriteWash, "fill-opacity": 0.55, stroke: paint.azurite, "stroke-width": 0.8, "stroke-opacity": 0.65, "stroke-linejoin": "round" }`; then `max(2, round((yBot - yTop) / 40))` waves, each drawing, in this order, `p = inner[floor(rng.range(0, inner.length - 0.01))]`, `wx = p.x + side * rng.range(4, 12) - 8`, `wy = p.y + rng.range(-8, 8)` held inside `[y0 + 2.55, y0 + h - 2.55]` (`WAVE_RISE`, the wave's 2.1 rise and 0.45 for its stroke), then `wx` held so the wave's whole 11.2 length lies inside the hairlines at `wy` (`wx = min(max(wx, body.left(wy) + BAND), body.right(wy) - BAND - 11.2)`), and `paintedWave(c, paint, wx, wy, 0.7)`.

**`src/itinerary/dress/glyphs.ts`** (edit; today's plain glyphs unchanged)
- `export function paintedHill(c: RibbonContext, paint: RibbonPaint, x: number, y: number, s: number): SvgNode` and `export function paintedMountain(...)`: ports of `hill` and `mountain` in `design/ribbon-limner/glyphs.ts` (paper body without stroke, the sepia shade `{ d, fill: paint.sepia, "fill-opacity": 0.42 }`, the ink outline via `stroke(c, w)`, the hill's one soft hatch).
- `export function paintedSettlementCluster(c: RibbonContext, paint: RibbonPaint, x: number, y: number, tier: "capital" | "town" | "village" | "hamlet"): SvgNode` with unexported `paintedHouse` and `paintedTower` (wall `{ d, fill: c.paper, ...stroke(c, 0.8) }`, roof `{ d, fill: paint.vermilion, ...stroke(c, 0.8) }`), the tier layouts of the mockup's `settlementCluster`.
- `export function paintedTreeRound(c: RibbonContext, paint: RibbonPaint, p: XYS)`, `paintedTreePine`, `paintedTreePalm`, `paintedMarshTuft`, `paintedDune`: ports of the mockup's, canopies `fill: paint.verdigrisWash`, palm fronds `stroke: paint.verdigris`, marsh `stroke: paint.azurite`, dune `stroke: paint.sepia`, the ink parts through `stroke(c, w)`; they use `placed` from `src/prospect/dress/glyphs.ts`.
- `export function paintedWave(c: RibbonContext, paint: RibbonPaint, x: number, y: number, s: number): SvgNode`: the mockup's `wave`, `{ d, fill: "none", stroke: paint.azurite, "stroke-width": 0.9, "stroke-opacity": 0.8, "stroke-linecap": "round" }`.
- `export function stipple(rng: Rng, x: number, y: number, n: number, spread: number, color: string, opacity: number): SvgNode[]`: the mockup's, circles r 0.8. No new element may carry `r="0.7"`: `fordStones` in `test/itinerary/fork-keys.test.ts` counts it.

**`src/itinerary/dress/compass.ts`** (edit)
- `stripCompass` unchanged.
- `export function paintedCompass(c: RibbonContext, paint: RibbonPaint, x: number, y: number, needleDeg: number): SvgNode`, the mockup's `compassRose` with tokens, and the rotated group `el("g", { transform: `rotate(${r1(needleDeg)})` }, [paperStar, vermilionStar, fourStar, fleur])` whose first two children are `{ d: starPath(8, 12.4, 4.2, Math.PI / 8), fill: c.paper, stroke: c.ink, "stroke-width": 0.5 }` and `{ d: starPath(8, 12.4, 4.2), fill: paint.vermilion, stroke: c.ink, "stroke-width": 0.5 }`. Unexported `starPath` and `fleur(c)` (the mockup's `FLEUR` as a function of `c`).

**`src/itinerary/dress/strip.ts`** (edit)
- Removed (moved): `ROAD_HALF`, `frame`, `offsetPath`, `roadAngleDeg`, `roadNodes`, `leagueDots`, `riverBand`; deleted: `STRIP_LIFT` and `STRIP_LIFT_OPACITY`.
- `decorNodes(c: RibbonContext, strip: StripLayout, rng: Rng)`: the loop and its draw order unchanged; the x margin is `c.paint ? 12 : 10`; the biome choice moves into unexported `plainDecor(c, biome, rel, smpRel, x, y, p)` (today's chain, unchanged) and `paintedDecor(c, paint, biome, rel, smpRel, x, y, p, fork)`: ocean draws nothing; alpine or snow `paintedMountain(c, paint, x, y, 0.8)`; `rel - smpRel > 0.045` `paintedHill(c, paint, x, y, 0.85)`; forest `[...stipple(fork, x, y - 3, 7, 10, paint.verdigris, 0.55), paintedTreeRound(c, paint, p)]`; taiga `[...stipple(fork, x, y - 3, 4, 8, paint.verdigris, 0.5), paintedTreePine(c, paint, p)]`; jungle or savanna `paintedTreePalm`; marsh `[...stipple(fork, x, y - 2, 3, 8, paint.azurite, 0.5), paintedMarshTuft(c, paint, p)]`; desert `paintedDune`.
- `eventNodes(c, input, strip, body, rng): { readonly art: SvgNode[]; readonly laid: CaptionsLaid }`, split so no function passes 50 lines: unexported `eventArt(c, strip, body, e, p, freeSide, rng): SvgNode[]` (the marks: `c.paint ? paintedSettlementCluster : settlementCluster`; `c.paint ? paintedRiverBand(c, c.paint, body, p.sy, tilt) : riverBand(c, strip, p.sy, tilt)` with the bridge or ford mark as today; the side road `{ class: "road", d, fill: "none", stroke: c.paint ? c.ink : c.style.road, "stroke-width": 0.9, "stroke-dasharray": "0.2 3", "stroke-linecap": "round" }`; `c.paint ? paintedMountain : mountainProfile` for the summit) and unexported `captionSeat(e, p, freeSide, caption): { sx: number; sy: number; side: -1 | 1; lines: ReadonlyArray<CaptionLine> }` (today's anchors, sides and lines per kind, unchanged). The tilt fork stays `tilt-${e.k}` and `eventCaption(e, rng)` is called once per event as today.
- `captionNodes`, `wrapLine`, `waypointLines`, `continuation` unchanged (the caption clamp stays `strip.y0 + 22`).
- New unexported `realmEdges(c, input, strip, isLast): SvgNode[]`: on strip 0, `input.realmFrom` at `x = strip.x0 + 4.6`, side -1; on the last strip, `input.realmName` at `x = strip.x0 + strip.w - 4.6`, side 1; a `null` name draws nothing; each `el("text", { x: r1(x), y: r1(strip.y0 + strip.h / 2), "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${side < 0 ? -90 : 90} ${r1(x)} ${r1(y)})`, "font-family": c.style.fontFamily, "font-size": 7.6, "font-style": "italic", "letter-spacing": 1.2, fill: c.ink }, [name])`.
- `export type StripDrawing = { readonly art: SvgNode; readonly captions: ReadonlyArray<SvgNode> };`
- `stripNodes(c: RibbonContext, input, strip, rng, isLast): StripDrawing`: `body = stripBody(strip)`; `art` is one group of, in order: `c.paint ? clothFrame(c, c.paint, strip, body) : plainFrame(c, strip)`, `c.paint ? seaWash(c, c.paint, strip, body, rng.fork(`sea-${strip.index}`)) : []`, `decorNodes`, `c.paint ? paintedCompass(...) : stripCompass(...)` at today's seat, `roadNodes`, `leagueMarks`, the events' `art`, `continuation`, `c.paint ? realmEdges(...) : []`; `captions` is `laid.nodes`.

**`src/itinerary/dress/plate.ts`** (edit)
- `renderRibbon(c: RibbonContext, input, rng)`: `drawn = layout.strips.map(stripNodes...)`; children in order: defs, the paper rect, the grain rect, `plateFrame`, `c.paint ? bannerTitle(c, c.paint, input) : titleBand(c, input)`, `...drawn.map((d) => d.art)`, `el("g", {}, drawn.flatMap((d) => [...d.captions]))`, `colophon`.
- `bannerTitle(c, paint, input): SvgNode[]` = `[...bannerCloth(c, paint), ...bannerLettering(c, input)]`, ports of `banner` in `design/ribbon-limner/cartouche.ts`: `bannerCloth` draws the shadow `{ d, fill: paint.sepia, "fill-opacity": 0.25, transform: "translate(2 3)" }`, the banner `{ d, fill: paint.gamboge, stroke: c.ink, "stroke-width": 1, "stroke-linejoin": "round" }` and the two folds `{ x, y, width: 9, height: 30, fill: paint.sepia, "fill-opacity": 0.35 }`; `bannerLettering` sets the title (`c.style.fontFamilyTitle`, size `r1(min(20, 580 / title.length / 0.62))`, letter-spacing 1.2, ink, at `y = top + 30.5`), the subtitles (italic soft, 11 at `top + 58` and 9.5 at `top + 71`) and `stagesLine(input)` (italic ink at 8.6, `"fill-opacity": 0.8`, at `top + 85`), `top = RIBBON_MARGIN`, `cx = RIBBON_W / 2`.
- `titleBand`, `plateFrame`, `colophon`, `grain` unchanged.

**`src/itinerary/prose.ts`** (edit)
- Unexported `roundedLeagues(input: RibbonInput): number` (`Math.round(input.totalLeagues)`), which `ribbonTitle` now calls in place of its own `Math.round`.
- `export function stagesLine(input: RibbonInput): string`: every waypoint with `dist > 0` and `index !== input.toIdx`, in road order, as `to <name> <Math.round(dist / CELLS_PER_LEAGUE)>`, then `to <toName> <roundedLeagues(input)>`, joined `, `, prefixed `From <fromName> ` and closed ` leagues`.

**`src/itinerary/input.ts`** (edit)
- `RibbonInput` gains `readonly realmFrom: string | null;` after `realmName`; `buildRibbonInput` reads the realm at the departure's cell exactly as it reads `realmName` at the arrival's.

**`test/itinerary/fork-keys.test.ts`** (edit): `inputWith`'s literal gains `realmFrom: null`. Nothing else.

**`test-support/ribbon-fixtures.ts`** (new)
- `export function capitalJourneys(world: World): RibbonInput[]`: `journeysOf` moved out of `test/itinerary/ribbon-frame.test.ts` unchanged.
- `export function namedJourney(world: World, from: string, to: string): RibbonInput`: throws an `Error` naming the missing piece when either name or the road is missing.

**`design/ribbon-limner/build.ts`** (edit, ruling 4): the variant SVG is written to `resolve(OUT, `${name}.svg`)` and rasterized from there; the header line becomes "writes the SVGs, the PNGs and a gallery to out/ribbon-limner/". The `current-*` reads stay on `HERE`. `dump.ts` is untouched.

**`handbook/specs/chart-dress.md`** (edit): the paragraph under Rosters and doctrine.

## Tests, in the order they are written

No browser check is added or made longer: the plate is an `<img>` blob, the ribbon suite runs unchanged, and the look is the plate reader's. Every test below is a new or strengthened guard, so `vellum-guard-prover` owes all of them at step 11, with the mutations named here; none is left to step 15.

The fixtures: the sweep is `capitalJourneys` over seeds 99, 15 and 42 (73 journeys); "seed 42's road" is its default, Laukuwelua to Homaitani (6 strips, 82.6 leagues); "seed 15's road" is Stanbyl to Svidsvikov (7 strips, 115.3 leagues, a stone bridge on strip 3); seed 99's Mialiscove to Selea runs beside no sea; seed 42's Laukuwelua to Paukilua is the sea-wash witness (probe d, below).

1. **`test/itinerary/ribbon-dress.test.ts`, "the ribbon dresses in antique and ink alone, and only the antique is painted".** Assert `ribbonDress(STYLES.antique).paint` is not `null`, `ribbonDress(STYLES.ink).paint` is `null`, and `ribbonDress` throws `RangeError` for `STYLES.topographic` and `STYLES.nautical`. Stub: `ribbonDress` returns `paint: null` for both dresses; red on the antique assertion. Mutation: add `"topographic"` to `RIBBON_DRESSES`; and, separately, make `paintFor` resolve the antique's tokens (`STYLES.antique`) whatever style it is handed.

2. **Same file, "every colour on every ribbon is a ribbon token, and the antique carries every pigment".** For each journey of the sweep and each dress, every `#hex` the plate holds (the prospect guard's own match and filter, in `test/prospect/dress.test.ts`) is in `ribbonTokens(style)`, defined in this file as the lowercased set `[paper, ink, inkSoft, land, road, river, ...(limner ? [limner.vermilion] : []), ...Object.values(ribbonLimner ?? {})]`; each plate carries at least three; the union over the antique sweep holds every value of `STYLES.antique.ribbonLimner`, `limner.vermilion`, `river` and `road`. Stub: the tokens land in `style.ts` and nothing draws them; red on `#ffffff is not a ribbon token` on both dresses. Mutation: restore `fill: "#ffffff"` on `plainFrame`'s ink rect; and, separately, make `stipple` return `[]` (verdigris leaves the union). Goes green only when the last pigment is drawn (step F below).

3. **Same file, "the ink dress keeps the uncoloured impression".** On seed 42's road: the ink plate holds one `>N</text>` per strip, a `r="1.4"` dot per league, `font-size="7"` fives, and none of `font-size="5.2"`, `fill-opacity="0.72"`, `From Laukuwelua` or `The Chiefdom of Rekekoa`; the antique plate holds `From Laukuwelua`, `font-size="5.2"` numerals and neither `>N</text>` nor `r="1.4"`. No stub: green when written (the ink path is today's), red for the antique half until the painted pieces land. Mutation: make `paintFor` resolve the antique's paint for any style.

4. **`test/itinerary/ribbon-frame.test.ts`, rekeyed** (all five existing tests kept, their names unchanged except the first). `journeysOf` is replaced by `capitalJourneys`. `roadShapes(svg)` selects every `<path .../>` whose attributes hold `class="road"`, and names its kind: dash `0.2 3.4` `casing`, dash `0.2 3` `branch`, anything else `town span`. `overshootOf(input, dress)` finds each shape's strip as the one whose centre is nearest the shape's first point; on antique it measures each vertex's x past the hairlines (`stripBody(strip).left(y) + BAND - x` and `x - (stripBody(strip).right(y) - BAND)`, `BAND` and `stripBody` imported from `src/itinerary/dress/cloth.ts`) with a bound of 0, and its y past the strip's ends with `PAINTED_TOLERANCE = 4.2`, the painted casing's half-width written out; on ink it keeps today's rect check with `TOLERANCE = 2.3`. The first test becomes "no road ink escapes its strip, inside the painted hairlines on antique and the plain frame on ink, on any journey, on any seed", asserting per dress: `checked >= 60`, `shapes >= 500`, every kind's count above 0, and the worst within its bound. The two named-journey tests run `overshootOf` for both dresses. The dated line above the constants, replacing today's, records the planner's measurement: "2026-11-02, 77 journeys (seeds 99/15/42 plus the four extremes): painted casings 16.2 inside the hairline at worst, side roads 0.49 inside (seed 42 Laukuwelua to Naukoa, strip 2), the ends 1.30 past (seed 99 Taliport to Ceasairmere, strip 2); the plain frame 0.60 past (the same journey and strip)". Red: written before any path carries the class, `shapes` is 0; red on "found road ink to measure". Mutations: delete `class: "road"` from the town-span emitter (the town-span count falls to 0); `PAINTED_ROAD_HALF = 40` (antique hairline); `ROAD_HALF = 40` (ink frame).

5. **`test/itinerary/ribbon-painted.test.ts`, "every strip's cloth stays inside the plate frame's inner rule".** For every layout of the sweep, every strip and every integer `y` from `y0` to `y0 + h`: `stripBody(strip).left(y) >= 16` and `.right(y) <= RIBBON_W - 16` (the plate frame's inner rule, `RIBBON_MARGIN - 14 + 4`), and the strip's `y0 >= 16`, `y0 + h <= RIBBON_H - 16`. Premise: some layout has 7 strips. Stub: `stripBody` returns `left: () => 0, right: () => RIBBON_W`; red on the left edge. Mutation: `SWELL = 30`.

6. **Same file, "each strip's two edge bands enclose the band they paint"**. On seed 42's antique road, the `<path>` elements with `fill` gamboge and `fill-opacity="0.72"` number two per strip, each `d` ends in `Z`, and each one's shoelace area over its `M`/`L` vertex pairs is at least `0.9 * BAND * strip.h`. Stub: `bandPath`'s return edge at offset 0; red on the area. Mutation: the same edit once green.

7. **Same file, "every league is numbered on the road's centreline on antique".** On seed 42's and seed 15's antique roads: every integer from 1 to `floor(totalLeagues)` appears as a `font-size="5.2"` numeral, no other number does, and each numeral's `(x, y - 1.9)` lies within 0.1 of `stripPos(s, n * CELLS_PER_LEAGUE)` for some strip `s`. Red: before `leagueNumerals` exists the antique draws dots and fives; red on "league 1 is numbered". Mutations: number only `l % 5 === 0`; shift the numeral's `x` by 5.5.

8. **Same file, "every league's halo is wider than its numeral".** On seed 15's antique road (premise: leagues 100 to 115 are numbered), the halo element directly before each numeral's `<text` has a half-width (`r`, or `rx` for an ellipse) of at least `digits * 5.2 * WIDTH_FACTOR.mixed / 2 + 0.6` (`WIDTH_FACTOR` from `src/render/geometry.ts`, the house's text-width estimate; 0.6 sits just under the margin the still's own two-digit halo leaves, 0.69). Stub: every halo the round r 3.6; red on league 100. Mutation: the same.

9. **Same file, "each strip's rose turns with its strip's needle".** On seed 42's and seed 15's antique roads, for every strip the plate holds `<g transform="rotate(${r1(strip.needleDeg)})"><path d="..." fill="${c.paper}"...` followed directly by a `<path d="..." fill="${vermilion}"`; the index of the group is asserted found before anything after it is read. Red: the plain compass is drawn (its first child is not the paper star). Mutations: rotate the group by `needleDeg + 180`; draw the stars outside the rotated group.

10. **Same file, "the sea lies beside the road where the samples say, and stays on the cloth".** Seed 42's road holds at least one path with `fill` the azurite wash and `fill-opacity="0.55"` on its last strip, every shore point of which lies right of the mean x of that strip's road points, `strip.pts` (premise: the last strip's samples run on ocean on the right, 11 of 24, and never on the left), and seed 99's Mialiscove to Selea holds none (premise: none of its samples is ocean). Over the antique sweep, every shore point of every wash path lies inside the hairlines at its own `y`, within 0.1: the shore points are the control points of the path's `Q` commands after its first (`smooth` emits one `Q` per shore point, and the first is the shore's corner at the band; the path's `M` and final `L` stand on the band by construction and are not read). Every wave (`stroke` azurite, `stroke-width="0.9"`, `stroke-opacity="0.8"`) has an `inkExtent` (`test-support/dress-svg.ts`) inside the hairlines at its `M` point's `y`, within 0.1. Premise, the witness: on seed 42's Laukuwelua to Paukilua, strip 0 has a right-side ocean run where the road's x plus 26 passes the right hairline (probe d: 38 of 213 sea runs over the sweep do, up to 17.6 past). Stub: `seaWash` returns `[]`; red on seed 42's last strip. Mutations: drop the `SHORE_INSET` hold; drop the wave hold; draw the wash on the other side.

11. **Same file, "a river crossing's band stays between the hairlines".** For every crossing on the antique sweep (premise: seed 15's road carries one), the path with `stroke` the azurite wash and `stroke-width="7"` has an `inkExtent` whose `x0 >= left(sy) + BAND - 0.1` and `x1 <= right(sy) - BAND + 0.1`, `sy` its `M` point's `y` (the extent before the group's rotation; the rotation of at most 9 degrees moves the ends at most 0.8 inward). Stub: the antique draws `riverBand`; red on `x0`. Mutation: `x0 = strip.x0 + 4` in `paintedRiverBand`.

12. **Same file, "every caption is drawn above every strip".** On seed 42's road, on both dresses, `svg.indexOf(">to Lamahai</text>")` is found and is greater than `svg.lastIndexOf('class="road"')`. Red: before the captions layer exists "to Lamahai" (strip 2) precedes strip 5's road. Mutation: put `laid.nodes` back into the strip's group.

13. **Same file, "the realm names ride the outer bands, the departure's first and the arrival's last".** On seed 42's antique road, exactly two rotated band names: `The Chiefdom of Rekekoa` with `rotate(-90 ` at `x = r1(strips[0].x0 + 4.6)`, and `The Hauwaiwa Atolls` with `rotate(90 ` at `x = r1(last.x0 + last.w - 4.6)`; on `{ ...input, realmFrom: null, realmName: null }` none. Stub: `realmFrom` is on the input and nothing draws it; red on the first name. Mutation: swap `realmFrom` and `realmName` in `realmEdges`.

10a. *(Revision 1.)* Test 10 also reads every vertex of every sea wash's whole outline, the closing edge included, walked in steps under a unit, against the cloth outline (within 0.1), and each wave's ink extent between the strip's top and bottom; mutations: the back edge unheld, held at the top only, held by the right only, `SHORE_INSET = -1000`, the wave's height unheld.

12a. *(Revision 1.)* Test 12 reads every caption line (`text-anchor` start or end) on seeds 42 and 15 in both dresses: at least the road's event count, and the first after the last strip's road; mutations: the captions put back in the strip art, the captions layer drawn first.

14. **`test/itinerary/events.test.ts`, "the stages line names each stop at its own league and closes on the title's total".** On seed 42's road, `stagesLine(input)` is exactly `From Laukuwelua to Noloatatani 32, to Won 69, to Homaitani 83 leagues`, with the premise that the arrival's own league rounds to 82 (the two roundings differ here); over every capital journey of seeds 15 and 42 the line's last number equals the number in `ribbonTitle(input).subtitle[0]`. Stub: `stagesLine` rounds the arrival's own distance, as `stages` in `design/ribbon-limner/cartouche.ts` does; red on `83`. Mutation: the same.

15. *(Revision 1.)* **`test/itinerary/ribbon-painted.test.ts`, "the stages line fits inside the plate frame's rule, and a short one keeps its size".** `plate.ts` sets the stages line at `min(8.6, floor(10 * 1028 / (length * WIDTH_FACTOR.mixed)) / 10)` (1028 is the plate frame's inner rule, `RIBBON_W - 2 * (RIBBON_MARGIN - 10)`). On seed 2024's Cial to Viareamere (237 characters, 1141 wide at 8.6) the estimated width stays within 1028 at a size of at least 6.5 and under 8.6 (it is 7.7); over seed 42's road, seed 15's and the 73 capital journeys every width stays within 1028 and a line that fits at 8.6 keeps 8.6. Stub: size fixed at 8.6; red on 1141 against 1028. Mutations: the fit removed, the rule widened to the plate edge, the cap lowered to 8.2.

The existing guards stay green and are not edited beyond the two lines named: `test/itinerary/fork-keys.test.ts`, `test/itinerary/events.test.ts`, `test/itinerary/event-seats.test.ts`, `test/site/ribbon-job.test.ts`, every test under `test/prospect/`, `test/site/hero-charts.test.ts`, `test/world/golden-seed42.test.ts`.

## Order of commits

Each step writes its test first, sees it red on the named assertion, then builds; push at the first commit.

- **A.** The plan, archived at `handbook/plans/500/511/511-plan.md`; `RibbonLimner` and `ribbonLimner` in `src/render/style.ts`; `RibbonPaint`, `RibbonContext` and `ribbonDress` returning `paint: null` (the stub) in `context.ts`; `test-support/ribbon-fixtures.ts`; `test/itinerary/ribbon-dress.test.ts` (tests 1 to 3). Red: 1, 2, the antique half of 3.
- **B.** `paintFor`; test 1 green.
- **C.** `cloth.ts` with the `stripBody` stub; tests 5 and 6 (the edge-band half) in `test/itinerary/ribbon-painted.test.ts`, red; then `stripBody`, `clothFrame`, `plainFrame` and `strip.ts` wired to them (the lift goes). Tests 5, 6 green.
- **D.** Test 4 rewritten, red on 0 shapes; `road.ts` (the move, `class: "road"`, the painted half and ink) and the side road's class; test 4 green. Tests 7 and 8 red; `leagueMarks` with the numerals and halos; green.
- **E.** Test 9 red; `paintedCompass`; green.
- **F.** The painted glyphs and `paintedDecor`; then tests 10 and 11 red, then `water.ts`; green. Test 2 green here.
- **G.** Test 12 red; `StripDrawing` and the captions layer in `renderRibbon`; green.
- **H.** Test 14 red with the `stagesLine` stub; `stagesLine`, `roundedLeagues`, `bannerTitle`; green.
- **I.** `realmFrom` on `RibbonInput` and in `fork-keys.test.ts`'s literal; test 13 red; `realmEdges`; green. Test 3 green.
- **J.** `design/ribbon-limner/build.ts`; the `chart-dress.md` paragraph.

## Rosters and doctrine

- **`handbook/specs/chart-dress.md`**: a new paragraph directly after "The prospect plate's antique is hand-coloured, its ink is plain", written out:

  > **The ribbon plate's antique is painted, its ink is plain.** The Wayfarer's Ribbon draws its antique dress as the painted ribbon of `design/ribbon-limner/c-painted-42.png`: cloth-edged strips in a land wash between gamboge bands, every league numbered in the road, vermilion roses and roofs, verdigris woods, azurite water and a swallow-tailed title banner. Its pigments are tokens in the `ribbonLimner` group on `MapStyle` in `src/render/style.ts`, beside the `limner` group's vermilion, the style's `river` for azurite and its `road` for the sepia shading, and every other dress carries `ribbonLimner: null`. The ink dress draws the plain impression: the same layout, events and captions in line, with no wash, no band and no banner. `ribbonDress` in `src/itinerary/dress/context.ts` resolves which, and a colour on either dress that is none of those tokens fails `test/itinerary/ribbon-dress.test.ts`.

  (The key and file names in it follow Q3's ruling.)
- **Issue #431**: the implementer posts a one-line pointer comment at step 12: "Issue #511 writes the departure's and the arrival's realm names down the outer bands at the two ends (`realmEdges` in `src/itinerary/dress/strip.ts`); once this sub computes the actual border, they move there."
- **The prospect's `tokenColors`** (`test-support/dress-svg.ts`) is not touched (ruling 2).
- **No roster joins**: no page, sheet, suite, bundle or source-read list entry; `test-support/source-read-list.ts` is untouched (no test reads source).
- **The post-use review** of this pull request's provisional calls is owed as an issue of its own, filed by the dispatcher as Issue #1192 was for Issue #428: the edge amplitude and periods, the wash opacities, the numeral size (2.7 px at 1024 and 3.5 px at 1280 in the room, readable under the Glass), the banner's proportions, the three-digit halo, the shore's hold inside the hairline, and Q2's ruling on the road band.

## Evidence

- `npm run check`, `npm run lint`, `npm run format:check`, `npm test`, then `npm run astro:generate`.
- **No regen owed**: `npm test -- test/site/hero-charts.test.ts test/site/gallery-room.test.ts test/world/golden-seed42.test.ts` green (world sheets and world identity stand still; Gate 6 item 7; the gallery test as Epic #426's re-baseline comment 5533823298 item 3 asks).
- **The prospect does not move a byte, and the ink impression does not move**: before the first commit, write `out/511-evidence/capture.ts <tag>`, which writes `out/511-evidence/<tag>.json` holding (a) `fnv1a` (from `test-support/dress-svg.ts`) of `prospectPlate(world, i, STYLES[dress], world.title.year)` for every settlement `i` of seeds 2, 15 and 42 and both dresses; (b) for every journey of the sweep, the ink plate's tag tokens (`svg.match(/<[^>]+>[^<]*/g)`) with `<g>` and `</g>` tokens dropped, the white lift rect dropped and ` class="road"` stripped, sorted; (c) the bytes and the median of 15 presses of seed 42's and seed 15's roads in both dresses. Run it as `node out/511-evidence/capture.ts before` before the first commit, and `after` at the head, on the same machine and Node; `out/511-evidence/compare.ts before after` exits non-zero on any difference in (a) or (b) and prints (c). Paste both tables into a PR comment with the harness, as workflow step 10 says. The planner's own reading of (c) today: seed 42's antique plate 47,186 bytes, 0.55 ms a press; the ruled mockup's plate 140,537 bytes, 1.45 ms (`out/511-dry-run/511-probe.log`).
- **e2e**: `npm run build`, then `VELLUM_E2E_SUITES=ribbon npm run test:e2e` (RB7's same-address press and RB8's ink dress). No other suite draws the plate.
- **The guard prover's round** covers tests 1 to 14 and their named mutations; at about thirty mutations it goes to the proof runner (`npm run proof -- send <list>`, workflow step 11), each row naming its unit file.
- **`vellum-plate-reader` is owed at step 11**, over the built room: seed 42's and seed 15's roads, antique and ink, at 1024 and 1280 and one 640 window, full scale and 1:1; against `design/ribbon-limner/c-painted-42.png` for fidelity; measuring the numerals and the wash under each compass, the realm names on the bands, the continuation lines, and that no caption is cut.
- The PR body lists the deviations from the still (the fidelity rule) and the provisional calls for the post-use review.

## Calls made

1. **The pigments go in their own `ribbonLimner` group, not in `limner`**, on ruling 2's reason (`tokenColors` spreads `limner` into the prospect's allowlist). Vermilion is read from `limner.vermilion`, the same value, so the antique has one vermilion; azurite is `river` and sepia is `road`, as the issue says.
2. **Every caption is drawn in one layer above all the strips** until pull request 2 seats them: otherwise 91 of 553 captions run under the next strip's opaque land wash (the plate reader measured "to Lamahai" at 0.57 of its glyphs visible on both candidates, against 0.94 today). A deviation from the still, which shows "to Lam".
3. **A three-digit league's halo is an ellipse rx 5.1**: the round r 3.6 lets the digits touch the casing dots on 16 of 18 numerals of seed 99's 117-league road, and rx 5.1 clears all 18 (plate reader). Six of 77 sweep journeys pass 100 leagues, seed 15's own road among them. The still, at 82 leagues, does not show the case.
4. **The sea's shore is held 4 units inside the hairline, and each wave wholly inside it**: the mockup's shore passes the hairline on 38 of 213 sea runs over the sweep, up to 17.6 past (probe d), which the still does not show. The random draws are made before the hold, so every wash the still shows is unchanged.
5. **The caption's top clamp stays today's `strip.y0 + 22`**, not the mockup code's `y0 + 12` (written for scroll A's rolls, and level with the continuation line on C); no caption on seed 42's road reaches either, so the still is unaffected.
6. **The decor margin is the mockup's 12 on antique and today's 10 on ink.**
7. **Crossings keep the engine's rules**: bridge or ford by `e.major || e.name !== null`, the tilt fork keyed on `k` (`fork-keys.test.ts`), not the mockup's caption match and `dist` key.
8. **The frame guard's bounds** are the issue's (inside the hairline, 0) and the principle's (the painted half-width, 4.2, at the ends); ink keeps 2.3.
9. **The stages line lists the stops past the departure in road order and ends on the arrival with the title's total** (ruling 1); no sweep journey has a waypoint after its arrival (probe c).
10. **"A paper star behind it at half a turn"** is built as the mockup's π/8, half of one point's step.
11. **No glyph-colour pins**: colour per glyph is dressing, which conventions lets lag one live-use cycle; the palette guard's pigment premise holds that each pigment is drawn somewhere.
12. **The continuation line stays soft ink on the land wash (3.66:1)** and the vermilion star on its disc (4.2 to 4.4:1, a graphic, not lettering), as the still draws them; today's own league fives read 3.83:1. Flagged for the post-use review rather than raised.
13. **The archive bucket is `handbook/plans/500/511/`**: workflow step 8 rounds 511 down to 500 (the brief said 400).
14. **The league numbers are built at the still's 5.2**, though the room draws the plate at 0.52 of its size at 1024 and 0.68 at 1280, so a number is 2.7 and 3.5 pixels tall and reads only under the Glass (plate reader). The issue made the numeral size provisional until live use, so the build follows the still and the post-use review takes it first.
15. **No byte or time budget is added for the plate.** The planner measured seed 42's plate at 47,186 bytes and 0.55 ms a press today, and the ruled mockup's at 140,537 bytes and 1.45 ms; both transports call the same `ribbonResultFor`, so they move in lockstep (`test/site/ribbon-job.test.ts`, "the job adds no ink of its own"). The evidence run records the built numbers.

## Open decisions

None. The four decisions the planner's menu put to Alex (Q1 to Q4) are ruled in Issue #511 comment 6593034681, the scatter in comment 6594585824; the answers are folded in above.

## Stop conditions

Hand back, rather than adapt, when:

- a symbol this plan moves or edits is not where it says at the planned sha (`frame`, `roadNodes`, `leagueDots`, `riverBand`, `STRIP_LIFT` in `src/itinerary/dress/strip.ts`; `ribbonDress` in `context.ts`; `ribbonTitle` in `prose.ts`), or `git diff --stat 929e5c14 origin/main` names a file under `src/itinerary/`, `src/render/style.ts`, `test/itinerary/` or `test-support/`;
- any test under `test/prospect/`, `test/site/hero-charts.test.ts`, `test/world/golden-seed42.test.ts`, `test/site/ribbon-job.test.ts` or `test/itinerary/event-seats.test.ts` reds, or `compare.ts` finds a prospect hash or an ink token that moved;
- `test/itinerary/fork-keys.test.ts` reds (a new `r="0.7"`, or a fork key or caption choice that moved);
- test 4 finds a road kind with no shapes, a painted vertex past the hairline, or an end past 4.2;
- test 10's or test 11's bound fails on the sweep with the holds in place, or the witness premise in test 10 is false;
- a test named here cannot be made red on the assertion it names;
- a function or file stays over the lint's limits after the splits named here;
- RB7 or RB8 reds;
- the plate reader at step 11 finds a defect on seed 42's road that the still does not show, or a fidelity difference from `c-painted-42.png` this plan does not name.
