# Vellum

*An atelier of imaginary cartography.*

[![CI](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml/badge.svg)](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml)

**Live gallery: <https://ahl-gram.github.io/Vellum/>** · draw your own
in the **[Explorer](https://ahl-gram.github.io/Vellum/explorer/)** (the
whole engine runs client-side) · or read the
**[FAQ](https://ahl-gram.github.io/Vellum/faq/)**.

Vellum surveys worlds that don't exist and drafts them as atlas charts.
Give it a seed; it invents an island, simulates the rain that carves its
rivers, grows its forests, founds its harbor towns, names everything in
one of six invented languages, partitions the land into quarrelsome
realms, and then sits down at the drafting table and draws the map,
complete with parchment texture, hatched mountain ranges, a compass
rose, a sea serpent, and a title cartouche.

Same seed, same world, byte-identical SVG. Every chart is reproducible
from the number printed in its corner.

## Quick start

```bash
git clone https://github.com/ahl-gram/Vellum
cd Vellum
npm install                       # dev-only: typescript + @types/node
npm run chart -- --seed 42        # → out/chart-42-antique.svg
open out/chart-42-antique.svg     # macOS; otherwise open the file in any browser
```

Vellum needs **Node 23.6+** and runs its TypeScript directly, with no
build step. Everything it draws lands in `out/` (gitignored); each chart is a
plain SVG you can open in a browser, drop into a document, or rasterize with
`--png`.

Nothing to install? The **[Explorer](https://ahl-gram.github.io/Vellum/explorer/)**
runs the whole engine in your browser: type a seed and draw.

## Commands

Every command is run the same way. Under `npm run`, put `--` before the flags
so they reach Vellum instead of npm:

```bash
npm run chart   -- --seed 42 --style antique   # one chart → out/
npm run chart   -- --seed 42 --legend          # add a key explaining the symbols
npm run chart   -- --style nautical            # no --seed → random (and printed)
npm run poster  -- --seed 42                   # wall art: 480x360 grid, 4200px + PNG
npm run atlas   -- --seed 42                   # HTML book: 3 styles, regions, gazetteer
npm run gallery -- --seed 100 --count 12       # contact sheet of 12 worlds
npm run demo    -- --seed 42                   # one world in all four styles
npm test                                       # full test suite
npm run check                                  # typecheck
npm run site                                   # rebuild the docs/ showcase
```

Run `node src/cli/main.ts help` for the built-in usage screen.

| Command | Draws | Honors |
|---|---|---|
| `chart` | one SVG (add `--png` for a raster too) | `--seed --style --type --band --land --grid --width --legend` |
| `poster` | one large SVG **and** PNG, a 480×360 grid at 4200px (~14″ at 300 dpi) | `--seed --style --scale --legend` |
| `atlas` | a multi-page HTML atlas: the world in three styles, two regional close-ups, and a settlement gazetteer with procedural travelers' notes (*"Its quays smell of dates and old rope."*), each chart carrying a symbol key | `--seed --type --band --land`: always renders every style, so `--style` is ignored |
| `gallery` | an HTML contact sheet of *N* worlds, walking outward from the seed | `--seed` (starting point), `--count`, `--style` |
| `demo` | one world drawn in all four styles | `--seed --grid --width --legend` |

### Flags

- `--seed <n>`: the world's identity. Omit for a random seed (it's printed so you can reuse it).
- `--style <s>`: `antique` (default) · `topographic` · `ink` · `nautical`
- `--type <t>`: `island` · `archipelago` · `continent` · `citystate` *(default: chosen by the seed)*
- `--band <b>`: climate `temperate` · `tropical` · `polar` *(default: chosen by the seed)*
- `--land <f>`: land fraction, `0.1`–`0.7` *(default: set by map type)*
- `--grid <WxH>`: simulation resolution *(default `320x240`; poster `480x360`)*
- `--width <px>`: output width in pixels, `400`–`6000` *(default `1500`; poster `4200`)*
- `--legend`: draw a compact, style-aware key explaining the chart's symbols and labels *(default: off; the atlas always includes one)*
- `--png`: also rasterize to PNG using an installed browser; set `VELLUM_BROWSER` to choose which
- `--scale <n>`: PNG pixel scale, `0.5`–`4` *(default `2`; poster `1`)*
- `--count <n>`: gallery only, how many worlds, `1`–`48` *(default `12`)*
- `--out <path>`: override where the file is written

> **Reproducing a chart.** Every chart embeds its full recipe, so a saved SVG is
> self-describing: the root `<svg>` carries `data-vellum-*` attributes (seed,
> type, band, land, grid, style, and engine version) alongside a readable
> `<metadata>` summary. `recipeFromSvg()` in `src/render/recipe-meta.ts` reads
> them back, and re-rendering `generateWorld(recipe)` at the default width
> reproduces the map byte-for-byte (width and legend are display options, not
> part of a world's identity). The seed and style are also printed on each run
> and stamped in the margin, so if those are all you have, pass any forced
> `--type`, `--band`, or `--land` again with the seed to redraw the same map.

## The styles

- **antique**: parchment, waterlined coasts, hatched mountain glyphs,
  tree fields, realm tints, rhumb lines, cartouche, sea monsters.
- **topographic**: hypsometric tints, shallow-water bands, contour
  lines, cased red roads. A modern survey plate.
- **ink**: monochrome pen-and-ink linework.
- **nautical**: white-water sea chart with fathom soundings scattered over
  open water, a shoal tint out to the dashed danger line, rock-awash
  marks, prevailing-wind arrows, navy linework, prominent rhumb lines.

## How a world gets made

Each stage is a pure function of the stage before it, and every random
choice comes from a labeled fork of the master seed (`fork("names")`,
`fork("sites")` …), so adding a stage never reshuffles the others.

1. **Terrain**: domain-warped fractal gradient noise with a ridged
   component, shaped by map-type falloff. Sea level is chosen by
   quantile so the land fraction always hits its target.
2. **Hydrology**: priority-flood depression filling guarantees every
   land cell drains to the ocean; D8 steepest descent + moisture-
   weighted rain accumulate into rivers with tapered widths and
   tributary junctions.
3. **Climate & biomes**: latitude + elevation lapse temperature,
   coast/river-distance moisture, a Whittaker-style biome matrix with
   alpine and shoreline overrides.
4. **Society**: settlements scored by harbors, river mouths, and flat
   fertile land; roads grown by Dijkstra with a reuse discount so trunk
   corridors emerge; realms partitioned by terrain-cost Voronoi, with
   borders that prefer ridges and rivers.
5. **Names & lore**: syllable-grammar generators for six invented
   cultures (thalassic, norden, veshari, sylvan, oromi, draket) name
   every town, river, sea, and realm; a template-grammar lore writer
   drafts the gazetteer notes.
6. **Rendering**: marching-squares coastlines and contours (with
   saddle resolution and boundary closing), Chaikin smoothing, a tiny
   immutable SVG builder, and ~15 layer renderers up through the
   parchment-texture overlay (`feTurbulence`) and frame.

**Regional zoom** falls out of the architecture: elevation is a
continuous function of world-space coordinates, so the atlas's
"Environs of …" charts re-sample the same world through a smaller
window at finer resolution; coastlines, mountains, and settlements all
line up with the world chart.

## Inventing a name language

Each of the six cultures is a plain data object (the `Culture` type) in
`src/society/names.ts`, collected in the `CULTURES` array. That object is all it
takes to define how a world's names sound, so you can retune an existing culture
or add your own to lean the names toward a real language.

A culture has three sound inventories plus the rules that combine them:

- `onsets` (**O**), `nuclei` (**N**), `codas` (**C**): the syllable pieces,
  given as chunks rather than single letters. Onsets like `"th"`, `"vel"`,
  `"sten"`; nuclei including diphthongs like `"ai"`; codas like `"nd"`, `"mor"`,
  or `""` (none).
- `patterns`: strings over `O`/`N`/`C` such as `"ONC"` or `"ONCONC"`. Vellum
  walks a pattern and picks one piece per slot, so `"ONON"` might yield
  `mar`+`a`+`vel`+`i` = `"maraveli"`. Coda-light, nucleus-heavy patterns read
  open and flowing; cluster-heavy ones read blocky.
- `townSuffixes` and the feature templates (`riverTemplates`, `peakTemplates`,
  `seaTemplates`, `lakeTemplates`, `forestTemplates`, `realmTemplates`): these
  dress a bare stem into a finished name, with `%` standing in for the stem, as
  in `"The Sea of %"` or `"Mount %"`.

A Japanese-leaning culture, for example:

```ts
{
  id: "yamato",
  onsets: ["k","s","t","n","h","m","y","r","w","g","z","d","b","ch","sh"],
  nuclei: ["a","i","u","e","o"],           // five pure vowels, no diphthongs
  codas:  ["","","","n"],                  // mostly open syllables, rare -n
  patterns: ["ONON","ONONON","ONONONON"],  // strict CV, no clusters
  townSuffixes: ["mura","machi","jima","yama","saki"],
  riverTemplates: ["% -gawa","The % River","The Waters of %"],
  peakTemplates: ["Mount %","% -san","The % Heights"],
  // ...sea/lake/forest/realm templates to taste
}
```

That yields stems like *Sakira* or *Kanashima* and names such as *Mount Hatsu*
or *Kana-gawa*.

Two things to know:

- **It is phonotactic mimicry, not linguistics.** A culture captures the shape
  and sound of a language, not its grammar, morphology, or meaning. There is no
  vowel harmony, tone, or real orthography; put any special characters straight
  in the inventories.
- **Editing the cultures re-rolls existing seeds.** Names come from a labeled
  fork of the seed, so adding, removing, reordering, or editing a culture shifts
  the draw sequence and renames every world: a seed you saved comes back with a
  different identity. After a naming change, rebuild the showcase
  (`npm run site`) and update the hero captions.

## Project shape

```
src/
  core/       seeded RNG (labeled forks), Float64 fields, BFS, min-heap
  noise/      hash-lattice gradient noise, fBm, ridged, domain warp
  terrain/    heightfield, sea level, marching squares, slope
  hydrology/  priority-flood, D8 flow, river tracing
  climate/    temperature, moisture, biomes
  society/    names, settlements, roads, realms, lore
  render/     styles, layers/ (18 of them), svg builder, projection
  world/      generate.ts (pipeline), region.ts (zoom windows)
  cli/        main.ts, atlas.ts, gallery.ts, raster.ts (PNG/poster)
test/         157 tests, node:test, mirrors src/
docs/explorer the same engine, tsc-emitted as browser ES modules
```

Zero runtime dependencies. Node 23.6+ runs the TypeScript directly
(`erasableSyntaxOnly`). Dev dependencies are `typescript` and
`@types/node` for `tsc --noEmit`.

## Development notes

Built test-first for the algorithmic core (RNG, noise, marching
squares, flow, rivers, biomes, names, placement) with structural tests
pinning the renderer's contract (layer ids, balanced tags, no NaN,
byte-determinism). Aesthetics were iterated with a screenshot loop:
render SVG → headless-browser PNG → look at the map → adjust.

A few favorite emergent behaviors, none individually programmed:

- Lakes: priority-flood treats below-sea-level depressions as water,
  so inland lakes appear with their own waterlined shores, and the largest
  earn names (*The Bairasha Basin*).
- Estuaries: rivers widen toward their mouths because accumulation
  grows monotonically downstream.
- Mountain passes: roads thread between glyph ranges because slope is
  the dominant Dijkstra cost.
- Realm borders follow rivers and ridgelines because crossing them
  costs extra.

## License

Vellum's source code is released under the [MIT License](LICENSE).

Maps you generate with Vellum are dedicated to the public domain (CC0): use
them for anything, including commercial work, with no restrictions and no
attribution required.
