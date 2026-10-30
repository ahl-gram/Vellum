// The URL hash <-> controls bridge: readHash seeds the controls from a link on load, writeHash mirrors them back on every draw; the touched gates stay OWNED by app.ts (readHash only reports whether the link carried a value).
import { landToSlider, sliderToLand, updateLandReadout } from "./sea-level.ts";
import { coastToSlider, sliderToCoast, updateCoastReadout } from "./coast-warp.ts";
import { parseLive, emitLive, finalizeHash, seedFromHash, type Live } from "./address.ts";
import { emitLandKeys, gateLand, readWorldKeys, type LandKeys } from "../shared/address-grammar.ts";
import { drawnShape } from "../shared/shape-address.ts";
import { chooseShape, shapeChoice } from "./shape-choice.ts";
import { parseTable, emitTableKey, type TableItem } from "../shared/table-address.ts";
import { addressCamera, type Camera } from "./camera.ts";
import { DEEPEST_K } from "../../world/lod.ts";

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

function landFromHash(land: number | null, controls: Readonly<Controls>): boolean {
  if (land === null) return false;
  const { landSlider } = controls;
  landSlider.value = String(landToSlider(land));
  updateLandReadout();
  return true;
}

function coastFromHash(coast: number | null, controls: Readonly<Controls>): boolean {
  if (coast === null) return false;
  const { coastSlider } = controls;
  coastSlider.value = String(coastToSlider(coast));
  updateCoastReadout();
  return true;
}

/** The land, coast and shape keys the page writes now: a gate that is untouched stays out, and so does anything the shape draws nothing from. */
export function landKeysNow(controls: Readonly<Controls>, landTouched: boolean, coastTouched: boolean): LandKeys {
  return gateLand({
    land: landTouched ? sliderToLand(controls.landSlider.value) : null,
    coast: coastTouched ? sliderToCoast(controls.coastSlider.value) : null,
    shape: drawnShape(shapeChoice(), controls.typeSel.value),
  });
}

/** Apply a bookmarked hash to the controls; only keys present and valid apply. Returns which slider gates the link touched, the Issue #165 camera if carried (restored by the conductor after the first chart lands), and the Issue #192 live address; absent params mean home, still, disarmed. */
export function readHash(controls: Controls): {
  land: boolean;
  coast: boolean;
  camera: Camera | null;
  live: Live | null;
  table: ReadonlyArray<TableItem> | null;
} {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk } = controls;
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
  const { land, coast, shape } = readWorldKeys(params);
  chooseShape(shape);
  const landTouched = landFromHash(land, controls);
  const coastTouched = coastFromHash(coast, controls);
  const camera = addressCamera(params, DEEPEST_K);
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
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk } = controls;
  const params = new URLSearchParams();
  params.set("seed", seedInput.value);
  params.set("style", styleSel.value);
  if (typeSel.value) params.set("type", typeSel.value);
  if (bandSel.value) params.set("band", bandSel.value);
  if (themeSel.value) params.set("theme", themeSel.value);
  params.set("legend", legendChk.checked ? "1" : "0");
  params.set("arms", armsChk.checked ? "1" : "0");
  params.set("beasts", beastsChk.checked ? "1" : "0");
  emitLandKeys(params, landKeysNow(controls, landTouched, coastTouched));
  emitLive(params, live);
  if (camera && camera.k !== 1) {
    params.set("cx", camera.cx.toFixed(4));
    params.set("cy", camera.cy.toFixed(4));
    params.set("k", camera.k.toFixed(4));
  }
  emitTableKey(params, table);
  history.replaceState(null, "", "#" + finalizeHash(params));
}
