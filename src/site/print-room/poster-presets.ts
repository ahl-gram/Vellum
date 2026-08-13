// Poster plate presets for the Print Room (#134): the same world as the on-screen proof,
// rendered wider, delivered as a download. Pure + DOM-free so it unit-tests in Node;
// app.ts does the worker + download wiring.

export interface PosterPreset {
  /** Stable key carried on the button's data-poster attribute. */
  key: string;
  /** Human label on the plate button. */
  label: string;
  /** Render width in pixels; also the clamp envelope bound. */
  width: number;
}

// Desk / Wall / Grand; Grand renders the covenant world at 4200 (parity pinned in test/cli/poster-parity.test.ts). The three widths ARE the clamp envelope below.
export const POSTER_PRESETS: PosterPreset[] = [
  { key: "desk", label: "Desk", width: 2400 },
  { key: "wall", label: "Wall", width: 3300 },
  { key: "grand", label: "Grand", width: 4200 },
];

// #217: the chart plate, deliberately NOT in POSTER_PRESETS: the clamp envelope must stay [Desk, Grand] (clampPosterWidth would raise 1500 to 2400, so the order path takes this width directly), and the chart is pulled only as the engraving (SVG), never rasterized.
export const CHART_PRESET: PosterPreset = { key: "chart", label: "Chart", width: 1500 };

// The artifact name the Explorer's retired Download SVG button used (#217 Part 2), so the take-home survived name-for-name; the slug regex is the retired handler's, verbatim.
export function chartFilename(seed: number, style: string, title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `vellum-${seed}-${style}-${slug}.svg`;
}

const MIN_WIDTH = POSTER_PRESETS[0].width;
const MAX_WIDTH = POSTER_PRESETS[POSTER_PRESETS.length - 1].width;

// The render worker passes widthPx into renderMap with no clamp of its own, so bounding the width is the page's job (the guard the CLI's 400-6000 check used to be): clamp to the [Desk, Grand] envelope, and a non-number falls back to Grand.
export function clampPosterWidth(w: unknown): number {
  const n = Number(w);
  if (!Number.isFinite(n)) return MAX_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(n)));
}

// Self-describing artifact name: seed, style and width in the filename; the recipe rides inside the SVG as data-vellum-* attributes (recipeFromSvg round-trips).
export function posterFilename(seed: number, style: string, width: number): string {
  return `vellum-poster-${seed}-${style}-${width}.svg`;
}

// The PNG twin, named by the OUTPUT pixel width (post scale + budget fit) so Desk x1 (2400) and Desk x2 (4800) never collide; the recipe rides in the source SVG, not the PNG.
export function posterPngFilename(seed: number, style: string, outWidth: number): string {
  return `vellum-poster-${seed}-${style}-${outWidth}.png`;
}
