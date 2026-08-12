// The Explorer's control-row wiring, extracted from app.ts at #191: every listener
// that just funnels a control into draw(). The conductor keeps the handlers that
// arbitrate CEREMONIES (the chronicle/voyage mode toggles, the verso flip); this
// module keeps the plumbing. The `touched` gates are shared BY REFERENCE
// with the conductor: handlers here set them, draw()/syncHash read them.
import { updateLandReadout } from "./sea-level.ts";
import { updateCoastReadout } from "./coast-warp.ts";

export interface TouchedGates {
  /** #55: until the user moves the sea-level slider, it auto-tracks each world's waterline. */
  land: boolean;
  /** #137: sibling gate; until touched, draw() sends no coastWarp override. */
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
  landSlider: HTMLInputElement;
  coastSlider: HTMLInputElement;
  drawBtn: HTMLElement;
  randomBtn: HTMLElement;
  touched: TouchedGates;
  draw: (opts?: { quiet?: boolean; turn?: boolean }) => void;
  /** #53 doc-level dismiss pair: Escape or a click/tap off any mark closes a pinned card. */
  onDocKeydown: (e: KeyboardEvent) => void;
  onDocClick: (e: MouseEvent) => void;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

export function wireControls(deps: ControlsDeps): void {
  const { seedInput, styleSel, typeSel, bandSel, themeSel, legendChk, armsChk, landSlider, coastSlider, touched, draw } = deps;

  // Sea-level drag redraw throttle (#55); the release (change) redraw is authoritative.
  let landDebounce: ReturnType<typeof setTimeout> | 0 = 0;

  deps.drawBtn.addEventListener("click", draw as unknown as EventListener);
  deps.randomBtn.addEventListener("click", () => {
    seedInput.value = String(randomSeed());
    touched.land = false;
    touched.coast = false; // #137: a fresh world starts from its natural coastline
    draw();
  });
  seedInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      touched.land = false;
      touched.coast = false; // #137: a new seed starts from its natural coastline
      draw();
    }
  });
  for (const sel of [bandSel, themeSel, legendChk, armsChk]) {
    sel.addEventListener("change", draw as unknown as EventListener);
  }
  // #131: a style change re-dresses the SAME world, so it turns the sheet over rather
  // than settling. Every other control draws a new/changed world and settles (#127).
  styleSel.addEventListener("change", () => draw({ turn: true }));
  // Changing the map type reshapes the terrain, so a manual tide (and warp) no longer
  // applies: reset both to auto so the sliders re-derive from the new world.
  typeSel.addEventListener("change", () => {
    touched.land = false;
    touched.coast = false; // #137: a reshaped world starts from its natural coastline
    draw();
  });
  // Drag: live readout + debounced redraw on input, an authoritative redraw on
  // release. Both bump drawGen, so a stale in-flight frame is discarded.
  landSlider.addEventListener("input", () => {
    touched.land = true;
    updateLandReadout();
    clearTimeout(landDebounce);
    // #127: the mid-drag redraws are quiet (no arrival ceremony); the release (change)
    // handler below runs the full ceremony once the tide settles.
    landDebounce = setTimeout(() => draw({ quiet: true }), 100);
  });
  landSlider.addEventListener("change", () => {
    touched.land = true;
    clearTimeout(landDebounce);
    draw();
  });
  // #137: the coast slider. Unlike sea-level (which debounces a QUIET mid-drag redraw
  // because re-leveling reuses the SAME terrain), every coastWarp value is a different
  // ~0.6s world, so this updates the readout live on input but redraws only on release
  // (change). Both set the gate so the override + the coast= hash param take effect.
  coastSlider.addEventListener("input", () => {
    touched.coast = true;
    updateCoastReadout();
  });
  coastSlider.addEventListener("change", () => {
    touched.coast = true;
    draw();
  });

  // #321: the Play/bar/detent wiring left with the scrubber panel. The Explorer is
  // static (time lives in the Reading Room), so the one instrument control that
  // remains is the survey checkbox, wired by the conductor (it arbitrates the
  // camera reset ceremony, so it is not plumbing).

  // Living Chart overlay (#53): the doc-level dismiss pair, added once; both read the
  // engine's current overlay so they stay correct across redraws.
  document.addEventListener("keydown", deps.onDocKeydown);
  document.addEventListener("click", deps.onDocClick);
}
