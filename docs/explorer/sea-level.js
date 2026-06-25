// Sea-level slider (#55). The slider value is landFraction x 1000 (an integer in
// [100, 700]); these are trivial inverses so the gesture cannot ship backwards.
// clampLand keeps every value strictly inside (0, 1) so pickSeaLevel never throws
// on a crafted hash. The slider's `landTouched` gate + the redraw wiring stay in
// app.js (the conductor); this module is the pure conversions + the two DOM writes.
import { defaultRecipe } from "./engine/world/generate.js";

const landSlider = document.getElementById("land");
const landReadout = document.getElementById("land-readout");

const LAND_MIN = 0.1;
const LAND_MAX = 0.7;

export const clampLand = (f) => Math.min(LAND_MAX, Math.max(LAND_MIN, f));
export const sliderToLand = (v) => clampLand(Number(v) / 1000);
export const landToSlider = (f) => Math.round(clampLand(f) * 1000);

export function updateLandReadout() {
  const pct = Math.round(sliderToLand(landSlider.value) * 100);
  landReadout.textContent = `${pct}% land`;
  landSlider.setAttribute("aria-valuetext", `${pct}% land`);
}

// Display-only: park the slider at the world's natural waterline. Must NOT mutate
// the overrides passed to the worker (auto mode sends no landFraction override).
export function syncAutoSlider(seed, overrides) {
  landSlider.value = String(landToSlider(defaultRecipe(seed, overrides).landFraction));
}
