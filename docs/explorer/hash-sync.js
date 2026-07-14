// The URL hash <-> controls bridge, extracted from app.js (#183). readHash seeds the
// controls from a shared/bookmarked link on load; writeHash mirrors the current control
// values back into location.hash on every draw, so the link is always shareable.
//
// Kept out of the conductor because it is a self-contained mapping with no stake in the
// draw/bind race guards. landTouched (the #55 manual-override gate) stays OWNED by
// app.js: readHash reports whether the link carried a land value (so the conductor can
// set the gate) rather than reaching back into the conductor's state, and writeHash
// takes the gate's current value as an argument.
import { landToSlider, sliderToLand, updateLandReadout } from "./sea-level.js";
import { coastToSlider, sliderToCoast, updateCoastReadout } from "./coast-warp.js";

/**
 * @typedef {{
 *   seedInput: HTMLInputElement, styleSel: HTMLSelectElement, typeSel: HTMLSelectElement,
 *   bandSel: HTMLSelectElement, themeSel: HTMLSelectElement, legendChk: HTMLInputElement,
 *   armsChk: HTMLInputElement, landSlider: HTMLInputElement, coastSlider: HTMLInputElement
 * }} Controls
 */

/**
 * Apply a bookmarked/shared hash to the controls. Only keys present and valid are
 * applied, so a partial link leaves the rest at their defaults.
 * @param {Controls} controls
 * @returns {{ land: boolean, coast: boolean }} which slider gates the link touched, so
 *   the conductor can set landTouched/coastTouched (matching the old in-place mutation).
 */
export function readHash(controls) {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider } = controls;
  const params = new URLSearchParams(location.hash.slice(1));
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer
  // guard and clobber a bare visit's bootstrap default (today's seed-of-the-day) down
  // to seed 0. A missing seed leaves seedInput at whatever default the conductor set.
  const seedRaw = params.get("seed");
  const seed = Number(seedRaw);
  if (seedRaw !== null && Number.isInteger(seed) && seed >= 0) seedInput.value = String(seed);
  const style = params.get("style");
  if (style && [...styleSel.options].some((o) => o.value === style)) {
    styleSel.value = style;
  }
  const type = params.get("type") ?? "";
  if ([...typeSel.options].some((o) => o.value === type)) typeSel.value = type;
  const band = params.get("band") ?? "";
  if ([...bandSel.options].some((o) => o.value === band)) bandSel.value = band;
  const theme = params.get("theme") ?? "";
  if ([...themeSel.options].some((o) => o.value === theme)) themeSel.value = theme;
  const legend = params.get("legend");
  if (legend !== null) legendChk.checked = legend === "1";
  const arms = params.get("arms");
  if (arms !== null) armsChk.checked = arms === "1";
  const land = params.get("land");
  let landTouched = false;
  if (land !== null) {
    const f = Number(land) / 1000;
    if (Number.isFinite(f)) {
      landSlider.value = String(landToSlider(f));
      updateLandReadout();
      landTouched = true;
    }
  }
  // #137: the coast= param carries coastWarp x 100 (an integer), the same encoding
  // writeHash emits below. Present + finite means the link warped the coast, so the
  // conductor sets coastTouched and the draw sends the override.
  const coast = params.get("coast");
  let coastTouched = false;
  if (coast !== null) {
    const w = Number(coast) / 100;
    if (Number.isFinite(w)) {
      coastSlider.value = String(coastToSlider(w));
      updateCoastReadout();
      coastTouched = true;
    }
  }
  return { land: landTouched, coast: coastTouched };
}

/**
 * Mirror the current control values into location.hash (via replaceState, so it does
 * not push history). The land= param is written only once the tide gate is touched.
 * @param {Controls} controls
 * @param {boolean} landTouched whether the manual sea-level override is in effect
 * @param {boolean} coastTouched whether the manual coast-warp override is in effect
 */
export function writeHash(controls, landTouched, coastTouched) {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider } = controls;
  const params = new URLSearchParams();
  params.set("seed", seedInput.value);
  params.set("style", styleSel.value);
  if (typeSel.value) params.set("type", typeSel.value);
  if (bandSel.value) params.set("band", bandSel.value);
  if (themeSel.value) params.set("theme", themeSel.value);
  params.set("legend", legendChk.checked ? "1" : "0");
  params.set("arms", armsChk.checked ? "1" : "0");
  if (landTouched) params.set("land", String(Math.round(sliderToLand(landSlider.value) * 1000)));
  // #137: coast= is written only once the coast gate is touched, mirroring land=.
  if (coastTouched) params.set("coast", String(Math.round(sliderToCoast(coastSlider.value) * 100)));
  history.replaceState(null, "", "#" + params.toString());
}
