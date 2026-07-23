// #127 The Drafting Moment. The arrival ceremony a freshly injected chart runs: the
// coastline draws itself in ink (stroke-dashoffset animated from the path's own
// length) while the whole chart settles and the wash dries in behind (CSS on
// .arriving). Purely DOM styling of the live SVG; the pristine lastSvg string that
// Download blobs is never touched. On animationend the inline dash is removed so the
// resting stroke is byte-for-byte the original (round joins intact).
//
// Extracted from app.js (#183): a self-contained, voyage-independent ceremony the
// conductor triggers after a settle, with no coupling to the draw/bind race guards.
export function startArrival(svg) {
  if (!svg) return;
  dashCoastForInk(svg);
  svg.classList.add("arriving");
}

// #170 Sub 9: the redraft's own, shorter ceremony. The same stroke-dashoffset ink-draw
// as the arrival, but on the incoming region inset's coastline at the redraft grade
// (this fires on every settle, so the pass is quick), plus the tier-staggered name
// dry-in: each name in `dryIn` (already filtered to the NEWLY labeled names by
// redraft-plan.js) tags its settlement group `.dry-in`, and index.css dries the
// group's label text in, towns before villages (the stagger keys on the group's own
// data-tier attribute). Persisting names get no class and never re-animate. Like the
// arrival, this styles the LIVE inset DOM only; the pristine res.svg string that
// Download blobs is never touched.
export function startRedraft(svg, dryIn) {
  if (!svg) return;
  dashCoastForInk(svg);
  const wanted = new Set(dryIn);
  if (wanted.size > 0) {
    for (const g of svg.querySelectorAll("g.settlement[data-name]")) {
      if (wanted.has(g.dataset.name)) g.classList.add("dry-in");
    }
  }
  svg.classList.add("redrafting");
}

// Dash a sheet's coastline for the inkDraw keyframe (stroke-dashoffset animated from
// the path's own length) and restore the pristine stroke on animationend, so the
// resting coast is byte-for-byte the original (round joins intact).
function dashCoastForInk(svg) {
  const coast = svg.querySelector("#layer-land path");
  if (!coast || typeof coast.getTotalLength !== "function") return;
  const len = coast.getTotalLength();
  if (!Number.isFinite(len) || len <= 0) return;
  coast.style.setProperty("--draw-len", String(len));
  coast.style.strokeDasharray = String(len);
  coast.addEventListener("animationend", function onDrawn(e) {
    if (e.animationName !== "inkDraw") return; // ignore the wash (washDry)
    coast.style.strokeDasharray = "";
    coast.style.strokeDashoffset = "";
    coast.style.removeProperty("--draw-len");
    coast.removeEventListener("animationend", onDrawn);
  });
}
