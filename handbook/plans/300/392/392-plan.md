# Issue #392 plan: the engraved cartouche (the founding text set in the style's lettering)

**Planned at:** `origin/main` 06d05cb4, Issue #392 read with 5 comments. The newest, 6471501878, carries Alex's rulings on this plan's menu. First planned with 4 comments, at the same sha.

**Rulings:**
- https://github.com/ahl-gram/Vellum/issues/392#issuecomment-6457641773 (Alex, 2026-10-27, the issue body's decisions):
  1. The embedded recipe satisfies the covenant. The plate shows the sentence and the chart number, and nothing new is printed for the knobs. `README.md` line 39 stands unchanged.
  2. The founding text is a new block under the subtitle. The subtitle stays, and the box grows.
  3. The mark is ruled from stills.
  4. The sentence travels as an optional readonly recipe field. `generateWorld` ignores it, `cartoucheLayer` reads it, and the `data-vellum-*` attributes carry it so a saved SVG round-trips it.
- https://github.com/ahl-gram/Vellum/issues/392#issuecomment-6471501878 (Alex, 2026-10-28, this plan's menu):
  1. **"Large opening capital but the whole phrase is also inside quotation marks."** That pairing was not drawn at the sitting. He ruled to build it as described and review it after use, so it is provisional.
  2. Close-ups: the world chart only.
  3. The cap stays at 120 characters.
  4. The name is "founding text".

Earlier rulings this plan rests on:
- Issue #390 ruling 8 (comment 6017730675): the sentence is lettered only when at least one word was recognised (Calls made 4).
- Issue #391's 120-character cap (comment 6088036367), now kept.

**Open decisions:** none

---

## Specs

The implementer reads these first, at these sections, on top of what `CLAUDE.md`'s table owes:

- `handbook/specs/rulebook.md`: "Golden and committed-chart discipline", above all the bullet opening "An optional recipe field is guarded at every place the stamp touches it", and the regen bullets: no regen is owed here and none may be run.
- `handbook/specs/engine-invariants.md`: "Identity versus view", and "Founding a world from a sentence", the paragraph opening "What a surface may read from a founding". This plan edits both (Rosters and doctrine).
- `handbook/specs/chart-dress.md`: the paragraph opening "A value that changes with the dress is a style token". The block's faces and ink are tokens, and its sizes, pitch and gaps are layer literals. This plan adds a paragraph.
- `handbook/specs/ui-design.md`: "The case", the paragraph opening "The chart's own lettering is not in this case".
- `handbook/specs/check-placement.md`: "The unit suite" and "The browser lanes and a plate read".
- `handbook/specs/conventions.md`:
  - "The fidelity rule": every number below is the spike's, and the build is held to exactly what was measured;
  - "Do not state a provisional ruling in the same voice as a ratified one";
  - "A sitting held at the workflow's STOP is not a round": no `design/` archive is owed;
  - "How code is cited";
  - "The comment sweep", before any comment.
- `handbook/specs/development-workflow.md`, steps 8 and 11: the plate reader runs again on what was built.

## The design

**The field.** `WorldRecipe` in `src/world/types.ts` gains `readonly foundingText?: string;` as its last member, after `looseness`. It holds a founding's display form: the `sentence` of a `Founding` (`src/world/founding/found.ts`).
- `generateWorld` does not read it, and no code under `src/world/` changes to make that so. `test/world/founding-text.test.ts` pins this.
- `world.recipe` already carries it to every renderer.
- `generateRegionWorld` spreads the parent recipe into the close-up's (`recipe: { ...recipe, gridW, gridH }` in `src/world/region.ts`), so a close-up's recipe and stamp carry it too.
- The close-up's cartouche does not letter it (ruling 2 of 2026-10-28).

**Nothing in this pull request produces the field.** Issue #393's surface does both halves:
- it builds the recipe from a founding, as `defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence })`;
- it decides when to set the field. Issue #390 ruling 8 governs that, and Issue #393's comments hold the all-cancel case open for that sub.

This pull request adds no producer and no helper, so no export is left without a caller (Gate 5 item 1). Tests and the step 11 plate read build such a recipe by hand.

**The stamp, in `src/render/recipe-meta.ts`.** Read the file whole first, per the rulebook bullet.
- **`recipeAttrs`.** Add `...(r.foundingText !== undefined ? { "data-vellum-founding-text": r.foundingText } : {}),` after the looseness spread. `renderSvg` already escapes a string attribute through `escapeXml`.
- **`recipeMetadataNode`.**
  - After the `looseness` const, add `const founding = r.foundingText !== undefined ? \` founding=${JSON.stringify(r.foundingText)}\` : "";`.
  - The summary's last template part becomes `` `engine=${ENGINE_VERSION}${coast}${culture}${outline}${looseness}${founding}${regionMetadataSuffix(regionRecipe)}` ``.
- **`recipeFromSvg`.**
  - After the `shape` null check, add `const foundingText = readAttr(svg, "data-vellum-founding-text");`.
  - In the returned `recipe`, add `...(foundingText !== null ? { foundingText: unescapeXml(foundingText) } : {}),` after `...shape,`.
- **No validation.** A stamped text reads back as written. An empty stamp (`""`) reads back as `""`.

**`src/render/svg.ts`** gains `export function unescapeXml(s: string): string`, placed directly after `escapeXml`.
- It is the exact inverse of `escapeXml`, and inverts only the five entities `escapeXml` writes.
- It applies `replaceAll` in this order: `&quot;` to `"`, then `&apos;` to `'`, then `&lt;` to `<`, then `&gt;` to `>`, and `&amp;` to `&` last.

**The engraving lives in a new file, `src/render/layers/cartouche-founding.ts`**, which keeps `src/render/layers/cartouche.ts` near its 202 lines. Its exports are exactly these:

```ts
export const FOUNDING_LINE_UNITS = 48;
export function widthUnits(text: string): number;
export function foundingLines(text: string, max: number = FOUNDING_LINE_UNITS): string[];
export function engravedLines(world: World): ReadonlyArray<string>;
export function foundingRise(lineCount: number): number;
export function foundingNodes(style: MapStyle, lines: ReadonlyArray<string>, cx: number, subtitleBase: number, k: number): SvgNode[];
```

