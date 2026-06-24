# Vellum

*An atelier of imaginary cartography.*

[![CI](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml/badge.svg)](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml)

**Live gallery: <https://vellum.route12b.net/>** · draw your own
in the **[Explorer](https://vellum.route12b.net/explorer/)** (the
whole engine runs client-side) · or read the
**[FAQ](https://vellum.route12b.net/faq/)**.

Vellum surveys worlds that don't exist and drafts them as atlas charts.
Give it a seed and it invents a landmass, simulates the rain that carves its
rivers, grows its forests, founds its harbor towns, names everything in
one of six invented languages, and partitions the land into quarrelsome
realms. Then Vellum sits down at the drafting table and draws the maps,
complete with parchment texture, hatched mountain ranges, a compass
rose, a sea serpent, and a title cartouche.

Same seed, same world, identical SVG. Every chart is reproducible
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

> **No Node.js?** The **[Explorer](https://vellum.route12b.net/explorer/)**
> runs the whole engine in your browser: type a seed and draw.

## Commands

Every command is run the same way. Under `npm run`, put `--` before the flags
so they reach Vellum instead of npm:

```bash
npm run chart   -- --seed 42 --style antique   # one chart → out/
npm run chart   -- --seed 42 --legend          # add a key explaining the symbols
npm run chart   -- --seed 42 --arms            # blazon each realm's coat of arms
npm run chart   -- --seed 42 --theme moisture  # a thematic data plate (rainfall)
npm run chart   -- --style nautical            # no --seed → random (and printed)
npm run poster  -- --seed 42                   # wall art: same world, 4200px + PNG
npm run atlas   -- --seed 42                   # HTML book: 3 styles, regions, gazetteer
npm run atlas   -- --seed 42 --pdf             # ...also bound into a single PDF
npm run gallery -- --seed 100 --count 12       # contact sheet of 12 worlds
npm run demo    -- --seed 42                   # one world in all four styles
npm test                                       # full test suite
npm run check                                  # typecheck
npm run site                                   # rebuild the docs/ showcase
npm run og                                     # rebuild the committed social card (docs/og.png)
```

Run `node src/cli/main.ts help` for the built-in usage screen.

| Command | Draws | Honors |
|---|---|---|
| `chart` | one SVG (add `--png` for a raster too) | `--seed --style --type --band --land --grid --width --legend --arms --theme` |
| `poster` | one large SVG and PNG at 4200px (~14″ at 300 dpi) | `--seed --style --scale --legend --arms --theme` |
| `atlas` | a multi-page HTML atlas: world in four styles, four thematic plates, two regional close-ups, a gazetteer, and a coat-of-arms plate; add `--pdf` to bind it into one PDF | `--seed --type --band --land --pdf` |
| `gallery` | an HTML contact sheet of *N* worlds, walking outward from the seed | `--seed` (starting point), `--count`, `--style` |
| `demo` | one world drawn in all four styles | `--seed --grid --width --legend --arms --theme` |

### Flags

| Flag | Description |
|---|---|
| `--seed <n>` | The world's identity. Omit for a random seed (it's printed so you can reuse it). |
| `--style <s>` | `antique` (default) · `topographic` · `ink` · `nautical` |
| `--type <t>` | `island` · `archipelago` · `continent` · `citystate` *(default: chosen by the seed)* |
| `--band <b>` | Climate band: `temperate` · `tropical` · `polar` *(default: chosen by the seed)* |
| `--land <f>` | Land fraction, `0.1`–`0.7` *(default: set by map type)* |
| `--grid <WxH>` | Simulation resolution *(default `320x240`)* |
| `--width <px>` | Output width in pixels, `400`–`6000` *(default `1500`; poster `4200`)* |
| `--legend` | Draw a compact, style-aware key explaining the chart's symbols and labels *(default: off; the atlas always includes one)* |
| `--arms` | Blazon each realm's coat of arms beside its label *(default: off; the atlas always shows them as a banner plate)* |
| `--theme <t>` | Render a thematic data plate instead of the usual symbology: `vegetation` · `climate` · `moisture` · `population` *(default: off; the atlas includes all four)* |
| `--png` | Also rasterize to PNG using an installed browser; set `VELLUM_BROWSER` to choose which |
| `--pdf` | Atlas only. Bind the atlas into a single PDF via an installed browser. Degrades gracefully if no browser is found. |
| `--scale <n>` | PNG pixel scale, `0.5`–`4` *(default `2`; poster `1`)* |
| `--count <n>` | Gallery only: how many worlds, `1`–`48` *(default `12`)* |
| `--out <path>` | Override where the file is written |

### Reproducing a chart

Every chart embeds its full recipe: the root `<svg>` carries `data-vellum-*`
attributes (seed, type, band, land, grid, style, and engine version) alongside
a readable `<metadata>` summary. `recipeFromSvg()` in `src/render/recipe-meta.ts`
reads them back, and re-rendering `generateWorld(recipe)` at the default width
reproduces the map byte-for-byte.

Display and output options (`--width`, `--legend`, `--arms`, `--theme`, `--png`,
`--pdf`, `--scale`) change how a world is drawn or exported, not the world itself,
so they are not stamped in the SVG and must be re-supplied to reproduce a
particular view. (Arms are still fully deterministic from the seed; only the choice
to draw them is a view option.)

If all you have is a saved chart, the seed and style are printed in the margin. Pass
any forced `--type`, `--band`, or `--land` again alongside the seed to redraw the
same map. Regional inset charts (the atlas's "Environs of ..." surveys) carry no
recipe, since redrawing one also needs its zoom window.

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

## Seed of the day

[`docs/seed-of-the-day/`](https://vellum.route12b.net/seed-of-the-day/) is a
hand-authored page that draws a fresh world each day. The seed is the current
date in UTC read as an integer `YYYYMMDD` (2026-06-19 -> seed `20260619`), mapped
by `seedForDate()` in `src/world/seed-of-the-day.ts`. UTC, so everyone sees the
same world on the same calendar day.

It renders client-side: `app.js` imports the same browser engine the Explorer
uses (`../explorer/engine/`) and draws today's chart on load, with a gazetteer
note from its capital. Because the date is read in the browser, the page stays
current with no rebuild, so it is **not** regenerated by `npm run site`; only the
shared engine under `docs/explorer/engine/` is (re)built by the deploy. The
social-preview image for a shared link is the static site card, not today's
world.

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

---

## For contributors

### Project shape

```
src/
  core/       seeded RNG (labeled forks), Float64 fields, BFS, min-heap
  noise/      hash-lattice gradient noise, fBm, ridged, domain warp
  terrain/    heightfield, sea level, marching squares, slope
  hydrology/  priority-flood, D8 flow, river tracing
  climate/    temperature, moisture, biomes
  society/    names, settlements, roads, realms, lore
  render/     styles, layers/ (19 of them), svg builder, projection
  world/      generate.ts (pipeline), region.ts (zoom windows)
  cli/        main.ts, atlas.ts, gallery.ts, raster.ts (PNG/PDF/poster)
test/         188 tests, node:test, mirrors src/
docs/explorer the same engine, tsc-emitted as browser ES modules
```

Zero runtime dependencies. Node 23.6+ runs the TypeScript directly
(`erasableSyntaxOnly`). Dev dependencies are `typescript` and
`@types/node` for `tsc --noEmit`.

### The Explorer's render path

The web [Explorer](https://vellum.route12b.net/explorer/) runs the whole
engine in your browser, off the main thread, so the page stays responsive while
a world is drawn. `docs/explorer/index.html` loads `app.js`, which spawns a Web
Worker with `new Worker("./worker.js", { type: "module" })`.

The worker is a stateless request/response service. The page posts a job,
`{ kind: "draw" | "atlas", seed, overrides, ... }`, and the worker regenerates
the world from scratch and replies with the chart SVG (`draw`) or the fully
bound atlas as strings (`atlas`). Nothing is kept between jobs, so the result is
byte-identical to running the engine on the main thread. The worker imports the
same browser engine the page uses: `docs/explorer/engine/`, emitted from the
TypeScript source by `tsconfig.browser.json` as ES modules.

If the worker can't be constructed (a `file://` page, a strict CSP, an older
browser), `app.js` runs the identical engine inline on the main thread, so the
Explorer always works. `window.__vellumUsesWorker()` reports which path is live.

`worker.js`, `app.js`, and the Explorer's `index.html` are hand-authored: they
are not part of the tsc-emitted engine and are never used by the CLI. See
[`docs/explorer/worker.js`](docs/explorer/worker.js) and
[`docs/explorer/app.js`](docs/explorer/app.js) for the full detail.

### Social preview and favicon

The hand-authored pages carry Open Graph / Twitter Card tags and a favicon.
Two assets are committed under `docs/` (not generated at deploy time, since the
Pages build runs in CI with no browser to rasterize):

- `docs/og.png`, the 1200x630 preview card: the hero chart (seed 42) letterboxed
  beside the Vellum wordmark. Rebuild with `npm run og` (needs an installed
  browser) whenever the hero map changes; the card SVG lands in `out/`.
- `docs/favicon.svg`, a hand-drawn compass-rose mark, linked from every page.

The Pages deploy build (`npm run build`) copies `docs/` into `dist/`, so both
assets ship as-is.
