// #127 the Drafting Moment: the arrival ceremony a freshly injected chart runs (CSS on .arriving). It styles the live SVG only, never the pristine chart string, and animationend removes the inline dash so the resting stroke is byte-for-byte the original.
export function startArrival(svg: SVGSVGElement | null): void {
  if (!svg) return;
  dashCoastForInk(svg);
  svg.classList.add("arriving");
}

// #170: the redraft's shorter ceremony; `dryIn` is already the NEWLY labeled names (redraft-plan.ts), so persisting names get no class and never re-animate.
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
