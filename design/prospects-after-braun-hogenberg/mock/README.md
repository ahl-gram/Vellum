# Issue #747 mockups: the prospects after Braun and Hogenberg

Throwaway design-round code. Nothing here is served, bundled or type-checked by the repo; it reaches into `../../../src` for the real engine (worlds, prospect inputs, the composed geometry, the heraldry) and draws its own SVG on top. It was run from the worktree `.claude/worktrees/design-747` at `19ff0a8`, with its output written to the main checkout's `out/747/` (the `OUT_ROOT` constant in `build.ts`, overridable with `OUT_747=`).

- `node out/747/mock/build.ts` renders every direction for every place in both dresses into `out/747/stills/*.svg`, writes the contact sheets to `out/747/mock/sheets/*.html` and the shot list `shots.json`.
- `node scripts/design/shoot.ts /Users/ahl/CodeProjects/Vellum/out/747/mock/sheets/shots.json --site /Users/ahl/CodeProjects/Vellum/out/747` takes the PNG stills through the shared design camera into `out/747/stills/`.
- `node out/747/dump-world.ts 42` and `node out/747/sweep-sites.ts 1 40` are the measurements behind the choice of places.
- `python3 out/747/refs/fetch-refs.py` downloads the Commons references; `out/747/refs/NOTES.md` is what they taught.

Files: `dress.ts` (the two dresses plus the limner's washes), `burin.ts` (hatching, sky, water, hills, trees), `townscape.ts` (the engine's masses and foreground redrawn), `staffage.ts` (the figures), `furniture.ts` (cartouche, banderole, wreaths, key panel, cardinal words, horizon towns), `data.ts` (what the world can truthfully name), `direction-a.ts`, `direction-rise.ts` (B, D and E), `direction-c.ts` (the bird's-eye), `build.ts`.

Every file stays libm-free and clock-free apart from `Math.sqrt` in `data.ts` (exempt under the guard), checked with the guard's own regex over this folder on 2026-10-04.