**What it draws.** The founding text is set upright in the style's body face (`fontFamily`) and full ink (`ink`), inside curly quotation marks, under the subtitle:
- The opening mark `“` (U+201C) and the sentence's first character, uppercased, are set together as one `<tspan>`. That tspan uses the style's title face (`fontFamilyTitle`) at 1.7 times the body size.
- The closing mark `”` (U+201D) is set at the body size, at the end of the last line.
- The block drops 6 more units below the subtitle than a plain block would, to clear the capital.

The planned module follows. It was run in the planner's tree, and every sheet measured below was drawn from it (Evidence, the dry run). The file is 128 lines; write it exactly:

```ts
import { el, type SvgNode } from "../svg.ts";
import type { MapStyle } from "../style.ts";
import type { World } from "../../world/types.ts";

export const FOUNDING_LINE_UNITS = 48;
const FONT = 11.5;
const PITCH = 16;
const GAP = 22;
const CAPITAL_SCALE = 1.7;
const CAPITAL_RISE = 6;
const OPEN_QUOTE = "\u{201C}";
const CLOSE_QUOTE = "\u{201D}";

const WIDE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Extended_Pictographic}\u{3000}-\u{303F}\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}]/u;
const JOINER = /[\p{M}\p{Variation_Selector}\u{200D}]/u;
const ZWJ = "\u{200D}";

const unitOf = (cp: string): number => (JOINER.test(cp) ? 0 : WIDE.test(cp) ? 2 : 1);

export function widthUnits(text: string): number {
  let n = 0;
  for (const cp of text) n += unitOf(cp);
  return n;
}

function clusters(word: string): string[] {
  const out: string[] = [];
  let prev = "";
  for (const cp of word) {
    const last = out.length - 1;
    if (last >= 0 && (cp === ZWJ || prev === ZWJ)) out[last] += cp;
    else out.push(cp);
    prev = cp;
  }
  return out;
}

function pieces(word: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  let units = 0;
  for (const cluster of clusters(word)) {
    const u = widthUnits(cluster);
    if (cur !== "" && units + u > max) {
      out.push(cur);
      cur = "";
      units = 0;
    }
    cur += cluster;
    units += u;
  }
  if (cur !== "") out.push(cur);
  return out;
}

export function foundingLines(text: string, max: number = FOUNDING_LINE_UNITS): string[] {
  const lines: string[] = [];
  let cur = "";
  let units = 0;
  for (const piece of text.split(" ").flatMap((word) => (word === "" ? [] : pieces(word, max)))) {
    const u = widthUnits(piece);
    if (cur === "") {
      cur = piece;
      units = u;
    } else if (units + 1 + u > max) {
      lines.push(cur);
      cur = piece;
      units = u;
    } else {
      cur = `${cur} ${piece}`;
      units += 1 + u;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

export function engravedLines(world: World): ReadonlyArray<string> {
  const text = world.recipe.foundingText;
  if (text === undefined || text.trim() === "" || world.region !== undefined) return [];
  return foundingLines(`${OPEN_QUOTE}${text}${CLOSE_QUOTE}`);
}

export function foundingRise(lineCount: number): number {
  if (lineCount === 0) return 0;
  return GAP + CAPITAL_RISE + (lineCount - 1) * PITCH;
}

function openingCapital(style: MapStyle, line: string, k: number): ReadonlyArray<SvgNode | string> {
  const [quote = "", capital = "", ...rest] = clusters(line);
  const size = (FONT * CAPITAL_SCALE * k).toFixed(1);
  return [
    el("tspan", { "font-family": style.fontFamilyTitle, "font-size": size }, [`${quote}${capital.toUpperCase()}`]),
    rest.join(""),
  ];
}

export function foundingNodes(
  style: MapStyle,
  lines: ReadonlyArray<string>,
  cx: number,
  subtitleBase: number,
  k: number,
): SvgNode[] {
  if (lines.length === 0) return [];
  const first = subtitleBase + (GAP + CAPITAL_RISE) * k;
  return [
    el(
      "g",
      { id: "cartouche-founding" },
      lines.map((line, i) =>
        el(
          "text",
          {
            x: cx,
            y: first + i * PITCH * k,
            "text-anchor": "middle",
            "font-family": style.fontFamily,
            "font-size": (FONT * k).toFixed(1),
            fill: style.ink,
          },
          i === 0 ? openingCapital(style, line, k) : [line],
        ),
      ),
    ),
  ];
}
```

**The file stays ASCII.** Write every escape in the brace form shown (`\u{201C}`, `\u{200D}`), never as `\uXXXX`.
- Measured 2026-10-27: a `　` typed through the Write tool landed in the file as the literal character.
- The lint refused that one (`no-irregular-whitespace`), and nothing refuses an invisible U+200D.
- After writing the file, `grep -c -P '[^\x00-\x7F]' src/render/layers/cartouche-founding.ts` must print `0`.

**`src/render/layers/cartouche.ts`** is about 212 lines after these edits:
- Import `engravedLines`, `foundingNodes` and `foundingRise` from `./cartouche-founding.ts`.
- `CartouchePlan` gains `readonly founding: ReadonlyArray<string>;` after `lines`.
- `planCartouche`:
  - add `const founding = engravedLines(world);` after `const lines = ...`;
  - the height becomes `const height = (72 + lines.length * 15 + 16 + foundingRise(founding.length)) * k;`;
  - the returned object adds `founding,` after `lines,`.
- `cartoucheText`:
  - destructure `const { x, y, w } = plan.rect;`, dropping `h`;
  - after the subtitle's `...plan.lines.map(...)` spread, add `...foundingNodes(style, plan.founding, cx, y + (64 + (plan.lines.length - 1) * 15) * k, k),`;
  - replace the foot `el("text", ...)` with `chartNumber(style, plan.rect, world.recipe.seed, k),`.
