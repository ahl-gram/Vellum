// Coastline warp slider (#137), sibling of sea-level.ts; the slider integer is coastWarp x 100. DEFAULT_COAST_WARP mirrors SHAPES[mapType].coastWarp, uniformly 0.55 today: if map types ever get different warp defaults, heightfield.test.ts's additive guard and this constant are the two places to revisit.
const coastSlider = document.getElementById("coast") as HTMLInputElement;
const coastReadout = document.getElementById("coast-readout") as HTMLElement;

const COAST_MIN = 0;
const COAST_MAX = 1;
export const DEFAULT_COAST_WARP = 0.55;

export const clampCoast = (w: number): number =>
  Math.min(COAST_MAX, Math.max(COAST_MIN, w));
export const sliderToCoast = (v: string | number): number =>
  clampCoast(Number(v) / 100);
export const coastToSlider = (w: number): number =>
  Math.round(clampCoast(w) * 100);

export function updateCoastReadout(): void {
  const w = sliderToCoast(coastSlider.value);
  coastReadout.textContent = `warp ${w.toFixed(2)}`;
  coastSlider.setAttribute("aria-valuetext", `coastline warp ${w.toFixed(2)}`);
}

export function parkCoastDefault(): void {
  coastSlider.value = String(coastToSlider(DEFAULT_COAST_WARP));
}
