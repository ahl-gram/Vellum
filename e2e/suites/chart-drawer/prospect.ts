import { roman } from "../../../src/site/explorer/portfolio/folio-lines.ts";
import type { Payload, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { CARD, DRAWN, DRESS, PP, type Card, type Pp } from "./reads.ts";
import { bounce } from "../../support/nav.ts";

// The card unfurls as it pins, so a press is clicked only once its box has held still across two reads and its centre hits it (run 37504526032 lost a press clicked at a box read once: the flake record's row).
export const pressAtRest = (d: Card, last: Card | null): boolean =>
  !!d.press &&
  d.press.hit === "self" &&
  !!last?.press &&
  last.press.box.x === d.press.box.x &&
  last.press.box.y === d.press.box.y &&
  last.press.box.w === d.press.box.w &&
  last.press.box.h === d.press.box.h;

export async function cd25CardPress({ check, settle, go, pinCard }: DrawerKit): Promise<void> {
  await go(DRESS);
  const at = await settle(CARD, (d) => d.hits > 1, "chart-drawer-card");
  await pinCard(1);
  const armed = await settle(CARD, (d, last) => d.shown && pressAtRest(d, last), "chart-drawer-card-press");
  check(
    "CD25 the place card's three actions stand in ONE row and EACH answers a real pointer: #place-card is pointer-events: none, so a press that forgets to restore it passes element.click() and is dead to every reader, which is the #520 dog-ear scar exactly (#518 ruling 7; Issue #428)",
    at.hits > 1 &&
      armed.shown &&
      !!armed.press &&
      armed.press.hit === "self" &&
      !!armed.link &&
      armed.link.hit === "self" &&
      armed.link.inActs &&
      !!armed.road &&
      armed.road.hit === "self" &&
      armed.road.inActs &&
      armed.pressInActs &&
      armed.actsRow === 3 &&
      armed.press.text === "Lay the prospect on the table" &&
      !armed.press.dim &&
      !armed.press.disabled &&
      armed.press.idx === "1",
    JSON.stringify({ hits: at.hits, press: armed.press, link: armed.link, road: armed.road, actsRow: armed.actsRow }),
  );
}

async function cd29SecondYear(
  { evaluate, check, sleep, settle, clickAt }: Pick<DrawerKit, "evaluate" | "check" | "sleep" | "settle" | "clickAt">,
  one: Pp,
) {
  // The same town at a second year: the year IS part of the sheet's identity, which is the case that won "press and stay".
  // The form is submitted synthetically because the claim here is about the FILING, not about the year control, whose submit PB7c reads.
  await evaluate(
    `(() => { const y = document.getElementById("pp-year"); y.value = String(Math.max(1, Number(y.value) - 300)); document.getElementById("pp-year-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); })()`,
  );
  for (let i = 0; i < 300; i++) {
    await sleep(100);
    const s = await evaluate<number | null>(
      `(() => { const st = window.__vellumProspectState(); return st ? st.year : null; })()`,
    );
    if (s !== null && s !== one.state!.year) break;
  }
  let two = await evaluate(PP);
  if (two.press && two.press.centre) await clickAt(two.press.centre.x, two.press.centre.y);
  two = await settle(
    PP,
    (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 2,
    "prospect-filed-two",
  );
  check(
    "CD29 the page files and STAYS, writing the gathering into its OWN address so a reload keeps it, and the same town at a second year is a SECOND sheet rather than one deduped away (ruled 2026-09-17; the year rides in the item, which is what lets a reader gather a run of one place across the centuries)",
    typeof one.hashTable === "string" &&
      one.hashTable.split("_").length === 1 &&
      /one sheet laid/.test(one.count || "") &&
      typeof two.hashTable === "string" &&
      two.hashTable.split("_").length === 2 &&
      /two sheets laid/.test(two.count || "") &&
      new Set(two.hashTable.split("_")).size === 2 &&
      typeof two.chartHref === "string" &&
      two.chartHref.indexOf("table=") !== -1,
    JSON.stringify({
      oneTable: one.hashTable,
      oneCount: one.count,
      twoTable: two.hashTable,
      twoCount: two.count,
      chartHref: two.chartHref,
    }),
  );
  return two;
}

// The page's own capture point (seat C, ruled 2026-09-17): it files and STAYS, and the year is part of a sheet's identity.
export async function cd28PagePress({ evaluate, send, check, sleep, PORT, settle, clickAt, forget }: DrawerKit) {
  await forget();
  await bounce(send, `http://127.0.0.1:${PORT}/prospect/#seed=42&i=3`);
  for (let i = 0; i < 300; i++) {
    await sleep(100);
    if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break;
  }
  // The slip's fold is a transition, and CD28 derives a real pointer target from this press's rect: a fixed sleep either
  // measures a box still moving or waits longer than it needs. Poll it to REST instead, and throw naming the last read.
  const pp = await settle(
    PP,
    (d, last) =>
      !!d.press &&
      d.press.shown &&
      !!last &&
      !!last.press &&
      d.press.centre &&
      last.press.centre &&
      d.press.centre.x === last.press.centre.x &&
      d.press.centre.y === last.press.centre.y,
    "prospect-note-open",
  );
  check(
    "CD28 the Prospect page's press sits on the engraver's note where the room's desk actions belong, answers a real pointer, and does NOT join the roads out, which go somewhere (ruled 2026-09-17, seat C)",
    !!pp.press &&
      pp.press.shown &&
      pp.press.hit === "self" &&
      pp.inNote &&
      pp.press.text === "Lay this prospect on the table" &&
      !pp.press.dim &&
      !pp.press.disabled &&
      /table is bare/.test(pp.count || ""),
    JSON.stringify({ press: pp.press, count: pp.count, inNote: pp.inNote, roads: pp.roads }),
  );
  if (pp.press && pp.press.centre) await clickAt(pp.press.centre.x, pp.press.centre.y);
  const one = await settle(
    PP,
    (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 1,
    "prospect-filed-one",
  );
  const two = await cd29SecondYear({ evaluate, check, sleep, settle, clickAt }, one);
  return two;
}

export async function cd31RoundTrip(
  { evaluate, send, check, sleep, PORT, settle }: DrawerKit,
  two: Awaited<ReturnType<typeof cd28PagePress>>,
): Promise<void> {
  // Home through chartTarget, the way the page offers: the Explorer restores the table with both sheets on it.
  await bounce(send, `http://127.0.0.1:${PORT}/explorer/${two.chartHref!.slice(two.chartHref!.indexOf("#"))}`);
  for (let i = 0; i < 200; i++) {
    await sleep(150);
    if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`))
      break;
  }
  const home = await settle(CARD, (d) => d.cuttings === 2, "chart-drawer-round-trip");
  check(
    "CD31 the round trip closes: what the Prospect page filed comes home through chartTarget and the Explorer restores BOTH sheets, which is the epic's core insight working across a real cross-path navigation",
    home.cuttings === 2 &&
      home.prospects === 2 &&
      home.subs.every((s) => /^a prospect, /.test(s || "")) &&
      new Set(home.subs).size === 2,
    JSON.stringify({ cuttings: home.cuttings, prospects: home.prospects, subs: home.subs, titles: home.titles }),
  );
}

const PFM: Payload<{
  items: number;
  drawn: number;
  rows: number;
  thumbs: number;
  awaited: number;
  bands: string[];
  titles: string[];
  downloads: number;
  bound: string | null;
} | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
      rows: document.querySelectorAll("#pf-contents .row").length,
      thumbs: document.querySelectorAll("#pf-contents .thumb img").length,
      awaited: document.querySelectorAll("#pf-contents .thumb.awaited").length,
      bands: [...document.querySelectorAll("#pf-contents .row-band")].map((e) => e.textContent),
      titles: [...document.querySelectorAll("#pf-contents .row-title")].map((e) => e.textContent),
      downloads: [...document.querySelectorAll("#pf-contents .row-download")].filter((b) => !b.disabled).length,
      bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;

// A MIXED folio, kept to three sheets because each one is a real worker job that its lane pays for in seconds.
export async function cd32MixedFolio({ evaluate, send, check, sleep, PORT }: SuiteContext): Promise<void> {
  const MIXED = [
    "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-5.ly-5",
    "k-p.seed-42.style-ink.i-3.year-1059",
    "k-p.seed-42.style-antique.i-1.year-1059",
  ].join("_");
  await bounce(send, `http://127.0.0.1:${PORT}/explorer/portfolio/#table=${MIXED}`);
  for (let i = 0; i < 200; i++) {
    await sleep(100);
    if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break;
  }
  let pfm = await evaluate(PFM);
  for (let i = 0; i < DRAWN && (!pfm || pfm.drawn < 3); i++) {
    await sleep(50);
    pfm = await evaluate(PFM);
  }
  check(
    "CD32 a MIXED folio drafts every sheet in its OWN dress: the prospects draw beside the survey instead of holding a reserved place, each row names its dress and offers its own engraving, and no row is left reading 'a prospect' (#401 ruling 8, and #521 ruling 3 held the place only until this sub)",
    !!pfm &&
      pfm.items === 3 &&
      pfm.drawn === 3 &&
      pfm.rows === 3 &&
      pfm.thumbs === 3 &&
      pfm.awaited === 0 &&
      pfm.downloads === 3 &&
      pfm.bands.filter((b) => /^a prospect, pen & ink, \d+$/.test(b || "")).length === 1 &&
      pfm.bands.filter((b) => /^a prospect, antique, \d+$/.test(b || "")).length === 1 &&
      pfm.bands.filter((b) => /^band \d+, antique$/.test(b || "")).length === 1 &&
      !pfm.bands.some((b) => /awaiting its page/.test(b || "")) &&
      pfm.titles.filter((t) => /^The Prospect of \S/.test(t || "")).length === 2 &&
      /three sheets drafted/i.test(pfm.bound || ""),
    JSON.stringify(pfm),
  );
}

type Row = { at: number; title: string; x: number; y: number; hit: boolean } | null;
const PROSPECT_ROW: Payload<Row> = `(() => { const li = [...document.querySelectorAll("#pf-contents .row")].find((r) => /^a prospect/.test((r.querySelector(".row-band") || {}).textContent || "")); if (!li) return null;
  const t = li.querySelector(".row-title"); t.scrollIntoView({ block: "center" }); const b = t.getBoundingClientRect(), x = b.x + b.width / 2, y = b.y + b.height / 2;
  return { at: Number(li.dataset.at), title: t.textContent, x, y, hit: document.elementFromPoint(x, y) === t }; })()`;
const ON_TOP: Payload<{ top: number; folio: string; svg: boolean }> =
  `(() => ({ top: window.__vellumPortfolio().top, folio: document.getElementById("folio-title").textContent, svg: !!document.querySelector("#pf-sheet svg") }))()`;

export async function cd60ProspectBroughtUp({ evaluate, check, settle, clickAt }: DrawerKit): Promise<void> {
  const row = await evaluate(PROSPECT_ROW);
  if (row?.hit) await clickAt(row.x, row.y);
  const up = await settle(ON_TOP, (d) => !!row && d.top === row.at, "portfolio-prospect-up");
  check(
    "CD60 a prospect in a mixed folio comes to the top at a real press on its row like any sheet: nothing in the page holds a sheet back by its kind (#522)",
    !!row && row.hit && up.folio === `${row.title} · Sheet ${roman(row.at + 1)} of ${roman(3)}` && up.svg,
    JSON.stringify({ row, up }),
  );
}