- `chartNumber` is a new private function placed right after `cartoucheText`. It holds the foot line's code verbatim. Without it, `cartoucheText` measured 51 lines against the lint's 50:

  ```ts
  function chartNumber(style: MapStyle, rect: Box, seed: number, k: number): SvgNode {
    const { x, y, w, h } = rect;
    return el(
      "text",
      {
        x: x + w / 2,
        y: y + h - 11 * k,
        "text-anchor": "middle",
        "font-family": style.fontFamily,
        "font-size": (9 * k).toFixed(1),
        "letter-spacing": (1.8 * k).toFixed(1),
        fill: style.inkSoft,
      },
      [`CHART № ${seed}`],
    );
  }
  ```

**Byte identity for every chart without the field.** With `foundingText` absent:
- `engravedLines` returns `[]` and `foundingRise(0)` returns `0`, so the height is the same integer sum times the same `k`.
- `foundingNodes` returns `[]`, so the cartouche's children are unchanged.
- `chartNumber` computes `x + w / 2` and `y + h - 11 * k` from the same doubles as before.
- Every stamp change is a conditional spread or an empty string.

So nothing moves on a numeric chart. The committed charts under `src/static/` and the golden `1792806240` stand, and no regen is owed or run. The non-circular proof is `test/site/hero-charts.test.ts`, which re-renders seed 42 in all four styles against the committed files. It stays green with no regen on the branch.

### What was measured

**The first sitting.** On 2026-10-27, 47 sheets were drawn, and the plate reader measured them in Brave through CDP at device scale 1, 1500 px wide. The record is `out/392/notes.md` and `out/392/measurements.json` in the main checkout.
- Plain block: no line crosses the cartouche's 460 px inner frame.
- Neighbours: no settlement or feature label is lost against its control. The compass and legend still draw, and neither overlaps the box. A box anchored at the bottom grows upward. On the close-up, the compass moved up with the box (y 826 to 783), which ruling 2 now removes.
- Wrapping over the 200 sentences in `test/world/founding-sample.json` (longest 119 code points): 1 line for 38 sentences, 2 for 99, 3 for 63. No line passes 48 units.
- The worst 120-code-point inputs the cap admits: all capitals take 3 lines; "cold " plus one unbroken 115-letter word takes 4; "cold " plus 115 Japanese characters takes 6.
- One case is the scanner's named blind spot: Japanese words of 13 characters separated by spaces take 8 lines at 124 code points. It errs taller, never wider.

**The ruled look.** On 2026-10-28 the planner measured the opening capital inside quotation marks itself. The record is `out/392-capital-quotes/notes.md`, `measure.log` and `measurements.json`, in the planner's tree and copied with it. `measure.ts` there drives Brave through `start` in `e2e/harness.ts`. It read 48 sheets: six sentences, in four styles, each with two candidate sizes for the opening mark.
- **The opening mark's size, settled by that measurement.** Set with the capital, in the title face at the capital's size, the opening mark's ink top lies within 0.75 px of the capital's ink top in every style and sentence (from -0.75 to +0.5 px; pass 2 painted the mark red and the capital blue at device scale 4). Set at the body size before the capital, its top sits 5.25 to 6.25 px below the capital's top, a mark that looks dropped.
- **Fit.** For the size built, no line crosses the inner frame.
  - The narrowest side margin is 51.3 px, on the all-capitals 120-character sentence in Iowan Old Style (`capitals-antique-capquotes-large`), whose widest line is 357.4 px.
  - With every engraved line and its capital forced to the fallback faces, Georgia on antique, ink and nautical and Arial on topographic, the narrowest margin is 54.8 px (`capitals-topographic-capquotes-large`, Arial), and nothing crosses. That run is `measure-forced.ts` over `longest`, `capitals`, `oneword` and `cjk`, logged in `measure-forced.log`.
- **Box heights at 1500 px**, against 118 with no engraving:

  | lines | height | sentence |
  |---|---|---|
  | 1 | 146 | `short` |
  | 2 | 162 | `epic` |
  | 3 | 178 | `longest` and `capitals` |
  | 4 | 194 | `oneword` |
  | 6 | 226 | `cjk` |

- **Console:** 0 errors.

### Alternatives rejected

- **A render-time argument threaded beside the recipe:** ruled out by ruling 4 of 2026-10-27.
- **Reusing `wrapText`:**
  - it counts UTF-16 units, so an emoji counts two and a Japanese character one;
  - it never breaks a word longer than its width, so a 115-letter word runs out of the frame;
  - changing it would move the subtitle on every numeric chart.
- **Shrinking the type to fit a long sentence:** a long founding would be lettered smaller than a short one, and the ruling grows the box instead.
- **Breaking on grapheme clusters with `Intl.Segmenter`:** its answer comes from the platform's Unicode data. The ZWJ rule above uses only property escapes, which the founding cleanup already relies on.
- **Breaking a wide-script word at any character:** it adds a second break rule, and only matters for spaced wide-script text, the named blind spot.
- **An opening mark at the body size, before a large capital:** measured 5 to 6 px low against the capital's top.
- **Straight quotation marks (`"`):** the stills Alex ruled from show curly ones.
- **Validating a stamped text with `displayForm`** (`src/world/founding/normalize.ts`) when it is read back: that would pull `src/world/founding/lexicon.ts` and the people word list into the browser render bundle. And a hand-edited text cannot rebuild some other world.
- **Carrying the sentence into the chart's `aria-label`** (`describeChart` in `src/render/map-renderer.ts`): the subtitle is not there either, and Issue #393's page shows the sentence as text.
- **A browser check that the block fits its frame:** the CI runner has none of the chart's faces. The fit is a plate read at step 11, beside the unit tests of the width rule.
- **Moving the founding group after the foot line instead of extracting `chartNumber`:** the built SVG would no longer match the measured sheets byte for byte.

## Files

**Created:**
- `src/render/layers/cartouche-founding.ts`: the module above.
- `test/render/cartouche-founding.test.ts`: T1a to T1d.
- `test/render/cartouche-engraving.test.ts`: T2a to T2e.
- `test/world/founding-text.test.ts`: T5.
- `handbook/plans/300/392/392-plan.md`: this plan, archived unchanged.

