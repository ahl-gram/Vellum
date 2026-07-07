// #116 The Verso (epic: the Paper & Ink material-object lens). Turn the sheet over
// and find the chart's back: a mirrored bleed-through ghost of the current chart, a
// docket line along the fold, the surveyor's attribution, and a survey-office ink
// stamp. Every page of the site insists a Vellum chart is a document; giving the
// sheet a readable back asserts object-hood in one gesture no screenshot conveys.
//
// The flip REUSES #131's shared .sheet / #sheet-inner perspective wrapper but owns a
// SEPARATE, persistent state (a held rotateY(-180) rest on the back face), kept out
// of sheet-turn.js's transient style-turn state machine so the two never entangle.
// The one hard invariant: the turn (#131) and the flip (#116) must never both own
// #sheet-inner's rotateY at once. app.js enforces it (a style change while flipped is
// suppressed from turning; the Turn button is disabled during a draw or a turn).
//
// Kept free of top-level DOM/globals so buildDocket (the pure docket-string builder)
// is unit-testable under Node; renderVerso / the flip helpers touch the DOM only
// inside their bodies and are proven by the e2e end-states + a CDP probe.

/**
 * The docket line stamped along the fold: chart number, title, present year, and the
 * capital's name when the world has one. Pure so it is unit-testable; the rest of the
 * verso is DOM.
 * @param {{seed:number, title:string, presentYear:number, capital?:string}} o
 * @returns {string}
 */
export function buildDocket({ seed, title, presentYear, capital }) {
  const parts = [`CHART № ${seed}`, title, `Year ${presentYear}`];
  if (capital) parts.push(capital);
  return parts.join(" · ");
}

// The survey-office ink stamp: one oval, built as inline SVG with NO ids (the chart
// injected into this same document owns the id space, so the verso stays id-free) in a
// faded oxblood, slightly rotated (CSS) and ink-thin. Decorative, out of the a11y
// tree. Built with DOM nodes, not markup, so the module has no HTML-injection sink.
const SVGNS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs, text) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  if (text != null) el.textContent = text;
  return el;
}

function buildStamp() {
  const svg = svgEl("svg", {
    class: "verso-stamp", viewBox: "0 0 200 120", "aria-hidden": "true", focusable: "false",
  });
  svg.append(
    svgEl("ellipse", { cx: 100, cy: 60, rx: 94, ry: 52, fill: "none", stroke: "#7a3b2c", "stroke-width": 3 }),
    svgEl("ellipse", { cx: 100, cy: 60, rx: 82, ry: 42, fill: "none", stroke: "#7a3b2c", "stroke-width": 1.4 }),
    svgEl("text", { x: 100, y: 45, "text-anchor": "middle", "font-family": "Georgia, serif", "font-size": 19, "letter-spacing": 2, fill: "#7a3b2c" }, "VELLUM"),
    svgEl("text", { x: 100, y: 69, "text-anchor": "middle", "font-family": "Georgia, serif", "font-size": 12, "letter-spacing": 3, fill: "#7a3b2c" }, "SURVEY OFFICE"),
    svgEl("text", { x: 100, y: 90, "text-anchor": "middle", "font-family": "Georgia, serif", "font-size": 10, "font-style": "italic", "letter-spacing": 1, fill: "#7a3b2c" }, "registered"),
  );
  return svg;
}

// The current ghost's object URL, revoked on every rebuild. Without this the page
// leaks about 1 MB per redraw (a fresh chart Blob URL that is never released).
let ghostUrl = "";

/**
 * Fill the verso back face: the mirrored bleed-through ghost of the CURRENT chart, the
 * docket line, the surveyor's attribution, and the office stamp. The ghost <img>
 * carries the chart's height, so the sheet turns over at exactly the recto's size.
 *
 * The docket and surveyor are world-generated strings set via textContent, and the
 * stamp is built from DOM nodes (buildStamp), so nothing is injected as markup.
 * @param {HTMLElement} versoEl the #verso back face
 * @param {{svg:string, docket:string, surveyor:string}} o
 */
export function renderVerso(versoEl, { svg, docket, surveyor }) {
  if (ghostUrl) { try { URL.revokeObjectURL(ghostUrl); } catch {} ghostUrl = ""; }
  ghostUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const ghost = document.createElement("img");
  ghost.className = "verso-ghost";
  ghost.alt = "";
  ghost.src = ghostUrl;
  const docketEl = document.createElement("div");
  docketEl.className = "verso-docket";
  docketEl.textContent = docket;
  const surveyEl = document.createElement("div");
  surveyEl.className = "verso-survey";
  surveyEl.textContent = surveyor;
  versoEl.replaceChildren(ghost, docketEl, surveyEl, buildStamp());
}

/** Whether the sheet is currently resting on (or turning toward) its verso. */
export function isFlipped(sheetEl) {
  return sheetEl.classList.contains("versoed");
}

// The flip toggles two classes on .sheet (see index.css):
//   .flip3d  -- lights the 3D context + reveals #verso; must persist until the leaf
//               lands FLAT on the recto again, so on the way back it is stripped on
//               transitionend (restoring the recto's idle byte-parity, like #131).
//   .versoed -- the rotation target: present => rotateY(-180deg) held.
// A superseding re-flip (versoed came back before the back-turn landed) leaves .flip3d
// alone via the !versoed guard, so a reversal never tears the 3D context down mid-turn.

/**
 * Toggle the sheet between its recto and its verso. Returns the new flipped state.
 * @param {HTMLElement} sheetEl the #sheet wrapper
 * @returns {boolean} true if now showing the verso
 */
export function toggleFlip(sheetEl) {
  if (isFlipped(sheetEl)) { flipToRecto(sheetEl); return false; }
  flipToVerso(sheetEl);
  return true;
}

function flipToVerso(sheetEl) {
  sheetEl.classList.add("flip3d");
  // Force a reflow so .flip3d's flat (rotateY0) state commits BEFORE the rotation
  // target, guaranteeing the transition runs (a same-tick class pair can otherwise be
  // coalesced and skip it). Setting .versoed synchronously keeps isFlipped correct
  // the instant the click returns (no deferred-frame gap).
  void sheetEl.offsetWidth;
  sheetEl.classList.add("versoed");
}

function flipToRecto(sheetEl) {
  const inner = sheetEl.querySelector(".sheet-inner");
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    inner.removeEventListener("transitionend", onEnd);
    // Only tear the 3D context down if the leaf really landed on the recto; a fast
    // re-flip may have put us back on the verso while this turn-back was in flight.
    if (!sheetEl.classList.contains("versoed")) sheetEl.classList.remove("flip3d");
  };
  const onEnd = (e) => {
    if (e.target === inner && e.propertyName === "transform") settle();
  };
  inner.addEventListener("transitionend", onEnd);
  sheetEl.classList.remove("versoed");
  // Backstop past --verso-turn: if transitionend never arrives (a browser that skips
  // it for a ~0ms reduced-motion transition, or an interrupted turn), still restore
  // byte-parity so the recto never rests with the 3D context lit.
  setTimeout(settle, 1600);
}
