// The Explorer's control-row wiring, extracted from app.ts at #191: every listener
// that just funnels a control into draw() (or Download). The conductor keeps the
// handlers that arbitrate CEREMONIES (the chronicle/voyage mode toggles, the verso
// flip); this module keeps the plumbing. The `touched` gates are shared BY REFERENCE
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
  downloadBtn: HTMLElement;
  scrubPlayBtn: HTMLElement;
  scrubRangeEl: HTMLElement;
  touched: TouchedGates;
  draw: (opts?: { quiet?: boolean; turn?: boolean }) => void;
  /** #192: the conductor's one hash writer; the scrubber's release syncs the year key. */
  syncHash: () => void;
  /** #169: Download saves what you see; a committed region sheet wins over the world chart. */
  committedRegion: () => { svg: string; title: string; band: number } | null;
  lastChart: () => { svg: string; title: string };
  /** The engine's scrubber controls (#54): Play/Pause and the manual year drag. */
  togglePlay: () => void;
  onManualScrub: () => void;
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
  deps.downloadBtn.addEventListener("click", () => {
    // #169 "Download saves what you see": while a region sheet is committed, save THAT
    // stamped sheet (its filename gains the band); at the world sheet, save the world
    // chart as before.
    const region = deps.committedRegion();
    const last = deps.lastChart();
    const svg = region ? region.svg : last.svg;
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = (region ? region.title : last.title).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = region
      ? `vellum-${seedInput.value}-${styleSel.value}-band${region.band}-${slug}.svg`
      : `vellum-${seedInput.value}-${styleSel.value}-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
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

  // Chronicle scrubber controls (#54): Play/Pause runs the event-proportional sweep; a
  // manual drag pauses Play and rebases it so the next Play restarts from the beginning.
  // #192: the hash records the year on RELEASE (change), never per input frame, so a
  // drag is one replaceState, not hundreds; Play's parked year converges on the next
  // sync trigger (a draw, a flip, a toggle, a camera settle).
  deps.scrubPlayBtn.addEventListener("click", deps.togglePlay);
  deps.scrubRangeEl.addEventListener("input", deps.onManualScrub);
  deps.scrubRangeEl.addEventListener("change", deps.syncHash);

  // Living Chart overlay (#53): the doc-level dismiss pair, added once; both read the
  // engine's current overlay so they stay correct across redraws.
  document.addEventListener("keydown", deps.onDocKeydown);
  document.addEventListener("click", deps.onDocClick);
}
