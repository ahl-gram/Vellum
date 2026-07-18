// The atlas document: the standalone-page wrapper (head, header, section layout,
// footer) plus the shared inner CSS, extracted out of src/cli/atlas.ts so the CLI
// deploy path and the Print Room's bound atlas both draw from ONE source. Browser-safe
// by construction: no node: imports, only pure string
// building and the btoa/TextEncoder globals both Node and the browser provide. buildAtlas
// keeps all of the filesystem work; this module never touches the disk or the DOM.
import { escapeXml } from "../render/svg.ts";
import type { AtlasPlate } from "./compose.ts";

// Which band of the atlas a plate sits in. Drives the filename scheme (the style
// plates carry the world- prefix the CLI has always written) and the page layout.
export type PlateSection = "hero" | "draughting" | "theme" | "region";

// The header fields + the composed plates and fragments an atlas document needs. This
// is exactly the shape serializableAtlas produces (docs/explorer/serializable-atlas.js),
// so the Print Room can hand a worker's atlas result straight in; the CLI builds the same
// shape from the World it holds. No `world` here on purpose: the worker strips it (its
// Field methods are not structured-cloneable), so the document must never need it.
export type AtlasDocumentData = {
  readonly title: string;
  readonly subtitle: string;
  readonly seed: number;
  readonly hero: AtlasPlate;
  readonly draughtings: ReadonlyArray<AtlasPlate>;
  readonly themes: ReadonlyArray<AtlasPlate>;
  readonly regions: ReadonlyArray<AtlasPlate>;
  readonly bannersHtml: string;
  readonly chronicleHtml: string;
  readonly gazetteerHtml: string;
};

/**
 * The shared inner atlas CSS: the single source of truth for how the composed plates,
 * tables, banners, and chronicle are drawn. Scoped under `.atlas-sheet` so it can be
 * injected into any host page with its own figure/table/h2 without bleeding: the Print
 * Room (bound-atlas.js injects it) and the generated atlas document (buildAtlas embeds
 * it). This CLOSES the drift trap: before, these exact rules were hand-mirrored in both
 * src/cli/atlas.ts's <style> and the Explorer's inline bind view. (The Explorer's own
 * "Bind as atlas" was retired in #199 and its bound atlas consolidated into the Print Room.)
 *
 * Deliberately does NOT carry page chrome (body background, header, footer) or the
 * divergent bits (page-chrome spacing like the standalone's h2 margin-top): those stay
 * context-local so each host is unchanged. The transition timing falls back to literal values
 * (var(--paper, 260ms)) so the self-contained download, which links no /motion.css, still
 * eases correctly.
 */
export const ATLAS_SHEET_CSS = `.atlas-sheet figure { margin: 1.5rem 0; }
.atlas-sheet h2 { letter-spacing: 0.06em; border-bottom: 1px solid #b9a77f; padding-bottom: 0.3rem;
  font-family: var(--font-display, 'Iowan Old Style', 'Palatino', Georgia, serif); }
.atlas-sheet figure img { width: 100%; height: auto; display: block;
  border: 1px solid #b9a77f; box-shadow: 0 10px 30px rgb(61 47 31 / 0.18);
  transition: transform var(--paper, 260ms) var(--ease-paper, cubic-bezier(0.22, 0.61, 0.36, 1)),
              box-shadow var(--paper, 260ms) var(--ease-paper, cubic-bezier(0.22, 0.61, 0.36, 1)); }
.atlas-sheet figure img:hover { transform: translateY(-5px) rotate(-0.6deg);
  box-shadow: 0 20px 44px rgb(61 47 31 / 0.28); }
.atlas-sheet figure img:active { transform: translateY(-1px) rotate(0deg); }
.atlas-sheet figcaption { text-align: center; font-style: italic; color: #6b5a40; padding-top: 0.55rem;
  font-family: var(--font-flourish, 'Iowan Old Style', 'Palatino', Georgia, serif); }
.atlas-sheet .styles { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.atlas-sheet .themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem; }
.atlas-sheet table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.atlas-sheet th { text-align: left; border-bottom: 2px solid #4a3826; padding: 0.45rem 0.6rem; }
.atlas-sheet td { border-bottom: 1px solid #cdbd97; padding: 0.45rem 0.6rem; vertical-align: top; }
.atlas-sheet td.name { font-weight: 600; white-space: nowrap; }
.atlas-sheet td.name.capital { text-transform: uppercase; letter-spacing: 0.06em; }
.atlas-sheet td.note { font-style: italic; color: #54452f; }
.atlas-sheet .realms { font-style: italic; color: #6b5a40; }
.atlas-sheet .banners { display: flex; flex-wrap: wrap; gap: 1.1rem; justify-content: center; }
.atlas-sheet .banner { width: 120px; text-align: center; }
.atlas-sheet .banner svg { width: 100%; height: auto; }
.atlas-sheet .banner figcaption { font-style: italic; color: #6b5a40; font-size: 0.85rem; padding-top: 0.35rem; }
.atlas-sheet .chronicle-intro { font-style: italic; color: #6b5a40; }
.atlas-sheet ol.chronicle { list-style: none; padding: 0; margin: 1rem 0 0; max-width: 48rem; }
.atlas-sheet ol.chronicle li { padding: 0.4rem 0; border-bottom: 1px solid #cdbd97; display: flex; gap: 0.9rem; }
.atlas-sheet ol.chronicle .year { flex: 0 0 3.2rem; text-align: right; font-variant-numeric: tabular-nums;
  font-weight: 600; color: #857257; }`;