**Edited:**
- `src/world/types.ts`: the field.
- `src/render/layers/cartouche.ts`.
- `src/render/recipe-meta.ts`: about 162 lines.
- `src/render/svg.ts`: `unescapeXml`.
- `test/render/recipe-meta.test.ts`: T3a to T3c appended, about 360 lines after, under the lint's 400.
- `test/render/svg.test.ts`: T4 appended.
- `handbook/specs/engine-invariants.md` and `handbook/specs/chart-dress.md`: the wording below.

**Deleted:** none.

**Untouched:** every committed chart, `src/static/og.png`, `README.md`, `src/world/generate.ts`, `src/world/region.ts`, `src/world/founding/*` and `src/site/**`.

**Checked clear of the field:**
- `worldFor` in `src/site/explorer/world-cache.ts` keys on every override, sorted.
- `chainCacheKey` in `src/world/detail-chain.ts` caches a heightfield, which the field cannot shape.
- No stylesheet or site script selects `#layer-cartouche`: `git grep -n "layer-cartouche" -- src e2e` finds only the renderer.

## Tests, in the order they are written

This plan has no browser checks, so no browser-check reading is owed.

Every new test name ends `(Issue #392)`. The sentences are constants at the top of each file that uses them:

```ts
const EPIC = "a cold archipelago of black pines, iron harbors, and a drowned kingdom";
const EPIC_LINES = ["a cold archipelago of black pines, iron harbors,", "and a drowned kingdom"];
const EPIC_ENGRAVED = ["\u{201C}A cold archipelago of black pines, iron", "harbors, and a drowned kingdom\u{201D}"];
const LONGEST = "a warm continent of ragged coasts where the old river kings raised their cities of salt and cedar beside the copper seas";
const CAPITALS = LONGEST.toUpperCase();
const ONEWORD = "cold " + "thalassocracyofthedrownedironharborsandblackpinesbeyondthefrozenreaches".repeat(2).slice(0, 115);
const CJK = "cold " + "寒い群島の黒い松と鉄の港と沈んだ王国の物語をここに記す".repeat(5).slice(0, 115);
const EMOJI = "a" + "\u{1F469}\u{200D}\u{1F467}".repeat(15);
```

A test file may hold non-ASCII text; only the module must stay ASCII.

### T1, `test/render/cartouche-founding.test.ts`

It imports `FOUNDING_LINE_UNITS`, `foundingLines` and `widthUnits`. In commit 1, `src/render/layers/cartouche-founding.ts` is exactly the stub below: the right shapes, the wrong behaviour, and only the three exports T1 reads. Linted and formatted clean on 2026-10-27 with the house's ESLint flags and Prettier. The lint sets no `argsIgnorePattern`, so a stub with an unused parameter would fail, and this one uses each.

```ts
export const FOUNDING_LINE_UNITS = 48;

export function widthUnits(text: string): number {
  return Array.from(text).length;
}

export function foundingLines(text: string, max: number = FOUNDING_LINE_UNITS): string[] {
  return text === "" || max < 1 ? [] : [text];
}
```

**T1a.** "a wide character counts two width units, a mark or a joiner none, anything else one (Issue #392)".
- Asserts:
  - `widthUnits("abcd") === 4`
  - `widthUnits("寒い群島") === 8`
  - `widthUnits("e\u{301}") === 1`
  - `widthUnits("\u{1F469}\u{200D}\u{1F467}") === 4`
  - `widthUnits("\u{FF21}\u{FF22}") === 4`
  - `widthUnits("") === 0`
- Red on the stub: `寒い群島` gives 4.
- Mutations:
  - drop `\p{Script=Han}` from `WIDE`: `寒い群島` gives 5;
  - `unitOf` returns 1 for a `JOINER` code point: `e\u{301}` gives 2.

**T1b.** "the epic's own sentence wraps, bare, to two lines, the first exactly a line wide (Issue #392)".
- Asserts `deepEqual(foundingLines(EPIC), EPIC_LINES)`.
- Asserts `widthUnits(EPIC_LINES[0]) === FOUNDING_LINE_UNITS`. This is the witness that the first line sits on the bound.
- Red on the stub: one line.
- Mutation: `units + 1 + u > max` becomes `>= max`, so the first line ends at "iron".

**T1c.** "every line holds at most a line's width, is as full as the next word allows, and the lines put back together are the sentence (Issue #392)".
- For each of `EPIC`, `LONGEST`, `CAPITALS`, `ONEWORD`, `CJK`, `EMOJI` and `"a drowned kingdom"`:
  - every line has `widthUnits(line) <= FOUNDING_LINE_UNITS`;
  - for each line but the last, `widthUnits(line) + 1 + widthUnits(next.split(" ")[0]) > FOUNDING_LINE_UNITS`;
  - `lines.join(" ").replaceAll(" ", "") === text.replaceAll(" ", "")`.
- For `EPIC`, `LONGEST`, `CAPITALS` and the short one, also `lines.join(" ") === text`.
- Red on the stub: `LONGEST` comes back as one 120-unit line.
- Mutations:
  - `pieces` returns `[word]`: `ONEWORD` breaks the width;
  - the comparison in `foundingLines` uses `max - 1`: `EPIC`'s fullness assertion fails.

**T1d.** "a hard break never parts a joined emoji (Issue #392)".
- With `seq = "\u{1F469}\u{200D}\u{1F467}"`, asserts `deepEqual(foundingLines(EMOJI), ["a" + seq.repeat(11), seq.repeat(4)])`.
- Asserts that no line starts with U+200D and none ends with it.
- Red on the stub.
- Mutations:
  - drop `prev === ZWJ` in `clusters`: line 1 ends with U+200D;
  - drop `cp === ZWJ`: line 2 starts with U+200D.

**Then, in commit 2:** implement every line of the planned module above `engravedLines`, with no imports and without `FONT`, `PITCH`, `GAP`, `CAPITAL_SCALE`, `CAPITAL_RISE`, `OPEN_QUOTE` or `CLOSE_QUOTE`, which arrive with their first reader in commit 4. T1 goes green.

### T5, `test/world/founding-text.test.ts`

