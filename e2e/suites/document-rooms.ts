// The document rooms' index slip (Issue #462 Landfall Sub 7, document-room rulings 1 to 4): the index is server-rendered from the page's own sections, inks the section being read, folds to hand the sheet the width, stands beside the 1024 page in a narrower window (Issue #762), and on the Glossary narrows to the term names typed. Every geometry is MEASURED; the scripts-off arm carries its control.
import { scopedHealth } from "../support/room.ts";
import { makeSettle } from "../support/settle.ts";
import { withScriptsOff } from "../support/scripts-off.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import {
  ix9SurveySheet,
  ix10ColumnsFold,
  ix11Intro,
  ix12GlossaryShape,
  ix13Cultures,
  ix14Anchors,
  readSheets,
} from "./document-rooms/sheets.ts";
import type { Sheets } from "./document-rooms/sheets.ts";

const FAQ = "/faq/";
const GLOSSARY = "/glossary/";
type Box = { x: number; y: number; w: number; h: number; right: number; bottom: number } | null;
type Index = {
  innerW: number;
  innerH: number;
  scrollW: number;
  scrollY: number;
  h2s: string[];
  entries: number;
  rows: (string | undefined)[];
  rowEntries: number[];
  inked: (string | undefined)[];
  now: (string | undefined)[];
  slip: Box;
  slipPosition: string | null;
  slipVisibility: string | null;
  folded: boolean;
  open: boolean;
  bodyDisplay: string | null;
  tab: Box;
  tabVisibility: string | null;
  folio: Box;
  h1: Box;
  main: Box;
  sheet: Box;
  count: string | undefined;
  toc: boolean;
  columns: string;
};
const atFolded =
  (from: Index) =>
  (d: Index, p: Index | null): boolean =>
    d.slipVisibility === "hidden" &&
    d.tabVisibility === "visible" &&
    d.main!.right !== from.main!.right &&
    !!p &&
    d.main!.right === p.main!.right;
const atUnfolded =
  (from: Index) =>
  (d: Index, p: Index | null): boolean =>
    d.slipVisibility === "visible" &&
    d.tabVisibility === "hidden" &&
    d.main!.right !== from.main!.right &&
    !!p &&
    d.main!.right === p.main!.right;

const READ: Payload<Index> = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const slip = document.getElementById("index");
  const cs = slip ? getComputedStyle(slip) : null;
  const body = slip ? slip.querySelector(".slip-body") : null;
  const rows = slip ? [...slip.querySelectorAll(".index > li")] : [];
  return {
    innerW: innerWidth, innerH: innerHeight, scrollW: document.documentElement.scrollWidth, scrollY: window.scrollY,
    h2s: [...document.querySelectorAll(".sheet h2[id]")].map((h) => h.id),
    entries: document.querySelectorAll(".sheet :is(.q, .term)[id]").length,
    rows: rows.map((li) => li.dataset.sec),
    rowEntries: rows.map((li) => li.querySelectorAll("a[href^='#']").length - 1),
    inked: rows.filter((li) => li.classList.contains("inked")).map((li) => li.dataset.sec),
    now: [...document.querySelectorAll("#index [data-for].now")].map((el) => el.dataset.for),
    slip: r("#index"), slipPosition: cs && cs.position, slipVisibility: cs && cs.visibility,
    folded: !!slip && slip.classList.contains("folded"), open: !!slip && slip.classList.contains("open"),
    bodyDisplay: body ? getComputedStyle(body).display : null,
    tab: r(".slip-tab"), tabVisibility: (() => { const t = document.querySelector(".slip-tab"); return t ? getComputedStyle(t).visibility : null; })(),
    folio: r(".corner.tr"), h1: r("h1.room-name"),
    main: r("body > main"), sheet: r(".sheet"),
    count: (document.querySelector(".folio-room .dateline, .folio-room .gloss") || {}).textContent,
    toc: !!document.querySelector(".toc"),
    columns: getComputedStyle(document.querySelector(".columns")).columnWidth,
  };
})()`;

type Settle = ReturnType<typeof makeSettle>;
type DocRoomsKit = ReturnType<typeof docRoomsKit>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send, setTouch, waitReady, PORT } = ctx;
  const settle = makeSettle(ctx);
  // IX3 is the one group here that waits on a transition, so it is the one that is stepped (Issue #534).
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = docRoomsKit({ ...ctx, settle });

  // The desktop arm at the sibling suites' 1280x800: the harness window is taller, and a tall viewport cannot scroll a late section up to the reading line.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  const faq = await ix1QaStands(k);
  await ix2InksRow(k, faq);
  await step("IX3", () => ix3Folds(k, faq));
  await ix4FindBox(k);
  await setTouch(false);
  await step("NA3", () => na3Floor(k));
  await ix6NoScript(k);
  await step("IX8", () => ix8Landmark(k));

  let sheets: Sheets | undefined;
  await step("IX9", async () => {
    sheets = await readSheets(k);
    ix9SurveySheet(k, sheets);
  });
  await step("IX10", () => ix10ColumnsFold(k, sheets!));
  const read = (fn: (s: Sheets) => void) => () => Promise.resolve(sheets).then((s) => fn(s!));
  await step(
    "IX11",
    read((s) => ix11Intro(k, s)),
  );
  await step(
    "IX12",
    read((s) => ix12GlossaryShape(k, s)),
  );
  await step(
    "IX13",
    read((s) => ix13Cultures(k, s)),
  );
  await step(
    "IX14",
    read((s) => ix14Anchors(k, s)),
  );

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  gate.check("IX7 the document-room suite drove both rooms with no console error and no 4xx");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/` });
  await waitReady();
}

