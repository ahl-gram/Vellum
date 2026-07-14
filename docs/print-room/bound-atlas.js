// The Print Room's bound atlas (#136, epic #132 Sub 4). Composes the FULL atlas of the
// current proof off-thread (the same `atlas` job the Explorer's Bind uses), lays it out
// inline as a print-first sheet, and offers two ways to take it home:
//   - Print the atlas: the browser's own Save-as-PDF, driven by the @media print
//     stylesheet in index.css (this replaces the deleted CLI `--pdf`).
//   - Download single-file HTML: a self-contained document (every plate inlined as a
//     base64 data URI) that opens offline in a fresh browser.
//
// Imports are ROOT-ABSOLUTE (/explorer/...) like the rest of the Print Room, so the
// module's own ./engine/... imports resolve against /explorer/, not /print-room/ (a bare
// relative path would 404). The shared render worker is the SAME singleton app.js
// connects via initWorker; importing runJob here reuses it.
import { runJob } from "/explorer/worker-client.js";
import { escapeXml } from "/explorer/engine/render/svg.js";
import { ATLAS_SHEET_CSS, atlasDocument, svgToDataUri } from "/explorer/engine/atlas/document.js";

// Inject the shared plate/table/banner CSS once (the same single source the standalone
// atlas draws from). #pr-atlas carries the .atlas-sheet class in the markup.
if (!document.getElementById("atlas-sheet-css")) {
  const style = document.createElement("style");
  style.id = "atlas-sheet-css";
  style.textContent = ATLAS_SHEET_CSS;
  document.head.appendChild(style);
}

const $ = (id) => document.getElementById(id);
const bindBtn = $("pr-bind");
const printBtn = $("pr-print");
const downloadBtn = $("pr-download");
const hideBtn = $("pr-hide");
const atlasDiv = $("pr-atlas");
const status = $("pr-bound-status");

let getBasis = () => null; // set by initBoundAtlas; reads the current proof's world
let atlasUrls = []; // blob URLs for the inline preview plates, revoked on recompose
let lastAtlas = null; // the last successfully composed atlas (serializable), for the download
// Monotonic guard: a redraw (clearBoundAtlas) or a newer bind invalidates an in-flight
// bind, so a slow compose can never inject an atlas that disagrees with the proof.
let bindGen = 0;
let binding = false;

// The delivery actions (Print, Download, Hide) come alive together once an atlas is bound.
function setDeliveryEnabled(on) {
  printBtn.disabled = !on;
  downloadBtn.disabled = !on;
  hideBtn.disabled = !on;
}

// Tear down the current bound atlas: release its preview blob URLs, empty the sheet, drop the
// delivery buttons, and invalidate any in-flight bind (bindGen++). Shared by the two callers
// below, which differ only in what they do to the Bind button.
function resetBoundAtlas() {
  bindGen++;
  for (const url of atlasUrls) URL.revokeObjectURL(url);
  atlasUrls = [];
  lastAtlas = null;
  atlasDiv.innerHTML = "";
  setDeliveryEnabled(false);
  document.body.classList.remove("has-atlas");
  status.textContent = "";
}

// Called at the START of every draw (app.js): a redraw is coming, so ALSO disable Bind until
// the new proof settles. Without this, posterBasis still points at the PREVIOUS world during
// the redraw's in-flight window, and a bind clicked then would compose the old world's atlas
// and survive the bindGen guard (the new proof lands without bumping bindGen), leaving the
// bound sheet disagreeing with the on-screen proof. enableBind re-enables it when the new
// proof settles (mirrors the Explorer's Bind, disabled for the whole draw round-trip).
export function clearBoundAtlas() {
  resetBoundAtlas();
  bindBtn.disabled = true;
}

// The Hide button: dismiss the bound atlas after a look, but keep Bind enabled since the proof
// on the desk is unchanged and can be bound again. (#136 redesign: the atlas is nice to see
// but should be dismissable so it does not dominate the page.)
function hideAtlas() {
  resetBoundAtlas();
  bindBtn.disabled = false;
}

// A proof landed: a world is available to bind. Enable the counter's Bind button.
export function enableBind() {
  bindBtn.disabled = false;
}

function plateFigure(svg, caption, cls = "") {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  atlasUrls.push(url);
  const c = escapeXml(caption);
  const classAttr = cls ? ` class="${cls}"` : "";
  // Eager, NOT loading="lazy" (unlike the Explorer's scroll view): the bound atlas is a
  // print target, and a below-fold lazy plate can print blank if the engine renders to PDF
  // before it loads. Loading all plates up front is exactly what "bind the whole atlas" wants.
  return `<figure${classAttr}><img src="${url}" alt="${c}"><figcaption>${c}</figcaption></figure>`;
}

