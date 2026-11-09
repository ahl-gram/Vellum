import type { Payload, Point } from "../../types.ts";
import { TABLE_STORE_KEY } from "../../../src/site/shared/table-store.ts";
import type { DrawerKit } from "./kit.ts";
import { DEEP, DRAWN, DRESS, READ, atInset, drawerUp } from "./reads.ts";
import type { Read } from "./reads.ts";
import { sendClick } from "../../support/input.ts";

export async function cd1DogEar({ check, settle, go }: DrawerKit): Promise<void> {
  await go(`${DRESS}&${DEEP}`);
  const armed = await settle(READ, atInset, "chart-drawer-inset", DRAWN);
  const why = {
    ear: !!armed.ear,
    label: armed.ear && armed.ear.label === "lay this survey on the table",
    svgs: armed.insetSvgs === 1,
    isSurvey: armed.lastSvgIsSurvey,
    rect: !!armed.insetRect,
    top: !!armed.ear && !!armed.insetRect && armed.ear.rect.y >= armed.insetRect.y - 0.5,
    right: !!armed.ear && !!armed.insetRect && armed.ear.rect.right <= armed.insetRect.right + 0.5,
    shut: !armed.open,
    bare: armed.cuttings === 0,
    tab: armed.tabShown,
  };
  check(
    "CD1 the dog-ear rides the committed survey: labelled, inside the inset's own box so the place overlay's rect is untouched, and the inset still holds exactly ONE svg, which is what keeps the zoom suite's .pop() (Z21c, Z21d) on the survey (#518 ruling 3, #520)",
    !!armed.ear &&
      armed.ear.label === "lay this survey on the table" &&
      armed.insetSvgs === 1 &&
      armed.lastSvgIsSurvey &&
      !!armed.insetRect &&
      armed.ear.rect.y >= armed.insetRect.y - 0.5 &&
      armed.ear.rect.right <= armed.insetRect.right + 0.5 &&
      // The size, not just the containment: the handle sits inside #map and is scaled by the live transform unless it counter-scales, and at k=8 it measured 435px for a 3.4rem box. Containment alone cannot see that, since an ear anchored top-right balloons DOWN and LEFT and stays inside. 54.4px is 3.4rem at a 16px root, and holds at every k by construction.
      Math.abs(armed.ear.rect.w - 54.4) <= 1.5 &&
      Math.abs(armed.ear.rect.h - 54.4) <= 1.5 &&
      !armed.open &&
      armed.cuttings === 0 &&
      armed.tabShown,
    JSON.stringify({
      ear: armed.ear,
      earSize: [armed.ear && armed.ear.rect.w, armed.ear && armed.ear.rect.h],
      insetSvgs: armed.insetSvgs,
      lastSvgIsSurvey: armed.lastSvgIsSurvey,
      inset: armed.insetRect,
      open: armed.open,
      tab: armed.tabText,
      tabShown: armed.tabShown,
      cuttings: armed.cuttings,
      why,
    }),
  );
}

type Roads = {
  hash: string;
  table: string | null;
  stored: string | null;
  order: string | null;
  journal: string | null;
};
const ROADS: Payload<Roads> = `(() => ({ hash: location.hash, table: new URLSearchParams(location.hash.slice(1)).get("table"),
  stored: (() => { try { return localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}); } catch { return "THREW"; } })(),
  order: (document.getElementById("order-plates") || { getAttribute: () => null }).getAttribute("href"),
  journal: (document.getElementById("journal-link") || { getAttribute: () => null }).getAttribute("href") }))()`;

export async function cd52LayWrites({ evaluate, check }: DrawerKit): Promise<void> {
  const roads = await evaluate(ROADS);
  check(
    "CD52 a lay with no draw writes the table to the device and rebuilds every road that carries the page's address, the Print Room's and the Reading Room's, with the table it now holds (#634)",
    !!roads.table &&
      roads.table.startsWith("k-s.seed-42.") &&
      roads.stored === roads.table &&
      roads.order === `../print-room/${roads.hash}` &&
      roads.journal === `/reading-room/${roads.hash}`,
    JSON.stringify(roads),
  );
}