function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, PORT } = ctx;
  // A room's readiness is its own shell (waitReady keys on the Explorer's members); the index script runs at parse, so the slip's inline top is the boot signal.
  const goto = async (path: string) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${path}` });
    for (let i = 0; i < 200; i++) {
      const up = await evaluate<boolean>(
        `document.readyState === "complete" && !!document.getElementById("index")`,
      ).catch(() => false);
      if (up) break;
      await sleep(25);
    }
    await sleep(300);
  };
  return { ...ctx, goto };
}

async function ix1QaStands({ evaluate, check, goto }: DocRoomsKit): Promise<Index> {
  await goto(FAQ);
  const faq = await evaluate(READ);
  check(
    "IX1 the Q & A stands its name top right and its index open beside the sheet: every h2 a row with its questions, the count line the page's own tally, the slip hung under the folio, the sheet ending short of the slip's column, no TOC left on the sheet, 22rem columns (#462 rulings 1, 3, 6)",
    faq.h1 !== null &&
      faq.folio !== null &&
      faq.h1.right <= faq.innerW &&
      faq.h1.y < 60 &&
      faq.slipPosition === "fixed" &&
      !faq.folded &&
      faq.slip!.y >= faq.folio.bottom + 10 &&
      JSON.stringify(faq.rows) === JSON.stringify(faq.h2s) &&
      faq.rowEntries.reduce((a, b) => a + b, 0) === faq.entries &&
      faq.count === `${faq.entries} questions in ${faq.h2s.length} sections` &&
      faq.sheet!.right <= faq.slip!.x - 8 &&
      !faq.toc &&
      faq.columns === "352px" &&
      faq.scrollW <= faq.innerW,
    `h1 ${JSON.stringify(faq.h1)}, slip ${faq.slipPosition} y=${faq.slip && faq.slip.y.toFixed(1)} folio bottom=${faq.folio && faq.folio.bottom.toFixed(1)}, rows ${faq.rows.length}/${faq.h2s.length}, entries ${faq.rowEntries.join("+")}=${faq.entries}, count "${faq.count}", sheet right ${faq.sheet && faq.sheet.right.toFixed(1)} vs slip x ${faq.slip && faq.slip.x.toFixed(1)}, toc ${faq.toc}, columns ${faq.columns}, scrollW ${faq.scrollW}/${faq.innerW}`,
  );
  return faq;
}

async function ix2InksRow({ evaluate, check, sleep }: DocRoomsKit, faq: Index): Promise<void> {
  const target = faq.h2s[2];
  const firstEntryOf = await evaluate<string | null>(
    `(() => { const h = document.getElementById(${JSON.stringify(target)}); let e = h.nextElementSibling; while (e && !e.matches(".q[id], .term[id]")) e = e.nextElementSibling; return e ? e.id : null; })()`,
  );
  await evaluate(`document.getElementById(${JSON.stringify(target)}).scrollIntoView()`);
  await sleep(250);
  const atHead = await evaluate(READ);
  await evaluate(`document.getElementById(${JSON.stringify(firstEntryOf)}).scrollIntoView()`);
  await sleep(250);
  const atEntry = await evaluate(READ);
  check(
    "IX2 following a section's head inks that row alone with no question marked yet (never the section above's last one); reaching its first question marks that one, the reader's place kept as the page moves (#462 ruling 1)",
    atHead.scrollY > 0 &&
      JSON.stringify(atHead.inked) === JSON.stringify([target]) &&
      atHead.now.length === 0 &&
      JSON.stringify(atEntry.inked) === JSON.stringify([target]) &&
      JSON.stringify(atEntry.now) === JSON.stringify([firstEntryOf]),
    `at the head #${target}: inked ${JSON.stringify(atHead.inked)}, now ${JSON.stringify(atHead.now)}; at its first question #${firstEntryOf}: inked ${JSON.stringify(atEntry.inked)}, now ${JSON.stringify(atEntry.now)}`,
  );
}

