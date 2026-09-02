// The atlas document: the standalone-page wrapper plus the shared inner CSS, the ONE
// source the CLI deploy path and the Print Room's bound atlas both draw from. Browser-safe
// by construction: no node: imports, no disk, no DOM (buildAtlas keeps the filesystem work).
import { escapeXml } from "../render/svg.ts";
import { paletteRootCss } from "./palette.ts";
import type { AtlasPlate } from "./compose.ts";

// Drives the filename scheme and the page layout.
export type PlateSection = "hero" | "draughting" | "theme" | "region" | "prospect";

// Exactly the shape `serializableAtlas` in `src/site/explorer/serializable-atlas.ts`
// produces. No `world` on purpose: the worker strips it (Fields are not
// structured-cloneable), so the document must never need it.
export type AtlasDocumentData = {
  readonly title: string;
  readonly subtitle: string;
  readonly seed: number;
  readonly hero: AtlasPlate;
  readonly draughtings: ReadonlyArray<AtlasPlate>;
  readonly themes: ReadonlyArray<AtlasPlate>;
  readonly regions: ReadonlyArray<AtlasPlate>;
  readonly prospects: ReadonlyArray<AtlasPlate>;
  readonly bannersHtml: string;
  readonly chronicleHtml: string;
  readonly gazetteerHtml: string;
};

/**
 * The shared inner atlas CSS, scoped under `.atlas-sheet` so any host can inject it without
 * bleeding. Carries no page chrome, so each host keeps its own. Transition timings fall back
 * to literals (var(--paper, 260ms)): the download links no /motion.css and must still ease.
 */
export const ATLAS_SHEET_CSS = `.atlas-sheet figure { margin: 1.5rem 0; }
.atlas-sheet figure a { display: block; position: relative; }
/* The waiting frame (#329) sits BEHIND the img (negative z-index), so the opaque plate
   paints over it as it lands. Anchor-wrapped plates only, which since #368 includes the
   download's: a lazy below-fold plate there shows it briefly though the bytes are local. */
.atlas-sheet figure a::before { content: "Drafting…"; position: absolute; inset: 0; z-index: -1;
  display: grid; place-items: center; font-style: italic;
  background: var(--parchment-panel); color: var(--ink-faded); }
.atlas-sheet h2 { letter-spacing: 0.06em; border-bottom: 1px solid var(--line-tan); padding-bottom: 0.3rem;
  font-family: var(--font-display, 'Iowan Old Style', 'Palatino', Georgia, serif); }
.atlas-sheet figure img { width: 100%; height: auto; display: block;
  border: 1px solid var(--line-tan); box-shadow: 0 10px 30px rgb(from var(--chart-ink) r g b / 0.18);
  transition: transform var(--paper, 260ms) var(--ease-paper, cubic-bezier(0.22, 0.61, 0.36, 1)),
              box-shadow var(--paper, 260ms) var(--ease-paper, cubic-bezier(0.22, 0.61, 0.36, 1)); }
/* The lift is scoped to ANCHORED plates (#368): with scripting off the download has no
   link and correctly no lift, rather than the false affordance #289's tip contract names. */
.atlas-sheet figure a img:hover { transform: translateY(-5px) rotate(-0.6deg);
  box-shadow: 0 20px 44px rgb(from var(--chart-ink) r g b / 0.28); }
.atlas-sheet figure a img:active { transform: translateY(-1px) rotate(0deg); }
.atlas-sheet figcaption { text-align: center; font-style: italic; color: var(--ink-brown); padding-top: 0.55rem;
  font-family: var(--font-flourish, 'Iowan Old Style', 'Palatino', Georgia, serif); }
.atlas-sheet .styles { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.atlas-sheet .themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem; }
.atlas-sheet table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.atlas-sheet th { text-align: left; border-bottom: 2px solid var(--ink-dark); padding: 0.45rem 0.6rem; }
.atlas-sheet td { border-bottom: 1px solid var(--line-faint); padding: 0.45rem 0.6rem; vertical-align: top; }
.atlas-sheet td.name { font-weight: 600; white-space: nowrap; }
.atlas-sheet td.name.capital { text-transform: uppercase; letter-spacing: 0.06em; }
/* white-space: normal is load-bearing: td.name is nowrap, so an unbreakable "Once called X." sets a min-content floor that scrolls a 390 page sideways (measured: 20 of 60 seeds newly overflow without it). */
.atlas-sheet td.name .former { display: block; white-space: normal; font-weight: 400; font-size: 0.86em;
  color: var(--ink-brown); text-transform: none; letter-spacing: normal; }
.atlas-sheet td.note { font-style: italic; color: var(--ink-tale); }
.atlas-sheet .realms { font-style: italic; color: var(--ink-brown); }
.atlas-sheet .banners { display: flex; flex-wrap: wrap; gap: 1.1rem; justify-content: center; }
.atlas-sheet .banner { width: 120px; text-align: center; }
.atlas-sheet .banner svg { width: 100%; height: auto; }
.atlas-sheet .banner figcaption { font-style: italic; color: var(--ink-brown); font-size: 0.85rem; padding-top: 0.35rem; }
.atlas-sheet .chronicle-intro { font-style: italic; color: var(--ink-brown); }
.atlas-sheet ol.chronicle { list-style: none; padding: 0; margin: 1rem 0 0; max-width: 48rem; }
.atlas-sheet ol.chronicle li { padding: 0.4rem 0; border-bottom: 1px solid var(--line-faint); display: flex; gap: 0.9rem; }
.atlas-sheet ol.chronicle .year { flex: 0 0 3.2rem; text-align: right; font-variant-numeric: tabular-nums;
  font-weight: 600; color: var(--ink-faded); }`;

