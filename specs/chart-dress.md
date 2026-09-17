# The chart's own dress

The charts are the thing the site exists to show, and they are dressed on their own terms.

This file holds how a chart is dressed, in the renderer and in what the site does with a drawn
sheet. The world the chart draws is `specs/engine-invariants.md`'s; what a change to the dress
costs (a regen, the golden, a re-roll) is `specs/rulebook.md`'s; the site's own look around the
chart is `specs/ui-design.md`'s, and its preamble's rule that the guard pinning a named value is
right if the two disagree holds here too. Read it before any change to a chart's dress: a style, a
layer's ink, a label's treatment, or how the site mounts a sheet.

**A style is a palette over identical geometry.** Antique, topographic, ink and nautical draw the
same world; only the colours, the paper and the lettering change. Antique is the default and is what
a bare request draws.

**A new dress replaces one rather than adding another.** Ruled for the Ribbon's painted plate on
#426 (2026-09-03): the limner's colour took the place of the antique dress rather than becoming a
third option, because an Ogilby plate was sold plain or hand-coloured, which is ink and antique
already. Read as a general rule this is a generalization of that one ruling, not itself ratified, so
treat it as the question to ask (what does this dress replace?) rather than as a refusal.

**A derived plate falls back through the dresses in order**: an ink chart yields an ink plate,
anything else yields antique. That two-dress rule is why a mixed collection reads honestly, and each
sheet keeps the dress it was drawn in rather than being harmonized to its neighbours.

**The dress gates what the engine will do.** The finer redraft is enabled on the antique dress alone,
so every collectible survey is antique and the only other dress that can reach a gathered sheet is a
prospect's pen and ink. A feature that gathers charts inherits that gate whether it means to or not.

**A sheet stands on the desk in one dressing**: a single hairline in the pale tan and the house sheet
shadow, cast in chart ink. The shadow's depth is deeper than it looks like it should be, and
deliberately so: it was arrived at from a bug where an armed survey wore the hairline and shadow
twice in exact register, which read better than the single pass and was ratified at the doubled
value (#367). The mount is qualified on the marker the renderer stamps on a chart and nothing else
carries, so keep that qualifier or the doubling comes back.

**The chart's lettering ink is not the site's prose ink** and the two are not to be unified: the
chart side is inside the byte-determinism contract, and the site quotes it as a token instead.

**A value that changes with the dress is a style token; a value that holds across every dress is
written at the layer.** A border is tokenized whole, its ink and its geometry alike (`borderStroke`,
`borderWidth`, `borderDash` and `borderOpacity` in `src/render/style.ts`), because a dress changes
how a border is drawn and not only what colour it is. A realm name takes its ink and its halo from
tokens too, but its type size, tracking, weight, opacity and halo width sit inline in
`featureLabelsLayer` (`src/render/layers/feature-labels.ts`): that treatment is what keeps the name
legible over any dress, so it is one decision rather than a handful. Do not promote such a literal to a
token to look tidy, and do not add a style-varying value to a layer.

**Ink arms hatch the FIELD, after Petra Sancta, and the charges keep the grey value ladder.** One
pattern per field tincture, built by `inkHatch` in `src/render/layers/heraldry/hatch.ts`. These
things about it are load bearing. Every pattern id is scoped by the document's existing suffix, so
many arms sharing one sheet cannot collide. Every tile opens on an opaque paper rect, so nothing
below bleeds through. And the charges stay on the grey ladder rather than joining the hatching,
because a stroke-drawn device shatters into dashes at small sizes and an argent charge disappears
outright. `armsNode` (`src/render/layers/heraldry.ts`) emits the pattern defs only where the palette
carries a hatch, which is what keeps every colour dress byte-identical to a chart drawn before the
hatching existed.

**The realm tint is ONE dress decision, not several.** Where a dress wears it, the wash, the seat halo
and the legend swatch are all drawn; where it does not, they go together. A dress that shows one
without the others is the defect. Whether the layer draws at all is the style's own flag
(`politicalTints` in `src/render/style.ts`); what that means for the world underneath is
`specs/engine-invariants.md`'s.

**A river keeps its name over a graze.** A river yields only where it would truly bury a neighbour, never where it merely touches
one. The bar is `RIVER_MAX_OVERLAP` in `src/render/layers/feature-labels.ts`, tested against the river's true rotated ink rather than an upright box. **What it yields to is
everything already claimed in the arena**, which is more than the labels: the cartouche and the
scalebar are claimed before any label layer runs, and the legend and compass are claimed too when
they are drawn. Terrain glyphs are the exception that reserve nothing, so grazing a stand of trees
costs a river nothing at all. A residual graze just under the bar is correct behaviour, not a defect.

**A sea beast is drawn last and yields to everything.** `beastsLayer`
(`src/render/layers/beasts.ts`) claims the arena after the settlements and the feature labels, keeps
its ink off the land, and escalates as the sheet fills: the full label, then the name alone, then the
glyph alone. It searches near its haunt first and then the whole sheet before it drops, so a legend
drawn over the haunt moves the beast rather than losing it. What a beast is, and what it does to the
anonymous sea decor, is `specs/engine-invariants.md`'s.

---

*Companion to `specs/ui-design.md` (the site's look around the chart), `specs/engine-invariants.md`
(the world the chart draws), `specs/rulebook.md` (what a change to the dress costs), and
`specs/explorer-doctrine.md` (the living chart the dress is worn on).*
