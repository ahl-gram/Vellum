// The Explorer's control-row wiring: the listeners that funnel a control into draw(); the `touched` gates are shared BY REFERENCE with the conductor (set here, read by draw()/syncHash).
import { updateLandReadout } from "./sea-level.ts";
import { updateCoastReadout } from "./coast-warp.ts";

export interface TouchedGates {
  land: boolean;
  coast: boolean;
}

interface ControlsDeps {
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
  drawBtn: HTMLElement;
  randomBtn: HTMLElement;
  touched: TouchedGates;
  draw: (opts?: { quiet?: boolean; turn?: boolean }) => void;
  onDocKeydown: (e: KeyboardEvent) => void;
  onDocClick: (e: MouseEvent) => void;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

export function wireControls(deps: ControlsDeps): void {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, beastsChk, landSlider, coastSlider, touched, draw } = deps;

  let landDebounce: ReturnType<typeof setTimeout> | 0 = 0;

  deps.drawBtn.addEventListener("click", draw as unknown as EventListener);
  deps.randomBtn.addEventListener("click", () => {
    seedInput.value = String(randomSeed());
    touched.land = false;
    touched.coast = false;
    draw();
  });
  seedInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      touched.land = false;
      touched.coast = false;
      draw();
    }
  });
  for (const sel of [bandSel, themeSel, legendChk, armsChk, beastsChk]) {
    sel.addEventListener("change", draw as unknown as EventListener);
  }
  styleSel.addEventListener("change", () => draw({ turn: true }));
  typeSel.addEventListener("change", () => {
    touched.land = false;
    touched.coast = false;
    draw();
  });
  landSlider.addEventListener("input", () => {
    touched.land = true;
    updateLandReadout();
    clearTimeout(landDebounce);
    // #127: mid-drag redraws are quiet (no arrival ceremony); the release handler runs the full ceremony once the tide settles.
    landDebounce = setTimeout(() => draw({ quiet: true }), 100);
  });
  landSlider.addEventListener("change", () => {
    touched.land = true;
    clearTimeout(landDebounce);
    draw();
  });
  // #137: unlike sea-level (which re-levels the SAME terrain and can afford quiet mid-drag redraws), every coastWarp value is a different ~0.6s world, so the readout updates live but the redraw waits for release.
  coastSlider.addEventListener("input", () => {
    touched.coast = true;
    updateCoastReadout();
  });
  coastSlider.addEventListener("change", () => {
    touched.coast = true;
    draw();
  });

  // #53: the doc-level dismiss pair, added once; both read the engine's current overlay so they stay correct across redraws.
  document.addEventListener("keydown", deps.onDocKeydown);
  document.addEventListener("click", deps.onDocClick);
}
