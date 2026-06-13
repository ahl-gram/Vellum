# Vellum

*An atelier of imaginary cartography.*

**Live gallery: <https://ahl-gram.github.io/Vellum/>**

Vellum surveys worlds that don't exist and drafts them as atlas charts.
Give it a seed; it invents an island, simulates the rain that carves its
rivers, grows its forests, founds its harbor towns, names everything in
one of four invented languages, partitions the land into quarrelsome
realms — and then sits down at the drafting table and draws the map,
complete with parchment texture, hatched mountain ranges, a compass
rose, a sea serpent, and a title cartouche.

Same seed, same world, byte-identical SVG. Every chart is reproducible
from the number printed in its corner.

```
$ npm run chart -- --seed 42
seed 42 · island · The Isle of Mukhu
world 335ms · render 32ms · out/chart-42-antique.svg
```

## Commands

```bash
npm run chart -- --seed 42 --style antique     # one chart
npm run chart -- --style nautical              # random seed (printed)
npm run demo  -- --seed 42                     # all four styles
npm run atlas -- --seed 42                     # full HTML atlas
node src/cli/main.ts gallery --count 12        # contact sheet of worlds
npm run site                                   # rebuild docs/ showcase
npm test                                       # full test suite
npm run check                                  # typecheck
```

Options: `--seed n`, `--style antique|topographic|ink|nautical`,
`--type island|archipelago|continent`, `--band temperate|tropical|polar`,
`--land 0.1–0.7`, `--grid WxH`, `--width px`, `--count n`, `--out path`.

The **atlas** command binds a small book: the world chart in three
styles, two regional close-up surveys, and a gazetteer of every
settlement with procedurally written travelers' notes
(*"Its quays smell of dates and old rope."*) — all in a single
`index.html` you can open in a browser.

## The styles

- **antique** — parchment, waterlined coasts, hatched mountain glyphs,
  tree fields, realm tints, rhumb lines, cartouche, sea monsters.
- **topographic** — hypsometric tints, shallow-water bands, contour
  lines, cased red roads. A modern survey plate.
- **ink** — monochrome pen-and-ink linework.
- **nautical** — white-water sea chart: fathom soundings scattered over
  open water, a shoal tint out to the dashed danger line, rock-awash
  marks, navy linework, prominent rhumb lines.

## How a world gets made

Each stage is a pure function of the stage before it, and every random
choice comes from a labeled fork of the master seed (`fork("names")`,
`fork("sites")` …), so adding a stage never reshuffles the others.

1. **Terrain** — domain-warped fractal gradient noise with a ridged
   component, shaped by map-type falloff. Sea level is chosen by
   quantile so the land fraction always hits its target.
2. **Hydrology** — priority-flood depression filling guarantees every
   land cell drains to the ocean; D8 steepest descent + moisture-
   weighted rain accumulate into rivers with tapered widths and
   tributary junctions.
3. **Climate & biomes** — latitude + elevation lapse temperature,
   coast/river-distance moisture, a Whittaker-style biome matrix with
   alpine and shoreline overrides.
4. **Society** — settlements scored by harbors, river mouths, and flat
   fertile land; roads grown by Dijkstra with a reuse discount so trunk
   corridors emerge; realms partitioned by terrain-cost Voronoi, with
   borders that prefer ridges and rivers.
5. **Names & lore** — syllable-grammar generators for four invented
   cultures (thalassic, norden, veshari, sylvan) name every town,
   river, sea, and realm; a template-grammar lore writer drafts the
   gazetteer notes.
6. **Rendering** — marching-squares coastlines and contours (with
   saddle resolution and boundary closing), Chaikin smoothing, a tiny
   immutable SVG builder, and ~15 layer renderers up through the
   parchment-texture overlay (`feTurbulence`) and frame.

**Regional zoom** falls out of the architecture: elevation is a
continuous function of world-space coordinates, so the atlas's
"Environs of …" charts re-sample the same world through a smaller
window at finer resolution — coastlines, mountains, and settlements all
line up with the world chart.

## Project shape

```
src/
  core/       seeded RNG (labeled forks), Float64 fields, BFS, min-heap
  noise/      hash-lattice gradient noise, fBm, ridged, domain warp
  terrain/    heightfield, sea level, marching squares, slope
  hydrology/  priority-flood, D8 flow, river tracing
  climate/    temperature, moisture, biomes
  society/    names, settlements, roads, realms, lore
  render/     styles, layers/ (15 of them), svg builder, projection
  world/      generate.ts (pipeline), region.ts (zoom windows)
  cli/        main.ts, atlas.ts
test/         137 tests, node:test — mirrors src/
```

Zero runtime dependencies — Node 23.6+ runs the TypeScript directly
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
  so inland lakes appear with their own waterlined shores — the largest
  earn names (*The Bairasha Basin*).
- Estuaries: rivers widen toward their mouths because accumulation
  grows monotonically downstream.
- Mountain passes: roads thread between glyph ranges because slope is
  the dominant Dijkstra cost.
- Realm borders follow rivers and ridgelines because crossing them
  costs extra.
