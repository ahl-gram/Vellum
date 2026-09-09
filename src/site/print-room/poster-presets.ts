// Poster plate presets for the Print Room: the same world as the on-screen proof, rendered wider, delivered as a download. Pure and DOM-free; app.ts does the worker and download wiring.

export interface PosterPreset {
  key: string;
  label: string;
  width: number;
}

export const POSTER_PRESETS: PosterPreset[] = [
  { key: "desk", label: "Desk", width: 2400 },
  { key: "wall", label: "Wall", width: 3300 },
  { key: "grand", label: "Grand", width: 4200 },
];

export const CHART_PRESET: PosterPreset = { key: "chart", label: "Chart", width: 1500 };

export function chartFilename(seed: number, style: string, title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `vellum-${seed}-${style}-${slug}.svg`;
}

const MIN_WIDTH = POSTER_PRESETS[0].width;
const MAX_WIDTH = POSTER_PRESETS[POSTER_PRESETS.length - 1].width;

// The render worker passes widthPx into renderMap with no clamp of its own, so bounding the width is the page's job.
export function clampPosterWidth(w: unknown): number {
  const n = Number(w);
  if (!Number.isFinite(n)) return MAX_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(n)));
}

export function posterFilename(seed: number, style: string, width: number): string {
  return `vellum-poster-${seed}-${style}-${width}.svg`;
}

export function posterPngFilename(seed: number, style: string, outWidth: number): string {
  return `vellum-poster-${seed}-${style}-${outWidth}.png`;
}
