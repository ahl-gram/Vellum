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
 * @returns {{ land: boolean, coast: boolean, camera: {cx:number,cy:number,k:number}|null }}
 *   which slider gates the link touched (so the conductor can set landTouched/coastTouched)
 *   and the #165 camera (world-uv centre + zoom) if the link carried one, else null. The
 *   conductor restores the camera after the first chart lands; absent params mean home.
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
  // #165: the camera. cx/cy are the world-uv centre (0..1) and k the continuous zoom.
  // All three must be present and finite, and k in [1, 8], for a valid frame; a partial
  // or nonsensical set is ignored (the chart opens home), so a hand-edited link never
  // throws. Applying the frame is the conductor's job once the chart is on screen.
  const cxRaw = params.get("cx");
  const cyRaw = params.get("cy");
  const kRaw = params.get("k");
  let camera = null;
  if (cxRaw !== null && cyRaw !== null && kRaw !== null) {
    const cx = Number(cxRaw);
    const cy = Number(cyRaw);
    const k = Number(kRaw);
    if ([cx, cy, k].every(Number.isFinite) && k >= 1 && k <= 8) camera = { cx, cy, k };
  }
  return { land: landTouched, coast: coastTouched, camera };
}

/**
 * Mirror the current control values into location.hash (via replaceState, so it does
 * not push history). The land= param is written only once the tide gate is touched.
 * @param {Controls} controls
 * @param {boolean} landTouched whether the manual sea-level override is in effect
 * @param {boolean} coastTouched whether the manual coast-warp override is in effect
 * @param {{cx:number,cy:number,k:number}} [camera] the #165 camera. cx/cy/k are written
 *   only when the camera is NOT home (k !== 1), so a home view links clean and every
 *   existing (never-zoomed) shared link is byte-identical. Quantized to 4dp: enough to
 *   restore the framing indistinguishably, short enough to keep the hash readable.
 */
export function writeHash(controls, landTouched, coastTouched, camera) {
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
  // #165: the camera is written ONLY when zoomed. k===1 is home (the controller snaps k
  // to exactly 1 at the min extent and on reset/rebase), so the gate is exact. A world-
  // sheet-changing action snaps home first, so any draw drops cx/cy/k for free.
  if (camera && camera.k !== 1) {
    params.set("cx", camera.cx.toFixed(4));
    params.set("cy", camera.cy.toFixed(4));
    params.set("k", camera.k.toFixed(4));
  }
  history.replaceState(null, "", "#" + params.toString());
}
