/* eslint-disable max-lines */
// The Chart Table's drawer (#520 Sub 2 of #401, direction D ruled at the #518 sitting): the dog-ear on the committed survey, the drawer it fills, the cap, and since #634 the table's two homes, the address deciding an arrival and the device a return. `chart-drawer` and never `drawer`: suite-room-drawer is the site's phone nav (#520 ruling 2).
import { makeSettle } from "./settle-support.ts";
import { makeStep } from "./step-support.ts";
import { makeStage, makeMouse } from "./home-support.ts";
import { slideRested, foldRested } from "../../src/cli/e2e-slide.ts";
import { SAY_HOLD_MS } from "../../src/site/shared/announce.ts";
// Imported and never restated: a key spelled twice is a clear that silently stops clearing the day the app's own key moves.
import { TABLE_STORE_KEY } from "../../src/site/shared/table-store.ts";
import type { Payload, Point, SuiteContext } from "./types.ts";

type Rect = { x: number; y: number; w: number; h: number; right: number; bottom: number };
type Read = { open: boolean; tabText: string | null; tabShown: boolean; count: string | null; cuttings: number; imgs: number; frames: number; titles: string[]; decoded: boolean[]; offs: number; offsReachable: number; offRects: { y: number; h: number }[]; lowestOff: number | null; minOffH: number; drawerAnims: string[]; slideMs: string | null; innerH: number; fullShown: boolean; roadDisabled: boolean; ear: { label: string | null; rect: Rect } | null; insetRect: Rect | null; insetSvgs: number; lastSvgIsSurvey: boolean; status: string; statusFadeMs: string | null; hashTable: string | null; rawHash: string; path: string; scrollW: number; innerW: number };
type Cam = { x: number; y: number; k: number };
type Ghost = { tag: string; src: string; pos: string; pe: string; translate: string; w: number; rotate: string; z: string; inMap: boolean };
type Carry = { ghost: Ghost | null; drag: boolean; open: boolean; receiving: boolean; folded: boolean; cuttings: number; landing: boolean; landingRuns: number; jolt: boolean; joltRuns: number; sel: number; cursor: string | null; cam: Cam | null; hashTable: string | null; status: string; innerH: number };
type Surfaces = { open: boolean; folded: boolean; tabShown: boolean; lifted: string[]; seats: Record<string, number>; slipX: number; slipW: number; slipAnims: string[]; lowestOff: number | null; minOffH: number; drawerAnims: string[]; innerH: number; leafTabsDisplay: string | null; leafTabBoxes: number };
type Slides = Pick<Read, "lowestOff" | "minOffH" | "drawerAnims" | "innerH">;
type Folds = Pick<Surfaces, "slipX" | "slipW" | "slipAnims">;
type Rested = (d: Surfaces, last: Surfaces | null) => boolean;
type Edge = { folded: boolean; tabShown: boolean; overlap: number; buttons: number[] };
type Leaf = { tabs: { text: string; selected: string | null; press: string | null }[]; leafTabsDisplay: string | null; leafShown: boolean; formShown: boolean; cuttingsInLeaf: boolean; cuttingsShown: boolean; cuttings: number; columns: number; countText: string | null; roadInSlip: boolean; roadPress: string | null; otherRoads: number };
type Card = { hits: number; shown: boolean; name: string | null; press: { text: string; dim: boolean; idx?: string; box: { x: number; y: number; w: number; h: number }; hit: string; disabled: boolean } | null; link: { hit: string; inActs: boolean } | null; actsRow: number; pressInActs: boolean; cuttings: number; prospects: number; titles: string[]; subs: string[]; imgs: number; decoded: boolean[]; frames: number; hashTable: string | null; seedBox: string | null; scrollW: number; innerW: number };
type Pp = { state: { year: number } | null; press: { text: string; dim: boolean; shown: boolean; centre: Point | null; hit: string; disabled: boolean } | null; count: string | null; inNote: boolean; roads: number; chartHref: string | null; hashTable: string | null };
type Stored = { stored: string | null };
type Back = Read & Stored & { marker: string | null; navType: string | null };

const SEED = 42;
// A camera settled deep enough to commit a band-3 inset, the same descent suite-region-detail drives.
const DEEP = "cx=0.5625&cy=0.4375&k=8";
const DRESS = `seed=${SEED}&style=antique&legend=1&arms=0&beasts=0`;

const READ: Payload<Read> = `(() => {
  const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, right: b.right, bottom: b.bottom }; };
  const drawer = document.getElementById("chart-drawer");
  const ear = document.querySelector("#map .region-inset .dog-ear");
  const inset = document.querySelector("#map .region-inset");
  return {
    open: !!drawer && drawer.classList.contains("open"),
    tabText: (document.getElementById("chart-drawer-tab") || {}).textContent || null,
    tabShown: (() => { const t = document.getElementById("chart-drawer-tab"); return !!t && getComputedStyle(t).display !== "none"; })(),
    count: (document.getElementById("chart-drawer-count") || {}).textContent || null,
    cuttings: document.querySelectorAll("#cuttings li").length,
    imgs: document.querySelectorAll("#cuttings img").length,
    frames: document.querySelectorAll("#cuttings .awaited").length,
    titles: [...document.querySelectorAll("#cuttings .label b")].map((b) => b.textContent),
    decoded: [...document.querySelectorAll("#cuttings img")].map((i) => i.naturalWidth > 0),
    offs: document.querySelectorAll("#cuttings .off").length,
    offsReachable: [...document.querySelectorAll("#cuttings .off")].filter((b) => { const r = b.getBoundingClientRect(); return document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)) === b; }).length,
    offRects: [...document.querySelectorAll("#cuttings .off")].map((b) => { const r = b.getBoundingClientRect(); return { y: +r.y.toFixed(2), h: +r.height.toFixed(2) }; }),
    lowestOff: (() => { const r = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect().y); return r.length ? Math.max(...r) : null; })(),
    minOffH: (() => { const r = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect().height); return r.length ? Math.min(...r) : 0; })(),
    drawerAnims: (() => { const d = document.getElementById("chart-drawer"); return d && d.getAnimations ? d.getAnimations().map((a) => a.playState) : []; })(),
    slideMs: (() => { const d = document.getElementById("chart-drawer"); return d ? getComputedStyle(d).animationDuration : null; })(),
    innerH: window.innerHeight,
    fullShown: (() => { const f = document.getElementById("chart-drawer-full"); return !!f && !f.hidden; })(),
    roadDisabled: (() => { const b = document.getElementById("table-road"); return !!b && b.disabled; })(),
    ear: ear ? { label: ear.getAttribute("aria-label"), rect: r("#map .region-inset .dog-ear") } : null,
    insetRect: r("#map .region-inset"),
    // The constraint the handle's markup is decided by: suite-region-detail reads the survey as the LAST svg in the inset.
    insetSvgs: document.querySelectorAll("#map .region-inset svg").length,
    lastSvgIsSurvey: (() => { const s = [...document.querySelectorAll("#map .region-inset svg")].pop(); return !!s && s.hasAttribute("data-vellum-region-u0"); })(),
    status: (document.getElementById("status") || {}).textContent || "",
    statusFadeMs: (() => { const s = document.getElementById("status"); return s ? getComputedStyle(s).transitionDuration : null; })(),
    hashTable: (new URLSearchParams(location.hash.slice(1))).get("table"),
    rawHash: location.hash,
    path: location.pathname,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  };
})()`;

