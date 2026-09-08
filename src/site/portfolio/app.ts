// The Portfolio (#521 Sub 3 of #401): the Print Room's second page. The table rides in this page's
// address and nowhere else, so the page reads it ONCE at load and never rewrites it. One region job
// per gathered survey, dispatched grouped by world because worldFor is a single-entry cache, and the
// sheets arrive progressively into a pile whose top sheet stands on the stage.
import { initWorker, runJob } from "../explorer/worker-client.ts";
import { bindRoom } from "../shared/room.ts";
import { thumbJobFor } from "../explorer/chart-drawer.ts";
import { parseTable, groupByWorld, TABLE_KEY, type TableItem } from "../shared/table-address.ts";
import { BARE_LINE, boundLine, draftedLine, isAwaited, roman, sheetLine } from "./folio-lines.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const status = $("pf-status");
const bound = $("pf-bound");
const contents = $("pf-contents");
const sheetBox = $("pf-sheet");
const pile = $("pf-pile");
const download = $<HTMLAnchorElement>("pf-download");
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
  folioTitle.textContent = sheets.length > 0 ? sheetLine(sheet.title, top + 1, sheets.length) : "";
  folioSub.textContent = sheet.item.kind === "survey"
    ? `a regional survey at band ${sheet.item.rung}, ${sheet.item.style} · from ${sheet.worldTitle || `chart № ${sheet.item.seed}`}, chart № ${sheet.item.seed}`
    : `a prospect · from chart № ${sheet.item.seed}`;
  const beneath = sheets.length - 1 - top;
  folioCoords.textContent = beneath > 0 ? `${beneath} beneath it` : "the last of them";
  download.href = sheet.url ?? "#";
  if (sheet.url) download.setAttribute("download", `${sheet.title.replace(/[^\w -]/g, "")}.svg`);
  for (const row of contents.querySelectorAll(".row")) row.classList.toggle("up", Number((row as HTMLElement).dataset["at"]) === top);
};

/** A title brings its sheet to the top (#518 ruling 5). */
const bringUp = (at: number): void => {
  if (at < 0 || at >= sheets.length) return;
  top = at;
  showTop();
  const sheet = sheets[top];
  if (sheet) say(`${sheet.title} is on top`);
};

const rows = (): void => {
  const groups = groupByWorld(items);
  contents.replaceChildren();
  for (const group of groups) {
    const head = document.createElement("p");
    head.className = "group-head";
    const name = document.createElement("span");
    const first = sheets[group.entries[0]?.at ?? 0];
    name.textContent = `From ${first?.worldTitle || "this world"} · chart № ${group.seed}`;
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
      if (!sheet) continue;
      const li = document.createElement("li");
      li.className = "row";
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
      const own = document.createElement("a");
      own.className = "row-download";
      own.textContent = "the engraving (SVG)";
      own.href = sheet.url ?? "#";
      if (sheet.url) own.setAttribute("download", `${sheet.title.replace(/[^\w -]/g, "")}.svg`);
      else own.setAttribute("aria-disabled", "true");
      li.append(numeral, thumb, title, band, own);
      list.append(li);
    }
    contents.append(list);
  }
};

const retitle = (): void => {
  const groups = groupByWorld(items);
  bound.textContent = items.length === 0
    ? BARE_LINE
    : `${boundLine(groups.map((g) => ({ name: sheets[g.entries[0]?.at ?? 0]?.worldTitle || `chart № ${g.seed}`, count: g.entries.length })))} ${draftedLine(drawnCount(), drawable().length)}`;
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
        sheet.url = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }));
      } catch {
        sheet.title = `Chart № ${sheet.item.seed}`;
      }
      rows();
      retitle();
      if (at === top || drawnCount() === 1) { top = at === top ? top : top; showTop(); }
      say(draftedLine(drawnCount(), drawable().length));
    }
  }
  say("");
};

// #462's chart room: the sheet is fitted to what the chrome leaves, or it fills the viewport and runs under the nav, the room's name and the slip. A page that draws a chart and never binds the room has no fit at all.
const room = bindRoom({
  frame: document.querySelector(".stage") as HTMLElement,
  sheet: document.getElementById("sheet") as HTMLElement,
  camera: { hold: () => null, restore: () => {} },
  aspect: () => { const svg = sheetBox.querySelector("svg"); const vb = svg?.viewBox.baseVal; return vb && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : null; },
});

const start = async (): Promise<void> => {
  layPile();
  rows();
  retitle();
  showTop();
  if (items.length === 0) {
    next.hidden = true;
    download.hidden = true;
    say("");
    return;
  }
  next.addEventListener("click", () => bringUp((top + 1) % sheets.length));
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
