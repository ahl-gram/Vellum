// The URL hash <-> controls bridge (#183): readHash seeds the controls from a shared
// link on load; writeHash mirrors the control values back into location.hash on every
// draw. landTouched (the #55 manual-override gate) stays OWNED by app.ts: readHash only
// reports whether the link carried a value, and writeHash takes the gate as an argument.
import { landToSlider, sliderToLand, updateLandReadout } from "./sea-level.ts";
import { coastToSlider, sliderToCoast, updateCoastReadout } from "./coast-warp.ts";
import { parseLive, emitLive, finalizeHash, type Live } from "./address.ts";
import type { Camera } from "./camera.ts";

export interface Controls {
  seedInput: HTMLInputElement;
  styleSel: HTMLSelectElement;
  typeSel: HTMLSelectElement;
  bandSel: HTMLSelectElement;
  themeSel: HTMLSelectElement;
  legendChk: HTMLInputElement;
  armsChk: HTMLInputElement;
  landSlider: HTMLInputElement;
  coastSlider: HTMLInputElement;
}

/** Apply a bookmarked hash to the controls; only keys present and valid apply. Returns which slider gates the link touched, the #165 camera if carried (restored by the conductor after the first chart lands), and the #192 live address; absent params mean home, still, disarmed. */
export function readHash(controls: Controls): {
  land: boolean;
  coast: boolean;
  camera: Camera | null;
  live: Live | null;
} {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider } = controls;
  const params = new URLSearchParams(location.hash.slice(1));
  // Gate on PRESENCE, not just validity: Number(null) === 0 would pass the integer guard and clobber a bare visit's seed-of-the-day default down to seed 0.
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
  // #137: coast= carries coastWarp x 100, the same encoding writeHash emits below.
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
  // #165: cx/cy are the world-uv centre (0..1), k the continuous zoom. All three must be present and finite with k in [1, 8]; a partial or nonsensical set is ignored (the chart opens home), so a hand-edited link never throws.
  const cxRaw = params.get("cx");
  const cyRaw = params.get("cy");
  const kRaw = params.get("k");
  let camera: Camera | null = null;
  if (cxRaw !== null && cyRaw !== null && kRaw !== null) {
    const cx = Number(cxRaw);
    const cy = Number(cyRaw);
    const k = Number(kRaw);
    if ([cx, cy, k].every(Number.isFinite) && k >= 1 && k <= 8) camera = { cx, cy, k };
  }
  return { land: landTouched, coast: coastTouched, camera, live: parseLive(params) };
}

/** Mirror the control values into location.hash via replaceState (no history push). land=/coast= are written only once their gates are touched; the camera is quantized to 4dp and written only when NOT home, and the live key emits only when an instrument is armed, so a plain chart links byte-identical to today's. */
export function writeHash(
  controls: Controls,
  landTouched: boolean,
  coastTouched: boolean,
  camera?: Camera,
  live?: Live | null,
): void {
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
  if (coastTouched) params.set("coast", String(Math.round(sliderToCoast(coastSlider.value) * 100)));
  // #192: exactly one live key or neither (the writer's half of the ratified mutual exclusion; the grammar lives in address.ts). Before the camera, so the address reads instrument-then-framing.
  emitLive(params, live);
  // #165: written ONLY when zoomed. k===1 is home and the controller snaps k to exactly 1 at the min extent and on reset/rebase, so the gate is exact; any draw snaps home first and drops cx/cy/k for free.
  if (camera && camera.k !== 1) {
    params.set("cx", camera.cx.toFixed(4));
    params.set("cy", camera.cy.toFixed(4));
    params.set("k", camera.k.toFixed(4));
  }
  // finalizeHash, not params.toString(): it respells `survey=` to the ratified bare flag.
  history.replaceState(null, "", "#" + finalizeHash(params));
}
