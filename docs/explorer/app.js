// Explorer UI controller. Wires the controls to the render worker (worker.js),
// draws the chart, binds the inline atlas, and keeps the URL hash in sync. The
// heavy world-gen + SVG render runs off the main thread; this file only handles
// the DOM, the worker handshake/fallback, and the draw/bind race guards.
import { defaultRecipe, generateWorld } from "./engine/world/generate.js";
import { renderMap } from "./engine/render/map-renderer.js";
import { composeAtlas } from "./engine/atlas/compose.js";
import { escapeXml } from "./engine/render/svg.js";

const $ = (id) => document.getElementById(id);
const seedInput = $("seed");
const styleSel = $("style");
const typeSel = $("type");
const bandSel = $("band");
const themeSel = $("theme");
const legendChk = $("legend");
const status = $("status");
const mapDiv = $("map");
const caption = $("caption");
const atlasDiv = $("atlas");
const bindBtn = $("bind");

let lastSvg = "";
let lastTitle = "";
let lastSeed = 0;
let lastOverrides = {};
let lastStyle = "antique";
let lastTheme = "";
let atlasUrls = [];

// Monotonic guards. drawGen is bumped by every draw; both a draw's own result and
// any pending bind check it, so a fresh draw cancels a stale draw and a stale bind
// (the bound atlas must always match the chart on screen). bindSeq guards rapid
// re-binds of the same chart against one another.
let drawGen = 0;
let bindSeq = 0;
// True while a draw's result is still in flight. Binding is suppressed during this
// window so the bound atlas can never be composed from a seed the chart is about to
// replace (the draw-then-bind race).
let drawing = false;

// Short captions for the style plates in the bound atlas (the composer's hero
// caption is a full sentence, too long for the grid alongside the others).
const STYLE_LABEL = {
  antique: "The antique chart",
  topographic: "Topographic",
  ink: "Pen & ink",
  nautical: "Nautical",
};

// Plates are embedded as <img> with blob URLs, never inline <svg>: every chart
// carries internal ids (map-clip, glyph/texture/label defs) referenced by
// url(#...), so injecting several inline into one document would collide them.
function clearAtlas() {
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

function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const seed = Number(params.get("seed"));
  if (Number.isInteger(seed) && seed >= 0) seedInput.value = String(seed);
  const style = params.get("style");
  if (style && [...styleSel.options].some((o) => o.value === style)) {
    styleSel.value = style;
  }
  const type = params.get("type") ?? "";
  if ([...typeSel.options].some((o) => o.value === type)) typeSel.value = type;
  const band = params.get("band") ?? "";
  if ([...bandSel.options].some((o) => o.value === band)) bandSel.value = band;
  const theme = params.get("theme") ?? "";
  if ([...themeSel.options].some((o) => o.value === theme)) themeSel.value = theme;
  const legend = params.get("legend");
  if (legend !== null) legendChk.checked = legend === "1";
}

function writeHash() {
  const params = new URLSearchParams();
  params.set("seed", seedInput.value);
  params.set("style", styleSel.value);
  if (typeSel.value) params.set("type", typeSel.value);
  if (bandSel.value) params.set("band", bandSel.value);
  if (themeSel.value) params.set("theme", themeSel.value);
  params.set("legend", legendChk.checked ? "1" : "0");
  history.replaceState(null, "", "#" + params.toString());
}

// --- Render worker plumbing -------------------------------------------------
// The heavy world-gen + SVG render runs in ./worker.js off the main thread so the
// UI stays responsive. The worker is best-effort. If it cannot be constructed
// (file://, strict CSP, an older browser) we fall back to running the same engine
// inline on the main thread, so the page always works.
let worker = null;
let reqId = 0;
const pending = new Map();

function onJobMessage(e) {
  const d = e.data;
  if (!d || d.id == null) return; // ignore the ready handshake and stray messages
  const p = pending.get(d.id);
  if (!p) return;
  pending.delete(d.id);
  if (d.ok) p.resolve(d);
  else p.reject(new Error(d.error || "worker error"));
}

// Mirrors worker.js: the composition's `world` carries Field methods that are not
// structured-cloneable, so the inline path strips it too. Both paths then return
// the same shape, keeping the worker/inline byte-identity check a clean compare.
function serializableAtlas(a) {
  return {
    hero: a.hero,
    draughtings: a.draughtings,
    themes: a.themes,
    regions: a.regions,
    bannersHtml: a.bannersHtml,
    chronicleHtml: a.chronicleHtml,
    gazetteerHtml: a.gazetteerHtml,
  };
}