// STANDALONE documents only, never injected into a host page: h2 margin-top sits here,
// off the shared block, so each host keeps its own spacing.
const PAGE_CHROME_CSS = `:root { color-scheme: light; }
${paletteRootCss()}
body {
  margin: 0; padding: 2.5rem 1.5rem 5rem;
  background: var(--parchment); color: var(--ink-dark);
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
.subtitle { font-style: italic; color: var(--ink-brown); max-width: 46rem; margin-inline: auto; }
.chartno { letter-spacing: 0.3em; font-size: 0.8rem; color: var(--ink-faded); margin-top: 0.6rem; }
footer { margin-top: 4rem; text-align: center; letter-spacing: 0.25em;
  font-size: 0.75rem; color: var(--ink-faded); }
a { color: inherit; }`;

// The served /atlas/ page's screen dress (Sub 9, #464): the walnut deep as the ground, the header and
// footer lettered in parchment, the hero and every section a parchment sheet. Emitted with `motion` only
// (the page the site serves); the self-contained download keeps its paper chrome to the byte (print is
// paper, #454 decision 4; test/atlas/document.test.ts pins the digest). The deep and the sheet depth
// mirror BaseLayout's declarations, pinned equal by the same test: the page links no shell sheet.
const SCREEN_DRESS_CSS = `:root {
  --the-deep:
    radial-gradient(120% 90% at 50% 30%, rgb(from var(--ink-dark) r g b / 0) 40%, rgb(from var(--chart-ink) r g b / 0.55) 100%),
    radial-gradient(80% 70% at 30% 20%, color-mix(in srgb, var(--ink-dark) 90%, var(--parchment) 10%) 0%, var(--ink-dark) 55%, var(--chart-ink) 100%);
  --sheet-shadow: 0 12px 34px rgb(from var(--chart-ink) r g b / 0.4);
}
body { background: var(--chart-ink); }
body::before { content: ""; position: fixed; inset: 0; z-index: -1; background: var(--the-deep); background-color: var(--chart-ink); }
header { margin-bottom: 2.8rem; }
h1 { font-weight: 400; color: var(--parchment-bright); }
.subtitle, .chartno { color: var(--parchment); }
.atlas-sheet > figure, .atlas-sheet > section { background: var(--parchment-panel); border: 1px solid var(--line-tan);
  outline: 3px double var(--line-faint); outline-offset: 6px; box-shadow: var(--sheet-shadow);
  padding: 1.8rem clamp(1.25rem, 3vw, 2.75rem) 2.4rem; margin: 2.8rem 0; }
.atlas-sheet > section > h2 { margin-top: 0; }
/* The gazetteer's table has a min-content floor (td.name is nowrap) wider than a phone's sheet, measured 364px against a 390 viewport (plate read 2026-09-02): its sheet scrolls the table inside rather than the page sideways. */
.atlas-sheet > section:has(> table) { overflow-x: auto; }
/* The plate grids' column floors (280px, 360px) exceed a phone's sheet the same way (the themes measured 405px against 390): capped to the container, so a column never outgrows its sheet. */
.atlas-sheet .styles { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.atlas-sheet .themes { grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr)); }
footer { color: var(--line-tan); }
@media print {
  body { background: none; }
  body::before { display: none; }
  h1, .subtitle, .chartno { color: var(--ink-dark); }
  .atlas-sheet > figure, .atlas-sheet > section { background: none; border: 0; outline: 0; box-shadow: none; padding: 0; margin: 1.5rem 0; }
  .atlas-sheet > section > h2 { margin-top: 3rem; }
  footer { color: var(--ink-faded); }
}`;