"generateWorld ignores the founding text: every member of the world but its recipe is the same (Issue #392)".
- Setup:
  - `const f = foundWorld(EPIC)`; assert `f.ok`;
  - `plain = generateWorld(defaultRecipe(f.seed, f.overrides))`;
  - `founded = generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence }))`.
- Asserts `founded.recipe.foundingText === EPIC`. This is the witness.
- Asserts `deepStrictEqual({ ...founded, recipe: null }, { ...plain, recipe: null })`.
- Green at once, by construction. It is a guard for the prover.
- Mutation: `createRng(seed + (recipe.foundingText === undefined ? 0 : 1))` in `generateWorld`.
- Written in commit 3, with the field added to `src/world/types.ts`.

### T2, `test/render/cartouche-engraving.test.ts`

Written in commit 3, red until commit 4.

`npm run check` type-checks `test/**/*.ts` (`tsconfig.json`'s `include`), so commit 3 also gives `CartouchePlan` its field, with the wrong behaviour:
- `readonly founding: ReadonlyArray<string>;` after `lines`;
- `founding: [],` after `lines,` in `planCartouche`'s returned object.

That plan field is never rendered, so it moves no byte. Commit 4 replaces the `[]` with `engravedLines(world)`.

At commit 3, T2c and T2d pass, as guards the prover takes. T2a, T2b and T2e red on their anchor, the founding group not found, because the cartouche draws no block yet.

**Fixture**, built at module level:
- `const f = foundWorld(EPIC)`, asserting `f.ok`;
- `founded = generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence }))`;
- `control = generateWorld(defaultRecipe(f.seed, f.overrides))`.

**Context.** A local `ctxFor(world, style, widthPx)` builds the `RenderCtx` the way `ctxFor` in `test/render/furniture.test.ts` does:
- the world's own `elev.w` and `elev.h`;
- `marginFor(widthPx)` from `src/render/transform.ts`;
- `createLabelArena()`;
- `realmTint: world.realms.seats.map((_, i) => i)`;
- `coastRings: []` and `elevSpan: 1`.

Read the layer through `cartoucheLayer(ctx, planCartouche(ctx))` as an `SvgNode` tree, never through SVG text.

**Reading a line.** A line's text is the concatenation of its children: a string child as is, and a tspan child's own string.

**T2a.** "a founded world engraves its founding text under the subtitle, inside quotation marks, in each style's own face and ink (Issue #392)".
- For each `style` of `Object.values(STYLES)`, building the context with that style and naming `style.name` in each message:
  - find the layer child with `attrs.id === "cartouche-founding"`, and assert it is found (the anchor);
  - its `text` children's strings deep-equal `EPIC_ENGRAVED`;
  - their `join(" ")` equals `` `\u{201C}A${f.sentence.slice(1)}\u{201D}` ``;
  - each line's `fill === style.ink` and `"font-family" === style.fontFamily`;
  - the group's index among the layer's children is greater than that of the last child with `attrs["font-style"] === "italic"`, and less than that of the child whose string starts `CHART №`.
- Red at commit 3, on the anchor: the cartouche draws no founding block yet.
- Mutations:
  - `fill: style.inkSoft`: every style reds;
  - `fill: "#4a3826"`: three styles red;
  - `"font-family": "'Iowan Old Style', serif"`: topographic reds;
  - `engravedLines` drops the quotation marks: the strings red.

**T2b.** "the box grows by exactly the engraved block, and the chart number keeps its place under it (Issue #392)".
- At `widthPx` 1500 and 3000:
  - first assert the founded layer has its founding group (the anchor);
  - compute `growth = planCartouche(ctx(founded)).rect.h - planCartouche(ctx(control)).rect.h`;
  - in the founded layer, compute `span` as the last founding line's `y` minus the last italic line's `y`;
  - assert `Math.abs(growth - span) < 1e-6`;
  - assert the founded `CHART №` line's `y` is within 1e-6 of `rect.y + rect.h - 11 * k`, and its text is `` `CHART № ${f.seed}` ``;
  - assert the founding lines' `font-size` at 3000, compared as a `Number`, is twice that at 1500.
- Mutations:
  - `foundingRise` returns `GAP + CAPITAL_RISE + lineCount * PITCH`;
  - `foundingNodes`' `first` drops `CAPITAL_RISE`;
  - the founding `y` drops its `* k`: the 3000 case reds;
  - `chartNumber` uses `y + h - 11`.

**T2c.** "a chart with no founding text, or an empty one, engraves nothing (Issue #392)".
- For `control` in each style of `Object.values(STYLES)`, and for `generateWorld(defaultRecipe(42))` in `STYLES.antique`: the plan's `founding` deep-equals `[]`, and no layer child has `attrs.id === "cartouche-founding"`.
- The same holds for `generateWorld(defaultRecipe(f.seed, { ...f.overrides, foundingText: "" }))`.
- Mutations:
  - `foundingNodes` returns `[el("g", { id: "cartouche-founding" }, [])]` when it has no lines;
  - delete `text.trim() === "" ||` in `engravedLines`: the empty text engraves `“”`.

**T2d.** "a close-up of a founded world letters no founding text, though its recipe carries it (Issue #392)".
- Setup:
  - `capital = founded.settlements.find((s) => s.kind === "capital")`;
  - `window = windowAround(founded, capital, 0.25)`;
  - `region = generateRegionWorld(founded, { window, gridW: 320, gridH: 240, title: regionTitle(founded, window) })`.
- Asserts `region.recipe.foundingText === EPIC`. This is the witness.
- Asserts `planCartouche(ctxFor(region, STYLES.antique, 1500)).founding` deep-equals `[]`, and that the layer has no founding group.
- Mutation: delete `|| world.region !== undefined` in `engravedLines`.

**T2e.** "the opening quotation mark and the first letter are set together as a larger capital in the title face, and the closing mark ends the last line (Issue #392)".
- For each `style` of `Object.values(STYLES)`, on `founded`:
  - first assert the founding group is found (the anchor);
  - the first founding line's first child is a `tspan` whose string is `"\u{201C}A"`;
  - its `"font-family" === style.fontFamilyTitle`;
  - `Number(tspan font-size) > Number(line font-size)`;
  - the line's second child is the string `" cold archipelago of black pines, iron"`;
  - the last line's string ends with `"\u{201D}"`, and the last line holds no tspan.
- Mutations:
  - drop `.toUpperCase()`: the tspan reads `"\u{201C}a"`;
  - the tspan holds only the capital, with the quote moved into the plain text: the tspan reads `"A"`;
  - `CAPITAL_SCALE` set to 1: the size assertion fails;
  - `CLOSE_QUOTE` dropped from `engravedLines`.

**Then, in commit 4:** implement the rest of the planned module and wire `cartouche.ts`. T2 goes green, and `test/site/hero-charts.test.ts` stays green.

### T4 and T3

Written red in commit 5, green in commit 6.

**T4, appended to `test/render/svg.test.ts`.** "unescapeXml undoes escapeXml, the ampersand last (Issue #392)".
- For each of `` `a "b" & 'c' <d>` ``, `"&lt; is written out"`, `"&amp;"` and `"plain"`: assert `unescapeXml(escapeXml(s)) === s`.
- Stub in commit 5: `export function unescapeXml(s: string): string { return s; }`. It reds on the first string.
- Mutation: replace `&amp;` first. `"&lt; is written out"` then comes back as `"< is written out"`.

**T3, appended to `test/render/recipe-meta.test.ts`.** `recipe-meta.ts` is untouched in commit 5, so T3a and T3c are red there. T3b passes and is a guard for the prover.

**T3a.** "a founded chart stamps its founding text, escaped, and the stamp redraws it byte for byte (Issue #392)".
- Setup:
  - `TRICKY = \`a "salt" & 'cedar' <coast> &lt; of the drowned kingdom\``;
  - `world = generateWorld(defaultRecipe(7, { foundingText: TRICKY }))`;
  - `svg = renderMap(world, { style: "antique" })`.
- Asserts:
  - `svg.includes(\`data-vellum-founding-text="${escapeXml(TRICKY)}"\`)`;
  - `svg.includes(escapeXml(\` founding=${JSON.stringify(TRICKY)}\`))`;
  - `deepEqual(recipeFromSvg(svg)?.recipe, world.recipe)`;
  - `renderMap(generateWorld(parsed.recipe), { style: parsed.style }) === svg`.
- Mutations: drop `unescapeXml` from the parse; drop the summary fragment; drop the emit spread.

**T3b.** "a chart with no founding text carries no founding stamp, and its recipe no founding key (Issue #392)".
- Seed 7. Asserts:
  - `doesNotMatch` `/data-vellum-founding-text/` and `/ founding=/`;
  - `"foundingText" in parsed.recipe` is `false`;
  - `deepEqual(parsed.recipe, world.recipe)`.
- Mutation: emit `"data-vellum-founding-text": r.foundingText ?? ""` unconditionally.

**T3c.** "a close-up of a founded world carries the founding text its parent needs (Issue #392)".
- Mirror the outline close-up test at the end of the file, with `defaultRecipe(7, { foundingText: "a drowned kingdom" })`.
- Assert `recipeFromSvg(svg)?.recipe.foundingText === "a drowned kingdom"`.
- Mutation: drop the parse line.

### What the prover owes

`vellum-guard-prover` gets one round, with each mutation named above, on:
- T1a to T1d, T2a to T2e, T3a to T3c, T4 and T5;
- the existing drift guard `test/site/hero-charts.test.ts`, which this plan names as the byte-identity proof for the absent path. It must red on each of these:
  - `foundingRise(0)` returns `GAP`;
  - `foundingNodes` returns an empty group for no lines;
  - `recipeAttrs` emits `"data-vellum-founding-text": r.foundingText ?? ""` unconditionally;
  - `recipeMetadataNode` appends ` founding=` for an absent field.

**What step 15 leaves to the implementer:** any guard changed after the prover's round, proved by its own mutation, committed first.

## Order of commits

Each commit is pushed. Subjects start `#392`, the trailer is `CLAUDE.md`'s, and the session link is the dispatcher's.

1. `#392 The plan, and the founding text's width rule, red`. The archived plan at `handbook/plans/300/392/392-plan.md`, the three-export stub shown under T1, and T1, red.
2. `#392 The founding text wraps by width units and never past a line`. The planned module's lines above `engravedLines`. T1 goes green.
3. `#392 The recipe carries the founding text, and the cartouche's tests, red`.
   - The field in `src/world/types.ts`.
   - `CartouchePlan.founding` with `founding: []` in `planCartouche`.
   - T5, green; T2, red on its anchors.
   - `npm run check` passes.
4. `#392 The cartouche engraves the founding text under the subtitle`.
   - The planned module, completed: its three imports, the seven constants, `engravedLines`, `foundingRise`, `openingCapital` and `foundingNodes`. The file then matches the plan's text exactly.
   - `cartouche.ts` wired as planned: `engravedLines(world)` in place of `[]`, the height, the block and `chartNumber`.
   - T2 goes green, and `npm test -- test/site/hero-charts.test.ts` stays green with no regen.
5. `#392 The stamp's tests, red`. T4 with the `unescapeXml` stub, and T3.
6. `#392 The stamp carries the founding text and reads it back`. `unescapeXml` and the three `recipe-meta.ts` edits. T3 and T4 go green.
7. `#392 The specs name the founding text`. The two spec edits below.

## Rosters and doctrine

**Rosters.** None. The change adds no page, sheet, suite, room or bundle. `node --test` collects the new files under `test/` by itself, and `test-support/source-read-list.ts` is not touched, since no new test reads a source file.

**`handbook/specs/engine-invariants.md`, "Identity versus view".** Insert directly after the paragraph opening "**Every option is deliberately one of two things**":

> **The founding text is the one recipe field the world ignores.** `foundingText` in `src/world/types.ts` carries a founded world's sentence to its cartouche and into its stamp, and `generateWorld` builds the same world with it or without it (`test/world/founding-text.test.ts`), so two charts that differ only in it draw the same land under different words.

**`handbook/specs/engine-invariants.md`, "Founding a world from a sentence".** In the paragraph opening "**What a surface may read from a founding.**", replace its first sentence ("`sentence` is the display form: the text to letter and to carry in a link, which founds itself again unchanged.") with:

> `sentence` is the display form: the text the cartouche letters, which a surface puts on the recipe as `foundingText` beside the overrides, and the text to carry in a link, which founds itself again unchanged.

**`handbook/specs/chart-dress.md`.** Insert directly after the paragraph opening "**A value that changes with the dress is a style token**":

> **A founded world engraves its founding text in the cartouche**, under the subtitle and above the chart number, from the recipe's `foundingText` (`src/render/layers/cartouche-founding.ts`). It is set upright in the style's `fontFamily` and `ink`, inside curly quotation marks; the opening mark and the first letter, uppercased, are set together in the style's `fontFamilyTitle` at a larger size, so the mark's top lines up with the capital's, and the closing mark ends the last line at the body size. The sizes, pitch and gaps are literals at the layer. `foundingLines` there wraps the text at `FOUNDING_LINE_UNITS` width units, a wide character (Han, kana, Hangul, an emoji, a fullwidth form) counting two and a mark or joiner none, and breaks a word longer than a line between two characters rather than let it run past the frame, never inside a joined emoji. The box grows by the block, so the chart number keeps its place below it, and a chart without the field draws the cartouche it always drew. A close-up letters no founding text, though its stamp carries it. **Provisional until the post-use review:** the opening capital inside quotation marks, built as ruled without a still of the pairing (Issue #392, Alex, 2026-10-28); a close-up lettering none; the block's upright full ink, its sizes, pitch and gaps, and the 48-unit line.

`README.md` is unchanged (ruling 1 of 2026-10-27). `handbook/specs/rulebook.md` is unchanged: its optional-field bullet is followed, not changed.

## Evidence

**Static checks:**
- `npm run check`
- `npm run lint`
- `npm run format:check`
- `grep -c -P '[^\x00-\x7F]' src/render/layers/cartouche-founding.ts`, which must print `0`.

**Unit tests:**
- The named run: `npm test -- test/render/cartouche-founding.test.ts test/render/cartouche-engraving.test.ts test/render/recipe-meta.test.ts test/render/svg.test.ts test/world/founding-text.test.ts test/site/hero-charts.test.ts test/render/furniture.test.ts test/render/legend.test.ts test/render/compass-placement.test.ts test/render/region-sea-furniture.test.ts test/world/region-sea-gate.test.ts`.
- Then the whole `npm test`, then `npm run astro:generate`.

**No regen:**
- `git diff --stat origin/main -- src/static` prints nothing.
- The drift guard is green.
- The PR body names both (Gate 6 item 7).

**e2e:** only the `render` suite, after `npm run build`: `VELLUM_E2E_SUITES=render npm run test:e2e`. Its `R4` compares the browser worker's draw against the committed chart, and the renderer changed. No other suite is touched, and the full local lanes are never run.

**`vellum-plate-reader` is owed at step 11, on the built code.**
- **What to render**, into the implementer's own `out/392-build/`:
  - the `epic` and `longest` world sheets in all four styles, legend on, each beside its control;
  - `capitals`, `oneword` and `cjk` in all four styles;
  - `short` (`"a drowned kingdom"`) in antique;
  - the epic close-up.
- **How:** each recipe is `defaultRecipe(f.seed, { ...f.overrides, foundingText: f.sentence })`, from `foundWorld` of the constants above. The close-up uses `windowAround(world, capital, 0.25)`, `gridW` 320, `gridH` 240, `regionTitle`, and `regionRecipe: { window, worldGridW, detail: 0 }`.
- **What to measure:**
  - each engraved line against the inner frame;
  - box heights;
  - the opening mark's ink top against the capital's, painted apart at device scale 4 as `measure.ts` in the main checkout's `out/392-capital-quotes/` does (read the method there, then write the probe in the implementer's own `out/`);
  - the closing mark as the last glyph of the last line;
  - forced-font rows: Georgia on antique, ink and nautical, and Arial on topographic, for `longest`, `capitals`, `oneword` and `cjk`.
