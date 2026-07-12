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
  const coast = svg.querySelector("#layer-land path");
  if (coast && typeof coast.getTotalLength === "function") {
    const len = coast.getTotalLength();
    if (Number.isFinite(len) && len > 0) {
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
  }
  svg.classList.add("arriving");
}
