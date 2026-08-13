// Coastline warp slider (#137), sibling of sea-level.ts: pure conversions + the two DOM
// writes (the slider integer is coastWarp x 100; clampCoast keeps a crafted hash inside
// [0, 1]). The natural default is SHAPES[mapType].coastWarp, uniformly 0.55 across every
// map type; until the visitor moves the slider app.ts sends NO coastWarp override, so an
// untouched draw stays byte-identical (the covenant charts and the golden are untouched).
// If map types ever get different warp defaults, heightfield.test.ts's additive guard and this constant are the two places to revisit.
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

// Park the slider at the natural coastline WITHOUT touching the overrides, exactly as the sea-level slider parks at the natural waterline without forcing landFraction.
export function parkCoastDefault(): void {
  coastSlider.value = String(coastToSlider(DEFAULT_COAST_WARP));
}
