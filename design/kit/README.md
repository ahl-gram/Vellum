# The design kit

The assets design rounds share, so a round links them here instead of copying them. Content only: no JavaScript or TypeScript lives here (a test refuses both), because the shared tooling is `scripts/design/`. The rule is `handbook/specs/conventions.md`'s, under "How a design decision is made".

- `fonts/`: the house faces and their OFL licence. This is the copy the site itself builds from: `npm run astro:generate` copies it into the generated `generated/fonts/` (`scripts/kit-fonts.ts`), so a face added or changed here changes the site, the OG card and the icons, and every round that links it.
- `plate-fonts/`: IM Fell DW Pica in roman, italic and small capitals (fontsource 5.3.0, OFL), the faces the prospect plates are lettered from, and their licence. Nothing copies this folder to the site: `npm run plate-face` (`scripts/plate-face.ts`) reads it once to write the committed glyph tables under `src/prospect/letter/`, so the faces never ship, only the plate face derived from them (Issue #754).
- `outlines/`: the outline roster's real places, one file per Natural Earth file (countries, map units, states and provinces, lakes), each place projected and thinned, with its ID (`ne-` and Natural Earth's serial number for it), its English name and its country. Nothing copies this folder to the site: `npm run outlines -- build` (`scripts/outlines/main.ts`) reads it to write the committed tables under `src/terrain/` and `src/world/`, and its own `README.md`, written by `npm run outlines -- extract`, records each source file's size, checksum and licence (Issue #853).
- `fonts.css`: the same faces as `src/styles/shared/fonts.css`, with URLs relative to this folder. A round links it as `../kit/fonts.css` and is opened from `file://` or served from `design/` (for the shared camera, `node scripts/design/shoot.ts <shots.json> --site design`).

This folder is outside the repo's prose and stylesheet checks, so a path written here is not verified by any test.