async function ix3Folds({ evaluate, check, settle }: DocRoomsKit, faq: Index): Promise<void> {
  await evaluate(`document.querySelector("#index .slip-fold").click()`);
  const folded = await settle(READ, atFolded(faq), "index-folded");
  await evaluate(`document.querySelector(".slip-tab").click()`);
  const back = await settle(READ, atUnfolded(folded), "index-unfolded");
  check(
    "IX3 folding the index hands the sheet the width in one settle and stands the bookmark tab on the right edge; the tab brings the index back and the sheet shrinks the same way (#462 ruling 2, Alex's own wording)",
    folded.folded &&
      folded.slipVisibility === "hidden" &&
      folded.tabVisibility === "visible" &&
      folded.tab!.right >= folded.innerW - 1 &&
      folded.main!.right > faq.main!.right + 200 &&
      folded.sheet!.right > faq.sheet!.right + 200 &&
      !back.folded &&
      back.slipVisibility === "visible" &&
      back.tabVisibility === "hidden" &&
      Math.abs(back.main!.right - faq.main!.right) < 1,
    `folded: slip ${folded.slipVisibility} tab ${folded.tabVisibility} right=${folded.tab && folded.tab.right}, main right ${faq.main!.right.toFixed(1)} -> ${folded.main!.right.toFixed(
      1,
    )} -> ${back.main!.right.toFixed(1)}, sheet right ${faq.sheet!.right.toFixed(1)} -> ${folded.sheet!.right.toFixed(
      1,
    )}`,
  );
}

async function ix4FindBox({ evaluate, send, check, sleep, goto }: DocRoomsKit): Promise<void> {
  await goto(GLOSSARY);
  const glossary = await evaluate(READ);
  await evaluate(`document.querySelector(".find input").focus()`);
  await send("Input.insertText", { text: "glass" });
  await sleep(150);
  const found = await evaluate<{
    hits: string[];
    shown: number;
    total: number;
    empty: number;
    rows: number;
    defsMatch: number;
  }>(`(() => {
    const links = [...document.querySelectorAll("#index .terms a")];
    const hits = links.filter((a) => a.classList.contains("hit"));
    const shown = links.filter((a) => getComputedStyle(a).display !== "none");
    const rows = [...document.querySelectorAll("#index .index > li")];
    return { hits: hits.map((a) => a.textContent), shown: shown.length, total: links.length,
      empty: rows.filter((li) => getComputedStyle(li).display === "none").length, rows: rows.length,
      defsMatch: [...document.querySelectorAll(".sheet .def")].filter((d) => /glass/i.test(d.textContent)).length };
  })()`);
  await evaluate(
    `(() => { const i = document.querySelector(".find input"); i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); })()`,
  );
  await sleep(100);
  const cleared = await evaluate<{ shown: number; total: number; hits: number; empty: number }>(
    `(() => { const links = [...document.querySelectorAll("#index .terms a")]; return { shown: links.filter((a) => getComputedStyle(a).display !== "none").length, total: links.length, hits: links.filter((a) => a.classList.contains("hit")).length, empty: [...document.querySelectorAll("#index .index > li")].filter((li) => getComputedStyle(li).display === "none").length }; })()`,
  );
  check(
    "IX4 the Glossary's find box narrows the index to the term NAMES typed (every shown term carries the query, sections with none fold away, and definitions that merely mention it do not count), and clearing it restores the whole index (#462 ruling 4)",
    glossary.count === `${glossary.entries} terms in ${glossary.h2s.length} sections` &&
      found.hits.length >= 2 &&
      found.hits.every((t) => /glass/i.test(t)) &&
      found.shown === found.hits.length &&
      found.empty > 0 &&
      found.empty < found.rows &&
      found.defsMatch > found.hits.length &&
      cleared.shown === cleared.total &&
      cleared.hits === 0 &&
      cleared.empty === 0,
    `count "${glossary.count}"; "glass": hits ${JSON.stringify(found.hits)} shown ${found.shown}/${found.total}, sections folded ${found.empty}/${found.rows}, definitions mentioning it ${found.defsMatch}; cleared: shown ${cleared.shown}/${cleared.total}, folded ${cleared.empty}`,
  );
}

