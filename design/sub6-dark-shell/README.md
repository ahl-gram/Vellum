# Sub 6 dark-shell spec demo (#461)

The ratified visual spec for Landfall Sub 6, "the shell goes dark": the real FAQ content
recomposed as a dark broadside, built 2026-08-25 and ruled by Alex the same day. The rulings
themselves live as dated comments on #461 (six rulings plus two addenda plus a cold-start
note); this directory is the pixels those rulings were made from, archived per the
atelier-map precedent (PR #466).

## What it shows

- The atelier-map head cluster on every page: wordmark, flourish tagline, dot-separated
  rooms nav, upper left in the IM Fell faces, directly on the deep. The wordmark tips on
  hover (it navigates, so it stays in the #289 tipping class).
- The mockup's walnut deep as the sitewide body ground (the daylight wash's dark successor).
- The full-bleed raised survey sheet: parchment panel edge to edge, border plus double
  outline, 26px corner L brackets, chart-ink shadow.
- Prose as a multi-column broadside (26rem columns, hairline column rule, section heads
  spanning), the TOC as a spanning dot-row.
- The head stays fixed over a reserved walnut band while the sheet scrolls beneath.
- The landing ceremony, quicker and subtler than the homepage's: the sheet settles onto the
  desk in ~0.55s and the chrome inks in after; reduced motion collapses to an instant swap.

Open `faq-dark.html` in a browser to feel the ceremony and the tips; the stills
(`faq-dark-broadside-1280.png`, `faq-dark-broadside-1680.png`) are the ruled desktop renders.

## Regenerating

`node design/sub6-dark-shell/build-faq-dark.mjs` recomposes the page from `dist/faq/`
(build the site first) into this directory. Fonts are referenced from the sibling
`../atelier-map/fonts/`. The content will drift as the live FAQ evolves; the SPEC here is
the shell treatment, not the copy.

## Known demo-only shortcuts

- The chrome and band are plain divs with duplicated background rules; the real build
  derives them from tokens in BaseLayout.
- The head cluster pins `line-height: normal` deliberately: inheriting the prose's 1.6
  visibly inflates the cluster's gaps (second addendum on #461).
- Mobile is unspecified here; the sub owes the narrow treatment its own pass.
