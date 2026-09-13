// The Chart Table's drawer (#520 Sub 2 of #401, direction D ruled at the #518 sitting): the dog-ear on the committed survey, the drawer it fills, the cap, and the address that is the table's only memory. `chart-drawer` and never `drawer`: suite-room-drawer is the site's phone nav (#520 ruling 2).
import { makeSettle } from "./settle-support.mjs";
import { makeStep } from "./step-support.mjs";
import { makeStage } from "./home-support.mjs";
import { slideRested, foldRested } from "../../src/cli/e2e-slide.ts";

const SEED = 42;
// A camera settled deep enough to commit a band-3 inset, the same descent suite-region-detail drives.
const DEEP = "cx=0.5625&cy=0.4375&k=8";
const DRESS = `seed=${SEED}&style=antique&legend=1&arms=0&beasts=0`;

const READ = `(() => {
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
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  };
})()`;

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, touch, PORT } = ctx;
  const settle = makeSettle(ctx);
  // A group that only navigates needs no step: go()'s bounded loop returns rather than throwing.
  const step = makeStep(ctx);
  // A REAL press and release at the handle's own coordinates, never element.click(): a synthetic click dispatches straight at the node and ignores pointer-events, so it files a handle no reader could reach. The inset box is pointer-events: none, and that is exactly the defect this drives.
  const { clickAt } = makeStage(ctx);
  // A settle that waits on a REGION JOB is not waiting on a transition: the worker draws a whole survey, which is real work that scales with the runner. The default 120 tries is 6s, sized on a laptop, and CI ran this lane 2.7x slower than local on the run that timed out. 400 tries is 20s, the same order as TOUR_TIMEOUT_MS, which is itself sized at roughly 10x the slowest matrix measured on CI.
  const DRAWN = 400;
  const clickEar = async () => {
    const r = await evaluate(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (r) await clickAt(r.x, r.y);
    return r;
  };
  const go = async (hash) => {
    await send("Page.navigate", { url: "about:blank" });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/explorer/#${hash}` });
    for (let i = 0; i < 200; i++) { await sleep(150); if (await evaluate(`!!document.querySelector("#map svg") && !!document.getElementById("chart-drawer")`)) break; }
    await sleep(400);
  };
  const atInset = (d) => !!d.ear && d.insetSvgs === 1;
  // No buttons at all reports pos at the viewport edge, not 0: 0 is inside the fold and would leave `size` alone rejecting a shut drawer.
  const asSlide = (d) => (d ? { pos: d.lowestOff === null ? d.innerH : d.lowestOff, size: d.minOffH, anims: d.drawerAnims, viewportH: d.innerH } : null);
  const drawerUp = (d, last) => slideRested(asSlide(d), asSlide(last));
  const asFold = (d) => (d ? { pos: d.slipX, size: d.slipW, anims: d.slipAnims } : null);
  const slipTravelled = (from) => (d, last) => foldRested(asFold(d), asFold(last), asFold(from));
  const both = (a, b) => (d, last) => a(d, last) && b(d, last);

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
  let laid = null;
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
      !!earAt && (await evaluate(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return "no-ear"; const b = e.getBoundingClientRect(); const hit = document.elementFromPoint(Math.round(b.x + b.width * 0.72), Math.round(b.y + b.height * 0.28)); return hit === e ? "ear" : (hit ? hit.tagName + "." + String(hit.className.baseVal ?? hit.className).split(" ")[0] : "none"); })()`)) === "ear",
      JSON.stringify({ clickedAt: earAt }),
    );

    const beforeDbl = await evaluate(`(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`);
    const dblAt = await evaluate(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (dblAt) {
      for (const clickCount of [1, 2]) {
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x: dblAt.x, y: dblAt.y, button: "left", clickCount });
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: dblAt.x, y: dblAt.y, button: "left", clickCount });
      }
    }
    await sleep(900);
    const afterDbl = await evaluate(`(() => ({ k: window.__vellumZoomState().k, band: window.__vellumRegion ? window.__vellumRegion().band : null }))()`);
    check(
      "CD2c a rapid double click on the handle does not become d3's double-click-to-zoom, the same rule Z10b pins for the zoom cluster (#520 build item 2)",
      !!dblAt && afterDbl.k === beforeDbl.k && afterDbl.band === beforeDbl.band,
      JSON.stringify({ before: beforeDbl, after: afterDbl }),
    );
  });

  // Derived 2026-09-13: SAY_HOLD_MS + SAY_FADE_MS is 8.45s (src/site/shared/announce.ts), which is 169 polls of pure sleep before a single evaluate round-trip is counted; 400 tries is 20s of sleep alone, the same order of headroom DRAWN carries for the CI runner measured 2.7x slower than local.
  const SAID_GONE = 400;
  await step("CD23", async () => {
    const said = await evaluate(READ);
    const gone = await settle(READ, (d) => d.status === "", "chart-drawer-said-gone", SAID_GONE);
    check(
      "CD23 the Chart Table's announcement leaves the chart by itself: it sat over the middle of the sheet until the reader drew another world, and shutting the drawer never took it away (#547, Alex 2026-09-08). The table is untouched as it goes, so this is the LINE leaving and not the page resetting, and the fade's own length is pinned here the way CD7c pins the drawer's slide, or a fade that regressed to five seconds would sit inside this settle's budget and pass",
      /on the table/.test(said.status) && gone.status === "" &&
        gone.cuttings === said.cuttings && gone.open === said.open &&
        said.statusFadeMs === "0.45s",
      JSON.stringify({ said: said.status, after: gone.status, cuttings: [said.cuttings, gone.cuttings], open: [said.open, gone.open], fadeMs: said.statusFadeMs }),
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
  const SURFACES = `(() => {
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
  await step("CD9, CD11, CD12, CD22", async () => {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await go(`${DRESS}&table=${SIX}`);
    const beforeOpen = await evaluate(SURFACES);
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
  const EDGE = `(() => {
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
  const edge = {};
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
    const roadOn = await evaluate(`(() => { const b = document.getElementById("table-road"); return { disabled: b.disabled, stamp: (document.getElementById("table-road-stamp") || {}).textContent || null }; })()`);
    check(
      "CD18 with sheets on the table the road to the Portfolio turns on: #520 shipped it disabled with the stamp saying the portfolio is not yet bound, and this sub is what binds it (#521)",
      roadOn.disabled === false,
      JSON.stringify(roadOn),
    );
  });
  const roadBefore = await evaluate(`document.getElementById("table-road").disabled`);
  const roadAt = await evaluate(`(() => { const b = document.getElementById("table-road"); const r = b.getBoundingClientRect();
    const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2);
    const h = document.elementFromPoint(x, y);
    return { x, y, reachable: h === b || b.contains(h) }; })()`);
  if (roadAt) await clickAt(roadAt.x, roadAt.y);
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate(`location.pathname.indexOf("/portfolio/") !== -1`)) break; }
  const arrived = await evaluate(`({ path: location.pathname, table: new URLSearchParams(location.hash.slice(1)).get("table") })`);
  check(
    "CD18b the road answers a REAL press and carries the WHOLE gathering in the Portfolio's own address, which is the epic's core insight: the folio is a link, so the page it lands on can draft the same six sheets for anyone",
    arrived.path.indexOf("/print-room/portfolio/") !== -1 && typeof arrived.table === "string" && arrived.table.split("_").length === 6 &&
      !!roadAt && roadAt.reachable,
    JSON.stringify({ ...arrived, roadBefore, roadAt }),
  );
  const PF = `(() => { const s = window.__vellumPortfolio ? window.__vellumPortfolio() : null; return s ? { ...s,
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
  const pfNext = await evaluate(`(() => { const b = document.getElementById("pf-next"); if (!b) return null; b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); if (r.width < 1) return null; const x = Math.round(r.x + r.width / 2), y = Math.round(r.y + r.height / 2); const h = document.elementFromPoint(x, y); return { x, y, reachable: h === b || b.contains(h) }; })()`);
  if (pfNext) await clickAt(pfNext.x, pfNext.y);
  await sleep(300);
  const pfSaid = await evaluate(`(() => { const s = document.getElementById("pf-status"); return s ? { line: s.textContent || "", fadeMs: getComputedStyle(s).transitionDuration } : null; })()`);
  check(
    "CD24 the Portfolio announces the sheet it brought up on a pill that wears the SAME fade the Explorer's does: its line is written by the shared announcer and the kit's one rule is keyed to the class, so a rule written against #status alone would leave this page's announcement standing over the chart forever (#547 ruling 4)",
    !!pfNext && pfNext.reachable && !!pfSaid && /is on top/.test(pfSaid.line) && pfSaid.fadeMs === "0.45s",
    JSON.stringify({ press: pfNext, said: pfSaid }),
  );
  await send("Page.navigate", { url: "about:blank" });
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/print-room/portfolio/` });
  for (let i = 0; i < 200; i++) { await sleep(100); if (await evaluate(`!!window.__vellumPortfolio`)) break; }
  await sleep(400);
  const empty = await evaluate(`(() => ({ bound: (document.getElementById("pf-bound") || {}).textContent || null,
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
  const glass = await evaluate(`(() => {
    const v = document.getElementById("map-viewport");
    const before = document.getElementById("map").style.transform;
    document.querySelector('[data-zoom="in"]').click();
    return { zoomable: v.classList.contains("zoomable"), touch: getComputedStyle(v).touchAction, before };
  })()`);
  await sleep(700);
  const glassAfter = await evaluate(`document.getElementById("map").style.transform`);
  check(
    "CD21 the Portfolio's Glass is bound AND reachable by a thumb: a zoom press moves the camera, and the viewport takes touch-action none, without which d3 never sees the gesture and three corner presses are decoration (#164, #521)",
    glass.zoomable && glass.touch === "none" && glassAfter !== glass.before && glassAfter !== "",
    JSON.stringify({ ...glass, after: glassAfter }),
  );
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // CD6 (#540 Sub 2a): the desktop drawer must never paint at 390, and the check has to try the door that opens it: `lay()` calls setOpen(true) with no width term, and `.chart-drawer.open` (0,2,0) beat the stand-down's (0,1,0), so once .open landed the drawer displayed at 390 over a reader who could not shut it.
  await setMobileViewport(390, 844);
  await step("CD6", async () => {
    await go(`${DRESS}&${DEEP}`);
    const phoneArmed = await settle(READ, atInset, "chart-drawer-phone-inset", DRAWN);
    const phoneEar = await evaluate(`(() => { const e = document.querySelector("#map .region-inset .dog-ear"); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x + b.width * 0.72), y: Math.round(b.y + b.height * 0.28) }; })()`);
    if (phoneEar) { await touch("touchStart", [{ x: phoneEar.x, y: phoneEar.y, id: 0 }]); await touch("touchEnd", []); }
    await sleep(1600);
    const phone = await evaluate(READ);
    const phoneDrawer = await evaluate(`getComputedStyle(document.getElementById("chart-drawer")).display`);
    const phoneShut = await evaluate(`(() => { const b = document.getElementById("chart-drawer-shut"); const r = b.getBoundingClientRect(); if (r.width < 1) return "no-box"; const h = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)); return h === b || b.contains(h) ? "reachable" : "eclipsed"; })()`);
    check(
      "CD6 at 390 the desktop drawer never paints, not even after a real tap on the dog-ear: the handle is the phone's own door into the table and it opens the drawer with no width term, so the stand-down has to cover the OPEN state and not just the resting one (#540)",
      !!phoneEar && !phoneArmed.open && phoneDrawer === "none" && phone.scrollW === phone.innerW && !phone.tabShown,
      JSON.stringify({ tapped: phoneEar, drawerDisplay: phoneDrawer, open: phone.open, shutPress: phoneShut, scrollW: phone.scrollW, innerW: phone.innerW }),
    );
  });

  const LEAF = `(() => {
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
  const tableTab = await evaluate(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /table/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
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
  const broadsideTab = await evaluate(`(() => { const b = [...document.querySelectorAll(".slip-head .sheet-tabs button")].find((x) => /broadside/i.test(x.textContent || "")); if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
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
}
