# The Painted Ribbon mockups

The visual SPEC for Sub 9 of the Wayfarer's Ribbon epic (#511 under #426), archived from the
sitting of 2026-09-03. Three directions were drawn on the real seed-42 road (Laukuwelua to
Homaitani, 83 leagues) from John Ogilby's hand-coloured plate of the road from London to
Portsmouth (Britannia, 1675):

- `a-limner-42.svg` (and `a-limner-15.svg`, which shows a stone bridge and a coast): A, the
  limner's copy. Strips as unrolled scrolls, a drapery cartouche carrying both realms' arms.
- `b-coloured-42.svg`: B, the coloured impression. Today's plate with the washes and nothing moved.
- `c-painted-42.svg` and **`c-painted-42.png`**: C, the painted ribbon. **This is the one Alex
  chose. The rule (comment on #426, 2026-09-03): be as faithful to this plate as possible; deviate
  only where something genuinely clashes with Vellum's look and feel, and say why in the PR.**
- `current-42-antique.svg`, `current-42-ink.svg` (and the seed-15 pair): the plate as the site
  drew it at the sitting, for comparison.

The SVGs are self-contained; open them in a browser. `palette.ts` holds the limner's box, the
five pigments over the antique tokens, with the three variants' switches beside it.

`node design/ribbon-limner/dump.ts 42` regenerates a seed's geometry (`ribbon-42.json`, the
realms' arms, the current plates) from the engine, and `node design/ribbon-limner/build.ts`
re-renders every variant to `out/ribbon-limner/` with a gallery page. Both reach into
`../../src` and still run from here.

This is an archived design artifact, not shipping code: nothing here is served, bundled,
typechecked (`tsconfig.json` includes only src, test and scripts) or swept by the site's guards.
The shipping implementation lives in `src/itinerary/dress/` and translates the raw values here
into `render/style.ts` tokens.

Do not edit this folder to match the site; the fidelity arrow points the other way.
