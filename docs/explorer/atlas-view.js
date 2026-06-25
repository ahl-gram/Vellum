// The bound atlas view: the inline atlas drawn beneath the chart. Owns the blob
// URL lifecycle. Plates are embedded as <img> with blob URLs, never inline <svg>:
// every chart carries internal ids (map-clip, glyph/texture/label defs) referenced
// by url(#...), so injecting several inline into one document would collide them.
import { escapeXml } from "./engine/render/svg.js";

const atlasDiv = document.getElementById("atlas");
let atlasUrls = [];

// Short captions for the style plates (the composer's hero caption is a full
// sentence, too long for the grid alongside the others).
const STYLE_LABEL = {
  antique: "The antique chart",
  topographic: "Topographic",
  ink: "Pen & ink",
  nautical: "Nautical",
};

export function clearAtlas() {
  for (const url of atlasUrls) URL.revokeObjectURL(url);
  atlasUrls = [];
  atlasDiv.innerHTML = "";
}

function plateFigure(svg, caption) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  atlasUrls.push(url);
  const c = escapeXml(caption);
  return `<figure><img src="${url}" alt="${c}" loading="lazy"><figcaption>${c}</figcaption></figure>`;
}

function atlasHtml(atlas, currentStyle, currentTheme) {
  // The chart on screen IS this world drawn either as a style (no theme) or as a
  // theme plate. Show every OTHER plate so the atlas never repeats the on-screen
  // map: a theme on screen drops that theme from Thematic Surveys and lets the
  // antique chart return to Other Draughtings; otherwise the on-screen style drops
  // from Other Draughtings.
  const shownStyle = currentTheme ? null : currentStyle;
  const others = [atlas.hero, ...atlas.draughtings].filter(
    (p) => p.key !== shownStyle,
  );
  const draughtings = others
    .map((p) => plateFigure(p.svg, STYLE_LABEL[p.key] ?? p.title))
    .join("\n");
  const shownTheme = currentTheme ? `theme-${currentTheme}` : null;
  const themePlates = atlas.themes.filter((t) => t.key !== shownTheme);
  const thematic = themePlates.length
    ? `<section><h2>Thematic Surveys</h2><div class="themes">${themePlates
        .map((t) => plateFigure(t.svg, t.title))
        .join("\n")}</div></section>`
    : "";
  const surveys = atlas.regions.length
    ? `<section><h2>Regional Surveys</h2>${atlas.regions
        .map((r) => plateFigure(r.svg, r.title))
        .join("\n")}</section>`
    : "";
  return `<section><h2>Other Draughtings</h2><div class="styles">${draughtings}</div></section>
${thematic}
${surveys}
${atlas.bannersHtml}
${atlas.chronicleHtml}
${atlas.gazetteerHtml}`;
}

// Inject the composed atlas beneath the chart and scroll it into view. The plate
// SVGs are engine output and captions are escapeXml'd in atlasHtml.
export function renderAtlas(atlas, currentStyle, currentTheme) {
  atlasDiv.innerHTML = atlasHtml(atlas, currentStyle, currentTheme);
  atlasDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}