// Render the whole atlas inline: a title header, then every plate and fragment in atlas
// order. Plates ride blob-URL <img>s (cheap, session-scoped) exactly like the Explorer's
// atlas view; the download rebuilds the identical atlas with base64 data URIs so it opens
// offline.
//
// innerHTML safety: the same trusted-input contract as the Print Room proof (app.js). The
// only inputs to a bound atlas are the uint32 seed and recipe params, each
// validated against fixed allowlists in app.js's applyHash before any worker job runs, so
// no user-controlled string reaches here. Captions, the title, and the subtitle are
// derived from the deterministic name generator, and are escapeXml'd besides; the plate
// SVGs and the composer's banner/chronicle/gazetteer fragments are trusted engine output.
function renderBoundAtlas(atlas) {
  // The title header and the hero plate carry .print-only: on screen they duplicate the proof
  // shown right above, so index.css hides them; print reveals them for a complete standalone
  // atlas. They stay in the DOM so Print (which prints #pr-atlas) still includes them; Download
  // is independent (it rebuilds from the full atlas), so it carries them regardless.
  const hero = plateFigure(atlas.hero.svg, atlas.hero.title, "hero-plate print-only");
  const draughtings = atlas.draughtings.map((p) => plateFigure(p.svg, p.title)).join("\n");
  const themes = atlas.themes.map((p) => plateFigure(p.svg, p.title)).join("\n");
  const regions = atlas.regions.map((p) => plateFigure(p.svg, p.title)).join("\n");
  atlasDiv.innerHTML = `<header class="atlas-head print-only">
  <h1>${escapeXml(atlas.title)}</h1>
  <p class="subtitle">${escapeXml(atlas.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${atlas.seed}</p>
</header>
${hero}
<section><h2>Other Draughtings</h2><div class="styles">${draughtings}</div></section>
<section><h2>Thematic Surveys</h2><div class="themes">${themes}</div></section>
${regions ? `<section><h2>Regional Surveys</h2>${regions}</section>` : ""}
${atlas.bannersHtml}
${atlas.chronicleHtml}
${atlas.gazetteerHtml}`;
}

// Compose the atlas of the current proof off-thread and lay it out. Snapshots the basis
// synchronously (a style change could redraw mid-compose), guards against supersession,
// and revokes the previous preview's blobs before drawing the new one.
function bindAtlas() {
  const basis = getBasis();
  if (!basis || binding) return;
  const myGen = ++bindGen;
  binding = true;
  bindBtn.disabled = true;
  setDeliveryEnabled(false);
  // Release the previous preview before composing the next (blob lifecycle).
  for (const url of atlasUrls) URL.revokeObjectURL(url);
  atlasUrls = [];
  status.textContent = "Binding the atlas…";
  runJob({
    kind: "atlas",
    seed: basis.seed,
    overrides: basis.overrides,
    width: 1500,
    bannerStyle: basis.style,
  })
    .then((res) => {
      if (myGen !== bindGen) return; // a redraw or newer bind superseded this compose
      lastAtlas = res.atlas;
      renderBoundAtlas(res.atlas);
      setDeliveryEnabled(true);
      document.body.classList.add("has-atlas");
      // The atlas populates below the proof, off-screen from the order desk up top, so bring
      // it into view (a JS scroll bypasses the CSS reduced-motion collapse, so honor it here).
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      atlasDiv.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      status.textContent = `The atlas of ${res.atlas.title} is bound: print it, take the single file, or hide it.`;
      // e2e observation point: the bound atlas, without holding the plate bytes.
      window.__vellumBoundAtlas = { seed: res.atlas.seed, title: res.atlas.title, figures: atlasDiv.querySelectorAll("figure").length };
    })
    .catch((err) => {
      if (myGen !== bindGen) return;
      status.textContent = "The bindery faltered: " + err.message;
    })
    .finally(() => {
      binding = false;
      // Re-open the Bind button unless a redraw cleared us mid-flight (clearBoundAtlas
      // bumped bindGen; the proof handler will re-enable Bind when the next proof lands).
      if (myGen === bindGen) bindBtn.disabled = false;
    });
}

// Print the bound atlas to PDF via the browser. The @media print stylesheet (index.css,
// scoped body.has-atlas) hides all page chrome and breaks one plate per page.
function printAtlas() {
  if (!lastAtlas) return;
  window.print();
}

// Build the self-contained document and hand it over as a download. Every plate is inlined
// as a base64 data URI (svgToDataUri), so the file carries no external references and opens
// offline. Expect ~20MB; the UI copy says so. The download string never enters the DOM.
function downloadAtlas() {
  if (!lastAtlas) return;
  const html = atlasDocument(lastAtlas, (p) => svgToDataUri(p.svg), { anchor: false, motion: false });
  const blob = new Blob([html], { type: "text/html" });
  const filename = `vellum-atlas-${lastAtlas.seed}.html`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  status.textContent = `The bound atlas is yours: ${filename}. It opens offline in any browser.`;
  // e2e observation point: metadata only, never the multi-megabyte string.
  window.__vellumLastAtlasDownload = {
    filename,
    size: blob.size,
    dataUris: (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length,
    hasBlobUrl: html.includes("blob:"),
    hasExternalCss: html.includes('href="/motion.css"'),
    title: lastAtlas.title,
  };
}

// Wire the counter. getBasisFn returns the current proof's world snapshot (app.js's
// posterBasis) at click time, so a bind reproduces exactly the sheet on screen.
export function initBoundAtlas(getBasisFn) {
  getBasis = getBasisFn;
  bindBtn.addEventListener("click", bindAtlas);
  printBtn.addEventListener("click", printAtlas);
  downloadBtn.addEventListener("click", downloadAtlas);
  hideBtn.addEventListener("click", hideAtlas);
  // e2e hooks for the delivery actions that never touch the DOM.
  window.__vellumPrintAtlas = printAtlas;
}
