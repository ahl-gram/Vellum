# A Survey of Unbuilt Coasts

An old Claude artifact (drafted July 2026), archived as `index.html`. It is a brainstorm of whimsical and interactive prospects for Vellum (the workshop ideas, the Myst direction, open water with no ticket), kept for its ideas and for its look: IM Fell English, IM Fell English SC and EB Garamond on parchment, with a double-ruled sheet, corner ticks, a cartouche, a compass rose and a ledger table.

This is not a ruled design round and not a spec. Nothing here is ratified, shipped or served, and its issue numbers and status labels are as of July 2026, so they may be stale. Do not edit the page to match the site.

Open `index.html` in a browser; it works offline. It is the artifact's HTML and CSS unchanged except for one edit: the two Google Fonts `<link>` lines became `<link rel="stylesheet" href="fonts/fonts.css">`.

`fonts/` holds the exact woff2 files Google served the artifact (latin subset, fetched 2026-10-01), and `fonts/fonts.css` is Google's own latin `@font-face` rules with local URLs. They are not the site's `public/fonts/` files: Google serves EB Garamond as one variable font for weights 400 to 600, which the static 400/600 files there are not, and the artifact also uses weight 500. The IM Fell files are byte-identical to `design/atelier-map/fonts/`.

Full-page renders of this page and of the original artifact (Google Fonts) were compared through CDP at 1280 and 390 wide, and the pixel difference is zero at both.
