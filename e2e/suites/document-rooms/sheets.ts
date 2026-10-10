// The document rooms' sheets as the browser draws them (Issue #779 part 2f, the source-text tests moved here): the survey sheet's frame, the columns and the fold, the intro voice, the Glossary's Issue #353 shape, the culture facts the pages state, and the index anchors. One read per page, taken at 1280x800 on a page this suite already visits.
import { CULTURES } from "../../../src/society/names.ts";
import { makeSettle } from "../../support/settle.ts";
import { luminance, nearRgba, PAGE_RGBA, sampleRow, tokenRgba } from "../../support/pixel.ts";
import type { Payload, SuiteContext } from "../../types.ts";

type Kit = SuiteContext & { settle: ReturnType<typeof makeSettle>; goto: (path: string) => Promise<void> };
type Section = { heading: string; terms: string[]; defs: number };
type Sheet = {
  path: string;
  outline: [string, string];
  outlineColour: number[];
  border: [string, string];
  borderColour: number[];
  shadow: { colour: number[]; geometry: string } | null;
  ground: number[];
  ticks: { content: string; display: string; width: string; edge: string }[];
  mainOutline: string;
  deskPanel: boolean;
  transition: [string, string];
  columns: string;
  intros: { family: string; style: string; colour: number[]; align: string }[];
  box: { x: number; y: number; w: number };
  paper?: number;
  sections: Section[];
  entryIds: string[];
  saysTen: boolean;
  missingCultures: string[] | null;
};
export type Sheets = { faq: Sheet; glossary: Sheet };

const SHEET_READ: Payload<Sheet> = `(() => {
  const rgba = ${PAGE_RGBA};
  const sheet = document.querySelector(".sheet"), cs = getComputedStyle(sheet), main = document.querySelector("body > main"), ms = getComputedStyle(main);
  const tick = (pseudo, edge) => { const t = getComputedStyle(sheet, pseudo); return { content: t.content, display: t.display, width: t.width, edge: t.getPropertyValue(edge) }; };
  const b = sheet.getBoundingClientRect();
  const sections = [];
  for (const el of sheet.querySelectorAll("h2, h3, p.term, p.def")) {
    if (/^H[23]$/.test(el.tagName)) sections.push({ heading: el.textContent.trim(), terms: [], defs: 0 });
    else if (sections.length && el.matches("p.term")) sections.at(-1).terms.push(el.textContent.trim());
    else if (sections.length) sections.at(-1).defs++;
  }
  const names = document.getElementById("names");
  let missingCultures = null;
  if (names) { const heads = [...sheet.querySelectorAll("h3")].filter((h) => names.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING).map((h) => h.textContent.toLowerCase()); missingCultures = ${JSON.stringify(CULTURES.map((c) => c.id))}.filter((id) => !heads.some((h) => h.includes(id))); }
  return { path: location.pathname, outline: [cs.outlineStyle, cs.outlineWidth], outlineColour: rgba(cs.outlineColor),
    border: [cs.borderTopWidth, cs.borderTopStyle], borderColour: rgba(cs.borderTopColor), shadow: (() => { const m = /^(.+\\)) (-?[\\d.]+px -?[\\d.]+px -?[\\d.]+px -?[\\d.]+px)$/.exec(cs.boxShadow); return m ? { colour: rgba(m[1]), geometry: m[2] } : null; })(), ground: rgba(cs.backgroundColor),
    ticks: [tick("::before", "border-top-width"), tick("::after", "border-bottom-width")], box: { x: b.x, y: b.y, w: b.width },
    mainOutline: ms.outlineStyle, deskPanel: main.classList.contains("desk-panel"), transition: [ms.transitionProperty, ms.transitionDuration],
    columns: getComputedStyle(document.querySelector(".columns")).columnWidth,
    intros: [...sheet.querySelectorAll("p.intro")].map((i) => { const is = getComputedStyle(i); return { family: is.fontFamily, style: is.fontStyle, colour: rgba(is.color), align: is.textAlign }; }),
    sections, entryIds: [...sheet.querySelectorAll(":is(.q, .term)[id]")].map((e) => e.id),
    saysTen: document.body.textContent.replace(/\\s+/g, " ").includes("ten invented cultures"), missingCultures };
})()`;

export async function readSheets(k: Kit): Promise<Sheets> {
  await k.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  return { faq: await landed(k, "/faq/"), glossary: await landed(k, "/glossary/") };
}

// The sheet lands with a settle that animates its own shadow (both-filled), so the read waits for every animation on it to have finished.
const LANDED: Payload<boolean> = `(() => { const a = document.querySelector(".sheet")?.getAnimations() ?? []; return a.length > 0 && a.every((x) => x.playState === "finished"); })()`;

