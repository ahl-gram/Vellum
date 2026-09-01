// The Print Room's bound atlas (#136, epic #132 Sub 4; a chart room since #463): composes the full atlas of the proof on the desk off-thread, lays it out as the hidden document Print and Download deliver, turns its plates onto the sheet and lists them on the slip (the #494 ruling).
import { runJob } from "../explorer/worker-client.ts";
import { plateFigure } from "./plate-markup.ts";
import { contentsRows, plateCounts, plateLine, type PlateRef } from "./contents-markup.ts";
import { plateAspect } from "./plate-aspect.ts";
import { isMatterKey, matterLine, matterPage } from "./matter-markup.ts";
import type { Matter, Plate } from "./seats.ts";
import { escapeXml } from "../../render/svg.ts";
import { ATLAS_SHEET_CSS, atlasDocument, svgToDataUri } from "../../atlas/document.ts";
import type { AtlasDocumentData, PlateSection } from "../../atlas/document.ts";
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

export interface SheetFace {
  readonly showProof: () => void;
  readonly showPlate: (plate: Plate) => void;
  readonly showMatter: (matter: Matter) => void;
}

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
const contents = $("pr-contents") as HTMLElement;
const stamp = $("pr-stamp") as HTMLElement;
const STAMP_UNBOUND = stamp.textContent ?? "";

interface Bound {
  readonly plate: PlateRef;
  readonly section: PlateSection;
  readonly aspect: number | null;
}

let getBasis: () => PosterBasis | null = () => null;
let face: SheetFace = { showProof: () => {}, showPlate: () => {}, showMatter: () => {} };
let atlasUrls: string[] = [];
let lastAtlas: AtlasDocumentData | null = null;
let plates = new Map<string, Bound>();
let here: string | null = null;
let bindGen = 0;
let binding = false;

export function sheetAspect(): number | null {
  return here === null ? null : plates.get(here)?.aspect ?? null;
}

function setDeliveryEnabled(on: boolean): void {
  printBtn.disabled = !on;
  downloadBtn.disabled = !on;
  hideBtn.disabled = !on;
}

function renderContents(): void {
  if (lastAtlas === null) {
    contents.innerHTML = contentsRows(null);
    return;
  }
  const refs = (ps: ReadonlyArray<AtlasPlate>): PlateRef[] => ps.flatMap((p) => { const b = plates.get(p.key); return b ? [b.plate] : []; });
  contents.innerHTML = contentsRows({
    hero: plates.get(lastAtlas.hero.key)!.plate,
    draughtings: refs(lastAtlas.draughtings),
    themes: refs(lastAtlas.themes),
    regions: refs(lastAtlas.regions),
    prospects: refs(lastAtlas.prospects),
    counts: plateCounts(lastAtlas),
    here,
  });
}