export async function cd2Lays({ check, settle }: DrawerKit) {
  const laid = await settle(READ, (d) => d.open && d.cuttings === 1, "chart-drawer-laid");
  check(
    "CD2 a click on the dog-ear lays the survey and ENDS with the drawer open (ruled 2026-09-07): one cutting with its own remove press, the count in period voice, the road to the Portfolio LIVE from the first sheet (it shipped disabled at #520 and #521 bound it), and the table written into the address",
    laid.open &&
      laid.cuttings === 1 &&
      laid.offs === 1 &&
      laid.imgs === 1 &&
      laid.count === "one sheet laid · room for five more" &&
      !laid.roadDisabled &&
      !laid.fullShown &&
      typeof laid.hashTable === "string" &&
      laid.hashTable.startsWith("k-s.seed-42") &&
      /lies on the table/.test(laid.status) &&
      laid.scrollW === laid.innerW,
    JSON.stringify({
      open: laid.open,
      cuttings: laid.cuttings,
      count: laid.count,
      road: laid.roadDisabled,
      hash: laid.hashTable,
      status: laid.status,
    }),
  );
  return laid;
}

type EarRest = {
  frame: number;
  iw: number;
  ih: number;
  ear: { x: number; y: number; w: number; h: number } | null;
  cam: { x: number; y: number; k: number };
};
// `shoot` in `e2e/harness.ts` captures beyond the viewport, which lays the page out at its document height and back (the 2026-10-06 CD2b row in `.claude/skills/vellum-footguns/references/flake-record.md` caught a 1x1 viewport in between), so the room lays the ear out again after the shot.
const FRAMES = `(()=>{window.__cd2bFrame=0;const tick=()=>{if(window.__cd2bFrame<0)return;window.__cd2bFrame++;requestAnimationFrame(tick);};requestAnimationFrame(tick);return true;})()`;
const EAR_REST: Payload<EarRest> = `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); const b = e ? e.getBoundingClientRect() : null; const s = window.__vellumZoomState(); return { frame: window.__cd2bFrame, iw: innerWidth, ih: innerHeight, ear: b && { x: b.x, y: b.y, w: b.width, h: b.height }, cam: { x: s.x, y: s.y, k: s.k } }; })()`;
const earAtRest = (d: EarRest, last: EarRest | null): boolean =>
  d.iw === 1280 &&
  d.ih === 800 &&
  d.ear !== null &&
  last !== null &&
  d.frame > last.frame &&
  JSON.stringify(d.ear) === JSON.stringify(last.ear) &&
  JSON.stringify(d.cam) === JSON.stringify(last.cam);

async function shootThenRest({
  evaluate,
  shoot,
  settle,
}: Pick<DrawerKit, "evaluate" | "shoot" | "settle">): Promise<void> {
  await evaluate(FRAMES);
  try {
    await shoot("chart-drawer-1280-open.png");
    await settle(EAR_REST, earAtRest, "CD2b the ear at rest after the shot");
  } finally {
    await evaluate(`window.__cd2bFrame = -1`);
  }
}

export async function cd2bRealPointer(
  { evaluate, send, check, shoot, sleep, settle }: DrawerKit,
  earAt: Point | null,
): Promise<void> {
  await shootThenRest({ evaluate, shoot, settle });

  check(
    "CD2b the handle answers a REAL pointer: the inset box is pointer-events: none, so the corner must restore it or the survey files for a synthetic click and for nobody else (#520 goal: with a click or a tap, everywhere)",
    !!earAt &&
      (await evaluate<string>(
        `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return "no-ear"; const b = e.getBoundingClientRect(); const hit = document.elementFromPoint(Math.round(b.x + b.width * 0.72), Math.round(b.y + b.height * 0.28)); return hit === e ? "ear" : (hit ? hit.tagName + "." + String(hit.className.baseVal ?? hit.className).split(" ")[0] : "none"); })()`,
      )) === "ear",
    JSON.stringify({ clickedAt: earAt }),
  );

  const beforeDbl = await evaluate<{ k: number; band: number | null }>(
    `(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`,
  );
  const dblAt = await evaluate<Point | null>(
    `(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`,
  );
  if (dblAt) {
    for (const clickCount of [1, 2]) {
      await sendClick(send, dblAt.x, dblAt.y, { clickCount });
    }
  }
  await sleep(900, "window: a double click must not zoom in it");
  const afterDbl = await evaluate<{ k: number; band: number | null }>(
    `(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`,
  );
  check(
    "CD2c a rapid double click on the handle does not become d3's double-click-to-zoom, the same rule Z10b pins for the zoom cluster (#520 build item 2)",
    !!dblAt && afterDbl.k === beforeDbl.k && afterDbl.band === beforeDbl.band,
    JSON.stringify({ before: beforeDbl, after: afterDbl }),
  );
}