- **What must match the ruled measurement:**
  - line counts 1, 2, 3, 3, 4 and 6;
  - box heights 146, 162, 178, 178, 194 and 226 at 1500 px;
  - the narrowest native side margin 51.3 px, within 0.5 px;
  - the narrowest forced-face margin 54.8 px, within 0.5 px;
  - the opening mark's top within 1 px of the capital's in every style;
  - no line crossing the frame in any face;
  - no founding group on the close-up.
- The folder gets its `notes.md` and page, per workflow step 6.

**The PR body names what is provisional** (`handbook/specs/conventions.md`, "Do not state a provisional ruling in the same voice as a ratified one"). These await the post-use review:
- the opening capital inside quotation marks, built as Alex ruled without a still of the pairing;
- close-ups lettering none;
- the planner's dress calls 1 to 3 below.

It also says which tests a re-decision would move:
- The tests pin structure: the block's place, its tokens, the capital-and-quote shape and the growth relation.
- No test pins the type size, the pitch, the gaps or the capital's scale, so a change to those moves the module's constants alone.
- A change to the 48-unit line moves T1b, T1d, T2a and T2e with it, since they pin where the epic and emoji fixtures wrap.

**The dry run, the record that the plan's code is what was measured.**
- On 2026-10-28, at 06d05cb4, the planned module above and the planned `cartouche.ts` edit stood in the planner's tree and rendered two sets, compared byte for byte:
  - the 24 ruled-look sheets the measurement read;
  - the 9 control sheets of the first sitting, the founded close-up among them, which must equal today's close-up.
