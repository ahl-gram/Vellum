// The Portfolio (#521 Sub 3 of #401): the Print Room's second page. The table rides in this page's
// address and nowhere else, so the page reads it ONCE at load and never rewrites it. One region job
// per gathered survey, dispatched grouped by world because worldFor is a single-entry cache, and the
// sheets arrive progressively into a pile whose top sheet stands on the stage.
import { initWorker, runJob } from "../explorer/worker-client.ts";
import { bindRoom } from "../shared/room.ts";
import { bindGlassKeys } from "../shared/glass-keys.ts";
import { createZoomController } from "../shared/zoom-controller.ts";
import { chartFilename } from "../print-room/poster-presets.ts";
import { thumbJobFor } from "../explorer/chart-drawer.ts";
import { parseTable, groupByWorld, TABLE_KEY, type TableItem } from "../shared/table-address.ts";
import { BARE_LINE, boundLine, draftedLine, isAwaited, roman, sheetLine } from "./folio-lines.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("pf-status");
const bound = $("pf-bound");
const contents = $("pf-contents");
const sheetBox = $("pf-sheet");
const pile = $("pf-pile");
const download = $<HTMLButtonElement>("pf-download");
const next = $<HTMLButtonElement>("pf-next");
const folioTitle = $("folio-title");
const folioSub = $("folio-sub");
const folioCoords = $("folio-coords");

interface Drawn {
  readonly item: TableItem;
  readonly at: number;
  title: string;
  worldTitle: string;
  svg: string | null;
  url: string | null;
}

const items = parseTable(location.hash) ?? [];
const sheets: Drawn[] = items.map((item, at) => ({ item, at, title: `Chart № ${item.seed}`, worldTitle: "", svg: null, url: null }));
let top = 0;

const drawnCount = (): number => sheets.filter((s) => s.svg !== null).length;
const drawable = (): ReadonlyArray<Drawn> => sheets.filter((s) => !isAwaited(s.item));

const say = (line: string): void => { status.textContent = line; };

/** The pile's depth, as papers behind the top sheet; the mockup shows the stack and not a count. */
const layPile = (): void => {
  const beneath = Math.max(0, sheets.length - 1);
  pile.replaceChildren(...Array.from({ length: Math.min(beneath, 5) }, (_, i) => {
    const p = document.createElement("div");
    p.className = "leaf";
    p.style.setProperty("--depth", String(i + 1));
    return p;
  }));
};

const showTop = (): void => {
  const sheet = sheets[top];
  if (!sheet) return;
  sheetBox.innerHTML = sheet.svg ?? "";
  room.layout();
  folioTitle.textContent = sheetLine(sheet.title, top + 1, sheets.length);
  folioSub.textContent = sheet.item.kind === "survey"
    ? `a regional survey at band ${sheet.item.rung}, ${sheet.item.style} · from ${sheet.worldTitle || `chart № ${sheet.item.seed}`}, chart № ${sheet.item.seed}`
    : `a prospect · from chart № ${sheet.item.seed}`;
  const beneath = sheets.length - 1 - top;
  folioCoords.textContent = beneath > 0 ? `${beneath} beneath it` : "the last of them";
  download.disabled = sheet.svg === null;
  for (const row of contents.querySelectorAll(".row")) row.classList.toggle("up", Number((row as HTMLElement).dataset["at"]) === top);
};

const bringUp = (at: number): void => {
  if (at < 0 || at >= sheets.length) return;
  // A prospect keeps its seat in the index and never drafts (ruling 3), so it can never BE the top sheet: putting one
  // there would blank the stage with nothing to say for it.
  if (isAwaited(sheets[at]!.item)) return;
  top = at;
  showTop();
  const sheet = sheets[top];
  if (sheet) say(`${sheet.title} is on top`);
};

// #217's contract, the same function the Print Room's plates are named by: vellum-<seed>-<style>-<slug>.svg, so a sheet
// on disk can be traced back to the world that drew it.
const nameOf = (sheet: Drawn): string =>
  chartFilename(sheet.item.seed, sheet.item.kind === "survey" ? sheet.item.style : "prospect", sheet.title);

// #134's rule: the svg goes STRAIGHT to a blob download and is never injected anywhere to be downloaded.
const takeHome = (sheet: Drawn): void => {
  if (!sheet.svg) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([sheet.svg], { type: "image/svg+xml" }));
  a.download = nameOf(sheet);
  a.click();
  URL.revokeObjectURL(a.href);
};

const rowFor = (sheet: Drawn, at: number): HTMLLIElement => {
  const li = document.createElement("li");
  li.className = at === top ? "row up" : "row";
  li.dataset["at"] = String(at);
  const numeral = document.createElement("span");
  numeral.className = "numeral";
  numeral.textContent = roman(at + 1);
  const thumb = document.createElement("span");
  thumb.className = "thumb";
  if (sheet.url) {
    const img = document.createElement("img");
    img.src = sheet.url;
    img.alt = "";
    thumb.append(img);
  } else {
    thumb.classList.add("awaited");
    thumb.textContent = isAwaited(sheet.item) ? "a prospect" : "drafting…";
  }
  const title = document.createElement("button");
  title.type = "button";
  title.className = "row-title";
  title.textContent = sheet.title;
  title.addEventListener("click", () => bringUp(at));
  const band = document.createElement("i");
  band.className = "row-band";
  band.textContent = sheet.item.kind === "survey" ? `band ${sheet.item.rung}, ${sheet.item.style}` : "a prospect, awaiting its page";
  const own = document.createElement("button");
  own.type = "button";
  own.className = "row-download";
  own.textContent = "the engraving (SVG)";
  own.disabled = sheet.svg === null;
  own.addEventListener("click", () => takeHome(sheet));
  li.append(numeral, thumb, title, band, own);
  return li;
};