export async function cd4Reload({ evaluate, check, settle, go }: DrawerKit, laid: Read | null): Promise<void> {
  if (!laid) throw new Error("CD2 never laid a sheet, so this reload has no table to restore");
  const carried = laid.hashTable;
  await go(`${DRESS}&table=${carried}`);
  const cold = await evaluate(READ);
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  const filled = await settle(READ, (d) => d.imgs >= 1 && d.decoded.every(Boolean), "chart-drawer-filled", DRAWN);
  check(
    "CD4 a reload restores the table from the address alone, showing a reserved frame named from the chart number, and the picture is drawn when the drawer is OPENED rather than on load (ruled 2026-09-07)",
    cold.cuttings === 1 &&
      cold.imgs === 0 &&
      cold.frames === 1 &&
      cold.titles[0] === "Chart № 42" &&
      !cold.open &&
      filled.imgs === 1 &&
      filled.frames === 0 &&
      filled.decoded[0] === true &&
      filled.titles[0] !== "Chart № 42",
    JSON.stringify({
      cold: { cuttings: cold.cuttings, imgs: cold.imgs, frames: cold.frames, titles: cold.titles },
      filled: { imgs: filled.imgs, titles: filled.titles, decoded: filled.decoded },
    }),
  );
}

export async function cd5CuttingOff({ evaluate, check, settle }: DrawerKit): Promise<void> {
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  const bare = await settle(READ, (d) => d.cuttings === 0, "chart-drawer-bare");
  check(
    "CD5 a cutting comes off by its own press and the room is ANNOUNCED, since the press that did it leaves the page with it, and an EMPTY table writes no key at all rather than growing table= onto every link forever (#520 ruling 1)",
    bare.cuttings === 0 &&
      bare.count === "the table is bare" &&
      bare.hashTable === null &&
      bare.rawHash.indexOf("table=") === -1 &&
      /is off the table/.test(bare.status),
    JSON.stringify({ cuttings: bare.cuttings, count: bare.count, hashTable: bare.hashTable, status: bare.status }),
  );
}

export async function cd7Cap({ check, settle, clickEar, go }: DrawerKit, SIX: string): Promise<void> {
  await go(`${DRESS}&${DEEP}&table=${SIX}`);
  const atSix = await settle(READ, atInset, "chart-drawer-six", DRAWN);
  await clickEar();
  const refused = await settle(READ, drawerUp, "chart-drawer-open");
  check(
    "CD7 at the cap the handle refuses in the voice #518 ruling 3 wrote, lays nothing, and says so where the reader is told everything else (#520 build item 5)",
    atSix.cuttings === 6 &&
      !!atSix.ear &&
      atSix.ear.label === "the table is full: six sheets lie on it" &&
      refused.cuttings === 6 &&
      refused.status === "the table is full: six sheets lie on it" &&
      refused.fullShown,
    JSON.stringify({
      before: atSix.cuttings,
      label: atSix.ear && atSix.ear.label,
      after: refused.cuttings,
      status: refused.status,
      full: refused.fullShown,
    }),
  );

  check(
    "CD7b with the drawer open at a FULL table every remove press answers a real pointer: the Broadside is fixed above this drawer and reaches into its band, and the cuttings overlap each other by design, so three of six once hit-tested to the form behind them and to a neighbour's paper label",
    refused.cuttings === 6 && refused.offs === 6 && refused.offsReachable === 6,
    JSON.stringify({
      cuttings: refused.cuttings,
      offs: refused.offs,
      reachable: refused.offsReachable,
      open: refused.open,
      rects: refused.offRects,
      innerH: refused.innerH,
      slideMs: refused.slideMs,
      anims: refused.drawerAnims,
    }),
  );
}

export async function cd8Home({ evaluate, check, settle }: DrawerKit): Promise<void> {
  await evaluate(`window.__vellumZoomTo({ x: 0, y: 0, k: 1 })`);
  const home = await settle(READ, (d) => !d.ear, "chart-drawer-home");
  check(
    "CD8 going home drops the inset and the dog-ear with it: the handle never outlives the survey it belongs to, and the table it filled is untouched (#520 build item 2)",
    home.ear === null && home.insetSvgs === 0 && home.cuttings === 6,
    JSON.stringify({ ear: home.ear, insetSvgs: home.insetSvgs, cuttings: home.cuttings }),
  );
}