- `out/392-dry-run/render-ruled.ts` printed "identical 33; differ 0" (`out/392-dry-run/render-ruled.log`).
- Over the same tree:
  - `npm run check` passed;
  - ESLint and Prettier were clean on the three source files;
  - the ASCII check printed 0;
  - 56 tests passed: the drift guard, `furniture`, `legend`, `compass-placement`, `region-sea-furniture`, `recipe-meta`, `map-renderer` and `region-sea-gate`.

## Calls made

The implementer copies these into its step 12 comment.

1. **The founding words are set upright, in the style's full ink and body face.**
   - The numbers: `style.ink`, `style.fontFamily`, 11.5 at 1500 px, lines 16 apart, the first 22 + 6 below the last subtitle line.
   - Rule: they are the world's own words, so they take the chart's full ink and read apart from the generated subtitle (italic, `inkSoft`). Every ink and face is a style token (acceptance 1; `handbook/specs/chart-dress.md`). The numbers are the measured sheets' (the fidelity rule).
2. **A line holds 48 width units.**
   - A wide character counts two, and a mark or joiner none.
   - Rule: the widest measured line of the ruled look, all capitals in Iowan Old Style, leaves 51.3 px each side of the 460 px frame.
   - Every one of the 200 sample sentences takes at most 3 lines.
