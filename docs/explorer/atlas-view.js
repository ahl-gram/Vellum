// The bound atlas view: the inline atlas drawn beneath the chart. Owns the blob
// URL lifecycle. Plates are embedded as <img> with blob URLs, never inline <svg>:
// every chart carries internal ids (map-clip, glyph/texture/label defs) referenced
// by url(#...), so injecting several inline into one document would collide them.
import { escapeXml } from "./engine/render/svg.js";

const atlasDiv = document.getElementById("atlas");
let atlasUrls = [];
let plateObserver = null; // #127: the reveal-on-scroll observer for the current atlas

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
  // Release the previous atlas's reveal observer before its figures are detached.
  if (plateObserver) { plateObserver.disconnect(); plateObserver = null; }
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
  const figs = [...atlasDiv.querySelectorAll("figure")];
  // #127: seed each plate with a fallback stagger index, then settle them in as they
  // scroll INTO VIEW (revealPlates). Injecting them animated at the top of the page
  // meant the cascade finished off-screen before the auto-scroll arrived; tying it to
  // visibility means it is actually seen on arrival, and keeps going down a tall atlas.
  figs.forEach((f, i) => f.style.setProperty("--i", String(Math.min(i, 12))));
  revealPlates(figs);
  // Keep the smooth scroll, but respect reduced motion (a JS scroll is not reached
  // by the CSS reduced-motion collapse in /motion.css).
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  atlasDiv.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

// Add .settling to each plate as it enters the viewport, so the settle animation
// (index.css) plays where the reader can see it. Reduced motion or no
// IntersectionObserver: reveal everything at once, so no plate is ever left hidden
// and nothing moves.
function revealPlates(figs) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof IntersectionObserver !== "function") {
    figs.forEach((f) => f.classList.add("settling"));
    return;
  }
  plateObserver = new IntersectionObserver((entries, obs) => {
    // Re-index by reveal batch (not global position) so a plate reached later settles
    // promptly instead of waiting out a large global animation-delay.
    let k = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty("--i", String(k++));
      e.target.classList.add("settling");
      obs.unobserve(e.target);
    }
  }, { threshold: 0.2 });
  figs.forEach((f) => plateObserver.observe(f));
}