async function landed(k: Kit, path: string): Promise<Sheet> {
  await k.goto(path);
  await k.settle(LANDED, (d) => d, `${path} sheet landed`);
  const sheet = await k.evaluate(SHEET_READ);
  const strip = (await sampleRow(k.send, Math.round(sheet.box.x + 6), Math.round(sheet.box.y + 100), 16)).map(
    luminance,
  );
  return { ...sheet, paper: [...strip].sort((a, b) => a - b)[Math.floor(strip.length / 2)] };
}

const LINE_TAN = tokenRgba("--line-tan");
const framed = (s: Sheet): boolean =>
  s.outline[0] === "double" &&
  s.outline[1] === "3px" &&
  nearRgba(s.outlineColour, LINE_TAN) &&
  s.border[0] === "1px" &&
  s.border[1] === "solid" &&
  nearRgba(s.borderColour, LINE_TAN) &&
  !!s.shadow &&
  s.shadow.geometry === "0px 18px 60px 0px" &&
  nearRgba(s.shadow.colour, tokenRgba("--chart-ink", 0.55)) &&
  nearRgba(s.ground, tokenRgba("--parchment-panel")) &&
  s.ticks.every(
    (c) =>
      c.content !== "none" && c.content !== "normal" && c.display !== "none" && c.width === "26px" && c.edge === "1px",
  ) &&
  (s.paper ?? 0) > 200 &&
  s.mainOutline === "none" &&
  !s.deskPanel;

export function ix9SurveySheet({ check }: Kit, { faq, glossary }: Sheets): void {
  check(
    "IX9 the Q & A's and the Glossary's content lies on a survey sheet, as drawn: a 1px line-tan frame inside a 3px double line-tan rule, raised at the stage depth once it has landed, panel paper and its corner ticks, while main carries no frame and no desk panel, so the running head and the footer stay on the desk (Issue #289)",
    framed(faq) && framed(glossary),
    JSON.stringify(
      [faq, glossary].map(({ path, outline, border, shadow, ticks, paper, mainOutline, deskPanel }) => ({
        path,
        outline,
        border,
        shadow,
        ticks,
        paper,
        mainOutline,
        deskPanel,
      })),
    ),
  );
}

const FOLD: Payload<{ folded: boolean; margin: string; right: number } | null> =
  `(() => { const s = document.getElementById("index"), m = document.querySelector("body > main"); return s && m ? { folded: s.classList.contains("folded"), margin: getComputedStyle(m).marginRight, right: m.getBoundingClientRect().right } : null; })()`;

// element.click() is wiring here: IX3 and NA3 drive the fold with a real press, and this read is about each page sheet's own folded rule.
async function foldedMargin(k: Kit, path: string): Promise<string> {
  await k.goto(path);
  try {
    const open = await k.evaluate(FOLD);
    await k.evaluate(`document.querySelector("#index .slip-fold").click()`);
    const folded = await k.settle(
      FOLD,
      (d, last) => d.folded && d.right !== open?.right && !!last && last.right === d.right,
      `${path} folded`,
    );
    return folded.margin;
  } finally {
    await k.evaluate(`document.querySelector("#index.folded") && document.querySelector(".slip-tab").click()`);
  }
}

export async function ix10ColumnsFold(k: Kit, { faq, glossary }: Sheets): Promise<void> {
  const folded = [await foldedMargin(k, "/faq/"), await foldedMargin(k, "/glossary/")];
  ix10Report(k, faq, glossary, folded);
}

const slides = ([props, durations]: readonly [string, string]): boolean => {
  const at = props.split(", ").indexOf("margin-right");
  return at >= 0 && parseFloat(durations.split(", ")[at] ?? "0") > 0;
};

function ix10Report({ check }: Kit, faq: Sheet, glossary: Sheet, folded: readonly string[]): void {
  check(
    "IX10 the Glossary stands its broadside in the Q & A's 22rem columns, and on both pages the sheet takes the width a folded index gives it in one settle: main's margin-right transitions over a real duration, and folded it is 0 on each (Issue #462 rulings 1 to 3)",
    glossary.columns === "352px" &&
      slides(faq.transition) &&
      slides(glossary.transition) &&
      folded.every((m) => m === "0px"),
    JSON.stringify({ columns: glossary.columns, transitions: [faq.transition, glossary.transition], folded }),
  );
}

export function ix11Intro({ check }: Kit, { glossary }: Sheets): void {
  const off = glossary.intros.filter(
    (i) =>
      !/^"IM Fell English",/.test(i.family) ||
      i.style !== "italic" ||
      !nearRgba(i.colour, tokenRgba("--ink-brown")) ||
      i.align !== "center",
  );
  check(
    "IX11 every one of the Glossary's section intros speaks in the house intro voice: the flourish face, italic, ink-brown, centred (Issue #324 decision 1)",
    glossary.intros.length > 1 && off.length === 0,
    JSON.stringify({ intros: glossary.intros.length, off }),
  );
}

