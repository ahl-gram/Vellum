// Coastline warp slider (Issue #137), sibling of sea-level.ts; the slider integer is coastWarp x 100.
import { defaultCoastWarp } from "../../terrain/heightfield.ts";
import { defaultRecipe } from "../../world/generate.ts";
import type { WorldRecipe } from "../../world/types.ts";
import { COAST_MAX, COAST_MIN } from "../shared/address-grammar.ts";
import { $ } from "../shared/by-id.ts";
const coastSlider = $<HTMLInputElement>("coast");
const coastReadout = $("coast-readout");

const clampCoast = (w: number): number => Math.min(COAST_MAX, Math.max(COAST_MIN, w));
export const sliderToCoast = (v: string | number): number => clampCoast(Number(v) / 100);
export const coastToSlider = (w: number): number => Math.round(clampCoast(w) * 100);
coastSlider.min = String(coastToSlider(COAST_MIN));
coastSlider.max = String(coastToSlider(COAST_MAX));

export function updateCoastReadout(): void {
  const w = sliderToCoast(coastSlider.value);
  coastReadout.textContent = `warp ${w.toFixed(2)}`;
  coastSlider.setAttribute("aria-valuetext", `coastline warp ${w.toFixed(2)}`);
}

export function parkCoastDefault(seed: number, overrides: Partial<WorldRecipe>): void {
  coastSlider.value = String(coastToSlider(defaultCoastWarp(defaultRecipe(seed, overrides).mapType)));
}
