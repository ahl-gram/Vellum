// #127 the Drafting Moment: the arrival ceremony a freshly injected chart runs (the
// coastline draws itself in ink, the wash dries in behind, CSS on .arriving). Purely DOM
// styling of the live SVG; the pristine chart string that Download blobs is never
// touched, and on animationend the inline dash is removed so the resting stroke is
// byte-for-byte the original (round joins intact).
export function startArrival(svg: SVGSVGElement | null): void {
  if (!svg) return;
  dashCoastForInk(svg);
  svg.classList.add("arriving");
}

// #170: the redraft's shorter ceremony: the same ink-draw on the incoming inset's
// coastline at the redraft grade, plus the tier-staggered name dry-in. `dryIn` is
// already filtered to the NEWLY labeled names (redraft-plan.ts); persisting names get no
// class and never re-animate. Styles the LIVE inset DOM only, never the pristine string.
export function startRedraft(svg: SVGSVGElement | null, dryIn: Iterable<string>): void {
  if (!svg) return;
  dashCoastForInk(svg);
  const wanted = new Set(dryIn);
  if (wanted.size > 0) {
    for (const g of svg.querySelectorAll<SVGElement>("g.settlement[data-name]")) {
      if (wanted.has(g.dataset.name as string)) g.classList.add("dry-in");
    }
  }
  svg.classList.add("redrafting");
}

// Dash a sheet's coastline for the inkDraw keyframe and restore the pristine stroke on animationend, so the resting coast is byte-for-byte the original.
function dashCoastForInk(svg: SVGSVGElement): void {
  const coast = svg.querySelector("#layer-land path") as SVGGeometryElement | null;
  if (!coast || typeof coast.getTotalLength !== "function") return;
  const len = coast.getTotalLength();
  if (!Number.isFinite(len) || len <= 0) return;
  coast.style.setProperty("--draw-len", String(len));
  coast.style.strokeDasharray = String(len);
  coast.addEventListener("animationend", function onDrawn(e: AnimationEvent) {
    if (e.animationName !== "inkDraw") return; // ignore the wash (washDry)
    coast.style.strokeDasharray = "";
    coast.style.strokeDashoffset = "";
    coast.style.removeProperty("--draw-len");
    coast.removeEventListener("animationend", onDrawn);
  });
}
