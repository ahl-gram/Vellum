# The Atelier Map mockup

The visual SPEC for the Landfall epic (#454), archived byte-for-byte from the approved
prototype. **The ratified rule (comment on #454, 2026-08-23): be as faithful to this mockup
as possible; deviate only when something genuinely clashes with Vellum's look and feel, and
state the reason in the PR.**

Open `index.html` directly in a browser (file:// works; everything is self-contained,
including a vendored copy of gsap and the fonts). The `shot-*.png` files record the approved
states: veil ceremony, landfall, a station card, close-in, and mobile.

This is an archived design artifact, not shipping code, which is the stated reason it may
hold `.js` outside `src/` (the workspace one-pipeline rule). Nothing here is served, bundled,
or swept by the site's CSS guards; the shipping implementations live in `src/site/` and
translate this mockup's raw values into palette tokens. `dump-places.ts` and `shoot.mjs`
reach into `../../src` and `../../scripts` and still run from here.

Do not edit this folder to match the site; the fidelity arrow points the other way.
