// The Verso: the chart's back face (bleed-through ghost, docket line, attribution, survey-office stamp). The style turn and the flip must never both own #sheet-inner's rotateY at once; app.ts enforces it.

import type { PlaceManifest } from "../../render/place-manifest.ts";

export interface DocketFields {
  seed: number;
  title: string;
  presentYear: number;
  capital?: string;
  capitalFormerName?: string;
}

export function buildDocket({ seed, title, presentYear, capital, capitalFormerName }: DocketFields): string {
  const parts = [`CHART № ${seed}`, title, `Year ${presentYear}`];
  if (capital) parts.push(capitalFormerName ? `${capital} (once ${capitalFormerName})` : capital);
  return parts.join(" · ");
}

// The ink stamp: inline SVG with NO ids (the chart injected into this document owns the id space), decorative and out of the a11y tree; built with DOM nodes, so no HTML-injection sink.
const SVGNS = "http://www.w3.org/2000/svg";

function svgEl(tag: string, attrs: Record<string, string | number>, text?: string): SVGElement {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  if (text != null) el.textContent = text;
  return el;
}

function buildStamp(): SVGElement {
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

// The current ghost's object URL, revoked on every rebuild; without this the page leaks ~1 MB per redraw.
let ghostUrl = "";

/** Fill the verso back face. The ghost <img> carries the chart's height, so the sheet turns over at exactly the recto's size; all text lands via textContent and the stamp is DOM-built, so nothing is injected as markup. */
export function renderVerso(
  versoEl: HTMLElement,
  { svg, docket, surveyor }: { svg: string; docket: string; surveyor: string },
): void {
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

export function rebuildVerso(
  versoEl: HTMLElement,
  res: { svg: string; title: string; subtitle: string; manifest: PlaceManifest },
  seed: number,
): void {
  const capital = res.manifest.places.find((p) => p.kind === "capital");
  renderVerso(versoEl, {
    svg: res.svg,
    docket: buildDocket({
      seed,
      title: res.title,
      presentYear: res.manifest.presentYear,
      capital: capital ? capital.name : "",
      ...(capital?.formerName === undefined ? {} : { capitalFormerName: capital.formerName }),
    }),
    surveyor: res.subtitle,
  });
}

// INVARIANT: never rebuild the ghost Blob to refresh the track (renderVerso is the only place allowed to churn one; re-blobbing costs ~1 MB per redraw); the layer sits directly after the ghost so it paints over the bleed-through but under the docket, attribution and stamp.
export function paintVersoTrack(versoEl: HTMLElement, points: string, viewBox: string): void {
  if (!points) { clearVersoTrack(versoEl); return; }
  let layer = versoEl.querySelector(".verso-track-layer");
  if (!layer) {
    layer = svgEl("svg", {
      class: "verso-track-layer", viewBox, preserveAspectRatio: "none",
      "aria-hidden": "true", focusable: "false",
    });
    layer.append(svgEl("polyline", { class: "verso-track" }));
    const ghost = versoEl.querySelector(".verso-ghost");
    if (ghost) ghost.after(layer);
    else versoEl.append(layer);
  }
  layer.setAttribute("viewBox", viewBox);
  (layer.firstChild as SVGElement).setAttribute("points", points);
}

export function clearVersoTrack(versoEl: HTMLElement): void {
  const layer = versoEl.querySelector(".verso-track-layer");
  if (layer) layer.remove();
}

export function isFlipped(sheetEl: HTMLElement): boolean {
  return sheetEl.classList.contains("versoed");
}

export function toggleFlip(sheetEl: HTMLElement): boolean {
  if (isFlipped(sheetEl)) { flipToRecto(sheetEl); return false; }
  flipToVerso(sheetEl);
  return true;
}

function flipToVerso(sheetEl: HTMLElement): void {
  sheetEl.classList.add("flip3d");
  // Force a reflow so .flip3d's flat state commits BEFORE the rotation target (a same-tick class pair can be coalesced, skipping the transition); .versoed lands synchronously so isFlipped is correct the instant the click returns.
  void sheetEl.offsetWidth;
  sheetEl.classList.add("versoed");
}

function flipToRecto(sheetEl: HTMLElement): void {
  const inner = sheetEl.querySelector(".sheet-inner") as HTMLElement;
  let settled = false;
  const settle = (): void => {
    if (settled) return;
    settled = true;
    inner.removeEventListener("transitionend", onEnd);
    // Tear the 3D context down only if the leaf really landed on the recto; a fast re-flip may have put us back on the verso while this turn-back was in flight.
    if (!sheetEl.classList.contains("versoed")) sheetEl.classList.remove("flip3d");
  };
  const onEnd = (e: TransitionEvent): void => {
    if (e.target === inner && e.propertyName === "transform") settle();
  };
  inner.addEventListener("transitionend", onEnd);
  sheetEl.classList.remove("versoed");
  // Backstop past --verso-turn: a browser can skip transitionend for a ~0ms reduced-motion transition (or an interrupted turn); still restore byte-parity so the recto never rests with the 3D context lit.
  setTimeout(settle, 1600);
}
