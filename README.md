# Vellum

*An atelier of imaginary cartography.*

[![CI](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml/badge.svg)](https://github.com/ahl-gram/Vellum/actions/workflows/ci.yml)

![The Vellum wordmark and a compass rose on a dark walnut ground, with the chart of seed 42 faint behind](public/og.png)

**Vellum lives at <https://www.vellumworlds.com/>.** No install, no account:
the whole engine runs client-side in your browser.

Vellum surveys worlds that don't exist and drafts them as atlas charts.
Give it a seed and it invents a landmass, simulates the rain that carves its
rivers, grows its forests, founds its harbor towns, names everything in
one of ten invented languages, and partitions the land into quarrelsome
realms. Then Vellum sits down at the drafting table and draws the maps,
complete with parchment texture, hatched mountain ranges, a compass
rose, a sea serpent, and a title cartouche.

| Room | What happens there |
|---|---|
| **[Explorer](https://www.vellumworlds.com/explorer/)** | Type a seed, draw its world, zoom into its regions |
| **[Reading Room](https://www.vellumworlds.com/reading-room/)** | Watch any seed's world unfold: the founding voyage, then its recorded ages, on one continuous timeline |
| **[Print Room](https://www.vellumworlds.com/print-room/)** | Poster-size SVG or PNG of any seed, print the bound atlas to PDF, download a self-contained atlas |
| **[Seed of the Day](https://www.vellumworlds.com/seed-of-the-day/)** | Today's world, the same for everyone, plus the Daily Hunt |
| **[Atlas](https://www.vellumworlds.com/atlas/)** | The hero world (seed 42) as a bound volume |
| **[Gallery](https://www.vellumworlds.com/gallery/)** | A twelve-world contact sheet |
| **[Q & A](https://www.vellumworlds.com/faq/)** · **[Glossary](https://www.vellumworlds.com/glossary/)** | How it all works; the vocabulary printed on the charts |

The Atlas is drawn into the site at build time rather than authored as a page,
and the Gallery's charts are generated the same way.

The daily seed is the current UTC date read as an integer `YYYYMMDD`, so
everyone sees the same world on the same calendar day, and the page never
needs a rebuild: it draws itself in your browser when you load it.

## Same seed, same world

Every chart is reproducible from the number printed in its corner. The root
`<svg>` embeds its full recipe as `data-vellum-*` attributes, and re-rendering
that recipe reproduces the map byte for byte. The
[Q & A](https://www.vellumworlds.com/faq/) covers seeds, determinism, and how to
reproduce a saved chart in detail.

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
5. **Names & lore**: syllable-grammar generators for ten invented
   cultures name every town, river, sea, and realm; a template-grammar
   lore writer drafts the gazetteer notes.
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

Each of the ten name cultures is a plain data object (the `Culture` type in
`src/society/names.ts`): three sound inventories (onsets, nuclei, codas), the
syllable patterns that combine them, and the templates that dress a bare stem
into "The Sea of %" or "Mount %". Retune one, or add your own to lean a
world's names toward any sound you like. It is phonotactic mimicry, not
linguistics: a culture captures the shape and sound of a language, never its
grammar or meaning.

One warning: names come from a labeled fork of the seed, so editing the
cultures renames every world. A naming change re-rolls existing seeds, owes a
hero-chart regen (`npm run charts:regen` + `npm run og`), and must respect the
**covenant seed**: seed 42's culture pick must keep landing on oromi across
roster changes, so the golden world's every name stays bit-identical.
`test/world/covenant-seed42.test.ts` fails loudly if it ever moves.

## Run it locally

```bash
git clone https://github.com/ahl-gram/Vellum
cd Vellum
npm install
npm run dev        # the full site, Explorer included, on a local Astro dev server
```

Vellum needs **Node 24+**.

### The CLI

The engine is also a command-line tool that draws one chart at a time, straight
from the TypeScript source with no build step:

```bash
npm run chart -- --seed 42                     # → out/chart-42-antique.svg
npm run chart -- --seed 42 --style nautical    # a different drafting table
npm run chart -- --seed 42 --theme moisture    # a thematic data plate (rainfall)
node src/cli/main.ts help                      # the full flag reference
```

Charts land in `out/` (gitignored) as plain SVGs: open them in a browser, drop
them into a document, or add `--png` to rasterize. The help screen documents
every flag (styles, map types, climate bands, coastline raggedness, legends,
coats of arms, PNG export).

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

The house rules live in `specs/`: what the generator guarantees about a world,
how the site is authored and shipped, the look and feel, the order of operations
from a filed issue to a pull request, and the sequencing rules themselves. They
are normative and kept current, which is more than a summary here could promise.
