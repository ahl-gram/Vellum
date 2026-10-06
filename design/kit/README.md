# The design kit

The assets design rounds share, so a round links them here instead of copying them. Content only: no JavaScript or TypeScript lives here (a test refuses both), because the shared tooling is `scripts/design/`. The rule is `handbook/specs/conventions.md`'s, under "How a design decision is made".

- `fonts/`: the house faces and their OFL licence. This is the copy the site itself builds from: `npm run astro:generate` copies it into the generated `public/fonts/` (`scripts/kit-fonts.ts`), so a face added or changed here changes the site, the OG card and the icons, and every round that links it.
- `plate-fonts/`: IM Fell DW Pica in roman, italic and small capitals (fontsource 5.3.0, OFL), the faces the prospect plates are lettered from, and their licence. Nothing copies this folder to the site: `npm run plate-face` (`scripts/plate-face.ts`) reads it once to write the committed glyph tables under `src/prospect/letter/`, so the faces never ship, only the plate face derived from them (Issue #754).
- `fonts.css`: the same faces as `public/fonts.css`, with URLs relative to this folder. A round links it as `../kit/fonts.css` and is opened from `file://` or served from `design/` (for the shared camera, `node scripts/design/shoot.ts <shots.json> --site design`).

This folder is outside the repo's prose and stylesheet checks, so a path written here is not verified by any test.
