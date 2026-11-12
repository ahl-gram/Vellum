// The Q & A's index slip (Issue #462 Landfall Sub 7, document-room rulings 1 to 3), the thin reading-page suite the Primer joins (Issue #1273 ruling 5): the index stands open beside the sheet with a row for every section, folds to hand the sheet the width and comes back from its tab, and the room's name stands in a region landmark. Every geometry is MEASURED.
import { scopedHealth } from "../support/room.ts";
import { makeSettle, makeStable, type Settle } from "../support/settle.ts";
import { makeStep } from "../support/step.ts";
import type { Payload, SuiteContext } from "../types.ts";
import { ix8Landmark } from "./document-rooms/landmark.ts";
import { ix9Seals } from "./document-rooms/primer.ts";
import { bounce } from "../support/nav.ts";

const FAQ = "/faq/";
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

const LANDING: Payload<{ sheet: number[] | null; slip: number[] | null }> =
  `(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((n) => +n.toFixed(2)); }; return { sheet: r(".sheet"), slip: r("#index") }; })()`;

export type DocRoomsKit = ReturnType<typeof docRoomsKit>;

export async function run(ctx: SuiteContext): Promise<void> {
  const { send } = ctx;
  const settle = makeSettle(ctx);
  const step = makeStep(ctx);
  const gate = scopedHealth(ctx);
  const k = docRoomsKit({ ...ctx, settle });

  // IX1's geometry is read at the sibling suites' 1280x800, never the harness's taller window.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  let faq: Index | undefined;
  await step("IX1", async () => {
    faq = await ix1QaStands(k);
  });
  await step("IX3", () => ix3Folds(k, faq!));
  await step("IX8", () => ix8Landmark(k));
  await step("IX9", () => ix9Seals(k));
  gate.check("IX7 the document-room suite drove the Q & A with no console error and no 4xx");
}

export function docRoomsKit(ctx: SuiteContext & { settle: Settle }) {
  const { evaluate, send, sleep, PORT } = ctx;
  const stable = makeStable(ctx.settle);
  // A room's readiness is its own shell (waitReady keys on the Explorer's members); the index script runs at parse, so the slip's inline top is the boot signal.
  const goto = async (path: string) => {
    await bounce(send, `http://127.0.0.1:${PORT}${path}`);
    for (let i = 0; i < 200; i++) {
      const up = await evaluate<boolean>(
        `document.readyState === "complete" && !!document.getElementById("index")`,
      ).catch(() => false);
      if (up) break;
      await sleep(25);
    }
    await stable(LANDING, `${path} landed`, { animated: ".sheet" });
  };
  return { ...ctx, stable, goto };
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