const rows = (): void => {
  const groups = groupByWorld(items);
  contents.replaceChildren();
  for (const group of groups) {
    const head = document.createElement("p");
    head.className = "group-head";
    const name = document.createElement("span");
    // The first entry may be a prospect, which never drafts and so never learns the world's name; the first DRAFTED one does.
    const named = group.entries.map((e) => sheets[e.at]).find((sheet) => !!sheet?.worldTitle);
    name.textContent = `From ${named?.worldTitle || "this world"} · chart № ${group.seed}`;
    head.append(name);
    const gloss = document.createElement("span");
    gloss.className = "gloss";
    gloss.textContent = "a title brings it to the top";
    head.append(gloss);
    contents.append(head);
    const list = document.createElement("ol");
    list.className = "contents";
    for (const { at } of group.entries) {
      const sheet = sheets[at];
      if (sheet) list.append(rowFor(sheet, at));
    }
    contents.append(list);
  }
};

const retitle = (): void => {
  const groups = groupByWorld(items);
  bound.replaceChildren();
  bound.textContent = items.length === 0
    ? BARE_LINE
    : boundLine(groups.map((g) => ({
        name: g.entries.map((e) => sheets[e.at]).find((sheet) => !!sheet?.worldTitle)?.worldTitle || `chart № ${g.seed}`,
        count: g.entries.length,
      })));
  const stamp = draftedLine(drawnCount(), drawable().length);
  if (items.length > 0 && stamp) {
    const el = document.createElement("span");
    el.className = "stamp";
    el.textContent = stamp;
    bound.append(el);
  }
};

/** One job per survey, grouped by world: worldFor is a single-entry cache, so interleaving seeds regenerates the parent every time. */
const draft = async (): Promise<void> => {
  for (const group of groupByWorld(items)) {
    for (const { at } of group.entries) {
      const sheet = sheets[at];
      if (!sheet) continue;
      const job = thumbJobFor(sheet.item);
      // A prospect keeps its seat with the plate's place reserved until Sub 4 (#522) builds its page.
      if (!job) continue;
      try {
        const res = await runJob(job);
        sheet.svg = res.svg;
        sheet.title = res.title;
        sheet.worldTitle = res.worldTitle;
        if (sheet.url) URL.revokeObjectURL(sheet.url);
      sheet.url = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
      } catch {
        sheet.title = `Chart № ${sheet.item.seed}`;
      }
      rows();
      retitle();
      if (at === top || drawnCount() === 1) { if (sheets[top]?.svg === null) top = at; showTop(); }
      say(draftedLine(drawnCount(), drawable().length));
    }
  }
  say("");
};

// The kit renders the Glass on every chart room and the stage's label promises its keys, so the page owes the binding: three corner presses and six keys that do nothing are the #520 scar, a control nobody can use.
const zoomController = createZoomController({
  viewportEl: $("map-viewport"),
  targetEl: $("map"),
  scaleExtent: [1, 8],
  glideMs: () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide")),
});
zoomController.attach();
bindGlassKeys($("map-viewport"), zoomController);

// #462's chart room: the sheet is fitted to what the chrome leaves, or it fills the viewport and runs under the nav, the room's name and the slip. A page that draws a chart and never binds the room has no fit at all.
const room = bindRoom({
  frame: document.querySelector(".stage") as HTMLElement,
  sheet: document.getElementById("sheet") as HTMLElement,
  camera: { hold: () => zoomController.getState(), restore: (t) => zoomController.refit(t) },
  aspect: () => { const svg = sheetBox.querySelector("svg"); const vb = svg?.viewBox.baseVal; return vb && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : null; },
});

const start = async (): Promise<void> => {
  layPile();
  rows();
  retitle();
  showTop();
  if (items.length === 0) {
    // hidden is inert on these: atelier.css sets an author display on .legend-btn, which beats the UA [hidden] rule, so
    // el.hidden = true silently no-ops (the #270 guard-prover's find). The Prospect and the Ribbon hide the same way.
    next.style.display = "none";
    download.style.display = "none";
    say("");
    return;
  }
  // The next DRAWABLE sheet, so the cycle never lands on a reserved prospect and stalls there.
  next.addEventListener("click", () => {
    for (let i = 1; i <= sheets.length; i++) {
      const at = (top + i) % sheets.length;
      if (!isAwaited(sheets[at]!.item)) { bringUp(at); return; }
    }
  });
  download.addEventListener("click", () => { const sheet = sheets[top]; if (sheet) takeHome(sheet); });
  await initWorker();
  await draft();
};

void start();

declare global {
  interface Window { __vellumPortfolio?: () => { items: number; drawn: number; top: number; key: string | null } }
}
window.__vellumPortfolio = () => ({
  items: sheets.length,
  drawn: drawnCount(),
  top,
  key: new URLSearchParams(location.hash.slice(1)).get(TABLE_KEY),
});
