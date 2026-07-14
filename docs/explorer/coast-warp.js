// Coastline warp slider (#137), sibling of the sea-level slider (sea-level.js). The
// slider integer is coastWarp x 100 (an integer in [0, 100]); the inverses are trivial
// so the gesture cannot ship backwards. coastWarp domain-warps the radial falloff in
// the heightfield: 0 is the calm radial dome, up to 1 is deeply lobed shores with
// offshore islets. clampCoast keeps every value inside [0, 1] so a crafted hash cannot
// push the engine out of range. The `coastTouched` gate + the redraw wiring stay in
// app.js (the conductor); this module is the pure conversions + the two DOM writes.
//
// The natural default is SHAPES[mapType].coastWarp, uniformly 0.55 across every map
// type (src/terrain/heightfield.ts). The slider parks there and, until the visitor
// moves it, app.js sends NO coastWarp override, so an untouched draw is byte-identical
// to today (the covenant charts and the golden are untouched). If a future edit gives
// the map types different warp defaults, the additive guard in heightfield.test.ts and
// this constant are the two places to revisit.
const coastSlider = document.getElementById("coast");
const coastReadout = document.getElementById("coast-readout");

const COAST_MIN = 0;
const COAST_MAX = 1;
export const DEFAULT_COAST_WARP = 0.55;

export const clampCoast = (w) => Math.min(COAST_MAX, Math.max(COAST_MIN, w));
export const sliderToCoast = (v) => clampCoast(Number(v) / 100);
export const coastToSlider = (w) => Math.round(clampCoast(w) * 100);

export function updateCoastReadout() {
  const w = sliderToCoast(coastSlider.value);
  coastReadout.textContent = `warp ${w.toFixed(2)}`;
  coastSlider.setAttribute("aria-valuetext", `coastline warp ${w.toFixed(2)}`);
}

// Park the slider at the world's natural coastline (0.55) without touching the
// overrides: an untouched coast slider sends no coastWarp override, exactly as the
// sea-level slider parks at the natural waterline without forcing landFraction.
export function parkCoastDefault() {
  coastSlider.value = String(coastToSlider(DEFAULT_COAST_WARP));
}
