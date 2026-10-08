import type { Point, SuiteContext } from "../../types.ts";
import type { DrawerKit } from "./kit.ts";
import { DEEP, DRAWN, DRESS, READ, atInset, drawerUp } from "./reads.ts";
import type { Read } from "./reads.ts";

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
    "CD1 the dog-ear rides the committed survey: labelled, inside the inset's own box so the place overlay's rect is untouched, and the inset still holds exactly ONE svg, which is what keeps suite-region-detail's .pop() on the survey (#518 ruling 3, #520)",
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

export async function cd2bRealPointer(
  { evaluate, send, check, shoot, sleep }: SuiteContext,
  earAt: Point | null,
): Promise<void> {
  await shoot("chart-drawer-1280-open.png");

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
      await send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: dblAt.x,
        y: dblAt.y,
        button: "left",
        clickCount,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: dblAt.x,
        y: dblAt.y,
        button: "left",
        clickCount,
      });
    }
  }
  await sleep(900);
  const afterDbl = await evaluate<{ k: number; band: number | null }>(
    `(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`,
  );
  check(
    "CD2c a rapid double click on the handle does not become d3's double-click-to-zoom, the same rule Z10b pins for the zoom cluster (#520 build item 2)",
    !!dblAt && afterDbl.k === beforeDbl.k && afterDbl.band === beforeDbl.band,
    JSON.stringify({ before: beforeDbl, after: afterDbl }),
  );
}

export async function cd23LineLeaves(
  { evaluate, check, settle, clickEar }: DrawerKit,
  HOLD_FLOOR: number,
): Promise<void> {
  // Derived 2026-09-13: SAY_HOLD_MS + SAY_FADE_MS is 8.45s (src/site/shared/announce.ts), which is 169 polls of pure sleep before a single evaluate round-trip is counted; 400 tries is 20s of sleep alone, the same order of headroom DRAWN carries for the CI runner measured 2.7x slower than local.
  const SAID_GONE = 400;
  // The sheet comes off and goes back on, so what is timed is the LAY line the issue was filed about and not the refusal CD2c happened to leave, and the clock starts at a known press (skeptic rounds 1 and 2 on PR #584). The table is back to the one cutting CD2 laid, which is the state CD3, CD4 and CD5 read.
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  await clickEar();
  const saidAt = Date.now();
  const said = await evaluate(READ);
  // The rule's resolved answer, not the app's timing: the class is put on with the transition suppressed inline, so the value read is the one the CASCADE gives and a later arm re-raising opacity cannot hide behind the JS clearing the text anyway (skeptic on PR #584).
  const fadeProbe = await evaluate<{ rest: string; faded: string }>(
    `(() => { const s = document.getElementById("status"); const was = s.style.transition; s.style.transition = "none"; const rest = getComputedStyle(s).opacity; s.classList.add("fading"); const faded = getComputedStyle(s).opacity; s.classList.remove("fading"); s.style.transition = was; return { rest, faded }; })()`,
  );
  const gone = await settle(READ, (d) => d.status === "", "chart-drawer-said-gone", SAID_GONE);
  const waited = Date.now() - saidAt;
  check(
    "CD23 the Chart Table's announcement leaves the chart by itself: the LAY line #547 was filed about, which sat over the middle of the sheet until the reader drew another world, since shutting the drawer never took it away (Alex 2026-09-08). The removal press above is wiring and not the gesture under test, which is CD5's and CD7b's. The table is untouched as the line goes, so this is the LINE leaving and not the page resetting; the hold is floored a second under the eight Alex ruled, a floor and never a ceiling since a slower runner can only lengthen it, with the literal 8000 pinned in test/site/announce.test.ts; and the fade is read twice, as the declared duration the way CD7c pins the drawer's slide, and as the opacity the cascade actually resolves under the class",
    /lies on the table/.test(said.status) &&
      gone.status === "" &&
      gone.cuttings === said.cuttings &&
      gone.open === said.open &&
      said.statusFadeMs === "0.45s" &&
      fadeProbe.rest === "1" &&
      fadeProbe.faded === "0" &&
      waited >= HOLD_FLOOR,
    JSON.stringify({
      said: said.status,
      after: gone.status,
      waitedMs: waited,
      floor: HOLD_FLOOR,
      cuttings: [said.cuttings, gone.cuttings],
      open: [said.open, gone.open],
      fadeMs: said.statusFadeMs,
      opacity: fadeProbe,
    }),
  );
}

export async function cd3Refused({ evaluate, check, settle, clickEar }: DrawerKit): Promise<void> {
  await evaluate(`document.getElementById("chart-drawer-shut").click()`);
  await clickEar();
  const twice = await settle(READ, (d) => d.open, "chart-drawer-twice");
  check(
    "CD3 the same survey is refused a second time, in the drawer's own voice, and the table is unmoved (ruled 2026-09-07)",
    twice.cuttings === 1 && twice.status === "this survey is already on the table" && twice.open,
    JSON.stringify({ cuttings: twice.cuttings, status: twice.status }),
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

  check(
    "CD7c the drawer's slide is pinned at the 0.32s the settle above waits out, so a regression that leaves the reader looking at an empty band for three seconds cannot sit inside a generous budget and pass (#578)",
    refused.slideMs === "0.32s",
    JSON.stringify({ slideMs: refused.slideMs, anims: refused.drawerAnims }),
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
