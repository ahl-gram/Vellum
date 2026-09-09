// The URL hash <-> controls bridge: readHash seeds the controls from a link on load, writeHash mirrors them back on every draw; the touched gates stay OWNED by app.ts (readHash only reports whether the link carried a value).
import { landToSlider, sliderToLand, updateLandReadout } from "./sea-level.ts";
import { coastToSlider, sliderToCoast, updateCoastReadout } from "./coast-warp.ts";
import { parseLive, emitLive, emitTableKey, finalizeHash, seedFromHash, type Live } from "./address.ts";
import { parseTable, type TableItem } from "../shared/table-address.ts";
import type { Camera } from "./camera.ts";

export interface Controls {
  seedInput: HTMLInputElement;
  styleSel: HTMLSelectElement;
  typeSel: HTMLSelectElement;
  bandSel: HTMLSelectElement;
  themeSel: HTMLSelectElement;
  legendChk: HTMLInputElement;
  armsChk: HTMLInputElement;
  beastsChk: HTMLInputElement;
  landSlider: HTMLInputElement;
  coastSlider: HTMLInputElement;
}

/** Apply a bookmarked hash to the controls; only keys present and valid apply. Returns which slider gates the link touched, the #165 camera if carried (restored by the conductor after the first chart lands), and the #192 live address; absent params mean home, still, disarmed. */
export function readHash(controls: Controls): {
  land: boolean;
  coast: boolean;
  camera: Camera | null;
  live: Live | null;
  table: ReadonlyArray<TableItem> | null;
} {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider, coastSlider } = controls;
  const params = new URLSearchParams(location.hash.slice(1));
  const seed = seedFromHash(params.get("seed"));
  if (seed !== null) seedInput.value = String(seed);
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
  const beasts = params.get("beasts");
  if (beasts !== null) beastsChk.checked = beasts === "1";
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
  return { land: landTouched, coast: coastTouched, camera, live: parseLive(params), table: parseTable(location.hash) };
}

/** Mirror the control values into location.hash via replaceState (no history push). land=/coast= are written only once their gates are touched; the camera is quantized to 4dp and written only when NOT home, and the live key emits only when an instrument is armed, so a plain chart links byte-identical to today's. */
export function writeHash(
  controls: Controls,
  landTouched: boolean,
  coastTouched: boolean,
  camera?: Camera,
  live?: Live | null,
  table?: ReadonlyArray<TableItem> | null,
): void {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider, coastSlider } = controls;
  const params = new URLSearchParams();
  params.set("seed", seedInput.value);
  params.set("style", styleSel.value);
  if (typeSel.value) params.set("type", typeSel.value);
  if (bandSel.value) params.set("band", bandSel.value);
  if (themeSel.value) params.set("theme", themeSel.value);
  params.set("legend", legendChk.checked ? "1" : "0");
  params.set("arms", armsChk.checked ? "1" : "0");
  params.set("beasts", beastsChk.checked ? "1" : "0");
  if (landTouched) params.set("land", String(Math.round(sliderToLand(landSlider.value) * 1000)));
  if (coastTouched) params.set("coast", String(Math.round(sliderToCoast(coastSlider.value) * 100)));
  emitLive(params, live);
  if (camera && camera.k !== 1) {
    params.set("cx", camera.cx.toFixed(4));
    params.set("cy", camera.cy.toFixed(4));
    params.set("k", camera.k.toFixed(4));
  }
  emitTableKey(params, table);
  history.replaceState(null, "", "#" + finalizeHash(params));
}