function resetBoundAtlas(): void {
  bindGen++;
  for (const url of atlasUrls) URL.revokeObjectURL(url);
  atlasUrls = [];
  lastAtlas = null;
  plates = new Map();
  here = null;
  atlasDiv.innerHTML = "";
  setDeliveryEnabled(false);
  document.body.classList.remove("has-atlas");
  status.textContent = "";
  stamp.textContent = STAMP_UNBOUND;
  bindBtn.textContent = "Bind the atlas";
  renderContents();
  face.showProof();
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

function mint(p: AtlasPlate, section: PlateSection): Bound {
  const href = URL.createObjectURL(new Blob([p.svg], { type: "image/svg+xml" }));
  atlasUrls.push(href);
  return { plate: { key: p.key, title: p.title, href }, section, aspect: plateAspect(p.svg) };
}

// innerHTML takes trusted input only: every recipe param is validated against a fixed allowlist by `applyHash` in `src/site/print-room/app.ts` before any worker job runs, and the rest is escaped or engine-composed.
function renderBoundAtlas(atlas: AtlasDocumentData): void {
  const hero = mint(atlas.hero, "hero");
  const draughtings = atlas.draughtings.map((p) => mint(p, "draughting"));
  const themes = atlas.themes.map((p) => mint(p, "theme"));
  const regions = atlas.regions.map((p) => mint(p, "region"));
  const prospects = atlas.prospects.map((p) => mint(p, "prospect"));
  plates = new Map([hero, ...draughtings, ...themes, ...regions, ...prospects].map((b) => [b.plate.key, b]));
  const fig = (b: Bound, cls = ""): string => plateFigure(b.plate.href, b.plate.title, cls);
  const figs = (bs: Bound[]): string => bs.map((b) => fig(b)).join("\n");
  atlasDiv.innerHTML = `<header class="atlas-head print-only">
  <h1>${escapeXml(atlas.title)}</h1>
  <p class="subtitle">${escapeXml(atlas.subtitle)}</p>
  <p class="chartno">VELLUM · CHART № ${atlas.seed}</p>
</header>
${fig(hero, "hero-plate print-only")}
<section><h2>Other Draughtings</h2><div class="styles">${figs(draughtings)}</div></section>
<section><h2>Thematic Surveys</h2><div class="themes">${figs(themes)}</div></section>
${regions.length > 0 ? `<section><h2>Regional Surveys</h2>${figs(regions)}</section>` : ""}
${prospects.length > 0 ? `<section><h2>The Prospect of the Capital</h2>${figs(prospects)}</section>` : ""}
${atlas.bannersHtml}
${atlas.chronicleHtml}
${atlas.gazetteerHtml}`;
}

function turnTo(key: string): void {
  if (isMatterKey(key)) {
    if (lastAtlas === null) return;
    const html = matterPage(key, lastAtlas);
    if (html === "") return;
    here = key;
    renderContents();
    face.showMatter({ html, line: matterLine(key) });
    return;
  }
  const b = plates.get(key);
  if (!b) return;
  here = key;
  renderContents();
  face.showPlate({ href: b.plate.href, title: b.plate.title, line: plateLine(b.section, b.plate.title) });
}

function bindAtlas(): void {
  const basis = getBasis();
  if (!basis || binding) return;
  const myGen = ++bindGen;
  binding = true;
  bindBtn.disabled = true;
  setDeliveryEnabled(false);
  status.textContent = "Binding the atlas…";
  const started = performance.now();
  runJob({
    kind: "atlas",
    seed: basis.seed,
    overrides: basis.overrides,
    width: 1500,
    bannerStyle: basis.style,
  })
    .then((res) => {
      if (myGen !== bindGen) return;
      const stale = atlasUrls;
      atlasUrls = [];
      lastAtlas = res.atlas;
      renderBoundAtlas(res.atlas);
      for (const url of stale) URL.revokeObjectURL(url);
      setDeliveryEnabled(true);
      document.body.classList.add("has-atlas");
      const seconds = Math.max(1, Math.round((performance.now() - started) / 1000));
      stamp.textContent = `bound in ${seconds}s`;
      bindBtn.textContent = "Bind it again";
      status.innerHTML = `The atlas of <strong>${escapeXml(res.atlas.title)}</strong> is bound: ${plates.size} plates, the chronicle and the gazetteer, from the proof on the desk.`;
      turnTo(res.atlas.hero.key);
      window.__vellumBoundAtlas = { seed: res.atlas.seed, title: res.atlas.title, figures: atlasDiv.querySelectorAll("figure").length };
    })
    .catch((err) => {
      if (myGen !== bindGen) return;
      status.textContent = "The bindery faltered: " + err.message;
      if (lastAtlas !== null) setDeliveryEnabled(true);
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
  status.textContent = `The bound atlas is yours: ${filename} (${Math.max(1, Math.round(blob.size / 1048576))} MB). It opens offline in any browser.`;
  window.__vellumLastAtlasDownload = {
    filename,
    size: blob.size,
    dataUris: (html.match(/data:image\/svg\+xml;base64,/g) ?? []).length,
    hasBlobUrl: html.includes("blob:"),
    hasExternalCss: html.includes('href="/motion.css"'),
    title: lastAtlas.title,
  };
}

export function initBoundAtlas(getBasisFn: () => PosterBasis | null, sheetFace: SheetFace): void {
  getBasis = getBasisFn;
  face = sheetFace;
  bindBtn.addEventListener("click", bindAtlas);
  printBtn.addEventListener("click", printAtlas);
  downloadBtn.addEventListener("click", downloadAtlas);
  hideBtn.addEventListener("click", hideAtlas);
  contents.addEventListener("click", (e) => {
    const hit = (e.target as Element).closest<HTMLElement>("[data-plate]");
    const key = hit?.dataset.plate;
    if (!hit || !key) return;
    const kind = hit.classList.contains("thumb") ? ".thumb" : ".turn";
    turnTo(key);
    // The re-render dropped the activated button; its successor takes the focus back (preventScroll: the page never moves).
    contents.querySelector<HTMLElement>(`${kind}[data-plate="${CSS.escape(key)}"]`)?.focus({ preventScroll: true });
  });
  window.__vellumPrintAtlas = printAtlas;
}
