// The Chart Table's drawer (#520 Sub 2 of #401, direction D ruled at the #518 sitting): the dog-ear on the committed survey, the drawer it fills, the cap, and the address that is the table's only memory. `chart-drawer` and never `drawer`: suite-room-drawer is the site's phone nav (#520 ruling 2).
import { makeSettle } from "./settle-support.mjs";
import { makeStage } from "./home-support.mjs";

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
    fullShown: (() => { const f = document.getElementById("chart-drawer-full"); return !!f && !f.hidden; })(),
    roadDisabled: (() => { const b = document.getElementById("table-road"); return !!b && b.disabled; })(),
    ear: ear ? { label: ear.getAttribute("aria-label"), rect: r("#map .region-inset .dog-ear") } : null,
    insetRect: r("#map .region-inset"),
    // The constraint the handle's markup is decided by: suite-region-detail reads the survey as the LAST svg in the inset.
    insetSvgs: document.querySelectorAll("#map .region-inset svg").length,
    lastSvgIsSurvey: (() => { const s = [...document.querySelectorAll("#map .region-inset svg")].pop(); return !!s && s.hasAttribute("data-vellum-region-u0"); })(),
    status: (document.getElementById("status") || {}).textContent || "",
    hashTable: (new URLSearchParams(location.hash.slice(1))).get("table"),
    rawHash: location.hash,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  };
})()`;

export async function run(ctx) {
  const { evaluate, send, check, shoot, sleep, setMobileViewport, clearMobile, PORT } = ctx;
  const settle = makeSettle(ctx);
  // A REAL press and release at the handle's own coordinates, never element.click(): a synthetic click dispatches straight at the node and ignores pointer-events, so it files a handle no reader could reach. The inset box is pointer-events: none, and that is exactly the defect this drives.
  const { clickAt } = makeStage(ctx);
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

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // CD1: the handle rides the committed survey, inside its box, and leaves the inset's own svg the last one.
  await go(`${DRESS}&${DEEP}`);
  const armed = await settle(READ, atInset, "chart-drawer-inset");
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

  // CD2: a click lays it, opens the drawer and leaves it open (ruled 2026-09-07), and the address carries it.
  const earAt = await clickEar();
  const laid = await settle(READ, (d) => d.open && d.cuttings === 1, "chart-drawer-laid");
  check(
    "CD2 a click on the dog-ear lays the survey and ENDS with the drawer open (ruled 2026-09-07): one cutting with its own remove press, the count in period voice, the road present but disabled until Sub 3, and the table written into the address",
    laid.open && laid.cuttings === 1 && laid.offs === 1 && laid.imgs === 1 &&
      laid.count === "one sheet laid · room for five more" && laid.roadDisabled && !laid.fullShown &&
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

  // #520 build item 2 names this one: Z10b pins it for the zoom cluster ONLY, so the handle owes the same check.
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

  // CD3: the same survey twice is refused in its own voice, and the table is unmoved (ruled 2026-09-07).
  await evaluate(`document.getElementById("chart-drawer-shut").click()`);
  await clickEar();
  const twice = await settle(READ, (d) => d.open, "chart-drawer-twice");
  check(
    "CD3 the same survey is refused a second time, in the drawer's own voice, and the table is unmoved (ruled 2026-09-07)",
    twice.cuttings === 1 && twice.status === "this survey is already on the table" && twice.open,
    JSON.stringify({ cuttings: twice.cuttings, status: twice.status }),
  );

  // CD4: the address is the only memory, and a recovered sheet fills when the drawer is OPENED, not on load.
  const carried = laid.hashTable;
  await go(`${DRESS}&table=${carried}`);
  const cold = await evaluate(READ);
  await evaluate(`document.getElementById("chart-drawer-tab").click()`);
  const filled = await settle(READ, (d) => d.imgs >= 1 && d.decoded.every(Boolean), "chart-drawer-filled");
  check(
    "CD4 a reload restores the table from the address alone, showing a reserved frame named from the chart number, and the picture is drawn when the drawer is OPENED rather than on load (ruled 2026-09-07)",
    cold.cuttings === 1 && cold.imgs === 0 && cold.frames === 1 && cold.titles[0] === "Chart № 42" && !cold.open &&
      filled.imgs === 1 && filled.frames === 0 && filled.decoded[0] === true && filled.titles[0] !== "Chart № 42",
    JSON.stringify({ cold: { cuttings: cold.cuttings, imgs: cold.imgs, frames: cold.frames, titles: cold.titles }, filled: { imgs: filled.imgs, titles: filled.titles, decoded: filled.decoded } }),
  );

  // CD5: a cutting comes off, and an empty table writes NO key (#520 ruling 1).
  await evaluate(`document.querySelector("#cuttings .off").click()`);
  const bare = await settle(READ, (d) => d.cuttings === 0, "chart-drawer-bare");
  check(
    "CD5 a cutting comes off by its own press and the room is ANNOUNCED, since the press that did it leaves the page with it, and an EMPTY table writes no key at all rather than growing table= onto every link forever (#520 ruling 1)",
    bare.cuttings === 0 && bare.count === "the table is bare" && bare.hashTable === null && bare.rawHash.indexOf("table=") === -1 &&
      /is off the table/.test(bare.status),
    JSON.stringify({ cuttings: bare.cuttings, count: bare.count, hashTable: bare.hashTable, status: bare.status }),
  );

  // #520 Process names both of these: "the cap refuses" and "home and the verso flip drop the handle".
  const SIX = ["rung-1.lx-4.ly-4", "rung-1.lx-3.ly-3", "rung-2.lx-5.ly-5", "rung-2.lx-6.ly-6", "rung-3.lx-11.ly-11", "rung-3.lx-12.ly-12"]
    .map((seat) => `k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.${seat}`).join("_");
  await go(`${DRESS}&${DEEP}&table=${SIX}`);
  const atSix = await settle(READ, atInset, "chart-drawer-six");
  await clickEar();
  await sleep(700);
  const refused = await evaluate(READ);
  check(
    "CD7 at the cap the handle refuses in the voice #518 ruling 3 wrote, lays nothing, and says so where the reader is told everything else (#520 build item 5)",
    atSix.cuttings === 6 && !!atSix.ear && atSix.ear.label === "the table is full: six sheets lie on it" &&
      refused.cuttings === 6 && refused.status === "the table is full: six sheets lie on it" && refused.fullShown,
    JSON.stringify({ before: atSix.cuttings, label: atSix.ear && atSix.ear.label, after: refused.cuttings, status: refused.status, full: refused.fullShown }),
  );

  // Home drops the inset, and the handle must go with it rather than outliving the sheet it belongs to.
  await evaluate(`window.__vellumZoomTo({ x: 0, y: 0, k: 1 })`);
  const home = await settle(READ, (d) => !d.ear, "chart-drawer-home");
  check(
    "CD8 going home drops the inset and the dog-ear with it: the handle never outlives the survey it belongs to, and the table it filled is untouched (#520 build item 2)",
    home.ear === null && home.insetSvgs === 0 && home.cuttings === 6,
    JSON.stringify({ ear: home.ear, insetSvgs: home.insetSvgs, cuttings: home.cuttings }),
  );

  // CD6: the phone stands the drawer down until Sub 2a (#540).
  await setMobileViewport(390, 844);
  await go(`${DRESS}&table=${carried}`);
  const phone = await evaluate(READ);
  check(
    "CD6 at 390 the drawer and its tab stand DOWN until Sub 2a (#540) builds the sheet's second leaf: nothing of the desktop drawer paints over the chart, and nothing scrolls sideways",
    !phone.tabShown && phone.scrollW === phone.innerW &&
      (await evaluate(`getComputedStyle(document.getElementById("chart-drawer")).display`)) === "none",
    JSON.stringify({ tabShown: phone.tabShown, scrollW: phone.scrollW, innerW: phone.innerW }),
  );
  await clearMobile();
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
}
