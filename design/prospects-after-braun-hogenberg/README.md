# Prospects after Braun and Hogenberg

The design round for Issue #747, ruled on 2026-10-04 (issuecomment-5980850979), and built by Issue #753: Issue #754 builds direction E and Issue #755 builds direction C.

- `stills/`: the contact sheets (`sheet-*.png`, the capital's first), the full-scale and 2x crop stills, and the 72 plate SVGs. That is today's plate as the control, then directions A to E, in the antique and ink dresses, for six places at seed 42 and seed 26.
- `mock/`: the code that drew them, as it ran. It ran from a worktree and wrote to the main checkout's `out/747/`, so its paths name that layout. `mock/README.md` says how it was run.
- `refs/`: `NOTES.md`, the plate-by-plate reading of the 21 public-domain Civitates Orbis Terrarum plates, and `refs.json`, their Wikimedia Commons links. The scans themselves are not committed, as ruled.
- `dump-world.ts` and `sweep-sites.ts`: the measurements behind the choice of places.
