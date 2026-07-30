// Poster plate presets for the Print Room (#134, epic #132). A poster is the same world as
// the on-screen proof, only rendered wider, delivered as a download the visitor clicks.
// Pure + DOM-free so it is unit-testable in Node the way src/site/explorer/sheet-turn.ts's
// shouldTurn is; src/site/print-room/app.ts does the worker + download wiring.

export interface PosterPreset {
  /** Stable key carried on the button's data-poster attribute. */
  key: string;
  /** Human label on the plate button. */
  label: string;
  /** Render width in pixels; also the clamp envelope bound. */
  width: number;
}

// Desk / Wall / Grand. Grand's 4200 is the largest poster width; a Grand plate renders
// the covenant world (defaultRecipe(seed)) at that width (parity pinned in
// test/cli/poster-parity.test.ts). The three widths ARE the clamp envelope below.
export const POSTER_PRESETS: PosterPreset[] = [
  { key: "desk", label: "Desk", width: 2400 },
  { key: "wall", label: "Wall", width: 3300 },
  { key: "grand", label: "Grand", width: 4200 },
];

// #217 Part 1: the chart plate, the covenant artifact at the chart's own width. It is
// deliberately NOT in POSTER_PRESETS: the clamp envelope below must stay [Desk, Grand]
// (clampPosterWidth would raise 1500 to 2400, so the order path takes this width
// directly), and the chart is pulled only as the engraving (SVG), never rasterized.
export const CHART_PRESET: PosterPreset = { key: "chart", label: "Chart", width: 1500 };

// The chart's artifact name is the one the Explorer's Download SVG used until #217
// Part 2 retired that button (PR #322 shipped this plate first), so the take-home
// survived name-for-name as well as byte-for-byte. The slug regex is the retired
// handler's, verbatim; the pinned filenames in the unit test are the contract now.
export function chartFilename(seed: number, style: string, title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `vellum-${seed}-${style}-${slug}.svg`;
}

const MIN_WIDTH = POSTER_PRESETS[0].width; // 2400
const MAX_WIDTH = POSTER_PRESETS[POSTER_PRESETS.length - 1].width; // 4200

// The render worker passes widthPx straight into renderMap with no clamp of its own
// (src/site/explorer/worker.ts), so bounding the width is the page's job. Any requested
// width (a preset button, or a value that somehow reached us out of band) is clamped to
// the [Desk, Grand] envelope; a non-number falls back to Grand. This is the guard the
// CLI's 400-6000 check used to be (`main` in `src/cli/main.ts`): a hand-edited value can
// never ask the worker for a tab-killing width.
export function clampPosterWidth(w: unknown): number {
  const n = Number(w);
  if (!Number.isFinite(n)) return MAX_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(n)));
}

// Self-describing artifact name: seed, style, and width live in the filename, and the
// recipe rides inside the SVG as data-vellum-* attributes (recipeFromSvg round-trips).
export function posterFilename(seed: number, style: string, width: number): string {
  return `vellum-poster-${seed}-${style}-${width}.svg`;
}

// The PNG twin of posterFilename, named by the OUTPUT pixel width (post scale + budget
// fit), so Desk x1 (2400) and Desk x2 (4800) never collide, and a budget-clamped plate
// carries its real reduced width. The recipe still rides inside the source SVG, not the
// PNG, so the SVG stays the reproducible artifact (see src/site/lib/rasterize.ts).
export function posterPngFilename(seed: number, style: string, outWidth: number): string {
  return `vellum-poster-${seed}-${style}-${outWidth}.png`;
}
