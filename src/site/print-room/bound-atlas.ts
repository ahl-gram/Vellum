// The Print Room's bound atlas (#136, epic #132 Sub 4): composes the full atlas of the proof on the desk off-thread, lays it out as a print-first sheet, and delivers it by browser Save-as-PDF or self-contained single-file download.
import { runJob } from "../explorer/worker-client.ts";
import { plateFigure } from "./plate-markup.ts";
import { escapeXml } from "../../render/svg.ts";
import { ATLAS_SHEET_CSS, atlasDocument, svgToDataUri } from "../../atlas/document.ts";
import type { AtlasDocumentData } from "../../atlas/document.ts";
import type { AtlasPlate } from "../../atlas/compose.ts";
import type { StyleName } from "../../render/style.ts";
import type { ThemeName } from "../../render/layers/field.ts";
import type { WorldRecipe } from "../../world/types.ts";

export type PosterBasis = {
  seed: number;
  style: StyleName;
  overrides: Partial<WorldRecipe>;
  legend: boolean;
  arms: boolean;
  beasts: boolean;
  theme: ThemeName | undefined;
};

declare global {
  interface Window {
    __vellumBoundAtlas?: { seed: number; title: string; figures: number };
    __vellumLastAtlasDownload?: {
      filename: string;
      size: number;
      dataUris: number;
      hasBlobUrl: boolean;
      hasExternalCss: boolean;
      title: string;
    };
    __vellumPrintAtlas?: () => void;
  }
}

if (!document.getElementById("atlas-sheet-css")) {
  const style = document.createElement("style");
  style.id = "atlas-sheet-css";
  style.textContent = ATLAS_SHEET_CSS;
  document.head.appendChild(style);
}

const $ = (id: string) => document.getElementById(id);
const bindBtn = $("pr-bind") as HTMLButtonElement;
const printBtn = $("pr-print") as HTMLButtonElement;
const downloadBtn = $("pr-download") as HTMLButtonElement;
const hideBtn = $("pr-hide") as HTMLButtonElement;
const atlasDiv = $("pr-atlas") as HTMLElement;
const status = $("pr-bound-status") as HTMLElement;

let getBasis: () => PosterBasis | null = () => null;
let atlasUrls: string[] = [];
let lastAtlas: AtlasDocumentData | null = null;
let bindGen = 0;
let binding = false;

function setDeliveryEnabled(on: boolean): void {
  printBtn.disabled = !on;
  downloadBtn.disabled = !on;
  hideBtn.disabled = !on;
}

function resetBoundAtlas(): void {
  bindGen++;
  for (const url of atlasUrls) URL.revokeObjectURL(url);
  atlasUrls = [];
  lastAtlas = null;
  atlasDiv.innerHTML = "";
  setDeliveryEnabled(false);
  document.body.classList.remove("has-atlas");
  status.textContent = "";
}

export function clearBoundAtlas(): void {
  resetBoundAtlas();
  bindBtn.disabled = true;
}

function hideAtlas(): void {
  resetBoundAtlas();
  bindBtn.disabled = false;
}

export function enableBind(): void {
  bindBtn.disabled = false;
}

function plateUrl(svg: string): string {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  atlasUrls.push(url);
  return url;
}

// innerHTML takes trusted input only: every recipe param is validated against a fixed allowlist by `applyHash` in `src/site/print-room/app.ts` before any worker job runs, and the rest is escaped or engine-composed.
function renderBoundAtlas(atlas: AtlasDocumentData): void {
  const plate = (p: AtlasPlate, cls = ""): string => plateFigure(plateUrl(p.svg), p.title, cls);
  const hero = plate(atlas.hero, "hero-plate print-only");
  const draughtings = atlas.draughtings.map((p) => plate(p)).join("\n");
  const themes = atlas.themes.map((p) => plate(p)).join("\n");
  const regions = atlas.regions.map((p) => plate(p)).join("\n");
  const prospects = atlas.prospects.map((p) => plate(p)).join("\n");
  atlasDiv.innerHTML = `<header class="atlas-head print-only">
  <h1>${escapeXml(atlas.title)}</h1>
  <p class="subtitle">${escapeXml(atlas.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${atlas.seed}</p>
</header>
${hero}
<section><h2>Other Draughtings</h2><div class="styles">${draughtings}</div></section>
<section><h2>Thematic Surveys</h2><div class="themes">${themes}</div></section>
${regions ? `<section><h2>Regional Surveys</h2>${regions}</section>` : ""}
${prospects ? `<section><h2>The Prospect of the Capital</h2>${prospects}</section>` : ""}
${atlas.bannersHtml}
${atlas.chronicleHtml}
${atlas.gazetteerHtml}`;
}

function bindAtlas(): void {
  const basis = getBasis();
  if (!basis || binding) return;
  const myGen = ++bindGen;
  binding = true;
  bindBtn.disabled = true;
  setDeliveryEnabled(false);
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
      if (myGen !== bindGen) return;
      lastAtlas = res.atlas;
      renderBoundAtlas(res.atlas);
      setDeliveryEnabled(true);
      document.body.classList.add("has-atlas");
      // A scripted scroll is outside motion.css's reduced-motion collapse, so this reads the query itself.
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      atlasDiv.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      status.textContent = `The atlas of ${res.atlas.title} is bound: print it, take the single file, or hide it.`;
      window.__vellumBoundAtlas = { seed: res.atlas.seed, title: res.atlas.title, figures: atlasDiv.querySelectorAll("figure").length };
    })
    .catch((err) => {
      if (myGen !== bindGen) return;
      status.textContent = "The bindery faltered: " + err.message;
    })
    .finally(() => {
      binding = false;
      if (myGen === bindGen) bindBtn.disabled = false;
    });
}

function printAtlas(): void {
  if (!lastAtlas) return;
  window.print();
}

function downloadAtlas(): void {
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
  window.__vellumLastAtlasDownload = {
    filename,
    size: blob.size,
    dataUris: (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length,
    hasBlobUrl: html.includes("blob:"),
    hasExternalCss: html.includes('href="/motion.css"'),
    title: lastAtlas.title,
  };
}

export function initBoundAtlas(getBasisFn: () => PosterBasis | null): void {
  getBasis = getBasisFn;
  bindBtn.addEventListener("click", bindAtlas);
  printBtn.addEventListener("click", printAtlas);
  downloadBtn.addEventListener("click", downloadAtlas);
  hideBtn.addEventListener("click", hideAtlas);
  window.__vellumPrintAtlas = printAtlas;
}