3. **(New since the menu.) The opening quotation mark is set with the capital, in the title face at 1.7 times the body size; the closing mark stays at the body size.**
   - Rule: measured on 2026-10-28, the mark's top then meets the capital's within 0.75 px in every style; at the body size it sits 5 to 6 px low.
   - The glyphs are the curly U+201C and U+201D, which the stills Alex ruled from showed.
4. **No producer in this pull request.**
   - "Lettered only when at least one word was recognised" (Issue #390 ruling 8) is enforced where Issue #393 builds the recipe. That sub also holds the all-cancel case open.
   - Rule: the issue's scope line, and Gate 5 item 1.
5. **The summary's fragment is ` founding=` followed by the JSON-quoted text.** Rule: the region fragment follows it, so the text must be delimited.
6. **The parse reads any stamped text back as written**, unescaped and not validated. Rule: the text moves no world, and validating it would pull the founding word list into the render bundle.
7. **The sentence is not added to the chart's `aria-label`.** Rule: the issue's scope; the subtitle is not there either.
8. **No browser check; the fit is the step 11 plate read.** Rule: `handbook/specs/check-placement.md`, and the CI runner has none of the chart's faces.
9. **The block is a `<g id="cartouche-founding">` inside `#layer-cartouche`.** Rule: one handle for the tests and the plate reader, named after the file.
10. **The foot line moves verbatim into `chartNumber`.** Rule: `cartoucheText` measured 51 lines with the block added, against the lint's 50. Moving the group after the foot instead would change the measured bytes.
11. **The stamp's tests go in `test/render/recipe-meta.test.ts`.** Rule: the rulebook bullet says a new field "owes its own case there". The file stays under 400 lines.
12. **Escapes are written in brace form, and the module stays ASCII.** Rule: measured on 2026-10-27, a `\uXXXX` written through the Write tool lands as the literal character.
13. **(New since the menu.) A founding text that is empty or all spaces engraves nothing, not a pair of quotation marks. It still stamps as written.** Rule: a mark with no words is not an engraving, and the stamp's round trip holds.
14. **(New since the menu.) The capital is the first character after the opening mark, uppercased with `toUpperCase`, which reads no locale.** A sentence that starts with a digit or a punctuation mark keeps it as it is, at the capital's size. Rule: the founding cleanup keeps every call locale-free, and the renderer follows it.
15. **The issue body's paths are stale.**
    - `public/charts/*` and `public/og.png` are now `src/static/charts/*` and `src/static/og.png`.
    - The comment the body cites at `generate.ts:51` does not exist. T5 replaces it as the record that the world ignores the field.

## Rulings folded

What each 2026-10-28 ruling changed in this plan:

1. **The capital inside quotation marks.**
   - The module gains `CAPITAL_SCALE`, `CAPITAL_RISE`, `OPEN_QUOTE`, `CLOSE_QUOTE`, the quotation marks in `engravedLines` and `openingCapital`.
   - Empty text guard: `engravedLines` refuses a blank text.
   - The opening mark's size and alignment were settled by measurement (Calls made 3).
   - Box heights rose 6 px. The narrowest margin moved to 51.3 px.
   - T2a's expected lines changed, and T2e is new.
   - The plate read's targets changed, and the chart-dress paragraph and its provisional line say so.
2. **The world chart only.** `engravedLines` keeps its close-up gate, and T2d holds it.
3. **The cap stays 120.** Nothing in `src/world/founding/` changes.
4. **The name.** The field is `foundingText`, the stamp `data-vellum-founding-text`, the summary fragment ` founding=` and the file `cartouche-founding.ts`, as planned.

## Stop conditions

Hand back, rather than adapt, when any of these happens:

- **A planned file moved on main.** `git diff --stat 06d05cb4 origin/main -- src/world/types.ts src/render/recipe-meta.ts src/render/svg.ts src/render/layers/cartouche.ts test/render/recipe-meta.test.ts test/render/svg.test.ts src/world/generate.ts src/world/region.ts` prints anything. Issue #852, still open, edits `src/world/types.ts`, `src/render/recipe-meta.ts` and `test/render/recipe-meta.test.ts`. Whoever lands second reconciles, and if that is this branch, the reconcile is a revision.
- **The drift guard reds.** `test/site/hero-charts.test.ts` reds after commit 4 or 6. The absent path is then not byte-identical. Never run a regen to green it (`handbook/specs/engine-invariants.md`, "Read a structural drift red as a question").
- **The lexicon moved under the fixture.** `foundWorld(EPIC)` refuses, or its `steered` is empty.
- **The wrap differs.** `foundingLines(EPIC)` is not `EPIC_LINES`, or the founded layer's lines are not `EPIC_ENGRAVED`, once the module is written as above.
- **A test outside this plan reds.** For instance, one that builds a `CartouchePlan` literally, or one that pins the cartouche's text count.
- **A `CartouchePlan` is built elsewhere.** `npm run check` reports one built somewhere other than `planCartouche`. `test/render/compass-placement.test.ts` casts one, which type-checks.
- **The lint's size limits.** `cartoucheText`, `openingCapital` or any new function lints over 50 lines, or `test/render/recipe-meta.test.ts` over 400.
- **The plate read disagrees.** The step 11 numbers differ from the ruled measurement beyond the stated bounds, or a founding line crosses the inner frame in any face.
- **`R4` reds** in the `render` suite.