async function pressAt({ send }: DocRoomsKit, x: number, y: number): Promise<void> {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const centreOf: (sel: string) => Payload<{ x: number; y: number } | null> = (sel) =>
  `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.right <= innerWidth ? { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) } : null; })()`;

// At a 640 window the page is the 1024 one, so the index stands past the window's right edge until the window scrolls to it; every press here is a real one at the element's own centre.
async function na3Floor(k: DocRoomsKit): Promise<void> {
  const { evaluate, send, check, settle, goto } = k;
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto(FAQ);
  const wide = await evaluate(READ);
  await send("Emulation.setDeviceMetricsOverride", { width: 640, height: 800, deviceScaleFactor: 1, mobile: false });
  await goto(FAQ);
  const at = await evaluate(READ);
  await evaluate("window.scrollTo(document.documentElement.scrollWidth, 0)");
  const scrolled = await evaluate(READ);
  const fold = await evaluate(centreOf("#index .slip-fold"));
  if (fold) await pressAt(k, fold.x, fold.y);
  const folded = await settle(READ, atFolded(scrolled), "na3-folded");
  const tab = await evaluate(centreOf(".slip-tab"));
  if (tab) await pressAt(k, tab.x, tab.y);
  const back = await settle(READ, atUnfolded(folded), "na3-unfolded");
  const entry = await evaluate<{ href: string | null; x: number; y: number } | null>(
    `(() => { const a = document.querySelector("#index .entries li:nth-child(2) a"); if (!a) return null; const r = a.getBoundingClientRect(); return { href: a.getAttribute("href"), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`,
  );
  if (entry) await pressAt(k, entry.x, entry.y);
  const landed = await settle<{
    top: number;
    hash: string;
    band: number;
    rem: number;
    folded: boolean;
    visibility: string;
  }>(
    `(() => { const t = document.querySelector(${JSON.stringify(entry?.href ?? "#")}); const s = document.getElementById("index"); const root = getComputedStyle(document.documentElement); return { top: t ? Math.round(t.getBoundingClientRect().top) : NaN, hash: location.hash, band: parseFloat(root.getPropertyValue("--band-h")) * parseFloat(root.fontSize), rem: parseFloat(root.fontSize), folded: s.classList.contains("folded"), visibility: getComputedStyle(s).visibility }; })()`,
    (d, last) => d.hash === entry?.href && last !== null && last.top === d.top,
    "na3-jumped",
  );
  const sameAsWide = Math.abs(at.slip!.x - wide.slip!.x) < 0.5 && Math.abs(at.sheet!.right - wide.sheet!.right) < 0.5;
  check(
    "NA3 at a 640x800 window the Q & A lays out its 1024 page: the index stands beside the sheet where it stands at 1024 and the window scrolls sideways to it; scrolled there, a real press folds it and hands the sheet the width, its tab brings it back, and a followed question lands at its own scroll margin, a rem under the band, with the index left open (Alex, 2026-10-06, Issue #762: the 1024 floor; the phone's bottom sheet went with the narrow layout)",
    at.innerW === 640 &&
      at.scrollW === 1024 &&
      !at.folded &&
      at.slipVisibility === "visible" &&
      sameAsWide &&
      !!fold &&
      folded.folded &&
      folded.main!.right > scrolled.main!.right + 200 &&
      !!tab &&
      !back.folded &&
      back.slipVisibility === "visible" &&
      Math.abs(back.main!.right - scrolled.main!.right) < 1 &&
      !!entry &&
      landed.hash === entry.href &&
      Math.abs(landed.top - (landed.band + landed.rem)) <= 1 &&
      !landed.folded &&
      landed.visibility === "visible",
    JSON.stringify({
      innerW: at.innerW,
      scrollW: at.scrollW,
      slipX: [at.slip?.x, wide.slip?.x],
      sheetRight: [at.sheet?.right, wide.sheet?.right],
      fold,
      foldedMain: [scrolled.main?.right, folded.main?.right, back.main?.right],
      tab,
      entry,
      landed,
    }),
  );
}

async function ix6NoScript({ evaluate, send, check, goto }: DocRoomsKit): Promise<void> {
  const { noJs, noJsLink } = await withScriptsOff(send, async () => {
    await goto(GLOSSARY);
    const read = await evaluate(READ);
    const link = await evaluate<{ href: string | null; target: boolean }>(
      `(() => { const a = document.querySelector("#index .terms a"); return { href: a.getAttribute("href"), target: !!document.querySelector(a.getAttribute("href")) }; })()`,
    );
    return { noJs: read, noJsLink: link };
  });
  check(
    "IX6 with SCRIPT EXECUTION DISABLED the index still stands, every section and term server-rendered with a real anchor, and NO row is inked: the ink is the control, since the binder alone sets it and every other term here is equally true with scripts on (#462 ruling 1, the no-JS floor)",
    JSON.stringify(noJs.rows) === JSON.stringify(noJs.h2s) &&
      noJs.rowEntries.reduce((a, b) => a + b, 0) === noJs.entries &&
      noJsLink.target &&
      noJs.inked.length === 0,
    `rows ${noJs.rows.length}/${noJs.h2s.length}, entries ${noJs.rowEntries.reduce((a, b) => a + b, 0)}/${noJs.entries}, first term ${noJsLink.href} resolves=${noJsLink.target}, inked ${JSON.stringify(noJs.inked)} (the CONTROL: empty says script really was off)`,
  );
}

type AxNode = { role?: { value?: string }; name?: { value?: string }; ignored?: boolean };
const LANDMARKS = new Set(["main", "banner", "navigation", "complementary", "contentinfo", "region", "form", "search"]);

async function roomName({ evaluate, send, sleep, PORT }: DocRoomsKit, page: string): Promise<string> {
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${page}` });
  for (let i = 0; i < 200; i++) {
    const name = await evaluate<string>(
      `document.readyState === "complete" && location.pathname === ${JSON.stringify(page)} ? (document.querySelector("h1.room-name") || {}).textContent || "" : ""`,
    ).catch(() => "");
    if (name) return name;
    await sleep(25);
  }
  throw new Error(`IX8: ${page} never named its room`);
}

// The accessibility tree itself, read over the debug port: the landmark a reader jumping by landmarks meets the room's name in; the Print Room's, inside <main>, is the same-run control.
async function ix8Landmark(k: DocRoomsKit): Promise<void> {
  const rows: string[] = [];
  let ok = true;
  for (const [page, want] of [
    ["/faq/", "region"],
    ["/glossary/", "region"],
    ["/gallery/", "region"],
    ["/print-room/", "main"],
  ] as const) {
    const name = await roomName(k, page);
    const h1 = await k.send<{ result: { objectId?: string } }>("Runtime.evaluate", {
      expression: `document.querySelector("h1.room-name")`,
    });
    const node = await k.send<{ node: { backendNodeId: number } }>("DOM.describeNode", {
      objectId: h1.result.objectId,
    });
    const ax = await k.send<{ nodes: AxNode[] }>("Accessibility.getAXNodeAndAncestors", {
      backendNodeId: node.node.backendNodeId,
    });
    const landmark = ax.nodes.find((n) => !n.ignored && LANDMARKS.has(n.role?.value ?? ""));
    ok &&= landmark?.role?.value === want && (want !== "region" || landmark.name?.value === name);
    rows.push(
      `${page} "${name}" in ${landmark ? `${landmark.role!.value}${landmark.name?.value ? ` "${landmark.name.value}"` : ""}` : "no landmark"}`,
    );
  }
  k.check(
    "IX8 the Q & A's, the Glossary's and the Gallery's name, standing in the desk layer ahead of <main>, sits in a region landmark named for the room, read from the accessibility tree, where the Print Room's sits in <main> (Alex, 2026-10-06, Issue #762 issuecomment-6019508051)",
    ok,
    rows.join(" | "),
  );
}