// Style plates carry the world- prefix the CLI has always written; theme/region keys
// already read theme-* / region-*, so they stand alone.
export function atlasPlateFilename(plate: { key: string }, section: PlateSection): string {
  return section === "hero" || section === "draughting"
    ? `world-${plate.key}.svg`
    : `${plate.key}.svg`;
}

// Base64 over a UTF-8 byte view (not btoa(svg)) so a non-ASCII world title survives, and
// chunked so a multi-megabyte plate never overflows the argument stack.
export function svgToDataUri(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/**
 * The self-contained download's plates, linked at load (#368, ratified 2026-08-13).
 *
 * A plain `<a href="data:...">` is refused: measured in Brave 151 from a file:// origin the
 * tab lands on about:blank with "Not allowed to navigate top frame to data URL". Wrapping
 * server-side would instead double a ~20MB file, which is why `anchor:false` exists. So each
 * plate is wrapped here in a real link to a blob built from the data URI the img already
 * carries. The blobs are held for the page's life (~16MB on a 22.5MB atlas), the accepted
 * cost of a genuine anchor over a click handler: focus, middle-click and new-tab all behave.
 */
const PLATE_LINK_SCRIPT = `<script>
for (const img of document.querySelectorAll(".atlas-sheet figure > img")) {
  fetch(img.src)
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.target = "_blank";
      a.rel = "noopener";
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    })
    .catch((err) => {
      // Leave this plate a plain img: no link, and (per the css above) no lift either.
      console.warn("Vellum: could not link a plate to its full-size chart.", err);
    });
}
</script>`;

function plateFigure(
  plate: AtlasPlate,
  section: PlateSection,
  plateSrc: (plate: AtlasPlate, section: PlateSection) => string,
  anchor: boolean,
): string {
  const src = plateSrc(plate, section);
  const alt = escapeXml(plate.title);
  // #329: reserve the frame from the svg root's own dims so the document lays out before
  // a byte of chart arrives; graceful when a plate carries none.
  const dims = plate.svg.match(/width="(\d+)" height="(\d+)"/);
  const frame = dims ? ` width="${dims[1]}" height="${dims[2]}"` : "";
  const img = `<img src="${src}"${frame} loading="lazy" decoding="async" alt="${alt}">`;
  const linked = anchor ? `<a href="${src}">${img}</a>` : img;
  return `<figure>${linked}<figcaption>${alt}</figcaption></figure>`;
}

/**
 * `plateSrc` decides how a plate is embedded: a filename (CLI, with anchor:true) or a data
 * URI (download, anchor:false). `motion` links /fonts.css and /motion.css and wears the screen
 * dress (#464); the offline download omits all three and relies on the CSS fallbacks above.
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
  const prospects = data.prospects.map((p) => fig(p, "prospect")).join("\n");
  const prospectSection =
    data.prospects.length === 0
      ? ""
      : `<section>
<h2>The Prospect of the Capital</h2>
${prospects}
</section>

`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXml(data.title)}: a Vellum atlas</title>
${motion ? '<link rel="stylesheet" href="/fonts.css">\n<link rel="stylesheet" href="/motion.css">\n' : ""}<style>
${PAGE_CHROME_CSS}
${ATLAS_SHEET_CSS}${motion ? `\n${SCREEN_DRESS_CSS}` : ""}
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

${prospectSection}${data.bannersHtml}

${data.chronicleHtml}

${data.gazetteerHtml}

<footer>DRAWN BY VELLUM · AN ATELIER OF IMAGINARY CARTOGRAPHY</footer>
${anchor ? "" : PLATE_LINK_SCRIPT + "\n"}</body>
</html>
`;
}