// eslint-disable-next-line max-lines-per-function
export async function run(ctx: SuiteContext): Promise<void> {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, touch, touchPan, PORT } = ctx;
  const settle = makeSettle(ctx);
  // A group that only navigates needs no step: go()'s bounded loop returns rather than throwing.
  const step = makeStep(ctx);
  // A REAL press and release at the handle's own coordinates, never element.click(): a synthetic click dispatches straight at the node and ignores pointer-events, so it files a handle no reader could reach. The inset box is pointer-events: none, and that is exactly the defect this drives.
  const { clickAt } = makeStage(ctx);
  // A settle that waits on a REGION JOB is not waiting on a transition: the worker draws a whole survey, which is real work that scales with the runner. The default 120 tries is 6s, sized on a laptop, and CI ran this lane 2.7x slower than local on the run that timed out. 400 tries is 20s, the same order as TOUR_TIMEOUT_MS, which is itself sized at roughly 10x the slowest matrix measured on CI.
  const DRAWN = 400;
  const clickEar = async () => {
    const r = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (r) await clickAt(r.x, r.y);
    return r;
  };
  // Since #634 the table has a second home on the DEVICE, and this suite fills it on nearly every group: every arrival below that carries no table key would otherwise inherit whatever the group before it laid, which is a bleed inside one suite and not only across a lane. So an arrival is bare unless it says otherwise, and the four checks that are ABOUT the device seed it themselves. about:blank has no storage of its own, so the clear rides on the site's origin.
  const forget = async () => { try { await evaluate(`localStorage.removeItem(${JSON.stringify(TABLE_STORE_KEY)})`); } catch {} };
  const go = async (hash: string) => {
    await forget();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#${hash}` });
    for (let i = 0; i < 200; i++) { await sleep(150); if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`)) break; }
    await sleep(400);
  };
  const atInset = (d: Read) => !!d.ear && d.insetSvgs === 1;
  // No buttons at all reports pos at the viewport edge, not 0: 0 is inside the fold and would leave `size` alone rejecting a shut drawer.
  const asSlide = (d: Slides | null) => (d ? { pos: d.lowestOff === null ? d.innerH : d.lowestOff, size: d.minOffH, anims: d.drawerAnims, viewportH: d.innerH } : null);
  // @ts-expect-error the settle hands its predicate a read only once it is truthy, so asSlide(d) is never null here
  const drawerUp = (d: Slides, last: Slides | null) => slideRested(asSlide(d), asSlide(last));
  const asFold = (d: Folds | null) => (d ? { pos: d.slipX, size: d.slipW, anims: d.slipAnims } : null);
  // @ts-expect-error the settle hands its predicate a read only once it is truthy, so asFold(d) is never null here; the checker reports only a call's first bad argument, so asFold(from) below, a SURFACES read that is never null either, is reported the day this one is fixed
  const slipTravelled = (from: Folds) => (d: Folds, last: Folds | null) => foldRested(asFold(d), asFold(last),
    asFold(from));
  const both = (a: Rested, b: Rested) => (d: Surfaces, last: Surfaces | null) => a(d, last) && b(d, last);

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  await step("CD1", async () => {
    await go(`${DRESS}&${DEEP}`);
    const armed = await settle(READ, atInset, "chart-drawer-inset", DRAWN);
    const why = {
      ear: !!armed.ear, label: armed.ear && armed.ear.label === "lay this survey on the table",
      svgs: armed.insetSvgs === 1, isSurvey: armed.lastSvgIsSurvey, rect: !!armed.insetRect,
      top: !!armed.ear && !!armed.insetRect && armed.ear.rect.y >= armed.insetRect.y - 0.5,
      right: !!armed.ear && !!armed.insetRect && armed.ear.rect.right <= armed.insetRect.right + 0.5,
      shut: !armed.open, bare: armed.cuttings === 0, tab: armed.tabShown,
    };
    check(
      "CD1 the dog-ear rides the committed survey: labelled, inside the inset's own box so the place overlay's rect is untouched, and the inset still holds exactly ONE svg, which is what keeps suite-region-detail's .pop() on the survey (#518 ruling 3, #520)",
      !!armed.ear && armed.ear.label === "lay this survey on the table" && armed.insetSvgs === 1 && armed.lastSvgIsSurvey &&
        !!armed.insetRect && armed.ear.rect.y >= armed.insetRect.y - 0.5 && armed.ear.rect.right <= armed.insetRect.right + 0.5 &&
        // The size, not just the containment: the handle sits inside #map and is scaled by the live transform unless it counter-scales, and at k=8 it measured 435px for a 3.4rem box. Containment alone cannot see that, since an ear anchored top-right balloons DOWN and LEFT and stays inside. 54.4px is 3.4rem at a 16px root, and holds at every k by construction.
        Math.abs(armed.ear.rect.w - 54.4) <= 1.5 && Math.abs(armed.ear.rect.h - 54.4) <= 1.5 &&
        !armed.open && armed.cuttings === 0 && armed.tabShown,
      JSON.stringify({ ear: armed.ear, earSize: [armed.ear && armed.ear.rect.w, armed.ear && armed.ear.rect.h], insetSvgs: armed.insetSvgs, lastSvgIsSurvey: armed.lastSvgIsSurvey, inset: armed.insetRect, open: armed.open, tab: armed.tabText, tabShown: armed.tabShown, cuttings: armed.cuttings, why }),
    );
  });

  // The one read that crosses a step: CD4 reloads the address CD2 wrote, so if CD2 never laid a sheet, CD4 fails as CD4 rather than passing against a table nobody filled.
  let laid: Read | null = null;
  await step("CD2, CD2b, CD2c", async () => {
    const earAt = await clickEar();
    laid = await settle(READ, (d) => d.open && d.cuttings === 1, "chart-drawer-laid");
    check(
      "CD2 a click on the dog-ear lays the survey and ENDS with the drawer open (ruled 2026-09-07): one cutting with its own remove press, the count in period voice, the road to the Portfolio LIVE from the first sheet (it shipped disabled at #520 and #521 bound it), and the table written into the address",
      laid.open && laid.cuttings === 1 && laid.offs === 1 && laid.imgs === 1 &&
        laid.count === "one sheet laid · room for five more" && !laid.roadDisabled && !laid.fullShown &&
        typeof laid.hashTable === "string" && laid.hashTable.startsWith("k-s.seed-42") &&
        /lies on the table/.test(laid.status) && laid.scrollW === laid.innerW,
      JSON.stringify({ open: laid.open, cuttings: laid.cuttings, count: laid.count, road: laid.roadDisabled, hash: laid.hashTable, status: laid.status }),
    );
    await shoot("chart-drawer-1280-open.png");

    check(
      "CD2b the handle answers a REAL pointer: the inset box is pointer-events: none, so the corner must restore it or the survey files for a synthetic click and for nobody else (#520 goal: with a click or a tap, everywhere)",
      !!earAt && (await evaluate<string>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return "no-ear"; const b = e.getBoundingClientRect(); const hit = document.elementFromPoint(Math.round(b.x + b.width * 0.72), Math.round(b.y + b.height * 0.28)); return hit === e ? "ear" : (hit ? hit.tagName + "." + String(hit.className.baseVal ?? hit.className).split(" ")[0] : "none"); })()`)) === "ear",
      JSON.stringify({ clickedAt: earAt }),
    );

    const beforeDbl = await evaluate<{ k: number; band: number | null }>(`(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`);
    const dblAt = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (dblAt) {
      for (const clickCount of [1, 2]) {
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x: dblAt.x, y: dblAt.y, button: "left", clickCount });
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: dblAt.x, y: dblAt.y, button: "left", clickCount });
      }
    }
    await sleep(900);
    const afterDbl = await evaluate<{ k: number; band: number | null }>(`(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`);
    check(
      "CD2c a rapid double click on the handle does not become d3's double-click-to-zoom, the same rule Z10b pins for the zoom cluster (#520 build item 2)",
      !!dblAt && afterDbl.k === beforeDbl.k && afterDbl.band === beforeDbl.band,
      JSON.stringify({ before: beforeDbl, after: afterDbl }),
    );
  });

  // Derived 2026-09-13: SAY_HOLD_MS + SAY_FADE_MS is 8.45s (src/site/shared/announce.ts), which is 169 polls of pure sleep before a single evaluate round-trip is counted; 400 tries is 20s of sleep alone, the same order of headroom DRAWN carries for the CI runner measured 2.7x slower than local.
  const SAID_GONE = 400;
  // A FLOOR, never a ceiling: a slow runner delays the clear and can only push this up, where a wall-clock ceiling on a runner-dependent measurement is RS30's own scar. 1s under the ruled hold covers the press, the read and the probe that stand between the announcement and the clock starting; the number moves with the constant, and the literal 8000 is pinned in test/site/announce.test.ts.
  const HOLD_FLOOR = SAY_HOLD_MS - 1000;
  await step("CD23", async () => {
    // The sheet comes off and goes back on, so what is timed is the LAY line the issue was filed about and not the refusal CD2c happened to leave, and the clock starts at a known press (skeptic rounds 1 and 2 on PR #584). The table is back to the one cutting CD2 laid, which is the state CD3, CD4 and CD5 read.
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    await clickEar();
    const saidAt = Date.now();
    const said = await evaluate(READ);
    // The rule's resolved answer, not the app's timing: the class is put on with the transition suppressed inline, so the value read is the one the CASCADE gives and a later arm re-raising opacity cannot hide behind the JS clearing the text anyway (skeptic on PR #584).
    const fadeProbe = await evaluate<{ rest: string; faded: string }>(`(() => { const s = document.getElementById("status"); const was = s.style.transition; s.style.transition = "none"; const rest = getComputedStyle(s).opacity; s.classList.add("fading"); const faded = getComputedStyle(s).opacity; s.classList.remove("fading"); s.style.transition = was; return { rest, faded }; })()`);
    const gone = await settle(READ, (d) => d.status === "", "chart-drawer-said-gone", SAID_GONE);
    const waited = Date.now() - saidAt;
    check(
      "CD23 the Chart Table's announcement leaves the chart by itself: the LAY line #547 was filed about, which sat over the middle of the sheet until the reader drew another world, since shutting the drawer never took it away (Alex 2026-09-08). The removal press above is wiring and not the gesture under test, which is CD5's and CD7b's. The table is untouched as the line goes, so this is the LINE leaving and not the page resetting; the hold is floored a second under the eight Alex ruled, a floor and never a ceiling since a slower runner can only lengthen it, with the literal 8000 pinned in test/site/announce.test.ts; and the fade is read twice, as the declared duration the way CD7c pins the drawer's slide, and as the opacity the cascade actually resolves under the class",
      /lies on the table/.test(said.status) && gone.status === "" &&
        gone.cuttings === said.cuttings && gone.open === said.open &&
        said.statusFadeMs === "0.45s" && fadeProbe.rest === "1" && fadeProbe.faded === "0" &&
        waited >= HOLD_FLOOR,
      JSON.stringify({ said: said.status, after: gone.status, waitedMs: waited, floor: HOLD_FLOOR, cuttings: [said.cuttings, gone.cuttings], open: [said.open, gone.open], fadeMs: said.statusFadeMs, opacity: fadeProbe }),
    );
  });

  await step("CD3", async () => {
    await evaluate(`document.getElementById("chart-drawer-shut").click()`);
    await clickEar();
    const twice = await settle(READ, (d) => d.open, "chart-drawer-twice");
    check(
      "CD3 the same survey is refused a second time, in the drawer's own voice, and the table is unmoved (ruled 2026-09-07)",
      twice.cuttings === 1 && twice.status === "this survey is already on the table" && twice.open,
      JSON.stringify({ cuttings: twice.cuttings, status: twice.status }),
    );
  });


  // Issue #523 Sub 5: the desktop drag, the settle and the jolt, ruled 2026-09-21. The camera is d3's {x, y, k} and every Broadside fold schedules a room layout 340ms later that re-seats x/y (FOLD_SETTLE_MS in src/site/shared/slip.ts), so every drag check below holds the FOLD constant across its two reads (the Broadside already folded before the press), takes each read at REST (two reads 50ms apart agreeing, with no ghost and no settle in flight), and compares k exactly with x and y inside half a pixel: a no-change refit is a float round trip through the camera bridge, a d3 pan is the carry's own delta in the hundreds of px, and k alone (CD2c's read) cannot tell a pan at all.
  const { press, moveTo, release } = makeMouse(ctx);
  const CARRY: Payload<Carry> = `(() => {
    const g = document.querySelector(".sheet-ghost");
    const d = document.getElementById("chart-drawer");
    const li = document.querySelector("#cuttings li.landing");
    const cut = document.getElementById("cuttings");
    const cam = window.__vellumZoomState ? window.__vellumZoomState() : null;
    return {
      ghost: g ? { tag: g.tagName, src: g.src.slice(0, 5), pos: getComputedStyle(g).position, pe: getComputedStyle(g).pointerEvents, translate: g.style.translate, w: g.offsetWidth, rotate: getComputedStyle(g).rotate, z: getComputedStyle(g).zIndex, inMap: !!g.closest("#map") } : null,
      drag: document.body.classList.contains("sheet-drag"),
      open: d.classList.contains("open"), receiving: d.classList.contains("receiving"),
      folded: document.querySelector(".slip").classList.contains("folded"),
      cuttings: document.querySelectorAll("#cuttings li").length,
      landing: !!li, landingRuns: li ? li.getAnimations().filter((a) => a.playState === "running").length : 0,
      jolt: cut.classList.contains("jolt"), joltRuns: cut.classList.contains("jolt") ? cut.getAnimations().filter((a) => a.playState === "running").length : 0,
      sel: String(getSelection()).length,
      cursor: (() => { const e = document.elementFromPoint(640, 300); return e ? getComputedStyle(e).cursor : null; })(),
      cam: cam ? { x: +cam.x.toFixed(3), y: +cam.y.toFixed(3), k: cam.k } : null,
      hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      status: (document.getElementById("status") || {}).textContent || "",
      innerH: window.innerHeight,
    };
  })()`;
  const sameCam = (a: Cam | null, b: Cam | null) => !!a && !!b && a.k === b.k && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
  const atRest = (d: Carry, last: Carry | null) => !!last && !d.ghost && !d.landing && sameCam(d.cam, last.cam) && d.cuttings === last.cuttings;
  const earPoint = () => evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
  // The band's own centre: the drawer's seat is its height from the foot of the viewport (bandOf in src/site/explorer/table-drag.ts), so a release here is inside it at any viewport height.
  const bandPoint = () => evaluate<Point>(`({ x: 640, y: window.innerHeight - 120 })`);
  // The settle's declared duration, read the CD23 way: the class is put on a scratch cutting with transitions suppressed, the cascade's answer is read, and the class comes off again.
  const DURATION: Payload<string | null> = `(() => { const li = document.querySelector("#cuttings li"); if (!li) return null; li.classList.add("landing"); const v = getComputedStyle(li).animationDuration; li.classList.remove("landing"); return v; })()`;
  const carry = async (to: Point) => {
    const from = await earPoint();
    if (!from) throw new Error("no dog-ear to carry from");
    await press(from.x, from.y);
    await moveTo(from, to);
    await sleep(120);
    const mid = await evaluate(CARRY);
    return { from, to, mid };
  };
  /** Polls to rest while remembering whether the class was ever seen with its animation running: the settle is 340ms and the poll is 50ms, so a settle that plays is seen and a settle that never plays is not. */
  const restSeeing = async (label: string, flag: "landingRuns" | "joltRuns") => {
    let saw = false;
    const d = await settle(CARRY, (x, last) => { if (x[flag] > 0) saw = true; return atRest(x, last); }, label);
    return { ...d, saw };
  };

  // The slip at rest with the drawer shut and the Broadside folded: the fold's own transition has ended and the room layout it schedules has had its 340ms.
  const FOLDREST: Payload<{ folded: boolean; open: boolean; slipX: number; anims: string[] }> = `(() => { const s = document.querySelector(".slip"); return { folded: s.classList.contains("folded"), open: document.getElementById("chart-drawer").classList.contains("open"), slipX: +s.getBoundingClientRect().x.toFixed(2), anims: s.getAnimations().map((a) => a.playState) }; })()`;
  const shutAndFold = async (label: string) => {
    await evaluate(`document.getElementById("chart-drawer-shut").click()`);
    await sleep(400);
    await evaluate(`(() => { const s = document.querySelector(".slip"); if (!s.classList.contains("folded")) document.querySelector(".slip-fold").click(); })()`);
    // A finished transition stays in getAnimations() (the shape src/cli/e2e-slide.ts reads), and a slip that was folded already has none: rest is every entry finished and the edge still across two reads.
    await settle(FOLDREST, (d, last) => d.folded && !d.open && d.anims.every((s) => s === "finished") && !!last && d.slipX === last.slipX, label);
    await sleep(400);
  };

  await step("CD44", async () => {
    // Off first: CD3 left the ear's own survey on the table, and a carry of it would be refused as already.
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    await shutAndFold("chart-drawer-carry-folded");
    const before = await settle(CARRY, atRest, "chart-drawer-carry-rest");
    const target = await bandPoint();
    const { mid, to } = await carry(target);
    await release(to.x, to.y);
    const landed = await restSeeing("chart-drawer-carried", "landingRuns");
    const duration = await evaluate(DURATION);
    check(
      "CD44 a REAL mouse carry from the dog-ear into the drawer's band files the survey: mid-carry the ghost is the thumbnail as a fixed blob img at pointer-events none, seated on body and never inside #map, hanging from the corner the reader took it by (its inline translate puts the pointer GRIP_INSET_PX inside its top-right corner, read from the seat and not from the rect, which is a rotated box's bounding box), the body carries the drag state with the cursor grabbing and nothing selected, and the drawer, SHUT at the press, opened with the drop cue as the sheet entered the band (D4); on release the cutting lands with its settle seen running and then retired, the address carries the table, the line is said, the ghost and the drag state are gone, and the camera is at rest where it was, which is the pan the ear's stopped mousedown keeps from d3 (Issue #523, ruled 2026-09-21)",
      before.cuttings === 0 && before.folded && !before.open &&
        !!mid.ghost && mid.ghost.tag === "IMG" && mid.ghost.src === "blob:" && mid.ghost.pos === "fixed" && mid.ghost.pe === "none" && !mid.ghost.inMap &&
        Math.abs(parseFloat(mid.ghost.translate) + mid.ghost.w - 10 - to.x) <= 1 && Math.abs(parseFloat(mid.ghost.translate.split(" ")[1]) + 10 - to.y) <= 1 &&
        mid.ghost.rotate === "-6deg" && mid.ghost.z === "30" &&
        mid.drag && mid.cursor === "grabbing" && mid.sel === 0 && mid.open && mid.receiving &&
        landed.cuttings === 1 && landed.saw && !landed.landing && !landed.ghost && !landed.drag && !landed.receiving &&
        typeof landed.hashTable === "string" && landed.hashTable.startsWith("k-s.seed-42") && /lies on the table/.test(landed.status) &&
        // @ts-expect-error the duration reads null only with no cutting on the table, and parseFloat(null) is NaN, which reads this comparison false and reds the check by name
        sameCam(before.cam, landed.cam) && landed.folded && parseFloat(duration) === 0.34,
      JSON.stringify({ before: { cuttings: before.cuttings, folded: before.folded, open: before.open, cam: before.cam }, mid, to, landed: { cuttings: landed.cuttings, saw: landed.saw, landing: landed.landing, ghost: landed.ghost, drag: landed.drag, hashTable: landed.hashTable, status: landed.status, cam: landed.cam, folded: landed.folded }, duration }),
    );
  });

  await step("CD45", async () => {
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    await shutAndFold("chart-drawer-snap-folded");
    const before = await settle(CARRY, atRest, "chart-drawer-carry-shut-rest");
    const { from, mid, to } = await carry({ x: 640, y: 300 });
    await release(to.x, to.y);
    const snapped = await settle(CARRY, atRest, "chart-drawer-snapped");
    await press(from.x, from.y);
    await moveTo(from, { x: from.x - 10, y: from.y + 10 }, 4);
    await moveTo({ x: from.x - 10, y: from.y + 10 }, from, 4);
    await release(from.x, from.y);
    const jiggled = await settle(CARRY, atRest, "chart-drawer-jiggled");
    await clickAt(from.x, from.y);
    const clicked = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-plain-click");
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    await shutAndFold("chart-drawer-after-snap-folded");
    check(
      "CD45 a carry released over the chart files nothing: the ghost rode the pointer with the drawer still SHUT (D4: it opens only as the sheet enters the band), then snapped back and is gone, the table is bare and the address carries no key, the drawer is back as it was and the camera is at rest where it was; a jiggle released back on the ear files nothing either, since the click that follows a drag is swallowed; and a plain click straight after still files, so the swallow is scoped to its own gesture and never eats the next honest click (Issue #523, ruled 2026-09-21)",
      before.cuttings === 0 && !before.open && before.folded &&
        !!mid.ghost && mid.drag && !mid.open && !mid.receiving &&
        snapped.cuttings === 0 && !snapped.ghost && !snapped.drag && !snapped.open && snapped.hashTable === null && sameCam(before.cam, snapped.cam) &&
        jiggled.cuttings === 0 && !jiggled.ghost && !jiggled.open && sameCam(before.cam, jiggled.cam) &&
        clicked.cuttings === 1 && clicked.open,
      JSON.stringify({ before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam }, mid: { ghost: !!mid.ghost, drag: mid.drag, open: mid.open, receiving: mid.receiving }, snapped: { cuttings: snapped.cuttings, ghost: snapped.ghost, drag: snapped.drag, open: snapped.open, hashTable: snapped.hashTable, cam: snapped.cam }, jiggled: { cuttings: jiggled.cuttings, ghost: jiggled.ghost, open: jiggled.open, cam: jiggled.cam }, clicked: { cuttings: clicked.cuttings, open: clicked.open } }),
    );
  });

  await step("CD46", async () => {
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const reduced = await evaluate<boolean>(`matchMedia("(prefers-reduced-motion: reduce)").matches`);
    const target = await bandPoint();
    const { to } = await carry(target);
    await release(to.x, to.y);
    const landed = await settle(CARRY, (d, last) => d.cuttings === 1 && atRest(d, last), "chart-drawer-reduced-landed");
    const duration = await evaluate(DURATION);
    await send("Emulation.setEmulatedMedia", { features: [] });
    check(
      "CD46 under reduced motion a carry still files and the settle collapses to an instant place: the cutting lands, its class retires, and the settle's declared duration reads the blanket's near-zero against CD44's 0.34s in the same run, which is the same-run control that makes the emulation a measurement (Issue #523; motion.css's blanket)",
      // @ts-expect-error the duration reads null only with no cutting on the table, and parseFloat(null) is NaN, which reads this comparison false and reds the check by name
      reduced === true && landed.cuttings === 1 && !landed.landing && !landed.ghost && parseFloat(duration) < 0.01,
      JSON.stringify({ reduced, cuttings: landed.cuttings, landing: landed.landing, ghost: landed.ghost, duration }),
    );
  });

  await step("CD4", async () => {
    if (!laid) throw new Error("CD2 never laid a sheet, so this reload has no table to restore");
    const carried = laid.hashTable;
    await go(`${DRESS}&table=${carried}`);
    const cold = await evaluate(READ);
    await evaluate(`document.getElementById("chart-drawer-tab").click()`);
    const filled = await settle(READ, (d) => d.imgs >= 1 && d.decoded.every(Boolean), "chart-drawer-filled", DRAWN);
    check(
      "CD4 a reload restores the table from the address alone, showing a reserved frame named from the chart number, and the picture is drawn when the drawer is OPENED rather than on load (ruled 2026-09-07)",
      cold.cuttings === 1 && cold.imgs === 0 && cold.frames === 1 && cold.titles[0] === "Chart № 42" && !cold.open &&
        filled.imgs === 1 && filled.frames === 0 && filled.decoded[0] === true && filled.titles[0] !== "Chart № 42",
      JSON.stringify({ cold: { cuttings: cold.cuttings, imgs: cold.imgs, frames: cold.frames, titles: cold.titles }, filled: { imgs: filled.imgs, titles: filled.titles, decoded: filled.decoded } }),
    );
  });

  await step("CD5", async () => {
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    const bare = await settle(READ, (d) => d.cuttings === 0, "chart-drawer-bare");
    check(
      "CD5 a cutting comes off by its own press and the room is ANNOUNCED, since the press that did it leaves the page with it, and an EMPTY table writes no key at all rather than growing table= onto every link forever (#520 ruling 1)",
      bare.cuttings === 0 && bare.count === "the table is bare" && bare.hashTable === null && bare.rawHash.indexOf("table=") === -1 &&
        /is off the table/.test(bare.status),
      JSON.stringify({ cuttings: bare.cuttings, count: bare.count, hashTable: bare.hashTable, status: bare.status }),
    );
  });

  const SIX = ["rung-1.lx-4.ly-4", "rung-1.lx-3.ly-3", "rung-2.lx-5.ly-5", "rung-2.lx-6.ly-6", "rung-3.lx-11.ly-11", "rung-3.lx-12.ly-12"]
    .map((seat) => `k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.${seat}`).join("_");
  await step("CD7, CD7b, CD7c", async () => {
    await go(`${DRESS}&${DEEP}&table=${SIX}`);
    const atSix = await settle(READ, atInset, "chart-drawer-six", DRAWN);
    await clickEar();
    const refused = await settle(READ, drawerUp, "chart-drawer-open");
    check(
      "CD7 at the cap the handle refuses in the voice #518 ruling 3 wrote, lays nothing, and says so where the reader is told everything else (#520 build item 5)",
      atSix.cuttings === 6 && !!atSix.ear && atSix.ear.label === "the table is full: six sheets lie on it" &&
        refused.cuttings === 6 && refused.status === "the table is full: six sheets lie on it" && refused.fullShown,
      JSON.stringify({ before: atSix.cuttings, label: atSix.ear && atSix.ear.label, after: refused.cuttings, status: refused.status, full: refused.fullShown }),
    );

    check(
      "CD7b with the drawer open at a FULL table every remove press answers a real pointer: the Broadside is fixed above this drawer and reaches into its band, and the cuttings overlap each other by design, so three of six once hit-tested to the form behind them and to a neighbour's paper label",
      refused.cuttings === 6 && refused.offs === 6 && refused.offsReachable === 6,
      JSON.stringify({ cuttings: refused.cuttings, offs: refused.offs, reachable: refused.offsReachable, open: refused.open, rects: refused.offRects, innerH: refused.innerH, slideMs: refused.slideMs, anims: refused.drawerAnims }),
    );

    check(
      "CD7c the drawer's slide is pinned at the 0.32s the settle above waits out, so a regression that leaves the reader looking at an empty band for three seconds cannot sit inside a generous budget and pass (#578)",
      refused.slideMs === "0.32s",
      JSON.stringify({ slideMs: refused.slideMs, anims: refused.drawerAnims }),
    );
  });

  await step("CD47", async () => {
    // The drawer is open and the Broadside folded from CD7's refusal, so the fold is constant across the carry.
    const before = await settle(CARRY, atRest, "chart-drawer-cap-rest");
    const target = await bandPoint();
    const { mid, to } = await carry(target);
    await release(to.x, to.y);
    const refusedCarry = await restSeeing("chart-drawer-cap-carried", "joltRuns");
    check(
      "CD47 a carry dropped on a FULL table is refused the way a click is: the six stay six, the cap's line is said, the sheets on the table jolt (seen running, then retired; D3 ruled 2026-09-21) while the drawer itself stays put, the ghost snaps back and is gone rather than stranded on the refusal, and the camera is at rest where it was (Issue #523)",
      before.cuttings === 6 && before.open && before.folded && !!mid.ghost && mid.receiving &&
        refusedCarry.cuttings === 6 && refusedCarry.status === "the table is full: six sheets lie on it" && refusedCarry.saw && !refusedCarry.jolt &&
        !refusedCarry.ghost && !refusedCarry.drag && refusedCarry.open && sameCam(before.cam, refusedCarry.cam),
      JSON.stringify({ before: { cuttings: before.cuttings, open: before.open, folded: before.folded, cam: before.cam }, mid: { ghost: !!mid.ghost, receiving: mid.receiving }, after: { cuttings: refusedCarry.cuttings, status: refusedCarry.status, saw: refusedCarry.saw, jolt: refusedCarry.jolt, ghost: refusedCarry.ghost, drag: refusedCarry.drag, open: refusedCarry.open, cam: refusedCarry.cam } }),
    );
  });

  await step("CD8", async () => {
    await evaluate(`window.__vellumZoomTo({ x: 0, y: 0, k: 1 })`);
    const home = await settle(READ, (d) => !d.ear, "chart-drawer-home");
    check(
      "CD8 going home drops the inset and the dog-ear with it: the handle never outlives the survey it belongs to, and the table it filled is untouched (#520 build item 2)",
      home.ear === null && home.insetSvgs === 0 && home.cuttings === 6,
      JSON.stringify({ ear: home.ear, insetSvgs: home.insetSvgs, cuttings: home.cuttings }),
    );
  });

  // CD9 / CD11 / CD12 (#543, Alex 2026-09-08): the Broadside and the Chart Table are never open together and nothing is lifted onto the chart, because covering the caption and the roads out while leaving the side panel standing made no sense to the reader.
  const SURFACES: Payload<Surfaces> = `(() => {
    const slip = document.querySelector(".slip");
    const tab = document.querySelector(".slip-tab");
    const sheet = document.querySelector("#map svg").getBoundingClientRect();
    const onSheet = (b) =>
      Math.max(0, Math.min(b.right, sheet.right) - Math.max(b.left, sheet.left)) *
      Math.max(0, Math.min(b.bottom, sheet.bottom) - Math.max(b.top, sheet.top)) > 0;
    const name = (e) => (e.id ? "#" + e.id : "." + String(e.className || e.tagName).trim().split(/\\s+/).join("."));
    const lifted = [...document.querySelectorAll(".corner.bl.folio, .corner.br.zoomery, .legend:not(.in-slip)")]
      .filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0.5 && b.height > 0.5 && onSheet(b); })
      .map(name);
    // The seat itself, as a distance up from the foot of the window: the lift wrote a bottom offset, and the room's fit follows
    // the furniture, so a lifted piece can end up clear of a chart that shrank to accommodate it. The seat cannot lie.
    const seats = Object.fromEntries([...document.querySelectorAll(".corner.bl.folio, .legend:not(.in-slip)")]
      .map((e) => [name(e), +(window.innerHeight - e.getBoundingClientRect().bottom).toFixed(1)]));
    const drawer = document.getElementById("chart-drawer");
    const sb = slip.getBoundingClientRect();
    const offs = [...document.querySelectorAll("#cuttings .off")].map((b) => b.getBoundingClientRect());
    return {
      open: drawer.classList.contains("open"),
      folded: slip.classList.contains("folded"),
      tabShown: !!tab && getComputedStyle(tab).display !== "none",
      lifted, seats,
      slipX: +sb.x.toFixed(2), slipW: +sb.width.toFixed(2), slipAnims: slip.getAnimations().map((a) => a.playState),
      lowestOff: offs.length ? Math.max(...offs.map((o) => o.y)) : null,
      minOffH: offs.length ? Math.min(...offs.map((o) => o.height)) : 0,
      drawerAnims: drawer.getAnimations().map((a) => a.playState),
      innerH: window.innerHeight,
      // leafTabs*, never tabShown: this payload's tabShown is the Broadside's bookmark tab and READ's is the drawer's edge tab, so a third "tab" would be read as one of those two within the week (#547).
      leafTabsDisplay: (() => { const t = document.querySelector(".slip-head .sheet-tabs"); return t ? getComputedStyle(t).display : null; })(),
      leafTabBoxes: [...document.querySelectorAll(".slip-head .sheet-tabs button")].filter((b) => b.getBoundingClientRect().height > 0.5).length,
    };
  })()`;

  // Its own one-shot payload rather than three more fields on SURFACES: that one is polled by four settles here and read again by the CD13 and CD18 steps, and riding it measured 1.73s on this suite against a 0.7s run-to-run spread (2026-09-19, three runs each side).
  const SEATS: Payload<{ tableLeafDisplay: string | null; tableLeafH: number | null; legendDockDisplay: string | null }> = `(() => {
    const leaf = document.getElementById("table-leaf");
    const dock = document.querySelector(".slip .legend-dock");
    return {
      tableLeafDisplay: leaf ? getComputedStyle(leaf).display : null,
      tableLeafH: leaf ? +leaf.getBoundingClientRect().height.toFixed(2) : null,
      legendDockDisplay: dock ? getComputedStyle(dock).display : null,
    };
  })()`;
  // eslint-disable-next-line max-lines-per-function
  await step("CD9, CD11, CD12, CD22, CD43", async () => {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await go(`${DRESS}&table=${SIX}`);
    const beforeOpen = await evaluate(SURFACES);
    const seats = await evaluate(SEATS);
    await evaluate(`document.getElementById("chart-drawer-tab").click()`);
    const withOpen = await settle(SURFACES, both(drawerUp, slipTravelled(beforeOpen)), "chart-drawer-tab-open");
    await evaluate(`document.getElementById("chart-drawer-shut").click()`);
    const afterShut = await settle(SURFACES, slipTravelled(withOpen), "chart-drawer-slip-back");
    await go(`${DRESS}&table=${SIX}`);
    const beforeFold = await evaluate(SURFACES);
    await evaluate(`document.querySelector(".slip-fold").click()`);
    await settle(SURFACES, slipTravelled(beforeFold), "chart-drawer-slip-folded");
    await evaluate(`document.getElementById("chart-drawer-tab").click()`);
    await settle(SURFACES, drawerUp, "chart-drawer-tab-open-folded");
    await evaluate(`document.getElementById("chart-drawer-shut").click()`);
    // Measured 2026-09-13: onto an ALREADY folded slip the shut press animates nothing at all, leaving display:none and an empty getAnimations() in the same frame, so there is no rest here to poll for.
    const afterShutFolded = await evaluate(SURFACES);

    check(
      "CD9 opening the Chart Table folds the Broadside and takes its tab off the edge: the two are never open together, which is what stops them fighting for the right edge, the drawer's band and the chart's foot (#543, ruled 2026-09-08)",
      !beforeOpen.folded && withOpen.open && withOpen.folded && !withOpen.tabShown,
      JSON.stringify({ before: beforeOpen, open: withOpen }),
    );
    check(
      "CD22 at 1280 the sheet's head carries NO leaf tabs: they are the phone's way into the table, .sheet-tabs was dressed only inside the 900px block, and the Broadside is open here, so a folded sheet cannot be what is hiding them (#547, and the desktop arm CD14/CD15/CD16 never had)",
      !beforeOpen.folded && beforeOpen.leafTabsDisplay === "none" && beforeOpen.leafTabBoxes === 0,
      JSON.stringify({ folded: beforeOpen.folded, display: beforeOpen.leafTabsDisplay, boxes: beforeOpen.leafTabBoxes, slipW: beforeOpen.slipW }),
    );
    check(
      "CD43 at 1280 neither the phone's table leaf nor the legend dock is drawn: both are rendered at every width and dressed only inside the 900px block, so each stood as a block element no rule reached (#583, the mirror of CD22). The computed display is the BITING read and the height beside it is corroboration only, because the leaf is empty here with its cuttings in the shut drawer and so measures zero either way; the Broadside is read open in the same snapshot, so a folded sheet cannot be what is hiding them",
      !beforeOpen.folded && seats.tableLeafDisplay === "none" && seats.legendDockDisplay === "none" && seats.tableLeafH === 0,
      JSON.stringify({ folded: beforeOpen.folded, leaf: seats.tableLeafDisplay, leafH: seats.tableLeafH, dock: seats.legendDockDisplay }),
    );
    check(
      "CD11 shutting the Chart Table gives the Broadside back to the reader who had it, and leaves it folded for the reader who did not",
      !afterShut.open && !afterShut.folded && !afterShutFolded.open && afterShutFolded.folded,
      JSON.stringify({ hadItOpen: afterShut, hadItFolded: afterShutFolded }),
    );
    // Both readings are taken with the Broadside ALREADY folded, so the drawer's own fold is a no-op and only the drawer could move the furniture.
    await go(`${DRESS}&table=${SIX}`);
    const beforeSeats = await evaluate(SURFACES);
    await evaluate(`document.querySelector(".slip-fold").click()`);
    const seatsShut = (await settle(SURFACES, slipTravelled(beforeSeats), "chart-drawer-seats-folded")).seats;
    await evaluate(`document.getElementById("chart-drawer-tab").click()`);
    const seatsOpen = (await settle(SURFACES, drawerUp, "chart-drawer-seats-open")).seats;
    const names = Object.keys(seatsShut);
    check(
      "CD12 opening the drawer does not move the chart's furniture: the caption and the roads out keep the seat they had and the drawer covers them, rather than being lifted onto the sheet where they cannot be read (#543 Fault 1, ruled 2026-09-08)",
      names.length === 2 && names.every((k) => Math.abs(seatsOpen[k] - seatsShut[k]) < 1) && withOpen.lifted.length === 0,
      JSON.stringify({ shut: seatsShut, open: seatsOpen, lifted: withOpen.lifted }),
    );
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // CD13 (#543): folded, the camera comes home to --chrome-x where the tab already stands, and the tab's z-19 over the corner's z-10 wins the pointer, so this is a reachability check.
  const EDGE: Payload<Edge> = `(() => {
    const tab = document.getElementById("chart-drawer-tab");
    const zoom = document.querySelector(".corner.br.zoomery");
    const tb = tab.getBoundingClientRect(), zb = zoom.getBoundingClientRect();
    const overlap =
      Math.max(0, Math.min(tb.right, zb.right) - Math.max(tb.left, zb.left)) *
      Math.max(0, Math.min(tb.bottom, zb.bottom) - Math.max(tb.top, zb.top));
    const reach = (el) => {
      const b = el.getBoundingClientRect();
      let ok = 0, all = 0;
      for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
        const h = document.elementFromPoint(Math.round(b.x + b.width * i / 10), Math.round(b.y + b.height * j / 10));
        all++; if (h === el || el.contains(h)) ok++;
      }
      return Math.round(100 * ok / all);
    };
    return { folded: document.querySelector(".slip").classList.contains("folded"),
      tabShown: getComputedStyle(tab).display !== "none",
      overlap: +overlap.toFixed(0),
      buttons: [...zoom.querySelectorAll(".zoom-btn")].map((b) => reach(b)) };
  })()`;
  const edge: Record<string, Edge> = {};
  await step("CD13", async () => {
    for (const [w, h] of [[1520, 872], [1280, 800], [901, 800]]) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
      await go(DRESS);
      const beforeFold = await evaluate(SURFACES);
      await evaluate(`document.querySelector(".slip-fold").click()`);
      await settle(SURFACES, slipTravelled(beforeFold), `chart-drawer-edge-fold-${w}x${h}`);
      edge[`${w}x${h}`] = await evaluate(EDGE);
    }
    const edges = Object.keys(edge);
    check(
      "CD13 with the Broadside folded the drawer's tab does not stand on the camera: the tab is z-19 over the corner's z-10, so an overlap is not untidiness, it is the + and the home press answering the tab instead (#543, Alex 2026-09-08)",
      edges.length === 3 && edges.every((k) => edge[k].folded && edge[k].tabShown && edge[k].overlap === 0 && edge[k].buttons.length === 3 && edge[k].buttons.every((r) => r === 100)),
      JSON.stringify(edge),
    );
  });
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // CD18 / CD19 / CD20 (#521 Sub 3): the road the table has carried disabled since #520 turns on, and the Portfolio
  // drafts what it carries. The page reads the table from its OWN address once at load and never rewrites it.
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await go(`${DRESS}&table=${SIX}`);
  await step("CD18", async () => {
    const beforeRoad = await evaluate(SURFACES);
    await evaluate(`document.getElementById("chart-drawer-tab").click()`);
    await settle(SURFACES, both(drawerUp, slipTravelled(beforeRoad)), "chart-drawer-road-open");
    const roadOn = await evaluate<{ disabled: boolean; stamp: string | null }>(`(() => { const b = document.getElementById("table-road"); return { disabled: b.disabled, stamp: (document.getElementById("table-road-stamp") || {}).textContent || null }; })()`);
    check(
      "CD18 with sheets on the table the road to the Portfolio turns on: #520 shipped it disabled with the stamp saying the portfolio is not yet bound, and this sub is what binds it (#521)",
      roadOn.disabled === false,
      JSON.stringify(roadOn),
    );
  });
  const roadBefore = await evaluate<boolean>(`document.getElementById("table-road").disabled`);
  const roadAt = await evaluate<{ x: number; y: number; reachable: boolean }>(`(() => { const b = document.getElementById("table-road"); const r = b.getBoundingClientRect();
    const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2);
    const h = document.elementFromPoint(x, y);
    return { x, y, reachable: h === b || b.contains(h) }; })()`);
  if (roadAt) await clickAt(roadAt.x, roadAt.y); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`location.pathname.indexOf("/portfolio/") !== -1`)) break; }
  const arrived = await evaluate<{ path: string; table: string | null }>(`({ path: location.pathname, table: new URLSearchParams(location.hash.slice(1)).get("table") })`);
  check(
    "CD18b the road answers a REAL press and carries the WHOLE gathering in the Portfolio's own address, which is the epic's core insight: the folio is a link, so the page it lands on can draft the same six sheets for anyone",
    arrived.path.indexOf("/print-room/portfolio/") !== -1 && typeof arrived.table === "string" && arrived.table.split("_").length === 6 &&
      !!roadAt && roadAt.reachable, // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    JSON.stringify({ ...arrived, roadBefore, roadAt }),
  );
  const PF: Payload<{ items: number; drawn: number; rows: number; groups: number; heads: string[]; onStage: boolean; folio: string | null; bound: string | null } | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
    rows: document.querySelectorAll("#pf-contents .row").length,
    groups: document.querySelectorAll("#pf-contents .group-head").length,
    heads: [...document.querySelectorAll("#pf-contents .group-head span:first-child")].map((e) => e.textContent),
    onStage: !!document.querySelector("#pf-sheet svg"),
    folio: (document.getElementById("folio-title") || {}).textContent || null,
    bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;
  let pf = await evaluate(PF);
  for (let i = 0; i < DRAWN && (!pf || pf.drawn < 6); i++) { await sleep(50); pf = await evaluate(PF); }
  check(
    "CD19 the Portfolio drafts every gathered sheet from its own number, groups the index by world under the parent world's NAME, and stands one sheet on the stage (#518 ruling 5)",
    !!pf && pf.items === 6 && pf.drawn === 6 && pf.rows === 6 && pf.groups >= 1 && pf.onStage &&
      // The LITERAL world, not a shape: seed 42's parent is deterministic (measured 2026-09-08), and a shape check passes on
      // the "this world" fallback the page uses before worldTitle arrives, which is the whole thing this pins.
      pf.heads.length === 1 && pf.heads[0] === "From The Isle of Rahai · chart № 42",
    JSON.stringify(pf),
  );
  // CD24 (#547 ruling 4, Alex 2026-09-13): the Portfolio's "is on top" was the Explorer's defect on a second page, so one shared announcer and ONE kit rule take both lines away. Named blind spot, with its direction: this does not wait the hold out, so it does not watch THIS line go. The going is the shared module (test/site/announce.test.ts) and CD23's resolved read; a second eight-second wait is what the lane's measured budget cannot buy, and the PR body carries it as residue.
  const pfNext = await evaluate<{ x: number; y: number; reachable: boolean } | null>(`(() => { const b = document.getElementById("pf-next"); if (!b) return null; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); if (r.width < 1) return null; const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); const h = document.elementFromPoint(x, y); return { x, y, reachable: h === b || b.contains(h) }; })()`);
  if (pfNext) await clickAt(pfNext.x, pfNext.y);
  const PF_SAID: Payload<{ line: string; fadeMs: string; rest: string; faded: string } | null> = `(() => { const s = document.getElementById("pf-status"); if (!s) return null; const was = s.style.transition; s.style.transition = "none"; const rest = getComputedStyle(s).opacity; s.classList.add("fading"); const faded = getComputedStyle(s).opacity; s.classList.remove("fading"); s.style.transition = was; return { line: s.textContent || "", fadeMs: getComputedStyle(s).transitionDuration, rest, faded }; })()`;
  // A bounded poll and not a settle, so a Portfolio that never announces fails CD24 by name rather than throwing outside every step the way its four siblings here already run unstepped. 40 tries is 2s: bringUp says synchronously inside the click handler's own task, so the first or second read has it (measured 2026-09-13, every local run read it on the first).
  let pfSaid = await evaluate(PF_SAID);
  for (let i = 0; i < 40 && (!pfSaid || pfSaid.line === ""); i++) { await sleep(50); pfSaid = await evaluate(PF_SAID); }
  check(
    "CD24 the Portfolio announces the sheet it brought up on a pill that wears the SAME fade the Explorer's does, read as the declared duration AND as the opacity the cascade resolves under the class: a rule keyed to #status alone, or a later arm re-raising THIS page's opacity, would leave this announcement standing over the chart forever and every other guard green (#547 ruling 4)",
    !!pfNext && pfNext.reachable && !!pfSaid && /is on top/.test(pfSaid.line) &&
      pfSaid.fadeMs === "0.45s" && pfSaid.rest === "1" && pfSaid.faded === "0",
    JSON.stringify({ press: pfNext, said: pfSaid }),
  );
  // BARE means bare on both homes since #634: a Portfolio the address names no folio for now shows what the device holds (ruling 4), so the six this group just laid would arrive here as a full pile.
  await forget();
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/portfolio/` });
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break; }
  await sleep(400);
  const empty = await evaluate<{ bound: string | null; where: string | null; explorer: boolean; next: boolean; download: boolean }>(`(() => ({ bound: (document.getElementById("pf-bound") || {}).textContent || null,
    where: (document.querySelector("#portfolio .card-where") || {}).textContent || null,
    // The RECT of all three, never .hidden: atelier.css sets an author display on .legend-btn, which beats the UA [hidden] rule, so el.hidden = true silently no-ops and a check on that property is a check on its own input (#270's guard-prover find).
    // The road takes the same measure as the two presses because it is the same script decision: its mere presence is an Astro literal the page script never touches, and could not go red however the stand-down was written.
    explorer: (() => { const a = document.getElementById("pf-explorer"); return !!a && a.getBoundingClientRect().width > 0.5; })(),
    next: (() => { const b = document.getElementById("pf-next"); return !!b && b.getBoundingClientRect().width > 0.5; })(),
    download: (() => { const b = document.getElementById("pf-download"); return !!b && b.getBoundingClientRect().width > 0.5; })() }))()`);
  check(
    "CD20 a Portfolio reached with nothing gathered says so in the room's own voice, in the slip's where-line as well as the bound line, and keeps only the road that has somewhere to go (ruled 2026-09-08): the two sheet presses have nothing to act on and stand down, and the road is measured by its rect the way they are",
    !!empty.bound && /table is laid at the Explorer/.test(empty.bound) &&
      /no sheets gathered at the Explorer/.test(empty.where || "") && empty.explorer && !empty.next && !empty.download,
    JSON.stringify(empty),
  );
  // CD21 (#521): the Portfolio is a chart room, so the kit renders its Glass and the stage's label promises the keys.
  // Both halves are the claim. d3-zoom does NOT set touch-action, so a bound controller with no `touch-action: none`
  // is still dead to a real thumb: the browser's native pan takes the gesture first (#164).
  const glass = await evaluate<{ zoomable: boolean; touch: string; before: string }>(`(() => {
    const v = document.getElementById("map-viewport");
    const before = document.getElementById("map").style.transform;
    document.querySelector('[data-zoom="in"]').click();
    return { zoomable: v.classList.contains("zoomable"), touch: getComputedStyle(v).touchAction, before };
  })()`);
  await sleep(700);
  const glassAfter = await evaluate<string>(`document.getElementById("map").style.transform`);
  check(
    "CD21 the Portfolio's Glass is bound AND reachable by a thumb: a zoom press moves the camera, and the viewport takes touch-action none, without which d3 never sees the gesture and three corner presses are decoration (#164, #521)",
    glass.zoomable && glass.touch === "none" && glassAfter !== glass.before && glassAfter !== "",
    JSON.stringify({ ...glass, after: glassAfter }),
  );
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // CD6 (#540 Sub 2a): the desktop drawer must never paint at 390, and the check has to try the door that opens it: `lay()` calls setOpen(true) with no width term, and `.chart-drawer.open` (0,2,0) beat the stand-down's (0,1,0), so once .open landed the drawer displayed at 390 over a reader who could not shut it.
  await setMobileViewport(390, 844);
  await step("CD6, CD48", async () => {
    await go(`${DRESS}&${DEEP}`);
    const phoneArmed = await settle(READ, atInset, "chart-drawer-phone-inset", DRAWN);
    const phoneEar = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (phoneEar) { await touch("touchStart", [{ x: phoneEar.x, y: phoneEar.y, id: 0 }]); await touch("touchEnd", []); }
    await sleep(1600);
    const phone = await evaluate(READ);
    const phoneDrawer = await evaluate<string>(`getComputedStyle(document.getElementById("chart-drawer")).display`);
    const phoneShut = await evaluate<string>(`(() => { const b = document.getElementById("chart-drawer-shut"); const r = b.getBoundingClientRect(); if (r.width < 1) return "no-box"; const h = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)); return h === b || b.contains(h) ? "reachable" : "eclipsed"; })()`);
    check(
      "CD6 at 390 the desktop drawer never paints, not even after a real tap on the dog-ear, and the tap FILES the sheet: the handle is the phone's own door into the table and it opens the drawer with no width term, so the stand-down has to cover the OPEN state and not just the resting one (#540; the filing half strengthened at Issue #523, whose drag must leave the tap the door it is)",
      !!phoneEar && !phoneArmed.open && phoneDrawer === "none" && phone.scrollW === phone.innerW && !phone.tabShown && phoneArmed.cuttings === 0 && phone.cuttings === 1,
      JSON.stringify({ tapped: phoneEar, drawerDisplay: phoneDrawer, open: phone.open, shutPress: phoneShut, scrollW: phone.scrollW, innerW: phone.innerW, cuttings: [phoneArmed.cuttings, phone.cuttings] }),
    );

    // CD48 (Issue #523 build item 4), in this order: the handle's touch drag first, the pan control LAST, since a pan at DEEP can recommit the inset and rebuild the ear, and nothing after it here reads the ear.
    const earNow = await evaluate<Point | null>(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    const camBefore = await evaluate<Cam>(`window.__vellumZoomState()`);
    let ghostSeen = false;
    if (earNow) {
      await touch("touchStart", [{ x: earNow.x, y: earNow.y, id: 0 }]);
      for (let i = 1; i <= 4; i++) {
        await touch("touchMove", [{ x: earNow.x - 30 * i, y: earNow.y + 40 * i, id: 0 }]);
        if (await evaluate<boolean>(`!!document.querySelector(".sheet-ghost")`)) ghostSeen = true;
      }
      await touch("touchEnd", []);
    }
    await sleep(500);
    const afterHandle = await evaluate<{ cam: Cam; ghost: boolean; drag: boolean; cuttings: number }>(`({ cam: window.__vellumZoomState(), ghost: !!document.querySelector(".sheet-ghost"), drag: document.body.classList.contains("sheet-drag"), cuttings: document.querySelectorAll("#cuttings li").length })`);
    const panFrom = await evaluate<{ x: number; y: number; on: string } | null>(`(() => { const inset = document.querySelector("#map .region-inset"); const b = inset ? inset.getBoundingClientRect() : null; if (!b) return null;
      for (const [fx, fy] of [[0.15, 0.85], [0.3, 0.7], [0.5, 0.5], [0.2, 0.3]]) { const x = Math.round(b.x + b.width * fx), y = Math.round(b.y + b.height * fy); const h = document.elementFromPoint(x, y); if (h && !h.closest(".dog-ear") && !h.closest(".place-hit") && h.closest("#map-viewport")) return { x, y, on: h.tagName }; }
      return null; })()`);
    if (panFrom) await touchPan(panFrom.x, panFrom.y, panFrom.x + 80, panFrom.y + 60);
    await sleep(500);
    const afterPan = await evaluate<Cam>(`window.__vellumZoomState()`);
    check(
      "CD48 at 390 a touch that begins on the handle neither pans nor zooms the map and never raises a ghost (touch never drags, Issue #401 ruling 6), while a touch that begins beside it on the chart still pans, the control that proves the camera was listening: the first is the ear's stopped touchstart, the second is d3 bound under touch emulation that was active BEFORE the navigate (Issue #523 build item 4)",
      !!earNow && !!camBefore && camBefore.k === afterHandle.cam.k && camBefore.x === afterHandle.cam.x && camBefore.y === afterHandle.cam.y && // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        !ghostSeen && !afterHandle.ghost && !afterHandle.drag && afterHandle.cuttings === 1 &&
        !!panFrom && (afterPan.x !== camBefore.x || afterPan.y !== camBefore.y),
      JSON.stringify({ ear: earNow, camBefore, afterHandle, ghostSeen, panFrom, afterPan }),
    );
  });

  const LEAF: Payload<Leaf> = `(() => {
    const tabs = [...document.querySelectorAll(".slip-head .sheet-tabs button")];
    const name = (e) => (e ? (e.id ? "#" + e.id : "." + String(e.className || e.tagName).trim().split(/\\s+/).join(".")) : null);
    const press = (b) => { const r = b.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return "no-box";
      const h = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
      return h === b || b.contains(h) ? "self" : name(h); };
    const leaf = document.getElementById("table-leaf");
    const cut = document.getElementById("cuttings");
    return {
      tabs: tabs.map((b) => ({ text: (b.textContent || "").replace(/\\s+/g, " ").trim(), selected: b.getAttribute("aria-selected"), press: press(b) })),
      leafTabsDisplay: (() => { const t = document.querySelector(".slip-head .sheet-tabs"); return t ? getComputedStyle(t).display : null; })(),
      leafShown: !!leaf && getComputedStyle(leaf).display !== "none",
      formShown: (() => { const f = document.querySelector(".slip-body .broadside"); return !!f && getComputedStyle(f).display !== "none"; })(),
      cuttingsInLeaf: !!leaf && !!cut && leaf.contains(cut),
      cuttingsShown: !!cut && getComputedStyle(cut).display !== "none",
      cuttings: document.querySelectorAll("#cuttings li").length,
      columns: (() => { const c = document.getElementById("cuttings"); return c ? getComputedStyle(c).gridTemplateColumns.split(" ").filter(Boolean).length : 0; })(),
      countText: (() => { const c = document.getElementById("chart-drawer-count"); return c && c.offsetParent !== null ? c.textContent : null; })(),
      roadInSlip: (() => { const r = document.getElementById("table-road"); const d = document.querySelector(".slip .legend-dock"); return !!r && !!d && d.contains(r); })(),
      // The sheet's body scrolls, so a road below the fold hit-tests to nothing; bring it into view first, or the check
      // measures the viewport rather than the control. And an element inside a display:none parent still computes its OWN
      // display, so "is it shown" has to be read off the rect, not off getComputedStyle.
      roadPress: (() => { const r = document.getElementById("table-road"); if (!r) return null;
        r.scrollIntoView({ block: "center" });
        const b = r.getBoundingClientRect(); if (b.width < 1) return "no-box";
        const h = document.elementFromPoint(Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2)); return h === r || r.contains(h) ? "self" : (h ? (h.id || String(h.className)) : "none"); })(),
      otherRoads: [...document.querySelectorAll(".slip .legend-dock .legend .legend-btn")].filter((b) => b.getBoundingClientRect().width > 0.5 && b.id !== "table-road").length,
    };
  })()`;
  await setMobileViewport(390, 844);
  await go(`${DRESS}&table=${SIX}`);
  await evaluate(`document.querySelector(".slip-handle").click()`);
  await sleep(500);
  const leafShut = await evaluate(LEAF);
  const tableTab = await evaluate<Point | null>(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /table/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  if (tableTab) { await touch("touchStart", [{ x: tableTab.x, y: tableTab.y, id: 0 }]); await touch("touchEnd", []); }
  check(
    "CD14 the sheet's head carries the two leaf tabs and BOTH answer a real thumb: at narrow .slip-handle is inset:0 over the whole head, so a tab authored there is dead unless it takes its own layer (mock.css 230), and a tab nobody can press is the #520 dog-ear again. The row DRESSED as a row (#547): CD22 reads display none at 1280, and a stand-down written after the phone block would win everywhere and red here",
    leafShut.tabs.length === 2 && leafShut.tabs.every((t) => t.press === "self") &&
      /broadside/i.test(leafShut.tabs[0].text) && /^the table( · \d+)?$/i.test(leafShut.tabs[1].text) &&
      leafShut.leafTabsDisplay === "flex",
    JSON.stringify({ tabs: leafShut.tabs, display: leafShut.leafTabsDisplay }),
  );
  // Was a hand-rolled loop that returned its last read BECAUSE a settle that gives up killed the lane. The step is what that comment was waiting for (#534), so the wait is a settle again and its timeout is CD15 and CD17 going red by name.
  await step("CD15, CD17", async () => {
    const leafOpen = await settle(LEAF, (d) => d.leafShown && d.cuttings === 6, "chart-drawer-leaf", DRAWN);
    check(
      "CD15 pressing The Table turns the sheet to its second leaf: the Broadside's form goes, the gathered sheets come up two across on the sheet's own parchment, and the count comes with them (#518 ruling 4)",
      leafOpen.leafShown && !leafOpen.formShown && leafOpen.cuttingsInLeaf && leafOpen.cuttings === 6 && leafOpen.columns === 2 && !!leafOpen.countText,
      JSON.stringify({ leaf: leafOpen.leafShown, form: leafOpen.formShown, inLeaf: leafOpen.cuttingsInLeaf, cuttings: leafOpen.cuttings, columns: leafOpen.columns, count: leafOpen.countText }),
    );
    check(
      "CD17 with the table leaf up the road out is the TABLE's road, docked in the sheet's legend where every other road out lives, and it answers a real thumb (#518 ruling 4)",
      leafOpen.roadInSlip && leafOpen.roadPress === "self" && leafOpen.otherRoads === 0,
      JSON.stringify({ inSlip: leafOpen.roadInSlip, press: leafOpen.roadPress, others: leafOpen.otherRoads }),
    );
  });
  const broadsideTab = await evaluate<Point | null>(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /broadside/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  if (broadsideTab) { await touch("touchStart", [{ x: broadsideTab.x, y: broadsideTab.y, id: 0 }]); await touch("touchEnd", []); }
  await sleep(700);
  const backToForm = await evaluate(LEAF);
  check(
    "CD16 the leaf turns back: pressing The Broadside returns the form and puts the table away, so the reader is never one-way into either leaf",
    backToForm.tabs.length === 2 && backToForm.formShown && !backToForm.leafShown && backToForm.tabs[0].selected === "true" && backToForm.tabs[1].selected === "false",
    JSON.stringify({ form: backToForm.formShown, leaf: backToForm.leafShown, selected: backToForm.tabs.map((t) => t.selected) }),
  );
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // #522 Sub 4: the two capture points for a prospect, and the mixed folio they make.
  const CARD: Payload<Card> = `(() => {
    const press = document.querySelector("#place-card .pc-lay");
    const link = document.querySelector("#place-card .pc-prospect");
    const acts = document.querySelector("#place-card .pc-acts");
    const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const hit = (e) => { const b = box(e); if (!b || b.w < 1) return "no-box"; const h = document.elementFromPoint(b.x, b.y); return h === e || e.contains(h) ? "self" : (h ? (h.id || String(h.className)) : "none"); };
    return {
      hits: document.querySelectorAll(".place-overlay .place-hit").length,
      shown: !!document.getElementById("place-card") && !document.getElementById("place-card").hidden,
      name: (document.querySelector("#place-card .pc-name") || {}).textContent || null,
      press: press ? { text: press.textContent, dim: press.classList.contains("dim"), idx: press.dataset.idx, box: box(press), hit: hit(press), disabled: press.hasAttribute("disabled") } : null,
      link: link ? { hit: hit(link), inActs: !!acts && acts.contains(link) } : null,
      actsRow: acts ? acts.children.length : 0,
      pressInActs: !!acts && !!press && acts.contains(press),
      cuttings: document.querySelectorAll("#cuttings li").length,
      prospects: document.querySelectorAll("#cuttings li.prospect").length,
      titles: [...document.querySelectorAll("#cuttings .label b")].map((b) => b.textContent),
      subs: [...document.querySelectorAll("#cuttings .label i")].map((i) => i.textContent),
      imgs: document.querySelectorAll("#cuttings img").length,
      decoded: [...document.querySelectorAll("#cuttings img")].map((i) => i.naturalWidth > 0),
      frames: document.querySelectorAll("#cuttings .awaited").length,
      hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      seedBox: (document.getElementById("seed") || {}).value || null,
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    };
  })()`;

  // A card is pinned by a REAL press on its hit target, and at a NONZERO index, because a filing that always names place 0
  // passes every shape check (#428's own hard-coded-index trap, and PB1b's).
  const pinCard = async (at: number) => {
    const r = await evaluate<Point | null>(`(() => { const h = document.querySelector('.place-overlay .place-hit[data-idx="${at}"]'); if (!h) return null; const b = h.getBoundingClientRect(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; })()`);
    if (r) await clickAt(r.x, r.y);
    await sleep(250);
    return r;
  };
  const pressCard = async (d: Card) => { if (d && d.press && d.press.box) await clickAt(d.press.box.x, d.press.box.y); await sleep(250); }; // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  await step("CD25, CD26, CD30", async () => {
    await go(DRESS);
    const at = await settle(CARD, (d) => d.hits > 1, "chart-drawer-card");
    await pinCard(1);
    const armed = await settle(CARD, (d) => d.shown && !!d.press, "chart-drawer-card-press");
    check(
      "CD25 the place card's two actions stand in ONE row and BOTH answer a real pointer: #place-card is pointer-events: none, so a press that forgets to restore it passes element.click() and is dead to every reader, which is the #520 dog-ear scar exactly (#518 ruling 7)",
      at.hits > 1 && armed.shown && !!armed.press && armed.press.hit === "self" &&
        !!armed.link && armed.link.hit === "self" && armed.link.inActs && armed.pressInActs && armed.actsRow === 2 &&
        armed.press.text === "Lay the prospect on the table" && !armed.press.dim && !armed.press.disabled && armed.press.idx === "1",
      JSON.stringify({ hits: at.hits, press: armed.press, link: armed.link, actsRow: armed.actsRow }),
    );
    await pressCard(armed);
    const filed = await settle(CARD, (d) => d.cuttings === 1 && d.imgs === 1, "chart-drawer-prospect-drawn", DRAWN);
    check(
      "CD26 the filed prospect DRAWS its own plate rather than keeping a reserved frame, named for the TOWN and not for the world, and the press it was filed from relabels in place (#518 ruling 7; a prospect read 'drawing…' for good until this sub, and a press labelled only at card-show keeps offering an action it has spent)",
      filed.cuttings === 1 && filed.prospects === 1 && filed.imgs === 1 && filed.frames === 0 &&
        filed.decoded.every(Boolean) && /^The Prospect of \S/.test(filed.titles[0] || "") &&
        // The year LITERAL, not a shape: "the year is the Explorer's present" is the ratified acceptance, and seed 42's
        // present is 1059, so `\d+` would pass on any year at all and the acceptance would have no guard (#631's review).
        filed.titles[0] !== "The Isle of Rahai" && filed.subs[0] === "a prospect, antique, 1059" &&
        (filed.hashTable || "").indexOf("year-1059") !== -1 &&
        !!filed.press && filed.press.text === "Already on the table" && filed.press.dim && !filed.press.disabled &&
        typeof filed.hashTable === "string" && filed.hashTable.indexOf("k-p.") === 0,
      JSON.stringify({ cuttings: filed.cuttings, prospects: filed.prospects, imgs: filed.imgs, frames: filed.frames, decoded: filed.decoded, titles: filed.titles, subs: filed.subs, press: filed.press, table: filed.hashTable }),
    );
    // The DRAWN world and not the controls: a seed typed without pressing Draw is the reachable way to file a chart nobody drew.
    await evaluate(`(() => { const s = document.getElementById("seed"); s.value = "7"; })()`);
    await pinCard(2);
    const other = await settle(CARD, (d) => d.shown && !!d.press && d.press.idx === "2", "chart-drawer-card-other");
    await pressCard(other);
    const second = await settle(CARD, (d) => d.cuttings === 2, "chart-drawer-prospect-second");
    check(
      "CD30 the card files the world on the SHEET, never the one in the seed box: a seed typed and not drawn leaves the chart alone, so an item built from the control would file a plate the reader has never seen (the lodController exposes no drawn world, which is what makes this reachable)",
      second.seedBox === "7" && second.cuttings === 2 &&
        typeof second.hashTable === "string" && second.hashTable.split("_").every((s) => s.indexOf("seed-42") !== -1) &&
        second.hashTable.indexOf("seed-7") === -1,
      JSON.stringify({ seedBox: second.seedBox, cuttings: second.cuttings, table: second.hashTable }),
    );
  });

  // A full table costs no worker job, because the drawer fills its frames only when OPENED (#520's ruling), so this boot is cheap.
  await step("CD27", async () => {
    await go(`${DRESS}&table=${SIX}`);
    await settle(CARD, (d) => d.hits > 1, "chart-drawer-card-full");
    await pinCard(1);
    const atCap = await settle(CARD, (d) => d.shown && !!d.press, "chart-drawer-card-cap");
    await pressCard(atCap);
    const after = await evaluate(CARD);
    check(
      "CD27 at the cap the card's press wears the ruled refusal and stays PRESSABLE, so a keyboard reader still meets it and hears why, and pressing lays nothing (#518 ruling 7; disabled would drop it out of the tab order, which is why the dog-ear's ruled shape keeps answering)",
      !!atCap.press && atCap.press.text === "No room on the table" && atCap.press.dim && !atCap.press.disabled &&
        atCap.press.hit === "self" && after.cuttings === 6,
      JSON.stringify({ press: atCap.press, before: atCap.cuttings, after: after.cuttings }),
    );
  });

  // The page's own capture point (seat C, ruled 2026-09-17): it files and STAYS, and the year is part of a sheet's identity.
  // eslint-disable-next-line max-lines-per-function
  await step("CD28, CD29, CD34, CD35, CD31", async () => {
    await forget();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/prospect/#seed=42&i=3` });
    for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
    const PP: Payload<Pp> = `(() => {
      const p = document.getElementById("pp-lay");
      const b = p ? p.getBoundingClientRect() : null;
      const centre = b && b.width > 1 ? { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } : null;
      const h = centre ? document.elementFromPoint(centre.x, centre.y) : null;
      return {
        state: window.__vellumProspectState ? window.__vellumProspectState() : null,
        press: p ? { text: p.textContent, dim: p.classList.contains("dim"), shown: !!b && b.width > 1, centre, hit: h === p || (p.contains(h)) ? "self" : (h ? (h.id || String(h.className)) : "none"), disabled: p.hasAttribute("disabled") } : null,
        count: (document.getElementById("pp-lay-count") || {}).textContent || null,
        inNote: !!document.querySelector("#note #pp-lay"),
        roads: [...document.querySelectorAll("#note .legend-dock .legend-btn, .legend .legend-row .legend-btn")].length,
        chartHref: (document.getElementById("pp-chart-link") || {}).getAttribute("href"),
        hashTable: new URLSearchParams(location.hash.slice(1)).get("table"),
      };
    })()`;
    const opened = await evaluate<boolean>(`(() => { const s = document.getElementById("note"); if (s && !s.classList.contains("open")) s.querySelector(".slip-handle").click(); return true; })()`);
    // The slip's fold is a transition, and CD28 derives a real pointer target from this press's rect: a fixed sleep either
    // measures a box still moving or waits longer than it needs. Poll it to REST instead, and throw naming the last read.
    // @ts-expect-error the predicate reads null rather than false while either press has no centre, and the settle treats a null as it treats false and keeps polling
    const pp = await settle(PP, (d, last) => !!d.press && d.press.shown && !!last && !!last.press && d.press.centre && last.press.centre &&
      d.press.centre.x === last.press.centre.x && d.press.centre.y === last.press.centre.y, "prospect-note-open");
    check(
      "CD28 the Prospect page's press sits on the engraver's note where the room's desk actions belong, answers a real pointer, and does NOT join the roads out, which go somewhere (ruled 2026-09-17, seat C)",
      !!opened && !!pp.press && pp.press.shown && pp.press.hit === "self" && pp.inNote &&
        pp.press.text === "Lay this prospect on the table" && !pp.press.dim && !pp.press.disabled &&
        /table is bare/.test(pp.count || ""),
      JSON.stringify({ press: pp.press, count: pp.count, inNote: pp.inNote, roads: pp.roads }),
    );
    if (pp.press && pp.press.centre) await clickAt(pp.press.centre.x, pp.press.centre.y);
    const one = await settle(PP, (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 1, "prospect-filed-one");
    // The same town at a second year: the year IS part of the sheet's identity, which is the case that won "press and stay".
    // The form is submitted synthetically because the claim here is about the FILING, not about the year control, whose own gesture PB6 already drives.
    await evaluate(`(() => { const y = document.getElementById("pp-year"); y.value = String(Math.max(1, Number(y.value) - 300)); document.getElementById("pp-year-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); })()`);
    // @ts-expect-error the state is null only on a Prospect page that never drew, which the boot loop above waits for; while the poll reads no year the s !== null test before it reads false and the loop runs out its tries, and once it reads a year a null state throws here, inside the step, which reds CD28, CD29, CD34, CD35, CD31 by name
    for (let i = 0; i < 300; i++) { await sleep(100); const s = await evaluate<number | null>(`(() => { const st = window.__vellumProspectState(); return st ? st.year : null; })()`); if (s !== null && s !== one.state.year) break; }
    let two = await evaluate(PP);
    if (two.press && two.press.centre) await clickAt(two.press.centre.x, two.press.centre.y);
    two = await settle(PP, (d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 2, "prospect-filed-two");
    check(
      "CD29 the page files and STAYS, writing the gathering into its OWN address so a reload keeps it, and the same town at a second year is a SECOND sheet rather than one deduped away (ruled 2026-09-17; the year rides in the item, which is what lets a reader gather a run of one place across the centuries)",
      typeof one.hashTable === "string" && one.hashTable.split("_").length === 1 && /one sheet laid/.test(one.count || "") &&
        typeof two.hashTable === "string" && two.hashTable.split("_").length === 2 && /two sheets laid/.test(two.count || "") &&
        new Set(two.hashTable.split("_")).size === 2 &&
        typeof two.chartHref === "string" && two.chartHref.indexOf("table=") !== -1,
      JSON.stringify({ oneTable: one.hashTable, oneCount: one.count, twoTable: two.hashTable, twoCount: two.count, chartHref: two.chartHref }),
    );
    // The page's own two refusing faces. Nothing else drives them, and with no check here the two booleans handed to
    // layPressFace could be swapped and ship green, which would put "No room" on a duplicate and "Already" on a full
    // table, the exact inverse of ruling 4 (#631's review).
    const held = await evaluate(PP);
    check(
      "CD34 filing the SAME plate twice turns the page's press to its held face, not its full one: the two refusals are told apart here or they can be swapped with every other check green (ruled 2026-09-17)",
      !!held.press && held.press.text === "Already on the table" && held.press.dim && !held.press.disabled &&
        /two sheets laid/.test(held.count || ""),
      JSON.stringify({ press: held.press, count: held.count }),
    );
    // A boot with the cap already spent: the same press, the OTHER refusal. The six come from the ADDRESS, so the device is cleared first or the two sources are indistinguishable here.
    await forget();
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/prospect/#seed=42&i=3&table=${SIX}` });
    for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
    await evaluate(`(() => { const s = document.getElementById("note"); if (s && !s.classList.contains("open")) s.querySelector(".slip-handle").click(); })()`);
    // @ts-expect-error the predicate reads null rather than false while either press has no centre, and the settle treats a null as it treats false and keeps polling
    const atCapPage = await settle(PP, (d, last) => !!d.press && d.press.shown && !!last && !!last.press && d.press.centre && last.press.centre &&
      d.press.centre.x === last.press.centre.x && d.press.centre.y === last.press.centre.y, "prospect-note-open-full");
    if (atCapPage.press && atCapPage.press.centre) await clickAt(atCapPage.press.centre.x, atCapPage.press.centre.y);
    // A refusal changes nothing, so there is no state to poll TO, and a settle here proves nothing: it returns on its FIRST satisfying read and this predicate is already true when the press is answered, so it read once and waited 0ms. What is real for "nothing happened" is a DWELL, held past the moment a wrongly accepted filing would have written the hash.
    const dwell = [];
    for (let i = 0; i < 8; i++) { dwell.push(await evaluate(PP)); await sleep(50); }
    const stillFull = dwell[dwell.length - 1];
    const heldSix = dwell.every((d) => typeof d.hashTable === "string" && d.hashTable.split("_").length === 6);
    check(
      "CD35 at the cap the page's press wears the FULL refusal, stays pressable, and lays nothing: the page inherits the table's six from the address it was handed, which is the cap #522 says applies here too",
      !!atCapPage.press && atCapPage.press.text === "No room on the table" && atCapPage.press.dim &&
        !atCapPage.press.disabled && atCapPage.press.hit === "self" &&
        /the table is full/.test(atCapPage.count || "") &&
        heldSix && (stillFull.hashTable || "").split("_").length === 6,
      JSON.stringify({ press: atCapPage.press, count: atCapPage.count, after: (stillFull.hashTable || "").split("_").length, heldSix, reads: dwell.length }),
    );
    // Home through chartTarget, the way the page offers: the Explorer restores the table with both sheets on it.
    await send("Page.navigate", { url: "about:blank" });
    // @ts-expect-error a chart link with no href reads null, which CD29 has already read false for; a null throws here, inside the step, which reds CD28, CD29, CD34, CD35, CD31 by name
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/${two.chartHref.slice(
      // @ts-expect-error the same null link, which the slice before it has already thrown on
      two.chartHref.indexOf("#"))}` });
    for (let i = 0; i < 200; i++) { await sleep(150); if (await evaluate<boolean>(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`)) break; }
    const home = await settle(CARD, (d) => d.cuttings === 2, "chart-drawer-round-trip");
    check(
      "CD31 the round trip closes: what the Prospect page filed comes home through chartTarget and the Explorer restores BOTH sheets, which is the epic's core insight working across a real cross-path navigation",
      home.cuttings === 2 && home.prospects === 2 &&
        home.subs.every((s) => /^a prospect, /.test(s || "")) && new Set(home.subs).size === 2,
      JSON.stringify({ cuttings: home.cuttings, prospects: home.prospects, subs: home.subs, titles: home.titles }),
    );
  });

  // A MIXED folio, kept to three sheets because each one is a real worker job and lane B's measured budget is the constraint.
  await step("CD32", async () => {
    const MIXED = [
      "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-5.ly-5",
      "k-p.seed-42.style-ink.i-3.year-1059",
      "k-p.seed-42.style-antique.i-1.year-1059",
    ].join("_");
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/portfolio/#table=${MIXED}` });
    for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break; }
    const PFM: Payload<{ items: number; drawn: number; rows: number; thumbs: number; awaited: number; bands: string[]; titles: string[]; downloads: number; bound: string | null } | null> = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
      rows: document.querySelectorAll("#pf-contents .row").length,
      thumbs: document.querySelectorAll("#pf-contents .thumb img").length,
      awaited: document.querySelectorAll("#pf-contents .thumb.awaited").length,
      bands: [...document.querySelectorAll("#pf-contents .row-band")].map((e) => e.textContent),
      titles: [...document.querySelectorAll("#pf-contents .row-title")].map((e) => e.textContent),
      downloads: [...document.querySelectorAll("#pf-contents .row-download")].filter((b) => !b.disabled).length,
      bound: (document.getElementById("pf-bound") || {}).textContent || null } : null; })()`;
    let pfm = await evaluate(PFM);
    for (let i = 0; i < DRAWN && (!pfm || pfm.drawn < 3); i++) { await sleep(50); pfm = await evaluate(PFM); }
    check(
      "CD32 a MIXED folio drafts every sheet in its OWN dress: the prospects draw beside the survey instead of holding a reserved place, each row names its dress and offers its own engraving, and no row is left reading 'a prospect' (#401 ruling 8, and #521 ruling 3 held the place only until this sub)",
      !!pfm && pfm.items === 3 && pfm.drawn === 3 && pfm.rows === 3 && pfm.thumbs === 3 && pfm.awaited === 0 &&
        pfm.downloads === 3 &&
        pfm.bands.filter((b) => /^a prospect, pen & ink, \d+$/.test(b || "")).length === 1 &&
        pfm.bands.filter((b) => /^a prospect, antique, \d+$/.test(b || "")).length === 1 &&
        pfm.bands.filter((b) => /^band \d+, antique$/.test(b || "")).length === 1 &&
        !pfm.bands.some((b) => /awaiting its page/.test(b || "")) &&
        pfm.titles.filter((t) => /^The Prospect of \S/.test(t || "")).length === 2 &&
        /three sheets drafted/i.test(pfm.bound || ""),
      JSON.stringify(pfm),
    );
  });

  // The phone, where the drawer is stood down and the only feedback is the leaf tab and the status pill.
  await step("CD33", async () => {
    await setMobileViewport(390, 844);
    await go(DRESS);
    await settle(CARD, (d) => d.hits > 1, "chart-drawer-card-390");
    await pinCard(1);
    const narrow = await settle(CARD, (d) => d.shown && !!d.press, "chart-drawer-card-press-390");
    await pressCard(narrow);
    const said = await settle<Card & { leafTab: string | null; status: string }>(
      `(() => ({ ...${CARD}, leafTab: (() => { const b = document.getElementById("leaf-table"); return b ? b.textContent : null; })(), status: (document.getElementById("status") || {}).textContent || "" }))()`,
      (d) => d.cuttings === 1,
      "chart-drawer-filed-390",
      DRAWN,
    );
    check(
      "CD33 at the ruled phone width BOTH card actions answer a real thumb, the card does not scroll the page sideways, and a successful press is ANSWERED where a phone reader can see it: the drawer is stood down at narrow, so the leaf tab's tally and the status pill are the whole of the feedback and a press that changed neither would read as nothing happening",
      // @ts-expect-error the settle's predicate has already required a press, so a null never reaches here
      narrow.press.hit === "self" &&
        // @ts-expect-error a card with no prospect link reads null, which throws here, inside CD33's step, and the step reds CD33 by name
        narrow.link.hit === "self" &&
        said.scrollW === said.innerW && said.cuttings === 1 && said.prospects === 1 &&
        /^The Table · 1$/.test(said.leafTab || "") && /lies on the table/.test(said.status || ""),
      JSON.stringify({ press: narrow.press, link: narrow.link, scrollW: said.scrollW, innerW: said.innerW, leafTab: said.leafTab, status: said.status, cuttings: said.cuttings }),
    );
    await clearMobile();
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  });

  // #634: the table's second home, and the four roads the two homes exist for. ONE and TWO are addresses rather than gestures because every check below is about WHERE the table came from, not about the handle that filed it.
  const ONE = "k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";
  const TWO = `${ONE}_k-p.seed-42.style-antique.i-0.year-1059`;
  const STORE: Payload<string | null> = `(() => { try { return localStorage.getItem(${JSON.stringify(TABLE_STORE_KEY)}); } catch { return "THREW"; } })()`;
  // Two shapes on purpose (specs/settle-doctrine.md clause 4). Where arriving is a PRECONDITION the wait throws;
  // where arriving is the CHECK's own claim it keeps reading and hands back its last read, and the caller asserts
  // on that, so a press that navigated nowhere reds by naming the page it is still standing on.
  const reachedExplorer = async () => {
    let last = null;
    for (let i = 0; i < 200; i++) {
      await sleep(150);
      last = await evaluate<{ href: string; svg: boolean; drawer: boolean }>(`(() => ({ href: location.href, svg: !!document.querySelector("#map svg"), drawer: !!document.getElementById("chart-drawer") }))()`);
      if (last.svg && last.drawer) return { ...last, reached: true };
    }
    return { ...(last ?? { href: null, svg: false, drawer: false }), reached: false };
  };
  const atExplorer = async () => {
    const at = await reachedExplorer();
    if (!at.reached) throw new Error(`the Explorer never booted; still at ${at.href}`);
    return at;
  };
  const openDrawer = async () => {
    // Wiring, not a gesture claim: CD2 and CD14 own whether the tab answers a real pointer. Here it is the door to the road.
    await evaluate(`(() => { const t = document.getElementById("chart-drawer-tab"); if (t && getComputedStyle(t).display !== "none") t.click(); })()`);
    await sleep(400);
  };
  // A measurement poll, not a readiness wait (specs/settle-doctrine.md clause 4), and deliberately NOT keyed on the number the check is about (clause 6): it reads until the count stops moving and hands back its LAST read, which the caller asserts on. The first version of CD37 and CD38 put `cuttings === 2` in the settle instead, and the mutations that were supposed to prove them killed the predicate, so the checks' own booleans were never evaluated at all (the cold review on PR #635).
  const restedAtExplorer = async (): Promise<Back> => {
    let last = null;
    let same = 0;
    for (let i = 0; i < DRAWN; i++) {
      const d = await evaluate<Back>(`(() => ({ ...${READ}, marker: window.__cd634 || null, navType: (performance.getEntriesByType("navigation")[0] || {}).type || null, stored: ${STORE} }))()`);
      same = last && d.path === last.path && d.cuttings === last.cuttings ? same + 1 : 0;
      last = d;
      if (last.path === "/explorer/" && same >= 2) return last;
      await sleep(50);
    }
    // @ts-expect-error the loop runs DRAWN times and sets last on every pass, so it is never null when the loop ends
    return last;
  };
  const pressById = async (id: string) => {
    const at = await evaluate<{ x: number; y: number; hit: boolean } | null>(`(() => { const e = document.getElementById(${JSON.stringify(id)}); if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); if (b.width < 1) return null; const c = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; return { ...c, hit: document.elementFromPoint(c.x, c.y) === e || e.contains(document.elementFromPoint(c.x, c.y)) }; })()`);
    if (!at) throw new Error(`${id} has no box to press`);
    await clickAt(at.x, at.y);
    return at;
  };

  await step("CD36", async () => {
    await go(`${DRESS}&table=${ONE}`);
    await openDrawer();
    const road = await pressById("table-road");
    for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate<boolean>(`!!window.__vellumPortfolio`)) break; }
    // Wait out the folio's own drafting before pressing home. The press is not racing it, but the worker drawing a
    // region sheet is real work on this machine, and on 2026-09-19 the arrival at the other end of this press took
    // longer than its 30s poll exactly once, with nothing else in the suite slow (flake-record.md carries the row).
    // Pressing from a finished page removes the contention rather than widening a budget against it.
    for (let i = 0; i < DRAWN; i++) { await sleep(50); const s = await evaluate<number>(`(() => { const p = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return p ? p.drawn : -1; })()`); if (s >= 1) break; }
    // The HREF is the measurement, taken before the press: once the table has a second home, pressing a bare
    // ../../explorer/ ALSO lands on a populated drawer, so a check that only counted cuttings afterwards would pass
    // for the wrong reason forever. What the address carries is the only thing that reaches a reader on another device.
    const home = await evaluate<{ href: string | null; hash: string } | null>(`(() => { const a = document.getElementById("pf-explorer"); return a ? { href: a.getAttribute("href"), hash: location.hash } : null; })()`);
    const back = await pressById("pf-explorer");
    const arrived = await reachedExplorer();
    const landed = arrived.reached ? await evaluate(READ) : { cuttings: -1, rawHash: "", hashTable: null };
    check(
      "CD36 the Portfolio's gold press back carries the gathering AND the world it was gathered from: the road in hands over the Explorer's whole address, so the press home names the seed and the sheets rather than dropping the reader on the seed of the day with a bare table (#634 defect 1, ruled 2026-09-19)",
      road.hit && back.hit && arrived.reached &&
        !!home && home.hash.indexOf(`table=${ONE}`) !== -1 && home.hash.indexOf("seed=42") !== -1 &&
        typeof home.href === "string" && home.href.indexOf(`table=${ONE}`) !== -1 && home.href.indexOf("seed=42") !== -1 &&
        landed.cuttings === 1 && landed.rawHash.indexOf("seed=42") !== -1 && landed.hashTable === ONE,
      JSON.stringify({ road, back, home, arrived, landedHash: landed.rawHash, cuttings: landed.cuttings }),
    );
  });

  await step("CD37", async () => {
    await go(`${DRESS}&table=${ONE}`);
    // Planted so the check can say WHICH road it measured: a page served from the browser's cache comes back with this
    // marker alive and runs no boot code at all, which is the road no load-time rule can reach.
    await evaluate(`window.__cd634 = "warm"`);
    await evaluate(`location.href = "/prospect/" + location.hash + "&i=0"`);
    for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
    await evaluate(`(() => { const s = document.getElementById("note"); if (s && !s.classList.contains("open")) s.querySelector(".slip-handle").click(); })()`);
    await sleep(400);
    const lay = await pressById("pp-lay");
    const filed = await settle<{ table: string | null; stored: string | null }>(
      `(() => ({ table: new URLSearchParams(location.hash.slice(1)).get("table"), stored: ${STORE} }))()`,
      (d) => typeof d.table === "string" && d.table.split("_").length === 2,
      "prospect-filed-for-back",
    );
    await evaluate(`history.back()`);
    const home = await restedAtExplorer();
    check(
      "CD37 the browser's own BACK button brings the filed prospect home: the page comes back from the browser's cache with no boot code running at all, so the drawer is re-seated from the device and the address is written back to agree (#634 defect 2, ruled 2026-09-19)",
      lay.hit && filed.stored === filed.table && home.marker === "warm" &&
        home.cuttings === 2 && typeof home.hashTable === "string" && home.hashTable.split("_").length === 2,
      JSON.stringify({ lay, filedTable: filed.table, stored: filed.stored, marker: home.marker, cuttings: home.cuttings, hashTable: home.hashTable }),
    );
  });

  await step("CD38", async () => {
    await go(`${DRESS}&table=${ONE}`);
    // The same road with the cache REFUSED, which is the other half and needs a deliberately artificial instrument
    // (Gate 2 item 14): desktop Chrome will not cache a page carrying an unload listener. The check asserts its own
    // premise, that the document really was re-created, so a browser that caches it anyway reds here instead of
    // quietly measuring CD37 a second time.
    await evaluate(`(() => { window.__cd634 = "cold"; window.addEventListener("unload", () => {}); })()`);
    await evaluate(`location.href = "/prospect/" + location.hash + "&i=0"`);
    for (let i = 0; i < 300; i++) { await sleep(100); if (await evaluate<boolean>(`!!(window.__vellumProspectState && window.__vellumProspectState())`)) break; }
    await evaluate(`(() => { const s = document.getElementById("note"); if (s && !s.classList.contains("open")) s.querySelector(".slip-handle").click(); })()`);
    await sleep(400);
    await pressById("pp-lay");
    await settle<{ table: string | null }>(
      `(() => ({ table: new URLSearchParams(location.hash.slice(1)).get("table") }))()`,
      (d) => typeof d.table === "string" && d.table.split("_").length === 2,
      "prospect-filed-for-cold-back",
    );
    await evaluate(`history.back()`);
    await atExplorer();
    const home = await restedAtExplorer();
    check(
      "CD38 the same road with the browser's cache refused: the document is REBUILT and reads the stale address, so the table comes back from the device by the navigation type instead, and the sheet filed on the Prospect page survives either way (#634, both roads measured)",
      home.marker === null && home.navType === "back_forward" &&
        home.cuttings === 2 && typeof home.hashTable === "string" && home.hashTable.split("_").length === 2,
      JSON.stringify({ marker: home.marker, navType: home.navType, cuttings: home.cuttings, hashTable: home.hashTable }),
    );
  });

  await step("CD39", async () => {
    // Seeded on the site's own origin: about:blank has no storage to seed, so this write happens before the hop.
    await evaluate(`localStorage.setItem(${JSON.stringify(TABLE_STORE_KEY)}, ${JSON.stringify(TWO)})`);
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#${DRESS}&table=${ONE}` });
    await atExplorer();
    const arrived = await settle<Read & Stored>(
      `(() => ({ ...${READ}, stored: ${STORE} }))()`,
      (d) => d.cuttings > 0,
      "chart-drawer-link-beats-device",
      DRAWN,
    );
    check(
      "CD39 a link beats the device, and a visit does not become the reader's own: an address naming ONE sheet shows exactly that sheet over two held here, and what this browser was gathering is still untouched afterwards (#634 rulings 1 and 2, 2026-09-19)",
      arrived.cuttings === 1 && arrived.hashTable === ONE && arrived.stored === TWO,
      JSON.stringify({ cuttings: arrived.cuttings, hashTable: arrived.hashTable, stored: arrived.stored }),
    );
  });

  await step("CD40", async () => {
    await go(`${DRESS}&table=${ONE}`);
    await openDrawer();
    await evaluate(`document.querySelector("#cuttings .off").click()`);
    const emptied = await settle<Read & Stored>(
      `(() => ({ ...${READ}, stored: ${STORE} }))()`,
      (d) => d.cuttings === 0,
      "chart-drawer-emptied",
    );
    // The key is read directly because a bare table alone cannot tell an ABSENT key from an empty one, and the empty
    // one is exactly what would hand the table back on the next keyless arrival.
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/${emptied.rawHash}` });
    await atExplorer();
    const still = await evaluate<Read & Stored>(`(() => ({ ...${READ}, stored: ${STORE} }))()`);
    check(
      "CD40 emptying the table STICKS: taking the last sheet off removes the device's key rather than storing an empty one, so the address that carries no table and the device that holds none agree, and a reload comes back bare instead of resurrecting the sheet (#634)",
      emptied.cuttings === 0 && emptied.hashTable === null && emptied.stored === null &&
        still.cuttings === 0 && still.stored === null && still.rawHash.indexOf("table=") === -1,
      JSON.stringify({ emptied: { cuttings: emptied.cuttings, hashTable: emptied.hashTable, stored: emptied.stored }, still: { cuttings: still.cuttings, stored: still.stored, hash: still.rawHash } }),
    );
  });

  await step("CD41, CD42", async () => {
    // The road the first draft of this fix BROKE, and which nothing here could reach: every other Back check files a sheet on the Prospect page first, so the device is never empty at a restore. A reader whose storage is blocked, and anyone who opened a folio someone shared with them, comes back to exactly this: sheets in the address, none on the device. The first draft emptied the drawer and then wrote an address with no table key at all, losing them from both homes in one gesture (the cold review on PR #635).
    await go(`${DRESS}&table=${ONE}`);
    await evaluate(`window.__cd634 = "bare"`);
    const before = await evaluate<Read & Stored>(`(() => ({ ...${READ}, stored: ${STORE} }))()`);
    // Any same-origin page away and back makes the entry: the claim is about the RESTORE, and the Prospect page's own
    // plate render would buy nothing here and cost the lane its remaining budget. The FAQ is the cheapest door out.
    await evaluate(`location.href = "/faq/"`);
    for (let i = 0; i < 200; i++) { await sleep(50); if (await evaluate<boolean>(`location.pathname === "/faq/" && document.readyState === "complete"`)) break; }
    await evaluate(`history.back()`);
    const home = await restedAtExplorer();
    check(
      "CD41 a cached return with NOTHING on the device keeps the table the ADDRESS is carrying: the reader whose storage is blocked, and the reader who opened a folio someone shared, meet this road and the restore must leave them exactly where they were (#634, the cold review's finding on PR #635)",
      before.cuttings === 1 && before.stored === null && home.marker === "bare" &&
        home.cuttings === 1 && home.hashTable === ONE && home.stored === null,
      JSON.stringify({ before: { cuttings: before.cuttings, stored: before.stored }, home: { marker: home.marker, cuttings: home.cuttings, hashTable: home.hashTable, stored: home.stored } }),
    );

    // The cell where two of the rulings collide, RULED on 2026-09-19 and pinned so nobody restores the other reading on
    // finding it surprising: a traversal into a page carrying someone ELSE'S folio takes the device's table, and rewrites
    // that page's address with it. The fixture is a device holding sheets the address names none of, which is what tells
    // the ruling from the rejected alternative; CD41's own leg above cannot, since its device is empty. It reuses this
    // Explorer rather than booting another, because lane B has 3.95s of headroom and a second boot would spend it.
    // DISJOINT from ONE, which the address is still carrying: TWO would not do, since it contains ONE and is therefore
    // the stale-snapshot shape that the rejected alternative answers the same way.
    const OTHERS = ["k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-1.lx-4.ly-4", "k-p.seed-42.style-antique.i-3.year-1059"].join("_");
    await evaluate(`localStorage.setItem(${JSON.stringify(TABLE_STORE_KEY)}, ${JSON.stringify(OTHERS)})`);
    await evaluate(`location.href = "/faq/"`);
    for (let i = 0; i < 200; i++) { await sleep(50); if (await evaluate<boolean>(`location.pathname === "/faq/" && document.readyState === "complete"`)) break; }
    await evaluate(`history.back()`);
    const theirs = await restedAtExplorer();
    check(
      "CD42 a traversal into a page carrying someone ELSE'S folio takes what this device holds, and rewrites that page's address with it: ruling 1 read literally, which narrows ruling 2's 'exactly as sent' to an arrival by link (ruled 2026-09-19, with the cost that the sender's link leaves that tab)",
      theirs.marker === "bare" && theirs.cuttings === 2 && theirs.stored === OTHERS && theirs.hashTable === OTHERS &&
        OTHERS.split("_").every((sheet) => ONE.indexOf(sheet) === -1),
      JSON.stringify({ marker: theirs.marker, cuttings: theirs.cuttings, hashTable: theirs.hashTable, stored: theirs.stored }),
    );
  });

  // OUTSIDE every step, which is the whole point: `makeStep` swallows a throw from anywhere in a step's body, so a
  // clear that sits after a check inside one is skipped exactly when a check gave up early and leaks the key into
  // document-rooms and region-detail. suite-hunt.ts brackets its own key at start and end for the same reason.
  await forget();
}