// The page chrome for the STANDALONE document only (the CLI /atlas/ page and the
// single-file download). Never injected into a host page, which supplies its own body
// and header. h2 margin-top lives here at the standalone's 3rem, kept off the shared
// block on purpose so each host keeps its own spacing.
const PAGE_CHROME_CSS = `:root { color-scheme: light; }
body {
  margin: 0; padding: 2.5rem 1.5rem 5rem;
  background: #efe6cf; color: #3d2f1f;
  font-family: var(--font-body, 'Iowan Old Style', 'Palatino', Georgia, serif);
  max-width: 1080px; margin-inline: auto;
}
/* The Punchcutter's Case (#228): the deployed page links /fonts.css (below, gated on
   motion) so these vars resolve to the Fell/Garamond faces; the offline single-file
   download links nothing, so each var falls back to the serif stack inline. */
h1, h2, .chartno, footer {
  font-family: var(--font-display, 'Iowan Old Style', 'Palatino', Georgia, serif);
}
.subtitle {
  font-family: var(--font-flourish, 'Iowan Old Style', 'Palatino', Georgia, serif);
}
header { text-align: center; margin-bottom: 2rem; }
h1 { font-size: 2.4rem; letter-spacing: 0.04em; margin: 0 0 0.4rem; }
h2 { margin-top: 3rem; }
.subtitle { font-style: italic; color: #6b5a40; max-width: 46rem; margin-inline: auto; }
.chartno { letter-spacing: 0.3em; font-size: 0.8rem; color: #857257; margin-top: 0.6rem; }
footer { margin-top: 4rem; text-align: center; letter-spacing: 0.25em;
  font-size: 0.75rem; color: #857257; }
a { color: inherit; }`;

// The plate's SVG filename in its atlas section. The style plates (the antique hero and
// the other draughtings) carry the world- prefix the CLI has written since the first
// atlas; the theme/region keys already read theme-* / region-*, so they stand alone.
export function atlasPlateFilename(plate: { key: string }, section: PlateSection): string {
  return section === "hero" || section === "draughting"
    ? `world-${plate.key}.svg`
    : `${plate.key}.svg`;
}

// A base64 `data:image/svg+xml` URI for a plate, so the single-file download inlines its
// plates and opens offline with no external references. Base64 over a UTF-8 byte view
// (not btoa(svg) directly) so a world title carrying non-ASCII glyphs survives; chunked
// through String.fromCharCode so a multi-megabyte plate never overflows the argument
// stack. PNGs and PDFs stay out of the determinism covenant; so does this (it is an
// <img> embed of the byte-faithful SVG, not a re-render).
export function svgToDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

// One <figure> for a plate: its <img> (optionally wrapped in a link to the same source,
// for the CLI's file-backed page) and its caption. The download passes anchor:false so a
// data-URI plate is never embedded twice.
function plateFigure(
  plate: AtlasPlate,
  section: PlateSection,
  plateSrc: (plate: AtlasPlate, section: PlateSection) => string,
  anchor: boolean,
): string {
  const src = plateSrc(plate, section);
  const alt = escapeXml(plate.title);
  const img = `<img src="${src}" alt="${alt}">`;
  const linked = anchor ? `<a href="${src}">${img}</a>` : img;
  return `<figure>${linked}<figcaption>${alt}</figcaption></figure>`;
}

/**
 * Assemble a complete standalone atlas HTML document from composed plates. `plateSrc`
 * decides how each plate is embedded: the CLI returns a filename (and sets anchor:true
 * so the sheet links its full-size SVG); the single-file download returns a base64 data
 * URI (anchor:false). `motion` links the shared /fonts.css (the Punchcutter faces, #228)
 * and /motion.css desk (the CLI page and the folio); the offline download omits both and
 * relies on the CSS fallbacks above (serif type, literal-valued transitions).
 */
export function atlasDocument(
  data: AtlasDocumentData,
  plateSrc: (plate: AtlasPlate, section: PlateSection) => string,
  opts: { anchor?: boolean; motion?: boolean } = {},
): string {
  const anchor = opts.anchor ?? false;
  const motion = opts.motion ?? false;
  const fig = (p: AtlasPlate, section: PlateSection) => plateFigure(p, section, plateSrc, anchor);

  const draughtings = data.draughtings.map((p) => fig(p, "draughting")).join("\n");
  const themes = data.themes.map((p) => fig(p, "theme")).join("\n");
  const regions = data.regions.map((p) => fig(p, "region")).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXml(data.title)}: a Vellum atlas</title>
${motion ? '<link rel="stylesheet" href="/fonts.css">\n<link rel="stylesheet" href="/motion.css">\n' : ""}<style>
${PAGE_CHROME_CSS}
${ATLAS_SHEET_CSS}
</style>
</head>
<body class="atlas-sheet">
<header>
  <h1>${escapeXml(data.title)}</h1>
  <p class="subtitle">${escapeXml(data.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${data.seed}</p>
</header>

${fig(data.hero, "hero")}

<section>
<h2>Other Draughtings</h2>
<div class="styles">
${draughtings}
</div>
</section>

<section>
<h2>Thematic Surveys</h2>
<div class="themes">
${themes}
</div>
</section>

<section>
<h2>Regional Surveys</h2>
${regions}
</section>

${data.bannersHtml}

${data.chronicleHtml}

${data.gazetteerHtml}

<footer>DRAWN BY VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY</footer>
</body>
</html>
`;
}