const CAP = 8;
const FLOOR = 5;
const OVER_CAP = ["Zoryan", "Ordai"];
const OVER_CAP_CEILING = 10;
const ADDED = [
  "Coming in from the sea",
  "The waterfront",
  "The river & the fen",
  "The road & the market",
  "The court & the realm",
  "What a place smells of",
  "What a place ships",
];
const CHART_SPLIT = ["The sheet and its frame", "On the chart itself", "Soundings & sea marks"];
const OWED =
  "Quay Weir Breakwater Chandler Osier Drover Reeve Reach Holding_ground Warp Beck Fen Waterman Wharf Moorings League Plate Colophon Docket Neat_line Contour_line Attar Kvass Copal Copra Cochineal Iron_bloom Kurgan"
    .split(" ")
    .map((t) => t.replace("_", " "));
const headword = (t: string): string =>
  t
    .toLowerCase()
    .replace(/\s*[(,].*$/, "")
    .trim();
const sortKey = (t: string): string => t.toLowerCase().replace(/^-/, "");

function shapeFaults(sections: readonly Section[]): string[] {
  const withTerms = sections.filter((s) => s.terms.length > 0);
  const faults: string[] = withTerms.length < FLOOR ? [`only ${withTerms.length} sections with terms`] : [];
  for (const s of withTerms) {
    const ceiling = OVER_CAP.some((n) => s.heading.startsWith(n)) ? OVER_CAP_CEILING : CAP;
    if (s.terms.length > ceiling) faults.push(`"${s.heading}" ${s.terms.length} terms > ${ceiling}`);
    const sorted = [...s.terms].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    if (JSON.stringify(sorted) !== JSON.stringify(s.terms)) faults.push(`"${s.heading}" out of order`);
  }
  for (const s of sections.filter((x) => x.terms.length > 0 || x.defs > 0))
    if (s.defs !== s.terms.length) faults.push(`"${s.heading}" ${s.terms.length} terms, ${s.defs} definitions`);
  for (const h of ADDED) {
    const n = withTerms.find((s) => s.heading === h)?.terms.length ?? 0;
    if (n < FLOOR || n > CAP) faults.push(`"${h}" ${n} terms, not ${FLOOR} to ${CAP}`);
  }
  for (const h of CHART_SPLIT) if (!withTerms.some((s) => s.heading === h)) faults.push(`no "${h}"`);
  const terms = withTerms.flatMap((s) => s.terms);
  for (const t of OWED) if (!terms.some((x) => x.toLowerCase() === t.toLowerCase())) faults.push(`"${t}" undocumented`);
  const seen = new Set<string>();
  for (const t of terms) {
    if (seen.has(headword(t))) faults.push(`"${t}" repeats a headword`);
    seen.add(headword(t));
  }
  return faults;
}

export function ix12GlossaryShape({ check }: Kit, { glossary }: Sheets): void {
  const faults = shapeFaults(glossary.sections);
  check(
    "IX12 the Glossary keeps its #353 shape on the page: no section past 8 terms (Zoryan and Ordai to 10), the seven added sections 5 to 8 each, the chart section split in three, every term Vellum prints documented, no headword twice, terms alphabetical in each section, and a definition for every term",
    faults.length === 0,
    faults.join("; ") || `${glossary.sections.length} headings`,
  );
}

export function ix13Cultures({ check }: Kit, { faq, glossary }: Sheets): void {
  check(
    "IX13 the Q & A and the Glossary state the ten-culture roster outright, and the Glossary's Words on your own map heads a section for every culture in CULTURES (Issues #289, #292)",
    faq.saysTen && glossary.saysTen && glossary.missingCultures !== null && glossary.missingCultures.length === 0,
    JSON.stringify({ faq: faq.saysTen, glossary: glossary.saysTen, missing: glossary.missingCultures }),
  );
}

const plainAndUnique = (ids: readonly string[]): boolean =>
  ids.length > 0 && new Set(ids).size === ids.length && ids.every((id) => /^[a-z0-9-]+$/.test(id));

export function ix14Anchors({ check }: Kit, { faq, glossary }: Sheets): void {
  check(
    "IX14 every question on the Q & A and every term in the Glossary carries its own plain anchor, no two alike, so every index link lands on one entry (Issue #462 ruling 1)",
    plainAndUnique(faq.entryIds) && plainAndUnique(glossary.entryIds),
    JSON.stringify({ faq: faq.entryIds.length, glossary: glossary.entryIds.length }),
  );
}