function runInline(msg) {
  if (msg.kind === "draw") {
    const recipe = defaultRecipe(msg.seed, msg.overrides);
    const world = generateWorld(recipe);
    return {
      ok: true,
      svg: renderMap(world, msg.render),
      title: world.title.title,
      mapType: recipe.mapType,
      band: recipe.band,
    };
  }
  const world = generateWorld(defaultRecipe(msg.seed, msg.overrides));
  return { ok: true, atlas: serializableAtlas(composeAtlas(world, { width: msg.width })) };
}

function runJob(msg) {
  if (worker) {
    const id = ++reqId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ ...msg, id });
    });
  }
  // No worker: defer with a macrotask so the status line paints before the main
  // thread blocks on the inline render.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try { resolve(runInline(msg)); }
      catch (err) { reject(err); }
    }, 0);
  });
}

function initWorker() {
  return new Promise((resolve) => {
    let w;
    try {
      w = new Worker("./worker.js", { type: "module" });
    } catch {
      resolve(null);
      return;
    }
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      try { w.terminate(); } catch {}
      resolve(null);
    };
    const timer = setTimeout(fail, 4000);
    w.onerror = fail;
    w.onmessage = (e) => {
      if (settled || !e.data || !e.data.ready) return;
      settled = true;
      clearTimeout(timer);
      w.onmessage = onJobMessage;
      w.onerror = (ev) => {
        if (ev.preventDefault) ev.preventDefault();
        worker = null; // a crashed worker degrades to the inline path
        for (const [, p] of pending) p.reject(new Error("the render worker crashed"));
        pending.clear();
      };
      resolve(w);
    };
  });
}

function draw() {
  const seed = Number(seedInput.value) >>> 0;
  const myGen = ++drawGen;
  drawing = true;
  bindBtn.disabled = true;
  status.textContent = "Drafting…";
  caption.textContent = "";
  clearAtlas();
  writeHash();
  const overrides = {};
  if (typeSel.value) overrides.mapType = typeSel.value;
  if (bandSel.value) overrides.band = bandSel.value;
  const style = styleSel.value;
  const theme = themeSel.value;
  const legend = legendChk.checked;
  const t0 = performance.now();
  runJob({
    kind: "draw",
    seed,
    overrides,
    render: { style, widthPx: 1500, legend, theme: theme || undefined },
  })
    .then((res) => {
      if (myGen !== drawGen) return; // a newer draw superseded this one
      drawing = false;
      bindBtn.disabled = false;
      lastSvg = res.svg;
      lastTitle = res.title;
      lastSeed = seed;
      lastOverrides = overrides;
      lastStyle = style;
      lastTheme = theme;
      mapDiv.innerHTML = res.svg;
      const ms = (performance.now() - t0).toFixed(0);
      status.textContent = "";
      caption.textContent = `${res.title} · ${res.mapType} · ${res.band} · drawn in ${ms}ms`;
    })
    .catch((err) => {
      if (myGen !== drawGen) return;
      drawing = false;
      bindBtn.disabled = false;
      status.textContent = "The cartographer spilled the ink: " + err.message;
    });
}

$("draw").addEventListener("click", draw);
$("random").addEventListener("click", () => {
  seedInput.value = String(randomSeed());
  draw();
});
$("download").addEventListener("click", () => {
  if (!lastSvg) return;
  const blob = new Blob([lastSvg], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const slug = lastTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  a.download = `vellum-${seedInput.value}-${styleSel.value}-${slug}.svg`;
  a.click();
  URL.revokeObjectURL(a.href);
});
bindBtn.addEventListener("click", () => {
  if (!lastSvg || drawing) return;
  const myGen = drawGen;
  const mySeq = ++bindSeq;
  const style = lastStyle;
  const theme = lastTheme;
  clearAtlas();
  status.textContent = "Binding the atlas…";
  runJob({ kind: "atlas", seed: lastSeed, overrides: lastOverrides, width: 1500 })
    .then((res) => {
      // discard if a redraw or a newer bind has superseded this one
      if (myGen !== drawGen || mySeq !== bindSeq) return;
      atlasDiv.innerHTML = atlasHtml(res.atlas, style, theme);
      status.textContent = "";
      atlasDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch((err) => {
      if (myGen !== drawGen || mySeq !== bindSeq) return;
      status.textContent = "The bindery faltered: " + err.message;
    });
});
seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") draw();
});
for (const sel of [styleSel, typeSel, bandSel, themeSel, legendChk]) {
  sel.addEventListener("change", draw);
}

worker = await initWorker();
window.__vellumUsesWorker = () => worker !== null;
// Verification hooks for the headless byte-identity check (harmless in prod).
window.__vellumRunJob = runJob;
window.__vellumRunInline = runInline;

seedInput.value = String(randomSeed());
readHash();
draw();
